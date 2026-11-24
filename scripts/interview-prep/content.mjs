// Simple-English rewrite. Short sentences, common words, every term explained
// the first time it is used, and a full spoken answer wherever the reader has
// to say something out loud.

export const glossary = [
  ["AWS account", "A separate box that holds your cloud things. Each account has its own bill and its own users. One company can have many accounts."],
  ["Region", "A part of the world where AWS has data centres, like Mumbai or Singapore. You pick one. Your data stays there."],
  ["Availability Zone (AZ)", "One or more data centres inside a Region. A Region has several. If one AZ fails, the others keep working."],
  ["VPC", "Your own private network inside AWS. Like having your own office network, but in the cloud."],
  ["Subnet", "A smaller part of a VPC. A public subnet can reach the internet. A private subnet cannot."],
  ["EC2", "A virtual computer you rent from AWS. You choose the size and you manage the operating system."],
  ["Lambda", "You give AWS a small piece of code. AWS runs it when something happens. You do not manage any server."],
  ["S3", "A place to store files. You put files in and take files out. It does not run code."],
  ["RDS", "A managed SQL database, like MySQL or PostgreSQL. AWS does the backups and the patching for you."],
  ["DynamoDB", "A NoSQL database. It is very fast if you always look things up the same way. It is bad for complex searches."],
  ["IAM", "The part of AWS that decides who can do what. IAM means Identity and Access Management."],
  ["IAM role", "A set of permissions that a service or a person can borrow for a short time. Better than a password, because it expires."],
  ["NAT Gateway", "A thing that lets servers in a private subnet reach the internet. AWS charges you per hour and also per GB of data."],
  ["VPC endpoint", "A private door from your VPC straight to an AWS service. Traffic does not go to the internet, so you do not pay NAT charges."],
  ["ECS", "A service that runs containers for you. You tell it what to run and how many copies."],
  ["Fargate", "A way to run containers without managing any servers. You pay for the CPU and memory you ask for."],
  ["ECR", "A place to store container images, so ECS can pull them and run them."],
  ["Container", "An application packed with everything it needs to run. It starts fast and runs the same everywhere."],
  ["Glue", "An AWS service that cleans and changes data. It can also look at your files and work out their shape."],
  ["Athena", "A service that runs SQL queries on files in S3. You pay for the amount of data each query reads."],
  ["Parquet", "A file format for data. It stores data by column, and it is compressed. Queries read fewer bytes, so they cost less."],
  ["Bedrock", "AWS's service for using AI models. Your data stays inside AWS."],
  ["LLM", "Large Language Model. The AI that reads text and writes text, like Claude or GPT."],
  ["RAG", "Retrieval Augmented Generation. You search your own documents first, then give the AI only what you found, and ask it to answer using that."],
  ["Embedding", "Text turned into a list of numbers. Two pieces of text with similar meaning get similar numbers. This is how search by meaning works."],
  ["Vector store", "A database that holds embeddings and finds the closest ones quickly."],
  ["Prompt", "The text you send to an AI model, including your instructions and any information you want it to use."],
  ["CloudTrail", "A record of every action taken in your AWS account. Who did what, and when."],
  ["AWS Config", "A service that watches your resources and tells you when something does not follow your rules."],
  ["SCP", "Service Control Policy. A rule at the top of your organisation that blocks certain actions in the accounts below it."],
  ["Control Tower", "An AWS service that sets up many accounts for you, with rules and logging already in place."],
  ["Landing zone", "The finished multi-account setup: the accounts, the rules, the logging and the sign-in. Control Tower builds one for you."],
  ["CDC", "Change Data Capture. While you copy a database, CDC keeps sending the new changes too, so the copy stays up to date."],
];

