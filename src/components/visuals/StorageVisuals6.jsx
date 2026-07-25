import { useState } from "react";
import LabStepper from "./_LabStepper";
import "./StorageVisuals.css";
import "./StorageVisuals3.css";
import "./StorageVisuals6.css";

/* ─── LAB PART 1 — ACTIVE DIRECTORY INFRASTRUCTURE ─────────────────── */
export function ActiveDirectoryLab() {
  return (
    <LabStepper
      accent="st3"
      title="🧪 Lab Part 1 — Build the Windows / Active Directory Infrastructure"
      intro="FSx for Windows depends on Active Directory, so the domain has to exist first. Three Windows instances, one domain controller, two joined clients."
      steps={[
        {
          label: "1 · VM-SG",
          screen: "EC2 → Security Groups → Create",
          detail: [
            "Create a security group named VM-SG with a description.",
            "Inbound: allow All traffic from Anywhere.",
            "Outbound: leave all traffic allowed.",
            "This one group protects all three instances.",
          ],
          warn: "Allowing all traffic is NOT AWS best practice — it is done here only so a long lab is not made longer by port-by-port rules. Do not copy this into production.",
        },
        {
          label: "2 · Instances",
          screen: "Launch instance ×3",
          detail: [
            "Launch 2 instances at once in ap-south-1a: Windows Server 2016 Base, t2.micro, your key pair, security group VM-SG.",
            "Launch a 3rd separately in ap-south-1b with the same settings.",
            "Name them: ad-server and server1 (in 1a), server2 (in 1b).",
          ],
          note: "2016 rather than 2019/2022 purely for speed — t2.micro is modest hardware and newer versions carry more overhead. Any version works.",
        },
        {
          label: "3 · AD password",
          screen: "RDP into ad-server → Computer Management",
          detail: [
            "Connect to ad-server over RDP, decrypting the password with your key as usual.",
            "Open Server Manager → Tools → Computer Management.",
            "Local Users and Groups → Users → Administrator → right-click → Set Password.",
            "Set a complex password you will reuse throughout, e.g. Indian@123.",
          ],
          note: "You will manage the whole environment centrally from this server, so a known administrator password matters.",
        },
        {
          label: "4 · Static IP",
          screen: "ncpa.cpl",
          detail: [
            "Open Command Prompt and run: ipconfig /all — note the Ethernet adapter's IPv4 address, subnet mask and default gateway.",
            "Press Windows+R and run ncpa.cpl.",
            "Right-click the adapter → Properties → Internet Protocol Version 4 → Properties.",
            "Select 'Use the following IP address' and enter EXACTLY the same IP, subnet mask and default gateway you just noted.",
            "Set Preferred DNS server to 127.0.0.1 — this machine will be its own DNS.",
            "Save the IP in a notepad on your own computer; you will need it later.",
          ],
          warn: "Enter the WRONG IP here and you lose access to the instance permanently — there is no recovery, you must terminate and rebuild. The connection drops for a couple of seconds and returns if correct.",
        },
        {
          label: "5 · Rename",
          screen: "Server Manager → Local Server",
          detail: [
            "In Server Manager go to Local Server.",
            "Click the randomly-generated computer name and change it to ad-server.",
            "A rename requires a restart — choose Close and Restart Now.",
            "While it restarts, connect to server1 and server2 over RDP.",
          ],
        },
        {
          label: "6 · Install AD DS",
          screen: "Add Roles and Features",
          detail: [
            "Back on ad-server: Server Manager → Add Roles and Features.",
            "Click Next through the wizard to the roles list.",
            "Tick Active Directory Domain Services, add the features it asks for.",
            "Click Next through and Install. This takes a while.",
          ],
          note: "Installing is only step one. Configuring — promoting to a domain controller — is a separate step that comes after.",
        },
        {
          label: "7 · Client DNS",
          screen: "ncpa.cpl on server1 and server2",
          detail: [
            "While AD installs, point both clients at the domain controller for DNS.",
            "Copy ad-server's IP address.",
            "On server1: Windows+R → ncpa.cpl → adapter Properties → IPv4 → Properties.",
            "Under 'Use the following DNS server addresses' paste ad-server's IP. Click OK.",
            "Repeat exactly the same on server2.",
          ],
          warn: "Skip this and the domain join in step 9 will silently fail to prompt for credentials. Wrong DNS is the single most common cause of that failure.",
        },
        {
          label: "8 · Promote to DC",
          screen: "Post-deployment configuration",
          detail: [
            "On ad-server a yellow notification flag appears — click it and choose 'Promote this server to a domain controller'.",
            "Select Add a new forest.",
            "Root domain name: clf.local",
            "Set the Directory Services Restore Mode password, e.g. Indian@123.",
            "Click through — it verifies the name is unique — then Install. The server restarts automatically.",
          ],
          warn: "Use a .local domain, NOT .com or any real top-level domain. This is an internal domain and must not collide with public DNS.",
        },
        {
          label: "9 · Join clients",
          screen: "Server Manager → Local Server → Workgroup",
          detail: [
            "Reconnect to ad-server, but now click More choices → Use a different account.",
            "Log in as administrator@clf.local with your password. First login after promotion is slow.",
            "On server1: Server Manager → Local Server → click Workgroup → Change.",
            "Set the computer name to server1 and select Domain, entering clf.local.",
            "When prompted, enter the FULL username administrator@clf.local and the password.",
            "'Welcome to the clf.local domain' confirms success. Restart.",
            "Repeat on server2.",
          ],
          warn: "You must type the FULL user principal name — administrator@clf.local — not just 'administrator'. This is where most people get stuck. If no credential prompt appears at all, your DNS from step 7 is wrong.",
        },
        {
          label: "10 · Verify",
          screen: "Active Directory Users and Computers",
          detail: [
            "On ad-server: Server Manager → Tools → Active Directory Users and Computers.",
            "Expand clf.local → Computers.",
            "Both server1 and server2 should be listed. Refresh if not.",
            "The Windows infrastructure is now complete — do NOT delete anything.",
          ],
          note: "Part 2 uses all of these resources. Take a short break, but leave the instances running and stay logged in.",
        },
      ]}
    />
  );
}

