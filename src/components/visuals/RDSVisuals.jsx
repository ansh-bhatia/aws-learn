import { useState } from "react";
import "./RDSVisuals.css";

/* ─── 1. RELATIONAL TABLES & RELATIONSHIPS ─────────────────────────── */
export function RelationalTables() {
  const [hl, setHl] = useState(null); // highlight customer 1

  return (
    <div className="sv-card rds-card">
      <div className="sv-title rds-title">🗃️ Relational Database — Tables & Keys</div>
      <p className="rds-intro">
        Data lives in <strong>tables</strong> (rows = records, columns = fields), with a fixed <strong>schema</strong>.
        Tables link via a <strong>primary key</strong> (unique ID) referenced as a <strong>foreign key</strong> elsewhere.
        Hover the row to trace Rajesh's order across tables.
      </p>

      <div className="rds-rel-tables">
        <div className="rds-rel-table">
          <div className="rds-rel-th">Customers</div>
          <div className="rds-rel-row head"><span>cust_id 🔑</span><span>name</span></div>
          <div className={`rds-rel-row ${hl === 1 ? "lit" : ""}`} onMouseEnter={() => setHl(1)} onMouseLeave={() => setHl(null)}><span>1</span><span>Rajesh Kumar</span></div>
          <div className="rds-rel-row"><span>2</span><span>Kiran Patel</span></div>
        </div>

        <div className="rds-rel-link">🔗</div>

        <div className="rds-rel-table">
          <div className="rds-rel-th">Orders</div>
          <div className="rds-rel-row head"><span>order_id 🔑</span><span>cust_id 🔗</span></div>
          <div className={`rds-rel-row ${hl === 1 ? "lit" : ""}`} onMouseEnter={() => setHl(1)} onMouseLeave={() => setHl(null)}><span>1</span><span>1</span></div>
          <div className="rds-rel-row"><span>2</span><span>2</span></div>
        </div>

        <div className="rds-rel-link">🔗</div>

        <div className="rds-rel-table">
          <div className="rds-rel-th">Products</div>
          <div className="rds-rel-row head"><span>order_id 🔗</span><span>item</span></div>
          <div className={`rds-rel-row ${hl === 1 ? "lit" : ""}`} onMouseEnter={() => setHl(1)} onMouseLeave={() => setHl(null)}><span>1</span><span>Electric Kettle</span></div>
          <div className="rds-rel-row"><span>2</span><span>Coffee Maker</span></div>
        </div>
      </div>

      <div className="rds-note">
        💡 <strong>Primary key</strong> = a unique ID per row (like a passport number — names can repeat). <strong>Foreign key</strong>
        = a column pointing to another table's primary key, creating the relationship. You query it all with <strong>SQL</strong>.
        Engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Amazon Aurora.
      </div>
    </div>
  );
}

