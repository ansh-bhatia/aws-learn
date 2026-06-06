import React, { useState } from "react";
import "./EventBridgeVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. EVENTBRIDGE CONCEPT — 3 source types
   ════════════════════════════════════════════════════════════ */
const SOURCES = [
  { id: "aws", t: "☁️ AWS Services", d: "EC2 stops → EventBridge → Lambda → SNS alert. Fully AWS-native automation. (Our exam focus.)" },
  { id: "app", t: "🧩 Your Apps", d: "Order placed → your app sends 'order placed' event → EventBridge routes to payment, inventory, email services. Decoupled architecture." },
  { id: "saas", t: "🛍️ SaaS Apps", d: "New Shopify/Zendesk order → EventBridge → Lambda/SQS/CRM. Integrate external SaaS with AWS (partner event bus)." },
];
export function EventBridgeConcept() {
  const [sel, setSel] = useState("aws");
  const s = SOURCES.find((x) => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title eb-title">🔔 What is EventBridge?</div>
      <p className="eb-intro">
        <b>Amazon EventBridge</b> is a <b>serverless event bus</b> for building <b>event-driven architecture</b> — connecting
        AWS services, your apps, and SaaS apps via events ("when X happens, do Y"). It's the evolved version of
        <b> CloudWatch Events</b> (now a separate service with SaaS integration, custom buses, schema registry). Click a source:
      </p>
      <div className="eb-tabs">
        {SOURCES.map((x) => (
          <button key={x.id} className={"eb-tab" + (sel === x.id ? " active" : "")} onClick={() => setSel(x.id)}>{x.t}</button>
        ))}
      </div>
      <div className="eb-detail"><b>{s.t}</b><p>{s.d}</p></div>
      <p className="eb-note">📌 For the exam, focus on <b>AWS-service</b> event-driven workflows.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. WORKFLOW — source → event → bus → rule → target
   ════════════════════════════════════════════════════════════ */
const FLOW = [
  { t: "📡 Event Source", d: "Generates an event (e.g. an EC2 instance). Doesn't process or act — only emits. AWS services emit events automatically (no enable/disable)." },
  { t: "📄 Event", d: "A change of state in JSON (e.g. EC2 state = stopped). Each occurrence = a new event. Max 256 KB. Fields: id, source, detail-type, detail, time, region, resources." },
  { t: "🚌 Event Bus", d: "Central hub that receives events and routes them. Types: default (AWS events), custom (your apps), partner (SaaS). Doesn't store or transform." },
  { t: "🔧 Rule", d: "Filter + decision-maker. Matches an event pattern (JSON) and decides what happens. No rule = no action. One rule can hit multiple targets." },
  { t: "🎯 Target", d: "Where the action runs: Lambda, SNS, SQS, Step Functions, Kinesis, ECS… EventBridge needs an IAM role to invoke the target." },
];
export function EventBridgeWorkflow() {
  const [step, setStep] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title eb-title">🔄 Core Workflow</div>
      <p className="eb-intro">The flow: <b>Source → Event → Event Bus → Rule → Target</b>. Step through:</p>
      <div className="eb-flow">
        {FLOW.map((f, i) => (
          <React.Fragment key={i}>
            <button className={"eb-flow-node" + (step >= i ? " on" : "")} onClick={() => setStep(i)}>{f.t.split(" ")[0]}</button>
            {i < FLOW.length - 1 && <span className={"eb-flow-arr" + (step > i ? " on" : "")}>→</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="eb-detail"><b>{FLOW[step].t}</b><p>{FLOW[step].d}</p></div>
      <p className="eb-note">📋 Example: EC2 stops → emits an event → default bus → rule matches <code>state: stopped</code> → target SNS sends an email. <b>Schema Registry</b> shows the event's JSON structure to help build rules.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. RULE — simple vs detailed filtering
   ════════════════════════════════════════════════════════════ */
export function EventRule() {
  const [mode, setMode] = useState("detailed");
  return (
    <div className="sv-card">
      <div className="sv-title eb-title">🔧 Event Pattern Rule (Filtering)</div>
      <p className="eb-intro">
        Rules filter events with a JSON <b>event pattern</b>. Without a rule, events do nothing. Toggle the filter granularity:
      </p>
      <div className="eb-toggle">
        <button className={mode === "simple" ? "active" : ""} onClick={() => setMode("simple")}>Simple</button>
        <button className={mode === "detailed" ? "active" : ""} onClick={() => setMode("detailed")}>Detailed</button>
      </div>
      <pre className="eb-code">{mode === "simple"
        ? `{\n  "source": ["aws.ec2"]\n}`
        : `{\n  "source": ["aws.ec2"],\n  "detail-type": ["EC2 Instance State-change"],\n  "detail": {\n    "state": ["stopped"],\n    "instance-id": ["i-0abc123"]\n  }\n}`}</pre>
      <div className="eb-detail">
        {mode === "simple"
          ? <p><b>Simple filtering</b> — matches <b>any</b> EC2 event (start/stop/terminate). Broad: triggers the target on every EC2 state change.</p>
          : <p><b>Detailed filtering</b> — matches only when a <b>specific instance</b> reaches a <b>specific state</b> (stopped). Precise control over what triggers the target.</p>}
      </div>
      <p className="eb-note">🎯 One rule can fan out to <b>multiple targets</b> (Lambda + SNS + SQS). Also supports <b>schedule rules</b> (time-based) — but the modern way is the EventBridge Scheduler.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. SCHEDULER
   ════════════════════════════════════════════════════════════ */
export function EventBridgeScheduler() {
  const [mode, setMode] = useState("rate");
  return (
    <div className="sv-card">
      <div className="sv-title eb-title">⏰ EventBridge Scheduler</div>
      <p className="eb-intro">
        Some tasks are triggered by <b>time</b>, not events (stop EC2 nightly, daily backup, hourly cleanup). The
        <b> Scheduler</b> is a managed cron-in-the-cloud (the modern replacement for legacy schedule rules). Three types:
      </p>
      <div className="eb-toggle">
        <button className={mode === "rate" ? "active" : ""} onClick={() => setMode("rate")}>Rate</button>
        <button className={mode === "cron" ? "active" : ""} onClick={() => setMode("cron")}>Cron</button>
        <button className={mode === "once" ? "active" : ""} onClick={() => setMode("once")}>One-time</button>
      </div>
      <div className="eb-detail">
        {mode === "rate" && <p><b>Rate-based</b> — fixed interval, e.g. <code>rate(5 minutes)</code>, every 1 hour.</p>}
        {mode === "cron" && <p><b>Cron-based</b> — specific times, e.g. every day at 10 PM, every Monday at 9 AM (Linux-style cron expression).</p>}
        {mode === "once" && <p><b>One-time</b> — run once at an exact date/time (e.g. start EC2 tomorrow at 9 AM). New in Scheduler; not in legacy schedule rules.</p>}
      </div>
      <p className="eb-note">📌 Targets: Lambda, EC2 start/stop, Step Functions, SNS, SQS, API calls. Needs an IAM role with a custom trust policy for <code>scheduler.amazonaws.com</code>. Use cases: cost optimization, maintenance, ETL, reminders.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. CHEAT SHEET
   ════════════════════════════════════════════════════════════ */
const CHEATS = [
  { kw: ["event happens → action", "no polling", "serverless automation", "real-time"], a: "Amazon EventBridge" },
  { kw: ["route by content", "filter JSON event", "conditional trigger"], a: "EventBridge Rule (event pattern)" },
  { kw: ["run job at a time", "stop EC2 at night", "cron", "repeat task"], a: "EventBridge Scheduler" },
  { kw: ["content/JSON filtering", "advanced routing"], a: "EventBridge (vs SNS)" },
  { kw: ["broadcast", "fan-out", "notify many systems"], a: "SNS (vs EventBridge)" },
  { kw: ["understand event structure", "JSON preview"], a: "Schema Registry" },
];
export function EventBridgeCheatSheet() {
  const [open, setOpen] = useState(null);
  return (
    <div className="sv-card">
      <div className="sv-title eb-title">🎯 EventBridge Exam Cheat Sheet</div>
      <p className="eb-intro">Spot the keywords → pick the answer. Tap to reveal:</p>
      <div className="eb-cheats">
        {CHEATS.map((c, i) => (
          <div key={i} className={"eb-cheat" + (open === i ? " open" : "")} onClick={() => setOpen(open === i ? null : i)}>
            <div className="eb-cheat-kw">{c.kw.map((k, j) => <span key={j} className="eb-kwchip">{k}</span>)}</div>
            <div className="eb-cheat-a">{open === i ? `✅ ${c.a}` : "tap to reveal →"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
