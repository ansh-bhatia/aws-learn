import { useState } from "react";
import "./GlobalAcceleratorVisuals.css";

/* ─── 1. GLOBAL ACCELERATOR FLOW ───────────────────────────────────── */
export function GlobalAcceleratorFlow() {
  const [ga, setGa] = useState(true);

  return (
    <div className="sv-card ga-card">
      <div className="sv-title ga-title">🚀 How Global Accelerator Routes Traffic</div>
      <p className="ga-intro">
        Global Accelerator gives you <strong>2 static anycast IPs</strong>. Users enter the <strong>nearest AWS edge</strong>,
        then ride the fast, private <strong>AWS global network</strong> to the <strong>nearest healthy region</strong> — instead
        of the congested public internet. Toggle it to compare.
      </p>

      <div className="ga-flow-switch">
        <button className={`ga-switch ${!ga ? "active bad" : ""}`} onClick={() => setGa(false)}>❌ Public internet</button>
        <button className={`ga-switch ${ga ? "active good" : ""}`} onClick={() => setGa(true)}>✅ With Global Accelerator</button>
      </div>

      <div className="ga-flow-stage">
        <div className="ga-flow-node">🧑‍💻<span>User</span></div>
        <div className={`ga-flow-pipe ${ga ? "good" : "bad"}`}>
          {ga ? "⚡ nearest edge → AWS backbone" : "🌐 many public hops (slow, jittery)"}
        </div>
        <div className="ga-flow-node">{ga ? "📍" : "🌍"}<span>{ga ? "Edge + AWS network" : "Public internet"}</span></div>
        <div className={`ga-flow-pipe ${ga ? "good" : "bad"}`}>{ga ? "routed to nearest healthy region" : ""}</div>
        <div className="ga-flow-node">🏢<span>Region endpoint<br/>(ALB / NLB / EC2)</span></div>
      </div>

      <div className={`ga-flow-verdict ${ga ? "good" : "bad"}`}>
        {ga
          ? "✅ Traffic enters AWS at the closest edge and travels the optimized AWS backbone — lower latency, less jitter, fast regional failover. The 2 static IPs never change."
          : "❌ Traffic crosses many unpredictable public-internet hops to a single region — higher latency, more variability."}
      </div>

      <div className="ga-note">
        💡 Global Accelerator works at the <strong>network layer (TCP/UDP)</strong> — it does <em>not</em> cache content (that's
        CloudFront). It's ideal for non-HTTP apps (gaming, IoT, VoIP) and multi-region HTTP apps needing static IPs + fast failover.
      </div>
    </div>
  );
}

/* ─── 2. GA vs CLOUDFRONT vs ROUTE 53 ──────────────────────────────── */
export function GAComparison() {
  const rows = [
    ["What it is", "Network-layer accelerator (anycast IPs + AWS backbone)", "CDN — caches content at edges", "DNS service"],
    ["Layer / protocol", "TCP & UDP (Layer 4)", "HTTP/HTTPS (Layer 7)", "DNS"],
    ["Caches content?", "❌ No", "✅ Yes", "❌ No"],
    ["Static IPs?", "✅ 2 anycast IPs", "❌ No", "❌ No (returns IPs)"],
    ["Failover speed", "Fast (seconds, no DNS TTL)", "n/a (origin failover)", "Slower (DNS TTL caching)"],
    ["Best for", "Non-HTTP apps, multi-region, static IPs, gaming/IoT/VoIP", "Static/cacheable web content, video", "Routing by geo/latency/weight at DNS level"],
  ];

  return (
    <div className="sv-card ga-card">
      <div className="sv-title ga-title">⚖️ Global Accelerator vs CloudFront vs Route 53</div>
      <p className="ga-intro">All three help global apps, but they're different tools — a classic exam confusion. Here's the contrast:</p>

      <div className="ga-cmp-table">
        <div className="ga-cmp-row head"><span>Aspect</span><span className="c1">🚀 Global Accelerator</span><span className="c2">🌍 CloudFront</span><span className="c3">🧭 Route 53</span></div>
        {rows.map(([a, g, c, r], i) => (
          <div key={i} className="ga-cmp-row">
            <span className="ga-cmp-feat">{a}</span><span>{g}</span><span>{c}</span><span>{r}</span>
          </div>
        ))}
      </div>

      <div className="ga-note">
        💡 Rule of thumb: <strong>cacheable web content → CloudFront</strong>; <strong>DNS-level routing → Route 53</strong>;
        <strong> TCP/UDP acceleration, static IPs, instant multi-region failover → Global Accelerator</strong>. They can be combined.
      </div>
    </div>
  );
}

