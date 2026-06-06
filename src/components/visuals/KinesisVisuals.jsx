import React, { useState } from "react";
import "./KinesisVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. BATCH vs REAL-TIME
   ════════════════════════════════════════════════════════════ */
export function BatchVsRealtime() {
  const [mode, setMode] = useState("realtime");
  return (
    <div className="sv-card">
      <div className="sv-title kin-title">⚙️ Data Processing: Batch vs Real-Time</div>
      <p className="kin-intro">Data isn't useful raw — it's <b>processed</b> into results. Two styles (a requirement choice, not good/bad):</p>
      <div className="kin-toggle">
        <button className={mode === "batch" ? "active" : ""} onClick={() => setMode("batch")}>📦 Batch</button>
        <button className={mode === "realtime" ? "active" : ""} onClick={() => setMode("realtime")}>⚡ Real-Time</button>
      </div>
      <div className="kin-detail">
        {mode === "batch"
          ? <p><b>Batch processing</b> — collect data over time, process later in one go. Slower, delay acceptable, easy & cheap to build. Example: <b>NEFT</b> bank transfers (processed every ~30 min). Use for reports, billing, salary.</p>
          : <p><b>Real-time processing</b> — process each piece <b>as it arrives</b>, instantly. Fast, no delay, but complex & costly to build. Example: <b>UPI</b> payments (instant). Use for payments, tracking, alerts.</p>}
      </div>
      <p className="kin-note">💡 Prefer batch when possible (simpler, cheaper). When you genuinely need instant results, real-time is required — and AWS makes it easy with <b>Amazon Kinesis</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. KINESIS FAMILY
   ════════════════════════════════════════════════════════════ */
const FAMILY = [
  { id: "stream", t: "🌊 Data Streams", d: "Collect & store real-time streaming data temporarily so consumers can read & process it. The core ingestion pipeline." },
  { id: "firehose", t: "🚒 Data Firehose", d: "Process & deliver streaming data to destinations (S3, Redshift, OpenSearch, Splunk) — fully managed, no code." },
  { id: "flink", t: "📊 Managed Apache Flink", d: "Process & analyze streaming data in real time (formerly Kinesis Data Analytics)." },
];
export function KinesisFamily() {
  const [sel, setSel] = useState("stream");
  const f = FAMILY.find((x) => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title kin-title">🌊 Amazon Kinesis Family</div>
      <p className="kin-intro">Kinesis is an umbrella of services to collect, process &amp; analyze <b>real-time streaming data</b> at any scale. Click each:</p>
      <div className="kin-tabs">
        {FAMILY.map((x) => (
          <button key={x.id} className={"kin-tab" + (sel === x.id ? " active" : "")} onClick={() => setSel(x.id)}>{x.t}</button>
        ))}
      </div>
      <div className="kin-detail"><b>{f.t}</b><p>{f.d}</p></div>
      <p className="kin-note">🚕 Uber example: the driver app streams live location/status → Kinesis stores it → live-tracking, fare, notification & analytics systems read it in real time.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. TERMINOLOGY & FLOW
   ════════════════════════════════════════════════════════════ */
const TERMS = [
  { t: "📤 Producer", d: "Sends data to the stream (e.g. Uber driver app emitting location updates)." },
  { t: "📄 Record", d: "One small piece of data (one cab update) in JSON. One update = one record." },
  { t: "🌊 Stream", d: "The live data pipeline you create in Kinesis — where records continuously flow in." },
  { t: "🛣️ Shard", d: "A 'lane' inside the stream. More shards = more throughput. You set the shard count at creation." },
  { t: "🔢 Sequence Number", d: "A unique number Kinesis auto-assigns to each record so consumers know the order (1001, 1002…)." },
  { t: "📥 Consumer", d: "Reads & processes records (live tracking, fare calc, fraud detection, dashboards)." },
];
export function KinesisTerminology() {
  const [sel, setSel] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title kin-title">🧩 Data Streams Terminology &amp; Flow</div>
      <p className="kin-intro">Producer → Stream (shards) → Consumer. Click each term:</p>
      <div className="kin-flowbar">
        <span className="kin-fb">📤 Producer</span><span className="kin-fb-arr">→</span>
        <span className="kin-fb">🌊 Stream (🛣️ shards)</span><span className="kin-fb-arr">→</span>
        <span className="kin-fb">📥 Consumer</span>
      </div>
      <div className="kin-tabs wrap">
        {TERMS.map((t, i) => (
          <button key={i} className={"kin-tab" + (sel === i ? " active" : "")} onClick={() => setSel(i)}>{t.t}</button>
        ))}
      </div>
      <div className="kin-detail"><b>{TERMS[sel].t}</b><p>{TERMS[sel].d}</p></div>
      <p className="kin-note">🛣️ Think highway = stream, lane = shard, one cab update = record. More cabs → more shards to handle the traffic.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. STREAM vs FIREHOSE
   ════════════════════════════════════════════════════════════ */
const SF_ROWS = [
  ["Purpose", "Collect & store streaming data", "Deliver streaming data to destinations"],
  ["Code", "You write the consumer app", "No code — pre-configured"],
  ["Destinations", "Any (custom consumer)", "S3, Redshift, OpenSearch, Splunk"],
  ["Management", "You manage shards/scaling", "Fully managed, auto-scales"],
  ["Latency", "Real-time (sub-second)", "Near real-time (buffered)"],
];
export function StreamVsFirehose() {
  return (
    <div className="sv-card">
      <div className="sv-title kin-title">⚖️ Data Streams vs Firehose</div>
      <p className="kin-intro">Common exam confusion. <b>Firehose</b> = a pre-built "mediator" that takes data from a stream and delivers it to a destination without code:</p>
      <div className="kin-table">
        <div className="kin-row head"><span className="feat">Aspect</span><span className="ds">🌊 Data Streams</span><span className="fh">🚒 Firehose</span></div>
        {SF_ROWS.map((r, i) => (
          <div key={i} className="kin-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <div className="kin-arch">
        <span className="kin-arch-node">📤 Producer</span>→<span className="kin-arch-node">🌊 Stream</span>→<span className="kin-arch-node fh">🚒 Firehose</span>→<span className="kin-arch-node">🪣 S3 / Redshift</span>
      </div>
      <p className="kin-note">🔌 <b>Interface VPC Endpoint</b> (AWS PrivateLink) keeps producer↔Kinesis traffic on the AWS network — no internet/NAT/IGW. (S3 &amp; DynamoDB use gateway endpoints; everything else, incl. Kinesis, uses interface endpoints.)</p>
    </div>
  );
}
