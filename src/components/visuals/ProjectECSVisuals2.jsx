import React, { useState } from "react";
import "./ProjectECSVisuals2.css";

/* ════════════════════════════════════════════════════════════
   1. PUSH TO ECR (auth + tag + push)
   ════════════════════════════════════════════════════════════ */
const PUSH_STEPS = [
  { ic: "🪪", t: "Authenticate EC2 → AWS", d: "Don't hardcode access keys on the build machine (risky). Instead attach an IAM role (ECR full access) to the EC2 — best practice." },
  { ic: "🔑", t: "Authenticate Docker → ECR", d: "Run the ECR login command (from 'View push commands'). Get 'Login Succeeded' — a temporary token lets Docker push." },
  { ic: "🏷️", t: "Tag the image", d: "Rename the local image with the ECR repo URI so Docker knows where to send it: docker tag cloudfox-php:latest <URI>:latest." },
  { ic: "⬆️", t: "Push the image", d: "docker push <URI>:latest → image lands in the ECR repo, ready for ECS to pull." },
];
export function PushToECR() {
  const [s, setS] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title pj2-title">④ Push the Image to ECR</div>
      <p className="pj2-intro">Four steps — but you can't just push: you must <b>authenticate</b> first (using an IAM role, not keys). Step through:</p>
      <div className="pj2-track">
        {PUSH_STEPS.map((_, i) => (
          <React.Fragment key={i}>
            <button className={`pj2-dot ${i === s ? "active" : ""} ${i < s ? "past" : ""}`} onClick={() => setS(i)}>{i + 1}</button>
            {i < PUSH_STEPS.length - 1 && <span className={`pj2-line ${i < s ? "on" : ""}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="pj2-detail"><b>{PUSH_STEPS[s].ic} {PUSH_STEPS[s].t}</b><p>{PUSH_STEPS[s].d}</p></div>
      <p className="pj2-note ok">After pushing, the image shows up in the ECR repo. Later: code change → rebuild → re-tag → re-push (a CI/CD pipeline can automate it).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. TASK DEFINITION BLUEPRINT + revisions
   ════════════════════════════════════════════════════════════ */
export function TaskDefinitionBlueprint() {
  const [rev, setRev] = useState(2);
  return (
    <div className="sv-card">
      <div className="sv-title pj2-title">⑤ Task Definition — the Blueprint</div>
      <p className="pj2-intro">
        A <b>task definition</b> is the recipe that tells ECS how to run your app: which <b>image</b>, how much <b>CPU/RAM</b>, which <b>ports</b>, <b>env vars</b>, and <b>IAM roles</b>. You need one before running any task or service.
      </p>
      <div className="pj2-blueprint">
        {["🖼️ Image (from ECR)", "⚙️ CPU + memory", "🔌 Ports / network mode", "🔧 Environment variables", "🔐 IAM roles", "💾 Storage"].map((x, i) => (
          <div key={i} className="pj2-bp-row">{x}</div>
        ))}
      </div>
      <p className="pj2-sub">Editing creates a new <b>revision</b> (never overwrites) — easy rollback. All revisions live in one <b>family</b>:</p>
      <div className="pj2-revs">
        {[1, 2, 3].map(r => (
          <button key={r} className={`pj2-rev ${rev === r ? "active" : ""}`} onClick={() => setRev(r)}>
            cloudfox-web:<b>{r}</b>
          </button>
        ))}
      </div>
      <div className="pj2-detail">
        <p>Family <b>cloudfox-web</b>, revision <b>{rev}</b> selected. {rev === 3 ? "Latest." : "You can launch any older revision to roll back."} A task definition can also hold <b>multiple containers</b> (e.g. front-end + back-end).</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. OS + ARCHITECTURE MATCHING
   ════════════════════════════════════════════════════════════ */
const OS_OPTS = [
  { id: "linux-x86", t: "Linux · x86_64", host: "Fargate ✅ or x86 EC2", ok: true },
  { id: "linux-arm", t: "Linux · ARM64", host: "Fargate ✅ or Graviton EC2", ok: true },
  { id: "win-x86", t: "Windows · x86_64", host: "Windows EC2 only (NOT Fargate)", ok: false },
];
export function OSArchMatch() {
  const [sel, setSel] = useState("linux-x86");
  const o = OS_OPTS.find(x => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title pj2-title">🧬 OS &amp; Architecture Matching</div>
      <p className="pj2-intro">
        You tell ECS what your container is built for. ECS then only runs it on a <b>matching host</b> — there's no error in the form, but the task <b>fails to start</b> if no match exists.
      </p>
      <div className="pj2-tabs">
        {OS_OPTS.map(x => <button key={x.id} className={`pj2-tab ${sel === x.id ? "active" : ""}`} onClick={() => setSel(x.id)}>{x.t}</button>)}
      </div>
      <div className="pj2-detail"><b>{o.t}</b><p>Runs on: {o.host}.</p></div>
      <p className={`pj2-note ${o.ok ? "ok" : "warn"}`}>
        {o.ok
          ? "Fargate supports both x86 and ARM Linux — easy."
          : "⚠️ Windows is NOT supported by Fargate. You must have a Windows EC2 instance in the cluster, or the task stays pending / fails."}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. NETWORK MODES (the centerpiece)
   ════════════════════════════════════════════════════════════ */
const NET_MODES = {
  awsvpc: { t: "awsvpc", launch: "Fargate ✅ + EC2", ip: "Own ENI + private IP per task (like a mini-EC2)", port: "Container port only", best: true,
    d: "Each task gets its own Elastic Network Interface, private IP, security group. Full isolation, no sharing. The default and most-used mode — the ONLY one Fargate supports." },
  bridge: { t: "bridge", launch: "EC2 (Linux)", ip: "Shares host ENI; Docker virtual bridge gives internal IPs", port: "Host port ↔ container port mapping",
    d: "Docker builds a virtual bridge on the host. Tasks share the host's one ENI; you map host ports (8080, 8081…) to each container's port 80. Default for Linux Docker." },
  default: { t: "default", launch: "EC2 (Windows)", ip: "NAT (Windows equivalent of bridge)", port: "Host port ↔ container port mapping",
    d: "Windows containers don't support bridge — they use NAT, shown here as 'default'. Same port-mapping idea as bridge, but for Windows hosts." },
  host: { t: "host", launch: "EC2 (Linux)", ip: "Uses the host's IP directly (no bridge)", port: "Container port only (no mapping)",
    d: "The container shares the host's network stack and IP. Fastest (no routing), but two containers can't use the same port — give each a unique port." },
  none: { t: "none", launch: "EC2", ip: "No external networking", port: "Disabled",
    d: "The container has no outside network access. Used for testing / isolated batch jobs." },
};
export function NetworkModes() {
  const [m, setM] = useState("awsvpc");
  const n = NET_MODES[m];
  return (
    <div className="sv-card">
      <div className="sv-title pj2-title">🌐 The 5 Network Modes</div>
      <p className="pj2-intro">How your container connects to the network. Tap each (the big exam/interview topic):</p>
      <div className="pj2-tabs">
        {Object.keys(NET_MODES).map(k => (
          <button key={k} className={`pj2-tab ${m === k ? "active" : ""}`} onClick={() => setM(k)}>{NET_MODES[k].t}{NET_MODES[k].best ? " ⭐" : ""}</button>
        ))}
      </div>
      <div className="pj2-detail"><b>{n.t}</b><p>{n.d}</p></div>
      <div className="pj2-mini">
        <span><small>LAUNCH TYPE</small>{n.launch}</span>
        <span><small>IP</small>{n.ip}</span>
        <span><small>PORT CONFIG</small>{n.port}</span>
      </div>
      <p className="pj2-note">📌 Only <b>bridge</b> and <b>default</b> need <b>host↔container port mapping</b>. <b>awsvpc</b> &amp; <b>host</b> use the container port only. Fargate = <b>awsvpc</b> always.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. TASK SIZE (Fargate combos vs EC2)
   ════════════════════════════════════════════════════════════ */
const FARGATE_CPU = { "0.25 vCPU": "0.5 – 2 GB", "0.5 vCPU": "1 – 4 GB", "1 vCPU": "2 – 8 GB", "2 vCPU": "4 – 16 GB" };
export function TaskSizeExplorer() {
  const [type, setType] = useState("fargate");
  const [cpu, setCpu] = useState("1 vCPU");
  return (
    <div className="sv-card">
      <div className="sv-title pj2-title">📏 Task Size (CPU &amp; Memory)</div>
      <p className="pj2-intro">How much CPU + RAM the task gets. The rules differ by launch type:</p>
      <div className="pj2-toggle">
        <button className={type === "fargate" ? "active" : ""} onClick={() => setType("fargate")}>☁️ Fargate</button>
        <button className={type === "ec2" ? "active" : ""} onClick={() => setType("ec2")}>🖥️ EC2</button>
      </div>
      {type === "fargate" ? (
        <>
          <p className="pj2-sub">Pick a vCPU — memory must be a <b>compatible</b> pairing:</p>
          <div className="pj2-chiprow">
            {Object.keys(FARGATE_CPU).map(c => (
              <button key={c} className={`pj2-chip ${cpu === c ? "active" : ""}`} onClick={() => setCpu(c)}>{c}</button>
            ))}
          </div>
          <div className="pj2-detail"><b>{cpu}</b><p>Allowed memory: <b>{FARGATE_CPU[cpu]}</b> (in 1 GB steps). Task size is <b>mandatory</b> on Fargate — it's how serverless knows what to bill.</p></div>
        </>
      ) : (
        <div className="pj2-detail"><b>EC2</b><p>Any size you want — but it must <b>fit inside your EC2 host</b>. Asking a t2.micro (1 vCPU) for 1 full vCPU can starve the host and the task <b>fails to launch</b>. Task size is optional on EC2 (it reserves resources).</p></div>
      )}
      <p className="pj2-note warn">Don't over-allocate "to be safe" — you pay for it. Right-size by running &amp; monitoring.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. TASK ROLE vs TASK EXECUTION ROLE
   ════════════════════════════════════════════════════════════ */
const ROLE_CMP = [
  { k: "Who uses it", a: "Your app code (in the container)", b: "The ECS agent (infrastructure)" },
  { k: "When", a: "At runtime, when app calls AWS", b: "At launch, when starting the task" },
  { k: "Purpose", a: "App → AWS services", b: "Pull image, push logs, fetch secrets" },
  { k: "Example", a: "PHP app writes to S3", b: "Pull image from private ECR" },
  { k: "Needed?", a: "Only if the app uses AWS", b: "Needed for private ECR / CloudWatch / secrets" },
];
export function TaskRoleVsExecution() {
  return (
    <div className="sv-card">
      <div className="sv-title pj2-title">🔐 Task Role vs Task Execution Role</div>
      <p className="pj2-intro">Two IAM roles in a task definition — easy to confuse. Simple split: <b>app</b> vs <b>infrastructure</b>.</p>
      <div className="pj2-cmp">
        <div className="pj2-cmp-head"><span className="feat"> </span><span className="a">Task Role</span><span className="b">Execution Role</span></div>
        {ROLE_CMP.map((r, i) => (
          <div key={i} className="pj2-cmp-row"><span className="feat">{r.k}</span><span>{r.a}</span><span>{r.b}</span></div>
        ))}
      </div>
      <p className="pj2-note ok">Our project uses <b>both</b>: a <b>task role</b> so the PHP app can write to S3, and an <b>execution role</b> so ECS can pull the image from private ECR.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. PLACEMENT CONSTRAINTS
   ════════════════════════════════════════════════════════════ */
export function PlacementConstraints() {
  const [mode, setMode] = useState("member");
  return (
    <div className="sv-card">
      <div className="sv-title pj2-title">📍 Placement Constraints (EC2 only)</div>
      <p className="pj2-intro">Control <b>which</b> EC2 host a task lands on. (Not supported on Fargate — it's serverless.)</p>
      <div className="pj2-toggle">
        <button className={mode === "member" ? "active" : ""} onClick={() => setMode("member")}>memberOf</button>
        <button className={mode === "distinct" ? "active" : ""} onClick={() => setMode("distinct")}>distinctInstance</button>
      </div>
      <div className="pj2-detail">
        {mode === "member"
          ? <p><b>memberOf</b> — run only on hosts matching a query. E.g. <code>attribute:ecs.instance-type == t3.*</code> → tasks only land on t3 instances. Set in the task definition.</p>
          : <p><b>distinctInstance</b> — spread tasks onto <b>different</b> hosts (for high availability). No query needed. Only set when you <b>run</b> the task/service, not in the task definition.</p>}
      </div>
      <p className="pj2-note warn">⚠️ If no matching host exists, the task stays <b>pending</b> — it won't create a new instance for you.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. CONTAINER CONFIG (essential + port + readonly)
   ════════════════════════════════════════════════════════════ */
export function ContainerConfig() {
  const [essentialDown, setEssentialDown] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title pj2-title">📦 Container Configuration</div>
      <p className="pj2-intro">Inside the task definition you describe each container: <b>name</b>, <b>image URI</b>, <b>essential?</b>, <b>ports</b>, and <b>read-only root FS</b>.</p>
      <div className="pj2-cfg">
        <div className="pj2-cfg-row"><b>Name</b><span>web-application</span></div>
        <div className="pj2-cfg-row"><b>Image URI</b><span>…ecr…/cloudfox-php-app:latest</span></div>
        <div className="pj2-cfg-row"><b>Auth</b><span>Private ECR → handled by execution role (no password needed)</span></div>
      </div>
      <p className="pj2-sub">An <b>essential</b> container, if it stops, stops the whole task. Tap to test:</p>
      <button className="pj2-btn" onClick={() => setEssentialDown(!essentialDown)}>
        {essentialDown ? "🔄 Restart container" : "💥 Crash the essential container"}
      </button>
      <div className={`pj2-verdict ${essentialDown ? "bad" : "ok"}`}>
        {essentialDown ? "🛑 Essential container down → entire task fails" : "✅ Task healthy"}
      </div>
      <p className="pj2-note">Other options: <b>port mapping</b> (depends on network mode), and <b>read-only root filesystem</b> (Linux) — locks the container from writing/editing its own files, for security.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. RESOURCE LIMITS (task vs container, hard/soft)
   ════════════════════════════════════════════════════════════ */
export function ResourceLimits() {
  const [c1, setC1] = useState(2);
  const total = 4;
  return (
    <div className="sv-card">
      <div className="sv-title pj2-title">⚖️ Resource Allocation Limits</div>
      <p className="pj2-intro">
        Set limits at the <b>task</b> level (the big box) and per <b>container</b> (so one container can't hog it all). Drag container 1's share of {total} vCPU:
      </p>
      <input className="pj2-slider" type="range" min="0.25" max={total} step="0.25" value={c1} onChange={e => setC1(parseFloat(e.target.value))} />
      <div className="pj2-bars">
        <div className="pj2-bar"><span style={{ width: `${(c1 / total) * 100}%` }} /></div>
        <div className="pj2-bar-lbl">Container 1: <b>{c1} vCPU</b> · Container 2 left: <b>{(total - c1).toFixed(2)} vCPU</b></div>
      </div>
      <div className="pj2-mini">
        <span><small>CPU</small>Cap a container's vCPU (e.g. 0.5)</span>
        <span><small>MEMORY HARD</small>Cross it → container is killed</span>
        <span><small>MEMORY SOFT</small>Reserved minimum (safe floor)</span>
        <span><small>GPU</small>EC2 + GPU instance only (not Fargate)</span>
      </div>
      <p className="pj2-note">Fargate <b>requires</b> task size; EC2 can also reserve per-task. Balance containers so none starves the others.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   10. ECS STORAGE OPTIONS (Fargate vs EC2)
   ════════════════════════════════════════════════════════════ */
const STORAGE = {
  fargate: [
    { t: "Ephemeral storage", d: "20 GB default (up to 200 GB), one per task. Wiped when the task stops.", persist: false },
    { t: "Bind mount", d: "A named volume inside ephemeral storage, mounted into containers to share data within the task.", persist: false },
    { t: "Amazon EBS", d: "Block storage per task — but Fargate only via CLI/SDK/JSON (not console). Can be persistent.", persist: true },
    { t: "Amazon EFS", d: "Shared network file system — persistent AND shared across tasks. The go-to for durable shared data.", persist: true },
  ],
  ec2: [
    { t: "EC2 instance storage", d: "The host's EBS volume; the container gets an isolated writable layer (can't see host files by default).", persist: false },
    { t: "Bind mount", d: "Mount a host directory into the container — access host data or share between containers.", persist: true },
    { t: "Docker volumes", d: "Docker-managed volume on the host; modern way to share a volume across containers.", persist: true },
    { t: "EBS / EFS / FSx", d: "Attach more EBS, or external EFS (Linux) / FSx for Windows — persistent &amp; shareable across tasks.", persist: true },
  ],
};
export function ECSStorageExplorer() {
  const [type, setType] = useState("fargate");
  return (
    <div className="sv-card">
      <div className="sv-title pj2-title">💾 Storage Options</div>
      <p className="pj2-intro">Storage choices differ by launch type. All must be <b>mounted</b> to be usable by a container:</p>
      <div className="pj2-toggle">
        <button className={type === "fargate" ? "active" : ""} onClick={() => setType("fargate")}>☁️ Fargate</button>
        <button className={type === "ec2" ? "active" : ""} onClick={() => setType("ec2")}>🖥️ EC2</button>
      </div>
      <div className="pj2-store">
        {STORAGE[type].map((s, i) => (
          <div key={i} className="pj2-store-row">
            <span className={`pj2-store-tag ${s.persist ? "ok" : "warn"}`}>{s.persist ? "persistent" : "ephemeral"}</span>
            <div><b>{s.t}</b><p>{s.d}</p></div>
          </div>
        ))}
      </div>
      <p className="pj2-note">📌 <b>Ephemeral storage (20–200 GB)</b> is Fargate-only. For durable, shared data use <b>EFS</b> (Linux) or <b>FSx</b> (Windows).</p>
    </div>
  );
}
