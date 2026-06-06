import { useState } from "react";
import "./EC2Visuals3.css";

/* ─── 1. PLACEMENT GROUP VISUAL ─────────────────────────────────── */
export function PlacementGroupVisual() {
  const [active, setActive] = useState("cluster");
  const [failRack, setFailRack] = useState(false);

  const strategies = [
    {
      id: "cluster",
      icon: "⚡",
      label: "Cluster",
      color: "#FF9900",
      tagline: "All instances in one rack — maximum speed",
      advantage: "🚀 Ultra-low latency, up to 10 Gbps between instances",
      disadvantage: "💀 Single rack fails → ALL instances down",
      useCase: "HPC, Big Data, ML training, tightly-coupled apps",
      limit: "Single AZ only",
    },
    {
      id: "spread",
      icon: "🛡️",
      label: "Spread",
      color: "#3fb950",
      tagline: "Each instance on a different rack — maximum availability",
      advantage: "✅ One rack fails → only one instance affected",
      disadvantage: "📶 Slightly higher latency (cross-rack hops)",
      useCase: "Critical web/app servers, any workload needing HA",
      limit: "Max 7 instances per AZ (21 total in a 3-AZ region)",
    },
    {
      id: "partition",
      icon: "🔀",
      label: "Partition",
      color: "#8c4fff",
      tagline: "Groups of racks (partitions) — speed within, isolation across",
      advantage: "⚡ Fast within partition + 🛡️ isolated across partitions",
      disadvantage: "More complex to plan",
      useCase: "Hadoop, Cassandra, Kafka — distributed systems",
      limit: "Multi-AZ supported, up to 7 partitions per AZ",
    },
  ];

  const cur = strategies.find((s) => s.id === active);

  const clusterRacks = [
    { id: "r1", label: "Rack 1", instances: ["EC2 A", "EC2 B", "EC2 C"], main: true },
    { id: "r2", label: "Rack 2", instances: [], main: false },
    { id: "r3", label: "Rack 3", instances: [], main: false },
  ];

  const spreadRacks = [
    { id: "r1", label: "Rack 1", instances: ["EC2 A"], main: false },
    { id: "r2", label: "Rack 2", instances: ["EC2 B"], main: false },
    { id: "r3", label: "Rack 3", instances: ["EC2 C"], main: false },
  ];

  const partitionRacks = [
    { id: "p1", label: "Partition 1", instances: ["EC2 A", "EC2 B"], color: "#FF9900", partition: true },
    { id: "p2", label: "Partition 2", instances: ["EC2 C", "EC2 D"], color: "#3fb950", partition: true },
    { id: "p3", label: "Partition 3", instances: ["EC2 E"], color: "#8c4fff", partition: true },
  ];

  const racks = active === "cluster" ? clusterRacks : active === "spread" ? spreadRacks : partitionRacks;

  return (
    <div className="viz-card3">
      <div className="viz-title3">📦 Placement Groups — Interactive Visualiser</div>

      {/* Strategy tabs */}
      <div className="pg-tabs">
        {strategies.map((s) => (
          <button
            key={s.id}
            className={`pg-tab ${active === s.id ? "active" : ""}`}
            style={{ "--pc": s.color }}
            onClick={() => { setActive(s.id); setFailRack(false); }}
          >
            <span className="pg-tab-icon">{s.icon}</span>
            <span className="pg-tab-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* AZ diagram */}
      <div className="pg-az-box" style={{ "--pc": cur.color }}>
        <div className="pg-az-label">🏢 Availability Zone (Data Centre)</div>
        <div className="pg-tagline">{cur.tagline}</div>

        <div className="pg-racks">
          {racks.map((rack, ri) => {
            const isDown = failRack && active === "cluster" && rack.main;
            const isAffected = failRack && active === "spread" && ri === 0;
            const down = isDown || isAffected;
            return (
              <div
                key={rack.id}
                className={`pg-rack ${down ? "down" : ""}`}
                style={rack.partition ? { "--pc": rack.color } : {}}
              >
                <div className="pg-rack-label">{rack.label}</div>
                <div className="pg-rack-instances">
                  {rack.instances.length === 0 ? (
                    <div className="pg-rack-empty">empty</div>
                  ) : rack.instances.map((inst, ii) => (
                    <div
                      key={ii}
                      className={`pg-instance ${down ? "offline" : "online"}`}
                      style={rack.partition ? { borderColor: rack.color + "60", background: rack.color + "10" } : {}}
                    >
                      💻 {inst}
                      <span className={`pg-inst-status ${down ? "red" : "green"}`}>
                        {down ? "✗" : "✓"}
                      </span>
                    </div>
                  ))}
                </div>
                {active === "cluster" && rack.main && (
                  <div className="pg-speed-badge">⚡ 10 Gbps</div>
                )}
              </div>
            );
          })}
        </div>

        {active === "cluster" && (
          <div className="pg-sim-row">
            <button
              className={`pg-fail-btn ${failRack ? "failed" : ""}`}
              onClick={() => setFailRack((p) => !p)}
            >
              {failRack ? "🔧 Restore Rack 1" : "💥 Simulate Rack 1 Failure"}
            </button>
            {failRack && (
              <div className="pg-fail-msg">All 3 instances are DOWN — this is the Cluster placement group risk!</div>
            )}
          </div>
        )}
        {active === "spread" && (
          <div className="pg-sim-row">
            <button
              className={`pg-fail-btn ${failRack ? "failed" : ""}`}
              onClick={() => setFailRack((p) => !p)}
            >
              {failRack ? "🔧 Restore Rack 1" : "💥 Simulate Rack 1 Failure"}
            </button>
            {failRack && (
              <div className="pg-fail-msg ok">Only EC2 A is affected — EC2 B and EC2 C keep running! ✅</div>
            )}
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="pg-info-cards">
        <div className="pg-info-card adv">
          <div className="pg-info-icon">✅</div>
          <div>
            <div className="pg-info-title">Advantage</div>
            <div className="pg-info-text">{cur.advantage}</div>
          </div>
        </div>
        <div className="pg-info-card dis">
          <div className="pg-info-icon">⚠️</div>
          <div>
            <div className="pg-info-title">Disadvantage</div>
            <div className="pg-info-text">{cur.disadvantage}</div>
          </div>
        </div>
        <div className="pg-info-card use">
          <div className="pg-info-icon">🎯</div>
          <div>
            <div className="pg-info-title">Use Case</div>
            <div className="pg-info-text">{cur.useCase}</div>
          </div>
        </div>
        <div className="pg-info-card lim">
          <div className="pg-info-icon">📏</div>
          <div>
            <div className="pg-info-title">Limit</div>
            <div className="pg-info-text">{cur.limit}</div>
          </div>
        </div>
      </div>

      {/* Quick compare table */}
      <div className="pg-compare">
        <div className="pg-cmp-title">Quick Compare</div>
        <div className="pg-cmp-row header">
          <span>Strategy</span><span>Speed</span><span>Availability</span><span>Multi-AZ</span>
        </div>
        {[
          { label: "⚡ Cluster", speed: "★★★★★", avail: "★☆☆☆☆", az: "No" },
          { label: "🛡️ Spread",  speed: "★★★☆☆", avail: "★★★★★", az: "Yes" },
          { label: "🔀 Partition",speed: "★★★★☆", avail: "★★★★☆", az: "Yes" },
        ].map((r, i) => (
          <div key={i} className="pg-cmp-row">
            <span>{r.label}</span>
            <span className="pg-stars">{r.speed}</span>
            <span className="pg-stars">{r.avail}</span>
            <span>{r.az}</span>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="pg-rules">
        {[
          "Name must be unique per region per AWS account",
          "Placement groups cannot be merged",
          "One EC2 instance can belong to only one placement group",
          "Dedicated Hosts cannot be used inside a placement group",
        ].map((r, i) => (
          <div key={i} className="pg-rule">📌 {r}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── 2. TENANCY COMPARISON ──────────────────────────────────────── */
export function TenancyComparison() {
  const [selected, setSelected] = useState("shared");

  const options = [
    {
      id: "shared",
      icon: "🏘️",
      label: "Shared",
      subtitle: "Default",
      color: "#3fb950",
      desc: "Your EC2 instance runs on a physical host shared with instances from other AWS customers. AWS decides which host to use.",
      host: "AWS managed",
      isolation: "None — shared with other customers",
      byol: "Not supported",
      cost: "Standard pricing — no extra charge",
      useWhen: "Standard workloads with no compliance restrictions",
      customers: ["You", "Customer B", "Customer C"],
    },
    {
      id: "dedicated-instance",
      icon: "🏠",
      label: "Dedicated Instance",
      subtitle: "Extra charge",
      color: "#FF9900",
      desc: "Your EC2 instance runs on hardware dedicated to your AWS account only. Other customers' instances cannot land on this host. AWS still manages it.",
      host: "AWS managed",
      isolation: "Physical isolation from other AWS accounts",
      byol: "Not supported",
      cost: "Extra per-instance charge on top of standard pricing",
      useWhen: "Government compliance, financial regulations, HIPAA, PCI-DSS",
      customers: ["You (multiple instances)", "— isolated —"],
    },
    {
      id: "dedicated-host",
      icon: "🏰",
      label: "Dedicated Host",
      subtitle: "Most expensive",
      color: "#8c4fff",
      desc: "You get an entire physical server allocated to you. You manage the host, control CPU socket and core placement, and can bring your own licenses.",
      host: "You manage",
      isolation: "Full physical server — complete control",
      byol: "✅ Supported — Windows, SQL Server, Oracle, etc.",
      cost: "Highest — pay per host (not per instance)",
      useWhen: "Existing per-socket/per-core software licenses, deepest compliance needs",
      customers: ["Your instances only, your placement control"],
    },
  ];

  const cur = options.find((o) => o.id === selected);

  return (
    <div className="viz-card3">
      <div className="viz-title3">🏗️ EC2 Tenancy — How Your Instance Shares Hardware</div>

      <div className="ten-tabs">
        {options.map((o) => (
          <button
            key={o.id}
            className={`ten-tab ${selected === o.id ? "active" : ""}`}
            style={{ "--tc": o.color }}
            onClick={() => setSelected(o.id)}
          >
            <span className="ten-tab-icon">{o.icon}</span>
            <div>
              <div className="ten-tab-label">{o.label}</div>
              <div className="ten-tab-sub">{o.subtitle}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Physical host visualiser */}
      <div className="ten-host-box" style={{ "--tc": cur.color }}>
        <div className="ten-host-label">🖥️ Physical Host Machine</div>
        <div className="ten-host-inner">
          <div className="ten-hw-bar">
            <span>CPU</span><span>RAM</span><span>Network</span><span>Storage</span>
          </div>
          <div className="ten-vms">
            {cur.customers.map((c, i) => (
              <div
                key={i}
                className={`ten-vm ${c.startsWith("—") ? "blocked" : ""}`}
                style={c === "You" || c.startsWith("You") ? { "--vc": cur.color } : {}}
              >
                {c.startsWith("—") ? (
                  <><span>🚫</span><span>{c}</span></>
                ) : (
                  <><span>💻</span><span>{c}</span></>
                )}
              </div>
            ))}
          </div>
          <div className="ten-managed-by">
            Managed by: <strong>{cur.host}</strong>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="ten-details">
        <div className="ten-detail-card">
          <div className="ten-detail-icon">🔒</div>
          <div className="ten-detail-label">Isolation</div>
          <div className="ten-detail-val">{cur.isolation}</div>
        </div>
        <div className="ten-detail-card">
          <div className="ten-detail-icon">📜</div>
          <div className="ten-detail-label">BYOL Support</div>
          <div className="ten-detail-val">{cur.byol}</div>
        </div>
        <div className="ten-detail-card">
          <div className="ten-detail-icon">💰</div>
          <div className="ten-detail-label">Cost</div>
          <div className="ten-detail-val">{cur.cost}</div>
        </div>
        <div className="ten-detail-card">
          <div className="ten-detail-icon">🎯</div>
          <div className="ten-detail-label">Use When</div>
          <div className="ten-detail-val">{cur.useWhen}</div>
        </div>
      </div>

      <div className="ten-desc">{cur.desc}</div>

      {/* Side-by-side comparison */}
      <div className="ten-compare">
        <div className="ten-cmp-title">Side-by-Side Comparison</div>
        <div className="ten-cmp-grid">
          <div className="ten-cmp-header"><span></span><span>🏘️ Shared</span><span>🏠 Dedicated Instance</span><span>🏰 Dedicated Host</span></div>
          {[
            ["Others on same host?", "Yes", "No", "No"],
            ["You manage the host?", "No", "No", "Yes"],
            ["BYOL?", "No", "No", "Yes"],
            ["Cost", "Cheapest", "Extra charge", "Most expensive"],
            ["Compliance", "General", "Regulatory", "Full control"],
          ].map((row, i) => (
            <div key={i} className="ten-cmp-row">
              {row.map((cell, ci) => (
                <span key={ci} className={ci === 0 ? "ten-cmp-rowlabel" : ""}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
