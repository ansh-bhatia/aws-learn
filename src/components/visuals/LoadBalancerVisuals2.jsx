import { useState, useEffect } from "react";
import "./LoadBalancerVisuals2.css";

/* ─── 1. VPC INGRESS ROUTING ───────────────────────────────────────── */
export function IngressRoutingDemo() {
  const [applianceUp, setApplianceUp] = useState(true);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = [
    "User opens the web server's public IP (e.g. 1.1.1.1).",
    "Traffic hits the Internet Gateway.",
    "The IGW route table (ingress routing) redirects it to the security appliance — not the server directly.",
    "The firewall inspects the traffic (transparent — IP unchanged).",
    "Approved traffic reaches the web server. Replies return the same path.",
  ];

  useEffect(() => {
    if (!playing) return;
    if (!applianceUp && step >= 2) { setPlaying(false); return; }
    if (step >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [playing, step, applianceUp]);

  const play = () => { setStep(0); setPlaying(true); };
  const blocked = !applianceUp && step >= 2;

  return (
    <div className="sv-card lb2-card">
      <div className="sv-title lb2-title">🧭 VPC Ingress Routing</div>
      <p className="lb2-intro">
        Normally traffic flows straight from the Internet Gateway to your servers — nothing can sit in between.
        <strong> Ingress routing</strong> adds an <strong>IGW route table</strong> that forces all incoming traffic through a
        <strong> transparent third-party firewall</strong> (Palo Alto, Fortinet…) first. This is the foundation of Gateway LB.
      </p>

      <div className="lb2-ingress-flow">
        <div className={`lb2-ing-node ${step === 0 ? "on" : ""}`}>🧑‍💻<span>User</span></div>
        <div className="lb2-ing-arrow">→</div>
        <div className={`lb2-ing-node ${step === 1 ? "on" : ""}`}>🌐<span>Internet GW</span><small>+ ingress route table</small></div>
        <div className="lb2-ing-arrow">→</div>
        <div className={`lb2-ing-node appliance ${step === 2 || step === 3 ? "on" : ""} ${!applianceUp ? "down" : ""}`}>
          {applianceUp ? "🛡️" : "💥"}<span>Firewall<br/>appliance</span>
        </div>
        <div className="lb2-ing-arrow">→</div>
        <div className={`lb2-ing-node ${step === 4 ? "on" : ""}`}>🖥️<span>Web Server</span></div>
      </div>

      <div className={`lb2-ing-detail ${blocked ? "bad" : ""}`}>
        {blocked
          ? "💥 Single appliance is DOWN — it's the only entrance, so ALL servers are unreachable. (This is why you need multiple appliances + a Gateway Load Balancer.)"
          : `${step + 1}/${steps.length} — ${steps[step]}`}
      </div>

      <div className="lb2-ing-controls">
        <button className="lb2-btn" onClick={play}>▶ Send traffic</button>
        <button className="lb2-btn ghost" onClick={() => { setApplianceUp((v) => !v); setStep(0); setPlaying(false); }}>
          {applianceUp ? "💥 Fail the appliance" : "♻️ Recover appliance"}
        </button>
      </div>

      <div className="lb2-note">
        💡 Key setup: an <strong>Internet Gateway route table</strong> (associated with the IGW, no subnet) routes the app
        subnet's CIDR to the appliance's network interface (ENI). You must also disable <strong>source/destination check</strong>
        on the appliance so it can forward traffic it didn't originate.
      </div>
    </div>
  );
}

/* ─── 2. GATEWAY LB TWO-VPC ARCHITECTURE ───────────────────────────── */
export function GWLBArchitecture() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = [
    { n: "user", t: "User sends traffic into the Service Consumer VPC." },
    { n: "ingress", t: "Ingress route table sends app-bound traffic to the GWLB Endpoint." },
    { n: "endpoint", t: "GWLB Endpoint (the 'assistant') forwards across to the GWLB via a PrivateLink endpoint service." },
    { n: "gwlb", t: "Gateway Load Balancer (Service Provider VPC) load-balances to a fleet of security appliances." },
    { n: "appliance", t: "An appliance inspects the packets (Geneve protocol, UDP 6081) and approves." },
    { n: "app", t: "Traffic returns via GWLB → endpoint → the app server. Replies follow the reverse path." },
  ];

  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 1300);
    return () => clearTimeout(t);
  }, [playing, step]);

  const a = steps[step].n;

  return (
    <div className="sv-card lb2-card">
      <div className="sv-title lb2-title">🛡️ Gateway Load Balancer — Two-VPC Architecture</div>
      <p className="lb2-intro">
        Best practice splits this into <strong>two VPCs</strong>: a <strong>Service Provider VPC</strong> holding the GWLB +
        appliance fleet, and one or more <strong>Service Consumer VPCs</strong> with just a <strong>GWLB Endpoint</strong>.
        One central security fleet protects many VPCs — no duplicating firewalls per VPC.
      </p>

      <div className="lb2-gwlb-grid">
        <div className="lb2-gwlb-vpc consumer">
          <div className="lb2-gwlb-vpc-head">Service Consumer VPC</div>
          <div className={`lb2-gwlb-box ${a === "user" ? "on" : ""}`}>🧑‍💻 User</div>
          <div className={`lb2-gwlb-box ${a === "ingress" ? "on" : ""}`}>🧭 Ingress route table</div>
          <div className={`lb2-gwlb-box ${a === "endpoint" ? "on" : ""}`}>🚪 GWLB Endpoint</div>
          <div className={`lb2-gwlb-box ${a === "app" ? "on" : ""}`}>🖥️ App servers</div>
        </div>

        <div className="lb2-gwlb-link">⇄<small>PrivateLink<br/>endpoint service</small></div>

        <div className="lb2-gwlb-vpc provider">
          <div className="lb2-gwlb-vpc-head">Service Provider VPC</div>
          <div className={`lb2-gwlb-box ${a === "gwlb" ? "on" : ""}`}>⚖️ Gateway Load Balancer</div>
          <div className={`lb2-gwlb-box appliance ${a === "appliance" ? "on" : ""}`}>🛡️ Appliance 1</div>
          <div className={`lb2-gwlb-box appliance ${a === "appliance" ? "on" : ""}`}>🛡️ Appliance 2</div>
          <div className="lb2-gwlb-proto">Geneve · UDP 6081</div>
        </div>
      </div>

      <div className="lb2-gwlb-detail"><span className="lb2-gwlb-num">{step + 1}/{steps.length}</span>{steps[step].t}</div>

      <div className="lb2-ing-controls">
        <button className="lb2-btn" onClick={() => { setStep(0); setPlaying(true); }}>▶ Play flow</button>
        <button className="lb2-btn ghost" onClick={() => { setPlaying(false); setStep((s) => Math.min(steps.length - 1, s + 1)); }}>Step →</button>
      </div>

      <div className="lb2-note">
        💡 The GWLB has <strong>no URL/IP</strong> — all traffic reaches it through the <strong>GWLB Endpoint</strong>. Appliances
        must speak the <strong>Geneve</strong> protocol (UDP 6081). Multiple appliances + GWLB give <strong>high availability</strong>
        and <strong>auto-scaling</strong> — if one appliance dies, traffic flips to another.
      </div>
    </div>
  );
}

