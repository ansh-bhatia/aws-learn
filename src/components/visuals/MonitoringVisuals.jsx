import React, { useState } from "react";
import "./MonitoringVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. AWS CONFIG
   ════════════════════════════════════════════════════════════ */
export function ConfigVisual() {
  const [sel, setSel] = useState("snapshot");
  const parts = {
    snapshot: { t: "📸 Resource Inventory", d: "Lists all resources in a region and their relationships (e.g. which SG, subnet, VPC, EBS volume an EC2 uses). Great for cleaning up an account." },
    timeline: { t: "🕒 Config Timeline", d: "Records every configuration change over time (e.g. EC2 t2.micro → t2.xlarge). View what changed and roll back to a last-known-good config." },
    rules: { t: "✅ Config Rules", d: "Evaluate resources against desired settings (AWS-managed or custom). Non-compliant resources (e.g. unencrypted EBS, unused Elastic IP) get flagged + an SNS alert." },
    pack: { t: "📦 Conformance Pack", d: "A bundle of Config rules + remediation deployed as one unit across accounts/regions (via AWS Organizations)." },
  };
  const p = parts[sel];
  return (
    <div className="sv-card">
      <div className="sv-title mon-title">🛠️ AWS Config</div>
      <p className="mon-intro">
        <b>AWS Config</b> gives a detailed view of your resources' <b>configuration</b> — for <b>auditing &amp; compliance</b>.
        It answers "<b>what changed?</b>" Click each:
      </p>
      <div className="mon-tabs">
        {Object.entries(parts).map(([id, v]) => (
          <button key={id} className={"mon-tab" + (sel === id ? " active" : "")} onClick={() => setSel(id)}>{v.t}</button>
        ))}
      </div>
      <div className="mon-detail"><b>{p.t}</b><p>{p.d}</p></div>
      <p className="mon-note">📌 Records changes to an S3 bucket; sends notifications via SNS. Per-resource timeline shows <b>configuration</b>, <b>compliance</b> &amp; <b>CloudTrail</b> events together.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. CLOUDTRAIL
   ════════════════════════════════════════════════════════════ */
export function CloudTrailVisual() {
  const [trail, setTrail] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title mon-title">🧾 AWS CloudTrail</div>
      <p className="mon-intro">
        <b>CloudTrail</b> records <b>API calls &amp; user activity</b> — answers "<b>who did it, when &amp; from where?</b>"
        (console, CLI, SDK, API). Enabled by default; <b>Event History</b> keeps the last <b>90 days</b>. For longer
        retention, create a <b>Trail</b> that delivers logs to S3. Toggle:
      </p>
      <div className="mon-toggle">
        <button className={!trail ? "active" : ""} onClick={() => setTrail(false)}>📜 Event History (90 days)</button>
        <button className={trail ? "active" : ""} onClick={() => setTrail(true)}>🗄️ Trail → S3 (forever)</button>
      </div>
      <div className="mon-detail">
        {trail
          ? <p><b>Trail → S3:</b> stores events long-term. Logs are encrypted by <b>SSE-S3</b> by default (or <b>SSE-KMS</b> for more control). Enable <b>log file integrity validation</b> (SHA-256) to detect tampering — so no one can quietly edit/delete the audit trail.</p>
          : <p><b>Event History:</b> view/search/download the last 90 days. Example: someone terminated an EC2 — CloudTrail shows the IAM user, source IP, time &amp; instance ID. Even denied (no-permission) calls are recorded.</p>}
      </div>
      <p className="mon-note">⏱️ Events typically appear within ~15 minutes of the API call. Can also stream to CloudWatch Logs / EventBridge.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. CLOUDWATCH
   ════════════════════════════════════════════════════════════ */
export function CloudWatchVisual() {
  const [sel, setSel] = useState("metrics");
  const parts = {
    metrics: { t: "📈 Metrics", d: "CloudWatch is a metrics repository. AWS services push metrics (CPU, network, etc.). Default EC2 monitoring = 5-min period; enable Detailed Monitoring (paid) for 1-min." },
    agent: { t: "🧩 CloudWatch Agent", d: "Memory & disk usage are OS-level — NOT available by default. Install the CloudWatch Agent on the instance to collect them. (Common exam point!)" },
    alarm: { t: "🔔 Alarms", d: "Watch a metric vs a threshold over time periods. On breach → notify via SNS, trigger Auto Scaling, or stop/terminate EC2. States: OK / ALARM / INSUFFICIENT_DATA." },
    events: { t: "⚡ EventBridge (CloudWatch Events)", d: "Respond to state changes / schedules → trigger Lambda, SNS, etc. (e.g. start EC2 at 9 AM via cron). Now branded EventBridge." },
  };
  const p = parts[sel];
  return (
    <div className="sv-card">
      <div className="sv-title mon-title">📊 Amazon CloudWatch</div>
      <p className="mon-intro">
        <b>CloudWatch</b> <b>monitors</b> resources &amp; apps (performance) — answers "<b>how is it performing?</b>" Used to
        right-size: deploy → monitor → adjust. It does <b>monitoring, alerting &amp; events</b>. Click each:
      </p>
      <div className="mon-tabs">
        {Object.entries(parts).map(([id, v]) => (
          <button key={id} className={"mon-tab" + (sel === id ? " active" : "")} onClick={() => setSel(id)}>{v.t}</button>
        ))}
      </div>
      <div className="mon-detail"><b>{p.t}</b><p>{p.d}</p></div>
      <p className="mon-note">📌 Remember: <b>memory &amp; disk</b> need the <b>CloudWatch Agent</b>; <b>1-minute</b> granularity needs <b>Detailed Monitoring</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. CONFIG vs CLOUDTRAIL vs CLOUDWATCH
   ════════════════════════════════════════════════════════════ */
const TRIO = [
  ["Question it answers", "WHAT changed?", "WHO did it?", "HOW is it performing?"],
  ["Focus", "Resource configuration", "API calls / user activity", "Metrics & performance"],
  ["Example", "EC2 type changed t2→t3", "User X terminated the EC2", "CPU hit 90%"],
  ["Use for", "Compliance, config history", "Security audit, forensics", "Right-sizing, alarms"],
];
export function MonitoringComparison() {
  return (
    <div className="sv-card">
      <div className="sv-title mon-title">⚖️ Config vs CloudTrail vs CloudWatch</div>
      <p className="mon-intro">The three are easy to confuse. The one-word keys: <b>what</b> / <b>who</b> / <b>how</b>:</p>
      <div className="mon-table tri">
        <div className="mon-row head"><span className="feat"></span><span className="c1">🛠️ Config</span><span className="c2">🧾 CloudTrail</span><span className="c3">📊 CloudWatch</span></div>
        {TRIO.map((r, i) => (
          <div key={i} className="mon-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span><span>{r[3]}</span></div>
        ))}
      </div>
      <p className="mon-note">🧠 <b>Config = WHAT</b> changed · <b>CloudTrail = WHO</b> changed it · <b>CloudWatch = HOW</b> it's performing. (Config &amp; CloudTrail are both for auditing; CloudTrail adds the user/IP/time.)</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. INSPECTOR
   ════════════════════════════════════════════════════════════ */
export function InspectorVisual() {
  const [mode, setMode] = useState("network");
  return (
    <div className="sv-card">
      <div className="sv-title mon-title">🔍 Amazon Inspector</div>
      <p className="mon-intro">
        <b>Amazon Inspector</b> is an automated <b>security assessment</b> for <b>EC2</b> — finds vulnerabilities &amp;
        deviations from best practices, with severity-ranked findings (high/medium/low/info) &amp; a downloadable report.
        Two assessment types:
      </p>
      <div className="mon-toggle">
        <button className={mode === "network" ? "active" : ""} onClick={() => setMode("network")}>🌐 Network</button>
        <button className={mode === "host" ? "active" : ""} onClick={() => setMode("host")}>🖥️ Host</button>
      </div>
      <div className="mon-detail">
        {mode === "network"
          ? <p><b>Network assessment</b> — checks which ports are reachable from outside the VPC. No agent needed. Example findings: TCP 21 (FTP) open = high, 3389 (RDP) = medium, 80 (HTTP) = low.</p>
          : <p><b>Host assessment</b> — needs the <b>Inspector agent</b> installed on the instance. Scans for vulnerable software (CVEs) and security-best-practice / CIS benchmark deviations.</p>}
      </div>
      <p className="mon-note">📌 Replaces paying external auditors for EC2 security checks. Findings → report (PDF) or console/API. (More relevant to Cloud Practitioner; SAA tests it via scenario logic.)</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. TRUSTED ADVISOR
   ════════════════════════════════════════════════════════════ */
const TA = [
  { t: "💰 Cost Optimization", d: "Flags unused/idle resources to cut your bill (e.g. idle EC2, unattached Elastic IP)." },
  { t: "⚡ Performance", d: "Recommendations to improve speed & responsiveness (e.g. over-utilized instances)." },
  { t: "🔒 Security", d: "Security gaps — e.g. root MFA not enabled, security groups open to 0.0.0.0/0." },
  { t: "🛡️ Fault Tolerance", d: "Resiliency/redundancy shortfalls so a failure doesn't break your service." },
  { t: "📏 Service Limits", d: "Warns when you approach service quotas (e.g. VPCs per region). Free for everyone." },
];
export function TrustedAdvisorVisual() {
  const [sel, setSel] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title mon-title">🧭 AWS Trusted Advisor</div>
      <p className="mon-intro">
        <b>Trusted Advisor</b> inspects your whole AWS account and recommends improvements across <b>5 categories</b>. Click each:
      </p>
      <div className="mon-ta-cats">
        {TA.map((c, i) => (
          <button key={i} className={"mon-ta-cat" + (sel === i ? " active" : "")} onClick={() => setSel(i)}>{c.t}</button>
        ))}
      </div>
      <div className="mon-detail"><b>{TA[sel].t}</b><p>{TA[sel].d}</p></div>
      <p className="mon-note warn">💳 <b>Plan limits:</b> Basic/Developer support → only <b>Service Limits</b> + <b>6 security checks</b>. <b>All</b> checks require a <b>Business or Enterprise</b> support plan.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. INSPECTOR vs TRUSTED ADVISOR
   ════════════════════════════════════════════════════════════ */
const IVA_ROWS = [
  ["Scope", "EC2 only (security)", "Whole AWS account"],
  ["Agent", "Needed for host scan", "No agent"],
  ["Areas", "Vulnerabilities, network ports", "Cost, performance, security, fault-tolerance, limits"],
  ["Cost recommendations", "❌ No", "✅ Yes"],
  ["Performance advice", "❌ No", "✅ Yes"],
  ["Timing", "Run once / scheduled", "Real-time guidance"],
];
export function InspectorVsTrustedAdvisor() {
  return (
    <div className="sv-card">
      <div className="sv-title mon-title">⚖️ Inspector vs Trusted Advisor</div>
      <p className="mon-intro">Both surface issues, but at different scopes. Key: Inspector = deep <b>EC2 security</b>; Trusted Advisor = broad <b>account best-practices</b>.</p>
      <div className="mon-table">
        <div className="mon-row head"><span className="feat">Aspect</span><span className="c1">🔍 Inspector</span><span className="c2">🧭 Trusted Advisor</span></div>
        {IVA_ROWS.map((r, i) => (
          <div key={i} className="mon-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="mon-note">🧠 EC2 deep security scan → <b>Inspector</b>. Account-wide cost/performance/security/fault-tolerance/limits → <b>Trusted Advisor</b>.</p>
    </div>
  );
}