/* ─── 2. ON-PREM vs EC2 vs RDS ─────────────────────────────────────── */
export function DeploymentComparison() {
  const [sel, setSel] = useState("rds");

  const rows = [
    ["Control", "Full (hardware → software)", "OS & DB (no hardware)", "DB settings only"],
    ["You manage", "Everything", "OS, patching, backups, HA", "Almost nothing — AWS does it"],
    ["Up-front cost", "💸 High (buy hardware)", "None (pay-as-you-go)", "None (pay-as-you-go)"],
    ["Setup time", "Weeks–months", "Medium", "~5–10 minutes"],
    ["Scaling", "Buy hardware (slow)", "Resize instance", "Automated, minimal downtime"],
    ["Backups / HA", "Manual, complex", "Manual config", "Automated, Multi-AZ built-in"],
    ["Patching", "Manual", "Manual", "Automated"],
  ];
  const col = sel === "onprem" ? 0 : sel === "ec2" ? 1 : 2;

  return (
    <div className="sv-card rds-card">
      <div className="sv-title rds-title">🏗️ On-Premises vs EC2 vs RDS</div>
      <p className="rds-intro">
        Three ways to run a database. On-prem = total control but you build & maintain <em>everything</em> (servers, power,
        storage, networking, replication). RDS = a <strong>managed</strong> database ready in minutes.
      </p>

      <div className="rds-dep-tabs">
        {[["onprem", "🏢 On-Premises"], ["ec2", "💻 On EC2"], ["rds", "🛢️ RDS (managed)"]].map(([k, l]) => (
          <button key={k} className={`rds-dep-tab ${sel === k ? "active" : ""}`} onClick={() => setSel(k)}>{l}</button>
        ))}
      </div>

      <div className="rds-dep-table">
        {rows.map(([f, ...vals], i) => (
          <div key={i} className="rds-dep-row">
            <span className="rds-dep-feat">{f}</span>
            <span className="rds-dep-val">{vals[col]}</span>
          </div>
        ))}
      </div>

      <div className="rds-note">
        💡 RDS removes the <strong>"undifferentiated heavy lifting"</strong> — no hardware, hypervisor licences, OS patching,
        power/storage/network redundancy, or manual replication. You keep responsibility for the <strong>schema & data</strong>
        (that's the DBA's job); AWS runs the engine.
      </div>
    </div>
  );
}

/* ─── 3. AVAILABILITY OPTIONS (3D-ish) ─────────────────────────────── */
export function AvailabilityOptions() {
  const [opt, setOpt] = useState("multiaz");

  const opts = {
    single: { name: "Single DB Instance", instances: 1, cost: "1×", color: "#8b949e",
      ha: "❌ No failover", perf: "—", rpo: "Backup-dependent", rto: "Manual (slow)",
      desc: "One instance in one AZ. Cheapest. No standby, no automatic failover — a failure means downtime and restore-from-backup. For non-critical apps that tolerate downtime." },
    multiaz: { name: "Multi-AZ DB Instance", instances: 2, cost: "2×", color: "#3fb950",
      ha: "✅ Automatic failover (~60s)", perf: "❌ No gain (standby is idle)", rpo: "~0 (sync replication)", rto: "~60 seconds",
      desc: "One PRIMARY + one STANDBY in a second AZ, synchronously replicated. If the primary fails, the standby is promoted automatically (~60s). High availability, but the standby does NO work — no performance benefit." },
    cluster: { name: "Multi-AZ DB Cluster", instances: 3, cost: "3×", color: "#8c4fff",
      ha: "✅ Auto failover (~35s)", perf: "✅ 2 readers serve reads", rpo: "~0 (semi-sync)", rto: "~35 seconds",
      desc: "One WRITER + two READER instances across 3 AZs. Readers handle read traffic (performance gain!) and one is promoted on failure (~35s). Semi-synchronous = lower write latency. MySQL & PostgreSQL only." },
  };
  const o = opts[opt];

  return (
    <div className="sv-card rds-card">
      <div className="sv-title rds-title">🛡️ Availability & Durability Options</div>

      <div className="rds-av-tabs">
        {Object.keys(opts).map((k) => (
          <button key={k} className={`rds-av-tab ${opt === k ? "active" : ""}`} style={{ "--ac": opts[k].color }} onClick={() => setOpt(k)}>
            {opts[k].name}
          </button>
        ))}
      </div>

      <div className="rds-av-scene">
        {Array.from({ length: o.instances }).map((_, i) => {
          const role = opt === "single" ? "single" : opt === "multiaz" ? (i === 0 ? "primary" : "standby") : (i === 0 ? "writer" : "reader");
          return (
            <div key={i} className={`rds-av-db ${role}`} style={{ "--ac": o.color }}>
              <div className="rds-av-db-icon">🛢️</div>
              <div className="rds-av-db-role">{role.toUpperCase()}</div>
              <div className="rds-av-db-az">AZ-{String.fromCharCode(97 + i)}</div>
              {i < o.instances - 1 && <div className="rds-av-repl">⇄ replicate</div>}
            </div>
          );
        })}
      </div>

      <div className="rds-av-detail" style={{ "--ac": o.color }}>
        <div className="rds-av-stats">
          <div><span>Cost</span>{o.cost}</div>
          <div><span>High availability</span>{o.ha}</div>
          <div><span>Performance</span>{o.perf}</div>
          <div><span>Failover (RTO)</span>{o.rto}</div>
        </div>
        <div className="rds-av-desc">{o.desc}</div>
      </div>

      <div className="rds-note">
        💡 Exam trap: <strong>Multi-AZ ≠ performance/scaling</strong> — it's purely for high availability (standby is idle). For
        read performance use <strong>read replicas</strong> or <strong>ElastiCache</strong>. Multi-AZ DB <strong>Cluster</strong> is the
        one that <em>does</em> add read capacity (2 readers).
      </div>
    </div>
  );
}

