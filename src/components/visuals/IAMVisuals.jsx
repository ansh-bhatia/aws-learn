import { useState } from "react";
import "./IAMVisuals.css";

/* ─── 1. ROOT vs IAM USER ──────────────────────────────────────────── */
export function RootVsIAMUser() {
  const [view, setView] = useState("root");
  const root = view === "root";

  return (
    <div className="sv-card iam-card">
      <div className="sv-title iam-title">👑 Root User vs IAM User</div>
      <p className="iam-intro">
        The person who creates the AWS account is the <strong>root user</strong> — the unrestricted "king". For day-to-day
        work you create scoped <strong>IAM users</strong> (e.g. an "EC2 mastermind" and a "VPC visionary") instead of sharing root.
      </p>

      <div className="iam-switch">
        <button className={`iam-switch-btn ${root ? "active king" : ""}`} onClick={() => setView("root")}>👑 Root User</button>
        <button className={`iam-switch-btn ${!root ? "active" : ""}`} onClick={() => setView("iam")}>👤 IAM User</button>
      </div>

      <div className={`iam-rootview ${root ? "king" : "scoped"}`}>
        <div className="iam-rootview-icon">{root ? "👑" : "👤"}</div>
        <div className="iam-rootview-body">
          <div className="iam-rootview-title">{root ? "Root User" : "IAM User (EC2 mastermind)"}</div>
          <ul className="iam-rootview-list">
            {root ? (
              <>
                <li>Logs in with the account's <strong>email</strong> + password</li>
                <li><strong>Unrestricted</strong> — every service, billing, support, account settings</li>
                <li>Cannot be deleted or restricted</li>
                <li>⚠️ Dangerous if leaked — lock it down with MFA, use rarely</li>
              </>
            ) : (
              <>
                <li>Logs in via the account <strong>sign-in URL</strong> + username/password</li>
                <li><strong>No permissions by default</strong> — you attach policies</li>
                <li>Scoped to only what its job needs (e.g. EC2 only)</li>
                <li>Each person gets their own — actions are traceable</li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="iam-note">
        💡 Set a friendly <strong>account alias</strong> so the sign-in URL is <code>company.signin.aws.amazon.com/console</code>
        instead of exposing your 12-digit account ID. A new IAM user with no policy can log in but can do <strong>nothing</strong>.
      </div>
    </div>
  );
}

/* ─── 2. POLICY TYPES ──────────────────────────────────────────────── */
export function PolicyTypes() {
  const [sel, setSel] = useState("managed");

  const types = {
    managed: { name: "AWS Managed Policy", color: "#dd344c", reusable: "✅ Reusable", arn: "Has ARN",
      pts: ["Created & maintained by AWS", "Ready-to-use (e.g. AmazonEC2FullAccess)", "Auto-updated by AWS for new features", "Attach to many users/groups/roles", "❌ Can't edit; may grant related-service access you didn't intend"] },
    customer: { name: "Customer Managed Policy", color: "#e3b341", reusable: "✅ Reusable", arn: "Has ARN",
      pts: ["You create & maintain it (JSON or visual editor)", "Fine-grained — target specific resources (ARNs)", "Attach to many entities; versioned with rollback", "You update it manually", "Max size 6,144 characters"] },
    inline: { name: "Inline Policy", color: "#8c4fff", reusable: "❌ Not reusable", arn: "No ARN",
      pts: ["Embedded in ONE user/group/role (1-to-1)", "Deleted automatically when that entity is deleted", "Can't be shared or reused", "Best for short-term / strict-compliance needs", "No ARN of its own"] },
  };
  const t = types[sel];

  return (
    <div className="sv-card iam-card">
      <div className="sv-title iam-title">📜 The 3 Types of IAM Policy</div>
      <p className="iam-intro">
        A <strong>policy</strong> (JSON) defines <em>who can do what on which resources</em>. You attach policies to users,
        groups, and roles. Three kinds:
      </p>

      <div className="iam-pol-tabs">
        {Object.keys(types).map((k) => (
          <button key={k} className={`iam-pol-tab ${sel === k ? "active" : ""}`} style={{ "--pc": types[k].color }} onClick={() => setSel(k)}>
            {types[k].name}
          </button>
        ))}
      </div>

      <div className="iam-pol-detail" style={{ "--pc": t.color }}>
        <div className="iam-pol-head">
          <span className="iam-pol-name">{t.name}</span>
          <span className="iam-pol-tags"><span>{t.reusable}</span><span>{t.arn}</span></span>
        </div>
        <ul className="iam-pol-pts">{t.pts.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>

      <div className="iam-note">
        💡 Use <strong>AWS managed</strong> for speed, <strong>customer managed</strong> for fine-grained reusable control
        (e.g. "manage only these 2 EC2 instances"), and <strong>inline</strong> when a policy must live and die with one entity.
      </div>
    </div>
  );
}

/* ─── 3. POLICY EVALUATION SIMULATOR ───────────────────────────────── */
export function PolicyEvaluation() {
  const [allow, setAllow] = useState(false);
  const [deny, setDeny] = useState(false);

  // Logic: explicit deny wins > explicit allow > default deny
  let result, reason, cls;
  if (deny) { result = "DENIED"; reason = "An explicit Deny is present — it overrides everything."; cls = "deny"; }
  else if (allow) { result = "ALLOWED"; reason = "An explicit Allow matches and no Deny overrides it."; cls = "allow"; }
  else { result = "DENIED"; reason = "No policy allows the action → implicit (default) deny."; cls = "deny"; }

  return (
    <div className="sv-card iam-card">
      <div className="sv-title iam-title">⚖️ How Policies Are Evaluated</div>
      <p className="iam-intro">
        Three rules decide every request. Toggle the policies attached to a user and see the verdict.
      </p>

      <div className="iam-eval-toggles">
        <button className={`iam-eval-toggle ${allow ? "on allow" : ""}`} onClick={() => setAllow((v) => !v)}>
          {allow ? "✅" : "⬜"} Explicit <strong>Allow</strong> (e.g. EC2FullAccess)
        </button>
        <button className={`iam-eval-toggle ${deny ? "on deny" : ""}`} onClick={() => setDeny((v) => !v)}>
          {deny ? "⛔" : "⬜"} Explicit <strong>Deny</strong> (e.g. deny this instance)
        </button>
      </div>

      <div className="iam-eval-flow">
        <div className={`iam-eval-step ${deny ? "hit deny" : "pass"}`}>1. Explicit Deny?<span>{deny ? "YES → stop, DENY" : "no"}</span></div>
        <div className="iam-eval-arrow">→</div>
        <div className={`iam-eval-step ${!deny && allow ? "hit allow" : !deny ? "pass" : "skip"}`}>2. Explicit Allow?<span>{deny ? "skipped" : allow ? "YES → ALLOW" : "no"}</span></div>
        <div className="iam-eval-arrow">→</div>
        <div className={`iam-eval-step ${!deny && !allow ? "hit deny" : "skip"}`}>3. Default<span>{!deny && !allow ? "implicit DENY" : "—"}</span></div>
      </div>

      <div className={`iam-eval-result ${cls}`}>
        <strong>{result === "ALLOWED" ? "✅ ALLOWED" : "⛔ DENIED"}</strong> — {reason}
      </div>

      <div className="iam-note">
        💡 The golden rule: <strong>everything is denied by default</strong>; an <strong>explicit Allow</strong> grants access;
        an <strong>explicit Deny always wins</strong>, overriding any Allow. Test policies safely with the <strong>IAM Policy Simulator</strong>.
      </div>
    </div>
  );
}

/* ─── 4. IAM ENTITIES (users / groups / roles) ─────────────────────── */
export function IAMEntities() {
  const [sel, setSel] = useState("group");

  return (
    <div className="sv-card iam-card">
      <div className="sv-title iam-title">👥 IAM Entities — Users, Groups & Roles</div>

      <div className="iam-ent-tabs">
        {[["user", "👤 User"], ["group", "👥 Group"], ["role", "🎭 Role"]].map(([k, l]) => (
          <button key={k} className={`iam-ent-tab ${sel === k ? "active" : ""}`} onClick={() => setSel(k)}>{l}</button>
        ))}
      </div>

      {sel === "user" && (
        <div className="iam-ent-body">
          <p>A <strong>user</strong> represents one human or app with <strong>permanent</strong> credentials.</p>
          <ul>
            <li><strong>Console access:</strong> username + password (optional)</li>
            <li><strong>Programmatic access:</strong> Access Key ID + Secret Access Key for CLI/SDK — the secret is shown <strong>once</strong>; store it safely</li>
            <li>Permissions come from attached policies (none by default)</li>
            <li>Secure with <strong>MFA</strong> and an account <strong>password policy</strong> (length, complexity, expiry, no-reuse)</li>
          </ul>
        </div>
      )}
      {sel === "group" && (
        <div className="iam-ent-body">
          <p>A <strong>group</strong> is a collection of users with a similar role — attach the policy <strong>once</strong> and all members inherit it.</p>
          <div className="iam-group-viz">
            <div className="iam-group-box">
              <div className="iam-group-name">👥 EC2-Managers group<br/><small>policy: EC2FullAccess</small></div>
              <div className="iam-group-members">{["👤 user1", "👤 user2", "👤 user3"].map((u) => <span key={u}>{u}</span>)}</div>
            </div>
          </div>
          <ul>
            <li>Add a new teammate to the group → instantly gets the permissions</li>
            <li>No login of its own; a user can belong to multiple groups</li>
            <li>A <strong>Deny</strong> in any group still blocks the action</li>
          </ul>
        </div>
      )}
      {sel === "role" && (
        <div className="iam-ent-body">
          <p>A <strong>role</strong> grants <strong>temporary</strong> credentials to whoever <em>assumes</em> it — users, apps, or AWS services. No long-term keys.</p>
          <ul>
            <li>"For anyone who needs it, not just one person"</li>
            <li>Temporary credentials via <strong>STS</strong> (15 min – 12 hrs, default 1 hr)</li>
            <li>The safe way to let an EC2 instance reach S3 — no keys baked into code</li>
            <li>Has 5 use cases (see the next visual)</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── 5. ROLE USE CASES ────────────────────────────────────────────── */
export function RoleUseCases() {
  const [sel, setSel] = useState(0);

  const cases = [
    { name: "AWS Service", icon: "🔗", color: "#dd344c",
      desc: "Let an AWS service act on your behalf. e.g. an EC2 instance assumes a role to write to S3 — no access keys hard-coded in the app (the insecure way). The instance gets temporary credentials automatically.", },
    { name: "AWS Account (Assume Role)", icon: "🔁", color: "#e3b341",
      desc: "Let an IAM user temporarily 'switch' into a role for occasional access — same account or another account. e.g. developer Amit has daily EC2 access but assumes an 'S3-temp-access' role only when needed.", },
    { name: "Web Identity", icon: "🌐", color: "#3fb950",
      desc: "Let users sign in with Google / Facebook / Login-with-Amazon (OAuth 2.0 + OpenID Connect, JWT tokens). Great for millions of app users — no IAM user per person.", },
    { name: "SAML 2.0 Federation", icon: "🏢", color: "#2e73b8",
      desc: "Corporate single sign-on via Active Directory Federation Services (SAML 2.0, XML assertions — not JWT). One corporate login → access AWS, no separate IAM users.", },
    { name: "Custom Trust Policy", icon: "🛠️", color: "#8c4fff",
      desc: "Hand-craft exactly WHO can assume the role and UNDER WHAT CONDITIONS — e.g. cross-account only with MFA, only from a source IP range, only during a time window, or only for users in a certain department/group.", },
  ];
  const c = cases[sel];

  return (
    <div className="sv-card iam-card">
      <div className="sv-title iam-title">🎭 The 5 IAM Role Use Cases</div>

      <div className="iam-uc-tabs">
        {cases.map((uc, i) => (
          <button key={i} className={`iam-uc-tab ${sel === i ? "active" : ""}`} style={{ "--uc": uc.color }} onClick={() => setSel(i)}>
            <span className="iam-uc-icon">{uc.icon}</span>
            <span className="iam-uc-name">{uc.name}</span>
          </button>
        ))}
      </div>

      <div className="iam-uc-detail" style={{ "--uc": c.color }}>
        <div className="iam-uc-head"><span className="iam-uc-big">{c.icon}</span><span className="iam-uc-title">{c.name}</span></div>
        <div className="iam-uc-desc">{c.desc}</div>
      </div>

      <div className="iam-note">
        💡 Web Identity uses <strong>JWT</strong> tokens (Google/Facebook); SAML uses <strong>XML</strong> (corporate AD). Both
        let huge numbers of users in without creating IAM users for each.
      </div>
    </div>
  );
}

/* ─── 6. ASSUME ROLE FLOW (same vs cross account) ──────────────────── */
export function AssumeRoleFlow() {
  const [mode, setMode] = useState("cross");
  const [assumed, setAssumed] = useState(false);

  return (
    <div className="sv-card iam-card">
      <div className="sv-title iam-title">🔁 Assume Role — STS Temporary Access</div>
      <p className="iam-intro">
        Assuming a role swaps your identity for <strong>temporary STS credentials</strong> (default 1 hr). Switch the scenario
        and press "Switch role".
      </p>

      <div className="iam-switch">
        <button className={`iam-switch-btn ${mode === "same" ? "active" : ""}`} onClick={() => { setMode("same"); setAssumed(false); }}>Same account</button>
        <button className={`iam-switch-btn ${mode === "cross" ? "active" : ""}`} onClick={() => { setMode("cross"); setAssumed(false); }}>Cross account</button>
      </div>

      <div className="iam-ar-stage">
        <div className="iam-ar-acct">
          <div className="iam-ar-acct-name">{mode === "cross" ? "Photo Magic (trusted)" : "Account A"}</div>
          <div className="iam-ar-user">👤 {mode === "cross" ? "magic-editor" : "Amit (dev)"}</div>
        </div>

        <div className={`iam-ar-link ${assumed ? "on" : ""}`}>
          <span className="iam-ar-sts">STS</span>
          <span className="iam-ar-arrow">{assumed ? "🔑 temp creds →" : "assume →"}</span>
        </div>

        <div className="iam-ar-acct">
          <div className="iam-ar-acct-name">{mode === "cross" ? "Cloud Store (trusting)" : "Account A"}</div>
          <div className={`iam-ar-role ${assumed ? "active" : ""}`}>🎭 {mode === "cross" ? "cross-account-role" : "S3-temp-access role"}</div>
          <div className="iam-ar-res">🪣 {mode === "cross" ? "HD-pictures bucket" : "S3 bucket"}</div>
        </div>
      </div>

      <button className="iam-ar-btn" onClick={() => setAssumed((v) => !v)}>{assumed ? "↩ Switch back" : "🔁 Switch role"}</button>

      <div className={`iam-ar-status ${assumed ? "on" : ""}`}>
        {assumed
          ? `✅ Assumed the role — you now have the role's S3 permissions (only). Original permissions are paused until you switch back.`
          : `Not assumed — you have only your own identity's permissions.`}
      </div>

      <div className="iam-ar-trust">
        <strong>Trust relationship:</strong> the role's <em>trust policy</em> names who may assume it ({mode === "cross" ? "the other account's ID" : "user Amit's ARN"}); the user/account needs a policy allowing <code>sts:AssumeRole</code>.
      </div>

      <div className="iam-note">
        💡 Why assume-role beats sharing keys: credentials are <strong>temporary</strong> (expire ~1 hr), management is
        <strong> centralized</strong> (one role, add/remove trust), every assumption is <strong>audited in CloudTrail</strong>, and
        you can require <strong>MFA</strong>. {mode === "cross" && "For cross-account, never create IAM users for outside partners — let them assume a role."}
      </div>
    </div>
  );
}

/* ─── 7. ROOT BEST PRACTICES + MFA ─────────────────────────────────── */
export function RootBestPractices() {
  const [mfaOn, setMfaOn] = useState(false);
  const [step, setStep] = useState(0);

  const steps = ["Enter email + password", mfaOn ? "Enter 6-digit MFA code 📱" : "Logged in", "Logged in ✅"];
  const maxStep = mfaOn ? 2 : 1;

  return (
    <div className="sv-card iam-card">
      <div className="sv-title iam-title">🔐 Root User Best Practices & MFA</div>
      <p className="iam-intro">
        The root user is the keys to the kingdom. The #1 best practice is <strong>Multi-Factor Authentication</strong> — a second
        factor (a 6-digit code from Google Authenticator) on top of the password.
      </p>

      <div className="iam-mfa-demo">
        <div className="iam-mfa-toggle-row">
          <span>MFA on root:</span>
          <button className={`iam-mfa-switch ${mfaOn ? "on" : ""}`} onClick={() => { setMfaOn((v) => !v); setStep(0); }}>
            <span className="iam-mfa-knob" />{mfaOn ? "Enabled 🔒" : "Disabled 🔓"}
          </button>
        </div>

        <div className="iam-login-sim">
          <div className="iam-login-title">🔑 Root login</div>
          <div className="iam-login-steps">
            {steps.slice(0, maxStep + 1).map((s, i) => (
              <div key={i} className={`iam-login-step ${step >= i ? "done" : ""} ${step === i ? "current" : ""}`}>{s}</div>
            ))}
          </div>
          <button className="iam-ar-btn" onClick={() => setStep((s) => Math.min(maxStep, s + 1))} disabled={step >= maxStep}>
            {step >= maxStep ? "Signed in" : "Next step →"}
          </button>
        </div>
      </div>

      <div className="iam-bp-list">
        <div className="iam-bp-title">Root best practices</div>
        {[
          ["🔐 Enable MFA", "Mandatory — a stolen password alone can't log in."],
          ["🙅 Don't use root daily", "Create IAM users/roles for everyday work."],
          ["🗝️ No root access keys", "Delete any root access keys; use roles instead."],
          ["👥 Least privilege", "Grant only the permissions each identity needs."],
          ["📊 Audit with CloudTrail", "Track who did what, when."],
        ].map(([t, d]) => (
          <div key={t} className="iam-bp-item"><span className="iam-bp-t">{t}</span><span className="iam-bp-d">{d}</span></div>
        ))}
      </div>
    </div>
  );
}
