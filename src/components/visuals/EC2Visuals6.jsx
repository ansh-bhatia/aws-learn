import { useState } from "react";
import LabStepper from "./_LabStepper";
import "./EC2Visuals.css";
import "./EC2Visuals4.css";
import "./EC2Visuals6.css";

/* ─── 1. PURCHASE OPTIONS COMPARISON MATRIX ────────────────────────── */
export function PurchaseOptionsMatrix() {
  const [row, setRow] = useState("saving");

  const cols = [
    { key: "ondemand", name: "On-Demand" },
    { key: "spot", name: "Spot" },
    { key: "standard", name: "Reserved\nStandard" },
    { key: "convertible", name: "Reserved\nConvertible" },
    { key: "scheduled", name: "Reserved\nScheduled" },
    { key: "savingEc2", name: "Savings Plan\nEC2" },
    { key: "saving", name: "Savings Plan\nCompute" },
  ];

  const rows = {
    pricing: {
      label: "Pricing model",
      vals: { ondemand: "Pay as you go", spot: "Bidding", standard: "Commitment", convertible: "Commitment", scheduled: "Commitment", savingEc2: "Commitment", saving: "Commitment" },
    },
    commitment: {
      label: "Commitment",
      vals: { ondemand: "None", spot: "None", standard: "1 or 3 yr", convertible: "1 or 3 yr", scheduled: "1 yr only", savingEc2: "1 or 3 yr", saving: "1 or 3 yr" },
    },
    saving: {
      label: "Cost saving vs On-Demand",
      vals: { ondemand: "—", spot: "90%", standard: "72%", convertible: "70%", scheduled: "—", savingEc2: "72%", saving: "63%" },
    },
    interrupt: {
      label: "Can AWS interrupt you?",
      vals: { ondemand: "no", spot: "yes", standard: "no", convertible: "no", scheduled: "no", savingEc2: "no", saving: "no" },
    },
    size: {
      label: "Change instance size?",
      vals: { ondemand: "n/a", spot: "n/a", standard: "yes", convertible: "yes", scheduled: "no", savingEc2: "yes", saving: "yes" },
    },
    family: {
      label: "Change family (t2 → c5)?",
      vals: { ondemand: "n/a", spot: "n/a", standard: "no", convertible: "yes", scheduled: "no", savingEc2: "no", saving: "yes" },
    },
    compute: {
      label: "Change compute (EC2 → Lambda)?",
      vals: { ondemand: "n/a", spot: "n/a", standard: "no", convertible: "no", scheduled: "no", savingEc2: "no", saving: "yes" },
    },
    os: {
      label: "Change OS?",
      vals: { ondemand: "n/a", spot: "n/a", standard: "no", convertible: "yes", scheduled: "no", savingEc2: "yes", saving: "yes" },
    },
    region: {
      label: "Change region?",
      vals: { ondemand: "n/a", spot: "n/a", standard: "no", convertible: "no", scheduled: "no", savingEc2: "no", saving: "yes" },
    },
    tenancy: {
      label: "Change tenancy?",
      vals: { ondemand: "n/a", spot: "n/a", standard: "no", convertible: "no", scheduled: "no", savingEc2: "no", saving: "yes" },
    },
  };

  const cls = (v) => {
    if (v === "yes") return "yes";
    if (v === "no") return "no";
    if (v === "n/a" || v === "—") return "na";
    return "txt";
  };

  return (
    <div className="viz-card">
      <div className="viz-title">💰 EC2 Purchase Options — Full Comparison</div>
      <p className="ifam-intro">
        Getting this right can save your company up to <strong>80%</strong>. Pick a row to compare all seven
        options on that dimension.
      </p>

      <div className="po-rowpicker">
        {Object.keys(rows).map((k) => (
          <button key={k} className={`po-rowbtn ${row === k ? "active" : ""}`} onClick={() => setRow(k)}>
            {rows[k].label}
          </button>
        ))}
      </div>

      <div className="po-matrix">
        {cols.map((c) => {
          const v = rows[row].vals[c.key];
          return (
            <div key={c.key} className={`po-cell ${cls(v)}`}>
              <div className="po-cell-name">{c.name}</div>
              <div className="po-cell-val">
                {v === "yes" ? "✅" : v === "no" ? "❌" : v}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ifam-note">
        {row === "compute" &&
          "Only the COMPUTE savings plan lets your commitment cover EC2, Lambda AND Fargate. This is the flexibility that has made reserved instances far less popular."}
        {row === "interrupt" &&
          "Spot is the only option AWS can reclaim. That is why it is never your primary instance — it adds a fleet of extra capacity alongside your main instances."}
        {row === "commitment" &&
          "Scheduled reserved instances are the exception: 1 year only, never 3."}
        {row === "saving" &&
          "Reserved and EC2 savings plans price on 24/7 usage. If you only run 8 hours a day, on-demand may genuinely be cheaper."}
        {!["compute", "interrupt", "commitment", "saving"].includes(row) &&
          "Notice the pattern: flexibility increases left to right, and the compute savings plan is the only option that says yes to everything."}
      </div>
    </div>
  );
}

/* ─── 2. THE HOTEL ANALOGY ─────────────────────────────────────────── */
export function HotelAnalogy() {
  const [sel, setSel] = useState("ondemand");

  const options = {
    ondemand: {
      name: "On-Demand",
      icon: "🛎️",
      story: "You walk into the hotel and say: I want a room right now. You do not care whether they have capacity. Whatever price they quote, you pay it — and you pay for every minute you stay, whether that is one hour or three days.",
      who: "The hotel sets the price.",
    },
    spot: {
      name: "Spot",
      icon: "🏷️",
      story: "You know the hotel has empty rooms. You say: I will pay $1 per hour — I know your rate is $10, but give it to me at mine. They agree, because the room is empty anyway. The catch: management decides when you leave. If a coach party arrives, you are asked to vacate.",
      who: "YOU set the price. They decide when you leave.",
    },
    reserved: {
      name: "Reserved",
      icon: "🔑",
      story: "You book the room for one or three years, 24/7, paying in advance. The hotel gives you a substantial discount for the commitment — and the room is reserved for you the whole time, whether you sleep in it or not.",
      who: "Commitment buys the discount.",
    },
    saving: {
      name: "Savings Plan",
      icon: "💳",
      story: "Instead of reserving a specific room, you commit to SPENDING a fixed amount — say $100,000 over three years. Now you can take a normal room, a premium room or a suite. You can change hotels. You can change city. You just have to spend what you promised.",
      who: "Commit to spend, not to a specific room.",
    },
  };

  const o = options[sel];

  return (
    <div className="viz-card">
      <div className="viz-title">🏨 The Hotel Analogy</div>
      <p className="ifam-intro">
        Every purchase option maps cleanly onto booking a hotel room. This is the fastest way to keep them
        straight.
      </p>

      <div className="ntr-toggle">
        {Object.keys(options).map((k) => (
          <button key={k} className={`ntr-btn ${sel === k ? "active" : ""}`} onClick={() => setSel(k)}>
            {options[k].icon} {options[k].name}
          </button>
        ))}
      </div>

      <div className="po-hotel">
        <div className="po-hotel-icon">{o.icon}</div>
        <div>
          <p className="po-hotel-story">{o.story}</p>
          <div className="po-hotel-who">{o.who}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── 3. LAB — WINDOWS INSTANCE ────────────────────────────────────── */
export function WindowsInstanceLab() {
  return (
    <LabStepper
      accent="viz"
      title="🧪 Lab — Launch Your First Windows Instance"
      intro="Create a Windows Server instance, connect over RDP, and set a permanent password so you stop decrypting one every time."
      steps={[
        {
          label: "1 · Region",
          screen: "Console → EC2",
          detail: [
            "Search for EC2 in the console — described as 'virtual servers in the cloud'.",
            "Change the region from N. Virginia to Mumbai (or whichever you want).",
            "The dashboard should show 0 running instances.",
            "Click Launch instance.",
          ],
        },
        {
          label: "2 · Name & AMI",
          screen: "Launch instance → Name and AMI",
          detail: [
            "Give it a name, e.g. my-new-windows-EC2.",
            "Click Browse more AMIs and filter to Windows.",
            "Choose Microsoft Windows Server 2019 Base.",
          ],
          warn: "The AMI MUST show the Free tier eligible tag. An image such as Windows Server with SQL Server pre-installed has no such tag — select it and you will be charged.",
        },
        {
          label: "3 · Instance type",
          screen: "Instance type",
          detail: [
            "Options range from 1 vCPU / 1 GB RAM up to 96 vCPU / 192 GB RAM.",
            "Select t2.micro — 1 vCPU, 1 GB RAM.",
            "That is enough for learning, and it is free tier.",
          ],
        },
        {
          label: "4 · Key pair",
          screen: "Key pair (login)",
          detail: [
            "The key pair authenticates you to the server — it is your key to get in.",
            "Click Create new key pair and name it, e.g. cloud-fox-key.",
            "Choose RSA and the .pem format.",
            "Click Create key pair — it downloads immediately. Save it in your Downloads folder.",
          ],
          warn: "You CANNOT download this key later. Lose it and there is no way into the instance. One key can serve many instances, or you can create one per instance.",
        },
        {
          label: "5 · Network",
          screen: "Network settings",
          detail: [
            "Click Edit. Under Subnet, choose ap-south-1a — otherwise AWS picks an AZ for you.",
            "Leave Auto-assign public IP enabled; that public IP is how you will reach the instance.",
            "A security group is created automatically — you cannot launch without one. Rename it if you like, e.g. my-SG.",
            "For a Windows instance it allows RDP (port 3389) by default. You can restrict the source to My IP, or leave it as anywhere.",
          ],
        },
        {
          label: "6 · Storage",
          screen: "Configure storage",
          detail: [
            "Windows gets a 30 GB root volume — the volume the OS is installed on.",
            "This is the same idea as the drive with the Windows logo on your own PC.",
            "A Linux instance would get 8 GB instead, because there is no GUI overhead.",
            "Leave it as-is and set Number of instances to 1.",
          ],
          note: "If you set this to 2, BOTH instances land in ap-south-1a. To put instances in different AZs you must launch them separately.",
        },
        {
          label: "7 · Connect",
          screen: "Instances → Connect → RDP client",
          detail: [
            "Click Launch instance, then View all instances.",
            "Wait for the state to reach running and the status checks to show 2/2 checks passed.",
            "Select the instance and click Connect → RDP client → Download remote desktop file.",
            "Click Get password → Upload private key file → select your .pem → Decrypt password.",
            "Copy the password, open the downloaded RDP file, log in as administrator.",
          ],
          note: "Getting the password can take up to four minutes after launch. If you forget which key you used, check the instance's 'Key pair assigned at launch' field.",
        },
        {
          label: "8 · Fix the password",
          screen: "Server Manager → Computer Management",
          detail: [
            "Decrypting the password on every connection gets tedious. Set a real one instead.",
            "Inside the instance open Server Manager → Tools → Computer Management.",
            "Go to Local Users and Groups → Users → Administrator.",
            "Right-click → Set Password → Proceed, and set your own.",
            "Next time, save the RDP file once and log in with that password directly.",
          ],
        },
        {
          label: "9 · Clean up",
          screen: "Instance state",
          detail: [
            "Stop = power off the virtual machine. Reboot = restart it.",
            "Terminate = delete it forever.",
            "Select your instance → Instance state → Terminate instance.",
          ],
          warn: "Once terminated there is no way to get it back. Always terminate your instances after finishing a lab.",
        },
      ]}
    />
  );
}

/* ─── 4. LAB — LINUX INSTANCE (SSH + PuTTY) ────────────────────────── */
export function LinuxInstanceLab() {
  const [os, setOs] = useState("modern");

  const shared = [
    {
      label: "1 · AMI",
      screen: "Launch instance → Name and AMI",
      detail: [
        "Name it, e.g. my-first-linux-instance.",
        "Choose Amazon Linux — AWS's own distribution, and the most popular choice here.",
        "Select t2.micro.",
      ],
      note: "The default username depends on the AMI: Amazon Linux → ec2-user, Ubuntu → ubuntu. Windows is always administrator.",
    },
  ];

  const modern = [
    ...shared,
    {
      label: "2 · Key (.pem)",
      screen: "Create key pair",
      detail: [
        "Click Create new key pair, name it e.g. cloud-fox-linux-key.",
        "For Linux you can now pick ED25519 — faster and more secure than RSA. Either works.",
        "Choose the .pem format — this is what the built-in ssh command uses.",
        "Download it to your Downloads folder.",
      ],
      warn: "Always save the key in the default Downloads folder. Storing it elsewhere can leave the file without read-only permissions, which then blocks login.",
    },
    {
      label: "3 · Network",
      screen: "Network settings",
      detail: [
        "Select subnet ap-south-1a and enable auto-assign public IP.",
        "For a Linux instance the security group allows SSH (port 22) by default — the Linux equivalent of RDP.",
        "Root volume is 8 GB for Linux, versus 30 GB for Windows.",
        "Launch the instance.",
      ],
    },
    {
      label: "4 · Connect (ssh)",
      screen: "Command Prompt",
      detail: [
        "Windows 10 and later have ssh built in — no extra software needed.",
        "Open Command Prompt and cd Downloads (normally C:\\Users\\<you>\\Downloads).",
        "Wait for 2/2 checks passed, then copy the instance's public IP.",
        "Run: ssh -i cloud-fox-linux-key.pem ec2-user@<public-ip>",
        "When asked 'Are you sure you want to continue connecting?' type yes in full — not just y.",
      ],
      note: "You get a command line only. Around 90% of Linux use is command line, so this is normal.",
    },
    {
      label: "5 · Clean up",
      screen: "Instance state",
      detail: [
        "Select the instance → Instance state → Terminate instance.",
        "Terminate after every lab.",
      ],
    },
  ];

  const legacy = [
    ...shared,
    {
      label: "2 · Key (.ppk)",
      screen: "Create key pair",
      detail: [
        "Click Create new key pair, name it e.g. win7-linux-key-pair.",
        "RSA or ED25519 both work — the process is identical.",
        "Choose the .ppk format, NOT .pem.",
      ],
      warn: "PuTTY requires .ppk and cannot use a .pem file. This is the one real difference from the modern-Windows path.",
    },
    {
      label: "3 · Network",
      screen: "Network settings",
      detail: [
        "Select subnet ap-south-1a and enable auto-assign public IP.",
        "SSH (port 22) is allowed by default for Linux instances.",
        "Root volume is 8 GB. Launch the instance.",
      ],
    },
    {
      label: "4 · Get PuTTY",
      screen: "putty.org",
      detail: [
        "Windows 7 and 8 have no built-in ssh command, so you need PuTTY.",
        "Search for download putty and take the first result.",
        "Download and install the LATEST version.",
      ],
      warn: "If you already have an old PuTTY installed from years ago, download the current version anyway — a version mismatch will stop you connecting.",
    },
    {
      label: "5 · Connect",
      screen: "PuTTY",
      detail: [
        "Copy the instance's public IP and paste it into Session → Host Name.",
        "Go to Connection → SSH → Auth → Credentials.",
        "Browse to your .ppk private key file and select it.",
        "Click Open, then accept the security alert.",
        "Log in as ec2-user — no password needed, because the key authenticates you.",
      ],
    },
    {
      label: "6 · Clean up",
      screen: "Instance state",
      detail: [
        "You can Stop, Reboot, or Terminate from the instance state menu.",
        "Terminate the instance now that the lab is done.",
      ],
    },
  ];

  return (
    <div>
      <div className="po-osswitch">
        <button className={`ntr-btn ${os === "modern" ? "active" : ""}`} onClick={() => setOs("modern")}>
          💻 Windows 10 / 11 — built-in ssh
        </button>
        <button className={`ntr-btn ${os === "legacy" ? "active" : ""}`} onClick={() => setOs("legacy")}>
          🖥️ Windows 7 / 8 — PuTTY
        </button>
      </div>
      <LabStepper
        accent="viz"
        key={os}
        title={os === "modern" ? "🧪 Lab — Linux Instance from Windows 10/11" : "🧪 Lab — Linux Instance from Windows 7/8 (PuTTY)"}
        intro={
          os === "modern"
            ? "Windows 10 and later ship with an ssh command, so you need no extra software and a .pem key."
            : "Windows 7 and 8 have no ssh command, so you use PuTTY — which needs a .ppk key instead of .pem."
        }
        steps={os === "modern" ? modern : legacy}
      />
    </div>
  );
}

/* ─── 5. LAB — CUSTOM AMI ──────────────────────────────────────────── */
export function CustomAMILab() {
  return (
    <LabStepper
      accent="viz"
      title="🧪 Lab — Build and Use a Custom AMI"
      intro="The brief: create 10 Windows instances, each running a web server and DHCP. Configure one, image it, and launch the rest from that image."
      steps={[
        {
          label: "1 · Base instance",
          screen: "Launch instance",
          detail: [
            "Name it my_server_ami and choose Microsoft Windows Server 2019 Base, t2.micro.",
            "Create a key pair, e.g. ami-key.",
            "In the security group, ADD a rule allowing TCP port 80 from anywhere — you will verify the web server later.",
            "Launch, wait for 2/2 checks, then connect over RDP and decrypt the password as usual.",
          ],
          note: "2019 rather than 2022 purely for speed: t2.micro is modest hardware and 2022 carries more overhead. The steps are identical either way.",
        },
        {
          label: "2 · Install roles",
          screen: "Server Manager → Add Roles and Features",
          detail: [
            "Inside the instance open Server Manager → Add Roles and Features.",
            "Choose Role-based installation and click Next.",
            "Tick DHCP Server, then Add Features.",
            "Tick Web Server (IIS) as well.",
            "Click through Next and then Install.",
          ],
        },
        {
          label: "3 · ⚠️ Password",
          screen: "Server Manager → Tools → Computer Management",
          detail: [
            "This is the step people forget, and it cannot be fixed afterwards.",
            "Open Computer Management → Local Users and Groups → Users → Administrator.",
            "Right-click → Set Password → Proceed, and set a password you will remember.",
          ],
          warn: "Instances launched from a CUSTOM AMI cannot generate a password from a .pem file — Get password will say 'Password not available' forever, no matter how long you wait. You MUST set an administrator password BEFORE creating the image, because that is the only credential the new instances will accept.",
        },
        {
          label: "4 · Verify",
          screen: "Browser + Server Manager → Tools",
          detail: [
            "After installation, check Tools — IIS Manager and DHCP now both appear.",
            "Copy the instance's public IP and open http://<public-ip> in a browser.",
            "The default IIS page loads, confirming the web server works and port 80 is open.",
          ],
        },
        {
          label: "5 · Create image",
          screen: "Actions → Image and templates → Create image",
          detail: [
            "Select the instance → Actions → Image and templates → Create image.",
            "Name it, e.g. custom-ami-web-DHCP, and add a description.",
            "It shows the 30 GB EBS volume — leave it alone.",
            "Click Create image.",
            "Go to AMIs in the left menu. Status starts as pending; wait until it reads available.",
          ],
        },
        {
          label: "6 · Launch from it",
          screen: "Launch instance → My AMIs",
          detail: [
            "Either select the AMI and click Launch instance from AMI, or launch normally and pick the My AMIs tab (Owned by me).",
            "Name it e.g. web-from-custom-ami-1.",
            "You must ADD the port 80 rule again — security group settings are NOT part of the AMI.",
            "Set Number of instances to 2 (or 9, for the original brief) and launch.",
          ],
          note: "The AMI carries what is INSIDE the machine — web server, DHCP, your admin password. It does not carry instance configuration such as security group rules.",
        },
        {
          label: "7 · Confirm",
          screen: "Browser + RDP",
          detail: [
            "Open each new instance's public IP in a browser — the same IIS page appears on all of them, at different IPs.",
            "Connect over RDP. Click Get password and it will say 'Password not available' — exactly as warned.",
            "Log in as administrator with the password you set in step 3 instead.",
            "Open Server Manager → Tools and confirm DHCP and IIS are both present.",
          ],
        },
        {
          label: "8 · Copy region",
          screen: "AMIs → Actions → Copy AMI",
          detail: [
            "Your AMI exists ONLY in the region you created it in — it will not appear in N. Virginia.",
            "For disaster recovery, select the AMI → Actions → Copy AMI and choose the target region.",
            "You can then launch identical instances there.",
          ],
        },
        {
          label: "9 · Clean up",
          screen: "Instances → AMIs → Snapshots",
          detail: [
            "Terminate all three instances.",
            "Go to AMIs, select yours, Actions → Deregister AMI.",
            "Deregistering does NOT fully delete it — the underlying snapshot remains and still costs you.",
            "Go to Snapshots, find the one created for that image, Actions → Delete snapshot.",
          ],
          warn: "Deregister alone is not enough. You must delete the snapshot too. (From a snapshot you could also Create image again if you change your mind.)",
        },
      ]}
    />
  );
}

/* ─── 6. LAB — AWS CLI ─────────────────────────────────────────────── */
export function AWSCLILab() {
  return (
    <LabStepper
      accent="viz"
      title="🧪 Lab — Managing EC2 from the AWS CLI"
      intro="Build a security group, a key pair and an instance entirely from the command line — then start, stop and terminate it."
      steps={[
        {
          label: "1 · Install",
          screen: "aws.amazon.com — download AWS CLI",
          detail: [
            "Search for download AWS CLI for Windows and open the first result.",
            "Pick the 64-bit installer (a 32-bit one is also offered) — about 26 MB.",
            "Run it and click through the wizard. Nothing needs changing.",
          ],
          note: "If it is already installed the wizard offers Repair instead.",
        },
        {
          label: "2 · Access keys",
          screen: "Console → account name → Security credentials",
          detail: [
            "You CANNOT sign in to the CLI with your console email and password.",
            "Click your account name → Security credentials → Access keys.",
            "Click Create New Access Key, then Download Key File and save it.",
          ],
          warn: "The access key and secret key are as powerful as your root username and password — never share them. You may hold a maximum of two keys at once; with two active you cannot create a third.",
        },
        {
          label: "3 · Configure",
          screen: "Command Prompt — aws configure",
          detail: [
            "Run: aws configure",
            "Paste the Access key ID from the downloaded file.",
            "Paste the Secret access key.",
            "Enter your default region, e.g. ap-south-1.",
            "Press Enter to accept json as the output format.",
          ],
        },
        {
          label: "4 · Security group",
          screen: "Creating the group",
          detail: [
            "Run: aws ec2 create-security-group --group-name aws-cli-training --description \"test from CLI\"",
            "The JSON response contains a GroupId — copy it into a notepad, you will need it repeatedly.",
            "Verify in the console under EC2 → Security Groups. It shows 0 permission entries: no inbound rules, all outbound allowed, exactly as expected for a new group.",
          ],
        },
        {
          label: "5 · Inbound rule",
          screen: "Authorising RDP",
          detail: [
            "Run: aws ec2 authorize-security-group-ingress --group-name aws-cli-training --protocol tcp --port 3389 --cidr 0.0.0.0/0",
            "This allows RDP from anywhere.",
            "Refresh the console — the rule now appears in the group.",
          ],
          note: "Verify each step in the console while you are new. It stops small errors compounding into confusing failures later.",
        },
        {
          label: "6 · Key pair",
          screen: "Creating the .pem from the CLI",
          detail: [
            "Run: aws ec2 create-key-pair --key-name cli-key-pair --query \"KeyMaterial\" --output text > cli-key-pair.pem",
            "This writes the key file into your current directory.",
            "Check with dir before and after.",
          ],
          warn: "If a file of that name already exists the command errors. Delete the old one first.",
        },
        {
          label: "7 · Gather IDs",
          screen: "Console — AMI ID and subnet ID",
          detail: [
            "You need an AMI ID. AWS changes these regularly, so fetch a current one: EC2 → Launch instance, and read the AMI ID of the free-tier image you want.",
            "You also need a subnet ID: Services → VPC → Subnets, and copy the ID for ap-south-1a.",
            "Note both in your notepad alongside the security group ID.",
          ],
          note: "You CAN retrieve both from the CLI, but it is a fiddlier process — the console is quicker here. Subnet IDs are unique to your account.",
        },
        {
          label: "8 · Run instance",
          screen: "aws ec2 run-instances",
          detail: [
            "Assemble: aws ec2 run-instances --image-id <ami-id> --count 1 --instance-type t2.micro --key-name cli-key-pair --security-group-ids <sg-id> --subnet-id <subnet-id>",
            "Paste it as ONE single line and press Enter.",
            "A JSON response confirms the instance.",
            "Check the console: correct AZ, correct security group, correct key pair.",
          ],
          warn: "Paste the whole command on one line. Pasting half of it executes a partial command — which silently launches an instance with the DEFAULT security group instead of yours. A stray space produces 'unknown option' errors. Small mistakes here cost real time.",
        },
        {
          label: "9 · Control it",
          screen: "stop / start / terminate",
          detail: [
            "Stop: aws ec2 stop-instances --instance-ids <instance-id>",
            "Start: aws ec2 start-instances --instance-ids <instance-id>",
            "Terminate: aws ec2 terminate-instances --instance-ids <instance-id>",
            "Watch each change appear in the console.",
            "Type exit to leave the command line.",
          ],
          note: "Do not try to memorise these. Keep a reference to copy from, and fluency comes with practice. What matters is understanding how the CLI works.",
        },
      ]}
    />
  );
}
