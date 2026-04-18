"use client";

import { useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { BookOpenCheck, CirclePlus, Flag, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Field, FieldGroup, fieldControlClassName } from "@/components/ui/field";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SegmentedFilter } from "@/components/ui/segmented-filter";
import { formatCurrency } from "@/lib/utils";
import type { InvestmentAssetCategory, JournalEntry, MdbJournalSnapshot } from "@/types";

type EntryFormState = {
  ticker: string;
  assetName: string;
  assetCategory: InvestmentAssetCategory;
  investedAmountAed: number;
  currentValueAed: number;
  quantity: number;
  account: string;
  location: string;
  openedAt: string;
  entryReasons: string;
  setupTags: string;
  reviewNotes: string;
  plannedRiskPct: number;
  rulesFollowed: boolean;
};

type ExitFormState = {
  closedAt: string;
  exitValueAed: number;
  exitReasons: string;
  reviewNotes: string;
  rulesFollowed: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function splitValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function defaultEntryForm(maxRiskPerTradePct: number): EntryFormState {
  return {
    ticker: "",
    assetName: "",
    assetCategory: "Equity",
    investedAmountAed: 0,
    currentValueAed: 0,
    quantity: 1,
    account: "MDB Main Book",
    location: "",
    openedAt: new Date().toISOString().slice(0, 10),
    entryReasons: "",
    setupTags: "",
    reviewNotes: "",
    plannedRiskPct: maxRiskPerTradePct,
    rulesFollowed: true,
  };
}

function defaultExitForm(): ExitFormState {
  return {
    closedAt: new Date().toISOString().slice(0, 10),
    exitValueAed: 0,
    exitReasons: "",
    reviewNotes: "",
    rulesFollowed: true,
  };
}

export function JournalReviewView({ snapshot }: { snapshot: MdbJournalSnapshot }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<
    "ALL" | "Equity" | "Bonds" | "Real Estate" | "Others"
  >("ALL");
  const [entryForm, setEntryForm] = useState<EntryFormState>(
    defaultEntryForm(snapshot.settings.maxRiskPerTradePct),
  );
  const [exitForm, setExitForm] = useState<ExitFormState>(defaultExitForm());
  const [activeExitEntry, setActiveExitEntry] = useState<JournalEntry | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const filteredEntries = useMemo(
    () =>
      snapshot.entries.filter((entry) => {
        const matchesStatus = statusFilter === "ALL" || entry.status === statusFilter;
        const matchesCategory =
          categoryFilter === "ALL" || (entry.assetCategory ?? "Others") === categoryFilter;
        return matchesStatus && matchesCategory;
      }),
    [categoryFilter, snapshot.entries, statusFilter],
  );

  const columns: DataTableColumn<JournalEntry>[] = [
    {
      key: "asset",
      header: "Asset",
      render: (entry) => (
        <div>
          <p className="font-medium text-foreground">{entry.assetName ?? entry.ticker}</p>
          <p className="text-xs text-muted-foreground">{entry.ticker}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (entry) => <Badge variant="info">{entry.assetCategory ?? "Others"}</Badge>,
    },
    {
      key: "date",
      header: "Opened",
      render: (entry) => formatDate(entry.openedAt),
    },
    {
      key: "invested",
      header: "Invested",
      render: (entry) =>
        formatCurrency(
          entry.investedAmountAed ?? entry.entryPrice * (entry.quantity ?? 1),
          snapshot.settings.reportingCurrency,
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (entry) => (
        <Badge variant={entry.status === "OPEN" ? "success" : "neutral"}>{entry.status}</Badge>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      render: (entry) => (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{entry.thesis}</p>
          <div className="flex flex-wrap gap-2">
            {entry.setupTags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))}
          </div>
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
              setActiveExitEntry(entry);
              setExitForm({
                ...defaultExitForm(),
                exitValueAed:
                  entry.currentValueAed ?? entry.investedAmountAed ?? entry.entryPrice * (entry.quantity ?? 1),
              });
            }}
            type="button"
            variant="secondary"
          >
            Close
          </Button>
        ) : (
          <Badge variant="neutral">Closed</Badge>
        ),
    },
  ];

  function updateEntryField<TKey extends keyof EntryFormState>(key: TKey, value: EntryFormState[TKey]) {
    setEntryForm((current) => ({ ...current, [key]: value }));
  }

  function updateExitField<TKey extends keyof ExitFormState>(key: TKey, value: ExitFormState[TKey]) {
    setExitForm((current) => ({ ...current, [key]: value }));
  }

  function resetEntryForm() {
    setEntryForm(defaultEntryForm(snapshot.settings.maxRiskPerTradePct));
  }

  async function handleCreateEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const quantity = Math.max(entryForm.quantity || 1, 1);
        const investedAmountAed = entryForm.investedAmountAed;
        const currentValueAed = entryForm.currentValueAed || investedAmountAed;
        const entryReasons = splitValues(entryForm.entryReasons || "Portfolio allocation");
        const setupTags = splitValues(entryForm.setupTags || entryForm.assetCategory);
        const reviewNotes = entryForm.reviewNotes.trim() || "Recorded through the MDB journal flow.";
        const payload = {
          ticker: entryForm.ticker.trim().toUpperCase(),
          assetName: entryForm.assetName.trim(),
          assetCategory: entryForm.assetCategory,
          account: entryForm.account.trim() || undefined,
          quantity,
          investedAmountAed,
          currentValueAed,
          location: entryForm.location.trim() || undefined,
          setupName: `${entryForm.assetCategory} allocation`,
          setupTags,
          direction: "LONG" as const,
          openedAt: new Date(entryForm.openedAt).toISOString(),
          entryPrice: investedAmountAed / quantity,
          thesis: entryReasons[0] || reviewNotes,
          entryReasons,
          rulesFollowed: entryForm.rulesFollowed,
          plannedRiskPct: entryForm.plannedRiskPct,
          plannedRiskAed: Number(((investedAmountAed * entryForm.plannedRiskPct) / 100).toFixed(0)),
          disciplineScore: entryForm.rulesFollowed ? 8 : 6,
          holdingHorizon: snapshot.settings.preferredHoldingHorizon,
          reviewNotes,
        };

        const response = await fetch("/api/journal/entries", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Unable to save entry");
        }

        setFeedback("saved");
        setShowEntryModal(false);
        resetEntryForm();
        router.refresh();
      } catch {
        setFeedback("error");
      }
    });
  }

  async function handleCloseEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeExitEntry) return;

    startTransition(async () => {
      try {
        const quantity = activeExitEntry.quantity ?? 1;
        const exitReasons = splitValues(exitForm.exitReasons || "Portfolio exit");
        const response = await fetch(`/api/journal/entries/${activeExitEntry.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            closedAt: new Date(exitForm.closedAt).toISOString(),
            exitPrice: exitForm.exitValueAed / quantity,
            exitReasons,
            rulesFollowed: exitForm.rulesFollowed,
            reviewNotes: exitForm.reviewNotes.trim() || "Position closed through the MDB journal flow.",
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to close entry");
        }

        setFeedback("saved");
        setActiveExitEntry(null);
        setExitForm(defaultExitForm());
        router.refresh();
      } catch {
        setFeedback("error");
      }
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Journal"
        title="Record and review every investment"
        description="This is the simplest operating layer for MDB: log the entry, categorize it correctly, and keep a clean record of why capital was deployed or exited."
        action={
          <Button onClick={() => setShowEntryModal(true)} type="button">
            <CirclePlus className="mr-2 h-4 w-4" />
            Add entry
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          hint="Closed entries only"
          icon={<BookOpenCheck className="h-4 w-4 text-primary" />}
          label="Win rate"
          value={`${snapshot.analytics.winRate}%`}
        />
        <MetricCard
          hint="Average closed gain"
          icon={<Wallet className="h-4 w-4 text-emerald-300" />}
          label="Average gain"
          value={`${snapshot.analytics.averageGain}%`}
        />
        <MetricCard
          hint="Average closed loss"
          icon={<Flag className="h-4 w-4 text-rose-300" />}
          label="Average loss"
          value={`${snapshot.analytics.averageLoss}%`}
        />
        <MetricCard
          hint={feedback === "saved" ? "Latest change saved" : "Expectancy in R terms"}
          icon={<BookOpenCheck className="h-4 w-4 text-cyan-300" />}
          label="Expectancy"
          value={snapshot.analytics.expectancy}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Journal log</CardTitle>
              <CardDescription>All recorded entries and exits across Equity, Bonds, Real Estate, and Others.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <SegmentedFilter
                onChange={(value) => setStatusFilter(value as typeof statusFilter)}
                options={[
                  { label: "ALL", value: "ALL" },
                  { label: "OPEN", value: "OPEN" },
                  { label: "CLOSED", value: "CLOSED" },
                ]}
                value={statusFilter}
              />
              <SegmentedFilter
                onChange={(value) => setCategoryFilter(value as typeof categoryFilter)}
                options={[
                  { label: "ALL", value: "ALL" },
                  { label: "EQUITY", value: "Equity" },
                  { label: "BONDS", value: "Bonds" },
                  { label: "REAL ESTATE", value: "Real Estate" },
                  { label: "OTHERS", value: "Others" },
                ]}
                value={categoryFilter}
              />
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              emptyState="No journal entries match the current filter."
              getRowKey={(entry) => entry.id}
              rows={filteredEntries}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Category summary</CardTitle>
                <CardDescription>How active capital is currently distributed across the four buckets.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.categories.map((category) => (
                <div key={category.category} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{category.category}</p>
                    <Badge variant={category.weightPct >= 35 ? "warning" : "neutral"}>{category.weightPct}%</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {category.itemCount} active item{category.itemCount === 1 ? "" : "s"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatCurrency(category.currentValueAed, snapshot.settings.reportingCurrency)} current value
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Behavior review</CardTitle>
                <CardDescription>Small discipline signals that help MDB review process quality over time.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm font-medium">Oversized trades</p>
                <p className="mt-2 text-2xl font-semibold">{snapshot.behavior.oversizedTrades.length}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm font-medium">Early exits</p>
                <p className="mt-2 text-2xl font-semibold">{snapshot.behavior.earlyExits.length}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm font-medium">Missed stops</p>
                <p className="mt-2 text-2xl font-semibold">{snapshot.behavior.missedStops.length}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm font-medium">Best setup</p>
                <p className="mt-2 text-lg font-semibold">{snapshot.analytics.bestSetupType}</p>
                <p className="mt-2 text-sm text-muted-foreground">Worst setup: {snapshot.analytics.worstSetupType}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        description="Log a new position or investment so it appears in the portfolio and journal views immediately."
        onClose={() => setShowEntryModal(false)}
        open={showEntryModal}
        title="Add journal entry"
      >
        <form className="space-y-5" onSubmit={handleCreateEntry}>
          <FieldGroup>
            <Field label="Asset code">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateEntryField("ticker", event.target.value)}
                placeholder="MSFT or DXB-RE1"
                value={entryForm.ticker}
              />
            </Field>
            <Field label="Asset name">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateEntryField("assetName", event.target.value)}
                placeholder="Microsoft or Dubai Hills Apartment"
                value={entryForm.assetName}
              />
            </Field>
            <Field label="Category">
              <select
                className={fieldControlClassName}
                onChange={(event) =>
                  updateEntryField("assetCategory", event.target.value as InvestmentAssetCategory)
                }
                value={entryForm.assetCategory}
              >
                <option value="Equity">Equity</option>
                <option value="Bonds">Bonds</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Others">Others</option>
              </select>
            </Field>
            <Field label="Opened on">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateEntryField("openedAt", event.target.value)}
                type="date"
                value={entryForm.openedAt}
              />
            </Field>
            <Field label="Invested amount (AED)">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateEntryField("investedAmountAed", Number(event.target.value))}
                type="number"
                value={entryForm.investedAmountAed || ""}
              />
            </Field>
            <Field label="Current value (AED)">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateEntryField("currentValueAed", Number(event.target.value))}
                type="number"
                value={entryForm.currentValueAed || ""}
              />
            </Field>
            <Field label="Quantity or units">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateEntryField("quantity", Number(event.target.value))}
                step="0.01"
                type="number"
                value={entryForm.quantity}
              />
            </Field>
            <Field label="Account or sleeve">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateEntryField("account", event.target.value)}
                value={entryForm.account}
              />
            </Field>
            <Field label="Location or note">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateEntryField("location", event.target.value)}
                placeholder="Useful for real estate or private assets"
                value={entryForm.location}
              />
            </Field>
            <Field label="Planned risk %">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateEntryField("plannedRiskPct", Number(event.target.value))}
                step="0.1"
                type="number"
                value={entryForm.plannedRiskPct}
              />
            </Field>
          </FieldGroup>

          <Field label="Reasons for entry">
            <textarea
              className={fieldControlClassName}
              onChange={(event) => updateEntryField("entryReasons", event.target.value)}
              placeholder="Comma-separated reasons"
              rows={3}
              value={entryForm.entryReasons}
            />
          </Field>

          <Field label="Tags">
            <input
              className={fieldControlClassName}
              onChange={(event) => updateEntryField("setupTags", event.target.value)}
              placeholder="income, diversification, long-term"
              value={entryForm.setupTags}
            />
          </Field>

          <Field label="Review notes">
            <textarea
              className={fieldControlClassName}
              onChange={(event) => updateEntryField("reviewNotes", event.target.value)}
              rows={3}
              value={entryForm.reviewNotes}
            />
          </Field>

          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              checked={entryForm.rulesFollowed}
              onChange={(event) => updateEntryField("rulesFollowed", event.target.checked)}
              type="checkbox"
            />
            Entry followed the intended process
          </label>

          <div className="flex justify-end gap-3">
            <Button onClick={() => setShowEntryModal(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save entry"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        description="Use this when an open investment is fully exited and should move into the closed history."
        onClose={() => setActiveExitEntry(null)}
        open={Boolean(activeExitEntry)}
        title={`Close ${activeExitEntry?.assetName ?? activeExitEntry?.ticker ?? "entry"}`}
      >
        <form className="space-y-5" onSubmit={handleCloseEntry}>
          <FieldGroup>
            <Field label="Exit date">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateExitField("closedAt", event.target.value)}
                type="date"
                value={exitForm.closedAt}
              />
            </Field>
            <Field label="Exit value (AED)">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateExitField("exitValueAed", Number(event.target.value))}
                type="number"
                value={exitForm.exitValueAed || ""}
              />
            </Field>
          </FieldGroup>

          <Field label="Reasons for exit">
            <textarea
              className={fieldControlClassName}
              onChange={(event) => updateExitField("exitReasons", event.target.value)}
              placeholder="Comma-separated reasons"
              rows={3}
              value={exitForm.exitReasons}
            />
          </Field>

          <Field label="Review notes">
            <textarea
              className={fieldControlClassName}
              onChange={(event) => updateExitField("reviewNotes", event.target.value)}
              rows={3}
              value={exitForm.reviewNotes}
            />
          </Field>

          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              checked={exitForm.rulesFollowed}
              onChange={(event) => updateExitField("rulesFollowed", event.target.checked)}
              type="checkbox"
            />
            Exit followed the original plan
          </label>

          <div className="flex justify-end gap-3">
            <Button onClick={() => setActiveExitEntry(null)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Closing..." : "Close entry"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
