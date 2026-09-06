import { assumeRole, ce, coh, platformCredentials, AwsError } from "../_lib/aws.js";
import { AuthError, DbError, bearerToken, getConnection, touchConnection, supabaseConfig } from "../_lib/connections.js";

export const config = { runtime: "edge" };

const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

const iso = (d) => d.toISOString().slice(0, 10);
const addMonths = (d, n) => { const x = new Date(d); x.setUTCMonth(x.getUTCMonth() + n); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };

// Every AWS call is allowed to fail on its own. Cost Optimization Hub in
// particular needs an explicit opt-in, so a brand-new connection routinely has
// working spend data and no recommendations — that should render a hint, not an
// error page.
async function attempt(label, fn) {
  try {
    return { ok: true, label, value: await fn() };
  } catch (err) {
    return {
      ok: false,
      label,
      code: err instanceof AwsError ? err.code : "Unknown",
      message: err?.message || "Request failed",
    };
  }
}

const amount = (v) => Number(v?.Amount ?? 0);

export default async function handler(req) {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!supabaseConfig()) return json({ error: "not_configured" }, 503);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  let token;
  try { token = bearerToken(req); } catch (err) { return json({ error: "unauthenticated", message: err.message }, 401); }

  // The role ARN and external ID are read from the caller's own row rather than
  // taken from the request. A client can therefore only ever use a connection
  // it actually owns, and cannot pair an arbitrary ARN with an external ID it
  // happens to have seen.
  let row;
  try {
    row = await getConnection(token, body.connectionId);
  } catch (err) {
    if (err instanceof AuthError) return json({ error: "unauthenticated", message: err.message }, 401);
    if (err instanceof DbError) return json({ error: "db_error", message: err.message }, 500);
    return json({ error: "unexpected", message: "Something went wrong." }, 500);
  }
  if (!row) return json({ error: "unknown_connection", message: "That AWS connection no longer exists." }, 404);
  if (row.status !== "active" || !row.role_arn) {
    return json({ error: "not_verified", message: "Finish connecting this AWS account first." }, 400);
  }

  // Deliberately after the ownership check: a caller with no right to this
  // connection gets 401 or 404 whatever our own configuration looks like.
  if (!platformCredentials()) return json({ error: "not_configured" }, 503);

  let creds;
  try {
    creds = await assumeRole({ roleArn: row.role_arn, externalId: row.external_id });
  } catch (err) {
    return json(
      { error: "assume_failed", code: err instanceof AwsError ? err.code : "Unknown",
        message: "We could not use your connection. If you deleted the role in AWS, reconnect from the portal." },
      400
    );
  }
  touchConnection(token, row.id);

  const today = new Date();
  const monthsBack = iso(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 5, 1)));
  const tomorrow = iso(addDays(today, 1));

  const [byService, daily, forecast, summaries, recs] = await Promise.all([
    attempt("byService", () =>
      ce(creds, "GetCostAndUsage", {
        TimePeriod: { Start: monthsBack, End: tomorrow },
        Granularity: "MONTHLY",
        Metrics: ["UnblendedCost"],
        GroupBy: [{ Type: "DIMENSION", Key: "SERVICE" }],
      })
    ),
    attempt("daily", () =>
      ce(creds, "GetCostAndUsage", {
        TimePeriod: { Start: iso(addDays(today, -30)), End: tomorrow },
        Granularity: "DAILY",
        Metrics: ["UnblendedCost"],
      })
    ),
    attempt("forecast", () =>
      ce(creds, "GetCostForecast", {
        TimePeriod: { Start: tomorrow, End: iso(addMonths(today, 1)) },
        Metric: "UNBLENDED_COST",
        Granularity: "MONTHLY",
      })
    ),
    attempt("summaries", () =>
      coh(creds, "ListRecommendationSummaries", { groupBy: "ActionType", metrics: ["SavingsPercentage"], maxResults: 100 })
    ),
    attempt("recommendations", () => coh(creds, "ListRecommendations", { maxResults: 100 })),
  ]);

  // ── Spend, shaped for charting ─────────────────────────────────────────
  const months = [];
  const serviceTotals = new Map();
  if (byService.ok) {
    for (const period of byService.value?.ResultsByTime || []) {
      let total = 0;
      const services = [];
      for (const g of period.Groups || []) {
        const cost = amount(g.Metrics?.UnblendedCost);
        total += cost;
        if (cost > 0) {
          const name = g.Keys?.[0] || "Unknown";
          services.push({ name, cost });
          serviceTotals.set(name, (serviceTotals.get(name) || 0) + cost);
        }
      }
      months.push({ start: period.TimePeriod?.Start, total, services: services.sort((a, b) => b.cost - a.cost).slice(0, 12) });
    }
  }

  const dailySeries = daily.ok
    ? (daily.value?.ResultsByTime || []).map((p) => ({ date: p.TimePeriod?.Start, cost: amount(p.Total?.UnblendedCost) }))
    : [];

  // Comparing a partial current month against a whole previous one reads as a
  // huge drop, so trend uses the last two *complete* months.
  const complete = months.slice(0, -1);
  const prev = complete.at(-2)?.total ?? 0;
  const last = complete.at(-1)?.total ?? 0;
  const changePct = prev > 0 ? ((last - prev) / prev) * 100 : null;

  // ── Recommendations ────────────────────────────────────────────────────
  const items = recs.ok
    ? (recs.value?.items || []).map((r) => ({
        id: r.recommendationId,
        accountId: r.accountId,
        region: r.region,
        resourceId: r.resourceId,
        resourceType: r.currentResourceType,
        recommendedType: r.recommendedResourceType,
        action: r.actionType,
        monthlySavings: Number(r.estimatedMonthlySavings || 0),
        savingsPercentage: Number(r.estimatedSavingsPercentage || 0),
        effort: r.implementationEffort,
        restartNeeded: !!r.restartNeeded,
        rollbackPossible: !!r.rollbackPossible,
        source: r.source,
      })).sort((a, b) => b.monthlySavings - a.monthlySavings)
    : [];

  // AWS de-dupes savings across overlapping recommendation types; summing the
  // individual estimates double-counts and inflates the headline number.
  const dedupedSavings = summaries.ok ? Number(summaries.value?.estimatedTotalDedupedSavings || 0) : null;

  const byAction = summaries.ok
    ? (summaries.value?.items || []).map((i) => ({
        group: i.group,
        monthlySavings: Number(i.estimatedMonthlySavings || 0),
        count: i.recommendationCount || 0,
      })).sort((a, b) => b.monthlySavings - a.monthlySavings)
    : [];

  const problems = [byService, daily, forecast, summaries, recs].filter((r) => !r.ok)
    .map(({ label, code, message }) => ({ label, code, message }));

  const hubUnavailable = !summaries.ok && !recs.ok;

  return json({
    generatedAt: new Date().toISOString(),
    currency: byService.ok ? (byService.value?.ResultsByTime?.[0]?.Groups?.[0]?.Metrics?.UnblendedCost?.Unit || "USD") : "USD",
    spend: {
      months,
      daily: dailySeries,
      lastCompleteMonth: last,
      previousCompleteMonth: prev,
      changePct,
      topServices: [...serviceTotals.entries()].map(([name, cost]) => ({ name, cost })).sort((a, b) => b.cost - a.cost).slice(0, 12),
      forecastNextMonth: forecast.ok ? Number(forecast.value?.Total?.Amount || 0) : null,
    },
    optimization: {
      dedupedMonthlySavings: dedupedSavings,
      savingsPercentage: summaries.ok ? summaries.value?.metrics?.savingsPercentage ?? null : null,
      byAction,
      items,
      hubUnavailable,
      hubHint: hubUnavailable
        ? "Cost Optimization Hub has not been switched on for this account yet. Open Billing and Cost Management in your AWS console, choose Cost Optimization Hub, and opt in. Recommendations appear within about 24 hours — nothing else here is affected."
        : null,
    },
    problems,
  });
}
