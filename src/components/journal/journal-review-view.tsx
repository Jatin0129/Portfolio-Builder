"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ClipboardList, Plus, Sparkles, Target } from "lucide-react";

import { DisciplineChart } from "@/components/charts/discipline-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { JournalEntry, JournalEntryInput, JournalExitInput, ReviewSnapshot } from "@/types";

function statusVariant(status: JournalEntry["status"]) {
  if (status === "OPEN") return "warning";
  if (status === "CLOSED") return "success";
  return "neutral";
}

export function JournalReviewView({ snapshot }: { snapshot: ReviewSnapshot }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"ALL" | JournalEntry["status"]>("ALL");
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedExit, setSelectedExit] = useState<JournalEntry | null>(null);
  const [isPending, startTransition] = useTransition();
  const [entryForm, setEntryForm] = useState<JournalEntryInput>({
    ticker: "NVDA",
    setupName: "AI leadership continuation",
    setupTags: ["ai", "breakout"],
    direction: "LONG",
    openedAt: new Date().toISOString(),
    entryPrice: 968,
    thesis: "Leadership remains intact while macro stays selective rather than outright bearish.",
    entryReasons: ["Relative strength remains elite", "Catalyst stack is active"],
    rulesFollowed: true,
    plannedRiskPct: 1,
    plannedRiskAed: 12500,
    disciplineScore: 8,
    holdingHorizon: "swing",
    reviewNotes: "Need confirmation through the trigger, not anticipation.",
  });
  const [exitForm, setExitForm] = useState<Omit<JournalExitInput, "id">>({
    closedAt: new Date().toISOString(),
    exitPrice: 0,
    exitReasons: ["Target reached"],
    rulesFollowed: true,
    reviewNotes: "Managed according to plan.",
  });

  const filteredEntries = useMemo(() => {
    if (statusFilter === "ALL") return snapshot.entries;
    return snapshot.entries.filter((entry) => entry.status === statusFilter);
  }, [snapshot.entries, statusFilter]);

  const openEntries = snapshot.entries.filter((entry) => entry.status === "OPEN");

  async function handleCreateEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      await fetch("/api/journal/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(entryForm),
      });
      setShowEntryModal(false);
      router.refresh();
    });
  }

  async function handleCloseTrade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedExit) return;

    startTransition(async () => {
      await fetch(`/api/journal/entries/${selectedExit.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(exitForm),
      });
      setSelectedExit(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Journal & Review"
        title="Execution quality and behavioral discipline"
        description="Trade logging, review analytics, and behavior diagnostics now share one operating surface so decisions and mistakes stay visible."
        action={
          <div className="flex items-center gap-3">
            <Badge variant="info">{snapshot.analytics.winRate}% win rate</Badge>
            <Button className="gap-2" onClick={() => setShowEntryModal(true)} type="button">
              <Plus className="h-4 w-4" />
              Log entry
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={<Target className="h-4 w-4 text-primary" />} label="Win rate" value={`${snapshot.analytics.winRate}%`} hint="Closed trade quality" />
        <MetricCard icon={<Sparkles className="h-4 w-4 text-cyan-300" />} label="Avg gain" value={`${snapshot.analytics.averageGain}%`} hint="Winning trades" />
        <MetricCard icon={<AlertTriangle className="h-4 w-4 text-rose-300" />} label="Avg loss" value={`${snapshot.analytics.averageLoss}%`} hint="Losing trades" />
        <MetricCard icon={<ClipboardList className="h-4 w-4 text-amber-300" />} label="Expectancy" value={`${snapshot.analytics.expectancy}R`} hint="Expected edge per trade" />
        <MetricCard icon={<Sparkles className="h-4 w-4 text-emerald-300" />} label="Open trades" value={openEntries.length} hint="Needs active management" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Setup analytics</CardTitle>
              <CardDescription>Performance quality by outcome, discipline, and repeatable setup behavior.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Best setup</p>
                <p className="mt-2 text-xl font-semibold">{snapshot.analytics.bestSetupType}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Worst setup</p>
                <p className="mt-2 text-xl font-semibold">{snapshot.analytics.worstSetupType}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Average R</p>
                <p className="mt-2 text-xl font-semibold">{snapshot.analytics.averageR}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Discipline average</p>
                <p className="mt-2 text-xl font-semibold">{snapshot.analytics.disciplineAverage}/10</p>
              </div>
            </div>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/4 p-4">
              <DisciplineChart data={snapshot.analytics.curve} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Behavioral review panel</CardTitle>
              <CardDescription>Flags where discipline drifted away from the operating profile.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Oversized trades</p>
                <Badge variant="warning">{snapshot.behavior.oversizedTrades.length}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {snapshot.behavior.oversizedTrades.slice(0, 3).map((item) => (
                  <p key={item.id} className="text-sm text-muted-foreground">
                    {item.ticker}: {item.detail}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Early exits</p>
                <Badge variant="info">{snapshot.behavior.earlyExits.length}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {snapshot.behavior.earlyExits.slice(0, 3).map((item) => (
                  <p key={item.id} className="text-sm text-muted-foreground">
                    {item.ticker}: {item.detail}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Missed stops</p>
                <Badge variant="danger">{snapshot.behavior.missedStops.length}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {snapshot.behavior.missedStops.slice(0, 3).map((item) => (
                  <p key={item.id} className="text-sm text-muted-foreground">
                    {item.ticker}: {item.detail}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Overtrading patterns</p>
                <Badge variant="neutral">{snapshot.behavior.overtradingPatterns.length}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {snapshot.behavior.overtradingPatterns.map((pattern) => (
                  <p key={pattern.date} className="text-sm text-muted-foreground">
                    {pattern.date}: {pattern.note}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Trade log</CardTitle>
            <CardDescription>Filter the journal, review setup tags, and close open positions from the same table surface.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["ALL", "OPEN", "CLOSED"] as const).map((option) => (
              <button
                key={option}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  statusFilter === option
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-white/10 bg-white/5 text-muted-foreground"
                }`}
                onClick={() => setStatusFilter(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="overflow-x-auto rounded-[24px] border border-white/10 bg-white/4">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/8 bg-[#0c1522] text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Trade</th>
                  <th className="px-4 py-3 font-medium">Setup</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">Outcome</th>
                  <th className="px-4 py-3 font-medium">Behavior</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/6 align-top last:border-b-0">
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{entry.ticker}</p>
                          <Badge variant={statusVariant(entry.status)}>{entry.status}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{entry.openedAt.slice(0, 10)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{entry.setupName}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.setupTags.map((tag) => (
                          <Badge key={tag} variant="neutral">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {entry.plannedRiskPct}% / AED {entry.plannedRiskAed.toLocaleString("en-AE")}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{entry.outcomeR !== undefined ? `${entry.outcomeR}R` : "Open"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.realizedPnlPct !== undefined ? `${entry.realizedPnlPct}%` : "Awaiting exit"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {entry.behaviorTags.map((tag) => (
                          <Badge key={tag} variant={tag === "followed-plan" ? "success" : "warning"}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {entry.status === "OPEN" ? (
                        <Button
                          onClick={() => {
                            setSelectedExit(entry);
                            setExitForm((current) => ({
                              ...current,
                              exitPrice: entry.entryPrice,
                              closedAt: new Date().toISOString(),
                            }));
                          }}
                          type="button"
                          variant="secondary"
                        >
                          Close trade
                        </Button>
                      ) : (
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Open trade review</CardTitle>
            <CardDescription>Live ideas worth monitoring against discipline rules and current risk approval.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {snapshot.openTrades.map((trade) => (
            <div key={trade.ticker} className="rounded-[24px] border border-white/10 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{trade.ticker}</p>
                <Badge variant={trade.riskVerdict.decision === "APPROVE" ? "success" : "warning"}>
                  {trade.riskVerdict.decision}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{trade.executionPlan.entryZone}</p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Catalyst: {trade.catalyst}</p>
                <p>Invalidation: {trade.technicalSetup.invalidation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Modal
        description="Capture a new planned trade with setup, thesis, and risk context."
        onClose={() => setShowEntryModal(false)}
        open={showEntryModal}
        title="Log trade entry"
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateEntry}>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ticker</span>
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setEntryForm({ ...entryForm, ticker: event.target.value })} value={entryForm.ticker} />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Setup</span>
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setEntryForm({ ...entryForm, setupName: event.target.value })} value={entryForm.setupName} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Thesis</span>
            <textarea className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setEntryForm({ ...entryForm, thesis: event.target.value })} value={entryForm.thesis} />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Entry price</span>
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setEntryForm({ ...entryForm, entryPrice: Number(event.target.value) })} type="number" value={entryForm.entryPrice} />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Planned risk %</span>
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setEntryForm({ ...entryForm, plannedRiskPct: Number(event.target.value) })} step="0.1" type="number" value={entryForm.plannedRiskPct} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Setup tags</span>
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setEntryForm({ ...entryForm, setupTags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} value={entryForm.setupTags.join(", ")} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Entry reasons</span>
            <textarea className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setEntryForm({ ...entryForm, entryReasons: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} value={entryForm.entryReasons.join("\n")} />
          </label>
          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <Button onClick={() => setShowEntryModal(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Create entry"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        description="Capture the exit rationale and final review notes for the selected open trade."
        onClose={() => setSelectedExit(null)}
        open={Boolean(selectedExit)}
        title={selectedExit ? `Close ${selectedExit.ticker}` : "Close trade"}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCloseTrade}>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Exit price</span>
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setExitForm({ ...exitForm, exitPrice: Number(event.target.value) })} type="number" value={exitForm.exitPrice} />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Closed at</span>
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setExitForm({ ...exitForm, closedAt: event.target.value })} type="datetime-local" value={exitForm.closedAt.slice(0, 16)} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Exit reasons</span>
            <textarea className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setExitForm({ ...exitForm, exitReasons: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} value={exitForm.exitReasons.join("\n")} />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Review notes</span>
            <textarea className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" onChange={(event) => setExitForm({ ...exitForm, reviewNotes: event.target.value })} value={exitForm.reviewNotes} />
          </label>
          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <Button onClick={() => setSelectedExit(null)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Closing..." : "Close trade"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
