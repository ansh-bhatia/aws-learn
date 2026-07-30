// Security & Identity
export default {
  id: "security",
  label: "Security & Identity",
  icon: "🔒",
  color: "#DD344C",
  topics: [
    {
      id: "iam-intro",
      title: "IAM – Why It Exists",
      shortDesc: "Root user vs IAM users, and creating your first scoped account",
      visuals: ["RootVsIAMUser"],
      content: `## The Scenario

A company moves its infrastructure to AWS. Whoever creates the AWS account becomes the **root user** — and root has **unrestricted** permission over absolutely everything: every service, billing, support plans, all of it.

As the company grows, root alone can't manage everything — an "EC2 specialist" and a "networking specialist" get hired to help. The tempting-but-wrong move: **share the root account's login** with them.

> **Sharing root is a serious security problem.** If an instance gets terminated unexpectedly, there's no way to tell *which* of several people using the same login did it. Multiple people sharing one identity destroys accountability entirely.

---

## The Fix: IAM

> **IAM (Identity and Access Management) is the web service that securely controls who can access what in your AWS account** — by managing users, their permissions, and their credentials.

Instead of sharing root, create a separate **IAM user** for each person, each with their own username and password, and each scoped to only the services their job actually requires.

---

## Root User vs IAM User

| | Root User | IAM User |
|---|---|---|
| Created | Automatically, the moment the AWS account is created | Created deliberately, by root or an admin |
| Login | Account **email** + password | A dedicated sign-in URL + username/password |
| Default permissions | **Unrestricted** — everything | **None at all** — permissions must be explicitly attached |
| Region-locked? | No | No, by default — a new user can create resources in **any** region unless explicitly restricted |

---

## Step 1 — Create an IAM User

**IAM → Users → Create user.**

- Username: e.g. **EC2-mastermind** (usernames are **not** case-sensitive)
- Enable **AWS Management Console access**, set a custom password (a real deployment would let the user set their own password at first login rather than assigning a fixed one)
- **Skip attaching any permissions for now** — the next three topics cover the three ways to grant them

Create the user, then note its dedicated **sign-in URL** — this is what the new user logs in with, not the root email login.

---

## Step 2 — Log In as the New User

> ⚠️ **AWS won't allow two different logins in the same browser session simultaneously.** Log in as the new IAM user in an **incognito window** (or a different browser entirely) while staying logged in as root elsewhere.

Once logged in: this user can do **nothing** yet. Attempting to view EC2 instances or create a VPC returns an authorization error — a brand-new IAM user starts with **zero** permissions by default.

---

## Step 3 — Set Up an Account Alias

By default, the sign-in URL exposes your raw **12-digit account ID** — not ideal to share around or have appear in a URL bar.

**IAM → Dashboard → Create an alias** (e.g. your company name). The sign-in URL becomes a friendly, memorable name instead of the numeric account ID, with no functional difference otherwise.

---

## What's Next

This user exists and can log in, but is functionally useless until it has permissions. The next three topics cover exactly that — the three distinct **types of IAM policy** used to grant access, starting with the one AWS provides ready-made.
`,
    },
    {
      id: "iam-aws-managed-policies-lab",
      title: "Lab – AWS Managed Policies",
      shortDesc: "Ready-made, AWS-maintained permissions — fast to apply, but with a hidden related-service side effect",
      visuals: ["PolicyTypes"],
      content: `## What a Policy Actually Is

> **An IAM policy is a JSON document that defines who is allowed to do what, on which AWS resources.** It can be written directly in JSON, or built through a visual editor that generates the same JSON underneath. Policies attach to **users, groups, or roles** — this lab attaches directly to users.

There are **three** types of IAM policy: **AWS Managed**, **Customer Managed**, and **Inline**. This topic covers the first.

---

## What Makes a Policy "AWS Managed"

> **AWS Managed policies are pre-built, ready-to-use policies created and maintained by AWS itself** — designed for common use cases across a wide range of services, attachable to any number of users/groups/roles, and **automatically updated by AWS** as new related permissions or services emerge, with zero manual maintenance required.

Find them under **IAM → Policies** — they're listed alongside customer-managed ones but are visibly not editable.

---

## Step 1 — Create Two Users

**EC2-mastermind** and **VPC-visionary** — both plain IAM users, console access enabled, **no permissions attached yet**. Confirm both can log in but can do nothing (the now-familiar "not authorized" errors on any action).

---

## Step 2 — Attach EC2FullAccess to EC2-mastermind

Select **EC2-mastermind → Permissions → Add permissions → Attach policies directly** → search **AmazonEC2FullAccess** → attach.

Log in as EC2-mastermind: EC2 actions now work fully — launching an instance, managing security groups, everything.

---

## Step 3 — The Hidden Side Effect

> ⚠️ **This same user can also manage VPC resources — internet gateways, NAT gateways — despite never being granted any VPC permission directly.** AmazonEC2FullAccess includes permissions for services **EC2 depends on**, since managing an instance inherently involves its networking configuration. This is the defining trade-off of managed policies: convenient breadth, at the cost of not always knowing exactly what you've granted.

---

## Step 4 — Attach AmazonVPCFullAccess to VPC-visionary

Same steps, different policy. Logging in as VPC-visionary: full VPC management works, and — interestingly — EC2's **networking-adjacent** actions (like viewing Elastic IPs) partially work too, while anything requiring actual **instance type selection** correctly fails. The boundary of "related services" isn't always intuitive from the policy name alone.

---

## Benefits vs Limitations

| Benefits | Limitations |
|---|---|
| Simple — ready to attach immediately | **No resource-level targeting** — can't scope to specific instances, only whole services |
| Maintained and auto-updated by AWS | **Not editable** — permissions are exactly what AWS wrote, nothing more or less |
| Reusable across any number of entities | Grants related-service access **implicitly**, which can be more than intended |
| Written following AWS's own best practices | Full dependence on AWS's update schedule, not yours |

> **Worked limitation:** wanting EC2-mastermind to manage only **2 of 4** EC2 instances, or to be able to launch but never terminate — AWS Managed policies simply cannot express either restriction. That precision requires writing your **own** policy — a **Customer Managed policy**, covered next.
`,
    },
    {
      id: "iam-customer-managed-policies-lab",
      title: "Lab – Customer Managed Policies",
      shortDesc: "Resource-scoped, fully custom JSON permissions — plus the exact rules for how Allow and Deny interact",
      visuals: ["PolicyEvaluation"],
      content: `## Why Write Your Own Policy

AWS Managed policies can't restrict access to **specific** resources or **specific** actions within a service. When the requirement is genuinely that precise — e.g. "this user manages exactly 2 of my 3 EC2 instances, and can never terminate anything" — only a **Customer Managed policy** can express it.

> **A Customer Managed policy is created and maintained entirely by you**, attachable to any number of users/groups/roles, requiring **manual updates** as requirements change, but offering **fine-grained, resource-level control** plus **versioning and rollback**.

---

## Step 1 — The Scenario

Three EC2 instances exist: **server-1, server-2, server-3**. The goal: **EC2-mastermind** can **start, stop, and terminate only server-1 and server-2** — never server-3, and no other EC2 action beyond those three.

First, attach **AmazonEC2ReadOnlyAccess** (an AWS Managed policy) so the user can at least **see** instance details — confirm read access works, but stopping or starting anything still fails, exactly as expected.

---

## Step 2 — Build the Custom Policy

**IAM → Policies → Create policy** → **Visual editor** (or switch to **JSON** directly — for anything beyond the simplest policy, JSON is usually faster once you're comfortable with the structure; AI tools like ChatGPT are genuinely useful for drafting the JSON correctly).

- **Service:** EC2
- **Actions:** search and select **StartInstances**, **StopInstances**, **TerminateInstances** — **Allow**
- **Resources:** ⚠️ do **not** leave this as "All resources" — that would defeat the entire purpose. **Add ARN** for each of the two target instances specifically (region **ap-south-1**, plus each instance's ID), so the policy applies **only** to server-1 and server-2

Name it **mastermind-EC2-policy** and create it. Viewing its JSON afterward shows the standard shape: **Version**, **Effect: Allow**, **Action** (the three verbs), **Resource** (the two specific instance ARNs).

---

## Step 3 — Attach and Test

Attach **mastermind-EC2-policy** to **EC2-mastermind** (in addition to the read-only policy already attached — policies **stack**, they don't replace each other).

Testing as EC2-mastermind: **stop server-1** ✅, **stop server-2** ✅, **terminate server-1** ✅ — but **stop server-3** and **terminate server-3** both fail with "not authorized," exactly matching the resource-scoped ARNs in the policy.

---

## Step 4 — Test Without Logging In: the Policy Simulator

Repeatedly logging in and out as the test user to check every scenario is slow. **IAM → Policy simulator** lets you check any user's effective permissions instantly:

Select the user, the service (EC2), and the action (e.g. **TerminateInstances**) → run against **all resources (wildcard)** → result: **Deny** (correctly — the policy only allows two specific instances, not "all"). Run again scoped to **server-2's specific ARN** → result: **Allow**.

> No login switching required — the simulator evaluates the exact same logic AWS applies at request time.

---

## Policy Evaluation Logic (Critical to Memorize)

1. **Default is Deny** — if no policy explicitly allows an action, it's denied. A user with zero policies attached can do literally nothing.
2. **Explicit Allow grants access** — any matching Allow statement, from any attached policy, permits the action.
3. **Explicit Deny always wins** — a Deny statement, anywhere in any attached policy, overrides every Allow, no matter how permissive.

**Proven directly:** attach **AmazonEC2FullAccess** (broad Allow) to EC2-mastermind alongside a small custom policy that **explicitly denies** every EC2 action on one specific instance's ARN. Result: the user can do virtually anything to any *other* instance, but is completely blocked on that one specific instance — the narrow Deny beats the broad Allow every time.

---

## The Size Limit

> ⚠️ **A single Customer Managed policy cannot exceed 6,144 characters** (including whitespace), measured in its JSON representation. For genuinely large permission sets, this means splitting logic across multiple policies rather than one giant document.

---

## What's Left

Customer Managed policies solve resource-level precision — but they're still separate, reusable objects, attachable to many entities. The third and final policy type, **Inline policies**, takes the opposite approach: permissions welded permanently to exactly one entity.
`,
    },
    {
      id: "iam-inline-policies-lab",
      title: "Inline Policies",
      shortDesc: "A 1-to-1 policy with no ARN, deleted automatically the moment its one entity is deleted",
      visuals: [],
      content: `## The Defining Difference

AWS Managed and Customer Managed policies are both **standalone objects** — created once, then attached to (and detached from) any number of users, groups, or roles without the policy itself ever being deleted.

> **An Inline policy is the opposite: it's embedded directly inside exactly one IAM entity**, with a strict **1-to-1 relationship**. The JSON syntax and permission logic work identically to a Customer Managed policy — only **how it's created and attached** differs.

---

## Proving the Reusability Difference

Create a Customer Managed policy (**my-managed-policy**) and attach it to **user-1**. Attach the **exact same policy** to **user-2** as well — no problem at all; it's the same standalone object, referenced by two different entities.

Now try to create an **Inline** policy the same way — via **IAM → Policies → Create policy**. It's not possible: inline policies can **only** be created from directly inside a specific user, group, or role's own page, never as an independent object in the policy list.

**Create one properly:** select a user → **Permissions → Add permissions → Create inline policy** → write it (JSON or visual editor — identical syntax to any other policy) → name it, e.g. **inline-for-testing** → save.

> This inline policy will **never appear in the main Policies list** — it exists only attached to this one user, invisible anywhere else.

---

## What Happens When the Entity Is Deleted

**Delete the user carrying the inline policy.** The policy disappears along with it — permanently, with no way to recover or reuse it.

**Delete a user carrying a Customer Managed policy instead.** The user is gone, but the policy **survives** in the Policies list — simply showing zero attachments now, ready to be attached to some other entity later if needed.

> This is the core practical distinction: **Customer/AWS Managed policies outlive the entities they're attached to; Inline policies do not.**

---

## No ARN

Every Customer Managed (and AWS Managed) policy has its own **ARN** — a real, independently-addressable resource. An Inline policy has **none** — because it isn't independently addressable at all; it only ever exists as part of its one entity's own ARN.

---

## When Inline Actually Makes Sense

- **A specific, one-off job need** — e.g. a department head needs one extra permission that should never accidentally end up reused by anyone else. An inline policy structurally **cannot** be reused, which is itself the safety feature.
- **Short-term or project-based access** — a contractor or a short project where the user account itself is getting deleted in days anyway. Using a Customer Managed policy here just leaves an orphaned, unused policy cluttering the account's policy list after cleanup; inline policy cleans up automatically.
- **Compliance requirements** — some organizations mandate inline policies specifically *because* they can't be detached and reattached elsewhere, which is a meaningful audit and security property in stricter environments.

> No separate hands-on lab is needed here beyond what's shown above — the actual permission-writing and evaluation logic is **identical** to Customer Managed policies (same JSON, same Allow/Deny/resource-ARN rules from the previous topic). The only thing that differs is the lifecycle: **1-to-1, no ARN, deleted with its entity.**
`,
    },
    {
      id: "iam-org-sso",
      title: "IAM – Reports, Organizations & SSO (Part 2)",
      shortDesc: "IAM reports, AWS Organizations + SCPs, Identity Center",
      visuals: ["IAMReports", "AWSOrganizations", "SCPSimulator", "IdentityCenterSSO"],
      content: `## IAM Part 2 — Reports, Organizations & SSO

Building on IAM fundamentals: the security **reports** IAM produces, managing many accounts with **AWS Organizations** + **SCPs**, and single sign-on via **IAM Identity Center**.

---

## Tasks That Require the Root User

Most work should use IAM users/roles, but a few actions **only** the root user can do:
- Change account settings (email, root password) & **close** the account
- Restore IAM user permissions (if fully denied)
- Configure **AWS Shield Advanced**, alternate billing contacts
- Change payment method, cancel/transfer support plans
- Request service-limit increases, sign up for GovCloud

> For everyday work, create an **admin IAM user** (attach the \`AdministratorAccess\` managed policy) and leave root locked away.

### Root security best practices (continued)
- **Delete/rotate root access keys** — ideally root has **no** access keys at all
- **Secure the account's email** (it can reset the root password)
- Use an **account alias** so the sign-in URL doesn't expose the 12-digit account ID

---

## The 3 IAM Reports

| Report | Shows | Scope | Format | Region |
|--------|-------|-------|--------|--------|
| **Credential Report** | Every user's password/MFA/access-key status | All IAM users | Downloadable **CSV** | Global |
| **Access Advisor** | Which services an entity's policies allow + last-accessed time | Users/groups/roles | In-console (real-time) | Global |
| **Access Analyzer** | Resources shared **externally** + **unused** permissions | Resources/policies | In-console findings | **Per-region** |

- **Credential Report** → auditing/compliance (find users without MFA, stale keys)
- **Access Advisor** → least privilege (revoke services never used)
- **Access Analyzer** → detect unintended external exposure (public S3, cross-account roles). External findings are **free**; unused-access findings are **paid**. Unlike the rest of IAM, it's **per-region**, not global.

---

## AWS Organizations

Centrally manage **multiple AWS accounts** (separate accounts for departments, prod/test, billing, compliance, DR, experiments…). Free.

### Structure
- **Root** → **Organizational Units (OUs)** → **accounts**
- One **management account** (the main one) + **member accounts**
- Add accounts by **creating new** ones (no card — management account pays) or **inviting existing** ones (invited root accepts)

### Two headline benefits
1. **Consolidated Billing** — one bill across all accounts, easier tracking, and pooled usage can earn **volume discounts** (enabled automatically when an account joins)
2. **Service Control Policies (SCPs)** — org-wide guardrails (below)

---

## Service Control Policies (SCPs)

SCPs are **guardrails** that **limit** what accounts can do — they **never grant** permissions (IAM still does that). Key facts:
- Apply at **Root / OU / Account** levels (inherited downward)
- Affect **member accounts only** (incl. their root user) — **not** the management account
- A default **\`FullAWSAccess\`** SCP is attached everywhere out of the box

### Evaluation logic
1. A service is allowed only if it's **allowed at EVERY level** down the hierarchy
2. An **explicit Deny always wins** (overrides any allow)
3. A level with **no SCP = implicit deny**
4. The final result also requires the **IAM policy to allow** the action

> Example: attach \`Deny S3\` at the OU → every account beneath it loses S3, even if their IAM admin allows it. Attach \`Deny EC2\` at one account → only that account loses EC2.

---

## IAM Identity Center (SSO)

The successor to **AWS Single Sign-On**. For **workforce users** who need **multiple AWS accounts** — like one Google login for Gmail + Drive + YouTube. Sign in **once** to reach many accounts. Requires **AWS Organizations**.

### Without it
User X needs a **separate IAM user + password in every account** — hard to manage.

### With Identity Center
Create the user **once**; assign **permission sets** per account. e.g. User X → **EC2 FullAccess in Account 1** and **S3 FullAccess in Account 2**.

### Key terms
- **Workforce identity** — a user needing multiple accounts
- **Identity source** — where users live: built-in **Identity Center directory**, **Active Directory**, or a **SAML 2.0** IdP (one source at a time)
- **Permission set** — a bundle of permissions (e.g. \`EC2FullAccess\`) assigned per user, per account
- **Multi-account permissions** — map user → permission set → account

> Sign-in is via the SSO portal (MFA enforced); all activity is logged in **CloudTrail**.
`,
    },
    {
      id: "cognito",
      title: "Cognito",
      shortDesc: "User authentication and authorization",
      content: `## Cognito

**Amazon Cognito** adds **authentication, authorization & user management** to web/mobile apps. Two parts:

- **User Pools** — a user directory; sign-up/sign-in, MFA, **social & enterprise login** (Google, Facebook, SAML, OIDC). Issues **JWT tokens** to call your APIs (integrates with API Gateway).
- **Identity Pools (Federated Identities)** — exchange a verified identity for **temporary AWS credentials** (via STS) to access AWS services directly (e.g. upload to S3).

> Exam: "**sign-in / user directory / social login** for an app" → User Pool. "give app users **temporary AWS access**" → Identity Pool.`,
    },
    {
      id: "acm",
      title: "ACM – Certificate Manager",
      shortDesc: "Free TLS/SSL certificates for AWS services",
      visuals: ["ACMVisual", "EncryptionKeys"],
      content: `## ACM – AWS Certificate Manager

**TLS** (successor of SSL) powers HTTPS — providing **authentication, encryption & integrity**. A **Certificate Authority (CA)** issues certificates that browsers trust.

**TLS handshake:** browser requests site → server sends its **certificate + public key** → browser validates the CA → browser sends a secret key encrypted with the server's public key (only the **private key** decrypts it) → encrypted session.

**ACM** is AWS's CA: issues/manages **free** TLS certs (DNS or email validation) deployed on **ELB, CloudFront, API Gateway, Elastic Beanstalk**. Free with these services. Edge/CloudFront certs must be in **us-east-1**.

> **Keys:** Symmetric = one shared key (fast). Asymmetric = public+private pair (enables HTTPS & signatures).`,
    },
    {
      id: "kms",
      title: "KMS – Key Management Service",
      shortDesc: "Create and manage cryptographic keys",
      visuals: ["KMSVisual", "EncryptionKeys"],
      content: `## KMS – Key Management Service

**KMS** creates & manages encryption keys (CMKs) and integrates with EBS, S3, RDS, Redshift, etc. — tick "encrypt" and pick a key. Used for **encryption at rest** (vs ACM/TLS = in transit).

| Aspect | AWS-managed CMK | Customer-managed CMK |
|---|---|---|
| Created/managed by | AWS | You |
| Rotation | Every 3 years (fixed) | 1 year (configurable) |
| Can delete? | No | Yes |
| Use outside AWS | No | Yes |

> **Exam:** need 1-year rotation, deletion, or external use → **customer-managed** CMK. Keys are **region-bound**. **Envelope encryption:** the CMK encrypts a **data key**, which encrypts your data; only principals with key permission can decrypt.`,
    },
    {
      id: "sts",
      title: "STS – Security Token Service",
      shortDesc: "Temporary credentials & identity federation",
      visuals: ["STSVisual"],
      content: `## STS – Security Token Service

**STS** issues **temporary**, short-lived credentials (minutes–hours), generated on demand (not stored with a user). IAM = permanent; **STS = temporary**. Main use: **identity federation**.

- **Enterprise federation** — existing org users (e.g. **Active Directory**) access AWS without new IAM identities, via **SAML 2.0** + ADFS → single sign-on.
- **Web identity federation** — sign in with **Google / Facebook / Amazon / OpenID Connect**, then exchange the token for temporary AWS permissions.

> Benefits: no long-term credentials to embed/rotate, no IAM users to create, auto-expiry. *(Mainly a Developer-exam topic — recognize it as an answer option.)*`,
    },
    {
      id: "waf",
      title: "WAF – Web Application Firewall",
      shortDesc: "Protect web apps from common exploits",
      visuals: ["WAFVisual"],
      content: `## WAF – Web Application Firewall

**WAF** is a layer-7 firewall that monitors/blocks/allows HTTP requests to **ALB, CloudFront, API Gateway & AppSync** (not directly to EC2). Rules match by **IP, country, or string/regex**.

Rule actions: **Count** (monitor only), **Allow**, **Block** (returns 403). Build with **IP sets** + a **Web ACL** (capacity in WCU).

> **AWS Managed Rules** = ready-made protections (SQL injection, XSS, bad bots, IP reputation). For **DDoS**, use **AWS Shield**. WAF can't attach directly to EC2 — front it with ALB/CloudFront.`,
    },
    {
      id: "cloudhsm",
      title: "CloudHSM",
      shortDesc: "Dedicated hardware security module",
      visuals: ["CloudHSMVisual"],
      content: `## CloudHSM (Hardware Security Module)

An **HSM** is dedicated tamper-proof hardware for generating/storing cryptographic keys (used by CAs, banks — often a **compliance requirement**). **CloudHSM** gives you a managed, single-tenant HSM in the cloud — no hardware to buy.

- **Your own keys** on dedicated hardware you fully control.
- **Standards-compliant** (FIPS 140-2 Level 3); keys exportable to other HSMs.
- **Fully managed** (provisioning, patching, HA, backups); deploy in a cluster across AZs.
- **Scalable** on demand, no upfront cost.

> **KMS vs CloudHSM:** KMS is multi-tenant & AWS-managed (easy, shared); **CloudHSM** is single-tenant dedicated hardware you control — for strict compliance & running your own CA.`,
    },
    {
      id: "shield",
      title: "Shield",
      shortDesc: "DDoS protection for AWS resources",
      content: `## Shield

**AWS Shield** is **DDoS protection**.

- **Shield Standard** — **free**, automatic for all AWS customers; protects against common layer 3/4 (network/transport) attacks.
- **Shield Advanced** — paid; enhanced protection for **EC2, ELB, CloudFront, Global Accelerator, Route 53**, with 24/7 DDoS response team, cost-protection for scaling during attacks, and detailed reporting.

> Shield = **DDoS** (volumetric/network). **WAF** = layer-7 app exploits (SQL injection, XSS). Often used together.`,
    },
    {
      id: "secrets-manager",
      title: "Secrets Manager",
      shortDesc: "Store and rotate secrets securely",
      content: `## Secrets Manager

**AWS Secrets Manager** securely **stores, encrypts (KMS) & automatically rotates** secrets — database credentials, API keys, tokens. Apps retrieve secrets at runtime via API instead of hardcoding them.

- **Automatic rotation** (built-in for RDS/Aurora/Redshift/DocumentDB; custom via Lambda).
- Fine-grained access via IAM; full audit via CloudTrail.

> **Secrets Manager** vs **SSM Parameter Store**: Parameter Store is free & simple (config + secrets) but **no built-in rotation**; Secrets Manager costs per secret but **auto-rotates**. Need rotation → Secrets Manager.`,
    },
    {
      id: "guardduty",
      title: "GuardDuty",
      shortDesc: "Intelligent threat detection",
      content: `## GuardDuty

**Amazon GuardDuty** is an intelligent **threat detection** service. It continuously analyzes **VPC Flow Logs, CloudTrail, and DNS logs** using ML to spot malicious or unauthorized activity — no agents to install.

- Detects compromised instances, crypto-mining, unusual API calls, reconnaissance, data exfiltration.
- Findings can trigger **EventBridge → Lambda/SNS** for automated response.

> Exam: "**automatically detect threats / suspicious activity** across the account using logs + ML" → **GuardDuty**. (Inspector = vulnerability scan of EC2; GuardDuty = active threat detection.)`,
    },
  ],
};
