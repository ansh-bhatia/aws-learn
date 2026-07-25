import { useState } from "react";
import LabStepper from "./_LabStepper";
import "./StorageVisuals.css";
import "./StorageVisuals3.css";
import "./StorageVisuals4.css";

/* ─── 1. LAB — CREATE, ATTACH, RESIZE AN EBS VOLUME ────────────────── */
export function EBSVolumeLab() {
  return (
    <LabStepper
      accent="st3"
      title="🧪 Lab — Attach, Format and Resize an EBS Volume"
      intro="Using a Windows instance so the drive is visible in a GUI. Watch the two settings you can never change afterwards."
      steps={[
        {
          label: "1 · Instance",
          screen: "Launch instance",
          detail: [
            "Launch a Windows Server 2019 instance, t2.micro, in ap-south-1a.",
            "Note the 30 GB root volume — that becomes the C: drive.",
            "You CAN add an extra volume here under Configure storage, choosing size, type and encryption.",
            "For this lab, skip it — we will add one afterwards to show that path too.",
          ],
        },
        {
          label: "2 · Confirm C:",
          screen: "RDP → This PC",
          detail: [
            "Connect over RDP and decrypt the password as usual.",
            "Open Explorer → This PC. Only C: exists, at 30 GB — the default root volume.",
            "You can also check via Server Manager → Tools → Computer Management → Disk Management.",
            "Shortcut: press Windows+R and run diskmgmt.msc — same window.",
          ],
        },
        {
          label: "3 · Create volume",
          screen: "EC2 → Volumes → Create volume",
          detail: [
            "In the EC2 dashboard go to Volumes and click Create volume.",
            "Choose General Purpose SSD and set the size to 15 GB.",
            "Select the availability zone.",
          ],
          warn: "The volume and the instance MUST be in the SAME availability zone. Create it in ap-south-1b while your instance is in ap-south-1a and you simply cannot attach it. (A snapshot is the workaround — covered later.)",
        },
        {
          label: "4 · ⚠️ Encryption",
          screen: "Create volume → Encryption",
          detail: [
            "Decide NOW whether this volume should be encrypted.",
            "Ticking Encrypt uses KMS; the default aws/ebs key is fine.",
            "Click Create volume.",
          ],
          warn: "If you do not encrypt at creation you CANNOT encrypt it later. Actions → Modify volume offers no encryption option, ever. The only route afterwards is snapshot → create a new encrypted volume from it.",
        },
        {
          label: "5 · Attach",
          screen: "Volumes → Actions → Attach volume",
          detail: [
            "Give the volume a Name tag so it is easy to identify.",
            "Refresh — its state reads available, not in-use, because it is attached to nothing.",
            "Select it → Actions → Attach volume.",
            "Only instances in the SAME availability zone are offered. Pick yours, accept the default device name, and attach.",
            "The state changes to in-use and shows the instance ID.",
          ],
        },
        {
          label: "6 · Format",
          screen: "diskmgmt.msc",
          detail: [
            "Back in the instance, the new drive is NOT in Explorer yet — it is a raw block device.",
            "Open Disk Management. The 15 GB disk appears.",
            "Right-click → Online.",
            "Right-click → Initialize Disk.",
            "Right-click the unallocated space → New Simple Volume → Next through the wizard → Finish.",
            "D: now appears in This PC, empty and ready.",
          ],
        },
        {
          label: "7 · Resize",
          screen: "Modify volume + Disk Management",
          detail: [
            "In the console select the volume → Actions → Modify volume → change 15 GB to 30 GB → Modify.",
            "You can do this while the instance is RUNNING — no power-off needed.",
            "Windows still shows 15 GB. Go to Disk Management and choose Action → Rescan Disks.",
            "Right-click the D: drive → Extend Volume → accept the new space.",
            "D: now reads 30 GB.",
          ],
          note: "You can INCREASE a volume's size. You can never DECREASE it.",
        },
        {
          label: "8 · Detach & delete",
          screen: "Actions → Detach / Delete",
          detail: [
            "Select the volume → Actions → Detach volume. It can then be attached to a different instance.",
            "To delete it, it must be detached first — the Delete option is unavailable while in-use, and also while the volume is still Optimizing after a resize.",
            "Once available: Actions → Delete volume.",
            "Terminate the instance too.",
          ],
          warn: "Deleting a volume is irreversible. Also note: a volume cannot be copied to another AZ or another region directly — snapshots are the only way.",
        },
      ]}
    />
  );
}

