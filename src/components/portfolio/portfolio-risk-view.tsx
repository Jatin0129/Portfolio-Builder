import { AlertTriangle, ShieldAlert, Wallet } from "lucide-react";

import { AllocationChart } from "@/components/charts/allocation-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
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
  const sectorExposure = holdings.reduce<Record<string, number>>((accumulator, holding) => {
    accumulator[holding.sector] = (accumulator[holding.sector] ?? 0) + holding.weightPct;
    return accumulator;
  }, {});

  const themeExposure = holdings.reduce<Record<string, number>>((accumulator, holding) => {
    accumulator[holding.correlationTag] = (accumulator[holding.correlationTag] ?? 0) + holding.weightPct;
    return accumulator;
  }, {});

  const assetClassExposure = {
    Equities: holdings
      .filter((holding) => holding.sector !== "Precious Metals")
      .reduce((sum, holding) => sum + holding.weightPct, 0),
    Hedges: holdings
      .filter((holding) => holding.sector === "Precious Metals")
      .reduce((sum, holding) => sum + holding.weightPct, 0),
    Cash: Number(((summary.cashAed / summary.portfolioValueAed) * 100).toFixed(1)),
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Portfolio & Risk"
        title="Allocation discipline in AED"
        description="Holdings, concentration, correlation awareness, and open-risk controls share one decision surface."
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
              <CardTitle>Holdings table</CardTitle>
              <CardDescription>Current positions with open-risk and concentration context.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="overflow-x-auto rounded-2xl border border-white/8 bg-white/4">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/8 bg-[#08111c] text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Asset</th>
                    <th className="px-4 py-3 font-medium">Sector</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Weight</th>
                    <th className="px-4 py-3 font-medium">PnL</th>
                    <th className="px-4 py-3 font-medium">Open risk</th>
                    <th className="px-4 py-3 font-medium">Theme</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.id} className="border-b border-white/6 last:border-b-0">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">{holding.ticker}</p>
                          <p className="text-xs text-muted-foreground">{holding.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{holding.sector}</td>
                      <td className="px-4 py-4 text-foreground">{formatCurrency(holding.marketValueAed)}</td>
                      <td className="px-4 py-4 text-foreground">{holding.weightPct}%</td>
                      <td className="px-4 py-4 text-foreground">{formatCurrency(holding.unrealizedPnlAed)}</td>
                      <td className="px-4 py-4 text-foreground">{formatCurrency(holding.openRiskAed)}</td>
                      <td className="px-4 py-4 text-muted-foreground">{holding.correlationTag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sector, theme, and asset-class exposure</CardTitle>
              <CardDescription>Exposure map across the current book.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Sector exposure</p>
              <div className="grid gap-3">
                {Object.entries(sectorExposure).map(([sector, exposure]) => (
                  <div key={sector} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{sector}</p>
                      <p className="text-sm text-muted-foreground">{exposure.toFixed(1)}%</p>
                    </div>
                    <Progress className="mt-3" value={(exposure / settings.maxSectorExposurePct) * 100} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Theme exposure</p>
              <div className="grid gap-3">
                {Object.entries(themeExposure).map(([theme, exposure]) => (
                  <div key={theme} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{theme}</p>
                      <p className="text-sm text-muted-foreground">{exposure.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Asset class exposure</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {Object.entries(assetClassExposure).map(([assetClass, exposure]) => (
                  <div key={assetClass} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-sm text-muted-foreground">{assetClass}</p>
                    <p className="mt-2 text-2xl font-semibold">{exposure.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Risk summary cards</CardTitle>
                <CardDescription>Key warnings before additional exposure is added.</CardDescription>
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
            <CardContent>
              {risk.concentrationChecks.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.label}</p>
                    <Badge
                      variant={
                        item.status === "Breach" ? "danger" : item.status === "Watch" ? "warning" : "success"
                      }
                    >
                      {item.status}
                    </Badge>
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
                    <Badge
                      variant={
                        suggestion.action === "Trim"
                          ? "warning"
                          : suggestion.action === "Increase"
                            ? "success"
                            : "neutral"
                      }
                    >
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
    </div>
  );
}
