// Messaging & Integration
export default {
  id: "messaging",
  label: "Messaging & Integration",
  icon: "📨",
  color: "#FF4F8B",
  topics: [
    {
      id: "sqs",
      title: "SQS – Simple Queue Service",
      shortDesc: "Managed message queuing (async decoupling)",
      visuals: ["SQSConcept", "SQSComponents", "StandardVsFIFO", "QueueConfig", "VisibilityTimeout", "PollingModes", "DLQRedrive", "FIFODedup", "FIFOThroughput", "SQSIntegrations"],
      content: `## SQS – Simple Queue Service

**SQS** is a managed queue for **asynchronous** communication. A producer drops a message and **moves on**; the queue **buffers** it so a slow/down consumer never blocks the producer or loses work. (vs synchronous = API Gateway, where the caller waits.) Solves traffic spikes, reliability, background processing.

---

## Core Components & Pull Model

- **Producer** — sends (pushes) messages, then continues.
- **Queue** — AWS-managed store; doesn't process.
- **Message** — the work/instructions.
- **Consumer** — pulls, processes, then **deletes** messages.

> **Pull-based:** SQS never pushes — consumers **poll**. One message → one consumer at a time; multiple consumers can poll the same queue but won't get the same message.

---

## Standard vs FIFO

| Aspect | Standard | FIFO |
|---|---|---|
| Ordering | Not guaranteed | Strict (FIFO) |
| Delivery | At-least-once (duplicates possible) | Exactly-once |
| Throughput | Virtually unlimited | 300/s (3,000/s batched) |
| Use case | Emails, notifications, logs | Payments, inventory, order states |

> FIFO names must end in \`.fifo\`.

---

## Queue Configuration

- **Message Retention** — 1 min–14 days (default 4 days).
- **Delivery Delay** — hide a new message 0–15 min (e.g. "cancel within 2 minutes").
- **Max Message Size** — 1 KB–1024 KB (large payloads → store in S3, send a reference).

---

## Visibility Timeout

When a consumer pulls a message, SQS makes it **invisible** for the timeout (default 30s, max 12h) so no one else grabs it. Finish + delete in time → done; crash/too slow → it reappears for retry.

> **Rule:** set visibility timeout **greater than** the consumer's processing time, or a second consumer reprocesses it → **duplicate**.

---

## Polling

**Receive Message Wait Time:**
- **Short polling (0s, default)** — returns immediately even if empty → more empty responses, higher cost.
- **Long polling (1–20s)** — waits for a message before returning → fewer empty responses, lower cost. Recommended.

---

## Dead-Letter Queue (DLQ)

A poison message keeps reappearing → infinite retry loop. A **DLQ** is a separate queue where messages land after **maxReceiveCount** failed attempts → main queue stays clean; use the DLQ to debug/replay.

> **Redrive Allow Policy** (set on the DLQ) restricts which source queues may use it (allow all / deny all / by queue).

---

## FIFO: Deduplication & Message Groups

- **Content-Based Deduplication** — ON: AWS hashes the body (identical bodies within 5 min rejected); OFF: producer supplies a **MessageDeduplicationId**.
- **MessageGroupId** — tags messages that belong together; same group = strict order, different groups = parallel. Required for FIFO.
- **Deduplication Scope** — Message Group (within each group; faster, default) vs Queue (across the whole queue; slower — e.g. globally-unique transaction IDs).

## FIFO Throughput

- **Per Queue** — fixed 300/s (3,000/s batched). Predictable; for limited backends.
- **Per Message Group ID** — scales with the number of groups (parallel). Highly scalable; for pipelines that scale end-to-end.

> **High-Throughput FIFO** auto-selects scope = Message Group + limit = Per Message Group ID. No price difference.

---

## Integrations (Exam Scenarios)

Producers: Lambda, EC2, ECS, EKS, **S3, SNS, EventBridge** (these three can't consume). Consumers: Lambda, EC2, ECS, EKS. Manage/monitor: **IAM, CloudWatch, KMS**.

- **EC2 workers + Auto Scaling** — scale the ASG on **queue depth** (\`ApproximateNumberOfMessagesVisible\`), **not CPU** (CPU stays low while a backlog builds).
- **Lambda consumer** — Lambda doesn't poll; **Event Source Mapping** (owned by Lambda) polls SQS in batches & invokes it; scales automatically.
- **S3 → SQS → Lambda** — S3 event notification → SQS → Lambda; SQS buffers spikes, prevents lost tasks, "upload first, process later".
- **Priority** — SQS has no in-queue priority; use **two queues** (paid/free). EC2: poll paid first; Lambda: two functions with **reserved concurrency** (paid 100, free 10).`,
    },
    {
      id: "sns",
      title: "SNS – Simple Notification Service",
      shortDesc: "Pub/sub messaging, fan-out and notifications",
      visuals: ["PubSubModel", "SNSComponents", "StandardVsFIFOTopic", "TopicConfig", "FanOut", "FilterPolicy", "DataProtectionPolicy"],
      content: `## SNS – Simple Notification Service

**SNS** is a managed **publish/subscribe** service: one message is **pushed** instantly to many subscribers. The **publisher** doesn't know the subscribers; subscribers listen to a **topic** → fully decoupled.

> **SNS vs SQS:** SNS **pushes** to many subscribers at once (pub/sub); SQS holds messages for **one** consumer to **pull** later (queue).

---

## Core Components

- **Publisher** — sends an event to a topic (EC2, ECS, Lambda, API Gateway, SDK/CLI). Knows only the topic.
- **Topic** — the broadcast hub you create; distributes each message to all subscribers.
- **Subscriber** — registers to a topic. AWS: Lambda, SQS, Kinesis Firehose. External: HTTP/HTTPS, email, SMS, mobile push.

> A subscriber must **confirm** its subscription (e.g. email link) before receiving messages — stays *Pending* until then.

---

## Standard vs FIFO Topic

| Aspect | Standard | FIFO |
|---|---|---|
| Ordering | Not guaranteed | Strict |
| Delivery | At-least-once | Exactly-once |
| Throughput | Very high | Lower |
| Subscribers | SQS, Lambda, HTTP, email, SMS… | **Only SQS FIFO** |

> Biggest catch: a **FIFO topic** can only fan out to **SQS FIFO queues**. Standard for notifications; FIFO when order matters.

---

## Topic Configuration

- **Encryption** (KMS, at rest), **Access Policy** (resource-based, cross-account), **Delivery Status Logging** (to CloudWatch), **Delivery Retry Policy** (HTTP/S retries & backoff), **Active Tracing** (X-Ray), **Tags**.

---

## Fan-Out (SNS + SQS)

One message → an SNS topic → fanned out to **multiple SQS queues** (and other subscribers). Each queue's consumer processes independently.

> Why SNS→SQS (not SNS direct)? The **queue buffers** each message → durability, retries, DLQs, consumers can be down without losing data. SNS broadcast + SQS reliability. For ordered fan-out: **FIFO topic → FIFO queues**.

---

## Subscription Filter Policy

Without a filter, every subscriber gets every message. A **filter policy** (JSON on the subscription) matches **message attributes** so each subscriber only gets relevant messages (route by type/region/priority) → saves cost & processing.

---

## Data Protection Policy

Scans messages for **sensitive data / PII** (emails, phone numbers, card numbers) and can **audit**, **mask/redact**, or **block** them before delivery — helps meet compliance (GDPR, PCI).`,
    },
    {
      id: "eventbridge",
      title: "EventBridge",
      shortDesc: "Serverless event bus & scheduler",
      visuals: ["EventBridgeConcept", "EventBridgeWorkflow", "EventRule", "EventBridgeScheduler", "EventBridgeCheatSheet"],
      content: `## Amazon EventBridge

A **serverless event bus** for **event-driven architecture** — "when X happens, do Y" — connecting AWS services, your apps, and SaaS apps via events. It's the evolved **CloudWatch Events** (now separate, with SaaS integration, custom buses, schema registry). *Exam focus: AWS-service workflows.*

---

## Core Workflow

**Source → Event → Event Bus → Rule → Target**
- **Event Source** — emits an event (e.g. EC2). AWS services emit automatically (no enable/disable).
- **Event** — a state change in JSON (e.g. \`state: stopped\`); each occurrence is new; max 256 KB.
- **Event Bus** — central hub. Types: **default** (AWS events), **custom** (your apps), **partner** (SaaS).
- **Rule** — filter + decision-maker (event pattern). No rule = no action. One rule → multiple targets.
- **Target** — Lambda, SNS, SQS, Step Functions, Kinesis, ECS… EventBridge needs an **IAM role** to invoke it.

> The **Schema Registry** shows an event's JSON structure to help build rules.

---

## Event Pattern Rule

JSON filter:
- **Simple** — \`{"source":["aws.ec2"]}\` matches any EC2 event.
- **Detailed** — also match \`detail-type\`, \`state\`, specific \`instance-id\` for precise triggering.

---

## EventBridge Scheduler

Time-based (cron in the cloud) — the modern replacement for legacy schedule rules:
- **Rate** — fixed interval (\`rate(5 minutes)\`).
- **Cron** — specific times (every day 10 PM).
- **One-time** — run once at an exact date/time (new).

Targets: Lambda, EC2 start/stop, Step Functions, SNS, SQS, API calls. Needs an IAM role trusting \`scheduler.amazonaws.com\`. Use cases: cost optimization, maintenance, ETL, reminders.

---

## Exam Cheat Sheet

- *event happens → action, no polling, serverless, real-time* → **EventBridge**
- *route/filter by JSON content* → **EventBridge Rule**
- *run job at a time / cron / stop EC2 at night* → **EventBridge Scheduler**
- *content/JSON filtering, advanced routing* → **EventBridge** (vs **SNS** = broadcast/fan-out)
- *understand event structure* → **Schema Registry**`,
    },
    {
      id: "step-functions-concept",
      title: "AWS Step Functions – Orchestrating Multiple Lambdas Into a Sequenced Workflow",
      shortDesc: "Worked through an e-commerce payment→inventory→email chain — why one giant function with nested if/else doesn't scale as well as a visual state machine",
      visuals: [],
      content: `## The Problem: Orchestrating Multiple Lambda Functions

> **Real workflows often need multiple Lambda functions to run in a specific, conditional sequence** — not run once each independently, but run **one after another, based on each step's success or failure.**

**Worked example — an e-commerce order flow**:
1. **Lambda 1** — verify payment status.
2. **If payment succeeds** → **Lambda 2** — verify inventory availability.
3. **If inventory is available** → **Lambda 3** — send a confirmation email.
4. **If payment FAILS instead** → a different function (Lambda X) runs, sending the customer a "payment unsuccessful, retry here" email.

⚠️ **The challenge**: how do you connect these functions into a proper flow, guarantee Lambda 2 only runs after Lambda 1 succeeds, and branch to a different path entirely on failure — all without writing one giant, deeply-nested function?

---

## What Step Functions Actually Is

> **AWS Step Functions is a serverless service for connecting and managing multiple tasks in a defined flow** — built as a **state machine**, a step-by-step visual diagram where each step performs a specific action (checking payment, updating an order, sending an email). It controls execution order, makes branching decisions based on each step's result, and handles failure/retry logic — **all without custom orchestration code.**

⚠️ **Step Functions is not limited to Lambda** — it can coordinate Lambda, SQS, SNS, and many other AWS services within the same workflow.

---

## Why Not Just Write One Big Function?

> **Technically possible, but not recommended**: cramming payment-check → inventory-check → email-send logic into a single Lambda function means deeply nested if/else conditions, increasingly complex code, and a violation of clean microservices-style separation of concerns. **Step Functions lets each concern stay its own small function, while the orchestration logic (order, branching, retries) lives declaratively in the state machine itself**, not buried in nested conditionals.

---

## Building a State Machine

> **A state machine can be defined two ways: visually (drag-and-drop GUI) or in code (Amazon States Language — JSON or YAML).** Both produce the same underlying workflow; the GUI is simply a visual editor over the same JSON/YAML definition.

**Basic shape of the e-commerce example**: Start → invoke "check payment" Lambda → (if successful) invoke "prepare order" Lambda → (if inventory available) invoke "send email" Lambda → End. Each arrow in the visual editor represents a transition, and branching logic (different paths based on a step's output) is expressed directly in the diagram.

---

## Five Advantages of Step Functions

1. **Connects multiple services** — Lambda, SQS, SNS, and others, within one coordinated flow.
2. **Reduces complex code** — flow logic lives in the state machine, not as nested if/else inside one function.
3. **Visual workflow** — easy to monitor and debug, since the actual execution path is visible as a diagram, not buried in code.
4. **Built-in error handling and retry support** — without hand-writing retry logic inside each function.
5. **Good for automation and microservices communication** — a natural fit for coordinating several small, single-purpose functions rather than one monolithic one.

---

## Exam Framing

> "Coordinate multiple Lambda functions (or other AWS services) with retries, conditional branching, and sequencing, without writing custom orchestration logic" → **Step Functions.** Contrast this against EventBridge, which routes individual events to targets but does not manage multi-step, conditional, stateful workflows the way Step Functions does.
`,
    },
    {
      id: "step-functions-lab",
      title: "Step Functions Lab – Sequencing Three EC2-Starting Lambda Functions With Wait States",
      shortDesc: "Ad server → wait 2 min → DB server → wait 2 min → app server — built entirely with drag-and-drop, no custom orchestration code",
      visuals: [],
      content: `## The Scenario

> **Three EC2 instances — an ad server, a database server, and an application server — each have a dedicated Lambda function to start them.** ⚠️ **System administration rules require starting them in a strict sequence**: ad server first, then (after it's ready) the database server, then (after that) the application server — with a wait interval between each step.

---

## Step 1 — Provision the Environment

> The lab uses a **CloudFormation template** to provision all three EC2 instances and their three corresponding Lambda functions in one shot — avoiding the time cost of manually building each piece, so the focus stays on Step Functions itself. Deploying the stack (**Quick create stack → Acknowledge → Create**) takes a few minutes and produces all three instances (initially stopped) plus their three start-functions, ready to be orchestrated.

---

## Step 2 — Build the State Machine

1. **Step Functions → Create state machine.** Choose **Standard** (vs Express — covered in depth in the Step Function Types topic).
2. **Add a Lambda-invoke step** — name it (e.g. "Start Ad Server"), and select the corresponding Lambda function from the list.
3. **Add a Wait step** — name it, and set the duration (e.g. **120 seconds / 2 minutes**) — this pauses the state machine's execution between steps.
4. **Repeat**: add a second Lambda-invoke step ("Start DB Server"), another Wait step (another 2 minutes), then a final Lambda-invoke step ("Start App Server") with no further wait, going straight to End.

**The resulting sequence**: Start → Start Ad Server → Wait (2 min) → Start DB Server → Wait (2 min) → Start App Server → End.

5. Click **Create** to save the state machine.

---

## Step 3 — Execute and Verify

> **Click Execute → Start execution.** The state machine begins running through its defined steps, and its progress can be watched live in the console:

- The **ad server Lambda invokes first** — checking the EC2 console confirms the ad server instance transitions to Running.
- The state machine then enters the **first Wait state**, visibly counting down the configured duration before proceeding.
- Once the wait completes, the **DB server Lambda invokes** — again verifiable directly in the EC2 console.
- The **second Wait state** runs, then the **app server Lambda invokes** last, completing the full sequence.

⚠️ **This entire orchestration — strict order, timed waits between steps — required zero custom code beyond the individual Lambda functions themselves**; the sequencing and waiting logic lives entirely in the state machine definition.

---

## Cleanup

> Two things need deleting after the lab: the **CloudFormation stack** (removes the EC2 instances and Lambda functions automatically) and the **state machine itself** (created manually, so it must be deleted manually — Step Functions → State machines → select → Delete).

---

## Exam Framing

> This lab demonstrates the practical alternative to writing one large orchestration function with manual sleep/wait calls and nested conditionals: **a Wait state and a Lambda-invoke step, chained together visually**, replace what would otherwise be hand-written sequencing and timing logic. Triggers for a state machine work the same way as for a standalone Lambda function — API Gateway, EventBridge schedule, or manual execution are all valid entry points.
`,
    },
    {
      id: "step-functions-standard-vs-express",
      title: "Step Functions: Standard vs Express Workflows – Seven Points of Comparison",
      shortDesc: "Complex multi-day order-to-shipment flows need Standard; a 2-second form submission needs Express — the choice comes down to duration, volume, and cost model",
      visuals: [],
      content: `## The Core Decision: Use Case

> **The single most deciding factor between Standard and Express is the shape of the workflow itself.** ⚠️ **Complex, long-running workflows** (e.g. an e-commerce order-to-shipment-delivery flow spanning 6–7 days, with many steps) → **Standard.** ⚠️ **Short, simple, high-speed workflows** (e.g. a mobile app form submission that stores data in a database within 2–3 seconds) → **Express.**

---

## Seven Points of Comparison

**1. Maximum duration** — Standard: up to **1 year** per execution. Express: capped at **5 minutes.**

**2. Execution start rate** — Standard: up to **2,000 workflow starts per second.** Express: up to **100,000 workflow starts per second** — dramatically higher, matching its use case of many small, fast, high-volume executions.

**3. Pricing model** — ⚠️ **Standard bills per state transition**: each step in the workflow is a "transition," and AWS charges per 1,000 transitions (e.g. a 3-step workflow run 1,000 times = 3,000 transitions billed). ⚠️ **Express bills per request, duration, AND memory usage** — a more granular, Lambda-like cost model:
   - **Request**: each workflow start (even from the console) counts as one request.
   - **Duration**: from start to end/failure, ⚠️ **rounded up to the nearest 100ms** (e.g. 350ms actual duration bills as 400ms).
   - **Memory**: billed in **64MB chunks**, even though memory isn't explicitly assigned — AWS tracks actual consumption and rounds up (e.g. 90MB actual usage bills as 120MB).

**4. Execution history** — Standard: full execution history is **stored for 90 days** directly within Step Functions. Express: ⚠️ **no execution history stored within Step Functions itself** — logs must be explicitly sent to **CloudWatch Logs** if that visibility is needed.

**5. Retry and error handling** — Standard: extensive built-in support (timeouts, retries, multiple error-handling patterns) — appropriate given how complex Standard workflows tend to be. Express: more limited support, adequate for simple flows but not built for the same depth of failure-handling logic.

**6. Tracing and debugging** — Standard: excellent, detailed step-by-step tracking out of the box. Express: basic by default, improved significantly once CloudWatch logging is explicitly enabled.

---

## Exam Framing

> "Long-running (up to a year), complex, low-to-moderate-volume workflow needing detailed execution history and rich error handling" → **Standard.** "Short (under 5 minutes), extremely high-volume workflow where per-request/duration/memory billing and 100,000 starts/sec throughput matter most" → **Express.** ⚠️ **The pricing-model contrast is the most distinctive testable fact** — Standard's simple per-transition billing vs Express's Lambda-like per-request/duration/memory billing.
`,
    },
    {
      id: "kinesis",
      title: "Kinesis",
      shortDesc: "Real-time data streaming",
      visuals: ["BatchVsRealtime", "KinesisFamily", "KinesisTerminology", "StreamVsFirehose"],
      content: `## Amazon Kinesis

### Data Processing: Batch vs Real-Time

- **Batch** — collect data, process later in one go. Slower but easy & cheap. e.g. **NEFT** (~30-min cycles); reports, billing, salary.
- **Real-time** — process each item instantly as it arrives. Fast but complex & costly. e.g. **UPI** (instant); payments, tracking, alerts.

> Prefer batch when possible; use real-time when you need instant results — Kinesis makes it easy.

---

## Kinesis Family

Umbrella for real-time streaming:
- **Data Streams** — collect & store streaming data for consumers to read (core ingestion).
- **Data Firehose** — process & deliver to destinations (S3, Redshift, OpenSearch, Splunk) — no code.
- **Managed Apache Flink** — process & analyze streams (formerly Kinesis Data Analytics).

---

## Data Streams Terminology

**Producer → Stream (shards) → Consumer**
- **Producer** — sends data (e.g. Uber driver app).
- **Record** — one piece of data (JSON); one update = one record.
- **Stream** — the live pipeline you create.
- **Shard** — a "lane"; more shards = more throughput (set at creation).
- **Sequence Number** — unique number Kinesis auto-assigns for ordering.
- **Consumer** — reads & processes (live tracking, fare, fraud, dashboards).

> Highway = stream, lane = shard, one cab update = record.

---

## Data Streams vs Firehose

| Aspect | Data Streams | Firehose |
|---|---|---|
| Purpose | Collect & store | Deliver to destinations |
| Code | Write your own consumer | No code, pre-configured |
| Destinations | Any | S3, Redshift, OpenSearch, Splunk |
| Management | You manage shards | Fully managed |

> Flow: **Producer → Stream → Firehose → S3/Redshift**. **Firehose** = a no-code mediator from a stream to a destination.

> **Interface VPC Endpoint** (PrivateLink) keeps producer↔Kinesis traffic on AWS — no internet/NAT/IGW. (S3 & DynamoDB use gateway endpoints; Kinesis uses an interface endpoint.)`,
    },
  ],
};
