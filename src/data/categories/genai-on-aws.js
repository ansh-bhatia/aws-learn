// GenAI on AWS
export default {
  id: "genai-on-aws",
  label: "GenAI on AWS",
  icon: "🧠",
  color: "#9B6DFF",
  topics: [
    {
      id: "genai-business-scenario",
      title: "The Business Scenario — Why Build GenAI?",
      shortDesc: "A real wind-turbine use case that drives every decision in this section",
      visuals: ["SMEAssistantScenario"],
      content: `## The Business Problem

A large company builds **wind turbines**. When a turbine breaks in a **remote area**, a **field technician** drives out, takes photos of the damage, and writes a long **incident log**.

Today the flow is **fully manual**:
- Technician → sends photos + logs to a custom app (which just stores them).
- A senior **equipment expert (SME)**, sitting at a global office, reads everything **by hand** and replies with guidance.

> The problem: the expert wades through huge logs and images → it's **slow** → the turbine stays down longer → lost money.

---

## The GenAI Fix

Build a **GenAI-powered equipment SME assistant**:
- The technician sends the same photos + log to a **generative AI app built on Amazon Bedrock**.
- A **foundation model** reads it all and sends back a **clean summary** in seconds.

> **Foundation model (FM) / Large Language Model (LLM):** the AI "brain" that understands and generates text/images. When you use ChatGPT, the *app* is "ChatGPT" but the *brain* is a model like GPT.

---

## Why the Business Cares (the business drivers)

- ✅ **Reduce turbine downtime** — faster diagnosis means the turbine is back online sooner.
- ✅ **Boost the expert's productivity** — the AI handles routine summaries; the human focuses on the hard cases.

> This one use case runs through the **whole section** — every architecture decision we make is to build *this* assistant well.`,
    },
    {
      id: "genai-trilemma-decisions",
      title: "The GenAI Trilemma & 15 Decisions",
      shortDesc: "The quality–latency–cost balance + the 15-decision mental model",
      visuals: ["GenAITrilemma", "ArchDecisions15"],
      content: `## The GenAI Trilemma

Every production GenAI app is a balancing act between **three** things:

- **Quality** — how good and accurate the answers are.
- **Latency** — how fast the answer comes back.
- **Cost** — you pay per **token** (roughly per word) processed.

> 🎯 The goal: the **best quality, at the lowest cost, with low latency**. Push one up and you usually pressure the others — so it's a constant trade-off. Every decision below serves this balance.

---

## 15 Decisions Before You Build

Before writing any code, you make ~15 key choices. This is the **mental map** (we deep-dive each one later):

| # | Decision | In short |
|---|---|---|
| 1 | GenAI platform | Bedrock vs SageMaker JumpStart |
| 2 | Foundation model | Pick the right model from 100+ |
| 3 | Guardrails & responsible AI | Filter unsafe input **and** output |
| 4 | Prompt engineering | Reusable system prompts to lift quality cheaply |
| 5 | Inference optimization | Service tiers, cross-region inference |
| 6 | Cost optimization | Prompt caching, batch, right-sizing |
| 7 | Orchestration layer | Lambda (simple) / Step Functions (complex) / ECS / EC2 |
| 8 | API layer | API Gateway (auth, quotas, throttling), ELB, AppSync |
| 9 | Observability | CloudWatch logs/metrics/alarms (+ S3) |
| 10 | Model evaluation | Human or automated, before going big |
| 11 | Model fine-tuning | Customize on your domain or task |
| 12 | Security & data protection | Cognito, VPC endpoints, KMS, PII redaction |
| 13 | Enterprise data management | Where data lives: S3, FSx, SQL/NoSQL |
| 14 | GenAI Ops & governance | CloudFormation/CDK, pipelines, model registry |
| 15 | Advanced orchestration | LangChain/LangGraph, Bedrock Agents (RAG/agents) |

> Don't memorize this now — it's a map. Decisions **1 and 2** (platform + model) are next; the rest fill in as the course goes on.`,
    },
    {
      id: "bedrock-platform",
      title: "Platform #1 — Amazon Bedrock",
      shortDesc: "What Bedrock is, how model-ID routing works, and the secure architecture",
      visuals: ["BedrockHowItWorks", "BedrockArchitecture"],
      content: `## Decision #1: Which AWS GenAI Service?

AWS gives you two main ways to use foundation models:
- **Amazon Bedrock** — the flagship, **fully-managed** GenAI service *(this topic)*.
- **SageMaker JumpStart** — more control, but you manage the infrastructure *(next topic)*.

---

## What Is Amazon Bedrock?

**Amazon Bedrock** gives you **100+ foundation models** from Amazon and third-party providers through a **single API**.

| Provider | Example models | Known for |
|---|---|---|
| Amazon | Nova Pro, Nova Lite | Price/performance, image & video |
| Anthropic | Claude 3.5 / 4.5 | Extended thinking, coding, computer use |
| AI21 Labs | Jamba | Long context windows (huge docs) |
| Meta | Llama | Open-weight models |
| Cohere | Command | Search & enterprise text |

> **Fully managed & serverless:** AWS hosts, scales, patches and monitors the models. You just call the API — and you **only pay per API call** (no calls = no cost).

---

## How Bedrock Works

You can call Bedrock **3 ways**: the **Console**, the **CLI**, or the **SDK** (e.g. \`boto3\` for Python). Your request carries:

- **\`modelId\`** — which model to use (e.g. \`anthropic.claude-3-haiku\`).
- **prompt** — the user's question/input.
- **inference parameters** — e.g. \`maxTokens\`, \`temperature\` (covered later).

Bedrock reads the \`modelId\` and **routes** your request to the right model, then returns the response.

---

## Reference Architecture (why your data is safe)

Bedrock does **not** run in your account — it runs in **AWS-owned accounts**:

- 🔵 **Bedrock service account** — receives your call; "runtime inference" reads the \`modelId\` and routes it.
- 🟣 **Model-provider escrow account** — AWS-owned & operated; the model files live in S3 with an inference runtime.

> **Why this design?** So model providers can **never train on your data**. Your prompts/responses aren't used to improve the base models. (From the SDK/CLI nothing is stored; the console *may* keep a prompt history.)

---

## Two Ways to Reach Bedrock

- 🌐 **Over the internet** — works, but higher latency and less private.
- 🔒 **VPC interface endpoint (PrivateLink)** — stays on the AWS private network: **lower latency + more secure**. Enterprises prefer this.

> 🛠️ **Hands-on — find the endpoints:** Console → search **VPC** → **Endpoints** → **Create endpoint** → **AWS services** → search **bedrock** → you'll see \`com.amazonaws.<region>.bedrock\`, plus ones for agents, agent-runtime, agent-core and more.`,
    },
    {
      id: "bedrock-console",
      title: "Bedrock Console Walkthrough (Hands-On)",
      shortDesc: "A guided tour of every Bedrock capability in the AWS console",
      visuals: ["BedrockConsoleTour"],
      content: `## Open the Console

> 🛠️ **Hands-on:** Sign in → search **Bedrock** → open the service. The **left-hand menu** lists every capability. This is a high-level tour — we deep-dive each later.

---

## Overview & Model Catalog

- **Overview** — quick links to the model catalog + test/chat.
- **Model catalog** — every model from every provider, in two flavours: **Serverless** (AWS hosts it; pay per request, no commitment) and **Bedrock Marketplace** (you provision an instance → **hourly infra cost + a provider fee**, e.g. an instance at ~$57/hr). Remember this cost difference for the exam.

---

## API Keys

Generate keys to call Bedrock programmatically — a **short-term key** (valid 12 hours) or a **long-term key** (exploration only).

> ⚠️ In **production**, don't use long-term keys — use **IAM + STS** tokens instead.

---

## Test / Playground (no code)

- **Chat / Text** — pick a model (e.g. Amazon Nova Pro) → type a prompt → **Run**. Swap models to **compare** answers.
- **Image / Video** — e.g. Nova Canvas: prompt "image of a dog" → **Run**.
- **Watermark detection** — checks whether an image was made by Titan Image Generator or Nova Canvas.
- **Tokenizer** — paste text → **count tokens** to estimate cost (you're billed per token).

---

## Infer (scale & resilience)

- **Cross-region inference** — if your region is throttled (out of capacity), Bedrock reroutes to another region. ⚠️ Mind data-residency rules like **GDPR**.
- **Batch inference** — process many requests **asynchronously** (e.g. overnight insurance claims). Can cost **~50% less** than on-demand.
- **Provisioned throughput** — dedicated capacity for critical apps to avoid throttling/latency.

---

## Tune (customize models)

- **Custom models** — adapt a base model to your domain (e.g. medical or turbine terms). Methods: distillation, supervised fine-tuning, reinforcement fine-tuning, continued pre-training.
- **Prompt routers** — auto-route requests between models *in the same family* to balance quality vs cost (simple task → cheap model, complex → stronger model).
- **Imported models** — bring a model you built (SageMaker / outside AWS) in via S3, so everything sits in one catalog.

---

## Build

- **Agents** — managed multi-agent framework for agentic apps.
- **Flows** — drag-and-drop (low-code) GenAI workflows.
- **Knowledge Bases** — managed **RAG**: connect your PDFs/docs so the model answers from **your** data.
- **Automated reasoning** — reduces **hallucinations** (confident but wrong answers).
- **Guardrails** — block topics/keywords, moderate toxic content, redact **PII** — on input *and* output.
- **Prompt management** — store reusable **system prompts** to share across apps.
- **Data automation** — pull insights from unstructured docs/images/video/audio (e.g. auto-extract insurance-claim data into a database).
- **Agent Core** — deploy agents built in open-source frameworks (CrewAI, LangGraph) with memory, tools, identity and observability built in.

---

## Assess & Configure

- **Evaluations** — score model/RAG output (accuracy, toxicity…) **automatically** or with **humans**.
- **Settings → model invocation logging** — send prompts/responses/metrics to **S3, CloudWatch, or both**.
- **Model access** — now **on by default** (you used to request each model).

> 🧭 **Quick first test:** Search **Bedrock** → **Test → Chat/Text** → select **Nova Pro** → ask "What is Amazon Bedrock?" → **Run**.`,
    },
    {
      id: "sagemaker-jumpstart",
      title: "Platform #2 — SageMaker JumpStart",
      shortDesc: "The other way to use foundation models — and Bedrock vs JumpStart",
      visuals: ["BedrockVsJumpStart"],
      content: `## SageMaker AI (the parent service)

**Amazon SageMaker AI** is AWS's platform to **build, train and deploy ML models** (e.g. a Gmail-style spam classifier). It covers the full ML lifecycle: prep data → train → evaluate → deploy → monitor. AWS now positions it as a **unified platform for data analytics and AI**.

---

## What Is SageMaker JumpStart?

**JumpStart** is the **GenAI part** of SageMaker. It lets you **deploy, fine-tune and evaluate foundation models**, with a focus on **open-source** models (proprietary ones like AI21 and Cohere are there too). It also offers computer-vision and NLP models (translation, speech-to-text, etc.). For evaluation it uses **SageMaker Clarify**.

---

## How You Deploy a Model

1. Pick a foundation model (e.g. one from Cohere).
2. **Provision infrastructure** — choose an instance type (e.g. \`ml.t3.large\`, ~10¢/hr).
3. Choose **which VPC** to deploy into → **your own VPC**.
4. You get an **endpoint** → call it (e.g. \`boto3\`) → expose it through **Lambda + API Gateway**.

> The big difference vs Bedrock: in **JumpStart the model runs in YOUR VPC**, and **you pick the instance** up front. In Bedrock it's serverless in an AWS-owned account.

---

## Bedrock vs JumpStart

| Factor | Bedrock | JumpStart |
|---|---|---|
| Hosting | AWS-owned account (managed) | **Your VPC** (you control) |
| Infra | Serverless — nothing to size | You provision the instance |
| Pricing | Per API request | Per provisioned capacity (hourly) |
| Focus | Proprietary + 3rd-party FMs via API | Open-source FMs, fine-tune, deploy |
| Users | App developers | ML engineers / data scientists |
| Latency control | Limited (AWS-managed) | More — bigger instance = lower latency |
| Security | Managed by AWS | Full **VPC + IAM** control |

> **Rule of thumb:** want **fast, managed, pay-per-call** → **Bedrock**. Need **open-source models, VPC control, or latency tuning** → **JumpStart**.

(AWS still manages scaling/availability/monitoring of the infra — but **you** decide the instance size.)`,
    },
    {
      id: "foundation-model-selection",
      title: "Decision #2 — Choosing a Foundation Model",
      shortDesc: "The 10 factors that decide which model fits your use case (+ where to check each)",
      visuals: ["FMSelectionFactors"],
      content: `## You Picked the Platform — Now Pick the Model

Bedrock alone has 100+ models. These are the factors that decide **which one** fits your use case.

---

## The Selection Factors

- **🎭 Modality** — does it handle **text**, **image**, **multimodal** (text+image, called *text-vision* in Bedrock), or **embeddings** (vector representations used for search/retrieval)? *(Our turbine case sends images + text → needs multimodal.)*
- **🧠 Task complexity** — easy task (summarize) → a **small** model (≤8B parameters) is fine; heavy **reasoning** → a **large** model (hundreds of billions of params). More params usually = handles harder tasks.
- **📏 Context window** — the **max input** you can send at once, ranging ~**8k → 200k tokens**. (1,000 tokens ≈ 750 words, so Claude's 200k ≈ ~150k words.) Big legal contracts need a big window.
- **🛡️ Guardrails & safety** — most models have built-in toxicity/content controls; check them and supplement with **Bedrock Guardrails**.
- **🎯 Quality & accuracy** — test in the playground and use **Bedrock evaluations** for your use case.
- **💰 Cost per token** — price per 1k tokens varies *a lot* between models. Tiny in a POC, **enormous** at production scale.
- **🌍 Region & quotas** — not every model is in every region; check the **requests-per-minute quota**.
- **⚡ Latency** — some models are **latency-optimized** for better user experience.
- **🔓 Open-source vs proprietary** — prefer open-source when it fits.
- **🗣️ Language support** — not all models support all languages.

> 🏁 **Summary rule:** pick the **smallest, safest, most cost-efficient** model that still meets your **accuracy, latency and governance** needs.

---

## Hands-On: Where to Check Each Factor

- **Modality / context window / languages / parameters:** Console → Bedrock → **Model catalog** → **Serverless** → scroll the columns. You'll see *text-vision* vs *text*, the max-token (context) size, supported languages, and params (e.g. Llama shows "17B").
- **Quality:** the **Test → Chat/Text** playground, or **Assess → Evaluations**.
- **Cost:** the **Bedrock pricing page** — compare price per 1k tokens (a 70B model can cost ~4.5× an 11B one).
- **Quotas:** Console → **Service Quotas** → select **Bedrock** → **View quotas** → search your model. It shows *your* account limit vs the AWS default (e.g. **100** vs **2000** requests).`,
    },
    {
      id: "inference-parameters",
      title: "Inference Parameters (Hands-On)",
      shortDesc: "Temperature, Top-K, Top-P, max tokens & stop sequences — control creativity and length",
      visuals: ["InferencePlayground", "LengthControl"],
      content: `## What Are Inference Parameters?

When you call a model, alongside the prompt you send **inference parameters** (like \`maxTokens\` and \`temperature\`). They change **how** the model produces its answer. There are two families:

- **Randomness & diversity** — controls **creativity** (temperature, top-k, top-p).
- **Length** — controls **how long** the answer is (max tokens, stop sequence).

---

## How a Model Picks the Next Word

A model writes **one word at a time**, scoring candidates by probability. Example — completing *"I hear the hoofbeats of …"*:

| Candidate | Probability |
|---|---|
| horse | 0.40 |
| wind | 0.20 |
| unicorns | 0.10 |
| the distance | 0.05 |

### 🌡️ Temperature (e.g. 0–1)
- **Low (≈0)** → picks the **highest-probability** word → "horse" → safe and predictable.
- **High (≈1)** → reaches for **lower-probability** words → "the distance" → creative and surprising.

### 🔢 Top-K (e.g. 1–500)
Only the **K most-likely** words are eligible. With **K=3**, only horse/wind/unicorns are in play — so even high temperature can't pick "the distance".

### 📊 Top-P (e.g. 0–1)
Keep words until their probabilities **add up to P**. With **P=0.6**, horse (0.4) + wind (0.2) = 0.6 → only those two are eligible.

> Combine all three: **Top-K / Top-P first shrink** the candidate pool, **then temperature** decides how boldly to choose within it. Play with the sliders in the visual below 👇

---

## Controlling Length

- **Max tokens** — the **most** tokens the answer can use (1 up to 64,000 depending on model; 64k on Claude). The model may stop **sooner**, never **later**. Fewer tokens = lower cost. (\`max_token: 512\` ≈ 375 words.)
- **Stop sequence** — the model **stops** the instant it produces a chosen token. E.g. set \`}\` so a JSON object ends cleanly and matches your database schema.

Three things decide when output stops:
1. **Model-decided** — it judges the natural length on its own.
2. **Max-tokens cap** — your hard limit.
3. **Stop sequence** — your chosen "halt here" token.

---

## Hands-On

> 🛠️ Console → Bedrock → **Chat/Text playground** → select a model (e.g. Nova Pro). On the left you'll find: **Max output tokens** (e.g. 1–5063 for Nova Pro; up to 64,000 on Claude), **Stop sequences** (add a token like \`}\`), and the **Temperature / Top-P / Top-K** sliders.

Set temperature to **0**, ask *"Who is the best football player?"* → **Run**. You'll get a predictable list (Messi, Ronaldo…) and see the **input tokens, output tokens and latency**. Notice it usually stops well before the max — that's the model's own stop logic.`,
    },
    {
      id: "genai-guardrails",
      title: "Decision #3 — Guardrails & Responsible AI",
      shortDesc: "Block toxic content, denied topics & PII — and test it live",
      visuals: ["GuardrailCapabilities", "GuardrailSimulator"],
      content: `## Why Guardrails?

Foundation models have *some* built-in protection, but it's not enough on its own. Three big risks:

- **Hallucination** — the model states something **factually wrong or made-up** (an HR bot inventing a policy that isn't in the document).
- **Toxicity** — offensive, discriminatory or harmful content — sent **in** by a user, or generated **out** by the model.
- **PII / data leakage** — the model exposes private or confidential data.

---

## Amazon Bedrock Guardrails

**Guardrails** add **your own safeguards on top** of the model's native protection — tuned to your app and your responsible-AI policy. Six capabilities:

| Capability | What it does |
|---|---|
| **Content filters** | Detect & filter harmful text/image (hate, insults, sexual, violence, misconduct) on input *and* output, with adjustable strength. Also blocks **prompt-attacks**. |
| **Denied topics** | Block whole topics (e.g. "investment advice" for a banking bot). Up to **30**. |
| **Word filters** | Block specific words/phrases (up to **10,000**). |
| **Sensitive info filters** | **Redact PII** (name, phone, card numbers…) on input & output. |
| **Contextual grounding** | Catch hallucinations — checks the answer is **grounded** in your source *and* **relevant** to the question (each has a score). |
| **Automated reasoning** | Logic/math validation against policy rules (next topic). |

> Most filters run on **both** the user input *and* the model's response, and can either **block** or just **detect**.

---

## Hands-On: Create a Guardrail

Scenario: an **investment bank** chatbot that must **never give investment advice**.

- Console → **Bedrock → Guardrails → Create guardrail**. Name it (e.g. "investment-advice") and set the **blocked message** ("Sorry, the model cannot answer this question"). Optionally enable **cross-region inference** and **KMS** encryption.
- **Content filters** — pick categories (hate / insults / sexual / violence / misconduct), set the **action** (block or detect) and **threshold** (high = strict). Turn on **prompt-attack** detection. Choose a **tier**: *Classic* (English/French/Spanish) or *Standard* (50 languages, needs cross-region inference).
- **Denied topics** — add "investment advice"; block on **input and output**.
- **Word filters** — add words to block (e.g. "violence").
- **Sensitive info filters** — add PII types (name, phone…) to redact.
- **Contextual grounding** — set a **grounding** score threshold (e.g. 0.74) and a **relevance** threshold; below it → block/detect.
- **Review → Create**, then test in the built-in playground. A "how to hurt someone" prompt is stopped by the **content filter**; "give me investment advice" is stopped by the **denied topic** — click **View trace** to see exactly which rule fired.

---

## Use It in Code

In your \`invoke_model\` (boto3) call, pass the **\`guardrailIdentifier\`** (the guardrail's ID) and **\`guardrailVersion\`**. Bedrock then enforces every rule you configured — automatically, on every request.`,
    },
    {
      id: "genai-automated-reasoning",
      title: "Automated Reasoning — Logic vs Hallucination",
      shortDesc: "Validate model answers against rules pulled from your policy docs",
      visuals: ["AutomatedReasoningFlow"],
      content: `## What It Is

**Automated reasoning checks** (part of **Bedrock Guardrails**) improve **factual accuracy**. They use **logic-based algorithms and mathematical validation** to check the model's answer against **rules** extracted from your policy document. In plain English: **fewer hallucinations**.

---

## How It Works (home-insurance example)

1. You upload your **home-insurance policy document**.
2. Bedrock **extracts rules** into an **automated-reasoning policy** — e.g. *"to file a claim you need: Policy ID + Driving license."* A subject-matter expert can review and refine these rules.
3. A customer asks: *"Which documents do I need to file a claim?"*
4. The model answers: *"Policy ID, Driving license, **and income proof**"* — that last one is **hallucinated**.
5. Automated reasoning **validates** the answer against the rules → income proof **isn't** required → it **flags** the error.

> ⚠️ **Detect-only:** unlike the other guardrail capabilities (which can **block** *or* **detect**), automated reasoning runs in **detect mode only** — it returns feedback and a confidence score but won't block the response. You can attach **up to 2** automated-reasoning policies per guardrail.

> 🧠 Big picture: this is one of **three** anti-hallucination tools in Bedrock — alongside **contextual grounding** (guardrails) and **RAG / Knowledge Bases**.`,
    },
    {
      id: "genai-prompt-engineering",
      title: "Decision #4 — Prompt Engineering",
      shortDesc: "The cheapest way to raise quality: good prompts + the zero/one/few-shot ladder",
      visuals: ["PromptAnatomy", "ShotPrompting"],
      content: `## Key Terms First

- **Prompt** — the input you send the model.
- **Completion** — the response it generates.
- **Inference** — the whole send-prompt → get-response process.

> Better prompts → better responses. **Prompt engineering** is the **cheapest, easiest** way to lift quality — try it *before* reaching for RAG or fine-tuning.

---

## Anatomy of a Good Prompt

Just saying *"Summarize"* gives the model no context, so the output is poor. A good prompt has four parts:

- **Context** — background (e.g. "This is a review of the FIFA World Cup, Qatar 2022").
- **Input text** — the actual content to act on.
- **Clear task** — what to do ("Summarize the review above").
- **Output spec** — the shape of the answer ("in exactly two lines").

> Clear instructions + a defined task + an output spec = a much better completion. Build one up in the visual below 👇

---

## The Prompting Ladder (escalate only as needed)

Start cheap, climb only if the output isn't good enough:

- **Zero-shot** — **no examples**. Models handle simple tasks directly ("Write a product description for a t-shirt").
- **One-shot** — give **one** worked example to show the pattern, then the real task.
- **Few-shot** — give **several** examples for higher-quality, consistent output.

> Still not enough? Move to **Chain-of-Thought / ReAct** (covered with **Agents**), then **RAG**, then **fine-tuning**. But always try prompt engineering first — it's the lowest-cost lever.`,
    },
    {
      id: "genai-prompt-management",
      title: "Bedrock Prompt Management (Hands-On)",
      shortDesc: "System vs user prompts, and reusable versioned prompt templates",
      visuals: ["SystemUserPromptComposer"],
      content: `## System Prompt vs User Prompt

- **User prompt** — what the end user sends (changes every time). e.g. *"[equipment logs] — summarize."*
- **System prompt** — context **you** add to steer the model (stays the same). e.g. *"You are a wind-turbine SME specializing in equipment issue analysis and log-based troubleshooting. Produce a concise one-page summary and highlight key anomalies and failure patterns."*

Sending **both together** gives the model full context → a far better answer than the user prompt alone.

---

## Bedrock Prompt Management

**Prompt Management** lets you **create, evaluate, version and share** reusable prompt templates across your organization — so every team reuses the same tuned system prompts instead of reinventing them.

---

## Hands-On

- Console → **Bedrock → Prompt management → Create prompt** → name it (e.g. "demo-prompt-01"). (Optional KMS encryption.)
- Paste your **system prompt** into the prompt box. The **user prompt** goes into a **variable** (e.g. \`topic\`) that gets filled at run time.
- Configure: pick **Models** (e.g. **Amazon Nova Pro** — it usually has more capacity / fewer throttling errors) and set **inference parameters** (length, temperature, top-P) to **mirror your real app**.
- Enter a sample user prompt → **Run** → review the response. Tweak the model / parameters / system prompt until it's good.
- **Create version** to snapshot it. You can make multiple versions, **compare variants**, then reuse the template across your apps.

> 💡 Tip: match the playground's inference parameters to production so the response you evaluate here is what you'll actually get live.`,
    },
    {
      id: "genai-inference-optimization",
      title: "Decision #5 — Inference Optimization",
      shortDesc: "Service tiers, cross-region inference & latency-optimized models",
      visuals: ["ServiceTierSelector", "CrossRegionRouter"],
      content: `## Three Levers

You can optimize inference — for **cost, latency and resilience** — three ways: **service tiers**, **cross-region inference**, and **latency-optimized inference**.

---

## 1) Service Tiers (capacity planning)

Bedrock has **4 tiers**, chosen with the **\`serviceTier\`** parameter on your API call:

| Tier (param) | Best for | Notes |
|---|---|---|
| **Reserved** (\`reserved\`) | Mission-critical, always-on | Targets **99.5%** uptime; reserve **1 or 3 months**; separate input/output TPM; fixed price per 1k tokens/min, billed monthly |
| **Priority** (\`priority\`) | Latency-sensitive, customer-facing | **Fastest** response, **premium** over standard; no 24/7 reservation |
| **Standard** (\`default\`) | General production | The **default** if you set nothing; consistent everyday performance |
| **Flex** (\`flex\`) | Non-urgent, cost-optimized | **Lowest cost**; spare capacity, variable latency; common with batch |

---

## 2) Cross-Region Inference

If your region runs out of capacity you hit **throttling**. **Cross-region inference** reroutes the request to another region. You pick the scope via the **model-ID prefix** (the "inference profile"):

- \`anthropic.claude-3-haiku\` — **single region** only (no fallback).
- \`global.anthropic…\` — **global**: any AWS region worldwide. **Highest** throughput, **~10% cheaper** → best for performance & cost.
- \`us.\` / \`eu.\` / \`apac.\` — **geographic**: only within that geography. Use when you have **data-residency** rules (e.g. GDPR keeps EU data in the EU).

> Rule: **data-residency requirement → geographic**; **no restriction + want best cost/performance → global**. Mind your **SCPs** — allow the destination regions.

---

## 3) Latency-Optimized Inference

Some models are tuned for **low latency**: **Amazon Nova Pro**, **Anthropic Claude 3.5 Haiku**, and **Meta Llama 3.1 (405B & 70B)**. Turn it on with the **\`performanceConfig.latency\`** parameter set to **\`optimized\`** (vs \`standard\`, the default) on the Bedrock Runtime API.

---

## Hands-On (Lambda demo)

- Write boto3 that calls \`invoke_model\` with \`modelId = "us.amazon.nova-pro…"\` (US **geographic** cross-region), a \`guardrailIdentifier\`, and \`performanceConfig.latency = "optimized"\`.
- Console → **Lambda → Create function** (Python) → set the **timeout** to ~1 min → give its **IAM role** Bedrock access → paste the code → **Deploy** → **Test**.
- Check the **function logs**: you'll see \`performanceConfigLatency: optimized\` and the **invocation latency** (e.g. ~3,113 ms) — lower than it would be on standard.`,
    },
    {
      id: "genai-cost-pricing",
      title: "Decision #6 — Cost Optimization: Pricing Models",
      shortDesc: "On-demand vs provisioned throughput vs batch — and how tokens drive cost",
      visuals: ["PricingModels", "TokenCostCalculator"],
      content: `## Decision #6: Optimize Cost

After platform, model, guardrails, prompts and inference settings, the next big lever is **cost**. Start with how Bedrock charges you.

---

## The 3 Bedrock Pricing Models

| Model | How you pay | Best for |
|---|---|---|
| **On-demand** | Pay per use, **no commitment** | Variable / low-volume / dev & POC |
| **Provisioned throughput** | Buy **model units** + a **1- or 6-month** commitment → guaranteed throughput | Large, consistent **production** workloads |
| **Batch** | Async, process many at once | Non-urgent bulk jobs — up to **~50% cheaper** |

### How on-demand is charged
- **Text models** — per **input token** processed + per **output token** generated. (1,000 tokens ≈ 750 words.)
- **Image models** — per **image** generated.
- **Embedding models** — per **input token**.

> No requests = no charge. Make 10 requests over 3 months → you pay for 10.

### Batch inference
Upload many docs to **S3** → create a **batch job** → pick the model → results land in a target **S3** bucket as **JSON**. Great for summarizing hundreds of legal documents overnight. Up to **50% cheaper** than on-demand.

---

## Hands-On: Read the Pricing Page

- Search **"Amazon Bedrock pricing"**. Pricing is **per 1,000 tokens**, **separate for input vs output**, and varies by **model + region**.
- Worked example (Anthropic Claude, on-demand): 11,000 input + 4,000 output tokens → cost = (11,000 / 1,000 × input-price) + (4,000 / 1,000 × output-price).
- Provisioned example: **1 model unit** of Claude Instant ≈ **$39.60/hour** × 24 × days, with a **1-month** minimum commitment.

> Use the calculator below to feel how input/output tokens drive cost — and how batch halves it.`,
    },
    {
      id: "genai-prompt-caching",
      title: "Cost Optimization — Prompt Caching",
      shortDesc: "Reuse the static part of a prompt to cut input-token cost & latency",
      visuals: ["PromptCachingDemo"],
      content: `## What Prompt Caching Does

**Bedrock prompt caching** reduces **input-token cost** *and* **latency** by reusing the **static part** of your prompt across requests.

---

## Cache Prefix vs Suffix

Split a prompt into two parts:
- **Cache prefix** — the **static, reused** part: e.g. a big **document** + your **system prompt**.
- **Suffix** — the part that **changes** each time: e.g. the user's **question**.

Example: an SME sends the **same** turbine-log document + same system prompt, but asks "summarize for machine **X**", then "summarize for machine **Y**". Only the question changes — so Bedrock **caches the document + system prompt** and reuses them.

---

## Key Rules

- Cached content is stored for **~5 minutes** (refreshed on reuse).
- Each model has a **minimum token threshold** per checkpoint (e.g. **Claude 3.7 Sonnet = 1,024 tokens**) — below it, nothing caches.
- Most effective for **long, repeated contexts** reused across many requests.

| | Without caching | With caching |
|---|---|---|
| Input tokens | High every request | High first time, low after |
| Latency | Slower | Faster |
| Cost | Stays high | Drops on reuse |

---

## Hands-On

- In a Lambda (boto3), wrap the static system prompt / document in a **cache checkpoint** (\`cachePoint\` type \`default\`); keep the dynamic bit (e.g. machine ID) outside it.
- Run once (machine 4522) → it **writes** the prefix to cache. Change to machine 99, run again → the response shows **\`cacheReadInputTokens\`** (reused tokens) and **lower latency** (e.g. 1345 ms → 1074 ms).
- You can also toggle **prompt caching** in the **Chat playground** (e.g. Nova Pro), though the programmatic path is more reliable.`,
    },
    {
      id: "genai-prompt-routing",
      title: "Cost Optimization — Intelligent Prompt Routing",
      shortDesc: "Auto-route easy prompts to a cheap model, hard ones to a strong model",
      visuals: ["PromptRoutingSim"],
      content: `## What It Does

**Bedrock Intelligent Prompt Routing** dynamically routes each request to **different models in the same family**, balancing **quality vs cost**. Supported families: **Anthropic**, **Meta Llama**, **Amazon Nova**.

> Why it saves money: a small model (e.g. **Nova Lite**) is cheaper + lower latency than a big one (**Nova Pro** ≈ **4× the price**). Send easy prompts to the small model, hard ones to the big model — automatically.

---

## How Routing Decides

You set a **quality-difference threshold**. For each prompt, the router predicts how much **better** the big (**fallback**) model's answer would be than the small model's:
- Predicted difference **below** your threshold → route to the **cheaper** model.
- **At or above** the threshold → route to the **fallback** (bigger) model.

Example (threshold 5%): *"summarize this in one sentence"* → predicted diff **4%** → **Nova Lite**. *"analyze these logs and find the root cause of cascading failures"* → predicted diff **32%** → **Nova Pro**.

---

## Hands-On: Configure a Prompt Router

- Console → **Bedrock → Tune → Prompt router models → Configure prompt router**. Give it a name.
- Pick **two base models** from one family (e.g. Nova Pro + Nova Lite).
- Choose a **fallback model** — the default, and the one quality difference is measured against (e.g. Nova Pro).
- Set the **routing criteria** — the quality-difference **threshold** (e.g. 10%). Lower = the answers must be very similar before it'll use the cheap model.
- Submit → open it to copy the **router ARN**. In code, pass that **ARN** as your \`modelId\`; the router decides per request.`,
    },
    {
      id: "genai-compute-layer",
      title: "Decision #7 — Compute Layer (Lambda / EC2 / ECS)",
      shortDesc: "Where your orchestration runs — and the 15-minute rule that decides it",
      visuals: ["ComputeSelector"],
      content: `## Decision #7: Where Does Your Orchestration Run?

Your GenAI app needs a **compute / orchestration layer** to assemble prompts, call Bedrock, run RAG, etc. Three options — **Lambda, EC2, ECS**. *(Exam focus: **Lambda**.)*

> ⏱️ **The 15-minute rule decides most cases:** Lambda caps each run at **15 minutes**. Task ≤ 15 min → **Lambda**. Longer-running → **ECS** or **EC2**.

---

## AWS Lambda (serverless) — the default

- **Fully managed**, **event-driven** (no event = no run = no cost). You bring only the code (Python / Java / …).
- Pay per **invocation + memory + execution time**. Auto-scales (≈1,000 concurrent per region, raisable).
- ✅ Use for: **orchestration** (the classic **API Gateway → Lambda → Bedrock**), **RAG** via Knowledge Bases (\`Retrieve\` / \`RetrieveAndGenerate\`), and as a **tool for Bedrock Agents**.
- ❌ Can't **host foundation models** or run **> 15-min** tasks.

---

## Amazon EC2 (virtual machine) — full control

- You manage the **guest OS, patching, security, scaling** (often with an Auto Scaling group + load balancer). Billed per hour / second; long-running.
- ✅ Use for: orchestration, **training/hosting your own FM** (**AWS Trainium** for training, **AWS Inferentia** for inference), **fine-tuning**, and self-hosting open-source **vector DBs / frameworks** (LangChain, etc.).

---

## Amazon ECS (containers) — scalable & long-running

- AWS-native container orchestration. **Fargate** = serverless (pay per vCPU + memory / second); **ECS-on-EC2** = you provision the instances. **No hard time limit**; containers scale **faster** than EC2.
- ✅ Use for: orchestration, **RAG pipelines**, **microservices** architectures, and **model hosting** (GPU via ECS-on-EC2, e.g. g5 / p4d).

---

> Quick pick: **simple, short, event-driven → Lambda** · **long-running / containers / microservices → ECS** · **train or host your own model, or need full OS control → EC2**.`,
    },
    {
      id: "genai-api-gateway",
      title: "Decision #8 — API Layer: Amazon API Gateway",
      shortDesc: "REST, HTTP, WebSocket & Private APIs — the secure entry point for prompts",
      visuals: ["ApiLayerSelector"],
      content: `## Decision #8: How Do Users Reach Your GenAI App?

Once your orchestration logic (Lambda/EC2/ECS) is ready, something has to **securely expose** it. Three options: **API Gateway**, **AppSync**, **Application Load Balancer**. *(Exam focus: **API Gateway**.)*

---

## Amazon API Gateway

A service to **create, publish, maintain, monitor and secure** REST, HTTP and WebSocket APIs at any scale. In a GenAI architecture it's the **secure entry point for prompts** (and for streaming responses — think of ChatGPT showing text chunk by chunk instead of all at once).

Classic pattern: **Web/mobile app → API Gateway → Lambda (prompt orchestration) → Amazon Bedrock**.

---

## The 4 API Types

| Type | Best for | Notes |
|---|---|---|
| **HTTP API** | Simple GenAI apps (summarization, content gen) | Low latency, cost-effective, but **limited features** |
| **REST API** | Apps needing **API keys & quotas**, per-client **throttling**, **WAF** | Full request/response control + management capabilities |
| **WebSocket API** | Chat apps, live dashboards, leaderboards | **Persistent connection** — server pushes updates, no refresh needed |
| **Private API** | Internal-only services | A REST API reachable **only from within a VPC** |

> **HTTP vs REST:** need just **speed + low cost**? → **HTTP**. Need **tiered access** (e.g. free vs premium with daily quotas) or **stronger security**? → **REST**.

---

## Two Invocation Patterns

- **Synchronous** — the event-driven pattern above: client **waits** for the response (API Gateway + Lambda, HTTP or REST API).
- **Asynchronous** — the caller does **not** wait; the response is **pushed** later (this is how AppSync's chat/dashboard pattern works — covered next).

---

## Hands-On

> 🛠️ Console → **API Gateway → Create API** → choose a type:
> - **HTTP API** — "build low-latency, cost-effective APIs... works with Lambda, HTTP backend."
> - **REST API** — "complete control over request/response + API management... works with Lambda, HTTP and AWS services."
> - **WebSocket API** — "persistent connection for real-time use cases... works with Lambda, HTTP and AWS services."
> - **REST API Private** — "only accessible from within a VPC."`,
    },
    {
      id: "genai-appsync-alb",
      title: "API Layer — AppSync & Application Load Balancer",
      shortDesc: "GraphQL for chat/dashboards, and ALB for long-running self-hosted inference",
      visuals: ["AppSyncVsRest", "ALBRoutingScenarios"],
      content: `## AWS AppSync

Ideal for **GenAI chat & live-dashboard apps** — similar use case to a WebSocket API, except **AppSync manages the routes for you**.

AppSync is a fully managed service for **GraphQL** — a query language (built by Facebook) where the client asks for **exactly** the data it needs, from **multiple sources in one call** (vs REST, which often **over-fetches or under-fetches** and needs one call per source).

- **Protocol:** GraphQL over **HTTPS and WebSockets**.
- **Real-time subscriptions** — once subscribed, clients get **auto-pushed** updates (great for live dashboards).
- **Offline support** — useful for mobile/web apps without a connection.
- Integrates with **Lambda** (orchestration) + **Bedrock** (inference).

### How a chat/dashboard update flows
User asks a question (a **"mutation"** — think: a trigger/state-change) → **AppSync** → **Lambda**, invoked **asynchronously** (it doesn't wait) → **Bedrock streams the response in chunks** → Lambda relays each chunk to AppSync → **AppSync pushes it to every subscribed client** in real time.

---

## Application Load Balancer (ALB)

Distributes incoming traffic across compute targets — **EC2, ECS, EKS, IP addresses, or Lambda** — for **high availability, scalability and low latency**.

- **Layer 7** — HTTP, HTTPS, WebSocket. *(There's also a Network Load Balancer at Layer 4 for TCP/UDP/ultra-low-latency — minor exam mention only.)*
- ⚠️ **REST/HTTP API Gateway has a 29-second timeout** on synchronous calls. **ALB has no timeout limit** → ideal for **long-running inference**, and pairs well with **GPU-backed EC2**.

### Key GenAI use cases
- **Self-hosted open-source models** on EC2/ECS, made **highly available** across multiple AZs.
- **High-throughput RAG** — vector DBs / chunking frameworks (e.g. LangChain) on EC2/ECS, load-balanced.
- **Multi-model routing** — a large model on one EC2 instance, a small one on another (same family); ALB routes each request to the right target.

> ALB *can* front a Lambda function, but that's uncommon — Lambda almost always pairs with **API Gateway** instead.

---

## Quick Decision Guide

| Need | Use |
|---|---|
| Simple, event-driven prompt → response | **API Gateway** (HTTP/REST) |
| Real-time chat / live dashboard, multi-source data | **AppSync** (GraphQL) |
| Long-running inference, self-hosted model, no timeout | **ALB** (+ EC2/ECS) |`,
    },
    {
      id: "genai-observability",
      title: "Decision #9 — Observability & Monitoring",
      shortDesc: "CloudWatch metrics, logs & log insights for your Bedrock app",
      visuals: ["ObservabilityDashboard"],
      content: `## Decision #9: Watching Your GenAI App in Production

Monitor every aspect of a Bedrock-powered app through **Amazon CloudWatch**, three ways:

---

## 1) Metrics (near real-time)

Track things like **token count** (cost), **latency**, and **errors** — then set **alarms** on thresholds (e.g. alert if latency exceeds 2 seconds).

Key Bedrock CloudWatch metrics: **Invocations**, **InvocationLatency** (ms), **InvocationClientErrors / ServerErrors**, **InvocationThrottles**, **InputTokenCount**, **OutputTokenCount**, **OutputImageCount**. **Guardrails** publishes its own metrics too (invocation count + latency) — useful for seeing how much latency guardrails add.

## 2) Logs

**Model-invocation logging** captures the **full prompt, response and metadata** (timestamp, account, region, inference config, token counts, latency) for every call — sent to **S3, CloudWatch, or both**.

## 3) Log Insights

**Query and analyze logs** (not metrics) — e.g. find every request over a latency threshold, build a custom dashboard, or ask it to **summarize results** in plain English.

---

## Hands-On

- Console → **Bedrock → Settings → Model invocation logging** → enable → choose destination (CloudWatch / S3 / both).
- First create a **CloudWatch log group**: Console → **CloudWatch → Log management → Create log group** (e.g. \`demo_bedrock_monitoring\`, pick a retention period).
- Back in Bedrock settings, enter that **log group name**, create/choose a **service role**, optionally add an S3 bucket → **Save**.
- Test it: **Chat/Text playground** → pick a model (e.g. Nova Pro) → send a prompt → **Run**.
- Go to **CloudWatch → Logs → your log group** → open the entry: see the input prompt, inference config (e.g. max tokens), **input token count**, the generated response, **latency** (ms), and **output/total token count**.
- **CloudWatch → All metrics → Bedrock → By model ID** → select **Invocations**, **InvocationLatency**, **InputTokenCount**, **OutputTokenCount** → graph them on a dashboard.
- **Log Insights** → write a query to pull matching logs → try **"Summarize results"** for a natural-language recap.`,
    },
    {
      id: "genai-model-evaluation",
      title: "Decision #10 — Model Evaluation",
      shortDesc: "Programmatic, LLM-as-judge & human evaluation before you commit to a model",
      visuals: ["ModelEvalApproaches"],
      content: `## Decision #10: Is the Model Actually Good Enough?

**Amazon Bedrock model evaluation** lets you evaluate, compare and select a foundation model for your use case — before (or while) building on it.

---

## The Process

1. **Define a prompt dataset** — JSON-L file with a **prompt** + a **reference response** (what a good answer should look like) per record.
2. **Upload it to S3.**
3. **Pick an evaluation method** (below).
4. Bedrock generates a **report** → a data scientist/SME reviews it.

---

## 3 Evaluation Approaches

| Approach | How it works |
|---|---|
| **Programmatic** | AWS's own built-in evaluator. Choose a **task type** (text generation / summarization / Q&A / classification) + metrics: **accuracy, toxicity, robustness**. Built-in or your own dataset. |
| **LLM-as-judge** | A **different** foundation model scores your model's responses. Pick the **evaluator model**, the **model being evaluated**, and metrics across **Quality** (helpfulness, correctness, faithfulness, completeness, coherence, tone) + **Responsible AI** (harmfulness, refusal) — plus custom metrics. |
| **Human** | **AWS-managed work team** (you supply the dataset/metrics, AWS arranges reviewers) or **bring your own team**. Compare up to **2 models**. |

> Reports normalize every metric score to **0–1**, and you can drill into any single prompt to compare the model's answer against your reference response.

---

## Hands-On (LLM-as-judge)

- Console → **Bedrock → Evaluations → Create → LLM as a judge**. Name it.
- **Evaluator model** — e.g. Llama 3.1. **Inference source** — the Bedrock model you're evaluating (e.g. Nova Pro), or bring your own prompt/response pairs.
- **Select metrics** — e.g. correctness, completeness, coherence, professional tone (Quality) + harmfulness, refusal (Responsible AI).
- **Dataset** — upload your prompt + reference-response JSON-L to an **S3 bucket** (with CORS enabled), with separate **input/output** folders; point the job at them.
- Create the job (needs an **IAM service role**) → wait (~10 min) → review the **metric summary** (each scored 0–1) and drill into individual prompts.`,
    },
    {
      id: "genai-model-customization",
      title: "Decision #11 — Model Customization: Distillation & Fine-Tuning",
      shortDesc: "Teacher→student distillation, labeled fine-tuning, unlabeled continued pre-training, and LoRA",
      visuals: ["CustomizationMethodCompare"],
      content: `## Decision #11: Customizing the Model Itself

When prompt engineering and RAG aren't enough, **model customization** retrains the model for your domain/task. All of it runs as a **SageMaker training job** behind the scenes — you upload data to an **S3 bucket** in your account, create a training job in Bedrock, and get back a **fine-tuned model** in its own S3 bucket.

Four approaches in Bedrock: **Model distillation**, **Fine-tuning**, **Continued pre-training**, and **Reinforcement fine-tuning** (newer, preview).

---

## Model Distillation

Transfers knowledge from a large, accurate **teacher** model (e.g. **Nova Pro**) to a smaller, faster, cheaper **student** model (e.g. **Nova Lite**).

**How:** send lots of prompts to the teacher → collect its responses → use those **prompt+response pairs** to train the student.

> Use case: near-teacher-model **accuracy** at much lower **latency and cost**.

### Hands-On
Console → **Bedrock → Tune → Custom models → Create → Distillation job**. Name the job + the resulting student model. Pick a **teacher** (e.g. Nova Pro) and a **student** from the **same family** (e.g. Nova Micro/Lite — you can't mix Nova teacher with an Anthropic student). Provide training data 3 ways: **prompts only** (the job calls the teacher for you), **prompt+response pairs** you supply, or your **existing invocation logs** (reuse real production traffic!). Data format: JSON-L with \`schemaVersion\`, a \`system\` context, and \`user\`/\`assistant\` message pairs. ⚠️ Needs a **minimum of 100 records**, and training can take **2–24 hours**.

---

## Fine-Tuning (Supervised)

Improves performance on a **specific task** (summarization, Q&A) — its **style, format or depth**. Needs **labeled data**: prompt + the **reference response** you want.

> Example: a physician-notes summarizer. Base model writes a generic summary; fine-tuned on labeled clinical notes it learns the clinical shorthand (e.g. *"Dx Type 2 DM, Tx Metformin initiated"*).

Best for **structured, well-defined tasks** with high-quality labeled data.

---

## Continued Pre-Training

Further trains the model to improve its **domain knowledge**, using **unlabeled** raw text (e.g. medical journal articles) — no prompt/response pairs needed.

> Example: a wind-turbine SME assistant that doesn't understand jargon like *"ER 3.84 misalignment"* — continued pre-training on turbine documentation teaches it the vocabulary.

Best for **domain adaptation when labeled data is limited**.

---

## LoRA — *How* Fine-Tuning Is Done

Two fine-tuning techniques:
- **Full fine-tuning** — updates **every** parameter across every layer. Best results, but needs **huge compute/memory** — rarely used.
- **PEFT (Parameter-Efficient Fine-Tuning)** — **freezes** the base model's weights and trains only a **small set of added parameters**. Much cheaper, **preserves** the model's pre-trained knowledge. The common approach — includes **LoRA** (Low-Rank Adaptation, the exam focus), adapters, prefix/prompt tuning, QLoRA.

AWS's two example **LoRA** use cases: **domain adaptation** (e.g. a healthcare provider adapting to medical terminology) and **multi-language adaptation** (e.g. a global e-commerce platform adapting customer service to regional languages/culture).`,
    },
    {
      id: "genai-adaptation-ladder",
      title: "Choosing an Adaptation Strategy (Mental Model)",
      shortDesc: "The 5-rung ladder from prompt engineering to continued pre-training — and what's next",
      visuals: ["AdaptationDecisionLadder"],
      content: `## The Adaptation Ladder

Five ways to improve a foundation model's output, in order of **rising cost and complexity** — climb only as far as you need:

| # | Strategy | Training? | Best for | Watch out for |
|---|---|---|---|---|
| 1 | **Prompt engineering** | None | Quick wins — e.g. *"summarize in one page"* | Can't do deep customization |
| 2 | **RAG** | None | Enterprise answers grounded in your latest data (e.g. an HR bot reading policy PDFs) | Retrieval quality & latency on large unstructured data |
| 3 | **Model distillation** | Trains a small model | High-volume, low-latency apps (e.g. a support chatbot) | Slight accuracy trade-off vs. the large teacher |
| 4 | **Fine-tuning** | Trains on labeled data | Matching a specific style/format (e.g. clinical-tone notes) | Needs lots of high-quality labeled data |
| 5 | **Continued pre-training** | Trains on unlabeled data | Deep domain understanding (e.g. niche engineering jargon) | High cost & complexity |

> 🎯 **Rule of thumb:** try the **cheapest rung first** (prompt engineering), and only climb higher if the quality still isn't good enough for your use case.

---

## What's Left (Decisions 12–15)

Three of the original 15 decisions get their **own dedicated sections** later in the course, so they're only named here for now:

- **#12 Security & data protection**
- **#13 Enterprise data management**
- **#14 GenAI Ops & governance**

**#15 Orchestration** is partly covered already (Lambda/EC2/ECS as the compute layer) — the more advanced side (LangChain/LangGraph, Bedrock Agents) comes later in the **RAG and Agentic AI** section.

> That wraps the first pass through all **15 architecture decisions** — from picking a platform (Bedrock vs JumpStart) all the way to model customization. Everything from here builds on this foundation.`,
    },
    {
      id: "rag-business-case",
      title: "RAG — Why You Need It (eLearning Use Case)",
      shortDesc: "The business case, plus the 2 hard limits of a pure foundation model",
      visuals: ["RAGBeforeAfter", "LLMLimitations"],
      content: `## The Business Case

A CEO mandates that **every employee** learn generative AI. The L&D team wants an **e-learning Q&A app**: engineers chat with it to accelerate their learning, and it should answer from the org's **own training PDFs** already sitting in S3.

> Example question: *"Which Bedrock model offers the lowest latency AND is approved in my organization?"* That answer needs **two** documents — a Bedrock user guide (which models are low-latency) and an internal **approved-model list** (every org whitelists only a subset of models for security/cost reasons).

A plain foundation model can't answer that — it has never seen either document.

---

## Why a Pure LLM Falls Short

- **No proprietary knowledge** — foundation models train on generic internet data; they know nothing about your organization's internal docs, policies, or architecture.
- **Training cutoff date** — every base model has a knowledge cutoff (e.g. December 2024). Anything newer, it simply doesn't know.

---

## What RAG Does About It

**Retrieval-Augmented Generation (RAG)** is the process of improving an LLM's output by **supplementing** it with your organization's own data sources at query time — fetched from SharePoint, S3, Confluence, etc.

> This solves **both** problems at once: the answer becomes **organization-specific** AND can reflect information **newer** than the model's training cutoff (since it's pulled live from your documents).`,
    },
    {
      id: "rag-core-concepts",
      title: "RAG Core Concepts: Vectors, Embeddings & Chunking",
      shortDesc: "What vectors are, how documents get chunked & embedded, and how similarity search retrieves answers",
      visuals: ["VectorExplainer", "ChunkingEmbeddingFlow", "SimilaritySearchDemo"],
      content: `## Why Vectors?

A price lookup is easy — store it in a normal (relational) database and query it. But how do you search an **image** for "this watch, in blue"? Or search a 500-page PDF for the answer to *"which vector database is most cost-effective?"* That's not a keyword match — it needs **semantic search**: understanding the *meaning* of the question, not just matching words.

**Vectors** make that possible — a **vector** is a mathematical representation (a list of numbers) of a word, sentence, or document. A toy example with just 2 attributes (is it a fruit? what does it cost?): *"apple"* → \`[1, 4]\`, *"banana"* → \`[1, 2]\` — plot those on a 2D chart and similar items land near each other. Real embeddings use **512–1024 dimensions**, not 2 — capturing vastly more meaning.

---

## Turning a Document Into Vectors

A 500-page PDF is too big to embed as a single vector — so it gets **chunked** first:

1. **Split** the document — by character, token, or code — e.g. page → paragraphs → ~120-character pieces. (Open-source frameworks like **LangChain** help do this split.)
2. Pass each chunk through an **embedding model** (e.g. **Amazon Titan**, **Cohere**) → get a **vector embedding** (512–1024 dimensions).
3. Store every chunk's vector in a **vector store / vector database** — AWS offers several (OpenSearch, S3 Vectors, Pinecone, and more — covered in depth later).

---

## How a Question Gets Answered

1. The user's question is passed through the **same embedding model** → becomes a vector.
2. A **similarity search** finds the closest-matching chunk vectors in the vector store.
3. The top **5–20 chunks** are retrieved and handed to the LLM, which generates the final answer.

Similarity search runs one of two algorithms — **KNN** (k-nearest neighbor — exact, but slower at scale) or **ANN** (approximate nearest neighbor — faster, used by most production vector DBs). You don't need to implement either — **AWS handles this matching behind the scenes.**`,
    },
    {
      id: "rag-10-decisions",
      title: "The 10 RAG Architecture Decisions",
      shortDesc: "The full RAG pipeline, decision by decision — ingestion through production",
      visuals: ["RAGPipelineDecisions"],
      content: `## The Full RAG Pipeline

Building a production-ready RAG app means making **10 architecture decisions**, in three phases:

### Ingestion pipeline (before any user ever asks a question)
1. **Data source & type** — structured (DB/warehouse) or unstructured (PDF/image/video)? Stored in S3, SharePoint, Confluence?
2. **Chunking strategy** — none, fixed-size, semantic, or hierarchical.
3. **Embedding model** — multimodal vs text-only, vector size, language support.
4. **Vector database** — OpenSearch, S3 Vectors, Pinecone, Aurora PostgreSQL, Neptune Analytics...

### Query time (when the user actually asks something)
5. **Retrieval** — similarity search (KNN/ANN) returns the top 5–20 matching chunks.
6. **Re-ranker model** — *(optional)* re-scores and reorders those chunks by relevance before they reach the LLM, instead of sending all of them as-is.
7. **Large language model** — reads the retrieved chunks (the "context") + the user's question, and generates the final answer.

### Ongoing production concerns
8. **RAG evaluation** — Bedrock has a dedicated RAG evaluation capability (beyond plain model evaluation) to score retrieval + generation quality.
9. **Monitoring & observability** — the same CloudWatch approach as Decision #9, applied to your RAG pipeline.
10. **Security, guardrails & responsible AI** — the same protections as any GenAI app, now covering retrieval too.

> Don't worry if some of this feels abstract right now — each decision gets its own deep-dive later in this section. This is just the map.`,
    },
    {
      id: "rag-bedrock-knowledge-bases",
      title: "Amazon Bedrock Knowledge Bases (Hands-On)",
      shortDesc: "AWS's fully-managed RAG service — Retrieve vs Retrieve-and-Generate APIs, and building one end to end",
      visuals: ["RetrieveVsRetrieveGenerate", "KnowledgeBaseConsoleTour"],
      content: `## What Are Bedrock Knowledge Bases?

A **fully managed RAG capability** inside Amazon Bedrock — AWS handles the hosting, scaling, monitoring and patching. You just **configure choices** (data source, chunking, embedding model, vector store, re-ranker, LLM) and the rest is handled for you. All **10 RAG decisions** from the previous topic map directly onto this one console wizard.

---

## Two APIs

| API | What it does | Use it when |
|---|---|---|
| **Retrieve** | Runs the vector search and returns the matching chunks — **no LLM call** | You just want search results, not a generated answer (covers decision steps 1–4) |
| **Retrieve and Generate** | Retrieves chunks **and** sends them + your question to a foundation model for a full answer | You want a complete, conversational response (covers decision steps 1–5) |

---

## Hands-On: Build a Knowledge Base

> 🛠️ **Note:** Knowledge Bases can't be created by the **root user** — create an **IAM user** with admin access first.

1. **S3 bucket** — create one, upload your source PDF(s) (e.g. the Bedrock User Guide, ~200 pages).
2. Console → **Bedrock → Knowledge Bases → Create** → choose **"Knowledge base with vector store"** (for unstructured data like PDFs) → name it → let Bedrock **auto-create the service role**.
3. **Data source** — pick **Amazon S3** (other options: web crawler, Confluence, Salesforce, SharePoint) → browse to your bucket.
4. **Parsing strategy** — **Default parser** (text/Word/Excel/HTML) · **Bedrock Data Automation** (images/audio/video) · **Foundation model as parser** (PDFs with tables/forms/visually rich layouts).
5. **Chunking strategy** — pick one (default works for most cases).
6. **Embedding model** — choose a provider (**Amazon** or **Cohere**) and model, e.g. **Titan Text Embeddings v2** (text-only) or **Nova multimodal embeddings** (text + images).
7. **Vector store** — quick-create **OpenSearch Serverless**, **Amazon S3 Vectors**, **Aurora PostgreSQL**, or **Neptune Analytics**. ⚠️ **OpenSearch bills ~50¢/hour even when idle** — **S3 Vectors is much cheaper**. **Delete the knowledge base when you're done testing.**
8. **Create** → wait a few minutes → click the data source → **Sync** (this generates the embeddings — nothing is searchable until you sync).
9. **Test knowledge base** → choose **Retrieve only** or **Retrieve and generate** (pick a model, e.g. **Nova Pro**) → ask a question → get an answer with **citations** you can click to see the source, plus a **details** view showing every retrieved chunk.

> Other config you'll see in the test panel: **Guardrails** (apply one of yours), **Re-ranking model** (e.g. Cohere Rerank 3.5 — re-scores the retrieved chunks), and prompt/generation settings.`,
    },
  ],
};
