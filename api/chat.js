export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `You are an AWS documentation assistant embedded in an AWS Certified Solutions Architect study app. Answer questions by searching and reading AWS's official documentation (docs.aws.amazon.com) using your web_search and web_fetch tools — don't rely on memory alone for specifics like limits, pricing, or recent features.

Keep answers focused and practical: short paragraphs or bullet points, no filler. End with the specific documentation URL(s) you drew from. If a question isn't about AWS, say so briefly and steer back to AWS topics.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server is missing ANTHROPIC_API_KEY" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages array required", { status: 400 });
  }

  // Bound cost/context: only forward role+content, only the last 20 turns
  const trimmed = messages.slice(-20).map((m) => ({ role: m.role, content: m.content }));

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1536,
      system: SYSTEM_PROMPT,
      messages: trimmed,
      stream: true,
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
          allowed_domains: ["docs.aws.amazon.com"],
          max_uses: 3,
        },
        {
          type: "web_fetch_20260209",
          name: "web_fetch",
          allowed_domains: ["docs.aws.amazon.com"],
          max_uses: 3,
        },
      ],
    }),
  });

  if (!anthropicRes.ok || !anthropicRes.body) {
    const errText = await anthropicRes.text();
    return new Response(JSON.stringify({ error: errText }), {
      status: anthropicRes.status,
      headers: { "content-type": "application/json" },
    });
  }

  // Relay Anthropic's SSE stream as newline-delimited JSON events so the client
  // can tell "generating text" apart from "a server-side tool is running" —
  // web_search/web_fetch calls can take many seconds with no text in between.
  const reader = anthropicRes.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      const emit = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const evt = JSON.parse(data);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              emit({ t: "text", v: evt.delta.text });
            } else if (
              evt.type === "content_block_start" &&
              evt.content_block?.type === "server_tool_use"
            ) {
              emit({ t: "tool", v: evt.content_block.name || "web_search" });
            } else if (
              evt.type === "content_block_start" &&
              (evt.content_block?.type === "web_search_tool_result" ||
                evt.content_block?.type === "web_fetch_tool_result")
            ) {
              emit({ t: "tool_done" });
            }
          } catch {
            // ignore malformed/partial SSE lines
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8" },
  });
}
