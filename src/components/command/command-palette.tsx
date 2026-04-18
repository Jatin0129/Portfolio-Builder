"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type RouteCommand = {
  id: string;
  label: string;
  hint?: string;
  href: string;
};

const ROUTES: RouteCommand[] = [
  { id: "go-overview", label: "Go to Overview", hint: "/", href: "/" },
  { id: "go-investments", label: "Go to Investments", hint: "/portfolio-risk", href: "/portfolio-risk" },
  { id: "go-journal", label: "Go to Journal", hint: "/journal-review", href: "/journal-review" },
  { id: "go-market", label: "Go to Live Market", hint: "/market-feed", href: "/market-feed" },
  { id: "go-research", label: "Go to Research", hint: "/intelligence", href: "/intelligence" },
  { id: "go-settings", label: "Go to Settings", hint: "/settings", href: "/settings" },
];

const SYSTEM_PROMPT = {
  role: "system" as const,
  content:
    "You are Jarvis, Francis Alfred's portfolio assistant. Reply in two sentences max. If a tool is needed, name it briefly.",
};

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setReply(null);
      setPending(false);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const filteredRoutes = query
    ? ROUTES.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : ROUTES;

  async function askJarvis() {
    if (!query.trim() || pending) return;
    setPending(true);
    setReply("");
    try {
      const res = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [SYSTEM_PROMPT, { role: "user", content: query }],
          stream: false,
        }),
      });
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      setReply(data.choices?.[0]?.message?.content ?? "(no reply)");
    } catch {
      setReply("Jarvis is offline. Start the sidecar with `npm run jarvis:serve`.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[18vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,31,0.98),rgba(10,16,26,0.98))] shadow-[0_30px_120px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          className="flex items-center gap-3 border-b border-white/8 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            askJarvis();
          }}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search routes, or ask Jarvis (Enter to ask)…"
            value={query}
          />
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </form>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {filteredRoutes.length > 0 && !reply && (
            <>
              <p className="px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Routes</p>
              {filteredRoutes.map((c) => (
                <button
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    "hover:bg-white/5",
                  )}
                  key={c.id}
                  onClick={() => {
                    router.push(c.href);
                    onOpenChange(false);
                  }}
                  type="button"
                >
                  <span>{c.label}</span>
                  <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {c.hint}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </>
          )}

          {query.trim() && !reply && (
            <button
              className="mt-2 flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/15"
              disabled={pending}
              onClick={askJarvis}
              type="button"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="flex-1">Ask Jarvis: <span className="text-foreground">"{query}"</span></span>
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <ArrowRight className="h-3 w-3 text-primary" />
              )}
            </button>
          )}

          {reply !== null && (
            <div className="mt-2 space-y-2">
              <p className="px-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Jarvis</p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm leading-6">
                {reply || (pending ? "…" : "(no reply)")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
