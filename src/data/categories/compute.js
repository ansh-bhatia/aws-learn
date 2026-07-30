// Compute
export default {
  id: "compute",
  label: "Compute",
  icon: "⚙️",
  color: "#FF9900",
  topics: [
    {
      id: "ec2-intro",
      title: "EC2 – Introduction & Virtualization",
      shortDesc: "What a virtual machine is, how hypervisors work, and host vs guest",
      visuals: ["VirtualizationDiagram", "ServerTypesCards", "HostGuestExplainer"],
      content: `## What EC2 Stands For

**EC2 = Elastic Compute Cloud.** The name has an **E** and then two **C**s, so it is shortened to **EC2**. The same trick names **Simple Storage Service** — three **S**s, hence **S3**.

EC2 is the name of a **platform**. Using it you can **create and manage virtual machines**.

In the AWS console, services are grouped by category. Open the **Compute** category and you find a long list of compute-related services — of which **EC2 is the most important**, because it is where virtual machine management happens.

But before touching the EC2 dashboard, you need a clear understanding of **how EC2 actually works** and **what a virtual machine is**.

---

## Start With Physical Machines

In the real world we have physical servers, in several form factors:

- **Tower server** — looks like a desktop tower.
- **Rack server** — when you have 50 or 60 servers, managing towers physically becomes hard. Rack servers slide into a rack instead.
- **Blade server** — when the requirement runs to **thousands** of servers, blades are the sensible choice.

The capacity of these machines is very high. Buy one and the vendor quotes something like **16 CPU cores and 128 GB of RAM**.

---

## The Problem Before Virtualization

To use a physical server you install an operating system on it — **Windows** or **Linux**.

**Before 2000 this was a real constraint: one physical machine meant one operating system.**

So if you had a high-capacity server and installed a single OS on it, **you could not fully utilise the hardware**. All those cores and all that RAM, dedicated to one system.

---

## VMware and the Hypervisor

To solve this, **VMware introduced the concept of virtualization** for enterprise systems. (Virtualization itself is older — IBM developed it for **mainframe** computers — but VMware brought it to normal x86 systems.)

With virtualization you can **create multiple operating systems inside a single box**. One physical server can run Linux and Windows **simultaneously**.

How? Underneath sits your hardware — standard **x86 architecture**. On top of it, VMware developed the **hypervisor**:

| Vendor | Hypervisor |
|---|---|
| **VMware** | **ESXi** |
| **Microsoft** | **Hyper-V** |

The hypervisor is the magical piece. It has the **capability to share physical hardware among multiple systems**, so you can create virtual systems inside one physical box. Because they are virtual, we call each one a **VM — virtual machine**.

> One piece of hardware, two operating systems running at the same time. **Physical machines host virtual machines.**

The advantage is direct: to run Linux and Windows on physical machines you would buy **two** systems. With virtualization you buy **one**.

---

## Host and Guest

Two terms you need:

- **Host** — the **physical machine**. In AWS you never even see it.
- **Guest** — each **virtual machine** running on that host.

One host running two virtual machines means one host and **two guests**.

---

## What This Means for You on AWS

When you create an EC2 instance, **you are creating one of these virtual machines**. EC2 is the platform that provides the facility.

A fair worry at this point: *"So I need to understand ESXi and Hyper-V? I'm new — I don't know anything about virtualization."*

**You do not need to.** That is underlying infrastructure:

| AWS manages | You manage |
|---|---|
| The hardware | Creating the virtual machine |
| The hypervisor layer | Installing the operating system |
| Host CPU and memory | Any applications you add inside it |

Even with zero knowledge of ESXi or Hyper-V, you can work with EC2.

---

## Is It Secure?

**Very secure.** Running multiple operating systems on the same hardware does **not** mean one can access another. The isolation is complete.
`,
    },
    {
      id: "ec2-launch-windows-lab",
      title: "Lab – Launch Your First Windows Instance",
      shortDesc: "Full walkthrough: AMI, instance type, key pair, RDP, and a permanent password",
      visuals: ["WindowsInstanceLab", "EC2LaunchSteps"],
      content: `## Goal

Create your first EC2 instance and experience the console for yourself. Every option here gets explained properly in its own topic — the point right now is to **build something and connect to it**.

---

## Choosing the AMI

Search **EC2** in the console, switch the region to **Mumbai**, and click **Launch instance**. Name it, then click **Browse more AMIs**.

The list covers almost everything — Amazon Linux, macOS, Red Hat, Ubuntu, Windows. Filter to Windows and choose **Microsoft Windows Server 2019 Base**.

> ⚠️ **The AMI must show the "Free tier eligible" tag.** Select an image without it — such as Windows Server with **SQL Server pre-installed** — and **you will be charged**. Check this every single time you run a lab.

Remember what this replaces: on a physical server you would download a 6–7 GB ISO from Microsoft, build a bootable USB drive, and install. Here you pick a **pre-defined template**.

---

## Instance Type

Same idea as buying a laptop — the vendor asks what it is for. Gaming needs a strong CPU, RAM and graphics card; learning AWS needs a modest machine.

The list runs from **1 vCPU / 1 GB RAM** all the way to **96 vCPU / 192 GB RAM**. Select **t2.micro** (1 vCPU, 1 GB RAM). It is free tier, and it is plenty.

---

## Key Pair

The key pair **authenticates you to your server** — it is your key to get in. Click **Create new key pair**, name it, choose **RSA**, and the **.pem** format.

> ⚠️ **You cannot download this key later.** Lose it and there is **no way** into the instance. Save it to your **Downloads** folder.

One key can serve many instances, or you can create one per instance — your choice. (**ED25519** is faster and more secure, but is only offered for Linux instances.)

---

## Network Settings

Click **Edit** on Network settings:

- **Subnet** — choose **ap-south-1a**. Leave it as "No preference" and AWS places the instance in whichever AZ suits them.
- **Auto-assign public IP** — leave enabled. This is the **identity you will use to reach the instance** over the internet.
- **Security group** — created automatically; **you cannot launch without one**. Rename it if you like. For **Windows** it allows **RDP (port 3389)** by default; for **Linux** it would allow **SSH (port 22)**. You can restrict the source to **My IP** — AWS detects it — or allow from anywhere.

---

## Storage

Windows gets a **30 GB root volume** — the volume the **operating system is installed on**. It is the same concept as the drive with the Windows logo on your own PC.

> **Linux instances get 8 GB instead**, because there is no GUI and far less overhead.

Set **Number of instances** to **1**.

> Set it to 2 and **both land in ap-south-1a**. To place instances in *different* AZs you must launch them separately, selecting a different subnet each time.

---

## Connect Over RDP

Click **Launch instance** → **View all instances**. The state moves from **pending** to **running**, then the status column reaches **2/2 checks passed** — one check for the AWS system, one for your instance.

Then: select the instance → **Connect** → **RDP client** → **Download remote desktop file**.

For the password: **Get password** → **Upload private key file** → choose your **.pem** → **Decrypt password**. Copy it, open the RDP file, and log in as **administrator**.

> Getting the password can take **up to four minutes** after launch. Forgotten which key you used? The instance detail page shows **"Key pair assigned at launch"**.

You now have a Windows desktop you can use exactly like a machine in your own premises.

---

## Stop Decrypting the Password Every Time

Reconnecting means decrypting that password again — tedious. Fix it from inside the instance:

**Server Manager** → **Tools** → **Computer Management** → **Local Users and Groups** → **Users** → **Administrator** → right-click → **Set Password** → **Proceed**.

Save the RDP file once, and from now on log in with the password you chose.

---

## Clean Up

| Action | Effect |
|---|---|
| **Stop** | Powers off the virtual machine |
| **Reboot** | Restarts it |
| **Terminate** | **Deletes it forever** |

> ⚠️ **Once terminated there is no way to get it back.** Terminate your instances after every lab.
`,
    },
    {
      id: "ec2-launch-linux-lab",
      title: "Lab – Launch a Linux Instance (SSH & PuTTY)",
      shortDesc: "Both paths: built-in ssh with .pem on Windows 10/11, or PuTTY with .ppk on Windows 7/8",
      visuals: ["LinuxInstanceLab"],
      content: `## Two Paths, One Instance

Creating the Linux instance is the same either way. **Connecting** to it depends on your own machine:

- **Windows 10 / 11** — **ssh is built in**. Use a **.pem** key.
- **Windows 7 / 8** — no ssh command, so you need **PuTTY**, which requires a **.ppk** key.

Use the toggle on the walkthrough below to follow whichever applies to you.

> You do not need prior Linux knowledge for this. Follow the steps and the concepts will land.

---

## Usernames Depend on the AMI

This trips people up, so learn it now:

| AMI | Default username |
|---|---|
| **Amazon Linux** | **ec2-user** |
| **Ubuntu** | **ubuntu** |
| **Windows** | **administrator** |

Choose **Amazon Linux** — AWS's own distribution and the most popular option here — with **t2.micro**.

---

## The Key Pair Difference

**Windows 10/11 → .pem.** You may also choose **ED25519** rather than RSA: it is **newer, faster and more secure**. Either works.

**Windows 7/8 → .ppk.** PuTTY **cannot use a .pem file**.

> ⚠️ **Always save the key in your default Downloads folder.** Put it somewhere like a custom folder on D: and the file may not end up read-only — which then blocks login.

---

## Network Settings

Select subnet **ap-south-1a** and enable **auto-assign public IP** — that address is how you reach the instance.

The security group allows **SSH (port 22)** by default for Linux, exactly as it allows RDP for Windows.

**Root volume is 8 GB** for Linux, against 30 GB for Windows, because there is no GUI overhead.

---

## Connecting With ssh (Windows 10/11)

Open **Command Prompt** and change to your Downloads folder (normally **C:\\Users\\<you>\\Downloads**).

Wait for **2/2 checks passed**, copy the **public IP**, then run:

**ssh -i cloud-fox-linux-key.pem ec2-user@public-ip**

When it asks *"Are you sure you want to continue connecting?"* — type **yes** in full. Not **y**.

You are in. Linux gives you a **command line only**, which is how roughly **90% of Linux use** works anyway.

---

## Connecting With PuTTY (Windows 7/8)

**Download the latest PuTTY** from a search for "download putty".

> ⚠️ Already have PuTTY installed from years ago? **Download the current version anyway.** A version mismatch will stop you connecting.

Then:

1. Copy the instance's **public IP** into **Session → Host Name**.
2. Go to **Connection → SSH → Auth → Credentials**.
3. **Browse** to your **.ppk** private key file and select it.
4. Click **Open** and accept the security alert.
5. Log in as **ec2-user** — **no password needed**, because the key authenticates you.

---

## Clean Up

You can **Stop**, **Reboot** or **Terminate** from the instance state menu. **Terminate** now that the lab is finished — as after every lab.
`,
    },
    {
      id: "ec2-ami",
      title: "EC2 – Amazon Machine Image (AMI)",
      shortDesc: "Pre-configured templates, the 4 use cases, and how to read the AMI list",
      visuals: ["AMIFlowDiagram"],
      content: `## What an AMI Is

The first option when creating an EC2 instance is to **select an AMI**.

**AMI = Amazon Machine Image.** The definition: a **pre-configured template of a virtual machine environment**. It contains the **operating system**, an **application server**, and **other configuration**.

---

## Compare It to the Traditional Way

On a physical or on-premises virtual machine, installing an OS means:

1. **Download the ISO image** — for Windows Server 2022 that is a 6–7 GB download from Microsoft.
2. **Create a bootable drive** from that ISO.
3. **Boot the machine** from the flash drive.
4. **Run the installation** — roughly **15 to 20 minutes** depending on your hardware.
5. Only now can you use it.

In AWS you do none of that. **You just select an AMI.** Linux AMI, Microsoft AMI — whatever your requirement is.

Look carefully at the AMI list and you will find images with **pre-installed software** as well — a Windows AMI with **MySQL** or **Microsoft SQL** already on it. That saves even more time.

> The ISO image is to a physical machine what the **AMI** is to an EC2 instance.

---

## The 4 Use Cases

**1 · Rapid instance deployment.** The obvious one. Traditional installation takes far too long; an AMI gets the operating system into your instance immediately.

**2 · Auto Scaling and Load Balancing.** This one is more interesting, and it connects to two features covered later.

Suppose you run three identical servers behind a **load balancer**, which spreads traffic across them. Traffic grows and three are no longer enough, so a fourth is needed — and **Auto Scaling creates it automatically**.

But how does your application get onto that brand-new instance? **A customised AMI.** Your AMI already contains all your applications, so when Auto Scaling launches the new instance from it, the machine comes up **with all the predefined software ready to use**. That is the rapid, automatic way to create multiple identical instances.

**3 · Environment cloning.** You have an environment and want an identical one. You could manually create 10–20 instances and install everything on each — the slow way. Or you create an **AMI** from the existing setup and deploy an identical environment from it, producing **multiple instances with identical configuration**.

**4 · Disaster recovery.** You run an **active** environment and a **standby** environment. If the active one goes down, users are redirected to the standby with no delay.

For that to work, the standby must reflect the **current state** of the active environment. So you create an AMI from the active environment and **copy that AMI across** to the standby.

---

## Reading the AMI List

In the console: **EC2 → Launch instance → name your instance → Browse more AMIs**. You get the community AMI list, filterable by Windows or Linux. Each entry shows:

| Column | What it tells you |
|---|---|
| **Owner / alias** | Who published it — **Amazon** for Amazon Linux, **Microsoft** for Windows, **RHEL** for Red Hat |
| **Platform** | Amazon Linux, Red Hat Linux, and so on |
| **Architecture** | The CPU architecture |
| **Owner ID** | The publisher's account |
| **Published date** | When the image was released |
| **Root device type** | **EBS** or **instance store** — an important distinction covered fully in the storage section |
| **Virtualization** | **HVM** (hardware virtual machine) — the latest environment AWS provides, and what you select in most cases |
| **ENA** | Elastic Network Adapter. "Yes" means you can attach a high-speed network interface to this AMI |

---

## x86 vs ARM — They Must Match

The architecture filter offers **64-bit (x86)** and **64-bit (ARM)**:

- **x86** — the normal processors in our computers, Intel and AMD.
- **ARM** (Advanced RISC Machine) — a newer architecture originally from mobile, designed to run on low-energy machines. Apple's **M1 and M2** chips are ARM-based.

> ⚠️ **The rule:** if you create an **ARM-based instance type, you must select an ARM-based AMI**. The AMI choice depends on which instance type you are creating.
`,
    },
    {
      id: "ec2-custom-ami-lab",
      title: "Lab – Build and Use a Custom AMI",
      shortDesc: "Configure once, image it, launch many — plus the password trap that catches everyone",
      visuals: ["CustomAMILab"],
      content: `## The Brief

Your boss asks for **ten Windows instances**, each running a **web server** and a **DHCP server**.

**The slow way:** create ten instances and configure both services on each, individually.

**The smart way:** create **one** instance, configure it, turn it into a **custom AMI**, and launch the remaining nine from that image. They arrive with everything already installed.

> There is a second payoff: if an instance ever fails, you do not rebuild and reconfigure. You launch a fresh one from the custom AMI and it is ready.

---

## Step 1 — Build the Base Instance

Launch **my_server_ami** — **Windows Server 2019 Base**, **t2.micro**, with a key pair.

**Add a security group rule allowing TCP port 80 from anywhere**, so you can verify the web server later.

> **Why 2019 rather than 2022?** Purely speed. t2.micro is modest hardware, and 2022 carries more overhead. The steps are identical on either.

---

## Step 2 — Install the Roles

Connect over RDP, then inside the instance: **Server Manager** → **Add Roles and Features** → **Role-based installation** → **Next**.

Tick **DHCP Server** (then **Add Features**), and tick **Web Server (IIS)**. Click through and **Install**.

> Notice that the base image has neither installed — that is exactly what you are adding.

---

## Step 3 — Change the Administrator Password ⚠️

**This is the step everyone forgets, and it cannot be fixed afterwards.**

**Server Manager** → **Tools** → **Computer Management** → **Local Users and Groups** → **Users** → **Administrator** → right-click → **Set Password** → **Proceed**.

Why it matters:

> **An instance launched from a custom AMI cannot generate a password from a .pem file.** Click **Get password** on such an instance and it returns *"Password not available"* — **forever**. Waiting four minutes, ten minutes or thirty makes no difference.

The credential those new instances *will* accept is **the administrator password baked into the image**. So you must set it **before creating the AMI**. Miss this and you have an image you cannot log in to.

---

## Step 4 — Verify Before Imaging

After installation, **Tools** now lists **IIS Manager** and **DHCP**.

Open **http://public-ip** in a browser and the **default IIS page** loads — confirming both that the web server works and that port 80 is open.

---

## Step 5 — Create the Image

Select the instance → **Actions** → **Image and templates** → **Create image**.

Name it **custom-ami-web-DHCP**, add a description, leave the 30 GB EBS volume alone, and click **Create image**.

Go to **AMIs** in the left menu. Status begins as **pending** — wait until it reads **available**.

---

## Step 6 — Launch From Your AMI

Two routes: select the AMI and click **Launch instance from AMI**, or launch normally and pick the **My AMIs** tab (**Owned by me**).

> ⚠️ **You must add the port 80 rule again.** The AMI captures what is **inside** the machine — web server, DHCP, your admin password. It does **not** capture instance configuration such as **security group rules**.

Set **Number of instances** to **2** (or 9, for the original brief) and launch.

---

## Step 7 — Confirm It Worked

Open each new instance's public IP — **the same IIS page appears on all of them**, at different IP addresses.

Connect over RDP and click **Get password**: *"Password not available"*, exactly as warned. Log in as **administrator** with **the password you set in step 3**.

Open **Server Manager → Tools** and both **DHCP** and **IIS** are present. Nine instances configured, one configuration performed.

---

## Step 8 — AMIs Are Regional

> **Your AMI exists only in the region where you created it.** It will not appear in N. Virginia.

For **disaster recovery**, select the AMI → **Actions** → **Copy AMI** → choose the target region. You can then launch identical instances there if the original region has problems.

---

## Step 9 — Clean Up Properly

1. **Terminate** all three instances.
2. **AMIs** → select yours → **Actions** → **Deregister AMI**.
3. **Snapshots** → find the snapshot created for that image → **Actions** → **Delete snapshot**.

> ⚠️ **Deregistering is not deletion.** The underlying **snapshot** survives and still costs you. You must delete it separately. (Conversely, from a snapshot you can **Create image** again if you change your mind.)
`,
    },
    {
      id: "ec2-instance-types",
      title: "EC2 – Instance Types & the Nitro System",
      shortDesc: "What each family letter means, how sizes scale, and how Nitro bypasses the hypervisor",
      visuals: ["InstanceTypeExplorer", "InstanceFamilyDecoder", "NitroVsHypervisor"],
      content: `## Why Instance Type Exists

After naming your instance and choosing an AMI, you select an **instance type**.

Think about buying a laptop. The vendor asks what it is for. Writing documents in Word, making slide decks, watching films? They point you at a ₹30,000 machine — moderate RAM, i3 processor. Say instead that you want to **play games** and they point you somewhere far more expensive.

Same idea here — except we are creating **servers**, not desktops, and different servers have different requirements:

- **Hosting an application** → the **CPU** must be strong.
- **Hosting a database server** → **storage** must be strong.
- **In-memory workload** → **RAM** must be very good.

So you choose a different type of virtual machine depending on what it will do.

---

## Reading the Name

Open **Compare instance types** and you get a list. Take **t2.xlarge**:

- **t** — the **family**, which tells you what it is optimised for.
- **2** — the **generation**. **t3 is newer than t2.**
- **xlarge** — the **size**.

The size scaling is simple and consistent. If **t2.xlarge** gives you 4 vCPU and 16 GB RAM, then **t2.2xlarge** gives you **double** — and **4xlarge** doubles it again.

> **Double the configuration means double the price.**

---

## What Each Letter Means

| Letter | Meaning | Use it when |
|---|---|---|
| **D** | **Dense storage** | Big data, massive parallel processing |
| **A** | **ARM** processor | You want ARM-based instances |
| **I** | **IOPS** | High input/output per second — very fast storage reads and writes |
| **R** | **RAM** | The application is memory-hungry |
| **T** | **Cheap general purpose** | Balanced CPU/storage/RAM, and the cheapest of them |
| **M** | **Main choice** | Also balanced general purpose, a step above T |
| **C** | **Compute** | The application needs high CPU |
| **G** | **Graphics** | You need a graphics processor |
| **F** | **FPGA** | Real-time video processing — live cricket or football streaming, OTT platforms |
| **P** | **Pics / GPU** | General-purpose GPU for machine learning |
| **U** | **Bare metal** | You want the bare-metal server, no OS layer supplied |
| **X** | **Extreme memory** | R gives RAM; X is for genuinely extreme requirements |
| **Z** | **Z factor** | Extreme memory **and** extreme CPU together |

> You are not expected to memorise which family fits which application. In practice the vendor tells you what workload is being hosted, and you choose from that.

---

## The Nitro System

All of these are **Nitro-based instances**, and it is worth understanding why that matters — it comes up again in the storage section.

**How a normal instance reaches hardware:**

1. At the bottom sits the **hardware**.
2. Above it, the **hypervisor** layer provides virtualization.
3. On top, your **EC2 instance**.

The hypervisor has **full control of the hardware** and shares it out. An instance that needs 8 GB of RAM **requests it from the hypervisor**, which grants access to the physical memory.

**How a Nitro-based instance reaches hardware:**

It is the same kind of EC2 instance, but it **accesses the hardware directly**, **bypassing the hypervisor layer**.

> Why? **Extreme performance.** When you need the highest level of performance and want to skip the hypervisor layer, you create a Nitro-based instance.
`,
    },
    {
      id: "ec2-multi-az",
      title: "EC2 – Multi-AZ Deployment Strategy",
      shortDesc: "Choosing availability zones, the critical/non-critical question, and the cost argument",
      visuals: ["MultiAZDiagram"],
      content: `## Where Does This Setting Live?

When launching an instance, scroll to **Network settings**. The first option is **VPC** — your virtual private cloud, covered fully in its own section. Click **Edit** and you reach **Subnet**, and there you find the **three availability zones**.

**If you select nothing**, AWS places your instance wherever is convenient for them — it could land in **ap-south-1a**, **1b** or **1c**.

So the real question is: what is the right **strategy** for choosing?

---

## Recap: What an AZ Is

Every region contains multiple availability zones. **ap-south-1** (Mumbai) has three: **ap-south-1a**, **ap-south-1b** and **ap-south-1c**. They are connected by high-speed fibre optic cable and sit within a **100 km radius**.

---

## The One Question That Decides It

> **Is this instance critical? Can you tolerate downtime?**

Answer that first, because everything follows from it.

**If it is NOT critical** — you can tolerate downtime — put the instance in **any single availability zone**. If that AZ goes down, your instance goes down with it, and you manually create a replacement in another AZ. That is an acceptable outcome for a non-critical workload.

**If it IS critical** — no downtime acceptable — create instances in **multiple availability zones**. One instance running in one AZ, an identical one running in another. Same web server in both. If one AZ fails, the other keeps serving and **users experience uninterrupted service**.

That is **Multi-AZ**.

---

## "Do I Have to Pay for Both?"

**Yes.** One instance in each AZ means paying for two instances, and the standby is running even while you are not actively using it.

But the comparison people forget: **the same is true on-premises**. If your on-premises server's motherboard fails, you need a second server — and you cannot tell your vendor you will not pay because it is only a standby. **You pay for standby hardware in a data centre too.** This is the same arrangement.

---

## "What If Two AZs Go Down at Once?"

AWS builds solid infrastructure to best practice. The chance of a single AZ failing is very low — on the order of **0.01%**.

And because all three AZs are in **different locations within that 100 km radius**, the chance of **two** failing simultaneously is vanishingly small.

> **AWS best practice: host your EC2 instances in more than one availability zone.** Two is enough.

If even that residual risk is unacceptable to you, deploy across **three** AZs — and pay for three. The choice is yours.

---

## A Real Example — Active Directory

This one comes up in the exam.

In a Microsoft network, **Active Directory** runs on a centralised server. If it goes down, **users cannot log in to any computer**. Microsoft's own guidance is to run **multiple domain controllers**.

Ask any system administrator whether their company has Active Directory — they will say yes. Ask how many domain controllers — **at least two**. It is standard in almost every network.

To reproduce that on AWS:

- Put one domain controller in **ap-south-1a**.
- Put the second in **ap-south-1b**.

> ⚠️ **Do not put both domain controllers in ap-south-1a.** If that zone goes down you are in exactly the trouble the second controller was meant to prevent.
`,
    },
    {
      id: "ec2-public-private-ip",
      title: "EC2 – Public vs Private IP & Bastion Hosts",
      shortDesc: "Which IP is routable, the web/database pattern, and reaching servers with no public IP",
      visuals: ["PublicVsPrivateIP", "BastionHostFlow"],
      content: `## Where the Setting Is

While launching an instance you will see **Auto-assign public IP**, enabled by default. Click **Edit** and you can disable it.

Look at an existing instance and you see **both** a **public IP address** and a **private IP address**. Two types — and the difference matters.

---

## Public IP

You cannot simply choose a public IP. **Your ISP assigns it to you.** When creating an EC2 instance, that IP comes from AWS — so for our purposes **AWS is acting as your ISP**.

Public IP addresses are **routable on the internet**. Every site you open — Google, Facebook, Gmail — has one. **Without a public IP you cannot reach a site at all.**

You need a public IP when:

- You are running a **web server** and want the site reachable worldwide.
- You are running a **live-streaming application** that everyone must access over the internet.
- You need to **manage the instance yourself** — and this one deserves explaining.

Your instance is in **Mumbai**; you are in **Gujarat**. You cannot attach a keyboard and monitor to it. So you reach it **over the internet**, which means the instance needs internet enabled **and** a public IP. Then you connect with **RDP** (Remote Desktop Protocol) for Windows, or **SSH** for Linux.

> Assigning a public IP is **optional**. In some cases it is also **chargeable**.

---

## Private IP

**Every EC2 instance always gets a private IP**, no exceptions.

Private IPs are **not routable on the internet**, and you can assign any address you like from the reserved ranges — **no permission needed from anyone**.

Won't that conflict with public addresses? No. The Internet Corporation reserved specific ranges across the three classes:

| Class | Private range |
|---|---|
| **A** | 10.0.0.0 – 10.255.255.255 |
| **B** | 172.16.0.0 – 172.31.255.255 |
| **C** | 192.168.0.0 – 192.168.255.255 |

Anything in those ranges is a private IP. Anything outside must be obtained.

---

## The Strategy — Web Server vs Database Server

Ask one question about each server: **do you want to expose this on the internet?**

**Web server / streaming server → yes.** Assign a public IP. (It has a private IP too — that is automatic.)

**Database server → no.** It is a **backend** server, running behind the scenes, holding your important data, and it must be secure. **Do not assign a public IP.** It gets a private IP only.

Now trace the connections:

- **From the internet → web server**: you use the **public IP**. There is no other option, because you are coming over the internet.
- **From the web server → database server**: both live inside the same AWS infrastructure, so you use the database's **private IP**.

---

## The Obvious Objection

*"Fine — but if the database has no public IP, how do I ever administer it from my office?"*

You cannot reach it directly. That much is true. But you **can** reach the web server, because it has a public IP. So you connect to that first, and **from there** connect onward to the database using its private IP. Connections nested inside connections.

---

## The Bastion Host

Companies formalise this. Imagine three servers — **A**, **B** and **C** — on private IPs **172.16.0.2**, **.3** and **.4**, because company policy forbids public IPs entirely.

So you create **one dedicated instance** that does have a public IP. Its job is to be the way in. That is a **bastion host**.

From your office you connect to the bastion, and from the bastion you reach A, B or C.

**Walking through it on Windows:** open **Run**, type \`mstsc\`, paste the bastion's **public IP**, connect, and authenticate (for a Windows instance, decrypt the administrator password with your key file). You are now on the bastion. Open **Run** again, type \`mstsc\` again, and this time enter the **private IP** of server A. Same authentication, and you are through.

Try connecting straight to a private IP from your office and it simply **fails** — private addresses are not routable on the internet, exactly as expected.

---

## Exam and Interview Notes

These get asked almost word for word:

- **"Do you need to assign a public IP to every EC2 instance?"** — No.
- **"Then how do you access the instances that don't have one?"** — Through a **bastion host**.

> **Best practice:** if a public IP is not required, **do not assign one**. The server is more secure without it. AWS has since introduced newer ways to reach an instance without a public IP or a bastion host, but this remains the pattern to understand first.
`,
    },
    {
      id: "ec2-elastic-ip",
      title: "EC2 – Elastic IP",
      shortDesc: "Why public IPs change on restart, how to make one static, and how to avoid charges",
      visuals: ["ElasticIPDiagram"],
      content: `## ⚠️ Read Before You Follow Along

**Elastic IP is chargeable.** Even on a free-tier account, allocating one costs money. **Do not perform these steps along with the lesson** — understand the concept, and only allocate one when you genuinely need it.

---

## What It Actually Is

An elastic IP is **exactly a public IP**. There is no new kind of address here.

The difference is **persistence**:

> A normal **public IP can change**. Stop your EC2 instance and start it again, and **you get a new public IP**.

If you need a **consistent, static** address for your instance, you allocate an **elastic IP** from AWS and attach it. Now stopping and starting the instance leaves the address **unchanged** — at the cost of paying extra for it.

---

## Why Does AWS Charge for This?

The logic is worth following, because it explains the whole design.

While your instance is **running**, you are paying AWS. **Stop** it, and you stop paying for the instance — but a reserved public IP still costs **AWS** money, because they answer to the internet authority for it.

So the default behaviour is: **when you stop your instance, AWS releases the public IP** and may assign it to another customer. That is how the address pool stays efficient.

Say you do not want that — you want to keep the address regardless. AWS's answer: **fine, keep it, and pay us for it.** Which is why an elastic IP **keeps charging you even while the instance is stopped**.

---

## Watch a Public IP Change

1. Launch an instance — Amazon Linux, **t2/t3.micro**, with **auto-assign public IP enabled**.
2. Note the public IP that appears. Copy it somewhere.
3. **Stop** the instance. Watch the public IP **disappear** from the console once it reaches the stopped state.
4. **Start** it again. A **new** public IP appears.

> You may occasionally get the same address back, but the chance is **under 1%**.

While the instance is stopped you pay nothing for it — storage aside — so AWS reclaims the address.

---

## Allocating and Attaching an Elastic IP

1. In the **EC2 dashboard**, go to **Elastic IPs**.
2. Click **Allocate Elastic IP address**, confirm the region, and click **Allocate**.
3. The address is now **in your account**.
4. Select it, open the **Actions** menu, and choose **Associate Elastic IP address**.
5. Choose **Instance**, pick your instance, and click **Associate**.

Check the instance's detail page and the **Elastic IP** field is now populated. **Stop and start the instance and the address does not change.**

---

## Releasing It — Do Not Skip This

Here is the part that quietly costs people money.

**Terminate the instance and the elastic IP stays in your account.** Once allocated, it remains yours — **and keeps billing** — whether or not it is attached to anything.

So an unattached elastic IP sitting in your account is pure waste. To get rid of it:

1. If it is still associated, select it → **Actions** → **Disassociate Elastic IP address**.
2. Then select it → **Actions** → **Release Elastic IP address**.

> Releasing immediately after terminating an instance can error briefly while the termination completes. Wait until the instance shows **terminated** and the association ID clears, then release. It may take a little time, but the address does go.

**The rule: allocate it, and you pay until you release it.**
`,
    },
    {
      id: "ec2-ports-protocols",
      title: "EC2 – Ports, Protocols & Why Filtering Matters",
      shortDesc: "TCP/UDP/ICMP carriers, the three port ranges, and the request/reply flow",
      visuals: ["PortNumberExplorer"],
      content: `## Servers Are Specialised

We create servers as EC2 instances, and enterprises run a **dedicated server for each service**: web servers, email servers, file servers, database servers, DNS servers. A single server *can* provide several services, but separating them is the normal arrangement.

Your web page comes from the **web server**. Your mail is handled by the **email server**. Files are shared by the **file server**. So the question becomes: **how does traffic find the right service?**

---

## Three Carriers

On the road of the internet there are essentially three kinds of traffic:

- **TCP**
- **UDP**
- **ICMP**

Think of these as **carriers**. Capture any packet off the wire and it will be one of the three. But each of them can carry many different services:

| Service | Protocol it carries |
|---|---|
| **Web pages** | HTTP and HTTPS |
| **Email** | SMTP (send) and POP3 (receive) |
| **File sharing** | NFS (Linux) or SMB (Windows) |
| **Database** | MySQL, Oracle |
| **DNS** | DNS |

---

## Port Numbers Identify the Service

If you capture a TCP packet, how do you know which service it carries? How does the server know what you are requesting?

**Port numbers.** Every service has one, and they are **universal** — port 80 means HTTP on every server on the internet.

There are **65,536 ports in total (0–65535)**, split into three bands:

| Range | Name | Meaning |
|---|---|---|
| **0 – 1023** | **Well-known ports** | Universal and fixed. HTTP **80**, HTTPS **443**, FTP **21**, SSH **22** |
| **1024 – 49151** | **Registered ports** | Registered by a specific company. MySQL **3306**, PostgreSQL **5432**, Microsoft RDP **3389** |
| **49152 – 65535** | **Dynamic / private ports** | Chosen **randomly by the application** |

That third band sounds confusing until you see it in action.

---

## Walking Through a Request and Its Reply

A client at **2.2.2.2** opens a web page on a server at **1.1.1.1**.

**The request packet carries:**

- destination IP **1.1.1.1** — the server
- destination port **80** — so the server knows this is an HTTP request
- source IP **2.2.2.2** — you
- source port **50000** — **randomly generated**, which is what that dynamic range is for

**The reply reverses everything:**

- destination IP **2.2.2.2**
- destination port **50000**
- source IP **1.1.1.1**
- source port **80** — because that is where the request arrived

> ICMP works the same way conceptually, with a **ping request** and a **ping reply**.

---

## Why This Becomes a Security Problem

That web server handles HTTP requests on port 80 perfectly well.

Now suppose someone sends it an **SMTP** request on port **25**. Can the server provide that? **Of course not** — it is a web server.

But look at what happens: the request **arrives at the server**, the server **processes it**, and only then does it answer "sorry, not provided."

Two consequences:

- **Many such requests overload the server.** It is spending effort saying no.
- **Attackers can abuse this**, because anyone can send a request on any port and force the server to deal with it.

> **The solution is the security group** — filtering the traffic before it ever reaches the instance.
`,
    },
    {
      id: "ec2-security-groups",
      title: "EC2 – Security Groups",
      shortDesc: "How filtering works, the default behaviours, and the no-deny-rule model",
      visuals: ["SecurityGroupSimulator", "SGAsSourcePattern"],
      content: `## Where to Create One

There are **two ways**:

1. **While launching an instance** — scroll to Security group and click **Edit**, then create one inline.
2. **In advance** — EC2 dashboard → **Security Groups** → **Create security group**, then select it when you launch.

A security group protects **incoming and outgoing traffic**, and attaching one to your instance's **network interface card is compulsory**.

---

## The Default Behaviours to Memorise

These get asked, so learn all three.

**1 · Created alongside an instance:**

| Instance type | Default inbound rule |
|---|---|
| **Windows** | **RDP port 3389** allowed from anywhere |
| **Linux** | **SSH port 22** allowed from anywhere |

**2 · Created in advance from the EC2 dashboard:**

- **Inbound: none.** No rules at all.
- **Outbound: all traffic allowed.**

**3 · The default security group** that AWS creates automatically:

- **Inbound: all traffic allowed.**
- **Outbound: all traffic allowed.**
- ⚠️ **You cannot delete it.** Try, and AWS refuses.

> Relying on the default group is risky precisely because it allows everything both ways.

---

## How Filtering Actually Works

Your web server has a security group whose inbound rules allow **TCP port 80 from anywhere**.

**A legitimate request arrives** on port 80. The group checks: is inbound 80 allowed? **Yes.** The traffic passes to the instance and is processed.

**An FTP packet arrives** on port 20. The group checks: only 80 is allowed. **Denied at the security group** — it never reaches the instance and the instance never spends effort on it.

That is exactly the overload problem from the previous topic, solved.

---

## There Is No Deny Rule

> **Security groups have no deny rules.** You allow what you want; **everything else is implicitly denied.**

Allow port 80, and every other port is in deny mode automatically. There is nothing to configure for that.

---

## Outbound Works the Same Way

When the server replies, the packet leaves with destination **2.2.2.2** port **50000**. The outbound rules say **all traffic allowed**, so it passes and the user gets the page.

---

## Three Rules About Scale

1. **A security group can hold multiple rules.** Allowing port 80 is one rule; add another for port 22, another for 53, as many as you need.
2. **One instance can have multiple security groups.**
3. **One security group can protect multiple instances.**

---

## Using a Security Group as the Source

This one is genuinely useful and easy to miss.

Say three instances all share a group called **test-SG**. Separately, an application server sits in **app-SG** running an HTTP service. The requirement: **only members of test-SG may reach that HTTP service.**

Instead of listing IP addresses, you write the rule on app-SG as:

> **Allow HTTP (port 80) — source: test-SG**

Why this beats listing IPs:

- IP addresses must be added **individually**.
- **IP addresses can change.**
- Add a **fourth** instance to test-SG and it gets access **automatically** — no rule edits at all. List IPs instead, and you must remember to add it by hand every time.

> Next: the single most-repeated phrase about security groups — **they are stateful**.
`,
    },
    {
      id: "ec2-security-groups-stateful",
      title: "EC2 – Why Security Groups Are Stateful",
      shortDesc: "The phrase explained properly, with the case that seems like it should fail",
      visuals: ["StatefulExplainer"],
      content: `## The Word You Will Keep Hearing

You will hear **"security groups are stateful"** constantly. Understand it once, properly, and it stops being confusing.

---

## A Case That Looks Like It Should Fail

Reverse the usual picture. **Your EC2 instance is the client this time**, sending an HTTP request out to some server at 2.2.2.2.

Your instance's security group has:

- **Outbound: all traffic allowed**
- **Inbound: no traffic allowed**

**The request goes out.** It is checked against the **outbound** rules, which allow everything. Fine.

**The reply comes back**, reversed as always — destination your IP, destination port 50000, source 2.2.2.2, source port 80.

That reply is **inbound traffic**. And your inbound rules allow **nothing**.

> **So does the web page load?**

---

## Yes — And Here Is Why

**Because the security group is stateful.**

In this scenario **you initiated the connection**. When your request went out, the security group did two things:

1. Checked that the traffic was allowed outbound.
2. **Recorded the state** — it noted that you sent a request to 2.2.2.2.

So when the reply arrives, the group **does not check the inbound rules at all**. It checks something else: *is this the reply to a connection we already know about?* It is. **Allowed.**

> **Traffic you initiate is allowed back in automatically.**

---

## Compare With Stateless

If it were **stateless**, no state information would be stored. The reply would be judged purely on the inbound rules — so you would have to **add an inbound rule for every reply you expect**. That is what makes stateless configuration complex.

---

## The Case That Genuinely Does Fail

Flip the direction. Someone **outside** sends an HTTP request **to** your instance, whose inbound rules allow nothing.

**No connection is established.** Nothing was initiated from your side, so there is no recorded state to match — and the inbound rules deny it.

---

## The Rule in One Sentence

| Who starts the connection? | Inbound rule needed? |
|---|---|
| **Your instance** (reply comes back) | ❌ No — statefulness covers it |
| **Someone else** (request comes in) | ✅ Yes |

> Keep this one firmly in mind. It is the most important behaviour of security groups, and the lab in the next topic proves it with ping.
`,
    },
    {
      id: "ec2-security-groups-lab",
      title: "Lab – Security Groups End to End",
      shortDesc: "Create a group with no rules, open SSH then HTTP, and prove statefulness with ping",
      visuals: ["SecurityGroupLab"],
      content: `## What This Lab Demonstrates

Everything from the previous three topics, in a single run: creating a group in advance, watching connections fail because nothing is allowed, opening exactly the ports you need, and **proving statefulness** by pinging in both directions.

Follow the interactive walkthrough below — the eight steps are summarised here.

---

## 1 · Create the Security Group in Advance

EC2 dashboard → **Security Groups** → **Create security group**. Name it **my-web-server-SG**, add a description, leave the default VPC, and create.

> Confirm the defaults as you go: **no inbound rules**, and **all traffic allowed outbound**.

---

## 2 · Look at the Default Group First

Two things are worth noticing in that list:

- The **default security group** AWS made for you allows **all inbound and all outbound** traffic.
- Security groups you created can be deleted — **the default one cannot**. Selecting it and choosing delete simply fails.

> ⚠️ Also note: **deleting an EC2 instance does not delete its security group.** Run a few labs and they pile up.

---

## 3 · Launch an Instance Using It

Launch **my-web-server** — Amazon Linux 2023, **t2.micro**, your existing key pair. Under **Network settings** choose **Select existing security group** and pick **my-web-server-SG**, the one with no inbound rules.

---

## 4 · Watch SSH Fail

Once running, copy the public IP and try to connect:

**ssh -i your-key.pem ec2-user@public-ip**

**It fails.** Check the instance's **Security** tab — the inbound rules list is empty. Port 22 is closed, so there is nothing to connect to.

---

## 5 · Allow SSH

Security group → **Edit inbound rules** → **Add rule** → type **SSH**, which fills in **TCP port 22**. For source pick **Anywhere (0.0.0.0/0)** — or **My IP**, which AWS detects automatically and restricts access to your machine alone.

**Save rules**, retry the SSH command, and you are in.

---

## 6 · Install a Web Server

Become root and install Apache:

- **sudo -i**
- **yum install httpd**
- **service httpd start**

Confirm the service reports as active.

---

## 7 · Watch HTTP Fail, Then Allow It

Paste the public IP into a browser. **The page does not load** — port 80 is still closed.

Add another inbound rule: type **HTTP**, port **80**, source **Anywhere**. Save, reload, and the Apache page appears.

> Same lesson twice over: **the service was running the entire time.** Only the security group stood between you and it. You can also restrict the source to a specific IP here.

---

## 8 · Prove That It Is Stateful

This is the part worth doing carefully.

**Ping the instance from your own machine** — it **fails**. There is no inbound ICMP rule, and you are the one initiating.

**Now SSH in and ping 8.8.8.8 from the instance** — it **works**. There is still no inbound ICMP rule. It works because **the instance initiated the connection**, so the security group recorded the state and permits the reply.

**Finally, add an inbound ICMP - IPv4 rule** from 0.0.0.0/0 and save. Ping from your machine again — **now it works**, because you have explicitly allowed the inbound direction.

> Replies to connections **you** start need no inbound rule. Connections **others** start do. That is statefulness, demonstrated in one lab.

---

## Clean Up

Terminate the instance when you are finished — and remember the security group will remain behind unless you delete it too.
`,
    },
    {
      id: "ec2-user-data",
      title: "EC2 – User Data Scripts",
      shortDesc: "Bootstrapping instances automatically, and why Auto Scaling depends on it",
      visuals: ["UserDataDemo"],
      content: `## What User Data Is

A **user data script** is a form of **automation**.

Say you want a Linux server configured as a web server. Two routes:

- **Manual** — create the instance, log in, and run the commands yourself.
- **User data** — paste those same commands into the **user data** field while creating the instance. When the instance becomes ready, **AWS executes them automatically** and your web server is already running.

The underlying idea is **shell scripting** on Linux — a long-established form of automation where you list commands and the system executes them in order. Windows has the same thing in **PowerShell scripting**.

> The point: once the instance is ready you **never log in and never run the commands manually**. They have already run.

---

## The Manual Way First

Launch an instance (**web-server-manual**, Amazon Linux, t2.micro), create or select a key pair, and **allow port 80** in the security group so the site is reachable.

Then SSH in, become root with **sudo -i**, and run four commands:

1. **Update** the Linux system.
2. **Install** httpd — the Apache web server.
3. **Start** the web service.
4. **Enable** the service at startup, so it comes back automatically after a reboot.

Then write your page content. Paste the public IP into a browser and the site loads.

That works — but you did all of it by hand.

---

## The Automated Way

Launch another instance (**web-server-auto**), same AMI, same instance type, same key pair, and **the same port 80 rule** — every web server needs it.

Now open **Advanced details** and scroll to the **User data** field. **Paste the same commands there.**

Click **Launch instance**. When the instance becomes ready, AWS runs the script for you. No SSH, no commands. Copy the new public IP — a different address from the manual instance — and the **site is already live**.

> Same result, zero manual steps.

---

## Windows Works the Same Way

For a Windows instance you use **PowerShell scripting** in the same field.

And you do not need to be a shell scripting expert to benefit. **What matters here is understanding the use case**, not writing the script from memory — modern tooling can generate the script for you if you describe the outcome you want.

---

## Why This Matters for Auto Scaling

This is the reason user data is genuinely important rather than merely convenient.

**Auto Scaling creates EC2 instances automatically** when demand requires it. Traffic spikes, your two or three instances are not enough, and AWS launches more.

But those new instances are created **without you involved**. So how does your web server configuration get onto them?

> **User data.** The script runs automatically as each new instance comes up, so a machine created by Auto Scaling arrives **already configured** — web server installed, started, and serving.

Without it, an automatically-created instance would be an empty box.

---

## Clean Up

Terminate both instances — the manual one and the automated one — when you are finished.
`,
    },
    {
      id: "ec2-termination-protection",
      title: "EC2 – Termination & Stop Protection",
      shortDesc: "An extra layer against accidental deletion, enabled at launch or afterwards",
      visuals: ["InstanceProtectionDemo"],
      content: `## The Scenario

Two application servers are running. You mean to delete one thing and **accidentally terminate an instance**.

> **Once an instance is terminated there is no way to get it back.**

Now picture that happening in your **production environment**. These mistakes do happen — which is why an extra layer of protection exists.

---

## Termination Protection

**To enable it on a running instance:**

1. Select the instance.
2. **Actions** → **Instance settings** → **Change termination protection**.
3. Tick **Enable** and save.

**Now try to terminate it.** AWS refuses, with a message along the lines of *"Failed to terminate the instance — the instance may not be terminated. Modify its 'Disable API Termination' instance attribute and try again."*

**To actually delete it later**, reverse the process: select the instance → **Actions** → **Instance settings** → **Change termination protection** → disable → save. Now termination works.

---

## Enabling It at Launch

The obvious risk with the above: you have to remember to turn it on *after* the instance is ready, and you might forget.

So you can enable it **during creation** instead. While launching, open **Advanced details** and set **Termination protection** to enable. The instance comes up already protected.

> Companies often make this a **standard operating procedure**: for important instances, termination protection is switched on as part of the launch, not afterwards.

**Two ways, then:** enable it at launch, or enable it later if you forgot.

---

## Stop Protection

There is a matching option for **stopping**. Use it when you do not want anyone stopping an instance — **particularly relevant for instance-store-backed AMIs**, where stopping has consequences for your data.

It behaves identically. Enable it, then try to stop the instance, and AWS refuses: *"the instance may not be stopped. Modify its 'Disable API Stop' instance attribute and try again."*

To stop the instance later: **Actions** → **Instance settings** → **Change stop protection** → disable.

---

## Summary

| | Blocks | Enable at launch? | Enable later? |
|---|---|---|---|
| **Termination protection** | Terminating the instance | ✅ Advanced details | ✅ Actions → Instance settings |
| **Stop protection** | Stopping the instance | ✅ Advanced details | ✅ Actions → Instance settings |

> These are small options, but they show up in interviews and exams — which is exactly why they are worth knowing as their own topic rather than buried in a longer one.
`,
    },
    {
      id: "ec2-placement-groups",
      title: "EC2 – Placement Groups",
      shortDesc: "Cluster, spread and partition — influencing where AWS physically puts your instances",
      visuals: ["PlacementGroupVisual"],
      content: `## What a Placement Group Does

> **Placement groups let you influence how your instances are placed on the underlying hardware.**

Normally you are not responsible for the underlying infrastructure. You can pick an **availability zone**, but *where inside that AZ* your instance lands is entirely AWS's decision. A placement group lets you **influence that decision** to suit your requirements.

**Where to find it:** while launching an instance, open **Advanced details** → **Placement group**. Or create one first from the EC2 dashboard under **Placement Groups**.

There are **three types**.

---

## 1 · Cluster

An availability zone is a data centre, and inside it are **racks** holding servers.

Choose **cluster** and AWS places **all your instances in the same rack**.

Because of that, a cluster placement group **exists in only one availability zone** — you cannot spread it across several.

| | Cluster |
|---|---|
| ✅ **Advantage** | **High-speed, low-latency connectivity.** All instances share common network devices, typically at 10 Gb. |
| ❌ **Disadvantage** | **No high availability.** If that rack goes down, **everything goes down** — every instance is in it. |

**Use it when** two or more servers must communicate with each other at very low latency — big-data clusters where the components talk constantly.

---

## 2 · Spread

The exact opposite. Instances are **spread across multiple racks**, and across availability zones.

| | Spread |
|---|---|
| ✅ **Advantage** | **High availability.** If any rack in any AZ fails, your other instances are in different racks entirely. |
| ❌ **Trade-off** | Some latency. Communicating between racks passes through network devices in between, so it is slower than cluster. |

**The limit you must remember:**

> **Maximum 7 instances per availability zone** in a spread placement group.

In **ap-south-1** with three AZs, that means **7 × 3 = 21 instances** maximum in one spread placement group.

Need 42? Create a **second placement group** — 21 in the first, 21 in the second. You can create as many placement groups as you need.

---

## 3 · Partition

Partition gives you **advantages of both**.

Instances are organised into **partitions**. Each partition contains racks that **share common hardware**, and different partitions **do not**.

- Instances **within the same partition** communicate at high speed, like a cluster, because they share hardware.
- If **one partition's hardware fails**, instances in the **other partitions keep running**, like spread.

**Use it when** you have mission-critical applications running across multiple instances that need **both** high-speed communication **and** resilience.

---

## Comparison

| | Cluster | Spread | Partition |
|---|---|---|---|
| **Placement** | One rack, one AZ | Across many racks and AZs | Grouped into partitions |
| **Speed** | ✅ Highest | ⚠️ Some latency | ✅ High within a partition |
| **Availability** | ❌ Rack fails, all fails | ✅ Highest | ✅ Partition fails, others survive |
| **Limit** | Single AZ only | **7 per AZ** (21 across 3 AZs) | — |

---

## Rules and Limits

- The **name must be unique** within your AWS account, within that region. Create one called abc1 and you cannot create another abc1 in the same region.
- **You cannot merge placement groups** once created.
- **An instance can belong to only one placement group.**
- **You cannot launch a dedicated host into a placement group** — dedicated hosts are covered in the next topic.

> No lab for this one. Even if you place several instances in a cluster group, you cannot visually observe them communicating faster — the concept is what matters.
`,
    },
    {
      id: "ec2-tenancy",
      title: "EC2 – Tenancy",
      shortDesc: "Shared, dedicated instance and dedicated host — who else is on your hardware",
      visuals: ["TenancyComparison"],
      content: `## What Tenancy Controls

> **Tenancy determines how the physical hardware your EC2 instance runs on is shared with other AWS accounts.**

AWS is a **public cloud**. You create an account and launch instances; so does everyone else. It is entirely possible that **your instance and a stranger's instance sit on the same physical host**.

Usually that is fine. But if your company works under **security requirements or government compliance**, you may not be permitted to use shared resources at all. Tenancy is how you isolate yourself.

**Where to find it:** while launching an instance, open **Advanced details** → **Tenancy**. Three options.

---

## 1 · Shared — the Default

Launch an instance without touching tenancy and you get **shared tenancy**.

AWS manages the physical host. Your instance sits on it — and so do instances belonging to **customer A, customer B and customer C**. Multiple AWS customers share that host.

- **Security:** lowest of the three.
- **Cost:** cheapest — **no extra charge**.
- **It is the default.**

---

## 2 · Dedicated Instance

A physical host is **assigned to you**. **AWS still manages the hardware** — that does not change.

What does change: **no other AWS customer can place instances on your host**. You are free to run several of your **own** instances on it; you simply are not sharing with strangers.

- **Security:** a great level of isolation.
- **Cost:** **extra money** to AWS.

Many companies have precisely this requirement, which is why dedicated instances exist.

---

## 3 · Dedicated Host

The highest level, and a genuine step further: **the physical host is managed by you.**

- You get **direct hardware access** to the physical host.
- You have **full control over the CPU and sockets**.
- You can **bring your own licence (BYOL)**.
- Obviously, no other customer places anything on it.

- **Security and control:** maximum.
- **Cost:** **very expensive.**

**To create one:** EC2 dashboard → **Dedicated Hosts** → **Allocate**. Choose the instance family, the configuration, and the availability zone. Once the host exists, you launch your instances onto it.

---

## Comparison

| | Shared | Dedicated Instance | Dedicated Host |
|---|---|---|---|
| **Host shared with other customers?** | ✅ Yes | ❌ No | ❌ No |
| **Who manages the hardware?** | AWS | AWS | **You** |
| **Control over CPU / sockets** | ❌ | ❌ | ✅ |
| **Bring your own licence** | ❌ | ❌ | ✅ |
| **Cost** | Default, cheapest | Extra charge | Most expensive |
| **Typical driver** | General use | Compliance isolation | Full hardware control / licensing |

> Recall from the previous topic: **a dedicated host cannot be launched into a placement group.** That limitation now makes sense — you are managing that hardware yourself.

> No lab here either; understanding the three options is what matters. Tenancy also feeds directly into the **pricing options** covered next.
`,
    },
    {
      id: "ec2-purchase-options",
      title: "EC2 – Purchase Options Compared",
      shortDesc: "On-Demand, Spot, Reserved and Savings Plans — and the flexibility each gives up",
      visuals: ["HotelAnalogy", "PurchaseOptionsMatrix"],
      content: `## Why This Topic Pays for Itself

Understand purchase options properly and you can save your company **up to 80%**.

---

## On-Demand

**Pay as you go**, with **no commitment**. AWS sets the price, billed **per second or per minute**. Run an instance for an hour and you pay for an hour; run it for two days and you pay for 48 hours. Create and terminate whenever you like.

**It is the highest price** — because you get maximum flexibility.

---

## Spot — the Bidding Model

Here **you** propose the price rather than AWS.

AWS data centres sometimes have **spare capacity**. With a spot instance you effectively tell AWS: *"I want an instance and I will pay $1 per hour. If you want to give it to me, do; otherwise I do not want it."* If capacity is available, you get it at your bid.

**The catch: if capacity runs out, AWS can terminate your instance.**

So spot is **never your primary instance**. It adds a **fleet of extra capacity** — 5 or 10 instances — alongside your main ones, and it works because of **automation**: a custom AMI or a user data script means each spot instance configures itself the moment it appears.

**Saving: around 90%** versus on-demand.

---

## Reserved Instances

Now you **commit** — **1 year or 3 years** — and receive a substantial discount for it. **Saving: around 72%.**

Three **payment options**, all available on any plan:

| Option | Meaning |
|---|---|
| **No upfront** | Commit now, pay monthly |
| **Partial upfront** | ~50% now, the rest over time |
| **All upfront** | Pay everything in advance |

> With **no upfront**, AWS decides whether to grant it based on your account history.

**Two classes:**

- **Standard** — the bigger discount, less flexibility.
- **Convertible** — you may change **instance family** and **operating system** later.

> **Only standard reserved instances can be sold** on the **Reserved Instance Marketplace** if you no longer need them. Convertible cannot. Either way, **AWS does not refund you**.

---

## The 24/7 Trap — and Scheduled Reserved Instances

> **Reserved instance pricing assumes 24/7 usage.** Power the instance off and **you still pay**.

So if you run instances only **8 hours a day**, a reserved instance is **worse value than on-demand**.

AWS's answer was the **scheduled reserved instance**: commit to a set window — say 8 hours a day — and get a discount matched to it.

> ⚠️ **Scheduled reserved instances are 1 year only.** There is no 3-year option.

---

## Savings Plans

Rather than reserving a specific instance, you commit to **spending an amount** — say **$100,000 over three years**.

Two kinds:

- **EC2 Instance Savings Plan** — the commitment applies to **EC2 only**. ~72%.
- **Compute Savings Plan** — the commitment applies to **any compute service**: **EC2, Lambda, or Fargate**. ~63%.

The compute plan also lets you **change region**, **change OS**, **change instance family** and **change tenancy** freely.

> **This is why reserved instances are dying.** The compute savings plan gives flexibility nothing else matches, which has made it the most popular option AWS offers.

---

## The Comparison That Matters

| | On-Demand | Spot | Reserved Standard | Reserved Convertible | Savings Plan (Compute) |
|---|---|---|---|---|---|
| **Pricing** | Pay as you go | Bidding | Commitment | Commitment | Commitment |
| **Commitment** | None | None | 1 or 3 yr | 1 or 3 yr | 1 or 3 yr |
| **Saving** | — | **90%** | 72% | 70% | 63% |
| **AWS can interrupt?** | ❌ | ✅ **yes** | ❌ | ❌ | ❌ |
| **Change size** | n/a | n/a | ✅ | ✅ | ✅ |
| **Change family** | n/a | n/a | ❌ | ✅ | ✅ |
| **Change compute (→ Lambda)** | n/a | n/a | ❌ | ❌ | ✅ |
| **Change OS** | n/a | n/a | ❌ | ✅ | ✅ |
| **Change region** | n/a | n/a | ❌ | ❌ | ✅ |
| **Change tenancy** | n/a | n/a | ❌ | ❌ | ✅ |

> **Rule of thumb:** predictable load for three years on the same instance type → **standard**. Anything less certain → **convertible** or a **savings plan**.
`,
    },
    {
      id: "ec2-purchase-options-console",
      title: "EC2 – Selecting Purchase Options in the Console",
      shortDesc: "Where each option actually lives: spot settings, reserved, scheduled and savings plans",
      visuals: [],
      content: `## On-Demand — the Default

Launch an instance the normal way — select AMI, instance type, and go. **Hourly pricing is driven by the instance type.** Touch nothing else and you have an on-demand instance.

---

## Spot — Advanced Details

While launching, scroll to **Advanced details** and **tick the Spot instances option**. Untick it and you are back to on-demand.

Click **Customize** and you get the spot settings:

- **Maximum price** — your bid per hour, for the instance type you selected above.
- **Request type** — **one-time** or **persistent**.
- **Expiry (one-time only)** — "give me this instance before 2 September, 5 a.m." with a date and time.
- **Interruption behaviour** — what AWS does when capacity runs out: **hibernate**, **stop**, or **terminate**.

> **Hibernate depends on the instance type and AMI** you selected. **Terminate** is what happens if the price rises above your bid.

If AWS has capacity, the instance appears in your console **automatically** — possibly hours later. Which is exactly why spot instances are paired with a **custom AMI** or a **user data script**: whenever the instance arrives, it configures itself with no one watching.

---

## Reserved Instances

Go to **Reserved Instances** in the EC2 dashboard. You choose:

- **Operating system**
- **Tenancy** — **default** means shared; **dedicated** means the hardware is not shared with other AWS customers, and **costs more**
- **Offering class** — **standard** or **convertible**
- **Term** — 1 or 3 years
- **Payment option** — no upfront, partial upfront, or all upfront

> **Reselling:** commit for three years, then change your mind after one? **AWS will not refund you** — but with a **standard** reserved instance you can **sell it to a third party on the Reserved Instance Marketplace**. **Convertible reserved instances cannot be sold.**

---

## Scheduled Reserved Instances

Same dashboard, under **Scheduled Instances** → **Purchase instance**. Specify your **date** and **daily duration** — four hours, five hours, whatever you need.

> ⚠️ **Not available in every region.** It does not appear in **Mumbai**; switch to **N. Virginia** to see it. And remember: **1-year commitment only**.

---

## Savings Plans

Go to **Savings Plans** → **Purchase Savings Plans**. You choose:

- **Plan type** — **Compute** (covers EC2, **Fargate** and **Lambda**, and lets you change region — around **63%** discount) or **EC2 Instance** (EC2 only, more discount, less freedom).
- **Term** — 1 or 3 years.
- **Hourly commitment** — the amount you commit to spend per hour.
- **Payment option** — all upfront, partial upfront, or no upfront.

> **How to set the hourly commitment:** take your total — say **$100,000** — and divide it across the term to get an hourly figure.

**Nothing is provisioned when you buy.** No instance appears. Later, when you create compute resources, **the cost is deducted from your committed spend**.
`,
    },
    {
      id: "ec2-pricing-calculator",
      title: "EC2 – AWS Pricing Calculator",
      shortDesc: "Estimating cost per region, instance type and purchase option before you build",
      visuals: [],
      content: `## What It Is For

You now know the purchase options and how to select them. The remaining question is **how much will this actually cost?**

The **AWS Pricing Calculator** produces an **estimate for AWS services** before you build anything.

> A common real use: you run virtual machines **on-premises** and want to know what the same machines would cost in AWS. The calculator answers that in advance.

---

## Using It

1. Open the AWS Pricing Calculator and click **Create estimate**.
2. **Select your region.**
3. Search for and select **EC2**, then click **Configure**.
4. Set **tenancy** — for example, shared instances.
5. Choose the **operating system** — Linux or Windows.
6. Set the **number of instances**.
7. Choose the **instance type** — for example **t3.medium**.

> ⚠️ **Pricing differs by region.** A t2.micro in India does **not** cost the same as a t2.micro in the USA. Always set the region first.

---

## What You Get Back

For your chosen configuration the calculator returns the cost under **every purchase option**:

- **On-Demand**
- **Spot** (which you bid for)
- **Compute Savings Plan** — 1 year and 3 year
- **EC2 Instance Savings Plan** — 1 year and 3 year
- **Standard Reserved** and **Convertible Reserved**

…across the **all upfront / partial / no upfront** payment choices.

You can **save the estimate** and return to it at any time.

> It is **not limited to EC2** — the calculator covers **every AWS service**. Whenever you need to know what a purchase option will really cost, this is the tool.
`,
    },
    {
      id: "ec2-cli-lab",
      title: "Lab – Managing EC2 from the AWS CLI",
      shortDesc: "Install, configure access keys, and build a security group, key pair and instance from the command line",
      visuals: ["AWSCLILab"],
      content: `## Why Bother With the CLI

The console is a GUI and it is the **easiest** way to manage AWS. But the CLI wins when you need to **create many instances at once** or **repeat a task**, and **some things can only be done from the command line**.

It is more complex and you must remember commands — but **knowledge of the CLI is a must**.

> **Do not try to memorise the commands.** They are long. Copy and paste while you are new; fluency comes from practice. What matters is understanding **how the CLI works**.

---

## Step 1 — Install

Search for **download AWS CLI for Windows** and open the first result. Choose the **64-bit** installer (32-bit is also offered) — about **26 MB**. Run it and click through; nothing needs changing.

> If it is already installed, the wizard offers **Repair** instead.

---

## Step 2 — Access Keys

> ⚠️ **You cannot sign in to the CLI with your console email and password.** You need an **access key** and a **secret key**.

Click your **account name** → **Security credentials** → **Access keys** → **Create New Access Key** → **Download Key File**.

> ⚠️ These are **as powerful as your root username and password**. Never share them. You may hold a **maximum of two** at once — with two active you cannot create a third.

---

## Step 3 — Configure

Run **aws configure** and supply:

1. **Access key ID** — from the downloaded file
2. **Secret access key**
3. **Default region** — e.g. **ap-south-1**
4. **Output format** — press Enter for **json**

You are now authenticated.

---

## Step 4 — Create a Security Group

To launch an instance you need a **security group**, its **rules**, and a **key pair**. Build all three from the CLI.

**aws ec2 create-security-group --group-name aws-cli-training --description "test from CLI"**

The JSON response contains a **GroupId**. **Copy it into a notepad** — you will need it repeatedly.

Verify in the console under **EC2 → Security Groups**: the group shows **0 permission entries**, meaning **no inbound rules and all outbound allowed** — exactly the documented default for a new group.

---

## Step 5 — Add an Inbound Rule

**aws ec2 authorize-security-group-ingress --group-name aws-cli-training --protocol tcp --port 3389 --cidr 0.0.0.0/0**

That allows **RDP from anywhere**. Refresh the console and the rule appears.

> **Verify each step in the console while you are new.** It stops a small mistake compounding into a confusing failure several commands later.

---

## Step 6 — Create a Key Pair

**aws ec2 create-key-pair --key-name cli-key-pair --query "KeyMaterial" --output text > cli-key-pair.pem**

This writes the key file into your current directory. Check with **dir** before and after.

> ⚠️ If a file of that name already exists, the command **errors**. Delete the old one first.

---

## Step 7 — Gather the IDs You Need

**AMI ID** — AWS changes these regularly, so fetch a current one. Go to **EC2 → Launch instance** and read the **AMI ID** of the free-tier image you want.

**Subnet ID** — **Services → VPC → Subnets**, and copy the ID for **ap-south-1a**.

> You *can* retrieve both from the CLI, but it is a fiddlier process — the console is quicker. **Subnet IDs are unique to your account**, so yours will differ from anyone else's.

Note both alongside your security group ID.

---

## Step 8 — Launch the Instance

**aws ec2 run-instances --image-id AMI-ID --count 1 --instance-type t2.micro --key-name cli-key-pair --security-group-ids SG-ID --subnet-id SUBNET-ID**

> ⚠️ **Paste the whole command as a single line.** Paste only half of it and the partial command still executes — **launching an instance with the default security group instead of yours**. A stray space produces an *"unknown option"* error. Small mistakes here cost real time.

A JSON response confirms the instance. Check the console: correct **AZ**, correct **security group**, correct **key pair**.

---

## Step 9 — Start, Stop and Terminate

- **Stop:** aws ec2 stop-instances --instance-ids INSTANCE-ID
- **Start:** aws ec2 start-instances --instance-ids INSTANCE-ID
- **Terminate:** aws ec2 terminate-instances --instance-ids INSTANCE-ID

Watch each state change appear in the console. Type **exit** to leave.

> The instance you create from the CLI is **identical** to one created in the console — same key pair login, same everything. Only the interface differs.
`,
    },
    {
      id: "lambda",
      title: "Lambda – Fundamentals (Part 1)",
      shortDesc: "Serverless compute — run code without managing servers",
      visuals: ["ServerlessFlow3D", "ServerlessSpectrum", "ServerlessTradeoffs", "LambdaVsEC2", "FunctionAnatomy", "AuthoringOptions", "ExecutionRole", "EC2Automation", "LambdaTriggers"],
      content: `## AWS Lambda – Fundamentals (Part 1)

**AWS Lambda** lets you **run code without provisioning servers** — "serverless". With EC2 you'd create a VM, install an OS + runtime, then run code. With Lambda you just upload code as a **function** and AWS runs it. It's **event-driven**: an AWS service **triggers** the function, and you pay only when it runs (**pay-as-you-go** — no triggers, no cost).

> Example: a user uploads an image to **S3** → the upload event triggers a Lambda → the function adds a watermark automatically. Idle days cost nothing.

Lambda supports many languages via **runtimes**: Python, Node.js, Java, .NET, Ruby, Go.

---

## What is Serverless?

Cloud services sit on a spectrum:
- **IaaS (EC2)** — you manage OS, scaling, HA, capacity. Most control, most work.
- **Managed (RDS)** — AWS manages OS + engine; you still size capacity & configure HA.
- **Serverless (Lambda)** — you bring **only code**; AWS handles provisioning, scaling, HA, and maintenance.

**Benefits:** no server management, automatic scaling, cost efficiency, built-in high availability, faster deployment.

**Trade-offs (know for the exam):**
- **Cold starts** — an idle function must provision resources first → slower first run.
- **15-minute max execution** — code running longer **cannot** use Lambda (use EC2). *Common exam trap.*
- **Vendor lock-in** — Lambda-specific code needs changes to move clouds.
- **Less infrastructure control** — you only supply code + pick a runtime.

---

## Lambda vs EC2

Both are **compute** services. Deciders:

| Aspect | EC2 | Lambda |
|---|---|---|
| Model | Provisioned VM | Event-driven function |
| Use case | Long-running, 24×7 | Short tasks, automation |
| Pricing | Per instance (pay even if idle) | Per execution + memory (pay only when run) |
| Scaling | Manual (ASG) | Automatic, instant |
| Startup | Minutes | Milliseconds (cold start if idle) |
| Execution time | Unlimited | **Max 15 min** |
| Customizability | Full OS control | Predefined runtimes |

> 💡 A function that runs 10× today costs 10 runs; 0× tomorrow costs ₹0. An EC2 instance costs the same regardless. **>15-min job → EC2. Bursty/event-driven → Lambda.**

---

## Your First Function

\`\`\`python
def lambda_handler(event, context):
  return "Hello World"
\`\`\`

- **lambda_handler(event, context)** — the entry point Lambda calls on each trigger. \`event\` = trigger input; \`context\` = runtime info.
- **return** — sends a value back as the **response**.
- **print** — writes to **CloudWatch Logs** (not returned to caller).

Workflow: write → **Deploy** → create a **Test event** (JSON passed in as \`event\`) → **Test**.

---

## Ways to Create a Function

- **Author from scratch** — write your own code (pick runtime + architecture).
- **Blueprint** — ready-made sample functions for common cases (e.g. DynamoDB read/write); tweak instead of writing from scratch.
- **Container image** — package as a Docker image (own base OS + runtime), push to **ECR**, run as Lambda.

**Unsupported language?** Two container options:
- **Container Image** — any base OS, runtime bundled in; for ML (TensorFlow), big custom apps.
- **OS-only Runtime** — fixed Amazon Linux base, you install the runtime; e.g. run an unlisted Node.js version.

---

## Execution Role

AWS services are **isolated** — Lambda needs an **IAM execution role** (an identity it assumes) to touch other services.
- Even "Hello World" needs the **basic execution role** (\`AWSLambdaBasicExecutionRole\`) to write to **CloudWatch Logs**.
- To read S3, add S3 permissions; to start EC2, add EC2 permissions; etc.

---

## EC2 Automation with Boto3

**Boto3** is AWS's Python SDK to manage resources from Lambda.

\`\`\`python
import boto3
ec2 = boto3.client('ec2', region_name='ap-south-1')
def lambda_handler(event, context):
  ec2.start_instances(InstanceIds=['i-0abc123'])
  return "Started"
\`\`\`

Prerequisites: an EC2 instance + an IAM role (EC2 access + basic execution). Increase the default **3-second timeout** (e.g. to 10 s) so the instance has time to start.

---

## Triggers

A function does nothing until a **trigger** invokes it (added manually):
- **API Gateway** — exposes an HTTP URL; hitting it (e.g. a webpage button) runs the function.
- **EventBridge** — schedule (cron) or event patterns; e.g. start EC2 at 9 AM, stop at 6 PM.
- **S3** — object events (upload/delete).
- Plus **Alexa, ALB, CodeCommit, DynamoDB Streams, SNS, SQS**, and more.`,
    },
    {
      id: "lambda-2",
      title: "Lambda – Advanced (Part 2)",
      shortDesc: "Execution env, versions, concurrency, layers, VPC",
      visuals: ["ExecutionEnvironment3D", "VersionsAliases", "Concurrency", "ReservedConcurrency", "ProvisionedConcurrency", "LambdaLayers", "LambdaVPC"],
      content: `## Lambda – Advanced (Part 2)

How Lambda actually runs in the background, plus versioning, concurrency, layers and networking.

---

## Execution Environment (Cold vs Warm Start)

Lambda runs code inside **containers** (lightweight VMs). Netflix serves millions of recommendations this way.

- **Cold start** — first request (or a scale-up): Lambda builds a new container → allocates CPU/memory/network → initializes the runtime → loads code + dependencies. Adds **~100–300 ms** of latency.
- **Warm start** — reusing a still-live environment → no setup delay, responds in milliseconds.
- **Scaling** — if all environments are busy, Lambda launches more (1,000 users → 1,000 environments), automatically; idle ones are removed.

**Reduce cold starts** with: **provisioned concurrency**, more **memory/CPU**, or **Lambda layers** (preloaded deps).

---

## Versions & Aliases

- **Publish a version** → an immutable, read-only snapshot (v1, v2, …) for rollback. **$LATEST** stays editable.
- **Alias** → a named pointer (e.g. \`prod\`) to a version. Point your API Gateway URL at the **alias**, so you switch versions **without changing the URL**.
- **Weighted aliases** → split traffic between two versions (e.g. 50/50) for **canary / blue-green** deployments.

---

## Concurrency

**Concurrency** = requests running at the same time. Default limit: **1,000 per region per account**, shared by all functions.

> Formula: **concurrency = requests/sec × duration(sec)**. e.g. 50 req/s × 2 s = 100. Exceed 1,000 → throttling (**"429 TooManyRequests"**).

Handle high demand: request a **higher limit** (support), use **multiple accounts/regions**, or manage concurrency.

---

## Reserved Concurrency

**Guarantees** (and caps) a slice of the limit for a critical function — no extra charge. e.g. reserve **300** of 400 for the **Place-Order** function so Email/Report functions can't starve checkout. The **unreserved** pool can't drop below **100**.

---

## Provisioned Concurrency

Two concurrency types:
- **On-Demand** (default) — environments created when requests arrive → cold-start delay.
- **Provisioned** — N environments **pre-warmed** and kept ready → **zero cold start** for critical apps.

> 📌 Requires a **version or alias** (not $LATEST). Counts against the **1,000** quota. You **pay** per provisioned instance per minute (used or not). Monitor **Throttles** & **ProvisionedConcurrencyUtilization** in CloudWatch.

---

## Lambda Layers

A **library** is reusable code you \`import\`. Some are built into Lambda (\`boto3\`, \`random\`); others aren't (\`emoji\`, \`pandas\`, \`requests\`) → \`ModuleNotFoundError\`. Three ways to provide a non-built-in library:

1. **Built-in** — just import & deploy.
2. **Package with each function** (not recommended) — zip code + library per function; updating the library means re-packaging every function.
3. **Lambda Layer** (smart) — zip the **library only**, upload once as a layer, attach to many functions. Update once → all functions get it. Benefits: **reusability, clean separation, easy maintenance, faster deploys**.

> 🧪 Lab: CloudShell → \`mkdir python && pip install emoji -t .\` → zip the \`python/\` folder → create a **Layer** from the zip → attach to the function → re-test.

---

## VPC Connectivity

By default Lambda runs **outside your VPC** with full internet — reaches public services (S3, DynamoDB) but **not** private resources (RDS, EC2, ElastiCache in private subnets).

- **Connect to a VPC** → AWS creates an **ENI** (Elastic Network Interface) in your private subnet with a private IP. Lambda now reaches private resources — but **loses default internet**.
- Need outbound internet again → add a **NAT Gateway**. Need only private AWS-service access (S3/DynamoDB) without internet → use a **VPC Endpoint**.
- A VPC-attached Lambda needs a **Security Group** on its ENI: **outbound** to reach a DB, **inbound** if EC2 calls the Lambda. *(Exam favorite.)*`,
    },
    {
      id: "ecs-prereq",
      title: "ECS – Prerequisites (Containers & Docker)",
      shortDesc: "VMs vs containers, Docker, orchestration — the foundation for ECS",
      visuals: ["LeoStory", "OSArchitecture", "VMvsContainer3D", "VMLimitations", "DockerLifecycle", "Orchestration", "OrchestratorCompare"],
      content: `## ECS Prerequisites — Containers & Docker

Before ECS (a **container orchestration** service), you must understand containers. We learn through a story: **Leo** (the builder — asks the questions) and **Ray** (the architect — teaches best practices).

---

## The Story (the problem)

Leo hosts his **LMS**, **Support**, and a new **Enrollment** app on **one EC2 instance** to save money. A marketing spike makes the Enrollment app devour all CPU/memory — there's no resource boundary — and the whole instance crashes, taking **all three apps** down. Ray's lesson: **isolate** workloads so one can't kill the others.

> The journey: **physical machines → virtual machines → containers → ECS.**

---

## How an OS Works (foundation)

Every OS has two key parts:
- **Kernel** — the core; the only part that talks **directly to hardware** (CPU, RAM, disk, network).
- **Application Layer** — libraries/APIs apps use to make **system calls**, forwarded to the kernel.

Flow: **Application → Application Layer → Kernel → Hardware**.

---

## Physical → Virtual Machines

A **hypervisor** (VMware ESXi, Hyper-V, AWS Nitro/Xen) installed on physical hardware lets you run **multiple VMs**, each with its **own full OS** (kernel + app layer) and capped resources → **isolation** without buying multiple servers. This **hardware virtualization** birthed the cloud (EC2 is a VM).

---

## VM Limitations → Containers

VMs carry a **full OS** each, causing:
- **Heavy resource use** (OS overhead), **slow boot** (1–2 min), **bulky images** (GBs), **complex management** (patching), **limited density**.

**Containers** (2013) fix this: ship only the **application layer** and **share the host kernel**.

| | Virtual Machine | Container |
|---|---|---|
| Virtualizes | Hardware (full OS each) | OS (shares host kernel) |
| Weight | Heavy | Lightweight |
| Boot | 1–2 minutes | ~1 second |
| Image size | GBs | MBs |
| Isolation | Full | App-layer + resource limits |

---

## Docker

A machine with the **Docker daemon** installed is a **Docker host** (no hypervisor needed). Lifecycle:
1. \`yum install docker\` → host ready
2. \`docker pull ubuntu\` → image from **Docker Hub** (Ubuntu image ~80 MB vs 5.9 GB ISO — no kernel inside)
3. \`docker run -it ubuntu\` → container starts in **~1 second**
4. \`docker build -t myapp .\` → bake your app into a custom image via a **Dockerfile** (e.g. \`FROM nginx\` + \`COPY index.html\`)
5. \`docker run -d -p 80:80 myapp\` → publish a port so it's reachable from outside

> Images push to a registry — **Docker Hub** or AWS's **ECR** — so any host can pull & run them.

---

## Container Orchestration

One Docker host = a **single point of failure**. Use **multiple hosts** — but they don't coordinate by default ("players with no captain"). You need a **container orchestrator** (the captain): it creates a cluster, places containers intelligently, restarts failed ones, and **auto-scales**.

**Three orchestrators:**
- **Docker Swarm** — native, easy, but no auto-scaling/rollback; for small teams/learning.
- **Amazon ECS** — fully managed by AWS, deep integration (ALB, IAM), no control-plane management; **AWS-only**.
- **Kubernetes** — runs anywhere, most powerful (auto-scaling, rollback), open-source; but **complex** to set up.

> Leo picks **ECS** — he's already on AWS (great integration) and his small 3-app startup doesn't need Kubernetes' complexity. *(EKS = AWS-managed Kubernetes — covered after ECS.)*`,
    },
    {
      id: "ecs",
      title: "ECS – Elastic Container Service",
      shortDesc: "Run Docker containers at scale on AWS",
      visuals: ["MonolithVsMicroservices", "ECSBasics", "ECSCluster", "EC2vsFargate", "ClusterInfraSetup", "ECSAnywhere", "ECSStorage", "TaskVsService"],
      content: `## ECS – Elastic Container Service

### Application Architectures (background)

- **Monolithic (tightly coupled)** — one codebase, one deployment, one database. Hard to scale parts independently; one bug can crash everything; single tech stack; hosted on **VMs**. *(Outdated.)*
- **Microservices (loosely coupled)** — independent services, each with its own code, deployment, and database. Used by Netflix, Amazon, Uber.

> **Killer feature — independent scaling:** during a sale, scale **Home** for 100,000 visitors, **Cart** for the ~10% who add items, **Payment** for the ~4% who buy. Each service scales to its own demand. Microservices are hosted in **containers** → ECS / EKS / Kubernetes.

---

## What is ECS?

**Amazon ECS** is a **fully managed container orchestration** service to deploy, manage & scale Docker containers on AWS. Six reasons to choose it over self-managed Kubernetes: **fully managed**, **deep AWS integration** (ALB, IAM, CloudWatch, ECR, CodePipeline), **intelligent scheduling**, **cost efficient**, **secure**, **scalable**.

Use cases: microservices, batch processing, CI/CD, monolith → container migration.

---

## ECS Cluster

A **cluster** = a group of Docker hosts acting as one unified environment. ECS schedules containers across them and **pools their resources** (e.g. 3 × 4 vCPU = 12 vCPU). It's the **first thing you create**. Members of a cluster work as a team — coordinated scheduling, failover, and resource pooling.

---

## Launch Types: EC2 vs Fargate

| Aspect | EC2 (self-managed) | Fargate (serverless) |
|---|---|---|
| Provisioning | You launch & manage instances | AWS provisions automatically |
| Control | Full (OS, type, AMI, storage) | None |
| Billing | Per EC2 uptime | Per vCPU + memory/sec per task |
| Scaling | Scale EC2 first, then tasks | Scale tasks directly |
| Maintenance | You patch | Fully managed |
| Isolation | Tasks share an instance | Each task isolated (own ENI) |
| Best for | OS access, GPU, long-running | Serverless microservices, batch, fast scale |

> VPC/subnet/SG is chosen at **cluster creation** for EC2, but at **task/service creation** for Fargate.

---

## Cluster Setup (Fargate, Spot & EC2)

- From the **console**, every cluster auto-includes **Fargate + Fargate Spot** (even if deselected — no charge until you run tasks). **Fargate Spot** = ~70% cheaper spare capacity, can be interrupted → batch/dev/fault-tolerant work.
- **Add EC2 three ways:**
1. **During creation** (recommended if planned) — AWS auto-builds an ASG + launch template with **ECS-optimized AMIs**.
2. **Manually after** — launch an ECS-optimized AMI, attach **ecsInstanceRole**, set \`ECS_CLUSTER=name\` in \`/etc/ecs/ecs.config\`, restart the agent. *(Single point of failure.)*
3. **Own ASG + Capacity Provider** — launch template (ECS-optimized AMI + role + user-data) → create ASG → **register it as a Capacity Provider** so **ECS manages scaling/draining/placement**.

> **ECS-optimized AMI** = ECS agent + container runtime pre-installed. **ecsInstanceRole** lets an instance register with ECS.

---

## ECS Anywhere

Run ECS tasks on **external machines** (on-prem or other clouds), managed from ECS. Setup (after cluster creation): **outbound internet** → install **container runtime** → install **SSM agent** (hybrid activation + IAM role) → install **ECS agent** → the machine joins the cluster like a normal instance.

---

## Storage & Encryption

Cluster-level **KMS encryption** must be enabled **at creation** (can't add later).
- **Fargate Ephemeral Storage** — temporary disk, exists only while the task runs; default **20 GB** (up to 200 GB); vanishes when the task stops. For temp files, cache, short-lived logs.
- **Managed Storage (EFS / EBS)** — **persistent**, supported by **both** Fargate & EC2. EFS encrypted by default. For databases, uploads, config.

---

## Task vs Service

A **task** = a running unit of one or more containers, with its own **ENI, IAM role & security group** (things a bare Docker container can't have — enabling S3 access, fixed IP, etc.).

| Aspect | Task | Service |
|---|---|---|
| Restart | Runs once, no auto-restart | Auto-restarts failed tasks |
| Use case | One-time / temporary | Long-running production |
| Auto-scaling | ❌ | ✅ |
| Load balancer | ❌ | ✅ |
| Example | Testing, batch/report | Web server, API 24×7 |

> Both need a **task definition** (blueprint: image(s), CPU/memory, ports, IAM role, networking). Flow: **Cluster + Docker image → Task Definition → Task / Service**.`,
    },
    {
      id: "eks",
      title: "EKS – Elastic Kubernetes Service",
      shortDesc: "Managed Kubernetes on AWS",
      visuals: ["WhyEKS", "K8sArchitecture", "K8sClusterServices", "EKSClusterModes", "NodeGroups", "EKSRoles", "ManageCluster"],
      content: `## EKS – Elastic Kubernetes Service

### Why EKS?

Container orchestrators manage containers in bulk. Options: **Docker Swarm** (simple, unpopular), **Apache Mesos** (outdated), **ECS** (excellent but AWS-native only), **Kubernetes** (the #1 open-source standard — runs anywhere, but complex to self-manage).

**EKS = Kubernetes as a managed AWS service** — you get all of Kubernetes; AWS handles the hard setup, patching & control plane.

> 🔑 Main reason to choose EKS: **hybrid cloud**. Run Kubernetes on-prem AND in AWS with the **same** tooling/skills, instead of juggling Kubernetes on-prem and ECS in the cloud.

---

## Kubernetes Architecture (On-Prem vs EKS)

- **Control Plane** (the brain) — API Server, Scheduler, Controller Manager, etcd. *On-prem:* you install/run/patch it all. *EKS:* AWS runs it — multi-AZ, secure, auto-scaled.
- **Worker Nodes** (run your containers) — kubelet, kube-proxy, runtime. *On-prem:* you manage servers. *EKS:* EC2 node groups or serverless Fargate; scaling via AWS Auto Scaling.
- **Pods & Containers** (smallest unit, like an ECS task) — created with kubectl, run on worker nodes. *EKS:* you focus on pods; AWS handles infra.

**Cluster services** also integrate natively in EKS: **VPC CNI** (each pod gets a VPC IP + SG/NACL), **LoadBalancer** service auto-creates an ALB/NLB, **IAM/IRSA + KMS** for security, **CloudWatch/Container Insights/X-ray** for monitoring.

---

## Cluster Creation Modes

**EKS Auto Mode** lets AWS manage worker nodes, networking, scaling & patching (not just the control plane).
- **Quick + Auto Mode** — fastest; Auto Mode always on (can't disable); accept all AWS defaults. You give only name, VPC, IAM role.
- **Custom + Auto Mode** — automation **and** control: customize upgrade policy, **compute class** (general/system), cluster access, customer KMS key, ARC zonal shift, deletion protection, endpoint access, monitoring, add-ons.
- **Classic Mode (Auto off)** — AWS manages only the control plane; **you manage worker nodes via node groups**. Max control; required for Fargate & full manual setups.

---

## Node Groups & Nodes (Classic Mode)

A **node group** = a set of worker nodes sharing config (each runs the kubelet). Node types: **EC2** (full control — GPU/memory/storage) or **Fargate** (serverless, **classic-mode only**).

| Aspect | Managed Node Group | Self-Managed |
|---|---|---|
| EC2 management | AWS | You |
| Updates & scaling | Automatic | Manual |
| Node registration | Automatic | Manual (script) |
| Control | Less | Full |

> ⚠️ **Managed node group ≠ Auto Mode.** Managed node groups (classic mode) still let you pick type/size/scaling. In **Auto Mode** node groups are invisible — AWS manages everything via a built-in node pool.

---

## EKS IAM Roles

Create **before** cluster creation (or it fails):
- **Cluster role** — lets the EKS control plane manage AWS resources (EC2, networking, load balancers) on your behalf. Required in all modes.
- **Node role (EC2) / Fargate Pod Execution role** — lets nodes/pods register with the control plane, pull images from **ECR**, send logs to CloudWatch, access S3/DynamoDB.

> ✅ Use the console's **"Create recommended role"** — it auto-attaches the minimum required policies.

---

## Managing the Cluster

- **AWS Console** — cluster settings only (status, IAM access, add-ons, node groups, networking, monitoring). It **can't** create pods/deployments, apply YAML, exec, view logs, or scale apps — it doesn't talk to the Kubernetes API server.
- **kubectl** — the real Kubernetes control tool; talks directly to the API server. Install on your **local PC** (needs public/public+private endpoint) or on an **EC2 in the same VPC** (reaches private endpoints).

**kubectl on EC2 (lab):** launch EC2 in the same VPC → \`aws configure\` → install kubectl (curl binary, chmod, move to /usr/local/bin) → \`aws eks update-kubeconfig --name <cluster> --region <region>\` → verify with \`kubectl cluster-info\`, \`get ns\`, \`get pods\`. *(\`get nodes\` is empty in Auto Mode — normal.)*`,
    },
    {
      id: "elastic-beanstalk",
      title: "Elastic Beanstalk",
      shortDesc: "PaaS — deploy apps without managing infrastructure",
      content: `## Elastic Beanstalk

**Elastic Beanstalk** is a **PaaS** that deploys & manages your web app without you managing the infrastructure. You upload code (or a Docker image); Beanstalk provisions the **EC2, Auto Scaling, Load Balancer, security groups & health monitoring** for you.

- Supports **Java, .NET, Node.js, Python, PHP, Ruby, Go, Docker**.
- You keep **full control** of the underlying resources (unlike fully serverless).
- **Free** — you only pay for the resources it creates.
- Deployment options: **All-at-once, Rolling, Rolling with additional batch, Immutable, Blue/Green**.

> Exam: "deploy a web app quickly **without managing infrastructure**, but keep control of the EC2 layer" → **Elastic Beanstalk**.`,
    },
    {
      id: "lightsail",
      title: "Lightsail",
      shortDesc: "Simple virtual private servers",
      content: `## Lightsail

**Amazon Lightsail** is the **simplest** way to launch a virtual server, with **predictable flat monthly pricing**. It bundles compute, storage, networking, a static IP, DNS and snapshots into easy plans.

- Pre-built blueprints: **WordPress, LAMP, Node.js, plain Linux/Windows**, databases, containers.
- Great for **small websites, blogs, dev/test, simple apps** and people new to AWS.
- Limited integration with the broader AWS ecosystem (by design — simplicity over flexibility).

> Exam: "**simple, low-cost, fixed-price** server for a small project / beginner" → **Lightsail**. Need full control/scale → EC2.`,
    },
    {
      id: "batch",
      title: "AWS Batch",
      shortDesc: "Fully managed batch computing workloads",
      content: `## AWS Batch

**AWS Batch** runs **batch computing jobs** at any scale — it dynamically provisions the right amount/type of compute (EC2 or Fargate, including **Spot**) based on the jobs in the queue.

- You define **job definitions**, submit jobs to **job queues**, and Batch schedules them onto **compute environments**.
- No cluster to manage; scales to thousands of jobs.
- Ideal for **scientific simulation, media/image processing, ETL, financial modelling** — long-running, parallel workloads.

> Batch (managed job scheduler) vs Lambda (15-min limit, event-driven). Heavy/long batch jobs → **AWS Batch**.`,
    },
    {
      id: "asg-scaling-fundamentals",
      title: "Auto Scaling – Vertical vs Horizontal Scaling",
      shortDesc: "Bigger server vs more servers, and why AWS Auto Scaling only ever does the second one",
      visuals: ["ScalingTypes"],
      content: `## What Scaling Solves

**Scaling** means adjusting compute capacity to match changing demand. Picture an e-commerce sale — Amazon's Great Indian Sale, Flipkart's Big Billion Days: normal traffic is 10,000 users/minute, then a sale pushes it to 50,000 within a minute. Capacity has to grow to match, and shrink back once the sale ends — otherwise users get a slow, broken experience, or you're paying for capacity nobody is using.

---

## Vertical Scaling — Bigger Server

Add more resources — CPU, RAM, storage, networking — to the **same** machine.

**Worked example:** a server with 2 GB RAM handles 10 concurrent users. Traffic jumps to 100 users → bump RAM to 4 GB. Traffic jumps again to 500 → bump to 16 GB. Each increase is called **scale up**. When the sale ends and 16 GB sits mostly idle, dropping back down to 4 GB (or lower) is **scale down**.

> ⚠️ **AWS Auto Scaling does NOT support vertical scaling.** There's a hard ceiling — at some point no bigger instance size exists, and you hit a bottleneck no amount of budget can fix.

---

## Horizontal Scaling — More Servers

Instead of growing one server, add **more identical servers** running the same application. One server (10 users) becomes two, then three as demand grows — this growth is called **scale out**. Shrinking back down — three servers to two, two to one — is **scale in**.

> **This is exactly what AWS Auto Scaling automates.** Companies like Amazon, Flipkart, Swiggy, and Zomato — anyone serving millions of users — rely on horizontal scaling because it has no hard ceiling: keep adding servers as long as demand keeps growing.

---

## Side by Side

| | Vertical Scaling | Horizontal Scaling |
|---|---|---|
| What changes | One server gets **bigger** | **More** identical servers |
| Terms | **scale up** / **scale down** | **scale out** / **scale in** |
| Ceiling | Hits a hardware limit | Effectively unlimited |
| AWS Auto Scaling | ❌ Not supported | ✅ **This is the entire service** |

---

## The Promise of Auto Scaling

> If you could just describe *how many* servers you want at any given time, and let AWS handle creating and destroying instances automatically to match — that's Auto Scaling. It fully automates the scale-out/scale-in decision so nobody has to watch a dashboard and click buttons at 2am during a flash sale.

The next topic builds the two pieces every Auto Scaling setup needs: a **Launch Template** and an **Auto Scaling Group**.
`,
    },
    {
      id: "asg-launch-template-lab",
      title: "Lab – Launch Templates for Auto Scaling",
      shortDesc: "The reusable instance blueprint that tells an Auto Scaling Group exactly what to build",
      visuals: ["ASGLaunchTemplate"],
      content: `## The Problem a Launch Template Solves

Say a web app runs on one EC2 instance during weekdays, but weekends bring a traffic surge requiring three. Auto Scaling can create those extra instances — but it needs to know **what kind** of instance to create: which AMI, which instance type, which key pair, which security group, and how to configure it once it boots.

> **A Launch Template is a saved, reusable configuration for everything an EC2 instance needs at launch.** Create it once; every instance Auto Scaling spins up afterward is built from it — identical, consistent, no manual re-configuration each time.

A Launch Template isn't exclusive to Auto Scaling — it can be used for any regular EC2 launch too, but its main purpose here is giving an Auto Scaling Group a blueprint to work from.

---

## Building One

**EC2 → Launch Templates → Create launch template.**

- **Name:** e.g. **LT4ASG** (spaces aren't allowed) — **version 1**
- **AMI:** Amazon Linux 2023 (or your preferred OS)
- **Instance type:** **t2.micro** (free tier)
- **Key pair:** select an existing one, so you can log in later if needed
- **Subnet:** ⚠️ leave this **unselected** — the Auto Scaling Group decides subnets/AZs when it's created, not the template
- **Security group:** create new, e.g. **web-SG**, allowing the traffic your app needs (e.g. all traffic while learning, or scoped to HTTP/SSH in production)
- **EBS volume:** default is fine unless your app needs more
- **Advanced details → User data:** paste a script that installs a web server automatically, so every instance the ASG creates is immediately ready to serve traffic with no manual setup

Click **Create launch template**.

---

## What Happens Next

The template alone doesn't launch anything. The **Auto Scaling Group** is the piece that actually reads this template and decides *when* and *how many* instances to create from it — including which subnets and Availability Zones to spread them across, since that choice deliberately lives at the ASG level, not the template level.

> Keeping subnet selection out of the Launch Template is what lets the **same** template be reused across differently-scoped Auto Scaling Groups later — one blueprint, many possible fleets.
`,
    },
    {
      id: "asg-manual-scaling-lab",
      title: "Lab – Manual Scaling & Fault Tolerance",
      shortDesc: "Min/desired/max capacity, the delete-and-it-comes-back demo, and the honest way to tear an ASG down",
      visuals: ["CapacityControls"],
      content: `## What This Lab Proves

Manual scaling means **you** change the numbers by hand — no automation deciding for you. It's the simplest scaling option, and the best way to see exactly how an Auto Scaling Group enforces capacity.

---

## Step 1 — Launch Template

Create one (or reuse the previous lab's): Amazon Linux 2023, t2.micro, a key pair, a new **web-server-SG** allowing **HTTP (80)** and **SSH (22)** from anywhere, default EBS, and a user data script installing Apache with a simple test page.

---

## Step 2 — Create the Auto Scaling Group

**EC2 → Auto Scaling Groups → Create Auto Scaling group.**

- Name: **first-ASG**
- Launch template: the one above
- VPC: default VPC, spanning **both** ap-south-1a and ap-south-1b
- Load balancer: **No** (attaching one comes in a later topic)
- Health checks: leave at default for now

### The three numbers that matter most

- **Minimum capacity: 0**
- **Desired capacity: 0**
- **Maximum capacity: 5**

> **Desired** is how many instances you want *right now*. **Minimum** is the floor Auto Scaling always maintains. **Maximum** is the ceiling — desired can never exceed it. Setting all three to 0/0/5 here means: create the group, but don't launch anything yet.

Skip automatic scaling and any maintenance policy for this lab — the goal is to isolate manual scaling. **Create Auto Scaling group.**

---

## Step 3 — Set Desired Capacity to 1

Checking EC2 instances right now shows **zero** — matching desired capacity of 0.

Edit the ASG: set **minimum = 1**, keep **maximum = 5**, and **desired = 1**. Click **Update**.

Within moments, Auto Scaling launches exactly **one** instance from the launch template. Open its public IP once it's running — the user data script has it serving already.

---

## Step 4 — Prove Fault Tolerance

**Manually terminate that instance** from the EC2 console.

> ⚠️ **Watch what happens: Auto Scaling immediately launches a replacement.** The group's minimum is 1, so Auto Scaling enforces that floor regardless of *why* the instance count dropped — a crash, a manual termination, anything. This is the fault-tolerance guarantee an ASG gives you for free.

---

## Step 5 — Scale Out Manually

Edit the ASG's desired capacity: **1 → 2**. A second instance launches — the same launch template and user data mean it's immediately serving the exact same website with zero manual setup. Bump desired to **3** — a third instance appears. Each increase is a **scale out**.

> ⚠️ Desired capacity is always clamped between minimum and maximum. Try setting desired to **6** when maximum is **5**, and the console rejects it outright — you cannot exceed the ceiling you set.

---

## Step 6 — Scale In Manually

Edit desired capacity back down: **3 → 2**. Auto Scaling picks one instance and terminates it — a **scale in**. This is the manual mirror of Step 5: you decide the number, Auto Scaling makes reality match it.

---

## ⚠️ The Trap: Terminating Instances Doesn't Delete the ASG

If you terminate the *instances* directly (rather than editing desired capacity) while the group's desired capacity is still, say, 2, **Auto Scaling will launch two brand-new replacements** — because from its point of view, capacity dropped below desired and it's doing its job. Log out thinking you've cleaned up, and you'll come back to find instances running (and billing) again.

> **To actually remove everything: go to the Auto Scaling Group itself, Actions → Delete.** Deleting the ASG terminates every instance it manages and stops it from ever recreating them. Terminating instances one by one while the ASG survives is not a cleanup step — it's a no-op that costs you a few minutes and possibly more billing.

---

## When to Use Manual Scaling

> Manual scaling is the most basic scaling option — you specify a change to minimum, maximum, or desired capacity for an **infrequent event with a known trigger**, like a new game release going live for download at a specific time. When you know exactly when demand will change but it doesn't recur on a schedule, manual scaling is the simplest tool that fits.

For anything that repeats predictably — like every weekend — the next topic covers **Scheduled Scaling** instead.
`,
    },
    {
      id: "asg-schedule-scaling-lab",
      title: "Lab – Scheduled Scaling",
      shortDesc: "Scaling actions triggered by date and time instead of a human clicking a button",
      visuals: ["ScalingOptions"],
      content: `## When Manual Scaling Isn't Enough

Manual scaling works for one-off events, but weekend traffic surges happen **every** week. Doing that by hand every Friday and Monday is tedious and error-prone.

> **Scheduled scaling performs scaling actions automatically as a function of date and time** — for any pattern you can predict in advance: weekend surges, end-of-month/quarter processing, or a sale with fixed start and end dates. E-commerce platforms know their Big Billion Days sale starts and ends on specific dates, so they schedule the capacity increase and decrease to match exactly.

---

## Step 1 — Launch Template and ASG

Reuse (or recreate) a launch template, then create an Auto Scaling Group: minimum **1**, maximum **5**, desired **1**, spanning two AZs, no load balancer, no automatic scaling configured yet. Confirm one instance launches to match desired capacity.

---

## Step 2 — Find the Automatic Scaling Options

On the ASG, open the **Automatic scaling** tab. Three configuration options live here:

- **Dynamic scaling policies** (covered next topic)
- **Predictive scaling policies** (covered after that)
- **Scheduled actions** ← this lab

---

## Step 3 — Create a Scale-Out Schedule

**Create scheduled action:**

- Name: **SA1**
- **Min: 1, Max: 5, Desired: 4** — the capacity this action sets when it fires
- **Recurrence:** run **once**, or on a repeating pattern (every 30 minutes, hourly, daily) — recurring schedules accept standard **cron** syntax for full flexibility
- **Timezone:** e.g. **Asia/Kolkata**, so the trigger time matches your actual local sale hours, not UTC
- **Start time:** a few minutes in the future, for testing

Click **Create**. Nothing changes yet — the action is scheduled, not immediate.

---

## Step 4 — Watch It Fire

At the scheduled time, the action disappears from the scheduled-actions list (a one-time action removes itself once triggered) and the ASG's desired capacity jumps to **4**. Checking EC2 shows three new instances launching alongside the original one — every one of them immediately serving traffic, because they all share the same launch template and user data script.

> This capacity increase is a **scale out** — exactly the same mechanism as manual scaling, just **triggered by a clock instead of a human**.

---

## Step 5 — Schedule the Scale-In

Create a second scheduled action, **SA2**, a few minutes later: **Min: 1, Max: 5, Desired: 1**, run once, same timezone.

When it fires, Auto Scaling terminates instances down to the new desired capacity of 1 — a **scale in** — automatically, with no one watching a clock.

---

## Cleanup

> ⚠️ Same trap as manual scaling: deleting instances directly while the ASG's desired capacity is still >0 makes it launch replacements. **Delete the Auto Scaling Group itself** to tear everything down cleanly — this removes every instance it manages in one action.

---

## Where This Fits Among the Scaling Options

Scheduled scaling is **proactive** — you already know the trigger time. It complements (and often combines with) **Dynamic Scaling**, which reacts to live metrics for traffic spikes you *can't* predict in advance — covered next.
`,
    },
    {
      id: "asg-dynamic-scaling-lab",
      title: "Lab – Dynamic Scaling",
      shortDesc: "Simple, step, and target-tracking policies reacting to live CPU load via CloudWatch",
      visuals: ["DynamicScalingSim"],
      content: `## When Neither Manual Nor Scheduled Fits

Manual and scheduled scaling both assume you **know** when demand will change. But a sudden, unplanned traffic spike — no known trigger, no known time — needs something reactive.

> **Dynamic scaling defines a policy that watches a live metric and reacts automatically** — for example, "add capacity when average CPU utilization stays above 60% for a sustained period." It requires a **CloudWatch alarm** behind the scenes, since that's what actually detects the threshold being crossed.

---

## Step 1 — A Launch Template That Can Generate Load

Create a launch template (**limit-ASG-template**, Amazon Linux, t2.micro, key pair, a new **limit-SG** allowing HTTP + SSH) with a special user data script this time: one that installs a small utility letting you **artificially spike CPU load on demand** from a web page — purely so the scaling policy has something real to react to during testing.

Create an Auto Scaling Group from it: desired **1**, min **1**, max **5**, across two AZs, no load balancer. Confirm the instance launches and — opening its public IP — that the load-generator page loads with CPU utilization sitting at **0%**.

---

## Step 2 — The Three Dynamic Scaling Policy Types

On the ASG's **Automatic scaling** tab → **Create dynamic scaling policy**:

| Policy | How it decides | Example |
|---|---|---|
| **Simple** | **One** threshold, one fixed action | CPU between 50–60% → add 1 instance |
| **Step** | **Multiple** thresholds, different actions per band | 50–60% → +1; 60–70% → +2 |
| **Target Tracking** | You set a target; AWS **self-optimizes** how many instances to add/remove | Target: 60% average CPU |

> **Target tracking is the recommended default** — instead of you working out exact thresholds and step amounts, you just declare the target and AWS continuously adjusts capacity to chase it.

---

## Step 3 — Configure a Target Tracking Policy

- **Metric type:** Average CPU Utilization (also available: network in/out bytes, ALB request count per target, or a custom metric — pick whichever reflects your actual bottleneck, e.g. memory for a database server)
- **Target value:** **60%**
- **Instance warm-up:** the time a brand-new instance needs before its metrics count toward the average — default **300 seconds (5 minutes)**. Without this, a freshly-booted instance still installing its OS could skew the average and trigger a premature second scale-out.

Click **Create**.

---

## Step 4 — Trigger a Scale-Out

Open the running instance's load-generator page and push CPU to **100%**. The ASG detail page still shows desired capacity **1** at first — target tracking reacts to the **average over time**, not an instant spike, and the warm-up window means the *next* scaling decision also waits.

After roughly the warm-up period (~5–6 minutes in practice), desired capacity flips to **2**, and a second instance appears — inheriting the same launch template, same load-generator page. This is the policy autonomously deciding "average CPU is above my 60% target — add capacity" with no human involved.

---

## Step 5 — Trigger a Scale-In

Cancel the artificial load on both instances so CPU utilization drops back near **0%**. Watch the ASG detail page: it may briefly show desired capacity ticking up before settling, if load was still elevated during the last evaluation window — but once CPU stays low, desired capacity drops back to **1**, and Auto Scaling terminates the extra instance automatically.

> This full loop — load up, wait for warm-up, watch scale-out, cancel load, watch scale-in — is target tracking working exactly as designed: continuously comparing the live average against your 60% target and adjusting capacity to match, with zero manual intervention either direction.

---

## Cleanup

Delete the Auto Scaling Group directly (not the individual instances) to remove everything created during this lab.

---

## Where This Sits

Dynamic scaling is **reactive** — it only acts once the metric has already crossed the threshold. The next topic, **Predictive Scaling**, adds a **proactive** layer on top: forecasting demand *before* it arrives using machine learning, instead of waiting for CPU to already be hot.
`,
    },
    {
      id: "asg-predictive-scaling",
      title: "Predictive Scaling",
      shortDesc: "Machine learning forecasts tomorrow's traffic and pre-launches capacity ahead of the spike",
      visuals: [],
      content: `## Reactive vs Proactive

Dynamic scaling is **reactive** — it waits for CPU (or another metric) to actually cross a threshold before adding capacity, which means there's always some lag between the spike starting and new instances coming online.

> **Predictive scaling is proactive: it uses a machine learning model trained on your historical traffic to forecast future demand, then pre-launches capacity ahead of the predicted spike** — instead of waiting for it to already be happening.

The model needs **at least 3 weeks of historical data** to produce a useful forecast. Because building and validating that history takes real time, this topic covers the **configuration options** in depth rather than a live before/after demo — setting one up properly is a longer-term process than a single lab session can show.

> Predictive scaling works *alongside* dynamic and scheduled scaling, not instead of them — combining a proactive forecast with a reactive safety net covers both predictable and unpredictable demand.

---

## Creating a Predictive Scaling Policy

**ASG → Automatic scaling → Create predictive scaling policy.**

### 1. Scale Based On Forecast (on/off)

- **On:** the policy actively adjusts your ASG's instance count based on the forecast — full proactive automation
- **Off (forecast-only):** the model produces a demand forecast for your own visibility, but takes **no scaling action** — useful for validating the forecast's accuracy before trusting it to actually change capacity

### 2. Metric

The metric the model analyzes historically to build its forecast — typically **CPU utilization** for an application server, but could be **memory** for a database server, **network I/O**, or **ALB request count per target**, depending on what actually reflects your workload's real bottleneck.

### 3. Target Utilization

The utilization level you want to maintain as the "comfortable idle" operating point — commonly **50%**. Above this, the forecast calls for more instances; below it, fewer. This percentage should reflect your own application's actual headroom needs, not a universal default.

### 4. Pre-Launch Instances (Additional Setting)

Because this is proactive, you can tell it to launch new instances **ahead of** the predicted spike, not at the moment it arrives.

> **Worked example:** the forecast predicts a spike at **10:00 AM**. Setting the pre-launch buffer to **5 minutes** (the default) means instances actually launch at **9:55 AM** — already warmed up and ready by the time the real traffic arrives. Maximum advance is 60 minutes.

### 5. Buffer: Maximum Capacity Above Forecast

An extra safety margin on top of whatever the forecast says you need.

> **Worked example:** the forecast says **10 instances** are needed. Setting a **20%** buffer provisions **12** instances (10 + 20% of 10 = 12) — a cushion against the forecast being slightly under, without you having to guess a fixed extra number yourself.

---

## Why Combine Predictive + Dynamic

> Predictive scaling anticipates the *pattern* — recurring daily/weekly traffic shapes it has learned from history. Dynamic scaling catches whatever the forecast **didn't** see coming — a genuine one-off spike with no historical precedent. Running both together means predictable load is handled proactively (instances are already warm when traffic arrives) while unpredictable load still gets a reactive safety net.
`,
    },
    {
      id: "asg-maintenance-policy-lab",
      title: "Lab – Instance Maintenance Policy",
      shortDesc: "Terminate-and-launch vs launch-before-terminating vs custom — replacing a fleet's AMI without downtime or overpaying",
      visuals: ["MaintenancePolicy"],
      content: `## The Problem This Solves

An Instance Maintenance Policy controls **how** an Auto Scaling Group replaces instances during operations like an AMI update, an unhealthy-instance replacement, or rebalancing across AZs. The clearest way to see it is to actually change a fleet's operating system and watch each policy handle the swap differently.

---

## Step 1 — Baseline Setup

Create a launch template (**Amazon Linux**, t2.micro, key pair, default security group), **version 1**. Create an ASG from it: **desired 2, min 2, max 2**, spanning two AZs, **instance maintenance policy: No policy** for now. Confirm two Amazon Linux instances launch.

---

## Step 2 — Create a New Template Version (Switch the AMI)

Edit the launch template → **create template version 2** → change the AMI from **Amazon Linux to Ubuntu**. Update the ASG to point at **version 2** of the template.

> Changing the template alone does nothing to the two instances already running — they were built from version 1 and stay exactly as they are until something explicitly tells the ASG to replace them. That "something" is an **instance refresh**.

---

## Step 3 — Policy 1: Terminate and Launch (Cost-First)

**ASG → Instance maintenance policy → Terminate and launch.**

- **Minimum healthy percentage: 50%** — with 2 desired instances, that means **1** instance must stay running at all times
- **Maximum healthy percentage:** stays at **100% (2)** — capacity is **never allowed to exceed** the desired count

**Start instance refresh.** Watch the sequence: **terminate** one old (Amazon Linux) instance first, **then launch** its Ubuntu replacement, wait for it to be healthy, **then** terminate the second old instance and launch its replacement.

> ⚠️ **You never pay for more than 2 instances at any point** — this policy prioritizes cost control over availability. The trade-off: capacity briefly dips to 1 instance while each replacement happens.

---

## Step 4 — Policy 2: Launch Before Terminating (Availability-First)

Switch the launch template back to **version 1** (Amazon Linux) first, so there's a real AMI change to refresh again. Then set:

**Instance maintenance policy → Launch before terminating.**

- **Minimum healthy percentage: 100%** — both existing instances **stay running** throughout
- **Maximum healthy percentage: 200%** — capacity is allowed to **temporarily double** (up to 4 instances)

**Start instance refresh.** This time: **two new** instances launch first (on the current template version) *while both old ones keep running* — so briefly there are **4** instances total — and only once the two new ones are healthy does it terminate the two old ones.

> ⚠️ **You pay for up to 4 instances during the transition**, but there is **zero capacity dip** — this policy prioritizes availability over cost. This is the trade-off callout worth memorizing for the exam: terminate-and-launch is cost-first with a capacity dip; launch-before-terminate is availability-first with a temporary cost spike.

---

## Step 5 — Policy 3: Custom Behavior (Full Control)

The first two policies each hard-code one side of the trade-off — terminate-and-launch **won't let you exceed** the desired count; launch-before-terminate **won't let minimum healthy drop** below 100%. Custom Behavior removes both restrictions:

> **You set the minimum and maximum healthy percentages independently, however you want** — e.g. 75% minimum and 150% maximum, splitting the difference between the two presets. For large fleets where neither built-in policy's rigid trade-off fits, this is the one with real flexibility.

---

## What to Remember

| Policy | Min healthy | Max healthy | Trade-off |
|---|---|---|---|
| **Terminate and Launch** | Below 100% allowed | Capped at desired (100%) | Cost-controlled, capacity dips |
| **Launch Before Terminating** | Locked at 100% | Can exceed desired (e.g. 200%) | Zero downtime, costs more briefly |
| **Custom Behavior** | You choose | You choose | Full control for large/complex fleets |

> Don't forget to delete the Auto Scaling Group when finished, to remove every instance it created across both policy tests.
`,
    },
  ],
};
