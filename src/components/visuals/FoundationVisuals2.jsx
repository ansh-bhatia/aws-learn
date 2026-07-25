import { useState } from "react";
import "./FoundationVisuals.css";
import "./FoundationVisuals2.css";

/* ─── 1. APP → SERVER → CLUSTER → DATA CENTRE ──────────────────────── */
export function ScalingUpInfrastructure() {
  const [users, setUsers] = useState(0);

  const tiers = [
    { users: "100 users", need: "1 normal server", boxes: 1, label: "Server",
      note: "A single machine holds the app. Normal CPU, normal database size — it copes fine." },
    { users: "10,000 users", need: "Bigger server", boxes: 1, big: true, label: "Server",
      note: "Same single server, more capacity. You must increase CPU, RAM and database size as users grow." },
    { users: "256 million visitors / month", need: "A cluster of servers", boxes: 6, label: "Cluster",
      note: "Amazon's scale. One server cannot handle this many requests, so companies run a GROUP of servers — a cluster." },
    { users: "Multiple clusters", need: "A whole data centre", boxes: 12, label: "Data centre",
      note: "Groups of clusters plus power, cooling, networking and security. Building one costs roughly ₹1–2 crore and takes months." },
  ];

  const t = tiers[users];

  return (
    <div className="sv-card fnd-card">
      <div className="sv-title fnd-title">📈 Why More Users Means More Infrastructure</div>
      <p className="fnd-intro">
        Users reach your app from laptops, desktops, phones and tablets — but the app itself lives on a
        server somewhere. Drag the slider to see what has to grow underneath it.
      </p>

      <input
        className="fnd2-slider"
        type="range"
        min="0"
        max="3"
        value={users}
        onChange={(e) => setUsers(Number(e.target.value))}
        aria-label="Number of users"
      />

      <div className="fnd2-tier-head">
        <span className="fnd2-tier-users">{t.users}</span>
        <span className="fnd2-tier-need">→ {t.need}</span>
      </div>

      <div className="fnd2-rack">
        {Array.from({ length: t.boxes }).map((_, i) => (
          <span key={i} className={`fnd2-box ${t.big ? "big" : ""}`}>🖥️</span>
        ))}
      </div>
      <div className="fnd2-rack-label">{t.label}</div>

      <div className="fnd-note">{t.note}</div>
    </div>
  );
}

/* ─── 2. CAPEX vs OPEX ─────────────────────────────────────────────── */
export function CapExVsOpEx() {
  return (
    <div className="sv-card fnd-card">
      <div className="sv-title fnd-title">🚗 CapEx vs OpEx — The Car Analogy</div>
      <p className="fnd-intro">
        Buying a car is <strong>CapEx</strong>: one big payment up front. Fuel, insurance and servicing are
        <strong> OpEx</strong>: smaller amounts, every month, only while you drive. Data centres work exactly
        the same way.
      </p>

      <div className="fnd2-two">
        <div className="fnd2-col capex">
          <div className="fnd2-col-head">💰 CapEx — capital expenditure</div>
          <div className="fnd2-col-sub">One big payment up front</div>
          <ul className="fnd2-ul">
            <li>Routers &amp; networking devices</li>
            <li>Servers and racks</li>
            <li>Cooling system</li>
            <li>The building itself</li>
          </ul>
          <div className="fnd2-verdict bad">On-premises: unavoidable · Cloud: ~zero</div>
        </div>

        <div className="fnd2-col opex">
          <div className="fnd2-col-head">🔁 OpEx — operational expenditure</div>
          <div className="fnd2-col-sub">Ongoing, pay-as-you-use</div>
          <ul className="fnd2-ul">
            <li>Electricity bill</li>
            <li>Manpower</li>
            <li>Server maintenance</li>
            <li>Physical security</li>
          </ul>
          <div className="fnd2-verdict ok">Both models have it — cloud just bills it per resource</div>
        </div>
      </div>

      <div className="fnd-note">
        The first benefit of cloud is precisely this trade: you <strong>eliminate capital expenditure</strong>
        and pay operational expenditure instead. OpEx does not disappear — an on-premises data centre has it
        too, on top of the CapEx.
      </div>
    </div>
  );
}

