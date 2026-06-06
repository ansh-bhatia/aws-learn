import React, { useState } from "react";
import "./APIGatewayVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. APPLICATION INTEGRATION — app↔app vs micro↔micro
   ════════════════════════════════════════════════════════════ */
export function AppIntegration() {
  const [type, setType] = useState("micro");
  return (
    <div className="sv-card">
      <div className="sv-title apig-title">🔗 Application Integration</div>
      <p className="apig-intro">
        Application integration = connecting different applications/services so they exchange data reliably, <b>decoupled</b>
        and scalable. Two flavors — click each:
      </p>
      <div className="apig-toggle">
        <button className={type === "a2a" ? "active" : ""} onClick={() => setType("a2a")}>🏢 App ↔ App</button>
        <button className={type === "micro" ? "active" : ""} onClick={() => setType("micro")}>🧩 Microservice ↔ Microservice</button>
      </div>
      {type === "a2a" ? (
        <div className="apig-detail">
          <b>Application-to-Application</b>
          <p>Two completely separate systems (often different companies/departments) talking to complete a task.</p>
          <ul>
            <li><b>UPI payment</b> — your UPI app (Google Pay/Paytm) ↔ <b>NPCI</b> ↔ your <b>bank</b> — three systems coordinating.</li>
            <li><b>Skyscanner</b> ↔ <b>Emirates</b> airline system — fetch fares/times, then write the confirmed booking back.</li>
          </ul>
        </div>
      ) : (
        <div className="apig-detail">
          <b>Microservice-to-Microservice</b>
          <p>Small independent services inside one app talking to complete a user request.</p>
          <ul>
            <li>In e-commerce: the <b>order</b> service asks the <b>cart</b> service for items → creates the order → calls the <b>payment</b> service → then the <b>notification</b> service.</li>
            <li>They can't call functions or share a DB (separate apps, maybe different languages) — so they use <b>APIs, queues, events &amp; messages</b>.</li>
          </ul>
        </div>
      )}
      <p className="apig-note">📌 Why learn it? ~99% of modern apps are microservices — and integration is how those pieces actually talk. Heavily tested in the SAA-C03 exam.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. MONOLITH vs MICROSERVICES scaling
   ════════════════════════════════════════════════════════════ */
export function MonoMicroScaling() {
  const [view, setView] = useState("micro");
  const stages = [["🏠 Browse", "100,000", 100], ["🛒 Cart", "10,000", 10], ["💳 Checkout", "4,000", 4], ["✅ Pay", "2,000", 2]];
  return (
    <div className="sv-card">
      <div className="sv-title apig-title">📊 Monolithic vs Microservices (Scaling)</div>
      <p className="apig-intro">
        <b>Monolithic</b> = one codebase/deploy/DB; a change means redeploying everything, and you must scale the
        <b> whole</b> app together. <b>Microservices</b> scale each part to its own demand. Toggle the Amazon sale example:
      </p>
      <div className="apig-toggle">
        <button className={view === "mono" ? "active" : ""} onClick={() => setView("mono")}>🏢 Monolithic</button>
        <button className={view === "micro" ? "active" : ""} onClick={() => setView("micro")}>🧩 Microservices</button>
      </div>
      <div className="apig-scale-grid">
        {stages.map((s, i) => (
          <div key={i} className="apig-scale-col">
            <div className="apig-scale-name">{s[0]}</div>
            <div className="apig-scale-bar-wrap">
              <div className="apig-scale-bar" style={{ height: `${view === "mono" ? 100 : s[2]}%` }} />
            </div>
            <div className="apig-scale-num">{view === "mono" ? "100,000" : s[1]}</div>
          </div>
        ))}
      </div>
      <p className={"apig-note " + (view === "mono" ? "warn" : "ok")}>
        {view === "mono"
          ? "⚠️ Monolith: every service is scaled for 100,000 — even Payment, which only 2,000 use. Wasted resources & cost; one small change redeploys everything."
          : "✅ Microservices: Browse scales for 100K, Cart for 10K, Checkout for 4K, Pay for only 2K. Independent scaling = optimized cost & performance, faster deploys, tech flexibility."}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. SYNC vs ASYNC
   ════════════════════════════════════════════════════════════ */
export function SyncVsAsync() {
  const [mode, setMode] = useState("sync");
  return (
    <div className="sv-card">
      <div className="sv-title apig-title">🔄 Synchronous vs Asynchronous</div>
      <p className="apig-intro">Microservice communication isn't one-size-fits-all. Two styles — click each:</p>
      <div className="apig-toggle">
        <button className={mode === "sync" ? "active" : ""} onClick={() => setMode("sync")}>📞 Synchronous</button>
        <button className={mode === "async" ? "active" : ""} onClick={() => setMode("async")}>💬 Asynchronous</button>
      </div>
      <div className="apig-syncflow">
        <div className="apig-sf-node">Order</div>
        <div className="apig-sf-arrow">
          {mode === "sync" ? "request →" : "message →"}
          <small>{mode === "sync" ? "⏳ waits for reply" : "🏃 keeps working, no wait"}</small>
        </div>
        <div className="apig-sf-node">{mode === "sync" ? "Payment" : "SQS / SNS"}</div>
      </div>
      <div className="apig-detail">
        {mode === "sync"
          ? <p><b>Synchronous = real-time.</b> The order service sends a request and <b>waits</b> until payment replies (success/fail) before continuing — like a phone call. Use when you need an <b>instant response</b> and the next step depends on it. <b>AWS:</b> API Gateway, ALB.</p>
          : <p><b>Asynchronous = no waiting.</b> A service sends a message and <b>continues</b>; the receiver processes it later — like a WhatsApp message. Use for background tasks: notifications, inventory updates, retry logic. <b>AWS:</b> SQS, SNS, EventBridge.</p>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. API GATEWAY CONCEPT — single entry point
   ════════════════════════════════════════════════════════════ */
export function APIGatewayConcept() {
  return (
    <div className="sv-card">
      <div className="sv-title apig-title">🚪 API Gateway — Single Entry Point</div>
      <p className="apig-intro">
        A fully managed service that's the <b>single front door</b> for all your backend APIs. Clients never hit backends
        directly — they go through the gateway, which secures, throttles, routes &amp; logs every request.
      </p>
      <div className="apig-gw-diagram">
        <div className="apig-gw-clients">
          <div className="apig-gw-chip">📱 Mobile</div>
          <div className="apig-gw-chip">💻 Web</div>
          <div className="apig-gw-chip">🧩 Service</div>
        </div>
        <div className="apig-gw-arrow">→</div>
        <div className="apig-gw-core">🚪 API Gateway<small>auth · throttle · route · log</small></div>
        <div className="apig-gw-arrow">→</div>
        <div className="apig-gw-backends">
          <div className="apig-gw-chip be">λ Lambda</div>
          <div className="apig-gw-chip be">🖥️ EC2</div>
          <div className="apig-gw-chip be">📦 ECS/EKS</div>
        </div>
      </div>
      <p className="apig-note">🚕 <b>Uber example:</b> many APIs (driver location, ride request, fare, payment, trip history, notifications). Instead of exposing each separately, one API Gateway sits in front to secure them, throttle peak traffic, block suspicious requests, and manage versions.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. API TYPES
   ════════════════════════════════════════════════════════════ */
const API_TYPES = [
  { id: "http", t: "HTTP API", d: "Request/response model. Faster & ~70% cheaper than REST, with fewer features. Best for simple, low-cost APIs (esp. Lambda/proxy).", color: "#3fb950" },
  { id: "rest", t: "REST API", d: "Request/response model with the full advanced feature set (transformations, validation, caching, API keys, WAF). More expensive.", color: "#8C4FFF" },
  { id: "restp", t: "REST API (Private)", d: "Same as REST API but only accessible from inside a VPC (not the public internet).", color: "#a371f7" },
  { id: "ws", t: "WebSocket API", d: "Persistent, two-way, real-time connection — stays open. For live chat, notifications, dashboards, gaming, live tracking.", color: "#f0883e" },
];
export function APITypes() {
  const [sel, setSel] = useState("rest");
  const a = API_TYPES.find((x) => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title apig-title">🧭 The 4 API Types</div>
      <p className="apig-intro">API Gateway supports four API types. REST &amp; HTTP are the common decision; WebSocket is a different game:</p>
      <div className="apig-tabs">
        {API_TYPES.map((x) => (
          <button key={x.id} className={"apig-tab" + (sel === x.id ? " active" : "")} style={sel === x.id ? { borderColor: x.color, color: x.color } : {}} onClick={() => setSel(x.id)}>{x.t}</button>
        ))}
      </div>
      <div className="apig-detail" style={{ borderLeftColor: a.color }}>
        <b style={{ color: a.color }}>{a.t}</b>
        <p>{a.d}</p>
      </div>
      <p className="apig-note">🔌 REST &amp; HTTP both use the request → response → close model. <b>WebSocket keeps the connection open</b> for continuous two-way messaging.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. REST vs HTTP comparison
   ════════════════════════════════════════════════════════════ */
const RH_ROWS = [
  ["API keys", "✅", "❌"],
  ["IAM auth (SigV4)", "✅", "❌"],
  ["Cognito auth", "✅", "✅"],
  ["JWT / OAuth (native)", "❌", "✅"],
  ["Throttling / rate limit", "✅ advanced", "⚠️ basic"],
  ["WAF (firewall)", "✅ direct", "⚠️ via CloudFront"],
  ["Request/response transform", "✅", "❌"],
  ["Input validation", "✅", "❌"],
  ["Mapping templates (VTL)", "✅", "❌"],
  ["Caching", "✅", "❌ (already fast)"],
  ["ALB integration", "❌", "✅"],
  ["Private API (VPC only)", "✅", "❌"],
  ["Cost", "Expensive", "~70% cheaper"],
  ["Speed", "Slower", "Faster"],
];
export function RestVsHttp() {
  return (
    <div className="sv-card">
      <div className="sv-title apig-title">⚖️ REST API vs HTTP API</div>
      <p className="apig-intro">
        The big exam decision. <b>REST</b> = full advanced features (incl. transform/validation/caching — the decision-makers).
        <b> HTTP</b> = faster, ~70% cheaper, fewer features. (CloudWatch logs &amp; Lambda/HTTP integration are supported by both.)
      </p>
      <div className="apig-rh-table">
        <div className="apig-rh-row head"><span className="feat">Feature</span><span className="rest">REST</span><span className="http">HTTP</span></div>
        {RH_ROWS.map((r, i) => (
          <div key={i} className="apig-rh-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="apig-note">🧠 Need <b>request/response transformation, input validation, mapping templates, caching, API keys, or a private API</b>? → <b>REST</b>. Want <b>cheap &amp; fast</b> with JWT/OAuth or ALB integration? → <b>HTTP</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. WEBSOCKET DEMO
   ════════════════════════════════════════════════════════════ */
export function WebSocketDemo() {
  const [mode, setMode] = useState("ws");
  return (
    <div className="sv-card">
      <div className="sv-title apig-title">🔁 WebSocket API — Two-Way, Real-Time</div>
      <p className="apig-intro">
        REST/HTTP close the connection after each response. <b>WebSocket keeps it open</b> so both sides send messages
        anytime. Toggle to compare:
      </p>
      <div className="apig-toggle">
        <button className={mode === "rh" ? "active" : ""} onClick={() => setMode("rh")}>📨 REST/HTTP</button>
        <button className={mode === "ws" ? "active" : ""} onClick={() => setMode("ws")}>🔁 WebSocket</button>
      </div>
      <div className="apig-ws-stage">
        <div className="apig-ws-node">👤 Client</div>
        <div className={"apig-ws-link " + mode}>
          {mode === "rh" ? (
            <><span className="apig-ws-msg">request →</span><span className="apig-ws-msg">← response</span><span className="apig-ws-closed">✂️ connection closed</span></>
          ) : (
            <><span className="apig-ws-msg both">⇄ messages flow both ways, anytime</span><span className="apig-ws-open">🔓 connection stays open</span></>
          )}
        </div>
        <div className="apig-ws-node">🖥️ Server</div>
      </div>
      <p className="apig-note">🟢 <b>Keywords → WebSocket:</b> "real-time", "two-way", "long-lived connection". Use cases: live chat, live notifications/dashboards, gaming, collaboration (Zoom, Google Docs), delivery tracking. Supports Lambda, JWT &amp; Cognito; <b>no</b> ALB, API keys, WAF, or caching.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. CRUD + flow
   ════════════════════════════════════════════════════════════ */
const CRUD = [
  { op: "Create", http: "POST", ddb: "PutItem", d: "Add a new record (e.g. register a user).", color: "#3fb950" },
  { op: "Read", http: "GET", ddb: "GetItem / Scan", d: "Fetch records (e.g. view profile).", color: "#1f6feb" },
  { op: "Update", http: "PUT", ddb: "UpdateItem", d: "Modify a record (e.g. change email).", color: "#f0883e" },
  { op: "Delete", http: "DELETE", ddb: "DeleteItem", d: "Remove a record (e.g. delete account).", color: "#f85149" },
];
export function CRUDFlow() {
  const [sel, setSel] = useState(0);
  const c = CRUD[sel];
  return (
    <div className="sv-card">
      <div className="sv-title apig-title">🔧 CRUD &amp; the API Gateway Flow</div>
      <p className="apig-intro">
        <b>CRUD</b> = Create, Read, Update, Delete — the four operations every data API performs. Each maps to an HTTP method
        and a DynamoDB action. Click each:
      </p>
      <div className="apig-tabs">
        {CRUD.map((x, i) => (
          <button key={i} className={"apig-tab" + (sel === i ? " active" : "")} style={sel === i ? { borderColor: x.color, color: x.color } : {}} onClick={() => setSel(i)}>{x.op}</button>
        ))}
      </div>
      <div className="apig-detail" style={{ borderLeftColor: c.color }}>
        <b style={{ color: c.color }}>{c.op} — <code>{c.http}</code> → DynamoDB <code>{c.ddb}</code></b>
        <p>{c.d}</p>
      </div>
      <div className="apig-crud-flow">
        <div className="apig-cf-node">🌐 Website<small>front end</small></div>
        <span>→</span>
        <div className="apig-cf-node hl">🚪 API Gateway<small>secure URL</small></div>
        <span>→</span>
        <div className="apig-cf-node">λ Lambda<small>CRUD logic</small></div>
        <span>→</span>
        <div className="apig-cf-node">🗄️ DynamoDB</div>
      </div>
      <p className="apig-note">🔒 The website <b>can't</b> talk to DynamoDB directly (no public access — security risk). It goes through <b>API Gateway → Lambda → DynamoDB</b>. One API Gateway exposes all four CRUD endpoints with a clean URL, auth, logs &amp; throttling.</p>
    </div>
  );
}
