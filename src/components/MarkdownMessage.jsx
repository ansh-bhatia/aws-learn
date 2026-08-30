import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Check, Copy } from "lucide-react";

// Content originates from web search, so sanitize — but the default schema
// doesn't allow <span> at all and permits no hljs-* class values, which
// silently strips every token rehype-highlight produces. Re-admit just those.
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "span"],
  attributes: {
    ...defaultSchema.attributes,
    span: [["className", /^hljs-/]],
    code: [...(defaultSchema.attributes?.code || []), ["className", /^language-/, /^hljs$/]],
    pre: [...(defaultSchema.attributes?.pre || []), ["className", /^hljs$/]],
  },
};

// The model sometimes emits raw HTML list markup inside table cells despite
// being told not to. react-markdown escapes rather than renders it, so it
// would show up as literal "<ul><li>" text. Flatten it to readable prose.
function stripHtmlArtifacts(text) {
  if (!text || !text.includes("<")) return text;
  return text
    .replace(/<\/li>\s*<li>/gi, "; ")
    .replace(/<\/?(ul|ol|li|br|div|span|p)\s*\/?>/gi, "")
    .replace(/;\s*;/g, ";");
}

// `node` is react-markdown's internal hast node; destructure it out so it
// doesn't get spread onto the DOM element as a stray attribute.
function CodeBlock({ children, node, ...props }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (e) => {
      // Pull text straight off the rendered node — simpler and more accurate
      // than walking the React children tree for highlighted spans.
      const pre = e.currentTarget.parentElement?.querySelector("pre");
      const text = pre?.innerText ?? "";
      if (!text) return;
      navigator.clipboard?.writeText(text).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        },
        () => {
          /* clipboard blocked — leave the button silent rather than erroring */
        }
      );
    },
    []
  );

  return (
    <div className="md-codeblock">
      <button
        className="md-copy-btn"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        title={copied ? "Copied" : "Copy code"}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre {...props}>{children}</pre>
    </div>
  );
}

export default function MarkdownMessage({ content }) {
  return (
    <div className="chatpage-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, [rehypeSanitize, schema]]}
        components={{
          pre: CodeBlock,
          // Tables need their own scroll container so a wide comparison table
          // scrolls itself instead of stretching the whole message column.
          table: ({ node, ...props }) => (
            <div className="md-table-wrap">
              <table {...props} />
            </div>
          ),
          a: ({ node, href, ...props }) => {
            // "[n]" citation markers point at a chip in this message's own
            // sources strip. A bare hash jump doesn't work inside a scroll
            // container, so scroll to it and flash it instead.
            if (href?.startsWith("#source-")) {
              return (
                <a
                  {...props}
                  href={href}
                  className="md-cite"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(href.slice(1));
                    if (!el) return;
                    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    el.classList.add("source-chip-flash");
                    setTimeout(() => el.classList.remove("source-chip-flash"), 1200);
                  }}
                />
              );
            }
            return <a {...props} href={href} target="_blank" rel="noopener noreferrer" />;
          },
        }}
      >
        {stripHtmlArtifacts(content)}
      </ReactMarkdown>
    </div>
  );
}
