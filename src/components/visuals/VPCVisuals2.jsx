import { useState } from "react";
import "./VPCVisuals2.css";

/* ─── 1. VPC PEERING ───────────────────────────────────────────────── */
export function VPCPeeringDemo() {
  const [phase, setPhase] = useState(0); // 0 none, 1 requested, 2 accepted, 3 routes

  const phases = [
    "Two VPCs (different regions / accounts) — by default they CANNOT talk.",
    "VPC-A sends a peering request to VPC-B.",
    "VPC-B accepts → peering connection is Active.",
    "Add routes on BOTH sides → ping works. Communication enabled!",
  ];

  const connected = phase >= 3;

  return (
    <div className="sv-card v2-card">
      <div className="sv-title v2-title">🔗 VPC Peering — Connecting Two VPCs</div>
      <p className="v2-intro">
        By default, two VPCs <strong>cannot communicate</strong> — even in the same account. Peering links them,
        and works across <strong>accounts and regions</strong>. Their CIDR ranges <strong>must differ</strong>.
      </p>

      <div className="v2-peer-stage">
        <div className="v2-peer-vpc" style={{ "--pc": "#3fb950" }}>
          <div className="v2-peer-name">VPC-A · India</div>
          <div className="v2-peer-cidr">192.168.0.0/24</div>
          <span className="v2-peer-ec2">💻 ind-server</span>
          {phase >= 3 && <div className="v2-peer-route">route: 192.168.1.0/24 → pcx</div>}
        </div>

        <div className="v2-peer-link">
          <div className={`v2-peer-line ${connected ? "on" : phase >= 1 ? "pending" : ""}`} />
          <div className={`v2-peer-badge ${connected ? "on" : ""}`}>
            {phase === 0 && "⛔ no link"}
            {phase === 1 && "⏳ request sent →"}
            {phase === 2 && "✅ active"}
            {phase >= 3 && "🔁 ping ↔"}
          </div>
        </div>

        <div className="v2-peer-vpc" style={{ "--pc": "#2e73b8" }}>
          <div className="v2-peer-name">VPC-B · USA</div>
          <div className="v2-peer-cidr">192.168.1.0/24</div>
          <span className="v2-peer-ec2">💻 us-server</span>
          {phase >= 3 && <div className="v2-peer-route">route: 192.168.0.0/24 → pcx</div>}
        </div>
      </div>

      <div className="v2-stage-label">Step {phase + 1}/4: {phases[phase]}</div>

      <div className="v2-nav">
        <button className="v2-btn" onClick={() => setPhase(Math.max(0, phase - 1))} disabled={phase === 0}>← Back</button>
        <button className="v2-btn primary" onClick={() => setPhase(Math.min(3, phase + 1))} disabled={phase === 3}>Next →</button>
      </div>

      <div className="v2-note">
        💡 Peering is <strong>not transitive</strong>: if A↔B and A↔C are peered, B still can't reach C. And remember the
        two must-dos: <strong>accept</strong> the request, then add <strong>route table entries on both sides</strong>.
      </div>
    </div>
  );
}