/* ─── 4. RPO / RTO CHOOSER ─────────────────────────────────────────── */
export function RPORTOChooser() {
  const [rpo, setRpo] = useState(2); // hours of tolerable data loss
  const [rto, setRto] = useState(2); // hours of tolerable downtime

  let rec, why, color;
  if (rpo >= 1 && rto >= 1) { rec = "Single DB Instance"; why = "High tolerance for data loss & downtime → cheapest option (1×). Rely on automated backups + manual restore."; color = "#8b949e"; }
  else if (rpo < 1 && rto >= 0.02) { rec = "Multi-AZ DB Instance"; why = "Low data loss tolerance, ~60s failover acceptable → synchronous standby (2×)."; color = "#3fb950"; }
  else { rec = "Multi-AZ DB Cluster"; why = "Extremely low data loss AND fastest failover (~35s) — plus read performance (3×)."; color = "#8c4fff"; }

  return (
    <div className="sv-card rds-card">
      <div className="sv-title rds-title">🎯 Choosing by RPO & RTO</div>
      <p className="rds-intro">
        <strong>RPO</strong> (Recovery Point Objective) = how much <em>data loss</em> you can tolerate. <strong>RTO</strong>
        (Recovery Time Objective) = how much <em>downtime</em> you can tolerate. Lower = pricier option. Set them:
      </p>

      <div className="rds-slider-row">
        <span>RPO (max data loss)</span>
        <input type="range" min="0" max="4" step="0.5" value={rpo} onChange={(e) => setRpo(+e.target.value)} />
        <strong>{rpo === 0 ? "near-zero" : `${rpo} hr`}</strong>
      </div>
      <div className="rds-slider-row">
        <span>RTO (max downtime)</span>
        <input type="range" min="0" max="4" step="0.5" value={rto} onChange={(e) => setRto(+e.target.value)} />
        <strong>{rto === 0 ? "seconds" : `${rto} hr`}</strong>
      </div>

      <div className="rds-rec" style={{ "--rc": color }}>
        <div className="rds-rec-label">Recommended</div>
        <div className="rds-rec-name">{rec}</div>
        <div className="rds-rec-why">{why}</div>
      </div>

      <div className="rds-note">
        💡 You don't invent RPO/RTO — the <strong>business</strong> (or a regulator like RBI for banks) gives them to you, and
        you pick the deployment that meets them at the lowest cost.
      </div>
    </div>
  );
}

