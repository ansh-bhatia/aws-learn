import { useState } from "react";
import "./StorageVisuals.css";
import "./StorageVisuals3.css";
import "./StorageVisuals6.css";

/* ─── ALL FOUR FSx FILE SYSTEMS COMPARED ───────────────────────────── */
export function FSxAllFourMatrix() {
  const [row, setRow] = useState("protocols");

  const cols = [
    { k: "ontap", n: "NetApp ONTAP" },
    { k: "zfs", n: "OpenZFS" },
    { k: "windows", n: "Windows File Server" },
    { k: "lustre", n: "Lustre" },
  ];

  const rows = {
    latency: { label: "Latency", v: { ontap: "< 1 ms", zfs: "0.5 ms ✅", windows: "< 1 ms", lustre: "< 1 ms" } },
    throughput: { label: "Max throughput", v: { ontap: "4–6 GB/s", zfs: "10–21 GB/s", windows: "—", lustre: "1,000 GB/s ✅" } },
    size: { label: "Max file system size", v: { ontap: "virtually unlimited ✅", zfs: "512 TB", windows: "TB-scale", lustre: "multiple PB" } },
    clients: { label: "Client compatibility", v: { ontap: "Win · Linux · macOS", zfs: "Win · Linux · macOS", windows: "Win · Linux · macOS", lustre: "Linux only ⚠️" } },
    protocols: { label: "Protocols", v: { ontap: "SMB · NFS · iSCSI ✅", zfs: "NFS only", windows: "SMB", lustre: "POSIX-compliant custom" } },
    ad: { label: "Active Directory", v: { ontap: "yes", zfs: "no", windows: "yes", lustre: "no" } },
    av: { label: "Antivirus integration", v: { ontap: "yes", zfs: "no", windows: "yes", lustre: "no" } },
    deploy: { label: "Deployment", v: { ontap: "Single + Multi-AZ", zfs: "Single + Multi-AZ", windows: "Single + Multi-AZ", lustre: "Single-AZ only ⚠️" } },
    sla: { label: "SLA", v: { ontap: "99.99% Multi-AZ ✅", zfs: "99.5%", windows: "99.99% Multi-AZ", lustre: "99.5%" } },
    licence: { label: "Licensing", v: { ontap: "proprietary — fees", zfs: "open source — free", windows: "Microsoft", lustre: "open source — free" } },
  };

  const notes = {
    protocols: "ONTAP is the only one supporting all three of SMB, NFS and iSCSI — which is why it suits mixed Windows/Linux estates. OpenZFS is NFS only, so no Windows clients over native protocol.",
    throughput: "Look at the gap. Lustre at 1,000 GB/s is in a completely different class — that is what 'high performance computing' means in practice.",
    clients: "Lustre is Linux-only because its protocol is POSIX-compliant, and Linux is a POSIX operating system.",
    deploy: "Lustre is Single-AZ only. Multi-AZ would mean AWS duplicating an enormous cluster across zones, which would be prohibitively expensive.",
    size: "ONTAP's virtually unlimited capacity is its main edge over OpenZFS, which caps at 512 TB.",
    licence: "OpenZFS and Lustre are community-developed and carry no licence fee. ONTAP is NetApp's proprietary operating system, so licensing costs apply.",
    ad: "Active Directory support matters enormously in corporate environments where identity is already centralised there. OpenZFS and Lustre have none.",
  };

  const cls = (v) => (v === "yes" ? "yes" : v === "no" ? "no" : "txt");

  return (
    <div className="sv-card st3-card">
      <div className="sv-title st3-title">🗂️ All Four FSx File Systems Compared</div>
      <p className="st3-intro">
        As a solutions architect you are the one choosing between these. Pick a row to compare all four on that
        dimension.
      </p>

      <div className="st3-rowpicker">
        {Object.keys(rows).map((k) => (
          <button key={k} className={`st3-rowbtn ${row === k ? "active" : ""}`} onClick={() => setRow(k)}>
            {rows[k].label}
          </button>
        ))}
      </div>

      <div className="st6-matrix">
        {cols.map((c) => {
          const v = rows[row].v[c.k];
          return (
            <div key={c.k} className={`st6-cell ${cls(v)}`}>
              <div className="st6-cell-name">{c.n}</div>
              <div className="st6-cell-val">{v === "yes" ? "✅" : v === "no" ? "❌" : v}</div>
            </div>
          );
        })}
      </div>

      {notes[row] && <div className="st3-note">{notes[row]}</div>}
    </div>
  );
}

