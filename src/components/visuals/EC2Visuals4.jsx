import { useState } from "react";
import "./EC2Visuals.css";
import "./EC2Visuals4.css";

/* ─── 1. INSTANCE FAMILY LETTER DECODER ────────────────────────────── */
export function InstanceFamilyDecoder() {
  const [sel, setSel] = useState("t");

  const families = {
    d: { letter: "D", name: "Dense storage", why: "Very high storage. For big data and massive parallel processing workloads." },
    a: { letter: "A", name: "ARM processor", why: "ARM-based (Advanced RISC Machine) — the low-energy architecture behind mobile chips and Apple's M-series." },
    i: { letter: "I", name: "IOPS", why: "High input/output operations per second. Reading and writing to storage is extremely fast." },
    r: { letter: "R", name: "RAM", why: "Extra-strong memory. Reach for this when the application is memory-hungry." },
    t: { letter: "T", name: "Cheap general purpose", why: "Balanced CPU, storage and RAM — and the cheapest of the balanced families. Where most learning labs live." },
    m: { letter: "M", name: "Main choice", why: "Also balanced general purpose, a step up from T. Not as cheap, but more capable." },
    c: { letter: "C", name: "Compute", why: "High CPU. For applications whose bottleneck is processing power." },
    g: { letter: "G", name: "Graphics", why: "Comes with a graphics processor — for graphical workloads." },
    f: { letter: "F", name: "FPGA", why: "Field-programmable gate array, for real-time video processing. Think live cricket or football streaming, or OTT platforms." },
    p: { letter: "P", name: "Pics / GPU", why: "General-purpose GPU, aimed at machine learning." },
    u: { letter: "U", name: "Bare metal", why: "No operating system layer supplied — you get the bare-metal server itself." },
    x: { letter: "X", name: "Extreme memory", why: "R already gives you RAM. Choose X when the requirement is genuinely extreme." },
    z: { letter: "Z", name: "Z factor", why: "Extreme memory AND extreme CPU together — very high configuration on both axes." },
  };

  const f = families[sel];

  return (
    <div className="viz-card">
      <div className="viz-title">🔤 Decoding the Instance Family Letter</div>
      <p className="ifam-intro">
        The first character of an instance name is not arbitrary — it tells you what the family is optimised
        for. Click a letter.
      </p>

      <div className="ifam-grid">
        {Object.keys(families).map((k) => (
          <button
            key={k}
            className={`ifam-key ${sel === k ? "active" : ""}`}
            onClick={() => setSel(k)}
          >
            {families[k].letter}
          </button>
        ))}
      </div>

      <div className="ifam-detail">
        <div className="ifam-detail-head">
          <span className="ifam-detail-letter">{f.letter}</span>
          <span className="ifam-detail-name">{f.name}</span>
        </div>
        <p className="ifam-detail-why">{f.why}</p>
      </div>

      <div className="ifam-gen">
        <div className="ifam-gen-title">Reading the rest of the name — <code>t2.xlarge</code></div>
        <div className="ifam-gen-row">
          <span className="ifam-chip">t</span>
          <span className="ifam-gen-txt">family — general purpose</span>
        </div>
        <div className="ifam-gen-row">
          <span className="ifam-chip">2</span>
          <span className="ifam-gen-txt">generation — t3 is newer than t2</span>
        </div>
        <div className="ifam-chip-row">
          <span className="ifam-chip">xlarge</span>
          <span className="ifam-gen-txt">size — 2xlarge doubles vCPU and memory again, and 4xlarge doubles it once more. <strong>Double the configuration means double the price.</strong></span>
        </div>
      </div>

      <div className="ifam-note">
        You are not expected to memorise which family suits which application. In practice your vendor tells
        you what the workload is, and you pick the family from that.
      </div>
    </div>
  );
}

/* ─── 2. NITRO vs HYPERVISOR ───────────────────────────────────────── */
export function NitroVsHypervisor() {
  const [nitro, setNitro] = useState(false);

  return (
    <div className="viz-card">
      <div className="viz-title">⚡ Nitro System — Bypassing the Hypervisor</div>
      <p className="ifam-intro">
        A normal instance reaches hardware <em>through</em> the hypervisor. A Nitro-based instance goes
        straight to it. Toggle to compare.
      </p>

      <div className="ntr-toggle">
        <button className={`ntr-btn ${!nitro ? "active" : ""}`} onClick={() => setNitro(false)}>
          Standard instance
        </button>
        <button className={`ntr-btn ${nitro ? "active" : ""}`} onClick={() => setNitro(true)}>
          Nitro-based instance
        </button>
      </div>

      <div className="ntr-stack">
        <div className="ntr-layer inst">🖥️ EC2 Instance <small>virtual machine</small></div>

        <div className="ntr-arrows">
          <span className={`ntr-arrow ${!nitro ? "on" : "dim"}`}>
            ↓ via hypervisor
          </span>
          <span className={`ntr-arrow bypass ${nitro ? "on" : "dim"}`}>
            ↓ direct access — bypasses hypervisor
          </span>
        </div>

        <div className={`ntr-layer hyp ${nitro ? "bypassed" : ""}`}>
          🧩 Hypervisor <small>{nitro ? "bypassed" : "shares hardware with the VM"}</small>
        </div>

        <div className="ntr-layer hw">🔧 Physical Hardware <small>CPU · RAM · storage</small></div>
      </div>

      <div className={`ntr-verdict ${nitro ? "fast" : ""}`}>
        {nitro
          ? "Nitro accesses the hardware directly, skipping the hypervisor layer — which is how it delivers an extreme level of performance."
          : "The hypervisor has full control of the hardware and shares it out. An instance needing 8 GB of RAM requests it from the hypervisor, which grants access to the physical memory."}
      </div>
    </div>
  );
}

