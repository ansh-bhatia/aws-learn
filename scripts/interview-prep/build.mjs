import fs from "node:fs";
import path from "node:path";
import { diagram } from "./diagram.mjs";
import { projects } from "./projects.mjs";
import { approach, controlTower, crossCutting, redFlags } from "./content.mjs";
import { bank, bankIntro, rapidFire, behavioural, askThem } from "./questionbank.mjs";

const SP = process.argv[2];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const md = (s) =>
  esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");

const qCount = bank.reduce((n, b) => n + b.opening.length + b.followUp.length + b.extension.length, 0)
  + rapidFire.reduce((n, [, i]) => n + i.length, 0)
  + behavioural.length
  + projects.reduce((n, p) => n + p.questions.length, 0)
  + controlTower.questions.length
  + crossCutting.reduce((n, c) => n + c.qa.length, 0);
const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/* ── Control Tower landing-zone diagram ─────────────────────────────── */
const ctDiagram = diagram({
  lanes: [
    { label: "Root", nodes: [{ id: "org", k: "ops", t: "AWS Organizations", s: "management account" }] },
    { label: "Security OU", nodes: [
      { id: "log", k: "data", t: "Log Archive", s: "immutable logs" },
      { id: "aud", k: "ops", t: "Audit account", s: "security tooling" },
    ] },
    { label: "Infrastructure OU", nodes: [
      { id: "net", k: "compute", t: "Network account", s: "Transit Gateway, IPAM" },
      { id: "shr", k: "compute", t: "Shared services" },
    ] },
    { label: "Workloads OU", nodes: [
      { id: "prod", k: "ext", t: "Prod accounts", s: "strict SCPs" },
      { id: "nonprod", k: "client", t: "Non-prod accounts" },
      { id: "sbx", k: "client", t: "Sandbox", s: "spend capped" },
    ] },
    { label: "Access", nodes: [
      { id: "sso", k: "ops", t: "IAM Identity Center", s: "permission sets" },
    ] },
  ],
  edges: [
    ["org", "log", "CloudTrail"],
    ["org", "aud"],
    ["org", "net"],
    ["org", "prod", "SCPs"],
    ["prod", "net", "TGW attach", { dashed: true }],
    ["nonprod", "net", "", { dashed: true }],
    ["sso", "prod", "roles", { dashed: true }],
    ["prod", "log", "logs", { dashed: true }],
  ],
  caption: "Controls attach to OUs; logs flow one way into an account workload teams cannot write to.",
});

/* ── Sections ───────────────────────────────────────────────────────── */

let toc = "";
let body = "";
const tocAdd = (id, label, sub = false) =>
  (toc += `<li class="${sub ? "s" : "m"}"><a href="#${id}">${esc(label)}</a></li>`);

// Part 1 — approach
tocAdd("approach", "1 · How you approach and run a project");
body += `<section class="part"><h1 id="approach">1 · How you approach and run a project</h1>
<p class="lede">${md(approach.intro)}</p>`;
for (const p of approach.phases) {
  body += `<div class="phase"><h3>${esc(p.name)}</h3><p class="goal">${md(p.goal)}</p><ul>`;
  for (const d of p.does) body += `<li>${md(d)}</li>`;
  body += `</ul><div class="say"><span class="tag">Say it like this</span><p>${md(p.says)}</p></div></div>`;
}
body += `<h2>Running it, once it is moving</h2><div class="tw"><table><tbody>`;
for (const [k, v] of approach.management) body += `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`;
body += `</tbody></table></div></section>`;

// Part 2 — projects
tocAdd("projects", "2 · The nine projects");
body += `<section class="part"><h1 id="projects">2 · The nine projects</h1>
<p class="lede">Each one follows the same shape: what the problem was, the architecture, how data flows, how it was configured, the decisions worth defending, and the questions you should expect.</p></section>`;

