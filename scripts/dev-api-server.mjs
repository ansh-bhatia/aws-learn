// Local dev-only bridge for api/chat.js — vite dev can't run Vercel edge
// functions, so this runs the exact same handler over plain Node http,
// proxied from vite via server.proxy in vite.config.js.
import http from "node:http";
import handler from "../api/chat.js";

const PORT = 8787;

const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  const url = `http://localhost:${PORT}${req.url}`;
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
  });

  try {
    const response = await handler(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) {
      for await (const chunk of response.body) res.write(chunk);
    }
    res.end();
  } catch (err) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: String(err) }));
  }
});

server.listen(PORT, () => {
  console.log(`[dev-api] api/chat.js listening on http://localhost:${PORT}/api/chat`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("[dev-api] WARNING: ANTHROPIC_API_KEY is not set — requests will fail.");
  }
});
