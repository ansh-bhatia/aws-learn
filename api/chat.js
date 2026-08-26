export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `You are an AWS documentation assistant embedded in an AWS Certified Solutions Architect study app. Answer questions by searching AWS's official documentation using your web search tool — don't rely on memory alone for specifics like limits, pricing, or recent features.

Only cite and draw from pages under docs.aws.amazon.com — when you search, include "site:docs.aws.amazon.com" in the query (or otherwise scope it to that domain), and ignore any search results from other sites (blogs, forums, third-party tutorials, etc.).

Research efficiently: one focused search is usually enough to find the right page. Even for broad requests like "everything about X" or "explain X in depth," pick the best page(s) and write a thorough, well-organized answer from them rather than chasing exhaustive coverage.

Keep answers focused and practical: short paragraphs or bullet points, no filler. End with the specific documentation URL(s) you drew from. If a question isn't about AWS, say so briefly and steer back to AWS topics.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server is missing OPENAI_API_KEY" }), {
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

  const openaiRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      instructions: SYSTEM_PROMPT,
      input: trimmed,
      max_output_tokens: 4096,
      stream: true,
      tools: [
        {
          type: "web_search_preview",
          search_context_size: "medium",
        },
      ],
    }),
  });

  if (!openaiRes.ok || !openaiRes.body) {
    const errText = await openaiRes.text();
    return new Response(JSON.stringify({ error: errText }), {
      status: openaiRes.status,
      headers: { "content-type": "application/json" },
    });
  }

  // Relay OpenAI's SSE stream as newline-delimited JSON events so the client
  // can tell "generating text" apart from "the web search tool is running" —
  // a search call can take several seconds with no text in between.
  const reader = openaiRes.body.getReader();
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
            if (evt.type === "response.output_text.delta") {
              emit({ t: "text", v: evt.delta });
            } else if (evt.type === "response.web_search_call.in_progress") {
              emit({ t: "tool", v: "web_search" });
            } else if (
              evt.type === "response.web_search_call.completed" ||
              evt.type === "response.web_search_call.searching"
            ) {
              emit({ t: "tool_done" });
            } else if (evt.type === "error" || evt.type === "response.failed") {
              emit({ t: "text", v: `\n\n*(Error: ${evt.message || evt.error?.message || "request failed"})*` });
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
