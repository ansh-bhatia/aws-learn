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
      id: "iam-users-lab",
      title: "Lab – IAM Users, Access Keys & Password Policy",
      shortDesc: "Console vs programmatic credentials, MFA, and enforcing a strong password policy account-wide",
      visuals: ["IAMEntities"],
      content: `## IAM Has 3 Core Entities

> **IAM entities are the core of AWS access control: User, Group, and Role.** All three work the same basic way — create the identity, then attach a policy to define what it can do. This topic covers the first: the **User**.

An IAM user is a **logical identity representing one physical person** (or application) who needs AWS access — created specifically so nobody ever has to share the root account's login.

---

## Step 1 — Create a User With Console Access

**IAM → Users → Create user** → name it (e.g. **user-1**) → enable **console access** (optional — a user could instead get only programmatic or CLI access, or a mix) → set a password → attach **AmazonEC2FullAccess** directly.

Logging in as this user: full EC2 management works immediately. **Detach** the policy and refresh — the same user is now completely locked out of EC2, confirming permissions live entirely in the attached policy, not the user account itself.

---

## Step 2 — Access Keys for Programmatic Access

Console login (username + password) only works for browser-based access. Anything programmatic — the **AWS CLI** or an **SDK** in application code — needs a different credential pair entirely.

> **An Access Key ID + Secret Access Key** is what programmatic/CLI access uses instead of a password. Generate one under **user → Security credentials → Access keys → Create access key**.

> ⚠️ **The secret access key is shown exactly once.** Download the CSV immediately. If it's lost, there's no way to retrieve it again — only to delete that key and generate a brand-new pair. Never share either value; anyone holding them can act as that user programmatically.

---

## Step 3 — Multi-Factor Authentication (MFA)

> Passwords alone are crackable. **MFA adds a required second factor** — typically a time-limited code from an authenticator app — so a stolen password alone still isn't enough to log in.

**User → Security credentials → Assign MFA device** → name it → choose **Authenticator app** (Google Authenticator or similar) — hardware MFA devices are also purchasable from AWS, but the authenticator app option needs no extra hardware.

Scan the generated QR code with the authenticator app, then enter **two consecutive codes** (roughly a minute apart) to confirm the pairing. From then on, logging in as this user requires the password **and** the current rotating code from the app.

> **Best practice: enable MFA on every IAM user, and treat it as mandatory for root** (root MFA setup is covered in the dedicated root-user-security topic).

---

## Step 4 — Enforce a Strong Account-Wide Password Policy

**IAM → Account settings → Password policy → Edit.**

- **IAM default policy:** minimum 8 characters, requires upper/lowercase + numbers + symbols, **passwords never expire**, and a password can't match the account name or email
- **Custom policy** options: minimum length (6–128 — but ⚠️ setting it unreasonably high, e.g. 50 characters, backfires: nobody can memorize a 50-character password, so it ends up written down somewhere insecure instead — **8–12 characters with full complexity** is the realistic sweet spot), a password **expiration period** (e.g. 15 days), whether expired-password users can reset their own password or need an **administrator reset**, and **prevent password reuse** (e.g. the last 24 passwords) — this last one specifically stops someone from just alternating between two passwords every expiration cycle

> ⚠️ **A new password policy only affects existing users the next time THEY change their password** — it does not retroactively force anyone with a currently-valid password to change it immediately. New users created after the policy change must follow it from day one.

---

## What's Next

Attaching the exact same policy to every user with a similar job, one at a time, doesn't scale. The next topic — **IAM Groups** — solves exactly that.
`,
    },
    {
      id: "iam-groups-lab",
      title: "Lab – IAM Groups",
      shortDesc: "Attach a policy once to a group instead of once per user, and every member inherits it automatically",
      visuals: [],
      content: `## The Problem Groups Solve

Ten users all doing the same job (say, managing EC2) each need the **same** policy attached individually. That's ten separate attach operations today — and ten separate re-attach operations the moment that job's permissions need to change.

> **An IAM Group is a collection of users that share a policy attachment.** Attach a policy to the group **once**, and every current (and future) member inherits it automatically — with zero per-user policy management.

---

## Step 1 — Create Three Plain Users

**user-1, user-2, user-3** — no policies attached to any of them individually. Confirm all three currently have zero EC2 access.

---

## Step 2 — Create the Group and Add Members

**IAM → User groups → Create group** → name **EC2-manager** → add **user-1, user-2, user-3** as members → create.

Check any member's **Groups** tab — it now shows membership in **EC2-manager**.

---

## Step 3 — Attach a Policy to the Group, Not the Users

**EC2-manager group → Permissions → Add permissions** → attach **AmazonEC2FullAccess** directly to the **group**.

Log in as **any** of the three users — all three now have full EC2 access, despite never having a policy attached to their individual user account. The permission flows entirely from group membership.

---

## Step 4 — Add a New Team Member Later

**Create a new user, user-4**, and during creation, **add it directly to the EC2-manager group**. It inherits the group's EC2FullAccess immediately — no separate policy-attachment step was ever needed for this new hire.

> This is the real payoff: onboarding a new person who does the same job as an existing team is a single "add to group" action, not a policy-attachment checklist repeated per person.

---

## Key Facts to Remember

- **Groups have no login credentials of their own** — you cannot sign in "as" a group, only as a user who happens to belong to one
- **A user can belong to multiple groups simultaneously**, and inherits the **union** of every group's permissions
- **An explicit Deny anywhere still wins** — if one group grants an action and another (or a directly-attached policy) explicitly denies it, the Deny overrides, exactly as covered in the policy-evaluation logic from the customer-managed-policy lab
- Groups still need **regular review** — membership drifts over time as people change roles, and stale group membership is a common source of over-privileged accounts in real organizations

---

## What's Next

Users and Groups both grant **long-term** credentials — a password or access key that persists indefinitely until someone deliberately changes or revokes it. The third IAM entity, **Roles**, works completely differently: **temporary** credentials, assumed only when needed, and — as the next topic shows — the correct way to let an EC2 instance talk to another AWS service without ever hard-coding a secret key anywhere.
`,
    },
    {
      id: "iam-roles-service-lab",
      title: "Lab – IAM Roles for AWS Services",
      shortDesc: "The insecure way (access keys baked into an EC2 instance) vs the correct way (an assumed role) — built and compared side by side",
      visuals: ["RoleUseCases"],
      content: `## Why Roles Exist at All

> **By default, every AWS service under your account is completely isolated from every other one** — even under the same root account, EC2 cannot reach S3, Lambda cannot reach DynamoDB, and so on, unless something explicitly authorizes that specific interaction. A Role is how that authorization is granted.

> **A Role is not tied to one specific person like a User is** — it's assumed by whoever (or whatever) needs it, temporarily, then released. Credentials from an assumed role are **temporary**, unlike a User's permanent password and access keys.

This lab builds the same real scenario **twice** — once the insecure way, once the correct way — so the difference is concrete, not just theoretical.

---

## The Scenario

A web app running on an EC2 instance needs to let users upload files (photos, PDFs) which get stored in an **S3 bucket** (AWS's object storage service — covered in full detail in the Storage section; here it's just "the place uploaded files land"). By default, the EC2 instance **cannot** write to S3 — that cross-service access needs to be explicitly granted.

---

## Attempt 1 — The Insecure Way (Access Keys Hard-Coded)

**Step 1:** Create an IAM user, **s3-access-user**, with **no console access** (it exists purely to hold programmatic credentials) → generate an **access key + secret key** for it.

**Step 2:** Create an S3 bucket, e.g. **my-app-03**.

**Step 3:** Create a Customer Managed policy allowing **PutObject** on that bucket's ARN specifically, and attach it to **s3-access-user**.

**Step 4:** Launch an EC2 instance with a user data script that **hard-codes the access key and secret key directly in the script**, alongside the bucket name, so the running application can authenticate as s3-access-user and upload files.

**Test it:** open the app, upload a file — it lands correctly in the S3 bucket. **Functionally, this works.**

> ⚠️ **But it fails every real security review.** The access key and secret key sit in plain text inside the instance's user data / application code. Anyone who gains any access to that server — a misconfigured permission, a vulnerability, a careless log dump — can read the credentials directly and act as that IAM user anywhere, anytime, with no expiration. This is explicitly called out as **not** an AWS best practice.

---

## Attempt 2 — The Correct Way (An Assumed Role)

**Step 1:** Terminate the insecure instance entirely — starting the secure version from scratch.

**Step 2:** **IAM → Roles → Create role → Trusted entity: AWS service → EC2.** This tells AWS: *this role can be assumed by an EC2 instance.*

**Step 3:** Attach the **exact same S3 PutObject policy** used in Attempt 1 (same bucket, same permission) — the policy itself doesn't change; only **how it's delivered** does.

Name the role (e.g. **my-app-s3-access**) and create it.

**Step 4:** Launch a **new** EC2 instance. This time, the user data script contains **only the bucket name — no access key, no secret key anywhere**. During launch, set **IAM instance profile** to the role just created (this can also be attached to an already-running instance afterward, if needed).

> **What actually happens:** when the EC2 instance starts, it automatically **assumes** the attached role and receives **temporary security credentials** — scoped to exactly the S3 permission the role's policy grants, nothing more — with no credentials ever appearing in code, scripts, or logs.

**Test it:** open the new app, upload a file — it lands in the bucket exactly as before. **Functionally identical result, with zero hard-coded secrets anywhere.**

---

## The Comparison That Matters

| | Access Keys on EC2 | IAM Role Attached to EC2 |
|---|---|---|
| Credentials in code/scripts? | ✅ Yes — visible to anyone with server access | ❌ Never |
| Credential lifetime | Permanent until manually rotated | Temporary, auto-issued, auto-renewed |
| Result if the server is compromised | Attacker gets a reusable, long-lived credential | Attacker gets nothing extractable — the role can't be "stolen" the same way |
| AWS best practice? | ❌ Explicitly discouraged | ✅ The recommended pattern |

> This is the first of **five** IAM role use cases — granting a **service** (here, an EC2 instance) permission to act on your behalf. The remaining four — assuming a role as a **user** (same account and cross-account), **web identity federation**, **SAML 2.0 federation**, and **custom trust policies** — are covered in the next several topics.
`,
    },
    {
      id: "iam-assume-role-same-account-lab",
      title: "Lab – Assume Role (Same Account)",
      shortDesc: "Temporary S3 access for a user whose day job is EC2 — without ever attaching S3 permission directly",
      visuals: ["AssumeRoleFlow"],
      content: `## The Second Role Use Case

The previous topic covered a **service** (EC2) assuming a role. This one covers a **user** assuming a role — the same underlying mechanism, applied to occasional, temporary access instead of a service's permanent need.

> **Assume Role lets a user, service, or application temporarily adopt a role's permissions.** The result is a set of **temporary security credentials** from **STS**, customizable from **15 minutes to 12 hours** (default: **1 hour**, auto-renewing).

Roles support **same-account** access (this topic) and **cross-account** access (next topic).

---

## The Scenario

Developer **Amit** needs **daily** access to EC2 (his actual job) but only **occasional** access to an S3 bucket. Two different access patterns need two different mechanisms:

> **Permanent, daily need → attach a policy directly to the user. Occasional, temporary need → create a role and let the user assume it when actually needed.**

---

## Step 1 — Permanent EC2 Access (Directly Attached)

Create user **Amit**, console access enabled. Attach **AmazonEC2FullAccess** **directly** to Amit's user account — since this is his daily-driver permission, there's no reason to route it through a role at all.

---

## Step 2 — A Role for Occasional S3 Access

**IAM → Roles → Create role → Trusted entity: AWS account → This account** (same-account access, not cross-account).

Attach **AmazonS3FullAccess** (a Customer Managed policy scoped to a specific bucket works too, for tighter control) → name it **S3-temp-access** → create.

---

## Step 3 — Grant Amit Permission to Assume It

**Two ways to wire this up:**

1. **Edit the role's trust policy directly** — Role → **Trust relationships → Edit trust policy → Add principal** → select IAM user → paste **Amit's user ARN**. This defines *who may assume this role*.
2. **Attach a policy to Amit's user** granting **sts:AssumeRole** on the role's ARN instead — functionally equivalent, approached from the user side rather than the role side.

This lab uses the first method — editing the role's trust policy to add Amit as a trusted principal.

---

## Step 4 — Assume the Role and Test

Log in as **Amit**. Right now: full EC2 access (from Step 1), but **zero** S3 access — S3 actions are greyed out entirely.

**Click the account name (top right) → Switch role.** First time, this requires entering the **account ID**, the **role name** (S3-temp-access), and optionally a **display name** for convenience.

Once switched: Amit can now create buckets, upload files — full S3 access, temporarily. Critically: **while the role is active, EC2 access disappears** — assuming a role doesn't add its permissions on top of the user's own; it **replaces** the current session's permissions with exactly what the role grants, nothing more.

**Switch back** to return to being plain Amit — S3 access disappears again, EC2 access returns.

---

## Why This Beats Just Attaching S3FullAccess to Amit Directly

1. **Security — limited blast radius.** The STS token expires in as little as an hour. If Amit's session or credentials are somehow compromised while the role isn't even assumed, there's nothing extra to steal — S3 access only exists during the brief window the role is actively assumed.
2. **Centralized management.** Need to grant (or revoke) this same occasional S3 access for an entire team of developers? Add or remove their ARNs from **one role's trust policy**, rather than attaching and detaching a policy on every individual user account.
3. **Full audit trail.** Every assumption of a role is logged in **CloudTrail** — exactly who assumed what, and when — distinguishing "Amit doing his daily EC2 work" from "Amit temporarily touching S3," which a single blanket permission could never distinguish.
4. **Optional MFA enforcement.** Role creation offers a **"Require MFA"** toggle — an extra identity check specifically at the moment of assuming elevated, if-temporary access.

> **Rule of thumb:** permanent, daily-use permission → attach directly to the user. Occasional, temporary, or sensitive access → create a role and assume it only when actually needed.
`,
    },
    {
      id: "iam-assume-role-cross-account-lab",
      title: "Lab – Assume Role (Cross-Account Access)",
      shortDesc: "Letting one company's user borrow another company's S3 access — without ever creating them an account",
      visuals: [],
      content: `## The Scenario

**Cloud Store Pvt Ltd** stores high-resolution photos in an S3 bucket. **Photo Magic Pvt Ltd**, a separate company with its own separate AWS account, needs to **read** those photos for their editing platform.

> **Cross-account access lets a user or resource in one AWS account access resources in a completely different AWS account** — the same Assume Role mechanism as same-account access, just with the trust extended across an account boundary instead of within one.

---

## The Tempting-But-Wrong Approach

> ⚠️ **Option 1 (don't do this): Cloud Store creates a dedicated IAM user inside its own account, specifically for someone at Photo Magic to log in with.**

Three real problems with this:

1. **Security risk** — sharing IAM credentials with an outside company for ongoing use is inherently riskier; if compromised, the blast radius includes a partner company's access into your account
2. **Credential lifecycle burden** — Cloud Store now owns the responsibility of managing this user's password resets, and re-provisioning every time Photo Magic's staff changes (someone leaves, someone new joins) — indefinitely
3. **Poor audit clarity** — actions taken by this "guest" user look identical to actions by Cloud Store's own real employees in the logs; there's no clean way to distinguish "our team" from "external partner" activity

---

## The Correct Approach: a Cross-Account Role

> **Cloud Store creates a role trusting Photo Magic's AWS account ID. Photo Magic's own users assume that role temporarily — no new user account ever gets created in Cloud Store's account at all.**

In this pattern, Cloud Store (owning the resource) is the **trusting account**; Photo Magic (borrowing access) is the **trusted account**.

---

## Step 1 — In Cloud Store's Account: Create the Bucket and Role

Create the S3 bucket (e.g. **hd-pictures-01**), upload some sample images.

**IAM → Roles → Create role → Trusted entity: AWS account → Another AWS account** → enter **Photo Magic's 12-digit account ID** → attach **AmazonS3FullAccess** (or a bucket-scoped Customer Managed policy for tighter control) → name it, e.g. **cross-account-access-for-photo-magic** → create.

The resulting **trust policy** now names Photo Magic's account ID as an entity permitted to assume this role. Copy the role's **ARN** — Photo Magic's side needs it next.

---

## Step 2 — In Photo Magic's Account: a User That Can Assume It

Create a user, e.g. **magic-editor** (named so it's clearly identifiable as "the one who touches the cross-account role," since not every Photo Magic employee necessarily should).

Attach an **inline policy** (or Customer Managed) granting **sts:AssumeRole** specifically on the **role ARN copied in Step 1** — this is what actually authorizes magic-editor to attempt the assumption from the Photo Magic side.

---

## Step 3 — Assume It and Test

Log in as **magic-editor** in Photo Magic's account. No S3 access of its own yet.

**Switch role** → enter **Cloud Store's account ID** and the role name (**cross-account-access-for-photo-magic**) → switch.

Now logged in "as" that assumed role: Photo Magic's user can browse, download, and (with full access) upload to Cloud Store's **hd-pictures-01** bucket — despite never having had a Cloud Store IAM account at any point. **Switch back**, and that access disappears immediately.

---

## Why This Is the AWS-Recommended Pattern

- **Time-boxed exposure** — the STS token expires (as little as an hour), so a compromised credential has a hard, short shelf life
- **No duplicated user management** — Cloud Store manages exactly **one role**, regardless of how many people at Photo Magic eventually need this access, or how much their staff turns over
- **Scales cleanly** — a third, fourth, fifth partner company needing similar access is just another trusted account ID (or another role), never another manually-provisioned guest user
- **Clean audit trail** — CloudTrail logs the role assumption distinctly, making "an external partner used this specific role" trivially separable from "our own employees did X"

> This exact pattern — one company's role trusting another company's account ID — is the standard, exam-favored answer whenever a scenario describes two separate AWS accounts needing to share access to a resource.
`,
    },
    {
      id: "iam-web-identity-saml",
      title: "IAM Roles – Web Identity & SAML 2.0 Federation",
      shortDesc: "Letting millions of app users or an entire corporate directory assume a role — without ever becoming IAM users",
      visuals: [],
      content: `## Two Federation Use Cases, One Underlying Idea

Both remaining role use cases let someone assume a role **without ever having an IAM user account at all** — by proving their identity through an external **Identity Provider (IdP)** first. They differ in *which* protocol the IdP uses.

> **An Identity Provider lets a user prove their identity using credentials they already have elsewhere** — think "Sign in with Google" on a website that never asked you to create a new password.

---

## Use Case 3 — Web Identity Federation (Consumer Login)

> **Web Identity Federation covers IdPs using OAuth 2.0 and OpenID Connect** — Google, Facebook, Amazon login, and similar consumer-facing social/public identity providers.

- **OAuth 2.0** handles **authorization** — letting an application request an access token to act on a user's behalf
- **OpenID Connect** sits on top of OAuth for **authentication** — proving *who* the user actually is
- Together, they issue a **JWT (JSON Web Token)** after successful login, which the application uses going forward

**Use case:** an app with potentially **millions** of users needs some of them to access an S3 bucket directly (e.g. uploading a profile photo). Creating an IAM user for each of millions of end users is completely impractical — instead, a user logs in via Google, receives a JWT, and **assumes an IAM role** scoped to exactly the narrow permission they need (e.g. read-only on one bucket).

---

## Use Case 4 — SAML 2.0 Federation (Corporate SSO)

> **SAML 2.0 Federation covers enterprise identity providers — most commonly Active Directory Federation Services (AD FS)** — for a company's own workforce, not the general public.

- Uses **XML** assertions to exchange authentication/authorization data — **not** JWT
- Enables true **single sign-on**: an employee logs into their corporate directory **once** and can reach every connected application without re-entering credentials anywhere else

**Use case:** a large organization with tens of thousands of employees already has one centralized Active Directory identity per person. Rather than provisioning a separate IAM user for every employee who might ever touch AWS, employees authenticate against AD, and AD issues a SAML assertion that lets them **assume a role** with whatever AWS permissions their job requires.

---

## Side by Side

| | Web Identity | SAML 2.0 Federation |
|---|---|---|
| **Typical IdP** | Google, Facebook, Amazon login | Active Directory Federation Services |
| **Protocol** | OAuth 2.0 + OpenID Connect | SAML 2.0 |
| **Token format** | **JWT** | **XML** assertion |
| **Audience** | Public/consumer app users (potentially millions) | Corporate workforce (existing centralized directory) |

---

## The Common Flow

1. **User attempts to log in** — via "Sign in with Google" or a corporate SSO portal
2. **Redirect to the IdP** — Google's login page, or the corporate Active Directory login
3. **Credential verification** — the IdP checks the credentials against **its own** user database (AWS never sees or stores the actual password)
4. **Token issued on success** — JWT for OAuth/OIDC, an XML assertion for SAML
5. **The application uses that token to assume an IAM role** — and the permissions the user ends up with are exactly whatever policy is attached to **that role**, nothing more

> Two different users authenticating through two different IdPs can be routed to assume **different** roles — a social-login user might assume a role with read-only bucket access, while a SAML-authenticated corporate user assumes a role with full access — the IdP used and the role assumed are two independently configurable pieces.

---

## Why Both Exist

- **Simplicity** — users get a single, familiar login experience with credentials they already have
- **Security** — AWS credentials are never stored on the client device; only a short-lived token/assertion is exchanged
- **Scalability** — millions of end users, or an entire enterprise directory, are handled without provisioning a single additional IAM user

> No hands-on lab accompanies this topic — building it out fully requires **Amazon Cognito** (covered separately later in the course), which is the AWS service that actually implements this web-identity login flow end to end for application developers.
`,
    },
    {
      id: "iam-custom-trust-policy",
      title: "IAM Roles – Custom Trust Policy",
      shortDesc: "The 5th role option: hand-write exactly who can assume a role and under what conditions",
      visuals: [],
      content: `## Why a 5th Option Exists

The four role types covered so far — AWS Service, AWS Account (same/cross), Web Identity, and SAML 2.0 — each have a **fixed** shape for who's allowed to assume them. An AWS-service role can't be assumed by an external IAM user; a web-identity role can't be assumed by an AWS service, and so on.

> **A Custom Trust Policy lets you hand-craft exactly who can assume a role, and under precisely what conditions** — for scenarios too specific to fit any of the four preset templates.

---

## What "Conditions" Actually Means Here

Beyond just naming *who* can assume a role, a custom trust policy can require:

- **Multi-Factor Authentication** — the assuming principal must have MFA enabled and active at the moment of assumption
- **A specific time window** — e.g. only during business hours
- **Source IP restriction** — only from a specific IP address or CIDR range
- **Identity attributes** — e.g. only if the authenticated user's email domain, department, or group membership matches a specific value (relevant when combined with Web Identity or SAML federation)

---

## Worked Examples

**Cross-account access with a condition:** allow another AWS account's user to assume a role — **but only if** they've authenticated with MFA, **and only if** the request arrives within a defined time window. Neither the plain "AWS Account" role type nor a bare trust relationship can express this extra conditional layer — a custom trust policy can.

**Federated access with attribute-based conditions:** for a Web Identity or SAML-federated role, restrict assumption further based on identity attributes carried in the token/assertion — e.g. only users whose corporate group membership is "Sales," or whose email domain matches the company's own domain.

**Source-IP-restricted role assumption:** for a role granting access to particularly sensitive resources, restrict assumption to requests originating from a specific, known IP range — e.g. only from the corporate office's public IP block.

---

## Where It Lives

**IAM → Roles → Create role → Custom trust policy** — written directly as JSON, with full control over the principal(s) allowed and any **Condition** block layered on top. The same visual building blocks from the four preset role types (assume-role-with-SAML, assume-role-with-web-identity, assume-role for a user) are all still available here — a custom trust policy is really "the same underlying mechanism, but you write the JSON policy directly instead of picking a preset."

> No hands-on lab is included here — the syntax is the same JSON-policy skill already covered across the earlier IAM policy and role topics; what's genuinely new is the **concept** that trust policies support arbitrary conditions, not a new mechanical skill to practice. This is explicitly the kind of topic tested by concept in the exam, not by requiring you to have built one yourself.
`,
    },
    {
      id: "iam-root-mfa-lab",
      title: "Lab – Enabling MFA on the Root User",
      shortDesc: "The single most important thing to do to an AWS account — step by step with an authenticator app",
      visuals: ["RootBestPractices"],
      content: `## Why This Is Non-Negotiable

The root user has **unrestricted** access to everything in the account — every service, all billing, the ability to close the account entirely. A password alone protecting that much power is not enough.

> **There are 5 root user best practices.** This topic covers the first and most important: **enable Multi-Factor Authentication**. Not enabling MFA on root is explicitly a violation of AWS best practice, and it's the security recommendation AWS surfaces most prominently on the IAM dashboard.

**MFA adds a second verification factor beyond the password** — so a stolen or guessed password on its own still cannot get anyone into the account.

---

## Step 1 — Find the MFA Setting

Two routes to the same place:

- **IAM dashboard** → the "Add MFA for root user" **security recommendation** banner (shown when root MFA isn't yet enabled), or
- **Account name (top right) → Security credentials → Multi-factor authentication (MFA)**

> ⚠️ Enabling MFA from **this** page applies it to the **root user** specifically — distinct from enabling MFA on an individual IAM user, which is done from that user's own Security credentials tab.

Click **Assign MFA device** and give it a name (e.g. **my-MFA**).

---

## Step 2 — Choose the Device Type

Three options:

| Type | What it is |
|---|---|
| **Authenticator app** | A free app on your phone (Google Authenticator or similar) — no extra hardware needed |
| **Security key** | A physical hardware key (e.g. FIDO/U2F) |
| **Hardware TOTP token** | A dedicated physical token device, purchasable separately |

This lab uses the **authenticator app** — install Google Authenticator (available on Android and iOS) on your phone first, then click **Next**.

---

## Step 3 — Pair the Device

Click **Show QR code** in the AWS console. In the authenticator app: **Add code → Scan a QR code** → scan the code on screen.

The app immediately begins generating rotating 6-digit codes for this account.

> ⚠️ **AWS requires TWO consecutive codes to confirm the pairing** — enter the code currently shown, wait for it to roll over (about a minute), then enter the **next** one. This proves the device is genuinely synced and generating valid codes over time, not just a one-off match.

Click **Add MFA**.

---

## Step 4 — Verify It Actually Works

Sign out of the console entirely, then sign back in as root.

After entering the email and password, AWS now prompts for the **MFA code**. Open the authenticator app, read the current code, enter it — and only then does login succeed.

> That extra prompt is the whole point: even someone who has fully compromised the root password is stopped here without physical access to the paired device.

---

## Removing It (If Ever Needed)

**Security credentials → MFA → select the device → Remove.** Available if a device is lost or being replaced — but there is no good reason to leave root without MFA in normal operation.

---

## The Other 4 Practices

MFA is practice **#1** of 5. The remaining four — **never using root for daily work**, **deleting/rotating root access keys**, **securing the root email address**, and **using an account alias** — are covered in the next two topics.
`,
    },
    {
      id: "iam-never-use-root",
      title: "Root User – The 9 Tasks Only Root Can Do",
      shortDesc: "Everything else belongs to an admin IAM user — and the exact list AWS tests you on",
      visuals: [],
      content: `## Best Practice #2: Never Use Root for Everyday Tasks

Root has unrestricted access, which makes using it for routine administration genuinely dangerous — one mistake, or one compromised session, affects everything with no guardrail whatsoever.

> **But some tasks genuinely cannot be done by anything except the root user.** Knowing exactly which ones is a frequently-tested exam point — everything *not* on this list should be done by an IAM user instead.

---

## The Tasks That Require Root

1. **Change account settings** — e.g. the account's email address or the root password itself
2. **Close the AWS account** entirely
3. **Restore IAM user permissions** — if an IAM user has been fully denied access (locked out by policy), only root can restore it
4. **Configure AWS Shield Advanced** — the paid DDoS protection tier
5. **Configure alternate account contacts** — the alternative billing, operations, and security contacts
6. **Certain billing functions** — while an IAM user *can* be granted general billing access, **updating the payment method** specifically is root-only
7. **Sign up for or cancel an AWS Support plan** — and transferring a support plan between tiers
8. **Request a service limit increase**
9. **Sign up for AWS GovCloud** (the US government cloud regions)

> **Everything outside this list — launching instances, managing VPCs, creating buckets, all normal day-to-day operations — should be done through an IAM user, never root.**

---

## The Fix: Create an Admin IAM User

For a single standalone AWS account, the standard approach is one dedicated administrative IAM user for daily work:

**IAM → Users → Create user** → name it **admin** → enable **console access** → set a password → **Attach policies directly → AdministratorAccess** (an AWS Managed policy granting broad administrative permission).

---

## Verify It Covers Daily Work

Log in as **admin** using the IAM sign-in URL. Normal administrative work all functions correctly — viewing EC2 instances, launching them, even terminating them.

> This admin user handles essentially everything routine. It **cannot** perform the 9 root-only tasks above — which is exactly the intended boundary. Root stays locked away with MFA enabled, used only for those specific nine situations, while all real work happens through an account that can be audited, restricted, or revoked if something goes wrong.
`,
    },
    {
      id: "iam-root-security",
      title: "Root User – Access Keys, Email & Account Alias",
      shortDesc: "Best practices 3, 4, and 5 — the ones most often left undone",
      visuals: [],
      content: `## Best Practice #3: Delete or Rotate Root Access Keys

Console login uses email + password. But **access keys** exist for programmatic and CLI access — and root can have them too.

> ⚠️ **Root access keys are especially dangerous**: they grant unrestricted, programmatic access to the entire account, with no MFA prompt standing in the way (MFA protects console login, not API calls made with an access key).

**Where to check:** **Account name → Security credentials → Access keys.**

> **AWS allows a maximum of 2 active access keys** on the root user. If any exist and aren't genuinely needed, the correct action is: **deactivate first, then delete**. Ideally root has **zero** access keys at all.

**"Rotating"** means deleting the old key and creating a fresh one — the practice for cases where a root key genuinely must exist and can't simply be removed. **Prefer IAM roles and IAM users over root access keys for any API access.**

> Same rule as everywhere else with credentials: the **secret** access key is shown exactly once at creation. Download it then, or lose it permanently.

---

## Best Practice #4: Secure the Root Email Address

The email address on the account **is** the root user's username — and it's also the address AWS sends password-reset links to.

> ⚠️ **Anyone who controls that email inbox can reset the root password and take over the entire AWS account.** Securing the account is meaningless if the email address behind it is weakly protected.

Practical implications: the root email should itself have a strong password and MFA, should ideally be a **dedicated** address (not a personal inbox or one individual's work address that disappears when they leave), and access to it should be tightly limited.

**Where it lives:** **Account name → Account → Edit** (re-authentication is required to change it).

---

## Best Practice #5: Use an Account Alias

By default, the IAM user sign-in URL contains the account's raw **12-digit account ID**.

> An account alias is a unique identifier that **replaces the account ID** in that sign-in URL — so the URL becomes a readable company name instead of exposing the numeric account ID to everyone who receives it.

**IAM → Dashboard → Account Alias → Create.** Delete the alias, and the sign-in URL immediately reverts to showing the 12-digit ID again — a quick way to see exactly what the alias is hiding.

> Account IDs aren't secret in the cryptographic sense, but they are an identifier worth not broadcasting unnecessarily — particularly since sign-in URLs get shared with every new employee, contractor, and partner who needs console access.

---

## All 5 Root Best Practices Together

| # | Practice |
|---|---|
| **1** | **Enable MFA** on the root user |
| **2** | **Never use root for everyday tasks** — use an admin IAM user, reserve root for the 9 root-only tasks |
| **3** | **Delete or rotate root access keys** — ideally root has none at all |
| **4** | **Secure the root email address** — it can reset the root password |
| **5** | **Use an account alias** — keep the 12-digit account ID out of shared sign-in URLs |

> These five together are what "securing the root user" actually means in practice, and they come up repeatedly in exam scenarios framed as "which of the following is a best practice for the AWS account root user?"
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
