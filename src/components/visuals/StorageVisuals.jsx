import { useState } from "react";
import "./StorageVisuals.css";

/* ─── 1. STORAGE TYPES MAP ───────────────────────────────────────── */
export function StorageTypesMap() {
  const [hover, setHover] = useState(null);

  const types = [
    {
      id: "das",
      icon: "💽",
      label: "DAS",
      full: "Direct Attached Storage",
      tagline: "Physically connected to one machine",
      color: "#FF9900",
      props: ["Fastest performance", "Not shareable", "Must format before use", "Raw → NTFS / ext4"],
      aws: [
        { id: "is", icon: "⚡", name: "Instance Store", badge: "Temporary", color: "#f85149" },
        { id: "ebs", icon: "💾", name: "EBS", badge: "Persistent", color: "#3fb950" },
      ],
      onprem: ["Internal HDD / SSD", "NVMe drive", "USB pen drive"],
    },
    {
      id: "file",
      icon: "📁",
      label: "File Storage",
      full: "Network File Storage",
      tagline: "Shared across multiple machines over network",
      color: "#2e73b8",
      props: ["Shareable — multiple clients at once", "Linux: NFS protocol", "Windows: CIFS / SMB protocol", "Central management"],
      aws: [
        { id: "efs", icon: "🐧", name: "EFS", badge: "Linux/NFS", color: "#3fb950" },
        { id: "fsx", icon: "🪟", name: "FSx", badge: "Windows/SMB", color: "#0078d4" },
      ],
      onprem: ["NFS Server (Linux)", "Windows File Server", "NAS Appliance"],
    },
    {
      id: "object",
      icon: "☁️",
      label: "Object Storage",
      full: "Object Storage",
      tagline: "Cloud-native — HTTP API, unlimited scale",
      color: "#8c4fff",
      props: ["Cloud-only — no on-prem equivalent", "No file system — access via URL/API", "Unlimited scale", "Best for static/unstructured data"],
      aws: [
        { id: "s3", icon: "🪣", name: "S3", badge: "Object store", color: "#8c4fff" },
        { id: "glacier", icon: "🧊", name: "S3 Glacier", badge: "Archive", color: "#555e6e" },
      ],
      onprem: ["No equivalent — cloud only"],
    },
  ];

  return (
    <div className="sv-card">
      <div className="sv-title">🗂️ The 3 Storage Types — On-Prem vs AWS</div>
      <div className="stm-grid">
        {types.map((t) => (
          <div
            key={t.id}
            className={`stm-col ${hover === t.id ? "hov" : ""}`}
            style={{ "--stc": t.color }}
            onMouseEnter={() => setHover(t.id)}
            onMouseLeave={() => setHover(null)}
          >
            {/* Header */}
            <div className="stm-header">
              <span className="stm-icon">{t.icon}</span>
              <div>
                <div className="stm-label">{t.label}</div>
                <div className="stm-full">{t.full}</div>
              </div>
            </div>
            <div className="stm-tagline">{t.tagline}</div>

            {/* Properties */}
            <div className="stm-section-label">Key Properties</div>
            <ul className="stm-props">
              {t.props.map((p, i) => <li key={i}>{p}</li>)}
            </ul>

            {/* On-prem */}
            <div className="stm-section-label">On-Premises Examples</div>
            <div className="stm-onprem">
              {t.onprem.map((o, i) => (
                <span key={i} className="stm-onprem-chip">{o}</span>
              ))}
            </div>

            {/* Arrow */}
            <div className="stm-arrow">↓ AWS Equivalent</div>

            {/* AWS services */}
            <div className="stm-aws-services">
              {t.aws.map((a) => (
                <div key={a.id} className="stm-aws-chip" style={{ "--ac": a.color }}>
                  <span className="stm-aws-icon">{a.icon}</span>
                  <div>
                    <div className="stm-aws-name">{a.name}</div>
                    <div className="stm-aws-badge">{a.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 2. STORAGE COMPARE TABLE ───────────────────────────────────── */
export function StorageCompareTable() {
  const rows = [
    { feature: "Type", is: "Block (DAS)", ebs: "Block (DAS)", efs: "File (NFS)", fsx: "File (SMB)", s3: "Object" },
    { feature: "OS Compatibility", is: "Linux only", ebs: "Windows + Linux", efs: "Linux only", fsx: "Windows only", s3: "Any (HTTP API)" },
    { feature: "Shareable?", is: "No", ebs: "No (1 instance)", efs: "Yes — multiple EC2", fsx: "Yes — multiple EC2", s3: "Yes — global" },
    { feature: "Persistent?", is: "❌ Ephemeral", ebs: "✅ Yes", efs: "✅ Yes", fsx: "✅ Yes", s3: "✅ Yes" },
    { feature: "Performance", is: "⚡ Highest", ebs: "Very high", efs: "High (scalable)", fsx: "High", s3: "Throughput-based" },
    { feature: "Use case", is: "Cache/temp/scratch", ebs: "OS, DB, apps", efs: "Shared Linux FS", fsx: "Shared Windows FS", s3: "Images, backups, static files" },
    { feature: "Pricing model", is: "Included in instance", ebs: "Per GB provisioned", efs: "Per GB used", fsx: "Per GB provisioned", s3: "Per GB stored + requests" },
  ];

  const headers = ["Feature", "Instance Store", "EBS", "EFS", "FSx", "S3"];
  const colors  = ["", "#f85149", "#3fb950", "#2e73b8", "#0078d4", "#8c4fff"];

  return (
    <div className="sv-card">
      <div className="sv-title">📋 AWS Storage Services — Quick Compare</div>
      <div className="sct-wrapper">
        <table className="sct-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{ color: colors[i] || "#8b949e" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td className="sct-feature">{row.feature}</td>
                <td className="sct-is">{row.is}</td>
                <td>{row.ebs}</td>
                <td>{row.efs}</td>
                <td>{row.fsx}</td>
                <td>{row.s3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── 3. INSTANCE STORE vs EBS ───────────────────────────────────── */
export function InstanceStoreVsEBS() {
  const [scenario, setScenario] = useState("running");
  const [mode, setMode] = useState("is"); // "is" or "ebs"

  const states = [
    { id: "running", label: "▶ Running", desc: "Instance is active" },
    { id: "stop", label: "⏹ Stop", desc: "Instance stopped" },
    { id: "restart", label: "🔄 Restart", desc: "Started on possibly different host" },
    { id: "terminate", label: "🗑 Terminate", desc: "Instance permanently deleted" },
  ];

  const outcomes = {
    is: {
      running:   { data: "✅ Data accessible",           host: "Host A", color: "#3fb950", note: "Instance Store lives inside Host A" },
      stop:      { data: "⚠️ Data still on Host A",      host: "Stopped", color: "#e3b341", note: "Instance is off, Instance Store stays on Host A hardware" },
      restart:   { data: "❌ Data LOST — new host!",     host: "Host B (different)", color: "#f85149", note: "AWS moved instance to Host B. Instance Store from Host A is gone forever." },
      terminate: { data: "❌ Data LOST permanently",     host: "Terminated", color: "#f85149", note: "Instance terminated. Instance Store destroyed. No recovery possible." },
    },
    ebs: {
      running:   { data: "✅ Data accessible",           host: "Host A", color: "#3fb950", note: "EBS volume attached to EC2 over network" },
      stop:      { data: "✅ Data safe on EBS volume",   host: "Stopped", color: "#3fb950", note: "EBS lives independently in the network. No data loss." },
      restart:   { data: "✅ Data safe — EBS reconnects",host: "Host B (different)", color: "#3fb950", note: "EC2 moved to Host B but reconnects to the same EBS volume over the network." },
      terminate: { data: "✅/❌ Depends on setting",     host: "Terminated", color: "#e3b341", note: '"Delete on Termination = Yes" → EBS deleted. "No" → EBS volume survives and can be reattached.' },
    },
  };

  const cur = outcomes[mode][scenario];
  const stepIdx = states.findIndex(s => s.id === scenario);

  return (
    <div className="sv-card">
      <div className="sv-title">⚔️ Instance Store vs EBS — Interactive Lifecycle</div>

      {/* Mode selector */}
      <div className="isv-modes">
        <button className={`isv-mode-btn ${mode === "is" ? "active is" : ""}`} onClick={() => setMode("is")}>
          ⚡ Instance Store
        </button>
        <button className={`isv-mode-btn ${mode === "ebs" ? "active ebs" : ""}`} onClick={() => setMode("ebs")}>
          💾 EBS Volume
        </button>
      </div>

      {/* Diagram */}
      <div className="isv-diagram">
        {/* Physical hosts */}
        <div className="isv-hosts">
          {["Host A", "Host B"].map((h, hi) => {
            const isActive = (scenario === "running" || scenario === "stop") ? hi === 0 : (scenario === "restart" || scenario === "terminate") ? hi === 1 : false;
            const terminated = scenario === "terminate";
            return (
              <div key={h} className={`isv-host ${isActive && !terminated ? "active" : ""}`}>
                <div className="isv-host-label">🖥️ Physical {h}</div>
                {/* EC2 instance */}
                <div className={`isv-ec2 ${scenario === "stop" || terminated ? "off" : isActive ? "on" : "off"}`}>
                  <span>{terminated ? "💀" : scenario === "stop" && hi === 0 ? "💤" : "💻"}</span>
                  <span>EC2 Instance</span>
                </div>
                {/* Instance store (only if mode = is) */}
                {mode === "is" && (
                  <div className={`isv-is-block ${hi === 0 ? "" : "gone"}`}>
                    <span>💽</span>
                    <div>
                      <div className="isv-is-label">Instance Store</div>
                      <div className="isv-is-sub">{hi === 0 ? "Data here" : "Empty (different host)"}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* EBS — floats between hosts */}
          {mode === "ebs" && (
            <div className={`isv-ebs-float ${scenario === "terminate" ? "warn" : "safe"}`}>
              <div className="isv-ebs-icon">💾</div>
              <div className="isv-ebs-label">EBS Volume</div>
              <div className="isv-ebs-sub">Independent in AZ network</div>
              <div className="isv-ebs-connector" />
            </div>
          )}
        </div>

        {/* Status */}
        <div className={`isv-status`} style={{ background: cur.color + "15", borderColor: cur.color + "50" }}>
          <div className="isv-status-data" style={{ color: cur.color }}>{cur.data}</div>
          <div className="isv-status-note">{cur.note}</div>
          <div className="isv-status-host">Instance running on: <strong>{cur.host}</strong></div>
        </div>
      </div>

      {/* Lifecycle steps */}
      <div className="isv-steps">
        {states.map((s, i) => (
          <button
            key={s.id}
            className={`isv-step ${scenario === s.id ? "active" : i < stepIdx ? "done" : ""}`}
            onClick={() => setScenario(s.id)}
          >
            <div className="isv-step-label">{s.label}</div>
            <div className="isv-step-desc">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Key differences table */}
      <div className="isv-diff-table">
        <div className="isv-diff-title">Full Comparison</div>
        {[
          ["Persistence", "❌ Temporary (ephemeral)", "✅ Persistent"],
          ["Survives stop?", "❌ No — data lost", "✅ Yes"],
          ["Survives terminate?", "❌ No", "✅ Yes (if Delete on Termination = No)"],
          ["Performance", "⚡ Best (local hardware)", "Very good (network-attached)"],
          ["Instance types", "Specific types only (i3, x1…)", "All instance types"],
          ["Max size", "Fixed by instance type", "Up to 16 TB"],
          ["Cost", "Included in instance price", "Billed separately (even when stopped)"],
          ["Mounting", "Auto-mounted at launch", "Manual attach + mount"],
          ["Best for", "Cache, scratch, temp buffers", "OS, databases, production data"],
        ].map(([feat, is, ebs], i) => (
          <div key={i} className="isv-diff-row">
            <span className="isv-diff-feat">{feat}</span>
            <span className={`isv-diff-is ${is.startsWith("❌") ? "bad" : is.startsWith("✅") || is.startsWith("⚡") ? "good" : ""}`}>{is}</span>
            <span className={`isv-diff-ebs ${ebs.startsWith("✅") ? "good" : ebs.startsWith("❌") ? "bad" : ""}`}>{ebs}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 4. 6 STORAGE SCENARIOS ─────────────────────────────────────── */
export function StorageScenariosExplorer() {
  const [active, setActive] = useState(0);

  const scenarios = [
    {
      num: 1,
      title: "Instance Store as Root Volume",
      root: { type: "IS", label: "Instance Store (Root)", size: "Fixed by instance type", color: "#f85149", icon: "💽" },
      data: null,
      notes: [
        "Select AMI with Root Device Type = Instance Store",
        "Only Linux AMIs support this — no Windows",
        "Only specific instance types (not T2.micro)",
        "Size is fixed — cannot change",
        "Stopping the instance = ALL data lost",
      ],
      warning: "Stopping or terminating destroys all data",
    },
    {
      num: 2,
      title: "EBS as Root Volume (Most Common)",
      root: { type: "EBS", label: "EBS Volume (Root)", size: "8 GB (Linux) / 30 GB (Windows) — configurable", color: "#3fb950", icon: "💾" },
      data: null,
      notes: [
        "Default for almost all AMIs",
        "Supports all instance types including T2.micro",
        "Size is fully configurable",
        "'Delete on Termination' setting available",
        "Data survives stop and restart",
      ],
      warning: null,
    },
    {
      num: 3,
      title: "Instance Store as Data Volume",
      root: { type: "IS", label: "Instance Store (Root)", size: "Fixed", color: "#f85149", icon: "💽" },
      data: { type: "IS", label: "Instance Store (Data)", size: "Fixed by instance type", color: "#f85149", icon: "💽" },
      notes: [
        "Cannot add Instance Store via the 'Add Volume' button",
        "Must select a specific instance type that includes multiple Instance Store volumes",
        "e.g. x1.32xlarge comes with 2 IS volumes — first = root, second = data",
        "Both root and data are ephemeral",
      ],
      warning: "Both volumes lost on stop/terminate",
    },
    {
      num: 4,
      title: "EBS as Data Volume",
      root: { type: "EBS", label: "EBS Volume (Root)", size: "8 GB default", color: "#3fb950", icon: "💾" },
      data: { type: "EBS", label: "EBS Volume (Data)", size: "Any size you choose", color: "#3fb950", icon: "💾" },
      notes: [
        "Click 'Add Volume' in the storage config section",
        "Choose any size (GB to TB)",
        "Works with all instance types",
        "Add as many data volumes as you need",
        "Fully persistent",
      ],
      warning: null,
    },
    {
      num: 5,
      title: "Instance Store (Root) + EBS (Data)",
      root: { type: "IS", label: "Instance Store (Root)", size: "Fixed by instance type", color: "#f85149", icon: "💽" },
      data: { type: "EBS", label: "EBS Volume (Data)", size: "Any size you choose", color: "#3fb950", icon: "💾" },
      notes: [
        "Select Instance Store-capable AMI + Instance Store instance type",
        "Then click 'Add Volume' to add EBS data volume",
        "OS lives on ephemeral storage (risky)",
        "App data on persistent EBS survives instance lifecycle",
      ],
      warning: "OS volume is ephemeral — OS config lost on stop",
    },
    {
      num: 6,
      title: "EBS (Root) + Instance Store (Data)",
      root: { type: "EBS", label: "EBS Volume (Root)", size: "Standard EBS size", color: "#3fb950", icon: "💾" },
      data: { type: "IS", label: "Instance Store (Data)", size: "Fixed by instance type", color: "#f85149", icon: "💽" },
      notes: [
        "Use any standard EBS AMI",
        "Select an instance type with built-in Instance Store (check 'Storage GB' column)",
        "Root EBS is safe and persistent",
        "Instance Store data volume is automatic — ultra-fast for temp data",
        "OS is safe; scratch data is high-performance but temporary",
      ],
      warning: "Data volume lost on stop/terminate",
    },
  ];

  const cur = scenarios[active];

  return (
    <div className="sv-card">
      <div className="sv-title">📦 6 EC2 Storage Configuration Scenarios</div>
      <div className="sc-layout">
        {/* Sidebar */}
        <div className="sc-sidebar">
          {scenarios.map((s, i) => (
            <button
              key={i}
              className={`sc-nav-btn ${active === i ? "active" : ""}`}
              onClick={() => setActive(i)}
            >
              <div className="sc-nav-num">{s.num}</div>
              <div className="sc-nav-title">{s.title}</div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="sc-detail">
          <div className="sc-scenario-title">Scenario {cur.num}: {cur.title}</div>

          {/* Visual disk layout */}
          <div className="sc-disks">
            <div className="sc-disk root" style={{ "--dc": cur.root.color }}>
              <div className="sc-disk-icon">{cur.root.icon}</div>
              <div className="sc-disk-info">
                <div className="sc-disk-label">{cur.root.label}</div>
                <div className="sc-disk-size">{cur.root.size}</div>
                <div className="sc-disk-type-badge" style={{ background: cur.root.color + "20", color: cur.root.color }}>
                  {cur.root.type === "IS" ? "⚡ Ephemeral" : "✅ Persistent"}
                </div>
              </div>
              <div className="sc-disk-tag">C: / Root</div>
            </div>

            {cur.data ? (
              <div className="sc-disk data" style={{ "--dc": cur.data.color }}>
                <div className="sc-disk-icon">{cur.data.icon}</div>
                <div className="sc-disk-info">
                  <div className="sc-disk-label">{cur.data.label}</div>
                  <div className="sc-disk-size">{cur.data.size}</div>
                  <div className="sc-disk-type-badge" style={{ background: cur.data.color + "20", color: cur.data.color }}>
                    {cur.data.type === "IS" ? "⚡ Ephemeral" : "✅ Persistent"}
                  </div>
                </div>
                <div className="sc-disk-tag">D: / Data</div>
              </div>
            ) : (
              <div className="sc-disk empty">
                <div className="sc-disk-icon">➕</div>
                <div className="sc-disk-info">
                  <div className="sc-disk-label">No data volume</div>
                  <div className="sc-disk-size">Add with 'Add Volume' if needed</div>
                </div>
                <div className="sc-disk-tag">Optional</div>
              </div>
            )}
          </div>

          {/* Warning */}
          {cur.warning && (
            <div className="sc-warning">⚠️ {cur.warning}</div>
          )}

          {/* Notes */}
          <div className="sc-notes">
            {cur.notes.map((n, i) => (
              <div key={i} className="sc-note">
                <span className="sc-note-dot">●</span>
                <span>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 5. EBS LIFECYCLE VISUAL ────────────────────────────────────── */
export function EBSLifecycleVisual() {
  const [step, setStep] = useState(0);

  const steps = [
    { icon: "🏗️", title: "Create EBS Volume",   desc: "Go to EC2 → Volumes → Create Volume. Choose type (gp3, io2…), size (GB), and AZ. The volume exists independently — not yet attached to anything.", code: "aws ec2 create-volume --size 100 --volume-type gp3 --availability-zone ap-south-1a" },
    { icon: "🔗", title: "Attach to EC2",        desc: "Select volume → Actions → Attach Volume → choose your EC2 instance (must be in the same AZ). The volume appears as a new disk device (e.g. /dev/xvdf on Linux).", code: "aws ec2 attach-volume --volume-id vol-xxx --instance-id i-xxx --device /dev/sdf" },
    { icon: "🔧", title: "Mount from OS",         desc: "SSH into your EC2 instance. Format the disk (first time only), then mount it to a directory. Now you can read/write data.", code: "mkfs -t ext4 /dev/xvdf\nmkdir /mydata\nmount /dev/xvdf /mydata" },
    { icon: "✅", title: "Use It",               desc: "The volume is ready. Read and write files to /mydata (Linux) or the new drive letter (Windows). Data persists across reboots and stop/start cycles.", code: "# Write data\necho 'hello' > /mydata/test.txt\n# Read data\ncat /mydata/test.txt" },
    { icon: "📸", title: "Snapshot (Backup)",    desc: "Create a point-in-time snapshot of the EBS volume. Snapshots are stored in S3 and can be used to create new volumes or copy to another region.", code: "aws ec2 create-snapshot --volume-id vol-xxx --description 'my backup'" },
    { icon: "🔌", title: "Detach",               desc: "Unmount from the OS first, then detach from the EC2 instance. The volume still exists — you can attach it to any other EC2 instance in the same AZ.", code: "umount /mydata\naws ec2 detach-volume --volume-id vol-xxx" },
    { icon: "🗑️", title: "Delete (optional)",    desc: "When you no longer need the volume, delete it. Billing stops immediately. Snapshots taken from this volume are not deleted automatically.", code: "aws ec2 delete-volume --volume-id vol-xxx" },
  ];

  return (
    <div className="sv-card">
      <div className="sv-title">🔄 EBS Volume Lifecycle</div>

      <div className="elv-timeline">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`elv-step ${step === i ? "active" : i < step ? "done" : ""}`}
            onClick={() => setStep(i)}
          >
            <div className="elv-step-icon">{s.icon}</div>
            <div className="elv-step-label">{s.title}</div>
            {i < steps.length - 1 && <div className="elv-connector" />}
          </div>
        ))}
      </div>

      <div className="elv-detail">
        <div className="elv-detail-icon">{steps[step].icon}</div>
        <div className="elv-detail-content">
          <div className="elv-detail-title">{steps[step].title}</div>
          <div className="elv-detail-desc">{steps[step].desc}</div>
          <pre className="elv-code"><code>{steps[step].code}</code></pre>
        </div>
      </div>

      <div className="elv-nav">
        <button className="elv-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</button>
        <span className="elv-progress">{step + 1} / {steps.length}</span>
        <button className="elv-btn primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>Next →</button>
      </div>
    </div>
  );
}
