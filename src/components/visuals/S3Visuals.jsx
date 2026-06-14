import React, { useState } from "react";
import "./S3Visuals.css";

/* ════════════════════════════════════════════════════════════
   1. OBJECT vs BLOCK STORAGE
   ════════════════════════════════════════════════════════════ */
export function ObjectVsBlock() {
  const [mode, setMode] = useState("object");
  return (
    <div className="sv-card">
      <div className="sv-title s3-title">📦 Object vs Block Storage</div>
      <p className="s3-intro">
        S3 is <b>object storage</b> — a different method of storing data than EBS (block) or EFS (file). Toggle to compare how a file is stored:
      </p>
      <div className="s3-toggle">
        <button className={mode === "object" ? "active" : ""} onClick={() => setMode("object")}>📦 Object (S3)</button>
        <button className={mode === "block" ? "active" : ""} onClick={() => setMode("block")}>🧱 Block (EBS)</button>
      </div>
      <div className="s3-ovb-stage">
        {mode === "object" ? (
          <div className="s3-ovb-object">📄 whole file = 1 object<small>+ unique ID + metadata</small></div>
        ) : (
          <div className="s3-ovb-blocks">
            {Array.from({ length: 9 }).map((_, i) => <span key={i}>blk</span>)}
            <small>file split into many blocks</small>
          </div>
        )}
      </div>
      <div className="s3-detail">
        {mode === "object"
          ? <p><b>Object storage:</b> each file is stored as one whole <b>object</b> with a unique ID + metadata, in a flat namespace. Each object has its own <b>URL</b> — access directly over HTTP, no mounting. Virtually unlimited &amp; cheap. Best for <b>static, unstructured data</b> (photos, videos, backups). Downside: higher latency, not for frequent edits.</p>
          : <p><b>Block storage:</b> the file is split into <b>blocks</b>. Must be <b>mounted</b> to a server to access (no direct URL). Low latency, great for OS disks, databases &amp; frequently-modified data.</p>}
      </div>
      <p className="s3-note">🌍 Used by Netflix, Dropbox, Pinterest, iCloud — all store static content as objects. <b>Don't</b> use S3 for databases or millions of tiny files (metadata overhead).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. S3 FEATURES & CONSISTENCY
   ════════════════════════════════════════════════════════════ */
const FEATURES = [
  { ic: "🛡️", t: "11 9s Durability", d: "99.999999999% — virtually no chance of losing an object." },
  { ic: "📈", t: "99.99% Availability", d: "Highly available; data replicated across ≥3 AZs (Standard)." },
  { ic: "♾️", t: "Unlimited storage", d: "Objects from 0 bytes up to 5 TB; virtually unlimited total." },
  { ic: "🕒", t: "Versioning", d: "Keep multiple versions; recover overwritten/deleted objects." },
  { ic: "🗂️", t: "Storage classes", d: "Match cost to access pattern (Standard → Glacier)." },
  { ic: "🔄", t: "Lifecycle rules", d: "Auto-transition & expire objects over time." },
  { ic: "🔐", t: "Encryption", d: "Encrypted by default (at rest); HTTPS in transit." },
  { ic: "🔔", t: "Event notifications", d: "Trigger Lambda/SQS/SNS on upload/delete." },
];
export function S3Features() {
  return (
    <div className="sv-card">
      <div className="sv-title s3-title">⭐ S3 Features &amp; Consistency</div>
      <p className="s3-intro">AWS's first-ever service and its 2nd most popular. Key features:</p>
      <div className="s3-feat-grid">
        {FEATURES.map((f, i) => (
          <div key={i} className="s3-feat">
            <span className="s3-feat-ic">{f.ic}</span>
            <div><div className="s3-feat-t">{f.t}</div><div className="s3-feat-d">{f.d}</div></div>
          </div>
        ))}
      </div>
      <p className="s3-note">🔁 <b>Consistency:</b> <b>read-after-write</b> for NEW objects (available immediately after upload); <b>eventual consistency</b> for overwrites &amp; deletes (changes take a moment to propagate).</p>
      <p className="s3-note">🪣 <b>Bucket naming:</b> globally unique, 3–63 chars, lowercase + numbers + dots/hyphens, must start/end with a letter or number, not an IP. You pay for <b>storage + requests + data transfer</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. STORAGE CLASSES
   ════════════════════════════════════════════════════════════ */
const CLASSES = [
  { id: "standard", t: "S3 Standard", access: "Frequent (>1/month)", az: "≥3 AZs", retr: "ms", price: "~$2.50 / 100GB", min: "—", note: "Default. Highest storage cost, lowest request cost. Real-time, hot data." },
  { id: "ia", t: "Standard-IA", access: "Infrequent (~1/month)", az: "≥3 AZs", retr: "ms", price: "~$1.38 / 100GB", min: "30 days, 128 KB", note: "Cheaper storage but a per-GB retrieval fee. Long-lived, rarely accessed." },
  { id: "onezone", t: "One Zone-IA", access: "Infrequent, recreatable", az: "1 AZ ⚠️", retr: "ms", price: "~$1.10 / 100GB", min: "30 days, 128 KB", note: "Cheapest IA — but only 1 AZ (lost if that AZ fails). For reproducible data / secondary backups." },
  { id: "intelligent", t: "Intelligent-Tiering", access: "Unknown / changing", az: "≥3 AZs", retr: "ms", price: "~$2.30 / 100GB", min: "—", note: "AWS auto-moves objects between tiers. Small monitoring fee per object; NO retrieval fee." },
  { id: "express", t: "Express One Zone", access: "Ultra-low latency", az: "1 AZ (you pick)", retr: "single-digit ms", price: "premium", min: "—", note: "Directory bucket; co-locate with compute for ~10× faster, 50% cheaper requests. Gaming/ML." },
  { id: "ginstant", t: "Glacier Instant", access: "Archive, ~1/quarter", az: "≥3 AZs", retr: "ms", price: "cheap", min: "90 days", note: "Archive with millisecond access. ~68% cheaper than Standard-IA." },
  { id: "gflex", t: "Glacier Flexible", access: "Archive, 1–2/year", az: "≥3 AZs", retr: "mins–hours", price: "cheaper", min: "90 days", note: "Retrieval: Expedited (1–5 min), Standard (3–5 h, free), Bulk (5–12 h). Backups/DR." },
  { id: "deep", t: "Glacier Deep Archive", access: "Very rare", az: "≥3 AZs", retr: "12–48 h", price: "cheapest", min: "180 days", note: "Lowest cost. NO expedited retrieval. 7–10-year compliance archives." },
];
export function StorageClasses() {
  const [sel, setSel] = useState("standard");
  const c = CLASSES.find((x) => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title s3-title">🗂️ S3 Storage Classes</div>
      <p className="s3-intro">Pick the class by <b>how often you access data</b> — the biggest cost lever in S3. Click each:</p>
      <div className="s3-tabs">
        {CLASSES.map((x) => (
          <button key={x.id} className={"s3-tab" + (sel === x.id ? " active" : "")} onClick={() => setSel(x.id)}>{x.t}</button>
        ))}
      </div>
      <div className="s3-detail">
        <b>{c.t}</b>
        <div className="s3-class-stats">
          <span><small>Access</small>{c.access}</span>
          <span><small>AZs</small>{c.az}</span>
          <span><small>Retrieval</small>{c.retr}</span>
          <span><small>Min</small>{c.min}</span>
        </div>
        <p>{c.note}</p>
      </div>
      <p className="s3-note">💡 All give <b>11 9s durability</b>. IA/One-Zone/Glacier add a <b>retrieval fee</b> — storing hot data there ends up costing MORE. Match class to real access pattern.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. EXPRESS ONE ZONE (latency co-location)
   ════════════════════════════════════════════════════════════ */
export function ExpressOneZone() {
  const [coloc, setColoc] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title s3-title">⚡ S3 Express One Zone</div>
      <p className="s3-intro">
        For latency-sensitive apps (gaming, ML). It uses a <b>directory bucket</b> where you <b>choose the AZ</b> — so you can
        co-locate storage with your compute for <b>single-digit-millisecond</b> access. Toggle placement:
      </p>
      <div className="s3-toggle">
        <button className={!coloc ? "active" : ""} onClick={() => setColoc(false)}>🗺️ Different AZ</button>
        <button className={coloc ? "active" : ""} onClick={() => setColoc(true)}>📍 Same AZ (co-located)</button>
      </div>
      <div className="s3-eoz">
        <div className="s3-eoz-az">
          <div className="s3-eoz-lbl">AZ-1</div>
          <div className="s3-eoz-box">🖥️ EC2 app</div>
          {coloc && <div className="s3-eoz-box hot">📦 Express bucket</div>}
        </div>
        <div className={"s3-eoz-link" + (coloc ? " fast" : " slow")}>{coloc ? "⚡ <ms" : "🐢 cross-AZ latency"}</div>
        {!coloc && (
          <div className="s3-eoz-az">
            <div className="s3-eoz-lbl">AZ-2</div>
            <div className="s3-eoz-box">📦 bucket</div>
          </div>
        )}
      </div>
      <p className="s3-note">📌 Directory bucket = single AZ you select. Co-locating with the app cuts cross-AZ hops → fastest access. ~10× faster &amp; 50% lower request cost than Standard (only some regions).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. VERSIONING
   ════════════════════════════════════════════════════════════ */
export function Versioning() {
  const [on, setOn] = useState(true);
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title s3-title">🕒 S3 Versioning</div>
      <p className="s3-intro">
        Versioning keeps multiple versions of an object so you can recover overwritten <b>or deleted</b> files. Toggle it, then delete:
      </p>
      <div className="s3-toggle">
        <button className={!on ? "active" : ""} onClick={() => { setOn(false); setDeleted(false); }}>Versioning OFF</button>
        <button className={on ? "active" : ""} onClick={() => { setOn(true); setDeleted(false); }}>Versioning ON</button>
      </div>
      <div className="s3-ver-stack">
        {!on ? (
          deleted
            ? <div className="s3-ver-gone">❌ file gone — permanently deleted, unrecoverable</div>
            : <div className="s3-ver-row cur">📄 file.txt <small>only copy</small></div>
        ) : (
          <>
            {deleted && <div className="s3-ver-row marker">🪦 delete marker <small>current version</small></div>}
            <div className={"s3-ver-row" + (deleted ? " prev" : " cur")}>📄 file.txt v2 <small>{deleted ? "previous (recoverable)" : "current"}</small></div>
            <div className="s3-ver-row prev">📄 file.txt v1 <small>previous</small></div>
          </>
        )}
      </div>
      <button className="s3-btn" onClick={() => setDeleted(!deleted)}>{deleted ? "↺ Reset" : "🗑️ Delete file"}</button>
      <p className={"s3-note " + (on ? "ok" : "warn")}>
        {on
          ? "✅ Delete just adds a delete marker (new current version); the real file becomes a previous version. Remove the delete marker → file restored. Permanent delete = delete the specific version."
          : "⚠️ Without versioning, an overwrite replaces the file and a delete is permanent — no recovery."}
      </p>
      <p className="s3-note">📌 Once enabled, versioning can only be <b>suspended</b>, not disabled. You pay for every stored version.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. LIFECYCLE RULES
   ════════════════════════════════════════════════════════════ */
const LC_STEPS = [
  { day: "Day 0", cls: "S3 Standard", c: "#3fb950" },
  { day: "30 days", cls: "Standard-IA", c: "#58a6ff" },
  { day: "90 days", cls: "One Zone-IA", c: "#1f6feb" },
  { day: "1 year", cls: "Glacier Flexible", c: "#a371f7" },
  { day: "3 years", cls: "Glacier Deep Archive", c: "#8957e5" },
  { day: "10 years", cls: "Expire (delete)", c: "#f85149" },
];
export function LifecycleRules() {
  const [step, setStep] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title s3-title">🔄 Lifecycle Rules</div>
      <p className="s3-intro">
        Automate moving objects to cheaper classes (and expiring them) over time — huge cost savings, no manual work. Step through a policy:
      </p>
      <div className="s3-lc-track">
        {LC_STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <button className={"s3-lc-node" + (step >= i ? " on" : "")} style={step >= i ? { borderColor: s.c, color: s.c } : {}} onClick={() => setStep(i)}>{i + 1}</button>
            {i < LC_STEPS.length - 1 && <div className={"s3-lc-line" + (step > i ? " on" : "")} />}
          </React.Fragment>
        ))}
      </div>
      <div className="s3-detail" style={{ borderLeftColor: LC_STEPS[step].c }}>
        <b style={{ color: LC_STEPS[step].c }}>{LC_STEPS[step].day} → {LC_STEPS[step].cls}</b>
        <p>{step === 0 ? "Objects are uploaded to Standard (hot data)." : step === LC_STEPS.length - 1 ? "Objects expire and are permanently deleted (also clean up delete markers / old versions)." : `After ${LC_STEPS[step].day}, objects auto-transition to ${LC_STEPS[step].cls} to cut cost.`}</p>
      </div>
      <p className="s3-note">🎯 <b>Filter</b> which objects a rule applies to by <b>prefix</b> (folder), <b>object tag</b>, or <b>size</b>. Rules apply to <b>current</b> and/or <b>non-current</b> versions. Standard → Standard-IA needs a minimum of 30 days.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. ACCESS CONTROL (3 layers + deny wins)
   ════════════════════════════════════════════════════════════ */
export function AccessControl() {
  const [iam, setIam] = useState("none");
  const [bucket, setBucket] = useState("allow");
  const [acl, setAcl] = useState("none");
  const anyDeny = [iam, bucket, acl].includes("deny");
  const anyAllow = [iam, bucket, acl].includes("allow");
  const granted = !anyDeny && anyAllow;
  const cycle = (v, set) => set(v === "none" ? "allow" : v === "allow" ? "deny" : "none");
  return (
    <div className="sv-card">
      <div className="sv-title s3-title">🔒 Controlling Bucket Access</div>
      <p className="s3-intro">
        Three layers grant access: <b>IAM policy</b>, <b>Bucket policy</b>, and (legacy) <b>ACL</b>. Click each to cycle
        none → allow → deny. Rule: <b>any explicit DENY wins; otherwise at least one ALLOW grants access.</b>
      </p>
      <div className="s3-acl-layers">
        {[["IAM policy", iam, setIam], ["Bucket policy", bucket, setBucket], ["ACL", acl, setAcl]].map(([label, v, set], i) => (
          <button key={i} className={"s3-acl-layer " + v} onClick={() => cycle(v, set)}>
            <span>{label}</span>
            <b>{v === "none" ? "— none" : v === "allow" ? "✅ allow" : "⛔ deny"}</b>
          </button>
        ))}
      </div>
      <div className={"s3-acl-verdict " + (granted ? "ok" : "bad")}>
        {granted ? "✅ Access GRANTED" : anyDeny ? "⛔ DENIED — an explicit deny overrides everything" : "⛔ DENIED — no allow anywhere (default deny)"}
      </div>
      <p className="s3-note">📌 Default is <b>deny</b>. A single deny at any layer blocks access. Otherwise one allow (with no policy at the other layers) is enough.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. IAM vs BUCKET POLICY
   ════════════════════════════════════════════════════════════ */
const IBP_ROWS = [
  ["Set from", "IAM console", "S3 bucket → Permissions"],
  ["Attached to", "IAM user/group/role", "The bucket (resource)"],
  ["Type", "Identity-based", "Resource-based"],
  ["Needs Principal?", "No (it IS the identity)", "Yes (specify the ARN)"],
  ["Scope", "Any AWS service", "That one bucket only"],
  ["Cross-account", "Possible but complex", "Easy"],
  ["Public access", "❌ Not possible", "✅ Possible"],
];
export function IAMvsBucketPolicy() {
  return (
    <div className="sv-card">
      <div className="sv-title s3-title">⚖️ IAM Policy vs Bucket Policy</div>
      <p className="s3-intro">Both are JSON. The difference is what they attach to and their scope:</p>
      <div className="s3-table">
        <div className="s3-row head"><span className="feat">Aspect</span><span className="a">👤 IAM Policy</span><span className="b">🪣 Bucket Policy</span></div>
        {IBP_ROWS.map((r, i) => (
          <div key={i} className="s3-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="s3-note">🧠 Grant a user access to <b>many services</b> → IAM policy. Control <b>one bucket</b>, cross-account, or <b>public</b> access → bucket policy (needs a <code>Principal</code>). Note: console (GUI) browsing also needs <code>s3:ListAllMyBuckets</code>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. OBJECT LOCK
   ════════════════════════════════════════════════════════════ */
export function ObjectLock() {
  const [mode, setMode] = useState("compliance");
  return (
    <div className="sv-card">
      <div className="sv-title s3-title">🔏 S3 Object Lock (WORM)</div>
      <p className="s3-intro">
        Object Lock prevents objects being deleted/overwritten for a fixed time (or indefinitely) — for compliance (e.g. RBI
        retention). <b>Requires versioning</b> and can't be disabled once enabled. Two retention modes:
      </p>
      <div className="s3-toggle">
        <button className={mode === "governance" ? "active" : ""} onClick={() => setMode("governance")}>🛡️ Governance</button>
        <button className={mode === "compliance" ? "active" : ""} onClick={() => setMode("compliance")}>🔒 Compliance</button>
      </div>
      <div className="s3-detail">
        {mode === "governance"
          ? <p><b>Governance mode (soft):</b> objects are locked, but a user with special permissions (<code>s3:BypassGovernanceRetention</code>) — or the root user — can override and delete early.</p>
          : <p><b>Compliance mode (strict):</b> NO ONE — not even the root account — can delete or change the object until the retention period ends. True immutability.</p>}
      </div>
      <p className="s3-note">📌 <b>Retention period</b> = fixed duration (days/years). <b>Legal hold</b> = lock with <b>no expiry</b>, toggled on/off manually (e.g. ongoing legal investigation).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   10. ENCRYPTION
   ════════════════════════════════════════════════════════════ */
export function S3Encryption() {
  const [decoded, setDecoded] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title s3-title">🔐 S3 Encryption</div>
      <p className="s3-intro">
        Encryption scrambles data so only someone with the <b>key</b> can read it — protecting <b>confidentiality</b> &amp;
        <b> integrity</b>. Try the key on this message:
      </p>
      <div className="s3-enc-msg">{decoded ? "I LOVE MY INDIA" : "L ORYH PB LQGLD"}</div>
      <button className="s3-btn" onClick={() => setDecoded(!decoded)}>{decoded ? "🔒 Encrypt" : "🔑 Apply key (shift −3)"}</button>
      <p className="s3-note">🔑 Without the key it's gibberish; with the key it's readable. Modern AWS encryption is transparent &amp; automatic.</p>
      <div className="s3-enc-grid">
        <div className="s3-enc-card"><b>📥 At rest</b><p>Data stored in S3 is encrypted (default ON). <b>SSE-S3</b> (AWS-managed key), <b>SSE-KMS</b> (your KMS key, auditable), or <b>SSE-C</b> (you supply the key). Even AWS can't read it.</p></div>
        <div className="s3-enc-card"><b>🚚 In transit</b><p>Data moving to/from S3 is protected by <b>HTTPS (TLS/SSL)</b> — prevents interception. No config needed.</p></div>
      </div>
    </div>
  );
}
