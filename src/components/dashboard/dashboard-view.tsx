"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { JournalEntry, MdbOverviewSnapshot } from "@/types";

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value)).toUpperCase();
}

function Panel({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("panel-border bg-card", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-2 py-1">
        <p className="font-mono-tight text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
          {title}
        </p>
        {meta && <div className="font-mono-tight text-[10px] text-muted-foreground">{meta}</div>}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

function StatCell({
  label,
  value,
  hint,
  tone,
  trendIcon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "pos" | "neg" | "neutral";
  trendIcon?: React.ReactNode;
}) {
  const valueClass =
    tone === "pos" ? "text-success" : tone === "neg" ? "text-danger" : "text-foreground";
  return (
    <div className="border-r border-border px-3 py-1.5 last:border-r-0">
      <div className="flex items-center gap-1.5">
        <p className="font-mono-tight text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {trendIcon}
      </div>
      <p className={cn("mt-0.5 font-mono-tight text-xl font-semibold tabular-nums leading-tight", valueClass)}>
        {value}
      </p>
      {hint && <p className="mt-0.5 font-mono-tight text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function entryCategory(entry: JournalEntry) {
  return entry.assetCategory ?? "Others";
}

export function DashboardView({ snapshot }: { snapshot: MdbOverviewSnapshot }) {
  const currency = snapshot.settings.reportingCurrency;
  const unrealizedPct =
    snapshot.totalInvestedAed > 0
      ? (snapshot.unrealizedPnlAed / snapshot.totalInvestedAed) * 100
      : 0;
  const unrealizedTone: "pos" | "neg" | "neutral" =
    snapshot.unrealizedPnlAed > 0 ? "pos" : snapshot.unrealizedPnlAed < 0 ? "neg" : "neutral";
  const realizedTone: "pos" | "neg" | "neutral" =
    snapshot.realizedPnlAed > 0 ? "pos" : snapshot.realizedPnlAed < 0 ? "neg" : "neutral";

  const sortedByPnl = [...snapshot.activeItems].sort((a, b) => b.pnlAed - a.pnlAed);
  const oversizedBucket = snapshot.categories.find((c) => c.weightPct >= 35);

  return (
    <div className="space-y-1">
      {/* TOP STRIP — KPI band */}
      <div className="grid grid-cols-2 gap-px panel-border bg-border lg:grid-cols-4">
        <div className="bg-card">
          <StatCell
            label="BOOK VALUE"
            value={formatCurrency(snapshot.currentValueAed, currency)}
            hint={`${snapshot.activeInvestments} ACTIVE · ${snapshot.closedInvestments} CLOSED`}
          />
        </div>
        <div className="bg-card">
          <StatCell
            label="INVESTED"
            value={formatCurrency(snapshot.totalInvestedAed, currency)}
            hint="CAPITAL DEPLOYED"
          />
        </div>
        <div className="bg-card">
          <StatCell
            label="UNREALIZED"
            value={formatCurrency(snapshot.unrealizedPnlAed, currency)}
            hint={`${formatPercent(unrealizedPct)} ON INVESTED`}
            tone={unrealizedTone}
            trendIcon={
              snapshot.unrealizedPnlAed >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-success" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-danger" />
              )
            }
          />
        </div>
        <div className="bg-card">
          <StatCell
            label="REALIZED"
            value={formatCurrency(snapshot.realizedPnlAed, currency)}
            hint={`${snapshot.closedInvestments} CLOSED ENTRIES`}
            tone={realizedTone}
          />
        </div>
      </div>

      {/* MAIN ROW */}
      <div className="grid gap-1 lg:grid-cols-[1.5fr_1fr]">
        {/* HOLDINGS TABLE */}
        <Panel
          title="ACTIVE BOOK"
          meta={<span>{snapshot.activeItems.length} POSITIONS · {currency}</span>}
        >
          <table className="w-full font-mono-tight text-[11px] tabular-nums">
            <thead className="border-b border-border text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-1 py-1 text-left">TICKER</th>
                <th className="px-1 py-1 text-left">CAT</th>
                <th className="px-1 py-1 text-right">INVESTED</th>
                <th className="px-1 py-1 text-right">CURRENT</th>
                <th className="px-1 py-1 text-right">P&L</th>
                <th className="px-1 py-1 text-right">P&L%</th>
              </tr>
            </thead>
            <tbody>
              {sortedByPnl.slice(0, 12).map((item) => {
                const tone = item.pnlAed > 0 ? "text-success" : item.pnlAed < 0 ? "text-danger" : "";
                return (
                  <tr className="border-b border-border/40 hover:bg-muted/30" key={item.id}>
                    <td className="px-1 py-1">
                      <span className="font-semibold">{item.code}</span>
                      <span className="ml-1 text-[10px] text-muted-foreground">{item.name.slice(0, 14)}</span>
                    </td>
                    <td className="px-1 py-1 text-[10px] uppercase text-muted-foreground">
                      {item.category.slice(0, 4)}
                    </td>
                    <td className="px-1 py-1 text-right text-foreground">
                      {formatCurrency(item.investedAed, currency)}
                    </td>
                    <td className="px-1 py-1 text-right text-foreground">
                      {formatCurrency(item.currentValueAed, currency)}
                    </td>
                    <td className={cn("px-1 py-1 text-right", tone)}>
                      {item.pnlAed >= 0 ? "+" : ""}
                      {formatCurrency(item.pnlAed, currency)}
                    </td>
                    <td className={cn("px-1 py-1 text-right", tone)}>{formatPercent(item.pnlPct)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        {/* RIGHT COLUMN: Allocation + Risk */}
        <div className="grid gap-1">
          <Panel
            title="ALLOCATION"
            meta={
              <span>
                {snapshot.categories.filter((c) => c.itemCount > 0).length} ACTIVE BUCKETS
              </span>
            }
          >
            <div className="space-y-1">
              {snapshot.categories.map((item) => (
                <div className="flex items-center gap-2" key={item.category}>
                  <span className="w-20 font-mono-tight text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {item.category}
                  </span>
                  <div className="relative flex-1 h-3 bg-muted">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0",
                        item.weightPct >= 35 ? "bg-warning/70" : "bg-accent/60",
                      )}
                      style={{ width: `${Math.min(item.weightPct, 100)}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "w-12 text-right font-mono-tight text-[11px] tabular-nums",
                      item.weightPct >= 35 ? "text-warning" : "text-foreground",
                    )}
                  >
                    {item.weightPct}%
                  </span>
                  <span className="w-20 text-right font-mono-tight text-[10px] tabular-nums text-muted-foreground">
                    {formatCurrency(item.currentValueAed, currency)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="RISK"
            meta={oversizedBucket ? <span className="text-warning">1 FLAG</span> : <span className="text-success">CLEAR</span>}
          >
            {oversizedBucket ? (
              <div className="flex items-start gap-2 border-l-2 border-warning/60 px-2 py-1">
                <AlertTriangle className="mt-0.5 h-3 w-3 text-warning" />
                <div>
                  <p className="font-mono-tight text-[11px] text-warning">
                    CONCENTRATION · {oversizedBucket.category.toUpperCase()}
                  </p>
                  <p className="font-mono-tight text-[10px] text-muted-foreground">
                    {oversizedBucket.weightPct}% of book — above 35% guideline
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-mono-tight text-[11px] text-muted-foreground">No threshold breaches.</p>
            )}
          </Panel>
        </div>
      </div>

      {/* BOTTOM ROW: Journal feed */}
      <Panel
        title="RECENT JOURNAL"
        meta={<span>{snapshot.recentEntries.length} ENTRIES</span>}
      >
        <table className="w-full font-mono-tight text-[11px] tabular-nums">
          <thead className="border-b border-border text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-1 py-1 text-left">DATE</th>
              <th className="px-1 py-1 text-left">TICKER</th>
              <th className="px-1 py-1 text-left">NAME</th>
              <th className="px-1 py-1 text-left">CAT</th>
              <th className="px-1 py-1 text-left">STATUS</th>
              <th className="px-1 py-1 text-left">THESIS</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.recentEntries.map((entry) => (
              <tr className="border-b border-border/40 hover:bg-muted/30" key={entry.id}>
                <td className="px-1 py-1 text-muted-foreground">{formatShortDate(entry.openedAt)}</td>
                <td className="px-1 py-1 font-semibold">{entry.ticker}</td>
                <td className="px-1 py-1 text-foreground">{entry.assetName ?? entry.ticker}</td>
                <td className="px-1 py-1 text-[10px] uppercase text-muted-foreground">
                  {entryCategory(entry).slice(0, 4)}
                </td>
                <td
                  className={cn(
                    "px-1 py-1 text-[10px] uppercase",
                    entry.status === "OPEN" ? "text-success" : "text-muted-foreground",
                  )}
                >
                  {entry.status}
                </td>
                <td className="max-w-md truncate px-1 py-1 text-muted-foreground">{entry.thesis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
