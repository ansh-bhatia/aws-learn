import React, { useState } from "react";
import "./EKSVisuals.css";

/* ════════════════════════════════════════════════════════════
   1. WHY EKS — managed Kubernetes for hybrid
   ════════════════════════════════════════════════════════════ */
export function WhyEKS() {
  const [sel, setSel] = useState("eks");
  const opts = {
    swarm: { t: "Docker Swarm", d: "Simple but not popular — lacks features like advanced scaling.", color: "#6e7681" },
    mesos: { t: "Apache Mesos", d: "Old, outdated system.", color: "#6e7681" },
    ecs: { t: "Amazon ECS", d: "Excellent — but AWS-native only. Best when your apps live entirely in AWS.", color: "#ff9900" },
    k8s: { t: "Kubernetes", d: "The #1 open-source standard. Runs anywhere — on-prem, cloud, hybrid. But complex to self-manage.", color: "#3fb950" },
    eks: { t: "Amazon EKS", d: "Kubernetes as a MANAGED service. You get all of Kubernetes; AWS handles the hard setup, patching & control plane.", color: "#1f6feb" },
  };
  const o = opts[sel];
  return (
    <div className="sv-card">
      <div className="sv-title eks-title">☸️ Why EKS? (Container Orchestrators)</div>
      <p className="eks-intro">
        Orchestrators manage containers in bulk (start/stop/restart, scale, network, storage). <b>Kubernetes</b> is the #1
        open-source standard — but complex to run yourself. <b>EKS</b> = Kubernetes as a managed AWS service. Click each:
      </p>
      <div className="eks-tabs">
        {Object.entries(opts).map(([id, v]) => (
          <button key={id} className={"eks-tab" + (sel === id ? " active" : "")} style={sel === id ? { borderColor: v.color, color: v.color } : {}} onClick={() => setSel(id)}>{v.t}</button>
        ))}
      </div>
      <div className="eks-detail" style={{ borderLeftColor: o.color }}>
        <b style={{ color: o.color }}>{o.t}</b>
        <p>{o.d}</p>
      </div>
      <p className="eks-note ok">🔑 The main reason to choose EKS: <b>hybrid cloud</b>. Run Kubernetes on-prem AND in AWS with the <b>same</b> tooling/skills — instead of juggling Kubernetes on-prem and ECS in the cloud. You get Kubernetes' power <b>without</b> managing servers, patches, or the control plane.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   2. K8S ARCHITECTURE — on-prem vs EKS responsibility
   ════════════════════════════════════════════════════════════ */
const ARCH = {
  control: { t: "🧠 Control Plane", sub: "The brain — decides where pods run, replicas, restarts, scaling",
    comps: "API Server (entry point for kubectl) · Scheduler (picks node for pod) · Controller Manager (keeps desired state) · etcd (cluster state DB)",
    onprem: "YOU install & run all components, handle HA, upgrades, patching, backups.",
    eks: "AWS runs the entire control plane — multi-AZ, secure, auto-scaled. Zero operational headache." },
  worker: { t: "💪 Worker Nodes", sub: "Machines where your app containers actually run",
    comps: "kubelet · kube-proxy · container runtime — installed on each node",
    onprem: "YOU provide/manage servers, install agents, patch, scale, health-check.",
    eks: "Choose EC2 node groups (you control infra) or Fargate (serverless). Scaling integrates with AWS Auto Scaling." },
  pod: { t: "📦 Pods & Containers", sub: "Smallest unit — runs one or more containers (like an ECS task)",
    comps: "Created with kubectl · run inside worker nodes · managed by the control plane",
    onprem: "You create pods AND must ensure infra is ready/scaled.",
    eks: "You focus only on deploying pods (same kubectl). AWS handles infra scaling behind it." },
};
export function K8sArchitecture() {
  const [sel, setSel] = useState("control");
  const a = ARCH[sel];
  return (
    <div className="sv-card">
      <div className="sv-title eks-title">🏛️ Kubernetes Architecture: On-Prem vs EKS</div>
      <p className="eks-intro">Three core layers. Click to compare who manages what:</p>
      <div className="eks-arch-stack">
        {Object.entries(ARCH).map(([id, v]) => (
          <div key={id} className={"eks-arch-layer " + id + (sel === id ? " active" : "")} onClick={() => setSel(id)}>
            <div className="eks-arch-t">{v.t}</div>
            <div className="eks-arch-sub">{v.sub}</div>
          </div>
        ))}
      </div>
      <div className="eks-arch-comps">🧩 {a.comps}</div>
      <div className="eks-split">
        <div className="eks-split-col onprem">
          <div className="eks-split-h">🏢 On-Premises</div>
          <p>{a.onprem}</p>
        </div>
        <div className="eks-split-col eks">
          <div className="eks-split-h">☁️ EKS</div>
          <p>{a.eks}</p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   3. K8S CLUSTER SERVICES — networking/LB/security/monitoring
   ════════════════════════════════════════════════════════════ */
const SVC_ROWS = [
  ["🌐 Networking", "Manual rules, physical switches, complex cross-node setup", "VPC CNI plugin — each pod gets a VPC IP, works with SG & NACL"],
  ["⚖️ Load Balancing", "Install ingress controllers / configure manually", "LoadBalancer service auto-creates an ALB/NLB with a public endpoint"],
  ["🔒 Security & IAM", "Manual RBAC, TLS certs, identity provider", "Native IAM — IRSA (IAM roles for service accounts), KMS encryption"],
  ["📊 Monitoring", "Third-party tools (Grafana, etc.) set up manually", "Built-in CloudWatch Logs, Container Insights, X-ray"],
];
export function K8sClusterServices() {
  return (
    <div className="sv-card">
      <div className="sv-title eks-title">🔌 Cluster Services: On-Prem vs EKS</div>
      <p className="eks-intro">Beyond compute, a cluster needs networking, load balancing, security & monitoring. EKS integrates them natively:</p>
      <div className="eks-table">
        <div className="eks-row head"><span className="feat">Area</span><span className="op">🏢 On-Premises</span><span className="ek">☁️ EKS</span></div>
        {SVC_ROWS.map((r, i) => (
          <div key={i} className="eks-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="eks-note">🧷 Key: the <b>VPC CNI plugin</b> acts like a NIC for pods — each pod gets a real VPC IP, so it works natively with AWS security.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   4. CLUSTER MODES — quick auto / custom auto / classic
   ════════════════════════════════════════════════════════════ */
export function EKSClusterModes() {
  const [mode, setMode] = useState("quick");
  return (
    <div className="sv-card">
      <div className="sv-title eks-title">⚙️ Cluster Creation Modes</div>
      <p className="eks-intro">
        <b>EKS Auto Mode</b> lets AWS manage worker nodes, networking, scaling & patching too (not just the control plane).
        Three ways to create a cluster:
      </p>
      <div className="eks-tabs">
        <button className={"eks-tab" + (mode === "quick" ? " active" : "")} onClick={() => setMode("quick")}>⚡ Quick + Auto</button>
        <button className={"eks-tab" + (mode === "custom" ? " active" : "")} onClick={() => setMode("custom")}>🎛️ Custom + Auto</button>
        <button className={"eks-tab" + (mode === "classic" ? " active" : "")} onClick={() => setMode("classic")}>🛠️ Classic (Auto off)</button>
      </div>
      <div className="eks-mode-bar">
        <div className={"eks-mode-seg you " + mode}>You manage</div>
        <div className={"eks-mode-seg aws " + mode}>AWS manages</div>
      </div>
      <div className="eks-detail">
        {mode === "quick" && <p><b>Quick Configuration + Auto Mode</b> — fastest &amp; simplest. Auto Mode is <b>always on</b> (can't disable). AWS manages control plane, worker nodes, scaling, networking, storage, add-ons & patching. You give only name, VPC, IAM role. <b>Limitation:</b> you can't edit any Auto Mode setting — accept all AWS defaults.</p>}
        {mode === "custom" && <p><b>Custom Configuration + Auto Mode</b> — automation <b>and</b> control. Keep Auto Mode benefits but customize: upgrade policy, <b>compute class</b> (general/system), cluster access (IAM access entries), customer-managed KMS key, ARC zonal shift, deletion protection, VPC/subnets/endpoint access, monitoring tools, add-ons.</p>}
        {mode === "classic" && <p><b>Classic Mode (Custom + Auto Mode OFF)</b> — AWS manages only the control plane; <b>you manage worker nodes</b> via <b>node groups</b>. Maximum control (choose EC2 or Fargate, OS, config, networking). Required for full manual setups &amp; Fargate.</p>}
      </div>
      <p className="eks-note">🧱 <b>Auto Mode compute</b> provisions/scales/patches EC2 for you automatically — but needs Auto Mode enabled. Classic mode = you run node groups yourself.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   5. NODE GROUPS (classic mode)
   ════════════════════════════════════════════════════════════ */
const NG_ROWS = [
  ["EC2 management", "Created & managed by AWS", "You create & manage manually"],
  ["Updates & scaling", "Automatic (AWS)", "Manual (you)"],
  ["Node registration", "Automatic", "Manual (run script)"],
  ["Control", "Less (AWS handles it)", "Full"],
  ["Use case", "Most users", "Custom OS/config/networking"],
];
export function NodeGroups() {
  return (
    <div className="sv-card">
      <div className="sv-title eks-title">🗃️ Node Groups &amp; Nodes (Classic Mode)</div>
      <p className="eks-intro">
        In <b>classic mode</b> you manage worker nodes via <b>node groups</b> (a set of nodes sharing config, each running
        the kubelet). Two node types: <b>EC2</b> (full control — GPU, memory, storage) or <b>Fargate</b> (serverless,
        classic-mode only). Two node-group types:
      </p>
      <div className="eks-table">
        <div className="eks-row head"><span className="feat">Aspect</span><span className="op">🤝 Managed Node Group</span><span className="ek">🔧 Self-Managed</span></div>
        {NG_ROWS.map((r, i) => (
          <div key={i} className="eks-row"><span className="feat">{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>
        ))}
      </div>
      <p className="eks-note warn">⚠️ <b>Managed node group ≠ Auto Mode.</b> Managed node groups exist only in <b>classic mode</b> (AWS handles EC2 but you still pick type/size/scaling). <b>Auto Mode</b> is higher automation — node groups are <b>invisible</b>; AWS manages everything via a built-in node pool.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   6. EKS ROLES
   ════════════════════════════════════════════════════════════ */
export function EKSRoles() {
  const [sel, setSel] = useState("cluster");
  return (
    <div className="sv-card">
      <div className="sv-title eks-title">🎫 EKS IAM Roles</div>
      <p className="eks-intro">
        Every EKS cluster needs <b>at least two roles</b>, created <b>before</b> cluster creation (or it fails). Click each:
      </p>
      <div className="eks-tabs">
        <button className={"eks-tab" + (sel === "cluster" ? " active" : "")} onClick={() => setSel("cluster")}>🧠 Cluster Role</button>
        <button className={"eks-tab" + (sel === "node" ? " active" : "")} onClick={() => setSel("node")}>💪 Node / Fargate Role</button>
      </div>
      <div className="eks-detail">
        {sel === "cluster"
          ? <p><b>Cluster IAM Role</b> — lets the EKS service (control plane) create &amp; manage AWS resources on your behalf: EC2, networking, load balancers. (In Auto Mode it provisions EC2 too.) Required in <b>all</b> modes.</p>
          : <p><b>Node IAM Role</b> (EC2) / <b>Fargate Pod Execution Role</b> — lets worker nodes/pods register with the control plane, pull images from <b>ECR</b>, send logs to CloudWatch, and access services like S3/DynamoDB (e.g. so an app pod can read/write S3).</p>}
      </div>
      <p className="eks-note ok">✅ Easiest way: in the console click <b>"Create recommended role"</b> — AWS auto-selects the service (EKS Auto Cluster / Auto Node) and attaches the <b>minimum required policies</b>. Add extra policies (e.g. S3) only if your app needs them.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   7. MANAGE CLUSTER — console vs kubectl + install steps
   ════════════════════════════════════════════════════════════ */
export function ManageCluster() {
  const [tool, setTool] = useState("kubectl");
  const [step, setStep] = useState(0);
  const steps = [
    { t: "Launch EC2 (same VPC)", d: "Create an EC2 instance in the SAME VPC as the cluster → it can reach even a private EKS endpoint. (Outbound 443 must be open.)" },
    { t: "Configure AWS CLI", d: "On Amazon Linux the CLI is pre-installed. Run aws configure with an access key/secret (lab) — IAM role is best practice." },
    { t: "Install kubectl", d: "curl the kubectl binary (matching the cluster's K8s version), chmod +x, move to /usr/local/bin." },
    { t: "Generate kubeconfig", d: "aws eks update-kubeconfig --name <cluster> --region <region> → writes the kubeconfig kubectl uses to connect." },
    { t: "Verify", d: "kubectl cluster-info, get ns, get pods. (get nodes shows nothing in Auto Mode — that's normal.)" },
  ];
  return (
    <div className="sv-card">
      <div className="sv-title eks-title">🖥️ Managing the Cluster: Console vs kubectl</div>
      <p className="eks-intro">Two ways to manage EKS. The console can't do real Kubernetes work — you need kubectl. Toggle:</p>
      <div className="eks-tabs">
        <button className={"eks-tab" + (tool === "console" ? " active" : "")} onClick={() => setTool("console")}>🖱️ AWS Console</button>
        <button className={"eks-tab" + (tool === "kubectl" ? " active" : "")} onClick={() => setTool("kubectl")}>⌨️ kubectl</button>
      </div>
      {tool === "console" ? (
        <div className="eks-detail">
          <b>AWS Console — cluster settings only</b>
          <p>✅ Can: view status/health/version, manage IAM access entries, add-ons, node groups, networking, monitoring. ❌ Can't: create pods/deployments, apply YAML, exec into pods, check logs, scale apps — because it doesn't talk to the Kubernetes API server.</p>
        </div>
      ) : (
        <>
          <div className="eks-detail">
            <b>kubectl — the real Kubernetes control tool</b>
            <p>Talks directly to the Kubernetes API server → create pods/deployments, apply YAML, exec, logs, scale. Install it on your <b>local PC</b> (needs a public/public+private endpoint) or on an <b>EC2 in the same VPC</b> (reaches private endpoints too).</p>
          </div>
          <div className="eks-step-track">
            {steps.map((s, i) => (
              <button key={i} className={"eks-step-node" + (step >= i ? " on" : "")} onClick={() => setStep(i)}>{i + 1}</button>
            ))}
          </div>
          <div className="eks-detail">
            <b>{steps[step].t}</b>
            <p>{steps[step].d}</p>
          </div>
        </>
      )}
    </div>
  );
}
