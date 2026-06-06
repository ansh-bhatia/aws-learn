import { useState, useEffect } from "react";
import "./Route53Visuals.css";

/* ─── 1. DNS RESOLUTION FLOW (animated journey) ────────────────────── */
export function DNSResolutionFlow() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cached, setCached] = useState(false);

  const steps = [
    { icon: "💻", label: "Your Device", sub: "types www.facebook.com", detail: "You enter a name in the browser. Computers connect by IP, not names — so the name must be resolved first." },
    { icon: "📨", label: "DNS Resolver", sub: "your ISP's resolver", detail: "Your ISP gives you a resolver IP (with your DHCP lease). It receives the query. If it has the answer cached, it replies instantly — otherwise it asks upstream." },
    { icon: "🌍", label: "Root Server", sub: "13 root servers worldwide", detail: "The resolver asks a root server. Root doesn't know the IP, but sees the .com TLD and points to the .com TLD servers." },
    { icon: "🏷️", label: "TLD Server", sub: ".com / .in / .org", detail: "The TLD server doesn't know the IP either, but returns the address of the domain's authoritative name server." },
    { icon: "📋", label: "Authoritative Server", sub: "Route 53 hosted zone", detail: "The authoritative server (Route 53!) holds the real records. It returns the IP address, e.g. 7.5.8.9." },
    { icon: "✅", label: "Connected", sub: "browser → 7.5.8.9", detail: "The resolver caches the answer and hands the IP back to your device, which connects to the web server. Next time, the cache answers instantly." },
  ];

  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [playing, step]);

  const play = () => {
    if (cached) { setStep(1); setTimeout(() => setStep(5), 600); return; }
    setStep(0); setPlaying(true);
  };

  return (
    <div className="sv-card r53-card">
      <div className="sv-title r53-title">🌐 How DNS Resolves a Name — The Journey</div>
      <p className="r53-intro">
        DNS is the <strong>phonebook of the internet</strong> — it turns a name like <code>www.facebook.com</code> into
        an IP address. Watch a query travel through the hierarchy. Route 53 is the <strong>authoritative</strong> server.
      </p>

      <div className="r53-flow-controls">
        <button className="r53-play" onClick={play}>▶ Resolve {cached ? "(cached)" : ""}</button>
        <label className="r53-cache-toggle">
          <input type="checkbox" checked={cached} onChange={(e) => { setCached(e.target.checked); setStep(0); }} />
          Simulate cached result
        </label>
      </div>

      <div className="r53-flow">
        {steps.map((s, i) => (
          <div key={i} className="r53-flow-item">
            <div className={`r53-node ${step === i ? "active" : step > i ? "done" : ""}`} onClick={() => { setPlaying(false); setStep(i); }}>
              <div className="r53-node-icon">{s.icon}</div>
              <div className="r53-node-label">{s.label}</div>
              <div className="r53-node-sub">{s.sub}</div>
            </div>
            {i < steps.length - 1 && <div className={`r53-flow-arrow ${step > i ? "lit" : ""}`}>→</div>}
          </div>
        ))}
      </div>

      <div className="r53-flow-detail">
        <span className="r53-flow-detail-icon">{steps[step].icon}</span>
        <div><strong>{steps[step].label}.</strong> {steps[step].detail}</div>
      </div>
    </div>
  );
}