/* ─── 5. INSTANCE CLASS NAMING ─────────────────────────────────────── */
export function InstanceClassNaming() {
  const [family, setFamily] = useState("m");
  const [gen, setGen] = useState(6);
  const [size, setSize] = useState("large");

  const families = {
    t: { name: "Burstable", color: "#3fb950", use: "Low-to-moderate load with occasional spikes (dev, free tier)" },
    m: { name: "Standard / General Purpose", color: "#2e73b8", use: "Balanced CPU, memory & network — most web apps & small DBs" },
    r: { name: "Memory Optimized", color: "#8c4fff", use: "Memory-heavy: in-memory DBs, real-time analytics, caching" },
    c: { name: "Compute Optimized", color: "#e3b341", use: "CPU-heavy: batch processing, HPC, analytics" },
  };
  const sizes = ["micro", "small", "medium", "large", "xlarge", "2xlarge", "4xlarge"];
  const f = families[family];

  return (
    <div className="sv-card rds-card">
      <div className="sv-title rds-title">🏷️ Instance Class — Reading the Name</div>
      <p className="rds-intro">An instance class name like <code>db.m6g.large</code> encodes the hardware. Build one:</p>

      <div className="rds-class-builder">
        <span className="rds-class-part fixed">db</span>
        <span className="rds-class-dot">.</span>
        <span className="rds-class-part fam" style={{ "--fc": f.color }}>{family}</span>
        <span className="rds-class-part gen">{gen}</span>
        <span className="rds-class-dot">.</span>
        <span className="rds-class-part size">{size}</span>
      </div>

      <div className="rds-class-controls">
        <div className="rds-class-ctrl">
          <span>Family</span>
          <div className="rds-class-btns">
            {Object.keys(families).map((k) => <button key={k} className={family === k ? "on" : ""} style={{ "--fc": families[k].color }} onClick={() => setFamily(k)}>{k}</button>)}
          </div>
        </div>
        <div className="rds-class-ctrl">
          <span>Generation</span>
          <div className="rds-class-btns">
            {[4, 5, 6, 7].map((g) => <button key={g} className={gen === g ? "on" : ""} onClick={() => setGen(g)}>{g}</button>)}
          </div>
        </div>
        <div className="rds-class-ctrl">
          <span>Size</span>
          <div className="rds-class-btns wrap">
            {sizes.map((s) => <button key={s} className={size === s ? "on" : ""} onClick={() => setSize(s)}>{s}</button>)}
          </div>
        </div>
      </div>

      <div className="rds-class-explain" style={{ "--fc": f.color }}>
        <strong>{f.name}</strong> — {f.use}. <strong>Gen {gen}</strong> = newer hardware (higher = better, like iPhone 15 → 16).
        Each size up roughly <strong>doubles</strong> CPU/RAM and price (xlarge → 2xlarge → 4xlarge…).
      </div>

      <div className="rds-note">
        💡 <strong>RDS Optimized Writes</strong> (a toggle, free, on supported classes) batches writes to cut I/O operations —
        up to <strong>2× write throughput</strong> for write-heavy workloads (transactions, logs).
      </div>
    </div>
  );
}

