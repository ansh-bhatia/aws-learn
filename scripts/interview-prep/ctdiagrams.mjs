// Diagrams for the Control Tower section.
//
// Console screenshots were the obvious thing to reach for here and would have
// been the wrong choice: AWS redesigns the console constantly, so a screenshot
// is wrong within months, and the setup is not hard to click — it is hard to
// picture. These draw the structure instead, which stays true.
import { diagram } from "./diagram.mjs";
import { tree } from "./tree.mjs";

/* 1 — the shape of the problem, and what the landing zone replaces */
export const beforeAfter = diagram({
  lanes: [
    { label: "Typical sprawl", nodes: [
      { id: "one", k: "ext", t: "One AWS account", s: "everything in it" },
      { id: "mix", k: "ext", t: "Prod + dev mixed", s: "same blast radius" },
      { id: "iam", k: "ext", t: "IAM users", s: "long-lived keys" },
    ] },
    { label: "What hurts", nodes: [
      { id: "blast", k: "ops", t: "One mistake reaches everything" },
      { id: "bill", k: "ops", t: "Cost cannot be attributed" },
      { id: "quota", k: "ops", t: "Shared service quotas" },
    ] },
    { label: "Landing zone", nodes: [
      { id: "ou", k: "compute", t: "Account per workload", s: "and environment" },
      { id: "scp", k: "compute", t: "SCPs per OU" },
      { id: "sso", k: "compute", t: "Identity Center", s: "short-lived roles" },
    ] },
    { label: "Result", nodes: [
      { id: "iso", k: "data", t: "Contained blast radius" },
      { id: "attr", k: "data", t: "Per-account billing" },
      { id: "sep", k: "data", t: "Enforced separation of duties" },
    ] },
  ],
  edges: [
    ["one", "blast"], ["mix", "bill"], ["iam", "quota"],
    ["blast", "ou"], ["bill", "scp"], ["quota", "sso"],
    ["ou", "iso"], ["scp", "attr"], ["sso", "sep"],
  ],
  caption: "The argument for multi-account is not tidiness — it is that the boundary is enforced by AWS rather than by convention.",
});

/* 2 — OU structure */
export const ouTree = tree({
  root: {
    t: "Organization Root", k: "root", s: "management account",
    children: [
      { t: "Security OU", k: "ou", children: [
        { t: "Log Archive", s: "immutable logs" },
        { t: "Audit", s: "security tooling" },
      ] },
      { t: "Infrastructure OU", k: "ou", children: [
        { t: "Network", s: "TGW, IPAM" },
        { t: "Shared services", s: "CI, AD, DNS" },
      ] },
      { t: "Workloads OU", k: "ou", children: [
        { t: "Prod accounts", k: "prod", s: "strict SCPs" },
        { t: "Non-prod", s: "relaxed" },
      ] },
      { t: "Sandbox OU", k: "ou", children: [
        { t: "Per-engineer", k: "sbx", s: "spend capped" },
      ] },
      { t: "Suspended OU", k: "ou", children: [
        { t: "Decommissioned", k: "prod", s: "deny-all SCP" },
      ] },
    ],
  },
  caption: "Structure by environment and risk, not by org chart — a reorganisation should not force accounts to move.",
});

/* 3 — where each control type intercepts */
export const controlTypes = diagram({
  lanes: [
    { label: "Someone acts", nodes: [
      { id: "dev", k: "client", t: "Engineer or pipeline", s: "creates a resource" },
    ] },
    { label: "Before deploy", nodes: [
      { id: "proa", k: "compute", t: "Proactive control", s: "CloudFormation hook" },
    ] },
    { label: "At the API", nodes: [
      { id: "prev", k: "ext", t: "Preventive control", s: "SCP — call fails" },
    ] },
    { label: "Resource exists", nodes: [
      { id: "res", k: "data", t: "Resource created" },
    ] },
    { label: "After the fact", nodes: [
      { id: "det", k: "ops", t: "Detective control", s: "Config rule flags it" },
      { id: "rem", k: "ops", t: "Remediation", s: "manual or automatic" },
    ] },
  ],
  edges: [
    ["dev", "proa", "template"],
    ["proa", "prev", "passes"],
    ["prev", "res", "allowed"],
    ["res", "det", "evaluated"],
    ["det", "rem", "flagged"],
  ],
  caption: "Preventive stops the call outright; detective lets it happen and reports; proactive blocks before deployment.",
});

