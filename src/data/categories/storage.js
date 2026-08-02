// Storage
export default {
  id: "storage",
  label: "Storage",
  icon: "🗄️",
  color: "#3F8624",
  topics: [
    {
      id: "storage-fundamentals",
      title: "Storage Fundamentals – DAS, File & Object",
      shortDesc: "The three storage families and how each maps onto an AWS service",
      visuals: ["StorageTypesMap", "StorageCompareTable"],
      content: `## Three Kinds of Storage

There are three storage options in total. Two of them you already know from ordinary computing; **the third only exists in the cloud**.

- **DAS — Direct Attached Storage**, also called **block storage**
- **File storage**
- **Object storage** — **not available on-premises at all**

---

## DAS / Block Storage

Storage **connected directly to your computer**. Your laptop's hard disk or SSD is DAS. So is a pen drive.

**It is the fastest of the three.** And it has one significant limitation:

> **DAS is not shared.** You cannot connect one SSD to several computers and use it from all of them simultaneously.

**DAS must be formatted.** Buy a new SSD and it arrives **raw**, because the manufacturer has no idea which operating system you will use it with. You format it yourself — **NTFS** for Windows, **ext** for Linux.

Formatting is literally **creating blocks of storage** on the disk — which is why the other name for DAS is **block storage**.

**In AWS there are two DAS options:** **instance store** and **EBS** (Elastic Block Store).

---

## File Storage — Solving the Sharing Problem

Picture a company with **50 computers**. Store data locally on each and you are now responsible for **50 separate disks**.

Far better: build **one storage server**. All 50 computers keep their data there, and you look after **one** system instead of fifty.

> **Any enterprise with multiple computers needs shared storage.** File storage is how that is done.

The protocol depends on the operating system:

| Environment | Protocol |
|---|---|
| **Linux** | **NFS** — Network File System |
| **Windows** | **CIFS / SMB** — Common Internet File System |

**In AWS:** **EFS** for Linux-style shared storage, **FSx** for Windows-style — and neither requires you to build and manage a server.

---

## Object Storage — Cloud Only

For **huge volumes of data**, particularly **static data** you are not frequently editing, there is a third option that has no on-premises equivalent: **object storage**.

**In AWS this is S3.**

---

## The Mapping to Remember

| Traditional | What it is | AWS equivalent |
|---|---|---|
| **DAS / block** | Directly attached, fastest, **not shared**, must be formatted | **Instance Store** and **EBS** |
| **File storage (NFS)** | Shared, Linux | **EFS** |
| **File storage (CIFS/SMB)** | Shared, Windows | **FSx** |
| **Object storage** | Massive static data — **cloud only** | **S3** |

> Everything in this section builds on this table. Next: the two DAS options, and why one of them loses your data.
`,
    },
    {
      id: "ebs-instance-store",
      title: "EBS – Instance Store & Why It Is Temporary",
      shortDesc: "How host reassignment destroys instance store data, and how EBS avoids it",
      visuals: ["PhysicalHostReassignment", "EBSLifecycleVisual"],
      content: `## Two Directly-Attached Options

AWS gives you two block storage options you can attach straight to an EC2 instance: **instance store** and **EBS** (Elastic Block Store). Both are block storage; the differences between them are substantial.

To understand why, you first need one fact about how EC2 works.

---

## Your Instance Does Not Live on a Fixed Machine

An EC2 instance is a virtual machine, so it runs on a **physical host** — and multiple virtual machines share each host. AWS runs **50,000 to 60,000 hosts inside a single availability zone**.

> **AWS decides which physical host runs your instance — and it decides again every time you start it.**

Stop your instance and start it later, and an algorithm picks a host based on where resources are free at that moment. It may be a completely different machine.

---

## Instance Store

**Instance store is directly attached to a specific physical host.** It physically resides inside that host.

While your instance runs on that host, it reaches the instance store directly — and because both are the same machine, you get **low latency and the highest performance available**.

Now follow what happens when you stop the instance:

1. The instance stops. It is on no host.
2. You start it again, and AWS places it on **a different host**.
3. The instance store is still sitting in **the original host**.

**The instance can no longer reach its own storage.**

Because of this, AWS's design is simple: **if you stop the instance, the instance store data is deleted automatically.**

> This is why instance store is **temporary storage**, and why **you cannot stop an instance that relies on it** without losing the data.

---

## EBS Solves It by Being External

**EBS is external storage**, connected to and reachable from **multiple physical hosts**.

Now the same sequence has a very different ending. Stop the instance, start it on Host B, and it **still reaches the EBS volume** — because the volume was never tied to Host A in the first place.

> **EBS is persistent storage.** Even if you **delete the instance**, the volume survives, and you can attach that same volume to a different instance later.

---

## The Trade-Off

| | Instance Store | EBS |
|---|---|---|
| **Attached to** | One specific physical host | External, reachable from many hosts |
| **Survives a stop?** | ❌ Data deleted | ✅ Persists |
| **Survives termination?** | ❌ | ✅ Volume remains, re-attachable |
| **Performance** | **Best** — directly attached | Very good, but not directly attached |

You give up some performance with EBS. In exchange you get storage that does not vanish.

> That is the concept. The next topic puts every difference side by side — it is one of the most commonly asked interview questions in this whole area.
`,
    },
    {
      id: "ebs-vs-instance-store",
      title: "EBS – Instance Store vs EBS Compared",
      shortDesc: "The full comparison: lifecycle, size, performance, cost and mounting",
      visuals: ["InstanceStoreVsEBS"],
      content: `## The Interview Table

> This is one of the **hottest interview questions** in the storage area. Learn the table and you can answer any phrasing of it.

---

## Lifecycle

**Instance store is temporary** — its lifespan is **tied to your instance lifecycle**. Stop or terminate the instance and the data is gone.

**EBS is persistent** and **independent of the instance lifecycle**. Terminate the instance and the volume remains. Create a new instance, attach that volume, and your data is there. You delete the volume when *you* decide to.

---

## Size

**Instance store size is fixed by the instance type.** You do not choose it. And **not every instance type offers one** — **t2.micro does not**, so you must deliberately pick a type that includes it. Choose a type that gives 50 GB and 50 GB is what you get.

**EBS goes up to 16 TB per volume** and works with **any instance type**, at whatever size you specify.

---

## Performance

**Instance store wins** — higher IOPS and throughput, because it is directly attached to the physical host.

> That does **not** mean EBS performs badly. EBS also delivers high IOPS, as the volume-types topic shows. The point is simply that instance store, being directly attached, has the edge.

---

## Use Cases

| Instance Store | EBS |
|---|---|
| Temporary **cached data** | **Mission-critical databases** |
| **Scratch space** | **File systems** |
| **Buffers** | Anything that must survive |

> Never put mission-critical data on instance store.

---

## Cost

**Instance store costs nothing extra.** It comes with the instance type — fixed size, price already included in the instance rate.

**EBS is billed separately.** A t2.micro with a 100 GB EBS volume means paying for the instance **and** for 100 GB of storage.

> **A question that comes up constantly:** *"If I stop my EC2 instance, do I pay anything?"* You pay nothing for the **instance** — but **you keep paying for the attached EBS volume**, the entire time.

---

## Mounting

**Instance store mounts automatically** with the instance. Fixed type, fixed size, nothing to do.

**EBS is manual**: create the instance, create the volume, **attach** the volume, then **mount it from the operating system**.

That extra work buys flexibility — you can **detach a volume from one instance and attach it to another** whenever you like.

---

## Full Comparison

| | 💾 Instance Store | 🗄️ EBS |
|---|---|---|
| **Persistence** | Temporary — tied to instance lifecycle | **Persistent** — independent |
| **Survives stop / terminate** | ❌ Data lost | ✅ Volume remains |
| **Size** | Fixed by instance type | Up to **16 TB**, your choice |
| **Instance type support** | **Only specific types** (not t2.micro) | **Any** instance type |
| **Performance** | **Highest** IOPS / throughput | High, but not directly attached |
| **Use for** | Cache, scratch, buffers | Databases, file systems, critical data |
| **Cost** | Included in instance price | **Billed separately — even while stopped** |
| **Mounting** | Automatic | Attach, then mount manually |
`,
    },
    {
      id: "ebs-storage-scenarios",
      title: "EBS – The 6 Root & Data Volume Scenarios",
      shortDesc: "Every combination of instance store and EBS as root or data volume",
      visuals: ["StorageScenariosExplorer"],
      content: `## Root Volume vs Data Volume

Before the scenarios, one distinction. Open **This PC** on a Windows machine and you might see C:, D:, E: and F:. The **C: drive carries the Windows logo** because the **operating system is installed on it** — that is the **root volume**. D:, E: and F: hold your files — those are **data volumes**.

Same idea here. There are **six** possible configurations.

---

## 1 · Instance Store as Root Volume ✅

Possible, but with conditions.

**Launch instance → Browse more AMIs → Community AMIs**, then **filter root device type to instance store**. You now see only AMIs that support it.

> ⚠️ **Filter to Windows as well and you get nothing.** **No Windows AMI supports instance store as a root volume** — Linux only.

Two further constraints:

- **Not every instance type supports it.** **t2.micro cannot** be used this way.
- **The size is fixed by the instance type.** Select one and you might be given a 1,920 GB ephemeral volume — and you cannot change that number.
- **"Delete on termination" is not applicable**, because the volume is ephemeral by definition.

---

## 2 · EBS as Root Volume ✅

The straightforward case. Browse AMIs and the default listing is **root device type EBS** — pick one and you are done.

**Every instance type supports EBS as root.** Sizes are the familiar defaults: **30 GB for Windows, 8 GB for Linux**.

Under **Advanced**, note **Delete on termination**:

- **Yes** — terminating the instance deletes the root volume too.
- **No** — the volume **survives termination**, and you can attach it to another instance later.

---

## 3 · Instance Store as Data Volume ✅

Here is the catch: **there is no "add volume" button for instance store.** Click Add new volume and you get an **EBS** volume every time.

The only way to get an instance store data volume is to **choose an instance type that includes more than one instance store volume**.

Open **Compare instance types** and pick something like **x1.32xlarge**. Scroll down and you will see **two instance store volumes** — the first becomes your root, the second your data volume.

> You cannot add them, and you cannot size them. The instance type decides both.

---

## 4 · EBS as Data Volume ✅

The easiest of the six. Click **Add new volume**, specify any size you want — 80 GB, whatever — and you are finished.

**It does not depend on the instance type at all.**

---

## 5 · Instance Store Root + EBS Data ✅

Combine 1 and 4. Select an instance-store-root AMI, choose an instance type such as **x1.16xlarge** (giving, say, a 192 GB instance store as root), then click **Add new volume** and add an 80 GB EBS data volume.

---

## 6 · EBS Root + Instance Store Data ✅

Combine 2 and 3, and remember the constraint from scenario 3.

Start with an EBS-root AMI. You **cannot add an instance store from the storage section** — clicking Add volume only ever offers EBS.

So go to **Compare instance types** and look for types listing **storage in GB**. Any type showing that gives you instance store. Select one and you end up with:

- an **8 GB EBS root volume**, and
- **instance store data volumes** — perhaps two at 900 GB each, **fixed in size**.

> Power off the instance and **everything on those instance store volumes is lost**.

---

## Summary

| Scenario | Root | Data | Key constraint |
|---|---|---|---|
| **1** | Instance store | — | Linux AMIs only · specific instance types · fixed size |
| **2** | EBS | — | Any instance type · 30 GB Win / 8 GB Linux |
| **3** | — | Instance store | Cannot be added — instance type must include 2+ volumes |
| **4** | — | EBS | Any size, any instance type |
| **5** | Instance store | EBS | Combination of 1 and 4 |
| **6** | EBS | Instance store | Instance type must provide the instance store |
`,
    },
    {
      id: "ebs-volume-types-ssd",
      title: "EBS – SSD Volume Types (gp2, gp3, io1, io2)",
      shortDesc: "IOPS vs throughput, the gp2 sizing trap, and why gp3 and io2 always win",
      visuals: ["EBSVolumeTypesExplorer", "GP2vsGP3Calculator"],
      content: `## Why Volume Type Matters

There are **seven EBS volume types**. Choosing correctly matters because **cost is tied to volume type** — pick the wrong one and **you pay more money for less performance**.

Find them under **EC2 dashboard → Volumes → Create volume**: **four SSD types**, **two HDD types**, and **one magnetic**. This topic covers the four SSD types.

---

## First: How Performance Is Measured

Two numbers, and you need both.

**IOPS — input/output operations per second.** A disk rated 1,000 IOPS handles 1,000 requests per second; one rated 2,000 handles twice as many. **More IOPS, better performance.**

**Throughput — how much data moves per second**, measured in MiB/s. This is the more accurate picture, because IOPS counts *requests* without saying how much data each carries.

> Judge a volume on **both**.

*(A note on units: AWS sizes are in **TiB** — tebibytes, based on 1,024 — not TB based on 1,000.)*

---

## gp2 vs gp3 — General Purpose

**Use cases are identical for both:** transactional workloads, virtual desktops, single instances, small databases, low-latency applications, development and testing. **Moderate performance, general purpose.**

**Size:** 1 GiB to 16 TiB.

**The critical difference is how you get IOPS.**

**gp2 gives you 3 IOPS per GB**, with a minimum of 100. So the **volume size decides your performance**. A 100 GB gp2 volume gives 300 IOPS.

**Here is the trap.** Your manager needs **900 IOPS** and says you will store **50 GB** of data.

- A 50 GB gp2 volume gives you **150 IOPS**. Not enough — and applications like Oracle or SAP will refuse to run under their required IOPS.
- To reach 900 IOPS you must create a **300 GB** volume (300 × 3 = 900).
- You now **pay for 300 GB to store 50 GB**. The extra **250 GB is pure waste**, bought only to unlock IOPS.

**gp3 fixes exactly this.** You get **3,000 IOPS flat**, regardless of size. A 50 GB gp3 volume gets 3,000 IOPS. A 10 GB gp3 volume gets 3,000 IOPS. And if you need more, you can **pay to provision additional IOPS or throughput** on top.

> **gp3 costs LESS than gp2** — $81 vs $102 per TB per month — **and performs better**. There is no reason to choose gp2.

---

## io1 vs io2 — Provisioned IOPS

**Use these when** you have demanding applications, **IO-intensive database workloads**, or need **sustained IOPS**.

**Size:** 4 GiB to 16 TiB.

Here **you choose the IOPS you need**, up to **64,000** — and pay extra for what you provision.

**gp2 and gp3 max out at 16,000 IOPS.** Need 30,000? You have no choice but io1 or io2.

**io1 and io2 look nearly identical**: same 64,000 max IOPS, same max throughput, **same price ($128 per TB per month)**. So what separates them?

> **Durability.** io1 offers **99.9%**. io2 offers **99.999%** — five nines — **at the same price**. If you store critical data, io2 is strictly better. There is no reason to pick io1.

---

## Block Express

**io2 alone** supports **Block Express**, which delivers **sub-millisecond latency**, up to **256,000 IOPS** and **4,000 MiB/s** throughput.

Two conditions:

- **Only available on specific instance types.** Launch an ordinary type and the option will not appear.
- **No extra charge** — Block Express costs the same as io2. You are effectively paying through the instance type.

---

## Burst Capacity

**gp2 has it; gp3, io1 and io2 do not.**

With gp2, IOPS are allocated by size — so during seconds when you are **not** using them, **unused IOPS accumulate as credit**. Later you can briefly exceed your baseline by spending that credit.

gp3, io1 and io2 do not need this, because you **provision** the IOPS you want directly.

---

## Multi-Attach

Can one volume attach to multiple EC2 instances?

- **gp2 and gp3: no.** Block storage is fundamentally not shared.
- **io1 and io2: yes** — but **only with Nitro-based instances**.

---

## SSD Summary

| | gp2 | gp3 | io1 | io2 |
|---|---|---|---|---|
| **Size** | 1 GiB–16 TiB | 1 GiB–16 TiB | 4 GiB–16 TiB | 4 GiB–16 TiB |
| **Base IOPS** | **3 per GB** | **3,000 flat** | provisioned | provisioned |
| **Max IOPS** | 16,000 | 16,000 | 64,000 | 64,000 (**256,000** Block Express) |
| **Max throughput** | 250 MiB/s | 1,000 MiB/s | 1,000 MiB/s | **4,000** MiB/s Block Express |
| **Cost / TB / month** | $102 | **$81** | $128 | $128 |
| **Durability** | 99.9% | 99.9% | 99.9% | **99.999%** |
| **Burst** | ✅ | ❌ | ❌ | ❌ |
| **Multi-attach** | ❌ | ❌ | ✅ Nitro | ✅ Nitro |
| **Configurable IOPS** | ❌ | ✅ | ✅ | ✅ |
| **Boot volume** | ✅ | ✅ | ✅ | ✅ |

> **The two rules worth memorising: always choose gp3 over gp2, and always choose io2 over io1.** Both are cheaper or better at the same price.
`,
    },
    {
      id: "ebs-volume-types-hdd",
      title: "EBS – HDD & Magnetic Volume Types (st1, sc1)",
      shortDesc: "Cheap storage for big data and cold data — and why magnetic is being priced out",
      visuals: ["VolumeTypeFullMatrix"],
      content: `## Why HDD Exists

SSD is **expensive**. Store a massive amount of data on it and you pay heavily for speed you may not need.

That is what the remaining three types are for: **two HDD types** and **one magnetic**.

---

## Throughput Optimized HDD (st1)

**For big data and log files** — large volumes of data where you **do not need SSD-level speed**.

- **Size:** 125 GiB – 16 TiB
- **Base and max IOPS: 500** (they are the same)
- **Max throughput: 500 MiB/s**
- **Cost: $46 per TB per month**

---

## Cold HDD (sc1)

**For less frequently accessed data.** If you rarely touch it, storing it here **saves a great deal of money**.

- **Size:** 125 GiB – 16 TiB
- **Base and max IOPS: 250** — half of st1
- **Max throughput: 250 MiB/s** — again half
- **Cost: $15 per TB per month**

> Compare $46 against $15. **Choosing your volume type carefully saves your company real money.**

---

## Magnetic (standard) ⚠️

The **previous generation** — a **sequential** storage device, and very old. AWS may **remove it at any time**.

- **Size:** 1 GiB – **1 TiB** only
- **Performance:** variable, around **100 IOPS**, **40–90 MiB/s** throughput — **the worst of all seven types**
- **Cost: $51 per TB per month**

Look at that cost again against st1 ($46) and sc1 ($15).

> **Magnetic is the slowest type and costs more than both HDD types.** That is not an accident — **AWS is raising the price deliberately** so that people move to cold HDD instead. Once nobody is using it, they will remove it. **The pricing is the signal.**

Its nominal use case is **archive or backup data** you might access if needed — but **cold HDD is the better answer** in practice.

---

## Two Curiosities

**Burst capacity:** st1 and sc1 have none — but **magnetic does**, alongside gp2. If you get a sudden spike, magnetic can absorb it.

**Boot volume support:** st1 and sc1 **cannot** be boot volumes. **Magnetic can** — which makes little practical sense, since booting an operating system from a sequential device would be extremely slow. AWS documents it as supported, so it is listed.

---

## HDD & Magnetic Summary

| | st1 (Throughput HDD) | sc1 (Cold HDD) | Magnetic ⚠️ |
|---|---|---|---|
| **Use for** | Big data, log files | Infrequently accessed data | Archive / backup (legacy) |
| **Size** | 125 GiB – 16 TiB | 125 GiB – 16 TiB | 1 GiB – **1 TiB** |
| **IOPS** | 500 | 250 | ~100, variable |
| **Throughput** | 500 MiB/s | 250 MiB/s | 40–90 MiB/s |
| **Cost / TB / month** | $46 | **$15** | **$51** ⚠️ |
| **Durability** | 99.9% | 99.9% | 99.9% |
| **Burst** | ❌ | ❌ | ✅ |
| **Multi-attach** | ❌ | ❌ | ❌ |
| **Configurable IOPS** | ❌ | ❌ | ❌ |
| **Boot volume** | ❌ | ❌ | ✅ (oddly) |

> That completes all **seven** EBS volume types. Next comes the practical side — creating volumes, attaching them, and backing them up with snapshots.
`,
    },
    {
      id: "ebs-volume-lab",
      title: "Lab – Attach, Format & Resize an EBS Volume",
      shortDesc: "Create a volume, the AZ rule, the encryption-only-at-creation trap, and resizing live",
      visuals: ["EBSVolumeLab", "EBSLifecycleVisual"],
      content: `## Setup

This lab uses a **Windows** instance deliberately: the drive is **visible in a graphical interface**, which makes the concepts far easier to follow than Linux commands would.

Launch **Windows Server 2019**, **t2.micro**, in **ap-south-1a**. The **30 GB root volume** becomes the **C: drive**.

> You **can** add extra volumes during launch under **Configure storage** — choosing size, volume type and encryption. This lab adds one afterwards instead, to show that path as well.

---

## Confirming What You Start With

Connect over RDP and open **This PC**. There is only **C:**, at 30 GB — the default root volume.

You can also inspect it properly through **Server Manager → Tools → Computer Management → Disk Management**.

> **Shortcut:** press **Windows+R** and run **diskmgmt.msc** — it opens the same window directly.

---

## Creating the Volume

**EC2 dashboard → Volumes → Create volume.** Choose **General Purpose SSD**, size **15 GB**, then pick the availability zone.

> ⚠️ **The volume and the instance must be in the SAME availability zone.** Create it in **ap-south-1b** while the instance is in **ap-south-1a** and **you simply cannot attach it**. Check your instance's AZ before creating the volume. (There *is* a workaround via snapshots — covered two topics from here.)

---

## ⚠️ The Encryption Decision Is Permanent

Decide **now** whether this volume should be encrypted. Ticking **Encrypt** uses **KMS**; the default **aws/ebs** key is fine.

> **If you do not encrypt at creation, you cannot encrypt it later.** Go to **Actions → Modify volume** afterwards and there is **no encryption option** — it does not appear, ever.
>
> The only route after the fact is to **snapshot the volume and create a new encrypted volume from that snapshot**. In many environments encrypting from the start is simply good practice.

---

## Attaching It

Give the volume a **Name** tag so it is identifiable. Refresh the list and its state reads **available** — **not in-use** — because it is attached to nothing yet.

Select it → **Actions → Attach volume**. **Only instances in the same availability zone are offered.** Pick yours, accept the default device name, and attach. The state becomes **in-use** and shows the instance ID.

---

## Formatting

Back inside the instance, the new drive is **not in Explorer**. That is expected — **it is a raw block device** and must be formatted first.

Open **Disk Management** and the 15 GB disk appears:

1. Right-click → **Online**
2. Right-click → **Initialize Disk**
3. Right-click the unallocated space → **New Simple Volume** → Next through the wizard → **Finish**

**D:** now appears in **This PC**, empty and ready.

---

## Resizing — While Running

Select the volume → **Actions → Modify volume** → change **15 GB to 30 GB** → **Modify**.

> **You can do this while the instance is running.** No power-off required.

Windows will still show 15 GB. Go back to **Disk Management** and choose **Action → Rescan Disks**, then right-click **D: → Extend Volume** and accept the new space. D: now reads 30 GB.

> **You can increase a volume's size. You can never decrease it.**

---

## Detaching and Deleting

**Actions → Detach volume** releases it, and you can then attach it to a **different instance**.

To delete a volume it must be **detached first** — the delete option is unavailable while it is **in-use**, and also while the volume is still **Optimizing** after a resize. Wait for **available**, then **Actions → Delete volume**.

> ⚠️ **Deleting is irreversible.**

---

## Two Limits Worth Remembering

- **A volume cannot be copied to another availability zone or another region directly.** Snapshots are the only mechanism.
- **A volume attaches to only ONE instance** — unless you are using **io1/io2 multi-attach on Nitro instances**.

> Terminate the instance when you finish. Next: protecting this data with **snapshots**.
`,
    },
    {
      id: "ebs-snapshot-lab",
      title: "Lab – Back Up & Restore with a Snapshot",
      shortDesc: "Create files, snapshot the volume, delete the data, and restore it",
      visuals: ["SnapshotBackupLab", "SnapshotWorkflow"],
      content: `## Setup

Launch **Windows Server 2019**, **t2.micro**, in **ap-south-1a**, named **learning-snapshot**. This time **add the 15 GB EBS volume during launch**, under **Configure storage → Add new volume**.

Its advanced options include **Encryption** and **Delete on termination**.

> **Delete on termination defaults to YES for the root volume, but NO for any volume you add.** So an added volume **survives** instance termination unless you change that — which matters at clean-up time.

---

## Put Real Data On It

Connect over RDP, open **diskmgmt.msc**, and bring the 15 GB disk **Online → Initialize → New Simple Volume → Finish**.

Open **D:** and create several text files with some content in them.

---

## Taking the Snapshot

Give the volume a clear **Name** tag first — it makes selecting the right one far easier.

Then **select the volume → Actions → Create snapshot**, add a description, and click **Create snapshot**.

> You can also start from **Snapshots → Create snapshot** and pick the volume there — but without good name tags, choosing correctly from a list is awkward.

Status begins as **pending**; wait for **completed**.

> **Snapshots are stored in Amazon S3**, and you are billed at **S3 rates** for their size. An **unencrypted volume produces an unencrypted snapshot**.

---

## Lose the Data

Back in the instance, select all the files on **D:** and **delete them**. The drive is now empty — exactly the disaster you are protecting against.

---

## Restoring

**EC2 → Snapshots**, select your snapshot → **Actions → Create volume from snapshot**.

It offers **15 GB**, the original size. Then:

- **Choose the availability zone.** Picking a **different** one here is how you effectively move a volume across AZs.
- **You may enable encryption** at this point — the workaround for a volume you forgot to encrypt.

Click **Create volume**.

---

## Reattaching

The restored volume appears as **available**. Select it → **Actions → Attach volume** → choose your instance. The instance now has **two 15 GB volumes** attached.

In **Disk Management** the new disk appears. Right-click → **Online**, then **Initialize**.

> **You do not need to format it.** The file system and the data are already on it — formatting would erase exactly what you are restoring.

Open the drive: **your files are back**.

---

## Clean Up

1. **Detach and delete** the now-empty original volume — wait for it to leave the **in-use** state first.
2. **Terminate the instance.** This deletes the **30 GB root volume** automatically.
3. **The added 15 GB volume is not deleted with it** — delete that yourself.
4. Go to **Snapshots** and **delete the snapshot**.

> ⚠️ **Snapshots keep costing money until you delete them.** Terminating the instance does not remove them.
`,
    },
    {
      id: "ebs-snapshot-use-cases",
      title: "EBS – What Snapshots Unlock",
      shortDesc: "Changing availability zone, adding encryption, and copying a volume across regions",
      visuals: ["SnapshotUseCaseFlow"],
      content: `## Beyond Backup

Backup is the primary use of a snapshot. But snapshots are also the **only** way around three hard limits on EBS volumes — and the pattern is identical in all three cases.

> **Snapshot the volume, then create a NEW volume from that snapshot** with whatever property you could not change directly.

---

## Use Case 1 — Change the Availability Zone

**The limit:** your volume is in **ap-south-1a** but your instance is in **ap-south-1b**. They must match, and **nowhere in the console is there an option to change a volume's availability zone**.

**The fix:**

1. Select the volume → **Actions → Create snapshot**
2. **Snapshots → Actions → Create volume from snapshot**
3. Choose **ap-south-1b** as the availability zone
4. Attach the new volume, and delete the old one

Your data comes across intact.

---

## Use Case 2 — Add Encryption After the Fact

**The limit:** you forgot to encrypt at creation. **Actions → Modify volume** shows no encryption option, and never will.

**The fix:**

1. Select the volume → **Actions → Create snapshot**
2. **Snapshots → Actions → Create volume from snapshot**
3. **Tick Encrypt** and choose a **KMS** key
4. Attach the new encrypted volume, and delete the old one

> Encrypting your volumes is always worth doing — it gives you better security for essentially no operational cost.

---

## Use Case 3 — Copy to Another Region

**The limit:** everything is in **Mumbai** but you need this volume in **N. Virginia**. **Volumes cannot be copied across regions.**

**The fix** — note this one has an extra step:

1. Select the volume → **Actions → Create snapshot**
2. Select the **snapshot** → **Actions → Copy snapshot**
3. Set the **destination region** to **us-east-1**
4. **Switch to that region**, then create a volume from the copied snapshot

The volume now exists in N. Virginia with all your data, ready to attach to any instance there.

---

## Summary

| You want to change | Directly possible? | Via snapshot |
|---|---|---|
| **Availability zone** | ❌ | ✅ Create volume from snapshot in the target AZ |
| **Encryption** | ❌ | ✅ Tick Encrypt while creating the volume |
| **Region** | ❌ | ✅ **Copy snapshot** to the region first |
| **Size (increase)** | ✅ Modify volume | — |
| **Size (decrease)** | ❌ | ❌ Not possible at all |

> Remember to clean up in **both** regions when experimenting — a copied snapshot in another region is easy to forget, and it keeps billing.
`,
    },
    {
      id: "ebs-fast-snapshot-restore",
      title: "EBS – Fast Snapshot Restore",
      shortDesc: "When restoring a terabyte-scale snapshot is too slow — and why you usually skip this",
      visuals: [],
      content: `## The Problem It Solves

Creating a volume from a snapshot feels instant in a lab — but only because **the snapshot is small**.

In the real world EBS volumes run to **terabytes**, so their snapshots are correspondingly large. Restoring one of those takes **considerable time** before the volume is usable.

If **mission-critical data** is sitting in that snapshot and you need the volume **immediately**, that delay is a genuine problem.

---

## What Fast Snapshot Restore Does

**Fast Snapshot Restore (FSR)** speeds up that restoration so the new volume can be used **straight away**.

**To enable it:** EC2 → **Snapshots** → select the snapshot → **Actions → Manage fast snapshot restore** → enable it for the availability zones you need.

---

## Why You Should Usually Leave It Off

> ⚠️ **FSR is a paid feature**, and AWS makes the terms explicit when you enable it: it is **billed per minute, with a one-hour minimum, for EACH availability zone in which it is enabled.**

So the cost multiplies by availability zone, and starts accruing the moment you switch it on.

**If your volumes are small, you do not need this at all** — the restore is already fast enough.

---

## When to Reach for It

Enable FSR only when **all** of these are true:

- The snapshot is **large** — terabyte-scale.
- The data is **mission critical**.
- You need the restored volume **usable immediately**, not after a wait.

In that situation, paying extra to remove the delay is worth it.

> **The exam-relevant summary:** fast snapshot restore trades money for restore speed, is enabled **per snapshot per availability zone**, and is unnecessary for small volumes.
`,
    },
    {
      id: "ebs-dlm",
      title: "EBS – Data Lifecycle Manager (Automated Snapshots)",
      shortDesc: "Scheduling snapshots by tag, with retention rules so backups do not pile up",
      visuals: ["DLMPolicyVisual"],
      content: `## Why Automate

Taking snapshots of critical volumes is good practice — but taking them **manually** means **you might forget**.

**Data Lifecycle Manager (DLM)** is the automation for exactly that: **scheduled, automatic volume snapshots**.

---

## Step 1 — Tag the Volume

DLM targets resources **by tag**, so the volume needs one.

Create a volume (10 GB is plenty for a test) and under **Tags** click **Add tag** — for example a tag named **learning-DLM**.

> You can verify the tag on the volume's detail page afterwards.

---

## Step 2 — Create the Policy

Go to **EC2 → Lifecycle Manager**. Three policy types are offered:

| Policy type | Purpose |
|---|---|
| **EBS snapshot policy** | Scheduled snapshots of volumes — **what we want** |
| **EBS-backed AMI policy** | Scheduled AMIs |
| **Cross-account copy event policy** | Copying to other accounts (disaster-recovery territory) |

Choose **EBS snapshot policy** and click **Next**.

---

## Step 3 — Choose the Target

**Target resource type** can be:

- **Volume** — snapshots that volume.
- **Instance** — snapshots **all volumes attached to that instance**.

Choose **Volume**.

Then set the **target resource tag** to **learning-DLM**.

> ⚠️ **If you specify no tag, the policy applies to ALL your EBS volumes.** Tagging is what scopes it to the one volume you intend.

Add a description, leave the default **IAM role**, set **Policy status** to **Enabled**, and continue.

---

## Step 4 — Set the Schedule

Name the schedule (for example **SC1**) and choose a **frequency** — daily, weekly, monthly, yearly, or a **custom cron expression**.

For example: **every 24 hours, starting at 09:00 UTC**. From then on, a snapshot is taken every morning at that time.

> **You can add multiple schedules** to one policy — say a daily one and another every 12 hours.

---

## Step 5 — Retention — the Part That Matters

Take a snapshot every day and after a month you have **30 snapshots**, all costing money. Older ones are largely pointless once newer ones exist.

Two retention types:

- **Count** — keep the last **N** snapshots. Set it to **2**, and once Wednesday's snapshot completes, **Monday's is deleted automatically**, leaving Tuesday and Wednesday.
- **Age** — keep snapshots for **N days**, deleting anything older. Set 15 days and a snapshot is removed once it passes that age.

Review the policy and click **Create policy**. The summary shows your schedule.

---

## Pausing and Deleting

To stop it running without deleting it: **Modify lifecycle policy** → set the status to **Disabled**. That **pauses** the policy; re-enable it whenever you want.

To remove it entirely: select it → **Actions → Delete lifecycle policy**.

> ⚠️ **Clean up when you are learning.** Leave a DLM policy running and it keeps producing snapshots — and you keep paying for them. Delete the policy **and** the test volume.
`,
    },
    {
      id: "efs-intro",
      title: "EFS – Why Shared Storage Changes Everything",
      shortDesc: "The problem EBS cannot solve, and the three real use cases for EFS",
      visuals: ["EFSvsEBSShared", "EFSUseCases"],
      content: `## Start With a Website

You want to host a website on AWS and you want **high availability** — the site must stay up 24/7, even if an availability zone fails.

So you run **two EC2 instances in separate availability zones**: one in **ap-south-1a**, one in **ap-south-1b**. A user can be served by either, and both must show an **identical** site.

---

## What Happens If You Use EBS

**EBS is not shared storage** — it is directly attached, and it cannot be shared across instances.

So you need **two EBS volumes**, one per instance, each holding **its own copy of the website**.

With two instances that is merely annoying. Now scale it:

> **Ten instances means ten EBS volumes, each with its own copy of the site.**

And websites get updated. Every update means **updating the site on all ten volumes**, one at a time — and every one of them is a chance to miss one and serve inconsistent content.

---

## What Happens If You Use EFS

**EFS is shared storage.** One file system, accessible from **any number of EC2 instances**.

Put the website on the EFS volume **once**. Both instances read it from there.

> Run **100** instances and update the site **once** on EFS — **every instance serves the change immediately.**

That is the entire value proposition.

---

## The One Big Limitation

> ⚠️ **EFS is Linux only.** It is built on **NFS**, so it works with **Linux instances** and not Windows.

Wanting the same thing for Windows instances is exactly what **FSx** is for — covered later in this section.

---

## Three Use Cases

**1 · Centrally hosted website.** The scenario above — one copy of the site, served by many instances.

**2 · File server.** Ten instances acting as workstations, all producing data. Instead of managing **ten EBS volumes**, store everything **centrally on EFS**. One thing to look after rather than ten.

**3 · Cloud storage for on-premises workstations.** You have ten workstations in your office and you do not want data sitting **locally** on each of them. Have every workstation write into EFS instead.

> How do on-premises machines reach a cloud file system? Through a **VPN**, or via **Direct Connect** — both covered in the networking section.

---

## EFS vs EBS at a Glance

| | EBS | EFS |
|---|---|---|
| **Shared?** | ❌ One instance at a time | ✅ Many instances at once |
| **Update once, seen everywhere?** | ❌ Update each volume | ✅ Update one file system |
| **OS support** | Linux and Windows | **Linux only** |
| **Spans availability zones?** | ❌ Tied to one AZ | ✅ Reachable from multiple AZs |
| **Size** | You provision it | **Grows automatically** |
`,
    },
    {
      id: "efs-config-options",
      title: "EFS – Configuration Options Explained",
      shortDesc: "Storage classes, lifecycle management, throughput mode and performance mode",
      visuals: ["EFSConfigExplorer", "EFSThroughputPerformance", "RestaurantAnalogy"],
      content: `## Why These Options Matter

Creating a file system is two clicks if you accept the defaults. **Click Customize instead** — understanding these options is how you **save your company real money**.

---

## Storage Class — Standard vs One Zone

**Standard** — AWS **replicates your data across multiple availability zones** automatically. Use it for **critical data** you must have in any circumstance.

**One Zone** — data lives in **a single availability zone**, and costs **less**.

> ⚠️ The trade-off is exactly what it sounds like: **if that availability zone is unavailable, you cannot reach your data.**

Use One Zone for **non-critical data** — for example, data you already back up on-premises and are merely copying to the cloud.

---

## Automatic Backups

The same logic applies. **Critical data → enable automatic backup.** Non-critical data → you can turn it off and save the cost.

---

## Lifecycle Management — Hot and Cold Data

Two kinds of data live on any file system:

- **Hot data** — accessed frequently.
- **Cold data** — stored, rarely touched.

**A concrete example.** You and your team are working on a client project for the next three months, opening those files daily — that is **hot** data. Three months later the project ends, you move to something new, but the files stay on EFS for reference. Nobody opens them any more — now it is **cold** data.

AWS pricing follows that distinction: **Standard** for hot data, **Infrequent Access** for cold data, which costs **less**.

**Lifecycle management does the sorting for you.** Set a rule such as:

- **Not accessed for 30 days** → move automatically to **Infrequent Access**.
- **Transition out:** if a file **is** accessed again, move it **back** to Standard.

> In a corporate environment with **terabytes** of data, this one setting saves enormous amounts of money — and it is entirely automatic.

---

## Encryption

Government and compliance standards generally require **data at rest to be encrypted**. Enable it and AWS handles it — anyone who somehow reached the data could not read it.

Encryption uses **KMS (Key Management Service)**, which has its own dedicated section later.

---

## Throughput Mode vs Performance Mode

Two different numbers, and this is where people get confused. Both matter.

> **Throughput mode = how much DATA can be processed per second.**
> **Performance mode = how many REQUESTS can be handled per second.**

**The restaurant analogy.** Your kitchen can cook **50 dishes per second** — that is your **throughput**. But those dishes must reach the tables, and that takes **waiters** — that is your **performance mode**. Cook 50 per second with too few waiters and the dishes never arrive. **You need both.**

---

## Throughput Mode — Bursting vs Enhanced

**Bursting** ties throughput to **how much data you have stored**. Roughly: **1 GB stored ≈ 50 KB/s** baseline. Store 2 GB and the baseline doubles.

Like gp2 volumes, unused capacity accumulates as **credit**, so during a spike you can **burst to roughly double** the baseline — around 100 KB/s on that 1 GB example.

> The catch is the same as gp2: **your speed depends on how much you happen to be storing**, not on what you need.

**Enhanced** breaks that link, and offers two choices:

- **Elastic** — you get whatever throughput you need, **regardless of how much data is stored**. No limit. ⚠️ Because there is no limit, a burst of heavy requests can produce **a large bill**.
- **Provisioned** — you **specify** the throughput, for example **1,024 MiB/s**, and get that **consistently** whether you store 1 GB or 100 GB.

> **Critical application needing dependable speed → Enhanced.** Non-critical where the baseline is fine → **Bursting**.

---

## Performance Mode — General Purpose vs Max I/O

- **General Purpose** — moderate IOPS. The default, and right for most workloads.
- **Max I/O** — **higher IOPS**. In restaurant terms: you can cook 50 dishes *and* you have 50 waiters to deliver them.

---

## Summary

| Setting | Options | Choose based on |
|---|---|---|
| **Storage class** | Standard · One Zone | Critical vs non-critical data |
| **Automatic backup** | On · Off | Critical vs non-critical data |
| **Lifecycle management** | Transition after N days · transition out | Hot vs cold data — big cost saver |
| **Encryption** | On · Off (KMS) | Compliance requirements |
| **Throughput mode** | Bursting · Enhanced (Elastic / Provisioned) | How much **data** per second |
| **Performance mode** | General Purpose · Max I/O | How many **requests** per second |
`,
    },
    {
      id: "efs-lab",
      title: "Lab – Shared EFS Across Two Availability Zones",
      shortDesc: "Two Linux instances, two AZs, one file system — with best-practice security groups",
      visuals: ["EFSLab", "EFSLabSteps"],
      content: `## What You Are Building

Everything happens in the **Mumbai** region:

- **Two Linux EC2 instances** — one in **ap-south-1a**, one in **ap-south-1b**. Linux, because **EFS supports Linux only**.
- **web-SG** — protects the instances. Inbound **TCP 22 (SSH)** from anywhere so you can reach them; outbound all traffic.
- **One EFS file system**, shared by both instances.
- **efs-SG** — protects the file system. Inbound **TCP 2049 (NFS)**.

> Labs here follow **AWS best practices**, which sometimes makes them longer than you expect. Understanding *why* each step exists is what makes exam questions easy later.

---

## The Security Group Best Practice

This is the part worth internalising.

When creating **efs-SG**, the inbound NFS rule's **source is not 0.0.0.0/0**. The source is **web-SG** — the security group itself.

> **Only instances that are members of web-SG can reach the file system.** Nothing else can, and you never maintain a list of IP addresses.

Add a third or fourth instance to web-SG later and it gains access automatically.

---

## Step 1 — Create Both Security Groups

**web-SG:** inbound **SSH, port 22, from anywhere (0.0.0.0/0)**. Outbound default.

**efs-SG:** inbound type **NFS** — the console fills in **TCP 2049** automatically — with **source = web-SG**. Outbound default.

---

## Step 2 — Launch Two Instances in Different AZs

**efs-vm1:** Amazon Linux, t2.micro, your key pair. Under **Network settings → Edit**, set the subnet to **ap-south-1a**, and choose **Select existing security group → web-SG**.

**efs-vm2:** identical, but subnet **ap-south-1b**, and the **same web-SG**.

> ⚠️ **Do not set "Number of instances" to 2 on one launch.** Both would land in the **same subnet**. Launching them separately is what puts them in different availability zones — which is the entire point of the high-availability design.

---

## Step 3 — Create the File System

**EFS → Create file system.** Name it **shared-storage**, then click **Customize** rather than Create, so you actually see the options.

- **Storage class:** Standard
- **Automatic backup:** off for this lab
- **Encryption:** off for this lab
- **Throughput mode:** Enhanced → **Elastic**
- **Performance mode:** General Purpose

> Notice there is **no size to specify**. You never say "create a 100 GB file system" — EFS grows automatically and **you pay for what you actually store**. Store 5 GB, pay for 5 GB.

---

## Step 4 — Mount Targets (The Critical Screen)

The network screen lists each availability zone with a **mount target**.

Keep **ap-south-1a** and **ap-south-1b** — the AZs where your instances live. For **each one**, **remove the default security group and select efs-SG** instead.

> ⚠️ **An instance can only reach EFS from an availability zone that has a mount target.** Leave **ap-south-1c** without one and any future instance there **cannot access the file system**. You can always add a mount target later, but it must exist before access works.

Click through **Next → Next → Create**.

---

## Step 5 — Prepare Both Instances

SSH into each instance:

**ssh -i cloud-fox-key.pem ec2-user@public-ip**

Then on **each** one:

1. Become root: **sudo -i**
2. Install the helper: **yum install amazon-efs-utils**

> ⚠️ **Install this on both servers.** Without **amazon-efs-utils** the mount command will not work.

---

## Step 6 — Mount It

On each instance create the mount point: **mkdir efs**

Then in the EFS console select your file system and click **Attach**. Copy the mount command it displays, and **run it on both instances**.

---

## Step 7 — Prove That It Is Shared

On **instance one**: change into the **efs** directory and create a file with some text in it. Run **ls** and it is there.

Switch to **instance two**: change into **efs** and run **ls** — **the same file appears**. Use **cat** and the contents are identical.

Now create a **different** file on instance two, and look for it from instance one. **It is there too.**

> Two instances, two availability zones, one file system. This is exactly the website scenario: update once, and every instance serves the change.

---

## Step 8 — Clean Up

1. **Terminate both EC2 instances.**
2. **EFS → select the file system → Delete**, pasting the file system ID to confirm. Deleting the mount targets takes a moment.
3. Delete the two **security groups** if you no longer need them.

> ⚠️ **Delete every lab resource.** Forget, and a bill arrives later for something you are not using.

> Shared storage solves a genuine problem — but it is **Linux only**. The Windows answer is **FSx**, which comes next.
`,
    },
    {
      id: "fsx-intro",
      title: "FSx – Fully Managed File Systems",
      shortDesc: "Why FSx exists beyond EFS, the four file systems, and the five benefits",
      visuals: ["FSxFileSystemSelector", "FSxBenefits"],
      content: `## What FSx Is

**FSx is a file storage service from AWS**, and two words in that description carry the weight: **fully managed** and **file storage**.

We already have **EBS** (directly attached) and **EFS** (shared). So why another shared file service?

> **Because EFS has one hard limitation: you cannot use Windows instances with it.**

Corporate environments run **many different storage systems**, and FSx provides **four** of them under a single service — which is why it is considerably more capable than EFS.

---

## What "Fully Managed" Means

You do not set up:

- a **server**
- a **physical environment**
- any **networking components**
- an **operating system**
- any **software**
- **updates**

> **You get your disk ready to use.** That is the entire proposition.

---

## Highly Optimised Third-Party File Systems

This is the distinctive part. FSx does not offer an AWS-invented file system — it offers **established third-party ones**, so companies already running them on-premises get the **same experience** in the cloud.

Open **FSx → Create file system** and you are offered **four**:

| File system | Built for |
|---|---|
| **FSx for NetApp ONTAP** | NetApp's storage platform, used on-premises since the late 1990s |
| **FSx for OpenZFS** | The open source ZFS-derived file system |
| **FSx for Windows File Server** | Native Windows **SMB** file serving |
| **FSx for Lustre** | **HPC** — high performance computing and parallel data access |

---

## What Can Connect to It

- **EC2 instances** — and, like EFS, from **multiple** instances at once
- **ECS** — Elastic Container Service
- **EKS** — Elastic Kubernetes Service
- **On-premises infrastructure**

> ECS and EKS are container services covered later in the course. For now, just note that FSx supports both.

---

## Five Benefits

**1 · Fully managed** — no server, no workstation, no networking equipment, no hard drives, no operating system to run.

**2 · Scalable** — scaling storage is genuinely hard on-premises. Fill a 10 TB array and you must physically add more. FSx starts at a **minimum of 1 TB** and scales to **petabytes**.

**3 · Performance** — low latency and high speed access.

**4 · Secure** — **one-click encryption**, exactly as with EFS.

**5 · Cost effective** — buying storage and wiring it to many virtual machines is an expensive project. Here it is on demand: **stand it up in about 30 minutes**, and delete it just as easily.

---

## Use Cases

- **Lift and shift of Windows-based applications** — you have SMB storage on-premises and want the same thing in the cloud, so migration is straightforward.
- **File sharing and collaboration** — shared storage across many instances or virtual machines.
- **High performance computing** — via **Lustre**.
- **Backup and disaster recovery** — keep backup or DR storage in the cloud rather than buying a second set of hardware.

> Each of the four file systems gets its own topic, because as a solutions architect **you** are the one deciding which fits your organisation.
`,
    },
    {
      id: "fsx-ontap",
      title: "FSx – NetApp ONTAP",
      shortDesc: "What NetApp and ONTAP are, the deployment forms, and ONTAP's features in FSx",
      visuals: ["ONTAPDeploymentExplorer"],
      content: `## First: Who Is NetApp?

**NetApp is a multinational technology company for data management.** Originally called **Network Appliances**, later shortened to NetApp.

It is particularly known for **NAS** products, with a reputation for **reliability and service quality**.

> A useful contrast: **EMC** is best known for **SAN** — storage area network, a form of **block** storage. **NetApp** is best known for **NAS** — network attached storage, which is **file** storage.

NetApp provides hardware and software for **data storage, protection, management and sharing**.

---

## What Is ONTAP?

**ONTAP is NetApp's flagship storage operating system.**

That word matters: it is **a full operating system**, not a piece of software running on top of one. It is not based on Linux or Windows. It exists purely to **manage storage**.

> Your computer has Windows or Linux. A NetApp NAS has **ONTAP**.

---

## The Three Deployment Forms

NetApp adapted ONTAP across three eras — on-premises, virtualization, and cloud:

| Form | What it is |
|---|---|
| **ONTAP 9** | The operating system that ships **with NetApp hardware**. Buy a NetApp array and this is what runs on it. |
| **ONTAP Select** | **Software-defined storage** deployed as a **virtual appliance** on your existing hardware. Turns an ordinary virtual machine into ONTAP storage — all the ONTAP advantages, no NetApp hardware purchase. |
| **Cloud Volumes ONTAP (CVO)** | Built **specifically for cloud**, and available in the cloud only. Used by **AWS, Google Cloud and Azure**. |

**Cloud Volumes ONTAP is what FSx gives you** — the same ONTAP experience, delivered as a **managed service**.

---

## ONTAP's Features in FSx

| Feature | Detail |
|---|---|
| **Latency** | **Under 1 ms** |
| **Max throughput** | **4–6 GB/s** per file system |
| **Max file system size** | **Virtually unlimited** — no provisioning of drives |
| **Client compatibility** | **Windows, Linux and macOS** |
| **Protocols** | **SMB**, **NFS** and **iSCSI** |
| **AWS compute** | **EC2**, **ECS**, **EKS** |
| **Active Directory** | ✅ Supported |
| **Antivirus integration** | ✅ Supported |
| **Deployment** | **Single-AZ** and **Multi-AZ** |
| **SLA** | **99.9%** Single-AZ · **99.99%** Multi-AZ |

> **The protocol row is ONTAP's biggest advantage.** Supporting SMB *and* NFS *and* iSCSI means one file system serves Windows clients, Linux clients and block-level access simultaneously — which is exactly what a mixed corporate estate needs.

Deploy across **Multi-AZ** when you need high availability; the SLA rises to **four nines**, the best available.
`,
    },
    {
      id: "fsx-ontap-lab",
      title: "Lab – FSx for NetApp ONTAP as Shared Storage",
      shortDesc: "Two Linux instances across AZs sharing an ONTAP volume over NFS",
      visuals: ["FSxONTAPLab"],
      content: `## What You Are Building

Two **Linux** servers in **different availability zones**, both using a shared **FSx for NetApp ONTAP** file system over **NFS**.

> Because ONTAP supports SMB and iSCSI too, the same file system could serve Windows clients — but this lab uses NFS.

---

## Step 1 — Two Security Groups

**server-SG** — protects both instances. Inbound **SSH (22)** from anywhere; outbound all traffic.

**ontap-SG** — protects the file system. Inbound **TCP 111** and **TCP 2049**, both sourced from **server-SG**.

> ⚠️ **Port 2049 appears in the type dropdown as NFS, but 111 does not.** For 111 you must choose **Custom TCP** and type the port number yourself. Miss it and the mount will fail.

---

## Step 2 — Two Linux Instances

**server1** — Amazon Linux, t2.micro, subnet **ap-south-1a**, security group **server-SG**, public IP enabled.

**server2** — identical, but subnet **ap-south-1b**.

---

## Step 3 — Create the File System

**FSx → Create file system → Amazon FSx for NetApp ONTAP → Next.**

Choose **Standard create** rather than **Quick create**, so you see every option.

- **Name:** new-ontap
- **Deployment type:** **Single-AZ** (Multi-AZ gives more redundancy but takes longer to create)
- **Storage capacity:** minimum **1024 GB (1 TB)**
- **Provisioned IOPS:** **Automatic** gives **3 IOPS per GB** — the same rule as gp2. Choosing **User-provisioned** lets you set your own, up to **80,000 IOPS**, at extra cost.
- **Throughput capacity:** default **128 MB/s**, configurable up to **2048 MB/s** at extra cost.
- **VPC:** default. **Security group:** **ontap-SG**.
- **Preferred subnet:** the AZ to place it in.
- **Encryption:** enabled by default — leave it.

---

## Step 4 — Storage Virtual Machine and Volume

FSx creates a **storage virtual machine (SVM)** for ONTAP. Name it, and optionally set a password so you can log in later and run **ONTAP operating system commands** directly.

> You can also join the SVM to **Active Directory** here, which is what unlocks **SMB** for Windows clients. This lab skips it.

Then create a **volume**:

- **Name:** volume_1, **size:** e.g. 500 MB (minimum 20 MB, within your 1 TB)
- **Access:** read-write
- **Storage efficiency** — ONTAP's **deduplication and compression**. Disabled for this lab.
- **Snapshot policy:** none. **Backup:** disabled for this lab.

---

## Step 5 — Read the Confirmation Screen Properly

The review screen colour-codes every setting, and this confuses people:

> **Red entries are not errors.** They mark settings you **cannot change after creation** — most importantly, **a Single-AZ file system cannot later be converted to Multi-AZ**. **Green entries can be edited afterwards**, such as growing that 500 MB volume to 700 MB.

Click **Create file system**. **Expect 15–30 minutes.**

---

## Step 6 — Mount It on Both Servers

SSH into both instances and become root with **sudo -i**.

In the console open your file system → **Volumes** → select the volume. FSx displays **mount commands for both Linux and Windows**.

1. Run the command that **creates the mount directory** — it makes an **fsx** folder. Confirm with **ls**.
2. Run the **mount command** on both servers. **No error means success.**

---

## Step 7 — Prove It Is Shared

Change into **/fsx** on server1 and run **ls**. Create a file with some text.

Switch to server2, change into **/fsx**, run **ls** — **the same file is there**, and **cat** shows the same contents. Create a directory from server2 and it appears on server1.

> One ONTAP volume, two servers, two availability zones.

---

## Step 8 — Delete in the Right Order ⚠️

Try to delete the file system first and **AWS refuses**: *"the file system has a storage virtual machine."*

**The order is:**

1. **Delete the volume**
2. **Delete the storage virtual machine**
3. **Delete the file system**
4. **Terminate both EC2 instances**

Each step takes time — wait for one to finish before starting the next.

> ⚠️ **Do not forget this cleanup.** ONTAP provisions a minimum of 1 TB, so leaving it running is expensive.
`,
    },
    {
      id: "fsx-openzfs",
      title: "FSx – OpenZFS",
      shortDesc: "From Sun's ZFS to the community fork, and the data-integrity features that define it",
      visuals: ["OpenZFSTimeline"],
      content: `## Where ZFS Came From

In **2001**, **Sun Microsystems** set out to build a file system that could store **huge amounts of data** while solving **data corruption**. The result was **ZFS**.

- **2005** — Sun ships ZFS with the **Solaris** operating system.
- **2008** — Sun **open-sources** it, so the community can contribute.
- **2010** — **Oracle acquires Sun**, and Oracle prefers closed source. ZFS development is closed.

But by then the open source project had a substantial community. Those contributors **continued the work under a new name: OpenZFS**.

> **OpenZFS is not a single company's product.** It is developed by community members — which is the **first big difference** from **NetApp ONTAP**, a closed-source proprietary product.

The same story repeats almost exactly with **Lustre** later in this section.

---

## Data Integrity Features

Being open source does not mean fewer features. These are what ZFS is known for:

**Data health.** It **detects and corrects data corruption** — the file system itself can tell whether data is intact.

**Copy on write.** Rather than overwriting original data, it **writes copies**. The original stays intact, so if something goes wrong the data can be restored from it. This is the core defence against corruption.

**Checksums.** When data is copied or transferred, checksums **verify integrity**.

**RAID-Z.** ZFS's own take on RAID — preventing data loss when a **drive fails**, the same purpose as RAID 0/1/5/10.

**Atomic transactions.** An operation **completes fully or not at all**, reducing the risk of a half-written state.

**Snapshots and cloning.** Point-in-time copies you can restore from.

---

## Scalability

ZFS handles **terabyte-scale** data through **storage pools**: group multiple storage devices together into a pool, and **add more devices to grow it**. Effectively a clustered storage approach.

---

## Compatibility — the Key Structural Difference

> ⚠️ **OpenZFS is not an operating system.** It is software that **requires a host operating system** — specifically **Linux** (any distribution, or FreeBSD).
>
> **ONTAP is a full operating system**, installable directly on bare metal or a virtual machine with nothing underneath it.

That single distinction explains most of the differences between the two.

---

## Advanced Features

- **Compression** — reduce data size and save space.
- **Deduplication** — store three identical 100 MB files and, without dedup, they occupy **300 MB**. With dedup, the data is stored **once** at 100 MB and the rest reference it.
- **Tiered storage** — separate **hot** and **cold** data by access pattern.

---

## Community Development

Open source means **thousands of contributors** rather than one company's programmers, which in practice means **regular updates and improvements**.

> No licence fee, either — the next topic compares OpenZFS and ONTAP directly so you can choose between them.
`,
    },
    {
      id: "fsx-openzfs-vs-ontap",
      title: "FSx – OpenZFS vs NetApp ONTAP",
      shortDesc: "The ten-point comparison that decides which file system fits your organisation",
      visuals: ["OpenZFSvsONTAP", "FSxAllFourMatrix"],
      content: `## Why This Comparison Matters

FSx offers four file systems and **you** are the decision maker. This comparison is what makes that decision defensible.

---

## The Technologies Themselves

| | OpenZFS | NetApp ONTAP |
|---|---|---|
| **Nature** | **Open source**, community developed | **Proprietary** operating system from NetApp |
| **Licensing** | **No licence fees** | **Licence fees apply** |
| **Operating system** | **Not** an OS — needs a **host OS** (Linux) | **Is** a full OS — needs nothing underneath |
| **Purpose** | General file system with strong data protection | **Purpose-built** for storage and data management |

---

## Typical Use Cases

**OpenZFS suits:**

- **Small to medium** enterprise storage
- **Personal cloud** storage
- **Archival and backup** storage

**ONTAP suits:**

- **Large enterprise** data management
- **Hybrid cloud** — on-premises plus AWS together
- **Virtualized storage** environments

---

## The Ten-Point Comparison in FSx

| # | | ONTAP | OpenZFS | Winner |
|---|---|---|---|---|
| 1 | **Latency** | < 1 ms | **0.5 ms** | OpenZFS |
| 2 | **Max throughput** | 4–6 GB/s | **10–21 GB/s** | OpenZFS |
| 3 | **Max file system size** | **Virtually unlimited** | 512 TB cap | ONTAP |
| 4 | **Client compatibility** | Windows, Linux, macOS | Windows, Linux, macOS | Tie |
| 5 | **Protocols** | **SMB, NFS, iSCSI** | NFS only | ONTAP |
| 6 | **AWS compute** | EC2, ECS, EKS | EC2, ECS, EKS | Tie |
| 7 | **Active Directory** | ✅ Supported | ❌ Not supported | ONTAP |
| 8 | **Antivirus integration** | ✅ Supported | ❌ Not supported | ONTAP |
| 9 | **Deployment** | Single-AZ, Multi-AZ | Single-AZ, Multi-AZ | Tie |
| 10 | **SLA** | 99.9% / **99.99%** Multi-AZ | 99.5% | ONTAP |

---

## How to Read That

**OpenZFS wins on raw speed** — lower latency and substantially higher throughput.

**ONTAP wins on everything organisational:**

- **Protocols** — SMB and iSCSI alongside NFS means Windows clients and block access, not just Linux.
- **Active Directory** — most companies already centralise identity there. OpenZFS cannot join it at all.
- **Antivirus integration** — often a compliance requirement.
- **Capacity and SLA** — unlimited size and four nines.

> **The rule of thumb:** need speed for a Linux-only workload with no Active Directory requirement, and OpenZFS is excellent and free. Need a **mixed Windows/Linux corporate environment** with identity, antivirus and unlimited growth, and **ONTAP** is worth its licence fee.
`,
    },
    {
      id: "fsx-windows-file-server",
      title: "FSx – Windows File Server",
      shortDesc: "Native SMB file serving, and the on-premises problems it removes",
      visuals: ["WindowsFileServerScenario"],
      content: `## The Problem

You have four Windows machines producing data. Store it **locally on each** and you face two problems immediately:

- **You must look after four hard drives.** If any one fails, that data is gone.
- **You must back up four systems.**

Four is manageable. **Now imagine 40** — backing up forty machines every day is a genuine burden for a system administrator.

---

## The Traditional Answer — a File Server

Build one server (physical or a VM), install **Windows**, and configure **SMB — Server Message Block**, Microsoft's native storage protocol. Once configured, we call it a **file server**.

Now all four machines store data **centrally** over SMB. This arrangement is extremely common.

---

## But On-Premises It Brings Its Own Problems

**Challenge 1 — availability and maintenance.** All your data now sits in one place, so if the server is down for even 10 or 20 minutes, **everyone's work stops**. You are responsible for:

- **High availability** of the file server
- **Operating system updates**
- **Antivirus updates**
- **Setting up and configuring SMB**

**Challenge 2 — scalability.** Four machines becomes forty. Now you must:

- **Increase storage capacity** — perhaps from 1 TB to 16 TB
- **Increase network bandwidth**, because many machines are writing at once

Managing that on-premises is genuinely difficult.

---

## What FSx for Windows File Server Changes

You get the **same native Windows SMB storage**, as a **managed service**:

| On-premises | FSx for Windows File Server |
|---|---|
| Create and maintain a VM | ❌ Not your concern |
| Manage the Windows OS and updates | ❌ Not your concern |
| Manage antivirus | ❌ Not your concern |
| Ensure high availability | ❌ Not your concern |
| **Configure SMB** | ✅ **This is all you do** |
| Manually add storage and bandwidth | ✅ Scale to **terabytes** on demand |

---

## What Can Connect

- **EC2 instances**
- **ECS** containers
- **EKS** containers
- **On-premises servers**

---

## The Prerequisite You Cannot Skip

> ⚠️ **Windows environments depend heavily on Active Directory.** Attempting to set up FSx for Windows File Server without understanding Active Directory will not go well.

That is why **Active Directory is the next topic** — it is both a prerequisite here and a recurring requirement across AWS services, notably **IAM** later in the course.
`,
    },
    {
      id: "fsx-active-directory",
      title: "FSx – Active Directory (Prerequisite)",
      shortDesc: "Why centralised identity exists, and how it authorises every file access",
      visuals: ["ActiveDirectoryFlow"],
      content: `## Why Learn This in an AWS Course

**Active Directory is one of the most useful identity and access management services there is**, and it comes up repeatedly:

- **FSx for Windows File Server** requires it.
- **AWS IAM** is much easier to understand once you know it.

---

## How We Got Here — the 1990s Problem

Networking arrives, and one of its best uses is **storing data centrally**. Five computers, one **file server**, no more looking after five separate disks.

But early on there was **no user authentication**. User A stores data; user B can read, change or delete it. There was nothing to stop them.

---

## Step One — Local User Accounts

So user authentication appears: log in with a **username and password**. Now if B tries to delete A's file, the system knows who B is and refuses.

**But the accounts are local to each machine.** A can log in only to the computer where A's account exists.

To let anyone log in anywhere, you must **create every user's account on every computer**. With **100 computers and 100 users**, that is **100 accounts per machine**. And then:

- Someone **leaves** → delete their account on **every** system.
- Someone **joins** → create their account on **every** system.
- Someone **changes their password** → change it on **100 systems**.

This is **decentralised authentication**, and it does not scale.

---

## Step Two — Centralised Directory Services

**1995–96:** Microsoft ships **Windows NT Server** with **NTDS**, the first directory service. It centralised authentication but had shortcomings.

**Windows Server 2000:** Microsoft releases **Active Directory** — still one of its flagship products today.

> **The idea: centralise user management and access management.**

---

## How It Works

Install **Active Directory** on a server and it becomes the **domain controller**, controlling a **domain** with a name such as **xyz.local**.

Then:

1. **Join each workstation to the domain** — a **one-time** process per machine.
2. **Create user accounts once**, in Active Directory.

Now **any user can log in from any workstation**, and you can equally **deny** a specific user access to a specific machine — because **all access management runs through the domain controller**.

---

## How It Authorises File Access

Add a file server — SMB on-premises, **or FSx for Windows File Server** — and join it to the domain. Every access becomes a conversation:

1. **User A logs in** at workstation 1. The workstation asks the domain controller: *"A is trying to log in — allowed?"* → **yes**.
2. **A creates a file** on the file server. The file server asks: *"A is creating a file — allowed?"* → **yes**.
3. **User B tries to open A's file.** The file server asks the domain controller. It **checks the file's ACL** and answers **allow** or **deny**.

> Who may reach the file server, who may store data, who may read it, who may delete it — **every one of those decisions is made by the Active Directory domain controller**.

And that is precisely why Active Directory is a **prerequisite** for FSx for Windows File Server.
`,
    },
    {
      id: "fsx-windows-ad-lab",
      title: "Lab – Build the Active Directory Infrastructure (Part 1)",
      shortDesc: "Three Windows instances, a domain controller, and two joined clients",
      visuals: ["ActiveDirectoryLab"],
      content: `## Why This Comes First

FSx for Windows **depends on Active Directory**, so the domain has to exist before the file system can be created. This part builds the Windows infrastructure; **Part 2** creates the FSx file system on top of it.

> The concept is the same as EFS — shared storage — but the process is **noticeably more involved**, and Active Directory is the reason.

---

## What You Are Building

- **VM-SG** — one security group protecting all three instances
- **ad-server** — the domain controller, in **ap-south-1a**
- **server1** — a client, in **ap-south-1a**
- **server2** — a client, in **ap-south-1b**

All three are **Windows**.

> In a real deployment you would run **multiple domain controllers across availability zones**. One is used here to keep an already-long lab manageable.

---

## Step 1 — Security Group

Create **VM-SG** allowing **all traffic inbound** from anywhere, with the default outbound rule.

> ⚠️ **This is not AWS best practice.** It is done only so that port-by-port rules do not make a long lab longer. Do not carry this into production.
>
> *"Why not just use the default security group, which already allows everything?"* Because creating your own is the habit worth building.

---

## Step 2 — Three Instances

Launch **two at once** in **ap-south-1a** and a **third separately** in **ap-south-1b** — all **Windows Server 2016 Base**, **t2.micro**, your key pair, **VM-SG**.

Name them **ad-server**, **server1** (both 1a) and **server2** (1b).

> **Why 2016 rather than 2019 or 2022?** Speed. t2.micro is modest hardware and newer Windows versions carry more overhead. The steps are identical on any version.

---

## Step 3 — Set the Administrator Password

RDP into **ad-server**, decrypting the password with your key as usual. Then:

**Server Manager → Tools → Computer Management → Local Users and Groups → Users → Administrator → Set Password.**

Use something complex you will reuse throughout — for example **Indian@123** (capital, lowercase, numbers, symbol).

---

## Step 4 — Give It a Static IP ⚠️

The server must not change IP on restart, so pin the address it already has.

1. Open **Command Prompt** and run **ipconfig /all**. Note the **Ethernet adapter's** IPv4 address, subnet mask and default gateway.
2. Press **Windows+R** and run **ncpa.cpl**.
3. Right-click the adapter → **Properties** → **Internet Protocol Version 4** → **Properties**.
4. Choose **Use the following IP address** and enter **exactly** the values you noted.
5. Set **Preferred DNS server** to **127.0.0.1** — this machine will be its own DNS.
6. **Save that IP somewhere** on your own computer. You need it twice more.

> ⚠️ **Get the IP wrong here and you lose the instance permanently.** There is no recovery — you terminate and rebuild. Entered correctly, the RDP session drops for a couple of seconds and reconnects.

---

## Step 5 — Rename the Server

**Server Manager → Local Server** → click the randomly-generated computer name → change it to **ad-server**.

A rename **requires a restart**. While it restarts, connect to **server1** and **server2** over RDP.

---

## Step 6 — Install Active Directory Domain Services

Back on ad-server: **Server Manager → Add Roles and Features** → Next through to the roles list → tick **Active Directory Domain Services** → add the features it requests → Next → **Install**.

> Installing is only half. **Configuring** — promoting the server to a domain controller — is a separate step.

---

## Step 7 — Point the Clients at the Domain Controller

While AD installs, do this on **both** clients:

**Windows+R → ncpa.cpl** → adapter **Properties** → **IPv4 → Properties** → under **Use the following DNS server addresses**, enter **ad-server's IP**.

> ⚠️ **Skip this and the domain join in step 9 will not even prompt you for credentials.** Wrong DNS is by far the most common cause of that failure.

---

## Step 8 — Promote to Domain Controller

A **yellow notification flag** appears on ad-server. Click it → **Promote this server to a domain controller**.

- Select **Add a new forest**
- **Root domain name: clf.local**
- Set the **Directory Services Restore Mode** password
- Click through the checks and **Install**. The server restarts automatically.

> ⚠️ **Use a .local domain, not .com** or any real top-level domain. This is an internal domain and must not collide with public DNS.

---

## Step 9 — Join the Clients to the Domain

Reconnect to ad-server — but now click **More choices → Use a different account** and log in as **administrator@clf.local**. The first login after promotion is slow.

Then on **server1**:

**Server Manager → Local Server → Workgroup → Change** → set the computer name to **server1**, select **Domain**, and enter **clf.local**.

When prompted, enter the **full username administrator@clf.local** and your password.

> ⚠️ **You must use the full user principal name (UPN)** — **administrator@clf.local**, not just "administrator". This is where most people get stuck.

**"Welcome to the clf.local domain"** confirms success. Restart, then repeat on **server2**.

---

## Step 10 — Verify

On ad-server: **Server Manager → Tools → Active Directory Users and Computers → clf.local → Computers**.

**Both server1 and server2 should be listed.**

> ⚠️ **Do not delete anything.** Part 2 uses all of these resources — leave the instances running and stay logged in.
`,
    },
    {
      id: "fsx-windows-lab",
      title: "Lab – FSx for Windows File Server (Part 2)",
      shortDesc: "Create the file system, join it to your domain, and map it as a shared Z: drive",
      visuals: ["FSxWindowsLab"],
      content: `## Picking Up From Part 1

Your Active Directory server and both clients are running and domain-joined. Now you add the **shared storage**.

---

## Step 1 — Security Group for FSx

Create **fsx-SG** with an inbound rule for **All traffic**, with the **source set to VM-SG**.

> Same best practice as the EFS lab: **only the instances in VM-SG can reach the file system.** Nothing else can, and you maintain no IP list.

---

## Step 2 — Log In With the Domain Account ⚠️

Connect to **ad-server**, **server1** and **server2** — and on **every one**, log in as:

**administrator@clf.local**

> ⚠️ **If you are already logged in with a local account, log off and back in with the domain account.** Using local credentials here produces failures later that are genuinely hard to diagnose.

---

## Step 3 — Create the File System

**FSx → Create file system → Amazon FSx for Windows File Server → Next.**

- **Name** it
- **Deployment type:** Single-AZ
- **Storage capacity:** the minimum, **32 GB**
- **VPC:** default
- **Security group:** remove the default and select **fsx-SG**

---

## Step 4 — Join It to Active Directory

This is the step that makes Part 1 necessary.

- **Directory type:** **Self-managed Microsoft Active Directory** — you built your own domain rather than using **AWS Managed Microsoft AD**
- **Fully qualified domain name:** **clf.local**
- **DNS server IP addresses:** **ad-server's static IP** from Part 1
- **Service account username:** **administrator@clf.local**
- **Password:** your domain password

> Lost the IP? RDP into ad-server, open **Command Prompt** and run **ipconfig**. Confirm you are on ad-server before copying it.
>
> **AWS Managed Microsoft AD** is the alternative here — AWS runs the directory for you. Self-managed is used so you can see how the join actually works.

---

## Step 5 — Create and Wait

**Encryption is applied automatically** — for Windows file systems it is **compulsory**, using **KMS**.

The review screen marks which settings **can** and **cannot** be changed after creation. Click **Create file system**.

> **Expect around 20 minutes** before the status reads **Available**.

---

## Step 6 — Attach It

Select the file system and click **Attach**. Copy the **Windows** mapping command it displays.

Open **Command Prompt** on **server1**, paste it, press Enter. **"The command completed successfully"** confirms it worked.

Run the **same command on server2**.

Both servers now show a **Z: drive** in **This PC**.

---

## Step 7 — Prove That It Is Shared

- On **server1**, open **Z:** and create a file. Open **Z:** on **server2** — **the same file is there.**
- Create a second file **from server2**; it appears on server1.
- **Edit** a file created on server2 from server1 and save — both see the change.
- **Delete** a file from one server and it disappears from the other.

> This is the Windows counterpart to the EFS lab: native **SMB** shared storage across instances. **EFS for Linux, FSx for Windows.**

---

## Step 8 — Clean Up

1. **FSx → select the file system → Delete file system.** Decline the final backup, tick the confirmation, paste the **file system ID**, and delete.
2. **EC2 → select all three instances → Instance state → Terminate.**
3. Optionally delete **VM-SG** and **fsx-SG**.

> ⚠️ **Confirm the FSx file system actually finishes deleting** — it is the expensive resource here. Security groups still referenced by other resources will refuse to delete, which is fine; **security groups cost nothing.**

---

## Where This Leaves You

You now have both shared-storage stories complete:

| | Linux | Windows |
|---|---|---|
| **Service** | **EFS** | **FSx for Windows File Server** |
| **Protocol** | NFS | **SMB** |
| **Identity** | Security groups | **Active Directory** |
| **Mounted as** | a directory | a **drive letter** |
`,
    },
    {
      id: "fsx-lustre",
      title: "FSx – Lustre (High Performance Computing)",
      shortDesc: "The HPC file system: 1,000 GB/s throughput, S3 integration, and the exam keyword",
      visuals: ["LustreProfile"],
      content: `## The Exam Keyword

> **If a question mentions HPC or "high performance computing", the answer is almost always Lustre.**

---

## What Lustre Is

**A high performance distributed file system designed for large-scale clusters and supercomputer environments.**

**The name is a clue:** **Lustre = Linux + Cluster**. It is a **clustered file system** built on Linux.

**Distributed** means many **nodes** join together to form one file system. Run a process on one machine and that machine is your bottleneck; spread it across ten and you have a **cluster**. Add nodes to add both capacity and processing power.

**It is open source** — the code is openly available, developed by a global community.

---

## The History (Which Rhymes With OpenZFS)

- **1990s** — **Peter Braam** develops the technology, founding **Cluster File Systems** in **2001**.
- **2007** — **Sun Microsystems** acquires Cluster File Systems.
- **2010** — **Oracle** acquires Sun. Oracle does not favour open source.
- **Then** — communities in the **US and Europe** continue Lustre as an **open source project**.

> Exactly the pattern that produced **OpenZFS** from ZFS. Its popularity as an open project is what led AWS to bring it into FSx.

---

## Use Cases

- **Supercomputing** and **scientific research**
- **Big data analysis**
- **Media and entertainment** — live rendering. Cricket and football matches rendered **as they happen** need enormous parallel storage throughput.
- **Machine learning** — training requires processing vast amounts of data
- **Video processing** and **financial modelling**

---

## Six Advantages in FSx

**1 · Performance** — the reason it exists.

**2 · S3 integration** — pull **unprocessed** data from **S3**, let Lustre process it, and write the **processed** results back to S3. Since S3 is virtually unlimited, this pairing is one of Lustre's most important characteristics.

**3 · Fully managed** — no hardware, no software, no networking to run. Pay as you go.

**4 · Scalability** — **millions of IOPS**.

**5 · Two data repository types** — **Persistent** keeps your data; **Scratch** discards it once processing finishes.

**6 · Deployment speed** — building a Lustre cluster on-premises realistically takes **6–8 months**: hardware, software, networking, space. In FSx it is ready in about **30 minutes**.

---

## Features

| Feature | Lustre |
|---|---|
| **Latency** | Under 1 ms |
| **Max throughput** | **1,000 GB/s** |
| **Max file system size** | **Multiple petabytes** |
| **Client compatibility** | ⚠️ **Linux only** |
| **Protocols** | **Custom POSIX-compliant** — no NFS, no SMB, no iSCSI |
| **AWS compute** | EC2, ECS, EKS |
| **Deployment** | ⚠️ **Single-AZ only** |
| **SLA** | 99.5% |

---

## Two Limits Worth Understanding

**Linux only.** The protocol is **POSIX-compliant**, and **Linux is a POSIX operating system** — so Windows and macOS clients are out. Every other FSx file system supports all three.

**Single-AZ only.** Every other FSx option offers Multi-AZ. Lustre does not, because a Lustre deployment is an **enormous infrastructure** — duplicating it across availability zones would be prohibitively expensive.

---

## Put the Throughput in Context

| File system | Max throughput |
|---|---|
| **NetApp ONTAP** | 4–6 GB/s |
| **OpenZFS** | 10–21 GB/s |
| **Lustre** | **1,000 GB/s** |

> Two orders of magnitude beyond the others. That gap **is** the definition of high performance computing here — and it is why the HPC keyword maps straight to Lustre.
`,
    },
    {
      id: "s3-object-storage-fundamentals",
      title: "Object Storage – How S3 Stores Data",
      shortDesc: "One file equals one object, why that beats blocks at scale, and where object storage is the wrong choice",
      visuals: ["ObjectVsBlock"],
      content: `## Three Storage Families, Three Services

The course has already covered two: **EBS is block storage**, **EFS is file storage**. **S3 is object storage** — a genuinely different method of storing data, not just a different product.

> **Object storage stores data as distinct objects, each with its own unique identifier and metadata, in a flat environment.** Every file you upload becomes exactly one object.

---

## Object vs Block — the Core Difference

| | Object storage (S3) | Block storage (EBS) |
|---|---|---|
| **How a file is stored** | The whole file is **one object**, whatever its size | The file is **split into many blocks** |
| **Managing 1 million files** | 1 million objects | Potentially **10 million blocks** |
| **Access method** | Each object has its **own URL** — reachable directly over HTTP | Must be **attached and mounted** to a computer first |
| **Structure** | Flat, each object independent | Block-level, managed by a filesystem |

> **The access difference is the headline advantage.** An EBS volume's contents have no URL and no IP — you attach the volume to an instance, mount it, and reach files through that machine. **Every S3 object is directly addressable by URL**, with nothing to mount.

---

## Why That Design Wins at Scale

- **Simple management of huge file counts** — one file is one object, so a million files is a million things to track, not ten million blocks
- **Each object carries its own metadata**, which stays manageable precisely because the file isn't fragmented
- **Direct retrieval from anywhere** over the internet, no infrastructure in between
- **Effectively unlimited capacity** — S3 will not refuse more data

---

## ⚠️ Where Object Storage Is the Wrong Choice

Object storage is not universally better — it has real limitations that map directly to exam scenarios:

- **Higher latency** — access goes through HTTP calls, which is inherently slower than a mounted block or file volume
- **Inefficient for enormous numbers of tiny files** — with a 1 KB file, the **metadata overhead can exceed the data itself**
- **Not built for frequent modification** — updating an object generally means **rewriting the whole object**, not patching part of it
- **Legacy application compatibility** — older applications expecting a mounted filesystem often can't address object storage directly

> **The rule of thumb:** static data that is written once and read many times → object storage. Data being **constantly modified** — an active database, real-time transaction processing — → block or file storage (EBS/EFS) instead.

---

## Where It Fits Perfectly

- **Large media files** — photos, videos, big documents
- **Backup and archival** — it handles enormous volumes cheaply, and is far cheaper than EBS
- **Global content distribution** — pairs naturally with a CDN, since objects are already URL-addressable
- **Growing modern applications** — capacity expands without architectural change

> **A useful mental test:** a photo uploaded to a social network is essentially never edited afterwards — written once, read constantly. That is the object-storage pattern exactly, and it's why **Dropbox, Netflix, Pinterest, Shopify, and iCloud** all run on object storage.
`,
    },
    {
      id: "s3-introduction",
      title: "S3 – Features, Consistency & Creating a Bucket",
      shortDesc: "The 11-nines durability claim, the consistency model, what you actually pay for, and the bucket naming rules",
      visuals: ["S3Features"],
      content: `## Why S3 Matters

**Amazon S3 was the first service AWS ever launched**, and remains one of its most popular. Solid S3 knowledge is essentially mandatory for any AWS exam or interview.

---

## The Headline Numbers

| Feature | Figure |
|---|---|
| **Availability** | **99.99%** — across a full year, the service may be unavailable for at most roughly **9 hours** |
| **Durability** | **11 nines (99.999999999%)** — the probability of losing a stored object is vanishingly small |
| **Object size** | **0 bytes up to 5 TB** per object |
| **Total capacity** | **Virtually unlimited** |

> Availability and durability are **different guarantees**: availability is whether you can *reach* your data right now; durability is whether the data still *exists*. S3's durability figure is dramatically stronger than its availability figure.

---

## The Feature Set

- **Storage classes** — different tiers for different access patterns; using them correctly is one of the biggest cost levers in AWS
- **Lifecycle management** — automatically transition or delete objects over time (e.g. a compliance rule to keep invoices 3 years, then delete)
- **Versioning** — keep multiple versions of the same object, which also makes deleted files recoverable
- **Encryption** — **on by default** for new uploads as of 2024, with several key-management options
- **Event notifications** — trigger something (e.g. a Lambda function) when an object is uploaded or deleted
- **Management and monitoring** — integrates with CloudWatch and the wider AWS tooling

---

## ⚠️ The Consistency Model (Exam Favourite)

> **Read-after-write consistency for PUTs of NEW objects** — the instant an upload completes, that object is immediately visible to everyone.
>
> **Eventual consistency for overwrite PUTs and DELETEs** — overwriting or deleting an existing object takes time to propagate, so a read immediately afterwards may still return the old state.

The distinction to memorize: **brand-new object → immediately consistent. Overwrite or delete → eventually consistent.**

---

## What You Actually Pay For

A common misconception is that S3 charges only for storage. There are **four** cost dimensions:

1. **Storage** — the volume of data held
2. **Requests** — each request made against the data (small, but not zero)
3. **Storage management** — features layered on top
4. **Data transfer**

---

## Good Fits vs Bad Fits

**Well suited to:** images, PDFs, videos · backup and archive · static website hosting · big data analytics · log file storage · machine learning datasets · IoT device data · content distribution · mobile and gaming application assets

> ⚠️ **Not suited to** anything needing **low-latency access, frequent updates, or transactional support** — active databases and real-time processing systems belong on **EBS or EFS**.

---

## Creating a Bucket

Everything in S3 starts with a **bucket**. **S3 → Create bucket**, then choose a **region near your users** (e.g. Asia Pacific Mumbai for Indian users).

### ⚠️ Bucket Naming Rules

Bucket names follow DNS-label conventions, and the console rejects violations immediately:

- **Globally unique** — across *all* AWS accounts worldwide, not just yours. Common names like "bucket-1" or "my-bucket" are long gone.
- **3 to 63 characters**
- **Lowercase letters, numbers, dots and hyphens only** — no uppercase, no other special characters
- **Must begin and end with a letter or number**
- **Must not be formatted like an IP address**

Server-side **encryption is enabled by default** on creation — no action needed to get it.

> The global-uniqueness rule catches everyone the first time: a name is not "taken in your account," it's taken **on the entire internet**, which is why real bucket names tend to include a company name or random suffix.
`,
    },
    {
      id: "s3-storage-classes",
      title: "S3 Storage Classes – The Four General-Purpose Tiers",
      shortDesc: "Standard, Standard-IA, Intelligent-Tiering and One Zone-IA — and the retrieval fee that punishes the wrong choice",
      visuals: ["StorageClasses"],
      content: `## Why This Is the Biggest Cost Lever in S3

Every object uploaded to S3 is assigned a **storage class**. Picking the right one for your actual access pattern is one of the largest cost savings available anywhere in AWS — and picking the wrong one can cost *more* than doing nothing.

**Where to set it:** uploading an object, expand **Properties** → **Storage class**.

---

## The Decision That Drives Everything

> **How often will this data actually be accessed?** "Frequent" means **more than once a month**; "infrequent" means **around once a month or less**. That single question selects the class.

---

## 1. S3 Standard — Frequently Accessed

The **default**. Designed for data accessed more than once a month, with **millisecond** access.

- **Durability:** 11 nines · **Availability:** 99.99%
- Replicated across **3 or more Availability Zones**
- **No minimum storage duration, no minimum object size, no retrieval fee**
- **Most expensive** per GB — roughly **$2.50 per 100 GB/month**

---

## 2. S3 Standard-Infrequent Access (Standard-IA)

Long-lived data accessed **about once a month**, still with **millisecond** latency.

- **Durability:** 11 nines · **Availability:** 99.9%
- Still replicated across **3 or more AZs**
- ⚠️ **Minimum storage duration: 30 days** · ⚠️ **Minimum billable object size: 128 KB**
- Roughly **$1.38 per 100 GB/month** — around **50% cheaper** than Standard

### ⚠️ The Trap Everyone Tries

> A natural thought: "store everything in Standard-IA at half price, then just access it frequently anyway." **AWS charges a per-GB retrieval fee** on every access from IA classes. Frequently-accessed data in an IA class ends up **more expensive overall** than simply using Standard.

The storage discount is real, but it is paid for by retrieval charges — which is exactly why understanding your access pattern first is the whole game.

---

## 3. S3 Intelligent-Tiering — Unknown Access Pattern

> **The keyword that maps to this class: "changing or unknown access pattern."** If you genuinely cannot predict whether data will be hot or cold, AWS monitors each object and moves it between tiers automatically.

- **Durability:** 11 nines · **Availability:** 99.9%
- Replicated across **3 or more AZs** · **No minimum storage duration**
- ⚠️ **A per-object monitoring and automation fee applies** — that's the cost of the automation
- **No retrieval fees** — appropriate, since the entire premise is that access is unpredictable
- Roughly **$2.30 per 100 GB/month**

---

## 4. S3 One Zone-Infrequent Access (One Zone-IA)

For **recreatable**, infrequently accessed data, still at millisecond speed.

> **The single difference from Standard-IA: data is stored in ONE Availability Zone only**, not three or more.

- **Durability:** 11 nines · **Availability: 99.5%** — visibly lower than every other class
- ⚠️ **Not resilient to the loss of that Availability Zone** — if the AZ goes down, the data is unreachable until it returns
- **Minimum duration 30 days · minimum object size 128 KB · retrieval fees apply**
- Roughly **$1.10 per 100 GB/month** — the cheapest of these four

**When it fits:** a second copy of data that already exists elsewhere — e.g. an off-site backup of on-premises data. Losing access temporarily is tolerable because the primary copy is somewhere else.

---

## Side by Side

| Class | Access pattern | AZs | Availability | Min duration / size | ~Cost per 100 GB/mo |
|---|---|---|---|---|---|
| **Standard** | Frequent (>1/month) | 3+ | 99.99% | None / none | $2.50 |
| **Standard-IA** | ~Once a month | 3+ | 99.9% | 30 days / 128 KB | $1.38 |
| **Intelligent-Tiering** | **Unknown/changing** | 3+ | 99.9% | None | $2.30 + monitoring fee |
| **One Zone-IA** | Infrequent, **recreatable** | **1** | **99.5%** | 30 days / 128 KB | $1.10 |

> Prices here are approximate and illustrative — real S3 billing also depends on requests, retrieval, and transfer. The **relative ordering** is what matters for choosing correctly.

> A fifth class, **S3 Express One Zone**, appears greyed out in this same dropdown — because it requires a completely different kind of bucket, which is the next topic.
`,
    },
    {
      id: "s3-express-one-zone",
      title: "S3 Express One Zone & Directory Buckets",
      shortDesc: "Single-digit millisecond latency by co-locating storage in the same AZ as your compute",
      visuals: ["ExpressOneZone"],
      content: `## Why It's Greyed Out

In the storage-class dropdown, **S3 Express One Zone** cannot be selected for a normal upload.

> **S3 Express One Zone requires a "directory bucket" — a different bucket type from the standard "general purpose" bucket.** A general purpose bucket cannot hold Express One Zone objects, and a directory bucket can hold *only* Express One Zone objects.

---

## What It Is

> **A high-performance, single-AZ storage class purpose-built for consistent single-digit millisecond data access** — aimed at the most latency-sensitive workloads: gaming, real-time applications, and machine learning.

- **Up to 10x faster** data access than S3 Standard
- **Request costs around 50% lower** than Standard
- The lowest-latency object storage class AWS offers

---

## The Mechanism: Co-Location

This is the part worth actually understanding, because it explains *why* it's faster.

**With a normal bucket:** you choose a **region**, but not an Availability Zone. Your EC2 instance might sit in one AZ while the data it reads sits in another. AZs are connected by fibre, which is fast — but crossing between them still introduces latency.

> **With a directory bucket, you explicitly choose the Availability Zone.** Place the bucket in the *same* AZ as the EC2 instances running your application, and the request never crosses an AZ boundary at all. **That co-location is where the single-digit millisecond latency comes from.**

---

## Creating One

**S3 → Create bucket** now offers two bucket types:

| Bucket type | Purpose |
|---|---|
| **General purpose** | The normal bucket — supports all the standard storage classes |
| **Directory** | Required for **S3 Express One Zone**, and supports only that class |

Choosing **Directory** prompts for an **Availability Zone** (pick the one hosting your compute), plus an acknowledgement that data is stored in a **single AZ**.

Afterwards the S3 console lists general purpose and directory buckets separately — and a directory bucket displays its **Availability Zone**, which a general purpose bucket never does.

Uploading into a directory bucket, the storage-class picker inverts: **S3 Express One Zone is the only selectable option**, everything else greyed out.

---

## ⚠️ Regional Availability

At the time of the source course, **S3 Express One Zone was available in only four regions** — notably **not** Mumbai (ap-south-1), which is why the walkthrough switches to N. Virginia. Newer AWS features routinely land in N. Virginia first.

---

## Express One Zone vs One Zone-IA

Both store data in a single AZ, but they exist for opposite reasons:

| | **One Zone-IA** | **Express One Zone** |
|---|---|---|
| **Goal** | **Cheap** storage for recreatable, rarely-read data | **Fast** storage for latency-critical workloads |
| **Access speed** | Milliseconds | **Single-digit** milliseconds, up to 10x faster |
| **Bucket type** | General purpose | **Directory bucket** |
| **AZ choice** | Not selectable | **You choose it explicitly** |

> Same single-AZ trade-off, entirely different motivation — cost in one case, latency in the other.
`,
    },
    {
      id: "s3-glacier-classes",
      title: "S3 Glacier – The Three Archive Classes",
      shortDesc: "Instant, Flexible and Deep Archive — plus the backup-vs-archive distinction that decides between them",
      visuals: [],
      content: `## First: Backup Is Not Archive

These two words get used interchangeably, and choosing the wrong storage class usually starts with confusing them.

| | **Backup storage** | **Archive storage** |
|---|---|---|
| **Primary goal** | **Disaster recovery** — a second copy in case the original is lost | **Long-term preservation** — compliance, analytics, historical record |
| **Access frequency** | Potentially frequent — whenever something breaks | **Infrequent** — rarely touched at all |
| **Retrieval speed needed** | **Fast** — seconds to minutes; the business is down until it's restored | **Slow is acceptable** — minutes or hours doesn't hurt anything |
| **Cost priority** | Varies with how fast you need it | **As low as possible** — it may sit for 10+ years |

**Worked examples:** copying customer data to a second location so a failed drive doesn't end the business → **backup**. An insurance company keeping policies for 10 years because regulation demands it → **archive**.

---

## All Three Share

**11 nines durability**, and replication across **3 or more Availability Zones**. The differences are entirely about **retrieval speed, minimum duration, and price**.

---

## 1. S3 Glacier Instant Retrieval

> **Archive data that still needs immediate access when it is needed.** Retrieval is in **milliseconds** — as fast as S3 Standard.

- **Availability:** 99.9% · **Minimum storage duration: 90 days**
- **Saves roughly 68% versus Standard-IA** for data accessed about **once per quarter**

**When it fits:** long-lived data touched a few times a year, where the rare access must be instant.

---

## 2. S3 Glacier Flexible Retrieval

> **Backup and archive data that is rarely accessed** — cheaper still, in exchange for giving up instant retrieval.

- **Availability:** 99.9% · **Minimum storage duration: 90 days**
- **Up to 10% cheaper** than Glacier Instant Retrieval, for data accessed **1–2 times per year**

**Three retrieval options — the defining feature of this class:**

| Option | Time | Note |
|---|---|---|
| **Expedited** | **1–5 minutes** | For when you need it urgently |
| **Standard** | **3–5 hours** | Effectively free |
| **Bulk** | **5–12 hours** | For very large volumes |

> This class suits a **mix** of backup and archive data precisely because of that range: urgent restores use Expedited, while routine archive reads use the free Standard tier.

---

## 3. S3 Glacier Deep Archive

> **The cheapest storage AWS offers** — for data that is very rarely accessed and must be kept for years.

- **Availability:** 99.9% · ⚠️ **Minimum storage duration: 180 days** (double the other two)
- **Only two retrieval options:**

| Option | Time |
|---|---|
| **Standard** | **12–48 hours** |
| **Bulk** | **48 hours** |

> ⚠️ **There is no Expedited option in Deep Archive.** This is the key exam distinction from Flexible Retrieval: if a scenario requires the *possibility* of retrieving archived data within minutes, Deep Archive is disqualified — the fastest option here is measured in **hours**, minimum.

**When it fits:** 7-, 10-, or 15-year compliance retention where the data will almost certainly never be read, and cost dominates every other consideration.

---

## Choosing Between Them

| Class | Retrieval | Min duration | Best for |
|---|---|---|---|
| **Glacier Instant Retrieval** | **Milliseconds** | 90 days | Archive needing instant access, ~1/quarter |
| **Glacier Flexible Retrieval** | 1–5 min / 3–5 hr / 5–12 hr | 90 days | Mixed backup + archive, 1–2 times/year |
| **Glacier Deep Archive** | **12–48 hr / 48 hr** | **180 days** | Long-term compliance, cheapest possible |

> **Exam shortcut:** "must be retrievable in minutes" → Flexible Retrieval (Expedited). "Millisecond access to archived data" → Instant Retrieval. "Cheapest possible, hours is fine" → Deep Archive.
`,
    },
    {
      id: "s3-versioning",
      title: "Lab – S3 Versioning & Recovering Deleted Files",
      shortDesc: "Delete markers, restoring a deleted object, and the one-way switch you can never fully undo",
      visuals: ["Versioning"],
      content: `## What Versioning Changes

> **Versioning keeps multiple versions of an object in the same bucket.** It is enabled at the **bucket** level, and it is **disabled by default** on every new bucket.

The reason it matters most: with versioning on, **deleted files can be recovered**.

---

## Without Versioning — Overwrites Destroy Data

Create a bucket leaving versioning **disabled**. Upload **file1.txt** containing "hello". Now edit the local file to say "world" and upload it again under the same name.

Opening the object: it contains **"world"**. The original is **gone** — overwritten, with no way back.

---

## With Versioning — Overwrites Preserve History

Create a second bucket and enable versioning (**Properties → Bucket Versioning → Edit → Enable**, either at creation or afterwards).

Upload **file1.txt** ("hello"), then re-upload it modified ("world").

The object list still shows one file containing "world" — the **current version**. But toggle **Show versions** on, and **both** versions appear, each with its own **Version ID**. Opening the older one still returns **"hello"**.

> The current version is what you get by default; previous versions remain retrievable underneath it.

---

## Deleting Without Versioning

Selecting an object and deleting it prompts you to type **"permanently delete"**. That wording is literal — the object is gone, unrecoverable.

---

## ⚠️ Deleting WITH Versioning — the Delete Marker

Deleting an object in a versioned bucket prompts you to type only **"delete"** — a different, gentler confirmation.

The object disappears from the normal view, but nothing was actually destroyed:

> **S3 adds a new, zero-byte version called a delete marker, and makes it the current version.** Your real object becomes a **previous (non-current) version**, sitting untouched underneath.

Toggling **Show versions** reveals both: the original file, and the **delete marker** at 0 bytes.

---

## Restoring a Deleted Object

The restore procedure is counterintuitive the first time:

> **Delete the delete marker.** Removing the current version (the marker) promotes the previous version back to current — and the file reappears.

**Steps:** enable **Show versions** → select the **delete marker** → **Delete** → confirm with "permanently delete". Toggle Show versions off, and the original object is back in the normal list with its content intact.

---

## Permanently Deleting Instead

To genuinely destroy an object in a versioned bucket, delete the **actual version**, not the marker:

**Show versions → select the real object version** (it has a real size, e.g. 1.1 MB, unlike the 0-byte marker) → **Delete** → **"permanently delete"**. That version is now unrecoverable.

> This leaves the **delete marker** behind as a harmless leftover. It occupies **0 bytes and costs nothing**, so it can be ignored — or cleaned up automatically via a lifecycle rule, covered in the lifecycle topics.

---

## ⚠️ Three Facts Worth Memorizing

1. **Versioning cannot be disabled once enabled — only suspended.** The Edit dialog offers **Suspend**, never "Disable". Suspending stops *new* versions being created, but every existing version is retained.
2. **It integrates with lifecycle rules** — rules can act separately on current and non-current versions.
3. ⚠️ **You pay for every version.** Versioning itself is free, but each retained version consumes storage you are billed for — an old, heavily-modified object can quietly cost several times what its current version suggests.
`,
    },
    {
      id: "s3-lifecycle-filters",
      title: "S3 Lifecycle Rules – Filtering Which Objects Apply",
      shortDesc: "Prefix, tag and size filters — including the empty-prefix trick for root-level objects only",
      visuals: ["LifecycleRules"],
      content: `## What Lifecycle Rules Automate

Storage class can be set **manually** in two places: when uploading an object (**Properties → Storage class**), or afterwards via **Object actions → Edit storage class**.

> Manual works for one object. It does not work for **50,000**. **Lifecycle rules automate storage-class transitions and deletion based on an object's age** — moving data toward cheaper classes as it cools, with no ongoing effort.

**A typical intent:** frequently accessed for 30 days → move to Standard-IA → after 90 days → cheaper still → eventually archive → eventually delete.

**Where:** **bucket → Management → Create lifecycle rule.**

---

## The Filtering Decision

The first real choice in creating a rule is **which objects it applies to**.

**Apply to all objects in the bucket** is offered (and requires an acknowledgement checkbox) — but in real use that is rarely what you want, since different data in one bucket usually has different access patterns.

Three filter types are available:

---

## Filter 1 — Prefix

S3's structure is genuinely **flat**; "folders" are a convenience built from object key prefixes.

Uploading a file into a "folder" named **USA** produces an object whose actual key is **USA/us_files.txt** — the folder name is simply part of the key.

**So a prefix filter targets a folder:**

| Prefix | Matches |
|---|---|
| **USA/** | Every object inside the USA folder |
| **India/** | Every object inside India |
| **India/Gujarat/** | Only objects inside that nested folder |

> The trailing slash acts as a delimiter, keeping the match scoped to that folder rather than anything merely *starting* with those characters.

### ⚠️ The Root-Only Trick

A bucket containing three folders **and** three loose files at the root — how do you target **only the loose files**, excluding every folder?

> **Enter two double-quote characters as the prefix.** That empty-string prefix matches only objects at the **root** of the bucket, excluding everything inside any folder.

---

## Filter 2 — Object Tags

Objects can be tagged at upload time (**Upload → Tags**), e.g. key **logs**, value **s3logs**.

A lifecycle rule can then filter on **Add tag** with the same key/value — and **only tagged objects** are affected, regardless of which folder they sit in.

> Supplying only the **key** (no value) matches every object carrying that key, whatever its value — useful when the value varies but the category doesn't.

---

## Filter 3 — Object Size

Filter by a **minimum and/or maximum** object size, specified in bytes, KB, MB or GB. Objects between those bounds are affected.

> Practical for policies that only make sense on large objects — since IA and archive classes have **minimum billable sizes (128 KB)**, transitioning tiny objects into them can cost more than leaving them alone.

---

## Combining Them

Filters can be combined within one rule, and a bucket can carry **multiple rules** — one per prefix or data category — so a single bucket holding mixed data types can age each type on its own schedule.

> The next topic builds a complete rule: a full transition chain across five storage classes, then expiration and permanent deletion.
`,
    },
    {
      id: "s3-lifecycle-transitions",
      title: "Lab – Building a Lifecycle Transition Chain",
      shortDesc: "Standard through Deep Archive over ten years, then expiring and permanently deleting the leftovers",
      visuals: [],
      content: `## The Target Journey

A complete data lifecycle, automated end to end:

| Age | Action |
|---|---|
| **Day 0** | Object uploaded → **S3 Standard** |
| **30 days** | → **Standard-IA** |
| **90 days** | → **One Zone-IA** |
| **365 days** (1 year) | → **Glacier Flexible Retrieval** |
| **3 years** | → **Glacier Deep Archive** |
| **10 years** | **Expire** the object |

---

## Current vs Non-Current Versions

Before building it, one distinction matters — because lifecycle rules treat them **separately**.

In a versioned bucket with **Show versions** enabled, versions marked with an **L indicator are previous (non-current)** versions; the unmarked one is the **current** version.

> Lifecycle rules offer parallel actions for each: **"Move current versions of objects between storage classes"** and **"Move non-current versions..."** — identical mechanics, applied to different sets of versions.

---

## Step 1 — Create the Rule

**Management → Create lifecycle rule** → name it (e.g. **rule-1**) → choose a filter, or **Apply to all objects in the bucket** with the acknowledgement.

Five rule actions are offered; this lab uses the **current version** transition action.

---

## Step 2 — Build the Transition Chain

Select **Move current versions of objects between storage classes**, then add each transition with its **days after object creation**:

| Transition to | Days |
|---|---|
| Standard-IA | **30** |
| One Zone-IA | **90** |
| Glacier Flexible Retrieval | **365** |
| Glacier Deep Archive | **1095** (3 years) |

> ⚠️ **Standard → Standard-IA requires a minimum of 30 days.** The console rejects a smaller value outright. (Transitions from Standard directly to Glacier classes are not subject to that same 30-day floor.)

Note the day counts are **cumulative from object creation**, not from the previous transition — 90 means 90 days old, i.e. 60 days after landing in Standard-IA.

The console renders a preview timeline confirming each step, then **Create rule**.

---

## Step 3 — Expiration

Editing the rule, enable **Expire current versions of objects** → **3650** days (10 years).

> ⚠️ **"Expire" does not mean "permanently delete."** In a **versioned** bucket, expiring the current version just adds a **delete marker** and demotes the object to non-current — **the data still exists and you are still billed for it.**

---

## Step 4 — Actually Removing the Data

To genuinely reclaim the storage, add the companion action:

**Permanently delete non-current versions of objects** → **1** day after becoming non-current.

The full sequence: at **day 3650** the object expires (becomes non-current), and at **day 3651** it is permanently deleted.

> ⚠️ **This second action is only necessary because versioning is enabled.** On a non-versioned bucket, "expire current version" alone genuinely deletes the object.

---

## Step 5 — Cleaning Up Delete Markers

The final rule option handles the leftovers from the versioning topic: **Delete expired object delete markers or incomplete multipart uploads**.

Delete markers left behind after permanently deleting an object are harmless (0 bytes, no cost) but accumulate as clutter across thousands of objects.

> ⚠️ **Enabling "Expire current versions of objects" makes the delete-marker option unavailable** — the console blocks setting both, because the expiration action already handles marker cleanup. If you want to configure marker cleanup with its own timing, the expiration action must be off.

The **incomplete multipart uploads** half of that option cleans up partial uploads that never finished — covered in the multipart upload topic later in this section.

---

## Why This Matters

> Each step down the chain is a real cost reduction, applied automatically with zero ongoing effort. Combined with correct storage-class selection, lifecycle rules are the single largest lever on an S3 bill — which is exactly why the transitions, the 30-day minimum, and the expire-vs-delete distinction all appear regularly in exam scenarios.
`,
    },
    {
      id: "s3-access-control-overview",
      title: "S3 Access Control – The Three Mechanisms",
      shortDesc: "IAM policy, bucket policy and ACL as layers — and why a single Deny anywhere wins",
      visuals: ["AccessControl"],
      content: `## The Problem

Objects in a bucket are private by default. Granting access — to an IAM user, an EC2 instance, another AWS account — means deliberately configuring it.

> **Controlling S3 access is the process of managing who can view, change, or delete objects stored in a bucket.** Three mechanisms exist, and they operate as **layers**.

| Mechanism | Configured from | Notes |
|---|---|---|
| **IAM policy** | IAM console | Attached to a user, group or role |
| **Bucket policy** | S3 bucket → Permissions | Attached to the bucket itself |
| **ACL (Access Control List)** | S3 bucket → Permissions | ⚠️ **Legacy** — AWS recommends against it |

---

## ACLs Are Off by Default

Creating a bucket, **ACLs are disabled**, and the console explicitly recommends leaving them that way. They can be enabled at creation or afterwards, but they exist mainly for backwards compatibility.

---

## Why Three Mechanisms Exist

> **AWS applies a layered security approach.** Multiple independent layers mean that a mistake at one layer doesn't automatically expose your data — another layer can still block the request.

A request passes through each layer in turn. **If a policy exists at a layer, it must allow the action** for the request to continue. If no policy exists at that layer, the request simply passes through.

---

## ⚠️ The Rule That Overrides Everything

> **A single explicit Deny — in an IAM policy, a bucket policy, or an ACL — results in total denial of access.** One Deny anywhere beats every Allow everywhere.

---

## How Allow Actually Works

The complementary rule is more permissive than people expect:

> **Allow at any ONE layer is sufficient**, provided no other layer explicitly denies it. You do **not** need matching Allows at all three layers.

**Worked combinations:**

| IAM policy | Bucket policy | ACL | Result |
|---|---|---|---|
| Not attached | Not attached | Not attached | ❌ **Denied** — default is deny |
| Not attached | Not attached | **Allow** | ✅ Granted |
| Not attached | **Allow** | Not attached | ✅ Granted |
| **Allow** | Not attached | Not attached | ✅ Granted |
| **Allow** | **Allow** | Not attached | ✅ Granted |
| **Allow** | **Allow** | **Allow** | ✅ Granted |
| Any | Any | **Deny anywhere** | ❌ **Denied** |

> **The two rules to carry into the exam:** with nothing configured, access is **denied** (default deny). **One Allow at any single layer grants access; one Deny at any single layer removes it.**

> The next topic compares the two mechanisms you'll actually use — IAM policy and bucket policy — and when each is the right choice.
`,
    },
    {
      id: "s3-iam-vs-bucket-policy",
      title: "IAM Policy vs Bucket Policy",
      shortDesc: "Identity-based vs resource-based — the distinction that decides cross-account and public access",
      visuals: ["IAMvsBucketPolicy"],
      content: `## The Core Distinction

Both are JSON documents granting S3 access. The difference is **what the policy attaches to**.

> **An IAM policy is identity-based** — it attaches to an IAM **user, group, or role**, and says "this identity may access that bucket."
>
> **A bucket policy is resource-based** — it attaches to the **bucket**, and says "this identity may access me."

The permission granted can be identical; the direction of attachment is what differs.

---

## Full Comparison

| | **IAM policy** | **Bucket policy** |
|---|---|---|
| **Where configured** | IAM console | S3 → bucket → Permissions |
| **Format** | JSON | JSON |
| **Attaches to** | IAM user / group / role (**identity**) | The S3 bucket (**resource**) |
| **Type** | **Identity-based** | **Resource-based** |
| **Scope** | **Any AWS service** | **S3 only** |
| **Names the principal?** | ❌ No — implied by attachment | ✅ **Yes — a Principal field is required** |
| **Best for** | Permissions spanning many services | Permissions on one specific bucket |
| **Cross-account access** | Possible, but **complex** | **Straightforward** |
| **Public access** | ❌ **Not possible** | ✅ **Possible** |

---

## The Principal Field

This is the most visible structural difference in the JSON itself.

> An **IAM policy contains no Principal** — the identity is whoever the policy is attached to. A **bucket policy must specify a Principal** (an IAM user's ARN, an account, or everyone), because the policy lives on the bucket and has no other way to know who it's talking about.

---

## Where Only One Will Do

Two scenarios where the choice is forced:

**Cross-account access** — account B's user needs to reach account A's bucket. Both approaches technically work, but a **bucket policy is far simpler**: account A adds account B's principal directly to the bucket.

**Public access** — making objects readable by anyone, including people with no AWS account at all. ⚠️ **Only a bucket policy can do this.** An IAM policy attaches to an identity, and anonymous public users have no identity to attach to.

> **Exam shortcuts:** "grant access across multiple AWS services" → **IAM policy**. "grant another AWS account access to one bucket" or "make a bucket public" → **bucket policy**.
`,
    },
    {
      id: "s3-iam-policy-lab",
      title: "Lab – IAM Policies for S3 Buckets",
      shortDesc: "Read-only, write-only and full-access policies attached to a user, then tested against three buckets",
      visuals: [],
      content: `## Lab Setup

Three buckets, each holding the same **sample_file.txt**, named for the access level they'll receive: **read-only-bucket**, **write-only-bucket**, **full-access-bucket**.

Create an IAM user **s3-user** with console access and **no policies attached**. Signing in (use an **incognito window** so the root session stays active in the main browser) and opening S3 shows the expected result: no permission to list any buckets.

> Every policy in this lab is an **IAM policy** — no bucket policies are used, so the effect of each one is unambiguous.

---

## Finding a Bucket ARN

Policies reference buckets by **ARN** (Amazon Resource Name). Find one under **bucket → Properties → Bucket ARN**.

---

## Policy 1 — Read-Only

Two Allow statements: one permitting **ListAllMyBuckets** (so the user can see buckets exist at all), and one permitting **GetObject** on the target bucket's ARN.

**IAM → Policies → Create policy → JSON** → paste → name it (e.g. **cloudfox-s3-user-readonly**) → create. Then **Users → s3-user → Add permissions → Attach policies directly** → attach it.

**Testing as s3-user:**

| Action | Result |
|---|---|
| List buckets | ✅ All three visible (from ListAllMyBuckets) |
| Open **read-only-bucket** | ✅ Allowed |
| Open the object inside | ✅ Contents readable |
| Delete the object | ❌ Denied |
| Upload a new object | ❌ Upload fails |
| Open the other two buckets | ❌ Insufficient permissions |

---

## Policy 2 — Write-Only

Allow **ListBucket** plus **PutObject** on **write-only-bucket**.

**Testing:**

| Action | Result |
|---|---|
| Open **write-only-bucket** | ✅ Allowed |
| **Read** an existing object | ❌ Denied — no GetObject |
| Delete an existing object | ❌ Denied |
| Upload a new object | ✅ Succeeds |
| Delete the object **it just uploaded** | ❌ **Still denied** |

> ⚠️ **Write permission does not imply the ability to delete — not even your own uploads.** PutObject allows writing; DeleteObject is a separate action entirely. This surprises people, and it's a genuinely useful property for append-only or drop-box style buckets.

---

## Policy 3 — Full Access

Instead of listing individual actions, grant **all S3 actions** (the S3 service with an action wildcard) on **full-access-bucket** — which covers GetObject, PutObject, DeleteObject and everything else.

**Testing:** listing, reading, uploading and deleting all succeed on that bucket — while the other two remain restricted to their own policies.

---

## What This Demonstrates

Three separate policies were used purely for clarity; a single policy could hold all three statements. The important result is that **each bucket enforces exactly the actions its policy names**, and the user's total access is the union of the attached policies.

> Next: achieving the **identical** three outcomes using **bucket policies** instead — and the surprise that comes with testing them through the console.
`,
    },
    {
      id: "s3-bucket-policy-lab",
      title: "Lab – Bucket Policies for S3",
      shortDesc: "The same three permission levels from the bucket side, and why the console needs one extra IAM policy",
      visuals: ["BucketPolicyAnatomy"],
      content: `## Same Goal, Opposite Direction

The previous lab granted read-only, write-only and full access using **IAM policies**. This lab achieves the identical outcomes using **bucket policies** — attached to the buckets rather than the user.

**Setup:** the same three buckets (each with a sample file and **no** bucket policy attached), and a freshly recreated **s3-user** with **no** IAM policies.

---

## The Structural Difference

An IAM policy names actions and resources. **A bucket policy names actions, resources, and a Principal** — the ARN of the IAM user being granted access.

> The bucket policy lives on the bucket, so it must state **who** it applies to. That Principal field is the only meaningful difference between the two policy documents.

**Where:** **bucket → Permissions → Bucket policy → Edit** → paste JSON → Save changes.

---

## ⚠️ The Surprise: It Doesn't Work Yet

Attaching a correct read-only bucket policy and testing as **s3-user** — the bucket still can't be reached. The policy is not wrong.

**The explanation:** there are three ways to reach S3, and they don't need the same permissions.

| Access method | Typical share of real usage | Needs ListAllMyBuckets? |
|---|---|---|
| **AWS CLI** | ~90% combined with SDK | ❌ No |
| **SDK / programmatic** | | ❌ No |
| **AWS Console (GUI)** | ~10%, mostly testing | ✅ **Yes** |

> **The bucket policy alone genuinely is sufficient** — for CLI and programmatic access, exactly as the access-control table promised. **The console is the special case:** browsing to a bucket requires permission to *list all buckets* first, which is an account-level action no single bucket's policy can grant.

**The fix:** attach one small **IAM policy** granting **ListAllMyBuckets** — purely to make console navigation work. Every actual permission still comes from the bucket policies.

---

## Testing the Three Policies

With console navigation enabled, each bucket policy behaves exactly like its IAM equivalent:

**Read-only bucket:** open ✅ · read object ✅ · upload ❌ · delete ❌

**Write-only bucket:** open ✅ · read object ❌ · upload ✅ · delete ❌

**Full-access bucket:** open ✅ · read ✅ · upload ✅ · delete ✅

---

## The Takeaway

> There is **no functional difference in the permissions** these two mechanisms can express — only in **how they attach**. Attach it to an identity and it's an **identity-based IAM policy**; attach it to a bucket and it's a **resource-based bucket policy**.

The practical selection rule stays as covered earlier: bucket policies for **cross-account** and **public** access and for anything scoped to a single bucket; IAM policies when permissions span **multiple services** or should follow a user around.
`,
    },
    {
      id: "s3-acl",
      title: "S3 Access Control Lists (ACLs)",
      shortDesc: "The legacy XML mechanism — account-level only, and the reason AWS wants it left disabled",
      visuals: [],
      content: `## Legacy, and Deliberately So

> **ACLs are a legacy access-control mechanism.** AWS explicitly recommends **bucket policies and IAM policies** instead, and disables ACLs by default on every new bucket.

They remain worth understanding because they still appear in the console, and because their limitations explain why the modern mechanisms exist.

---

## ⚠️ What ACLs Can and Cannot Target

> **ACLs grant access to AWS accounts and predefined groups only — never to a specific IAM user, group, or role.**

That single limitation rules them out of most real access-control work, since permissions are normally managed per-IAM-identity.

**The one genuine advantage:** ACLs apply at **both bucket level and object level**. A bucket policy can only attach to the bucket — an ACL can be set on an **individual object**.

---

## Enabling Them

New buckets have ACLs **disabled**. **bucket → Permissions → Object Ownership → Edit** to change it, which offers two settings:

| Setting | Who controls uploaded objects |
|---|---|
| **Bucket owner enforced** (default, ACLs disabled) | ACLs are off entirely; the bucket owner owns everything |
| **Bucket owner preferred** | **You** (the bucket owner) retain full control over objects uploaded by other accounts |
| **Object writer** | **The uploading account** retains control of its own objects |

> The distinction matters when another AWS account can write to your bucket: **bucket owner preferred** means you can still manage permissions on their objects; **object writer** means they keep control and can set permissions differing from the bucket's.

---

## The Four Permissions

Under **Permissions → Access control list → Edit**, permissions split into two groups:

**On objects:**
- **List** — see the objects in the bucket
- **Write** — create, overwrite, **and delete** objects

**On the bucket's ACL itself:**
- **Read** — view who currently has access
- **Write** — modify who has access, including adding other accounts

> ⚠️ **Note that Write covers deletion too.** There is no way to grant "upload but not delete" through an ACL — precisely the distinction the IAM policy lab demonstrated is possible with policies.

---

## The Three Predefined Groups

| Group | Who it means |
|---|---|
| **Everyone (public access)** | ⚠️ **Anyone at all** — no AWS account required |
| **Authenticated users group** | ⚠️ **Any AWS account holder** — not just yours |
| **S3 log delivery group** | AWS's logging service, for writing access logs |

> ⚠️ Both of the first two are dangerous. **"Authenticated users" does not mean "users in my account"** — it means *anyone in the world with an AWS account*, which is a very common and serious misreading.
>
> AWS greys out **Write** for the Everyone group entirely — allowing anonymous uploads to your bucket would let anyone store data at your expense.

---

## Granting to a Specific Account

**Add grantee** requires that account's **canonical ID** — found under **account name → Security credentials → Canonical user ID**.

> ⚠️ **Canonical IDs exist for AWS accounts only, never for IAM users** — reinforcing that ACLs cannot target individual identities.

---

## Why AWS Moved On

1. **Only basic permissions** — read/write granularity, with write implying delete
2. **Doesn't scale** — every bucket *and* every object carries its own ACL; managing thousands individually is unworkable, with no central policy
3. **Easy to misconfigure** — combining predefined groups with object-ownership settings makes accidental public exposure genuinely likely
4. **Older format** — ACLs are **XML**-based, while IAM and bucket policies use modern, far more expressive **JSON**

> **The practical rule: leave ACLs disabled and use bucket policies or IAM policies.** Understand ACLs well enough to recognize them in the console and answer an exam question — particularly the fact that they operate at **account level, not IAM-user level**.
`,
    },
    {
      id: "s3-object-lock",
      title: "Lab – S3 Object Lock",
      shortDesc: "Governance vs Compliance mode, retention periods, legal holds — and the switch that can never be undone",
      visuals: ["ObjectLock"],
      content: `## What Object Lock Does

> **Object Lock prevents an object version from being deleted or modified for a fixed period, or indefinitely.** Once applied, **not even a lifecycle policy can remove the object.**

The driver is almost always **compliance**: a regulator requiring records be held for a fixed number of years, protected from both accidental deletion and deliberate tampering.

---

## The Two Retention Modes

| Mode | Strictness | Who can override |
|---|---|---|
| **Governance mode** | **Soft** | Users holding special permissions **can** shorten the lock or delete the object |
| **Compliance mode** | **Strict** | ⚠️ **Nobody** — including the **root user** — until the retention period expires |

**Governance mode override** requires two permissions (granted via IAM or bucket policy): **s3:BypassGovernanceRetention** and **s3:PutObjectRetention**. The root user can do it directly.

> **Compliance mode is genuinely absolute.** Choosing it for five years means the object is immovable for five years, no exceptions, no escalation path. That is the point — but it means the mode must be chosen deliberately.

---

## Retention Period vs Legal Hold

**Retention period** — a defined duration (days or years) after which the lock expires on its own.

**Legal hold** — the same protection, but with **no expiry date at all**. It is switched on manually and must be switched off manually.

> **When legal hold fits:** an active legal investigation, where nobody knows whether the data must be retained for one year or ten. A retention period demands a number up front; a legal hold does not.

Both can apply simultaneously — a legal hold on top of a retention period keeps the object protected even after the period lapses.

---

## Two Prerequisites

1. **Versioning must be enabled** — Object Lock operates on object *versions*. The console will refuse to enable Object Lock without it (and can enable versioning for you in the same step).
2. **Appropriate permissions** — as root, or as an IAM user granted the relevant Object Lock permissions.

---

## ⚠️ Enabling It Is Permanent

Object Lock can be turned on at bucket creation (**Advanced settings**) or afterwards (**Properties → Object Lock → Edit**).

> ⚠️ **Once Object Lock is enabled on a bucket, it cannot be disabled, and versioning can never be suspended on that bucket again.** The console requires an explicit acknowledgement. This is a genuinely one-way door.

---

## Default Retention — On or Off

Enabling Object Lock offers a **default retention** setting, and the choice determines how objects behave afterwards:

**Default retention DISABLED** — every object uploaded is unlocked unless you lock it individually. Choose this when different objects need **different** lock durations, or when flexibility matters more than consistency.

**Default retention ENABLED** — every uploaded object automatically receives the configured mode and duration. Choose this when a compliance rule mandates uniform protection and you want to eliminate manual configuration.

---

## Applying a Lock to an Individual Object

> ⚠️ **Object Lock settings cannot be specified while uploading through the S3 console** — only via the **CLI, SDK, or REST API**. Uploading through the console means applying the lock **afterwards**.

**Select the object → scroll to Object Lock Retention → Edit** → choose Governance or Compliance → set the retain-until date → Save.

---

## Testing the Lock

With the lock applied, attempt a delete: the object appears to delete successfully — because in a versioned bucket, that just adds a **delete marker** (from the versioning topic), which is not blocked.

**Now try to permanently delete the actual version** (Show versions → select the real version → Delete → "permanently delete"):

> **The operation fails**, with an error explaining the object is protected by Object Lock. Re-uploading the same key to overwrite it also fails.

**Legal hold** works the same way: **object → Properties → Object Lock Legal Hold → Edit → Enable.** While enabled, no deletion or overwrite is possible; disabling it manually restores normal behaviour.

> **The exam framing:** "prevent deletion for a fixed period, even by administrators" → **Compliance mode**. "Prevent deletion but allow authorized override" → **Governance mode**. "Indefinite hold with no known end date" → **Legal hold**.
`,
    },
    {
      id: "s3-encryption-fundamentals",
      title: "S3 Encryption – Data at Rest vs In Transit",
      shortDesc: "What encryption actually protects against, and the two states data needs protecting in",
      visuals: ["S3Encryption"],
      content: `## Why Encryption Exists

Cryptography long predates computing. Messages carried between princely states in India faced an obvious problem: the messenger could read — or alter — what they carried. Wax seals helped, but were defeated. The real solution was to **scramble the message itself**, so interception revealed nothing.

A **Caesar cipher** (shifting each letter by a fixed amount) is the simplest form: the encrypted text is unreadable until you know the **key** — "shift of 3" — at which point it decodes back to the original.

> Keys were exchanged **in advance**, when parties met in person, precisely so that later messages could be read without transmitting the key alongside the message.

---

## What It Protects

Encryption delivers two properties:

- **Confidentiality** — someone who obtains the file cannot read it
- **Integrity** — unable to read it, they also cannot meaningfully alter it

> **Why this matters for S3:** bucket policies, IAM policies and ACLs all control *access*. Encryption is the layer that matters when those controls are somehow bypassed — if someone obtains the underlying data, encryption means they still have nothing. **Even AWS cannot read properly encrypted data.**

---

## The Two States of Data

| | **Data at rest** | **Data in transit** |
|---|---|---|
| **When** | Stored in S3 | Moving across the network |
| **Threat** | Unauthorized access to stored data | Interception during transfer |
| **Protected by** | **Server-side or client-side encryption** | **HTTPS** (via TLS, successor to SSL) |

**Data at rest:** S3 encrypts the object **before writing it to storage**, and decrypts it on read. The process is **fully transparent** — you never see the encrypted form.

**Data in transit:** the same mechanism as entering a card number on a website — **HTTPS** wraps the transfer, and the data is decrypted on arrival.

> That transparency is exactly why encryption confuses people: everything is encrypted and decrypted automatically, so from the console it looks like nothing happened at all.

---

## What's Ahead

Two questions remain, and each gets its own topic:

- **Which kind of encryption?** Symmetric vs asymmetric — and which one S3 actually uses
- **Who does the encrypting?** Server-side (S3 does it) vs client-side (you do it before uploading)

> Then the practical implementations: **SSE-S3**, **SSE-KMS**, **DSSE-KMS**, and **SSE-C**.
`,
    },
    {
      id: "s3-symmetric-asymmetric",
      title: "Symmetric vs Asymmetric Encryption",
      shortDesc: "One shared key or a public/private pair — and why S3 uses only the first",
      visuals: ["SymmetricAsymmetric"],
      content: `## Symmetric Encryption — One Key

> **A single shared key both encrypts and decrypts the data.** Encrypt with it, hand the same key to whoever needs to read it, and they decrypt with it.

- **Fast and efficient**, particularly for **large volumes** of data
- ⚠️ **The weakness is key distribution** — the key must reach the recipient through some genuinely secure channel, and anyone who intercepts it can read everything

**Common standards:** **AES** (in 128-, 192-, and 256-bit variants), DES, and 3DES.

> **AES-256 is considered the most secure of these, and is the default encryption standard used by S3.**

---

## Asymmetric Encryption — Two Keys

> **Two mathematically related keys: a public key encrypts, a private key decrypts.** They are not interchangeable.

- **Stronger security through key separation** — even someone holding the encrypted data **and** the public key cannot decrypt it without the private key
- **Solves the distribution problem** — the public key can be shared openly
- ⚠️ **Slower than symmetric**, especially for large data volumes

**Common algorithms:** **RSA**, **ECC**, and **Diffie-Hellman** key exchange.

---

## ⚠️ Which One S3 Uses

> **S3 uses symmetric encryption — specifically AES-256.** Asymmetric encryption is **not** used for S3 object encryption.

The reason is the trade-off above: S3 is built to store enormous volumes of data, and symmetric encryption is dramatically faster at that scale.

**Where asymmetric encryption does appear in AWS:** the **key pair used to access EC2 instances** (the **.pem** file) is asymmetric — you hold the private key, AWS holds the public key. It also underpins **certificate authorities** and TLS.

---

## Summary

| | **Symmetric** | **Asymmetric** |
|---|---|---|
| **Keys** | One shared key | **Public + private pair** |
| **Speed** | **Fast** — suits large data | Slower |
| **Main weakness** | Securely distributing the key | Performance at scale |
| **Examples** | **AES-256**, DES, 3DES | RSA, ECC, Diffie-Hellman |
| **Used by S3?** | ✅ **Yes — AES-256** | ❌ No |

> For S3 purposes, **symmetric encryption is the only one that matters**. The asymmetric distinction is worth knowing for the exam and for understanding EC2 key pairs and TLS.
`,
    },
    {
      id: "s3-server-vs-client-encryption",
      title: "Server-Side vs Client-Side Encryption",
      shortDesc: "Who performs the encryption — and why only one of them appears in the S3 console",
      visuals: ["ServerVsClientEnc"],
      content: `## The Distinction

> **Server-Side Encryption (SSE):** you upload **unencrypted** data; **S3 encrypts it** before writing to storage, and decrypts on read.
>
> **Client-Side Encryption (CSE):** **you encrypt the data yourself** before uploading; S3 receives data that is already encrypted and simply stores it.

---

## ⚠️ Why the Console Only Shows Server-Side Options

Opening a bucket's encryption settings shows three options — **all of them server-side**.

> **Client-side encryption has no console option because S3 plays no part in it.** You encrypt with your own tools before upload; from S3's perspective it is storing ordinary bytes. There is nothing to configure.

---

## Full Comparison

| | **Server-Side (SSE)** | **Client-Side (CSE)** |
|---|---|---|
| **Who encrypts** | **S3**, on arrival | **You**, before upload |
| **Key management** | AWS-managed **or** customer-provided | **Entirely yours** |
| **Ease of use** | **Easy** — SSE-S3 is on by default and fully transparent | **Complex** — your own tooling and key handling |
| **Performance cost** | Minor, borne by S3 | **On your side**, noticeable for large objects |
| **Protects at rest** | ✅ Yes | ✅ Yes |
| **Protects in transit** | ⚠️ **Only if you use HTTPS** | ✅ **Inherently** — the data is already encrypted |
| **Tools** | Built into S3 | AWS Encryption SDK, OpenSSL, GnuPG |

---

## The In-Transit Difference That Matters

This is the genuinely important distinction:

> **With SSE, you upload plaintext.** If that upload happens over plain HTTP, the data is exposed in transit — encryption only begins once S3 receives it. **HTTPS is therefore effectively mandatory** with SSE.
>
> **With CSE, the data is already encrypted before it leaves your machine.** Even over HTTP, an interceptor gets ciphertext. Using HTTPS as well simply layers a second protection on top.

That is why CSE is described as offering **stronger overall security** — it protects the data across both states inherently, rather than depending on the transport.

---

## The Four Server-Side Options

SSE splits by **who manages the keys**:

| Option | Key management |
|---|---|
| **SSE-S3** | **S3 manages the keys entirely** — the default, fully transparent |
| **SSE-KMS** | Keys managed through **AWS KMS** — adds audit trails and access control |
| **DSSE-KMS** | **Dual-layer** KMS encryption — two independent layers |
| **SSE-C** | **You supply the key** with each request |

> ⚠️ **SSE-C does not appear in the console** — it can only be used via the **CLI, SDK, or REST API**, since the key must travel with every individual request.

---

## Choosing Between Them

**Use SSE** for general data protection and standard compliance — it is easy, transparent, and sufficient for most requirements. **SSE-KMS** specifically is the strongest option for compliance needs, thanks to KMS's auditing.

**Use CSE** when you need **maximum control**: custom encryption algorithms, keys that must never touch AWS, or regulatory requirements S3's built-in options cannot satisfy.

> Each of the four SSE options gets its own topic next, with the practical configuration for each.
`,
    },
    {
      id: "s3",
      title: "S3 – Simple Storage Service (Part 1)",
      shortDesc: "Object storage: classes, versioning, lifecycle, access, encryption",
      visuals: [],
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
      id: "s3-part2",
      title: "S3 – Part 2 (Encryption Deep-Dive, Public Access, Hosting, CORS, CRR)",
      shortDesc: "SSE-S3/KMS/DSSE/C, public access & Block Public Access, static hosting, CORS, replication",
      visuals: ["SSEOptions", "KMSAccessDemo", "SSECFlow", "PublicAccessWays", "BlockPublicAccess", "StaticHosting", "CORSDemo", "CRRDemo"],
      content: `## S3 – Part 2

Building on Part 1, this covers the **encryption deep-dive**, how **public access** really works, **static website hosting**, **CORS**, and **Cross-Region Replication**.

---

## Encryption foundations

### Symmetric vs Asymmetric
- **Symmetric — one shared key** encrypts and decrypts. Fast and efficient for large data, so it's what **S3 uses**. Standards: **AES** (128/192/**256-bit**) and 3DES; **AES-256 is the default**. Weakness: securely transporting that one key.
- **Asymmetric — two keys:** a **public key** encrypts, a separate **private key** decrypts (RSA, ECC, Diffie-Hellman). Stronger but slower; used by **EC2 key pairs (.pem)**, not S3.

> Exam: **S3 uses symmetric AES-256.**

### Server-Side vs Client-Side
- **SSE (server-side):** you send plaintext, **S3 encrypts** before storing. Since data travels in plaintext, **use HTTPS**. Keys can be AWS-managed or customer-provided.
- **CSE (client-side):** **you encrypt before sending**; S3's role is nil. Data is safe even over HTTP, but you manage everything (SDK/OpenSSL/GnuPG + keys). Best for strict/regulatory compliance.

---

## The 4 Server-Side Encryption options

| Option | Keys | Control | Cost |
|---|---|---|---|
| **SSE-S3** (default) | AWS-managed, AES-256 | None (no rotate/audit) | Free |
| **SSE-KMS** | KMS (AWS or your CMK) | Full control + rotation + **CloudTrail audit** | Extra (KMS) |
| **DSSE-KMS** | SSE-S3 **then** SSE-KMS (two layers) | KMS control, dual encryption | Extra (KMS) |
| **SSE-C** | **You provide** on every request | Total — AWS never stores the key | S3 storage only |

- **SSE-S3** is the default; encryption is mandatory on all objects. Transparent, free, but no key control/audit.
- **SSE-KMS**: needs **both** S3 permission **and** KMS key permission. (Demo: Amit has the key → access; Ravi has S3 read-only but no key → \`kms:Decrypt\` denied.)
- **DSSE-KMS** added for US gov multi-layer requirement (FIPS / CNSSP-15). Lab is identical to SSE-KMS, just pick the 3rd option.
- **SSE-C** is **CLI/SDK only** (hidden from console): \`openssl rand 32\` → base64 + MD5 → pass \`--sse-customer-key\` on upload **and** download. Lose the key = lose the data.

---

## Public Access

By default **every object is private**. Two ways to grant public access:
- **ACL** — older, per-object, **disabled by default**, **not recommended** by AWS.
- **Bucket Policy** — JSON, **recommended**, centralized, supports cross-account. Use the **Policy Generator**.

> Both fail while **Block Public Access** is ON.

### Block Public Access (master switch)
Set at **account level** (takes precedence) or **bucket level**; **ON by default**. Four sub-settings: block via **new ACLs**, **any ACL (new+existing)**, **new bucket policies**, and **any policy + cross-account**.

### Bucket policy anatomy (public-read)
\`Version\` → \`Statement[]\` → \`Sid\`, \`Effect: Allow\`, \`Principal: "*"\` (everyone), \`Action: s3:GetObject\`, \`Resource: arn:aws:s3:::bucket/*\` (every object).

---

## Static Website Hosting
- **Static** = fixed content (HTML/CSS/JS), no server-side processing — ~80-90% of business sites. **Dynamic** (PHP/Node.js) needs servers.
- Steps: create bucket (**name = domain**, e.g. \`web.cloudfox.in\` when using GoDaddy) → upload files → disable Block Public Access + bucket policy → enable **Static website hosting** (set \`index.html\`) → point domain (**Route 53 Alias/A record** or **GoDaddy CNAME**).
- Benefits: scalable, cheap (pay storage + outbound), 11 9s durable, simple, secure; add **CloudFront** for global speed.
- ⚠️ **Exam: S3 hosting is HTTP only — use CloudFront for HTTPS.** Route 53 alias record name **must match** the bucket name.

---

## CORS (Cross-Origin Resource Sharing)
A page in **bucket A** fetching from **bucket B** (different origin) is **blocked by the browser** by default. Fix: add a **CORS JSON rule on the resource bucket (B)** with \`AllowedOrigins\`, \`AllowedMethods\`, \`AllowedHeaders\`. Test in **incognito** to avoid cached results.

---

## Cross-Region Replication (CRR)
Auto-replicates objects to a destination bucket in **another region** — **one-way**. Requires **versioning on both buckets** + an **IAM role**.
- **Benefits:** disaster recovery, compliance (off-site), low-latency for distant users; can **change storage class** at destination to save money.
- **RTC** (Replication Time Control): 99.99% within **15 min** (SLA) + metrics, extra cost.
- **Delete-marker replication:** OFF = destination keeps object even if source deleted; ON = deletes propagate.
- **Replicate existing objects:** OFF by default (only new/modified); opt in to backfill.
- **Replica modification sync:** sync destination changes back to source (otherwise one-way).`,
    },
    {
      id: "s3-part3",
      title: "S3 – Part 3 (Transfer Acceleration, Logging, Pre-signed URLs, Events, Multipart, Endpoints, Access Points)",
      shortDesc: "Acceleration, access logging vs CloudTrail, Requester Pays, pre-signed URLs, MFA Delete, events, multipart, VPC endpoint, access points",
      visuals: ["TransferAcceleration", "LoggingVsCloudTrail", "RequesterPays", "PresignedURL", "MFADelete", "EventNotification", "MultipartUpload", "VPCEndpoint", "AccessPoints"],
      content: `## S3 – Part 3

Advanced S3 features: performance, auditing, cost-shifting, secure sharing, automation, large uploads, private connectivity, and granular access.

---

## Transfer Acceleration
Speeds up **long-distance** uploads/downloads by **50–500%**. Data hops to the nearest **CloudFront edge location**, then travels the **AWS global backbone** (optimized routing, no public-internet congestion) to the bucket.
- Enable **per bucket** → use the **accelerated endpoint** via CLI/SDK.
- Bigger files = bigger gains. **Not free** — a transfer fee applies.

---

## Auditing: Server Access Logging vs CloudTrail Data Events
Both record "who accessed what"; analyze with **Athena/Glue** (or Splunk/ELK).

| | Server Access Logging | CloudTrail Data Events |
|---|---|---|
| **Focus** | Summary-level requests | Detailed object-level API calls |
| **Detail** | Requester, time, action, status | + requester **ARN**, in depth |
| **Format** | **Plain text** | **JSON** |
| **Enable from** | S3 console (target bucket) | **CloudTrail** console (not S3) |
| **Cost** | Low; batched (2–4 hrs) | Higher (detailed) |
| **Use for** | Usage stats, patterns | Security/compliance, API audit |

> Exam: "logs in **JSON**" / object-level audit → **CloudTrail Data Events**.

---

## Requester Pays
By default the **bucket owner** pays storage + transfer + requests. Enable Requester Pays to push **data-transfer + request** costs onto whoever downloads (storage still owner-paid). Ideal for sharing large public datasets.
- Requester needs an **AWS account** (no anonymous access), a **bucket policy** granting access, and must send the **\`x-amz-request-payer\`** header (CLI \`--request-payer requester\`). Console can't send it → use CLI/curl.

---

## Pre-signed URLs
A **temporary, secure link** to a **private** object — no need to make it public. Works for **download (GET)** and **upload (PUT)**, with an expiry you set.
- Create via **console** (download), **CLI**, **SDK**, or **AWS Toolkit for Visual Studio** (upload). Upload URLs are locked to one object key. After expiry → "Access Denied — request has expired".

---

## MFA Delete
Extra protection: deleting an object **version** (or disabling versioning) needs a fresh **MFA code**.
- Requirements: **root** credentials, an **MFA device**, **versioning enabled**, and enable via **CLI/SDK only**.
- \`put-bucket-versioning … --mfa "arn code" --versioning-configuration MFADelete=Enabled,Status=Enabled\`.
- While on, you **can't** permanently delete versions or empty/delete the bucket without a code — disable it first to clean up.

---

## Event Notifications
Trigger an action on bucket events (**created / removed / restored**). Destinations: **Lambda, SNS, SQS**.
- Classic exam scenario: JPEG upload → S3 event → **Lambda** adds a watermark → writes to a \`watermark/\` folder (like OLX). Enables automated workflows, real-time monitoring, efficient processing.

---

## Multipart Upload
Objects can be **5 TB**, but a single PUT is capped at **5 GB** — so split big files into parts (**≥5 MB** each).
- Flow: **create-multipart-upload** (get an **Upload ID**) → **upload-part** ×N (each returns an **ETag**) → **complete** with the ETag list.
- Benefits: **parallel** uploads (faster), retry only failed parts (resilient on flaky networks). Use a **lifecycle rule** to auto-delete incomplete uploads.

---

## VPC Gateway Endpoint for S3
By default EC2 → S3 traffic uses the **public internet** (even same-region). A **gateway endpoint** keeps it on the **AWS private network** — more secure, lower latency.
- **Gateway endpoint** (S3 & DynamoDB): **free**, adds a **route table** entry. **Interface endpoint** (other services): hourly + data charges, uses an **ENI** (PrivateLink).
- Verify with \`traceroute\`: internet route shows hops; private route shows none.

---

## Access Points
A bucket has only **one** bucket policy — unwieldy when many apps need different access. Access points give each app its **own named endpoint + policy**.
- Each user/app → its own access point with a tailored policy (e.g. User1 → AP1 → PUT to \`f1\`). Scales to **hundreds** per bucket.
- Set a **network origin**: **VPC** (requires an S3 VPC endpoint) or **Internet**.
- Setup: delegate bucket access to access points in the **bucket policy** → create an access point + policy per user → grant users **\`ListAccessPoints/GetAccessPoint\`** IAM permission to see them. Best when **many** applications share one bucket.`,
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
};