/* ─── 2. FQDN ANATOMY ──────────────────────────────────────────────── */
export function FQDNAnatomy() {
  const [hover, setHover] = useState(null);

  const parts = [
    { id: "label", text: "learn", color: "#3fb950", name: "Host / DNS Label", desc: "The leftmost part — the specific host. Max 63 characters per label." },
    { id: "sub", text: "cloudfox", color: "#2e73b8", name: "Subdomain", desc: "The registered domain name you own." },
    { id: "tld", text: "in", color: "#8c4fff", name: "Top-Level Domain (TLD)", desc: "Fixed set: .com, .in, .org, .net, .live… You can't invent your own." },
  ];

  return (
    <div className="sv-card r53-card">
      <div className="sv-title r53-title">🏷️ Anatomy of a Domain Name (FQDN)</div>
      <p className="r53-intro">
        A <strong>Fully Qualified Domain Name</strong> reads right-to-left in hierarchy. Max <strong>255 characters</strong> total.
        Hover each part.
      </p>

      <div className="r53-fqdn">
        {parts.map((p, i) => (
          <span key={p.id} className="r53-fqdn-wrap">
            <span
              className={`r53-fqdn-part ${hover === p.id ? "hov" : ""}`}
              style={{ "--fc": p.color }}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
            >
              {p.text}
            </span>
            {i < parts.length - 1 && <span className="r53-fqdn-dot">.</span>}
          </span>
        ))}
      </div>

      <div className="r53-fqdn-cards">
        {parts.map((p) => (
          <div key={p.id} className={`r53-fqdn-card ${hover === p.id ? "hov" : ""}`} style={{ "--fc": p.color }}
            onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)}>
            <div className="r53-fqdn-card-name">{p.name}</div>
            <div className="r53-fqdn-card-desc">{p.desc}</div>
          </div>
        ))}
      </div>

      <div className="r53-note">
        💡 Route 53 is named after <strong>port 53</strong> — the TCP/UDP port DNS uses.
      </div>
    </div>
  );
}

/* ─── 3. DNS RECORD TYPES ──────────────────────────────────────────── */
export function DNSRecordTypes() {
  const [sel, setSel] = useState("A");

  const records = {
    A: { name: "A Record", color: "#3fb950", maps: "Name → IPv4", ex: "learn.cloudfox.in → 43.204.0.23", use: "The main record for a website on IPv4. The fundamental name-to-IP mapping." },
    AAAA: { name: "AAAA Record", color: "#2e73b8", maps: "Name → IPv6", ex: "learn.cloudfox.in → 2406:da00::1", use: "Same purpose as A, but for IPv6 addresses." },
    CNAME: { name: "CNAME Record", color: "#8c4fff", maps: "Name → another Name", ex: "test.cloudfox.in → learn.cloudfox.in", use: "Alias one name to another. Change the target's IP once and all CNAMEs follow." },
    MX: { name: "MX Record", color: "#e3b341", maps: "Domain → Mail server", ex: "cloudfox.in → mail.cloudfox.in", use: "Tells senders where to deliver email. No MX = you can't receive mail." },
    TXT: { name: "TXT Record", color: "#f0883e", maps: "Name → free text", ex: "\"owner=Bhavesh\" / verification", use: "Arbitrary text — domain verification for tools, ownership info, SPF/DKIM data." },
    PTR: { name: "PTR Record", color: "#db61a2", maps: "IP → Name (reverse)", ex: "43.204.0.23 → learn.cloudfox.in", use: "Reverse of an A record. Used in reverse DNS lookups (e.g. mail server checks)." },
    SRV: { name: "SRV Record", color: "#56d4dd", maps: "Service → host:port", ex: "_ldap._tcp → dc1:389", use: "Application-specific. e.g. Active Directory clients find domain controllers via SRV." },
    SPF: { name: "SPF Record", color: "#f85149", maps: "Domain → allowed mail IPs", ex: "v=spf1 ip4:1.2.3.4 -all", use: "Lists which servers may send mail for your domain — anti-spoofing / anti-phishing." },
  };
  const r = records[sel];

  return (
    <div className="sv-card r53-card">
      <div className="sv-title r53-title">📇 DNS Record Types</div>

      <div className="r53-rec-tabs">
        {Object.keys(records).map((k) => (
          <button key={k} className={`r53-rec-tab ${sel === k ? "active" : ""}`} style={{ "--rc": records[k].color }} onClick={() => setSel(k)}>
            {k}
          </button>
        ))}
      </div>

      <div className="r53-rec-detail" style={{ "--rc": r.color }}>
        <div className="r53-rec-name">{r.name}</div>
        <div className="r53-rec-maps">{r.maps}</div>
        <div className="r53-rec-ex"><code>{r.ex}</code></div>
        <div className="r53-rec-use">{r.use}</div>
      </div>

      <div className="r53-note">
        💡 Most websites just need an <strong>A record</strong>. <strong>CNAME</strong> for aliases, <strong>MX</strong> for
        email. There's also <strong>Alias</strong> (AWS-specific) to point at ELB / CloudFront / S3 — covered with those services.
      </div>
    </div>
  );
}

