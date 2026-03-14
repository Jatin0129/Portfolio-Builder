import {
  riskOfficerAgentEnvelopeSchema,
  riskOfficerAgentRequestSchema,
  type RiskOfficerAgentRequest,
  type RiskOfficerAgentResponse,
  type RiskReasonCode,
} from "@/schemas/agents";
import {
  buildRequestId,
  createMockEnvelope,
  normalizeScore,
  type TypedAgentService,
} from "@/services/agents/shared";

function buildThemeExposure(themes: string[] | undefined, themeExposurePct: Record<string, number> | undefined) {
  if (!themes?.length || !themeExposurePct) return 0;
  return Math.max(...themes.map((theme) => themeExposurePct[theme] ?? 0), 0);
}

export const invokeRiskOfficerAgent: TypedAgentService<
  RiskOfficerAgentRequest,
  RiskOfficerAgentResponse
> = (request) => {
  const parsedRequest = riskOfficerAgentRequestSchema.parse(request);
  const approvedTrades: RiskOfficerAgentResponse["approvedTrades"] = [];
  const reducedTrades: RiskOfficerAgentResponse["reducedTrades"] = [];
  const rejectedTrades: RiskOfficerAgentResponse["rejectedTrades"] = [];

  for (const trade of parsedRequest.proposedTrades) {
    const stopDistancePct = Math.abs((trade.entry - trade.stop) / trade.entry) * 100;
    const sectorExposure = trade.sector
      ? parsedRequest.portfolioSnapshot.sectorExposurePct?.[trade.sector] ?? 0
      : 0;
    const themeExposure = buildThemeExposure(
      trade.themes,
      parsedRequest.portfolioSnapshot.themeExposurePct,
    );
    const opportunityScore = normalizeScore(trade.opportunityScore, 70);
    const reasonCodes: RiskReasonCode[] = [];

    let bucket: "approved" | "reduced" | "rejected" = "approved";
    let recommendedRiskPct = Math.min(
      trade.riskPct ?? parsedRequest.limits.maxRiskPerTradePct,
      parsedRequest.limits.maxRiskPerTradePct,
    );

    if (stopDistancePct > 6) {
      bucket = "reduced";
      recommendedRiskPct = Number(Math.min(recommendedRiskPct, parsedRequest.limits.maxRiskPerTradePct * 0.5).toFixed(2));
      reasonCodes.push("STOP_DISTANCE_TOO_WIDE");
    }

    if (parsedRequest.portfolioSnapshot.openRiskPct + recommendedRiskPct > parsedRequest.limits.maxPortfolioOpenRiskPct) {
      bucket = "rejected";
      recommendedRiskPct = 0;
      reasonCodes.push("PORTFOLIO_RISK_CAP_BREACH");
    }

    if (sectorExposure > parsedRequest.limits.maxSectorExposurePct) {
      bucket = bucket === "rejected" ? "rejected" : "reduced";
      recommendedRiskPct = bucket === "rejected" ? 0 : Number(Math.min(recommendedRiskPct, parsedRequest.limits.maxRiskPerTradePct * 0.5).toFixed(2));
      reasonCodes.push("SECTOR_EXPOSURE_TOO_HIGH");
    }

    if (themeExposure > parsedRequest.limits.maxThemeExposurePct) {
      bucket = bucket === "rejected" ? "rejected" : "reduced";
      recommendedRiskPct = bucket === "rejected" ? 0 : Number(Math.min(recommendedRiskPct, parsedRequest.limits.maxRiskPerTradePct * 0.5).toFixed(2));
      reasonCodes.push("THEME_EXPOSURE_TOO_HIGH");
    }

    if (opportunityScore < 55) {
      bucket = "rejected";
      recommendedRiskPct = 0;
      reasonCodes.push("INSUFFICIENT_OPPORTUNITY_QUALITY");
    }

    if (reasonCodes.length === 0) {
      reasonCodes.push("WITHIN_LIMITS");
    }

    const decision = {
      ticker: trade.ticker,
      recommendedRiskPct: bucket === "rejected" ? undefined : recommendedRiskPct,
      reasonCodes,
      explanation:
        bucket === "approved"
          ? "Trade fits the configured portfolio controls and can be taken at standard sizing."
          : bucket === "reduced"
            ? "Trade can be considered, but only with reduced sizing because one or more controls are close to their limits."
            : "Trade should be rejected under current risk controls.",
    };

    if (bucket === "approved") {
      approvedTrades.push(decision);
      continue;
    }

    if (bucket === "reduced") {
      reducedTrades.push(decision);
      continue;
    }

    rejectedTrades.push(decision);
  }

  const response = createMockEnvelope(
    "Risk Officer Agent",
    buildRequestId("Risk Officer Agent", [
      parsedRequest.proposedTrades.map((trade) => trade.ticker).join("-"),
      parsedRequest.proposedTrades.length,
    ]),
    rejectedTrades.length > 0 ? "watch" : "ok",
    {
      approvedTrades,
      reducedTrades,
      rejectedTrades,
    },
  );

  return riskOfficerAgentEnvelopeSchema.parse(response);
};
