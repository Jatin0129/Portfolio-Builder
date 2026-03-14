"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ClipboardList, Plus, Sparkles, Target } from "lucide-react";

import { DisciplineChart } from "@/components/charts/discipline-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPanel } from "@/components/ui/chart-panel";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Field, FieldGroup, fieldControlClassName } from "@/components/ui/field";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { PanelList } from "@/components/ui/panel-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { SegmentedFilter } from "@/components/ui/segmented-filter";
import type { JournalEntry, JournalEntryInput, JournalExitInput, ReviewSnapshot } from "@/types";

function statusVariant(status: JournalEntry["status"]) {
  if (status === "OPEN") return "warning";
  if (status === "CLOSED") return "success";
  return "neutral";
}

function BehaviorPanel({
  title,
  count,
  variant,
  items,
}: {
  title: string;
  count: number;
  variant: "warning" | "info" | "danger" | "neutral";
  items: Array<{ id?: string; label: string }>;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{title}</p>
        <Badge variant={variant}>{count}</Badge>
      </div>
      <PanelList
        className="mt-3"
        emptyState="No issues flagged in the current review window."
        items={items}
        renderItem={(item, index) => (
          <p key={item.id ?? `${title}-${index}`} className="text-sm text-muted-foreground">
            {item.label}
          </p>
        )}
      />
    </div>
  );
}

function JournalEntryForm({
  entryForm,
  setEntryForm,
  onCancel,
  onSubmit,
  isPending,
}: {
  entryForm: JournalEntryInput;
  setEntryForm: Dispatch<SetStateAction<JournalEntryInput>>;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FieldGroup>
        <Field label="Ticker">
          <input
            className={fieldControlClassName}
            onChange={(event) => setEntryForm((current) => ({ ...current, ticker: event.target.value }))}
            value={entryForm.ticker}
          />
        </Field>
        <Field label="Setup">
          <input
            className={fieldControlClassName}
            onChange={(event) => setEntryForm((current) => ({ ...current, setupName: event.target.value }))}
            value={entryForm.setupName}
          />
        </Field>
        <Field className="md:col-span-2" label="Thesis">
          <textarea
            className={`${fieldControlClassName} min-h-[110px]`}
            onChange={(event) => setEntryForm((current) => ({ ...current, thesis: event.target.value }))}
            value={entryForm.thesis}
          />
        </Field>
        <Field label="Entry price">
          <input
            className={fieldControlClassName}
            onChange={(event) => setEntryForm((current) => ({ ...current, entryPrice: Number(event.target.value) }))}
            type="number"
            value={entryForm.entryPrice}
          />
        </Field>
        <Field label="Planned risk %">
          <input
            className={fieldControlClassName}
            onChange={(event) => setEntryForm((current) => ({ ...current, plannedRiskPct: Number(event.target.value) }))}
            step="0.1"
            type="number"
            value={entryForm.plannedRiskPct}
          />
        </Field>
        <Field className="md:col-span-2" label="Setup tags">
          <input
            className={fieldControlClassName}
            onChange={(event) =>
              setEntryForm((current) => ({
                ...current,
                setupTags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
              }))
            }
            value={entryForm.setupTags.join(", ")}
          />
        </Field>
        <Field className="md:col-span-2" label="Entry reasons">
          <textarea
            className={`${fieldControlClassName} min-h-[100px]`}
            onChange={(event) =>
              setEntryForm((current) => ({
                ...current,
                entryReasons: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
              }))
            }
            value={entryForm.entryReasons.join("\n")}
          />
        </Field>
      </FieldGroup>
      <div className="flex items-center justify-end gap-3">
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? "Saving..." : "Create entry"}
        </Button>
      </div>
    </form>
  );
}

