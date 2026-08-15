// Monitoring & Management
export default {
  id: "monitoring",
  label: "Monitoring & Management",
  icon: "📊",
  color: "#E07B39",
  topics: [
    {
      id: "aws-config-hands-on-lab-timeline-rules",
      title: "AWS Config Hands-On Lab – Watching the Resource Timeline Fill In Live",
      shortDesc: "Swap an EC2 instance's security group and watch AWS Config record the exact before/after change on its timeline — the same mechanism that later flags an unencrypted EBS volume or an unattached Elastic IP as non-compliant",
      visuals: [],
      content: `## First-Time Setup: Recording Everything

> **The very first time you open Config, it records nothing until you click "Get Started."** ⚠️ **Choosing to record ALL resources (rather than a specific subset) means every resource type in the account/region gets tracked from that point forward** — an IAM role is auto-generated so Config has permission to inspect resources, and an S3 bucket archives the recorded activity long-term. Optionally, an SNS topic can be created and subscribed to (email) so resource create/modify/delete events also arrive as notifications.

---

## The Resource Timeline: Three Distinct Event Types

> Opening any tracked resource shows a **resource timeline** with three tabs: ⚠️ **Configuration Events — every field-level change to the resource itself; Compliance Events — whether the resource violates any active Config Rule; CloudTrail Events — the WHO/WHEN of API calls affecting it (start/stop only, no field-level detail — that's what makes Configuration Events genuinely different from CloudTrail).**

### Proving It Live: Swapping a Security Group

> **Detaching one security group from a running EC2 instance and attaching a different one shows up as a Configuration Event with the exact before → after value** ("security group changed FROM test-config TO default") — a concrete, field-level proof of the abstract "track configuration changes over time" claim, and something CloudTrail's event log alone would never show.

---

## Config Rules: Turning Violations Into Live Notifications

> **Two rule types: AWS-managed (ready-to-use, hundreds available) or custom.** ⚠️ **Worked examples enabled live: "EBS volumes must be encrypted" flagged an actual unencrypted volume as non-compliant immediately (the default volume created with a fresh EC2 instance); "Elastic IPs must be attached to an instance/ENI" flagged a genuinely orphaned Elastic IP** — exactly the kind of forgotten, silently-billing resource that's otherwise easy to miss. Both violations triggered real email notifications via the SNS topic set up earlier.

---

## Conformance Packs (Multi-Account Scale)

> **A Conformance Pack bundles a set of Config Rules + remediation actions and deploys them as a single unit across accounts/regions via AWS Organizations** — e.g. an "S3 best practices" template applied identically to ten separate AWS accounts at once, instead of configuring the same rules ten separate times.

---

## Exam Framing

> "Find out exactly WHAT changed on a resource, with before/after field-level detail" → **AWS Config's resource timeline (Configuration Events).** "Automatically flag resources violating a policy (e.g. unencrypted volumes, unattached Elastic IPs) and notify someone" → **AWS Config Rules + SNS.** ⚠️ **Remember Config's CloudTrail tab only shows coarse start/stop-style API activity — genuine field-level change history is Config's own Configuration Events, not CloudTrail.**
`,
    },
    {
      id: "cloudwatch-metrics-dashboard-alarms-hands-on-lab",
      title: "CloudWatch Hands-On Lab – From a Live CPU Spike to an Alarm Email",
      shortDesc: "A one-line VBS script pinned CPU to 100% just to watch the dashboard graph react in real time and the alarm state genuinely flip from OK through INSUFFICIENT_DATA to ALARM",
      visuals: [],
      content: `## Building a Dashboard and Selecting a Metric

> **CloudWatch is fundamentally a metrics repository — AWS services push metrics into it automatically, and a dashboard widget is just a chosen metric rendered as a graph.** For EC2, metrics can be scoped **"per instance"** (a specific instance) or **"by Auto Scaling"** (aggregate) — selecting **CPUUtilization** for one specific instance and adding it as a line-chart widget produces a live-updating graph of that instance's CPU over time.

---

## ⚠️ Basic (5-Minute) vs Detailed (1-Minute) Monitoring — Proven Live

> **By default, EC2 collects metrics on a 5-minute period — free, but coarse.** ⚠️ **Enabling Detailed Monitoring (an extra paid feature, toggled from the instance's own Monitoring tab) drops that to a 1-minute period — over the same 1-hour window, this is the difference between 12 data points and 60.** Proven directly: setting the dashboard's period to 1 minute without Detailed Monitoring enabled simply doesn't work — the finer granularity genuinely isn't there until the paid feature is turned on.

### The CPU-Spike Proof

> **A tiny VBS script running an infinite loop** (\`while true...\`) **pins CPU utilization to ~100% on demand — starting and stopping it repeatedly over an hour produces a visibly spiking graph**, directly confirming the dashboard reflects real, current resource load rather than a static or cached view.

---

## ⚠️ Memory and Disk Require the CloudWatch Agent

> **A fresh EC2 instance with no agent installed shows CPU, network, and disk I/O metrics — but NEVER memory utilization or actual disk space used, because those are OS-level metrics AWS cannot see from the hypervisor.** ⚠️ **The CloudWatch Agent (installable on EC2, on-prem servers, Linux/Windows/macOS) is mandatory to get memory and disk-space metrics** — this exact gap is a favorite, recurring exam point.

---

## Creating and Triggering an Alarm

> **An alarm watches a single metric against a threshold over a period** (e.g. CPUUtilization average > 75% over 5 minutes) and performs an action on breach — EC2 action, Auto Scaling action, or an SNS notification. ⚠️ **Alarm states observed live in sequence: INSUFFICIENT_DATA (not enough data yet) → OK (below threshold) → ALARM (breach confirmed)** — running the same CPU-spike script and waiting out the 5-minute evaluation period genuinely flipped the alarm to ALARM state and delivered a real SNS email.

---

## Exam Framing

> "Memory or disk-space metrics aren't showing up for an EC2 instance in CloudWatch" → **install the CloudWatch Agent** — these are OS-level metrics, never collected by default regardless of monitoring tier. "Need 1-minute-granularity metrics instead of the default 5-minute" → **enable Detailed Monitoring** (chargeable). ⚠️ **An alarm's INSUFFICIENT_DATA state right after creation is expected and temporary — it resolves to OK or ALARM once enough metric data points have actually been collected, not an error to troubleshoot.**
`,
    },
    {
      id: "cloudwatch-logs-eventbridge-s3-event-hands-on-lab",
      title: "CloudWatch Logs + EventBridge Hands-On Lab – Routing an S3 Upload Into a Log Group",
      shortDesc: "One EventBridge rule fans a single S3 upload event out to two independent targets at once — a CloudWatch Log Group AND an SNS topic — proving a rule genuinely isn't limited to just one downstream action",
      visuals: [],
      content: `## Amazon EventBridge Is the Renamed CloudWatch Events

> ⚠️ **What was previously called "CloudWatch Events" is now Amazon EventBridge — same underlying service, new name and expanded scope.** The console still surfaces it from within CloudWatch as "Events." Its purpose: react to state changes across AWS resources (S3 uploads, EC2 state transitions, custom application events, or purely time-based schedules) by routing them to one or more targets.

---

## Building a Rule: S3 Upload → Two Targets at Once

> **A rule's event pattern selects a source service (e.g. S3) and an operation scope — "all events" is broad and noisy; scoping to specific object-level operations (e.g. only PutObject and DeleteObject) on a SPECIFIC bucket is what actually makes findings usable.** ⚠️ **A single rule can route to MULTIPLE targets in parallel — this lab configured both a CloudWatch Log Group (to capture a structured log entry) AND an SNS topic (to send an email notification), from the exact same triggering event.**

---

## Proving the Pipeline: Upload a File, Watch Both Targets Fire

> Uploading a file to the target S3 bucket produced: (1) a new log entry in the configured Log Group, showing the account, source IP, bucket name, object key/size, and event type — genuinely useful forensic detail beyond a plain notification; (2) an SNS email with the same event summary. ⚠️ **Broadening the rule back to "all events" produced a flood of unrelated noise (unrelated API calls via CloudTrail) — the concrete lesson: always scope EventBridge rules to the SPECIFIC operations and resource actually being monitored, not a blanket "everything."**

---

## Exam Framing

> "Every S3 upload/delete on a specific bucket needs to be logged AND trigger a notification" → **one EventBridge rule, scoped to that bucket's object-level PutObject/DeleteObject events, with BOTH a CloudWatch Log Group and an SNS topic as targets — a single rule handling multiple parallel targets, not two separate rules.** ⚠️ **EventBridge rules support 50+ possible target types (Lambda, SQS, SNS, Kinesis, ECS tasks, Step Functions, Log Groups, and more) — the exam tests recognizing WHICH target(s) fit a scenario, not memorizing the full list.**
`,
    },
    {
      id: "amazon-inspector-host-assessment-hands-on-lab",
      title: "Amazon Inspector Host Assessment Hands-On Lab – Installing the Agent Manually",
      shortDesc: "The automatic agent-install path came back unhealthy, so the fallback — downloading and running the agent installer directly inside the instance via Internet Explorer — is what actually got the host assessment running",
      visuals: [],
      content: `## ⚠️ Host Assessment Needs an Agent — Network Assessment Doesn't

> **Network assessment (checking which ports are reachable from outside the VPC) requires no agent at all.** ⚠️ **Host assessment — scanning for vulnerable software (CVEs) and CIS/best-practice deviations — structurally REQUIRES the Inspector agent to be installed and healthy on the target instance first**, since it needs OS-level visibility the network layer alone can't provide.

---

## Installing the Agent: Automatic Path Failed, Manual Path Worked

> **The "install agent via Run Command" automatic option can leave the target showing UNHEALTHY status** — the reliable fallback is downloading the agent installer URL directly and running it manually inside the instance (on Windows, via Internet Explorer, after disabling Enhanced Security Configuration so the .exe download isn't blocked). ⚠️ **Only once "Preview Target" shows HEALTHY does host assessment become runnable at all** — an unhealthy agent silently blocks the whole workflow.

---

## Configuring and Running the Assessment

> Assessment templates let you pick WHICH rules package to run — e.g. "Common Vulnerabilities and Exposures (CVEs)" and "Security Best Practices," while deliberately skipping the much noisier "CIS Operating System Security Configuration Benchmark" package to keep findings manageable on a first pass. ⚠️ **Set the run duration deliberately short (e.g. 15 minutes instead of a full hour) for a fast first look — findings are reviewable well before the full window elapses once the run genuinely completes.**

---

## Findings and the Downloadable Report

> Findings break down by severity (high/medium/low/informational) directly in the console, PLUS a full PDF report is downloadable for sharing with whoever actually owns remediation (e.g. handing a Windows-patching report to the team managing that OS). ⚠️ **Most findings trace back to outdated OS patches/configuration — the instructor is explicit that fixing the underlying OS issues is NOT a cloud architect's job; recognizing and surfacing the findings via Inspector is.**

---

## ⚠️ Critical Cleanup Step: Delete the Assessment Target

> **Deleting the assessment TARGET (not just individual runs) removes everything associated with it in one step** — skipping this risks a scheduled recurring assessment silently running (and billing) in the background indefinitely.

---

## Exam Framing

> "Scan an EC2 instance for vulnerable software and OS-level best-practice deviations" → **Amazon Inspector, Host Assessment — requires the Inspector agent to be installed and reporting healthy first**, unlike Network Assessment which needs no agent. ⚠️ **An unhealthy/failed agent install is the most common practical blocker — the manual direct-download install is the reliable fallback when the automatic Run Command path fails.**
`,
    },

    {
      id: "cloudwatch",
      title: "CloudWatch",
      shortDesc: "Monitor resources and applications",
      visuals: ["CloudWatchVisual", "MonitoringComparison"],
      content: `## Amazon CloudWatch

**CloudWatch** **monitors** resources & apps (performance) — answers "**how is it performing?**" Use it to right-size: deploy → monitor → adjust. It does **monitoring, alerting & events**.

- **Metrics** — a metrics repository; AWS services push metrics (CPU, network). EC2 default monitoring = **5-min** period; **Detailed Monitoring** (paid) = **1-min**.
- **CloudWatch Agent** — **memory & disk** are OS-level and NOT collected by default; install the **agent** to get them. *(Common exam point.)*
- **Alarms** — watch a metric vs a threshold; on breach → SNS notify, Auto Scaling, or stop/terminate EC2. States: OK / ALARM / INSUFFICIENT_DATA.
- **EventBridge (CloudWatch Events)** — respond to state changes/schedules → Lambda, SNS, etc. (e.g. start EC2 at 9 AM via cron).

---

## Config vs CloudTrail vs CloudWatch

- **Config = WHAT** changed (resource configuration)
- **CloudTrail = WHO** changed it (API calls / user / IP / time)
- **CloudWatch = HOW** it's performing (metrics)`,
    },
    {
      id: "cloudtrail",
      title: "CloudTrail",
      shortDesc: "Audit API calls and user activity",
      visuals: ["CloudTrailVisual"],
      content: `## AWS CloudTrail

**CloudTrail** records **API calls & user activity** — answers "**who did it, when & from where?**" across console, CLI, SDK & API. Enabled by default.

- **Event History** — last **90 days**; view/search/download. Example: shows the IAM user, source IP, time & instance ID for an EC2 termination. Even **denied** calls are recorded.
- **Trail → S3** — for long-term retention. Logs encrypted by **SSE-S3** by default (or **SSE-KMS**). Enable **log file integrity validation** (SHA-256) to detect tampering.

> Events appear within ~15 min; can stream to CloudWatch Logs / EventBridge. **CloudTrail = WHO** (vs Config = WHAT, CloudWatch = HOW).`,
    },
    {
      id: "config",
      title: "AWS Config",
      shortDesc: "Track resource configurations over time",
      visuals: ["ConfigVisual"],
      content: `## AWS Config

**AWS Config** gives a detailed view of resource **configuration** — for **auditing & compliance**. Answers "**what changed?**"

- **Resource inventory** — all resources in a region + their relationships.
- **Config timeline** — every configuration change over time; roll back to last-known-good.
- **Config rules** — evaluate against desired settings (AWS-managed/custom); non-compliant resources (unencrypted EBS, unused Elastic IP) are flagged + SNS alert.
- **Conformance pack** — bundle of rules + remediation deployed across accounts/regions via AWS Organizations.

> Records to S3, notifies via SNS. Per-resource timeline shows **configuration**, **compliance** & **CloudTrail** events together. **Config = WHAT** changed.`,
    },
    {
      id: "inspector",
      title: "Amazon Inspector",
      shortDesc: "Automated EC2 security assessment",
      visuals: ["InspectorVisual", "InspectorVsTrustedAdvisor"],
      content: `## Amazon Inspector

**Inspector** is an automated **security assessment** for **EC2** — finds vulnerabilities & best-practice deviations, with severity-ranked findings (high/medium/low/info) and a downloadable report.

- **Network assessment** — which ports are reachable from outside the VPC (no agent). e.g. TCP 21/FTP = high, 3389/RDP = medium, 80/HTTP = low.
- **Host assessment** — needs the **Inspector agent**; scans for vulnerable software (CVEs) & CIS/best-practice deviations.

---

## Inspector vs Trusted Advisor

| Aspect | Inspector | Trusted Advisor |
|---|---|---|
| Scope | EC2 only (security) | Whole account |
| Agent | Needed for host scan | None |
| Cost/performance advice | No | Yes |
| Timing | Run once / scheduled | Real-time |

> Deep **EC2 security** → Inspector. Account-wide best-practices → Trusted Advisor.`,
    },
    {
      id: "systems-manager",
      title: "Systems Manager",
      shortDesc: "Operational hub for AWS resources",
      content: `## Systems Manager

**AWS Systems Manager (SSM)** is an operations hub to **manage EC2 & on-prem servers at scale** (needs the SSM agent + an IAM role). Key capabilities:

- **Session Manager** — secure shell access **without SSH keys, bastion hosts, or open port 22**.
- **Parameter Store** — store config & secrets (free; secrets via KMS).
- **Patch Manager** — automate OS patching; **Run Command** — run commands across fleets.
- **Fleet/Inventory, State Manager, Automation** runbooks.

> Exam: "access instances **without SSH / bastion**" → **Session Manager**. "store config/secrets cheaply" → **Parameter Store**. "patch a fleet" → **Patch Manager**.`,
    },
    {
      id: "trusted-advisor",
      title: "Trusted Advisor",
      shortDesc: "Best practice checks and cost optimization",
      visuals: ["TrustedAdvisorVisual", "InspectorVsTrustedAdvisor"],
      content: `## AWS Trusted Advisor

**Trusted Advisor** inspects your whole AWS account and recommends improvements across **5 categories**:
- **💰 Cost Optimization** — unused/idle resources to cut the bill.
- **⚡ Performance** — improve speed & responsiveness.
- **🔒 Security** — gaps like root MFA not enabled, SGs open to 0.0.0.0/0.
- **🛡️ Fault Tolerance** — resiliency/redundancy shortfalls.
- **📏 Service Limits** — approaching quotas (free for everyone).

> **Plan limits:** Basic/Developer → only Service Limits + 6 security checks. **All** checks need a **Business or Enterprise** support plan.

---

## Inspector vs Trusted Advisor

Deep **EC2 security** scan (agent for host) → **Inspector**. Account-wide **cost / performance / security / fault-tolerance / limits**, real-time → **Trusted Advisor**.`,
    },
  ],
};
