import { useState } from "react";
import "./RDSVisuals3.css";

/* ─── 1. CACHE HIT/MISS FLOW (ElastiCache for RDS) ─────────────────── */
export function CacheFlow() {
  const [step, setStep] = useState(0);

  const steps = [
    { node: "user", text: "User A requests data → goes to the app server (EC2)." },
    { node: "cache", text: "App checks ElastiCache FIRST (in-memory, fastest)." },
    { node: "miss", text: "❌ Cache MISS — data isn't cached yet (first request)." },
    { node: "db", text: "App queries RDS (the source of truth) and gets the data." },
    { node: "populate", text: "App writes the result back INTO the cache (populates it)." },
    { node: "hit", text: "User B's later request → ✅ Cache HIT — served from memory. RDS isn't touched." },
  ];
  const s = steps[step];

  return (
    <div className="sv-card rds3-card">
      <div className="sv-title rds3-title">⚡ ElastiCache for RDS — Cache Hit vs Miss</div>
      <p className="rds3-intro">
        ElastiCache is an <strong>in-memory</strong> caching layer in front of RDS. Frequently-read data is served from RAM
        (sub-millisecond), so RDS handles fewer reads — up to <strong>80× faster reads</strong> and ~55% cost savings. Step through.
      </p>

      <div className="rds3-cf-stage">
        <div className={`rds3-cf-node ${s.node === "user" || s.node === "hit" ? "on" : ""}`}>🧑‍💻<span>User → App</span></div>
        <div className="rds3-cf-arrow">→</div>
        <div className={`rds3-cf-node cache ${["cache", "miss", "populate", "hit"].includes(s.node) ? "on" : ""}`}>
          ⚡<span>ElastiCache<br/><small>{s.node === "miss" ? "MISS" : s.node === "hit" ? "HIT ✅" : "in-memory"}</small></span>
        </div>
        <div className={`rds3-cf-arrow ${["db", "populate"].includes(s.node) ? "lit" : ""}`}>{s.node === "hit" ? "✋" : "→"}</div>
        <div className={`rds3-cf-node db ${["db", "populate"].includes(s.node) ? "on" : ""}`}>🛢️<span>RDS<br/><small>source of truth</small></span></div>
      </div>

      <div className="rds3-cf-detail"><span className="rds3-cf-num">{step + 1}/{steps.length}</span>{s.text}</div>

      <div className="rds3-cf-controls">
        <button className="rds3-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</button>
        <button className="rds3-btn primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>Next →</button>
      </div>

      <div className="rds3-note">
        💡 ElastiCache is an <strong>in-memory key-value NoSQL</strong> store (sub-ms latency). It's not only for RDS — it's a
        standalone caching layer for any app. Two engines: <strong>Redis</strong> and <strong>Memcached</strong>.
      </div>
    </div>
  );
}

