import React, { useState } from "react";
import "./AIVisuals.css";

/* ════════════════════════════════════════════════════════════
   0. WIND-TURBINE SME ASSISTANT — before vs after
   ════════════════════════════════════════════════════════════ */
const SME_STEPS = {
  before: [
    { i: "🔧", t: "Field technician", d: "Turbine breaks in a remote area. Tech snaps photos + writes a long incident log." },
    { i: "📤", t: "Custom app", d: "Stores the images and the raw log report." },
    { i: "🧑‍🔬", t: "Equipment expert (SME)", d: "Sits at a global office, reads every photo + log by hand, then replies with guidance." },
    { i: "🐢", t: "Result", d: "Slow. The expert wades through huge logs → long turbine downtime." },
  ],
  after: [
    { i: "🔧", t: "Field technician", d: "Same photos + incident log — but sends them to a GenAI app." },
    { i: "🪨", t: "GenAI app on Bedrock", d: "A foundation model reads the images + log and writes a tidy summary." },
    { i: "⚡", t: "Instant summary", d: "Technician gets a clear summary back in seconds — often without waiting on the human expert." },
    { i: "📈", t: "Result", d: "Less turbine downtime + the expert's time is freed for the hard cases." },
  ],
};
export function SMEAssistantScenario() {
  const [mode, setMode] = useState("after");
  const steps = SME_STEPS[mode];
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🌬️ Business Scenario — Equipment SME Assistant</div>
      <p className="ai-intro">
        A wind-turbine maker wants to <b>cut downtime</b>. See how a GenAI assistant changes the workflow — flip between the two:
      </p>
      <div className="ai-toggle">
        <button className={mode === "before" ? "active" : ""} onClick={() => setMode("before")}>👎 Before (all manual)</button>
        <button className={mode === "after" ? "active" : ""} onClick={() => setMode("after")}>🚀 After (GenAI)</button>
      </div>
      <div className="ai-sme">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`ai-sme-step ${s.t === "Result" ? (mode === "after" ? "good" : "bad") : ""}`}>
              <span className="ai-sme-ico">{s.i}</span>
              <div><b>{s.t}</b><p>{s.d}</p></div>
            </div>
            {i < steps.length - 1 && <div className="ai-sme-arrow">↓</div>}
          </React.Fragment>
        ))}
      </div>
      <p className="ai-note ok">💡 Business drivers: <b>reduce turbine downtime</b> and <b>boost the expert's productivity</b> — the goals that justify the whole build.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   1. GEN-AI TRILEMMA
   ════════════════════════════════════════════════════════════ */
