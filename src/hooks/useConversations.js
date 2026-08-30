import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "aws-assistant-conversations";

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // storage full or unavailable — conversation history just won't persist
  }
}

// Immediate placeholder so the sidebar never sits on "New chat" while the
// generated title is in flight. Replaced by /api/title when that returns.
function titleFromMessages(messages) {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  const text = firstUser.content.trim();
  return text.length > 42 ? text.slice(0, 42) + "…" : text;
}

export default function useConversations() {
  const [conversations, setConversations] = useState(loadAll);

  useEffect(() => {
    saveAll(conversations);
  }, [conversations]);

  const create = useCallback(() => {
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const conv = { id, title: "New chat", messages: [], createdAt: Date.now() };
    setConversations((prev) => [conv, ...prev]);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setMessages = useCallback((id, updater) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextMessages = typeof updater === "function" ? updater(c.messages) : updater;
        const nextTitle = c.title === "New chat" ? titleFromMessages(nextMessages) : c.title;
        return { ...c, messages: nextMessages, title: nextTitle, updatedAt: Date.now() };
      })
    );
  }, []);

  // Set once from /api/title; `titled` stops a later turn from overwriting it.
  const rename = useCallback((id, title) => {
    if (!title) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title, titled: true } : c))
    );
  }, []);

  return { conversations, create, remove, setMessages, rename };
}
