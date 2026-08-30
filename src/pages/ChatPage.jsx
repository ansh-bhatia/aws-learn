import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquarePlus, Send, Square, Trash2, Loader2 } from "lucide-react";
import useConversations from "../hooks/useConversations";
import MarkdownMessage from "../components/MarkdownMessage";
import MessageActions from "../components/MessageActions";
import SourceList from "../components/SourceList";
import "./ChatPage.css";

const WELCOME =
  "Hi! Ask me anything about AWS — I'll search AWS's official documentation to answer.";

// Stages the request passes through, so the wait shows real progress instead
// of one static caption. "Thinking" rather than "Searching" up front because
// the model doesn't always call the search tool.
const STATUS_THINKING = "Thinking…";
const STATUS_SEARCHING = "Searching AWS docs…";
const STATUS_WRITING = "Writing answer…";

const REQUEST_TIMEOUT_MS = 130000;

export default function ChatPage() {
  const { conversations, create, remove, setMessages } = useConversations();
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const listRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);
  const stoppedRef = useRef(false);
  // Only follow the stream while the user is already at the bottom — yanking
  // them back down while they're reading earlier text is worse than a
  // slightly stale viewport.
  const followRef = useRef(true);

  const active = conversations.find((c) => c.id === activeId) || null;
  const messages = active?.messages || [];

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [activeId, conversations]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      followRef.current = distanceFromBottom < 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!listRef.current || !followRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, activeId]);

  // Switching conversations should always land at the newest message.
  useEffect(() => {
    followRef.current = true;
  }, [activeId]);

  useEffect(() => {
    setSuggestions([]);
  }, [activeId]);

  const handleNewChat = () => {
    const id = create();
    setActiveId(id);
    setSuggestions([]);
  };

  const fetchSuggestions = async (finalMessages) => {
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: finalMessages }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setSuggestions(data.questions);
      }
    } catch {
      // suggestions are a nicety — fail silently
    }
  };

  // Shared by send() and regenerate(): `turns` is the full conversation up to
  // and including the user message being answered. Everything after it is
  // replaced by the assistant reply this produces.
  const runCompletion = async (convId, turns) => {
    setError(null);
    setSuggestions([]);
    setMessages(convId, [
      ...turns,
      { role: "assistant", content: "", status: STATUS_THINKING },
    ]);
    setLoading(true);
    followRef.current = true; // a new answer should scroll into view


    const controller = new AbortController();
    abortRef.current = controller;
    stoppedRef.current = false;
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const updateLast = (patch) => {
      setMessages(convId, (prev) => {
        const copy = prev.slice();
        copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
        return copy;
      });
    };

    let acc = "";
    const sources = [];
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: turns }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errBody = await res.text().catch(() => "");
        throw new Error(errBody || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
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
          } else if (evt.t === "source") {
            // Upsert by index — a source is emitted once when first cited
            // (title may be a domain placeholder) and again once its real
            // page title arrives.
            const at = sources.findIndex((s) => s.index === evt.v.index);
            if (at === -1) sources.push(evt.v);
            else sources[at] = evt.v;
            sources.sort((a, b) => a.index - b.index);
            updateLast({ sources: [...sources] });
          } else if (evt.t === "tool") {
            updateLast({ status: STATUS_SEARCHING });
          } else if (evt.t === "tool_done") {
            // Search finished but no prose yet — the model is composing.
            updateLast({ status: STATUS_WRITING });
          }
        }
      }
      if (!acc) {
        updateLast({
          content: "I didn't get a response — please try asking again.",
          status: undefined,
        });
      } else {
        fetchSuggestions([...turns, { role: "assistant", content: acc }]);
      }
    } catch (err) {
      const aborted = err.name === "AbortError";
      const stoppedByUser = aborted && stoppedRef.current;
      if (acc) {
        // Keep whatever was already streamed rather than throwing it away —
        // a partial, well-sourced answer is more useful than nothing.
        const note = stoppedByUser
          ? "\n\n*(Stopped.)*"
          : "\n\n*(Response cut off — this was taking longer than expected.)*";
        updateLast({ content: acc + note, status: undefined });
        fetchSuggestions([...turns, { role: "assistant", content: acc }]);
      } else if (stoppedByUser) {
        // Nothing had streamed yet — drop the empty assistant bubble.
        setMessages(convId, turns);
      } else {
        setError(
          aborted
            ? "This is taking longer than expected. Try a shorter or more specific question."
            : err.message || "Something went wrong."
        );
        // keep the user's message visible even though the assistant reply failed
        setMessages(convId, turns);
      }
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
      setLoading(false);
    }
  };

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    let convId = activeId;
    if (!convId) {
      convId = create();
      setActiveId(convId);
    }

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const prior = convId === activeId ? messages : [];
    await runCompletion(convId, [...prior, { role: "user", content: text }]);
  };

  // Re-answer the last user turn, discarding the reply that followed it.
  const regenerate = async () => {
    if (loading || !activeId) return;
    const lastUserAt = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUserAt === -1) return;
    await runCompletion(activeId, messages.slice(0, lastUserAt + 1));
  };

  const setFeedback = (msgIndex, value) => {
    if (!activeId) return;
    setMessages(activeId, (prev) =>
      prev.map((m, i) =>
        // Clicking the active rating again clears it.
        i === msgIndex ? { ...m, feedback: m.feedback === value ? undefined : value } : m
      )
    );
  };

  const stopGenerating = () => {
    stoppedRef.current = true;
    abortRef.current?.abort();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const onInputChange = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  };

  return (
    <div className="chatpage-shell">
      <aside className="chatpage-sidebar">
        <div className="chatpage-sidebar-header">
          <Link to="/" className="chatpage-back">
            <ArrowLeft size={16} />
            Back to topics
          </Link>
          <button className="chatpage-new" onClick={handleNewChat}>
            <MessageSquarePlus size={16} />
            New chat
          </button>
        </div>
        <div className="chatpage-history">
          {conversations.length === 0 && (
            <div className="chatpage-history-empty">No conversations yet</div>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`chatpage-history-item ${c.id === activeId ? "active" : ""}`}
              onClick={() => setActiveId(c.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveId(c.id);
                }
              }}
            >
              <span className="chatpage-history-title">{c.title}</span>
              <button
                className="chatpage-history-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(c.id);
                  if (c.id === activeId) setActiveId(null);
                }}
                aria-label="Delete conversation"
                title="Delete conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="chatpage-main">
        <header className="chatpage-header">
          <span className="chatpage-title">AWS Assistant</span>
          <span className="chatpage-subtitle">Grounded in docs.aws.amazon.com</span>
        </header>

        <div className="chatpage-messages" ref={listRef}>
          {messages.length === 0 && (
            <div className="chatpage-welcome">
              <p>{WELCOME}</p>
            </div>
          )}
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const searching = loading && isLast && m.status;
            if (searching && !m.content) {
              return (
                <div key={i} className="chatpage-msg chatpage-msg-assistant chatpage-msg-pending">
                  <span className="chatpage-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  {m.status}
                </div>
              );
            }
            return (
              <div key={i} className={`chatpage-msg chatpage-msg-${m.role}`}>
                {m.role === "assistant" ? (
                  <>
                    <MarkdownMessage content={m.content} />
                    {m.sources?.length > 0 && <SourceList sources={m.sources} />}
                    {/* Actions only once the answer is settled — mid-stream
                        copy or regenerate would act on partial text. */}
                    {!loading && m.content && (
                      <MessageActions
                        content={m.content}
                        feedback={m.feedback}
                        onFeedback={(v) => setFeedback(i, v)}
                        onRegenerate={regenerate}
                        canRegenerate={isLast}
                      />
                    )}
                  </>
                ) : (
                  m.content
                )}
                {searching && (
                  <div className="chatpage-status-inline">
                    <span className="chatpage-dots" aria-hidden="true">
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
          {error && <div className="chatpage-error">{error}</div>}

          {!loading && suggestions.length > 0 && (
            <div className="chatpage-suggestions">
              {suggestions.map((q, i) => (
                <button key={i} className="chatpage-suggestion-chip" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="chatpage-stop-row">
            <button className="chatpage-stop" onClick={stopGenerating}>
              <Square size={11} fill="currentColor" />
              Stop generating
            </button>
          </div>
        )}

        <div className="chatpage-input-row">
          <textarea
            ref={textareaRef}
            className="chatpage-input"
            placeholder="Ask about any AWS service…"
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="chatpage-send"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            {loading ? <Loader2 size={18} className="chatpage-spin" /> : <Send size={18} />}
          </button>
        </div>
      </main>
    </div>
  );
}
