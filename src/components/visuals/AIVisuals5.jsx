import { useState } from "react";
import "./AIVisuals.css";
import "./AIVisuals2.css";
import "./AIVisuals5.css";

/* ════════════════════════════════════════════════════════════
   1. RAG BEFORE / AFTER — eLearning Q&A use case
   ════════════════════════════════════════════════════════════ */
export function RAGBeforeAfter() {
  const [rag, setRag] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🎓 Why RAG? — eLearning Q&A App</div>
      <p className="ai-intro">
        An AWS engineer asks: <i>"Which Bedrock model offers the lowest latency AND is approved in my organization?"</i> Toggle to see the difference:
      </p>
      <div className="ai-toggle">
        <button className={!rag ? "active" : ""} onClick={() => setRag(false)}>🤖 Foundation model alone</button>
        <button className={rag ? "active" : ""} onClick={() => setRag(true)}>📚 + RAG ✅</button>
      </div>
      {!rag ? (
        <div className="ai-verdict">"I don't have enough contextual information to answer that." — the model only knows generic internet data; it has never seen your org's approved-model list.</div>
      ) : (
        <div className="a5-rag-docs">
          <div className="a5-doc">📄 Bedrock User Guide <small>— which models are low-latency</small></div>
          <div className="a5-doc">📄 Org Model Allow-List <small>— which models are approved</small></div>
          <div className="ai-verdict ok">✅ "Based on your approved-model list and the Bedrock user guide, <b>Claude 3.5 Haiku</b> is approved and latency-optimized." — grounded in YOUR documents.</div>
        </div>
      )}
      <p className="ai-note">RAG = <b>Retrieval-Augmented Generation</b> — supplementing the LLM's knowledge with your organization's own data sources at query time.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. WHY RAG — 2 limitations of pure LLMs
   ════════════════════════════════════════════════════════════ */
const LIMITS = {
  proprietary: { t: "No proprietary knowledge", d: "Foundation models train on generic internet data. Ask about YOUR org's architecture, policies, or internal docs and they simply don't know." },
  cutoff: { t: "Training cutoff date", d: "Every base model has a knowledge cutoff (e.g. Dec 2024). Anything that happened after that — new products, new docs, new policies — it has no idea about." },
};
export function LLMLimitations() {
  const [k, setK] = useState("proprietary");
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🚧 2 Limitations RAG Solves</div>
      <p className="ai-intro">Pure LLM-based architectures hit two walls. Tap each:</p>
      <div className="ai-toggle">
        {Object.keys(LIMITS).map((x) => (
          <button key={x} className={k === x ? "active" : ""} onClick={() => setK(x)}>{LIMITS[x].t}</button>
        ))}
      </div>
      <div className="ai-detail"><b>{LIMITS[k].t}</b><p>{LIMITS[k].d}</p></div>
      <p className="ai-note ok">RAG fixes both: it fetches live, proprietary data from YOUR sources (SharePoint, S3, Confluence…) at query time — so answers are current AND organization-specific.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. VECTOR EXPLAINER — word → numbers → 2D plot
   ════════════════════════════════════════════════════════════ */
const WORD_VECS = {
  apple: { isFruit: 1, cost: 4, emoji: "🍎" },
  banana: { isFruit: 1, cost: 2, emoji: "🍌" },
  watch: { isFruit: 0, cost: 9, emoji: "⌚" },
};
export function VectorExplainer() {
  const [w, setW] = useState("apple");
  const v = WORD_VECS[w];
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🔢 What Is a Vector?</div>
      <p className="ai-intro">
        A <b>vector</b> is just a list of numbers representing a word/sentence/document. Toy example with 2 attributes — pick a word:
      </p>
      <div className="ai-tabs">
        {Object.keys(WORD_VECS).map((x) => (
          <button key={x} className={`ai-tab ${w === x ? "active" : ""}`} onClick={() => setW(x)}>{WORD_VECS[x].emoji} {x}</button>
        ))}
      </div>
      <div className="a5-plot-wrap">
        <svg viewBox="0 0 220 160" className="a5-plot">
          <line x1="30" y1="10" x2="30" y2="140" stroke="#30363d" strokeWidth="1.5" />
          <line x1="30" y1="140" x2="210" y2="140" stroke="#30363d" strokeWidth="1.5" />
          <text x="4" y="30" className="a5-axis">fruit?</text>
          <text x="160" y="155" className="a5-axis">cost $</text>
          {Object.entries(WORD_VECS).map(([key, pt]) => {
            const x = 30 + pt.cost * 18;
            const y = 140 - pt.isFruit * 110 - 8;
            const active = key === w;
            return (
              <g key={key} opacity={active ? 1 : 0.35}>
                <circle cx={x} cy={y} r={active ? 7 : 5} fill={active ? "#FF9900" : "#8b949e"} />
                <text x={x} y={y - 12} className="a5-plot-label">{pt.emoji}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="ai-code">
        <code>{`"${w}"`} → <b>[{v.isFruit}, {v.cost}]</b> <small>(is-fruit, cost)</small></code>
      </div>
      <p className="ai-note">Real embeddings use <b>512–1024 dimensions</b>, not 2 — capturing far more meaning than just "fruit" and "cost." That's what makes <b>semantic search</b> possible: finding text with similar <i>meaning</i>, not matching keywords.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. CHUNKING → EMBEDDING FLOW
   ════════════════════════════════════════════════════════════ */
const CHUNK_STEPS = [
  { t: "📄 500-page document", d: "Too big to embed as one vector — split it first ('chunking'). Split by character, token, or code." },
  { t: "✂️ Split into chunks", d: "Page → paragraphs → ~120-character pieces (frameworks like LangChain help with this split)." },
  { t: "🧮 Embedding model", d: "Each chunk is passed through an embedding model — e.g. Amazon Titan, Cohere." },
  { t: "🔢 Vector embeddings", d: "Each chunk becomes a vector of 512–1024 numbers, capturing its meaning." },
];
export function ChunkingEmbeddingFlow() {
  const [i, setI] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">⚙️ From Document to Vectors</div>
      <p className="ai-intro">Tap each step of the ingestion flow:</p>
      <div className="a5-steps">
        {CHUNK_STEPS.map((s, idx) => (
          <button key={s.t} className={`a5-step ${i === idx ? "active" : ""}`} onClick={() => setI(idx)}>{s.t}</button>
        ))}
      </div>
      <div className="ai-detail"><b>{CHUNK_STEPS[i].t}</b><p>{CHUNK_STEPS[i].d}</p></div>
      <p className="ai-note">Chunking strategies you'll choose between: <b>none, fixed-size, semantic, hierarchical</b> — covered in detail later.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. SIMILARITY SEARCH DEMO
   ════════════════════════════════════════════════════════════ */
export function SimilaritySearchDemo() {
  const [algo, setAlgo] = useState("ann");
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🔍 How Retrieval Actually Works</div>
      <p className="ai-intro">A user asks: <i>"Which vector DB is most cost-effective in AWS?"</i> — here's what happens:</p>
      <div className="ai-flow">
        <div className="ai-flow-box">❓ Question</div>
        <div className="ai-flow-arrow">→</div>
        <div className="ai-flow-box">🧮 Embedding model</div>
        <div className="ai-flow-arrow">→</div>
        <div className="ai-flow-box hot">🔍 Similarity search</div>
        <div className="ai-flow-arrow">→</div>
        <div className="ai-flow-box">📦 5–20 chunks</div>
      </div>
      <p className="ai-sub">Similarity search runs one of two algorithms:</p>
      <div className="ai-toggle">
        <button className={algo === "knn" ? "active" : ""} onClick={() => setAlgo("knn")}>KNN — exact</button>
        <button className={algo === "ann" ? "active" : ""} onClick={() => setAlgo("ann")}>ANN — approximate</button>
      </div>
      <div className="ai-detail">
        {algo === "knn"
          ? <p><b>K-Nearest Neighbor</b> — a supervised ML algorithm (also used for classification/regression) that finds the exact closest vectors. Precise, but slower at scale.</p>
          : <p><b>Approximate Nearest Neighbor</b> — trades a little precision for much faster lookups across millions of vectors. Most production vector DBs default to this.</p>}
      </div>
      <p className="ai-note">Good news: AWS handles the KNN/ANN math behind the scenes — you just configure how many chunks to retrieve (typically <b>5–20</b>).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. THE 10 RAG ARCHITECTURE DECISIONS
   ════════════════════════════════════════════════════════════ */
const RAG_DECISIONS = [
  ["Data source & type", "Structured (DB/warehouse) or unstructured (PDF/image/video)? Where does it live — S3, SharePoint, Confluence?"],
  ["Chunking strategy", "None, fixed-size, semantic, or hierarchical — how you split documents before embedding."],
  ["Embedding model", "Multimodal or text-only? Vector size? Language support? (Amazon Titan, Cohere, Nova...)"],
  ["Vector database", "Where embeddings are stored — OpenSearch, S3 Vectors, Pinecone, Aurora PostgreSQL, Neptune Analytics..."],
  ["Retrieval", "Similarity search (KNN/ANN) returns the top 5–20 most relevant chunks."],
  ["Re-ranker model", "Optional: re-scores & re-ranks retrieved chunks by relevance before they reach the LLM."],
  ["Large language model", "The model that reads the retrieved chunks + question and generates the final answer."],
  ["RAG evaluation", "Bedrock's RAG evaluation capability — assess if retrieval + generation quality is good enough."],
  ["Monitoring & observability", "CloudWatch metrics/logs for your RAG pipeline, same idea as Decision #9 for Bedrock."],
  ["Security, guardrails & responsible AI", "Same protections as any GenAI app, applied to your RAG pipeline."],
];
export function RAGPipelineDecisions() {
  const [open, setOpen] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🧭 The 10 RAG Architecture Decisions</div>
      <p className="ai-intro">Same mental-model approach as the 15 GenAI decisions — tap to expand:</p>
      <div className="ai-decisions">
        {RAG_DECISIONS.map((d, i) => (
          <div key={d[0]} className={`ai-dec ${open === i ? "open" : ""}`} onClick={() => setOpen(i)}>
            <div className="ai-dec-h"><span className="ai-dec-num">{i + 1}</span> {d[0]}</div>
            {open === i && <p>{d[1]}</p>}
          </div>
        ))}
      </div>
      <p className="ai-note ok">Decisions 1–4 happen in the <b>ingestion pipeline</b> (before any user query); 5–7 happen at <b>query time</b>; 8–10 are ongoing production concerns.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. RETRIEVE vs RETRIEVE-AND-GENERATE API
   ════════════════════════════════════════════════════════════ */
export function RetrieveVsRetrieveGenerate() {
  const [full, setFull] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🔌 Bedrock Knowledge Bases — 2 APIs</div>
      <p className="ai-intro">Query: <i>"How many leaves in 2026?"</i> — what each API gives back:</p>
      <div className="ai-toggle">
        <button className={!full ? "active" : ""} onClick={() => setFull(false)}>Retrieve <small>(steps 1–4)</small></button>
        <button className={full ? "active" : ""} onClick={() => setFull(true)}>Retrieve & Generate <small>(steps 1–5)</small> ✅</button>
      </div>
      <div className="ai-flow">
        <div className="ai-flow-box">🧮 Embed query</div>
        <div className="ai-flow-arrow">→</div>
        <div className="ai-flow-box">🔍 Vector search</div>
        <div className="ai-flow-arrow">→</div>
        <div className="ai-flow-box">📦 Retrieved chunks</div>
        <div className="ai-flow-arrow">→</div>
        <div className={`ai-flow-box ${full ? "hot" : ""}`} style={!full ? { opacity: 0.35 } : {}}>🤖 LLM answer</div>
      </div>
      <div className={`ai-verdict ${full ? "ok" : ""}`}>
        {full
          ? "Full RAG — retrieves the chunks AND sends them + your question to the foundation model for a complete, generated answer."
          : "Retrieval only — returns the raw matching chunks. No LLM call, no generated answer. Useful when you just want search results."}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. KNOWLEDGE BASE CONSOLE TOUR (hands-on)
   ════════════════════════════════════════════════════════════ */
const KB_CONSOLE = {
  setup: { t: "1. IAM + S3 setup", d: "Knowledge Bases can't be created by the root user — create an IAM user with admin access first. Then create an S3 bucket and upload your source PDF(s)." },
  type: { t: "2. Knowledge base type", d: "Unstructured data → \"Knowledge base with vector store\" (or Kendra GenAI index). Structured data → \"Structured data store.\" Most document use cases pick vector store." },
  source: { t: "3. Data source", d: "Amazon S3, a web crawler, or connectors for Confluence/Salesforce/SharePoint. Pick S3 for our PDF use case." },
  parse: { t: "4. Parsing strategy", d: "Default parser (text/Word/Excel/HTML) · Bedrock Data Automation (images/audio/video) · Foundation model as parser (PDFs with tables, forms, visually rich docs)." },
  chunk: { t: "5. Chunking", d: "Pick a chunking strategy (default works for most cases) — breaks the doc into smaller pieces before embedding." },
  embed: { t: "6. Embedding model", d: "Choose a provider (Amazon, Cohere) and model — e.g. Titan Text Embeddings v2 (text-only) or Nova multimodal embeddings (text + images)." },
  vector: { t: "7. Vector store", d: "Quick-create: OpenSearch Serverless, Amazon S3 Vectors, Aurora PostgreSQL, Neptune Analytics. ⚠️ OpenSearch bills ~50¢/HOUR even idle — S3 Vectors is much cheaper. Delete the KB when done testing!" },
  sync: { t: "8. Sync & test", d: "After creating the KB, click the data source → Sync to generate embeddings. Then \"Test knowledge base\" → choose Retrieve-only or Retrieve-and-Generate (pick a model, e.g. Nova Pro) → ask a question → see the answer + citations + retrieved chunks." },
};
export function KnowledgeBaseConsoleTour() {
  const [k, setK] = useState("setup");
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🖥️ Building a Knowledge Base (Hands-On)</div>
      <p className="ai-intro">Console → Bedrock → Knowledge Bases → Create. Walk through each step:</p>
      <div className="ai-console">
        <div className="ai-console-nav">
          {Object.keys(KB_CONSOLE).map((x) => (
            <button key={x} className={k === x ? "active" : ""} onClick={() => setK(x)}>{KB_CONSOLE[x].t}</button>
          ))}
        </div>
        <div className="ai-console-body"><b>{KB_CONSOLE[k].t}</b><p>{KB_CONSOLE[k].d}</p></div>
      </div>
      <p className="ai-note">All 10 RAG decisions are baked into this one wizard — Bedrock Knowledge Bases handles steps 1–7 (data source → vector DB) fully managed.</p>
    </div>
  );
}