/* ─── 2. REDIS vs MEMCACHED ────────────────────────────────────────── */
export function RedisVsMemcached() {
  const rows = [
    ["Data structures", "Rich (hashes, sets, sorted sets, geospatial)", "Simple key-value only"],
    ["Persistence (data survives restart)", "✅ Optional", "❌ Memory-only (lost on restart)"],
    ["Replication / Multi-AZ", "✅ Yes", "❌ No"],
    ["Automatic failover", "✅ Yes", "❌ No"],
    ["Pub/Sub (real-time messaging)", "✅ Yes", "❌ No"],
    ["Sorted sets (leaderboards)", "✅ Yes", "❌ No"],
    ["Geospatial queries", "✅ Yes (e.g. nearest driver)", "❌ No"],
    ["Encryption at rest", "✅ Yes", "❌ No (in-transit only)"],
    ["Auth / ACLs", "✅ Yes", "❌ No"],
    ["Cluster mode (sharding)", "✅ Yes", "❌ No"],
    ["Best for", "Complex real-time use (Uber: matching, notifications, leaderboards)", "Simple, lightweight, high-speed caching where data loss is OK"],
  ];

  return (
    <div className="sv-card rds3-card">
      <div className="sv-title rds3-title">🔴 Redis vs 🟢 Memcached</div>
      <p className="rds3-intro">
        Two cache engines. <strong>Redis</strong> is feature-rich (the Uber example: geospatial driver matching, pub/sub
        notifications, sorted-set leaderboards, persistence). <strong>Memcached</strong> is simple, lightweight caching.
      </p>

      <div className="rds3-rm-table">
        <div className="rds3-rm-row head"><span>Feature</span><span className="redis">🔴 Redis</span><span className="memc">🟢 Memcached</span></div>
        {rows.map(([f, r, m], i) => (
          <div key={i} className="rds3-rm-row">
            <span className="rds3-rm-feat">{f}</span>
            <span className="redis">{r}</span>
            <span className="memc">{m}</span>
          </div>
        ))}
      </div>

      <div className="rds3-note">
        💡 Need persistence, HA, pub/sub, leaderboards, geospatial, or encryption-at-rest → <strong>Redis</strong>. Need plain,
        fast caching where losing data on restart is fine → <strong>Memcached</strong>. (Memcached <em>can</em> scale reads by
        spreading data across nodes, but those nodes aren't true replicas — no failover.)
      </div>
    </div>
  );
}

/* ─── 3. DEPLOYMENT: SERVERLESS vs DESIGN-YOUR-OWN ─────────────────── */
export function CacheDeployment() {
  const [sel, setSel] = useState("serverless");
  const serverless = sel === "serverless";

  return (
    <div className="sv-card rds3-card">
      <div className="sv-title rds3-title">🧰 ElastiCache Deployment Options</div>

      <div className="rds3-dep-switch">
        <button className={`rds3-dep-btn ${serverless ? "active" : ""}`} onClick={() => setSel("serverless")}>☁️ Serverless Cache</button>
        <button className={`rds3-dep-btn ${!serverless ? "active" : ""}`} onClick={() => setSel("design")}>🛠️ Design Your Own</button>
      </div>

      <div className="rds3-dep-detail">
        {serverless ? (
          <>
            <p>AWS <strong>fully manages</strong> the cache — no nodes, shards, or replicas to configure. Supported by <strong>both</strong> Redis & Memcached.</p>
            <ul>
              <li>✅ Automatic scaling — grows/shrinks with demand</li>
              <li>✅ Pay-as-you-go — only for what you use</li>
              <li>✅ Quick, hassle-free, zero config</li>
              <li>🎯 Best for <strong>unpredictable / fluctuating traffic</strong></li>
            </ul>
          </>
        ) : (
          <>
            <p>You get <strong>full control</strong>: choose node type, number of shards & replicas. Pick <strong>cluster mode enabled/disabled</strong>.</p>
            <ul>
              <li>✅ Advanced customization & cost optimization</li>
              <li>✅ You define scalability (nodes, replicas)</li>
              <li>✅ Cluster mode (sharding) — <strong>Redis only</strong></li>
              <li>🎯 Best for <strong>predictable workloads</strong>, custom infra, cost-sensitive setups</li>
            </ul>
          </>
        )}
      </div>

      <div className="rds3-note">
        💡 Serverless = AWS handles everything (great for spiky traffic). Design-your-own = you tune nodes/shards/replicas.
        <strong> Cluster mode (sharding) is Redis-only</strong>; Memcached can't shard via cluster mode.
      </div>
    </div>
  );
}

/* ─── 4. CLUSTER MODE & SHARDS ─────────────────────────────────────── */
export function ClusterMode() {
  const [enabled, setEnabled] = useState(true);
  const [shards, setShards] = useState(3);
  const [replicas, setReplicas] = useState(1);

  const realShards = enabled ? shards : 1;
  const totalReplicas = realShards * replicas;

  return (
    <div className="sv-card rds3-card">
      <div className="sv-title rds3-title">🧩 Cluster Mode & Shards (Redis)</div>
      <p className="rds3-intro">
        A <strong>shard</strong> = 1 primary node (handles writes) + 0–5 replica nodes (reads + failover). <strong>Cluster mode
        enabled</strong> = many shards (data partitioned, scales horizontally). <strong>Disabled</strong> = a single shard.
      </p>

      <div className="rds3-cm-switch">
        <button className={`rds3-cm-btn ${enabled ? "active" : ""}`} onClick={() => setEnabled(true)}>Cluster mode ENABLED</button>
        <button className={`rds3-cm-btn ${!enabled ? "active" : ""}`} onClick={() => setEnabled(false)}>Cluster mode DISABLED</button>
      </div>

      {enabled && (
        <div className="rds3-cm-controls">
          <div className="rds3-cm-ctrl"><span>Shards: <strong>{shards}</strong></span><input type="range" min="1" max="5" value={shards} onChange={(e) => setShards(+e.target.value)} /></div>
        </div>
      )}
      <div className="rds3-cm-controls">
        <div className="rds3-cm-ctrl"><span>Replicas / shard: <strong>{replicas}</strong></span><input type="range" min="0" max="5" value={replicas} onChange={(e) => setReplicas(+e.target.value)} /></div>
      </div>

      <div className="rds3-cm-scene">
        {Array.from({ length: realShards }).map((_, si) => (
          <div key={si} className="rds3-cm-shard">
            <div className="rds3-cm-shard-label">Shard {si + 1}</div>
            <div className="rds3-cm-primary">🟦 Primary</div>
            {Array.from({ length: replicas }).map((_, ri) => (
              <div key={ri} className="rds3-cm-replica">🟩 Replica</div>
            ))}
          </div>
        ))}
      </div>

      <div className="rds3-cm-count">
        Total: <strong>{realShards}</strong> shard{realShards > 1 ? "s" : ""} · <strong>{realShards}</strong> primary node{realShards > 1 ? "s" : ""} · <strong>{totalReplicas}</strong> replica{totalReplicas !== 1 ? "s" : ""}
        {enabled ? " — data partitioned across shards (horizontal scaling)" : " — single shard holds the whole dataset"}
      </div>

      <div className="rds3-note">
        💡 If a primary fails, a replica is auto-promoted (HA). Replicas also serve reads (performance). Up to <strong>500
        shards</strong>. <strong>Cluster mode is Redis-only.</strong> Console calls it a "cluster"; the API/CLI calls a
        primary+replicas a <strong>"replication group"</strong> — same thing.
      </div>
    </div>
  );
}

/* ─── 5. CACHING STRATEGIES ────────────────────────────────────────── */
export function CachingStrategies() {
  const [sel, setSel] = useState("lazy");

  const strategies = {
    lazy: { name: "Lazy Loading (Cache-Aside)", type: "read", color: "#3fb950",
      desc: "App checks the cache first; on a MISS it reads the DB and then writes the result into the cache. Only requested data is cached.",
      pro: "Only caches what's actually used", con: "First request is slow (miss); cache can hold stale data" },
    readthrough: { name: "Read-Through", type: "read", color: "#2e73b8",
      desc: "The cache itself fetches from the DB on a miss (the app doesn't manage it). Transparent to the app.",
      pro: "App logic is simpler", con: "Still a miss penalty on first read" },
    writethrough: { name: "Write-Through", type: "write", color: "#8c4fff",
      desc: "Every write goes to the cache AND the DB at the same time — cache is always fresh.",
      pro: "Cache never stale", con: "Extra write latency; caches data that may never be read" },
    writearound: { name: "Write-Around", type: "write", color: "#e3b341",
      desc: "Writes go straight to the DB; the cache is filled only when the data is later read.",
      pro: "Avoids caching write-only data", con: "Recently written data is a cache miss" },
    writeback: { name: "Write-Behind (Write-Back)", type: "write", color: "#f0883e",
      desc: "Writes hit the cache first, then are flushed to the DB later in the background.",
      pro: "Fast writes", con: "Risk of data loss if cache fails before flush" },
    ttl: { name: "TTL Expiration", type: "evict", color: "#db61a2",
      desc: "Cached items are removed after a set time-to-live, so stale data isn't served forever.",
      pro: "Bounds staleness automatically", con: "Tuning TTL is a trade-off (fresh vs hit rate)" },
  };
  const s = strategies[sel];

  return (
    <div className="sv-card rds3-card">
      <div className="sv-title rds3-title">📚 Caching Strategies</div>
      <p className="rds3-intro">How data gets into and out of the cache. <strong>Read</strong> strategies fill on reads; <strong>write</strong> strategies decide when the cache is updated on writes.</p>

      <div className="rds3-cs-tabs">
        {Object.keys(strategies).map((k) => (
          <button key={k} className={`rds3-cs-tab ${sel === k ? "active" : ""}`} style={{ "--cc": strategies[k].color }} onClick={() => setSel(k)}>
            {strategies[k].name}
          </button>
        ))}
      </div>

      <div className="rds3-cs-detail" style={{ "--cc": s.color }}>
        <div className="rds3-cs-type">{s.type === "read" ? "📖 Read strategy" : s.type === "write" ? "✍️ Write strategy" : "⏱️ Eviction"}</div>
        <div className="rds3-cs-desc">{s.desc}</div>
        <div className="rds3-cs-procon">
          <div className="rds3-cs-pro">✅ {s.pro}</div>
          <div className="rds3-cs-con">⚠️ {s.con}</div>
        </div>
      </div>

      <div className="rds3-note">
        💡 Memory hook for writes: <strong>write-through</strong> = cache + DB together; <strong>write-around</strong> = DB first
        (cache on later read); <strong>write-behind</strong> = cache first, DB later. <strong>Lazy loading</strong> is the classic
        read pattern (cache-aside).
      </div>
    </div>
  );
}

/* ─── 6. RESTORE FROM S3 ───────────────────────────────────────────── */
export function RestoreFromS3() {
  const [step, setStep] = useState(0);

  const steps = [
    { icon: "🗄️", title: "Export to .SQL dump", desc: "Export your on-prem (or other-cloud) MySQL database — schema + data — to a .SQL dump file." },
    { icon: "🪣", title: "Upload to S3", desc: "Put the dump file in an S3 bucket in the SAME region as your target RDS." },
    { icon: "🔑", title: "Create an IAM role", desc: "RDS needs an IAM role to READ the dump from S3 (+ KMS access if encrypted). The wizard can create it." },
    { icon: "🛢️", title: "Restore from S3", desc: "Choose 'Restore from S3', point at the bucket/file. RDS creates a NEW instance AND imports the schema+data in one step." },
    { icon: "✅", title: "Validate", desc: "Confirm the data imported correctly. Done — a populated database in one seamless step." },
  ];
  const s = steps[step];

  return (
    <div className="sv-card rds3-card">
      <div className="sv-title rds3-title">📥 Restore from S3 (Offline Migration)</div>
      <p className="rds3-intro">
        "Restore from S3" creates a <strong>new database AND restores a <code>.SQL</code> dump</strong> in one step — handy for
        migrating an on-prem/other-cloud database into RDS.
      </p>

      <div className="rds3-rs-track">
        {steps.map((st, i) => (
          <button key={i} className={`rds3-rs-node ${step === i ? "active" : i < step ? "done" : ""}`} onClick={() => setStep(i)}>
            <span className="rds3-rs-icon">{st.icon}</span>{i < steps.length - 1 && <span className="rds3-rs-line" />}
          </button>
        ))}
      </div>

      <div className="rds3-rs-detail">
        <div className="rds3-rs-head"><span>{s.icon}</span> Step {step + 1}: {s.title}</div>
        <div className="rds3-rs-desc">{s.desc}</div>
      </div>

      <div className="rds3-note warn">
        ⚠️ Key facts: it restores a <strong>.SQL dump only</strong> — NOT automated backups or snapshots (those have their own
        restore). Supports <strong>MySQL & Aurora MySQL only</strong>. It's <strong>offline</strong> migration; for <strong>live</strong>
        migration use <strong>AWS DMS</strong> (Database Migration Service).
      </div>
    </div>
  );
}
