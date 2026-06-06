import { useState } from "react";
import "./FSxVisuals.css";

/* ─── 1. FSx — 4 FILE SYSTEM SELECTOR ──────────────────────────────── */
export function FSxFileSystemSelector() {
  const [sel, setSel] = useState("ontap");

  const systems = [
    {
      id: "ontap", icon: "🟦", name: "NetApp ONTAP", color: "#0067c5",
      tagline: "Enterprise storage OS in the cloud",
      protocols: ["SMB", "NFS", "iSCSI"],
      best: "Large enterprises, hybrid cloud, lift-and-shift from on-prem NetApp",
      points: [
        "Flagship proprietary OS from NetApp (licensed)",
        "Full storage operating system — not built on Linux/Windows",
        "Cloud Volumes ONTAP (CVO) is the cloud-native version",
        "Supports SMB + NFS + iSCSI — the most protocols",
        "Active Directory + antivirus integration",
        "Latency < 1 ms, throughput 4–6 GB/s",
      ],
    },
    {
      id: "openzfs", icon: "🟧", name: "OpenZFS", color: "#e07b39",
      tagline: "Open-source file system, robust data integrity",
      protocols: ["NFS"],
      best: "Small-to-medium enterprise, personal cloud, archival/backup",
      points: [
        "Open source — no licensing fees (community-built)",
        "Needs a host OS (Linux); not a full OS itself",
        "Copy-on-write + checksums = strong data integrity",
        "Snapshots, cloning, compression, deduplication",
        "RAID-Z protects against disk failure",
        "Lowest latency (~0.5 ms), throughput 10–21 GB/s, NFS only",
      ],
    },
    {
      id: "windows", icon: "🪟", name: "Windows File Server", color: "#2e73b8",
      tagline: "Native Windows SMB file shares, fully managed",
      protocols: ["SMB"],
      best: "Lift-and-shift Windows workloads, Windows-native file sharing",
      points: [
        "Native Microsoft SMB file server — managed by AWS",
        "No VM, OS patching, or backups to manage yourself",
        "Heavily depends on Active Directory for auth",
        "Drop-in replacement for on-prem Windows file servers",
        "Terabyte-scale, auto-scaling storage & bandwidth",
      ],
    },
    {
      id: "lustre", icon: "⚡", name: "FSx for Lustre", color: "#8c4fff",
      tagline: "High-performance computing (HPC) parallel storage",
      protocols: ["Lustre"],
      best: "HPC, machine learning, big data — massive parallel throughput",
      points: [
        "Built for high performance computing (HPC)",
        "Parallel data storage & transfer at huge scale",
        "Sub-millisecond latency, hundreds of GB/s throughput",
        "Often paired with S3 for input/output datasets",
      ],
    },
  ];

  const cur = systems.find((s) => s.id === sel);

  return (
    <div className="sv-card">
      <div className="sv-title">🗂️ FSx — One Service, 4 File Systems</div>
      <p className="fsx-intro">
        When you click <strong>Create File System</strong> in FSx, you choose one of four file systems — each
        replicating a different real-world storage technology. A Solutions Architect picks the right one per workload.
      </p>

      <div className="fsx-fs-tabs">
        {systems.map((s) => (
          <button
            key={s.id}
            className={`fsx-fs-tab ${sel === s.id ? "active" : ""}`}
            style={{ "--fc": s.color }}
            onClick={() => setSel(s.id)}
          >
            <span className="fsx-fs-icon">{s.icon}</span>
            <span className="fsx-fs-name">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="fsx-fs-detail" style={{ "--fc": cur.color }}>
        <div className="fsx-fs-head">
          <span className="fsx-fs-big">{cur.icon}</span>
          <div>
            <div className="fsx-fs-title">{cur.name}</div>
            <div className="fsx-fs-tagline">{cur.tagline}</div>
          </div>
        </div>

        <div className="fsx-fs-protocols">
          <span className="fsx-fs-plabel">Protocols:</span>
          {cur.protocols.map((p) => (
            <span key={p} className="fsx-fs-proto">{p}</span>
          ))}
        </div>

        <div className="fsx-fs-best">🎯 Best for: <strong>{cur.best}</strong></div>

        <ul className="fsx-fs-points">
          {cur.points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
    </div>
  );
}

/* ─── 2. FSx BENEFITS ──────────────────────────────────────────────── */
export function FSxBenefits() {
  const [active, setActive] = useState(null);

  const benefits = [
    { icon: "🧰", title: "Fully Managed", color: "#3F8624", desc: "No servers, hard drives, networking gear, OS, or software to buy or maintain. No updates to worry about — your disk is 'ready to eat'." },
    { icon: "📈", title: "Scalable", color: "#2e73b8", desc: "Start at 1 TB minimum and scale to petabytes. Scaling on-prem storage is painful; here it's a few clicks." },
    { icon: "🚀", title: "High Performance", color: "#8c4fff", desc: "Low-latency, high-speed access. Choose provisioned IOPS and throughput for demanding workloads." },
    { icon: "🔒", title: "Secure", color: "#dd344c", desc: "One-click encryption at rest. Easy to protect any file system — same simplicity as EFS encryption." },
    { icon: "💰", title: "Cost Effective", color: "#e07b39", desc: "On-demand — set up in ~30 minutes, delete just as easily. Pay only for what you use, no big upfront storage project." },
  ];

  return (
    <div className="sv-card">
      <div className="sv-title">✨ Why FSx? — 5 Core Benefits</div>
      <div className="fsx-ben-grid">
        {benefits.map((b, i) => (
          <div
            key={i}
            className={`fsx-ben-card ${active === i ? "active" : ""}`}
            style={{ "--bc": b.color }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="fsx-ben-icon">{b.icon}</span>
            <div className="fsx-ben-title">{b.title}</div>
            <div className="fsx-ben-desc">{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 3. ONTAP DEPLOYMENT FORMS ────────────────────────────────────── */
export function ONTAPDeploymentExplorer() {
  const [sel, setSel] = useState("cvo");

  const forms = [
    {
      id: "ontap9", era: "On-Premises", icon: "🖥️", name: "ONTAP 9", color: "#8b949e",
      desc: "The OS that ships with physical NetApp hardware storage. You buy NetApp appliances and ONTAP 9 manages them.",
      tag: "Bare-metal hardware",
    },
    {
      id: "select", era: "Virtualization", icon: "📦", name: "ONTAP Select", color: "#2e73b8",
      desc: "Software-defined storage — turn your own existing virtual machine into NetApp storage. All ONTAP advantages, no NetApp hardware purchase.",
      tag: "Virtual appliance on your hardware",
    },
    {
      id: "cvo", era: "Cloud", icon: "☁️", name: "Cloud Volumes ONTAP (CVO)", color: "#0067c5",
      desc: "The cloud-native product used by FSx. Same ONTAP experience as a fully managed service on AWS / Azure / GCP. This is what FSx for NetApp ONTAP runs.",
      tag: "Used by FSx ✓",
    },
  ];

  const cur = forms.find((f) => f.id === sel);

  return (
    <div className="sv-card">
      <div className="sv-title">🟦 NetApp ONTAP — From Hardware to Cloud</div>
      <p className="fsx-intro">
        <strong>NetApp</strong> (originally "Network Appliances") is a data-management company famous for <strong>NAS</strong>
        (file storage). <strong>ONTAP</strong> is its flagship storage <em>operating system</em> — a full OS, not just
        software. It comes in three deployment forms as technology evolved:
      </p>

      <div className="fsx-ontap-flow">
        {forms.map((f, i) => (
          <div key={f.id} className="fsx-ontap-step">
            <button
              className={`fsx-ontap-card ${sel === f.id ? "active" : ""}`}
              style={{ "--oc": f.color }}
              onClick={() => setSel(f.id)}
            >
              <div className="fsx-ontap-era">{f.era}</div>
              <span className="fsx-ontap-icon">{f.icon}</span>
              <div className="fsx-ontap-name">{f.name}</div>
            </button>
            {i < forms.length - 1 && <span className="fsx-ontap-arrow">→</span>}
          </div>
        ))}
      </div>

      <div className="fsx-ontap-detail" style={{ "--oc": cur.color }}>
        <div className="fsx-ontap-detail-tag">{cur.tag}</div>
        <div className="fsx-ontap-detail-name">{cur.icon} {cur.name}</div>
        <div className="fsx-ontap-detail-desc">{cur.desc}</div>
      </div>
    </div>
  );
}

/* ─── 4. ZFS → OpenZFS TIMELINE ────────────────────────────────────── */
export function OpenZFSTimeline() {
  const [step, setStep] = useState(0);

  const events = [
    { year: "2001", icon: "💡", title: "ZFS Invented", desc: "Sun Microsystems begins building ZFS — a file system & logical volume manager for huge data, focused on solving data-corruption / integrity problems." },
    { year: "2005", icon: "📀", title: "Shipped with Solaris", desc: "ZFS released alongside the Solaris operating system — proprietary at this point." },
    { year: "2008", icon: "🔓", title: "Open-Sourced", desc: "Sun open-sources the ZFS source code. A large community of developers forms around it." },
    { year: "2010", icon: "🔒", title: "Oracle Acquires Sun", desc: "Oracle buys Sun and closes the source again — ZFS becomes proprietary/closed once more." },
    { year: "2010+", icon: "🌍", title: "OpenZFS is Born", desc: "The community forks the 2008 open code and continues it as OpenZFS — community-driven, no single owner, no licensing fees. This is the key difference from proprietary NetApp ONTAP." },
  ];

  const e = events[step];

  return (
    <div className="sv-card">
      <div className="sv-title">🟧 The Story of ZFS → OpenZFS</div>
      <div className="fsx-tl-track">
        {events.map((ev, i) => (
          <button
            key={i}
            className={`fsx-tl-node ${step === i ? "active" : i < step ? "done" : ""}`}
            onClick={() => setStep(i)}
          >
            <span className="fsx-tl-year">{ev.year}</span>
            <span className="fsx-tl-dot">{ev.icon}</span>
            {i < events.length - 1 && <span className="fsx-tl-line" />}
          </button>
        ))}
      </div>

      <div className="fsx-tl-detail">
        <div className="fsx-tl-detail-head"><span>{e.icon}</span> {e.title} <span className="fsx-tl-detail-year">{e.year}</span></div>
        <div className="fsx-tl-detail-desc">{e.desc}</div>
      </div>

      <div className="fsx-zfs-features">
        <div className="fsx-zfs-feat-title">🛡️ OpenZFS Data-Integrity Features</div>
        <div className="fsx-zfs-chips">
          {[
            ["Copy-on-Write", "Never overwrites original data — corruption-safe"],
            ["Checksums", "Detects & corrects silent data corruption"],
            ["Snapshots & Clones", "Point-in-time copies for instant restore"],
            ["Storage Pools", "Add devices to grow capacity (cluster-like)"],
            ["RAID-Z", "Protects against disk failure"],
            ["Atomic Transactions", "Operations complete fully or not at all"],
            ["Compression", "Shrinks data to save space"],
            ["Deduplication", "3 identical 100 MB files → store 100 MB once"],
          ].map(([t, d], i) => (
            <div key={i} className="fsx-zfs-chip">
              <span className="fsx-zfs-chip-t">{t}</span>
              <span className="fsx-zfs-chip-d">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 5. OpenZFS vs NetApp ONTAP — INTERACTIVE COMPARISON ──────────── */
export function OpenZFSvsONTAP() {
  const rows = [
    { f: "Latency", zfs: "~0.5 ms", ontap: "< 1 ms", win: "zfs" },
    { f: "Max throughput / file system", zfs: "10–21 GB/s", ontap: "4–6 GB/s", win: "zfs" },
    { f: "Max file system size", zfs: "~500 TB", ontap: "Virtually unlimited", win: "ontap" },
    { f: "Client compatibility", zfs: "Windows / Linux / macOS", ontap: "Windows / Linux / macOS", win: "tie" },
    { f: "Protocol support", zfs: "NFS only", ontap: "SMB + NFS + iSCSI", win: "ontap" },
    { f: "AWS compute (EC2/ECS/EKS)", zfs: "All three", ontap: "All three", win: "tie" },
    { f: "Active Directory support", zfs: "❌ No", ontap: "✅ Yes", win: "ontap" },
    { f: "Antivirus integration", zfs: "❌ No", ontap: "✅ Yes", win: "ontap" },
    { f: "Deployment (Single/Multi-AZ)", zfs: "Both", ontap: "Both", win: "tie" },
    { f: "SLA", zfs: "99.5%", ontap: "99.9% (single) / 99.99% (multi)", win: "ontap" },
  ];

  const [highlight, setHighlight] = useState(true);

  return (
    <div className="sv-card">
      <div className="sv-title">⚖️ OpenZFS vs NetApp ONTAP (in FSx)</div>

      <div className="fsx-cmp-controls">
        <button className={`fsx-cmp-toggle ${highlight ? "on" : ""}`} onClick={() => setHighlight((v) => !v)}>
          {highlight ? "✓ Highlighting winners" : "Highlight winners"}
        </button>
        <span className="fsx-cmp-legend">
          <span className="fsx-cmp-key zfs">OpenZFS edge</span>
          <span className="fsx-cmp-key ontap">ONTAP edge</span>
          <span className="fsx-cmp-key tie">Tie</span>
        </span>
      </div>

      <div className="fsx-cmp-table">
        <div className="fsx-cmp-row head">
          <span>Factor</span>
          <span className="fsx-cmp-zfs">🟧 OpenZFS</span>
          <span className="fsx-cmp-ontap">🟦 NetApp ONTAP</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="fsx-cmp-row">
            <span className="fsx-cmp-feat">{r.f}</span>
            <span className={highlight && r.win === "zfs" ? "fsx-cmp-win zfs" : highlight && r.win === "tie" ? "fsx-cmp-tie" : ""}>{r.zfs}</span>
            <span className={highlight && r.win === "ontap" ? "fsx-cmp-win ontap" : highlight && r.win === "tie" ? "fsx-cmp-tie" : ""}>{r.ontap}</span>
          </div>
        ))}
      </div>

      <div className="fsx-cmp-verdict">
        <div><strong>🟧 Pick OpenZFS</strong> — open-source (no licence fees), best raw latency/throughput, small-to-medium / personal / archival storage.</div>
        <div><strong>🟦 Pick ONTAP</strong> — large enterprise & hybrid cloud, needs SMB/iSCSI, Active Directory, antivirus, unlimited size, highest SLA.</div>
      </div>
    </div>
  );
}

/* ─── 6. WINDOWS FILE SERVER — ON-PREM vs MANAGED ──────────────────── */
export function WindowsFileServerScenario() {
  const [mode, setMode] = useState("local"); // local | onprem | fsx

  const modes = {
    local: {
      label: "1. Local Storage", color: "#f85149",
      headline: "Each PC stores data on its own drive",
      problems: [
        "Must care for every hard drive — one fails, data is lost",
        "Must back up every single machine",
        "4 PCs is manageable… 40 PCs is a nightmare for admins",
      ],
      good: false,
    },
    onprem: {
      label: "2. On-Prem File Server", color: "#e3b341",
      headline: "One central Windows SMB file server",
      problems: [
        "You must ensure high availability — downtime = everyone blocked",
        "You patch the OS and update antivirus yourself",
        "You set up & configure the SMB server",
        "Scaling storage / network bandwidth as you grow is hard",
      ],
      good: false,
    },
    fsx: {
      label: "3. FSx for Windows", color: "#3fb950",
      headline: "Fully managed Windows SMB — AWS runs it",
      problems: [
        "No VM, OS patching, or backups to manage — AWS handles it",
        "Just configure SMB and your storage is ready",
        "Terabyte-scale, auto-scaling storage & bandwidth",
        "Connect EC2, ECS, EKS, or on-prem servers",
      ],
      good: true,
    },
  };

  const m = modes[mode];

  return (
    <div className="sv-card">
      <div className="sv-title">🪟 FSx for Windows File Server — Why Managed Wins</div>

      <div className="fsx-wfs-switch">
        {Object.keys(modes).map((k) => (
          <button
            key={k}
            className={`fsx-wfs-btn ${mode === k ? "active" : ""}`}
            style={{ "--wc": modes[k].color }}
            onClick={() => setMode(k)}
          >
            {modes[k].label}
          </button>
        ))}
      </div>

      <div className="fsx-wfs-stage">
        <div className="fsx-wfs-pcs">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="fsx-wfs-pc">
              🖥️
              {mode === "local" && <span className="fsx-wfs-disk warn">💾</span>}
            </div>
          ))}
        </div>

        {mode !== "local" && (
          <>
            <div className="fsx-wfs-links">{[0, 1, 2, 3].map((i) => <span key={i} className="fsx-wfs-line" style={{ "--wc": m.color }} />)}</div>
            <div className="fsx-wfs-server" style={{ "--wc": m.color }}>
              <span className="fsx-wfs-server-icon">{mode === "fsx" ? "☁️" : "🗄️"}</span>
              <div className="fsx-wfs-server-label">
                {mode === "fsx" ? "FSx — Managed SMB Server" : "Self-managed SMB File Server"}
              </div>
              <div className="fsx-wfs-proto">SMB protocol</div>
            </div>
          </>
        )}
      </div>

      <div className="fsx-wfs-detail" style={{ "--wc": m.color }}>
        <div className="fsx-wfs-headline">{m.good ? "✅" : "⚠️"} {m.headline}</div>
        <ul className="fsx-wfs-points">
          {m.problems.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
    </div>
  );
}

/* ─── 7. ACTIVE DIRECTORY AUTH FLOW ────────────────────────────────── */
export function ActiveDirectoryFlow() {
  const [running, setRunning] = useState(false);
  const [verdict, setVerdict] = useState("allow"); // allow | deny

  const play = (v) => {
    setVerdict(v);
    setRunning(false);
    setTimeout(() => setRunning(true), 50);
    setTimeout(() => setRunning(false), 2400);
  };

  return (
    <div className="sv-card">
      <div className="sv-title">🔐 Active Directory — The Authority Behind Windows File Servers</div>
      <p className="fsx-intro">
        Windows File Server depends on <strong>Active Directory (AD)</strong>. Instead of creating users on every
        machine, AD centralises identity in a <strong>Domain Controller</strong>. Every file access is authorised by AD.
      </p>

      <div className="fsx-ad-stage">
        <div className="fsx-ad-node user">
          <span className="fsx-ad-icon">🧑‍💻</span>
          <span className="fsx-ad-label">User A<br/>Workstation</span>
        </div>

        <div className="fsx-ad-node file">
          <span className="fsx-ad-icon">🗄️</span>
          <span className="fsx-ad-label">File Server<br/>(SMB / FSx)</span>
        </div>

        <div className="fsx-ad-node dc">
          <span className="fsx-ad-icon">👑</span>
          <span className="fsx-ad-label">Domain Controller<br/>(Active Directory)</span>
        </div>

        {/* animated packets */}
        {running && (
          <>
            <span className="fsx-ad-packet p1">📄 access request</span>
            <span className="fsx-ad-packet p2">❓ allow?</span>
            <span className={`fsx-ad-packet p3 ${verdict}`}>{verdict === "allow" ? "✅ allow" : "⛔ deny"}</span>
          </>
        )}
      </div>

      <div className={`fsx-ad-result ${running ? verdict : "idle"}`}>
        {!running ? "▶ Click a button to simulate an access request" :
          verdict === "allow" ? "Domain Controller checks the file's ACL → User A has permission → access granted." :
          "Domain Controller checks the file's ACL → User B lacks permission → access denied."}
      </div>

      <div className="fsx-ad-controls">
        <button className="fsx-ad-btn allow" onClick={() => play("allow")}>▶ Simulate authorised access</button>
        <button className="fsx-ad-btn deny" onClick={() => play("deny")}>▶ Simulate denied access</button>
      </div>

      <div className="fsx-ad-note">
        💡 One central place manages all users, passwords, and permissions (the <em>domain</em>, e.g. <code>xyz.local</code>).
        Add/remove a user once — not on 100 machines. This is why AD is a prerequisite for FSx for Windows File Server.
      </div>
    </div>
  );
}

/* ─── 8. FSx ONTAP LAB ─────────────────────────────────────────────── */
export function FSxONTAPLab() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: "🛡️", title: "1. Create Security Groups",
      desc: "server-SG protects the EC2 instances (SSH only). ontap-SG protects FSx — allowing the NFS ports only from server-SG members.",
      code: "server-SG:\n  Inbound: TCP 22 (SSH) ← 0.0.0.0/0\n\nontap-SG:\n  Inbound: TCP 111  (Custom TCP) ← server-SG\n  Inbound: TCP 2049 (NFS)        ← server-SG",
      tip: "Port 2049 (NFS) is in the dropdown; port 111 isn't — add it as 'Custom TCP'.",
    },
    {
      icon: "💻", title: "2. Launch 2 Linux EC2 (different AZs)",
      desc: "Two Amazon Linux t2.micro instances — server-1 in ap-south-1a, server-2 in ap-south-1b. Attach server-SG. We'll use NFS to reach ONTAP.",
      code: "server-1 → Amazon Linux, t2.micro, ap-south-1a, SG: server-SG\nserver-2 → Amazon Linux, t2.micro, ap-south-1b, SG: server-SG",
      tip: "ONTAP also supports SMB (Windows) and iSCSI — this lab uses NFS on Linux.",
    },
    {
      icon: "🟦", title: "3. Create FSx for NetApp ONTAP",
      desc: "FSx → Create → NetApp ONTAP → Standard create. Choose Single-AZ (faster) or Multi-AZ (HA). Minimum size is 1024 GB (1 TB).",
      code: "Name: new-ontap\nDeployment: Single-AZ\nStorage: 1024 GB (1 TB minimum)\nIOPS: Automatic (3 IOPS/GB)  — or provision up to 80,000\nThroughput: 128 MB/s default — up to 2048 MB/s\nSG: ontap-SG",
      tip: "⚠️ Single-AZ can't later become Multi-AZ. Red items at review = locked after creation; green = editable.",
    },
    {
      icon: "🖥️", title: "4. Storage Virtual Machine (SVM)",
      desc: "ONTAP creates a Storage Virtual Machine — a Linux-based ONTAP VM you can administer (set its admin password, run ONTAP OS commands). Optionally join Active Directory for SMB.",
      code: "SVM name: ontap-vm\n(Set admin password — optional)\n(Join Active Directory — only if using SMB)",
      tip: "The SVM is how FSx exposes ONTAP — you can SSH in and use real ONTAP commands.",
    },
    {
      icon: "📦", title: "5. Create a Volume",
      desc: "Inside the 1 TB file system, create a volume (min 20 MB). Optionally enable data protection, storage efficiency (dedup/compression), snapshots, tiering.",
      code: "volume_1 → 500 MB (resizable later, e.g. → 700 MB)\nSnapshots: none (for the lab)\nStorage efficiency: off (for the lab)",
      tip: "The root volume (1 GB) is for the ONTAP OS itself; your data volume is separate.",
    },
    {
      icon: "📂", title: "6. Mount on Both Servers (NFS)",
      desc: "From FSx → Volumes → Attach, copy the mount commands. Create a mount folder, then mount the ONTAP volume over NFS on each Linux server.",
      code: "sudo -i\nmkdir /fsx\nmount -t nfs <svm-ip>:/vol/volume_1 /fsx\ncd /fsx && ls",
      tip: "Use the exact commands shown under Volumes → Attach. No errors = success.",
    },
    {
      icon: "✅", title: "7. Verify Shared Access",
      desc: "Create a file on server-1; it appears instantly on server-2. Shared storage across two AZs, proven.",
      code: "# server-1\necho 'from server-1' > /fsx/note.txt\nmkdir /fsx/fox\n\n# server-2 — same files appear\ncat /fsx/note.txt   → from server-1",
      tip: "Both Linux instances read/write the same ONTAP volume in real time.",
    },
    {
      icon: "🧹", title: "8. Clean Up (in order!)",
      desc: "ONTAP must be deleted in sequence or it errors: delete the volume → delete the Storage Virtual Machine → delete the file system. Then terminate the EC2 instances.",
      code: "1. Delete volume (skip snapshot)\n2. Delete Storage Virtual Machine\n3. Delete the ONTAP file system\n4. Terminate server-1 & server-2",
      tip: "You can't delete the file system while it still has an SVM/volume — order matters.",
    },
  ];

  const s = steps[step];

  return (
    <div className="sv-card">
      <div className="sv-title">🧪 Lab — FSx for NetApp ONTAP as Shared Storage</div>

      <div className="fsx-lab-timeline">
        {steps.map((st, i) => (
          <button
            key={i}
            className={`fsx-lab-step ${step === i ? "active" : i < step ? "done" : ""}`}
            onClick={() => setStep(i)}
          >
            <span className="fsx-lab-step-icon">{st.icon}</span>
            {i < steps.length - 1 && <span className="fsx-lab-connector" />}
          </button>
        ))}
      </div>

      <div className="fsx-lab-detail">
        <div className="fsx-lab-detail-head">
          <span className="fsx-lab-detail-icon">{s.icon}</span>
          <span className="fsx-lab-detail-title">{s.title}</span>
        </div>
        <div className="fsx-lab-detail-desc">{s.desc}</div>
        <pre className="fsx-lab-code"><code>{s.code}</code></pre>
        <div className="fsx-lab-tip">💡 {s.tip}</div>
      </div>

      <div className="fsx-lab-nav">
        <button className="fsx-lab-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</button>
        <span className="fsx-lab-progress">{step + 1} / {steps.length}</span>
        <button className="fsx-lab-btn primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>Next →</button>
      </div>
    </div>
  );
}