/* 4 — account vending */
export const vending = diagram({
  lanes: [
    { label: "Request", nodes: [
      { id: "req", k: "client", t: "New account request", s: "ticket or PR" },
    ] },
    { label: "Vend", nodes: [
      { id: "af", k: "compute", t: "Account Factory", s: "console" },
      { id: "aft", k: "compute", t: "AFT pipeline", s: "Terraform, reviewed" },
    ] },
    { label: "Baseline", nodes: [
      { id: "enroll", k: "ops", t: "Enrolled in the OU" },
      { id: "cfct", k: "compute", t: "Customizations", s: "CfCT templates" },
    ] },
    { label: "Applied", nodes: [
      { id: "ctrl", k: "data", t: "Controls inherited", s: "from the OU" },
      { id: "net", k: "data", t: "Baseline VPC", s: "with endpoints" },
      { id: "logc", k: "data", t: "Logging wired up" },
    ] },
    { label: "Handover", nodes: [
      { id: "team", k: "client", t: "Team gets access", s: "permission set" },
    ] },
  ],
  edges: [
    ["req", "af"], ["req", "aft"],
    ["af", "enroll"], ["aft", "enroll"],
    ["enroll", "cfct"],
    ["cfct", "net"], ["enroll", "ctrl"], ["cfct", "logc"],
    ["ctrl", "team"],
  ],
  caption: "A vended account arrives governed. Retro-fitting guardrails onto hand-made accounts is the work this avoids.",
});

/* 5 — log centralisation */
export const logging = diagram({
  lanes: [
    { label: "Every account", nodes: [
      { id: "ct", k: "compute", t: "CloudTrail", s: "API activity" },
      { id: "cfg", k: "compute", t: "AWS Config", s: "resource state" },
      { id: "flow", k: "compute", t: "VPC Flow Logs", s: "network" },
    ] },
    { label: "Organisation trail", nodes: [
      { id: "org", k: "ops", t: "Org-wide trail", s: "cannot be disabled locally" },
    ] },
    { label: "Log Archive account", nodes: [
      { id: "s3", k: "data", t: "Central S3 bucket", s: "write-only from workloads" },
      { id: "lock", k: "data", t: "Retention + Object Lock" },
    ] },
    { label: "Audit account", nodes: [
      { id: "sh", k: "ops", t: "Security Hub / GuardDuty" },
      { id: "ath", k: "ops", t: "Athena over logs", s: "investigation" },
    ] },
  ],
  edges: [
    ["ct", "org"], ["cfg", "org"], ["flow", "org"],
    ["org", "s3"],
    ["s3", "lock"],
    ["s3", "sh", "read"],
    ["s3", "ath", "read"],
  ],
  caption: "Logs flow one way. A workload account can write but never delete, which is what makes the trail evidence.",
});

/* 6 — identity */
export const identity = diagram({
  lanes: [
    { label: "Source of truth", nodes: [
      { id: "idp", k: "ext", t: "Corporate IdP", s: "Entra ID / Okta" },
    ] },
    { label: "Groups", nodes: [
      { id: "grp", k: "ops", t: "Directory groups", s: "aws-prod-readonly" },
    ] },
    { label: "Identity Center", nodes: [
      { id: "ps", k: "compute", t: "Permission set", s: "policy template" },
      { id: "asg", k: "compute", t: "Assignment", s: "group × account" },
    ] },
    { label: "In the account", nodes: [
      { id: "role", k: "data", t: "IAM role", s: "created for you" },
      { id: "cred", k: "data", t: "Short-lived credentials" },
    ] },
    { label: "Never", nodes: [
      { id: "no", k: "ext", t: "IAM users", s: "no long-lived keys" },
    ] },
  ],
  edges: [
    ["idp", "grp", "sync"],
    ["grp", "asg"],
    ["ps", "asg"],
    ["asg", "role", "provisions"],
    ["role", "cred", "assume"],
    ["cred", "no", "replaces", { dashed: true }],
  ],
  caption: "Joiners and leavers are handled in the directory. Nothing has to be revoked account by account.",
});

/* 7 — network hub and spoke */
export const network = diagram({
  lanes: [
    { label: "Network account", nodes: [
      { id: "ipam", k: "ops", t: "IPAM", s: "allocates CIDRs" },
      { id: "tgw", k: "compute", t: "Transit Gateway", s: "the hub" },
      { id: "egr", k: "compute", t: "Central egress", s: "shared NAT" },
    ] },
    { label: "Attachments", nodes: [
      { id: "att", k: "ops", t: "VPC attachments", s: "one per spoke" },
    ] },
    { label: "Workload VPCs", nodes: [
      { id: "p", k: "ext", t: "Prod VPC" },
      { id: "n", k: "client", t: "Non-prod VPC" },
      { id: "s", k: "client", t: "Shared services VPC" },
    ] },
    { label: "Private access", nodes: [
      { id: "vpce", k: "data", t: "VPC endpoints", s: "S3, ECR, logs" },
    ] },
  ],
  edges: [
    ["ipam", "att", "non-overlapping"],
    ["tgw", "att"],
    ["att", "p"], ["att", "n"], ["att", "s"],
    ["p", "vpce", "no NAT"],
    ["egr", "p", "internet only", { dashed: true }],
  ],
  caption: "IPAM first. Overlapping CIDRs block Transit Gateway attachments and are the most expensive landing-zone regret.",
});
