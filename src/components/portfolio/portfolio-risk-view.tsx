"use client";

import { useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { Building2, Landmark, Layers3, Pencil, Plus, Trash2, Wallet } from "lucide-react";

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
import type { Holding, HoldingInput, MdbInvestmentItem, MdbInvestmentsSnapshot } from "@/types";

type InvestmentFormState = {
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  region: string;
  currency: string;
  themes: string;
  allocationBucket: Holding["allocationBucket"];
  quantity: number;
  investedAmountAed: number;
  currentValueAed: number;
  beta: number;
  correlationTag: string;
  stopDistancePct: number;
};

function pnlVariant(value: number) {
  return value >= 0 ? "success" : "danger";
}

function defaultForm(): InvestmentFormState {
  return {
    ticker: "",
    name: "",
    assetClass: "Equity",
    sector: "",
    region: "United Arab Emirates",
    currency: "AED",
    themes: "",
    allocationBucket: "core",
    quantity: 1,
    investedAmountAed: 0,
    currentValueAed: 0,
    beta: 0.4,
    correlationTag: "MDB Book",
    stopDistancePct: 3,
  };
}

function formFromInvestment(item: MdbInvestmentItem): InvestmentFormState {
  return {
    ticker: item.code,
    name: item.name,
    assetClass: item.vehicle,
    sector: item.sector ?? item.vehicle,
    region: item.region,
    currency: item.currency ?? "AED",
    themes: item.notes.join(", "),
    allocationBucket: item.allocationBucket ?? "core",
    quantity: item.quantity ?? 1,
    investedAmountAed: item.investedAed,
    currentValueAed: item.currentValueAed,
    beta: item.beta ?? 0.4,
    correlationTag: item.correlationTag ?? "MDB Book",
    stopDistancePct: item.stopDistancePct ?? 3,
  };
}

function toHoldingInput(form: InvestmentFormState): HoldingInput {
  return {
    ticker: form.ticker.trim().toUpperCase(),
    name: form.name.trim(),
    assetClass: form.assetClass.trim(),
    sector: form.sector.trim() || form.assetClass.trim(),
    region: form.region.trim(),
    currency: form.currency.trim().toUpperCase(),
    themes: form.themes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    allocationBucket: form.allocationBucket,
    quantity: Number(form.quantity),
    investedAmountAed: Number(form.investedAmountAed),
    currentValueAed: Number(form.currentValueAed),
    beta: Number(form.beta),
    correlationTag: form.correlationTag.trim(),
    stopDistancePct: Number(form.stopDistancePct),
  };
}

export function PortfolioRiskView({ snapshot }: { snapshot: MdbInvestmentsSnapshot }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "Equity" | "Bonds" | "Real Estate" | "Others">("ALL");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<MdbInvestmentItem | null>(null);
  const [formState, setFormState] = useState<InvestmentFormState>(defaultForm());

  const investments = useMemo(
    () =>
      filter === "ALL"
        ? snapshot.investments
        : snapshot.investments.filter((item) => item.category === filter),
    [filter, snapshot.investments],
  );

  const totalCurrent = investments.reduce((sum, item) => sum + item.currentValueAed, 0);
  const totalInvested = investments.reduce((sum, item) => sum + item.investedAed, 0);
  const totalPnl = totalCurrent - totalInvested;

  function openCreateModal() {
    setModalMode("create");
    setEditingInvestment(null);
    setFormState(defaultForm());
    setIsModalOpen(true);
  }

  function openEditModal(item: MdbInvestmentItem) {
    setModalMode("edit");
    setEditingInvestment(item);
    setFormState(formFromInvestment(item));
    setIsModalOpen(true);
  }

  function updateField<TKey extends keyof InvestmentFormState>(
    key: TKey,
    value: InvestmentFormState[TKey],
  ) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const payload = toHoldingInput(formState);
        const method = modalMode === "edit" && editingInvestment ? "PUT" : "POST";
        const url =
          modalMode === "edit" && editingInvestment
            ? `/api/portfolio/holdings/${editingInvestment.id}`
            : "/api/portfolio/holdings";

        const response = await fetch(url, {
          method,
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Unable to save investment");
        }

        setStatus("saved");
        setIsModalOpen(false);
        setFormState(defaultForm());
        router.refresh();
      } catch {
        setStatus("error");
      }
    });
  }

  function handleDelete(item: MdbInvestmentItem) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/portfolio/holdings/${item.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Unable to delete investment");
        }

        setStatus("saved");
        router.refresh();
      } catch {
        setStatus("error");
      }
    });
  }

  const columns: DataTableColumn<MdbInvestmentItem>[] = [
    {
      key: "asset",
      header: "Asset",
      render: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.code}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => <Badge variant="info">{item.category}</Badge>,
    },
    {
      key: "vehicle",
      header: "Vehicle",
      render: (item) => item.vehicle,
    },
    {
      key: "invested",
      header: "Invested",
      render: (item) => formatCurrency(item.investedAed, snapshot.settings.reportingCurrency),
    },
    {
      key: "current",
      header: "Current value",
      render: (item) => formatCurrency(item.currentValueAed, snapshot.settings.reportingCurrency),
    },
    {
      key: "pnl",
      header: "P&L",
      render: (item) => (
        <div className="space-y-1">
          <Badge variant={pnlVariant(item.pnlAed)}>
            {formatCurrency(item.pnlAed, snapshot.settings.reportingCurrency)}
          </Badge>
          <p className="text-xs text-muted-foreground">{item.pnlPct}%</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        item.source === "portfolio" ? (
          <div className="flex gap-2">
            <Button onClick={() => openEditModal(item)} type="button" variant="secondary">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button onClick={() => handleDelete(item)} type="button" variant="ghost">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Badge variant="neutral">Journal-owned</Badge>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Investments"
        title="Current book by asset class"
        description="A clean working table for the live book, grouped under the four portfolio buckets that matter for MDB."
        action={
          <div className="flex items-center gap-3">
            {status === "saved" ? <Badge variant="success">Saved</Badge> : null}
            {status === "error" ? <Badge variant="danger">Action failed</Badge> : null}
            <Button onClick={openCreateModal} type="button">
              <Plus className="mr-2 h-4 w-4" />
              Add investment
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          hint="Across all active items"
          icon={<Wallet className="h-4 w-4 text-primary" />}
          label="Current value"
          value={formatCurrency(totalCurrent, snapshot.settings.reportingCurrency)}
        />
        <MetricCard
          hint="Capital deployed in this filter"
          icon={<Layers3 className="h-4 w-4 text-cyan-300" />}
          label="Invested amount"
          value={formatCurrency(totalInvested, snapshot.settings.reportingCurrency)}
        />
        <MetricCard
          hint="Mark-to-market"
          icon={<Landmark className="h-4 w-4 text-emerald-300" />}
          label="Open P&L"
          value={formatCurrency(totalPnl, snapshot.settings.reportingCurrency)}
        />
        <MetricCard
          hint="Book construction"
          icon={<Building2 className="h-4 w-4 text-amber-300" />}
          label="Tracked categories"
          value={snapshot.categories.filter((item) => item.itemCount > 0).length}
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Investment table</CardTitle>
            <CardDescription>Use the filters to move between Equity, Bonds, Real Estate, and Others.</CardDescription>
          </div>
          <SegmentedFilter
            onChange={(value) => setFilter(value as typeof filter)}
            options={[
              { label: "ALL", value: "ALL" },
              { label: "EQUITY", value: "Equity" },
              { label: "BONDS", value: "Bonds" },
              { label: "REAL ESTATE", value: "Real Estate" },
              { label: "OTHERS", value: "Others" },
            ]}
            value={filter}
          />
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            emptyState="No investments found for this category yet."
            getRowKey={(item) => item.id}
            rows={investments}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-4">
        {snapshot.categories.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <div>
                <CardTitle>{category.category}</CardTitle>
                <CardDescription>{category.itemCount} tracked positions</CardDescription>
              </div>
              <Badge variant={category.weightPct >= 35 ? "warning" : "neutral"}>{category.weightPct}%</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Invested</p>
                  <p className="mt-1 text-xl font-semibold">
                    {formatCurrency(category.investedAed, snapshot.settings.reportingCurrency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current value</p>
                  <p className="mt-1 text-xl font-semibold">
                    {formatCurrency(category.currentValueAed, snapshot.settings.reportingCurrency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">P&L</p>
                  <Badge variant={pnlVariant(category.pnlAed)}>
                    {formatCurrency(category.pnlAed, snapshot.settings.reportingCurrency)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        description="This writes through the internal portfolio API and persists to Postgres when DATABASE_URL is configured."
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        title={modalMode === "edit" ? "Edit investment" : "Add investment"}
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field label="Ticker or code">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateField("ticker", event.target.value)}
                value={formState.ticker}
              />
            </Field>
            <Field label="Asset name">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateField("name", event.target.value)}
                value={formState.name}
              />
            </Field>
            <Field label="Asset class">
              <select
                className={fieldControlClassName}
                onChange={(event) => updateField("assetClass", event.target.value)}
                value={formState.assetClass}
              >
                <option value="Equity">Equity</option>
                <option value="Bonds">Bonds</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Others">Others</option>
              </select>
            </Field>
            <Field label="Sector or sleeve">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateField("sector", event.target.value)}
                value={formState.sector}
              />
            </Field>
            <Field label="Region">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateField("region", event.target.value)}
                value={formState.region}
              />
            </Field>
            <Field label="Currency">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateField("currency", event.target.value)}
                value={formState.currency}
              />
            </Field>
            <Field label="Allocation bucket">
              <select
                className={fieldControlClassName}
                onChange={(event) =>
                  updateField("allocationBucket", event.target.value as Holding["allocationBucket"])
                }
                value={formState.allocationBucket}
              >
                <option value="core">Core</option>
                <option value="tactical">Tactical</option>
                <option value="hedge">Hedge</option>
              </select>
            </Field>
            <Field label="Quantity or units">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateField("quantity", Number(event.target.value))}
                step="0.01"
                type="number"
                value={formState.quantity}
              />
            </Field>
            <Field label="Invested amount (AED)">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateField("investedAmountAed", Number(event.target.value))}
                type="number"
                value={formState.investedAmountAed || ""}
              />
            </Field>
            <Field label="Current value (AED)">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateField("currentValueAed", Number(event.target.value))}
                type="number"
                value={formState.currentValueAed || ""}
              />
            </Field>
            <Field label="Beta">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateField("beta", Number(event.target.value))}
                step="0.1"
                type="number"
                value={formState.beta}
              />
            </Field>
            <Field label="Stop distance %">
              <input
                className={fieldControlClassName}
                onChange={(event) => updateField("stopDistancePct", Number(event.target.value))}
                step="0.1"
                type="number"
                value={formState.stopDistancePct}
              />
            </Field>
          </FieldGroup>

          <Field label="Themes">
            <input
              className={fieldControlClassName}
              onChange={(event) => updateField("themes", event.target.value)}
              placeholder="income, diversification, hard assets"
              value={formState.themes}
            />
          </Field>

          <Field label="Correlation tag">
            <input
              className={fieldControlClassName}
              onChange={(event) => updateField("correlationTag", event.target.value)}
              value={formState.correlationTag}
            />
          </Field>

          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : modalMode === "edit" ? "Save changes" : "Add investment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
