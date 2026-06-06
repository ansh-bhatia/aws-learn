import { useState } from "react";
import "./RDSVisuals2.css";

/* ─── 1. CONNECTIVITY & SECURITY GROUP ─────────────────────────────── */
export function RDSConnectivity() {
  return (
    <div className="sv-card rds2-card">
      <div className="sv-title rds2-title">🔌 RDS Connectivity (Best Practice)</div>
      <p className="rds2-intro">
        Put the database in <strong>private subnets</strong> (via a <strong>DB subnet group</strong>), keep <strong>public
        access = No</strong>, and let only the web tier reach it through a security group.
      </p>

      <div className="rds2-conn-stage">
        <div className="rds2-conn-tier public">
          <div className="rds2-conn-label">🟢 Public subnets</div>
          <div className="rds2-conn-box">💻 EC2 web servers<span className="rds2-sg">web-SG</span></div>
        </div>
        <div className="rds2-conn-arrow">↓ TCP 3306 (from web-SG only)</div>
        <div className="rds2-conn-tier private">
          <div className="rds2-conn-label">🔒 Private subnets (DB subnet group)</div>
          <div className="rds2-conn-box db">🛢️ RDS (no public IP)<span className="rds2-sg db">db-SG</span></div>
        </div>
      </div>

      <div className="rds2-conn-rules">
        <div className="rds2-conn-rule"><strong>db-SG inbound:</strong> MySQL <code>3306</code> ← source: <strong>web-SG</strong> (not an IP, not 0.0.0.0/0)</div>
        <div className="rds2-conn-rule"><strong>Direction:</strong> the web server <em>initiates</em> the connection; security groups are <strong>stateful</strong>, so the reply is auto-allowed — no inbound rule needed on web-SG for 3306.</div>
      </div>

      <div className="rds2-note">
        💡 The <strong>DB subnet group</strong> pins RDS to your chosen (private) subnets — Multi-AZ instance needs 2 AZs,
        Multi-AZ cluster needs 3. The optional <strong>certificate authority</strong> setting enables <strong>TLS in transit</strong>
        (install the RDS cert on the web server).
      </div>
    </div>
  );
}

/* ─── 2. DATABASE AUTHENTICATION ───────────────────────────────────── */
export function DatabaseAuth() {
  const [sel, setSel] = useState("password");

  const opts = {
    password: { name: "Password", color: "#3fb950",
      desc: "Native database users (created in MySQL/Postgres) with passwords. Simple — fine for small/dev setups. The master user can create more users.", note: "Primary method, always available." },
    iam: { name: "Password + IAM", color: "#2e73b8",
      desc: "Also let IAM users/roles authenticate using temporary tokens (that expire) — no need to recreate everyone as DB users. Centralized access for teams with IAM identities.", note: "Great for medium orgs with many IAM users." },
    kerberos: { name: "Password + Kerberos (AD)", color: "#8c4fff",
      desc: "Authenticate with corporate Active Directory (single sign-on). Use existing AD users — no separate DB users for hundreds of staff. Complex to set up.", note: "❌ Not supported on Multi-AZ DB Cluster." },
  };
  const o = opts[sel];

  return (
    <div className="sv-card rds2-card">
      <div className="sv-title rds2-title">🔑 Database Authentication</div>

      <div className="rds2-auth-tabs">
        {Object.keys(opts).map((k) => (
          <button key={k} className={`rds2-auth-tab ${sel === k ? "active" : ""}`} style={{ "--ac": opts[k].color }} onClick={() => setSel(k)}>
            {opts[k].name}
          </button>
        ))}
      </div>

      <div className="rds2-auth-detail" style={{ "--ac": o.color }}>
        <div className="rds2-auth-name">{o.name}</div>
        <div className="rds2-auth-desc">{o.desc}</div>
        <div className="rds2-auth-note">📌 {o.note}</div>
      </div>

      <div className="rds2-note">
        💡 <strong>Password</strong> is always on; the other two add to it. IAM auth issues <strong>temporary, expiring tokens</strong>;
        Kerberos ties RDS to <strong>Active Directory</strong> for SSO.
      </div>
    </div>
  );
}