const TRI = {
  quality: { t: "Quality", d: "Best, most accurate responses. Push it up with bigger models, better prompts, RAG, fine-tuning — but that usually costs more or adds latency." },
  latency: { t: "Latency", d: "Fast responses (good UX). Smaller/latency-optimized models are faster but may trade some quality; caching helps." },
  cost: { t: "Cost", d: "Pay per token. Cheaper models or prompt caching cut cost — but may reduce quality. Tiny at POC scale, huge at production scale." },
};
export function GenAITrilemma() {
  const [k, setK] = useState("quality");
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">⚖️ The Gen-AI Trilemma</div>
      <p className="ai-intro">Every production GenAI app balances three things. Improving one usually pressures the others — tap each corner:</p>
      <div className="ai-tri">
        {Object.keys(TRI).map(x => (
          <button key={x} className={`ai-tri-node ${k === x ? "active" : ""}`} onClick={() => setK(x)}>{TRI[x].t}</button>
        ))}
      </div>
      <div className="ai-detail"><b>{TRI[k].t}</b><p>{TRI[k].d}</p></div>
      <p className="ai-note">🎯 Goal: the <b>best quality</b> at the <b>lowest cost</b> and <b>low latency</b>. The 15 architecture decisions all serve this balance.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. 15 ARCHITECTURE DECISIONS
   ════════════════════════════════════════════════════════════ */
const DECISIONS = [
  ["GenAI platform", "Bedrock (serverless, managed) vs SageMaker JumpStart (your VPC, you size it)."],
  ["Foundation model", "Pick the right FM from 100+ (modality, cost, context, latency…)."],
  ["Guardrails & responsible AI", "Filter toxic/unsafe input AND output. Bedrock Guardrails."],
  ["Prompt engineering", "Reusable system prompts to lift quality without much extra cost."],
  ["Inference optimization", "Service tiers, cross-region inference for resilience."],
  ["Cost optimization", "Prompt caching, batch inference, right-sizing."],
  ["Orchestration layer", "Lambda (simple) / Step Functions (complex) / ECS / EC2."],
  ["API layer", "Expose securely: API Gateway (auth, quotas, throttling), ELB, AppSync."],
  ["Observability", "CloudWatch logs/metrics/alarms; optionally to S3."],
  ["Model evaluation", "Human or automated eval before going big (Bedrock / SageMaker)."],
  ["Model fine-tuning", "Customize on your domain/task (Bedrock / SageMaker AI)."],
  ["Security & data protection", "Cognito auth, VPC endpoints, KMS, PII redaction (Macie/Comprehend)."],
  ["Enterprise data management", "Where data lives: S3, FSx, SQL/NoSQL DBs."],
  ["GenAI Ops & governance", "CloudFormation/CDK, pipelines, model registry."],
  ["Orchestration (advanced)", "LangChain/LangGraph, Bedrock Agents for RAG & agents."],
];
export function ArchDecisions15() {
  const [open, setOpen] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🧭 15 Production Architecture Decisions</div>
      <p className="ai-intro">The mental model for building any production GenAI app on AWS. Tap to expand:</p>
      <div className="ai-decisions">
        {DECISIONS.map((d, i) => (
          <div key={i} className={`ai-dec ${open === i ? "open" : ""}`} onClick={() => setOpen(i)}>
            <div className="ai-dec-h"><span className="ai-dec-num">{i + 1}</span> {d[0]}</div>
            {open === i && <p>{d[1]}</p>}
          </div>
        ))}
      </div>
      <p className="ai-note">📌 Example use case: a wind-turbine "equipment expert" assistant that summarizes field logs + images → cuts downtime, boosts the human expert's productivity.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. HOW BEDROCK WORKS (model-ID routing)
   ════════════════════════════════════════════════════════════ */
const PROVIDERS = {
  anthropic: { t: "Anthropic", id: "anthropic.claude-3-haiku", note: "Extended thinking, coding, computer use." },
  amazon: { t: "Amazon Nova", id: "amazon.nova-pro-v1", note: "Frontier intelligence, best price/performance, image & video." },
  meta: { t: "Meta Llama", id: "meta.llama4-maverick", note: "Open-weight models." },
  ai21: { t: "AI21 Labs", id: "ai21.jamba", note: "Long-context reasoning." },
  cohere: { t: "Cohere", id: "cohere.command", note: "Search & enterprise text." },
};
export function BedrockHowItWorks() {
  const [p, setP] = useState("anthropic");
  const pr = PROVIDERS[p];
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🔌 How Amazon Bedrock Works</div>
      <p className="ai-intro">
        One API, 100+ models. You send a request with a <b>model ID</b>; Bedrock routes it to that provider and returns the response. Pick a provider:
      </p>
      <div className="ai-tabs">
        {Object.keys(PROVIDERS).map(x => (
          <button key={x} className={`ai-tab ${p === x ? "active" : ""}`} onClick={() => setP(x)}>{PROVIDERS[x].t}</button>
        ))}
      </div>
      <div className="ai-code">
        <code>{`bedrock.invoke({`}</code>
        <code>{`  modelId: "`}<b>{pr.id}</b>{`",`}</code>
        <code>{`  prompt:  "Who is the best tennis player?",`}</code>
        <code>{`  maxTokens: 512, temperature: 0.5`}</code>
        <code>{`})`}</code>
      </div>
      <div className="ai-flow">
        <div className="ai-flow-box">📞 Your call<small>SDK / CLI / Console</small></div>
        <div className="ai-flow-arrow">→</div>
        <div className="ai-flow-box hot">🪨 Bedrock<small>routes by model ID</small></div>
        <div className="ai-flow-arrow">→</div>
        <div className="ai-flow-box">🤖 {pr.t}<small>{pr.note}</small></div>
      </div>
      <p className="ai-note ok">Fully managed &amp; <b>serverless</b> — AWS hosts/scales/patches the models. You pay only per API call (no calls = no cost).</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. BEDROCK REFERENCE ARCHITECTURE
   ════════════════════════════════════════════════════════════ */
export function BedrockArchitecture() {
  const [vpc, setVpc] = useState(true);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🏛️ Bedrock Reference Architecture</div>
      <p className="ai-intro">
        Bedrock and the models run in <b>AWS-owned accounts</b> — not yours. This is deliberate: providers <b>can't train on your data</b>.
      </p>
      <div className="ai-arch">
        <div className="ai-arch-acct">
          <b>🔵 Bedrock service account</b>
          <span>Runtime inference reads the model ID and routes the request.</span>
        </div>
        <div className="ai-arch-arrow">↓</div>
        <div className="ai-arch-acct">
          <b>🟣 Model-provider escrow account</b>
          <span>AWS-owned & operated. Model artifacts in S3 + inference runtime. Your data is never used to train the base model.</span>
        </div>
      </div>
      <p className="ai-sub">How your request reaches Bedrock:</p>
      <div className="ai-toggle">
        <button className={!vpc ? "active" : ""} onClick={() => setVpc(false)}>🌐 Over the internet</button>
        <button className={vpc ? "active" : ""} onClick={() => setVpc(true)}>🔒 VPC endpoint ✅</button>
      </div>
      <div className={`ai-verdict ${vpc ? "ok" : ""}`}>
        {vpc
          ? "PrivateLink — stays on the AWS private network: lower latency + more secure (enterprise default)."
          : "Public internet path — works, but higher latency and less private."}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. BEDROCK CONSOLE TOUR
   ════════════════════════════════════════════════════════════ */
const CONSOLE = {
  catalog: { t: "Model catalog", d: "Browse 100+ models. Two kinds: SERVERLESS (AWS hosts it, pay per request) and MARKETPLACE (you provision an instance → hourly cost + provider fee)." },
  playground: { t: "Test / Playground", d: "Try chat, image & video models with no code; compare models side-by-side before you build." },
  apikeys: { t: "API keys", d: "Short-term (12 hrs) or long-term keys for quick/SDK access. Production → use IAM + STS, not long-term keys." },
  tokenizer: { t: "Tokenizer", d: "Estimate token count for input/output to predict cost & stay within quotas." },
  infer: { t: "Cross-region / Batch", d: "Cross-region inference reroutes during throttling (mind data-residency). Batch runs many requests async — up to ~50% cheaper than on-demand." },
  throughput: { t: "Provisioned throughput", d: "Dedicated capacity for critical apps to avoid throttling/latency." },
  guardrails: { t: "Guardrails", d: "Block topics, keywords, toxic content & redact PII — on input AND output." },
  kb: { t: "Knowledge Bases", d: "Managed RAG: connect PDFs/docs so the model answers from YOUR data." },
  agents: { t: "Agents / Flows", d: "Build multi-agent apps; Flows = drag-and-drop GenAI workflows." },
  eval: { t: "Evaluations", d: "Score model/RAG output (accuracy, toxicity…) automatically or with humans." },
  settings: { t: "Settings / Logging", d: "Enable model-invocation logging → send prompts/responses/metrics to S3, CloudWatch, or both. Model access is now on by default." },
};
export function BedrockConsoleTour() {
  const [k, setK] = useState("catalog");
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🖥️ Bedrock Console Tour (Hands-On)</div>
      <p className="ai-intro">The left-nav capabilities you'll actually use. Tap each:</p>
      <div className="ai-console">
        <div className="ai-console-nav">
          {Object.keys(CONSOLE).map(x => (
            <button key={x} className={k === x ? "active" : ""} onClick={() => setK(x)}>{CONSOLE[x].t}</button>
          ))}
        </div>
        <div className="ai-console-body"><b>{CONSOLE[k].t}</b><p>{CONSOLE[k].d}</p></div>
      </div>
      <p className="ai-note">Try it: <b>Search "Bedrock"</b> → <b>Test → Chat/Text</b> → <b>Select model</b> (e.g. Amazon Nova Pro) → type a prompt → <b>Run</b>. Swap models to compare.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. BEDROCK vs SAGEMAKER JUMPSTART
   ════════════════════════════════════════════════════════════ */
const BJ = [
  { k: "Hosting", a: "AWS-owned account (managed)", b: "YOUR VPC (you control)" },
  { k: "Infra", a: "Serverless — nothing to size", b: "You provision the instance type" },
  { k: "Pricing", a: "Per API request", b: "Per provisioned capacity (hourly)" },
  { k: "Focus", a: "Proprietary + 3rd-party FMs via API", b: "Open-source FMs, fine-tune, deploy" },
  { k: "Users", a: "App devs", b: "ML engineers / data scientists" },
  { k: "Latency control", a: "Limited (AWS-managed)", b: "More — bigger instance = lower latency" },
];
export function BedrockVsJumpStart() {
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🆚 Bedrock vs SageMaker JumpStart</div>
      <p className="ai-intro">Both give access to foundation models — the difference is who controls the infrastructure:</p>
      <div className="ai-cmp">
        <div className="ai-cmp-head"><span className="feat"> </span><span className="a">Bedrock</span><span className="b">JumpStart</span></div>
        {BJ.map((r, i) => (
          <div key={i} className="ai-cmp-row"><span className="feat">{r.k}</span><span>{r.a}</span><span>{r.b}</span></div>
        ))}
      </div>
      <p className="ai-note ok">Rule of thumb: want <b>fast, managed, pay-per-call</b> → <b>Bedrock</b>. Need <b>open-source models, VPC control, or latency tuning</b> → <b>JumpStart</b>.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. FOUNDATION MODEL SELECTION FACTORS
   ════════════════════════════════════════════════════════════ */
const FACTORS = [
  ["🎭 Modality", "Text, image, multimodal (text+vision), or embeddings — match it to your use case."],
  ["🧠 Task complexity", "Simple (summarize) → small model (<8B params); heavy reasoning → large model."],
  ["📏 Context window", "Max input size, ~8k → 200k tokens (Claude 200k ≈ 150k words). Big docs need big windows."],
  ["🛡️ Guardrails & safety", "Built-in toxicity/content controls; supplement with Bedrock Guardrails."],
  ["🎯 Quality & accuracy", "Test in the playground + Bedrock evaluation for your use case."],
  ["💰 Cost / token", "Price per 1k tokens varies hugely — tiny at POC, enormous at scale."],
  ["🌍 Region & quotas", "Not every model is in every region; check request-per-minute quotas."],
  ["⚡ Latency", "Some models are latency-optimized for good UX."],
  ["🔓 Open vs proprietary", "Prefer open-source when it fits."],
  ["🗣️ Language support", "Not all models support all languages."],
];
export function FMSelectionFactors() {
  const [open, setOpen] = useState(0);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🔍 Choosing a Foundation Model</div>
      <p className="ai-intro">Decision #2. Tap each factor:</p>
      <div className="ai-factors">
        {FACTORS.map((f, i) => (
          <div key={i} className={`ai-factor ${open === i ? "open" : ""}`} onClick={() => setOpen(i)}>
            <div className="ai-factor-h">{f[0]}</div>
            {open === i && <p>{f[1]}</p>}
          </div>
        ))}
      </div>
      <p className="ai-note ok">🏁 Summary: pick the <b>smallest, safest, most cost-efficient</b> model that meets your accuracy, latency &amp; governance needs.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   8. INFERENCE PARAMETERS PLAYGROUND (the star)
   ════════════════════════════════════════════════════════════ */
const WORDS = [
  { w: "horse", p: 0.4 },
  { w: "wind", p: 0.2 },
  { w: "unicorns", p: 0.1 },
  { w: "the distance", p: 0.05 },
];
export function InferencePlayground() {
  const [temp, setTemp] = useState(0.2);
  const [topK, setTopK] = useState(4);
  const [topP, setTopP] = useState(1);

  // sorted desc by probability
  const sorted = [...WORDS].sort((a, b) => b.p - a.p);
  // top-k cut
  let pool = sorted.slice(0, topK);
  // top-p cut (cumulative)
  const pp = [];
  let cum = 0;
  for (const item of pool) {
    pp.push(item);
    cum += item.p;
    if (cum >= topP) break;
  }
  pool = pp.length ? pp : [sorted[0]];
  // temperature: low → highest prob, high → lowest prob in pool
  let chosen;
  if (temp < 0.4) chosen = pool[0];
  else if (temp > 0.7) chosen = pool[pool.length - 1];
  else chosen = pool[Math.min(pool.length - 1, Math.floor(pool.length / 2))];

  return (
    <div className="sv-card">
      <div className="sv-title ai-title">🎛️ Inference Parameters — Live Playground</div>
      <p className="ai-intro">
        The model completes <i>"I hear the hoofbeats of …"</i> one word at a time, each candidate has a probability. Tune the knobs and watch which word gets picked:
      </p>
      <div className="ai-words">
        {sorted.map((it) => {
          const inPool = pool.includes(it);
          const isChosen = chosen === it;
          return (
            <div key={it.w} className={`ai-word ${inPool ? "in" : "out"} ${isChosen ? "chosen" : ""}`}>
              <span className="ai-word-bar" style={{ width: `${it.p * 100 * 2}%` }} />
              <span className="ai-word-t">{it.w}</span>
              <span className="ai-word-p">{it.p}</span>
            </div>
          );
        })}
      </div>
      <div className="ai-knobs">
        <label>Temperature <b>{temp.toFixed(2)}</b><input type="range" min="0" max="1" step="0.05" value={temp} onChange={e => setTemp(+e.target.value)} /><small>low = predictable · high = creative</small></label>
        <label>Top-K <b>{topK}</b><input type="range" min="1" max="4" value={topK} onChange={e => setTopK(+e.target.value)} /><small>only the K most-likely words are eligible</small></label>
        <label>Top-P <b>{topP.toFixed(2)}</b><input type="range" min="0.1" max="1" step="0.05" value={topP} onChange={e => setTopP(+e.target.value)} /><small>keep words until probabilities sum to P</small></label>
      </div>
      <div className="ai-chosen">Next word → <b>"{chosen.w}"</b></div>
      <p className="ai-note">Low temperature picks the <b>safe top word</b> (horse); high temperature reaches for <b>unlikely</b> ones — but Top-K / Top-P first shrink the candidate pool.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   9. LENGTH CONTROL — max tokens + stop sequence
   ════════════════════════════════════════════════════════════ */
export function LengthControl() {
  const [maxTok, setMaxTok] = useState(512);
  const words = Math.round(maxTok * 0.75);
  return (
    <div className="sv-card">
      <div className="sv-title ai-title">📐 Controlling Output Length</div>
      <p className="ai-intro">Two ways to cap the response (saves cost + keeps output tidy):</p>
      <div className="ai-len">
        <b>Max tokens: {maxTok}</b>
        <input type="range" min="64" max="4096" step="64" value={maxTok} onChange={e => setMaxTok(+e.target.value)} />
        <span>≈ <b>{words}</b> words max (1k tokens ≈ 750 words). The model may stop sooner, never later.</span>
      </div>
      <div className="ai-stop">
        <b>Stop sequence</b>
        <p>Generation halts the moment it produces a chosen token — e.g. set <code>{"}"}</code> so a JSON object ends cleanly and matches your database schema:</p>
        <code className="ai-stop-code">{`{ "firstName": "John", "lastName": "Doe" }`} ⟵ stops here</code>
      </div>
      <p className="ai-note">Stopping is decided by: the <b>model</b> itself, your <b>max-tokens</b> cap, or a <b>stop sequence</b> you provide.</p>
    </div>
  );
}