/* ─── 3. PUBLIC vs PRIVATE IP ──────────────────────────────────────── */
export function PublicVsPrivateIP() {
  const [from, setFrom] = useState("internet");

  const targets = {
    web: { name: "Web server", pub: "1.1.1.1", priv: "172.16.0.2", hasPub: true },
    db: { name: "Database server", pub: null, priv: "172.16.0.3", hasPub: false },
  };

  const result =
    from === "internet"
      ? {
          web: { ok: true, via: "public IP", why: "You are coming over the internet, so only a public IP is routable. This works." },
          db: { ok: false, via: "—", why: "Private IPs are NOT routable on the internet. There is no way to reach this from outside." },
        }
      : {
          web: { ok: true, via: "private IP", why: "Both instances sit in the same AWS infrastructure, so they talk over private IPs." },
          db: { ok: true, via: "private IP", why: "Instance-to-instance communication inside AWS uses the private IP. This is the normal path." },
        };

  return (
    <div className="viz-card">
      <div className="viz-title">🌐 Public IP vs Private IP — Who Can Reach What</div>
      <p className="ifam-intro">
        Every instance <strong>always</strong> gets a private IP. A public IP is optional. Choose where you
        are connecting from and see what is reachable.
      </p>

      <div className="ntr-toggle">
        <button className={`ntr-btn ${from === "internet" ? "active" : ""}`} onClick={() => setFrom("internet")}>
          🌍 From the internet
        </button>
        <button className={`ntr-btn ${from === "web" ? "active" : ""}`} onClick={() => setFrom("web")}>
          🖥️ From the web server
        </button>
      </div>

      <div className="ipk-grid">
        {Object.entries(targets).map(([k, t]) => {
          const r = result[k];
          return (
            <div key={k} className={`ipk-box ${r.ok ? "ok" : "no"}`}>
              <div className="ipk-name">{t.name}</div>
              <div className="ipk-ips">
                <span className={`ipk-ip ${t.hasPub ? "pub" : "none"}`}>
                  public: {t.pub || "none"}
                </span>
                <span className="ipk-ip priv">private: {t.priv}</span>
              </div>
              <div className={`ipk-verdict ${r.ok ? "ok" : "no"}`}>
                {r.ok ? `✅ reachable via ${r.via}` : "❌ not reachable"}
              </div>
              <p className="ipk-why">{r.why}</p>
            </div>
          );
        })}
      </div>

      <div className="ifam-note">
        <strong>Private IP ranges</strong> are reserved and free to use without asking anyone:
        <code>10.0.0.0 – 10.255.255.255</code> (class A), <code>172.16.0.0 – 172.31.255.255</code> (class B),
        <code>192.168.0.0 – 192.168.255.255</code> (class C). A public IP must come from your ISP — and in AWS,
        AWS <em>is</em> your ISP.
      </div>
    </div>
  );
}

/* ─── 4. BASTION HOST ──────────────────────────────────────────────── */
export function BastionHostFlow() {
  const [hop, setHop] = useState(0);

  const servers = ["A · 172.16.0.2", "B · 172.16.0.3", "C · 172.16.0.4"];

  return (
    <div className="viz-card">
      <div className="viz-title">🛡️ The Bastion Host Pattern</div>
      <p className="ifam-intro">
        Company policy: <strong>no public IP on any application server</strong>. So how do you administer them
        from your office? You create one dedicated instance that does have a public IP, and go through it.
      </p>

      <div className="bh-flow">
        <div className={`bh-node home ${hop >= 0 ? "on" : ""}`}>
          <span className="bh-icon">🏠</span>
          <span className="bh-name">Your office</span>
          <small>Gujarat</small>
        </div>

        <span className={`bh-arrow ${hop >= 1 ? "on" : ""}`}>→<small>public IP</small></span>

        <div className={`bh-node bastion ${hop >= 1 ? "on" : ""}`}>
          <span className="bh-icon">🛡️</span>
          <span className="bh-name">Bastion host</span>
          <small>public + private IP</small>
        </div>

        <span className={`bh-arrow ${hop >= 2 ? "on" : ""}`}>→<small>private IP</small></span>

        <div className="bh-servers">
          {servers.map((s) => (
            <div key={s} className={`bh-node srv ${hop >= 2 ? "on" : ""}`}>
              <span className="bh-icon">🗄️</span>
              <span className="bh-name">{s.split(" · ")[0]}</span>
              <small>{s.split(" · ")[1]}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="bh-steps">
        <button className={`ntr-btn ${hop === 0 ? "active" : ""}`} onClick={() => setHop(0)}>1 · At your desk</button>
        <button className={`ntr-btn ${hop === 1 ? "active" : ""}`} onClick={() => setHop(1)}>2 · Into the bastion</button>
        <button className={`ntr-btn ${hop === 2 ? "active" : ""}`} onClick={() => setHop(2)}>3 · On to A / B / C</button>
      </div>

      <div className="bh-blurb">
        {hop === 0 && "You are in Gujarat. Servers A, B and C are in Mumbai with private IPs only — from here they are completely unreachable."}
        {hop === 1 && "Connect to the bastion host using its public IP. On Windows that is RDP (mstsc); on Linux, SSH."}
        {hop === 2 && "Now you are inside AWS. From the bastion, open a nested connection to A, B or C using their PRIVATE IPs. It is connections within connections — and it works."}
      </div>

      <div className="ifam-note">
        <strong>Interview question, almost verbatim:</strong> "Do you need to give every EC2 instance a public
        IP?" No. "Then how do you reach the ones without it?" A bastion host. Best practice is simple — if a
        public IP is not required, do not assign one, because the server is more secure without it.
      </div>
    </div>
  );
}
