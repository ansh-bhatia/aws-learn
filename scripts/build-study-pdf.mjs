// Builds the interview study guide as one printable HTML document.
// Chrome renders it to PDF; page numbers and bookmarks are stamped afterwards.
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const SP = process.argv[2];
const { rows } = JSON.parse(fs.readFileSync(path.join(SP, "topics.json"), "utf8"));

/* ── Curation ──────────────────────────────────────────────────────────── */

// Pure console walkthroughs teach a click path, not a concept. Interviews test
// the concept, so they come out.
const kept = rows.filter((r) => !r.walkthrough);

// The handful of remaining step lines inside otherwise-conceptual topics.
const STEP_LINE = /^[-*\d.\s>]*\**(Click|Choose the .*button|Press|Scroll down|Tick)\b/i;
const clean = (md) =>
  md
    .split("\n")
    .filter((l) => !STEP_LINE.test(l.trim()))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const CAT_ORDER = [
  "Foundations (Start Here)", "Global Infrastructure", "Compute", "Storage",
  "Database", "Networking & CDN", "Security & Identity", "Messaging & Integration",
  "Monitoring & Management", "Analytics", "AI & Machine Learning", "GenAI on AWS",
  "Developer Tools & CI/CD", "Migration & Billing", "Projects / Hands-On Labs",
  "Capstone Projects",
];

const chapters = [];
for (const name of CAT_ORDER) {
  const topics = kept.filter((r) => r.cat === name);
  if (topics.length) chapters.push({ name, topics });
}
for (const r of kept) {
  if (!CAT_ORDER.includes(r.cat) && !chapters.find((c) => c.name === r.cat)) {
    chapters.push({ name: r.cat, topics: kept.filter((x) => x.cat === r.cat) });
  }
}

// Comparison and cheat-sheet topics are what interviewers actually probe, so
// they get their own index at the front rather than being buried by chapter.
const COMPARE = / vs | versus |compared|comparison|difference|cheat sheet|keyword/i;
const compareTopics = kept.filter((r) => COMPARE.test(r.title));

/* ── Markdown → HTML ───────────────────────────────────────────────────── */

