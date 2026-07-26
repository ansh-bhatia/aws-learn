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
      id: "vpc-connectivity",
      title: "VPC – Connectivity & Security (Part 2)",
      shortDesc: "Peering, NACL vs SG, VPN, Direct Connect, Transit Gateway, Endpoints",
      visuals: ["HybridConnectivity", "TransitGatewayMesh", "VPCEndpointExplorer"],
      content: `## VPC Part 2 — Connectivity & Security

Part 1 built a VPC. Part 2 covers how VPCs **connect** to each other and to on-premises, and the **two security layers** that protect them: VPC Peering, Network ACLs vs Security Groups, stateful vs stateless, VPN, Direct Connect, Transit Gateway, and VPC Endpoints (PrivateLink).

---

## VPC Peering

By default, **two VPCs cannot communicate** — even in the same AWS account. **Peering** creates a private link between them. It's flexible: it works **across accounts** and **across regions**.

### How to set it up
1. **Requester** VPC sends a peering request (specify account ID and/or region + the peer VPC ID)
2. **Accepter** VPC accepts the request → status becomes **Active**
3. **Add routes on BOTH sides** — each route table needs an entry pointing the *other* VPC's CIDR at the peering connection (\`pcx-…\`)

### Key rules
- The two VPCs **must have different CIDR ranges** (overlapping ranges can't be peered)
- Peering is **not transitive**: if A↔B and A↔C are peered, B still cannot reach C — you'd need a B↔C peering too
- Traffic uses the **Amazon private network** (no internet, no public IPs needed)

> If you delete the peering connection (and its routes), communication breaks immediately.

---

## The Two Security Layers: NACL & Security Group

Every packet to an instance passes **two** checks:

1. **Network ACL (NACL)** — protects the **entire subnet** (the *building's* security guard)
2. **Security Group (SG)** — protects the **instance / ENI** (the *office's* security guard)

| Aspect | 🚪 Security Group | 🏢 Network ACL |
|--------|-------------------|----------------|
| Applies to | Instance / network interface | Entire subnet |
| Rule evaluation | All rules at once (no order) | In order — **lowest rule # wins** |
| Allow / Deny | **Allow only** (rest implicitly denied) | **Allow AND Deny** rules |
| State | **Stateful** | **Stateless** |

- A new/custom NACL **denies all** inbound + outbound until you add rules
- The **default** NACL allows everything (effectively "off")
- A NACL is useless until **associated with a subnet**

> Block a port for a **whole subnet** → NACL. Allow a port for **one instance** → Security Group. Only NACLs can **explicitly deny** (e.g. block a single malicious IP while allowing everyone else).

### NACL Rule Order
Rules are evaluated in ascending number order; the **first match wins**. To deny one IP from port 80, the DENY rule must have a **lower number** than the broad ALLOW — otherwise the ALLOW matches first and the DENY never runs.

---

## Stateful vs Stateless

This is the deepest difference between SG and NACL.

- **Stateful (Security Group):** remembers connections it initiated. When your instance sends an outbound request, the **reply is automatically allowed back in** — no inbound rule needed. Lower admin burden.
- **Stateless (Network ACL):** remembers nothing. You must add rules for **both directions** — outbound for the request *and* inbound for the reply.

> Inbound traffic *from* the internet (e.g. a user opening your website on port 80) needs an inbound rule in **both** cases. The difference is only about the **return** traffic.

---

## Connecting On-Premises to AWS (Hybrid Cloud)

### Site-to-Site VPN
A tunnel over the **public internet** between your on-prem router and AWS.

- Encrypted with **IPsec** (required — it's a public network)
- Bandwidth up to **~1.25 Gbps**
- Components: **Customer Gateway** (your side's public IP) + **Virtual Private Gateway** (attached to the VPC) + **Site-to-Site VPN connection**
- Easy: download the ready-made router config from AWS, paste it into the router (e.g. Cisco), done
- Don't forget the **route table entries on both sides** (AWS side and the router)

### AWS Direct Connect
A **dedicated private fibre** line — no internet at all.

- **No encryption** (the private line is already safe; data travels as clear text)
- Bandwidth up to **~100–300 Gbps**, consistent low latency
- Provided by a partner with an **AWS edge location**; takes **30–90 days** to set up
- Lower bandwidth cost, most private option

> Exam tip: **VPN = internet + IPsec encryption**; **Direct Connect = private fibre, higher bandwidth, no encryption.**

---

## Transit Gateway

Connecting N VPCs with peering needs **N × (N−1) / 2** connections:
- 4 VPCs → 6 peerings
- 10 VPCs → **45** peerings 😵

A **Transit Gateway (TGW)** is a central **hub**. Each VPC, VPN, or Direct Connect **attaches once**, and the TGW routes traffic between them — no mesh.

### How to use it
1. Create the Transit Gateway
2. Create a **Transit Gateway Attachment** for each VPC (pick VPC + subnet)
3. Add **routes** in each VPC's route table pointing other VPC CIDRs at the TGW

> All attachments must be in the **same account and region**. For cross-account/region, create **two Transit Gateways** and **peer** them.

---

## VPC Endpoints & PrivateLink

By default, traffic from your EC2 to another AWS service (e.g. **S3** or **DynamoDB**) goes **over the public internet** via the Internet Gateway. A **VPC Endpoint** keeps it on the **AWS private network** instead — secure, low-latency, no IGW/NAT/VPN needed.

**PrivateLink** is the underlying technology that connects your VPC privately to AWS services, on-prem, or other VPCs.

### Two Endpoint Types

| | 🚪 Gateway Endpoint | 🔌 Interface Endpoint |
|--|---------------------|------------------------|
| Services | **S3 & DynamoDB only** | Most other AWS services |
| Mechanism | Target in the **route table** | ENI with a private IP |
| Route table entry | ✅ Required | ❌ Not required |
| Powered by | Gateway | PrivateLink |

> Remember the two gateway-endpoint services: **S3** and **DynamoDB**. Everything else uses an interface endpoint. (A third type — *Gateway Load Balancer endpoint* — comes with load balancers.)

### Endpoint Services (Provider → Client)
Expose **one specific service** (e.g. an app on port 80) from a **provider VPC** to a **client VPC**, privately via PrivateLink.

- Unlike **peering** (which gives full two-way access to *all* resources), endpoint services expose **only the chosen service**
- Requires a **Network Load Balancer** (or Gateway LB) in the provider VPC
- **Same region only** (cross-region needs peering too), and **TCP traffic only**
`,
    },
    {
      id: "vpc-management",
      title: "VPC – DHCP, Flow Logs & Prefix Lists (Part 3)",
      shortDesc: "DHCP option sets, VPC flow logs, managed prefix lists",
      visuals: ["DHCPOptionSetDemo", "VPCFlowLogExplorer", "ManagedPrefixListDemo"],
      content: `## VPC Part 3 — DHCP, Flow Logs & Prefix Lists

Three operational VPC features that make networks easier to manage and observe: **DHCP Option Sets**, **VPC Flow Logs**, and **Managed Prefix Lists**.

---

## DHCP Option Sets

**DHCP** (Dynamic Host Configuration Protocol) auto-assigns network settings to devices — exactly like joining hotel Wi-Fi: you enter a password and instantly receive an IP, with no manual config.

Every VPC has DHCP enabled, so any EC2 instance you launch gets a **private IP automatically** from its subnet's range. A **DHCP Option Set** lets you customise the *other* settings handed out.

### What you can / can't change

| Setting | Editable? |
|---------|-----------|
| IP address | 🔒 **No** — always auto-assigned from the subnet |
| Domain name | ✅ Yes (e.g. \`cloudfox.local\`) |
| DNS server | ✅ Yes (e.g. \`8.8.8.8\`) |
| NTP server (time sync) | ✅ Yes |
| NetBIOS / node type | ✅ Yes |

These options matter most when you run your **own Active Directory / DNS / NTP** servers.

### How to apply
1. Create a DHCP option set with your custom domain name / DNS / etc.
2. Attach it to the **VPC** (*Edit VPC settings → DHCP option set*) — it applies to **all subnets**, you can't set it per-subnet
3. On the instance, run \`ipconfig /renew\` (Windows) to pick up the new values — the IP stays the same

> To revert, re-attach the default option set, delete your custom one, and renew again.

---

## VPC Flow Logs

Flow Logs **record the traffic** flowing in and out of your VPC — between EC2 instances, through load balancers, VPN, or Transit Gateway. They're used for **troubleshooting** and **security analysis**.

### What to capture (filter)
- **ACCEPT** — only allowed traffic
- **REJECT** — only traffic blocked by a Security Group / NACL (great for spotting attacks and probing)
- **ALL** — both

### Where to send the logs

| Destination | Delivery time | Best for |
|-------------|---------------|----------|
| **Amazon S3** | ~10–15 min | Cheap storage, archival, big-data queries (Athena) |
| **CloudWatch Logs** | ~5 min | Analytics, queries, alerting (faster) |
| **Kinesis Data Firehose** | near real-time | Streaming to other systems |

### A log record contains
version, account-id, **interface-id** (the ENI/NIC), **srcaddr / dstaddr**, **srcport / dstport**, protocol, and the **action** (ACCEPT/REJECT). You can use the default format or pick only the fields you want.

- Attach a flow log to a **VPC, a subnet, or a single ENI**
- Set the aggregation interval (e.g. 10 minutes) and (for S3) partition by hour/day
- Remember: S3 delivery can take 10–15 minutes — don't panic if logs don't appear instantly

---

## Managed Prefix Lists

A **prefix list** is a named, reusable set of CIDR ranges. Instead of typing the same IPs into many security groups and route tables, you define them **once** and reference the list.

### The problem it solves
Say three servers (web :80, db :3306, storage :2049) each need the **same set of source CIDRs** allowed. Without a prefix list, you add every CIDR to **every** security group — and when a new data-center range appears, you edit **all** of them. With a prefix list, you add the new CIDR **once** and all referencing groups update automatically.

You can reference a prefix list from: **Security Groups, route tables, Transit Gateway route tables, Network Firewall, and Grafana network access.**

### Two types

| | 👤 Customer-Managed | 🟦 AWS-Managed |
|--|---------------------|----------------|
| Contents | Your own CIDR ranges | Prebuilt ranges for AWS services (S3, CloudFront, DynamoDB…) |
| Edit / delete / share | ✅ Full control, shareable across accounts | ❌ Cannot create, edit, delete, or share |
| Updates | You maintain it | Auto-updates when AWS changes service IPs |
| Typical use | Inbound **and** outbound | Mostly **outbound** (e.g. EC2 → CloudFront / S3) |
| IP version | One per list (IPv4 *or* IPv6) | IPv4 and IPv6 lists exist |

> AWS-managed lists are applied to a **region** only and make sense for **outbound** rules — e.g. "let this EC2 send traffic only to CloudFront edge locations" without ever knowing their IPs.

### ⚠️ Weight & Limits
A prefix list counts against rule limits by its **number of entries** ("weight"). CloudFront's list is ~**55** CIDRs:
- A **security group** allows ~60 rules → only ~5 left after adding it
- A **route table** allows ~50 routes → the 55-entry list **won't fit** at all

These are **soft limits** — raise them via AWS Support if needed.
`,
    },
    {
      id: "route53",
      title: "Route 53",
      shortDesc: "Scalable DNS and domain registration",
      visuals: ["DNSResolutionFlow", "FQDNAnatomy", "DNSRecordTypes", "RoutingPolicyOverview", "WeightedRoutingCalculator", "HealthCheckDemo", "GeoproximityBias", "FailoverDemo"],
      content: `## Route 53 — AWS DNS Service

**Route 53** is AWS's **DNS** (Domain Name System) service. It's named after **port 53**, the TCP/UDP port DNS uses. It resolves human-friendly **names** (like \`learn.cloudfox.in\`) into **IP addresses**, registers domains, and offers powerful **routing policies** and **health checks**.

> DNS is the **phonebook of the internet**. You dial a name; it connects you to a number (IP). Without it you'd have to memorise \`13.5.19.80\` instead of \`google.com\`.

---

## How DNS Name Resolution Works

When you open \`www.facebook.com\`, your computer must find its IP first:

1. **Your device** sends the name to a **DNS Resolver** (your ISP provides its IP via DHCP)
2. If not cached, the resolver asks a **Root Server** (13 worldwide). Root sees \`.com\` and points to the **.com TLD servers**
3. The **TLD server** returns the domain's **authoritative name server** address
4. The **Authoritative Server** (this is **Route 53**!) holds the real records and returns the IP, e.g. \`7.5.8.9\`
5. The resolver **caches** the answer and your device connects. Next time, the cache replies instantly

You only ever configure the **authoritative** server (Route 53) — the rest is the internet's shared hierarchy.

---

## FQDN — Domain Name Anatomy

A **Fully Qualified Domain Name** (max **255 chars**) reads right-to-left in hierarchy:

\`\`\`
learn  .  cloudfox  .  in
 │           │          └── TLD (top-level domain): .com, .in, .org… (fixed set)
 │           └───────────── Subdomain (the domain you register)
 └───────────────────────── DNS Label / host (max 63 chars)
\`\`\`

---

## Registering a Domain & Hosted Zones

Domains aren't free (~$5–15/yr). You can:
- **Register** directly in Route 53, **or**
- Use another registrar (GoDaddy, Namecheap…) and point its **name servers (NS)** to Route 53's 4 NS records

A **Hosted Zone** is the container for your records:
- **Public hosted zone** — resolvable over the internet (needs a registered domain)
- **Private hosted zone** — name resolution inside your VPC only

> Why use Route 53 over a registrar's DNS? **Routing policies** — the feature registrars don't offer.

---

## Record Types

| Record | Maps | Use |
|--------|------|-----|
| **A** | Name → IPv4 | The main website record |
| **AAAA** | Name → IPv6 | Same as A, for IPv6 |
| **CNAME** | Name → another name | Alias (e.g. \`test\` → \`learn\`); update once, all follow |
| **MX** | Domain → mail server | Receive email (no MX = no mail) |
| **TXT** | Name → free text | Verification, ownership, SPF/DKIM |
| **PTR** | IP → name | Reverse lookup |
| **SRV** | Service → host:port | App-specific (e.g. Active Directory) |
| **SPF** | Domain → allowed mail IPs | Anti-spoofing/phishing |

> There's also an AWS-specific **Alias** record to point at ELB / CloudFront / S3 — covered with those services.

---

## The 8 Routing Policies

Most are **active-active** (use all resources). Only **Failover** is **active-passive**.

### 1. Simple
One record. No health checks. The default for a single resource.

### 2. Weighted (Active-Active)
Split traffic by **weight** (0–255; 0 = off). Share = \`thisWeight / totalWeight × 100\`.
- Example: weights **120 / 50 / 30** → total 200 → **60% / 25% / 15%**
- Great for A/B testing and gradual rollouts

### 3. Latency (Active-Active)
Routes to the region with the **lowest latency** for the user — the *fastest network path*, not the nearest in km (though usually they correlate).

### 4. Geolocation (Active-Active)
Routes by the user's **country/continent**. India → India server, US → US server, everyone else → a **default** record. Used for localised content and compliance. (Purely location-based — ignores latency.)

### 5. Geoproximity (Active-Active)
Routes by **geographic distance**, adjustable with a **bias** to grow/shrink a region's coverage — your conscious business decision. Requires a **Traffic Policy** (~**$50/mo**).

### 6. Failover (Active-Passive) ⭐
The **only** active-passive policy. **Primary** serves all traffic; if its health check fails, Route 53 flips everyone to the **secondary** standby. Used for disaster recovery.

### 7. Multivalue Answer (Active-Active)
Returns up to **8 healthy records** at once in **round-robin**; the client picks one. Simple load spreading with health checks.

### 8. IP-Based (Active-Active)
Routes by the resolver's **source IP** (you define CIDR collections). e.g. ISP-A's IP range → server 1. Useful for session affinity and cost optimisation.

---

## Health Checks

Without health checks, Route 53 keeps handing out a **dead server's IP** — so a fraction of users fail. A health check sends **probe packets** to each endpoint; **unhealthy** ones are removed from answers.

- **Mandatory** with Weighted / Failover / Multivalue for true high availability
- When a server recovers, it automatically re-enters rotation
- Lower the record **TTL** (e.g. 60s) so clients/resolvers stop caching the dead IP quickly and pick up changes fast

> **TTL (Time To Live):** how long a resolver/computer caches a record. High TTL = faster repeat lookups but slower failover. Use \`ipconfig /flushdns\` (Windows) to clear local DNS cache when testing.
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
    {
      id: "elb",
      title: "ELB – Elastic Load Balancing",
      shortDesc: "Distribute traffic across targets",
      visuals: ["LoadBalancerBasics", "LBTerminology", "LBTypeComparison", "ALBRouting", "CrossZoneLB", "GatewayLBFlow"],
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
      id: "direct-connect",
      title: "Direct Connect",
      shortDesc: "Dedicated network connection to AWS",
      content: `## Direct Connect

**AWS Direct Connect (DX)** is a **dedicated, private fibre connection** from your data center to AWS — bypassing the public internet for **consistent low latency, higher bandwidth, and lower data-transfer cost**.

- Takes weeks to provision (physical link via a DX location).
- For **hybrid cloud, large/steady data transfer, latency-sensitive** workloads.
- **VPN over DX** adds encryption (DX itself is private but not encrypted).

> DX = private/consistent but slow to set up & costly. **Site-to-Site VPN** = quick, cheap, over the internet. Need a backup for DX → a VPN.`,
    },
    {
      id: "transit-gateway",
      title: "Transit Gateway",
      shortDesc: "Connect VPCs and on-premise networks",
      content: `## Transit Gateway

**AWS Transit Gateway (TGW)** is a **network hub** that connects many **VPCs** and **on-prem** networks through a single gateway — replacing a messy full mesh of VPC peering connections.

- **Hub-and-spoke** routing; supports thousands of VPCs.
- Connects VPCs, **Site-to-Site VPN**, and **Direct Connect**; can route across **regions** (peering).
- Centralizes routing, security inspection, and simplifies management.

> Exam: "connect **many VPCs** / hybrid network at scale without complex peering" → **Transit Gateway**.`,
    },
  ],
};
