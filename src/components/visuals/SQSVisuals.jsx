import React, { useState } from "react";
import "./SQSVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. SQS CONCEPT — async decoupling
   ════════════════════════════════════════════════════════════ */
export function SQSConcept() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title sqs-title">📨 What is SQS? (Async Decoupling)</div>
      <p className="sqs-intro">
        <b>SQS (Simple Queue Service)</b> is a managed queue for <b>asynchronous</b> communication. The producer drops a
        message and <b>moves on</b> — it doesn't wait for the consumer. The queue <b>buffers</b> messages so a slow/down
        consumer never loses work or blocks the producer. Toggle the consumer's state:
      </p>
      <div className="sqs-flow">
        <div className="sqs-node prod">📤 Producer<small>sends &amp; moves on</small></div>
        <div className="sqs-arrow">push →</div>
        <div className="sqs-queue">
          <div className="sqs-queue-label">📬 SQS Queue</div>
          <div className="sqs-msgs">
            {busy ? <><span>✉️</span><span>✉️</span><span>✉️</span><span>✉️</span></> : <span className="sqs-empty">drained</span>}
          </div>
        </div>
        <div className="sqs-arrow">← pull</div>
        <div className={"sqs-node cons" + (busy ? " down" : "")}>{busy ? "😵" : "🖥️"} Consumer<small>{busy ? "busy / down" : "processing"}</small></div>
      </div>
      <button className="sqs-btn" onClick={() => setBusy(!busy)}>{busy ? "▶ Consumer recovers" : "⏸ Make consumer busy"}</button>
      <p className="sqs-note">{busy
        ? "🛡️ Consumer is down — messages safely pile up in the queue. The producer is unaffected; nothing is lost. When the consumer recovers it catches up."
        : "✅ Decoupled: producer & consumer never talk directly. Handles traffic spikes, improves reliability, enables background processing. (vs synchronous = API Gateway, where the caller waits.)"}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. CORE COMPONENTS — pull-based
   ════════════════════════════════════════════════════════════ */
