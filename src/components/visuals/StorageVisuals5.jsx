import { useState } from "react";
import LabStepper from "./_LabStepper";
import "./StorageVisuals.css";
import "./StorageVisuals3.css";
import "./StorageVisuals5.css";

/* ─── 1. THROUGHPUT vs PERFORMANCE — RESTAURANT ANALOGY ────────────── */
export function RestaurantAnalogy() {
  const [dial, setDial] = useState({ cook: 50, waiters: 50 });

  const served = Math.min(dial.cook, dial.waiters);
  const bottleneck =
    dial.cook < dial.waiters ? "kitchen" : dial.waiters < dial.cook ? "waiters" : "balanced";

  return (
    <div className="sv-card st3-card">
      <div className="sv-title st3-title">🍽️ Throughput vs Performance Mode</div>
      <p className="st3-intro">
        Two different numbers, and you need both. Picture a restaurant: <strong>throughput</strong> is how many
        dishes the kitchen can cook per second; <strong>performance mode</strong> is how many waiters can carry
        them to tables. Drag both and see what actually reaches the customer.
      </p>

      <div className="st5-dials">
        <label className="st5-dial">
          <span className="st5-dial-label">
            👨‍🍳 Kitchen — <strong>throughput mode</strong> <em>(how much DATA per second)</em>
          </span>
          <input
            type="range" min="10" max="100" value={dial.cook}
            onChange={(e) => setDial((d) => ({ ...d, cook: Number(e.target.value) }))}
          />
          <span className="st5-dial-val">{dial.cook} dishes/sec</span>
        </label>

        <label className="st5-dial">
          <span className="st5-dial-label">
            🧑‍🍽️ Waiters — <strong>performance mode</strong> <em>(how many REQUESTS per second)</em>
          </span>
          <input
            type="range" min="10" max="100" value={dial.waiters}
            onChange={(e) => setDial((d) => ({ ...d, waiters: Number(e.target.value) }))}
          />
          <span className="st5-dial-val">{dial.waiters} deliveries/sec</span>
        </label>
      </div>

      <div className={`st5-served ${bottleneck === "balanced" ? "ok" : "warn"}`}>
        <span className="st5-served-num">{served}</span>
        <span className="st5-served-txt">
          dishes actually reach customers per second
          {bottleneck === "kitchen" && " — the KITCHEN is the bottleneck. Raising throughput would help; more waiters would not."}
          {bottleneck === "waiters" && " — the WAITERS are the bottleneck. You can cook plenty, but nobody is carrying it. More IOPS would help."}
          {bottleneck === "balanced" && " — balanced. Neither side is wasted."}
        </span>
      </div>

      <div className="st3-note">
        <strong>Throughput mode</strong> = how much data per second. <strong>Performance mode</strong> = how
        many requests per second. Set one high and the other low, and the low one caps you — which is why real
        performance needs <strong>both</strong> to match your workload.
      </div>
    </div>
  );
}