/* ─── 2. NACL vs SECURITY GROUP ────────────────────────────────────── */
export function NACLvsSecurityGroup() {
  const rows = [
    { f: "Applies to", sg: "Instance / network interface (ENI)", nacl: "Entire subnet" },
    { f: "Analogy", sg: "Security guard of one office", nacl: "Security guard of the whole building" },
    { f: "Rule evaluation", sg: "All rules at once (no order)", nacl: "In order, lowest rule # first" },
    { f: "Allow & Deny?", sg: "Allow only (rest implicitly denied)", nacl: "Allow AND Deny rules" },
    { f: "State", sg: "Stateful (return traffic auto-allowed)", nacl: "Stateless (need inbound + outbound)" },
  ];

  return (
    <div className="sv-card v2-card">
      <div className="sv-title v2-title">🛡️ Security Group vs Network ACL</div>
      <p className="v2-intro">
        AWS gives you <strong>two layers</strong> of protection. Traffic to an instance passes the <strong>NACL</strong> (building
        security, subnet level) first, then the <strong>Security Group</strong> (office security, instance level).
      </p>

      <div className="v2-layers">
        <span className="v2-layer-actor">🌐 Traffic</span>
        <span className="v2-layer-arrow">→</span>
        <div className="v2-layer nacl">🏢 NACL<small>subnet level</small></div>
        <span className="v2-layer-arrow">→</span>
        <div className="v2-layer sg">🚪 Security Group<small>instance level</small></div>
        <span className="v2-layer-arrow">→</span>
        <span className="v2-layer-actor">💻 EC2</span>
      </div>

      <div className="v2-cmp-table">
        <div className="v2-cmp-row head">
          <span>Aspect</span><span className="v2-sg-col">🚪 Security Group</span><span className="v2-nacl-col">🏢 Network ACL</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="v2-cmp-row">
            <span className="v2-cmp-feat">{r.f}</span>
            <span>{r.sg}</span>
            <span>{r.nacl}</span>
          </div>
        ))}
      </div>

      <div className="v2-note">
        💡 Block a port for an <strong>entire subnet</strong> → use a NACL. Allow a port for <strong>one instance</strong> →
        use a Security Group. Only NACLs can explicitly <strong>deny</strong> (e.g. block one specific IP).
      </div>
    </div>
  );
}

/* ─── 3. STATEFUL vs STATELESS ─────────────────────────────────────── */
export function StatefulVsStateless() {
  const [mode, setMode] = useState("stateful");
  const stateful = mode === "stateful";

  return (
    <div className="sv-card v2-card">
      <div className="sv-title v2-title">🔄 Stateful vs Stateless</div>

      <div className="v2-switch">
        <button className={`v2-switch-btn ${stateful ? "active good" : ""}`} onClick={() => setMode("stateful")}>
          Stateful — Security Group
        </button>
        <button className={`v2-switch-btn ${!stateful ? "active warn" : ""}`} onClick={() => setMode("stateless")}>
          Stateless — Network ACL
        </button>
      </div>

      <div className="v2-state-stage">
        <div className="v2-state-flow">
          <div className="v2-state-dir">
            <div className="v2-state-label">Outbound request (EC2 → internet)</div>
            <div className="v2-state-line out">💻 → 🌐 <span className="v2-state-rule needed">needs outbound rule</span></div>
          </div>
          <div className="v2-state-dir">
            <div className="v2-state-label">Return traffic (the reply)</div>
            <div className="v2-state-line back">
              💻 ← 🌐
              {stateful
                ? <span className="v2-state-rule auto">auto-allowed ✅ (no inbound rule needed)</span>
                : <span className="v2-state-rule manual">⚠️ needs an explicit inbound rule</span>}
            </div>
          </div>
        </div>
      </div>

      <div className={`v2-state-verdict ${stateful ? "good" : "warn"}`}>
        {stateful ? (
          <><strong>Stateful (Security Group):</strong> it remembers connections it initiated. The reply is allowed back
          automatically — <strong>no inbound rule required</strong>. Lower admin burden — why most people prefer SGs.</>
        ) : (
          <><strong>Stateless (Network ACL):</strong> it remembers nothing. You must add rules for <strong>both</strong>
          directions — outbound for the request AND inbound for the reply. More administrative overhead.</>
        )}
      </div>

      <div className="v2-note">
        💡 Inbound traffic from the internet (e.g. someone opening your website on port 80) needs an inbound rule in
        <strong> both</strong> cases — the difference is only about the <strong>return</strong> traffic.
      </div>
    </div>
  );
}