/* ─── 3. MONITORING: 3 TOOLS ───────────────────────────────────────── */
export function RDSMonitoring() {
  const [sel, setSel] = useState("pi");

  const tools = {
    pi: { name: "Performance Insights", icon: "📊", color: "#2e73b8", focus: "Database engine",
      what: "Slow queries, top SQL, database load & wait events. Optimize query performance & load patterns.",
      freq: "Detailed (query-level)", alarms: "❌ No alarms", cost: "Free 7 days retention; pay for longer (up to 2 yrs)" },
    em: { name: "Enhanced Monitoring", icon: "🖥️", color: "#3fb950", focus: "Operating system",
      what: "OS-level metrics: CPU, memory, disk I/O, filesystem, network — straight from the host agent.",
      freq: "Real-time, as fast as 1 second", alarms: "❌ No alarms (goes to CloudWatch Logs)", cost: "Charged by instance size" },
    cw: { name: "CloudWatch", icon: "☁️", color: "#8c4fff", focus: "Both (general AWS tool)",
      what: "Unified metrics across engine + OS. The first place to look. Set ALARMS and automated actions.",
      freq: "Basic (5 min) / Detailed (1 min)", alarms: "✅ Alarms + automation", cost: "Basic free; detailed (1-min) is paid" },
  };
  const t = tools[sel];

  return (
    <div className="sv-card rds2-card">
      <div className="sv-title rds2-title">📈 RDS Monitoring — 3 Tools</div>
      <p className="rds2-intro">
        A DB instance has two parts: the <strong>database engine</strong> and the <strong>OS</strong>. Three tools watch them:
      </p>

      <div className="rds2-mon-tabs">
        {Object.keys(tools).map((k) => (
          <button key={k} className={`rds2-mon-tab ${sel === k ? "active" : ""}`} style={{ "--mc": tools[k].color }} onClick={() => setSel(k)}>
            <span>{tools[k].icon}</span>{tools[k].name}
          </button>
        ))}
      </div>

      <div className="rds2-mon-detail" style={{ "--mc": t.color }}>
        <div className="rds2-mon-focus">Focus: <strong>{t.focus}</strong></div>
        <div className="rds2-mon-what">{t.what}</div>
        <div className="rds2-mon-grid">
          <div><span>Granularity</span>{t.freq}</div>
          <div><span>Alarms</span>{t.alarms}</div>
          <div className="full"><span>Cost</span>{t.cost}</div>
        </div>
      </div>

      <div className="rds2-note">
        💡 Exam cues: <strong>Performance Insights = DB engine / slow SQL</strong>; <strong>Enhanced Monitoring = OS metrics,
        1-second</strong>; <strong>CloudWatch = the only one with alarms & automation</strong> (start here). Enhanced Monitoring
        reads the host directly, so it can be more real-time than CloudWatch's standard metrics.
      </div>
    </div>
  );
}

/* ─── 4. PARAMETER GROUP vs OPTION GROUP ───────────────────────────── */
export function ParameterOptionGroups() {
  const [sel, setSel] = useState("param");

  return (
    <div className="sv-card rds2-card">
      <div className="sv-title rds2-title">⚙️ Parameter Group vs Option Group</div>
      <p className="rds2-intro">
        Even though RDS is managed, you can tune the engine and add features. <strong>Parameter groups change behavior</strong>;
        <strong> option groups add features</strong>.
      </p>

      <div className="rds2-pg-switch">
        <button className={`rds2-pg-btn ${sel === "param" ? "active" : ""}`} onClick={() => setSel("param")}>⚙️ Parameter Group — behavior</button>
        <button className={`rds2-pg-btn ${sel === "option" ? "active" : ""}`} onClick={() => setSel("option")}>🧩 Option Group — features</button>
      </div>

      {sel === "param" ? (
        <div className="rds2-pg-detail">
          <p>Controls <strong>engine settings</strong> — 500+ parameters for MySQL. Adjusts <em>how</em> the engine behaves.</p>
          <ul>
            <li><code>max_connections</code> — cap concurrent connections (e.g. for heavy traffic)</li>
            <li><code>query_cache_size</code> — cache query results to avoid re-running</li>
            <li>Memory, timeouts, performance tuning…</li>
          </ul>
        </div>
      ) : (
        <div className="rds2-pg-detail">
          <p>Adds <strong>extra features / plugins</strong> not in the core engine.</p>
          <ul>
            <li><strong>Oracle OEM</strong> — Enterprise Manager web UI</li>
            <li><strong>SQL Server TDE</strong> — Transparent Data Encryption</li>
            <li><strong>MySQL memcached</strong> — in-memory caching plugin</li>
          </ul>
        </div>
      )}

      <div className="rds2-note">
        💡 Memory hook: <strong>Parameter = behavior</strong> (more connections, memory tuning); <strong>Option = feature</strong>
        (TDE, memcached, OEM). e.g. a busy MySQL DB: bump <code>max_connections</code> (param) + enable memcached (option).
      </div>
    </div>
  );
}

