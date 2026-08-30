import { ExternalLink, FileText } from "lucide-react";

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
        {sources.map((s, i) => {
          // Conversations saved before sources carried an index are still in
          // localStorage — fall back to position so they don't render as
          // "source-undefined".
          const index = s.index ?? i + 1;
          return (
          <a
            key={s.url}
            // Inline [n] markers in the answer link here by this id.
            id={`source-${index}`}
            className={`source-chip ${s.external ? "external" : ""}`}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.title ? `${s.title}\n${s.url}` : s.url}
          >
            <span className="source-num">{index}</span>
            {s.external ? <ExternalLink size={12} /> : <FileText size={12} />}
            <span className="source-title">{shortTitle(s.title) || s.domain}</span>
            {s.external && (
              <span className="source-external" title="Not from docs.aws.amazon.com">
                external
              </span>
            )}
          </a>
          );
        })}
      </div>
    </div>
  );
}
