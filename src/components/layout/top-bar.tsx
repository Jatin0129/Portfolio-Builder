"use client";

import { useEffect, useState } from "react";
import { Command } from "lucide-react";

function useDubaiClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function isUsMarketOpen(now: Date) {
  const utc = now.getUTCHours() * 60 + now.getUTCMinutes();
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return false;
  return utc >= 14 * 60 + 30 && utc <= 21 * 60;
}

const FN_KEYS = [
  { key: "F1", label: "OVRVW" },
  { key: "F2", label: "INVST" },
  { key: "F3", label: "JRNL" },
  { key: "F4", label: "MKT" },
  { key: "F5", label: "RSCH" },
  { key: "F6", label: "STG" },
];

export function TopBar({ onOpenPalette }: { onOpenPalette?: () => void }) {
  const now = useDubaiClock();
  const dubaiTime = now
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Dubai",
        hourCycle: "h23",
      }).format(now)
    : "--:--:--";
  const dateStr = now
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dubai",
      })
        .format(now)
        .toUpperCase()
    : "--";
  const usOpen = now ? isUsMarketOpen(now) : false;

  return (
    <header className="panel-border bg-card">
      {/* Row 1: identity + clock + status */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))]" />
            <span className="font-mono-tight text-xs font-semibold tracking-[0.18em] text-accent">MDB · TERMINAL</span>
          </div>
          <span className="hidden h-3 w-px bg-border md:block" />
          <span className="hidden font-mono-tight text-[11px] uppercase tracking-[0.16em] text-muted-foreground md:inline">
            FRANCIS ALFRED · MD
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono-tight text-[11px]">
          <span className="text-muted-foreground">{dateStr}</span>
          <span className="text-foreground tabular-nums">{dubaiTime}</span>
          <span className="text-muted-foreground">GST</span>
          <span className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${usOpen ? "bg-success shadow-[0_0_6px_hsl(var(--success))]" : "bg-muted-foreground"}`}
            />
            <span className={usOpen ? "text-success" : "text-muted-foreground"}>
              US {usOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>
          <button
            className="ml-2 flex items-center gap-1.5 rounded-sm border border-border bg-muted px-2 py-1 font-mono-tight text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
            onClick={onOpenPalette}
            type="button"
          >
            <Command className="h-3 w-3" />
            CMD
            <kbd className="ml-1 rounded-sm bg-card px-1 text-[9px]">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* Row 2: function-key rail */}
      <div className="flex items-center gap-0 overflow-x-auto px-1 py-0.5">
        {FN_KEYS.map((fn) => (
          <button
            className="flex items-center gap-1.5 px-2 py-1 font-mono-tight text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-muted hover:text-accent"
            key={fn.key}
            type="button"
          >
            <span className="text-accent/70">{fn.key}</span>
            <span>{fn.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
