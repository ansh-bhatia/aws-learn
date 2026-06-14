import React, { useState } from "react";
import "./ProjectECSVisuals3.css";

/* ════════════════════════════════════════════════════════════
   1. STEP 6 — TASK DEFINITION PREREQUISITES
   ════════════════════════════════════════════════════════════ */
export function TaskDefPrereqs() {
  return (
    <div className="sv-card">
      <div className="sv-title pj3-title">⑥ Create the Task Definition</div>
      <p className="pj3-intro">Before the task definition, create <b>two resources</b> the app needs — then assemble the definition:</p>
      <div className="pj3-prereq">
        <div className="pj3-prereq-box"><b>1. S3 bucket</b><p>Where uploads land. Note its <b>name</b> + <b>region</b> (you'll pass them as env vars).</p></div>
        <div className="pj3-prereq-box"><b>2. ECS Task Role</b><p>IAM role (trusted by "ECS Task") with <b>S3 access</b> — lets the app write to S3.</p></div>
      </div>
      <div className="pj3-arch-down">⇣ then build the definition ⇣</div>
      <div className="pj3-def">
        {["Fargate · Linux x86_64 · awsvpc", "1 vCPU / 2 GB", "Task role → S3 access", "Execution role → pull from ECR", "Container: image URI + port 80", "Env vars: S3_BUCKET + AWS_REGION"].map((x, i) => (
          <div key={i} className="pj3-def-row">{x}</div>
        ))}
      </div>
      <p className="pj3-note warn">⚠️ Env var <b>keys must match the code exactly</b> (S3_BUCKET, AWS_REGION). In production, scope the task role to one bucket — not full S3 access.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. STEP 7 — CAPACITY PROVIDER STRATEGY (calculator)
   ════════════════════════════════════════════════════════════ */
export function CapacityProviderCalc() {
  const [total, setTotal] = useState(10);
  const [base, setBase] = useState(2);
  const [wF, setWF] = useState(1);
  const [wS, setWS] = useState(3);
  // base goes to Fargate first, remainder split by weight
  const rem = Math.max(0, total - base);
  const wSum = wF + wS || 1;
  const fByWeight = Math.round(rem * (wF / wSum));
  const sByWeight = rem - fByWeight;
  const fargate = base + fByWeight;
  const spot = sByWeight;
  return (
    <div className="sv-card">
      <div className="sv-title pj3-title">⑦ Capacity Provider Strategy (Calculator)</div>
      <p className="pj3-intro">
        Run a task with <b>Run new task</b>. The capacity provider strategy decides how tasks split between <b>Fargate</b> and <b>Fargate Spot</b> using <b>base</b> (minimum guaranteed) + <b>weight</b> (ratio for the rest). Try it:
      </p>
      <div className="pj3-calc">
        <label>Desired tasks: <b>{total}</b><input type="range" min="1" max="20" value={total} onChange={e => setTotal(+e.target.value)} /></label>
        <label>Fargate base: <b>{base}</b><input type="range" min="0" max={total} value={base} onChange={e => setBase(+e.target.value)} /></label>
        <label>Fargate weight: <b>{wF}</b><input type="range" min="0" max="5" value={wF} onChange={e => setWF(+e.target.value)} /></label>
        <label>Spot weight: <b>{wS}</b><input type="range" min="0" max="5" value={wS} onChange={e => setWS(+e.target.value)} /></label>
      </div>
      <div className="pj3-calc-out">
        <div className="pj3-calc-box hot"><b>{fargate}</b><small>Fargate</small></div>
        <div className="pj3-calc-box"><b>{spot}</b><small>Fargate Spot</small></div>
      </div>
      <p className="pj3-note">Logic: <b>base</b> tasks go to Fargate first ({base}), then the remaining {rem} split by weight {wF}:{wS}. Spot is cheaper but can be reclaimed anytime. For our test we just run <b>1 plain Fargate task</b>, grab its public IP, and open it (strip the <code>https://</code> — it's HTTP).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. STEP 8.1 — TASK vs SERVICE
   ════════════════════════════════════════════════════════════ */
export function ECSTaskVsServiceCtl() {
  const [svc, setSvc] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title pj3-title">⑧ Task vs Service</div>
      <p className="pj3-intro">A <b>task</b> runs once and ECS forgets it. A <b>service</b> is a <b>controller</b> that keeps tasks running. Toggle:</p>
      <div className="pj3-toggle">
        <button className={!svc ? "active" : ""} onClick={() => setSvc(false)}>📋 Task</button>
        <button className={svc ? "active" : ""} onClick={() => setSvc(true)}>🎛️ Service ✅</button>
      </div>
      <div className="pj3-detail">
        {svc
          ? <p><b>Service (production):</b> auto-restarts failed tasks, keeps a <b>desired count</b> (high availability), supports <b>load balancer</b> integration and <b>auto scaling</b>. Best for long-running apps &amp; microservices.</p>
          : <p><b>Task (testing):</b> "run it once and forget." If it crashes, ECS won't restart it. No load balancer, no auto scaling. Good for quick functional tests.</p>}
      </div>
      <p className="pj3-note ok">Rule of thumb: <b>test → task</b>, <b>production → service</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. STEP 8.2 — AZ REBALANCING + GRACE PERIOD
   ════════════════════════════════════════════════════════════ */
export function DeploymentConfigOptions() {
  const [azDown, setAzDown] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title pj3-title">⚙️ Deployment Config: AZ Rebalancing</div>
      <p className="pj3-intro">
        With <b>4 tasks</b> across 2 AZs, ECS keeps them balanced (2+2). Tap to fail an AZ and bring it back:
      </p>
      <div className="pj3-az">
        <div className="pj3-az-zone"><b>AZ-a ✅</b><div className="pj3-az-tasks">{Array.from({ length: azDown ? 4 : 2 }).map((_, i) => <span key={i}>📦</span>)}</div></div>
        <div className={`pj3-az-zone ${azDown ? "dead" : ""}`}><b>AZ-b {azDown ? "💥" : "✅"}</b><div className="pj3-az-tasks">{Array.from({ length: azDown ? 0 : 2 }).map((_, i) => <span key={i}>📦</span>)}</div></div>
      </div>
      <button className="pj3-btn" onClick={() => setAzDown(!azDown)}>{azDown ? "♻️ Recover AZ-b" : "💥 Fail AZ-b"}</button>
      <div className="pj3-detail">
        {azDown
          ? <p>AZ-b is down → ECS runs all 4 tasks in AZ-a to keep the desired count. With <b>AZ rebalancing ON</b>, once AZ-b recovers it moves back to 2+2 automatically.</p>
          : <p>Balanced 2+2. <b>Health checks</b> probe each task; a failed one is replaced. <b>Health-check grace period</b> (e.g. 60s) tells ECS to wait while a new task boots before judging it.</p>}
      </div>
      <p className="pj3-note">Other options: <b>Replica</b> (keep N tasks) vs <b>Daemon</b> (one task per EC2 host — EC2 only).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. STEP 8.3 — ROLLING vs BLUE/GREEN
   ════════════════════════════════════════════════════════════ */
export function RollingVsBlueGreen() {
  const [mode, setMode] = useState("rolling");
  return (
    <div className="sv-card">
      <div className="sv-title pj3-title">🚦 Deployment: Rolling vs Blue/Green</div>
      <p className="pj3-intro">How ECS replaces v1 with v2 when you update. Tap each:</p>
      <div className="pj3-toggle">
        <button className={mode === "rolling" ? "active" : ""} onClick={() => setMode("rolling")}>Rolling Update</button>
        <button className={mode === "bluegreen" ? "active" : ""} onClick={() => setMode("bluegreen")}>Blue/Green</button>
      </div>
      {mode === "rolling" ? (
        <>
          <div className="pj3-detail">
            <b>Rolling Update (default)</b>
            <p>Replaces tasks <b>one batch at a time</b> in the same environment. Controlled by <b>min running %</b> (e.g. 100% = never drop capacity) and <b>max running %</b> (e.g. 200% = may temporarily double). New tasks start → become healthy → old ones stop. Simple; load balancer <b>optional</b>.</p>
          </div>
          <div className="pj3-rolling">
            <span className="old">v1</span><span className="old">v1</span><span className="new">v2</span><span className="new">v2</span>
            <small>old draining → new ramping (zero downtime at 100/200%)</small>
          </div>
        </>
      ) : (
        <>
          <div className="pj3-detail">
            <b>Blue/Green</b>
            <p>Spins up a <b>whole new (green) environment</b> alongside the live (blue) one. Both run during a <b>bake time</b> (0–1440 min) so you can test green. Then traffic switches blue→green. Easy <b>rollback</b> before the switch. Needs <b>CodeDeploy + a load balancer</b> (mandatory).</p>
          </div>
          <div className="pj3-bg">
            <div className="pj3-bg-env blue"><b>🔵 Blue v1</b><small>live</small></div>
            <div className="pj3-bg-lb">⚖️ ALB →<small>switches after bake time</small></div>
            <div className="pj3-bg-env green"><b>🟢 Green v2</b><small>testing</small></div>
          </div>
        </>
      )}
      <p className="pj3-note ok">Production favourite: <b>Blue/Green</b> (zero downtime + safe rollback). Rolling is great for dev/test.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. DEPLOYMENT FAILURE DETECTION
   ════════════════════════════════════════════════════════════ */
export function FailureDetection() {
  const [cb, setCb] = useState(true);
  const [rb, setRb] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title pj3-title">🛡️ Deployment Failure Detection</div>
      <p className="pj3-intro">What if the new tasks never become healthy? Configure how ECS reacts:</p>
      <div className="pj3-checks">
        <label className={cb ? "on" : ""} onClick={() => setCb(!cb)}><b>Circuit breaker</b> — {cb ? "ON: detects a failing deployment" : "OFF: deployment can hang forever; you fix it manually"}</label>
        <label className={`${!cb ? "disabled" : ""} ${rb ? "on" : ""}`} onClick={() => cb && setRb(!rb)}><b>Roll back on failure</b> — {rb && cb ? "ON: auto-revert to the last working version" : "OFF: stops, but you must roll back yourself"}</label>
      </div>
      <div className={`pj3-verdict ${cb && rb ? "ok" : cb ? "warn" : "bad"}`}>
        {cb && rb ? "✅ Detects failure AND auto-rolls back — best practice" : cb ? "⚠️ Detects failure, but you roll back manually" : "🛑 No detection — a bad deploy can get stuck"}
      </div>
      <p className="pj3-note">Beyond container health, a <b>CloudWatch alarm</b> can fail a deploy on business metrics (e.g. order-failure rate, latency, CPU &gt; 90%) — when the app is "healthy" but behaving badly. (CloudWatch covered later.)</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. SERVICE NETWORKING + ALB
   ════════════════════════════════════════════════════════════ */
export function ServiceNetworkingALB() {
  return (
    <div className="sv-card">
      <div className="sv-title pj3-title">🌐 Networking: Private Tasks + Public ALB</div>
      <p className="pj3-intro">
        Best practice: put <b>tasks in private subnets</b> (no public IP, can't be reached directly) and a <b>public ALB</b> in front. Users hit the ALB; it forwards to the tasks.
      </p>
      <div className="pj3-net">
        <div className="pj3-net-box">👤 User</div>
        <div className="pj3-net-arrow">→</div>
        <div className="pj3-net-box pub">⚖️ ALB<small>public subnet</small></div>
        <div className="pj3-net-arrow">→</div>
        <div className="pj3-net-box priv">📦 Tasks<small>private subnet</small></div>
        <div className="pj3-net-arrow">→</div>
        <div className="pj3-net-box">🪣 S3</div>
      </div>
      <p className="pj3-sub">Use <b>2 AZs</b> (survive an AZ outage), each with a public + private subnet. Security group allows only the app port (80). Tasks need <b>no public IP</b>.</p>
      <p className="pj3-note warn">⚠️ Don't create the ALB from the service wizard — it'd land in the <b>private</b> subnet. Create it first in EC2 (target type <b>IP</b>, internet-facing, public subnets), then attach the existing ALB/listener/target group in the service.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. CLUSTER vs SERVICE AUTO SCALING
   ════════════════════════════════════════════════════════════ */
const SCALE_CMP = [
  { k: "Scales", a: "EC2 instances in the cluster", b: "Tasks in the service" },
  { k: "Applies to", a: "EC2 launch type only", b: "Fargate AND EC2" },
  { k: "Driven by", a: "Capacity provider + ASG (auto)", b: "CloudWatch metrics + policies" },
  { k: "You set", a: "Min/max instances (boundaries)", b: "Min/max tasks + scaling policy" },
];
export function ClusterVsServiceScaling() {
  return (
    <div className="sv-card">
      <div className="sv-title pj3-title">📊 Cluster vs Service Auto Scaling</div>
      <p className="pj3-intro">Two different things scale in ECS — don't mix them up:</p>
      <div className="pj3-cmp">
        <div className="pj3-cmp-head"><span className="feat"> </span><span className="a">Cluster scaling</span><span className="b">Service scaling</span></div>
        {SCALE_CMP.map((r, i) => (
          <div key={i} className="pj3-cmp-row"><span className="feat">{r.k}</span><span>{r.a}</span><span>{r.b}</span></div>
        ))}
      </div>
      <p className="pj3-note">Cluster scaling adds <b>hosts</b> when tasks need room (EC2 only). Service scaling adds <b>tasks</b> when traffic rises (works on Fargate too).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. TARGET TRACKING + COOLDOWNS
   ════════════════════════════════════════════════════════════ */
export function TargetTracking() {
  const [cpu, setCpu] = useState(60);
  const target = 60;
  const state = cpu > target ? "out" : cpu < target ? "in" : "hold";
  return (
    <div className="sv-card">
      <div className="sv-title pj3-title">🎯 Target Tracking Scaling</div>
      <p className="pj3-intro">
        Pick a metric + target (e.g. <b>CPU = 60%</b>); ECS adds/removes tasks to stay near it. Drag the live CPU:
      </p>
      <input className="pj3-slider" type="range" min="10" max="100" value={cpu} onChange={e => setCpu(+e.target.value)} />
      <div className={`pj3-verdict ${state === "out" ? "warn" : state === "in" ? "ok" : ""}`}>
        CPU {cpu}% vs target {target}% → {state === "out" ? "🔼 Scale OUT (add tasks)" : state === "in" ? "🔽 Scale IN (remove tasks)" : "✅ Hold steady"}
      </div>
      <div className="pj3-mini">
        <span><small>SCALE-OUT COOLDOWN</small>Short (e.g. 60s) — add capacity fast while a task boots</span>
        <span><small>SCALE-IN COOLDOWN</small>Long (e.g. 300s) — remove slowly; sudden traffic stays safe</span>
      </div>
      <p className="pj3-note">Metrics: CPU %, memory %, or <b>ALB requests/target</b>. You can even <b>disable scale-in</b> if performance matters more than cost. Cooldowns stop rapid flapping (add/remove/add).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   10. STEP SCALING (scale-out + scale-in steps)
   ════════════════════════════════════════════════════════════ */
function tasksForCpu(cpu) {
  // mirror of the lecture: 2 base, +2 (60-70), +2 (70-80), +4 (>80) → up to 10
  if (cpu >= 80) return 10;
  if (cpu >= 70) return 6;
  if (cpu >= 60) return 4;
  return 2;
}
export function StepScaling() {
  const [cpu, setCpu] = useState(50);
  const tasks = tasksForCpu(cpu);
  return (
    <div className="sv-card">
      <div className="sv-title pj3-title">🪜 Step Scaling Policy</div>
      <p className="pj3-intro">
        Unlike one target, <b>step scaling</b> defines <b>ranges</b>: the bigger the breach, the more tasks you add. Drag CPU and watch the task count step:
      </p>
      <input className="pj3-slider" type="range" min="20" max="100" value={cpu} onChange={e => setCpu(+e.target.value)} />
      <div className="pj3-step-out">CPU <b>{cpu}%</b> → running <b>{tasks}</b> tasks</div>
      <div className="pj3-step-bars">
        {Array.from({ length: 10 }).map((_, i) => <span key={i} className={i < tasks ? "on" : ""} />)}
      </div>
      <div className="pj3-steps">
        <div className={cpu >= 60 && cpu < 70 ? "hl" : ""}>60–70% → +2 (=4)</div>
        <div className={cpu >= 70 && cpu < 80 ? "hl" : ""}>70–80% → +2 (=6)</div>
        <div className={cpu >= 80 ? "hl" : ""}>≥80% → +4 (=10)</div>
      </div>
      <p className="pj3-note warn">⚠️ Scale-out only <b>adds</b>; you need a <b>mirror scale-in</b> policy to remove tasks as CPU drops. In the console you can only attach <b>one</b> policy at service creation — add the second one <b>after</b>. Step scaling needs <b>CloudWatch alarms</b>.</p>
    </div>
  );
}
