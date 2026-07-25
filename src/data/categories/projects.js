// Capstone Projects
export default {
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
};