projects.forEach((p, i) => {
  const n = i + 1;
  tocAdd("p-" + p.id, `${n}. ${p.client} — ${p.name.split("—")[0].trim()}`, true);
  body += `<section class="proj"><div class="ph"><div class="pn">Project ${n} · ${esc(p.client)}</div>
    <h1 id="p-${p.id}">${esc(p.name)}</h1>
    <p class="one">${md(p.oneLine)}</p>
    <p class="stack"><b>Stack</b> · ${esc(p.stack)}</p></div>

    <h3>The problem</h3><p>${md(p.problem)}</p>

    <h3>Architecture</h3>${diagram(p.diagram)}

    <h3>How data flows</h3><ol class="flow">${p.flow.map((f) => `<li>${md(f)}</li>`).join("")}</ol>

    <h3>Configuration</h3><div class="tw"><table><tbody>${p.config
      .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>

    <h3>Decisions worth defending</h3><div class="tw"><table><tbody>${p.decisions
      .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>

    <h3>Expect to be asked</h3>${p.questions
      .map(([q, a]) => `<div class="qa"><p class="q">${md(q)}</p><p class="a">${md(a)}</p></div>`).join("")}

    <div class="nums"><span class="tag">Numbers to have ready</span><ul>${p.numbers
      .map((x) => `<li>${md(x)}</li>`).join("")}</ul></div>
  </section>`;
});


// Part 3 — question bank
tocAdd("bank", "3 · Question bank");
body += `<section class="part"><h1 id="bank">3 · Question bank</h1>
<p class="lede">${bankIntro.split(/\n\n+/).map((x) => md(x)).join('</p><p class="lede">')}</p>`;
for (const b of bank) {
  tocAdd("qb-" + b.id, b.label, true);
  body += `<div class="qbsec"><h2 id="qb-${b.id}">${esc(b.label)}</h2>`;
  for (const [lvl, key, note] of [
    ["Opening", "opening", "asked first"],
    ["Follow-up", "followUp", "where candidates come apart"],
    ["Extension", "extension", "reasoning, not recall"],
  ]) {
    if (!b[key] || !b[key].length) continue;
    body += `<h3 class="lvl">${lvl} <span class="lvlnote">${note}</span></h3><ul class="qb">`;
    for (const [q, a] of b[key]) body += `<li><span class="qq">${md(q)}</span><span class="qa2">${md(a)}</span></li>`;
    body += `</ul>`;
  }
  body += `</div>`;
}

tocAdd("rapid", "Rapid fire", true);
body += `<h2 id="rapid">Rapid fire</h2>
<p>One-line answers expected. If any of these take more than ten seconds, that is the revision list.</p>`;
for (const [theme, items] of rapidFire) {
  body += `<h3>${esc(theme)}</h3><ul class="rf">`;
  for (const it of items) {
    const [q, a] = it.split(" → ");
    body += `<li><b>${md(q)}</b><br><span class="rfa">→ ${md(a || "")}</span></li>`;
  }
  body += `</ul>`;
}

tocAdd("behav", "Behavioural", true);
body += `<h2 id="behav">Behavioural</h2>
<p>These are scored on whether the story has a consequence and a correction, not on how impressive it sounds.</p>`;
body += behavioural.map(([q, a]) => `<div class="qa"><p class="q">${md(q)}</p><p class="a">${md(a)}</p></div>`).join("");

tocAdd("askthem", "Questions to ask them", true);
body += `<h2 id="askthem">Questions to ask them</h2>
<p>Having none signals no interest. These also tell you whether you want the job.</p><ul>`;
body += askThem.map((q) => `<li>${md(q)}</li>`).join("") + `</ul></section>`;

