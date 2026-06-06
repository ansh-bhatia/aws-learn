import { useState } from "react";
import "./StorageVisuals2.css";

/* ─── 1. EBS VOLUME TYPES EXPLORER ──────────────────────────────── */
export function EBSVolumeTypesExplorer() {
  const [selected, setSelected] = useState("gp3");
  const [filterCat, setFilterCat] = useState("all");

  const volumes = [
    {
      id: "gp3", cat: "ssd", label: "GP3", full: "General Purpose SSD v3",
      badge: "✅ Recommended", badgeColor: "#3fb950",
      icon: "⚡", color: "#3fb950",
      maxIops: "16,000", maxThroughput: "1,000 MB/s",
      baseIops: "3,000 flat (any size)", configIops: true, configThroughput: true,
      size: "1 GB – 16 TiB", multiAttach: false, blockExpress: false, boot: true,
      burst: false, durability: "99.8–99.9%",
      costPerTB: "$81/mo", costNote: "~20% cheaper than GP2",
      useCase: "Boot volumes, virtual desktops, dev/test, small-medium databases, low-latency apps",
      pros: ["3,000 IOPS regardless of size — no overpaying", "IOPS and throughput independently configurable", "Best price-performance for general use"],
      cons: ["Max 16,000 IOPS — not for extreme DB workloads"],
    },
    {
      id: "gp2", cat: "ssd", label: "GP2", full: "General Purpose SSD v2",
      badge: "⚠️ Legacy", badgeColor: "#e3b341",
      icon: "💾", color: "#e3b341",
      maxIops: "16,000", maxThroughput: "250 MB/s",
      baseIops: "3 IOPS per GB (min 100)", configIops: false, configThroughput: false,
      size: "1 GB – 16 TiB", multiAttach: false, blockExpress: false, boot: true,
      burst: "Up to 3,000 (credit-based)", durability: "99.8–99.9%",
      costPerTB: "$102/mo", costNote: "More expensive than GP3",
      useCase: "Same as GP3 — but prefer GP3",
      pros: ["Credit burst for occasional spikes", "Widely supported, mature technology"],
      cons: ["IOPS tied to size — must overprovision to get IOPS", "Max 250 MB/s throughput", "More expensive than GP3 for same or worse performance"],
    },
    {
      id: "io2", cat: "ssd", label: "io2", full: "Provisioned IOPS SSD v2",
      badge: "🏆 Best Durability", badgeColor: "#8c4fff",
      icon: "🚀", color: "#8c4fff",
      maxIops: "64,000 (256,000 w/ Block Express)", maxThroughput: "1,000 MB/s (4,000 w/ BE)",
      baseIops: "Fully provisioned", configIops: true, configThroughput: false,
      size: "4 GB – 16 TiB (64 TiB w/ BE)", multiAttach: true, blockExpress: true, boot: true,
      burst: false, durability: "99.999% (five 9s)",
      costPerTB: "$128/mo + IOPS charge", costNote: "Same price as io1 — better durability",
      useCase: "Mission-critical Oracle/SAP/SQL databases, highest IOPS workloads",
      pros: ["Five 9s durability — best available", "Block Express: 256K IOPS, sub-ms latency", "Multi-attach for 16 instances", "Same cost as io1"],
      cons: ["Block Express requires specific instance types", "Most expensive SSD option"],
    },
    {
      id: "io1", cat: "ssd", label: "io1", full: "Provisioned IOPS SSD v1",
      badge: "Legacy", badgeColor: "#555e6e",
      icon: "💽", color: "#555e6e",
      maxIops: "64,000", maxThroughput: "1,000 MB/s",
      baseIops: "Fully provisioned", configIops: true, configThroughput: false,
      size: "4 GB – 16 TiB", multiAttach: true, blockExpress: false, boot: true,
      burst: false, durability: "99.9%",
      costPerTB: "$128/mo + IOPS charge", costNote: "Same price as io2 but lower durability",
      useCase: "High IOPS workloads — prefer io2",
      pros: ["Provisioned IOPS up to 64,000", "Multi-attach support"],
      cons: ["io2 has same cost but 99.999% durability — prefer io2", "No Block Express"],
    },
    {
      id: "st1", cat: "hdd", label: "st1", full: "Throughput Optimized HDD",
      badge: "Big Data", badgeColor: "#2e73b8",
      icon: "📦", color: "#2e73b8",
      maxIops: "500", maxThroughput: "500 MB/s",
      baseIops: "40 IOPS/TB baseline", configIops: false, configThroughput: false,
      size: "125 GB – 16 TiB", multiAttach: false, blockExpress: false, boot: false,
      burst: false, durability: "99.8–99.9%",
      costPerTB: "$46/mo", costNote: "Much cheaper than SSD for sequential workloads",
      useCase: "Big data, data warehouses, log processing, Kafka — large sequential reads",
      pros: ["High throughput at low cost", "Good for sequential/streaming workloads"],
      cons: ["Cannot be used as boot volume", "Low IOPS — bad for random I/O", "Not for databases"],
    },
    {
      id: "sc1", cat: "hdd", label: "sc1", full: "Cold HDD",
      badge: "💰 Cheapest", badgeColor: "#3fb950",
      icon: "🧊", color: "#3fb950",
      maxIops: "250", maxThroughput: "250 MB/s",
      baseIops: "12 IOPS/TB baseline", configIops: false, configThroughput: false,
      size: "125 GB – 16 TiB", multiAttach: false, blockExpress: false, boot: false,
      burst: false, durability: "99.8–99.9%",
      costPerTB: "$15/mo", costNote: "Cheapest EBS option — 3× cheaper than st1",
      useCase: "Infrequently accessed archives, cold datasets, backup storage",
      pros: ["Lowest cost EBS", "Good for cold data that rarely needs access"],
      cons: ["Lowest performance", "Cannot be used as boot volume", "Not for active workloads"],
    },
    {
      id: "magnetic", cat: "magnetic", label: "Std", full: "Magnetic (Standard)",
      badge: "⛔ Avoid", badgeColor: "#f85149",
      icon: "🧲", color: "#f85149",
      maxIops: "~100", maxThroughput: "40–90 MB/s",
      baseIops: "Variable (sequential)", configIops: false, configThroughput: false,
      size: "1 GB – 1 TiB", multiAttach: false, blockExpress: false, boot: true,
      burst: "Yes (limited)", durability: "99.8–99.9%",
      costPerTB: "$51/mo", costNote: "More expensive than st1 despite worse performance — AWS is retiring it",
      useCase: "Do not use — AWS is phasing this out. Use sc1 instead.",
      pros: ["Boot volume support (not recommended)", "Burst capacity"],
      cons: ["Worst performance", "More expensive than better alternatives", "Being retired — avoid"],
    },
  ];

  const cats = [
    { id: "all", label: "All Types" },
    { id: "ssd", label: "⚡ SSD" },
    { id: "hdd", label: "📦 HDD" },
    { id: "magnetic", label: "🧲 Magnetic" },
  ];

  const filtered = volumes.filter(v => filterCat === "all" || v.cat === filterCat);
  const cur = volumes.find(v => v.id === selected);

  return (
    <div className="sv2-card">
      <div className="sv2-title">💾 EBS Volume Types Explorer</div>
      <div className="evt-cat-row">
        {cats.map(c => (
          <button key={c.id} className={`evt-cat-btn ${filterCat === c.id ? "active" : ""}`} onClick={() => setFilterCat(c.id)}>{c.label}</button>
        ))}
      </div>
      <div className="evt-chips">
        {filtered.map(v => (
          <button
            key={v.id}
            className={`evt-chip ${selected === v.id ? "active" : ""}`}
            style={{ "--vc": v.color }}
            onClick={() => setSelected(v.id)}
          >
            <span className="evt-chip-icon">{v.icon}</span>
            <div>
              <div className="evt-chip-label">{v.label}</div>
              <div className="evt-chip-cat">{v.cat.toUpperCase()}</div>
            </div>
            <span className="evt-chip-badge" style={{ background: v.badgeColor + "25", color: v.badgeColor }}>{v.badge}</span>
          </button>
        ))}
      </div>

      {cur && (
        <div className="evt-detail" style={{ "--vc": cur.color }}>
          <div className="evt-detail-header">
            <div className="evt-detail-icon">{cur.icon}</div>
            <div>
              <div className="evt-detail-name">{cur.label} — {cur.full}</div>
              <span className="evt-detail-badge" style={{ background: cur.badgeColor + "20", color: cur.badgeColor }}>{cur.badge}</span>
            </div>
          </div>

          <div className="evt-specs-grid">
            {[
              { l: "Max IOPS", v: cur.maxIops },
              { l: "Max Throughput", v: cur.maxThroughput },
              { l: "Base IOPS", v: cur.baseIops },
              { l: "Volume Size", v: cur.size },
              { l: "Durability", v: cur.durability },
              { l: "Cost (1 TB)", v: cur.costPerTB },
              { l: "Boot Volume", v: cur.boot ? "✅ Yes" : "❌ No" },
              { l: "Multi-Attach", v: cur.multiAttach ? "✅ Nitro instances" : "❌ No" },
              { l: "Block Express", v: cur.blockExpress ? "✅ Specific instance types" : "❌ No" },
              { l: "Config IOPS", v: cur.configIops ? "✅ Yes" : "❌ Fixed" },
              { l: "Burst", v: cur.burst || "❌ No" },
              { l: "Cost Note", v: cur.costNote },
            ].map((s, i) => (
              <div key={i} className="evt-spec">
                <div className="evt-spec-label">{s.l}</div>
                <div className="evt-spec-val">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="evt-usecase"><span>🎯</span> {cur.useCase}</div>

          <div className="evt-pros-cons">
            <div className="evt-pros">
              <div className="evt-pc-title">✅ Pros</div>
              {cur.pros.map((p, i) => <div key={i} className="evt-pc-item">{p}</div>)}
            </div>
            <div className="evt-cons">
              <div className="evt-pc-title">❌ Cons</div>
              {cur.cons.map((c, i) => <div key={i} className="evt-pc-item">{c}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 2. GP2 vs GP3 CALCULATOR ───────────────────────────────────── */
export function GP2vsGP3Calculator() {
  const [dataGB, setDataGB] = useState(50);
  const [requiredIops, setRequiredIops] = useState(900);

  const gp2NeededGB = Math.ceil(Math.max(requiredIops / 3, dataGB, 33)); // min 100 IOPS = 33GB
  const gp2WastedGB = gp2NeededGB - dataGB;
  const gp2ActualIops = Math.max(gp2NeededGB * 3, 100);
  const gp2Cost = ((gp2NeededGB / 1000) * 102).toFixed(2);
  const gp3Cost = ((dataGB / 1000) * 81).toFixed(2);
  const savings = (parseFloat(gp2Cost) - parseFloat(gp3Cost)).toFixed(2);
  const gp3Iops = Math.max(3000, requiredIops);

  return (
    <div className="sv2-card">
      <div className="sv2-title">🧮 GP2 vs GP3 — The IOPS Problem Calculator</div>
      <div className="gpc-concept">
        <div className="gpc-rule gp2">
          <div className="gpc-rule-title">GP2 Rule</div>
          <div className="gpc-rule-formula">IOPS = Volume Size (GB) × 3</div>
          <div className="gpc-rule-note">Min 100 IOPS · Max 16,000 IOPS<br/>IOPS tied to size — you must buy storage to buy IOPS</div>
        </div>
        <div className="gpc-rule gp3">
          <div className="gpc-rule-title">GP3 Rule</div>
          <div className="gpc-rule-formula">IOPS = 3,000 (always, any size)</div>
          <div className="gpc-rule-note">Pay for extra IOPS separately · IOPS independent of size<br/>Only pay for storage you actually need</div>
        </div>
      </div>

      <div className="gpc-inputs">
        <div className="gpc-input-group">
          <label>Data to Store: <strong>{dataGB} GB</strong></label>
          <input type="range" min="1" max="500" value={dataGB} onChange={e => setDataGB(+e.target.value)} className="gpc-slider" />
        </div>
        <div className="gpc-input-group">
          <label>Required IOPS: <strong>{requiredIops}</strong></label>
          <input type="range" min="100" max="16000" step="100" value={requiredIops} onChange={e => setRequiredIops(+e.target.value)} className="gpc-slider" />
        </div>
      </div>

      <div className="gpc-results">
        <div className="gpc-result-col gp2">
          <div className="gpc-res-title">GP2</div>
          <div className="gpc-res-row"><span>Data you need:</span><span>{dataGB} GB</span></div>
          <div className="gpc-res-row warn"><span>Volume you must create:</span><span>{gp2NeededGB} GB</span></div>
          <div className="gpc-res-row warn"><span>Wasted storage:</span><span>{gp2WastedGB} GB</span></div>
          <div className="gpc-res-row"><span>Actual IOPS you get:</span><span>{gp2ActualIops.toLocaleString()}</span></div>
          <div className="gpc-res-row cost"><span>Monthly cost (est.):</span><span>${gp2Cost}</span></div>
          {gp2WastedGB > 0 && <div className="gpc-waste-bar-wrap">
            <div className="gpc-bar-label">Storage utilisation</div>
            <div className="gpc-waste-bar">
              <div className="gpc-used" style={{ width: `${(dataGB/gp2NeededGB)*100}%` }}>{dataGB} GB used</div>
              <div className="gpc-wasted">{gp2WastedGB} GB wasted</div>
            </div>
          </div>}
        </div>
        <div className="gpc-vs">VS</div>
        <div className="gpc-result-col gp3">
          <div className="gpc-res-title">GP3 ✅</div>
          <div className="gpc-res-row"><span>Data you need:</span><span>{dataGB} GB</span></div>
          <div className="gpc-res-row good"><span>Volume you create:</span><span>{dataGB} GB</span></div>
          <div className="gpc-res-row good"><span>Wasted storage:</span><span>0 GB</span></div>
          <div className="gpc-res-row"><span>Base IOPS (free):</span><span>3,000</span></div>
          <div className="gpc-res-row good"><span>Extra IOPS if needed:</span><span>Pay per 1,000 IOPS</span></div>
          <div className="gpc-res-row cost"><span>Monthly cost (est.):</span><span>${gp3Cost}</span></div>
          <div className="gpc-savings">💰 You save ~${savings}/mo vs GP2</div>
        </div>
      </div>
    </div>
  );
}

/* ─── 3. SNAPSHOT WORKFLOW ───────────────────────────────────────── */
export function SnapshotWorkflow() {
  const [useCase, setUseCase] = useState("backup");

  const useCases = [
    {
      id: "backup", icon: "🛡️", label: "Backup & Restore",
      steps: [
        { label: "EBS Volume", icon: "💾", note: "Your live data volume", side: "left" },
        { label: "Create Snapshot", icon: "📸", note: "Actions → Create Snapshot\nStored in S3 (managed)", side: "mid" },
        { label: "Data deleted?", icon: "⚠️", note: "Accidental deletion or corruption", side: "left" },
        { label: "Create Volume from Snapshot", icon: "🔁", note: "EC2 → Snapshots → Actions\n→ Create Volume from Snapshot", side: "mid" },
        { label: "New EBS Volume", icon: "✅", note: "Contains all original data\nAttach to EC2 instance", side: "right" },
      ],
      note: "Snapshots are incremental — only changed blocks are stored after the first snapshot, saving cost.",
    },
    {
      id: "cross-az", icon: "🌐", label: "Cross-AZ Migration",
      steps: [
        { label: "EBS in AZ-A", icon: "💾", note: "Cannot directly copy volumes between AZs", side: "left" },
        { label: "Create Snapshot", icon: "📸", note: "Snapshots are region-wide, not AZ-specific", side: "mid" },
        { label: "Create Volume from Snapshot", icon: "🔁", note: "Choose AZ-B as the destination", side: "mid" },
        { label: "EBS in AZ-B", icon: "✅", note: "Attach to EC2 instance in AZ-B", side: "right" },
      ],
      note: "You cannot copy an EBS volume directly between AZs. Snapshots bypass this restriction.",
    },
    {
      id: "encrypt", icon: "🔒", label: "Enable Encryption",
      steps: [
        { label: "Unencrypted EBS", icon: "🔓", note: "Forgot to enable encryption at creation", side: "left" },
        { label: "Create Snapshot", icon: "📸", note: "Snapshot of unencrypted volume", side: "mid" },
        { label: "Copy Snapshot", icon: "🔁", note: "Actions → Copy Snapshot\n✅ Enable encryption during copy", side: "mid" },
        { label: "Create Volume from Encrypted Snapshot", icon: "🔒", note: "New encrypted volume ready", side: "right" },
        { label: "Swap volumes", icon: "✅", note: "Attach encrypted volume\nDelete old unencrypted one", side: "right" },
      ],
      note: "You cannot encrypt an existing unencrypted volume directly. The snapshot + copy workflow is the only way.",
    },
    {
      id: "cross-region", icon: "🌍", label: "Cross-Region Copy",
      steps: [
        { label: "EBS in Region A", icon: "💾", note: "e.g. ap-south-1 (Mumbai)", side: "left" },
        { label: "Create Snapshot", icon: "📸", note: "In Region A", side: "mid" },
        { label: "Copy Snapshot to Region B", icon: "✈️", note: "EC2 → Snapshots → Actions → Copy\nSelect destination region", side: "mid" },
        { label: "Create Volume in Region B", icon: "🔁", note: "From the copied snapshot", side: "mid" },
        { label: "EBS in Region B", icon: "✅", note: "e.g. us-east-1 (Virginia)", side: "right" },
      ],
      note: "Used for disaster recovery — keep a copy of critical data in a secondary region.",
    },
  ];

  const cur = useCases.find(u => u.id === useCase);

  return (
    <div className="sv2-card">
      <div className="sv2-title">📸 EBS Snapshots — 4 Use Cases</div>
      <div className="snp-tabs">
        {useCases.map(u => (
          <button key={u.id} className={`snp-tab ${useCase === u.id ? "active" : ""}`} onClick={() => setUseCase(u.id)}>
            <span>{u.icon}</span><span>{u.label}</span>
          </button>
        ))}
      </div>
      <div className="snp-flow">
        {cur.steps.map((s, i) => (
          <div key={i} className="snp-flow-step">
            <div className={`snp-node ${s.side}`}>
              <div className="snp-node-icon">{s.icon}</div>
              <div className="snp-node-label">{s.label}</div>
              <div className="snp-node-note">{s.note}</div>
            </div>
            {i < cur.steps.length - 1 && <div className="snp-arrow">↓</div>}
          </div>
        ))}
      </div>
      <div className="snp-note">💡 {cur.note}</div>
    </div>
  );
}

/* ─── 4. DLM POLICY VISUAL ───────────────────────────────────────── */
export function DLMPolicyVisual() {
  const [freq, setFreq] = useState("daily");
  const [retainCount, setRetainCount] = useState(2);
  const [running, setRunning] = useState(false);
  const [day, setDay] = useState(0);

  const freqLabels = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };

  // Simulate snapshots accumulating and being pruned
  const getSnapshots = () => {
    const snaps = [];
    for (let d = 1; d <= day; d++) {
      snaps.push({ day: d, label: `Day ${d}` });
    }
    return snaps.slice(-retainCount); // keep last N
  };

  const simulate = () => {
    if (running) return;
    setRunning(true); setDay(0);
    let d = 0;
    const t = setInterval(() => {
      d++;
      setDay(d);
      if (d >= 6) { clearInterval(t); setRunning(false); }
    }, 800);
  };

  const snaps = getSnapshots();
  const pruned = Math.max(0, day - retainCount);

  return (
    <div className="sv2-card">
      <div className="sv2-title">🤖 Data Lifecycle Manager (DLM) — Automated Snapshots</div>

      <div className="dlm-concept">
        <div className="dlm-step">
          <div className="dlm-step-num">1</div>
          <div className="dlm-step-icon">🏷️</div>
          <div className="dlm-step-text">Tag your EBS volume<br/><code>Backup: Daily</code></div>
        </div>
        <div className="dlm-arrow">→</div>
        <div className="dlm-step">
          <div className="dlm-step-num">2</div>
          <div className="dlm-step-icon">📋</div>
          <div className="dlm-step-text">Create DLM Policy<br/>Target volumes with that tag</div>
        </div>
        <div className="dlm-arrow">→</div>
        <div className="dlm-step">
          <div className="dlm-step-num">3</div>
          <div className="dlm-step-icon">⏰</div>
          <div className="dlm-step-text">Set schedule + retention<br/>Daily at 09:00 UTC, keep 7</div>
        </div>
        <div className="dlm-arrow">→</div>
        <div className="dlm-step">
          <div className="dlm-step-num">4</div>
          <div className="dlm-step-icon">🤖</div>
          <div className="dlm-step-text">DLM auto-runs forever<br/>Create → Retain → Delete old</div>
        </div>
      </div>

      <div className="dlm-simulator">
        <div className="dlm-sim-title">⚙️ Retention Simulator</div>
        <div className="dlm-controls">
          <div className="dlm-ctrl-group">
            <label>Frequency</label>
            <div className="dlm-freq-btns">
              {Object.entries(freqLabels).map(([k, v]) => (
                <button key={k} className={`dlm-freq-btn ${freq === k ? "active" : ""}`} onClick={() => setFreq(k)}>{v}</button>
              ))}
            </div>
          </div>
          <div className="dlm-ctrl-group">
            <label>Retain last: <strong>{retainCount}</strong> snapshots</label>
            <input type="range" min="1" max="5" value={retainCount} onChange={e => setRetainCount(+e.target.value)} className="dlm-slider" />
          </div>
        </div>

        <div className="dlm-timeline">
          {Array.from({ length: 6 }, (_, i) => i + 1).map(d => {
            const taken = d <= day;
            const kept = snaps.find(s => s.day === d);
            const isPruned = taken && !kept;
            return (
              <div key={d} className={`dlm-day ${taken ? "taken" : ""} ${kept ? "kept" : ""} ${isPruned ? "pruned" : ""}`}>
                <div className="dlm-day-icon">{taken ? (kept ? "📸" : "🗑️") : "⬜"}</div>
                <div className="dlm-day-label">Day {d}</div>
                <div className="dlm-day-status">
                  {!taken ? "Pending" : kept ? "✅ Kept" : "🗑️ Pruned"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="dlm-sim-stats">
          <span>Snapshots taken: <strong>{day}</strong></span>
          <span>Retained: <strong>{snaps.length}</strong></span>
          <span>Pruned: <strong>{pruned}</strong></span>
        </div>

        <button className="dlm-run-btn" onClick={simulate} disabled={running}>
          {running ? "⟳ Running..." : "▶ Simulate 6 Days"}
        </button>
      </div>

      <div className="dlm-policy-types">
        <div className="dlm-pt-title">DLM Policy Types</div>
        <div className="dlm-pt-grid">
          {[
            { icon: "💾", type: "EBS Snapshot Policy", desc: "Automate backups of individual EBS volumes. Target by tag." },
            { icon: "🖥️", type: "EBS-backed AMI Policy", desc: "Automate AMI creation from EC2 instances — backs up all attached volumes." },
            { icon: "🔄", type: "Cross-account Copy Event", desc: "Copy snapshots to another AWS account automatically for DR/sharing." },
          ].map((p, i) => (
            <div key={i} className="dlm-pt-card">
              <div className="dlm-pt-icon">{p.icon}</div>
              <div className="dlm-pt-type">{p.type}</div>
              <div className="dlm-pt-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dlm-tips">
        {[
          "DLM is free — you only pay for S3 storage used by the snapshots",
          "Set retention to avoid snapshot sprawl and unexpected S3 costs",
          "Snapshots are incremental — only changed blocks saved after the first",
          "You can set multiple schedules (daily + weekly + monthly) in one policy",
        ].map((t, i) => (
          <div key={i} className="dlm-tip">💡 {t}</div>
        ))}
      </div>
    </div>
  );
}
