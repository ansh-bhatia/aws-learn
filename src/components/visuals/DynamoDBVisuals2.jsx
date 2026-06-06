import React, { useState } from "react";
import "./DynamoDBVisuals2.css";

/* ════════════════════════════════════════════════════════════
   1. PROVISIONED MODE + AUTO-SCALING
   ════════════════════════════════════════════════════════════ */
export function ProvisionedMode() {
  const [traffic, setTraffic] = useState(70);
  const min = 100, max = 200, target = 70;
  // allocated capacity tracks traffic to keep target utilization
  const needed = Math.round((traffic / target) * 100);
  const allocated = Math.min(max, Math.max(min, needed));
  const throttled = traffic > (max * target) / 100 + 0.5;
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">📐 Provisioned Capacity + Auto-Scaling</div>
      <p className="ddb2-intro">
        <b>Provisioned mode</b> = you allocate a <b>fixed</b> RCU/WCU; you pay for it whether used or not. Risks:
        <b> under-provisioning</b> → throttling, and <b>over-provisioning</b> → wasted money. <b>Auto-scaling</b> fixes this with
        a <b>min</b>, <b>max</b>, and <b>target utilization %</b>. Drag the traffic:
      </p>
      <div className="ddb2-calc">
        <label>Incoming read traffic (RCU actually used): <b>{traffic}</b>
          <input type="range" min="20" max="220" value={traffic} onChange={(e) => setTraffic(+e.target.value)} /></label>
      </div>
      <div className="ddb2-prov-bars">
        <div className="ddb2-prov-row"><span>Min ({min})</span><div className="ddb2-track"><div className="ddb2-fill min" style={{ width: `${(min / 220) * 100}%` }} /></div></div>
        <div className="ddb2-prov-row"><span>Allocated ({allocated})</span><div className="ddb2-track"><div className="ddb2-fill alloc" style={{ width: `${(allocated / 220) * 100}%` }} /></div></div>
        <div className="ddb2-prov-row"><span>Max ({max})</span><div className="ddb2-track"><div className="ddb2-fill max" style={{ width: `${(max / 220) * 100}%` }} /></div></div>
        <div className="ddb2-prov-row"><span>Traffic ({traffic})</span><div className="ddb2-track"><div className={"ddb2-fill traffic" + (throttled ? " over" : "")} style={{ width: `${(traffic / 220) * 100}%` }} /></div></div>
      </div>
      <p className={"ddb2-note " + (throttled ? "warn" : "ok")}>
        {throttled
          ? `🚨 Traffic exceeds max capacity (${max}) → requests THROTTLED. Raise the max or use On-Demand.`
          : `✅ Auto-scaling keeps utilization near ${target}%. Allocated = ${allocated} RCU (clamped between min ${min} and max ${max}). You always pay for at least the min (${min}).`}
      </p>
      <p className="ddb2-note">💡 Best for <b>predictable, steady</b> workloads where you can estimate traffic. Auto-scaling adjusts allocation up/down to hold the target utilization, scaling down to min when traffic drops.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. WARM THROUGHPUT
   ════════════════════════════════════════════════════════════ */
export function WarmThroughput() {
  const [warm, setWarm] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">🔥 Warm Throughput</div>
      <p className="ddb2-intro">
        When traffic spikes, scaling up capacity <b>takes time</b> (minutes) — during which users get <b>throttled</b>.
        <b> Warm Throughput</b> pre-allocates standby capacity so your table can absorb spikes <b>instantly</b>. Toggle it:
      </p>
      <div className="ddb2-toggle">
        <button className={!warm ? "active" : ""} onClick={() => setWarm(false)}>❄️ Without Warm Throughput</button>
        <button className={warm ? "active" : ""} onClick={() => setWarm(true)}>🔥 With Warm Throughput</button>
      </div>
      {warm ? (
        <div className="ddb2-dep-detail ok">
          <p><b>Spike absorbed instantly — no throttling.</b></p>
          <ul>
            <li>Capacity is <b>pre-warmed / reserved</b> as standby, ready to use immediately.</li>
            <li><b>On-Demand default:</b> reserves <b>12,000 RCU + 4,000 WCU</b> in advance (auto-tunes to your usage pattern over time).</li>
            <li><b>Provisioned default:</b> pre-warms the <b>same</b> number you provisioned.</li>
            <li>Pricing: <b>no</b> one-time fee at default; you pay only for capacity you actually <b>use</b>. Raising the warm value above default costs a <b>one-time fee for the extra</b> units.</li>
          </ul>
        </div>
      ) : (
        <div className="ddb2-dep-detail warn">
          <p><b>Spike hits before scaling completes → bad experience.</b></p>
          <ul>
            <li>Scaling 100→200 RCU can take ~5 minutes.</li>
            <li>During the delay: <b>throttling</b>, slow responses, failed requests, missed opportunity.</li>
          </ul>
        </div>
      )}
      <p className="ddb2-note">⚙️ Works in <b>both</b> On-Demand and Provisioned (auto-scaling on/off). Manual scaling also uses warm throughput during the scale-up.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. SECONDARY INDEXES — LSI vs GSI
   ════════════════════════════════════════════════════════════ */
const IDX_ROWS = [
  ["Partition key", "Same as base table", "Can be different attribute"],
  ["Sort key", "Different (new) sort key", "Optional, any attribute"],
  ["When created", "ONLY at table creation", "Anytime (add/remove later)"],
  ["Max per table", "5", "20 (default)"],
  ["Capacity (RCU/WCU)", "Shares base table's", "Has its OWN provisioned capacity"],
  ["Consistency", "Strong OR eventual", "Eventual ONLY"],
  ["Storage", "Shares base table partition", "Separate storage"],
];
export function SecondaryIndexes() {
  const [t, setT] = useState("lsi");
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">🔎 Secondary Indexes — LSI vs GSI</div>
      <p className="ddb2-intro">
        By default you can only query by the primary key. <b>Secondary indexes</b> enable new query patterns (e.g. query a
        customer's orders by <code>invoice_id</code> instead of <code>order_id</code>). Two types:
      </p>
      <div className="ddb2-toggle">
        <button className={t === "lsi" ? "active" : ""} onClick={() => setT("lsi")}>📍 LSI (Local)</button>
        <button className={t === "gsi" ? "active" : ""} onClick={() => setT("gsi")}>🌐 GSI (Global)</button>
      </div>
      {t === "lsi" ? (
        <div className="ddb2-dep-detail">
          <p><b>Local Secondary Index</b> — <b>same partition key</b> as the base table, but a <b>new sort key</b>.</p>
          <ul>
            <li>Enables new query patterns <b>within the same partition</b> (e.g. "orders for customer C1 sorted by invoice_id").</li>
            <li>Shares the base table's storage and RCU/WCU.</li>
            <li><b>Must be defined at table creation</b> — can't add later. Max <b>5</b> per table.</li>
          </ul>
        </div>
      ) : (
        <div className="ddb2-dep-detail purple">
          <p><b>Global Secondary Index</b> — a <b>completely different</b> partition key (and optional sort key).</p>
          <ul>
            <li>Query across the whole table by any attribute, regardless of the base partition key.</li>
            <li>Has its <b>own</b> provisioned throughput and separate storage.</li>
            <li>Can be <b>added/removed anytime</b>. Max <b>20</b> per table. <b>Eventual consistency only.</b></li>
          </ul>
        </div>
      )}
      <div className="ddb2-idx-table">
        <div className="ddb2-idx-row head"><span className="feat">Feature</span><span className="lsi">LSI</span><span className="gsi">GSI</span></div>
        {IDX_ROWS.map((r, i) => (
          <div key={i} className="ddb2-idx-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="ddb2-note">📦 <b>Attribute projection</b> (both): choose which attributes copy into the index — <b>All</b>, <b>Keys-only</b>, or <b>Include</b> (specific attributes) — to balance speed vs storage cost.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. RESOURCE-BASED POLICY
   ════════════════════════════════════════════════════════════ */
const POLICY_PARTS = [
  { k: "Effect", v: '"Allow"', d: "Allow or Deny the action." },
  { k: "Principal", v: '"arn:aws:iam::111122223333:user/Lara"', d: "WHO gets access — IAM user/role, or another AWS account (great for cross-account)." },
  { k: "Action", v: '"dynamodb:Query"', d: "WHAT they can do — e.g. GetItem, PutItem, Query." },
  { k: "Resource", v: '"arn:aws:dynamodb:...:table/StudentData"', d: "The table/index ARN (required even though the policy attaches to the table)." },
  { k: "Condition", v: '{ "IpAddress": { "aws:SourceIp": "10.0.0.0/24" } }', d: "Extra rules — IP range, time, etc." },
];
export function ResourcePolicy() {
  const [sel, setSel] = useState(1);
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">🛡️ Resource-Based Policy</div>
      <p className="ddb2-intro">
        A JSON policy <b>attached directly to a table/index</b> (not to an IAM user) that controls <b>who / what / under which
        conditions</b>. Ideal for <b>cross-account</b> access without granting full account access. Click each part:
      </p>
      <div className="ddb2-policy">
        <div className="ddb2-policy-json">
          {POLICY_PARTS.map((p, i) => (
            <div key={i} className={"ddb2-policy-line" + (sel === i ? " active" : "")} onClick={() => setSel(i)}>
              <span className="ddb2-pk">"{p.k}"</span>: <span className="ddb2-pv">{p.v}</span>
            </div>
          ))}
        </div>
        <div className="ddb2-policy-detail">
          <div className="ddb2-policy-dt">{POLICY_PARTS[sel].k}</div>
          <div className="ddb2-policy-dd">{POLICY_PARTS[sel].d}</div>
        </div>
      </div>
      <p className="ddb2-note">📝 Example: "Let account 1111… <b>read-only</b> the StudentData table, but <b>only</b> from IP range 10.0.0.0/24." Exam loves asking what access a given JSON policy grants.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. GLOBAL TABLES — multi-region replication
   ════════════════════════════════════════════════════════════ */
export function GlobalTables() {
  const [region, setRegion] = useState("india");
  const regions = {
    india: { label: "🇮🇳 Mumbai (India)", x: 50 },
    us: { label: "🇺🇸 N. Virginia (US)", x: 12 },
    eu: { label: "🇪🇺 Frankfurt (EU)", x: 30 },
  };
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">🌍 Global Tables — Multi-Region, Active-Active</div>
      <p className="ddb2-intro">
        Problem: an India-hosted table gives US/EU users <b>high latency</b>, has <b>no regional failover</b>, and becomes a
        <b> bottleneck</b>. <b>Global Tables</b> replicate the table across regions — every replica is <b>writable</b>. Click a
        region to write there:
      </p>
      <div className="ddb2-gt-map">
        {Object.entries(regions).map(([id, r]) => (
          <div key={id} className={"ddb2-gt-node" + (region === id ? " active" : "")} style={{ left: `${r.x}%` }} onClick={() => setRegion(id)}>
            <div className="ddb2-gt-globe">🗄️</div>
            <div className="ddb2-gt-lbl">{r.label}</div>
            {region === id && <div className="ddb2-gt-write">✍️ write here</div>}
          </div>
        ))}
        <div className="ddb2-gt-sync">⟷ auto-sync (DynamoDB Streams)</div>
      </div>
      <p className="ddb2-note ok">
        ✅ Writing to <b>{regions[region].label}</b> replicates to all other regions in ~seconds. Benefits: <b>low-latency</b>
        local reads, <b>high availability / DR</b> (auto-failover if a region fails), and <b>automatic sync</b>.
      </p>
      <p className="ddb2-note warn">
        ⚙️ Requires <b>DynamoDB Streams</b> enabled (turned on automatically). Replication is <b>eventually consistent</b>;
        write conflicts resolved by <b>last-writer-wins</b> (timestamp).
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. BACKUPS — PITR vs On-Demand
   ════════════════════════════════════════════════════════════ */
const BACKUP_ROWS = [
  ["Trigger", "Continuous / automatic", "Manual (or scheduled)"],
  ["Granularity", "Any second in last 35 days", "Snapshot at a point in time"],
  ["Restore window", "Last 35 days only", "Until you delete it (indefinite)"],
  ["Retention", "Auto-managed 35-day window", "Kept until manually deleted"],
  ["Use case", "Disaster recovery, accidental change", "Archival, compliance, migration"],
];
export function Backups() {
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">💾 Backups — PITR vs On-Demand</div>
      <p className="ddb2-intro">
        DynamoDB backups protect data <b>without impacting performance</b>. Two options — know the differences for the exam:
      </p>
      <div className="ddb2-idx-table">
        <div className="ddb2-idx-row head"><span className="feat">Aspect</span><span className="lsi">⏱️ Point-in-Time Recovery</span><span className="gsi">📦 On-Demand Backup</span></div>
        {BACKUP_ROWS.map((r, i) => (
          <div key={i} className="ddb2-idx-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="ddb2-note">🔑 <b>PITR</b> = restore to any second within the <b>last 35 days</b> (continuous, off by default — turn it on). <b>On-Demand</b> = full manual snapshot kept <b>indefinitely</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. EXPORT TO S3 — full/incremental + file format
   ════════════════════════════════════════════════════════════ */
export function ExportToS3() {
  const [type, setType] = useState("full");
  const [fmt, setFmt] = useState("json");
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">📤 Export to S3</div>
      <p className="ddb2-intro">
        Export table data to S3 for <b>analytics, compliance, archival, or sharing</b> — without affecting table performance.
        <b> Requires PITR to be ON.</b> Two export types &amp; two file formats:
      </p>
      <div className="ddb2-toggle">
        <button className={type === "full" ? "active" : ""} onClick={() => setType("full")}>📦 Full Export</button>
        <button className={type === "incremental" ? "active" : ""} onClick={() => setType("incremental")}>➕ Incremental Export</button>
      </div>
      <div className="ddb2-dep-detail">
        {type === "full"
          ? <p><b>Full export</b> — all data, either at <b>current time</b> (everything since table creation) or from an <b>earlier point in time</b> (within the last <b>35 days</b>, PITR limit).</p>
          : <p><b>Incremental export</b> — only data <b>changed</b> (added/updated/deleted) in a chosen time window. Must follow a full export first; avoids re-exporting the whole table.</p>}
      </div>
      <div className="ddb2-intro" style={{ margin: "16px 0 10px" }}><b>Exported file format:</b></div>
      <div className="ddb2-toggle">
        <button className={fmt === "json" ? "active" : ""} onClick={() => setFmt("json")}>DynamoDB JSON</button>
        <button className={fmt === "ion" ? "active" : ""} onClick={() => setFmt("ion")}>Amazon Ion</button>
      </div>
      <div className={"ddb2-dep-detail " + (fmt === "ion" ? "purple" : "")}>
        {fmt === "json"
          ? <p><b>DynamoDB JSON</b> — includes explicit data types (<code>S</code>, <code>N</code>, <code>BOOL</code>). Use when you plan to <b>re-import back into DynamoDB</b>.</p>
          : <p><b>Amazon Ion</b> — no explicit DynamoDB types, richer/flexible types. Use for <b>analytics</b> with Athena, Glue, Redshift.</p>}
      </div>
      <p className="ddb2-note">🔐 Destination bucket can be in <b>the same or a different AWS account</b>. Encrypt with <b>SSE-S3</b> (AWS-managed) or <b>SSE-KMS</b> (your keys — for compliance/audit/rotation).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. STREAMS & TRIGGERS + Kinesis comparison
   ════════════════════════════════════════════════════════════ */
const STREAM_STEPS = [
  { ic: "🛒", t: "Order placed", d: "User places an order → item added to the DynamoDB table (a change occurs)." },
  { ic: "📡", t: "Stream captures change", d: "DynamoDB Stream records the insert/update/delete as an event, stored for 24 hours." },
  { ic: "⚡", t: "Trigger fires Lambda", d: "The trigger invokes a Lambda function to process the change. (Trigger needs Stream enabled — no stream, no trigger.)" },
  { ic: "📱", t: "Notify user", d: "Lambda calls SNS / WhatsApp / email → user gets instant order confirmation." },
];
export function StreamsTriggers() {
  const [step, setStep] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">📡 Streams &amp; Triggers</div>
      <p className="ddb2-intro">
        <b>DynamoDB Streams</b> capture every item change (insert/update/delete) as events (kept <b>24h</b>). A <b>Trigger</b>
        connects the stream to a <b>Lambda</b> for real-time actions — like Amazon's instant order notifications. Step through:
      </p>
      <div className="ddb2-st-track">
        {STREAM_STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div className={"ddb2-st-node" + (step >= i ? " on" : "")} onClick={() => setStep(i)}>
              <span className="ddb2-st-ic">{s.ic}</span>
            </div>
            {i < STREAM_STEPS.length - 1 && <div className={"ddb2-st-arrow" + (step > i ? " on" : "")}>→</div>}
          </React.Fragment>
        ))}
      </div>
      <div className="ddb2-st-detail">
        <b>{STREAM_STEPS[step].t}</b>
        <p>{STREAM_STEPS[step].d}</p>
      </div>
      <p className="ddb2-note warn">📌 <b>Exam tips:</b> Triggers <b>require</b> Streams. Streams are also required to enable <b>Global Tables</b>. Streams also log <b>who changed what &amp; when</b> (auditing).</p>
      <div className="ddb2-intro" style={{ margin: "16px 0 8px" }}><b>DynamoDB Stream vs Kinesis Data Stream:</b></div>
      <div className="ddb2-idx-table">
        <div className="ddb2-idx-row head"><span className="feat">Aspect</span><span className="lsi">DynamoDB Stream</span><span className="gsi">Kinesis Data Stream</span></div>
        <div className="ddb2-idx-row"><span className="feat">Built for</span><span>DynamoDB only (built-in)</span><span>General streaming service</span></div>
        <div className="ddb2-idx-row"><span className="feat">Setup</span><span>Just toggle on</span><span>Create stream + shards, needs Kinesis knowledge</span></div>
        <div className="ddb2-idx-row"><span className="feat">Use case</span><span>Triggers, lightweight processing</span><span>Advanced analytics, large-scale pipelines</span></div>
        <div className="ddb2-idx-row"><span className="feat">Retention</span><span>24 hours</span><span>Up to 365 days</span></div>
        <div className="ddb2-idx-row"><span className="feat">Cost</span><span>Included in DynamoDB pricing</span><span>Separate (per shard/usage)</span></div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. DAX — caching accelerator
   ════════════════════════════════════════════════════════════ */
export function DAXFlow() {
  const [mode, setMode] = useState("hit");
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">⚡ DAX — DynamoDB Accelerator</div>
      <p className="ddb2-intro">
        <b>DAX</b> is an <b>in-memory cache</b> for DynamoDB → up to <b>10× faster</b> reads, from <b>milliseconds to
        microseconds</b>. Your app talks to DAX (via the DAX client) instead of DynamoDB. Pick a scenario:
      </p>
      <div className="ddb2-toggle">
        <button className={mode === "hit" ? "active" : ""} onClick={() => setMode("hit")}>✅ Cache Hit</button>
        <button className={mode === "miss" ? "active" : ""} onClick={() => setMode("miss")}>❌ Cache Miss</button>
        <button className={mode === "write" ? "active" : ""} onClick={() => setMode("write")}>✍️ Write</button>
      </div>
      <div className="ddb2-dax-flow">
        <div className="ddb2-dax-node on">📱 App<small>DAX client</small></div>
        <div className={"ddb2-dax-arrow" + (mode ? " on" : "")}>→</div>
        <div className="ddb2-dax-node on">⚡ DAX<small>in-memory</small></div>
        <div className={"ddb2-dax-arrow" + (mode !== "hit" ? " on" : " dim")}>→</div>
        <div className={"ddb2-dax-node" + (mode !== "hit" ? " on" : " dim")}>🗄️ DynamoDB<small>SSD table</small></div>
      </div>
      <div className="ddb2-dep-detail">
        {mode === "hit" && <p><b>Cache hit</b> — data is in DAX → returned directly in <b>microseconds</b>. DynamoDB is never touched (less load).</p>}
        {mode === "miss" && <p><b>Cache miss</b> — not in DAX → DAX fetches from DynamoDB, <b>caches it</b>, then returns. First call normal speed; subsequent calls are microsecond-fast.</p>}
        {mode === "write" && <p><b>Write</b> — written to <b>DynamoDB first</b> (write-through), then DAX updates its cache so the next read is fresh &amp; fast.</p>}
      </div>
      <p className="ddb2-note">🎯 <b>Exam keywords → DAX:</b> "microsecond latency", "caching solution", "read-intensive", "millions of requests", "without modifying the application" (just repoint the endpoint). Great for gaming, e-commerce, social media, stock-market apps.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   10. EXAM CHEAT SHEET — keyword → answer
   ════════════════════════════════════════════════════════════ */
const CHEATS = [
  { kw: ["unpredictable traffic", "automatic scaling", "fluctuating demand"], a: "On-Demand Capacity Mode" },
  { kw: ["steady & predictable", "optimize cost", "estimable workload"], a: "Provisioned Capacity Mode" },
  { kw: ["private subnet", "traffic must not leave AWS"], a: "VPC Endpoint for DynamoDB" },
  { kw: ["Lambda needs secure read/write", "service-to-service access"], a: "IAM Role" },
  { kw: ["microsecond latency", "read-intensive", "caching", "no app change", "millions of requests"], a: "DAX" },
  { kw: ["manual backup", "retain indefinitely", "on-demand recovery"], a: "On-Demand Backup" },
  { kw: ["accidental deletion", "restore to last 35 days", "previous state"], a: "Point-in-Time Recovery (PITR)" },
  { kw: ["multi-region", "low latency global", "automatic failover", "region outage"], a: "Global Tables" },
];
export function ExamCheatSheet() {
  const [open, setOpen] = useState(null);
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">🎯 DynamoDB Exam Cheat Sheet — Keyword → Answer</div>
      <p className="ddb2-intro">SAA-C03 questions are scenario-based. Spot the <b>keywords</b> → pick the service. Click to reveal:</p>
      <div className="ddb2-cheats">
        {CHEATS.map((c, i) => (
          <div key={i} className={"ddb2-cheat" + (open === i ? " open" : "")} onClick={() => setOpen(open === i ? null : i)}>
            <div className="ddb2-cheat-kw">
              {c.kw.map((k, j) => <span key={j} className="ddb2-kwchip">{k}</span>)}
            </div>
            <div className="ddb2-cheat-a">{open === i ? `✅ ${c.a}` : "tap to reveal answer →"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   11. AWS DATABASE OVERVIEW
   ════════════════════════════════════════════════════════════ */
const DB_CATS = {
  relational: { label: "🗃️ Relational (SQL)", color: "#2e73b8", items: [
    ["Amazon RDS", "Managed MySQL, PostgreSQL, MariaDB, SQL Server, Oracle"],
    ["Amazon Aurora", "Cloud-native MySQL/PostgreSQL — 5×/3× faster, serverless"],
    ["Amazon Redshift", "Petabyte data warehouse, columnar, analytics"],
    ["AWS Glue Data Catalog", "Metadata repository for data lakes"],
  ]},
  nosql: { label: "🔑 NoSQL", color: "#a371f7", items: [
    ["DynamoDB", "Key-value & document, single-digit ms latency"],
    ["ElastiCache", "In-memory cache (Redis / Memcached)"],
    ["MemoryDB for Redis", "Durable Redis in-memory database"],
    ["DocumentDB", "MongoDB-compatible document DB"],
    ["Keyspaces", "Managed Apache Cassandra"],
  ]},
  special: { label: "⭐ Specialized", color: "#f0883e", items: [
    ["Neptune", "Graph database (relationships)"],
    ["Timestream", "Time-series DB for IoT/DevOps"],
    ["QLDB", "Immutable, cryptographically verifiable ledger"],
  ]},
};
export function DatabaseOverview() {
  const [cat, setCat] = useState("relational");
  const c = DB_CATS[cat];
  return (
    <div className="sv-card">
      <div className="sv-title ddb2-title">🗂️ AWS Database Services — Complete Overview</div>
      <p className="ddb2-intro">AWS offers a database for every workload. Browse by category:</p>
      <div className="ddb2-toggle">
        {Object.entries(DB_CATS).map(([id, v]) => (
          <button key={id} className={cat === id ? "active" : ""} style={cat === id ? { borderColor: v.color, color: v.color } : {}} onClick={() => setCat(id)}>{v.label}</button>
        ))}
      </div>
      <div className="ddb2-db-grid">
        {c.items.map((it, i) => (
          <div key={i} className="ddb2-db-card" style={{ borderLeftColor: c.color }}>
            <div className="ddb2-db-name" style={{ color: c.color }}>{it[0]}</div>
            <div className="ddb2-db-desc">{it[1]}</div>
          </div>
        ))}
      </div>
      <p className="ddb2-note">🎓 For SAA-C03, focus deeply on <b>RDS</b>, <b>Aurora</b>, <b>DynamoDB</b> (+ Redshift &amp; Glue later). The rest just need high-level awareness.</p>
    </div>
  );
}
