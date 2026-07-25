// Security & Identity
export default {
  id: "security",
  label: "Security & Identity",
  icon: "🔒",
  color: "#DD344C",
  topics: [
    {
      id: "iam",
      title: "IAM – Identity & Access Management",
      shortDesc: "Manage users, roles, and permissions",
      visuals: ["RootVsIAMUser", "PolicyTypes", "PolicyEvaluation", "IAMEntities", "RoleUseCases", "AssumeRoleFlow", "RootBestPractices"],
      content: `## IAM – Identity & Access Management

**IAM** is the web service that securely controls **who can access what** in your AWS account, by managing users, their permissions, and credentials.

> Scenario: a company moves to AWS. The Chief Tech Officer creates the account and becomes the **root user**. Instead of sharing root, they create scoped IAM users — an "EC2 mastermind" and a "VPC visionary" — each able to manage only their own area.

---

## Root User vs IAM User

| | 👑 Root User | 👤 IAM User |
|--|------------|------------|
| Login | Account **email** + password | Sign-in URL + username/password |
| Permissions | **Unrestricted** (everything) | **None by default** — you attach policies |
| Can it be deleted/restricted? | No | Yes |
| Use | Rarely; lock down with MFA | Daily work, scoped to the job |

> Create an **account alias** so the sign-in URL hides your 12-digit account ID. IAM usernames are **not** case-sensitive.

---

## IAM Policies

A **policy** (JSON document) defines *who can do what on which resources*. Attach policies to users, groups, and roles. Three types:

| Type | Created by | Reusable? | Editable? | Notes |
|------|-----------|-----------|-----------|-------|
| **AWS Managed** | AWS | ✅ | ❌ | Ready-made (e.g. \`AmazonEC2FullAccess\`), auto-updated; may grant related-service access you didn't intend |
| **Customer Managed** | You | ✅ | ✅ | Fine-grained (target specific resource ARNs), versioned; max **6,144 chars** |
| **Inline** | You | ❌ | ✅ | Embedded in **one** entity (1-to-1); deleted with it; **no ARN** |

### Policy Evaluation Logic
1. **Default = Deny** — if nothing allows the action, it's denied (implicit deny)
2. **Explicit Allow** — a matching Allow grants access
3. **Explicit Deny wins** — a Deny overrides any Allow

> Test policies without logging in as the user via the **IAM Policy Simulator**.

---

## IAM Entities

### 👤 Users
Represent one human/app with **permanent** credentials.
- **Console access:** username + password
- **Programmatic access:** Access Key ID + Secret Access Key (CLI/SDK) — the secret is shown **once**, store it safely
- Secure with **MFA** and an account **password policy** (length, complexity, expiry, prevent reuse — applies to new users immediately, existing users at next password change)

### 👥 Groups
A collection of users with a similar role. Attach a policy to the **group once** → all members inherit it. Add a new teammate to the group and they instantly get the permissions. (Groups have no login; a user can be in multiple groups; a Deny anywhere still blocks.)

### 🎭 Roles
Grant **temporary** credentials to whoever **assumes** them — users, apps, or AWS services. No long-term keys. Credentials come from **STS** (15 min – 12 hrs, default 1 hr).

---

## The 5 Role Use Cases

1. **AWS Service** — let a service act for you. e.g. an **EC2 instance assumes a role to write to S3** — the secure alternative to hard-coding access keys in your app.
2. **AWS Account (Assume Role)** — an IAM user temporarily "switches" into a role for occasional access, **same or another account**.
3. **Web Identity** — sign in with **Google / Facebook / Amazon** (OAuth 2.0 + OpenID Connect, **JWT** tokens). For millions of app users — no IAM user each.
4. **SAML 2.0 Federation** — corporate **single sign-on** via Active Directory Federation Services (**XML** assertions, not JWT).
5. **Custom Trust Policy** — hand-craft exactly **who** can assume the role and **under what conditions** (MFA required, source-IP range, time window, department/group).

---

## Assume Role (STS)

Assuming a role swaps your identity for **temporary STS credentials** (default 1 hr, auto-renews). While assumed, you have **only the role's** permissions; switch back to regain your own.

- **Same account:** e.g. developer *Amit* has daily EC2 access but assumes an *S3-temp-access* role only when needed.
- **Cross account:** Company B (**trusted**) assumes a role in Company A (**trusting**) to use A's resources — e.g. *Photo Magic* edits *Cloud Store*'s S3 images. **Never create IAM users for outside partners** — let them assume a role.

**Trust relationship:** the role's **trust policy** names who may assume it (a user ARN or another account ID); the caller needs a policy allowing \`sts:AssumeRole\`.

**Why it beats sharing keys:** temporary credentials (expire ~1 hr), centralized management, every assumption **audited in CloudTrail**, and optional **MFA**.

---

## Root User Best Practices

1. **Enable MFA** (mandatory) — a second factor (6-digit code from Google Authenticator) on top of the password, so a stolen password alone can't log in
2. **Don't use root for daily work** — use IAM users/roles
3. **No root access keys** — delete them; use roles
4. **Least privilege** — grant only what each identity needs
5. **Audit with CloudTrail**
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