/* ─── 4. ROUTING POLICY OVERVIEW ───────────────────────────────────── */
export function RoutingPolicyOverview() {
  const [sel, setSel] = useState(0);

  const policies = [
    { name: "Simple", icon: "➡️", mode: "—", desc: "One record, one (or more values returned at random for a single record). No health checks. The basic default.", when: "A single resource, no special logic." },
    { name: "Weighted", icon: "⚖️", mode: "Active-Active", desc: "Split traffic across resources by weight (0–255). e.g. 50/50, or 60/25/15. Great for A/B testing & gradual rollouts.", when: "Distribute load by proportion." },
    { name: "Latency", icon: "⚡", mode: "Active-Active", desc: "Routes to the region with the LOWEST latency for the user — not the nearest in km, but the fastest network path.", when: "Global apps optimising for speed." },
    { name: "Geolocation", icon: "🗺️", mode: "Active-Active", desc: "Routes by the user's COUNTRY/continent. India → India server, US → US server, everyone else → a default record.", when: "Localised content, legal/compliance." },
    { name: "Geoproximity", icon: "📍", mode: "Active-Active", desc: "Routes by geographic distance, adjustable with a 'bias' to grow/shrink a region's coverage. Needs a Traffic Policy ($50/mo).", when: "Fine-grained control over regional reach." },
    { name: "Failover", icon: "🔁", mode: "Active-Passive", desc: "The ONLY active-passive policy. Primary serves all traffic; if its health check fails, traffic flips to the secondary.", when: "Disaster recovery / standby setups." },
    { name: "Multivalue", icon: "🎲", mode: "Active-Active", desc: "Returns up to 8 healthy records at once, in round-robin. Client picks one. Simple load spreading with health checks.", when: "Spread load across many endpoints." },
    { name: "IP-based", icon: "🧭", mode: "Active-Active", desc: "Routes by the resolver's SOURCE IP (CIDR collections). e.g. ISP-A's IPs → server 1. Useful for session affinity & cost.", when: "Route by known client IP ranges." },
  ];
  const p = policies[sel];

  return (
    <div className="sv-card r53-card">
      <div className="sv-title r53-title">🧭 The 8 Routing Policies</div>
      <p className="r53-intro">
        Route 53's superpower. Most are <strong>active-active</strong> (use all resources); only <strong>Failover</strong> is
        <strong> active-passive</strong>.
      </p>

      <div className="r53-pol-grid">
        {policies.map((pol, i) => (
          <button key={i} className={`r53-pol-chip ${sel === i ? "active" : ""}`} onClick={() => setSel(i)}>
            <span className="r53-pol-chip-icon">{pol.icon}</span>
            <span className="r53-pol-chip-name">{pol.name}</span>
          </button>
        ))}
      </div>

      <div className="r53-pol-detail">
        <div className="r53-pol-head">
          <span className="r53-pol-big">{p.icon}</span>
          <div>
            <div className="r53-pol-name">{p.name} Routing</div>
            <span className={`r53-pol-mode ${p.mode === "Active-Passive" ? "passive" : p.mode === "—" ? "" : "active"}`}>{p.mode}</span>
          </div>
        </div>
        <div className="r53-pol-desc">{p.desc}</div>
        <div className="r53-pol-when">🎯 Use when: {p.when}</div>
      </div>
    </div>
  );
}

