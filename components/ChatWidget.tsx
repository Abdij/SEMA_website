"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { SUGGESTED_QUESTIONS } from "@/lib/chatbot-faq";

const actionSchema = z.object({ label: z.string().max(100), href: z.string().refine(href =>
  /^\/(?!\/)[a-zA-Z0-9/_ .-]+$/.test(href) || href === "https://www.unmas.org/sites/default/files/handbook_english.pdf") });
const turnSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000), actions: z.array(actionSchema).max(5).optional() });
type ChatTurn = z.infer<typeof turnSchema>;
const STORAGE_KEY = "sema_faq_history_v1";
const MAX_TURNS = 100;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      sessionStorage.removeItem("sema_chat_session_id");
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = z.array(turnSchema).max(MAX_TURNS).safeParse(JSON.parse(saved));
        if (parsed.success) setTurns(parsed.data);
        else sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch { setStorageUnavailable(true); }
    setStorageReady(true);
    return () => requestRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      if (turns.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch { setStorageUnavailable(true); }
  }, [turns, storageReady]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [turns, sending, open]);

  function close() { setOpen(false); toggleRef.current?.focus(); }
  function clearHistory() {
    setTurns([]); setInput(""); setError(""); inputRef.current?.focus();
  }
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); void sendMessage(input);
  }
  async function sendMessage(value: string) {
    const message = value.trim();
    if (!message || busyRef.current) return;
    busyRef.current = true;
    setInput(message); setSending(true); setError("");
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }), signal: controller.signal,
      });
      if (!response.ok) {
        const wait = Number(response.headers.get("Retry-After"));
        throw new Error(response.status === 429
          ? `Too many questions. Please try again${wait > 0 ? ` in ${Math.ceil(wait / 60)} minute(s)` : " later"}. Your question is still below.`
          : "Unable to answer right now. Your question is still below; please try sending again.");
      }
      const data = z.object({ reply: z.string().min(1).max(4000), actions: z.array(actionSchema).max(5) }).parse(await response.json());
      setTurns(prev => [...prev, { role: "user" as const, content: message }, { role: "assistant" as const, content: data.reply, actions: data.actions }].slice(-MAX_TURNS));
      setInput("");
    } catch (err) {
      setError(controller.signal.aborted ? "The request timed out. Your question is still below; please try sending again." : err instanceof Error ? err.message : "Unable to answer. Please try again.");
    } finally {
      clearTimeout(timeout); busyRef.current = false; setSending(false); requestRef.current = null;
    }
  }

  return (
    <div className="chat-widget">
      {open ? (
        <div id="sema-faq" className="chat-widget-panel" role="dialog" aria-label="SEMA FAQ" onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}>
          <div className="chat-widget-header">
            <span>SEMA FAQ</span>
            <button type="button" aria-label="Close chat" onClick={close}><X size={18} aria-hidden="true" /></button>
          </div>
          <div className="chat-widget-messages" ref={listRef}>
            <div className="chat-widget-intro">
              <p>Fixed answers from SEMA’s website. No AI. Each question is answered independently.</p>
              <p className="chat-widget-privacy">Questions are processed by this website but new transcripts are not saved on the server. The last 50 exchanges are saved in this browser tab until you delete them. Avoid personal details and precise hazard locations. <Link href="/en/privacy">Privacy notice</Link></p>
              <p><strong>Not monitored for emergencies.</strong></p>
              {storageUnavailable ? <p role="status">Browser history storage is unavailable. This conversation may not survive a reload.</p> : null}
              <button type="button" onClick={clearHistory} disabled={sending || !turns.length}>Delete conversation</button>
              <div className="chat-widget-suggestions">
                {SUGGESTED_QUESTIONS.map(question => <button key={question} type="button" disabled={sending} onClick={() => void sendMessage(question)}>{question}</button>)}
              </div>
            </div>
            <div className="chat-widget-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation">
              {turns.map((turn, index) => (
                <div key={index} className={`chat-widget-bubble chat-widget-bubble--${turn.role}`}>
                  <span className="chat-widget-speaker">{turn.role === "user" ? "You" : "SEMA FAQ"}: </span>{turn.content}
                  {turn.actions?.length ? <ul className="chat-widget-actions">{turn.actions.map(action => <li key={action.href}><a href={action.href}>{action.label}</a></li>)}</ul> : null}
                </div>
              ))}
            </div>
            {sending ? <p role="status">Finding an FAQ answer…</p> : null}
          </div>
          {error ? <p role="alert" className="chat-widget-error">{error}</p> : null}
          <form className="chat-widget-form" onSubmit={onSubmit}>
            <input ref={inputRef} value={input} onChange={event => setInput(event.target.value)} placeholder="Ask a question…" maxLength={1000} readOnly={sending} aria-label="Your message" />
            <button type="submit" aria-label="Send message" disabled={sending || !input.trim()}><Send size={18} aria-hidden="true" /></button>
          </form>
        </div>
      ) : null}
      <button ref={toggleRef} type="button" className="chat-widget-toggle" aria-label={open ? "Close FAQ" : "Open SEMA FAQ"} aria-expanded={open} aria-controls="sema-faq" onClick={() => open ? close() : setOpen(true)}>
        {open ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
      </button>
    </div>
  );
}
