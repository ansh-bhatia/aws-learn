import { useState, useEffect } from "react";
import "./CloudFrontVisuals.css";

/* ─── 1. 3D CDN GLOBE (with / without CloudFront) ──────────────────── */
export function CDNGlobe3D() {
  const [cdn, setCdn] = useState(true);
  const [spin, setSpin] = useState(true);

  // edge nodes around the globe (lat/long-ish positions on the sphere via rotateY/rotateX)
  const edges = [
    { city: "Brazil", noCdn: 113, cdn: 0, ry: 200, rx: -20 },
    { city: "California", noCdn: 62, cdn: 2, ry: 300, rx: 25 },
    { city: "Ireland", noCdn: 72, cdn: 1, ry: 20, rx: 40 },
    { city: "Australia", noCdn: 200, cdn: 0, ry: 120, rx: -35 },
    { city: "India (origin)", noCdn: 0, cdn: 0, ry: 70, rx: 15, origin: true },
  ];

  return (
    <div className="sv-card cf-card">
      <div className="sv-title cf-title">🌍 How a CDN Works — Global Edge Network</div>
      <p className="cf-intro">
        CloudFront is a <strong>CDN</strong> — it <strong>caches</strong> your content at 400+ <strong>edge locations</strong>
        worldwide, so users get it from a nearby server (low latency, domestic bandwidth) instead of the distant origin.
        Toggle CloudFront and watch global latency drop.
      </p>

      <div className="cf-globe-controls">
        <button className={`cf-toggle ${!cdn ? "active bad" : ""}`} onClick={() => setCdn(false)}>❌ Without CloudFront</button>
        <button className={`cf-toggle ${cdn ? "active good" : ""}`} onClick={() => setCdn(true)}>✅ With CloudFront</button>
        <button className="cf-spin-btn" onClick={() => setSpin((v) => !v)}>{spin ? "⏸" : "▶"}</button>
      </div>

      <div className="cf-globe-scene">
        <div className={`cf-globe ${spin ? "spin" : ""}`}>
          <div className="cf-globe-sphere" />
          {edges.map((e, i) => (
            <div key={i} className="cf-edge" style={{ transform: `rotateY(${e.ry}deg) rotateX(${e.rx}deg) translateZ(120px)` }}>
              <div className={`cf-edge-dot ${e.origin ? "origin" : cdn ? "cached" : "far"}`}>{e.origin ? "🗄️" : cdn ? "⚡" : "🌐"}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cf-latency-table">
        <div className="cf-lat-row head"><span>Location</span><span>Latency</span><span></span></div>
        {edges.filter((e) => !e.origin).map((e, i) => {
          const v = cdn ? e.cdn : e.noCdn;
          return (
            <div key={i} className="cf-lat-row">
              <span>{e.city}</span>
              <span className={cdn ? "good" : "bad"}>{v} ms</span>
              <div className="cf-lat-bar-track"><div className={`cf-lat-bar ${cdn ? "good" : "bad"}`} style={{ width: `${Math.min(100, (cdn ? e.cdn : e.noCdn) / 2)}%` }} /></div>
            </div>
          );
        })}
      </div>

      <div className="cf-note">
        💡 Without a CDN, a single origin (e.g. Mumbai) serves the whole world — distant users get high latency on slow
        international bandwidth, and the origin can be overwhelmed. CloudFront caches copies near users and shields the origin.
      </div>
    </div>
  );
}

/* ─── 2. DISTRIBUTION CONFIG EXPLORER (everything) ─────────────────── */
export function DistributionConfig() {
  const [sel, setSel] = useState("origin");

  const sections = {
    origin: { name: "Origin Settings", items: [
      ["Origin domain", "Where CloudFront fetches the original content: S3, S3 website endpoint, EC2 (paste its public DNS — not listed automatically), ELB, API Gateway, MediaStore."],
      ["Origin path", "Optional subfolder to use as the root (e.g. content lives in /web). Skip if your index is at the bucket root."],
      ["Custom headers", "Extra headers CloudFront sends to the origin — auth/API keys, versioning, debugging info."],
      ["Origin Shield", "An extra centralized caching layer in front of the origin — fewer direct origin hits, less load. Chargeable."],
    ]},
    cache: { name: "Default Cache Behavior", items: [
      ["Path pattern", "Which content this behavior applies to — * (all) or images/* (just that folder)."],
      ["Compress objects", "Auto-gzip files (a 100 KB CSS → ~30 KB). Always recommended."],
      ["Viewer protocol policy", "HTTP & HTTPS · Redirect HTTP→HTTPS · HTTPS only. CloudFront's default domain gets HTTPS free; custom domains need an ACM cert + CNAME."],
      ["Allowed HTTP methods", "GET/HEAD (static) · +OPTIONS (CORS) · ALL (GET,HEAD,OPTIONS,PUT,POST,PATCH,DELETE for dynamic/CRUD apps)."],
      ["Restrict viewer access", "Paid/private content via Signed URLs (one file) or Signed Cookies (many files), authorized by trusted key groups."],
      ["Cache key & origin requests", "Cache Policy = what makes a unique cache entry (headers/query/cookies). Origin Request Policy = what's forwarded to the origin on a miss."],
      ["Response headers policy", "Add/remove/modify response headers — CORS, security headers (HSTS, CSP…), custom, server-timing."],
    ]},
    settings: { name: "Settings", items: [
      ["Price class", "Which edge locations to use (all / NA+EU / etc.) — fewer = cheaper but less global reach."],
      ["Alternate domain (CNAME)", "Use your own domain (e.g. cdn.example.com) instead of the *.cloudfront.net name."],
      ["Custom SSL certificate", "ACM cert for your custom domain — must be in us-east-1 (N. Virginia) for CloudFront."],
      ["Supported HTTP versions", "HTTP/1.0 & 1.1 default; enable HTTP/2 & HTTP/3 (QUIC) for speed — CloudFront picks the best the viewer supports."],
      ["Default root object", "The file served at the root URL (e.g. index.html) so users don't have to type /index.html."],
    ]},
    functions: { name: "Function Associations", items: [
      ["Viewer request", "Runs when CloudFront receives the request — URL rewrites, redirects, request validation, geo-personalization."],
      ["Origin request", "Runs before forwarding to the origin (on a cache miss) — add auth tokens, route to a different origin."],
      ["Origin response", "Runs after the origin replies, before caching — custom cache logic, modify headers/status."],
      ["Viewer response", "Runs before sending to the viewer — add security headers, customize the response."],
    ]},
  };
  const s = sections[sel];

  return (
    <div className="sv-card cf-card">
      <div className="sv-title cf-title">⚙️ Distribution Options — Full Reference</div>

      <div className="cf-cfg-tabs">
        {Object.keys(sections).map((k) => (
          <button key={k} className={`cf-cfg-tab ${sel === k ? "active" : ""}`} onClick={() => setSel(k)}>{sections[k].name}</button>
        ))}
      </div>

      <div className="cf-cfg-list">
        {s.items.map(([t, d], i) => (
          <div key={i} className="cf-cfg-item"><span className="cf-cfg-t">{t}</span><span className="cf-cfg-d">{d}</span></div>
        ))}
      </div>

      {sel === "functions" && (
        <div className="cf-note">
          💡 Two function types: <strong>CloudFront Functions</strong> (lightweight, JS only, sub-ms, cheap — header/URL
          tweaks) and <strong>Lambda@Edge</strong> (heavier, multiple languages, more powerful — auth, dynamic content).
          Lambda@Edge functions must be created in <strong>us-east-1</strong>.
        </div>
      )}
    </div>
  );
}

/* ─── 3. ORIGIN ACCESS CONTROL ─────────────────────────────────────── */
export function OriginAccessControl() {
  const [mode, setMode] = useState("oac");

  const modes = {
    public: { name: "Public", color: "#f85149", secure: false,
      desc: "The S3 bucket is publicly accessible — anyone can reach objects directly via the S3 URL (HTTP, not secure) AND via CloudFront.",
      flow: "User → 🪣 S3 (direct) ✅  &  User → CloudFront → 🪣 S3 ✅", note: "Not best practice — bucket is exposed." },
    oac: { name: "OAC (recommended)", color: "#3fb950", secure: true,
      desc: "Origin Access Control: the bucket is fully private; ONLY CloudFront can read it (via a bucket policy granting the distribution). The modern approach.",
      flow: "User → 🪣 S3 (direct) ⛔  ·  User → CloudFront → 🪣 S3 ✅", note: "Bucket stays private; all access flows through CloudFront." },
    oai: { name: "OAI (legacy)", color: "#e3b341", secure: true,
      desc: "Origin Access Identity — the older mechanism that did the same job. Keep it only for existing setups; use OAC for anything new.",
      flow: "Same effect as OAC, older method", note: "Legacy — prefer OAC." },
  };
  const m = modes[mode];

  return (
    <div className="sv-card cf-card">
      <div className="sv-title cf-title">🔒 Origin Access (S3 origins)</div>
      <p className="cf-intro">
        Controls who can reach an <strong>S3 origin</strong> directly. The goal: lock the bucket so content is only
        served <strong>through CloudFront</strong> (HTTPS, secure), never via the raw S3 URL.
      </p>

      <div className="cf-oac-tabs">
        {Object.keys(modes).map((k) => (
          <button key={k} className={`cf-oac-tab ${mode === k ? "active" : ""}`} style={{ "--oc": modes[k].color }} onClick={() => setMode(k)}>
            {modes[k].name}
          </button>
        ))}
      </div>

      <div className="cf-oac-detail" style={{ "--oc": m.color }}>
        <div className="cf-oac-secure">{m.secure ? "🔒 Secure" : "🔓 Exposed"}</div>
        <div className="cf-oac-desc">{m.desc}</div>
        <div className="cf-oac-flow">{m.flow}</div>
        <div className="cf-oac-note">{m.note}</div>
      </div>

      <div className="cf-note">
        💡 With OAC you add a <strong>bucket policy</strong> trusting your distribution's ARN, then keep "Block all public
        access" ON. Don't forget a <strong>Default Root Object</strong> (index.html) so the bucket-origin root URL resolves.
      </div>
    </div>
  );
}

/* ─── 4. CACHE HIT vs MISS ─────────────────────────────────────────── */
export function CacheHitMiss() {
  const [scenario, setScenario] = useState("hit");
  const hit = scenario === "hit";

  return (
    <div className="sv-card cf-card">
      <div className="sv-title cf-title">🎬 Cache Hit vs Miss (the Netflix example)</div>
      <p className="cf-intro">
        A <strong>Cache Policy</strong> builds the <em>cache key</em> (from headers/query/cookies) that identifies a unique
        variant — e.g. "Inception, Hindi, 4K". If the edge has it → <strong>hit</strong>; if not → <strong>miss</strong>,
        and CloudFront fetches from the origin (using the <strong>Origin Request Policy</strong>).
      </p>

      <div className="cf-hm-switch">
        <button className={`cf-hm-btn ${hit ? "active good" : ""}`} onClick={() => setScenario("hit")}>✅ Cache Hit (Hindi 4K)</button>
        <button className={`cf-hm-btn ${!hit ? "active warn" : ""}`} onClick={() => setScenario("miss")}>⚠️ Cache Miss (English 4K)</button>
      </div>

      <div className="cf-hm-flow">
        <div className="cf-hm-node">🧑‍💻<span>User<br/>{hit ? "wants Hindi 4K" : "wants English 4K"}</span></div>
        <div className="cf-hm-arrow on">→</div>
        <div className="cf-hm-node edge">📍<span>Edge Location<br/><small>cache key check</small></span></div>
        {hit ? (
          <>
            <div className="cf-hm-verdict good">✅ HIT<small>found in cache</small></div>
          </>
        ) : (
          <>
            <div className="cf-hm-verdict warn">⚠️ MISS</div>
            <div className="cf-hm-arrow on">→</div>
            <div className="cf-hm-node origin">🗄️<span>Origin<br/><small>fetch + cache it</small></span></div>
          </>
        )}
      </div>

      <div className={`cf-hm-result ${hit ? "good" : "warn"}`}>
        {hit
          ? "Edge already has the Hindi-4K variant → served instantly from the edge. Fast, no origin hit."
          : "Edge lacks English-4K → forwards to origin (per Origin Request Policy), origin returns it, edge caches it for next time, then serves the user."}
      </div>

      <div className="cf-note">
        💡 You also set <strong>TTL</strong> (how long to cache) and compression on the cache policy. An edge never asks
        another edge — on a miss it always goes to the <strong>origin</strong>. The Origin Request Policy trims what's
        forwarded so the origin gets only what it needs.
      </div>
    </div>
  );
}

/* ─── 5. ORIGIN GROUP FAILOVER ─────────────────────────────────────── */
export function OriginGroupFailover() {
  const [primaryUp, setPrimaryUp] = useState(true);
  const serving = primaryUp ? "primary" : "secondary";

  return (
    <div className="sv-card cf-card">
      <div className="sv-title cf-title">🔁 Origin Group — Automatic Failover</div>
      <p className="cf-intro">
        An <strong>Origin Group</strong> pairs a <strong>primary</strong> and <strong>secondary</strong> origin. CloudFront
        sends requests to the primary; if it returns a failover error code, it switches to the secondary — and back when the
        primary recovers. Great for HA (e.g. EC2 → S3, or region-to-region with load balancers). Toggle the primary.
      </p>

      <div className="cf-fo-stage">
        <div className="cf-fo-cf">☁️ CloudFront</div>
        <div className="cf-fo-origins">
          <div className={`cf-fo-origin ${primaryUp ? "up" : "down"} ${serving === "primary" ? "serving" : ""}`}>
            <div className="cf-fo-badge">PRIMARY</div>
            <div className="cf-fo-icon">{primaryUp ? "🟢" : "🔴"}</div>
            <div className="cf-fo-label">EC2 / India ALB</div>
            <div className="cf-fo-state">{primaryUp ? (serving === "primary" ? "Serving" : "Healthy") : "Failed"}</div>
            <button className="cf-fo-toggle" onClick={() => setPrimaryUp((v) => !v)}>{primaryUp ? "💥 Fail primary" : "♻️ Recover"}</button>
          </div>
          <div className={`cf-fo-origin up ${serving === "secondary" ? "serving" : "idle"}`}>
            <div className="cf-fo-badge sec">SECONDARY</div>
            <div className="cf-fo-icon">🟢</div>
            <div className="cf-fo-label">S3 / US ALB</div>
            <div className="cf-fo-state">{serving === "secondary" ? "Now serving" : "Standby"}</div>
          </div>
        </div>
      </div>

      <div className={`cf-fo-result ${serving === "primary" ? "good" : "warn"}`}>
        {serving === "primary"
          ? "✅ Primary healthy — CloudFront serves from it."
          : "↪️ Primary failed — CloudFront fails over to the secondary. Users keep getting the site (maybe a maintenance/backup version)."}
      </div>

      <div className="cf-note">
        💡 Setup: add both origins → create an Origin Group (set primary/secondary + failover status codes like 500/502/503/504)
        → then point the <strong>cache behavior</strong> at the <strong>origin group</strong> (the step people forget!).
      </div>
    </div>
  );
}

/* ─── 6. GEO RESTRICTIONS ──────────────────────────────────────────── */
export function GeoRestrictions() {
  const [mode, setMode] = useState("none");
  const [list, setList] = useState(["India", "Brazil"]);

  const allCountries = ["India", "Brazil", "USA", "Ireland", "Australia", "Japan"];
  function blocked(c) {
    if (mode === "none") return false;
    if (mode === "block") return list.includes(c);
    if (mode === "allow") return !list.includes(c);
    return false;
  }

  return (
    <div className="sv-card cf-card">
      <div className="sv-title cf-title">🌐 Geographic Restrictions</div>
      <p className="cf-intro">
        Allow or block viewers by <strong>country</strong>. <strong>Allow list</strong> = only these countries can view;
        <strong> Block list</strong> = everyone except these. Blocked users get a <strong>403</strong>.
      </p>

      <div className="cf-geo-modes">
        <button className={`cf-geo-mode ${mode === "none" ? "active" : ""}`} onClick={() => setMode("none")}>None</button>
        <button className={`cf-geo-mode ${mode === "allow" ? "active" : ""}`} onClick={() => setMode("allow")}>Allow list</button>
        <button className={`cf-geo-mode ${mode === "block" ? "active" : ""}`} onClick={() => setMode("block")}>Block list</button>
      </div>

      {mode !== "none" && (
        <div className="cf-geo-picker">
          <span>Countries in list:</span>
          {allCountries.map((c) => (
            <button key={c} className={`cf-geo-chip ${list.includes(c) ? "on" : ""}`} onClick={() => setList((l) => l.includes(c) ? l.filter((x) => x !== c) : [...l, c])}>{c}</button>
          ))}
        </div>
      )}

      <div className="cf-geo-grid">
        {allCountries.map((c) => (
          <div key={c} className={`cf-geo-country ${blocked(c) ? "blocked" : "ok"}`}>
            <span className="cf-geo-flag">{blocked(c) ? "⛔" : "✅"}</span>{c}
            <small>{blocked(c) ? "403 blocked" : "can view"}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 7. CACHE INVALIDATION ────────────────────────────────────────── */
export function CacheInvalidation() {
  const [originVer, setOriginVer] = useState(1);
  const [edgeVer, setEdgeVer] = useState(1);

  const stale = originVer !== edgeVer;

  return (
    <div className="sv-card cf-card">
      <div className="sv-title cf-title">♻️ Cache Invalidation</div>
      <p className="cf-intro">
        When you update the origin, edge caches keep serving the <strong>old</strong> version until their <strong>TTL</strong>
        expires. To push changes <strong>immediately</strong>, create an <strong>invalidation</strong> (e.g. <code>/*</code>)
        to clear the edge cache.
      </p>

      <div className="cf-inv-stage">
        <div className="cf-inv-node">
          <div className="cf-inv-label">🗄️ Origin (US)</div>
          <div className="cf-inv-ver">v{originVer}</div>
          <button className="cf-inv-btn" onClick={() => setOriginVer((v) => v + 1)}>✏️ Update origin</button>
        </div>
        <div className="cf-inv-arrow">→ cached →</div>
        <div className="cf-inv-node">
          <div className="cf-inv-label">📍 Edge (India)</div>
          <div className={`cf-inv-ver ${stale ? "stale" : ""}`}>v{edgeVer}</div>
          <button className="cf-inv-btn warn" onClick={() => setEdgeVer(originVer)}>♻️ Invalidate /*</button>
        </div>
        <div className="cf-inv-arrow">→</div>
        <div className="cf-inv-node">
          <div className="cf-inv-label">🧑‍💻 User sees</div>
          <div className={`cf-inv-ver ${stale ? "stale" : "fresh"}`}>v{edgeVer}</div>
        </div>
      </div>

      <div className={`cf-inv-result ${stale ? "warn" : "good"}`}>
        {stale
          ? `⚠️ Stale! Origin is v${originVer} but the edge still serves v${edgeVer}. Users see the OLD version until TTL expires — or you invalidate.`
          : `✅ Edge matches origin (v${edgeVer}). Users see the latest version.`}
      </div>

      <div className="cf-note">
        💡 Invalidate a specific path (<code>/images/logo.png</code>) or everything (<code>/*</code>). Invalidations take a
        couple of minutes and the first ~1,000/month are free. Alternatively, version your filenames to sidestep caching.
      </div>
    </div>
  );
}
