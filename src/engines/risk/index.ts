import {
  buildAllocationSuggestions,
  buildConcentrationChecks,
  buildCorrelationClusters,
  normalizeHoldings,
} from "@/engines/portfolio";
import type {
  Holding,
  PortfolioRiskSnapshot,
  RiskDecision,
  RiskVerdict,
  TradeIdea,
  UserSettings,
} from "@/types";

export function evaluateTradeRisk(
  trade: Omit<TradeIdea, "riskVerdict" | "insight">,
  holdings: Holding[],
  settings: UserSettings,
): RiskVerdict {
  const normalizedHoldings = normalizeHoldings(holdings, settings);
  const maxRiskAed = (settings.totalCapital * settings.maxRiskPerTradePct) / 100;
  const maxPositionAed = Number(
    Math.min(
      settings.totalCapital * (settings.maxSinglePositionPct / 100),
      maxRiskAed / (trade.stopDistancePct / 100),
    ).toFixed(0),
  );

  const currentOpenRiskAed = normalizedHoldings.reduce((sum, holding) => sum + holding.openRiskAed, 0);
  const projectedOpenRiskPct =
    ((currentOpenRiskAed + maxRiskAed) / settings.totalCapital) * 100;

  const sameSectorExposure = normalizedHoldings
    .filter((holding) => holding.sector === trade.sector)
    .reduce((sum, holding) => sum + holding.weightPct, 0);

  const sameThemeExposure = normalizedHoldings
    .filter((holding) =>
      holding.themes.some((theme) =>
        trade.themes.some(
          (tradeTheme) =>
            theme.toLowerCase().includes(tradeTheme.toLowerCase()) ||
            tradeTheme.toLowerCase().includes(theme.toLowerCase()),
        ),
      ),
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
    explanation:
      decision === "APPROVE"
        ? "The setup fits the current portfolio rules, and no major concentration or open-risk limits are breached."
        : decision === "REDUCE"
          ? "The idea is acceptable only with smaller sizing because volatility, concentration, or correlation inputs are not clean enough for full size."
          : "The trade violates one or more portfolio controls, so capital should not be allocated under current conditions.",
    messages,
    approvedRiskAed: decision === "REJECT" ? 0 : Number(maxRiskAed.toFixed(0)),
    maxPositionAed: decision === "REJECT" ? 0 : maxPositionAed,
  };
}

export function buildPortfolioRiskSnapshot(
  holdings: Holding[],
  settings: UserSettings,
): PortfolioRiskSnapshot {
  const concentrationChecks = buildConcentrationChecks(holdings, settings);
  const correlationClusters = buildCorrelationClusters(holdings, settings);
  const suggestions = buildAllocationSuggestions(concentrationChecks, correlationClusters);
  const normalizedHoldings = normalizeHoldings(holdings, settings);
  const totalOpenRiskAed = normalizedHoldings.reduce((sum, holding) => sum + holding.openRiskAed, 0);

  return {
    concentrationChecks,
    correlationClusters,
    suggestions,
    totalOpenRiskAed,
    totalOpenRiskPct: Number(((totalOpenRiskAed / settings.totalCapital) * 100).toFixed(1)),
  };
}