/* ─── LAB PART 2 — FSx FOR WINDOWS FILE SERVER ─────────────────────── */
export function FSxWindowsLab() {
  return (
    <LabStepper
      accent="st3"
      title="🧪 Lab Part 2 — FSx for Windows File Server"
      intro="With the domain in place, create the file system, join it to Active Directory, and map it as a shared drive on both clients."
      steps={[
        {
          label: "1 · fsx-SG",
          screen: "EC2 → Security Groups → Create",
          detail: [
            "Create a security group named fsx-SG.",
            "Inbound: add a rule for All traffic, with the SOURCE set to VM-SG.",
            "Only the three instances in VM-SG can then reach the file system.",
            "Create security group.",
          ],
        },
        {
          label: "2 · Log in right",
          screen: "RDP into all three servers",
          detail: [
            "Connect to ad-server, server1 and server2.",
            "On EVERY one, log in with the full domain account: administrator@clf.local",
          ],
          warn: "If you are already logged in with a LOCAL account, log off and back in with the domain account. Using local credentials here causes failures later that are hard to diagnose.",
        },
        {
          label: "3 · Create FSx",
          screen: "FSx → Create file system → Windows File Server",
          detail: [
            "Search for FSx and click Create file system.",
            "Choose Amazon FSx for Windows File Server and click Next.",
            "Name it, choose Single-AZ deployment.",
            "Set storage capacity to the minimum, 32 GB.",
            "Leave the default VPC. Remove the default security group and select fsx-SG.",
          ],
        },
        {
          label: "4 · Join to AD",
          screen: "Windows authentication",
          detail: [
            "Choose Self-managed Microsoft Active Directory — you built your own, rather than using AWS Managed Microsoft AD.",
            "Fully qualified domain name: clf.local",
            "DNS server IP addresses: ad-server's static IP from Part 1.",
            "Service account username: administrator@clf.local",
            "Password: your domain password.",
            "Click Next.",
          ],
          note: "Forgotten the IP? RDP into ad-server, open Command Prompt and run ipconfig. AWS Managed Microsoft AD is the alternative here — self-managed is used so you can see how the join actually works.",
        },
        {
          label: "5 · Create",
          screen: "Review and create",
          detail: [
            "Encryption is applied automatically — for Windows file systems it is compulsory, using KMS.",
            "The review screen marks which settings can and cannot be changed after creation.",
            "Click Create file system.",
            "Wait for the status to reach Available — roughly 20 minutes.",
          ],
        },
        {
          label: "6 · Attach",
          screen: "FSx → Attach",
          detail: [
            "Select the file system and click Attach.",
            "Copy the mapping command it displays for Windows.",
            "Open Command Prompt on server1, paste it, and press Enter.",
            "'The command completed successfully' confirms it worked.",
            "Run exactly the same command on server2.",
            "Both servers now show a Z: drive in This PC.",
          ],
        },
        {
          label: "7 · Prove sharing",
          screen: "File Explorer on both servers",
          detail: [
            "On server1 open the Z: drive and create a file.",
            "On server2 open Z: — the same file is there.",
            "Create a second file from server2; it appears on server1.",
            "Edit a file created on server2 from server1 and save — both see the change.",
            "Delete a file from one server and it disappears from the other.",
          ],
          note: "This is the Windows equivalent of the EFS lab: native SMB shared storage across instances. EFS for Linux, FSx for Windows.",
        },
        {
          label: "8 · Clean up",
          screen: "Delete everything",
          detail: [
            "FSx → select the file system → Delete file system.",
            "Choose NOT to create a final backup, tick the confirmation, paste the file system ID, and delete.",
            "EC2 → select all three instances → Instance state → Terminate.",
            "Optionally delete VM-SG and fsx-SG once nothing references them.",
          ],
          warn: "Make sure the FSx file system actually finishes deleting. Security groups that still have attached resources will refuse to delete — that is fine, they cost nothing.",
        },
      ]}
    />
  );
}

