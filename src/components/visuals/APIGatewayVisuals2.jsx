import React, { useState } from "react";
import "./APIGatewayVisuals2.css";

/* ════════════════════════════════════════════════════════════
   1. REST API ENDPOINT TYPES
   ════════════════════════════════════════════════════════════ */
const ENDPOINTS = [
  { id: "regional", t: "🌍 Regional", d: "API deployed in one region; clients hit it directly over the internet. Best when users are near that region.", lim: "Higher latency for far-away users.", color: "#8C4FFF" },
  { id: "edge", t: "🌐 Edge-Optimized", d: "Fronted by CloudFront — users hit the nearest edge location, which routes to your region. Best for global users.", lim: "Slightly more expensive (CloudFront); propagation takes time.", color: "#1f6feb" },
  { id: "private", t: "🔒 Private", d: "Not public — accessible only from inside a VPC via a VPC interface endpoint. For internal/secure APIs.", lim: "Must create a VPC endpoint; VPC-only.", color: "#3fb950" },
];
export function EndpointTypes() {
  const [sel, setSel] = useState("regional");
  const e = ENDPOINTS.find((x) => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title apig2-title">📍 REST API Endpoint Types</div>
      <p className="apig2-intro">When creating a REST API you choose one endpoint type (an API has exactly one). Click each:</p>
      <div className="apig2-tabs">
        {ENDPOINTS.map((x) => (
          <button key={x.id} className={"apig2-tab" + (sel === x.id ? " active" : "")} style={sel === x.id ? { borderColor: x.color, color: x.color } : {}} onClick={() => setSel(x.id)}>{x.t}</button>
        ))}
      </div>
      <div className="apig2-detail" style={{ borderLeftColor: e.color }}>
        <b style={{ color: e.color }}>{e.t}</b>
        <p>{e.d}</p>
        <p className="apig2-lim">⚠️ {e.lim}</p>
      </div>
      <p className="apig2-note">🔑 One API = one endpoint type. Need both public &amp; VPC access? Create <b>two</b> APIs.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. TLS SECURITY POLICY + STRICT MODE
   ════════════════════════════════════════════════════════════ */
export function SecurityPolicyTLS() {
  const [mode, setMode] = useState("strict");
  const [sni, setSni] = useState("api.example.com");
  const match = sni === "api.example.com";
  return (
    <div className="sv-card">
      <div className="sv-title apig2-title">🔐 TLS Security Policy &amp; Endpoint Access Mode</div>
      <p className="apig2-intro">
        <b>TLS</b> encrypts the client↔API tunnel (that's what makes it HTTPS). The <b>security policy</b> picks the minimum
        TLS version: <b>1.2</b> (modern), <b>1.3</b> (faster/most secure — prefer it), plus special variants:
      </p>
      <div className="apig2-tls-chips">
        <span className="apig2-chip">TLS 1.2</span>
        <span className="apig2-chip hot">TLS 1.3 ✓ prefer</span>
        <span className="apig2-chip">+FIPS <small>US gov</small></span>
        <span className="apig2-chip">+PFS <small>key per connection</small></span>
        <span className="apig2-chip">+PQC <small>quantum-safe</small></span>
      </div>
      <p className="apig2-intro" style={{ marginTop: "14px" }}>
        With an enhanced policy you also pick an <b>endpoint access mode</b>: <b>Basic</b> (allow all) or <b>Strict</b>
        (blocks <b>domain fronting</b> — where the TLS SNI and HTTP Host don't match). Try Strict:
      </p>
      <div className="apig2-toggle">
        <button className={mode === "basic" ? "active" : ""} onClick={() => setMode("basic")}>Basic</button>
        <button className={mode === "strict" ? "active" : ""} onClick={() => setMode("strict")}>Strict</button>
      </div>
      <div className="apig2-tls-handshake">
        <div className="apig2-th-row"><span>TLS SNI (handshake):</span>
          <select value={sni} onChange={(e) => setSni(e.target.value)}>
            <option>api.example.com</option><option>attacker.com</option>
          </select>
        </div>
        <div className="apig2-th-row"><span>HTTP Host header:</span><b>api.example.com</b></div>
        <div className={"apig2-th-verdict " + (mode === "basic" ? "ok" : match ? "ok" : "bad")}>
          {mode === "basic"
            ? "Basic → request allowed (no SNI/Host check)"
            : match ? "✅ SNI = Host → allowed" : "🚫 SNI ≠ Host → domain fronting → REJECTED"}
        </div>
      </div>
      <p className="apig2-note">🛡️ Strict also enforces the request comes from the <b>matching endpoint type</b> (regional/edge/private). For edge-optimized, CloudFront handles domain-fronting protection instead. Policies apply to the <b>default invoke URL</b>; a custom domain has its own policy.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. RESOURCES & METHODS
   ════════════════════════════════════════════════════════════ */
export function ResourcesMethods() {
  return (
    <div className="sv-card">
      <div className="sv-title apig2-title">🌲 Resources &amp; Methods (REST)</div>
      <p className="apig2-intro">
        Unlike HTTP API's simple route → integration, REST APIs use a tree: <b>Resources</b> (URL paths) contain
        <b> Methods</b> (HTTP verbs), and <b>all advanced features are configured at the method level</b>.
      </p>
      <div className="apig2-tree">
        <div className="apig2-tree-node root">/ <small>root resource (can't delete)</small></div>
        <div className="apig2-tree-children">
          <div className="apig2-tree-branch">
            <div className="apig2-tree-node res">/users <small>child resource</small></div>
            <div className="apig2-tree-methods"><span className="apig2-m get">GET</span><span className="apig2-m post">POST</span></div>
          </div>
          <div className="apig2-tree-branch">
            <div className="apig2-tree-node res">/users/{"{id}"} <small>path param</small></div>
            <div className="apig2-tree-methods"><span className="apig2-m get">GET</span><span className="apig2-m put">PUT</span><span className="apig2-m del">DELETE</span></div>
          </div>
        </div>
      </div>
      <p className="apig2-note">🔧 Method types: <b>GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS</b> (CORS), and <b>ANY</b> (one backend handles all verbs). Methods live inside resources — no resource, no method. Each method configures integration, proxy, request settings, etc.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. INTEGRATION TYPES + PROXY
   ════════════════════════════════════════════════════════════ */
const INTEGRATIONS = [
  { id: "lambda", t: "λ Lambda", d: "Most popular — gateway calls a Lambda and returns its response. Serverless backend." },
  { id: "http", t: "🌐 HTTP", d: "Pass-through to a public HTTP endpoint (e.g. your own URL)." },
  { id: "mock", t: "🧪 Mock", d: "No backend — returns a fixed response. Great for testing/demos." },
  { id: "vpclink", t: "🔗 VPC Link", d: "Private bridge to backends in a private VPC — via NLB (v1) or ALB (v2)." },
  { id: "aws", t: "☁️ AWS Service", d: "Call S3, DynamoDB, SQS, SNS, Kinesis directly (no Lambda) — needs IAM role + mapping. REST supports far more services than HTTP API." },
];
export function IntegrationTypes() {
  const [sel, setSel] = useState("lambda");
  const [proxy, setProxy] = useState(true);
  const i = INTEGRATIONS.find((x) => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title apig2-title">🔌 Integration Types &amp; Proxy</div>
      <p className="apig2-intro"><b>Integration</b> decides where a method sends the request. Click each:</p>
      <div className="apig2-tabs">
        {INTEGRATIONS.map((x) => (
          <button key={x.id} className={"apig2-tab" + (sel === x.id ? " active" : "")} onClick={() => setSel(x.id)}>{x.t}</button>
        ))}
      </div>
      <div className="apig2-detail"><b>{i.t}</b><p>{i.d}</p></div>
      <div className="apig2-intro" style={{ margin: "16px 0 8px" }}><b>Proxy integration</b> (Lambda/HTTP/VPC link):</div>
      <div className="apig2-toggle">
        <button className={proxy ? "active" : ""} onClick={() => setProxy(true)}>🚚 Proxy ON</button>
        <button className={!proxy ? "active" : ""} onClick={() => setProxy(false)}>🛠️ Proxy OFF</button>
      </div>
      <div className="apig2-detail">
        {proxy
          ? <p><b>Proxy ON</b> — gateway is a "courier": forwards the <b>full request unchanged</b> (method, path, query, headers, body) to the backend, which does all the work. Simple, fast — used in ~90% of modern APIs (powerful backends).</p>
          : <p><b>Proxy OFF</b> — gateway acts like an "office worker": it can <b>modify/filter/transform</b> the request &amp; response. Use for legacy backends that expect a fixed format. Configure response mode (<b>buffered</b> vs <b>streamed</b>) and an <b>integration timeout</b> (504 if the backend is too slow).</p>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. METHOD REQUEST SETTINGS
   ════════════════════════════════════════════════════════════ */
export function MethodRequestSettings() {
  const [val, setVal] = useState("body");
  return (
    <div className="sv-card">
      <div className="sv-title apig2-title">🛂 Method Request Settings</div>
      <p className="apig2-intro">
        The "security gate" checked <b>before</b> the backend is called. Two parts: <b>Authorization</b> (who can call) and
        <b> Request Validation</b> (is required data present).
      </p>
      <div className="apig2-detail">
        <b>🔑 Authorization — who can call</b>
        <p><b>None</b> (public) · <b>AWS IAM</b> (SigV4 — for AWS users/roles) · <b>Cognito user pool</b> (JWT token from logins) · <b>Lambda authorizer</b> (custom logic). Fails → <code>401 Unauthorized</code>.</p>
      </div>
      <div className="apig2-intro" style={{ margin: "16px 0 8px" }}><b>📋 Request Validator</b> — checks three things:</div>
      <div className="apig2-toggle">
        <button className={val === "body" ? "active" : ""} onClick={() => setVal("body")}>Body</button>
        <button className={val === "query" ? "active" : ""} onClick={() => setVal("query")}>Query string</button>
        <button className={val === "header" ? "active" : ""} onClick={() => setVal("header")}>Headers</button>
      </div>
      <div className="apig2-detail">
        {val === "body" && <p><b>Request body</b> — the JSON payload (e.g. <code>{"{user_id, name, email}"}</code>). Validated against a model. Common for POST/PUT/PATCH.</p>}
        {val === "query" && <p><b>Query string parameters</b> — key=value after the <code>?</code> in the URL (e.g. <code>?id=101</code>). Common for GET. Mark required params so missing ones are rejected.</p>}
        {val === "header" && <p><b>HTTP headers</b> — extra metadata not in the URL or body (e.g. <code>x-api-key</code>). Optional by default; mark required to enforce presence.</p>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. SECURITY LAYERS
   ════════════════════════════════════════════════════════════ */
const LAYERS = [
  { n: "1", t: "Usage Control", f: "API Keys + Usage Plans", d: "Identify clients & limit how much they can call (throttling + quota)." },
  { n: "2", t: "Access Control", f: "Resource Policy", d: "Control WHERE/WHO can reach the API — by IP, VPC, or AWS account (not authentication)." },
  { n: "3", t: "Edge Protection", f: "AWS WAF", d: "Layer-7 firewall before the gateway — blocks SQL injection, XSS, bad bots, malicious IPs." },
  { n: "4", t: "Auth & Authz", f: "IAM / Cognito / Lambda authorizer", d: "Identify the user & what they can do (SigV4 / JWT-OAuth / custom logic)." },
];
export function SecurityLayers() {
  const [sel, setSel] = useState(0);
  const l = LAYERS[sel];
  return (
    <div className="sv-card">
      <div className="sv-title apig2-title">🛡️ API Gateway Security — 4 Layers</div>
      <p className="apig2-intro">Securing an API isn't one feature — it's layered. A request passes through them in order. Click each:</p>
      <div className="apig2-layers">
        {LAYERS.map((x, i) => (
          <button key={i} className={"apig2-layer" + (sel === i ? " active" : "")} onClick={() => setSel(i)}>
            <span className="apig2-layer-n">{x.n}</span>{x.t}
          </button>
        ))}
      </div>
      <div className="apig2-detail">
        <b>Layer {l.n}: {l.t} → {l.f}</b>
        <p>{l.d}</p>
      </div>
      <p className="apig2-note">📌 Order: <b>Resource Policy → WAF → Usage Plan → Authorizer</b>. If the resource policy says no, the request is denied outright.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. API KEYS + USAGE PLAN
   ════════════════════════════════════════════════════════════ */
export function APIKeysUsagePlan() {
  const [rps, setRps] = useState(8);
  const rate = 10, burst = 5;
  const throttled = rps > rate + burst;
  return (
    <div className="sv-card">
      <div className="sv-title apig2-title">🎟️ API Keys &amp; Usage Plans</div>
      <p className="apig2-intro">
        An <b>API key</b> = a string (like a password) identifying a client, sent as the <code>x-api-key</code> header.
        It needs a <b>usage plan</b> to work, which sets <b>throttling</b> (rate + burst) and <b>quota</b> (per day/week/month).
      </p>
      <div className="apig2-calc">
        <label>Incoming requests/sec: <b>{rps}</b>
          <input type="range" min="1" max="20" value={rps} onChange={(e) => setRps(+e.target.value)} /></label>
      </div>
      <div className="apig2-meter">
        <div className="apig2-meter-fill" style={{ width: `${(rps / 20) * 100}%`, background: throttled ? "#f85149" : "#8C4FFF" }} />
        <span className="apig2-meter-mark" style={{ left: `${(rate / 20) * 100}%` }}>rate {rate}</span>
        <span className="apig2-meter-mark" style={{ left: `${((rate + burst) / 20) * 100}%` }}>+burst</span>
      </div>
      <p className={"apig2-note " + (throttled ? "warn" : "ok")}>
        {throttled
          ? `🚨 ${rps} > rate+burst (${rate + burst}) → 429 Too Many Requests.`
          : `✅ ${rps}/s within rate ${rate} (+${burst} burst for short spikes).`}
      </p>
      <p className="apig2-note">🔢 <b>Error codes (exam!):</b> missing/invalid API key or blocked by policy → <b>403 Forbidden</b>; throttle/quota exceeded → <b>429 Too Many Requests</b>. API keys only <b>identify</b> clients — they're not authentication and don't restrict origin (use a resource policy for that). Fully supported by REST; limited on HTTP API.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. CANARY DEPLOYMENT
   ════════════════════════════════════════════════════════════ */
export function CanaryDeployment() {
  const [pct, setPct] = useState(10);
  return (
    <div className="sv-card">
      <div className="sv-title apig2-title">🐤 Canary Deployment</div>
      <p className="apig2-intro">
        Release API changes <b>safely</b>: send a small % of traffic to the new version, keep the rest on the stable one,
        watch metrics, then promote (or roll back). Drag the canary %:
      </p>
      <div className="apig2-canary-bar">
        <div className="apig2-canary-stable" style={{ width: `${100 - pct}%` }}>Stable (prod alias) · {100 - pct}%</div>
        <div className="apig2-canary-new" style={{ width: `${pct}%` }}>{pct}%</div>
      </div>
      <div className="apig2-calc">
        <label>Canary traffic → new version: <b>{pct}%</b>
          <input type="range" min="0" max="100" step="5" value={pct} onChange={(e) => setPct(+e.target.value)} /></label>
      </div>
      <p className="apig2-note">📌 Configured at the <b>stage</b> level; works with <b>Lambda aliases</b> (not versions). <b>REST API only</b> — not HTTP/WebSocket. Like WhatsApp shipping a feature to 10% of users first.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. CUSTOM DOMAIN + ROUTING MODES
   ════════════════════════════════════════════════════════════ */
export function CustomDomain() {
  const [mode, setMode] = useState("mapping");
  return (
    <div className="sv-card">
      <div className="sv-title apig2-title">🌐 Custom Domain &amp; Routing Modes</div>
      <p className="apig2-intro">
        Replace the long invoke URL with your own domain (e.g. <code>api.company.com</code>) — branded, production-ready,
        HTTPS-only. Needs an <b>ACM certificate</b> matching the domain (edge → must be in <b>us-east-1</b>; regional → same
        region) and a DNS record (<b>Alias</b> for Route 53, <b>CNAME</b> for external registrars).
      </p>
      <p className="apig2-intro"><b>Routing mode</b> decides which API a request hits. Click each:</p>
      <div className="apig2-tabs">
        <button className={"apig2-tab" + (mode === "mapping" ? " active" : "")} onClick={() => setMode("mapping")}>API Mapping</button>
        <button className={"apig2-tab" + (mode === "rules" ? " active" : "")} onClick={() => setMode("rules")}>Routing Rules</button>
        <button className={"apig2-tab" + (mode === "both" ? " active" : "")} onClick={() => setMode("both")}>Rules → Mapping</button>
      </div>
      <div className="apig2-detail">
        {mode === "mapping" && <p><b>API Mapping only</b> — simple <b>path-based</b> routing (e.g. <code>/user</code> → user API/stage). No conditions. Works with REST, HTTP &amp; WebSocket.</p>}
        {mode === "rules" && <p><b>Routing Rules only</b> — <b>conditional</b> routing on path <b>and HTTP headers</b> (e.g. <code>/user</code> + <code>x-env:dev</code> → dev stage). Uses <b>priority</b> (lower number = higher priority) to resolve overlapping rules. REST only.</p>}
        {mode === "both" && <p><b>Routing Rules then API Mapping</b> — checks rules first; if none match, falls back to mappings. Lets you add conditional routing to an existing mapped setup <b>without breaking it</b>.</p>}
      </div>
      <p className="apig2-note">🔐 <b>mTLS (mutual TLS)</b> — only on custom domains (regional; edge handled by CloudFront). Verifies the <b>client's</b> certificate too, not just the server's — for high-security APIs.</p>
    </div>
  );
}