export const approach = {
  intro:
    "An interviewer will often ask: how do you start a project? They are not asking for the name of a method. They want to see two things. First, that you follow the same steps every time. Second, that you know which choices are hard to change later, and that you make those choices carefully.\n\nBelow are five steps. Learn the order. Then practise saying each one out loud using one of your own projects as the example.",
  phases: [
    {
      name: "Step 1 — Ask questions before you design anything",
      goal: "Find out the limits you have to work inside.",
      does: [
        "Who will use this, how many people, and when are they busiest?",
        "If the system stops working, how long can it stay down? One hour? One minute?",
        "If something breaks, how much data can we afford to lose? None? Five minutes of it?",
        "What kind of data is it? Personal details and money data have legal rules.",
        "How much money can we spend each month?",
        "What systems already exist that we must connect to?",
      ],
      whyItMatters:
        "The two downtime questions matter most. A system that can be down for four hours is much cheaper and much simpler than one that must never stop. If you design before you know this number, you will design the wrong thing.",
      says:
        "Before I draw any design, I ask two questions. How long can this system be down? And how much data can we lose if it crashes? These two answers change the design more than the features do. A system that can be down for four hours is a simple system. A system that must never stop needs copies in more than one place, and that costs much more. So I get those numbers first, then I design.",
    },
    {
      name: "Step 2 — Decide the hard-to-change things first",
      goal: "Spend your thinking time on choices you cannot undo easily.",
      does: [
        "How the data is stored and shaped. This is the hardest thing to change later.",
        "How the accounts and the network are set up. Changing network addresses later is painful.",
        "Who is allowed to do what. Adding security later almost never happens properly.",
        "How the parts of the system talk to each other, so different people can build different parts at the same time.",
        "Leave for later: server sizes, scaling numbers, small tuning. These are easy to change.",
      ],
      whyItMatters:
        "Some choices can be changed in an afternoon. Others take months. Put your effort into the second kind.",
      says:
        "I split decisions into two types. Easy to change, and hard to change. The data model is hard to change, because once real customer data is in it, you cannot just start again. The network layout is hard to change. Who can access what is hard to add later. So I spend my design time on those. Server sizes and scaling rules are easy to change, so I pick something sensible and fix it later with real numbers. Deciding those early just means deciding them with less information.",
    },
    {
      name: "Step 3 — Build one thin path first",
      goal: "Prove the risky parts work before building everything.",
      does: [
        "Build the smallest version that touches every layer, from the screen to the database, and put it in the cloud.",
        "Write your infrastructure as code from day one, not later.",
        "Set up automatic deployment early, before you add the second feature.",
        "Add logging and monitoring as you build, not at the end.",
      ],
      whyItMatters:
        "Most nasty surprises are in the joins between parts: permissions, networking, and connections. A thin path finds them in week one instead of week six.",
      says:
        "The first thing I build is one thin path that goes through every layer. For example, one request that goes from the app, to the API, to the database, and back. Then I deploy it properly. It does almost nothing useful, but it proves the hard parts work: the permissions, the network, and the connections between services. Most problems hide there. If I build lots of features first and only deploy at the end, I find those problems very late, and late problems are expensive.",
    },
    {
      name: "Step 4 — Test it against the real numbers",
      goal: "Prove it works in a way the business can check.",
      does: [
        "Test with the busiest load you found in step 1, not a random number.",
        "Break things on purpose: stop a server, turn off an AZ, let a password expire.",
        "If you moved data, count the rows on both sides and compare the totals.",
        "Check the cost before you launch, not after the first bill.",
      ],
      whyItMatters:
        "A green dashboard only shows that your system is running. It does not show that the answers are correct.",
      says:
        "A green dashboard is not proof. For anything that moves data, I check in three ways. First, the tool's own check. Second, my own SQL: count the rows in both places and compare the totals of the important columns. Third, a business check: I ask the finance team to run the same report on the old system and the new system for the same month. When those two numbers match, everyone agrees the migration worked. A technical tick does not convince people. A matching revenue number does.",
    },
    {
      name: "Step 5 — Hand it over so others can run it",
      goal: "Make sure someone who was not there can look after it.",
      does: [
        "Write a short guide for each failure you caused during testing.",
        "Set alerts that a named person will actually receive, and say what they should do.",
        "Tag the resources so each team can see its own cost.",
        "Write down the choices you made, and also the ones you rejected and why.",
      ],
      whyItMatters:
        "Six months later, someone will ask why you did not use a different service. If you wrote down the reason, the team does not have to argue about it again.",
      says:
        "At the end I write down the decisions, including the options we did not pick and why. Six months later somebody always asks why we did not use some other service. If the reason is written down, the team reads it and moves on. If it is not written down, the team spends a week discussing it again. I also write a short guide for each failure we tested, so the person on call knows what to do.",
    },
  ],
  management: [
    ["Keep a risk list everyone can see", "Write each risk, who owns it, and the date. A risk that only lives in your head is not being managed."],
    ["Agree what 'finished' means, in writing", "Do this at the start. Most arguments at the end happen because nobody wrote this down at the beginning."],
    ["Show working software every week", "A weekly demo shows misunderstandings early. A written status report hides them."],
    ["Escalate a decision, not a worry", "Say: here is the choice, here are the two options, I need an answer by Friday. That is useful. Saying 'I am worried' is not."],
    ["Share bad news early", "If the date is slipping, say it while there is still time to do something."],
  ],
};

