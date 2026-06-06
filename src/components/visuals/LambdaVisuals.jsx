import React, { useState } from "react";
import "./LambdaVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. SERVERLESS 3D — event → Lambda → response
   ════════════════════════════════════════════════════════════ */
const EVENT_SOURCES = [
  { ic: "🪣", t: "S3", d: "Object uploaded (e.g. add a watermark to a new image)." },
  { ic: "🌐", t: "API Gateway", d: "HTTP request hits an endpoint URL." },
  { ic: "📅", t: "EventBridge", d: "A schedule (cron) or event pattern fires." },
  { ic: "🗄️", t: "DynamoDB", d: "A stream record (insert/update/delete)." },
];
export function ServerlessFlow3D() {
  const [src, setSrc] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title lam-title">⚡ Event-Driven Lambda (3D Flow)</div>
      <p className="lam-intro">
        Lambda = <b>run code without provisioning servers</b>. It's <b>event-driven</b>: an AWS service <b>triggers</b> your
        function, the code runs, and a <b>response</b> is returned. Pick an event source:
      </p>
      <div className="lam-src-tabs">
        {EVENT_SOURCES.map((e, i) => (
          <button key={i} className={"lam-src-tab" + (src === i ? " active" : "")} onClick={() => setSrc(i)}>
            <span>{e.ic}</span>{e.t}
          </button>
        ))}
      </div>
      <div className="lam-flow3d">
        <div className="lam-cube source">
          <div className="lam-cube-face">{EVENT_SOURCES[src].ic}</div>
          <small>{EVENT_SOURCES[src].t}</small>
        </div>
        <div className="lam-bolt">⟶ trigger ⟶</div>
        <div className="lam-cube lambda">
          <div className="lam-cube-face">λ</div>
          <small>Lambda</small>
        </div>
        <div className="lam-bolt">⟶ response ⟶</div>
        <div className="lam-cube resp">
          <div className="lam-cube-face">✅</div>
          <small>Result</small>
        </div>
      </div>
      <p className="lam-note">📌 <b>{EVENT_SOURCES[src].t} event:</b> {EVENT_SOURCES[src].d}</p>
      <p className="lam-note ok">💰 <b>Pay-as-you-go:</b> you pay only when the function runs. No triggers → no cost. Supports many languages via <b>runtimes</b> (Python, Node.js, Java, .NET, Ruby, Go).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. SERVERLESS SPECTRUM — IaaS vs Managed vs Serverless
   ════════════════════════════════════════════════════════════ */
const SPECTRUM = [
  { id: "iaas", label: "IaaS (EC2)", color: "#f0883e", you: ["OS patching", "Scaling", "High availability", "Capacity sizing", "Your code"], aws: ["Physical hardware"] },
  { id: "managed", label: "Managed (RDS)", color: "#d29922", you: ["Capacity sizing", "HA config (Multi-AZ)", "Your data"], aws: ["OS", "DB engine patching", "Hardware"] },
  { id: "serverless", label: "Serverless (Lambda)", color: "#3fb950", you: ["Your code"], aws: ["Provisioning", "Scaling", "High availability", "Server maintenance", "Hardware"] },
];
export function ServerlessSpectrum() {
  const [sel, setSel] = useState("serverless");
  const s = SPECTRUM.find((x) => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title lam-title">🎚️ IaaS → Managed → Serverless</div>
      <p className="lam-intro">
        The less you manage, the more the cloud does for you. Lambda is the far end — you bring <b>only your code</b>. Click a tier:
      </p>
      <div className="lam-spectrum">
        {SPECTRUM.map((x) => (
          <button key={x.id} className={"lam-spec-btn" + (sel === x.id ? " active" : "")} style={sel === x.id ? { borderColor: x.color, color: x.color } : {}} onClick={() => setSel(x.id)}>{x.label}</button>
        ))}
      </div>
      <div className="lam-spec-cols">
        <div className="lam-spec-col you">
          <div className="lam-spec-h">🧑‍💻 You manage</div>
          {s.you.map((i, k) => <div key={k} className="lam-spec-item you">{i}</div>)}
        </div>
        <div className="lam-spec-col aws">
          <div className="lam-spec-h">☁️ AWS manages</div>
          {s.aws.map((i, k) => <div key={k} className="lam-spec-item aws">{i}</div>)}
        </div>
      </div>
      <p className="lam-note">⚖️ Rule of thumb: <b>long-running</b> workloads → IaaS / managed. <b>Event-driven, short tasks</b> → serverless.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. SERVERLESS TRADE-OFFS
   ════════════════════════════════════════════════════════════ */
const TRADEOFFS = [
  { ic: "🥶", t: "Cold Starts", d: "If a function is idle, Lambda must provision resources before running → the first invocation is slower. A warm (recently-used) function runs instantly." },
  { ic: "⏱️", t: "15-min Limit", d: "Max execution time is 15 minutes. If code runs longer, you CANNOT use Lambda — use EC2. (Common exam trap: '20-minute job' → not Lambda.)" },
  { ic: "🔒", t: "Vendor Lock-in", d: "Lambda code uses AWS-specific structure; moving to another cloud needs modification (unlike an EC2 OS you can replicate anywhere)." },
  { ic: "🎛️", t: "Less Control", d: "No control over the underlying infrastructure — you only supply code and pick a runtime." },
];
export function ServerlessTradeoffs() {
  return (
    <div className="sv-card">
      <div className="sv-title lam-title">⚠️ Serverless Trade-offs</div>
      <p className="lam-intro">Serverless is powerful, but know its limits — especially for the exam:</p>
      <div className="lam-trade-grid">
        {TRADEOFFS.map((t, i) => (
          <div key={i} className="lam-trade-card">
            <div className="lam-trade-ic">{t.ic}</div>
            <div className="lam-trade-t">{t.t}</div>
            <div className="lam-trade-d">{t.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. LAMBDA vs EC2 — 10 differences
   ════════════════════════════════════════════════════════════ */
const VS_ROWS = [
  ["Compute model", "Provisioned virtual machine", "Event-driven function"],
  ["Use case", "Long-running apps, DBs, 24×7 processes", "Short tasks, microservices, automation"],
  ["Pricing", "Per instance (hourly/per-sec) — pay even if idle", "Per execution + memory — pay only when it runs"],
  ["Scaling", "Manual (Auto Scaling Group setup)", "Automatic & instant"],
  ["Management", "You manage OS, patching, scaling", "Fully managed, no servers"],
  ["Startup time", "Minutes (if powered off)", "Milliseconds (cold start if idle)"],
  ["Execution time", "Unlimited", "Max 15 minutes"],
  ["Networking", "Full control (VPC, SG, EIP)", "VPC access (limited features)"],
  ["Customizability", "Full OS control, any software", "Predefined runtimes only"],
  ["Security", "You patch & firewall", "Fully managed"],
];
export function LambdaVsEC2() {
  return (
    <div className="sv-card">
      <div className="sv-title lam-title">🆚 Lambda vs EC2 — 10 Differences</div>
      <p className="lam-intro">
        Both are <b>compute</b> services. The big deciders: <b>execution time</b> (&gt;15 min → EC2) and <b>workload pattern</b>
        (24×7 → EC2; event-driven/bursty → Lambda, saving money).
      </p>
      <div className="lam-vs-table">
        <div className="lam-vs-row head"><span className="feat">Aspect</span><span className="ec2">🖥️ EC2</span><span className="lam">λ Lambda</span></div>
        {VS_ROWS.map((r, i) => (
          <div key={i} className="lam-vs-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="lam-note ok">💡 <b>Pricing example:</b> a "course enrollment" function runs 10× today → pay for 10 runs; runs 0× tomorrow → pay ₹0. An EC2 instance hosting the same code costs the same whether it runs 0 or 40 times.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. ANATOMY of a Lambda function (handler/return/print)
   ════════════════════════════════════════════════════════════ */
export function FunctionAnatomy() {
  const [hl, setHl] = useState("handler");
  return (
    <div className="sv-card">
      <div className="sv-title lam-title">🧬 Anatomy of a Lambda Function</div>
      <p className="lam-intro">Your first function. Hover/click the parts to understand them:</p>
      <div className="lam-code">
        <div className={"lam-code-line" + (hl === "handler" ? " hl" : "")} onClick={() => setHl("handler")}>
          <span className="lam-kw">def</span> <span className="lam-fn">lambda_handler</span>(event, context):
        </div>
        <div className={"lam-code-line indent" + (hl === "return" ? " hl" : "")} onClick={() => setHl("return")}>
          <span className="lam-kw">return</span> <span className="lam-str">"Hello World"</span>
        </div>
        <div className={"lam-code-line indent" + (hl === "print" ? " hl" : "")} onClick={() => setHl("print")}>
          <span className="lam-fn">print</span>(<span className="lam-str">"Hello World"</span>)  <span className="lam-cmt"># → CloudWatch log</span>
        </div>
      </div>
      <div className="lam-anatomy-tabs">
        <button className={hl === "handler" ? "active" : ""} onClick={() => setHl("handler")}>handler</button>
        <button className={hl === "return" ? "active" : ""} onClick={() => setHl("return")}>return</button>
        <button className={hl === "print" ? "active" : ""} onClick={() => setHl("print")}>print</button>
      </div>
      <div className="lam-anatomy-detail">
        {hl === "handler" && <p><b>lambda_handler(event, context)</b> — the entry point Lambda calls on each trigger. Must be a <b>function</b> (because an event invokes it). <code>event</code> carries the trigger's input data; <code>context</code> is runtime info. The default name is <code>lambda_handler</code>.</p>}
        {hl === "return" && <p><b>return</b> — sends a value back as the <b>response</b> to the caller/event. Use this for the output you want the trigger to receive.</p>}
        {hl === "print" && <p><b>print</b> — does NOT return to the caller; it writes to <b>CloudWatch Logs</b> for debugging/auditing. The test response shows <code>null</code> when you only print.</p>}
      </div>
      <p className="lam-note">▶️ Workflow: write code → <b>Deploy</b> (save) → create a <b>Test event</b> (JSON key/value passed in as <code>event</code>) → <b>Test</b> to see response + logs.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. AUTHORING OPTIONS — scratch / blueprint / container
   ════════════════════════════════════════════════════════════ */
const AUTHOR = [
  { id: "scratch", t: "✍️ Author from Scratch", d: "Write your own function. Pick a runtime + architecture, then code in the editor. Best when you have your own code.", tag: "Most common" },
  { id: "blueprint", t: "📋 Blueprint", d: "Ready-made sample functions for common use cases (e.g. read/write DynamoDB). Tweak the template instead of writing from scratch.", tag: "Quick start" },
  { id: "container", t: "📦 Container Image", d: "Package the function as a Docker image (your own base OS + runtime + deps), push to ECR, run it as Lambda. For ML models, unsupported languages.", tag: "Custom runtime" },
];
export function AuthoringOptions() {
  const [sel, setSel] = useState("scratch");
  const a = AUTHOR.find((x) => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title lam-title">🛠️ Ways to Create a Function + Custom Runtimes</div>
      <p className="lam-intro">When you click "Create function", AWS gives three starting points:</p>
      <div className="lam-author-tabs">
        {AUTHOR.map((x) => (
          <button key={x.id} className={"lam-author-tab" + (sel === x.id ? " active" : "")} onClick={() => setSel(x.id)}>{x.t}</button>
        ))}
      </div>
      <div className="lam-author-detail">
        <span className="lam-author-tag">{a.tag}</span>
        <p>{a.d}</p>
      </div>
      <div className="lam-intro" style={{ margin: "16px 0 8px" }}><b>Unsupported language? Two container options:</b></div>
      <div className="lam-vs-table">
        <div className="lam-vs-row head"><span className="feat">Aspect</span><span className="ec2">📦 Container Image</span><span className="lam">🐧 OS-only Runtime</span></div>
        <div className="lam-vs-row"><span className="feat">Base OS</span><span>Any (Alpine, Ubuntu, Amazon Linux...)</span><span>Fixed (Amazon Linux)</span></div>
        <div className="lam-vs-row"><span className="feat">Runtime</span><span>Bundled inside the image</span><span>You install it yourself</span></div>
        <div className="lam-vs-row"><span className="feat">Control</span><span>Full OS + runtime + deps</span><span>Custom runtime, fixed OS</span></div>
        <div className="lam-vs-row"><span className="feat">Use case</span><span>ML (TensorFlow), big custom apps</span><span>Run an unlisted Node.js version</span></div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. EXECUTION ROLE — permissions to other services
   ════════════════════════════════════════════════════════════ */
export function ExecutionRole() {
  const [target, setTarget] = useState("cloudwatch");
  const targets = {
    cloudwatch: { ic: "📊", name: "CloudWatch Logs", policy: "AWSLambdaBasicExecutionRole", d: "Even a 'Hello World' function needs this — the DEFAULT execution role lets Lambda write logs. Without it, print() output goes nowhere." },
    s3: { ic: "🪣", name: "S3 Bucket", policy: "AmazonS3FullAccess", d: "To read an uploaded PDF and add a watermark, Lambda needs S3 permissions via its role." },
    ec2: { ic: "🖥️", name: "EC2 Instance", policy: "AmazonEC2FullAccess", d: "To start/stop EC2 (automation), the role must grant EC2 actions." },
  };
  const t = targets[target];
  return (
    <div className="sv-card">
      <div className="sv-title lam-title">🔑 Lambda Execution Role</div>
      <p className="lam-intro">
        AWS services are <b>isolated</b> — Lambda can't touch another service unless you grant it permission via an <b>IAM
        execution role</b> (an identity Lambda assumes). Pick what Lambda needs to access:
      </p>
      <div className="lam-author-tabs">
        {Object.entries(targets).map(([id, v]) => (
          <button key={id} className={"lam-author-tab" + (target === id ? " active" : "")} onClick={() => setTarget(id)}>{v.ic} {v.name}</button>
        ))}
      </div>
      <div className="lam-role-flow">
        <div className="lam-cube lambda small"><div className="lam-cube-face">λ</div><small>Lambda</small></div>
        <div className="lam-role-arrow">
          <span className="lam-role-key">🎫 IAM Role<br /><code>{t.policy}</code></span>
          →
        </div>
        <div className="lam-cube target small"><div className="lam-cube-face">{t.ic}</div><small>{t.name}</small></div>
      </div>
      <p className="lam-note">📌 {t.d}</p>
      <p className="lam-note warn">⭐ The <b>basic execution role</b> (CloudWatch Logs) is always needed. Add more managed/custom policies for each extra service the function touches.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. EC2 AUTOMATION — Boto3 start/stop
   ════════════════════════════════════════════════════════════ */
export function EC2Automation() {
  const [running, setRunning] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title lam-title">🤖 EC2 Automation with Boto3</div>
      <p className="lam-intro">
        <b>Boto3</b> is AWS's Python SDK — it lets Lambda manage AWS resources (EC2, S3, DynamoDB...). Here a function
        starts/stops an instance. Prerequisites: an EC2 instance + an IAM role (EC2 access + basic execution). Try it:
      </p>
      <div className="lam-ec2-demo">
        <div className="lam-code small">
          <div className="lam-code-line"><span className="lam-kw">import</span> boto3</div>
          <div className="lam-code-line">ec2 = boto3.client(<span className="lam-str">'ec2'</span>, region_name=<span className="lam-str">'ap-south-1'</span>)</div>
          <div className="lam-code-line"><span className="lam-kw">def</span> <span className="lam-fn">lambda_handler</span>(event, context):</div>
          <div className="lam-code-line indent">ec2.<span className="lam-fn">{running ? "stop_instances" : "start_instances"}</span>(InstanceIds=[<span className="lam-str">'i-0abc123'</span>])</div>
          <div className="lam-code-line indent"><span className="lam-kw">return</span> <span className="lam-str">"{running ? 'Stopped' : 'Started'}"</span></div>
        </div>
        <div className="lam-ec2-state">
          <div className={"lam-ec2-box " + (running ? "on" : "off")}>
            <div className="lam-ec2-ic">🖥️</div>
            <div className="lam-ec2-status">{running ? "🟢 running" : "🔴 stopped"}</div>
          </div>
          <button className="lam-ec2-btn" onClick={() => setRunning(!running)}>
            ▶ Invoke Lambda → {running ? "Stop" : "Start"} EC2
          </button>
        </div>
      </div>
      <p className="lam-note warn">⏲️ Default timeout is <b>3 seconds</b> — too short to start an instance. Increase it (e.g. 10 s) in <b>Configuration</b>. Verify results in the EC2 console or <b>CloudWatch Logs</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. TRIGGERS — how functions get invoked
   ════════════════════════════════════════════════════════════ */
const TRIGGERS = [
  { ic: "🌐", t: "API Gateway", d: "Exposes an HTTP URL. Hitting the URL (e.g. a webpage button) invokes the function. Used to start EC2 from a 'Start' button." },
  { ic: "📅", t: "EventBridge", d: "Schedule (cron) or event patterns. e.g. start all EC2 at 9 AM, stop at 6 PM — a cron expression fires the function." },
  { ic: "🪣", t: "S3", d: "Object events (upload/delete) invoke the function — e.g. watermark every new image." },
  { ic: "🗣️", t: "Alexa / ALB / others", d: "Many sources: Alexa skills, Application Load Balancer, CodeCommit, DynamoDB Streams, SNS, SQS..." },
];
export function LambdaTriggers() {
  const [sel, setSel] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title lam-title">🎯 Lambda Triggers</div>
      <p className="lam-intro">
        A function does nothing until something <b>triggers</b> it. You add triggers manually (no trigger = the button/event
        does nothing). Click a trigger type:
      </p>
      <div className="lam-trig-ring">
        {TRIGGERS.map((t, i) => (
          <button key={i} className={"lam-trig-node" + (sel === i ? " active" : "")} onClick={() => setSel(i)}>
            <span>{t.ic}</span><small>{t.t}</small>
          </button>
        ))}
        <div className="lam-trig-center">λ</div>
      </div>
      <div className="lam-anatomy-detail">
        <p><b>{TRIGGERS[sel].t}</b> — {TRIGGERS[sel].d}</p>
      </div>
      <p className="lam-note ok">🔁 The right trigger depends on the use case: a <b>button click</b> → API Gateway; a <b>scheduled job</b> → EventBridge; a <b>file upload</b> → S3.</p>
    </div>
  );
}
