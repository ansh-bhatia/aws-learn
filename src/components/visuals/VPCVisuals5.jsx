import { useState } from "react";
import "./VPCVisuals.css";
import "./VPCVisuals4.css";
import "./VPCVisuals5.css";

/* ─── NAT GATEWAY PLACEMENT — THE QUESTION EVERYONE GETS WRONG ─────── */
export function NATPlacementQuiz() {
  const [answer, setAnswer] = useState(null);

  return (
    <div className="viz-card">
      <div className="viz-title">🤔 Where Does the NAT Gateway Go?</div>
      <p className="vpc4-intro">
        You are creating a NAT gateway <strong>to give private-subnet instances outbound internet</strong>. AWS
        asks which subnet to place it in. Most people answer this wrong on the first try — pick one.
      </p>

      <div className="vpc5-choices">
        <button
          className={`vpc5-choice ${answer === "private" ? "picked wrong" : ""}`}
          onClick={() => setAnswer("private")}
        >
          🔒 Private subnet
          <small>&quot;It serves the private subnet, so it belongs there&quot;</small>
        </button>
        <button
          className={`vpc5-choice ${answer === "public" ? "picked right" : ""}`}
          onClick={() => setAnswer("public")}
        >
          🌐 Public subnet
          <small>&quot;It needs internet itself before it can share any&quot;</small>
        </button>
      </div>

      {answer && (
        <div className={`vpc5-answer ${answer === "public" ? "ok" : "bad"}`}>
          {answer === "private" ? (
            <>
              <strong>❌ This is the common wrong answer.</strong> Put the NAT gateway in a private subnet and
              it has <em>no internet itself</em> — the private subnet has none. It cannot hand out what it does
              not have. As the analogy goes: you cannot teach knowledge you do not possess.
            </>
          ) : (
            <>
              <strong>✅ Correct — always a public subnet.</strong> The NAT gateway needs its own route to the
              internet gateway before it can relay traffic for anyone else. Either public subnet works.
            </>
          )}
        </div>
      )}

      <div className="vpc5-flow">
        <div className="vpc5-box priv">
          <span className="vpc5-tag">PRIVATE SUBNET</span>
          🗄️ database<small>private IP only</small>
        </div>
        <span className="vpc5-arr">→</span>
        <div className="vpc5-box nat">
          <span className="vpc5-tag">PUBLIC SUBNET</span>
          🔀 NAT gateway<small>has an elastic IP</small>
        </div>
        <span className="vpc5-arr">→</span>
        <div className="vpc5-box igw">
          <span className="vpc5-tag">VPC EDGE</span>
          🚪 internet gateway
        </div>
        <span className="vpc5-arr">→</span>
        <div className="vpc5-box net">🌍 internet</div>
      </div>

      <div className="vpc5-why">
        <div className="vpc5-why-row">
          <b>Why an agent is needed at all</b>
          The internet gateway <strong>only talks to resources that have a public IP</strong>. Your database has
          a private IP only — so it can never reach the gateway directly.
        </div>
        <div className="vpc5-why-row">
          <b>What NAT actually means</b>
          <strong>Network Address Translation.</strong> It swaps the private source IP for its own public one on
          the way out, and translates back on the way in.
        </div>
        <div className="vpc5-why-row">
          <b>Outbound only</b>
          Replies to connections the instance <strong>started</strong> come back fine. Nobody on the internet can
          <strong> initiate</strong> a connection inward. The private subnet stays safe.
        </div>
      </div>

      <div className="vpc4-note">
        ⚠️ <strong>The NAT gateway is chargeable</strong> — unlike most VPC components. Delete it after
        practising. And deleting it does <strong>not</strong> release its <strong>elastic IP</strong>, which
        also bills: go to Elastic IPs and release that separately once the gateway finishes deleting.
      </div>
    </div>
  );
}
