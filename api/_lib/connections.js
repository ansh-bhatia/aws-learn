// Per-customer AWS connections, read and written through PostgREST as the
// calling user.
//
// Deliberately no service-role key here. Every query carries the caller's own
// access token, so row-level security decides what they can see; a bug in a
// handler cannot leak another customer's connection because the database, not
// this file, is doing the filtering. It also means the edge runtime holds no
// credential capable of reading the whole table.

const TABLE = "finops_connections";

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url: url.replace(/\/+$/, ""), anonKey };
}

export class AuthError extends Error {}
export class DbError extends Error {}

// The bearer token is passed straight through to PostgREST rather than being
// decoded here: Supabase already validates signature and expiry, and doing it
// in two places invites the two checks to disagree.
export function bearerToken(req) {
  const header = req.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (!/^bearer$/i.test(scheme || "") || !token) {
    throw new AuthError("Sign in to manage AWS connections.");
  }
  return token;
}

async function rest(token, path, { method = "GET", body, prefer } = {}) {
  const cfg = supabaseConfig();
  if (!cfg) throw new DbError("Database is not configured.");

  const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: cfg.anonKey,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(prefer ? { prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { /* non-JSON error body */ }

  if (res.status === 401 || res.status === 403) {
    throw new AuthError("Your session has expired. Sign in again.");
  }
  if (!res.ok) {
    throw new DbError(parsed?.message || `Database request failed (${res.status})`);
  }
  return parsed;
}

// Who the caller is, straight from the auth server. Used only for display and
// for stamping user_id on insert — never as the thing that grants access.
export async function currentUser(token) {
  const cfg = supabaseConfig();
  if (!cfg) throw new DbError("Database is not configured.");
  const res = await fetch(`${cfg.url}/auth/v1/user`, {
    headers: { apikey: cfg.anonKey, authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new AuthError("Your session has expired. Sign in again.");
  const user = await res.json();
  if (!user?.id) throw new AuthError("Could not identify you. Sign in again.");
  return user;
}

export const listConnections = (token) =>
  rest(token, `${TABLE}?select=id,role_arn,aws_account_id,label,status,created_at,verified_at,last_used_at&order=created_at.desc`);

// Fetches the external ID too, because assuming the role needs it. Callers must
// treat the result as the authoritative pairing: the client is never allowed to
// supply an external ID alongside an ARN of its choosing.
export const getConnection = async (token, id) => {
  const rows = await rest(token, `${TABLE}?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
  return rows?.[0] || null;
};

export const createPending = async (token, userId, externalId) => {
  const rows = await rest(token, `${TABLE}`, {
    method: "POST",
    body: { user_id: userId, external_id: externalId, status: "pending" },
    prefer: "return=representation",
  });
  return rows?.[0] || null;
};

export const activateConnection = async (token, id, { roleArn, awsAccountId, label }) => {
  const rows = await rest(token, `${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: {
      role_arn: roleArn,
      aws_account_id: awsAccountId,
      label: label || null,
      status: "active",
      verified_at: new Date().toISOString(),
    },
    prefer: "return=representation",
  });
  return rows?.[0] || null;
};

export const touchConnection = (token, id) =>
  rest(token, `${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { last_used_at: new Date().toISOString() },
    prefer: "return=minimal",
  }).catch(() => null); // a failed timestamp must never fail the actual request

export const deleteConnection = (token, id) =>
  rest(token, `${TABLE}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", prefer: "return=minimal" });
