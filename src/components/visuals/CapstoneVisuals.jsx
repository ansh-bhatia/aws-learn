import { useState, useEffect } from "react";
import "./CapstoneVisuals.css";

/* ─── 1. PROJECT BRIEF ─────────────────────────────────────────────── */
export function ProjectBrief() {
  const [tab, setTab] = useState("objectives");

  const objectives = [
    { icon: "🟢", title: "High Availability", desc: "Minimal downtime by spreading across multiple Availability Zones." },
    { icon: "📈", title: "Scalability", desc: "Auto Scaling adjusts EC2 count automatically with traffic." },
    { icon: "🔒", title: "Security", desc: "Security groups + private subnets + VPC design — no public web servers." },
    { icon: "🛡️", title: "Resilience", desc: "Self-healing setup that survives failure & traffic spikes — no manual action." },
  ];
  const services = [
    { icon: "🏗️", name: "VPC", role: "Isolated network — public & private subnets across 2 AZs" },
    { icon: "🗄️", name: "EFS", role: "Shared storage holding the web app (one central copy)" },
    { icon: "💻", name: "EC2", role: "Compute hosting the application (private subnets)" },
    { icon: "⚙️", name: "Auto Scaling", role: "Dynamically scales instances with demand" },
    { icon: "⚖️", name: "ALB", role: "Distributes traffic across instances in different AZs" },
    { icon: "🌐", name: "Route 53", role: "DNS — a friendly domain name for the app" },
  ];

  return (
    <div className="sv-card cap-card">
      <div className="cap-hero">
        <div className="cap-hero-badge">🏆 Capstone Project 1</div>
        <div className="cap-hero-title">Resilient &amp; Scalable Web App on AWS</div>
        <div className="cap-hero-sub">An end-to-end build combining VPC, EFS, EC2, Auto Scaling, ALB &amp; Route 53 — using AWS best practices.</div>
      </div>

      <div className="cap-tabs">
        <button className={`cap-tab ${tab === "objectives" ? "active" : ""}`} onClick={() => setTab("objectives")}>🎯 Objectives</button>
        <button className={`cap-tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>🧰 Services Used</button>
      </div>

      {tab === "objectives" ? (
        <div className="cap-obj-grid">
          {objectives.map((o) => (
            <div key={o.title} className="cap-obj-card">
              <span className="cap-obj-icon">{o.icon}</span>
              <div className="cap-obj-title">{o.title}</div>
              <div className="cap-obj-desc">{o.desc}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cap-svc-list">
          {services.map((s) => (
            <div key={s.name} className="cap-svc-row">
              <span className="cap-svc-icon">{s.icon}</span>
              <span className="cap-svc-name">{s.name}</span>
              <span className="cap-svc-role">{s.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 2. 3D ARCHITECTURE BUILDER (centerpiece) ─────────────────────── */
export function ArchitectureBuilder3D() {
  const [stage, setStage] = useState(0);
  const [spin, setSpin] = useState(true);

  // Reveal levels: 0 VPC, 1 subnets, 2 IGW+NAT, 3 EFS, 4 ASG instances, 5 ALB, 6 Route53+traffic
  const stages = [
    { name: "VPC", note: "Create the VPC (192.168.0.0/24) — your isolated private network in Mumbai." },
    { name: "Subnets", note: "4 subnets across 2 AZs: 2 public (top), 2 private (bottom) for high availability." },
    { name: "IGW + NAT", note: "Internet Gateway gives public subnets internet; NAT Gateway gives private subnets outbound-only internet." },
    { name: "EFS", note: "Shared EFS stores ONE copy of the web app — every instance mounts it. Update once, reflected everywhere." },
    { name: "Auto Scaling", note: "Auto Scaling Group launches EC2 instances (from a custom AMI) into the private subnets." },
    { name: "ALB", note: "Application Load Balancer in the public subnets fans traffic to the private instances — the only public door." },
    { name: "Route 53", note: "Route 53 maps your domain (learn.cloudfox.in) to the ALB. Users reach the app by name. ✅ Done!" },
  ];
  const s = stage;

  return (
    <div className="sv-card cap-card">
      <div className="sv-title cap-title">🧱 Build the Architecture — Step Through It</div>
      <p className="cap-intro">
        Watch the whole stack assemble in 3D, phase by phase — exactly how the project is built. Drag the slider or step
        through.
      </p>

      <div className={`cap-scene ${spin ? "spin" : ""}`}>
        <div className="cap-world">
          {/* VPC slab */}
          <div className="cap-vpc-slab">
            <div className="cap-vpc-label">VPC · 192.168.0.0/24 · Mumbai</div>
          </div>

          {/* Route 53 globe */}
          {s >= 6 && <div className="cap-r53">🌐<span>Route 53<br/>learn.cloudfox.in</span></div>}

          {/* User traffic */}
          {s >= 6 && <div className="cap-user">🧑‍💻<span>Users</span></div>}

          {/* IGW */}
          {s >= 2 && <div className="cap-igw">🌍 IGW</div>}

          {/* AZ columns */}
          {s >= 1 && (
            <div className="cap-azs">
              {["ap-south-1a", "ap-south-1b"].map((az, ai) => (
                <div key={az} className="cap-az-col">
                  <div className="cap-az-name">{az}</div>

                  {/* public subnet */}
                  <div className="cap-subnet public">
                    <span className="cap-subnet-tag">🟢 public</span>
                    {s >= 5 && <div className="cap-comp alb">⚖️ ALB</div>}
                    {s >= 2 && ai === 0 && <div className="cap-comp nat">🔁 NAT</div>}
                  </div>

                  {/* private subnet */}
                  <div className="cap-subnet private">
                    <span className="cap-subnet-tag">🔒 private</span>
                    {s >= 4 && <div className="cap-comp ec2">💻 EC2{s >= 4 ? " (AMI)" : ""}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EFS shared disk */}
          {s >= 3 && <div className="cap-efs">🗄️<span>EFS (shared app)</span></div>}
        </div>
      </div>

      <div className="cap-stage-note"><strong>Phase {s + 1}: {stages[s].name}.</strong> {stages[s].note}</div>

      <input type="range" min="0" max="6" value={stage} onChange={(e) => setStage(+e.target.value)} className="cap-range" />

      <div className="cap-builder-controls">
        <button className="cap-btn" onClick={() => setStage(Math.max(0, stage - 1))} disabled={stage === 0}>← Back</button>
        <button className="cap-btn ghost" onClick={() => setSpin((v) => !v)}>{spin ? "⏸ Stop spin" : "▶ Auto-spin"}</button>
        <button className="cap-btn primary" onClick={() => setStage(Math.min(6, stage + 1))} disabled={stage === 6}>Next →</button>
      </div>
    </div>
  );
}

/* ─── 3. PROJECT PHASE FLOW ────────────────────────────────────────── */
export function ProjectPhaseFlow() {
  const [active, setActive] = useState(0);

  const phases = [
    { icon: "✏️", name: "Design", desc: "Architect the solution around availability, scalability & security." },
    { icon: "🏗️", name: "VPC", desc: "Create VPC, 4 subnets (2 AZs), IGW, NAT, route tables." },
    { icon: "🗄️", name: "EFS", desc: "Create shared EFS, mount targets in both AZs." },
    { icon: "📀", name: "Custom AMI", desc: "Build a web server, mount EFS at /var/www/html (via fstab), bake an AMI." },
    { icon: "⚙️", name: "Auto Scaling + ALB", desc: "Launch template + ASG in private subnets; ALB in public subnets; 2 target groups (:80 app, :8080 test)." },
    { icon: "🔒", name: "Security Groups", desc: "Lock down: ALB :80 from anywhere; web SG :80 only from ALB-SG; EFS :2049 only from web SG." },
    { icon: "🌐", name: "Route 53", desc: "Point the domain's NS to Route 53; alias record → ALB." },
    { icon: "🧪", name: "Testing", desc: "Kill an instance (HA), spike CPU (scale-out), drop load (scale-in)." },
    { icon: "📄", name: "Documentation", desc: "Architecture diagram, config guide, performance report, presentation." },
  ];

  return (
    <div className="sv-card cap-card">
      <div className="sv-title cap-title">🗺️ The 9 Project Phases</div>

      <div className="cap-phase-track">
        {phases.map((p, i) => (
          <button key={i} className={`cap-phase-node ${active === i ? "active" : i < active ? "done" : ""}`} onClick={() => setActive(i)}>
            <span className="cap-phase-icon">{p.icon}</span>
            <span className="cap-phase-num">{i + 1}</span>
            {i < phases.length - 1 && <span className="cap-phase-line" />}
          </button>
        ))}
      </div>

      <div className="cap-phase-detail">
        <div className="cap-phase-head"><span>{phases[active].icon}</span> Phase {active + 1}: {phases[active].name}</div>
        <div className="cap-phase-desc">{phases[active].desc}</div>
      </div>
    </div>
  );
}

/* ─── 4. RESILIENCE & SCALING TEST ─────────────────────────────────── */
export function ResilienceTest() {
  const [instances, setInstances] = useState([
    { id: "i-237", az: "1a", up: true },
    { id: "i-135", az: "1b", up: true },
  ]);
  const [log, setLog] = useState(["Steady state: 2 healthy instances across 2 AZs."]);
  const [load, setLoad] = useState(20);

  const healthy = instances.filter((i) => i.up).length;

  const killOne = () => {
    const victim = instances.find((i) => i.up);
    if (!victim) return;
    setInstances((arr) => arr.map((i) => i.id === victim.id ? { ...i, up: false } : i));
    setLog((l) => [`💥 Terminated ${victim.id} (AZ ${victim.az}). App stays up via the other AZ.`, ...l]);
    // ASG self-heals after a moment
    setTimeout(() => {
      const newId = "i-" + Math.floor(100 + Math.random() * 800);
      setInstances((arr) => {
        const replaced = arr.map((i) => !i.up ? { id: newId, az: i.az, up: true } : i);
        return replaced;
      });
      setLog((l) => [`♻️ Auto Scaling launched ${newId} (min=2) and ALB added it to rotation.`, ...l]);
    }, 1800);
  };

  // scale out/in based on load
  useEffect(() => {
    if (load > 60 && instances.filter((i) => i.up).length < 5) {
      const t = setTimeout(() => {
        const newId = "i-" + Math.floor(100 + Math.random() * 800);
        setInstances((arr) => [...arr, { id: newId, az: arr.length % 2 ? "1a" : "1b", up: true }]);
        setLog((l) => [`🔼 Avg CPU ${load}% > 60% → scaled OUT, launched ${newId}.`, ...l]);
      }, 1500);
      return () => clearTimeout(t);
    }
    if (load < 30 && instances.filter((i) => i.up).length > 2) {
      const t = setTimeout(() => {
        setInstances((arr) => arr.slice(0, -1));
        setLog((l) => [`🔽 Avg CPU ${load}% < 30% → scaled IN, terminated 1 instance.`, ...l]);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [load, instances]);

  return (
    <div className="sv-card cap-card">
      <div className="sv-title cap-title">🧪 Test It — Resilience &amp; Scaling</div>
      <p className="cap-intro">
        Prove the project works: terminate an instance (high availability) and spike the load (auto scaling). Watch the
        fleet self-heal and scale.
      </p>

      <div className="cap-fleet">
        {instances.map((i) => (
          <div key={i.id} className={`cap-fleet-node ${i.up ? "up" : "down"}`}>
            <span className="cap-fleet-icon">{i.up ? "💻" : "💥"}</span>
            <span className="cap-fleet-id">{i.id}</span>
            <span className="cap-fleet-az">AZ {i.az}</span>
          </div>
        ))}
      </div>
      <div className="cap-fleet-status">{healthy} healthy instance{healthy !== 1 ? "s" : ""} serving traffic</div>

      <div className="cap-test-controls">
        <button className="cap-btn warn" onClick={killOne} disabled={healthy === 0}>💥 Terminate an instance</button>
        <div className="cap-load-ctrl">
          <span>CPU load: <strong>{load}%</strong></span>
          <input type="range" min="0" max="100" value={load} onChange={(e) => setLoad(+e.target.value)} />
        </div>
      </div>

      <div className="cap-log">
        {log.slice(0, 5).map((line, i) => <div key={i} className="cap-log-line">{line}</div>)}
      </div>
    </div>
  );
}

/* ─── 5. DELIVERABLES ──────────────────────────────────────────────── */
export function ProjectDeliverables() {
  const [done, setDone] = useState([false, false, false, false]);

  const items = [
    { icon: "📐", title: "Architecture Diagram & Design Doc", desc: "VPC design + data-flow diagrams, and the rationale (why public/private subnets, why EFS…)." },
    { icon: "📖", title: "Implementation & Configuration Guide", desc: "Versioned, step-by-step build guide (VPC → EC2 → EFS → ALB → Route 53)." },
    { icon: "📊", title: "Performance & Optimization Report", desc: "Baseline metrics, load-test results, scaling behaviour observed." },
    { icon: "🖥️", title: "Project Presentation", desc: "Slide deck: agenda, architecture, deployment strategy, challenges & solutions." },
  ];

  const count = done.filter(Boolean).length;

  return (
    <div className="sv-card cap-card">
      <div className="sv-title cap-title">📦 Deliverables Checklist</div>
      <p className="cap-intro">Four documents complete the project. Tick them off — the documentation is the first impression.</p>

      <div className="cap-deliver-bar"><div className="cap-deliver-fill" style={{ width: `${(count / 4) * 100}%` }} /></div>
      <div className="cap-deliver-count">{count} / 4 delivered</div>

      <div className="cap-deliver-list">
        {items.map((it, i) => (
          <button key={i} className={`cap-deliver-item ${done[i] ? "done" : ""}`} onClick={() => setDone(done.map((d, j) => j === i ? !d : d))}>
            <span className="cap-deliver-check">{done[i] ? "✅" : "⬜"}</span>
            <span className="cap-deliver-icon">{it.icon}</span>
            <div>
              <div className="cap-deliver-title">{it.title}</div>
              <div className="cap-deliver-desc">{it.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {count === 4 && <div className="cap-complete">🎉 Project complete — all deliverables submitted!</div>}
    </div>
  );
}
