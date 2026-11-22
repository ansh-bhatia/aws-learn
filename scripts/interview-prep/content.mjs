// Non-project sections: how to use the document, delivery approach, Control
// Tower and landing zones, and the cross-cutting questions.

export const approach = {
  intro:
    "Interviewers who ask \"how do you approach a project\" are not asking for a methodology name. They are checking whether you have a repeatable way of reducing uncertainty, and whether you know which decisions must be made early because they are expensive to reverse. Give them a sequence, then show it in a real project.",
  phases: [
    {
      name: "1 · Discovery — before any architecture",
      goal: "Establish the constraints that will decide the design.",
      does: [
        "Who are the users, how many, and when do they peak?",
        "What is the acceptable downtime, and the acceptable data loss? These two numbers — RTO and RPO — settle more architecture than any preference.",
        "What data is involved, and does any of it carry regulatory weight (PII, financial, health)?",
        "What is the budget, and is it capital or operational?",
        "What already exists that we must integrate with or cannot change?",
      ],
      says:
        "I do not design anything until I know the downtime tolerance and the data classification. Those two change the architecture more than the functional requirements do — a system that can take four hours of downtime is a fundamentally cheaper system than one that cannot take four minutes.",
    },
    {
      name: "2 · Design — decide the expensive-to-reverse things first",
      goal: "Commit early only to what is costly to change later.",
      does: [
        "Data model and storage engine — the hardest thing to change once there is production data in it.",
        "Account and network topology — retrofitting multi-account or re-addressing a VPC is painful.",
        "Identity and access model — bolting least privilege on afterwards rarely happens.",
        "Integration contracts between components, so teams can work in parallel.",
        "Deliberately deferred: instance sizes, autoscaling thresholds, most tuning. Those are cheap to change and premature to decide.",
      ],
      says:
        "I separate decisions into reversible and irreversible. I spend the design time on the irreversible ones — data model, network, identity — and deliberately defer the reversible ones, because deciding them early just means deciding them with less information.",
    },
    {
      name: "3 · Build — thin slice first",
      goal: "Prove the risky path end to end before building breadth.",
      does: [
        "Build the narrowest end-to-end slice that touches every layer, and deploy it.",
        "Infrastructure as code from the first day, not retrofitted.",
        "CI/CD before the second feature, because manual deploys become the bottleneck fast.",
        "Instrument as you go — logs, metrics and traces are not a later phase.",
      ],
      says:
        "The first thing I build is the thinnest path that touches every layer, and I deploy it. It proves the integrations and the permissions, which is where the surprises live. Building breadth before the first slice is deployed is how teams discover an IAM or networking problem a month late.",
    },
    {
      name: "4 · Validate — against the business, not the dashboard",
      goal: "Prove it works in terms the business recognises.",
      does: [
        "Load test against the peak discovered in phase one, not a round number.",
        "Failure testing: kill a task, fail an AZ, expire a credential.",
        "Data validation where data moved — counts, checksums, and a business-level comparison.",
        "Cost check against the estimate, before launch rather than after the first bill.",
      ],
      says:
        "Green dashboards are not validation. For anything involving data movement I validate at three levels — the tool's own checks, my own SQL checks, and a business metric computed both sides. Finance agreeing the revenue number matches is what actually ends the debate.",
    },
    {
      name: "5 · Handover and run",
      goal: "Make it survivable by someone who was not there.",
      does: [
        "Runbooks for the failures you already caused in testing.",
        "Alerts that someone has agreed to receive, with a defined action.",
        "Cost attribution through tagging, and a budget with an owner.",
        "A documented decision log — what was chosen, and what was rejected and why.",
      ],
      says:
        "I write down the decisions that were rejected, not just the ones taken. Six months later the question is always 'why didn't we just use X', and without that record the team re-litigates it from scratch.",
    },
  ],
  management: [
    ["Risk register, visible", "One shared list with owners and dates. Risks that live in one person's head are not managed."],
    ["Single definition of done per workload", "Agreed with the business in writing. Most disputes at the end are about a definition never fixed at the start."],
    ["Short feedback loops", "Weekly demo over monthly status. A demo exposes misunderstanding; a status report conceals it."],
    ["Escalate early and specifically", "Name the decision needed, the options and the deadline. Escalating a worry is noise; escalating a decision is useful."],
    ["Write the bad news first", "If the window is slipping, say so while it can still be changed."],
  ],
};

