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
  ],
};
