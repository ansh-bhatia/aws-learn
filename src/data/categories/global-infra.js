// Global Infrastructure
export default {
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
};
