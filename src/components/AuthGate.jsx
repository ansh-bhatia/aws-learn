import { useEffect, useState } from "react";
import { Mail, Loader2, AlertTriangle, Check } from "lucide-react";
import { supabase, authConfigured } from "../lib/supabase";
import "./AuthGate.css";

/**
 * Wraps anything that needs a signed-in user. Sign-in is a magic link on
 * purpose: there is no password to choose, store, reset or leak, and the same
 * flow covers both first sign-up and every later sign-in.
 */
export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // The unconfigured case is handled before `ready` is ever read, so there is
    // nothing to set here — which keeps this effect free of synchronous state
    // updates.
    if (!supabase) return undefined;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data?.session ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/finops` },
    });
    setSending(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  if (!authConfigured) {
    return (
      <div className="auth-card">
        <AlertTriangle size={24} className="auth-icon" />
        <h2>Sign-in isn&rsquo;t set up</h2>
        <p>
          This deployment has no authentication configured. Set <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code>.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="auth-card">
        <Loader2 size={24} className="auth-icon auth-spin" />
        <p>Checking your session&hellip;</p>
      </div>
    );
  }

  if (session) return children({ session, signOut: () => supabase.auth.signOut() });

  if (sent) {
    return (
      <div className="auth-card">
        <Check size={24} className="auth-icon auth-ok" />
        <h2>Check your email</h2>
        <p>
          We sent a sign-in link to <strong>{email.trim()}</strong>. Open it on this device and you&rsquo;ll come
          straight back here.
        </p>
        <button className="auth-link" type="button" onClick={() => setSent(false)}>
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <Mail size={24} className="auth-icon" />
      <h2>Sign in to continue</h2>
      <p>
        Your AWS connections are private to your account, so we need to know who you are. No password — we email you
        a link.
      </p>
      <form onSubmit={signIn} className="auth-form">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          spellCheck={false}
        />
        <button type="submit" disabled={sending || !email.trim()}>
          {sending ? (
            <>
              <Loader2 size={14} className="auth-spin" /> Sending
            </>
          ) : (
            "Email me a link"
          )}
        </button>
      </form>
      {error && (
        <div className="auth-error">
          <AlertTriangle size={14} /> {error}
        </div>
      )}
    </div>
  );
}
