import fs from "node:fs";
import path from "node:path";
import { diagram } from "./diagram.mjs";
import { projects } from "./projects.mjs";
import { approach, controlTower, crossCutting, redFlags, glossary } from "./content.mjs";
import { bank, bankIntro, rapidFire, behavioural, askThem } from "./questionbank.mjs";
import * as ctd from "./ctdiagrams.mjs";

const SP = process.argv[2];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const md = (s) =>
  esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");

const qCount = bank.reduce((n, b) => n + b.opening.length + b.followUp.length + b.extension.length, 0)
  + rapidFire.reduce((n, [, i]) => n + i.length, 0)
  + behavioural.length
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


// Every question is [question, whatTheyAreChecking, whatToSay].
const qa3 = ([q, want, say]) =>
  `<div class="qa"><p class="q">${md(q)}</p>` +
  (want ? `<p class="want"><span class="lbl">They are checking</span> ${md(want)}</p>` : "") +
  `<p class="a"><span class="lbl">Say this</span> ${md(say)}</p></div>`;

/* ── Sections ───────────────────────────────────────────────────────── */

let toc = "";
let body = "";
const tocAdd = (id, label, sub = false) =>
  (toc += `<li class="${sub ? "s" : "m"}"><a href="#${id}">${esc(label)}</a></li>`);

// Part 1 — approach
tocAdd("approach", "1 · How to approach and run a project");
body += `<section class="part"><h1 id="approach">1 · How to approach and run a project</h1>
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
<p class="lede">Each project follows the same shape. What the problem was. The architecture. How the data moves. How it was set up. The decisions you should be ready to defend. The questions are not here — they are all together in Part 3, so there is one place to revise from.</p></section>`;

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

    <p class="bankref">Questions on this project, with full answers, are in <b>${esc(p.bankRef)}</b>.</p>

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
    for (const item of b[key]) body += `<li>${qa3(item)}</li>`;
    body += `</ul>`;
  }
  body += `</div>`;
}

tocAdd("rapid", "Rapid fire", true);
body += `<h2 id="rapid">Rapid fire</h2>
<p>Short answers are expected here. If any of these takes you more than ten seconds, put it on your revision list.</p>`;
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
<p>These are marked on whether your story has a real result and a real lesson, not on how impressive it sounds.</p>`;
body += behavioural.map(qa3).join("");

tocAdd("askthem", "Questions to ask them", true);
body += `<h2 id="askthem">Questions to ask them</h2>
<p>Having no questions makes you look uninterested. These also help you work out whether you want the job.</p><ul>`;
body += askThem.map((q) => `<li>${md(q)}</li>`).join("") + `</ul></section>`;

// Part 4 — Control Tower
body += `<section class="part"><h1 id="ct">4 · AWS Control Tower and landing zones</h1>
<p class="lede">${md(controlTower.what)}</p>

