import { buildAllocationSuggestions, buildConcentrationChecks, buildCorrelationClusters } from "@/engines/portfolio";
import type {
  Holding,
  PortfolioRiskSnapshot,
  RiskDecision,
  RiskSettings,
  RiskVerdict,
  TradeIdea,
} from "@/types";

export function evaluateTradeRisk(
  trade: Omit<TradeIdea, "riskVerdict">,
  holdings: Holding[],
  settings: RiskSettings,
): RiskVerdict {
  const maxRiskAed = (settings.portfolioValueAed * settings.maxRiskPerTradePct) / 100;
  const maxPositionAed = Number(
    Math.min(
      settings.portfolioValueAed * (settings.maxSinglePositionPct / 100),
      maxRiskAed / (trade.stopDistancePct / 100),
    ).toFixed(0),
  );

  const currentOpenRiskAed = holdings.reduce((sum, holding) => sum + holding.openRiskAed, 0);
  const projectedOpenRiskPct =
    ((currentOpenRiskAed + maxRiskAed) / settings.portfolioValueAed) * 100;

  const sameSectorExposure = holdings
    .filter((holding) => holding.sector === trade.sector)
    .reduce((sum, holding) => sum + holding.weightPct, 0);

  const sameThemeExposure = holdings
    .filter(
      (holding) =>
        holding.correlationTag.toLowerCase().includes(trade.sector.toLowerCase()) ||
        (holding.sector === "Semiconductors" && trade.sector === "Servers"),
    )
    .reduce((sum, holding) => sum + holding.weightPct, 0);

  const messages: string[] = [];
  let decision: RiskDecision = "APPROVE";
  let score = 86;

  if (trade.stopDistancePct > 6) {
    decision = "REDUCE";
    score -= 14;
    messages.push("Wide stop distance increases adverse excursion risk; use reduced sizing.");
  }

  if (projectedOpenRiskPct > settings.maxPortfolioOpenRiskPct) {
    decision = "REJECT";
    score -= 36;
    messages.push("Projected open risk breaches the total portfolio risk cap.");
  }

  if (sameSectorExposure > settings.maxSectorExposurePct - 4) {
    decision = decision === "REJECT" ? "REJECT" : "REDUCE";
    score -= 18;
    messages.push("Sector exposure is already elevated relative to the configured limit.");
  }

  if (sameThemeExposure > settings.maxCorrelationClusterPct - 6) {
    decision = decision === "REJECT" ? "REJECT" : "REDUCE";
    score -= 12;
    messages.push("Correlated exposure is high, so this idea should not be taken at full size.");
  }

  if (trade.opportunityScore < 60) {
    decision = "REJECT";
    score -= 24;
    messages.push("Opportunity quality is not strong enough to justify new risk.");
  }

  if (messages.length === 0) {
    messages.push("Setup fits current portfolio rules and can be taken at standard size.");
  }

  return {
    decision,
    score: Math.max(score, 15),
    summary:
      decision === "APPROVE"
        ? "Risk engine approves standard sizing."
        : decision === "REDUCE"
          ? "Risk engine allows the trade only with reduced sizing."
          : "Risk engine rejects the trade under current portfolio constraints.",
    messages,
    approvedRiskAed: decision === "REJECT" ? 0 : Number(maxRiskAed.toFixed(0)),
    maxPositionAed: decision === "REJECT" ? 0 : maxPositionAed,
  };
}

export function buildPortfolioRiskSnapshot(
  holdings: Holding[],
  settings: RiskSettings,
): PortfolioRiskSnapshot {
  const concentrationChecks = buildConcentrationChecks(holdings, settings);
  const correlationClusters = buildCorrelationClusters(holdings, settings);
  const suggestions = buildAllocationSuggestions(concentrationChecks, correlationClusters);
  const totalOpenRiskAed = holdings.reduce((sum, holding) => sum + holding.openRiskAed, 0);

  return {
    concentrationChecks,
    correlationClusters,
    suggestions,
    totalOpenRiskAed,
    totalOpenRiskPct: Number(((totalOpenRiskAed / settings.portfolioValueAed) * 100).toFixed(1)),
  };
}
