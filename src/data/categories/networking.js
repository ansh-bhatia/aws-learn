// Networking & CDN
export default {
  id: "networking",
  label: "Networking & CDN",
  icon: "🌐",
  color: "#8C4FFF",
  topics: [
    {
      id: "vpc-intro",
      title: "VPC – Why It Exists",
      shortDesc: "How AWS isolates your resources from everyone else's on shared hardware",
      visuals: ["VPCIsolationDemo"],
      content: `## The Question Nobody Asks First

AWS is a **public cloud**. You create an account and launch resources; so does everyone else, in the same regions and the same availability zones.

So: **how does AWS keep your resources isolated from a stranger's?**

---

## The Scenario That Makes It Concrete

One region — **Mumbai**. One availability zone. One physical host.

Two users who have never met — call them **A** and **B** — each launch an EC2 instance. **You cannot choose your physical host**: you pick the region and the availability zone, and an **AWS algorithm** decides the rest. So it is entirely possible both instances land on **the same physical machine**.

**Can they reach each other?**

- **If yes** — there is no security at all, and nobody would use AWS.
- **If no** — then *how*, when they are on the same hardware?

> **The answer is no, and the technology that makes it so is the Virtual Private Cloud.**

When A launches an instance, it goes into **A's own VPC**. B's goes into **B's own VPC**. They may share a physical host, but they are in **different VPCs** — so they are isolated and cannot reach one another.

---

## "But I Never Created a VPC"

Correct — and you did use one.

> **AWS gives every account a default VPC in every region.** Every EC2 instance you have launched so far went into it.

You can see it: **VPC console → Your VPCs**. The entry is flagged **Default VPC: Yes**, and the VPC ID shown there matches the one that appears in the Network settings when launching an instance.

**You can delete it** — but only if it holds no resources. Delete it and try to launch an instance: the VPC field is **blank** and the launch is **blocked**. No VPC, no instances.

> If you delete it by accident, **Actions → Create default VPC** rebuilds it in about a minute.

---

## The Analogy

Think of the **Mumbai region** as the **city of Mumbai** — public infrastructure anyone can use, like the local trains.

Inside that public city you have **your own home**. You decide who comes in, who goes out, and what you keep there.

> **The region is the city. Your VPC is your home inside it.** Every resource you create goes in there, where you control access.

---

## Why the Default VPC Is Not Enough

For a small workload the default VPC is fine. For a real application it is not, because:

- **You cannot choose your own IP address range.**
- Its layout is built for small, general use — not for your application's security requirements.

An application at the scale of Swiggy or Zomato needs a VPC **you design**. And to design one you need: **public subnets, private subnets, internet gateway, NAT gateway, route tables, endpoints, network ACLs and security groups**.

> That is exactly what the rest of this section builds — step by step, from an empty region to a working two-tier architecture.
`,
    },
    {
      id: "vpc-create-cidr",
      title: "VPC – Creating a VPC & Choosing CIDR",
      shortDesc: "The 5-step build, private IP ranges, and why subnets live inside availability zones",
      visuals: ["VPCBuildSteps", "CIDRExplorer"],
      content: `## The Five-Step Process

Building your own VPC always follows the same sequence:

1. **Create the VPC**
2. **Choose the IP address range (CIDR)**
3. **Create subnets**
4. **Attach an internet gateway**
5. **Configure route tables**

This topic covers steps 1–2 and introduces step 3.

---

## Start by Deleting the Default VPC

Not required, but it keeps things clear — otherwise you end up with a mixture of default and custom subnets that is easy to confuse.

**VPC console → select the default VPC → Actions → Delete VPC**, then type the confirmation text.

> ⚠️ **The VPC must be empty.** Any running resources and the delete is refused.

---

## Create the VPC

**Create VPC → VPC only.** Give it a name — for example **my-corp-VPC**.

---

## Choosing the IP Range

You are designing your own network, exactly as you would on-premises — and as on-premises, **you use private IP ranges**.

| Class | Range | CIDR mask | Suits |
|---|---|---|---|
| **A** | 10.0.0.0 – 10.255.255.255 | **/8** | Very large infrastructure |
| **B** | 172.16.0.0 – 172.31.255.255 | **/16** | Medium |
| **C** | 192.168.0.0 – 192.168.255.255 | **/24** | Small |

This build uses **192.168.0.0/24**.

> ⚠️ **You cannot edit a CIDR range once set.** You can *add* more ranges later, but the original cannot be changed — only deleting the whole VPC removes it. Choose deliberately.

---

## Subnets Live Inside Availability Zones

The VPC exists, but launching an instance still fails: the **Subnet** field is empty.

A region has multiple availability zones — Mumbai has **ap-south-1a**, **1b** and **1c**. **A subnet is created inside one availability zone.**

> **No subnet in an availability zone means you cannot use that availability zone at all** — and if you cannot use the AZ, you cannot place an instance there.

**The rule to hold on to:**

> ⚠️ **A subnet cannot span availability zones.** One subnet, one AZ. You may create **many subnets inside one AZ**, but never one subnet across several.
>
> This trips people up coming from **Azure**, where subnets *can* span zones. In AWS they cannot.

---

## Create the First Subnet

**Subnets → Create subnet** → select your VPC → name it **subnet-1** → choose **ap-south-1a** → enter a CIDR.

The CIDR **must sit inside the VPC's range**. With a VPC of 192.168.0.0/24 you cannot use 192.168.1.0/24 or a 10.x range — AWS rejects it.

Give **subnet-1** the whole **192.168.0.0/24** and it is created successfully.

---

## And Immediately, a Problem

Your instance now runs in **ap-south-1a**. For redundancy you want a second one in **ap-south-1b** — but that AZ has no subnet, so it is not offered.

Try to create **subnet-2** in ap-south-1b and **it fails**: there is no address space left. **The entire VPC range was given to subnet-1.**

> This is the central puzzle of the next topic — and it has **two** solutions.
`,
    },
    {
      id: "vpc-subnets",
      title: "VPC – Subnets, CIDR Splitting & Reserved IPs",
      shortDesc: "Two ways to free up address space, and why AWS gives you 123 IPs instead of 126",
      visuals: ["ReservedIPExplainer"],
      content: `## The Problem, Restated

Your VPC is **192.168.0.0/24** and **subnet-1 took all of it**. There is nothing left for a subnet in ap-south-1b.

**A simple way to think about it:** you brought home one chocolate and gave it to one child. The second child arrives and there is none left.

**Two solutions**, and only one of them scales.

---

## Solution 1 — Add Another CIDR Range

Buy a second chocolate.

**VPC → Actions → Edit CIDRs → Add new IPv4 CIDR** — for example **192.168.1.0/24**. Now create **subnet-2** in ap-south-1b using that range.

> **You cannot edit an existing CIDR — only add new ones.**

It works, but there is a hard ceiling:

> ⚠️ **A VPC accepts a maximum of five CIDR ranges.** Five chocolates, five children.

**Why that matters:** Mumbai has three availability zones, so five is plenty. But **N. Virginia has six**. Put one subnet in each AZ and you need six ranges — **and you cannot**.

So this solution does not generalise.

---

## Solution 2 — Split the Range (the Real Answer)

Divide the chocolate instead of buying more.

Use a **subnet calculator**: enter **192.168.0.0/24**, ask for **2 subnets**, and it returns two **/25** blocks:

| Subnet | CIDR | Availability zone |
|---|---|---|
| **subnet-1** | **192.168.0.0/25** | ap-south-1a |
| **subnet-2** | **192.168.0.128/25** | ap-south-1b |

Delete the old subnet, create these two, and both availability zones are now usable — **from a single VPC CIDR**. Need more subnets? Split further into /26, /27 and so on.

---

## Why AWS Says 123 Usable IPs, Not 126

Your subnet calculator says a **/25** gives **126 usable hosts**. AWS shows **123**. The missing three are not a bug.

Standard networking always reserves two:

- **192.168.0.0** — the **network address**
- **192.168.0.127** — the **broadcast address**

**AWS reserves three more**, at the start of every subnet:

| Address | Reserved for |
|---|---|
| **192.168.0.1** | The **VPC router** |
| **192.168.0.2** | **DNS** |
| **192.168.0.3** | **Future use** |

**128 total − 2 standard − 3 AWS = 123 usable.**

> The same applies to the second subnet: **.128** network, **.129** router, **.130** DNS, **.131** future use, **.255** broadcast. Usable range **192.168.0.132 – .254**.

---

## Auto-Assign Public IP Is Off by Default

Launch an instance into your new subnet and notice **Auto-assign public IP: Disabled**.

> **In a subnet you created yourself, this defaults to off.** In the **default VPC** it is **on** for every subnet — which is why instances "just worked" before.

Two ways to change it:

- **Per instance** — enable it in Network settings at launch.
- **Per subnet** — **Subnets → select → Actions → Edit subnet settings → Enable auto-assign public IPv4 address.** Every future instance in that subnet then gets one automatically.

---

## Still Not Reachable

Create one instance in each subnet, give both public IPs, allow **SSH (22)** and **ICMP** in the security group, and try to connect.

**It times out. Both of them.**

Nothing is wrong with your key or your security group. Your VPC is a house with rooms and furniture — **but no internet connection**. That is the next topic.
`,
    },
    {
      id: "vpc-igw-route-table",
      title: "VPC – Internet Gateway & Route Tables",
      shortDesc: "The three things that must all be true before an instance reaches the internet",
      visuals: ["IGWRouteFlow"],
      content: `## Why the Connection Timed Out

Your VPC, subnets and instances all exist. What is missing is **internet connectivity**.

> You have built the house. Now you need to call an ISP. In a VPC, that is the **internet gateway**.
>
> A **default VPC has one already attached** — which is why instances there worked without any of this.

---

## Step 1 — Create and Attach the Internet Gateway

**VPC → Internet Gateways → Create internet gateway.** Name it and create — it appears in seconds with the state **Detached**.

Then **Actions → Attach to VPC** and select your VPC.

> **An internet gateway attaches to a VPC** — not to a subnet, and not to an instance. One per VPC.

**Try to connect again. It still fails.**

---

## Step 2 — The Route Table

When you created the VPC, AWS created a **main route table** automatically.

> **You cannot delete the main route table**, and **both subnets are already associated with it** — shown as **implicit** associations, meaning you need do nothing to link them.

But it has no route to the gateway. So: **Route Tables → main route table → Routes → Edit routes → Add route**:

- **Destination:** **0.0.0.0/0** — any traffic
- **Target:** your **internet gateway**

Save, and confirm the route shows as **Active**.

**Now the connection works** — you can SSH in from your office, and from inside the instance you can ping Google. **Inbound and outbound both work.**

---

## Do Instances in Different Subnets Talk to Each Other?

**Yes** — over their **private IPs**, with nothing extra to configure.

The two subnets have different ranges, but **both are associated with the same route table**, so they are connected through the VPC router. Ping one instance's private IP from the other and it replies.

---

## ⚠️ No Public IP Means No Internet — Either Direction

This one is heavily examined.

> **The internet gateway only works with instances that have a public IP.**

An instance without one has:

- **No inbound connectivity** — you cannot reach it over the internet.
- **No outbound connectivity** — from inside it, you cannot reach Google, Facebook or anything else.

Having the gateway attached and the route in place **changes nothing** for that instance.

> You *can* still reach it — by connecting to an instance that **does** have a public IP and hopping across via private IP. That is the **bastion host** pattern from the EC2 section, and the proper answer for private subnets comes later with the **NAT gateway**.

---

## The Three Requirements

All three must be true:

| # | Requirement |
|---|---|
| **1** | An **internet gateway attached** to the VPC |
| **2** | A **route** for **0.0.0.0/0** pointing at that gateway |
| **3** | The instance has a **public IP** |

Miss any one and there is no connectivity.

---

## Pricing and Availability

- **The internet gateway itself is free.** There is no separate charge for it.
- It is **highly available** — you do not manage its redundancy.
- Bandwidth is **virtually unlimited**; AWS publishes no cap.
- **You pay for bandwidth on the resource's own bill** — the EC2 instance's, not the gateway's.

> ⚠️ **Inbound traffic to AWS is always free. You pay only for outbound.** That rule holds across AWS, not just here.
`,
    },
    {
      id: "vpc-two-tier-architecture",
      title: "VPC – Two-Tier Architecture",
      shortDesc: "Why real applications split into a public web tier and a private database tier",
      visuals: ["TwoTierArchitecture"],
      content: `## What We Have So Far Is Not Enough

You have a VPC, two subnets, instances and an internet gateway. But **both subnets are public** — both are wired to the internet gateway, so anything in either is reachable from the internet.

For a real deployment that is not good enough. **How secure your application is depends on how you design the VPC.**

---

## How Applications Are Actually Built

Take an ordinary web application.

**The web server** is the user's point of contact. Someone opening your site is talking to it, which is why it **always has a public IP**.

But that exposure cuts both ways: **web servers are on the internet, so anyone can reach them.**

**The database server** holds everything the users produce. That is the heart of the system — and you emphatically **do not** want anyone on the internet reaching it directly.

**The intended flow:** the user talks to the **web server**, and the **web server** talks to the **database**. Nobody talks to the database from outside.

> **Two tiers:** a **web tier** exposed to the internet, and a **database tier** that is not.

---

## Mapping That Onto a VPC

- **Public subnets** — inbound internet connectivity. **Web servers** live here.
- **Private subnets** — no inbound internet. **Database servers** live here.

The database needs **no public IP at all**. Users reach the web server; the web server reaches the database over private IPs.

---

## Why Four Subnets, Not Two

You could build this with one public and one private subnet. But **AWS best practice for high availability is to span two availability zones**.

So the standard shape is:

| Subnet | Availability zone | Holds |
|---|---|---|
| **public-subnet-1** | ap-south-1a | Web server |
| **public-subnet-2** | ap-south-1b | Web server |
| **private-subnet-1** | ap-south-1a | Database |
| **private-subnet-2** | ap-south-1b | Database |

If one availability zone fails, the other keeps serving.

---

## The Questions This Raises

Building it surfaces two problems we have to solve:

1. **If a database instance has no public IP and no inbound internet, how do you administer it?**
2. **What about outbound?** The database still needs to download operating system patches, database packages and antivirus updates. That needs **outbound** internet — without allowing **inbound**.

> The first is answered by **bastion hosts** and **EC2 Instance Connect endpoints**. The second is what the **NAT gateway** exists for. Both are coming up.
`,
    },
    {
      id: "vpc-public-private-subnets-lab",
      title: "Lab – Build Public & Private Subnets",
      shortDesc: "Four subnets, an internet gateway, and a custom route table that makes two of them public",
      visuals: ["VPCBuildSteps"],
      content: `## What Makes a Subnet "Public"

Worth stating up front, because the name misleads:

> **A subnet is public because its route table has a route to the internet gateway.** Nothing else. Naming a subnet "public-subnet-1" does not make it public.

---

## Step 1 — Create the VPC and Four Subnets

**Create VPC → VPC only**, name it, CIDR **192.168.0.0/24**.

Then **Subnets → Create subnet**, and use **Add new subnet** to create all four on one screen. Split the /24 into four **/26** blocks with a subnet calculator:

| Name | Availability zone | CIDR |
|---|---|---|
| **public-subnet-1** | ap-south-1a | **192.168.0.0/26** |
| **public-subnet-2** | ap-south-1b | **192.168.0.64/26** |
| **private-subnet-1** | ap-south-1a | **192.168.0.128/26** |
| **private-subnet-2** | ap-south-1b | **192.168.0.192/26** |

> At this point **all four are effectively private** — there is no internet connectivity anywhere in the VPC yet.

---

## Step 2 — Internet Gateway

**Internet Gateways → Create internet gateway** → name it → create. It appears **Detached**.

**Actions → Attach to VPC** → select your VPC.

---

## Step 3 — Understand the Main Route Table First

AWS created a **main route table** with the VPC. Select it and open **Subnet associations**:

**All four subnets are already associated with it**, shown under **"Subnets without explicit association"** — meaning the association is **implicit** and automatic.

**This is the crux of the problem.** Add an internet-gateway route to the main route table and **all four subnets become public** — which is not what you want.

---

## Step 4 — A Custom Route Table for the Public Subnets

**Route Tables → Create route table** → name it **rt-public** → select your VPC → create.

It has no subnets associated, so right now it does nothing.

**Select it → Subnet associations → Edit subnet associations** → tick **public-subnet-1** and **public-subnet-2** → **Save associations**.

> **A subnet can only be associated with one route table.** Associating the two public subnets with **rt-public** automatically removes them from the main route table — there is nothing to disassociate manually.

The result: the two public subnets use **rt-public**; the two private subnets remain on the **main** route table.

---

## Step 5 — Add the Internet Route

**rt-public → Routes → Edit routes → Add route:**

- **Destination:** **0.0.0.0/0**
- **Target:** your **internet gateway**

Save.

**Now the split is real.** The two subnets associated with rt-public have a path to the internet gateway — they are **public**. The two on the main route table have no such path — they are **private**.

---

## The Result

| | Route table | Route to IGW? | Subnet type |
|---|---|---|---|
| **public-subnet-1 / 2** | rt-public | ✅ 0.0.0.0/0 → igw | **Public** |
| **private-subnet-1 / 2** | main | ❌ none | **Private** |

---

## And Now the Difficulty

Put a database instance in a private subnet and you immediately hit it: **no inbound internet, no public IP.**

You are at your desk and you need to SSH in to install and configure the database. **How do you reach a machine with no public IP?**

> There are two answers, and the next topic covers both.
`,
    },
    {
      id: "vpc-private-subnet-access",
      title: "VPC – Reaching Instances in a Private Subnet",
      shortDesc: "EC2 Instance Connect endpoints vs bastion hosts, and when each one fits",
      visuals: ["PrivateSubnetAccess"],
      content: `## The Problem

Two instances: a **web server** in a public subnet with a public IP, and a **database server** in a private subnet with **only a private IP**.

The web server is easy — SSH straight to its public IP.

The database server is not. Try SSH to its private IP and it fails, because **private IPs are not routable over the internet**.

**Two solutions.**

---

## Solution 1 — EC2 Instance Connect Endpoint

A relatively recent AWS feature, and the tidier option.

**VPC → Endpoints → Create endpoint:**

- **Name** it
- **Type:** **EC2 Instance Connect Endpoint**
- **VPC:** yours
- **Security group:** one allowing the traffic
- **Subnet:** the **private subnet** holding the instance

Wait for **Available**.

**To use it:** select the instance → **Connect** → **Connect using EC2 Instance Connect Endpoint** → choose your endpoint → **Connect**. You are in — no password prompt, no public IP.

**The catch, and it matters:**

> ⚠️ **The endpoint authenticates through AWS API calls**, so **whoever uses it needs credentials for your AWS account.**

**Where that breaks down:** suppose a **freelancer** administers your database. With this approach you would have to give them **AWS account access**. Often you do not want that — you want to hand them a **.pem file** and nothing more.

---

## Solution 2 — Bastion Host

The classic pattern, and the one to name in an interview.

Keep an instance in the **public subnet** with a **public IP** whose job is to be the way in. Connect to it, then hop onward to the private instance over its **private IP**.

> **Interview note:** you *can* answer "connect to the public instance, then to the private one from there" — but say **bastion host** and the follow-up question does not come.

---

## Walking Through the Bastion Hop

**1 · Connect to the bastion** using its public IP:

**ssh -i my-key.pem ec2-user@bastion-public-ip**

**2 · The key is not there.** Run **ls** on the bastion and your **.pem** is missing — it is on **your own computer**, not on the bastion. You cannot hop without it.

**3 · Copy the key across with SCP.** From your own machine:

**scp -i my-key.pem my-key.pem ec2-user@bastion-public-ip:/home/ec2-user**

> The key appears **twice** deliberately: once to **authenticate** the copy, once as the **file being copied**.

Confirm with **ls** on the bastion — it is there now.

**4 · Try the hop** to the private instance's private IP — and it fails with **Permission denied**.

**5 · Fix the permissions.** The copied file is readable by others, and SSH refuses keys that are too open. AWS gives you the exact command under **Connect → SSH client**:

**chmod 400 my-key.pem**

**6 · Hop again** — and you are on the database server. Check the IP: it is the private one. **exit** returns you to the bastion; the connection is nested.

---

## Choosing Between Them

| | EC2 Instance Connect Endpoint | Bastion Host |
|---|---|---|
| **Extra instance needed?** | ❌ No | ✅ Yes, running in a public subnet |
| **Authentication** | **AWS account credentials** | The **.pem** key file |
| **Suits a third party?** | ❌ They would need AWS access | ✅ Just hand over the key |
| **Setup** | Create an endpoint | Launch and maintain an instance |

---

## Still One Problem Left

You are on the database server. Now try:

- **ping google.com** — nothing.
- **yum install** anything — it hangs at "downloading packages".

**No internet.** Which is exactly what a private subnet means — but it blocks you from **installing the database**, **patching the OS**, or **updating antivirus**.

> To be precise about what is wanted: **no inbound** internet — nobody should reach this machine from outside. But **outbound** internet is needed. That is the **NAT gateway**.
`,
    },
    {
      id: "vpc-nat-gateway",
      title: "VPC – NAT Gateway",
      shortDesc: "Outbound-only internet for private subnets — and why it lives in a public subnet",
      visuals: ["NATGatewayFlow", "NATPlacementQuiz"],
      content: `## Why the Private Instance Has No Internet

Two separate reasons, and both must be solved:

**1 · No route.** The private subnets use the **main route table**, which has no path to the internet gateway.

**2 · No public IP.** Even with a route, **the internet gateway only communicates with resources that have a public IP.** Your database has a private IP only — and you deliberately do not want to give it a public one.

> So you need an **agent**: something that *does* have a public IP, which can talk to the internet gateway on the private instance's behalf.
>
> **That agent is the NAT gateway.**

---

## What NAT Means

**NAT = Network Address Translation.**

Outbound, it **swaps the private source IP for its own public IP** so the internet gateway will accept the traffic. Inbound, it **translates back** and delivers the reply to the right private instance.

> Your home wireless router does exactly this. It is the same idea.

---

## ⚠️ Which Subnet Does It Go In?

This is the question people reliably get wrong.

You are building it **for the private subnet**, so the instinct is to put it **in** the private subnet.

> **Wrong. The NAT gateway goes in a PUBLIC subnet.**

**Why:** in a private subnet the NAT gateway would have **no internet itself** — and it cannot hand out what it does not have. Sitting in a **public subnet**, it can reach the internet gateway, and *then* relay for the private instances.

Either public subnet is fine.

---

## Creating It

**VPC → NAT Gateways → Create NAT gateway:**

- **Name** it
- **Subnet:** a **public** subnet
- **Connectivity type:** Public
- **Elastic IP:** click **Allocate Elastic IP** — the NAT gateway needs a public IP to talk to the internet gateway

Create, and wait for **Available**.

---

## It Still Does Not Work — Add the Route

The gateway exists, but the private subnets have no idea it is there.

**Route Tables → main route table → Routes → Edit routes → Add route:**

- **Destination:** **0.0.0.0/0**
- **Target:** your **NAT gateway** — not the internet gateway

> ⚠️ Easy slip: selecting the **internet gateway** here instead. If you pick a stale or wrong target, the route shows as **Blackhole** rather than **Active**. Check for **Active**.

Save, go back to the private instance, and **ping google.com** now works. **yum install** completes.

---

## What You Have Built

**Outbound works. Inbound does not.**

Only the **NAT gateway's public IP** is ever seen by the internet gateway. Your private instance's IP never leaves the VPC. Nobody on the internet can **initiate** a connection to it.

| | Internet Gateway | NAT Gateway |
|---|---|---|
| **Serves** | Public subnets | **Private** subnets |
| **Lives** | Attached to the VPC | **In a public subnet** |
| **Inbound** | ✅ Yes | ❌ **No** |
| **Outbound** | ✅ Yes | ✅ Yes |
| **Needs a public IP on the instance** | ✅ Yes | ❌ No |
| **Cost** | **Free** | **Chargeable** |

**Capacity:** up to **55,000 simultaneous connections** and **45 Gbps** of bandwidth.

---

## ⚠️ Clean Up — Two Things, Not One

> **The NAT gateway is chargeable** — one of the few VPC components that is. Most of the rest are free.

1. **Delete the NAT gateway.**
2. **Release its elastic IP.** Deleting the gateway does **not** release it, and an unattached elastic IP **keeps billing**. Go to **Elastic IPs → select → Release**.

> The release will be refused while the gateway is still deleting. Wait a few minutes, then release it.
`,
    },
    {
      id: "vpc-components-summary",
      title: "VPC – Components Summary & Limits",
      shortDesc: "The seven-component cheat sheet, with every limit worth memorising",
      visuals: [],
      content: `## Why This Topic Exists

VPC is a favourite in both interviews and the exam. This is the condensed version of everything built so far — worth rereading before an exam rather than rewatching the whole build.

---

## 1 · VPC

> **A virtual network dedicated to your AWS account within the AWS cloud, providing logical isolation between AWS resources.**

AWS is shared infrastructure — your resources and a stranger's may sit on the same hardware. **VPC is what isolates them.**

| Limit | Value |
|---|---|
| **CIDR mask range** | **/16 to /28** |
| **CIDR ranges per VPC** | **5** |
| **VPCs per region** | **5** — a **soft limit**; contact AWS support to raise it |

> A CIDR range **cannot be changed** once added. You can remove it or add more, but not edit it.

---

## 2 · Subnets

> **A segmented portion of the VPC IP range**, from which resources draw their IP addresses.

- **Subnets are created inside an availability zone.** You choose which.
- **You can create many subnets in one availability zone** — but **one subnet never spans two**.
- **Limit: 200 subnets** per VPC.

---

## 3 · Public Subnet

> **A subnet that is accessible from the internet.**

- **Typically holds:** load balancers and web servers — anything that must be reachable worldwide.
- **Requires an internet gateway**, which gives it **both inbound and outbound** connectivity.

---

## 4 · Private Subnet

> **A subnet that is not accessible from the internet.**

- **Ideal for:** sensitive resources, especially **databases**.
- **Requires a NAT gateway** for **outbound** internet.

> The distinction that matters: a private subnet is **not** without internet. It has **outbound** — you can download packages and updates. What it lacks is **inbound**: nobody can reach in.

---

## 5 · Internet Gateway

- **Role:** connects the VPC to the internet.
- **Configuration:** create it, then **attach it to the VPC**.
- ⚠️ **A public IP is mandatory** on any resource that wants to communicate through it.

---

## 6 · NAT Gateway

- **Role:** lets instances in a **private** subnet reach the internet for updates and downloads.
- **Configuration:** placed **inside a public subnet** — never a private one.
- ⚠️ **No inbound traffic.** Outbound only.
- **Capacity:** **55,000 simultaneous connections**, **45 Gbps**.

---

## 7 · Route Tables

- **Role:** control where network traffic is directed.
- **Main route table** — created automatically, **cannot be deleted**, and **all subnets associate with it implicitly** unless you move them.
- **Custom route table** — what you create to make specific subnets public.

| Limit | Value |
|---|---|
| **Route tables per VPC** | **200** |
| **Routes per route table** | **50** |

> Fifty routes seems excessive after adding just one — but **Transit Gateway**, **VPC peering** and **endpoints** all add entries here. Later topics fill that space.

---

## The Whole Picture

| Component | Purpose | Key constraint |
|---|---|---|
| **VPC** | Isolation | /16–/28 · 5 CIDRs · 5 per region |
| **Subnet** | Segment of the range | Inside **one** AZ · 200 max |
| **Public subnet** | Internet-facing | Needs an **internet gateway** route |
| **Private subnet** | Protected | Needs a **NAT gateway** for outbound |
| **Internet gateway** | VPC ↔ internet | Attached to the **VPC** · public IP required · **free** |
| **NAT gateway** | Outbound for private | Lives in a **public** subnet · **chargeable** |
| **Route table** | Traffic direction | Main cannot be deleted · 200 tables · 50 routes |
`,
    },
    {
      id: "vpc-peering",
      title: "VPC – Peering Connections",
      shortDesc: "Connecting two VPCs across accounts and regions, and the routes both sides need",
      visuals: ["VPCPeeringDemo"],
      content: `## Two Questions to Start

**Two VPCs in two different AWS accounts — can they communicate?** No.

**Two VPCs in the same AWS account — can they communicate?** **Also no.**

> **By default, two VPCs cannot communicate — even inside the same account.** Isolation is the whole point of a VPC.

To connect them you create a **VPC peering connection**.

---

## What Peering Can Span

Peering is unusually flexible:

- **Same account or different accounts**
- **Same region or different regions**

Two VPCs on opposite sides of the world in unrelated accounts can be peered.

---

## ⚠️ Plan Your CIDR Ranges First

Before anything else:

> **The two VPCs must not use overlapping CIDR ranges.**

Use **192.168.0.0/24** for one and **192.168.1.0/24** for the other — or a 10.x range. Use **the same range on both** and **peering cannot be established**.

The reason becomes obvious later: each side needs a route to the other's range, and if that range is already its own **local** route, there is nothing to add.

---

## The Setup

Two VPCs, deliberately in different regions:

| | Mumbai (ap-south-1) | N. Virginia (us-east-1) |
|---|---|---|
| **VPC** | my-india-VPC · 192.168.0.0/24 | my-us-VPC · 192.168.1.0/24 |
| **Subnet** | one private subnet | one private subnet |
| **Instance** | india-server | us-server |

Both instances are in **private subnets with no public IP and no internet gateway** — this demonstration uses **only the AWS private network**.

> Security groups here allow **all traffic**, deliberately. If a security group blocked the test you would misread it as a peering failure.

To reach a private instance with no public IP, use an **EC2 Instance Connect Endpoint**, as covered earlier.

**Ping the US instance's private IP from the India instance and it hangs.** No reply — as expected, because the VPCs are isolated.

---

## Peering Is a Two-Way Handshake

**One VPC requests, the other accepts.**

**On the requester side (Mumbai): VPC → Peering connections → Create peering connection**

- **Name** it
- **VPC (Requester):** my-india-VPC
- **Account:** My account (or **Another account** with its account ID)
- **Region:** **Another region** → **us-east-1**
- **VPC (Accepter):** the US VPC's **ID** — copy it from the US region's VPC page

Create, and the request is **pending acceptance**.

**On the accepter side (N. Virginia): Peering connections → select the pending request → Actions → Accept request.**

After a couple of minutes both sides show **Active**.

---

## Still No Connection — Routes on Both Sides

Ping again and it **still hangs**, even with peering Active.

> **Peering only makes the connection possible. Traffic does not flow until each side has a route to the other.**

**In Mumbai → Route Tables → Routes → Edit routes → Add route:**

- **Destination:** **192.168.1.0/24** — the *remote* range
- **Target:** **Peering connection**

**In N. Virginia**, the mirror image:

- **Destination:** **192.168.0.0/24**
- **Target:** the same **peering connection**

> ⚠️ **You must do this on BOTH sides.** One route only gets you halfway. This is also where overlapping CIDRs would break down — the destination you need to add would already exist as your own **local** route.

**Now the ping replies.** Two VPCs, two regions, communicating over the AWS private network.

---

## Removing It

Delete the peering connection and **communication stops immediately**. AWS offers to **delete the related routes** at the same time.

> Peering underpins several later topics — **Transit Gateway** exists precisely because peering does not scale to many VPCs.
`,
    },
    {
      id: "vpc-nacl",
      title: "VPC – Network ACLs",
      shortDesc: "Subnet-level firewalling, rule numbers, and the deny rules security groups cannot do",
      visuals: ["NACLRuleSimulator"],
      content: `## Two Layers of Defence

Reaching an EC2 instance means passing **two** security checks:

1. **Network ACL** — protects the **entire subnet**
2. **Security group** — protects the **individual resource**

> **The building analogy.** A building holds 50 offices. Security at the **building entrance** is the **network ACL** — everyone entering passes it. Security at **your specific office door** is the **security group**.

---

## The Defaults Are Opposites — Learn Both

| | Inbound | Outbound |
|---|---|---|
| **Default NACL** (created with the VPC) | **Allow all** | **Allow all** |
| **A NACL you create** | **Deny all** | **Deny all** |

> The default NACL allows everything both ways, so it is **effectively disabled** — which is why traffic "just worked" before you knew NACLs existed.
>
> A NACL **you** create denies everything. Associate one with a subnet and **all traffic stops instantly** — web, SSH, ping, everything.

**A NACL does nothing until you associate it with a subnet.** Create it, then **Subnet associations → Edit** → select the subnet. That automatically removes the subnet from the default NACL.

---

## NACLs Are Stateless — You Need Both Directions

Add an inbound rule allowing **ICMP** and try to ping. **It still fails.**

> ⚠️ **A network ACL is stateless.** Allowing traffic in does **not** allow the reply out. **You must write both an inbound and an outbound rule.**

Add an outbound rule allowing all traffic, and the ping works.

That is the single biggest practical difference from security groups, which are **stateful** and handle the return path for you.

---

## Rule Numbers and Priority

Every rule has a **number**, and:

> **Lower rule number = higher priority.** Rules are evaluated **in order**, and **the first match wins** — evaluation stops there.

Opening things up gradually:

| Rule | Traffic | Source | Action |
|---|---|---|---|
| **100** | All ICMP | 0.0.0.0/0 | Allow |
| **200** | SSH (22) | 0.0.0.0/0 | Allow |
| **300** | HTTP (80) | 0.0.0.0/0 | Allow |

---

## Deny Rules — and the Mistake Worth Making Once

**Network ACLs have deny rules. Security groups do not.** That is a genuine capability difference.

Say you want to block HTTP **from one specific IP** while allowing everyone else. Add:

| Rule | Traffic | Source | Action |
|---|---|---|---|
| **400** | HTTP (80) | your IP | **Deny** |

**Test it — and the site still loads.** The deny rule appears to do nothing.

**Why:** evaluation runs in order. Rule **300** already says *allow HTTP from anywhere*, it matches first, and **evaluation stops**. Rule 400 is never reached.

**The fix is to renumber, not to rewrite.** Change the deny rule from **400** to **250**:

| Rule | Traffic | Source | Action |
|---|---|---|---|
| 100 | All ICMP | 0.0.0.0/0 | Allow |
| 200 | SSH (22) | 0.0.0.0/0 | Allow |
| **250** | **HTTP (80)** | **your IP** | **Deny** |
| 300 | HTTP (80) | 0.0.0.0/0 | Allow |

Now traffic from your IP matches **250** first and is denied. Everyone else falls through to **300** and is allowed.

**Verified:** the site no longer loads from your machine — including in incognito mode, which rules out caching — but **loads fine from a phone on a different IP**. SSH and ping still work, because those match different rules.

> **Leave gaps when numbering.** Starting at 100, 200, 300 exists precisely so you can slot a rule in at 250 later.
`,
    },
    {
      id: "vpc-sg-vs-nacl",
      title: "VPC – Security Groups vs Network ACLs",
      shortDesc: "The four differences that decide which one to reach for",
      visuals: ["NACLvsSecurityGroup"],
      content: `## Four Differences

This is one of the most common points of confusion in AWS, and it comes down to four things.

---

## 1 · What They Attach To

**Security group → a network interface.** That means an **EC2 instance**, a **load balancer**, an **EFS mount target** — anything with a network interface.

**Network ACL → a subnet.**

**How that decides your choice:**

- *"Block port 80 for the entire subnet — no instance in it should accept that traffic."* → **network ACL**. Security at the building entrance.
- *"Allow port 80 to this one instance and not the others."* → **security group**. Security at one office door.

---

## 2 · How Rules Are Evaluated

**Security group — all rules apply simultaneously.** Add rules for HTTP, FTP, NFS and SMTP and there is **no priority and no ordering**. Traffic matching any rule is allowed.

**Network ACL — rules apply in sequence, by rule number.** **Lower number, higher priority**, and **the first match wins**.

> This is why a deny rule numbered *above* a matching allow rule does nothing — as demonstrated in the previous topic.

Sometimes ordering is an advantage; sometimes it is a trap.

---

## 3 · Allow Only, vs Allow and Deny

**Security group — allow rules only.** There is no deny option. Whatever you allow is permitted; **everything else is implicitly denied**.

**Network ACL — allow and deny.**

> **This is the capability security groups lack.** "Allow HTTP from everyone *except* this one IP" is **impossible** with a security group and straightforward with a NACL.

Worth remembering — it shows up in exam questions.

---

## 4 · Stateful vs Stateless

**Security group — stateful.** Traffic your resource initiates is allowed back in automatically. **No inbound rule needed for replies.**

**Network ACL — stateless.** No state is tracked, so **replies need their own explicit rule**.

That is real administrative overhead, and it is why most people reach for security groups by default and use NACLs only where they add something.

---

## Summary

| | 🛡️ Security Group | 🧱 Network ACL |
|---|---|---|
| **Attaches to** | **Network interface** — EC2, ELB, EFS | **Subnet** |
| **Scope** | One resource | Every resource in the subnet |
| **Rule evaluation** | **All simultaneously**, no priority | **In sequence** by rule number, first match wins |
| **Rule types** | **Allow only** | **Allow and deny** |
| **State** | **Stateful** — replies automatic | **Stateless** — needs both directions |
| **Admin overhead** | Lower | Higher |

> **Choosing between them:** subnet-wide policy or an explicit block on a specific source → **NACL**. Everything else → **security group**.
`,
    },
    {
      id: "vpc-stateless-vs-stateful",
      title: "VPC – Stateless vs Stateful",
      shortDesc: "Why the difference only shows up in one direction of traffic",
      visuals: ["StatefulVsStateless"],
      content: `## The Distinction in One Idea

Both a security group and a network ACL are firewalls with **inbound** and **outbound** rules. The difference between **stateful** and **stateless** appears in **only one of the two traffic directions** — which is exactly why it confuses people.

---

## Direction 1 — Traffic Coming In

Someone on the internet opens a website hosted on your EC2 instance. Traffic flows **from the internet into your instance**.

**You must allow it inbound** — port 80, in this case.

> **This is identical for stateful and stateless.** Both need the inbound rule. **No difference at all.**

---

## Direction 2 — Traffic You Initiate

Now reverse it. **Your instance** starts a connection **out** to the internet — downloading a package, say.

**Both** require an **outbound** rule to let the request leave. Still no difference.

**The difference is in the reply.**

**Stateful (security group):** when the request went out, the firewall **recorded the state** of that connection. The reply is recognised as belonging to it and **allowed back in automatically**.

> **No inbound rule is needed.** Even with **zero** inbound rules, it works.

**Stateless (network ACL):** no state is recorded. The reply is judged **purely on the inbound rules** — and if none permits it, **it is dropped**, despite being the answer to something you asked for.

> **You must add an inbound rule for the return traffic.**

---

## Side by Side

| | Stateful (Security Group) | Stateless (Network ACL) |
|---|---|---|
| **Inbound traffic from outside** | Needs an inbound rule | Needs an inbound rule |
| **Outbound traffic you initiate** | Needs an outbound rule | Needs an outbound rule |
| **The reply to traffic you initiated** | ✅ **Automatic** | ❌ **Needs its own inbound rule** |
| **Administrative burden** | **Lower** | **Higher** |

---

## Why It Matters in Practice

> **A stateful firewall is intelligent** — it notes the state when you initiate a connection and permits the matching reply without being told.

That single behaviour removes a great deal of rule-writing, and it is the main reason people prefer security groups and use network ACLs only where a **subnet-wide** rule or an **explicit deny** is genuinely required.
`,
    },
    {
      id: "vpc-vpn",
      title: "VPC – Site-to-Site VPN",
      shortDesc: "Connecting on-premises to AWS over the internet with an encrypted tunnel",
      visuals: ["HybridConnectivity"],
      content: `## Why a Networking Topic Belongs in an AWS Course

Recall the three cloud types — **public**, **private** and **hybrid** — and that **hybrid is the most popular**, because you take advantage of both.

Hybrid means **connecting your on-premises infrastructure to AWS**. There are **two ways** to do that:

1. **Over fiber optic cable** — that is **Direct Connect**, covered shortly.
2. **Over the internet** — that is **site-to-site VPN**, covered here.

---

## The Problem VPN Solves

Forget AWS for a moment. You have a **Mumbai** branch and a **Hyderabad** branch. Each has computers behind a router, using **private IPs**. Each router has a connection to the internet, so each has a **public IP**.

**What works:** public IP to public IP. Two public addresses can always reach each other, whether the branches are in Mumbai and Hyderabad or Mumbai and Japan.

**What does not work:** **private IP to private IP**. A computer in Mumbai cannot reach a computer in Hyderabad directly.

> Because of NAT on the router, a private IP can reach a **public** IP — that is ordinary internet access. But **private to private across two sites is not possible**.

And private-to-private is exactly what you want: every Mumbai machine able to reach every Hyderabad machine.

---

## The Solution — a Tunnel

Establish a **tunnel between the two routers**, using their public IPs. Configure it once on each router, and communication between the sites becomes **seamless**.

> **The computers are entirely unaware of it.** The tunnel exists between the routers; the machines behind them simply find that the other site is now reachable.

**That tunnel is a site-to-site VPN.**

---

## Applying It to AWS

Replace the Hyderabad branch with a **VPC**.

Your on-premises office in Mumbai on one side, an AWS VPC on the other, joined by a **site-to-site VPN**. Now:

- Every office computer can reach every **EC2 instance** in the VPC.
- Office machines can store data in **EFS** or **FSx** running in AWS.

All over **private IPs**, with **no instance exposed to the internet**.

---

## "But How Do I Configure the AWS Router?"

This is the usual worry, and it turns out to be misplaced.

> AWS provides a **simple graphical interface** for the AWS side — and, as the lab shows, it **generates a ready-made configuration file for your own router**, which you paste in.

The traffic is **encrypted with IPsec**, because it crosses the public internet.

> The next topic builds one end to end.
`,
    },
    {
      id: "vpc-vpn-lab",
      title: "Lab – Site-to-Site VPN to On-Premises",
      shortDesc: "Customer gateway, virtual private gateway, the generated router config, and routes both ways",
      visuals: [],
      content: `## The Setup

**On the AWS side:** a VPC using **192.168.10.0/24**, one **private** subnet, two EC2 instances with **no public IPs** and **no internet gateway**.

**On the on-premises side:** a **Cisco router** with a **static public IP**, and a local network of **192.168.123.0/24**.

> ⚠️ **The two networks must use different ranges.** Same range on both sides and the routing cannot work — the same constraint as VPC peering.

**Start a continuous ping** to an instance's private IP before you begin. It fails, as expected — there is no connection yet. Leaving it running means you see the exact moment the tunnel comes up.

---

## The Three Pieces

Under **VPC → Virtual private network** there are three things to create, in order:

| # | Component | Represents |
|---|---|---|
| **1** | **Customer gateway** | **Your** router — its public IP |
| **2** | **Virtual private gateway** | The **AWS** end, attached to your VPC |
| **3** | **Site-to-site VPN connection** | The tunnel joining the two |

---

## Step 1 — Customer Gateway

**Customer gateways → Create customer gateway:**

- **Name** it
- **BGP ASN:** leave the default — this lab uses **static routing**, not BGP
- **IP address:** your **on-premises router's public IP**
- Certificate and device name are optional

Create — it is immediately **available**.

---

## Step 2 — Virtual Private Gateway

**Virtual private gateways → Create virtual private gateway:**

- **Name** it
- **ASN:** default

It is created **Detached**. Select it → **Actions → Attach to VPC** → choose your VPC.

> Same pattern as the internet gateway: create, then attach. Wait for **Attached** before continuing — it takes a minute or two.

---

## Step 3 — Site-to-Site VPN Connection

**Site-to-site VPN connections → Create VPN connection:**

- **Name** it
- **Target gateway type:** **Virtual private gateway** → select yours
- **Customer gateway:** **Existing** → select yours
- **Routing options:** **Static** — dynamic BGP is more complex and unnecessary here
- **Static IP prefixes:** your **on-premises** range, **192.168.123.0/24**

Create, and wait for the state to become **Available**.

---

## Step 4 — The Part That Makes This Easy

Configuring IPsec on a Cisco router by hand is genuinely involved. You do not have to.

Select the VPN connection → **Download configuration**. AWS lists **vendors, platforms and software versions**. Pick yours — check the router with **show version** if unsure — and download.

> If your device is not listed, you can still configure it manually. But for a supported device, AWS hands you a complete config.

**Open the file, select all, copy, and paste it into the router.** The whole tunnel configuration applies without typing a single command.

Verify on the router with **show ip interface brief** — **two tunnels**, both **up**.

> AWS builds **two tunnels** for redundancy. On the AWS side one may show **up** and the other **down** at first; the second follows within a few minutes.

---

## Step 5 — Routes on Both Sides

The tunnels are up and the ping **still fails**.

> The AWS network knows nothing about **192.168.123.0**, and your office network knows nothing about **192.168.10.0**. Neither side has been told.

**On AWS — Route Tables → Routes → Edit routes → Add route:**

- **Destination:** **192.168.123.0/24** — the on-premises range
- **Target:** **Virtual private gateway**

**On the router**, add the mirror route for **192.168.10.0/255.255.255.0** via the tunnels.

**The ping starts replying.**

---

## What You Have

Any machine in the office can now reach any instance in the VPC over private IPs. Ten office computers would all work the same way — and the same tunnel carries traffic to **EFS** or **FSx** for storing on-premises data in AWS.

> ⚠️ This lab needs a **real router and a static public IP**, so it is not reproducible at home. Understanding the four steps — customer gateway, virtual private gateway, VPN connection, routes both ways — is what matters.
`,
    },
    {
      id: "vpc-direct-connect",
      title: "VPC – Direct Connect",
      shortDesc: "A private fiber link to AWS: far more bandwidth, no internet, and no encryption",
      visuals: [],
      content: `## Why Not Just Use VPN?

Site-to-site VPN works, but it runs **over the internet**, which brings two limitations:

- **Security** — the public internet, which is why VPN **must** use **IPsec**.
- **Bandwidth** — a VPN connection tops out at about **1.25 Gbps**.

**Direct Connect** offers up to **300 Gbps**.

---

## What Direct Connect Is

> **A cloud service providing connectivity between your on-premises infrastructure and AWS — without the internet.**

It is the **alternative to site-to-site VPN**, connecting your **data centre**, **office** or **co-location** to AWS over a dedicated private link.

---

## How the Link Is Assembled

1. A **virtual private gateway** attached to your **VPC**.

   > ⚠️ **Not** a VPN gateway. A separate component.

2. That connects to a **Direct Connect gateway**.
3. Which connects, over **private fiber**, to an **AWS edge location**.
4. A **third-party service provider** runs fiber from that edge location **to your premises**.

So AWS partners with providers who already have presence at their edge locations, and the provider delivers the physical link to your door.

---

## Ordering One

**Direct Connect → Create connection** offers a wizard with three resiliency levels:

| Option | What you get |
|---|---|
| **Maximum resiliency** | Two AWS Direct Connect locations **and** two of your data centre locations — for full DR |
| **High resiliency** | Redundancy, but without the second Direct Connect gateway |
| **Development and test** | **Lowest** availability |

Then choose **bandwidth (1 Gbps to 300 Gbps)** and your **location**.

> **Location determines your options.** Choose Mumbai and you see the providers present there; choose Bangalore and the list is shorter. The provider must have an **AWS edge location** presence nearby.

Dual connectivity runs on the order of **$4.39/month** plus provider charges.

> **No lab for this one** — provisioning a Direct Connect link takes **30 to 90 days**. Once it exists, using it is simple.

---

## Benefits

- **Reduced bandwidth cost** — no internet bandwidth to pay for
- **Consistent network performance** — dedicated fiber, not shared internet
- **Compatible with all AWS services** — it terminates in your VPC, so everything reachable from the VPC is reachable
- **Private connectivity** — no internet at all, so far more secure
- **Elastic** — ask the provider for more bandwidth as you need it

---

## ⚠️ The Exam Point: Encryption

This gets asked directly.

| | Site-to-Site VPN | Direct Connect |
|---|---|---|
| **Travels over** | The **public internet** | **Private fiber** |
| **Encryption** | ✅ **IPsec — required** | ❌ **None — data is clear text** |
| **Max bandwidth** | ~**1.25 Gbps** | Up to **300 Gbps** |
| **Time to set up** | Minutes | **30–90 days** |
| **Cost** | Lower | Higher |

> The logic: VPN **must** encrypt because it crosses a public network. Direct Connect is a **private** link, so **AWS does not encrypt it** — the traffic is clear text. Needing both speed *and* encryption means running a VPN **over** Direct Connect.
`,
    },
    {
      id: "vpc-transit-gateway",
      title: "VPC – Transit Gateway",
      shortDesc: "One hub replacing a mesh of peering connections and per-VPC gateways",
      visuals: ["TransitGatewayMesh", "PeeringMathCalculator"],
      content: `## What It Is

> **A transit gateway is a network transit hub used to interconnect your VPCs and your on-premises infrastructure.**

Everything covered so far connects **two** things:

- **Peering** — VPC to VPC
- **VPN** — on-premises to VPC, over the internet
- **Direct Connect** — on-premises to VPC, over fiber

**Transit Gateway centralises all of it.** It can connect:

1. **One or more VPCs**
2. **VPN connections**
3. **Direct Connect**
4. **Another transit gateway** — via peering

---

## Why the Mesh Fails

Peering is strictly **point to point**. Peer A↔B and A↔C, and **B still cannot reach C**. You need that connection too.

**The number of peering connections for a full mesh:**

> **n × (n − 1) ÷ 2**

| VPCs | Peering connections |
|---|---|
| **3** | 3 × 2 ÷ 2 = **3** |
| **4** | 4 × 3 ÷ 2 = **6** |
| **10** | 10 × 9 ÷ 2 = **45** |

Three is fine. Four is tedious. **Ten means 45 connections** to create and maintain.

---

## And Gateways Multiply Too

It is not only peering.

> ⚠️ **A VPN gateway attaches to exactly one VPC.**

So connecting your on-premises network to two VPCs means **two VPN gateways** — one per VPC — even though you have a single **customer gateway** on your side. Direct Connect has to be attached per VPC as well.

Combine 45 peering connections with a gateway per VPC and the design becomes unmanageable.

---

## The Hub

With a transit gateway there is **one** central hub. Attach each **VPC**, each **VPN** and each **Direct Connect** to it **once**, then route traffic between them.

| | Without Transit Gateway | With Transit Gateway |
|---|---|---|
| **10 VPCs fully meshed** | **45** peering connections | **10** attachments |
| **On-premises to 10 VPCs** | **10** VPN gateways | **1** VPN attachment |
| **Management** | Decentralised | **Centralised** |

---

## ⚠️ The Scope Constraint

> **Everything attached to a transit gateway must be in the same AWS account and the same region.**

Need to span **regions** or **accounts**? Create **a transit gateway in each**, then **peer the transit gateways** — that is the fourth connection type listed above.
`,
    },
    {
      id: "vpc-transit-gateway-lab",
      title: "Lab – Transit Gateway Across Four VPCs",
      shortDesc: "One hub, four attachments, and four route tables replacing six peering connections",
      visuals: [],
      content: `## The Setup

Four VPCs in **ap-south-1**, in **one account**:

| VPC | CIDR | Contains |
|---|---|---|
| **VPC-A** | 192.168.10.0/24 | server-A |
| **VPC-B** | 192.168.20.0/24 | server-B |
| **VPC-C** | 192.168.30.0/24 | server-C |
| **VPC-D** | 192.168.40.0/24 | server-D |

Each has **one private subnet** with **one Amazon Linux instance**. **No internet gateway, no public IPs, no route table entries.** Security groups allow all traffic so nothing else can be blamed for a failed test.

> Connecting these four with peering would need **six** connections — 4 × 3 ÷ 2. This lab uses **one** transit gateway instead.

---

## Reaching a Private Instance

With no public IPs, use an **EC2 Instance Connect Endpoint** in VPC-A: **VPC → Endpoints → Create endpoint** → type **EC2 Instance Connect Endpoint** → VPC-A → default security group → its subnet.

Connect to **server-A** through it, then **ping server-B, C and D** by private IP. **All fail** — the VPCs are isolated, exactly as expected.

---

## Step 1 — Create the Transit Gateway

**VPC → Transit gateways → Create transit gateway:**

- **Name tag** it
- Leave the defaults — the advanced options concern multi-account and multi-region setups
- Create, and wait for **Available**

---

## Step 2 — Attach All Four VPCs

**Transit gateway attachments → Create transit gateway attachment**, once per VPC:

- **Name** it clearly, e.g. **A-tgw**
- **Transit gateway:** the one you just created
- **Attachment type:** **VPC** — the same screen also offers **VPN**, **Peering connection** and **Direct Connect**
- **VPC:** VPC-A, and select its subnet

Repeat for **B**, **C** and **D**.

> **Name these carefully.** Four near-identical attachments are easy to confuse, and clear names prevent mistakes in the next step.

Wait until all four attachments show **Available**.

---

## Step 3 — Routes in Every VPC

Ping again and it **still fails**. The attachments exist, but nothing tells each VPC where to send traffic.

> Each VPC's route table knows only its **own** local range. All four need routes to the other three.

**In VPC-A's route table → Edit routes → Add route**, three times:

| Destination | Target |
|---|---|
| 192.168.20.0/24 | Transit gateway |
| 192.168.30.0/24 | Transit gateway |
| 192.168.40.0/24 | Transit gateway |

**Then repeat in B, C and D**, each adding routes to the other three ranges. Twelve routes in total.

> Compare with peering, where you would maintain **six connections plus their routes**. Here every route points at the **same** hub.

---

## Step 4 — Verify

From **server-A**, ping **server-B**, **server-C** and **server-D** — all reply.

From **server-B**, ping C and D — those work too. **Every VPC reaches every other VPC through the single hub.**

---

## What This Scales To

Adding a fifth VPC means **one attachment and routes** — not four new peering connections. Adding on-premises means **one VPN or Direct Connect attachment** to the same hub, rather than a gateway per VPC.

> Multi-account or multi-region setups need a transit gateway in each and **peering between them**, which is more involved — but the single-region, single-account pattern here is what the exam expects.
`,
    },
    {
      id: "vpc-endpoints",
      title: "VPC – Endpoints",
      shortDesc: "Reaching AWS services over the private network, and gateway vs interface types",
      visuals: ["VPCEndpointExplorer"],
      content: `## The Problem

Your EC2 instance needs to talk to **DynamoDB**. Both are AWS services — but by default that traffic **goes over the internet**.

It leaves your instance, crosses the **internet gateway**, travels the public internet, and arrives at DynamoDB. You are sending data between two AWS services **without using the AWS private network**.

> Nobody wants that. Why route traffic across the public internet when **both endpoints are inside AWS**?

---

## What a VPC Endpoint Does

> **A VPC endpoint lets you privately connect your VPC to supported AWS services.**

With one in place, your instance reaches DynamoDB **directly over the AWS private network**. No internet involved.

**What you no longer need:**

- ❌ Internet gateway
- ❌ NAT gateway
- ❌ VPN connection
- ❌ Direct Connect

**What you gain:** secure connectivity, **high speed and low latency**, and traffic that never touches the public internet.

Endpoints are **virtual**, **horizontally scalable**, **redundant** and **highly available** — AWS handles all of that.

---

## Powered by PrivateLink

**AWS PrivateLink** is the underlying technology. It **eliminates exposure of your data on the public internet** by keeping it on the Amazon private network.

PrivateLink provides connectivity between:

1. **Your VPC and other AWS services**
2. **Your VPC and on-premises**
3. **One VPC and another** — including **cross-account** access

> The third case is what **endpoint services** are for, covered in the next topic.

---

## ⚠️ Two Endpoint Types — Learn Which Is Which

This is the exam-relevant distinction.

**Gateway endpoints** are supported by **exactly two services**:

| Service | Endpoint type |
|---|---|
| **Amazon S3** | **Gateway** |
| **DynamoDB** | **Gateway** |
| **Everything else** | **Interface** |

**Gateway endpoint** — creating one **requires a route table entry**. The endpoint is added to your VPC's route table **as a target**. Select S3 or DynamoDB in the console and it will ask you which route table to use.

**Interface endpoint** — an **elastic network interface** with a **private IP from your subnet's range**, serving as the entry point for traffic to that service. **No route table entry needed**; it connects directly.

| | Gateway endpoint | Interface endpoint |
|---|---|---|
| **Supported by** | **S3 and DynamoDB only** | All other supported services |
| **Route table entry** | ✅ **Required** | ❌ Not needed |
| **Implementation** | Route target | **ENI with a private IP** |
| **Powered by** | — | **PrivateLink** |

---

## A Third Type

There is also a **Gateway Load Balancer endpoint**.

> That one only makes sense once you know what a Gateway Load Balancer is — covered in the load balancing section, where AWS's four load balancer types are explained.
`,
    },
    {
      id: "vpc-endpoint-services",
      title: "VPC – Endpoint Services & PrivateLink",
      shortDesc: "Exposing one service to another VPC privately — and why this is not peering",
      visuals: [],
      content: `## The Scenario

Two companies, each with their own VPC in the **same region**. One is a **service provider**; the other is a **client** consuming that service.

**By default**, the client reaches the provider's application over the **internet** — using the **public IP** of the provider's EC2 instance, through an **internet gateway**. That means latency, and arguably a security risk.

> Yet **both** parties are on AWS, in the **same region**. There is no reason for that traffic to leave the AWS network.

**VPC endpoint services** — PrivateLink — let the client reach the provider's instance over **private IPs** on the AWS private network.

---

## ⚠️ Why This Is Not Peering

The setup *looks* like peering: two VPCs, one reaching the other. It is a different thing.

| | VPC Peering | Endpoint Services (PrivateLink) |
|---|---|---|
| **Exposes** | **Everything** — all resources in both VPCs | **One specific service**, on one port |
| **Direction** | **Two-way** — each side reaches the other | Client reaches the **provider's service** |
| **Protocols** | TCP, UDP, **any** traffic | ⚠️ **TCP only** |
| **Requires** | Nothing extra | A **Network Load Balancer** or **Gateway Load Balancer** |

> **Peering gives full mutual access** between two VPCs — every instance on both sides. **Endpoint services expose exactly one service**, for example an application on port 80, and nothing else.
>
> **Choosing between them:** need everything reachable both ways → **peering**. Need to publish one specific service → **endpoint services**.

---

## The Definition

> **A VPC endpoint service is like a doorway that allows you to connect to certain online services in a secure, private way** — over the Amazon private network instead of the public internet.

Note the word **certain**. This is deliberately narrow access, not general connectivity.

---

## Configuration Shape

1. The provider puts a **Network Load Balancer** (or Gateway Load Balancer) in front of the service.
2. The provider creates the **endpoint service**.
3. The client creates a **VPC endpoint** pointing at it.

---

## Three Constraints

- **Region-bound.** An endpoint service is available **only in the region where you create it**. To cross regions you must combine it with **VPC peering**, which is considerably more involved.
- **TCP only.** Peering carries any protocol; this carries **TCP**. In effect you are doing controlled port forwarding.
- **A load balancer is required** — NLB or GWLB. It is not optional.
`,
    },
    {
      id: "vpc-dhcp-option-sets",
      title: "VPC – DHCP Option Sets",
      shortDesc: "Pushing your own DNS, domain name and NTP settings to every instance in a VPC",
      visuals: ["DHCPOptionSetDemo"],
      content: `## First, What DHCP Is

**DHCP — Dynamic Host Configuration Protocol.**

Your EC2 instance gets a private IP without you assigning one. That is DHCP.

> **The everyday version:** you arrive at a hotel, ask for the Wi-Fi password, connect, and you are online. Nobody hands you an IP address to type in. The router runs **DHCP** and assigns one automatically — no conflicts, no manual management.

**Your VPC works the same way.** Create an instance and it receives a private IP from its subnet's range automatically.

**Verify it inside a Windows instance:** run **ncpa.cpl**, open the adapter's **Properties → IPv4 → Properties**, and you will see **Obtain an IP address automatically** and **Obtain DNS server address automatically**.

Or from the command line, **ipconfig /all** shows the IP, **DNS server** and **default gateway** all assigned automatically.

---

## What a DHCP Option Set Changes

You could set any of these manually on each instance — but that does not scale. A **DHCP option set** pushes them to **every instance** instead.

> ⚠️ **You cannot change the IP address.** DHCP always assigns that, and it is not yours to control. Everything *else* is configurable.

**The default option set** gives you a domain name like **ap-south-1.compute.internal** and **AmazonProvidedDNS**.

**Create your own** — **VPC → DHCP option sets → Create** — and you can set:

| Option | Use for |
|---|---|
| **Domain name** | e.g. **cloudfox.local** — your own internal domain |
| **Domain name servers** | Your **own DNS**, e.g. an Active Directory server |
| **NTP servers** | Your own time server |
| **NetBIOS name servers** | Legacy Windows |
| **NetBIOS node type** | Legacy Windows |

> **Why the DNS option matters most:** if you run your **own Active Directory server**, every instance needs to use it for DNS. Setting that per-instance is exactly the manual work this avoids.
>
> **NTP** matters because consistent time across machines is assumed by many systems, and it is normally synchronised automatically against a time server.

---

## ⚠️ It Applies at the VPC Level

> **A DHCP option set attaches to a VPC — not to a subnet.**

So it applies to **every subnet** and **every instance** inside that VPC. There is no per-subnet granularity.

**To apply it:** **VPC → Actions → Edit VPC settings** → select your DHCP option set → **Save**.

---

## The Change Is Not Immediate

Check the instance and nothing has changed. Instances pick up new settings **when their lease renews**.

Force it with **ipconfig /renew**.

> The IP stays the same — as expected, since DHCP option sets do not control it. But the **domain name** now reads **cloudfox.local** and **ipconfig /all** shows your DNS server.

**To revert:** **Edit VPC settings** → select the **default** option set → save → **delete** your custom set → run **ipconfig /renew** again, and the original **ap-south-1.compute.internal** returns.
`,
    },
    {
      id: "vpc-flow-logs",
      title: "VPC – Flow Logs",
      shortDesc: "Capturing accepted and rejected traffic for troubleshooting and security",
      visuals: ["VPCFlowLogExplorer"],
      content: `## What They Capture

**VPC flow logs record the traffic going into and out of your VPC.**

That covers a lot:

- Traffic between **two EC2 instances** inside the VPC
- Traffic **into** instances from outside
- Traffic **leaving** the VPC
- Traffic through a **load balancer**, a **VPN gateway** or a **Transit Gateway**

**Two reasons you want it:**

- **Troubleshooting** — see what actually reached your instance
- **Security** — see what was attempted and refused

---

## Creating One

**VPC → select your VPC → Actions → Create flow log:**

- **Name** it
- **Filter** — **Accept**, **Reject**, or **All**
- **Maximum aggregation interval** — **10 minutes** or 1 minute
- **Destination** — **S3**, **CloudWatch Logs**, or **Kinesis**
- **Log record format** — **AWS default format**, or select only the fields you want
- **Log file format** and **partitioning**

---

## Choosing the Filter

| Filter | Captures | Useful for |
|---|---|---|
| **Accept** | Successful traffic | Confirming what is getting through |
| **Reject** | Refused traffic | **Security** — who is probing your servers, and what a security group blocked |
| **All** | Both | Complete picture, most volume |

> **Reject** is easy to overlook and genuinely valuable — it shows attempted access that your security groups turned away. Which to use is a matter of company policy.

---

## S3 vs CloudWatch Logs

Sending to **S3** requires the bucket's **ARN** — find it under the bucket's **Properties**. (Every AWS resource has an **ARN**, an Amazon Resource Name.)

> ⚠️ **Delivery is not instant, and the two destinations differ:**
>
> - **S3** — **10 to 15 minutes** before logs appear
> - **CloudWatch Logs** — about **5 minutes**
>
> Doing this as a lab, wait 10–15 minutes before concluding it is broken.

**CloudWatch Logs is generally the better destination** — it gives you better readability, analytics tooling and easy querying.

---

## Reading a Log File

In S3 the logs land under an **AWS logs** folder in a dated folder structure, split across **several files**.

Each record contains the **account ID**, the **interface ID** (your instance's NIC), **source and destination IP**, and **port** — so you can see a request arriving on port 80 and the reverse direction alongside it.

> **The practical difficulty:** enable this on a busy VPC and you get **many** files with a great deal of traffic in them. Finding a specific IP means searching through them.
>
> Two things help: **restrict the security group source** while testing so the logs stay small, and **use CloudWatch Logs** rather than S3 so you can query rather than grep.

**Partitioning** controls this too — 24-hour partitions by default, or hourly if you generate a lot.

---

## Clean Up

Select the flow log → **Actions → Delete**. Empty and delete the S3 bucket separately if you created one for the test.
`,
    },
    {
      id: "vpc-prefix-lists",
      title: "VPC – Customer-Managed Prefix Lists",
      shortDesc: "One reusable list of CIDR ranges instead of the same rules copied everywhere",
      visuals: ["ManagedPrefixListDemo"],
      content: `## The Problem

Three servers with three different roles, each needing a different port open:

| Server | Port | Security group |
|---|---|---|
| **Web** | 80 (HTTP) | SG-1 |
| **Database** | 3306 (MySQL) | SG-2 |
| **Storage** | 2049 (NFS) | SG-3 |

Different ports means **three separate security groups**. Fine so far.

**But the source CIDR ranges are identical for all three.** Say six ranges — your offices and data centres.

So you add **six rules to SG-1**, **six to SG-2**, and **six to SG-3**. Eighteen rules, the same six addresses three times over.

**Then a new data centre opens.** You must now edit **all three** security groups to add one range. With ten security groups, that is ten edits — for one change.

---

## The Fix

Create a **prefix list** containing those CIDR ranges **once**, then reference it from each security group.

Adding a new range means editing **the prefix list only**. Every security group referencing it picks up the change **automatically**.

---

## What a Prefix List Is

> **A prefix is a set of one or more CIDR blocks.** You create a prefix list from addresses you use frequently and reference it wherever it is needed.

**Where you can reference one:**

- **Security groups**
- **Route tables**
- **Transit Gateway route tables**
- **Network Firewall**
- **Managed Grafana network access**

---

## Creating One

**VPC → Managed prefix lists → Create prefix list:**

- **Name** it
- **Max entries** — the ceiling, e.g. 50
- **Address family** — **IPv4** or **IPv6**
- **Entries** — your CIDR ranges, each with an optional description

> ⚠️ **A prefix list holds one address family only.** Choose IPv4 and you cannot add IPv6 entries to it, or vice versa.
>
> ⚠️ **A prefix list applies only in the region where you create it.**

---

## Using It

**Security group → Edit inbound rules.** Instead of six separate source entries, add **one** rule: port 80, source **Prefix list**, then select yours.

Six rules become one.

Check the prefix list's **Associations** tab and it lists every resource referencing it.

---

## Versioning

Modify a prefix list — say add **192.168.200.0/24** — and AWS keeps **versions**: version 1 without it, version 2 with it. You can see the history of what changed.

---

## Sharing

**Customer-managed prefix lists can be shared with other AWS accounts.** Define your address ranges once and let other accounts in your organisation reference the same list.

> The next topic covers the other kind: **AWS-managed** prefix lists, which you cannot edit at all — and which exist for a completely different purpose.
`,
    },
    {
      id: "vpc-aws-managed-prefix-lists",
      title: "VPC – AWS-Managed Prefix Lists",
      shortDesc: "AWS service IP ranges you reference without knowing them — and the weight trap",
      visuals: ["PrefixListWeight"],
      content: `## Two Kinds of Prefix List

| | Customer-managed | AWS-managed |
|---|---|---|
| **Contains** | **Your** CIDR ranges | **AWS service** IP ranges |
| **Create** | ✅ | ❌ |
| **Modify** | ✅ | ❌ |
| **Delete** | ✅ | ❌ |
| **Share** | ✅ | ❌ |

Open **Managed prefix lists** and the entries already listed are **AWS-managed** — the IP ranges for services like **DynamoDB**, **Route 53**, **S3** and **CloudFront**, in both IPv4 and IPv6 variants.

> Select one and every action is **greyed out**. You can reference them; you cannot touch them.

---

## The Use Case

You want your EC2 instance to send traffic **only to Amazon CloudFront edge locations**.

**You do not know CloudFront's IP addresses** — and there are many of them, and they change.

**Without an AWS-managed prefix list** you would have to find every CloudFront edge IP range and add a rule for each — then maintain that list forever.

**With one**, you add a single outbound rule with the destination set to the **CloudFront origin-facing** prefix list. Done.

> **And when AWS changes those IPs, the list updates automatically.** That is the real value: you are referencing a moving target by name.

The same applies to sending traffic to **S3** — reference the S3 prefix list rather than hunting for endpoint addresses.

---

## ⚠️ Use Them Outbound

> **AWS-managed prefix lists make sense in OUTBOUND rules.** "Send traffic **to** S3", "send traffic **to** CloudFront."
>
> Using them **inbound** does not make sense. Your **own** customer-managed lists work in either direction.

You can reference them in **security group outbound rules** and in **route tables** — for example, routing VPC traffic to S3 without knowing the endpoint's addresses.

---

## The Weight Trap

Each prefix list has a **weight** — **the number of CIDR ranges inside it**.

That weight is what counts against your rule limits, **not one**.

| Prefix list | Weight |
|---|---|
| **CloudFront origin-facing** | **55** |
| **S3** | 1 |
| **DynamoDB** | 1 |

**Against a security group's 60-rule limit:** referencing the CloudFront list consumes **55**, leaving **five** rules for everything else.

**Against a route table's 50-route limit:** a weight of **55 does not fit at all**. Adding it **errors**.

> Both limits are **soft** — contact AWS support to raise them. But you have to know the interaction exists, because the failure is confusing otherwise: you added *one* rule and hit a limit.
`,
    },
    {
      id: "dns-fundamentals",
      title: "DNS – How Name Resolution Works",
      shortDesc: "FQDN anatomy and the full resolution path from your browser to an authoritative server",
      visuals: ["DNSResolutionFlow", "FQDNAnatomy"],
      content: `## Why DNS Exists

Internet connectivity runs on **TCP/IP**, so opening a website means connecting to an **IP address**. DNS is what lets you type a **name** instead.

> Imagine the web without it: no facebook.com, just 11.1.1.5. No google.com, just 13.5.19.80. **Names are easy to remember; numbers are not.**

> **DNS is the phonebook of the internet.** You dial a name; the phone connects to a number.

**Why "Route 53"?** DNS uses **TCP/UDP port 53**. Hence the name.

---

## Anatomy of an FQDN

Take **learn.etc.cloudfox.in**. The whole thing is an **FQDN — fully qualified domain name**.

Reading it **right to left**, from the most general to the most specific:

| Part | Name | Example |
|---|---|---|
| **in** | **TLD** — top level domain | .com, .in, .org, .co.uk, .live |
| **cloudfox** | Domain | your registered name |
| **etc** | **Subdomain** | |
| **learn** | **DNS label** | the leftmost piece |

**Two limits worth knowing:**

- An **FQDN** may be at most **255 characters**.
- A **DNS label** may be at most **63 characters**.

> **You cannot invent a TLD.** They are a fixed set — .com, .in, .org and the rest.

---

## The Resolution Path

You type **www.facebook.com** into a browser. Here is what actually happens.

**1 · Your device asks the DNS resolver.**

How does it know where that is? **Your ISP hosts it**, and when you got internet access your ISP supplied an IP address, subnet mask, default gateway **and the DNS resolver's address**. It is already configured in your home router or your computer.

**2 · The resolver asks a DNS root server.**

Assume nothing is cached. The resolver forwards the query to a **root server**. There are **13 DNS root servers**, operated by the internet authority and distributed worldwide.

**3 · The root server points at the TLD servers.**

Root servers do not know Facebook's IP. But they can read the TLD — **.com** — and forward the query to the **.com TLD servers**. A **.live** domain would go to the .live TLD servers instead.

**4 · The TLD server returns the authoritative server.**

The .com servers do **not** return facebook.com's IP either. They return the IP of **Facebook's authoritative DNS server**.

**5 · The authoritative server returns the actual IP.**

The query goes there, gets the real answer, and your computer connects.

---

## Caching Makes It Fast

Once resolved, the answer is **cached at the resolver**. The next query for facebook.com is answered from cache, and **steps 2, 3 and 4 are skipped entirely**.

---

## The Part That Matters for You

Running your own website, which of those five components must you configure?

| Component | Yours to manage? |
|---|---|
| DNS resolver | ❌ Your ISP's |
| 13 root servers | ❌ The internet authority's |
| TLD servers | ❌ The registry's |
| **Authoritative DNS server** | ✅ **Yours** |

> **Facebook owns none of that infrastructure. It manages one thing: its authoritative DNS server.**

So do you. And **Route 53 is the AWS service that acts as your authoritative DNS server** — which is exactly why an EC2-hosted site is reachable by IP but not by name until Route 53 is configured.
`,
    },
    {
      id: "route53-hosted-zones",
      title: "Route 53 – Domains & Hosted Zones",
      shortDesc: "Registering a domain, delegating an external one, and creating your first record",
      visuals: [],
      content: `## Step 1 — You Need a Registered Domain

> **Domain names are not free**, and there is no way around that. Expect roughly ₹100 to a few thousand per year depending on the TLD.

**A genuinely useful tip:** buy a domain **with your own name**. Then build a page hosting your **CV** on it, and give employers the link. It costs a couple of hundred rupees and it is far more impressive than a attachment.

**Where to buy:**

- **Route 53 itself** — **Registered domains → Register domain**. It quotes per TLD (e.g. **.in** around $15/year, **.org** around $12).
- **Third-party registrars** — GoDaddy, Namecheap and others, often cheaper.

---

## Step 2 — Create a Hosted Zone

**Route 53 → Hosted zones → Create hosted zone.** There are **two types**:

| Type | For | Requires a registered domain? |
|---|---|---|
| **Public hosted zone** | Name resolution **over the internet** | ✅ Yes |
| **Private hosted zone** | Name resolution **inside your VPC** | ❌ No |

> If you would rather not spend money, follow the public-zone topics for understanding and do the hands-on work when **private hosted zones** come up — those need no domain.

Enter **exactly the domain name you registered** and create the zone.

---

## Step 3 — If the Domain Is Registered Elsewhere

Buying from GoDaddy but wanting Route 53 to do the resolving? You have **two options**.

**Option A — transfer the domain to Route 53.**

> ⚠️ **The domain must be at least one month old.** A freshly-registered domain **cannot be transferred** — registrars block it.

**Option B — delegate the nameservers (works immediately).**

Keep the domain at GoDaddy but point it at Route 53:

1. In **Route 53**, open your hosted zone and find the **NS record**. It lists **four Route 53 nameservers**.
2. In **GoDaddy**: **Manage domain → DNS → Nameservers → Change nameservers → "I'll use my own nameservers"**.
3. **Paste all four** Route 53 nameservers and save.

> From then on, GoDaddy's job is done — every query it receives is **forwarded to Route 53**.

**"Why not just use GoDaddy's DNS?"** You can — adding an A record there works fine. But you lose **Route 53's routing policies**, which are the real reason to use it. Those are covered across the following topics.

---

## Step 4 — Create Your First Record

Inside the hosted zone, **Create record**:

- **Record name:** e.g. **learn** → giving **learn.cloudfox.in**
- **Record type:** **A**
- **Value:** your EC2 instance's **public IP**
- **Routing policy:** **Simple routing** for now

Create it.

---

## Step 5 — Wait, Then Verify

> ⚠️ **The record does not work instantly.** Propagation typically takes **10 to 15 minutes** while it synchronises out.

**Three ways to check:**

- **Test record** in the Route 53 console — click **Get response**. Seeing your IP means the record is correct, regardless of what your browser does.
- **dnschecker.org** — enter your URL and see resolution results **from countries worldwide**.
- **ipconfig /flushdns** on Windows — clears your local DNS cache. **Essential** when a name recently changed IP and your machine is serving a stale answer.

Once resolved, the site opens by **name** as well as by IP.

> One thing still missing: the site is **HTTP**, not HTTPS. Making it HTTPS needs **AWS Certificate Manager (ACM)**, covered in the security section.
`,
    },
    {
      id: "route53-record-types",
      title: "Route 53 – Record Types",
      shortDesc: "A, AAAA, CNAME, MX, TXT, PTR, SRV, SPF — what each one is actually for",
      visuals: ["DNSRecordTypes"],
      content: `## A — The One You Will Use Most

> **Give it a name, it returns an IPv4 address.**

This is the main record type. Running a web server means creating an **A record**: name **learn.cloudfox.in**, value your EC2 instance's IP.

---

## AAAA — Same Job, IPv6

**Identical purpose, different address family.**

| Record | Returns |
|---|---|
| **A** | An **IPv4** address |
| **AAAA** | An **IPv6** address |

Site on IPv4 → **A record**. Site on IPv6 → **AAAA record**.

---

## CNAME — A Second Name for the Same Thing

You want the site reachable at **both** **learn.cloudfox.in** and **test.cloudfox.in**.

You *could* create a second **A record** — but then **changing the IP means updating both**.

Instead create a **CNAME** (canonical name) record: name **test**, value **learn.cloudfox.in**.

> Now opening **test.cloudfox.in** resolves to **learn.cloudfox.in**, which resolves to the IP. **Change the A record's IP and the CNAME follows automatically**, because it points at a name rather than an address.

Think of it as a **nickname** for an existing record.

> There is also an **Alias** option, which is Route 53-specific and behaves differently. It comes up with **load balancers** and **S3 static website hosting**.

---

## MX — Mail Exchange

The **A record** handles your **web** server. **MX handles your mail server.**

When someone emails **info@cloudfox.in**, their mail system looks up your domain's **MX record** to find where to deliver it.

> ⚠️ **No mail server and no MX record means nobody can email you at that domain.** You must first stand up a mail server — in Microsoft 365, Google Workspace, or on AWS — then publish it as an MX record.

---

## TXT — Free-Form Text

Arbitrary information attached to the domain — ownership details, for example.

**Its most common real use is verification.** A third-party tool tells you to add a specific TXT record; once it can read that record, it accepts that you control the domain.

---

## PTR — The Reverse of A

> **Give it an IP, it returns a name.**

| Record | Direction |
|---|---|
| **A** | **Name → IP** |
| **PTR** | **IP → Name** |

---

## SRV — Service Records

**Application-specific.** Some applications depend on DNS to locate their own services, and need an **SRV** record to do it.

**The classic example: Microsoft Active Directory.** AD depends heavily on DNS, and client computers **find the domain controller through SRV records**.

> You do not need to memorise how to construct these. Any application requiring one will document exactly what to create. What matters is knowing **Route 53 can create SRV records** when asked.

---

## SPF — Sender Policy Framework

This one has a story attached.

> Someone receives an email claiming to be from a large employer, offering a job for an up-front fee. It looks legitimate — **it came from that company's domain**.
>
> Attackers can put **your domain name** in the From field of mail sent from **their** server. That is phishing, and twenty years ago it was rampant.

**SPF fixes it by publishing which IPs are allowed to send mail for your domain.** Any message from anywhere else fails the check.

> ⚠️ SPF records in Route 53 get awkward for **large organisations sending from many mail servers** — which is why AWS no longer recommends the dedicated SPF record type for complex setups.

---

## The Rest

**CAA**, **NAPTR** and others exist for security and specialist telephony uses. **CAA** returns when making a site **HTTPS**, alongside ACM.

---

## Summary

| Record | Purpose |
|---|---|
| **A** | Name → **IPv4** — the main one |
| **AAAA** | Name → **IPv6** |
| **CNAME** | Name → **another name** (nickname) |
| **MX** | Where to deliver **email** |
| **TXT** | Free-form text · **domain verification** |
| **PTR** | **IP → name** (reverse of A) |
| **SRV** | Application service location (e.g. **Active Directory**) |
| **SPF** | Which IPs may **send mail** for the domain |

> In practice you will mostly use **A**, occasionally **CNAME**, and **Alias** once load balancers appear. Next: **routing policies**, which are the real reason to choose Route 53.
`,
    },
    {
      id: "route53-simple-weighted",
      title: "Route 53 – Simple & Weighted Routing",
      shortDesc: "One answer per query vs splitting traffic by percentage across servers",
      visuals: ["RoutingPolicyOverview", "WeightedRoutingCalculator"],
      content: `## The Scenario

Two identical web servers in two availability zones — **ap-south-1a** and **ap-south-1b** — for high availability. Both serve the same site. The question is how Route 53 should hand out their IPs.

---

## Simple Routing — One Answer, No Exceptions

Create an **A record** with **simple routing** and one IP, and every query gets **that IP, every time**.

> ⚠️ **You cannot add a second record with the same name under simple routing.** Try it and Route 53 rejects it outright. Simple routing is built for exactly **one** resource behind a name — no distribution, no failover.

That is a real limitation once you have two servers you want to actually use.

---

## Weighted Routing — Splitting Traffic by Percentage

Create **two records with the same name**, both **type A**, both set to **weighted routing** — one pointing at each server, each given a **weight**.

> **Weight runs from 0 to 255.** A weight of 0 means that record is never returned. Anything from 1 to 255 is fair game.

Give both servers weight **50** and traffic splits **50/50** — verified by repeatedly testing the record and watching the returned IP alternate.

---

## The Weight Formula

Weights are **not percentages** — they are relative numbers, and the split is computed from them:

> **Each server's share = (its weight ÷ total weight) × 100**

**Worked example — three servers:**

| Server | Weight |
|---|---|
| A | 120 |
| B | 50 |
| C | 30 |

**Total weight = 120 + 50 + 30 = 200**

- Server A: 120 ÷ 200 × 100 = **60%**
- Server B: 50 ÷ 200 × 100 = **25%**
- Server C: 30 ÷ 200 × 100 = **15%**

That adds to 100%, as it always will — the formula is self-normalising, so the individual weights never need to sum to any particular number.

> Try it yourself: weights **150, 50, 100** → total **300** → **50%, 16.7%, 33.3%**.

---

## Verifying It

Beyond the console's **Test record** button, use **nslookup** from a terminal against your domain and run it several times — the returned IP should alternate roughly according to the weights.

> ⚠️ **Your own machine may appear to return the same IP repeatedly.** That is usually local **DNS caching**, not a broken policy. Clear it with **ipconfig /flushdns** on Windows and query again.

---

## The Gap Still Open

Weighted routing splits traffic — but it has **no idea whether either server is actually up**. Stop one of them and Route 53 keeps sending it 50% of the traffic anyway, because nothing has told it otherwise.

> That is exactly what **health checks** fix, covered next.
`,
    },
    {
      id: "route53-health-checks",
      title: "Route 53 – Health Checks",
      shortDesc: "Teaching DNS to stop routing traffic to a server that is actually down",
      visuals: ["HealthCheckDemo"],
      content: `## The Problem Weighted Routing Doesn't Solve

Two servers, weighted 50/50, both healthy — traffic splits evenly and everything works.

**Now take one down.** Block port 80 on its security group and the site stops responding on that server.

**Route 53 does not notice.** Query the record and it still hands back that server's IP roughly half the time — because nothing has ever told Route 53 the server is unreachable. The result: **half your users cannot load the site**, and DNS is cheerfully sending them to the broken half.

---

## Health Checks Close the Gap

**Route 53 → Health checks → Create health check:**

- **Name** it
- **What to monitor:** an **endpoint** — protocol **HTTP**, the server's IP, **port 80**
- Optional: **notifications** if it becomes unhealthy

Create **one health check per server**. Status starts as **Unknown** and settles to **Healthy** within a couple of minutes once Route 53's probes get a response.

---

## Attaching a Health Check to a Record

Each weighted record needs its own: **edit the record → Health check → select the matching one → Save.**

Two servers means two health checks, each tied to its own record.

---

## Watching It Work

With both healthy, testing the record returns both IPs as before.

**Block port 80 on server one again.** Its health check flips to **Unhealthy** within a couple of minutes. From that point, **testing the record returns only the healthy server's IP** — repeatedly, with zero exceptions. Route 53 has stopped offering the broken server entirely.

**Restore port 80** and the health check returns to **Healthy**; the record resumes splitting traffic across both.

---

## The Rule

> **Health checks make a routing policy failure-aware.** Without one, Route 53 answers from a static list regardless of whether anything on it actually works. With one, unhealthy targets are silently removed from rotation until they recover.

This applies well beyond weighted routing — **failover routing**, covered later in this section, depends on health checks entirely to know when to switch from primary to secondary.
`,
    },
    {
      id: "route53-geolocation",
      title: "Route 53 – Geolocation Routing",
      shortDesc: "Sending users to a specific server based on which country they are querying from",
      visuals: [],
      content: `## The Scenario

A multinational company runs:

- A web server in the **United States**
- A web server in **India**
- A web server in **Singapore**, covering everywhere else

**The intent:** US visitors reach the US server, Indian visitors reach the Indian server, and everyone else — China, Vietnam, the Philippines — reaches Singapore. All under **one DNS name**.

> **Geolocation routing** does exactly this, based on the **geographic location of the querying user**.

---

## Setting It Up

Create **multiple A records with the same name**, each set to **geolocation routing**, each specifying a location:

| Record | Location | IP |
|---|---|---|
| R1 | **India** | India server |
| R2 | **United States** | US server |
| R3 | **Default** | Singapore server |

> **Location can be a country or a continent.** **Default** is the catch-all — every country you have not explicitly listed resolves here. Without a default record, users outside your named locations get **no answer at all**.

---

## Verifying From Multiple Countries

Testing this yourself is awkward — you only have one location. **dnschecker.org** solves it: paste your domain and see the resolved IP **from many countries simultaneously**.

Query from the US and you see the US server's IP. Query from South Africa or France and you get the **default** — Singapore. Query from India and you get the Indian server.

---

## Geolocation vs Latency — Do Not Confuse Them

This distinction is worth being precise about, because the next topic covers latency routing and the two are easy to mix up.

> **Geolocation routes by where the USER is.** It has no concept of speed — it is a fixed mapping you define, driven entirely by policy (legal requirements, content licensing, business rules), never by measurement.

A US user always gets the US server under geolocation, **even if some other server would actually respond faster** for them. That is deliberate — geolocation is for cases where the routing decision is not about performance at all.
`,
    },
    {
      id: "route53-latency",
      title: "Route 53 – Latency-Based Routing",
      shortDesc: "Automatically sending each user to whichever region answers fastest for them",
      visuals: [],
      content: `## The Scenario

AWS has two regions in India: **Mumbai** and **Hyderabad**. You run identical web servers in both.

A user querying from **Ahmednagar** should logically reach the **Mumbai** server; a user in **Nanded** should reach **Hyderabad**. You do not want to maintain that mapping by hand.

> **Latency-based routing finds the region with the lowest latency for each querying user, automatically**, and returns that region's IP.

---

## It Is About Latency, Not Distance

> ⚠️ **Kilometres are usually a good proxy for latency — but they are not what the policy measures.**

If the network path to the geographically closer region happens to have unusually high latency — congestion, a bad link, routing weirdness — a **farther** region with a genuinely faster path can be returned instead. AWS measures **actual latency between AWS regions and networks**, not straight-line distance.

---

## Setting It Up

Create two A records, same name, both **latency routing**, each tagged with the **AWS Region** the server lives in — for example **ap-south-1 (Mumbai)** and one representing **Hyderabad**.

Test with **nslookup** from different locations and each returns the IP of whichever region has the lower measured latency **from that querying location**.

---

## Latency vs Geolocation, Restated

| | Geolocation | Latency |
|---|---|---|
| **Decides by** | The user's **country/continent** — a fixed mapping you define | **Measured latency** between the user and each region |
| **Can change without you editing anything?** | ❌ No — always the same country → same server | ✅ Yes — network conditions can shift which region wins |
| **Use it for** | Legal/content restrictions, business rules | **Pure performance** — fastest response for each user |

> If your only goal is speed, **latency routing** is the right tool. If you have a policy reason a specific country must land on a specific server regardless of speed, that is **geolocation**.
`,
    },
    {
      id: "route53-geoproximity",
      title: "Route 53 – Geoproximity Routing",
      shortDesc: "Routing by where your RESOURCES are, and shifting the boundary between them with bias",
      visuals: ["GeoproximityBias"],
      content: `## An Upgrade on Latency Routing

Same starting point as latency routing — servers in **Mumbai** and **Hyderabad** — but a different goal.

> With latency routing, AWS decides based on **measured network performance**. With **geoproximity routing**, **you** decide, based on **geographic location — and you can deliberately shift the boundary** between regions using a value called **bias**.

**Why you might want that:** business reasons that have nothing to do with network speed. Maybe Kolhapur should be served by Hyderabad even though Mumbai is closer, because of how your infrastructure or contracts are organised.

---

## Traffic Policies, Not Ordinary Records

Geoproximity is not available as a plain record type. It requires a **traffic policy**.

**Route 53 → Traffic policies → Create traffic policy:**

- **Name** it
- **Start type:** IP address (A record)
- Add a **Geoproximity rule**
- **Location:** by **latitude/longitude**, or the easier route — an **AWS Region** or Local Zone
- Map each location to its resource IP — e.g. **Mumbai → server A**, **Hyderabad → server B**

---

## The Map and Bias

The policy editor shows a **live map** of which areas resolve to which resource under the current settings. By default, geographic proximity decides the boundary — Kolhapur, being closer to Mumbai, falls on the Mumbai side.

**Bias shifts that boundary.**

> **Bias is a value you set per location.** Increase a location's bias and its coverage area **grows**. Decrease it and the area **shrinks**. It works either direction — shrink Mumbai's reach, or grow Hyderabad's — to move the same boundary.

Adjust it and watch the map update live: reduce Mumbai's bias and Kolhapur (along with Solapur, Nanded, Akola, Nagpur) flips to Hyderabad. Set bias back to zero and the map returns to the geographic default.

---

## ⚠️ It Is Not Free

> **Geoproximity requires a traffic policy, and Route 53 traffic policies cost roughly $50/month.**

That is a real cost most of the other policies do not carry — factor it in before reaching for this one over plain latency or geolocation routing, both of which are free.

---

## When to Actually Use It

Reach for geoproximity specifically when you need **geography-based routing with a business reason to bias the boundary away from pure distance** — not simply "route by location" (that's geolocation) and not simply "route by speed" (that's latency).
`,
    },
    {
      id: "route53-failover",
      title: "Route 53 – Failover Routing",
      shortDesc: "The one policy built for active-passive: a primary and a standby, not two active servers",
      visuals: ["FailoverDemo"],
      content: `## The Odd One Out

Every routing policy covered so far is **active-active** — multiple servers all genuinely serving traffic, whether split by weight, by latency, or by location.

> **Failover routing is different. It is the only Route 53 policy built for active-passive.**

One server is **primary** (active), the other is **secondary** (passive/standby). Under normal conditions, **100% of traffic goes to the primary**. The secondary sits idle, ready to take over.

---

## Why It Needs a Health Check

> **Failover cannot function without a health check on the primary.** There is no other way for Route 53 to know the primary has gone down.

**Route 53 → Health checks → Create health check** for the primary server — HTTP, its IP, port 80. Wait for it to report **Healthy**.

---

## Creating the Failover Records

Two A records, same name:

- **Record 1:** primary server's IP → **Failover routing → Primary** → attach the health check
- **Record 2:** secondary server's IP → **Failover routing → Secondary**

---

## ⚠️ Set TTL Low

**TTL (time to live)** controls how long a resolver caches the answer before asking again.

> With the default TTL, a failure can take several minutes to become visible to users — their machines and intermediate resolvers keep answering from cache long after the primary has actually failed.

Set TTL to something short — **60 seconds** in the lecture's example — on both records, so a failover is visible quickly instead of only after a long cache expiry.

---

## Watching It Fail Over

With both servers up, querying the record consistently returns the **primary's** IP — failover ignores the secondary entirely while the primary is healthy.

**Block port 80 on the primary.** Its health check moves to **Unhealthy** within a couple of minutes. From then on, **the record returns the secondary's IP** — traffic moves over with zero manual action.

**Restore port 80 on the primary** and, once its health check reports healthy again, the record **reverts to the primary** automatically.

---

## The Exam Point

> **Every other Route 53 routing policy assumes active-active — multiple servers, all in rotation.** Failover is the exception: **exactly one policy that supports an active-passive pair**, and it is entirely dependent on a health check to know when to switch.
`,
    },
    {
      id: "route53-multivalue-ip-based",
      title: "Route 53 – Multivalue Answer & IP-Based Routing",
      shortDesc: "Returning several IPs at once for round-robin, and routing by the querier's own address",
      visuals: ["PolicyComparisonMatrix"],
      content: `## Multivalue Answer — More Than One IP Per Query

Every policy so far returns **one IP per query**. **Multivalue answer** is different: it can return **up to eight IP addresses in a single response**.

**Create multiple A records with the same name**, each set to **multivalue answer**, each with a different IP — for example three servers at **1.1.1.1**, **2.2.2.2** and **3.3.3.3**.

Query it and you get **all three back**, in a rotating order — one client's first query might list 1.1.1.1 first, the next client's might lead with 2.2.2.2. The client's resolver picks which one to actually connect to, typically the first in the list.

> **Health checks are optional here but genuinely useful** — attach one per record and an unhealthy server is dropped from the returned set entirely, rather than being handed out and failing on connection.

**When to use it:** simple round-robin load distribution across several equivalent servers, without the percentage control of weighted routing or the single-answer behaviour of simple routing.

---

## IP-Based Routing — Deciding by the Querier's Address

The newest of the eight policies. **The IP that comes back depends on the source IP of whoever is resolving the query** — not their country, not measured latency, their literal **source address or CIDR block**.

**Real use case:** you know a particular ISP or corporate network — identified by its IP range — gets consistently better performance from one specific server. Pin that range to that server explicitly.

---

## Setting It Up

**1 · Define CIDR collections.** **Route 53 → CIDR collections → Create CIDR collection:**

- **Name** it
- Add **locations**, each a name plus a **CIDR block** — e.g. **Gujarat → 119.0.0.0/8**, **Maharashtra → 200.0.0.0/8**

**2 · Create the records.** Same name, **IP-based routing**, each tied to a **CIDR collection location**:

| Record | CIDR location | IP |
|---|---|---|
| R1 | Gujarat (119.0.0.0/8) | Server 1 |
| R2 | Maharashtra (200.0.0.0/8) | Server 2 |
| R3 | **Default** | Server 3 |

> As with geolocation, a **default** record catches every source IP not covered by a defined location.

---

## Verifying It

Query from a machine whose public IP falls in **119.0.0.0/8** and the record consistently returns **Server 1's** IP. Query from outside every defined range and you land on the **default**.

---

## Both, Side by Side

| | Multivalue Answer | IP-Based |
|---|---|---|
| **Decides by** | Nothing — round-robin across all healthy records | The **source IP/CIDR** of the resolver |
| **Answers per query** | **Up to 8** | 1 |
| **Typical use** | Simple load distribution | **ISP or network-specific** routing, session affinity |

---

## The Full Picture — All Eight Policies

| Policy | Mode | Decides by |
|---|---|---|
| **Simple** | Single answer | Nothing — one fixed record |
| **Weighted** | Active-active | A percentage split you assign |
| **Latency** | Active-active | Measured network latency |
| **Geolocation** | Active-active | The **user's** country/continent |
| **Geoproximity** | Active-active | Geography **plus** a bias you control ($50/mo) |
| **Failover** | ⚠️ **Active-passive** | A health check on the primary |
| **Multivalue answer** | Active-active | Round-robin across up to 8 healthy IPs |
| **IP-based** | Active-active | The **resolver's** source IP/CIDR |

> **The one exam fact that ties all eight together:** every policy here is **active-active** except **failover**, which is the only one built for a primary/standby pair. That single distinction comes up constantly.
`,
    },
    {
      id: "cloudfront",
      title: "CloudFront",
      shortDesc: "Global CDN for low-latency content delivery",
      visuals: ["CDNGlobe3D", "DistributionConfig", "OriginAccessControl", "CacheHitMiss", "OriginGroupFailover", "GeoRestrictions", "CacheInvalidation"],
      content: `## CloudFront — AWS Content Delivery Network (CDN)

**CloudFront** is AWS's **CDN** — it delivers content (web pages, videos, APIs) with **low latency** and **high speed** by **caching** copies at 400+ **edge locations** worldwide. Netflix, Prime, Hotstar — all rely on CDNs.

> The problem it solves: one origin (say Mumbai) serving the whole world means distant users get high latency over slow **international bandwidth**, and the origin can be overwhelmed. CloudFront caches near users, so they fetch from a nearby edge — and the origin gets far fewer requests.

---

## How It Works

1. You point CloudFront at an **origin** (S3, S3 website, EC2, ELB, API Gateway…)
2. CloudFront caches the content at **edge locations** globally
3. A user's request goes to the **nearest edge** — if cached (a **hit**), it's served instantly; if not (a **miss**), CloudFront fetches from the origin, caches it, and serves it
4. You get one **\`*.cloudfront.net\`** URL (HTTPS free); add your own domain with an ACM cert

There are two caching layers: **Regional Edge Caches** and **Edge Locations**. **Origin Shield** adds a third centralized layer to further protect the origin (chargeable).

---

## Distribution Options

### Origin Settings
- **Origin domain** — where to fetch from (EC2 isn't auto-listed; paste its **public DNS**)
- **Origin path** — optional subfolder used as the root
- **Custom headers** — pass auth/API keys, versioning info to the origin
- **Origin Shield** — extra centralized cache layer (chargeable)

### Default Cache Behavior
- **Path pattern** — \`*\` (all) or \`images/*\` (one folder)
- **Compress objects** — auto-gzip (≈70% smaller); always on
- **Viewer protocol policy** — HTTP & HTTPS · **Redirect HTTP→HTTPS** · HTTPS only
- **Allowed HTTP methods** — GET/HEAD (static) · +OPTIONS (CORS) · ALL (dynamic CRUD)
- **Restrict viewer access** — paid/private content via **Signed URLs** (one file) or **Signed Cookies** (many files), using **trusted key groups**
- **Cache key & origin requests** — **Cache Policy** (what makes a unique cache entry) + **Origin Request Policy** (what's forwarded on a miss)
- **Response headers policy** — add/remove/modify headers: CORS, **security headers** (HSTS, CSP…), custom, server-timing

### Settings
- **Price class** — which edge locations to use (cost vs reach)
- **Alternate domain (CNAME)** + **Custom SSL cert** (ACM, must be in **us-east-1**)
- **Supported HTTP versions** — enable **HTTP/2** and **HTTP/3 (QUIC)**; CloudFront picks the best the viewer supports
- **Default root object** — \`index.html\` so the root URL resolves without typing the filename

### Function Associations
Run custom code at **4 trigger points**: **Viewer request**, **Origin request**, **Origin response**, **Viewer response**.
- **CloudFront Functions** — lightweight, JS only, sub-ms, cheap (header/URL tweaks)
- **Lambda@Edge** — heavier, multiple languages, more powerful (auth, dynamic content); created in **us-east-1**

---

## Origin Access (S3 origins)

Lock an S3 origin so content is served **only via CloudFront** (HTTPS), never the raw S3 URL:

| Mode | Security |
|------|----------|
| **Public** | Bucket exposed — accessible directly. Not best practice. |
| **OAC** (Origin Access Control) ⭐ | Bucket fully **private**; only CloudFront can read it (via bucket policy). Modern approach. |
| **OAI** (Origin Access Identity) | Legacy version of OAC — keep only for existing setups. |

> With OAC, also set a **Default Root Object** so the bucket-origin root URL works.

---

## Caching: Hit, Miss & Invalidation

- **Cache hit** — the edge has the requested variant (identified by the **cache key**) → served instantly
- **Cache miss** — not cached → CloudFront fetches from the **origin** (per the Origin Request Policy), caches it, then serves. An edge never asks another edge.
- **TTL** controls how long content stays cached
- **Invalidation** — after updating the origin, edges serve the **old** version until TTL expires. Create an invalidation (e.g. \`/*\`) to clear edge caches **immediately**. (First ~1,000/month free; or version filenames instead.)

---

## High Availability & Restrictions

### Origin Groups (Failover)
Pair a **primary** and **secondary** origin. CloudFront uses the primary; on a failover status code (500/502/503/504) it switches to the secondary, and back when the primary recovers. Use cases: **EC2 → S3** failover, or **region-to-region** with load balancers. (Remember to point the **cache behavior** at the origin group.)

### Geographic Restrictions
Allow or block viewers by **country** — an **allow list** (only these) or a **block list** (everyone except these). Blocked users get a **403**.

### Custom Error Pages
Map origin errors (e.g. 504) to a friendly custom page served from S3 — so users see "we'll be back soon" instead of a raw gateway error.
`,
    },
    {
      id: "global-accelerator",
      title: "Global Accelerator",
      shortDesc: "Anycast IPs + AWS backbone for fast multi-region routing",
      visuals: ["GlobalAcceleratorFlow", "GAComparison", "GAStructure", "GAFailover"],
      content: `## AWS Global Accelerator

**Global Accelerator** improves the **availability and performance** of global applications by giving you **2 static anycast IP addresses** and routing user traffic over the **AWS global network** instead of the public internet. It directs each user to the **nearest healthy endpoint** across regions.

> It's the "big brother" of the load balancer — a load balancer works **within** a region; Global Accelerator load-balances **across** regions.

---

## How It Works

1. Users connect to the accelerator's **2 static IPs** (they never change)
2. Traffic enters AWS at the **nearest edge location**
3. It travels the fast, private **AWS backbone** (low latency, low jitter) — not the congested public internet
4. It's delivered to the **nearest healthy region endpoint** (ALB / NLB / EC2 / Elastic IP)

It operates at the **network layer (TCP/UDP)** and does **not cache** content (that's CloudFront's job).

---

## Key Features

- **2 static anycast IPs** — fixed entry points (great for IP allow-lists, firewalls)
- **AWS global network** — optimized routing, lower latency & jitter
- **Fast regional failover** — reroutes in seconds (no DNS TTL caching delay)
- **Continuous health checks** — unhealthy endpoints are removed automatically
- **Traffic dials & weights** — control how much traffic each region/endpoint receives

---

## Global Accelerator vs CloudFront vs Route 53

| | 🚀 Global Accelerator | 🌍 CloudFront | 🧭 Route 53 |
|--|----------------------|---------------|-------------|
| Type | Network accelerator | CDN (caching) | DNS |
| Layer | TCP/UDP (L4) | HTTP/HTTPS (L7) | DNS |
| Caches? | ❌ | ✅ | ❌ |
| Static IPs? | ✅ (2 anycast) | ❌ | ❌ |
| Failover | Fast (seconds) | Origin failover | Slower (DNS TTL) |
| Best for | Non-HTTP, multi-region, static IPs, gaming/IoT/VoIP | Cacheable web content, video | Geo/latency/weighted DNS routing |

> Rule of thumb: cacheable web content → **CloudFront**; DNS-level routing → **Route 53**; TCP/UDP acceleration + static IPs + instant multi-region failover → **Global Accelerator**.

---

## Anatomy of an Accelerator

It nests:
- **Accelerator** — the top resource (gets the 2 static IPs + a DNS name)
- **Listener** — a port + protocol (e.g. TCP :80)
- **Endpoint Group** — **one per region**, with a **traffic dial** (0–100%) capping that region's share
- **Endpoints** — the actual targets inside a group (ALB / NLB / EC2 / EIP), with optional **weights**

By default each group is dialed to 100% (route to the nearest region); lower a dial to shift traffic away (maintenance, gradual cutover).

---

## Super Lab — Multi-Region HA

A complete real-world build:
1. **Two regions** (e.g. India + USA), each with a **VPC** (public + private subnets, IGW, NAT, route tables)
2. **Web servers** across **2 AZs** per region in **private subnets** (in-region high availability)
3. An **Application Load Balancer** per region in the public subnets
4. One **Global Accelerator** with an **endpoint group per region**, each pointing at that region's ALB

**Result:**
- Users hit their **nearest region** (Mumbai/Singapore → India; Virginia/Brazil → USA) — low latency, localized experience
- If a whole **region fails**, Global Accelerator reroutes **everyone** to the surviving region — **no downtime**, same static IPs
- Make sure each ALB's **health check** passes, or the endpoint group shows unhealthy
`,
    },
    {
      id: "lb-intro",
      title: "Load Balancer – Why It Exists",
      shortDesc: "Getting EC2 instances out of the public subnet entirely, plus built-in health checks",
      visuals: ["LoadBalancerBasics"],
      content: `## The Alternative You Already Know

You have two web servers across two availability zones, each with a public IP, for high availability. **Route 53 weighted routing** can already split traffic between them.

So why load balancers at all?

---

## Problem 1 — Your Instances Sit Exposed

To be reachable, both instances need a **public IP** in a **public subnet**. That means both are directly exposed to the internet.

> **A load balancer removes this requirement entirely.** Your EC2 instances move into a **private subnet**, with **no public IP** at all. The load balancer — which does sit in the public subnet — is the only thing reachable from outside, and it forwards traffic inward.

Users reach the load balancer's URL; the load balancer sends the request on to whichever backend instance should handle it, over private IPs.

---

## Problem 2 — Route 53 Has No Idea What's Actually Running

Weighted routing splits traffic by a fixed percentage. It does **not** know whether either server is up — pair it with a health check and it can stop offering a dead IP, but that is bolted on separately.

> **A load balancer has health checking built in as a core feature, not an add-on.** It continuously probes each backend, and the moment one stops responding correctly, **it is pulled out of rotation automatically** — no separate service to configure.

When the instance recovers, the load balancer detects that too and adds it back.

---

## What This Buys You

| | Public IP per instance | Health-aware | Understands HTTP/HTTPS |
|---|---|---|---|
| **Route 53 alone** | ✅ Required | Only with a separate health check | ❌ No |
| **Load balancer** | ❌ Not needed | ✅ Built in | ✅ Yes |

> Route 53 can still load-balance in a pinch. But for a **proper** load-balancing setup — with instances safely in a private subnet and traffic distribution that understands what's actually running — a **load balancer is the better tool**.

---

## What's Still to Cover

- **Four load balancer types** exist, each suited to different traffic
- Load balancers themselves need **high availability** — spanning multiple availability zones, exactly like the instances behind them
- How to **distribute traffic across multiple groups** of instances, not just one

> All of that starts with the vocabulary in the next topic.
`,
    },
    {
      id: "lb-terminology",
      title: "Load Balancer – Terminology",
      shortDesc: "Scheme, listener, target group, and the HTTPS-offload advantage over Route 53",
      visuals: ["LBTerminology"],
      content: `## Where It Lives

**Load balancers are part of EC2** — find them under **EC2 → Load Balancers → Create load balancer**. All **four types** are offered here: Application, Network, Gateway, and the legacy Classic.

---

## Scheme — Internet-Facing or Internal

- **Internet-facing** — reachable from the public internet. This is what fronts a public website.
- **Internal** — reachable **only from inside your VPC**. Use this when several backend services must be load-balanced but nothing external should ever reach them directly.

Most of what follows in this course is **internet-facing**.

---

## IP Address Type

- **IPv4**
- **Dual-stack** — IPv4 **and** IPv6 together, not IPv6 alone.

---

## The Load Balancer's Own Security Group

The load balancer sits in a **public subnet** and needs its **own security group** — separate from the one protecting your instances. Allow the port your users will actually connect on (typically **TCP 80**).

---

## Listener — What the Load Balancer Is Listening For

> **A listener defines a protocol and port the load balancer watches.** Traffic matching a listener is what activates the load balancer's forwarding logic.

An Application Load Balancer listens on **application-layer protocols** — **HTTP** (port 80) or **HTTPS** (port 443).

---

## ⚠️ HTTPS Offload — One of the Biggest Advantages

> **Route 53 has no concept of HTTPS.** It resolves names to IPs; encryption is not its concern.
>
> **A load balancer does understand HTTPS**, and it can **terminate the TLS/SSL connection itself**. Your EC2 instances need **no certificate configuration at all** — the load balancer absorbs that entire responsibility.

This course starts with an HTTP listener for simplicity; HTTPS with a certificate comes later.

---

## Target Group — Where the Traffic Goes

Configuring a listener, you next create a **target group**: what the matched traffic actually gets forwarded **to**.

A target group can point at:

- **Instances**
- **IP addresses**
- **A Lambda function**
- **Another Application Load Balancer**

**Its own port matters too, and it is independent of the listener's port.** A listener on **80** can forward to a target group on **80** — or, if you configure it, to a **different** port entirely on the instance side.

---

## ⚠️ Health Checks Default to HTTP — Exam Fact

> **The default health check protocol for a target group is HTTP.** This is asked directly in the exam.

Configure the health check path and thresholds when you create the target group, or adjust them afterwards.

---

## Summary

| Term | Meaning |
|---|---|
| **Scheme** | Internet-facing vs internal |
| **Listener** | Protocol + port the load balancer watches for incoming traffic |
| **Target group** | Where matched traffic is forwarded — instances, IPs, Lambda, or another ALB |
| **Health check** | Automatic monitoring of targets — **HTTP by default** |
| **HTTPS offload** | The load balancer terminates TLS so instances don't have to |

> Next: building the VPC these load balancers actually live in.
`,
    },
    {
      id: "lb-vpc-design-lab",
      title: "Lab – VPC Design for a Load Balancer",
      shortDesc: "Four subnets across two AZs, an internet gateway, and a NAT gateway — the load balancer's home",
      visuals: [],
      content: `## Why Rebuild the VPC Here

Setting up a load balancer properly means putting it on solid VPC foundations first: **two public subnets** (for the load balancer, across two AZs for its own high availability) and **two private subnets** (for the backend instances).

> This is the same **two-tier VPC pattern** from the VPC section, purpose-built for a load balancer sitting in front of private instances. If any of this feels unfamiliar, the VPC section covers every piece in depth — this lab is the pattern applied.

---

## The Plan

| Subnet | AZ | CIDR |
|---|---|---|
| **public-subnet-1a** | ap-south-1a | 192.168.0.0/26 |
| **public-subnet-1b** | ap-south-1b | 192.168.0.64/26 |
| **private-subnet-1a** | ap-south-1a | 192.168.0.128/26 |
| **private-subnet-1b** | ap-south-1b | 192.168.0.192/26 |

---

## Step 1 — VPC and Subnets

**Delete the default VPC** to avoid confusion (only possible if it holds no resources). Then:

**Create VPC** → name it, CIDR **192.168.0.0/24**.

**Create all four subnets** in one pass via **Add new subnet**, using the table above.

---

## Step 2 — Internet Gateway

**Create internet gateway** → name it → **Actions → Attach to VPC**.

---

## Step 3 — Public Route Table

The **main route table** already exists and holds all four subnets **implicitly**. Rather than route everything through it:

**Create route table** named e.g. **rt-public** → **Subnet associations → Edit** → select **both public subnets**. This automatically removes them from the main table's association.

**rt-public → Routes → Edit routes → Add route:** destination **0.0.0.0/0** → target the **internet gateway**.

The two public subnets are now genuinely public. The two private subnets, still on the main table, are not.

---

## Step 4 — NAT Gateway for the Private Subnets

Private-subnet instances still need **outbound** internet — for OS updates and package installs.

**Create NAT gateway** → place it in **one public subnet** → allocate an **Elastic IP**.

Then, on the **main route table**: **Add route** → destination **0.0.0.0/0** → target the **NAT gateway**.

---

## What You Now Have

- **Two public subnets**, routed to the **internet gateway** — where the load balancer will live
- **Two private subnets**, routed to the **NAT gateway** — where the EC2 instances will live, outbound-only, unreachable directly from outside

> The VPC is ready. Next: security groups and the two EC2 instances the load balancer will actually distribute traffic across.
`,
    },
    {
      id: "lb-sg-ec2-lab",
      title: "Lab – Security Groups & Backend Instances",
      shortDesc: "Two security groups — one for the load balancer, one sourced from it — plus two private instances",
      visuals: [],
      content: `## The Two-Layer Security Design

Users reach the **load balancer** on port 80. The load balancer reaches the **EC2 instances**, also on port 80. Each hop gets its **own** security group.

> **The instances' security group should allow traffic ONLY from the load balancer's security group** — not from anywhere. That is what actually prevents someone bypassing the load balancer and hitting an instance directly, even though the instance itself has no public IP to be hit on anyway. It is the same defence-in-depth habit as the EFS lab earlier in the course.

---

## Step 1 — ALB-SG

**Create security group** named **alb-SG**:

- **Inbound:** **HTTP (80)** from **anywhere (0.0.0.0/0)** — the public needs to reach it
- **Outbound:** default, all traffic allowed

---

## Step 2 — web-SG

**Create security group** named **web-SG**:

- **Inbound:** **HTTP (80)**, source = **alb-SG** — not an IP range, the **security group itself**
- **Inbound:** **SSH (22)** — optional, for management via a bastion or endpoint later
- **Outbound:** default, all traffic allowed

> Referencing **alb-SG** as the source means **only traffic that has actually passed through the load balancer** can reach an instance on port 80.

---

## Step 3 — Two Backend Instances

**web-server-1:** Amazon Linux, t2.micro, **private-subnet-1a**, **no public IP**, security group **web-SG**.

Under **Advanced details → User data**, paste a script that installs and starts a web server, distinguishing the instance name so you can tell them apart when testing (e.g. printing "Web Server 1" on the page).

**web-server-2:** identical, but **private-subnet-1b**, and the user data script prints "Web Server 2" instead.

> No bastion host or connect endpoint is needed for this step — **user data** configures each instance automatically at launch, exactly as covered in the EC2 section.

---

## What's In Place

- **alb-SG** — open to the internet on port 80, ready to attach to the load balancer itself
- **web-SG** — open only to alb-SG, attached to both instances
- **web-server-1** and **web-server-2** — private, unreachable directly, each serving a distinguishable page

> The VPC, the security groups and the instances are all ready. The load balancer itself — tying all of this together — is the next topic.
`,
    },
    {
      id: "lb-create-alb-lab",
      title: "Lab – Creating the Application Load Balancer",
      shortDesc: "Wiring the ALB to a target group of the two private instances, then a Route 53 alias",
      visuals: [],
      content: `## Picking Up From the Last Two Labs

The VPC, both security groups, and both private web servers already exist. This is the third and final piece: the load balancer itself.

---

## Step 1 — Create the Load Balancer

**EC2 → Load Balancers → Create load balancer → Application Load Balancer:**

- **Name** it
- **Scheme:** Internet-facing
- **IP address type:** IPv4
- **VPC:** yours
- **Mappings:** select **both public subnets** — ap-south-1a and ap-south-1b. This is exactly why the VPC lab built two of them: the load balancer needs its own multi-AZ redundancy, same as any other resource.
- **Security group:** **alb-SG** from the earlier lab

---

## Step 2 — Listener and Target Group

Configuring the **HTTP : 80** listener, you are prompted to create a **target group** — where matched traffic actually goes.

**Create target group:**

- **Target type:** Instances
- **Name** it, **protocol HTTP, port 80**
- **VPC**, IPv4
- **Health check:** leave the HTTP default

**Register targets:** select **both** web servers.

> ⚠️ **Click "Include as pending below" before moving on.** It is easy to select both instances and go straight to Next without registering them — the target group then exists but is empty.

Finish creating the target group, return to the load balancer wizard, refresh, select it, and **Create load balancer**.

---

## Step 3 — Wait, Then Verify

Provisioning takes a few minutes. Two things to check:

- The load balancer's own state reaches **Active**
- Both targets in the target group show **healthy**

Copy the load balancer's **DNS name** into a browser. The page from **web-server-1** or **web-server-2** loads — whichever the load balancer picked — confirmed by whatever distinguishing text the user data script printed.

**Refresh repeatedly** and the response alternates between the two — the load balancer distributing traffic across both healthy targets.

---

## Proving the Health Check Works

**Stop one instance.** Refresh the browser and every request now comes from the **other** server — the load balancer detected the failure and pulled it from rotation. Depending on timing you may see a **Bad Gateway** briefly during the transition.

**Start the instance again.** Once its health check passes, it rejoins rotation and responses start alternating again.

---

## Step 4 — A Real Domain Name, via Route 53

The load balancer's own DNS name is functional but not what you want to hand out. **Route 53 → your hosted zone → Create record:**

- **Record name:** whatever subdomain you want, e.g. **learn**
- **Alias:** ✅ enabled
- **Route traffic to:** **Application Load Balancer**, your region, then select your load balancer from the list

Once created, the same site opens under your own domain — still load-balanced across both instances underneath.

> One thing still missing: this is **HTTP**, not HTTPS. Making it HTTPS needs a certificate from **AWS Certificate Manager**, covered in the security section.
`,
    },
    {
      id: "lb-routing-policies",
      title: "ALB – Path-Based vs Host-Based Routing",
      shortDesc: "One load balancer serving many targets by URL path or by hostname, instead of many load balancers",
      visuals: ["ALBRouting"],
      content: `## The Problem With the Old Generation

**Classic Load Balancer** (the previous generation) can only forward everything it receives to **one** set of targets. Need **images.example.com** and **orders.example.com** to go to different backends? You need **two separate classic load balancers**.

> **An Application Load Balancer needs only one.** Its **listener rules** route incoming requests to different target groups based on the request itself — no second load balancer required.

There are **two ways** to make that routing decision.

---

## Path-Based Routing

> **Routes by the URL path** — the part after the domain.

**example.com/images** → target group A. **example.com/orders** → target group B. Same domain, same load balancer, different paths, different backends.

**Real-world example:** Pearson VUE's exam site uses **home.pearsonvue.com/cisco** and **home.pearsonvue.com/client/aws** — one domain, different paths routing to different content.

---

## Host-Based Routing

> **Routes by the hostname** — the subdomain or domain itself.

**images.example.com** → target group A. **orders.example.com** → target group B. Different hostnames, same load balancer, different backends.

**Real-world example:** Google uses **drive.google.com** and **mail.google.com** — genuinely different hostnames, routed by the load balancer to entirely different services.

---

## The Memory Trick

> **A slash (/) means path-based. A dot before the domain (like order.example.com) means host-based.**

**order.example.com** — "order" is a **hostname** → host-based. **example.com/orders** — "/orders" is a **path** → path-based.

---

## Six Differences

| | Path-Based | Host-Based |
|---|---|---|
| **DNS setup** | ✅ Simple — one alias record covers every path | ⚠️ A **record per hostname/subdomain** |
| **Use case** | Multiple **services under one domain** | Multiple **domains or subdomains** |
| **SSL/TLS** | One certificate covers every path | May need **multiple certificates** for different domains |
| **Flexibility** | Limited to a single domain | **More flexible** — spans multiple domains |
| **Complexity** | Simpler — fewer DNS records | **More complex** — multiple DNS entries and certificates |
| **Example** | cloudfox.in**/aws**, cloudfox.in**/azure** | **aws**.cloudfox.in, **azure**.cloudfox.in |

> **If everything lives under one domain, path-based routing is the simpler choice.** Reach for host-based when the services genuinely need to look like separate domains or subdomains.

Both are configured the same way: **one listener, multiple rules**, each rule matching a condition (path or host) and forwarding to its own target group. The next two topics build one of each.
`,
    },
    {
      id: "lb-path-based-routing-lab",
      title: "Lab – Path-Based Routing",
      shortDesc: "One ALB, three target groups, and listener rules matching /aws* and /azure*",
      visuals: [],
      content: `## The Goal

One load balancer, three destinations, routed by path:

| URL | Target |
|---|---|
| **cloudfox.in** | Server "CloudFox" (the default target) |
| **cloudfox.in/aws** | Server "AWS" |
| **cloudfox.in/azure** | Server "Azure" |

> This lab uses **one private subnet and one instance per target** rather than the fully redundant multi-AZ pattern — the point here is the routing, not repeating the VPC build.

---

## Step 1 — Security Groups

Same two-group pattern as before: **alb-SG** (HTTP 80 from anywhere) and **web-SG** (HTTP 80 sourced from **alb-SG only**).

---

## Step 2 — Three Instances, Three Different User Data Scripts

Launch **three separate instances** — one at a time, because each needs **different** user data:

- **CloudFox server:** installs httpd, places **index.html** at the web root (**/var/www/html/**) — this becomes the default target
- **AWS server:** installs httpd, but places index.html inside **/var/www/html/aws/** — a subdirectory matching the URL path
- **Azure server:** same idea, index.html inside **/var/www/html/azure/**

> ⚠️ **The subdirectory name must exactly match the path you will route on.** Get "aws" or "azure" wrong — wrong case, typo, missing folder — and that target will report unhealthy or simply 404, with no obvious error pointing at the cause.

---

## Step 3 — Three Target Groups

One per server: **Create target group → Instances**, HTTP : 80, default health check, register the matching instance.

> The health check still probes the **web root**, not the subpath. Since httpd is genuinely running and answering on port 80 for all three, all three targets report healthy regardless of which subdirectory holds their content.

---

## Step 4 — The Load Balancer With a Default Rule

Create the ALB as before — internet-facing, both public subnets, **alb-SG** — with its default listener rule forwarding to the **CloudFox** target group. This becomes the catch-all: any path that matches nothing else.

---

## Step 5 — Add Path-Based Rules

**Load balancer → Listener → Add rule:**

**Rule for AWS:**

- **Condition:** Path → **/aws***
- **Action:** forward to the **AWS** target group
- **Priority:** e.g. 100

**Rule for Azure:**

- **Condition:** Path → **/azure***
- **Action:** forward to the **Azure** target group
- **Priority:** e.g. 200

> ⚠️ **Don't forget the trailing asterisk.** **/aws*** matches /aws, /aws/anything, /aws/deeper/path — all of it. **/aws** alone matches only that exact path.
>
> **Priority determines evaluation order** when multiple rules could match. The **default rule always has the lowest priority** — it only fires when nothing more specific matched.

---

## Step 6 — Route 53 and Verification

**One alias A record** for the bare domain, pointing at the load balancer, is all the DNS you need — the whole benefit of path-based routing.

Open **cloudfox.in** → CloudFox page. **cloudfox.in/aws** → AWS page. **cloudfox.in/azure** → Azure page. One load balancer, one DNS record, three destinations.
`,
    },
    {
      id: "lb-host-based-routing-lab",
      title: "Lab – Host-Based Routing",
      shortDesc: "The same three destinations, routed by subdomain instead of path — and three DNS records instead of one",
      visuals: [],
      content: `## The Same Goal, Different Mechanism

| URL | Target |
|---|---|
| **cloudfox.in** | Server "CloudFox" |
| **aws.cloudfox.in** | Server "AWS" |
| **azure.cloudfox.in** | Server "Azure" |

Same three servers conceptually as the path-based lab — but **simpler on the instance side, more work in DNS**.

---

## Step 1 — Instances Are Actually Simpler Here

Each server's **index.html sits at the plain web root** — no subdirectory required, because the routing decision is made by **hostname**, not by anything inside the URL path.

> This is the mirror image of the path-based lab's biggest gotcha: there, the folder name had to match exactly. Here, **all three servers are configured identically** — install httpd, drop index.html at the root, done. The distinguishing text ("Welcome to AWS CloudFox" vs "Welcome to Azure CloudFox") is all that differs between the three scripts.

---

## Step 2 — Target Groups and Load Balancer

Identical to the path-based lab: **one target group per instance**, then an ALB with **alb-SG**, spanning both public subnets, default rule pointing at the CloudFox target group.

---

## Step 3 — Host-Based Listener Rules

**Load balancer → Listener → Add rule:**

**Rule for AWS:**

- **Condition:** **Host header** → **aws.cloudfox.in**
- **Action:** forward to the AWS target group
- **Priority:** 100

**Rule for Azure:**

- **Condition:** **Host header** → **azure.cloudfox.in**
- **Action:** forward to the Azure target group
- **Priority:** 200

---

## Step 4 — ⚠️ Now DNS Actually Matters

This is where host-based routing costs more than path-based.

> **Every hostname needs its own Route 53 record.** Path-based routing needed exactly one alias record for the bare domain. Host-based needs **one per subdomain** — all pointing at the **same load balancer**, but each its own DNS entry.

**Route 53 → Create record**, three times:

| Record name | Alias target |
|---|---|
| **cloudfox.in** (blank/root) | Your ALB |
| **aws.cloudfox.in** | Same ALB |
| **azure.cloudfox.in** | Same ALB |

All three are **alias records pointing at the identical load balancer** — the load balancer's own listener rules are what actually differentiate them once traffic arrives.

---

## Verifying It

**cloudfox.in** → CloudFox page. **aws.cloudfox.in** → AWS page. **azure.cloudfox.in** → Azure page.

Compare the DNS burden directly against the previous lab: path-based needed **one** record for three destinations; host-based needed **three** — one genuine cost of the extra flexibility host-based routing buys you (real, separate-looking subdomains, and the ability to point different hostnames at entirely different domains later if needed).
`,
    },
    {
      id: "lb-nlb-concepts",
      title: "Network Load Balancer – Concepts",
      shortDesc: "Layer 4, ultra-low latency, static IP support — and what it gives up versus an ALB",
      visuals: ["LBTypeComparison"],
      content: `## Why a Second Load Balancer Type Exists

The Application Load Balancer operates at **Layer 7** — it reads HTTP/HTTPS and routes on URL paths, hostnames, and cookies. That reading takes work.

> **The Network Load Balancer operates at Layer 4** — TCP, UDP, TLS. It never looks past the transport layer, which is exactly why it is capable of **millions of requests per second at ultra-low latency**. If you're running a gaming backend where every millisecond of latency matters and traffic scales into the millions, an NLB — not an ALB — is the right tool.

---

## Side-by-Side: ALB vs NLB

| | Application Load Balancer | Network Load Balancer |
|---|---|---|
| **OSI layer** | 7 (application) | 4 (transport) |
| **Supported protocols** | HTTP, HTTPS, gRPC | TCP, UDP, TLS |
| **Sticky sessions** | ✅ Supported | ✅ Supported |
| **Idle connection timeout** | ✅ Yes — waits briefly for reconnection | ❌ None — a dropped connection starts fresh |
| **Path/host-based routing** | ✅ Supported | ❌ Not supported (no Layer 7 visibility) |
| **WebSocket** | ✅ Supported | ✅ Supported |
| **Static IP** | ❌ Not available | ✅ Supported |

---

## ⚠️ Exam Facts Worth Memorizing

- **Sticky sessions work on both** — a common trick question assumes NLB can't do this. It can, via session cookies identifying which server a client used previously.
- **Idle timeout is an ALB-only concept.** An NLB has no equivalent — disconnect and reconnect, and it is treated as a brand-new session.
- **Path-based and host-based routing require Layer 7.** The NLB simply cannot see the HTTP request line or Host header, so neither is possible here — this is the trade-off for its raw speed.
- **Static IP is the NLB's signature advantage.** An ALB can never be given a fixed IP address; an NLB can be assigned an **Elastic IP** directly, one per AZ, giving it a stable address that never changes.

---

## What You're Building Next

The lab reuses the same VPC layout as the ALB labs — two public subnets for the load balancer, two private subnets for the backend instances — but this time creates a **Network Load Balancer** in front of two web servers, and shows exactly how its routing decision differs from an ALB's.
`,
    },
    {
      id: "lb-create-nlb-lab",
      title: "Lab – Creating a Network Load Balancer",
      shortDesc: "TCP listener, target group, and watching NLB routing behave differently from an ALB",
      visuals: [],
      content: `## Prerequisites

The same VPC used for the ALB labs: two public subnets (for the load balancer) and two private subnets (for the backend instances), across two AZs, with an internet gateway and NAT gateway already in place.

---

## Step 1 — Security Groups

**nlb-SG** (attached to the load balancer):

- **Inbound:** **TCP 80** from **anywhere (0.0.0.0/0)**

**web-SG** (attached to the instances):

- **Inbound:** **HTTP 80**, source = **nlb-SG** — not an IP range, the security group itself

> Same defence-in-depth pattern as the ALB lab: the web servers only ever accept traffic that has already passed through the load balancer.

---

## Step 2 — Two Backend Instances

Launch them **one at a time**, since each needs a different subnet:

**web-server-a1:** Amazon Linux, t2.micro, **private-subnet-1a**, no public IP, security group **web-SG**. User data script installs httpd and serves "Welcome to Web Server 1".

**web-server-a2:** identical, but **private-subnet-1b**, user data serves "Welcome to Web Server 2".

---

## Step 3 — Create the Network Load Balancer

**EC2 → Load Balancers → Create load balancer → Network Load Balancer.**

- **Scheme:** Internet-facing
- **IP address type:** IPv4
- **VPC:** the one built above
- **Mappings:** select **both public subnets**, one per AZ (mandatory — at least two AZs)

> ⚠️ **Here is the NLB's signature option, absent from the ALB flow:** for each AZ you can leave the IP **assigned by AWS** (dynamic) or attach your own **Elastic IP** for a fixed, static address. Allocate an Elastic IP first if you want this — it's exactly the static-IP capability the concepts topic called out as the NLB's standout feature.

- **Security group:** **nlb-SG**
- **Listener:** protocol **TCP**, port **80** (not HTTP — the NLB doesn't speak Layer 7)

---

## Step 4 — Target Group

**Create target group** → name **target-1** → protocol **TCP**, port **80** → register **both instances**, port **80** → **Include as pending below** → **Create target group**.

Attach **target-1** to the listener, then **Create load balancer**.

---

## Step 5 — Verify and Test

Wait for the load balancer state to reach **Active**, and the target group's targets to show **healthy**.

Copy the load balancer's **DNS name** into a browser.

> ⚠️ **The behavior here is the whole point of this lab.** Refresh the page repeatedly — unlike the ALB lab, you keep landing on the **same** web server every time.

---

## Why It Always Picks the Same Server

An ALB's routing decision has no fixed rule tying a client to a server. An NLB's does:

> **A Network Load Balancer routes by source IP hash**, not round-robin. Your browser's IP address doesn't change between refreshes, so the hash always resolves to the same target — it looks like load balancing has stopped working, but it hasn't.

To prove both servers are actually in rotation without changing your own IP: **stop web-server-a2** in the EC2 console. With its current target gone, the NLB now sends your (unchanged) source IP's traffic to **web-server-a1** instead — confirming both instances are live participants, just deterministically assigned by hash rather than rotated.

> Don't forget to delete the load balancer, target group, and instances when you're done experimenting.
`,
    },
    {
      id: "lb-cross-zone-lab",
      title: "Lab – Cross-Zone Load Balancing",
      shortDesc: "Why traffic split by node, not by instance, can leave some servers doing far more work",
      visuals: ["CrossZoneLB"],
      content: `## One Load Balancer, Multiple Nodes

Selecting multiple AZs when you create a load balancer doesn't create one object — it creates **one load balancer node per AZ** you selected. A 2-AZ load balancer is really two nodes, each fielding a share of incoming traffic.

> **Cross-zone load balancing decides whether a node can forward traffic to targets in a different AZ from its own.**

---

## Disabled (the NLB/GWLB Default)

Each node forwards **only** to targets in its own AZ — it cannot reach across.

**Worked example — 2 AZs, uneven instance counts:**

| AZ | Load balancer node's share | Instances in this AZ | Traffic per instance |
|---|---|---|---|
| **AZ1** | 50% | 2 | **25%** each |
| **AZ2** | 50% | 8 | **6.25%** each |

> The split is 50/50 **by node**, not by instance. An AZ with fewer instances gets hammered — each of AZ1's two instances absorbs **4x** the traffic of each instance in AZ2, even though every instance is theoretically identical.

---

## Enabled

Every node can forward to **any** target in **any** AZ. Traffic is now divided evenly across the **total instance count**, regardless of which AZ it landed in first.

**Same example, cross-zone enabled:** 10 total instances, evenly split → **10% each**, whether in AZ1 or AZ2.

> If your instances are uniform in size and capacity, enabling this is almost always the right call — it prevents the AZ-count mismatch from ever creating a hot spot.

---

## ⚠️ The Default Differs by Load Balancer Type — Exam Fact

| Load balancer type | Cross-zone default | Can you change it? |
|---|---|---|
| **Application Load Balancer** | **Always enabled** | ❌ No option to disable at the load-balancer level |
| **Network Load Balancer** | **Disabled** | ✅ Yes, toggle anytime after creation |
| **Gateway Load Balancer** | **Disabled** | ✅ Yes, toggle anytime after creation |

---

## Toggling It

On the NLB built in the previous lab: select it → **Actions → Edit load balancer attributes → Load balancer target selection policy** → **Enable cross-zone load balancing** (or disable it again).

> Changing this takes effect immediately — no need to recreate the load balancer, and it can be flipped back and forth freely while testing traffic distribution.
`,
    },
    {
      id: "elb",
      title: "ELB – Elastic Load Balancing",
      shortDesc: "Distribute traffic across targets",
      visuals: ["LBTypeComparison", "GatewayLBFlow"],
      content: `## ELB – Elastic Load Balancing

A **Load Balancer** distributes incoming traffic across multiple targets (EC2 instances), improving availability and letting your servers stay **private**.

> Prerequisite: VPC with public & private subnets, internet gateway, NAT gateway. See the VPC topics first.

---

## Why Use a Load Balancer?

Say you run two web servers in two AZs for high availability. You *could* balance them with Route 53, but a load balancer is better:

- **Spread traffic** across any number of instances
- Keep EC2 instances in **private subnets** with **no public IP** — the LB (in the public subnet) is the only public door
- Built-in **health checks** automatically remove unhealthy instances from rotation (and re-add them when they recover)
- **HTTPS offload** — terminate TLS at the LB so instances don't need certificates

---

## Terminology

| Term | Meaning |
|------|---------|
| **Listener** | Watches a protocol+port (HTTP:80 / HTTPS:443) for incoming requests |
| **Target Group** | The backend resources: EC2 instances, IPs, Lambda, or another ALB |
| **Health Check** | Probes targets; **default protocol is HTTP**. Unhealthy targets are dropped |
| **Internet-facing** | Public DNS name — reachable from the internet |
| **Internal** | Reachable only inside the VPC |

> Listener port and target port can differ (e.g. listen on 80, forward to 8080). HTTPS on the listener lets the LB handle encryption — something Route 53 cannot do.

---

## The 4 Load Balancer Types

| Type | Layer | Protocols | Best for |
|------|-------|-----------|----------|
| **Application LB (ALB)** | 7 | HTTP, HTTPS, gRPC | Web apps with smart path/host routing |
| **Network LB (NLB)** | 4 | TCP, UDP, TLS | Extreme performance, millions of req/s, ultra-low latency |
| **Gateway LB (GLB)** | 3 | IP packets | Inline virtual appliances (firewalls, IDS/IPS) |
| **Classic LB (CLB)** | 4 & 7 | HTTP, HTTPS, TCP | Legacy / previous generation — avoid |

---

## Application Load Balancer (Layer 7)

Operates on **HTTP/HTTPS**, so it can make smart routing decisions on the **URL**. The big win over Classic LB: **one** ALB can serve many targets via rules — no need for one LB per route.

### Path-based vs Host-based Routing

| | Path-based | Host-based |
|--|-----------|-----------|
| Example | \`cloudfox.in/aws\` | \`aws.cloudfox.in\` |
| Decides on | URL **path** (after the slash) | **Hostname** (subdomain) |
| DNS | Easy — one record | A record per host/subdomain |
| Certificates | One covers all paths | May need multiple |

> Memory hook: **slash = path**, **subdomain (dot) = host**. e.g. \`order.example.com\` is host-based; \`example.com/orders\` is path-based.

Routing is configured with **listener rules** (condition → target, with a priority). The **default rule** (lowest priority) catches anything unmatched.

---

## Network Load Balancer (Layer 4)

Operates on **TCP/UDP/TLS** — no understanding of URLs. In exchange you get **millions of requests/sec** and **ultra-low latency** — ideal for gaming servers and high-throughput systems.

### ALB vs NLB

| Feature | ALB (L7) | NLB (L4) |
|---------|----------|----------|
| Protocols | HTTP/HTTPS/gRPC | TCP/UDP/TLS |
| Path/Host routing | ✅ | ❌ |
| Sticky sessions | ✅ | ✅ |
| Idle connection timeout | ✅ | ❌ |
| WebSocket | ✅ | ✅ |
| **Static IP** | ❌ | ✅ (Elastic IP) |
| Routing decision | URL + cookies | Source-IP hash |

> **Exam favourites:** NLB supports a **static (Elastic) IP**; ALB does not. NLB routes by **source-IP hash**, so the same client tends to hit the same target.

---

## Cross-Zone Load Balancing

The LB places a **node in each AZ**, and incoming traffic splits **50/50** across nodes.

- **OFF:** a node serves only targets in **its own AZ**. If AZs have different target counts, load is **uneven** (e.g. AZ-A's 2 targets get 25% each while AZ-B's 8 targets get 6.25% each).
- **ON:** any node serves **any** target — perfectly **even** distribution.

**Defaults:**
- **ALB → always ON** (can't fully disable)
- **NLB & GLB → OFF by default** (enable later via *Edit attributes*)

---

## Gateway Load Balancer (Layer 3)

Routes **raw IP packets** through **virtual appliances** — third-party **firewalls / IDS / IPS** like Palo Alto, Fortinet, or Sophos (available as AWS Marketplace AMIs, often BYOL).

It has **two components**: the **Gateway Load Balancer** and a **GWLB Endpoint**.

**Traffic flow:**
1. User → **GWLB Endpoint**
2. Endpoint → **Gateway Load Balancer**
3. GWLB → **security appliance** (e.g. Palo Alto firewall) for inspection
4. Appliance approves → back to GWLB → endpoint
5. Clean traffic → **application server**

> Unlike ALB/NLB, a GWLB lets you insert firewalls **inline** to inspect all inbound and outbound VPC traffic — bringing existing on-prem security tools and licenses into AWS.
`,
    },
    {
      id: "elb-gwlb-classic",
      title: "ELB – Gateway LB & Classic (Part 2)",
      shortDesc: "VPC ingress routing, Gateway LB architecture, Classic LB",
      visuals: ["IngressRoutingDemo", "GWLBArchitecture", "ClassicLBComparison"],
      content: `## Load Balancer Part 2 — Gateway LB Deep Dive & Classic LB

Part 1 covered ALB, NLB, and the GLB concept. Part 2 goes deeper: **VPC ingress routing** (the foundation of GLB), the full **two-VPC Gateway Load Balancer architecture**, and the legacy **Classic Load Balancer**.

---

## VPC Ingress Routing

Normally, traffic flows straight from the **Internet Gateway** to your servers — you can't insert anything in between (you can use AWS-native firewalls, but not a third-party appliance).

Many companies want their existing **Palo Alto / Checkpoint / Cisco / Fortinet** firewalls in AWS too. **Ingress routing** makes this possible.

### How it works
- You add an **Internet Gateway route table** — a special route table **associated with the IGW** (not a subnet)
- It routes the **app subnet's CIDR** to the firewall appliance's **network interface (ENI)** instead of the server directly
- The firewall is **transparent**: the client uses the server's normal public IP; the appliance doesn't change the packet's source/destination — it just inspects it
- The reply returns the same path

### Critical setup detail
You must **disable the source/destination check** on the appliance, so it's allowed to forward traffic it didn't originate (it acts as a router/firewall).

### The single-appliance problem
If you route everything through **one** appliance and it goes down, **every** server becomes unreachable — the appliance is the only entrance. The fix: **multiple appliances across AZs**, load-balanced and auto-scaled by a **Gateway Load Balancer**.

---

## Gateway Load Balancer — Full Architecture

A GWLB is **not** like ALB/NLB (which balance app servers). It **load-balances the fleet of security appliances**, handles their **high availability**, and **auto-scales** them.

### Two components
1. **Gateway Load Balancer** — has **no URL or IP**
2. **GWLB Endpoint** — the "assistant"; the *only* way to communicate with the GWLB

### Best practice: two VPCs
| VPC | Contains |
|-----|----------|
| **Service Provider VPC** | The GWLB + the fleet of security appliances |
| **Service Consumer VPC** | A GWLB Endpoint, ingress route table, and the app servers |

**Why two VPCs?** One central security fleet can protect **many** consumer VPCs — you don't duplicate firewalls and a GWLB in every VPC. The two VPCs connect via a **PrivateLink endpoint service** (no peering needed).

### Traffic flow
1. User → Service Consumer VPC
2. **Ingress route table** → **GWLB Endpoint**
3. Endpoint → (PrivateLink) → **Gateway Load Balancer** in the provider VPC
4. GWLB load-balances to a **security appliance**
5. Appliance inspects (via the **Geneve** protocol, **UDP port 6081**) and approves
6. Traffic returns via GWLB → endpoint → **app server**; replies follow the reverse path

> **Geneve / UDP 6081:** before choosing any third-party appliance, confirm it supports **Geneve** — that's how the GWLB and appliances communicate. Health checks remove unhealthy appliances; if one dies, traffic flips to another automatically.

---

## Classic Load Balancer (Previous Generation)

The **Classic Load Balancer (CLB)** was built for the old **EC2-Classic** network — the flat, shared network that existed **before VPC**. AWS now marks CLB **previous generation** and steers everyone to **ALB / NLB**.

### EC2-Classic vs Amazon VPC

| Aspect | EC2-Classic | Amazon VPC |
|--------|-------------|------------|
| Network | Shared with other customers | Logically isolated |
| IP addressing | Public IP by default, internet-reachable | You choose (public/private subnets) |
| Security groups | Inbound only, fixed at launch | Inbound + outbound, editable anytime |
| Subnets | ❌ Not supported | ✅ Public & private |
| Control | Limited | NACLs, SGs, route tables |
| VPN / Direct Connect | ❌ No | ✅ Yes |

### EC2-Classic Retirement Timeline
- **Dec 4, 2013** — new accounts became VPC-only
- **Oct 30, 2021** — EC2-Classic disabled in regions with no active Classic resources
- **Aug 15, 2022** — target completion; EC2-Classic fully retired

> CLB lacks path/host routing, WebSockets, and container support (you'd need one CLB per rule). It **won't appear in the SAA-C03 exam**, but may come up in interviews. For anything new, use **ALB** (Layer 7) or **NLB** (Layer 4).
`,
    },
    {
      id: "api-gateway",
      title: "API Gateway & Application Integration",
      shortDesc: "Single entry point for APIs; REST/HTTP/WebSocket",
      visuals: ["AppIntegration", "MonoMicroScaling", "SyncVsAsync", "APIGatewayConcept", "APITypes", "RestVsHttp", "WebSocketDemo", "CRUDFlow"],
      content: `## API Gateway & Application Integration

### Application Integration

Connecting different applications/services so they exchange data reliably, **decoupled** and scalable. Two flavors:
- **App-to-App** — separate systems (often different companies) coordinating, e.g. UPI app ↔ NPCI ↔ bank; Skyscanner ↔ airline.
- **Microservice-to-Microservice** — independent services inside one app, e.g. order → cart → payment → notification. They can't share functions or a DB, so they talk via **APIs, queues, events & messages**.

> ~99% of modern apps are microservices — integration is how the pieces talk. Heavily tested in SAA-C03.

---

### Monolithic vs Microservices

- **Monolithic** — one codebase/deploy/DB. A small change redeploys everything, and you must scale the **whole** app together (wasteful).
- **Microservices** — scale each part to its own demand. Amazon sale: Browse for 100K, Cart for 10K, Checkout for 4K, Pay for only 2K → optimized cost/performance, faster deploys, tech flexibility.

---

### Synchronous vs Asynchronous

- **Synchronous (real-time)** — sender **waits** for a reply before continuing (like a phone call). Use when the next step depends on the answer. **AWS:** API Gateway, ALB.
- **Asynchronous (no waiting)** — sender sends a message and **continues**; receiver handles it later (like WhatsApp). Use for notifications, inventory updates, retries. **AWS:** SQS, SNS, EventBridge.

---

## API Gateway

A fully managed service that's the **single entry point** for all backend APIs. Clients never hit backends directly — the gateway **secures, throttles, routes & logs** every request, then forwards to the right backend (Lambda, EC2, ECS/EKS).

> 🚕 **Uber:** one gateway in front of many APIs (driver location, ride request, fare, payment, trip history, notifications) to secure them, throttle peak traffic, block suspicious requests, and manage versions.

---

## The 4 API Types

- **HTTP API** — request/response; faster & ~70% cheaper, fewer features. Simple/low-cost APIs.
- **REST API** — request/response with the full advanced feature set. More expensive.
- **REST API (Private)** — same as REST but VPC-only.
- **WebSocket API** — persistent, two-way, real-time (connection stays open).

---

## REST vs HTTP API (the exam decision)

| Feature | REST | HTTP |
|---|---|---|
| API keys | ✅ | ❌ |
| IAM auth | ✅ | ❌ |
| Cognito auth | ✅ | ✅ |
| JWT/OAuth (native) | ❌ | ✅ |
| Throttling | ✅ advanced | ⚠️ basic |
| WAF | ✅ direct | ⚠️ via CloudFront |
| Request/response transform | ✅ | ❌ |
| Input validation | ✅ | ❌ |
| Mapping templates (VTL) | ✅ | ❌ |
| Caching | ✅ | ❌ |
| ALB integration | ❌ | ✅ |
| Private API | ✅ | ❌ |
| Cost / Speed | Expensive / slower | ~70% cheaper / faster |

> Need **transform, validation, mapping templates, caching, API keys, or private API**? → **REST**. Want **cheap & fast** with JWT/OAuth or ALB? → **HTTP**. (CloudWatch logs & Lambda/HTTP integration: both.)

---

## WebSocket API

REST/HTTP close after each response; **WebSocket keeps the connection open** for continuous two-way messaging.

> **Keywords → WebSocket:** "real-time", "two-way", "long-lived connection". Use cases: live chat, notifications/dashboards, gaming, collaboration (Zoom, Google Docs), delivery tracking. Supports Lambda, JWT & Cognito; **no** ALB, API keys, WAF, or caching.

---

## CRUD & the Flow

**CRUD** = Create (\`POST\` → PutItem), Read (\`GET\` → GetItem/Scan), Update (\`PUT\` → UpdateItem), Delete (\`DELETE\` → DeleteItem).

A website **can't** talk to DynamoDB directly (no public access). The flow: **Website → API Gateway → Lambda (CRUD logic) → DynamoDB**. One API Gateway exposes all four CRUD endpoints with a clean URL, auth, logs & throttling.`,
    },
    {
      id: "api-gateway-2",
      title: "API Gateway – Advanced (Part 2)",
      shortDesc: "Endpoints, TLS, resources/methods, security, canary, custom domains",
      visuals: ["EndpointTypes", "SecurityPolicyTLS", "ResourcesMethods", "IntegrationTypes", "MethodRequestSettings", "SecurityLayers", "APIKeysUsagePlan", "CanaryDeployment", "CustomDomain"],
      content: `## API Gateway – Advanced (Part 2)

Deep dive into REST API configuration and security.

---

## REST API Endpoint Types

An API has exactly **one** endpoint type:
- **Regional** — deployed in one region; clients hit it directly. Best for nearby users (higher latency for far users).
- **Edge-Optimized** — fronted by **CloudFront**; users hit the nearest edge → routed to your region. Best for global users (slightly pricier).
- **Private** — VPC-only, via a VPC interface endpoint. For internal APIs.

> Need both public & VPC access? Create two APIs.

---

## TLS Security Policy & Endpoint Access Mode

**TLS** encrypts the client↔API tunnel (= HTTPS). The **security policy** sets the minimum TLS version: **1.2** (modern), **1.3** (faster/most secure — prefer it), plus **FIPS** (US gov), **PFS** (key per connection), **PQC** (quantum-safe).

**Endpoint access mode** (with enhanced policies):
- **Basic** — allow all.
- **Strict** — blocks **domain fronting** (where the TLS **SNI** ≠ the HTTP **Host** header) and enforces the matching endpoint type. For edge-optimized, CloudFront handles this. Policies apply to the default invoke URL; custom domains have their own.

---

## Resources & Methods

REST uses a tree: **Resources** (URL paths) contain **Methods** (HTTP verbs), and **all advanced features live at the method level**.
- Root resource \`/\` is auto-created and can't be deleted; child resources (e.g. \`/users\`, \`/users/{id}\`) live inside it.
- Method types: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS (CORS), and **ANY** (one backend for all verbs).

---

## Integration Types & Proxy

**Integration** = where a method sends the request: **Lambda** (most popular), **HTTP** (public endpoint), **Mock** (fixed response for testing), **VPC Link** (private backends via NLB v1 / ALB v2), **AWS Service** (call S3/DynamoDB/SQS/SNS/Kinesis directly — REST supports far more than HTTP API).

**Proxy integration** (Lambda/HTTP/VPC link):
- **ON** ("courier") — forwards the full request unchanged; backend does everything. ~90% of modern APIs.
- **OFF** ("office worker") — gateway can transform/filter request & response (for legacy backends). Configure response mode (**buffered** vs **streamed**) and an **integration timeout** (504 if backend too slow).

---

## Method Request Settings (the security gate, before backend)

- **Authorization** — **None** (public) / **AWS IAM** (SigV4) / **Cognito** (JWT) / **Lambda authorizer** (custom). Fail → 401.
- **Request Validator** — checks the **body** (JSON payload, for POST/PUT), **query string** (e.g. \`?id=101\`, for GET), and **headers** (e.g. \`x-api-key\`).

---

## Security — 4 Layers

1. **Usage Control** — API Keys + Usage Plans (identify clients, throttle + quota).
2. **Access Control** — Resource Policy (who/where: IP, VPC, AWS account — not auth).
3. **Edge Protection** — AWS WAF (layer-7: SQL injection, XSS, bad bots).
4. **Auth & Authz** — IAM / Cognito / Lambda authorizer.

> Order: Resource Policy → WAF → Usage Plan → Authorizer.

---

## API Keys & Usage Plans

An **API key** (string sent as \`x-api-key\`) identifies a client; it needs a **usage plan** that sets **throttling** (rate + burst) and **quota** (per day/week/month).

> **Error codes (exam):** missing/invalid key or blocked by policy → **403 Forbidden**; throttle/quota exceeded → **429 Too Many Requests**. Keys only *identify* (not authentication) and don't restrict origin. Full on REST, limited on HTTP API.

---

## Canary Deployment

Release safely: send a small % of traffic to the new version, keep the rest on stable, watch metrics, then promote or roll back. Configured at the **stage** level, works with **Lambda aliases** (not versions), **REST API only**.

---

## Custom Domain & Routing Modes

Use your own domain (e.g. \`api.company.com\`) — HTTPS-only, needs an **ACM certificate** matching the domain (edge → **us-east-1**; regional → same region) and a DNS record (**Alias** for Route 53, **CNAME** for external).

**Routing modes:**
- **API Mapping only** — simple path-based (e.g. \`/user\` → API/stage). REST/HTTP/WebSocket.
- **Routing Rules only** — conditional on path **+ headers** (e.g. \`/user\` + \`x-env:dev\`), with **priority** (lower = higher). REST only.
- **Rules → Mapping** — rules first, fall back to mappings (add conditions without breaking existing setup).

> **mTLS** (mutual TLS) — custom domains only (regional); verifies the **client's** certificate too. For high-security APIs.`,
    },
  ],
};
