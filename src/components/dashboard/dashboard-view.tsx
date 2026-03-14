"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Target,
  TrendingUp,
} from "lucide-react";

import { FactorRadarChart } from "@/components/charts/factor-radar-chart";
import { MarketPulseChart } from "@/components/charts/market-pulse-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { MetricCard } from "@/components/ui/metric-card";
import { Progress } from "@/components/ui/progress";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatCurrency } from "@/lib/utils";
import type { DashboardSnapshot, StructuredAgentResponse, TradeIdea } from "@/types";

function riskVariant(decision: TradeIdea["riskVerdict"]["decision"]) {
  if (decision === "APPROVE") return "success";
  if (decision === "REDUCE") return "warning";
  return "danger";
}

export function DashboardView({
  snapshot,
  agentBundles,
}: {
  snapshot: DashboardSnapshot;
  agentBundles: Record<string, StructuredAgentResponse<unknown>[]>;
}) {
  const [selected, setSelected] = useState<TradeIdea | null>(snapshot.topTradeIdeas[0] ?? null);
  const portfolio = snapshot.portfolioSummary;

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
          hint={`${snapshot.currentRegime.stance} regime`}
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
            <Badge variant={snapshot.currentRegime.stance === "Risk-On" ? "success" : "warning"}>
              {snapshot.currentRegime.stance}
            </Badge>
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
                  <div key={driver} className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-muted-foreground">
                    {driver}
                  </div>
                ))}
              </div>
            </div>
            <MarketPulseChart />
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
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
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

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top trade ideas</CardTitle>
              <CardDescription>Ranked by opportunity score and filtered through portfolio rules.</CardDescription>
            </div>
            <Badge variant="neutral">Click for full trace</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.topTradeIdeas.map((trade) => (
              <button
                key={trade.ticker}
                className="w-full rounded-2xl border border-white/8 bg-white/3 p-4 text-left transition hover:border-primary/40 hover:bg-white/5"
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
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{trade.sector}</span>
                      <span>{trade.region}</span>
                      <span>{trade.averageVolumeLabel} liquidity</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Score</p>
                      <p className="mt-2 text-2xl font-semibold">{trade.opportunityScore}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Price</p>
                      <p className="mt-2 text-2xl font-semibold">${trade.price}</p>
                    </div>
                    <div className="flex items-center gap-2 self-center text-sm text-primary">
                      View detail <ArrowRight className="h-4 w-4" />
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
                <div key={alert.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
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
                <div key={risk.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{risk.title}</p>
                    <Badge variant={risk.severity === "Critical" ? "danger" : risk.severity === "High" ? "warning" : "neutral"}>
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

      <Drawer
        description="Every component of the idea is traceable before any order is placed."
        onClose={() => setSelected(null)}
        open={Boolean(selected)}
        title={selected ? `${selected.ticker} trade packet` : "Trade packet"}
      >
        {selected ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Opportunity score</p>
                <p className="mt-2 text-3xl font-semibold">{selected.opportunityScore}/100</p>
                <Progress className="mt-3" value={selected.opportunityScore} />
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Conviction</p>
                <p className="mt-2 text-3xl font-semibold">{selected.conviction}%</p>
                <Progress className="mt-3" indicatorClassName="bg-cyan-400" value={selected.conviction} />
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Risk verdict</p>
                <div className="mt-3 flex items-center gap-2">
                  {selected.riskVerdict.decision === "APPROVE" ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-amber-300" />
                  )}
                  <p className="text-xl font-semibold">{selected.riskVerdict.decision}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{selected.riskVerdict.summary}</p>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>{selected.name}</CardDescription>
                </div>
                <Badge variant="info">{selected.direction}</Badge>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-sm text-muted-foreground">Trade summary</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {selected.ticker} is being surfaced because the current regime supports the setup, the factor stack is strong enough to compete for capital, and the execution plan is already defined before entry.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-sm text-muted-foreground">Portfolio fit</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{selected.portfolioFit.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{selected.portfolioFit.diversificationImpact}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Factor score breakdown</CardTitle>
                    <CardDescription>Configurable weighted scoring out of 100.</CardDescription>
                  </div>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <FactorRadarChart factors={selected.factorBreakdown} />
                  <div className="grid gap-3">
                    {selected.factorBreakdown.map((factor) => (
                      <div key={factor.key} className="rounded-2xl border border-white/8 bg-white/4 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{factor.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {factor.score} x {Math.round(factor.weight * 100)}%
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{factor.rationale}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Macro reasons</CardTitle>
                      <CardDescription>Why this idea fits the current cycle.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selected.macroReasons.map((reason) => (
                      <div key={reason} className="rounded-2xl border border-white/8 bg-white/4 p-3 text-sm text-muted-foreground">
                        {reason}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Geopolitical reasons</CardTitle>
                      <CardDescription>Overlay that can accelerate or impair the thesis.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selected.geopoliticalReasons.map((reason) => (
                      <div key={reason} className="rounded-2xl border border-white/8 bg-white/4 p-3 text-sm text-muted-foreground">
                        {reason}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Technical setup</CardTitle>
                    <CardDescription>Structure, trigger, and invalidation.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-muted-foreground">Pattern</p>
                    <p className="mt-1">{selected.technicalSetup.pattern}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-muted-foreground">Trigger</p>
                    <p className="mt-1">{selected.technicalSetup.trigger}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-muted-foreground">Support</p>
                      <p className="mt-1">${selected.technicalSetup.support}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-muted-foreground">Resistance</p>
                      <p className="mt-1">${selected.technicalSetup.resistance}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Execution and risk</CardTitle>
                    <CardDescription>Order plan plus risk-engine output.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-muted-foreground">Entry zone</p>
                    <p className="mt-1">{selected.executionPlan.entryZone}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-muted-foreground">Target 1</p>
                      <p className="mt-1">{selected.executionPlan.targetOne}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-muted-foreground">Target 2</p>
                      <p className="mt-1">{selected.executionPlan.targetTwo}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-muted-foreground">Risk engine verdict</p>
                    <p className="mt-2 font-medium">{selected.riskVerdict.summary}</p>
                    <div className="mt-3 space-y-2">
                      {selected.riskVerdict.messages.map((message) => (
                        <p key={message} className="text-sm text-muted-foreground">
                          {message}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Approved risk</p>
                        <p className="mt-1 font-semibold">{formatCurrency(selected.riskVerdict.approvedRiskAed)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Max position</p>
                        <p className="mt-1 font-semibold">{formatCurrency(selected.riskVerdict.maxPositionAed)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>AI reasoning layer</CardTitle>
                  <CardDescription>Each agent returns structured JSON for future orchestration.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                {(agentBundles[selected.ticker] ?? []).map((agent) => (
                  <div key={agent.agent} className="rounded-2xl border border-white/8 bg-[#08111c] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-medium">{agent.agent}</p>
                      <Badge variant={agent.status === "ok" ? "success" : "warning"}>{agent.status}</Badge>
                    </div>
                    <pre className="overflow-x-auto text-xs leading-6 text-cyan-100">
                      {JSON.stringify(agent, null, 2)}
                    </pre>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