/* ─── 6. STORAGE AUTO SCALING ──────────────────────────────────────── */
export function StorageAutoScaling() {
  const [used, setUsed] = useState(30);
  const [allocated, setAllocated] = useState(100);
  const max = 500;

  // auto-scaling: when used >= 90% of allocated, bump allocated by 50 (capped at max)
  const grow = () => {
    let u = Math.min(used + 30, max);
    let a = allocated;
    while (u >= a * 0.9 && a < max) a = Math.min(a + 50, max);
    setUsed(u); setAllocated(a);
  };
  const reset = () => { setUsed(30); setAllocated(100); };

  const pct = (used / allocated) * 100;

  return (
    <div className="sv-card rds-card">
      <div className="sv-title rds-title">📈 Storage Auto Scaling</div>
      <p className="rds-intro">
        RDS storage is built on <strong>EBS</strong> (gp2/gp3/io1, magnetic; up to <strong>64 TB</strong>). You pay for
        <strong> allocated</strong> space, not used. <strong>Auto scaling</strong> bumps the allocation (e.g. +50 GB) when usage
        nears <strong>90%</strong> — up to a max you set — so you don't over-provision on day one.
      </p>

      <div className="rds-stor-bar">
        <div className={`rds-stor-used ${pct >= 90 ? "warn" : ""}`} style={{ width: `${pct}%` }}>{used} GB used</div>
        <div className="rds-stor-threshold" style={{ left: "90%" }}><span>90%</span></div>
      </div>
      <div className="rds-stor-labels">
        <span>Allocated: <strong>{allocated} GB</strong> (you pay for this)</span>
        <span>Max: {max} GB</span>
      </div>

      <div className="rds-stor-controls">
        <button className="rds-stor-btn" onClick={grow}>📥 Add ~30 GB of data</button>
        <button className="rds-stor-btn ghost" onClick={reset}>↺ Reset</button>
      </div>

      <div className={`rds-stor-msg ${pct >= 90 && allocated < max ? "warn" : "good"}`}>
        {allocated >= max ? `🛑 Reached the ${max} GB ceiling — auto-scaling stops here.`
          : pct >= 88 ? "⚠️ Near 90% — auto-scaling will add 50 GB."
          : `✅ Healthy: ${used} GB used of ${allocated} GB allocated. You only pay for ${allocated} GB.`}
      </div>

      <div className="rds-note">
        💡 Without auto-scaling, a full disk = app down. Don't provision 500 GB on day 1 (you'd pay for empty space). Limits:
        not for <strong>magnetic</strong> storage, <strong>read replicas</strong>, or <strong>Multi-AZ DB Cluster</strong>. RDS also
        auto <strong>stripes</strong> data across EBS volumes for performance on large databases.
      </div>
    </div>
  );
}

/* ─── 7. CREDENTIALS: SELF-MANAGED vs SECRETS MANAGER ──────────────── */
export function CredentialsSecurity() {
  const [mode, setMode] = useState("secrets");
  const secrets = mode === "secrets";

  return (
    <div className="sv-card rds-card">
      <div className="sv-title rds-title">🔐 Database Credentials — Self-Managed vs Secrets Manager</div>
      <p className="rds-intro">
        How does the web server get the DB password? <strong>Self-managed</strong> stores it in plaintext in app config —
        risky. <strong>Secrets Manager</strong> stores it encrypted and the app fetches it at runtime (with auto-rotation).
      </p>

      <div className="rds-cred-switch">
        <button className={`rds-cred-btn ${!secrets ? "active bad" : ""}`} onClick={() => setMode("self")}>🔓 Self-Managed</button>
        <button className={`rds-cred-btn ${secrets ? "active good" : ""}`} onClick={() => setMode("secrets")}>🔒 Secrets Manager</button>
      </div>

      <div className="rds-cred-flow">
        <div className="rds-cred-node">🌐 Web server<br/><small>(public)</small></div>
        {secrets ? (
          <>
            <div className="rds-cred-arrow">→ fetch →</div>
            <div className="rds-cred-node sm">🔐 Secrets Manager<br/><small>encrypted, IAM-gated</small></div>
            <div className="rds-cred-arrow">→ auth →</div>
            <div className="rds-cred-node db">🛢️ RDS</div>
          </>
        ) : (
          <>
            <div className="rds-cred-arrow bad">→ auth (plaintext pwd in db_test.php) →</div>
            <div className="rds-cred-node db">🛢️ RDS</div>
          </>
        )}
      </div>

      <div className={`rds-cred-verdict ${secrets ? "good" : "bad"}`}>
        {secrets
          ? "✅ No password stored on the web server. Secrets Manager keeps it encrypted, rotates it automatically, and the app retrieves the latest at runtime — even if the web server is hacked, no plaintext credentials leak."
          : "❌ The DB username/password sit in plaintext in a config file (db_test.php) ON the internet-facing web server. Hack the web server → you have the database. No auto-rotation."}
      </div>

      <div className="rds-note">
        💡 Secrets Manager: encrypted storage, IAM access control, automatic rotation (updates RDS too), retrieved via
        SDK/API. Slightly more complex + a small cost — but it's the security best practice.
      </div>
    </div>
  );
}
