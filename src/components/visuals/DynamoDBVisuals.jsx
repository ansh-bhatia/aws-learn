import React, { useState } from "react";
import "./DynamoDBVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. AURORA — 8 features + 3D cluster storage (6-way / 3-AZ)
   ════════════════════════════════════════════════════════════ */
const AURORA_FEATURES = [
  { ic: "🔌", t: "MySQL & PostgreSQL Compatible", d: "Drop-in compatible — migrate existing apps with zero code changes." },
  { ic: "⚡", t: "High Performance", d: "Up to 5× the throughput of MySQL and 3× of PostgreSQL on the same instance size." },
  { ic: "🗄️", t: "Cluster Storage", d: "Auto-built distributed storage layer — six copies, three AZs, self-healing. RDS engines use plain EBS." },
  { ic: "📈", t: "Auto Storage Scaling", d: "Starts at 10 GB, grows automatically to 128 TB. No manual sizing, no downtime. (RDS caps at 64 TB with manual auto-scaling.)" },
  { ic: "☁️", t: "Serverless", d: "Aurora Serverless scales capacity up/down on demand — ideal for variable/unpredictable workloads." },
  { ic: "🔄", t: "Multi-AZ by Default", d: "Built-in Multi-AZ with automatic failover to Aurora Replicas that also serve read traffic (2-in-1)." },
  { ic: "🌍", t: "Global Database", d: "Replicate across regions for low-latency global reads + disaster recovery." },
  { ic: "🤖", t: "ML & Parallel Query", d: "Aurora ML runs models inside queries; Parallel Query pushes analytics down to the storage layer." },
];

export function AuroraFeatures() {
  const [open, setOpen] = useState(2);
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">🟦 Amazon Aurora — 8 Unique Features</div>
      <p className="ddb-intro">
        Aurora is AWS's <b>cloud-native</b> relational database — built for the cloud (not ported from on-prem like the
        other RDS engines). It gives <b>enterprise-grade</b> performance at <b>open-source pricing</b>. Amazon ran the world's
        biggest e-commerce platform on Oracle, hit scaling/licensing walls, and built Aurora in-house (announced 2014,
        migrated ~75,000 databases). Click a feature:
      </p>
      <div className="ddb-aur-grid">
        {AURORA_FEATURES.map((f, i) => (
          <div key={i} className={"ddb-aur-card" + (open === i ? " active" : "")} onClick={() => setOpen(i)}>
            <span className="ddb-aur-ic">{f.ic}</span>
            <span className="ddb-aur-t">{f.t}</span>
          </div>
        ))}
      </div>
      <div className="ddb-aur-detail">
        <span className="ddb-aur-ic big">{AURORA_FEATURES[open].ic}</span>
        <div>
          <div className="ddb-aur-dt">{AURORA_FEATURES[open].t}</div>
          <div className="ddb-aur-dd">{AURORA_FEATURES[open].d}</div>
        </div>
      </div>
    </div>
  );
}

