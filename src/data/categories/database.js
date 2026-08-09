// Database
export default {
  id: "database",
  label: "Database",
  icon: "🗃️",
  color: "#2E73B8",
  topics: [
    {
      id: "database-fundamentals-intro",
      title: "Database Fundamentals – What Is a Database and a DBMS?",
      shortDesc: "From a messy 1975 notepad order log to Edgar Codd's 1970 relational model — and the 3 database families AWS supports",
      visuals: [],
      content: `## What a Database Actually Is

> **A database is a structured collection of information, usually stored electronically, that lets you efficiently store, retrieve, and manage data.** The key word is *structured* — storing data isn't the hard part; storing it in a way that makes it easy to retrieve later is.

> **A DBMS (Database Management System) is the software that creates, manages, and maintains databases** — it's the interface that lets you store, retrieve, and update data in a systematic, organized way.

---

## Before DBMS: The 1975 Notepad Problem

Picture order records for a company kept as free-form handwritten notes: quantity sometimes written as a number, sometimes as a word; a field labeled "note" in one entry and "remark" in the next; no consistent structure at all. Three concrete problems fall out of this:

1. **Free-form data** — no rule governing how anything gets written down
2. **Inconsistent structure** — the same kind of information appears under different labels from one record to the next
3. **Difficult to query** — asking "show me every delivered order" has no reliable way to be answered, because there's no consistent field to search against

---

## Edgar Codd's Relational Model (1970)

> **In 1970, Edgar F. Codd, while at IBM, published "A Relational Model of Data for Large Shared Data Banks"** — proposing that data be structured into **tables of rows and columns**, a structure we now call a **schema**.

Applied to the same order data: a **customers table**, an **orders table**, and a **products table**, each with a **fixed set of columns** (customer ID, customer name, address; order ID, customer ID, order date; etc.). The tables **relate to each other** — an order's customer ID points back to a row in the customers table, so "what's the status of Rajesh Kumar's order?" becomes a lookup through the customer ID linking the two tables, not a manual scan of inconsistent free text.

**What this structure buys you**: consistency (a column enforces what kind of value belongs there), easy retrieval (query by a known field), fewer errors, and scalability (multiple related tables instead of one sprawling, ever-growing note).

---

## Three Database Families

| Family | Sub-types | Popular engines | AWS's own product |
|---|---|---|---|
| **Relational** | — | MySQL, PostgreSQL, Oracle, MS SQL Server, MariaDB | **Amazon Aurora** |
| **NoSQL** | Document-oriented | MongoDB, CouchDB | **Amazon DocumentDB** |
| | Key-value | Redis | **Amazon DynamoDB** |
| | Column-family | Cassandra, HBase | **Amazon Keyspaces** |
| | Graph | Neo4j | **Amazon Neptune** |
| **In-memory** | — | Redis, Memcached | **Amazon ElastiCache** (managed Redis/Memcached) |

> AWS has a managed product for **every one of these database families** — a recurring exam pattern: match the workload shape (strict tabular/relational vs. flexible document vs. simple key-value vs. connected-graph vs. ultra-low-latency cache) to the right AWS service family, not just to RDS by default.

---

## Exam Framing

> "A messy way of storing data becomes structured, queryable, and consistent" → the shift from free-form storage to a **DBMS with a defined schema**. When a scenario names a specific data shape (documents, key-value pairs, graph relationships, pure caching), the answer is almost never "just use RDS" — it's whichever AWS service matches that specific family.
`,
    },
    {
      id: "relational-database-terminology",
      title: "Relational Database Terminology (Table, Key, Index, SQL, Normalization)",
      shortDesc: "Every core relational term, taught through one running e-commerce example: table, row, column, schema, keys, index, SQL, relationships",
      visuals: ["RelationalTables"],
      content: `## The Running Example

Three linked tables for an e-commerce backend — **customers**, **orders**, **products** — used throughout to ground every term below in one consistent, traceable scenario: "what's the status of Rajesh Kumar's shipment?" answered by following his customer ID from the customers table into the orders table, then the order's product ID into the products table.

---

## Table, Row, Column

> **A table is the fundamental building block of a relational database** — structured like a spreadsheet, made of **rows** and **columns**.

- **Row** — one unique record (e.g. the single row holding all of Rajesh Kumar's customer details)
- **Column** — one attribute/characteristic shared by every row (e.g. every customer row has a customer ID, name, address, payment method column)

---

## Schema

> **The schema is the overall blueprint of a database and its tables** — which tables exist, what columns each has, and each column's **data type**.

⚠️ **A relational schema is fixed.** Adding a new field (e.g. a mobile number column not originally planned for) is a real, deliberate change — someone has to update the database schema *and* the application's input form to actually collect and store it. This rigidity is the exact contrast point relational databases have against NoSQL, which the course explicitly flags as worth remembering for later.

**Data types** enforce what a column can hold — e.g. customer ID must be an integer, order date must be a date — preventing the kind of inconsistent free-text mess that predates DBMS entirely.

---

## Primary Key

> **A primary key is a column (or set of columns) that uniquely identifies each row.** Customer ID in the customers table, order ID in the orders table.

> The real-world analogy used: an Aadhaar number, a passport number, a PAN card number — all exist specifically because **names collide** (multiple "Rajesh Kumar"s), and a system needs one guaranteed-unique value to tell records apart unambiguously.

---

## Foreign Key

> **A foreign key is a column in one table that references a primary key in another table, creating the link between them.**

In the example: **customer ID appears as a foreign key inside the orders table**, referencing the customer ID primary key in the customers table. **Order ID appears as a foreign key inside the products table**, referencing the orders table. Following these links — customer → order → product — is exactly how "what did Rajesh Kumar order, and is it delivered?" gets answered across three separate tables without duplicating his details into every one of them.

---

## Index

> **An index is a structure that speeds up data retrieval — like a book's table of contents, letting the database jump to the right row instead of scanning every single one.**

A slow query against a large table is a common real-world reason to add an index on a frequently-searched column (e.g. customer name, order date) — a concept the course flags for deeper practical treatment later.

---

## SQL

> **SQL (Structured Query Language) is the language used to create, insert, update, and retrieve data in a relational database.**

Every everyday interaction with a relational-backed app is SQL running invisibly underneath: clicking "place order" generates an INSERT; clicking "cancel order" generates a DELETE (or update); filtering products by a price range on a shopping site generates a SELECT with a WHERE clause. The end user never sees SQL — it's the mechanism translating UI actions into actual table changes.

---

## Relationships

> **Tables relate to each other as one-to-one, one-to-many, or many-to-many**, depending on how records in one table map to records in another.

The customers-to-orders relationship in the running example is **one-to-many**: one customer (Rajesh Kumar) can place multiple orders over time, each becoming a **new row** in the orders table (all sharing his same customer ID as the foreign key) — not a new column crammed onto his existing customer row.

---

## Normalization

> **Normalization is organizing data into smaller, related tables to reduce redundancy and improve data integrity**, instead of one enormous table trying to hold everything.

Concretely: the orders table stores only a customer **ID**, not the customer's full name and address repeated on every single order row — those live once, in the customers table, and get looked up via the foreign key whenever needed. This keeps each table's size manageable and guarantees that updating a customer's address only ever requires changing **one** row, not every historical order row that customer ever placed.

---

## Exam Framing

> These ten terms — **table, row, column, schema, primary key, foreign key, index, SQL, relationship, normalization** — are the baseline vocabulary every subsequent RDS topic assumes. The single most testable contrast to carry forward: **a relational schema is fixed and requires deliberate migration to change**, which is precisely the constraint NoSQL databases like DynamoDB are designed to remove.
`,
    },
    {
      id: "why-rds-onprem-buildout",
      title: "Why RDS? The Full On-Premises Build-Out, Step by Step",
      shortDesc: "Everything a highly-available on-prem database actually requires — hardware, hypervisor, dual power, shared storage, redundant networking, a DR site — versus RDS's 5 minutes",
      visuals: [],
      content: `## Three Ways to Deploy a Database

Any database needs to live somewhere: **on-premises**, on **Amazon EC2**, or on **Amazon RDS**. Before comparing them on paper, this walks through what building a genuinely **highly-available, fault-tolerant** database actually requires **on-premises**, piece by piece — so the RDS comparison that follows isn't abstract.

---

## The Full Build-Out Chain

1. **Purchase hardware** — real capital expenditure, paid upfront, before anything runs
2. **Choose a hypervisor** (VMware, Microsoft Hyper-V, Citrix) and license it, to run virtual machines on that hardware
3. **Create the VM**, then **install and manage an operating system** on it (patching, security updates — all manual, ongoing responsibility)
4. **Install the database management system** (e.g. MySQL) on top of that OS
5. **Power redundancy**: a primary electricity source, **plus** a UPS and backup generator, so a power interruption doesn't take the whole stack down
6. **Hardware redundancy**: if the motherboard itself fails, there's no recovery without a **second physical server** — so a standby server, with its own power setup, becomes necessary too
7. **Shared storage**: the primary and standby servers both need access to the **same data**, which means purchasing dedicated shared storage (e.g. a SAN), itself needing redundant connectivity so one failed link doesn't cut off access
8. **Network redundancy**: redundant **Ethernet switches** connecting everything, then redundant **routers**, then **two separate ISPs** — each layer doubled specifically so no single failure takes the system offline
9. **Disaster recovery**: all of the above, **rebuilt again at a second physical location** (the lecture uses Mumbai as primary, Hyderabad as DR) — with **database replication** running continuously between the two sites, so the DR site can take over if the entire primary site goes down

> ⚠️ **Every single layer above is doubled specifically because any single point of failure defeats the whole purpose of "highly available."** This is not an exaggerated example — it's the genuine minimum shape of on-premises HA done properly.

---

## The Payoff Comparison

> **The same outcome — a working, production-ready RDS database — takes about 5 minutes**, with **zero upfront capital cost**: no hardware, no hypervisor licensing, no shared storage purchase, no networking equipment. And **zero ongoing management** of any of it — no power supply, no hardware, no hypervisor, no VM, no OS, no Ethernet switches, no routers.

> The framing offered directly: large enterprises routinely spend **millions of dollars** building out exactly the on-premises chain described above. AWS RDS collapses that entire chain into a managed service billed operationally, with the setup itself measured in minutes rather than the **weeks to months** a real on-premises HA build actually takes.

---

## Exam Framing

> When a scenario describes **"minimize upfront capital expenditure," "reduce operational overhead," or "get a production database running quickly without managing infrastructure"** — that's the RDS value proposition stated in exam language. The specific things RDS removes from your plate are the same ones enumerated above: hardware, hypervisor, OS patching, shared storage, and networking redundancy.
`,
    },
    {
      id: "rds-vs-ec2-vs-onprem-comparison",
      title: "On-Premises vs EC2 vs RDS – The 15-Point Comparison",
      shortDesc: "Control, cost, scaling, backup, HA, security, compliance, and 8 more axes — laid out side by side for choosing a deployment option",
      visuals: ["DeploymentComparison"],
      content: `## The Three Options, Compared Point by Point

| Axis | 🏢 On-Premises | 💻 EC2 | 🛢️ RDS |
|---|---|---|---|
| **Control** | Full control — hardware, network, software | Full control over the VM/OS/DB engine; no hardware/hypervisor access | Limited — predefined instance types, no OS access |
| **Management** | 100% manual — hardware, scaling, backup, patching, all of it | Manual backup, patching, and scaling of the instance | Automated backups, patching, scaling, and software updates |
| **Customization** | Complete — any hardware, any software version | Full customization of the OS and DB config | Limited — no OS access, restricted database settings |
| **Cost** | High upfront capital expenditure (hardware, software, maintenance) | Pay-as-you-go, but you cover instance + storage costs directly | No capital expenditure; pure operational expenditure |
| **Scaling** | Manual — buy more hardware, expect downtime during upgrades | Manual, but easier than on-prem (resize the instance) | Automatic scaling up/down with minimal or no downtime |
| **Backup & Recovery** | Fully manual, difficult to manage reliably | Manual configuration required | Automatic backups, Multi-AZ replication, point-in-time recovery |
| **High Availability** | Complex — requires genuinely redundant infrastructure throughout | Manual clustering/failover setup, less complex than on-prem | Multi-AZ deployment achievable with minimal setup, often within minutes |
| **Security** | Full responsibility — physical AND network security | No physical security concern; full control over network/OS-level security config | Managed security features — encryption at rest/in transit, VPC integration built in |
| **Maintenance** | High — hardware maintenance, software patching, all manual and time-consuming | Manual patching of the instance's OS and DB engine | Low — automated patching and maintenance |
| **Performance Tuning** | Full hardware-level control (add CPU/RAM/IO as needed) | Full control over instance type — resize quickly for more/less capacity | Limited — select an instance type, but no deep low-level tuning |
| **Time to Deploy** | Very high — realistically **months** for a full HA build | Medium — no procurement, but still real setup work | Very short — automated setup, ready in **minutes** |
| **Compliance** | Full control to meet requirements, but the work is entirely yours | Some configuration needed to align with compliance needs | AWS handles most standards (SOC, PCI, HIPAA) with minimal added configuration |
| **Disaster Recovery** | Fully manual — build, replicate, and test a second site yourself | Manual replication and backup setup | Built-in: Multi-AZ and automated snapshots |
| **Network Latency** | Fixed to wherever the physical location is | Can deploy closer to users by choosing region/VPC | Low latency via AWS's own optimized network, plus read replicas for further reduction |
| **Initial Setup Complexity** | Very high — full infrastructure, networking, and software build | Medium — no hardware, but still real configuration work | Very easy — automated, ready-to-use in minutes |

---

## The Pattern Across All 15 Points

> Nearly every axis follows the same shape: **on-premises gives maximum control at maximum operational cost and complexity; RDS gives minimal control in exchange for near-zero operational burden; EC2 sits in between** — full control over the database engine and OS, but you still own all the operational work (backup, patching, scaling, HA) that RDS automates away.

**When on-prem or EC2 might still win:** genuine need for **full control** (regulatory requirements demanding it, or an unusual database engine/configuration RDS doesn't support). Otherwise, RDS's 13-out-of-15 favorable columns above are the reason it's the default recommendation for a standard relational workload.

---

## Exam Framing

> A scenario emphasizing **"minimize administrative overhead," "automate backups and patching," or "quickly stand up a highly available database"** → **RDS**. A scenario emphasizing **"need OS-level or database-engine-level control AWS doesn't expose"** → **EC2-hosted database**. Full physical/regulatory control requirements → **on-premises** remains the only option that satisfies them.
`,
    },
    {
      id: "rds-lab-mysql-workbench",
      title: "Lab – First RDS Database (MySQL Workbench)",
      shortDesc: "Launching a free-tier MySQL instance with public access and connecting graphically — plus why public access isn't the real-world way to do it",
      visuals: [],
      content: `## Goal

Create the first hands-on RDS instance with the absolute minimum configuration, connect to it from a local machine using a GUI SQL client, and see a real database respond — deliberately deferring every advanced setting to later, dedicated lectures.

---

## Step 1 — Create the Database

**RDS console → Create database:**

- **Engine** — a list of options appears: **Aurora** (AWS's own product), MySQL, MariaDB, PostgreSQL, Oracle, Microsoft SQL Server, IBM Db2. This lab uses **MySQL**.
- **Version** — RDS deliberately offers a **wide range of versions**, not just the newest, because companies migrating an existing on-premises database (e.g. running MySQL 5.7 for years) need to match that exact version on RDS rather than force an upgrade during migration. (A dedicated **Database Migration Service** covers the actual migration process later in the course.)
- **Template** — Production / Dev-Test / **Free tier**. Choosing Free tier automatically **locks out the Availability & Durability options** (no Multi-AZ choice) — that comparison is covered in depth in a later lecture.
- **DB instance identifier, username, password** — ⚠️ **the password cannot contain an "@" character** — a genuinely easy mistake to make out of habit, and one the lecture hits live.
- **Instance class** — Free tier locks this to a small **burstable (t-class)** instance automatically; no manual selection needed at this stage.
- **Storage** — backed by **EBS**, defaulting to **20GB** for this lab (RDS storage tops out at 64TB, covered later).
- **Connectivity** — kept in the **default VPC**; **Public access: Yes** is deliberately chosen here specifically so the database can be reached from a home computer for this first lab.
- **VPC security group** — left at the account's default security group for simplicity.

**Create database** → provisioning takes roughly **5-7 minutes** before the status shows **Available**.

> ⚠️ **This lab's configuration — public access, default security group — is explicitly flagged as NOT best practice.** It's chosen purely to get a first working connection quickly; the very next lab (EC2-to-RDS connection) rebuilds the same idea the correct way, with the database private and reachable only from inside the VPC.

---

## Step 2 — Connect with MySQL Workbench

**MySQL Workbench** (a free GUI SQL client, downloadable directly from a web search — no account required) is used to connect graphically:

- **New connection** → paste the RDS instance's **endpoint** as the hostname, **admin** as the username → **Test Connection** → enter the password when prompted → optionally save it in the credential vault
- A successful connection opens the database, initially empty

**Creating a database and understanding the boundary of responsibility:** clicking to create a new schema (e.g. named **myappdb**) is as far as the *infrastructure* work goes. **Creating tables and defining schema inside that database is explicitly framed as the database programmer's job, not the cloud engineer's** — the deliverable from an infrastructure perspective is simply: *"here's your database, its endpoint, and its credentials — go build your tables."*

---

## ⚠️ Cleanup — Don't Forget to Delete

**RDS console → select the database → Actions → Delete:**

- Declining the offer to create a final snapshot and to retain automated backups (both optional, but relevant for a real production teardown)
- Typing **"delete me"** to confirm, and checking **"I acknowledge"** on instance deletion

> Forgetting to delete a lab RDS instance is a genuine, easy-to-make cost mistake — this cleanup step is called out explicitly as something not to skip.

---

## Exam Framing

> The core exam-relevant takeaway from this lab isn't the click-path — it's the **public-access anti-pattern the lab deliberately demonstrates and then immediately disavows**: a publicly-accessible RDS instance reachable directly over the internet is a real security exposure, and the very next lab shows the correct alternative — private subnet, access only via an EC2 instance inside the same VPC.
`,
    },
    {
      id: "rds-ec2-connection-lab",
      title: "Lab – Connecting EC2 to RDS (The Real-World Way)",
      shortDesc: "A private RDS instance reachable only from an EC2 MySQL client, secured with two purpose-built security groups referencing each other",
      visuals: [],
      content: `## Goal

Rebuild the previous lab's database connection the way it's actually done in production: **RDS instance kept fully private**, reachable only from an **EC2 instance acting as a SQL client**, with security groups doing the actual gatekeeping — and everything driven from the command line, matching how database administrators genuinely work day to day (rather than a GUI tool).

---

## Step 1 — Two Purpose-Built Security Groups

**EC2 SG (protects the SQL client instance):**
- **Inbound**: SSH (TCP 22) from anywhere — needed to log into the instance itself
- **Outbound**: all traffic (default) — ⚠️ **no inbound MySQL rule is needed on this security group at all.** The EC2 instance *initiates* the connection to RDS; the reply traffic coming back is automatically permitted because **security groups are stateful** — a rule only needs to exist on the side that receives the *first* packet of a connection, not on both sides.

**RDS SG (protects the database instance):**
- **Inbound**: **MySQL/Aurora (TCP 3306)**, sourced from **the EC2 security group itself** (not a raw IP range) — meaning only traffic actually originating from an instance carrying that EC2 security group can ever reach port 3306
- **Outbound**: all traffic (default)

---

## Step 2 — Create the RDS Instance (Private This Time)

Same MySQL/Free-tier setup as the previous lab, with two deliberate differences:

- **Public access: No** — the EC2 client lives in the **same VPC**, so it doesn't need internet-routable access to reach the database
- **VPC security group**: the purpose-built **RDS SG** from Step 1, not the account default

---

## Step 3 — Create the EC2 Instance (the SQL Client)

While the RDS instance provisions (5-7 minutes), launch an EC2 instance in parallel: Amazon Linux, t2.micro, **same VPC** as the RDS instance, **public IP assigned** (so the instance itself can be reached over SSH from outside), using the **EC2 SG** created in Step 1.

---

## Step 4 — Install a MySQL Client on the EC2 Instance

SSH into the EC2 instance, then install a client:

**sudo yum install mariadb105 -y** (or the equivalent MariaDB client package)

> ⚠️ **This installs a MariaDB client, not literally "MySQL"** — but MariaDB and MySQL share the same origin and are fully protocol-compatible, so the MariaDB client connects to a MySQL RDS instance without any issue. AWS's own documentation recommends this exact package.

---

## Step 5 — Connect from the EC2 Instance

**mysql -h &lt;RDS endpoint&gt; -P 3306 -u admin -p**

- **-h** — host (the RDS endpoint, copied from the console)
- **-P** — port (3306)
- **-u** — username (admin)
- **-p** — prompts for the password interactively

A successful connection drops into a **MySQL &gt;** prompt, confirming the client reached the database through the private network path — no public internet involved at any point.

---

## Step 6 — Create a Database, a Table, and Insert Data

From the MySQL prompt:

1. **CREATE DATABASE sampledb;**
2. **USE sampledb;** — switches the active context to the new database
3. **CREATE TABLE employee (...);** — defines a table's columns and types
4. **INSERT INTO employee VALUES (...);** — adds records, one or more at a time
5. **SELECT * FROM employee;** — verifies the data actually landed, returning every row currently in the table

> ⚠️ **This manual command-line entry is explicitly called out as not how real applications populate a database.** In a genuine application, a **front-end/web server** writes to the database automatically as users interact with it — manual INSERT statements are purely a lab technique to prove the connection and table actually work, not a production data-entry pattern.

---

## Exam Framing

> "Database reachable only from application servers inside the VPC, never directly from the internet" → **private RDS instance + a security group scoped to another security group as its source** (not an IP range) — the exact pattern built here. Remember the **stateful security group** detail: the EC2 client's security group needs no inbound MySQL rule at all, because the reply traffic from RDS is automatically allowed once the outbound request already matched a rule.
`,
    },
    {
      id: "rds-single-db-instance",
      title: "RDS Availability – Single DB Instance",
      shortDesc: "One instance, one AZ, no standby — the cheapest option, and the one that makes every other availability option make sense",
      visuals: [],
      content: `## What It Is

> **A Single DB Instance is a standalone RDS database running in one Availability Zone, with no standby replica and no automatic failover.**

This is the baseline every other availability option gets compared against — understanding its drawbacks is what makes Multi-AZ's value proposition click.

---

## The Appeal: Lowest Cost

> **No standby instance, no extra replicated resources — just one database, priced at the lowest possible tier.** If a Multi-AZ Instance costs roughly **2×** and a Multi-AZ Cluster roughly **3×**, a Single Instance is the **1×** baseline everything else is measured against.

For a genuinely non-critical application — one where the business can tolerate the database being briefly unavailable — this cost saving is a completely legitimate choice, not a compromise made out of ignorance.

---

## Three Drawbacks

**1. No automatic failover.** If the instance (or its entire Availability Zone) fails, there's no standby anywhere to take over. Recovery means manually **creating a new DB instance in a different AZ and restoring from backup** — a real, hands-on process, not a background AWS operation.

**2. No high availability.** Data lives in exactly one AZ. ⚠️ This makes it explicitly **unsuitable for mission-critical applications** — anything where downtime has a real business cost.

**3. Manual backup recovery.** Automated backups exist and can be restored from, but the entire restore process — noticing the failure, initiating the restore, waiting for it to complete — is **manual and takes real time and effort**, unlike the automatic, near-instant failover Multi-AZ options provide.

---

## When It's Actually the Right Choice

> **Not every organization needs to pay for high availability.** If a company's budget prioritizes cost savings over uptime, and the application genuinely can tolerate downtime, Single DB Instance is the financially correct choice — not a lesser one.

Because RDS billing is **recurring** (paid every month, not a one-time cost), the price gap between Single and Multi-AZ compounds significantly over a year — a real budget conversation, not just a technical one.

---

## Exam Framing

> "Cheapest option, non-critical workload, downtime is tolerable" → **Single DB Instance**. The three drawbacks above — no auto-failover, no HA, manual recovery — are exactly what the next topic's Multi-AZ Instance option exists to solve, at roughly double the cost.
`,
    },
    {
      id: "rds-multi-az-instance",
      title: "RDS Availability – Multi-AZ DB Instance",
      shortDesc: "A synchronous standby in a second AZ, promoted automatically in ~60 seconds — high availability with zero performance gain",
      visuals: [],
      content: `## What It Is

> **A Multi-AZ DB Instance creates two database instances in two different Availability Zones within the same region** — one **primary**, one **standby** — specifically to provide automatic high availability for mission-critical workloads.

---

## How It Works

1. The application always connects via the **DB endpoint** — never a raw IP address. The endpoint transparently points at whichever instance is currently primary.
2. Every write goes to the **primary** instance first.
3. The primary **synchronously replicates** that write to the standby's EBS volume in the second AZ, in real time — a one-way, primary-to-standby replication path.
4. Only after the standby confirms the write does the transaction complete.

> ⚠️ **The standby instance does absolutely no work under normal operation** — it exists purely as a synchronized, ready-to-promote copy, not as a second worker sharing any load.

---

## Automatic Failover

> **If the primary fails (system failure, maintenance, an AZ-level issue), AWS automatically promotes the standby to primary — no manual intervention required, typically completing within about 60 seconds.**

Because the application only ever talks to the **DB endpoint**, this failover is transparent — the endpoint itself starts pointing at the newly-promoted instance, so no connection-string change is needed on the application side.

---

## Where It's Used

> The canonical use case: **mission-critical production applications** — banking systems, stock trading platforms, e-commerce stores — anywhere sustained downtime translates directly into lost business or lost customer trust, and near-zero downtime is worth paying for.

---

## Benefits

- **High availability** — survives both a single-instance failure and a full AZ outage, without the operational burden of building this manually on-premises
- **No data loss** — synchronous replication means the standby is always current
- **Automatic, near-instant failover** — ~60 seconds, with zero manual steps
- **Uninterrupted backup-like durability** — the continuous replication itself functions like an always-current, real-time backup

---

## ⚠️ The Critical Exam Point: No Performance Gain

> **Multi-AZ is exclusively for availability — it provides ZERO performance benefit.** The standby instance sits idle; only the primary ever handles any traffic, read or write. Doubling your instance count does **not** double your throughput.

If a question is asking about **improving database performance** rather than availability, Multi-AZ Instance is the wrong answer — the two tools for that are **read replicas** and **ElastiCache**, both covered separately later in this section.

---

## Costs and Constraints

- **~2× the cost** of a Single DB Instance — two full instances running continuously, one of which does no work under normal conditions
- **Slight latency** on every write, since the primary waits for the standby's replication to complete before confirming the transaction
- **Not for scaling** — the instance count is fixed at exactly two (primary + standby), and both always live **within the same region** — there is no cross-region Multi-AZ

---

## Exam Framing

> "High availability, near-zero downtime, standard workload" → **Multi-AZ DB Instance**. ⚠️ **The single most commonly tested trap**: a question mentioning "performance" or "scaling" is never answered by Multi-AZ Instance — that's what read replicas and ElastiCache exist for. Multi-AZ Instance buys availability, full stop.
`,
    },
    {
      id: "rds-multi-az-cluster",
      title: "RDS Availability – Multi-AZ DB Cluster",
      shortDesc: "One writer, two readers, semi-synchronous replication — availability AND read performance, at roughly 3× the cost",
      visuals: ["AvailabilityOptions"],
      content: `## What It Is

> **A Multi-AZ DB Cluster is a semi-synchronous high-availability deployment with one writer instance and two readable reader instances, spread across three separate Availability Zones in the same region.** Unlike a Multi-AZ Instance's idle standby, both readers here actively serve traffic.

⚠️ **This is a relatively new RDS feature** — the course explicitly flags newly-released AWS features as prime exam-question material, since AWS tends to test awareness of recent capabilities within months of release.

---

## Deployment Structure

- **One writer instance** — handles **all write operations**, and can also serve reads
- **Two reader instances** — handle **read-only operations**, fixed at exactly two, spread across the two remaining AZs
- All three instances live in **different Availability Zones within the same region**

**A concrete example**: booking a flight is a **write** (only the writer instance can handle it — creating the confirmed booking record). Checking that flight's status afterward via a PNR lookup is a **read** — any of the three instances (writer or either reader) can serve it.

---

## The Performance Difference vs Multi-AZ Instance

> Picture 100 incoming requests, 20 writes and 80 reads. **With a Multi-AZ Instance**, all 100 requests hit the single working primary — the standby does nothing. **With a Multi-AZ Cluster**, the writer handles the 20 writes while the 80 reads are split across the writer and both readers — genuine load distribution across three working instances instead of one.

This is the core reason Multi-AZ Cluster provides **performance benefit**, where plain Multi-AZ Instance provides **none at all**.

---

## Semi-Synchronous Replication (and Why It's Faster for Writes)

> **In a plain Multi-AZ Instance, the primary must wait for the standby to fully acknowledge a write before handling the next request** — fully synchronous.

> **In a Multi-AZ Cluster, the writer does NOT wait for the readers to fully synchronize before moving on to the next write** — this is what "semi-synchronous" means, and it's specifically why Multi-AZ Cluster delivers **lower write latency** than a plain Multi-AZ Instance, despite both replicating in real time.

---

## Automatic Failover

If the writer fails, **one of the two reader instances is automatically promoted to writer** — no manual steps, minimal downtime, and **no data loss**, since replication to the readers was already continuously happening.

---

## Benefits

- **High availability** — same fundamental guarantee as Multi-AZ Instance
- **Increased read capacity** — the headline advantage over plain Multi-AZ, since two dedicated reader instances actually do work
- **Lower write latency** — from the semi-synchronous replication model
- **Automatic failover** with no data loss
- **High data durability** — data lives across three AZs simultaneously
- **Cost efficiency specifically for read-heavy workloads** — the extra cost is justified when read traffic volume makes the two working readers worth paying for

---

## Downsides

- **Higher cost** — roughly **3×** a Single DB Instance, since three full instances run continuously
- **Increased complexity** — genuinely harder to reason about than a single instance or a simple primary/standby pair
- **Fixed at exactly 3 instances** — 1 writer + 2 readers, with no way to add more
- ⚠️ **No cross-region disaster recovery** — despite the higher cost and three-AZ spread, everything still lives in **one region**; a full regional outage takes the whole cluster down
- ⚠️ **Limited engine support** — currently only **Amazon RDS for MySQL and Amazon RDS for PostgreSQL**, and only on specific newer engine versions. Selecting an older engine version (e.g. MySQL 5.7) in the console **removes the Multi-AZ Cluster option entirely** — a real, demonstrable constraint, not a theoretical one.

---

## Exam Framing

> "High availability AND better read performance, willing to pay the most for it" → **Multi-AZ DB Cluster**. The two numbers worth memorizing: **~35 second failover** (vs Multi-AZ Instance's ~60 seconds) and a **fixed 1 writer + 2 reader** topology. Remember the engine-support constraint too — this option isn't universally available across every RDS engine and version.
`,
    },
    {
      id: "rds-choosing-availability-option",
      title: "Choosing an RDS Availability Option (RPO & RTO)",
      shortDesc: "Using Recovery Point Objective and Recovery Time Objective to pick between Single, Multi-AZ Instance, and Multi-AZ Cluster",
      visuals: ["RPORTOChooser"],
      content: `## The Two Numbers That Decide the Question

> **RPO (Recovery Point Objective)** — the maximum amount of **data loss** the business can tolerate after a failure. This is what drives **backup frequency**.

> **RTO (Recovery Time Objective)** — the maximum amount of **downtime** the business can tolerate after a failure. This is what drives **which availability option to choose**.

⚠️ **As a cloud engineer, you don't set RPO/RTO yourself** — the business (or, in regulated industries, a regulator) hands these numbers to you as a requirement, and your job is choosing the cheapest option that actually satisfies them.

---

## RPO, Worked Through an Example

> If a backup runs at **10:00 AM** on an hourly schedule, and the database crashes at **10:30 AM**, exactly **30 minutes of data is lost** — everything written between the last backup and the crash.

- If the company's **RPO is 1 hour**, losing 30 minutes is **within tolerance** — the backup strategy is adequate as-is
- If the company's **RPO is 15 minutes**, that same 30-minute loss **fails to meet the requirement** — the backup interval needs to shrink (e.g. to every 15 minutes) to actually satisfy it

> The lower the RPO, the more frequently backups (or replication) must happen — and a truly near-zero RPO essentially forces continuous, synchronous replication rather than periodic backups at all.

---

## RTO, Worked Through an Example

> If a database crashes at **10:00 AM** and the company's **RTO is 1 hour**, the database must be restored and running again by **11:00 AM**.

- Meeting that window (creating a new instance, restoring from backup, or failing over) **satisfies RTO**
- Taking longer than the window **fails RTO**, and signals the recovery strategy needs to get faster — typically by moving to a higher-availability deployment option

---

## Mapping RPO/RTO to the Three Deployment Options

| Requirement | Option | Why |
|---|---|---|
| **High RPO/RTO tolerance** (hours of acceptable loss/downtime) | **Single DB Instance** | Fully backup-dependent, cheapest (1×), acceptable only when the business genuinely doesn't need fast recovery |
| **Low RPO, RTO ~60 seconds acceptable** | **Multi-AZ DB Instance** | Synchronous replication (near-zero data loss) + automatic ~60s failover, at 2× cost |
| **Extremely low RPO, RTO ~35 seconds, AND read performance matters** | **Multi-AZ DB Cluster** | Same near-zero data loss, faster ~35s failover, at 3× cost — but that extra cost buys genuine read throughput too |

---

## ⚠️ The Nuance Worth Remembering About Cluster's 3× Cost

> Multi-AZ Instance costs **2×** for the performance of **one working instance** (the standby contributes nothing). Multi-AZ Cluster costs **3×** for the performance of **two working reader instances plus the writer** — meaningfully more actual compute working for that extra spend, not just a bigger bill for the same idle-standby pattern.

This reframes the Cluster's higher price: it isn't "paying more for the same availability," it's "paying more and getting proportionally more usable performance in return" — worth calling out explicitly when a scenario mentions both **availability** and **read-heavy performance** requirements together.

---

## Exam Framing

> A scenario stating specific RPO/RTO numbers is testing whether the numbers map to the right deployment tier: **hours → Single**, **~60 seconds + near-zero loss → Multi-AZ Instance**, **~35 seconds + near-zero loss + read-heavy workload → Multi-AZ Cluster**. If the scenario names a regulator (e.g. a central bank) or an explicit compliance requirement, that's the tell that RPO/RTO is externally mandated, not a free choice — pick the cheapest option that still satisfies the stated numbers.
`,
    },
    {
      id: "rds-settings-identifier-master-username",
      title: "RDS Settings – Identifier, Master Username & Self-Managed Passwords",
      shortDesc: "Naming your instance, the master-user restrictions, and why storing credentials in a plaintext app file is a real security hole",
      visuals: [],
      content: `## DB Identifier

> **The identifier is simply the name used to identify an RDS instance or cluster** — no functional effect on connectivity (that's what the endpoint is for), purely for recognizing which database is which when an account has more than one.

⚠️ **The field label changes depending on the deployment option chosen**: selecting **Multi-AZ DB Cluster** shows **"DB cluster identifier"** (since it's provisioning three instances as one unit); selecting **Single DB Instance** or **Multi-AZ DB Instance** shows **"DB instance identifier"** (since it's provisioning exactly one addressable instance).

---

## Master Username

> **The master username is the initial administrative user created alongside the RDS instance** — used to configure the database engine, create additional users, create tables, and manage records. Additional users can be created later, but this one is provisioned automatically at instance creation.

**Rules**: 1-16 characters, letters (upper/lowercase), numbers, and underscore only — no other special characters.

⚠️ **Avoid the common default names explicitly**: admin, root, administrator, postgres, rdsadmin, azure_superuser. Different engines even suggest different defaults (PostgreSQL defaults to "postgres," for example) — but using any of these predictable names makes an attacker's job easier, since they're the very first usernames any automated attack tries. A distinctive, non-default username (e.g. **dbuser** with a project-specific twist) is a real, low-effort security improvement.

---

## Credential Management: Two Options

RDS offers exactly two ways to manage the master password: **self-managed** or **AWS Secrets Manager**. This topic covers self-managed; Secrets Manager is covered in full next.

> **Self-managed means you personally set the password at creation, remember it, and are responsible for storing and rotating it yourself** — through the RDS console or AWS CLI, entirely manually.

**Pros**: full control, and the simplest possible setup — just type a password and use it.

**Cons**: you must securely store and rotate it yourself; every application that connects has to be manually updated whenever it changes; and — the real risk — **higher exposure if the credential is ever leaked or simply never rotated**.

---

## ⚠️ Why Self-Managed Is Risky, Demonstrated

A concrete two-tier setup: a **web server (front end)** running PHP, and an **RDS database (back end)** behind it. The front end's **index.php** includes a separate file, **db_test.php**, which contains the actual connection logic.

> **Opening db_test.php reveals the database endpoint, username, and password sitting in plain, unencrypted text** — because with self-managed credentials, this is the only way for the application code to actually authenticate to the database at all.

**The real exposure**: this web server is internet-facing. Anyone who compromises it — a common enough occurrence — gains **direct, plaintext database credentials** the instant they read that one file. From there they can read, modify, or delete any record in the database. ⚠️ **This is exactly the scenario Secrets Manager exists to eliminate** — instead of a plaintext credential sitting on a public-facing server, the application fetches it securely at runtime.

---

## Exam Framing

> "Application credentials stored in plaintext on a publicly-reachable server" → immediately flag this as the self-managed anti-pattern. "Reduce this exposure without changing the application's basic architecture" → **AWS Secrets Manager**, covered next.
`,
    },
    {
      id: "rds-secrets-manager-credentials",
      title: "RDS Credentials – AWS Secrets Manager (The Secure Alternative)",
      shortDesc: "Letting Secrets Manager hold the password so it never touches the web server — with automatic rotation built in",
      visuals: ["CredentialsSecurity"],
      content: `## What Changes

> **AWS Secrets Manager stores the RDS master credentials securely on AWS's side, and can automatically rotate them on a schedule you define** — whenever a rotation happens, Secrets Manager updates RDS's actual password to match, entirely without manual intervention.

The core shift from self-managed: **the credential never has to live inside the application's own code or config files at all.**

---

## The Corrected Flow

Using the same web-server-to-database scenario from the self-managed topic, but with Secrets Manager enabled at RDS creation:

1. A user submits a form on the web server (front end)
2. The web server needs to write that record to RDS, but **has no stored username or password of its own**
3. The web server — which is specifically **authorized** to do this — calls **Secrets Manager**, requesting the current credential for this specific database
4. Secrets Manager returns the username and password
5. The web server uses that credential to authenticate to RDS and complete the write

> **Opening the equivalent db_test.php file under this setup shows no username or password anywhere in the code** — only logic that calls out to Secrets Manager to retrieve the credential dynamically, at the moment it's actually needed. Comparing this file side-by-side against the self-managed version from the prior topic is the clearest possible illustration of what changed.

---

## Where the Secret Actually Lives

**AWS Secrets Manager console**: a secret exists per protected resource, with its own **ARN**, tied to the specific RDS instance. Opening the secret's value reveals the actual username/password pair — but ⚠️ **this requires explicit IAM permission to view; there's no way to browse into it without authorization**, unlike a plaintext file sitting on an internet-facing server.

---

## Benefits

- **No credentials stored in application code or config files** — the single biggest security improvement over self-managed
- **Automatic rotation** — no manual password updates, reducing both operational burden and the risk of forgetting to rotate
- **Encrypted storage with strict IAM-gated access control**
- **Easy retrieval via the AWS SDK/API** — applications fetch the current credential programmatically, always getting the latest value with no manual sync step
- **No manual application updates needed when the credential changes** — since the app always asks Secrets Manager for the current value rather than storing its own copy

---

## Downsides

- **Slightly more complex setup** — integrating Secrets Manager into application code (calling the SDK/API to retrieve the secret) is real, if usually small, extra development work
- **A real, if low, ongoing cost** for storing and rotating secrets — unlike self-managed, which is free

---

## Exam Framing

> "Eliminate plaintext database credentials from application servers, with automatic rotation" → **AWS Secrets Manager**. The pairing worth remembering: **self-managed = free but the credential exposure risk sits entirely on you; Secrets Manager = small ongoing cost, but the credential never has to leave AWS's control plane** — and rotation happens without anyone touching application code.
`,
    },
    {
      id: "rds-instance-configuration-classes",
      title: "RDS Instance Configuration – Classes, Naming, and Optimized Writes",
      shortDesc: "Decoding db.m6g.large, choosing standard vs memory-optimized vs compute-optimized, and the free toggle that doubles write throughput",
      visuals: ["InstanceClassNaming"],
      content: `## What Instance Class Controls

> **The DB instance class determines the underlying hardware — CPU power, memory, and network speed — for an RDS database.** This choice directly affects both performance and cost: more powerful hardware costs proportionally more.

RDS scales from tiny free-tier instances up to configurations suited for Fortune 500-scale workloads — the same service, sized to the requirement.

---

## Decoding the Naming System

A name like **db.m6g.large** breaks into four parts, and the pattern is identical worldwide:

| Segment | Meaning |
|---|---|
| **db** | Fixed prefix — confirms this is a database instance type |
| **Family letter** (T / M / R / C) | The hardware category — see below |
| **Generation number** | Higher = newer hardware/technology, generally better price-performance (the same "iPhone 15 vs 16" logic as everywhere else in AWS naming) |
| **Size** (micro, small, medium, large, xlarge, 2xlarge...) | Capacity tier — each step up roughly **doubles** CPU, RAM, and price over the previous step |

---

## The Three Instance Classes

**T — Burstable performance.** For low-to-moderate workloads with occasional spikes — the free-tier default, and a natural fit for dev/test and small production databases.

**M — Standard/general purpose.** Balanced CPU, memory, and networking — the right default for "a variety of regular applications that don't need extreme resources in any one direction," similar to picking a mid-range laptop when the requirement isn't extreme.

**R — Memory-optimized.** More weight on RAM relative to CPU — suited for memory-intensive workloads: in-memory-style access patterns, real-time big data processing, caching-adjacent database use.

**C — Compute-optimized.** More weight on CPU — suited for batch processing, high-performance computing, and analytics workloads that are genuinely calculation-heavy rather than memory-bound.

> **The simple decision rule**: general purpose for most regular applications; memory-optimized when fast data access at volume matters more than raw compute; compute-optimized when heavy calculation is the actual bottleneck.

---

## Amazon RDS Optimized Writes

> **A free toggle, available only on supported instance classes, that improves write performance by up to 2× for write-heavy workloads** — with zero additional cost when the instance class supports it.

**How it works — traditional vs optimized:**

| | Traditional writes | Optimized writes |
|---|---|---|
| **Mechanism** | Each piece of data written individually, in sequence, after logging | Multiple writes **batched together** and written as a group |
| **I/O operations** | One I/O operation per write — 50 writes means 50 I/O operations | Grouped writes need far fewer I/O operations — e.g. 50 writes batched into 2 groups means just 2 I/O operations |
| **Latency** | Higher — each write waits its turn, completing one at a time | Lower — batched writes are processed together, reducing the wait per individual write |
| **Best suited for** | — | Write-heavy workloads: transactional databases, high-volume logging, analytics ingestion |

> The mechanism in one sentence: **fewer, larger I/O operations are inherently more efficient than many small individual ones** — Optimized Writes is RDS batching writes together specifically to reduce that I/O operation count.

---

## Exam Framing

> "Decode an instance type name" → **db.[family][generation][size]**, where **T=burstable, M=general purpose, R=memory-optimized, C=compute-optimized**, and each size step roughly doubles capacity and cost. "Improve write throughput for a write-heavy workload at no extra AWS charge" → **RDS Optimized Writes** — a free toggle, not a separate paid feature, available only on supported instance classes.
`,
    },
    {
      id: "rds-storage-fundamentals",
      title: "RDS Storage – EBS-Backed Types, the 64TB Cap, and Data Striping",
      shortDesc: "Storage options depend on the engine you pick, capped at 64TB, with automatic striping across volumes for large databases",
      visuals: [],
      content: `## RDS Storage Is Built on EBS

> **RDS storage is the underlying system RDS uses to hold database data — built on the same EBS volumes used for EC2 instances**, providing scalable, durable, high-performance storage without any separate storage service to manage.

---

## Storage Types Depend on the Database Engine

> ⚠️ **The exact list of available storage types changes based on which database engine is selected — not every engine offers the same options.**

The storage tab typically surfaces a handful of choices — **General Purpose SSD, Provisioned IOPS SSD, and Magnetic** among them — but the actual count varies: selecting **MySQL** might surface 3 options, while selecting **MariaDB** can surface 5, including magnetic. This mirrors the same EBS volume type distinctions covered in the EC2 storage section (gp2/gp3, io1/io2, magnetic) — the underlying tradeoffs (cost, IOPS, throughput) are identical, RDS just exposes whichever subset the selected engine supports.

---

## The 64TB Ceiling

> **RDS storage supports a maximum of 64TB, across every supported database engine** — DB2, MySQL, MariaDB, Oracle, SQL Server, and PostgreSQL all share this same hard ceiling.

Concretely, the allocated storage value accepted by the console runs from **100GB up to 65,536GB (64TB)** — attempting to specify anything beyond that is simply not possible for RDS.

> ⚠️ **Exam framing**: a scenario describing a database that needs to exceed 64TB is **not an RDS scenario at all** — that's specifically where **Amazon Redshift** (covered later in this section) becomes the relevant answer instead. Recognizing the 64TB number as RDS's hard limit is what flags the question as a Redshift question in disguise.

---

## Data Striping

> **RDS Data Striping automatically splits and distributes database data across multiple EBS volumes**, specifically to improve performance for large or high-traffic databases — reads and writes get spread across several volumes working in parallel instead of bottlenecking on one.

⚠️ **This is fully automatic and requires no manual configuration** — there's no toggle or setting to find for it. RDS decides when and how to stripe data based on the provisioned volume size, transparently, as part of managing the instance.

---

## Exam Framing

> "Database needs more than 64TB of storage" → **not RDS** — that's a Redshift scenario. "Large database, need better read/write throughput without changing engine or instance class" → **Data Striping**, which RDS already handles automatically once storage is large enough to benefit from it.
`,
    },
    {
      id: "rds-storage-auto-scaling",
      title: "RDS Storage Auto Scaling – Worked Example and Limitations",
      shortDesc: "Paying only for what you actually use instead of provisioning for a worst case you might never reach — traced through a real growth scenario",
      visuals: ["StorageAutoScaling"],
      content: `## The Problem It Solves

> **RDS bills for allocated storage, not actually-used storage** — provisioning 500GB up front means paying for 500GB from day one, even while the database holds only 10GB of real data.

The natural cost-conscious response — provisioning conservatively (e.g. 100GB) and manually bumping capacity later — creates a real operational risk: **teams genuinely forget to increase capacity in time**, the volume fills up, and the application goes down because the database can no longer write new data.

> **Storage Auto Scaling automatically increases allocated storage when RDS detects the database is running low on space** — removing both failure modes at once: no risk of hitting a hard wall, and no need to over-provision "just in case" from the start.

---

## Worked Example, Traced Step by Step

1. **Initial setup**: allocate **100GB**, enable Storage Auto Scaling, set a **maximum storage limit of 500GB** (explicitly capping how far RDS is allowed to grow it automatically — RDS's own hard ceiling is 64TB, but 500GB is the self-imposed budget guardrail here)
2. **Early state**: the database starts with **30GB** of actual data — billed for the full 100GB allocated, using only 30GB of it
3. **Growth**: over time, usage climbs to **90GB out of the 100GB allocated** — only 10GB of headroom left
4. **Threshold triggers**: once usage crosses roughly **90% of allocated capacity**, RDS **automatically** provisions more space — in this example, **+50GB**, bringing total allocation to **150GB**
5. **Continued growth**: usage climbs again, reaching **140GB out of 150GB** — the same ~90% threshold trips again, adding another **+50GB**, bringing total allocation to **200GB**
6. **The pattern repeats** as the database keeps growing, always adding capacity in increments, always staying within the **500GB ceiling** set at the start — RDS never grows the volume all the way to its own 64TB maximum unless explicitly permitted to

---

## Why This Actually Saves Money

> **Billing tracks whatever the allocation happens to be at each point in time, not a single upfront worst-case number.** Reaching 150GB of actual usage over months means paying roughly **100GB → 150GB → 200GB** in stepped increments along the way — not 500GB starting from day one, which is what provisioning defensively for "we might need it eventually" would have cost instead.

> A database might realistically take a full year to organically grow toward a 500GB ceiling — Storage Auto Scaling means the bill grows roughly in step with actual usage the entire time, rather than the company paying for capacity it won't touch for months.

---

## Three Limitations

1. **Limited storage type support** — ⚠️ **not available for Magnetic storage**; only the newer storage types support automatic scaling
2. **Not available for read replicas** — a read replica (covered in a later topic) does not get this automatic capacity growth
3. **Not supported on Multi-AZ DB Clusters** — ⚠️ **this is specifically why the Storage Auto Scaling toggle appears greyed out when Multi-AZ DB Cluster is the selected deployment option** — it's only available for Single DB Instance and Multi-AZ DB Instance deployments.

---

## Exam Framing

> "Avoid manual storage intervention while only paying for what's actually used" → **Storage Auto Scaling**. The three exceptions worth memorizing together: **Magnetic storage, read replicas, and Multi-AZ DB Clusters all lack this feature** — a scenario combining Storage Auto Scaling with any of those three is testing whether you know the feature doesn't actually apply there.
`,
    },
    {
      id: "rds-connectivity",
      title: "RDS Connectivity – Compute Resource, Subnet Groups, and Security Groups",
      shortDesc: "Placing a database in a private subnet, wiring a security group to accept only web-tier traffic, and the optional TLS certificate",
      visuals: ["RDSConnectivity"],
      content: `## Compute Resource: Manual vs Wizard-Assisted

> **The Connectivity section decides which resources are even allowed to reach the database, and how.**

The first choice is **"Don't connect to an EC2 compute resource"** vs **"Connect to an EC2 compute resource."**

- **Connect to an EC2 compute resource** — select a specific EC2 instance, and AWS **automatically creates the necessary security group rules** to let that instance reach the database, with no manual configuration required
- **Don't connect to an EC2 compute resource** — every security group rule has to be set up **manually** instead

> ⚠️ **Neither option restricts you to only that path** — choosing "don't connect" doesn't prevent EC2 access, it just means you're responsible for wiring the security groups yourself rather than letting the wizard do it. This manual route is exactly what's needed when access should instead come from the public internet or from a Lambda function, rather than a specific pre-selected EC2 instance.

---

## VPC and DB Subnet Group

The database is placed into a specific **VPC**, and within it, a **DB subnet group** determines which actual subnets it can land in.

> ⚠️ **Using the default subnet group gives AWS discretion over placement — including the possibility of landing the instance in a public subnet.** To guarantee a database stays private, a **custom DB subnet group** must be created, explicitly selecting only private subnets.

**Creating a custom subnet group**: choose the VPC, choose Availability Zones, then choose specific subnets within each AZ.

> ⚠️ **AZ count is a hard requirement tied to the deployment option**: a **Multi-AZ DB Instance needs subnets across at least 2 AZs**; a **Multi-AZ DB Cluster needs subnets across at least 3 AZs** (matching its writer + 2-reader topology). Selecting a subnet group with too few AZs will actually **block** selecting Multi-AZ DB Cluster later in the wizard until it's fixed.

---

## Public Access

> **Public access: Yes gives the database a public IP, reachable from anywhere on the internet** (still gated by username/password, but the network path itself is open). **Public access: No keeps the database reachable only from within its VPC**, with a private IP only.

For any production-grade setup, **No** is the correct choice — this is the same "public RDS instance is not best practice" lesson demonstrated hands-on in the earlier RDS lab topics.

---

## The Security Group: Scoped by Security Group, Not IP

> **The VPC security group attached to the RDS instance is what actually enforces "only the web tier can reach this database."**

The correct pattern, built step by step:

1. A **web server security group** already protects the application tier's EC2 instances
2. The **database's security group** adds an inbound rule for the database's port (**3306** for MySQL) with the **source set to the web server security group itself** — not a raw IP address or CIDR range
3. This means: **only instances that are members of the web server security group can reach the database on that port** — anything else, regardless of its IP, is blocked

> This is the exact same "security group referencing another security group as its source" pattern used in the earlier EC2-to-RDS connection lab — here it's formalized as the deliberate best-practice connectivity model for any RDS deployment.

---

## Certificate Authority (Optional TLS)

> **By default, communication between the application and the database is plain, unencrypted text.** The Certificate Authority option provides a **ready-to-use security certificate already installed on the RDS side** — installing the matching certificate on the application server encrypts app-to-database traffic in transit.

⚠️ **This step is entirely optional** — skipping it means the connection stays functional but unencrypted; installing the certificate on the application side is what actually turns on encryption for that traffic.

---

## Exam Framing

> "Database reachable only from application servers, never directly from the internet" → **Public access = No + a security group scoped to the app tier's security group as source**, not an IP range. "Guarantee an RDS instance never lands in a public subnet" → a **custom DB subnet group** listing only private subnets. Remember the AZ-count requirement: **2 AZs for Multi-AZ Instance, 3 AZs for Multi-AZ Cluster** — get this wrong in the subnet group and the wizard blocks the cluster option later.
`,
    },
    {
      id: "rds-database-authentication",
      title: "RDS Database Authentication – Password, IAM, and Kerberos",
      shortDesc: "Three ways to authenticate into an RDS database: native DB users, temporary IAM tokens, or existing corporate Active Directory accounts",
      visuals: ["DatabaseAuth"],
      content: `## Three Authentication Methods

> **Password authentication is always available as the baseline; Password + IAM and Password + Kerberos are additional methods layered on top of it, not replacements.**

---

## 1. Password Authentication (The Default)

> **Users are created directly inside the database engine itself** (e.g. MySQL users), each with their own username and password, exactly as demonstrated in the earlier EC2-RDS connection lab.

The **master user** created at instance setup can create additional database users and grant them access.

**Where this fits**: small development environments, internal testing, low-risk scenarios — e.g. a small team building an inventory management system still in development, where a database administrator can simply create a developer account directly in MySQL. Simple, fast, and entirely sufficient when the user count is small and the environment isn't internet-exposed production traffic.

---

## 2. Password + IAM Authentication

> **IAM users and roles can authenticate to the database using their own IAM identity, instead of needing a separately-created database user** — access is granted via a **temporary, automatically-expiring token** rather than a stored password.

**The problem this solves**: imagine 10-15 people who already have IAM accounts, and all of them need database access. Without this option, an administrator would need to **manually recreate every one of those 10-15 people as separate MySQL users** — duplicated identity management, out of sync the moment someone joins or leaves. With IAM authentication enabled, **the same IAM account they already use for everything else grants database access directly.**

**Benefits**: centralized access management (one identity system instead of two), reduced administrative overhead, and **tokens that automatically expire** — meaningfully reducing the risk of a long-lived, forgotten credential sitting around.

**Typical fit**: a mid-sized company with distinct dev/test/production environments, where developers already hold IAM accounts and shouldn't need a second, separately-managed database credential.

---

## 3. Password + Kerberos Authentication (Active Directory)

> **Active Directory is a centralized authentication system used broadly in corporate environments** — a single username/password lets a user log into their workstation, access networked devices, use Office 365, and more, all through the same identity (a single-sign-on-style model).

**Kerberos authentication lets RDS validate credentials against that same Active Directory** — users authenticate to the database with the **exact same corporate identity** they already use for everything else, with **no separate database-specific account ever created**.

**Where this matters**: large organizations that already run centralized Active Directory authentication and specifically don't want to duplicate 100+ user accounts into a database engine separately. ⚠️ **Genuinely complex to set up**, but a real, common requirement in large corporate environments specifically because it eliminates duplicate identity management at scale.

---

## ⚠️ The Multi-AZ DB Cluster Restriction

> **Password + Kerberos (Active Directory) authentication is NOT supported on Multi-AZ DB Cluster deployments.** It's fully available on Single DB Instance and Multi-AZ DB Instance, but Multi-AZ DB Cluster specifically excludes it.

This is one more item on the growing list of things Multi-AZ DB Cluster doesn't support (alongside cross-region DR and Storage Auto Scaling from earlier topics) — a recurring exam-relevant pattern: **Multi-AZ DB Cluster's extra performance comes with real feature tradeoffs, not just a higher price tag.**

---

## Exam Framing

> "Grant database access to existing IAM users/roles without creating separate database accounts, with automatically-expiring credentials" → **Password + IAM authentication**. "A large enterprise wants to authenticate database users through its existing corporate directory" → **Password + Kerberos (Active Directory)**, but ⚠️ **remember it's unavailable on Multi-AZ DB Cluster** — a scenario combining both is testing exactly this exclusion.
`,
    },
    {
      id: "rds-2",
      title: "RDS – Operations & Scaling (Part 2)",
      shortDesc: "Connectivity, monitoring, backups, encryption, replicas, proxy",
      visuals: ["RDSMonitoring", "ParameterOptionGroups", "RDSBackups", "RDSEncryption", "ReadReplicaVsStandby", "RDSAdvanced"],
      content: `## RDS Part 2 — Operations, Security & Scaling

Day-2 operations for RDS: connectivity, authentication, monitoring, tuning, backups, encryption, replicas, and advanced features.

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