/* ─── 5. BACKUPS: AUTOMATED vs MANUAL + PITR ───────────────────────── */
export function RDSBackups() {
  const [day, setDay] = useState(3); // restore point within retention

  return (
    <div className="sv-card rds2-card">
      <div className="sv-title rds2-title">💾 Backups — Automated vs Manual Snapshots</div>

      <div className="rds2-bk-cols">
        <div className="rds2-bk-col auto">
          <div className="rds2-bk-h">🔄 Automated Backups</div>
          <ul>
            <li><strong>Daily incremental</strong> (first is full) — fast, space-efficient</li>
            <li>Stored in AWS-managed <strong>S3</strong> (same region), invisible to you</li>
            <li>Retention <strong>1–35 days</strong> (default 7; 0 = disabled)</li>
            <li>Enables <strong>Point-In-Time Recovery</strong></li>
            <li>Free up to your DB storage size; runs in a backup window</li>
          </ul>
        </div>
        <div className="rds2-bk-col manual">
          <div className="rds2-bk-h">📸 Manual Snapshots</div>
          <ul>
            <li>You trigger them <strong>any time</strong></li>
            <li><strong>No retention limit</strong> — kept until you delete</li>
            <li>Great <strong>before a big change</strong> or for long-term archival</li>
          </ul>
        </div>
      </div>

      <div className="rds2-pitr">
        <div className="rds2-pitr-label">⏮️ Point-In-Time Recovery — restore to:</div>
        <div className="rds2-pitr-track">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <button key={d} className={`rds2-pitr-day ${day === d ? "active" : d < day ? "kept" : "kept"}`} onClick={() => setDay(d)}>D{d}</button>
          ))}
        </div>
        <div className="rds2-pitr-msg">Restoring to <strong>Day {day}</strong> — recreates a brand-new DB at that moment (within the 7-day window).</div>
      </div>

      <div className="rds2-note">
        💡 <strong>Cross-region backup replication</strong> copies backups to another region for DR (not for Multi-AZ DB
        Cluster; cross-region copies cost extra). Restore = always creates a <strong>new</strong> instance.
      </div>
    </div>
  );
}

/* ─── 6. ENCRYPTION (rest + transit) ───────────────────────────────── */
export function RDSEncryption() {
  const [rest, setRest] = useState(true);
  const [transit, setTransit] = useState(true);

  return (
    <div className="sv-card rds2-card">
      <div className="sv-title rds2-title">🔐 RDS Encryption — At Rest & In Transit</div>
      <p className="rds2-intro">Two layers protect your data. Toggle each.</p>

      <div className="rds2-enc-stage">
        <div className="rds2-enc-node">💻 App</div>
        <div className={`rds2-enc-pipe ${transit ? "on" : "off"}`}>{transit ? "🔒 TLS (in transit)" : "🔓 plaintext"}</div>
        <div className={`rds2-enc-node db ${rest ? "locked" : ""}`}>🛢️ RDS<small>{rest ? "🔒 encrypted at rest" : "🔓 unencrypted"}</small></div>
      </div>

      <div className="rds2-enc-toggles">
        <button className={`rds2-enc-toggle ${rest ? "on" : ""}`} onClick={() => setRest((v) => !v)}>
          {rest ? "🔒" : "🔓"} At rest (KMS) — encrypts storage, backups, snapshots, read replicas & logs
        </button>
        <button className={`rds2-enc-toggle ${transit ? "on" : ""}`} onClick={() => setTransit((v) => !v)}>
          {transit ? "🔒" : "🔓"} In transit (SSL/TLS cert) — encrypts app ↔ DB traffic
        </button>
      </div>

      <div className="rds2-note">
        💡 <strong>At rest uses KMS keys</strong> and must be enabled <strong>at creation</strong> — to encrypt an existing DB you
        must snapshot → copy with encryption → restore. <strong>In transit uses an SSL/TLS certificate</strong> installed on the
        app. Encryption is mandatory for many compliance standards (HIPAA, PCI…).
      </div>
    </div>
  );
}

