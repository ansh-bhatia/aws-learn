import React, { useState } from "react";
import "./FoundationVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. WHAT IS CLOUD — on-prem vs cloud
   ════════════════════════════════════════════════════════════ */
export function WhatIsCloud() {
  const [cloud, setCloud] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title fnd-title">☁️ What Is the Cloud?</div>
      <p className="fnd-intro">
        Every app (Zomato, Amazon, Uber) runs on <b>servers, storage, databases &amp; networking</b>. You can own that hardware (on-premises) or rent it from a provider (cloud). Toggle:
      </p>
      <div className="fnd-toggle">
        <button className={!cloud ? "active" : ""} onClick={() => setCloud(false)}>🏢 On-premises</button>
        <button className={cloud ? "active" : ""} onClick={() => setCloud(true)}>☁️ Cloud</button>
      </div>
      <div className="fnd-detail">
        {cloud
          ? <p><b>Cloud:</b> rent IT resources from a provider (AWS, Azure, GCP) <b>over the internet</b>, and <b>pay only for what you use</b>. No big upfront cost — launch in minutes, grow or shrink anytime.</p>
          : <p><b>On-premises:</b> buy &amp; build your own data center (₹1–2 crore+), hire staff, handle power, cooling &amp; security. Takes months and a huge upfront investment.</p>}
      </div>
      <p className="fnd-note ok">📖 Definition: <b>Cloud computing</b> = on-demand delivery of IT resources over the internet with <b>pay-as-you-go</b> pricing. The "triple-A": access <b>anytime</b>, from <b>anywhere</b>, on <b>any device</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. SIX BENEFITS OF CLOUD
   ════════════════════════════════════════════════════════════ */
const BENEFITS = [
  { ic: "💱", t: "Trade CapEx for OpEx", d: "No huge upfront hardware cost — pay monthly only for what you use." },
  { ic: "📉", t: "Economies of scale", d: "AWS buys at massive scale & passes savings on (prices cut many times)." },
  { ic: "🎯", t: "Stop guessing capacity", d: "Scale up or down with a click — no more over/under-buying servers." },
  { ic: "⚡", t: "Speed & agility", d: "Spin up resources in minutes, not weeks/months. Ideas ship fast." },
  { ic: "🧹", t: "No data-center upkeep", d: "Forget racks, power, cooling, security — the provider handles it." },
  { ic: "🌍", t: "Go global in minutes", d: "Deploy near users worldwide without building data centers there." },
];
export function CloudBenefits() {
  const [open, setOpen] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title fnd-title">✅ 6 Benefits of Cloud</div>
      <p className="fnd-intro">Tap each to expand:</p>
      <div className="fnd-benefits">
        {BENEFITS.map((b, i) => (
          <div key={i} className={`fnd-benefit ${open === i ? "open" : ""}`} onClick={() => setOpen(i)}>
            <div className="fnd-benefit-h"><span>{b.ic}</span> {b.t}</div>
            {open === i && <p>{b.d}</p>}
          </div>
        ))}
      </div>
      <p className="fnd-note">💡 <b>CapEx</b> = big upfront purchase (buying a car). <b>OpEx</b> = ongoing pay-as-you-use (fuel). Cloud turns CapEx into OpEx.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. TYPES OF CLOUD
   ════════════════════════════════════════════════════════════ */
const CLOUD_TYPES = {
  private: { t: "🔒 Private", d: "Cloud used by ONE organization. Full control & security — but you build & maintain it (high cost). Used by security/compliance-heavy orgs (govt, banks)." },
  public: { t: "🌐 Public", d: "A provider (AWS/Azure/GCP) owns everything; you rent over the internet. Almost no upfront cost & easy — but no control over the underlying hardware." },
  hybrid: { t: "🔀 Hybrid", d: "Mix of both, connected. Keep sensitive data on-prem, burst to the cloud for scale. The most popular — e.g. exam-result spikes, disaster recovery, cheap S3 archive." },
};
export function CloudTypes() {
  const [t, setT] = useState("hybrid");
  return (
    <div className="sv-card">
      <div className="sv-title fnd-title">🏗️ Types of Cloud</div>
      <p className="fnd-intro">Three ways to use the cloud. Tap each:</p>
      <div className="fnd-toggle">
        {Object.keys(CLOUD_TYPES).map(k => (
          <button key={k} className={t === k ? "active" : ""} onClick={() => setT(k)}>{CLOUD_TYPES[k].t}</button>
        ))}
      </div>
      <div className="fnd-detail"><b>{CLOUD_TYPES[t].t}</b><p>{CLOUD_TYPES[t].d}</p></div>
      <p className="fnd-note ok">🏆 <b>Hybrid</b> wins in the real world: scale + control. Example — a university runs on-prem 360 days, bursts to the cloud for 5 days of results traffic.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. CLOUD SERVICE MODELS — IaaS / PaaS / SaaS responsibility
   ════════════════════════════════════════════════════════════ */
const LAYERS = ["Application", "Data", "Runtime", "Middleware", "OS", "Virtualization", "Servers", "Storage", "Networking"];
// how many TOP layers YOU manage in each model
const MODELS = {
  onprem: { t: "On-Premises", you: 9, ex: "Your own data center" },
  iaas: { t: "IaaS", you: 5, ex: "EC2 / Azure VM" },
  paas: { t: "PaaS", you: 2, ex: "RDS / Azure DB" },
  saas: { t: "SaaS", you: 0, ex: "Office 365 / Gmail" },
};
export function CloudServiceModels() {
  const [m, setM] = useState("iaas");
  const youCount = MODELS[m].you;
  return (
    <div className="sv-card">
      <div className="sv-title fnd-title">🍕 Cloud Service Models (Who Manages What)</div>
      <p className="fnd-intro">The more you move right, the less you manage. Orange = <b>you</b>, blue = <b>provider</b>. Tap:</p>
      <div className="fnd-toggle">
        {Object.keys(MODELS).map(k => (
          <button key={k} className={m === k ? "active" : ""} onClick={() => setM(k)}>{MODELS[k].t}</button>
        ))}
      </div>
      <div className="fnd-stack">
        {LAYERS.map((l, i) => (
          <div key={l} className={`fnd-layer ${i < youCount ? "you" : "prov"}`}>{l}<small>{i < youCount ? "you" : "provider"}</small></div>
        ))}
      </div>
      <p className="fnd-note">{MODELS[m].t} example: <b>{MODELS[m].ex}</b>. {youCount === 0 ? "You just use the app — provider runs everything." : youCount === 9 ? "You manage the entire stack." : `You manage the top ${youCount} layers; the provider handles the rest.`}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. AWS MARKET SHARE
   ════════════════════════════════════════════════════════════ */
const SHARE = [{ n: "AWS", v: 33, c: "#EC7211" }, { n: "Microsoft Azure", v: 22, c: "#0078D4" }, { n: "Google Cloud", v: 11, c: "#34A853" }];
export function AWSMarketShare() {
  return (
    <div className="sv-card">
      <div className="sv-title fnd-title">🏆 Why AWS? (Market Leader)</div>
      <p className="fnd-intro">
        AWS <b>started</b> cloud computing (launched <b>S3</b> in 2006, then <b>EC2</b>), now offers <b>200+ services</b>, and has led Gartner's Magic Quadrant for a decade. Market share:
      </p>
      <div className="fnd-bars">
        {SHARE.map(s => (
          <div key={s.n} className="fnd-bar-row">
            <span className="fnd-bar-name">{s.n}</span>
            <div className="fnd-bar-track"><div className="fnd-bar-fill" style={{ width: `${s.v * 2.5}%`, background: s.c }}>{s.v}%</div></div>
          </div>
        ))}
      </div>
      <p className="fnd-note ok">🇮🇳 In India: <b>Mumbai</b> region (2016) + <b>Hyderabad</b> region (2022). Learning the leader = more jobs + the widest service range.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. FREE TIER + BUDGET
   ════════════════════════════════════════════════════════════ */
export function FreeTierBudget() {
  return (
    <div className="sv-card">
      <div className="sv-title fnd-title">🆓 Free Tier &amp; Budget Alerts</div>
      <p className="fnd-intro">Practice for free — just stay inside the limits and set a budget alert. Sample 12-month free-tier limits:</p>
      <div className="fnd-free">
        <div className="fnd-free-item"><b>EC2</b><span>750 hrs/mo</span></div>
        <div className="fnd-free-item"><b>S3</b><span>5 GB</span></div>
        <div className="fnd-free-item"><b>RDS</b><span>750 hrs/mo</span></div>
      </div>
      <div className="fnd-steps">
        <div className="fnd-step"><span>1</span><div>Need an email + an <b>international Visa/Mastercard/Amex</b> (a ~₹2 check, refunded). No auto-charges.</div></div>
        <div className="fnd-step"><span>2</span><div>Pick <b>Basic support</b> (free) at sign-up.</div></div>
        <div className="fnd-step"><span>3</span><div>Set a <b>Zero-Spend Budget</b> (Billing → Budgets) → email alert if spend exceeds <b>$0.01</b>.</div></div>
      </div>
      <p className="fnd-note warn">⚠️ A budget <b>alerts</b> you — it does NOT auto-delete resources. When you get an alert, go <b>delete/terminate</b> the resource yourself. Always clean up after a lab.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. GLOBAL INFRASTRUCTURE EXPLORER
   ════════════════════════════════════════════════════════════ */
const INFRA = {
  region: { t: "🌍 Region", d: "A geographic area (e.g. Mumbai ap-south-1). Pick one near your users (low latency) or to meet data-residency laws. ~35 worldwide." },
  az: { t: "🏢 Availability Zone (AZ)", d: "One or more data centers inside a region, ≤100 km apart with separate power/water. Run across multiple AZs for HIGH AVAILABILITY — if one fails, another keeps serving." },
  local: { t: "📍 Local Zone", d: "A data center OUTSIDE the region, placed in a far city (e.g. Delhi) for LOW LATENCY to local users." },
  wavelength: { t: "📡 Wavelength", d: "Run apps inside 5G/telecom networks so mobile-only traffic never leaves the carrier network — ultra-low latency for mobile." },
  outpost: { t: "🖥️ Outposts", d: "AWS hardware shipped to YOUR data center, managed from the AWS console — true hybrid cloud with one set of tools." },
  edge: { t: "⚡ Edge Location", d: "350+ caching sites (CloudFront CDN) near users. Cache static content (videos, images) close by for fast delivery instead of hitting the far-away origin." },
  rec: { t: "🗄️ Regional Edge Cache", d: "A bigger cache layer (~13) BETWEEN edge locations and the origin. If an edge misses, it pulls from here — protecting the origin from traffic." },
};
export function GlobalInfraExplorer() {
  const [k, setK] = useState("region");
  return (
    <div className="sv-card">
      <div className="sv-title fnd-title">🗺️ AWS Global Infrastructure</div>
      <p className="fnd-intro">The building blocks AWS uses worldwide. Tap each:</p>
      <div className="fnd-tabs">
        {Object.keys(INFRA).map(x => (
          <button key={x} className={`fnd-tab ${k === x ? "active" : ""}`} onClick={() => setK(x)}>{INFRA[x].t.split(" ")[0]} {INFRA[x].t.split(" ").slice(1).join(" ").replace(/\(.*\)/, "")}</button>
        ))}
      </div>
      <div className="fnd-detail"><b>{INFRA[k].t}</b><p>{INFRA[k].d}</p></div>
      <p className="fnd-note">Nesting: <b>Region</b> → contains <b>AZs</b>. <b>AZ</b> = high availability. <b>Local Zone / Edge</b> = low latency. <b>Outposts</b> = hybrid on-prem.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. LATENCY & DISTANCE
   ════════════════════════════════════════════════════════════ */
export function LatencyDistance() {
  const [near, setNear] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title fnd-title">📶 Why Distance = Latency</div>
      <p className="fnd-intro">
        Indian users hitting a US-hosted app travel ~13,000 km — slow. Host in the <b>region near your users</b> instead. Toggle where the app lives:
      </p>
      <div className="fnd-toggle">
        <button className={!near ? "active" : ""} onClick={() => setNear(false)}>🇺🇸 App in US</button>
        <button className={near ? "active" : ""} onClick={() => setNear(true)}>🇮🇳 App in India</button>
      </div>
      <div className="fnd-lat">
        <span>🇮🇳 User</span>
        <div className="fnd-lat-track"><div className={`fnd-lat-fill ${near ? "fast" : "slow"}`} style={{ width: near ? "20%" : "100%" }} /></div>
        <span>{near ? "🇮🇳 App" : "🇺🇸 App"}</span>
      </div>
      <div className={`fnd-verdict ${near ? "ok" : "bad"}`}>
        {near ? "✅ Short trip → low latency, fast experience" : "🐢 ~13,000 km round trip → high latency, slow"}
      </div>
      <p className="fnd-note">Also: <b>data-residency laws</b> (e.g. India's rules) may require storing user data in-country — another reason to pick the right region.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. CDN / EDGE CACHING
   ════════════════════════════════════════════════════════════ */
export function CDNEdge() {
  const [cdn, setCdn] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title fnd-title">⚡ Edge Caching (CDN / CloudFront)</div>
      <p className="fnd-intro">
        Netflix/YouTube feel instant because static content is <b>cached near you</b>. AWS does this with <b>edge locations</b> (CloudFront). Toggle caching:
      </p>
      <div className="fnd-toggle">
        <button className={!cdn ? "active" : ""} onClick={() => setCdn(false)}>No CDN</button>
        <button className={cdn ? "active" : ""} onClick={() => setCdn(true)}>⚡ Edge cache on</button>
      </div>
      <div className="fnd-cdn">
        <div className="fnd-cdn-box">👤 User</div>
        {cdn
          ? <><div className="fnd-cdn-arrow ok">→ nearby →</div><div className="fnd-cdn-box hot">⚡ Edge</div></>
          : <><div className="fnd-cdn-arrow bad">→ 13,000 km →</div><div className="fnd-cdn-box">🗄️ Origin</div></>}
      </div>
      <div className={`fnd-verdict ${cdn ? "ok" : "bad"}`}>
        {cdn ? "✅ Served from the nearby edge — fast, origin stays free" : "🐢 Every request travels to the far origin — slow & heavy load"}
      </div>
      <p className="fnd-note">If an edge misses, a <b>Regional Edge Cache</b> answers before bothering the origin. You configure all this with <b>CloudFront</b> (covered later).</p>
    </div>
  );
}
