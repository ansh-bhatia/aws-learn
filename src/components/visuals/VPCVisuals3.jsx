import { useState } from "react";
import "./VPCVisuals3.css";

/* ─── 1. DHCP OPTION SET ───────────────────────────────────────────── */
export function DHCPOptionSetDemo() {
  const [custom, setCustom] = useState(false);

  const opts = [
    { key: "IP address", fixed: true, def: "auto from subnet range", cust: "auto from subnet range (cannot change)" },
    { key: "Domain name", fixed: false, def: "ap-south-1.compute.internal", cust: "cloudfox.local" },
    { key: "DNS server", fixed: false, def: "Amazon DNS (auto)", cust: "8.8.8.8" },
    { key: "NTP server", fixed: false, def: "Amazon time sync", cust: "your NTP server" },
    { key: "NetBIOS", fixed: false, def: "—", cust: "your NetBIOS node type" },
  ];

  return (
    <div className="sv-card v3-card">
      <div className="sv-title v3-title">📡 DHCP Option Set — Auto-Configuring Instances</div>
      <p className="v3-intro">
        <strong>DHCP</strong> (Dynamic Host Configuration Protocol) auto-assigns network settings — like joining hotel
        Wi-Fi: enter the password and you instantly get an IP. Every VPC has DHCP on, so new EC2 instances get a private
        IP automatically. A <strong>DHCP Option Set</strong> lets you customise <em>some</em> of those settings.
      </p>

      <div className="v3-switch">
        <button className={`v3-switch-btn ${!custom ? "active" : ""}`} onClick={() => setCustom(false)}>Default option set</button>
        <button className={`v3-switch-btn ${custom ? "active" : ""}`} onClick={() => setCustom(true)}>Custom option set</button>
      </div>

      <div className="v3-dhcp-table">
        <div className="v3-dhcp-row head"><span>Setting</span><span>Value</span><span>Editable?</span></div>
        {opts.map((o) => (
          <div key={o.key} className="v3-dhcp-row">
            <span className="v3-dhcp-key">{o.key}</span>
            <span className="v3-dhcp-val">{custom ? o.cust : o.def}</span>
            <span className={o.fixed ? "v3-dhcp-lock" : "v3-dhcp-ok"}>{o.fixed ? "🔒 fixed" : "✅ editable"}</span>
          </div>
        ))}
      </div>

      <div className="v3-note">
        💡 You <strong>cannot change the IP address</strong> via DHCP options — it's always auto-assigned from the subnet.
        But you can set domain name, DNS, NTP, and NetBIOS (great when you run your own Active Directory / DNS).
      </div>
      <div className="v3-note warn">
        ⚠️ A DHCP option set applies at the <strong>VPC level</strong> (all subnets), not per-subnet. After attaching a
        new set, run <code>ipconfig /renew</code> on the instance to pick up the changes.
      </div>
    </div>
  );
}

