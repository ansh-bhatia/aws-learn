// Migration & Billing
export default {
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
};
