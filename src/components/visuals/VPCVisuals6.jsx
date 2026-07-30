import { useState } from "react";
import "./VPCVisuals.css";
import "./VPCVisuals4.css";
import "./VPCVisuals6.css";

/* ─── WHY PEERING DOES NOT SCALE ───────────────────────────────────── */
export function PeeringMathCalculator() {
  const [n, setN] = useState(4);

  const peerings = (n * (n - 1)) / 2;
  const verdict =
    n <= 3 ? "Manageable." : n <= 5 ? "Getting tedious." : n <= 8 ? "Genuinely painful." : "Unworkable by hand.";

  // ring layout for the mesh diagram
  const R = 62, C = 78;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: C + R * Math.cos(a), y: C + R * Math.sin(a), label: String.fromCharCode(65 + i) };
  });
  const edges = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([pts[i], pts[j]]);

  return (
    <div className="viz-card">
      <div className="viz-title">🕸️ Why Peering Does Not Scale</div>
      <p className="vpc4-intro">
        Peering connects <strong>two</strong> VPCs. Peering A↔B and A↔C does <strong>not</strong> let B talk to
        C — you need that connection too. Drag the slider and watch the mesh.
      </p>

      <label className="vpc6-slider-wrap">
        <span className="vpc6-slider-label">Number of VPCs: <b>{n}</b></span>
        <input type="range" min="2" max="10" value={n} onChange={(e) => setN(Number(e.target.value))} />
      </label>

      <div className="vpc6-stage">
        <svg viewBox="0 0 156 156" className="vpc6-mesh" role="img" aria-label={`${n} VPCs fully meshed`}>
          {edges.map(([a, b], i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="vpc6-edge" />
          ))}
          {pts.map((p) => (
            <g key={p.label}>
              <circle cx={p.x} cy={p.y} r="13" className="vpc6-node" />
              <text x={p.x} y={p.y + 4} className="vpc6-node-label">{p.label}</text>
            </g>
          ))}
        </svg>

        <div className="vpc6-calc">
          <div className="vpc6-formula">n × (n − 1) ÷ 2</div>
          <div className="vpc6-sub">{n} × {n - 1} ÷ 2</div>
          <div className="vpc6-result">{peerings}</div>
          <div className="vpc6-unit">peering connections</div>
          <div className={`vpc6-verdict ${n > 5 ? "bad" : ""}`}>{verdict}</div>
        </div>
      </div>

      <div className="vpc6-table">
        {[3, 4, 10].map((k) => (
          <div key={k} className={`vpc6-row ${n === k ? "hi" : ""}`}>
            <b>{k} VPCs</b>
            <span>{(k * (k - 1)) / 2} peering connections</span>
          </div>
        ))}
      </div>

      <div className="vpc4-note">
        And peering is only part of it. A <strong>VPN gateway attaches to exactly one VPC</strong>, so connecting
        on-premises to several VPCs means a separate VPN gateway for each. <strong>Transit Gateway</strong>
        replaces the whole mesh with a single hub — attach each VPC, VPN and Direct Connect to it once.
      </div>
    </div>
  );
}
