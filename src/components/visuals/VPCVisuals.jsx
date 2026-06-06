import { useState } from "react";
import "./VPCVisuals.css";

/* ─── 1. VPC ISOLATION DEMO ────────────────────────────────────────── */
export function VPCIsolationDemo() {
  const [isolated, setIsolated] = useState(true);

  return (
    <div className="sv-card vpc-card">
      <div className="sv-title vpc-title">🏠 Why VPC? — Isolation on Shared Hardware</div>
      <p className="vpc-intro">
        AWS is a <strong>public cloud</strong> — millions of users create resources in the same Availability Zones,
        sometimes on the <strong>same physical host</strong>. So how is Rahul's EC2 isolated from Modi's? The answer is
        the <strong>VPC</strong>. Toggle it off to see what a world without VPC would look like.
      </p>

      <div className="vpc-iso-switch">
        <button className={`vpc-iso-btn ${isolated ? "active good" : ""}`} onClick={() => setIsolated(true)}>
          🔒 With VPC (reality)
        </button>
        <button className={`vpc-iso-btn ${!isolated ? "active bad" : ""}`} onClick={() => setIsolated(false)}>
          🔓 Without VPC (hypothetical)
        </button>
      </div>

      <div className="vpc-host">
        <div className="vpc-host-label">🖥️ Single Physical Host — ap-south-1a</div>
        <div className="vpc-host-bodies">
          <div className={`vpc-tenant ${isolated ? "boxed" : ""}`} style={{ "--tc": "#3fb950" }}>
            {isolated && <div className="vpc-tenant-vpc">Rahul's VPC</div>}
            <span className="vpc-tenant-icon">💻</span>
            <span className="vpc-tenant-name">Rahul's EC2</span>
          </div>

          <div className={`vpc-iso-link ${isolated ? "blocked" : "open"}`}>
            {isolated ? "⛔ blocked" : "⚠️ open access"}
          </div>

          <div className={`vpc-tenant ${isolated ? "boxed" : ""}`} style={{ "--tc": "#2e73b8" }}>
            {isolated && <div className="vpc-tenant-vpc">Modi's VPC</div>}
            <span className="vpc-tenant-icon">💻</span>
            <span className="vpc-tenant-name">Modi's EC2</span>
          </div>
        </div>
      </div>

      <div className={`vpc-iso-verdict ${isolated ? "good" : "bad"}`}>
        {isolated ? (
          <><strong>✅ Isolated.</strong> Even on the same host, each user's EC2 lives in its <strong>own VPC</strong>.
          Rahul cannot touch Modi's instance and vice-versa. This is what makes AWS safe to use.</>
        ) : (
          <><strong>❌ Chaos.</strong> Without VPC, anyone could access anyone else's instances — zero security.
          Nobody would ever use AWS.</>
        )}
      </div>

      <div className="vpc-iso-note">
        💡 You never "set up" a VPC for your first EC2 because AWS gives every account a <strong>default VPC</strong> in
        every region. Delete it and you can't launch an instance at all (until you recreate one or build your own).
      </div>
    </div>
  );
}

/* ─── 2. VPC 5-STEP BUILD PROCESS ──────────────────────────────────── */
export function VPCBuildSteps() {
  const [step, setStep] = useState(0);

  const steps = [
    { icon: "🏗️", title: "Create VPC", desc: "Create the VPC container itself (choose 'VPC only'). This is your private, isolated network — like owning a home inside the public city of Mumbai.", code: "Name: my-corp-vpc\nType: VPC only" },
    { icon: "🔢", title: "Assign IP Range (CIDR)", desc: "Give the VPC a private IP address range (CIDR block). Most setups use private ranges, just like on-premises networks.", code: "CIDR: 192.168.0.0/24  (Class C, 256 IPs)" },
    { icon: "🧩", title: "Create Subnets", desc: "Carve the VPC's range into subnets. Each subnet lives inside ONE Availability Zone. Use 2+ AZs for high availability.", code: "public-subnet-1  → ap-south-1a\nprivate-subnet-1 → ap-south-1a\n... (one per AZ)" },
    { icon: "🌐", title: "Attach Internet Gateway", desc: "Create an Internet Gateway (IGW) and attach it to the VPC. This is your 'ISP connection' — without it, no internet at all.", code: "Create IGW → Actions → Attach to VPC" },
    { icon: "🗺️", title: "Configure Route Table", desc: "Add a route (0.0.0.0/0 → IGW) so subnets know how to reach the internet. Subnets associated with this table become PUBLIC.", code: "Destination: 0.0.0.0/0\nTarget: Internet Gateway (igw-xxx)" },
  ];

  const s = steps[step];

  return (
    <div className="sv-card vpc-card">
      <div className="sv-title vpc-title">🛠️ Building a VPC — The 5-Step Process</div>

      <div className="vpc-steps-row">
        {steps.map((st, i) => (
          <button key={i} className={`vpc-step ${step === i ? "active" : i < step ? "done" : ""}`} onClick={() => setStep(i)}>
            <span className="vpc-step-num">{i + 1}</span>
            <span className="vpc-step-icon">{st.icon}</span>
            <span className="vpc-step-label">{st.title}</span>
            {i < steps.length - 1 && <span className="vpc-step-line" />}
          </button>
        ))}
      </div>

      <div className="vpc-step-detail">
        <div className="vpc-step-detail-head"><span>{s.icon}</span> Step {step + 1}: {s.title}</div>
        <div className="vpc-step-detail-desc">{s.desc}</div>
        <pre className="vpc-code"><code>{s.code}</code></pre>
      </div>

      <div className="vpc-step-nav">
        <button className="vpc-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</button>
        <span className="vpc-progress">{step + 1} / {steps.length}</span>
        <button className="vpc-btn primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>Next →</button>
      </div>
    </div>
  );
}

/* ─── 3. CIDR & SUBNETTING EXPLORER ────────────────────────────────── */
export function CIDRExplorer() {
  const [cls, setCls] = useState("C");
  const [subnets, setSubnets] = useState(2);

  const classes = {
    A: { range: "10.0.0.0 – 10.255.255.255", cidr: "/8", size: "Huge", use: "Very large infrastructure", color: "#dd344c" },
    B: { range: "172.16.0.0 – 172.31.255.255", cidr: "/16", size: "Medium", use: "Medium infrastructure", color: "#e3b341" },
    C: { range: "192.168.0.0 – 192.168.255.255", cidr: "/24", size: "Small", use: "Small infrastructure", color: "#3fb950" },
  };
  const c = classes[cls];

  // /24 = 256 IPs; splitting into N equal subnets
  const newMask = 24 + Math.ceil(Math.log2(subnets));
  const ipsPerSubnet = 256 / Math.pow(2, Math.ceil(Math.log2(subnets)));
  const usable = ipsPerSubnet - 5; // AWS reserves 5 per subnet

  return (
    <div className="sv-card vpc-card">
      <div className="sv-title vpc-title">🔢 CIDR & Subnetting — The "Chocolate" Problem</div>

      <p className="vpc-intro">
        A VPC gets <strong>one</strong> IP range. A subnet can't reuse the whole thing, and a subnet's range can't
        cross AZ boundaries. Like a parent with one chocolate and two kids — you must either buy more, or <strong>split it</strong>.
      </p>

      <div className="vpc-cidr-classes">
        {Object.keys(classes).map((k) => (
          <button key={k} className={`vpc-cidr-class ${cls === k ? "active" : ""}`} style={{ "--cc": classes[k].color }} onClick={() => setCls(k)}>
            Class {k}
          </button>
        ))}
      </div>

      <div className="vpc-cidr-detail" style={{ "--cc": c.color }}>
        <div className="vpc-cidr-row"><span>Private range</span><strong>{c.range}</strong></div>
        <div className="vpc-cidr-row"><span>Default CIDR mask</span><strong>{c.cidr}</strong></div>
        <div className="vpc-cidr-row"><span>Best for</span><strong>{c.use}</strong></div>
      </div>

      <div className="vpc-split-box">
        <div className="vpc-split-head">
          Split a <code>192.168.0.0/24</code> (256 IPs) into <strong>{subnets}</strong> subnets:
        </div>
        <input type="range" min="2" max="8" step="1" value={subnets} onChange={(e) => setSubnets(+e.target.value)} className="vpc-split-range" />

        <div className="vpc-split-grid">
          {Array.from({ length: subnets }).map((_, i) => (
            <div key={i} className="vpc-split-chunk">
              <div className="vpc-split-chunk-cidr">192.168.{Math.floor((i * ipsPerSubnet) / 256)}.{(i * ipsPerSubnet) % 256}/{newMask}</div>
              <div className="vpc-split-chunk-ips">{ipsPerSubnet} IPs</div>
            </div>
          ))}
        </div>

        <div className="vpc-reserved">
          <div className="vpc-reserved-title">⚠️ AWS reserves 5 IPs per subnet → only <strong>{usable > 0 ? usable : 0}</strong> usable</div>
          <div className="vpc-reserved-list">
            <span>.0 Network</span>
            <span>.1 Router / Gateway</span>
            <span>.2 DNS</span>
            <span>.3 Future use</span>
            <span>.255 Broadcast</span>
          </div>
        </div>
      </div>

      <div className="vpc-iso-note">
        💡 You can add <strong>up to 5 CIDR blocks</strong> to a VPC ("buy more chocolates") — but with 6 AZs (e.g.
        N. Virginia) you'd run out. The scalable answer is <strong>subnetting</strong>: split one range into many.
      </div>
    </div>
  );
}

/* ─── 4. 2-TIER ARCHITECTURE BUILDER ───────────────────────────────── */
export function TwoTierArchitecture() {
  const [layer, setLayer] = useState(4); // 0..4 reveal stages

  const stages = [
    "VPC + 4 subnets (2 public, 2 private) across 2 AZs",
    "Internet Gateway attached to the VPC",
    "Public route table (0.0.0.0/0 → IGW) for public subnets",
    "Web servers in public subnets (inbound + outbound internet)",
    "Database servers in private subnets (no inbound) + NAT for outbound",
  ];

  return (
    <div className="sv-card vpc-card">
      <div className="sv-title vpc-title">🏛️ 2-Tier VPC Architecture (AWS Best Practice)</div>

      <p className="vpc-intro">
        Web servers face users (public) and the database stays hidden (private). High availability comes from
        spreading across <strong>two Availability Zones</strong>. Step through to build it up.
      </p>

      <div className="vpc-arch">
        <div className="vpc-arch-vpc-label">VPC 192.168.0.0/24 &nbsp;·&nbsp; Mumbai (ap-south-1)</div>

        {layer >= 1 && (
          <div className="vpc-arch-igw">🌐 Internet Gateway {layer >= 2 && <span className="vpc-arch-igw-route">↕ 0.0.0.0/0 route</span>}</div>
        )}

        <div className="vpc-arch-azs">
          {["ap-south-1a", "ap-south-1b"].map((az) => (
            <div key={az} className="vpc-arch-az">
              <div className="vpc-arch-az-label">{az}</div>

              <div className="vpc-arch-subnet public">
                <div className="vpc-arch-subnet-tag public">🟢 Public subnet</div>
                {layer >= 3 && (
                  <div className="vpc-arch-ec2 web">💻 Web server<span className="vpc-arch-badge in-out">in + out</span></div>
                )}
              </div>

              <div className="vpc-arch-subnet private">
                <div className="vpc-arch-subnet-tag private">🔒 Private subnet</div>
                {layer >= 4 && (
                  <div className="vpc-arch-ec2 db">🗄️ DB server<span className="vpc-arch-badge out-only">out only</span></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {layer >= 4 && (
          <div className="vpc-arch-nat">🔁 NAT Gateway (in a public subnet) → outbound internet for private subnets</div>
        )}
      </div>

      <div className="vpc-arch-stage-label">Stage {layer + 1}/5: {stages[layer]}</div>

      <div className="vpc-step-nav">
        <button className="vpc-btn" onClick={() => setLayer(Math.max(0, layer - 1))} disabled={layer === 0}>← Remove layer</button>
        <button className="vpc-btn primary" onClick={() => setLayer(Math.min(4, layer + 1))} disabled={layer === 4}>Add layer →</button>
      </div>
    </div>
  );
}

/* ─── 5. ACCESSING PRIVATE SUBNET (Bastion vs Endpoint) ────────────── */
export function PrivateSubnetAccess() {
  const [method, setMethod] = useState("bastion");

  return (
    <div className="sv-card vpc-card">
      <div className="sv-title vpc-title">🔑 Accessing an EC2 Instance in a Private Subnet</div>
      <p className="vpc-intro">
        A private-subnet instance has no public IP and no inbound internet. Two ways to reach it for admin work:
      </p>

      <div className="vpc-iso-switch">
        <button className={`vpc-iso-btn ${method === "bastion" ? "active good" : ""}`} onClick={() => setMethod("bastion")}>
          🛡️ Bastion Host
        </button>
        <button className={`vpc-iso-btn ${method === "endpoint" ? "active good" : ""}`} onClick={() => setMethod("endpoint")}>
          🔌 EC2 Instance Connect Endpoint
        </button>
      </div>

      {method === "bastion" ? (
        <div className="vpc-access-flow">
          <div className="vpc-access-node">🧑‍💻<span>You</span></div>
          <span className="vpc-access-arrow">SSH (public IP)→</span>
          <div className="vpc-access-node public">🛡️<span>Bastion Host<br/>(public subnet)</span></div>
          <span className="vpc-access-arrow">SSH (private IP)→</span>
          <div className="vpc-access-node private">🗄️<span>DB server<br/>(private subnet)</span></div>
        </div>
      ) : (
        <div className="vpc-access-flow">
          <div className="vpc-access-node">🧑‍💻<span>You (AWS login)</span></div>
          <span className="vpc-access-arrow">AWS API→</span>
          <div className="vpc-access-node public">🔌<span>Connect Endpoint</span></div>
          <span className="vpc-access-arrow">→</span>
          <div className="vpc-access-node private">🗄️<span>DB server<br/>(private subnet)</span></div>
        </div>
      )}

      <div className="vpc-access-detail">
        {method === "bastion" ? (
          <>
            <div className="vpc-access-title">🛡️ Bastion Host (a.k.a. jump box)</div>
            <ul>
              <li>A dedicated EC2 in a <strong>public subnet</strong> with a public IP</li>
              <li>SSH into the bastion, then "hop" to the private instance via its <strong>private IP</strong></li>
              <li>Copy your key to the bastion with <code>scp</code>, then <code>chmod 400</code> it (PEM must be read-only)</li>
              <li>Great when you only want to hand a teammate a <strong>PEM file</strong> — no AWS login needed</li>
            </ul>
          </>
        ) : (
          <>
            <div className="vpc-access-title">🔌 EC2 Instance Connect Endpoint</div>
            <ul>
              <li>A newer VPC endpoint — connect straight from the AWS console, no bastion needed</li>
              <li>Authentication is your <strong>AWS username/password</strong> (uses AWS API calls)</li>
              <li>Downside: the user <strong>must have AWS account access</strong></li>
              <li>Not ideal if a freelancer should only get a PEM file (use a bastion then)</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── 6. NAT GATEWAY OUTBOUND FLOW ─────────────────────────────────── */
export function NATGatewayFlow() {
  const [running, setRunning] = useState(false);

  const play = () => {
    setRunning(false);
    setTimeout(() => setRunning(true), 50);
    setTimeout(() => setRunning(false), 3200);
  };

  return (
    <div className="sv-card vpc-card">
      <div className="sv-title vpc-title">🔁 NAT Gateway — Outbound Internet for Private Subnets</div>
      <p className="vpc-intro">
        A private DB server needs <strong>outbound</strong> internet (OS updates, install MySQL, antivirus) but must
        stay safe from <strong>inbound</strong> access. A NAT Gateway is the agent that makes this possible.
      </p>

      <div className="vpc-nat-stage">
        <div className="vpc-nat-node private">🗄️<span>DB server<br/>private · no public IP</span></div>
        <div className="vpc-nat-track">
          <span className={`vpc-nat-packet a ${running ? "go" : ""}`}>📦</span>
        </div>
        <div className="vpc-nat-node nat">🔁<span>NAT Gateway<br/>public subnet · public IP</span></div>
        <div className="vpc-nat-track">
          <span className={`vpc-nat-packet b ${running ? "go" : ""}`}>📦</span>
        </div>
        <div className="vpc-nat-node igw">🌐<span>Internet Gateway</span></div>
        <div className="vpc-nat-track">
          <span className={`vpc-nat-packet c ${running ? "go" : ""}`}>🌍</span>
        </div>
        <div className="vpc-nat-node net">☁️<span>Internet</span></div>
      </div>

      <button className="vpc-nat-btn" onClick={play}>▶ Send an outbound request (e.g. yum install)</button>

      <div className="vpc-nat-steps">
        <div><strong>1.</strong> Private route table sends <code>0.0.0.0/0</code> traffic → NAT Gateway</div>
        <div><strong>2.</strong> NAT translates the private IP to its own <strong>public IP</strong> (NAT = Network Address Translator)</div>
        <div><strong>3.</strong> NAT (public IP) talks to the Internet Gateway → reaches the internet</div>
        <div><strong>4.</strong> Reply returns the same path; NAT swaps back to the private IP. <strong>Outbound only — no inbound.</strong></div>
      </div>

      <div className="vpc-nat-warn">
        💸 <strong>NAT Gateway is chargeable</strong> (unlike most VPC components). It also holds an Elastic IP — after
        deleting the NAT Gateway, <strong>release the Elastic IP</strong> too, or you keep paying. Always clean up after labs.
      </div>

      <div className="vpc-iso-note">
        🧠 Key placement rule: the NAT Gateway lives in a <strong>public subnet</strong> (it needs the IGW for internet),
        even though it serves the <strong>private</strong> subnets.
      </div>
    </div>
  );
}
