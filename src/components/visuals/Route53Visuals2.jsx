import { useState } from "react";
import "./Route53Visuals.css";
import "./Route53Visuals2.css";

/* ─── ALL 8 ROUTING POLICIES COMPARED ──────────────────────────────── */
export function PolicyComparisonMatrix() {
  const [sel, setSel] = useState("weighted");

  const policies = {
    simple: { name: "Simple", mode: "Single answer", cost: "Free", use: "One resource, no failover, no distribution" },
    weighted: { name: "Weighted", mode: "Active-active", cost: "Free", use: "Split traffic by percentage across servers" },
    latency: { name: "Latency", mode: "Active-active", cost: "Free", use: "Send each user to whichever region answers fastest for them" },
    geolocation: { name: "Geolocation", mode: "Active-active", cost: "Free", use: "Route by the USER'S location — legal/content restrictions" },
    geoproximity: { name: "Geoproximity", mode: "Active-active", cost: "$50/mo (traffic policy)", use: "Route by RESOURCE location, shift the boundary with bias" },
    failover: { name: "Failover", mode: "⚠️ Active-PASSIVE", cost: "Free", use: "One primary, one standby — the only non-active-active policy" },
    multivalue: { name: "Multivalue answer", mode: "Active-active", cost: "Free", use: "Return several IPs at once, round-robin, up to 8" },
    ipbased: { name: "IP-based", mode: "Active-active", cost: "Free", use: "Route by the RESOLVER'S source IP / CIDR — ISP session affinity" },
  };

  const p = policies[sel];

  return (
    <div className="sv-card r53-card">
      <div className="sv-title r53-title">🗺️ All 8 Route 53 Routing Policies</div>
      <p className="r53-intro">
        Every policy answers the same question — <em>which IP do I hand back?</em> — using a different signal.
        Click one to see how it decides and what it costs.
      </p>

      <div className="r532-tabs">
        {Object.keys(policies).map((k) => (
          <button key={k} className={`r532-tab ${sel === k ? "active" : ""}`} onClick={() => setSel(k)}>
            {policies[k].name}
          </button>
        ))}
      </div>

      <div className="r532-detail">
        <div className="r532-detail-row">
          <span className="r532-detail-label">Mode</span>
          <span className={`r532-detail-val ${p.mode.includes("PASSIVE") ? "warn" : ""}`}>{p.mode}</span>
        </div>
        <div className="r532-detail-row">
          <span className="r532-detail-label">Cost</span>
          <span className="r532-detail-val">{p.cost}</span>
        </div>
        <div className="r532-detail-row">
          <span className="r532-detail-label">Use it when</span>
          <span className="r532-detail-val">{p.use}</span>
        </div>
      </div>

      <div className="r53-note">
        <strong>The one to remember for the exam:</strong> every policy here is <strong>active-active</strong>
        except <strong>Failover</strong>, which is the only policy built for an active-passive pair. And every
        policy is free except <strong>Geoproximity</strong>, which requires a traffic policy at $50/month.
      </div>
    </div>
  );
}