<h2>Why multi-account at all</h2><div class="tw"><table><tbody>${controlTower.why
  .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>

<h2>Why multi-account, drawn</h2>${ctd.beforeAfter}

<h2>What a landing zone looks like</h2>${ctd.ouTree}
<p>Controls attach to OUs, so the structure is really a question of which policies need to differ. Two OUs people forget: <b>Sandbox</b>, which needs hard spend limits rather than trust, and <b>Suspended</b>, which holds decommissioned accounts under a deny-all SCP so they are inert but still auditable.</p>

<h2>The three kinds of control, and where each intercepts</h2>${ctd.controlTypes}

<h2>How an account gets created</h2>${ctd.vending}

<h2>Where the logs go</h2>${ctd.logging}

<h2>How people get access</h2>${ctd.identity}

<h2>How the networks join up</h2>${ctd.network}

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

<h2>Expect to be asked</h2>${controlTower.questions.map(qa3).join("")}
</section>`;

// Part 4 — cross-cutting
tocAdd("cross", "5 · Questions that come up every time");
body += `<section class="part"><h1 id="cross">5 · Questions that come up every time</h1>
<p class="lede">These are asked whichever project you are talking about.</p>`;
for (const c of crossCutting) {
  body += `<h2>${esc(c.theme)}</h2>`;
  body += c.qa.map(qa3).join("");
}
body += `</section>`;

// Part 5 — red flags
tocAdd("flags", "6 · Mistakes that lose the interview");
body += `<section class="part"><h1 id="flags">6 · Mistakes that lose the interview</h1>
<div class="tw"><table><tbody>${redFlags
  .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>
<div class="closing"><h3>The one habit worth practising</h3>
<p>For every project, be able to say in two sentences: <b>what the constraint was</b>, and <b>what you chose because of it</b>. Almost every good interview answer is a variant of that sentence, and almost every weak one is a list of services with no constraint attached.</p></div>
</section>`;

// Appendix — glossary
tocAdd("gloss", "Words used in this document");
body += `<section class="part"><h1 id="gloss">Words used in this document</h1>
<p class="lede">If any word in this document is unfamiliar, it is explained here. Interviewers also ask for these definitions directly, so being able to say them in one sentence is useful on its own.</p>
<div class="tw"><table><tbody>${glossary
  .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${md(v)}</td></tr>`).join("")}</tbody></table></div></section>`;

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
  .a { margin:0; font-size:9.3pt; line-height:1.55; }

  .nums { background:#F6F8F8; border:1px solid #E0E5E4; border-radius:4px; padding:9px 12px; margin-top:12px; break-inside:avoid; }
  .nums ul { margin:0; padding-left:16px; }
  .nums li { font-size:8.9pt; }

  .closing { background:#EEF5F4; border-left:3px solid #0F766E; padding:10px 13px; margin-top:14px; break-inside:avoid; }
  .closing h3 { margin-top:0; }

  .dia { margin:10px 0 12px; break-inside:avoid; }
  .dl { font-family:Consolas,monospace; font-size:6.3px; fill:#7A827F; letter-spacing:0.7px; }
  .dn { font-family:"Segoe UI",Arial,sans-serif; font-size:8px; font-weight:600; }
  .ds { font-family:Consolas,monospace; font-size:6.4px; fill:#6B726F; }
  .tn { font-family:"Segoe UI",Arial,sans-serif; font-size:7.4px; font-weight:600; }
  .ts { font-family:Consolas,monospace; font-size:6px; fill:#6B726F; }
  .te { fill:none; stroke:#9AA3A0; stroke-width:1; }
  .de { fill:none; stroke:#5A625F; stroke-width:1; }
  .debg { fill:#FFFFFF; }
  .det { font-family:Consolas,monospace; font-size:6.2px; fill:#5A625F; }
  .dc { font-family:"Segoe UI",Arial,sans-serif; font-size:7px; fill:#6B726F; font-style:italic; }

  .want { margin:0 0 4px; font-size:8.9pt; color:#5A625F; }
  .lbl { display:inline-block; font-family:Consolas,monospace; font-size:7pt; letter-spacing:0.8px;
         text-transform:uppercase; color:#0F766E; margin-right:5px; }
  .bankref { font-size:8.9pt; color:#4A514E; background:#F4F7F7; border:1px solid #E0E7E6;
             border-radius:4px; padding:6px 10px; margin-top:10px; }
  .qbsec { break-inside:auto; margin-bottom:6px; }
  .lvl { font-size:9.4pt; margin:11px 0 4px; color:#0F766E; page-break-after:avoid; }
  .lvlnote { font-family:Consolas,monospace; font-size:7.3pt; color:#8A918E; font-weight:normal;
             text-transform:uppercase; letter-spacing:0.8px; margin-left:6px; }
  ul.qb { list-style:none; padding:0; margin:0 0 6px; }
  ul.qb li { break-inside:avoid; margin-bottom:9px; }
  ul.qb .qa { margin-bottom:0; }
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
  <div class="sub">Nine projects explained, with answers you can say out loud</div>
  <div class="st">9 PROJECTS &nbsp;·&nbsp; 16 DIAGRAMS &nbsp;·&nbsp; ${qCount} QUESTIONS</div>
  <div style="font-size:9pt;color:#5A625F">Prepared ${today}</div>
</div>

<div class="warn">
  <div class="warnbox">
    <h2>Read this before anything else</h2>
    <p><b>The technical details in this document are guesses, not facts.</b> They were written from ten single lines on a CV. Every service, setting and decision here is a sensible version of what such a project usually looks like. It is not a record of what you actually built.</p>
    <p><b>So use it for practice, not as a reference.</b> Go through every project and correct it so it matches what you really did. If it says OpenSearch and you used something else, change it. If it describes something you did not build, delete it.</p>
    <p><b>Here is what happens if you skip that step.</b> The interviewer asks one question deeper than the script. Something like "which embedding model did you use?" or "how long did a request actually take?" If your answer came from someone else's guess, you will not be able to answer, and then they will doubt everything else you said. A small true story survives questioning. A big invented one does not.</p>
    <p style="margin-bottom:0"><b>What you can use exactly as written:</b> the structure of an answer, the trade-offs worth mentioning, what the interviewer is really testing, and the whole Control Tower section, because that is standard AWS and does not depend on your projects.</p>
  </div>

  <h2>How to tell a project story</h2>
  <p>Use four sentences, in this order. This works for every project in this document.</p>
  <ol>
    <li><b>The limit you had to work with.</b> "Credit decisions had to be repeatable, and we had to be able to explain them to a regulator."</li>
    <li><b>What that made you choose.</b> "So the score is calculated by SQL rules, and the AI never decides anything."</li>
    <li><b>How it works.</b> "The AI collects the information through conversation, and afterwards explains the result in plain words."</li>
    <li><b>What you would do differently.</b> "If I did it again I would use a cheaper model for the simple parts sooner. We only worked out that saving late."</li>
  </ol>
  <p>Most people skip the fourth sentence. It is the one that makes you sound like someone who has really built something, instead of someone who has only read about it.</p>
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
