import React, { useState } from "react";
import "./SNSVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. PUB/SUB MODEL — push-based
   ════════════════════════════════════════════════════════════ */
export function PubSubModel() {
  const [sent, setSent] = useState(false);
  const subs = ["💳 Lambda (payment)", "📦 SQS (inventory)", "📧 Lambda (email)", "🚚 HTTP (shipping)"];
  return (
    <div className="sv-card">
      <div className="sv-title sns-title">📢 SNS — Pub/Sub (Push Model)</div>
      <p className="sns-intro">
        <b>SNS (Simple Notification Service)</b> is a managed <b>publish/subscribe</b> service: one message is <b>pushed</b>
        instantly to many subscribers. The <b>publisher</b> doesn't know the subscribers; subscribers just listen to a
        <b> topic</b> → fully <b>decoupled</b>. Click publish:
      </p>
      <div className="sns-pubsub">
        <div className="sns-pub">📤 Publisher<small>order service</small></div>
        <div className="sns-arrow">{sent ? "✦ publish ✦" : "publish →"}</div>
        <div className="sns-topic">📢 SNS Topic<small>broadcast hub</small></div>
        <div className="sns-fanlines">
          {subs.map((s, i) => (
            <div key={i} className={"sns-sub" + (sent ? " lit" : "")} style={{ transitionDelay: `${i * 80}ms` }}>{s}</div>
          ))}
        </div>
      </div>
      <button className="sns-btn" onClick={() => setSent(!sent)}>{sent ? "↺ Reset" : "📨 Publish one message"}</button>
      <p className="sns-note">{sent
        ? "✅ One publish → ALL subscribers get it simultaneously. No direct connections between services."
        : "📌 Without SNS, the order service would call payment, inventory, email & shipping directly → complex, tightly coupled, one failure breaks all. SNS = one publish, many receivers."}</p>
      <p className="sns-note">🔁 <b>SNS vs SQS:</b> SNS <b>pushes</b> to many subscribers instantly (pub/sub); SQS holds messages for <b>one</b> consumer to <b>pull</b> later (queue).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. CORE COMPONENTS
   ════════════════════════════════════════════════════════════ */
export function SNSComponents() {
  const [sel, setSel] = useState("topic");
  const parts = {
    publisher: { t: "📤 Publisher", d: "Creates an event & sends a message to a topic — not part of SNS. Can be EC2, ECS, Lambda, API Gateway, or any SDK/CLI app. Only knows the topic, not the subscribers." },
    topic: { t: "📢 Topic", d: "The communication channel / broadcast hub you create in SNS. Single entry point; distributes each message to all its subscribers." },
    subscriber: { t: "📥 Subscriber", d: "Registers (subscribes) to a topic to receive messages. AWS: Lambda, SQS, Kinesis Data Firehose. External: HTTP/HTTPS, email, SMS, mobile push." },
  };
  const p = parts[sel];
  return (
    <div className="sv-card">
      <div className="sv-title sns-title">🧩 SNS Core Components</div>
      <p className="sns-intro">Three components form the pub/sub system. Click each:</p>
      <div className="sns-tabs">
        {Object.entries(parts).map(([id, v]) => (
          <button key={id} className={"sns-tab" + (sel === id ? " active" : "")} onClick={() => setSel(id)}>{v.t}</button>
        ))}
      </div>
      <div className="sns-detail"><b>{p.t}</b><p>{p.d}</p></div>
      <p className="sns-note">📌 A subscriber must <b>confirm</b> its subscription before it receives messages (e.g. email gets a confirmation link). Subscriptions stay <b>Pending</b> until confirmed.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. STANDARD vs FIFO TOPIC
   ════════════════════════════════════════════════════════════ */
const SF_ROWS = [
  ["Name", "Any", "Must end in .fifo"],
  ["Ordering", "❌ Not guaranteed", "✅ Strict"],
  ["Delivery", "At-least-once (duplicates)", "Exactly-once (dedup ID)"],
  ["Throughput", "Very high", "Lower"],
  ["Subscribers", "SQS, Lambda, HTTP, email, SMS…", "ONLY SQS FIFO"],
  ["Fan-out", "Full", "Limited"],
];
export function StandardVsFIFOTopic() {
  return (
    <div className="sv-card">
      <div className="sv-title sns-title">⚖️ Standard vs FIFO Topic</div>
      <p className="sns-intro">Like SQS, SNS has two topic types. The big differences:</p>
      <div className="sns-table">
        <div className="sns-row head"><span className="feat">Aspect</span><span className="std">📊 Standard</span><span className="fifo">🔢 FIFO</span></div>
        {SF_ROWS.map((r, i) => (
          <div key={i} className="sns-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="sns-note">🔑 Biggest catch: a <b>FIFO topic</b> can only fan out to <b>SQS FIFO queues</b> — not email/SMS/Lambda/HTTP. Use Standard for notifications; FIFO when order matters (payments, banking, order lifecycle).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. TOPIC CONFIG
   ════════════════════════════════════════════════════════════ */
const CONFIG = [
  { t: "🔐 Encryption", d: "Server-side encryption at rest via AWS-managed or customer-managed KMS key (same as SQS). In transit is HTTPS/TLS by default." },
  { t: "📜 Access Policy", d: "Resource-based policy defining who can publish to / subscribe to the topic — used for cross-account access (like SQS access policy)." },
  { t: "📊 Delivery Status Logging", d: "Logs whether each delivery succeeded/failed to CloudWatch Logs — useful since SNS pushes and a subscriber may be unavailable." },
  { t: "🔁 Delivery Retry Policy", d: "For HTTP/S subscribers, controls retry attempts & backoff if the endpoint fails. (Lambda/SQS retries are managed by AWS.)" },
  { t: "🔎 Active Tracing", d: "Integrates with AWS X-Ray to trace a message's full journey (publisher → SNS → Lambda → DB) for debugging." },
  { t: "🏷️ Tags", d: "Key-value labels to organize resources, track cost, and identify environment." },
];
export function TopicConfig() {
  const [sel, setSel] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title sns-title">⚙️ Topic Configuration Options</div>
      <p className="sns-intro">Key settings when creating a topic. Click each:</p>
      <div className="sns-tabs wrap">
        {CONFIG.map((c, i) => (
          <button key={i} className={"sns-tab" + (sel === i ? " active" : "")} onClick={() => setSel(i)}>{c.t}</button>
        ))}
      </div>
      <div className="sns-detail"><b>{CONFIG[sel].t}</b><p>{CONFIG[sel].d}</p></div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. FAN-OUT (SNS + SQS)
   ════════════════════════════════════════════════════════════ */
export function FanOut() {
  return (
    <div className="sv-card">
      <div className="sv-title sns-title">🌟 Fan-Out (SNS + SQS)</div>
      <p className="sns-intro">
        The classic pattern: one message published to an SNS topic is <b>fanned out</b> to multiple <b>SQS queues</b> (and
        other subscribers) at once. Each queue's consumer processes independently &amp; at its own pace.
      </p>
      <div className="sns-fanout">
        <div className="sns-fo-pub">📤 Order placed</div>
        <div className="sns-fo-arrow">→</div>
        <div className="sns-fo-topic">📢 SNS Topic</div>
        <div className="sns-fo-arrow">→</div>
        <div className="sns-fo-queues">
          <div className="sns-fo-q">📦 Inventory SQS</div>
          <div className="sns-fo-q">💳 Payment SQS</div>
          <div className="sns-fo-q">📊 Analytics SQS</div>
        </div>
      </div>
      <p className="sns-note ok">✅ Why SNS→SQS (not SNS direct)? The <b>queue buffers</b> each message → durability, retries, DLQs, and consumers can be down without losing data. Best of both: SNS broadcast + SQS reliability.</p>
      <p className="sns-note">🔢 For ordered fan-out, use a <b>FIFO topic → FIFO queues</b>. Standard topic → standard queues for high-throughput notifications.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. SUBSCRIPTION FILTER POLICY
   ════════════════════════════════════════════════════════════ */
export function FilterPolicy() {
  const [order, setOrder] = useState("high");
  const routes = {
    high: ["💳 High-value SQS"],
    normal: ["📦 Standard SQS"],
    intl: ["🌍 International SQS", "📦 Standard SQS"],
  };
  return (
    <div className="sv-card">
      <div className="sv-title sns-title">🔎 Subscription Filter Policy</div>
      <p className="sns-intro">
        Without a filter, every subscriber gets <b>every</b> message. A <b>filter policy</b> (JSON on the subscription)
        matches <b>message attributes</b> so each subscriber only gets relevant messages. Publish an order:
      </p>
      <div className="sns-toggle">
        <button className={order === "high" ? "active" : ""} onClick={() => setOrder("high")}>order: amount&gt;1000</button>
        <button className={order === "normal" ? "active" : ""} onClick={() => setOrder("normal")}>order: normal</button>
        <button className={order === "intl" ? "active" : ""} onClick={() => setOrder("intl")}>order: international</button>
      </div>
      <div className="sns-filter-out">
        <div className="sns-filter-topic">📢 Topic routes to →</div>
        <div className="sns-filter-targets">
          {routes[order].map((r, i) => <div key={i} className="sns-filter-target">{r}</div>)}
        </div>
      </div>
      <p className="sns-note">📌 The topic evaluates each subscription's filter against the message attributes and delivers <b>only matching</b> messages. Saves cost &amp; processing vs filtering inside every consumer. Common for routing by type/region/priority.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. DATA PROTECTION POLICY
   ════════════════════════════════════════════════════════════ */
export function DataProtectionPolicy() {
  const [on, setOn] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title sns-title">🛡️ Data Protection Policy (PII)</div>
      <p className="sns-intro">
        A <b>data protection policy</b> scans messages for <b>sensitive data</b> (PII like emails, phone numbers, card
        numbers) and can <b>audit</b>, <b>mask/redact</b>, or <b>block/deny</b> them. Toggle protection:
      </p>
      <div className="sns-toggle">
        <button className={!on ? "active" : ""} onClick={() => setOn(false)}>Off</button>
        <button className={on ? "active" : ""} onClick={() => setOn(true)}>Mask PII</button>
      </div>
      <div className="sns-dpp-msg">
        {on
          ? <>Card: <b className="mask">****-****-****-1234</b> · Phone: <b className="mask">+91-*****-***00</b></>
          : <>Card: <b className="leak">4716-2210-5567-1234</b> · Phone: <b className="leak">+91-98765-43200</b></>}
      </div>
      <p className={"sns-note " + (on ? "ok" : "warn")}>
        {on
          ? "✅ Masking ON → sensitive fields are redacted before delivery to subscribers. Helps meet compliance (GDPR, PCI)."
          : "⚠️ No policy → raw PII is delivered to every subscriber. Risk of leaks & compliance violations."}
      </p>
    </div>
  );
}
