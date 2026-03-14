import { holdings, riskSettings } from "@/mock-data";
import {
  invokeMacroGeopoliticsAgent,
  invokeNewsAgent,
  invokeOpportunityAgent,
  invokeRiskOfficerAgent,
} from "@/services/agents";
import type {
  MacroAgentPayload,
  NewsAgentPayload,
  OpportunityAgentPayload,
  RiskOfficerPayload,
  StructuredAgentResponse,
  TradeIdea,
} from "@/types";

function buildSectorExposureMap() {
  return holdings.reduce<Record<string, number>>((accumulator, holding) => {
    accumulator[holding.sector] = Number(
      ((accumulator[holding.sector] ?? 0) + holding.weightPct).toFixed(1),
    );
    return accumulator;
  }, {});
}

function buildThemeExposureMap() {
  return holdings.reduce<Record<string, number>>((accumulator, holding) => {
    for (const theme of holding.themes) {
      accumulator[theme] = Number(((accumulator[theme] ?? 0) + holding.weightPct).toFixed(1));
    }
    return accumulator;
  }, {});
}

function buildTradeEntry(trade: TradeIdea) {
  return trade.price;
}

function buildTradeStop(trade: TradeIdea) {
  const stopMultiplier = trade.direction === "LONG" ? 1 - trade.stopDistancePct / 100 : 1 + trade.stopDistancePct / 100;
  return Number((trade.price * stopMultiplier).toFixed(2));
}

function mapReasonCode(code: string) {
  switch (code) {
    case "WITHIN_LIMITS":
      return "Setup fits current portfolio rules and can be taken at standard size.";
    case "STOP_DISTANCE_TOO_WIDE":
      return "Wide stop distance increases adverse excursion risk; use reduced sizing.";
    case "PORTFOLIO_RISK_CAP_BREACH":
      return "Projected open risk breaches the total portfolio risk cap.";
    case "SECTOR_EXPOSURE_TOO_HIGH":
      return "Sector exposure is already elevated relative to the configured limit.";
    case "THEME_EXPOSURE_TOO_HIGH":
      return "Correlated thematic exposure is already elevated.";
    case "INSUFFICIENT_OPPORTUNITY_QUALITY":
      return "Opportunity quality is not strong enough to justify new risk.";
    default:
      return "Additional review required before acting.";
  }
}

export function runNewsAgent(trade: TradeIdea): StructuredAgentResponse<NewsAgentPayload> {
  const response = invokeNewsAgent({
    focus: {
      ticker: trade.ticker,
      assetName: trade.name,
      region: trade.region,
      themes: trade.themes,
    },
    articles: [
      {
        id: `${trade.ticker}-headline`,
        headline: `${trade.ticker} catalyst stack remains active into the next macro window.`,
        summary: trade.catalyst,
        source: "CycleOS Mock Wire",
        publishedAt: new Date("2026-03-14T09:00:00Z").toISOString(),
        tickers: [trade.ticker],
      },
      {
        id: `${trade.ticker}-macro`,
        headline: `${trade.ticker} macro backdrop stays aligned with the trade thesis.`,
        summary: trade.macroReasons[0] ?? trade.thesis,
        source: "CycleOS Macro Desk",
        publishedAt: new Date("2026-03-14T09:00:00Z").toISOString(),
        tickers: [trade.ticker],
      },
    ],
  });
  const primaryImpact = response.data.impactedAssets[0];
  const sentiment =
    primaryImpact?.impact === "negative"
      ? "negative"
      : response.data.relevanceScore >= 80
        ? "positive"
        : "neutral";

  return {
    agent: "News Agent",
    asOf: response.asOf,
    status: response.status,
    payload: {
      headline: response.data.eventSummary,
      sentiment,
      impactedTickers: response.data.impactedAssets.map((asset) => asset.ticker),
      actionBias:
        trade.catalystStrength >= 75
          ? "Monitor for breakout confirmation."
          : "Wait for cleaner headlines.",
    },
  };
}

export function runMacroGeopoliticsAgent(
  trade: TradeIdea,
): StructuredAgentResponse<MacroAgentPayload> {
  const response = invokeMacroGeopoliticsAgent({
    macroSignals: trade.macroReasons.map((reason, index) => ({
      label: `Macro driver ${index + 1}`,
      value: reason,
      trend: trade.macroFit >= 70 ? "supportive" : "mixed",
      importance: Math.max(50, trade.macroFit - index * 8),
    })),
    geopoliticalEvents: trade.geopoliticalReasons.map((reason, index) => ({
      title: `${trade.region} geopolitical overlay ${index + 1}`,
      region: trade.region,
      severity: index === 0 && trade.geopoliticalFit < 65 ? "High" : "Moderate",
      summary: reason,
      channels: ["risk sentiment", "earnings"],
    })),
    regimeContext: {
      currentRegime: trade.regimeReasons[0] ?? trade.regimeFitText,
      posture: trade.direction === "LONG" ? "balanced" : "defensive",
    },
  });

  return {
    agent: "Macro/Geopolitics Agent",
    asOf: response.asOf,
    status: response.status,
    payload: {
      macroRegime: response.data.macroInterpretation,
      geopoliticalOverlay: response.data.geopoliticalInterpretation,
      keyDrivers: [...trade.macroReasons],
      watchItems: [...trade.geopoliticalReasons],
    },
  };
}

