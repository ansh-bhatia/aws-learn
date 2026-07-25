// Monitoring & Management
export default {
  id: "monitoring",
  label: "Monitoring & Management",
  icon: "📊",
  color: "#E07B39",
  topics: [
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
