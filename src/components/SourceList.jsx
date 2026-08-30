import { ExternalLink } from "lucide-react";

// AWS doc page titles are all suffixed with the guide name after a dash
// ("... - Amazon Simple Storage Service"). The prefix is the useful part.
function shortTitle(title) {
  if (!title) return "";
  const cut = title.split(" - ")[0].trim();
  return cut.length > 72 ? cut.slice(0, 72) + "…" : cut;
}

export default function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-strip">
      <div className="sources-label">
        {sources.length} source{sources.length === 1 ? "" : "s"}
      </div>
      <div className="sources-chips">
        {sources.map((s, i) => (
          <a
            key={s.url}
            id={`source-${i + 1}`}
            className={`source-chip ${s.external ? "external" : ""}`}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.title ? `${s.title}\n${s.url}` : s.url}
          >
            <span className="source-num">{i + 1}</span>
            <span className="source-title">{shortTitle(s.title) || s.domain}</span>
            {s.external && (
              <span className="source-external" title="Not from docs.aws.amazon.com">
                <ExternalLink size={11} />
                external
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
