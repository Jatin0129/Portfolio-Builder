import { AllocationChart } from "@/components/charts/allocation-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatCurrency } from "@/lib/utils";
import type { Holding, PortfolioRiskSnapshot, PortfolioSummary, RiskSettings } from "@/types";

export function PortfolioRiskView({
  summary,
  holdings,
  risk,
  settings,
}: {
  summary: PortfolioSummary;
  holdings: Holding[];
  risk: PortfolioRiskSnapshot;
  settings: RiskSettings;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Portfolio & Risk"
        title="Allocation discipline in AED"
        description="Holdings, concentration, correlation awareness, and open-risk controls share one decision surface."
        action={<Badge variant="warning">{risk.totalOpenRiskPct}% open risk</Badge>}
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Allocation analysis</CardTitle>
              <CardDescription>Portfolio structure and cash positioning.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AllocationChart data={summary.allocationMix} />
            <div className="grid gap-3 sm:grid-cols-3">
              {summary.allocationMix.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-sm text-muted-foreground">{item.name}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Holdings</CardTitle>
              <CardDescription>Current positions with open-risk and concentration context.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {holdings.map((holding) => (
              <div key={holding.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{holding.ticker}</p>
                      <Badge variant="neutral">{holding.sector}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{holding.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(holding.marketValueAed)}</p>
                    <p className="text-sm text-muted-foreground">{holding.weightPct}% weight</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">PnL</p>
                    <p className="mt-1">{formatCurrency(holding.unrealizedPnlAed)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Open risk</p>
                    <p className="mt-1">{formatCurrency(holding.openRiskAed)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Beta</p>
                    <p className="mt-1">{holding.beta}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cluster</p>
                    <p className="mt-1">{holding.correlationTag}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Concentration checks</CardTitle>
              <CardDescription>Caps are enforced before new trades are approved.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {risk.concentrationChecks.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.label}</p>
                  <Badge variant={item.status === "Breach" ? "danger" : item.status === "Watch" ? "warning" : "success"}>
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.exposurePct}% exposure vs {item.thresholdPct}% threshold
                </p>
                <Progress
                  className="mt-3"
                  indicatorClassName={item.status === "Breach" ? "bg-rose-400" : item.status === "Watch" ? "bg-amber-400" : "bg-emerald-400"}
                  value={(item.exposurePct / item.thresholdPct) * 100}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Correlation awareness</CardTitle>
              <CardDescription>Cluster-level crowding and suggested actions.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {risk.correlationClusters.map((cluster) => (
              <div key={cluster.tag} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{cluster.tag}</p>
                  <p className="text-sm text-muted-foreground">{cluster.exposurePct}% exposure</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{cluster.holdings.join(", ")}</p>
              </div>
            ))}

            <div className="rounded-2xl border border-primary/15 bg-primary/8 p-4">
              <p className="font-medium">Risk configuration</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <p className="text-sm text-muted-foreground">
                  Max risk per trade: {settings.maxRiskPerTradePct}% of portfolio
                </p>
                <p className="text-sm text-muted-foreground">
                  Max portfolio open risk: {settings.maxPortfolioOpenRiskPct}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Max single position: {settings.maxSinglePositionPct}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Max sector exposure: {settings.maxSectorExposurePct}%
                </p>
              </div>
            </div>

            {risk.suggestions.map((suggestion) => (
              <div key={suggestion.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{suggestion.label}</p>
                  <Badge variant={suggestion.action === "Trim" ? "warning" : suggestion.action === "Increase" ? "success" : "neutral"}>
                    {suggestion.action}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{suggestion.rationale}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
