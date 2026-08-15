import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import "./ChatBot.css";

const WELCOME =
  "Hi! Ask me anything about AWS — I'll search AWS's official documentation to answer.";

const TOOL_LABELS = {
  web_search: "Searching AWS docs…",
  web_fetch: "Reading AWS documentation…",
};

const REQUEST_TIMEOUT_MS = 100000;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    setInput("");

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "", status: "searching" }]);
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const updateLast = (patch) => {
      setMessages((prev) => {
        const copy = prev.slice();
        copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
        return copy;
      });
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errBody = await res.text().catch(() => "");
        throw new Error(errBody || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          let evt;
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }
          if (evt.t === "text") {
            acc += evt.v;
            updateLast({ content: acc, status: undefined });
          } else if (evt.t === "tool") {
            updateLast({ status: TOOL_LABELS[evt.v] || "Searching AWS docs…" });
          } else if (evt.t === "tool_done") {
            updateLast({ status: undefined });
          }
        }
      }
      if (!acc) {
        updateLast({
          content: "I didn't get a response — please try asking again.",
          status: undefined,
        });
      }
    } catch (err) {
      const timedOut = err.name === "AbortError";
      setError(
        timedOut
          ? "This is taking longer than expected. Try a shorter or more specific question."
          : err.message || "Something went wrong."
      );
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        className="chatbot-fab"
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? "Close AWS assistant" : "Open AWS assistant"}
        title="Ask the AWS assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="AWS documentation assistant">
          <div className="chatbot-header">
            <span className="chatbot-title">AWS Assistant</span>
            <span className="chatbot-subtitle">Grounded in docs.aws.amazon.com</span>
          </div>

          <div className="chatbot-messages" ref={listRef}>
            {messages.map((m, i) => {
              const isLast = i === messages.length - 1;
              const searching = loading && isLast && m.status;
              if (searching && !m.content) {
                return (
                  <div key={i} className="chatbot-msg chatbot-msg-assistant chatbot-msg-pending">
                    <span className="chatbot-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    {m.status}
                  </div>
                );
              }
              return (
                <div key={i} className={`chatbot-msg chatbot-msg-${m.role}`}>
                  {m.content}
                  {searching && (
                    <div className="chatbot-status-inline">
                      <span className="chatbot-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                      {m.status}
                    </div>
                  )}
                </div>
              );
            })}
            {error && <div className="chatbot-error">{error}</div>}
          </div>

          <div className="chatbot-input-row">
            <textarea
              className="chatbot-input"
              placeholder="Ask about any AWS service…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              {loading ? <Loader2 size={18} className="chatbot-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
