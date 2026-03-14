import type {
  MacroAgentPayload,
  NewsAgentPayload,
  OpportunityAgentPayload,
  RiskOfficerPayload,
  StructuredAgentResponse,
  TradeIdea,
} from "@/types";

export function runNewsAgent(trade: TradeIdea): StructuredAgentResponse<NewsAgentPayload> {
  return {
    agent: "News Agent",
    asOf: new Date("2026-03-14T09:00:00Z").toISOString(),
    status: trade.catalystStrength >= 75 ? "ok" : "watch",
    payload: {
      headline: `${trade.ticker} catalyst stack remains active into the next macro window.`,
      sentiment: trade.changePct >= 0 ? "positive" : "neutral",
      impactedTickers: [trade.ticker],
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
  return {
    agent: "Macro/Geopolitics Agent",
    asOf: new Date("2026-03-14T09:00:00Z").toISOString(),
    status: trade.macroFit >= 70 ? "ok" : "watch",
    payload: {
      macroRegime: trade.macroReasons[0],
      geopoliticalOverlay: trade.geopoliticalReasons[0],
      keyDrivers: [...trade.macroReasons],
      watchItems: [...trade.geopoliticalReasons],
    },
  };
}

export function runOpportunityAgent(
  trade: TradeIdea,
): StructuredAgentResponse<OpportunityAgentPayload> {
  return {
    agent: "Opportunity Agent",
    asOf: new Date("2026-03-14T09:00:00Z").toISOString(),
    status: trade.opportunityScore >= 70 ? "ok" : "watch",
    payload: {
      ticker: trade.ticker,
      score: trade.opportunityScore,
      thesis: `${trade.name} screens as a ${trade.direction.toLowerCase()} idea because factor quality, macro fit, and technical structure are aligned.`,
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
  return {
    agent: "Risk Officer Agent",
    asOf: new Date("2026-03-14T09:00:00Z").toISOString(),
    status: trade.riskVerdict.decision === "REJECT" ? "watch" : "ok",
    payload: {
      ticker: trade.ticker,
      decision: trade.riskVerdict.decision,
      reasons: trade.riskVerdict.messages,
      approvedRiskAed: trade.riskVerdict.approvedRiskAed,
    },
  };
}