/* ─── 3. CLASSIC LB vs MODERN (EC2-Classic vs VPC) ─────────────────── */
export function ClassicLBComparison() {
  const [tab, setTab] = useState("compare");

  const rows = [
    ["Network", "Shared with other customers", "Logically isolated (your VPC)"],
    ["IP addressing", "Public IP by default, internet-reachable", "You choose — public/private subnets"],
    ["Security groups", "Inbound only, set at launch (fixed)", "Inbound + outbound, editable anytime"],
    ["Subnets", "❌ Not supported", "✅ Public & private subnets"],
    ["Control", "Limited", "NACLs, SGs, route tables — full control"],
    ["VPN / Direct Connect", "❌ No native support", "✅ Supported"],
  ];

  const timeline = [
    ["Dec 4, 2013", "New accounts became VPC-only (no EC2-Classic unless requested)."],
    ["Oct 30, 2021", "EC2-Classic disabled in regions with no active Classic resources."],
    ["Aug 15, 2022", "Target completion — all EC2-Classic migrated; service retired."],
  ];

  return (
    <div className="sv-card lb2-card">
      <div className="sv-title lb2-title">🗄️ Classic Load Balancer (Previous Generation)</div>
      <p className="lb2-intro">
        The <strong>Classic Load Balancer</strong> was built for the old <strong>EC2-Classic</strong> network (before VPC).
        AWS now marks it <strong>previous generation</strong> and recommends <strong>ALB / NLB</strong>. It won't appear in the
        exam, but may come up in interviews.
      </p>

      <div className="lb2-clb-tabs">
        <button className={`lb2-clb-tab ${tab === "compare" ? "active" : ""}`} onClick={() => setTab("compare")}>EC2-Classic vs VPC</button>
        <button className={`lb2-clb-tab ${tab === "timeline" ? "active" : ""}`} onClick={() => setTab("timeline")}>Retirement Timeline</button>
      </div>

      {tab === "compare" ? (
        <div className="lb2-clb-table">
          <div className="lb2-clb-row head"><span>Aspect</span><span>EC2-Classic</span><span>Amazon VPC</span></div>
          {rows.map(([f, c, v]) => (
            <div key={f} className="lb2-clb-row">
              <span className="lb2-clb-feat">{f}</span>
              <span className="lb2-clb-old">{c}</span>
              <span className="lb2-clb-new">{v}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="lb2-clb-timeline">
          {timeline.map(([d, t], i) => (
            <div key={i} className="lb2-clb-tl-item">
              <span className="lb2-clb-tl-dot" />
              <div><div className="lb2-clb-tl-date">{d}</div><div className="lb2-clb-tl-text">{t}</div></div>
            </div>
          ))}
        </div>
      )}

      <div className="lb2-note">
        💡 Classic LB has no path/host routing, WebSockets, or container support — you'd need one LB per rule. For anything
        new, use <strong>ALB</strong> (Layer 7) or <strong>NLB</strong> (Layer 4). AWS provides migration tooling off Classic LB.
      </div>
    </div>
  );
}
