import { useState } from "react";
import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";

export default function MessageActions({
  content,
  feedback,
  onFeedback,
  onRegenerate,
  canRegenerate,
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!content) return;
    navigator.clipboard?.writeText(content).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => {
        /* clipboard blocked — stay silent rather than showing a false success */
      }
    );
  };

  return (
    <div className="msg-actions">
      <button
        className="msg-action"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy message"}
        title={copied ? "Copied" : "Copy message"}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>

      {canRegenerate && (
        <button
          className="msg-action"
          onClick={onRegenerate}
          aria-label="Regenerate response"
          title="Regenerate response"
        >
          <RefreshCw size={14} />
        </button>
      )}

      <span className="msg-action-sep" aria-hidden="true" />

      <button
        className={`msg-action ${feedback === "up" ? "active-up" : ""}`}
        onClick={() => onFeedback("up")}
        aria-label="Good response"
        aria-pressed={feedback === "up"}
        title="Good response"
      >
        <ThumbsUp size={14} />
      </button>
      <button
        className={`msg-action ${feedback === "down" ? "active-down" : ""}`}
        onClick={() => onFeedback("down")}
        aria-label="Bad response"
        aria-pressed={feedback === "down"}
        title="Bad response"
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  );
}
