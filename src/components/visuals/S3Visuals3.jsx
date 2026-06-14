import React, { useState, useEffect } from "react";
import "./S3Visuals3.css";

/* ════════════════════════════════════════════════════════════
   1. TRANSFER ACCELERATION
   ════════════════════════════════════════════════════════════ */
export function TransferAcceleration() {
  const [accel, setAccel] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title s3c-title">🚀 S3 Transfer Acceleration</div>
      <p className="s3c-intro">
        Uploading from India to a bucket in the US (~17,000 km) over the public internet is slow &amp; inconsistent. Transfer Acceleration routes through the nearest <b>CloudFront edge location</b> then over the <b>AWS global backbone</b>. Toggle it:
      </p>
      <div className="s3c-toggle">
        <button className={!accel ? "active" : ""} onClick={() => setAccel(false)}>Direct upload</button>
        <button className={accel ? "active" : ""} onClick={() => setAccel(true)}>⚡ Accelerated</button>
      </div>
      <div className="s3c-ta">
        <div className="s3c-ta-row">
          <span>You 🇮🇳</span>
          {accel
            ? <span className="s3c-ta-path fast">→ nearest edge → AWS backbone →</span>
            : <span className="s3c-ta-path slow">→ public internet (17,000 km) →</span>}
          <span>Bucket 🇺🇸</span>
        </div>
        <div className="s3c-ta-bar"><div className={`s3c-ta-fill ${accel ? "fast" : "slow"}`} style={{ width: accel ? "100%" : "28%" }}>{accel ? "~24 s" : "~2 min 8 s"}</div></div>
      </div>
      <p className="s3c-note ok">Speeds up long-distance transfers by <b>50–500%</b> (bigger files benefit more). Enable per bucket → use the <b>accelerated endpoint</b> via CLI/SDK. Not free — you pay a transfer fee.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. SERVER ACCESS LOGGING vs CLOUDTRAIL DATA EVENTS
   ════════════════════════════════════════════════════════════ */
const LOG_CMP = [
  { k: "Focus", a: "Summary-level request logs", b: "Detailed object-level API logging" },
  { k: "Detail", a: "Requester, time, action, status, error", b: "All that + ARN of requester, in depth" },
  { k: "Format", a: "Plain text", b: "JSON" },
  { k: "Enable from", a: "S3 console (pick a target bucket)", b: "CloudTrail console (not S3)" },
  { k: "Cost / impact", a: "Low; delivered in batches (2–4 hrs)", b: "Higher; detailed = more data + cost" },
  { k: "Use for", a: "Usage stats, request patterns", b: "Security monitoring, compliance, API audit" },
];
export function LoggingVsCloudTrail() {
  return (
    <div className="sv-card">
      <div className="sv-title s3c-title">📹 Server Access Logging vs CloudTrail Data Events</div>
      <p className="s3c-intro">Both audit "who accessed what" — the difference is <b>depth</b>. Analyze either with <b>Athena/Glue</b> (or Splunk/ELK).</p>
      <div className="s3c-cmp">
        <div className="s3c-cmp-head"><span className="feat">Aspect</span><span className="a">Server Access Logging</span><span className="b">CloudTrail Data Events</span></div>
        {LOG_CMP.map((r, i) => (
          <div key={i} className="s3c-cmp-row"><span className="feat">{r.k}</span><span>{r.a}</span><span>{r.b}</span></div>
        ))}
      </div>
      <p className="s3c-note warn">📌 Exam: "logs in <b>JSON</b>" / "object-level API audit" → <b>CloudTrail Data Events</b>. "summary access logs analyzed with Athena" → <b>Server Access Logging</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. REQUESTER PAYS
   ════════════════════════════════════════════════════════════ */
export function RequesterPays() {
  const [on, setOn] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title s3c-title">💸 Requester Pays</div>
      <p className="s3c-intro">By default the <b>bucket owner</b> pays storage + transfer + request costs. Enable Requester Pays to shift transfer &amp; request costs to whoever downloads (great for sharing big datasets):</p>
      <div className="s3c-toggle">
        <button className={!on ? "active" : ""} onClick={() => setOn(false)}>Off (owner pays)</button>
        <button className={on ? "active" : ""} onClick={() => setOn(true)}>Requester Pays on</button>
      </div>
      <div className="s3c-pays">
        <div className="s3c-pays-col"><b>👑 Owner pays</b><span className="ok">Storage</span><span className={on ? "" : "ok"}>{on ? "—" : "Data transfer"}</span><span className={on ? "" : "ok"}>{on ? "—" : "Requests"}</span></div>
        <div className="s3c-pays-col"><b>🙋 Requester pays</b><span>{on ? "Data transfer" : "—"}</span><span>{on ? "Requests" : "—"}</span><span className="muted">Storage never</span></div>
      </div>
      <p className="s3c-note">Requirements: requester needs an <b>AWS account</b> (no anonymous access), a <b>bucket policy</b> granting them access, and must send the <code>x-amz-request-payer</code> header (CLI <code>--request-payer requester</code>) — proof they accept the charge. Console can't send it; use CLI/curl.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. PRESIGNED URL (live countdown)
   ════════════════════════════════════════════════════════════ */
export function PresignedURL() {
  const [t, setT] = useState(null);
  const [dir, setDir] = useState("download");
  useEffect(() => {
    if (t === null || t <= 0) return;
    const id = setTimeout(() => setT(t - 1), 1000);
    return () => clearTimeout(id);
  }, [t]);
  const expired = t === 0;
  return (
    <div className="sv-card">
      <div className="sv-title s3c-title">⏳ Pre-signed URL</div>
      <p className="s3c-intro">
        A <b>temporary, secure link</b> to a private object — no need to make it public. Works for <b>download (GET)</b> AND <b>upload (PUT)</b>, with a time limit you set.
      </p>
      <div className="s3c-toggle">
        <button className={dir === "download" ? "active" : ""} onClick={() => setDir("download")}>Download (GET)</button>
        <button className={dir === "upload" ? "active" : ""} onClick={() => setDir("upload")}>Upload (PUT)</button>
      </div>
      <div className="s3c-presign">
        <div className="s3c-presign-url">{expired ? "🔒 URL expired" : `https://bucket.s3…/${dir === "upload" ? "myfile.txt?X-Amz-…(PUT)" : "lambda.pdf?X-Amz-…(GET)"}`}</div>
        <button className="s3c-btn" onClick={() => setT(10)}>Generate (10 s demo)</button>
        {t !== null && (
          <div className={`s3c-presign-status ${expired ? "bad" : "ok"}`}>
            {expired ? "Access Denied — request has expired" : `✅ Valid for ${t} s — ${dir === "upload" ? "you can PUT myfile.txt" : "anyone with the link can download"}`}
          </div>
        )}
      </div>
      <p className="s3c-note">Generate via <b>console</b> (download), <b>CLI</b>, <b>SDK</b>, or the <b>AWS Toolkit for Visual Studio</b> (upload). Upload PUT URLs are locked to one specific object key.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. MFA DELETE
   ════════════════════════════════════════════════════════════ */
export function MFADelete() {
  return (
    <div className="sv-card">
      <div className="sv-title s3c-title">🔐 MFA Delete</div>
      <p className="s3c-intro">An extra lock: deleting an object version (or turning off versioning) requires a fresh <b>MFA code</b> from your authenticator — on top of username/password.</p>
      <div className="s3c-req">
        <div className="s3c-req-t">Prerequisites</div>
        <ul>
          <li>Use the <b>root account</b> credentials</li>
          <li><b>MFA device</b> enabled (e.g. Google Authenticator)</li>
          <li><b>Versioning</b> must be enabled</li>
          <li>Enable via <b>CLI/SDK only</b> — not the console</li>
        </ul>
      </div>
      <div className="s3c-steps">
        <div className="s3c-step"><span>1</span><div><b>Enable</b><code>aws s3api put-bucket-versioning … --mfa "arn code" --versioning-configuration MFADelete=Enabled,Status=Enabled</code></div></div>
        <div className="s3c-step"><span>2</span><div><b>Delete a version</b> needs the MFA ARN + current code<code>delete-object … --version-id … --mfa "arn code"</code></div></div>
        <div className="s3c-step"><span>3</span><div><b>Disable</b> with MFADelete=Disabled + a new code before emptying/deleting the bucket</div></div>
      </div>
      <p className="s3c-note warn">⚠️ With MFA Delete on you <b>can't</b> permanently delete versions or empty/delete the bucket from the console — every delete needs a code.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. EVENT NOTIFICATION (watermark flow)
   ════════════════════════════════════════════════════════════ */
export function EventNotification() {
  const [dest, setDest] = useState("lambda");
  const D = {
    lambda: { ic: "λ", t: "Lambda", d: "Run code serverless — e.g. add a watermark to each uploaded JPEG (like OLX)." },
    sns: { ic: "📣", t: "SNS", d: "Fan-out a message / email to all subscribers." },
    sqs: { ic: "📨", t: "SQS", d: "Drop a message into a queue for decoupled processing." },
  };
  return (
    <div className="sv-card">
      <div className="sv-title s3c-title">🔔 S3 Event Notifications</div>
      <p className="s3c-intro">Fire an action when an event (object <b>created / removed / restored</b>) happens in a bucket. Pick a destination:</p>
      <div className="s3c-toggle">
        {Object.keys(D).map(k => (
          <button key={k} className={dest === k ? "active" : ""} onClick={() => setDest(k)}>{D[k].ic} {D[k].t}</button>
        ))}
      </div>
      <div className="s3c-flow">
        <div className="s3c-flow-box">⬆️ Upload<small>test.jpg</small></div>
        <div className="s3c-flow-arrow">→</div>
        <div className="s3c-flow-box">🪣 S3 event</div>
        <div className="s3c-flow-arrow">→</div>
        <div className="s3c-flow-box hot">{D[dest].ic} {D[dest].t}</div>
      </div>
      <div className="s3c-detail"><b>{D[dest].t}</b><p>{D[dest].d}</p></div>
      <p className="s3c-note">Common exam scenario: JPEG upload → S3 event → <b>Lambda</b> adds a watermark and writes it to a <code>watermark/</code> folder. Destinations: <b>Lambda, SNS, SQS</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. MULTIPART UPLOAD
   ════════════════════════════════════════════════════════════ */
export function MultipartUpload() {
  const [done, setDone] = useState([false, false, false]);
  const all = done.every(Boolean);
  return (
    <div className="sv-card">
      <div className="sv-title s3c-title">🧩 Multipart Upload</div>
      <p className="s3c-intro">
        S3 holds objects up to <b>5 TB</b>, but a single PUT is capped at <b>5 GB</b>. Split big files into parts (≥5 MB each), upload them (in parallel!), then reassemble. Click each part to upload:
      </p>
      <div className="s3c-parts">
        {done.map((d, i) => (
          <div key={i} className={`s3c-part ${d ? "done" : ""}`} onClick={() => setDone(p => p.map((v, j) => j === i ? true : v))}>
            {d ? "✅" : "⬆️"}<small>part {i + 1}{d ? " · ETag ✓" : ""}</small>
          </div>
        ))}
      </div>
      <div className={`s3c-mpu-result ${all ? "ok" : ""}`}>
        {all ? "🎉 Complete-multipart-upload → file assembled in the bucket" : "Upload all parts (each returns an ETag) to assemble"}
      </div>
      <p className="s3c-note">Flow: <b>create-multipart-upload</b> (get an <b>Upload ID</b>) → <b>upload-part</b> ×N (each returns an <b>ETag</b>) → <b>complete</b> with the ETag list. Benefits: parallel speed, retry single failed parts. Use a <b>lifecycle rule</b> to clean up incomplete uploads.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. VPC ENDPOINT FOR S3
   ════════════════════════════════════════════════════════════ */
export function VPCEndpoint() {
  const [ep, setEp] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title s3c-title">🔌 VPC Gateway Endpoint for S3</div>
      <p className="s3c-intro">
        By default, EC2 → S3 traffic goes over the <b>public internet</b> (even in the same region). A <b>gateway endpoint</b> keeps it on the AWS private network. Toggle it:
      </p>
      <div className="s3c-toggle">
        <button className={!ep ? "active" : ""} onClick={() => setEp(false)}>No endpoint</button>
        <button className={ep ? "active" : ""} onClick={() => setEp(true)}>Gateway endpoint</button>
      </div>
      <div className="s3c-flow">
        <div className="s3c-flow-box">🖥️ EC2<small>in VPC</small></div>
        {ep
          ? <div className="s3c-flow-arrow ok">→ AWS private network →<small>traceroute shows no hops</small></div>
          : <div className="s3c-flow-arrow bad">→ public internet →<small>traceroute shows hops</small></div>}
        <div className="s3c-flow-box hot">🪣 S3</div>
      </div>
      <div className="s3c-cmp">
        <div className="s3c-cmp-head"><span className="feat">Type</span><span className="a">Gateway ✅ (S3/DynamoDB)</span><span className="b">Interface (other svcs)</span></div>
        <div className="s3c-cmp-row"><span className="feat">Cost</span><span>Free</span><span>Hourly + data charges</span></div>
        <div className="s3c-cmp-row"><span className="feat">How</span><span>Adds a route to the route table</span><span>Creates an ENI (PrivateLink)</span></div>
      </div>
      <p className="s3c-note ok">Benefits: more secure (no internet), lower latency, better performance. For <b>S3 &amp; DynamoDB</b> always use the <b>gateway endpoint</b> (free).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. ACCESS POINTS
   ════════════════════════════════════════════════════════════ */
export function AccessPoints() {
  const [mode, setMode] = useState("ap");
  return (
    <div className="sv-card">
      <div className="sv-title s3c-title">🚪 S3 Access Points</div>
      <p className="s3c-intro">
        One bucket can have only <b>one</b> bucket policy — painful when hundreds of apps need different access. Access points give each app its <b>own named endpoint + policy</b>. Compare:
      </p>
      <div className="s3c-toggle">
        <button className={mode === "bp" ? "active" : ""} onClick={() => setMode("bp")}>1 Bucket Policy</button>
        <button className={mode === "ap" ? "active" : ""} onClick={() => setMode("ap")}>Access Points</button>
      </div>
      {mode === "bp" ? (
        <div className="s3c-ap">
          <div className="s3c-ap-users">👤 User1 👤 User2 … 👤 User500</div>
          <div className="s3c-ap-arrow">↓ all crammed into ↓</div>
          <div className="s3c-ap-policy bad">📄 ONE giant bucket policy (complex, hard to maintain)</div>
          <div className="s3c-ap-bucket">🪣 Bucket (f1, f2 …)</div>
        </div>
      ) : (
        <div className="s3c-ap">
          <div className="s3c-ap-grid">
            <div><span>👤 User1</span><span>→ 🚪 AP1 (policy: PUT f1)</span></div>
            <div><span>👤 User2</span><span>→ 🚪 AP2 (policy: PUT f2)</span></div>
            <div><span>… up to</span><span>→ 🚪 500 access points</span></div>
          </div>
          <div className="s3c-ap-arrow">↓ each its own policy ↓</div>
          <div className="s3c-ap-bucket">🪣 Bucket (delegates access to access points)</div>
        </div>
      )}
      <p className="s3c-note">Each access point sets a <b>network origin</b>: <b>VPC</b> (needs an S3 VPC endpoint) or <b>Internet</b>. Setup: delegate bucket access to access points in the bucket policy → create an access point + policy per user → grant users <code>ListAccessPoints/GetAccessPoint</code> IAM permission. Best when <b>many</b> apps share one bucket.</p>
    </div>
  );
}