// Part 4 — Control Tower
body += `<section class="part"><h1 id="ct">4 · AWS Control Tower and landing zones</h1>
<p class="lede">${md(controlTower.what)}</p>

<h2>Why multi-account at all</h2><div class="tw"><table><tbody>${controlTower.why
  .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>

<h2>What a landing zone looks like</h2>${ctDiagram}

<h2>What Control Tower sets up for you</h2><div class="tw"><table><tbody>${controlTower.builds
  .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>

<h2>Setting it up — the general steps</h2><div class="tw"><table><tbody>${controlTower.setup
  .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>

<h2>Landing zone design decisions</h2><div class="tw"><table><tbody>${controlTower.landingZone
  .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>

<h2>How it applies to your projects</h2>
<p>This is the part that separates someone who has read about Control Tower from someone who has used it. Tie it to work you did.</p>
<div class="tw"><table><tbody>${controlTower.inProject
  .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>

<h2>Expect to be asked</h2>${controlTower.questions
  .map(([q, a]) => `<div class="qa"><p class="q">${md(q)}</p><p class="a">${md(a)}</p></div>`).join("")}
</section>`;

// Part 4 — cross-cutting
tocAdd("cross", "5 · Cross-cutting questions");
body += `<section class="part"><h1 id="cross">5 · Cross-cutting questions</h1>
<p class="lede">These come up regardless of which project you are discussing.</p>`;
for (const c of crossCutting) {
  body += `<h2>${esc(c.theme)}</h2>`;
  body += c.qa.map(([q, a]) => `<div class="qa"><p class="q">${md(q)}</p><p class="a">${md(a)}</p></div>`).join("");
}
body += `</section>`;

// Part 5 — red flags
tocAdd("flags", "6 · What loses the room");
body += `<section class="part"><h1 id="flags">6 · What loses the room</h1>
<div class="tw"><table><tbody>${redFlags
  .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>
<div class="closing"><h3>The one habit worth practising</h3>
<p>For every project, be able to say in two sentences: <b>what the constraint was</b>, and <b>what you chose because of it</b>. Almost every good interview answer is a variant of that sentence, and almost every weak one is a list of services with no constraint attached.</p></div>
</section>`;

