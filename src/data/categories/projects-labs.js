// Projects / Hands-On Labs
export default {
  id: "projects-labs",
  label: "Projects / Hands-On Labs",
  icon: "🚀",
  color: "#EC7211",
  topics: [
    {
      id: "project-ecs-php",
      title: "Project: Scalable PHP App on ECS — Part 1 (Cluster, Docker Image, ECR)",
      shortDesc: "Real-world hands-on: build a PHP image, push to ECR, ready for ECS",
      visuals: ["ProjectArchitecture", "ProjectRoadmap", "HybridCluster", "BuildImageFlow", "EnvVarsBestPractice", "IAMRoleVsKeys", "ECRBridge", "ECRvsDockerHub", "TagMutability"],
      content: `## Project: Deploy a Scalable PHP Web App on Amazon ECS

A real-world, production-style project — the best way to truly learn ECS. We deploy a simple but powerful PHP app: users **upload a picture**, and it gets stored in **Amazon S3**.

**What you'll learn:** containerize an app, push to ECR, run tasks/services on ECS (Fargate + EC2), attach a load balancer, scale, and wire up networking + IAM the right way.

**Architecture (two halves):**
- **Build pipeline:** GitHub (code) → Build machine (Docker) → ECR (image registry).
- **Runtime:** User → Application Load Balancer → ECS containers → S3 (image storage).

Best practices throughout: **IAM roles** (no hardcoded keys) and **environment variables** (no baked-in config).

> The full project is **8 steps**. This Part 1 covers steps **1–3**.

---

## Step 1 — Create a Hybrid ECS Cluster

Goal: one cluster that supports **both Fargate and EC2**, so we can try and compare both launch types later.
- **Fargate** (default): serverless — no servers to manage.
- **EC2**: we create an **Auto Scaling Group** (ECS-optimized Amazon Linux 2023, t2.micro, min 1 / max 2), a key pair, a security group (open ports 22 and 8080), in the default VPC.

**Pro tip — avoid charges:** the cluster is free; you pay for running tasks/EC2. Pausing? Set the Auto Scaling Group's **desired + min capacity to 0** to terminate the instance; set it back to **1** to resume.

> 🇮🇳 In Mumbai, t2.micro free tier is sometimes missing in **ap-south-1c** — deselect that subnet to avoid launch failures.

---

## Step 2 — Build the Docker Image

**Why a separate "build machine"?** ECS only **runs** images — it can't **build** them. So we use a separate EC2 (a Docker host).

1. **Launch build machine** — Amazon Linux 2023; open ports 22 (SSH) and 8080 (to test the app).
2. **Install Docker** — we build images with Docker commands.
3. **Clone the code** — \`git clone\` the PHP app (index.php, upload.php, Dockerfile) from GitHub.
4. **Install PHP + Composer** — Composer is PHP's dependency manager; it installs the **AWS SDK for PHP** so the app can talk to S3.
5. **Build** — \`docker build .\` (the \`.\` means "use the Dockerfile in the current folder"). Verify with \`docker images\`.

### Test it locally first
Run the image with \`docker run -d -p 8080:80 …\` and open \`http://<build-machine-ip>:8080\`. Upload a picture → confirm it appears in the S3 \`upload/\` folder. Testing here saves pain later.

### Two best-practice lessons from the test
- **Environment variables, not hardcoding:** pass \`S3_BUCKET\` and \`AWS_REGION\` as env vars. Change them anytime with no rebuild. (ECS task definitions support env vars too.)
- **IAM role, not access keys:** never hardcode AWS keys in code (a leak = account takeover). Attach an **IAM role** so the app gets temporary, auto-rotating credentials. (We pass keys only briefly during local testing, then delete them.)

---

## Step 3 — Amazon ECR (Elastic Container Registry)

The image is on the build machine, but **ECS can't pull from there**. **ECR** is the bridge: you **push** from the build machine → ECS **pulls** from ECR.

**Why ECR over Docker Hub?**

| | ECR ✅ | Docker Hub |
|---|---|---|
| **Privacy** | Private by default | Public or private |
| **Access** | IAM roles (AWS-native) | Docker Hub login |
| **Speed** | Same region as ECS = low latency | Location unknown |
| **Rate limits** | None | Pull limits apply |

**Create the repository:** ECR repos are **private only**. Name it (e.g. \`cloudfox-php-app\`), then choose:
- **Tag mutability** — **Mutable** = a tag like \`latest\` can be overwritten (handy while learning, but risky — hard to roll back). **Immutable** = tags can't be reused (safer, best for production). We pick **Mutable** for the lab.
- **Encryption** — **AES-256** (ECR-managed) is fine; use **KMS** for audit/compliance.

> Update flow later: change code → push to GitHub → rebuild → push to ECR → ECS pulls the new image. A CI/CD pipeline can automate all of it.

**Next part:** push the image to ECR, then create the ECS **task definition**, IAM roles, service, and load balancer.`,
    },
    {
      id: "project-ecs-php-2",
      title: "Project: Scalable PHP App on ECS — Part 2 (Push to ECR + Task Definition Deep-Dive)",
      shortDesc: "Push the image to ECR, then master every task-definition option",
      visuals: ["PushToECR", "TaskDefinitionBlueprint", "OSArchMatch", "NetworkModes", "TaskSizeExplorer", "TaskRoleVsExecution", "PlacementConstraints", "ContainerConfig", "ResourceLimits", "ECSStorageExplorer"],
      content: `## Project Part 2 — Push to ECR & Build the Task Definition

We push the image to ECR, then go deep on the **task definition** — the blueprint ECS follows to run your app.

---

## Step 4 — Push the Image to ECR

You can't push until you **authenticate** (twice), the best-practice way:
1. **EC2 → AWS:** instead of hardcoding access keys on the build machine (risky), attach an **IAM role** (Amazon EC2 Container Registry full access) to the build machine.
2. **Docker → ECR:** run the ECR login command from **"View push commands"** → get **"Login Succeeded"** (a temporary token).
3. **Tag** the local image with the ECR repo **URI**: \`docker tag cloudfox-php-app:latest <account>.dkr.ecr.<region>.amazonaws.com/cloudfox-php-app:latest\`.
4. **Push:** \`docker push <URI>:latest\` → the image appears in the ECR repo, ready for ECS.

> Update flow later: change code → rebuild → re-tag → re-push. CI/CD can automate it all.

---

## Step 5 — The Task Definition (deep-dive)

A **task definition** is the recipe telling ECS how to run your app: **image, CPU/RAM, ports, env vars, IAM roles, storage**. Editing it creates a new **revision** (never overwrites — easy rollback); all revisions live in one **family**. One definition can hold **multiple containers**.

### Launch type
Choose **Fargate** and/or **EC2**. This unlocks different options (e.g. Fargate forces network mode = **awsvpc**). If EC2 is greyed out, your cluster wasn't created with EC2 capacity.

### OS & Architecture
Tell ECS what the container is built for (**Linux/Windows**, **x86_64/ARM64**). ECS only runs it on a **matching host** — no form error, but the task **fails to start** if none exists. **Windows is NOT supported by Fargate** (needs a Windows EC2). ARM64 needs **Graviton** EC2 (or Fargate).

### Network mode (5 options)

| Mode | Launch | IP | Port config |
|---|---|---|---|
| **awsvpc** ⭐ | Fargate + EC2 | Own ENI + private IP per task | Container port only |
| **bridge** | EC2 (Linux) | Shares host ENI via Docker bridge | Host ↔ container mapping |
| **default** | EC2 (Windows) | NAT (Windows bridge) | Host ↔ container mapping |
| **host** | EC2 (Linux) | Uses host IP directly | Container port (no mapping) |
| **none** | EC2 | No networking | Disabled |

- **awsvpc** is the default & most-used (and Fargate's only option): each task = a mini-EC2 with its own IP + security group.
- Only **bridge** & **default** need **host↔container port mapping** (e.g. host 8080→container 80, 8081→another task).
- **host** is fastest (no routing) but two containers can't share a port.

### Task size (CPU & memory)
- **Fargate:** pick a vCPU; memory must be a **compatible** pairing (e.g. 1 vCPU → 2–8 GB, in 1 GB steps). **Mandatory**.
- **EC2:** any size, but it must **fit inside the host** (asking a t2.micro for a full vCPU → task fails). Optional (reserves resources).
- Don't over-allocate "to be safe" — you pay for it. Right-size by monitoring.

### Task Role vs Task Execution Role
- **Task role** = your **app's** permissions at runtime (e.g. PHP app → write to S3).
- **Execution role** = the **ECS agent's** permissions at launch (pull image from private ECR, push logs to CloudWatch, fetch secrets).
- Our project uses **both**.

### Placement constraints (EC2 only)
- **memberOf** — run only on hosts matching a query (e.g. \`ecs.instance-type == t3.*\`); set in the task definition.
- **distinctInstance** — spread tasks onto different hosts (HA); set when you run the task. If no match exists, the task stays **pending**.

### Container configuration
**Name**, **image URI**, **essential?** (if an essential container stops, the whole task fails), **port mapping** (per network mode), and **read-only root filesystem** (Linux security). Private ECR needs no password — the **execution role** handles auth. (Private non-AWS registries need credentials stored in **Secrets Manager**.)

### Resource limits
Set at **task** level (the big box) and per **container** (so one can't hog it all): **CPU cap**, **memory hard limit** (cross it → container killed), **memory soft limit** (reserved floor), and **GPU** (EC2 + GPU instance only — not Fargate).

### Storage
- **Fargate:** **ephemeral storage** (20 GB default → 200 GB, wiped on stop), **bind mount** (share within a task), **EBS** (CLI/SDK only), **EFS** (persistent + shared across tasks).
- **EC2:** instance storage, **bind mount** (access host files / share), **Docker volumes**, plus **EBS / EFS / FSx** (external, persistent, shareable). Ephemeral 20–200 GB is **Fargate-only**.
- All storage must be **mounted** to be used. For durable shared data → **EFS** (Linux) / **FSx** (Windows).

**Next part:** create the task role, then launch the task/service behind an Application Load Balancer and test the upload to S3.`,
    },
    {
      id: "project-ecs-php-3",
      title: "Project: Scalable PHP App on ECS — Part 3 (Run Task, Service, ALB & Auto Scaling)",
      shortDesc: "Create the task definition, run it, then a service behind an ALB with auto scaling",
      visuals: ["TaskDefPrereqs", "CapacityProviderCalc", "ECSTaskVsServiceCtl", "DeploymentConfigOptions", "RollingVsBlueGreen", "FailureDetection", "ServiceNetworkingALB", "ClusterVsServiceScaling", "TargetTracking", "StepScaling"],
      content: `## Project Part 3 — Run the App, Add a Load Balancer & Auto Scaling

The final stretch: create the task definition, run a test task, then a production **service** behind an **ALB** with **auto scaling**.

---

## Step 6 — Create the Task Definition

First create **two prerequisites**:
1. **S3 bucket** — note its **name** + **region** (passed as env vars).
2. **ECS Task Role** — IAM role (trusted by "Elastic Container Service Task") with **S3 access**, so the app can write uploads.

Then build the definition: **Fargate · Linux x86_64 · awsvpc**, **1 vCPU / 2 GB**, **task role** (→ S3), **execution role** (create new → pulls image from ECR), container with the **ECR image URI** + **port 80**, and env vars **S3_BUCKET** + **AWS_REGION**.

> Env var keys must **exactly match the code**. In production, scope the task role to one bucket (not full S3).

---

## Step 7 — Run a Task (test)

**Run new task** → pick the task definition family + revision, set **desired count**, and a **capacity provider strategy** that splits tasks across **Fargate** and **Fargate Spot**:
- **base** = minimum guaranteed to a provider (filled first).
- **weight** = ratio for the remaining tasks.
- Example: 10 tasks, Fargate base 2 / weight 1, Spot weight 3 → 2 guaranteed to Fargate, then the other 8 split 1:3 = 2 more Fargate + 6 Spot → **4 Fargate, 6 Spot**.

For the test we run **1 plain Fargate task**, grab its **public IP**, open it (strip \`https://\` — it's HTTP), and confirm an upload lands in S3. (If it won't open, check the security group allows the app port from 0.0.0.0/0.)

---

## Step 8 — Create a Service

A **task** runs once and is forgotten; a **service** is a **controller** that keeps tasks running — auto-restart, **desired count** (HA), **load balancer**, and **auto scaling**. Production = service.

### Deployment configuration
- **Replica** (keep N tasks) vs **Daemon** (one task per EC2 host — EC2 only).
- **AZ rebalancing** — spreads tasks evenly across AZs; if one AZ fails, ECS runs all tasks in the survivor, then rebalances when it recovers.
- **Health check grace period** — seconds to let a new task boot before health checks judge it.

### Deployment strategy
- **Rolling update** (default) — replace tasks in batches in place. **Min running %** (100% = never lose capacity) + **max running %** (200% = may temporarily double). Load balancer optional.
- **Blue/Green** — stand up a whole **green** environment beside live **blue**; both run during a **bake time** (0–1440 min) for testing; then switch blue→green. Easy rollback before the switch. Needs **CodeDeploy + a load balancer** (mandatory). Production favourite.

### Failure detection
- **Circuit breaker** — detects a failing deployment (without it, a bad deploy can hang).
- **Roll back on failure** — auto-revert to the last working version.
- **CloudWatch alarm** — fail a deploy on business metrics (order failures, latency, CPU) even when containers look "healthy."

### Networking (best practice)
Put **tasks in private subnets** (no public IP) and a **public ALB** in front: User → ALB (public subnet) → tasks (private subnet) → S3. Use **2 AZs**, security group allowing only port 80. **Create the ALB first in EC2** (target type **IP**, internet-facing, public subnets) — the service wizard would otherwise put it in the private subnet — then attach the existing ALB/listener/target group.

---

## Auto Scaling

Two distinct things scale:

| | Cluster scaling | Service scaling |
|---|---|---|
| **Scales** | EC2 instances | Tasks |
| **Applies to** | EC2 only | Fargate + EC2 |
| **Driven by** | Capacity provider + ASG (auto) | CloudWatch metrics + policies |
| **You set** | Min/max instances | Min/max tasks + policy |

**Service auto scaling** keeps the task count **dynamic** between a min and max (desired count alone is fixed = HA only). Policies:

- **Target tracking** — pick a metric + target (CPU 60%, memory %, or **ALB requests/target**); ECS adds/removes tasks to hold it. **Scale-out cooldown** is short (~60s, add fast while a task boots); **scale-in cooldown** is long (~300s, remove slowly so a traffic spike stays safe). You can **disable scale-in** if performance > cost.
- **Step scaling** — define **ranges** so a bigger breach adds more: e.g. 60–70% → +2 (=4), 70–80% → +2 (=6), ≥80% → +4 (=10). Scale-out **only adds** — you need a **mirror scale-in** policy to remove tasks as CPU drops. The console allows **one** policy at service creation; add the second **after**. Step scaling relies on **CloudWatch alarms**.

> **Project complete:** a containerized PHP app on ECS Fargate, image in ECR, behind a public ALB with private tasks, uploading to S3 via an IAM task role, and auto-scaling on CPU. 🎉`,
    },
  ],
};
