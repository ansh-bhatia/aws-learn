import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ShieldCheck, Download, Copy, Check, RefreshCw, TrendingUp, TrendingDown,
  AlertTriangle, Lock, Unplug, ExternalLink, Loader2, Sparkles, Info, Plus, LogOut,
} from "lucide-react";
import AuthGate from "../components/AuthGate";
import { authedFetch } from "../lib/supabase";
import "./FinOpsPage.css";

const money = (n, currency = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: Math.abs(n) >= 100 ? 0 : 2,
  }).format(n || 0);

function CopyButton({ value, label = "Copy" }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="fin-copy"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          /* clipboard blocked — the value is still selectable on screen */
        }
      }}
    >
      {done ? <Check size={13} /> : <Copy size={13} />} {done ? "Copied" : label}
    </button>
  );
}

/* ── Onboarding ───────────────────────────────────────────────────────── */

function ConnectFlow({ onConnected }) {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [roleArn, setRoleArn] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    let alive = true;
    authedFetch("/api/finops/connect", { action: "init" })
      .then(async (res) => {
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) setError(data.message || "Could not start the connection.");
        else setInfo(data);
      })
      .catch((err) => {
        if (alive) setError(err.message || "Could not reach the server.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const downloadTemplate = () => {
    const blob = new Blob([info.template], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aws-learn-finops-role.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const verify = async () => {
    setVerifying(true);
    setVerifyError(null);
    try {
      // Only the connection id goes back. The external ID stays server-side, so
      // an ARN can never be paired with one the caller chose.
      const res = await authedFetch("/api/finops/connect", {
        action: "verify",
        connectionId: info.connectionId,
        roleArn: roleArn.trim(),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) setVerifyError(data.message || "We could not verify that role.");
      else onConnected(data.connection);
    } catch (err) {
      setVerifyError(err.message || "Could not reach the server.");
    } finally {
      setVerifying(false);
    }
  };

  if (error) {
    return (
      <div className="fin-empty">
        <AlertTriangle size={26} className="fin-empty-icon" />
        <h2>Connections aren&rsquo;t set up yet</h2>
        <p>{error}</p>
      </div>
    );
  }
  if (!info) {
    return (
      <div className="fin-empty">
        <Loader2 size={26} className="fin-spin fin-empty-icon" />
        <p>Preparing your connection&hellip;</p>
      </div>
    );
  }

  return (
    <div className="fin-connect">
      <header className="fin-connect-head">
        <div className="fin-badge">
          <Lock size={13} /> Read-only
        </div>
        <h1>Connect your AWS account</h1>
        <p className="fin-lede">
          To show your real costs we need permission to read your bill. Here is exactly what that means, in plain
          English.
        </p>
      </header>

      <section className="fin-promise">
        {info.whatThisDoes.map((line) => (
          <div className="fin-promise-row" key={line}>
            <ShieldCheck size={15} />
            <span>{line}</span>
          </div>
        ))}
      </section>

      <section className="fin-ids">
        <div className="fin-id">
          <label>Your External ID</label>
          <p className="fin-id-help">A secret code AWS checks on every request. It is unique to you.</p>
          <div className="fin-id-value">
            <code>{info.externalId}</code>
            <CopyButton value={info.externalId} />
          </div>
        </div>
        <div className="fin-id">
          <label>Our AWS account ID</label>
          <p className="fin-id-help">The only account allowed to use the role you create.</p>
          <div className="fin-id-value">
            <code>{info.platformAccountId}</code>
            <CopyButton value={info.platformAccountId} />
          </div>
        </div>
      </section>

      <ol className="fin-steps">
        {info.steps.map((s, i) => (
          <li key={s.title}>
            <div className="fin-step-n">{i + 1}</div>
            <div className="fin-step-body">
              <h3>{s.title}</h3>
              <p>{s.detail}</p>
              {i === 1 && (
                <div className="fin-step-actions">
                  <button className="fin-btn fin-btn-primary" type="button" onClick={downloadTemplate}>
                    <Download size={14} /> Download template
                  </button>
                  <a
                    className="fin-btn"
                    href="https://console.aws.amazon.com/cloudformation/home#/stacks/create"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <ExternalLink size={14} /> Open CloudFormation
                  </a>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <section className="fin-finish">
        <label htmlFor="rolearn">Paste your Role ARN</label>
        <div className="fin-finish-row">
          <input
            id="rolearn"
            value={roleArn}
            onChange={(e) => setRoleArn(e.target.value)}
            placeholder="arn:aws:iam::123456789012:role/AWSLearnFinOpsReadOnly"
            spellCheck={false}
          />
          <button
            className="fin-btn fin-btn-primary"
            type="button"
            disabled={!roleArn.trim() || verifying}
            onClick={verify}
          >
            {verifying ? (
              <>
                <Loader2 size={14} className="fin-spin" /> Checking
              </>
            ) : (
              "Connect"
            )}
          </button>
        </div>
        <p className="fin-finish-note">
          We test two things: that the role works, and that it <strong>cannot</strong> be used without your External
          ID. If the second check fails we refuse to save it.
        </p>
        {verifyError && (
          <div className="fin-error">
            <AlertTriangle size={15} />
            <span>{verifyError}</span>
          </div>
        )}
      </section>

      <details className="fin-details">
        <summary>
          See the exact permissions we ask for ({info.permissionPolicy.Statement.flatMap((s) => s.Action).length}{" "}
          read-only actions)
        </summary>
        <pre>{JSON.stringify(info.permissionPolicy, null, 2)}</pre>
      </details>

      <p className="fin-revoke">
        <Info size={13} /> {info.revoke}
      </p>
    </div>
  );
}

/* ── Charts ───────────────────────────────────────────────────────────── */

function SpendBars({ months, currency }) {
  if (!months.length) return null;
  const max = Math.max(...months.map((m) => m.total), 1);
  return (
    <div className="fin-bars">
      {months.map((m) => (
        <div className="fin-bar-col" key={m.start} title={`${m.start}: ${money(m.total, currency)}`}>
          <div className="fin-bar-track">
            <div className="fin-bar-fill" style={{ height: `${Math.max((m.total / max) * 100, 1.5)}%` }} />
          </div>
          <span className="fin-bar-label">
            {new Date(`${m.start}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", timeZone: "UTC" })}
          </span>
        </div>
      ))}
    </div>
  );
}

function DailyLine({ daily, currency }) {
  if (daily.length < 2) return null;
  const w = 640;
  const h = 90;
  const max = Math.max(...daily.map((d) => d.cost), 0.01);
  const pts = daily.map((d, i) => [(i / (daily.length - 1)) * w, h - (d.cost / max) * (h - 8) - 4]);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const latest = daily.at(-1);
  return (
    <div className="fin-line-wrap">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="fin-line"
        role="img"
        aria-label={`Daily spend for the last ${daily.length} days`}
      >
        <defs>
          <linearGradient id="finFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--aws-orange)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--aws-orange)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#finFill)" />
        <path d={path} fill="none" stroke="var(--aws-orange)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="fin-line-foot">
        <span>{daily.length} days</span>
        {latest && <span>Latest day {money(latest.cost, currency)}</span>}
      </div>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────────────────────── */

const EFFORT_ORDER = { VeryLow: 0, Low: 1, Medium: 2, High: 3, VeryHigh: 4 };
const prettify = (s = "") => s.replace(/([a-z])([A-Z])/g, "$1 $2");

function Dashboard({ connection, onDisconnect }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [effortFilter, setEffortFilter] = useState("all");

  // Fetching stays a plain function that resolves or throws. Keeping state out
  // of it lets the mount effect follow React's documented shape — kick off the
  // request, apply the result in a callback — instead of driving setState from
  // the effect body.
  const fetchSummary = useCallback(async () => {
    const res = await authedFetch("/api/finops/summary", { connectionId: connection.id });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Could not load your cost data.");
    return body;
  }, [connection]);

  useEffect(() => {
    let ignore = false;
    fetchSummary()
      .then((body) => { if (!ignore) setData(body); })
      .catch((err) => { if (!ignore) setError(err.message || "Could not reach the server."); })
      .finally(() => { if (!ignore) setLoading(false); });
    // Switching accounts mid-request must not land the previous one's data.
    return () => { ignore = true; };
  }, [fetchSummary]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchSummary()
      .then(setData)
      .catch((err) => setError(err.message || "Could not reach the server."))
      .finally(() => setLoading(false));
  }, [fetchSummary]);

  const recs = useMemo(() => {
    const all = data?.optimization?.items || [];
    return effortFilter === "all" ? all : all.filter((r) => r.effort === effortFilter);
  }, [data, effortFilter]);

  const efforts = useMemo(() => {
    const set = new Set((data?.optimization?.items || []).map((r) => r.effort).filter(Boolean));
    return [...set].sort((a, b) => (EFFORT_ORDER[a] ?? 9) - (EFFORT_ORDER[b] ?? 9));
  }, [data]);

  if (loading && !data) {
    return (
      <div className="fin-empty">
        <Loader2 size={26} className="fin-spin fin-empty-icon" />
        <p>Reading your AWS cost data&hellip;</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="fin-empty">
        <AlertTriangle size={26} className="fin-empty-icon" />
        <h2>We couldn&rsquo;t load your costs</h2>
        <p>{error}</p>
        <div className="fin-step-actions">
          <button className="fin-btn fin-btn-primary" type="button" onClick={load}>
            <RefreshCw size={14} /> Try again
          </button>
          <button className="fin-btn" type="button" onClick={onDisconnect}>
            <Unplug size={14} /> Disconnect
          </button>
        </div>
      </div>
    );
  }

  const { spend, optimization, currency } = data;
  const savings = optimization.dedupedMonthlySavings;
  const up = (spend.changePct ?? 0) >= 0;

  return (
    <div className="fin-dash">
      <div className="fin-dash-head">
        <div>
          <h1>Cost overview</h1>
          <p className="fin-lede">Updated {new Date(data.generatedAt).toLocaleString()}</p>
        </div>
        <div className="fin-step-actions">
          <button className="fin-btn" type="button" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? "fin-spin" : ""} /> Refresh
          </button>
          <button className="fin-btn" type="button" onClick={onDisconnect}>
            <Unplug size={14} /> Disconnect
          </button>
        </div>
      </div>

      <section className="fin-kpis">
        <div className="fin-kpi">
          <span className="fin-kpi-label">Last complete month</span>
          <strong className="fin-kpi-value">{money(spend.lastCompleteMonth, currency)}</strong>
          {spend.changePct !== null && (
            <span className={`fin-kpi-delta ${up ? "up" : "down"}`}>
              {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(spend.changePct).toFixed(1)}% vs previous month
            </span>
          )}
        </div>
        <div className="fin-kpi">
          <span className="fin-kpi-label">Forecast next month</span>
          <strong className="fin-kpi-value">
            {spend.forecastNextMonth === null ? "—" : money(spend.forecastNextMonth, currency)}
          </strong>
          <span className="fin-kpi-delta">AWS projection</span>
        </div>
        <div className="fin-kpi fin-kpi-accent">
          <span className="fin-kpi-label">Identified monthly savings</span>
          <strong className="fin-kpi-value">{savings === null ? "—" : money(savings, currency)}</strong>
          <span className="fin-kpi-delta">
            {optimization.savingsPercentage ? `${optimization.savingsPercentage}% of spend` : "De-duplicated by AWS"}
          </span>
        </div>
        <div className="fin-kpi">
          <span className="fin-kpi-label">Open recommendations</span>
          <strong className="fin-kpi-value">{optimization.items.length || "—"}</strong>
          <span className="fin-kpi-delta">Across all connected accounts</span>
        </div>
      </section>

      <section className="fin-panel">
        <h2>Spend over time</h2>
        <SpendBars months={spend.months} currency={currency} />
        <DailyLine daily={spend.daily} currency={currency} />
      </section>

      <section className="fin-panel">
        <h2>Where the money goes</h2>
        {spend.topServices.length === 0 ? (
          <p className="fin-muted">No service breakdown available for this period.</p>
        ) : (
          <div className="fin-services">
            {spend.topServices.map((s) => (
              <div className="fin-service" key={s.name}>
                <span className="fin-service-name" title={s.name}>
                  {s.name}
                </span>
                <div className="fin-service-track">
                  <div
                    className="fin-service-fill"
                    style={{ width: `${(s.cost / (spend.topServices[0]?.cost || 1)) * 100}%` }}
                  />
                </div>
                <span className="fin-service-cost">{money(s.cost, currency)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="fin-panel">
        <div className="fin-panel-head">
          <h2>Recommendations</h2>
          {efforts.length > 1 && (
            <div className="fin-filters">
              <button type="button" className={effortFilter === "all" ? "on" : ""} onClick={() => setEffortFilter("all")}>
                All
              </button>
              {efforts.map((e) => (
                <button key={e} type="button" className={effortFilter === e ? "on" : ""} onClick={() => setEffortFilter(e)}>
                  {prettify(e)}
                </button>
              ))}
            </div>
          )}
        </div>

        {optimization.hubUnavailable ? (
          <div className="fin-hint">
            <Sparkles size={16} />
            <p>{optimization.hubHint}</p>
          </div>
        ) : recs.length === 0 ? (
          <p className="fin-muted">Nothing to act on right now — AWS found no savings opportunities in this account.</p>
        ) : (
          <div className="fin-table-wrap">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Action</th>
                  <th>Change</th>
                  <th className="num">Monthly saving</th>
                  <th>Effort</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {recs.slice(0, 50).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="fin-res">{r.resourceId || "—"}</span>
                      <span className="fin-res-sub">
                        {r.resourceType} · {r.region}
                      </span>
                    </td>
                    <td>{prettify(r.action || "")}</td>
                    <td className="fin-change">
                      {r.recommendedType && r.recommendedType !== r.resourceType ? (
                        <>
                          <code>{r.resourceType}</code> → <code>{r.recommendedType}</code>
                        </>
                      ) : (
                        <span className="fin-muted">—</span>
                      )}
                    </td>
                    <td className="num fin-save">{money(r.monthlySavings, currency)}</td>
                    <td>
                      <span className={`fin-effort e-${(r.effort || "").toLowerCase()}`}>{prettify(r.effort || "—")}</span>
                    </td>
                    <td className="fin-risk">
                      {r.restartNeeded && <span className="fin-tag warn">Restart</span>}
                      {r.rollbackPossible && <span className="fin-tag ok">Reversible</span>}
                      {!r.restartNeeded && !r.rollbackPossible && <span className="fin-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data.problems.length > 0 && (
        <section className="fin-panel fin-problems">
          <h2>Partial data</h2>
          <p className="fin-muted">Some AWS calls didn&rsquo;t succeed. Everything else on this page is still accurate.</p>
          <ul>
            {data.problems.map((p) => (
              <li key={p.label}>
                <code>{p.label}</code> — {p.code}: {p.message}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

function FinOpsApp({ session, signOut }) {
  const [connections, setConnections] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState(null);

  // Connections live in the database against this user, so a different browser
  // or a second device sees the same accounts.
  useEffect(() => {
    let ignore = false;
    authedFetch("/api/finops/connect", { action: "list" })
      .then((res) => res.json())
      .then((body) => {
        if (ignore) return;
        const rows = (body.connections || []).filter((c) => c.status === "active");
        setConnections(rows);
        setActiveId((current) => current ?? rows[0]?.id ?? null);
      })
      .catch((err) => { if (!ignore) setError(err.message || "Could not load your connections."); });
    return () => { ignore = true; };
  }, []);

  const onConnected = (row) => {
    setConnections((prev) => [row, ...(prev || []).filter((c) => c.id !== row.id)]);
    setActiveId(row.id);
    setAddingNew(false);
  };

  const disconnect = async (id) => {
    await authedFetch("/api/finops/connect", { action: "delete", connectionId: id }).catch(() => null);
    setConnections((prev) => {
      const next = (prev || []).filter((c) => c.id !== id);
      setActiveId(next[0]?.id ?? null);
      return next;
    });
  };

  const active = (connections || []).find((c) => c.id === activeId) || null;

  if (error) {
    return (
      <div className="fin-empty">
        <AlertTriangle size={26} className="fin-empty-icon" />
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }
  if (connections === null) {
    return (
      <div className="fin-empty">
        <Loader2 size={26} className="fin-spin fin-empty-icon" />
        <p>Loading your AWS accounts&hellip;</p>
      </div>
    );
  }

  return (
    <>
      <div className="fin-account-bar">
        <div className="fin-account-tabs">
          {connections.map((c) => (
            <button
              key={c.id}
              type="button"
              className={c.id === activeId && !addingNew ? "on" : ""}
              onClick={() => { setActiveId(c.id); setAddingNew(false); }}
            >
              {c.label || c.aws_account_id || "AWS account"}
            </button>
          ))}
          {connections.length > 0 && (
            <button type="button" className={addingNew ? "on" : ""} onClick={() => setAddingNew(true)}>
              <Plus size={13} /> Add account
            </button>
          )}
        </div>
        <div className="fin-account-user">
          <span title={session.user?.email}>{session.user?.email}</span>
          <button type="button" onClick={signOut}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>

      {active && !addingNew ? (
        <Dashboard key={active.id} connection={active} onDisconnect={() => disconnect(active.id)} />
      ) : (
        <ConnectFlow onConnected={onConnected} />
      )}
    </>
  );
}

export default function FinOpsPage() {
  return (
    <div className="fin-page">
      <nav className="fin-nav">
        <Link to="/" className="fin-back">
          <ArrowLeft size={15} /> Back to study app
        </Link>
        <Link to="/chat" className="fin-back">
          Ask the assistant
        </Link>
      </nav>
      <AuthGate>{({ session, signOut }) => <FinOpsApp session={session} signOut={signOut} />}</AuthGate>
    </div>
  );
}
