"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { SUGGESTED_QUESTIONS } from "@/lib/chatbot-faq";

type ChatTurn = { role: "user" | "assistant"; content: string };

const SESSION_STORAGE_KEY = "sema_chat_session_id";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) setSessionId(stored);
    } catch {
      // sessionStorage unavailable (private browsing, etc.) - fine, server will issue one.
    }
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns, sending]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  async function sendMessage(value: string) {
    const message = value.trim();
    if (!message || sending) return;

    setTurns((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId || undefined, message }),
      });
      const data = (await response.json()) as { message?: string; sessionId?: string; reply?: string };
      if (!response.ok || !data.reply) throw new Error(data.message || "Unable to send your message.");

      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        try {
          sessionStorage.setItem(SESSION_STORAGE_KEY, data.sessionId);
        } catch {
          // Ignore - the session still works for this request without persisted storage.
        }
      }
      setTurns((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send your message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-widget">
      {open ? (
        <div className="chat-widget-panel" role="dialog" aria-label="SEMA website assistant">
          <div className="chat-widget-header">
            <span>SEMA Assistant</span>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="chat-widget-messages" ref={listRef}>
            {turns.length === 0 ? (
              <div className="chat-widget-intro">
                <p>Ask me about SEMA&apos;s mandate, public dashboards, or how to request data.</p>
                <div className="chat-widget-suggestions">
                  {SUGGESTED_QUESTIONS.map((question) => (
                    <button key={question} type="button" onClick={() => sendMessage(question)}>
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {turns.map((turn, index) => (
              <div key={index} className={`chat-widget-bubble chat-widget-bubble--${turn.role}`}>
                {turn.content}
              </div>
            ))}
            {sending ? <div className="chat-widget-bubble chat-widget-bubble--assistant">Thinking…</div> : null}
          </div>
          {error ? <p className="chat-widget-error">{error}</p> : null}
          <form className="chat-widget-form" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your question…"
              maxLength={1000}
              disabled={sending}
              aria-label="Your message"
            />
            <button type="submit" aria-label="Send message" disabled={sending || !input.trim()}>
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      ) : null}
      <button
        type="button"
        className="chat-widget-toggle"
        aria-label={open ? "Close chat" : "Open chat with the SEMA assistant"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
      </button>
    </div>
  );
}
