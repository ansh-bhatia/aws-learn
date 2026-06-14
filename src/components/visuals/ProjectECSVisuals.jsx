import React, { useState } from "react";
import "./ProjectECSVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. ARCHITECTURE DIAGRAM (interactive)
   ════════════════════════════════════════════════════════════ */
const ARCH_NODES = {
  user: { t: "👤 User (Browser)", d: "Opens the PHP web app and uploads a picture." },
  alb: { t: "⚖️ Application Load Balancer", d: "Public entry point. Spreads traffic across containers for high availability." },
  ecs: { t: "📦 ECS Cluster", d: "Runs the app as containers (tasks/services) on Fargate AND EC2." },
  s3: { t: "🪣 S3 Bucket", d: "Stores the uploaded images in an upload/ folder." },
  ecr: { t: "🗄️ ECR Registry", d: "Private store for the Docker image. ECS pulls the image from here." },
  build: { t: "🛠️ Build Machine (EC2)", d: "A Docker host. Builds the image from code, then pushes it to ECR." },
  github: { t: "🐙 GitHub", d: "Holds the PHP app source code + Dockerfile. Cloned onto the build machine." },
};
export function ProjectArchitecture() {
  const [sel, setSel] = useState("ecs");
  const n = ARCH_NODES[sel];
  const Node = ({ id }) => (
    <div className={`pj-node ${sel === id ? "active" : ""}`} onClick={() => setSel(id)}>{ARCH_NODES[id].t}</div>
  );
  return (
    <div className="sv-card">
      <div className="sv-title pj-title">🏗️ Project Architecture — Scalable PHP App on ECS</div>
      <p className="pj-intro">
        The mission: deploy a PHP web app on <b>Amazon ECS</b> that lets users upload an image, which gets saved to <b>S3</b>. Tap any box to learn its job:
      </p>
      <div className="pj-arch">
        <div className="pj-arch-lane">
          <Node id="github" /><span className="pj-arrow">→</span><Node id="build" /><span className="pj-arrow">→</span><Node id="ecr" />
        </div>
        <div className="pj-arch-down">⇣ ECS pulls the image ⇣</div>
        <div className="pj-arch-lane">
          <Node id="user" /><span className="pj-arrow">→</span><Node id="alb" /><span className="pj-arrow">→</span><Node id="ecs" /><span className="pj-arrow">→</span><Node id="s3" />
        </div>
      </div>
      <div className="pj-detail"><b>{n.t}</b><p>{n.d}</p></div>
      <p className="pj-note">Top row = <b>build pipeline</b> (how the image is made). Bottom row = <b>runtime</b> (what happens when a user visits). Built with AWS best practices: <b>IAM roles</b> (no hardcoded keys) + <b>environment variables</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. 8-STEP ROADMAP
   ════════════════════════════════════════════════════════════ */
const STEPS = [
  { t: "Create ECS Cluster", d: "Hybrid cluster: Fargate + EC2.", done: true },
  { t: "Build Docker Image", d: "On a build machine from the app code.", done: true },
  { t: "Set up ECR", d: "Private registry; push the image.", done: true },
  { t: "Task Definition", d: "Blueprint: image, ports, env vars, role.", done: false },
  { t: "IAM Roles", d: "Let the app talk to S3 safely.", done: false },
  { t: "Run Service + ALB", d: "Run containers behind a load balancer.", done: false },
  { t: "Test Upload → S3", d: "Upload an image, confirm it lands in S3.", done: false },
  { t: "Scale & Clean up", d: "Auto-scale, then tear down to save cost.", done: false },
];
export function ProjectRoadmap() {
  return (
    <div className="sv-card">
      <div className="sv-title pj-title">🗺️ The 8-Step Plan</div>
      <p className="pj-intro">We learn ECS by building, not by theory. Green = covered in this part:</p>
      <div className="pj-road">
        {STEPS.map((s, i) => (
          <div key={i} className={`pj-road-step ${s.done ? "done" : ""}`}>
            <span className="pj-road-num">{s.done ? "✓" : i + 1}</span>
            <div><b>{s.t}</b><p>{s.d}</p></div>
          </div>
        ))}
      </div>
      <p className="pj-note ok">This part covers steps 1–3: the cluster, the Docker image, and ECR. Steps 4–8 come in the next parts.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. STEP 1 — HYBRID CLUSTER
   ════════════════════════════════════════════════════════════ */
export function HybridCluster() {
  const [mode, setMode] = useState("fargate");
  return (
    <div className="sv-card">
      <div className="sv-title pj-title">① Create a Hybrid ECS Cluster</div>
      <p className="pj-intro">
        We add <b>both</b> launch types to one cluster so we can try and compare them later. Tap to see each:
      </p>
      <div className="pj-toggle">
        <button className={mode === "fargate" ? "active" : ""} onClick={() => setMode("fargate")}>☁️ Fargate</button>
        <button className={mode === "ec2" ? "active" : ""} onClick={() => setMode("ec2")}>🖥️ EC2</button>
      </div>
      <div className="pj-detail">
        {mode === "fargate"
          ? <p><b>Fargate (default):</b> serverless — AWS runs your containers, you manage nothing. Just pick it, no setup.</p>
          : <p><b>EC2:</b> your own instances run the containers. We create an <b>Auto Scaling Group</b> (ECS-optimized Amazon Linux 2023, t2.micro, min 1 / max 2), pick a key pair, security group, and default VPC.</p>}
      </div>
      <div className="pj-cost">
        <b>💡 Pro tip — avoid surprise charges</b>
        <p>The cluster itself is free; you pay for running tasks/EC2. Pausing for the day? Set the Auto Scaling Group's <b>desired + min capacity to 0</b> → the EC2 instance terminates. Set it back to <b>1</b> tomorrow to resume.</p>
      </div>
      <p className="pj-note warn">🇮🇳 In Mumbai (ap-south-1), t2.micro free tier is sometimes unavailable in <b>ap-south-1c</b> — deselect that subnet to avoid launch failures.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. STEP 2 — BUILD IMAGE FLOW
   ════════════════════════════════════════════════════════════ */
const BUILD_STEPS = [
  { ic: "🖥️", t: "Launch build machine", d: "A separate EC2 (Amazon Linux 2023) — because ECS runs images but can't build them." },
  { ic: "🐳", t: "Install Docker", d: "We build images with Docker commands, so Docker must be on the machine." },
  { ic: "🐙", t: "Clone the code", d: "git clone the PHP app (index.php, upload.php, Dockerfile) from GitHub." },
  { ic: "🎼", t: "Install PHP + Composer", d: "Composer is PHP's dependency manager — it installs the AWS SDK for PHP so the app can talk to S3." },
  { ic: "🏗️", t: "docker build .", d: "Build the image from the Dockerfile (the . = current folder). Now you have a runnable image." },
];
export function BuildImageFlow() {
  const [step, setStep] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title pj-title">② Build the Docker Image</div>
      <p className="pj-intro">
        <b>Why a separate machine?</b> ECS only <i>runs</i> images — it can't build them. So we use a build machine (a Docker host). Step through it:
      </p>
      <div className="pj-track">
        {BUILD_STEPS.map((_, i) => (
          <React.Fragment key={i}>
            <button className={`pj-dot ${i === step ? "active" : ""} ${i < step ? "past" : ""}`} onClick={() => setStep(i)}>{i + 1}</button>
            {i < BUILD_STEPS.length - 1 && <span className={`pj-line ${i < step ? "on" : ""}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="pj-detail">
        <b>{BUILD_STEPS[step].ic} {BUILD_STEPS[step].t}</b>
        <p>{BUILD_STEPS[step].d}</p>
      </div>
      <p className="pj-note">End result: <code>docker images</code> shows your <code>cloudfox-app</code> image, ready to test and push.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. ENV VARS vs HARDCODE
   ════════════════════════════════════════════════════════════ */
export function EnvVarsBestPractice() {
  const [good, setGood] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title pj-title">🔧 Config: Environment Variables vs Hardcoding</div>
      <p className="pj-intro">The app needs a <b>bucket name</b> and <b>region</b>. Where should they live?</p>
      <div className="pj-toggle">
        <button className={good ? "active" : ""} onClick={() => setGood(true)}>✅ Env variables</button>
        <button className={!good ? "active" : ""} onClick={() => setGood(false)}>⚠️ Hardcoded in code</button>
      </div>
      <div className="pj-code">
        {good
          ? <code>docker run -e S3_BUCKET=cloudfox-lab -e AWS_REGION=ap-south-1 …</code>
          : <code>$bucket = "cloudfox-lab"; // baked into upload.php</code>}
      </div>
      <div className={`pj-verdict ${good ? "ok" : "bad"}`}>
        {good
          ? "Change bucket/region anytime by passing a new value — no rebuild. ECS task definitions support env vars too."
          : "Changing the bucket means edit code → rebuild image → re-push to ECR → re-pull in ECS. Slow & repetitive."}
      </div>
      <p className="pj-note ok">✅ Best practice: pass config as <b>environment variables</b>, not baked into the code.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. IAM ROLE vs ACCESS KEYS
   ════════════════════════════════════════════════════════════ */
export function IAMRoleVsKeys() {
  const [role, setRole] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title pj-title">🔐 Permissions: IAM Role vs Access Keys</div>
      <p className="pj-intro">The PHP app must be allowed to write to S3. How do we grant that?</p>
      <div className="pj-toggle">
        <button className={role ? "active" : ""} onClick={() => setRole(true)}>✅ IAM Role</button>
        <button className={!role ? "active" : ""} onClick={() => setRole(false)}>☠️ Keys in code</button>
      </div>
      <div className="pj-code">
        {role
          ? <code>// no keys anywhere — the task assumes an IAM role</code>
          : <code>$key = "AKIA…"; $secret = "wJalr…"; // hardcoded ☠️</code>}
      </div>
      <div className={`pj-verdict ${role ? "ok" : "bad"}`}>
        {role
          ? "Attach an IAM role to the ECS task → it gets temporary, auto-rotating credentials. Nothing secret in the code."
          : "If anyone sees your code (leaked repo, hacked file), they get your keys and your whole account. Never do this."}
      </div>
      <p className="pj-note warn">During local testing we pass keys temporarily just to verify — then delete them. In production we always use an <b>IAM role</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. ECR BRIDGE (push / pull)
   ════════════════════════════════════════════════════════════ */
export function ECRBridge() {
  return (
    <div className="sv-card">
      <div className="sv-title pj-title">③ ECR — the Bridge to ECS</div>
      <p className="pj-intro">
        The image is on the build machine, but ECS can't grab it from there. <b>ECR</b> (Elastic Container Registry) is the middle store: you <b>push</b> from the build machine, ECS <b>pulls</b> from ECR.
      </p>
      <div className="pj-bridge">
        <div className="pj-bridge-box">🛠️ Build Machine<small>image lives here</small></div>
        <div className="pj-bridge-arrow push">push ⟶</div>
        <div className="pj-bridge-box hot">🗄️ ECR<small>private registry</small></div>
        <div className="pj-bridge-arrow pull">⟶ pull</div>
        <div className="pj-bridge-box">📦 ECS<small>runs the task</small></div>
      </div>
      <p className="pj-note">Update flow: change code → push to GitHub → rebuild image → push to ECR → ECS pulls the new version. (A CI/CD pipeline can automate this.)</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. ECR vs DOCKER HUB
   ════════════════════════════════════════════════════════════ */
const ECR_CMP = [
  { k: "Privacy", a: "Private by default", b: "Public or private" },
  { k: "Access", a: "IAM roles (AWS-native, easy)", b: "Docker Hub login" },
  { k: "Speed", a: "Same region as ECS = low latency", b: "Location unknown; can be far" },
  { k: "Rate limits", a: "None", b: "Pull rate limits apply" },
];
export function ECRvsDockerHub() {
  return (
    <div className="sv-card">
      <div className="sv-title pj-title">🆚 Why ECR over Docker Hub?</div>
      <p className="pj-intro">Both store images. Inside AWS, ECR wins:</p>
      <div className="pj-cmp">
        <div className="pj-cmp-head"><span className="feat"> </span><span className="a">ECR ✅</span><span className="b">Docker Hub</span></div>
        {ECR_CMP.map((r, i) => (
          <div key={i} className="pj-cmp-row"><span className="feat">{r.k}</span><span>{r.a}</span><span>{r.b}</span></div>
        ))}
      </div>
      <p className="pj-note">ECR is part of the AWS ecosystem → secure, fast, and integrates with IAM. Docker Hub still works if you prefer it.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. TAG MUTABILITY
   ════════════════════════════════════════════════════════════ */
export function TagMutability() {
  const [immutable, setImmutable] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title pj-title">🏷️ ECR Repo: Tag Mutability</div>
      <p className="pj-intro">
        When you create the repo, you choose whether a tag (like <code>latest</code>) can be overwritten. You push v1 as <code>latest</code>; now you push v2 — also <code>latest</code>:
      </p>
      <div className="pj-toggle">
        <button className={!immutable ? "active" : ""} onClick={() => setImmutable(false)}>Mutable</button>
        <button className={immutable ? "active" : ""} onClick={() => setImmutable(true)}>Immutable</button>
      </div>
      <div className="pj-tags">
        <div className="pj-tag">v1 → <b>latest</b></div>
        <div className="pj-tag-arrow">push v2 as <b>latest</b></div>
        <div className={`pj-tag ${immutable ? "blocked" : "over"}`}>{immutable ? "🚫 rejected" : "v2 → latest (v1 overwritten)"}</div>
      </div>
      <div className={`pj-verdict ${immutable ? "ok" : "bad"}`}>
        {immutable
          ? "Immutable: the tag can't be reused — safer, easy rollbacks. Best for production."
          : "Mutable: the new image overwrites the old tag — convenient but risky (hard to roll back)."}
      </div>
      <p className="pj-note">For this lab we pick <b>Mutable</b> (we update often while learning). Encryption: <b>AES-256</b> (ECR-managed) is fine; use <b>KMS</b> for audit/compliance.</p>
    </div>
  );
}