function JournalExitForm({
  exitForm,
  setExitForm,
  onCancel,
  onSubmit,
  isPending,
}: {
  exitForm: Omit<JournalExitInput, "id">;
  setExitForm: Dispatch<SetStateAction<Omit<JournalExitInput, "id">>>;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FieldGroup>
        <Field label="Exit price">
          <input
            className={fieldControlClassName}
            onChange={(event) => setExitForm((current) => ({ ...current, exitPrice: Number(event.target.value) }))}
            type="number"
            value={exitForm.exitPrice}
          />
        </Field>
        <Field label="Closed at">
          <input
            className={fieldControlClassName}
            onChange={(event) => setExitForm((current) => ({ ...current, closedAt: event.target.value }))}
            type="datetime-local"
            value={exitForm.closedAt.slice(0, 16)}
          />
        </Field>
        <Field className="md:col-span-2" label="Exit reasons">
          <textarea
            className={`${fieldControlClassName} min-h-[100px]`}
            onChange={(event) =>
              setExitForm((current) => ({
                ...current,
                exitReasons: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
              }))
            }
            value={exitForm.exitReasons.join("\n")}
          />
        </Field>
        <Field className="md:col-span-2" label="Review notes">
          <textarea
            className={`${fieldControlClassName} min-h-[110px]`}
            onChange={(event) => setExitForm((current) => ({ ...current, reviewNotes: event.target.value }))}
            value={exitForm.reviewNotes}
          />
        </Field>
      </FieldGroup>
      <div className="flex items-center justify-end gap-3">
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? "Closing..." : "Close trade"}
        </Button>
      </div>
    </form>
  );
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

  const tradeLogColumns: DataTableColumn<JournalEntry>[] = [
    {
      key: "trade",
      header: "Trade",
      render: (entry) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{entry.ticker}</p>
            <Badge variant={statusVariant(entry.status)}>{entry.status}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{entry.openedAt.slice(0, 10)}</p>
        </div>
      ),
    },
    {
      key: "setup",
      header: "Setup",
      render: (entry) => (
        <div>
          <p className="font-medium">{entry.setupName}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {entry.setupTags.map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "risk",
      header: "Risk",
      render: (entry) => (
        <p className="text-muted-foreground">
          {entry.plannedRiskPct}% / AED {entry.plannedRiskAed.toLocaleString("en-AE")}
        </p>
      ),
    },
    {
      key: "outcome",
      header: "Outcome",
      render: (entry) => (
        <div>
          <p className="font-medium">{entry.outcomeR !== undefined ? `${entry.outcomeR}R` : "Open"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {entry.realizedPnlPct !== undefined ? `${entry.realizedPnlPct}%` : "Awaiting exit"}
          </p>
        </div>
      ),
    },
    {
      key: "behavior",
      header: "Behavior",
      render: (entry) => (
        <div className="flex flex-wrap gap-2">
          {entry.behaviorTags.map((tag) => (
            <Badge key={tag} variant={tag === "followed-plan" ? "success" : "warning"}>
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (entry) =>
        entry.status === "OPEN" ? (
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
        ),
    },
  ];

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
        <MetricCard
          hint="Closed trade quality"
          icon={<Target className="h-4 w-4 text-primary" />}
          label="Win rate"
          value={`${snapshot.analytics.winRate}%`}
        />
        <MetricCard
          hint="Winning trades"
          icon={<Sparkles className="h-4 w-4 text-cyan-300" />}
          label="Avg gain"
          value={`${snapshot.analytics.averageGain}%`}
        />
        <MetricCard
          hint="Losing trades"
          icon={<AlertTriangle className="h-4 w-4 text-rose-300" />}
          label="Avg loss"
          value={`${snapshot.analytics.averageLoss}%`}
        />
        <MetricCard
          hint="Expected edge per trade"
          icon={<ClipboardList className="h-4 w-4 text-amber-300" />}
          label="Expectancy"
          value={`${snapshot.analytics.expectancy}R`}
        />
        <MetricCard
          hint="Needs active management"
          icon={<Sparkles className="h-4 w-4 text-emerald-300" />}
          label="Open trades"
          value={openEntries.length}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Journal analytics</CardTitle>
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
            <div className="mt-5">
              <ChartPanel
                description="Average discipline score by month across closed trades."
                title="Discipline curve"
              >
                <DisciplineChart data={snapshot.analytics.curve} />
              </ChartPanel>
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
            <BehaviorPanel
              count={snapshot.behavior.oversizedTrades.length}
              items={snapshot.behavior.oversizedTrades.slice(0, 3).map((item) => ({
                id: item.id,
                label: `${item.ticker}: ${item.detail}`,
              }))}
              title="Oversized trades"
              variant="warning"
            />
            <BehaviorPanel
              count={snapshot.behavior.earlyExits.length}
              items={snapshot.behavior.earlyExits.slice(0, 3).map((item) => ({
                id: item.id,
                label: `${item.ticker}: ${item.detail}`,
              }))}
              title="Early exits"
              variant="info"
            />
            <BehaviorPanel
              count={snapshot.behavior.missedStops.length}
              items={snapshot.behavior.missedStops.slice(0, 3).map((item) => ({
                id: item.id,
                label: `${item.ticker}: ${item.detail}`,
              }))}
              title="Missed stops"
              variant="danger"
            />
            <BehaviorPanel
              count={snapshot.behavior.overtradingPatterns.length}
              items={snapshot.behavior.overtradingPatterns.map((item) => ({
                label: `${item.date}: ${item.note}`,
              }))}
              title="Overtrading patterns"
              variant="neutral"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Trade log</CardTitle>
            <CardDescription>Filter the journal, review setup tags, and close open positions from the same table surface.</CardDescription>
          </div>
          <SegmentedFilter
            onChange={setStatusFilter}
            options={[
              { label: "ALL", value: "ALL" },
              { label: "OPEN", value: "OPEN" },
              { label: "CLOSED", value: "CLOSED" },
            ]}
            value={statusFilter}
          />
        </CardHeader>
        <CardContent className="overflow-hidden">
          <DataTable columns={tradeLogColumns} getRowKey={(entry) => entry.id} rows={filteredEntries} />
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
        <JournalEntryForm
          entryForm={entryForm}
          isPending={isPending}
          onCancel={() => setShowEntryModal(false)}
          onSubmit={handleCreateEntry}
          setEntryForm={setEntryForm}
        />
      </Modal>

      <Modal
        description="Capture the exit rationale and final review notes for the selected open trade."
        onClose={() => setSelectedExit(null)}
        open={Boolean(selectedExit)}
        title={selectedExit ? `Close ${selectedExit.ticker}` : "Close trade"}
      >
        <JournalExitForm
          exitForm={exitForm}
          isPending={isPending}
          onCancel={() => setSelectedExit(null)}
          onSubmit={handleCloseTrade}
          setExitForm={setExitForm}
        />
      </Modal>
    </div>
  );
}
