// Local dev-only bridge for the api/*.js edge functions — vite dev can't run
// Vercel edge functions, so this runs the exact same handlers over plain
// Node http, proxied from vite via server.proxy in vite.config.js.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import chatHandler from "../api/chat.js";
import suggestHandler from "../api/suggest.js";
import titleHandler from "../api/title.js";
import finopsConnectHandler from "../api/finops/connect.js";
import finopsSummaryHandler from "../api/finops/summary.js";

const PORT = 8787;

const routes = {
  "/api/chat": chatHandler,
  "/api/suggest": suggestHandler,
  "/api/title": titleHandler,
  "/api/finops/connect": finopsConnectHandler,
  "/api/finops/summary": finopsSummaryHandler,
};

const server = http.createServer(async (req, res) => {
  const pathname = req.url.split("?")[0];

  // In production the handlers fetch the RAG index from the deployment's own
  // origin. Locally that origin is this server, not Vite, so serve public/
  // here too rather than making the handler care which environment it's in.
  if (pathname.startsWith("/rag/")) {
    const file = path.join(process.cwd(), "public", decodeURIComponent(pathname));
    if (!file.startsWith(path.join(process.cwd(), "public"))) {
      res.writeHead(400).end("bad path");
      return;
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "not built — run: npm run build:rag" }));
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(fs.readFileSync(file));
    return;
  }

  const handler = routes[pathname];
  if (!handler) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
    return;
  }

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
  console.log(`[dev-api] listening on http://localhost:${PORT} (${Object.keys(routes).join(", ")})`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[dev-api] WARNING: OPENAI_API_KEY is not set — requests will fail.");
  }
});
