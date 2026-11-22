// Renders the lab manual. Content is kept verbatim: in the other two documents
// the steps were the thing being removed, here they are the thing being kept.
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const SP = process.argv[2];
const areas = JSON.parse(fs.readFileSync(path.join(SP, "labs.json"), "utf8"));

marked.setOptions({ gfm: true, breaks: false });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function renderBody(md) {
  let h = marked.parse(md.trim());
  h = h
    .replace(/<h5>/g, "<h6>").replace(/<\/h5>/g, "</h6>")
    .replace(/<h4>/g, "<h5>").replace(/<\/h4>/g, "</h5>")
    .replace(/<h3>/g, "<h4>").replace(/<\/h3>/g, "</h4>")
    .replace(/<h2>/g, "<h4>").replace(/<\/h2>/g, "</h4>")
    .replace(/<h1>/g, "<h4>").replace(/<\/h1>/g, "</h4>");
  return h.replace(/<table>/g, '<div class="tw"><table>').replace(/<\/table>/g, "</table></div>");
}

let labNo = 0;
let toc = "";
let body = "";

for (const a of areas) {
  const count = a.items.reduce((s, i) => s + (i.kind === "series" ? i.parts.length : 1), 0);
  toc += `<div class="toc-a"><a href="#a-${slug(a.area)}">${esc(a.area)}<span class="c">${count}</span></a></div><ul class="toc-l">`;

  body += `<section class="area"><h2 id="a-${slug(a.area)}">${esc(a.area)}</h2>`;

  for (const item of a.items) {
    if (item.kind === "series") {
      body += `<div class="build"><h3>Build: ${esc(item.name)}</h3><p class="bn">${item.parts.length} parts — work them in order; each one depends on the last.</p></div>`;
      toc += `<li class="b">Build: ${esc(item.name)} (${item.parts.length} parts)</li>`;
      for (const p of item.parts) {
        labNo++;
        toc += `<li><a href="#l-${esc(p.id)}"><span class="n">${labNo}</span>${esc(p.title)}</a></li>`;
        body += `<article class="lab part"><h3 id="l-${esc(p.id)}"><span class="num">${labNo}</span>${esc(p.title)}</h3>`;
        if (p.shortDesc) body += `<p class="obj">${esc(p.shortDesc)}</p>`;
        body += renderBody(p.content) + "</article>";
      }
    } else {
      labNo++;
      toc += `<li><a href="#l-${esc(item.id)}"><span class="n">${labNo}</span>${esc(item.title)}</a></li>`;
      body += `<article class="lab"><h3 id="l-${esc(item.id)}"><span class="num">${labNo}</span>${esc(item.title)}</h3>`;
      if (item.shortDesc) body += `<p class="obj">${esc(item.shortDesc)}</p>`;
      body += renderBody(item.content) + "</article>";
    }
  }
  body += "</section>";
  toc += "</ul>";
}

