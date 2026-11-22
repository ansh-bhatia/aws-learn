// Renders the revision notes. Sans-serif and tight on purpose: this is a
// document you scan for a fact, not one you read in a chair.
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const SP = process.argv[2];
const { chapters, keywordTables } = JSON.parse(fs.readFileSync(path.join(SP, "cram.json"), "utf8"));

marked.setOptions({ gfm: true, breaks: false });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const table = (md) =>
  `<div class="tw">${marked.parse(md).replace(/<p>|<\/p>/g, "")}</div>`;

// Inline markdown inside a mined line (bold, code) still needs rendering.
const inline = (s) =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

let kw = "";
for (const k of keywordTables) {
  kw += `<h3>${esc(k.title.replace(/\s*[–—-]\s*(Every Keyword.*|One Keyword.*|Scenario Keywords.*)$/i, ""))}</h3>`;
  for (const t of k.tables) kw += table(t);
}

let toc = "";
let body = "";
let n = 0;
for (const ch of chapters) {
  n++;
  toc += `<li><a href="#c-${slug(ch.name)}"><span class="n">${n}</span>${esc(ch.name)}<span class="ct">${ch.blocks.length}</span></a></li>`;
  body += `<section class="chap"><h2 id="c-${slug(ch.name)}">${esc(ch.name)}</h2>`;
  for (const b of ch.blocks) {
    body += `<div class="blk"><h4>${esc(b.title)}</h4>`;
    for (const c of b.callouts) body += `<p class="warn">${inline(c)}</p>`;
    if (b.facts.length) {
      body += "<ul>";
      for (const f of b.facts) body += `<li>${inline(f)}</li>`;
      body += "</ul>";
    }
    for (const t of b.tables) body += table(t);
    body += "</div>";
  }
  body += "</section>";
}

