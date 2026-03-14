import type {
  GeopoliticalEvent,
  MacroEvent,
  MarketSummary,
  RegimeSnapshot,
  Severity,
} from "@/types";

function severityValue(severity: Severity) {
  switch (severity) {
    case "Critical":
      return 4;
    case "High":
      return 3;
    case "Moderate":
      return 2;
    default:
      return 1;
  }
}

export function classifyRegime(
  market: MarketSummary,
  macroEvents: MacroEvent[],
  geopoliticalEvents: GeopoliticalEvent[],
): RegimeSnapshot {
  const indexSignal =
    market.indices.filter((item) => item.trend === "up").length -
    market.indices.filter((item) => item.trend === "down").length;
  const breadthSignal = market.breadthPct >= 58 ? 1 : market.breadthPct >= 48 ? 0 : -1;
  const volatilitySignal = market.vix <= 17 ? 1 : market.vix <= 22 ? 0 : -1;
  const usdSignal = market.usdTrend === "down" ? 1 : market.usdTrend === "up" ? -1 : 0;
  const bondSignal =
    market.bondYieldTrend === "flat" ? 1 : market.bondYieldTrend === "up" ? -1 : 0;
  const commoditySignal = market.goldOilSignal === "balanced" ? 1 : 0;
  const macroStress =
    macroEvents.filter((event) => severityValue(event.severity) >= 3).length >= 2 ? -1 : 0;
  const geoStress =
    geopoliticalEvents.reduce((sum, event) => sum + severityValue(event.severity), 0) >= 8
      ? -1
      : 0;

  const total =
    indexSignal +
    breadthSignal +
    volatilitySignal +
    usdSignal +
    bondSignal +
    commoditySignal +
    macroStress +
    geoStress;

  if (total >= 3) {
    return {
      name: "Constructive Risk-On",
      stance: "Risk-On",
      confidence: 78,
      explanation:
        "Trend, breadth, and volatility are supportive, but upcoming macro events and geopolitical overlays argue for selective rather than aggressive risk-taking.",
      drivers: [
        "US equity trends remain positive with improving breadth.",
        "USD softness supports global risk assets and duration-sensitive leaders.",
        "Volatility is contained enough for swing setups to work.",
      ],
      alerts: [
        "Event risk is dense over the next week, so confirmation after major data prints matters.",
        "Keep semicap and AI concentration in check despite strong opportunity scores.",
      ],
    };
  }

  if (total >= 0) {
    return {
      name: "Balanced Transition",
      stance: "Balanced",
      confidence: 64,
      explanation:
        "Market internals are mixed and leadership is narrower, so capital preservation and high-selectivity matter more than broad risk appetite.",
      drivers: [
        "Some trend resilience remains, but breadth is not fully supportive.",
        "Macro and geopolitical inputs are offsetting one another.",
      ],
      alerts: [
        "Use smaller sizing and wait for technical confirmation.",
        "Favor hedges and lower-beta expressions until signals improve.",
      ],
    };
  }

  return {
    name: "Defensive Stress",
    stance: "Defensive",
    confidence: 72,
    explanation:
      "Weak breadth, higher volatility, and worsening macro or geopolitical pressure require a capital-preservation regime until price action improves.",
    drivers: [
      "Risk appetite is deteriorating across index trend and volatility measures.",
      "Macro and policy stress are dominating factor leadership.",
    ],
    alerts: ["Avoid forcing new longs.", "Rotate to hedges, cash, and lower-correlation exposures."],
  };
}
