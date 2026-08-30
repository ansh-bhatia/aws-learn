export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `Write a 2-5 word title for this AWS conversation, in title case, describing the topic. No quotes, no trailing punctuation, no "AWS" prefix unless essential. Return only the title.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // The caller falls back to a truncated first message, so every failure path
  // here returns an empty title rather than an error.
  const fail = () =>
    new Response(JSON.stringify({ title: "" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fail();

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) return fail();

  // Only the opening exchange matters for naming, and assistant answers are
  // long — cap them so this stays cheap.
  const trimmed = messages.slice(0, 2).map((m) => ({
    role: m.role,
    content: String(m.content).slice(0, 1500),
  }));

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 20,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
      }),
    });

    if (!openaiRes.ok) return fail();

    const data = await openaiRes.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const title = raw
      .replace(/^["'\s]+|["'\s.]+$/g, "")
      .split("\n")[0]
      .slice(0, 60);

    return new Response(JSON.stringify({ title }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return fail();
  }
}
