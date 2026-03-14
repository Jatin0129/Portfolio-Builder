"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, Wallet } from "lucide-react";

import { AllocationChart } from "@/components/charts/allocation-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPanel } from "@/components/ui/chart-panel";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { MetricCard } from "@/components/ui/metric-card";
import { PanelList } from "@/components/ui/panel-list";
import { Progress } from "@/components/ui/progress";
import { SectionHeading } from "@/components/ui/section-heading";
import { SegmentedFilter } from "@/components/ui/segmented-filter";
import { formatCurrency } from "@/lib/utils";
import type { Holding, PortfolioSnapshot } from "@/types";

function actionVariant(action: string) {
  if (action === "Trim") return "warning" as const;
  if (action === "Increase") return "success" as const;
  return "neutral" as const;
}

function statusVariant(status: string) {
  if (status === "Breach" || status === "overweight") return "danger" as const;
  if (status === "Watch" || status === "underweight") return "warning" as const;
  if (status === "neutral") return "neutral" as const;
  return "success" as const;
}

export function PortfolioRiskView({ snapshot }: { snapshot: PortfolioSnapshot }) {
  const { exposures, holdings, overUnderweights, risk, settings, suggestedAllocation, summary, watchlist } =
    snapshot;
  const [holdingFilter, setHoldingFilter] = useState<"ALL" | "core" | "tactical" | "hedge">("ALL");
  const filteredHoldings =
    holdingFilter === "ALL"
      ? holdings
      : holdings.filter((holding) => holding.allocationBucket === holdingFilter);
  const holdingColumns: DataTableColumn<Holding>[] = [
    {
      key: "asset",
      header: "Asset",
      render: (holding) => (
        <div>
          <p className="font-medium text-foreground">{holding.ticker}</p>
          <p className="text-xs text-muted-foreground">{holding.name}</p>
        </div>
      ),
    },
    {
      key: "bucket",
      header: "Bucket",
      render: (holding) => <Badge variant="neutral">{holding.allocationBucket}</Badge>,
    },
    {
      key: "value",
      header: "Value",
      render: (holding) => formatCurrency(holding.marketValueAed),
    },
    {
      key: "weight",
      header: "Weight",
      render: (holding) => `${holding.weightPct}%`,
    },
    {
      key: "pnl",
      header: "PnL",
      render: (holding) => formatCurrency(holding.unrealizedPnlAed),
    },
    {
      key: "open-risk",
      header: "Open risk",
      render: (holding) => formatCurrency(holding.openRiskAed),
    },
    {
      key: "themes",
      header: "Themes",
      render: (holding) => (
        <div className="flex flex-wrap gap-2">
          {holding.themes.map((theme) => (
            <Badge key={theme} variant="neutral">
              {theme}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Portfolio & Risk"
        title="Allocation discipline in AED"
        description="Holdings, watchlist, normalized exposures, and suggested allocation all sit on one decision surface."
        action={<Badge variant="warning">{risk.totalOpenRiskPct}% open risk</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          hint="Marked in AED"
          icon={<Wallet className="h-4 w-4 text-primary" />}
          label="Invested capital"
          value={formatCurrency(summary.investedAed)}
        />
        <MetricCard
          hint={`${risk.totalOpenRiskPct}% portfolio risk`}
          icon={<ShieldAlert className="h-4 w-4 text-amber-300" />}
          label="Open risk"
          value={formatCurrency(risk.totalOpenRiskAed)}
        />
        <MetricCard
          hint={summary.topExposure}
          icon={<AlertTriangle className="h-4 w-4 text-rose-300" />}
          label="Largest exposure"
          value={summary.topExposure.split(" at ")[0]}
        />
        <MetricCard label="Cash reserve" value={formatCurrency(summary.cashAed)} hint="Dry powder for new setups" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Allocation charts</CardTitle>
              <CardDescription>Current book structure plus the suggested allocation mix.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartPanel
              description="Current book structure plus the suggested allocation mix."
              title="Allocation mix"
            >
              <AllocationChart data={summary.allocationMix} />
            </ChartPanel>
            <div className="grid gap-3 sm:grid-cols-2">
              {suggestedAllocation.buckets.map((bucket) => (
                <div key={bucket.key} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{bucket.label}</p>
                    <Badge variant={bucket.deltaPct < 0 ? "warning" : bucket.deltaPct > 0 ? "success" : "neutral"}>
                      {bucket.deltaPct > 0 ? `+${bucket.deltaPct}%` : `${bucket.deltaPct}%`}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current</p>
                      <p className="mt-1 text-xl font-semibold">{bucket.currentPct}%</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Target</p>
                      <p className="mt-1 text-xl font-semibold">{bucket.targetPct}%</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{bucket.rationale}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Holdings table</CardTitle>
              <CardDescription>Current positions with AED value, normalized weight, and theme tagging.</CardDescription>
            </div>
            <SegmentedFilter
              onChange={setHoldingFilter}
              options={[
                { label: "ALL", value: "ALL" },
                { label: "CORE", value: "core" },
                { label: "TACTICAL", value: "tactical" },
                { label: "HEDGE", value: "hedge" },
              ]}
              value={holdingFilter}
            />
          </CardHeader>
          <CardContent className="overflow-hidden">
            <DataTable columns={holdingColumns} getRowKey={(holding) => holding.id} rows={filteredHoldings} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Exposure map</CardTitle>
              <CardDescription>Chart-ready exposure rows generated by the portfolio engine.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { title: "Sector exposure", items: exposures.sector },
              { title: "Theme exposure", items: exposures.theme },
              { title: "Asset-class exposure", items: exposures.assetClass },
              { title: "Region exposure", items: exposures.region },
            ].map((section) => (
              <div key={section.title}>
                <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {section.title}
                </p>
                <div className="grid gap-3">
                  {section.items.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.weightPct}% | {formatCurrency(item.valueAed)}
                        </p>
                      </div>
                      <Progress className="mt-3" value={item.weightPct} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Overweight and underweight map</CardTitle>
                <CardDescription>Current exposure versus the engine's working targets.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {overUnderweights.map((item) => (
                <div key={`${item.dimension}-${item.label}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.dimension}</p>
                    </div>
                    <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.currentPct}% current vs {item.targetPct}% target
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.rationale}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Watchlist</CardTitle>
                <CardDescription>Mock candidates with allocation intent and target entry zones.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <PanelList items={watchlist} renderItem={(item) => (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.ticker}</p>
                      <p className="text-sm text-muted-foreground">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.priority === "High" ? "warning" : item.priority === "Medium" ? "info" : "neutral"}>
                        {item.priority}
                      </Badge>
                      <Badge variant="neutral">{item.candidateBucket}</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.thesis}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Entry: {item.targetEntry} | Suggested size: {item.candidateAllocationPct}%
                  </p>
                </div>
              )} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Risk summary cards</CardTitle>
              <CardDescription>Configured portfolio limits and live open-risk contribution.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-sm text-muted-foreground">Max risk per trade</p>
              <p className="mt-2 text-2xl font-semibold">{settings.maxRiskPerTradePct}%</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-sm text-muted-foreground">Max portfolio open risk</p>
              <p className="mt-2 text-2xl font-semibold">{settings.maxPortfolioOpenRiskPct}%</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-sm text-muted-foreground">Max single position</p>
              <p className="mt-2 text-2xl font-semibold">{settings.maxSinglePositionPct}%</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-sm text-muted-foreground">Max sector exposure</p>
              <p className="mt-2 text-2xl font-semibold">{settings.maxSectorExposurePct}%</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Open risk view</CardTitle>
                <CardDescription>Live book risk and concentration pressure.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-primary/15 bg-primary/8 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Total open risk</p>
                  <Badge variant="warning">{risk.totalOpenRiskPct}% live risk</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Total open risk is {formatCurrency(risk.totalOpenRiskAed)} across current positions.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {holdings.map((holding) => (
                  <div key={holding.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{holding.ticker}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(holding.openRiskAed)}</p>
                    </div>
                    <Progress
                      className="mt-3"
                      indicatorClassName="bg-amber-400"
                      value={(holding.openRiskAed / risk.totalOpenRiskAed) * 100}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Concentration and correlation warning section</CardTitle>
                <CardDescription>Caps are enforced before new trades are approved.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {risk.concentrationChecks.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.label}</p>
                    <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.exposurePct}% exposure vs {item.thresholdPct}% threshold
                  </p>
                  <Progress
                    className="mt-3"
                    indicatorClassName={
                      item.status === "Breach"
                        ? "bg-rose-400"
                        : item.status === "Watch"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                    }
                    value={(item.exposurePct / item.thresholdPct) * 100}
                  />
                </div>
              ))}

              {risk.correlationClusters.map((cluster) => (
                <div key={cluster.tag} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{cluster.tag}</p>
                    <p className="text-sm text-muted-foreground">{cluster.exposurePct}% exposure</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{cluster.holdings.join(", ")}</p>
                </div>
              ))}

              {risk.suggestions.map((suggestion) => (
                <div key={suggestion.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{suggestion.label}</p>
                    <Badge variant={actionVariant(suggestion.action)}>{suggestion.action}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{suggestion.rationale}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