/* ─── 3. ACCELERATOR STRUCTURE ─────────────────────────────────────── */
export function GAStructure() {
  const [dialA, setDialA] = useState(100);
  const [dialB, setDialB] = useState(100);

  return (
    <div className="sv-card ga-card">
      <div className="sv-title ga-title">🧩 Anatomy of an Accelerator</div>
      <p className="ga-intro">
        An accelerator nests: <strong>Listener</strong> (port/protocol) → one <strong>Endpoint Group per region</strong> →
        <strong> Endpoints</strong> (ALB/NLB/EC2/EIP) inside each. A per-group <strong>traffic dial</strong> caps how much
        traffic that region takes; per-endpoint <strong>weights</strong> split within a group.
      </p>

      <div className="ga-struct">
        <div className="ga-struct-acc">🚀 Accelerator — 2 static IPs + DNS name</div>
        <div className="ga-struct-listener">🎧 Listener · TCP :80</div>
        <div className="ga-struct-groups">
          <div className="ga-struct-group">
            <div className="ga-struct-group-head">📦 Endpoint Group · ap-south-1 (India)</div>
            <div className="ga-struct-dial">
              Traffic dial: <strong>{dialA}%</strong>
              <input type="range" min="0" max="100" value={dialA} onChange={(e) => setDialA(+e.target.value)} />
            </div>
            <div className="ga-struct-ep">⚖️ ALB-India</div>
          </div>
          <div className="ga-struct-group">
            <div className="ga-struct-group-head">📦 Endpoint Group · us-east-1 (USA)</div>
            <div className="ga-struct-dial">
              Traffic dial: <strong>{dialB}%</strong>
              <input type="range" min="0" max="100" value={dialB} onChange={(e) => setDialB(+e.target.value)} />
            </div>
            <div className="ga-struct-ep">⚖️ ALB-USA</div>
          </div>
        </div>
      </div>

      <div className="ga-note">
        💡 By default each group is dialed to <strong>100%</strong> (nearest-region routing). Lower a dial to shift traffic
        away from a region (e.g. for maintenance or gradual cutover). Health checks remove unhealthy endpoints automatically.
      </div>
    </div>
  );
}

/* ─── 4. MULTI-REGION FAILOVER ─────────────────────────────────────── */
export function GAFailover() {
  const [indiaUp, setIndiaUp] = useState(true);

  // viewers route to nearest healthy region
  const viewers = [
    { from: "Mumbai", near: "india" },
    { from: "Singapore", near: "india" },
    { from: "Virginia", near: "usa" },
    { from: "Brazil", near: "usa" },
  ];
  const route = (v) => (v.near === "india" && indiaUp ? "India" : "USA");

  return (
    <div className="sv-card ga-card">
      <div className="sv-title ga-title">🌐 Multi-Region Failover (Super Lab)</div>
      <p className="ga-intro">
        Two regions behind one accelerator. Users hit their nearest healthy region. If a whole region fails, Global
        Accelerator reroutes <strong>everyone</strong> to the other — fast, with the <strong>same static IPs</strong>. Toggle India.
      </p>

      <div className="ga-fo-regions">
        <div className={`ga-fo-region ${indiaUp ? "up" : "down"}`}>
          <div className="ga-fo-flag">🇮🇳</div>
          <div className="ga-fo-name">India region</div>
          <div className="ga-fo-state">{indiaUp ? "🟢 Healthy" : "🔴 Down"}</div>
          <button className="ga-fo-toggle" onClick={() => setIndiaUp((v) => !v)}>{indiaUp ? "💥 Fail region" : "♻️ Recover"}</button>
        </div>
        <div className="ga-fo-region up">
          <div className="ga-fo-flag">🇺🇸</div>
          <div className="ga-fo-name">USA region</div>
          <div className="ga-fo-state">🟢 Healthy</div>
        </div>
      </div>

      <div className="ga-fo-viewers">
        {viewers.map((v) => (
          <div key={v.from} className="ga-fo-viewer">
            <span className="ga-fo-viewer-from">🧑‍💻 {v.from}</span>
            <span className="ga-fo-arrow">→</span>
            <span className={`ga-fo-dest ${route(v) === "India" ? "india" : "usa"}`}>{route(v) === "India" ? "🇮🇳 India" : "🇺🇸 USA"}</span>
          </div>
        ))}
      </div>

      <div className={`ga-fo-result ${indiaUp ? "good" : "warn"}`}>
        {indiaUp
          ? "✅ Each user served by their nearest region — low latency, localized experience."
          : "↪️ India region down — all users (incl. Mumbai/Singapore) rerouted to USA. No downtime, IPs unchanged."}
      </div>

      <div className="ga-note">
        💡 Super-lab build: 2 regions, each with a VPC (public + private subnets, IGW, NAT), an <strong>ALB</strong> over web
        servers in 2 AZs (in-region HA), then one <strong>Global Accelerator</strong> with an endpoint group per region pointing
        at each ALB (cross-region HA).
      </div>
    </div>
  );
}
