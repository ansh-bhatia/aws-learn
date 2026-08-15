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
      id: "pricing-calculator-vs-simple-monthly-calculator",
      title: "Pricing Calculator vs Simple Monthly Calculator – The Same T4G.xlarge, Four Different Prices",
      shortDesc: "On-demand 24/7 for a month costs $64 — running it only 4 hours a day drops that to $10, and paying 3 years upfront instead drops the 3-year total from $2,361 to just $867",
      visuals: [],
      content: `## ⚠️ Two Tools, One Being Phased Out

> **AWS Simple Monthly Calculator is being replaced by AWS Pricing Calculator — both estimate AWS spend before building anything, but Pricing Calculator is the newer, actively-maintained tool** (Simple Monthly Calculator is legacy and being sunset). Both are free and require no AWS experience to use.

---

## Worked Example: The Same Instance, Four Ways

> **A T4G.xlarge running on-demand 24/7 for a month: ~$64.** ⚠️ **The SAME instance running only 4 hours/day instead of 24/7: ~$10/month** — a direct, concrete illustration of why usage pattern matters as much as instance size when estimating cost. ⚠️ **The SAME instance run 24/7 over 3 years: $2,361 on-demand vs just $867 if paid 3-year-upfront reserved** — a ~63% saving for committing capital upfront instead of paying month-to-month, made concrete rather than abstract.

---

## What Each Tool Actually Does

> **Both let you configure a hypothetical resource (instance type, OS, region, usage hours/day, purchase option) and see the estimated monthly/yearly cost — before ever provisioning anything.** ⚠️ **Pricing Calculator additionally lets you combine MULTIPLE services into one estimate and compare configurations side-by-side, and explicitly excludes taxes (which vary by country) from its numbers.**

---

## Exam Framing

> "Estimate the cost of a planned AWS architecture before building it, comparing on-demand vs reserved pricing" → **AWS Pricing Calculator** (the current, actively-maintained tool — Simple Monthly Calculator is legacy). ⚠️ **The concrete lesson worth remembering: usage pattern (hours/day) and commitment term (upfront vs on-demand) can each independently swing the same instance's cost by 5-6x — sizing the instance correctly is only half the cost equation.**
`,
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