/* ─── 2. LAB — EFS SHARED ACROSS TWO AZs ───────────────────────────── */
export function EFSLab() {
  return (
    <LabStepper
      accent="st3"
      title="🧪 Lab — Shared EFS Across Two Availability Zones"
      intro="Two Linux instances in different AZs, one shared file system, and security groups wired the way AWS recommends."
      steps={[
        {
          label: "1 · web-SG",
          screen: "EC2 → Security Groups → Create",
          detail: [
            "Create a security group named web-SG with a description.",
            "Inbound: add SSH — TCP port 22 — from Anywhere (0.0.0.0/0), so you can reach the instances from your office.",
            "Outbound: leave the default, all traffic allowed.",
            "Create security group.",
          ],
        },
        {
          label: "2 · efs-SG",
          screen: "Create a second security group",
          detail: [
            "Create another security group named efs-SG.",
            "Inbound: choose type NFS — it fills in TCP port 2049 automatically.",
            "For the SOURCE, do NOT use 0.0.0.0/0. Select the security group web-SG instead.",
            "Outbound: leave all traffic allowed. Create security group.",
          ],
          note: "This is the best practice worth remembering: only members of web-SG can reach the file system. Nothing else on the internet can, and you never have to maintain a list of IPs.",
        },
        {
          label: "3 · Instance A",
          screen: "Launch instance → ap-south-1a",
          detail: [
            "Launch an Amazon Linux instance named efs-vm1, t2.micro, with your key pair.",
            "Under Network settings click Edit and set the subnet to ap-south-1a.",
            "Choose Select existing security group and pick web-SG.",
            "Launch.",
          ],
        },
        {
          label: "4 · Instance B",
          screen: "Launch instance → ap-south-1b",
          detail: [
            "Launch a second instance named efs-vm2, same AMI, type and key pair.",
            "This time set the subnet to ap-south-1b.",
            "Select the same web-SG — one security group can protect many instances.",
            "Launch.",
          ],
          warn: "Do NOT set 'Number of instances' to 2 on a single launch. Both would land in the SAME subnet. Launching them separately is what puts them in different AZs.",
        },
        {
          label: "5 · Create EFS",
          screen: "EFS → Create file system → Customize",
          detail: [
            "Open EFS and click Create file system. Name it shared-storage.",
            "Click Customize rather than Create — otherwise you accept all defaults blindly.",
            "Storage class: Standard. Backup: off for this lab. Encryption: off for this lab.",
            "Throughput mode: Enhanced → Elastic. Performance mode: General Purpose.",
            "Click Next.",
          ],
          note: "You never specify a size. EFS grows automatically and you pay for what you actually store — 5 GB stored means 5 GB billed.",
        },
        {
          label: "6 · Mount targets",
          screen: "Network access",
          detail: [
            "This screen lists every availability zone with a mount target.",
            "Keep ap-south-1a and ap-south-1b — the AZs holding your instances.",
            "For each, REMOVE the default security group and select efs-SG instead.",
            "You may drop ap-south-1c since nothing runs there. Click Next, Next, Create.",
          ],
          warn: "An instance can only reach EFS from an AZ that has a mount target. No mount target in ap-south-1c means no access from ap-south-1c — though you can always add one later.",
        },
        {
          label: "7 · Install utils",
          screen: "SSH into BOTH instances",
          detail: [
            "SSH into instance one: ssh -i cloud-fox-key.pem ec2-user@<public-ip>",
            "Become root: sudo -i",
            "Install the helper: yum install amazon-efs-utils",
            "Repeat both steps on the SECOND instance.",
          ],
          warn: "Install this on BOTH servers. Without amazon-efs-utils the mount command will not work.",
        },
        {
          label: "8 · Mount",
          screen: "EFS → Attach",
          detail: [
            "On each instance create a mount point: mkdir efs",
            "In the EFS console select your file system and click Attach.",
            "Copy the mount command it gives you.",
            "Paste and run it on BOTH instances.",
          ],
        },
        {
          label: "9 · Prove sharing",
          screen: "Both terminals",
          detail: [
            "On instance one: cd efs, then create a file with some content.",
            "Run ls — the file is there.",
            "Switch to instance two: cd efs and run ls. The SAME file appears.",
            "Use cat to read it — the content is identical.",
            "Create a different file on instance two, then look for it from instance one. It is there too.",
          ],
          note: "Two instances, two availability zones, one file system. Update a website here once and every instance serves the change immediately.",
        },
        {
          label: "10 · Clean up",
          screen: "Terminate and delete",
          detail: [
            "Terminate both EC2 instances.",
            "Go to EFS, select the file system and click Delete.",
            "Paste the file system ID to confirm — deleting the mount targets takes a little time.",
            "Delete the two security groups if you no longer need them.",
          ],
          warn: "Always delete your lab resources. Forgetting means a bill arrives later for something you are not using.",
        },
      ]}
    />
  );
}
