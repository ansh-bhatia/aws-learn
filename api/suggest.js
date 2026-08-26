export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `Given this AWS Q&A conversation, suggest exactly 3 short, natural follow-up questions the user might want to ask next. Return ONLY the 3 questions, one per line, no numbering, no bullets, no extra commentary.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ questions: [] }), {
      status: 200,
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
    return new Response(JSON.stringify({ questions: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const trimmed = messages
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content }));

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 200,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
      }),
    });

    if (!openaiRes.ok) {
      return new Response(JSON.stringify({ questions: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || "";
    const questions = text
      .split("\n")
      .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    return new Response(JSON.stringify({ questions }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ questions: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}
