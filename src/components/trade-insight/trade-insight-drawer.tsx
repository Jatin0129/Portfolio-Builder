"use client";

import { CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { TradeInsightSection } from "@/components/trade-insight/trade-insight-section";
import { formatCurrency } from "@/lib/utils";
import type { TradeIdea } from "@/types";

function verdictVariant(decision: TradeIdea["riskVerdict"]["decision"]) {
  if (decision === "APPROVE") return "success";
  if (decision === "REDUCE") return "warning";
  return "danger";
}

function verdictIcon(decision: TradeIdea["riskVerdict"]["decision"]) {
  if (decision === "APPROVE") return <ShieldCheck className="h-5 w-5 text-emerald-300" />;
  if (decision === "REDUCE") return <ShieldAlert className="h-5 w-5 text-amber-300" />;
  return <XCircle className="h-5 w-5 text-rose-300" />;
}

export function TradeInsightDrawer({
  trade,
  open,
  onClose,
}: {
  trade: TradeIdea | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer
      description="Explainable trade packet built from regime, factor, portfolio, and risk-engine inputs."
      onClose={onClose}
      open={open}
      title={trade ? `${trade.ticker} trade insight` : "Trade insight"}
    >
      {trade ? (
        <div className="space-y-6">
          <TradeInsightSection title="1. Trade summary" description="Decision-ready trade snapshot.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ticker</p>
                <p className="mt-2 text-xl font-semibold">{trade.insight.summary.ticker}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Action</p>
                <div className="mt-2">
                  <Badge variant="info">{trade.insight.summary.action}</Badge>
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Confidence</p>
                <p className="mt-2 text-xl font-semibold">{trade.insight.summary.confidence}%</p>
                <Progress className="mt-3" indicatorClassName="bg-cyan-400" value={trade.insight.summary.confidence} />
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Score</p>
                <p className="mt-2 text-xl font-semibold">{trade.insight.summary.score}/100</p>
                <Progress className="mt-3" value={trade.insight.summary.score} />
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Time horizon</p>
                <p className="mt-2 text-lg font-semibold">{trade.insight.summary.timeHorizon}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Position size</p>
                <p className="mt-2 text-lg font-semibold">{trade.insight.summary.positionSize}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Entry zone</p>
                <p className="mt-2 text-lg font-semibold">{trade.insight.summary.entryZone}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stop loss</p>
                <p className="mt-2 text-lg font-semibold">{trade.insight.summary.stopLoss}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Target 1</p>
                <p className="mt-2 text-lg font-semibold">{trade.insight.summary.targetOne}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Target 2</p>
                <p className="mt-2 text-lg font-semibold">{trade.insight.summary.targetTwo}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/8 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">AED risk</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(trade.insight.summary.aedRisk)}</p>
            </div>
          </TradeInsightSection>

          <TradeInsightSection title="2. Why this trade" description="Core idea and regime alignment.">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-medium">Short thesis</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{trade.insight.whyThisTrade.shortThesis}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-medium">Regime fit</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{trade.insight.whyThisTrade.regimeFit}</p>
              </div>
            </div>
          </TradeInsightSection>

          <TradeInsightSection title="3. Macro reasons" description="Macro drivers supporting the setup.">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {trade.macroReasons.map((reason) => (
                <li key={reason} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  {reason}
                </li>
              ))}
            </ul>
          </TradeInsightSection>

          <TradeInsightSection title="4. Geopolitical reasons" description="Geopolitical overlays affecting the trade.">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {trade.geopoliticalReasons.map((reason) => (
                <li key={reason} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  {reason}
                </li>
              ))}
            </ul>
          </TradeInsightSection>

          <TradeInsightSection title="5. Factor score breakdown" description="Weighted score drivers.">
            <div className="grid gap-3">
              {trade.factorBreakdown.map((factor) => (
                <div key={factor.key} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{factor.label}</p>
                    <p className="text-sm text-muted-foreground">{factor.score}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{factor.rationale}</p>
                </div>
              ))}
            </div>
          </TradeInsightSection>

          <TradeInsightSection title="6. Technical setup" description="Structure and confirmation requirements.">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-medium">Setup explanation</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {trade.insight.technical.setupExplanation}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-medium">Confirmation signals</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {trade.insight.technical.confirmationSignals.map((signal) => (
                    <li key={signal} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TradeInsightSection>

          <TradeInsightSection title="7. Portfolio fit" description="How this idea interacts with the current book.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-medium">Overlap with current portfolio</p>
                <p className="mt-2 text-sm text-muted-foreground">{trade.portfolioFit.overlapWithCurrentPortfolio}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-medium">Theme fit</p>
                <p className="mt-2 text-sm text-muted-foreground">{trade.portfolioFit.themeFit}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4 md:col-span-2">
                <p className="text-sm font-medium">Hedge value</p>
                <p className="mt-2 text-sm text-muted-foreground">{trade.portfolioFit.hedgeValue}</p>
              </div>
            </div>
          </TradeInsightSection>

          <TradeInsightSection title="8. Risk officer verdict" description="Portfolio rule approval outcome.">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {verdictIcon(trade.riskVerdict.decision)}
                  <p className="text-lg font-semibold">{trade.riskVerdict.decision}</p>
                </div>
                <Badge variant={verdictVariant(trade.riskVerdict.decision)}>{trade.riskVerdict.score}/100</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{trade.riskVerdict.explanation}</p>
              <div className="mt-4 space-y-2">
                {trade.riskVerdict.messages.map((message) => (
                  <p key={message} className="text-sm text-muted-foreground">
                    {message}
                  </p>
                ))}
              </div>
            </div>
          </TradeInsightSection>

          <TradeInsightSection title="9. Execution plan" description="Suggested action steps.">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {trade.insight.executionSteps.map((step) => (
                <li key={step} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  {step}
                </li>
              ))}
            </ul>
          </TradeInsightSection>
        </div>
      ) : null}
    </Drawer>
  );
}
