import { useState } from "react";
import "./IAMVisuals2.css";

/* ─── 1. THE 3 IAM REPORTS ─────────────────────────────────────────── */
export function IAMReports() {
  const [sel, setSel] = useState(0);

  const reports = [
    { name: "Credential Report", icon: "📄", color: "#dd344c",
      scope: "All IAM users", format: "Downloadable CSV", region: "Global", cost: "Free",
      what: "A snapshot of every IAM user's credential status: password enabled/last-used/last-changed, MFA enabled, access keys (active? last used? last rotated?).",
      use: "Auditing & compliance — spot users without MFA or with stale keys." },
    { name: "Access Advisor", icon: "🧭", color: "#e3b341",
      scope: "Users, groups & roles", format: "In-console (real-time)", region: "Global", cost: "Free",
      what: "For a chosen entity, shows which services its policies allow and when each was last accessed.",
      use: "Tighten policies — revoke permissions to services never used (least privilege)." },
    { name: "Access Analyzer", icon: "🔍", color: "#3fb950",
      scope: "Resources & policies", format: "In-console findings", region: "Per-region (not global!)", cost: "External: free · Unused: paid",
      what: "Finds resources shared with EXTERNAL entities (public S3, cross-account roles, KMS keys…) and UNUSED permissions.",
      use: "Detect unintended external exposure & dead permissions that widen the attack surface." },
  ];
  const r = reports[sel];

  return (
    <div className="sv-card iam2-card">
      <div className="sv-title iam2-title">📊 The 3 IAM Reports</div>
      <p className="iam2-intro">
        IAM is a security service — so it generates reports for <strong>auditing & compliance</strong>. Three kinds:
      </p>

      <div className="iam2-rep-tabs">
        {reports.map((rep, i) => (
          <button key={i} className={`iam2-rep-tab ${sel === i ? "active" : ""}`} style={{ "--rc": rep.color }} onClick={() => setSel(i)}>
            <span className="iam2-rep-icon">{rep.icon}</span><span>{rep.name}</span>
          </button>
        ))}
      </div>

      <div className="iam2-rep-detail" style={{ "--rc": r.color }}>
        <div className="iam2-rep-name">{r.icon} {r.name}</div>
        <div className="iam2-rep-what">{r.what}</div>
        <div className="iam2-rep-grid">
          <div><span>Scope</span>{r.scope}</div>
          <div><span>Format</span>{r.format}</div>
          <div><span>Region</span>{r.region}</div>
          <div><span>Cost</span>{r.cost}</div>
        </div>
        <div className="iam2-rep-use">🎯 {r.use}</div>
      </div>

      <div className="iam2-note">
        💡 Exam cues: <strong>Credential Report = CSV of all users</strong>; <strong>Access Advisor = last-accessed
        services per entity</strong>; <strong>Access Analyzer = external sharing & is per-region</strong> (unlike the rest of IAM, which is global).
      </div>
    </div>
  );
}

