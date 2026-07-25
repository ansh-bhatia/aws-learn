import { useState } from "react";
import "./_LabStepper.css";

/**
 * Shared console-walkthrough stepper for hands-on lab topics.
 *
 * NOT a VISUAL_MAP entry — lab visuals import this and supply their own steps,
 * because VISUAL_MAP components are referenced by name only and take no props.
 *
 * step: { label, screen, detail, note, warn }
 *   label  — short tab caption ("2 · Email")
 *   screen — what the console shows at this point
 *   detail — array of instruction lines
 *   note   — optional aside
 *   warn   — optional caution (renders amber)
 */
export default function LabStepper({ title, intro, steps, accent = "fnd" }) {
  const [i, setI] = useState(0);
  const s = steps[i];
  const last = steps.length - 1;

  return (
    <div className={`sv-card ${accent}-card`}>
      <div className={`sv-title ${accent}-title`}>{title}</div>
      {intro && <p className={`${accent}-intro`}>{intro}</p>}

      <div className="lab-tabs">
        {steps.map((st, idx) => (
          <button
            key={st.label}
            className={`lab-tab ${i === idx ? "active" : ""} ${idx < i ? "done" : ""}`}
            onClick={() => setI(idx)}
          >
            {st.label}
          </button>
        ))}
      </div>

      <div className="lab-progress">
        <span className="lab-progress-fill" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
      </div>

      <div className="lab-screen">
        <div className="lab-screen-bar">
          <span className="lab-dot r" /><span className="lab-dot y" /><span className="lab-dot g" />
          <span className="lab-screen-caption">{s.screen}</span>
        </div>
        <ol className="lab-detail">
          {s.detail.map((d, di) => <li key={di}>{d}</li>)}
        </ol>
      </div>

      {s.note && <div className="lab-note">{s.note}</div>}
      {s.warn && <div className="lab-note warn">⚠️ {s.warn}</div>}

      <div className="lab-nav">
        <button className="lab-btn" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>
          ← Previous
        </button>
        <span className="lab-count">Step {i + 1} of {steps.length}</span>
        <button className="lab-btn" onClick={() => setI((v) => Math.min(last, v + 1))} disabled={i === last}>
          Next →
        </button>
      </div>
    </div>
  );
}