export const controlTower = {
  what:
    "AWS Control Tower is a service that sets up many AWS accounts for you, with rules and logging already switched on. You do not run your applications inside Control Tower. It builds the structure that your applications sit inside. That structure is called a landing zone.",
  simple:
    "Think of it like a school building. Control Tower is the builder. The landing zone is the finished building: the classrooms, the locked doors, the CCTV, and the register at the front desk. Your applications are the lessons that happen in the classrooms.",
  why: [
    ["If something breaks, it breaks in one place only", "Each account is separate. A mistake or a hacked account cannot reach the other accounts. This is the reason security teams like it."],
    ["You can see who spent what", "Each account gets its own bill. You do not have to guess which team spent the money."],
    ["One team cannot use up the limits", "AWS puts limits on how many things you can create. These limits are per account. So a busy team cannot block another team."],
    ["Production access can really be different", "Developers can have full access in the test account and read-only in production. This is a real block, not just a rule in a document."],
  ],
  builds: [
    ["AWS Organizations", "The structure that holds all your accounts in groups. A group is called an OU, which means Organizational Unit."],
    ["Log Archive account", "One account that stores the logs from all the other accounts. Normal teams cannot delete anything from it."],
    ["Audit account", "An account for the security team. From here they can look at all the other accounts, but only read."],
    ["IAM Identity Center", "One sign-in page for all accounts. People log in once and pick which account to use."],
    ["Controls, also called guardrails", "The rules. Some block actions. Some only report problems. Some check before you deploy."],
    ["Account Factory", "A standard way to create a new account that already has all the rules applied."],
  ],
  setup: [
    ["Step 1 — Get ready", "You need a clean management account. If the accounts you want to add already have CloudTrail or AWS Config set up by hand, that will clash, so sort it out first. Pick your home region carefully, because this is where the landing zone lives and moving it later is a big job."],
    ["Step 2 — Start the landing zone", "In the management account, open Control Tower and choose 'Set up landing zone'. You pick the home region, the regions you want to govern, and the names for the Log Archive and Audit accounts. It takes about an hour. When it finishes you have a Security OU and two new accounts."],
    ["Step 3 — Set up the logging", "Choose how long to keep the CloudTrail and Config logs in the Log Archive account. Make sure normal accounts can write logs there but cannot delete them. If a hacker can delete the logs, the logs are not evidence."],
    ["Step 4 — Design your groups (OUs)", "Do not put every account in one group. A common setup is: Security (Log Archive and Audit), Infrastructure (shared networking), Workloads split into Production and Non-Production, Sandbox for learning with a spending limit, and Suspended for old accounts that are switched off."],
    ["Step 5 — Set up sign-in", "Turn on IAM Identity Center. Connect your company sign-in system, such as Microsoft Entra ID or Okta. Then make permission sets, which are named sets of permissions like ReadOnly, Developer and Admin. Give them to groups of people, never to one person at a time."],
    ["Step 6 — Turn on the rules", "Some rules are switched on for you and cannot be removed. Then you turn on the recommended ones. Then you add your own per group. For example, block all regions except the ones you approved, or block public S3 buckets in the Production group."],
    ["Step 7 — Create accounts", "Use Account Factory to make new accounts. They arrive with the rules already applied. If you want account creation to go through a code review, use Account Factory for Terraform, which is often shortened to AFT."],
    ["Step 8 — Add your own standard setup", "Customizations for Control Tower, shortened to CfCT, lets you add your own things to every new account automatically. For example a standard VPC, your security agent, or VPC endpoints."],
    ["Step 9 — Keep watching", "Control Tower tells you when an account has 'drifted'. Drift means somebody changed something by hand and the account no longer matches the rules. Fix it, and also ask why they did it. If people keep working around a rule, the rule may be wrong."],
  ],
  landingZone: [
    ["How many accounts?", "A common starting point is one account for each application in each environment. So a shop would have shop-production and shop-test. Ask yourself where you want a hard wall, because the account is the strongest wall AWS gives you."],
    ["Network", "Put the shared network in one Infrastructure account. Use Transit Gateway as the central hub, and connect each account's VPC to it. Use IPAM to hand out IP ranges so that no two VPCs use the same numbers."],
    ["Sign-in", "Use IAM Identity Center with permission sets linked to your company groups. Do not create IAM users with passwords inside each account."],
    ["Logging", "Send CloudTrail, Config and VPC Flow Logs from every account into the Log Archive account. Do this on day one. Setting it up after a security incident is too late."],
    ["Rules", "Put SCPs on the group, not on each account. Block unapproved regions. Block turning off CloudTrail. Block using the root user."],
    ["Cost", "Use one bill for the whole organisation. Make tagging compulsory. Give each group a budget with an alert."],
  ],
  inProject: [
    ["Kosh — the credit chatbot", "Credit data has legal rules. So production gets its own account, in a group with rules that block other regions and force encryption. All the decision records go to the Log Archive account, where nobody on the team can delete them. That is exactly what an auditor asks to see."],
    ["Airworks — the cost work", "Having separate accounts is what made the cost problem findable. The bill showed which team's account the NAT charges came from. Without separate accounts it would have been one large number with no owner."],
    ["EDF — the data work", "Put the data lake in its own account. Analysts stay in their own accounts and are given permission to read. The data stays in one place instead of being copied around."],
    ["WeCredit — the migration", "Build the landing zone first, then move the applications into it. Moving everything into one messy account and trying to add Control Tower afterwards is much more work."],
  ],
  questions: [
    ["What is the difference between Control Tower and a landing zone?",
     "They want to check you are not just repeating a product name.",
     "A landing zone is the result. It is a set of AWS accounts with logging, sign-in and rules already set up. Control Tower is the AWS service that builds that result for you and keeps it correct. You can build a landing zone by hand using AWS Organizations, SCPs and CloudFormation, and some large companies do, because they need something very specific. Control Tower is the standard, supported way to get the same thing without building it yourself."],
    ["Why use many accounts instead of one account with several VPCs?",
     "They want to hear more than 'it is best practice'.",
     "There are four reasons. First, if one account is hacked or someone makes a mistake, it cannot reach the other accounts. Second, each account has its own bill, so you know which team spent the money without relying on tags. Third, AWS limits are counted per account, so one busy application cannot use up the limits another one needs. Fourth, you can really give different access to production and test, instead of just writing a policy document. Separate VPCs give you none of these. A VPC is only a network wall."],
    ["What are guardrails, and what types are there?",
     "They want to know if you understand when each type acts.",
     "Guardrails are now called controls. There are three types, and the important thing is that they act at three different moments. A preventive control is an SCP. It blocks the action, so the API call simply fails and nothing is created. A detective control is an AWS Config rule. It lets the action happen, then checks it afterwards and reports anything that breaks the rule. A proactive control is a CloudFormation hook. It checks your template before anything is deployed. I use preventive controls for things that must never happen, like turning off CloudTrail. I use detective controls where blocking everything would stop people doing their work."],
    ["How do you decide the OU structure?",
     "They want to see that you have thought about it, not copied a diagram.",
     "I do not make it flat, and I do not copy the company org chart. If I copy the org chart, then every time the company reorganises, I have to move accounts around. Instead I group by environment and by risk. Security holds Log Archive and Audit. Infrastructure holds shared networking. Workloads is split into Production and Non-Production, so I can put stricter rules on production. Sandbox has a hard spending limit for people who are learning. Suspended holds old accounts with a rule that blocks everything. The real question behind OU design is: which accounts need different rules? Accounts that need the same rules go in the same group."],
    ["What is Account Factory?",
     "They want to know if you have created accounts, or only read about it.",
     "Account Factory is the part of Control Tower that creates new accounts. The new account arrives already in the right group, with the rules and the logging already applied, so nobody has to remember to set them up. There is also Account Factory for Terraform, called AFT. With AFT, creating an account is a pull request that someone reviews, instead of somebody clicking buttons in the console. That is better once more than two or three people are allowed to create accounts."],
    ["What is drift and how do you deal with it?",
     "They want to see that you think about people, not only settings.",
     "Drift is when an account stops matching the setup Control Tower expects. For example, somebody deletes a Config recorder, or removes an SCP by hand. Control Tower notices and reports it. The technical fix is to repair or re-enrol the account. But if the same drift keeps happening, I also ask why. Usually it means a rule is stopping people from doing their job, and they are working around it. Then the right fix is to change the rule, not to keep reverting the account."],
    ["Can you add Control Tower to accounts that already exist?",
     "They want to know if you understand the practical pain.",
     "Yes. You enrol the existing accounts. But it is harder than starting fresh. The accounts usually already have their own CloudTrail trails and Config recorders, and these clash with the ones Control Tower wants to create. Sorting that out means changing things in accounts that are already live, which needs care and a maintenance window. This is the main reason I say: build the landing zone first, then move workloads into it."],
    ["You join a company and inherit a landing zone. What do you check first?",
     "They want to know what you consider most dangerous.",
     "Three things, in this order. First, the IP address ranges. If two VPCs use the same range, they cannot be connected through Transit Gateway, and fixing it once applications are live is very expensive. Second, whether the logs really go to a separate account that normal teams cannot delete from. Third, whether there are any IAM users with long-lived access keys, because those are the ones that leak. Those three cause most of the trouble in setups I have inherited."],
  ],
};

