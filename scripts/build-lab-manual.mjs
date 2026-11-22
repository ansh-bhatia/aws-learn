// Builds the hands-on lab manual: the procedural half of the corpus, kept
// verbatim. The other two documents strip steps out; here the steps are the
// entire point, so nothing is summarised.
import fs from "node:fs";
import path from "node:path";

const SP = process.argv[2];
const { rows } = JSON.parse(fs.readFileSync(path.join(SP, "topics.json"), "utf8"));

const TITLE_LAB = /\b(lab|hands[- ]on|walkthrough|step[- ]by[- ]step|demo|capstone|project|installation|install|setup|set up|console|creating|create|building|build|configure|configuring|deploy|deploying)\b/i;
const STEP_LINE = /^[-*\s>]*(\**)?(\d+[.)·]|Step\s*\d+)/i;
const IMPERATIVE = /^[-*\d.\s>]*\**(Click|Choose|Select|Navigate|Open|Go to|Enter|Type|Press|Scroll|Launch|Create|Add|Attach|Run|Download|Upload|Install|Configure|Set|Copy|Paste|Delete|Stop|Start|Connect|Verify|Check|Save|Submit|Apply|Enable|Disable|Tick|Leave)\b/i;

/* ── Series detection ──────────────────────────────────────────────────── */

function seriesKey(title) {
  // "ECS Project Step 5 (Part 8.2)" carries two numbers; ordering on the step
  // alone leaves the nine parts of step 5 in arbitrary order.
  const m = title.match(
    /^(.*?)\s*[–—-]?\s*(?:Capstone\s*(\d+)|Step\s*([\d.]+))?\s*(?:\(?Part\s*([\d.]+)\)?)?\s*(?:[–—-]|$)/i
  );
  if (!m) return null;
  const [, rawBase, cap, step, part] = m;
  if (!cap && !step && !part) return null;
  const base = rawBase.replace(/\s*[–—:-]\s*$/, "").trim();
  if (base.length < 6) return null;
  return { base, num: parseFloat(cap || step || 0) + parseFloat(part || 0) / 100 };
}

// Judged across the whole corpus, so a step that happens to be light on
// instructions cannot drop out and leave a hole in the middle of a build.
const seriesCount = new Map();
for (const r of rows) {
  const k = seriesKey(r.title);
  if (k) {
    const id = k.base.toLowerCase();
    seriesCount.set(id, (seriesCount.get(id) || 0) + 1);
  }
}
const REAL_SERIES = new Set([...seriesCount].filter(([, n]) => n >= 2).map(([k]) => k));

/* ── Selection ─────────────────────────────────────────────────────────── */

const scored = rows.map((r) => {
  const lines = r.content.split("\n");
  return {
    ...r,
    steps: lines.filter((l) => STEP_LINE.test(l.trim())).length,
    imper: lines.filter((l) => IMPERATIVE.test(l.trim())).length,
  };
});

// A numbered list is not necessarily a procedure: explanatory topics are full
// of "1. Fully managed. 2. Deep AWS integration…". What makes something a lab
// is being told to *do* things, so every rule below requires imperatives.
// Declared a lab by its own title — that is decisive, however it is written.
const NAMED_LAB = /^(lab\b|capstone\b)|hands[- ]on|\bsuper lab\b/i;

// Otherwise a numbered list is not necessarily a procedure: explanatory topics
// are full of "1. Fully managed. 2. Deep AWS integration…". What makes
// something a lab is being told to *do* things, so the rest need imperatives.
const isProcedural = (r) =>
  NAMED_LAB.test(r.title) ||
  r.walkthrough ||
  r.imper >= 5 ||
  (r.steps >= 5 && r.imper >= 2) ||
  (TITLE_LAB.test(r.title) && r.imper >= 2);

// A base only counts as a build if at least one of its parts is actually a
// lab. Without this, conceptual two-parters ("REST API vs HTTP API, Part 1/2")
// get pulled into a manual of things to do at the keyboard.
const BUILDS = new Set(
  [...REAL_SERIES].filter((base) =>
    scored.some((r) => {
      const k = seriesKey(r.title);
      return k && k.base.toLowerCase() === base && isProcedural(r);
    })
  )
);

const inSeries = (r) => {
  const k = seriesKey(r.title);
  return !!k && BUILDS.has(k.base.toLowerCase());
};

const labs = scored.filter((r) => isProcedural(r) || inSeries(r));

/* ── Grouping ──────────────────────────────────────────────────────────── */

const AREAS = [
  "Foundations (Start Here)", "Compute", "Storage", "Database", "Networking & CDN",
  "Security & Identity", "Messaging & Integration", "Monitoring & Management",
  "GenAI on AWS", "AI & Machine Learning", "Analytics", "Developer Tools & CI/CD",
  "Migration & Billing", "Global Infrastructure", "Projects / Hands-On Labs",
  "Capstone Projects",
];

const out = [];
for (const area of AREAS) {
  const mine = labs.filter((l) => l.cat === area);
  if (!mine.length) continue;

  const groups = new Map();
  const items = [];
  for (const l of mine) {
    const k = inSeries(l) ? seriesKey(l.title) : null;
    if (k) {
      const id = k.base.toLowerCase();
      if (!groups.has(id)) {
        const g = { kind: "series", name: k.base, parts: [] };
        groups.set(id, g);
        items.push(g);
      }
      groups.get(id).parts.push({ ...l, num: k.num });
    } else {
      items.push({ kind: "lab", ...l });
    }
  }
  for (const g of items) if (g.kind === "series") g.parts.sort((a, b) => a.num - b.num);
  out.push({
    area,
    items: items.map((g) =>
      g.kind === "series" && g.parts.length === 1 ? { kind: "lab", ...g.parts[0] } : g
    ),
  });
}

fs.writeFileSync(path.join(SP, "labs.json"), JSON.stringify(out));

const nLabs = out.reduce(
  (s, a) => s + a.items.reduce((x, i) => x + (i.kind === "series" ? i.parts.length : 1), 0), 0);
const nSeries = out.reduce((s, a) => s + a.items.filter((i) => i.kind === "series").length, 0);
console.log(`areas             ${out.length}`);
console.log(`labs              ${nLabs}`);
console.log(`multi-part builds ${nSeries}`);
console.log(`content           ${(labs.reduce((s, l) => s + l.content.length, 0) / 1024 / 1024).toFixed(2)} MB`);
console.log("\n-- multi-part builds --");
for (const a of out)
  for (const i of a.items)
    if (i.kind === "series") {
      console.log(`  ${String(i.parts.length).padStart(2)} parts  ${i.name.slice(0, 60)}`);
    }
