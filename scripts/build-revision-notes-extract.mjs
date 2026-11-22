import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = "C:/Users/Gaurav/Desktop/AWSLearningapp";
const dir = path.join(ROOT, "src/data/categories");

// Order chapters the way an interview candidate should study, not the order the
// course happened to teach them in.
const ORDER = [
  "foundations", "global-infra", "compute", "storage", "database", "networking",
  "security", "messaging", "monitoring", "analytics", "ai-ml", "genai-on-aws",
  "devtools", "migration-billing", "projects-labs", "projects",
];

const cats = [];
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) {
  const m = await import(pathToFileURL(path.join(dir, f)).href);
  if (m.default?.topics) cats.push({ file: f.replace(/\.js$/, ""), ...m.default });
}
cats.sort((a, b) => {
  const i = ORDER.indexOf(a.file), j = ORDER.indexOf(b.file);
  return (i < 0 ? 99 : i) - (j < 0 ? 99 : j);
});

// ── What counts as filler for an interview ───────────────────────────────
// Not "lab" as a word — plenty of lab topics explain a mechanism. The signal is
// a body that is mostly console navigation: click this, open that, choose Next.
const CLICK = /\b(click|choose|select|navigate to|scroll down|press the|button|dropdown|checkbox|tick the|leave the default|hit (?:next|create|launch))\b/gi;
const SCREENSHOT = /!\[[^\]]*\]\([^)]*\)/g;

// Conceptual markers — things an interviewer actually probes.
const CONCEPT = /\b(because|why|difference|versus|vs\.?|trade-?off|when to use|limit|quota|maximum|minimum|default|cannot|must|stateful|stateless|durability|availability|consistency|latency|throughput|cost|pricing|scenario|keyword|exam|interview|gotcha|trap|common mistake|remember)\b/gi;

const score = (t) => {
  const body = t.content || "";
  const words = body.split(/\s+/).length || 1;
  const clicks = (body.match(CLICK) || []).length;
  const shots = (body.match(SCREENSHOT) || []).length;
  const concepts = (body.match(CONCEPT) || []).length;
  return {
    clickRate: (clicks / words) * 1000,      // click verbs per 1000 words
    conceptRate: (concepts / words) * 1000,
    shots,
    words,
  };
};

const rows = [];
for (const c of cats) {
  for (const t of c.topics || []) {
    if (!t.content) continue;
    const s = score(t);
    // A topic is a walkthrough when console navigation dominates and there is
    // little explanation carrying it.
    const walkthrough = s.clickRate > 6 && s.conceptRate < s.clickRate * 1.6;
    rows.push({
      cat: c.label || c.file, catFile: c.file,
      id: t.id, title: t.title, shortDesc: t.shortDesc || "",
      content: t.content, ...s, walkthrough,
    });
  }
}

fs.writeFileSync(
  path.join(process.argv[2], "topics.json"),
  JSON.stringify({ cats: cats.map((c) => ({ file: c.file, label: c.label || c.file })), rows }, null, 0)
);

const kept = rows.filter((r) => !r.walkthrough);
const dropped = rows.filter((r) => r.walkthrough);
console.log(`total    ${rows.length} topics, ${(rows.reduce((s, r) => s + r.content.length, 0) / 1024 / 1024).toFixed(2)} MB`);
console.log(`keep     ${kept.length} topics, ${(kept.reduce((s, r) => s + r.content.length, 0) / 1024 / 1024).toFixed(2)} MB`);
console.log(`drop     ${dropped.length} walkthroughs, ${(dropped.reduce((s, r) => s + r.content.length, 0) / 1024 / 1024).toFixed(2)} MB`);
console.log("\n-- highest click-rate (dropped) --");
dropped.sort((a, b) => b.clickRate - a.clickRate).slice(0, 8)
  .forEach((r) => console.log(`  click/1k=${r.clickRate.toFixed(1).padStart(5)} concept/1k=${r.conceptRate.toFixed(1).padStart(5)}  ${r.title.slice(0, 68)}`));
console.log("\n-- borderline KEPT with clicks (sanity check) --");
kept.filter((r) => r.clickRate > 4).sort((a, b) => b.clickRate - a.clickRate).slice(0, 8)
  .forEach((r) => console.log(`  click/1k=${r.clickRate.toFixed(1).padStart(5)} concept/1k=${r.conceptRate.toFixed(1).padStart(5)}  ${r.title.slice(0, 68)}`));
