// Foundations (Start Here)
export default {
  id: "foundations",
  label: "Foundations (Start Here)",
  icon: "🚀",
  color: "#1F6FEB",
  topics: [
    {
      id: "what-is-cloud",
      title: "What Is Cloud Computing?",
      shortDesc: "From the Zomato app to servers, clusters and data centres — and why the cloud exists",
      visuals: ["WhatIsCloud", "ScalingUpInfrastructure"],
      content: `## Start With an App You Already Use

Take **Zomato**. Look closely and you realise the entire business depends on one thing: their **application**. You want food, so you open your mobile, open the app, and order. If there is a problem with that app, Zomato's business is down — no orders arrive.

That is not unique to them. **Amazon, Ola, Uber** — every business in the 21st century runs on an application.

---

## Building It Is the Easy Part

Software engineers develop the application. The genuinely hard question comes next: **how do you run it?**

Zomato has around **80 million users**. Even if only half are active, serving them is a serious task. To run an application at that scale a company must have:

- **Compute** — to actually execute the application
- **Database** — to store data in an organised way
- **Storage** — for files and everything else
- **Networking** — to connect it all together

These are your **IT resources**. And the rule is simple: **more users means more capacity.**

---

## Watch the Infrastructure Grow

The app lives on a computer we call a **server**. Users reach it from laptops, desktops, phones and tablets — the app itself sits in one place. That server's capacity *is* your user experience: if capacity is poor, your Zomato order crawls.

- **100 users** — a normal-capacity server and a normal-sized database will do.
- **10,000 users** — you must increase that capacity.
- **256 million visitors a month** — Amazon's actual scale. **One server cannot handle it.** Companies run a **group of servers**, which we call a **cluster**.
- **Multiple clusters** — now you need to build an entire **data centre** around them.

When a company owns that infrastructure itself, we call it **on-premises infrastructure**, or an on-premises data centre.

---

## The Problem With Owning It

Setting up your own data centre is a huge undertaking:

- **Money.** Even a very small data centre costs roughly **₹1–2 crore**.
- **Manpower.** You have to hire people to build and run it.
- **Time.** You invest months before you can deploy anything.

---

## Enter Cloud Computing

**Cloud service providers** — **AWS**, **Microsoft Azure**, **Google Cloud Platform (GCP)** — already own all of it: servers, databases, networking, storage. You simply use those resources from *their* data centre and **pay for what you use**.

So if you have an application to run, you do **not** need to build a huge data centre and you do **not** need to spend a large sum up front. You run it directly from the provider's infrastructure.

> **The triple-A formula.** Cloud providers deliver resources so that you can access them **any time**, from **anywhere**, on **any device**.

This is why the startup era looks the way it does. Startups do not build data centres — they host on a cloud provider and begin operating almost immediately, because the infrastructure is already there and ready to use.

---

## The Definition to Memorise

Explaining all of the above in an interview is hard. Learn the compact version instead:

> **Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing.**

Break it into its three pieces:

| Phrase | What it actually means |
|---|---|
| **On-demand** | Any time, anywhere, any device — the triple-A |
| **Delivery of IT resources over the internet** | Compute, storage, database and networking, running in the provider's data centre and reached over the internet |
| **Pay-as-you-go pricing** | No huge upfront build. Use what you need, pay for what you used |
`,
    },
    {
      id: "cloud-benefits",
      title: "The 6 Benefits of Cloud",
      shortDesc: "CapEx→OpEx, economies of scale, stop guessing capacity, agility, no upkeep, go global",
      visuals: ["CloudBenefits", "CapExVsOpEx"],
      content: `## Six Advantages of Cloud Computing

These six apply to **any** cloud provider — AWS, Azure or Google Cloud. They do not change.

---

## 1 · Trade Fixed Expenses for Variable Expenses

**Fixed expense = CapEx (capital expenditure).** Think of buying a car: you hand over ₹2 million up front. **Variable expense = OpEx (operational expenditure).** The petrol, the diesel, the insurance — paid every month, only while you use it.

A data centre works identically. **Building it** means purchasing routers, networking devices, servers, racks and a cooling system — that is your initial investment, your **CapEx**. Then **every month** you pay the electricity bill, manpower, server maintenance and security — your **OpEx**.

Move to a cloud provider and you build no data centre at all, so you **eliminate capital expenditure**. You still pay operational expenditure for the resources you consume — but note that an on-premises data centre has OpEx **too**, stacked on top of its CapEx.

> Almost **zero capital expenditure** is the first and biggest advantage of cloud.

---

## 2 · Benefit From Massive Economies of Scale

Suppose you run a small data centre and go to Cisco asking for five routers. You pay **retail price**.

Now consider AWS. A single AWS data centre holds **50,000–60,000 servers**. When they place an order with a hardware vendor, it is enormous — and the vendor gives an enormous discount to match.

AWS operates those data centres centrally, across a huge number of customers. As they win more business they build more infrastructure, and the savings that produces get **passed back to customers**. This is not theoretical: **Amazon has cut its prices many times** over the years.

---

## 3 · Stop Guessing Capacity

This one is genuinely big. You are a startup. You have an idea and an app, but you do **not** know whether it will succeed, or how many users arrive in month one.

If you build your own data centre, how do you size it? **You guess.**

Now imagine your guess was 1,000 users in the first month — and then **Elon Musk tweets about your idea**. You might get **1 million users** instead. You do not have the capacity, and you **cannot** create it overnight. Calling your hardware vendor will not fix it in time.

The word for this is **scalability**: with your own data centre, you cannot scale to match your users.

On the cloud you never guess. Start with a basic system, then **increase or decrease capacity with a mouse click**. AWS **S3** (Simple Storage Service) offers effectively **unlimited storage** — store 1 GB and you pay for 1 GB, store 100 GB and you pay for 100 GB.

> Overnight success? Scale up and serve everyone. Business slower than hoped? Scale down and your expenses fall with it. On-premises simply cannot do this.

---

## 4 · Increase Speed and Agility

Ask any hardware vendor how quickly you can get a server. Submit a purchase order, and delivery arrives in about **15 days**. Ask for a firewall — another **15 days**.

If a single server takes a fortnight, how long does a whole data centre take? Roughly **six months to a year**.

Meanwhile you have your idea and your application sitting ready — and by the time the building is finished, the idea may already be stale.

On the cloud you open an account and start creating resources **within minutes**. You can turn an idea into reality in **five to ten minutes**.

---

## 5 · Stop Spending Money Running and Maintaining Data Centres

You have no responsibility for maintaining a data centre, no spending on its physical security, and no data-centre rent — that is the provider's problem now. You can work from anywhere, at any time.

There is also a **hardware lifecycle** to escape. You cannot keep a server running usefully for more than about **four years**; eventually you must decommission and replace it. On the cloud that cycle is invisible to you.

---

## 6 · Go Global in Minutes

Say your application targets **US users** and you want it running on US infrastructure. On the cloud you deploy into a US region **from India**, exactly the way you would deploy in India. No travel, no provisioning, no local data centre.

Do the same on-premises and you must **first build a data centre in the USA**, then manage it remotely — a genuinely hard process.

> AWS has regions all over the world. You are not managing any of those data centres; you are simply using them. This connects directly to **AWS Global Infrastructure**, covered later in this section.
`,
    },
    {
      id: "cloud-types",
      title: "Types of Cloud — Private, Public & Hybrid",
      shortDesc: "The three deployment models, their trade-offs, and 3 real hybrid case studies",
      visuals: ["CloudTypes", "HybridCloudCases"],
      content: `## Why This Matters Before You Learn AWS Services

There are three types of cloud: **private**, **public** and **hybrid**. Learn them now, because AWS services keep referring back to them — when you meet **AWS VPN**, for example, the explanation begins "you use this when you have a hybrid cloud." Without the concept, that sentence means nothing.

---

## Private Cloud

A cloud used **exclusively by one business or organisation**. You build it for your company, and your employees use it.

**"But isn't that just on-premises infrastructure?"** Nearly — and the distinction matters. On-premises infrastructure is the *hardware*. It becomes a **private cloud** when you add the **triple-A** on top: available **any time**, accessible from **anywhere**, usable from **any device**.

| | Private cloud |
|---|---|
| ✅ **Advantage** | **Total control.** You choose the hardware. You decide the security model. Everything is yours. |
| ❌ **Disadvantage** | You build it yourself — heavy **capital expenditure** up front, plus the manpower to maintain it. |

**Who uses it:** organisations bound by security requirements and **government compliance**, where data cannot be shared — they need control over the whole of it.

---

## Public Cloud

A **third party** — the cloud service provider — manages everything. You deploy no infrastructure of your own; servers, storage and the rest come from the provider, and you reach them **over the internet**.

There are many providers, but three dominate: **AWS**, **Azure** and **Google Cloud Platform**.

| | Public cloud |
|---|---|
| ✅ **Advantage** | Very simple to deploy, almost **zero capital expenditure**, and very little to manage. |
| ❌ **Disadvantage** | **No control** over the underlying infrastructure — you cannot access it. |

> Notice the symmetry: private cloud gives control but costs capital. Public cloud removes the capital but takes away control. Each has exactly one big advantage and one big disadvantage.

---

## Hybrid Cloud — Best of Both

So use **both**. Keep your on-premises infrastructure, add cloud infrastructure, **connect them together**.

Now you can keep control of the parts that need controlling, and hand the rest to the provider — where you also gain **great scalability**, increasing or decreasing capacity at any time in a way on-premises struggles with.

**Hybrid is the most popular of the three**, and the three scenarios below are why.

---

## Case 1 — The 10 TB Archive

A company held a large volume of **CorelDRAW (CDR)** design files, each one big. Their storage was full and they wanted a recommendation for buying more.

The useful question was: **are you using this data daily?** No — they pulled a specific file only when a client order came in. The data had to be *kept*, not *accessed*.

**The answer:** frequently-used files stay on the existing storage; the remaining ~10 TB moves to **Amazon S3**. No new hardware, no capital expenditure — and they now run on-premises and cloud side by side.

---

## Case 2 — The University Results Day

A university publishes exam results on its website. Across **365 days**, results are declared on about **five** of them.

For 360 days traffic is completely normal. For those five days it is enormous.

You cannot size on-premises infrastructure for the peak — it would be wildly expensive and idle for 360 days. So: run **on-premises for 360 days**, and move the site to the **cloud for the results window**, where capacity is large enough that there is **no bottleneck**.

---

## Case 3 — Banking Disaster Recovery

**RBI requires** banks to have a disaster recovery solution. Traditionally that means a second, standby data centre: if the primary fails, you move users to the **recovery site**. Bombay Stock Exchange runs the same kind of plan.

Here is the cost problem. If the primary data centre cost **₹15 crore**, the standby costs **₹15 crore too**. And how often does it get used? Perhaps a day or two a year — possibly not at all for years. Yet every server sits running in standby, drawing **electricity** and consuming **space**, doing nothing.

**With the cloud there is no upfront payment.** Keep the live banking data centre on-premises, and stand the recovery site up in AWS. When something goes wrong, move users across. This is one of the best patterns companies use — and the clearest reason hybrid cloud is so popular.
`,
    },
    {
      id: "cloud-service-models",
      title: "Cloud Service Models — IaaS, PaaS & SaaS",
      shortDesc: "The 9-layer stack and exactly who manages what in each model",
      visuals: ["CloudServiceModels", "ResponsibilityStack"],
      content: `## Three Service Models

The cloud offers many services, but three are fundamental: **IaaS** (Infrastructure as a Service), **PaaS** (Platform as a Service) and **SaaS** (Software as a Service).

The clearest way to understand them is to compare each against **on-premises infrastructure** — so we start there.

---

## On-Premises — You Manage Everything

With your own infrastructure, every layer is your responsibility:

- **Networking** — switches, routers, firewalls, internet connectivity.
- **Storage** — you purchase and maintain it, whether **NAS** (network attached storage) or a **SAN** (storage area network).
- **Servers** — buying and maintaining the physical machines, HP or Dell or otherwise.
- **Virtualization** — running a platform such as **VMware** or Microsoft **Hyper-V**.
- **Operating System** — installing Windows Server or Linux, securing it, patching it.
- **Middleware and Runtime** — a Java application needs the **Java runtime**; a .NET application needs the **.NET framework**. You install and manage them.
- **Data and Application** — encrypting the data, backing it up, running the app.

Nine layers, all yours.

---

## IaaS — Infrastructure as a Service

Responsibility now splits roughly **50/50**.

The provider manages **networking, storage, servers and virtualization** — the underlying infrastructure. You cannot access it, but equally you are **not responsible** for it. You keep the **OS, middleware, runtime, data and application**.

**Examples:** **EC2** (Elastic Compute Cloud) on AWS, **Azure Virtual Machine** on Azure.

> Because the operating system is still yours, launching an EC2 instance **asks you to choose** — Linux or Microsoft Windows. That choice exists precisely because you own that layer.

The gain: you manage half as much, so you spend more of your attention on the business rather than the infrastructure.

---

## PaaS — Platform as a Service

Go one level higher and your responsibility drops to roughly **25%**. The provider now handles **runtime, middleware, OS, virtualization, servers, storage and networking**. You manage only your **data** and your **application**.

**Examples:** **RDS** on AWS, **Azure Database**.

> Because the operating system is *theirs*, creating an RDS database **never asks you to pick an OS**. The absence of that question is how you can feel the model change.

---

## SaaS — Software as a Service

Now you manage **nothing**. You buy a subscription and use the application.

Think about the old way of using **Microsoft Office**: you needed a computer, then Windows, then you installed the application inside it. Compare **Office 365** — you need a **browser**. That is all. Access it from anywhere, from any device.

Data you produce is stored in the cloud directly. The provider supplies everything; you just subscribe.

**The trade-off** is real dependence. If the provider tells you their application server is down, there is nothing you can do but wait. And because everything is reached over the internet, **if your internet is down, so are you**.

---

## The Whole Picture

| Model | You manage | Provider manages | Example |
|---|---|---|---|
| **On-Premises** | All 9 layers | Nothing | Your own data centre |
| **IaaS** | OS, middleware, runtime, data, app (~50%) | Networking, storage, servers, virtualization | **EC2**, Azure VM |
| **PaaS** | Data and application (~25%) | Everything below the data | **RDS**, Azure Database |
| **SaaS** | Nothing | Everything | **Office 365**, Gmail |

> Four pictures in total — one on-premises, three cloud service models. The further you move down this table, the less you manage and the less control you retain. Each service you learn later will slot into one of these rows.
`,
    },
    {
      id: "getting-started-aws",
      title: "Getting Started with AWS",
      shortDesc: "How AWS began, its milestones, and the data behind 'market leader'",
      visuals: ["AWSMarketShare"],
      content: `## AWS Is Where Cloud Computing Started

AWS **officially launched in 2006**, and its first service was **Amazon Simple Storage Service (S3)**. Nearly two decades later, S3 is still one of the most popular services AWS offers.

Here is a detail that makes S3 concrete. You use **Dropbox** and **iCloud** to store files, and you may have wondered how those companies store such enormous volumes of data. Many of them are **using Amazon S3 in the background**.

S3 was a huge success, so AWS launched another service: **EC2** — a **virtual server in the cloud**. Need a server? Create one from the EC2 dashboard in a few clicks. That too was an enormous success.

---

## The India Timeline

- **2016** — AWS launches its first Indian region, in **Mumbai**, beginning its journey in India.
- **November 2022** — AWS launches a second Indian region in **Hyderabad**.

AWS now operates **two regions in India**.

---

## The Scale Today

AWS provides **200+ services**. If you have an application to host, AWS has everything you need for it — and it is the market leader **by number of services** as well as by revenue.

---

## "Market Leader" Is a Measurable Claim

That is not an opinion. **Gartner**, a research firm, publishes a **Magic Quadrant** for each field every year, sorting companies into leaders, challengers, niche players and visionaries.

**AWS has been number one for the last ten years.**

Three companies sit in the leaders' quadrant for cloud, and their market shares are:

| Provider | Market share |
|---|---|
| **Amazon Web Services** | ~33% |
| **Microsoft Azure** | ~22% |
| **Google Cloud** | ~11% |

---

## Why Learn the Leader

If you are starting your cloud journey, start with AWS:

- **More companies use it**, so your job prospects are wider.
- **200+ services** means you see the widest possible range of how cloud systems actually work.

> From here on the course is hands-on — every lab and practical runs in the **AWS console**. The next topic gets your free account created.
`,
    },
    {
      id: "aws-free-tier-account",
      title: "Lab – Create an AWS Free Tier Account",
      shortDesc: "Full sign-up walkthrough: card requirements, OTP verification, support plan",
      visuals: ["FreeTierAccountLab", "FreeTierBudget"],
      content: `## Do You Need to Pay Anything?

**No.** All you need is a laptop or desktop computer and an **AWS Free Tier account**.

AWS gives you a free tier for **12 months**, with limits. Every practical in this course stays inside those limits and never uses a paid service — but **you must delete the resources you create**, because the allowances are finite.

---

## What the Free Tier Actually Includes

Open the AWS free tier page and scroll down: AWS lists the allowance for every service. The account runs for **12 months**, and **some services are always free**.

| Service | Free tier allowance |
|---|---|
| **EC2** | 750 hours per month |
| **Amazon S3** | 5 GB of storage |
| **Amazon RDS** | 750 hours per month |

Cross a limit — exceed those 750 EC2 hours, say — and **you start paying**. That is exactly why the next topic sets up a budget alert.

---

## What You Need Before You Start

- **An email account** — Gmail or Yahoo is fine.
- **A credit or debit card** that is **Visa, Mastercard or American Express**.
- **International transactions enabled** on that card. Check your bank's mobile app — you can normally switch this on yourself.

> ⚠️ **An Indian-Rupee-only card is not accepted.**

---

## About the Card Charge

AWS takes the card details **for verification only**. They validate the card, and may deduct around **₹2**, which comes back to you within a day or two.

**They will never deduct money from your card automatically** — not even when you have a bill. Billing is something you go and pay deliberately. There is no automatic deduction, so there is nothing to worry about here.

---

## The Sign-Up Walkthrough

Work through the interactive lab below — it covers all nine steps, from opening the free tier page to signing in to the console for the first time. The sequence is:

1. **Prepare** your email and an internationally-enabled card.
2. **Create Free Account** from the AWS free tier page.
3. **Email** — enter and verify with the emailed code. Copy and paste rather than typing, so there is no typo.
4. **Root user password** — make it complex: uppercase, lowercase, numbers, symbols.
5. **Contact information** — Personal for a learning account, plus name, mobile and address.
6. **Billing information** — card number, cardholder name, CVV. Decline the PIN prompt. Confirm the OTP.
7. **Identity verification** — mobile number, captcha, SMS code. Allow two to five minutes.
8. **Support plan** — **Basic (free)**, not Developer ($29) or Business ($100).
9. **Sign in** to the AWS Management Console with your email and password.

> The differences between **Basic, Developer and Business** support come up in the **Cloud Practitioner** exam, so they are worth knowing — but Basic is what you want here, because it costs nothing.

---

## Before You Touch Anything

Your account is live, but **do not start creating resources yet**. Set up a **budget** first, so that any accidental charge reaches you as an email straight away. That is the next topic.

> And the habit that saves you money throughout this course: **whatever you create in a lab, delete or terminate it when you finish.**
`,
    },
    {
      id: "aws-budget-setup",
      title: "Lab – Set a Zero-Spend Budget",
      shortDesc: "Free tier alerts + a $0.01 budget so accidental charges reach you immediately",
      visuals: ["BudgetSetupLab"],
      content: `## Why This Comes First

Your account works and you could start any practical right now. But if you make a mistake and accidentally create a **chargeable** resource, you would not find out until the bill arrived.

So before anything else, set a **budget**. Once it exists, creating a chargeable resource triggers an **immediate email from AWS**.

We will set a **zero-spend budget** — so even ₹1 of spend produces an alert.

---

## The Rule That Matters Most

> ⚠️ **AWS sends you alerts. AWS does NOT delete your resources.**

When an alert arrives, go into your account and **delete the resource yourself**. A budget existing does **not** mean spending will stop at that budget — it means you get told. Setting a budget and then ignoring the emails achieves nothing.

---

## Step 1 — Turn On Free Tier Alerts

1. Sign in to the **AWS Management Console**.
2. Click your **account name** in the top-right corner.
3. Choose **Billing Dashboard**.
4. Click **Billing preferences**.
5. Under **Alert preferences**, click **Edit**.
6. Tick **Receive AWS Free Tier alerts**.
7. Your email address is usually filled in automatically. If it is not, type it in and click **Update**.

---

## Step 2 — Create the Zero-Spend Budget

1. Go to **Budgets** in the left-hand menu.
2. Click **Create a budget**.
3. Select **Use a template (simplified)**.
4. Choose the **Zero spend budget** template.

The template describes itself plainly: it creates a budget that notifies you once your spending **exceeds $0.01**, which is above the AWS free tier limit. Any charge at all, and you hear about it.

---

## Step 3 — Recipients and Scope

1. Leave the default budget name or set your own.
2. Enter the email address for alerts. **You can enter several** — useful if you check more than one inbox.
3. Leave the scope as **all AWS services**, so nothing escapes the budget.
4. Click **Create budget**.

You should receive a confirmation email that the budget has been set up.

---

## Step 4 — Make Checking It a Habit

On the Budgets page, your budget shows a green **OK** while you are within limits. If you exceed it, that indicator turns **red** and shows an alarm.

Every two or three days: **account name → Billing Dashboard → Budgets**, and confirm it is still green.

> With the budget in place you can run every lab in this course safely. Just remember the other half of the deal — **delete or terminate your resources when a lab ends.**
`,
    },
    {
      id: "aws-management-console",
      title: "The AWS Management Console",
      shortDesc: "Service categories, billing, account ID, CloudShell, and global vs regional services",
      visuals: ["ConsoleTour"],
      content: `## The Home Screen

Sign in with your email account and the console opens on a dashboard containing:

- **Recently visited services** — whatever you opened last. A heavy user sees a long list; a new account shows two or three.
- **Health dashboard** — details about AWS data centres. Any issue on the AWS side shows up here.
- **Cost information** — check any charges on your account at a glance.

---

## Finding Services

AWS has **more than 200 services**, so they are **grouped by category**. Open the services menu and you can browse by category:

- Click **Analytics** → every analytics-related service.
- Click **Application Integration** → every integration service.
- Click **Compute** → every compute service, including **EC2**.

Click **EC2** and the EC2 dashboard opens, where you manage your entire virtual machine environment. **Each service has its own dashboard**, and you will meet most of them over this course.

---

## Your Account ID

Click your account name to reach your billing details — and your **Account ID**.

> Keep this in mind: the Account ID is a **unique number for every AWS user**. It comes up repeatedly later.

This is also where you generate **programmatic access keys** if you want to sign in via the CLI rather than the browser.

---

## Three Ways to Manage AWS

| Method | What it is |
|---|---|
| **Console** | The graphical user interface you are looking at |
| **AWS CLI** | A command line, installed on your own system |
| **CloudShell** | A **browser-based** command line — nothing to install |

CloudShell is the convenient option when you want CLI power without setting anything up locally. Later sections manage infrastructure through the CLI, and that is when you will use it.

---

## The Region Selector — and Global Services

Top-right of the console is the **region list**. Whatever you select is where your resources get created. Choose **US East (N. Virginia)** and every resource you build lands in N. Virginia.

**But not every service is regional.** Search for **IAM** and open it — the region selector shows **Global**, and you cannot change it. Every region is highlighted at once.

> If you cannot select a region for a service, that service is **global** — it applies across all regions rather than living in one. **IAM** is the classic example, and there are many others.

---

## Account Hygiene

- **Never share your password** with anybody.
- **Sign out** of the console when you finish working.

> Account ready, budget set, console understood. The next section builds your first **EC2** instance.
`,
    },
    {
      id: "aws-regions-az",
      title: "Global Infrastructure – Regions, AZs & Local Zones",
      shortDesc: "Latency, why regions exist, data localisation law, AZ high availability, local zones",
      visuals: ["RegionAZLocalZone", "LatencyDistance", "GlobalInfraExplorer"],
      content: `## Start With Latency

Search for **AWS Global Infrastructure** and AWS publishes the live numbers — currently around **32+ launched regions**, **102+ availability zones** and **450+ points of presence**.

To understand what those mean, you first need one word: **latency**.

Take two points, A and B, connected to each other. When data travels from A to B it takes some time. **That time is latency.** And the rule is simple:

> **More distance means more latency.**

---

## Why Regions Exist — Reason 1: Low Latency

A common misconception is that AWS keeps one enormous data centre in the USA. It does not — **AWS has data centres all over the world**. Here is why that matters.

India to the United States is roughly **13,000 km**. Suppose you do business in India, all your users are in India, but your application is hosted in the USA. Every request travels 13,000 km each way. There *will* be latency, and your users will not get their data on time.

The fix is obvious once stated: **host the application in India instead**. Server in India, users in India, low latency.

So AWS **divided the world into regions** — around **35** of them. Doing business in India? Host in an India region. Doing business in the USA? Host in a US region.

---

## Why Regions Exist — Reason 2: Data Localisation

This one matters just as much. India's **Digital Data Act** requires that data be **localised**: if you do business in India and collect **personal data of Indian users**, you must **store it in India**. Moving that data out of the country requires government permission.

How do you promise a government that you are complying? **Create your servers in the India region.** When your application and user data live in an India region, **AWS will never copy or forward that data to another region**.

> Regions are how you, as an AWS customer, guarantee that your data stays inside a particular country.

---

## Availability Zones

A region is **only a geographical boundary**. Inside it sit **availability zones** — and an AZ is an **actual data centre, or a collection of data centres**.

Take **ap-south-1**, the Mumbai region. Inside it, AWS runs **three separate data-centre facilities**. Each of those three:

- Has a **different source of electricity**
- Has a **different water supply**
- Is within a **~100 km radius** of the others
- Is connected to the others by **high-speed fibre optic cable**, at an acceptable latency of about **1 ms**

Because power and water are independent, **if one AZ goes down it does not affect the others**.

---

## What AZs Are For: High Availability

Say you have a crucial application and you want **no downtime**. Deploy your resources into **multiple availability zones**. Your application runs in one AZ *and* another. If one fails, the other keeps serving.

**"Do I pay twice?"** Yes — you are hosting in two places.

But compare it fairly. With on-premises infrastructure, protecting against a facility failure means building a **second disaster-recovery site**, and you pay for that too. Here you pay for two AZs and get **close to 100% high availability**.

---

## Local Zones

AWS has a region in **Mumbai**. Suppose your business and your users are in **Delhi** — about **1,300 km** away. High distance, so latency again.

AWS's answer is a facility **outside** the region, placed near those users. That is a **local zone**. You get nearly all the same services, just not inside the region boundary.

---

## The Distinction to Remember

| | Availability Zone | Local Zone |
|---|---|---|
| **What it is** | A data centre | A data centre |
| **Where** | **Inside** the region | **Outside** the region |
| **Main use case** | **High availability** — host across several | **Low latency** for distant users |

> Three terms so far: a **region** is a geographical boundary; **availability zones** sit inside it; a **local zone** sits outside it. AWS may create a full Delhi region in future, but for now it is a local zone.
`,
    },
    {
      id: "aws-wavelength-outposts",
      title: "Global Infrastructure – Wavelength & Outposts",
      shortDesc: "5G-native application hosting, and AWS hardware in your own data centre",
      visuals: ["GlobalInfraExplorer"],
      content: `## AWS Wavelength

People now use mobiles more than desktops or laptops, and companies build applications **specifically for mobile**. On top of that we have **5G**.

Here is the mismatch. AWS data centres are connected by **wired networks**. Your mobile users are on a **5G network**. So a request leaves the 5G network, crosses the traditional wired network, reaches your application, and comes back the same way.

For a **mobile-only application**, you may not want that. You want your users on 5G *and* your application on 5G, so that **data never leaves the 5G network**.

That is what **AWS Wavelength** is for: hosting your application **inside the 5G/telecom network** itself.

> **Use case in one line:** a mobile-only application, users arriving over 5G, and a requirement that traffic stays within the 5G network.

---

## AWS Outposts

Recall the three cloud types — **private**, **public** and **hybrid** — and that **hybrid is the most popular**, mixing private and public cloud connected together.

It is easy to *say* "two infrastructures connected together". The hard part is **managing them**.

Your private cloud uses one set of tools and one management system. Your public cloud uses the **AWS console**. So you end up needing:

- **Two kinds of expert** on staff
- **Two completely different infrastructures** to operate

That is genuinely difficult, and it is the problem **AWS Outposts** solves.

---

## How Outposts Works

**AWS ships you physical hardware** — a rack — for your own data centre or private cloud. The crucial part:

> **You manage that hardware from the AWS console**, exactly like your cloud resources.

So you get the advantages of hybrid cloud without running two toolchains. One console manages both your AWS infrastructure and the AWS-supplied hardware sitting in your building.

---

## Where These Fit

| Component | Purpose |
|---|---|
| **Region** | Geographical boundary — latency and data residency |
| **Availability Zone** | Inside a region — high availability |
| **Local Zone** | Outside a region — low latency for distant users |
| **Wavelength** | Inside 5G/telecom networks — mobile-only applications |
| **Outposts** | AWS hardware in **your** data centre — hybrid cloud, one console |

> One piece of the global infrastructure remains: **edge locations**. Those need the concept of a CDN first, which is the next topic.
`,
    },
    {
      id: "aws-edge-locations",
      title: "Global Infrastructure – Edge Locations & CDN",
      shortDesc: "How OTT streaming avoids buffering, edge caching, and regional edge caches",
      visuals: ["EdgeCacheHierarchy", "CDNEdge"],
      content: `## Start With a Question You Have Already Noticed

You watch films on OTT platforms. You get **4K quality**, and for months or years now there has been **no buffering**.

Is that automatic? **No.** OTT and streaming platforms — and YouTube, and Facebook — implemented a technology called **CDN**.

**CDN stands for Content Delivery Network.** What it does: **cache content close to the user**.

---

## Why Caching Works for This Content

The content being cached is **static content** — content you are not changing. A film on an OTT platform is fixed; nobody is editing it. So it can safely be copied from the main **origin** out to locations near users.

**A concrete example.** You live in Gujarat. Netflix keeps its films in a data centre in **Mumbai** — that is the **origin**. Pulling traffic directly from Mumbai means distance, which means time, which means you may not get high-quality video.

So instead: the platform runs a **CDN** near you. Of films A, B and C at the origin, the one you are watching — **B** — gets **cached** near you. Frequently that nearby location is **your own internet service provider**, because CDN operators strike deals with ISPs to cache content in their facilities.

Now when you watch, **you never send a request to Mumbai**. You get the film from a nearby location over your high-speed ISP connection — hence the excellent quality.

---

## The Problem for Everyone Else

Every OTT platform uses a CDN. But building one is only realistic for **giants** — Facebook, Google/YouTube, the big streaming services. They can convince an ISP to host their infrastructure.

Now imagine a small business approaching an ISP asking to build a CDN in their infrastructure. **They will not be convinced.** The company is too small.

**AWS edge locations solve exactly this.** AWS runs the CDN network; you simply use it.

---

## Edge Locations in Practice

Say your business is in India, so your **origin** is in India. Indian users are fine — origin and users are in the same country.

But you also have users in the **USA**. Their requests travel **13,000 km** each way. Delay.

You have two options:

- **Deploy the whole application in the USA as well.** Expensive — and most of your users are in India. You have only a few US users.
- **Cache the static parts** — videos, learning material — near those US users.

With edge locations, content from your origin is **cached at edge locations in the USA**. US users no longer travel to India; they reach a **nearby edge location** instead. Users in another state hit *their* nearest edge location.

**AWS has 350+ edge locations worldwide**, so this works everywhere, not just the USA. You need no ISP negotiation and no CDN of your own — it is ready to use.

> You configure all of this through a specific service: **AWS CloudFront**. There is a full section on it later.

---

## Regional Edge Caches — The Second Layer

Edge locations came first. Then AWS acted on user feedback and added another layer: **regional edge caches**.

Here is the gap they fill. You request a video, so you hit an edge location — but **that edge location does not have it**. Without another layer, the request goes all the way to the **origin**.

Why would an edge miss? Two reasons:

- If you are **constantly adding new content**, every new item must be cached at the edge before it can be served from there.
- **Edge locations have low storage capacity.** They cannot hold everything.

And if lots of US requests reach the origin, **the origin may not cope**.

So AWS added the regional edge cache: a **much larger** cache holding far more content. Now when an edge location misses, the request goes to the **regional edge cache** instead of the origin. If the content is there — and usually it is — **the origin is never touched**, and stays free to do other work.

---

## The Size Difference Explains the Count

| Layer | Roughly how many | Size |
|---|---|---|
| **Edge location** | **350+** | Small cache, close to users |
| **Regional edge cache** | **~13** | Much larger cache |

**One regional edge cache serves many edge locations** — which is exactly why there are so few of them. Their job is to cache as much origin data as possible, so that user requests are never forwarded to your origin.
`,
    },
  ],
};