/* ── Document ───────────────────────────────────────────────────────── */

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>AWS Project Interview Preparation</title>
<style>
  @page { size: A4; margin: 16mm 14mm 18mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
         font-size: 9.5pt; line-height: 1.52; color: #15181A; margin: 0; }
  code { font-family: Consolas, monospace; font-size: 8.6pt; background: #EEF2F1; padding: 0.5px 3px; border-radius: 2px; }
  b { font-weight: 600; }

  .cover { height: 250mm; display:flex; flex-direction:column; justify-content:center; text-align:center; page-break-after: always; }
  .cover .bar { width: 52px; height: 3px; background:#0F766E; margin:0 auto 22px; }
  .cover h1 { font-size: 28pt; margin:0 0 8px; letter-spacing:-0.6px; }
  .cover .sub { font-size: 12.5pt; color:#5A625F; margin-bottom:26px; }
  .cover .st { font-family: Consolas, monospace; font-size:8.6pt; color:#5A625F;
               border-top:1px solid #D6DAD8; border-bottom:1px solid #D6DAD8; padding:10px 0; width:74%; margin:0 auto 22px; }

  .warn { page-break-after: always; }
  .warnbox { border:2px solid #C77700; background:#FFF6E8; padding:14px 16px; border-radius:4px; margin-bottom:14px; }
  .warnbox h2 { color:#8A5200; font-size:13.5pt; margin:0 0 8px; }
  .warnbox p { margin:0 0 7px; }

  h1 { font-size: 17pt; color:#0F766E; margin:0 0 8px; letter-spacing:-0.3px; }
  h2 { font-size: 12.5pt; color:#11433F; margin:18px 0 7px; page-break-after: avoid; }
  h3 { font-size: 10.6pt; margin:14px 0 5px; color:#11433F; page-break-after: avoid; }
  p { margin:0 0 7px; orphans:2; widows:2; }
  ul, ol { margin:0 0 8px; padding-left:18px; }
  li { margin-bottom:3.5px; }
  .lede { color:#4A514E; font-size:9.8pt; margin-bottom:10px; }

  .toc { page-break-after: always; }
  .toc ul { list-style:none; padding:0; margin:0; }
  .toc li.m { font-weight:600; font-size:10.2pt; margin:10px 0 3px; }
  .toc li.s { font-size:8.8pt; padding-left:16px; margin-bottom:2.5px; color:#4A514E; }
  .toc a { text-decoration:none; color:inherit; }

  .part { page-break-before: always; }
  .proj { page-break-before: always; }
  .ph { border-bottom:2px solid #0F766E; padding-bottom:8px; margin-bottom:12px; }
  .pn { font-family:Consolas,monospace; font-size:8.4pt; letter-spacing:1.2px;
        text-transform:uppercase; color:#0F766E; margin-bottom:5px; }
  .one { font-style:italic; color:#4A514E; margin:4px 0 6px; }
  .stack { font-size:8.7pt; color:#5A625F; margin:0; }

  .phase { break-inside:avoid; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #E6EAE9; }
  .goal { font-style:italic; color:#5A625F; font-size:9pt; margin:0 0 5px; }
  .say { background:#EEF5F4; border-left:3px solid #0F766E; padding:8px 11px; margin-top:7px; break-inside:avoid; }
  .say p { margin:0; font-size:9.2pt; }
  .tag { display:inline-block; font-family:Consolas,monospace; font-size:7.3pt; letter-spacing:1px;
         text-transform:uppercase; color:#0F766E; margin-bottom:4px; }

  .flow li { margin-bottom:4px; }

  .qa { break-inside:avoid; margin-bottom:9px; padding-left:11px; border-left:2px solid #CFE0DD; }
  .q { font-weight:600; margin:0 0 3px; color:#11433F; }
  .a { margin:0; font-size:9.3pt; }

  .nums { background:#F6F8F8; border:1px solid #E0E5E4; border-radius:4px; padding:9px 12px; margin-top:12px; break-inside:avoid; }
  .nums ul { margin:0; padding-left:16px; }
  .nums li { font-size:8.9pt; }

  .closing { background:#EEF5F4; border-left:3px solid #0F766E; padding:10px 13px; margin-top:14px; break-inside:avoid; }
  .closing h3 { margin-top:0; }

  .dia { margin:10px 0 12px; break-inside:avoid; }
  .dl { font-family:Consolas,monospace; font-size:6.3px; fill:#7A827F; letter-spacing:0.7px; }
  .dn { font-family:"Segoe UI",Arial,sans-serif; font-size:8px; font-weight:600; }
  .ds { font-family:Consolas,monospace; font-size:6.4px; fill:#6B726F; }
  .de { fill:none; stroke:#5A625F; stroke-width:1; }
  .debg { fill:#FFFFFF; }
  .det { font-family:Consolas,monospace; font-size:6.2px; fill:#5A625F; }
  .dc { font-family:"Segoe UI",Arial,sans-serif; font-size:7px; fill:#6B726F; font-style:italic; }

  .qbsec { break-inside:auto; margin-bottom:6px; }
  .lvl { font-size:9.4pt; margin:11px 0 4px; color:#0F766E; page-break-after:avoid; }
  .lvlnote { font-family:Consolas,monospace; font-size:7.3pt; color:#8A918E; font-weight:normal;
             text-transform:uppercase; letter-spacing:0.8px; margin-left:6px; }
  ul.qb { list-style:none; padding:0; margin:0 0 6px; }
  ul.qb li { break-inside:avoid; margin-bottom:6px; padding-left:10px; border-left:2px solid #E0E7E6; }
  .qq { display:block; font-weight:600; font-size:9.3pt; }
  .qa2 { display:block; font-size:8.8pt; color:#4A514E; }
  .qa2::before { content:"→ "; color:#0F766E; }
  ul.rf { list-style:none; padding:0; margin:0 0 8px; column-count:2; column-gap:18px; }
  ul.rf li { break-inside:avoid; margin-bottom:6px; font-size:8.6pt; }
  .rfa { color:#4A514E; }

  .tw { break-inside:avoid; margin:8px 0 10px; }
  table { border-collapse:collapse; width:100%; font-size:8.9pt; }
  th, td { border:1px solid #DCE1E0; padding:5px 7px; text-align:left; vertical-align:top; }
  th { background:#EDF2F1; font-weight:600; width:27%; color:#11433F; }
</style></head><body>

<div class="cover">
  <div class="bar"></div>
  <h1>AWS Project<br>Interview Preparation</h1>
  <div class="sub">Nine projects, end to end — plus Control Tower and landing zones</div>
  <div class="st">9 PROJECTS &nbsp;·&nbsp; 10 DIAGRAMS &nbsp;·&nbsp; ${qCount} QUESTIONS</div>
  <div style="font-size:9pt;color:#5A625F">Prepared ${today}</div>
</div>

<div class="warn">
  <div class="warnbox">
    <h2>Read this before anything else</h2>
    <p><b>The technical detail in this document is reconstructed, not recorded.</b> It was written from ten one-line resume bullets. Every service choice, configuration value and design decision here is a plausible, defensible version of what such a project usually looks like — it is not a record of what you actually built.</p>
    <p><b>So treat it as a rehearsal script, not a reference.</b> Go through each project and correct it to match reality before you use any of it. Where this document says OpenSearch and you used Pinecone, change it. Where it claims a mechanism you did not implement, cut it.</p>
    <p><b>The risk of not doing that is specific and serious.</b> An interviewer asks one layer deeper than the script — "what embedding model?", "what was the actual p99?" — and an answer rehearsed from someone else's assumption falls apart. A smaller, true story survives scrutiny; a larger invented one does not.</p>
    <p style="margin-bottom:0"><b>What is safe to use as-is</b> is the shape: how to structure an answer, which trade-offs to name, what interviewers are actually testing, and the Control Tower material, which is standard AWS rather than project-specific.</p>
  </div>

  <h2>How to tell a project story</h2>
  <p>Four sentences, in this order. It works for every project in this document.</p>
  <ol>
    <li><b>The constraint.</b> "Credit decisions had to be reproducible and explainable to a regulator."</li>
    <li><b>The choice it forced.</b> "So the scoring is deterministic SQL, and the model never decides."</li>
    <li><b>The mechanism.</b> "The LLM collects information conversationally and explains the result afterwards."</li>
    <li><b>What you would change.</b> "With more time I would add task-based model routing earlier — we found the cost win late."</li>
  </ol>
  <p>The fourth sentence is the one most candidates skip, and it is the one that makes you sound like someone who has shipped something rather than someone who has read about it.</p>
</div>

<div class="toc"><h1>Contents</h1><ul>${toc}</ul></div>

${body}
</body></html>`;

fs.writeFileSync(path.join(SP, "interview.html"), html);
fs.writeFileSync(
  path.join(SP, "interview-outline.json"),
  JSON.stringify({
    chapters: [
      { num: 1, name: "How you approach and run a project", topics: approach.phases.map((p) => p.name) },
      { num: 2, name: "The nine projects", topics: projects.map((p) => p.name) },
      { num: 3, name: "Question bank", topics: bank.map((b) => b.label) },
      { num: 4, name: "AWS Control Tower and landing zones", topics: controlTower.setup.map(([k]) => k) },
      { num: 5, name: "Cross-cutting questions", topics: crossCutting.map((c) => c.theme) },
      { num: 6, name: "What loses the room", topics: redFlags.map(([k]) => k) },
    ],
  })
);
console.log(`projects ${projects.length}  diagrams ${projects.length + 1}  html ${(html.length / 1024).toFixed(0)} KB`);
