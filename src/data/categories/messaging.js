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
      id: "step-functions",
      title: "Step Functions",
      shortDesc: "Coordinate distributed applications as workflows",
      content: `## Step Functions

**AWS Step Functions** orchestrates **serverless workflows** as a visual **state machine** — coordinating Lambda, ECS, SNS, SQS, DynamoDB and more with built-in **error handling, retries, branching, parallelism & waits**.

- Defined in **Amazon States Language** (JSON); you see the flow as a diagram.
- **Standard** workflows (long-running, up to 1 year, exactly-once) vs **Express** (high-volume, short, cheap).
- Use cases: **order processing, ETL pipelines, ML workflows, approval flows, saga transactions**.

> Exam: "coordinate **multiple Lambdas / steps with retries & sequencing**" → **Step Functions** (vs EventBridge = routing single events).`,
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