export function runOpportunityAgent(
  trade: TradeIdea,
): StructuredAgentResponse<OpportunityAgentPayload> {
  const response = invokeOpportunityAgent({
    candidates: [
      {
        ticker: trade.ticker,
        name: trade.name,
        direction: trade.direction,
        thesis: trade.thesis,
        score: trade.opportunityScore,
        sector: trade.sector,
        themes: trade.themes,
      },
    ],
    marketContext: {
      regime: trade.regimeReasons[0] ?? trade.regimeFitText,
      volatility: trade.volatilityQuality >= 75 ? "calm" : trade.volatilityQuality >= 60 ? "elevated" : "stressed",
      breadth: trade.relativeStrength >= 70 ? "strong" : "mixed",
    },
  });
  const matchedIdea =
    response.data.topLongIdeas.find((idea) => idea.ticker === trade.ticker) ??
    response.data.defensiveIdeas.find((idea) => idea.ticker === trade.ticker) ??
    response.data.avoidIdeas.find((idea) => idea.ticker === trade.ticker);

  return {
    agent: "Opportunity Agent",
    asOf: response.asOf,
    status: response.status,
    payload: {
      ticker: trade.ticker,
      score: trade.opportunityScore,
      thesis:
        matchedIdea?.thesis ??
        `${trade.name} screens as a ${trade.direction.toLowerCase()} idea because factor quality, macro fit, and technical structure are aligned.`,
      supportingFactors: trade.factorBreakdown
        .filter((factor) => factor.score >= 75)
        .map((factor) => `${factor.label}: ${factor.score}`),
      executionBias: trade.executionPlan.entryZone,
    },
  };
}

export function runRiskOfficerAgent(
  trade: TradeIdea,
): StructuredAgentResponse<RiskOfficerPayload> {
  const response = invokeRiskOfficerAgent({
    proposedTrades: [
      {
        ticker: trade.ticker,
        direction: trade.direction,
        entry: buildTradeEntry(trade),
        stop: buildTradeStop(trade),
        target: trade.direction === "LONG" ? trade.technicalSetup.resistance : trade.technicalSetup.support,
        riskPct: Number(
          ((trade.riskVerdict.approvedRiskAed / riskSettings.portfolioValueAed) * 100).toFixed(2),
        ),
        sector: trade.sector,
        themes: trade.themes,
        opportunityScore: trade.opportunityScore,
      },
    ],
    portfolioSnapshot: {
      openRiskPct: Number(
        ((holdings.reduce((sum, holding) => sum + holding.openRiskAed, 0) /
          riskSettings.portfolioValueAed) *
          100).toFixed(2),
      ),
      sectorExposurePct: buildSectorExposureMap(),
      themeExposurePct: buildThemeExposureMap(),
    },
    limits: {
      maxRiskPerTradePct: riskSettings.maxRiskPerTradePct,
      maxPortfolioOpenRiskPct: riskSettings.maxPortfolioOpenRiskPct,
      maxSectorExposurePct: riskSettings.maxSectorExposurePct,
      maxThemeExposurePct: riskSettings.maxCorrelationClusterPct,
    },
  });
  const approvedTrade = response.data.approvedTrades.find((item) => item.ticker === trade.ticker);
  const reducedTrade = response.data.reducedTrades.find((item) => item.ticker === trade.ticker);
  const rejectedTrade = response.data.rejectedTrades.find((item) => item.ticker === trade.ticker);
  const decisionItem = approvedTrade ?? reducedTrade ?? rejectedTrade;

  return {
    agent: "Risk Officer Agent",
    asOf: response.asOf,
    status: response.status,
    payload: {
      ticker: trade.ticker,
      decision: approvedTrade ? "APPROVE" : reducedTrade ? "REDUCE" : "REJECT",
      reasons: decisionItem ? decisionItem.reasonCodes.map(mapReasonCode) : trade.riskVerdict.messages,
      approvedRiskAed: decisionItem?.recommendedRiskPct
        ? Number(((decisionItem.recommendedRiskPct / 100) * riskSettings.portfolioValueAed).toFixed(0))
        : 0,
    },
  };
}
