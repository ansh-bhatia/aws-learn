// Database
export default {
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

- **🔵🟢 Blue/Green Deployment** — clone production (blue) into a synced staging copy (green), test upgrades/schema changes safely, switch over with minimal downtime, roll back if needed. Only **MariaDB / MySQL / PostgreSQL**. → full deep-dive in the next topic.
- **🔀 RDS Proxy** — a connection-pooling layer between app and DB; faster, handles more users, smoother failover, credentials via Secrets Manager. **Especially for serverless (Lambda)**.
- **⚡ Zero-ETL Integration** — auto-replicates RDS data to **Amazon Redshift** in near real-time for analytics/ML — no ETL pipeline. **Only RDS for MySQL 8.0.32+**.

### Log Exports
Export audit/error/general/slow-query logs to **CloudWatch Logs** (an IAM role is auto-created). From CloudWatch you can further export to **S3** for long-term retention — RDS can't write logs to S3 directly.
`,
    },
    {
      id: "rds-blue-green",
      title: "RDS – Blue/Green Deployment",
      shortDesc: "Upgrade engines & change schemas with a synced staging copy — test, switch over, roll back",
      visuals: ["BlueGreenFlow", "BlueGreenUseCases"],
      content: `## RDS Blue/Green Deployment

Creating a database means walking through a lot of options — and **after** it exists there are just as many. Select an RDS database, open the **Actions** menu, and one of the entries is **Create Blue/Green Deployment**. This topic covers what it is, how it works, when to reach for it, and where it stops.

> **Naming:** the **green** environment is the **staging** environment. The **blue** environment is your **production** environment. Blue/green lets you run **two environments at once** — blue (current) and green (updated).

---

## The Problem It Solves

Open a database, go to **Configuration**, and you can see the engine version — say **PostgreSQL 13.7**. You want to upgrade, and for good reasons: newer versions bring **better performance** and **better security**.

But an in-place upgrade carries real risk:

- **What if it doesn't behave as expected?** Upgrading a database engine is easy. **Downgrading is always problematic.**
- **Rollback is very difficult** once the upgrade has been applied to your live data.
- **Your application faces downtime** while all this is happening.

The honest position is: *I want the new features, but I want them at zero risk.* That is exactly the gap blue/green fills.

---

## How It Works — The Five Steps

**1. A company runs PostgreSQL 13.** The **blue environment** represents the current production DB instance or cluster. Right now that's all that exists, and the application reads and writes to it.

**2. They want PostgreSQL 15** for new features and better performance.

**3. They create the green environment** with PostgreSQL 15, copy the data across, and keep it **continuously synced** from blue.

**4. Updates are applied to green** — schema changes, engine upgrades, application updates. Blue keeps serving production untouched.

**5. Switch over.** Once testing succeeds, the blue/green feature **automatically redirects traffic** to green. If green has problems instead, the process falls back to blue.

---

## Console Walkthrough

1. Go to the **RDS console** and **select your database** in the list.
2. Open the **Actions** menu and choose **Create Blue/Green Deployment**.
3. **Confirm the limitations** notice that AWS shows you.
4. AWS reads your current version — e.g. **13.17** — and **recommends compatible upgrade targets**. Only versions that are valid upgrade paths appear.
5. **Pick your target version.** From 13.17 you might choose **15**, or go straight to **17.1**.
6. Click **Create Staging Environment**.

AWS now builds the green environment for you, already running the version you selected. Anything else you need — new tables, altered columns, application changes — you apply to green from here.

---

## Testing Before You Commit

Green isn't something you switch to blindly. You test it by **redirecting a slice of traffic**.

Say **100 people** are connected to your application. You route **10%** of them to green:

- **Complaints from those 10 users?** Green has a problem. You **roll back** — and because blue was never modified, rolling back costs you nothing.
- **Positive feedback, better performance?** You're clear to **switch over from blue to green**.

This is the whole value proposition: the update is proven to function as expected **before** it goes live.

---

## Use Cases

| Use case | Why blue/green fits |
|---|---|
| **Database engine upgrade** | Test PostgreSQL 13 → 15 on green before it touches production. The headline case. |
| **Schema changes** | Already on the latest version but need new tables or altered columns — build them on green and test. |
| **Testing new features** | Your engine gained new capabilities and you want to exercise them against real synced data. |
| **Disaster recovery** | Blue/green creates an **identical copy**, so it doubles as a validated standby. |
| **Performance testing** | Benchmark an upgrade or schema change against production-shaped data with no production risk. |

> These matter more than they look. The exam asks **a lot of scenario-based questions** here — same concept, different turns and twists in the wording. Knowing the use cases is what lets you recognise them.

---

## Limitations

- **💰 Temporary cost increase** — creating green from blue means paying for a second environment until you delete blue after switchover.
- **🚫 Limited database engines** — blue/green supports **RDS for MariaDB**, **RDS for MySQL** and **PostgreSQL** only. **Not Microsoft SQL Server. Not Oracle.** Keep this one firmly in mind.
- **🔄 Data synchronisation overhead** — green stays synced with blue, and that synchronisation has a cost.
- **🔌 Connection handling during switchover** — there is some delay when cutting from blue to green. For a brief moment your application may be unable to connect to the database.
- **⚙️ No full automation for some changes** — a few changes aren't carried across automatically. Worth knowing it exists; not worth worrying about beyond that.

---

## Exam Pointers

- **Blue = production (live). Green = staging (updated copy).** Getting these the right way round is half the battle.
- Scenario says *"upgrade the engine with minimal downtime and the ability to roll back"* → **blue/green deployment**.
- Scenario mentions **Oracle** or **SQL Server** → blue/green is **not available**; look at read replicas or snapshot-and-restore instead.
- This used to be a **manual process** that you built yourself. AWS turned it into a first-class RDS feature.

> A full RDS **Super Lab** ties these features together end to end rather than repeating a separate lab per feature.
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
};
