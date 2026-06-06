import React, { useState } from "react";
import "./ECSPrereqVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. LEO'S STORY — the single-EC2 crash problem
   ════════════════════════════════════════════════════════════ */
const STORY = [
  { t: "1 · One EC2, three apps", d: "Leo (startup founder) hosts his LMS, Support, and a new Enrollment app on ONE EC2 instance to save money.", state: "ok" },
  { t: "2 · Marketing spike", d: "The Enrollment app goes viral and devours the instance's CPU & memory — there's no resource boundary.", state: "warn" },
  { t: "3 · Everything crashes", d: "The shared instance falls over. LMS, Support AND Enrollment all go down together — a single point of failure.", state: "bad" },
  { t: "4 · Ray's fix: isolate", d: "Mentor Ray says: never run everything on one box. Isolate apps so one can't take down the others.", state: "ok" },
];
export function LeoStory() {
  const [step, setStep] = useState(0);
  const s = STORY[step];
  return (
    <div className="sv-card">
      <div className="sv-title ecs-title">📖 The Story: Leo &amp; Ray</div>
      <p className="ecs-intro">
        We learn ECS through a story. <b>Leo</b> = the builder (asks the questions you're thinking). <b>Ray</b> = the
        architect (teaches best practices). It starts with a classic mistake — step through it:
      </p>
      <div className="ecs-story-stage">
        <div className="ecs-story-server">
          <div className="ecs-story-srvlabel">🖥️ One EC2 Instance</div>
          <div className={"ecs-story-apps " + s.state}>
            <div className="ecs-story-app">📚 LMS</div>
            <div className="ecs-story-app">🎧 Support</div>
            <div className={"ecs-story-app" + (step >= 1 ? " hot" : "")}>📣 Enrollment{step >= 1 ? " 🔥" : ""}</div>
          </div>
          <div className={"ecs-story-flag " + s.state}>
            {s.state === "ok" && step === 0 ? "running…" : s.state === "warn" ? "⚠️ resource starvation" : s.state === "bad" ? "💥 ALL DOWN" : "✅ isolate them"}
          </div>
        </div>
      </div>
      <div className="ecs-detail">
        <b>{s.t}</b>
        <p>{s.d}</p>
      </div>
      <div className="ecs-controls">
        <button className="ecs-btn" disabled={step === 0} onClick={() => setStep(step - 1)}>◀ Prev</button>
        <button className="ecs-btn primary" disabled={step === STORY.length - 1} onClick={() => setStep(step + 1)}>Next ▶</button>
      </div>
      <p className="ecs-note">🏢 Real companies isolate workloads (separate DB / app / mail servers) for exactly this reason. The journey: physical machines → virtual machines → <b>containers</b> → <b>ECS</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. OS ARCHITECTURE — kernel / app layer / hardware
   ════════════════════════════════════════════════════════════ */
export function OSArchitecture() {
  const [hl, setHl] = useState("app");
  const layers = {
    app: { label: "📱 Application", d: "Your apps (Java, Node.js, MySQL...) run here. They can't touch hardware directly." },
    applayer: { label: "🧩 Application Layer", d: "OS-provided libraries, APIs & services. Apps make 'system calls' here, which are forwarded to the kernel — so developers don't deal with raw hardware." },
    kernel: { label: "⚙️ Kernel", d: "The core of the OS. The ONLY part that talks directly to hardware (reads files, allocates memory, sends data)." },
    hw: { label: "🔌 Hardware", d: "The four physical parts: CPU, RAM, Disk, Network." },
  };
  return (
    <div className="sv-card">
      <div className="sv-title ecs-title">🏗️ How an OS Works (Foundation)</div>
      <p className="ecs-intro">
        To understand containers you must first understand the OS. Every OS (Windows/Linux/Mac) has two key parts — the
        <b> kernel</b> and the <b>application layer</b>. Click each layer:
      </p>
      <div className="ecs-os-stack">
        {["app", "applayer", "kernel", "hw"].map((k) => (
          <div key={k} className={"ecs-os-layer " + k + (hl === k ? " active" : "")} onClick={() => setHl(k)}>
            {layers[k].label}
          </div>
        ))}
      </div>
      <div className="ecs-detail">
        <b>{layers[hl].label}</b>
        <p>{layers[hl].d}</p>
      </div>
      <p className="ecs-note">🔑 Flow: <b>Application → Application Layer → Kernel → Hardware</b>. The kernel is the gatekeeper to the hardware.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. VM vs CONTAINER 3D stacks
   ════════════════════════════════════════════════════════════ */
export function VMvsContainer3D() {
  const [view, setView] = useState("container");
  return (
    <div className="sv-card">
      <div className="sv-title ecs-title">🧊 VM vs Container (3D Architecture)</div>
      <p className="ecs-intro">
        Both isolate apps on shared hardware — but at different levels. A <b>VM</b> packs a <b>full OS (kernel + app layer)</b>
        per app (heavy). A <b>container</b> ships only the <b>app layer</b> and <b>shares the host kernel</b> (light). Toggle:
      </p>
      <div className="ecs-toggle">
        <button className={view === "vm" ? "active" : ""} onClick={() => setView("vm")}>🖥️ Virtual Machines</button>
        <button className={view === "container" ? "active" : ""} onClick={() => setView("container")}>📦 Containers</button>
      </div>
      <div className="ecs-3d-stage">
        <div className="ecs-3d-tower">
          {view === "vm" ? (
            <>
              <div className="ecs-3d-row">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="ecs-3d-vm">
                    <div className="ecs-3d-app">App {i}</div>
                    <div className="ecs-3d-layer al">App Layer</div>
                    <div className="ecs-3d-layer kn">Kernel</div>
                  </div>
                ))}
              </div>
              <div className="ecs-3d-base hv">🧠 Hypervisor (ESXi / Hyper-V / Nitro)</div>
              <div className="ecs-3d-base hw">🔌 Physical Hardware (CPU · RAM · Disk · Net)</div>
              <div className="ecs-3d-tag heavy">⚠️ Hardware virtualization — each VM has a FULL OS → heavy, slow boot (1–2 min), bulky images (GBs)</div>
            </>
          ) : (
            <>
              <div className="ecs-3d-row">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="ecs-3d-ct">
                    <div className="ecs-3d-app">App {i}</div>
                    <div className="ecs-3d-layer al">App Layer</div>
                  </div>
                ))}
              </div>
              <div className="ecs-3d-base dk">🐳 Docker Engine</div>
              <div className="ecs-3d-base kn shared">⚙️ Shared Host Kernel ← all containers use this</div>
              <div className="ecs-3d-base os">🐧 Host OS</div>
              <div className="ecs-3d-base hw">🔌 Physical Hardware</div>
              <div className="ecs-3d-tag light">✅ OS-level virtualization — share the kernel → lightweight, start in ~1 sec, tiny images (MBs), portable</div>
            </>
          )}
        </div>
      </div>
      <p className="ecs-note">🎛️ Both still isolate resources: a container's app layer gets soft/hard limits (e.g. 8 GB cap) so one can't starve the others.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. VM LIMITATIONS
   ════════════════════════════════════════════════════════════ */
const VM_LIMITS = [
  { ic: "🏋️", t: "Heavy resource use", d: "Each VM runs a full OS — even a tiny app pays the OS overhead (memory, CPU, storage)." },
  { ic: "🐢", t: "Slow boot", d: "Booting a full OS takes 1–2 minutes — bad for fast auto-scaling." },
  { ic: "📦", t: "Poor portability", d: "Images are bulky (Linux ~4–5 GB, Windows ~20 GB) — hard to move around." },
  { ic: "🔧", t: "Complex management", d: "A full OS means constant patching, updates & security maintenance." },
  { ic: "📉", t: "Limited density", d: "OS overhead means you can't pack many VMs onto one host." },
];
export function VMLimitations() {
  return (
    <div className="sv-card">
      <div className="sv-title ecs-title">⚠️ Why Containers? — VM Limitations</div>
      <p className="ecs-intro">
        Virtualization was a revolution (2000–2013): run many OSes on one server → huge cost savings, the basis of cloud.
        But VMs carry the <b>full-OS</b> baggage. These pain points (post-2007) led to containers (2013):
      </p>
      <div className="ecs-limit-grid">
        {VM_LIMITS.map((l, i) => (
          <div key={i} className="ecs-limit-card">
            <div className="ecs-limit-ic">{l.ic}</div>
            <div className="ecs-limit-t">{l.t}</div>
            <div className="ecs-limit-d">{l.d}</div>
          </div>
        ))}
      </div>
      <p className="ecs-note ok">💡 The common root cause: a <b>full operating system per VM</b>. Containers fix all of these by sharing the host kernel.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. DOCKER LIFECYCLE — image → container
   ════════════════════════════════════════════════════════════ */
const DOCKER_STEPS = [
  { cmd: "yum install docker", t: "Install Docker", d: "Any machine (physical/VM, Linux/Win/Mac) with Docker daemon installed becomes a Docker Host. Easy — no hypervisor needed." },
  { cmd: "docker pull ubuntu", t: "Pull an image", d: "Images come from Docker Hub. A container image is tiny (Ubuntu ~80 MB vs a 5.9 GB ISO) because it has no kernel." },
  { cmd: "docker run -it ubuntu", t: "Run a container", d: "Creates & starts a container in ~1 second (vs minutes for a VM). Use docker ps to list, docker stop/start to control." },
  { cmd: "docker build -t myapp .", t: "Build custom image", d: "A Dockerfile (e.g. FROM nginx + COPY index.html) bakes your app into a reusable image — automated, repeatable setup." },
  { cmd: "docker run -d -p 80:80 myapp", t: "Publish & access", d: "Map host port 80 → container port 80 so the app is reachable from the outside world (e.g. via the EC2 public IP)." },
];
export function DockerLifecycle() {
  const [step, setStep] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title ecs-title">🐳 Docker Lifecycle (Image → Container)</div>
      <p className="ecs-intro">How a Docker host turns an image into a running app. Click through the commands:</p>
      <div className="ecs-dl-track">
        {DOCKER_STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <button className={"ecs-dl-node" + (step >= i ? " on" : "")} onClick={() => setStep(i)}>{i + 1}</button>
            {i < DOCKER_STEPS.length - 1 && <div className={"ecs-dl-line" + (step > i ? " on" : "")} />}
          </React.Fragment>
        ))}
      </div>
      <div className="ecs-dl-cmd">$ {DOCKER_STEPS[step].cmd}</div>
      <div className="ecs-detail">
        <b>{DOCKER_STEPS[step].t}</b>
        <p>{DOCKER_STEPS[step].d}</p>
      </div>
      <p className="ecs-note">🗂️ Custom images push to a registry (<b>Docker Hub</b>, or AWS's <b>ECR</b>) so any host can pull and run them.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. ORCHESTRATION — SPOF → multi-host → captain
   ════════════════════════════════════════════════════════════ */
export function Orchestration() {
  const [stage, setStage] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title ecs-title">🧭 Container Orchestration</div>
      <p className="ecs-intro">
        One Docker host running all your containers = a <b>single point of failure</b>. The fix is multiple hosts — but they
        don't coordinate by default. You need a <b>captain</b>. Step through:
      </p>
      <div className="ecs-toggle">
        <button className={stage === 0 ? "active" : ""} onClick={() => setStage(0)}>1 · Single host (SPOF)</button>
        <button className={stage === 1 ? "active" : ""} onClick={() => setStage(1)}>2 · Many hosts (no teamwork)</button>
        <button className={stage === 2 ? "active" : ""} onClick={() => setStage(2)}>3 · + Orchestrator (captain)</button>
      </div>
      <div className="ecs-orch-stage">
        {stage === 2 && <div className="ecs-orch-captain">🧠 Orchestrator (captain)<small>ECS / Kubernetes / Swarm</small></div>}
        <div className="ecs-orch-hosts">
          {[0, 1, 2].map((h) => (
            <div key={h} className={"ecs-orch-host" + (stage === 0 && h > 0 ? " ghost" : "") + (stage === 0 && h === 0 ? " spof" : "") + (stage === 2 ? " linked" : "")}>
              <div className="ecs-orch-hl">🐳 Host {h + 1}</div>
              <div className="ecs-orch-cts">
                <span>📦</span><span>📦</span><span>📦</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ecs-detail">
        {stage === 0 && <p><b>Single host:</b> if it fails, all containers (and apps) go down together. No high availability.</p>}
        {stage === 1 && <p><b>Multiple hosts:</b> redundancy exists, but the hosts don't know each other — "players with no captain." No coordination.</p>}
        {stage === 2 && <p><b>Orchestrator:</b> the brain/captain — creates a cluster, places containers intelligently, restarts failed ones, and auto-scales on demand. True high availability.</p>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. ORCHESTRATOR COMPARISON
   ════════════════════════════════════════════════════════════ */
const ORCH = {
  swarm: { label: "🐳 Docker Swarm", tag: "School captain", color: "#1f6feb",
    pros: ["Native to Docker — very easy setup", "Great for small teams / learning"],
    cons: ["No auto-scaling, no rollback", "Weak for large-scale production"] },
  ecs: { label: "☁️ Amazon ECS", tag: "Corporate captain", color: "#ff9900",
    pros: ["Fully managed by AWS", "Deep integration (ALB, IAM, etc.)", "No control-plane management"],
    cons: ["AWS-only — not on-prem / other clouds"] },
  k8s: { label: "☸️ Kubernetes", tag: "International captain", color: "#3fb950",
    pros: ["Runs anywhere (cloud / on-prem / hybrid)", "Most powerful — auto-scaling, rollback", "Open-source, widely adopted"],
    cons: ["Complex to set up & manage"] },
};
export function OrchestratorCompare() {
  const [sel, setSel] = useState("ecs");
  const o = ORCH[sel];
  return (
    <div className="sv-card">
      <div className="sv-title ecs-title">⚖️ Docker Swarm vs ECS vs Kubernetes</div>
      <p className="ecs-intro">Three "captains" to choose from. Pick based on your environment &amp; needs:</p>
      <div className="ecs-toggle">
        {Object.entries(ORCH).map(([id, v]) => (
          <button key={id} className={sel === id ? "active" : ""} style={sel === id ? { borderColor: v.color, color: v.color } : {}} onClick={() => setSel(id)}>{v.label}</button>
        ))}
      </div>
      <div className="ecs-oc-card" style={{ borderTopColor: o.color }}>
        <span className="ecs-oc-tag" style={{ background: o.color }}>{o.tag}</span>
        <div className="ecs-oc-cols">
          <div className="ecs-oc-col">
            <div className="ecs-oc-h good">✅ Pros</div>
            {o.pros.map((p, i) => <div key={i} className="ecs-oc-item good">{p}</div>)}
          </div>
          <div className="ecs-oc-col">
            <div className="ecs-oc-h bad">⚠️ Cons</div>
            {o.cons.map((c, i) => <div key={i} className="ecs-oc-item bad">{c}</div>)}
          </div>
        </div>
      </div>
      <p className="ecs-note">🎯 Leo picks <b>ECS</b>: he already runs on AWS (great integration) and his small 3-app startup doesn't need Kubernetes' complexity. <i>(EKS = AWS-managed Kubernetes — covered after ECS.)</i></p>
    </div>
  );
}
