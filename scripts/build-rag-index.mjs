// Build-time RAG index. Emits static JSON the chat API retrieves from, so
// grounding needs no vector database, no embedding calls, and no background
// compute — just lexical scoring over files served off the CDN.
//
//   public/rag/index.json      compact per-topic entry + term frequencies
//   public/rag/topics/<id>.json  full topic content, fetched only when picked
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "rag");
const TOPICS_OUT = path.join(OUT, "topics");

// Very common words carry no signal for ranking AWS questions.
const STOP = new Set(
  `a an and are as at be by for from has have how i in is it its of on or that the
   to was what when where which who why will with you your can do does if not this
   these those there their them then than so such but into over under about above`
    .split(/\s+/)
    .filter(Boolean)
);

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    // Keep dotted/hyphenated identifiers intact: s3, gp3, t3.micro, multi-az
    .replace(/[^a-z0-9.\-\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((t) => t.length > 1 && t.length < 40 && !STOP.has(t));
}

// Markdown adds noise to term frequencies without adding meaning.
function stripMarkdown(md) {
  return String(md)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadCategories() {
  const dir = path.join(ROOT, "src", "data", "categories");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));
  const cats = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(path.join(dir, f)).href);
    if (mod.default?.topics) cats.push(mod.default);
  }
  return cats;
}

const categories = await loadCategories();

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(TOPICS_OUT, { recursive: true });

const docs = [];
let totalContentBytes = 0;

for (const cat of categories) {
  for (const topic of cat.topics || []) {
    if (!topic.id || !topic.content) continue;

    // The full content is what the model ultimately reads — write it out
    // verbatim so answers are never limited to a summary.
    const full = {
      id: topic.id,
      title: topic.title || topic.id,
      shortDesc: topic.shortDesc || "",
      category: cat.label || cat.id,
      categoryId: cat.id,
      content: topic.content,
    };
    fs.writeFileSync(path.join(TOPICS_OUT, `${topic.id}.json`), JSON.stringify(full));
    totalContentBytes += topic.content.length;

    // Index the whole body, not just the opening — a topic should be findable
    // by any term it actually covers.
    const searchText = [
      topic.title,
      topic.title, // titles weigh more
      topic.shortDesc,
      topic.shortDesc,
      cat.label,
      stripMarkdown(topic.content),
    ].join(" ");

    const tf = {};
    let len = 0;
    for (const term of tokenize(searchText)) {
      tf[term] = (tf[term] || 0) + 1;
      len++;
    }

    docs.push({
      id: topic.id,
      title: full.title,
      shortDesc: full.shortDesc,
      category: full.category,
      categoryId: full.categoryId,
      len,
      tf,
    });
  }
}

// Document frequency drives IDF at query time.
const df = {};
for (const d of docs) for (const term of Object.keys(d.tf)) df[term] = (df[term] || 0) + 1;

// Terms in almost every document can't discriminate; dropping them shrinks the
// index with no ranking loss.
const tooCommon = new Set(Object.keys(df).filter((t) => df[t] / docs.length > 0.5));
for (const t of tooCommon) delete df[t];

// Keep only each document's strongest terms. Ranking signal is dominated by
// the top of the tf distribution, while the long tail of once-mentioned words
// is most of the index size.
const MAX_TERMS_PER_DOC = 140;
for (const d of docs) {
  const kept = Object.entries(d.tf)
    .filter(([t]) => !tooCommon.has(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_TERMS_PER_DOC);
  d.tf = Object.fromEntries(kept);
}

// Recompute df against what actually survived, then drop orphaned terms.
for (const t of Object.keys(df)) df[t] = 0;
for (const d of docs) for (const t of Object.keys(d.tf)) df[t] = (df[t] || 0) + 1;
for (const t of Object.keys(df)) if (!df[t]) delete df[t];

// Store as an inverted index over an integer term dictionary. The per-document
// map repeated every term string 536 times; this writes each term once.
const terms = Object.keys(df);
const termId = new Map(terms.map((t, i) => [t, i]));
const postings = terms.map(() => []);
for (let di = 0; di < docs.length; di++) {
  for (const [t, freq] of Object.entries(docs[di].tf)) {
    const ti = termId.get(t);
    if (ti === undefined) continue;
    postings[ti].push(di, freq); // flat [docIdx, tf, ...] pairs
  }
}

const index = {
  builtAt: new Date().toISOString(),
  docCount: docs.length,
  avgLen: docs.reduce((s, d) => s + d.len, 0) / docs.length,
  terms,
  df: terms.map((t) => df[t]),
  postings,
  // Metadata only — content lives in the per-topic files.
  docs: docs.map((d) => ({
    id: d.id,
    title: d.title,
    shortDesc: d.shortDesc,
    category: d.category,
    categoryId: d.categoryId,
    len: d.len,
  })),
};

fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index));

const indexBytes = fs.statSync(path.join(OUT, "index.json")).size;
console.log(`topics indexed : ${docs.length}`);
console.log(`unique terms   : ${terms.length}`);
console.log(`dropped common : ${tooCommon.size}`);
console.log(`index.json     : ${(indexBytes / 1024).toFixed(0)} KB`);
console.log(`topic content  : ${(totalContentBytes / 1024 / 1024).toFixed(2)} MB across ${docs.length} files`);
