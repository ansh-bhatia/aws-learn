import { useState } from "react";
import "./VPCVisuals.css";
import "./VPCVisuals4.css";

/* ─── 1. WHY A /25 SUBNET GIVES 123 USABLE IPs ─────────────────────── */
export function ReservedIPExplainer() {
  const [subnet, setSubnet] = useState(0);

  const subnets = [
    { cidr: "192.168.0.0/25", first: "192.168.0.0", host1: "192.168.0.1", host2: "192.168.0.2", host3: "192.168.0.3", last: "192.168.0.127", usableFrom: "192.168.0.4", usableTo: "192.168.0.126" },
    { cidr: "192.168.0.128/25", first: "192.168.0.128", host1: "192.168.0.129", host2: "192.168.0.130", host3: "192.168.0.131", last: "192.168.0.255", usableFrom: "192.168.0.132", usableTo: "192.168.0.254" },
  ];

  const s = subnets[subnet];

  const reserved = [
    { addr: s.first, why: "Network address", who: "Standard networking — always reserved" },
    { addr: s.host1, why: "VPC router", who: "AWS reserves it" },
    { addr: s.host2, why: "DNS", who: "AWS reserves it" },
    { addr: s.host3, why: "Reserved for future use", who: "AWS reserves it" },
    { addr: s.last, why: "Broadcast address", who: "Standard networking — always reserved" },
  ];

  return (
    <div className="viz-card">
      <div className="viz-title">🔢 Why a /25 Subnet Gives You 123 IPs, Not 126</div>
      <p className="vpc4-intro">
        A subnet calculator says a <strong>/25</strong> has <strong>126 usable hosts</strong>. AWS shows{" "}
        <strong>123</strong>. The difference is <strong>three addresses AWS reserves</strong> on top of the two
        that standard networking already takes.
      </p>

      <div className="vpc4-tabs">
        {subnets.map((x, i) => (
          <button key={x.cidr} className={`vpc4-tab ${subnet === i ? "active" : ""}`} onClick={() => setSubnet(i)}>
            {x.cidr}
          </button>
        ))}
      </div>

      <div className="vpc4-reserved">
        {reserved.map((r, i) => (
          <div key={r.addr} className={`vpc4-res-row ${i === 0 || i === 4 ? "std" : "aws"}`}>
            <span className="vpc4-res-addr">{r.addr}</span>
            <span className="vpc4-res-why">{r.why}</span>
            <span className="vpc4-res-who">{r.who}</span>
          </div>
        ))}
      </div>

      <div className="vpc4-math">
        <div className="vpc4-math-row"><span>Total addresses in a /25</span><b>128</b></div>
        <div className="vpc4-math-row"><span>− network + broadcast (standard)</span><b>−2</b></div>
        <div className="vpc4-math-row"><span>− router, DNS, future use (AWS)</span><b>−3</b></div>
        <div className="vpc4-math-row total"><span>Usable in AWS</span><b>123</b></div>
      </div>

      <div className="vpc4-note">
        So your usable range here is <strong>{s.usableFrom} – {s.usableTo}</strong>. Every AWS subnet loses{" "}
        <strong>five</strong> addresses, not the two you might expect from standard networking.
      </div>
    </div>
  );
}

/* ─── 2. INTERNET GATEWAY + ROUTE TABLE ────────────────────────────── */
export function IGWRouteFlow() {
  const [igw, setIgw] = useState(false);
  const [route, setRoute] = useState(false);
  const [publicIp, setPublicIp] = useState(true);

  const works = igw && route && publicIp;
  let blocker = null;
  if (!igw) blocker = "No internet gateway is attached to the VPC. The VPC has no route to the internet at all — like a house with no ISP connection.";
  else if (!route) blocker = "The gateway is attached, but the route table has no entry pointing at it. Traffic reaches the router and stops, because nothing tells it where to send 0.0.0.0/0.";
  else if (!publicIp) blocker = "Everything is wired up, but this instance has NO PUBLIC IP. The internet gateway only works with instances that have one — so there is no inbound AND no outbound connectivity.";

  return (
    <div className="viz-card">
      <div className="viz-title">🌐 Internet Gateway &amp; Route Table — All Three Are Required</div>
      <p className="vpc4-intro">
        A default VPC has all of this pre-wired. Build your own and you must add each piece yourself. Toggle
        them to see what breaks.
      </p>

      <div className="vpc4-toggles">
        <button className={`vpc4-toggle ${igw ? "on" : ""}`} onClick={() => setIgw((v) => !v)}>
          <span className="vpc4-toggle-dot" /> Internet gateway attached
        </button>
        <button className={`vpc4-toggle ${route ? "on" : ""}`} onClick={() => setRoute((v) => !v)}>
          <span className="vpc4-toggle-dot" /> Route 0.0.0.0/0 → IGW
        </button>
        <button className={`vpc4-toggle ${publicIp ? "on" : ""}`} onClick={() => setPublicIp((v) => !v)}>
          <span className="vpc4-toggle-dot" /> Instance has a public IP
        </button>
      </div>

      <div className="vpc4-chain">
        <div className={`vpc4-hop ${publicIp ? "on" : "off"}`}>
          🖥️ EC2<small>{publicIp ? "public + private IP" : "private IP only"}</small>
        </div>
        <span className={`vpc4-arr ${route ? "on" : ""}`}>→</span>
        <div className={`vpc4-hop ${route ? "on" : "off"}`}>
          🧭 Route table<small>{route ? "0.0.0.0/0 → igw" : "no internet route"}</small>
        </div>
        <span className={`vpc4-arr ${igw ? "on" : ""}`}>→</span>
        <div className={`vpc4-hop ${igw ? "on" : "off"}`}>
          🚪 Internet gateway<small>{igw ? "attached to VPC" : "detached"}</small>
        </div>
        <span className={`vpc4-arr ${works ? "on" : ""}`}>→</span>
        <div className={`vpc4-hop ${works ? "on" : "off"}`}>🌍 Internet</div>
      </div>

      <div className={`vpc4-verdict ${works ? "ok" : "bad"}`}>
        {works
          ? "✅ Connected. You can SSH in from your office, and the instance can reach Google."
          : "❌ " + blocker}
      </div>

      <div className="vpc4-note">
        <strong>Pricing:</strong> the internet gateway itself is <strong>free</strong>, is{" "}
        <strong>highly available</strong>, and gives virtually unlimited bandwidth. You pay for bandwidth on
        the resource's own bill — and <strong>inbound traffic to AWS is always free</strong>. You only pay for{" "}
        <strong>outbound</strong>.
      </div>
    </div>
  );
}
