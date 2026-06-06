import { useState, useEffect } from "react";
import "./AutoScalingVisuals.css";

/* ─── 1. VERTICAL vs HORIZONTAL SCALING ────────────────────────────── */
export function ScalingTypes() {
  const [mode, setMode] = useState("horizontal");
  const [level, setLevel] = useState(1); // 1..3

  const vRam = [2, 4, 16][level - 1];
  const hServers = level;

  return (
    <div className="sv-card as-card">
      <div className="sv-title as-title">📈 Vertical vs Horizontal Scaling</div>
      <p className="as-intro">
        <strong>Scaling</strong> adjusts compute capacity to meet demand (think Amazon's Big Billion Day sale).
        <strong> Vertical</strong> = bigger server; <strong>horizontal</strong> = more servers. AWS Auto Scaling does
        <strong> horizontal</strong> only.
      </p>

      <div className="as-switch">
        <button className={`as-switch-btn ${mode === "vertical" ? "active" : ""}`} onClick={() => { setMode("vertical"); setLevel(1); }}>↕ Vertical (scale up/down)</button>
        <button className={`as-switch-btn ${mode === "horizontal" ? "active good" : ""}`} onClick={() => { setMode("horizontal"); setLevel(1); }}>↔ Horizontal (scale out/in)</button>
      </div>

      <div className="as-scale-stage">
        {mode === "vertical" ? (
          <div className="as-vstack">
            <div className="as-vserver" style={{ height: `${40 + level * 38}px` }}>
              <span className="as-vserver-ram">{vRam} GB</span>
              <span className="as-vserver-label">1 server</span>
            </div>
          </div>
        ) : (
          <div className="as-hstack">
            {Array.from({ length: hServers }).map((_, i) => (
              <div key={i} className="as-hserver">🖥️<span>2 GB</span></div>
            ))}
          </div>
        )}
      </div>

      <div className="as-scale-controls">
        <button className="as-btn" onClick={() => setLevel(Math.max(1, level - 1))} disabled={level === 1}>
          ← {mode === "vertical" ? "Scale down" : "Scale in"}
        </button>
        <span className="as-scale-label">
          {mode === "vertical" ? `${vRam} GB on one server` : `${hServers} server${hServers > 1 ? "s" : ""}`}
        </span>
        <button className="as-btn primary" onClick={() => setLevel(Math.min(3, level + 1))} disabled={level === 3}>
          {mode === "vertical" ? "Scale up" : "Scale out"} →
        </button>
      </div>

      <div className="as-note">
        💡 <strong>Vertical:</strong> add RAM/CPU to one machine — hits a hardware ceiling (bottleneck). Terms: <strong>scale
        up</strong> / <strong>scale down</strong>.
        <br/>↔ <strong>Horizontal:</strong> add/remove whole servers — virtually unlimited. Terms: <strong>scale out</strong> /
        <strong> scale in</strong>. This is what AWS Auto Scaling automates.
      </div>
    </div>
  );
}

/* ─── 2. ASG + LAUNCH TEMPLATE ─────────────────────────────────────── */
export function ASGLaunchTemplate() {
  return (
    <div className="sv-card as-card">
      <div className="sv-title as-title">🧩 Auto Scaling Group & Launch Template</div>
      <p className="as-intro">
        Two pieces work together: a <strong>Launch Template</strong> (the blueprint for each instance) and an
        <strong> Auto Scaling Group</strong> (manages the fleet as one unit, across AZs).
      </p>

      <div className="as-asg-diagram">
        <div className="as-lt-box">
          <div className="as-lt-head">📋 Launch Template</div>
          <div className="as-lt-items">
            {["AMI (e.g. Amazon Linux)", "Instance type (t2.micro)", "Key pair (.pem)", "Security group", "User data script (web server)", "EBS volume"].map((x) => (
              <span key={x} className="as-lt-item">{x}</span>
            ))}
          </div>
        </div>
        <div className="as-asg-arrow">used by →</div>
        <div className="as-asg-box">
          <div className="as-asg-head">⚙️ Auto Scaling Group</div>
          <div className="as-asg-azs">
            <div className="as-asg-az">AZ-A<br/>🖥️</div>
            <div className="as-asg-az">AZ-B<br/>🖥️🖥️</div>
          </div>
          <div className="as-asg-cap">min · desired · max</div>
        </div>
      </div>

      <div className="as-note">
        💡 The Launch Template standardises every new instance, so the ASG can spin up identical servers on demand. It's
        reusable beyond Auto Scaling (e.g. plain EC2 launches too).
      </div>
    </div>
  );
}

/* ─── 3. MIN / DESIRED / MAX CAPACITY ──────────────────────────────── */
export function CapacityControls() {
  const [min, setMin] = useState(1);
  const [desired, setDesired] = useState(2);
  const [max, setMax] = useState(5);

  // keep desired within [min, max]
  const d = Math.min(Math.max(desired, min), max);

  return (
    <div className="sv-card as-card">
      <div className="sv-title as-title">🎚️ Min / Desired / Max Capacity</div>
      <p className="as-intro">
        Every ASG has three numbers. <strong>Desired</strong> is how many you want now; <strong>min</strong> is the floor
        Auto Scaling always keeps (fault tolerance — terminate one and it's recreated); <strong>max</strong> is the ceiling
        (desired can never exceed it).
      </p>

      <div className="as-cap-track">
        {Array.from({ length: max }).map((_, i) => {
          const n = i + 1;
          const running = n <= d;
          const belowMin = n <= min;
          return (
            <div key={i} className={`as-cap-slot ${running ? "running" : ""} ${belowMin ? "pinned" : ""}`}>
              {running ? "🖥️" : "➖"}
            </div>
          );
        })}
      </div>
      <div className="as-cap-legend">
        <span>🖥️ running ({d})</span><span className="pin">📌 min-guaranteed</span><span>➖ headroom up to max</span>
      </div>

      <div className="as-cap-sliders">
        {[["Min", min, setMin, 0, max], ["Desired", desired, setDesired, min, max], ["Max", max, setMax, Math.max(min, 1), 10]].map(([label, val, set, lo, hi]) => (
          <div key={label} className="as-cap-row">
            <span className="as-cap-name">{label}</span>
            <input type="range" min={lo} max={hi} value={val} onChange={(e) => set(+e.target.value)} />
            <span className="as-cap-val">{val}</span>
          </div>
        ))}
      </div>

      <div className="as-note">
        💡 <strong>Manual scaling</strong> = you change desired yourself. Set it below current → <strong>scale in</strong>
        (instances terminated); above → <strong>scale out</strong> (instances launched). Delete an ASG to remove all its
        instances — terminating them individually just makes the ASG recreate them.
      </div>
    </div>
  );
}

/* ─── 4. SCALING OPTIONS OVERVIEW ──────────────────────────────────── */
export function ScalingOptions() {
  const [sel, setSel] = useState(0);

  const opts = [
    { name: "Manual", icon: "✋", color: "#8b949e", reactive: "—",
      desc: "You set min/desired/max yourself. Best for infrequent, known events (e.g. a new game release at a fixed time).",
      example: "Bump desired from 1 → 4 by hand." },
    { name: "Scheduled", icon: "📅", color: "#2e73b8", reactive: "Proactive",
      desc: "Scale at a known date/time. For predictable recurring patterns — weekends, end-of-month, a sale with fixed dates.",
      example: "At Fri 6pm: desired = 4. Mon 9am: desired = 1." },
    { name: "Dynamic", icon: "📊", color: "#3fb950", reactive: "Reactive",
      desc: "React to live metrics (CPU, network, ALB requests) via CloudWatch alarms. Handles sudden, uncertain spikes.",
      example: "If avg CPU > 60% → add instances." },
    { name: "Predictive", icon: "🔮", color: "#8c4fff", reactive: "Proactive (ML)",
      desc: "Uses ML on ≥3 weeks of history to forecast traffic and pre-launch capacity. Combine with dynamic for best results.",
      example: "Forecast 10am spike → launch at 9:55am." },
  ];
  const o = opts[sel];

  return (
    <div className="sv-card as-card">
      <div className="sv-title as-title">🔧 The 4 Scaling Options</div>

      <div className="as-opt-tabs">
        {opts.map((op, i) => (
          <button key={i} className={`as-opt-tab ${sel === i ? "active" : ""}`} style={{ "--oc": op.color }} onClick={() => setSel(i)}>
            <span className="as-opt-icon">{op.icon}</span>
            <span className="as-opt-name">{op.name}</span>
          </button>
        ))}
      </div>

      <div className="as-opt-detail" style={{ "--oc": o.color }}>
        <div className="as-opt-head">
          <span className="as-opt-big">{o.icon}</span>
          <div>
            <div className="as-opt-title">{o.name} Scaling</div>
            {o.reactive !== "—" && <span className="as-opt-badge">{o.reactive}</span>}
          </div>
        </div>
        <div className="as-opt-desc">{o.desc}</div>
        <div className="as-opt-example">📝 {o.example}</div>
      </div>

      <div className="as-note">
        💡 <strong>Dynamic</strong> has 3 policy types: <strong>Simple</strong> (one threshold), <strong>Step</strong>
        (multiple thresholds → different amounts), <strong>Target Tracking</strong> (set a target like 60% CPU and AWS
        self-optimises). Predictive can run forecast-only or forecast-and-scale.
      </div>
    </div>
  );
}

/* ─── 5. DYNAMIC SCALING SIMULATOR ─────────────────────────────────── */
export function DynamicScalingSim() {
  const [cpu, setCpu] = useState(20);
  const target = 60;
  const min = 1, max = 5;

  // instances scale roughly proportional to cpu vs target
  let instances = Math.round((cpu / target) * 2);
  instances = Math.min(Math.max(instances, min), max);

  const action = cpu > target ? "scale-out" : cpu < target - 20 ? "scale-in" : "stable";

  return (
    <div className="sv-card as-card">
      <div className="sv-title as-title">📊 Dynamic Scaling — Target Tracking (60% CPU)</div>
      <p className="as-intro">
        Target tracking keeps average CPU near a target. Drag the load and watch the ASG add or remove instances to chase
        <strong> {target}%</strong>.
      </p>

      <div className="as-dyn-gauge">
        <div className="as-dyn-bar-track">
          <div className="as-dyn-target" style={{ left: `${target}%` }}><span>target {target}%</span></div>
          <div className={`as-dyn-bar ${cpu > target ? "hot" : "cool"}`} style={{ width: `${cpu}%` }} />
        </div>
        <div className="as-dyn-cpu-label">Average CPU: <strong>{cpu}%</strong></div>
      </div>

      <input type="range" min="0" max="100" value={cpu} onChange={(e) => setCpu(+e.target.value)} className="as-dyn-slider" />

      <div className="as-dyn-fleet">
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} className={`as-dyn-server ${i < instances ? "on" : ""}`}>🖥️</div>
        ))}
      </div>

      <div className={`as-dyn-action ${action}`}>
        {action === "scale-out" && `🔼 CPU above target → SCALE OUT to ${instances} instances`}
        {action === "scale-in" && `🔽 CPU well below target → SCALE IN to ${instances} instance${instances > 1 ? "s" : ""}`}
        {action === "stable" && `✅ Near target — holding at ${instances} instances`}
      </div>

      <div className="as-note">
        💡 Dynamic scaling needs <strong>CloudWatch alarms</strong> on a metric (CPU, network in/out, ALB request count).
        A <strong>warm-up</strong> delay stops a brand-new instance's metrics from skewing decisions while it boots.
      </div>
    </div>
  );
}