/* ─── 2. LAB — SNAPSHOT BACKUP AND RESTORE ─────────────────────────── */
export function SnapshotBackupLab() {
  return (
    <LabStepper
      accent="st3"
      title="🧪 Lab — Back Up and Restore with a Snapshot"
      intro="Put real files on a volume, delete them, and get them back from a snapshot."
      steps={[
        {
          label: "1 · Setup",
          screen: "Launch instance with an extra volume",
          detail: [
            "Launch a Windows Server 2019 instance named learning-snapshot, t2.micro, in ap-south-1a.",
            "This time add the 15 GB EBS volume during launch, under Configure storage → Add new volume.",
            "Under its advanced options you would also find Encryption and Delete on termination.",
          ],
          note: "Delete on termination defaults to YES for the root volume but NO for any volume you add. So an added volume survives instance termination unless you change it.",
        },
        {
          label: "2 · Add data",
          screen: "diskmgmt.msc → D:",
          detail: [
            "Connect over RDP, open diskmgmt.msc.",
            "Bring the 15 GB disk Online, Initialize it, then New Simple Volume through to Finish.",
            "Open D: and create several text files with some content in them.",
          ],
        },
        {
          label: "3 · Snapshot",
          screen: "Volumes → Actions → Create snapshot",
          detail: [
            "Give the volume a clear Name tag first — it makes selecting it far easier.",
            "Select the volume → Actions → Create snapshot. (You can also start from Snapshots → Create snapshot and pick the volume there.)",
            "Add a description and click Create snapshot.",
            "Status starts as pending; wait for completed.",
          ],
          note: "Snapshots are stored in Amazon S3, and you are billed at S3 rates for their size. An unencrypted volume produces an unencrypted snapshot.",
        },
        {
          label: "4 · Lose the data",
          screen: "D: drive",
          detail: [
            "Back in the instance, select all the files on D: and delete them.",
            "The drive is now empty — exactly the disaster you are protecting against.",
          ],
        },
        {
          label: "5 · Restore",
          screen: "Snapshots → Create volume from snapshot",
          detail: [
            "EC2 → Snapshots, select your snapshot → Actions → Create volume from snapshot.",
            "It offers 15 GB — the original size.",
            "Choose the availability zone. Picking a DIFFERENT one here is how you effectively move a volume across AZs.",
            "You may also enable encryption at this point.",
            "Click Create volume.",
          ],
        },
        {
          label: "6 · Reattach",
          screen: "Attach + Disk Management",
          detail: [
            "The restored volume appears as available. Select it → Actions → Attach volume → choose your instance.",
            "The instance now has two 15 GB volumes attached.",
            "In Disk Management the new disk appears: right-click → Online, then Initialize.",
            "You do NOT need to format it — the file system and data are already there.",
            "Open the drive: your files are back.",
          ],
        },
        {
          label: "7 · Clean up",
          screen: "Detach, delete, terminate",
          detail: [
            "Detach and delete the now-empty original volume (wait for it to leave in-use state).",
            "Terminate the instance — this deletes the 30 GB root volume automatically.",
            "The added 15 GB volume is NOT deleted with it, so delete that yourself.",
            "Finally go to Snapshots and delete the snapshot.",
          ],
          warn: "Snapshots keep costing money until deleted. Terminating the instance does not remove them.",
        },
      ]}
    />
  );
}

/* ─── 3. WHAT SNAPSHOTS UNLOCK ─────────────────────────────────────── */
export function SnapshotUseCaseFlow() {
  const [uc, setUc] = useState("az");

  const cases = {
    az: {
      tab: "🌐 Change AZ",
      problem: "Your volume is in ap-south-1a but your instance is in ap-south-1b. They must match, and there is no option anywhere to change a volume's availability zone.",
      steps: ["Select the volume → Actions → Create snapshot", "Snapshots → Actions → Create volume from snapshot", "Choose ap-south-1b as the availability zone", "Attach the new volume · delete the old one"],
      from: "volume in ap-south-1a",
      to: "volume in ap-south-1b",
    },
    enc: {
      tab: "🔐 Add encryption",
      problem: "You forgot to encrypt the volume at creation. Actions → Modify volume shows no encryption option, and it never will.",
      steps: ["Select the volume → Actions → Create snapshot", "Snapshots → Actions → Create volume from snapshot", "Tick Encrypt and choose a KMS key", "Attach the new encrypted volume · delete the old one"],
      from: "unencrypted volume",
      to: "encrypted volume",
    },
    region: {
      tab: "🗺️ Change region",
      problem: "Everything is in Mumbai but you need this volume in N. Virginia. Volumes cannot be copied across regions.",
      steps: ["Select the volume → Actions → Create snapshot", "Select the snapshot → Actions → Copy snapshot", "Set the destination region to us-east-1", "Switch region, then create a volume from the copied snapshot"],
      from: "volume in ap-south-1 (Mumbai)",
      to: "volume in us-east-1 (N. Virginia)",
    },
  };

  const c = cases[uc];

  return (
    <div className="sv-card st3-card">
      <div className="sv-title st3-title">🔄 What Snapshots Unlock</div>
      <p className="st3-intro">
        Backup is the obvious use. But snapshots are also the <strong>only</strong> way around three hard limits
        on EBS volumes.
      </p>

      <div className="st3-steps">
        {Object.keys(cases).map((k) => (
          <button key={k} className={`st3-step ${uc === k ? "active" : ""}`} onClick={() => setUc(k)}>
            {cases[k].tab}
          </button>
        ))}
      </div>

      <div className="st4-problem">
        <span className="st4-problem-tag">THE LIMIT</span>
        {c.problem}
      </div>

      <div className="st4-transform">
        <div className="st4-side from">{c.from}</div>
        <div className="st4-via">
          <span className="st4-snap">📸 snapshot</span>
        </div>
        <div className="st4-side to">{c.to}</div>
      </div>

      <ol className="st4-steps">
        {c.steps.map((s) => <li key={s}>{s}</li>)}
      </ol>

      <div className="st3-note">
        The pattern is identical every time: <strong>snapshot the volume, then create a NEW volume from that
        snapshot</strong> with whatever property you could not change directly. The snapshot is the escape hatch.
      </div>
    </div>
  );
}
