// AWS services data — add new topics here as you upload notes
// Each category has an icon (emoji or name) and a list of topics
// Each topic has: id, title, shortDesc, content (markdown-style string)

export const awsCategories = [
  {
    id: "compute",
    label: "Compute",
    icon: "⚙️",
    color: "#FF9900",
    topics: [
      {
        id: "ec2",
        title: "EC2 – Elastic Compute Cloud",
        shortDesc: "Virtual servers in the cloud",
        visuals: ["VirtualizationDiagram", "ServerTypesCards", "HostGuestExplainer", "AMIFlowDiagram", "InstanceTypeExplorer", "MultiAZDiagram", "EC2LaunchSteps", "ElasticIPDiagram", "SecurityGroupSimulator", "StatefulExplainer", "UserDataDemo", "InstanceProtectionDemo", "PlacementGroupVisual", "TenancyComparison"],
        content: `## EC2 – Elastic Compute Cloud

EC2 stands for **Elastic Compute Cloud**. Using this platform you can create and manage **virtual machines** (called EC2 instances) in the AWS cloud.

> The name pattern: **E**lastic **C**ompute **C**loud → EC**2** (two C's). Same logic: **S**imple **S**torage **S**ervice → **S3** (three S's).

EC2 is one of AWS's most fundamental services. It lives under the **Compute** category in the AWS console alongside ECS, Lambda, Batch, and others.

---

## What is a Virtual Machine?

Before EC2 makes sense, you need to understand virtualisation.

### Physical Servers

In the real world, companies buy physical servers in three main form factors:

- **Tower Server** — Stands upright like a desktop. Good for small businesses.
- **Rack Server** — Slides into a rack. Used when you have 50–100 servers.
- **Blade Server** — Ultra-dense blades in a chassis. Used for thousands of servers (what AWS uses).

These servers have very high capacity — e.g. 16-core CPU, 128 GB RAM. But before virtualisation, you could only install **one operating system** per physical machine. That means all that capacity was mostly wasted.

### Virtualisation

VMware solved this problem by introducing the concept of **virtualisation** for enterprise systems (IBM originally invented it for mainframes).

Using virtualisation, you can run **multiple operating systems simultaneously** on a single physical machine.

The key technology is the **hypervisor**:

| Company | Hypervisor Name |
|---------|----------------|
| VMware  | ESXi           |
| Microsoft | Hyper-V      |
| AWS     | Xen + Nitro    |

The hypervisor sits between the hardware and the operating systems, sharing CPU, RAM, and storage between multiple VMs securely.

### Host and Guest

- **Host** — The physical machine. Managed entirely by AWS. You never interact with it.
- **Guest** — Each virtual machine running inside the host. This is your EC2 instance.

One host can run many guests simultaneously. Each guest is completely isolated from the others — 100% secure.

---

## EC2 and the Shared Responsibility Model

When you use EC2, responsibilities are split:

**AWS manages:** Physical hardware, hypervisor, data centre security, network infrastructure.

**You manage:** The EC2 instance (Guest OS), applications installed, security groups, IAM roles, data inside the VM.

---

## Amazon Machine Image (AMI)

An **AMI** is a pre-configured template used to launch an EC2 instance. Instead of downloading an ISO and installing an OS manually, you pick an AMI and your instance boots in minutes.

An AMI contains:
- The **operating system** (Windows, Amazon Linux, Ubuntu, Red Hat, macOS…)
- Optional **pre-installed software** (e.g. Windows + SQL Server)
- Storage layout and configuration

### Free Tier Tip
Always look for the **"Free Tier Eligible"** tag when selecting an AMI during labs. AMIs with pre-installed software (like SQL Server) are charged extra.

### AMI Key Details

| Field | Meaning |
|-------|---------|
| Owner | Amazon (for AWS Linux), Microsoft (for Windows), community |
| Architecture | x86_64 (Intel/AMD) or ARM64 (Graviton/Apple M-series) |
| Root Device Type | EBS (persistent) or Instance Store (ephemeral) |
| Virtualization | HVM (Hardware Virtual Machine) — standard today |

### 4 Use Cases of AMI

1. **Rapid Deployment** — Launch an OS in minutes, no ISO or manual install needed.
2. **Auto Scaling** — When traffic spikes, Auto Scaling creates new instances from your custom AMI — pre-configured with your app.
3. **Environment Cloning** — Package 10–20 configured instances as one AMI and replicate the entire environment anywhere.
4. **Disaster Recovery** — Copy your AMI to another region. If your primary region fails, launch the standby from the same AMI.

---

## Instance Types

EC2 offers many instance types to match different workloads. The naming pattern is:

\`\`\`
t3.xlarge
│ │  └── Size: nano, micro, small, medium, large, xlarge, 2xlarge, 4xlarge...
│ └──── Generation: 3 (newer is better, e.g. t3 > t2)
└────── Family: T = general purpose
\`\`\`

Each size up **doubles** vCPU and RAM — and doubles the price.

### Key Families

| Family | Meaning | Use Case |
|--------|---------|----------|
| **T** | General purpose (burstable) | Learning, dev, small apps |
| **M** | General purpose (standard) | Production web/app servers |
| **C** | Compute optimised | High CPU — video encoding, gaming |
| **R** | Memory optimised | In-memory DB (Redis), real-time analytics |
| **I** | Storage (high IOPS) | NoSQL databases, Elasticsearch |
| **D** | Dense storage | Hadoop, data lakes |
| **G** | GPU (graphics) | ML training, 3D rendering |
| **P** | GPU (ML/HPC) | Deep learning, TensorFlow |
| **X** | Extreme memory | SAP HANA, massive in-memory |
| **Z** | Extreme CPU + memory | EDA, financial simulations |
| **A** | ARM (Graviton) | Web servers, containers — best price/perf |
| **U** | Bare metal | No hypervisor — VMware, direct hardware |

> **Free Tier for labs:** Always use **t2.micro** (1 vCPU, 1 GB RAM) — it's free for 750 hours/month.

### Nitro System

Modern EC2 instances use AWS's **Nitro hypervisor**. Unlike traditional hypervisors where the VM must go through the hypervisor to access hardware, Nitro instances can **bypass the hypervisor and access hardware directly** — delivering near bare-metal performance.

---

## Availability Zones Strategy (Multi-AZ)

When you create an EC2 instance, you choose which **Availability Zone (AZ)** to place it in. Each region has multiple AZs connected via high-speed fibre within a 100 km radius.

### Strategy Guide

**Non-critical app (can tolerate downtime):**
→ Single AZ is fine. Manually recover in another AZ if the first fails.

**Critical app (zero downtime allowed):**
→ Deploy identical instances in **2+ Availability Zones**. If one AZ fails, the other keeps serving users.
→ This is called **Multi-AZ** — AWS best practice for all production workloads.

**Costs of Multi-AZ:**
- Yes, you pay for every running instance, including the standby.
- This is the same in on-premises too — a standby server still costs money.

**Probability of failure:**
- Single AZ failing: ~0.01% chance
- Two AZs failing simultaneously: ~0.00001% chance

**Real example:** Microsoft Active Directory (Domain Controller) — always deploy at least 2 DCs in different AZs. If both are in the same AZ and that AZ goes down, no one can log in.

---

## Creating Your First EC2 Instance — Step by Step

### Windows Instance
1. Go to EC2 → **Launch Instance**
2. Name: \`my-windows-server\`
3. AMI: **Windows Server 2019 Base** (Free Tier Eligible)
4. Instance type: **t2.micro**
5. Key pair: Create new → RSA → **.pem** file → Save to Downloads
6. Network: Select AZ (e.g. ap-south-1a), enable **Auto-assign Public IP**
7. Security group: **RDP (port 3389)** is auto-allowed for Windows
8. Storage: 30 GB root volume (OS installs here)
9. Click **Launch Instance**

**To connect:**
- Wait for Status Check **2/2**
- Select instance → Connect → RDP Client → Download RDP file
- Use **Get Password** with your .pem key to get the login password
- Username: **Administrator**

**Pro tip:** Change the Administrator password in Server Manager → Computer Management → Local Users after first login — so you don't need to decrypt it every time.

### Linux Instance (Windows 10/11)
1. Same steps as above
2. AMI: **Amazon Linux 2** (Free Tier Eligible)
3. Key pair: RSA or Ed25519 → **.pem** file
4. Security group: **SSH (port 22)** is auto-allowed for Linux
5. Storage: 8 GB root volume

**To connect:**
\`\`\`bash
cd ~/Downloads
ssh -i cloud-fox-linux-key.pem ec2-user@<your-public-ip>
\`\`\`
Username depends on the AMI:
- **Amazon Linux** → \`ec2-user\`
- **Ubuntu** → \`ubuntu\`
- **Red Hat** → \`ec2-user\`

### Linux Instance (Windows 7/8 — PuTTY)
1. Key pair format: **.ppk** (not .pem) — required by PuTTY
2. Download and install PuTTY (always use the latest version)
3. Open PuTTY → paste Public IP → SSH → Auth → Browse to your .ppk file
4. Click Open → login as: **ec2-user**

---

## Instance Lifecycle

| State | Meaning |
|-------|---------|
| **Pending** | Being created |
| **Running** | Active — you are billed |
| **Stopped** | Powered off — no compute billing, storage billed |
| **Rebooted** | Restarting |
| **Terminated** | Permanently deleted — cannot recover |

> ⚠️ **After every lab session — ALWAYS TERMINATE your instances** to avoid unexpected charges. Stopped ≠ Terminated.

---

## Elastic IP

Every EC2 instance gets a **public IP** when launched. But this IP is **dynamic** — it changes every time you stop and restart the instance.

> Stop → Start → New IP every single time.

This is a problem when you've pointed a DNS record at your instance's IP, or your clients have whitelisted that specific IP.

### What is Elastic IP?

An **Elastic IP** is a **static, persistent public IPv4 address** that you own in your AWS account. Attach it to an EC2 instance — and no matter how many times you stop and start that instance, the IP never changes.

> Elastic IP = public IP + it stays yours + costs money

### Why does it cost money?

When your EC2 instance is **stopped**, you're not paying for compute. But AWS still has to pay the Internet Authority for reserving that IP address. So they pass that cost on to you.

| State | Elastic IP Cost |
|-------|----------------|
| Attached to a **running** instance | **Free** |
| Attached to a **stopped** instance | **Charged** |
| Allocated but **not attached** to anything | **Charged** |

### How to use Elastic IP

1. EC2 Dashboard → **Elastic IPs** → **Allocate Elastic IP**
2. Select your region → click **Allocate** — you now own this IP
3. Select the IP → **Actions → Associate Elastic IP**
4. Choose Instance or Network Interface, select your EC2 → **Associate**

Now your instance's public IP is the Elastic IP — it won't change on restart.

### How to release (avoid charges)

If you no longer need an Elastic IP:
1. **Disassociate** it first: Actions → Disassociate Elastic IP
2. Then **Release** it: Actions → Release Elastic IP

> If you forget to release after terminating your instance, you'll be charged indefinitely for an idle IP.

---

## Security Groups

A **Security Group** is a virtual firewall attached to an EC2 instance's network interface card (NIC). It controls **inbound** (incoming) and **outbound** (outgoing) traffic. You cannot create an EC2 instance without one.

### Default Behaviours

| Scenario | Inbound | Outbound |
|----------|---------|----------|
| New security group (created standalone) | **None** — all blocked | **All traffic allowed** |
| Default VPC security group | **All traffic allowed** | **All traffic allowed** |
| New Windows EC2 instance | **RDP port 3389** auto-added | **All traffic allowed** |
| New Linux EC2 instance | **SSH port 22** auto-added | **All traffic allowed** |

> You **cannot delete** the default security group.

### How Rules Work

Security groups are **allow-only** — there are no explicit deny rules. Whatever you don't allow is automatically blocked.

**Example:** Allow TCP port 80 inbound. Port 80 traffic → allowed. Port 21 (FTP) → silently blocked.

### Multiple Rules and Instances

- One security group can have **multiple rules** (e.g. ports 80, 443, and 22)
- One EC2 instance can have **multiple security groups** attached
- One security group can protect **multiple EC2 instances** — great for consistent fleet-wide rules

### Common Port Numbers

| Port | Protocol | Use |
|------|----------|-----|
| 22 | SSH | Linux remote access |
| 80 | HTTP | Web traffic |
| 443 | HTTPS | Secure web traffic |
| 3389 | RDP | Windows remote desktop |
| 3306 | MySQL | Database |
| 5432 | PostgreSQL | Database |
| 53 | DNS | Name resolution |

---

## Security Groups are Stateful

**Stateful** means: if you initiate a connection outbound, the response is automatically allowed back in — even if there's no matching inbound rule.

### How it works

You're inside EC2 and browse to an HTTP server at 2.2.2.2:

1. You send: source port 50000 → destination port 80
2. Outbound check: all traffic allowed → **request goes through**
3. Server replies: source port 80 → destination port 50000
4. Inbound check: no rules... but **reply is still allowed**

Why? The security group **tracked the state** of your outbound request and knows this reply belongs to it.

### Stateful vs Stateless

| | Stateful (Security Group) | Stateless (NACL) |
|--|--------------------------|-----------------|
| Tracks connection state? | Yes | No |
| Return traffic needs a rule? | No — auto-allowed | Yes — must add explicit rule |
| AWS service | **Security Group** | **Network ACL (NACL)** |
| Level | Instance level | Subnet level |

> NACLs are stateless and operate at the subnet level — covered in the VPC section.

---

## User Data Script

When you launch an EC2 instance, you can pass a **User Data script** that runs **automatically on first boot**. This lets your instance come up fully configured — no manual SSH required.

### Manual vs Automated

**Manual:** Launch EC2 → SSH in → run commands → done.

**With User Data:** Paste script at launch → instance boots → script runs → done automatically.

### Linux Web Server Example

\`\`\`bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
echo "<h1>Welcome to Cloud Fox Hub</h1>" > /var/www/html/index.html
\`\`\`

Commands explained:
- \`yum update -y\` — update the OS packages
- \`yum install -y httpd\` — install Apache web server
- \`systemctl start httpd\` — start the web service now
- \`systemctl enable httpd\` — auto-start after every reboot
- \`echo ...\` — create a simple homepage

Paste this in **Advanced Details → User Data** when creating the instance. Open the public IP in a browser — your web page is live.

### Windows PowerShell Example

\`\`\`powershell
<powershell>
Install-WindowsFeature -name Web-Server -IncludeManagementTools
</powershell>
\`\`\`

### Why User Data is Critical for Auto Scaling

Auto Scaling creates new EC2 instances automatically when traffic spikes. You can't manually SSH into those. User Data solves this — every new auto-scaled instance configures itself from the script automatically.

> **Tip:** Use ChatGPT to generate scripts. Ask: *"Write a bash script to install Apache on Amazon Linux 2 and display a welcome page."*

---

## Termination Protection and Stop Protection

When you terminate an EC2 instance, it is **gone forever** — no undo, no recovery. Two safety features prevent accidents:

### Termination Protection

Prevents anyone from accidentally terminating the instance.

**Enable at launch:** Advanced Details → Termination Protection → Enable

**Enable after launch:** Select instance → Actions → Instance Settings → Change Termination Protection

With it on, clicking "Terminate Instance" errors:
> *"The instance may not be terminated. Modify its disable API termination attribute and try again."*

You must first **disable** the protection, then terminate.

### Stop Protection

Prevents the instance from being stopped (not just terminated). Useful for Instance Store-backed instances where stopping erases all data.

### Best Practice

| Protection | Prevents | Enable For |
|-----------|---------|-----------|
| Termination Protection | Accidental permanent deletion | All production instances |
| Stop Protection | Accidental power-off | Instance Store AMIs, critical stateful apps |

---

## Placement Groups

By default, AWS decides where inside an Availability Zone to physically place your EC2 instances. **Placement Groups** let you influence that decision based on your workload's needs.

Found at: Launch Instance → **Advanced Details → Placement Group**

There are three strategies:

---

### 1. Cluster Placement Group

All EC2 instances are packed into the **same rack** inside one AZ.

- **Advantage:** Extremely high-speed, low-latency communication between instances (up to 10 Gbps within the rack). Ideal for tightly-coupled workloads.
- **Disadvantage:** If that rack fails, **all** your instances go down together — no high availability.
- **Use cases:** HPC (High Performance Computing), big data clusters, machine learning training jobs, applications that need maximum network throughput between nodes.

> All instances in a Cluster group must be in **one AZ** — you cannot span multiple AZs.

---

### 2. Spread Placement Group

Each EC2 instance is placed on a **different rack** — spreading risk across the hardware.

- **Advantage:** Maximum high availability — if one rack fails, only one instance is affected. Can span multiple AZs.
- **Disadvantage:** Slightly higher latency between instances (traffic hops across racks and network devices).
- **Limit:** Maximum **7 instances per AZ** per placement group. For a 3-AZ region like Mumbai (ap-south-1), that's 21 instances total per group.
- **Use cases:** Critical apps where each instance must be isolated from hardware failures — e.g. web servers, application servers where any single failure must not cascade.

> Need more than 21? Create multiple Spread placement groups.

---

### 3. Partition Placement Group

A **hybrid** of Cluster and Spread. Instances are divided into **partitions** (logical groups), and each partition maps to its own set of racks with isolated power and networking.

- Instances **within the same partition** communicate with cluster-level speed (shared hardware)
- Instances **across partitions** are isolated — a hardware failure in one partition doesn't affect others
- Can span **multiple AZs**
- **Use cases:** Distributed systems like Hadoop, Cassandra, Kafka — where you want node-groups to be fast internally, but separate groups to be fault-isolated.

---

### Placement Group Rules & Limits

| Rule | Detail |
|------|--------|
| Name must be **unique** | Per region, per AWS account |
| Cannot **merge** groups | Once created, placement groups are independent |
| One instance = one group | An instance can only belong to one placement group |
| Cannot use Dedicated Hosts | Placement groups don't support dedicated host tenancy |

---

## Tenancy

When you create an EC2 instance, multiple AWS customers' instances may run on the same physical host machine. **Tenancy** lets you control how much isolation you get from other customers' workloads.

Found at: Launch Instance → **Advanced Details → Tenancy**

Three options:

---

### 1. Shared Tenancy (Default)

Your EC2 instance shares the physical host hardware with instances from other AWS customers.

- AWS manages which host your instance lands on
- You have no visibility or control over the host
- **Cheapest option** — no extra charge
- **Use when:** Standard workloads with no regulatory restrictions

---

### 2. Dedicated Instance

Your EC2 instance runs on hardware **dedicated to your account only** — no other AWS customer's instances can land on that host.

- AWS still manages the host (you don't control it)
- Your own multiple instances can share the same dedicated host
- **Costs extra** — premium over shared tenancy
- **Use when:** Government compliance, financial regulations, or security policies require physical isolation from other customers

---

### 3. Dedicated Host

You get an **entire physical server** allocated to your account — and you manage it.

- Full control of the physical server: CPU sockets, cores, host affinity
- **Bring Your Own License (BYOL):** Use existing per-socket or per-core software licenses (Windows Server, SQL Server, Oracle, etc.)
- Most expensive option
- **Use when:** You have existing software licenses that require hardware-bound licensing, or need the deepest level of compliance and control

---

### Tenancy Comparison

| | Shared | Dedicated Instance | Dedicated Host |
|--|--------|-------------------|----------------|
| Physical host shared with others? | Yes | No | No |
| You manage the host? | No | No | Yes |
| BYOL support? | No | No | Yes |
| Cost | Standard | Extra charge | Most expensive |
| Compliance use | General | Regulatory isolation | Full hardware control |
`,
      },
      {
        id: "lambda",
        title: "Lambda – Fundamentals (Part 1)",
        shortDesc: "Serverless compute — run code without managing servers",
        visuals: ["ServerlessFlow3D", "ServerlessSpectrum", "ServerlessTradeoffs", "LambdaVsEC2", "FunctionAnatomy", "AuthoringOptions", "ExecutionRole", "EC2Automation", "LambdaTriggers"],
        content: `## AWS Lambda – Fundamentals (Part 1)

**AWS Lambda** lets you **run code without provisioning servers** — "serverless". With EC2 you'd create a VM, install an OS + runtime, then run code. With Lambda you just upload code as a **function** and AWS runs it. It's **event-driven**: an AWS service **triggers** the function, and you pay only when it runs (**pay-as-you-go** — no triggers, no cost).

> Example: a user uploads an image to **S3** → the upload event triggers a Lambda → the function adds a watermark automatically. Idle days cost nothing.

Lambda supports many languages via **runtimes**: Python, Node.js, Java, .NET, Ruby, Go.

---

## What is Serverless?

Cloud services sit on a spectrum:
- **IaaS (EC2)** — you manage OS, scaling, HA, capacity. Most control, most work.
- **Managed (RDS)** — AWS manages OS + engine; you still size capacity & configure HA.
- **Serverless (Lambda)** — you bring **only code**; AWS handles provisioning, scaling, HA, and maintenance.

**Benefits:** no server management, automatic scaling, cost efficiency, built-in high availability, faster deployment.

**Trade-offs (know for the exam):**
- **Cold starts** — an idle function must provision resources first → slower first run.
- **15-minute max execution** — code running longer **cannot** use Lambda (use EC2). *Common exam trap.*
- **Vendor lock-in** — Lambda-specific code needs changes to move clouds.
- **Less infrastructure control** — you only supply code + pick a runtime.

---

## Lambda vs EC2

Both are **compute** services. Deciders:

| Aspect | EC2 | Lambda |
|---|---|---|
| Model | Provisioned VM | Event-driven function |
| Use case | Long-running, 24×7 | Short tasks, automation |
| Pricing | Per instance (pay even if idle) | Per execution + memory (pay only when run) |
| Scaling | Manual (ASG) | Automatic, instant |
| Startup | Minutes | Milliseconds (cold start if idle) |
| Execution time | Unlimited | **Max 15 min** |
| Customizability | Full OS control | Predefined runtimes |

> 💡 A function that runs 10× today costs 10 runs; 0× tomorrow costs ₹0. An EC2 instance costs the same regardless. **>15-min job → EC2. Bursty/event-driven → Lambda.**

---

## Your First Function

\`\`\`python
def lambda_handler(event, context):
    return "Hello World"
\`\`\`

- **lambda_handler(event, context)** — the entry point Lambda calls on each trigger. \`event\` = trigger input; \`context\` = runtime info.
- **return** — sends a value back as the **response**.
- **print** — writes to **CloudWatch Logs** (not returned to caller).

Workflow: write → **Deploy** → create a **Test event** (JSON passed in as \`event\`) → **Test**.

---

## Ways to Create a Function

- **Author from scratch** — write your own code (pick runtime + architecture).
- **Blueprint** — ready-made sample functions for common cases (e.g. DynamoDB read/write); tweak instead of writing from scratch.
- **Container image** — package as a Docker image (own base OS + runtime), push to **ECR**, run as Lambda.

**Unsupported language?** Two container options:
- **Container Image** — any base OS, runtime bundled in; for ML (TensorFlow), big custom apps.
- **OS-only Runtime** — fixed Amazon Linux base, you install the runtime; e.g. run an unlisted Node.js version.

---

## Execution Role

AWS services are **isolated** — Lambda needs an **IAM execution role** (an identity it assumes) to touch other services.
- Even "Hello World" needs the **basic execution role** (\`AWSLambdaBasicExecutionRole\`) to write to **CloudWatch Logs**.
- To read S3, add S3 permissions; to start EC2, add EC2 permissions; etc.

---

## EC2 Automation with Boto3

**Boto3** is AWS's Python SDK to manage resources from Lambda.

\`\`\`python
import boto3
ec2 = boto3.client('ec2', region_name='ap-south-1')
def lambda_handler(event, context):
    ec2.start_instances(InstanceIds=['i-0abc123'])
    return "Started"
\`\`\`

Prerequisites: an EC2 instance + an IAM role (EC2 access + basic execution). Increase the default **3-second timeout** (e.g. to 10 s) so the instance has time to start.

---

## Triggers

A function does nothing until a **trigger** invokes it (added manually):
- **API Gateway** — exposes an HTTP URL; hitting it (e.g. a webpage button) runs the function.
- **EventBridge** — schedule (cron) or event patterns; e.g. start EC2 at 9 AM, stop at 6 PM.
- **S3** — object events (upload/delete).
- Plus **Alexa, ALB, CodeCommit, DynamoDB Streams, SNS, SQS**, and more.`,
      },
      {
        id: "lambda-2",
        title: "Lambda – Advanced (Part 2)",
        shortDesc: "Execution env, versions, concurrency, layers, VPC",
        visuals: ["ExecutionEnvironment3D", "VersionsAliases", "Concurrency", "ReservedConcurrency", "ProvisionedConcurrency", "LambdaLayers", "LambdaVPC"],
        content: `## Lambda – Advanced (Part 2)

How Lambda actually runs in the background, plus versioning, concurrency, layers and networking.

---

## Execution Environment (Cold vs Warm Start)

Lambda runs code inside **containers** (lightweight VMs). Netflix serves millions of recommendations this way.

- **Cold start** — first request (or a scale-up): Lambda builds a new container → allocates CPU/memory/network → initializes the runtime → loads code + dependencies. Adds **~100–300 ms** of latency.
- **Warm start** — reusing a still-live environment → no setup delay, responds in milliseconds.
- **Scaling** — if all environments are busy, Lambda launches more (1,000 users → 1,000 environments), automatically; idle ones are removed.

**Reduce cold starts** with: **provisioned concurrency**, more **memory/CPU**, or **Lambda layers** (preloaded deps).

---

## Versions & Aliases

- **Publish a version** → an immutable, read-only snapshot (v1, v2, …) for rollback. **$LATEST** stays editable.
- **Alias** → a named pointer (e.g. \`prod\`) to a version. Point your API Gateway URL at the **alias**, so you switch versions **without changing the URL**.
- **Weighted aliases** → split traffic between two versions (e.g. 50/50) for **canary / blue-green** deployments.

---

## Concurrency

**Concurrency** = requests running at the same time. Default limit: **1,000 per region per account**, shared by all functions.

> Formula: **concurrency = requests/sec × duration(sec)**. e.g. 50 req/s × 2 s = 100. Exceed 1,000 → throttling (**"429 TooManyRequests"**).

Handle high demand: request a **higher limit** (support), use **multiple accounts/regions**, or manage concurrency.

---

## Reserved Concurrency

**Guarantees** (and caps) a slice of the limit for a critical function — no extra charge. e.g. reserve **300** of 400 for the **Place-Order** function so Email/Report functions can't starve checkout. The **unreserved** pool can't drop below **100**.

---

## Provisioned Concurrency

Two concurrency types:
- **On-Demand** (default) — environments created when requests arrive → cold-start delay.
- **Provisioned** — N environments **pre-warmed** and kept ready → **zero cold start** for critical apps.

> 📌 Requires a **version or alias** (not $LATEST). Counts against the **1,000** quota. You **pay** per provisioned instance per minute (used or not). Monitor **Throttles** & **ProvisionedConcurrencyUtilization** in CloudWatch.

---

## Lambda Layers

A **library** is reusable code you \`import\`. Some are built into Lambda (\`boto3\`, \`random\`); others aren't (\`emoji\`, \`pandas\`, \`requests\`) → \`ModuleNotFoundError\`. Three ways to provide a non-built-in library:

1. **Built-in** — just import & deploy.
2. **Package with each function** (not recommended) — zip code + library per function; updating the library means re-packaging every function.
3. **Lambda Layer** (smart) — zip the **library only**, upload once as a layer, attach to many functions. Update once → all functions get it. Benefits: **reusability, clean separation, easy maintenance, faster deploys**.

> 🧪 Lab: CloudShell → \`mkdir python && pip install emoji -t .\` → zip the \`python/\` folder → create a **Layer** from the zip → attach to the function → re-test.

---

## VPC Connectivity

By default Lambda runs **outside your VPC** with full internet — reaches public services (S3, DynamoDB) but **not** private resources (RDS, EC2, ElastiCache in private subnets).

- **Connect to a VPC** → AWS creates an **ENI** (Elastic Network Interface) in your private subnet with a private IP. Lambda now reaches private resources — but **loses default internet**.
- Need outbound internet again → add a **NAT Gateway**. Need only private AWS-service access (S3/DynamoDB) without internet → use a **VPC Endpoint**.
- A VPC-attached Lambda needs a **Security Group** on its ENI: **outbound** to reach a DB, **inbound** if EC2 calls the Lambda. *(Exam favorite.)*`,
      },
      {
        id: "ecs-prereq",
        title: "ECS – Prerequisites (Containers & Docker)",
        shortDesc: "VMs vs containers, Docker, orchestration — the foundation for ECS",
        visuals: ["LeoStory", "OSArchitecture", "VMvsContainer3D", "VMLimitations", "DockerLifecycle", "Orchestration", "OrchestratorCompare"],
        content: `## ECS Prerequisites — Containers & Docker

Before ECS (a **container orchestration** service), you must understand containers. We learn through a story: **Leo** (the builder — asks the questions) and **Ray** (the architect — teaches best practices).

---

## The Story (the problem)

Leo hosts his **LMS**, **Support**, and a new **Enrollment** app on **one EC2 instance** to save money. A marketing spike makes the Enrollment app devour all CPU/memory — there's no resource boundary — and the whole instance crashes, taking **all three apps** down. Ray's lesson: **isolate** workloads so one can't kill the others.

> The journey: **physical machines → virtual machines → containers → ECS.**

---

## How an OS Works (foundation)

Every OS has two key parts:
- **Kernel** — the core; the only part that talks **directly to hardware** (CPU, RAM, disk, network).
- **Application Layer** — libraries/APIs apps use to make **system calls**, forwarded to the kernel.

Flow: **Application → Application Layer → Kernel → Hardware**.

---

## Physical → Virtual Machines

A **hypervisor** (VMware ESXi, Hyper-V, AWS Nitro/Xen) installed on physical hardware lets you run **multiple VMs**, each with its **own full OS** (kernel + app layer) and capped resources → **isolation** without buying multiple servers. This **hardware virtualization** birthed the cloud (EC2 is a VM).

---

## VM Limitations → Containers

VMs carry a **full OS** each, causing:
- **Heavy resource use** (OS overhead), **slow boot** (1–2 min), **bulky images** (GBs), **complex management** (patching), **limited density**.

**Containers** (2013) fix this: ship only the **application layer** and **share the host kernel**.

| | Virtual Machine | Container |
|---|---|---|
| Virtualizes | Hardware (full OS each) | OS (shares host kernel) |
| Weight | Heavy | Lightweight |
| Boot | 1–2 minutes | ~1 second |
| Image size | GBs | MBs |
| Isolation | Full | App-layer + resource limits |

---

## Docker

A machine with the **Docker daemon** installed is a **Docker host** (no hypervisor needed). Lifecycle:
1. \`yum install docker\` → host ready
2. \`docker pull ubuntu\` → image from **Docker Hub** (Ubuntu image ~80 MB vs 5.9 GB ISO — no kernel inside)
3. \`docker run -it ubuntu\` → container starts in **~1 second**
4. \`docker build -t myapp .\` → bake your app into a custom image via a **Dockerfile** (e.g. \`FROM nginx\` + \`COPY index.html\`)
5. \`docker run -d -p 80:80 myapp\` → publish a port so it's reachable from outside

> Images push to a registry — **Docker Hub** or AWS's **ECR** — so any host can pull & run them.

---

## Container Orchestration

One Docker host = a **single point of failure**. Use **multiple hosts** — but they don't coordinate by default ("players with no captain"). You need a **container orchestrator** (the captain): it creates a cluster, places containers intelligently, restarts failed ones, and **auto-scales**.

**Three orchestrators:**
- **Docker Swarm** — native, easy, but no auto-scaling/rollback; for small teams/learning.
- **Amazon ECS** — fully managed by AWS, deep integration (ALB, IAM), no control-plane management; **AWS-only**.
- **Kubernetes** — runs anywhere, most powerful (auto-scaling, rollback), open-source; but **complex** to set up.

> Leo picks **ECS** — he's already on AWS (great integration) and his small 3-app startup doesn't need Kubernetes' complexity. *(EKS = AWS-managed Kubernetes — covered after ECS.)*`,
      },
      {
        id: "ecs",
        title: "ECS – Elastic Container Service",
        shortDesc: "Run Docker containers at scale on AWS",
        visuals: ["MonolithVsMicroservices", "ECSBasics", "ECSCluster", "EC2vsFargate", "ClusterInfraSetup", "ECSAnywhere", "ECSStorage", "TaskVsService"],
        content: `## ECS – Elastic Container Service

### Application Architectures (background)

- **Monolithic (tightly coupled)** — one codebase, one deployment, one database. Hard to scale parts independently; one bug can crash everything; single tech stack; hosted on **VMs**. *(Outdated.)*
- **Microservices (loosely coupled)** — independent services, each with its own code, deployment, and database. Used by Netflix, Amazon, Uber.

> **Killer feature — independent scaling:** during a sale, scale **Home** for 100,000 visitors, **Cart** for the ~10% who add items, **Payment** for the ~4% who buy. Each service scales to its own demand. Microservices are hosted in **containers** → ECS / EKS / Kubernetes.

---

## What is ECS?

**Amazon ECS** is a **fully managed container orchestration** service to deploy, manage & scale Docker containers on AWS. Six reasons to choose it over self-managed Kubernetes: **fully managed**, **deep AWS integration** (ALB, IAM, CloudWatch, ECR, CodePipeline), **intelligent scheduling**, **cost efficient**, **secure**, **scalable**.

Use cases: microservices, batch processing, CI/CD, monolith → container migration.

---

## ECS Cluster

A **cluster** = a group of Docker hosts acting as one unified environment. ECS schedules containers across them and **pools their resources** (e.g. 3 × 4 vCPU = 12 vCPU). It's the **first thing you create**. Members of a cluster work as a team — coordinated scheduling, failover, and resource pooling.

---

## Launch Types: EC2 vs Fargate

| Aspect | EC2 (self-managed) | Fargate (serverless) |
|---|---|---|
| Provisioning | You launch & manage instances | AWS provisions automatically |
| Control | Full (OS, type, AMI, storage) | None |
| Billing | Per EC2 uptime | Per vCPU + memory/sec per task |
| Scaling | Scale EC2 first, then tasks | Scale tasks directly |
| Maintenance | You patch | Fully managed |
| Isolation | Tasks share an instance | Each task isolated (own ENI) |
| Best for | OS access, GPU, long-running | Serverless microservices, batch, fast scale |

> VPC/subnet/SG is chosen at **cluster creation** for EC2, but at **task/service creation** for Fargate.

---

## Cluster Setup (Fargate, Spot & EC2)

- From the **console**, every cluster auto-includes **Fargate + Fargate Spot** (even if deselected — no charge until you run tasks). **Fargate Spot** = ~70% cheaper spare capacity, can be interrupted → batch/dev/fault-tolerant work.
- **Add EC2 three ways:**
  1. **During creation** (recommended if planned) — AWS auto-builds an ASG + launch template with **ECS-optimized AMIs**.
  2. **Manually after** — launch an ECS-optimized AMI, attach **ecsInstanceRole**, set \`ECS_CLUSTER=name\` in \`/etc/ecs/ecs.config\`, restart the agent. *(Single point of failure.)*
  3. **Own ASG + Capacity Provider** — launch template (ECS-optimized AMI + role + user-data) → create ASG → **register it as a Capacity Provider** so **ECS manages scaling/draining/placement**.

> **ECS-optimized AMI** = ECS agent + container runtime pre-installed. **ecsInstanceRole** lets an instance register with ECS.

---

## ECS Anywhere

Run ECS tasks on **external machines** (on-prem or other clouds), managed from ECS. Setup (after cluster creation): **outbound internet** → install **container runtime** → install **SSM agent** (hybrid activation + IAM role) → install **ECS agent** → the machine joins the cluster like a normal instance.

---

## Storage & Encryption

Cluster-level **KMS encryption** must be enabled **at creation** (can't add later).
- **Fargate Ephemeral Storage** — temporary disk, exists only while the task runs; default **20 GB** (up to 200 GB); vanishes when the task stops. For temp files, cache, short-lived logs.
- **Managed Storage (EFS / EBS)** — **persistent**, supported by **both** Fargate & EC2. EFS encrypted by default. For databases, uploads, config.

---

## Task vs Service

A **task** = a running unit of one or more containers, with its own **ENI, IAM role & security group** (things a bare Docker container can't have — enabling S3 access, fixed IP, etc.).

| Aspect | Task | Service |
|---|---|---|
| Restart | Runs once, no auto-restart | Auto-restarts failed tasks |
| Use case | One-time / temporary | Long-running production |
| Auto-scaling | ❌ | ✅ |
| Load balancer | ❌ | ✅ |
| Example | Testing, batch/report | Web server, API 24×7 |

> Both need a **task definition** (blueprint: image(s), CPU/memory, ports, IAM role, networking). Flow: **Cluster + Docker image → Task Definition → Task / Service**.`,
      },
      {
        id: "eks",
        title: "EKS – Elastic Kubernetes Service",
        shortDesc: "Managed Kubernetes on AWS",
        visuals: ["WhyEKS", "K8sArchitecture", "K8sClusterServices", "EKSClusterModes", "NodeGroups", "EKSRoles", "ManageCluster"],
        content: `## EKS – Elastic Kubernetes Service

### Why EKS?

Container orchestrators manage containers in bulk. Options: **Docker Swarm** (simple, unpopular), **Apache Mesos** (outdated), **ECS** (excellent but AWS-native only), **Kubernetes** (the #1 open-source standard — runs anywhere, but complex to self-manage).

**EKS = Kubernetes as a managed AWS service** — you get all of Kubernetes; AWS handles the hard setup, patching & control plane.

> 🔑 Main reason to choose EKS: **hybrid cloud**. Run Kubernetes on-prem AND in AWS with the **same** tooling/skills, instead of juggling Kubernetes on-prem and ECS in the cloud.

---

## Kubernetes Architecture (On-Prem vs EKS)

- **Control Plane** (the brain) — API Server, Scheduler, Controller Manager, etcd. *On-prem:* you install/run/patch it all. *EKS:* AWS runs it — multi-AZ, secure, auto-scaled.
- **Worker Nodes** (run your containers) — kubelet, kube-proxy, runtime. *On-prem:* you manage servers. *EKS:* EC2 node groups or serverless Fargate; scaling via AWS Auto Scaling.
- **Pods & Containers** (smallest unit, like an ECS task) — created with kubectl, run on worker nodes. *EKS:* you focus on pods; AWS handles infra.

**Cluster services** also integrate natively in EKS: **VPC CNI** (each pod gets a VPC IP + SG/NACL), **LoadBalancer** service auto-creates an ALB/NLB, **IAM/IRSA + KMS** for security, **CloudWatch/Container Insights/X-ray** for monitoring.

---

## Cluster Creation Modes

**EKS Auto Mode** lets AWS manage worker nodes, networking, scaling & patching (not just the control plane).
- **Quick + Auto Mode** — fastest; Auto Mode always on (can't disable); accept all AWS defaults. You give only name, VPC, IAM role.
- **Custom + Auto Mode** — automation **and** control: customize upgrade policy, **compute class** (general/system), cluster access, customer KMS key, ARC zonal shift, deletion protection, endpoint access, monitoring, add-ons.
- **Classic Mode (Auto off)** — AWS manages only the control plane; **you manage worker nodes via node groups**. Max control; required for Fargate & full manual setups.

---

## Node Groups & Nodes (Classic Mode)

A **node group** = a set of worker nodes sharing config (each runs the kubelet). Node types: **EC2** (full control — GPU/memory/storage) or **Fargate** (serverless, **classic-mode only**).

| Aspect | Managed Node Group | Self-Managed |
|---|---|---|
| EC2 management | AWS | You |
| Updates & scaling | Automatic | Manual |
| Node registration | Automatic | Manual (script) |
| Control | Less | Full |

> ⚠️ **Managed node group ≠ Auto Mode.** Managed node groups (classic mode) still let you pick type/size/scaling. In **Auto Mode** node groups are invisible — AWS manages everything via a built-in node pool.

---

## EKS IAM Roles

Create **before** cluster creation (or it fails):
- **Cluster role** — lets the EKS control plane manage AWS resources (EC2, networking, load balancers) on your behalf. Required in all modes.
- **Node role (EC2) / Fargate Pod Execution role** — lets nodes/pods register with the control plane, pull images from **ECR**, send logs to CloudWatch, access S3/DynamoDB.

> ✅ Use the console's **"Create recommended role"** — it auto-attaches the minimum required policies.

---

## Managing the Cluster

- **AWS Console** — cluster settings only (status, IAM access, add-ons, node groups, networking, monitoring). It **can't** create pods/deployments, apply YAML, exec, view logs, or scale apps — it doesn't talk to the Kubernetes API server.
- **kubectl** — the real Kubernetes control tool; talks directly to the API server. Install on your **local PC** (needs public/public+private endpoint) or on an **EC2 in the same VPC** (reaches private endpoints).

**kubectl on EC2 (lab):** launch EC2 in the same VPC → \`aws configure\` → install kubectl (curl binary, chmod, move to /usr/local/bin) → \`aws eks update-kubeconfig --name <cluster> --region <region>\` → verify with \`kubectl cluster-info\`, \`get ns\`, \`get pods\`. *(\`get nodes\` is empty in Auto Mode — normal.)*`,
      },
      {
        id: "elastic-beanstalk",
        title: "Elastic Beanstalk",
        shortDesc: "PaaS — deploy apps without managing infrastructure",
        content: `## Elastic Beanstalk

**Elastic Beanstalk** is a **PaaS** that deploys & manages your web app without you managing the infrastructure. You upload code (or a Docker image); Beanstalk provisions the **EC2, Auto Scaling, Load Balancer, security groups & health monitoring** for you.

- Supports **Java, .NET, Node.js, Python, PHP, Ruby, Go, Docker**.
- You keep **full control** of the underlying resources (unlike fully serverless).
- **Free** — you only pay for the resources it creates.
- Deployment options: **All-at-once, Rolling, Rolling with additional batch, Immutable, Blue/Green**.

> Exam: "deploy a web app quickly **without managing infrastructure**, but keep control of the EC2 layer" → **Elastic Beanstalk**.`,
      },
      {
        id: "lightsail",
        title: "Lightsail",
        shortDesc: "Simple virtual private servers",
        content: `## Lightsail

**Amazon Lightsail** is the **simplest** way to launch a virtual server, with **predictable flat monthly pricing**. It bundles compute, storage, networking, a static IP, DNS and snapshots into easy plans.

- Pre-built blueprints: **WordPress, LAMP, Node.js, plain Linux/Windows**, databases, containers.
- Great for **small websites, blogs, dev/test, simple apps** and people new to AWS.
- Limited integration with the broader AWS ecosystem (by design — simplicity over flexibility).

> Exam: "**simple, low-cost, fixed-price** server for a small project / beginner" → **Lightsail**. Need full control/scale → EC2.`,
      },
      {
        id: "batch",
        title: "AWS Batch",
        shortDesc: "Fully managed batch computing workloads",
        content: `## AWS Batch

**AWS Batch** runs **batch computing jobs** at any scale — it dynamically provisions the right amount/type of compute (EC2 or Fargate, including **Spot**) based on the jobs in the queue.

- You define **job definitions**, submit jobs to **job queues**, and Batch schedules them onto **compute environments**.
- No cluster to manage; scales to thousands of jobs.
- Ideal for **scientific simulation, media/image processing, ETL, financial modelling** — long-running, parallel workloads.

> Batch (managed job scheduler) vs Lambda (15-min limit, event-driven). Heavy/long batch jobs → **AWS Batch**.`,
      },
      {
        id: "auto-scaling",
        title: "Auto Scaling",
        shortDesc: "Automatically add/remove EC2 instances to match demand",
        visuals: ["ScalingTypes", "ASGLaunchTemplate", "CapacityControls", "ScalingOptions", "DynamicScalingSim", "MaintenancePolicy", "TerminationPolicy", "ScalingTimers"],
        content: `## Auto Scaling

**Auto Scaling** automatically adjusts the number of EC2 instances to match demand — adding servers when traffic spikes and removing them when it drops. Think of an e-commerce sale (Amazon Great Indian Sale, Flipkart Big Billion Days): traffic surges, then settles.

---

## Scaling Fundamentals

**Scaling** = adjusting compute capacity to meet changing demand. Two kinds:

| | Vertical Scaling | Horizontal Scaling |
|--|------------------|--------------------|
| What changes | Make **one server bigger** (more CPU/RAM) | Add/remove **whole servers** |
| Terms | **scale up** / **scale down** | **scale out** / **scale in** |
| Limit | Hits a hardware ceiling (bottleneck) | Virtually unlimited |
| AWS Auto Scaling | ❌ Not supported | ✅ **This is what it does** |

> AWS Auto Scaling is **horizontal** — it adds/removes EC2 instances, giving better fault tolerance and availability.

---

## The Two Building Blocks

### Launch Template
A **blueprint** for each instance Auto Scaling creates: AMI (OS), instance type (e.g. t2.micro), key pair, security group, EBS volume, and a **user-data script** (e.g. to auto-install a web server). Standardises every instance.

### Auto Scaling Group (ASG)
Manages a fleet of instances **as one unit**, spread across Availability Zones. It uses the launch template to spin up identical servers and enforces your capacity settings.

---

## Capacity: Min / Desired / Max

| Setting | Meaning |
|---------|---------|
| **Desired** | How many instances you want right now |
| **Minimum** | The floor Auto Scaling always maintains — terminate an instance and it's **recreated** (fault tolerance) |
| **Maximum** | The ceiling — desired can never exceed it |

> **Manual scaling** = you change desired yourself. Setting it below current count → **scale in** (instances terminated); above → **scale out** (instances launched).
>
> ⚠️ Terminating instances individually won't get rid of them — the ASG recreates up to *minimum*. To remove everything, **delete the Auto Scaling Group**.

---

## The 4 Scaling Options

### 1. Manual Scaling
You set min/desired/max by hand. Best for **infrequent, known events** (e.g. a game release at a fixed time).

### 2. Scheduled Scaling
Scale at a **known date/time**. For predictable recurring patterns — weekends, end-of-month/quarter, a sale with fixed dates. (e.g. Fri 6pm → desired 4; Mon 9am → desired 1.)

### 3. Dynamic Scaling (Reactive)
React to **live CloudWatch metrics** — handles sudden, uncertain spikes. Three policy types:
- **Simple** — one threshold (e.g. CPU 50–60% → add 1)
- **Step** — multiple thresholds → different amounts (50–60% → +1, 60–70% → +2)
- **Target Tracking** — set a target (e.g. 60% CPU) and AWS **self-optimises** how many to add/remove ⭐ recommended

Metrics: average CPU, network in/out, or ALB request count per target.

### 4. Predictive Scaling (Proactive, ML)
Uses **machine learning on ≥3 weeks of history** to forecast traffic and **pre-launch** capacity. Can run **forecast-only** or **forecast-and-scale**. Combine with dynamic scaling: predictive (proactive) + dynamic (reactive) = best coverage.
- **Pre-launch buffer:** launch instances N minutes before the forecast spike (e.g. forecast 10am → launch 9:55am)
- **Max capacity buffer:** provision a % above forecast (forecast 10 → +20% → 12 instances)

---

## Instance Maintenance Policy

When you update the launch template (e.g. swap the AMI) and run an **instance refresh**, this controls how old instances are replaced:

| Policy | Behaviour | Trade-off |
|--------|-----------|-----------|
| **Terminate and Launch** | Kill old first, then launch new | Capacity dips below desired; **never pay extra** (cost-first) |
| **Launch Before Terminating** | Launch new first, then kill old | Capacity briefly exceeds desired (pay more); **zero downtime** (availability-first) |
| **Custom Behavior** | You set min % and max % healthy yourself | Full control — ideal for large fleets |

---

## Termination Policy

On **scale in**, which instance dies? The **default policy** runs this funnel:

1. **Balance across AZs** — target the AZ with the most instances
2. **Scale-in protection** — skip any instance you've protected
3. **Oldest launch template** — prefer instances on the older template
4. **Closest to next billing hour** — terminate the one with least wasted paid time
5. **Random** — tiebreaker

**Other built-in policies:** OldestInstance, NewestInstance (test instances), OldestLaunchTemplate, ClosestToNextInstanceHour, AllocationStrategy (for mixed spot/on-demand fleets).

**Custom termination policy** — backed by a **Lambda function** for full control: graceful app shutdown, pre-termination backups, tag-based selection, custom metrics, or notifying external systems.

> **Scale-in protection** lets you mark a specific instance so Auto Scaling never terminates it during scale in.

---

## The 3 Timers

| Timer | Purpose | Default |
|-------|---------|---------|
| **🔥 Warm-up** | New instance's metrics are ignored until it's ready — prevents premature scaling (dynamic step & target-tracking only) | optional |
| **❄️ Cooldown** | Mandatory wait after a scaling action before the next — lets the group stabilise | 300s |
| **🩺 Health-check grace** | Delay before health checks start on a new instance — gives the app time to boot | 300s |

**Worked example** — scale-out at **12:00**, warm-up 5 min, cooldown 10 min, grace 3 min:
- **12:03** — health checks begin (grace period ends)
- **12:05** — instance metrics start counting (warm-up ends)
- **12:15** — next scaling action allowed (cooldown ends, measured from 12:05)
`,
      },
    ],
  },
  {
    id: "storage",
    label: "Storage",
    icon: "🗄️",
    color: "#3F8624",
    topics: [
      {
        id: "storage-fundamentals",
        title: "Storage Fundamentals",
        shortDesc: "DAS, File Storage, Object Storage — and their AWS equivalents",
        visuals: ["StorageTypesMap", "StorageCompareTable"],
        content: `## Storage Fundamentals

Before diving into individual AWS storage services, you need to understand the **three fundamental types of storage** that exist — and how AWS maps to each one.

---

## The Three Storage Types

### 1. DAS — Direct Attached Storage (Block Storage)

Storage that is **physically or directly connected** to a single computer.

**Real-world examples:** Internal HDD, SSD, NVMe drives, USB pen drives.

**Key characteristics:**
- **Fastest** of all three storage types — minimal latency
- **Not shared** — one computer connects to it at a time; you cannot simultaneously access it from multiple machines
- Needs to be **formatted** before use — manufacturers don't know which OS you'll use, so the disk ships in raw format
- You format it with a file system matching your OS: **NTFS** for Windows, **ext4** for Linux

> When you format a block storage device, you are creating a *block* structure on disk — which is why it's also called **block storage**.

**AWS equivalents of DAS:**
- **Instance Store** — temporary block storage physically inside the EC2 host machine
- **EBS (Elastic Block Store)** — persistent block storage that attaches over the network

---

### 2. File Storage (Network Attached Storage)

Shared storage accessible by **multiple computers simultaneously** over a network.

**Why it exists:** If you have 50 computers each storing data on their own local drives, you must maintain 50 separate disks. Instead, you create one central storage server — all 50 computers read/write to it. You only manage one storage system.

**Protocols:**
- **NFS (Network File System)** — Linux-based file sharing
- **CIFS / SMB (Common Internet File System / Server Message Block)** — Windows-based file sharing

**AWS equivalents of File Storage:**
- **EFS (Elastic File System)** — Linux/NFS-compatible managed file system
- **FSx** — Windows-compatible managed file system (FSx for Windows File Server)

---

### 3. Object Storage

A **cloud-native** storage type — does not exist in traditional on-premises infrastructure.

Designed for storing **massive amounts of unstructured, static data** — files you upload and access as whole objects, not blocks you format and mount.

**Characteristics:**
- No file system — you access data via an HTTP API or URL
- Stores data as **objects** (each with data + metadata + unique key)
- Virtually unlimited scale
- Best for data you don't frequently edit: backups, logs, images, videos, datasets

**AWS equivalent:**
- **S3 (Simple Storage Service)** — the definitive object storage service in AWS

---

## AWS Storage Landscape at a Glance

| Traditional | Technology | AWS Service |
|-------------|-----------|-------------|
| DAS (local disk) | Block storage | **Instance Store** (temporary) |
| DAS (local disk) | Block storage | **EBS** (persistent) |
| NFS (Linux shared) | File storage | **EFS** |
| CIFS/SMB (Windows shared) | File storage | **FSx** |
| — (cloud only) | Object storage | **S3** |

---

## How to Choose

| Situation | Use |
|-----------|-----|
| OS root volume for EC2 | EBS |
| Temporary scratch space, cache, buffer | Instance Store |
| Shared Linux file system across many EC2 instances | EFS |
| Shared Windows file system | FSx |
| Store images, videos, backups, static files | S3 |
| Long-term archival, rarely accessed | S3 Glacier |
`,
      },
      {
        id: "s3",
        title: "S3 – Simple Storage Service (Part 1)",
        shortDesc: "Object storage: classes, versioning, lifecycle, access, encryption",
        visuals: ["ObjectVsBlock", "S3Features", "StorageClasses", "ExpressOneZone", "Versioning", "LifecycleRules", "AccessControl", "IAMvsBucketPolicy", "ObjectLock", "S3Encryption"],
        content: `## S3 – Simple Storage Service (Part 1)

**Amazon S3** is AWS's first service and its 2nd most popular — durable, virtually unlimited **object storage**.

### Object vs Block storage
- **Object (S3):** each file = one whole **object** with a unique ID + metadata, in a flat namespace; each has its own **URL** (access over HTTP, no mounting). Scalable, cheap, best for **static/unstructured data** (photos, videos, backups). Higher latency; not for frequent edits or tiny-file-heavy workloads.
- **Block (EBS):** file split into blocks, must be mounted to a server; low latency, for OS disks/databases.

### Features
- **11 9s durability** (99.999999999%), **99.99% availability**, objects **0 bytes–5 TB**, virtually unlimited.
- **Versioning, lifecycle rules, storage classes, encryption (default), event notifications.**
- **Consistency:** read-after-write for NEW objects; eventual consistency for overwrites/deletes.
- **Bucket naming:** globally unique, 3–63 chars, lowercase + numbers + dots/hyphens, not an IP. Pay for **storage + requests + data transfer**.

---

## Storage Classes (match cost to access pattern)

| Class | Access | AZs | Retrieval | Min |
|---|---|---|---|---|
| **Standard** | Frequent | ≥3 | ms | — |
| **Standard-IA** | Infrequent | ≥3 | ms (+retrieval fee) | 30 days |
| **One Zone-IA** | Infrequent, recreatable | **1** | ms | 30 days |
| **Intelligent-Tiering** | Unknown/changing | ≥3 | ms (monitoring fee) | — |
| **Express One Zone** | Ultra-low latency | 1 (you pick) | single-digit ms | — |
| **Glacier Instant** | Archive ~1/qtr | ≥3 | ms | 90 days |
| **Glacier Flexible** | Archive 1–2/yr | ≥3 | mins–hours | 90 days |
| **Glacier Deep Archive** | Very rare | ≥3 | 12–48 h | 180 days |

> IA/One-Zone/Glacier add a **retrieval fee** — storing hot data there costs more. **Express One Zone** uses a **directory bucket** in an AZ you choose, co-located with compute for ~10× faster access.

---

## Versioning
Keeps multiple versions so you can recover overwritten/deleted objects. Delete just adds a **delete marker** (remove it to restore); permanent delete = delete the specific version. Once enabled, can only be **suspended**. You pay per version.

## Lifecycle Rules
Auto-transition objects to cheaper classes and expire them over time (e.g. Standard → Standard-IA at 30d → One Zone-IA at 90d → Glacier → Deep Archive → expire). Filter by **prefix, tag, or size**; apply to current/non-current versions. (Standard → Standard-IA needs ≥30 days.)

---

## Controlling Access (3 layers)
- **IAM policy** (identity-based, attach to user/role), **Bucket policy** (resource-based, needs a \`Principal\`, supports cross-account & public), **ACL** (legacy, basic).
- Rule: **any explicit DENY wins; otherwise one ALLOW grants access** (default deny). Console browsing also needs \`s3:ListAllMyBuckets\`.

## Object Lock (WORM)
Prevents deletion/overwrite (needs versioning; can't be disabled). **Governance** mode = privileged users can override; **Compliance** mode = no one (even root) can delete until retention ends. **Legal hold** = lock with no expiry, toggled manually.

## Encryption
- **At rest:** default ON — **SSE-S3** (AWS key), **SSE-KMS** (your key, auditable), **SSE-C** (you supply key).
- **In transit:** **HTTPS (TLS)** protects data moving to/from S3.`,
      },
      {
        id: "ebs",
        title: "EBS – Elastic Block Store",
        shortDesc: "Persistent block storage volumes for EC2",
        visuals: ["InstanceStoreVsEBS", "StorageScenariosExplorer", "EBSLifecycleVisual", "EBSVolumeTypesExplorer", "GP2vsGP3Calculator", "SnapshotWorkflow", "DLMPolicyVisual"],
        content: `## EBS — Elastic Block Store

EBS is AWS's **persistent block storage** service. It works like an external hard drive for your EC2 instance — you create it, attach it, format it, and use it. Unlike Instance Store, it survives EC2 stop/terminate cycles.

---

## The Physical Host Context

To understand storage options, you must understand how EC2 instances are physically hosted:

- AWS has **50,000–60,000+ physical host machines** in a single Availability Zone
- Each EC2 instance (VM) runs inside one of these physical hosts
- When you **stop and restart** an EC2 instance, AWS's algorithm may place it on a **different physical host** — you have no control over this
- This movement between hosts is the key reason why Instance Store and EBS behave so differently

---

## Instance Store

Instance Store is **block storage physically built into the same hardware** as your EC2 instance's host machine.

**How it works:**
- The storage device is inside the physical host
- Your EC2 instance accesses it directly — no network hop
- This is why it gives the absolute best performance (lowest latency, highest IOPS)

**The fatal problem:**
- If you **stop** your EC2 instance, AWS might restart it on a **different physical host**
- The new host does not have your old instance store — it's left behind on the previous host
- All data on the instance store is **permanently lost**

> Instance Store is **ephemeral** — its lifespan is tied exactly to the EC2 instance's lifespan.

**Use Instance Store for:**
- Temporary cache, scratch buffers, session data
- Data you can afford to regenerate
- Maximum-performance scenarios where persistence doesn't matter

**Important:** Not all instance types support Instance Store. T2.micro and many standard types do not. You must select a specific instance type (e.g. i3, x1) that includes Instance Store.

---

## EBS — Elastic Block Store

EBS is **network-attached block storage** that lives independently of any physical host.

**How it works:**
- EBS volumes exist in the AWS network, not inside any single host machine
- Any EC2 instance in the same AZ can connect to it
- When your instance stops and restarts on a new host, it simply reconnects to the same EBS volume over the network

**Key advantage:** EBS is **persistent** — data survives stop, reboot, and even termination (depending on settings).

**Use EBS for:**
- OS root volumes (the C: drive equivalent)
- Databases, application data, mission-critical files
- Any data you cannot afford to lose

---

## Instance Store vs EBS — Full Comparison

| | Instance Store | EBS |
|--|---------------|-----|
| **Persistence** | Temporary — lost on stop/terminate | Persistent — survives stop/terminate |
| **Data on stop** | ❌ Deleted | ✅ Retained |
| **Data on terminate** | ❌ Deleted | ✅ Retained (configurable) |
| **Performance** | ⚡ Highest — direct local hardware | Very good — network-attached |
| **Instance types** | Specific types only (i3, x1, etc.) | All instance types |
| **Size** | Fixed by instance type | Up to 16 TB, any size you choose |
| **Cost** | Included in instance price | Separate charge (even when instance stopped) |
| **Mounting** | Auto-mounted at launch | Manual attach + manual mount from OS |
| **Attachment** | Cannot detach/reattach | Can detach and attach to any instance in same AZ |
| **Use case** | Cache, scratch, temp buffer | OS, database, persistent app data |

> **Billing note:** If your EC2 instance is stopped, you pay $0 for compute — but you **still pay for any attached EBS volumes**.

---

## Delete on Termination Setting

When creating an EC2 instance with an EBS root volume, you see **Delete on Termination**:

- **Yes (default for root volume):** When you terminate the EC2 instance, the EBS volume is deleted too
- **No:** When you terminate the EC2 instance, the EBS volume survives — you can attach it to another instance later

> Instance Store has no "Delete on Termination" option — it always disappears when the instance stops.

---

## The 6 Storage Configuration Scenarios

When setting up an EC2 instance, you choose how to configure your **root volume** (where the OS lives) and optional **data volumes**. There are 6 combinations:

### Scenario 1 — Instance Store as Root Volume
- Select an AMI with Root Device Type = **Instance Store**
- Only Linux AMIs support this (no Windows AMIs)
- Only specific instance types allowed (not T2.micro)
- Size is fixed by instance type
- **Stopping the instance deletes all data**

### Scenario 2 — EBS as Root Volume *(most common)*
- Default for almost all AMIs
- Supports all instance types
- Size is configurable (8 GB default for Linux, 30 GB for Windows)
- **Delete on Termination** setting available

### Scenario 3 — Instance Store as Data Volume
- You cannot add Instance Store from the "Add Volume" button
- Must select an instance type that includes Instance Store (e.g. x1.32xlarge — comes with 2 volumes; first = root, second = data)
- Size fixed, ephemeral

### Scenario 4 — EBS as Data Volume *(simplest)*
- Click **Add Volume** in the storage config section
- Choose any size, any volume type
- Completely flexible — add as many as you need

### Scenario 5 — Instance Store as Root + EBS as Data
- Select Instance Store AMI + Instance Store-capable instance type
- Then click **Add Volume** to add an EBS data drive
- OS lives on ephemeral storage, data persists separately

### Scenario 6 — EBS as Root + Instance Store as Data
- Use any standard EBS AMI
- Select an instance type that has built-in Instance Store (check "Storage GB" column in instance type comparison)
- You get an EBS root + an automatic Instance Store data volume
- Root is safe; data volume is temporary

---

## EBS Volume Types

When you create an EBS volume you must choose a type. There are **7 types** — choose the wrong one and you pay more for less performance. There are three categories:

- **SSD (4 types)** — high random I/O, general and specialised workloads
- **HDD (2 types)** — large sequential workloads, cheaper
- **Magnetic (1 type)** — legacy, being phased out by AWS

---

## Understanding Performance: IOPS vs Throughput

Two measurements determine EBS performance:

**IOPS (Input/Output Operations Per Second)**
The number of read/write requests per second. Higher = more responsive for transactional workloads.
- 1000 IOPS = can handle 1,000 read/write ops per second
- Key for databases, boot volumes, small random I/O

**Throughput (MB/s)**
The amount of data transferred per second. Higher = more bandwidth.
- 250 MB/s throughput = can move 250 megabytes of data per second
- Key for big data, log processing, large sequential reads

> For most database/app workloads: prioritise **IOPS**. For streaming/big data: prioritise **throughput**. Always consider both.

---

## SSD Volume Types

### GP2 — General Purpose SSD (Old Generation)

- **IOPS:** 3 IOPS per GB of volume size (minimum 100, maximum 16,000)
- **Throughput:** Up to 250 MB/s
- **Burst:** Credit-based burst up to 3,000 IOPS (credits accumulate when idle)
- **Size:** 1 GB – 16 TiB

**The GP2 Problem:**
IOPS are locked to volume size — you can't separate them. If you need 900 IOPS but only store 50 GB of data:
- 50 GB × 3 = 150 IOPS → not enough
- You must create a **300 GB** volume (300 × 3 = 900 IOPS) to get the performance
- You pay for 250 GB of empty, wasted space just to get the IOPS you need

> **Always prefer GP3 over GP2.**

---

### GP3 — General Purpose SSD (New Generation) ✅ Recommended

- **Base IOPS:** 3,000 IOPS flat — regardless of volume size
- **Max IOPS:** 16,000 (configurable, pay extra above 3,000)
- **Throughput:** 125–1,000 MB/s (configurable)
- **Size:** 1 GB – 16 TiB
- **Cost:** ~20% cheaper than GP2 for 1 TB

**GP3 solves the GP2 problem:**
Create a 50 GB volume → still get 3,000 IOPS. No need to overprovision storage just for performance. IOPS and throughput are independently configurable.

**Use GP3 for:** Virtual desktops, small/medium databases, dev/test environments, boot volumes, low-latency applications.

---

### io1 — Provisioned IOPS SSD

- **IOPS:** Fully configurable up to **64,000 IOPS**
- **Throughput:** Up to 1,000 MB/s
- **Size:** 4 GB – 16 TiB
- **Multi-attach:** ✅ Yes (Nitro instances only)
- **Durability:** 99.9%

---

### io2 — Provisioned IOPS SSD (Recommended over io1)

- **IOPS:** Configurable up to **64,000 IOPS** (or 256,000 with Block Express)
- **Throughput:** Up to 1,000 MB/s (or 4,000 MB/s with Block Express)
- **Size:** 4 GB – 16 TiB (or 4 GB – 64 TiB with Block Express)
- **Multi-attach:** ✅ Yes (Nitro instances only)
- **Durability:** **99.999%** — five 9s (vs 99.9% for io1)
- **Same price as io1** — higher durability for the same cost → always choose io2

**io2 Block Express:**
- Sub-millisecond latency
- Up to 256,000 IOPS and 4,000 MB/s throughput
- Only available with specific EC2 instance types (e.g. R5b, X2idn, Trn1)
- No extra charge beyond io2 pricing — it's unlocked by compatible instance types

**Use io1/io2 for:** Large Oracle/SAP/SQL Server databases, I/O intensive workloads, any app requiring > 16,000 IOPS.

---

### Multi-Attach (io1 / io2 Only)

Normally one EBS volume attaches to only one EC2 instance. With io1/io2:
- Attach the **same volume** to up to **16 EC2 instances simultaneously**
- Requires **Nitro-based** instance types
- Applications must manage concurrent writes (filesystem must support it)

---

## HDD Volume Types

### st1 — Throughput Optimized HDD

- **Use for:** Big data, data warehouses, log processing — large sequential reads/writes
- **Max IOPS:** 500
- **Max Throughput:** 500 MB/s
- **Size:** 125 GB – 16 TiB
- **Cost:** ~$0.046/GB/month
- **Boot volume:** ❌ Not supported

### sc1 — Cold HDD

- **Use for:** Infrequently accessed data — cheapest option for large cold datasets
- **Max IOPS:** 250
- **Max Throughput:** 250 MB/s (half of st1)
- **Size:** 125 GB – 16 TiB
- **Cost:** ~$0.015/GB/month — **cheapest EBS option**
- **Boot volume:** ❌ Not supported

---

## Magnetic (Standard) — Legacy ⚠️

- Old sequential storage technology
- Variable IOPS, low throughput (40–90 MB/s)
- **Surprisingly expensive** — AWS is pricing it out to push users toward HDD types
- Boot volume: ✅ (but not recommended — sequential reads make OS startup very slow)
- **AWS recommendation:** Do not use. Being phased out. Use sc1 instead.

---

## Volume Type Summary

| Type | Max IOPS | Max Throughput | Best For | Boot? |
|------|---------|---------------|---------|-------|
| **GP3** | 16,000 | 1,000 MB/s | General purpose — always choose over GP2 | ✅ |
| **GP2** | 16,000 | 250 MB/s | Legacy — avoid if possible | ✅ |
| **io2** | 64,000 (256k w/BE) | 1,000 MB/s (4k w/BE) | Critical databases, highest IOPS | ✅ |
| **io1** | 64,000 | 1,000 MB/s | Legacy provisioned IOPS | ✅ |
| **st1** | 500 | 500 MB/s | Big data, logs, sequential reads | ❌ |
| **sc1** | 250 | 250 MB/s | Cold/infrequent data, cheapest | ❌ |
| **Magnetic** | ~100 | 40–90 MB/s | Avoid — being retired | ✅ |

---

## Attaching an EBS Volume to EC2 (Practical)

### Step-by-step (Windows instance)

**Create the volume:**
1. EC2 Dashboard → Volumes → **Create Volume**
2. Choose type (GP3 for learning), size (e.g. 15 GB)
3. **Must be in the same AZ** as your EC2 instance — check the instance's AZ first
4. Optional: Enable **encryption** (KMS) — you cannot encrypt after creation

**Attach the volume:**
1. Select volume → Actions → **Attach Volume**
2. Select your EC2 instance → Attach

**Format and mount in Windows:**
1. Open **Disk Management** (Windows + R → diskmgmt.msc)
2. Right-click new disk → **Online**
3. Right-click → **Initialize Disk**
4. Right-click unallocated space → **New Simple Volume** → follow wizard
5. Volume appears as a new drive letter (D:, E:, etc.)

**Resize a volume:**
- Select volume → Actions → **Modify Volume** → enter new size (can only increase, never decrease)
- In Windows: Disk Management → right-click drive → **Extend Volume**
- No instance reboot required

> ⚠️ EBS volumes can only be attached to EC2 instances **in the same AZ**. To move to another AZ: take a snapshot → create new volume from snapshot in the target AZ.

> ⚠️ Encryption must be enabled at creation time. You cannot encrypt an existing unencrypted volume directly — you must snapshot it, then create an encrypted volume from the snapshot.

---

## EBS Snapshots

A **snapshot** is a point-in-time backup of an EBS volume. Snapshots are stored in **Amazon S3** (managed by AWS, not visible in your S3 console).

### 4 Use Cases of Snapshots

1. **Backup & Restore** — create a snapshot, delete data, restore from snapshot to a new volume
2. **Cross-AZ volume migration** — snapshot the volume → create new volume from snapshot in a different AZ
3. **Cross-region copy** — copy the snapshot to another region → create volume there
4. **Enabling encryption** — take a snapshot of unencrypted volume → create encrypted volume from snapshot

### How to take a snapshot

1. EC2 → Volumes → select your volume → Actions → **Create Snapshot**
2. Add a description
3. Status: Pending → Completed (stored in S3)

### How to restore

1. EC2 → Snapshots → select snapshot → Actions → **Create Volume from Snapshot**
2. Choose AZ and size (can be larger, not smaller)
3. Attach the new volume to your EC2 instance → bring online in Disk Management (no need to format — data is already there)

---

## Data Lifecycle Manager (DLM) — Automated Snapshots

Taking snapshots manually is error-prone — you might forget. **DLM automates** snapshot creation and deletion on a schedule.

### How DLM works

1. **Tag** your EBS volumes (e.g. key: Backup, value: Daily)
2. Create a **Lifecycle Policy** targeting volumes with that tag
3. Set a **schedule**: daily at 9 AM UTC, weekly, monthly, or custom cron
4. Set **retention**: keep last N snapshots, or keep snapshots younger than N days
5. DLM automatically creates and deletes snapshots — you never have to remember

### DLM Policy types

| Policy Type | What it backs up |
|-------------|-----------------|
| **EBS Snapshot Policy** | Individual EBS volumes |
| **EBS-backed AMI Policy** | Entire EC2 instance (all volumes) |
| **Cross-account Copy Event** | Copies snapshots to another AWS account |

### Example Schedule
- Every day at 09:00 UTC
- Retain last 2 snapshots
- Result: Monday snapshot exists. Tuesday snapshot taken → Monday kept. Wednesday snapshot taken → Monday deleted. Always keep the 2 most recent.

> DLM is free — you only pay for the S3 storage used by the snapshots themselves.
`,
      },
      {
        id: "efs",
        title: "EFS – Elastic File System",
        shortDesc: "Scalable NFS file system",
        visuals: ["EFSvsEBSShared", "EFSUseCases", "EFSConfigExplorer", "EFSThroughputPerformance", "EFSLabSteps"],
        content: `## EFS – Elastic File System

EFS (**Elastic File System**) is AWS's **shared file storage** service. Unlike EBS — which is directly attached to a single EC2 instance — EFS can be mounted by **any number of EC2 instances at the same time**. It is based on the Linux **NFS** protocol.

> EFS = a single file system that many Linux EC2 instances read and write to simultaneously.

---

## Why EFS? — The EBS Problem

Imagine you host a website on EC2 and want **high availability**, so you run two instances in two different Availability Zones (e.g. \`ap-south-1a\` and \`ap-south-1b\`). If one AZ goes down, the other keeps serving — 24×7 uptime.

### Using EBS (the painful way)

EBS is **directly-attached storage** — it **cannot be shared**. So each instance needs its **own** EBS volume with its **own copy** of the website.

- 2 instances → 2 copies
- 10 instances → 10 copies
- **Updating the site** means editing it on **every single volume**, one by one

With 100 instances, that's 100 manual updates. This does not scale.

### Using EFS (the elegant way)

EFS is **shared storage**. You store **one** copy of the website on a single EFS volume, and **all** instances mount it.

- Update the site **once** → every instance sees the change instantly
- Add 50 or 100 instances → still just one file system, zero extra copies

> ⚠️ **EFS supports Linux only** (it's NFS-based). For shared **Windows** (SMB/CIFS) storage, use **FSx** instead.

---

## 3 Main Use Cases

1. **Highly-available web hosting** — Many web servers across multiple AZs serve one website stored on shared EFS. One AZ failing doesn't interrupt users.
2. **Centralised file server** — Many workstation EC2 instances write their data to one EFS instead of managing many separate EBS volumes.
3. **On-premises cloud storage** — On-prem office workstations store data into EFS over a **VPN** or **Direct Connect** link, giving durable, centralised off-site storage.

---

## EFS Configuration Options

When you create an EFS file system, click **Customize** to control these options. Understanding them lets you **save significant money**.

### Storage Class — Standard vs One Zone

| Class | Stored in | Use for | Cost |
|-------|-----------|---------|------|
| **Standard** | Replicated across **multiple AZs** automatically | **Critical** data you can't lose | Higher |
| **One Zone** | A **single AZ** only | **Non-critical** data backed up elsewhere | Lower |

> With One Zone, if that AZ is unavailable, your data is temporarily unreachable.

### Automatic Backup

Enable for **critical** data (AWS Backup takes recovery points). Disable for reproducible / non-critical data to save cost.

### Lifecycle Management

EFS holds two kinds of data:

- **Hot data** — accessed frequently → keep in **Standard**
- **Cold data** — rarely accessed → move to **Infrequent Access (IA)** (cheaper)

Lifecycle management does this **automatically**: *"If a file isn't accessed for 30 / 90 days, move it from Standard → Infrequent Access."* You can also set **transition back** to Standard when a cold file is accessed again. On terabyte-scale corporate data, this saves a fortune.

### Encryption at Rest

Enable to encrypt data using **KMS (Key Management Service)** — required by many government/compliance standards. If the data is stolen, it's unreadable.

---

## Throughput Mode vs Performance Mode

Two separate dials control EFS speed. Think of a **restaurant**:

- **Throughput = the kitchen** → how much **data** (MB/s) can be processed per second
- **Performance = the waiters** → how many **requests (IOPS)** can be served per second

You need **both** to be fast. A great kitchen with too few waiters still delivers slowly.

### Throughput Modes

| Mode | Behaviour |
|------|-----------|
| **Bursting** | Throughput scales with how much data you've stored. Small data = low baseline, with burst **credits** to roughly double speed temporarily. |
| **Elastic** (Enhanced) | Auto-scales to whatever throughput you need — no limit. Great for spiky workloads, but billing can spike too. |
| **Provisioned** (Enhanced) | You set a **fixed, constant** throughput (e.g. 1024 MB/s) regardless of stored data size. Predictable for critical apps. |

### Performance Modes

| Mode | Behaviour |
|------|-----------|
| **General Purpose** | Moderate IOPS, lowest latency. Default — right for most apps. |
| **Max I/O** | Very high IOPS for highly parallel workloads (big data, thousands of clients). |

> EFS is **elastic** — you never provision a size. You pay only for the **data actually stored** (5 GB stored → pay for 5 GB).

---

## Lab — Shared Storage Across Two AZs

**Goal:** Two Linux EC2 instances in two AZs both mount one EFS file system, then prove a file created on one appears on the other.

### Step 1 — Create Security Groups

Two groups, following AWS best practice:

\`\`\`
web-SG (for EC2 instances)
  Inbound:  TCP 22 (SSH)   ← 0.0.0.0/0
  Outbound: All traffic

efs-SG (for EFS)
  Inbound:  TCP 2049 (NFS) ← source: web-SG
  Outbound: All traffic
\`\`\`

> 🔒 **Key best practice:** the EFS port (**2049 / NFS**) is sourced from **web-SG**, *not* \`0.0.0.0/0\`. Only members of web-SG (your EC2 fleet) can reach EFS — nobody else.

### Step 2 — Launch 2 EC2 Instances (different AZs)

- \`EFS-VM-1\` → Amazon Linux, t2.micro, **ap-south-1a**, SG: web-SG
- \`EFS-VM-2\` → Amazon Linux, t2.micro, **ap-south-1b**, SG: web-SG

Two AZs = high availability. **EFS supports Linux only.** Create instances **one at a time** so they land in different subnets/AZs (launching "count = 2" puts both in the same subnet).

### Step 3 — Create the EFS File System

EFS → **Create File System** → **Customize**:
- Name: \`shared_storage\`
- Storage class: Standard
- Throughput: Enhanced → Elastic
- Performance: General Purpose
- No size to set — EFS grows automatically and you pay per GB used

### Step 4 — Configure Mount Targets

Add a **mount target** in each AZ that needs access (ap-south-1a, ap-south-1b), and attach **efs-SG** to them.

> **Rule:** an AZ must have a mount target before any EC2 in it can access the file system. You can add more mount targets later.

### Step 5 — Install EFS Utils (on both servers)

\`\`\`bash
ssh -i cloud_fox_key.pem ec2-user@<public-ip>
sudo -i
yum install -y amazon-efs-utils
\`\`\`

> Install on **both** servers — forgetting this is the #1 reason mounts fail.

### Step 6 — Mount EFS (on both servers)

\`\`\`bash
mkdir efs
sudo mount -t efs -o tls fs-xxxxxxxx:/ efs
cd efs && ls
\`\`\`

Use the exact mount command shown under **EFS → your file system → Attach**.

### Step 7 — Verify Shared Access

\`\`\`bash
# On VM-1
echo "created from VM-1" > efs/note.txt

# On VM-2 — the same file is already there
cat efs/note.txt   #  → created from VM-1
\`\`\`

Both instances read/write the **same data in real time** — exactly what EBS cannot do.

### Step 8 — Clean Up

1. **Terminate** both EC2 instances
2. EFS → select → **Delete** (confirm with the EFS id) — mount targets are removed automatically

> ⚠️ Stopped ≠ free. Always delete EFS and terminate EC2 after labs to avoid surprise bills.
`,
      },
      {
        id: "fsx",
        title: "FSx – Fully Managed File Systems",
        shortDesc: "Managed third-party file systems (ONTAP, OpenZFS, Windows, Lustre)",
        visuals: ["FSxFileSystemSelector", "FSxBenefits", "ONTAPDeploymentExplorer", "OpenZFSTimeline", "OpenZFSvsONTAP", "WindowsFileServerScenario", "ActiveDirectoryFlow", "FSxONTAPLab"],
        content: `## FSx – Fully Managed File Systems

**FSx** is AWS's **fully managed file storage** service. Like EFS it provides **shared storage**, but with two big advantages:

1. It supports **Windows** (which EFS cannot — EFS is Linux/NFS only).
2. It offers **four different file systems** under one service, each replicating a popular real-world storage technology.

> FSx gives you industry-standard, highly-optimised **third-party file systems** as a managed service — no servers, OS, networking, or updates to maintain.

---

## What "Fully Managed" Means

With FSx you do **not** need to:
- Buy servers, workstations, networking gear, or hard drives
- Install or patch an operating system
- Install storage software or manage updates

Your disk is **"ready to eat"** — set it up in ~30 minutes and delete it just as easily.

You can access FSx from **EC2**, **ECS** (Elastic Container Service), **EKS** (Elastic Kubernetes Service), and even **on-premises** servers (via VPN / Direct Connect).

---

## The 4 File Systems

When you click **Create File System** in FSx, you choose one of four options:

| File System | Type | Protocols | Best For |
|-------------|------|-----------|----------|
| **NetApp ONTAP** | Proprietary enterprise OS | SMB, NFS, iSCSI | Large enterprise, hybrid cloud, lift-and-shift from on-prem NetApp |
| **OpenZFS** | Open-source file system | NFS | Small-medium enterprise, personal cloud, archival |
| **Windows File Server** | Native Windows SMB | SMB | Windows-native file sharing, lift-and-shift Windows apps |
| **Lustre** | HPC parallel file system | Lustre | High performance computing, ML, big data |

A **Solutions Architect** must understand each one to pick the right fit for a company's workload — that's why this section is a deep dive, not just an overview.

---

## 5 Core Benefits

1. **Fully managed** — no hardware, OS, or updates to handle
2. **Scalable** — start at 1 TB minimum, scale to petabytes (hard to do on-prem)
3. **High performance** — low latency, configurable provisioned IOPS and throughput
4. **Secure** — one-click encryption at rest
5. **Cost effective** — on-demand, pay for what you use, set up/tear down in minutes

### Common Use Cases
- **Lift-and-shift** of Windows-based applications to the cloud
- **File sharing & collaboration** across many EC2 / on-prem machines
- **High performance computing (HPC)** — via FSx for Lustre
- **Backup & disaster recovery** for on-prem servers

---

## NetApp ONTAP

**NetApp** (originally *Network Appliances*) is a data-management company famous for **NAS** (Network Attached Storage = file storage). Its rival EMC is known for **SAN** (block storage).

**ONTAP** is NetApp's flagship storage **operating system** — a full OS dedicated to storage, *not* built on Linux or Windows. It comes in three deployment forms:

| Form | Era | What it is |
|------|-----|-----------|
| **ONTAP 9** | On-premises | The OS that ships with physical NetApp hardware |
| **ONTAP Select** | Virtualization | Software-defined — turns your own VM into NetApp storage (no NetApp hardware) |
| **Cloud Volumes ONTAP (CVO)** | Cloud | Cloud-native version — **this is what FSx for NetApp ONTAP runs** |

### ONTAP Features (in FSx)

- **Latency:** < 1 ms
- **Throughput:** 4–6 GB/s per file system
- **Max size:** virtually unlimited
- **Protocols:** **SMB + NFS + iSCSI** (the most of any FSx option)
- **Clients:** Windows, Linux, macOS
- **Active Directory** support: ✅
- **Antivirus integration:** ✅
- **Deployment:** Single-AZ (**99.9%** SLA) or Multi-AZ (**99.99%** SLA)

> This section's lab uses **iSCSI/NFS** with ONTAP so you see all three protocols across the storage series (EFS = NFS, Windows = SMB, ONTAP = iSCSI).

---

## OpenZFS

### From ZFS to OpenZFS
- **2001** — Sun Microsystems begins building **ZFS** (a file system + logical volume manager) focused on huge data and **data integrity**
- **2005** — Ships with the **Solaris** OS (proprietary)
- **2008** — Sun **open-sources** ZFS; a developer community forms
- **2010** — **Oracle** acquires Sun and **closes** the source again
- **2010+** — The community forks the open code into **OpenZFS** — community-driven, **no licensing fees**

> This is the key contrast: **NetApp ONTAP is proprietary** (licensed); **OpenZFS is open source** (free).

### OpenZFS Data-Integrity Features
- **Copy-on-write** — never overwrites the original data; corruption-safe
- **Checksums** — detect and correct silent data corruption
- **Snapshots & cloning** — point-in-time copies for instant restore
- **Storage pools** — add devices to grow capacity (cluster-like)
- **RAID-Z** — protects against disk failure (like RAID 0/1/5/10)
- **Atomic transactions** — operations complete fully or not at all
- **Compression** — shrink data to save space
- **Deduplication** — three identical 100 MB files store **once** (100 MB, not 300 MB)
- **Tiered storage** — separate hot and cold data

> OpenZFS is **not** a full OS — it needs a host **Linux** OS (any distribution, or FreeBSD). ONTAP, by contrast, *is* a full OS that installs on bare metal or a VM directly.

---

## OpenZFS vs NetApp ONTAP (in FSx)

| Factor | OpenZFS | NetApp ONTAP | Edge |
|--------|---------|--------------|------|
| Latency | ~0.5 ms | < 1 ms | OpenZFS |
| Max throughput / FS | 10–21 GB/s | 4–6 GB/s | OpenZFS |
| Max file system size | ~500 TB | Virtually unlimited | ONTAP |
| Client compatibility | Win / Linux / macOS | Win / Linux / macOS | Tie |
| Protocol support | NFS only | SMB + NFS + iSCSI | ONTAP |
| AWS compute (EC2/ECS/EKS) | All | All | Tie |
| Active Directory | ❌ | ✅ | ONTAP |
| Antivirus integration | ❌ | ✅ | ONTAP |
| Deployment (Single/Multi-AZ) | Both | Both | Tie |
| SLA | 99.5% | 99.9% / 99.99% | ONTAP |

**Pick OpenZFS** for open-source (no licence fees), best raw speed, small-to-medium / personal / archival storage.
**Pick ONTAP** for large enterprise & hybrid cloud, SMB/iSCSI, Active Directory, antivirus, unlimited size, and the highest SLA.

---

## FSx for Windows File Server

Windows is the native OS in many corporate networks. FSx for Windows File Server gives you a **native Microsoft SMB file server** — fully managed.

### Why a central file server?
Storing data on each PC's **local** drive means caring for every hard drive and backing up every machine — fine for 4 PCs, a nightmare for 40. The fix is one central **SMB file server**.

### On-prem file server challenges
- You must ensure **high availability** (downtime blocks everyone)
- You patch the **OS** and update **antivirus** yourself
- You set up and configure the **SMB** server
- **Scaling** storage and network bandwidth as you grow is hard

### FSx solves all of this
It's a **managed** SMB server: no VM, no OS patching, no backups to run. Just configure SMB and your terabyte-scale, auto-scaling storage is ready — connectable from EC2, ECS, EKS, or on-prem.

> FSx for Windows depends heavily on **Active Directory**.

---

## Active Directory (Prerequisite for Windows File Server)

**Active Directory (AD)** is Microsoft's identity & access-management service — also used later with **AWS IAM**.

### Why it exists
In the 1990s, networked file servers had no user authentication — anyone could access anyone's data. Creating users on **every** machine was unmanageable: 100 users × 100 PCs = chaos when someone joins, leaves, or changes a password.

Microsoft introduced **NTDS** (Windows NT Server, ~1996), then **Active Directory** with Windows Server 2000 — a **centralised** user & access management system.

### How it works
- One server runs Active Directory → it's the **Domain Controller** (e.g. domain \`xyz.local\`)
- All workstations and file servers **join the domain** (one-time setup)
- Users are created **once** in AD — then they can log into any joined machine
- Every file access is **authorised by the Domain Controller** against the file's **ACL** (allow / deny)

This is exactly why AD is required before you configure FSx for Windows File Server — it decides **who** can read, write, store, or delete files.

---

## Lab — FSx for NetApp ONTAP as Shared Storage

**Goal:** Two Linux EC2 instances in two AZs mount one ONTAP volume over NFS, proving shared access.

### Step 1 — Security Groups
\`\`\`
server-SG:
  Inbound: TCP 22 (SSH) ← 0.0.0.0/0

ontap-SG:
  Inbound: TCP 111  (Custom TCP) ← server-SG
  Inbound: TCP 2049 (NFS)        ← server-SG
\`\`\`
> Port **2049 (NFS)** is in the dropdown; port **111** is not — add it as **Custom TCP**. Source is **server-SG**, not the whole internet.

### Step 2 — Launch 2 Linux EC2 (different AZs)
- \`server-1\` → Amazon Linux, t2.micro, **ap-south-1a**, SG: server-SG
- \`server-2\` → Amazon Linux, t2.micro, **ap-south-1b**, SG: server-SG

### Step 3 — Create FSx for NetApp ONTAP
FSx → Create → **NetApp ONTAP** → **Standard create**:
- Deployment: Single-AZ (faster) or Multi-AZ (HA)
- Storage: **1024 GB (1 TB minimum)**
- IOPS: Automatic (3 IOPS/GB) or provisioned up to 80,000
- Throughput: 128 MB/s default, up to 2048 MB/s
- Security group: ontap-SG

> ⚠️ Single-AZ **cannot** be converted to Multi-AZ later. At the review screen, **red** settings are locked after creation; **green** are editable (e.g. volume size). Creation takes ~15–30 minutes.

### Step 4 — Storage Virtual Machine (SVM)
ONTAP creates a **Storage Virtual Machine** — a Linux-based ONTAP VM you can administer (set admin password, run ONTAP commands). Join Active Directory only if you need SMB.

### Step 5 — Create a Volume
Create a data volume (e.g. 500 MB, min 20 MB, resizable later) inside the 1 TB file system. The 1 GB root volume holds the ONTAP OS itself.

### Step 6 — Mount on Both Servers (NFS)
\`\`\`bash
sudo -i
mkdir /fsx
mount -t nfs <svm-ip>:/vol/volume_1 /fsx
cd /fsx && ls
\`\`\`
Use the exact commands from **FSx → Volumes → Attach**.

### Step 7 — Verify Shared Access
\`\`\`bash
# server-1
echo "from server-1" > /fsx/note.txt
mkdir /fsx/fox

# server-2 — the same files appear instantly
cat /fsx/note.txt   #  → from server-1
\`\`\`

### Step 8 — Clean Up (order matters!)
ONTAP must be deleted **in sequence** or it errors:
1. Delete the **volume**
2. Delete the **Storage Virtual Machine**
3. Delete the **ONTAP file system**
4. Terminate both EC2 instances

> You cannot delete the file system while it still has an SVM or volume.
`,
      },
      {
        id: "glacier",
        title: "S3 Glacier",
        shortDesc: "Low-cost archival storage",
        content: `## S3 Glacier

**S3 Glacier** is low-cost **archival** storage for data you rarely access but must retain. It's a set of S3 storage classes:

- **Glacier Instant Retrieval** — archive with **millisecond** access; for data accessed ~once a quarter.
- **Glacier Flexible Retrieval** — retrieval in minutes–hours (Expedited / Standard / Bulk); backups, DR.
- **Glacier Deep Archive** — **cheapest** AWS storage; retrieval in **12 hours**; for 7–10-year compliance/regulatory retention.

> Use **lifecycle rules** to auto-move S3 objects to Glacier over time. Choose the tier by how fast you need data back. **Vault Lock** enforces WORM/compliance.`,
      },
      {
        id: "datasync",
        title: "DataSync",
        shortDesc: "Online data transfer service",
        visuals: ["DataSyncFlow"],
        content: `## AWS DataSync

**DataSync** is an online data-transfer service that **copies/moves** large amounts of data — automated, accelerated, and scheduled. It requires **existing storage**; it just transfers from it (it's a tool, not storage).

Two use cases:
- **On-prem → AWS** — install a **DataSync agent** (a VM on-prem) that reads your NFS/SMB/object storage and syncs to **S3, EFS, FSx, or Snowcone** (over internet or Direct Connect). For migrations, daily copies, cloud backup.
- **AWS ↔ AWS** — copy between AWS storage services (S3 ↔ EFS, EFS ↔ FSx). No agent needed.

> 📌 DataSync = transfer tool. You must already have a storage system; DataSync moves data to/from/between them.`,
      },
      {
        id: "storage-gateway",
        title: "Storage Gateway",
        shortDesc: "Hybrid cloud storage integration",
        visuals: ["GatewayConcept", "GatewayTypes", "DataSyncVsGateway"],
        content: `## AWS Storage Gateway

**Storage Gateway** is a **VM appliance** (VMware/Hyper-V/KVM on-prem, or EC2) that gives on-prem apps a **local storage interface** backed by AWS cloud storage. It **caches** recent data locally and forwards everything to S3/EBS/Glacier — so you get cloud-backed storage **without buying a storage array**.

> Setup: download the gateway VM → install on-prem (or launch on EC2) → activate with your AWS account → choose a gateway type → attach a local **cache disk** (AWS recommends ≥150 GB). A hybrid-cloud favorite — heavily tested.

---

## Gateway Types

- **📁 File Gateway** — NFS/SMB file share, stored as objects in **S3** (local cache). Supports Windows ACLs, S3 Object Lock. You get a shared folder — can't install software on it.
- **💽 Volume Gateway** — iSCSI **block** storage you can format & install software on (like a SAN). Modes: **Cached** (primary in S3, hot data local) and **Stored** (primary on-prem, backed up to S3). Backed up as **EBS snapshots**; integrates with AWS Backup.
- **📼 Tape Gateway (VTL)** — virtual tape library replacing physical tapes; works with backup software (Veeam). Active tapes → **S3**; archived tapes → **S3 Glacier / Deep Archive**.

---

## DataSync vs Storage Gateway

| Aspect | DataSync | Storage Gateway |
|---|---|---|
| What it is | Data transfer service | Hybrid storage appliance |
| Needs existing storage? | Yes (it copies) | No (it IS the storage) |
| On-prem component | Agent (reads & syncs) | Gateway (caches & serves) |
| Direction | One-time/scheduled copy | Continuous local access + cloud backing |
| Protocols | NFS, SMB, S3 API | NFS, SMB, iSCSI, VTL |

> Key question: already have storage? → **DataSync**. Need storage? → **Storage Gateway**. They also combine: Gateway centralizes data with low-latency access; DataSync automates bulk transfers.`,
      },
    ],
  },
  {
    id: "database",
    label: "Database",
    icon: "🗃️",
    color: "#2E73B8",
    topics: [
      {
        id: "rds",
        title: "RDS – Relational Database Service",
        shortDesc: "Managed relational databases (MySQL, Postgres, etc.)",
        visuals: ["RelationalTables", "DeploymentComparison", "AvailabilityOptions", "RPORTOChooser", "InstanceClassNaming", "StorageAutoScaling", "CredentialsSecurity"],
        content: `## RDS – Relational Database Service

**Amazon RDS** is a **managed relational database** service. AWS runs the database engine for you — you skip the hardware, OS patching, backups, and replication, and get a production database in **minutes**.

---

## Database Foundations

A **database** stores data in an organized way; a **DBMS** (database management system) is the software that creates and manages it. A **relational database** (the idea Edgar Codd published in 1970) stores data in **tables**:

- **Row** — one record (e.g. one customer)
- **Column** — one attribute (e.g. name, address), with a **data type**
- **Schema** — the fixed blueprint of tables, columns, and types (relational schemas are rigid — adding a column is a real change)
- **Primary key** — a unique ID per row (like a passport number)
- **Foreign key** — a column referencing another table's primary key — this creates the **relationship**
- **Index** — speeds up queries (like a book's table of contents)
- **SQL** — the language used to insert/update/query data
- **Normalization** — splitting data into related tables to avoid duplication

**Relational engines RDS supports:** MySQL, PostgreSQL, MariaDB, Oracle, Microsoft SQL Server, IBM Db2, and **Amazon Aurora** (AWS's own MySQL/PostgreSQL-compatible engine).

> Other database families exist too — **NoSQL** (DynamoDB, DocumentDB, Neptune, Keyspaces) and **in-memory** (ElastiCache) — but RDS is for **relational**.

---

## Why RDS? (On-Prem vs EC2 vs RDS)

Running a highly-available database **on-premises** means buying and maintaining: hardware, hypervisor licences, VMs, OS, dual power/UPS/generator, shared storage, redundant Ethernet switches and routers, dual ISPs — then replicating it all to a DR site. **Weeks to months**, huge up-front cost.

| | 🏢 On-Premises | 💻 On EC2 | 🛢️ RDS |
|--|--------------|-----------|---------|
| You manage | Everything | OS, patching, backups, HA | Almost nothing |
| Up-front cost | High | None | None |
| Setup time | Weeks–months | Medium | ~5–10 min |
| Backups / HA | Manual | Manual | Automated, Multi-AZ |
| Patching/scaling | Manual | Manual | Automated |

> On-prem gives full control (sometimes needed for compliance). EC2 gives OS/DB control without hardware. RDS removes the "undifferentiated heavy lifting" — you still own the **schema & data** (the DBA's job).

---

## Availability & Durability — 3 Options

| Option | Instances | Cost | HA | Performance | Failover |
|--------|-----------|------|----|-----------  |----------|
| **Single DB Instance** | 1 | 1× | ❌ none | — | Manual (restore from backup) |
| **Multi-AZ DB Instance** | 2 (primary + standby) | 2× | ✅ | ❌ standby is idle | ~60s automatic |
| **Multi-AZ DB Cluster** | 3 (1 writer + 2 readers) | 3× | ✅ | ✅ 2 readers serve reads | ~35s automatic |

- **Single** — one AZ, cheapest, downtime on failure. For non-critical apps.
- **Multi-AZ Instance** — synchronous standby in a 2nd AZ; auto-promoted on failure (~60s). HA but **no performance gain** (standby does nothing).
- **Multi-AZ Cluster** — writer + 2 readers across 3 AZs; readers handle read traffic (**performance!**), **semi-synchronous** = lower write latency, ~35s failover. **MySQL & PostgreSQL only**; no cross-region DR; can't change the fixed 3-node count.

> **Exam trap:** Multi-AZ is for **availability, not performance/scaling**. For read performance use **read replicas** or **ElastiCache**. Always connect via the **DB endpoint** (it auto-points to the current primary).

---

## Choosing by RPO & RTO

- **RPO** (Recovery Point Objective) — max **data loss** you can tolerate → drives **backup frequency**
- **RTO** (Recovery Time Objective) — max **downtime** you can tolerate

| Need | Pick |
|------|------|
| High RPO & RTO tolerance (cheap) | **Single** |
| Low data loss, ~60s failover OK | **Multi-AZ Instance** |
| Near-zero loss + fastest failover + read perf | **Multi-AZ Cluster** |

> The **business/regulator** (e.g. RBI for banks) sets RPO/RTO; you pick the cheapest option that meets them.

---

## Instance Class

A class name like \`db.m6g.large\` encodes the hardware:
- **db** — it's a database instance
- **Family** — **T** burstable · **M** general purpose · **R** memory-optimized · **C** compute-optimized
- **Generation** — higher = newer/better (like iPhone 15 → 16)
- **Size** — micro → large → xlarge → 2xlarge… each step ≈ **doubles** CPU/RAM and price

> **RDS Optimized Writes** — a free toggle on supported classes that batches writes to cut I/O, giving up to **2× write throughput** for write-heavy workloads.

---

## Storage

Built on **EBS** (gp2/gp3, io1, magnetic) — up to **64 TB**. You pay for **allocated** space, not used.

- **Storage Auto Scaling** — automatically adds capacity (e.g. +50 GB) when usage nears **90%**, up to a max you set. Avoids both a full disk (app down) and over-provisioning on day one. Not for magnetic storage, read replicas, or Multi-AZ DB Cluster.
- **Data striping** — RDS auto-distributes data across multiple EBS volumes for better performance on large databases.

---

## Credentials Security

When you create the DB you set a **master username** (avoid \`admin\`, \`root\`, \`postgres\`…) and a password. Two ways to manage it:

- **Self-managed** — you store the password yourself (often in plaintext in an app config like \`db_test.php\` on the web server). ❌ Risky: hack the public web server → get the DB.
- **AWS Secrets Manager** ✅ — stores the password **encrypted**, gated by **IAM**, with **automatic rotation**. The app fetches the current credential at runtime — nothing plaintext on the web server. Best practice (small cost, slightly more setup).
`,
      },
      {
        id: "rds-2",
        title: "RDS – Operations & Scaling (Part 2)",
        shortDesc: "Connectivity, monitoring, backups, encryption, replicas, proxy",
        visuals: ["RDSConnectivity", "DatabaseAuth", "RDSMonitoring", "ParameterOptionGroups", "RDSBackups", "RDSEncryption", "ReadReplicaVsStandby", "RDSAdvanced"],
        content: `## RDS Part 2 — Operations, Security & Scaling

Day-2 operations for RDS: connectivity, authentication, monitoring, tuning, backups, encryption, replicas, and advanced features.

---

## Connectivity (Best Practice)

Place the DB in **private subnets** using a **DB subnet group**, keep **public access = No** (no public IP), and let only the web tier reach it:

- **db-SG inbound:** MySQL \`3306\` ← **source = web-SG** (a security group, not an IP or \`0.0.0.0/0\`)
- The web server **initiates** the connection; security groups are **stateful**, so replies are auto-allowed
- DB subnet group needs **2 AZs** for Multi-AZ Instance, **3 AZs** for Multi-AZ Cluster
- The **certificate authority** option enables **TLS in transit** (install the RDS cert on the app)

> The "connect to an EC2 compute resource" wizard option just auto-creates these security-group rules for you.

---

## Database Authentication

| Method | What |
|--------|------|
| **Password** | Native DB users + passwords (always available). Simple, fine for small/dev. |
| **Password + IAM** | IAM users/roles authenticate with **temporary, expiring tokens** — no need to recreate everyone as DB users. |
| **Password + Kerberos** | Corporate **Active Directory** SSO — use existing AD users. ❌ Not on Multi-AZ DB Cluster. |

---

## Monitoring — 3 Tools

A DB instance = **engine** + **OS**. Watch them with:

| Tool | Focus | Granularity | Alarms |
|------|-------|-------------|--------|
| **Performance Insights** | Database engine (slow SQL, load) | Query-level | ❌ |
| **Enhanced Monitoring** | Operating system (CPU/mem/disk I/O) | **1 second** | ❌ (→ CloudWatch Logs) |
| **CloudWatch** | Both (general AWS tool) | 5 min / 1 min | ✅ **alarms + automation** |

> Exam cues: **Performance Insights = slow SQL**; **Enhanced Monitoring = OS, 1-second**; **CloudWatch = the only one with alarms**. Start at CloudWatch, dig deeper with the other two.

---

## Parameter Group vs Option Group

- **Parameter group** — changes engine **behavior** (500+ settings): \`max_connections\`, \`query_cache_size\`, memory/timeouts…
- **Option group** — adds **features/plugins**: Oracle OEM, SQL Server **TDE**, MySQL **memcached**

> Memory hook: **Parameter = behavior, Option = feature.**

---

## Backups

| | Automated Backups | Manual Snapshots |
|--|-------------------|------------------|
| Trigger | Daily, in a backup window | Any time, by you |
| Type | Incremental (first is full) | Full |
| Retention | **1–35 days** (default 7; 0 = off) | **Unlimited** (until you delete) |
| Storage | AWS-managed S3 (same region) | S3 |
| Enables | **Point-In-Time Recovery** | Long-term / pre-change archival |

- **PITR** — restore to any moment within the retention window (always creates a **new** instance)
- **Cross-region backup replication** for DR (not for Multi-AZ DB Cluster; cross-region copies cost extra)
- Free up to your DB storage size

---

## Encryption

Two layers:
- **At rest (KMS)** — encrypts storage, **backups, snapshots, read replicas, and logs**. Must be enabled **at creation**; to encrypt an existing DB: snapshot → copy with encryption → restore.
- **In transit (SSL/TLS)** — install the RDS cert on the app to encrypt app↔DB traffic.

> Required for compliance (HIPAA, PCI…). Default AWS-managed key vs your own customer-managed KMS key (more control/rotation).

---

## Read Replica vs Readable Standby

| | 📖 Read Replica | 🛡️ Readable Standby (Multi-AZ Cluster) |
|--|----------------|----------------------------------------|
| Purpose | **Scale reads** (performance) | **HA + auto failover** (and reads) |
| Replication | Asynchronous (small lag) | Synchronous (near real-time) |
| Failover | ❌ Manual promotion (restarts) | ✅ Automatic |
| Location | Same **or another region** 🌍 | Same region, different AZ only |

> **Read Replica = performance, no auto-failover, can be cross-region** (global low-latency, DR, migration). **Multi-AZ standby = automatic high availability.** Combine both if you need HA *and* read scale.

---

## Maintenance

A **maintenance window** lets AWS apply patches, software updates, and **minor** version upgrades (e.g. 5.6.1 → 5.6.2). **Major** upgrades (5.6 → 5.7) are **manual** (may need app changes). Impact by deployment: Single-AZ = downtime; Multi-AZ = brief failover switch; Multi-AZ Cluster = ~no downtime. **Deletion protection** blocks accidental deletes (disable it first to delete).

---

## Advanced Features

- **🔵🟢 Blue/Green Deployment** — clone production (blue) into a synced staging copy (green), test upgrades/schema changes safely, switch over with minimal downtime, roll back if needed. Only **MariaDB / MySQL / PostgreSQL**.
- **🔀 RDS Proxy** — a connection-pooling layer between app and DB; faster, handles more users, smoother failover, credentials via Secrets Manager. **Especially for serverless (Lambda)**.
- **⚡ Zero-ETL Integration** — auto-replicates RDS data to **Amazon Redshift** in near real-time for analytics/ML — no ETL pipeline. **Only RDS for MySQL 8.0.32+**.

### Log Exports
Export audit/error/general/slow-query logs to **CloudWatch Logs** (an IAM role is auto-created). From CloudWatch you can further export to **S3** for long-term retention — RDS can't write logs to S3 directly.
`,
      },
      {
        id: "rds-3",
        title: "RDS – ElastiCache & Migration (Part 3)",
        shortDesc: "ElastiCache (Redis/Memcached), cluster mode, caching strategies, restore from S3",
        visuals: ["CacheFlow", "RedisVsMemcached", "CacheDeployment", "ClusterMode", "CachingStrategies", "RestoreFromS3"],
        content: `## RDS Part 3 — ElastiCache & Migration

The **third** way to boost RDS performance (after read replicas & RDS Proxy) is **ElastiCache** — plus how to **migrate** a database into RDS via S3.

---

## ElastiCache — In-Memory Caching

**Amazon ElastiCache** is a fully-managed **in-memory** cache. Put it in front of RDS: frequently-read data is served from RAM (**sub-millisecond**), so RDS handles far fewer reads.

**How it works (the flow):**
1. User → app server (EC2)
2. App checks **ElastiCache first**
3. **Cache miss** (first time) → app queries **RDS**
4. App **populates the cache** with the result
5. Next user's request → **cache hit** — served from memory, RDS untouched

**Benefits:** up to **80× faster reads** (sub-ms latency), ~**55% cost savings** (fewer/smaller DB instances for read load), and read scaling. It's an **in-memory key-value NoSQL** store — and not just for RDS; it's a standalone caching layer for any app.

---

## Redis vs Memcached

Two cache engines:

| Feature | 🔴 Redis | 🟢 Memcached |
|---------|---------|--------------|
| Data structures | Rich (hashes, sets, **sorted sets**, **geospatial**) | Simple key-value |
| Persistence | ✅ Optional | ❌ Memory-only (lost on restart) |
| Replication / Multi-AZ | ✅ | ❌ |
| Automatic failover | ✅ | ❌ |
| Pub/Sub (real-time messaging) | ✅ | ❌ |
| Encryption at rest | ✅ | ❌ (in-transit only) |
| Auth / ACLs | ✅ | ❌ |
| Cluster mode (sharding) | ✅ | ❌ |

> The **Uber** example: Redis powers geospatial driver matching, pub/sub ride notifications, and sorted-set leaderboards — Memcached can't. **Pick Redis** for complex/real-time needs, HA, or persistence; **pick Memcached** for simple, lightweight, high-speed caching where losing data on restart is fine.

---

## Deployment Options

- **Serverless Cache** — AWS fully manages it (no nodes/shards/replicas); auto-scales; pay-as-you-go. Best for **unpredictable traffic**. Supported by both engines.
- **Design Your Own** — full control of node type, shards, replicas; pick **cluster mode enabled/disabled**. Best for **predictable workloads** and cost optimization.

---

## Cluster Mode & Shards (Redis)

- A **shard** = 1 **primary node** (handles writes) + 0–5 **replica nodes** (serve reads + auto-failover)
- **Cluster mode ENABLED** — many shards; data is **partitioned** across them (horizontal scaling, up to **500 shards**)
- **Cluster mode DISABLED** — a **single shard** holds the whole dataset
- **Cluster mode is Redis-only**

> If a primary fails, a replica is auto-promoted (HA). Replicas also offload reads (performance). Console calls it a "cluster"; the API/CLI calls a primary+replicas a **"replication group"** — same thing. **Multi-AZ & failover are Redis-only**; Memcached's extra nodes aren't true replicas (no failover, data partitioned via client hashing).

---

## Caching Strategies

**Read:**
- **Lazy Loading (cache-aside)** — app checks cache; on miss, reads DB then caches it. Only caches used data; first read is slow.
- **Read-Through** — the cache fetches from the DB on a miss (transparent to the app).

**Write:**
- **Write-Through** — write to cache **and** DB together (never stale; extra write latency)
- **Write-Around** — write to DB first; cache fills only on later read
- **Write-Behind (write-back)** — write to cache first, flush to DB later (fast writes; risk if cache fails)

**Eviction:**
- **TTL Expiration** — items auto-removed after a time-to-live (bounds staleness)

---

## Restore from S3 (Migration)

"Restore from S3" creates a **new database AND restores a \`.SQL\` dump** in one step:
1. Export source DB → \`.SQL\` dump file
2. Upload to an **S3 bucket** (same region)
3. Create an **IAM role** so RDS can read the dump (+ KMS if encrypted)
4. Choose **Restore from S3** → new instance + imported schema/data
5. Validate

> ⚠️ Restores a **.SQL dump only** — not automated backups/snapshots. **MySQL & Aurora MySQL only.** It's **offline** migration; for **live** migration use **AWS DMS** (Database Migration Service).
`,
      },
      {
        id: "dynamodb",
        title: "DynamoDB – Fundamentals (Part 1)",
        shortDesc: "NoSQL: SQL vs NoSQL, components, storage, consistency, RCU/WCU",
        visuals: ["SQLvsNoSQL", "UPICaseStudy", "CoreComponents", "TableClass", "StorageArchitecture", "ReadConsistency", "WriteConsistency", "RCUCalculator", "WCUCalculator", "CapacityMode"],
        content: `## DynamoDB – Fundamentals (Part 1)

**Amazon DynamoDB** is a fully managed, **serverless NoSQL** database built for fast storage and retrieval even at huge traffic. 1 million+ customers (Disney, Dropbox, Snap, Zoom). It is **faster than every RDS engine** (except Aurora) for key lookups, auto-scales horizontally, and is perfect for real-time apps — gaming, IoT, e-commerce.

---

## SQL vs NoSQL

**NoSQL = "Not only SQL"** — not limited to SQL queries or fixed schemas. DynamoDB is **non-relational** and stores data as **key-value pairs**.

| | SQL (Relational) | NoSQL (DynamoDB) |
|---|---|---|
| **Data structure** | Tables/rows, **fixed schema** defined first | Key-value pairs, **flexible schema** |
| **Representation** | Multiple tables joined via **foreign keys** | All data in a single item/entry |
| **Scalability** | **Vertical** (bigger server) | **Horizontal** (add servers) |
| **Use cases** | Banking, payments, accounting | Real-time apps, IoT, gaming leaderboards, big data |

> Neither replaces the other — each has its own use case.

---

## UPI Case Study — Why Both?

When Rajesh pays ₹20,000 to Anita via UPI, **two players** store data with **different** databases:

- **Banks → RDS (relational):** transactional data needs **structure**, **ACID** (Atomicity, Consistency, Isolation, Durability) for accuracy, and permanent **data integrity** (statements can't be edited).
- **UPI app (Google Pay) → DynamoDB (non-relational):** activity logs & metadata need **real-time logging** (ms latency), **high volume** (billions of logs, horizontal scale), **flexibility** (schema-less), and **speed over accuracy**.

> 📌 **Exam cheat sheet:** RDS = transactional data + ACID + fixed schema. DynamoDB = logs/metadata + speed + scalability + schema-less.

---

## Core Components & Keys

- **Table** → top-level container.
- **Item** → a single record (≈ row), identified by the primary key.
- **Attributes** → individual data fields (≈ columns) — **dynamic**, items can differ.

**Primary key types:**
- **Simple primary key** = **partition key** only → must be **unique**. DynamoDB hashes it to choose a storage partition. A good (high-cardinality) partition key spreads data across partitions → better performance.
- **Composite primary key** = **partition key + sort key** → only the **combination** must be unique. Lets one customer place many orders (same partition key, different sort key). *Sort key must be defined at table creation.*

---

## Table Class

DynamoDB charges for **storage** + **request** (read/write) costs.

- **DynamoDB Standard** — higher storage cost, **lower** request cost → best for **frequent** access (gaming dashboards, stock pricing).
- **DynamoDB Standard-IA** (Infrequent Access) — **lower** storage cost, higher request cost → best for **archival / rarely accessed** data.

> 🔁 You can switch table class anytime without affecting operations. Use CloudWatch to monitor access patterns.

---

## Distributed Storage Architecture

DynamoDB splits data across **partitions** on multiple servers (chosen by hashing the partition key).

- **Leader Node** — handles all **writes** and **strongly-consistent reads**. Always has the latest data.
- **Replica Nodes** — copies in **other AZs**. Handle **eventually-consistent reads** and provide high availability.

A write commits on the Leader, then replicates to Replicas in micro/milliseconds. Read a Replica during that lag → you might get slightly **stale** data.

---

## Read Consistency (3 models)

| Model | Data | Scope | Speed | Compute |
|---|---|---|---|---|
| **Eventually Consistent** | may be stale | 1 item/query | Fastest (uses replicas) | Lowest cost |
| **Strongly Consistent** | always latest | 1 item/query | Slower (leader only) | High |
| **Transactional** | latest, all-or-nothing | up to **25 items** in one query | Slightly slower | Highest |

---

## Write Consistency (2 models)

- **Standard write** — items written **one at a time**, independently. Risk: if step 2 fails after step 1 committed, money can be **lost**.
- **Transactional write** — **all-or-nothing**; either both updates succeed or neither happens. Costs **2×** standard. Banks always use this.

---

## RCU — Read Capacity Unit

Reads are measured in **4 KB blocks** (rounded up). Formula: **⌈item KB ÷ 4⌉ × reads/sec**, then:
- **Strongly consistent:** 1 RCU = one 4 KB item/sec (use formula as-is).
- **Eventually consistent:** **half** the RCU (1 RCU = two 4 KB items/sec).
- **Transactional:** **double** the RCU.

> ⏱️ Watch units — convert **reads/minute ÷ 60** first (3,000/min = 50/sec).

---

## WCU — Write Capacity Unit

Writes use **1 KB blocks** (rounded up). Formula: **⌈item KB⌉ × writes/sec**, then:
- **Standard:** as-is.
- **Transactional:** **double**.

> ⏱️ Same trap: convert **writes/minute ÷ 60** first.

---

## On-Demand Capacity Mode

Two capacity modes allocate RCU/WCU: **On-Demand** and **Provisioned**.

**On-Demand** auto-scales with traffic — no capacity planning, pay only per request. Best for **unpredictable/seasonal** traffic or new apps (e.g. Swiggy spiking at lunch & dinner).

> 🛡️ **Always set a maximum throughput cap** (up to 40,000 RRU/WRU). With no cap, a cyber attack or runaway traffic can scale infinitely → **huge bill**. Set a cap, monitor, raise if legitimate traffic needs it.`,
      },
      {
        id: "dynamodb-2",
        title: "DynamoDB – Advanced (Part 2)",
        shortDesc: "Provisioned, indexes, global tables, streams, backups, DAX",
        visuals: ["ProvisionedMode", "WarmThroughput", "SecondaryIndexes", "ResourcePolicy", "GlobalTables", "Backups", "ExportToS3", "StreamsTriggers", "DAXFlow", "ExamCheatSheet"],
        content: `## DynamoDB – Advanced (Part 2)

This part covers the advanced features and exam-critical scenarios of DynamoDB.

---

## Provisioned Capacity Mode

You allocate a **fixed** RCU/WCU — you pay for it whether used or not. Best for **steady, predictable** workloads where you can estimate traffic and optimize cost.

- **Under-provisioning** → requests get **throttled** (bad UX).
- **Over-provisioning** → you pay for unused capacity.
- **Auto-scaling** solves both: set a **min**, **max**, and **target utilization %** (e.g. 70%). DynamoDB scales allocated capacity up toward max when usage exceeds the target, and back down to min when traffic drops. You always pay for at least the min.

---

## Warm Throughput

Scaling capacity up **takes time** (minutes) — during which spikes cause **throttling**. **Warm Throughput** pre-allocates standby capacity so spikes are absorbed **instantly**.

- **On-Demand default:** pre-warms **12,000 RCU + 4,000 WCU** (auto-tunes to your usage pattern).
- **Provisioned default:** pre-warms the same number you provisioned.
- No one-time fee at default values; you pay only for capacity actually **used**. Raising the warm value above default = a **one-time fee for the extra** units.
- Works in both modes (and during manual scaling).

---

## Secondary Indexes (LSI vs GSI)

By default you can only query by the primary key. Secondary indexes enable **new query patterns**.

| Feature | **LSI** (Local) | **GSI** (Global) |
|---|---|---|
| Partition key | Same as base table | Can be different |
| Sort key | New sort key | Optional, any attribute |
| When created | **Only at table creation** | **Anytime** |
| Max per table | **5** | **20** |
| Capacity | Shares base table's | **Own** provisioned capacity |
| Consistency | Strong or eventual | **Eventual only** |
| Storage | Shares base partition | Separate |

**Attribute projection** (both): choose attributes to copy into the index — **All**, **Keys-only**, or **Include** (specific) — balancing speed vs storage.

---

## Resource-Based Policy

A JSON policy **attached directly to a table/index** (not to an IAM identity) controlling **who / what / under which conditions**. Great for **cross-account** access without granting full account access.

Key elements: **Effect** (Allow/Deny), **Principal** (who — IAM user/role/account ARN), **Action** (e.g. \`dynamodb:Query\`), **Resource** (table ARN), **Condition** (e.g. source IP range, time).

---

## Global Tables

Multi-region, **active-active** replication. Solves high latency for global users, lack of regional failover, and single-table bottleneck.

- Every replica is **writable**; changes replicate in ~seconds.
- Benefits: **low-latency** local reads, **high availability / DR** (auto-failover), **automatic sync**.
- Requires **DynamoDB Streams** (enabled automatically). **Eventually consistent**; conflicts resolved by **last-writer-wins** (timestamp).

---

## Backups

Protect data **without impacting performance**. Two options:

| Aspect | **PITR** (Point-in-Time Recovery) | **On-Demand Backup** |
|---|---|---|
| Trigger | Continuous / automatic | Manual (or scheduled) |
| Granularity | Any second in last 35 days | Snapshot at a point in time |
| Restore window | **Last 35 days only** | **Indefinite** (until deleted) |
| Use case | Disaster recovery, accidental change | Archival, compliance, migration |

---

## Export to S3

Export data to S3 for **analytics, compliance, archival, sharing** — no performance impact. **Requires PITR ON.**

- **Full export** — all data at current time, or from an earlier point (within last 35 days).
- **Incremental export** — only changes in a time window (must follow a full export).
- **File format:** **DynamoDB JSON** (explicit types — for re-import into DynamoDB) or **Amazon Ion** (for analytics with Athena/Glue/Redshift).
- Bucket can be same or different account. Encrypt with **SSE-S3** or **SSE-KMS**.

---

## Streams & Triggers

**DynamoDB Streams** capture every item change (insert/update/delete) as events, stored **24 hours**. A **Trigger** connects the stream to a **Lambda** for real-time actions (e.g. Amazon's instant order notifications).

> 📌 Triggers **require** Streams. Streams are also required for **Global Tables**, and log **who changed what & when** (auditing).

**DynamoDB Stream vs Kinesis Data Stream:** Streams are built-in (just toggle on), 24h retention, included in pricing — for triggers/lightweight work. Kinesis is a separate service (shards, needs setup), up to **365 days** retention, separate cost — for advanced analytics & large-scale pipelines.

---

## DAX – DynamoDB Accelerator

An **in-memory cache** for DynamoDB → up to **10× faster** reads, **milliseconds → microseconds**. The app talks to DAX (via DAX client) instead of DynamoDB.

- **Cache hit** → returned from memory in microseconds (DynamoDB untouched → less load).
- **Cache miss** → DAX fetches from DynamoDB, caches it, returns; subsequent reads are fast.
- **Write** → write-through to DynamoDB first, then DAX cache updates.

> 🎯 **Exam keywords → DAX:** "microsecond latency", "caching solution", "read-intensive", "millions of requests", "without modifying the application". Gaming, e-commerce, social media, stock-market apps.

DAX clusters: choose node family (R-type for RAM), **3+ nodes** for HA across AZs, subnet group + security group, an **IAM role** to read/write the table, encryption at rest & in transit. You don't specify tables at creation — the DAX **client** + endpoint determines which tables get cached.

---

## Exam Cheat Sheet

SAA-C03 DynamoDB questions are **scenario-based** — match keywords to services:
- *unpredictable traffic / auto-scaling* → **On-Demand mode**
- *steady & predictable / optimize cost* → **Provisioned mode**
- *private subnet / traffic stays in AWS* → **VPC Endpoint**
- *Lambda needs secure access* → **IAM Role**
- *microsecond / caching / read-intensive / millions of requests* → **DAX**
- *manual backup / retain indefinitely* → **On-Demand Backup**
- *accidental deletion / last 35 days* → **PITR**
- *multi-region / low latency global / region failover* → **Global Tables**`,
      },
      {
        id: "aurora",
        title: "Aurora",
        shortDesc: "Cloud-native MySQL/PostgreSQL-compatible high-performance DB",
        visuals: ["AuroraFeatures", "ClusterStorage3D"],
        content: `## Amazon Aurora

**Amazon Aurora** is AWS's **cloud-native** relational database — the only RDS engine built *for* the cloud rather than ported from on-prem. It combines **enterprise-grade** performance & availability with **open-source** (MySQL/PostgreSQL) cost. Amazon built it in-house after hitting performance, scaling, and licensing walls with Oracle — announced **2014**, migrated ~**75,000** databases. It's part of the RDS family.

---

## 8 Unique Features

1. **MySQL & PostgreSQL compatible** — drop-in migration, no app code changes.
2. **High performance** — up to **5×** MySQL and **3×** PostgreSQL throughput on the same instance size.
3. **Cluster storage** — distributed storage layer (not plain EBS like other RDS engines):
   - **6-way replication across 3 AZs** (automatic, no config)
   - **Auto storage scaling** 10 GB → **128 TB** (RDS caps at 64 TB with manual auto-scaling)
   - **Self-healing** — detects & repairs corruption at the storage layer
4. **Serverless** — Aurora Serverless auto-scales capacity for variable workloads.
5. **Multi-AZ by default** — automatic failover to Aurora Replicas that **also serve reads** (2-in-1: HA + performance). Plain RDS Multi-AZ single-standby gives no read offload.
6. **Global Database** — cross-region replication for low-latency global reads + disaster recovery.
7. **Aurora Machine Learning** — run ML models directly inside SQL queries.
8. **Parallel Query** — push complex analytics down to the storage layer.

> 🧊 Writes succeed with **4 of 6** copies; reads need **3 of 6** — so Aurora survives losing a full AZ plus one more copy without losing availability.`,
      },
      {
        id: "elasticache",
        title: "ElastiCache",
        shortDesc: "In-memory caching (Redis / Memcached)",
        content: `## ElastiCache

**Amazon ElastiCache** is a managed **in-memory cache** (microsecond latency) that sits in front of a database to offload reads and speed up apps. Two engines:

- **Redis** — rich data structures, **persistence**, replication, **Multi-AZ + automatic failover**, pub/sub, sorted sets, encryption. Use when you need HA or advanced features.
- **Memcached** — simple, multi-threaded, easy horizontal scaling; pure cache, no persistence/replication.

**Caching strategies:** lazy loading, write-through, TTL. Common for **session stores, leaderboards, DB query caching**.

> Redis = features + HA; Memcached = simple & scalable. Need durability/failover/pub-sub → **Redis**.`,
      },
      {
        id: "redshift",
        title: "Redshift",
        shortDesc: "Cloud data warehouse for analytics",
        content: `## Redshift

**Amazon Redshift** is a managed, petabyte-scale **data warehouse** for **OLAP / analytics** (not transactional). It uses **columnar storage** + **massively parallel processing (MPP)** for fast aggregate queries over huge datasets.

- Query with standard **SQL**; integrates with BI tools (QuickSight, Tableau).
- **Redshift Spectrum** queries data directly in **S3** without loading it.
- **Redshift Serverless** auto-scales capacity; no cluster to manage.

> Exam: "**complex analytical queries / reporting** over large structured data / data warehouse" → **Redshift**. Transactional workload → RDS/Aurora.`,
      },
      {
        id: "documentdb",
        title: "DocumentDB",
        shortDesc: "MongoDB-compatible document database",
        content: `## DocumentDB

**Amazon DocumentDB** is a managed, **MongoDB-compatible** document (JSON) database. It scales storage automatically, replicates **6 copies across 3 AZs**, and supports MongoDB drivers/tools.

- For **content management, catalogs, user profiles** — flexible JSON documents.
- Fully managed: backups, patching, Multi-AZ failover handled by AWS.

> Exam keyword: "**MongoDB-compatible** managed document database" → **DocumentDB**.`,
      },
      {
        id: "neptune",
        title: "Neptune",
        shortDesc: "Fully managed graph database",
        content: `## Neptune

**Amazon Neptune** is a managed **graph database** for highly connected data. Optimized for storing and querying **relationships**.

- Supports **property graph** (Gremlin / openCypher) and **RDF** (SPARQL).
- Use cases: **social networks, recommendation engines, fraud detection, knowledge graphs, network/IT topology**.

> Exam keyword: "**graph / relationships / social network / recommendations / fraud**" → **Neptune**.`,
      },
      {
        id: "db-overview",
        title: "AWS Database – Complete Overview",
        shortDesc: "Every AWS database service, categorized",
        visuals: ["DatabaseOverview"],
        content: `## AWS Database Services — Complete Overview

AWS offers a purpose-built database for every workload, across three families.

---

### 🗃️ Relational (SQL)
- **Amazon RDS** — fully managed MySQL, PostgreSQL, MariaDB, SQL Server, Oracle.
- **Amazon Aurora** — cloud-native MySQL/PostgreSQL-compatible; 5×/3× faster; serverless.
- **Amazon Redshift** — petabyte-scale data warehouse; columnar storage + parallel processing for analytics.
- **AWS Glue Data Catalog** — metadata repository for organizing & querying data lakes.

### 🔑 NoSQL
- **DynamoDB** — key-value & document; single-digit ms latency; real-time, gaming, IoT.
- **ElastiCache** — in-memory cache (Redis / Memcached) to accelerate apps & offload RDS.
- **MemoryDB for Redis** — durable Redis-compatible in-memory database for microservices.
- **DocumentDB** — MongoDB-compatible document database (JSON).
- **Keyspaces** — fully managed Apache Cassandra.

### ⭐ Specialized
- **Neptune** — graph database for highly connected/relationship data.
- **Timestream** — time-series database for IoT & DevOps monitoring.
- **QLDB** — immutable, cryptographically verifiable ledger; finance, supply chain, regulatory.

---

> 🎓 For SAA-C03, master **RDS**, **Aurora**, and **DynamoDB** (plus **Redshift** & **Glue** later). The remaining services only need high-level awareness.`,
      },
    ],
  },
  {
    id: "networking",
    label: "Networking & CDN",
    icon: "🌐",
    color: "#8C4FFF",
    topics: [
      {
        id: "vpc",
        title: "VPC – Virtual Private Cloud",
        shortDesc: "Isolated private network in AWS",
        visuals: ["VPCIsolationDemo", "VPCBuildSteps", "CIDRExplorer", "TwoTierArchitecture", "PrivateSubnetAccess", "NATGatewayFlow"],
        content: `## VPC – Virtual Private Cloud

A **VPC (Virtual Private Cloud)** is your own **isolated private network** inside AWS. AWS is a *public* cloud — millions of users create resources in the same Availability Zones, sometimes on the **same physical host**. The VPC is the technology that keeps every user's resources isolated and secure.

> Analogy: AWS region = the public city of **Mumbai**. Your VPC = **your home** inside that city — you decide who comes in, who goes out, and what lives inside.

---

## Why VPC Exists — The Isolation Problem

Imagine two users, **Rahul** and **Modi**, who don't know each other. Both launch an EC2 instance, and AWS's placement algorithm happens to put both on the **same physical host**.

- **Can they access each other's instance?** No.
- **Why not?** Because each instance lives in its owner's **own VPC**. Even sharing hardware, the VPC isolates them completely.

If this *weren't* true, there would be zero security and nobody would use AWS.

### The Default VPC
You never had to "set up" a VPC for your first EC2 because **AWS gives every account a default VPC in every region**. Your instances are silently created inside it.

- You **can** delete the default VPC — but then you **cannot launch an EC2 instance** until you recreate one (one click: *Actions → Create default VPC*) or build your own.
- The default VPC has limitations (you can't choose its IP range, etc.). For real apps like Swiggy/Zomato you build a **custom VPC**.

---

## The 5-Step Build Process

1. **Create the VPC** (choose "VPC only") — the isolated network container
2. **Assign an IP range (CIDR block)** — usually a private range
3. **Create subnets** — each inside one Availability Zone
4. **Attach an Internet Gateway (IGW)** — your "ISP connection"
5. **Configure the route table** — tell subnets how to reach the internet

---

## IP Addressing & CIDR

VPCs use **private IP ranges** (like on-premises networks):

| Class | Private Range | CIDR | Best for |
|-------|---------------|------|----------|
| **A** | 10.0.0.0 – 10.255.255.255 | /8 | Very large infrastructure |
| **B** | 172.16.0.0 – 172.31.255.255 | /16 | Medium infrastructure |
| **C** | 192.168.0.0 – 192.168.255.255 | /24 | Small infrastructure |

Example VPC: \`192.168.0.0/24\` (a Class C range = 256 addresses).

### The "Chocolate" Problem (Subnetting)
A VPC has **one** range. If you assign the whole range to subnet 1, there's nothing left for subnet 2 — like a parent with one chocolate and two kids. Two solutions:

1. **Add more CIDR blocks** — *Edit CIDRs* lets you add up to **5 ranges** ("buy more chocolates"). But with 6 AZs (e.g. N. Virginia) you'd run out.
2. **Subnetting** — *split* one range into smaller pieces (the scalable answer). Use a subnet calculator: e.g. \`192.168.0.0/24\` → two \`/25\` subnets of 128 IPs each.

### AWS Reserves 5 IPs Per Subnet
A \`/25\` should give 126 usable IPs, but AWS shows **123**. AWS reserves the first 4 and the last 1 of every subnet:

| Address | Reserved for |
|---------|--------------|
| .0 | Network address |
| .1 | VPC router / gateway |
| .2 | DNS |
| .3 | Future use |
| .255 (last) | Broadcast |

> **Subnets live inside one Availability Zone.** A subnet cannot span AZs (unlike Azure). You can have multiple subnets in one AZ, but never one subnet across AZs.

---

## Internet Gateway (IGW) & Route Tables

A freshly built VPC has **no internet** — like a house with no ISP connection. Your manually-created EC2 instances can't be reached even with a public IP and open security group.

### Internet Gateway
- Create an IGW, then **attach it to the VPC** (not to a subnet)
- It's **highly available**, gives **virtually unlimited** bandwidth, and is **free** to add (you pay only for outbound data transfer — **inbound traffic is always free**)

### Route Table
- AWS auto-creates a **Main Route Table**; all subnets are *implicitly* associated with it (you can't delete it)
- To get internet, add a route: **\`0.0.0.0/0\` → Internet Gateway**
- Once the route is active, public-IP instances have inbound **and** outbound internet

> **No public IP = no internet.** The Internet Gateway only works with instances that have a public IP — no inbound and no outbound otherwise.
>
> Two instances in different subnets **can** still ping each other over their **private IPs** — subnets are connected through the VPC router by default.

---

## Public vs Private Subnets (2-Tier Architecture)

Real applications use a **2-tier** design:

- **Web servers** (front-end) → **public subnets** → have a public IP, inbound + outbound internet. Users reach them directly.
- **Database servers** (back-end) → **private subnets** → no public IP, **no inbound internet**. Only the web tier talks to them. This keeps your data safe from the internet.

For **high availability**, spread across **two AZs** → 2 public subnets + 2 private subnets (4 total).

### How a subnet becomes "public"
A subnet is public **only because** its route table has a route to the Internet Gateway. The trick:
1. Keep private subnets on the **Main Route Table** (no IGW route)
2. Create a **second route table** (e.g. \`rt-public\`) with a \`0.0.0.0/0 → IGW\` route
3. Associate the **public subnets** with \`rt-public\`

A subnet can only be associated with **one** route table at a time.

---

## Accessing Instances in a Private Subnet

A private-subnet instance has no public IP, so you can't SSH to it directly. Two ways in:

### 1. EC2 Instance Connect Endpoint
- A newer VPC endpoint — connect straight from the AWS console, no extra server
- Authenticated via your **AWS username/password** (uses AWS API calls)
- **Downside:** the user must have AWS account access — not ideal if you only want to hand a freelancer a key

### 2. Bastion Host (Jump Box)
- A dedicated EC2 in a **public subnet** with a public IP
- SSH to the bastion, then "hop" to the private instance via its **private IP**
- Copy your key up with \`scp\`, then make it read-only (\`chmod 400\`) — a PEM file must not be world-readable or SSH refuses it
- Great when a teammate should get only a **PEM file**, not AWS console access

---

## NAT Gateway — Outbound Internet for Private Subnets

A private DB server still needs **outbound** internet (OS updates, install MySQL, antivirus updates) — but must stay safe from **inbound** access. A **NAT Gateway** solves this.

**Two problems it fixes:**
1. The private subnet's route table has no path to the IGW
2. The IGW only talks to resources with a **public IP** (which private instances don't have)

**How it works:**
1. Private route table sends \`0.0.0.0/0\` traffic → **NAT Gateway**
2. NAT translates the private IP to its own **public IP** (NAT = *Network Address Translator*)
3. NAT (with its public IP) reaches the **Internet Gateway** → the internet
4. Replies return the same way; NAT swaps back to the private IP — **outbound only, never inbound**

> 📍 **Placement rule:** the NAT Gateway lives in a **public subnet** (it needs the IGW), even though it serves the **private** subnets. Putting it in a private subnet would give it no internet to share.

### ⚠️ Cost Warning
Unlike most VPC components, the **NAT Gateway is chargeable**, and it holds an **Elastic IP** which is also billed. After labs:
1. **Delete the NAT Gateway**
2. **Release the Elastic IP** separately (deleting the NAT does not release it automatically)
`,
      },
      {
        id: "vpc-connectivity",
        title: "VPC – Connectivity & Security (Part 2)",
        shortDesc: "Peering, NACL vs SG, VPN, Direct Connect, Transit Gateway, Endpoints",
        visuals: ["VPCPeeringDemo", "NACLvsSecurityGroup", "StatefulVsStateless", "NACLRuleSimulator", "HybridConnectivity", "TransitGatewayMesh", "VPCEndpointExplorer"],
        content: `## VPC Part 2 — Connectivity & Security

Part 1 built a VPC. Part 2 covers how VPCs **connect** to each other and to on-premises, and the **two security layers** that protect them: VPC Peering, Network ACLs vs Security Groups, stateful vs stateless, VPN, Direct Connect, Transit Gateway, and VPC Endpoints (PrivateLink).

---

## VPC Peering

By default, **two VPCs cannot communicate** — even in the same AWS account. **Peering** creates a private link between them. It's flexible: it works **across accounts** and **across regions**.

### How to set it up
1. **Requester** VPC sends a peering request (specify account ID and/or region + the peer VPC ID)
2. **Accepter** VPC accepts the request → status becomes **Active**
3. **Add routes on BOTH sides** — each route table needs an entry pointing the *other* VPC's CIDR at the peering connection (\`pcx-…\`)

### Key rules
- The two VPCs **must have different CIDR ranges** (overlapping ranges can't be peered)
- Peering is **not transitive**: if A↔B and A↔C are peered, B still cannot reach C — you'd need a B↔C peering too
- Traffic uses the **Amazon private network** (no internet, no public IPs needed)

> If you delete the peering connection (and its routes), communication breaks immediately.

---

## The Two Security Layers: NACL & Security Group

Every packet to an instance passes **two** checks:

1. **Network ACL (NACL)** — protects the **entire subnet** (the *building's* security guard)
2. **Security Group (SG)** — protects the **instance / ENI** (the *office's* security guard)

| Aspect | 🚪 Security Group | 🏢 Network ACL |
|--------|-------------------|----------------|
| Applies to | Instance / network interface | Entire subnet |
| Rule evaluation | All rules at once (no order) | In order — **lowest rule # wins** |
| Allow / Deny | **Allow only** (rest implicitly denied) | **Allow AND Deny** rules |
| State | **Stateful** | **Stateless** |

- A new/custom NACL **denies all** inbound + outbound until you add rules
- The **default** NACL allows everything (effectively "off")
- A NACL is useless until **associated with a subnet**

> Block a port for a **whole subnet** → NACL. Allow a port for **one instance** → Security Group. Only NACLs can **explicitly deny** (e.g. block a single malicious IP while allowing everyone else).

### NACL Rule Order
Rules are evaluated in ascending number order; the **first match wins**. To deny one IP from port 80, the DENY rule must have a **lower number** than the broad ALLOW — otherwise the ALLOW matches first and the DENY never runs.

---

## Stateful vs Stateless

This is the deepest difference between SG and NACL.

- **Stateful (Security Group):** remembers connections it initiated. When your instance sends an outbound request, the **reply is automatically allowed back in** — no inbound rule needed. Lower admin burden.
- **Stateless (Network ACL):** remembers nothing. You must add rules for **both directions** — outbound for the request *and* inbound for the reply.

> Inbound traffic *from* the internet (e.g. a user opening your website on port 80) needs an inbound rule in **both** cases. The difference is only about the **return** traffic.

---

## Connecting On-Premises to AWS (Hybrid Cloud)

### Site-to-Site VPN
A tunnel over the **public internet** between your on-prem router and AWS.

- Encrypted with **IPsec** (required — it's a public network)
- Bandwidth up to **~1.25 Gbps**
- Components: **Customer Gateway** (your side's public IP) + **Virtual Private Gateway** (attached to the VPC) + **Site-to-Site VPN connection**
- Easy: download the ready-made router config from AWS, paste it into the router (e.g. Cisco), done
- Don't forget the **route table entries on both sides** (AWS side and the router)

### AWS Direct Connect
A **dedicated private fibre** line — no internet at all.

- **No encryption** (the private line is already safe; data travels as clear text)
- Bandwidth up to **~100–300 Gbps**, consistent low latency
- Provided by a partner with an **AWS edge location**; takes **30–90 days** to set up
- Lower bandwidth cost, most private option

> Exam tip: **VPN = internet + IPsec encryption**; **Direct Connect = private fibre, higher bandwidth, no encryption.**

---

## Transit Gateway

Connecting N VPCs with peering needs **N × (N−1) / 2** connections:
- 4 VPCs → 6 peerings
- 10 VPCs → **45** peerings 😵

A **Transit Gateway (TGW)** is a central **hub**. Each VPC, VPN, or Direct Connect **attaches once**, and the TGW routes traffic between them — no mesh.

### How to use it
1. Create the Transit Gateway
2. Create a **Transit Gateway Attachment** for each VPC (pick VPC + subnet)
3. Add **routes** in each VPC's route table pointing other VPC CIDRs at the TGW

> All attachments must be in the **same account and region**. For cross-account/region, create **two Transit Gateways** and **peer** them.

---

## VPC Endpoints & PrivateLink

By default, traffic from your EC2 to another AWS service (e.g. **S3** or **DynamoDB**) goes **over the public internet** via the Internet Gateway. A **VPC Endpoint** keeps it on the **AWS private network** instead — secure, low-latency, no IGW/NAT/VPN needed.

**PrivateLink** is the underlying technology that connects your VPC privately to AWS services, on-prem, or other VPCs.

### Two Endpoint Types

| | 🚪 Gateway Endpoint | 🔌 Interface Endpoint |
|--|---------------------|------------------------|
| Services | **S3 & DynamoDB only** | Most other AWS services |
| Mechanism | Target in the **route table** | ENI with a private IP |
| Route table entry | ✅ Required | ❌ Not required |
| Powered by | Gateway | PrivateLink |

> Remember the two gateway-endpoint services: **S3** and **DynamoDB**. Everything else uses an interface endpoint. (A third type — *Gateway Load Balancer endpoint* — comes with load balancers.)

### Endpoint Services (Provider → Client)
Expose **one specific service** (e.g. an app on port 80) from a **provider VPC** to a **client VPC**, privately via PrivateLink.

- Unlike **peering** (which gives full two-way access to *all* resources), endpoint services expose **only the chosen service**
- Requires a **Network Load Balancer** (or Gateway LB) in the provider VPC
- **Same region only** (cross-region needs peering too), and **TCP traffic only**
`,
      },
      {
        id: "vpc-management",
        title: "VPC – DHCP, Flow Logs & Prefix Lists (Part 3)",
        shortDesc: "DHCP option sets, VPC flow logs, managed prefix lists",
        visuals: ["DHCPOptionSetDemo", "VPCFlowLogExplorer", "ManagedPrefixListDemo"],
        content: `## VPC Part 3 — DHCP, Flow Logs & Prefix Lists

Three operational VPC features that make networks easier to manage and observe: **DHCP Option Sets**, **VPC Flow Logs**, and **Managed Prefix Lists**.

---

## DHCP Option Sets

**DHCP** (Dynamic Host Configuration Protocol) auto-assigns network settings to devices — exactly like joining hotel Wi-Fi: you enter a password and instantly receive an IP, with no manual config.

Every VPC has DHCP enabled, so any EC2 instance you launch gets a **private IP automatically** from its subnet's range. A **DHCP Option Set** lets you customise the *other* settings handed out.

### What you can / can't change

| Setting | Editable? |
|---------|-----------|
| IP address | 🔒 **No** — always auto-assigned from the subnet |
| Domain name | ✅ Yes (e.g. \`cloudfox.local\`) |
| DNS server | ✅ Yes (e.g. \`8.8.8.8\`) |
| NTP server (time sync) | ✅ Yes |
| NetBIOS / node type | ✅ Yes |

These options matter most when you run your **own Active Directory / DNS / NTP** servers.

### How to apply
1. Create a DHCP option set with your custom domain name / DNS / etc.
2. Attach it to the **VPC** (*Edit VPC settings → DHCP option set*) — it applies to **all subnets**, you can't set it per-subnet
3. On the instance, run \`ipconfig /renew\` (Windows) to pick up the new values — the IP stays the same

> To revert, re-attach the default option set, delete your custom one, and renew again.

---

## VPC Flow Logs

Flow Logs **record the traffic** flowing in and out of your VPC — between EC2 instances, through load balancers, VPN, or Transit Gateway. They're used for **troubleshooting** and **security analysis**.

### What to capture (filter)
- **ACCEPT** — only allowed traffic
- **REJECT** — only traffic blocked by a Security Group / NACL (great for spotting attacks and probing)
- **ALL** — both

### Where to send the logs

| Destination | Delivery time | Best for |
|-------------|---------------|----------|
| **Amazon S3** | ~10–15 min | Cheap storage, archival, big-data queries (Athena) |
| **CloudWatch Logs** | ~5 min | Analytics, queries, alerting (faster) |
| **Kinesis Data Firehose** | near real-time | Streaming to other systems |

### A log record contains
version, account-id, **interface-id** (the ENI/NIC), **srcaddr / dstaddr**, **srcport / dstport**, protocol, and the **action** (ACCEPT/REJECT). You can use the default format or pick only the fields you want.

- Attach a flow log to a **VPC, a subnet, or a single ENI**
- Set the aggregation interval (e.g. 10 minutes) and (for S3) partition by hour/day
- Remember: S3 delivery can take 10–15 minutes — don't panic if logs don't appear instantly

---

## Managed Prefix Lists

A **prefix list** is a named, reusable set of CIDR ranges. Instead of typing the same IPs into many security groups and route tables, you define them **once** and reference the list.

### The problem it solves
Say three servers (web :80, db :3306, storage :2049) each need the **same set of source CIDRs** allowed. Without a prefix list, you add every CIDR to **every** security group — and when a new data-center range appears, you edit **all** of them. With a prefix list, you add the new CIDR **once** and all referencing groups update automatically.

You can reference a prefix list from: **Security Groups, route tables, Transit Gateway route tables, Network Firewall, and Grafana network access.**

### Two types

| | 👤 Customer-Managed | 🟦 AWS-Managed |
|--|---------------------|----------------|
| Contents | Your own CIDR ranges | Prebuilt ranges for AWS services (S3, CloudFront, DynamoDB…) |
| Edit / delete / share | ✅ Full control, shareable across accounts | ❌ Cannot create, edit, delete, or share |
| Updates | You maintain it | Auto-updates when AWS changes service IPs |
| Typical use | Inbound **and** outbound | Mostly **outbound** (e.g. EC2 → CloudFront / S3) |
| IP version | One per list (IPv4 *or* IPv6) | IPv4 and IPv6 lists exist |

> AWS-managed lists are applied to a **region** only and make sense for **outbound** rules — e.g. "let this EC2 send traffic only to CloudFront edge locations" without ever knowing their IPs.

### ⚠️ Weight & Limits
A prefix list counts against rule limits by its **number of entries** ("weight"). CloudFront's list is ~**55** CIDRs:
- A **security group** allows ~60 rules → only ~5 left after adding it
- A **route table** allows ~50 routes → the 55-entry list **won't fit** at all

These are **soft limits** — raise them via AWS Support if needed.
`,
      },
      {
        id: "route53",
        title: "Route 53",
        shortDesc: "Scalable DNS and domain registration",
        visuals: ["DNSResolutionFlow", "FQDNAnatomy", "DNSRecordTypes", "RoutingPolicyOverview", "WeightedRoutingCalculator", "HealthCheckDemo", "GeoproximityBias", "FailoverDemo"],
        content: `## Route 53 — AWS DNS Service

**Route 53** is AWS's **DNS** (Domain Name System) service. It's named after **port 53**, the TCP/UDP port DNS uses. It resolves human-friendly **names** (like \`learn.cloudfox.in\`) into **IP addresses**, registers domains, and offers powerful **routing policies** and **health checks**.

> DNS is the **phonebook of the internet**. You dial a name; it connects you to a number (IP). Without it you'd have to memorise \`13.5.19.80\` instead of \`google.com\`.

---

## How DNS Name Resolution Works

When you open \`www.facebook.com\`, your computer must find its IP first:

1. **Your device** sends the name to a **DNS Resolver** (your ISP provides its IP via DHCP)
2. If not cached, the resolver asks a **Root Server** (13 worldwide). Root sees \`.com\` and points to the **.com TLD servers**
3. The **TLD server** returns the domain's **authoritative name server** address
4. The **Authoritative Server** (this is **Route 53**!) holds the real records and returns the IP, e.g. \`7.5.8.9\`
5. The resolver **caches** the answer and your device connects. Next time, the cache replies instantly

You only ever configure the **authoritative** server (Route 53) — the rest is the internet's shared hierarchy.

---

## FQDN — Domain Name Anatomy

A **Fully Qualified Domain Name** (max **255 chars**) reads right-to-left in hierarchy:

\`\`\`
learn  .  cloudfox  .  in
 │           │          └── TLD (top-level domain): .com, .in, .org… (fixed set)
 │           └───────────── Subdomain (the domain you register)
 └───────────────────────── DNS Label / host (max 63 chars)
\`\`\`

---

## Registering a Domain & Hosted Zones

Domains aren't free (~$5–15/yr). You can:
- **Register** directly in Route 53, **or**
- Use another registrar (GoDaddy, Namecheap…) and point its **name servers (NS)** to Route 53's 4 NS records

A **Hosted Zone** is the container for your records:
- **Public hosted zone** — resolvable over the internet (needs a registered domain)
- **Private hosted zone** — name resolution inside your VPC only

> Why use Route 53 over a registrar's DNS? **Routing policies** — the feature registrars don't offer.

---

## Record Types

| Record | Maps | Use |
|--------|------|-----|
| **A** | Name → IPv4 | The main website record |
| **AAAA** | Name → IPv6 | Same as A, for IPv6 |
| **CNAME** | Name → another name | Alias (e.g. \`test\` → \`learn\`); update once, all follow |
| **MX** | Domain → mail server | Receive email (no MX = no mail) |
| **TXT** | Name → free text | Verification, ownership, SPF/DKIM |
| **PTR** | IP → name | Reverse lookup |
| **SRV** | Service → host:port | App-specific (e.g. Active Directory) |
| **SPF** | Domain → allowed mail IPs | Anti-spoofing/phishing |

> There's also an AWS-specific **Alias** record to point at ELB / CloudFront / S3 — covered with those services.

---

## The 8 Routing Policies

Most are **active-active** (use all resources). Only **Failover** is **active-passive**.

### 1. Simple
One record. No health checks. The default for a single resource.

### 2. Weighted (Active-Active)
Split traffic by **weight** (0–255; 0 = off). Share = \`thisWeight / totalWeight × 100\`.
- Example: weights **120 / 50 / 30** → total 200 → **60% / 25% / 15%**
- Great for A/B testing and gradual rollouts

### 3. Latency (Active-Active)
Routes to the region with the **lowest latency** for the user — the *fastest network path*, not the nearest in km (though usually they correlate).

### 4. Geolocation (Active-Active)
Routes by the user's **country/continent**. India → India server, US → US server, everyone else → a **default** record. Used for localised content and compliance. (Purely location-based — ignores latency.)

### 5. Geoproximity (Active-Active)
Routes by **geographic distance**, adjustable with a **bias** to grow/shrink a region's coverage — your conscious business decision. Requires a **Traffic Policy** (~**$50/mo**).

### 6. Failover (Active-Passive) ⭐
The **only** active-passive policy. **Primary** serves all traffic; if its health check fails, Route 53 flips everyone to the **secondary** standby. Used for disaster recovery.

### 7. Multivalue Answer (Active-Active)
Returns up to **8 healthy records** at once in **round-robin**; the client picks one. Simple load spreading with health checks.

### 8. IP-Based (Active-Active)
Routes by the resolver's **source IP** (you define CIDR collections). e.g. ISP-A's IP range → server 1. Useful for session affinity and cost optimisation.

---

## Health Checks

Without health checks, Route 53 keeps handing out a **dead server's IP** — so a fraction of users fail. A health check sends **probe packets** to each endpoint; **unhealthy** ones are removed from answers.

- **Mandatory** with Weighted / Failover / Multivalue for true high availability
- When a server recovers, it automatically re-enters rotation
- Lower the record **TTL** (e.g. 60s) so clients/resolvers stop caching the dead IP quickly and pick up changes fast

> **TTL (Time To Live):** how long a resolver/computer caches a record. High TTL = faster repeat lookups but slower failover. Use \`ipconfig /flushdns\` (Windows) to clear local DNS cache when testing.
`,
      },
      {
        id: "cloudfront",
        title: "CloudFront",
        shortDesc: "Global CDN for low-latency content delivery",
        visuals: ["CDNGlobe3D", "DistributionConfig", "OriginAccessControl", "CacheHitMiss", "OriginGroupFailover", "GeoRestrictions", "CacheInvalidation"],
        content: `## CloudFront — AWS Content Delivery Network (CDN)

**CloudFront** is AWS's **CDN** — it delivers content (web pages, videos, APIs) with **low latency** and **high speed** by **caching** copies at 400+ **edge locations** worldwide. Netflix, Prime, Hotstar — all rely on CDNs.

> The problem it solves: one origin (say Mumbai) serving the whole world means distant users get high latency over slow **international bandwidth**, and the origin can be overwhelmed. CloudFront caches near users, so they fetch from a nearby edge — and the origin gets far fewer requests.

---

## How It Works

1. You point CloudFront at an **origin** (S3, S3 website, EC2, ELB, API Gateway…)
2. CloudFront caches the content at **edge locations** globally
3. A user's request goes to the **nearest edge** — if cached (a **hit**), it's served instantly; if not (a **miss**), CloudFront fetches from the origin, caches it, and serves it
4. You get one **\`*.cloudfront.net\`** URL (HTTPS free); add your own domain with an ACM cert

There are two caching layers: **Regional Edge Caches** and **Edge Locations**. **Origin Shield** adds a third centralized layer to further protect the origin (chargeable).

---

## Distribution Options

### Origin Settings
- **Origin domain** — where to fetch from (EC2 isn't auto-listed; paste its **public DNS**)
- **Origin path** — optional subfolder used as the root
- **Custom headers** — pass auth/API keys, versioning info to the origin
- **Origin Shield** — extra centralized cache layer (chargeable)

### Default Cache Behavior
- **Path pattern** — \`*\` (all) or \`images/*\` (one folder)
- **Compress objects** — auto-gzip (≈70% smaller); always on
- **Viewer protocol policy** — HTTP & HTTPS · **Redirect HTTP→HTTPS** · HTTPS only
- **Allowed HTTP methods** — GET/HEAD (static) · +OPTIONS (CORS) · ALL (dynamic CRUD)
- **Restrict viewer access** — paid/private content via **Signed URLs** (one file) or **Signed Cookies** (many files), using **trusted key groups**
- **Cache key & origin requests** — **Cache Policy** (what makes a unique cache entry) + **Origin Request Policy** (what's forwarded on a miss)
- **Response headers policy** — add/remove/modify headers: CORS, **security headers** (HSTS, CSP…), custom, server-timing

### Settings
- **Price class** — which edge locations to use (cost vs reach)
- **Alternate domain (CNAME)** + **Custom SSL cert** (ACM, must be in **us-east-1**)
- **Supported HTTP versions** — enable **HTTP/2** and **HTTP/3 (QUIC)**; CloudFront picks the best the viewer supports
- **Default root object** — \`index.html\` so the root URL resolves without typing the filename

### Function Associations
Run custom code at **4 trigger points**: **Viewer request**, **Origin request**, **Origin response**, **Viewer response**.
- **CloudFront Functions** — lightweight, JS only, sub-ms, cheap (header/URL tweaks)
- **Lambda@Edge** — heavier, multiple languages, more powerful (auth, dynamic content); created in **us-east-1**

---

## Origin Access (S3 origins)

Lock an S3 origin so content is served **only via CloudFront** (HTTPS), never the raw S3 URL:

| Mode | Security |
|------|----------|
| **Public** | Bucket exposed — accessible directly. Not best practice. |
| **OAC** (Origin Access Control) ⭐ | Bucket fully **private**; only CloudFront can read it (via bucket policy). Modern approach. |
| **OAI** (Origin Access Identity) | Legacy version of OAC — keep only for existing setups. |

> With OAC, also set a **Default Root Object** so the bucket-origin root URL works.

---

## Caching: Hit, Miss & Invalidation

- **Cache hit** — the edge has the requested variant (identified by the **cache key**) → served instantly
- **Cache miss** — not cached → CloudFront fetches from the **origin** (per the Origin Request Policy), caches it, then serves. An edge never asks another edge.
- **TTL** controls how long content stays cached
- **Invalidation** — after updating the origin, edges serve the **old** version until TTL expires. Create an invalidation (e.g. \`/*\`) to clear edge caches **immediately**. (First ~1,000/month free; or version filenames instead.)

---

## High Availability & Restrictions

### Origin Groups (Failover)
Pair a **primary** and **secondary** origin. CloudFront uses the primary; on a failover status code (500/502/503/504) it switches to the secondary, and back when the primary recovers. Use cases: **EC2 → S3** failover, or **region-to-region** with load balancers. (Remember to point the **cache behavior** at the origin group.)

### Geographic Restrictions
Allow or block viewers by **country** — an **allow list** (only these) or a **block list** (everyone except these). Blocked users get a **403**.

### Custom Error Pages
Map origin errors (e.g. 504) to a friendly custom page served from S3 — so users see "we'll be back soon" instead of a raw gateway error.
`,
      },
      {
        id: "global-accelerator",
        title: "Global Accelerator",
        shortDesc: "Anycast IPs + AWS backbone for fast multi-region routing",
        visuals: ["GlobalAcceleratorFlow", "GAComparison", "GAStructure", "GAFailover"],
        content: `## AWS Global Accelerator

**Global Accelerator** improves the **availability and performance** of global applications by giving you **2 static anycast IP addresses** and routing user traffic over the **AWS global network** instead of the public internet. It directs each user to the **nearest healthy endpoint** across regions.

> It's the "big brother" of the load balancer — a load balancer works **within** a region; Global Accelerator load-balances **across** regions.

---

## How It Works

1. Users connect to the accelerator's **2 static IPs** (they never change)
2. Traffic enters AWS at the **nearest edge location**
3. It travels the fast, private **AWS backbone** (low latency, low jitter) — not the congested public internet
4. It's delivered to the **nearest healthy region endpoint** (ALB / NLB / EC2 / Elastic IP)

It operates at the **network layer (TCP/UDP)** and does **not cache** content (that's CloudFront's job).

---

## Key Features

- **2 static anycast IPs** — fixed entry points (great for IP allow-lists, firewalls)
- **AWS global network** — optimized routing, lower latency & jitter
- **Fast regional failover** — reroutes in seconds (no DNS TTL caching delay)
- **Continuous health checks** — unhealthy endpoints are removed automatically
- **Traffic dials & weights** — control how much traffic each region/endpoint receives

---

## Global Accelerator vs CloudFront vs Route 53

| | 🚀 Global Accelerator | 🌍 CloudFront | 🧭 Route 53 |
|--|----------------------|---------------|-------------|
| Type | Network accelerator | CDN (caching) | DNS |
| Layer | TCP/UDP (L4) | HTTP/HTTPS (L7) | DNS |
| Caches? | ❌ | ✅ | ❌ |
| Static IPs? | ✅ (2 anycast) | ❌ | ❌ |
| Failover | Fast (seconds) | Origin failover | Slower (DNS TTL) |
| Best for | Non-HTTP, multi-region, static IPs, gaming/IoT/VoIP | Cacheable web content, video | Geo/latency/weighted DNS routing |

> Rule of thumb: cacheable web content → **CloudFront**; DNS-level routing → **Route 53**; TCP/UDP acceleration + static IPs + instant multi-region failover → **Global Accelerator**.

---

## Anatomy of an Accelerator

It nests:
- **Accelerator** — the top resource (gets the 2 static IPs + a DNS name)
- **Listener** — a port + protocol (e.g. TCP :80)
- **Endpoint Group** — **one per region**, with a **traffic dial** (0–100%) capping that region's share
- **Endpoints** — the actual targets inside a group (ALB / NLB / EC2 / EIP), with optional **weights**

By default each group is dialed to 100% (route to the nearest region); lower a dial to shift traffic away (maintenance, gradual cutover).

---

## Super Lab — Multi-Region HA

A complete real-world build:
1. **Two regions** (e.g. India + USA), each with a **VPC** (public + private subnets, IGW, NAT, route tables)
2. **Web servers** across **2 AZs** per region in **private subnets** (in-region high availability)
3. An **Application Load Balancer** per region in the public subnets
4. One **Global Accelerator** with an **endpoint group per region**, each pointing at that region's ALB

**Result:**
- Users hit their **nearest region** (Mumbai/Singapore → India; Virginia/Brazil → USA) — low latency, localized experience
- If a whole **region fails**, Global Accelerator reroutes **everyone** to the surviving region — **no downtime**, same static IPs
- Make sure each ALB's **health check** passes, or the endpoint group shows unhealthy
`,
      },
      {
        id: "api-gateway",
        title: "API Gateway & Application Integration",
        shortDesc: "Single entry point for APIs; REST/HTTP/WebSocket",
        visuals: ["AppIntegration", "MonoMicroScaling", "SyncVsAsync", "APIGatewayConcept", "APITypes", "RestVsHttp", "WebSocketDemo", "CRUDFlow"],
        content: `## API Gateway & Application Integration

### Application Integration

Connecting different applications/services so they exchange data reliably, **decoupled** and scalable. Two flavors:
- **App-to-App** — separate systems (often different companies) coordinating, e.g. UPI app ↔ NPCI ↔ bank; Skyscanner ↔ airline.
- **Microservice-to-Microservice** — independent services inside one app, e.g. order → cart → payment → notification. They can't share functions or a DB, so they talk via **APIs, queues, events & messages**.

> ~99% of modern apps are microservices — integration is how the pieces talk. Heavily tested in SAA-C03.

---

### Monolithic vs Microservices

- **Monolithic** — one codebase/deploy/DB. A small change redeploys everything, and you must scale the **whole** app together (wasteful).
- **Microservices** — scale each part to its own demand. Amazon sale: Browse for 100K, Cart for 10K, Checkout for 4K, Pay for only 2K → optimized cost/performance, faster deploys, tech flexibility.

---

### Synchronous vs Asynchronous

- **Synchronous (real-time)** — sender **waits** for a reply before continuing (like a phone call). Use when the next step depends on the answer. **AWS:** API Gateway, ALB.
- **Asynchronous (no waiting)** — sender sends a message and **continues**; receiver handles it later (like WhatsApp). Use for notifications, inventory updates, retries. **AWS:** SQS, SNS, EventBridge.

---

## API Gateway

A fully managed service that's the **single entry point** for all backend APIs. Clients never hit backends directly — the gateway **secures, throttles, routes & logs** every request, then forwards to the right backend (Lambda, EC2, ECS/EKS).

> 🚕 **Uber:** one gateway in front of many APIs (driver location, ride request, fare, payment, trip history, notifications) to secure them, throttle peak traffic, block suspicious requests, and manage versions.

---

## The 4 API Types

- **HTTP API** — request/response; faster & ~70% cheaper, fewer features. Simple/low-cost APIs.
- **REST API** — request/response with the full advanced feature set. More expensive.
- **REST API (Private)** — same as REST but VPC-only.
- **WebSocket API** — persistent, two-way, real-time (connection stays open).

---

## REST vs HTTP API (the exam decision)

| Feature | REST | HTTP |
|---|---|---|
| API keys | ✅ | ❌ |
| IAM auth | ✅ | ❌ |
| Cognito auth | ✅ | ✅ |
| JWT/OAuth (native) | ❌ | ✅ |
| Throttling | ✅ advanced | ⚠️ basic |
| WAF | ✅ direct | ⚠️ via CloudFront |
| Request/response transform | ✅ | ❌ |
| Input validation | ✅ | ❌ |
| Mapping templates (VTL) | ✅ | ❌ |
| Caching | ✅ | ❌ |
| ALB integration | ❌ | ✅ |
| Private API | ✅ | ❌ |
| Cost / Speed | Expensive / slower | ~70% cheaper / faster |

> Need **transform, validation, mapping templates, caching, API keys, or private API**? → **REST**. Want **cheap & fast** with JWT/OAuth or ALB? → **HTTP**. (CloudWatch logs & Lambda/HTTP integration: both.)

---

## WebSocket API

REST/HTTP close after each response; **WebSocket keeps the connection open** for continuous two-way messaging.

> **Keywords → WebSocket:** "real-time", "two-way", "long-lived connection". Use cases: live chat, notifications/dashboards, gaming, collaboration (Zoom, Google Docs), delivery tracking. Supports Lambda, JWT & Cognito; **no** ALB, API keys, WAF, or caching.

---

## CRUD & the Flow

**CRUD** = Create (\`POST\` → PutItem), Read (\`GET\` → GetItem/Scan), Update (\`PUT\` → UpdateItem), Delete (\`DELETE\` → DeleteItem).

A website **can't** talk to DynamoDB directly (no public access). The flow: **Website → API Gateway → Lambda (CRUD logic) → DynamoDB**. One API Gateway exposes all four CRUD endpoints with a clean URL, auth, logs & throttling.`,
      },
      {
        id: "api-gateway-2",
        title: "API Gateway – Advanced (Part 2)",
        shortDesc: "Endpoints, TLS, resources/methods, security, canary, custom domains",
        visuals: ["EndpointTypes", "SecurityPolicyTLS", "ResourcesMethods", "IntegrationTypes", "MethodRequestSettings", "SecurityLayers", "APIKeysUsagePlan", "CanaryDeployment", "CustomDomain"],
        content: `## API Gateway – Advanced (Part 2)

Deep dive into REST API configuration and security.

---

## REST API Endpoint Types

An API has exactly **one** endpoint type:
- **Regional** — deployed in one region; clients hit it directly. Best for nearby users (higher latency for far users).
- **Edge-Optimized** — fronted by **CloudFront**; users hit the nearest edge → routed to your region. Best for global users (slightly pricier).
- **Private** — VPC-only, via a VPC interface endpoint. For internal APIs.

> Need both public & VPC access? Create two APIs.

---

## TLS Security Policy & Endpoint Access Mode

**TLS** encrypts the client↔API tunnel (= HTTPS). The **security policy** sets the minimum TLS version: **1.2** (modern), **1.3** (faster/most secure — prefer it), plus **FIPS** (US gov), **PFS** (key per connection), **PQC** (quantum-safe).

**Endpoint access mode** (with enhanced policies):
- **Basic** — allow all.
- **Strict** — blocks **domain fronting** (where the TLS **SNI** ≠ the HTTP **Host** header) and enforces the matching endpoint type. For edge-optimized, CloudFront handles this. Policies apply to the default invoke URL; custom domains have their own.

---

## Resources & Methods

REST uses a tree: **Resources** (URL paths) contain **Methods** (HTTP verbs), and **all advanced features live at the method level**.
- Root resource \`/\` is auto-created and can't be deleted; child resources (e.g. \`/users\`, \`/users/{id}\`) live inside it.
- Method types: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS (CORS), and **ANY** (one backend for all verbs).

---

## Integration Types & Proxy

**Integration** = where a method sends the request: **Lambda** (most popular), **HTTP** (public endpoint), **Mock** (fixed response for testing), **VPC Link** (private backends via NLB v1 / ALB v2), **AWS Service** (call S3/DynamoDB/SQS/SNS/Kinesis directly — REST supports far more than HTTP API).

**Proxy integration** (Lambda/HTTP/VPC link):
- **ON** ("courier") — forwards the full request unchanged; backend does everything. ~90% of modern APIs.
- **OFF** ("office worker") — gateway can transform/filter request & response (for legacy backends). Configure response mode (**buffered** vs **streamed**) and an **integration timeout** (504 if backend too slow).

---

## Method Request Settings (the security gate, before backend)

- **Authorization** — **None** (public) / **AWS IAM** (SigV4) / **Cognito** (JWT) / **Lambda authorizer** (custom). Fail → 401.
- **Request Validator** — checks the **body** (JSON payload, for POST/PUT), **query string** (e.g. \`?id=101\`, for GET), and **headers** (e.g. \`x-api-key\`).

---

## Security — 4 Layers

1. **Usage Control** — API Keys + Usage Plans (identify clients, throttle + quota).
2. **Access Control** — Resource Policy (who/where: IP, VPC, AWS account — not auth).
3. **Edge Protection** — AWS WAF (layer-7: SQL injection, XSS, bad bots).
4. **Auth & Authz** — IAM / Cognito / Lambda authorizer.

> Order: Resource Policy → WAF → Usage Plan → Authorizer.

---

## API Keys & Usage Plans

An **API key** (string sent as \`x-api-key\`) identifies a client; it needs a **usage plan** that sets **throttling** (rate + burst) and **quota** (per day/week/month).

> **Error codes (exam):** missing/invalid key or blocked by policy → **403 Forbidden**; throttle/quota exceeded → **429 Too Many Requests**. Keys only *identify* (not authentication) and don't restrict origin. Full on REST, limited on HTTP API.

---

## Canary Deployment

Release safely: send a small % of traffic to the new version, keep the rest on stable, watch metrics, then promote or roll back. Configured at the **stage** level, works with **Lambda aliases** (not versions), **REST API only**.

---

## Custom Domain & Routing Modes

Use your own domain (e.g. \`api.company.com\`) — HTTPS-only, needs an **ACM certificate** matching the domain (edge → **us-east-1**; regional → same region) and a DNS record (**Alias** for Route 53, **CNAME** for external).

**Routing modes:**
- **API Mapping only** — simple path-based (e.g. \`/user\` → API/stage). REST/HTTP/WebSocket.
- **Routing Rules only** — conditional on path **+ headers** (e.g. \`/user\` + \`x-env:dev\`), with **priority** (lower = higher). REST only.
- **Rules → Mapping** — rules first, fall back to mappings (add conditions without breaking existing setup).

> **mTLS** (mutual TLS) — custom domains only (regional); verifies the **client's** certificate too. For high-security APIs.`,
      },
      {
        id: "elb",
        title: "ELB – Elastic Load Balancing",
        shortDesc: "Distribute traffic across targets",
        visuals: ["LoadBalancerBasics", "LBTerminology", "LBTypeComparison", "ALBRouting", "CrossZoneLB", "GatewayLBFlow"],
        content: `## ELB – Elastic Load Balancing

A **Load Balancer** distributes incoming traffic across multiple targets (EC2 instances), improving availability and letting your servers stay **private**.

> Prerequisite: VPC with public & private subnets, internet gateway, NAT gateway. See the VPC topics first.

---

## Why Use a Load Balancer?

Say you run two web servers in two AZs for high availability. You *could* balance them with Route 53, but a load balancer is better:

- **Spread traffic** across any number of instances
- Keep EC2 instances in **private subnets** with **no public IP** — the LB (in the public subnet) is the only public door
- Built-in **health checks** automatically remove unhealthy instances from rotation (and re-add them when they recover)
- **HTTPS offload** — terminate TLS at the LB so instances don't need certificates

---

## Terminology

| Term | Meaning |
|------|---------|
| **Listener** | Watches a protocol+port (HTTP:80 / HTTPS:443) for incoming requests |
| **Target Group** | The backend resources: EC2 instances, IPs, Lambda, or another ALB |
| **Health Check** | Probes targets; **default protocol is HTTP**. Unhealthy targets are dropped |
| **Internet-facing** | Public DNS name — reachable from the internet |
| **Internal** | Reachable only inside the VPC |

> Listener port and target port can differ (e.g. listen on 80, forward to 8080). HTTPS on the listener lets the LB handle encryption — something Route 53 cannot do.

---

## The 4 Load Balancer Types

| Type | Layer | Protocols | Best for |
|------|-------|-----------|----------|
| **Application LB (ALB)** | 7 | HTTP, HTTPS, gRPC | Web apps with smart path/host routing |
| **Network LB (NLB)** | 4 | TCP, UDP, TLS | Extreme performance, millions of req/s, ultra-low latency |
| **Gateway LB (GLB)** | 3 | IP packets | Inline virtual appliances (firewalls, IDS/IPS) |
| **Classic LB (CLB)** | 4 & 7 | HTTP, HTTPS, TCP | Legacy / previous generation — avoid |

---

## Application Load Balancer (Layer 7)

Operates on **HTTP/HTTPS**, so it can make smart routing decisions on the **URL**. The big win over Classic LB: **one** ALB can serve many targets via rules — no need for one LB per route.

### Path-based vs Host-based Routing

| | Path-based | Host-based |
|--|-----------|-----------|
| Example | \`cloudfox.in/aws\` | \`aws.cloudfox.in\` |
| Decides on | URL **path** (after the slash) | **Hostname** (subdomain) |
| DNS | Easy — one record | A record per host/subdomain |
| Certificates | One covers all paths | May need multiple |

> Memory hook: **slash = path**, **subdomain (dot) = host**. e.g. \`order.example.com\` is host-based; \`example.com/orders\` is path-based.

Routing is configured with **listener rules** (condition → target, with a priority). The **default rule** (lowest priority) catches anything unmatched.

---

## Network Load Balancer (Layer 4)

Operates on **TCP/UDP/TLS** — no understanding of URLs. In exchange you get **millions of requests/sec** and **ultra-low latency** — ideal for gaming servers and high-throughput systems.

### ALB vs NLB

| Feature | ALB (L7) | NLB (L4) |
|---------|----------|----------|
| Protocols | HTTP/HTTPS/gRPC | TCP/UDP/TLS |
| Path/Host routing | ✅ | ❌ |
| Sticky sessions | ✅ | ✅ |
| Idle connection timeout | ✅ | ❌ |
| WebSocket | ✅ | ✅ |
| **Static IP** | ❌ | ✅ (Elastic IP) |
| Routing decision | URL + cookies | Source-IP hash |

> **Exam favourites:** NLB supports a **static (Elastic) IP**; ALB does not. NLB routes by **source-IP hash**, so the same client tends to hit the same target.

---

## Cross-Zone Load Balancing

The LB places a **node in each AZ**, and incoming traffic splits **50/50** across nodes.

- **OFF:** a node serves only targets in **its own AZ**. If AZs have different target counts, load is **uneven** (e.g. AZ-A's 2 targets get 25% each while AZ-B's 8 targets get 6.25% each).
- **ON:** any node serves **any** target — perfectly **even** distribution.

**Defaults:**
- **ALB → always ON** (can't fully disable)
- **NLB & GLB → OFF by default** (enable later via *Edit attributes*)

---

## Gateway Load Balancer (Layer 3)

Routes **raw IP packets** through **virtual appliances** — third-party **firewalls / IDS / IPS** like Palo Alto, Fortinet, or Sophos (available as AWS Marketplace AMIs, often BYOL).

It has **two components**: the **Gateway Load Balancer** and a **GWLB Endpoint**.

**Traffic flow:**
1. User → **GWLB Endpoint**
2. Endpoint → **Gateway Load Balancer**
3. GWLB → **security appliance** (e.g. Palo Alto firewall) for inspection
4. Appliance approves → back to GWLB → endpoint
5. Clean traffic → **application server**

> Unlike ALB/NLB, a GWLB lets you insert firewalls **inline** to inspect all inbound and outbound VPC traffic — bringing existing on-prem security tools and licenses into AWS.
`,
      },
      {
        id: "elb-gwlb-classic",
        title: "ELB – Gateway LB & Classic (Part 2)",
        shortDesc: "VPC ingress routing, Gateway LB architecture, Classic LB",
        visuals: ["IngressRoutingDemo", "GWLBArchitecture", "ClassicLBComparison"],
        content: `## Load Balancer Part 2 — Gateway LB Deep Dive & Classic LB

Part 1 covered ALB, NLB, and the GLB concept. Part 2 goes deeper: **VPC ingress routing** (the foundation of GLB), the full **two-VPC Gateway Load Balancer architecture**, and the legacy **Classic Load Balancer**.

---

## VPC Ingress Routing

Normally, traffic flows straight from the **Internet Gateway** to your servers — you can't insert anything in between (you can use AWS-native firewalls, but not a third-party appliance).

Many companies want their existing **Palo Alto / Checkpoint / Cisco / Fortinet** firewalls in AWS too. **Ingress routing** makes this possible.

### How it works
- You add an **Internet Gateway route table** — a special route table **associated with the IGW** (not a subnet)
- It routes the **app subnet's CIDR** to the firewall appliance's **network interface (ENI)** instead of the server directly
- The firewall is **transparent**: the client uses the server's normal public IP; the appliance doesn't change the packet's source/destination — it just inspects it
- The reply returns the same path

### Critical setup detail
You must **disable the source/destination check** on the appliance, so it's allowed to forward traffic it didn't originate (it acts as a router/firewall).

### The single-appliance problem
If you route everything through **one** appliance and it goes down, **every** server becomes unreachable — the appliance is the only entrance. The fix: **multiple appliances across AZs**, load-balanced and auto-scaled by a **Gateway Load Balancer**.

---

## Gateway Load Balancer — Full Architecture

A GWLB is **not** like ALB/NLB (which balance app servers). It **load-balances the fleet of security appliances**, handles their **high availability**, and **auto-scales** them.

### Two components
1. **Gateway Load Balancer** — has **no URL or IP**
2. **GWLB Endpoint** — the "assistant"; the *only* way to communicate with the GWLB

### Best practice: two VPCs
| VPC | Contains |
|-----|----------|
| **Service Provider VPC** | The GWLB + the fleet of security appliances |
| **Service Consumer VPC** | A GWLB Endpoint, ingress route table, and the app servers |

**Why two VPCs?** One central security fleet can protect **many** consumer VPCs — you don't duplicate firewalls and a GWLB in every VPC. The two VPCs connect via a **PrivateLink endpoint service** (no peering needed).

### Traffic flow
1. User → Service Consumer VPC
2. **Ingress route table** → **GWLB Endpoint**
3. Endpoint → (PrivateLink) → **Gateway Load Balancer** in the provider VPC
4. GWLB load-balances to a **security appliance**
5. Appliance inspects (via the **Geneve** protocol, **UDP port 6081**) and approves
6. Traffic returns via GWLB → endpoint → **app server**; replies follow the reverse path

> **Geneve / UDP 6081:** before choosing any third-party appliance, confirm it supports **Geneve** — that's how the GWLB and appliances communicate. Health checks remove unhealthy appliances; if one dies, traffic flips to another automatically.

---

## Classic Load Balancer (Previous Generation)

The **Classic Load Balancer (CLB)** was built for the old **EC2-Classic** network — the flat, shared network that existed **before VPC**. AWS now marks CLB **previous generation** and steers everyone to **ALB / NLB**.

### EC2-Classic vs Amazon VPC

| Aspect | EC2-Classic | Amazon VPC |
|--------|-------------|------------|
| Network | Shared with other customers | Logically isolated |
| IP addressing | Public IP by default, internet-reachable | You choose (public/private subnets) |
| Security groups | Inbound only, fixed at launch | Inbound + outbound, editable anytime |
| Subnets | ❌ Not supported | ✅ Public & private |
| Control | Limited | NACLs, SGs, route tables |
| VPN / Direct Connect | ❌ No | ✅ Yes |

### EC2-Classic Retirement Timeline
- **Dec 4, 2013** — new accounts became VPC-only
- **Oct 30, 2021** — EC2-Classic disabled in regions with no active Classic resources
- **Aug 15, 2022** — target completion; EC2-Classic fully retired

> CLB lacks path/host routing, WebSockets, and container support (you'd need one CLB per rule). It **won't appear in the SAA-C03 exam**, but may come up in interviews. For anything new, use **ALB** (Layer 7) or **NLB** (Layer 4).
`,
      },
      {
        id: "direct-connect",
        title: "Direct Connect",
        shortDesc: "Dedicated network connection to AWS",
        content: `## Direct Connect

**AWS Direct Connect (DX)** is a **dedicated, private fibre connection** from your data center to AWS — bypassing the public internet for **consistent low latency, higher bandwidth, and lower data-transfer cost**.

- Takes weeks to provision (physical link via a DX location).
- For **hybrid cloud, large/steady data transfer, latency-sensitive** workloads.
- **VPN over DX** adds encryption (DX itself is private but not encrypted).

> DX = private/consistent but slow to set up & costly. **Site-to-Site VPN** = quick, cheap, over the internet. Need a backup for DX → a VPN.`,
      },
      {
        id: "transit-gateway",
        title: "Transit Gateway",
        shortDesc: "Connect VPCs and on-premise networks",
        content: `## Transit Gateway

**AWS Transit Gateway (TGW)** is a **network hub** that connects many **VPCs** and **on-prem** networks through a single gateway — replacing a messy full mesh of VPC peering connections.

- **Hub-and-spoke** routing; supports thousands of VPCs.
- Connects VPCs, **Site-to-Site VPN**, and **Direct Connect**; can route across **regions** (peering).
- Centralizes routing, security inspection, and simplifies management.

> Exam: "connect **many VPCs** / hybrid network at scale without complex peering" → **Transit Gateway**.`,
      },
    ],
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: "devtools",
    label: "Developer Tools & CI/CD",
    icon: "🛠️",
    color: "#1A9C3E",
    topics: [
      {
        id: "codecommit",
        title: "CodeCommit",
        shortDesc: "Managed Git repositories",
        content: `## CodeCommit

**AWS CodeCommit** is a managed, private **Git repository** service — like a hosted GitHub inside AWS. Secure (IAM, KMS encryption), scalable, integrates with the rest of the **Code\*** CI/CD suite.

- Access via HTTPS/SSH; supports pull requests, branches, triggers (→ Lambda/SNS).

> The "source" stage in an AWS-native CI/CD pipeline. (Pairs with CodeBuild → CodeDeploy → CodePipeline.)`,
      },
      {
        id: "codebuild",
        title: "CodeBuild",
        shortDesc: "Fully managed build service",
        content: `## CodeBuild

**AWS CodeBuild** is a fully managed **build service** — it compiles source, runs tests, and produces deployable artifacts. No build servers to manage; **pay per build minute**.

- Build steps defined in a **buildspec.yml**.
- Scales automatically; integrates with CodeCommit/GitHub and CodePipeline.

> The "build/test" stage of CI/CD. Serverless build → **CodeBuild**.`,
      },
      {
        id: "codedeploy",
        title: "CodeDeploy",
        shortDesc: "Automated application deployments",
        content: `## CodeDeploy

**AWS CodeDeploy** automates **application deployments** to EC2, on-prem servers, ECS, or Lambda — with strategies that minimize downtime and enable rollback.

- **Deployment styles:** **In-place** (update existing instances) and **Blue/Green** (new fleet, then switch).
- **Traffic shifting** for Lambda/ECS: **Canary** (% then rest) and **Linear** (gradual).
- Automatic **rollback** on failure (CloudWatch alarms).

> The "deploy" stage of CI/CD. Safe rollout with rollback → **CodeDeploy**.`,
      },
      {
        id: "codepipeline",
        title: "CodePipeline",
        shortDesc: "Continuous delivery pipeline",
        content: `## CodePipeline

**AWS CodePipeline** is the **CI/CD orchestrator** that ties the stages together: **Source → Build → Test → Deploy**, triggered automatically on every code change.

- Integrates **CodeCommit/GitHub → CodeBuild → CodeDeploy** (and manual-approval, CloudFormation, ECS, Lambda stages).
- Models the full release workflow; each commit flows through automatically.

> Exam: "**automate the whole release process / CI-CD pipeline**" → **CodePipeline** (the conductor; the Code\* services are the players).`,
      },
      {
        id: "cloudformation",
        title: "CloudFormation",
        shortDesc: "Infrastructure as Code (IaC)",
        content: `## CloudFormation

**AWS CloudFormation** is **Infrastructure as Code (IaC)** — you describe your AWS resources in a **template** (YAML/JSON) and CloudFormation provisions them as a managed **stack**, repeatably and consistently.

- **Declarative**: define the desired end state; CloudFormation figures out the order (dependencies).
- **Change Sets** preview updates; **automatic rollback** on failure; **drift detection**.
- Reusable across environments/regions; **StackSets** deploy to many accounts/regions.
- **Free** — pay only for the resources created.

> Exam: "**provision infrastructure repeatably / as code**, AWS-native, declarative" → **CloudFormation**.`,
      },
      {
        id: "cdk",
        title: "CDK – Cloud Development Kit",
        shortDesc: "Define cloud infra using familiar languages",
        content: `## CDK – Cloud Development Kit

**AWS CDK** lets you define infrastructure using **real programming languages** (TypeScript, Python, Java, C#, Go) instead of YAML/JSON. Your code **synthesizes into a CloudFormation template** and deploys as a stack.

- Use loops, conditions, functions & **reusable constructs** to build infra.
- Higher-level abstractions than raw CloudFormation (sensible defaults).

> CDK (code) vs CloudFormation (templates): both end up as CloudFormation stacks. Prefer real code & abstractions → **CDK**.`,
      },
    ],
  },
  {
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
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📈",
    color: "#00A1C9",
    topics: [
      {
        id: "athena",
        title: "Athena",
        shortDesc: "Query S3 data with SQL",
        content: `## Athena

**Amazon Athena** is **serverless, interactive SQL queries directly on data in S3** — no servers, no loading. You **pay per query** (per TB scanned).

- Uses **Presto**; works with CSV, JSON, Parquet, ORC. Pair with the **Glue Data Catalog** for table schemas.
- Tip: use **columnar formats (Parquet) + partitioning + compression** to scan less data = cheaper/faster.

> Exam: "**query S3 data with SQL, serverless, ad-hoc, no infrastructure**" → **Athena**. (Heavy/continuous warehousing → Redshift.)`,
      },
      {
        id: "glue",
        title: "AWS Glue",
        shortDesc: "Serverless ETL and data integration",
        content: `## AWS Glue

**AWS Glue** is a serverless **ETL** (extract, transform, load) and data-integration service for preparing data for analytics.

- **Glue Crawlers** auto-discover schemas and populate the **Glue Data Catalog** (central metadata used by Athena, Redshift Spectrum, EMR).
- Run **Spark/Python** ETL jobs serverlessly; no clusters to manage.

> Exam: "**ETL / discover schema / catalog data / prepare data** serverlessly" → **Glue**. The **Data Catalog** is the shared metadata store.`,
      },
      {
        id: "quicksight",
        title: "QuickSight",
        shortDesc: "Business intelligence and data visualization",
        content: `## QuickSight

**Amazon QuickSight** is a serverless **business intelligence (BI)** service — build interactive **dashboards & visualizations** from your data.

- Connects to S3, Athena, Redshift, RDS, Aurora and more; **SPICE** in-memory engine for fast queries.
- **ML Insights** (anomaly detection, forecasting) and **Q** (natural-language questions).

> Exam keyword: "**dashboards / data visualization / BI reports**" → **QuickSight**.`,
      },
      {
        id: "emr",
        title: "EMR – Elastic MapReduce",
        shortDesc: "Big data with Hadoop / Spark",
        content: `## EMR

**Amazon EMR (Elastic MapReduce)** is a managed **big-data platform** for running open-source frameworks — **Apache Spark, Hadoop, Hive, Presto, HBase** — on scalable clusters (EC2, EKS, or **EMR Serverless**).

- For **massive-scale data processing, ML, large ETL** over petabytes.
- Can use **Spot** instances to cut cost; integrates with S3 (data lake).

> Exam: "run **Spark/Hadoop / huge-scale big-data processing**" → **EMR**. (Simple S3 SQL → Athena; managed ETL → Glue.)`,
      },
      {
        id: "opensearch",
        title: "OpenSearch Service",
        shortDesc: "Search and analytics (Elasticsearch fork)",
        content: `## OpenSearch Service

**Amazon OpenSearch Service** (formerly Elasticsearch Service) is managed **search, log analytics & observability**. Store, search, and visualize large volumes of data in near-real-time, with built-in **OpenSearch Dashboards** (Kibana).

- Use cases: **full-text search, log/event analytics, application & infrastructure monitoring, SIEM**.
- Often fed by **Kinesis Data Firehose** or CloudWatch Logs.

> Exam keyword: "**search / analyze logs in near-real-time / dashboards over log data**" → **OpenSearch**.`,
      },
    ],
  },
  {
    id: "global-infra",
    label: "Global Infrastructure",
    icon: "🌍",
    color: "#FF9900",
    topics: [
      {
        id: "regions-az",
        title: "Regions & Availability Zones",
        shortDesc: "AWS global physical infrastructure",
        content: `## Regions & Availability Zones

AWS's **global infrastructure** is the foundation of resilient design.

- **Region** — a geographic area (e.g. Mumbai \`ap-south-1\`). Isolated from other regions; choose based on **latency to users, data-residency/compliance, cost, and service availability**.
- **Availability Zone (AZ)** — one or more discrete data centers within a region, with independent power/cooling/networking, connected by low-latency links. Regions have **2–6 AZs**.
- **High availability** = deploy across **multiple AZs** (e.g. Multi-AZ RDS, ELB + Auto Scaling across AZs). **Disaster recovery** = across **multiple Regions**.

> Exam: protect against a data-center failure → **multi-AZ**; protect against a whole-region failure → **multi-region**.`,
      },
      {
        id: "edge-locations",
        title: "Edge Locations & Local Zones",
        shortDesc: "Low-latency delivery points",
        content: `## Edge Locations & Local Zones

Beyond Regions/AZs, AWS has infrastructure closer to users:

- **Edge Locations** — hundreds of sites worldwide used by **CloudFront** (CDN cache), **Route 53**, **Global Accelerator** and **AWS WAF/Shield** to deliver content and DNS with **low latency**.
- **Regional Edge Caches** — larger caches between edge locations and the origin to improve cache hit ratio.
- **Local Zones** — place compute/storage in large metro areas **close to end users** for single-digit-millisecond latency (e.g. gaming, live media).
- **Wavelength** — AWS infrastructure inside **5G** networks for ultra-low-latency mobile apps.
- **Outposts** — AWS hardware **on-premises** for hybrid / data-residency needs.

> Exam: "cache content near users / reduce latency globally" → **CloudFront edge locations**. "very low latency in a specific city" → **Local Zones**.`,
      },
      {
        id: "shared-responsibility",
        title: "Shared Responsibility Model",
        shortDesc: "Who is responsible for what in AWS",
        content: `## Shared Responsibility Model

Security in AWS is **shared** between AWS and you:

- **AWS — security OF the cloud:** the physical data centers, hardware, the global network, and the managed-service software (hypervisor, managed DB engine patching, etc.).
- **You — security IN the cloud:** your **data**, **IAM users/permissions**, **OS/network/firewall config** (security groups, NACLs), **encryption** choices, and application code.

The line shifts by service type:
- **IaaS (EC2):** you patch the OS, configure firewalls, manage everything above the hypervisor.
- **Managed (RDS):** AWS patches the OS/engine; you manage data, access, and network config.
- **Serverless (Lambda, S3):** AWS manages most of the stack; you still own **data, IAM & encryption**.

> Exam: **patching the guest OS of EC2** = customer. **Physical security / hypervisor** = AWS. **Your data & IAM** = always the customer.`,
      },
      {
        id: "well-architected",
        title: "Well-Architected Framework",
        shortDesc: "Six pillars for building on AWS",
        content: `## Well-Architected Framework

AWS's set of best practices for designing good systems, organized into **6 pillars**:

1. **Operational Excellence** — run & monitor systems, automate, improve (IaC, observability).
2. **Security** — protect data & systems (least privilege, encryption, traceability).
3. **Reliability** — recover from failure, scale, meet demand (multi-AZ, backups, auto-recovery).
4. **Performance Efficiency** — use resources efficiently, right-size, adopt new tech.
5. **Cost Optimization** — avoid unnecessary spend (right-sizing, Spot/Savings Plans, managed services).
6. **Sustainability** — minimize environmental impact (efficient resource use, managed services).

> The **Well-Architected Tool** reviews your workloads against these pillars and flags risks. Remember **trade-offs** — e.g. higher reliability/performance often costs more.`,
      },
      {
        id: "pricing",
        title: "AWS Pricing & Billing",
        shortDesc: "How AWS charges and how to optimize cost",
        content: `## AWS Pricing & Billing

Core AWS pricing principles and cost-control tools.

### How AWS charges (3 fundamentals)
- **Compute** (per second/hour of EC2, per request+duration for Lambda)
- **Storage** (per GB)
- **Data transfer OUT** (inbound is free; outbound & cross-AZ/region cost money)

### EC2 purchase options (cheapest → most flexible)
- **Spot** (up to ~90% off, interruptible) · **Reserved Instances / Savings Plans** (1–3 yr commit, big discount) · **On-Demand** (pay as you go) · **Dedicated Hosts** (compliance).

### Cost-management tools
- **Cost Explorer** — visualize & forecast spend.
- **Budgets** — alerts when cost/usage crosses a threshold.
- **Pricing Calculator** — estimate before you build.
- **Cost Allocation Tags** + **Consolidated Billing** (AWS Organizations) for multi-account.

> Exam: predictable steady workload → **Reserved/Savings Plans**; fault-tolerant/batch → **Spot**; short-term/unpredictable → **On-Demand**. **Free Tier** covers learning.`,
      },
    ],
  },
  {
    id: "projects",
    label: "Capstone Projects",
    icon: "🏆",
    color: "#FF9900",
    topics: [
      {
        id: "capstone-1",
        title: "Project 1 – Resilient & Scalable Web App",
        shortDesc: "End-to-end build: VPC + EFS + Auto Scaling + ALB + Route 53",
        visuals: ["ProjectBrief", "ArchitectureBuilder3D", "ProjectPhaseFlow", "ResilienceTest", "ProjectDeliverables"],
        content: `## Capstone Project 1 — Resilient & Scalable Web Application

A complete, real-world build that ties together everything from the course into **one production-style architecture** on AWS, following best practices.

> **Title:** Resilient and Scalable Web Application Deployment on AWS.

---

## Objectives

- **High Availability** — minimal downtime via multiple Availability Zones
- **Scalability** — Auto Scaling adjusts EC2 count automatically with traffic
- **Security** — security groups + private subnets; web servers are never public
- **Resilience** — self-healing setup that survives failures and traffic spikes with no manual intervention

## Core Services

**VPC** (isolated network) · **EFS** (shared app storage) · **EC2** (compute) · **Auto Scaling** (elasticity) · **ALB** (traffic distribution) · **Route 53** (DNS).

---

## Architecture

A custom **VPC (192.168.0.0/24)** in Mumbai with **4 subnets across 2 AZs**:
- **2 public subnets** — host the ALB and the NAT Gateway (inbound + outbound internet)
- **2 private subnets** — host the EC2 web servers (outbound only, **no inbound** — safe from the internet)

The web app lives **once** on shared **EFS** (mounted at \`/var/www/html\`), so every instance serves identical content and updates are made in one place.

---

## Build Phases

### 1. Design
Architect around availability, scalability, and security.

### 2. VPC
Create the VPC, 4 subnets (2 AZs), **Internet Gateway** (public subnets), **NAT Gateway** (private subnets' outbound internet), and route tables (a public route table → IGW; the main route table → NAT).

### 3. EFS
Create a regional **EFS** file system with **mount targets in both AZs**, protected by an EFS security group (NFS port 2049). Enable **DNS hostnames** on the VPC so mounting works.

### 4. Custom AMI
Launch a temporary public EC2, install Apache (\`httpd\`), \`systemctl enable httpd\`, install \`amazon-efs-utils\`, mount EFS at \`/var/www/html\`, add the mount to \`/etc/fstab\` (survives reboot), drop in the web app, then **bake a custom AMI**. Terminate the temp instance.

### 5. Auto Scaling + ALB
- **Launch template** using the custom AMI (+ a user-data **test app** on port 8080 that shows the serving instance's hostname)
- **Auto Scaling Group** in the **private** subnets
- **ALB** in the **public** subnets with **two target groups**: \`:80\` (real app) and \`:8080\` (test app)
- Attach the ASG to both target groups

### 6. Security Groups (best practice)
- **ALB-SG:** allow \`:80\` from anywhere; \`:8080\` only from your IP (testing)
- **Web-SG:** allow \`:80\` and \`:8080\` **only from ALB-SG** (not the internet)
- **EFS-SG:** allow NFS \`:2049\` **only from Web-SG**

### 7. Route 53
Point your domain's **name servers** to a Route 53 public hosted zone, then add an **alias record** → the ALB. Now users reach the app by name (e.g. \`learn.cloudfox.in\`).

---

## Testing & Optimization

- **High availability:** terminate one instance → the app stays up via the other AZ → Auto Scaling relaunches one (min = 2) and the ALB re-adds it.
- **Scalability:** spike CPU > 60% → **scale out** (up to 5); drop the load → **scale in** back to 2. The test app's changing hostname proves traffic is balanced across all instances.

> The test app on **:8080** displays the responding instance's private IP/hostname — refresh and watch it rotate to confirm load balancing and scaling.

---

## Deliverables

1. **Architecture diagram & design document** (with rationale)
2. **Implementation & configuration guide** (versioned, step-by-step)
3. **Performance & optimization report** (baseline + load-test results)
4. **Project presentation** (deployment strategy, challenges, solutions)

> A documentation phase is the project's first impression — don't skip it.
`,
      },
    ],
  },
  {
    id: "migration-billing",
    label: "Migration & Billing",
    icon: "💸",
    color: "#38B2AC",
    topics: [
      {
        id: "snowball",
        title: "Snow Family",
        shortDesc: "Offline bulk data migration (Snowball/Snowmobile)",
        visuals: ["SnowFamily"],
        content: `## AWS Snow Family (Offline Migration)

Uploading huge data over the internet is slow (50 TB over 100 Mbps ≈ 1.5 months). The **Snow Family** ships physical devices: order → AWS sends it → you copy data → ship back → AWS loads it to S3.

- **Snowball** — storage-only (50 TB worldwide / 80 TB US-only); encrypted (KMS), rugged.
- **Snowball Edge** — storage **+ compute** (run Lambda/EC2 at the edge); can be clustered.
- **Snowmobile** — a 45-ft truck container, up to **100 PB** (exabyte-scale).

> **Exam:** <10 TB → internet. Tens of TB → **Snowball**. Need edge compute → **Snowball Edge**. Petabytes → **Snowmobile**.`,
      },
      {
        id: "sms",
        title: "Server Migration Service",
        shortDesc: "Migrate on-prem VMs to AWS",
        visuals: ["ServerMigration"],
        content: `## Server Migration Service (SMS)

**SMS** automates migrating on-prem **VMs** (VMware vSphere, Hyper-V/SCVMM, Azure) into AWS by incrementally **replicating** them as ready-to-deploy **AMIs**.

Flow: **On-prem VM → SMS connector (in vCenter/SCVMM) → AMI → EC2**. Test the AMI before going live; minimal downtime.

> Limits: **50 concurrent VMs**/account, **90-day** replication window per VM. A **connector** VM (FreeBSD appliance) runs in your hypervisor to orchestrate it.`,
      },
      {
        id: "billing",
        title: "Billing & Cost Management",
        shortDesc: "Cost Explorer, Budgets, Pricing Calculator, transfer costs",
        visuals: ["BillingTools", "DataTransferCost"],
        content: `## Billing & Cost Management

Tools to estimate, track & control AWS spend:
- **Cost Explorer** — visualize/analyze spend over months; filter by service/region/instance/tag/account; forecast.
- **Budgets** — set spending/usage budgets; SNS/email alerts on threshold (AWS can't auto-delete — you act).
- **Pricing Calculator** — estimate a planned architecture before building (replaces Simple Monthly Calculator). Free.

---

## Data Transfer Costs

Golden rule: **inbound is free; outbound & crossing AZ/region boundaries cost money.**
- Internet → AWS (inbound): **free**
- AWS → Internet (outbound): **charged** (~$0.09/GB)
- Same AZ (private IP): **free** · Across AZs: **charged** (~$0.01/GB each way) · Across regions: **charged**
- To S3/DynamoDB via endpoint (same region): **free**

> Tips: keep chatty workloads in the **same AZ**; use **VPC endpoints** for S3/DynamoDB; **Direct Connect** for on-prem; avoid cross-region unless required.`,
      },
    ],
  },
];

// Flat lookup map for quick access by topic id
export const topicMap = {};
awsCategories.forEach((cat) => {
  cat.topics.forEach((topic) => {
    topicMap[topic.id] = { ...topic, categoryId: cat.id, categoryLabel: cat.label, categoryColor: cat.color };
  });
});