/* ─── 6. INSTANCE MAINTENANCE POLICY ───────────────────────────────── */
export function MaintenancePolicy() {
  const [policy, setPolicy] = useState("launch-before");

  const policies = {
    "terminate-launch": { name: "Terminate and Launch", color: "#e3b341", peak: "= desired",
      desc: "Terminates old instances first, then launches new ones. Capacity can dip below desired — but you never pay for extra. Prioritises cost.",
      cap: "Min healthy can drop (e.g. 50%); max stays at desired." },
    "launch-before": { name: "Launch Before Terminating", color: "#3fb950", peak: "> desired",
      desc: "Launches new instances first, then terminates old ones. Capacity temporarily exceeds desired (you pay more briefly). Prioritises availability — zero downtime.",
      cap: "Temporarily up to 2× desired (e.g. 100% min, 200% max)." },
    "custom": { name: "Custom Behavior", color: "#8c4fff", peak: "your choice",
      desc: "Set both the minimum and maximum healthy percentages yourself. Full control — ideal for large fleets.",
      cap: "You define min % and max % freely." },
  };
  const p = policies[policy];

  return (
    <div className="sv-card as-card">
      <div className="sv-title as-title">🔧 Instance Maintenance Policy</div>
      <p className="as-intro">
        When you update the Launch Template (e.g. swap the AMI) and run an <strong>instance refresh</strong>, this policy
        controls how old instances are replaced.
      </p>

      <div className="as-mp-tabs">
        {Object.keys(policies).map((k) => (
          <button key={k} className={`as-mp-tab ${policy === k ? "active" : ""}`} style={{ "--mc": policies[k].color }} onClick={() => setPolicy(k)}>
            {policies[k].name}
          </button>
        ))}
      </div>

      <div className="as-mp-viz" style={{ "--mc": p.color }}>
        <div className="as-mp-bar">
          <div className="as-mp-desired-line"><span>desired = 2</span></div>
          <div className="as-mp-fill" style={{ width: policy === "launch-before" ? "100%" : policy === "terminate-launch" ? "50%" : "75%" }}>
            peak capacity {p.peak}
          </div>
        </div>
      </div>

      <div className="as-mp-detail" style={{ "--mc": p.color }}>
        <div className="as-mp-name">{p.name}</div>
        <div className="as-mp-desc">{p.desc}</div>
        <div className="as-mp-cap">📐 {p.cap}</div>
      </div>

      <div className="as-note">
        💡 <strong>Launch-before-terminate</strong> = no downtime but brief extra cost. <strong>Terminate-and-launch</strong>
        = cost-controlled but capacity dips. <strong>Custom</strong> = pick your own min/max % for fine control.
      </div>
    </div>
  );
}

