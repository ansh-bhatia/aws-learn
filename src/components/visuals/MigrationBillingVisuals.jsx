import React, { useState } from "react";
import "./MigrationBillingVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. SNOW FAMILY
   ════════════════════════════════════════════════════════════ */
export function SnowFamily() {
  const [sel, setSel] = useState("snowball");
  const devices = {
    snowball: { t: "📦 Snowball", cap: "50 TB / 80 TB", d: "Storage-only physical device for offline data transfer. 80 TB model in US only; 50 TB worldwide. Encrypted (KMS), rugged, E-ink shipping label. Best for ~10 TB+." },
    edge: { t: "🧰 Snowball Edge", cap: "Storage + compute", d: "Snowball + on-board compute (run Lambda / EC2 at the edge). Can be clustered (5–10 devices) for durability. Use when you need processing in disconnected/edge environments." },
    mobile: { t: "🚛 Snowmobile", cap: "up to 100 PB", d: "A 45-ft shipping container on a truck — exabyte-scale transfers. For moving massive datacenters to AWS." },
  };
  const d = devices[sel];
  return (
    <div className="sv-card">
      <div className="sv-title mb-title">❄️ AWS Snow Family (Offline Migration)</div>
      <p className="mb-intro">
        Uploading huge data over the internet is slow — e.g. <b>50 TB over 100 Mbps ≈ 1.5 months</b>. The <b>Snow Family</b>
        ships physical devices: order → AWS sends it → you copy data → ship back → AWS loads it to S3. Click each:
      </p>
      <div className="mb-tabs">
        {Object.entries(devices).map(([id, v]) => (
          <button key={id} className={"mb-tab" + (sel === id ? " active" : "")} onClick={() => setSel(id)}>{v.t}</button>
        ))}
      </div>
      <div className="mb-detail"><span className="mb-chip">{d.cap}</span><p>{d.d}</p></div>
      <p className="mb-note">📌 <b>Exam:</b> &lt;10 TB → just use the internet. Tens of TB → <b>Snowball</b>. Need <b>compute at the edge</b> → <b>Snowball Edge</b>. Petabytes/exabytes → <b>Snowmobile</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. SERVER MIGRATION SERVICE
   ════════════════════════════════════════════════════════════ */
export function ServerMigration() {
  return (
    <div className="sv-card">
      <div className="sv-title mb-title">🖥️ Server Migration Service (SMS)</div>
      <p className="mb-intro">
        <b>SMS</b> automates migrating on-prem <b>VMs</b> (VMware vSphere, Hyper-V/SCVMM, or Azure) into AWS by
        incrementally <b>replicating</b> them as ready-to-deploy <b>AMIs</b>.
      </p>
      <div className="mb-flow">
        <div className="mb-node">🖥️ On-prem VM<small>VMware / Hyper-V</small></div>
        <div className="mb-arrow">replicate →</div>
        <div className="mb-node">🔌 SMS Connector<small>in vCenter/SCVMM</small></div>
        <div className="mb-arrow">→</div>
        <div className="mb-node">💿 AMI</div>
        <div className="mb-arrow">→</div>
        <div className="mb-node">☁️ EC2</div>
      </div>
      <p className="mb-note">📌 Test the AMI before going live; minimal downtime. Limits: <b>50 concurrent VMs</b>/account, <b>90-day</b> replication window per VM. A <b>connector</b> VM (FreeBSD appliance) runs in your hypervisor to orchestrate it.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. BILLING TOOLS
   ════════════════════════════════════════════════════════════ */
const TOOLS = [
  { t: "📊 Cost Explorer", d: "Visualize & analyze spend (graphs) over the last months; filter by service, region, instance type, tag, account; forecast future cost." },
  { t: "💰 Budgets", d: "Set spending/usage budgets; get SNS/email alerts when actual or forecast cost exceeds a threshold. (AWS can't auto-delete resources — you act on the alert.)" },
  { t: "🧮 Pricing Calculator", d: "Estimate cost of a planned architecture before building (the modern replacement for the Simple Monthly Calculator). Free, no account needed." },
];
export function BillingTools() {
  const [sel, setSel] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title mb-title">💵 Billing &amp; Cost Management</div>
      <p className="mb-intro">Tools to estimate, track &amp; control AWS spend. Click each:</p>
      <div className="mb-tabs">
        {TOOLS.map((t, i) => (
          <button key={i} className={"mb-tab" + (sel === i ? " active" : "")} onClick={() => setSel(i)}>{t.t}</button>
        ))}
      </div>
      <div className="mb-detail"><b>{TOOLS[sel].t}</b><p>{TOOLS[sel].d}</p></div>
      <p className="mb-note">📌 Use <b>Pricing Calculator</b> to compare On-Demand vs Reserved before buying; <b>Cost Explorer</b> to see where money goes; <b>Budgets</b> to get alerted early.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. DATA TRANSFER COSTS
   ════════════════════════════════════════════════════════════ */
const DT = [
  { path: "⬇️ Internet → AWS (inbound)", cost: "Free", color: "#3fb950" },
  { path: "⬆️ AWS → Internet (outbound)", cost: "Charged (~$0.09/GB)", color: "#f85149" },
  { path: "↔️ Same AZ (EC2/RDS via private IP)", cost: "Free", color: "#3fb950" },
  { path: "↔️ Across AZs (same region)", cost: "Charged (~$0.01/GB each way)", color: "#e3b341" },
  { path: "↔️ Across Regions", cost: "Charged (inter-region rates)", color: "#f85149" },
  { path: "🔌 To S3/DynamoDB via endpoint (same region)", cost: "Free", color: "#3fb950" },
];
export function DataTransferCost() {
  return (
    <div className="sv-card">
      <div className="sv-title mb-title">🔄 Data Transfer Costs</div>
      <p className="mb-intro">Interview favorite. The golden rule: <b>inbound is free; outbound &amp; crossing AZ/region boundaries cost money</b>:</p>
      <div className="mb-dt-list">
        {DT.map((d, i) => (
          <div key={i} className="mb-dt-row">
            <span className="mb-dt-path">{d.path}</span>
            <span className="mb-dt-cost" style={{ color: d.color }}>{d.cost}</span>
          </div>
        ))}
      </div>
      <p className="mb-note">💡 Tips: keep chatty workloads in the <b>same AZ</b>; use <b>VPC endpoints</b> instead of internet for S3/DynamoDB; use <b>Direct Connect</b> for on-prem; avoid cross-region unless required. (NAT Gateway, Transit Gateway, VPC endpoints add their own processing fees.)</p>
    </div>
  );
}
