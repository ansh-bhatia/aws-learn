export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `You are an AWS documentation assistant embedded in an AWS Certified Solutions Architect study app. Answer questions by searching AWS's official documentation using your web search tool — don't rely on memory alone for specifics like limits, pricing, or recent features.

Only cite and draw from pages under docs.aws.amazon.com — when you search, include "site:docs.aws.amazon.com" in the query (or otherwise scope it to that domain), and ignore any search results from other sites (blogs, forums, third-party tutorials, etc.).

Research efficiently: one focused search is usually enough to find the right page. Even for broad requests like "everything about X" or "explain X in depth," pick the best page(s) and write a thorough, well-organized answer from them rather than chasing exhaustive coverage.

## Formatting rules

Structure every answer like a polished technical document, not a raw dump:

- Use ## and ### Markdown headers to break up any answer with more than one distinct part. A short answer to a narrow question doesn't need headers.
- Put every multi-line AWS CLI command, IAM policy, CloudFormation/CDK/Terraform snippet, or config file in a fenced code block with the correct language tag (\`\`\`bash, \`\`\`json, \`\`\`yaml, \`\`\`hcl, \`\`\`python, etc.). Never inline a multi-line snippet as plain text or single-backtick code.
- When comparing 3 or more things that each have 2 or more attributes (e.g. S3 storage classes, EC2 instance families, load balancer types), use a Markdown table instead of a prose list.
- Bold a key term or service name the first time it's introduced — not on every repeat mention.
- Keep paragraphs to 2-4 sentences. For steps or enumerations, use a bullet or numbered list instead of run-on prose.
- Do NOT write a "Sources:" list or bibliography at the end. The app renders the source pages you used as a separate visual strip below your answer, so a written list is duplicate clutter. Just write the answer and stop.
- Never paste citation URLs into prose, table cells, or bullet points. A table with the same link repeated in every row is a formatting failure, not thoroughness.
- Never emit raw HTML tags (no <ul>, <li>, <br>, <div>, etc.) anywhere, including inside table cells — if a table cell needs multiple items, separate them with commas or semicolons in plain text instead.
- Synthesize what you find into your own clean prose. Never paste raw scraped fragments from a doc page verbatim — no stray navigation text, no "Was this page helpful?", no broken table remnants, no leftover HTML artifacts. If the source page is messy, extract the substance and write it yourself.

## Formatting examples

These illustrate the expected shape — not literal content to reuse.

**Narrow conceptual question** ("What is S3 Versioning?") → 1-2 short paragraphs, no headers needed, one bolded term on first mention. No sources list.

**Comparison question** ("What's the difference between SQS standard and FIFO queues?") → one framing sentence, then a Markdown table (columns for the relevant attributes: ordering, throughput, dedup, use case), then a short closing paragraph on when to pick which. No sources list.

**How-to / hands-on question** ("How do I enable versioning on an S3 bucket via the CLI?") → a "## Steps" (or similar) header, a numbered list of steps, the actual command in a fenced \`\`\`bash block (never inline), a one-line note on anything non-obvious (e.g. propagation delay). No sources list.

If a question isn't about AWS, say so briefly and steer back to AWS topics.`;

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

  // The web_search tool appends its own tracking param to every cited URL.
  // Strip it so dedup works and the displayed link is the real doc page.
  const cleanUrl = (raw) => {
    try {
      const u = new URL(raw);
      u.searchParams.delete("utm_source");
      return u.toString();
    } catch {
      return raw;
    }
  };

  // The tool also injects markdown citation links — "([docs.aws.amazon.com](url))"
  // — directly into the prose, including inside table cells, which looks like
  // link spam. We render sources as their own strip instead, so strip these
  // from the text. Because a citation can span several deltas, hold back any
  // trailing fragment that might still grow into one.
  const CITATION_RE = /\s*\(\[[^\]]*\]\([^)]*\)\)/g;
  const splitSafe = (buf) => {
    const i = buf.lastIndexOf("(");
    if (i === -1) return [buf, ""];
    const rest = buf.slice(i);
    // Only hold if this could still become a citation: "(" alone, or "(["
    // that hasn't closed yet. Ordinary prose parens are emitted immediately.
    const couldBeCitation =
      rest === "(" || (rest[1] === "[" && !rest.includes("))"));
    if (couldBeCitation && rest.length < 500) return [buf.slice(0, i), rest];
    return [buf, ""];
  };

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      let textHold = "";
      const seenUrls = new Set();
      const emit = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      const emitText = (chunk, flush = false) => {
        textHold += chunk;
        textHold = textHold.replace(CITATION_RE, "");
        let out;
        if (flush) {
          out = textHold;
          textHold = "";
        } else {
          [out, textHold] = splitSafe(textHold);
        }
        if (out) emit({ t: "text", v: out });
      };

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
              emitText(evt.delta);
            } else if (evt.type === "response.output_text.annotation.added") {
              const ann = evt.annotation;
              if (ann?.type === "url_citation" && ann.url) {
                const url = cleanUrl(ann.url);
                if (!seenUrls.has(url)) {
                  seenUrls.add(url);
                  let domain = "";
                  try {
                    domain = new URL(url).hostname;
                  } catch {
                    /* leave blank if unparseable */
                  }
                  emit({
                    t: "source",
                    v: {
                      url,
                      domain,
                      title: ann.title || domain || url,
                      // Domain scoping is prompt-only, so a non-AWS-docs page
                      // can slip through. Flag it rather than hide it.
                      external: !domain.endsWith("docs.aws.amazon.com"),
                    },
                  });
                }
              }
            } else if (evt.type === "response.web_search_call.in_progress") {
              emit({ t: "tool", v: "web_search" });
            } else if (
              evt.type === "response.web_search_call.completed" ||
              evt.type === "response.web_search_call.searching"
            ) {
              emit({ t: "tool_done" });
            } else if (evt.type === "error" || evt.type === "response.failed") {
              emitText(
                `\n\n*(Error: ${evt.message || evt.error?.message || "request failed"})*`,
                true
              );
            }
          } catch {
            // ignore malformed/partial SSE lines
          }
        }
      }
      emitText("", true); // flush any held-back tail
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8" },
  });
}
