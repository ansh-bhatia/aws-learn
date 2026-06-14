import React, { useState } from "react";
import "./S3Visuals2.css";

/* ════════════════════════════════════════════════════════════
   1. SYMMETRIC vs ASYMMETRIC ENCRYPTION
   ════════════════════════════════════════════════════════════ */
export function SymmetricAsymmetric() {
  const [mode, setMode] = useState("sym");
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">🔑 Symmetric vs Asymmetric Encryption</div>
      <p className="s3b-intro">
        Every encryption needs a <b>key</b>. The number of keys is what separates the two families — and S3 always uses the symmetric kind.
      </p>
      <div className="s3b-toggle">
        <button className={mode === "sym" ? "active" : ""} onClick={() => setMode("sym")}>1 key · Symmetric</button>
        <button className={mode === "asym" ? "active" : ""} onClick={() => setMode("asym")}>2 keys · Asymmetric</button>
      </div>
      <div className="s3b-flow">
        <div className="s3b-flow-box">📄 Plaintext</div>
        <div className="s3b-flow-arrow">🔒<small>{mode === "sym" ? "🔑 shared key" : "🔑 public key"}</small></div>
        <div className="s3b-flow-box hot">🔐 Ciphertext</div>
        <div className="s3b-flow-arrow">🔓<small>{mode === "sym" ? "🔑 same key" : "🗝️ private key"}</small></div>
        <div className="s3b-flow-box">📄 Plaintext</div>
      </div>
      <div className="s3b-detail">
        {mode === "sym"
          ? <p><b>Symmetric — one shared key</b> encrypts AND decrypts. Fast &amp; efficient for large amounts of data, so it's what S3 uses. Standards: <b>AES</b> (128 / 192 / <b>256-bit</b>) and 3DES. <b>AES-256</b> is the most secure and is S3's default. Weakness: you must securely transport that single key to anyone who needs to decrypt.</p>
          : <p><b>Asymmetric — two mathematically-related keys:</b> a <b>public key</b> encrypts, a separate <b>private key</b> decrypts. Stronger (even if the public key + ciphertext leak, you can't decrypt without the private key) but slower for large data. Algorithms: <b>RSA, ECC, Diffie-Hellman</b>. Used by EC2 key pairs (.pem files), not by S3.</p>}
      </div>
      <p className="s3b-note">📌 Exam: <b>AWS S3 uses symmetric AES-256 encryption.</b> Asymmetric shows up with EC2 key pairs &amp; certificate authorities.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. SERVER-SIDE vs CLIENT-SIDE ENCRYPTION
   ════════════════════════════════════════════════════════════ */
const SSE_CSE = [
  { k: "Where it happens", sse: "On the S3 server — you send plaintext, S3 encrypts before storing", cse: "On your side — you encrypt before sending to S3" },
  { k: "Key management", sse: "AWS can manage (SSE-S3 / SSE-KMS) or you provide (SSE-C)", cse: "Entirely your responsibility" },
  { k: "Ease of use", sse: "Easy — SSE-S3 is fully transparent, nothing to manage", cse: "Complex — needs SDK / OpenSSL / GnuPG + key handling" },
  { k: "In transit", sse: "Data is plaintext, so you MUST use HTTPS to be secure", cse: "Already encrypted — safe even over HTTP" },
  { k: "Console support", sse: "3 options shown in console (SSE-C is CLI-only)", cse: "No console option — role of S3 is nil" },
];
export function ServerVsClientEnc() {
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">🖥️ Server-Side vs Client-Side Encryption</div>
      <p className="s3b-intro">The first big fork: <b>who</b> does the encrypting?</p>
      <div className="s3b-cmp">
        <div className="s3b-cmp-head"><span className="feat">Aspect</span><span className="a">Server-Side (SSE)</span><span className="b">Client-Side (CSE)</span></div>
        {SSE_CSE.map((r, i) => (
          <div key={i} className="s3b-cmp-row"><span className="feat">{r.k}</span><span>{r.sse}</span><span>{r.cse}</span></div>
        ))}
      </div>
      <p className="s3b-note ok">SSE-S3 is the <b>default</b> — encryption is now mandatory on every S3 object. CSE gives maximum control for strict/regulatory compliance where AWS-managed options aren't enough.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. FOUR SSE OPTIONS COMPARISON
   ════════════════════════════════════════════════════════════ */
const SSE_OPTS = [
  { id: "s3", name: "SSE-S3", tag: "Default · Free", desc: "Amazon manages the keys entirely with AES-256. Fully transparent — nothing for you to do.", who: "AWS", control: "None — can't rotate, disable or audit keys", cost: "Free (included)", use: "Basic encryption with zero management" },
  { id: "kms", name: "SSE-KMS", tag: "Auditable", desc: "Keys live in AWS KMS. Choose AWS-managed key or your own Customer Managed Key (CMK).", who: "AWS KMS", control: "CMK: full control + rotation + CloudTrail audit", cost: "Extra KMS charges", use: "Compliance + audit + key control" },
  { id: "dsse", name: "DSSE-KMS", tag: "Dual layer", desc: "Two layers: SSE-S3 first, then SSE-KMS. Added for US gov (FIPS / CNSSP-15) multi-layer requirement.", who: "S3 + KMS", control: "Same KMS control as SSE-KMS, twice encrypted", cost: "Extra (KMS)", use: "Government / highest-assurance compliance" },
  { id: "c", name: "SSE-C", tag: "CLI only", desc: "You provide the key on every upload/download. AWS encrypts but never stores your key.", who: "You (customer)", control: "Total — AWS never sees/keeps the key", cost: "S3 storage only", use: "You must own the keys; not in console" },
];
export function SSEOptions() {
  const [sel, setSel] = useState("s3");
  const o = SSE_OPTS.find(x => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">🔐 The 4 Server-Side Encryption Options</div>
      <div className="s3b-tabs">
        {SSE_OPTS.map(x => (
          <button key={x.id} className={`s3b-tab ${sel === x.id ? "active" : ""}`} onClick={() => setSel(x.id)}>{x.name}</button>
        ))}
      </div>
      <div className="s3b-detail">
        <b>{o.name} <span className="s3b-pill">{o.tag}</span></b>
        <p>{o.desc}</p>
        <div className="s3b-mini">
          <span><small>KEY MANAGED BY</small>{o.who}</span>
          <span><small>YOUR CONTROL</small>{o.control}</span>
          <span><small>COST</small>{o.cost}</span>
          <span><small>USE WHEN</small>{o.use}</span>
        </div>
      </div>
      <p className="s3b-note">Order of control: <b>SSE-S3</b> (none) → <b>SSE-KMS / DSSE-KMS</b> (managed + audit) → <b>SSE-C</b> (you own everything). Encryption can be set per-bucket (default) and overridden per-object.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. SSE-KMS ACCESS DEMO (Amit has key, Ravi doesn't)
   ════════════════════════════════════════════════════════════ */
export function KMSAccessDemo() {
  const [user, setUser] = useState("amit");
  const hasKey = user === "amit";
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">🗝️ SSE-KMS — Why IAM Access Isn't Enough</div>
      <p className="s3b-intro">
        Both Amit &amp; Ravi have <code>S3 read-only</code>. The bucket is encrypted with a customer-managed KMS key — but only <b>Amit</b> is a key user. Switch users:
      </p>
      <div className="s3b-toggle">
        <button className={user === "amit" ? "active" : ""} onClick={() => setUser("amit")}>👤 Amit (key user)</button>
        <button className={user === "ravi" ? "active" : ""} onClick={() => setUser("ravi")}>👤 Ravi (no key)</button>
      </div>
      <div className="s3b-checks">
        <div className="s3b-check ok">✅ IAM: S3 read-only access</div>
        <div className={`s3b-check ${hasKey ? "ok" : "bad"}`}>{hasKey ? "✅" : "❌"} KMS: permission to use the Fox key</div>
      </div>
      <div className={`s3b-verdict ${hasKey ? "ok" : "bad"}`}>
        {hasKey
          ? "🔓 Access granted — object decrypts transparently, open & download work"
          : "🚫 \"not authorized to perform kms:Decrypt\" — IAM allows it, but no KMS key = blocked"}
      </div>
      <p className="s3b-note">📌 Exam favourite: with SSE-KMS you need <b>both</b> S3 permission <b>and</b> KMS key permission. KMS adds full control, rotation, and CloudTrail auditing — at extra cost.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. SSE-C CLI FLOW
   ════════════════════════════════════════════════════════════ */
export function SSECFlow() {
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">🛠️ SSE-C — Customer-Provided Key (CLI only)</div>
      <p className="s3b-intro">SSE-C is hidden from the console. You generate the key, supply it on every request, and AWS never stores it.</p>
      <div className="s3b-steps">
        <div className="s3b-step"><span>1</span><div><b>Generate a 256-bit key</b><code>openssl rand 32 &gt; sse.key</code></div></div>
        <div className="s3b-step"><span>2</span><div><b>Base64 + MD5 the key</b><code>base64 sse.key → $key  ·  md5 → $keyMD5</code></div></div>
        <div className="s3b-step"><span>3</span><div><b>Upload WITH the key</b><code>aws s3api put-object … --sse-customer-key $key --sse-customer-key-md5 $keyMD5</code></div></div>
        <div className="s3b-step"><span>4</span><div><b>Download — supply key again</b><code>aws s3api get-object … --sse-customer-key $key</code></div></div>
      </div>
      <p className="s3b-note warn">Lose the key = lose the data forever. The console can't open the object (no way to pass a key). Only the key holder on Earth can read it.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. ACL vs BUCKET POLICY (two ways to grant public access)
   ════════════════════════════════════════════════════════════ */
export function PublicAccessWays() {
  const [way, setWay] = useState("policy");
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">🌐 Two Ways to Grant Public Access</div>
      <p className="s3b-intro">By default every object is <b>private</b>. To intentionally make something public you have two mechanisms:</p>
      <div className="s3b-toggle">
        <button className={way === "acl" ? "active" : ""} onClick={() => setWay("acl")}>📜 ACL (old)</button>
        <button className={way === "policy" ? "active" : ""} onClick={() => setWay("policy")}>📄 Bucket Policy ✅</button>
      </div>
      <div className="s3b-detail">
        {way === "acl"
          ? <p><b>Access Control List</b> — per-object permissions, the <b>older</b> and less-flexible way. <b>Disabled by default</b> (greyed out) — you must switch ownership to "bucket owner enforced" to even use them. <b>AWS does not recommend ACLs.</b></p>
          : <p><b>Bucket Policy</b> — a JSON document attached to the bucket defining who can do what. The <b>recommended</b> way: centralized, supports cross-account, and pairs with the Policy Generator. This is what you'll use for public sharing &amp; static hosting.</p>}
      </div>
      <p className="s3b-note warn">⚠️ Both will <b>fail</b> while <b>Block Public Access</b> is on (it's on by default) — that's the master switch you must turn off first.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. BLOCK PUBLIC ACCESS — 4 settings
   ════════════════════════════════════════════════════════════ */
const BPA = [
  { t: "New ACLs", d: "Blocks public access granted through NEW ACLs only. Existing public ACLs are unaffected." },
  { t: "Any ACL (new + existing)", d: "Blocks public access via existing AND new ACLs. Stronger — strips current public ACLs too." },
  { t: "New bucket policies", d: "Prevents creating NEW bucket/access-point policies that grant public access. Existing policies unaffected." },
  { t: "Any policy + cross-account", d: "Blocks public AND cross-account access via existing/new policies. Strictest level." },
];
export function BlockPublicAccess() {
  const [on, setOn] = useState([true, true, true, true]);
  const allOn = on.every(Boolean);
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">🛡️ Block Public Access — the Master Switch</div>
      <p className="s3b-intro">
        Set at <b>account level</b> (overrides everything) or <b>bucket level</b>. By default it's <b>ON</b>, which is why your public attempts fail. Toggle the 4 sub-settings:
      </p>
      {BPA.map((b, i) => (
        <div key={i} className={`s3b-bpa ${on[i] ? "on" : "off"}`} onClick={() => setOn(p => p.map((v, j) => j === i ? !v : v))}>
          <span className="s3b-bpa-sw">{on[i] ? "🔒" : "🔓"}</span>
          <div><b>{b.t}</b><p>{b.d}</p></div>
        </div>
      ))}
      <div className={`s3b-verdict ${allOn ? "bad" : "ok"}`}>
        {allOn ? "🔒 Fully blocked — no object can be made public" : on.some(Boolean) ? "⚠️ Partially blocked — some public paths still closed" : "🔓 All off — public access now possible (be careful!)"}
      </div>
      <p className="s3b-note">📌 Account-level setting <b>takes precedence</b> over bucket-level. If account-level is on, a bucket can't be public even if its own switch is off.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. BUCKET POLICY JSON ANATOMY
   ════════════════════════════════════════════════════════════ */
const POLICY_PARTS = [
  { k: "Version", v: '"2012-10-17"', d: "Policy language version (always this date for S3)." },
  { k: "Statement", v: "[ … ]", d: "Array holding one or more permission statements." },
  { k: "Sid", v: '"PublicRead"', d: "Optional statement identifier / name." },
  { k: "Effect", v: '"Allow"', d: "Allow or Deny — the only two effects." },
  { k: "Principal", v: '"*"', d: "Who it applies to. * = everyone = public access." },
  { k: "Action", v: '"s3:GetObject"', d: "What's allowed — here, read/download objects." },
  { k: "Resource", v: '"arn:aws:s3:::bucket/*"', d: "Bucket ARN + /* = every object in the bucket." },
];
export function BucketPolicyAnatomy() {
  const [sel, setSel] = useState(4);
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">📄 Bucket Policy Anatomy</div>
      <p className="s3b-intro">A public-read policy, decoded. Click a key (tip: use the <b>Policy Generator</b> instead of hand-writing JSON):</p>
      <div className="s3b-json">
        {POLICY_PARTS.map((p, i) => (
          <div key={i} className={`s3b-json-row ${sel === i ? "active" : ""}`} onClick={() => setSel(i)}>
            <span className="s3b-json-k">"{p.k}":</span> <span className="s3b-json-v">{p.v}</span>
          </div>
        ))}
      </div>
      <div className="s3b-detail"><b>{POLICY_PARTS[sel].k}</b><p>{POLICY_PARTS[sel].d}</p></div>
      <p className="s3b-note ok"><code>Principal: "*"</code> + <code>s3:GetObject</code> + <code>bucket/*</code> = every object publicly readable.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. STATIC WEBSITE HOSTING
   ════════════════════════════════════════════════════════════ */
export function StaticHosting() {
  const [tab, setTab] = useState("how");
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">🌍 S3 Static Website Hosting</div>
      <div className="s3b-tabs">
        <button className={`s3b-tab ${tab === "how" ? "active" : ""}`} onClick={() => setTab("how")}>Setup</button>
        <button className={`s3b-tab ${tab === "static" ? "active" : ""}`} onClick={() => setTab("static")}>Static vs Dynamic</button>
        <button className={`s3b-tab ${tab === "why" ? "active" : ""}`} onClick={() => setTab("why")}>Why S3</button>
      </div>
      {tab === "how" && (
        <div className="s3b-steps">
          <div className="s3b-step"><span>1</span><div><b>Create bucket</b><code>name must match domain, e.g. web.cloudfox.in</code></div></div>
          <div className="s3b-step"><span>2</span><div><b>Upload site files</b><code>index.html, CSS, JS, images</code></div></div>
          <div className="s3b-step"><span>3</span><div><b>Disable Block Public Access + add bucket policy</b><code>Principal *, s3:GetObject</code></div></div>
          <div className="s3b-step"><span>4</span><div><b>Enable Static website hosting</b><code>set index.html (+ optional error page)</code></div></div>
          <div className="s3b-step"><span>5</span><div><b>Point your domain</b><code>Route 53 Alias (A record) or GoDaddy CNAME</code></div></div>
        </div>
      )}
      {tab === "static" && (
        <div className="s3b-cmp">
          <div className="s3b-cmp-head"><span className="feat"> </span><span className="a">Static ✅ S3</span><span className="b">Dynamic ✗</span></div>
          <div className="s3b-cmp-row"><span className="feat">Content</span><span>Fixed, same for all users</span><span>Changes per user / interaction</span></div>
          <div className="s3b-cmp-row"><span className="feat">Tech</span><span>HTML · CSS · JavaScript</span><span>PHP · Node.js (server-side)</span></div>
          <div className="s3b-cmp-row"><span className="feat">Server processing</span><span>None needed</span><span>Required</span></div>
          <div className="s3b-cmp-row"><span className="feat">Examples</span><span>Business/brochure sites (~80-90%)</span><span>Facebook, Twitter</span></div>
        </div>
      )}
      {tab === "why" && (
        <div className="s3b-feat-grid">
          {[["📈","Scalable","100 or 100,000 visitors — same performance"],["💰","Cost-effective","Pay storage + outbound only; inbound free"],["🛡️","11 9s durable","Same availability as amazon.com"],["⚡","Fast + CloudFront","Add CDN for global low latency"],["🧰","Simple","No OS, no servers to manage"],["🔐","Secure","Bucket policy, IAM, AWS security tools"]].map((f,i)=>(
            <div key={i} className="s3b-feat"><span className="s3b-feat-ic">{f[0]}</span><div><div className="s3b-feat-t">{f[1]}</div><div className="s3b-feat-d">{f[2]}</div></div></div>
          ))}
        </div>
      )}
      <p className="s3b-note warn">⚠️ Exam: S3 static hosting is <b>HTTP only</b> — no HTTPS. To get HTTPS, put <b>CloudFront</b> in front.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   10. CORS DEMO
   ════════════════════════════════════════════════════════════ */
export function CORSDemo() {
  const [cors, setCors] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">🔁 Cross-Origin Resource Sharing (CORS)</div>
      <p className="s3b-intro">
        A site in <b>bucket A</b> tries to fetch a file from <b>bucket B</b> (a different origin). Browsers block this by default. Toggle CORS on bucket B:
      </p>
      <div className="s3b-toggle">
        <button className={!cors ? "active" : ""} onClick={() => setCors(false)}>CORS off</button>
        <button className={cors ? "active" : ""} onClick={() => setCors(true)}>CORS on bucket B</button>
      </div>
      <div className="s3b-cors">
        <div className="s3b-cors-box">🌐 Website<small>bucket A</small></div>
        <div className={`s3b-cors-arrow ${cors ? "ok" : "bad"}`}>{cors ? "✅ allowed →" : "⛔ blocked →"}</div>
        <div className="s3b-cors-box">📦 Resource<small>bucket B</small></div>
      </div>
      <div className={`s3b-verdict ${cors ? "ok" : "bad"}`}>
        {cors ? "Request succeeds — file downloads" : "\"CORS request failed\" — browser security blocks cross-origin fetch"}
      </div>
      <p className="s3b-note">Fix: add a <b>CORS JSON rule</b> on the <b>resource bucket (B)</b> — <code>AllowedOrigins: ["*"]</code>, <code>AllowedMethods: [GET,…]</code>. Test in incognito to avoid cached results.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   11. CROSS-REGION REPLICATION (CRR)
   ════════════════════════════════════════════════════════════ */
export function CRRDemo() {
  const [opts, setOpts] = useState({ rtc: false, delMarker: false, existing: false });
  const t = (k) => setOpts(p => ({ ...p, [k]: !p[k] }));
  return (
    <div className="sv-card">
      <div className="sv-title s3b-title">🔄 Cross-Region Replication (CRR)</div>
      <p className="s3b-intro">
        Objects uploaded to a source bucket auto-replicate to a destination bucket in <b>another region</b> — one-way. Requires <b>versioning on both buckets</b> + an IAM role.
      </p>
      <div className="s3b-crr">
        <div className="s3b-crr-box">🇮🇳 source-in<small>ap-south-1 (Mumbai)</small></div>
        <div className="s3b-crr-arrow">⟶ auto ⟶<small>{opts.rtc ? "≤15 min (SLA)" : "minutes–hours"}</small></div>
        <div className="s3b-crr-box hot">🇺🇸 dest-us<small>us-east-1 (Virginia)</small></div>
      </div>
      <div className="s3b-opts">
        <label className={opts.rtc ? "on" : ""} onClick={() => t("rtc")}><b>RTC</b> Replication Time Control — 99.99% within 15 min (SLA) + metrics, extra cost</label>
        <label className={opts.delMarker ? "on" : ""} onClick={() => t("delMarker")}><b>Delete-marker replication</b> {opts.delMarker ? "ON: deletes propagate to destination" : "OFF: destination keeps object even if source deleted"}</label>
        <label className={opts.existing ? "on" : ""} onClick={() => t("existing")}><b>Replicate existing objects</b> {opts.existing ? "ON: backfills old objects too" : "OFF (default): only new/modified objects replicate"}</label>
      </div>
      <p className="s3b-note ok">Benefits: disaster recovery, compliance (off-site/another country), and low-latency access for distant users. You can also <b>change the storage class</b> at the destination (e.g. Standard → Standard-IA) to save money.</p>
      <p className="s3b-note">Replication is <b>one-way</b>; enable <b>replica modification sync</b> to also sync destination changes back to source.</p>
    </div>
  );
}