const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>AWS Hands-On Lab Manual</title>
<style>
  @page { size: A4; margin: 16mm 14mm 18mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
         font-size: 9.4pt; line-height: 1.5; color: #15181A; margin: 0; }
  code { font-family: Consolas, monospace; font-size: 8.6pt; background: #EEF2F1;
         padding: 0.5px 3px; border-radius: 2px; }

  .cover { height: 252mm; display: flex; flex-direction: column; justify-content: center;
           text-align: center; page-break-after: always; }
  .cover .bar { width: 52px; height: 3px; background: #0F766E; margin: 0 auto 22px; }
  .cover h1 { font-size: 30pt; margin: 0 0 8px; letter-spacing: -0.6px; }
  .cover .sub { font-size: 13pt; color: #5A625F; margin-bottom: 28px; }
  .cover .st { font-family: Consolas, monospace; font-size: 8.8pt; color: #5A625F;
               border-top: 1px solid #D6DAD8; border-bottom: 1px solid #D6DAD8;
               padding: 10px 0; width: 72%; margin: 0 auto 22px; }
  .cover .note { font-size: 9.2pt; color: #5A625F; max-width: 96mm; margin: 0 auto; line-height: 1.55; }

  .intro { page-break-after: always; }
  .intro h2 { font-size: 15pt; color: #0F766E; margin: 0 0 10px; }
  .intro h3 { font-size: 10.4pt; margin: 14px 0 5px; }
  .intro p, .intro li { font-size: 9.4pt; }
  .intro ul { padding-left: 17px; }
  .intro li { margin-bottom: 5px; }
  .flag { border-left: 3px solid #C77700; background: #FFF6E8; padding: 8px 11px; margin: 12px 0; }

  .toc { page-break-after: always; }
  .toc h2 { font-size: 15pt; color: #0F766E; margin: 0 0 12px; }
  .toc-a { margin: 11px 0 3px; break-inside: avoid; }
  .toc-a a { font-weight: 600; font-size: 10.2pt; text-decoration: none; color: #15181A;
             display: flex; gap: 8px; align-items: baseline; }
  .toc-a .c { margin-left: auto; font-family: Consolas, monospace; font-size: 7.8pt; color: #8A918E; font-weight: normal; }
  .toc-l { list-style: none; padding: 0 0 0 4px; margin: 0; column-count: 2; column-gap: 16px; }
  .toc-l li { font-size: 8.3pt; margin-bottom: 2.5px; break-inside: avoid; color: #4A514E; }
  .toc-l li.b { font-weight: 600; color: #11433F; margin-top: 4px; }
  .toc-l a { color: #4A514E; text-decoration: none; display: flex; gap: 6px; }
  .toc-l .n { font-family: Consolas, monospace; color: #0F766E; min-width: 16px; }

  .area { page-break-before: always; }
  .area h2 { font-size: 16pt; color: #0F766E; margin: 0 0 4px;
             border-bottom: 2px solid #0F766E; padding-bottom: 5px; }

  .build { margin: 16px 0 6px; padding: 9px 12px; background: #EEF5F4;
           border-left: 3px solid #0F766E; break-inside: avoid; }
  .build h3 { font-size: 11pt; margin: 0 0 2px; color: #11433F; }
  .bn { font-size: 8.6pt; color: #4A514E; margin: 0; }

  .lab { margin: 0 0 14px; }
  .lab h3 { font-size: 11pt; margin: 16px 0 3px; padding-bottom: 4px;
            border-bottom: 1.4px solid #CFE0DD; page-break-after: avoid;
            display: flex; gap: 9px; align-items: baseline; }
  .lab.part h3 { border-bottom-style: dashed; }
  .lab h3 .num { font-family: Consolas, monospace; font-size: 8.6pt; color: #fff;
                 background: #0F766E; border-radius: 3px; padding: 1px 5px; flex: none; }
  .obj { font-style: italic; color: #5A625F; font-size: 8.8pt; margin: 0 0 7px; page-break-after: avoid; }
  .lab h4 { font-size: 9.8pt; margin: 11px 0 4px; color: #11433F; page-break-after: avoid; }
  .lab h5, .lab h6 { font-size: 9.2pt; margin: 9px 0 3px; page-break-after: avoid; }
  p { margin: 0 0 6px; orphans: 2; widows: 2; }
  ul, ol { margin: 0 0 7px; padding-left: 18px; }
  li { margin-bottom: 3px; }
  ol { counter-reset: none; }

  blockquote { margin: 8px 0; padding: 6px 11px; border-left: 3px solid #C77700;
               background: #FFF6E8; font-size: 8.9pt; break-inside: avoid; }
  blockquote p:last-child { margin-bottom: 0; }
  pre { background: #14211F; color: #E8EDEC; padding: 9px 11px; border-radius: 3px;
        white-space: pre-wrap; word-wrap: break-word; font-size: 8.2pt;
        line-height: 1.45; margin: 8px 0; break-inside: avoid; }
  pre code { background: none; color: inherit; padding: 0; }

  .tw { break-inside: avoid; margin: 8px 0; }
  table { border-collapse: collapse; width: 100%; font-size: 8.3pt; }
  th, td { border: 1px solid #D6DAD8; padding: 3px 5px; text-align: left; vertical-align: top; }
  th { background: #E9EFEE; font-weight: 600; }
  hr { border: none; border-top: 1px solid #E3E7E6; margin: 11px 0; }
</style></head><body>

<div class="cover">
  <div class="bar"></div>
  <h1>AWS Hands-On<br>Lab Manual</h1>
  <div class="sub">Every build, start to finish</div>
  <div class="st">${labNo} LABS &nbsp;·&nbsp; ${areas.length} AREAS &nbsp;·&nbsp; 1 MULTI-PART BUILD</div>
  <div class="note">The practical companion to the study guide. Where those
  documents strip the click-paths out, this one keeps them — every lab,
  walkthrough and project from the course, in the order you should do them.</div>
</div>

<div class="intro">
  <h2>Before you start</h2>
  <p>This manual is for doing, not reading. Each lab is self-contained unless it is marked as part of a build, and builds must be worked in order because each part depends on what the previous one created.</p>

  <div class="flag">
    <strong>The console will not match exactly.</strong> AWS redesigns its console
    constantly, so a button may have moved or been renamed since these labs were
    written. Treat the step as the <em>intent</em> — "attach an internet gateway" —
    and find the current control. If a step cannot be found at all, the feature was
    likely renamed; search the service's documentation for the setting name rather
    than the button.
  </div>

  <h3>Work safely</h3>
  <ul>
    <li><strong>Use a sandbox account</strong>, never a production one. Several labs create resources that cost money while they exist.</li>
    <li><strong>Delete what you create.</strong> NAT gateways, Elastic IPs, running instances and load balancers bill by the hour whether you use them or not. Tear down at the end of each session.</li>
    <li><strong>Set a budget alert first.</strong> A zero-spend budget takes two minutes and prevents the surprise that puts people off practising.</li>
    <li><strong>Stay in one region</strong> for the duration of a build. Resources in different regions cannot see each other, and this is the single most common reason a lab "does not work".</li>
  </ul>

  <h3>If a lab fails</h3>
  <ul>
    <li><strong>Check the region first</strong>, then the availability zone. Most failures are one of these two.</li>
    <li><strong>Security groups are stateful; NACLs are not.</strong> If traffic goes out but nothing comes back, suspect the NACL.</li>
    <li><strong>Give it a minute.</strong> Several resources report "available" before they are actually reachable.</li>
  </ul>

  <p style="margin-top:12px;color:#5A625F;font-size:8.8pt">Compiled from the AWS Learn corpus · ${today} · Concepts behind these labs are in the 663-page study guide; the facts to memorise are in the 48-page revision notes.</p>
</div>

<div class="toc"><h2>Labs by area</h2>${toc}</div>

${body}
</body></html>`;

fs.writeFileSync(path.join(SP, "labs.html"), html);
fs.writeFileSync(
  path.join(SP, "labs-outline.json"),
  JSON.stringify({
    chapters: areas.map((a, i) => ({
      num: i + 1,
      name: a.area,
      topics: a.items.flatMap((it) => (it.kind === "series" ? it.parts : [it])).map((t) => t.title),
    })),
  })
);
console.log(`areas ${areas.length}  labs ${labNo}  html ${(html.length / 1024).toFixed(0)} KB`);
