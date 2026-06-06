import React, { useState } from "react";
import "./SecurityServicesVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. SSL/TLS & ACM
   ════════════════════════════════════════════════════════════ */
export function ACMVisual() {
  const [step, setStep] = useState(0);
  const steps = [
    { t: "1 · Browser requests site", d: "Your browser opens https://site — and asks the server to prove its identity for a secure connection." },
    { t: "2 · Server sends certificate + public key", d: "The server returns its TLS certificate (containing its public key), issued & signed by a Certificate Authority (CA)." },
    { t: "3 · Browser validates the CA", d: "The browser checks the certificate was signed by a trusted CA. Invalid → 'Not secure' warning." },
    { t: "4 · Key exchange (asymmetric → symmetric)", d: "The browser creates a secret key, encrypts it with the server's public key; only the server's private key can decrypt it. Now both share a key." },
    { t: "5 · Encrypted session", d: "All traffic is now encrypted (HTTPS) — authentication, encryption & integrity achieved." },
  ];
  return (
    <div className="sv-card">
      <div className="sv-title sec-title">🔐 SSL/TLS &amp; AWS Certificate Manager (ACM)</div>
      <p className="sec-intro">
        <b>TLS</b> (successor of SSL) gives HTTPS its <b>authentication, encryption &amp; integrity</b>. A <b>Certificate
        Authority (CA)</b> issues the certificate that browsers trust. Step through the handshake:
      </p>
      <div className="sec-track">
        {steps.map((s, i) => (
          <button key={i} className={"sec-node" + (step >= i ? " on" : "")} onClick={() => setStep(i)}>{i + 1}</button>
        ))}
      </div>
      <div className="sec-detail"><b>{steps[step].t}</b><p>{steps[step].d}</p></div>
      <p className="sec-note">📌 <b>ACM</b> is AWS's CA — issues/manages free TLS certs (with **DNS** or email validation) deployed on <b>ELB, CloudFront, API Gateway, Elastic Beanstalk</b>. <b>Free</b> when used with these AWS services. Edge/CloudFront certs must be in <b>us-east-1</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. ENCRYPTION KEYS — symmetric vs asymmetric
   ════════════════════════════════════════════════════════════ */
export function EncryptionKeys() {
  const [mode, setMode] = useState("sym");
  return (
    <div className="sv-card">
      <div className="sv-title sec-title">🔑 Symmetric vs Asymmetric Keys</div>
      <p className="sec-intro">Encryption scrambles data; a <b>key</b> unlocks it. Two key models:</p>
      <div className="sec-toggle">
        <button className={mode === "sym" ? "active" : ""} onClick={() => setMode("sym")}>🔒 Symmetric</button>
        <button className={mode === "asym" ? "active" : ""} onClick={() => setMode("asym")}>🗝️ Asymmetric</button>
      </div>
      <div className="sec-keyviz">
        {mode === "sym" ? (
          <><div className="sec-keybox">🔑 same key</div><div className="sec-keyarr">encrypt ⇄ decrypt</div><div className="sec-keybox">🔑 same key</div></>
        ) : (
          <><div className="sec-keybox">🔓 public key<small>encrypt</small></div><div className="sec-keyarr">→ pair →</div><div className="sec-keybox">🔐 private key<small>decrypt</small></div></>
        )}
      </div>
      <div className="sec-detail">
        {mode === "sym"
          ? <p><b>Symmetric</b> — ONE shared key encrypts &amp; decrypts. Fast, but the key must stay secret & shared safely. (AES, 3DES, DES.)</p>
          : <p><b>Asymmetric</b> — a math-linked <b>public</b> (shared) + <b>private</b> (secret) key pair. Data encrypted with public can only be decrypted with private (and vice-versa). Slower but enables HTTPS &amp; signatures. (RSA, Diffie-Hellman.)</p>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. KMS
   ════════════════════════════════════════════════════════════ */
const KMS_ROWS = [
  ["Created/managed by", "AWS", "You (customer)"],
  ["Rotation period", "Every 3 years (fixed)", "1 year (configurable)"],
  ["Can delete?", "❌ No", "✅ Yes"],
  ["Use outside AWS", "❌ No", "✅ Yes (envelope encryption)"],
  ["Key prefix", "aws/…", "your own alias"],
];
export function KMSVisual() {
  return (
    <div className="sv-card">
      <div className="sv-title sec-title">🗝️ KMS – Key Management Service</div>
      <p className="sec-intro">
        <b>KMS</b> creates &amp; manages encryption keys (CMKs) and integrates with EBS, S3, RDS, Redshift, etc. — tick
        "encrypt" and pick a key. Two key types:
      </p>
      <div className="sec-table">
        <div className="sec-row head"><span className="feat">Aspect</span><span className="a">AWS-managed CMK</span><span className="b">Customer-managed CMK</span></div>
        {KMS_ROWS.map((r, i) => (
          <div key={i} className="sec-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="sec-note">🔁 <b>Exam:</b> need a <b>1-year rotation</b> or to <b>delete</b> the key or use it <b>outside AWS</b> → <b>customer-managed</b> CMK. Keys are <b>region-bound</b> (can't move regions). Used for <b>encryption at rest</b> (vs ACM/TLS = in transit).</p>
      <p className="sec-note">📦 <b>Envelope encryption:</b> the CMK encrypts a <b>data key</b>, and the data key encrypts your actual data (up to 4 KB per CMK call). Only principals with key permission can decrypt.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. STS
   ════════════════════════════════════════════════════════════ */
export function STSVisual() {
  const [mode, setMode] = useState("enterprise");
  return (
    <div className="sv-card">
      <div className="sv-title sec-title">🎫 STS – Security Token Service</div>
      <p className="sec-intro">
        <b>STS</b> issues <b>temporary</b>, short-lived credentials (minutes–hours) — not stored with a user, generated on
        demand. (IAM = permanent; STS = temporary.) Main use: <b>identity federation</b>. Two types:
      </p>
      <div className="sec-toggle">
        <button className={mode === "enterprise" ? "active" : ""} onClick={() => setMode("enterprise")}>🏢 Enterprise Federation</button>
        <button className={mode === "web" ? "active" : ""} onClick={() => setMode("web")}>🌐 Web Identity Federation</button>
      </div>
      <div className="sec-detail">
        {mode === "enterprise"
          ? <p><b>Enterprise federation</b> — let your org's existing users (e.g. <b>Active Directory</b>) access AWS without new IAM identities, via <b>SAML 2.0</b> + AWS ADFS → <b>single sign-on</b>.</p>
          : <p><b>Web identity federation</b> — let users sign in with <b>Google / Facebook / Amazon / OpenID Connect</b>, then exchange that token for temporary AWS permissions.</p>}
      </div>
      <p className="sec-note">📌 Benefits: no long-term credentials to embed/rotate, no need to create IAM users, credentials auto-expire. *(More a Developer-exam topic — recognize it as an option.)*</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. WAF
   ════════════════════════════════════════════════════════════ */
export function WAFVisual() {
  const [action, setAction] = useState("block");
  return (
    <div className="sv-card">
      <div className="sv-title sec-title">🛡️ WAF – Web Application Firewall</div>
      <p className="sec-intro">
        <b>WAF</b> is a layer-7 firewall that monitors/blocks/allows HTTP requests to <b>ALB, CloudFront, API Gateway &amp;
        AppSync</b> (not directly to EC2). Rules match by <b>IP, country, or string/regex</b>. Pick a rule action:
      </p>
      <div className="sec-toggle">
        <button className={action === "count" ? "active" : ""} onClick={() => setAction("count")}>🔢 Count</button>
        <button className={action === "allow" ? "active" : ""} onClick={() => setAction("allow")}>✅ Allow</button>
        <button className={action === "block" ? "active" : ""} onClick={() => setAction("block")}>⛔ Block</button>
      </div>
      <div className="sec-waf-flow">
        <div className="sec-waf-node">🌐 Request</div>
        <div className="sec-waf-acl">🛡️ Web ACL<small>rules + IP sets</small></div>
        <div className={"sec-waf-verdict " + action}>
          {action === "count" ? "🔢 counted (monitor only)" : action === "allow" ? "✅ → reaches app" : "⛔ 403 blocked"}
        </div>
        <div className="sec-waf-node">🖥️ App (ALB)</div>
      </div>
      <div className="sec-detail">
        {action === "count" && <p><b>Count</b> — monitor matching requests without blocking (to check if it's really an attack first).</p>}
        {action === "allow" && <p><b>Allow</b> — permit matching requests (e.g. allow only office IPs; default-deny everything else).</p>}
        {action === "block" && <p><b>Block</b> — reject matching requests with <b>403</b> (e.g. block an attacker's IP set).</p>}
      </div>
      <p className="sec-note">📌 Build with <b>IP sets</b> + a <b>Web ACL</b> (capacity in WCU). <b>AWS Managed Rules</b> give ready-made protections (SQL injection, XSS, bad bots, IP reputation). <i>AWS Shield</i> handles DDoS.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. CLOUDHSM
   ════════════════════════════════════════════════════════════ */
export function CloudHSMVisual() {
  return (
    <div className="sv-card">
      <div className="sv-title sec-title">🔒 CloudHSM (Hardware Security Module)</div>
      <p className="sec-intro">
        An <b>HSM</b> is dedicated tamper-proof hardware for generating/storing cryptographic keys (used by CAs, banks —
        often a <b>compliance requirement</b>). <b>CloudHSM</b> gives you a managed, single-tenant HSM in the cloud — no
        hardware to buy.
      </p>
      <div className="sec-hsm-grid">
        <div className="sec-hsm-card"><b>🔑 Your own keys</b><p>Generate &amp; use encryption keys you fully control on dedicated hardware.</p></div>
        <div className="sec-hsm-card"><b>📜 Standards-compliant</b><p>FIPS 140-2 Level 3; keys are exportable to other commercial HSMs.</p></div>
        <div className="sec-hsm-card"><b>⚙️ Fully managed</b><p>AWS handles provisioning, patching, HA &amp; backups; deploy in a cluster across AZs.</p></div>
        <div className="sec-hsm-card"><b>📈 Scalable</b><p>Add/remove HSM capacity on demand, no upfront cost.</p></div>
      </div>
      <p className="sec-note">🔁 <b>KMS vs CloudHSM:</b> KMS is multi-tenant &amp; AWS-managed (easy, shared); <b>CloudHSM</b> is single-tenant dedicated hardware you control — for strict compliance &amp; running your own CA.</p>
    </div>
  );
}