/* ─── 7. READ REPLICA vs MULTI-AZ STANDBY ──────────────────────────── */
export function ReadReplicaVsStandby() {
  const [sel, setSel] = useState("replica");

  return (
    <div className="sv-card rds2-card">
      <div className="sv-title rds2-title">🔀 Read Replica vs Readable Standby</div>
      <p className="rds2-intro">
        Both make extra copies, but solve different problems — a classic exam confusion.
      </p>

      <div className="rds2-rr-switch">
        <button className={`rds2-rr-btn ${sel === "replica" ? "active" : ""}`} onClick={() => setSel("replica")}>📖 Read Replica</button>
        <button className={`rds2-rr-btn ${sel === "standby" ? "active" : ""}`} onClick={() => setSel("standby")}>🛡️ Readable Standby (Multi-AZ Cluster)</button>
      </div>

      <div className="rds2-rr-grid">
        <div className="rds2-rr-row head"><span>Aspect</span><span className={sel === "replica" ? "hl" : ""}>Read Replica</span><span className={sel === "standby" ? "hl" : ""}>Readable Standby</span></div>
        {[
          ["Purpose", "Scale reads (performance)", "HA + automatic failover (and reads)"],
          ["Replication", "Asynchronous (small lag)", "Synchronous (near real-time)"],
          ["Failover", "❌ Manual promotion (restarts)", "✅ Automatic"],
          ["Location", "Same OR another region 🌍", "Same region, different AZ only"],
          ["Best for", "Read-heavy apps, global low-latency, DR, migration", "Mission-critical HA + some read offload"],
        ].map(([f, r, s], i) => (
          <div key={i} className="rds2-rr-row">
            <span className="rds2-rr-feat">{f}</span>
            <span className={sel === "replica" ? "hl" : ""}>{r}</span>
            <span className={sel === "standby" ? "hl" : ""}>{s}</span>
          </div>
        ))}
      </div>

      <div className="rds2-note">
        💡 <strong>Read Replica = performance, no auto-failover, can be cross-region.</strong> <strong>Multi-AZ standby =
        high availability with auto-failover.</strong> You can use both together. Need HA → Multi-AZ; need read scale →
        replicas.
      </div>
    </div>
  );
}

/* ─── 8. ADVANCED: BLUE/GREEN, PROXY, ZERO-ETL ─────────────────────── */
export function RDSAdvanced() {
  const [sel, setSel] = useState("bluegreen");

  const features = {
    bluegreen: { name: "Blue/Green Deployment", icon: "🔵🟢",
      desc: "Clone production (BLUE) into a synced staging copy (GREEN) where you safely test engine upgrades or schema changes. When happy, switch traffic to GREEN with minimal downtime — and roll back if it fails.",
      points: ["BLUE = live production · GREEN = updated staging", "Test upgrades (e.g. Postgres 13 → 15) / schema changes risk-free", "One-click switchover; easy rollback", "Only MariaDB, MySQL, PostgreSQL (not Oracle/SQL Server)"] },
    proxy: { name: "RDS Proxy", icon: "🔀",
      desc: "A connection-pooling layer between your app and the DB. Apps connect to the proxy endpoint; it reuses pooled DB connections — faster, handles more users, smoother failover, and credentials via Secrets Manager.",
      points: ["Connection pooling — reuses connections (less overhead)", "Especially great for serverless (Lambda) — many short connections", "Faster Multi-AZ failover", "Auth via Secrets Manager — no creds in app code"] },
    zeroetl: { name: "Zero-ETL Integration", icon: "⚡",
      desc: "Automatically replicates RDS data into Amazon Redshift in near real-time — no manual Extract-Transform-Load pipeline. Run analytics/ML on transactional data instantly (e.g. 'biryani is India's #1 dish').",
      points: ["RDS → Redshift, near real-time, no ETL pipeline to build", "For analytics & ML on live transactional data", "⚠️ Only RDS for MySQL 8.0.32+ (not Postgres/MariaDB/Oracle/SQL Server)"] },
  };
  const f = features[sel];

  return (
    <div className="sv-card rds2-card">
      <div className="sv-title rds2-title">🚀 Advanced Features</div>

      <div className="rds2-adv-tabs">
        {Object.keys(features).map((k) => (
          <button key={k} className={`rds2-adv-tab ${sel === k ? "active" : ""}`} onClick={() => setSel(k)}>
            <span className="rds2-adv-icon">{features[k].icon}</span>{features[k].name}
          </button>
        ))}
      </div>

      <div className="rds2-adv-detail">
        <div className="rds2-adv-desc">{f.desc}</div>
        <ul className="rds2-adv-points">{f.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>

      {sel === "proxy" && (
        <div className="rds2-proxy-flow">
          <div className="rds2-proxy-node">λ Lambda / ECS / EKS</div>
          <div className="rds2-proxy-arrow">→</div>
          <div className="rds2-proxy-node proxy">🔀 RDS Proxy<small>connection pool</small></div>
          <div className="rds2-proxy-arrow">→</div>
          <div className="rds2-proxy-node db">🛢️ RDS</div>
        </div>
      )}

      <div className="rds2-note">
        💡 Exam hooks: <strong>Blue/Green</strong> = safe upgrades with rollback; <strong>RDS Proxy</strong> = connection pooling
        (think <strong>Lambda/serverless</strong>); <strong>Zero-ETL</strong> = RDS→Redshift analytics (<strong>MySQL only</strong>).
      </div>
    </div>
  );
}
