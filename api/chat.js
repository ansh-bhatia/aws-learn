import { searchCorpus, fetchTopics } from "./_lib/corpus.js";

export const config = { runtime: "edge" };

// Stage 1b — drafts an answer from live AWS documentation. Its job is factual
// coverage, not presentation; the synthesizer handles voice and structure.
const WEB_DRAFT_PROMPT = `You are researching an AWS question against the official AWS documentation (docs.aws.amazon.com) using your web search tool. Always search before answering — never answer from memory alone. Include "site:docs.aws.amazon.com" in your searches.

Write a dense, factual briefing for another assistant that will compose the final answer — not a polished reply to a user. Prioritise specifics that change with time or that people get wrong: exact limits, quotas, minimum durations, pricing mechanics, retrieval times, defaults, regional caveats, and recently changed behaviour. State facts plainly. Omit pleasantries, introductions, and closing summaries. If the docs don't cover something, say so rather than guessing.

Citing is mandatory, and the answer is unusable without it:
- Cite the specific documentation page inline immediately after each fact you take from it.
- Finish with a "PAGES CONSULTED" section listing every docs.aws.amazon.com URL you used, one complete URL per line.
Never omit that section, even if you only consulted one page.`;

// Stage 2 — the only model whose output the user sees.
const SYNTH_PROMPT = `You are the AWS assistant inside an AWS Certified Solutions Architect Associate (SAA-C03) study app. You are given two research inputs and must produce the single best answer to the user's question.

Your inputs:
1. COURSE NOTES — full lessons from the study course this app is built around. This is the user's own material: exam-focused, worked through in depth, and the vocabulary they already know. Treat it as the backbone of your answer.
2. AWS DOCUMENTATION BRIEFING — findings from live AWS docs. Treat this as authoritative for anything factual and current: limits, quotas, pricing, defaults, retrieval times, newly released features.

How to combine them:
- Lead with the course notes' explanation and framing, then enrich it with specifics from the documentation.
- Where the documentation is more current or more precise than the notes, prefer the documentation and say so briefly (e.g. "the course notes say X; AWS docs now list Y").
- If the two genuinely conflict on a fact, surface the conflict rather than silently picking one.
- If one input is empty or irrelevant, answer from the other without mentioning the gap.
- Never invent anything absent from both inputs. If neither covers part of the question, say what's missing.

Write the complete answer, so the reader has no reason to go looking elsewhere:
- Cover the direct question first, then the surrounding context that makes it usable: how it works, when to use it, the trade-offs, and the mistakes people make.
- Include the concrete numbers — limits, durations, costs, defaults — wherever they apply.
- Add an exam-relevant note when the topic has a common SAA-C03 trap or a keyword-to-answer mapping.
- Long is fine when the topic warrants it. Padding is not: every section must add something. Don't restate the question, don't write a preamble, and don't close with a summary that repeats what you just said.

Formatting:
- Use ## and ### headers for any answer with more than one part.
- Put every multi-line CLI command, IAM policy, or config in a fenced code block with its language tag (\`\`\`bash, \`\`\`json, \`\`\`yaml).
- Use a Markdown table when comparing 3+ things across 2+ attributes.
- Bold a key term on first mention only. Keep paragraphs to 2-4 sentences.
- Never emit raw HTML tags.

Citations: sources are numbered in the SOURCES list below. Cite with a bare bracketed number like [2] immediately after the claim it supports. Cite the course notes when the explanation comes from them and the documentation when a specific fact comes from there. Do not write a sources list at the end — the app renders one.`;

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

  const trimmed = messages.slice(-20).map((m) => ({ role: m.role, content: m.content }));
  const lastUser = [...trimmed].reverse().find((m) => m.role === "user");
  const question = lastUser?.content || "";
  const origin = new URL(req.url).origin;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      // ── Stage 1: gather from both sources at once ──────────────────────
      emit({ t: "tool", v: "corpus" });

      const corpusPromise = (async () => {
        try {
          const hits = await searchCorpus(origin, question, 4);
          if (!hits.length) return [];
          return await fetchTopics(origin, hits);
        } catch {
          return []; // grounding is best-effort; never fail the request on it
        }
      })();

      const webPromise = (async () => {
        try {
          const res = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o",
              instructions: WEB_DRAFT_PROMPT,
              input: [{ role: "user", content: question }],
              max_output_tokens: 2000,
              tools: [{ type: "web_search_preview", search_context_size: "medium" }],
            }),
          });
          if (!res.ok) return { text: "", sources: [] };
          const data = await res.json();

          let text = "";
          const sources = [];
          const seen = new Set();

          const addSource = (rawUrl, title) => {
            let url = rawUrl;
            try {
              const u = new URL(url);
              u.searchParams.delete("utm_source");
              url = u.toString();
            } catch {
              return; // not a usable URL
            }
            if (seen.has(url)) return;
            seen.add(url);
            let domain = "";
            let derived = "";
            try {
              const u = new URL(url);
              domain = u.hostname;
              // Harvested URLs carry no title, and a chip reading
              // "docs.aws.amazon.com" is useless. The last path segment is a
              // decent stand-in: "storage-class-intro.html" -> "Storage class intro".
              const slug = u.pathname.split("/").filter(Boolean).pop() || "";
              const words = slug.replace(/\.(html?|md)$/i, "").replace(/[-_]+/g, " ").trim();
              if (words) derived = words.charAt(0).toUpperCase() + words.slice(1);
            } catch {
              /* leave blank */
            }
            sources.push({ url, domain, title: title || derived || domain || url });
          };

          for (const item of data.output || []) {
            for (const part of item.content || []) {
              if (part.type !== "output_text") continue;
              text += part.text || "";
              for (const ann of part.annotations || []) {
                if (ann.type === "url_citation" && ann.url) addSource(ann.url, ann.title);
              }
            }
          }

          // The model runs the search but doesn't always attach citation
          // annotations, and web_search_call exposes only the query it ran —
          // not the pages it read. So also harvest doc URLs written into the
          // briefing text itself, which the prompt requires.
          if (text) {
            for (const m of text.matchAll(/https?:\/\/docs\.aws\.amazon\.com\/[^\s)\]"'<>]+/g)) {
              addSource(m[0].replace(/[.,;]+$/, ""));
            }
          }

          return { text, sources };
        } catch {
          return { text: "", sources: [] };
        }
      })();

      emit({ t: "tool", v: "web_search" });
      const [corpusDocs, web] = await Promise.all([corpusPromise, webPromise]);
      emit({ t: "tool_done" });

      // ── Build one numbered source list across both origins ─────────────
      const sources = [];
      corpusDocs.forEach((d) => {
        sources.push({
          index: sources.length + 1,
          kind: "topic",
          url: `/?topic=${encodeURIComponent(d.id)}`,
          domain: "Course notes",
          title: d.title,
          external: false,
        });
      });
      web.sources.forEach((s) => {
        sources.push({
          index: sources.length + 1,
          kind: "web",
          url: s.url,
          domain: s.domain,
          title: s.title,
          external: !s.domain.endsWith("docs.aws.amazon.com"),
        });
      });
      for (const s of sources) emit({ t: "source", v: s });

      if (!corpusDocs.length && !web.text) {
        emit({
          t: "text",
          v: "I couldn't reach the study notes or AWS documentation for that just now. Please try again in a moment.",
        });
        controller.close();
        return;
      }

      // ── Stage 2: synthesize ────────────────────────────────────────────
      emit({ t: "tool", v: "synthesize" });

      const corpusBlock = corpusDocs.length
        ? corpusDocs
            .map(
              (d, i) =>
                `--- SOURCE [${i + 1}] — course notes: ${d.title} (${d.category}) ---\n${d.content}`
            )
            .join("\n\n")
        : "(no relevant course notes found)";

      const webStart = corpusDocs.length + 1;
      const webBlock = web.text
        ? `${web.text}\n\nDocumentation sources:\n${web.sources
            .map((s, i) => `[${webStart + i}] ${s.title} — ${s.url}`)
            .join("\n")}`
        : "(no documentation findings)";

      const priorTurns = trimmed
        .slice(0, -1)
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n");

      const synthInput = [
        priorTurns ? `CONVERSATION SO FAR:\n${priorTurns}\n` : "",
        `QUESTION:\n${question}\n`,
        `COURSE NOTES:\n${corpusBlock}\n`,
        `AWS DOCUMENTATION BRIEFING:\n${webBlock}\n`,
        `SOURCES (cite by number):\n${
          sources.map((s) => `[${s.index}] ${s.kind === "topic" ? "Course notes" : s.domain} — ${s.title}`).join("\n") ||
          "(none)"
        }`,
      ].join("\n");

      let synthRes;
      try {
        synthRes = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            instructions: SYNTH_PROMPT,
            input: [{ role: "user", content: synthInput }],
            max_output_tokens: 6000,
            stream: true,
          }),
        });
      } catch {
        emit({ t: "text", v: "Something went wrong composing the answer. Please try again." });
        controller.close();
        return;
      }

      if (!synthRes.ok || !synthRes.body) {
        const detail = await synthRes.text().catch(() => "");
        emit({ t: "text", v: `Something went wrong composing the answer.\n\n${detail.slice(0, 300)}` });
        controller.close();
        return;
      }

      // Turn the model's bare [n] citations into links to the sources strip.
      // A marker can straddle two deltas, so hold back a trailing fragment
      // that might still become one.
      const CITE_RE = /\[(\d{1,2})\]/g;
      const splitSafe = (buf) => {
        const i = buf.lastIndexOf("[");
        if (i === -1) return [buf, ""];
        const rest = buf.slice(i);
        if (!rest.includes("]") && rest.length < 8) return [buf.slice(0, i), rest];
        return [buf, ""];
      };

      const maxIndex = sources.length;
      let hold = "";
      const emitText = (chunk, flush = false) => {
        hold += chunk;
        hold = hold.replace(CITE_RE, (m, n) => {
          const i = Number(n);
          // Leave anything that isn't a real source alone — could be ordinary
          // bracketed text in a command or policy snippet.
          return i >= 1 && i <= maxIndex ? `[[${i}]](#source-${i})` : m;
        });
        let out;
        if (flush) {
          out = hold;
          hold = "";
        } else {
          [out, hold] = splitSafe(hold);
        }
        if (out) emit({ t: "text", v: out });
      };

      const reader = synthRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
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
            if (evt.type === "response.output_text.delta") emitText(evt.delta);
            else if (evt.type === "error" || evt.type === "response.failed") {
              emitText(`\n\n*(Error: ${evt.message || evt.error?.message || "failed"})*`, true);
            }
          } catch {
            /* ignore partial SSE lines */
          }
        }
      }
      emitText("", true);
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8" },
  });
}