export const controlTower = {
  what:
    "AWS Control Tower is the managed way to set up and govern a multi-account AWS environment. It is not a service you put workloads in — it builds and polices the structure that workloads live inside. The thing it builds is called a landing zone.",
  why: [
    ["Blast radius", "A compromised or runaway account cannot reach the others. This is the argument that wins with security teams."],
    ["Billing clarity", "Per-account billing makes cost attribution a fact rather than a tagging exercise."],
    ["Quota isolation", "Service quotas are per account; a noisy workload cannot starve another."],
    ["Separation of duties", "Production access can be genuinely different from development access, not a policy document."],
  ],
  builds: [
    ["AWS Organizations", "The account hierarchy, with organisational units (OUs)."],
    ["Log Archive account", "A dedicated account holding centralised CloudTrail and Config logs. Workload teams cannot alter it."],
    ["Audit (Security Tooling) account", "Cross-account read for the security team, and where GuardDuty or Security Hub are administered."],
    ["IAM Identity Center", "Single sign-on with permission sets, rather than IAM users scattered per account."],
    ["Controls (guardrails)", "Preventive controls as SCPs, detective controls as Config rules, and proactive controls as CloudFormation hooks."],
    ["Account Factory", "A standard, repeatable way to vend new accounts already enrolled and governed."],
  ],
  setup: [
    ["1 · Prerequisites", "A clean management account, no conflicting AWS Config recorders or CloudTrail trails in the accounts to be enrolled, and the home region chosen deliberately — it is where the landing zone lives and changing it later is disruptive."],
    ["2 · Launch the landing zone", "From the Control Tower console in the management account, choose the home region and the governed regions, and name the Log Archive and Audit accounts. Setup takes roughly an hour and creates the Security OU plus those two accounts."],
    ["3 · Configure logging", "Set the retention for CloudTrail and Config logs in the Log Archive account. Treat that bucket as write-once: workload accounts should have no path to delete from it."],
    ["4 · Design the OU structure", "Not flat. A typical shape is Security (Log Archive, Audit), Infrastructure (shared networking, shared services), Workloads split into Prod and Non-Prod, a Sandbox OU with tight spend controls, and a Suspended OU with a deny-all SCP for decommissioned accounts."],
    ["5 · Set up identity", "Enable IAM Identity Center, connect the corporate identity provider, and define permission sets by job function — ReadOnly, Developer, Admin, Break-glass. Assign to groups, never to individuals."],
    ["6 · Apply controls", "Mandatory controls are applied for you. Then enable strongly recommended ones, and add elective ones per OU — for example, denying region usage outside your approved regions, or preventing public S3 buckets in the Prod OU."],
    ["7 · Vend accounts", "Use Account Factory, or Account Factory for Terraform (AFT) if you want account creation in a pipeline with version control. Enroll existing accounts rather than recreating them where possible."],
    ["8 · Customise", "Customizations for Control Tower (CfCT) applies your own CloudFormation or SCPs automatically to newly vended accounts — baseline VPCs, logging, security agents."],
    ["9 · Operate", "Watch for drift. Control Tower detects when a governed account diverges from the landing zone configuration, and drift is normal when people make manual changes."],
  ],
  landingZone: [
    ["Account strategy", "One account per workload per environment is the common default. The question to ask is where you want the hard boundary — accounts are the strongest isolation AWS offers."],
    ["Network", "A shared Infrastructure account owning Transit Gateway, with spoke VPCs attached from workload accounts. Use IPAM to allocate non-overlapping CIDRs from the start, because overlapping ranges are the single most common landing-zone regret."],
    ["Identity", "IAM Identity Center permission sets mapped to identity-provider groups. No long-lived IAM users in workload accounts; roles and short-lived credentials only."],
    ["Logging", "CloudTrail organisation trail, Config, and VPC Flow Logs all centralised into Log Archive. Centralising after an incident is too late."],
    ["Guardrails", "SCPs at OU level, not per account. Deny unapproved regions, deny disabling CloudTrail or Config, deny root user actions."],
    ["Cost", "Consolidated billing, mandatory tagging policy, per-OU budgets, and anomaly detection."],
  ],
  inProject: [
    ["Kosh — regulated credit data", "A separate production account under a Prod OU with an SCP restricting regions, a mandatory-encryption control, and all access through permission sets. Log Archive holds an immutable audit trail of decisions — which is exactly the evidence a financial regulator asks for."],
    ["Airworks — cost work", "Multi-account is what made the cost analysis tractable: per-account billing showed which team owned the NAT spend. Afterwards, an SCP requiring VPC endpoints is not possible directly, but a detective Config rule flagging VPCs without them, plus per-team budgets, keeps the fix from eroding."],
    ["EDF — data lake", "A dedicated data account owning the S3 zones and Glue Catalog, with Lake Formation granting cross-account read to analysts. Data stays in one account; access is granted outward rather than data copied around."],
    ["WeCredit — migration", "Landing zone first, workloads second. Migrating into an ungoverned single account and retrofitting Control Tower afterwards is far more work than building the structure before anything lands in it."],
  ],
  questions: [
    ["What is the difference between Control Tower and a landing zone?",
     "A landing zone is the destination — a governed, multi-account AWS environment with centralised logging, identity and guardrails. Control Tower is the managed service that builds and maintains one for you. You can build a landing zone by hand with Organizations, SCPs and CloudFormation, and some organisations do when they need something Control Tower does not express. Control Tower is the opinionated, supported path."],
    ["Why multi-account instead of one account with VPCs?",
     "Four reasons and I would name them in order of how much they persuade people. Blast radius — a compromise is contained. Billing — per-account cost is a fact rather than a tagging convention. Service quotas are per account, so one workload cannot starve another. And separation of duties becomes enforceable rather than procedural. VPC separation gives you none of those; it is only a network boundary."],
    ["What are guardrails, and what types are there?",
     "Controls, in current naming. Preventive controls are SCPs — they stop the action, so an API call simply fails. Detective controls are Config rules — they let the action happen and flag non-compliance. Proactive controls are CloudFormation hooks that block non-compliant resources before deployment. You want preventive for anything non-negotiable like disabling CloudTrail, and detective where blocking would be too blunt."],
    ["How do you structure OUs?",
     "Not flat, and not mirroring the org chart, because reorganisations then force account moves. I structure by environment and risk profile: Security for Log Archive and Audit, Infrastructure for shared networking, Workloads split into Prod and Non-Prod so different SCPs can apply, Sandbox with hard spend limits, and a Suspended OU with deny-all for decommissioned accounts. Controls attach to OUs, so the structure is really a question of which policies need to differ."],
    ["What is Account Factory?",
     "Control Tower's mechanism for vending new accounts already enrolled, with baseline configuration and controls applied. Account Factory for Terraform puts that in a pipeline, so account creation is a reviewed pull request rather than a console action — which is what you want once more than a couple of people can create accounts."],
    ["What is drift, and how do you handle it?",
     "Drift is when a governed account diverges from the landing zone's expected configuration — someone deletes a Config recorder or detaches an SCP. Control Tower detects it and reports it. The fix is partly technical, re-enrolling or repairing the account, and partly organisational: if drift keeps recurring, people are working around a control that is too restrictive, and that is worth understanding rather than just reverting."],
    ["Can you retrofit Control Tower onto existing accounts?",
     "Yes, by enrolling them, but it is harder than starting clean. Existing CloudTrail trails and Config recorders conflict with what Control Tower wants to create, and resolving that means touching live accounts. That is the practical argument for setting up the landing zone before migrating workloads into it rather than after."],
    ["What would you do differently in a landing zone you inherited?",
     "First thing I check is CIDR allocation, because overlapping ranges block Transit Gateway attachments and are expensive to fix once workloads are live. Then whether logging is genuinely centralised and immutable, and whether there are long-lived IAM users anywhere. Those three account for most of the pain in inherited environments."],
  ],
};

