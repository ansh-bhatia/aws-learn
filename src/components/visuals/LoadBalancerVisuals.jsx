import { useState, useEffect } from "react";
import "./LoadBalancerVisuals.css";

/* ─── 1. LOAD BALANCER BASICS (public LB → private EC2 + health) ───── */
export function LoadBalancerBasics() {
  const [up, setUp] = useState([true, true]);
  const [reqTarget, setReqTarget] = useState(0);

  const healthy = up.map(Boolean);
  const anyUp = healthy.some(Boolean);

  const sendRequest = () => {
    // round-robin among healthy
    const live = [0, 1].filter((i) => up[i]);
    if (!live.length) return;
    setReqTarget((t) => {
      const next = live.find((i) => i > t);
      return next !== undefined ? next : live[0];
    });
  };

  return (
    <div className="sv-card lb-card">
      <div className="sv-title lb-title">⚖️ How a Load Balancer Works</div>
      <p className="lb-intro">
        The load balancer sits in the <strong>public subnet</strong> with a URL; your EC2 instances hide safely in
        <strong> private subnets</strong> (no public IP needed). It spreads traffic and uses <strong>health checks</strong> to
        skip dead servers. Toggle a server and send requests.
      </p>

      <div className="lb-basics-stage">
        <div className="lb-internet">🌐 Internet user</div>
        <div className="lb-arrow-down">⬇ request to LB URL</div>

        <div className="lb-public-zone">
          <span className="lb-zone-tag public">PUBLIC SUBNET</span>
          <div className="lb-lb-box">⚖️ Load Balancer<span className="lb-lb-url">alb-xxxx.elb.amazonaws.com</span></div>
        </div>

        <div className="lb-fan">
          {[0, 1].map((i) => (
            <div key={i} className={`lb-fan-line ${reqTarget === i && up[i] ? "active" : ""} ${!up[i] ? "dead" : ""}`} />
          ))}
        </div>

        <div className="lb-private-zone">
          <span className="lb-zone-tag private">PRIVATE SUBNETS</span>
          <div className="lb-servers">
            {[0, 1].map((i) => (
              <div key={i} className={`lb-server ${up[i] ? "up" : "down"} ${reqTarget === i && up[i] ? "serving" : ""}`}>
                <div className="lb-server-icon">{up[i] ? "🖥️" : "💥"}</div>
                <div className="lb-server-name">Web Server {i + 1}</div>
                <div className={`lb-server-health ${up[i] ? "h" : "u"}`}>{up[i] ? "● Healthy" : "● Unhealthy"}</div>
                <button className="lb-server-btn" onClick={() => setUp(up.map((u, j) => j === i ? !u : u))}>
                  {up[i] ? "Power off" : "Power on"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lb-basics-controls">
        <button className="lb-send-btn" onClick={sendRequest} disabled={!anyUp}>▶ Send request</button>
        <span className="lb-basics-status">
          {anyUp ? `Routed to Web Server ${reqTarget + 1} (healthy only)` : "⚠️ All servers down — 502 Bad Gateway"}
        </span>
      </div>

      <div className="lb-note">
        💡 Benefits: spread load across instances, keep instances <strong>private</strong> (LB is the only public door),
        auto-remove unhealthy targets, and offload HTTPS. More flexible than load-balancing with Route 53 alone.
      </div>
    </div>
  );
}

/* ─── 2. LB TERMINOLOGY (listener → target group) ──────────────────── */
export function LBTerminology() {
  const [listenerPort, setListenerPort] = useState(80);
  const [targetPort, setTargetPort] = useState(80);

  return (
    <div className="sv-card lb-card">
      <div className="sv-title lb-title">🧩 Load Balancer Terminology</div>
      <p className="lb-intro">
        A <strong>listener</strong> watches a port for incoming traffic, then forwards to a <strong>target group</strong>
        (the backend instances), which is monitored by a <strong>health check</strong>. The listener and target ports can differ.
      </p>

      <div className="lb-term-flow">
        <div className="lb-term-box internet">🌐<span>Client</span></div>
        <div className="lb-term-pipe">
          <span className="lb-term-pipe-label">listener :{listenerPort}</span>
          <span className="lb-term-packet">📦</span>
        </div>
        <div className="lb-term-box lb">⚖️<span>Load Balancer</span><small>{listenerPort === 443 ? "🔒 HTTPS offload" : "HTTP"}</small></div>
        <div className="lb-term-pipe">
          <span className="lb-term-pipe-label">forward :{targetPort}</span>
          <span className="lb-term-packet">📦</span>
        </div>
        <div className="lb-term-box tg">🎯<span>Target Group</span><small>health: HTTP</small></div>
      </div>

      <div className="lb-term-controls">
        <div className="lb-term-ctrl">
          <span>Listener port</span>
          <div className="lb-term-btns">
            <button className={listenerPort === 80 ? "on" : ""} onClick={() => setListenerPort(80)}>80 (HTTP)</button>
            <button className={listenerPort === 443 ? "on" : ""} onClick={() => setListenerPort(443)}>443 (HTTPS)</button>
          </div>
        </div>
        <div className="lb-term-ctrl">
          <span>Target port</span>
          <div className="lb-term-btns">
            {[80, 8080].map((p) => <button key={p} className={targetPort === p ? "on" : ""} onClick={() => setTargetPort(p)}>{p}</button>)}
          </div>
        </div>
      </div>

      <div className="lb-term-glossary">
        {[
          ["Listener", "Checks for connection requests on a configured protocol & port (HTTP:80 / HTTPS:443)."],
          ["Target Group", "The backend resources: EC2 instances, IPs, Lambda, or another ALB."],
          ["Health Check", "Probes targets; default protocol is HTTP. Unhealthy targets are removed from rotation."],
          ["Internet-facing vs Internal", "Internet-facing has a public DNS for the world; internal is reachable only inside the VPC."],
          ["HTTPS Offload", "The LB terminates TLS so your EC2 instances don't need certificates installed."],
        ].map(([t, d]) => (
          <div key={t} className="lb-term-item"><span className="lb-term-t">{t}</span><span className="lb-term-d">{d}</span></div>
        ))}
      </div>

      <div className="lb-note">
        💡 Exam: the <strong>default health-check protocol is HTTP</strong>. HTTPS on the listener lets the LB handle
        encryption — Route 53 can't do that.
      </div>
    </div>
  );
}

/* ─── 3. LB TYPE COMPARISON ────────────────────────────────────────── */
export function LBTypeComparison() {
  const [sel, setSel] = useState("alb");

  const types = {
    alb: { name: "Application LB", layer: "Layer 7", color: "#8c4fff", proto: "HTTP, HTTPS, gRPC", icon: "🌐",
      best: "Web apps needing smart routing (path/host based).",
      facts: ["Routes on URL path & host", "HTTPS offload (SSL termination)", "Sticky sessions ✅", "Idle connection timeout ✅", "Static IP ❌", "Cross-zone always ON"] },
    nlb: { name: "Network LB", layer: "Layer 4", color: "#3fb950", proto: "TCP, UDP, TLS", icon: "⚡",
      best: "Extreme performance — gaming, millions of req/s, ultra-low latency.",
      facts: ["Millions of requests/sec", "Ultra-low latency", "Routes on source-IP hash", "Sticky sessions ✅", "No idle timeout", "Static IP ✅ (Elastic IP)", "Cross-zone OFF by default"] },
    glb: { name: "Gateway LB", layer: "Layer 3", color: "#e3b341", proto: "IP packets", icon: "🛡️",
      best: "Insert virtual appliances (firewalls, IDS/IPS) inline.",
      facts: ["Routes raw IP packets", "For Palo Alto / Fortinet / Sophos appliances", "Needs a GWLB Endpoint", "Health-checks appliances", "No URL logic (pure routing)"] },
    clb: { name: "Classic LB", layer: "Layer 4 & 7", color: "#8b949e", proto: "HTTP, HTTPS, TCP", icon: "🗄️",
      best: "Legacy only — previous generation, avoid for new builds.",
      facts: ["Previous generation", "No path/host routing (needs one LB per rule)", "Being phased out", "Prefer ALB or NLB"] },
  };
  const t = types[sel];

  return (
    <div className="sv-card lb-card">
      <div className="sv-title lb-title">🔀 The 4 Load Balancer Types</div>

      <div className="lb-type-tabs">
        {Object.keys(types).map((k) => (
          <button key={k} className={`lb-type-tab ${sel === k ? "active" : ""}`} style={{ "--tc": types[k].color }} onClick={() => setSel(k)}>
            <span className="lb-type-tab-icon">{types[k].icon}</span>
            <span className="lb-type-tab-name">{types[k].name}</span>
            <span className="lb-type-tab-layer">{types[k].layer}</span>
          </button>
        ))}
      </div>

      <div className="lb-type-detail" style={{ "--tc": t.color }}>
        <div className="lb-type-head">
          <span className="lb-type-big">{t.icon}</span>
          <div>
            <div className="lb-type-name">{t.name}</div>
            <div className="lb-type-meta">{t.layer} · {t.proto}</div>
          </div>
        </div>
        <div className="lb-type-best">🎯 {t.best}</div>
        <div className="lb-type-facts">
          {t.facts.map((f, i) => <span key={i} className="lb-type-fact">{f}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ─── 4. ALB ROUTING (path vs host) ────────────────────────────────── */
export function ALBRouting() {
  const [mode, setMode] = useState("path");
  const [choice, setChoice] = useState(0);

  const data = {
    path: {
      urls: ["cloudfox.in/", "cloudfox.in/aws", "cloudfox.in/azure"],
      targets: ["Root target", "AWS target", "Azure target"],
      colors: ["#db61a2", "#3fb950", "#2e73b8"],
      note: "Path-based routing uses the URL path after the slash. Easy DNS — one record. One certificate covers all paths.",
    },
    host: {
      urls: ["cloudfox.in", "aws.cloudfox.in", "azure.cloudfox.in"],
      targets: ["Root target", "AWS target", "Azure target"],
      colors: ["#db61a2", "#3fb950", "#2e73b8"],
      note: "Host-based routing uses the subdomain (hostname). Needs a DNS record per host, and possibly multiple certificates.",
    },
  };
  const d = data[mode];

  return (
    <div className="sv-card lb-card">
      <div className="sv-title lb-title">🧭 ALB Routing — Path-based vs Host-based</div>
      <p className="lb-intro">
        One ALB can forward to different targets by URL — no need for multiple load balancers. <strong>Slash = path</strong>,
        <strong> subdomain = host</strong>.
      </p>

      <div className="lb-route-switch">
        <button className={`lb-route-btn ${mode === "path" ? "active" : ""}`} onClick={() => { setMode("path"); setChoice(0); }}>Path-based (/aws)</button>
        <button className={`lb-route-btn ${mode === "host" ? "active" : ""}`} onClick={() => { setMode("host"); setChoice(0); }}>Host-based (aws.)</button>
      </div>

      <div className="lb-route-urls">
        {d.urls.map((u, i) => (
          <button key={i} className={`lb-route-url ${choice === i ? "active" : ""}`} onClick={() => setChoice(i)}>{u}</button>
        ))}
      </div>

      <div className="lb-route-diagram">
        <div className="lb-route-req">🌐 {d.urls[choice]}</div>
        <div className="lb-route-alb">⚖️ Single ALB<small>1 listener · rules</small></div>
        <div className="lb-route-targets">
          {d.targets.map((tg, i) => (
            <div key={i} className={`lb-route-target ${choice === i ? "hit" : ""}`} style={{ "--rc": d.colors[i] }}>
              <span>🎯 {tg}</span>
              {choice === i && <span className="lb-route-hit-flag">⬅ routed here</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="lb-note">💡 {d.note}</div>
    </div>
  );
}

/* ─── 5. CROSS-ZONE LOAD BALANCING ─────────────────────────────────── */
export function CrossZoneLB() {
  const [on, setOn] = useState(false);
  // AZ-A has 2 targets, AZ-B has 8 targets (the lecture's uneven example)
  const azA = 2, azB = 8;

  // Without cross-zone: each LB node gets 50%, split within its own AZ
  // With cross-zone: every target gets equal share of 100%
  const total = azA + azB;
  const perA = on ? (100 / total) : (50 / azA);
  const perB = on ? (100 / total) : (50 / azB);

  return (
    <div className="sv-card lb-card">
      <div className="sv-title lb-title">🔄 Cross-Zone Load Balancing</div>
      <p className="lb-intro">
        The LB has a node in each AZ; incoming traffic splits 50/50 across nodes. <strong>Cross-zone OFF</strong>: a node
        only serves targets in <em>its own AZ</em> (uneven if AZs have different counts). <strong>ON</strong>: any node serves
        <em> any</em> target — perfectly even.
      </p>

      <div className="lb-cz-switch">
        <button className={`lb-cz-btn ${!on ? "active bad" : ""}`} onClick={() => setOn(false)}>Cross-zone OFF</button>
        <button className={`lb-cz-btn ${on ? "active good" : ""}`} onClick={() => setOn(true)}>Cross-zone ON</button>
      </div>

      <div className="lb-cz-stage">
        <div className="lb-cz-az">
          <div className="lb-cz-az-head">AZ-A · node gets 50%</div>
          <div className="lb-cz-targets">
            {Array.from({ length: azA }).map((_, i) => (
              <div key={i} className="lb-cz-target" style={{ "--share": perA }}>
                <div className="lb-cz-bar" style={{ height: `${perA * 4}px` }} />
                <span className="lb-cz-pct">{perA.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lb-cz-az">
          <div className="lb-cz-az-head">AZ-B · node gets 50%</div>
          <div className="lb-cz-targets">
            {Array.from({ length: azB }).map((_, i) => (
              <div key={i} className="lb-cz-target">
                <div className="lb-cz-bar" style={{ height: `${perB * 4}px` }} />
                <span className="lb-cz-pct">{perB.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`lb-cz-verdict ${on ? "good" : "bad"}`}>
        {on
          ? `✅ ON: all ${total} targets get an equal ${perA.toFixed(1)}% — fair distribution.`
          : `⚠️ OFF: AZ-A's ${azA} targets are overloaded at ${perA.toFixed(1)}% each, while AZ-B's ${azB} targets idle at ${perB.toFixed(1)}%.`}
      </div>

      <div className="lb-note">
        💡 Defaults: <strong>ALB → always ON</strong>. <strong>NLB & GLB → OFF by default</strong> (enable later via Edit
        attributes). Enable it when your AZs have differing numbers of equally-sized targets.
      </div>
    </div>
  );
}

/* ─── 6. GATEWAY LB TRAFFIC FLOW ───────────────────────────────────── */
export function GatewayLBFlow() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = [
    { node: "user", text: "User sends traffic to the GWLB Endpoint." },
    { node: "endpoint", text: "The GWLB Endpoint forwards it to the Gateway Load Balancer." },
    { node: "glb", text: "GWLB sends the packets to a security appliance (e.g. Palo Alto firewall)." },
    { node: "appliance", text: "The appliance inspects the traffic and approves it." },
    { node: "glb", text: "Approved traffic returns to GWLB → endpoint." },
    { node: "app", text: "Clean traffic finally reaches the application server." },
  ];

  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 1200);
    return () => clearTimeout(t);
  }, [playing, step]);

  const active = steps[step].node;

  return (
    <div className="sv-card lb-card">
      <div className="sv-title lb-title">🛡️ Gateway Load Balancer — Inline Security</div>
      <p className="lb-intro">
        A <strong>Layer 3</strong> LB that routes raw IP packets through <strong>virtual appliances</strong> (firewalls,
        IDS/IPS like Palo Alto, Fortinet). It needs two parts: the <strong>GWLB</strong> and a <strong>GWLB Endpoint</strong>.
        Play the flow.
      </p>

      <div className="lb-glb-stage">
        <div className={`lb-glb-node ${active === "user" ? "on" : ""}`}>🧑‍💻<span>User</span></div>
        <div className="lb-glb-arrow">→</div>
        <div className={`lb-glb-node ${active === "endpoint" ? "on" : ""}`}>🚪<span>GWLB Endpoint</span></div>
        <div className="lb-glb-arrow">→</div>
        <div className={`lb-glb-node ${active === "glb" ? "on" : ""}`}>⚖️<span>Gateway LB</span></div>
        <div className="lb-glb-arrow">↕</div>
        <div className={`lb-glb-node appliance ${active === "appliance" ? "on" : ""}`}>🛡️<span>Security Appliance<br/>(Palo Alto)</span></div>
        <div className="lb-glb-arrow">→</div>
        <div className={`lb-glb-node ${active === "app" ? "on" : ""}`}>🖥️<span>App Server</span></div>
      </div>

      <div className="lb-glb-detail">
        <span className="lb-glb-step-num">{step + 1}/{steps.length}</span>
        {steps[step].text}
      </div>

      <div className="lb-glb-controls">
        <button className="lb-send-btn" onClick={() => { setStep(0); setPlaying(true); }}>▶ Play traffic flow</button>
        <button className="lb-glb-step-btn" onClick={() => { setPlaying(false); setStep((s) => Math.min(steps.length - 1, s + 1)); }}>Step →</button>
      </div>

      <div className="lb-note">
        💡 Unlike ALB/NLB, a GWLB lets you insert third-party <strong>firewalls inline</strong> to inspect all inbound &
        outbound VPC traffic — bringing your existing Palo Alto / Fortinet skills & licenses (BYOL) into AWS.
      </div>
    </div>
  );
}
