import { useState } from "react";
import "./AIVisuals.css";
import "./AIVisuals2.css";
import "./AIVisuals4.css";

/* ════════════════════════════════════════════════════════════
   1. API LAYER SELECTOR — API Gateway types
   ════════════════════════════════════════════════════════════ */
const APIS = {
  http: {
    t: "HTTP API", proto: "HTTP", feats: [false, false, false],
    d: "Low-latency, cost-effective. Limited features — built-in OIDC/OAuth2. Best for simple GenAI apps (summarization, content generation). Works with Lambda or any HTTP backend.",
  },
  rest: {
    t: "REST API", proto: "HTTPS", feats: [true, true, true],
    d: "Complete control over request/response + full API management. Best when you need tiered access (e.g. free vs premium) or stronger security. Works with Lambda, HTTP, AWS services.",
  },
  ws: {
    t: "WebSocket API", proto: "WS (persistent)", feats: [false, false, false],
    d: "Persistent connection for real-time use cases — chat apps, live dashboards, leaderboards. Server can push updates without the client refreshing. Works with Lambda, HTTP, AWS services.",
  },
  private: {
    t: "Private API", proto: "REST, VPC-only", feats: [true, true, true],
    d: "A REST API accessible ONLY from within a VPC — for internal-only GenAI services.",
  },
};
const FEATS = ["API keys & quotas", "Per-client throttling", "WAF integration"];
export function ApiLayerSelector() {
  const [k, setK] = useState("rest");
  const a = APIS[k];
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🚪 Decision #8 — API Gateway: 4 API Types</div>
      <p className="ai-intro">The secure entry point for prompts (and streaming responses). Pick a type:</p>
      <div className="ai-tabs">
        {Object.keys(APIS).map((x) => (
          <button key={x} className={`ai-tab ${k === x ? "active" : ""}`} onClick={() => setK(x)}>{APIS[x].t}</button>
        ))}
      </div>
      <div className="ai-detail">
        <b>{a.t} <span className="a4-proto">{a.proto}</span></b>
        <p>{a.d}</p>
      </div>
      <div className="a4-feat-grid">
        {FEATS.map((f, i) => (
          <div key={f} className={`a4-feat ${a.feats[i] ? "yes" : "no"}`}>
            <span>{a.feats[i] ? "✅" : "—"}</span> {f}
          </div>
        ))}
      </div>
      <p className="ai-note">Event-driven (one-shot prompt → response) → use <b>HTTP</b> or <b>REST</b>. Persistent / live-updating → use <b>WebSocket</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. APPSYNC vs REST + async subscription push
   ════════════════════════════════════════════════════════════ */
export function AppSyncVsRest() {
  const [graphql, setGraphql] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">📡 AWS AppSync — GraphQL for GenAI Chat/Dashboards</div>
      <p className="ai-intro">
        AppSync is a fully managed <b>GraphQL</b> service — like a WebSocket API, but AppSync manages the routes for you. GraphQL lets a client ask for <i>exactly</i> the data it needs from <i>multiple</i> sources in one call:
      </p>
      <div className="ai-toggle">
        <button className={!graphql ? "active" : ""} onClick={() => setGraphql(false)}>REST — 4 calls</button>
        <button className={graphql ? "active" : ""} onClick={() => setGraphql(true)}>GraphQL — 1 call ✅</button>
      </div>
      <div className="a4-sources">
        {!graphql
          ? ["Call 1 → Source A", "Call 2 → Source B", "Call 3 → Source C", "Call 4 → Source D"].map((s) => (
              <div key={s} className="a4-source-chip miss">{s}</div>
            ))
          : <div className="a4-source-chip hit">1 query → Sources A + B + C + D</div>}
      </div>
      <p className="ai-sub">How a chat / live-dashboard update flows (async — Lambda doesn't wait):</p>
      <div className="ai-flow">
        <div className="ai-flow-box">🙋 User asks <small>("mutation")</small></div>
        <div className="ai-flow-arrow">→</div>
        <div className="ai-flow-box hot">📡 AppSync</div>
        <div className="ai-flow-arrow">→</div>
        <div className="ai-flow-box">🪨 Lambda → Bedrock <small>streams chunks</small></div>
      </div>
      <div className="a4-clients">
        <span className="a4-clients-label">Pushed live to every subscriber:</span>
        <span className="a4-client">👤 Client A</span><span className="a4-client">👤 Client B</span><span className="a4-client">👤 Client C</span>
      </div>
      <p className="ai-note">Extra features: <b>real-time subscriptions</b> (auto push, no refresh) + <b>offline support</b> for mobile/web. Integrates with Lambda (orchestration) + Bedrock (inference).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. ALB ROUTING SCENARIOS
   ════════════════════════════════════════════════════════════ */
const ALB = {
  ha: { t: "Self-hosted model, HA", d: "Model self-hosted on EC2/ECS (e.g. an open-source LLM). ALB routes across MULTIPLE Availability Zones — if one AZ fails, the app stays up." },
  rag: { t: "High-throughput RAG", d: "Vector DB or chunking framework (e.g. LangChain) running on EC2/ECS — ALB load-balances requests across instances for throughput + availability." },
  routing: { t: "Multi-model routing", d: "A large model on one EC2 instance, a small model on another (same family) — ALB routes each request to the right one based on the request." },
};
export function ALBRoutingScenarios() {
  const [k, setK] = useState("ha");
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">⚖️ Application Load Balancer for GenAI</div>
      <p className="ai-intro">
        ALB = Layer 7 (HTTP/HTTPS/WebSocket), distributes traffic across EC2 / ECS / EKS / IP / Lambda targets.
      </p>
      <div className="ai-verdict ok">⏱️ No timeout limit — vs API Gateway's hard <b>29-second</b> cap on REST/HTTP sync calls. Ideal for <b>long-running inference</b> (e.g. GPU-backed EC2).</div>
      <p className="ai-sub">Pick a use case:</p>
      <div className="ai-tabs">
        {Object.keys(ALB).map((x) => (
          <button key={x} className={`ai-tab ${k === x ? "active" : ""}`} onClick={() => setK(x)}>{ALB[x].t}</button>
        ))}
      </div>
      <div className="ai-detail"><b>{ALB[k].t}</b><p>{ALB[k].d}</p></div>
      <p className="ai-note">ALB <i>can</i> front a Lambda function too, but that's rare — Lambda almost always pairs with <b>API Gateway</b> instead.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. OBSERVABILITY DASHBOARD
   ════════════════════════════════════════════════════════════ */
const OBS_WAYS = {
  metrics: {
    t: "Metrics", d: "Near real-time CloudWatch metrics — set alarms on thresholds (e.g. alert if latency > 2s).",
    items: ["Invocations (count)", "InvocationLatency (ms)", "InvocationClientErrors / ServerErrors", "InvocationThrottles", "InputTokenCount / OutputTokenCount", "OutputImageCount"],
  },
  logs: {
    t: "Logs", d: "Model-invocation logging captures the full prompt, response, and metadata for every call — sent to CloudWatch, S3, or both.",
    items: ["Timestamp, account ID, region", "Inference config (e.g. max tokens)", "Input prompt + input token count", "Generated response + output token count", "Latency (ms)"],
  },
  insights: {
    t: "Log Insights", d: "Query & analyze LOGS (not metrics) — build custom dashboards or ask for a natural-language summary of results.",
    items: ["Write a query to filter logs", "e.g. find requests over a latency threshold", "\"Summarize results\" → plain-English recap"],
  },
};
export function ObservabilityDashboard() {
  const [k, setK] = useState("metrics");
  const w = OBS_WAYS[k];
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">📊 Decision #9 — Bedrock Observability (CloudWatch)</div>
      <p className="ai-intro">3 ways to monitor a Bedrock-powered app, all through <b>CloudWatch</b>:</p>
      <div className="ai-tabs">
        {Object.keys(OBS_WAYS).map((x) => (
          <button key={x} className={`ai-tab ${k === x ? "active" : ""}`} onClick={() => setK(x)}>{OBS_WAYS[x].t}</button>
        ))}
      </div>
      <div className="ai-detail"><b>{w.t}</b><p>{w.d}</p></div>
      <div className="a4-metric-list">
        {w.items.map((it) => <div key={it} className="a4-metric-pill">{it}</div>)}
      </div>
      <p className="ai-note">Guardrails has its own CloudWatch metrics too (invocation count + latency) — useful to see how much latency guardrails add on top of the model.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. MODEL EVALUATION APPROACHES
   ════════════════════════════════════════════════════════════ */
const EVAL = {
  programmatic: { t: "Programmatic", d: "AWS's built-in automated evaluator. Pick a task type (text generation / summarization / Q&A / classification) and metrics: accuracy, toxicity, robustness. Use a built-in or your own dataset." },
  judge: { t: "LLM-as-judge", d: "A different foundation model (the \"judge\") scores your model's responses. You choose the evaluator model, the model being evaluated, and metrics across Quality (helpfulness, correctness, faithfulness, completeness, coherence, tone) + Responsible AI (harmfulness, refusal) — plus custom metrics." },
  human: { t: "Human", d: "Either an AWS-managed work team (you provide the dataset + metrics, AWS arranges reviewers) or your own team. Compare up to 2 models." },
};
export function ModelEvalApproaches() {
  const [k, setK] = useState("judge");
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🧪 Decision #10 — Model Evaluation</div>
      <p className="ai-intro">Evaluate, compare & select a foundation model for your use case. 3 approaches:</p>
      <div className="ai-tabs">
        {Object.keys(EVAL).map((x) => (
          <button key={x} className={`ai-tab ${k === x ? "active" : ""}`} onClick={() => setK(x)}>{EVAL[x].t}</button>
        ))}
      </div>
      <div className="ai-detail"><b>{EVAL[k].t}</b><p>{EVAL[k].d}</p></div>
      <div className="a4-jsonl">
        <span className="a4-jsonl-label">Prompt dataset (JSON-L), uploaded to S3:</span>
        <code>{`{ "prompt": "Summarize these turbine logs in one line.", "referenceResponse": "Bearing temp nominal; no action needed." }`}</code>
      </div>
      <p className="ai-note">Reports give each metric a score normalized <b>0–1</b>; drill into any prompt to compare the model's answer vs your reference response.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. CUSTOMIZATION METHOD COMPARE
   ════════════════════════════════════════════════════════════ */
const CUSTOM = {
  distillation: { t: "Distillation", data: "Prompts + teacher responses", flow: "Teacher (Nova Pro) → prompts/responses → trains Student (Nova Lite)", best: "Near-large-model accuracy at lower latency & cost." },
  finetune: { t: "Fine-tuning", data: "LABELED data (prompt + reference response)", flow: "Base model + your labeled pairs → SageMaker training job → fine-tuned model", best: "Structured tasks needing a specific style/format (e.g. clinical-tone summaries)." },
  pretrain: { t: "Continued pre-training", data: "UNLABELED raw text (e.g. a medical journal)", flow: "Base model + raw domain text → SageMaker training job → domain-savvy model", best: "Domain adaptation when labeled data is scarce." },
  lora: { t: "LoRA (the \"how\")", data: "Applies to fine-tuning", flow: "Freezes base weights → trains only a small set of ADDED parameters", best: "Lower training cost + preserves pre-trained knowledge, vs. full fine-tuning (updates ALL weights — expensive)." },
};
export function CustomizationMethodCompare() {
  const [k, setK] = useState("distillation");
  const c = CUSTOM[k];
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🛠️ Decision #11 — Model Customization Methods</div>
      <p className="ai-intro">All run as a SageMaker training job behind the scenes. Compare the 4 approaches:</p>
      <div className="ai-tabs">
        {Object.keys(CUSTOM).map((x) => (
          <button key={x} className={`ai-tab ${k === x ? "active" : ""}`} onClick={() => setK(x)}>{CUSTOM[x].t}</button>
        ))}
      </div>
      <div className="ai-detail">
        <b>{c.t}</b>
        <p><b>Data:</b> {c.data}</p>
        <p><b>Flow:</b> {c.flow}</p>
        <p><b>Best for:</b> {c.best}</p>
      </div>
      <p className="ai-note">Exam tell: <b>teacher → student</b> = distillation · <b>labeled pairs</b> = fine-tuning · <b>raw unlabeled text</b> = continued pre-training · <b>"freeze weights, train a few params"</b> = LoRA.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. ADAPTATION DECISION LADDER (mental model)
   ════════════════════════════════════════════════════════════ */
const LADDER = [
  { t: "Prompt Engineering", train: "No training", cost: 1, pro: "Fastest & lowest cost.", con: "Can't do deep customization.", ex: "\"Summarize in one page\" instead of \"summarize.\"" },
  { t: "RAG", train: "No training", cost: 2, pro: "Enterprise-contextual answers using the latest data.", con: "Retrieval quality risk; latency on large unstructured data.", ex: "HR chatbot answering from policy PDFs." },
  { t: "Model Distillation", train: "Trains a SMALL model", cost: 3, pro: "Low latency & cost, quality close to the large model.", con: "Some accuracy trade-off vs. the large model.", ex: "High-volume customer-support chatbot." },
  { t: "Fine-Tuning", train: "Trains on labeled data", cost: 4, pro: "Improves style, format & task accuracy.", con: "Needs lots of high-quality labeled data.", ex: "Physician-notes app with clinical tone." },
  { t: "Continued Pre-Training", train: "Trains on unlabeled data", cost: 5, pro: "Improves deep domain understanding.", con: "High cost & complexity.", ex: "Wind-turbine SME assistant learning niche jargon." },
];
export function AdaptationDecisionLadder() {
  const [open, setOpen] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🪜 Choosing an Adaptation Strategy</div>
      <p className="ai-intro">Climb only as far as you need — cost &amp; complexity rise with every rung. Tap one:</p>
      <div className="a4-ladder">
        {LADDER.map((r, i) => (
          <div key={r.t} className={`a4-rung ${open === i ? "open" : ""}`} onClick={() => setOpen(i)}>
            <div className="a4-rung-h">
              <span className="a4-rung-num">{i + 1}</span>
              <b>{r.t}</b>
              <span className="a4-rung-cost">{"●".repeat(r.cost)}{"○".repeat(5 - r.cost)}</span>
            </div>
            {open === i && (
              <div className="a4-rung-body">
                <p><b>Training:</b> {r.train}</p>
                <p><b>Pro:</b> {r.pro}</p>
                <p><b>Con:</b> {r.con}</p>
                <p><b>Example:</b> {r.ex}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="ai-note ok">🎯 Try the cheapest rung first; climb only if quality still isn't good enough.</p>
    </div>
  );
}