/* ─── 4. NACL RULE-ORDER SIMULATOR ─────────────────────────────────── */
export function NACLRuleSimulator() {
  const rules = [
    { num: 100, type: "All traffic", src: "0.0.0.0/0", action: "ALLOW" },
    { num: 200, type: "SSH (22)", src: "0.0.0.0/0", action: "ALLOW" },
    { num: 250, type: "HTTP (80)", src: "119.x.x.x (your IP)", action: "DENY" },
    { num: 300, type: "HTTP (80)", src: "0.0.0.0/0", action: "ALLOW" },
  ];

  const [srcIsYou, setSrcIsYou] = useState(true);

  // Evaluate: HTTP from given source, in order
  let matched = null;
  for (const r of rules) {
    const httpRule = r.type.startsWith("HTTP") || r.type === "All traffic";
    if (!httpRule) continue;
    if (r.num === 250 && !srcIsYou) continue; // deny only matches your IP
    matched = r;
    break;
  }

  return (
    <div className="sv-card v2-card">
      <div className="sv-title v2-title">🔢 NACL Rule Order — Lowest Number Wins</div>
      <p className="v2-intro">
        NACL rules are evaluated <strong>in order, lowest number first</strong>. The first match wins — later rules are
        ignored. This is how a low-numbered DENY can block one IP while everyone else is allowed.
      </p>

      <div className="v2-sim-controls">
        Simulate an HTTP (port 80) request from:
        <button className={`v2-sim-toggle ${srcIsYou ? "on" : ""}`} onClick={() => setSrcIsYou(true)}>Your IP (119.x.x.x)</button>
        <button className={`v2-sim-toggle ${!srcIsYou ? "on" : ""}`} onClick={() => setSrcIsYou(false)}>A phone (other IP)</button>
      </div>

      <div className="v2-rules">
        {rules.map((r) => {
          const isHttp = r.type.startsWith("HTTP") || r.type === "All traffic";
          const isMatch = matched && matched.num === r.num;
          const skipped = matched && r.num > matched.num;
          return (
            <div key={r.num} className={`v2-rule ${r.action.toLowerCase()} ${isMatch ? "match" : ""} ${skipped ? "skipped" : ""}`}>
              <span className="v2-rule-num">#{r.num}</span>
              <span className="v2-rule-type">{r.type}</span>
              <span className="v2-rule-src">{r.src}</span>
              <span className={`v2-rule-action ${r.action.toLowerCase()}`}>{r.action}</span>
              {isMatch && <span className="v2-rule-flag">← first match {isHttp ? "" : ""}</span>}
            </div>
          );
        })}
      </div>

      <div className={`v2-sim-result ${matched && matched.action === "ALLOW" ? "good" : "bad"}`}>
        {matched && matched.action === "ALLOW"
          ? `✅ Allowed by rule #${matched.num} — website opens.`
          : `⛔ Denied by rule #${matched.num} — website blocked for this source.`}
      </div>

      <div className="v2-note">
        💡 Put the DENY (#250) <strong>before</strong> the broad ALLOW (#300). If it came after, the ALLOW would match
        first and the DENY would never run — exactly the bug in the lecture.
      </div>
    </div>
  );
}

/* ─── 5. HYBRID CONNECTIVITY: VPN vs DIRECT CONNECT ────────────────── */
export function HybridConnectivity() {
  const [mode, setMode] = useState("vpn");
  const vpn = mode === "vpn";

  return (
    <div className="sv-card v2-card">
      <div className="sv-title v2-title">🌉 Connecting On-Premises to AWS — VPN vs Direct Connect</div>
      <p className="v2-intro">
        Hybrid cloud links your on-prem network to a VPC. Two options: a <strong>Site-to-Site VPN</strong> (a tunnel over
        the public internet) or <strong>Direct Connect</strong> (a private fibre line).
      </p>

      <div className="v2-switch">
        <button className={`v2-switch-btn ${vpn ? "active good" : ""}`} onClick={() => setMode("vpn")}>🔐 Site-to-Site VPN</button>
        <button className={`v2-switch-btn ${!vpn ? "active good" : ""}`} onClick={() => setMode("dx")}>🚄 Direct Connect</button>
      </div>

      <div className="v2-hybrid-stage">
        <div className="v2-hybrid-node">🏢<span>On-Prem<br/>(Customer GW)</span></div>
        <div className={`v2-hybrid-pipe ${vpn ? "vpn" : "dx"}`}>
          {vpn ? "🌐 Internet · IPsec tunnel" : "🚄 Private fibre · no internet"}
        </div>
        <div className="v2-hybrid-node">☁️<span>AWS VPC<br/>(VPN / Direct Connect GW)</span></div>
      </div>

      <div className="v2-hybrid-grid">
        <div className="v2-hybrid-col">
          <div className="v2-hybrid-h">🔐 Site-to-Site VPN</div>
          <ul>
            <li>Uses the <strong>public internet</strong></li>
            <li>Encrypted with <strong>IPsec</strong> (needed — public network)</li>
            <li>Up to <strong>~1.25 Gbps</strong> bandwidth</li>
            <li>Components: Customer Gateway + Virtual Private Gateway + VPN connection</li>
            <li>Fast & cheap to set up (download router config, paste, done)</li>
          </ul>
        </div>
        <div className="v2-hybrid-col">
          <div className="v2-hybrid-h">🚄 Direct Connect</div>
          <ul>
            <li>Dedicated <strong>private fibre</strong> — no internet</li>
            <li><strong>No encryption</strong> (private line is already safe; clear text)</li>
            <li>Up to <strong>~100–300 Gbps</strong>, consistent low latency</li>
            <li>Via a partner with an AWS edge location</li>
            <li>Lower bandwidth cost, but takes <strong>30–90 days</strong> to provision</li>
          </ul>
        </div>
      </div>

      <div className="v2-note">
        💡 Exam favourite: <strong>VPN = internet + IPsec encryption</strong>; <strong>Direct Connect = private fibre,
        no encryption</strong>, higher bandwidth, more consistent performance.
      </div>
    </div>
  );
}

/* ─── 6. TRANSIT GATEWAY — MESH vs HUB ─────────────────────────────── */
export function TransitGatewayMesh() {
  const [n, setN] = useState(4);
  const [hub, setHub] = useState(false);

  const peerings = (n * (n - 1)) / 2;
  const size = 230;
  const cx = size / 2, cy = size / 2, r = 88;
  const nodes = Array.from({ length: n }).map((_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

  const lines = [];
  if (hub) {
    nodes.forEach((p, i) => lines.push({ x1: cx, y1: cy, x2: p.x, y2: p.y, key: `h${i}` }));
  } else {
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++)
        lines.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y, key: `${i}-${j}` });
  }

  return (
    <div className="sv-card v2-card">
      <div className="sv-title v2-title">🕸️ Transit Gateway — Killing the Peering Mesh</div>
      <p className="v2-intro">
        Connecting N VPCs with peering needs <code>N×(N−1)/2</code> connections — it explodes. A Transit Gateway is a
        central <strong>hub</strong>: each VPC attaches once.
      </p>

      <div className="v2-tg-controls">
        <span>VPCs: <strong>{n}</strong></span>
        <input type="range" min="2" max="8" value={n} onChange={(e) => setN(+e.target.value)} />
        <button className={`v2-sim-toggle ${!hub ? "on" : ""}`} onClick={() => setHub(false)}>Peering mesh</button>
        <button className={`v2-sim-toggle ${hub ? "on" : ""}`} onClick={() => setHub(true)}>Transit Gateway</button>
      </div>

      <div className="v2-tg-stage">
        <svg width={size} height={size} className="v2-tg-svg">
          {lines.map((l) => (
            <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={hub ? "#8c4fff" : "#f0883e"} strokeWidth="1.5" opacity="0.7" />
          ))}
          {hub && <circle cx={cx} cy={cy} r="16" fill="#8c4fff" />}
          {hub && <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fill="#fff">TG</text>}
          {nodes.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="13" fill="#21262d" stroke="#b88cff" strokeWidth="2" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fill="#e6edf3">V{i + 1}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="v2-tg-count">
        {hub
          ? <><strong>{n}</strong> attachments — one per VPC. Add a VPC → add <strong>one</strong> link.</>
          : <>Peering connections needed: <code>{n}×{n - 1}/2</code> = <strong>{peerings}</strong>{n >= 8 && " 😵 (and 10 VPCs = 45!)"}</>}
      </div>

      <div className="v2-note">
        💡 A Transit Gateway is a network hub for VPCs, VPNs, and Direct Connect — all in the <strong>same account &
        region</strong>. Cross-account/region? Use <strong>two Transit Gateways</strong> and peer them.
      </div>
    </div>
  );
}

/* ─── 7. VPC ENDPOINTS & PRIVATELINK ───────────────────────────────── */
export function VPCEndpointExplorer() {
  const [tab, setTab] = useState("why");

  return (
    <div className="sv-card v2-card">
      <div className="sv-title v2-title">🔌 VPC Endpoints & PrivateLink</div>

      <div className="v2-ep-tabs">
        <button className={`v2-ep-tab ${tab === "why" ? "active" : ""}`} onClick={() => setTab("why")}>Why (before/after)</button>
        <button className={`v2-ep-tab ${tab === "types" ? "active" : ""}`} onClick={() => setTab("types")}>Gateway vs Interface</button>
        <button className={`v2-ep-tab ${tab === "svc" ? "active" : ""}`} onClick={() => setTab("svc")}>Endpoint Services</button>
      </div>

      {tab === "why" && (
        <div className="v2-ep-body">
          <div className="v2-ep-beforeafter">
            <div className="v2-ep-ba bad">
              <div className="v2-ep-ba-h">❌ Before — over the internet</div>
              <div className="v2-ep-flow">💻 EC2 → 🌐 Internet Gateway → 🪣 S3 / DynamoDB</div>
              <p>Traffic between two AWS services leaves to the public internet. Slower, less private, IGW needed.</p>
            </div>
            <div className="v2-ep-ba good">
              <div className="v2-ep-ba-h">✅ After — VPC Endpoint (PrivateLink)</div>
              <div className="v2-ep-flow">💻 EC2 → 🔌 VPC Endpoint → 🪣 S3 / DynamoDB</div>
              <p>Stays on the <strong>AWS private network</strong>. Secure, low-latency, no IGW / NAT / VPN needed.</p>
            </div>
          </div>
          <div className="v2-note">
            💡 <strong>PrivateLink</strong> is the underlying tech: it connects your VPC to AWS services, on-prem, or
            other VPCs <strong>without exposing traffic to the public internet</strong>.
          </div>
        </div>
      )}

      {tab === "types" && (
        <div className="v2-ep-body">
          <div className="v2-cmp-table">
            <div className="v2-cmp-row head"><span>Aspect</span><span>🚪 Gateway Endpoint</span><span>🔌 Interface Endpoint</span></div>
            <div className="v2-cmp-row"><span className="v2-cmp-feat">Supported services</span><span><strong>S3 & DynamoDB only</strong></span><span>Most other AWS services</span></div>
            <div className="v2-cmp-row"><span className="v2-cmp-feat">How it works</span><span>Target in the route table</span><span>Elastic Network Interface (ENI) with a private IP</span></div>
            <div className="v2-cmp-row"><span className="v2-cmp-feat">Route table entry?</span><span>✅ Required</span><span>❌ Not required</span></div>
            <div className="v2-cmp-row"><span className="v2-cmp-feat">Powered by</span><span>Gateway</span><span>PrivateLink</span></div>
          </div>
          <div className="v2-note">
            💡 Remember the two <strong>gateway-endpoint</strong> services: <strong>S3</strong> and <strong>DynamoDB</strong>.
            Everything else uses an <strong>interface endpoint</strong>. (A 3rd type, Gateway Load Balancer endpoint, comes with load balancers.)
          </div>
        </div>
      )}

      {tab === "svc" && (
        <div className="v2-ep-body">
          <div className="v2-ep-svc-stage">
            <div className="v2-ep-svc-vpc">
              <div className="v2-ep-svc-h">Service Provider VPC</div>
              <span>💻 EC2 (app on :80)</span>
              <span className="v2-ep-svc-nlb">⚖️ Network Load Balancer</span>
            </div>
            <div className="v2-ep-svc-link">PrivateLink →<br/><small>TCP only</small></div>
            <div className="v2-ep-svc-vpc client">
              <div className="v2-ep-svc-h">Client VPC</div>
              <span>🔌 Interface Endpoint</span>
              <span>💻 client EC2</span>
            </div>
          </div>
          <ul className="v2-ep-svc-points">
            <li><strong>Endpoint Services</strong> expose <strong>one specific service</strong> (e.g. an app on port 80) from a provider VPC to a client VPC — privately.</li>
            <li>Not peering: peering gives <strong>full</strong> two-way access to all resources; endpoint services expose <strong>only the chosen service</strong>.</li>
            <li>Requires a <strong>Network Load Balancer</strong> (or Gateway LB) in the provider VPC.</li>
            <li>Same region only (cross-region needs peering too). <strong>TCP traffic only.</strong></li>
          </ul>
        </div>
      )}
    </div>
  );
}