export const crossCutting = [
  {
    theme: "Cost",
    qa: [
      ["How do you approach cost optimisation on an account you've never seen?",
       "Measure before changing anything. Cost Explorer for the shape — which services, which accounts, growing or flat. Then the Cost and Usage Report in Athena for line-item detail, because Cost Explorer groups too coarsely to find the cause. Only then start on fixes, and start with the ones that need no application change: endpoints instead of NAT, storage class transitions, idle resources, right-sizing. Commitments like Savings Plans come last, once usage is stable, because committing to the wrong baseline is expensive."],
      ["What are the usual big wins?",
       "Idle and forgotten resources first — unattached EBS volumes, idle load balancers, old snapshots. Then NAT Gateway data processing, which is routinely the largest surprise. Then right-sizing, then storage lifecycle, then commitment discounts. Roughly in that order, because that is also the order of least to most coordination required."],
    ],
  },
  {
    theme: "Security",
    qa: [
      ["How do you handle secrets?",
       "Secrets Manager or Parameter Store, never environment variables in a repository and never in a container image. Rotation enabled where the service supports it. For anything running in AWS the better answer is no long-lived secret at all — IAM roles give short-lived credentials automatically, and most secrets exist because someone reached for a key when a role would have worked."],
      ["How do you apply least privilege in practice?",
       "Start from the access the workload actually used rather than from a wildcard. IAM Access Analyzer can generate a policy from CloudTrail activity, which is a far better starting point than writing one by hand. Then roles not users, permission boundaries where teams create their own roles, and SCPs for the organisation-wide rules."],
    ],
  },
  {
    theme: "GenAI and RAG",
    qa: [
      ["When would you not use RAG?",
       "When the knowledge is stable and small enough to fit in a prompt — then retrieval is pure overhead. When the task is reasoning rather than recall, because retrieval does not help. And when the answer must be exact and structured, like a credit score, where a deterministic query or rule beats a language model entirely. Knowing when not to reach for it is usually what the question is testing."],
      ["RAG vs fine-tuning?",
       "RAG for knowledge that changes or must be cited. Fine-tuning for behaviour — tone, format, a domain's phrasing — not for facts. Facts in weights cannot be updated cheaply or attributed to a source, which is disqualifying for anything auditable."],
      ["How do you evaluate an LLM feature?",
       "A fixed evaluation set with known answers, scored before every prompt or model change. For RAG I score retrieval and generation separately, because a bad answer caused by missing retrieval and a bad answer caused by the model ignoring context need completely different fixes. Without an eval set you are tuning prompts by vibes and cannot tell improvement from regression."],
    ],
  },
  {
    theme: "When you don't know",
    qa: [
      ["Saying you don't know, well",
       "Say what you do know, say what you would check, and say how you would decide. 'I have not used Kinesis Data Analytics in production. I know it sits between a stream and a sink for windowed aggregation, and I would compare it against doing the same in a Lambda consumer on cost and operational burden before choosing.' That reads as judgement. Guessing confidently and being wrong is the only answer that actually costs you the interview."],
    ],
  },
];

export const redFlags = [
  ["Reciting the architecture without the why", "Interviewers assume you can read a diagram. They are testing whether you understand the alternatives you rejected."],
  ["Claiming numbers you cannot defend", "If you say 30%, expect 'of what baseline, and over what period?'. Know the denominator or do not use the figure."],
  ["Saying a project went perfectly", "Nobody believes it. One well-handled problem makes the whole account more credible."],
  ["Using 'we' for everything", "Be precise about your own part. Overclaiming collapses the moment they ask a detailed follow-up."],
  ["Naming tools instead of answering", "'We used LangChain' is not an answer to 'how did you stop hallucination'. Name the mechanism."],
  ["Defending a choice you no longer agree with", "'It was right for the constraints then; with more time I would do X' is a strong answer, not a weak one."],
];
