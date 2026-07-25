import { useState } from "react";
import "./RDSVisuals2.css";
import "./RDSVisuals4.css";

/* ─── 1. BLUE/GREEN LIFECYCLE WALKTHROUGH ──────────────────────────── */
export function BlueGreenFlow() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      name: "1 · Blue only",
      blurb: "A company runs production on PostgreSQL 13.7. The BLUE environment is the live DB instance (or cluster) your application reads and writes. There is no green yet.",
      green: null,
      blueTraffic: 100,
      greenTraffic: 0,
    },
    {
      name: "2 · Create green",
      blurb: "They want PostgreSQL 15 for new features and better performance. Actions → Create Blue/Green Deployment spins up GREEN as a full copy, already upgraded, and keeps it continuously synced from blue.",
      green: "PostgreSQL 15",
      blueTraffic: 100,
      greenTraffic: 0,
    },
    {
      name: "3 · Apply changes",
      blurb: "Schema changes, engine upgrades and app updates are applied to GREEN only. Production traffic is untouched — blue keeps serving 100% while green is modified.",
      green: "PostgreSQL 15 + schema",
      blueTraffic: 100,
      greenTraffic: 0,
    },
    {
      name: "4 · Test green",
      blurb: "Redirect a slice of test traffic to green. If 100 users hit the app, send 10 to green. Complaints from those 10 mean green has a problem and you roll back. Positive feedback means you are clear to switch.",
      green: "PostgreSQL 15 + schema",
      blueTraffic: 90,
      greenTraffic: 10,
    },
    {
      name: "5a · Switch over",
      blurb: "Testing passed. The blue/green feature automatically redirects all traffic to green — green becomes the new production. Downtime is minimal, but expect a brief connection blip during the cutover.",
      green: "PostgreSQL 15 — LIVE",
      blueTraffic: 0,
      greenTraffic: 100,
      done: true,
    },
    {
      name: "5b · Roll back",
      blurb: "Green failed testing instead. Because blue was never touched, you simply keep it. No downgrade, no restore, no data loss — this is the whole reason blue/green exists.",
      green: "🗑️ discarded — blue untouched",
      blueTraffic: 100,
      greenTraffic: 0,
      rollback: true,
    },
  ];

  const s = steps[step];

  return (
    <div className="sv-card rds2-card">
      <div className="sv-title rds2-title">🔵🟢 Blue/Green Deployment — Full Lifecycle</div>
      <p className="rds2-intro">
        Step through a real upgrade. <strong>Blue</strong> is production, <strong>green</strong> is the synced
        staging copy. Notice that blue is never modified until the very last moment — that is what makes
        rollback free.
      </p>

      <div className="rds4-steps">
        {steps.map((st, i) => (
          <button
            key={st.name}
            className={`rds4-step ${step === i ? "active" : ""} ${st.rollback ? "rb" : ""}`}
            onClick={() => setStep(i)}
          >
            {st.name}
          </button>
        ))}
      </div>

      <div className="rds4-stage">
        <div className="rds4-env blue">
          <div className="rds4-env-tag">BLUE · production</div>
          <div className="rds4-env-db">🛢️ PostgreSQL 13.7</div>
          <div className={`rds4-traffic ${s.blueTraffic === 0 ? "off" : ""}`}>
            <span className="rds4-bar" style={{ width: `${s.blueTraffic}%` }} />
            <span className="rds4-pct">{s.blueTraffic}% traffic</span>
          </div>
        </div>

        <div className={`rds4-sync ${s.green ? "on" : ""}`}>
          {s.green ? "⇅ synced" : "—"}
        </div>

        <div className={`rds4-env green ${s.green ? "" : "empty"} ${s.rollback ? "dead" : ""}`}>
          <div className="rds4-env-tag">GREEN · staging</div>
          <div className="rds4-env-db">
            {s.green ? (s.rollback ? s.green : `🛢️ ${s.green}`) : "not created yet"}
          </div>
          <div className={`rds4-traffic ${s.greenTraffic === 0 ? "off" : ""}`}>
            <span className="rds4-bar green" style={{ width: `${s.greenTraffic}%` }} />
            <span className="rds4-pct">{s.greenTraffic}% traffic</span>
          </div>
        </div>
      </div>

      <div className={`rds4-blurb ${s.done ? "ok" : ""} ${s.rollback ? "warn" : ""}`}>{s.blurb}</div>

      <div className="rds2-note">
        Step 5 branches: <strong>5a</strong> and <strong>5b</strong> are the two possible endings from the same
        test. Both are safe — that is the point.
      </div>
    </div>
  );
}

/* ─── 2. USE CASES vs LIMITATIONS ──────────────────────────────────── */
export function BlueGreenUseCases() {
  const [tab, setTab] = useState("use");

  const uses = [
    ["🆙", "Database engine upgrade", "The headline use case. Test PostgreSQL 13 → 15 or MySQL 5.7 → 8.0 on green before it ever touches production."],
    ["🧱", "Schema changes", "Already on the latest engine but need to add tables or alter columns? Apply the schema to green, test it, then switch."],
    ["🧪", "Testing new features", "A new engine version ships features you want to try. Exercise them on green with real synced data."],
    ["🛟", "Disaster recovery", "Blue/green creates an identical, continuously synced copy — usable as a standby you have already validated."],
    ["📊", "Performance testing", "Benchmark the effect of an upgrade or a schema change against production-shaped data, without risking production."],
  ];

  const limits = [
    ["💰", "Temporary cost increase", "Green is a full second environment. You pay for both until you delete blue after switchover."],
    ["🚫", "Limited engines", "Only RDS for MariaDB, MySQL and PostgreSQL. NOT Oracle and NOT Microsoft SQL Server — a favourite exam trap."],
    ["🔄", "Data synchronisation overhead", "Keeping green in sync with blue costs resources and adds replication lag to account for."],
    ["🔌", "Connection handling at switchover", "The cutover is fast but not instant. Applications can briefly fail to connect during the switch."],
    ["⚙️", "No full automation", "Some changes are not carried across automatically and still need manual handling."],
  ];

  const rows = tab === "use" ? uses : limits;

  return (
    <div className="sv-card rds2-card">
      <div className="sv-title rds2-title">✅ Use Cases vs ⚠️ Limitations</div>
      <p className="rds2-intro">
        Exam questions on blue/green are almost always scenario-based — they describe a situation and expect you
        to recognise it. Learn these five and five.
      </p>

      <div className="rds2-adv-tabs">
        <button className={`rds2-adv-tab ${tab === "use" ? "active" : ""}`} onClick={() => setTab("use")}>
          <span className="rds2-adv-icon">✅</span>5 Use Cases
        </button>
        <button className={`rds2-adv-tab ${tab === "lim" ? "active" : ""}`} onClick={() => setTab("lim")}>
          <span className="rds2-adv-icon">⚠️</span>5 Limitations
        </button>
      </div>

      <div className="rds4-list">
        {rows.map(([icon, title, desc]) => (
          <div key={title} className={`rds4-row ${tab === "lim" ? "lim" : ""}`}>
            <span className="rds4-row-icon">{icon}</span>
            <div>
              <div className="rds4-row-title">{title}</div>
              <div className="rds4-row-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rds2-note">
        If a question mentions <strong>Oracle</strong> or <strong>SQL Server</strong> plus blue/green, the answer
        is that blue/green does not support it — look for a read-replica or snapshot-restore option instead.
      </div>
    </div>
  );
}