const nTables = chapters.reduce((s, c) => s + c.blocks.reduce((a, b) => a + b.tables.length, 0), 0);
const nBlocks = chapters.reduce((s, c) => s + c.blocks.length, 0);
const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>AWS Interview — Rapid Revision Notes</title>
<style>
  @page { size: A4; margin: 13mm 11mm 15mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
         font-size: 8.6pt; line-height: 1.38; color: #15181A; margin: 0; }
  code { font-family: Consolas, monospace; font-size: 7.8pt; background: #EFF2F1;
         padding: 0 2px; border-radius: 2px; }

  .cover { height: 258mm; display: flex; flex-direction: column; justify-content: center;
           text-align: center; page-break-after: always; }
  .cover .bar { width: 50px; height: 3px; background: #0F766E; margin: 0 auto 20px; }
  .cover h1 { font-size: 27pt; margin: 0 0 6px; letter-spacing: -0.6px; }
  .cover .sub { font-size: 12pt; color: #5A625F; margin-bottom: 26px; }
  .cover .st { font-family: Consolas, monospace; font-size: 8.5pt; color: #5A625F;
               border-top: 1px solid #D6DAD8; border-bottom: 1px solid #D6DAD8;
               padding: 9px 0; width: 70%; margin: 0 auto 20px; }
  .cover .note { font-size: 9pt; color: #5A625F; max-width: 86mm; margin: 0 auto; line-height: 1.5; }

  .intro { page-break-after: always; }
  .intro h2, .kw h2, .toc h2 { font-size: 14pt; color: #0F766E; margin: 0 0 9px; }
  .intro p { font-size: 9pt; margin: 0 0 7px; }
  .intro ul { font-size: 9pt; padding-left: 16px; margin: 0 0 9px; }
  .intro li { margin-bottom: 4px; }

  .toc { page-break-after: always; }
  .toc ol { list-style: none; padding: 0; margin: 0; column-count: 2; column-gap: 16px; }
  .toc li { margin-bottom: 4px; break-inside: avoid; }
  .toc a { text-decoration: none; color: #15181A; display: flex; gap: 7px;
           align-items: baseline; font-size: 9.2pt; }
  .toc .n { font-family: Consolas, monospace; color: #0F766E; min-width: 14px; font-size: 8pt; }
  .toc .ct { margin-left: auto; font-family: Consolas, monospace; font-size: 7.5pt; color: #8A918E; }

  .kw { page-break-after: always; }
  .kw h3 { font-size: 9.6pt; margin: 11px 0 4px; color: #11433F;
           border-bottom: 1px solid #CFE0DD; padding-bottom: 2px; page-break-after: avoid; }

  .chap { page-break-before: always; }
  .chap h2 { font-size: 15pt; color: #0F766E; margin: 0 0 3px;
             border-bottom: 2px solid #0F766E; padding-bottom: 4px; }
  .blk { break-inside: avoid; margin: 0 0 9px; padding-top: 6px; }
  .blk h4 { font-size: 9.1pt; margin: 0 0 3px; color: #11433F; }
  .blk ul { margin: 0 0 4px; padding-left: 15px; }
  .blk li { margin-bottom: 1.5px; }
  .warn { margin: 0 0 4px; padding: 3px 7px; background: #FFF6E8;
          border-left: 2.5px solid #C77700; font-size: 8.2pt; }

  .tw { break-inside: avoid; margin: 0 0 6px; }
  table { border-collapse: collapse; width: 100%; font-size: 7.6pt; }
  th, td { border: 1px solid #D6DAD8; padding: 2.5px 4px; text-align: left; vertical-align: top; }
  th { background: #E9EFEE; font-weight: 600; }
  tr:nth-child(even) td { background: #F7F9F9; }
  b, strong { font-weight: 600; }
</style></head><body>

<div class="cover">
  <div class="bar"></div>
  <h1>AWS Interview<br>Rapid Revision Notes</h1>
  <div class="sub">The parts you don't use every day</div>
  <div class="st">${nTables + keywordTables.reduce((s, k) => s + k.tables.length, 0)} TABLES &nbsp;·&nbsp; ${nBlocks} TOPICS &nbsp;·&nbsp; ${chapters.length} SECTIONS &nbsp;·&nbsp; ~3 HOURS</div>
  <div class="note">Built for one sitting before an interview. Everything you would
  already know from using AWS at work has been removed — what is left is limits,
  defaults, and the line between two services that look alike.</div>
</div>

<div class="intro">
  <h2>Read this first</h2>
  <p>These notes assume you already use AWS. There is no "what is EC2" here, because nobody forgets that. What people forget under pressure is the <b>exact number</b>, the <b>default</b>, and <b>which of two similar services wins in a given sentence</b> — so that is all this contains.</p>
  <h2 style="margin-top:14px">How to use the three hours</h2>
  <ul>
    <li><b>First 45 minutes — Keyword to Answer.</b> The next section is every "if the question says X, answer Y" mapping in one place. This is the highest-scoring page per minute in the document. Read it twice.</li>
    <li><b>Next 90 minutes — the comparison tables.</b> Work through the sections. Do not read them like prose: cover the right-hand column and see if you can produce it.</li>
    <li><b>Last 45 minutes — the amber boxes.</b> Those are the counterintuitive ones: things that are irreversible, things that cannot be changed after creation, things that are off by default.</li>
  </ul>
  <h2 style="margin-top:14px">What interviewers are testing</h2>
  <ul>
    <li><b>The boundary, not the definition.</b> "Why not the other one?" is the real question behind almost every service comparison.</li>
    <li><b>The number.</b> Knowing a limit exists is junior. Knowing it is 55,000 connections is the signal.</li>
    <li><b>What breaks.</b> Defaults that bite, settings that cannot be undone, quotas you hit in production.</li>
  </ul>
  <p style="margin-top:10px;color:#5A625F;font-size:8.4pt">Compiled from the AWS Learn corpus · ${today} · For depth on anything here, see the full 663-page study guide.</p>
</div>

<div class="kw">
  <h2>Keyword → Answer</h2>
  <p style="font-size:8.6pt;margin:0 0 6px">Interview and exam questions are written around trigger phrases. Match the phrase, pick the service.</p>
  ${kw}
</div>

<div class="toc"><h2>Sections</h2><ol>${toc}</ol></div>

${body}
</body></html>`;

fs.writeFileSync(path.join(SP, "cram.html"), html);
fs.writeFileSync(
  path.join(SP, "cram-outline.json"),
  JSON.stringify({ chapters: chapters.map((c, i) => ({ num: i + 1, name: c.name, topics: c.blocks.map((b) => b.title) })) })
);
console.log(`sections ${chapters.length}  blocks ${nBlocks}  tables ${nTables}+${keywordTables.reduce((s, k) => s + k.tables.length, 0)} keyword`);
console.log(`html ${(html.length / 1024).toFixed(0)} KB`);
