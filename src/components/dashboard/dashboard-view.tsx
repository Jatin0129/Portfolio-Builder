"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  Siren,
  Target,
  TrendingUp,
} from "lucide-react";

import { MarketPulseChart } from "@/components/charts/market-pulse-chart";
import { TradeInsightDrawer } from "@/components/trade-insight/trade-insight-drawer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatCurrency } from "@/lib/utils";
import type { DashboardSnapshot, TradeIdea } from "@/types";

function riskVariant(decision: TradeIdea["riskVerdict"]["decision"]) {
  if (decision === "APPROVE") return "success";
  if (decision === "REDUCE") return "warning";
  return "danger";
}

export function DashboardView({ snapshot }: { snapshot: DashboardSnapshot }) {
  const [selected, setSelected] = useState<TradeIdea | null>(null);
  const [ideaFilter, setIdeaFilter] = useState<"ALL" | "APPROVE" | "REDUCE" | "DEFENSIVE">("ALL");
  const portfolio = snapshot.portfolioSummary;
  const filteredIdeas = snapshot.topTradeIdeas.filter((trade) => {
    if (ideaFilter === "ALL") return true;
    if (ideaFilter === "DEFENSIVE") return trade.allocationBucket === "hedge";
    return trade.riskVerdict.decision === ideaFilter;
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Dashboard"
        title="CycleOS command center"
        description="Translate macro regime, factor leadership, technical confirmation, and portfolio constraints into explainable swing-trade ideas."
        action={<Badge variant="info">{snapshot.currentRegime.name}</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          hint={`${snapshot.currentRegime.posture} posture`}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          label="Regime confidence"
          value={`${snapshot.currentRegime.confidence}%`}
        />
        <MetricCard
          hint={`${snapshot.marketSummary.breadthPct}% breadth`}
          icon={<BriefcaseBusiness className="h-4 w-4 text-cyan-300" />}
          label="Portfolio value"
          value={formatCurrency(portfolio.portfolioValueAed)}
        />
        <MetricCard
          hint={`${portfolio.openRiskPct}% of portfolio`}
          icon={<Target className="h-4 w-4 text-amber-300" />}
          label="Open risk"
          value={formatCurrency(portfolio.openRiskAed)}
        />
        <MetricCard
          hint="Requires review before new risk"
          icon={<BellRing className="h-4 w-4 text-rose-300" />}
          label="Active alerts"
          value={snapshot.alerts.length}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Current regime</CardTitle>
              <CardDescription>{snapshot.currentRegime.explanation}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={snapshot.currentRegime.stance === "Risk-On" ? "success" : "warning"}>
                {snapshot.currentRegime.stance}
              </Badge>
              <Badge variant="neutral">{snapshot.currentRegime.posture}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Confidence</p>
                  <p className="mt-2 text-3xl font-semibold">{snapshot.currentRegime.confidence}%</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Breadth</p>
                  <p className="mt-2 text-3xl font-semibold">{snapshot.marketSummary.breadthPct}%</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">VIX</p>
                  <p className="mt-2 text-3xl font-semibold">{snapshot.marketSummary.vix}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {snapshot.currentRegime.drivers.map((driver) => (
                  <div
                    key={driver}
                    className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-muted-foreground"
                  >
                    {driver}
                  </div>
                ))}
              </div>
            </div>
            <MarketPulseChart />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Macro and geopolitical overlay</CardTitle>
                <CardDescription>Compact summary of what is shaping tactical risk right now.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={snapshot.macroSummary.tone === "cautious" ? "warning" : "info"}>
                  {snapshot.macroSummary.tone}
                </Badge>
                <Badge
                  variant={
                    snapshot.geopoliticalBoard.summary.overlaySeverity === "Critical"
                      ? "danger"
                      : snapshot.geopoliticalBoard.summary.overlaySeverity === "High"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {snapshot.geopoliticalBoard.summary.overlaySeverity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-medium">{snapshot.macroSummary.headline}</p>
                <p className="mt-2 text-sm text-muted-foreground">{snapshot.macroSummary.explanation}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {snapshot.macroSummary.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl border border-white/8 bg-[#08111c] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Macro signal</p>
                    <p className="mt-2 text-sm font-medium">{bullet}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-medium">{snapshot.geopoliticalBoard.summary.headline}</p>
                <p className="mt-2 text-sm text-muted-foreground">{snapshot.geopoliticalBoard.summary.posture}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {snapshot.geopoliticalBoard.summary.dominantChannels.map((channel) => (
                    <Badge key={channel} variant="neutral">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Portfolio snapshot</CardTitle>
                <CardDescription>AED reporting with open-risk awareness.</CardDescription>
              </div>
              <Badge variant="neutral">{portfolio.topExposure}</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-sm text-muted-foreground">Portfolio value</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(portfolio.portfolioValueAed)}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-sm text-muted-foreground">Open risk</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(portfolio.openRiskAed)}</p>
                  <p className="text-xs text-muted-foreground">{portfolio.openRiskPct}% of portfolio</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-sm text-muted-foreground">Cash</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(portfolio.cashAed)}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-sm text-muted-foreground">Daily PnL</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(portfolio.dailyPnlAed)}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Allocation mix</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Snapshot</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {portfolio.allocationMix.map((item) => (
                    <div key={item.name} className="rounded-2xl border border-white/8 bg-[#08111c] p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.name}</p>
                      <p className="mt-2 text-xl font-semibold">{item.value}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top trade ideas</CardTitle>
              <CardDescription>Ranked by opportunity score and filtered through portfolio rules.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "APPROVE", "REDUCE", "DEFENSIVE"] as const).map((filter) => (
                <button
                  key={filter}
                  className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
                    ideaFilter === filter
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-white/10 bg-white/5 text-muted-foreground"
                  }`}
                  onClick={() => setIdeaFilter(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredIdeas.map((trade) => (
              <button
                key={trade.ticker}
                className="w-full rounded-[24px] border border-white/10 bg-white/4 p-5 text-left transition hover:border-primary/35 hover:bg-white/6"
                onClick={() => setSelected(trade)}
                type="button"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-semibold">{trade.ticker}</p>
                      <Badge variant={riskVariant(trade.riskVerdict.decision)}>{trade.riskVerdict.decision}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{trade.name}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="neutral">{trade.sector}</Badge>
                      <Badge variant="neutral">{trade.region}</Badge>
                      <Badge variant="info">{trade.allocationBucket}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 rounded-[20px] border border-white/10 bg-[#0d1624] px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Score</p>
                      <p className="mt-2 text-2xl font-semibold">{trade.opportunityScore}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Action</p>
                      <p className="mt-2 text-2xl font-semibold">{trade.direction}</p>
                    </div>
                    <div className="flex items-center gap-2 self-center text-sm text-primary">
                      Open insight <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>What needs attention before new risk is added.</CardDescription>
              </div>
              <Siren className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              {snapshot.alerts.map((alert) => (
                <div key={alert.id} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                  <p className="font-medium">{alert.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{alert.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Top risks</CardTitle>
                <CardDescription>Macro and portfolio hazards currently on deck.</CardDescription>
              </div>
              <AlertTriangle className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              {snapshot.topRisks.map((risk) => (
                <div key={risk.id} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{risk.title}</p>
                    <Badge
                      variant={
                        risk.severity === "Critical"
                          ? "danger"
                          : risk.severity === "High"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{risk.explanation}</p>
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