/* ─── 7. TERMINATION POLICY (default flow) ─────────────────────────── */
export function TerminationPolicy() {
  const [step, setStep] = useState(0);

  const steps = [
    { title: "1. Balance across AZs", desc: "Pick the AZ with the most instances (to rebalance). Here AZ-A has 3 → candidates: A1, A2, A3.", remain: "A1, A2, A3" },
    { title: "2. Scale-in protection", desc: "Drop any instance marked protected from scale-in. None protected here → all 3 stay in consideration.", remain: "A1, A2, A3" },
    { title: "3. Oldest launch template", desc: "Prefer instances on the oldest template. A1 & A2 use the old template; A3 uses the new one → A3 removed.", remain: "A1, A2" },
    { title: "4. Closest to next billing hour", desc: "Of the rest, terminate the one closest to its next billing hour (least wasted paid time). A1 is 50 min in → terminate A1.", remain: "A1 ❌" },
    { title: "5. Random tiebreaker", desc: "If still tied, Auto Scaling picks one at random.", remain: "—" },
  ];

  return (
    <div className="sv-card as-card">
      <div className="sv-title as-title">🗑️ Default Termination Policy</div>
      <p className="as-intro">
        On scale-in, which instance dies? The default policy runs this funnel. (Scenario: AZ-A=3, AZ-B=2, AZ-C=1.)
      </p>

      <div className="as-term-azs">
        <div className="as-term-az big">AZ-A<div className="as-term-insts">🖥️ A1 · 🖥️ A2 · 🖥️ A3</div></div>
        <div className="as-term-az">AZ-B<div className="as-term-insts">🖥️ B1 · 🖥️ B2</div></div>
        <div className="as-term-az">AZ-C<div className="as-term-insts">🖥️ C1</div></div>
      </div>

      <div className="as-term-steps">
        {steps.map((s, i) => (
          <button key={i} className={`as-term-step ${step === i ? "active" : i < step ? "done" : ""}`} onClick={() => setStep(i)}>{i + 1}</button>
        ))}
      </div>

      <div className="as-term-detail">
        <div className="as-term-title">{steps[step].title}</div>
        <div className="as-term-desc">{steps[step].desc}</div>
        <div className="as-term-remain">Candidates: <strong>{steps[step].remain}</strong></div>
      </div>

      <div className="as-note">
        💡 Other built-in policies: <strong>OldestInstance</strong>, <strong>NewestInstance</strong>,
        <strong> OldestLaunchTemplate</strong>, <strong>ClosestToNextInstanceHour</strong>, <strong>AllocationStrategy</strong>.
        For full control (graceful shutdown, backups, tag-based choice) use a <strong>Custom policy</strong> backed by a
        <strong> Lambda function</strong>.
      </div>
    </div>
  );
}

