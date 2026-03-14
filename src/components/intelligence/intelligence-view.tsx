"use client";

import { useState } from "react";
import { CandlestickChart, Globe2, Landmark, ScanSearch } from "lucide-react";

import { TradeInsightDrawer } from "@/components/trade-insight/trade-insight-drawer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Progress } from "@/components/ui/progress";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatPercent } from "@/lib/utils";
import type { IntelligenceSnapshot, TradeIdea } from "@/types";

function severityVariant(severity: string) {
  if (severity === "Critical") return "danger";
  if (severity === "High") return "warning";
  if (severity === "Moderate") return "info";
  return "neutral";
}

export function IntelligenceView({ snapshot }: { snapshot: IntelligenceSnapshot }) {
  const [selected, setSelected] = useState<TradeIdea | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Intelligence"
        title="Macro, geopolitics, and catalyst intelligence"
        description="One page for the event map, regime explanation, sector rotation, and the ranked scanner that feeds CycleOS ideas."
        action={<Badge variant="info">{snapshot.regime.name}</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          hint={`${snapshot.regime.confidence}% confidence`}
          label="Regime posture"
          value={snapshot.regime.posture}
        />
        <MetricCard label="Macro events" value={snapshot.macroEvents.length} hint="Upcoming calendar items" />
        <MetricCard
          label="Geo watchpoints"
          value={snapshot.geopoliticalEvents.length}
          hint="Severity-scored overlays"
        />
        <MetricCard label="Tracked catalysts" value={snapshot.catalysts.length} hint="Potential repricing windows" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Macro calendar</CardTitle>
              <CardDescription>{snapshot.macroCalendar.headline}</CardDescription>
            </div>
            <Landmark className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-primary/15 bg-primary/8 p-4">
              <p className="text-sm font-medium">{snapshot.macroSummary.headline}</p>
              <p className="mt-2 text-sm text-muted-foreground">{snapshot.macroSummary.explanation}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {snapshot.macroState.summarySignals.map((signal) => (
                  <div key={signal} className="rounded-2xl border border-white/8 bg-[#08111c] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Signal</p>
                    <p className="mt-2 text-sm font-medium">{signal}</p>
                  </div>
                ))}
              </div>
            </div>
            {snapshot.macroCalendar.items.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{event.title}</p>
                      <Badge variant={severityVariant(event.severity)}>{event.severity}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.region} | {event.date} | {event.category}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Consensus: {event.consensus}</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{event.watchFor}</p>
                <p className="mt-2 text-sm text-muted-foreground">{event.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Geopolitical board</CardTitle>
              <CardDescription>{snapshot.geopoliticalBoard.summary.headline}</CardDescription>
            </div>
            <Globe2 className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-primary/15 bg-primary/8 p-4">
              <p className="text-sm text-muted-foreground">Overlay posture</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{snapshot.geopoliticalBoard.summary.posture}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {snapshot.geopoliticalBoard.summary.dominantChannels.map((channel) => (
                  <Badge key={channel} variant="neutral">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
            {snapshot.geopoliticalEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {event.category}
                    </p>
                  </div>
                  <Badge variant={severityVariant(event.severity)}>{event.severity}</Badge>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{event.status}</p>
                <p className="mt-2 text-sm text-muted-foreground">{event.implication}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.chips.map((chip) => (
                    <Badge key={chip} variant="neutral">
                      {chip}
                    </Badge>
                  ))}
                  <Badge variant="info">{event.actionSuggestion}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sector and cross-asset market snapshot</CardTitle>
              <CardDescription>Cycle fit, sector rotation, and cross-asset leadership at a glance.</CardDescription>
            </div>
            <CandlestickChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top sector</p>
                <p className="mt-2 text-xl font-semibold">{snapshot.sectorHeatmap[0]?.sector}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatPercent(snapshot.sectorHeatmap[0]?.performance1M ?? 0)} over 1 month
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Weakest sector</p>
                <p className="mt-2 text-xl font-semibold">
                  {snapshot.sectorHeatmap[snapshot.sectorHeatmap.length - 1]?.sector}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatPercent(snapshot.sectorHeatmap[snapshot.sectorHeatmap.length - 1]?.performance1M ?? 0)} over 1 month
                </p>
              </div>
            </div>
            {snapshot.sectorHeatmap.map((sector) => (
              <div key={sector.sector} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{sector.sector}</p>
                  <p className="text-sm text-muted-foreground">{sector.regimeFit}/100 fit</p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">1 week</p>
                    <p className="mt-1 text-lg font-semibold">{formatPercent(sector.performance1W)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">1 month</p>
                    <p className="mt-1 text-lg font-semibold">{formatPercent(sector.performance1M)}</p>
                  </div>
                </div>
                <Progress className="mt-4" value={sector.regimeFit} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Ranked asset scanner</CardTitle>
                <CardDescription>Top opportunity scores across the current universe.</CardDescription>
              </div>
              <ScanSearch className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {snapshot.rankedAssets.map((asset, index) => (
                <button
                  key={asset.ticker}
                  className="w-full rounded-2xl border border-white/8 bg-white/4 p-4 text-left transition hover:border-primary/40 hover:bg-white/6"
                  onClick={() => setSelected(asset)}
                  type="button"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-medium text-primary">#{index + 1}</p>
                        <p className="font-medium">{asset.ticker}</p>
                        <Badge variant={asset.riskVerdict.decision === "REJECT" ? "danger" : "success"}>
                          {asset.riskVerdict.decision}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{asset.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold">{asset.opportunityScore}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Opportunity</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Macro fit</p>
                      <p className="mt-1 font-medium">{asset.macroFit}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Relative strength</p>
                      <p className="mt-1 font-medium">{asset.relativeStrength}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Catalyst</p>
                      <p className="mt-1 font-medium">{asset.catalystStrength}</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Catalyst tracker</CardTitle>
                <CardDescription>Near-term events capable of repricing the ranking table.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {snapshot.catalysts.map((catalyst) => (
                <div key={catalyst.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{catalyst.asset}</p>
                      <p className="text-sm text-muted-foreground">{catalyst.title}</p>
                    </div>
                    <Badge variant={severityVariant(catalyst.severity)}>{catalyst.date}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{catalyst.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <TradeInsightDrawer onClose={() => setSelected(null)} open={Boolean(selected)} trade={selected} />
    </div>
  );
}
