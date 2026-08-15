// Messaging & Integration
export default {
  id: "messaging",
  label: "Messaging & Integration",
  icon: "📨",
  color: "#FF4F8B",
  topics: [
    {
      id: "kinesis-data-stream-vs-firehose-and-vpc-endpoint",
      title: "Kinesis Data Stream vs Firehose – Write Your Own Consumer, or Let Firehose Deliver It For You",
      shortDesc: "Firehose is a pre-built mediator that pipes data straight to S3, Redshift, Elasticsearch, or Splunk with zero consumer code — reach for a raw Data Stream only when Firehose's fixed destination list doesn't cover what you actually need",
      visuals: [],
      content: `## ⚠️ The Core Distinction: Who Writes the Consumer Code?

> **Kinesis Data Firehose can deliver stream data directly to a fixed set of destinations — Amazon S3, Redshift, OpenSearch/Elasticsearch, and even third-party tools like Splunk — with NO custom consumer application required.** ⚠️ **To achieve the same delivery using a raw Kinesis Data Stream instead, you would have to write your own application that consumes from the stream and connects to the destination yourself.** ⚠️ **Firehose is essentially a pre-configured streaming application with a fixed set of destination options — the moment a requirement falls outside those options, custom code becomes necessary, and that's exactly when a raw Data Stream (with your own consumer) is the right tool instead of Firehose.**

---

## Kinesis VPC Interface Endpoint (Exam-Relevant Detail)

> **An Interface VPC Endpoint keeps traffic between a VPC and Kinesis Data Streams entirely off the public internet** — relevant whenever the producer (e.g. an EC2 instance) lives inside a VPC and should not need to reach Kinesis over the internet. ⚠️ **Unlike S3 and DynamoDB, which use a VPC GATEWAY endpoint, Kinesis uses a VPC INTERFACE endpoint** — powered by AWS PrivateLink, using an Elastic Network Interface with a private IP inside the VPC. No Internet Gateway, NAT Gateway, VPN, or Direct Connect is required.

---

## Exam Framing

> "Deliver streaming data to S3/Redshift/Elasticsearch/Splunk without writing and maintaining a custom consumer application" → **Kinesis Data Firehose.** "The delivery destination isn't one Firehose supports, or custom processing logic is required before delivery" → **raw Kinesis Data Stream with your own consumer application.** ⚠️ **"Keep Kinesis traffic off the public internet from within a VPC" → Interface VPC Endpoint (PrivateLink) — remember this is INTERFACE, not the GATEWAY type used by S3/DynamoDB, a common point of confusion.**
`,
    },
    {
      id: "amazon-swf-simple-workflow-service",
      title: "Amazon SWF – A Code-Driven, Polling-Based Workflow Coordinator (Not a GUI Like Step Functions)",
      shortDesc: "SWF never executes your code and never contains the workflow logic itself — deciders and activity workers poll it for tasks, run them, and report results back, with SWF purely tracking state and coordinating what happens next",
      visuals: [],
      content: `## ⚠️ What SWF Actually Does — and Explicitly Does NOT Do

> **Amazon SWF (Simple Workflow Service) is a web service for coordinating work across distributed application components** — a central management tool providing task coordination and state tracking. ⚠️ **Critical fact: SWF does NOT execute any code, and does NOT contain the workflow logic itself — it is purely a coordinator.** Your actual code always runs elsewhere (EC2, on-premises, containers — SWF doesn't care where).

### The Polling Model

> **SWF is fundamentally polling-based**: your code polls the SWF API for tasks, waits in a queue, receives a task, executes it, and sends the result back to SWF. ⚠️ **SWF then issues the NEXT task based on that result, and keeps a full history of the workflow — this history is what SWF calls "state."**

---

## Core Building Blocks

> **Domain** — the first thing you create; an isolated container for a set of workflow types, executions, and task lists (useful for separating multiple large projects within one account). **Workers** — the actual software performing work, split into two roles: ⚠️ **Decider — makes decisions based on state history and determines the next activity task (or workflow completion); corresponds to a DIAMOND box in a flowchart.** ⚠️ **Activity — performs the actual task itself (e.g. processing a payment); corresponds to an OVAL box in a flowchart.** **Workflow Starter** — any application that initiates a workflow execution (e.g. a website where a customer places an order, or a rep's internal tool placing an order on a customer's behalf); corresponds to a RECTANGLE box.

### Task Types

> Three kinds of task SWF can hand out to workers: an **activity task** (for an activity worker), a **decision task** (for a decider), or a **Lambda task** (a special activity task that can be executed directly via an AWS Lambda function).

---

## ⚠️ SWF vs Step Functions: Code-Driven vs Visual

> **Step Functions provides a graphical state-machine builder — you define the workflow visually, without writing orchestration code yourself** (see the separate Step Functions topic). ⚠️ **SWF is the older, manual alternative: AWS explicitly does NOT let you draw a workflow or state machine in SWF — everything is coordinated through your own code polling the SWF API.** This manual approach is more work, but gives a coder more direct flexibility over edge cases than a purely graphical tool.

---

## Exam Framing

> ⚠️ **This is explicitly flagged as low priority for the exam — SWF questions are rare, but a Solutions Architect should still recognize what it is.** "A polling-based, code-driven workflow coordinator that tracks state but never executes logic itself, with decider and activity worker roles" → **SWF.** "A visual, graphical state-machine service for orchestrating multiple Lambda/AWS-service steps without writing custom orchestration code" → **Step Functions** — the modern, GUI-driven alternative that has largely superseded SWF for new workflows.
`,
    },
    {
      id: "kinesis-data-streams-terminology-producer-shard-consumer",
      title: "Kinesis Data Streams Terminology – Shards as Highway Lanes for Live Uber Cab Data",
      shortDesc: "One shard is one lane on the highway — a handful of cabs sending updates fits fine in one lane, but thousands of cabs streaming location, speed, and trip status need multiple shards or the traffic simply can't move",
      visuals: [],
      content: `## Producer: The System That Generates and Sends Data

> **A producer is the application that generates data and sends it to Kinesis as a stream of records.** Worked example: the **Uber driver app** continuously sends live updates — location, trip started, trip completed, payment received — making it the producer.

## Record: One Single Piece of Data

> **A record is one small unit of data sent to Kinesis — one event, one message, typically in JSON format.** Worked example: **one cab location update = one record.** If a driver app sends a location update every 5 seconds, each one becomes a brand-new record.

## Stream: The Live Pipeline Records Flow Into

> **A stream is the main live data pipeline you create inside Kinesis — once created, it's ready to continuously receive records.** ⚠️ **Think of a stream like a live road where data moves continuously** — this is exactly the pipeline that receives the Uber driver app's record flow.

---

## ⚠️ Shard: One Lane on the Data Stream's Highway

> **A shard is a small partition of a Kinesis Data Stream — think of the stream as a highway and each shard as one lane.** ⚠️ **More lanes (shards) means the highway (stream) can handle more traffic (records) — a handful of cabs sending occasional updates might fit fine in a single shard, but thousands of cabs continuously streaming location, speed, and trip status need MULTIPLE shards, configured at stream creation, or the traffic simply can't move smoothly.** (The exact read/write capacity per shard is deferred to hands-on practice, not covered at this conceptual stage.)

---

## Sequence Number: An Auto-Generated Ordering ID

> **Every record gets a unique sequence number, assigned automatically BY KINESIS — never by the producer.** ⚠️ **This exists so a consumer reading a continuous real-time stream can tell which record arrived first, second, third**, even though it's purely an internal Kinesis mechanic the producer never has to think about.

---

## Consumer: The System That Reads and Acts on the Stream

> **A consumer is an application or service that reads data from the stream and processes it — producers send, Kinesis temporarily stores, consumers read.** ⚠️ **Multiple independent consumers can read the SAME stream for entirely different purposes** — worked example: live-tracking (shows cab movement on the rider's map), fare calculation, customer notifications, an analytics dashboard, and fraud detection could all consume the SAME Uber driver-update stream simultaneously, each for its own purpose.

---

## Exam Framing

> "A live stream needs to scale to handle a much higher volume of concurrent records" → **add more shards** — each shard is a fixed-capacity lane, and total stream throughput scales with shard count. ⚠️ **Remember: sequence numbers are Kinesis-generated, never producer-supplied** — this is the opposite of SQS FIFO, where the deduplication ID/message group ID are producer-supplied.
`,
    },
    {
      id: "kinesis-hands-on-lab-data-stream-firehose-s3",
      title: "Kinesis Hands-On Lab – Data Stream to Firehose to S3, With Cognito-Authenticated Test Data",
      shortDesc: "A public Kinesis Data Generator tool (auth handled by a one-click Cognito CloudFormation template) floods the stream with records — then a genuinely visible lag appears before Firehose actually lands the data in S3",
      visuals: [],
      content: `## The Pipeline Being Built: Stream → Firehose → S3

> **Architecture: an application generates streaming data → sends it to a Kinesis Data Stream → a Kinesis Data Firehose reads from that stream → delivers it into an S3 bucket.** Setup order: (1) create the Data Stream, (2) create the Firehose delivery stream (source = the Data Stream, destination = an S3 bucket), (3) generate test data to prove the pipeline actually works.

---

## ⚠️ Generating Test Data: A Public Tool, Authenticated via Cognito

> **AWS provides a public GitHub-hosted "Kinesis Data Generator" web tool that acts as a fake producer, letting you push simulated records into the stream without writing any code.** ⚠️ **The tool requires authentication, provisioned via a ONE-CLICK CloudFormation template that creates a Cognito user (username/password) — no prior Cognito knowledge is needed, just following the documented steps.** Once signed in, select the target region and stream, choose a constant record rate (e.g. 100 records/second), and start sending.

---

## ⚠️ The Delivery Lag: "Real-Time" Doesn't Mean Instant at Every Hop

> **After sending ~1,000 test records: the Data Stream itself shows the records arriving almost immediately (visible in its monitoring metrics) — but Firehose's "data read from Kinesis" metric, and the destination S3 bucket, both show ZERO for a noticeable stretch of time.** ⚠️ **This is expected, not a failure — Firehose buffers and batches before writing to S3, so there's a genuine, visible delay between "the stream has the data" and "the data has landed in S3," even though the overall pipeline is still considered real-time streaming.** Waiting resolves it: eventually a dated folder structure appears in the bucket, and downloading a delivered file shows the individual JSON records exactly as generated.

---

## Exam Framing

> "Streaming data must be delivered to S3 without writing and maintaining custom consumer code" → **Kinesis Data Stream + Kinesis Data Firehose**, with Firehose handling the actual delivery. ⚠️ **A practical exam-adjacent trap this lab exposes: don't assume "real-time" means zero latency at every stage of a streaming pipeline — Firehose specifically introduces a buffering delay between the stream and the final destination, which is normal, expected behavior, not a misconfiguration.**
`,
    },
    {
      id: "data-processing-batch-vs-real-time",
      title: "Batch vs Real-Time Processing – NEFT's 30-Minute Cycle vs UPI's Instant Transfer",
      shortDesc: "It's never a question of which is 'better' — batch is the deliberate default because it's cheaper and simpler, and real-time is reached for only when the use case genuinely can't tolerate any delay",
      visuals: [],
      content: `## What Data Processing Actually Means

> **Data processing means taking raw data and turning it into a useful result** — data is not inherently useful the moment it's generated; a system has to work on it first. ⚠️ **Two fundamentally different approaches: batch processing and real-time processing** — the choice between them is a requirements question, never a "good vs bad" one.

---

## Batch Processing: Collect First, Process Later

> **Data is collected over a period of time and processed later, all at once, in a batch.** ⚠️ **Worked example — India's NEFT bank transfer**: a transaction is NOT processed instantly; NEFT batches all pending transactions together and executes them as one job roughly every 30 minutes. **The system deliberately waits and accumulates before acting.**

## Real-Time Processing: Act the Instant Data Arrives

> **Data is processed the moment it's generated — the system never waits to collect a batch first.** ⚠️ **Worked example — India's UPI QR-code payment**: scanning and paying transfers money and updates status INSTANTLY, with zero batching or waiting. Each transaction is handled the moment it happens.

---

## The 8-Point Trade-Off (Why Batch Is Still the Common Default)

| Dimension | Batch | Real-Time |
|---|---|---|
| Operational burden | Flexible, easier to run | Demanding — needs immediate action |
| Data handling | Wait and group | Continuous flow |
| Speed | Slow, delay acceptable | Fast, no delay allowed |
| Build complexity | Easy, simple logic | Hard, genuinely complex system |
| Timing flexibility | Can adjust timing freely | Low flexibility, needs instant response |
| Infrastructure | Simple, basic setup | Complex, advanced setup required |
| Cost | Low | High |
| Typical use cases | Reports, billing, monthly salary runs | Payments, live tracking, fraud/security alerts |

---

## ⚠️ The Decision Rule: Default to Batch, Reach for Real-Time Only When Forced To

> **Always consider batch processing FIRST — it's cheaper, simpler, and easier to operate.** ⚠️ **Only move to real-time processing when the use case genuinely cannot tolerate any delay** — e.g. fraud alerts, live payment status, real-time tracking — situations where waiting even a few minutes defeats the entire purpose. Real-time systems are powerful but genuinely difficult and expensive to build and operate correctly.

---

## Exam Framing

> "A report/billing/monthly-salary requirement, with no urgency mentioned" → **batch processing is the default, more cost-effective choice.** "An alert, live tracking, or fraud-detection requirement, where any delay defeats the purpose" → **real-time processing is required, despite its higher cost and complexity.** ⚠️ **This distinction is the entire reason Amazon Kinesis exists — it's AWS's answer to how to implement real-time processing without building the complex infrastructure from scratch.**
`,
    },
    {
      id: "amazon-kinesis-service-family-and-data-streams-intro",
      title: "Amazon Kinesis – The Real-Time Data Family (Data Streams, Firehose, Managed Flink)",
      shortDesc: "Worked through Uber's live ride-tracking use case — a driver app continuously producing location updates that a Kinesis Data Stream temporarily holds so multiple backend systems can each read and react in real time",
      visuals: [],
      content: `## Kinesis Is a Family of Three Services, Not One

> ⚠️ **Amazon Kinesis is an umbrella covering three distinct services, used to collect, process, and analyze real-time streaming data at any scale**: **Kinesis Data Streams** — collects and STORES the data stream in real time; **Kinesis Data Firehose** — PROCESSES and DELIVERS the data (typically to a destination like S3); **Managed Service for Apache Flink** — PROCESSES and ANALYZES streaming data. Each has a distinct role in the pipeline — store, deliver, or analyze.

---

## Kinesis Data Streams: A Live Data Pipeline

> **Data continuously arrives from many sources — apps, websites, logs, devices — and Kinesis Data Streams temporarily stores it so consumer applications can read and process it in real time.**

### Worked Example: Booking an Uber Ride

> When a rider taps "Book Ride," many things update live on screen: nearby drivers appear, one gets assigned, the driver's car icon moves on the map in real time. ⚠️ **Behind the scenes, this requires a system that continuously collects and temporarily holds live ride data (driver location, status) so MULTIPLE independent applications can each read and react to it** — this is exactly the role a service like Kinesis Data Streams plays (the instructor is explicit that this illustrates the pattern, not a claim about Uber's actual implementation).

---

## Exam Framing

> "Real-time streaming data needs to be collected and temporarily stored so multiple consumers can process it independently" → **Kinesis Data Streams.** "Streaming data needs to be delivered to a destination like S3/Redshift without writing custom consumer code" → **Kinesis Data Firehose** (covered separately). ⚠️ **Remember Kinesis is a 3-service family — Data Streams (store), Firehose (deliver), Managed Apache Flink (analyze) — a question naming a specific need (storage vs. delivery vs. analysis) should point to the specific matching service, not "Kinesis" generically.**
`,
    },
    {
      id: "eventbridge-hands-on-lab-ec2-rule-sns",
      title: "EventBridge Hands-On Lab – From 'Every EC2 Event' to One Precisely Filtered Notification",
      shortDesc: "The first rule (all EC2 events, no filter) fires an email for every single state transition — running→stopping→stopped→pending→running — before narrowing to a specific instance ID and state cuts that down to exactly one",
      visuals: [],
      content: `## Setup: SNS Topic as the Target, Before Any Rule Exists

> Create a Standard SNS topic, subscribe an email address, and confirm the subscription — this becomes the rule's target. ⚠️ **Two running EC2 instances already exist and are already sending state-change events to the default Event Bus automatically — but nothing happens yet, because no rule has been configured.** This directly proves the mega-topic's core fact: no rule means no action, regardless of how many events flow through the bus.

---

## ⚠️ Attempt 1: An Unfiltered Rule Fires on EVERY State Change

> Create a rule on the default bus, source = AWS services → EC2, event type = "All Events." ⚠️ **Result: stopping ONE instance produces multiple separate emails — one for running→stopping, another for stopping→stopped — and the SAME flood happens again on restart (→pending→running).** With two instances in play, every state transition on EITHER one triggers its own notification, quickly becoming noisy and impractical.

---

## Attempt 2: Narrowing to a Specific Instance ID and State

> Edit the rule: switch the event type from "All Events" to **EC2 Instance State-change Notification**, then add two conditions — the specific **state** (e.g. "stopped" only, not "stopping" or "pending") AND a specific **instance ID** (not "any EC2 instance"). ⚠️ **Result: stopping the targeted instance now produces exactly ONE email, only for that instance, only for the stop state — starting it back up, or stopping the OTHER (unfiltered) instance, produces zero notifications at all.**

---

## Exam Framing

> "EventBridge notifications are firing far more often than expected, for every minor state change" → **the rule's event pattern is too broad (e.g. "All Events" instead of a specific detail-type + state + resource ID)** — narrow the JSON event pattern to the exact state and resource that should trigger the target. ⚠️ **This lab is the concrete proof behind the abstract "simple vs. detailed filtering" distinction: simple filtering (source only) fires on every event from that source; detailed filtering (source + detail-type + specific field values like state/instance-id) is what actually achieves precise, low-noise triggering.**
`,
    },
    {
      id: "eventbridge-scheduler-hands-on-lab-custom-trust-policy",
      title: "EventBridge Scheduler Hands-On Lab – The IAM Custom Trust Policy Gotcha",
      shortDesc: "The standard 'create role → choose AWS service' wizard doesn't even list EventBridge Scheduler as an option — it has to be created with a manually-written custom trust policy naming scheduler.amazonaws.com",
      visuals: [],
      content: `## ⚠️ The Setup Gotcha: EventBridge Scheduler Isn't in the Standard IAM Service List

> **Without an IAM role, EventBridge Scheduler cannot perform its target action (e.g. stopping an EC2 instance) at all.** ⚠️ **The normal IAM role-creation flow — "Create Role" → "AWS service" → pick from the dropdown — does NOT list EventBridge Scheduler as an option; only "EventBridge (API destinations)" appears, which is a different feature entirely.** The fix: choose **Custom Trust Policy** instead, and manually supply JSON naming \`scheduler.amazonaws.com\` as the trusted principal (sourced directly from AWS documentation). Attach a permission policy scoped to the target action (e.g. EC2 full access for the demo, ideally scoped tighter in production).

---

## Building the Schedule

> Choose **One-time** or **Recurring** — for recurring, pick **Cron-based** (specific times, same expression syntax as Linux cron) or **Rate-based** (fixed interval, e.g. "every 2 minutes"). ⚠️ **A Flexible Time Window can be configured so that if the exact trigger moment is missed, the task still runs within a grace window (e.g. 5 minutes) instead of being skipped entirely.**

### Target Configuration

> Target = "All APIs" → EC2 → the specific API action (e.g. **StopInstances**) → the specific instance ID. ⚠️ **The IAM role created earlier must be attached here — this is what actually authorizes the Scheduler to call StopInstances on your behalf.** Optional: a DLQ for failed schedule invocations, and an "action after completion" setting (e.g. none, or auto-delete the schedule once done).

> **Verified live in the lab**: with a 2-minute rate schedule targeting a running EC2 instance's stop action, the instance genuinely transitions to Stopped within that window — proof the role, target, and schedule were all wired correctly.

---

## Exam Framing

> "A scheduled task must run an AWS API action (like stopping an EC2 instance) at a fixed time or interval" → **EventBridge Scheduler**, NOT the legacy EventBridge Schedule Rule (which lacks one-time execution and has more limited retry behavior). ⚠️ **The practical trap worth remembering from this lab: EventBridge Scheduler's IAM role must be created via Custom Trust Policy naming scheduler.amazonaws.com — it will not appear as a selectable AWS service in the standard role-creation wizard.**
`,
    },
    {
      id: "sns-hands-on-lab-topic-subscriber-publisher-chain",
      title: "SNS Hands-On Lab – Building the Full Publisher → Topic → Subscriber Chain",
      shortDesc: "A new email subscriber sits in Pending until the confirmation link is clicked — then S3 itself becomes the publisher, proving a real AWS service (not just a manual test click) can trigger the whole broadcast chain end to end",
      visuals: [],
      content: `## Step 1: Create the Topic, Then Add a Subscriber

> Create a Standard topic with a display name, default options otherwise. ⚠️ **A brand-new subscriber's status starts as Pending — SNS will NOT deliver anything to it until the subscription is explicitly confirmed.** For an email subscriber, SNS sends a confirmation email immediately after the subscription is created; only after clicking "Confirm subscription" does the status flip to confirmed and the subscriber start actually receiving messages.

---

## Step 2: Manually Test With Publish Message

> Once confirmed, the console's own **"Publish Message"** button lets you send a test message (subject + body) directly from the topic itself — every confirmed subscriber receives it. ⚠️ **This is purely a testing facility — in a real architecture, an actual AWS service or application plays the Publisher role, not a manual console click.**

---

## Step 3: Give the Topic a Real Publisher — S3 Event Notification

> ⚠️ **An S3 bucket can be configured as a genuine publisher via its own Event Notification settings** — under bucket properties, create an event notification for "All object create events," and choose the SNS topic as the destination (instead of Lambda or SQS). ⚠️ **If publisher and topic are in the SAME AWS account, the topic can be selected directly from a dropdown; a CROSS-account setup instead requires manually specifying the topic ARN plus a topic access policy explicitly permitting that external account.**

---

## Step 4: Prove the Full Chain End to End

> Uploading a file to the bucket → S3 fires the event notification → SNS topic broadcasts → the confirmed email subscriber receives a real Amazon S3 notification email containing the bucket name, object key, and file size. ⚠️ **This is the complete Publisher (S3) → Topic (SNS) → Subscriber (email) chain working with a genuine AWS service as the publisher, not just the manual test button from Step 2.**

---

## Exam Framing

> "A new SNS subscriber isn't receiving any messages" → **check whether the subscription is still Pending** — it must be explicitly confirmed (e.g. via the email confirmation link) before SNS will deliver anything to it. ⚠️ **S3 (and many other AWS services) can publish directly to an SNS topic via its own event-notification configuration — no custom application code required to act as the "publisher."**
`,
    },
    {
      id: "sns-full-exam-cheat-sheet",
      title: "SNS Exam Cheat Sheet – Every Keyword-to-Answer Mapping in One Place",
      shortDesc: "The full keyword decision table for SNS — pub/sub fan-out, push-based delivery, the SNS-vs-SQS distinction, filtering, and FIFO topics — condensed to the exact phrase that gives each answer away",
      visuals: [],
      content: `## Core Pub/Sub & Fan-Out Keywords

| Keyword in the Question | Answer |
|---|---|
| "Multiple consumers," "same message to many," "event distribution," "real-time notification" | **SNS Fan-Out architecture** |
| "Broadcast message," "parallel processing," "microservices communication" | **SNS topic with multiple subscribers** |
| "Slow polling," "instant delivery," "event trigger," "real-time system" | **SNS push-based messaging** |

---

## ⚠️ SNS vs SQS Keywords — The Classic Confusion Pair

| Keyword | Answer |
|---|---|
| "Fan-out," "notify multiple systems," "real-time communication" | **SNS** |
| "Buffer messages," "retry," "store messages" | **SQS** |
| "Fan-out + durability," "multiple queues," "decouple services" (combined) | **SNS + SQS integration** — SNS broadcasts, each SQS queue durably buffers its own copy |

---

## Subscribers, Filtering & FIFO Keywords

| Keyword | Answer |
|---|---|
| "Email notification," "SMS alert," "HTTP webhook," "Lambda trigger" | **SNS supports multiple subscriber protocols** |
| "Send message selectively," "region-based filtering," "event-type filtering" | **SNS Subscription Filter Policy** |
| "Metadata in message," "key-value pair," "useful for filtering" | **Message Attributes** (what a Filter Policy actually matches against) |
| "Strict order," "no duplicates," "financial systems" | **SNS FIFO topic** |
| ".fifo required," "message group," "deduplication" (for a topic, not a queue) | **SNS FIFO Configuration** |

---

## ⚠️ The One-Line Exam Rule

> **Condensed keyword list**: fan-out, multiple consumer, real-time push, filtering, broadcast, event notification. ⚠️ **If a question mentions any TWO of these together — broadcast + notification, multiple-subscriber + real-time, real-time + fan-out, or fan-out + event-driven — in most cases the answer is SNS.**

---

## Exam Framing

> This is the master reference for every SNS scenario-based question — pub/sub fan-out, push vs pull (the core SNS-vs-SQS distinction), subscriber protocol variety, filter policies, message attributes, and FIFO topics. ⚠️ **The recurring exam skill: recognizing the specific keyword phrase and mapping it directly to the correct feature, exactly the same study strategy already used for the API Gateway and SQS cheat sheets.** **This closes out the entire SNS arc — EventBridge begins next.**
`,
    },
    {
      id: "sqs-full-exam-cheat-sheet",
      title: "SQS Exam Cheat Sheet – Every Keyword-to-Answer Mapping in One Place",
      shortDesc: "The full keyword decision table for the entire SQS arc — decoupling, ordering, reliability, cross-account access, and every integration — condensed to the exact phrase that gives each answer away",
      visuals: [],
      content: `## Core Decoupling & Scaling Keywords

| Keyword in the Question | Answer |
|---|---|
| "Variable workload," "decoupled components," "background processing," "asynchronous processing" | **SQS between producer and consumer** |
| "Auto scaling based on queue," "backlog of messages," "scale workers automatically" | **EC2 Auto Scaling driven by SQS queue depth**, metric = **ApproximateNumberOfMessagesVisible** |

---

## Ordering & Exactly-Once Keywords

| Keyword | Answer |
|---|---|
| "Strict order," "exactly once," "no duplicates" | **FIFO queue** |
| "Very high throughput required," order not required | **Standard queue** |

---

## Reliability & Failure-Handling Keywords

| Keyword | Answer |
|---|---|
| "Message processed multiple times," "poison message," "failed processing" | **Dead-Letter Queue (DLQ)** |
| "Duplicate processing," "message reappears" | **Visibility timeout not set correctly** |

---

## Cross-Account & Integration Keywords

| Keyword | Answer |
|---|---|
| "Another AWS account," "access SQS without sharing credentials" | **SQS Queue Policy** (a resource-based policy) |
| "Worker nodes," "always running," "control polling logic," "background jobs" | **EC2 instance as a consumer, polling SQS** |
| "Serverless," "event-driven," "no servers," "automatic scaling" (Lambda+SQS) | **SQS triggers Lambda via Event Source Mapping** |
| "Who polls the queue?" / "no polling code," "fully managed consumer" | **AWS polls SQS on Lambda's behalf** — Event Source Mapping |
| "Database cannot keep up," "sudden spike," "no downtime," "absorb traffic" | **Producer → SQS → worker writes to DB** (SQS protects the DB from the spike) |
| "Paid user first," "free user can wait," "priority processing," "cost effective" | **Two separate standard queues (paid + free), consumer processes the paid queue first** |
| "User uploads file," "processing later," "user should not wait," "background processing" | **S3 event notification → SQS → Lambda** |
| "Reliable processing," "retry on failure," "durable event" (S3→Lambda) | **Insert SQS between S3 and Lambda** for durability + automatic retry — direct S3→Lambda skips this reliability layer entirely |

---

## ⚠️ The One-Hour-Before-the-Exam Ultra-Fast Rule

> **A condensed keyword list**: priority, multiple queue, scaling, queue depth, Lambda polling / AWS does it, cross-account, queue policy, spike, SQS buffer, ordering, FIFO, retry on failure, DLQ. ⚠️ **If a question mentions ANY TWO of these together — spike+async, async+decouple, decouple+retry, retry+background, background+durability, or durability+spike — in most cases the answer is SQS**, even without recognizing the exact scenario.

---

## Exam Framing

> This is the master reference for every SQS scenario-based question covered across the entire arc — decoupling/async, Standard vs FIFO, DLQ/visibility timeout, cross-account queue policies, and every major integration (EC2, Lambda, S3, database-spike-protection, priority queues). ⚠️ **The single biggest exam skill this cheat sheet trains: recognizing the SPECIFIC keyword phrase in a question and mapping it directly to the correct SQS feature or pattern, rather than reasoning through the full mechanics from scratch under time pressure** — exactly the same study strategy used for the API Gateway cheat sheet. **This closes out the entire SQS arc — SNS begins next.**
`,
    },
    {
      id: "sqs-lambda-event-source-mapping-vs-ec2-polling",
      title: "SQS + Lambda – Why Event Source Mapping Exists (and Who Actually Owns It)",
      shortDesc: "Lambda's code never contains a single line of polling logic — AWS itself polls the queue on Lambda's behalf via Event Source Mapping, a facility that belongs to Lambda even when you set it up from the SQS console",
      visuals: [],
      content: `## EC2 Worker vs Lambda Consumer: Fundamentally Different Polling Models

> **EC2 worker nodes are ALWAYS running — the application code inside them contains the polling logic itself, continuously checking the queue whenever the instance is free.** ⚠️ **Lambda is event-driven and NOT always on — it structurally CANNOT continuously poll a queue the way an EC2 worker does, since that would require running 24/7, defeating the entire point of serverless.**

---

## ⚠️ The Key Fact: Lambda Never Polls SQS Itself

> **AWS polls SQS on Lambda's behalf** — Lambda's own function code never contains any polling logic at all. This connection is called **Event Source Mapping**: an AWS-managed configuration that continuously polls the SQS queue, reads messages in batches, and automatically invokes the Lambda function when there's work to do.

### ⚠️ Ownership: Event Source Mapping Belongs to Lambda, Not SQS

> **Even though it can be configured from either side — from the SQS console (choose Lambda as the trigger) or from the Lambda console (add SQS as a trigger) — the resulting Event Source Mapping is always a Lambda-owned resource.** SQS's role is limited to storing and providing messages; Lambda owns all pulling and invocation behavior.

---

## Scaling: No Servers, No Auto Scaling Group, No Configuration

> **Lambda scaling is nothing like EC2 auto scaling** — there are no servers, no Auto Scaling Groups, and no scaling policies to configure at all, because Lambda is serverless. ⚠️ **AWS continuously polls via Event Source Mapping — as message count rises, AWS automatically increases the number of Lambda invocations; as the queue empties, invocations automatically reduce.** This scaling is instant and fully automatic, entirely handled by Event Source Mapping — there's no metric like EC2's queue-depth-driven Auto Scaling to configure.

---

## Exam Framing

> "How does a Lambda function receive messages from an SQS queue, given that Lambda isn't always running?" → **Event Source Mapping — an AWS-managed facility that polls SQS continuously and invokes Lambda automatically, NOT any polling code inside the Lambda function itself.** ⚠️ **Remember the ownership trap: configuring the trigger from the SQS side doesn't make it an SQS feature — Event Source Mapping is, and always remains, a property of the Lambda function.**
`,
    },
    {
      id: "sqs-priority-processing-paid-vs-free-queues",
      title: "Priority Processing With SQS – Multiple Queues, Because SQS Itself Has No Priority Concept",
      shortDesc: "Amazon SQS does not understand paid vs free, urgent vs routine — it only stores and delivers messages in arrival order, so 'priority' has to be engineered entirely OUTSIDE the queue, using separate queues per priority tier",
      visuals: [],
      content: `## ⚠️ The Core Fact: SQS Has Zero Native Priority Support

> **Amazon SQS does not support priority within a single queue — it has no concept of "important" vs "unimportant" messages, and processes strictly in arrival order.** ⚠️ **A single mixed queue genuinely cannot fulfill a priority requirement**: if a free user's request arrives before a paid user's, the free request gets processed first regardless of business priority — the paid customer ends up waiting behind the free one.

---

## The Fix: Separate Queues Per Priority Tier

> **Solution: one high-priority queue (e.g. paid) and one low-priority queue (e.g. free) — the PRODUCER decides which queue each message goes to** (it already knows whether the user is paid or free). ⚠️ **Priority logic lives entirely OUTSIDE SQS — SQS itself still treats both queues as ordinary, equally-important queues; the "priority" only exists in how the consumer/worker chooses to drain them.**

---

## Priority With an EC2 Worker: Just Application Code

> **Traditional EC2-based worker: write the polling logic to check the paid queue FIRST, and only pull from the free queue when the paid queue is empty.** Since polling logic lives inside the consumer's application code, prioritization is simply a matter of which queue that code checks first — the free queue only ever gets processed when the paid queue is genuinely drained.

---

## ⚠️ Priority With Lambda: No Polling Code to Write — Use Reserved Concurrency Instead

> **Lambda's polling is handled entirely by Event Source Mapping — there's no application code where a "check this queue first" rule could even be written.** ⚠️ **The Lambda solution: create TWO separate Lambda functions, one per queue (one dedicated to the paid queue, one to the free queue) — NOT one Lambda function serving both.** Then set **Reserved Concurrency** disproportionately — e.g. 100 for the paid-queue Lambda, 10 for the free-queue Lambda — meaning the paid function can run far more parallel executions at once. ⚠️ **Result: with a 100-vs-10 split, paid video conversion runs roughly 10x faster than free — not because SQS prioritized anything, but because the paid Lambda function was simply given far more parallel processing capacity.**

---

## Exam Framing

> "Paid customers' jobs must be processed before free customers' jobs, but SQS has no built-in priority setting" → **create separate queues per tier, and implement priority in the CONSUMER**: for EC2, poll the high-priority queue first in the worker's own code; for Lambda, use separate functions per queue with disproportionate Reserved Concurrency (more for the high-priority function). ⚠️ **The exam trap: SQS itself is never the place priority logic lives — it only stores and delivers messages, unaware of any business meaning behind them.**
`,
    },
    {
      id: "sqs-fifo-throughput-limit-per-queue-vs-per-message-group",
      title: "FIFO Throughput Limit – Per Queue vs Per Message Group ID",
      shortDesc: "300 messages/sec applied to the WHOLE queue vs 1 message/sec per group scaling with however many groups your producer creates — neither is 'better', it's purely a question of whether your consumer can actually keep up",
      visuals: [],
      content: `## Why FIFO Is Slower Than Standard On Purpose

> **Queue throughput = how many messages a queue can send/receive/process per second** — think of a water tank with an inlet pipe: wide pipe = high throughput, narrow pipe = low throughput. ⚠️ **Standard queues have high throughput; FIFO queues have LOWER throughput than Standard — and this is intentional, not a flaw, because FIFO must maintain strict ordering and exactly-once delivery, which Standard doesn't guarantee.**

---

## The Two FIFO Throughput Modes

### Per Queue (Fixed Numeric Limit)

> ⚠️ **A hard, fixed cap applied at the QUEUE level, regardless of how many message groups exist inside it: 300 messages/sec without batching, 3,000/sec with batching.** ⚠️ **This ceiling cannot be exceeded no matter what — even with 600 message groups, total throughput is still capped at 300/sec.** **Main advantage: predictable control** — you always know exactly what your queue's maximum output is.

### Per Message Group ID (Rule-Based, Scales With Group Count)

> ⚠️ **No fixed number — the limit is simply "one message at a time per group," so total throughput scales directly with however many DIFFERENT group IDs the producer is creating.** **Worked example: 200 simultaneous customers each in their own group → the queue can process 200 messages/sec; 1,000 simultaneous customers/groups → 1,000 messages/sec.** ⚠️ **Throughput here is entirely a function of how many groups the PRODUCER creates — the queue itself doesn't decide this.**

---

## The Real Decision Factor: Can Your Consumer Actually Keep Up?

> ⚠️ **This is NOT a "good vs better" comparison — Per Message Group ID is not inherently superior to Per Queue.** A queue that can scale to 1,000 messages/sec is worthless if the CONSUMER downstream can only process 200-300/sec — the bottleneck just moves. ⚠️ **Choose Per Queue when the backend/consumer has limited, fixed processing capacity. Choose Per Message Group ID only when the ENTIRE pipeline — queue AND backend/consumer — can genuinely scale together** (e.g. handling a sudden sale spike from 300 to 3,000 orders/sec). **No pricing difference between the two options** — this is purely a capacity-planning decision, not a cost one.

---

## High Throughput FIFO Queue: One Switch, Two Settings Locked Together

> ⚠️ **Enabling "High Throughput FIFO Queue" automatically forces BOTH: Deduplication Scope = Message Group, AND FIFO Throughput Limit = Per Message Group ID — both are locked and can no longer be changed independently.** This makes sense because both settings share the same property: checking/limiting per-group (rather than per-queue) is what allows multiple groups to run in genuine parallel for higher overall speed.

---

## Exam Framing

> "A FIFO queue's throughput must never exceed 300 msg/sec (3,000 batched), predictable regardless of message group count" → **Per Queue.** "Throughput must scale automatically as more customers/groups are added, and the backend can handle it" → **Per Message Group ID.** ⚠️ **Remember the real deciding question the exam is testing: is the CONSUMER capable of the higher throughput? If not, Per Queue is the correct, deliberately conservative choice even though Per Message Group ID is technically more scalable.**
`,
    },
    {
      id: "sqs-fifo-queue-hands-on-lab-console-testing",
      title: "FIFO Queue Hands-On Lab – Proving Deduplication and Ordering Directly in the Console",
      shortDesc: "Send the same message body with the same deduplication ID twice — the message count refuses to move, live proof that a FIFO queue genuinely rejects duplicates rather than just claiming to",
      visuals: [],
      content: `## Setup: Creating the Queue

> ⚠️ **A FIFO queue's name MUST end in** \`.fifo\` **— this is a hard naming requirement, not a convention.** Default settings used for the lab: content-based deduplication OFF (meaning a message deduplication ID must be manually supplied), deduplication scope = Queue. ⚠️ **All FIFO settings can be changed after queue creation via Edit** — nothing here is locked in at creation time.

---

## ⚠️ Test 1: Deduplication ID Drives Everything When Content-Based Dedup Is OFF

> Send message ("payment done", group ID "1", dedup ID "1") → **accepted, message count → 1.** Send the SAME body but dedup ID "2" → **still accepted, count → 2** — proving the queue is checking ONLY the deduplication ID, not the message body at all. Resend body="payment done", dedup ID="1" again (an exact repeat of the first message) → **REJECTED, count stays unchanged** — this is deduplication working, because the same ID was seen within the 5-minute window.

---

## ⚠️ Test 2: Content-Based Deduplication ON — the Body Itself Becomes the Fingerprint

> After purging the queue and enabling content-based deduplication: the deduplication ID field becomes OPTIONAL, since the message BODY is now the deciding factor. Send ("payment done", group "1") → accepted, count → 1. Resend the identical body, same group → **rejected, count stays at 1.** ⚠️ **Resend the identical body but with a DIFFERENT group ID → STILL rejected — because the queue's Deduplication Scope is set to Queue, which ignores group boundaries entirely and only cares about the message body being unique across the WHOLE queue.**

---

## ⚠️ Test 3: Switching Scope to Message Group Changes the Outcome

> After purging and changing Deduplication Scope from Queue → Message Group: resend the same body in the SAME group → rejected (still a duplicate within that group). ⚠️ **Resend the same body in a DIFFERENT group → NOW ACCEPTED, count → 2** — direct, hands-on proof that Message Group scope only checks for duplicates inside each group individually, exactly as the concept topic describes.

---

## Polling to Confirm What's Actually in the Queue

> The console's "Poll Messages" feature retrieves and displays the queue's current messages directly (default polling duration 10 seconds, configurable) — used throughout the lab to visually confirm which messages the queue actually accepted versus silently rejected.

---

## Exam Framing

> This lab is the practical proof behind two exam-favorite FIFO facts: **(1) when content-based deduplication is OFF, the message body is irrelevant and ONLY the deduplication ID matters; (2) Deduplication Scope (Queue vs Message Group) directly changes whether an identical body in a DIFFERENT group is treated as a duplicate or not** — something that's easy to state abstractly but only really clicks once seen live, message-count-by-message-count, in the console.
`,
    },
    {
      id: "sqs-message-groups-and-deduplication-scope",
      title: "SQS Message Groups & Deduplication Scope – Order Within a Customer, Parallel Across Customers",
      shortDesc: "Message Group ID is how SQS learns 'these 3 messages are the same customer's checkout journey' — deduplication scope then decides whether duplicates are only rejected WITHIN that group, or across the entire queue",
      visuals: [],
      content: `## What a Message Group Actually Is

> **A message group tells SQS which messages belong together, for the purpose of strict ordering.** ⚠️ **Messages in the SAME group are always processed one-by-one, in the exact order sent. Messages in DIFFERENT groups can be processed in parallel — they don't block each other at all.** ⚠️ **The Message Group ID is generated and attached by the PRODUCER application on every message — SQS never invents or assigns it, it only reads what the producer sends.** ⚠️ **A FIFO queue structurally cannot function without a Message Group ID on every message — this must be confirmed with the producer app's developer before a FIFO queue is even created.**

### Worked Example: One Customer's Checkout Journey

> **buy-now → payment-page → payment-complete → order-confirmed** — these 4 events for ONE customer all carry the SAME Message Group ID (e.g. "A"), so SQS processes them strictly in that arrival order. ⚠️ **A second customer's simultaneous checkout carries a DIFFERENT Message Group ID (e.g. "B") — SQS makes no ordering promise between A's messages and B's messages at all, they can run in parallel.**

---

## Deduplication Scope: WHERE Should SQS Look for Duplicates?

> ⚠️ **Deduplication Scope has exactly two options, chosen at queue creation: Message Group (the default) or Queue.** This setting decides the BOUNDARY within which SQS checks for a duplicate — it does not change whether deduplication happens, only where it looks.

### Scope = Message Group (Default, Faster)

> **SQS only checks for duplicates WITHIN the same message group — an identical message in a DIFFERENT group is NOT flagged as a duplicate at all.** ⚠️ **Use this for customer-scoped actions — orders, cart actions, user workflows** — e.g. a user double-clicking "Buy Now" due to a slow connection produces two identical messages in the SAME group, correctly caught as a duplicate; unrelated customers' independent orders are never compared against each other.

### Scope = Queue (Slower, for Global Uniqueness)

> **SQS checks for duplicates across the ENTIRE queue, ignoring group boundaries entirely — even messages in a different group are compared.** ⚠️ **Use this when messages must be globally unique and duplicate processing would be a serious problem — the textbook case: unique payment transaction IDs, where a duplicate should never legitimately occur system-wide, regardless of which customer or group it came from.**

---

## ⚠️ Why Message Group Is Faster (and the Default)

> **Message Group scope only has to check duplicates inside ONE group** — different groups are handled completely independently, requiring far less internal coordination, which scales well under high FIFO throughput. **Queue scope has to check duplicates across ALL groups in the entire queue** — inherently more coordination, inherently slower. ⚠️ **This is exactly why enabling High Throughput FIFO mode automatically selects Message Group as the deduplication scope (paired with per-message-group-ID throughput limits) — the faster option is the one that scales.**

---

## Exam Framing

> "Prevent duplicate cart/order actions per customer, without slowing down unrelated customers' orders" → **Deduplication Scope = Message Group** (the default, and the faster option). "A payment transaction ID must never be processed twice, regardless of which customer or group it came from" → **Deduplication Scope = Queue** — broader, slower, but the only option that catches duplicates ACROSS groups. Remember: **Message Group ID itself is always producer-supplied and is what makes strict per-customer ordering possible in the first place — Deduplication Scope is a separate, later decision about the duplicate-detection boundary.**
`,
    },
    {
      id: "sqs-dead-letter-queue-dlq-deep-dive",
      title: "SQS Dead-Letter Queue (DLQ) – Breaking the Infinite Retry Loop",
      shortDesc: "Without a DLQ, one poison message loops forever between the main queue and its consumer — visibility timeout expires, message reappears, fails again, repeat, wasting the consumer's time indefinitely",
      visuals: [],
      content: `## The Problem: A Poison Message Without a DLQ

> **Normal flow**: producer pushes → consumer pulls → SQS returns the message → consumer processes it → consumer deletes it. ⚠️ **The failure flow, step by step**: consumer pulls a bad message (bad data, downstream DB is down, whatever) → SQS makes it invisible for the visibility timeout → consumer tries to process it → processing FAILS → consumer never deletes it → **SQS just waits out the visibility timeout, then makes the message visible again** → consumer pulls it again → fails again → repeat, forever. ⚠️ **This is a genuine infinite loop: no retry limit, no separation of bad messages from good ones, the consumer just keeps wasting cycles on a message it can never successfully process.**

---

## The Fix: A Separate Queue for Failed Messages

> **A DLQ is a separate, ordinary SQS queue where failed messages get moved after repeated failed attempts** — think of it as a side parking area for bad messages, keeping the main queue clean. ⚠️ **DLQ setup is entirely optional and can be added at any time** — enabled at queue creation, or bolted onto an existing queue afterward via Edit.

### The Rule That Makes It Work: Max Receive Count

> **A rule is configured on the MAIN queue: max receive count (e.g., 3).** ⚠️ **Meaning: if the same message has been received 3 times and still hasn't been deleted, SQS automatically moves it to the DLQ on the next failed attempt instead of making it visible again** — the message is removed from the main queue entirely, the main queue stays clean, and the consumer can get back to processing the good messages uninterrupted.

---

## What a DLQ Is Actually Good For

> Once a bad message lands in the DLQ, you can **inspect it, figure out what went wrong, fix the underlying issue, and manually resend it to the main queue if appropriate** — or just leave it there for analysis. ⚠️ **A DLQ filling up with messages is itself a signal**: it means something is systematically wrong with how the consumer is processing messages, making the DLQ a genuinely useful debugging/monitoring signal, not just a trash bin.

---

## Exam Framing

> "A single problematic message keeps reappearing in the queue and being retried endlessly" → **this is exactly the failure mode a DLQ exists to solve.** ⚠️ **Configure a max receive count on the main queue (e.g., 3) and point it at a separate DLQ** — after that many failed attempts, SQS moves the message out automatically, protecting the main queue's throughput and giving you a dedicated place to debug what's actually failing.
`,
    },
    {
      id: "sqs-redrive-allow-policy",
      title: "SQS Redrive Allow Policy – Locking a DLQ to Its Rightful Main Queue",
      shortDesc: "One DLQ, left unrestricted, can quietly become the dumping ground for every failing queue in the account — Redrive Allow Policy is the explicit allow-list that stops that",
      visuals: [],
      content: `## The Problem: An Unrestricted DLQ Is Anyone's DLQ

> **By default, a DLQ has NO restriction on which source queues may send it failed messages — any queue in the account can be configured to use it.** ⚠️ **This is genuinely a problem: with no restriction, an order-queue's DLQ could silently start receiving failed messages from an entirely unrelated payment queue too, making the DLQ messy and confusing to debug — not recommended for production.**

---

## The Fix: An Explicit Allow-List, Set on the DLQ Itself

> ⚠️ **Redrive Allow Policy is configured on the DLQ — not the main queue** — and it's a safety rule that decides exactly which source queues are allowed to redrive failed messages into it. **Three modes**: (1) disabled/allow-all (default — any queue may use it), (2) deny all, (3) **by specific queue(s)** — explicitly naming which main queue(s) are permitted.

> **Concrete example**: an order queue should be allowed to use "order DLQ"; a payment queue should NOT. ⚠️ **Set Redrive Allow Policy on the DLQ to "by specific queue" and name only the order queue — any other queue attempting to attach that same DLQ (e.g., in its own DLQ setting) will be rejected outright, proven directly in the console: attaching the DLQ to an unauthorized queue and hitting Save simply fails.**

---

## How the Two Policies Work Together

> **Main queue** has its own redrive policy: max receive count = 3. **DLQ** has its Redrive Allow Policy: only the main queue is allowed. ⚠️ **Result: after 3 failed attempts, the message moves ONLY to the specifically-allowed DLQ — a clean, controlled, one-to-one (or deliberately-scoped) relationship instead of an open dumping ground.**

---

## Exam Framing

> "Multiple SQS queues exist in the account, and a DLQ must only accept failed messages from ONE specific queue" → **Redrive Allow Policy, configured on the DLQ, set to allow only that specific source queue** — this is distinct from the main queue's own redrive policy (which sets the max receive count); Redrive Allow Policy is the DLQ-side control over WHO is allowed to redrive into it.
`,
    },
    {
      id: "sqs-hands-on-lab-producer-consumer-ec2",
      title: "SQS Hands-On Lab – Producer and Consumer EC2 Apps, Proving the Pull-Based Flow End to End",
      shortDesc: "One IAM role attached to BOTH EC2 instances, since neither can push or pull from the queue without explicit permission — then watching the message count genuinely rise and fall as it's sent, pulled, and deleted",
      visuals: [],
      content: `## The Architecture: Two Separate EC2 Instances, One Shared Role

> **The lab requires three things: a producer, a queue, and a consumer.** ⚠️ **Two SEPARATE EC2 instances are deliberately used — one as producer, one as consumer — rather than combining both on one machine, specifically to keep the lab clean and unambiguous about which side is doing what.** Both instances run identical Ubuntu 22 AMIs; the only real difference between them is which USER DATA SCRIPT each one runs (a producer web UI script vs a consumer web UI script).

---

## ⚠️ Step 1: Create the Queue (Standard, Default Configuration)

> Create a standard queue with default configuration — default encryption, no access policy configured (IAM handles permissions instead), redrive allow policy and DLQ deliberately skipped for this simple lab. ⚠️ **The resulting Queue URL is the single most important artifact from this step — it's what both the producer and consumer applications actually use to push/pull messages.**

---

## ⚠️ Step 2: One Shared IAM Role for Both Instances

> **Neither EC2 instance can push or pull messages from the queue without explicit permission — an IAM role must be created and attached to BOTH the producer and consumer instances.** ⚠️ **Create ONE role (trusted entity: EC2, permission: Amazon SQS Full Access — a custom, queue-scoped policy would be the stricter production choice, but full access is used here to keep focus on the lab flow) and attach that SAME role to both instances** — this follows the established best practice of using an IAM role rather than hardcoded access keys (the same pattern reinforced across every earlier EC2-to-AWS-service lab this session).

---

## Steps 3-4: Launch the Producer and Consumer EC2 Instances

> Identical instance configuration for both (Ubuntu 22, free-tier instance type, default VPC, public IP auto-assign enabled, HTTP inbound allowed to reach the web UI) — attach the SAME IAM role from Step 2 to both — the only real difference is which user data script is pasted in (producer script vs consumer script) during launch.

---

## ⚠️ Testing: Watching the Queue's Message Count Actually Change

> **The validation checklist**: (1) open the producer app's public IP over HTTP (⚠️ **watch out for browsers auto-prepending HTTPS to a bare IP — must be corrected to HTTP or the app won't load**, the same gotcha covered in the earlier ECS lab), paste the queue URL and region, send a test message → the queue's "receive message" count rises from 0 to 1. (2) Open the consumer app, paste the same queue URL and region, pull the message → the message is received AND automatically deleted (receive-and-delete) → pulling again immediately returns nothing, and the queue's message count drops back to 0. ⚠️ **This end-to-end count change — 0 → 1 → 0 — is the concrete proof the pull-based mechanism genuinely works**, not just a theoretical description.

---

## ⚠️ Role Clarification: What a Cloud Engineer Is (and Isn't) Responsible For

> **The producer/consumer web app code itself is explicitly NOT something a cloud engineer/architect needs to write** — that's an application developer's job. ⚠️ **The cloud engineer's actual responsibilities in this lab: create the queue, provide its URL, and set up the IAM role granting the necessary permissions** — the application code is a given, provided directly rather than something to build from scratch.

---

## Exam Framing

> "Two separate EC2 instances (a producer and a consumer) both need to interact with the same SQS queue" → **one IAM role, attached to BOTH instances, granting the necessary SQS permissions** — neither instance can push or pull without it, since AWS services never have implicit permission to act on each other. This is purely a lab-mechanics topic reinforcing IAM-role-over-hardcoded-credentials, and the practical proof that SQS's pull-based delivery genuinely removes and doesn't just hide a processed message (0 → 1 → 0 message count).
`,
    },
    {
      id: "sqs-encryption-sse-sqs-vs-kms",
      title: "SQS Encryption – SSE-SQS's Zero-Config Simplicity vs KMS's Full Key Control",
      shortDesc: "Both options encrypt messages at rest, but only KMS lets you actually control permissions, rotation, and auditing on the key itself — SSE-SQS is fully AWS-managed and completely invisible to you",
      visuals: [],
      content: `## Two Distinct Encryption Concerns: At Rest vs In Transit

> **Encryption in transit**: data flowing between producer → SQS → consumer is ALWAYS protected via HTTPS/TLS — ⚠️ **no configuration is needed at all; this is automatic and non-optional.** **Encryption at rest**: protects messages WHILE they're sitting stored in the queue (recall: messages can remain queued anywhere from 1 minute to 14 days, per the message retention period) — ⚠️ **this is the configurable option, called Server-Side Encryption (SSE).**

---

## Server-Side Encryption: Enabled by Default, Two Key-Management Modes

> **SSE can be enabled or disabled when creating a queue — ⚠️ enabled by default, and leaving it enabled is the recommended, secure choice.**

### SSE-SQS: AWS Manages the Key, Fully Transparent

> **AWS manages the entire encryption key lifecycle — completely transparent to the user, with NO key management required at all.** ⚠️ **Simple, and recommended for most use cases** where deep control over the encryption key itself isn't a specific requirement.

### SSE-KMS: Customer-Managed Key, Full Control

> **Uses an AWS KMS (Key Management Service) key that must be set up separately** (KMS itself is covered in depth in a later dedicated topic). ⚠️ **Because it's a customer-managed key, you get direct control over key permissions, key rotation, and auditing** — genuinely useful for compliance requirements or strict security policies where SSE-SQS's fully-automatic, zero-visibility approach isn't sufficient.

---

## Exam Framing

> "A queue needs message encryption at rest with zero key-management overhead" → **SSE-SQS** — AWS manages the entire key lifecycle transparently, no setup required. "A queue needs encryption at rest where the organization must control key rotation, permissions, and maintain an audit trail for compliance" → **SSE-KMS** — using a customer-managed KMS key gives that level of control, unlike SSE-SQS's fully opaque AWS-managed key. Remember: **encryption in transit (HTTPS/TLS) is always on with zero configuration; encryption at rest (SSE) is the configurable choice between SSE-SQS and SSE-KMS.**
`,
    },
    {
      id: "api-gateway-full-exam-cheat-sheet",
      title: "API Gateway Exam Cheat Sheet – Every Keyword-to-Answer Mapping in One Place",
      shortDesc: "The full keyword decision table for the entire API Gateway arc — endpoint types, private integration, and all four security layers, condensed to the exact phrase that gives each answer away",
      visuals: [],
      content: `## Endpoint Type Keywords

| Keyword in the Question | Answer |
|---|---|
| "Global users worldwide," "clients," "low latency globally" | **Edge-Optimized REST API endpoint** |
| "Clients are in the same region," "reduce latency in one region only," "multi-region not required" | **Regional REST API endpoint** |
| "Accessible only from inside VPC," "internal API, not from the internet" | **Private REST API + VPC interface endpoint + resource policy** |
| "Convert a private API to edge-optimized" | ⚠️ **Not possible — an endpoint type cannot be changed after the fact this way** |

---

## Private API vs Private Integration — Don't Confuse These Two

> ⚠️ **Private API means the API ITSELF has endpoint type = private** — the API is only reachable from inside a VPC. **Answer: Private REST API + VPC interface endpoint + resource policy.**

> ⚠️ **Private INTEGRATION means the BACKEND lives inside a VPC, but the API ITSELF can still be public.** "Expose a backend inside a VPC, but the API can remain public" → **REST API + VPC Link.** ⚠️ **"Connect API to a private ALB" → VPC Link v2** (the newer version — v1 supported only NLB; v2 added ALB support, matching the earlier integration-types topic).

---

## Security Layer Keywords (All Four Layers)

| Keyword | Answer |
|---|---|
| "Protect a public REST API from web exploits," "SQL injection," "cross-site scripting," "XSS" | **AWS WAF attached to API Gateway** |
| "Allow only a specific IP," "allow only a specific AWS account," "VPC endpoint only" | **API Gateway Resource Policy** |
| "User login," "JWT token," "sign-in required" | **Cognito User Pool authorizer** |
| "Custom authentication," "custom token validation," "external IDPs," "specific custom rule" | **Lambda Authorizer** |
| "AWS service-to-service," "IAM user/role," "SigV4 signing," "sign the request" | **IAM authorization on the API Gateway method** |

---

## Quick-Reference: Additional Recurring Themes From This Arc

- **Custom domain + HTTPS** → performance/branding keyword, points to configuring a custom domain with ACM certificate.
- **"Usage control"** → API key + usage plan (rate/burst throttling, quota).
- **"Small percentage of traffic to a new version"** → Canary deployment (REST API only, Lambda aliases not versions).
- **"Direct integration with many AWS services, complex mapping"** → REST API. **"Simple, low-cost, limited integrations"** → HTTP API.
- **"Real-time, two-way, long-lived connection"** → WebSocket API.

---

## ⚠️ The Study Strategy This Cheat Sheet Is Built For

> **Three preparation tiers**: (1) a full pass through the material immediately after learning it, (2) a 24-48-hour-before-exam review using cheat sheets exactly like this one, and (3) a final "ultra-fast decision table" pass in the hour before the exam — deliberately compressed to the exact keyword-to-answer mappings above, skipping all explanatory detail, for a genuinely fast last-minute refresh.

---

## Exam Framing

> This is the master reference for every API Gateway scenario-based question covered across this entire arc — endpoint types, private API vs private integration (a common point of confusion), and all four security layers (usage control, access control, edge protection, authentication). ⚠️ **The single biggest exam skill this cheat sheet trains: recognizing the SPECIFIC keyword phrase in a question and mapping it directly to the correct AWS feature, rather than reasoning through the full mechanics from scratch under time pressure.**
`,
    },
    {
      id: "api-gateway-custom-domain-routing-modes-api-mapping-vs-rules",
      title: "Custom Domain Routing Modes (Part 1) – API Mapping Only vs Routing Rules Only",
      shortDesc: "API mapping only ever looks at the URL path — routing rules can additionally check an HTTP header, but that extra power comes at the cost of REST-API-only support",
      visuals: [],
      content: `## ⚠️ What Routing Mode Decides

> **When a request hits a custom domain, routing mode decides WHICH underlying API (and stage) actually handles it** — genuinely important with many APIs (or many stages of the same API) sitting behind one shared custom domain. ⚠️ **Three routing modes exist: API Mapping Only, Routing Rules Only, and Routing Rules then API Mapping** (a hybrid, covered separately).

---

## API Mapping Only: Simple, Path-Based Routing

> **Maps a URL path directly to a specific API + stage — no conditions, no rules, just a direct path-to-API lookup.** ⚠️ **Supported by REST API, HTTP API, AND WebSocket API — all three types.**

**Worked example**: the SAME "user REST API" is deployed to two stages, dev and prod. ⚠️ **api.company.com/user (path = "user") maps to the dev stage; api.company.com/prod (path = "prod") maps to the same API's prod stage.** ⚠️ **The mapping configuration itself is only accessible AFTER the custom domain already exists** — clicking directly into the domain reveals the mapping options, rather than being available at domain-creation time.

---

## ⚠️ Routing Rules Only: Conditional Routing With Path AND Header

> **Routing rules provide genuine CONDITIONAL routing — unlike API mapping's simple path-only lookup, routing rules can evaluate BOTH the URL path AND an HTTP header together.** ⚠️ **Routing rules are RECOMMENDED for REST API specifically because they allow finer control** — ⚠️ **and routing rules support ONLY REST API, not HTTP API or WebSocket API.**

**Worked example**: a request to /user carrying header x-env: dev routes to the REST API's dev stage; the SAME path /user carrying header x-env: prod instead routes to the prod stage — ⚠️ **the routing decision now depends on path AND header together, something API Mapping Only structurally cannot express.**

---

## ⚠️ Priority: Resolving Conflicts Between Overlapping Rules

> **Multiple routing rules CAN match the same incoming request simultaneously — priority is what determines which rule actually wins.** ⚠️ **Lower priority NUMBER = HIGHER priority — rule "10" is evaluated before rule "20".**

**⚠️ The critical, easy-to-miss nuance: a rule with NO header condition specified still MATCHES requests that DO carry a header** — "no header condition" means "don't care whether a header is present or not," NOT "only match requests with no header at all." ⚠️ **This is exactly what creates conflicts**: a specific rule (path=users AND header=dev) and a general rule (path=users, no header condition) can BOTH legitimately match the same request carrying a dev header.

**⚠️ Worked conflict scenario**: incoming request has path=/user and header x-env:dev. Rule 1 (specific: path=users AND header=dev, priority 10) matches. Rule 2 (general: path=users, no header condition, priority 20) ALSO matches. ⚠️ **Because rule 1 has the LOWER priority number, it wins** — the more specific rule is deliberately given priority over the general catch-all. ⚠️ **If the SAME request arrives with NO header at all, rule 1 (which requires a specific header value) simply cannot match at all — rule 2 (the general one) is used automatically, with no priority conflict to resolve**, since only one rule is even eligible.

---

## Exam Framing

> "A custom domain needs to route requests to different API stages based on BOTH the URL path and a custom HTTP header" → **Routing Rules Only — API Mapping Only can evaluate the path alone, never a header; routing rules are also REST-API-exclusive, unlike API Mapping's support for REST/HTTP/WebSocket.** "Two routing rules both technically match the same incoming request — how is the conflict resolved?" → **the rule with the LOWER priority NUMBER wins (lower number = higher priority)** — remembering that a rule with no header condition specified still matches requests that DO carry headers, which is exactly the scenario that creates this kind of overlap in the first place.
`,
    },
    {
      id: "api-gateway-custom-domain-hybrid-routing-mode",
      title: "Custom Domain Routing Modes (Part 2) – The Hybrid Mode That Lets You Add Rules Without Breaking Existing Mappings",
      shortDesc: "Rules are checked first; only when nothing matches does it fall back to the existing path-based mapping — meaning an already-working API mapping setup never has to be torn down to introduce conditional routing",
      visuals: [],
      content: `## The Third Mode: Routing Rules THEN API Mapping

> **A hybrid mode combining both prior approaches: API Gateway checks the configured ROUTING RULES first — if none match, it falls back to the existing API MAPPING configuration.** ⚠️ **Evaluation order: rules first, mapping as the fallback — never the reverse.**

---

## ⚠️ Why This Mode Exists: Adding Conditions Without Breaking What Already Works

> **The real-world scenario this solves**: an API domain already has 10 existing APIs configured entirely through API Mapping Only — a working, stable setup. ⚠️ **Business now wants conditional routing for a handful of NEW APIs, without disturbing the existing 10 mappings at all.** ⚠️ **Switching to "Routing Rules Only" would force ALL 15 APIs (old and new) onto rule-based routing, breaking the simple setup that already worked fine.** ⚠️ **The hybrid mode solves this precisely: existing mappings keep working exactly as before, and new conditional rules can be layered on top incrementally, without disrupting anything already in production.**

---

## Exam Framing

> "An existing custom domain already routes 10 APIs successfully via simple path-based API mapping — a new requirement needs conditional (header-based) routing for a few new APIs, without touching the existing 10" → **switch the routing mode to "Routing Rules then API Mapping"** — routing rules are checked first (covering the new conditional requirements), and anything not matched by a rule automatically falls through to the pre-existing API mapping configuration, leaving it fully intact. This hybrid mode exists specifically to let conditional routing be introduced incrementally, without a disruptive full migration off API Mapping Only.
`,
    },
    {
      id: "api-gateway-custom-domain-public-private-dns",
      title: "API Gateway Custom Domain (Part 1) – Public vs Private, and Route 53 Alias vs External CNAME",
      shortDesc: "Route 53 needs an alias record for a custom domain; every other registrar (GoDaddy, Namecheap, Cloudflare) needs a plain CNAME instead — the DNS record type genuinely differs by provider",
      visuals: [],
      content: `## ⚠️ Why Custom Domains Exist

> **API Gateway's default invoke URL is a long, AWS-generated string — not something a real production API would expose to users.** ⚠️ **Custom domains let an API use a real, branded domain instead** (e.g. api.company.com) — better for branding, easier to remember, and considered a best practice for production-ready APIs.

---

## Public vs Private Custom Domains

> **Public**: the domain is accessible over the public internet — used with regional or edge-optimized API endpoints. ⚠️ **A public domain MUST be a genuinely registered domain name.** **Private**: resolves only within a local/internal DNS context — ⚠️ **used specifically with private REST API endpoints, and does NOT require domain registration at all**, since it's never resolved publicly.

---

## ⚠️ DNS Record Type Depends on the Registrar

> **If the domain is registered with Route 53 (AWS's own DNS service), an ALIAS record must be created** pointing to the API Gateway custom domain. ⚠️ **If the domain is registered with an external registrar (GoDaddy, Namecheap, Cloudflare, etc.), a CNAME record is used instead** — ⚠️ **this is a genuine, real difference, not interchangeable terminology: Route 53 → alias record; any external registrar → CNAME record.**

---

## Endpoint Type: Regional vs Edge-Optimized (For the Custom Domain Itself)

> **The custom domain's own endpoint type choice directly mirrors the REST API's underlying endpoint type** (from the earlier endpoint-types topic) — regional or edge-optimized. ⚠️ **Choosing regional exposes an mTLS (mutual TLS) configuration option; choosing edge-optimized makes mTLS disappear entirely** — because with edge-optimized, CloudFront sits in front and handles that layer itself, so API Gateway's own mTLS setting becomes irrelevant.

**IP address type**: IPv4-only (supports REST, HTTP, and WebSocket for a public domain) or dual-stack (IPv4 + IPv6, supported across all domain types).

---

## Exam Framing

> "A custom domain is being set up for an API registered with GoDaddy, not Route 53" → **create a CNAME record** — Route 53 specifically requires an ALIAS record instead; the two are not interchangeable, and the correct record type depends entirely on which registrar hosts the domain. "A REST API needs to be reachable only within an internal network, never the public internet, with a custom domain name" → **a private custom domain** — no domain registration required, resolved only through local DNS, paired with a private REST API endpoint.
`,
    },
    {
      id: "api-gateway-custom-domain-mtls-acm-certificate",
      title: "API Gateway Custom Domain (Part 2) – mTLS Only on Custom Domains, and ACM Certificate Region Rules",
      shortDesc: "A regional endpoint's certificate must be issued in that SAME region — but an edge-optimized endpoint's certificate must ALWAYS come from us-east-1, regardless of where the API itself actually lives",
      visuals: [],
      content: `## ⚠️ Mutual TLS (mTLS): Custom-Domain-Only, and What It Actually Adds

> **mTLS is NOT available on the default invoke URL at all — it only becomes an option once a custom domain is configured.** ⚠️ **Default invoke URL behavior: only the SERVER's certificate is checked — the client (requester) needs no certificate of its own** — this is ordinary HTTPS, not mutual authentication; anyone with the URL can attempt to connect. ⚠️ **With mTLS enabled on a custom domain: BOTH the server's certificate AND the client's certificate are checked — only a client presenting a genuinely valid certificate can access the API at all.** This is a meaningfully higher security bar, reserved for high-security requirements.

**Security policy and endpoint access mode** (basic/strict) can both be configured SEPARATELY for the custom domain, distinct from whatever was set for the default invoke URL — directly matching the earlier TLS security policy topic's "default invoke URL vs custom domain get separate policies" rule.

---

## ⚠️ ACM Certificate: Mandatory, and Region-Dependent

> **API Gateway only supports HTTPS for custom domains — TLS encryption is enforced by default, and the certificate MUST be issued by AWS Certificate Manager (ACM).** ⚠️ **API Gateway does NOT support importing a certificate directly from an external Certificate Authority** — it must come from ACM specifically. ⚠️ **The certificate's domain name must match the custom domain exactly** (e.g. api.company.com needs a certificate for api.company.com, or a wildcard certificate like *.company.com).

**⚠️ The critical regional rule, genuinely easy to get wrong**:
- **Regional endpoint**: the ACM certificate must be issued in the SAME AWS region as the API Gateway itself.
- **⚠️ Edge-optimized endpoint**: the ACM certificate MUST be issued in us-east-1 (N. Virginia) — REGARDLESS of which region the actual API lives in.** ⚠️ **This is because edge-optimized endpoints are fronted by CloudFront, and CloudFront specifically requires its certificates to come from us-east-1, no exceptions.**

---

## Exam Framing

> "A REST API needs the strongest possible client-identity verification, beyond standard HTTPS" → **mTLS, configured on a custom domain** — the default invoke URL never supports mTLS at all; only a custom domain unlocks it, checking both server AND client certificates. "An edge-optimized API's custom domain needs an ACM certificate, but the API itself is hosted in ap-south-1" → **the certificate must still be issued in us-east-1, regardless of the API's actual region** — this is specifically because edge-optimized endpoints route through CloudFront, which mandates us-east-1 certificates. A regional endpoint's certificate, by contrast, must match the API's own region exactly.
`,
    },
    {
      id: "api-gateway-canary-deployment",
      title: "API Gateway Canary Deployment – REST API Only, and It Works With Lambda ALIASES, Never Versions",
      shortDesc: "Canary routes a small percentage of live traffic to a new Lambda alias while most users stay on the stable one — but this entire mechanism is unavailable on HTTP or WebSocket API, REST API only",
      visuals: [],
      content: `## What Canary Deployment Actually Does

> **Canary deployment releases API changes safely by testing with a SMALL percentage of live traffic first, rather than shifting 100% of users at once.** ⚠️ **The WhatsApp analogy**: a new feature ships to a small slice of users first (e.g. 10%) — if feedback and performance metrics are good, it's rolled out to everyone; if there are problems, it's rolled back — without ever having affected the full user base.

---

## ⚠️ How It Works Mechanically: Lambda Aliases, Not Versions

> **The stable deployment (e.g. named "stable") points to a Lambda function via an ALIAS** (e.g. alias "prod" pointing at version 1) — ⚠️ **canary deployment always works with Lambda ALIASES, never Lambda versions directly.** When a new Lambda version is created (version 2, with a NEW alias, e.g. "canary"), a canary deployment can be configured to send a defined PERCENTAGE of traffic to that new alias, while the remainder continues hitting the stable alias.

**Worked example**: 90% of traffic continues hitting the old stable Lambda (via its alias); 10% is routed to the new version's canary alias. ⚠️ **The percentage split is configured directly at the API Gateway stage's Canary settings.**

**Decision point after testing**: if the 10% canary traffic shows good metrics and positive feedback, shift 100% of traffic to the new version; if problems are found, roll back — the old stable version was never touched or disrupted during the test.

---

## ⚠️ Two Critical Scope Limitations

> **Canary deployment works ONLY with REST API — it is NOT available for HTTP API or WebSocket API.** ⚠️ **Canary deployment is configured at the STAGE level in API Gateway** — it's a stage-scoped feature, not something set per-method or per-resource.

---

## Exam Framing

> "A team wants to test a new Lambda-backed API version with only 10% of live traffic before fully rolling it out" → **API Gateway Canary Deployment — but only available for REST API, never HTTP or WebSocket API.** "Canary deployment routes traffic based on a Lambda VERSION directly" → **false — canary deployment always routes based on a Lambda ALIAS, not a version number directly; each version needs its own alias for canary routing to reference it.** Remember the scope: **REST-API-only, configured at the stage level, alias-based not version-based.**
`,
    },
    {
      id: "api-gateway-waf-edge-protection",
      title: "API Gateway Layer 3 – WAF Edge Protection: Blocking Attacks Before the Request Even Reaches API Gateway",
      shortDesc: "WAF sits ahead of everything else in the security stack, filtering out malicious traffic at Layer 7 before API Gateway itself ever processes the request",
      visuals: [],
      content: `## ⚠️ WAF: The Highest Level of Protection, First in Line

> **Edge protection secures the API at the entry point — BEFORE any request reaches API Gateway at all.** ⚠️ **This is provided by AWS WAF (Web Application Firewall), operating at Layer 7 (the application layer of the OSI model)** — ⚠️ **explicitly called out as the "highest level of security" among API Gateway's four layers, since it filters traffic before API Gateway itself even processes anything.**

**⚠️ Attacks WAF protects against**: SQL injection, cross-site scripting (XSS), malicious IP addresses, and bad bots/automated attacks.

**⚠️ Exam tip called out directly**: "AWS WAF works at Layer 7 and blocks the request BEFORE API execution" — this exact phrasing is worth memorizing verbatim.

---

## Exam Framing

> "An API needs Layer 7 application-level protection against SQL injection and cross-site scripting attacks, filtering malicious traffic before it ever reaches API Gateway" → **AWS WAF integration** — the edge-protection layer, evaluated before API Gateway processes the request at all, distinct from resource policy (which controls origin) and the usage plan/authorizer layers (which run inside API Gateway itself, after WAF has already let the request through).
`,
    },
    {
      id: "api-gateway-iam-vs-cognito-vs-lambda-authorizer",
      title: "API Gateway Authentication – IAM vs Cognito vs Lambda Authorizer: Three Callers, Three Tools",
      shortDesc: "SigV4 signing in the question means IAM; social login or JWT tokens mean Cognito; a genuinely custom or legacy authentication scheme means Lambda authorizer — the exam keyword gives the answer away directly",
      visuals: [],
      content: `## Layer 4: Authentication and Authorization — Three Distinct Tools for Three Distinct Callers

> **Authentication decides WHO can access the API; authorization decides WHAT they're allowed to do once authenticated.** ⚠️ **API Gateway supports three tools for this, each suited to a different type of caller.**

---

## IAM: For AWS-to-AWS Access

> **Who uses it**: other AWS services or IAM users/roles — NOT end users with no AWS account. **Purpose**: securing AWS-to-AWS access. **Auth type**: AWS credentials (SigV4 signing). **Authorization**: via IAM policy. ⚠️ **Does NOT support OAuth 2.0, JWT tokens, social login (Google/Facebook), external identity providers, or custom authentication rules — none of these are available through IAM.** **Typical use case**: internal AWS-only APIs.

**⚠️ Exam keyword: "SigV4 signing" in a question → the answer is always IAM.**

---

## Cognito: For End Users (Web/Mobile)

> **Who uses it**: end users accessing the API from a web or mobile app — people with NO AWS account of their own. **Purpose**: authentication and authorization for public-facing APIs. **Auth type**: username/password, OR social login (Google, Facebook). **Authorization**: via Cognito User Pool. ⚠️ **Supports OAuth 2.0 — yes. JWT tokens — yes. Social login — yes, fully. External identity providers (e.g. connecting to an existing Active Directory) — yes, supported.** ⚠️ **Custom authentication rules: only LIMITED — Cognito has predefined rules, not full custom logic.** **Typical use case**: public APIs serving real end users.

**⚠️ Exam keyword: "OAuth" or "JWT token" in a question → the answer is Cognito.**

---

## Lambda Authorizer: For Fully Custom Logic

> **Who uses it**: anyone with a requirement not covered by IAM or Cognito's built-in rules. **Purpose**: fully custom authentication and authorization, written entirely as your own Lambda code. **Auth type**: custom token, header, query parameter — whatever the custom logic defines. **Authorization**: entirely handled by the Lambda function's own code. ⚠️ **OAuth, JWT, social login, external IDPs — ALL possible, but only if explicitly coded into the Lambda function; none of it comes built-in.** ⚠️ **Custom authentication rules: FULL control** — this is the entire point of choosing Lambda authorizer over the other two. **Typical use case**: legacy applications, external/non-standard authentication systems, genuinely bespoke logic.

**⚠️ Exam keyword: "custom authorizer" in a question → the answer is Lambda authorizer.**

---

## Exam Framing

> "An internal API is called only by other AWS services using SigV4-signed requests, with authorization managed through IAM policies" → **IAM.** "A public mobile app needs users to log in via Google or Facebook, using JWT tokens issued after login" → **Cognito.** "An API needs to authenticate against a legacy, non-AWS identity system with completely custom logic" → **Lambda authorizer** — the only option offering full, unrestricted control over the authentication logic itself. The three exam keywords to memorize directly: **SigV4 → IAM; OAuth/JWT → Cognito; custom authorizer → Lambda authorizer.**
`,
    },
    {
      id: "api-gateway-resource-policy",
      title: "API Gateway Resource Policy – The First Gate a Request Passes Through, and Why It's Not Authentication",
      shortDesc: "An API key alone can never restrict WHERE a request comes from — resource policy is the layer that finally can, and it's evaluated before WAF, before the usage plan, before any authorizer",
      visuals: [],
      content: `## What Resource Policy Actually Controls

> **A resource policy controls WHO is allowed to reach an API Gateway at all, and specifically FROM WHERE — a capability API keys structurally cannot provide** (per the earlier API key topic: keys never restrict location). ⚠️ **Resource policy operates at the API Gateway level, evaluated BEFORE the request ever reaches Lambda or any backend service.**

**Concrete controls it enables**: allow/deny specific IP addresses (e.g. only an office's IP range), restrict access to a specific VPC, or restrict access to a specific AWS account (or all accounts within an organization).

---

## ⚠️ The Real Evaluation Order of All Security Layers

> **When a client sends a request, it passes through the security layers in this exact sequence: Resource Policy FIRST → then WAF → then the usage plan (API key/throttling/quota) → then the authorizer (IAM/Cognito/Lambda).** ⚠️ **If resource policy denies the request, it is rejected immediately — none of the later layers (WAF, usage plan, authorizer) are ever even evaluated.** ⚠️ **Resource policy sits at the very top of the entire security stack.**

---

## ⚠️ Resource Policy Is NOT Authentication

> **A common misunderstanding worth explicitly correcting: resource policy does NOT identify a user, and it is NOT a form of authentication.** ⚠️ **It controls FROM WHOM (which IP, VPC, or AWS account) a request can originate — never WHO the specific individual caller is.** Authentication (username/password, tokens, identity) is a fundamentally different concern, handled by the authorizer layer instead.

**Structure**: written in JSON, following the same policy-document format as IAM policies, S3 bucket policies, and KMS key policies — a familiar pattern if those have already been worked with.

---

## ⚠️ Building the API's ARN for the Policy

> **The resource policy references the API's own ARN, which must be manually constructed — it's not directly visible anywhere in the console as a copyable field.** ⚠️ **Format: the fixed prefix "arn:aws:execute-api:" + region (e.g. ap-south-1) + account ID + the API's own ID** — all three variable segments must be filled in correctly for the policy to reference the right API.

---

## ⚠️ Worked Test: IP-Restricted Policy → 403 → Removing It → Success Again

> **Setting a resource policy allowing access only from one specific (deliberately mismatched) IP, then deploying the API**, causes subsequent requests from the actual testing machine to fail with: ⚠️ **"User: anonymous is not authorized" — 403 Forbidden.** ⚠️ **This is the SAME 403 code seen earlier for a missing API key — but here the underlying cause is completely different (IP mismatch at the resource-policy layer, evaluated before the API key was ever even checked).** Removing the policy and redeploying restores normal access.

**⚠️ Mandatory step reinforced again**: any resource policy change requires redeploying the API to the stage before it takes effect — the same pattern already established for method-level changes.

---

## Exam Framing

> "An API needs to be reachable only from a company's specific office IP range, regardless of whether callers have a valid API key" → **resource policy** — this is the ONLY layer that can restrict access by origin (IP/VPC/account); API keys cannot do this at all. "A request is rejected with a 403 error, but the API key being sent is definitely valid" → **check the resource policy** — a 403 can originate from either a missing/invalid API key OR a resource-policy denial (e.g. wrong source IP), and resource policy is evaluated FIRST, before the API key/usage plan layer is ever reached.
`,
    },
    {
      id: "api-gateway-api-key-usage-plan-lab-403-429",
      title: "API Keys and Usage Plans Lab – Two Exam-Critical Error Codes: 403 vs 429",
      shortDesc: "A missing key gets a 403; a valid key that's simply used too much gets a 429 — same overall goal of blocking the request, completely different reason, completely different code",
      visuals: [],
      content: `## The Five-Step Setup Process

1. **Create the API key** (auto-generated string, or a custom one requiring at least 20 characters).
2. **Create a usage plan** (initially with throttling/quota disabled, to test the key alone first).
3. **Associate the usage plan with the REST API's stage.**
4. **Associate the API key with the usage plan.**
5. **Enable "API key required" at the METHOD level — not globally across the whole API.**

⚠️ **Critical: enabling API key requirement is done PER METHOD, not per API.** In this lab, only the POST method has the key requirement enabled — the GET and DELETE methods on the same API continue working without any key at all. ⚠️ **Whenever any method setting changes, the API must be RE-DEPLOYED to the stage** — the change has no effect on live traffic until deployment happens again.

---

## ⚠️ Error 1: 403 Forbidden — No API Key Provided

> **Sending a request to a key-required method WITHOUT supplying the key returns a 403 Forbidden error.** ⚠️ **The fix: the API key must be sent as an HTTP HEADER — specifically the header named** \`x-api-key\` **, with the actual key string as its value.** ⚠️ **Both the exact header name (x-api-key) and the 403 error code for a missing/invalid key are called out as genuine exam-question material.**

---

## ⚠️ Error 2: 429 Too Many Requests — Quota or Throttle Exceeded

> **Once a valid API key is supplied and working, testing the usage plan's QUOTA** (e.g. setting it to 1 request per day, deliberately already exhausted) **produces a completely different error: 429 Too Many Requests, with a "limit exceeded" message.** ⚠️ **This is the SAME 429 code covered in the earlier theory topic for both throttling (rate/burst) and quota violations** — now confirmed hands-on. ⚠️ **The key distinction from 403: 403 means the request was never properly authenticated/authorized at all (missing or wrong key); 429 means the request WAS properly authenticated, but the client has simply used up its allowed usage.**

---

## Exam Framing

> "A request to an API-key-protected method fails with a 403 Forbidden error" → **the API key was missing or invalid — check that the request includes the** \`x-api-key\` **HTTP header with the correct key value.** "A request using a genuinely valid API key still gets rejected" → **check the usage plan's throttling (rate/burst) or quota settings — a 429 Too Many Requests error means the key is valid but the client has exceeded its allowed usage, a completely different failure mode from a 403.** Remember: **API key requirement is toggled per METHOD, not per API — and any method-level change requires redeploying the API to take effect.**
`,
    },
    {
      id: "api-gateway-security-layers-api-keys-usage-plans",
      title: "API Gateway's Four Security Layers, and Why an API Key Alone Does Absolutely Nothing",
      shortDesc: "An API key is just a password string with no concept of a username — it never proves WHO is calling, only that they happen to know a string, and it literally can't function without a usage plan attached",
      visuals: [],
      content: `## ⚠️ API Security Is Never One Feature — It's Four Independent Layers

> **Real-world API security is applied across MULTIPLE layers, each solving a different problem** (⚠️ **explicitly NOT the OSI networking layers — a separate concept entirely**):

1. **Usage control** — API keys and usage plans.
2. **Access control** — API Gateway resource policy.
3. **Edge protection** — AWS WAF.
4. **Authentication and authorization** — IAM, Cognito, Lambda authorizer.

This topic covers Layer 1. ⚠️ **WebSocket API is explicitly noted as out of scope for the Solutions Architect exam — these security features are asked about for REST/HTTP API specifically.**

---

## API Key: Just a Password String, Nothing More

> **An API key is a unique string identifying a calling client — sent with every request, checked by API Gateway before forwarding to the backend.** ⚠️ **Critical framing: it's just a password, with NO username concept at all** — one string value, verified as correct or not, with no identity attached to it.

**⚠️ An API key CANNOT function alone — it requires a Usage Plan to be associated with it, plus that usage plan must itself be associated with a stage.** Without a usage plan, an API key literally does nothing.

---

## Usage Plan: Two Configurable Controls

### Throttling — Controlling Request SPEED

> **Rate**: the average number of requests allowed per second, sustained continuously (e.g. rate=10 means 10 requests/second, indefinitely). **Burst**: ⚠️ **a TEMPORARY allowance above the rate limit, for short traffic spikes only — not sustained.** ⚠️ **Worked example: rate=10, burst=5 → a client can briefly send up to 15 requests at once, before settling back down to the sustained 10/second limit.** ⚠️ **Exceeding the throttling limits (rate + burst combined) returns a 429 "Too Many Requests" error.**

### Quota — Controlling Total VOLUME Over Time

> **Sets a hard cap on the total number of requests allowed over a period — per day, per week, or per month.** ⚠️ **Worked example: 1,000 requests per day — once the 1,000th request is made, the API stops accepting further requests from that key until the quota resets the next day.** ⚠️ **Exceeding the quota also returns a 429 error** — the same error code as throttling, just triggered by a different condition (total volume vs momentary speed).

---

## ⚠️ API Key's Real Limitations — Why More Layers Are Needed

> **API keys do NOT restrict WHERE a request comes from** — any client, from any country or data center, with the correct key string, is accepted. ⚠️ **API keys do NOT provide genuine user authentication** — there's no username, no identity, just a matching string; this is fundamentally different from something like a Google login. ⚠️ **API keys cannot block public internet access by themselves** — a public API remains reachable by anyone who obtains the key. ⚠️ **If a key leaks, it stays usable/misusable until it's explicitly rotated or disabled** — there's no automatic revocation mechanism tied to key exposure.

---

## ⚠️ Support Differences: REST API vs HTTP API

> **REST API fully supports API keys. HTTP API has only LIMITED API key support** — one more item in the ongoing REST-vs-HTTP feature-set tradeoff already established across earlier topics.

---

## Exam Framing

> "An API key alone is configured for a REST API, with no usage plan attached — does the key function?" → **no — an API key structurally cannot work without an associated usage plan (and that plan's stage association); the key alone does nothing.** "A client's requests suddenly spike well above the sustained rate limit for a few seconds, then return to normal" → **the burst setting is what determines whether this brief spike is tolerated or rejected** — burst allows temporary excess above the steady-state rate limit; exceeding rate+burst together returns a 429 error, the same code returned when a longer-term quota (daily/weekly/monthly) is exhausted.
`,
    },
    {
      id: "rest-api-lab-part4-testing-and-keep-resources",
      title: "REST API Lab – Part 4: Testing Complete, and Why Nothing Gets Deleted This Time",
      shortDesc: "Unlike the HTTP API lab where the gateway got deleted afterward, this REST API stays alive — the upcoming API key and usage plan labs are built directly on top of it",
      visuals: [],
      content: `## Testing Follows the Same Postman Pattern as the HTTP API Lab

> **The verification process mirrors the earlier HTTP API lab exactly**: POST to add a record (verified via DynamoDB refresh, response "user created successfully"), GET with a specific user ID to fetch it (record returned correctly), DELETE to remove it (verified via DynamoDB refresh showing the record gone). ⚠️ **The one structural difference: the invoke URL now includes the STAGE name** (e.g. .../dev/user) — a direct consequence of REST API's mandatory stage-deployment step from the earlier topic, which HTTP API's automatic default stage never required naming explicitly in the URL construction the same way.

---

## ⚠️ Critical Instruction: Do NOT Delete Anything This Time

> **Unlike the earlier HTTP API lab (where the API Gateway itself was deliberately deleted afterward, keeping only DynamoDB and Lambda), THIS REST API, its DynamoDB table, and its Lambda functions must ALL be kept.** ⚠️ **Upcoming labs — specifically API keys and usage plans — are built directly on top of THIS SAME REST API**, not a freshly created one. ⚠️ **None of these resources incur cost while idle** (Lambda bills only on invocation; an empty DynamoDB table has negligible RCU/WCU cost) — so keeping everything running between lab sessions is genuinely free.

---

## Exam Framing

> This lecture is primarily lab verification — the one concrete, non-repeated detail worth remembering is the ⚠️ **REST API invoke URL structure explicitly includes the stage name as part of the path** (base URL + stage + resource path, e.g. .../dev/user/101) — directly following from the mandatory stage-deployment requirement established in the previous lab part. Practically: whenever a REST API's resources are correctly configured but requests seem to fail, double-check the invoke URL actually includes the correct stage segment.
`,
    },
    {
      id: "rest-api-lab-part3-methods-and-stage-deployment",
      title: "REST API Lab – Part 3: No Invoke URL Exists Until You Deploy to a Stage — Manually",
      shortDesc: "HTTP API silently gives you a default stage for free; REST API forces you to create one explicitly and deploy to it before an invoke URL exists at all",
      visuals: [],
      content: `## ⚠️ Method, Not Route: One HTTP Method Per Lambda, Created Inside a Resource

> **Where HTTP API used flat "routes" mapped directly to integrations, REST API uses methods (matching the earlier resources-and-methods topic) — each HTTP method (GET, POST, DELETE) must be created SEPARATELY and mapped to its own Lambda function.** ⚠️ **Three Lambda functions → three separate methods, each created inside the correct resource**: POST inside /user (→ create-user function), GET inside /user/{userId} (→ get-user function), DELETE inside /user/{userId} (→ delete-user function). ⚠️ **Lambda proxy integration is enabled for all three**, matching the earlier proxy-integration topic's "let the powerful backend handle everything" pattern.

---

## ⚠️ The Critical New Step: Deploying to a Stage (Mandatory, Unlike HTTP API)

> **In HTTP API, a default stage is created automatically — no manual stage step was ever needed.** ⚠️ **REST API is different: a stage must be EXPLICITLY created, and the API must be deployed to it, before an invoke URL exists at all.** ⚠️ **Without this deployment step, there is simply no way to actually call the API** — all the resources and methods can be perfectly configured, but nothing is reachable until deployment happens.

**The deployment process**: click Deploy API → choose (or create) a stage name (e.g. "dev") → deploy → ⚠️ **API Gateway then generates the invoke URL, in the form of the base URL plus the stage name appended** (e.g. .../dev).

**⚠️ A practical quirk to expect**: the "Deploy API" button can appear grayed out while the API is still processing recent changes — it becomes clickable again once that background update finishes, not immediately after creating the last method.

---

## What Deployment Actually Activates

> **Once deployed, all three methods (POST, GET, DELETE) become genuinely active and callable** — this is the point where the API transitions from "fully configured" to "actually usable," ready for testing via Postman, a browser, or a real frontend.

---

## Exam Framing

> "A REST API's resources and methods are all fully configured, but attempting to call it returns no working URL at all" → **the API was never deployed to a stage** — unlike HTTP API's automatic default stage, REST API requires explicitly creating a stage and deploying the API to it before any invoke URL exists. "Why does HTTP API not require this manual stage-deployment step, while REST API does?" → **HTTP API automatically creates a default stage as part of its simpler, faster setup model; REST API's more explicit, feature-rich configuration model requires deployment to a stage as a deliberate, separate action.**
`,
    },
    {
      id: "rest-api-lab-part2-create-api-resources",
      title: "REST API Lab – Part 2: One Unique URL Path = One Resource, No Exceptions",
      shortDesc: "Needing both /user and /user/{userId} means creating TWO resources, not one — REST API's structure is deliberately one resource per distinct URL path, with no shortcuts",
      visuals: [],
      content: `## Creating the REST API Itself

> **REST API build → provide a name → choose endpoint type → choose a security policy** (this lab specifically uses one supporting BOTH TLS 1.2 and 1.3, for maximum browser compatibility during testing — matching the earlier TLS security policy topic) → **endpoint access mode: basic** (Strict Mode is available but deliberately not used here, to keep the lab simple) → **IP address type: IPv4** (IPv6 dual-stack support is available but skipped for simplicity) → create.

---

## ⚠️ The Rule: Every Unique URL Path Needs Its Own Resource

> **REST API design is fundamentally based on URL paths — each DISTINCT path must be created as a SEPARATE resource, with no exceptions.** ⚠️ **This lab needs two different URL patterns**: /user (to fetch all users) and /user/{userId} (to fetch or delete one specific user) — ⚠️ **meaning TWO resources must be created, not one, even though they're closely related.**

**Building the resource tree**:
1. **/user** — created directly as a child of the auto-generated root ("/") resource (matching the resource-hierarchy rule from the earlier topic).
2. **/user/{userId}** — created as a CHILD of /user specifically, not of root directly. ⚠️ **The curly braces around userId mark it as a PATH PARAMETER — a placeholder that gets substituted with an actual value at request time** (e.g. /user/101), since userID is the DynamoDB table's primary key and is what identifies exactly which record to operate on.

---

## What This Sets Up for the Next Step

> **With both resources created, the next step (covered separately) is attaching HTTP methods to each** — /user will get a method for listing/creating users, /user/{userId} will get methods for reading or deleting one specific user, directly mirroring the CRUD design already established in the earlier HTTP API lab.

---

## Exam Framing

> "A REST API needs to support both fetching a list of all users and fetching one specific user by ID" → **two separate resources must be created — /user and /user/{userId} — since REST API requires one resource per distinct URL path, never combining multiple paths into a single resource.** "What do curly braces around a resource path segment (e.g. {userId}) signify?" → **a path parameter — a placeholder substituted with an actual value at request time**, used specifically when a URL segment needs to identify a specific record (like a primary key) rather than being a fixed, unchanging path.
`,
    },
    {
      id: "rest-api-method-request-settings",
      title: "REST API Method Request Settings – The Security Gate That Runs BEFORE the Backend Is Ever Called",
      shortDesc: "Method request settings check the request and reject it right at the gate, before it ever reaches Lambda — a request that fails validation here never triggers the backend at all",
      visuals: [],
      content: `## ⚠️ The Security-Gate Analogy

> **Method request settings define rules a client's request must satisfy BEFORE the backend is ever called.** ⚠️ **Think of it as a security gate at an office entrance — checking ID, entry permission, and purpose before letting anyone in.** ⚠️ **In the request flow, method request checks happen BEFORE the integration request (i.e. before the backend is triggered at all)** — a request failing here is rejected outright, and the backend never even sees it.

---

## Setting 1: Authorization — Who Is Allowed to Call This Method

**Four authorization options**:
1. **None** — no authorization at all; anyone can call the API. Appropriate for a genuinely public API.
2. **AWS IAM** — only AWS users/roles with proper IAM permission can call the API (e.g. a request originating from an EC2 instance's attached role).
3. **Cognito User Pool** — ⚠️ **requires a Cognito User Pool to already exist in the account** (this option is unavailable/hidden until one is created) — only logged-in users, authenticated via a JWT token from Cognito, can call the API.
4. **Lambda Authorizer** — fully custom authorization logic, written and hosted in a separate Lambda function, for any bespoke authentication requirement not covered by the other three.

**Worked example**: a POST /create-order endpoint requiring authorization — a non-logged-in user gets a 401 Unauthorized error; a logged-in, properly authenticated user's request is allowed through.

---

## Setting 2: Request Validator — Checking Required Data Is Present

> **Request validator checks whether required data actually exists in the incoming request** — not authentication, just structural completeness. ⚠️ **Four options: None, Validate Body, Validate Query String Parameters and Headers, and Validate Body + Query String Parameters + Headers.**

### Validate Body

> **Checks only that the request body is present and matches an expected structure.** ⚠️ **Commonly used for POST, PUT, and PATCH methods**, since these are the ones that typically carry a meaningful body. Worked example: a POST /create-user request must include a body with userID, username, and email — request validator confirms this structure exists before the request ever reaches the Lambda function that would actually create the record.

### Validate Query String Parameters and Headers

> **HTTP headers**: extra information sent alongside the request, NOT part of the URL and NOT part of the request body. ⚠️ **Headers are optional by default** — only relevant when the API needs authentication tokens, usage tracking, or metadata (e.g. requiring an API key to be present in a specific header). ⚠️ **A required-header check verifies the named header is present** — a missing required header causes rejection right at the gate.

> **Query string parameters**: key-value pairs appended to the URL after a "?" — ⚠️ **most commonly used with GET requests.** Worked example: GET /user?id=101 — the query string parameter id=101 tells the backend which specific user record to fetch. ⚠️ **Best practice: mark id as a required query parameter** so a GET request missing it is rejected before ever reaching the backend, rather than the backend having to handle a missing-parameter case itself.

---

## Exam Framing

> "An API needs to reject a request missing a required query string parameter BEFORE the Lambda function is even invoked" → **configure a request validator set to validate query string parameters and headers, marking the specific parameter as required** — this check happens entirely at the method-request stage, ahead of the integration request, so an invalid request never triggers (or bills for) the backend at all. "An API should only be callable by AWS resources with proper IAM permissions, not the general public" → **set the method's Authorization setting to AWS IAM** — distinct from Cognito User Pool (end-user login via JWT) and Lambda Authorizer (fully custom logic).
`,
    },
    {
      id: "rest-api-proxy-integration",
      title: "REST API Proxy Integration – The Courier Boy Who Never Opens the Parcel",
      shortDesc: "Proxy mode forwards the request completely untouched, letting a powerful backend handle everything itself — turn it off specifically when a legacy backend needs API Gateway to reshape the request first",
      visuals: [],
      content: `## ⚠️ The Courier Boy Analogy

> **Proxy integration means API Gateway forwards the FULL request to the backend without changing anything at all — no filtering, no modification, no extra processing.** ⚠️ **API Gateway = a courier boy who never opens the parcel, just delivers it exactly as received; the backend (Lambda/HTTP server) = the office worker who actually opens it, reads it, and decides what to do.** ⚠️ **With proxy integration enabled, API Gateway is purely a pass-through — the backend gets the raw, unmodified request and is fully responsible for interpreting it.**

---

## ⚠️ What Gets Forwarded Untouched

> **In proxy mode, everything from the original request passes through as-is**: HTTP method, URL path, query parameters, HTTP headers, and the request body — all forwarded exactly as the client sent them, with zero transformation by API Gateway.

**⚠️ Supported by**: Lambda, HTTP, and VPC Link integrations. ⚠️ **NOT available for AWS service integration** — direct AWS service calls always require the request/response mapping covered in the earlier integration-types topic, since the target service needs its own specific request format.

---

## ⚠️ When to Enable Proxy Integration (the common case — ~90% of modern setups)

> **Use it when**: a simple, fast setup is wanted; the backend is genuinely powerful enough to handle raw requests entirely on its own; API Gateway-level complexity isn't needed; building a modern REST API where the backend already does all its own request parsing and validation. ⚠️ **In most modern applications, the backend is capable enough that this is the default, near-universal choice.**

## ⚠️ When to Disable Proxy Integration

> **Use it when**: API Gateway itself needs to modify the request, filter specific fields, or change the response format — i.e. logic needs to live in API Gateway, not the backend. ⚠️ **The classic real-world case: a legacy backend expects a fixed, older request format, but modern clients send extra fields the legacy system doesn't understand** — API Gateway can filter those extra fields out before forwarding, something proxy mode structurally cannot do since it never inspects the request at all.

---

## Response Transfer Mode: Buffered vs Streamed (Only Relevant When Proxy Is On)

> **Buffered (the common case, ~90% of setups)**: ⚠️ **API Gateway waits for the backend to complete its FULL response before forwarding anything to the client.** **Streamed**: ⚠️ **the backend's response is forwarded to the client in chunks, AS it's generated — the client starts receiving data while the backend is still actively working**, rather than waiting for full completion.

---

## ⚠️ Integration Timeout: Where the 504 Error Comes From

> **The maximum time API Gateway will wait for a backend response before giving up.** ⚠️ **If the backend doesn't respond within this configured time limit, API Gateway returns a 504 error to the client** — regardless of whether the backend eventually would have responded, the client sees a timeout failure once the limit is exceeded.

---

## Exam Framing

> "An API needs to filter out extra fields a legacy backend doesn't understand, or reshape the request before it reaches the backend" → **disable proxy integration** — proxy mode forwards the request completely untouched, so any request modification must happen with proxy OFF, using API Gateway's own mapping/transformation logic instead. "A client receives a 504 error from an API Gateway-fronted API" → **the backend didn't respond within the configured integration timeout** — this is specifically an API Gateway timeout, distinct from a backend-side error response. Remember: **buffered response mode waits for the FULL backend response before forwarding; streamed mode forwards data in chunks as the backend produces it.**
`,
    },
    {
      id: "rest-api-integration-types",
      title: "REST API Integration Types – Five Backends, and Why VPC Link Can't Reach a Private Backend Alone",
      shortDesc: "VPC Link doesn't talk directly to whatever's in your private subnet — it can only reach an ALB or NLB sitting in front of it, which is what actually forwards traffic the rest of the way",
      visuals: [],
      content: `## What Integration Type Actually Decides

> **Integration = where a method's request actually gets sent once the client calls it.** ⚠️ **REST API supports FIVE integration types**, each suited to a different backend scenario.

---

## The Five Integration Types

1. **Lambda function** — the most popular option; API Gateway invokes Lambda and returns its response. The standard choice for serverless backends.
2. **HTTP** — forwards the request to any public HTTP endpoint (e.g. a company's own backend on EC2 or on-premises) — a simple pass-through, no AWS service involved.
3. **Mock** — no real backend at all; API Gateway returns a fixed, predefined response. ⚠️ **Purpose-built for testing and demos**, not real traffic.
4. **VPC Link** — a private bridge between API Gateway and resources inside a VPC.
5. **AWS service** — API Gateway calls an AWS service (S3, DynamoDB, SQS, SNS, Kinesis, etc.) DIRECTLY, with no Lambda function in between.

---

## ⚠️ VPC Link: Why It Can't Reach the Private Backend Directly

> **API Gateway is public; backend services can live in a private VPC subnet with no public access at all.** ⚠️ **VPC Link cannot communicate directly with resources sitting in that private subnet — it specifically requires an ALB or NLB in between.** ⚠️ **The real chain: API Gateway → VPC Link → ALB/NLB → the actual private backend.** VPC Link is the bridge to the load balancer, not directly to the backend resource itself.

**⚠️ Version history matters**: ⚠️ **VPC Link v1 supports ONLY NLB; VPC Link v2 (the newer version) adds support for ALB as well** — so a modern VPC Link setup can front either load balancer type, but the older v1 was NLB-only.

**Why this matters**: it enables secure backend access without ever exposing the private resource to the public internet.

---

## AWS Service Integration: Direct, No Lambda Needed

> **API Gateway can call AWS services directly — S3, DynamoDB, SQS, SNS, Kinesis — completely bypassing Lambda.** ⚠️ **This requires: an IAM role granting the API Gateway permission to call the target service, AND request/response mapping (via Velocity Template Language / mapping templates)** to translate between the incoming HTTP request and whatever format the target AWS service expects. Example: a POST request configured to push records directly into a Kinesis Data Stream, with zero Lambda function involved anywhere in the flow.

---

## ⚠️ REST API vs HTTP API: Breadth of AWS Service Integration

> **Both REST API and HTTP API support HTTP, VPC Link, and AWS service integration types** — but ⚠️ **REST API supports a genuinely BROADER, more flexible set of AWS service integrations, with advanced mapping capabilities; HTTP API supports only a LIMITED set of service integrations**, designed specifically for simpler, lower-cost use cases.

---

## ⚠️ Exam Tip: The Deciding Question

> ⚠️ **"Direct integration with MANY AWS services, complex mapping requirements" → REST API.** ⚠️ **"Simple, low-cost API with a LIMITED set of AWS service integrations" → HTTP API.** This is a direct extension of the earlier cost/feature-set tradeoff already established between the two API types — broader integration flexibility is simply one more item on REST API's side of that tradeoff.

---

## Exam Framing

> "A REST API needs to push data directly into a Kinesis Data Stream, without any Lambda function in the middle" → **AWS service integration** — API Gateway calling Kinesis directly, requiring an IAM role plus request/response mapping templates. "An API Gateway needs to reach a backend service sitting in a private VPC subnet with no public IP" → **VPC Link — but remember it requires an ALB or NLB in front of that private resource; VPC Link itself cannot connect directly to the private backend.** Choosing between REST and HTTP API purely on integration breadth: **many AWS services + complex mapping → REST API; simple + limited integrations + lower cost → HTTP API.**
`,
    },
    {
      id: "rest-api-resources-and-methods",
      title: "REST API – Resources and Methods: The Structural Layer HTTP API Doesn't Have",
      shortDesc: "HTTP API just has flat routes triggering an integration directly — REST API forces every request through a resource-then-method hierarchy, which is exactly where all its advanced features actually live",
      visuals: [],
      content: `## ⚠️ The Structural Difference From HTTP API

> **HTTP API's flow is flat and simple: client sends a request → the matching route triggers its integration directly.** ⚠️ **REST API adds an extra structural layer: create a RESOURCE first, then create a METHOD inside that resource — and the method is where ALL of REST API's advanced features actually get configured** (request/response inspection, validation, transformation, and everything else covered in earlier topics).

---

## Resources: URL Paths, Organized in a Tree Under the Root

> **A resource = a URL path** (e.g. /user, /product). ⚠️ **Every REST API automatically gets ONE default resource called "/" — the route resource** — created automatically, and it can NEVER be deleted, since it's the mandatory root every other resource nests under.

**⚠️ Every additional resource is created as a CHILD of the root (or of another resource) — nothing can exist parallel to root.** Example: creating /users makes it a child resource of "/". ⚠️ **Child resources can themselves have children** — e.g. /user/{id} as a child of /user — mirroring the classic use case of "/users" listing all users vs "/user/{id}" fetching one specific user.

**Invoke URL structure**: the base API Gateway URL + stage, with the resource's path appended — root resource contributes nothing extra to the URL; a child resource like /users appends exactly that segment.

---

## ⚠️ Methods: Where the Actual REST API Features Live

> **A method = an HTTP verb attached to a specific resource.** ⚠️ **Methods can ONLY exist inside a resource — there's no such thing as a method without a resource** (even the root "/" resource itself can have methods attached directly to it). ⚠️ **This is the critical structural rule: ALL of REST API's advanced features — method type, integration type, proxy integration, request settings, query parameters, headers, request body validation — are configured AT THE METHOD LEVEL**, not at the resource level.

---

## Supported HTTP Method Types

> **GET** (read data), **POST** (add a new record), **PUT** (full update/replace), **PATCH** (partial update), **DELETE** (remove a record), **HEAD** (headers only, no body), **OPTIONS** (used for CORS), and ⚠️ **ANY — a special catch-all matching EVERY HTTP verb, routing all of them to ONE single backend integration.**

**⚠️ Best practice vs the ANY shortcut**: ⚠️ **creating separate Lambda functions per method (matching the earlier lab's approach — one function per CRUD operation) is the established best practice**, since it keeps each function focused on one job. ⚠️ **ANY is explicitly flagged as more advanced/complex, letting one function handle everything — a valid option, but not the recommended default pattern.**

---

## Exam Framing

> "In REST API, where are advanced features like request validation, transformation, and integration type actually configured?" → **at the METHOD level, not the resource level** — a resource is purely a URL path; the method (the HTTP verb attached to that path) is where every REST-API-specific capability actually gets set up. "Can a resource be created that sits parallel to the root '/' resource, rather than nested under it?" → **no — every resource, without exception, is created as a child somewhere under the root resource**, which itself cannot be deleted since it's the mandatory starting point for the entire resource tree.
`,
    },
    {
      id: "api-gateway-strict-mode-domain-fronting",
      title: "API Gateway Strict Mode – Catching a Domain-Fronting Attack by Checking If the TLS Handshake Lies About the HTTP Request",
      shortDesc: "A normal request always names the same domain twice — once during the TLS handshake, once in the HTTP host header — domain fronting exploits the rare case where those two names quietly disagree",
      visuals: [],
      content: `## ⚠️ When Endpoint Access Mode Even Appears

> **Endpoint Access Mode (Basic vs Strict) only shows up when a strong/modern security policy is selected — e.g. TLS 1.3 or post-quantum cryptography.** ⚠️ **Selecting an older/legacy TLS version (e.g. TLS 1.0) makes this option disappear entirely** — Strict Mode is fundamentally tied to using a modern TLS policy, not a standalone independent setting.

**Basic mode**: allows all clients to access the API — no additional protection beyond the TLS policy itself. **Strict mode**: adds real, additional protection — specifically against domain-fronting attacks.

---

## ⚠️ Understanding Domain Fronting First

> **Every client-to-API request actually involves TWO separate steps that name a domain**: (1) the **TLS handshake**, where the client sends a Server Name Indication (SNI) saying essentially "I want to connect to api.example.com," and the server responds with its certificate, and (2) the actual **HTTP request**, which includes a **hostname** in its Host header — normally the SAME domain named in step 1.

**⚠️ In a NORMAL, legitimate request, the SNI (from the TLS handshake) and the HTTP Host header ALWAYS match** — both name the same domain, e.g. api.example.com in both places.

**⚠️ Domain fronting exploits the case where they DON'T match**: the TLS handshake claims one domain (e.g. api.example.com, giving the connection a legitimate-looking certificate), but the actual HTTP request's Host header names a completely DIFFERENT domain. ⚠️ **This mismatch lets an attacker hide or misroute traffic behind a legitimate-looking TLS connection** — the TLS handshake succeeds normally, but the request gets routed somewhere the client never openly declared during the handshake.

---

## ⚠️ What Strict Mode Actually Checks

**Check 1 — Same endpoint type**: ⚠️ **the incoming request must originate from the SAME endpoint type the API is actually configured for.** A regional API must receive requests via the regional path; a private API must receive requests via its VPC endpoint; an edge-optimized API must receive requests via CloudFront. ⚠️ **A request arriving through the "wrong" path for the configured endpoint type is rejected outright.**

**Check 2 — SNI-to-hostname matching**: ⚠️ **available ONLY for regional and private endpoints** — strict mode verifies that the domain named in the TLS handshake's SNI genuinely matches the domain named in the HTTP request's Host header. ⚠️ **A mismatch means the request is REJECTED — this is exactly what prevents a domain-fronting attack from succeeding.**

**⚠️ For edge-optimized endpoints specifically, SNI/hostname matching is NOT performed by strict mode directly — instead, protection against domain fronting comes from CloudFront's own built-in domain-fronting protection**, since edge-optimized APIs are always fronted by CloudFront anyway.

---

## Exam Framing

> "An attacker successfully establishes a TLS connection claiming to be api.example.com, but the actual HTTP request inside that connection targets a completely different, unrelated domain" → **this is a domain-fronting attack** — enabling Strict Mode on the REST API's endpoint access setting rejects requests where the TLS SNI and the HTTP Host header don't match, directly closing this attack path. "Does Strict Mode's SNI/hostname verification apply the same way to an edge-optimized endpoint as it does to a regional endpoint?" → **no — SNI/hostname matching is Strict Mode's own mechanism for regional and private endpoints specifically; edge-optimized endpoints instead rely on CloudFront's own built-in domain-fronting protection**, since those requests are always routed through CloudFront first.
`,
    },
    {
      id: "rest-api-tls-security-policy",
      title: "REST API TLS Security Policy – Options Are Endpoint-Type-Dependent, and Scoped Only to the Default Invoke URL",
      shortDesc: "The available TLS policy options change based on which endpoint type was already selected — and whatever's chosen here only governs AWS's default invoke URL, never a custom domain, which gets its own separate policy",
      visuals: [],
      content: `## What TLS Actually Does

> **TLS (Transport Layer Security) encrypts the connection between the client and API Gateway** — preventing attackers from reading the data in transit, blocking man-in-the-middle attacks, and confirming the client is genuinely talking to the real API Gateway. ⚠️ **Think of it as a secure tunnel between client and API** — it's the mechanism behind the difference between an HTTP site and an HTTPS site.

---

## ⚠️ Available Security Policies Depend on the Endpoint Type Already Chosen

> **The TLS security policy options shown are directly tied to whichever endpoint type (regional, edge-optimized, private) was already selected earlier** — ⚠️ **choosing regional highlights ONLY the policies applicable to regional endpoints; choosing edge-optimized highlights only ITS applicable policies; the other endpoint types' policies stay grayed out** — the two settings aren't independent choices.

---

## What the Security Policy Controls

> **Minimum TLS version, allowed cipher suites, and whether FIPS mode is required.**

**TLS version options**: ⚠️ **TLS 1.2 (introduced 2008, strong encryption, broadly supported by modern browsers/apps) vs TLS 1.3 (released 2018, faster handshake, better performance, more secure than 1.2 — becoming the modern standard)** — the general guidance: **prefer TLS 1.3 whenever the client/application supports it.**

**Additional modifiers**:
- **FIPS** (Federal Information Processing Standard): ⚠️ **government-approved cipher requirements — specifically needed for US government, Department of Defense, banking, and health-sector compliance use cases.**
- **PFS** (Perfect Forward Secrecy): ⚠️ **the encryption key changes for every new connection** — even if a key is later stolen, only that one connection's data is compromised, not all past traffic.
- **PQC** (Post-Quantum Cryptography): encryption specifically designed to remain unbreakable even by future quantum computers, which are expected to eventually break traditional encryption methods.

---

## ⚠️ Critical Scoping Rule: This Policy Applies ONLY to the Default AWS Invoke URL

> **The security policy chosen here governs ONLY the AWS-provided default invoke URL** (the auto-generated URL used for testing, e.g. via Postman) — ⚠️ **it does NOT apply to a custom domain, if one is later configured.** ⚠️ **A custom domain gets its OWN, separately-configured security policy** — meaning a REST API can genuinely have two different TLS policies active simultaneously: one for the default invoke URL, another for the custom domain.

**⚠️ Custom domains also unlock additional security features the default invoke URL doesn't offer**: custom SSL/TLS certificates, mutual TLS (mTLS) authentication, and hostname validation — covered in a later dedicated custom-domain topic.

---

## Exam Framing

> "A REST API needs the strongest, most modern TLS protection available, assuming the client fully supports it" → **TLS 1.3** — faster handshake, better performance, and more secure than TLS 1.2, the recommended default whenever client support allows it. "Does configuring a TLS security policy for a REST API automatically apply that same policy to a later-configured custom domain?" → **no — the security policy chosen during REST API creation applies ONLY to the default AWS invoke URL; a custom domain requires its own separately configured security policy.**
`,
    },
    {
      id: "rest-api-endpoint-types",
      title: "REST API Endpoint Types – Regional, Edge-Optimized, Private, and the One-Endpoint-Per-API Rule",
      shortDesc: "One REST API gets exactly ONE endpoint type — needing both public and VPC-only access means creating two separate APIs, never one API switching between modes",
      visuals: [],
      content: `## ⚠️ Three Endpoint Types, Each Controlling How Clients Reach the API

> **REST API supports three endpoint types, each deciding how clients physically reach the API and how AWS routes the request internally.**

---

## Regional Endpoint

> **The API deploys into ONE specific AWS region — clients connect directly over the internet, and the request travels straight to that region.** ⚠️ **Flow: client → internet → API Gateway (in its one region) → backend logic (Lambda, etc.)**

**When to use**: users are geographically near the API's region — e.g. an India-focused application hosted in ap-south-1, used almost entirely by users in India, gets genuinely low latency.

**⚠️ Limitation**: users far from the region experience meaningfully higher latency — a US or European user hitting an India-hosted regional API has to route all the way to India for every request.

---

## Edge-Optimized Endpoint

> **Uses Amazon's global CDN (CloudFront) in front of the REST API — solving regional endpoint's international-latency problem.** ⚠️ **Flow: global client → connects to their NEAREST CloudFront edge location → CloudFront routes the request to the API's actual region.** ⚠️ **The API still physically lives in one region — CloudFront just gets users to that region faster** by using AWS's global edge network for the first hop.

**When to use**: a public API with genuinely global users — e.g. a mobile app used across many countries needing consistently low latency worldwide.

**⚠️ Limitations**: slightly more expensive (CloudFront usage adds cost), and latency can occasionally be higher due to CloudFront propagation delay when changes are first deployed.

---

## Private Endpoint

> **Accessible ONLY from within a VPC — never from the public internet at all.** ⚠️ **Flow: a resource inside a VPC (EC2, Lambda, ECS) → VPC interface endpoint → private API Gateway.** ⚠️ **A VPC interface endpoint MUST be explicitly created to provide this connectivity** — the API Gateway itself isn't placed inside the VPC; the endpoint is what bridges the VPC to the private API.

**When to use**: internal company APIs, secure backend-to-backend communication where public internet access must be structurally blocked. ⚠️ **"Only accessible inside the VPC" isn't really a limitation here — it's the entire point of choosing this endpoint type.**

---

## ⚠️ The Critical Rule: One API, One Endpoint Type — Never Multiple

> **A single REST API can have ONLY ONE endpoint type — regional, edge-optimized, OR private, never a combination, and never switchable per-request.** ⚠️ **If a use case genuinely needs BOTH public access AND VPC-only access, the solution is creating TWO SEPARATE REST APIs** — one configured regional (or edge-optimized) for public access, and a second configured private for VPC-only access — never one API attempting to serve both modes.

---

## Exam Framing

> "An application needs to serve both public internet users AND internal VPC-only backend services from the same logical API" → **two separate REST APIs are required — one public-facing (regional or edge-optimized) and one private** — a single REST API cannot have more than one endpoint type. "A public API serves users spread across multiple continents, and latency needs to be minimized for all of them" → **edge-optimized endpoint**, using CloudFront's global edge network to get each user to the API's region via the shortest possible path — plain regional endpoint would leave distant users with meaningfully higher latency.
`,
    },
    {
      id: "api-gateway-lab-part4-postman-testing-and-cleanup",
      title: "API Gateway Lab – Part 4: Testing From Outside AWS With Postman, and What to Delete (and Not Delete) Afterward",
      shortDesc: "Postman stands in for a real frontend entirely — the earlier Lambda console tests only proved the backend logic worked, this is the first time the request genuinely originates from OUTSIDE AWS",
      visuals: [],
      content: `## ⚠️ Postman Replaces the Need to Build a Real Frontend

> **Postman is a free tool for sending HTTP requests manually, without writing any actual frontend application code.** ⚠️ **This step is meaningfully different from the earlier Lambda console testing (Part 2)** — those tests proved the Lambda logic worked correctly in isolation, but the request still originated from INSIDE the AWS console. ⚠️ **Testing via Postman means the request genuinely comes from outside AWS entirely** — proving the full public-facing chain (Postman → API Gateway's invoke URL → Lambda → DynamoDB) actually works end to end, exactly as a real mobile or web app would experience it.

---

## Testing All Three Routes

> **Every test uses the API's "invoke URL"** (found on the API Gateway console) as the base, with the specific route path and HTTP method set in Postman.

1. **Create (POST /user)**: Postman method = POST, URL = invoke URL + /user, body = JSON payload with the new user's data → send → response confirms "user created successfully" → ⚠️ **verified independently by refreshing the DynamoDB table and seeing the new record actually appear.**
2. **Get (GET /user/{userId})**: Postman method = GET, URL includes the specific user ID in the path → send → the exact record (email, name, etc.) is returned in the response.
3. **Delete (DELETE /user/{userId})**: same URL pattern as GET, method changed to DELETE → send → confirms deletion → ⚠️ **verified two ways: refreshing DynamoDB shows the record is gone, AND re-sending the same GET request now returns "user not found"** — proving the delete genuinely took effect, not just that the delete call itself succeeded.

---

## ⚠️ Cleanup: What Gets Deleted vs What Stays

> **Only the API Gateway itself gets deleted after this lab** — ⚠️ **the DynamoDB table and all three Lambda functions are deliberately KEPT**, because the upcoming follow-up lab reuses them, swapping ONLY the API Gateway from HTTP API to REST API to directly compare the two hands-on. ⚠️ **Keeping the Lambda functions and DynamoDB table costs nothing extra**: Lambda only bills when actually triggered, and an empty DynamoDB table (no records) incurs no meaningful RCU/WCU charges — so leaving them in place between labs is genuinely free.

---

## Exam Framing

> "Why test an API through a tool like Postman rather than only testing the underlying Lambda functions directly from the Lambda console?" → **Postman genuinely originates the request from OUTSIDE AWS, proving the full public-facing chain (API Gateway's invoke URL → routing → Lambda → DynamoDB) actually works — Lambda-console testing only verifies the backend logic in isolation, not the complete integration.** "A lab is about to be repeated with a different API Gateway type (REST instead of HTTP) — what should be deleted between the two lab runs?" → **only the API Gateway itself — the underlying Lambda functions and DynamoDB table should be kept and reused**, since they cost nothing when idle and swapping just the gateway type is the entire point of the comparison exercise.
`,
    },
    {
      id: "api-gateway-lab-part3-http-api-routes",
      title: "API Gateway Lab – Part 3: One HTTP API, Three Routes, Each Mapped to Its Own Lambda Function",
      shortDesc: "Lambda has no public HTTP endpoint at all — it literally cannot be invoked from outside AWS without something in front of it, which is the whole reason API Gateway exists in this flow",
      visuals: [],
      content: `## ⚠️ Why a Mobile App Can't Just Call Lambda Directly

> **A Lambda function has NO public HTTP endpoint of its own — it structurally cannot be triggered directly from the internet, and doing so wouldn't be secure even if it were technically possible.** ⚠️ **API Gateway acts as the "front desk"**: it accepts requests from the outside world (the mobile/web app) and forwards them to the correct Lambda function based on the request's path and method.

**API Gateway's responsibilities here**: accept the HTTP request from the client, route it to the correct Lambda function (based on URL path + HTTP method), and send the Lambda function's response back to the caller. ⚠️ **Note: input validation, throttling, and WAF-style security are NOT part of this specific lab, since HTTP API is being used — these ARE available on REST API**, covered in the follow-up REST API version of this same lab.

---

## ⚠️ One Single HTTP API, Three Separate Routes

> **Only ONE HTTP API needs to be created — "user-API"** (IPv4, default stage — stages like dev/production are a separate concept for later, not needed for this simple lab). ⚠️ **All three CRUD operations are handled by THIS SAME API, differentiated purely by route (path + method), not by creating three separate APIs.**

**The three routes, each attached to its own Lambda integration**:

1. **POST /user** → attach integration → **create user function.** Triggered whenever the frontend sends a POST request to the /user path.
2. **GET /user/{userId}** → attach integration → **get user function.** ⚠️ **Note the path pattern includes a user ID placeholder** — this route reads a SPECIFIC user's record based on the ID in the URL.
3. **DELETE /user/{userId}** → attach integration → **delete user function.** ⚠️ **Same path pattern as GET** (/user/{userId}), but a different HTTP method, routed to a different Lambda function entirely.

⚠️ **This demonstrates a key API Gateway capability: the SAME path (/user/{userId}) can support multiple HTTP methods, each independently routed to a completely different backend integration** — the method itself, not just the path, is part of what determines which Lambda function actually gets triggered.

---

## What Exists After This Step

> **Once all three routes are created and integrated, API Gateway provides a "trigger URL"** — the actual public endpoint the frontend will call. ⚠️ **The lab can be fully tested even WITHOUT building a real frontend** — the next lab step demonstrates testing this trigger URL directly, without needing an actual mobile or web app built first.

---

## Exam Framing

> "Why can't a mobile app invoke a Lambda function directly, without any intermediary service?" → **Lambda has no public HTTP endpoint at all — it structurally cannot be triggered from outside AWS on its own, which is exactly the gap API Gateway fills.** "How does a single API Gateway route both a POST /user request and a GET /user/{userId} request to two completely different Lambda functions?" → **each route is defined by the COMBINATION of path AND HTTP method** — the same path can support multiple methods, each independently mapped to its own backend integration, which is exactly how this lab's three CRUD routes coexist on one API.
`,
    },
    {
      id: "api-gateway-lab-part2-lambda-functions",
      title: "API Gateway Lab – Part 2: Testing Each Lambda Function Directly, Before API Gateway Even Enters the Picture",
      shortDesc: "Every Lambda function gets triggered and verified straight from the Lambda console's own Test feature first — proving each function works standalone before wiring API Gateway on top of it",
      visuals: [],
      content: `## ⚠️ Same Pattern Repeated Three Times, Once Per CRUD Operation

> **Each of the three Lambda functions (create user, get user, delete user) follows the identical setup process**: create a new Lambda function from scratch, attach the existing IAM role created in Part 1 (Lambda-DynamoDB-execution-role — reused for all three, no need to create a new role each time), paste in the provided function code, deploy, then test directly from the Lambda console.

---

## ⚠️ Critical Verification Step: Test Each Function BEFORE Wiring API Gateway

> **Every function is tested directly from the Lambda console's own "Test" feature — creating a test event with a JSON payload matching what the function expects, then running it and inspecting both the function's response and the actual DynamoDB table.** ⚠️ **This is deliberate: proving each Lambda function works correctly in isolation FIRST, before adding API Gateway on top, makes any later issue much easier to isolate** — if something breaks after API Gateway is wired in, the Lambda logic itself is already confirmed working.

**Create user function test**: a JSON payload representing a new user record → running the test returns success code 201 ("user created successfully") → refreshing the DynamoDB table's item view confirms the new record actually exists.

**Get user function test**: a payload specifying a user ID to look up → ⚠️ **tested with BOTH a valid existing ID (returns the record successfully) AND a non-existent ID (returns a "user not found" response)** — verifying both the success and not-found code paths work correctly, not just the happy path.

**Delete user function test**: a payload specifying the user ID to remove → running the test confirms deletion, and refreshing the DynamoDB table shows the record is genuinely gone.

---

## ⚠️ Why Only Three Functions, Not Four (No Update)

> **A fourth Lambda function (update) could technically be added, but is deliberately left out of this lab** — ⚠️ **explicitly to avoid unnecessary complexity, since the lab's actual purpose is teaching API Gateway's mechanics, not building an exhaustive CRUD reference implementation.**

---

## Exam Framing

> "Before wiring API Gateway on top of a set of Lambda functions, what's the recommended verification step?" → **test each Lambda function directly from the Lambda console's own Test feature first** — confirming the backend logic works in isolation makes it far easier to isolate whether a later integration issue is in the Lambda code or in the API Gateway configuration. This is the same "verify each layer before adding the next" discipline that appears throughout AWS troubleshooting generally.
`,
    },
    {
      id: "api-gateway-lab-part1-prerequisites",
      title: "API Gateway Lab – Part 1: DynamoDB Table, Separated Lambda Functions, and the IAM Role Lambda Needs to Even Talk to DynamoDB",
      shortDesc: "Three separate Lambda functions instead of one, on purpose — cramming create/read/delete into a single function works technically, but violates separation of concerns and becomes harder to test and maintain",
      visuals: [],
      content: `## Step 1: Create the DynamoDB Table (the Backend)

> **Table name: "user_table"** (use the exact same name — it gets referenced directly in the Lambda code in the next lab part). **Partition key: "userID"** (note the capitalization — capital ID, everything else lowercase), **type: String.** No other settings need to be touched.

---

## ⚠️ Step 2 (Conceptual): Why an API Is Needed at All

> **A mobile app (React Native, Flutter, etc.) cannot talk to the DynamoDB table directly** — the same "frontend can never reach DynamoDB directly" rule from the earlier CRUD topic, now applied concretely. ⚠️ **APIs are needed specifically to store new records, fetch records, and delete records** on behalf of the frontend.

**API logic** = the actual backend code that runs when a user saves, fetches, or deletes data — can be written in any language (Python, Node.js, Java, PHP, Go), and can be hosted on any compute platform (Lambda, EC2, ECS, EKS). This lab specifically uses Lambda.

---

## ⚠️ Three SEPARATE Lambda Functions, Deliberately — Not One Combined Function

> **The plan: create user function, get user function, delete user function — three distinct Lambda functions, each handling exactly one CRUD task.** ⚠️ **Technically, all three tasks COULD be crammed into a single Lambda function — but this is explicitly called out as bad practice.** ⚠️ **Reasoning: a single combined function becomes messy and harder to manage; separate, single-purpose functions follow the separation-of-concerns principle, and are genuinely easier to test and maintain.** This directly echoes the "each microservice does one job" principle from the earlier microservices topic, now applied at the individual-function level.

---

## Step 3: The IAM Role Lambda Needs to Access DynamoDB

> ⚠️ **AWS services cannot act on each other by default — a Lambda function needs an explicit IAM role granting it permission before it can read or write DynamoDB at all.** ⚠️ **The analogy: just like a person can't enter a building without an ID card, Lambda needs a "digital permission card" (an IAM role) to access DynamoDB** — without it, every DynamoDB operation from the Lambda functions would simply fail.

**Creating the role**: IAM → Roles → Create role → trusted entity **Lambda** → attach **AmazonDynamoDBFullAccess** (both v1 and v2 versions selected) → name it **"Lambda-DynamoDB-execution-role"** (use this exact name — it gets referenced again in upcoming lab steps).

⚠️ **Best-practice callout, explicitly acknowledged and deliberately skipped for this lab**: production should scope this permission to the SPECIFIC DynamoDB table only, not full account-wide DynamoDB access — full access is used here purely to keep focus on learning API Gateway itself, not IAM policy scoping.

---

## Exam Framing

> "Why does a Lambda function fail with an access-denied error when trying to read/write a DynamoDB table, even though both are in the same AWS account?" → **AWS services never have implicit permission to act on each other — the Lambda function needs an explicit IAM role (e.g. with DynamoDBFullAccess or a table-scoped policy) attached before it can perform any DynamoDB operation.** "Why build three separate Lambda functions instead of one function handling create, read, and delete together?" → **separation of concerns — a single combined function becomes harder to test, maintain, and reason about; one function per responsibility is the established best practice, mirroring the same principle behind microservices architecture generally.**
`,
    },
    {
      id: "api-gateway-lab-introduction",
      title: "API Gateway Hands-On Lab – The Four-Part Plan (HTTP API First, REST API Later for Direct Comparison)",
      shortDesc: "This lab is deliberately built with HTTP API first — the exact same lab gets rebuilt with REST API next, specifically so the earlier feature comparison can be felt hands-on, not just memorized",
      visuals: [],
      content: `## What This Lab Builds

> **A working front end → API Gateway → Lambda → DynamoDB flow, implementing 3 CRUD operations**: ⚠️ **POST (create a new record), GET (read a profile), and DELETE (delete an account)** — deliberately excluding UPDATE for this particular lab's scope. ⚠️ **This lab uses HTTP API specifically — the exact same lab gets repeated with REST API in a follow-up lab**, so the REST-vs-HTTP feature differences from the earlier comparison topics can be experienced hands-on, not just memorized.

---

## The Three Tools Used

> **DynamoDB** (the backend data store), **AWS Lambda** (hosts the actual CRUD logic — though this specific choice of compute platform is arbitrary; EC2, ECS, or EKS would work just as well), and **API Gateway** (the secure, public-facing entry point that exposes the Lambda functions to the front end, with logging on every trigger).

---

## ⚠️ The Complete Request Flow

> **Front end sends an HTTP request → API Gateway receives it and triggers the matching Lambda function → Lambda performs the actual DynamoDB operation.** ⚠️ **The front end never talks to DynamoDB or even Lambda directly — API Gateway is always the mandatory intermediary**, exactly matching the architecture established in the earlier CRUD topic.

---

## The Four-Part Lab Structure

1. **Part 1 — Prerequisites**: setting up whatever needs to exist before building the actual API logic (e.g. the DynamoDB table, IAM roles).
2. **Part 2 — Create the API using Lambda**: writing the actual CRUD logic as Lambda functions.
3. **Part 3 — Create the API Gateway (HTTP API)**: exposing those Lambda functions publicly and securely.
4. **Part 4 — Test the complete functionality**: verifying the full front-end-to-DynamoDB flow actually works end to end.

---

## Exam Framing

> This is purely a lab-scoping overview — the one concrete detail worth remembering is that ⚠️ **this exact same lab gets repeated with REST API afterward, specifically as a deliberate teaching device to make the REST-vs-HTTP API feature differences tangible rather than purely theoretical.** The underlying architecture (front end → API Gateway → Lambda → DynamoDB, front end never touching the backend directly) stays identical between both versions — only the API Gateway TYPE changes.
`,
    },
    {
      id: "crud-and-api-gateway-lambda-dynamodb-flow",
      title: "CRUD Operations and the Website → API Gateway → Lambda → DynamoDB Flow",
      shortDesc: "DynamoDB simply refuses direct public access, so the frontend can never talk to it directly — the only path in is through an API, and API Gateway is what makes that API safely reachable",
      visuals: [],
      content: `## CRUD: The Four Operations Every Backend Performs

> **CRUD = Create, Read, Update, Delete — the backbone of virtually every application that stores data.** ⚠️ **Each CRUD operation maps to a specific HTTP method**: Create → **POST**, Read → **GET**, Update → **PUT**, Delete → **DELETE**.

**Mapped to DynamoDB operations specifically**: Create → **PutItem** (write a new record), Read → **GetItem / Scan**, Update → **UpdateItem**, Delete → **DeleteItem**.

---

## ⚠️ The Core Problem: DynamoDB Cannot Be Reached Directly From a Frontend

> **A website's frontend (even one hosted on EC2) CANNOT talk to DynamoDB directly.** ⚠️ **DynamoDB does not allow direct public access at all — this is a deliberate security boundary, not a missing feature.** ⚠️ **The frontend must always go through an API instead** — there is no other supported path from a public-facing website into DynamoDB.

---

## The Solution: One API Per CRUD Operation

> **Worked example — a user-profile system**: registering a user (Create/POST), viewing a profile (Read/GET), updating name/email (Update/PUT), and deleting an account (Delete/DELETE) each require a SEPARATE API, each performing its own DynamoDB operation. ⚠️ **Four distinct CRUD operations → four distinct APIs**, each doing exactly one job — directly mirroring the same "each service/API does one thing" principle from the earlier microservices topic.

---

## ⚠️ The Final Flow: Website → API Gateway → API (Lambda) → DynamoDB

> **The frontend never talks to DynamoDB directly at any point.** ⚠️ **The complete chain**: Website → API Gateway → the actual API logic (hosted in Lambda in this course's lab) → DynamoDB — and the SAME chain runs in reverse for the response. ⚠️ **API Gateway's role in this specific chain**: exposing the four Lambda-hosted CRUD APIs safely to the public internet with a clean URL, plus the security/logging/throttling/authentication features already covered in earlier topics** — API Gateway is what makes those otherwise-private Lambda functions safely reachable from a public website at all.

**⚠️ The underlying rule this whole chain enforces**: "create the API, write the CRUD logic (in Lambda), expose it securely through API Gateway" — this exact pattern is what the upcoming hands-on lab implements end-to-end.

---

## Exam Framing

> "Why can't a website's frontend query DynamoDB directly, even though both are technically within the same AWS account?" → **DynamoDB deliberately does not allow direct public access — the frontend must always go through an API (typically backed by Lambda) instead, with API Gateway providing the public-facing, secured entry point into that API.** "An application needs four separate operations to manage user records: creating, viewing, updating, and deleting a profile" → **four separate CRUD-mapped APIs (POST/GET/PUT/DELETE respectively)**, each performing exactly one DynamoDB operation, all exposed through a single API Gateway.
`,
    },
    {
      id: "websocket-api",
      title: "WebSocket API – The Connection That Never Closes After One Exchange",
      shortDesc: "Three exam keywords give it away instantly: two-way communication, real-time data, long-lived connection — and caching isn't just unsupported, it structurally makes no sense for live data",
      visuals: [],
      content: `## ⚠️ The One Structural Difference From REST/HTTP API

> **REST API and HTTP API both follow the same pattern: one request → one response → connection CLOSED.** ⚠️ **WebSocket API keeps the connection OPEN — messages can flow in EITHER direction, at ANY time, without a new connection being established for each exchange.** ⚠️ **This single structural difference — real-time, two-way, persistent connection — is what makes WebSocket fundamentally different from REST/HTTP API, not just a feature variation of the same model.**

---

## ⚠️ The Three Exam Keywords

> **Two-way communication, real-time data, long-lived connection — if a question contains any of these three phrases, WebSocket API is almost certainly the answer.**

**Concrete use cases**: live chat, live notifications, live dashboards, collaboration tools (Zoom, shared whiteboards, Google Docs-style live editing), real-time location tracking (e.g. delivery tracking in Swiggy/Zomato-style apps). ⚠️ **The unifying thread: anywhere "live" genuinely belongs in the description, WebSocket API is the fit.**

---

## Feature Support Summary

| Feature | Supported? |
|---|---|
| Two-way communication | ✅ Yes (its core purpose) |
| Real-time data / long-lived connection | ✅ Yes |
| Lambda integration | ✅ Yes |
| ALB integration | ❌ No |
| JWT authentication | ✅ Yes |
| Cognito authentication | ✅ Yes |
| API keys | ❌ No — API-keys-specific to REST API only |
| WAF | ❌ No |
| ⚠️ Caching | ❌ **No — and not even a meaningful gap, since caching doesn't apply to real-time, constantly-changing live data in the first place** |
| Mapping templates | ✅ Basic support |
| Routing | ✅ Yes |

---

## Exam Framing

> "An application needs live, bidirectional updates — e.g. a chat feature or a real-time delivery-tracking map — without repeatedly opening new HTTP connections for each update" → **WebSocket API** — the only API Gateway type built for a persistent, two-way connection rather than the request-response-close pattern REST/HTTP API both use. "Why doesn't WebSocket API support response caching, unlike REST API?" → **caching structurally doesn't fit real-time data** — the whole point of a WebSocket connection is delivering fresh, live updates continuously, which a cached response would directly contradict.
`,
    },
    {
      id: "rest-api-vs-http-api-part2",
      title: "REST API vs HTTP API (Part 2) – The Real Decision Maker: Request/Response Transformation",
      shortDesc: "HTTP API is fast precisely because it never touches the request — REST API's ability to modify, validate, and reshape data before it reaches the backend is what actually decides which type to pick",
      visuals: [],
      content: `## ⚠️ Request/Response Transformation: The Actual Decision Maker

> **REST API can modify the request or response BEFORE it reaches the backend** — converting formats (e.g. XML to JSON), adding/removing fields, reshaping the payload entirely. ⚠️ **HTTP API does NONE of this — whatever arrives from the client gets forwarded to the backend completely untouched, with zero intervention.** ⚠️ **This is exactly WHY HTTP API is faster: skipping any transformation logic means less processing work per request.**

**Three specific REST-API-only capabilities under this umbrella, ALL unsupported by HTTP API**:
1. **Request/response transformation** — reshape data before it reaches the backend.
2. **Input validation** — reject malformed requests before they ever reach the backend (e.g. a missing required email field gets blocked at the gateway).
3. **Mapping templates** (Velocity Template Language) — customize input/output format via templates, e.g. restructuring the request body entirely.

⚠️ **These three are grouped together because they all stem from the same root capability — REST API actively inspects and can alter the payload; HTTP API is a pure pass-through.**

---

## Performance and Cost

- **Caching**: ⚠️ **REST API supports response caching (storing backend responses to serve repeat requests faster, with configurable refresh); HTTP API does NOT support caching at all** — but this is framed as a non-issue for HTTP API, since its pass-through design is already fast without needing a cache layer.
- **Cost**: ⚠️ **HTTP API is roughly 70% cheaper than REST API** — the same figure from the earlier part-1 topic, now tied directly to the "fewer features = lower cost" tradeoff.

---

## Monitoring, Logging, and Integration Types — Where They're EQUAL

> ⚠️ **CloudWatch Logs and access logs are supported identically by BOTH REST API and HTTP API** — no difference here, so this is never the deciding factor between the two.

**Integration types**:
- **Lambda integration**: ✅ supported by BOTH.
- **HTTP URL integration** (calling a backend hosted on EC2 or on-premises): ✅ supported by BOTH.
- **ALB (Application Load Balancer) integration**: ⚠️ **HTTP API ONLY — REST API does NOT support routing traffic directly to an ALB.**

**Other features**:
- **Custom domain**: ✅ both.
- **CORS**: ✅ both.
- **Private API** (VPC-only access): ⚠️ **REST API (specifically REST API Private) — yes. HTTP API — NO private-only option at all.**

---

## Exam Framing

> "An API needs to validate incoming requests and reject malformed ones (e.g. a missing required field) before they ever reach the backend" → **REST API** — input validation, along with request/response transformation and mapping templates, is REST-API-exclusive. "An API needs to route traffic directly to an existing Application Load Balancer" → **HTTP API** — this is one of the rare cases where HTTP API supports something REST API does NOT. "An API must only be reachable from within a VPC, never the public internet" → **REST API Private** — HTTP API has no private-only equivalent at all. Remember the overall shape: **REST API = richer feature set (transformation, validation, caching, WAF, private access) at higher cost; HTTP API = fast, cheap pass-through, with ALB integration and native JWT/OAuth as its two specific advantages over REST API.**
`,
    },
    {
      id: "rest-api-vs-http-api-part1",
      title: "REST API vs HTTP API (Part 1) – Older + Feature-Rich vs Newer + 70% Cheaper",
      shortDesc: "REST API natively supports API keys and WAF but not modern JWT/OAuth login; HTTP API is the reverse — no API keys, but native JWT support since it was built for the modern auth landscape",
      visuals: [],
      content: `## Four API Gateway Types, Two Worth Comparing Directly

> **API Gateway supports four types: REST API, REST API Private, HTTP API, and WebSocket API.** ⚠️ **REST API Private is functionally the same as REST API, just restricted to VPC-only access instead of the public internet** — the two can be treated as one bucket for feature comparison purposes. ⚠️ **WebSocket API is fundamentally different — it keeps a connection open for real-time, bidirectional communication (like a live chat), unlike REST/HTTP API's request-response-then-close model** — so it's covered separately and can't be meaningfully compared feature-by-feature against REST/HTTP API.

**⚠️ The real decision that matters: REST API vs HTTP API** — both use the same request-response model, same HTTP protocol, same overall design style. ⚠️ **REST API offers the fuller, more advanced feature set; HTTP API offers faster, cheaper performance with a more limited feature set — specifically ~70% cheaper than REST API.**

---

## ⚠️ Authentication/Authorization Feature Comparison

| Auth Method | REST API | HTTP API |
|---|---|---|
| **API keys** (specific customers get a key to call paid/restricted APIs) | ✅ Yes | ❌ No |
| **IAM (SigV4)** — AWS resources call the API using their IAM role/permissions | ✅ Yes | ❌ No |
| **Cognito** — users log in via Cognito to get a token | ✅ Yes | ✅ Yes |
| **JWT / OAuth 2.0** (Google/Okta-style social sign-in) | ⚠️ **NOT natively supported** — REST API predates JWT/OAuth's widespread adoption; can only be added via custom Lambda logic | ✅ **Yes, natively** — HTTP API is the newer type, built with modern auth in mind |

⚠️ **The clean pattern to remember: REST API supports API keys and IAM but NOT native JWT/OAuth; HTTP API is the exact reverse — native JWT/OAuth but no API keys and no IAM SigV4.** Cognito is the one method both support.

---

## Security and Traffic Control Comparison

- **Throttling / rate limiting** (protecting the backend from traffic spikes): ⚠️ **REST API offers FULL advanced support; HTTP API supports it too, but only at a BASIC level.**
- **AWS WAF integration** (blocking SQL injection, bots, malicious requests): ⚠️ **REST API integrates with WAF DIRECTLY; HTTP API does NOT integrate directly — it can only get WAF protection indirectly, by putting CloudFront in front of it.**
- **Resource policy** (restricting access by IP, VPC, or AWS account): ✅ **supported by BOTH REST API and HTTP API equally** — no difference here.

---

## Exam Framing

> "An API needs to authenticate callers using API keys, distributed only to specific paying customers" → **REST API** — API keys are not supported by HTTP API at all. "An API needs to authenticate users via a modern JWT/OAuth flow (e.g. Google sign-in) natively, without custom Lambda authorizer logic" → **HTTP API** — REST API has no native JWT/OAuth support, only HTTP API does. "An API needs direct AWS WAF integration to block malicious traffic" → **REST API** — HTTP API only gets WAF protection indirectly via CloudFront in front of it, not a direct integration.
`,
    },
    {
      id: "api-gateway-introduction",
      title: "API Gateway – The Single Entry Point Standing Between Every Client and Every Backend API",
      shortDesc: "Clients never talk to backend APIs directly — every request hits the gateway first, which decides who gets through, how much traffic is allowed, and where the request actually goes",
      visuals: [],
      content: `## ⚠️ The Problem: Managing Many APIs Individually Doesn't Scale

> **A real application typically has MANY separate APIs — one per feature — and managing each one individually (security, throttling, logging, versioning) becomes genuinely difficult as the number grows.** ⚠️ **API Gateway solves this by acting as ONE central entry point for ALL of an application's APIs**, rather than exposing each backend API directly to clients.

---

## What API Gateway Actually Is

> **A fully managed AWS service that sits as the single entry point in front of all backend APIs.** ⚠️ **Clients (web apps, mobile apps, other microservices) never connect directly to a backend API — every request must go THROUGH the API Gateway first.** The gateway inspects the request, then forwards it to the correct backend (which can be EC2, Lambda, ECS, or any other compute target).

**⚠️ The "security guard + traffic controller + manager" analogy**: API Gateway decides who's allowed in, how many requests can come through at once, who should be blocked, what gets logged, and how traffic overall is controlled — ⚠️ **all without writing any custom code for these concerns; it's handled entirely by the managed service itself, with zero infrastructure to provision.**

---

## ⚠️ Worked Example: Ola/Uber's Rider and Driver Apps

> **A ride-hailing platform has many distinct backend APIs**: driver location, rider request, fare calculation, payment, trip history, notifications — ⚠️ **all used by both the rider app AND the driver app.** ⚠️ **Rather than exposing each API separately, ONE API Gateway sits in front of all of them**, providing: centralized security for every API, fine-grained control over who can access which specific API, throttling during peak-hour traffic spikes, blocking of suspicious requests, and centralized version management.

---

## Exam Framing

> "An application has 10+ separate backend APIs, each needing its own security, throttling, and logging configured individually" → **API Gateway** — a single managed entry point that centralizes security, traffic control, and logging for every backend API, eliminating the need to build and maintain this logic separately for each one. Remember: **the client never talks to the backend API directly — API Gateway is always the first stop**, deciding whether and how the request reaches its actual destination.
`,
    },
    {
      id: "synchronous-vs-asynchronous-communication",
      title: "Synchronous vs Asynchronous Communication – The Core Split Behind Every AWS Integration Service",
      shortDesc: "Payment MUST be synchronous because the order can't decide what to do next without knowing the result — notification MUST be asynchronous because nothing downstream depends on when the email actually arrives",
      visuals: [],
      content: `## ⚠️ The Fundamental Split: Does the Sender Need to Wait?

> **Every AWS application integration service exists to serve one of two communication styles — synchronous or asynchronous.** ⚠️ **The single deciding question: does the sending service's NEXT STEP depend on the receiving service's response?** If yes → synchronous. If no → asynchronous.

---

## Synchronous Communication: Wait for the Reply Before Continuing

> **One service sends a request and WAITS until the other service replies — just like a phone call: ask a question, stay on the line until you get an answer.** ⚠️ **The sender's next decision genuinely depends on the reply.**

**⚠️ Worked example — payment processing**: when a user clicks "Pay," the order service sends a request to the payment service and MUST wait for the result. ⚠️ **The order service literally cannot proceed without knowing whether the payment succeeded or failed** — success means show dispatch information, failure means show a retry-payment page. There is no valid next step until the answer arrives.

**When to use synchronous**: an instant response is genuinely needed, the next action depends directly on the previous answer, or the operation is critical enough that immediate confirmation is required. ⚠️ **AWS services**: API Gateway and Application Load Balancer (ALB already covered elsewhere — application integration specifically focuses on API Gateway).

---

## Asynchronous Communication: Send and Move On, No Waiting

> **One service sends a message and immediately continues its own work — the receiving service processes it whenever it's free, with no blocking.** ⚠️ **Just like sending a WhatsApp message: send it, keep doing other things, the reply (if any) comes later, on its own schedule.**

**⚠️ Worked example — payment success notification**: once payment succeeds, the payment service sends a "payment successful" message (via SQS, SNS, or EventBridge) and moves on immediately — ⚠️ **it does NOT wait for the notification service to actually send the email/SMS.** ⚠️ **Some delay before the email arrives (seconds, or even 30+ minutes) is completely acceptable, because nothing downstream is blocked waiting on it** — the payment flow itself already completed independently of when the notification actually gets delivered.

**When to use asynchronous**: background tasks, notifications (email/SMS), inventory updates, event logging (payment success/failure events), retry logic — ⚠️ **anywhere the next step genuinely does NOT depend on this specific step's outcome or timing.** ⚠️ **AWS services**: SQS, SNS, EventBridge (each with its own distinct use case, covered in depth in upcoming topics).

---

## Exam Framing

> "An order service needs to know immediately whether a payment succeeded before deciding what page to show the user next" → **synchronous communication** — the next step is directly dependent on this specific response, so the caller must wait; API Gateway is the AWS service for this. "A payment service needs to trigger a confirmation email, but the email doesn't need to arrive instantly and nothing else is blocked waiting for it" → **asynchronous communication** — SQS, SNS, or EventBridge, since the sender can move on immediately without waiting for the notification to actually be delivered. The single litmus test in both cases: **does the sender's next action depend on this specific reply?**
`,
    },
    {
      id: "microservices-architecture-and-need-for-integration",
      title: "Microservices Architecture – Independent Scaling, and Why Separation Forces Application Integration",
      shortDesc: "Splitting cart, checkout, and payment into separate services means each can scale to its own actual demand — but it also means they can no longer just call each other's functions or share a database",
      visuals: [],
      content: `## What Microservices Architecture Actually Means

> **Microservices architecture breaks an application into small, independent services, each responsible for ONE specific function — developed, deployed, and scaled SEPARATELY.** ⚠️ **This is a loosely coupled design, the direct opposite of monolithic's tightly coupled single unit.** ⚠️ **Each microservice can have its own database, and can even be written in a different programming language** — Amazon's cart service and checkout service, for example, need not share a database or a language at all.

**Worked example — Amazon.com's actual internal structure**: separate services for user login/account, product catalog, cart (add/remove items), checkout flow, payment/transactions, order creation/tracking, delivery, and notifications — ⚠️ **each independently built, deployed, and scaled**, even though the end user experiences it as one seamless website.

---

## The Core Benefits

- **Independent scaling** — the single biggest advantage, especially at Amazon's scale.
- **Faster deployment** — small, focused codebases deploy far more easily than one giant application.
- **Independent teams** — separate teams own separate services; an Amazon engineer working on cart service typically has no involvement in payment service.
- **Easier to manage and troubleshoot** — small, focused codebases are simpler to reason about than one massive one.
- **Technology flexibility** — different services can use different languages/frameworks as best fits each one's needs.

---

## ⚠️ Solving the Monolith's Scaling Waste, Directly

> **Using the SAME funnel example from the earlier monolithic topic** (100,000 browsers → 10,000 cart adds → 4,000 checkouts → 2,000 payments): ⚠️ **in microservices architecture, EACH service scales independently to match its OWN actual demand** — the product service scales aggressively for 100,000 requests, while the payment service only needs capacity for 2,000. ⚠️ **No component is ever over-provisioned to match a different component's traffic** — directly eliminating the wasted-resource problem that defines monolithic scaling.

---

## ⚠️ The New Problem This Creates: How Do Separated Services Communicate?

> **Once services are genuinely separate applications — different codebases, different databases, potentially different languages — they can no longer simply call each other's functions or query each other's database directly, the way components inside one monolith could.** ⚠️ **But they still MUST communicate**, since a real user flow spans multiple services: adding to cart is the cart service's job, but creating an order requires the order service to ask the cart service what was actually selected; the payment service then needs that same cart information to charge the customer correctly.

**⚠️ This is precisely the gap application integration services exist to fill** — since normal in-process function calls and shared databases are no longer options, microservices instead communicate through APIs, queues, events, and messages.

---

## Two Communication Requirement Types

> **Synchronous communication** (real-time, caller waits for a response) — handled by services like **API Gateway, ALB, HTTP, gRPC.** **Asynchronous communication** (fire-and-forget, just informing another service without waiting) — handled by services like **SQS, SNS, EventBridge, Amazon MQ, Step Functions.** ⚠️ **Choosing which type fits a given inter-service interaction is exactly what the rest of this application integration section covers.**

---

## Exam Framing

> "Why can't two microservices in a modern application simply call each other's internal functions the way components inside a monolith could?" → **because they are genuinely separate applications — different codebases, different (possibly different-language) runtimes, and typically different databases — with no shared in-process call path between them.** "An e-commerce app needs its product-browsing service to handle 100,000 concurrent requests while its payment service only ever needs to handle 2,000" → **microservices architecture, specifically because each service scales independently based on its own actual demand** — directly solving the wasteful all-or-nothing scaling monolithic architecture forces.
`,
    },
    {
      id: "monolithic-architecture",
      title: "Monolithic Architecture – Why Scaling for 100,000 Visitors Means Wastefully Scaling Payment Too",
      shortDesc: "A funnel drops from 100,000 browsers to 2,000 buyers, but a monolith scales the ENTIRE app — including payment — for all 100,000, since everything runs as one inseparable unit",
      visuals: [],
      content: `## What "Monolithic" Actually Means

> **Monolithic (tightly coupled) architecture means every component — UI, business logic, authentication, payment, notifications, database access — is built, deployed, and scaled together as ONE single unit.** ⚠️ **One codebase, one deployment package (e.g. a single WAR/JAR file or Docker image), and typically one shared database.** This was the standard way of building applications before cloud-native microservices became practical.

---

## ⚠️ Problem 1: You Can't Update or Redeploy One Piece Alone

> **Even a small change to ONE feature (e.g. the checkout process) requires redeploying the ENTIRE application** — there's no way to update just the checkout logic in isolation, since everything ships as a single deployable unit.

---

## ⚠️ Problem 2: Scaling Is All-Or-Nothing, Even When Demand Isn't

> **The core scaling problem: different parts of an application experience wildly different traffic volumes, but a monolith can only scale as ONE unit — so the least-used component still gets scaled to match the MOST-used one.**

**⚠️ Worked example — a realistic e-commerce traffic funnel**: 100,000 users browse products in an hour → only ~10% (10,000) add something to cart → only ~4% of the original (4,000) reach checkout → only ~2% of the original (2,000) actually complete payment. ⚠️ **In a monolith, since everything runs as one inseparable unit, the ENTIRE application — including the payment system that only 2,000 people actually use — must be scaled to handle all 100,000 visitors.** The payment service ends up provisioned for 50x more capacity than it will ever actually use.

**⚠️ Direct consequences**: more compute resources than genuinely needed, higher cost, longer deployment times, and — combined with Problem 1 — even a single small change forces a full redeploy of everything.

---

## Exam Framing

> "An application's checkout/payment component is massively over-provisioned relative to its actual usage, purely because the product-browsing component needs that much capacity" → **this is the classic monolithic scaling problem** — every component scales together as one unit, so the busiest component (browsing) forces every other component (however lightly used) to match its capacity. This exact wasteful-resource pattern is the primary motivation for microservices architecture (covered in the next topic), where each component scales independently based on its own actual demand.
`,
    },
    {
      id: "app-integration-basics",
      title: "Application Integration Basics – Application-to-Application vs Microservices-to-Microservices",
      shortDesc: "UPI payments and flight booking sites are app-to-app integration between separate companies; Amazon's cart/checkout/notification split is microservices-to-microservices integration within one company",
      visuals: [],
      content: `## What Application Integration Actually Solves

> **Application integration is what lets two or more applications or microservices communicate and exchange data reliably** — sending information, receiving responses, and triggering actions across systems, ⚠️ **even when those systems are built on completely different technologies.** The core value: multiple independent systems working together as one seamless experience, without the end user ever noticing the handoffs.

---

## Type 1: Application-to-Application Integration

> **Two entirely SEPARATE applications or systems (often built by different companies) communicate to complete a task.** ⚠️ **Common whenever different companies, departments, or independently-built systems need to work together.**

**Worked example 1 — UPI payment**: scanning a QR code to pay via Google Pay or Paytm actually involves ⚠️ **THREE separate systems communicating**: the UPI app itself (built by a private company), NPCI (the government body managing UPI payment rails), and the bank's own system. All three exchange data to complete a single payment — pure application-to-application integration across three independently-operated organizations.

**Worked example 2 — flight booking aggregators**: booking a flight through Skyscanner (or Goibibo/MakeMyTrip) involves the aggregator (Skyscanner) talking directly to the airline's own system (e.g. Emirates) — first to fetch fare/schedule details, then again to actually confirm the booking on the airline's side. ⚠️ **Two distinct companies' systems, integrated so the user experiences it as one continuous booking flow.**

---

## Type 2: Microservices-to-Microservices Integration

> **Small, independent services INSIDE ONE application talking to each other to fulfill a single user request.** ⚠️ **Each microservice deliberately does exactly ONE job — meaning they MUST communicate with each other to function as a complete system**, since no single microservice can fulfill an entire user request alone.

**Worked example — Amazon.com's internal architecture**: from the outside, Amazon.com looks like one website. Internally, ⚠️ **the product page, the cart, checkout/payment, and order notifications are all separate microservices** — adding an item to cart means the product service talks to the cart service; placing an order means the order service talks to the payment service, then the notification service to send an update. ⚠️ **This is the modern replacement for the older monolithic application model**, where all of this logic would have lived in one single deployable unit instead.

---

## Exam Framing

> "Two completely separate companies' systems (e.g. a payment app and a bank) need to communicate to complete a transaction" → **application-to-application integration** — distinct organizations, distinct systems, integrated to appear seamless to the end user. "Within a single e-commerce application, the cart service needs to notify the payment service once an order is placed" → **microservices-to-microservices integration** — independent services inside ONE application, each doing one job, that must talk to each other to complete the overall request. Both types are what AWS's application integration services (API Gateway, SQS, SNS, EventBridge — covered next) exist to implement reliably.
`,
    },
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
