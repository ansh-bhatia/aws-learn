import { useState } from "react";
import "./VPCVisuals.css";
import "./VPCVisuals4.css";
import "./VPCVisuals7.css";

/* ─── PREFIX LIST WEIGHT vs RULE LIMITS ────────────────────────────── */
export function PrefixListWeight() {
  const [sel, setSel] = useState("cloudfront");

  const lists = {
    cloudfront: { name: "com.amazonaws.global.cloudfront.origin-facing", weight: 55 },
    s3: { name: "com.amazonaws.ap-south-1.s3", weight: 1 },
    dynamodb: { name: "com.amazonaws.ap-south-1.dynamodb", weight: 1 },
  };

  const w = lists[sel].weight;
  const SG_LIMIT = 60, RT_LIMIT = 50;
  const sgLeft = SG_LIMIT - w;
  const rtFits = w <= RT_LIMIT;

  const bar = (used, limit) => Math.min(100, (used / limit) * 100);

  return (
    <div className="viz-card">
      <div className="viz-title">⚖️ Prefix List Weight vs Rule Limits</div>
      <p className="vpc4-intro">
        A prefix list does not count as <strong>one</strong> rule. It counts as its{" "}
        <strong>weight</strong> — the number of CIDR ranges inside it. That interacts with the limits on
        security groups and route tables in a way that catches people out.
      </p>

      <div className="vpc7-tabs">
        {Object.keys(lists).map((k) => (
          <button key={k} className={`vpc7-tab ${sel === k ? "active" : ""}`} onClick={() => setSel(k)}>
            {k === "cloudfront" ? "CloudFront origin-facing" : k === "s3" ? "S3" : "DynamoDB"}
            <small>weight {lists[k].weight}</small>
          </button>
        ))}
      </div>

      <div className="vpc7-name">{lists[sel].name}</div>

      <div className="vpc7-meters">
        <div className="vpc7-meter">
          <div className="vpc7-meter-head">
            <span>Security group — limit {SG_LIMIT} rules</span>
            <b className={sgLeft < 10 ? "tight" : ""}>{sgLeft} left</b>
          </div>
          <div className="vpc7-track">
            <span className="vpc7-fill sg" style={{ width: `${bar(w, SG_LIMIT)}%` }} />
          </div>
          <div className="vpc7-meter-note">
            This one prefix list consumes <strong>{w}</strong> of your 60 rules.
            {sgLeft < 10 && " Only a handful of ordinary rules will still fit."}
          </div>
        </div>

        <div className="vpc7-meter">
          <div className="vpc7-meter-head">
            <span>Route table — limit {RT_LIMIT} routes</span>
            <b className={rtFits ? "" : "over"}>{rtFits ? `${RT_LIMIT - w} left` : "EXCEEDS LIMIT"}</b>
          </div>
          <div className="vpc7-track">
            <span className={`vpc7-fill rt ${rtFits ? "" : "over"}`} style={{ width: `${bar(w, RT_LIMIT)}%` }} />
          </div>
          <div className="vpc7-meter-note">
            {rtFits
              ? `Consumes ${w} of your 50 routes.`
              : `A weight of ${w} does not fit in 50 routes at all — adding it errors. You must ask AWS support to raise the limit.`}
          </div>
        </div>
      </div>

      <div className="vpc4-note">
        Both limits are <strong>soft</strong> — AWS support can raise them. And note the asymmetry: the
        CloudFront list at weight <strong>55</strong> fits inside a security group's 60 with five to spare, but{" "}
        <strong>does not fit a route table's 50 at all</strong>.
      </div>
    </div>
  );
}
