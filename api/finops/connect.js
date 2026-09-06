import { assumeRole, newExternalId, platformCredentials, AwsError } from "../_lib/aws.js";
import { cfnTemplate, onboardingSteps, trustPolicy, PERMISSION_POLICY, ROLE_NAME } from "../_lib/finops-onboarding.js";
import {
  AuthError, DbError, bearerToken, currentUser, supabaseConfig,
  listConnections, getConnection, createPending, activateConnection, deleteConnection,
} from "../_lib/connections.js";

export const config = { runtime: "edge" };

const ROLE_ARN = /^arn:aws(-[a-z]+)*:iam::(\d{12}):role\/[\w+=,.@/-]{1,512}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export default async function handler(req) {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!supabaseConfig()) {
    return json({ error: "not_configured", message: "This deployment has no database configured. Set SUPABASE_URL and SUPABASE_ANON_KEY." }, 503);
  }
  // Checked per action rather than up front: listing or deleting connections is
  // database-only work, and shouldn't break because AWS credentials are absent.
  const platform = platformCredentials();
  const needsAws = (action) => action === "init" || action === "verify";

  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  let token;
  try { token = bearerToken(req); } catch (err) { return json({ error: "unauthenticated", message: err.message }, 401); }

  if (needsAws(body.action) && !platform) {
    return json({ error: "not_configured", message: "This deployment has no platform AWS credentials yet. Set FINOPS_AWS_ACCESS_KEY_ID, FINOPS_AWS_SECRET_ACCESS_KEY and FINOPS_AWS_ACCOUNT_ID." }, 503);
  }

  try {
    // ── What the customer already has connected ──────────────────────────
    if (body.action === "list") {
      return json({ connections: await listConnections(token) });
    }

    // ── Start a new connection ───────────────────────────────────────────
    if (body.action === "init") {
      const user = await currentUser(token);
      const externalId = newExternalId();
      // Persisted before it is shown, so the ID the customer bakes into their
      // trust policy is the same one we will later present to STS. Nothing the
      // client sends back can change that pairing.
      const row = await createPending(token, user.id, externalId);
      if (!row) return json({ error: "db_error", message: "Could not start the connection." }, 500);

      const shared = { platformAccountId: platform.accountId, externalId };
      return json({
        connectionId: row.id,
        ...onboardingSteps(shared),
        roleName: ROLE_NAME,
        template: cfnTemplate(shared),
        trustPolicy: trustPolicy(shared),
        permissionPolicy: PERMISSION_POLICY,
      });
    }

    // ── Prove the role is usable and correctly locked down ───────────────
    if (body.action === "verify") {
      const { connectionId, roleArn, label } = body;
      const match = ROLE_ARN.exec(String(roleArn || "").trim());
      if (!match) {
        return json({ ok: false, reason: "bad_arn", message: "That does not look like a role ARN. It should look like arn:aws:iam::123456789012:role/AWSLearnFinOpsReadOnly." }, 400);
      }

      // Row-level security means a connection id belonging to someone else
      // simply is not visible here, so ownership needs no separate check.
      const row = await getConnection(token, connectionId);
      if (!row) return json({ ok: false, reason: "unknown_connection", message: "Start the connection again to get a fresh External ID." }, 404);

      const externalId = row.external_id;
      const arn = String(roleArn).trim();

      // Probe 1 — must work when we present the External ID.
      try {
        await assumeRole({ roleArn: arn, externalId });
      } catch (err) {
        const code = err instanceof AwsError ? err.code : "Unknown";
        const message =
          code === "AccessDenied"
            ? "AWS refused the connection. This usually means the stack is still being created, or the Role ARN was copied from a different account. Wait a minute and try again."
            : `AWS refused the connection (${code}). ${err.message}`;
        return json({ ok: false, reason: "assume_failed", code, message }, 400);
      }

      // Probe 2 — and must NOT work without it. AWS is explicit that a role a
      // third party can assume without the External ID leaves the customer open
      // to the confused-deputy problem, and that we should refuse to store it.
      let unguarded = false;
      try {
        await assumeRole({ roleArn: arn, externalId: null, sessionName: "finops-guard-check" });
        unguarded = true;
      } catch {
        // Expected: this failure is what proves the condition is enforced.
      }
      if (unguarded) {
        return json({
          ok: false,
          reason: "external_id_not_enforced",
          message:
            "We could assume this role WITHOUT your External ID, which means anyone who learns the role's name could read your billing data. We have not saved it. Recreate the role using the template we generated — it sets this condition for you.",
        }, 400);
      }

      const saved = await activateConnection(token, connectionId, {
        roleArn: arn,
        awsAccountId: match[2],
        label,
      });
      return json({
        ok: true,
        connection: saved,
        message: "Connected. We verified the role works and that it cannot be used without your External ID.",
      });
    }

    if (body.action === "delete") {
      await deleteConnection(token, body.connectionId);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    if (err instanceof AuthError) return json({ error: "unauthenticated", message: err.message }, 401);
    if (err instanceof DbError) return json({ error: "db_error", message: err.message }, 500);
    return json({ error: "unexpected", message: "Something went wrong." }, 500);
  }
}