marked.setOptions({ gfm: true, breaks: false, mangle: false, headerIds: false });

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Topic bodies start at h2; shift them down one level so the topic title is the
// only h2 on the page and the PDF outline nests correctly.
function renderBody(md) {
  let html = marked.parse(clean(md));
  html = html
    .replace(/<h5>/g, "<h6>").replace(/<\/h5>/g, "</h6>")
    .replace(/<h4>/g, "<h5>").replace(/<\/h4>/g, "</h5>")
    .replace(/<h3>/g, "<h4>").replace(/<\/h3>/g, "</h4>")
    .replace(/<h2>/g, "<h3>").replace(/<\/h2>/g, "</h3>")
    .replace(/<h1>/g, "<h3>").replace(/<\/h1>/g, "</h3>");
  // Wide tables get a wrapper so they can shrink rather than overflow the page.
  html = html.replace(/<table>/g, '<div class="tw"><table>').replace(/<\/table>/g, "</table></div>");
  return html;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ── Document ──────────────────────────────────────────────────────────── */

const totalWords = kept.reduce((s, r) => s + r.words, 0);
const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

let toc = "";
let body = "";
let chNum = 0;

for (const ch of chapters) {
  chNum++;
  const chId = `ch-${slug(ch.name)}`;
  toc += `<div class="toc-ch"><a href="#${chId}"><span class="toc-n">${chNum}</span>${esc(ch.name)}<span class="toc-c">${ch.topics.length} topics</span></a></div>`;
  toc += '<ul class="toc-t">';
  for (const t of ch.topics) toc += `<li><a href="#t-${esc(t.id)}">${esc(t.title)}</a></li>`;
  toc += "</ul>";

  body += `<section class="chapter"><div class="ch-open"><div class="ch-num">Chapter ${chNum}</div><h1 id="${chId}">${esc(ch.name)}</h1><div class="ch-meta">${ch.topics.length} topics</div></div>`;
  for (const t of ch.topics) {
    body += `<article class="topic"><h2 id="t-${esc(t.id)}">${esc(t.title)}</h2>`;
    if (t.shortDesc) body += `<p class="lede">${esc(t.shortDesc)}</p>`;
    body += renderBody(t.content);
    body += "</article>";
  }
  body += "</section>";
}

let compareIndex = '<ul class="cmp">';
for (const t of compareTopics) compareIndex += `<li><a href="#t-${esc(t.id)}">${esc(t.title)}</a></li>`;
compareIndex += "</ul>";

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>AWS Cloud Engineer — Interview Study Guide</title>
<style>
  @page { size: A4; margin: 18mm 16mm 20mm; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 10.2pt; line-height: 1.52; color: #141414; margin: 0;
  }
  code, pre, .mono { font-family: "Consolas", "Courier New", monospace; }

  /* ── cover ── */
  .cover { height: 247mm; display: flex; flex-direction: column; justify-content: center;
           text-align: center; page-break-after: always; }
  .cover .rule { width: 56px; height: 3px; background: #0F766E; margin: 0 auto 26px; }
  .cover h1 { font-size: 34pt; line-height: 1.1; margin: 0 0 10px; letter-spacing: -0.5px; }
  .cover h2 { font-size: 15pt; font-weight: normal; color: #4A4A48; margin: 0 0 34px; font-style: italic; }
  .cover .stats { font-family: Consolas, monospace; font-size: 9.5pt; color: #4A4A48;
                  border-top: 1px solid #D8D4CC; border-bottom: 1px solid #D8D4CC;
                  padding: 12px 0; margin: 0 auto 26px; width: 74%; }
  .cover .by { font-size: 10pt; color: #6B6860; }

  /* ── front matter ── */
  .front { page-break-after: always; }
  .front h2 { font-size: 17pt; margin: 0 0 14px; color: #0F766E; }
  .front h3 { font-size: 11.5pt; margin: 18px 0 6px; }
  .front p, .front li { font-size: 10pt; }
  .howto li { margin-bottom: 7px; }
  .cmp { column-count: 2; column-gap: 20px; font-size: 8.7pt; padding-left: 16px; }
  .cmp li { break-inside: avoid; margin-bottom: 3.5px; }

  /* ── contents ── */
  .toc { page-break-after: always; }
  .toc h2 { font-size: 17pt; margin: 0 0 16px; color: #0F766E; }
  .toc-ch { margin: 13px 0 4px; break-inside: avoid; }
  .toc-ch a { font-weight: bold; font-size: 10.6pt; text-decoration: none; color: #141414;
              display: flex; align-items: baseline; gap: 8px; }
  .toc-n { font-family: Consolas, monospace; color: #0F766E; font-size: 9pt; min-width: 18px; }
  .toc-c { margin-left: auto; font-family: Consolas, monospace; font-size: 8pt; color: #8A877E; font-weight: normal; }
  .toc-t { column-count: 2; column-gap: 18px; list-style: none; padding: 0 0 0 26px; margin: 3px 0 0; }
  .toc-t li { font-size: 8.4pt; margin-bottom: 2.5px; break-inside: avoid; color: #4A4A48; }
  .toc-t a { color: #4A4A48; text-decoration: none; }

  /* ── chapters ── */
  .chapter { page-break-before: always; }
  .ch-open { page-break-after: always; padding-top: 68mm; text-align: center; }
  .ch-num { font-family: Consolas, monospace; font-size: 9.5pt; letter-spacing: 2px;
            text-transform: uppercase; color: #0F766E; margin-bottom: 12px; }
  .ch-open h1 { font-size: 27pt; margin: 0 0 12px; letter-spacing: -0.4px; }
  .ch-meta { font-family: Consolas, monospace; font-size: 9pt; color: #8A877E; }

  /* ── topics ── */
  .topic { page-break-inside: auto; margin-bottom: 17px; }
  .topic h2 { font-size: 13.4pt; margin: 20px 0 3px; padding-bottom: 5px;
              border-bottom: 1.6px solid #0F766E; page-break-after: avoid; }
  .lede { font-style: italic; color: #5A5750; font-size: 9.3pt; margin: 0 0 9px; page-break-after: avoid; }
  .topic h3 { font-size: 11.2pt; margin: 13px 0 5px; color: #11433F; page-break-after: avoid; }
  .topic h4 { font-size: 10.1pt; margin: 11px 0 4px; page-break-after: avoid; }
  .topic h5, .topic h6 { font-size: 9.6pt; margin: 9px 0 3px; page-break-after: avoid; }
  p { margin: 0 0 7px; orphans: 2; widows: 2; }
  ul, ol { margin: 0 0 8px; padding-left: 19px; }
  li { margin-bottom: 3px; }
  strong { font-weight: bold; }
  a { color: #11433F; }

  blockquote { margin: 9px 0; padding: 7px 12px; border-left: 3px solid #0F766E;
               background: #F2F6F5; page-break-inside: avoid; font-size: 9.6pt; }
  blockquote p:last-child { margin-bottom: 0; }

  code { background: #F0EDE6; padding: 0.5px 3px; border-radius: 2px; font-size: 8.7pt; }
  pre { background: #14211F; color: #E8EDEC; padding: 9px 11px; border-radius: 3px;
        overflow: hidden; white-space: pre-wrap; word-wrap: break-word;
        font-size: 8.1pt; line-height: 1.42; margin: 8px 0; page-break-inside: avoid; }
  pre code { background: none; color: inherit; padding: 0; font-size: inherit; }

  .tw { page-break-inside: avoid; margin: 9px 0; }
  table { border-collapse: collapse; width: 100%; font-size: 8.5pt; }
  th, td { border: 1px solid #D8D4CC; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #EDEAE3; font-weight: bold; }
  hr { border: none; border-top: 1px solid #E2DED6; margin: 12px 0; }
</style></head><body>

<div class="cover">
  <div class="rule"></div>
  <h1>AWS Cloud Engineer<br>Interview Study Guide</h1>
  <h2>Everything you need, nothing you don't</h2>
  <div class="stats">
    ${chapters.length} CHAPTERS &nbsp;·&nbsp; ${kept.length} TOPICS &nbsp;·&nbsp; ${compareTopics.length} COMPARISONS &nbsp;·&nbsp; ${(totalWords / 1000).toFixed(0)}K WORDS
  </div>
  <div class="by">Compiled from the AWS Learn study corpus &nbsp;·&nbsp; ${today}</div>
</div>

<div class="front">
  <h2>How to use this guide</h2>
  <p>This is a reference book, not a novel. It is built for two different moments, and it is worth knowing which one you are in.</p>
  <h3>When you are learning (weeks out)</h3>
  <p>Read a chapter end to end. Each topic explains the mechanism — <em>why</em> a thing behaves the way it does, not just what it is called. That understanding is what survives a follow-up question; memorised definitions do not.</p>
  <h3>When you are revising (days out)</h3>
  <p>Work the <strong>Comparisons and cheat sheets</strong> index on the next page. Interviewers rarely ask "what is DynamoDB?". They describe a situation and watch whether you pick the right service and can say why the other one is wrong. Every entry in that index is a question of exactly that shape.</p>
  <h3>What was deliberately left out</h3>
  <p>Console walkthroughs — "open this menu, click that button" — are not in here. They change with every AWS console redesign, and no interviewer asks you to recite them. What stays is the part that is still true next year: mechanisms, limits, trade-offs and the reasoning behind a design choice.</p>
  <h3>How to answer well</h3>
  <ul class="howto">
    <li><strong>Name the trade-off, not just the service.</strong> "I would use Fargate" is a weaker answer than "Fargate, because we do not want to patch hosts — and we accept paying more per vCPU for that."</li>
    <li><strong>Reach for the number.</strong> Limits and defaults are what separate someone who has read about a service from someone who has run one.</li>
    <li><strong>Say when you would choose differently.</strong> Every answer in this book has a boundary where the other option wins. Stating that boundary is the senior signal.</li>
    <li><strong>If you do not know, reason out loud.</strong> Interviewers score the method more than the recall.</li>
  </ul>
</div>

<div class="front">
  <h2>Comparisons and cheat sheets</h2>
  <p>The ${compareTopics.length} topics interviewers probe most often — each one a "which would you pick, and why not the other?" question.</p>
  ${compareIndex}
</div>

<div class="toc"><h2>Contents</h2>${toc}</div>

${body}
</body></html>`;

fs.writeFileSync(path.join(SP, "guide.html"), html);
console.log(`chapters          ${chapters.length}`);
console.log(`topics included   ${kept.length}  (dropped ${rows.length - kept.length} console walkthroughs)`);
console.log(`comparison topics ${compareTopics.length}`);
console.log(`words             ${(totalWords / 1000).toFixed(0)}K`);
console.log(`html              ${(html.length / 1024 / 1024).toFixed(2)} MB`);

// Chapter/topic list for the bookmark pass.
fs.writeFileSync(
  path.join(SP, "outline.json"),
  JSON.stringify({
    chapters: chapters.map((c, i) => ({ num: i + 1, name: c.name, topics: c.topics.map((t) => t.title) })),
  })
);
