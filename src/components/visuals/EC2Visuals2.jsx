import { useState, useEffect, useRef } from "react";
import "./EC2Visuals2.css";

/* ─── 1. ELASTIC IP DIAGRAM ──────────────────────────────────────── */
export function ElasticIPDiagram() {
  const [cycle, setCycle] = useState(0); // 0=running, 1=stopped, 2=restarted
  const [eipEnabled, setEipEnabled] = useState(false);
  const [ip, setIp] = useState("13.126.45.82");
  const [animating, setAnimating] = useState(false);

  const dynamicIPs = ["13.126.45.82", "52.66.120.19", "13.233.78.44", "65.0.15.200"];

  const doStop = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCycle(1);
      if (!eipEnabled) setIp("—");
      setAnimating(false);
    }, 800);
  };

  const doStart = () => {
    if (animating || cycle !== 1) return;
    setAnimating(true);
    setTimeout(() => {
      if (!eipEnabled) {
        const next = dynamicIPs.find((x) => x !== ip) || dynamicIPs[1];
        setIp(next);
      }
      setCycle(2);
      setAnimating(false);
    }, 800);
  };

  const reset = () => { setCycle(0); setIp(eipEnabled ? "52.66.99.10" : "13.126.45.82"); };

  const toggleEIP = () => {
    setEipEnabled((p) => !p);
    setCycle(0);
    setIp(!eipEnabled ? "52.66.99.10" : "13.126.45.82");
  };

  const stateColors = { 0: "#3fb950", 1: "#8b949e", 2: "#3fb950" };
  const stateLabel  = { 0: "Running", 1: "Stopped", 2: "Running" };

  return (
    <div className="viz-card2">
      <div className="viz-title2">🌐 Elastic IP vs Dynamic Public IP (Interactive)</div>

      <div className="eip-toggle-row">
        <span>Mode:</span>
        <button className={`eip-mode-btn ${!eipEnabled ? "active" : ""}`} onClick={() => { setEipEnabled(false); reset(); }}>
          Dynamic Public IP
        </button>
        <button className={`eip-mode-btn ${eipEnabled ? "active eip" : ""}`} onClick={() => { setEipEnabled(true); setCycle(0); setIp("52.66.99.10"); }}>
          ⚡ Elastic IP
        </button>
      </div>

      <div className="eip-scene">
        <div className="eip-instance" style={{ "--sc": stateColors[cycle] }}>
          <div className="eip-inst-icon">{cycle === 1 ? "💤" : "💻"}</div>
          <div className="eip-inst-label">EC2 Instance</div>
          <div className="eip-state" style={{ color: stateColors[cycle] }}>● {stateLabel[cycle]}</div>
          <div className={`eip-ip-badge ${animating ? "fade" : ""} ${cycle === 1 && !eipEnabled ? "no-ip" : ""}`}>
            {eipEnabled && <span className="eip-static-badge">⚡ EIP</span>}
            <span className="eip-ip-val">{cycle === 1 && !eipEnabled ? "No IP" : ip}</span>
          </div>
          {cycle === 2 && !eipEnabled && (
            <div className="eip-changed-badge">⚠️ IP Changed!</div>
          )}
          {cycle === 2 && eipEnabled && (
            <div className="eip-same-badge">✅ Same IP!</div>
          )}
        </div>

        <div className="eip-controls">
          <button className="eip-ctrl-btn stop" onClick={doStop} disabled={cycle !== 0 || animating}>
            ⏹ Stop Instance
          </button>
          <button className="eip-ctrl-btn start" onClick={doStart} disabled={cycle !== 1 || animating}>
            ▶ Start Instance
          </button>
          <button className="eip-ctrl-btn reset" onClick={reset} disabled={animating}>
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="eip-cost-table">
        <div className="eip-cost-title">💰 Elastic IP Pricing Rules</div>
        {[
          { state: "EIP attached to running instance", cost: "Free", green: true },
          { state: "EIP attached to stopped instance", cost: "~$0.005/hr", green: false },
          { state: "EIP allocated but not attached", cost: "~$0.005/hr", green: false },
        ].map((r, i) => (
          <div key={i} className={`eip-cost-row ${r.green ? "free" : "paid"}`}>
            <span>{r.state}</span>
            <span className={`eip-cost-val ${r.green ? "green" : "red"}`}>{r.cost}</span>
          </div>
        ))}
      </div>

      <div className="eip-lifecycle">
        <div className="eip-lc-title">Elastic IP Lifecycle</div>
        <div className="eip-lc-steps">
          {["Allocate EIP", "Associate with EC2", "Use freely", "Disassociate", "Release EIP"].map((s, i) => (
            <div key={i} className="eip-lc-step">
              <div className="eip-lc-num">{i + 1}</div>
              <div className="eip-lc-label">{s}</div>
              {i < 4 && <div className="eip-lc-arrow">→</div>}
            </div>
          ))}
        </div>
        <div className="eip-warn">⚠️ Forgetting to Release after terminating your instance = ongoing charges on an idle IP!</div>
      </div>
    </div>
  );
}