/* ─── 8. THE 3 TIMERS ──────────────────────────────────────────────── */
export function ScalingTimers() {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0); // minutes 0..20

  useEffect(() => {
    if (!playing) return;
    if (t >= 16) { setPlaying(false); return; }
    const id = setTimeout(() => setT((x) => x + 1), 400);
    return () => clearTimeout(id);
  }, [playing, t]);

  const events = [
    { at: 0, label: "12:00 — Scale-out triggers, new instance launches" },
    { at: 3, label: "12:03 — Health-check grace period ends (3 min) → health checks begin" },
    { at: 5, label: "12:05 — Warm-up ends (5 min) → instance metrics now count" },
    { at: 15, label: "12:15 — Cooldown ends (10 min after) → next scaling allowed" },
  ];

  return (
    <div className="sv-card as-card">
      <div className="sv-title as-title">⏱️ The 3 Auto Scaling Timers</div>
      <p className="as-intro">
        Three timers govern scaling. Example: warm-up 5 min, cooldown 10 min, health-check grace 3 min — a scale-out fires
        at <strong>12:00</strong>.
      </p>

      <div className="as-timer-cards">
        {[
          ["🔥 Warm-up", "New instance's metrics are ignored until it's ready — prevents premature scaling. (Dynamic step & target-tracking only.)"],
          ["❄️ Cooldown", "Mandatory wait after a scaling action before the next one — lets the group stabilise (default 300s)."],
          ["🩺 Health-check grace", "Delay before health checks start on a new instance — gives apps time to boot (default 300s)."],
        ].map(([t2, d]) => (
          <div key={t2} className="as-timer-card"><div className="as-timer-card-t">{t2}</div><div className="as-timer-card-d">{d}</div></div>
        ))}
      </div>

      <div className="as-timeline">
        <div className="as-timeline-track">
          <div className="as-timeline-fill" style={{ width: `${(t / 16) * 100}%` }} />
          {events.map((e, i) => (
            <div key={i} className={`as-timeline-mark ${t >= e.at ? "reached" : ""}`} style={{ left: `${(e.at / 16) * 100}%` }} />
          ))}
        </div>
        <div className="as-timeline-clock">⏱ 12:{String(t).padStart(2, "0")}</div>
      </div>

      <div className="as-timeline-events">
        {events.filter((e) => t >= e.at).map((e, i) => (
          <div key={i} className="as-timeline-event">{e.label}</div>
        ))}
      </div>

      <button className="as-btn primary" onClick={() => { setT(0); setPlaying(true); }}>▶ Run the clock</button>
    </div>
  );
}