export function SQSComponents() {
  const [sel, setSel] = useState("producer");
  const parts = {
    producer: { t: "📤 Producer", d: "App that sends (pushes) messages to the queue, then continues immediately. Can be Lambda, EC2, API Gateway, on-prem app." },
    queue: { t: "📬 Queue", d: "AWS-managed waiting place that stores messages until a consumer reads them. It does NOT process messages." },
    message: { t: "✉️ Message", d: "The actual work/instructions (e.g. order ID, email, phone, notification type — 'send order confirmation')." },
    consumer: { t: "🖥️ Consumer", d: "App that PULLS messages, processes them, then DELETES them from the queue. Can be Lambda, EC2, ECS." },
  };
  const p = parts[sel];
  return (
    <div className="sv-card">
      <div className="sv-title sqs-title">🧩 Core Components &amp; Pull Model</div>
      <p className="sqs-intro">Four components. Click each:</p>
      <div className="sqs-tabs">
        {Object.entries(parts).map(([id, v]) => (
          <button key={id} className={"sqs-tab" + (sel === id ? " active" : "")} onClick={() => setSel(id)}>{v.t}</button>
        ))}
      </div>
      <div className="sqs-detail"><b>{p.t}</b><p>{p.d}</p></div>
      <p className="sqs-note">🎣 <b>Pull-based:</b> SQS never pushes. Consumers <b>poll</b> ("any messages for me?"). Rules: one message goes to <b>one</b> consumer at a time; multiple consumers can poll the same queue but won't get the same message; the consumer decides when to pull.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. STANDARD vs FIFO
   ════════════════════════════════════════════════════════════ */
const SF_ROWS = [
  ["Ordering", "❌ Not guaranteed", "✅ Strict (first-in first-out)"],
  ["Delivery", "At-least-once (can duplicate)", "Exactly-once (no duplicates)"],
  ["Throughput", "Virtually unlimited", "300/s (3,000/s batched)*"],
  ["Use case", "Emails, notifications, logs", "Payments, inventory, order states"],
];
export function StandardVsFIFO() {
  return (
    <div className="sv-card">
      <div className="sv-title sqs-title">⚖️ Standard vs FIFO Queue</div>
      <p className="sqs-intro">Two queue types. The deciding factors are <b>ordering</b> and <b>duplicate tolerance</b>:</p>
      <div className="sqs-table">
        <div className="sqs-row head"><span className="feat">Aspect</span><span className="std">📊 Standard</span><span className="fifo">🔢 FIFO</span></div>
        {SF_ROWS.map((r, i) => (
          <div key={i} className="sqs-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="sqs-note">📌 Standard = fast &amp; scalable, order not guaranteed, duplicates possible. FIFO = correct order, exactly-once, lower throughput. *Higher with high-throughput FIFO mode. FIFO queue names must end in <code>.fifo</code>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. QUEUE CONFIG (retention / delay / size)
   ════════════════════════════════════════════════════════════ */
const CONFIG = [
  { t: "⏳ Message Retention", d: "How long an undeleted message stays in the queue before auto-removal. Min 1 min, max 14 days, default 4 days." },
  { t: "⏰ Delivery Delay", d: "Hide a new message from consumers for N seconds (0–15 min, default 0). e.g. 'cancel within 2 minutes' — delay processing so a cancel can delete it first." },
  { t: "📦 Max Message Size", d: "Largest single message: 1 KB to 1024 KB (default 1024 KB). Larger payloads → store in S3, send a reference." },
];
export function QueueConfig() {
  const [sel, setSel] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title sqs-title">⚙️ Queue Configuration</div>
      <p className="sqs-intro">Key settings when creating a queue (besides visibility timeout &amp; polling). Click each:</p>
      <div className="sqs-tabs">
        {CONFIG.map((c, i) => (
          <button key={i} className={"sqs-tab" + (sel === i ? " active" : "")} onClick={() => setSel(i)}>{c.t}</button>
        ))}
      </div>
      <div className="sqs-detail"><b>{CONFIG[sel].t}</b><p>{CONFIG[sel].d}</p></div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. VISIBILITY TIMEOUT (interactive timeline)
   ════════════════════════════════════════════════════════════ */
export function VisibilityTimeout() {
  const [proc, setProc] = useState(40);
  const vt = 60;
  const dup = proc > vt;
  return (
    <div className="sv-card">
      <div className="sv-title sqs-title">👁️ Visibility Timeout</div>
      <p className="sqs-intro">
        When a consumer pulls a message, SQS keeps it but makes it <b>invisible</b> for the visibility timeout (default 30s,
        max 12h) — so no other consumer grabs it. If the consumer finishes &amp; deletes in time → done. If it crashes/takes
        too long → the message reappears for retry. Drag the processing time (timeout = <b>{vt}s</b>):
      </p>
      <div className="sqs-calc">
        <label>Consumer processing time: <b>{proc}s</b>
          <input type="range" min="10" max="90" step="5" value={proc} onChange={(e) => setProc(+e.target.value)} /></label>
      </div>
      <div className="sqs-timeline">
        <div className="sqs-tl-bar invisible" style={{ width: `${(vt / 90) * 100}%` }}>invisible ({vt}s)</div>
        <div className={"sqs-tl-marker" + (dup ? " bad" : " ok")} style={{ left: `${(proc / 90) * 100}%` }}>
          {dup ? "✗" : "✓"} {proc}s
        </div>
      </div>
      <p className={"sqs-note " + (dup ? "warn" : "ok")}>
        {dup
          ? `🚨 Processing (${proc}s) > timeout (${vt}s) → message reappears at ${vt}s and a SECOND consumer also processes it → DUPLICATE.`
          : `✅ Finishes (${proc}s) before timeout (${vt}s) → deleted cleanly, no duplicate.`}
      </p>
      <p className="sqs-note">📏 <b>Rule (exam):</b> set visibility timeout <b>greater than</b> the consumer's processing time.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. POLLING MODES
   ════════════════════════════════════════════════════════════ */
export function PollingModes() {
  const [mode, setMode] = useState("long");
  return (
    <div className="sv-card">
      <div className="sv-title sqs-title">🎣 Polling: Short vs Long</div>
      <p className="sqs-intro"><b>Receive Message Wait Time</b> sets how long a consumer waits when the queue is empty:</p>
      <div className="sqs-toggle">
        <button className={mode === "short" ? "active" : ""} onClick={() => setMode("short")}>⚡ Short (0s)</button>
        <button className={mode === "long" ? "active" : ""} onClick={() => setMode("long")}>⏳ Long (1–20s)</button>
      </div>
      <div className="sqs-poll-viz">
        {mode === "short"
          ? <>
              <div className="sqs-poll-row">poll → empty → return ↩</div>
              <div className="sqs-poll-row">poll → empty → return ↩</div>
              <div className="sqs-poll-row">poll → empty → return ↩</div>
              <div className="sqs-poll-note bad">many repeated calls → more API cost</div>
            </>
          : <>
              <div className="sqs-poll-row">poll → wait up to 20s … message arrives → process ✓</div>
              <div className="sqs-poll-note ok">fewer empty responses → lower cost</div>
            </>}
      </div>
      <div className="sqs-detail">
        {mode === "short"
          ? <p><b>Short polling (0s)</b> — returns immediately even if empty. Consumer keeps re-asking → more empty responses &amp; higher cost. Default.</p>
          : <p><b>Long polling (1–20s)</b> — the consumer waits up to N seconds for a message before returning. Fewer empty responses, lower cost, no re-request needed. Recommended.</p>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. DLQ + REDRIVE ALLOW POLICY
   ════════════════════════════════════════════════════════════ */
export function DLQRedrive() {
  const [tries, setTries] = useState(0);
  const max = 3;
  const moved = tries > max;
  return (
    <div className="sv-card">
      <div className="sv-title sqs-title">💀 Dead-Letter Queue (DLQ) &amp; Redrive</div>
      <p className="sqs-intro">
        A "poison" message a consumer can't process keeps reappearing after each visibility timeout → an <b>infinite retry
        loop</b>. A <b>DLQ</b> is a separate queue where messages land after <b>maxReceiveCount</b> failed attempts. Click "fail":
      </p>
      <div className="sqs-dlq-stage">
        <div className="sqs-dlq-main">
          <div className="sqs-dlq-label">📬 Main Queue</div>
          <div className="sqs-dlq-msg">{moved ? <span className="sqs-empty">clean ✓</span> : "☠️ bad msg"}</div>
          <div className="sqs-dlq-count">attempts: {Math.min(tries, max + 1)} / {max}</div>
        </div>
        <div className="sqs-dlq-arrow">{moved ? "moved →" : "retry ↻"}</div>
        <div className={"sqs-dlq-dead" + (moved ? " on" : "")}>
          <div className="sqs-dlq-label">💀 DLQ</div>
          <div className="sqs-dlq-msg">{moved ? "☠️ bad msg" : "—"}</div>
        </div>
      </div>
      <button className="sqs-btn" onClick={() => setTries(tries >= max + 1 ? 0 : tries + 1)}>{moved ? "↺ Reset" : "✗ Fail to process"}</button>
      <p className="sqs-note">📌 After <b>maxReceiveCount</b> ({max}) failures, SQS moves the message to the DLQ → main queue stays clean, no infinite loop. Use the DLQ to debug, fix, or replay.</p>
      <p className="sqs-note">🔒 <b>Redrive Allow Policy</b> (set on the DLQ) restricts <b>which source queues</b> may use it — "allow all", "deny all", or "by queue". Prevents a shared DLQ from getting messy.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. FIFO DEDUPLICATION + SCOPE + MESSAGE GROUP
   ════════════════════════════════════════════════════════════ */
export function FIFODedup() {
  const [tab, setTab] = useState("dedup");
  return (
    <div className="sv-card">
      <div className="sv-title sqs-title">🔢 FIFO: Deduplication &amp; Message Groups</div>
      <p className="sqs-intro">FIFO always prevents duplicates &amp; preserves order. Three settings to know — click each:</p>
      <div className="sqs-tabs">
        <button className={"sqs-tab" + (tab === "dedup" ? " active" : "")} onClick={() => setTab("dedup")}>Deduplication</button>
        <button className={"sqs-tab" + (tab === "group" ? " active" : "")} onClick={() => setTab("group")}>Message Group</button>
        <button className={"sqs-tab" + (tab === "scope" ? " active" : "")} onClick={() => setTab("scope")}>Dedup Scope</button>
      </div>
      {tab === "dedup" && (
        <div className="sqs-detail"><b>Content-Based Deduplication</b>
          <p><b>ON</b> → AWS hashes the <b>message body</b> as a fingerprint; identical bodies within <b>5 min</b> are rejected. <b>OFF</b> → the producer must supply a <b>MessageDeduplicationId</b>; same ID within 5 min is rejected.</p></div>
      )}
      {tab === "group" && (
        <>
          <div className="sqs-groups">
            <div className="sqs-group a">Group A: buy → pay → confirm <small>processed in order</small></div>
            <div className="sqs-group b">Group B: buy → pay → confirm <small>parallel to A</small></div>
          </div>
          <div className="sqs-detail"><b>MessageGroupId</b>
            <p>Tags messages that belong together (e.g. one customer's journey). Same group → strict order, one-by-one. Different groups → processed in <b>parallel</b>. Required for FIFO; set by the producer.</p></div>
        </>
      )}
      {tab === "scope" && (
        <div className="sqs-detail"><b>Deduplication Scope</b>
          <p><b>Message Group</b> → check duplicates within each group (faster; default). e.g. cart actions per customer. <b>Queue</b> → check across the whole queue (slower). e.g. globally-unique payment transaction IDs.</p></div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. FIFO THROUGHPUT
   ════════════════════════════════════════════════════════════ */
export function FIFOThroughput() {
  const [mode, setMode] = useState("group");
  return (
    <div className="sv-card">
      <div className="sv-title sqs-title">🚀 FIFO Throughput Limit</div>
      <p className="sqs-intro">FIFO trades throughput for ordering. Two limit modes — pick based on your <b>consumer's</b> capacity:</p>
      <div className="sqs-toggle">
        <button className={mode === "queue" ? "active" : ""} onClick={() => setMode("queue")}>Per Queue</button>
        <button className={mode === "group" ? "active" : ""} onClick={() => setMode("group")}>Per Message Group ID</button>
      </div>
      <div className="sqs-detail">
        {mode === "queue"
          ? <p><b>Per Queue</b> — fixed cap: <b>300 msg/s</b> (or <b>3,000/s</b> batched) across the whole queue. Predictable. Best when the backend handles only limited requests/sec.</p>
          : <p><b>Per Message Group ID</b> — no fixed cap; throughput scales with the <b>number of groups</b> (one msg/s per group, processed in parallel). Highly scalable. Best when your whole pipeline (incl. consumer) can scale.</p>}
      </div>
      <p className="sqs-note">⚡ Enabling <b>High-Throughput FIFO</b> auto-selects dedup scope = <b>Message Group</b> and limit = <b>Per Message Group ID</b> (both the faster options). No price difference — choose by requirement, not "scalable = better".</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   10. SQS INTEGRATIONS
   ════════════════════════════════════════════════════════════ */
export function SQSIntegrations() {
  const [tab, setTab] = useState("ec2");
  return (
    <div className="sv-card">
      <div className="sv-title sqs-title">🔗 SQS Integrations (Exam Scenarios)</div>
      <p className="sqs-intro">
        Roles: <b>Producers</b> — Lambda, EC2, ECS, EKS, <b>S3</b>, <b>SNS</b>, <b>EventBridge</b> (S3/SNS/EventBridge can't
        consume). <b>Consumers</b> — Lambda, EC2, ECS, EKS. Manage/monitor (never producer/consumer): <b>IAM, CloudWatch,
        KMS</b>. Click a scenario:
      </p>
      <div className="sqs-tabs">
        <button className={"sqs-tab" + (tab === "ec2" ? " active" : "")} onClick={() => setTab("ec2")}>EC2 workers</button>
        <button className={"sqs-tab" + (tab === "lambda" ? " active" : "")} onClick={() => setTab("lambda")}>Lambda</button>
        <button className={"sqs-tab" + (tab === "s3" ? " active" : "")} onClick={() => setTab("s3")}>S3 + Lambda</button>
        <button className={"sqs-tab" + (tab === "priority" ? " active" : "")} onClick={() => setTab("priority")}>Priority</button>
      </div>
      <div className="sqs-detail">
        {tab === "ec2" && <p><b>EC2 worker nodes + Auto Scaling</b> — consumer EC2s ("worker nodes") poll the queue (polling logic in app code). Key exam point: scale the ASG on the <b>SQS queue depth</b> (<code>ApproximateNumberOfMessagesVisible</code>) — <b>NOT</b> CPU — because CPU stays low while a backlog builds.</p>}
        {tab === "lambda" && <p><b>Lambda consumer</b> — Lambda is event-driven, so it doesn't poll itself. <b>Event Source Mapping</b> (an AWS-managed config that <b>belongs to Lambda</b>) polls SQS in batches and invokes the function. Scaling is automatic with message volume — no code, no ASG.</p>}
        {tab === "s3" && <p><b>S3 → SQS → Lambda</b> — uploading an image fires an S3 <b>event notification</b> to SQS; Lambda watermarks it later. Why SQS in the middle (not S3→Lambda direct)? Buffers spikes, prevents lost tasks, retries failures, and the user doesn't wait ("upload first, process later").</p>}
        {tab === "priority" && <p><b>Priority processing</b> — SQS has no in-queue priority. Use <b>two queues</b> (paid vs free). EC2: poll the paid queue first (app logic). Lambda: two functions with <b>reserved concurrency</b> (e.g. paid 100, free 10) → paid processes ~10× faster.</p>}
      </div>
    </div>
  );
}