/* ─── ALL FOUR FSx FILE SYSTEMS COMPARED ───────────────────────────── */
export function FSxAllFourMatrix() {
  const [row, setRow] = useState("protocols");

  const cols = [
    { k: "ontap", n: "NetApp ONTAP" },
    { k: "zfs", n: "OpenZFS" },
    { k: "windows", n: "Windows File Server" },
    { k: "lustre", n: "Lustre" },
  ];

  const rows = {
    latency: { label: "Latency", v: { ontap: "< 1 ms", zfs: "0.5 ms ✅", windows: "< 1 ms", lustre: "< 1 ms" } },
    throughput: { label: "Max throughput", v: { ontap: "4–6 GB/s", zfs: "10–21 GB/s", windows: "—", lustre: "1,000 GB/s ✅" } },
    size: { label: "Max file system size", v: { ontap: "virtually unlimited ✅", zfs: "512 TB", windows: "TB-scale", lustre: "multiple PB" } },
    clients: { label: "Client compatibility", v: { ontap: "Win · Linux · macOS", zfs: "Win · Linux · macOS", windows: "Win · Linux · macOS", lustre: "Linux only ⚠️" } },
    protocols: { label: "Protocols", v: { ontap: "SMB · NFS · iSCSI ✅", zfs: "NFS only", windows: "SMB", lustre: "POSIX-compliant custom" } },
    ad: { label: "Active Directory", v: { ontap: "yes", zfs: "no", windows: "yes", lustre: "no" } },
    av: { label: "Antivirus integration", v: { ontap: "yes", zfs: "no", windows: "yes", lustre: "no" } },
    deploy: { label: "Deployment", v: { ontap: "Single + Multi-AZ", zfs: "Single + Multi-AZ", windows: "Single + Multi-AZ", lustre: "Single-AZ only ⚠️" } },
    sla: { label: "SLA", v: { ontap: "99.99% Multi-AZ ✅", zfs: "99.5%", windows: "99.99% Multi-AZ", lustre: "99.5%" } },
    licence: { label: "Licensing", v: { ontap: "proprietary — fees", zfs: "open source — free", windows: "Microsoft", lustre: "open source — free" } },
  };

  const notes = {
    protocols: "ONTAP is the only one supporting all three of SMB, NFS and iSCSI — which is why it suits mixed Windows/Linux estates. OpenZFS is NFS only, so no Windows clients over native protocol.",
    throughput: "Look at the gap. Lustre at 1,000 GB/s is in a completely different class — that is what 'high performance computing' means in practice.",
    clients: "Lustre is Linux-only because its protocol is POSIX-compliant, and Linux is a POSIX operating system.",
    deploy: "Lustre is Single-AZ only. Multi-AZ would mean AWS duplicating an enormous cluster across zones, which would be prohibitively expensive.",
    size: "ONTAP's virtually unlimited capacity is its main edge over OpenZFS, which caps at 512 TB.",
    licence: "OpenZFS and Lustre are community-developed and carry no licence fee. ONTAP is NetApp's proprietary operating system, so licensing costs apply.",
    ad: "Active Directory support matters enormously in corporate environments where identity is already centralised there. OpenZFS and Lustre have none.",
  };

  const cls = (v) => (v === "yes" ? "yes" : v === "no" ? "no" : "txt");

  return (
    <div className="sv-card st3-card">
      <div className="sv-title st3-title">🗂️ All Four FSx File Systems Compared</div>
      <p className="st3-intro">
        As a solutions architect you are the one choosing between these. Pick a row to compare all four on that
        dimension.
      </p>

      <div className="st3-rowpicker">
        {Object.keys(rows).map((k) => (
          <button key={k} className={`st3-rowbtn ${row === k ? "active" : ""}`} onClick={() => setRow(k)}>
            {rows[k].label}
          </button>
        ))}
      </div>

      <div className="st6-matrix">
        {cols.map((c) => {
          const v = rows[row].v[c.k];
          return (
            <div key={c.k} className={`st6-cell ${cls(v)}`}>
              <div className="st6-cell-name">{c.n}</div>
              <div className="st6-cell-val">{v === "yes" ? "✅" : v === "no" ? "❌" : v}</div>
            </div>
          );
        })}
      </div>

      {notes[row] && <div className="st3-note">{notes[row]}</div>}
    </div>
  );
}

