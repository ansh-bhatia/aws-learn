import { useState } from "react";
import LabStepper from "./_LabStepper";
import "./EC2Visuals.css";
import "./EC2Visuals4.css";
import "./EC2Visuals5.css";

/* ─── 1. PORTS & THE REQUEST/REPLY FLOW ────────────────────────────── */
export function PortNumberExplorer() {
  const [tab, setTab] = useState("ranges");

  const ranges = [
    { band: "0 – 1023", name: "Well-known ports", fixed: "Universal and fixed", examples: "HTTP 80 · HTTPS 443 · FTP 21 · SSH 22 · SMTP 25 · DNS 53" },
    { band: "1024 – 49151", name: "Registered ports", fixed: "Registered by a specific company", examples: "MySQL 3306 · PostgreSQL 5432 · RDP 3389 (Microsoft)" },
    { band: "49152 – 65535", name: "Dynamic / private ports", fixed: "Chosen randomly by the app", examples: "The source port your browser picks for each connection" },
  ];

  const services = [
    ["🌐 Web server", "HTTP / HTTPS", "80 / 443"],
    ["📧 Email server", "SMTP (send) / POP3 (receive)", "25 / 110"],
    ["📁 File server", "NFS (Linux) / SMB (Windows)", "2049 / 445"],
    ["🗄️ Database server", "MySQL / Oracle", "3306 / 1521"],
    ["🔤 DNS server", "DNS", "53"],
  ];

  return (
    <div className="viz-card">
      <div className="viz-title">🔢 Ports, Protocols &amp; How a Server Knows What You Want</div>
      <p className="ifam-intro">
        On the road of the internet there are only three kinds of traffic — <strong>TCP</strong>,{" "}
        <strong>UDP</strong> and <strong>ICMP</strong>. They are <em>carriers</em>. The{" "}
        <strong>port number</strong> is what tells the server which service you are actually asking for.
      </p>

      <div className="ntr-toggle">
        <button className={`ntr-btn ${tab === "ranges" ? "active" : ""}`} onClick={() => setTab("ranges")}>
          Port ranges
        </button>
        <button className={`ntr-btn ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>
          Service → port
        </button>
        <button className={`ntr-btn ${tab === "flow" ? "active" : ""}`} onClick={() => setTab("flow")}>
          Request / reply
        </button>
      </div>

      {tab === "ranges" && (
        <div className="p5-list">
          {ranges.map((r) => (
            <div key={r.band} className="p5-range">
              <div className="p5-range-head">
                <span className="p5-band">{r.band}</span>
                <span className="p5-range-name">{r.name}</span>
              </div>
              <div className="p5-range-fixed">{r.fixed}</div>
              <div className="p5-range-ex">{r.examples}</div>
            </div>
          ))}
          <div className="ifam-note">
            There are <strong>65,536 ports in total (0–65535)</strong>. The well-known ones are identical
            everywhere on the internet — port 80 means HTTP no matter whose server it is.
          </div>
        </div>
      )}

      {tab === "services" && (
        <div className="p5-list">
          {services.map(([svc, proto, port]) => (
            <div key={svc} className="p5-svc">
              <span className="p5-svc-name">{svc}</span>
              <span className="p5-svc-proto">{proto}</span>
              <span className="p5-svc-port">{port}</span>
            </div>
          ))}
          <div className="ifam-note">
            An enterprise runs a <strong>dedicated server per service</strong>. One server <em>can</em> host
            several, but separating them is the norm.
          </div>
        </div>
      )}

      {tab === "flow" && (
        <div className="p5-flow">
          <div className="p5-packet req">
            <div className="p5-packet-tag">① REQUEST — client → server</div>
            <div className="p5-fields">
              <span>destination IP <b>1.1.1.1</b></span>
              <span>destination port <b>80</b></span>
              <span>source IP <b>2.2.2.2</b></span>
              <span>source port <b>50000</b> <small>(random)</small></span>
            </div>
          </div>
          <div className="p5-swap">⇅ everything reverses</div>
          <div className="p5-packet rep">
            <div className="p5-packet-tag">② REPLY — server → client</div>
            <div className="p5-fields">
              <span>destination IP <b>2.2.2.2</b></span>
              <span>destination port <b>50000</b></span>
              <span>source IP <b>1.1.1.1</b></span>
              <span>source port <b>80</b></span>
            </div>
          </div>
          <div className="ifam-note">
            Now imagine someone sends an <strong>SMTP</strong> request to that web server. It cannot serve it —
            but it still has to <strong>process the request to say no</strong>. Enough of those and the server
            is overloaded, and attackers can abuse it. <strong>That is the problem security groups solve.</strong>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 2. SECURITY GROUP AS A SOURCE ────────────────────────────────── */
export function SGAsSourcePattern() {
  const [count, setCount] = useState(3);

  return (
    <div className="viz-card">
      <div className="viz-title">🎯 Using a Security Group as the Source</div>
      <p className="ifam-intro">
        The rule on the app server says <strong>allow HTTP from test-SG</strong> — not from a list of IPs.
        Add a fourth instance to <code>test-SG</code> and watch what you <em>don&apos;t</em> have to do.
      </p>

      <div className="sg5-stage">
        <div className="sg5-group">
          <div className="sg5-group-tag">test-SG</div>
          <div className="sg5-members">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className={`sg5-member ${i === 3 ? "new" : ""}`}>
                🖥️ EC2 {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
        </div>

        <div className="sg5-rule">
          <span className="sg5-rule-arrow">→</span>
          <span className="sg5-rule-txt">HTTP :80<br /><small>source = test-SG</small></span>
        </div>

        <div className="sg5-app">
          <div className="sg5-group-tag app">app-SG</div>
          <div className="sg5-member app">🗄️ application<br /><small>HTTP service</small></div>
        </div>
      </div>

      <div className="ntr-toggle">
        <button className="ntr-btn" onClick={() => setCount(3)} disabled={count === 3}>
          Reset to 3
        </button>
        <button className="ntr-btn" onClick={() => setCount(4)} disabled={count === 4}>
          + Add a 4th instance to test-SG
        </button>
      </div>

      <div className={`sg5-verdict ${count === 4 ? "on" : ""}`}>
        {count === 4
          ? "EC2 D joined test-SG and immediately has access — you changed NO rules on app-SG. That is the whole benefit."
          : "Three instances all share test-SG, and app-SG allows HTTP from that group."}
      </div>

      <div className="ifam-note">
        You <em>could</em> list IP addresses instead — but you would add each one <strong>individually</strong>,{" "}
        <strong>IP addresses can change</strong>, and every new instance means editing the rule by hand. Using
        the security group as the source avoids all three problems.
      </div>
    </div>
  );
}

/* ─── 3. LAB — SECURITY GROUPS ─────────────────────────────────────── */
export function SecurityGroupLab() {
  return (
    <LabStepper
      accent="viz"
      title="🧪 Lab — Security Groups End to End"
      intro="Create a group with no rules, watch every connection fail, then open exactly what you need — and prove statefulness with ping."
      steps={[
        {
          label: "1 · Create SG",
          screen: "EC2 dashboard → Security Groups → Create security group",
          detail: [
            "Open the EC2 dashboard and choose Security Groups.",
            "Click Create security group.",
            "Name it my-web-server-SG and add a description.",
            "Leave the VPC as the default one.",
            "Click Create security group.",
          ],
          note: "A newly created group has NO inbound rules and ALL traffic allowed outbound. Remember both defaults.",
        },
        {
          label: "2 · Note default SG",
          screen: "Security Groups list",
          detail: [
            "Notice the default security group AWS created automatically.",
            "It allows ALL inbound and ALL outbound traffic — which is exactly why relying on it is risky.",
            "You can delete security groups you created, but selecting the default one and choosing Delete will fail.",
          ],
          warn: "The default security group CANNOT be deleted. Also note: deleting an EC2 instance does NOT delete its security group — they accumulate.",
        },
        {
          label: "3 · Launch",
          screen: "Launch instance → Network settings",
          detail: [
            "Launch an instance named my-web-server with Amazon Linux 2023, t2.micro.",
            "Select your existing key pair.",
            "Under Network settings choose Select existing security group.",
            "Pick my-web-server-SG — the one with no inbound rules.",
            "Click Launch instance.",
          ],
        },
        {
          label: "4 · SSH fails",
          screen: "Terminal",
          detail: [
            "Wait for the instance to reach the running state and copy its public IP.",
            "Run: ssh -i your-key.pem ec2-user@<public-ip>",
            "It fails. This is expected — the security group has no inbound rule, so port 22 is closed.",
          ],
          note: "Check the instance's Security tab and you will see the inbound rules list is empty.",
        },
        {
          label: "5 · Allow SSH",
          screen: "Security group → Edit inbound rules",
          detail: [
            "Open the security group and click Edit inbound rules.",
            "Click Add rule and choose type SSH — it fills in TCP port 22.",
            "For source choose Anywhere (0.0.0.0/0), or My IP to restrict it to your own machine.",
            "Click Save rules.",
            "Retry the SSH command — you are in.",
          ],
        },
        {
          label: "6 · Install web",
          screen: "SSH session on the instance",
          detail: [
            "Become root: sudo -i",
            "Install Apache: yum install httpd",
            "Start it: service httpd start",
            "Confirm the service shows as active.",
          ],
        },
        {
          label: "7 · Allow HTTP",
          screen: "Browser + Edit inbound rules",
          detail: [
            "Paste the instance's public IP into a browser. The page does NOT load — port 80 is still closed.",
            "Back in the security group, Edit inbound rules → Add rule → type HTTP (port 80) → source Anywhere.",
            "Save rules and reload the browser. The Apache page appears.",
          ],
          note: "Same lesson twice: the service was running the whole time. Only the security group was stopping you.",
        },
        {
          label: "8 · Prove stateful",
          screen: "Testing ICMP in both directions",
          detail: [
            "From your own machine, ping the instance. It FAILS — there is no inbound ICMP rule.",
            "Now SSH in and ping 8.8.8.8 from the instance. It WORKS, even though no inbound ICMP rule exists.",
            "Why: the instance INITIATED that connection, so the security group recorded the state and allows the reply back automatically.",
            "Add an inbound ICMP - IPv4 rule from 0.0.0.0/0 and save.",
            "Ping the instance from your machine again — now it works.",
          ],
          note: "The rule in one sentence: replies to connections YOU start need no inbound rule; connections OTHERS start do.",
        },
      ]}
    />
  );
}
