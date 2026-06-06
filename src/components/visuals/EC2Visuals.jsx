import { useState, useEffect } from "react";
import "./EC2Visuals.css";

/* ─── 1. VIRTUALIZATION 3D DIAGRAM ──────────────────────────────── */
export function VirtualizationDiagram() {
  const [hovered, setHovered] = useState(null);
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setAnimStep((s) => (s + 1) % 4), 2000);
    return () => clearInterval(t);
  }, []);

  const layers = [
    { id: "hw", label: "Physical Hardware", sub: "CPU · RAM · NIC · Disk", color: "#555e6e", z: 0 },
    { id: "hv", label: "Hypervisor (ESXi / Hyper-V)", sub: "Manages & shares hardware", color: "#8c4fff", z: 1 },
    { id: "vm1", label: "VM 1 — Windows", sub: "Guest OS", color: "#0078d4", z: 2, vm: true },
    { id: "vm2", label: "VM 2 — Linux", sub: "Guest OS", color: "#e6703a", z: 2, vm: true, offset: true },
  ];

  const tooltips = {
    hw: "The physical server. AWS manages this — you never touch it.",
    hv: "The hypervisor virtualises the hardware and shares it securely between VMs. AWS uses Xen + their custom Nitro system.",
    vm1: "An EC2 instance — a Windows virtual machine running inside the host.",
    vm2: "Another EC2 instance — a Linux VM running simultaneously on the same host.",
  };

  return (
    <div className="viz-card">
      <div className="viz-title">🖥️ How EC2 Virtualisation Works</div>
      <div className="virt-scene">
        <div className="virt-host">
          <div className="host-label">HOST (Physical Server — managed by AWS)</div>
          <div className="virt-stack">
            {/* Hardware */}
            <div
              className={`virt-layer hw ${hovered === "hw" ? "hov" : ""} ${animStep === 0 ? "pulse" : ""}`}
              onMouseEnter={() => setHovered("hw")}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="layer-icon">⚙️</span>
              <div>
                <div className="layer-name">Physical Hardware</div>
                <div className="layer-sub">CPU · RAM · NIC · SSD</div>
              </div>
            </div>
            {/* Hypervisor */}
            <div className="virt-arrow">▲</div>
            <div
              className={`virt-layer hv ${hovered === "hv" ? "hov" : ""} ${animStep === 1 ? "pulse" : ""}`}
              onMouseEnter={() => setHovered("hv")}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="layer-icon">🔀</span>
              <div>
                <div className="layer-name">Hypervisor (Xen / Nitro)</div>
                <div className="layer-sub">Virtualises & isolates hardware resources</div>
              </div>
            </div>
            {/* VMs */}
            <div className="virt-arrow">▲</div>
            <div className="virt-vms">
              {[
                { id: "vm1", icon: "🪟", label: "EC2 Instance (Windows)", sub: "Guest OS — t2.micro", color: "#0078d4" },
                { id: "vm2", icon: "🐧", label: "EC2 Instance (Linux)", sub: "Guest OS — t2.micro", color: "#e6703a" },
                { id: "vm3", icon: "🍎", label: "EC2 Instance (macOS)", sub: "Guest OS — mac1", color: "#1a9c3e" },
              ].map((vm) => (
                <div
                  key={vm.id}
                  className={`virt-vm ${hovered === vm.id ? "hov" : ""} ${animStep >= 2 ? "pulse" : ""}`}
                  style={{ "--vm-color": vm.color }}
                  onMouseEnter={() => setHovered(vm.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span>{vm.icon}</span>
                  <div className="vm-label">{vm.label}</div>
                  <div className="vm-sub">{vm.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        <div className={`virt-tooltip ${hovered ? "show" : ""}`}>
          {hovered && (tooltips[hovered] || "Virtual machine running inside the host.")}
        </div>

        {/* Key facts */}
        <div className="virt-facts">
          {[
            { icon: "🔒", text: "VMs are 100% isolated — one cannot access another" },
            { icon: "💡", text: "You manage the Guest; AWS manages the Host" },
            { icon: "⚡", text: "All VMs share physical hardware simultaneously" },
          ].map((f, i) => (
            <div key={i} className="fact-chip">{f.icon} {f.text}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 2. SERVER TYPES 3D FLIP CARDS ─────────────────────────────── */
export function ServerTypesCards() {
  const [flipped, setFlipped] = useState({});

  const servers = [
    {
      id: "tower",
      icon: "🗼",
      name: "Tower Server",
      front: "Stands upright like a desktop PC. Used for small businesses.",
      back: "Good for: Small workloads\nCapacity: Low–Medium\nManagement: Hard to scale",
      color: "#3f8624",
    },
    {
      id: "rack",
      icon: "📦",
      name: "Rack Server",
      front: "Slides into a rack unit. Ideal for 50–100 servers in a data centre.",
      back: "Good for: Medium workloads\nCapacity: Medium–High\nManagement: Easier scaling",
      color: "#2e73b8",
    },
    {
      id: "blade",
      icon: "🗡️",
      name: "Blade Server",
      front: "Ultra-dense. Thousands can fit in a single chassis. Used by AWS.",
      back: "Good for: Massive workloads\nCapacity: Extreme\nManagement: Centralised chassis",
      color: "#8c4fff",
    },
  ];

  return (
    <div className="viz-card">
      <div className="viz-title">🏗️ Physical Server Types (click to flip)</div>
      <div className="server-cards">
        {servers.map((s) => (
          <div
            key={s.id}
            className={`server-card ${flipped[s.id] ? "flipped" : ""}`}
            onClick={() => setFlipped((p) => ({ ...p, [s.id]: !p[s.id] }))}
            style={{ "--c": s.color }}
          >
            <div className="card-inner">
              <div className="card-front">
                <div className="card-icon">{s.icon}</div>
                <div className="card-name">{s.name}</div>
                <div className="card-desc">{s.front}</div>
                <div className="card-hint">Click to see specs →</div>
              </div>
              <div className="card-back">
                <div className="card-name">{s.name}</div>
                <pre className="card-specs">{s.back}</pre>
                <div className="card-hint">← Flip back</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="viz-note">AWS uses blade servers at massive scale — the physical layer you never see</div>
    </div>
  );
}

/* ─── 3. AMI CONCEPT FLOW ────────────────────────────────────────── */
export function AMIFlowDiagram() {
  const [active, setActive] = useState(null);

  const useCases = [
    { id: "rapid", icon: "⚡", title: "Rapid Deployment", desc: "Select a pre-built template instead of installing an OS manually. No ISO downloads." },
    { id: "autoscale", icon: "📈", title: "Auto Scaling", desc: "When traffic spikes, Auto Scaling creates new EC2 instances from your custom AMI — already configured with your app." },
    { id: "clone", icon: "🔁", title: "Environment Cloning", desc: "Take a snapshot of 10–20 configured instances as an AMI and re-deploy an identical environment instantly." },
    { id: "dr", icon: "🛡️", title: "Disaster Recovery", desc: "Copy your AMI to another region. If your active environment fails, launch a standby from the same AMI." },
  ];

  return (
    <div className="viz-card">
      <div className="viz-title">🖼️ What is an AMI?</div>

      <div className="ami-flow">
        {/* Left: AMI box */}
        <div className="ami-source">
          <div className="ami-box">
            <div className="ami-icon">📦</div>
            <div className="ami-name">Amazon Machine Image</div>
            <div className="ami-chips">
              <span>OS Template</span>
              <span>App Config</span>
              <span>Storage Layout</span>
            </div>
          </div>
          <div className="ami-types">
            <div className="ami-type" style={{ background: "#0078d420" }}>🪟 Windows AMIs</div>
            <div className="ami-type" style={{ background: "#e6703a20" }}>🐧 Amazon Linux</div>
            <div className="ami-type" style={{ background: "#3f862420" }}>🔴 Red Hat / Ubuntu</div>
            <div className="ami-type" style={{ background: "#8c4fff20" }}>🔧 Custom AMI</div>
          </div>
        </div>

        <div className="ami-arrow-right">→</div>

        {/* Right: EC2 instances */}
        <div className="ami-instances">
          {["Instance A", "Instance B", "Instance C"].map((n, i) => (
            <div key={i} className="ami-instance">
              <span>💻</span> {n}
            </div>
          ))}
          <div className="ami-instance dashed">+ more...</div>
        </div>
      </div>

      {/* Use cases */}
      <div className="ami-usecases">
        <div className="viz-subtitle">4 Key Use Cases of AMI</div>
        <div className="uc-grid">
          {useCases.map((u) => (
            <div
              key={u.id}
              className={`uc-card ${active === u.id ? "active" : ""}`}
              onClick={() => setActive(active === u.id ? null : u.id)}
            >
              <div className="uc-icon">{u.icon}</div>
              <div className="uc-title">{u.title}</div>
              {active === u.id && <div className="uc-desc">{u.desc}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 4. INSTANCE TYPE EXPLORER ──────────────────────────────────── */
export function InstanceTypeExplorer() {
  const [selected, setSelected] = useState(null);

  const families = [
    { prefix: "T", name: "General Purpose (Burstable)", color: "#FF9900", icon: "⚖️", desc: "Balanced CPU/RAM/storage. Cheap. Best for: learners, small apps, dev servers. T2.micro is FREE tier.", examples: ["t2.micro (1 vCPU, 1 GB)", "t3.small (2 vCPU, 2 GB)", "t3.xlarge (4 vCPU, 16 GB)"] },
    { prefix: "M", name: "General Purpose (Standard)", color: "#e07b39", icon: "🔧", desc: "More consistent performance than T-series. Best for: production web servers, app servers.", examples: ["m5.large (2 vCPU, 8 GB)", "m5.xlarge (4 vCPU, 16 GB)"] },
    { prefix: "C", name: "Compute Optimised", color: "#dd344c", icon: "🧮", desc: "High CPU-to-RAM ratio. Best for: web servers, batch processing, gaming, video encoding.", examples: ["c5.large (2 vCPU, 4 GB)", "c5.2xlarge (8 vCPU, 16 GB)"] },
    { prefix: "R", name: "Memory Optimised", color: "#2e73b8", icon: "🧠", desc: "Extra RAM. Best for: in-memory databases (Redis), real-time big data analytics, SAP HANA.", examples: ["r5.large (2 vCPU, 16 GB)", "r5.4xlarge (16 vCPU, 128 GB)"] },
    { prefix: "I", name: "Storage Optimised (IOPS)", color: "#3f8624", icon: "⚡", desc: "High read/write IOPS. Best for: NoSQL databases, data warehousing, Elasticsearch clusters.", examples: ["i3.large (2 vCPU, 15.25 GB, NVMe SSD)"] },
    { prefix: "D", name: "Dense Storage", color: "#7b68ee", icon: "🗄️", desc: "Massive HDD storage. Best for: Hadoop, data lakes, parallel file systems.", examples: ["d3.xlarge (4 vCPU, 32 GB, 2×2 TB HDD)"] },
    { prefix: "G", name: "GPU (Graphics)", color: "#ff4f8b", icon: "🎮", desc: "NVIDIA GPUs. Best for: ML training, 3D rendering, video transcoding, gaming.", examples: ["g4dn.xlarge (4 vCPU, 16 GB, T4 GPU)"] },
    { prefix: "P", name: "GPU (ML/Deep Learning)", color: "#00a1c9", icon: "🤖", desc: "High-end NVIDIA GPUs. Best for: ML training with TensorFlow/PyTorch, HPC.", examples: ["p3.2xlarge (8 vCPU, 61 GB, V100 GPU)"] },
    { prefix: "X", name: "Extreme Memory", color: "#8c4fff", icon: "💾", desc: "Terabytes of RAM. Best for: SAP HANA, in-memory databases, massive real-time analytics.", examples: ["x1e.xlarge (4 vCPU, 122 GB)"] },
    { prefix: "Z", name: "Extreme CPU + Memory", color: "#e6703a", icon: "🚀", desc: "Highest single-core clock speed on AWS. Best for: EDA, financial simulations, relational databases.", examples: ["z1d.large (2 vCPU, 16 GB, 3.9 GHz)"] },
    { prefix: "A", name: "ARM (Graviton)", color: "#1a9c3e", icon: "💪", desc: "AWS Graviton2 ARM chips — 40% better price/performance. Best for: scale-out web apps, containers.", examples: ["a1.medium (1 vCPU, 2 GB)", "m6g.large (2 vCPU, 8 GB)"] },
    { prefix: "U", name: "Bare Metal", color: "#555e6e", icon: "🔩", desc: "No hypervisor. Direct hardware access. Best for: workloads requiring hardware virtualisation (VMware).", examples: ["u-6tb1.metal (448 vCPU, 6 TB)"] },
  ];

  return (
    <div className="viz-card">
      <div className="viz-title">🏷️ EC2 Instance Type Explorer (click any family)</div>
      <div className="itype-grid">
        {families.map((f) => (
          <div
            key={f.prefix}
            className={`itype-chip ${selected === f.prefix ? "sel" : ""}`}
            style={{ "--ic": f.color }}
            onClick={() => setSelected(selected === f.prefix ? null : f.prefix)}
          >
            <span className="itype-icon">{f.icon}</span>
            <span className="itype-prefix">{f.prefix}</span>
            <span className="itype-short">{f.name.split(" ")[0]}</span>
          </div>
        ))}
      </div>

      {selected && (() => {
        const f = families.find((x) => x.prefix === selected);
        return (
          <div className="itype-detail" style={{ "--ic": f.color }}>
            <div className="itype-detail-header">
              <span className="itype-big-icon">{f.icon}</span>
              <div>
                <div className="itype-detail-name">{f.prefix} — {f.name}</div>
                <div className="itype-detail-desc">{f.desc}</div>
              </div>
            </div>
            <div className="itype-examples">
              <div className="itype-ex-label">Example sizes:</div>
              {f.examples.map((e, i) => (
                <div key={i} className="itype-ex">{e}</div>
              ))}
            </div>
            <div className="itype-note">
              💡 Naming pattern: <code>{f.prefix.toLowerCase()}5.xlarge</code> → family <strong>{f.prefix}</strong>, gen <strong>5</strong>, size <strong>xlarge</strong>. Each size up doubles vCPU+RAM.
            </div>
          </div>
        );
      })()}

      <div className="itype-nitro">
        <div className="nitro-header">⚡ Nitro System — What Makes Modern EC2 Fast</div>
        <div className="nitro-body">
          <div className="nitro-col">
            <div className="nitro-label">Traditional EC2</div>
            <div className="nitro-flow">
              <div className="nitro-box">VM</div>
              <div>→</div>
              <div className="nitro-box highlight">Hypervisor</div>
              <div>→</div>
              <div className="nitro-box">Hardware</div>
            </div>
            <div className="nitro-sub">Extra hop = overhead</div>
          </div>
          <div className="nitro-vs">VS</div>
          <div className="nitro-col">
            <div className="nitro-label">Nitro-based EC2</div>
            <div className="nitro-flow">
              <div className="nitro-box">VM</div>
              <div>→</div>
              <div className="nitro-box fast">Hardware (direct)</div>
            </div>
            <div className="nitro-sub">Bypasses hypervisor = ⚡ max performance</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 5. MULTI-AZ STRATEGY DIAGRAM ───────────────────────────────── */
export function MultiAZDiagram() {
  const [scenario, setScenario] = useState("normal");

  const azs = [
    { id: "a", label: "AZ — ap-south-1a", city: "Mumbai North", color: "#FF9900" },
    { id: "b", label: "AZ — ap-south-1b", city: "Mumbai Central", color: "#2e73b8" },
    { id: "c", label: "AZ — ap-south-1c", city: "Mumbai South", color: "#3f8624" },
  ];

  const isDown = scenario === "az-a-down" ? "a" : null;

  return (
    <div className="viz-card">
      <div className="viz-title">🌐 Multi-AZ Strategy — High Availability</div>

      <div className="maz-controls">
        {[
          { id: "normal", label: "✅ Normal Operation" },
          { id: "az-a-down", label: "💥 AZ-A Fails" },
        ].map((s) => (
          <button
            key={s.id}
            className={`maz-btn ${scenario === s.id ? "active" : ""}`}
            onClick={() => setScenario(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="maz-region">
        <div className="maz-region-label">🌍 AWS Region: ap-south-1 (Mumbai)</div>
        <div className="maz-fiber-note">← Connected via high-speed fibre optic within 100 km radius →</div>

        <div className="maz-azs">
          {azs.map((az) => {
            const down = isDown === az.id;
            return (
              <div
                key={az.id}
                className={`maz-az ${down ? "down" : ""}`}
                style={{ "--azc": az.color }}
              >
                <div className="maz-az-label">{az.label}</div>
                <div className="maz-az-city">{az.city}</div>
                <div className={`maz-instance ${down ? "offline" : "online"}`}>
                  💻 EC2 Instance
                  <span className={`maz-status ${down ? "red" : "green"}`}>
                    {down ? "✗ DOWN" : "✓ RUNNING"}
                  </span>
                </div>
                {down && (
                  <div className="maz-down-badge">⚠️ AZ Failure</div>
                )}
              </div>
            );
          })}
        </div>

        {isDown && (
          <div className="maz-failover">
            <span>🔀</span>
            <span>Traffic automatically rerouted to AZ-B and AZ-C — users see NO downtime</span>
          </div>
        )}
      </div>

      <div className="maz-rules">
        {[
          { icon: "✅", text: "Host critical apps in 2+ AZs — AWS best practice" },
          { icon: "💰", text: "You pay for each running instance, even standby ones" },
          { icon: "📉", text: "Probability of 2 AZs failing simultaneously: ~0.00001%" },
          { icon: "🏢", text: "Example: Deploy Active Directory on AZ-A AND AZ-B — never both in same AZ" },
        ].map((r, i) => (
          <div key={i} className="maz-rule">{r.icon} {r.text}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── 6. EC2 LAUNCH STEPS INTERACTIVE ────────────────────────────── */
export function EC2LaunchSteps() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: "📝",
      title: "Name Your Instance",
      desc: 'Give a descriptive name e.g. "my-web-server-prod". Names help you identify instances in the dashboard.',
      tip: "Use a naming convention like: project-environment-role (e.g. shop-prod-webserver)",
    },
    {
      icon: "🖼️",
      title: "Choose an AMI",
      desc: "Select your OS template. For learning: pick Amazon Linux 2 (free tier). For Windows labs: Windows Server 2019 Base (free tier).",
      tip: "Always check the 'Free Tier Eligible' tag to avoid charges. AMIs with pre-installed software (SQL Server, etc.) cost extra.",
    },
    {
      icon: "⚙️",
      title: "Select Instance Type",
      desc: "For all free-tier labs: t2.micro (1 vCPU, 1 GB RAM). For production, choose based on your workload type.",
      tip: "t2.micro is free for 750 hours/month. Going over will incur charges.",
    },
    {
      icon: "🔑",
      title: "Create a Key Pair",
      desc: "Download the .PEM file (Windows 10/11) or .PPK file (Windows 7/8 with PuTTY). Store it in your Downloads folder.",
      tip: "You CANNOT download the key again after creation. Keep it safe — it's the only way to access your instance.",
    },
    {
      icon: "🌐",
      title: "Configure Networking",
      desc: "Select an Availability Zone (e.g. ap-south-1a). Enable Auto-assign Public IP so you can reach the instance from the internet.",
      tip: "For high availability, deploy duplicate instances in different AZs.",
    },
    {
      icon: "🛡️",
      title: "Set Up Security Group",
      desc: "Security group = cloud firewall. For Windows: port 3389 (RDP) is auto-allowed. For Linux: port 22 (SSH) is auto-allowed.",
      tip: "In production, restrict access to your specific IP. For learning, 'Anywhere' is fine.",
    },
    {
      icon: "💾",
      title: "Configure Storage",
      desc: "Root volume: 30 GB for Windows, 8 GB for Linux. This is where the OS is installed (like your C: drive).",
      tip: "You can add extra EBS volumes (like D:, E: drives). We'll cover EBS in the Storage section.",
    },
    {
      icon: "🚀",
      title: "Launch!",
      desc: "Click Launch Instance. Status goes: Pending → Running. Wait for Status Check 2/2 to pass before connecting.",
      tip: "After each lab session, always TERMINATE your instances to avoid surprise bills.",
    },
  ];

  return (
    <div className="viz-card">
      <div className="viz-title">🚀 EC2 Instance Launch — Step by Step</div>
      <div className="steps-container">
        <div className="steps-sidebar">
          {steps.map((s, i) => (
            <button
              key={i}
              className={`step-nav ${step === i ? "active" : ""} ${i < step ? "done" : ""}`}
              onClick={() => setStep(i)}
            >
              <div className="step-num">{i < step ? "✓" : i + 1}</div>
              <div className="step-nav-title">{s.title}</div>
            </button>
          ))}
        </div>
        <div className="step-detail">
          <div className="step-detail-icon">{steps[step].icon}</div>
          <div className="step-detail-title">Step {step + 1}: {steps[step].title}</div>
          <div className="step-detail-desc">{steps[step].desc}</div>
          <div className="step-tip">💡 {steps[step].tip}</div>
          <div className="step-nav-btns">
            {step > 0 && (
              <button className="step-nav-btn" onClick={() => setStep(step - 1)}>← Back</button>
            )}
            {step < steps.length - 1 && (
              <button className="step-nav-btn primary" onClick={() => setStep(step + 1)}>Next →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 7. HOST vs GUEST EXPLAINER ─────────────────────────────────── */
export function HostGuestExplainer() {
  const [reveal, setReveal] = useState(false);

  return (
    <div className="viz-card compact">
      <div className="viz-title">🏠 Host vs Guest — Key Terms</div>
      <div className="hg-container">
        <div className="hg-box host">
          <div className="hg-label">HOST</div>
          <div className="hg-icon">🖥️</div>
          <div className="hg-desc">The physical machine.<br />Managed entirely by AWS.<br />You never see or touch it.</div>
          <div className="hg-items">
            <span>Physical CPU</span>
            <span>Physical RAM</span>
            <span>Hypervisor</span>
          </div>
        </div>
        <div className="hg-arrow">
          <div>creates &amp;</div>
          <div>hosts</div>
          <div>↓</div>
        </div>
        <div className="hg-box guests">
          <div className="hg-label">GUESTS</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <div className="hg-icon small">💻</div>
            <div className="hg-icon small">💻</div>
            <div className="hg-icon small">💻</div>
          </div>
          <div className="hg-desc">Your EC2 instances.<br />You create, manage &amp; configure these.<br />Install OS, deploy apps.</div>
          <div className="hg-items">
            <span>Virtual CPU</span>
            <span>Virtual RAM</span>
            <span>Your App</span>
          </div>
        </div>
      </div>
      <div className="hg-responsibility">
        <div className="resp-col aws">
          <div className="resp-label">AWS Responsibility</div>
          <ul>
            <li>Physical hardware</li>
            <li>Hypervisor & ESXi / Nitro</li>
            <li>Data centre security</li>
            <li>Network infrastructure</li>
          </ul>
        </div>
        <div className="resp-divider">|</div>
        <div className="resp-col you">
          <div className="resp-label">Your Responsibility</div>
          <ul>
            <li>EC2 instance (Guest OS)</li>
            <li>Applications you install</li>
            <li>Security groups &amp; IAM</li>
            <li>Data inside the VM</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