/* ─── 2. SECURITY GROUP SIMULATOR ────────────────────────────────── */
export function SecurityGroupSimulator() {
  const [tab, setTab] = useState("inbound");
  const [rules, setRules] = useState({
    inbound: [{ port: "80", proto: "TCP", source: "0.0.0.0/0", desc: "HTTP" }],
    outbound: [{ port: "All", proto: "All", dest: "0.0.0.0/0", desc: "All traffic" }],
  });
  const [testPort, setTestPort] = useState("80");
  const [testResult, setTestResult] = useState(null);

  const commonPorts = [
    { port: "22", label: "SSH (Linux access)" },
    { port: "80", label: "HTTP (Web)" },
    { port: "443", label: "HTTPS (Secure web)" },
    { port: "3389", label: "RDP (Windows access)" },
    { port: "3306", label: "MySQL" },
    { port: "5432", label: "PostgreSQL" },
  ];

  const addRule = () => {
    setRules((p) => ({
      ...p,
      [tab]: [...p[tab], { port: "443", proto: "TCP", source: "0.0.0.0/0", desc: "HTTPS" }],
    }));
  };

  const removeRule = (i) => {
    setRules((p) => ({ ...p, [tab]: p[tab].filter((_, idx) => idx !== i) }));
  };

  const updateRule = (i, field, val) => {
    setRules((p) => ({
      ...p,
      [tab]: p[tab].map((r, idx) => idx === i ? { ...r, [field]: val } : r),
    }));
  };

  const testTraffic = () => {
    const allowed = rules.inbound.some(
      (r) => r.port === "All" || r.port === testPort
    );
    setTestResult(allowed);
  };

  return (
    <div className="viz-card2">
      <div className="viz-title2">🛡️ Security Group Simulator</div>

      <div className="sg-tabs">
        {["inbound", "outbound"].map((t) => (
          <button key={t} className={`sg-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "inbound" ? "⬇️ Inbound Rules" : "⬆️ Outbound Rules"}
          </button>
        ))}
      </div>

      <div className="sg-default-note">
        {tab === "inbound"
          ? "Default (standalone SG): No inbound rules — all traffic blocked"
          : "Default: All outbound traffic allowed (0.0.0.0/0)"}
      </div>

      <div className="sg-rules-list">
        <div className="sg-rules-header">
          <span>Port</span><span>Protocol</span><span>{tab === "inbound" ? "Source" : "Destination"}</span><span>Description</span><span></span>
        </div>
        {rules[tab].map((r, i) => (
          <div key={i} className="sg-rule-row">
            <input className="sg-input" value={r.port} onChange={(e) => updateRule(i, "port", e.target.value)} />
            <input className="sg-input" value={r.proto} onChange={(e) => updateRule(i, "proto", e.target.value)} />
            <input className="sg-input wide" value={r.source || r.dest} onChange={(e) => updateRule(i, tab === "inbound" ? "source" : "dest", e.target.value)} />
            <input className="sg-input wide" value={r.desc} onChange={(e) => updateRule(i, "desc", e.target.value)} />
            <button className="sg-del-btn" onClick={() => removeRule(i)}>✕</button>
          </div>
        ))}
      </div>

      <div className="sg-actions">
        <button className="sg-add-btn" onClick={addRule}>+ Add Rule</button>
        <div className="sg-quick-add">
          Quick add:
          {commonPorts.map((p) => (
            <button key={p.port} className="sg-quick-btn"
              onClick={() => setRules((prev) => ({
                ...prev,
                [tab]: [...prev[tab], { port: p.port, proto: "TCP", source: "0.0.0.0/0", desc: p.label }],
              }))}>
              {p.port}
            </button>
          ))}
        </div>
      </div>

      <div className="sg-test">
        <div className="sg-test-title">🧪 Test Inbound Traffic</div>
        <div className="sg-test-row">
          <span>Test port:</span>
          <input className="sg-input small" value={testPort} onChange={(e) => setTestPort(e.target.value)} placeholder="e.g. 443" />
          <button className="sg-test-btn" onClick={testTraffic}>Check →</button>
        </div>
        {testResult !== null && (
          <div className={`sg-test-result ${testResult ? "allow" : "deny"}`}>
            {testResult
              ? `✅ Port ${testPort} — ALLOWED (matched inbound rule)`
              : `🚫 Port ${testPort} — BLOCKED (no matching inbound rule)`}
          </div>
        )}
      </div>

      <div className="sg-key-rules">
        {[
          { icon: "✅", text: "Allow-only model — no explicit deny rules needed" },
          { icon: "🔁", text: "One SG → multiple EC2 instances" },
          { icon: "📋", text: "One EC2 instance → multiple security groups" },
          { icon: "🗑️", text: "Default security group cannot be deleted" },
        ].map((r, i) => (
          <div key={i} className="sg-key-rule">{r.icon} {r.text}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── 3. STATEFUL EXPLAINER ──────────────────────────────────────── */
export function StatefulExplainer() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("stateful");

  const statefulSteps = [
    { label: "You Send Request", desc: "From EC2 (1.1.1.1) → HTTP server (2.2.2.2). Outbound: port 50000 → port 80.", side: "out", arrow: "→" },
    { label: "Outbound Check", desc: "Security group checks outbound rules. All traffic allowed ✅. State is recorded: '1.1.1.1:50000 → 2.2.2.2:80 is active'", side: "out", arrow: "→" },
    { label: "Server Replies", desc: "HTTP server sends response back. Source: 2.2.2.2:80 → Dest: 1.1.1.1:50000", side: "in", arrow: "←" },
    { label: "Inbound Check (Stateful)", desc: "Inbound rule = NONE. But security group checks state table: 'this is a reply to an outbound request I already tracked.' → ALLOWED ✅", side: "in", arrow: "←" },
    { label: "You Get the Page", desc: "Reply arrives at your browser. Web page loads successfully — even with no inbound rule.", side: "in", arrow: "←" },
  ];

  const statelessSteps = [
    { label: "You Send Request", desc: "From EC2 (1.1.1.1) → HTTP server. Outbound check: allowed ✅", side: "out" },
    { label: "Server Replies", desc: "Response comes back from 2.2.2.2:80 → 1.1.1.1:50000", side: "in" },
    { label: "Inbound Check (Stateless)", desc: "Stateless firewall has NO memory of the outbound request. It checks inbound rules only. Inbound = NONE → BLOCKED ❌", side: "in" },
    { label: "Page Fails to Load", desc: "You must explicitly add an inbound rule: Allow TCP port 1024-65535 from 0.0.0.0/0 (ephemeral ports). This makes stateless firewalls much harder to configure.", side: "in" },
  ];

  const steps = mode === "stateful" ? statefulSteps : statelessSteps;
  const cur = steps[step];

  return (
    <div className="viz-card2">
      <div className="viz-title2">🔄 Stateful vs Stateless — How Security Groups Remember Connections</div>

      <div className="sf-mode-row">
        <button className={`sf-mode-btn ${mode === "stateful" ? "active" : ""}`} onClick={() => { setMode("stateful"); setStep(0); }}>
          ✅ Stateful (Security Group)
        </button>
        <button className={`sf-mode-btn ${mode === "stateless" ? "active red" : ""}`} onClick={() => { setMode("stateless"); setStep(0); }}>
          ⚠️ Stateless (NACL)
        </button>
      </div>

      <div className="sf-diagram">
        <div className="sf-node you">
          <div className="sf-node-icon">💻</div>
          <div className="sf-node-label">Your EC2<br /><span>1.1.1.1</span></div>
        </div>

        <div className="sf-middle">
          <div className={`sf-sg-box ${mode}`}>
            <div className="sf-sg-label">Security Group</div>
            <div className="sf-sg-rules">
              <div className="sf-sg-rule out">OUT: All allowed</div>
              <div className="sf-sg-rule in none">IN: None</div>
            </div>
            {mode === "stateful" && (
              <div className="sf-state-table">
                <div className="sf-st-label">State Table</div>
                <div className="sf-st-entry">1.1.1.1:50000↔2.2.2.2:80</div>
              </div>
            )}
          </div>

          <div className={`sf-packet ${cur.side} ${step > 0 ? "show" : ""}`}>
            <div className="sf-pkt-label">
              {cur.side === "out" ? "→ Request (port 80)" : "← Reply (port 50000)"}
            </div>
          </div>
        </div>

        <div className="sf-node server">
          <div className="sf-node-icon">🌐</div>
          <div className="sf-node-label">HTTP Server<br /><span>2.2.2.2</span></div>
        </div>
      </div>

      <div className={`sf-step-card ${cur.side}`}>
        <div className="sf-step-num">Step {step + 1}</div>
        <div className="sf-step-label">{cur.label}</div>
        <div className="sf-step-desc">{cur.desc}</div>
      </div>

      <div className="sf-nav">
        <button className="sf-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Prev</button>
        <div className="sf-dots">
          {steps.map((_, i) => <div key={i} className={`sf-dot ${i === step ? "active" : i < step ? "done" : ""}`} onClick={() => setStep(i)} />)}
        </div>
        <button className="sf-btn" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>Next →</button>
      </div>

      <div className="sf-summary">
        <div className="sf-sum-col">
          <div className="sf-sum-head green">✅ Stateful (Security Groups)</div>
          <ul>
            <li>Tracks outbound connections</li>
            <li>Return traffic auto-allowed</li>
            <li>Instance-level protection</li>
            <li>Simpler to manage</li>
          </ul>
        </div>
        <div className="sf-sum-col">
          <div className="sf-sum-head yellow">⚠️ Stateless (NACLs)</div>
          <ul>
            <li>No connection memory</li>
            <li>Return traffic needs explicit rules</li>
            <li>Subnet-level protection</li>
            <li>More complex, more granular</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── 4. USER DATA DEMO ──────────────────────────────────────────── */
export function UserDataDemo() {
  const [mode, setMode] = useState("linux");
  const [running, setRunning] = useState(false);
  const [cmdStep, setCmdStep] = useState(-1);
  const timerRef = useRef(null);

  const linuxCmds = [
    { cmd: "yum update -y", desc: "Update all OS packages to latest version", time: 1200 },
    { cmd: "yum install -y httpd", desc: "Install Apache HTTP web server", time: 900 },
    { cmd: "systemctl start httpd", desc: "Start the web server service immediately", time: 400 },
    { cmd: "systemctl enable httpd", desc: "Auto-start web server on every reboot", time: 300 },
    { cmd: 'echo "<h1>Welcome!</h1>" > /var/www/html/index.html', desc: "Create the homepage HTML file", time: 200 },
  ];

  const winCmds = [
    { cmd: "<powershell>", desc: "PowerShell script block start", time: 300 },
    { cmd: "Install-WindowsFeature -name Web-Server -IncludeManagementTools", desc: "Install IIS Web Server with management tools", time: 1500 },
    { cmd: "New-Item -Path 'C:\\inetpub\\wwwroot\\index.html' -ItemType File", desc: "Create the homepage file", time: 400 },
    { cmd: "Set-Content -Path 'C:\\inetpub\\wwwroot\\index.html' -Value '<h1>Welcome!</h1>'", desc: "Write content to homepage", time: 300 },
    { cmd: "</powershell>", desc: "PowerShell script block end", time: 200 },
  ];

  const cmds = mode === "linux" ? linuxCmds : winCmds;

  const runScript = () => {
    if (running) return;
    setRunning(true);
    setCmdStep(0);
    let i = 0;
    const next = () => {
      if (i >= cmds.length) { setRunning(false); return; }
      setCmdStep(i);
      timerRef.current = setTimeout(() => { i++; next(); }, cmds[i].time);
    };
    next();
  };

  const resetSim = () => {
    clearTimeout(timerRef.current);
    setRunning(false);
    setCmdStep(-1);
  };

  return (
    <div className="viz-card2">
      <div className="viz-title2">⚙️ User Data Script Simulator</div>

      <div className="ud-concept">
        <div className="ud-flow">
          {["Write Script", "Paste in User Data", "Launch Instance", "Auto Executes on Boot", "Server Ready!"].map((s, i) => (
            <div key={i} className="ud-flow-step">
              <div className="ud-flow-circle">{i + 1}</div>
              <div className="ud-flow-label">{s}</div>
              {i < 4 && <div className="ud-flow-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="ud-modes">
        <button className={`ud-mode-btn ${mode === "linux" ? "active" : ""}`} onClick={() => { setMode("linux"); resetSim(); }}>
          🐧 Linux (Bash)
        </button>
        <button className={`ud-mode-btn ${mode === "windows" ? "active" : ""}`} onClick={() => { setMode("windows"); resetSim(); }}>
          🪟 Windows (PowerShell)
        </button>
      </div>

      <div className="ud-terminal">
        <div className="ud-term-bar">
          <span className="ud-term-dot red" /><span className="ud-term-dot yellow" /><span className="ud-term-dot green" />
          <span className="ud-term-title">{mode === "linux" ? "Amazon Linux 2 — User Data Execution" : "Windows Server — User Data Execution"}</span>
        </div>
        <div className="ud-term-body">
          {cmds.map((c, i) => (
            <div key={i} className={`ud-cmd-line ${i < cmdStep ? "done" : i === cmdStep ? "active" : "pending"}`}>
              <span className="ud-prompt">{mode === "linux" ? "$ " : "PS> "}</span>
              <span className="ud-cmd">{c.cmd}</span>
              {i === cmdStep && running && <span className="ud-spinner">⟳</span>}
              {i < cmdStep && <span className="ud-check">✓</span>}
            </div>
          ))}
          {cmdStep === cmds.length - 1 && !running && (
            <div className="ud-done-line">✅ User data script completed — web server is live!</div>
          )}
        </div>
      </div>

      {cmdStep >= 0 && cmdStep < cmds.length && (
        <div className="ud-cmd-desc">
          <strong>Running:</strong> {cmds[cmdStep].desc}
        </div>
      )}

      <div className="ud-controls">
        <button className="ud-run-btn" onClick={runScript} disabled={running}>
          {running ? "⟳ Running..." : "▶ Run Script"}
        </button>
        <button className="ud-reset-btn" onClick={resetSim} disabled={running}>
          🔄 Reset
        </button>
      </div>

      <div className="ud-usecases">
        <div className="ud-uc-title">💡 Why User Data is Essential</div>
        <div className="ud-uc-grid">
          {[
            { icon: "📈", title: "Auto Scaling", desc: "When Auto Scaling creates new instances automatically, User Data configures them — no manual SSH needed." },
            { icon: "⚡", title: "Faster Deployment", desc: "Your instance comes up fully configured. No waiting to SSH in and run commands manually." },
            { icon: "🔁", title: "Consistency", desc: "Every instance gets the exact same setup from the same script — no human error." },
            { icon: "🤖", title: "ChatGPT Tip", desc: 'Ask: "Write a bash script to install Apache on Amazon Linux 2 with a welcome page" — it will write it for you.' },
          ].map((u, i) => (
            <div key={i} className="ud-uc-card">
              <div className="ud-uc-icon">{u.icon}</div>
              <div className="ud-uc-title2">{u.title}</div>
              <div className="ud-uc-desc">{u.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 5. INSTANCE PROTECTION DEMO ───────────────────────────────── */
export function InstanceProtectionDemo() {
  const [termProt, setTermProt] = useState(false);
  const [stopProt, setStopProt] = useState(false);
  const [action, setAction] = useState(null);
  const [result, setResult] = useState(null);
  const [instanceState, setInstanceState] = useState("running");

  const attempt = (type) => {
    setAction(type);
    setTimeout(() => {
      if (type === "terminate" && termProt) {
        setResult({ ok: false, msg: "❌ Failed: The instance may not be terminated. Modify its disable API termination attribute and try again." });
      } else if (type === "stop" && stopProt) {
        setResult({ ok: false, msg: "❌ Failed: The instance may not be stopped. Modify the disable API stop instance attribute and try again." });
      } else if (type === "terminate") {
        setResult({ ok: true, msg: "✅ Instance terminated. It is now permanently deleted and cannot be recovered." });
        setInstanceState("terminated");
      } else if (type === "stop") {
        setResult({ ok: true, msg: "✅ Instance stopped. It will be billed for storage but not compute." });
        setInstanceState("stopped");
      } else if (type === "reboot") {
        setResult({ ok: true, msg: "✅ Instance rebooting..." });
      }
    }, 600);
  };

  const reset = () => {
    setAction(null);
    setResult(null);
    setInstanceState("running");
  };

  const stateColor = { running: "#3fb950", stopped: "#8b949e", terminated: "#f85149" };

  return (
    <div className="viz-card2">
      <div className="viz-title2">🔐 Termination & Stop Protection (Interactive)</div>

      <div className="prot-layout">
        <div className="prot-instance-panel">
          <div className="prot-instance" style={{ "--sc": stateColor[instanceState] }}>
            <div className="prot-inst-icon">{instanceState === "terminated" ? "💀" : instanceState === "stopped" ? "💤" : "💻"}</div>
            <div className="prot-inst-label">EC2 Instance</div>
            <div className="prot-state" style={{ color: stateColor[instanceState] }}>● {instanceState.toUpperCase()}</div>
            <div className="prot-badges">
              {termProt && <div className="prot-badge term">🔒 Termination Protected</div>}
              {stopProt && <div className="prot-badge stop">🔒 Stop Protected</div>}
            </div>
          </div>

          <div className="prot-actions">
            <div className="prot-actions-label">Instance Actions:</div>
            <button className="prot-action-btn stop" onClick={() => attempt("stop")} disabled={instanceState !== "running"}>⏹ Stop</button>
            <button className="prot-action-btn reboot" onClick={() => attempt("reboot")} disabled={instanceState !== "running"}>🔄 Reboot</button>
            <button className="prot-action-btn terminate" onClick={() => attempt("terminate")} disabled={instanceState === "terminated"}>🗑️ Terminate</button>
            {instanceState !== "running" && (
              <button className="prot-action-btn reset" onClick={reset}>↩ Reset</button>
            )}
          </div>

          {result && (
            <div className={`prot-result ${result.ok ? "ok" : "err"}`}>{result.msg}</div>
          )}
        </div>

        <div className="prot-settings-panel">
          <div className="prot-settings-title">⚙️ Protection Settings</div>

          <div className="prot-toggle-card" onClick={() => setTermProt((p) => !p)}>
            <div className="prot-toggle-info">
              <div className="prot-toggle-name">🔒 Termination Protection</div>
              <div className="prot-toggle-desc">Prevents permanent deletion of the instance</div>
            </div>
            <div className={`prot-toggle-switch ${termProt ? "on" : ""}`}>
              <div className="prot-toggle-knob" />
            </div>
          </div>

          <div className="prot-toggle-card" onClick={() => setStopProt((p) => !p)}>
            <div className="prot-toggle-info">
              <div className="prot-toggle-name">🛑 Stop Protection</div>
              <div className="prot-toggle-desc">Prevents stopping (powering off) the instance</div>
            </div>
            <div className={`prot-toggle-switch ${stopProt ? "on" : ""}`}>
              <div className="prot-toggle-knob" />
            </div>
          </div>

          <div className="prot-enable-path">
            <div className="prot-path-title">Where to enable:</div>
            <div className="prot-path-row">
              <span className="prot-path-chip">At launch</span>
              <span className="prot-path-arrow">→</span>
              <span className="prot-path-text">Advanced Details → Termination/Stop Protection</span>
            </div>
            <div className="prot-path-row">
              <span className="prot-path-chip">After launch</span>
              <span className="prot-path-arrow">→</span>
              <span className="prot-path-text">Actions → Instance Settings → Change Protection</span>
            </div>
          </div>
        </div>
      </div>

      <div className="prot-best-practice">
        <div className="prot-bp-title">✅ Production Best Practice</div>
        <div className="prot-bp-grid">
          {[
            { icon: "🏭", title: "All production instances", rule: "Enable Termination Protection — always" },
            { icon: "💾", title: "Instance Store AMIs", rule: "Enable Stop Protection — stopping erases all data" },
            { icon: "🔑", title: "Critical stateful apps", rule: "Enable both — two deliberate steps to delete" },
            { icon: "🧪", title: "Learning / lab instances", rule: "No protection — ALWAYS terminate after each lab" },
          ].map((b, i) => (
            <div key={i} className="prot-bp-card">
              <div className="prot-bp-icon">{b.icon}</div>
              <div className="prot-bp-title2">{b.title}</div>
              <div className="prot-bp-rule">{b.rule}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
