// Capstone Projects
export default {
  id: "projects",
  label: "Capstone Projects",
  icon: "🏆",
  color: "#FF9900",
  topics: [
    {
      id: "capstone1-intro",
      title: "Capstone Project 1 – Introduction",
      shortDesc: "Resilient & Scalable Web Application Deployment on AWS — the objectives, services, and 6 phases",
      visuals: ["ProjectBrief"],
      content: `## Project Title

**Resilient and Scalable Web Application Deployment on AWS.** A complete, real-world build tying together nearly every service covered so far into one production-style architecture, following AWS best practices end to end.

---

## Project Description

- Design and implement a **highly available and scalable** web application infrastructure on AWS
- The architecture leverages AWS services for **fault tolerance, load balancing, and secure user access**
- The core goal: deploy a web application that handles **varying loads effectively** while maintaining **high availability across multiple AZs**

---

## Objectives

| Objective | What it means here |
|---|---|
| **High Availability** | Minimal downtime, achieved via multiple Availability Zones |
| **Scalability** | Auto Scaling adjusts EC2 count automatically as traffic changes |
| **Security** | Security groups, secure communication, and VPC design working together |
| **Resilience** | The setup withstands failures and traffic spikes with **zero manual intervention** |

---

## Core AWS Services Used

- **VPC** — isolated network environment; public and private subnets across multiple AZs for security and availability
- **EFS** — shared storage for the web application itself
- **EC2** — the compute resources actually running the application
- **Auto Scaling** — dynamically adjusts instance count to match demand
- **Application Load Balancer** — distributes incoming traffic across instances in different AZs
- **Route 53** — DNS, so users reach the app by domain name

---

## The 6 Project Phases

1. **Design** — architect the solution around applications, security, scalability, and availability requirements
2. **Implementation** — broken into its own sub-steps: VPC + subnets + security groups → EFS → custom AMI for Auto Scaling → set up and test Auto Scaling → deploy the Application Load Balancer → integrate Route 53
3. **Testing and Optimization** — functional and load testing to confirm performance and scalability actually meet requirements
4. **Documentation** — architecture, configuration, and deployment process, written up in detail
5. **Deliverables** — architecture diagram + design docs, an implementation/configuration guide, a performance/optimization report, and a project presentation covering strategy, challenges, and solutions

> This is **Capstone Project 1** of five planned capstones across the course — each one arrives after a cluster of related services has been covered, so the project can put that knowledge to immediate, practical use rather than staying purely theoretical.

---

## What's Ahead

Every remaining topic in this project is a **hands-on session**, building one real phase at a time — starting with the VPC design in the very next topic. Following along in your own AWS account (rather than just reading) is exactly how this project is meant to be used.
`,
    },
    {
      id: "capstone1-vpc-lab",
      title: "Capstone 1 – Lab: VPC Design",
      shortDesc: "4 subnets across 2 AZs, an Internet Gateway, and a NAT Gateway — the network the whole project sits on",
      visuals: ["ArchitectureBuilder3D"],
      content: `## Why This Design

The project's entire VPC layout rests on two concerns: **security** (web servers must never be directly reachable from the internet) and **availability** (resources spread across more than one Availability Zone, so a single AZ failure doesn't take the app down). Scalability is deliberately **not** a VPC concern — that's Auto Scaling's job, covered in a later session.

---

## The Target Layout

| Subnet | AZ | CIDR |
|---|---|---|
| **public-subnet-1a** | ap-south-1a | 192.168.0.0/26 |
| **public-subnet-2b** | ap-south-1b | 192.168.0.64/26 |
| **private-subnet-1a** | ap-south-1a | 192.168.0.128/26 |
| **private-subnet-2b** | ap-south-1b | 192.168.0.192/26 |

The **public subnets** will later hold the Application Load Balancer and the NAT Gateway. The **private subnets** will hold the actual EC2 web servers — no inbound internet access at all, ever.

---

## Step 1 — Delete the Default VPC, Create the Project VPC

**Delete the default VPC** first (only possible while it holds no resources) to avoid any confusion between it and the project VPC.

**VPC → Create VPC → VPC only** → name **my-project-1-vpc** → CIDR **192.168.0.0/24**.

> ⚠️ Create the VPC on its own (**VPC only**), not through the "VPC and more" wizard that auto-generates subnets — this project builds every piece explicitly so each one is understood, not auto-generated.

---

## Step 2 — Create All Four Subnets

**Create subnet**, using the table above, one at a time (or all four in a single **Add new subnet** pass) — matching each name to its AZ and CIDR exactly, since later sessions reference these subnets by role (public vs private).

---

## Step 3 — Internet Gateway

**Create internet gateway** → name it → **Actions → Attach to VPC**, selecting the project VPC.

---

## Step 4 — Public Route Table

The **main route table** already exists and holds all four subnets by default (implicit association). Rather than editing it directly:

**Create route table** → name **rt-for-public** → select the VPC → **Subnet associations → Edit subnet associations** → select **both public subnets**. This automatically removes them from the main table's association.

**rt-for-public → Routes → Edit routes → Add route:** destination **0.0.0.0/0** → target the **internet gateway**.

> The two public subnets are now genuinely public — inbound **and** outbound internet. The two private subnets, still on the main route table, have **neither** yet.

---

## Step 5 — NAT Gateway for Outbound-Only Private Access

Private-subnet instances still need **outbound** internet — for OS updates, package installs, and antivirus definitions — even though they must never accept **inbound** connections.

> **A NAT Gateway always lives in a public subnet**, even though its job is to serve the private subnets' outbound traffic. (Production environments typically deploy one NAT Gateway per AZ for high availability; this project uses a single one to keep the lab simple.)

**Create NAT gateway** → place it in **public-subnet-1a** → **Allocate Elastic IP** → assign it. Wait for the state to reach **Available** (a few minutes).

Then, on the **main route table** (which the private subnets are already associated with): **Add route** → destination **0.0.0.0/0** → target the **NAT gateway**.

---

## What You Now Have

- **Two public subnets**, routed to the **internet gateway** — ready for the Application Load Balancer and the NAT Gateway
- **Two private subnets**, routed to the **NAT gateway** — outbound-only, completely unreachable from the internet directly — ready for the actual web server instances

> This VPC is the foundation every remaining session builds on. Next: configuring **EFS** as the application's shared, centralized storage.
`,
    },
    {
      id: "capstone1-efs-ami-lab",
      title: "Capstone 1 – Lab: EFS & Custom AMI",
      shortDesc: "One shared file system for every web server, baked into a reusable AMI for Auto Scaling",
      visuals: [],
      content: `## Why Shared Storage, Not Per-Instance Storage

Auto Scaling will eventually create an unknown, changing number of EC2 instances. Without shared storage, the web application would need to be copied onto **every single instance's own EBS volume** — and updating it later would mean logging into and updating each instance individually, one at a time.

> **Storing the application on EFS instead means every instance mounts the same shared file system.** Update the app once, in one place, and every instance — present and future — immediately serves the new version. EFS is chosen over FSx here specifically because the fleet is Linux-only, which is exactly what EFS is built for.

---

## Step 1 — Two Prerequisites Before Creating EFS

**Enable DNS hostnames on the VPC:** **VPC → select the project VPC → Actions → Edit VPC settings → Enable DNS hostnames.** Skipping this causes real mounting failures later — it's easy to forget and hard to diagnose after the fact.

**Create an EFS security group:** name it **efs-SG-project1**, in the project VPC. ⚠️ For this build phase, inbound is temporarily set to **allow all traffic** — explicitly **not** best practice, and every security group in this project gets tightened to least-privilege rules in the dedicated security-group session later. Building loosely first and hardening afterward avoids fighting SG rules while everything else is still being wired up.

---

## Step 2 — Create the EFS File System

**EFS → Create file system** → name **shared-storage-web-app-project1** → select the project VPC → **Customize**:

- **Regional** (not One Zone) — better availability, matching the VPC's multi-AZ design
- Automatic backups and encryption: **off** for this lab (available for real deployments if desired)

**Mount targets:** one in **each** AZ — **ap-south-1a** and **ap-south-1b** — placed in the **private subnets** (nothing wrong with mounting from a public subnet if needed, but private matches this project's security model). Security group: the **efs-SG** created above.

Create it, then confirm the mount targets reach an available/mounted state before moving on.

---

## Step 3 — A Temporary Public Instance to Build the AMI

Auto Scaling needs a **custom AMI** with the web server and its EFS mount already configured — building that AMI requires one instance with **temporary public access**, purely to set it up.

Launch **test-web-server-for-ami**: Amazon Linux, t2.micro, key pair, **public subnet**, **public IP enabled**, a new **web-server-SG** (temporarily allowing all traffic, same tightening-later caveat as the EFS SG).

SSH in (**ssh -i your-key.pem ec2-user@public-ip**), then **sudo -i** to become root.

---

## Step 4 — Install and Enable the Web Server

Run, in order: **yum install httpd**, **systemctl start httpd**, **systemctl enable httpd**.

> ⚠️ **systemctl enable is not optional.** Without it, httpd will not restart automatically the next time this instance (or any instance launched from its AMI) reboots — and the site will simply be down with no obvious cause until someone manually starts the service again.

---

## Step 5 — Mount EFS at the Web Root

Install the EFS mount helper: **yum install amazon-efs-utils**.

Mount the file system directly at the Apache document root (**/var/www/html** on Amazon Linux 2023) rather than some separate EFS folder — anything placed in the web root from this point on is, transparently, stored on EFS: **mount -t efs fs-xxxxxxxx:/ /var/www/html** (using the actual EFS file system ID from the console in place of **fs-xxxxxxxx**).

Then create the site content directly at that mounted path — **vi /var/www/html/index.html** — and paste in the project's test page content.

---

## Step 6 — Make the Mount Permanent

A mount made this way is **temporary** — it disappears on reboot unless it's also added to **/etc/fstab**.

Edit **/etc/fstab** and add an entry referencing the EFS file system's DNS name and the **/var/www/html** mount point, in the format EFS documents for its mount helper.

> ⚠️ Get this entry wrong and the **next reboot** either fails to mount EFS at all, or worse, boots into a broken state — double-check the file system ID and mount path before saving.

---

## Step 7 — Verify the Mount Survives a Reboot

Open the instance's public IP in a browser — the test page loads. Then actually **stop** the instance, wait, and **start** it again (the public IP will change on restart). Open the **new** IP — the same page should load, proving the **/etc/fstab** entry is correct and the EFS mount is genuinely persistent, not just a lucky first boot.

---

## Step 8 — Bake the Custom AMI

Once verified: select the instance → **Actions → Image and templates → Create image** → name **ami-image-for-web-server-project1**. Wait for its status to reach **Available**.

> ⚠️ **Do not terminate the source instance before the AMI status shows Available.** Terminating early can produce a corrupted or incomplete image.

---

## Step 9 — Terminate the Temporary Instance

Once the AMI is confirmed available, **terminate test-web-server-for-ami**. It served its purpose (building and validating the AMI) and, sitting in a public subnet with a public IP, has no place staying alive in the final architecture.

> Every future web server this project creates comes from this AMI, launched directly into the **private** subnets — with EFS already mounted and the web server already enabled, no manual per-instance setup ever needed again.
`,
    },
    {
      id: "capstone1-asg-alb-lab",
      title: "Capstone 1 – Lab: Auto Scaling & Application Load Balancer",
      shortDesc: "Private-subnet web servers behind a public ALB, plus a hidden test app that proves load balancing is real",
      visuals: ["ProjectPhaseFlow"],
      content: `## The Problem This Session Solves

The web servers, launched from the custom AMI, will live in **private subnets** with no public IP and no inbound internet — by design, from the VPC session. So how does a user ever actually reach them?

> **An Application Load Balancer sits in the public subnets and provides the URL users actually connect to.** It forwards each request into the private subnets, to whichever web server instance should handle it — the servers themselves stay completely unreachable directly.

There's a second problem this session solves too: once traffic **is** flowing through multiple instances, how do you actually *prove* it's being load-balanced, rather than always hitting the same one? A small **test application on port 8080** — separate from the real app on port 80 — exists purely to make that visible.

---

## Step 1 — Launch Template From the Custom AMI

**Create launch template** → name **my-project-launch-template** → **My AMIs** → select **ami-image-for-web-server-project1** from the previous session → **t2.micro** → your key pair.

- **Subnet:** leave unselected — the Auto Scaling Group chooses this
- **Security group:** the existing **web-server-SG**
- **User data:** paste the **test app script** here — since it's part of the launch template, every instance Auto Scaling ever creates gets the test app automatically, listening on **port 8080**, alongside the real application already baked into the AMI on **port 80**

---

## Step 2 — Create the Auto Scaling Group (Zero Instances For Now)

**Create Auto Scaling group** → name **project-one-ASG** → the launch template above.

- **VPC and subnets:** select **both private subnets** — the web servers belong here, never in public subnets, matching the VPC design from session 2
- **Load balancer:** skip for now — attached explicitly once the ALB itself exists
- **Desired / min / max:** **0 / 0 / 5** for now — this session verifies each piece before intentionally scaling anything up

Create it. As expected, **zero** instances exist yet.

---

## Step 3 — Two Target Groups (Real App and Test App)

An ALB needs a target group per port it forwards to.

**Create target group** → **Instances** → name **web-app-target-group** → protocol **HTTP**, port **80** → select the project VPC → no instances registered yet → create.

**Create target group** again → name **test-app-target-group** → port **8080** → same VPC → create.

---

## Step 4 — Create the Application Load Balancer

**EC2 → Load Balancers → Create load balancer → Application Load Balancer** → name **ALB-project-one** → **Internet-facing**, **IPv4**.

- **Network mapping:** select **both public subnets** — mandatory, and this redundancy is exactly why an AZ outage doesn't take the load balancer down
- **Security group:** create **ALB-SG-project1** (again, temporarily all-traffic-allowed, tightened in the dedicated security session)
- **Listeners:** the default listener on **port 80** → forward to **web-app-target-group**. **Add listener** → port **8080** → forward to **test-app-target-group**

Create it, and wait for its state to reach **Active**.

---

## Step 5 — Attach the ASG to the Load Balancer

Back on **project-one-ASG → Load balancing → Edit**: attach the **Application Load Balancer**, and select **both** target groups (web-app and test-app) — every instance the ASG creates from now on registers with **both** automatically.

---

## Step 6 — Manually Scale Out and Verify

Edit the ASG: set **desired = 2, minimum = 2** (still manual scaling at this stage — dynamic policies come in a later course topic). Two instances launch from the custom AMI.

Check **both target groups**: each should show the two new instances registered and, after a short delay, **healthy** — confirming the ALB, the ASG, and the AMI are all correctly wired together.

---

## Step 7 — Test the Real Application

Copy the ALB's **DNS name** into a browser. The site loads — the same test page baked into the AMI, but now served **through the load balancer** rather than a directly-addressed instance.

---

## Step 8 — Test the Load Balancing Itself (Port 8080)

Open the **same ALB DNS name, but with :8080 appended**. This hits the **test app** instead — and it displays the **hostname of whichever instance actually answered** the request.

> **Refresh repeatedly (an incognito window avoids browser caching skewing the result) and watch the hostname change** between the two instances. This is the concrete proof that the ALB is genuinely distributing traffic across the fleet — something the real production app, with no such debug output, could never show on its own. This same test app will prove Auto Scaling itself is working once dynamic scaling and load testing are introduced in the testing/optimization session.

---

## What's Still Missing

The load balancer and Auto Scaling Group are alive and load-balancing correctly — but every security group involved is still wide open ("allow all traffic"), and there's no custom domain name yet, just the raw ALB DNS name. Both of those are the next two sessions.
`,
    },
    {
      id: "capstone1-security-groups-lab",
      title: "Capstone 1 – Lab: Hardening the Security Groups",
      shortDesc: "Locking all-traffic-allowed down to exactly what each tier actually needs — the layered defense the whole build was building toward",
      visuals: [],
      content: `## Why This Was Always Coming

Every security group created so far — **ALB-SG**, **web-server-SG**, **efs-SG** — was deliberately left wide open ("allow all traffic") purely so nothing blocked progress while the VPC, EFS, AMI, Auto Scaling, and ALB were being wired together. That was never the intended final state.

> This session locks all three down to **exactly** what each tier legitimately needs — building a real **layered defense**: the internet can only reach the ALB; the ALB is the only thing that can reach the web servers; the web servers are the only thing that can reach EFS.

---

## Step 1 — Harden ALB-SG

The ALB is the one component genuinely meant to be public.

**Inbound rules** (delete the existing all-traffic rule first):
- **HTTP (80)** from **anywhere (0.0.0.0/0)** — the real application, open to everyone
- **Custom TCP (8080)** from **My IP** only — the test app is a debugging tool, not something that should be publicly reachable by anyone who discovers the ALB's DNS name

Outbound stays at its default (all traffic allowed) — outbound restrictions aren't this project's concern.

---

## Step 2 — Harden web-server-SG (The Layer That Actually Matters Most)

> **The key move: instead of sourcing rules from an IP range, source them from the ALB's security group itself.** This means literally nothing — not your own IP, not the entire internet — can reach the web servers directly on these ports. Only traffic that has already passed through the ALB is accepted.

**Inbound rules** (delete the all-traffic rule first):
- **HTTP (80)**, source = **ALB-SG** (not an IP — the security group)
- **Custom TCP (8080)**, source = **ALB-SG**
- (SSH management access is deferred — noted as a later concern, not needed to finish this project)

> This is a genuinely important pattern worth internalizing: **referencing another security group as the source** is what actually prevents someone from bypassing the load balancer and hitting a web server on its private IP directly, even from inside the same VPC.

---

## Step 3 — Harden efs-SG

Only the web servers should ever be allowed to mount this file system.

**Inbound rules** (delete the all-traffic rule first):
- **NFS**, port **2049**, source = **web-server-SG**

---

## Step 4 — Verify Nothing Broke

Open the ALB's DNS name — the real application still loads exactly as before. Refresh a few times to confirm the load balancer is still distributing traffic across both instances.

Then try the test app (**:8080**) from a **different network** than the one used to configure "My IP" — it should now be **unreachable**, proving the restriction is real rather than cosmetic.

---

## The Full Picture

| Security Group | Inbound Source | Port(s) |
|---|---|---|
| **ALB-SG** | Anywhere | 80 |
| **ALB-SG** | My IP only | 8080 |
| **web-server-SG** | ALB-SG | 80, 8080 |
| **efs-SG** | web-server-SG | 2049 (NFS) |

> Each tier only accepts traffic from the tier immediately in front of it — the internet talks to the ALB, the ALB talks to the web servers, the web servers talk to EFS, and nothing skips a layer. This exact pattern — and the reasoning behind it — is a common exam and interview topic in its own right, beyond just this project.

---

## What's Left

Two sessions remain: giving the application a real **domain name via Route 53** instead of the raw ALB URL, and then a full **testing and optimization** pass to prove every objective (availability, scalability, security, resilience) actually holds up under real conditions.
`,
    },
    {
      id: "capstone1-route53-lab",
      title: "Capstone 1 – Lab: Route 53 Domain Integration",
      shortDesc: "Pointing a real domain — even one bought elsewhere — at the Application Load Balancer via an alias record",
      visuals: [],
      content: `## The Problem

The application works perfectly via the ALB's raw DNS name — but that's not a viable production URL. Users need to reach the app through an actual **domain name**.

> **Registering the domain with Route 53 is not required to use Route 53 for DNS.** A domain bought through any registrar — GoDaddy, Namecheap, anywhere — can still have its **name resolution** handled by Route 53 instead of the registrar's own DNS. That's the exact setup this lab walks through: a domain purchased at GoDaddy, with Route 53 taking over as the authoritative DNS.

---

## Step 1 — Create a Public Hosted Zone

**Route 53 → Hosted zones → Create hosted zone.**

> ⚠️ **The zone name must exactly match your already-registered domain name** — e.g. if the domain is **cloudfox.in**, the hosted zone must be named exactly **cloudfox.in**, regardless of which registrar it was purchased through.

Type: **Public hosted zone**. Create it — Route 53 automatically generates an **NS (name server) record** with 4 name server addresses.

---

## Step 2 — Point the Registrar at Route 53's Name Servers

This is the step that actually **hands DNS authority to Route 53** — without it, the hosted zone exists but nothing on the internet knows to ask it anything.

In the registrar's own dashboard (GoDaddy in this walkthrough): **domain → Manage DNS → Change Name Servers → use custom (your own) name servers.**

Copy **all 4** name server addresses from the Route 53 hosted zone's NS record into the registrar's name server fields, and save.

> ⚠️ From this point on, DNS resolution for the domain is handled entirely by **Route 53**, not the registrar. The domain itself still needs to be renewed at the original registrar — only the **name resolution** responsibility has moved.

---

## Step 3 — Create the Alias Record

Back in the Route 53 hosted zone: **Create record.**

- **Record name:** a subdomain, e.g. **learn** (making the full name **learn.cloudfox.in**)
- **Record type:** **A** record, with **Alias** toggled on
- **Route traffic to:** **Alias to Application Load Balancer**, select the region (e.g. **ap-south-1**), then select the project's ALB from the list

Create the record.

---

## Step 4 — Wait for Propagation, Then Test

DNS propagation isn't instant — expect to wait **around 10–15 minutes** before the new name resolves anywhere reliably.

Open the new domain name in a browser. If it doesn't resolve yet, be patient rather than assuming something's broken — this is normal DNS propagation delay, not a configuration error.

> If it still doesn't resolve after a reasonable wait, flush your **local DNS cache** (**ipconfig /flushdns** on Windows) — a stale cached failure can outlast the actual propagation delay.

Once it resolves: the real application loads at the friendly domain name, and appending **:8080** still reaches the test app — confirming both listeners still work correctly through the new alias.

---

## What This Achieves

> The project is now reachable by a real, memorable domain name instead of a raw ALB DNS string — completing every piece of the **implementation** phase. What remains is proving, under real test conditions, that the availability, scalability, security, and resilience objectives from the introduction actually hold — covered next.
`,
    },
    {
      id: "capstone1-testing-optimization",
      title: "Capstone 1 – Testing & Optimization",
      shortDesc: "Killing an instance to prove self-healing, then spiking CPU load to watch dynamic scaling react live",
      visuals: ["ResilienceTest"],
      content: `## What Testing Actually Proves

Implementation being *done* isn't the same as the project's objectives being *verified*. This session runs real tests against each stated objective: **high availability**, **scalability**, **security**, and **resilience**.

---

## Test 1 — High Availability (Kill an Instance)

The two running web servers sit in **different Availability Zones** (private-subnet-1a and private-subnet-2b) — confirmed by checking each instance's subnet in the console.

**Terminate one instance directly.** Because the ASG's minimum is **2**, the moment the count drops to 1, Auto Scaling immediately begins launching a replacement.

Open the application during this window: a brief **504 Gateway Timeout** may appear for a couple of seconds while the ALB re-routes, then the site loads normally — served entirely by the one surviving instance. Refreshing the **test app** (:8080) repeatedly shows the same hostname every time, confirming only one instance is currently live.

> Wait for the replacement instance to finish its **warm-up** and health checks, then refresh the test app again — its hostname now alternates between the original survivor and the new replacement, confirming the ALB added the freshly-launched instance back into rotation **automatically**, with zero manual re-registration. Check the target group's **Targets** tab directly to see both listed as healthy, and the ASG's **Activity** log to see the exact terminate → launch sequence timestamped.

---

## Test 2 — Scalability (Spike the Load, Watch It Scale Out and Back In)

So far, capacity has been **manual** (fixed at 2). This test introduces a real **dynamic scaling policy**:

**ASG → Automatic scaling → Create dynamic scaling policy** → target tracking → **Average CPU Utilization**, target **60%**, max capacity **5**.

Open the test app in two browser tabs (one per current instance, identified by hostname) and trigger the **CPU load generator** on **both** — pushing average CPU well above the 60% target.

> **Wait roughly 5–10 minutes** (warm-up plus evaluation time) — a **third**, then a **fourth** instance launches automatically as the average stays elevated, all the way up toward the configured maximum of 5. Refreshing the test app during this window surfaces a rotating set of hostnames — direct proof each new instance is live and actually receiving traffic, not just sitting idle.

**Cancel the load on every instance.** Once average CPU drops back down, wait again — Auto Scaling terminates the extra instances one at a time, bringing the fleet back down to the baseline of **2**. The ASG's **Activity** log shows the complete timeline: the scale-out launches, then the scale-in terminations, each with its own timestamp.

---

## Test 3 — Security (Already Verified, Worth Restating)

The hardened security groups from the previous session were already confirmed working — the test app on :8080 is unreachable from outside the configured "My IP," while the real application on :80 remains open to everyone through the ALB. No new action needed here; this test simply confirms that hardening didn't quietly break anything during the scaling tests above.

---

## Test 4 — Resilience (What These Two Tests Actually Demonstrate Together)

> Both tests above ran with **zero manual intervention** at the moment of failure or load spike — Auto Scaling reacted on its own, and the ALB absorbed each change automatically. That combination, functioning correctly under an actual instance termination and an actual load spike, **is** the resilience objective from the project's introduction — not a separate thing to configure, but the observable result of the availability and scalability mechanisms already built.

---

## What's Left

Everything technical is now built and verified. The final session covers the **documentation and deliverables** phase — writing up what was built, why, and how it performed, which is the difference between a working project and a finished, presentable one.
`,
    },
    {
      id: "capstone1-documentation",
      title: "Capstone 1 – Documentation & Deliverables",
      shortDesc: "The 4 documents that turn a working build into a finished, presentable project",
      visuals: ["ProjectDeliverables"],
      content: `## Why Documentation Is Not Optional

> **Documentation is often the least enjoyable phase of a project — and also the first thing anyone reviewing it actually sees.** A working AWS deployment nobody can understand or evaluate isn't a finished project; the four deliverables below are what make it presentable and reviewable by someone who wasn't in the room while it was built.

---

## Deliverable 1 — Architecture Diagram & Design Document

Two pieces:

- **Diagrams** — at minimum, the **VPC design** (subnets, AZs, gateways) and a **data-flow diagram** showing how a request actually travels from a user through the ALB, into a private-subnet instance, and out to EFS
- **Design document** — the **reasoning** behind each major decision: why a VPC with public/private subnets, why EFS instead of per-instance storage, why an ALB instead of a Classic Load Balancer, why Auto Scaling instead of a fixed fleet

> This is the document that answers "why did you build it this way?" — exactly the kind of question that comes up in a real interview or a project review, and the reasoning is worth understanding deeply, not just copying into a template.

---

## Deliverable 2 — Implementation & Configuration Guide

A **versioned**, dated, authored guide — table of contents, then one section per phase (VPC design, EC2/AMI, EFS, Auto Scaling, Load Balancer, security groups, Route 53), each with the **actual console steps** taken.

> Writing this section-by-section, right after actually performing each phase (rather than trying to reconstruct it from memory afterward), is far more accurate and far less painful than writing it all at the end.

---

## Deliverable 3 — Performance & Optimization Report

A template covering:

- **Infrastructure summary** — what was actually deployed (instance types, AZ count, subnet layout)
- **Baseline performance** — behavior under normal/no load
- **Load test results** — what happened during the CPU-spike test: how many instances launched, how long scale-out took, how long scale-in took to settle back down
- **Optimization notes** — anything that could be tuned (e.g. adjusting the target-tracking percentage, adjusting warm-up/cooldown timers)

> The load-test data gathered directly from the testing session is exactly what fills in this report's real numbers — it isn't a separate exercise, just a write-up of what was already observed and measured.

---

## Deliverable 4 — Comprehensive Project Presentation

A presentation (title, date, author) covering: **agenda → introduction → architecture → deployment strategy → challenges encountered → solutions applied → results**.

> Frame the "challenges and solutions" section around what was genuinely non-obvious during the build — e.g. the EFS DNS-hostname prerequisite, the source/destination-style thinking behind SG-as-source rules, or the warm-up delay before a scale-out visibly appears. Real friction points make a far more credible presentation than a purely polished retelling.

---

## Capstone Project 1 — Complete

Every phase from the original 6-phase plan is now built, tested, and documented: **VPC → EFS → custom AMI → Auto Scaling + ALB → hardened security groups → Route 53 → testing/optimization → documentation.**

> This project deliberately used **HTTP, not HTTPS**, and **no database layer** — both explicitly called out as directions a future, more advanced capstone project would extend. This is Capstone Project 1 of five planned across the course; each later one builds on services covered since this one, using the same "design → implement → test → document" structure established here.
`,
    },
  ],
};