/* ─── LUSTRE PROFILE ───────────────────────────────────────────────── */
export function LustreProfile() {
  const [tab, setTab] = useState("what");

  const tabs = {
    what: {
      name: "What it is",
      body: [
        ["🧬", "The name", "Lustre = Linux + Cluster. It is a clustered file system built on Linux."],
        ["🖧", "Distributed", "Many nodes join to form one file system. Add nodes to add capacity and processing power — no single-machine bottleneck."],
        ["🔓", "Open source", "Community-developed, no licence fee — like OpenZFS."],
      ],
    },
    use: {
      name: "Use cases",
      body: [
        ["🔬", "Scientific research", "Supercomputing workloads and large-scale simulation."],
        ["📊", "Big data analysis", "Processing datasets far beyond a single machine."],
        ["🎬", "Media & entertainment", "Live rendering — cricket and football matches rendered as they happen need massive parallel storage throughput."],
        ["🤖", "Machine learning", "Training needs enormous data throughput."],
        ["💹", "Financial modelling", "Heavy parallel computation."],
      ],
    },
    hist: {
      name: "History",
      body: [
        ["1990s", "Peter Braam", "Develops the technology and founds Cluster File Systems in 2001."],
        ["2007", "Sun Microsystems", "Acquires Cluster File Systems."],
        ["2010", "Oracle", "Acquires Sun — and Oracle favours closed source."],
        ["→", "The community forks", "Groups in the US and Europe continue Lustre as an open source project, exactly as happened with ZFS → OpenZFS."],
      ],
    },
    adv: {
      name: "Why FSx",
      body: [
        ["⚡", "Performance", "Up to 1,000 GB/s throughput and millions of IOPS."],
        ["🪣", "S3 integration", "Pull unprocessed data from S3, process it, write results back to S3."],
        ["🎛️", "Fully managed", "No hardware, no networking, no software to run — pay as you go."],
        ["⏱️", "Deployment speed", "Building a Lustre cluster on-premises takes 6–8 months. Here it is ready in about 30 minutes."],
        ["💾", "Two repository types", "Persistent keeps your data; Scratch discards it once processing finishes."],
      ],
    },
  };

  const t = tabs[tab];

  return (
    <div className="sv-card st3-card">
      <div className="sv-title st3-title">🚀 FSx for Lustre — High Performance Computing</div>
      <p className="st3-intro">
        <strong>Exam keyword:</strong> if a question says <strong>HPC</strong> or <strong>high performance
        computing</strong>, the answer is almost always <strong>Lustre</strong>.
      </p>

      <div className="st3-steps">
        {Object.keys(tabs).map((k) => (
          <button key={k} className={`st3-step ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
            {tabs[k].name}
          </button>
        ))}
      </div>

      <div className="st6-list">
        {t.body.map(([icon, title, desc]) => (
          <div key={title} className="st6-row">
            <span className="st6-row-icon">{icon}</span>
            <div>
              <div className="st6-row-title">{title}</div>
              <div className="st6-row-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="st3-note">
        Two limits to remember: <strong>Linux only</strong> (the protocol is POSIX-compliant), and{" "}
        <strong>Single-AZ only</strong> with a <strong>99.5% SLA</strong> — Multi-AZ would mean duplicating an
        enormous cluster across zones.
      </div>
    </div>
  );
}
