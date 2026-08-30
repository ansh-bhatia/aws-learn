import { BookOpen, ExternalLink, FileText } from "lucide-react";

// AWS doc page titles are all suffixed with the guide name after a dash
// ("... - Amazon Simple Storage Service"). The prefix is the useful part.
function shortTitle(title) {
  if (!title) return "";
  const cut = title.split(" - ")[0].trim();
  return cut.length > 72 ? cut.slice(0, 72) + "…" : cut;
}

export default function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;

  const noteCount = sources.filter((s) => s.kind === "topic").length;
  const webCount = sources.length - noteCount;
  const label = [
    noteCount ? `${noteCount} from your notes` : "",
    webCount ? `${webCount} from AWS docs` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="sources-strip">
      <div className="sources-label">{label}</div>
      <div className="sources-chips">
        {sources.map((s, i) => {
          // Conversations saved before sources carried an index are still in
          // localStorage — fall back to position.
          const index = s.index ?? i + 1;
          const isTopic = s.kind === "topic";
          return (
            <a
              key={`${index}-${s.url}`}
              // Inline [n] markers in the answer link here by this id.
              id={`source-${index}`}
              className={`source-chip ${isTopic ? "topic" : ""} ${s.external ? "external" : ""}`}
              href={s.url}
              // Course notes are a route in this app; docs are elsewhere.
              {...(isTopic ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              title={s.title ? `${s.title}\n${s.url}` : s.url}
            >
              <span className="source-num">{index}</span>
              {isTopic ? (
                <BookOpen size={12} />
              ) : s.external ? (
                <ExternalLink size={12} />
              ) : (
                <FileText size={12} />
              )}
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
