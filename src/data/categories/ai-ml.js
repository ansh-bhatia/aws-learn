// AI & Machine Learning
export default {
  id: "ai-ml",
  label: "AI & Machine Learning",
  icon: "🤖",
  color: "#7B68EE",
  topics: [
    {
      id: "sagemaker",
      title: "SageMaker",
      shortDesc: "Build, train, and deploy ML models",
      content: `## SageMaker

**Amazon SageMaker** is the end-to-end platform to **build, train, tune, and deploy machine-learning models** at scale — covering the full ML lifecycle in one managed service.

- **Notebooks**, built-in algorithms, automatic model tuning, one-click **training & hosting (endpoints)**.
- For data scientists/ML engineers building **custom models** (vs the pre-trained AI services like Rekognition/Comprehend).

> Exam: "**build & train your own ML model**" → **SageMaker**. "ready-made AI (vision/text/speech)" → the specific AI service.`,
    },
    {
      id: "rekognition",
      title: "Rekognition",
      shortDesc: "Image and video analysis",
      content: `## Rekognition

**Amazon Rekognition** is a pre-trained **image & video analysis** (computer vision) service — no ML expertise needed.

- Detects **objects, scenes, faces, text, celebrities**; **facial comparison & analysis**; **content moderation** (unsafe content).

> Exam keyword: "**analyze images/video / detect faces / moderate content**" → **Rekognition**.`,
    },
    {
      id: "bedrock",
      title: "Bedrock",
      shortDesc: "Foundation models as a service",
      content: `## Bedrock

**Amazon Bedrock** is a fully managed service to build **generative AI** apps using **foundation models (FMs)** from Amazon (Titan), Anthropic (Claude), Meta, Mistral, Cohere, AI21 — via a single API, **serverless**.

- **Customize** models with your data (fine-tuning, **RAG / Knowledge Bases**), build **Agents**.
- Your data stays private; not used to train the base models.

> Exam keyword: "**generative AI / foundation models / chatbots / LLMs** without managing infrastructure" → **Bedrock**.`,
    },
    {
      id: "comprehend",
      title: "Comprehend",
      shortDesc: "NLP — extract meaning from text",
      content: `## Comprehend

**Amazon Comprehend** is a pre-trained **NLP** (natural language processing) service that extracts insights from text.

- Detects **sentiment, entities, key phrases, language, PII**, and topics.
- **Comprehend Medical** extracts info from clinical text.

> Exam keyword: "**analyze text / sentiment / extract entities / detect PII in documents**" → **Comprehend**.`,
    },
    {
      id: "polly",
      title: "Polly",
      shortDesc: "Text-to-speech",
      content: `## Polly

**Amazon Polly** is **text-to-speech** — converts written text into lifelike spoken audio in dozens of languages and voices (including neural voices).

- Use cases: voice assistants, IVR, e-learning narration, accessibility.

> Keyword: "**text → speech / generate voice / read text aloud**" → **Polly**. (The reverse — speech → text — is **Transcribe**.)`,
    },
    {
      id: "lex",
      title: "Lex",
      shortDesc: "Build conversational chatbots",
      content: `## Lex

**Amazon Lex** builds **conversational interfaces** — chatbots & voice bots — using the same tech as Alexa (automatic speech recognition + natural language understanding).

- Define **intents, utterances & slots**; integrate with **Lambda** for fulfillment.
- Use cases: customer-support bots, IVR, virtual agents.

> Keyword: "**build a chatbot / voice assistant**" → **Lex** (often Lex + Polly + Lambda together).`,
    },
  ],
};
