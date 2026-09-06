import { assumeRole, newExternalId, platformCredentials, AwsError } from "../_lib/aws.js";
import { cfnTemplate, onboardingSteps, trustPolicy, PERMISSION_POLICY, ROLE_NAME } from "../_lib/finops-onboarding.js";

export const config = { runtime: "edge" };

const ROLE_ARN = /^arn:aws(-[a-z]+)*:iam::\d{12}:role\/[\w+=,.@/-]{1,512}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export default async function handler(req) {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const platform = platformCredentials();
  if (!platform) {
    return json(
      {
        error: "not_configured",
        message:
          "This deployment has no platform AWS credentials yet, so connections cannot be verified. Set FINOPS_AWS_ACCESS_KEY_ID, FINOPS_AWS_SECRET_ACCESS_KEY and FINOPS_AWS_ACCOUNT_ID.",
      },
      503
    );
  }

  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  // ── Hand the customer everything they need to build the role ────────────
  if (body.action === "init") {
    const externalId = newExternalId();
    const shared = { platformAccountId: platform.accountId, externalId };
    return json({
      ...onboardingSteps(shared),
      roleName: ROLE_NAME,
      template: cfnTemplate(shared),
      trustPolicy: trustPolicy(shared),
      permissionPolicy: PERMISSION_POLICY,
    });
  }

  // ── Prove the role is both usable and correctly locked down ─────────────
  if (body.action === "verify") {
    const { roleArn, externalId } = body;
    if (!ROLE_ARN.test(String(roleArn || ""))) {
      return json({ ok: false, reason: "bad_arn", message: "That does not look like a role ARN. It should look like arn:aws:iam::123456789012:role/AWSLearnFinOpsReadOnly." }, 400);
    }
    if (!/^[0-9a-f]{32,64}$/.test(String(externalId || ""))) {
      return json({ ok: false, reason: "bad_external_id", message: "Missing or malformed External ID. Start the connection again to get a fresh one." }, 400);
    }

    // Probe 1 — the role must work when we present the External ID.
    try {
      await assumeRole({ roleArn, externalId });
    } catch (err) {
      const code = err instanceof AwsError ? err.code : "Unknown";
      const message =
        code === "AccessDenied"
          ? "AWS refused the connection. This usually means the stack is still being created, or the Role ARN was copied from a different account. Wait a minute and try again."
          : `AWS refused the connection (${code}). ${err.message}`;
      return json({ ok: false, reason: "assume_failed", code, message }, 400);
    }

    // Probe 2 — and it must NOT work without it. AWS is explicit that a role a
    // third party can assume without the External ID leaves the customer open
    // to the confused-deputy problem, and that we should refuse to store it.
    let unguarded = false;
    try {
      await assumeRole({ roleArn, externalId: null, sessionName: "finops-guard-check" });
      unguarded = true;
    } catch {
      // Expected: this is the failure that proves the condition is enforced.
    }
    if (unguarded) {
      return json(
        {
          ok: false,
          reason: "external_id_not_enforced",
          message:
            "We could assume this role WITHOUT your External ID, which means anyone who learns the role's name could read your billing data. We have not saved it. Recreate the role using the template we generated — it sets this condition for you.",
        },
        400
      );
    }

    return json({ ok: true, roleArn, message: "Connected. We verified the role works and that it cannot be used without your External ID." });
  }

  return json({ error: "Unknown action" }, 400);
}