export const crossCutting = [
  {
    theme: "Cost",
    qa: [
      ["You get an AWS account you have never seen. The bill is too high. What do you do?",
       "They want a method, not a list of tips.",
       "I measure before I change anything. First I open Cost Explorer to see the shape: which services cost the most, which accounts, and what is growing. That tells me where to look, but not why. Then I query the Cost and Usage Report in Athena, because that has the detailed lines and Cost Explorer groups things too roughly. Once I know the cause, I start with fixes that do not need any application change: VPC endpoints instead of NAT, deleting unused disks and old snapshots, moving files to cheaper storage classes. Right-sizing comes next because it needs the owners to agree. Savings Plans come last, because you should only promise to spend money once you know your steady usage."],
      ["Where are the big savings usually?",
       "They want to know if you have actually done this.",
       "Usually in this order. First, things nobody is using: unattached disks, idle load balancers, old snapshots. Second, NAT Gateway data charges, which surprise people most often. Third, servers that are bigger than they need to be. Fourth, old files sitting in expensive storage. Fifth, commitment discounts like Savings Plans. I go in that order because it is also the order of least arguing. Deleting an unused disk needs nobody's permission. Resizing somebody's server needs a conversation."],
    ],
  },
  {
    theme: "Security",
    qa: [
      ["How do you handle passwords and API keys?",
       "They want to hear 'roles' not 'environment variables'.",
       "I keep secrets in AWS Secrets Manager or Parameter Store. Never in the code, never in a Git repository, and never baked into a container image. I turn on automatic rotation where the service supports it. But the better answer is to have no password at all. If the code runs inside AWS, it can use an IAM role. The role gives short-lived credentials that AWS refreshes automatically, and there is nothing to leak. Most secrets exist because somebody reached for a key when a role would have worked."],
      ["How do you actually apply least privilege?",
       "They want a practical method, not the definition.",
       "I do not start by writing a policy by hand, because people then add a wildcard to make it work. I start by letting the application run with wider permissions in a test account, and then use IAM Access Analyzer. It reads CloudTrail and generates a policy containing only the actions that were really used. That becomes my starting point, and I trim it. I use roles instead of users, permission boundaries when teams create their own roles, and SCPs for rules that must apply to the whole organisation."],
    ],
  },
  {
    theme: "AI and RAG",
    qa: [
      ["When would you not use RAG?",
       "They want to see that you do not use AI for everything.",
       "Three cases. First, when the information is small and does not change. Then you can just put it in the prompt, and searching first is wasted work and extra cost. Second, when the task is thinking rather than remembering. Retrieval does not help a model reason. Third, and most important, when the answer must be exact, like a credit score or a tax calculation. Then you should use a normal database query or normal rules, because they give the same answer every time and you can show your working. Knowing when not to use AI is usually what this question is really testing."],
      ["What is the difference between RAG and fine-tuning?",
       "A very common question. Answer it with 'facts versus behaviour'.",
       "RAG is for facts. You search your documents, give the model what you found, and it answers using that. If a document changes, the answer changes immediately, and you can show which document the answer came from. Fine-tuning is for behaviour: the tone, the format, the style of writing. You should not use fine-tuning to teach facts. Once a fact is inside the model's weights, you cannot update it cheaply and you cannot point at a source. For anything that has to be checked or audited, that rules it out."],
      ["How do you know if your AI feature is any good?",
       "They want to hear about measurement, not opinion.",
       "I build a test set: a fixed list of questions where I already know the correct answers. I run it before and after every prompt change or model change. For RAG I score two things separately. Did the search find the right document? And did the model use that document correctly? I keep them separate because the fixes are completely different. If the search failed, I fix chunking or the search method. If the search worked but the answer was wrong, I fix the prompt. Without a test set you are just changing prompts and hoping, and you cannot tell improvement from damage."],
    ],
  },
  {
    theme: "When you do not know the answer",
    qa: [
      ["What should you say when you do not know?",
       "This is the most useful skill in the whole interview.",
       "Say three things. What you do know. What you would check. How you would decide. For example: 'I have not used that service in production. I know it sits between a data stream and a destination and does calculations over time windows. Before choosing it I would compare it with doing the same thing in a Lambda function, and I would compare on cost and on how much we would have to operate ourselves.' That sounds like someone who can think. Guessing with confidence and being wrong is the only answer that really damages you, because then the interviewer cannot trust anything else you said."],
    ],
  },
];

export const redFlags = [
  ["Describing the diagram but not the reason", "The interviewer can see the diagram. They want to know why you chose this and not something else."],
  ["Using a number you cannot explain", "If you say thirty percent, they will ask: thirty percent of what, and over how long? Know the answer or do not use the number."],
  ["Saying the project went perfectly", "Nobody believes this. One real problem, explained well, makes your whole story more believable."],
  ["Saying 'we' for everything", "Say clearly what you did yourself. If you claim too much, the next detailed question will expose it."],
  ["Naming a tool instead of answering", "'We used LangChain' does not answer 'how did you stop wrong answers'. Say the actual method."],
  ["Defending an old choice you no longer agree with", "It is stronger to say: it was right for the situation then, and today I would do it differently because of X."],
];