/* ─── 2. AWS ORGANIZATIONS ─────────────────────────────────────────── */
export function AWSOrganizations() {
  const [tab, setTab] = useState("tree");

  return (
    <div className="sv-card iam2-card">
      <div className="sv-title iam2-title">🏢 AWS Organizations</div>
      <p className="iam2-intro">
        Manage <strong>multiple AWS accounts</strong> centrally (separate accounts for departments, prod/test, billing,
        compliance…). Free service. Two headline benefits: <strong>consolidated billing</strong> and <strong>SCPs</strong>.
      </p>

      <div className="iam2-org-tabs">
        <button className={`iam2-org-tab ${tab === "tree" ? "active" : ""}`} onClick={() => setTab("tree")}>Hierarchy</button>
        <button className={`iam2-org-tab ${tab === "billing" ? "active" : ""}`} onClick={() => setTab("billing")}>Consolidated Billing</button>
      </div>

      {tab === "tree" ? (
        <div className="iam2-org-tree">
          <div className="iam2-org-root">🌳 Root</div>
          <div className="iam2-org-branch">
            <div className="iam2-org-node mgmt">👑 Management account<small>(Cloud Fox Hub)</small></div>
            <div className="iam2-org-ou">
              <div className="iam2-org-node ou">📁 OU: R&D dept</div>
              <div className="iam2-org-members">
                <div className="iam2-org-node member">🔑 Account A</div>
                <div className="iam2-org-node member">🔑 New dept</div>
              </div>
            </div>
          </div>
          <div className="iam2-note" style={{ marginTop: 14 }}>
            💡 Add accounts by <strong>creating new</strong> ones (no card needed — mgmt account pays) or <strong>inviting existing</strong>
            ones (the invited root user accepts). Group accounts into <strong>Organizational Units (OUs)</strong> to apply policies in bulk.
          </div>
        </div>
      ) : (
        <div className="iam2-billing">
          <div className="iam2-bill-flow">
            <div className="iam2-bill-acct">🔑 Account A<span>$120</span></div>
            <div className="iam2-bill-acct">🔑 New dept<span>$80</span></div>
            <div className="iam2-bill-arrow">→</div>
            <div className="iam2-bill-mgmt">👑 Management<br/>account<span>one bill: $200</span></div>
          </div>
          <ul className="iam2-bill-pts">
            <li>One consolidated bill across all accounts — simpler payment</li>
            <li>Pooled usage can qualify for <strong>volume discounts</strong></li>
            <li>Track spend per account/department for budgeting</li>
            <li>Enabled automatically when an account joins</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── 3. SCP SIMULATOR (centerpiece) ───────────────────────────────── */
export function SCPSimulator() {
  // Each level can be: "full" (FullAWSAccess), "allow-ec2" (only EC2), "deny-s3", "deny-ec2", "none"
  const levels = ["Root", "OU (Sandbox)", "Account"];
  const [scp, setScp] = useState(["full", "full", "full"]);
  const options = [
    { v: "full", label: "FullAWSAccess (allow all)" },
    { v: "allow-ec2", label: "Allow EC2 only" },
    { v: "deny-s3", label: "Full + Deny S3" },
    { v: "deny-ec2", label: "Full + Deny EC2" },
    { v: "none", label: "No SCP attached" },
  ];

  // Compute effective access for S3 and EC2 (assuming IAM grants admin).
  // Rule: a service is allowed only if ALLOWED at every level AND not denied anywhere.
  function allowed(service) {
    for (const lvl of scp) {
      if (lvl === "none") return false;                 // no allow at this level → deny
      if (lvl === "deny-s3" && service === "s3") return false;
      if (lvl === "deny-ec2" && service === "ec2") return false;
      if (lvl === "allow-ec2" && service !== "ec2") return false; // only EC2 allowed here
      // "full" allows everything; "deny-x" still allows the other service
    }
    return true;
  }
  const s3 = allowed("s3"), ec2 = allowed("ec2"), lambda = allowed("lambda");

  return (
    <div className="sv-card iam2-card">
      <div className="sv-title iam2-title">🛡️ Service Control Policy (SCP) Simulator</div>
      <p className="iam2-intro">
        SCPs are <strong>guardrails</strong> — they <em>limit</em> what accounts can do; they never <em>grant</em> permissions
        (IAM still does that). They apply to <strong>member accounts</strong> (incl. their root user), not the management account.
        Set the SCP at each level and see what an <strong>admin user</strong> can actually do.
      </p>

      <div className="iam2-scp-levels">
        {levels.map((lvl, i) => (
          <div key={i} className="iam2-scp-level">
            <div className="iam2-scp-level-name">{lvl}</div>
            <select value={scp[i]} onChange={(e) => setScp(scp.map((s, j) => j === i ? e.target.value : s))} className="iam2-scp-select">
              {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
            {i < levels.length - 1 && <div className="iam2-scp-down">↓ inherits</div>}
          </div>
        ))}
      </div>

      <div className="iam2-scp-result">
        <div className="iam2-scp-result-title">Effective access (IAM = AdministratorAccess):</div>
        <div className="iam2-scp-services">
          {[["EC2", ec2], ["S3", s3], ["Lambda", lambda]].map(([n, ok]) => (
            <div key={n} className={`iam2-scp-svc ${ok ? "allow" : "deny"}`}>
              {ok ? "✅" : "⛔"} {n}<span>{ok ? "Allowed" : "Blocked"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="iam2-note">
        💡 The golden rules: a service needs an <strong>Allow at EVERY level</strong> to pass; <strong>any Deny wins</strong>;
        and a level with <strong>no SCP = implicit deny</strong>. An explicit <code>Deny S3</code> at the OU blocks S3 for all
        accounts beneath it, even if their IAM admin allows it. (A default <strong>FullAWSAccess</strong> SCP is attached everywhere out of the box.)
      </div>
    </div>
  );
}

/* ─── 4. IAM IDENTITY CENTER (SSO) ─────────────────────────────────── */
export function IdentityCenterSSO() {
  const [withSSO, setWithSSO] = useState(true);

  return (
    <div className="sv-card iam2-card">
      <div className="sv-title iam2-title">🔑 IAM Identity Center (SSO)</div>
      <p className="iam2-intro">
        For workforce users who need <strong>multiple AWS accounts</strong>. Like one Google login for Gmail + Drive + YouTube —
        <strong> one</strong> identity signs into many accounts. No separate IAM user per account. (Requires AWS Organizations.)
      </p>

      <div className="iam2-sso-switch">
        <button className={`iam2-sso-btn ${!withSSO ? "active bad" : ""}`} onClick={() => setWithSSO(false)}>❌ Without SSO</button>
        <button className={`iam2-sso-btn ${withSSO ? "active good" : ""}`} onClick={() => setWithSSO(true)}>✅ With Identity Center</button>
      </div>

      {!withSSO ? (
        <div className="iam2-sso-stage">
          <div className="iam2-sso-user">🧑‍💻 User X<small>3 logins to juggle</small></div>
          <div className="iam2-sso-lines bad">
            {["Account 1", "Account 2", "Account 3"].map((a) => (
              <div key={a} className="iam2-sso-acct">🔑 IAM user<br/><small>{a}</small></div>
            ))}
          </div>
          <div className="iam2-sso-verdict bad">😩 Separate IAM user + password in every account — hard to manage.</div>
        </div>
      ) : (
        <div className="iam2-sso-stage">
          <div className="iam2-sso-user">🧑‍💻 User X<small>one login</small></div>
          <div className="iam2-sso-arrow">→</div>
          <div className="iam2-sso-hub">🔑 Identity Center<small>+ source: built-in / AD / SAML</small></div>
          <div className="iam2-sso-arrow">→</div>
          <div className="iam2-sso-lines good">
            <div className="iam2-sso-acct">🔑 Cloud Fox Hub<br/><small>EC2 FullAccess</small></div>
            <div className="iam2-sso-acct">🔑 Account A<br/><small>S3 FullAccess</small></div>
          </div>
        </div>
      )}

      <div className="iam2-sso-terms">
        {[
          ["Workforce identity", "A user who needs to reach multiple AWS accounts."],
          ["Identity source", "Where users live: built-in IAM Identity Center directory, Active Directory, or a SAML 2.0 IdP (one at a time)."],
          ["Permission set", "A bundle of permissions (e.g. EC2FullAccess) assigned per user, per account."],
          ["Multi-account permissions", "Map which user gets which permission set in which account."],
        ].map(([t, d]) => (
          <div key={t} className="iam2-sso-term"><span>{t}</span>{d}</div>
        ))}
      </div>

      <div className="iam2-note">
        💡 Create the user <strong>once</strong> in Identity Center, then assign permission sets per account: e.g. User X gets
        <strong> EC2 FullAccess in Account 1</strong> and <strong>S3 FullAccess in Account 2</strong>. Sign-in is via the SSO
        portal (MFA enforced); activity is logged in <strong>CloudTrail</strong>.
      </div>
    </div>
  );
}
