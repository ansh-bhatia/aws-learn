import React, { useState } from "react";
import "./ECSVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. MONOLITH vs MICROSERVICES + scaling example
   ════════════════════════════════════════════════════════════ */
export function MonolithVsMicroservices() {
  const [view, setView] = useState("micro");
  return (
    <div className="sv-card">
      <div className="sv-title ecsm-title">🧩 Monolithic vs Microservices</div>
      <p className="ecsm-intro">
        <b>Monolithic (tightly coupled)</b> = one codebase, one deployment, one database — outdated. <b>Microservices
        (loosely coupled)</b> = independent services, each its own code/deploy/DB — used by Netflix, Amazon, Uber. Toggle:
      </p>
      <div className="ecsm-toggle">
        <button className={view === "mono" ? "active" : ""} onClick={() => setView("mono")}>🏢 Monolithic</button>
        <button className={view === "micro" ? "active" : ""} onClick={() => setView("micro")}>🧩 Microservices</button>
      </div>
      {view === "mono" ? (
        <div className="ecsm-mono">
          <div className="ecsm-mono-box">
            <div className="ecsm-mono-h">Single Application (one deploy)</div>
            <div className="ecsm-mono-parts"><span>🏠 Home</span><span>🛒 Cart</span><span>💳 Payment</span></div>
            <div className="ecsm-mono-db">🗄️ One shared database</div>
          </div>
          <p className="ecsm-note warn">⚠️ Can't scale parts independently · one bug can crash everything · single tech stack · hosted on <b>VMs</b>.</p>
        </div>
      ) : (
        <>
          <div className="ecsm-micro-grid">
            {[["🏠 Home", "100,000", "#1f6feb"], ["🛒 Cart", "10,000", "#a371f7"], ["💳 Payment", "4,000", "#3fb950"]].map((m, i) => (
              <div key={i} className="ecsm-micro-card" style={{ borderTopColor: m[2] }}>
                <div className="ecsm-micro-name">{m[0]}</div>
                <div className="ecsm-micro-db">🗄️ own DB</div>
                <div className="ecsm-micro-scale" style={{ color: m[2] }}>scale for<br /><b>{m[1]}</b></div>
              </div>
            ))}
          </div>
          <p className="ecsm-note ok">✅ <b>Independent scaling</b> (the killer feature): during a sale, scale Home for 100K visitors, Cart for only the ~10% who add items, Payment for the ~4% who buy. Each service scales to its own demand · own DB · own language · isolated failures · hosted in <b>containers</b> (ECS/EKS/Kubernetes).</p>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. WHY ECS — 6 reasons over Kubernetes
   ════════════════════════════════════════════════════════════ */
const ECS_WHY = [
  { ic: "🛠️", t: "Fully managed", d: "No control plane / servers to set up — just create a cluster." },
  { ic: "🔗", t: "Deep AWS integration", d: "Native with ALB, IAM, CloudWatch, ECR, CodePipeline." },
  { ic: "🧠", t: "Intelligent scheduling", d: "ECS places containers across hosts automatically." },
  { ic: "💰", t: "Cost efficient", d: "Choose EC2 or Fargate; pay only for what you use." },
  { ic: "🔒", t: "Secure", d: "Built on IAM + AWS security services." },
  { ic: "📈", t: "Scalable", d: "Scale from hundreds to millions of requests." },
];
export function ECSBasics() {
  return (
    <div className="sv-card">
      <div className="sv-title ecsm-title">☁️ What is Amazon ECS? Why over Kubernetes?</div>
      <p className="ecsm-intro">
        <b>Amazon ECS</b> = a <b>fully managed container orchestration</b> service to deploy, manage &amp; scale Docker
        containers on AWS. Six reasons to pick it over self-managed Kubernetes:
      </p>
      <div className="ecsm-why-grid">
        {ECS_WHY.map((w, i) => (
          <div key={i} className="ecsm-why-card">
            <div className="ecsm-why-ic">{w.ic}</div>
            <div className="ecsm-why-t">{w.t}</div>
            <div className="ecsm-why-d">{w.d}</div>
          </div>
        ))}
      </div>
      <p className="ecsm-note">🎯 Use cases: microservices, batch processing, CI/CD pipelines, and monolith → container migration.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. ECS CLUSTER — hosts as a team
   ════════════════════════════════════════════════════════════ */
export function ECSCluster() {
  const [clustered, setClustered] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title ecsm-title">🗂️ ECS Cluster</div>
      <p className="ecsm-intro">
        A <b>cluster</b> is a group of Docker hosts acting as one unified environment. ECS schedules containers across them
        and pools their resources. The cluster is the <b>first thing you create</b>. Toggle coordination:
      </p>
      <div className="ecsm-toggle">
        <button className={!clustered ? "active" : ""} onClick={() => setClustered(false)}>🔌 Separate hosts</button>
        <button className={clustered ? "active" : ""} onClick={() => setClustered(true)}>🤝 ECS Cluster</button>
      </div>
      <div className="ecsm-cluster-stage">
        {clustered && <div className="ecsm-cluster-ring">ECS — schedules tasks · pools 12 vCPU</div>}
        <div className="ecsm-cluster-hosts">
          {[1, 2, 3].map((h) => (
            <div key={h} className={"ecsm-cluster-host" + (clustered ? " linked" : "")}>
              <div className="ecsm-ch-label">🐳 Host {h}</div>
              <div className="ecsm-ch-cts"><span>📦</span><span>📦</span></div>
              <div className="ecsm-ch-cpu">4 vCPU</div>
            </div>
          ))}
        </div>
      </div>
      <p className={"ecsm-note " + (clustered ? "ok" : "warn")}>
        {clustered
          ? "✅ Members of one cluster act as a team — ECS coordinates scheduling, failover & resource pooling across all hosts."
          : "⚠️ Standalone hosts don't coordinate — no shared scheduling or failover. You need a cluster + orchestrator."}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. EC2 vs FARGATE
   ════════════════════════════════════════════════════════════ */
const LAUNCH_ROWS = [
  ["Provisioning", "You launch & manage EC2 instances", "AWS provisions automatically (serverless)"],
  ["Control", "Full — OS, instance type, AMI, storage", "None — no OS/compute access"],
  ["Billing", "Per EC2 uptime (on-demand/spot/savings)", "Per vCPU + memory per second per task"],
  ["Launch time", "Slower (builds instances)", "Quick (on-demand infra)"],
  ["Scaling", "Scale EC2 first, then tasks", "Scale tasks directly (AWS handles it)"],
  ["Maintenance", "You patch & manage", "Fully managed by AWS"],
  ["Isolation", "Multiple tasks share an instance", "Each task isolated with its own ENI"],
  ["Best for", "OS-level access, GPU, long-running", "Serverless microservices, batch, fast scale"],
];
export function EC2vsFargate() {
  return (
    <div className="sv-card">
      <div className="sv-title ecsm-title">⚖️ Launch Types: EC2 vs Fargate</div>
      <p className="ecsm-intro">When you create a cluster you pick the compute: self-managed <b>EC2</b> or serverless <b>Fargate</b>.</p>
      <div className="ecsm-vs-table">
        <div className="ecsm-vs-row head"><span className="feat">Aspect</span><span className="ec2">🖥️ EC2</span><span className="far">🚀 Fargate</span></div>
        {LAUNCH_ROWS.map((r, i) => (
          <div key={i} className="ecsm-vs-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="ecsm-note">🌐 VPC/subnet/security-group selection: chosen at <b>cluster creation</b> for EC2, but at <b>task/service creation</b> for Fargate.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. CLUSTER INFRA SETUP — Fargate auto + EC2 options
   ════════════════════════════════════════════════════════════ */
export function ClusterInfraSetup() {
  const [tab, setTab] = useState("fargate");
  return (
    <div className="sv-card">
      <div className="sv-title ecsm-title">🏗️ Cluster Setup: Fargate, Spot & Adding EC2</div>
      <p className="ecsm-intro">
        Creating a cluster from the <b>console</b> always adds <b>Fargate + Fargate Spot</b> automatically (even if you
        deselect them) — no charge until you run tasks. EC2 can be added 3 ways. Click:
      </p>
      <div className="ecsm-tabs">
        {[["fargate", "Fargate + Spot"], ["during", "EC2 during setup"], ["after", "EC2 after (manual)"], ["asg", "EC2 via ASG"]].map(([id, l]) => (
          <button key={id} className={"ecsm-tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>
      <div className="ecsm-detail">
        {tab === "fargate" && <p><b>Fargate + Fargate Spot</b> — always auto-included from the console (CLI can avoid this). <b>Fargate Spot</b> = ~70% cheaper using spare capacity, can be interrupted → great for batch/dev/fault-tolerant jobs. Every console cluster is ready for <b>hybrid</b> (Fargate + Spot + EC2); you pick the launch type per task/service.</p>}
        {tab === "during" && <p><b>Add EC2 during cluster creation</b> (recommended if you know you'll use EC2) — AWS auto-creates an <b>Auto Scaling Group</b> + launch template with <b>ECS-optimized AMIs</b> (agent + runtime pre-installed). You set VPC/subnet, instance type, key pair, SG, and min/max/desired count.</p>}
        {tab === "after" && <p><b>Add a single EC2 instance manually</b> — launch an <b>ECS-optimized AMI</b>, attach the <b>ecsInstanceRole</b> IAM role, SSH in and set <code>ECS_CLUSTER=clusterName</code> in <code>/etc/ecs/ecs.config</code>, restart the ecs service → it registers as a container instance. <b>Downside:</b> single point of failure.</p>}
        {tab === "asg" && <p><b>Create your own ASG &amp; register it</b> — make a launch template (ECS-optimized AMI + ecsInstanceRole + user-data setting <code>ECS_CLUSTER</code>), create the ASG, then <b>register it as a Capacity Provider</b> and update the cluster. Now <b>ECS manages scaling</b>, draining &amp; placement (vs managing the ASG yourself).</p>}
      </div>
      <p className="ecsm-note">🔑 <b>ECS-optimized AMI</b> = ECS agent + container runtime already installed, so the instance joins the cluster easily. The <b>ecsInstanceRole</b> grants the instance permission to register with ECS.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. ECS ANYWHERE
   ════════════════════════════════════════════════════════════ */
const ANYWHERE_STEPS = [
  { t: "Outbound internet", d: "The external machine needs outbound internet (behind NAT is fine) so ECS can communicate. No public IP required." },
  { t: "Install container runtime", d: "Install Docker or containerd on the on-prem/other-cloud machine." },
  { t: "Install SSM agent", d: "Register the VM with AWS Systems Manager (hybrid activation) → it assumes an IAM role and appears in Fleet Manager." },
  { t: "Install ECS agent", d: "The ECS agent lets the VM join the cluster, receive task definitions and run containers — like a normal ECS instance." },
];
export function ECSAnywhere() {
  const [step, setStep] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title ecsm-title">🌍 ECS Anywhere</div>
      <p className="ecsm-intro">
        <b>ECS Anywhere</b> lets you run ECS tasks on <b>external machines</b> — on-prem physical/virtual servers or VMs in
        other clouds — managed from ECS. Added <b>after</b> cluster creation. Four setup steps:
      </p>
      <div className="ecsm-step-track">
        {ANYWHERE_STEPS.map((s, i) => (
          <button key={i} className={"ecsm-step-node" + (step >= i ? " on" : "")} onClick={() => setStep(i)}>{i + 1}</button>
        ))}
      </div>
      <div className="ecsm-detail">
        <b>{ANYWHERE_STEPS[step].t}</b>
        <p>{ANYWHERE_STEPS[step].d}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. ECS ENCRYPTION & STORAGE
   ════════════════════════════════════════════════════════════ */
export function ECSStorage() {
  const [t, setT] = useState("ephemeral");
  return (
    <div className="sv-card">
      <div className="sv-title ecsm-title">🔐 Storage &amp; Encryption</div>
      <p className="ecsm-intro">
        Cluster-level encryption (KMS) must be enabled <b>at creation</b> — it can't be turned on later. Two storage types:
      </p>
      <div className="ecsm-toggle">
        <button className={t === "ephemeral" ? "active" : ""} onClick={() => setT("ephemeral")}>⏳ Fargate Ephemeral</button>
        <button className={t === "managed" ? "active" : ""} onClick={() => setT("managed")}>💾 Managed (EFS/EBS)</button>
      </div>
      {t === "ephemeral" ? (
        <div className="ecsm-detail">
          <b>Fargate Ephemeral Storage</b>
          <p>Temporary disk that exists <b>only while the task runs</b> — Fargate only. Default <b>20 GB</b> (up to 200 GB, extra charged). Auto-encrypted when cluster encryption is on. Data <b>vanishes</b> when the task stops → use for temp files, cache, short-lived logs.</p>
        </div>
      ) : (
        <div className="ecsm-detail">
          <b>Managed Storage (EFS / EBS)</b>
          <p><b>Persistent</b> storage that survives task lifetime — supported by <b>both Fargate &amp; EC2</b>. <b>EFS</b> is encrypted by default; <b>EBS</b> follows its own encryption setting. Use for databases, user uploads, config files → <b>permanent</b> data.</p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. TASK vs SERVICE + definition flow
   ════════════════════════════════════════════════════════════ */
const TS_ROWS = [
  ["Restart behavior", "Runs once, then stops (no auto-restart)", "Auto-restarts failed tasks"],
  ["Use case", "One-time / temporary job", "Long-running production app"],
  ["Containers", "One or few", "One or many (load-balanced)"],
  ["Auto-scaling", "❌ Not supported", "✅ Supported"],
  ["Load balancer", "❌ Not supported", "✅ Supported"],
  ["Example", "Testing an app, batch/report job", "Web server, API, backend 24×7"],
];
export function TaskVsService() {
  return (
    <div className="sv-card">
      <div className="sv-title ecsm-title">📋 Task vs Service</div>
      <p className="ecsm-intro">
        A <b>task</b> is a running unit (one or more containers) with its own <b>ENI, IAM role &amp; security group</b> —
        things a bare Docker container can't have. A <b>service</b> keeps tasks running 24×7 with HA, scaling &amp; a load balancer.
      </p>
      <div className="ecsm-vs-table">
        <div className="ecsm-vs-row head"><span className="feat">Aspect</span><span className="ec2">⚡ Task</span><span className="far">🔄 Service</span></div>
        {TS_ROWS.map((r, i) => (
          <div key={i} className="ecsm-vs-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <div className="ecsm-flow">
        <div className="ecsm-flow-node">🗂️ Cluster</div>
        <span>+</span>
        <div className="ecsm-flow-node">🐳 Docker Image</div>
        <span>→</span>
        <div className="ecsm-flow-node">📄 Task Definition</div>
        <span>→</span>
        <div className="ecsm-flow-node hl">⚡ Task / 🔄 Service</div>
      </div>
      <p className="ecsm-note">📄 Both need a <b>task definition</b> (a blueprint: which image(s), CPU/memory, ports, IAM role, networking). A task is great for temporary jobs; a service for anything that must stay alive.</p>
    </div>
  );
}