export function ClusterStorage3D() {
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">🧊 Cluster Storage — 6-Way Replication across 3 AZs</div>
      <p className="ddb-intro">
        Aurora's signature feature: every write is replicated <b>six ways across three Availability Zones</b> automatically.
        This delivers high durability, high availability, and faster failover — with <b>self-healing</b> storage that
        detects and repairs corruption. RDS engines use a single EBS volume instead.
      </p>
      <div className="ddb-cs3d-stage">
        <div className="ddb-cs3d-scene">
          <div className="ddb-cs3d-writer">✍️ Writer</div>
          {[0, 1, 2].map((az) => (
            <div key={az} className={"ddb-cs3d-az az" + az}>
              <div className="ddb-cs3d-azlbl">AZ-{az + 1}</div>
              <div className="ddb-cs3d-copy">💾</div>
              <div className="ddb-cs3d-copy">💾</div>
            </div>
          ))}
        </div>
      </div>
      <div className="ddb-grid2">
        <div className="ddb-stat"><b>6</b> copies of data</div>
        <div className="ddb-stat"><b>3</b> Availability Zones</div>
        <div className="ddb-stat"><b>10 GB → 128 TB</b> auto-scale</div>
        <div className="ddb-stat"><b>Self-healing</b> storage</div>
      </div>
      <p className="ddb-note">💡 Write succeeds with <b>4 of 6</b> copies; reads need <b>3 of 6</b> — so Aurora tolerates losing a whole AZ <i>plus</i> one more copy without losing write/read availability.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. SQL vs NoSQL — data representation toggle
   ════════════════════════════════════════════════════════════ */
export function SQLvsNoSQL() {
  const [mode, setMode] = useState("nosql");
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">🆚 SQL (Relational) vs NoSQL (Non-Relational)</div>
      <p className="ddb-intro">
        DynamoDB is a <b>NoSQL, non-relational</b> database. "NoSQL" = <i>Not only SQL</i> — no fixed schema, data stored
        as <b>key-value pairs</b>. Toggle to see how the same member data is stored differently:
      </p>
      <div className="ddb-toggle">
        <button className={mode === "sql" ? "active" : ""} onClick={() => setMode("sql")}>🗃️ SQL (Fixed Schema)</button>
        <button className={mode === "nosql" ? "active" : ""} onClick={() => setMode("nosql")}>🔑 NoSQL (Key-Value)</button>
      </div>
      {mode === "sql" ? (
        <div className="ddb-rep">
          <div className="ddb-sqltable">
            <div className="ddb-sqlrow head"><span>member_id</span><span>name</span><span>email</span></div>
            <div className="ddb-sqlrow"><span>201</span><span>Rahul</span><span>rahul@x.com</span></div>
            <div className="ddb-sqlrow"><span>202</span><span>Ema</span><span>ema@x.com</span></div>
          </div>
          <p className="ddb-note warn">❌ Schema is <b>fixed</b> — you defined member_id, name, email up front. You <b>cannot</b> add a phone number for just one member without altering the whole table. Relations across tables use <b>foreign keys</b>. Scales <b>vertically</b> (bigger server).</p>
        </div>
      ) : (
        <div className="ddb-rep">
          <div className="ddb-kvbox">
            <div className="ddb-kvitem">
              <div className="ddb-kvk">member_id</div><div className="ddb-kvv">201</div>
              <div className="ddb-kvk">name</div><div className="ddb-kvv">Rahul</div>
              <div className="ddb-kvk">email</div><div className="ddb-kvv">rahul@x.com</div>
            </div>
            <div className="ddb-kvitem">
              <div className="ddb-kvk">member_id</div><div className="ddb-kvv">203</div>
              <div className="ddb-kvk">name</div><div className="ddb-kvv">Amit</div>
              <div className="ddb-kvk">email</div><div className="ddb-kvv">amit@x.com</div>
              <div className="ddb-kvk add">phone 📱</div><div className="ddb-kvv add">+91-98...</div>
            </div>
          </div>
          <p className="ddb-note ok">✅ <b>Flexible schema</b> — each item can have different attributes. Amit got a <b>phone</b> attribute that other items don't have. Scales <b>horizontally</b> (add servers). Faster than every RDS engine (except Aurora) for high-traffic key lookups.</p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. UPI CASE STUDY — RDS vs DynamoDB use cases
   ════════════════════════════════════════════════════════════ */
export function UPICaseStudy() {
  const [side, setSide] = useState("rds");
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">🇮🇳 UPI Case Study — Why Both Databases?</div>
      <p className="ddb-intro">
        Rajesh pays ₹20,000 to Anita's shop via UPI. <b>Two players</b> store data: the <b>banks</b> (record the transaction)
        and the <b>UPI app</b> (Google Pay / PhonePe — logs &amp; metadata). They pick <b>different</b> databases. Click each:
      </p>
      <div className="ddb-toggle">
        <button className={side === "rds" ? "active" : ""} onClick={() => setSide("rds")}>🏦 Banks → RDS</button>
        <button className={side === "ddb" ? "active" : ""} onClick={() => setSide("ddb")}>📱 UPI App → DynamoDB</button>
      </div>
      {side === "rds" ? (
        <div className="ddb-dep-detail rds">
          <p><b>Banks store transactional data → Relational (RDS)</b></p>
          <ul>
            <li><b>Structured &amp; consistent</b> — fixed schema (sender, receiver, amount, timestamp, status) so two banks communicate in a standard format.</li>
            <li><b>ACID properties</b> for high accuracy: <b>A</b>tomicity (all-or-nothing), <b>C</b>onsistency (no negative balance), <b>I</b>solation (no interference), <b>D</b>urability (transaction logs survive crashes).</li>
            <li><b>Data integrity</b> — once committed, a statement entry can never be edited or deleted.</li>
          </ul>
        </div>
      ) : (
        <div className="ddb-dep-detail ddb">
          <p><b>UPI app stores logs &amp; metadata → Non-Relational (DynamoDB)</b></p>
          <ul>
            <li><b>Real-time logging</b> at millisecond latency — high write throughput for monitoring/troubleshooting.</li>
            <li><b>High volume</b> — billions of logs; scales <b>horizontally</b> across servers.</li>
            <li><b>Flexibility</b> — schema-less; add fields (geolocation, network type) anytime without disruption.</li>
            <li><b>Speed over accuracy</b> — logs are app-level records; prioritize fast writes over strict validation.</li>
          </ul>
        </div>
      )}
      <p className="ddb-note">📌 <b>Exam cheat sheet:</b> Relational (RDS) = transactional data, high accuracy, ACID, fixed schema. Non-relational (DynamoDB) = activity logs/metadata, speed &amp; scalability, schema-less, write-speed priority. They are <b>not</b> replacements for each other.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. CORE COMPONENTS — table / item / attribute + keys
   ════════════════════════════════════════════════════════════ */
export function CoreComponents() {
  const [key, setKey] = useState("simple");
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">🧱 Core Components &amp; Primary Keys</div>
      <p className="ddb-intro">
        <b>Table</b> → holds <b>Items</b> (≈ rows) → each item has <b>Attributes</b> (≈ columns, but dynamic). Toggle the
        primary-key type to see how uniqueness is enforced:
      </p>
      <div className="ddb-toggle">
        <button className={key === "simple" ? "active" : ""} onClick={() => setKey("simple")}>🔑 Simple (Partition Key)</button>
        <button className={key === "composite" ? "active" : ""} onClick={() => setKey("composite")}>🔑🔑 Composite (Partition + Sort)</button>
      </div>
      {key === "simple" ? (
        <>
          <div className="ddb-keytable">
            <div className="ddb-keyrow head"><span className="pk">customer_id (PK)</span><span>order_item</span></div>
            <div className="ddb-keyrow"><span className="pk">C001</span><span>Watch</span></div>
            <div className="ddb-keyrow"><span className="pk">C002</span><span>Mobile</span></div>
            <div className="ddb-keyrow err"><span className="pk">C001 ⛔</span><span>Mobile (rejected!)</span></div>
          </div>
          <p className="ddb-note warn">⚠️ <b>Simple primary key</b> = partition key only — must be <b>unique</b>. The same customer C001 ordering again is <b>rejected</b> ("item already exists"). DynamoDB hashes the partition key to pick a physical storage partition.</p>
        </>
      ) : (
        <>
          <div className="ddb-keytable">
            <div className="ddb-keyrow head"><span className="pk">customer_id (PK)</span><span className="sk">order_id (SK)</span><span>item</span></div>
            <div className="ddb-keyrow"><span className="pk">C001</span><span className="sk">100</span><span>Watch</span></div>
            <div className="ddb-keyrow"><span className="pk">C001</span><span className="sk">200</span><span>Mobile ✅</span></div>
            <div className="ddb-keyrow err"><span className="pk">C001</span><span className="sk">100 ⛔</span><span>dup combo rejected</span></div>
          </div>
          <p className="ddb-note ok">✅ <b>Composite primary key</b> = partition key + sort key. The same customer can place many orders — only the <b>combination</b> must be unique. New orders get new order_id, so collisions never happen. (Sort key must be defined at table creation; it can't be added later.)</p>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. TABLE CLASS — Standard vs Standard-IA cost
   ════════════════════════════════════════════════════════════ */
export function TableClass() {
  const [c, setC] = useState("std");
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">💰 Table Class — Standard vs Standard-IA</div>
      <p className="ddb-intro">
        DynamoDB charges for two things: <b>storage cost</b> + <b>request cost</b> (reads/writes). Table class trades one
        against the other. Pick based on how <b>often</b> you access the data:
      </p>
      <div className="ddb-toggle">
        <button className={c === "std" ? "active" : ""} onClick={() => setC("std")}>📊 DynamoDB Standard</button>
        <button className={c === "ia" ? "active" : ""} onClick={() => setC("ia")}>🗄️ Standard-IA (Infrequent Access)</button>
      </div>
      <div className="ddb-grid2 tight">
        <div className="ddb-bar">
          <span>Storage cost</span>
          <div className="ddb-bartrack"><div className="ddb-barfill" style={{ width: c === "std" ? "75%" : "40%", background: "#f0883e" }} /></div>
          <small>{c === "std" ? "Higher" : "Lower ✅"}</small>
        </div>
        <div className="ddb-bar">
          <span>Request (read/write) cost</span>
          <div className="ddb-bartrack"><div className="ddb-barfill" style={{ width: c === "std" ? "40%" : "75%", background: "#2e73b8" }} /></div>
          <small>{c === "std" ? "Lower ✅" : "Higher"}</small>
        </div>
      </div>
      <p className="ddb-note">
        {c === "std"
          ? "📊 Standard — best for frequent / high-throughput access: real-time gaming dashboards, stock pricing. Higher storage, lower request cost → cheaper overall when accessed often."
          : "🗄️ Standard-IA — best for archival / rarely accessed data. Lower storage, higher request cost → cheaper overall when accessed rarely. Beware: access it frequently and it gets expensive!"}
      </p>
      <p className="ddb-note ok">🔁 You can <b>switch table class anytime</b> without affecting operations. Start with Standard if unsure; use CloudWatch metrics to monitor access patterns, then switch.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. STORAGE ARCHITECTURE — 3D leader/replica nodes across AZs
   ════════════════════════════════════════════════════════════ */
export function StorageArchitecture() {
  const [step, setStep] = useState(0);
  const steps = [
    { t: "1 · Write arrives", d: "An item's partition key is hashed → DynamoDB picks a partition on a Leader Node. Only the Leader Node handles writes." },
    { t: "2 · Replicate", d: "After the write commits on the Leader, it replicates to 2 Replica Nodes in other AZs (takes micro/milliseconds)." },
    { t: "3 · Strongly consistent read", d: "Read from the Leader Node → always the latest data (you just wrote it there)." },
    { t: "4 · Eventually consistent read", d: "Read from a Replica Node → faster & cheaper, but during the replication lag you might get slightly stale data." },
  ];
  const writeOn = step >= 0;
  const repOn = step >= 1;
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">🏛️ Distributed Storage Architecture (3D)</div>
      <p className="ddb-intro">
        DynamoDB splits data across <b>partitions</b> on multiple servers. Each partition sits on a <b>Leader Node</b>
        (handles writes + strongly-consistent reads) replicated to <b>Replica Nodes</b> in other AZs. Step through:
      </p>
      <div className="ddb-sa-scene">
        <div className={"ddb-sa-node leader" + (writeOn ? " on" : "")}>
          <div className="ddb-sa-az">AZ-1</div>
          <div className="ddb-sa-role">👑 Leader Node</div>
          <div className="ddb-sa-parts"><span>P-A</span><span>P-B</span><span>P-C</span></div>
          <div className="ddb-sa-tag">writes + strong reads</div>
        </div>
        <div className={"ddb-sa-repwrap" + (repOn ? " on" : "")}>
          <div className="ddb-sa-node replica">
            <div className="ddb-sa-az">AZ-2</div>
            <div className="ddb-sa-role">📋 Replica Node</div>
            <div className="ddb-sa-tag">eventual reads</div>
          </div>
          <div className="ddb-sa-node replica">
            <div className="ddb-sa-az">AZ-3</div>
            <div className="ddb-sa-role">📋 Replica Node</div>
            <div className="ddb-sa-tag">eventual reads</div>
          </div>
        </div>
      </div>
      <div className="ddb-sa-detail">
        <b>{steps[step].t}</b>
        <p>{steps[step].d}</p>
      </div>
      <div className="ddb-cf-controls">
        <button className="ddb-btn" disabled={step === 0} onClick={() => setStep(step - 1)}>◀ Prev</button>
        <button className="ddb-btn primary" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Next ▶</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. READ CONSISTENCY — 3 models
   ════════════════════════════════════════════════════════════ */
const READ_MODELS = [
  { id: "eventual", label: "Eventually Consistent", color: "#3fb950",
    accuracy: "May return slightly stale data", scope: "1 item per query", speed: "Fastest", compute: "Lowest cost",
    d: "Queries can hit the Leader OR any Replica node. Replica nodes share the read load → best performance & cheapest. Risk: during replication lag you may read old data. Great for social media, feeds." },
  { id: "strong", label: "Strongly Consistent", color: "#2e73b8",
    accuracy: "Always the latest data", scope: "1 item per query", speed: "Slower", compute: "High capacity needed",
    d: "Queries hit ONLY the Leader node → always up-to-date. Replicas only provide HA (no read offload), so the Leader does everything and must be sized bigger. Needed for banking / accurate reads." },
  { id: "transactional", label: "Transactional", color: "#a371f7",
    accuracy: "Latest data for ALL items together", scope: "Up to 25 items in ONE query", speed: "Slightly slower than strong", compute: "Highest capacity",
    d: "Like strongly consistent but fetches up to 25 items in a single atomic query — all returned together, none mid-update. Highest compute cost. For all-or-nothing reads across multiple items." },
];

export function ReadConsistency() {
  const [m, setM] = useState("eventual");
  const model = READ_MODELS.find((x) => x.id === m);
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">👁️ Read Consistency — 3 Models</div>
      <p className="ddb-intro">When reading from DynamoDB you choose how fresh the data must be. Click each model:</p>
      <div className="ddb-cs-tabs">
        {READ_MODELS.map((x) => (
          <button key={x.id} className={"ddb-cs-tab" + (m === x.id ? " active" : "")} style={{ "--cc": x.color }} onClick={() => setM(x.id)}>{x.label}</button>
        ))}
      </div>
      <div className="ddb-cs-detail" style={{ "--cc": model.color }}>
        <div className="ddb-cs-desc">{model.d}</div>
        <div className="ddb-rc-stats">
          <div><small>Accuracy</small><b>{model.accuracy}</b></div>
          <div><small>Read scope</small><b>{model.scope}</b></div>
          <div><small>Speed</small><b>{model.speed}</b></div>
          <div><small>Compute</small><b>{model.compute}</b></div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. WRITE CONSISTENCY — Standard vs Transactional transfer
   ════════════════════════════════════════════════════════════ */
export function WriteConsistency() {
  const [mode, setMode] = useState("standard");
  const [fail, setFail] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">✍️ Write Consistency — Standard vs Transactional</div>
      <p className="ddb-intro">
        Nitin transfers ₹1,000 to Rahul. Both writes go through the Leader node — but how they're grouped matters.
        Transactional costs <b>2×</b> Standard. Toggle and try failing step 2:
      </p>
      <div className="ddb-toggle">
        <button className={mode === "standard" ? "active" : ""} onClick={() => { setMode("standard"); }}>📝 Standard Write</button>
        <button className={mode === "transactional" ? "active" : ""} onClick={() => { setMode("transactional"); }}>🔒 Transactional Write</button>
      </div>
      <div className="ddb-wc-flow">
        <div className="ddb-wc-step done">① Debit Nitin: ₹3,000 → ₹2,000 ✅</div>
        <div className={"ddb-wc-step" + (fail ? " failed" : " done")}>
          ② Credit Rahul: ₹5,000 → {fail ? "₹5,000 ❌ FAILED" : "₹6,000 ✅"}
        </div>
      </div>
      {mode === "standard" ? (
        <div className={"ddb-wc-result " + (fail ? "bad" : "ok")}>
          {fail
            ? "💥 STANDARD + failure = ₹1,000 LOST! Step ① committed independently, step ② failed → money debited but never credited. Each item is written one at a time, no rollback."
            : "Standard writes commit each item independently, one at a time. Fine when both succeed — but no safety net if step ② fails."}
        </div>
      ) : (
        <div className="ddb-wc-result ok">
          🔒 TRANSACTIONAL = all-or-nothing. {fail ? "Step ② failed → step ① is rolled back too. No money lost — neither update happens." : "Both updates succeed together as one atomic unit."} Banks always use this (worth the 2× price).
        </div>
      )}
      <label className="ddb-wc-toggle"><input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} /> Simulate step ② failure (network issue)</label>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. RCU CALCULATOR
   ════════════════════════════════════════════════════════════ */
export function RCUCalculator() {
  const [size, setSize] = useState(4);
  const [reads, setReads] = useState(100);
  const [mode, setMode] = useState("strong");
  const blocks = Math.ceil(size / 4); // 4KB blocks
  let rcu;
  if (mode === "strong") rcu = blocks * reads;
  else if (mode === "eventual") rcu = Math.ceil((blocks * reads) / 2);
  else rcu = blocks * reads * 2; // transactional
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">🧮 RCU Calculator (Read Capacity Unit)</div>
      <p className="ddb-intro">
        Reads are measured in <b>4 KB blocks</b> (rounded up). <b>Strongly</b>: 1 RCU = one 4 KB item/sec.
        <b> Eventually</b>: half the RCU (1 RCU = two 4 KB items/sec). <b>Transactional</b>: double.
      </p>
      <div className="ddb-calc">
        <label>Item size: <b>{size} KB</b> → rounds to <b>{blocks * 4} KB</b> ({blocks} block{blocks > 1 ? "s" : ""})
          <input type="range" min="1" max="20" value={size} onChange={(e) => setSize(+e.target.value)} /></label>
        <label>Reads / second: <b>{reads}</b>
          <input type="range" min="10" max="500" step="10" value={reads} onChange={(e) => setReads(+e.target.value)} /></label>
        <div className="ddb-toggle small">
          <button className={mode === "strong" ? "active" : ""} onClick={() => setMode("strong")}>Strongly</button>
          <button className={mode === "eventual" ? "active" : ""} onClick={() => setMode("eventual")}>Eventually</button>
          <button className={mode === "transactional" ? "active" : ""} onClick={() => setMode("transactional")}>Transactional</button>
        </div>
      </div>
      <div className="ddb-calc-out">
        <div className="ddb-calc-formula">
          ⌈{size}/4⌉ = {blocks} block × {reads} reads/s
          {mode === "eventual" ? " ÷ 2" : mode === "transactional" ? " × 2" : ""}
        </div>
        <div className="ddb-calc-result">= {rcu} RCU</div>
      </div>
      <p className="ddb-note warn">⏱️ Watch units! If a question gives <b>reads/minute</b>, divide by 60 first (e.g. 3,000/min = 50/sec).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   10. WCU CALCULATOR
   ════════════════════════════════════════════════════════════ */
export function WCUCalculator() {
  const [size, setSize] = useState(1);
  const [writes, setWrites] = useState(100);
  const [mode, setMode] = useState("standard");
  const blocks = Math.ceil(size); // 1KB blocks
  const wcu = mode === "standard" ? blocks * writes : blocks * writes * 2;
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">🧮 WCU Calculator (Write Capacity Unit)</div>
      <p className="ddb-intro">
        Writes are measured in <b>1 KB blocks</b> (rounded up — note: smaller than RCU's 4 KB!). <b>Standard</b>: 1 WCU =
        one 1 KB write/sec. <b>Transactional</b>: double.
      </p>
      <div className="ddb-calc">
        <label>Item size: <b>{size} KB</b> → rounds to <b>{blocks} KB</b> ({blocks} block{blocks > 1 ? "s" : ""})
          <input type="range" min="0.5" max="10" step="0.5" value={size} onChange={(e) => setSize(+e.target.value)} /></label>
        <label>Writes / second: <b>{writes}</b>
          <input type="range" min="10" max="500" step="10" value={writes} onChange={(e) => setWrites(+e.target.value)} /></label>
        <div className="ddb-toggle small">
          <button className={mode === "standard" ? "active" : ""} onClick={() => setMode("standard")}>Standard</button>
          <button className={mode === "transactional" ? "active" : ""} onClick={() => setMode("transactional")}>Transactional</button>
        </div>
      </div>
      <div className="ddb-calc-out">
        <div className="ddb-calc-formula">
          ⌈{size}⌉ = {blocks} block × {writes} writes/s{mode === "transactional" ? " × 2" : ""}
        </div>
        <div className="ddb-calc-result">= {wcu} WCU</div>
      </div>
      <p className="ddb-note warn">⏱️ Same trap: convert <b>writes/minute → ÷ 60</b> before calculating.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   11. CAPACITY MODE — On-Demand vs Provisioned
   ════════════════════════════════════════════════════════════ */
export function CapacityMode() {
  const [cap, setCap] = useState(20000);
  return (
    <div className="sv-card">
      <div className="sv-title ddb-title">⚙️ On-Demand Capacity Mode</div>
      <p className="ddb-intro">
        <b>On-Demand</b> auto-scales RCU/WCU with traffic — no manual capacity planning, pay only for actual requests.
        Best for <b>unpredictable / seasonal</b> traffic or brand-new apps (e.g. Swiggy spiking at lunch &amp; dinner).
      </p>
      <div className="ddb-grid2 tight">
        <div className="ddb-stat"><b>Auto-scaling</b> up &amp; down</div>
        <div className="ddb-stat"><b>Pay-per-request</b> only</div>
        <div className="ddb-stat"><b>No provisioning</b> needed</div>
        <div className="ddb-stat"><b>Simplest</b> to operate</div>
      </div>
      <p className="ddb-note warn">
        🛡️ <b>Set a maximum throughput cap!</b> By default On-Demand scales to <b>any</b> level (up to 40,000 RRU/WRU). A cyber
        attack or runaway traffic with no cap = <b>skyrocketing bill</b>. Set a cap, then monitor and raise it if legitimate
        traffic needs it.
      </p>
      <div className="ddb-calc">
        <label>Max read request units cap: <b>{cap.toLocaleString()}</b>
          <input type="range" min="1000" max="40000" step="1000" value={cap} onChange={(e) => setCap(+e.target.value)} /></label>
      </div>
      <div className="ddb-calc-out">
        <div className="ddb-calc-result" style={{ fontSize: "15px" }}>
          {cap >= 35000 ? "⚠️ Very high cap — little protection against runaway cost" : cap <= 5000 ? "✅ Tight cap — strong cost protection (may throttle real spikes)" : "👍 Balanced cap — protects cost while allowing growth"}
        </div>
      </div>
    </div>
  );
}