/* ─── LUSTRE PROFILE ───────────────────────────────────────────────── */
export function LustreProfile() {
  const [tab, setTab] = useState("what");

  const tabs = {
    what: {
      name: "What it is",
      body: [
        ["🧬", "The name", "Lustre = Linux + Cluster. It is a clustered file system built on Linux."],
        ["🖧", "Distributed", "Many nodes join to form one file system. Add nodes to add capacity and processing power — no single-machine bottleneck."],
        ["🔓", "Open source", "Community-developed, no licence fee — like OpenZFS."],
      ],
    },
    use: {
      name: "Use cases",
      body: [
        ["🔬", "Scientific research", "Supercomputing workloads and large-scale simulation."],
        ["📊", "Big data analysis", "Processing datasets far beyond a single machine."],
        ["🎬", "Media & entertainment", "Live rendering — cricket and football matches rendered as they happen need massive parallel storage throughput."],
        ["🤖", "Machine learning", "Training needs enormous data throughput."],
        ["💹", "Financial modelling", "Heavy parallel computation."],
      ],
    },
    hist: {
      name: "History",
      body: [
        ["1990s", "Peter Braam", "Develops the technology and founds Cluster File Systems in 2001."],
        ["2007", "Sun Microsystems", "Acquires Cluster File Systems."],
        ["2010", "Oracle", "Acquires Sun — and Oracle favours closed source."],
        ["→", "The community forks", "Groups in the US and Europe continue Lustre as an open source project, exactly as happened with ZFS → OpenZFS."],
      ],
    },
    adv: {
      name: "Why FSx",
      body: [
        ["⚡", "Performance", "Up to 1,000 GB/s throughput and millions of IOPS."],
        ["🪣", "S3 integration", "Pull unprocessed data from S3, process it, write results back to S3."],
        ["🎛️", "Fully managed", "No hardware, no networking, no software to run — pay as you go."],
        ["⏱️", "Deployment speed", "Building a Lustre cluster on-premises takes 6–8 months. Here it is ready in about 30 minutes."],
        ["💾", "Two repository types", "Persistent keeps your data; Scratch discards it once processing finishes."],
      ],
    },
  };

  const t = tabs[tab];

  return (
    <div className="sv-card st3-card">
      <div className="sv-title st3-title">🚀 FSx for Lustre — High Performance Computing</div>
      <p className="st3-intro">
        <strong>Exam keyword:</strong> if a question says <strong>HPC</strong> or <strong>high performance
        computing</strong>, the answer is almost always <strong>Lustre</strong>.
      </p>

      <div className="st3-steps">
        {Object.keys(tabs).map((k) => (
          <button key={k} className={`st3-step ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
            {tabs[k].name}
          </button>
        ))}
      </div>

      <div className="st6-list">
        {t.body.map(([icon, title, desc]) => (
          <div key={title} className="st6-row">
            <span className="st6-row-icon">{icon}</span>
            <div>
              <div className="st6-row-title">{title}</div>
              <div className="st6-row-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="st3-note">
        Two limits to remember: <strong>Linux only</strong> (the protocol is POSIX-compliant), and{" "}
        <strong>Single-AZ only</strong> with a <strong>99.5% SLA</strong> — Multi-AZ would mean duplicating an
        enormous cluster across zones.
      </div>
    </div>
  );
}