/* ─── 5. WEIGHTED ROUTING CALCULATOR (live pie) ────────────────────── */
export function WeightedRoutingCalculator() {
  const [w, setW] = useState([120, 50, 30]);
  const colors = ["#8c4fff", "#3fb950", "#e3b341"];
  const names = ["Web Server 1", "Web Server 2", "Web Server 3"];
  const total = w.reduce((a, b) => a + b, 0) || 1;
  const pct = w.map((x) => (x / total) * 100);

  // pie slices
  let acc = 0;
  const slices = pct.map((p, i) => {
    const start = acc / 100 * 360;
    acc += p;
    const end = acc / 100 * 360;
    const large = end - start > 180 ? 1 : 0;
    const r = 70, cx = 80, cy = 80;
    const x1 = cx + r * Math.cos((start - 90) * Math.PI / 180);
    const y1 = cy + r * Math.sin((start - 90) * Math.PI / 180);
    const x2 = cx + r * Math.cos((end - 90) * Math.PI / 180);
    const y2 = cy + r * Math.sin((end - 90) * Math.PI / 180);
    return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`} fill={colors[i]} opacity="0.85" />;
  });

  return (
    <div className="sv-card r53-card">
      <div className="sv-title r53-title">⚖️ Weighted Routing — Live Calculator</div>
      <p className="r53-intro">
        Traffic share = <code>thisWeight / totalWeight × 100</code>. Weights are 0–255 (0 = off). Drag the sliders.
      </p>

      <div className="r53-weight-layout">
        <svg width="160" height="160" className="r53-pie">{slices}</svg>
        <div className="r53-weight-sliders">
          {w.map((val, i) => (
            <div key={i} className="r53-weight-row" style={{ "--wc": colors[i] }}>
              <span className="r53-weight-name">{names[i]}</span>
              <input type="range" min="0" max="255" value={val} onChange={(e) => setW(w.map((x, j) => j === i ? +e.target.value : x))} />
              <span className="r53-weight-val">w={val}</span>
              <span className="r53-weight-pct">{pct[i].toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="r53-note">
        💡 Total weight = {total}. Example: weights 120/50/30 → 60% / 25% / 15%. Set a weight to <strong>0</strong> to take a
        server out of rotation.
      </div>
    </div>
  );
}

/* ─── 6. HEALTH CHECK DEMO ─────────────────────────────────────────── */
export function HealthCheckDemo() {
  const [up, setUp] = useState([true, true]);
  const ips = ["43.204.0.23", "13.126.197.174"];
  const healthy = up.map((u) => u);
  const anyHealthy = healthy.some(Boolean);

  // simulate which IPs Route 53 returns
  const returned = ips.filter((_, i) => up[i]);

  return (
    <div className="sv-card r53-card">
      <div className="sv-title r53-title">🩺 Health Checks — Don't Route to Dead Servers</div>
      <p className="r53-intro">
        Without health checks, Route 53 keeps handing out a <strong>dead server's IP</strong> — half your users fail.
        Health checks send probe packets; unhealthy servers are removed from answers. Toggle a server's power.
      </p>

      <div className="r53-hc-stage">
        {ips.map((ip, i) => (
          <div key={i} className={`r53-hc-server ${up[i] ? "up" : "down"}`}>
            <div className="r53-hc-server-icon">{up[i] ? "🟢" : "🔴"}</div>
            <div className="r53-hc-server-name">Web Server {i + 1}</div>
            <div className="r53-hc-server-ip">{ip}</div>
            <div className={`r53-hc-status ${up[i] ? "h" : "u"}`}>{up[i] ? "Healthy" : "Unhealthy"}</div>
            <button className="r53-hc-toggle" onClick={() => setUp(up.map((u, j) => j === i ? !u : u))}>
              {up[i] ? "⏻ Power off (remove port 80)" : "⏻ Power on"}
            </button>
          </div>
        ))}
      </div>

      <div className="r53-hc-answer">
        <div className="r53-hc-answer-label">Route 53 returns for <code>learn.cloudfox.in</code>:</div>
        {anyHealthy
          ? <div className="r53-hc-answer-ips">{returned.map((ip) => <span key={ip} className="r53-hc-ip-chip">{ip}</span>)}</div>
          : <div className="r53-hc-answer-fail">⚠️ All servers down — no healthy answer!</div>}
      </div>

      <div className="r53-note">
        💡 Attach a health check to each record. It's mandatory with Weighted / Failover / Multivalue so traffic only goes
        to live servers. Lower the record <strong>TTL</strong> so clients pick up changes faster.
      </div>
    </div>
  );
}

/* ─── 7. GEOPROXIMITY BIAS ─────────────────────────────────────────── */
export function GeoproximityBias() {
  const [bias, setBias] = useState(0); // -100..100 applied to Mumbai

  // Two regions on a simple horizontal line of cities; boundary shifts with bias.
  const cities = ["Surat", "Nashik", "Pune", "Kolhapur", "Solapur", "Nanded", "Hubli"];
  // base boundary index ~ between Kolhapur(3) and Solapur(4); bias shifts it
  const boundary = 3.5 + (bias / 100) * 3; // positive bias grows Mumbai coverage to the right

  return (
    <div className="sv-card r53-card">
      <div className="sv-title r53-title">📍 Geoproximity — Bias Slider</div>
      <p className="r53-intro">
        Geoproximity routes by distance to a region, but <strong>bias</strong> lets you grow or shrink a region's reach —
        your conscious business decision. Drag the bias for <strong>Mumbai</strong> and watch the boundary move.
      </p>

      <div className="r53-geo-regions">
        <span className="r53-geo-tag mumbai">🟣 Mumbai (5.5.5.5)</span>
        <span className="r53-geo-tag hyd">🟢 Hyderabad (10.10.10.100)</span>
      </div>

      <div className="r53-geo-map">
        {cities.map((c, i) => {
          const inMumbai = i < boundary;
          return (
            <div key={c} className={`r53-geo-city ${inMumbai ? "mumbai" : "hyd"}`}>
              <span className="r53-geo-dot" />
              <span className="r53-geo-city-name">{c}</span>
              <span className="r53-geo-city-ip">{inMumbai ? "→ Mumbai" : "→ Hyderabad"}</span>
            </div>
          );
        })}
      </div>

      <div className="r53-geo-slider">
        <span>Mumbai bias: <strong>{bias > 0 ? "+" : ""}{bias}</strong></span>
        <input type="range" min="-100" max="100" value={bias} onChange={(e) => setBias(+e.target.value)} />
      </div>

      <div className="r53-note">
        💡 Positive bias <strong>expands</strong> Mumbai's territory (pulling cities away from Hyderabad); negative
        <strong> shrinks</strong> it. Same result can be achieved by biasing either region. Requires a Traffic Policy
        (~$50/mo).
      </div>
    </div>
  );
}

/* ─── 8. FAILOVER DEMO ─────────────────────────────────────────────── */
export function FailoverDemo() {
  const [primaryUp, setPrimaryUp] = useState(true);
  const target = primaryUp ? "primary" : "secondary";

  return (
    <div className="sv-card r53-card">
      <div className="sv-title r53-title">🔁 Failover Routing — Active / Passive</div>
      <p className="r53-intro">
        The only <strong>active-passive</strong> policy. All traffic goes to the <strong>primary</strong>; if its health
        check fails, Route 53 flips everyone to the <strong>secondary</strong> standby. Toggle the primary.
      </p>

      <div className="r53-fo-stage">
        <div className="r53-fo-dns">🌐 learn.cloudfox.in</div>
        <div className="r53-fo-split">
          <div className={`r53-fo-arrow ${target === "primary" ? "lit" : ""}`}>━━▶</div>
          <div className={`r53-fo-arrow ${target === "secondary" ? "lit" : ""}`}>━━▶</div>
        </div>
        <div className="r53-fo-servers">
          <div className={`r53-fo-server ${primaryUp ? "up" : "down"} ${target === "primary" ? "serving" : ""}`}>
            <div className="r53-fo-badge">PRIMARY</div>
            <div className="r53-fo-icon">{primaryUp ? "🟢" : "🔴"}</div>
            <div className="r53-fo-ip">39.11.12.33</div>
            <div className="r53-fo-state">{primaryUp ? "Healthy · serving" : "Failed"}</div>
            <button className="r53-hc-toggle" onClick={() => setPrimaryUp((v) => !v)}>{primaryUp ? "⏻ Fail primary" : "⏻ Recover primary"}</button>
          </div>
          <div className={`r53-fo-server up ${target === "secondary" ? "serving" : "idle"}`}>
            <div className="r53-fo-badge secondary">SECONDARY</div>
            <div className="r53-fo-icon">🟢</div>
            <div className="r53-fo-ip">39.11.12.21</div>
            <div className="r53-fo-state">{target === "secondary" ? "Now serving" : "Standby (passive)"}</div>
          </div>
        </div>
      </div>

      <div className={`r53-fo-result ${target === "primary" ? "good" : "warn"}`}>
        {target === "primary"
          ? "✅ Primary is healthy — Route 53 returns 39.11.12.33."
          : "↪️ Primary failed — Route 53 fails over and returns the secondary 39.11.12.21."}
      </div>

      <div className="r53-note">
        💡 Set a low <strong>TTL</strong> (e.g. 60s) so clients stop caching the dead primary quickly and pick up the
        failover fast.
      </div>
    </div>
  );
}