/* ─── 3. HYBRID CLOUD — REAL CASE STUDIES ──────────────────────────── */
export function HybridCloudCases() {
  const [sel, setSel] = useState(0);

  const cases = [
    {
      tab: "🗄️ Cold data archive",
      title: "The design firm with 10 TB of CorelDRAW files",
      story: "A company had 10 TB of large CDR design files and their storage was full. They were about to buy another physical storage array. The question that changed the answer: are you using this data daily? No — they only pull a specific file when a client orders.",
      solution: "Keep the frequently-used files on the existing on-premises storage. Push the rarely-touched 10 TB to Amazon S3. No new hardware, no capital expenditure.",
      onprem: "Active working files",
      cloud: "10 TB archive in S3",
    },
    {
      tab: "🎓 University results",
      title: "360 quiet days, 5 enormous ones",
      story: "A university publishes exam results from its website. For roughly 360 days a year the traffic is completely normal. For about 5 days — results day — traffic explodes.",
      solution: "Sizing the on-premises infrastructure for those 5 days would be hugely expensive and idle the rest of the year. Instead, run on-premises for 360 days and shift to the cloud for the results window, where capacity is effectively unlimited so there is no bottleneck.",
      onprem: "Normal traffic, 360 days",
      cloud: "Results-day burst, 5 days",
    },
    {
      tab: "🏦 Bank disaster recovery",
      title: "The ₹15 crore standby that never runs",
      story: "RBI requires banks to have a disaster recovery solution. Traditionally that means a second physical data centre on standby — if the primary fails, users move across. Build the primary for ₹15 crore and you must spend ₹15 crore again on the recovery site.",
      solution: "That standby might be used for one or two days a year, or not at all for years — yet the servers run, drawing power and rent the whole time. With the cloud there is no upfront payment: stand the recovery site up in AWS and move users there only when needed. The same pattern protects stock exchanges.",
      onprem: "Live banking data centre",
      cloud: "Recovery site, on demand",
    },
  ];

  const c = cases[sel];

  return (
    <div className="sv-card fnd-card">
      <div className="sv-title fnd-title">🔗 Hybrid Cloud — Three Real Scenarios</div>
      <p className="fnd-intro">
        Hybrid is the most popular of the three cloud types because it takes the best of both: keep control
        where you need it, and get scalability where you do not.
      </p>

      <div className="fnd2-tabs">
        {cases.map((x, i) => (
          <button
            key={x.tab}
            className={`fnd2-tab ${sel === i ? "active" : ""}`}
            onClick={() => setSel(i)}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div className="fnd2-case">
        <div className="fnd2-case-title">{c.title}</div>
        <p className="fnd2-case-story">{c.story}</p>
        <p className="fnd2-case-solution"><strong>The hybrid answer: </strong>{c.solution}</p>

        <div className="fnd2-split">
          <div className="fnd2-half onprem">
            <div className="fnd2-half-tag">🏢 ON-PREMISES</div>
            <div className="fnd2-half-body">{c.onprem}</div>
          </div>
          <div className="fnd2-link">⇄</div>
          <div className="fnd2-half cloud">
            <div className="fnd2-half-tag">☁️ CLOUD</div>
            <div className="fnd2-half-body">{c.cloud}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 4. THE 9-LAYER RESPONSIBILITY STACK ──────────────────────────── */
export function ResponsibilityStack() {
  const [model, setModel] = useState("iaas");

  // layers bottom → top
  const layers = [
    "Networking", "Storage", "Servers", "Virtualization",
    "Operating System", "Middleware", "Runtime", "Data", "Application",
  ];

  // how many layers (from the bottom) the provider manages
  const models = {
    onprem: { name: "On-Premises", provider: 0, you: "Everything — all 9 layers", example: "Your own data centre", share: "100% you" },
    iaas: { name: "IaaS", provider: 4, you: "OS, Middleware, Runtime, Data, Application", example: "EC2 · Azure Virtual Machine", share: "~50% you" },
    paas: { name: "PaaS", provider: 7, you: "Data and Application only", example: "RDS · Azure Database", share: "~25% you" },
    saas: { name: "SaaS", provider: 9, you: "Nothing — you just use it", example: "Office 365 · Gmail", share: "0% you" },
  };

  const m = models[model];

  return (
    <div className="sv-card fnd-card">
      <div className="sv-title fnd-title">🏗️ Who Manages What — The 9-Layer Stack</div>
      <p className="fnd-intro">
        Every hosting model is the same nine layers; only the dividing line moves. Pick a model and watch
        where responsibility splits.
      </p>

      <div className="fnd2-tabs">
        {Object.keys(models).map((k) => (
          <button
            key={k}
            className={`fnd2-tab ${model === k ? "active" : ""}`}
            onClick={() => setModel(k)}
          >
            {models[k].name}
          </button>
        ))}
      </div>

      <div className="fnd2-stack">
        {[...layers].reverse().map((layer, revIdx) => {
          const idx = layers.length - 1 - revIdx; // real bottom-up index
          const byProvider = idx < m.provider;
          return (
            <div key={layer} className={`fnd2-layer ${byProvider ? "provider" : "you"}`}>
              <span className="fnd2-layer-name">{layer}</span>
              <span className="fnd2-layer-owner">{byProvider ? "provider" : "you"}</span>
            </div>
          );
        })}
      </div>

      <div className="fnd2-legend">
        <span className="fnd2-key you" /> you manage
        <span className="fnd2-key provider" /> cloud provider manages
      </div>

      <div className="fnd-note">
        <strong>{m.name} — {m.share}.</strong> You manage: {m.you}. Example: {m.example}.
        {model === "iaas" && " Because the OS is yours, launching an EC2 instance asks you to choose Linux or Windows."}
        {model === "paas" && " Because the OS is theirs, creating an RDS database never asks you to pick an operating system."}
        {model === "saas" && " The trade-off: you depend entirely on the provider and on your internet connection. If their server is down, you wait."}
      </div>
    </div>
  );
}
