// A tiny left-to-right architecture diagram renderer.
//
// Hand-drawing nine SVGs would guarantee nine different visual languages, so
// architectures are described declaratively and laid out by one engine: lanes
// become columns, nodes stack inside them, edges route orthogonally.

const LANE_W = 150;
const LANE_GAP = 46;
const NODE_H = 52;
const NODE_GAP = 16;
const TOP = 34;

const PALETTE = {
  client: { fill: "#EEF5F4", stroke: "#8FBDB7", text: "#11433F" },
  compute: { fill: "#FFF3E4", stroke: "#E0A96A", text: "#7A4A12" },
  data: { fill: "#EAF1F8", stroke: "#8FAFD0", text: "#1C3D5E" },
  ai: { fill: "#F2EDFA", stroke: "#A995D1", text: "#3F2E66" },
  ops: { fill: "#F0F2F1", stroke: "#A9B2AF", text: "#2E3836" },
  ext: { fill: "#FBEFEF", stroke: "#D59A9A", text: "#6E2B2B" },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Break a label onto at most two lines so boxes stay a fixed height.
function wrap(text, max = 20) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length <= max) cur = (cur + " " + w).trim();
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

export function diagram({ lanes, edges = [], caption }) {
  const pos = new Map();
  let maxRows = 0;

  lanes.forEach((lane, li) => {
    lane.nodes.forEach((n, ni) => {
      pos.set(n.id, {
        x: li * (LANE_W + LANE_GAP),
        y: TOP + ni * (NODE_H + NODE_GAP),
        lane: li,
        row: ni,
        node: n,
      });
    });
    maxRows = Math.max(maxRows, lane.nodes.length);
  });

  const W = lanes.length * LANE_W + (lanes.length - 1) * LANE_GAP;
  const bodyBottom = TOP + maxRows * NODE_H + (maxRows - 1) * NODE_GAP;
  // Any edge crossing more than one lane is routed along a bus under the boxes,
  // which needs room reserved for it.
  const hasLongEdge = edges.some(([f, t]) => {
    const a = pos.get(f), b = pos.get(t);
    return a && b && Math.abs(b.lane - a.lane) > 1;
  });
  const busY = bodyBottom + 13;
  const H = bodyBottom + (hasLongEdge ? 22 : 0) + (caption ? 22 : 8);

  let svg = "";
  const labels = [];

  // Lane headings
  lanes.forEach((lane, li) => {
    if (!lane.label) return;
    svg += `<text x="${li * (LANE_W + LANE_GAP) + LANE_W / 2}" y="16" class="dl" text-anchor="middle">${esc(lane.label.toUpperCase())}</text>`;
  });

  // Edges first so boxes sit on top of the strokes
  for (const [from, to, label, opts = {}] of edges) {
    const a = pos.get(from);
    const b = pos.get(to);
    if (!a || !b) continue;
    const dashed = opts.dashed ? ' stroke-dasharray="4 3"' : "";
    let d;
    let lx;
    let ly;

    if (a.lane === b.lane) {
      // Same column: route down the right-hand side and back in.
      const x = a.x + LANE_W;
      const y1 = a.y + NODE_H / 2;
      const y2 = b.y + NODE_H / 2;
      d = `M${x},${y1} C${x + 22},${y1} ${x + 22},${y2} ${x},${y2}`;
      lx = x + 26;
      ly = (y1 + y2) / 2;
    } else if (Math.abs(b.lane - a.lane) > 1) {
      // Spanning more than one lane, a straight run would cut through whatever
      // sits between. Route it along a bus below the boxes instead.
      const x1 = a.x + LANE_W / 2;
      const x2 = b.x + LANE_W / 2;
      const y1 = a.y + NODE_H;
      const y2 = b.y + NODE_H;
      d = `M${x1},${y1} V${busY} H${x2} V${y2}`;
      lx = (x1 + x2) / 2;
      ly = busY - 3;
    } else {
      const forward = b.lane > a.lane;
      const x1 = forward ? a.x + LANE_W : a.x;
      const x2 = forward ? b.x : b.x + LANE_W;
      const y1 = a.y + NODE_H / 2;
      const y2 = b.y + NODE_H / 2;
      const mid = (x1 + x2) / 2;
      d = `M${x1},${y1} H${mid} V${y2} H${x2}`;
      lx = mid;
      ly = (y1 + y2) / 2 - 4;
    }

    svg += `<path d="${d}" class="de"${dashed} marker-end="url(#ah)"/>`;
    // Labels are deferred: drawn here they sit under the node boxes, which clips
    // any label wider than the gap between two lanes.
    if (label) labels.push({ lx, ly, label });
  }

  // Nodes
  for (const { x, y, node } of pos.values()) {
    const c = PALETTE[node.k || "compute"] || PALETTE.compute;
    const lines = wrap(node.t, 19);
    svg += `<rect x="${x}" y="${y}" width="${LANE_W}" height="${NODE_H}" rx="5" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1"/>`;
    const startY = node.s ? y + 19 : y + (lines.length === 1 ? 29 : 23);
    lines.forEach((ln, i) => {
      svg += `<text x="${x + LANE_W / 2}" y="${startY + i * 11}" class="dn" fill="${c.text}" text-anchor="middle">${esc(ln)}</text>`;
    });
    if (node.s) {
      svg += `<text x="${x + LANE_W / 2}" y="${y + 19 + lines.length * 11 + 2}" class="ds" text-anchor="middle">${esc(node.s)}</text>`;
    }
  }

  // Edge labels last, so they sit above both strokes and boxes.
  for (const { lx, ly, label } of labels) {
    const w = String(label).length * 4.1 + 6;
    svg += `<rect x="${lx - w / 2}" y="${ly - 7}" width="${w}" height="11" class="debg" rx="2"/>`;
    svg += `<text x="${lx}" y="${ly + 1.5}" class="det" text-anchor="middle">${esc(label)}</text>`;
  }

  if (caption) {
    svg += `<text x="0" y="${H - 4}" class="dc">${esc(caption)}</text>`;
  }

  return `<div class="dia"><svg viewBox="-6 0 ${W + 44} ${H}" width="100%" role="img">
<defs><marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,1 L7,4 L0,7 z" fill="#5A625F"/></marker></defs>${svg}</svg></div>`;
}
