// Builds the rapid-revision notes: facts only, no teaching prose.
//
// The reader already works with AWS daily, so anything they would know from
// doing the job is cut. What stays is what people forget: exact limits, the
// boundary between two similar services, defaults, and the services you touch
// once a year.
import fs from "node:fs";
import path from "node:path";

const SP = process.argv[2];
const { rows } = JSON.parse(fs.readFileSync(path.join(SP, "topics.json"), "utf8"));

/* ── Cut what daily work already teaches ──────────────────────────────── */

const BASICS = /^(what is|what are|introduction|intro\b|getting started|overview|why (the )?cloud|the \d+ benefits|types of cloud|cloud service models|how .* began|creating your first|hello world)/i;
const SETUP = /\b(lab|capstone|project|walkthrough|step-by-step|installation|install\b|setup|set up|console)\b/i;

const TABLE_RE = /(?:^\|[^\n]*\|\n)(?:^\|[\s:|-]+\|\n)(?:^\|[^\n]*\|\n?)+/gm;
const CALLOUT_RE = /^>\s?(.*)$/gm;

// A fact worth memorising almost always carries a figure or an absolute.
const HARD = /\b(\d[\d,.]*\s?(?:KB|MB|GB|TB|PB|KiB|MiB|GiB|TiB|ms|μs|sec|secs|seconds?|mins?|minutes?|hours?|days?|months?|years?|%|vCPUs?|IOPS|Gbps|Mbps|MB\/s|GB\/s|nines)|\b\d{3,}\b|up to \d|maximum|minimum|default(?:s| is| of)|hard limit|soft limit|cannot|can't|never|always|only|must be|not supported|unlimited|per (?:account|region|VPC|bucket|table|instance|subnet|second))/i;

const strip = (s) =>
  s.replace(/\*\*/g, "").replace(/`/g, "").replace(/^[-*]\s+/, "").replace(/\s+/g, " ").trim();


// A line only earns a place if it stands on its own. Narrative asides, second
// person, console paths and rhetorical set-ups all read as noise once the
// surrounding explanation is gone.
const NARRATIVE = /^(you|your|we |let |now |next |then |here |there |this |that |these |those |it |so |but |and |imagine|think|notice|consider|compare|suppose|look |see |first|second|third|finally|two |one of|another)/i;
const CONSOLE_PATH = /(→|->|→)|(Actions|Console|dashboard|menu|tab)\s*[>→]/i;
const STEP_NUM = /^\d+\s*[.):·-]/;
const SELF_CONTAINED = (s) =>
  !NARRATIVE.test(s) &&
  !STEP_NUM.test(s) &&
  !CONSOLE_PATH.test(s) &&
  !/\?$/.test(s) &&
  !/^\(/.test(s) &&
  /[A-Z0-9]/.test(s[0] || "") &&
  (/\d/.test(s) || /(cannot|can't|never|always|only|must|default|maximum|minimum|unlimited|not supported|no charge|free|requires|does not|is not)/i.test(s));

function mine(content) {
  const tables = content.match(TABLE_RE) || [];
  // Pull tables out before scanning lines so their rows are not counted twice.
  let rest = content;
  for (const t of tables) rest = rest.replace(t, "\n");

  const callouts = [];
  let m;
  const cre = new RegExp(CALLOUT_RE);
  while ((m = cre.exec(rest))) {
    const line = strip(m[1]);
    const gotcha = /⚠|(cannot|can't|never|always|only|must|default|not supported|does not|is not|no way to|irreversible|permanent)/i.test(line);
    if (line.length > 24 && line.length < 165 && gotcha && !NARRATIVE.test(line)
        && !STEP_NUM.test(line) && !CONSOLE_PATH.test(line)) {
      callouts.push(line);
    }
  }
  rest = rest.replace(/^>.*$/gm, "");

  const facts = [];
  for (const raw of rest.split("\n")) {
    const l = raw.trim();
    if (!l || l.startsWith("#") || l.startsWith("|")) continue;
    if (!/^[-*]\s|\*\*/.test(l)) continue;          // bullets and bolded statements only
    const s = strip(l);
    if (s.length < 28 || s.length > 185) continue;
    if (!HARD.test(s) || !SELF_CONTAINED(s)) continue;
    facts.push(s);
  }
  return { tables, callouts, facts };
}

/* ── Build ─────────────────────────────────────────────────────────────── */

const CHAPTERS = [
  "Compute", "Storage", "Database", "Networking & CDN", "Security & Identity",
  "Messaging & Integration", "Monitoring & Management", "Analytics",
  "AI & Machine Learning", "GenAI on AWS", "Developer Tools & CI/CD",
  "Migration & Billing", "Global Infrastructure", "Foundations (Start Here)",
];

const dedupe = new Set();
const uniq = (s) => {
  const k = s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 90);
  if (dedupe.has(k)) return false;
  dedupe.add(k);
  return true;
};

const out = [];
let nTables = 0, nCallouts = 0, nFacts = 0, nTopics = 0;

for (const chName of CHAPTERS) {
  const topics = rows.filter(
    (r) => r.cat === chName && !r.walkthrough && !BASICS.test(r.title) && !SETUP.test(r.title)
  );
  const thin = topics.length <= 14;
  const blocks = [];
  for (const t of topics) {
    const { tables, callouts, facts } = mine(t.content);

    // Final gate, applied where the lines are actually used. Two things slipped
    // through the per-line checks: blockquote markers on nested quotes, and
    // rhetorical set-ups ("Here is the trap…") that mean nothing once the
    // paragraph they introduced is gone.
    const OPENER = /^(here|there|this|that|these|those|it|so|but|and|now|next|then|we|you|your|let|first|second|third|finally|imagine|think|notice|consider|compare|suppose|look|see|two|one|another)\b/i;
    const clean1 = (s) => s.replace(/^[>\s]+/, "").trim();
    const ok = (s) => {
      const v = clean1(s);
      return v.length > 24 && !OPENER.test(v) && !/^\d+\s*[.):·-]/.test(v);
    };

    const c = callouts.map(clean1).filter(ok).filter(uniq).slice(0, 2);
    const f = facts.map(clean1).filter(ok).filter(uniq).slice(0, 3);
    const isCompare = / vs | versus |compared|comparison|difference|cheat sheet|keyword|limits?/i.test(t.title);
    const worth = tables.length > 0 || isCompare || (c.length + f.length) >= (thin ? 1 : 3);
    if (!worth) continue;
    blocks.push({ title: t.title, tables, callouts: c, facts: f });
    nTables += tables.length; nCallouts += c.length; nFacts += f.length; nTopics++;
  }
  if (blocks.length) out.push({ name: chName, blocks });
}

const KEYWORD_CHEAT = /cheat sheet|keyword/i;
const keywordTables = [];
for (const ch of out) {
  for (const b of ch.blocks) {
    if (!KEYWORD_CHEAT.test(b.title)) continue;
    const kw = b.tables.filter((t) => /keyword|question|scenario|if the|says/i.test(t.split(String.fromCharCode(10))[0] || ""));
    if (kw.length) keywordTables.push({ title: b.title, tables: kw });
  }
}
fs.writeFileSync(path.join(SP, "cram.json"), JSON.stringify({ chapters: out, keywordTables }));
console.log("keyword cheat tables:", keywordTables.reduce((s, k) => s + k.tables.length, 0), "from", keywordTables.length, "topics");

const words = out.reduce(
  (s, c) => s + c.blocks.reduce(
    (b, x) => b + x.tables.join(" ").split(/\s+/).length
      + x.callouts.join(" ").split(/\s+/).length
      + x.facts.join(" ").split(/\s+/).length, 0), 0);

console.log(`chapters ${out.length}  topics ${nTopics}`);
console.log(`tables   ${nTables}`);
console.log(`callouts ${nCallouts}`);
console.log(`facts    ${nFacts}`);
console.log(`words    ~${(words / 1000).toFixed(1)}K  (reading at ~110 wpm for dense notes = ~${(words / 110 / 60).toFixed(1)} h)`);
