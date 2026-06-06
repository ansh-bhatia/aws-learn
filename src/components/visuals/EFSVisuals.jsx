import { useState } from "react";
import "./EFSVisuals.css";

/* ─── 1. EFS vs EBS — SHARED STORAGE 3D EXPLAINER ──────────────────── */
export function EFSvsEBSShared() {
  const [mode, setMode] = useState("ebs"); // "ebs" | "efs"
  const [count, setCount] = useState(3);
  const [updating, setUpdating] = useState(false);

  const triggerUpdate = () => {
    setUpdating(true);
    setTimeout(() => setUpdating(false), 1600);
  };

  const instances = Array.from({ length: count });

  return (
    <div className="sv-card">
      <div className="sv-title">🔁 EBS vs EFS — The Shared Storage Problem</div>

      <div className="efs-mode-switch">
        <button className={`efs-mode-btn ${mode === "ebs" ? "active bad" : ""}`} onClick={() => setMode("ebs")}>
          💾 Using EBS (not shared)
        </button>
        <button className={`efs-mode-btn ${mode === "efs" ? "active good" : ""}`} onClick={() => setMode("efs")}>
          🐧 Using EFS (shared)
        </button>
      </div>

      <div className="efs-controls">
        <span>EC2 instances: <strong>{count}</strong></span>
        <input type="range" min="2" max="10" value={count} onChange={(e) => setCount(+e.target.value)} />
        <button className="efs-update-btn" onClick={triggerUpdate}>
          ✏️ Update website
        </button>
      </div>

      <div className={`efs-stage ${mode}`}>
        <div className="efs-instances-row">
          {instances.map((_, i) => (
            <div key={i} className="efs-node">
              <div className="efs-ec2-box">
                <span className="efs-ec2-icon">💻</span>
                <span className="efs-ec2-label">EC2 #{i + 1}</span>
                <span className="efs-az-tag">{`AZ-${String.fromCharCode(97 + (i % 3))}`}</span>
              </div>

              {mode === "ebs" ? (
                <>
                  <div className="efs-link vertical" />
                  <div className={`efs-vol ebs ${updating ? "manual-update" : ""}`}>
                    <span>💾</span>
                    <span className="efs-vol-label">EBS #{i + 1}</span>
                    <span className="efs-vol-sub">copy of site</span>
                    {updating && <span className="efs-update-flag">manual update!</span>}
                  </div>
                </>
              ) : (
                <div className={`efs-link to-shared ${updating ? "flow" : ""}`} />
              )}
            </div>
          ))}
        </div>

        {mode === "efs" && (
          <div className={`efs-shared-vol ${updating ? "synced" : ""}`}>
            <span className="efs-shared-icon">🗄️</span>
            <div>
              <div className="efs-shared-title">EFS — single shared file system</div>
              <div className="efs-shared-sub">
                {updating ? "✅ One update — instantly visible to ALL instances" : "One website, accessed by every EC2 instance"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`efs-verdict ${mode}`}>
        {mode === "ebs" ? (
          <>
            <strong>❌ Problem:</strong> EBS is <em>directly-attached</em> storage — it can't be shared. You need
            <strong> {count} separate copies</strong> of your website. Updating means editing all {count} volumes
            one by one. With 100 instances that's 100 manual updates.
          </>
        ) : (
          <>
            <strong>✅ Solution:</strong> EFS is <em>shared</em> storage. <strong>One</strong> file system serves
            all {count} instances. Update once → every instance sees it instantly. Scale to 100 instances with zero
            extra copies. <em>(Linux / NFS only — Windows uses FSx.)</em>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── 2. EFS USE CASES ─────────────────────────────────────────────── */
export function EFSUseCases() {
  const [active, setActive] = useState(0);

  const cases = [
    {
      icon: "🌐", title: "Highly-Available Web Hosting",
      color: "#2e73b8",
      summary: "Host one website, served by many EC2 instances across AZs.",
      points: [
        "Run identical web servers in 2+ Availability Zones for high availability",
        "If AP-South-1a goes down, AP-South-1b keeps serving — uninterrupted 24×7",
        "Store the website on a single EFS volume shared by all servers",
        "Update once → all 50 / 100 instances reflect it instantly",
      ],
    },
    {
      icon: "🗂️", title: "Centralised File Server",
      color: "#3F8624",
      summary: "Many workstation EC2 instances write to one central store.",
      points: [
        "10 EC2 workstations all produce data continuously",
        "Instead of managing 10 separate EBS volumes, store data in one EFS",
        "Centralised storage — manage a single file system, not many",
        "Acts like a traditional NAS / network file server",
      ],
    },
    {
      icon: "🏢", title: "On-Premises Cloud Storage",
      color: "#8c4fff",
      summary: "On-prem workstations back up data into EFS over a private link.",
      points: [
        "Office has 10+ on-premises workstations — don't want to risk local-only storage",
        "Each workstation writes its data into EFS in the cloud",
        "Connect on-prem ↔ AWS via VPN or Direct Connect",
        "Durable, centralised, off-site cloud storage for on-prem data",
      ],
    },
  ];

  const cur = cases[active];

  return (
    <div className="sv-card">
      <div className="sv-title">🎯 3 Main Use Cases of EFS</div>

      <div className="efs-uc-tabs">
        {cases.map((c, i) => (
          <button
            key={i}
            className={`efs-uc-tab ${active === i ? "active" : ""}`}
            style={{ "--uc": c.color }}
            onClick={() => setActive(i)}
          >
            <span className="efs-uc-tab-icon">{c.icon}</span>
            <span>{c.title}</span>
          </button>
        ))}
      </div>

      <div className="efs-uc-detail" style={{ "--uc": cur.color }}>
        <div className="efs-uc-head">
          <span className="efs-uc-big-icon">{cur.icon}</span>
          <div>
            <div className="efs-uc-title">{cur.title}</div>
            <div className="efs-uc-summary">{cur.summary}</div>
          </div>
        </div>
        <ul className="efs-uc-points">
          {cur.points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
    </div>
  );
}

/* ─── 3. EFS CONFIG OPTIONS EXPLORER ───────────────────────────────── */
export function EFSConfigExplorer() {
  const [storage, setStorage] = useState("standard");
  const [lifecycle, setLifecycle] = useState(true);
  const [encrypt, setEncrypt] = useState(true);
  const [backup, setBackup] = useState(true);

  return (
    <div className="sv-card">
      <div className="sv-title">⚙️ EFS Configuration Options — Save Money the Right Way</div>

      <div className="efs-cfg-grid">
        {/* Storage class */}
        <div className="efs-cfg-block">
          <div className="efs-cfg-label">Storage Class</div>
          <div className="efs-toggle-row">
            <button className={`efs-toggle ${storage === "standard" ? "on" : ""}`} onClick={() => setStorage("standard")}>
              Standard
            </button>
            <button className={`efs-toggle ${storage === "onezone" ? "on" : ""}`} onClick={() => setStorage("onezone")}>
              One Zone
            </button>
          </div>
          <div className="efs-cfg-explain">
            {storage === "standard" ? (
              <>📦 <strong>Standard</strong> — replicated across <strong>multiple AZs</strong> automatically. Use for
              <strong> critical data</strong> you can't afford to lose. Costs more.</>
            ) : (
              <>📍 <strong>One Zone</strong> — stored in a <strong>single AZ</strong>. Cheaper. Use for
              <strong> non-critical data</strong> you already back up elsewhere. If that AZ is down, data is unreachable.</>
            )}
          </div>
        </div>

        {/* Lifecycle */}
        <div className="efs-cfg-block">
          <div className="efs-cfg-label">Lifecycle Management</div>
          <button className={`efs-switch ${lifecycle ? "on" : ""}`} onClick={() => setLifecycle((v) => !v)}>
            <span className="efs-switch-knob" />
            <span className="efs-switch-text">{lifecycle ? "Enabled" : "Disabled"}</span>
          </button>
          <div className="efs-cfg-explain">
            {lifecycle ? (
              <>♻️ Files not accessed for N days (e.g. 30 / 90) move <strong>Standard → Infrequent Access</strong>
              automatically — <strong>cheaper</strong> for cold data. A later access can transition it back to hot.
              Huge savings on terabyte-scale data.</>
            ) : (
              <>Everything stays in Standard storage at full price, even data you never touch (cold data).</>
            )}
          </div>
          <div className="efs-hotcold">
            <div className="efs-hc hot">🔥 Hot data → <strong>Standard</strong></div>
            <div className="efs-hc-arrow">{lifecycle ? "⇄ auto" : "✕ manual"}</div>
            <div className="efs-hc cold">🧊 Cold data → <strong>Infrequent Access</strong></div>
          </div>
        </div>

        {/* Encryption */}
        <div className="efs-cfg-block">
          <div className="efs-cfg-label">Encryption at Rest</div>
          <button className={`efs-switch ${encrypt ? "on" : ""}`} onClick={() => setEncrypt((v) => !v)}>
            <span className="efs-switch-knob" />
            <span className="efs-switch-text">{encrypt ? "Enabled 🔒" : "Disabled 🔓"}</span>
          </button>
          <div className="efs-cfg-explain">
            {encrypt ? (
              <>🔒 Data encrypted at rest using <strong>KMS (Key Management Service)</strong>. Required by many
              government / compliance standards. If stolen, data is unreadable.</>
            ) : (
              <>Data stored in plaintext at rest. Faster to set up but not compliant for sensitive data.</>
            )}
          </div>
        </div>

        {/* Backup */}
        <div className="efs-cfg-block">
          <div className="efs-cfg-label">Automatic Backup</div>
          <button className={`efs-switch ${backup ? "on" : ""}`} onClick={() => setBackup((v) => !v)}>
            <span className="efs-switch-knob" />
            <span className="efs-switch-text">{backup ? "Enabled" : "Disabled"}</span>
          </button>
          <div className="efs-cfg-explain">
            {backup ? (
              <>🛡️ AWS Backup takes automatic recovery points. Recommended for <strong>critical data</strong>.</>
            ) : (
              <>No automatic backups — fine for non-critical data that's reproducible or backed up elsewhere.</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 4. THROUGHPUT vs PERFORMANCE — RESTAURANT ANALOGY ─────────────── */
export function EFSThroughputPerformance() {
  const [throughput, setThroughput] = useState("elastic"); // bursting | elastic | provisioned
  const [perf, setPerf] = useState("general"); // general | maxio

  const tp = {
    bursting: { kitchen: 50, label: "Bursting", desc: "Throughput scales with how much data you've stored. Small data = slow baseline, with credits to burst up to ~2× temporarily.", color: "#e3b341" },
    elastic: { kitchen: 90, label: "Elastic (Enhanced)", desc: "Automatically scales to whatever throughput you need — no limits. Great for spiky workloads, but billing can spike too.", color: "#3fb950" },
    provisioned: { kitchen: 70, label: "Provisioned (Enhanced)", desc: "You set a fixed, constant throughput (e.g. 1024 MB/s) regardless of stored data size. Predictable for critical apps.", color: "#8c4fff" },
  };
  const pf = {
    general: { waiters: 4, label: "General Purpose", desc: "Moderate IOPS — handles a normal number of requests per second. Default, lowest latency for most apps.", color: "#2e73b8" },
    maxio: { waiters: 9, label: "Max I/O", desc: "Very high IOPS — handles thousands of concurrent requests. For highly parallel workloads (big data, many clients).", color: "#f0883e" },
  };

  const t = tp[throughput];
  const p = pf[perf];

  return (
    <div className="sv-card">
      <div className="sv-title">🍽️ Throughput Mode vs Performance Mode — The Restaurant Analogy</div>

      <div className="efs-rest-analogy">
        <div className="efs-rest-side">
          <div className="efs-rest-head" style={{ color: t.color }}>👨‍🍳 Kitchen = Throughput</div>
          <div className="efs-rest-sub">How much <strong>data</strong> can be processed per second (MB/s)</div>
          <div className="efs-dishes">
            {Array.from({ length: Math.round(t.kitchen / 10) }).map((_, i) => (
              <span key={i} className="efs-dish" style={{ animationDelay: `${i * 0.08}s` }}>🍲</span>
            ))}
          </div>
          <div className="efs-rest-metric" style={{ color: t.color }}>~{t.kitchen} dishes/sec cooked</div>
        </div>

        <div className="efs-rest-side">
          <div className="efs-rest-head" style={{ color: p.color }}>🧑‍🍳 Waiters = Performance</div>
          <div className="efs-rest-sub">How many <strong>requests (IOPS)</strong> can be served per second</div>
          <div className="efs-dishes">
            {Array.from({ length: p.waiters }).map((_, i) => (
              <span key={i} className="efs-dish" style={{ animationDelay: `${i * 0.08}s` }}>🧑‍🍳</span>
            ))}
          </div>
          <div className="efs-rest-metric" style={{ color: p.color }}>{p.waiters} waiters delivering</div>
        </div>
      </div>

      <div className="efs-tp-note">
        💡 Best performance needs <strong>both</strong>: a fast kitchen (throughput) <em>and</em> enough waiters
        (IOPS). A great kitchen with too few waiters still delivers slowly.
      </div>

      <div className="efs-tp-controls">
        <div className="efs-tp-group">
          <div className="efs-cfg-label">Throughput Mode</div>
          <div className="efs-toggle-row wrap">
            {Object.keys(tp).map((k) => (
              <button key={k} className={`efs-toggle ${throughput === k ? "on" : ""}`} onClick={() => setThroughput(k)}>
                {tp[k].label}
              </button>
            ))}
          </div>
          <div className="efs-cfg-explain">{t.desc}</div>
        </div>

        <div className="efs-tp-group">
          <div className="efs-cfg-label">Performance Mode</div>
          <div className="efs-toggle-row wrap">
            {Object.keys(pf).map((k) => (
              <button key={k} className={`efs-toggle ${perf === k ? "on" : ""}`} onClick={() => setPerf(k)}>
                {pf[k].label}
              </button>
            ))}
          </div>
          <div className="efs-cfg-explain">{p.desc}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── 5. EFS LAB WALKTHROUGH ───────────────────────────────────────── */
export function EFSLabSteps() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: "🛡️", title: "1. Create Security Groups",
      desc: "Two security groups. web-SG protects the EC2 instances. efs-SG protects EFS — and only allows the NFS port from web-SG members (not the whole internet).",
      code: "# web-SG (for EC2 instances)\nInbound:  TCP 22 (SSH)  ← 0.0.0.0/0\nOutbound: All traffic\n\n# efs-SG (for EFS)\nInbound:  TCP 2049 (NFS) ← source: web-SG\nOutbound: All traffic",
      tip: "Best practice: source = web-SG, NOT 0.0.0.0/0. Only your EC2 fleet can reach EFS.",
    },
    {
      icon: "💻", title: "2. Launch 2 EC2 Instances (different AZs)",
      desc: "Two Amazon Linux t2.micro instances — one in ap-south-1a, one in ap-south-1b. Two AZs = high availability. Attach web-SG to both. EFS supports Linux only.",
      code: "EFS-VM-1 → Amazon Linux, t2.micro, ap-south-1a, SG: web-SG\nEFS-VM-2 → Amazon Linux, t2.micro, ap-south-1b, SG: web-SG\n\n# Create one at a time so they land in different subnets/AZs",
      tip: "Launching 'count = 2' puts both in the SAME subnet — create them individually for different AZs.",
    },
    {
      icon: "🗄️", title: "3. Create the EFS File System",
      desc: "EFS → Create File System → Customize. Pick storage class, throughput & performance modes. No size to provision — EFS is elastic; you pay only for data stored.",
      code: "Name: shared_storage\nStorage class: Standard\nThroughput: Enhanced → Elastic\nPerformance: General Purpose\n# No capacity to set — grows automatically",
      tip: "Elastic + pay-per-GB-used: store 5 GB, pay for 5 GB. No pre-provisioning.",
    },
    {
      icon: "🔌", title: "4. Configure Mount Targets",
      desc: "Mount EFS into each AZ that needs access (ap-south-1a, ap-south-1b). Attach efs-SG to the mount targets. An AZ with no mount target can't reach EFS — but you can add one later.",
      code: "Mount targets:\n  ap-south-1a → SG: efs-SG\n  ap-south-1b → SG: efs-SG\n  (ap-south-1c → skip — no EC2 there yet)",
      tip: "Rule: an AZ must have a mount target before any EC2 in it can access the file system.",
    },
    {
      icon: "📥", title: "5. Install EFS Utils on Both Servers",
      desc: "SSH into each EC2 instance, become root, and install the Amazon EFS mount helper. Without it you cannot mount the file system.",
      code: "ssh -i cloud_fox_key.pem ec2-user@<public-ip>\nsudo -i\nyum install -y amazon-efs-utils",
      tip: "Install on BOTH servers — forgetting this is the #1 reason mounts fail.",
    },
    {
      icon: "📂", title: "6. Mount EFS on Both Servers",
      desc: "Create a folder and mount the file system using the attach command from the EFS console. Repeat on both instances.",
      code: "mkdir efs\nsudo mount -t efs -o tls fs-xxxxxxxx:/ efs\ncd efs && ls",
      tip: "Use the exact mount command shown in EFS → your file system → Attach.",
    },
    {
      icon: "✅", title: "7. Verify Shared Access",
      desc: "Create a file on VM-1 inside /efs — it instantly appears on VM-2, and vice-versa. That's the shared storage proving itself.",
      code: "# On VM-1\necho 'created from VM-1' > efs/note.txt\n\n# On VM-2 — same file is already there\ncat efs/note.txt   →  created from VM-1",
      tip: "Both instances read/write the SAME data in real time — exactly what EBS can't do.",
    },
    {
      icon: "🧹", title: "8. Clean Up Resources",
      desc: "Always tear down lab resources to avoid surprise bills. Terminate the instances, then delete the EFS file system (which removes its mount targets).",
      code: "1. Terminate both EC2 instances\n2. EFS → select → Delete → confirm with EFS id\n3. Mount targets are removed automatically",
      tip: "Stopped ≠ free. Delete EFS and terminate EC2 — don't just stop them.",
    },
  ];

  const s = steps[step];

  return (
    <div className="sv-card">
      <div className="sv-title">🧪 EFS Lab — Step-by-Step Walkthrough</div>

      <div className="efs-lab-timeline">
        {steps.map((st, i) => (
          <button
            key={i}
            className={`efs-lab-step ${step === i ? "active" : i < step ? "done" : ""}`}
            onClick={() => setStep(i)}
          >
            <span className="efs-lab-step-icon">{st.icon}</span>
            {i < steps.length - 1 && <span className="efs-lab-connector" />}
          </button>
        ))}
      </div>

      <div className="efs-lab-detail">
        <div className="efs-lab-detail-head">
          <span className="efs-lab-detail-icon">{s.icon}</span>
          <span className="efs-lab-detail-title">{s.title}</span>
        </div>
        <div className="efs-lab-detail-desc">{s.desc}</div>
        <pre className="efs-lab-code"><code>{s.code}</code></pre>
        <div className="efs-lab-tip">💡 {s.tip}</div>
      </div>

      <div className="efs-lab-nav">
        <button className="efs-lab-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</button>
        <span className="efs-lab-progress">{step + 1} / {steps.length}</span>
        <button className="efs-lab-btn primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>Next →</button>
      </div>
    </div>
  );
}
