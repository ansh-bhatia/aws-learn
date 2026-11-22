// Hierarchy renderer for the OU structure. The lanes engine draws flows;
// an organisation is a tree, and forcing it into columns loses the nesting
// that is the whole point of the diagram.

const BOX_W = 112;
const BOX_H = 40;
const H_GAP = 10;
const V_GAP = 30;

const PALETTE = {
  root: { fill: "#E7EEED", stroke: "#7FA9A3", text: "#11433F" },
  ou: { fill: "#FFF3E4", stroke: "#E0A96A", text: "#7A4A12" },
  acct: { fill: "#EAF1F8", stroke: "#8FAFD0", text: "#1C3D5E" },
  prod: { fill: "#FBEFEF", stroke: "#D59A9A", text: "#6E2B2B" },
  sbx: { fill: "#F2EDFA", stroke: "#A995D1", text: "#3F2E66" },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, max = 15) {
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

// Width of a subtree is the greater of one box and the sum of its children.
function measure(node) {
  if (!node.children || !node.children.length) {
    node._w = BOX_W;
    return BOX_W;
  }
  const total =
    node.children.reduce((s, c) => s + measure(c), 0) +
    (node.children.length - 1) * H_GAP;
  node._w = Math.max(BOX_W, total);
  return node._w;
}

function place(node, x, depth, out) {
  const cx = x + node._w / 2;
  node._x = cx - BOX_W / 2;
  node._y = depth * (BOX_H + V_GAP);
  out.push(node);
  if (!node.children) return;
  let cursor = x + (node._w - (node.children.reduce((s, c) => s + c._w, 0) + (node.children.length - 1) * H_GAP)) / 2;
  for (const c of node.children) {
    place(c, cursor, depth + 1, out);
    cursor += c._w + H_GAP;
  }
}

export function tree({ root, caption }) {
  measure(root);
  const nodes = [];
  place(root, 0, 0, nodes);

  const depth = Math.max(...nodes.map((n) => n._y)) / (BOX_H + V_GAP);
  const W = root._w;
  const H = (depth + 1) * BOX_H + depth * V_GAP + (caption ? 20 : 6);

  let svg = "";

  // Connectors: down from parent, across, down into each child.
  for (const n of nodes) {
    if (!n.children || !n.children.length) continue;
    const px = n._x + BOX_W / 2;
    const py = n._y + BOX_H;
    const midY = py + V_GAP / 2;
    svg += `<path d="M${px},${py} V${midY}" class="te"/>`;
    const xs = n.children.map((c) => c._x + BOX_W / 2);
    svg += `<path d="M${Math.min(...xs)},${midY} H${Math.max(...xs)}" class="te"/>`;
    for (const c of n.children) {
      svg += `<path d="M${c._x + BOX_W / 2},${midY} V${c._y}" class="te"/>`;
    }
  }

  for (const n of nodes) {
    const c = PALETTE[n.k || "acct"] || PALETTE.acct;
    const lines = wrap(n.t, 15);
    svg += `<rect x="${n._x}" y="${n._y}" width="${BOX_W}" height="${BOX_H}" rx="4" fill="${c.fill}" stroke="${c.stroke}"/>`;
    const startY = n.s ? n._y + 15 : n._y + (lines.length === 1 ? 24 : 18);
    lines.forEach((ln, i) => {
      svg += `<text x="${n._x + BOX_W / 2}" y="${startY + i * 10}" class="tn" fill="${c.text}" text-anchor="middle">${esc(ln)}</text>`;
    });
    if (n.s) {
      svg += `<text x="${n._x + BOX_W / 2}" y="${n._y + 15 + lines.length * 10 + 1}" class="ts" text-anchor="middle">${esc(n.s)}</text>`;
    }
  }

  if (caption) svg += `<text x="0" y="${H - 3}" class="dc">${esc(caption)}</text>`;

  return `<div class="dia"><svg viewBox="-4 -4 ${W + 8} ${H + 8}" width="100%" role="img">${svg}</svg></div>`;
}
