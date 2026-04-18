"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Send, Terminal } from "lucide-react";

import { cn } from "@/lib/utils";

type Role = "system" | "user" | "assistant";
type Message = { id: string; role: Role; content: string };
type Tab = "chat" | "activity" | "briefing";

const QUICK_ACTIONS: Array<{ label: string; prompt: string }> = [
  { label: "BRIEF", prompt: "Give me a one-paragraph briefing on my portfolio right now." },
  { label: "RISK", prompt: "Run a risk check and call out any breaches." },
  { label: "OPEN", prompt: "List my open positions with current P&L." },
  { label: "RECALL", prompt: "Recall my most recent MSFT journal entry and what I learned." },
];

const SYSTEM_PROMPT: Message = {
  id: "system",
  role: "system",
  content:
    "You are Jarvis, Francis Alfred's portfolio command-center assistant. Address him as 'sir' once or twice per conversation, never every line. Be concise. When asked to log a trade, close a position, or run a risk check, call the appropriate tool rather than describing what you would do. Keep replies under 4 sentences unless the user asks for more.",
};

const INTRO: Message = {
  id: "intro",
  role: "assistant",
  content:
    "Standing by, sir. Type a query or hit one of the function buttons.",
};

export function JarvisDock({ onCollapse }: { onCollapse?: () => void } = {}) {
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([INTRO]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [audit, setAudit] = useState<Array<{ id: string; toolName: string; status: string; createdAt: string }>>([]);
  const [digest, setDigest] = useState<{ scriptText: string; generatedAt: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, tab]);

  useEffect(() => {
    if (tab === "activity") {
      fetch("/api/jarvis/audit?limit=20")
        .then((r) => r.json())
        .then((d) => setAudit(d.audit ?? []))
        .catch(() => {});
    }
    if (tab === "briefing") {
      fetch("/api/jarvis/actions/digest/store")
        .then((r) => r.json())
        .then((d) => setDigest(d.digest ?? null))
        .catch(() => {});
    }
  }, [tab]);

  async function send(promptText: string) {
    const text = promptText.trim();
    if (!text || pending) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    const assistantMsg: Message = { id: `a-${Date.now()}`, role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setPending(true);

    try {
      const history = [SYSTEM_PROMPT, ...messages.filter((m) => m.role !== "system"), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, stream: true }),
      });

      if (!res.body) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: "(no response)" } : m)),
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
            };
            const piece =
              parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? "";
            if (piece) {
              acc += piece;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: acc } : m)),
              );
            }
          } catch {
            // ignore malformed chunk
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: "Jarvis offline." } : m,
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <aside className="flex h-full w-full flex-col panel-border bg-card">
      <header className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-accent" />
          <p className="font-mono-tight text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            JARVIS
          </p>
          <span className="font-mono-tight text-[10px] text-muted-foreground">
            {pending ? "EXEC…" : "READY"}
          </span>
          {pending && <span className="blink text-accent">▍</span>}
        </div>
        <button
          aria-label="Collapse Jarvis"
          className="text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => onCollapse?.()}
          type="button"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </header>

      <div className="flex border-b border-border bg-muted/20">
        {(["chat", "activity", "briefing"] as Tab[]).map((t) => (
          <button
            className={cn(
              "flex-1 border-r border-border px-2 py-1 font-mono-tight text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors last:border-r-0",
              tab === t ? "bg-background text-accent" : "text-muted-foreground hover:text-foreground",
            )}
            key={t}
            onClick={() => setTab(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono-tight text-[12px] leading-5" ref={scrollRef}>
        {tab === "chat" && (
          <div className="space-y-1.5">
            {messages
              .filter((m) => m.role !== "system")
              .map((m) => (
                <div
                  className={cn(
                    "border-l-2 px-2 py-1",
                    m.role === "assistant"
                      ? "border-accent/40 text-foreground"
                      : "border-info/40 text-foreground/80",
                  )}
                  key={m.id}
                >
                  <span className="mr-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {m.role === "assistant" ? "JRV>" : "USR>"}
                  </span>
                  {m.content || (pending && m.role === "assistant" ? <span className="blink">▍</span> : "")}
                </div>
              ))}
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-0.5">
            {audit.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">No tool activity.</p>
            ) : (
              audit.map((row) => (
                <div className="flex items-center justify-between border-b border-border/50 py-1" key={row.id}>
                  <div>
                    <p className="text-[11px] text-foreground">{row.toolName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString("en-AE")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-1.5 text-[10px] uppercase",
                      row.status === "success" ? "text-success" : "text-danger",
                    )}
                  >
                    {row.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "briefing" && (
          <div className="space-y-2">
            {digest ? (
              <>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {new Date(digest.generatedAt).toLocaleString("en-AE")}
                </p>
                <pre className="whitespace-pre-wrap font-mono-tight text-[12px] leading-5 text-foreground">
                  {digest.scriptText}
                </pre>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">No briefing. Run `npm run jarvis:digest`.</p>
            )}
          </div>
        )}
      </div>

      {tab === "chat" && (
        <div className="border-t border-border">
          <div className="flex border-b border-border">
            {QUICK_ACTIONS.map((action) => (
              <button
                className="flex-1 border-r border-border px-1 py-1 font-mono-tight text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors last:border-r-0 hover:bg-muted hover:text-accent disabled:opacity-40"
                disabled={pending}
                key={action.label}
                onClick={() => send(action.prompt)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
          <form
            className="flex items-center gap-1 px-2 py-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <span className="font-mono-tight text-[11px] text-accent">›</span>
            <input
              className="flex-1 bg-transparent font-mono-tight text-[12px] placeholder:text-muted-foreground/60 focus:outline-none"
              disabled={pending}
              onChange={(e) => setInput(e.target.value)}
              placeholder={pending ? "EXEC…" : "type a query or command"}
              value={input}
            />
            <button
              aria-label="Send"
              className="border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent transition-colors hover:bg-accent/20 disabled:opacity-40"
              disabled={pending || !input.trim()}
              type="submit"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
