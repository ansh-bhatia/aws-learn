import { useState } from "react";
import "./AIVisuals.css";
import "./AIVisuals2.css";
import "./AIVisuals3.css";

/* ════════════════════════════════════════════════════════════
   1. BEDROCK PRICING MODELS
   ════════════════════════════════════════════════════════════ */
const PRICING = {
  ondemand: {
    t: "On-demand", tag: "No commitment",
    d: "Pay only for what you use — no time commitment. Text: per input token + per output token (1k tokens ≈ 750 words). Images: per image. Embeddings: per input token. Best for variable, low-volume, or dev / POC workloads.",
  },
  provisioned: {
    t: "Provisioned throughput", tag: "1–6 month commit",
    d: "Buy model units for a base/custom model with a 1- or 6-month commitment → guaranteed, consistent throughput. Best for large, steady production workloads.",
  },
  batch: {
    t: "Batch", tag: "~50% cheaper",
    d: "Run many inferences asynchronously at once: upload to S3 → create a batch job → results land in S3 as JSON. Up to ~50% cheaper than on-demand. Best for non-urgent bulk jobs (e.g. overnight document summarization).",
  },
};
export function PricingModels() {
  const [k, setK] = useState("ondemand");
  const m = PRICING[k];
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">💲 Bedrock Pricing Models</div>
      <p className="ai-intro">Three ways Bedrock charges you. Tap each:</p>
      <div className="ai-tabs">
        {Object.keys(PRICING).map((x) => (
          <button key={x} className={`ai-tab ${k === x ? "active" : ""}`} onClick={() => setK(x)}>{PRICING[x].t}</button>
        ))}
      </div>
      <div className="ai-detail">
        <b>{m.t} <span className="a3-tag">{m.tag}</span></b>
        <p>{m.d}</p>
      </div>
      <p className="ai-note">No requests = no charge (on-demand). Make 10 requests over 3 months → pay for 10.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. TOKEN COST CALCULATOR
   ════════════════════════════════════════════════════════════ */
const COST_MODELS = [
  { id: "nova-lite", t: "Nova Lite", inP: 0.0006, outP: 0.0024 },
  { id: "nova-pro", t: "Nova Pro", inP: 0.0021, outP: 0.0084 },
  { id: "claude-haiku", t: "Claude Haiku", inP: 0.0008, outP: 0.004 },
  { id: "claude-sonnet", t: "Claude Sonnet", inP: 0.003, outP: 0.015 },
];
export function TokenCostCalculator() {
  const [mid, setMid] = useState("nova-pro");
  const [inTok, setInTok] = useState(11000);
  const [outTok, setOutTok] = useState(4000);
  const m = COST_MODELS.find((x) => x.id === mid);
  const onDemand = (inTok / 1000) * m.inP + (outTok / 1000) * m.outP;
  const batch = onDemand * 0.5;
  const fmt = (n) => "$" + n.toFixed(4);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🧮 Token Cost Calculator</div>
      <p className="ai-intro">Bedrock bills per <b>1,000 tokens</b>, separately for input &amp; output. Drag the sliders:</p>
      <div className="ai-tabs">
        {COST_MODELS.map((x) => (
          <button key={x.id} className={`ai-tab ${mid === x.id ? "active" : ""}`} onClick={() => setMid(x.id)}>{x.t}</button>
        ))}
      </div>
      <div className="ai-knobs">
        <label>Input tokens <b>{inTok.toLocaleString()}</b> <small>≈ {Math.round(inTok * 0.75).toLocaleString()} words</small>
          <input type="range" min="1000" max="50000" step="1000" value={inTok} onChange={(e) => setInTok(+e.target.value)} />
        </label>
        <label>Output tokens <b>{outTok.toLocaleString()}</b> <small>≈ {Math.round(outTok * 0.75).toLocaleString()} words</small>
          <input type="range" min="500" max="10000" step="500" value={outTok} onChange={(e) => setOutTok(+e.target.value)} />
        </label>
      </div>
      <div className="a3-cost">
        <div className="a3-cost-row"><span>On-demand</span><b>{fmt(onDemand)}</b></div>
        <div className="a3-cost-row ok"><span>Batch (~50% off)</span><b>{fmt(batch)}</b></div>
      </div>
      <p className="ai-note">Prices are approximate, per 1k tokens, and vary by model + region. Tiny in a POC — multiply by millions of requests and the model choice dominates your bill.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. PROMPT CACHING DEMO
   ════════════════════════════════════════════════════════════ */
export function PromptCachingDemo() {
  const [second, setSecond] = useState(false);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">⚡ Prompt Caching</div>
      <p className="ai-intro">
        Cache the <b>static</b> part of a prompt (the <b>cache prefix</b>) and reuse it — cutting input-token cost &amp; latency. Only the changing <b>suffix</b> is re-processed. Flip between two requests:
      </p>
      <div className="ai-toggle">
        <button className={!second ? "active" : ""} onClick={() => setSecond(false)}>1st request</button>
        <button className={second ? "active" : ""} onClick={() => setSecond(true)}>2nd request</button>
      </div>
      <div className="a3-prompt">
        <div className={`a3-prompt-part prefix ${second ? "cached" : "miss"}`}>
          <span className="a3-pp-tag">📄 Document + ⚙️ system prompt <i>(cache prefix — static)</i></span>
          <span className="a3-pp-state">{second ? "✅ served from cache" : "✍️ written to cache"}</span>
        </div>
        <div className="a3-prompt-part suffix">
          <span className="a3-pp-tag">❓ Question <i>(suffix — changes)</i></span>
          <span className="a3-pp-state">“summarize for machine {second ? "99" : "4522"}”</span>
        </div>
      </div>
      <div className="a3-bars">
        <div className="a3-bar"><span className="a3-bar-label">Input tokens</span><span className="a3-bar-track"><span className="a3-bar-fill" style={{ width: second ? "38%" : "100%" }} /></span><span className="a3-bar-val">{second ? "low" : "high"}</span></div>
        <div className="a3-bar"><span className="a3-bar-label">Latency</span><span className="a3-bar-track"><span className="a3-bar-fill" style={{ width: second ? "72%" : "100%" }} /></span><span className="a3-bar-val">{second ? "1074 ms" : "1345 ms"}</span></div>
      </div>
      <p className="ai-note">Cached ~<b>5 minutes</b>, and each model has a <b>minimum</b> (e.g. Claude 3.7 Sonnet = <b>1,024 tokens</b>/checkpoint). Best for <b>long, repeated contexts</b>. The response exposes <code>cacheReadInputTokens</code> when a hit occurs.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. INTELLIGENT PROMPT ROUTING SIMULATOR
   ════════════════════════════════════════════════════════════ */
const ROUTE_QUERIES = {
  simple: { t: "“Summarize this in one sentence.”", diff: 4, label: "simple task" },
  complex: { t: "“Analyze these logs & find the root cause of cascading failures.”", diff: 32, label: "complex task" },
};
export function PromptRoutingSim() {
  const [q, setQ] = useState("simple");
  const [threshold, setThreshold] = useState(5);
  const item = ROUTE_QUERIES[q];
  const toLite = item.diff < threshold;
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🔀 Intelligent Prompt Routing</div>
      <p className="ai-intro">
        The router sends each prompt to the cheap model (<b>Nova Lite</b>) or the strong one (<b>Nova Pro</b>, ~4× the price) based on the predicted <b>quality difference</b>. Pick a query &amp; set your threshold:
      </p>
      <div className="ai-toggle">
        {Object.keys(ROUTE_QUERIES).map((x) => (
          <button key={x} className={q === x ? "active" : ""} onClick={() => setQ(x)}>{ROUTE_QUERIES[x].label}</button>
        ))}
      </div>
      <div className="a3-route-q">{item.t}</div>
      <div className="ai-knobs">
        <label>Quality-difference threshold <b>{threshold}%</b>
          <input type="range" min="1" max="40" value={threshold} onChange={(e) => setThreshold(+e.target.value)} />
          <small>predicted difference for this prompt: <b>{item.diff}%</b></small>
        </label>
      </div>
      <div className={`ai-verdict ${toLite ? "ok" : ""}`}>
        Predicted diff {item.diff}% {item.diff < threshold ? "<" : "≥"} {threshold}% → route to{" "}
        <b>{toLite ? "Nova Lite (cheaper, faster)" : "Nova Pro (fallback, higher quality)"}</b>
      </div>
      <p className="ai-note">Configure it under <b>Bedrock → Tune → Prompt router models</b>: pick 2 models from one family + a fallback, set the threshold, then call the router <b>ARN</b> as your <code>modelId</code>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. COMPUTE LAYER SELECTOR (Lambda / EC2 / ECS)
   ════════════════════════════════════════════════════════════ */
const COMPUTE = {
  lambda: {
    t: "AWS Lambda", tag: "serverless · exam focus",
    d: "Fully managed, event-driven (no event = no run = no cost). Bring only code. Pay per invocation + memory + time. Auto-scales. Max 15-min run. ✅ Orchestration (API Gateway → Lambda → Bedrock), RAG via Knowledge Bases, Bedrock Agent tool. ❌ Can't host FMs or run >15 min.",
  },
  ec2: {
    t: "Amazon EC2", tag: "virtual machine",
    d: "You manage the guest OS, patching, security & scaling (ASG + load balancer). Billed per hour/second; long-running. ✅ Train/host your own FM (Trainium for training, Inferentia for inference), fine-tuning, self-hosted vector DBs / frameworks.",
  },
  ecs: {
    t: "Amazon ECS", tag: "containers",
    d: "AWS-native container orchestration. Fargate = serverless; ECS-on-EC2 = you provision. No hard time limit; scales faster than EC2. ✅ Orchestration, RAG pipelines, microservices, model hosting (GPU via ECS-on-EC2: g5 / p4d).",
  },
};
export function ComputeSelector() {
  const [k, setK] = useState("lambda");
  const [minutes, setMinutes] = useState(8);
  const c = COMPUTE[k];
  const lambdaOk = minutes <= 15;
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🖥️ Compute Layer — Lambda vs EC2 vs ECS</div>
      <p className="ai-intro">Where your orchestration runs. Tap each option:</p>
      <div className="ai-tabs">
        {Object.keys(COMPUTE).map((x) => (
          <button key={x} className={`ai-tab ${k === x ? "active" : ""}`} onClick={() => setK(x)}>{COMPUTE[x].t}</button>
        ))}
      </div>
      <div className="ai-detail">
        <b>{c.t} <span className="a3-tag">{c.tag}</span></b>
        <p>{c.d}</p>
      </div>
      <p className="ai-sub">⏱️ The rule that decides most cases — how long does one run take?</p>
      <div className="ai-knobs">
        <label>Run time <b>{minutes} min</b>
          <input type="range" min="1" max="60" value={minutes} onChange={(e) => setMinutes(+e.target.value)} />
        </label>
      </div>
      <div className={`ai-verdict ${lambdaOk ? "ok" : ""}`}>
        {lambdaOk
          ? "≤ 15 min → AWS Lambda works (simplest, serverless, pay-per-use)."
          : "> 15 min → exceeds Lambda's limit → use ECS or EC2."}
      </div>
    </div>
  );
}
