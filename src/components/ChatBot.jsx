import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import "./ChatBot.css";

const WELCOME =
  "Hi! Ask me anything about AWS — I'll search AWS's official documentation to answer.";

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
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        const errBody = await res.text().catch(() => "");
        throw new Error(errBody || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      if (!acc) {
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = {
            role: "assistant",
            content: "I didn't get a response — please try asking again.",
          };
          return copy;
        });
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
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
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg-${m.role}`}>
                {m.content || (loading && i === messages.length - 1 ? "…" : "")}
              </div>
            ))}
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
