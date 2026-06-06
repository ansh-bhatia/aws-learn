import React, { useState } from "react";
import "./LambdaVisuals2.css";

/* ════════════════════════════════════════════════════════════
   1. EXECUTION ENVIRONMENT — cold vs warm start (Netflix)
   ════════════════════════════════════════════════════════════ */
const EE_STEPS = [
  { t: "1 · Request arrives", d: "Rohan opens Netflix → API Gateway triggers the Lambda. No environment exists yet." },
  { t: "2 · Create container", d: "Lambda spins up a lightweight container and allocates CPU, memory & networking." },
  { t: "3 · Init runtime + code", d: "Runtime initializes, code + dependencies (e.g. the ML model) are loaded. This setup adds ~100–300 ms → COLD START." },
  { t: "4 · Execute", d: "The function runs and returns Rohan's recommendation." },
  { t: "5 · Reuse (warm)", d: "Rohan browses again → Lambda REUSES the live environment. No setup delay → WARM START, response in ms." },
];
export function ExecutionEnvironment3D() {
  const [step, setStep] = useState(0);
  const warm = step >= 4;
  return (
    <div className="sv-card">
      <div className="sv-title lam2-title">📦 Execution Environment — Cold vs Warm Start</div>
      <p className="lam2-intro">
        Lambda runs your code inside <b>containers</b> (lightweight VMs). Netflix serves millions of recommendations this
        way. The first run must build the environment (<b>cold start</b>); reusing a live one is a <b>warm start</b>. Step through:
      </p>
      <div className="lam2-ee-stage">
        <div className={"lam2-ee-box" + (step >= 1 ? " built" : "") + (warm ? " warm" : "")}>
          <div className="lam2-ee-layer cpu" data-on={step >= 1}>🧮 CPU / Memory / Network</div>
          <div className="lam2-ee-layer rt" data-on={step >= 2}>⚙️ Runtime (Python/Node/Java)</div>
          <div className="lam2-ee-layer code" data-on={step >= 2}>📜 Code + Dependencies</div>
          <div className="lam2-ee-flag">{step === 0 ? "∅ no environment" : warm ? "🔥 WARM (reused)" : step >= 3 ? "🥶 COLD START (~100–300ms)" : "building…"}</div>
        </div>
      </div>
      <div className="lam2-detail">
        <b>{EE_STEPS[step].t}</b>
        <p>{EE_STEPS[step].d}</p>
      </div>
      <div className="lam2-controls">
        <button className="lam2-btn" disabled={step === 0} onClick={() => setStep(step - 1)}>◀ Prev</button>
        <button className="lam2-btn primary" disabled={step === EE_STEPS.length - 1} onClick={() => setStep(step + 1)}>Next ▶</button>
      </div>
      <p className="lam2-note">📈 <b>Scaling:</b> if all environments are busy, Lambda launches more — 1,000 simultaneous users → 1,000 environments, automatically. Idle ones are removed (pay less). <b>Reduce cold starts</b> with: provisioned concurrency, more memory/CPU, or Lambda layers (preloaded deps).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. VERSIONS & ALIASES — canary routing
   ════════════════════════════════════════════════════════════ */
export function VersionsAliases() {
  const [target, setTarget] = useState("v4");
  const [weight, setWeight] = useState(50);
  const canary = target === "canary";
  return (
    <div className="sv-card">
      <div className="sv-title lam2-title">🏷️ Versions &amp; Aliases</div>
      <p className="lam2-intro">
        <b>Publishing a version</b> snapshots your code as read-only (v1, v2, …) so you can roll back. <b>$LATEST</b> stays
        editable. An <b>alias</b> (e.g. <code>prod</code>) is a named pointer to a version — your API Gateway URL targets the
        <i> alias</i>, so you switch versions <b>without changing the URL</b>. Pick what <code>prod</code> points to:
      </p>
      <div className="lam2-ver-rail">
        {["v1", "v2", "v3", "v4"].map((v) => (
          <div key={v} className={"lam2-ver-chip" + ((target === v) ? " active" : "") + (canary && (v === "v2" || v === "v3") ? " canary" : "")}>
            {v} <small>{v === "v4" ? "$LATEST" : "published"}</small>
          </div>
        ))}
      </div>
      <div className="lam2-toggle">
        <button className={target === "v1" ? "active" : ""} onClick={() => setTarget("v1")}>prod → v1 (rollback)</button>
        <button className={target === "v4" ? "active" : ""} onClick={() => setTarget("v4")}>prod → v4 (latest)</button>
        <button className={target === "canary" ? "active" : ""} onClick={() => setTarget("canary")}>prod → canary (v2/v3)</button>
      </div>
      <div className="lam2-alias-box">
        <div className="lam2-alias-url">🔗 https://…/prod  <span>(unchanged)</span></div>
        <div className="lam2-alias-arrow">▼ alias routes to</div>
        {canary ? (
          <>
            <div className="lam2-canary">
              <div className="lam2-canary-bar v2" style={{ width: `${100 - weight}%` }}>v2 · {100 - weight}%</div>
              <div className="lam2-canary-bar v3" style={{ width: `${weight}%` }}>v3 · {weight}%</div>
            </div>
            <label className="lam2-slider">Shift traffic to v3: <b>{weight}%</b>
              <input type="range" min="0" max="100" step="10" value={weight} onChange={(e) => setWeight(+e.target.value)} /></label>
          </>
        ) : (
          <div className="lam2-alias-target">{target === "v1" ? "Version 1" : "Version 4 ($LATEST snapshot)"}</div>
        )}
      </div>
      <p className="lam2-note ok">🐤 Weighted aliases enable <b>canary / blue-green deployments</b> — split traffic between two versions (e.g. 50/50) to safely test a new release behind the same URL.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. CONCURRENCY — calculator + reuse grid
   ════════════════════════════════════════════════════════════ */
export function Concurrency() {
  const [rps, setRps] = useState(50);
  const [dur, setDur] = useState(2);
  const conc = rps * dur;
  const over = conc > 1000;
  return (
    <div className="sv-card">
      <div className="sv-title lam2-title">🔢 Lambda Concurrency</div>
      <p className="lam2-intro">
        <b>Concurrency</b> = how many requests run <b>at the same time</b>. Each AWS account has a default limit of
        <b> 1,000 per region</b>, <b>shared</b> by all functions. Formula: <b>requests/sec × duration(sec)</b>:
      </p>
      <div className="lam2-calc">
        <label>Requests / second: <b>{rps}</b><input type="range" min="10" max="800" step="10" value={rps} onChange={(e) => setRps(+e.target.value)} /></label>
        <label>Avg duration (sec): <b>{dur}</b><input type="range" min="1" max="5" value={dur} onChange={(e) => setDur(+e.target.value)} /></label>
      </div>
      <div className="lam2-calc-out">
        <div className="lam2-calc-formula">{rps} req/s × {dur} s</div>
        <div className="lam2-calc-result" style={{ color: over ? "#f85149" : "#3fb950" }}>= {conc} concurrent</div>
      </div>
      <div className="lam2-meter">
        <div className="lam2-meter-fill" style={{ width: `${Math.min(100, (conc / 1000) * 100)}%`, background: over ? "#f85149" : "#ff9900" }} />
        <span className="lam2-meter-cap">1,000 limit</span>
      </div>
      <p className={"lam2-note " + (over ? "warn" : "ok")}>
        {over
          ? `🚨 ${conc} > 1,000 → throttling ("429 TooManyRequests"). Fix: request a higher limit (support), use multiple accounts/regions, or manage concurrency.`
          : `✅ ${conc} is within the 1,000 limit. Lambda reuses free environments (warm) before creating new ones.`}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. RESERVED CONCURRENCY — 3 functions
   ════════════════════════════════════════════════════════════ */
export function ReservedConcurrency() {
  const [reserve, setReserve] = useState(300);
  const total = 400;
  const shared = total - reserve;
  return (
    <div className="sv-card">
      <div className="sv-title lam2-title">🛡️ Reserved Concurrency</div>
      <p className="lam2-intro">
        Reserved concurrency <b>guarantees</b> a slice of the limit to a critical function (and <b>caps</b> it). No extra
        charge. Example: an e-commerce account (limit 400) with <b>Place-Order</b> (critical), <b>Send-Email</b>, and
        <b> Generate-Report</b>. Drag what to reserve for Place-Order:
      </p>
      <div className="lam2-calc">
        <label>Reserved for 🛒 Place-Order: <b>{reserve}</b>
          <input type="range" min="0" max="360" step="20" value={reserve} onChange={(e) => setReserve(+e.target.value)} /></label>
      </div>
      <div className="lam2-res-bars">
        <div className="lam2-res-row"><span>🛒 Place-Order (reserved)</span><div className="lam2-track"><div className="lam2-fill crit" style={{ width: `${(reserve / total) * 100}%` }}>{reserve}</div></div></div>
        <div className="lam2-res-row"><span>📧 Email + 📊 Report (share rest)</span><div className="lam2-track"><div className="lam2-fill shared" style={{ width: `${(shared / total) * 100}%` }}>{shared}</div></div></div>
      </div>
      <p className="lam2-note">
        🔒 Place-Order always has <b>{reserve}</b> guaranteed slots — Email/Report can't starve it. They share the remaining
        <b> {shared}</b>. {reserve >= 300 ? "Strong protection for revenue-critical traffic." : "Raise it to better protect checkout during spikes."}
      </p>
      <p className="lam2-note warn">⚠️ The <b>unreserved</b> pool can't drop below <b>100</b> (account minimum) — so you can't reserve everything.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. PROVISIONED CONCURRENCY — on-demand vs provisioned
   ════════════════════════════════════════════════════════════ */
export function ProvisionedConcurrency() {
  const [mode, setMode] = useState("provisioned");
  return (
    <div className="sv-card">
      <div className="sv-title lam2-title">⚡ Provisioned Concurrency</div>
      <p className="lam2-intro">
        Two concurrency types. <b>On-Demand</b> (default) creates environments when requests arrive → cold-start delay.
        <b> Provisioned</b> pre-initializes environments so they're always warm. Toggle:
      </p>
      <div className="lam2-toggle">
        <button className={mode === "ondemand" ? "active" : ""} onClick={() => setMode("ondemand")}>🕐 On-Demand (default)</button>
        <button className={mode === "provisioned" ? "active" : ""} onClick={() => setMode("provisioned")}>🔥 Provisioned</button>
      </div>
      <div className="lam2-pc-stage">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={"lam2-pc-env " + (mode === "provisioned" ? "ready" : "cold")}>
            <span>📦</span><small>{mode === "provisioned" ? "warm" : "spin-up…"}</small>
          </div>
        ))}
      </div>
      <div className="lam2-detail">
        {mode === "ondemand"
          ? <p><b>On-Demand:</b> request arrives → Lambda looks for a free environment → if none, builds a new one (cold start ~100ms–seconds). Cheaper, but the first/burst requests are slow.</p>
          : <p><b>Provisioned:</b> N environments are pre-warmed and kept ready → <b>zero cold start</b> for critical apps. You pay per provisioned instance per minute, used or not.</p>}
      </div>
      <p className="lam2-note warn">📌 <b>Exam notes:</b> Provisioned concurrency <b>requires a version or alias</b> (not $LATEST). It counts against your <b>1,000</b> account quota. You <b>pay</b> for provisioned instances regardless of use. Monitor <b>Throttles</b> &amp; <b>ProvisionedConcurrencyUtilization</b> in CloudWatch.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. LAMBDA LAYERS — 3 approaches
   ════════════════════════════════════════════════════════════ */
export function LambdaLayers() {
  const [mode, setMode] = useState("layer");
  return (
    <div className="sv-card">
      <div className="sv-title lam2-title">🧱 Lambda Layers</div>
      <p className="lam2-intro">
        A <b>library/module</b> is reusable code you <code>import</code>. Some (like <code>boto3</code>, <code>random</code>) are
        built into Lambda; others (<code>emoji</code>, <code>pandas</code>, <code>requests</code>) are not — import them and you
        get <code>ModuleNotFoundError</code>. Three ways to provide a non-built-in library:
      </p>
      <div className="lam2-toggle">
        <button className={mode === "builtin" ? "active" : ""} onClick={() => setMode("builtin")}>✅ Built-in</button>
        <button className={mode === "package" ? "active" : ""} onClick={() => setMode("package")}>📦 Package w/ code</button>
        <button className={mode === "layer" ? "active" : ""} onClick={() => setMode("layer")}>🧱 Layer (smart)</button>
      </div>
      {mode === "builtin" && (
        <div className="lam2-detail"><p><b>Built-in library</b> (e.g. <code>random</code>, <code>boto3</code>) — just <code>import</code> &amp; deploy. Nothing to upload; Lambda already has it.</p></div>
      )}
      {mode === "package" && (
        <>
          <div className="lam2-layers-viz">
            {[1, 2, 3].map((f) => (
              <div key={f} className="lam2-fn-block heavy">
                <div className="lam2-fn-code">λ code {f}</div>
                <div className="lam2-fn-lib">📚 emoji lib</div>
              </div>
            ))}
          </div>
          <div className="lam2-detail bad"><p><b>Package with each function</b> (not recommended) — zip code + library together for <i>every</i> function. Repetitive: update the library → re-package &amp; re-upload all functions. High overhead.</p></div>
        </>
      )}
      {mode === "layer" && (
        <>
          <div className="lam2-layers-viz">
            <div className="lam2-shared-lib">🧱 emoji LAYER<br /><small>(shared, versioned)</small></div>
            <div className="lam2-layer-fns">
              {[1, 2, 3].map((f) => <div key={f} className="lam2-fn-block light">λ code {f}</div>)}
            </div>
          </div>
          <div className="lam2-detail ok"><p><b>Lambda Layer</b> (smart) — zip the <i>library only</i>, upload once as a layer, attach to many functions. Update the layer once → all functions get it. Benefits: <b>reusability, clean separation, easy maintenance, faster deploys</b>.</p></div>
        </>
      )}
      <p className="lam2-note">🧪 Lab flow: in CloudShell → <code>mkdir python &amp;&amp; pip install emoji -t .</code> → zip the <code>python/</code> folder → create a <b>Layer</b> from the zip (runtime Python 3.9) → attach it to the function → re-test → ✅ emoji works.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. LAMBDA VPC CONNECTIVITY
   ════════════════════════════════════════════════════════════ */
export function LambdaVPC() {
  const [vpc, setVpc] = useState(false);
  const [nat, setNat] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title lam2-title">🔌 Lambda VPC Connectivity</div>
      <p className="lam2-intro">
        By default Lambda runs <b>outside your VPC</b> on AWS-managed networking with full internet — it can reach public
        services (S3, DynamoDB) but <b>not</b> private resources (RDS, EC2, ElastiCache in private subnets). Connect it to a
        VPC to reach them. Toggle:
      </p>
      <div className="lam2-toggle">
        <button className={!vpc ? "active" : ""} onClick={() => { setVpc(false); setNat(false); }}>🌐 No VPC (default)</button>
        <button className={vpc ? "active" : ""} onClick={() => setVpc(true)}>🔒 VPC-connected</button>
      </div>
      <div className="lam2-vpc-diagram">
        <div className="lam2-cube lambda"><div className="lam2-cube-face">λ</div><small>Lambda</small></div>
        {vpc && <div className="lam2-eni">🔗 ENI<br /><small>private IP + SG</small></div>}
        <div className="lam2-vpc-arrow">{vpc ? "→" : "⇢"}</div>
        <div className="lam2-vpc-resources">
          <div className={"lam2-res-chip" + (vpc ? " on" : "")}>🗄️ RDS (private)</div>
          <div className={"lam2-res-chip" + (vpc ? " on" : "")}>🖥️ EC2 (private)</div>
          <div className={"lam2-res-chip" + ((!vpc || nat) ? " on" : " off")}>🌍 Internet / public APIs</div>
        </div>
      </div>
      {vpc && (
        <label className="lam2-slider check"><input type="checkbox" checked={nat} onChange={(e) => setNat(e.target.checked)} /> Add a NAT Gateway (restore outbound internet)</label>
      )}
      <div className="lam2-detail">
        {!vpc
          ? <p><b>Default:</b> AWS-managed network, full internet access. Reaches S3/DynamoDB easily, but can't touch private-subnet resources.</p>
          : <p><b>VPC-connected:</b> AWS creates an <b>ENI</b> (Elastic Network Interface) in your private subnet with a private IP. Lambda now reaches RDS/EC2 — but <b>loses default internet</b>. {nat ? "A NAT Gateway restores outbound internet." : "Add a NAT Gateway for outbound internet, or a VPC Endpoint for just S3/DynamoDB without full internet."}</p>}
      </div>
      <p className="lam2-note warn">🛡️ <b>Exam favorite:</b> a VPC-attached Lambda needs a <b>Security Group</b> on its ENI — allow <b>outbound</b> to reach a DB, <b>inbound</b> if EC2 calls the Lambda. For private AWS-service access without internet, use a <b>VPC Endpoint</b> instead of NAT.</p>
    </div>
  );
}
