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
      id: "lambda-intro",
      title: "AWS Lambda – Running Code Without Provisioning a Server",
      shortDesc: "The OLX watermark example — event-driven, pay-per-execution compute that never provisions a VM",
      visuals: ["ServerlessFlow3D"],
      content: `## The Core Definition

> **AWS Lambda's own tagline: "run your code without thinking about servers."** The definition, stripped to its essence: **run code without provisioning a server.**

**Contrast with EC2**: running Java code on EC2 means creating a virtual machine, provisioning CPU and RAM for it, installing an operating system (Linux or Windows), installing the Java Runtime Environment, and only then running the code. Every one of those steps is a **provisioning** step. ⚠️ **With Lambda, none of that happens** — code is uploaded directly as a **Lambda function**, and it runs. This is exactly why Lambda is called **serverless**: not that there's literally no server anywhere, but that the developer never provisions or manages one.

---

## Event-Driven: How a Function Actually Gets Run

> **Lambda is event-driven** — a function does nothing on its own; it runs only when triggered by an event from an integrated AWS service (S3, API Gateway, EventBridge, and many others), or from a VPC.

---

## Worked Example: Automatic Watermarking on OLX

**The scenario**: a marketplace site (the lecture uses OLX as the example) lets users upload photos of items for sale — and every uploaded photo automatically gets an OLX watermark added.

**How this maps to Lambda**: the uploaded photo is stored in **S3** (the near-universal storage choice for this kind of app). S3 supports event-driven triggers — the moment a new photo upload event fires, a Lambda function is triggered automatically, and that function's code applies the watermark. ⚠️ **The whole process is fully automatic and entirely event-driven** — no photo upload, no trigger, no execution, no cost.

---

## Pay-As-You-Go: The Direct Consequence of Event-Driven Execution

> **Lambda is billed only when a function actually runs.** If nobody uploads a photo today, the watermarking function never triggers, and the bill for that function is zero. This pay-as-you-go model is a direct structural consequence of being event-driven, not a separate pricing feature bolted on afterward.

---

## Multiple Languages via Runtimes

> **Lambda supports many programming languages through "runtimes"** — when creating a function, a runtime environment is selected first: **.NET, Java, Node.js, Python, Ruby, Go**, among others. Whatever language the existing code is written in, there's very likely a matching runtime — no server-level installation of a language runtime is ever required, since Lambda handles that behind the scenes.

---

## Exam Framing

> "Run code without provisioning or managing any server, triggered automatically by an event from another AWS service" → **Lambda.** The OLX/S3-watermark pattern (storage event → automatic function trigger → automatic processing, zero cost when idle) is the canonical mental model for virtually every "why would you use Lambda here" scenario.
`,
    },
    {
      id: "lambda-serverless-model",
      title: "What 'Serverless' Actually Means – IaaS vs Managed vs Serverless",
      shortDesc: "Three tiers of cloud responsibility, and the full honest list of serverless trade-offs — cold starts, the 15-minute ceiling, vendor lock-in, and reduced control",
      visuals: ["ServerlessSpectrum", "ServerlessTradeoffs"],
      content: `## Three Tiers of Cloud Responsibility

> **Cloud computing execution models fall into three broad tiers, each handing off progressively more operational responsibility to the cloud provider.**

**1. Infrastructure as a Service (IaaS) — e.g. EC2.** The customer deploys the server, manages the operating system, sets memory and CPU, and is responsible for securing the OS itself. Full control, full operational burden.

**2. Managed services — e.g. RDS.** The customer still provisions resources (choosing RAM, CPU when creating a DB instance) and is still responsible for things like Multi-AZ high availability configuration — but AWS handles the operating system and database engine updates. A middle ground: some provisioning still required, but OS/engine maintenance is offloaded.

**3. Serverless — e.g. Lambda.** ⚠️ **No provisioning of any server at all.** AWS handles provisioning, scaling, and server maintenance entirely. Instead of running continuously (like an EC2 instance or an RDS database), a serverless function **executes only when triggered by an event.**

---

## The Benefits of Serverless

**1. No server management.** Nothing to provision — no CPU/RAM sizing, no operating system choice (Linux vs Windows, which Linux distribution), no patching responsibility.

**2. Automatic scaling.** With EC2, scaling (vertical or horizontal) is the customer's responsibility, typically via an Auto Scaling Group. With serverless, scaling is handled entirely by the cloud provider — automatically, with no configuration.

**3. Cost efficiency.** Directly tied to the pay-as-you-go, event-driven billing model — covered in depth in the Lambda-vs-EC2 comparison.

**4. High availability.** Achieving HA with EC2 means deploying servers across multiple Availability Zones and setting up a load balancer — real, ongoing infrastructure work. With serverless, high availability is **managed entirely by the cloud provider.**

**5. Faster deployment.** No server to design, provision, or configure — code can be loaded directly and executed, dramatically shortening the path from "written" to "running."

---

## ⚠️ The Trade-Offs (Not Disadvantages — Trade-offs)

**1. Cold starts.** An EC2 instance running 24×7 executes triggered code immediately, since everything is already provisioned. A Lambda function that has been **idle** must have its resources provisioned in the background **at the moment it's triggered** — producing a noticeably slower first execution. This delay is called a **cold start.**

**2. Limited execution time.** ⚠️ **Lambda enforces a hard maximum execution time of 15 minutes** — EC2 has no such ceiling; code can run for any duration. This is a heavily tested exam fact: **any scenario stating an execution time greater than 15 minutes immediately rules Lambda out**, regardless of how well the rest of the scenario otherwise fits serverless.

**3. Vendor lock-in.** Code running on an EC2 instance with, say, Ubuntu as the OS can be moved to another cloud provider by simply standing up an equivalent Ubuntu server there — the execution environment is portable. Lambda-specific code, however, typically requires modification to run on another provider's equivalent serverless offering — a real (if not insurmountable) migration cost.

**4. Less control over infrastructure.** EC2 gives full control over the underlying virtual machine — any framework, any configuration. With Lambda, the underlying execution environment is opaque — code is handed to AWS, and AWS runs it, with no visibility or control over what's happening underneath. For very large, complex applications needing fine infrastructure control, this can be a genuine limitation.

---

## Exam Framing

> "Cloud provider fully manages provisioning, scaling, and maintenance — customer supplies only code" → **serverless (Lambda)**, distinct from managed services (still some provisioning, e.g. RDS) and IaaS (full provisioning, e.g. EC2). Memorize the trade-off list as a set, not just cold starts alone — vendor lock-in and reduced infrastructure control are just as testable as the 15-minute ceiling.
`,
    },
    {
      id: "lambda-vs-ec2",
      title: "Lambda vs EC2 – Ten Differences, Worked Through a Course-Enrollment Example",
      shortDesc: "Both are compute services — the enrollment-trigger worked example makes the pricing difference (and when each one wins) concrete",
      visuals: ["LambdaVsEC2"],
      content: `## Both Are Compute Services

> **EC2 and Lambda both live under AWS's "Compute" service category** — the question isn't "which is a compute service" (both are), but **which compute model fits a given workload.**

---

## Ten Points of Comparison

**1. Compute model.** EC2 = a provisioned virtual machine (create VM → install OS → configure runtime → upload code). Lambda = fully managed, **event-driven** function execution — no provisioning step at all.

**2. Use cases.** EC2 fits hosting applications, databases, and **long-running (24×7) processes.** Lambda fits **short-lived tasks** — microservices, API backends, event-driven automation.

**3. Pricing.** EC2 bills **per instance**, hourly or per-second, **regardless of whether the instance is actually doing anything.** Lambda bills **per execution and memory usage** — see the worked example below for why this distinction matters enormously in practice.

**4. Scaling.** EC2 requires manually configuring an Auto Scaling Group. Lambda scales **automatically and instantly** based on incoming load.

**5. Management responsibility.** EC2: the user is responsible for OS-level maintenance and patching. Lambda: **fully managed**, no server maintenance required at all.

**6. Startup time.** A powered-off EC2 instance takes **minutes** to start once triggered. Lambda's cold-start provisioning takes **milliseconds** — dramatically faster, though still not instantaneous for a truly idle function.

**7. Execution time.** EC2: **unlimited** — code can run for any duration. Lambda: ⚠️ **capped at 15 minutes maximum.**

**8. Networking.** EC2 gives full control over networking — security groups, subnets, Elastic IPs, all configured directly. Lambda **can** connect to a VPC too, but with more limited functionality than a full EC2 setup.

**9. Customizability.** EC2: full OS-level control, install anything. Lambda: limited to its **predefined runtimes** — whatever languages/versions Lambda supports, nothing more, without resorting to a container image.

**10. Security responsibility.** EC2: the user is responsible for OS patching, firewall configuration, and general system hardening. Lambda: fully managed — the underlying infrastructure's security is AWS's responsibility.

---

## Worked Example: Course Enrollment Pricing

**The scenario**: a website is running 24×7 (so it's naturally hosted on an EC2 instance, or similar). Whenever a user purchases/enrolls in a course, a specific piece of code needs to run to process that enrollment. Enrollment volume is unpredictable — some days 10 students enroll, other days (e.g. a holiday) zero students enroll.

> **If the enrollment-processing code runs on Lambda**: 10 enrollments today means the function executes 10 times, and the bill reflects **10 executions.** Zero enrollments tomorrow means the function executes 0 times, and the bill is **₹0.**

> **If the same code runs on an EC2 instance kept running 24×7 specifically to handle this**: the instance is billed **continuously, regardless of enrollment volume** — 10 executions today, 0 tomorrow, the EC2 bill is identical either way, since the instance itself (not the execution count) is what's being paid for.

⚠️ **This is the single clearest illustration of the EC2-vs-Lambda pricing difference**: EC2 charges for *time the resource exists*, Lambda charges for *work actually performed.* For unpredictable, bursty, event-driven workloads, this makes Lambda structurally cheaper; for genuinely constant, always-on workloads, EC2's flat per-instance cost can be the more economical choice instead.

---

## Exam Framing

> "Should this workload run on EC2 or Lambda?" almost always reduces to two questions: **is the execution time under 15 minutes, and is the workload long-running/constant vs short-lived/event-driven?** Long-running or execution-time-over-15-minutes → **EC2.** Short-lived, event-triggered, execution time comfortably under 15 minutes → **Lambda**, with the added benefit of paying only for actual executions rather than idle uptime.
`,
    },
    {
      id: "lambda-first-function-lab",
      title: "Creating Your First Lambda Function – Hello World, Step by Step",
      shortDesc: "def lambda_handler(event, context) is not optional — the event-trigger model is exactly why a plain script won't work here",
      visuals: ["FunctionAnatomy"],
      content: `## Why a Lambda Function Isn't Just a Script

> ⚠️ **Lambda's event-driven nature means code cannot simply run top-to-bottom like a normal script** — an event happens, that event triggers the function, and the function sends back a response. This trigger→response structure is exactly why Lambda requires code to be wrapped inside a specific function definition, rather than accepting arbitrary standalone code.

---

## Creating the Function

1. In the Lambda console, choose **Create function → Author from scratch.**
2. Provide a **function name** (e.g. "Hello World").
3. Choose a **runtime** — e.g. Python.
4. Choose a **processor architecture** — **x86_64** is the standard default choice.
5. Choose an **execution role** — for a first function, "create a new role with basic Lambda permissions" is the simplest path (execution roles are covered in depth in their own topic).
6. Click **Create function.**

---

## Anatomy of a Lambda Function

\`\`\`python
def lambda_handler(event, context):
    return "Hello World"
\`\`\`

- **def lambda_handler(event, context):** — ⚠️ **the function definition is mandatory, not optional** — since an external event is what triggers execution, the code must be wrapped in a function that event can invoke. **lambda_handler is the default, fixed function name** provided by AWS (it can be changed, but the default is the standard starting point).
- **event** and **context** — parameters automatically managed by Lambda; they aren't something to configure manually when starting out.
- **return** — ⚠️ **use return, not print, when the goal is to send a value back as the response** to whatever triggered the function. A plain print() call does NOT get returned to the caller — it only writes to **CloudWatch Logs**, which is useful for debugging but is not the function's actual output.

---

## Testing the Function

Since Lambda is event-driven, it needs *something* to trigger it — Lambda provides a built-in way to simulate this without a real external service:

1. Click **Test** → **Create new test event**, give it a name (e.g. "my-test-event"), and save.
2. Click **Test** again to actually invoke the function with that event.
3. The console reports **"execution result: succeeded"** along with the function's response — for the Hello World example, the response is literally "Hello World", exactly matching the return statement.

---

## Exam Framing

> "Lambda function structure requires a defined entry-point function (lambda_handler by default), because execution is always triggered by an external event rather than run directly" — this event-triggered nature is the conceptual foundation for everything that follows: authoring options, execution roles, and the trigger types covered in later topics.
`,
    },
    {
      id: "lambda-blueprints-test-events",
      title: "Lambda Blueprints and Passing Test Event Data",
      shortDesc: "Ready-made functions for common AWS patterns, plus how key-value JSON passed into a test event actually reaches the function's code",
      visuals: [],
      content: `## What a Blueprint Is

> **AWS provides pre-built, ready-to-use Lambda functions called Blueprints** for common, frequently-seen use cases — reading/writing DynamoDB data being one concrete example the source lecture calls out. ⚠️ **Using a blueprint means not writing the function from scratch** — the code is already provided; only minor customization (e.g. plugging in a specific table name) is typically needed.

**Why blueprints exist**: AWS has visibility into the most common Lambda usage patterns across its customer base, so it packages those patterns as ready-made starting points rather than leaving every customer to reinvent the same logic independently.

---

## Choosing a Blueprint

1. **Create function → Use a blueprint** (instead of Author from scratch).
2. Select a blueprint (the source lecture uses a simple "Hello World" blueprint for illustration) — the **runtime is automatically selected** to match the language the blueprint is written in.
3. As with any function, choose an execution role (a new role is created automatically if needed).

---

## Passing Data Into a Test Event

> **A test event isn't limited to a fixed structure — custom key-value pairs can be added as JSON**, and that data becomes accessible to the function's code through its event parameter.

**Worked example**: adding a test event with **key1 = "Cloud Fox Hub"** and **key2 = a name value** — the function (per the blueprint's own code) returns the value associated with **key1** as its actual response, while **all the entered key-value pairs appear in the CloudWatch log output**, regardless of which one is returned.

⚠️ **This distinction matters**: the *returned* value is what's sent back as the response to whatever triggered the function; *everything else passed in* is still visible, but only in the logs — not in the response itself. This is the same return-vs-print distinction from the first-function topic, just demonstrated with real input data this time.

---

## Exam Framing

> "How would test data be supplied to a Lambda function before wiring up a real trigger like S3 or API Gateway?" → **a test event, expressed as a JSON key-value payload**, which the function accesses via its event parameter. Blueprints are best understood as accelerators for common patterns, not a fundamentally different execution model from an authored-from-scratch function.
`,
    },
    {
      id: "lambda-container-images",
      title: "Lambda Container Images vs OS-Only Runtime – Running Unsupported Languages",
      shortDesc: "Go, Rust, and C++ have no built-in Lambda runtime — two container-based escape hatches, compared point by point",
      visuals: ["AuthoringOptions"],
      content: `## The Problem: Unsupported Languages

> **AWS Lambda provides preconfigured runtimes only for a specific set of popular languages** — Python, Node.js, Java, .NET, Ruby among them. ⚠️ **Languages without an official Lambda runtime — the source lecture names Go, Rust, and C++ specifically — have no predefined runtime option to select at all.**

For exactly this situation, Lambda offers **two container-based paths.**

---

## Option 1: Container Image

> **A full container image is built (including the base OS AND the runtime), then run as the Lambda function.** The image is created using **Docker** (via a Dockerfile), and can use **any base operating system** — Alpine Linux, Ubuntu, Amazon Linux, or others — entirely at the developer's discretion. ⚠️ **The runtime must be included inside the container image itself** — nothing is installed after the fact; the image is fully self-contained on arrival.

**Best for**: deploying something like a **machine learning model with TensorFlow** in a fully custom container, or any large, complex application needing a specific, controlled environment from the base OS up.

---

## Option 2: OS-Only Runtime

> **AWS provides a container with ONLY a base operating system** — ⚠️ **fixed to Amazon Linux** (2023 or Amazon Linux 2, not a free choice like Option 1's base OS) — and the runtime must be **installed separately, after the fact**, inside that fixed base.

**Best for**: a lighter-weight scenario — e.g. running a **specific Node.js version not listed** among Lambda's standard supported versions, by installing that exact version onto the Amazon Linux base rather than building a full custom image from scratch.

---

## Five-Point Comparison

| Aspect | Container Image | OS-Only Runtime |
|---|---|---|
| Base OS | Any (Alpine, Ubuntu, Amazon Linux, etc.) | ⚠️ Fixed — Amazon Linux only |
| Runtime | Bundled into the image at build time | Installed separately, after choosing the base |
| Control | Full control over OS, runtime, and dependencies | Runtime/dependencies controllable; **OS is fixed** |
| Best for | Full custom environments, large/complex apps | Lightweight setups, one unsupported runtime version |
| Example use case | ML model (TensorFlow) in a custom container | An unlisted Node.js version on Amazon Linux |

**Deployment mechanics**: a Container Image must be built and then **uploaded to Amazon ECR (Elastic Container Registry)** before Lambda can reference and run it — an extra step not required for a standard runtime-based function.

---

## Exam Framing

> "Language/framework has no official Lambda runtime available" → **either Container Image (full custom OS+runtime control) or OS-Only Runtime (fixed Amazon Linux base, install the runtime yourself)**, chosen based on how much OS-level flexibility the workload actually needs. Remember: Container Image goes through **ECR** as a required intermediate step.
`,
    },
    {
      id: "lambda-execution-role",
      title: "Lambda Execution Role – Why Even 'Hello World' Needs One",
      shortDesc: "AWS services are fully isolated from each other by default — the PDF-watermarking example shows exactly why an IAM role is the only way through",
      visuals: ["ExecutionRole"],
      content: `## Why Execution Roles Exist at All

> ⚠️ **All AWS services are completely isolated from one another by default.** For one service to act on another — Lambda reading from S3, Lambda starting an EC2 instance, anything — explicit permission must be granted via an **IAM role**, which the accessing service assumes as its own identity.

---

## Worked Example: Automatic PDF Watermarking

**The scenario**: an application lets users upload PDF files to an S3 bucket, and every uploaded PDF should automatically get a company watermark added. A Lambda function is the natural mechanism — triggered by the S3 upload event, it accesses the newly-uploaded PDF and adds the watermark.

⚠️ **But Lambda cannot access that PDF in S3 by default** — S3 and Lambda are isolated services. **An IAM role granting Lambda permission to access the S3 bucket must exist and be attached to the function** before this works. The same logic applies to any other cross-service action — starting an EC2 instance, writing to DynamoDB, anything.

---

## Creating and Attaching a Role

1. In **IAM → Roles → Create Role**, choose **Lambda** as the trusted AWS service.
2. Attach the needed permissions (e.g. **Amazon S3 Full Access** for the watermarking scenario — though a narrower, custom-scoped policy is the better real-world practice over a broad managed policy).
3. Name and create the role.
4. Back in the Lambda function's configuration, select **Use existing role** and choose the newly-created role.

AWS also provides **predefined policy templates** as a middle ground between "create everything by hand" and "just use a broad managed policy."

---

## ⚠️ Why Even a "Hello World" Function Needs an Execution Role

**The question that trips people up**: a plain Hello World function doesn't touch S3, EC2, or any other AWS service — so why does creating it still require choosing an execution role?

> **The answer: writing to CloudWatch Logs is ITSELF a cross-service action.** Lambda and CloudWatch are separate, isolated services just like Lambda and S3. When a function uses print() (rather than return), that output has to be written somewhere — and it's written to **CloudWatch Logs.** ⚠️ **The default "basic Lambda execution role" exists specifically to grant this CloudWatch-logging permission** — it's not an arbitrary default, it's the minimum permission every function needs to produce any visible log output at all.

**Verifying this**: after running a function that uses print() instead of return, the test response comes back **null** (since nothing was returned) — but clicking **Monitor → View CloudWatch Logs** reveals the printed output was captured there, proving the default execution role's CloudWatch-writing permission is what made that visibility possible.

---

## Exam Framing

> "Why does a Lambda function need an execution role even when it doesn't call any other AWS service in its own code?" → **because writing logs to CloudWatch is itself a cross-service call**, and the basic execution role is what grants that specific permission. Any *additional* service access (S3, EC2, DynamoDB, etc.) requires *additional* permissions layered on top of that baseline — the execution role is cumulative, not a single fixed grant.
`,
    },
    {
      id: "lambda-ec2-automation-boto3-lab",
      title: "Lambda + Boto3 Lab – Automating EC2 Start/Stop from Python",
      shortDesc: "Two prerequisites (an EC2 instance and an IAM role), one Boto3 call, and a timeout tweak most people miss on the first run",
      visuals: ["EC2Automation"],
      content: `## What Boto3 Is

> **Boto3 is AWS's official Python SDK** — a library that lets Python code manage AWS resources programmatically. It's specifically what makes it possible to write Lambda functions in Python that start EC2 instances, read/write S3 objects, query DynamoDB, and interact with essentially any other AWS service.

**Real-world Lambda automation examples the source lecture calls out**: sending an SMS/OTP alert, resizing an uploaded image, processing an e-commerce order, generating an invoice, sending appointment reminders. This lab builds the simplest possible version of that pattern — a function that starts a stopped EC2 instance.

---

## Prerequisite 1: An EC2 Instance

> **An EC2 instance must already exist (and be in a Stopped state)** before building a function to start it — there's nothing to automate the starting of otherwise.

---

## Prerequisite 2: An IAM Role for Lambda → EC2 Access

> ⚠️ **By default, Lambda has zero permission to manage EC2 instances** — the same cross-service isolation principle covered in the Execution Role topic applies here directly. A role must be created granting Lambda the ability to start/stop EC2 instances.

**Creating the role**: **IAM → Roles → Create Role**, trusted service = **Lambda**, attach **EC2 Full Access** AND the **basic Lambda execution permission** (the same CloudWatch-logging permission from the prior topic — without it, this function's logs would be invisible too). Name it something like "Lambda-EC2-Role."

---

## Writing the Function

\`\`\`python
import boto3
ec2 = boto3.client('ec2', region_name='ap-south-1')

def lambda_handler(event, context):
    ec2.start_instances(InstanceIds=['i-0abc123'])
    return "Started"
\`\`\`

- **boto3.client('ec2', ...)** — creates a client object for interacting with EC2, scoped to a specific **region** (must match the region the target instance actually lives in).
- **ec2.start_instances(InstanceIds=[...])** — the actual API call that starts the named instance(s).

---

## ⚠️ The Timeout Trap

> **Lambda's default execution timeout is 3 seconds** — starting an EC2 instance genuinely takes longer than that. ⚠️ **A function that correctly starts an EC2 instance can still fail/timeout if the 3-second default isn't increased** — bumping it to something like 10 seconds is a necessary configuration step, not optional cleanup.

---

## Testing and Verifying

1. Create a test event (no JSON payload needed for this simple case) and run **Test.**
2. A successful execution reports the instance as started.
3. **Verify two ways**: check the EC2 console directly for the instance's now-Running state, or check **Monitor → View CloudWatch Logs** for the function's own printed confirmation output.

---

## Exam Framing

> "Lambda function correctly calls an AWS API but the invocation fails or times out" → check **both** the execution role's permissions **and** the configured timeout — a correct IAM role with an unchanged 3-second default timeout is a realistic failure mode for anything that takes real time to complete (like starting an EC2 instance), not just a permissions issue.
`,
    },
    {
      id: "lambda-triggers",
      title: "Lambda Triggers – API Gateway and EventBridge, Worked Through a Start/Stop EC2 Example",
      shortDesc: "A function with no trigger attached is completely inert — click-driven access via API Gateway vs scheduled cron-style access via EventBridge",
      visuals: ["LambdaTriggers"],
      content: `## A Function Does Nothing Without a Trigger

> ⚠️ **Triggers are not automatic — they must be added manually to a Lambda function**, from the function's **Add trigger** option (or the Configuration tab). Without a trigger attached, a function simply never executes, no matter how correct its code is.

**Demonstrated directly**: removing a function's existing trigger (e.g. an API Gateway trigger) causes a previously-working "click this button to start my EC2 instance" webpage to stop doing anything at all — the button still exists, but nothing is listening for the click anymore.

---

## Trigger Type 1: API Gateway (Click-Driven)

> **API Gateway exposes an HTTP endpoint (a URL) that, when hit, invokes the Lambda function.**

**Setup**: **Add trigger → API Gateway → Create a new API** (HTTP API is the simpler option) → choose security level (the lecture uses "Open" — no auth — for demonstration simplicity, though a real deployment would typically restrict this). This produces a **URL** that triggers the function whenever it's accessed.

**Worked example**: a simple webpage with a "Start EC2" button, where the button's action is simply hitting that generated API Gateway URL — clicking it invokes the Lambda function, which calls the EC2 start-instance API, and the instance transitions from Stopped to Running.

---

## Trigger Type 2: EventBridge (Schedule-Driven)

> **EventBridge triggers a function on a schedule (cron-style) or in response to event patterns** — the natural fit for "run this automatically at a specific time," rather than "run this when a user clicks something."

**Worked example**: automatically stopping an EC2 instance on a schedule — **Add trigger → EventBridge → Create a new rule**, choose **Schedule expression**, and supply a cron expression (AWS provides ready-made example expressions for common intervals — every N minutes, a specific daily time, etc.).

**Real business use case this generalizes to**: starting all company EC2 instances automatically at 9 AM and stopping them at 6 PM, entirely without manual intervention — a cost-saving, hands-off automation pattern built from exactly this trigger type.

---

## Choosing Between Them

> **The right trigger type depends entirely on what should cause the function to run.** A user-initiated action (clicking a button, submitting a form) → **API Gateway.** A time-based or recurring schedule → **EventBridge.** (Lambda also supports many other trigger sources — S3 object events, DynamoDB Streams, SNS, SQS, Alexa, ALB, CodeCommit, and more — each fitting a different "what should cause this to run" scenario.)

---

## Exam Framing

> "A Lambda function's code is correct, but it never seems to execute" → check whether a **trigger** is actually attached — a function with no trigger is inert by design, since Lambda's entire model is event-driven. "User-initiated, on-demand execution via a URL/webpage" → **API Gateway.** "Recurring/scheduled execution, e.g. daily EC2 start/stop" → **EventBridge**, using cron-style schedule expressions.
`,
    },
    {
      id: "amazon-q-overview",
      title: "Amazon Q – AWS's AI Agent for Cloud Troubleshooting and Lambda Coding",
      shortDesc: "Not a chatbot — an AI agent that inspects real AWS resources and takes action, demonstrated through an SSH-troubleshooting comparison against ChatGPT",
      visuals: [],
      content: `## What Amazon Q Is

> **Amazon Q is an AI agent developed by AWS** — deeply integrated into the AWS Management Console, IDEs, and business apps like Amazon QuickSight — for tasks like code generation and troubleshooting (developers), cloud infrastructure management (cloud engineers), and data analysis (business users). ⚠️ **Note: this is productivity-tooling content, not core SAA-C03 exam material** — it's covered here because the course uses Amazon Q as a teaching aid throughout the rest of the Lambda series, not because it's independently exam-tested.

---

## ⚠️ AI Agent vs AI Chatbot — The Core Distinction

> **The defining difference: a chatbot (like ChatGPT) can only respond with suggestions; an agent (like Amazon Q) can actually inspect real AWS resources and take action on them**, because it's integrated directly with AWS APIs.

**Worked comparison — "why can't I SSH into my EC2 instance?"**:
- **ChatGPT** (no AWS integration): returns a generic list of possible causes — check if the instance is running, check the security group, check the network ACL, check the key pair. The user still has to manually go verify each one in the AWS console.
- **Amazon Q** (AWS-integrated): asks for the instance ID, automatically inspects that instance's actual security group configuration, identifies the specific problem (e.g. "port 22 is not open in your inbound rules"), and — critically — **can add the missing inbound rule itself** if asked to.

**A second example from the source lecture**: asked "why is my EC2 instance not responding," a chatbot suggests "check your logs" — Amazon Q **actually analyzes the logs itself** and returns the specific issue and a suggested fix, rather than telling the user what to go check manually.

---

## Where Amazon Q Fits by Role

- **Cloud engineers**: explains AWS services and configuration, helps troubleshoot infrastructure, answers "how do I configure X" questions, and can even write IAM policy JSON directly.
- **Developers**: generates and troubleshoots code snippets — directly relevant to the Lambda series, since later lectures use Amazon Q to help write Lambda function code.
- **Business users**: natural-language queries against AWS data (e.g. via Amazon QuickSight) for reports and insights, without needing to manually query underlying services like CloudWatch.

---

## Amazon Q + Lambda: Inline Code Suggestions

> **Within the Lambda console's code editor, Amazon Q can provide auto-suggested code as you type** — writing a comment describing the desired function (e.g. "write a Lambda function to stop an EC2 instance") and pressing Tab accepts an AI-generated implementation, without needing to leave the editor or write the logic by hand.

**Demonstrated in the source lecture**: a commented instruction produces a working Python function using Boto3 to stop an EC2 instance — the same underlying pattern as the manually-written EC2-automation script from the earlier Lambda topics, just generated rather than typed. ⚠️ **The same practical gotchas still apply** — the instance ID must still be filled in, and the default 3-second timeout still needs to be increased, regardless of whether the code was hand-written or AI-generated.

---

## Exam Framing

> This content is included for practical/productivity context rather than direct exam testing — but if a scenario question does distinguish "AI chatbot" from "AI agent with AWS integration that can take action," the agent framing (inspect real resources, execute changes, not just suggest) is the key concept to recognize.
`,
    },
    {
      id: "lambda-execution-environment",
      title: "Lambda Execution Environment – Cold Starts, Warm Starts, and Netflix-Scale Auto-Scaling",
      shortDesc: "Worked through Rohan opening Netflix — containers spun up on demand, reused when warm, and scaled to a thousand at once with zero manual provisioning",
      visuals: ["ExecutionEnvironment3D"],
      content: `## The Netflix Problem: Personalized Recommendations at Massive Scale

> **Netflix delivers personalized recommendations to millions of users every second** — the challenge is processing millions of real-time requests, scaling dynamically during peak hours, keeping infrastructure cost down, and maintaining ultra-low latency, all simultaneously. Lambda is the mechanism that makes this economically and technically feasible.

---

## Worked Example: Rohan Opens Netflix

1. **Rohan opens the Netflix app** — this triggers a recommendation request.
2. **Netflix's backend sends the request to API Gateway**, which triggers a Lambda function.
3. **AWS Lambda creates an execution environment (a container)** to process the request — ⚠️ **no resources are pre-provisioned; the container is created on demand**, the moment it's actually needed.

---

## What's Inside a Container (Briefly)

> **A container is a lightweight virtual machine** — much faster to spin up than a full VM, since it doesn't carry the same overhead. Creating a container for a Lambda invocation involves: **allocating compute resources** (CPU, memory, networking), **initializing the runtime** (Python, Java, Node.js — whatever the function's language is), and **injecting the code and its dependencies.** All of this happens automatically — Netflix never manually allocates or manages any of it.

---

## ⚠️ Cold Start vs Warm Start

> **Cold start**: the FIRST request for a given execution path has no existing container to reuse — Lambda must spin up a brand-new one from scratch (allocate resources → initialize runtime → inject code). This adds **roughly 100–300ms of extra latency** compared to a request hitting an already-warm container.

> **Warm start**: a SUBSEQUENT request reuses an execution environment that's still alive from a recent invocation — no setup delay, response in milliseconds. **Worked example**: Rohan's first Netflix open of the day is a cold start (new container created); if Rohan browses to another recommendation shortly after, that request reuses the same still-live container — a warm start, with no added delay.

---

## How Lambda Scales for Netflix-Level Traffic

> **AWS Lambda scales by launching additional containers, automatically, whenever existing ones are busy.** A worked capacity comparison from the source lecture: roughly **50 containers active during a low-traffic afternoon** vs **500 containers active during India's 8 PM peak viewing hour** — Netflix never manually provisions or manages any of this scaling. ⚠️ **1,000 simultaneous recommendation requests means Lambda creates roughly 1,000 execution environments**, with no delay and no bottleneck, since nothing needs to be pre-provisioned. Idle containers are automatically removed during low-traffic periods, directly reducing cost when demand drops.

---

## ⚠️ Three Ways to Reduce Cold Starts

**1. Provisioned Concurrency** — a set number of "pre-warmed" containers are kept running at all times, ready to serve the very first request instantly (covered in depth in its own topic).

**2. More memory/CPU allocation** — a container with more allocated resources spins up somewhat faster, reducing (but not eliminating) the cold-start delay.

**3. Lambda Layers** — preloading large dependencies (e.g. an ML model) via a layer means the container doesn't have to load them fresh on every cold start (covered in depth in its own topic).

---

## Exam Framing

> "First request to an idle Lambda function experiences noticeably higher latency than subsequent requests" → **cold start**, the direct result of container creation overhead (resource allocation + runtime init + code injection). "Massive, instant scale-out with zero manual server provisioning" → the core value proposition of Lambda's container-based execution model, exactly what makes it viable for Netflix-scale, bursty, unpredictable traffic.
`,
    },
    {
      id: "lambda-versions",
      title: "Lambda Versions – Immutable Snapshots for Safe Rollback",
      shortDesc: "Publishing a version freezes the code as read-only — $LATEST keeps changing, but v1/v2/v3 never do",
      visuals: [],
      content: `## Why Versioning Exists

> **Publishing a Lambda version creates an immutable, read-only snapshot of the function's code at that exact moment** — enabling safe rollback if a later change breaks something. Without versioning, every deploy simply overwrites the function's current code, with no way to cleanly return to an earlier working state.

---

## $LATEST vs Published Versions

> ⚠️ **$LATEST is the function's always-editable working copy** — every time code is edited and deployed, $LATEST changes. **A published version is a frozen snapshot of $LATEST at the moment of publishing** — version numbers increment automatically (v1, v2, v3...), and once published, that version's code **cannot be edited again.**

**Demonstrated directly**: attempting to edit the code while viewing an already-published version (e.g. v1) is blocked — the editor reports it's read-only. To make further changes, editing has to happen back on **$LATEST** (the main, unversioned function), and a **new** version must be published to snapshot that change.

---

## The Publish-and-Roll-Forward Workflow

1. Write and test code on $LATEST.
2. Once satisfied, **Versions → Publish new version** (optionally adding a description) — this freezes the current $LATEST state as, say, v1.
3. Continue editing $LATEST for the next change; test it.
4. Publish again → v2 is created, capturing that next state. v1 remains untouched and fully intact.
5. Repeat for v3, v4, and so on — each publish creates a new, permanent, read-only snapshot.

⚠️ **Switching back to test any earlier version (v1, v2, etc.) is always possible** — nothing about publishing v3 affects v1 or v2's code. This is exactly what makes rollback safe: a broken v3 doesn't corrupt or overwrite the last known-good version.

---

## Exam Framing

> "Need to safely test a code change while retaining the ability to instantly roll back to the previous working version" → **publish a version before making the change.** Remember: **$LATEST is the only ever-editable state; every published version (v1, v2, v3...) is permanently frozen the moment it's published.** This distinction is the direct prerequisite for understanding Aliases (covered next) and Provisioned Concurrency, both of which require targeting a specific published version rather than the constantly-changing $LATEST.
`,
    },
    {
      id: "lambda-aliases",
      title: "Lambda Aliases – A Named Pointer That Lets You Switch Versions Without Changing the Trigger URL",
      shortDesc: "The whole point: an API Gateway URL embedded in external code can't be changed on every deploy — an alias makes the version behind it swappable instead",
      visuals: ["VersionsAliases"],
      content: `## The Problem an Alias Solves

> ⚠️ **A function's trigger — say, an API Gateway URL — always points at whatever version it was created against, by default $LATEST.** Directly triggering a function's URL always invokes the **latest** version, with no way to redirect it to an older one without literally recreating the trigger.

**Why this is a real problem**: an API Gateway URL is typically **embedded in other code or systems** (a website's JavaScript, a mobile app, another service). ⚠️ **Changing that URL every time a rollback or version switch is needed is completely impractical** — every consumer of that URL would need to be updated too.

---

## What an Alias Actually Is

> **An alias is a named pointer (e.g. "prod") that targets a specific version** — a trigger (like an API Gateway URL) can be built **against the alias itself, rather than against a specific version directly.** Since the alias's target version can be changed independently, the URL consumers actually hit **never has to change** — only what the alias points to changes.

---

## Setting Up an Alias-Based Trigger

1. **Function → Aliases → Create alias.** Name it (e.g. "prod"), and select which version it should point to (e.g. the latest published version).
2. Go to the **alias itself** (not the base function) and add a trigger there — e.g. a **new** API Gateway URL created specifically for that alias (⚠️ **distinct from any URL created directly on the base function** — they are two separate trigger setups, even if they currently return identical results).
3. Consumers use the **alias's URL.**

---

## Switching Versions Without Changing the URL

> **To roll back or advance, edit the alias's target version** — Aliases → select alias → Edit → change the pointed-to version → Save. ⚠️ **The API Gateway URL itself never changes** — only the version the alias resolves to changes, meaning every existing consumer automatically starts hitting the new target version on their very next request, with zero code changes on their end.

---

## Weighted Aliases: Canary and Blue/Green Deployments

> **An alias can split traffic between TWO versions by percentage weight** — e.g. 50% of requests to version 2, 50% to version 3. This is exactly the mechanism behind **canary deployments** (gradually shifting traffic to a new version while monitoring for problems) and **blue/green deployments** (running two versions side by side during a controlled cutover).

**Demonstrated directly**: setting a 50/50 weight between two versions on the same alias, then refreshing the trigger URL repeatedly, shows responses alternating between both versions' outputs — proving traffic really is being split at the alias level, invisibly to anyone hitting the single stable URL.

---

## Exam Framing

> "Need to switch which Lambda version a live trigger points to, without changing the trigger's URL/ARN" → **Alias.** "Need to gradually shift a percentage of production traffic from one Lambda version to another" → **weighted alias**, the mechanism underlying canary and blue/green deployment patterns for Lambda specifically. Aliases and Versions work as a pair: **Versions provide immutable rollback targets; Aliases provide a stable pointer that can be redirected between those targets.**
`,
    },
    {
      id: "lambda-concurrency",
      title: "Lambda Concurrency – How Many Requests Run at Once, and the 1,000-Per-Region Limit",
      shortDesc: "Worked through 10 sequential triggers reusing only 6 execution environments — plus the formula that turns request-rate into a concurrency number",
      visuals: ["Concurrency"],
      content: `## What Concurrency Means

> **Concurrency is how many requests a Lambda function can handle at the same time.** Each simultaneous request that can't reuse an existing free execution environment causes a new one to be created — if 500 users trigger a function at once, Lambda creates up to 500 execution environments.

---

## ⚠️ The Default Limit: 1,000 Per Region, Per Account

> **Every AWS account has a default concurrency quota of 1,000 concurrent execution environments per region** — ⚠️ **shared across ALL Lambda functions in that account/region**, not a separate 1,000 for each function. Exceeding it produces the classic **"429 TooManyRequestsException"** throttling error — a specific error message worth memorizing, since it has appeared directly in exam questions.

---

## Worked Example: 10 Triggers, Only 6 Environments

**From AWS's own visualization (referenced directly in the source lecture)**: triggering a function 10 times in sequence, watching how environments get created vs reused:

- Trigger 1 → creates environment **A** (busy)
- Trigger 2 → A is busy → creates environment **B**
- Trigger 3 → A, B busy → creates environment **C**
- Triggers 4, 5 → similarly create **D**, **E**
- Trigger 6 → environment **A** has since become free → **reuses A** (a warm start) instead of creating a new one
- Triggers 7, 8 → reuse B, then C similarly
- Trigger 9 → all existing environments busy again → creates a **new** one (**F**)
- Trigger 10 → an earlier environment has freed up → reused again

⚠️ **Across all 10 triggers, only 6 execution environments were ever created total** — because Lambda aggressively reuses any environment that's free, rather than creating a fresh one for every single invocation. This is exactly why concurrency ≠ total invocation count.

---

## The Concurrency Formula

> **Concurrency = requests per second × duration per request (in seconds).**

Worked examples:
- 50 requests/sec, 2 seconds each → 50 × 2 = **100 concurrency** — comfortably under the 1,000 limit.
- 1,000 requests/sec, 2 seconds each → 1,000 × 2 = **2,000 concurrency** — ⚠️ **exceeds the 1,000 default limit**, and would need active management (see below) to avoid throttling.

---

## How Large Companies Handle the Default Limit

**1. Request a higher limit** — companies like Netflix (or any AWS customer) can submit a support request to raise the 1,000 quota.

**2. Use multiple accounts and/or regions** — since the 1,000 limit is scoped per-account-per-region, spreading load across multiple accounts or regions effectively multiplies available concurrency (at the cost of added architectural complexity, e.g. load balancing across accounts).

**3. Provisioned Concurrency** — covered in its own topic; pre-warms environments to eliminate cold-start delay for critical functions specifically.

---

## Exam Framing

> "Concurrency = requests/sec × duration(sec)" is a direct, testable formula. Remember the **"429 TooManyRequestsException"** error is the specific symptom of exceeding the account's concurrency limit, and that the 1,000 default is shared across every function in the account/region — not per-function.
`,
    },
    {
      id: "lambda-reserved-concurrency",
      title: "Lambda Reserved Concurrency – Protecting a Critical Function From Being Starved",
      shortDesc: "A 3-function e-commerce worked example — place-order vs email vs reports — and the exact minimum-40 rule that blocks over-reserving",
      visuals: ["ReservedConcurrency"],
      content: `## The Problem: Shared Concurrency Can Starve a Critical Function

> **All functions in an AWS account/region share the same concurrency pool** — if one or two functions consume most of it, a different, more critical function can be left with too little concurrency to handle its own load, even though the account hasn't hit its overall limit.

---

## Worked Example: A 3-Function E-Commerce Account

- **Function A — Place Order** (⚠️ **highly critical**): handles user purchases and payments. If this fails or slows down, the business loses money and customer trust directly.
- **Function B — Confirmation Email** (moderately critical): important, but a short delay is tolerable.
- **Function C — Generate Admin Report** (not urgent): runs hourly, purely internal, no customer-facing impact if delayed.

**The account's concurrency limit in this example is 400** (⚠️ **new/lower-usage AWS accounts often start with a soft limit below the 1,000 default — visible and increasable via the Service Quotas console**, not always the full 1,000 out of the box).

---

## The Problem, Demonstrated

> **At month-end, Function C (reports) and Function B (emails) both spike simultaneously**, together consuming **350 of the account's 400 concurrency slots** — leaving only **50** for Function A. ⚠️ **If Function A (Place Order) can't get enough concurrency during this spike, customers experience delays or errors trying to check out — directly costing revenue and trust**, exactly the outcome the business can least afford.

---

## The Solution: Reserve Concurrency for the Critical Function

> **Reserved concurrency guarantees (and caps) a fixed slice of the account's total for one specific function — at no additional charge.** Configuring Function A with **300 reserved concurrency** means Function A **always** has 300 execution environments available, **even if B and C are completely overloaded — they cannot touch those 300.** The remaining 100 (400 total − 300 reserved) is shared between B and C.

---

## ⚠️ The Minimum-40 Rule

> **AWS will not let the account's unreserved concurrency pool drop below 40.** Demonstrated directly: attempting to reserve 70 for Function B (leaving only 30 unreserved, when 40 is the floor) is **rejected** — the maximum reservable in that scenario is **60**, since that's the largest number that still leaves at least 40 unreserved. ⚠️ **This 40-minimum floor is a hard platform constraint, not a configurable setting** — it exists specifically so that at least some concurrency always remains available to functions without their own reservation.

---

## Exam Framing

> "One critical function must never be starved of capacity by other, less critical functions sharing the same account" → **Reserved Concurrency** — free to configure, guarantees a fixed slice, and cannot be encroached upon by other functions. Remember the **40-unit unreserved-pool floor** as a specific, testable numeric constraint on how aggressively concurrency can be reserved.
`,
    },
    {
      id: "lambda-provisioned-concurrency-lab",
      title: "Provisioned Concurrency Lab – Eliminating Cold Starts for Critical Functions",
      shortDesc: "Pre-warmed environments that sit ready and waiting — but only against a version or alias, never $LATEST, and billed whether used or not",
      visuals: ["ProvisionedConcurrency"],
      content: `## On-Demand vs Provisioned Concurrency

> **On-Demand concurrency (the default)**: execution environments are created only when a request actually arrives. If no free environment exists, a new one is spun up — introducing the cold-start delay covered in the Execution Environment topic.

> **Provisioned Concurrency**: a defined number of execution environments are **pre-initialized in advance** and kept active, ready, and warm — ⚠️ **eliminating cold starts entirely for requests that land within the provisioned capacity**, since there's never a "create a new environment" step in the critical path.

---

## ⚠️ Prerequisite: A Version or Alias Is Required

> **Provisioned Concurrency cannot be configured against $LATEST.** Since $LATEST keeps changing with every deploy, AWS has no stable target to keep pre-warmed. **A published version (or, more commonly, an alias pointing to one) must exist first.**

---

## Setting It Up

1. **Publish a version** of the function (e.g. v2).
2. **(Recommended) Create an alias** (e.g. "prod") pointing to that version — provisioning against an alias is the more common real-world pattern, since aliases are what triggers typically target.
3. Go to the **alias's configuration → Provisioned Concurrency → Edit**, and specify the number of environments to keep warm (e.g. 5).
4. Provisioning takes a few minutes to complete (status shows "In progress" until ready) — once active, up to that many requests get zero-cold-start responses.

---

## ⚠️ Three Exam-Critical Rules

**1. Provisioned Concurrency counts against the account's overall concurrency quota.** Provisioning 5 environments against a 1,000-limit account leaves **995** available for everything else.

**2. It's billed whether used or not.** ⚠️ **Payment is per provisioned instance per minute, regardless of actual invocation volume** — 5 provisioned environments are billed continuously, even during periods with zero traffic.

**3. Monitor via two specific CloudWatch metrics**: **Throttles** (signals insufficient available concurrency — including provisioned) and **ProvisionedConcurrencyUtilization** (shows how much of the paid-for provisioned capacity is actually being used, directly informing whether the provisioned number should be adjusted).

---

## Exam Framing

> "Eliminate cold starts for a latency-sensitive, critical function" → **Provisioned Concurrency**, but ⚠️ **only after establishing a version or alias** — a scenario asking to set this up directly on $LATEST is testing exactly this prerequisite. Remember it's a continuously-billed resource (per-instance, per-minute) and counts against the same 1,000-per-region quota as regular concurrency.
`,
    },
    {
      id: "lambda-layers",
      title: "Lambda Layers – Separating Libraries From Function Code",
      shortDesc: "Worked through random (built-in, just works) vs emoji (not built-in, ModuleNotFoundError) — and why packaging a library WITH every function doesn't scale",
      visuals: ["LambdaLayers"],
      content: `## Module and Library: The Prerequisite Concept

> **A module or library is a collection of reusable code that can be imported into a program** — code reuse, so the same logic doesn't need to be rewritten every time. A **module** is typically a single file of reusable code; a **library** is a collection of modules. Python's Boto3 (AWS's own SDK, covered in earlier Lambda topics) is a concrete example of a widely-used library.

⚠️ **Some libraries are built into the Lambda runtime by default (e.g. Python's random, or Boto3 itself); others are NOT (e.g. requests, pandas, emoji)** — using a non-built-in library requires making it available to the function somehow.

---

## Worked Example 1: A Built-In Library (random) — No Extra Steps

A simple function using Python's random module (generating a number 1–10) can be pasted directly into the Lambda console and deployed with **zero extra configuration** — since random is part of Python's standard library, it's already present in the Lambda execution environment. No packaging, no layers, no errors.

## Worked Example 2: A Non-Built-In Library (emoji) — Fails Without Help

The same pattern with Python's **emoji** library (used to render text codes like "check mark button" as an actual emoji character) **fails immediately** when deployed as-is — ⚠️ **"No module named emoji found" / ModuleNotFoundError** — because emoji is not part of Lambda's built-in standard library, unlike random.

---

## Two Ways to Provide a Non-Built-In Library

### Option 1: Package the Library With Every Function (Not Recommended)

1. Install the library **locally**.
2. Zip it together **with the function's code.**
3. Upload the combined zip as the function.

⚠️ **The drawback**: this must be repeated **separately for every function** that needs the library, and **updating the library later means repackaging and re-uploading every single function that uses it** — a repetitive, error-prone, hard-to-maintain pattern as the number of functions grows.

### Option 2: Lambda Layers (The Smart Way)

1. Install the library locally.
2. Zip **only the library** — NOT the function code.
3. Upload that zip as a **Lambda Layer** (a separate, standalone resource).
4. **Attach the layer to any function(s) that need it** — a one-time setup per function, reusable indefinitely.

**Advantages**: **reusability** (one layer, attached to many functions), **clean separation** (code and library are never bundled together), **easier maintenance** (updating the layer once updates it for every attached function automatically), and **faster deployment** (function code stays small and quick to upload — especially valuable for genuinely large libraries like pandas or OpenCV, which would otherwise bloat every single function's deployment package).

---

## Exam Framing

> "A function needs the same third-party library as several other functions, and that library needs to stay easy to update across all of them" → **Lambda Layers**, specifically because updating a layer once propagates to every attached function — the direct opposite of the repackage-every-function drawback of bundling the library with each function individually.
`,
    },
    {
      id: "lambda-layers-lab",
      title: "Lambda Layers Lab – Fixing a ModuleNotFoundError With a Custom Layer via CloudShell",
      shortDesc: "Reproduce the emoji-import failure, then build and attach a layer using CloudShell so the fix works the same regardless of the student's local OS",
      visuals: [],
      content: `## Step 1 — Reproduce the Failure

1. Create a function (e.g. "emoji-function") in Python, using code that includes \`import emoji\`.
2. Deploy and test it — ⚠️ **this fails as expected**, with "Unable to import module... No module named emoji found," confirming the library genuinely isn't available by default.

---

## Step 2 — Build the Layer Zip Using CloudShell

> **CloudShell is used specifically to avoid OS-specific setup differences** — students on Windows, Linux, or macOS all get an identical Linux environment with Python pre-installed, so the packaging steps are identical for everyone.

1. Open **AWS CloudShell** from the console.
2. Create the required directory structure: a top-level folder (e.g. "emoji_layer"), containing a **python** subfolder — ⚠️ **this exact "python" folder name is required by Lambda's layer convention**, not an arbitrary choice.
3. Change into the python directory and install the library there: \`pip3 install emoji -t .\` — this installs emoji's files directly into the current folder rather than system-wide.
4. Go back up one level and **zip the python folder** — e.g. producing "emoji_layer.zip", which now contains only the library, matching the Lambda Layers pattern from the concept topic.

---

## Step 3 — Download and Upload the Layer

5. Use CloudShell's **Actions → Download file** feature, entering the zip's full path, to bring it down to a local machine.
6. In the Lambda console, go to **Layers → Create layer**, name it (e.g. "emoji_layers"), upload the zip file, optionally specify a compatible runtime (e.g. Python 3.9), and create it.

---

## Step 4 — Attach the Layer and Retest

7. Go back to the function → **Code → scroll to Layers → Add a layer → Custom layers** → select the newly-created layer and its version → Add.
8. **Retest the function** — ⚠️ **it now succeeds**, producing the expected emoji output, proving the library is now available through the layer rather than through any change to the function's own code.

---

## Why This Matters Going Forward

> **The layer is created once and can be attached to any number of future functions needing the same library** — this lab's real payoff isn't just fixing one function, it's establishing a reusable resource that eliminates repeating this entire process for every future function needing emoji (or any other non-built-in library packaged the same way).

---

## Exam Framing

> The exact CloudShell mechanics (directory structure, pip install with -t ., zip, download, create layer, attach) are less likely to be tested directly than the **conceptual workflow**: install locally → package library-only into a zip → create a Lambda Layer resource from it → attach to the function(s) that need it. The ⚠️ **required "python" subfolder naming convention** is a concrete, memorable detail if a scenario tests layer packaging specifics.
`,
    },
    {
      id: "lambda-vpc-connectivity",
      title: "Lambda VPC Connectivity – Reaching Private Resources at the Cost of Default Internet Access",
      shortDesc: "By default Lambda has full internet but zero access to private-subnet resources — attaching it to a VPC flips both of those, unless you add a NAT Gateway or VPC Endpoint back",
      visuals: ["LambdaVPC"],
      content: `## The Default: Full Internet, No Private-Subnet Access

> **By default, a Lambda function runs OUTSIDE any VPC**, on AWS-managed infrastructure with full internet connectivity. This means it can freely reach publicly-accessible AWS services like **S3 and DynamoDB** (both reachable over the internet) — but ⚠️ **it CANNOT reach resources sitting inside a VPC's private subnet** — an RDS instance, an EC2 instance, or an ElastiCache cluster with no inbound internet connectivity, exactly the deployment pattern those services normally use for security.

**The same is also true in reverse** — an EC2 instance in a private subnet cannot reach a Lambda function either, since the private subnet has no internet path to Lambda's managed infrastructure.

---

## The Fix: Attach Lambda to a VPC

> **Configuring a VPC connection for a Lambda function (Configuration → VPC → Edit)** — selecting the target VPC and the specific private subnet(s) where the target resources live — gives the function network access to those private resources.

**What happens mechanically**: AWS creates an **ENI (Elastic Network Interface)** for the Lambda function, attached to the selected subnet, with a **private IP address** from that subnet's range. The function is now a genuine network participant inside that private subnet, able to reach anything else there.

---

## ⚠️ The Trade-Off: Losing Default Internet Access

> **The moment Lambda attaches to a VPC, it disconnects from AWS's managed network and its automatic internet access** — it now only has whatever internet connectivity the chosen subnet itself provides. Since a private subnet typically has **no inbound** internet access and, unless explicitly configured, **no outbound** either, a VPC-attached Lambda can lose internet access entirely if nothing further is done.

**Two ways to restore internet-adjacent access, each for a different need**:

- **NAT Gateway** — restores general **outbound** internet access (the same pattern private EC2 instances use) — needed if the function must reach external services over the internet.
- **VPC Endpoint** — provides access to a **specific AWS service** (e.g. S3, DynamoDB) **without any general internet access at all** — the more security-scoped option when the only need is reaching particular AWS services, not the open internet.

---

## ⚠️ Security Group for the Lambda ENI (Frequently Tested)

> **Attaching Lambda to a VPC requires a Security Group on its ENI**, functioning exactly like a firewall for the function's network traffic. ⚠️ **The direction of the required rule depends on which side initiates the connection**: if Lambda is calling OUT to a database or EC2 instance, an **outbound** rule is needed; if an EC2 instance is calling INTO the Lambda function, an **inbound** rule is needed on Lambda's side. The specific port depends entirely on the target application/service.

---

## Exam Framing

> "Lambda function needs to access an RDS instance / EC2 instance / ElastiCache cluster in a private subnet" → **attach Lambda to the VPC**, creating an ENI in that subnet. "That same VPC-attached Lambda also needs general internet access" → **add a NAT Gateway.** "That Lambda only needs to reach specific AWS services (S3, DynamoDB), not the open internet" → **use a VPC Endpoint instead**, the more restrictive and secure choice. The **security-group-direction** question (inbound vs outbound, based on who initiates) is explicitly flagged by the source lecture as previously tested on the real exam.
`,
    },
    {
      id: "ecs-prereq-the-problem",
      title: "Why Containers Exist – Leo's Single-Point-of-Failure Story",
      shortDesc: "Leo hosts three apps on one EC2 instance to save money — a marketing spike in one app takes all three down at once",
      visuals: ["LeoStory"],
      content: `## The Setup: Two Characters

> **This series teaches ECS through storytelling** — two recurring characters: **Leo**, a startup founder and hands-on builder (fast-moving, curious, sometimes skips best practices), and **Ray**, an experienced cloud architect and mentor (methodical, best-practices-first). Leo represents the learner asking the questions; Ray represents the AWS-recommended, correct way of doing things.

---

## Leo's Setup: Two Apps, One EC2 Instance

> Leo runs an ed-tech startup with two applications: a **learner portal (LMS)** — where students watch videos, download PDFs, and write code — and a **support app**, for handling student issues. ⚠️ **To save money, Leo hosts BOTH applications on a single EC2 instance.**

---

## The Mistake: Adding a Third App to the Same Instance

> As the business grows, Leo's team builds a new **enrollment portal** for marketing-driven signups. ⚠️ **Instead of provisioning a new server, Leo deploys this third app onto the SAME existing EC2 instance** — reasoning that it "wouldn't cause an issue."

---

## The Crash

> **A marketing campaign drives a traffic spike to the enrollment app**, which starts consuming disproportionate memory/CPU. ⚠️ **Because all three apps share the same instance with no resource boundary between them, the enrollment app's spike drags down the ENTIRE EC2 instance — crashing all three applications simultaneously.** Existing students lose LMS access, the support team can't log in to help them, and the enrollment app itself goes down too — the exact traffic surge it was built to handle becomes the thing that kills it.

---

## Ray's Diagnosis and First Fix

> **Ray's core lesson: isolate workloads so that one application's problem can't take down unrelated applications.** The real-world pattern this reflects: production environments typically run separate servers for separate concerns (database server, application server, email server, etc.) — specifically to prevent exactly this kind of cascading failure.

**Ray's immediate advice**: isolate the enrollment app onto its **own, separate EC2 instance.** But this reveals the next problem — since EC2 instances are virtual machines, Leo has to **manually recreate the entire environment from scratch**: correct OS, correct Java version, correct application server configuration (Tomcat/Spring Boot), matching environment variables and paths. ⚠️ **Getting this identical setup right is slow and error-prone** — exactly the pain point that motivates the rest of this prerequisite series: is there a faster, more reliable way to isolate workloads than spinning up a full new virtual machine every time?

---

## Exam Framing

> This narrative sets up the core motivating question behind containers, Docker, and eventually ECS: **how do you isolate workloads from each other without paying the full cost (in time, complexity, and resources) of a brand-new virtual machine for every single one?** Every subsequent topic in this prerequisite cluster builds toward answering that question.
`,
    },
    {
      id: "ecs-prereq-os-architecture",
      title: "How an Operating System Actually Works – Kernel and Application Layer",
      shortDesc: "Applications never touch hardware directly — every request passes through the application layer, then the kernel, then finally the hardware",
      visuals: ["OSArchitecture"],
      content: `## Why This Foundation Matters

> ⚠️ **Understanding containers and their real difference from virtual machines requires first understanding operating system architecture** — specifically, how an application actually reaches hardware. Skipping this foundation makes the container-vs-VM distinction impossible to reason about clearly, rather than just memorize.

---

## Four Hardware Components

> **Every computer — laptop, desktop, or server — is fundamentally CPU, RAM, disk, and network.** Humans (and applications) can't communicate with this hardware directly — that's exactly what an operating system exists to mediate.

---

## The Two Core OS Components

**1. Kernel** — ⚠️ **the core part of the OS that directly communicates with and manages hardware.** No application, no matter what it is, ever talks to hardware directly — every hardware interaction is mediated by the kernel.

**2. Application Layer** — sits between applications and the kernel, providing **standard libraries, APIs, and services** that applications use to make requests. ⚠️ **Without the application layer, every application would need to handle raw, complex system calls to the kernel directly** — making development dramatically more complicated and less safe. The application layer is what makes writing ordinary applications tractable.

---

## The Communication Flow

> **Application → Application Layer → Kernel → Hardware.**

**Worked example**: a MySQL server wanting to read from disk cannot touch the disk directly — it issues a request through the application layer, which is forwarded to the kernel, which is the only component that actually interacts with the physical hardware to fulfill it (reading a file, writing data, sending something over the network, allocating memory). ⚠️ **The application never directly interacts with hardware, ever — the kernel handles everything through this managed, mediated access.**

---

## Exam Framing

> This kernel/application-layer split is the exact mechanism containers exploit: a container **shares its host's kernel** while getting its own isolated application layer — versus a virtual machine, which duplicates BOTH components (its own full kernel and its own full application layer) inside every single VM. Understanding this distinction now is what makes the "why are containers lighter than VMs" answer, covered in the next topics, actually make sense rather than being a memorized fact.
`,
    },
    {
      id: "ecs-prereq-how-vms-work",
      title: "How Virtual Machines Actually Work – Hypervisor, vCPU, vRAM, and Isolation",
      shortDesc: "One physical server, three isolated guest OSes — each thinking it has its own dedicated hardware, enforced entirely by the hypervisor",
      visuals: ["VMvsContainer3D"],
      content: `## Before Virtualization: One Physical Server, One OS

> ⚠️ **A single physical machine can only run ONE operating system directly.** Wanting Leo's three apps (LMS, support, enrollment) fully isolated from each other, in the pre-virtualization world, meant **purchasing three separate physical servers** — expensive to buy, expensive to run (electricity, maintenance contracts), and operationally heavier to manage.

---

## Virtual Machines Solve This — Step by Step

**Step 1 — Physical hardware.** Virtual machines always ultimately run on top of real physical hardware (CPU, RAM, storage, network) — there's no virtualization "in the air," it's always hosted somewhere physical underneath.

**Step 2 — Install a hypervisor.** ⚠️ **A hypervisor is software that allows multiple virtual machines to run on one physical server.** Installed directly on bare metal (a "Type 1" hypervisor — the type relevant here, as opposed to "Type 2" hypervisors like Oracle VirtualBox that run atop an existing OS). Real examples: **VMware ESXi** (VMware, released ~2000), **Hyper-V** (Microsoft), and AWS's own **Xen/Nitro-based virtualization** underlying EC2.

**Step 3 — Create virtual machines via the hypervisor.** The hypervisor provides each VM with **virtual CPU (vCPU), virtual RAM, virtual disk, and virtual network** — carved out of the real physical resources it controls. ⚠️ **Each VM believes it has its own dedicated hardware, even though it's actually a slice of shared physical resources** — e.g. assigning 2GB of a physical server's 8GB RAM to one VM means that VM operates as if it has exactly 2GB total, with no visibility into (or ability to exceed) the rest.

**Step 4 — Install a guest OS inside each VM.** ⚠️ **There is no difference between an OS installed on physical hardware and one installed inside a VM — the same ISO image, the same installation process.** Each VM gets its own **full kernel and full application layer**, exactly like a standalone physical machine would.

---

## Genuine Isolation, Despite Shared Hardware

> **Every kernel request for hardware access is mediated by the hypervisor**, not granted directly. This is exactly what makes isolation real: if the enrollment app's VM tries to consume excessive resources, it's capped at whatever was allocated to it during VM creation — ⚠️ **it CANNOT starve the LMS or support app VMs of their own allocated resources**, even though all three ultimately share the same underlying physical CPU/RAM/disk. If one VM crashes internally, the others are unaffected — solving exactly the single-point-of-failure problem from the opening story.

---

## Exam Framing

> "Multiple isolated operating systems sharing one physical server, each with its own full kernel and application layer, mediated by a hypervisor" → **virtual machines.** Remember the specific mechanism of isolation: **the hypervisor enforces the resource caps assigned at VM creation time** — that's what prevents one VM's runaway resource usage from affecting any other VM on the same host.
`,
    },
    {
      id: "ecs-prereq-vm-limitations",
      title: "Virtual Machine Limitations – The Five Pain Points That Led to Containers",
      shortDesc: "Every VM still carries a full OS — heavy resource use, slow boot, bulky images, complex patching, and low density, all traced back to the same root cause",
      visuals: ["VMLimitations"],
      content: `## Physical vs Virtual: Differences and Similarities First

**Differences**: a physical machine can only run ONE operating system, with no hypervisor involved — the kernel has direct, exclusive control over the CPU/RAM/disk. A virtual machine setup adds a hypervisor between the hardware and multiple guest operating systems, each with its own kernel and application layer sliced from the shared physical resources.

**Similarities**: both a physical machine and a VM have a **full operating system** (kernel + application layer), both run applications safely on top of that OS, and both feel like a genuinely independent, complete server to whoever is using them.

---

## Why Virtualization Was a Genuine Revolution

> **Before virtualization**: one physical server = one operating system = a huge amount of wasted compute capacity, since most workloads don't need 100% of a dedicated server's resources. **After virtualization**: one physical server can run multiple VMs, using hardware efficiently, avoiding the cost of purchasing multiple physical servers, and enabling easy creation/destruction/snapshotting of environments. ⚠️ **This is exactly what gave rise to the cloud** — AWS EC2 (and equivalents on Azure/GCP) are fundamentally virtualization-as-a-service. Widespread production adoption is often dated to **2007**, when VMware released vCenter Server and enterprises began trusting VMs with genuine production workloads.

---

## ⚠️ Five Limitations That Emerged With Wide VM Adoption

**1. Heavy resource consumption.** ⚠️ **Every VM runs its own full operating system, with its own kernel and application layer** — even a tiny microservice still pays the overhead cost of an entire OS underneath it, consuming meaningful memory, CPU, and storage just to exist.

**2. Slow boot time.** Starting a VM means booting a full operating system from scratch — typically **1–2 minutes.** In an auto-scaling context (needing new capacity *right now* during a traffic spike), this delay is a real operational cost.

**3. Portability issues.** A full guest OS image is genuinely large — **4–5GB for a minimal Linux install without a GUI, ~20GB+ for Windows.** ⚠️ **Moving these bulky images between systems is slow and impractical**, directly because of the full-OS overhead baked into every VM image.

**4. Complex management.** A full OS inside every VM means a full OS's worth of ongoing maintenance — patching, security updates, version management — multiplied across however many VMs are running.

**5. Limited density.** Since every VM needs its own full OS overhead, a single physical server can only host a limited number of VMs before running out of capacity — ⚠️ **wanting 40 VMs on one server means finding room for 40 full operating systems**, which is rarely practical.

---

## The Common Thread

> **Every single one of these five limitations traces back to the exact same root cause: each VM carries a complete, full-weight operating system.** This is precisely the problem containers were built to solve — by sharing the host's kernel instead of duplicating it in every isolated unit, eliminating most of this overhead while still providing meaningful isolation. That mechanism is covered in full in the next topic.

---

## Exam Framing

> "Why is a container lighter-weight than a virtual machine, specifically?" → **because a VM duplicates a full OS (kernel + application layer) per instance, while a container shares the host's kernel** — every one of the five VM limitations here (resource use, boot time, image size, maintenance burden, density) is a direct symptom of that duplicated-OS overhead, not five unrelated problems.
`,
    },
    {
      id: "ecs-prereq-what-is-container",
      title: "What Is a Container – Sharing the Kernel Instead of the Hardware",
      shortDesc: "Same isolation as a VM, minus the duplicated kernel — that's the entire reason a container is lightweight and a VM isn't",
      visuals: ["VMvsContainer3D"],
      content: `## Recap: Where the Story Left Off

> Leo's three apps crashed together on one shared EC2 instance. Physical-server isolation (buying 3 servers) works but is expensive. **Virtual machines solve the cost problem** — one physical server, multiple isolated VMs via a hypervisor — but ⚠️ **every VM still carries a full duplicated operating system**, so the overhead problem remains even though the cost problem is solved.

---

## Setting Up a Container Host

> **To use containers, install Docker (the "Docker daemon") directly on top of a normal operating system** (Linux, Windows, or Mac) — running on either a physical machine or a virtual machine, no hypervisor required for Docker itself. **Docker runs inside the OS's application layer, exactly like any other installed application** — and once running, it enables creating containers.

---

## ⚠️ The Core Difference From a VM: No Kernel Inside the Container

> **A virtual machine has BOTH a full kernel and a full application layer inside it.** ⚠️ **A container has ONLY an application layer — it has NO kernel of its own.** Instead, **every container shares the kernel of the host operating system it's running on.**

**This is the entire mechanism behind "containers are lightweight"**: there's no duplicated kernel to install, boot, or maintain per container — just an isolated application layer, layered on top of one shared kernel underneath.

---

## Isolation Is Still Real — Just Enforced Differently

> **Containers still support hard resource limits, exactly like VMs** — e.g. capping a container at 8GB RAM out of a 16GB host means that container genuinely cannot exceed 8GB, since **each container has its own separate application layer** (not shared with other containers) even though the kernel underneath is shared. ⚠️ **One container consuming excessive resources still cannot starve a sibling container** — the isolation guarantee from VMs is preserved, just achieved by isolating the application layer rather than duplicating the entire OS.

---

## Two Names for Two Virtualization Models

> **VMs share HARDWARE, each running a full duplicated OS on top — this is called "hardware virtualization."** **Containers share the KERNEL (part of the OS itself), each running only its own application layer on top — this is called "operating system virtualization."** ⚠️ **This single naming distinction is the cleanest way to remember the core architectural difference** between the two technologies.

---

## Exam Framing

> "Why are containers dramatically lighter and faster to start than virtual machines?" → **containers share the host's kernel instead of each carrying a duplicated one** — isolation is preserved via a separate application layer per container plus hard resource limits, not by duplicating the entire OS. This is the direct mechanical answer beneath every "containers vs VMs" comparison table.
`,
    },
    {
      id: "ecs-prereq-docker-faq-lab",
      title: "Docker FAQ Lab – Building a Docker Host, Pulling Images, and Running Your First Container",
      shortDesc: "Ubuntu's Docker image is 80MB vs a 5.9GB ISO — because it carries no kernel at all, just the application layer",
      visuals: ["DockerLifecycle"],
      content: `## Q1: Is It Complex to Create a Docker Host?

> **No — installing the Docker daemon on any machine (physical or virtual, Linux/Windows/Mac) converts it into a "Docker host."** On Amazon Linux, this is as simple as \`yum install docker\` after logging in as root — a couple minutes, no complex setup.

---

## Q2: Do Containers Use ISO Images Like VMs?

> ⚠️ **No.** A VM's ISO image contains a full operating system (kernel + application layer) — the SAME image used for a physical machine install. A container's image contains **only the application layer** — no kernel, since it borrows the host's. ⚠️ **This is exactly why a Docker image is so much smaller**: an Ubuntu Docker image is roughly **80MB**, versus a full Ubuntu ISO at roughly **5.9GB.**

---

## Q3: Where Do Container Images Come From?

> **Docker Hub (hub.docker.com)** hosts official images for virtually every common OS and application (Ubuntu, nginx, and thousands more) — search for what's needed and pull it directly.

---

## Q4: How Long Does It Take to Create a Container From an Image?

> ⚠️ **About one second** — dramatically faster than a VM's typical 5–10 minute boot, since there's no full OS to install or boot, just an application-layer environment to instantiate.

**Basic workflow**: \`docker pull ubuntu\` (download the image) → \`docker run -it --name c1 ubuntu /bin/bash\` (create and enter a container from it). Exiting with Ctrl+P, Ctrl+Q leaves the container running in the background rather than stopping it.

---

## Q5: Can Containers Be Started, Stopped, and Restarted Like VMs?

> **Yes.** \`docker ps\` shows running containers; \`docker ps -a\` shows all containers including stopped ones. \`docker stop\` / \`docker start\` control state, and \`docker attach\` re-enters a running container.

---

## Q6: How Do You Build a Custom Image With Your Own Application?

> **Manually installing an app inside a running container works, but isn't the recommended pattern** — it mirrors the same manual setup pain that made VM environments slow to recreate. ⚠️ **The correct pattern is building a custom image via a Dockerfile**, so the setup is automated and repeatable.

**Worked example**: a Dockerfile with just two lines — \`FROM nginx\` (use nginx as the base image, since it ships with a web server already configured, unlike a bare Ubuntu image which would need extra setup commands) and a COPY command to bring in a custom \`index.html\` into nginx's web root. Running \`docker build -t myapp .\` produces a custom image with the application baked in.

---

## Q7: How Do You Access a Container From Outside?

> **Publish a port when creating the container** — e.g. \`docker run -d -p 80:80 myapp\` maps requests hitting the Docker host's port 80 through to the container's port 80. With this in place, the application becomes reachable over the internet via the host's public IP (e.g. an EC2 instance's public IP), exactly like a normal web server would be.

**Proof it's really the container serving traffic**: stopping the container (\`docker stop\`) makes the site immediately inaccessible; starting it again immediately restores access — demonstrating the running container, not some separate process, is what's actually serving the page.

---

## Q8: Is a Single Docker Host a Single Point of Failure?

> ⚠️ **Yes — if the Docker host itself goes down (hardware failure, OS crash), every container running on it goes down together**, exactly the same single-point-of-failure risk a single physical/virtual server has. This exact question is what motivates **Container Orchestration**, covered in the next topic.

---

## Exam Framing

> The specific Docker CLI commands here are illustrative, not something the exam tests directly — the conceptual takeaways matter more: **images are small because they carry no kernel; container creation is near-instant because there's no OS to boot; and a Dockerfile is the correct, repeatable way to bake an application into a custom image**, rather than manually configuring a running container by hand.
`,
    },
    {
      id: "ecs-prereq-container-orchestration",
      title: "Container Orchestration – Why Multiple Docker Hosts Need a Captain",
      shortDesc: "Redundant Docker hosts solve the single-point-of-failure problem, but only if something coordinates them — three players on a field with no captain",
      visuals: ["Orchestration"],
      content: `## The Problem: One Docker Host Is a Single Point of Failure

> **If a single Docker host fails, every container running on it fails together** — the same availability risk any single server carries. The obvious fix: **redundancy — run multiple Docker hosts.**

---

## ⚠️ Multiple Docker Hosts Alone Don't Solve This

> **By default, separate Docker hosts don't know about each other.** Networking lets them ping one another, but there's **no coordination**: no shared awareness of what's running where, no automatic failover, no load distribution logic between them.

**Ray's team analogy**: three players standing on a field, ready to play, but **no captain, no strategy, no communication** — each one acts independently, with no teamwork. ⚠️ **This is exactly the state of multiple unmanaged Docker hosts** — technically networked together, but not actually functioning as one coordinated system.

---

## What a Container Orchestrator Does

> **A container orchestrator is the "captain"** — a dedicated system that connects multiple Docker hosts into a coordinated cluster and makes the placement and health decisions a team captain would make for players.

**Specifically, it**:
- **Connects Docker hosts together** into a managed cluster.
- **Distributes containers intelligently** across hosts — deciding which host a given container should run on.
- **Restarts failed containers** automatically.
- **Scales containers** up or down as demand changes (auto-scaling).
- **Acts as the "brain"** coordinating the entire container fleet — including, critically, **moving containers off a failed host onto a surviving one**, which is exactly what solves the original single-point-of-failure problem.

---

## Three Real Orchestrators

> **Docker Swarm, Amazon ECS (Elastic Container Service), and Kubernetes** are the three real-world container orchestrators — each is "a captain," and choosing between them is the subject of the next topic.

---

## Exam Framing

> "Multiple Docker hosts exist, but a host failure still takes down every container on it — how is this solved?" → **container orchestration** — the missing coordination layer that makes multiple hosts behave as one resilient, self-healing cluster rather than a set of independent, uncoordinated machines.
`,
    },
    {
      id: "ecs-prereq-orchestrator-comparison",
      title: "Docker Swarm vs Amazon ECS vs Kubernetes – Choosing the Right Captain",
      shortDesc: "School-level captain, corporate captain, international captain — and why Leo picks ECS specifically because he's already all-in on AWS",
      visuals: ["OrchestratorCompare"],
      content: `## Three Captains, Three Trade-Offs

> **Docker Swarm, Amazon ECS, and Kubernetes are the three mainstream container orchestrators** — each solving the same coordination problem, with different trade-offs in simplicity, AWS integration, and power.

---

## Docker Swarm — "The School-Level Captain"

> **Native to Docker itself, and very easy to set up.** ⚠️ **Lacks advanced features — no auto-scaling, no rollback support** — making it a fit for small teams and learning environments, but weaker for large-scale production use.

---

## Amazon ECS — "The AWS Captain"

> **Fully managed by AWS, with deep native integration into the AWS ecosystem** — Load Balancers, IAM, and the rest of an existing AWS deployment connect naturally. ⚠️ **No control-plane management required** — being a managed service, there's no orchestrator infrastructure of its own to operate.

**The trade-off**: ⚠️ **ECS is AWS-only** — not usable on-premises or on other cloud providers, unlike Kubernetes.

---

## Kubernetes — "The International-Level Captain"

> **The most powerful option — open-source, widely adopted, and runs anywhere**: cloud, on-premises, or hybrid environments. Supports the full set of advanced features (auto-scaling, rollback, complex deployment strategies) needed for genuinely large, complex applications.

**The trade-off**: ⚠️ **complex to set up and manage** — meaningfully more operational overhead than Docker Swarm or ECS. (For AWS users who specifically want Kubernetes without managing its control plane themselves, **Amazon EKS — Elastic Kubernetes Service — is AWS's managed Kubernetes offering**, covered separately after ECS.)

---

## Why Leo Chooses ECS

> **Leo picks ECS for two concrete reasons**: (1) his infrastructure is **already fully on AWS** (EC2, IAM, etc.) — ECS's native integration is a direct fit; (2) his startup is small (three apps) and **doesn't need Kubernetes' advanced feature set or its operational complexity** — ECS gives him managed orchestration without the Kubernetes learning curve.

---

## Exam Framing

> "Simple, Docker-native orchestration for a small team or learning environment" → **Docker Swarm.** "Fully AWS-integrated, managed orchestration, no interest in multi-cloud portability" → **ECS.** "Need the most powerful, portable, feature-complete orchestrator, and complexity is an acceptable trade-off" → **Kubernetes** (or its AWS-managed form, **EKS**, if staying within AWS while still wanting Kubernetes specifically). The AWS-only constraint on ECS, versus Kubernetes/EKS's portability, is the single most commonly tested distinguishing fact here.
`,
    },
    {
      id: "ecs-app-architectures",
      title: "Application Architectures – Monolithic vs Microservices, Worked Through Amazon.in's Scaling Math",
      shortDesc: "Home page scales for 100,000 visitors, Cart for 10,000, Payment for 4,000 — independent scaling is the single biggest reason companies moved to microservices",
      visuals: ["MonolithVsMicroservices"],
      content: `## Two Application Architectures

> **Monolithic ("tightly coupled")** — the entire application is a single unified codebase with a single deployment unit. ⚠️ **Outdated for modern development, but understanding it is the prerequisite for understanding why microservices exist.**

> **Microservices ("loosely coupled")** — the application is broken into multiple small, independently deployable services, each with its own codebase. Used by modern applications like **Netflix, Amazon, Uber, Spotify.**

---

## Twelve Points of Comparison

| Aspect | Monolithic | Microservices |
|---|---|---|
| Structure | Single codebase, single deployment | Multiple small services, independent codebases |
| Coupling | Tightly coupled — components depend heavily on each other | Loosely coupled — each component is an independent service |
| Deployment | One deployment for the entire app | Separate deployment per microservice |
| Scalability | ⚠️ Difficult to scale parts independently | ⚠️ Easy to scale services individually |
| Testing | End-to-end testing of the whole app | Test each microservice separately |
| Updates | Updating requires touching the whole app | Update and test one microservice independently |
| Failure impact | One failure can bring down the entire app | A failing service affects only that service |
| Tech stack | Usually one single tech stack throughout | Different services can use different languages/stacks |
| Database | One shared database | Each microservice can have its own database |
| DevOps/CI-CD | Complex for large teams | Separate, manageable CI/CD pipelines per service |
| Examples | Traditional ERP systems, early web apps | Netflix, Amazon, Uber, Spotify |
| Hosting | Virtual machines | ⚠️ Containers (ECS / EKS / Kubernetes) |

---

## ⚠️ The Killer Reason: Independent Scaling, Worked Through Amazon.in

**The scenario**: Amazon.in runs a sale, and traffic surges. The site has (at minimum) three components — **Home page, Cart, Payment.**

- **100,000 people** visit the home page — it must scale to handle **100,000 visitors.**
- Only **~10%** of visitors actually add something to their cart — the Cart component only needs to scale to **~10,000 users.**
- Of those, only **~4%** actually complete a purchase — the Payment component only needs to scale to **~4,000 users.**

> ⚠️ **With microservices, each component scales independently to its own actual demand** — Home at 100,000, Cart at 10,000, Payment at 4,000, each provisioned exactly for its own real load. **With a monolith, this is impossible** — since everything is one deployment unit, the entire application must be scaled as a single unit to handle the peak (100,000-visitor) load, massively over-provisioning the Cart and Payment logic that only a fraction of those visitors ever touch.

**This single scaling asymmetry** — different components genuinely needing different capacity — is the clearest, most concrete reason microservices architectures dominate modern large-scale applications.

---

## Why This Matters Before Learning ECS

> **Microservices are hosted in containers, and containers at scale need a container orchestration service** — exactly what ECS, EKS, and Kubernetes provide. Understanding the monolith-vs-microservices distinction (and specifically the independent-scaling advantage) is the direct motivation for everything ECS does.

---

## Exam Framing

> "An application needs different components to scale to very different levels of demand independently" → **microservices architecture**, hosted via container orchestration (ECS/EKS/Kubernetes) — a monolith cannot achieve this since it scales as one indivisible unit. The Home/Cart/Payment percentage cascade (100,000 → 10,000 → 4,000) is the concrete mental model worth retaining for "why microservices" scenario questions.
`,
    },
    {
      id: "ecs-what-is-ecs",
      title: "What Is Amazon ECS – Six Reasons to Choose It Over Self-Managed Kubernetes",
      shortDesc: "Fully managed with zero server setup, deeply woven into ALB/IAM/CloudWatch/ECR/CodePipeline — the AWS-native path to running containers at scale",
      visuals: ["ECSBasics"],
      content: `## The Definition

> **Amazon ECS (Elastic Container Service) is a fully managed container orchestration service that makes it easy to deploy, manage, and scale containerized applications on AWS.** ⚠️ **"Fully managed" is the key differentiator** — no servers to set up, no container orchestration software to install or maintain; clicking "Get Started → Create Cluster" is genuinely the entire setup burden on the user's side.

---

## ⚠️ Six Reasons to Choose ECS Over Self-Managed Kubernetes

**1. Fully managed.** Self-managed Kubernetes requires setting up and operating the control plane infrastructure yourself. ECS requires none of that.

**2. Deep AWS integration.** ECS is woven directly into AWS's broader ecosystem — **Application Load Balancer** (traffic distribution), **IAM** (security/permissions), **CloudWatch** (monitoring), **ECR** (container image storage), and **CodePipeline** (CI/CD) all connect to ECS natively, without needing separate integration work.

**3. Intelligent scheduling.** ECS handles the decision of which container runs on which underlying host automatically.

**4. Cost efficient.** Two infrastructure options — traditional **EC2** or serverless **Fargate** — let cost be optimized based on the actual workload pattern, covered in depth in the Infrastructure comparison topic.

**5. Secure.** Native IAM integration means container-level security follows the same identity and access model as the rest of an AWS account, rather than a separate parallel security system.

**6. Scalable.** Inherits AWS's underlying cloud-scale elasticity — scaling from a few hundred to millions of visitors is the same scaling model ECS applies to container workloads.

---

## Use Cases

- **Microservices-based applications** — the primary, most common use case.
- **Batch processing workloads.**
- **CI/CD pipelines** — via integration with AWS CodePipeline.
- **Monolith-to-microservices / monolith-to-container migration** — moving an existing application into a container-based architecture.

---

## Exam Framing

> "Container orchestration with zero infrastructure to manage, deeply integrated with the rest of an AWS-native stack (ALB, IAM, CloudWatch, ECR)" → **ECS.** The six-reasons framing (fully managed / deep integration / intelligent scheduling / cost efficient / secure / scalable) is specifically the "ECS vs self-managed Kubernetes" comparison — a scenario emphasizing zero operational overhead on AWS specifically points to ECS over a self-hosted Kubernetes cluster.
`,
    },
    {
      id: "ecs-cluster-concept",
      title: "ECS Cluster – The First Thing You Create, and Why It Solves the Single-Point-of-Failure Problem",
      shortDesc: "A cluster turns multiple uncoordinated Docker hosts into one resource pool that ECS can schedule containers across",
      visuals: ["ECSCluster"],
      content: `## What a Cluster Is

> **An ECS cluster represents a group of Docker hosts acting as a unified environment for container orchestration.** ⚠️ **Creating a cluster is the very first step** in setting up ECS — nothing else can happen before it.

---

## Why a Cluster Is Necessary: Revisiting Single Point of Failure

> **A single Docker host running multiple containers is a single point of failure** — if that host goes down, every container on it goes down together. The fix (redundancy — multiple Docker hosts) only actually works if those hosts **coordinate** — otherwise they're just several independent machines with no shared awareness of each other's health or workload.

> **A cluster is exactly that coordination layer**: at minimum **two Docker hosts** are added into a cluster, and once inside it, they act as a team — ECS (the container orchestrator) decides which host runs which container, handles failover if one host goes down, and pools their combined resources.

---

## Resource Pooling

> **Adding multiple hosts to a cluster combines their resources into one pool.** Worked example: three hosts with 4 vCPU each, once added to the same cluster, together form a **12 vCPU resource pool** that ECS can schedule containers across — treating the cluster's combined capacity as one logical unit rather than three separate, individually-managed machines.

---

## Two Infrastructure Types

> **ECS clusters support two infrastructure options for running containers: Amazon EC2 and AWS Fargate** — chosen when creating the cluster (name it, then select the infrastructure type). The detailed comparison between the two is covered in the next topic.

---

## Exam Framing

> "First step in setting up ECS, and the mechanism that turns several independent Docker hosts into one coordinated, resource-pooled team" → **an ECS cluster.** Remember the minimum-two-hosts framing for genuine high availability — a cluster with only one host still carries the original single-point-of-failure risk the cluster concept exists to solve.
`,
    },
    {
      id: "ecs-infrastructure-ec2-vs-fargate",
      title: "ECS Cluster Infrastructure – EC2 (Self-Managed) vs Fargate (Serverless), Twelve Points of Comparison",
      shortDesc: "Full control and cheaper steady-state cost vs zero server management and pay-only-for-what-runs — the same self-managed-vs-serverless trade-off as everywhere else in AWS",
      visuals: ["EC2vsFargate"],
      content: `## Two Infrastructure Choices for a Cluster

> **Amazon EC2 ("self-managed")** — the cluster's Docker hosts ARE EC2 instances, created and managed directly. **AWS Fargate ("serverless")** — AWS provisions the underlying infrastructure automatically, on demand, with no Docker hosts to create or manage at all.

---

## Twelve Points of Comparison

**1. Infrastructure provisioning.** EC2: launch and manage EC2 instances yourself (with Docker installed, joined to the cluster). Fargate: AWS provisions infrastructure automatically, on demand — no server ever explicitly created.

**2. Control level.** EC2: ⚠️ **full control** — OS, instance type, storage, AMI, all configurable. Fargate: ⚠️ **no access to the underlying OS or compute layer** — a genuine trade-off, not purely a downside, since it also means nothing to patch or maintain.

**3. Launch time.** EC2: slower — actual EC2 instances must be created and joined to the cluster. Fargate: fast — infrastructure is provisioned on demand as needed.

**4. Billing model.** EC2: pay for instance uptime (On-Demand, Spot, or Savings Plans pricing — the same options as standalone EC2). Fargate: ⚠️ **pay per vCPU and memory usage, per second, for each running task** — billing tracks actual container resource consumption, not pre-provisioned instance time.

**5. VPC selection timing.** EC2: VPC/subnet/security-group/public-IP settings are chosen **at cluster creation**, since real EC2 instances are being created. Fargate: no VPC selection at cluster creation — ⚠️ **VPC selection happens later, at task/service creation time instead.**

**6. Auto scaling configuration.** EC2: an Auto Scaling Group is created during cluster setup, with desired/min/max capacity configurable — the user manages the scaling policy. Fargate: ⚠️ **ECS handles task scaling automatically** — no Auto Scaling Group to configure at all.

**7. Scaling flexibility.** EC2: ⚠️ **scale the EC2 instances FIRST, then the containers** — a container can't use more CPU than its underlying EC2 instance actually has. Fargate: scale tasks/containers **directly** — AWS provisions whatever infrastructure the task needs on demand.

**8. Maintenance responsibility.** EC2: patch, scale, and maintain the instances yourself. Fargate: AWS manages the underlying infrastructure entirely.

**9. Task placement.** EC2: ECS decides which of the available EC2 hosts runs which task, based on available resources. Fargate: ECS places the task directly onto Fargate's own managed compute — no host-selection decision exposed to the user.

**10. Container isolation.** Multiple containers can share the same EC2 instance's resources (normal Docker behavior). ⚠️ **Fargate gives each task its own isolated environment with its own dedicated Elastic Network Interface** — a stronger isolation guarantee than EC2's shared-instance model.

**11. Use-case fit.** EC2: best when OS-level access or **GPU support** is required, or for long-running applications needing OS customization. Fargate: best for standard microservices, batch jobs, quick deployment, fast-scaling APIs, and short-lived workloads.

---

## Exam Framing

> "Need full OS-level control or GPU access for containerized workloads" → **EC2 launch type.** "Serverless, no infrastructure management, pay strictly for actual task resource consumption" → **Fargate.** ⚠️ **The scaling-order distinction is a frequently tested trap**: on EC2, containers cannot scale past what their underlying EC2 instances provide — the instances must be scaled first; on Fargate, tasks scale directly with no instance layer to worry about at all.
`,
    },
    {
      id: "ecs-anywhere",
      title: "ECS Anywhere – Managing On-Premises and Other-Cloud Servers Through ECS",
      shortDesc: "Four things a non-AWS machine needs before ECS will treat it like a normal cluster member: outbound internet, a container runtime, SSM, and the ECS agent",
      visuals: ["ECSAnywhere"],
      content: `## What ECS Anywhere Does

> **ECS Anywhere lets ECS run tasks on external machines** — physical or virtual servers on-premises, or virtual machines running on a different cloud provider entirely. ⚠️ **This extends ECS's management to infrastructure AWS doesn't own or host** — a genuine hybrid/multi-cloud capability, distinct from the standard EC2 and Fargate infrastructure options (both of which are AWS-only).

⚠️ **External hosts cannot be added during cluster creation** — the cluster must be created first (with Fargate and/or EC2 as usual), and external machines are added **afterward.**

---

## Four Requirements, Step by Step

**1. Outbound internet connectivity.** ⚠️ **The external machine needs outbound internet access — NOT a public IP.** "Behind NAT" outbound connectivity is sufficient; ECS just needs to be able to communicate outward to the machine, not the reverse. No VPN or special networking is strictly required, though options like VPC endpoints can be used if preferred.

**2. A container runtime.** The machine needs something capable of actually running containers — ⚠️ **ECS Anywhere supports both Docker and containerd** as the runtime, installed normally regardless of the machine's OS (Linux or Windows).

**3. SSM Agent (AWS Systems Manager).** ⚠️ **The SSM Agent must be installed and the machine registered with Systems Manager's Fleet Manager** before ECS can manage it at all. Once registered (via "hybrid activation"), the machine **automatically assumes an IAM role specified during that activation** — this is exactly how a non-AWS machine gets IAM-based permissions in the first place, since it isn't natively part of any AWS account. That IAM role grants the specific permissions needed to register with ECS, report to Systems Manager, run ECS tasks, and send heartbeat/log data.

**4. ECS Agent.** The final piece — installed on top of everything else, this agent is what actually **communicates with the ECS control plane**, letting the machine join the ECS cluster, receive task definitions, and run containers. ⚠️ **Once the ECS agent is installed and running, the external machine behaves exactly like a normal ECS-managed EC2 instance** from the cluster's perspective.

---

## Exam Framing

> "Manage on-premises servers or other-cloud VMs as part of an ECS cluster" → **ECS Anywhere.** Remember the requirement order and reasoning: **outbound internet (not a public IP) → container runtime (Docker or containerd) → SSM Agent + hybrid-activation IAM role (this is how a non-AWS machine gets AWS permissions) → ECS Agent (the actual ECS control-plane connection).** External hosts are always added to an already-existing cluster, never during initial cluster creation.
`,
    },
    {
      id: "ecs-storage-encryption",
      title: "ECS Storage and Encryption – Fargate Ephemeral Storage vs Managed Storage (EFS/EBS)",
      shortDesc: "One vanishes the moment the task stops, the other survives it — and cluster-level KMS encryption is a decision that can never be changed after creation",
      visuals: ["ECSStorage"],
      content: `## ECS-Level Encryption

> **ECS cluster-level encryption automatically encrypts all data in the cluster using a KMS key** — protecting container tasks and secrets from unauthorized access. ⚠️ **This encryption option must be enabled at cluster creation time — there is no way to turn it on afterward for an already-existing cluster.** Getting this decision right up front matters specifically because it's irreversible.

---

## Fargate Ephemeral Storage

> **Temporary disk space that exists only for the duration of a task's execution.** ⚠️ **Supported ONLY on Fargate** — EC2-backed clusters don't use this storage type at all.

- **Default capacity: 20GB**, expandable up to **200GB** (charges apply beyond the default 20GB).
- **Encryption**: automatically encrypted if cluster-level encryption is enabled (via the KMS key provided at cluster creation).
- **Lifecycle**: ⚠️ **data vanishes completely the moment the task stops** — there is no persistence across task restarts or task deletion.
- **Best for**: temporary processing files, application cache, short-lived logs — anything that genuinely doesn't need to outlive the task.

---

## Managed Storage (EFS / EBS)

> **Persistent storage that survives beyond the task's own lifetime** — ⚠️ **supported by BOTH Fargate and EC2** (unlike ephemeral storage, which is Fargate-only). Two storage types fall under "managed storage": **Elastic File System (EFS)** and **Elastic Block Storage (EBS)** (EBS being the more natural fit specifically for EC2-backed clusters, since EC2 instances already have EBS volumes).

- **Encryption**: EFS has encryption **enabled by default**, independent of whether cluster-level encryption was configured — data stored there is encrypted regardless.
- **Lifecycle**: data **persists through the task's lifetime and beyond** — stopping or deleting a task does NOT erase this data.
- **Best for**: databases, user uploads, configuration files — anything that genuinely needs to survive a task restart or replacement.

---

## Side-by-Side Summary

| Aspect | Fargate Ephemeral Storage | Managed Storage (EFS/EBS) |
|---|---|---|
| Nature | Temporary | ⚠️ Persistent |
| Launch type support | Fargate only | Both Fargate and EC2 |
| Default encryption | Only if cluster-level encryption enabled | EFS encrypted by default regardless |
| Data on task stop | Vanishes | Survives |
| Best for | Cache, temp files, short-lived logs | Databases, uploads, config files |

---

## Exam Framing

> "Task-local scratch space that disappears when the task stops" → **Fargate ephemeral storage** (Fargate only). "Data that must survive a task restart or replacement" → **managed storage — EFS (works with both launch types) or EBS (typically paired with EC2).** ⚠️ **Cluster-level encryption is a one-time, creation-only decision** — a scenario asking how to add encryption to an already-running cluster is testing exactly this limitation; the real answer is that it cannot be done directly, and a workaround (like recreating the cluster) would be required.
`,
    },
    {
      id: "ecs-fargate-fargate-spot-lab",
      title: "ECS Cluster Setup Lab – Why Fargate and Fargate Spot Are Always There, Whether You Select Them or Not",
      shortDesc: "Deselecting Fargate during cluster creation from the console doesn't actually remove it — every console-created cluster is hybrid-ready by default",
      visuals: ["ClusterInfraSetup"],
      content: `## ⚠️ A Genuinely Surprising Console Behavior

> **Even if Fargate is explicitly deselected while creating a cluster from the AWS console, Fargate and Fargate Spot are added automatically anyway.** Demonstrated directly: creating a cluster named "cluster-without-fargate" with no infrastructure selected still results in Fargate and Fargate Spot appearing in that cluster's infrastructure list afterward. ⚠️ **The AWS console does not offer a way to create a cluster without Fargate available** — the only way to avoid this is via the **AWS CLI** instead of the console.

**Why this isn't actually a problem**: ⚠️ **there is no charge for Fargate/Fargate Spot simply being available in a cluster** — billing only happens when a task or service is actually launched onto that infrastructure. Their presence costs nothing until used.

---

## Fargate vs Fargate Spot

> **Fargate** — the standard serverless option: fully managed, AWS handles provisioning/scaling/patching/availability. Ideal for **production workloads** needing stability and guaranteed availability.

> **Fargate Spot** — ⚠️ **roughly 70% cheaper than standard Fargate**, using AWS's spare compute capacity — the same underlying economic model as EC2 Spot Instances. ⚠️ **Can be interrupted at any time**, making it best for batch jobs, dev/test environments, and fault-tolerant workloads that can tolerate a mid-run interruption.

---

## Every Console-Created Cluster Is Hybrid-Ready by Default

> **Whether or not EC2 is added at cluster creation, Fargate and Fargate Spot remain available regardless** — meaning every console-created ECS cluster is inherently ready for hybrid deployment (Fargate, Fargate Spot, and optionally EC2, all simultaneously available).

⚠️ **The launch type is chosen per task/service, not per cluster** — a single task cannot span multiple infrastructure types simultaneously, but different tasks/services within the same cluster can each independently choose Fargate, Fargate Spot, or EC2 at the moment they're created.

---

## Exam Framing

> "A cluster was created via the AWS console without selecting Fargate, but Fargate still appears as available infrastructure — why?" → **this is expected console behavior; Fargate and Fargate Spot are always included when creating a cluster from the console**, with no cost implication until something is actually run on them. To create a cluster genuinely without Fargate, the **AWS CLI** must be used instead of the console.
`,
    },
    {
      id: "ecs-add-ec2-during-cluster-creation-lab",
      title: "Adding EC2 Infrastructure During Cluster Creation – The Recommended Path When EC2 Is Already Planned",
      shortDesc: "AWS auto-builds the launch template, Auto Scaling Group, and IAM role for you — ECS-optimized AMIs come with the container runtime and ECS agent pre-installed",
      visuals: ["ClusterInfraSetup"],
      content: `## Why Add EC2 (vs Sticking With Fargate)

> **Choosing EC2 as cluster infrastructure gives full control over the compute layer** — the AMI, storage, and networking are all directly configurable, unlike Fargate's serverless model where none of that is exposed.

---

## What Happens When EC2 Is Selected During Cluster Creation

> ⚠️ **AWS automatically builds a launch template AND an Auto Scaling Group for you** — this is exactly why adding EC2 during cluster creation is the recommended path when EC2 usage is already planned: most of the setup is handled automatically rather than requiring manual assembly afterward.

**Configuration walked through during setup**:
- **AMI**: ⚠️ **use an ECS-optimized AMI** — these come with the container runtime and ECS agent already pre-installed, meaning zero manual setup is needed for the instance to function as a cluster member.
- **Instance type, key pair, security group** — the normal EC2 configuration choices.
- **Min/max/desired instance count** — since this becomes an Auto Scaling Group under the hood.
- **EC2 instance role** — ⚠️ **AWS creates this automatically too** (commonly named "ECS instance role") — it's what grants the EC2 instance permission to register itself with the ECS cluster in the first place.
- **VPC/subnet, public IP assignment** — standard EC2 networking choices.

---

## Verifying and Adjusting Afterward

> Once the cluster is created, the resulting **Auto Scaling Group and EC2 instance(s)** are both independently visible and manageable — in the EC2 console (verifying the actual running instance) and in the Auto Scaling Group console (adjusting desired/min/max capacity directly). ⚠️ **Increasing desired capacity on the Auto Scaling Group automatically creates a new EC2 instance, which then registers itself with the ECS cluster** and appears as a new container instance — fully automated, no manual per-instance setup required.

---

## Exam Framing

> "Recommended way to add EC2 infrastructure when it's already known upfront that a cluster will need it" → **select EC2 during cluster creation**, since AWS automates the launch template, Auto Scaling Group, and IAM role creation in one flow. This contrasts with adding EC2 **after** cluster creation (covered next), which requires assembling these pieces manually.
`,
    },
    {
      id: "ecs-add-ec2-manually-lab",
      title: "Adding EC2 Manually After Cluster Creation – Editing /etc/ecs/ecs.config by Hand",
      shortDesc: "One line — ECS_CLUSTER=your-cluster-name — is the entire difference between a plain EC2 instance and one that registers itself as a container instance",
      visuals: [],
      content: `## When This Path Is Needed

> **If EC2 wasn't selected during cluster creation, it can still be added afterward** — two ways: **launching an individual EC2 instance manually** (covered here), or **creating a full Auto Scaling Group manually** (covered in the next topic, for genuine high availability).

⚠️ **Adding a single individual instance this way still leaves a single point of failure** — if that one instance goes down, every container/task running on it goes down too. This method is useful for understanding the mechanics, but a registered Auto Scaling Group is the production-appropriate approach.

---

## Step-by-Step: Manually Registering an EC2 Instance

**1. Launch an EC2 instance using an ECS-optimized AMI.** ⚠️ **This is the single most important choice** — an ECS-optimized AMI comes with the container runtime and ECS agent pre-installed, meaning near-zero manual setup. A plain, non-optimized AMI would require manually installing both the container runtime and the ECS agent from scratch.

**2. Attach the "ECS instance role" to the EC2 instance.** ⚠️ **Without this IAM role, the instance has no permission to register itself with ECS at all.** If a cluster was previously created with EC2 selected, this role likely already exists automatically (commonly named "ECS instance role") and can simply be attached; otherwise it must be created manually via IAM (trusted entity: EC2, with the appropriate ECS-related policy attached).

**3. SSH into the instance and edit** \`/etc/ecs/ecs.config\`. ⚠️ **Add exactly one line:** \`ECS_CLUSTER=your-cluster-name\` — this single configuration line is what tells the pre-installed ECS agent which specific cluster to register with.

**4. Restart the ECS service** (\`sudo systemctl restart ecs\` or equivalent) so the agent picks up the new configuration and registers with the specified cluster.

**5. Verify** — the instance should now appear as a container instance under the cluster's infrastructure tab in the ECS console, confirming successful registration.

---

## Exam Framing

> "An EC2 instance needs to be manually added to an already-existing ECS cluster" → **launch it with an ECS-optimized AMI (pre-installed agent + runtime), attach the ECS instance role, then set** \`ECS_CLUSTER=<name>\` **in** \`/etc/ecs/ecs.config\` **and restart the ECS service.** ⚠️ **That single config line is the exact mechanism connecting an otherwise-generic EC2 instance to a specific ECS cluster** — remember it as the concrete, testable detail behind "how does an instance know which cluster to join."
`,
    },
    {
      id: "ecs-custom-asg-capacity-provider-lab",
      title: "Registering Your Own Auto Scaling Group as an ECS Capacity Provider",
      shortDesc: "Instances show up automatically either way — but without registering the ASG as a capacity provider, ECS never actually manages its scaling, draining, or task placement",
      visuals: [],
      content: `## Building the Auto Scaling Group From Scratch

1. **Create (or reuse) the "ECS instance role"** — the same IAM role needed for any EC2 instance to register with ECS.
2. **Create a Launch Template**: ECS-optimized AMI, an appropriately-sized instance type, key pair, and ⚠️ **the IAM instance profile set to the ECS instance role under Advanced Details** (easy to forget, and instances silently fail to connect without it).
3. ⚠️ **Set User Data on the launch template** to automate what was previously done manually via SSH: a script that writes \`ECS_CLUSTER=your-cluster-name\` into \`/etc/ecs/ecs.config\` automatically on first boot — eliminating the need to SSH into every new instance individually.
4. **Create the Auto Scaling Group** using that launch template — select VPC/subnets, and set desired/min/max capacity.

**At this point, instances launched by the ASG already register themselves as ECS container instances automatically** — the ECS_CLUSTER user-data line and the attached IAM role are doing the same job they did in the manual single-instance process, just automated across every instance the ASG creates.

---

## ⚠️ The Critical Extra Step: Registering as a Capacity Provider

> **Even though instances already appear in the cluster automatically, the Auto Scaling Group itself is NOT yet registered with ECS as a capacity provider** — and this distinction matters a lot.

**What happens if the ASG is left unregistered** (instances still show up, but):
- ⚠️ **No managed scaling** — the number of EC2 instances must be adjusted manually; ECS won't automatically scale the ASG up or down based on task/container demand.
- ⚠️ **No automated draining** — when scaling down, ECS won't gracefully move running tasks off an instance before it terminates.
- ⚠️ **No advanced placement strategy support** — a feature covered in depth once task/service placement is introduced.

**Registering the ASG as a capacity provider** (two-step process):
1. **ECS Cluster → Infrastructure → Capacity Provider → Create**, and select the Auto Scaling Group created above.
2. ⚠️ **Update the cluster to actually use that new capacity provider** — creating the capacity provider alone isn't sufficient; the cluster itself must be updated to add it before ECS treats the ASG as truly managed.

---

## Why This Two-Step Registration Exists

> **The distinction is between "instances that happen to be visible in a cluster" and "an Auto Scaling Group that ECS actively manages."** Only the latter gets ECS-driven auto-scaling, graceful task draining during scale-in, and access to advanced placement strategies — capabilities specifically relevant for production-grade setups, covered in more depth once task and service creation are introduced.

---

## Exam Framing

> "An Auto Scaling Group's EC2 instances appear correctly in an ECS cluster, but scaling still has to be managed by hand, and instances don't drain gracefully" → **the Auto Scaling Group was never registered as a capacity provider** — simply having the launch template/user-data/IAM-role setup correct is not the same as ECS actively managing that ASG's lifecycle. Registration is a separate, required step: create the capacity provider from the ASG, then update the cluster to use it.
`,
    },
    {
      id: "ecs-task-concept",
      title: "ECS Task – Why AWS Calls It a 'Task' Instead of Just 'a Container'",
      shortDesc: "A worked contact-form frontend+backend example shows exactly what a bare Docker container can't do that a task can: its own IAM role, security group, and ENI",
      visuals: ["TaskVsService"],
      content: `## What a Task Is

> **Running an application in ECS means running it as a task** — the ECS equivalent of "create an EC2 instance" when hosting on a VM. ⚠️ **Think of a task as a container in action** — it runs an application based on a container image, can be started manually and stopped when done, and ⚠️ **ECS will NOT restart it automatically if it stops.**

**Good fits for a plain task**: testing a new web app quickly (no need for high availability — just run it, check the output, stop it), or a one-time job like generating a report or resizing an image (runs once, doesn't need to stay alive).

---

## ⚠️ Why "Task" and Not Just "Container"

> **In plain Docker, you run a container directly** — a single running application, nothing more. ⚠️ **ECS deliberately does NOT run containers directly — it runs a task, which is a more advanced, cloud-ready wrapper around one or more containers.**

**A task is a complete unit that can include one or more containers, and — critically — can have things a bare Docker container simply cannot:**
- **An IAM role attached directly to the task.**
- **A security group** to control network access.
- ⚠️ **A dedicated Elastic Network Interface (ENI)** — giving it its own private IP, exactly like an EC2 instance has its own NIC.

---

## Worked Example: A Contact-Form App With Two Containers

**The scenario**: a simple contact-form application with a **frontend container** (displays the form, collects name/email/message) and a **backend container** (a MySQL database storing the submitted data).

**⚠️ Running this with plain Docker, several things become genuinely hard**:
- Each container must be started manually, one at a time.
- A **custom Docker network** must be manually created so the two containers can actually communicate.
- ⚠️ **No IAM role can be attached to a container at all** — if the contact form also lets a user upload a PDF that needs to go to S3, the container has no way to get that permission directly; the role would have to be attached to the entire Docker HOST instead, not scoped to just this application.
- No security group can be attached to a container directly.
- No subnet/VPC IP can be assigned directly to a container.
- Restarts, health checks, and logs must all be managed manually.
- No way to assign a fixed public/Elastic IP to a container specifically.

**⚠️ With an ECS task, all of this is solved at once**: both containers are defined together inside **one task definition**, ECS runs them together as a single task, and AWS gives that task its own **ENI** — meaning a private IP, a security group, an attachable IAM role (solving the S3-upload permission problem directly), and built-in logging/health-check support, all scoped to that specific application rather than the entire underlying host.

---

## ⚠️ The Limitation: No High Availability

> **A task, on its own, has no high availability and cannot be attached to a load balancer.** If the task stops or crashes, nothing brings it back automatically. This is exactly the gap that **ECS Services** (covered in the next topic) exists to close.

---

## Exam Framing

> "Why does ECS use the term 'task' rather than just running Docker containers directly?" → **because a task can have things a bare container cannot: an attachable IAM role, a security group, and its own dedicated ENI** — capabilities that would otherwise require managing permissions and networking at the Docker host level instead of at the individual application level. Remember tasks do NOT auto-restart on failure — that capability specifically belongs to Services.
`,
    },
    {
      id: "ecs-service-concept",
      title: "ECS Service – Keeping Tasks Running 24×7 With Auto-Restart, Scaling, and Load Balancing",
      shortDesc: "Six differences between a task and a service, and why every production ECS workload is deployed as a service rather than a bare task",
      visuals: [],
      content: `## What a Service Adds on Top of a Task

> **A service is what's used when an application needs to run continuously — even after failure.** ⚠️ **Directly analogous to an EC2 Auto Scaling Group**: just as an ASG automatically replaces a failed EC2 instance, an **ECS Service keeps a task running continuously — if a task fails, the service automatically creates a replacement to restore the desired count.**

---

## Key Capabilities a Service Provides

- **24×7 availability** — the app is kept running continuously, automatically restarted if it stops.
- **Multiple copies for load balancing** — running several identical task copies simultaneously, distributing traffic across them.
- **Auto-scaling support** — scaling the number of running task copies up or down based on demand.
- **Load balancer integration** — a service can be directly attached to an Application/Network Load Balancer, distributing incoming traffic across its task copies.

**Good fits for a service**: a shopping site or any web application accessed anytime, a blog or chat service that needs to stay alive and self-heal, anything needing to handle multiple concurrent users at scale — in short, ⚠️ **any genuinely production workload.**

---

## Six Differences: Task vs Service

| Aspect | Task | Service |
|---|---|---|
| Restart behavior | Runs once, stops — ⚠️ **no auto-restart** | ⚠️ **Restarts automatically if stopped** |
| Use case | One-time / temporary job | Long-running application |
| Number of containers | Typically one or a few | One or many (replicated copies) |
| Load balancing | ❌ Not supported | ✅ Fully supported |
| Auto-scaling | ❌ Not supported | ✅ Fully supported |
| Example | Testing a new app, batch job/report | Web server, API, backend server — 24×7 mission-critical |

---

## Both Still Require a Task Definition First

> **Whether launching a standalone task or a service, a task definition must exist first** — it's the blueprint (image(s), CPU/memory, networking, IAM role) that both a task and a service are ultimately built from. **The overall flow**: create the ECS cluster → build/have a Docker image ready → create a task definition from that image → launch either a standalone **task** (temporary) or a **service** (long-running, scalable, load-balanced) from that same task definition.

---

## Exam Framing

> "Application must self-heal after a crash, scale with demand, and sit behind a load balancer" → **ECS Service**, not a standalone task — tasks provide none of those three capabilities on their own. "Run something once, check the result, and it's done" → a plain **task** is sufficient, and creating a full service would be unnecessary overhead. Both still require a task definition as their common starting point — the next topics in this series build one from scratch.
`,
    },
    {
      id: "ecs-project-objective",
      title: "ECS Hands-On Project – Deploying a Scalable PHP Web App With Image Uploads to S3",
      shortDesc: "The scenario that every subsequent ECS lecture builds on: a PHP app on ECS (Fargate AND EC2), behind an ALB, pushing images to S3, with the image itself built via Docker and stored in ECR",
      visuals: [],
      content: `## Why This Project Exists

> **The mission is closing the gap between theoretical ECS knowledge and real-world deployment** — rather than learning ECS features in isolation, every remaining ECS lecture builds toward implementing one continuous, realistic project: **deploying a scalable PHP web application on Amazon ECS.**

---

## The Application

> **A simple but genuinely illustrative PHP web app**: it lets a user upload an image through the browser, and that image is stored in **Amazon S3.** ⚠️ **The simplicity is deliberate** — the point isn't the PHP code itself, it's everything AROUND it: how an ECS-hosted container talks to other AWS services (S3), how it's exposed to the internet, and how the whole deployment follows AWS best practices rather than shortcuts.

---

## Project Objectives — What Gets Learned Along the Way

- **Deploy a production-simulating PHP workload** — not a toy example disconnected from real deployment patterns.
- ⚠️ **Run the app on ECS using BOTH Fargate and EC2** — directly reinforcing the earlier EC2-vs-Fargate infrastructure comparison with a real working example of each.
- **Expose the app to the internet via an Application Load Balancer** — tying ECS together with the ALB concepts from earlier in the course.
- **Support image upload to S3** — demonstrating cross-service AWS integration from within a container.
- **Build the container image with Docker and store it in Amazon ECR** (Elastic Container Registry) — introducing ECR as the AWS-native counterpart to Docker Hub, closely paired with ECS.
- ⚠️ **Follow AWS best practices for IAM roles and environment configuration throughout** — the project explicitly contrasts the "shortcut" way of doing something against the "best practice" way, and deliberately follows best practice, since a shortcut approach carries real security risk in production.

---

## The Eight-Step Implementation Plan

> The project unfolds as roughly eight sequential steps (spanning many individual lectures each): **(1) create the ECS cluster** (Fargate + EC2 compatible), followed by **building/testing the Docker image, understanding and setting up ECR, authenticating and pushing the image to ECR, building the ECS task definition** (a substantial cluster of sub-lectures covering network modes, roles, placement, storage, and more), **running the task for testing, creating the ECS service, and configuring service deployment/networking/load balancing/auto-scaling.**

⚠️ **Every subsequent hands-on lecture in this section is a specific step within this same continuous project** — later lectures assume this PHP-app-with-S3-uploads scenario as their working context, rather than introducing a new unrelated example each time.

---

## Exam Framing

> This lecture itself isn't a source of testable facts — it's the scenario map for everything that follows. The practical takeaway worth internalizing now: **a realistic ECS deployment touches far more than just ECS itself** — ECR (image storage), IAM (roles for both the task and its execution), S3 (application data), and ALB (traffic distribution) are all standard companions to a real ECS deployment, not optional extras.
`,
    },
    {
      id: "ecs-project-step1-create-cluster",
      title: "ECS Project Step 1 – Creating a Hybrid Cluster (Fargate + EC2 Together)",
      shortDesc: "Both launch types, on purpose, in the same cluster — so the deployment can be compared side by side on Fargate and EC2, plus the auto-scaling trick to pause EC2 charges overnight",
      visuals: [],
      content: `## Why This Cluster Is Deliberately Hybrid

> ⚠️ **The goal is a single ECS cluster supporting BOTH Fargate and EC2 simultaneously** — not because the app needs both, but so the project can deploy and compare the SAME application on each launch type side by side. A Fargate-only cluster would make it impossible to unlock or exercise EC2-specific task definition features later in the project.

---

## Configuring the EC2 Side of the Cluster

- **New Auto Scaling Group**, On-Demand instances, an **ECS-optimized AMI** (Amazon Linux 2023), free-tier-eligible **T2 micro** instance size.
- **ECS instance role** — reused if one already exists from a prior lab, otherwise created fresh.
- **Min 1 / max 2 instances.**
- **Key pair** for SSH access.
- **30GB EBS root volume** (default).
- **Default VPC** used for simplicity — ⚠️ **the source lecture explicitly notes creating a dedicated VPC with public/private subnets is the real best practice, but the default VPC is used here to keep the project approachable.**
- ⚠️ **Region-specific gotcha**: in the Mumbai (AP South 1) region specifically, T2 micro free-tier instances are sometimes unavailable in the AP South 1C Availability Zone — deselecting that AZ (keeping only 1A and 1B) avoids a launch failure.
- **A dedicated security group** (not the default) — inbound rules for **SSH (port 22)** and a **custom TCP rule on port 8080** (the port the application itself will be reachable on, explained further in the next topics), both open from anywhere for lab simplicity.
- **Auto-assign public IP** enabled, matching the subnet's default setting.

---

## ⚠️ Cost-Management Pro Tip: Pausing EC2 Charges Between Sessions

> **The ECS cluster itself is never chargeable — only tasks/services running on it incur cost.** But the EC2 instance created as part of this hybrid setup IS a real, billable instance (even if T2 micro is within the free tier).

**The problem**: manually terminating that EC2 instance doesn't actually stop it from coming back — ⚠️ **the Auto Scaling Group will simply recreate it**, since its desired capacity is still set to 1.

**The actual fix**: go to the **Auto Scaling Group → Edit**, and set both **desired capacity and minimum capacity to 0.** This causes the ASG to terminate the instance itself, cleanly, with no risk of it silently reappearing. ⚠️ **To resume work later, edit the ASG again and set desired capacity back to 1** — a new instance is created automatically within a few minutes, fully re-registering with the cluster exactly as before.

---

## Exam Framing

> "How can EC2 costs be paused between work sessions on an ECS cluster with EC2 infrastructure, without breaking the cluster's configuration?" → **adjust the Auto Scaling Group's desired/minimum capacity to 0** (not manually terminating the instance directly, which the ASG would just undo). This is a genuinely practical, exam-adjacent operational pattern for any ASG-backed ECS EC2 setup, not just this specific project.
`,
    },
    {
      id: "ecs-project-step2-build-docker-image",
      title: "ECS Project Step 2 (Part 1) – Building the Docker Image on a Separate EC2 'Build Machine'",
      shortDesc: "ECS can only RUN images, never build them — so a throwaway EC2 instance with Docker, PHP, and Composer installed is where the image actually gets assembled",
      visuals: [],
      content: `## ⚠️ Why a Separate EC2 Instance Is Needed at All

> **ECS cannot build Docker images — it can only run them.** A task/service always requires an already-built image to run; ECS itself has no image-building capability whatsoever. This is exactly why a standalone EC2 instance (a "build machine") is required as a separate, temporary step before anything touches ECS.

---

## Setting Up the Build Machine

1. Launch a plain EC2 instance (Amazon Linux, T2 micro) — open **port 22** (SSH) and **port 8080** (to test the app locally before it ever touches ECS).
2. SSH in, then **install Docker** and enable the ec2-user to run Docker commands without sudo.
3. **Install PHP, unzip, and git** — PHP because the application itself is PHP-based, unzip for decompressing files, git specifically to clone the application's source repository.

---

## ⚠️ What Composer Is, and Why It's Needed

> **The application uploads files to Amazon S3 — meaning it needs to talk to AWS from PHP code.** ⚠️ **PHP has no built-in AWS capability; talking to S3 requires the official AWS SDK for PHP, a third-party library.** **Composer is PHP's standard dependency manager** — the tool used to install that third-party SDK (and any other PHP libraries the project needs) correctly.

**Installing Composer**: download the official installer script, run it, then move the resulting binary into a system PATH location so it can be invoked from anywhere.

⚠️ **In a real team, a developer/programmer would typically hand over exactly which libraries and dependencies are needed** — the point of walking through this manually here is to build genuine end-to-end understanding of the process, not to suggest every cloud engineer writes PHP dependency lists from scratch in practice.

---

## Cloning the Application and Installing Dependencies

4. **Clone the application's public source repository** via git — this produces a project directory containing the application code (index.php, upload logic), a Dockerfile, and Composer's dependency manifest files (composer.json / composer.lock).
5. **Install the PHP SimpleXML extension** — ⚠️ **not always pre-installed by default**, but required because the AWS SDK uses XML under the hood for certain service communications; skipping this can cause subtle failures later.
6. **Run the Composer install step** — reads composer.json/composer.lock and downloads every required library (including the AWS SDK for PHP) automatically.

---

## Building the Image

7. **docker build** the image from the Dockerfile in the current directory. ⚠️ **The trailing "." in the build command matters** — it tells Docker to look for the Dockerfile in the current directory; omitting it is a common mistake.
8. **Verify** the image exists via the image-listing command — confirming it's ready to be tested (next topic) and eventually pushed to ECR.

---

## Exam Framing

> "Why does building a container image for ECS require a separate EC2 instance rather than doing it directly in ECS?" → **ECS is purely a runtime for already-built images — it has no image-build capability of its own.** A build machine (or a CI/CD pipeline serving the same purpose) is always a separate step upstream of ECS, with the resulting image typically pushed to a registry like ECR for ECS to then pull and run.
`,
    },
    {
      id: "ecs-project-step2-test-image-env-iam",
      title: "ECS Project Step 2 (Part 2) – Testing the Image, and the Environment-Variable + IAM-Role Best Practices That Carry Into Task Definitions",
      shortDesc: "Two things NOT to hardcode into application code: config values (use environment variables) and AWS credentials (use an IAM role) — this topic is the direct foundation for task definitions",
      visuals: [],
      content: `## Running the Image Locally to Test It

> **Running the built image locally on the build machine** — publishing container port 80 to host port 8080 (the same port opened earlier), with two values injected as **environment variables**: the target **S3 bucket name** and the **AWS region.**

---

## ⚠️ Environment Variables vs Hardcoded Config — Why Dynamic Wins

> **Two ways exist to supply the S3 bucket name and region to the application**: hardcode them directly into the PHP source file, OR pass them as environment variables at container-run time.

⚠️ **Hardcoding them means every bucket/region change requires editing the code, rebuilding the image, re-pushing to ECR, and re-pulling into ECS** — a full repeat of the entire build-and-deploy cycle for what should be a trivial config change. ⚠️ **Passing values dynamically via environment variables avoids all of that** — the same image can be reused unmodified across different buckets, regions, or even entirely different deployments, with only the passed-in values changing. ⚠️ **This environment-variable mechanism is exactly what gets configured later when building the actual ECS task definition** — this local test is deliberately foreshadowing that.

---

## ⚠️ AWS Credentials — Never Hardcode Access Keys Into Application Code

> **The PHP application needs permission to write to S3 — and by default, it has none**, since AWS services are isolated from each other just like everywhere else in this course. Two ways to grant that permission:

**The wrong way (never do this in real code)**: hardcode an AWS access key and secret access key directly into the PHP source. ⚠️ **This is explicitly called out as bad practice** — if an attacker ever gains access to that source file, the embedded credentials directly compromise the AWS account, with no separate barrier protecting them.

**The right way**: ⚠️ **attach an IAM role to the task/container itself**, granting it S3 write permission without any credentials ever appearing in code at all. This is exactly the IAM-role-on-a-task capability from the earlier "ECS Task" concept topic, now being connected to a concrete real use case.

**Why this local test still uses temporary access keys**: for this specific local-testing step (running the image directly on the build EC2 instance, before ECS is involved at all), a temporary access key/secret key pair is used just to confirm the application works correctly. ⚠️ **This is explicitly framed as a temporary testing shortcut, not the production pattern** — once deployed as a real ECS task/service, the IAM role approach replaces this entirely, and any test access keys used here should be deleted afterward.

---

## Verifying End-to-End

> With the container running (verified via the running-containers list) and the app reachable on port 8080 through the EC2 instance's public IP, uploading a test image through the web form and then checking the target S3 bucket confirms the entire chain works: **PHP app → environment-variable-supplied config → S3 write via temporary credentials → object appears in the bucket's upload folder.**

---

## Exam Framing

> ⚠️ **Two best-practice patterns established here carry directly into ECS task definitions, covered in upcoming topics**: (1) **application configuration values (bucket names, regions, etc.) should be injected as environment variables, never hardcoded** — enabling the same image to be reused across environments unmodified; (2) **AWS service permissions (like S3 access) should always come from an attached IAM role, never from hardcoded access keys in source code** — a scenario testing "how should a containerized application authenticate to another AWS service" is testing exactly this IAM-role pattern.
`,
    },
    {
      id: "ecs-project-step3-understand-ecr",
      title: "ECS Project Step 3 (Part 1) – Why an Image Can't Go Directly From a Build Machine to ECS",
      shortDesc: "ECR is the required bridge between where an image is built and where ECS runs it — and it beats Docker Hub on security, latency, and rate limits for this exact use case",
      visuals: [],
      content: `## ⚠️ The Core Problem: Build Machine and ECS Can't Talk Directly

> **A Docker image built on a standalone EC2 "build machine" cannot be sent directly to ECS.** ⚠️ **ECS never pulls images from an EC2 instance — it only pulls images from a container registry.** This gap is exactly what **ECR (Elastic Container Registry)** exists to bridge.

---

## What ECR Is

> **ECR is AWS's fully managed container image registry service** — a repository purpose-built for storing container images, deeply integrated into the AWS ecosystem.

---

## ⚠️ Why ECR Over Docker Hub for This Use Case

**1. Security and access control.** ⚠️ **ECR images are private by default** — Docker Hub offers both public and private repositories, but ECR is private-only, and access is controlled cleanly through **IAM roles** rather than separate registry credentials.

**2. Faster performance / lower latency.** ⚠️ **An ECR repository lives in the same AWS region as the ECS cluster using it** (e.g. both in Mumbai) — meaning genuinely low-latency image pulls. Docker Hub gives no guarantee about where an image physically lives relative to the ECS cluster pulling it, potentially introducing real cross-region latency.

**3. No rate limits.** Docker Hub applies pull/push rate limits; ECR does not — another consistent performance advantage for AWS-hosted workloads specifically.

---

## The Role ECR Plays in This Project

> **Sequence**: build machine has the tested Docker image → **create a private ECR repository** → **push the image from the build machine to that ECR repository** → when the ECS task definition is created, **ECS securely pulls the image from ECR** (never from the build machine directly).

⚠️ **ECR is explicitly the bridge between the build machine and ECS** — every future application update follows the same pattern: update source code → rebuild the image on a build machine (or via CI/CD) → push the new image to ECR → ECS pulls the refreshed image from there.

---

## Exam Framing

> "Why can't a Docker image be deployed to ECS directly from the EC2 instance it was built on?" → **ECS only pulls images from a container registry (like ECR), never directly from an EC2 instance.** "Why use ECR instead of Docker Hub for an AWS-hosted deployment?" → **private-by-default images with IAM-based access control, same-region low-latency pulls, and no rate limiting** — all direct advantages over Docker Hub specifically for AWS-native workloads.
`,
    },
    {
      id: "ecs-project-step3-create-ecr-repo",
      title: "ECS Project Step 3 (Part 2) – Creating the ECR Repository: Mutable vs Immutable Tags",
      shortDesc: "Mutable tags let you accidentally overwrite last week's working image with today's broken one — immutable tags make that impossible",
      visuals: [],
      content: `## Creating the Repository

> **ECR repositories are always private** — there is no public-repository option, unlike Docker Hub. Creating one just requires a name (⚠️ **using the exact same name shown in any along-video reference material avoids friction in later steps, since the name is referenced again when pushing the image**).

---

## ⚠️ Image Tag Mutability — A Real Rollback-Safety Decision

> **Tag mutability controls whether pushing an image with an already-used tag (e.g. "latest") is allowed to silently overwrite the existing one.**

**Worked example**: an image is pushed the first time tagged "latest." The application is later updated, rebuilt, and pushed again — also tagged "latest."

- **Mutable**: ⚠️ **the second push silently overwrites the first image under the same tag** — convenient for rapid iteration, but genuinely dangerous, since there's no way to roll back to the previous "latest" once overwritten.
- **Immutable**: ⚠️ **the second push with the same tag is REJECTED outright** — forcing a new, distinct tag for every new image version, which preserves every prior version and makes rollback always possible.

**The recommendation**: ⚠️ **mutable is acceptable for learning/development environments where rapid iteration matters more than history**; ⚠️ **immutable is the correct choice for production, specifically to prevent an accidental overwrite from destroying the ability to roll back.**

---

## Encryption Setting

> **AES-256 (ECR-managed encryption)** is the default — AWS manages the encryption key entirely, similar to S3's default encryption. **AWS KMS (customer-managed keys)** is the alternative for higher security/compliance needs, adding customer control over the key and CloudTrail-based auditability. For this project, the simpler AES-256 default is used, keeping focus on the overall ECS workflow rather than key management specifics.

---

## Exam Framing

> "A production container registry needs to guarantee that a previously-deployed image can always be rolled back to" → **immutable tags** — mutable tags allow a later push to silently destroy the ability to recover an earlier version under the same tag. This distinction (mutable = convenient but risky, immutable = safer but stricter) is directly analogous to similar "convenience vs safety" trade-offs seen elsewhere in AWS (e.g. S3 versioning, RDS deletion protection).
`,
    },
    {
      id: "ecs-project-step4-authenticate-ecr",
      title: "ECS Project Step 4 (Part 1) – Authenticating the Build Machine to ECR Without Hardcoded Credentials",
      shortDesc: "Two authentication layers, both solved by an IAM role instead of AWS access keys typed directly into the instance",
      visuals: [],
      content: `## Two Separate Authentication Steps Are Needed

> **Pushing an image from the build machine to ECR requires TWO layers of authentication**: (1) the EC2 instance itself must be authorized to make AWS API calls (specifically ECR-related ones) via the AWS CLI, and (2) the Docker client running on that instance must be authorized specifically to push/pull from the private ECR registry.

---

## ⚠️ Step 1: Authenticating the EC2 Instance — IAM Role, Not Access Keys

> **The "quick" way** is running an AWS CLI configuration command and entering an access key and secret key directly on the instance. ⚠️ **This is explicitly flagged as bad practice** — hardcoding credentials onto an EC2 instance means a compromised instance directly exposes those credentials to an attacker, who could then use them to compromise the broader AWS account.

**The correct way**: ⚠️ **create an IAM role and attach it to the EC2 instance instead** — no credentials ever get typed or stored on the instance at all.

**Concretely**: create a role trusted by the EC2 service, attach the AWS-managed policy **"Amazon EC2 Container Registry Full Access,"** name it descriptively (e.g. "ECR access role"), then attach that role to the build machine instance directly (via its security settings → modify IAM role). ⚠️ **Once attached, the instance can run ECR-related AWS CLI commands with no separate login step at all** — the role's permissions apply automatically to anything running on that instance.

---

## Step 2: Authenticating Docker Itself With ECR

> **Even with the EC2 instance authorized via IAM, the Docker client specifically still needs a short-lived login token to interact with the private ECR registry.** ⚠️ **This token is generated via the AWS CLI and piped directly into a Docker login command** — AWS provides a ready-to-copy "view push commands" sequence directly from the ECR console for the specific repository, eliminating any need to hand-construct this command.

**A successful login reports "Login Succeeded"** — confirming the Docker client on the build machine can now authenticate against that specific ECR repository for subsequent push operations.

---

## Exam Framing

> "How should an EC2 instance authenticate to another AWS service (like ECR) without hardcoding credentials?" → **attach an IAM role directly to the instance**, rather than running a CLI login with a manually-entered access key/secret key. This is the exact same IAM-role-over-hardcoded-credentials pattern established earlier when testing the PHP application locally (that topic's environment-variable/IAM-role best practices) — now applied to the build machine's own AWS authentication, not just the application's S3 access.
`,
    },
    {
      id: "ecs-project-step4-push-image-to-ecr",
      title: "ECS Project Step 4 (Part 2) – Tagging and Pushing the Image, So ECS Can Finally Pull It",
      shortDesc: "The tag is what tells Docker WHERE to push an image — a locally-built image has no destination information until it's explicitly tagged with the ECR repository's URI",
      visuals: [],
      content: `## ⚠️ Why Tagging Is Mandatory Before Pushing

> **A locally-built Docker image has no information about where it should be pushed to** — ⚠️ **tagging the image with the ECR repository's specific URI is what tells Docker its destination.** Without this tagging step, there is no way for Docker to know which remote repository a push command should target.

**The URI format**: account-id.dkr.ecr.region.amazonaws.com/repository-name — visible directly in the ECR console for the specific repository (no need to construct it by hand).

**The tagging command** associates the locally-built image (identified by its local name/tag, e.g. "cloudfox-php-app:latest") with that full ECR URI as a new tag. ⚠️ **Verifying with the image-listing command afterward shows TWO entries** — the original locally-tagged image, and the newly ECR-URI-tagged copy pointing at the same underlying image — confirming the tagging step succeeded before attempting the actual push.

---

## Pushing the Image

> **The final push command uploads the ECR-tagged image to the repository** — again, AWS's "view push commands" panel in the ECR console provides the exact ready-to-copy command for the specific repository, removing any need to hand-construct it.

**Verifying success**: refreshing the ECR repository in the console shows the newly pushed image now listed there — confirming the image has successfully traveled from the build machine, through tagging, to its final destination in ECR, ready for ECS to pull.

---

## What This Enables Going Forward

> ⚠️ **This build → tag → push sequence is exactly what would be automated by a CI/CD pipeline in a real production setup** — updating source code, rebuilding the image, and pushing the new version to ECR automatically on every code change, rather than manually repeating these steps by hand each time (a pattern belonging to AWS DevOps tooling, covered separately elsewhere in the course).

---

## Exam Framing

> "A Docker image is built locally but a push to ECR fails or goes to the wrong place" → check whether the image was **tagged with the correct ECR repository URI first** — pushing an untagged (or wrongly-tagged) image has no way to reach the intended ECR destination. The tag-then-push sequence (never push directly without tagging) is the concrete, testable mechanical detail here.
`,
    },
    {
      id: "ecs-project-step5-task-definition-intro",
      title: "ECS Project Step 5 (Part 1) – What a Task Definition Actually Is",
      shortDesc: "The one document ECS reads to know which image to run, how much CPU/memory to give it, which ports to open, and what environment to set up — with full version history built in",
      visuals: [],
      content: `## The Prerequisite for Any Task or Service

> **A task definition is the detailed set of instructions telling ECS how to prepare and run a container-based application.** ⚠️ **A task definition must exist BEFORE any task or service can be launched** — it's the single required starting point for everything that follows.

**What it captures**: which image to use (the one already pushed to ECR in prior steps), how much CPU/memory to allocate, which ports the application needs open, what environment variables to inject, which IAM role to attach, and more — essentially every configuration decision needed to actually run the containerized application.

---

## ⚠️ Two Foundational Behaviors Worth Knowing Up Front

**1. Every edit creates a new revision, never an overwrite.** ⚠️ **Modifying a task definition's configuration always produces a NEW version rather than overwriting the existing one** — meaning rollback to an earlier configuration is always straightforward, since nothing is ever destroyed by an edit.

**2. A single task definition can bundle multiple containers.** Directly connecting back to the earlier "ECS Task" concept topic — a task definition is exactly where multiple containers (e.g. frontend + backend) get defined together as one coordinated unit.

---

## Settings Are Launch-Type-Dependent

> ⚠️ **Some task definition settings apply only to Fargate, others only to EC2** — a concrete example: selecting Fargate as the launch type locks the network mode to a single option (covered in depth in a later topic), while EC2 unlocks several additional network mode choices. This is exactly why the launch type is one of the very first decisions made when creating a task definition — it determines which subsequent options are even available.

---

## Exam Framing

> "What must exist before an ECS task or service can be launched?" → **a task definition**, defining the image, resource allocation, networking, environment, and IAM role the task will use. Remember: **task definitions are versioned via revisions, never overwritten in place** — this built-in history is what makes safe rollback possible without any extra tooling.
`,
    },
    {
      id: "ecs-project-step5-family-launch-type",
      title: "ECS Project Step 5 (Part 2) – Task Definition Family and Launch Type",
      shortDesc: "'Family' is AWS's word for a version-controlled group of task definition revisions — and launch type is a plan you're filing now, not an action you're taking yet",
      visuals: [],
      content: `## ⚠️ Why It's Called "Family," Not "Name"

> **A task definition's "family" is a name that groups every revision of that task definition together** — updating the application later means creating a new revision under the SAME family, rather than creating a brand-new, unrelated task definition each time.

**Worked example**: a task definition family named "cloudfox-web-app" starts at revision 1. The application is later updated (say, CPU allocation increases) — this produces revision 2, **still under the same family name.** ⚠️ **Launching a task can target either the latest revision (the default if unspecified) or a specific older revision explicitly** — giving a built-in, always-available rollback mechanism with zero extra tooling.

---

## Launch Type: A Declaration of Intent, Not an Action

> **Launch type specifies where and how a task is designed to run — Fargate, EC2, or both.** ⚠️ **Selecting a launch type here does NOT actually launch anything** — it's purely informational, telling ECS what kind of infrastructure this task definition is built for, so ECS can surface only the relevant subsequent configuration options.

**Direct consequence**: choosing Fargate locks the network mode field to a single supported option; choosing EC2 unlocks multiple network mode choices (covered in the next topics).

---

## ⚠️ A Grayed-Out EC2 Option Means the Cluster Itself Needs Fixing First

> **If the EC2 launch type option appears grayed out while creating a task definition, the underlying ECS cluster was created with only Fargate infrastructure** — EC2 was never added to that cluster in the first place. ⚠️ **The fix is at the cluster level, not the task definition level**: the cluster needs EC2 infrastructure added (as covered in the earlier "adding EC2" topics) before EC2 becomes selectable here.

---

## Exam Framing

> "How does ECS track multiple versions of the same task definition over time?" → **the "family" groups every revision together**, with the latest used by default unless an older revision is explicitly specified — providing built-in rollback without any separate versioning system. Remember launch type at the task-definition stage is purely declarative — the actual launch decision and infrastructure matching happens later, when the task is actually run.
`,
    },
    {
      id: "ecs-project-step5-os-architecture",
      title: "ECS Project Step 5 (Part 3) – Task Definition Operating System and CPU Architecture",
      shortDesc: "Declaring Linux+ARM64 doesn't create an ARM64 host for you — it just means the task fails to launch until a genuinely matching host already exists in the cluster",
      visuals: [],
      content: `## Two Independent Choices: OS and CPU Architecture

> **A task definition requires declaring both an operating system (Linux or Windows) and a CPU architecture (x86-64 or ARM64).** ⚠️ **This is purely a compatibility declaration — it does NOT provision, select, or configure any actual EC2 instance or hardware.** It tells ECS: "only run this task on a host matching this exact OS/architecture combination."

---

## ⚠️ The Common Misunderstanding, Directly Addressed

> **Selecting an OS/architecture here is NOT the same as choosing an EC2 instance's OS or hardware type.** The task definition is simply stating a *requirement*; whether a host actually satisfying that requirement exists in the cluster is a completely separate question, determined entirely by what infrastructure was added when the cluster itself was built.

---

## ⚠️ Mismatch = Task Failure, Not Automatic Infrastructure Creation

> **If a task definition declares Linux + ARM64, but the ECS cluster's EC2 infrastructure is actually Linux + x86-64, the task will FAIL to launch.** ⚠️ **ECS does NOT create a new, matching EC2 instance to satisfy the mismatch** — it simply refuses to schedule the task anywhere, since no compatible host exists. This produces no error at the task-definition-creation step itself — the failure only surfaces later, when the task is actually run.

**The fix**: register a genuinely compatible EC2 instance (e.g. an AWS Graviton/ARM64-based instance) into the cluster — using the exact same "add EC2 after cluster creation" process covered in earlier topics — before attempting to launch a task requiring that architecture.

---

## What Each Combination Actually Supports

- **Linux + x86-64**: runs on either a matching EC2 instance OR Fargate — ⚠️ **Fargate supports both x86-64 and ARM64.**
- **Linux + ARM64**: runs on a Graviton/ARM64 EC2 instance OR Fargate (again, both architectures supported by Fargate).
- **Windows + x86-64**: ⚠️ **requires a Windows-based EC2 instance — Windows is NOT supported by Fargate at all.**

---

## Exam Framing

> "A task definition specifies an OS/architecture combination that has no matching infrastructure in the cluster — what happens?" → **the task fails to start; ECS does not create matching infrastructure automatically.** The fix is registering a compatible EC2 instance into the cluster (or, if the requirement is Linux-based, potentially switching to Fargate, which supports both x86-64 and ARM64 for Linux — but never Windows).
`,
    },
    {
      id: "ecs-network-mode-awsvpc",
      title: "ECS Network Mode – awsvpc: A Dedicated ENI and Private IP for Every Task",
      shortDesc: "The only mode Fargate supports, and the most-used mode on EC2 too — each task acts like its own mini EC2 instance with its own IP, security group, and subnet",
      visuals: [],
      content: `## What Network Mode Controls

> **A task definition's network mode determines how a container connects to the network, and whether it shares networking with the host machine or gets its own dedicated IP.** ⚠️ **ECS offers five network modes total** — this topic covers awsvpc, the most important and most commonly used one.

---

## awsvpc: Each Task Gets Its Own ENI

> **In awsvpc mode, every task gets a dedicated Elastic Network Interface (ENI) and its own private IP address from the VPC** — ⚠️ **it does NOT share networking with the underlying host machine at all.**

**How it works mechanically**: an EC2 instance (part of the ECS cluster) already has its own host ENI. Creating a task with awsvpc mode attaches a SEPARATE, dedicated ENI specifically for that task — with its own private IP, its own attachable security group, and its own subnet association. ⚠️ **Each task effectively behaves like a mini EC2 instance in its own right.** Launching a second task creates a second, entirely separate ENI with its own distinct IP — ⚠️ **there is no cross-access between tasks' ENIs; each is fully isolated from the others.**

---

## ⚠️ The Only Mode Fargate Supports

> **awsvpc is the ONLY network mode Fargate supports** — all other four modes are exclusively available on the EC2 launch type. This is exactly why, when creating a task definition with Fargate selected, the network mode field is grayed out and locked to awsvpc.

**Even on EC2 (where all five modes are technically available), awsvpc remains the most commonly used** — because it provides the strongest isolation, full VPC feature access (security groups, routing) per task, and the same networking model regardless of whether the task runs on Fargate or EC2.

---

## Configuring It

> With awsvpc selected, only the **container port** needs to be specified when configuring a task's container — since the task already has its own dedicated ENI and IP, there's no host-to-container port mapping to configure at all (that complexity is specific to bridge mode, covered next).

---

## Exam Framing

> "Which ECS network mode is required for Fargate, and gives each task its own dedicated network interface and private IP?" → **awsvpc** — the only mode Fargate supports, and the generally-recommended mode even on EC2 for the strongest task-level network isolation.
`,
    },
    {
      id: "ecs-network-mode-bridge",
      title: "ECS Network Mode – Bridge: All Tasks Share the Host's ENI Through a Virtual Bridge",
      shortDesc: "No dedicated IP per task this time — Docker creates an internal virtual bridge and NATs traffic through the single shared host ENI, requiring explicit port mapping",
      visuals: [],
      content: `## The Core Difference From awsvpc

> ⚠️ **In bridge mode, tasks do NOT get a dedicated ENI at all — every task shares the single host ENI**, unlike awsvpc where each task gets its own. ⚠️ **Bridge mode is only available on EC2 — Fargate does not support it.**

---

## How Sharing Actually Works

> **Docker creates an internal virtual bridge on the EC2 host** — functioning as a gateway with its own internal IP (e.g. an address like 172.17.0.1). This bridge connects to the host's ENI, so ⚠️ **all incoming/outgoing task traffic ultimately flows through that single shared ENI, with Docker performing NAT (network address translation) behind the scenes** to bridge between the bridge's internal IP range and the host ENI's actual VPC-facing IP.

**When a task starts**: Docker creates a virtual Ethernet pair connecting the task to the bridge, and the bridge assigns the task an **internal IP** (not a VPC IP — this address only exists inside the Docker host, invisible to the wider VPC).

---

## ⚠️ Port Mapping Is Mandatory in Bridge Mode

> **Since the task has no IP of its own that's reachable from outside the host, external access requires explicit port mapping**: a specific host port is mapped to a specific container port. Example: host port 8080 might map to task-1's container port 80; host port 8081 might map to task-2's container port 80 — ⚠️ **each task needs a DIFFERENT host port, since they're all sharing the one host ENI/IP.**

**Configuring this**: when setting up a task's container in bridge mode, both a **host port** and a **container port** must be specified — directly contrasting with awsvpc mode, which only asks for a container port (since it doesn't need this mapping at all).

---

## Exam Framing

> "A task needs to share the underlying host's network interface rather than getting its own dedicated one, using explicit host-to-container port mapping" → **bridge mode**, EC2-only, not supported by Fargate. Remember: **bridge mode requires configuring BOTH a host port and a container port** — the defining configuration difference from awsvpc's container-port-only setup.
`,
    },
    {
      id: "ecs-network-mode-default",
      title: "ECS Network Mode – Default: The Windows-Only Equivalent of Bridge Mode",
      shortDesc: "The 'Default' mode specifically means NAT networking for a Windows container host — Linux hosts use bridge as their default instead, so this mode's name is a bit misleading",
      visuals: [],
      content: `## ⚠️ Standalone Docker's OS-Dependent Default Networking

> **Standalone Docker's default networking behavior itself depends on the host OS**: ⚠️ **a Linux Docker host defaults to bridge mode; a Windows Docker host defaults to NAT mode instead** — Windows containers don't support Linux-style bridge networking at all.

---

## What ECS's "Default" Mode Actually Means

> ⚠️ **In ECS specifically, the "default" network mode option is really just NAT networking, and it's supported ONLY on Windows container hosts.** ⚠️ **Linux container hosts do not support this "default" mode at all** — a Linux host instead uses the explicitly-named "bridge" mode covered in the previous topic for equivalent functionality.

**The practical decision rule**: running a Windows-based application (e.g. a .NET/IIS workload) on an EC2 Windows container host, and not using awsvpc? → select **default**. Running on a Linux container host instead? → select **bridge**, not default (default won't even function correctly there).

---

## ⚠️ Fargate and Windows

> Since Fargate only supports awsvpc mode, this "default"/NAT mode is exclusively relevant to **EC2 launch type with a Windows container host** — never Fargate, and never a Linux EC2 host either.

---

## Exam Framing

> "A Windows-based ECS task needs NAT-style networking on an EC2 host" → **default mode.** ⚠️ **Don't confuse this with a generic "recommended default"** — the name is specific to this one Windows-only networking behavior, not a general best-practice recommendation (awsvpc remains the generally-recommended mode for most workloads).
`,
    },
    {
      id: "ecs-network-mode-host-and-none",
      title: "ECS Network Mode – Host and None: No Virtual Bridge, or No Networking At All",
      shortDesc: "Host mode skips the bridge entirely and shares the host's IP directly (faster, but every task needs a unique port); None mode disables outside networking entirely",
      visuals: [],
      content: `## Host Mode: No Virtual Bridge At All

> **Host mode removes the virtual bridge that bridge mode relies on entirely** — ⚠️ **a task in host mode uses the SAME IP address as the underlying host ENI directly**, with no NAT, no bridge, no internal IP translation layer whatsoever.

**The direct consequence**: since every task shares the exact same host IP, ⚠️ **only the container's port number distinguishes one task's traffic from another's — port mapping in the bridge-mode sense doesn't exist, but every task MUST use a unique port**, since two tasks cannot both bind the same port on the one shared IP. Attempting to run two tasks on the same port produces an error.

**Configuring it**: only a **container port** needs to be specified (similar to awsvpc in that respect) — but unlike awsvpc, that port is reached directly via the host's own IP, not a task-specific one.

**Performance note**: ⚠️ **host mode is faster than bridge mode**, since there's no NAT/routing layer for traffic to pass through — requests go straight to the host ENI and directly to the bound port.

**Availability**: EC2 only (Fargate doesn't support it), and specifically Linux — not supported on Windows container hosts.

---

## None Mode: No External Networking At All

> **None mode disables outside-world network access for the container entirely.** ⚠️ **Best for testing scenarios or special-purpose workloads that genuinely don't need any external connectivity** — there's little configuration involved since there's effectively nothing to expose. Also EC2-only, not supported by Fargate.

---

## Exam Framing

> "Fastest possible EC2-based networking mode, at the cost of every task needing a distinct port since they all share the host's IP directly" → **host mode.** "A task that deliberately should have zero external network access, e.g. for isolated batch processing or testing" → **none mode.** Both are EC2-only — Fargate never supports either.
`,
    },
    {
      id: "ecs-network-mode-port-mapping-summary",
      title: "ECS Network Modes – The Port Mapping Cheat Sheet (A Common Interview Question)",
      shortDesc: "Only bridge and default modes actually require configuring a host port; awsvpc and host only need a container port; none needs nothing at all",
      visuals: [],
      content: `## The Four-Mode Comparison (None Excluded — Nothing to Configure)

> ⚠️ **This exact comparison is called out as a favorite interview question** — worth memorizing as a clean summary table rather than five separate mental models.

| Network Mode | Port Mapping Needed? | IP Type |
|---|---|---|
| **awsvpc** | ❌ Container port only | Task's own dedicated private IP |
| **Bridge** | ✅ Host port + container port | Shared host ENI, internal bridge IP per task |
| **Default** (Windows NAT) | ✅ Host port + container port | Shared host ENI (Windows-specific NAT) |
| **Host** | ❌ Container port only (but must be unique per task) | Shared host IP directly, no translation layer |

---

## ⚠️ The Core Pattern to Remember

> **Only two modes genuinely require explicit host-port-to-container-port mapping: Bridge (Linux) and Default (Windows)** — both because multiple tasks are sharing one underlying network layer that needs traffic routed to the correct task. ⚠️ **awsvpc and Host mode both skip port mapping entirely**, but for opposite reasons: awsvpc because each task has its own fully separate IP (no sharing, no need for a distinguishing port mapping), and Host because the task deliberately shares the host's IP directly with no translation layer to configure a mapping through in the first place.

---

## Exam Framing

> "Which ECS network modes require configuring both a host port and a container port?" → **only Bridge and Default** — the two modes where multiple tasks genuinely share one underlying network layer that has to route incoming traffic to the correct task by port number. awsvpc and Host both need only a container port (for entirely different underlying reasons), and None needs no port configuration since there's no external access to route at all.
`,
    },
    {
      id: "ecs-project-step5-task-size",
      title: "ECS Project Step 5 (Part 5) – Task Size: CPU/Memory Sizing, and Why It Behaves Differently on Fargate vs EC2",
      shortDesc: "Fargate forces you into fixed, compatible CPU-memory pairs; EC2 lets you pick any value — but only if your actual instance has that much capacity to give",
      visuals: [],
      content: `## What Task Size Actually Configures

> **Task size defines how much CPU and memory ECS allocates to a task** — directly analogous to choosing an EC2 instance type's vCPU/RAM when hosting an application on a VM, just applied to a task instead of a whole instance.

---

## ⚠️ Fargate: Fixed, Compatible CPU/Memory Combinations Only

> **On Fargate, CPU and memory must be selected as a compatible PAIR from a fixed list — arbitrary combinations are not allowed.** Example: selecting 1 vCPU restricts memory to a specific compatible range (e.g. 2GB–8GB) — anything outside that range is simply not selectable. ⚠️ **Memory increases in fixed 1GB increments only** — decimal values like 4.1GB or 4.6GB are not possible; the next step up from 3GB is exactly 4GB, nothing in between.

**Since Fargate is serverless, capacity is never actually a constraint** — whatever valid CPU/memory combination is selected, Fargate provisions it on demand. There's no risk of "not enough resources available" the way there is on EC2.

---

## ⚠️ EC2: Any Value, But Bounded by the Actual Instance's Real Capacity

> **On EC2, task size can be set to any value directly** — no forced compatible-pair restriction like Fargate. ⚠️ **But whatever is specified must actually fit within the real capacity of the EC2 instance(s) registered in the cluster** — the task size is a request against real, finite hardware, not an abstraction like Fargate's on-demand provisioning.

**Concrete failure scenario**: a cluster's EC2 infrastructure is a T2 micro (1 vCPU, 1GB RAM). A task definition requests 1 full vCPU. ⚠️ **This task can fail to launch, because the actual EC2 instance genuinely may not have that much CPU free to allocate** — the request exceeds what the real underlying hardware can actually provide.

**The practical rule**: ⚠️ **task size on EC2 must always be checked against the real, available capacity of the registered EC2 instances** — mismatches here are a genuine, common source of task launch failures, not a compatibility-list restriction like on Fargate.

---

## ⚠️ Right-Sizing: Avoid Over-Provisioning Either Way

> **Over-allocating CPU/memory "just to be safe" isn't free** — more resources means a higher bill, on both Fargate (billed per allocated vCPU/memory) and EC2 (larger instances cost more). ⚠️ **Correct sizing genuinely can't be determined up front purely by guessing** — it comes from running the application, monitoring its real resource usage, and adjusting the task size based on that observed data, the same right-sizing principle that applies to EC2 instance selection generally.

---

## Exam Framing

> "A task fails to launch on an EC2-backed ECS cluster even though the task definition itself is otherwise correct" → **check whether the task's requested CPU/memory actually fits within the real capacity of the registered EC2 instance(s)** — this is an EC2-specific failure mode that simply doesn't exist on Fargate, since Fargate provisions matching capacity on demand rather than drawing from a fixed, already-existing instance. Remember Fargate's fixed CPU-memory compatible-pair restriction (with 1GB memory increments) as a separate, distinct constraint from EC2's real-capacity limitation.
`,
    },
    {
      id: "ecs-task-role-vs-task-execution-role",
      title: "ECS Project Step 5 (Part 6) – Task Role vs Task Execution Role: Two IAM Roles, Two Different Users",
      shortDesc: "Task role is permission FOR the application code inside the container; task execution role is permission for the ECS agent to even get the task running in the first place",
      visuals: [],
      content: `## ⚠️ The Core Distinction: Who Actually Uses the Permission

> **Both are IAM roles attached to a task definition, but they're used by two completely different actors**: ⚠️ **task role is used by the APPLICATION CODE running inside the container; task execution role is used by the ECS AGENT** (running on the container host, managing the task's lifecycle) — not the application at all.

---

## Task Role: Permission for the App's Own AWS Calls

> **Purpose: gives the application code inside the container permission to access AWS services at runtime.** Concrete example: the demo PHP application uploads a file to an S3 bucket — ⚠️ **without a task role granting S3 permissions, the application itself cannot store that file in S3, regardless of any other configuration being correct.**

**When it's used**: during actual runtime, whenever the containerized app makes an AWS API call — e.g. the moment a user clicks "upload" and the app calls S3's PutObject.

**Typical permissions granted**: S3 GetObject/PutObject, DynamoDB read/write, SQS SendMessage, Secrets Manager GetSecretValue — i.e. whatever AWS services the *application's own logic* actually calls.

**Credential mechanism**: ⚠️ **temporary credentials injected directly INSIDE the container**, available to the application code itself.

---

## Task Execution Role: Permission for ECS to Even Start the Task

> **Purpose: gives the ECS agent permission to pull the container image, push logs, and fetch secrets during task STARTUP** — ⚠️ **entirely before the application's own code ever runs.** Concrete example: the task's image lives in a private ECR repository — the ECS agent needs its own permission to authenticate to ECR and pull that image; the application itself has no role in this step at all.

**Typical permissions granted**: ECR GetAuthorizationToken + image pull, CloudWatch Logs (for streaming container logs), and Secrets Manager (if secrets are injected as environment variables) — i.e. infrastructure-level operations needed to get the task running and observable, not application logic.

**Credential mechanism**: ⚠️ **temporary credentials used by the ECS agent OUTSIDE the container** — the application code never sees or uses these credentials directly.

---

## ⚠️ Task Execution Role Is Conditional — Task Role Usually Isn't

> **If the application doesn't call any AWS service at all** (e.g. a simple static webpage with zero AWS integration), **the task role can be set to "none" entirely** — there's nothing for it to grant permission to.

> **If the container image is pulled from a PUBLIC Docker Hub repository (not a private ECR repo) and the task doesn't need CloudWatch logs or secrets, the task execution role can also be skipped** — anyone can pull a public image with no authentication required, so there's nothing for the agent to need permission for. ⚠️ **For this project specifically, the image is stored in private ECR, so a task execution role is required.**

---

## Exam Framing

> "A containerized application successfully starts, pulls its image, and logs to CloudWatch — but fails specifically when trying to write to an S3 bucket" → **the task role is missing S3 permissions** (the agent already succeeded at startup, meaning the execution role was fine — this is an application-runtime permission gap). "A task fails to even launch because ECS can't pull the image from a private ECR repository" → **the task execution role is missing ECR permissions** — this happens before the application ever runs, so it's never a task-role problem. Remember the clean split: **task role = the app's own AWS calls; task execution role = ECS's infrastructure operations to get the task running.**
`,
    },
    {
      id: "ecs-project-step5-placement-constraint",
      title: "ECS Project Step 5 (Part 7) – Task Placement Constraint: Member Of vs Distinct Instance",
      shortDesc: "Fargate is 100 percent serverless, so there's no server to place a task ON in the first place — placement constraints only exist for the EC2 launch type",
      visuals: [],
      content: `## What a Placement Constraint Controls

> **A placement constraint controls WHICH container host a task is allowed to run on, inside an ECS cluster.** Two worked scenarios: (1) a cluster has mixed EC2 instance types, and a task must run specifically on T3 instances only; (2) two tasks must each run on a DIFFERENT container host, for high availability.

---

## ⚠️ Fargate: Not Supported At All

> **Placement constraints are not supported on Fargate.** Since Fargate is 100% serverless, there is no actual server to place a task ON in the first place — the entire concept of "run this task on a specific host" doesn't apply. ⚠️ **Placement constraints are exclusively an EC2 launch-type feature.**

---

## ⚠️ A Failed Match Means the Task Stays Pending, Not Failed Outright

> **If a placement constraint is configured (e.g. "must run on a T3 instance") but no matching EC2 instance actually exists in the cluster, the task stays in a PENDING state** — it does not error out immediately. ⚠️ **The instance type (or whatever condition is defined) must genuinely be available among the cluster's registered EC2 instances**, or the task simply waits indefinitely for a match that never comes.

---

## Two Constraint Types: Member Of vs Distinct Instance

### Member Of

> **Purpose: run the task only on an EC2 instance matching a custom query expression, written in Cluster Query Language.** Example: an expression stating the task must launch specifically on a T3 instance — structured as subject, operator, and condition (a SQL-like expression syntax).

**Where to configure**: during task definition creation, ⚠️ **OR it can be skipped there and configured later, when the task or service is actually launched or run** — both configuration points are valid.

### Distinct Instance

> **Purpose: ensure each task runs on a DIFFERENT EC2 instance** — directly solving the high-availability scenario (two tasks, two separate hosts). ⚠️ **No SQL expression is needed at all** — there's no specific instance type or condition being specified, just a requirement that tasks land on separate hosts.

**Where to configure**: ⚠️ **distinct instance is NOT available at the task definition stage — it can only be configured when the task or service is actually launched or run.** This is the key practical difference from member of, which offers both configuration points.

---

## Exam Framing

> "Placement constraints don't seem to be an option for a Fargate-launched task" → **expected — Fargate is fully serverless, so there is no server to constrain placement onto; this feature is EC2-only.** "A task with a placement constraint never launches and just sits in pending" → **check whether an EC2 instance actually matching the constraint's condition exists in the cluster** — no match means indefinite pending, not an immediate failure. Remember the split: **member of = SQL-like expression, configurable at task-definition time or launch time; distinct instance = no expression needed, configurable ONLY at launch/run time.**
`,
    },
    {
      id: "ecs-project-step5-container-configuration",
      title: "ECS Project Step 5 (Part 8) – Container Configuration: Name, Image, Essential Flag, Private Registry Auth, and Read-Only Filesystem",
      shortDesc: "The essential flag decides whether one dying container takes down the whole task, and private-registry auth is only needed at all when the image ISN'T sitting in your own private ECR",
      visuals: [],
      content: `## Name and Image URI

> **Name is simply the label assigned to the container within the task definition** (e.g. "web-application"). **Image is the URI pointing to where the Docker image actually lives** — for this project, the ECR image URI copied directly from the ECR console. ⚠️ **The image is NOT required to come from ECR specifically — any registry works** (Docker Hub, Azure Container Registry, Google Artifact Registry, etc.), public or private, as long as a valid image URI is provided.

---

## ⚠️ Essential Container: One Failure Can Take Down the Whole Task

> **A task can bundle multiple containers, and any one (or several) of them can be flagged "essential."** ⚠️ **If an essential container fails or stops, the ENTIRE task stops** — not just that one container. ⚠️ **By default, the first container added is automatically marked essential**, but this can be reassigned to any container, or to multiple containers at once.

**The multi-essential trap**: ⚠️ **if multiple containers are all marked essential, the task fails the moment ANY ONE of them goes down** — not only if all of them fail. This makes the essential flag a real architectural decision: mark only the container(s) whose failure should genuinely justify killing the whole task, not every container indiscriminately.

---

## Private Registry Authentication — Only Needed in Specific Cases

> **Three distinct authentication scenarios**:

1. **Public registry (e.g. Docker Hub public image)**: ⚠️ **no authentication needed at all.**
2. **Private ECR repository (this project's case)**: ⚠️ **also requires NO manual authentication configuration** — ECR automatically authenticates using the task's already-configured task execution role (see the earlier task-role-vs-task-execution-role topic). Since the execution role already grants ECR pull permissions, nothing further is needed here.
3. **Private registry OUTSIDE AWS** (private Docker Hub, private Azure/Google registries): ⚠️ **credentials ARE required, but they can never be typed directly into the task definition.** The reason: a task definition is ultimately stored as a JSON document, and hardcoding a username/password into that JSON is explicitly flagged as bad practice. ⚠️ **The correct approach: store the credentials in AWS Secrets Manager first, then reference that secret's ARN in the task definition's private registry authentication field** — the task definition never holds the raw credentials itself.

**For this project specifically**: since the image sits in private ECR and the task execution role already handles authentication automatically, ⚠️ **no Secrets Manager setup is needed at all** — this section is simply skipped.

---

## Port Mapping (Recap, Tied to Network Mode)

> Directly connects back to the five network modes covered earlier: ⚠️ **awsvpc needs only a container port; bridge and default (Windows NAT) both need a host port AND a container port; host needs only a container port (but it must be unique per task); none disables port mapping entirely** — selecting none as the network mode grays out the port mapping section, since no external access is intended at all.

---

## Root Filesystem: Read-Only Toggle

> **Controls whether the container's root filesystem is locked to read-only.** ⚠️ **When enabled, the container can read from its filesystem but cannot write to it or modify any configuration file inside it** — a security hardening option for containers that deliberately don't need to persist or alter any local data. ⚠️ **This setting does not apply to Windows containers — it's Linux-only.**

---

## Exam Framing

> "A task with two containers stops running entirely, even though only one container actually crashed" → **check whether that container was flagged "essential"** — an essential container's failure always takes the whole task down, by design. "A task definition needs to pull a private image but no authentication was configured, and it still works" → **the image is very likely in ECR, and the task's execution role is already providing the authentication automatically** — this is the ONLY private-registry case where zero manual auth setup is needed. Any other private registry (Docker Hub, Azure, Google) requires storing credentials in **Secrets Manager** and referencing the secret's ARN — never typed directly into the task definition JSON.
`,
    },
    {
      id: "ecs-project-step5-resource-allocation-limits",
      title: "ECS Project Step 5 (Part 8.2) – Resource Allocation Limits: Task-Level Size vs Per-Container CPU/Memory/GPU",
      shortDesc: "Task size is a shared box every container must fit inside — container-level limits stop one greedy container from starving the others sharing that same box",
      visuals: [],
      content: `## Two Levels of Resource Control

> **CPU and memory can be limited at TWO levels: task level (total resources for the whole task, shared across all its containers) and container level (a per-container cap within that shared pool).** ⚠️ **Task size (covered in the earlier "Task Size" topic) is mandatory for Fargate and optional for EC2** — EC2 already has its own instance size acting as a natural ceiling, whereas Fargate has no underlying instance at all, so task size is the only way to set a limit.

**The "shared box" mental model**: whatever CPU/memory is set at task level is a total pool — e.g. 4 vCPU and 512MB RAM for the whole task — that ALL containers inside that task must collectively fit inside.

---

## ⚠️ Why Container-Level Limits Matter: Preventing One Container From Starving Another

> **Without container-level limits, nothing stops one container from consuming most of the task's shared resources, leaving little or nothing for the others.** Concrete example: a task with 4 vCPU total and two containers — if container 1 is left unrestricted and consumes 3 vCPU, container 2 is stuck with only 1 vCPU, even if it genuinely needs more. **Container-level allocation lets each container's CPU/memory be explicitly capped**, preventing this kind of resource imbalance between containers sharing the same task.

---

## The Four Container-Level Settings

**1. CPU** — CPU units for the container, e.g. 0.25, 0.5, or 1 full vCPU. Values are expressed as decimals of a vCPU (quarter, half, whole), not raw units.

**2. Memory hard limit** — ⚠️ **the container is KILLED outright if it tries to exceed this limit.** Values set in GB via the console (e.g. 0.25 GB rather than 256 — the console works in GB, not MB).

**3. Memory soft limit** — ⚠️ **a RESERVATION, not a kill threshold: ECS tries to keep at least this much memory free and available for the container**, without forcibly terminating it for exceeding the number. This is framed as the "safer, friendlier" of the two memory settings — it guarantees a baseline of available memory rather than punishing overages.

**4. GPU** — defines how many physical GPUs the container can use, relevant for AI workloads or image/video processing and rendering. ⚠️ **GPU can ONLY be set at the container level — there is no task-level GPU setting.**

---

## ⚠️ Why the GPU Field Is Usually Grayed Out

> **GPU becomes selectable only when ALL of these conditions are met**: (1) the launch type must be EC2 ONLY — ⚠️ **GPU is not supported on Fargate at all, and a task definition that mixes Fargate and EC2 launch-type compatibility will also gray this out**, since Fargate's lack of GPU support poisons the mixed option; (2) the EC2 instance(s) registered in the cluster must actually be a GPU-capable instance type (e.g. NOT a T2 micro, which has no GPU hardware at all); (3) the EC2 instance must use a **GPU-optimized AMI** specifically, not a standard ECS-optimized AMI.

**Practical implication**: if no container host currently exists in the cluster, the console may show the GPU option available speculatively (assuming a compatible host will be added) — but with an existing, non-GPU-capable host already registered, the field stays firmly grayed out.

---

## Exam Framing

> "A container keeps getting killed under load, even though the overall task has plenty of spare CPU/memory" → **check the container-level memory HARD limit** — hard limit overages result in termination, unlike the soft limit, which only reserves memory without killing the container. "GPU can't be selected while configuring a container" → **verify all three conditions: EC2-only launch type (never Fargate, never a Fargate+EC2 mix), a genuinely GPU-capable EC2 instance type in the cluster, and a GPU-optimized AMI** — missing any one of these keeps the field grayed out.
`,
    },
    {
      id: "ecs-project-step5-environment-variables",
      title: "ECS Project Step 5 (Part 9) – Environment Variables: Config Without a Rebuild",
      shortDesc: "Hardcode the S3 bucket name into the PHP code and every bucket change means rebuild-repush-repull; pass it as an environment variable instead and it's a config edit, not a code change",
      visuals: [],
      content: `## ⚠️ The Problem Environment Variables Solve

> **Two options exist for supplying a config value (e.g. an S3 bucket name and AWS region) to the application: hardcode it directly in the PHP source code, or pass it in as an environment variable at container-run time.** ⚠️ **Hardcoding means every config change requires editing the code, rebuilding the Docker image, re-pushing to ECR, and re-pulling** — a genuinely long, repetitive cycle for what should be a trivial change. **Passing it as an environment variable avoids this entirely**: the container-run command (or, for ECS, the task definition) supplies the value directly, with zero code changes and zero image rebuild needed.

**Demonstrated locally first**: running the container manually on an EC2 instance via Docker, the bucket name and region are passed directly in the container-run command rather than baked into the code — proving the same application, unmodified, can point at a different bucket or region purely by changing what's passed in at runtime.

---

## What an Environment Variable Actually Is

> **A small key-value pair passed to the container at runtime** — e.g. key "S3_BUCKET", value "my-x-bucket." ⚠️ **They function as configuration the application needs, without requiring any change to the application's own code.**

---

## ⚠️ Environment Variables Are Entirely Optional

> **If a value is never going to change, hardcoding it directly in the code is a valid choice — environment variables are optional, not mandatory.** Simply not specifying anything in the task definition's environment variable section means the app falls back to whatever is hardcoded.

---

## Why They're Used (The Core Motivations)

1. **Avoid hardcoding values inside the code.**
2. **Support different values across environments** (dev, test, prod) without changing the application itself.
3. **Keep secrets and configuration outside the codebase** — separating "what the app does" from "what values it happens to be configured with right now."

---

## Configuring Environment Variables in a Task Definition

> **Two supported methods**: (1) **manually add key-value pairs directly** in the task definition's environment variables section (suitable for a handful of values — e.g. S3_BUCKET and AWS_REGION for this project); (2) **for a large number of environment variables, store them in a file and upload that file to S3**, then reference the file's S3 location in the task definition instead of listing every key-value pair by hand.

---

## Exam Framing

> "An application's configuration (e.g. which S3 bucket to use) needs to differ between environments, without maintaining separate code branches or rebuilding the image for each environment" → **environment variables**, set per task definition — the same image runs unmodified across dev/test/prod, differentiated purely by what's injected into each environment's task definition. Remember: **environment variables are optional** — a value that genuinely never changes can still be hardcoded, and a task definition simply left with no environment variables falls back to the application's own hardcoded defaults.
`,
    },
    {
      id: "ecs-project-step5-storage-fargate",
      title: "ECS Project Step 5 (Part 10) – Storage Options on Fargate: Ephemeral, Bind Mount, EBS, and EFS",
      shortDesc: "One shared ephemeral disk per task regardless of container count, invisible to containers by default — and only EFS actually survives the task stopping or spans multiple tasks",
      visuals: [],
      content: `## Ephemeral Storage: The Automatic Default

> **Every Fargate task gets exactly ONE shared ephemeral storage volume — 20GB by default, upgradeable up to 200GB — regardless of how many containers run inside that task.** ⚠️ **Three containers in one task still share a single ephemeral volume, not one each.** This storage is used internally by ECS to store container image layers — ⚠️ **containers CANNOT access or store data on it by default.**

**Persistence**: ⚠️ **NOT persistent — stopping the task deletes the ephemeral storage along with it.**

---

## Bind Mount: Sharing the Ephemeral Volume Between Containers

> **By default, containers in the same Fargate task cannot share data via ephemeral storage at all.** ⚠️ **To enable sharing, a NAMED volume must be defined and explicitly bind-mounted into each container that needs access** — this named volume acts as shared space carved out of the task's ephemeral storage. ⚠️ **Mounting is configured through the Dockerfile.**

- **Persistent?** ⚠️ **No — the underlying ephemeral storage itself isn't persistent, so neither is anything bind-mounted onto it.**
- **Shared across tasks?** No — ephemeral storage belongs exclusively to the one task that created it.
- **Shared between containers in the SAME task?** ⚠️ **Yes — this is exactly what bind mount exists for.**

---

## Amazon EBS: CLI/JSON Only, Not in the Console

> **Block-level storage attached per task — only ONE EBS volume per task.** ⚠️ **On Fargate, EBS is supported only via CLI, SDK, or a raw JSON task definition — it is NOT available in the ECS console UI at all**, which is exactly why it doesn't appear as a selectable option when configuring storage through the console.

- **Persistent?** ⚠️ **Conditional — persistent when attached to a standalone TASK, but ephemeral when attached to a SERVICE.**
- **Shared across tasks?** No.
- **Shared between containers in the same task?** Yes — same as ephemeral storage.
- **Mount required?** Yes, via the Dockerfile.

---

## Amazon EFS: The Only Genuinely Persistent, Multi-Task Option

> **EFS (Elastic File System) is a Linux-based, fully managed network file system — the most useful storage option of the four**, since it's the only one that's both persistent AND shareable across MULTIPLE tasks (not just multiple containers within one task).

- **Persistent?** ⚠️ **Yes.**
- **Shared across tasks?** ⚠️ **Yes — the only one of the four options that supports this.** Two separate ECS tasks needing a common shared storage location should use EFS.
- **Shared between containers in the same task?** Yes.
- **Mount required?** Yes, via the Dockerfile.

---

## ⚠️ What Fargate Explicitly Does NOT Support

> **Fargate does not support Docker volumes or FSx for Windows** — ⚠️ **both of those are EC2-launch-type-only options**, covered separately in the next topic on EC2 storage. Calling this out explicitly here avoids assuming Fargate's storage options are a strict subset that also includes these two.

---

## Exam Framing

> "Two separate Fargate tasks need to read and write to the same shared storage location" → **EFS** — the only Fargate storage option that persists AND spans multiple tasks; ephemeral storage, bind mount, and EBS are all scoped to a single task at most. "A Fargate task's EBS volume needs to be configured, but the option isn't showing up in the console" → **expected — EBS on Fargate is CLI/SDK/JSON-only, never available through the ECS console UI.** Remember the persistence split: ephemeral and bind mount both die with the task; EBS is conditionally persistent (standalone task = yes, service = no); EFS alone is unconditionally persistent.
`,
    },
    {
      id: "ecs-project-step5-storage-ec2",
      title: "ECS Project Step 5 (Part 10.2) – Storage Options on EC2: Instance Storage, Bind Mount, Docker Volume, EFS/FSx — and No Ephemeral Storage At All",
      shortDesc: "EC2 gives a real, persistent EBS-backed filesystem containers are isolated from by default — bind mount and Docker volume both punch through that isolation, just via different mechanisms",
      visuals: [],
      content: `## The Foundation: EC2 Instance Storage

> **The EC2 launch type's container host already has an EBS volume attached (e.g. 20GB), used both for the host's own operating system AND as the backing storage for any container's writable layer.** ⚠️ **Containers are isolated from the host's filesystem by default** — even though a container's writable layer technically lives on that same EBS volume, it cannot directly access files or folders belonging to the host OS itself (e.g. an "app data" folder sitting in the host's filesystem, outside any container).

---

## Bind Mount: Two Concrete Use Cases

> **Bind mount attaches a specific directory or file from the EC2 instance's storage directly into a container**, punching through the default isolation. ⚠️ **Two distinct use cases**: (1) letting a container access data that already lives on the container host's filesystem (e.g. that "app data" folder); (2) mounting the SAME host directory into multiple containers within the same task, turning it into shared storage between them.

- **Persistent?** ⚠️ **Yes — as long as the EC2 instance itself keeps running** (data lives on the host's real filesystem, not something ephemeral).
- **Shared between containers in the same task?** Yes, if the same directory is mounted into each.
- **Mount required?** Yes — no automatic sharing; must be explicitly configured with a source path.

---

## Docker Volume: The Newer, Sharing-Focused Alternative

> **Docker natively supports both bind mount (the traditional method) and Docker volume (the newer method) — Docker volume is specifically built for sharing data across multiple containers**, rather than bind mount's dual purpose of both host-filesystem access AND sharing. ⚠️ **Docker-managed volumes live under /var/lib/docker/volumes on the EC2 instance's storage.**

- **Persistent?** Yes, as long as the instance runs (same underlying host-storage mechanism as bind mount).
- **Shared across tasks?** No — scoped to the one container host, not portable across tasks.
- **Shared between containers in the same task?** ⚠️ **Yes — this is the entire point of Docker volume.**
- **Mount required?** Yes, via mount options in the task definition.

---

## Additional EBS Volumes

> **The container host's default EBS volume can simply be resized (AWS allows increasing an existing EBS volume's capacity), or an entirely separate EBS volume can be attached to the instance** — and once attached, that additional volume is accessible from containers using the exact same bind mount / Docker volume mechanisms already covered.

---

## EFS and FSx: The External, Cross-Task Options

> **Both EFS (Elastic File System — Linux) and FSx (specifically FSx for Windows File Server here) are fully external, managed AWS file systems, accessible from MULTIPLE EC2 instances and tasks at once** — unlike everything covered above, which is tied to one specific container host's local storage. ⚠️ **Because they're external, data survives even if the task stops or the EC2 instance is terminated** — genuinely persistent, and genuinely shareable ACROSS tasks, not just across containers within one task.

**The OS-based decision rule**: Linux container host → **EFS**; Windows container host → **FSx for Windows File Server.**

---

## ⚠️ The Critical Final Point: No Ephemeral Storage on EC2

> **Fargate's automatic 20GB-default/200GB-max ephemeral storage configuration simply does not exist on the EC2 launch type at all** — ⚠️ **ephemeral storage is exclusively a Fargate concept.** On EC2, every storage option requires deliberately choosing from instance storage, bind mount, Docker volume, additional EBS, EFS, or FSx — there's no automatic fallback disk the way Fargate provides one by default.

---

## Exam Framing

> "A container on an EC2-launched task needs to read a folder that already exists on the underlying host's filesystem" → **bind mount** — the specific mechanism for reaching into the container host's own filesystem, something Docker volume doesn't do. "Multiple EC2-launched tasks (not just multiple containers within one task) need a shared, persistent storage location" → **EFS (Linux) or FSx for Windows File Server (Windows)** — the only two options here that are genuinely external and cross-task, versus everything else being scoped to a single container host's local storage. Remember: **ephemeral storage is Fargate-only and simply isn't a concept on EC2.**
`,
    },
    {
      id: "ecs-project-step6-create-task-definition-lab",
      title: "ECS Project Step 6 – Creating the Task Definition (Console Walkthrough)",
      shortDesc: "Two prerequisite resources first (an S3 bucket and a task role granting S3 access), then every earlier task-definition topic gets applied together in one real console flow",
      visuals: [],
      content: `## ⚠️ Two Prerequisite Resources Must Exist Before the Task Definition

> **The web application stores uploaded images in an S3 bucket, so before creating the task definition, two resources must already exist**: (1) an **S3 bucket** to actually store the data, and (2) an **ECS task role** granting the application permission to write to that bucket. ⚠️ **Both must be created FIRST — the task definition references them, it doesn't create them.**

---

## Step A: Create the S3 Bucket

1. Go to **S3** → choose a region (e.g. Mumbai / ap-south-1) → **Create bucket**, under General Purpose bucket.
2. Give the bucket a globally unique name (e.g. "my-web-app-new").
3. No public access or special permissions needed — a plain private bucket is enough.
4. ⚠️ **Note down two things after creation: the exact bucket name, and the exact region it was created in** — both values get typed into the task definition's environment variables later.

---

## Step B: Create the ECS Task Role

1. Go to **IAM → Roles → Create role**.
2. Trusted entity type: **AWS service** → specifically **Elastic Container Service → Elastic Container Service Task** (not just "EC2" or a generic service role — the task-specific trust relationship matters).
3. Attach a permissions policy: **S3 full access** for simplicity in this walkthrough. ⚠️ **Explicitly flagged as NOT production-appropriate — production should use a custom policy scoped to only the specific bucket**, not full S3 access.
4. Name the role descriptively (e.g. "ECS-task-role-my-web-app") → **Create role.**

---

## Step C: Create the Task Definition Itself

1. **ECS → Task Definitions → Create new task definition.** Give it a name (e.g. "my-web-app-final").
2. **Launch type: Fargate.**
3. **OS/architecture: Linux, x86-64.**
4. **Network mode: awsvpc** — the only option, since Fargate was selected (matches the earlier network-mode topic exactly).
5. **Task size: 1 vCPU, 2GB memory** — sufficient for this application.
6. **Task role: select the ECS task role created in Step B** — this is what lets the running application actually write to S3.
7. **Task execution role: choose "Create new role"** — ⚠️ **AWS automatically creates a role with the standard Amazon ECS Task Execution Role policy attached, covering image pulls from ECR, CloudWatch log delivery, and fetching secrets at startup** — no manual policy authoring needed for this default case.
8. **Container name**: e.g. "web" → **Image**: paste the ECR image URI copied from the ECR repository (from the earlier push-image topic). ⚠️ **No private registry authentication needed here, since the image execution role already covers ECR authentication automatically** — private registry setup is only relevant for non-ECR private registries.
9. **Container port: 80** (the application's listening port) — left as default otherwise.
10. **CPU/GPU limits at the container level: skipped** — not needed for this simple single-container setup.
11. **Environment variables — the two values noted in Step A get typed in here**: key \`S3_BUCKET\` → value = the exact bucket name from Step A; key \`AWS_REGION\` → value = the exact region from Step A (e.g. "ap-south-1"). ⚠️ **These key names must match EXACTLY what the PHP application code expects** — this is the same environment-variable mechanism covered in the earlier dedicated topic, now applied for real.
12. **Storage: left at the Fargate default (20GB ephemeral)** — no additional storage configuration needed for this application.
13. **Create.** The task definition now exists, ready to actually launch a task or service from — covered in the next lecture.

---

## Exam Framing

> "What two resources must exist before creating a task definition for an application that writes to S3?" → **an S3 bucket to store the data, and a task role granting the application permission to access that bucket** — both created BEFORE the task definition references them. Remember the two-role split carried through this whole walkthrough: **task role = S3 access for the application** (created manually, Step B); **task execution role = ECR pull + CloudWatch logs** (auto-created by AWS via "Create new role," no manual policy work needed for the standard case).
`,
    },
    {
      id: "ecs-project-step7-run-task-capacity-provider",
      title: "ECS Project Step 7 (Part 1) – Running a Task: Desired Count and the Capacity Provider Base/Weight Calculation",
      shortDesc: "Base guarantees a minimum headcount on one provider first — weight only splits whatever's left over, never the whole pool",
      visuals: [],
      content: `## Running a Task From a Task Definition

> **A task requires an existing cluster to run inside.** From the cluster's **Tasks** tab → **Run new task**: select the **task definition family and revision** (visible directly on the task definition itself — a fresh task definition starts at revision 1, though re-recording/editing can bump this higher).

---

## ⚠️ Desired Task Count: Not Just "How Many"

> **Desired task defines how many identical task instances get launched at once.** ⚠️ **ECS automatically spreads these tasks across different subnets/AZs** — the real value isn't just running more copies, it's surviving an AZ outage or capacity issue, plus enabling scalability, batch processing throughput, and blue/green deployment patterns.

**Task group**: mainly useful for EC2 launch type (placement strategy) — ⚠️ **for Fargate, it's essentially just a label with no functional placement effect.**

---

## Capacity Provider Strategy: Base and Weight

> **A capacity provider strategy tells ECS WHERE and HOW to run tasks across multiple capacity providers** (e.g. Fargate and Fargate Spot) — a set of rules defining how many tasks go to each, and whether any provider has a guaranteed minimum.

**Two settings per provider**:
- **Base**: ⚠️ **the minimum, GUARANTEED number of tasks that go to that specific provider FIRST, before anything else is calculated.**
- **Weight**: ⚠️ **determines how the REMAINING tasks (after all bases are satisfied) get split proportionally across the providers.**

---

## ⚠️ Worked Example (The Exact Calculation to Memorize)

> **10 desired tasks. Fargate: base=2, weight=1. Fargate Spot: base=0, weight=3.**

1. **Apply bases first**: Fargate gets its guaranteed 2 tasks immediately (base=2). Fargate Spot gets 0 guaranteed tasks (base=0) — ⚠️ **no task is EVER guaranteed to land on Fargate Spot in this setup.**
2. **Remaining tasks after bases**: 10 − 2 = **8 tasks left** to distribute by weight.
3. **Total weight**: 1 (Fargate) + 3 (Fargate Spot) = **4 parts total.**
4. **Fargate's share of the remainder**: 1/4 = 25% of 8 = **2 more tasks.**
5. **Fargate Spot's share of the remainder**: 3/4 = 75% of 8 = **6 tasks.**
6. **Final totals**: Fargate = 2 (base) + 2 (weight share) = **4 tasks**; Fargate Spot = 0 (base) + 6 (weight share) = **6 tasks.**

⚠️ **The core insight: base is applied ONCE, up front, and only to the total remaining pool does weight apply — weight never operates on the full original count.**

---

## Exam Framing

> "A capacity provider strategy sets Fargate base=2/weight=1 and Fargate Spot base=0/weight=3, with 10 desired tasks — how many land on each?" → **4 on Fargate (2 guaranteed + 2 from the weighted 25% split of the remaining 8), 6 on Fargate Spot (0 guaranteed + 6 from the weighted 75% split)** — remember base is subtracted from the total FIRST, and weight only divides what's left over, never the original full count.
`,
    },
    {
      id: "ecs-project-step7-test-task-security-group",
      title: "ECS Project Step 7 (Part 2) – Testing the Running Task: The HTTPS Gotcha and Default Security Group Troubleshooting",
      shortDesc: "The task's public IP loads a blank or failed page not because anything is broken, but because Chrome silently prepends https to an app that's only listening on http",
      visuals: [],
      content: `## Getting the Task's Public IP

> **Once a task reaches RUNNING status (provisioning typically takes under two minutes), its public IP is visible under the task's Networking tab** — available because the task uses awsvpc networking mode with a dedicated ENI (matching the earlier network-mode topic).

---

## ⚠️ The HTTPS Gotcha

> **Opening the public IP directly in a browser can silently fail — because Chrome automatically prepends https:// to a bare IP address, while the application is actually only listening on plain HTTP.** ⚠️ **The fix: manually strip the https:// prefix from the address bar** and load the bare IP (or explicit http:// instead) — the application works fine once the protocol mismatch is corrected. This isn't an application or infrastructure bug at all — purely a browser default behavior catching an HTTP-only app off guard.

**End-to-end verification**: with the correct protocol, the application loads, a file upload succeeds ("image uploaded successfully"), and the file appears in the configured S3 bucket — confirming the task role, environment variables, and container are all working together correctly.

---

## ⚠️ Default VPC and Default Security Group Troubleshooting

> **Running a task without specifying otherwise uses the account's default VPC and default security group.** ⚠️ **The default security group generally allows all traffic, but application access can still intermittently fail** — if this happens, the fix is checking the task's Networking tab, then the security group's inbound rules, and verifying:

1. **All traffic is allowed** (not restricted to specific ports).
2. **Source is set to allow any IPv4 address** (0.0.0.0/0), rather than a narrower range.

**If the existing inbound rule doesn't match**: delete it, add a new rule allowing all traffic from any IPv4 source, and save — this typically resolves an otherwise-unexplained inability to reach a running task's application.

---

## What's Missing So Far: High Availability

> **A single running task has no automatic replacement if it fails, and no load balancer distributing traffic across multiple copies.** ⚠️ **Attaching a load balancer and providing genuine high availability requires using Services instead of a standalone task** — covered in depth in the next topic.

---

## Exam Framing

> "A newly launched Fargate task's public IP won't load in the browser at all" → **first check whether the browser silently added https:// to a plain-HTTP application** — strip the protocol prefix and retry before assuming an infrastructure problem. "The task is confirmed running but the application still isn't reachable" → **check the default security group's inbound rules for all-traffic-from-0.0.0.0/0** — a narrower or missing rule is a common, easily-fixed cause even when 'default' security groups are generally permissive.
`,
    },
    {
      id: "ecs-service-deployment-config-replica-daemon-az",
      title: "ECS Service Deployment Configuration – Replica vs Daemon, and Automatic AZ Rebalancing",
      shortDesc: "Daemon runs exactly one task per EC2 instance and is permanently grayed out on Fargate, and AZ rebalancing is the setting that quietly fixes an outage's lopsided aftermath",
      visuals: [],
      content: `## Scheduling Strategy: Replica vs Daemon

> **Replica**: ⚠️ **specifies a desired number of tasks, and ECS keeps EXACTLY that many running at all times** — if any task fails, ECS launches a replacement to restore the count. This is the standard, most commonly used strategy.

> **Daemon**: ⚠️ **automatically runs exactly ONE task per EC2 instance in the cluster — directly analogous to Kubernetes DaemonSet.** Example: a cluster with 10 EC2 instances running Daemon mode gets exactly 10 tasks, one per instance, automatically. ⚠️ **Daemon is EC2-launch-type only — it's permanently grayed out on Fargate**, since Fargate has no underlying EC2 instances for a "one task per instance" model to attach to.

---

## ⚠️ Availability Zone Rebalancing: Fixing an Outage's Aftermath Automatically

> **When a service runs across more than one AZ, ECS tries to keep an EQUAL number of tasks in each AZ.** Worked example: 4 desired tasks, 2 AZs selected (e.g. ap-south-1a and ap-south-1b) → normally 2 tasks run in each AZ.

**The outage scenario**: if ap-south-1b goes down entirely, ECS must still maintain 4 running tasks — so ⚠️ **all 4 tasks temporarily get placed in the one remaining healthy AZ (ap-south-1a)**, even though running everything in a single AZ isn't best practice. ⚠️ **This is a forced, temporary compromise to preserve availability, not a permanent design choice.**

**What happens when the failed AZ recovers**: ⚠️ **with AZ rebalancing turned ON, ECS automatically detects the 4-0 imbalance and starts moving tasks back, restoring a 2-2 split once ap-south-1b is healthy again.** ⚠️ **With AZ rebalancing turned OFF, ECS does nothing — all 4 tasks stay permanently stuck in the one AZ even after the other AZ recovers**, leaving the service needlessly exposed to a repeat single-AZ failure. ⚠️ **Recommendation: always enable AZ rebalancing** — leaving tasks unevenly distributed after an outage recovers is genuinely dangerous, not just cosmetically imbalanced.

---

## Exam Framing

> "A service needs exactly one task running on every EC2 instance registered to the cluster, automatically, as instances are added or removed" → **Daemon scheduling strategy** — EC2-only, never available on Fargate. "After an AZ outage forces all tasks into a single healthy AZ, the tasks stay clustered there even once the failed AZ recovers" → **AZ rebalancing was not enabled** — with it on, ECS automatically restores an even distribution once all AZs are healthy again; without it, the imbalance persists indefinitely.
`,
    },
    {
      id: "ecs-service-health-check-grace-period",
      title: "ECS Service – Health Check Grace Period: Giving a Freshly Launched Task Time Before Judging It",
      shortDesc: "Without a grace period, ECS can declare a brand-new task unhealthy simply because its application hasn't finished starting up yet — not because anything is actually wrong",
      visuals: [],
      content: `## How ECS Health Checks Work

> **ECS periodically sends probe packets to each running task and expects a reply.** ⚠️ **If a task stops replying, ECS concludes it's no longer healthy and launches a replacement task to restore the desired count** — this is the underlying mechanism a service relies on to detect and recover from a failed task.

---

## ⚠️ The Problem Grace Period Solves

> **A newly launched replacement task doesn't start serving traffic instantly — the application inside it needs time to initialize (install dependencies, run startup scripts, etc.), and this startup time varies entirely by application.** ⚠️ **Without any grace period, ECS could send a health-check probe to the brand-new task WHILE it's still starting up, get no reply (because the app genuinely isn't ready yet), and incorrectly conclude the task is unhealthy** — potentially killing and relaunching a task that was never actually broken, just still booting.

---

## What Grace Period Actually Configures

> **Health check grace period is the amount of time (in seconds) ECS waits BEFORE beginning health checks on a newly launched task.** ⚠️ **During this window, ECS assumes the task is healthy even if a health check would otherwise fail** — it simply doesn't check at all until the grace period elapses.

**Worked example**: grace period = 60 seconds. ECS launches a new task → for the first 60 seconds, ECS performs NO health checks at all, letting the application fully start → after 60 seconds, ECS begins checking normally.

**Setting the right value**: ⚠️ **entirely dependent on how long the specific application actually takes to become ready** — an application with a slow startup sequence needs a longer grace period; a fast-starting application can use a short one or none at all.

---

## Exam Framing

> "A service keeps churning through newly launched tasks, killing and relaunching them repeatedly even though the application eventually works fine" → **the health check grace period is likely too short (or unset) relative to the application's actual startup time** — ECS is judging tasks as unhealthy before they've finished initializing. The fix: increase the grace period to match the application's real startup duration, giving it time to become ready before health checks begin evaluating it.
`,
    },
    {
      id: "ecs-service-deployment-rolling-update",
      title: "ECS Service Deployment Option 1 – Rolling Update: Min/Max Running Percentage Explained With a Worked Example",
      shortDesc: "Min percent guarantees the floor never drops during an update; max percent sets the temporary ceiling for how many extra tasks can run while old and new versions overlap",
      visuals: [],
      content: `## What a Deployment Controller Decides

> **When updating a service's application version (e.g. version 1 → version 2), the deployment controller decides HOW ECS replaces old tasks with new ones.** ⚠️ **Two strategies exist: Rolling Update (the DEFAULT — used automatically if untouched) and Blue/Green** (covered in the next topic).

---

## Rolling Update: The Core Mechanism

> **ECS updates tasks one at a time (or in controlled batches): start a new task, wait until it's healthy, THEN stop an old task.** ⚠️ **No separate environment is created — the update happens within the same running environment**, unlike blue/green, which uses two distinct environments (blue and green).

**Best fit**: simple, works well for development or testing. ⚠️ **Setting minimum/maximum running percentage too low can cause a short interruption**, since ECS might stop old tasks before new ones are confirmed ready.

---

## ⚠️ Minimum Running Task Percentage

> **Defines how many of the desired tasks must stay running DURING the update itself.** Example: desired task count = 4, minimum = 100% → ⚠️ **all 4 tasks must remain running throughout the entire update, with zero drop in capacity.** Lowering this (e.g. to 50%) means only 2 tasks are guaranteed during the update — ⚠️ **riskier, since incoming load has fewer tasks to be served by during that window.**

---

## ⚠️ Maximum Running Task Percentage

> **Defines the TEMPORARY ceiling on how many tasks are allowed to run simultaneously during the update — expressed as a percentage of the desired count.** Example: desired = 4, maximum = 200% → ⚠️ **up to 8 tasks (4 old + 4 new) can run at the same time temporarily while the update is in progress**, before old tasks get terminated.

---

## ⚠️ Worked Example: 4 Desired Tasks, Min 100%, Max 200%

1. **Starting state**: 4 tasks running version 1. New tasks started = 0. Total = 4.
2. **Update triggered**: ECS starts 4 NEW tasks (version 2) — ⚠️ **allowed because max=200% permits up to 8 total (4 old + 4 new).** Total running temporarily = 8.
3. **New tasks reach healthy status**: once all 4 version-2 tasks are confirmed healthy, ECS stops all 4 OLD version-1 tasks.
4. **End state**: 4 tasks running version 2, zero downtime throughout — ⚠️ **min=100% guaranteed the old tasks never dropped below 4 until the new ones were ready to take over, and max=200% is what gave ECS room to run new and old simultaneously rather than tearing down first.**

---

## ⚠️ Load Balancer: Optional for Rolling Update, Mandatory for Blue/Green

> **Rolling update can work WITHOUT a load balancer** — though if one exists, ECS automatically switches traffic as tasks are replaced. ⚠️ **This is explicitly a point of contrast with blue/green deployment, which absolutely REQUIRES a load balancer to function at all** — covered in the next topic.

---

## Exam Framing

> "A service update needs zero-downtime deployment without spinning up a separate environment, and a load balancer is optional" → **Rolling Update**, the default deployment strategy. "4 desired tasks, minimum running percentage set too low (e.g. 25%), causing a capacity drop during an update" → **increase the minimum running percentage** — a low minimum genuinely risks an availability gap during deployment, it's not just a configuration nicety. Remember the 100%/200% combination from the worked example: **min 100% = old tasks never drop below the desired count; max 200% = room for new and old tasks to briefly coexist** before the old ones are torn down.
`,
    },
    {
      id: "ecs-service-deployment-blue-green",
      title: "ECS Service Deployment Option 2 – Blue/Green: Two Full Environments, a Bake Time Window, and a Mandatory Load Balancer",
      shortDesc: "Blue and green both run in full, side by side, for the entire bake-time window — the switch is just the load balancer's target changing, and cancelling it is a click, not a redeploy",
      visuals: [],
      content: `## The Core Idea: Two Full Environments, Not an In-Place Update

> **Unlike rolling update, blue/green creates an entirely SEPARATE new environment for the new version** — ⚠️ **the current, already-running version is called BLUE; the new, updated version is called GREEN.** Both run in full, side by side, giving a genuine window to test the new version before any real traffic reaches it.

---

## ⚠️ Bake Time: The Testing Window Before the Switch

> **Bake time is a configurable waiting period (0 to 1,440 minutes / 24 hours) — a window after the green version becomes healthy but BEFORE traffic is actually switched to it.** ⚠️ **During bake time, BOTH blue and green run simultaneously, and the load balancer is still sending all traffic to blue** — green is live and healthy, but not yet receiving real users.

**Why this matters**: ⚠️ **rollback during bake time is trivial — just cancel the switch and keep sending traffic to blue, no redeployment needed.** ⚠️ **Once bake time expires and traffic actually switches to green, rollback becomes harder: all blue tasks are stopped, and reverting requires a fresh manual deployment** rather than a simple cancel.

---

## ⚠️ Worked Example: 4 Tasks, 60-Minute Bake Time

1. **Before deployment**: blue environment has 4 tasks running version 1. The load balancer's target is blue — 100% of traffic goes there.
2. **Deployment starts**: ECS creates the green environment with 4 NEW tasks running version 2. ⚠️ **Traffic still goes entirely to blue** — green is running but not yet receiving users.
3. **Bake time window (60 minutes)**: both environments run in parallel — blue serving live traffic, green available for testing. ⚠️ **If a problem is found in green during this window, the switch can simply be cancelled — blue keeps serving traffic, and green is torn down with zero user impact.**
4. **After bake time elapses (if not cancelled)**: the load balancer's target switches from blue to green — ⚠️ **ALL traffic now goes to green, and the old blue tasks are stopped.** Green effectively becomes the new "blue" going forward.

---

## ⚠️ Load Balancer: Mandatory, Not Optional

> **Blue/green deployment absolutely REQUIRES a load balancer — ECS needs it to actually switch traffic from the old environment to the new one.** ⚠️ **This is the direct, explicit contrast with rolling update, where a load balancer is optional.** Blue/green also requires **AWS CodeDeploy** to orchestrate the environment switch — additional setup complexity that rolling update doesn't need.

---

## Advantages and Trade-offs

> **Advantages**: ⚠️ **genuine zero-downtime deployment, and considered the SAFER, production-grade choice** — the ability to fully test a new version against real infrastructure before it ever receives traffic is a meaningfully stronger safety net than rolling update's in-place replacement. **Trade-off**: more setup complexity — mandatory load balancer, mandatory CodeDeploy integration, versus rolling update's simpler, load-balancer-optional model.

---

## Exam Framing

> "A deployment strategy needs to let a new version be fully tested against real running infrastructure BEFORE it receives any live traffic, with an easy one-click rollback if issues are found" → **Blue/Green**, using the bake-time window — cancel during bake time is trivial, but rolling update offers no equivalent pre-traffic testing window. "A service update fails with blue/green, but bake time already expired and traffic already switched" → **rollback now requires a fresh manual deployment, not a simple cancel** — this is exactly why testing thoroughly during the bake-time window matters. Remember: **blue/green mandates a load balancer + CodeDeploy; rolling update needs neither.**
`,
    },
    {
      id: "ecs-service-deployment-failure-detection",
      title: "ECS Service Deployment Failure Detection – Circuit Breaker vs CloudWatch Alarm",
      shortDesc: "Circuit breaker only sees whether the health check probe replies — it's blind to an application that's technically running but silently returning wrong answers, which is exactly what CloudWatch alarm catches",
      visuals: [],
      content: `## ⚠️ The Problem: What Happens if New Tasks Never Become Healthy?

> **Normally, a deployment launches new tasks and removes old ones once the new tasks are confirmed healthy.** ⚠️ **But if the new tasks get stuck and NEVER become healthy, and deployment failure detection is NOT enabled, ECS just keeps waiting indefinitely — the deployment gets stuck, and it must be fixed manually.** ECS doesn't even detect this as a failure on its own without this option turned on.

---

## Circuit Breaker: Detection Only, By Itself

> **Circuit breaker watches a deployment and detects when new tasks are crashing, failing health checks, or otherwise not becoming healthy.** ⚠️ **Enabled by itself (without the rollback sub-option), circuit breaker ONLY detects and reports the failure — it takes no automatic action at all.** The failing deployment must still be fixed manually.

---

## ⚠️ Rollback on Failure: The Sub-Option That Adds Automatic Action

> **Rollback on failure is a sub-option under circuit breaker — it tells ECS to actually DO something once circuit breaker detects a failure: automatically revert to the last known-working version.** ⚠️ **Without this sub-option enabled, ECS simply stops the deployment and leaves it to be fixed or rolled back manually.** ⚠️ **Enabling rollback is generally recommended** — it turns detection into genuine self-healing rather than just an alert.

---

## ⚠️ CloudWatch Alarm: Catching Failures Circuit Breaker Can't See

> **Circuit breaker relies entirely on ECS's own health check (a probe packet, e.g. on a TCP port) — if the probe gets a reply, circuit breaker considers the task healthy, full stop.** ⚠️ **This means circuit breaker is blind to an application that's technically responding to the probe but is logically broken** — e.g. a new version deploys cleanly, the health check passes, but the application's actual business logic has a bug.

**Two concrete scenarios where CloudWatch alarm is needed instead**:

1. **App is healthy at the container/probe level, but users are hitting real errors** — the deployment "succeeded" by health-check standards, but the new code has a logic bug circuit breaker can't detect.
2. **Business KPIs degrade after deployment** — e.g. order success rate drops from 90% to 50% after an update, because response time regressed (e.g. from 900ms to something far slower), causing timeouts and order failures. ⚠️ **The application is running and healthy in the infrastructure sense — the problem is purely a business-metric regression that only a custom CloudWatch metric (not a simple health probe) can catch.**

> **CloudWatch alarm lets a deployment's success/failure be judged against ANY custom metric** — e.g. CPU usage exceeding a threshold, or a specific application/business metric — rather than only the binary pass/fail of a health check probe. ⚠️ **CloudWatch alarm also supports the same "rollback on failure" sub-option as circuit breaker.**

---

## Exam Framing

> "A new deployment passes all health checks, but users start reporting broken functionality or a spike in failed transactions" → **circuit breaker alone cannot catch this — it only watches health check pass/fail. Use a CloudWatch alarm tied to a custom business or application metric instead.** "New tasks never become healthy after a deployment, and the update needs to auto-revert without manual intervention" → **enable circuit breaker WITH the rollback-on-failure sub-option** — circuit breaker alone only detects and reports; rollback is what actually takes automatic corrective action.
`,
    },
    {
      id: "ecs-service-networking-private-subnet-alb",
      title: "ECS Service Networking – Why the Task Runs in a Private Subnet With No Public IP, and the ALB Makes It Reachable Anyway",
      shortDesc: "The task itself becomes deliberately unreachable from the internet — the Application Load Balancer sits in the public subnet instead and is the ONLY thing users actually talk to",
      visuals: [],
      content: `## ⚠️ Skip the Default VPC — Design a Custom One Instead

> **The default VPC makes every subnet public, which isn't the best-practice design for a production task.** ⚠️ **The recommended design uses a custom VPC with TWO availability zones** (so a single AZ outage doesn't take the application down), each containing both a public subnet and a private subnet.

---

## ⚠️ The Task Goes in the PRIVATE Subnet, Deliberately

> **The task itself is launched into the private subnet, not the public one — meaning it has NO direct internet accessibility at all.** ⚠️ **This is a deliberate security choice, not an oversight**: resources in a private subnet simply cannot be reached from the internet, which is exactly the point — the task's own compute is kept off the public internet entirely.

**Matching this**: **public IP is turned OFF for the task** — since nothing in the private subnet can be reached from the internet anyway, assigning a public IP to it would serve no purpose.

---

## Security Group: Scoped to the Task's Actual Traffic

> **Since Fargate uses awsvpc networking mode, each task gets its own dedicated ENI — and the security group attached governs exactly what traffic that ENI allows in and out.** Example: an application listening on port 80 needs a security group rule explicitly allowing port 80 — everything else stays restricted by default.

---

## ⚠️ The Obvious Question: If It's Unreachable, How Do Users Access It?

> **The Application Load Balancer (ALB) is the answer** — ⚠️ **the ALB itself runs in the PUBLIC subnet and is the only public-facing component; the task stays private and is reached ONLY through the ALB.** Users access the application via the ALB's URL — the ALB receives the request, then routes it to one of the backend tasks (running privately) to actually handle it. ⚠️ **The private-subnet task never needs to be reachable directly — the ALB is the sole entry point**, and it's configured directly during service creation (covered in an upcoming topic).

---

## The Full Picture

> **Public subnet**: holds the ALB, publicly reachable. **Private subnet**: holds the actual application tasks, completely unreachable from the internet directly. **Traffic flow**: user → ALB (public) → task (private) — the task is protected behind the load balancer at every step, never exposed on its own.

---

## Exam Framing

> "A containerized application must never be directly reachable from the internet, but still needs to serve real user traffic" → **place the task in a PRIVATE subnet with no public IP, and put an Application Load Balancer in a PUBLIC subnet in front of it** — the ALB is the only internet-facing component; the task itself stays fully private. "Why does a task in a private subnet not need a public IP assigned?" → **it's genuinely unreachable from the internet regardless, so a public IP would serve no purpose** — public IP is only meaningful for resources actually meant to be reached directly from outside the VPC.
`,
    },
    {
      id: "ecs-service-load-balancer-integration",
      title: "ECS Service Load Balancer Integration – Why the Load Balancer Must Be Created BEFORE the Service, Not During It",
      shortDesc: "Creating the ALB from inside the service-creation flow silently drops it into the task's own private subnet — the fix is pre-creating it from EC2 first, where subnet choice is actually exposed",
      visuals: [],
      content: `## ⚠️ The Critical Gotcha: Don't Create the Load Balancer From the Service Wizard

> **The ECS "create service" flow offers a "create new load balancer" option directly inline — but this option should be AVOIDED.** ⚠️ **The service-creation wizard does NOT let you choose which subnet the load balancer goes into — it silently places the new load balancer into the SAME subnet selected for the task's own networking (the private subnet).** Since the whole point is an internet-facing load balancer in the PUBLIC subnet reaching a task hidden in the PRIVATE subnet, a load balancer created this way ends up in the wrong subnet entirely and defeats the design.

**The fix**: ⚠️ **create the Application Load Balancer separately, in advance, directly from the EC2 console** — which DOES expose explicit subnet selection — then choose "use an existing load balancer" when creating the ECS service.

---

## Creating the Target Group First (Required Before the ALB)

> **An ALB requires a target group to route traffic to.** ⚠️ **When creating this target group for an ECS/Fargate service, the target type must be "IP addresses" — NOT "instances."** Reasoning: ECS tasks aren't EC2 instances themselves (even on the EC2 launch type, a task isn't the same thing as the instance it runs on), so the instance-based target type doesn't fit. ⚠️ **With IP-address targeting, ECS automatically registers each new task's IP as a target the moment the task launches** — no manual target registration needed.

**No targets need to be added manually at target-group creation time** — the target group is created empty; ECS populates it automatically once the service actually starts launching tasks.

---

## Creating the ALB Itself

> From the EC2 console → Load Balancers → Create → **Application Load Balancer**, internet-facing → ⚠️ **explicitly select the PUBLIC subnets** (this is exactly the subnet-selection control missing from the ECS service wizard) → attach the target group created above.

---

## Wiring It Into the Service

> **Back in the ECS service creation flow**: enable load balancing → choose **"use an existing load balancer"** (never "create new," per the gotcha above) → select the ALB created in EC2 → **"use existing listener"** (already created alongside the ALB) → **"use existing target group"** (the IP-based one created earlier). ⚠️ **The task itself still goes into the PRIVATE subnet during the service's own networking configuration — only the ALB lives in the public subnet.**

---

## Exam Framing

> "An ECS service's load balancer keeps ending up in the wrong (private) subnet, even though public subnets exist in the VPC" → **the load balancer was created inline through the ECS service-creation wizard**, which doesn't expose subnet choice and defaults to the task's own subnet. **Fix: pre-create the ALB from the EC2 console (where subnet selection is explicit), then attach it to the service via "use an existing load balancer."** "What target type should an ECS/Fargate target group use?" → **IP addresses, not instances** — ECS automatically registers each task's IP as it launches, with zero manual target management required.
`,
    },
    {
      id: "ecs-cluster-autoscaling-vs-service-autoscaling",
      title: "ECS Cluster Auto Scaling vs Service Auto Scaling: Two Independent Scaling Layers",
      shortDesc: "Cluster auto scaling grows the EC2 fleet that hosts tasks and needs no manual policy at all — service auto scaling grows the task COUNT itself and requires an explicit CloudWatch-metric-based policy",
      visuals: [],
      content: `## Two Distinct Auto Scaling Layers in ECS

> **ECS has TWO separate types of auto scaling, operating at completely different levels**: ⚠️ **cluster auto scaling scales the number of EC2 INSTANCES in the cluster; service auto scaling scales the number of TASKS within a service.** They solve different problems and can both be active simultaneously.

---

## Cluster Auto Scaling: EC2-Only, No Manual Policy Needed

> **What it scales**: the number of EC2 instances (container hosts) in an ECS cluster. ⚠️ **Only relevant when using EC2 as the launch type — Fargate is serverless, so AWS already scales the underlying capacity automatically, making cluster auto scaling irrelevant/inapplicable there.**

**How it works**: ⚠️ **uses a capacity provider combined with an Auto Scaling Group (ASG) to add/remove EC2 instances based on task placement needs** — when there isn't enough EC2 capacity to place all the tasks that need to run, cluster auto scaling adds more instances.

**⚠️ Key distinguishing feature: no manual scaling policy or CPU/memory threshold needs to be set at all.** ECS's managed scaling (inside the capacity provider) automatically calculates how many EC2 instances are needed based on the current task placement demand — ⚠️ **the only thing manually configured is the ASG's minimum and maximum instance count boundaries**, everything else is automatic.

**Worked example**: a service wants to run 8 tasks, but the cluster currently has only 1 EC2 instance with limited resources — not enough capacity for all 8. ⚠️ **Cluster auto scaling adds more EC2 instances so the tasks CAN actually be placed.**

---

## Service Auto Scaling: Both Fargate and EC2, Requires an Explicit Policy

> **What it scales**: the number of tasks running inside a service. ⚠️ **Applies to BOTH Fargate and EC2 launch types** — regardless of the underlying infrastructure, a service can scale its task count up or down based on demand.

**How it works**: ⚠️ **uses CloudWatch metrics (CPU utilization, memory utilization, ALB request count, etc.) to decide how many tasks should run**, governed by an explicit scaling policy that must be manually configured. ⚠️ **Unlike cluster auto scaling, service auto scaling does NOT calculate thresholds automatically — the scaling policy and its metric thresholds must be set up deliberately.**

**Available policy types**: **target tracking** and **step scaling** are both configurable directly during service creation; a third type, **scheduled scaling**, becomes available only AFTER the service already exists (not during initial creation).

**Worked example**: a service running 2 tasks experiences a traffic spike — ECS automatically increases the task count up to whatever maximum boundary was configured (e.g. up to 8 tasks), based on the scaling policy's metric threshold.

---

## Boundaries: Both Types Use Min/Max/Desired

> **Both scaling types are bounded by minimum and maximum limits** — for cluster auto scaling, this is the ASG's min/max EC2 instance count; for service auto scaling, this is the service's min/max task count. ⚠️ **Neither type will scale beyond its configured maximum, regardless of demand.**

---

## Exam Framing

> "A cluster's EC2 instances don't have enough capacity to place all the tasks a service wants to run" → **cluster auto scaling** — adds more EC2 instances via the ASG, EC2-launch-type-only, requires no manual scaling policy (ECS calculates capacity needs automatically). "A service needs to increase its running task count in response to a CPU or ALB request spike" → **service auto scaling** — applies to both Fargate and EC2, requires an explicitly configured policy (target tracking or step scaling) tied to a CloudWatch metric. Remember: **cluster scaling = EC2 instance count, automatic policy; service scaling = task count, manual policy, works on both launch types.**
`,
    },
    {
      id: "ecs-service-autoscaling-config-scale-in-out",
      title: "Configuring ECS Service Auto Scaling – It's for Elasticity, Not High Availability",
      shortDesc: "Desired task count already guarantees high availability on its own — service auto scaling exists purely to make that count adapt to traffic, and it's entirely optional",
      visuals: [],
      content: `## ⚠️ Service Auto Scaling Is Optional — And Solves a Different Problem Than HA

> **A common misconception: service auto scaling is NOT what provides high availability in ECS.** ⚠️ **The DESIRED TASK COUNT alone already provides high availability** — if the desired count is set to 4, ECS keeps exactly 4 tasks running at all times regardless of auto scaling, automatically replacing any that fail. ⚠️ **Service auto scaling exists purely to make that desired count DYNAMIC based on real traffic**, rather than fixed — it's about right-sizing and cost/performance elasticity, not failure recovery.

**The core problem it solves**: a fixed desired count (e.g. always 4 tasks) either wastes money during low traffic or under-serves users during high traffic. ⚠️ **Enabling service auto scaling lets ECS adjust the desired count up during high demand and down during low demand automatically.**

---

## Scale Out and Scale In

> **Scale OUT**: increasing the number of running tasks in response to rising demand. **Scale IN**: decreasing the number of running tasks in response to falling demand. ⚠️ **These are the standard terms used throughout ECS (and EC2) auto scaling discussions** — worth knowing precisely, since exam questions use this exact terminology.

---

## ⚠️ Minimum and Maximum Boundaries Are Still Required

> **Even with auto scaling enabled, a minimum and maximum task count must be set.** **Minimum**: guarantees a floor — e.g. minimum=2 means at least 2 tasks always run, even during zero traffic, so the application never scales to nothing. **Maximum**: guarantees a ceiling — e.g. maximum=20 means no matter how much traffic spikes, ECS will never run more than 20 tasks, directly capping the maximum possible bill from runaway scaling.

---

## ⚠️ Available Scaling Policies: Two at Creation, Two More Afterward

> **While CREATING a service, only two scaling policy types are available: Target Tracking and Step Scaling.** ⚠️ **Predictive Scaling and Scheduled Scaling both exist for ECS services too, but are only configurable AFTER the service has already been created** — not during the initial service-creation flow. This directly mirrors the equivalent EC2 Auto Scaling Group policy types covered earlier.

---

## Exam Framing

> "Does an ECS service need auto scaling enabled to survive a task crashing?" → **No — the desired task count alone (independent of auto scaling) already guarantees a fixed number of tasks stay running, with automatic replacement on failure. Auto scaling is about ADAPTING that count to traffic, not about basic availability.** "Which scaling policy types can be configured while a service is first being created?" → **only Target Tracking and Step Scaling — Predictive Scaling and Scheduled Scaling both require the service to already exist first.**
`,
    },
    {
      id: "ecs-target-tracking-scaling-cooldowns",
      title: "ECS Target Tracking Scaling Policy – Metrics, and Why Scale-Out and Scale-In Cooldowns Are Deliberately Asymmetric",
      shortDesc: "Scale-out is fast because slow growth hurts users; scale-in is deliberately slow because removing capacity too eagerly is what actually causes the performance problems companies fear most",
      visuals: [],
      content: `## What Target Tracking Does

> **Target tracking increases or decreases the number of running tasks to keep a chosen metric near a defined target value.** ⚠️ **Three metrics available directly through the console**: CPU utilization, memory utilization, and ALB request count per target (⚠️ **only usable if an ALB is actually integrated with the service**). ⚠️ **A fourth option — custom CloudWatch metrics — exists but is NOT available through the console UI; it requires setting up the service via CLI instead.**

**Example**: target = CPU utilization 60% → ⚠️ **CPU rising above 60% triggers a scale-out event (more tasks added); CPU dropping below 60% triggers a scale-in event (tasks removed).**

---

## ⚠️ Why Cooldowns Exist: Preventing Flapping

> **Without any cooldown, auto scaling can add and remove tasks too rapidly in response to metric fluctuations** — wasting resources and hurting application stability (a pattern often called "flapping"). ⚠️ **Cooldowns introduce a mandatory waiting period between successive scaling events of the same direction**, preventing this back-and-forth thrashing.

---

## ⚠️ Scale-Out Cooldown: Short, Because New Tasks Need Time to Become Ready

> **After a scale-out event adds a task, ECS waits for the scale-out cooldown timer (e.g. 60 seconds) before triggering ANOTHER scale-out event** — ⚠️ **even if the load metric is still above target during this window, no new task launches until the cooldown expires and metrics are re-checked.** The primary purpose: giving the newly launched task time to actually become ready/healthy before deciding whether even MORE capacity is needed.

---

## ⚠️ Scale-In Cooldown: Deliberately Much Longer

> **Scale-in cooldown is typically set much longer than scale-out (e.g. 300 seconds vs 60 seconds) — and this asymmetry is entirely deliberate.** ⚠️ **Scale-in (removing tasks) is inherently riskier than scale-out**: removing capacity to save money is fine during genuinely low traffic, but if a sudden traffic spike hits right after tasks were removed, user performance suffers. ⚠️ **Given the choice between saving money and protecting user performance, companies virtually always prioritize performance** — which is exactly why scale-in is deliberately slow and cautious, while scale-out is kept fast and responsive.

**What the scale-in cooldown actually blocks**: ⚠️ **NO additional tasks are removed during the scale-in cooldown window — that part is strictly enforced.**

---

## ⚠️ The Critical Asymmetry: Scale-Out Can Interrupt a Scale-In Cooldown, But Never the Reverse

> **If a scale-out trigger occurs WHILE a scale-in cooldown timer is still running, AWS immediately adds the needed task anyway — and the scale-in cooldown timer gets CANCELLED.** ⚠️ **This is one-directional: scale-out is never blocked by an in-progress scale-in cooldown, but scale-in IS always blocked by its own cooldown until it expires.** The logic follows directly from the performance-over-cost priority: a real traffic spike should never be delayed just because a cooldown from a prior scale-in event happens to still be running.

---

## Disabling Scale-In Entirely

> **A separate toggle lets scale-in be disabled entirely while keeping scale-out active** — the policy will only ever ADD tasks automatically, never remove them. ⚠️ **Useful for scenarios like warm-up periods, product launches, sales events, or exams — anywhere a temporary guarantee against capacity ever shrinking unexpectedly (fear of "flapping") matters more than cost savings.**

---

## Exam Framing

> "Why are ECS scale-out and scale-in cooldown periods typically set to very different durations (e.g. 60s vs 300s)?" → **scale-out is kept fast because slow capacity growth directly hurts users during a traffic spike; scale-in is kept deliberately slow because removing capacity too eagerly is what actually causes performance problems — companies prioritize performance over cost savings.** "A scale-out event is triggered while a scale-in cooldown is still counting down — what happens?" → **the task is added immediately regardless, and the scale-in cooldown timer is cancelled** — scale-out always takes priority and is never blocked by a scale-in cooldown.
`,
    },
    {
      id: "ecs-step-scaling-policy-scale-out-scale-in-mirror",
      title: "ECS Step Scaling Policy – Multi-Tier Thresholds, and Why Scale-Out Alone Can Only Ever Grow the Fleet",
      shortDesc: "A scale-out policy is a one-way ratchet — it adds tasks as CPU climbs through each tier but has no mechanism to remove them again, so a separate mirror scale-in policy is mandatory",
      visuals: [],
      content: `## What Step Scaling Adds Over Target Tracking

> **Step scaling defines MULTIPLE threshold tiers, each triggering a different-sized scaling action, based on a CloudWatch alarm** — ⚠️ **rather than target tracking's single threshold, step scaling lets scaling response scale in PROPORTION to how far the metric has moved past a boundary.** Example: CPU only slightly above threshold → add 1 task; CPU far above threshold → add 2-3 tasks at once. This makes scaling more precisely matched to actual load severity.

---

## ⚠️ Worked Example: A 4-Tier Scale-Out Policy

> **Baseline: minimum 2 tasks, maximum 10 tasks.**

- **CPU 60-70%**: add 2 tasks → total = **4**.
- **CPU 70-80%**: add 2 more tasks → total = **6**.
- **CPU 80%+**: add 4 more tasks → total = **10** (the configured maximum).

⚠️ **Each tier is a distinct rule with its own task-count increment — the response genuinely scales with how severe the load spike is, not a flat "add one task" regardless of how high CPU actually climbed.**

---

## ⚠️ The Critical Limitation: Scale-Out Policies Can ONLY Add Tasks, Never Remove Them

> **A scale-out policy is strictly one-directional — it can only INCREASE the task count, never decrease it.** ⚠️ **Worked scenario proving this**: CPU climbs through all three tiers, reaching 10 tasks (maximum). Traffic then drops back down to the 60-70% range. ⚠️ **The task count STAYS AT 10 — a scale-OUT-only policy has no mechanism to bring it back down, even though CPU has genuinely dropped.**

**The fix**: ⚠️ **a separate, MIRROR scale-in policy must be configured**, with its own tiered thresholds working in reverse — e.g. CPU 80-90% → remove 4 tasks (back to 6); CPU 70-80% → remove 2 tasks (back to 4); CPU below 60% → remove 2 tasks (back to 2, the minimum). ⚠️ **Scale-out and scale-in are two entirely separate, independently configured policies — never a single bidirectional rule.**

---

## ⚠️ The Console Limitation: Only ONE Policy Can Be Attached During Service Creation

> **When creating a new ECS service through the console, only ONE step scaling policy can be attached at that time — either scale-out OR scale-in, never both simultaneously.** ⚠️ **The workaround**: configure the scale-out policy during initial service creation, then go BACK into the already-created service's settings afterward to add the scale-in policy separately.** This two-step process is required specifically because the service-creation console flow doesn't support attaching both policies in one pass.

---

## Exam Framing

> "A step-scaling scale-out policy successfully grows a service to its maximum task count during a traffic spike, but the task count never shrinks back down once traffic subsides" → **expected behavior — a scale-out policy can ONLY add tasks; a separate, independently configured scale-in policy is required to ever remove them.** "Why does setting up complete step scaling for a new ECS service require two separate configuration passes?" → **the service-creation console only allows attaching ONE policy (scale-out or scale-in) at creation time — the other must be added afterward through the existing service's settings.**
`,
    },
    {
      id: "ecs-step-scaling-scale-out-lab",
      title: "ECS Step Scaling – Configuring the Scale-Out Policy (Console Walkthrough)",
      shortDesc: "Period times evaluation periods is the real trigger window — a 1-minute period with evaluation-periods=3 means CPU must stay above threshold for three consecutive checks, not just once",
      visuals: [],
      content: `## ⚠️ During Service Creation, the CloudWatch Alarm Must Be Created Fresh — Not Selected From Existing

> **When attaching a step scaling policy DURING ECS service creation, the console forces creating a brand-new CloudWatch alarm — an existing alarm cannot be selected at this stage.** ⚠️ **After the service already exists, a scale-in (or any additional) policy CAN reference an existing pre-created alarm instead** — this asymmetry is exactly why scale-out gets configured during creation and scale-in afterward.

---

## Step 1: Metric and Statistic

> **Metric choices are CPU utilization or memory utilization** (task-level). ⚠️ **Statistic choices — average, maximum, minimum, sum, sample count — determine HOW the metric across multiple tasks gets summarized before being compared to the threshold.** Worked example: 4 tasks at 30%, 50%, 70%, 90% CPU → **average = 60%** (typically the standard choice); **maximum = 90%** (just the single highest task); **minimum = 30%.** ⚠️ **Average is used in most real scaling policies** — it reflects overall service load rather than being skewed by one outlier task.

---

## ⚠️ Step 2: Alarm Condition, Threshold, Period, and Evaluation Period — the Exact Trigger Mechanics

> **Four settings together define exactly when the alarm fires**: alarm condition (above/below threshold), threshold value, period (how often CloudWatch checks the metric), and evaluation periods (how many CONSECUTIVE checks must fail before the alarm actually triggers).

**⚠️ For scale-out, the condition is always "greater than / greater-or-equal"** — scale-out responds to RISING load. (Scale-in, covered in the next topic, always uses "less than / less-or-equal" instead.)

**⚠️ Worked example: period = 1 minute, evaluation periods = 3, threshold = 60%.** Meaning: ⚠️ **CloudWatch checks CPU utilization every 1 minute, and the alarm only actually TRIGGERS once CPU has been above 60% for THREE CONSECUTIVE 1-minute checks in a row (i.e. a genuine 3-minute sustained spike)** — a single brief spike that drops back down before the third check does NOT trigger the alarm. ⚠️ **This built-in requirement for sustained breach (not just a momentary blip) is exactly what prevents the policy from reacting to noise.**

---

## Step 3: Adjustments — How Many Tasks to Add, and By What Method

> **Three action types**: ⚠️ **Add** (increase the task count by a specified amount), **Remove** (decrease by a specified amount), and **Set to** (jump directly to an absolute task count, regardless of the current count). ⚠️ **Scale-out policies use "Add."**

**Two ways to express the amount**: ⚠️ **Tasks** (an absolute number, e.g. "add 2 tasks" regardless of the current count) or **Percentage** (a relative change, e.g. "add 50% of the current task count" — 6 running tasks × 50% = add 3 more).

---

## ⚠️ The Full 3-Tier Configuration (Matches the Earlier Step-Scaling Concept Topic)

| CPU Range (lower–upper bound) | Action |
|---|---|
| 60% – 70% | Add 2 tasks |
| 70% – 80% | Add 2 more tasks |
| 80% – infinity | Add 4 more tasks |

⚠️ **Each row is added as a SEPARATE adjustment entry** — the console requires configuring these one at a time, and it's genuinely easy to mismatch a lower/upper bound pair, so the end result should always be double-checked against the intended tiers.

---

## Cooldown, and a Propagation Delay Worth Expecting

> **The scale-out policy also requires its own cooldown period** (e.g. 300 seconds) — the same cooldown mechanism covered in the earlier target tracking topic. ⚠️ **After a service is created with a scaling policy attached, the policy may not appear immediately in the service's auto scaling settings — it can genuinely take 2–5 minutes to become visible while AWS finishes provisioning it in the background.** This is expected, not a sign of misconfiguration.

---

## Exam Framing

> "A CloudWatch alarm is set with period=1 minute and evaluation periods=3 — what does this actually require before triggering?" → **the metric must breach the threshold on THREE CONSECUTIVE 1-minute checks (a sustained 3-minute condition), not just a single momentary spike** — this combination is exactly what prevents a scaling policy from overreacting to brief noise. "Which alarm condition direction is always used for a scale-out policy?" → **greater than / greater-or-equal** — scale-out exists to respond to rising load; scale-in (covered next) always uses the opposite, less-than direction.
`,
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
    {
      id: "asg-termination-policy-default",
      title: "Auto Scaling – Default Termination Policy",
      shortDesc: "The 5-step funnel that decides exactly which instance dies on a scale-in",
      visuals: ["TerminationPolicy"],
      content: `## The Question Termination Policy Answers

Scale-out adds instances; scale-in removes them. But if an ASG is currently running two instances and you drop desired capacity to one, **which** of the two gets terminated? That decision — for **any** scaling method (manual, scheduled, or dynamic) — is governed entirely by the **termination policy**.

> AWS provides several **built-in** termination policies (next topic), plus the **default** policy every new ASG uses unless you change it. This topic is the default policy's exact decision funnel.

Find it under **ASG → Details → Advanced configurations → Edit → Termination policies**.

---

## Worked Scenario

Three AZs, six instances total:

| AZ | Instances |
|---|---|
| **ap-south-1a** | A1, A2, A3 |
| **ap-south-1b** | B1, B2 |
| **ap-south-1c** | C1 |

A scale-in needs to pick exactly one instance to remove. The default policy runs this funnel, narrowing the candidate pool at each step:

---

### Step 1 — Balance Across Availability Zones

> **Target the AZ with the most instances**, to correct any imbalance. Here, **ap-south-1a has 3** (more than 1b's 2 or 1c's 1) — so the candidate pool starts as **A1, A2, A3** only. B1, B2, and C1 are never considered while an imbalance like this exists.

---

### Step 2 — Scale-In Protection

Each remaining candidate is checked for **scale-in protection** — a flag you can set explicitly on any instance to tell Auto Scaling "never terminate this one during scale-in."

**Setting it:** ASG → **Instance management** → select the instance → **Actions → Set scale-in protection**.

> Assuming none of A1/A2/A3 are protected, all three remain in consideration. If one *were* protected, it would be removed from the pool here, regardless of any other criteria.

---

### Step 3 — Oldest Launch Template

If some instances were launched from an **older** version of the launch template than others, the older ones are preferred for termination — this is how a fleet gradually phases out an old configuration.

> **Worked continuation:** A1 and A2 were launched on the old template version; A3 was launched after an update, on the new version. A3 is **removed** from consideration (it represents where you want to end up) — leaving just **A1, A2**.

---

### Step 4 — Closest to the Next Billing Hour

Among any instances still tied, the default policy picks whichever is **closest to completing its current billing hour** — minimizing the "wasted" already-paid-for time you'd lose by keeping it running past this point.

> **Worked continuation:** A1 has been running for **50 minutes** of its current hour; A2 for only **10 minutes**. Terminating A1 wastes just **10 minutes** of already-paid time; terminating A2 instead would waste **50**. **A1 is terminated.**

> Modern Linux/Windows/Ubuntu instances bill in **per-second increments**, which makes this step largely moot for them today — it matters more for older per-hour-only billing models.

---

### Step 5 — Random Tiebreaker

If two or more candidates are still perfectly tied after all four prior steps (e.g. both launched at the exact same time), Auto Scaling picks one **at random**.

---

## The Full Funnel, Summarized

1. **AZ balance** — narrow to the most-populated AZ
2. **Scale-in protection** — exclude protected instances
3. **Oldest launch template** — prefer phasing out old config
4. **Closest to next billing hour** — minimize wasted paid time
5. **Random** — final tiebreaker

> This ordering is worth memorizing directly — it's exactly how AWS documents the default policy, and each step only ever operates on whatever pool of candidates survived the step before it.
`,
    },
    {
      id: "asg-termination-policy-builtin",
      title: "Auto Scaling – Other Built-In Termination Policies",
      shortDesc: "AllocationStrategy, OldestLaunchTemplate, ClosestToNextInstanceHour, NewestInstance, OldestInstance",
      visuals: [],
      content: `## Beyond the Default

The default policy's 5-step funnel isn't the only option. Individual built-in policies let you pick **one specific rule** directly, instead of the full funnel — useful when you know exactly which criterion matters for your situation.

Find these under the same place as the default policy: **ASG → Advanced configurations → Edit → Termination policies.**

---

## AllocationStrategy

Relevant only when an ASG mixes **instance types and purchase options** (e.g. a mix of On-Demand and Spot, or several instance sizes) — configured via **Instance type requirements** and **Instance purchase options** when creating the ASG, along with an **allocation strategy** for how new instances of each kind get created (lowest price, price-capacity-optimized, capacity-optimized).

> **This termination policy terminates instances following that same allocation strategy** — so the instance pool you end up with, after any scale-in, still matches the cost/availability trade-off you originally configured for creating instances. Use it whenever you've already defined an allocation strategy and want scale-in decisions to respect it, rather than override it.

---

## Oldest Launch Configuration / Oldest Launch Template

> **Terminates whichever instance is running the oldest launch template version** — useful specifically when you're phasing out an old configuration and want every scale-in to chip away at the outdated instances first, until only the current version remains.

("Launch configuration" is the deprecated predecessor to launch templates — AWS keeps both names in the console since older accounts may still reference the old term, but they mean the same thing operationally today.)

---

## Closest to Next Instance Hour

> **Terminates whichever instance is nearest to completing its current billing hour** — minimizing wasted already-paid time, the same idea Step 4 of the default policy uses.

⚠️ **Caveat:** this only meaningfully applies to instance types billed in **hourly** increments. Amazon Linux, Windows, and Ubuntu instances today bill in **per-second** increments, which makes this policy largely irrelevant for them — there's no "wasted hour" to optimize around. It still matters for older or non-standard billing models.

---

## Newest Instance

> **Terminates the most recently launched instance** — the opposite of what intuition suggests, but genuinely useful when you're **testing a new launch template** in a live ASG and aren't fully confident in it yet. If the new instances misbehave, this policy lets you back them out first while production traffic keeps running on the proven, older instances.

---

## Oldest Instance

> **Terminates the longest-running instance in the group** — the mirror image of Newest Instance. Useful when **migrating an entire fleet to a new instance type** (e.g. every t2.micro should eventually become a t2.medium): each scale-in event gracefully retires the oldest instances first, so the fleet transitions to the new type over time instead of all at once.

---

## Choosing Among Them

| Policy | Best fit |
|---|---|
| **Default (5-step funnel)** | General-purpose, AZ-aware, no special requirement |
| **AllocationStrategy** | Mixed instance types/purchase options — keep scale-in aligned with your creation strategy |
| **Oldest Launch Template** | Phasing out an outdated configuration |
| **Closest to Next Instance Hour** | Hourly-billed instance types only — minimizes wasted paid time |
| **Newest Instance** | Testing a new launch template cautiously in production |
| **Oldest Instance** | Gradual fleet-wide migration to a new instance type |

> If none of these fit your exact requirement, the next topic — **Custom Termination Policy** — hands you full programmable control instead.
`,
    },
    {
      id: "asg-termination-policy-custom",
      title: "Auto Scaling – Custom Termination Policy",
      shortDesc: "A Lambda function decides which instance dies — for logic no built-in policy can express",
      visuals: [],
      content: `## When Built-In Policies Aren't Enough

Every policy covered so far — default and the individual built-ins — encodes a **fixed** rule AWS decided in advance. Sometimes your actual requirements don't match any of them.

> **A Custom Termination Policy hands the decision to a Lambda function you write yourself** — giving you fully programmable logic for exactly which instance to terminate during a scale-in event, in any language Lambda supports (Python, Node.js, Java, Go, and more).

Selecting it: **ASG → Advanced configurations → Edit → Termination policies → Custom**, then point it at your Lambda function. (This topic covers the concept and use cases in depth; actually writing the Lambda function is its own topic, covered later in the course.)

---

## Five Reasons to Reach for This

### 1. Standard Rules Don't Fit Your Logic

Sometimes the built-in criteria (AZ balance, launch template age, billing hour, instance age) simply don't match how *your* application decides what's expendable. A custom policy can check **tags**, or live **performance metrics** (CPU, network, storage, memory) that no built-in policy considers at all.

### 2. Graceful Shutdown

> **Every built-in policy terminates an instance immediately** — it doesn't wait for in-flight work to finish. A Lambda function can run a **graceful shutdown sequence** first: let active requests complete, close connections cleanly, then allow termination — preventing data loss and service disruption that an abrupt kill could cause.

### 3. Pre-Termination Actions and Data Backup

Before an instance actually goes away, you might need to back up critical local data elsewhere, drain active connections, or **deregister the instance** from an external service-discovery system so nothing keeps routing traffic to it. A Lambda function can perform all of this **before** the termination actually happens.

### 4. Integration With External Systems

Some termination decisions depend on context Auto Scaling has no visibility into — license management, an external health-check system, or a separate database tracking instance state. A Lambda function can call out to those systems as part of making (or informing) the termination decision.

### 5. Flexible, Evolving Logic

As an application's requirements change, a custom policy's logic lives entirely in the Lambda function — **update the function code**, and the termination behavior changes with it, with **no modification to the Auto Scaling Group itself** required.

---

## The Practical Takeaway

> A custom termination policy is a real, occasionally-asked interview and exam topic — but actually building one is a deliberate architectural choice for teams with genuine requirements the built-ins can't express, not something most ASGs need day to day. Understanding **why** it exists and what problems it solves is what matters; you don't need a working Lambda function in hand to answer the exam-style question correctly.
`,
    },
    {
      id: "asg-timers",
      title: "Auto Scaling – The 3 Timers",
      shortDesc: "Warm-up, cooldown, and health-check grace — worked through with an exact minute-by-minute example",
      visuals: ["ScalingTimers"],
      content: `## Why Timers Matter

Every Auto Scaling Group configuration involves **three** distinct timers, each solving a different timing problem. They come up often enough in the exam and in interviews that the exact worked example below is worth memorizing, not just the definitions.

---

## Timer 1 — Warm-Up Time

> **The period a new instance needs to initialize before it's ready to handle requests.** During warm-up, the instance is technically "in service," but its metrics are **excluded** from the aggregate group metrics dynamic scaling policies rely on.

**Why it exists:** dynamic scaling makes decisions from live metrics (CPU, network bytes, etc.). A brand-new instance still booting or running its user data script would report misleadingly low (or erratic) numbers — counting it immediately could trigger a premature, wrong scaling decision.

> ⚠️ **Warm-up only applies to Step Scaling and Target Tracking** dynamic scaling policies. It's **irrelevant** to manual scaling and scheduled scaling, since neither of those relies on live metrics at all — there's nothing for a fresh instance's numbers to distort.

**Where to set it:** per-policy, while creating a Step Scaling or Target Tracking policy — or set a **default instance warm-up** at the ASG level (**Details → Advanced configurations**) that every new dynamic policy inherits unless overridden.

---

## Timer 2 — Cooldown Period

> **A mandatory wait after any scaling activity (scale-out or scale-in) before another scaling activity can begin.** Default: **300 seconds (5 minutes)**.

**Why it exists:** without it, a scale-out could trigger, the new instance could take a few minutes to actually start absorbing load, and — before the group's metrics reflect that relief — another scale-out could fire on top of it. Cooldown gives the group time to **stabilize at its new size** before evaluating whether to scale again, preventing this kind of runaway over-reaction to a temporary spike or dip.

**Where to set it:** **ASG → Details → Advanced configurations → Default cooldown.**

---

## Timer 3 — Health Check Grace Period

> **The delay before Auto Scaling starts running health checks on a newly launched instance.** Default: **300 seconds (5 minutes)**, starting the moment the instance enters the **InService** state.

**Why it exists:** an application often needs time to finish installing and start responding correctly — time that goes *beyond* the OS simply finishing its boot. Without a grace period, Auto Scaling could health-check the instance too early, see it "failing," and terminate a perfectly healthy instance that just needed more startup time.

**Where to set it:** **ASG → Details → Advanced configurations → Health check grace period.**

---

## Worked Example — All Three Together

**Setup:** target tracking on CPU utilization, target **50%**. Scale-out triggers above **70%** CPU, scale-in at **30%**. Configured timers: **warm-up = 5 min**, **cooldown = 10 min**, **health-check grace = 3 min**. A scale-out event fires at **12:00 PM**.

**Q1 — When do the new instance's metrics start counting toward the group average?**
> Warm-up is 5 minutes → the new instance launched at 12:00 PM starts being counted in aggregate CPU calculations at **12:05 PM**.

**Q2 — When is the earliest the next scaling action (in or out) is allowed?**
> Cooldown is 10 minutes, measured from the scaling event (12:00 PM, or effectively once the instance is added — the exam convention counts from the event itself) → the next scaling action can happen no earlier than **12:10–12:15 PM** depending on how the cooldown start is anchored in the specific scenario. (Some phrasings measure cooldown from when warm-up ends, i.e. 12:05 + 10 min = **12:15 PM** — always check which anchor point a specific exam question specifies.)

**Q3 — When do health checks begin on the new instance?**
> Grace period is 3 minutes → health checks begin at **12:03 PM**, giving the app 3 minutes to finish starting before it could be marked unhealthy.

---

## Quick Reference

| Timer | Question it answers | Applies to | Default |
|---|---|---|---|
| **Warm-up** | When does a new instance's data start counting toward scaling metrics? | Step & Target Tracking dynamic policies only | Optional, no default until set |
| **Cooldown** | How long must the group wait before scaling again? | Any scaling method | 300s |
| **Health-check grace** | How long before health checks start on a new instance? | Any scaling method | 300s |
`,
    },
    {
      id: "asg-vs-elb",
      title: "Auto Scaling vs Elastic Load Balancer",
      shortDesc: "Two services, one job each — scaling capacity vs distributing traffic across it",
      visuals: [],
      content: `## Two Different Jobs

Having covered both services fully, it's worth being explicit about **where one stops and the other starts** — a distinction the exam tests directly.

> **Auto Scaling changes how many EC2 instances exist. Elastic Load Balancing decides how traffic gets spread across whichever instances currently exist.** Neither one can do the other's job.

---

## What Auto Scaling Does

- **Scales horizontally** — adds instances under load (**scale out**), removes them when load drops (**scale in**)
- Driven by whichever policy you've configured: **manual**, **scheduled**, or one of the three **dynamic** policy types (simple, step, target tracking), optionally layered with **predictive** scaling
- The *entire* focus is **capacity** — how many EC2 instances should exist right now

> **What it does NOT do:** distribute incoming traffic across those instances. Even with 5 healthy instances running, Auto Scaling has no mechanism to route a single incoming request to any particular one of them.

---

## What Elastic Load Balancing Does

- Acts as the **single point of contact** for all incoming traffic — clients only ever talk to the load balancer, never directly to an instance
- **Automatically routes traffic across a dynamically changing number of instances** — the "dynamically changing" part is exactly what Auto Scaling is responsible for producing
- **Health-checks** every registered target continuously, and only sends traffic to instances currently reporting healthy

> **What it does NOT do:** decide to launch or terminate instances. A load balancer has no opinion on capacity — it only ever works with whatever fleet already exists at any given moment.

---

## How They Work Together

1. **Auto Scaling** decides a new instance is needed (any policy) → launches it from the launch template
2. The new instance registers with the **target group** attached to the load balancer
3. The **load balancer** health-checks it — once healthy, it starts receiving a share of traffic
4. Later, if **Auto Scaling** decides to scale in, the terminated instance is simply removed from the target group, and the load balancer stops sending it traffic

> Neither service could deliver a production-grade elastic web tier alone: Auto Scaling without a load balancer means capacity that clients have no reliable single way to reach; a load balancer without Auto Scaling means a fixed, hand-managed fleet behind it. **Together, they form the standard building block of a scalable, self-healing compute tier** — this exact combination is precisely what the course's first capstone project is about to bring together end to end.
`,
    },
  ],
};
