/*
 * AWS-flavoured branding marks — all original, dependency-free SVG.
 *   - AwsSmile:     a small orange "smile" swoosh mark
 *   - AwsLogo:      "aws" wordmark + smile
 *   - PoweredByAws: a compact badge for footers
 *   - ArchitectureBand: an animated "users → cloud → data-centre → services"
 *     diagram for the dashboard (honours prefers-reduced-motion via CSS)
 */

import { useRef } from "react";

export function AwsSmile({ width = 46, className = "" }) {
  return (
    <svg className={className} width={width} viewBox="0 0 64 26" fill="none" aria-hidden="true">
      <path
        d="M5 14 C 20 23, 44 23, 59 14"
        stroke="#FF9900" strokeWidth="3.4" strokeLinecap="round" fill="none"
      />
      <path d="M50 11.5 L60 13.8 L54 22 Z" fill="#FF9900" />
    </svg>
  );
}

export function AwsLogo({ className = "" }) {
  return (
    <span className={`aws-logo ${className}`} aria-label="AWS">
      <span className="aws-word">aws</span>
      <AwsSmile width={42} className="aws-logo-smile" />
    </span>
  );
}

export function PoweredByAws() {
  return (
    <div className="powered-by" aria-label="Powered by AWS">
      <span>Powered by</span>
      <AwsLogo />
    </div>
  );
}

/* ── Dashboard architecture diagram ───────────────────────────── */
export function ArchitectureBand() {
  const ref = useRef(null);
  const reduce = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty("--rx", `${-py * 6}deg`);
    ref.current.style.setProperty("--ry", `${px * 7}deg`);
  };
  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="arch-band" ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} aria-hidden="true">
      <div className="arch-band-label">
        <span className="arch-dot" /> How it fits together
      </div>
      <svg className="arch-svg" viewBox="0 0 820 210" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="archLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8C4FFF" />
            <stop offset="0.5" stopColor="#FF9900" />
            <stop offset="1" stopColor="#1F6FEB" />
          </linearGradient>
          <linearGradient id="archCloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffb454" />
            <stop offset="1" stopColor="#FF9900" />
          </linearGradient>
        </defs>

        {/* connecting flow line */}
        <path className="arch-flow" d="M120 105 H700" stroke="url(#archLine)" strokeWidth="2.5"
          strokeDasharray="7 9" strokeLinecap="round" />

        {/* travelling data pulses */}
        <circle className="arch-pulse arch-pulse-1" r="4" fill="#FF9900" />
        <circle className="arch-pulse arch-pulse-2" r="3.5" fill="#9ad1ff" />

        {/* 1 · Users */}
        <g className="arch-node">
          <circle cx="80" cy="105" r="40" className="arch-node-bg" />
          <circle cx="80" cy="92" r="9" fill="#cbd5e1" />
          <path d="M62 122 a18 16 0 0 1 36 0 Z" fill="#cbd5e1" />
          <text x="80" y="166" className="arch-cap">Users</text>
        </g>

        {/* 2 · Cloud / Bedrock */}
        <g className="arch-node">
          <circle cx="290" cy="105" r="44" className="arch-node-bg" />
          <path d="M262 112 a16 16 0 0 1 4-31 a20 20 0 0 1 38 4 a13 13 0 0 1 0 27 Z"
            fill="url(#archCloud)" />
          <text x="290" y="170" className="arch-cap">AWS Cloud</text>
        </g>

        {/* 3 · Region with two AZs of racks */}
        <g className="arch-node">
          <rect x="470" y="55" width="290" height="100" rx="14" className="arch-region" />
          <text x="482" y="48" className="arch-region-cap">AWS Region · Data centres</text>
          {/* AZ 1 */}
          <g>
            <rect x="492" y="74" width="116" height="62" rx="9" className="arch-az" />
            <rect x="506" y="86" width="88" height="11" rx="3" className="arch-rack" />
            <rect x="506" y="103" width="88" height="11" rx="3" className="arch-rack" />
            <rect x="506" y="120" width="88" height="9" rx="3" className="arch-rack dim" />
          </g>
          {/* AZ 2 */}
          <g>
            <rect x="624" y="74" width="116" height="62" rx="9" className="arch-az" />
            <rect x="638" y="86" width="88" height="11" rx="3" className="arch-rack" />
            <rect x="638" y="103" width="88" height="11" rx="3" className="arch-rack" />
            <rect x="638" y="120" width="88" height="9" rx="3" className="arch-rack dim" />
          </g>
        </g>
      </svg>

      <div className="arch-tags">
        <span className="arch-tag"># compute</span>
        <span className="arch-tag"># storage</span>
        <span className="arch-tag"># databases</span>
        <span className="arch-tag"># networking</span>
        <span className="arch-tag"># ai / genai</span>
      </div>
    </div>
  );
}
