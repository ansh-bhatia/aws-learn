import React, { useState } from "react";
import "./StorageGatewayVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. DATASYNC
   ════════════════════════════════════════════════════════════ */
export function DataSyncFlow() {
  const [mode, setMode] = useState("onprem");
  return (
    <div className="sv-card">
      <div className="sv-title sgw-title">🔄 AWS DataSync</div>
      <p className="sgw-intro">
        <b>DataSync</b> is an online data-transfer service that <b>copies/moves</b> large amounts of data — automated,
        accelerated, scheduled. You need <b>existing storage</b>; DataSync just transfers from it. Two use cases:
      </p>
      <div className="sgw-toggle">
        <button className={mode === "onprem" ? "active" : ""} onClick={() => setMode("onprem")}>🏢 On-prem → AWS</button>
        <button className={mode === "aws" ? "active" : ""} onClick={() => setMode("aws")}>☁️ AWS ↔ AWS</button>
      </div>
      <div className="sgw-flow">
        {mode === "onprem" ? (
          <>
            <div className="sgw-node">🗄️ On-prem NFS/SMB<small>existing storage</small></div>
            <div className="sgw-arrow">DataSync agent →</div>
            <div className="sgw-node aws">☁️ S3 / EFS / FSx</div>
          </>
        ) : (
          <>
            <div className="sgw-node aws">📦 S3</div>
            <div className="sgw-arrow">DataSync ⇄</div>
            <div className="sgw-node aws">📁 EFS / FSx</div>
          </>
        )}
      </div>
      <div className="sgw-detail">
        {mode === "onprem"
          ? <p><b>On-prem → AWS:</b> install a <b>DataSync agent</b> (a VM you run on-prem) that reads your NFS/SMB/object storage and syncs to S3, EFS, FSx, or Snowcone — over internet or Direct Connect. Great for migrations, daily copies, cloud backup.</p>
          : <p><b>AWS ↔ AWS:</b> copy data between AWS storage services — S3 ↔ EFS, EFS ↔ FSx, etc. No agent needed.</p>}
      </div>
      <p className="sgw-note">📌 Key: DataSync is a <b>transfer tool</b>, not storage. You must already have a storage system; DataSync moves data to/from/between them.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. STORAGE GATEWAY CONCEPT
   ════════════════════════════════════════════════════════════ */
export function GatewayConcept() {
  return (
    <div className="sv-card">
      <div className="sv-title sgw-title">🏛️ Storage Gateway — Concept</div>
      <p className="sgw-intro">
        <b>Storage Gateway</b> is a <b>VM appliance</b> (VMware/Hyper-V/KVM on-prem, or EC2) that gives your on-prem apps
        a <b>local storage interface</b> backed by AWS cloud storage. It <b>caches</b> recent data locally and forwards
        everything to S3/EBS/Glacier — so you get cloud-backed storage <b>without buying a storage array</b>.
      </p>
      <div className="sgw-concept">
        <div className="sgw-servers">
          <div className="sgw-srv">🖥️ App server</div>
          <div className="sgw-srv">🗄️ DB server</div>
        </div>
        <div className="sgw-arrow">↔</div>
        <div className="sgw-appliance">📦 Storage Gateway VM<small>local cache</small></div>
        <div className="sgw-arrow">→</div>
        <div className="sgw-cloud">☁️ S3 / EBS / Glacier</div>
      </div>
      <p className="sgw-note">⚙️ Download the gateway VM image → install on-prem (or launch on EC2) → activate with your AWS account → choose a gateway type. Needs a local <b>cache disk</b> (AWS recommends ≥150 GB). Hybrid-cloud favorite — heavily tested.</p>
      <p className="sgw-note">🔁 <b>vs DataSync:</b> DataSync needs existing storage and just transfers; Storage Gateway <b>acts as</b> the storage (centralizes data, caches, forwards to cloud).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. GATEWAY TYPES
   ════════════════════════════════════════════════════════════ */
const TYPES = [
  { id: "file", t: "📁 File Gateway", proto: "NFS / SMB", store: "Amazon S3",
    d: "Presents a file share (NFS/SMB) that you mount on servers. Files are stored as objects in S3, with local caching. Supports Windows ACLs, S3 Object Lock, bandwidth optimization. You get a shared folder — can't install software on it." },
  { id: "volume", t: "💽 Volume Gateway", proto: "iSCSI", store: "S3 + EBS snapshots",
    d: "Presents block storage (iSCSI disks) you can format & install software on (like a SAN). Two modes: Cached (primary data in S3, hot data cached locally) and Stored (primary data on-prem, backed up to S3). Backed up as EBS snapshots; integrates with AWS Backup." },
  { id: "tape", t: "📼 Tape Gateway (VTL)", proto: "iSCSI VTL", store: "S3 + Glacier",
    d: "Virtual tape library replacing physical tapes. Works with existing backup software (Veeam, etc.). Active tapes → S3; ejected (archived) tapes → S3 Glacier / Deep Archive. Eliminates physical tape hassle." },
];
export function GatewayTypes() {
  const [sel, setSel] = useState("file");
  const t = TYPES.find((x) => x.id === sel);
  return (
    <div className="sv-card">
      <div className="sv-title sgw-title">🗂️ Storage Gateway Types</div>
      <p className="sgw-intro">Three gateway types for different storage needs. Click each:</p>
      <div className="sgw-tabs">
        {TYPES.map((x) => (
          <button key={x.id} className={"sgw-tab" + (sel === x.id ? " active" : "")} onClick={() => setSel(x.id)}>{x.t}</button>
        ))}
      </div>
      <div className="sgw-type-head">
        <span className="sgw-chip">protocol: <b>{t.proto}</b></span>
        <span className="sgw-chip">stores in: <b>{t.store}</b></span>
      </div>
      <div className="sgw-detail"><b>{t.t}</b><p>{t.d}</p></div>
      <p className="sgw-note">🔑 <b>File</b> = file share (NFS/SMB, → S3). <b>Volume</b> = block disk (iSCSI, → EBS snapshots) — installable like a SAN. <b>Tape</b> = virtual tape library (→ S3/Glacier) for backup software.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. DATASYNC vs STORAGE GATEWAY
   ════════════════════════════════════════════════════════════ */
const VS_ROWS = [
  ["What it is", "Data transfer service", "Hybrid storage appliance"],
  ["Needs existing storage?", "✅ Yes (it just copies)", "❌ No (it IS the storage)"],
  ["On-prem component", "Agent (VM) — reads & syncs", "Gateway appliance (VM) — caches & serves"],
  ["Direction", "One-time / scheduled copy/migration", "Continuous local access + cloud backing"],
  ["Protocols", "NFS, SMB, S3 API", "NFS, SMB, iSCSI, VTL"],
  ["Use when", "Move/migrate data to/from/between AWS", "Give on-prem apps cloud-backed storage"],
];
export function DataSyncVsGateway() {
  return (
    <div className="sv-card">
      <div className="sv-title sgw-title">⚖️ DataSync vs Storage Gateway</div>
      <p className="sgw-intro">Common exam confusion. The key: do you already have storage (→ DataSync) or need storage (→ Gateway)?</p>
      <div className="sgw-table">
        <div className="sgw-row head"><span className="feat">Aspect</span><span className="ds">🔄 DataSync</span><span className="gw">🏛️ Storage Gateway</span></div>
        {VS_ROWS.map((r, i) => (
          <div key={i} className="sgw-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="sgw-note">🤝 They combine well: <b>Storage Gateway</b> centralizes on-prem data with low-latency access, while <b>DataSync</b> automates/schedules bulk transfers to AWS.</p>
    </div>
  );
}
