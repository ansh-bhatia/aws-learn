import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The rest of the app renders fine without auth configured — only the FinOps
// portal needs it — so this stays null rather than throwing at import time.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const authConfigured = Boolean(supabase);

// Every call to our own API carries the caller's access token; the server uses
// it to talk to the database as them, so row-level security decides what they
// can reach.
export async function authedFetch(path, body) {
  if (!supabase) throw new Error("Sign-in is not configured.");
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Sign in to continue.");

  return fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body ?? {}),
  });
}