/* ─── 2. VPC FLOW LOG EXPLORER ─────────────────────────────────────── */
export function VPCFlowLogExplorer() {
  const [filter, setFilter] = useState("ACCEPT");
  const [dest, setDest] = useState("s3");

  const dests = {
    s3: { name: "Amazon S3", icon: "🪣", delay: "10–15 min", note: "Cheap storage; good for archival & big-data queries (Athena)." },
    cw: { name: "CloudWatch Logs", icon: "📊", delay: "~5 min", note: "Best for analytics, queries, and alerting (faster delivery)." },
    kinesis: { name: "Kinesis Data Firehose", icon: "🔥", delay: "near real-time", note: "Stream logs to other systems for processing." },
  };
  const d = dests[dest];

  // sample log line fields
  const fields = [
    ["version", "2"], ["account-id", "1234567890"], ["interface-id", "eni-0abc (NIC)"],
    ["srcaddr", "13.234.x.x"], ["dstaddr", "192.168.0.5"], ["srcport", "53122"],
    ["dstport", "80"], ["protocol", "6 (TCP)"], ["action", filter === "REJECT" ? "REJECT" : "ACCEPT"],
  ];

  return (
    <div className="sv-card v3-card">
      <div className="sv-title v3-title">🪵 VPC Flow Logs — Capturing Network Traffic</div>
      <p className="v3-intro">
        Flow Logs record traffic going in/out of your VPC — between EC2 instances, through load balancers, VPN, or
        Transit Gateway. Used for <strong>troubleshooting</strong> and <strong>security analysis</strong>.
      </p>

      <div className="v3-fl-controls">
        <div className="v3-fl-group">
          <div className="v3-fl-label">Filter</div>
          <div className="v3-fl-btns">
            {["ACCEPT", "REJECT", "ALL"].map((f) => (
              <button key={f} className={`v3-fl-btn ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className="v3-fl-group">
          <div className="v3-fl-label">Destination</div>
          <div className="v3-fl-btns">
            {Object.keys(dests).map((k) => (
              <button key={k} className={`v3-fl-btn ${dest === k ? "on" : ""}`} onClick={() => setDest(k)}>{dests[k].icon} {dests[k].name}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="v3-fl-dest">
        <span className="v3-fl-dest-icon">{d.icon}</span>
        <div>
          <div className="v3-fl-dest-name">{d.name} <span className="v3-fl-delay">delivery: {d.delay}</span></div>
          <div className="v3-fl-dest-note">{d.note}</div>
        </div>
      </div>

      <div className="v3-fl-label">Sample log record ({filter === "ALL" ? "accepted + rejected" : filter.toLowerCase()} traffic):</div>
      <div className="v3-fl-record">
        {fields.map(([k, v]) => (
          <span key={k} className={`v3-fl-field ${k === "action" ? (v.includes("REJECT") ? "reject" : "accept") : ""}`}>
            <span className="v3-fl-fk">{k}</span>
            <span className="v3-fl-fv">{v}</span>
          </span>
        ))}
      </div>

      <div className="v3-note">
        💡 <strong>ACCEPT</strong> = allowed traffic, <strong>REJECT</strong> = traffic blocked by SG/NACL (great for spotting
        attacks), <strong>ALL</strong> = both. Flow logs can attach to a VPC, a subnet, or a single ENI.
      </div>
    </div>
  );
}

/* ─── 3. MANAGED PREFIX LIST ───────────────────────────────────────── */
export function ManagedPrefixListDemo() {
  const [after, setAfter] = useState(true);
  const [newCidr, setNewCidr] = useState(false);

  const cidrs = ["10.0.0.0/24", "192.168.20.0/24", "172.16.0.0/16", "172.18.0.0/16", "10.0.0.0/8", "15.x.x.x/32"];
  const groups = ["web-SG (port 80)", "db-SG (port 3306)", "storage-SG (port 2049)"];

  return (
    <div className="sv-card v3-card">
      <div className="sv-title v3-title">📋 Managed Prefix List — One List, Many Rules</div>
      <p className="v3-intro">
        A <strong>prefix list</strong> is a named set of CIDR ranges you reuse across security groups, route tables,
        Transit Gateway, network firewalls, and more. Define the IPs once — reference them everywhere.
      </p>

      <div className="v3-switch">
        <button className={`v3-switch-btn ${!after ? "active bad" : ""}`} onClick={() => setAfter(false)}>❌ Without prefix list</button>
        <button className={`v3-switch-btn ${after ? "active good" : ""}`} onClick={() => setAfter(true)}>✅ With prefix list</button>
      </div>

      {!after ? (
        <div className="v3-pl-before">
          {groups.map((g) => (
            <div key={g} className="v3-pl-group">
              <div className="v3-pl-group-name">{g}</div>
              <div className="v3-pl-cidrs">
                {cidrs.map((c) => <span key={c} className="v3-pl-cidr">{c}</span>)}
                {newCidr && <span className="v3-pl-cidr added">200.0.0.0/24 ➕</span>}
              </div>
            </div>
          ))}
          <div className="v3-pl-pain">😩 New data-center CIDR? Edit it into <strong>every</strong> security group, one by one.</div>
        </div>
      ) : (
        <div className="v3-pl-after">
          <div className="v3-pl-list">
            <div className="v3-pl-list-name">📋 cloudfox-dc-ip-list</div>
            <div className="v3-pl-cidrs">
              {cidrs.map((c) => <span key={c} className="v3-pl-cidr">{c}</span>)}
              {newCidr && <span className="v3-pl-cidr added">200.0.0.0/24 ➕</span>}
            </div>
          </div>
          <div className="v3-pl-arrows">↓ referenced by ↓</div>
          <div className="v3-pl-refs">
            {groups.map((g) => <span key={g} className="v3-pl-ref">{g}</span>)}
          </div>
          <div className="v3-pl-gain">😎 New CIDR? Add it <strong>once</strong> here — every group updates automatically.</div>
        </div>
      )}

      <button className="v3-pl-add-btn" onClick={() => setNewCidr((v) => !v)}>
        {newCidr ? "↩ Undo new CIDR" : "➕ Add a new data-center CIDR (200.0.0.0/24)"}
      </button>

      <div className="v3-pl-types">
        <div className="v3-pl-type">
          <div className="v3-pl-type-h">👤 Customer-Managed</div>
          <ul>
            <li>You add your own CIDR ranges</li>
            <li>Full edit / delete / resize / <strong>share</strong> across accounts</li>
            <li>Single IP type per list (IPv4 <em>or</em> IPv6)</li>
            <li>Usable for inbound <strong>and</strong> outbound</li>
          </ul>
        </div>
        <div className="v3-pl-type">
          <div className="v3-pl-type-h">🟦 AWS-Managed</div>
          <ul>
            <li>Prebuilt ranges for AWS services (S3, CloudFront, DynamoDB…)</li>
            <li><strong>Cannot</strong> create, edit, delete, or share</li>
            <li>Auto-updates when AWS changes service IPs</li>
            <li>Mostly for <strong>outbound</strong> (e.g. EC2 → CloudFront / S3)</li>
          </ul>
        </div>
      </div>

      <div className="v3-note warn">
        ⚠️ <strong>Weight matters:</strong> a prefix list counts as its number of entries. CloudFront's list ≈ <strong>55</strong>
        CIDRs. A security group allows 60 rules → only 5 left after it. A route table allows 50 routes → it won't even fit
        (raise the limit via AWS support — it's a soft limit).
      </div>
    </div>
  );
}
