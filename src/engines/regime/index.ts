import type {
  AssetSignalInput,
  BreadthState,
  GeopoliticalBoard,
  RegimeInput,
  RegimeFitScore,
  RegimePosture,
  RegimeSignalBreakdown,
  RegimeSnapshot,
  Severity,
} from "@/types";
import { clamp } from "@/lib/utils";

const signalWeights = {
  majorIndexTrend: { bullish: 3, mixed: 0, bearish: -3 },
  bondYieldDirection: { down: 2, flat: 1, up: -2 },
  goldBehavior: { "breaking-out": -1, stable: 0, weakening: 1 },
  oilBehavior: { rising: -2, stable: 0, falling: 1 },
  usdTrend: { down: 2, flat: 0, up: -2 },
  volatilityState: { calm: 3, elevated: -1, stressed: -4 },
  marketBreadth: { strong: 3, mixed: 0, weak: -3 },
} as const;

const macroPenaltyWeights = {
  inflationRisk: -1,
  centralBankRisk: -1,
  growthRisk: -2,
  liquidityRisk: -1,
} as const;

const geopoliticalPenalty: Record<Severity, number> = {
  Low: 0,
  Moderate: -1,
  High: -2,
  Critical: -4,
};

function buildSignal(
  signal: string,
  state: string,
  score: number,
  positiveCopy: string,
  negativeCopy: string,
): RegimeSignalBreakdown {
  return {
    signal,
    state,
    score,
    impact: score > 0 ? "tailwind" : score < 0 ? "headwind" : "neutral",
    explanation: score >= 0 ? positiveCopy : negativeCopy,
  };
}

function postureFromScore(score: number): RegimePosture {
  if (score >= 6) return "aggressive";
  if (score >= 1) return "balanced";
  if (score >= -4) return "defensive";
  return "high cash";
}

function stanceFromPosture(posture: RegimePosture): RegimeSnapshot["stance"] {
  if (posture === "aggressive") return "Risk-On";
  if (posture === "balanced") return "Balanced";
  return "Defensive";
}

function labelFromPosture(posture: RegimePosture) {
  switch (posture) {
    case "aggressive":
      return "Constructive Expansion";
    case "balanced":
      return "Selective Risk-On";
    case "defensive":
      return "Defensive Rotation";
    default:
      return "Capital Preservation";
  }
}

function breadthStateFromScore(breadth: BreadthState) {
  return breadth === "strong" ? "healthy participation" : breadth === "mixed" ? "mixed participation" : "weak participation";
}

function buildExplanation(posture: RegimePosture, drivers: string[], alerts: string[]) {
  const tone =
    posture === "aggressive"
      ? "Risk appetite is broadly supported across trend, liquidity, and internal participation."
      : posture === "balanced"
        ? "The backdrop still supports selective risk-taking, but event and cross-asset conflict argue against full aggression."
        : posture === "defensive"
          ? "Several inputs are deteriorating, so capital should be deployed selectively with tighter controls."
          : "Too many risk signals are stacked against new exposure, so preserving cash and optionality is the priority.";

  return `${tone} ${drivers[0] ?? ""} ${alerts[0] ?? ""}`.trim();
}

function buildDriversAndAlerts(signals: RegimeSignalBreakdown[], posture: RegimePosture) {
  const positive = signals.filter((signal) => signal.score > 0).sort((a, b) => b.score - a.score);
  const negative = signals.filter((signal) => signal.score < 0).sort((a, b) => a.score - b.score);

  const drivers = positive.slice(0, 3).map((signal) => signal.explanation);
  const alerts = negative.slice(0, 3).map((signal) => signal.explanation);

  if (posture === "aggressive" && alerts.length === 0) {
    alerts.push("Macro and geopolitical penalties are contained enough to allow standard risk deployment.");
  }

  if (posture === "high cash" && drivers.length === 0) {
    drivers.push("Only isolated pockets of strength remain and they are not broad enough to justify aggressive exposure.");
  }

  return { drivers, alerts };
}

export function classifyRegime(input: RegimeInput): RegimeSnapshot {
  const baseSignals: RegimeSignalBreakdown[] = [
    buildSignal(
      "Major index trend",
      input.majorIndexTrend,
      signalWeights.majorIndexTrend[input.majorIndexTrend],
      "Major indices remain in a supportive trend structure.",
      "Major index trend is deteriorating and reduces directional conviction.",
    ),
    buildSignal(
      "Bond yields",
      input.bondYieldDirection,
      signalWeights.bondYieldDirection[input.bondYieldDirection],
      "Bond yields are not pressuring the current leadership complex.",
      "Higher yields are working against equity and duration-sensitive setups.",
    ),
    buildSignal(
      "Gold behavior",
      input.goldBehavior,
      signalWeights.goldBehavior[input.goldBehavior],
      "Gold is not demanding an immediate defensive pivot.",
      "Gold strength is signaling a defensive undercurrent beneath the surface.",
    ),
    buildSignal(
      "Oil behavior",
      input.oilBehavior,
      signalWeights.oilBehavior[input.oilBehavior],
      "Oil is not adding inflation pressure to the regime.",
      "Oil behavior is adding inflation and policy pressure.",
    ),
    buildSignal(
      "USD trend",
      input.usdTrend,
      signalWeights.usdTrend[input.usdTrend],
      "USD weakness supports global liquidity and risk appetite.",
      "USD strength is tightening the backdrop for global risk assets.",
    ),
    buildSignal(
      "Volatility",
      input.volatilityState,
      signalWeights.volatilityState[input.volatilityState],
      "Volatility is contained enough for swing setups to behave constructively.",
      "Volatility is elevated enough to warrant tighter risk and lower conviction.",
    ),
    buildSignal(
      "Market breadth",
      input.marketBreadth,
      signalWeights.marketBreadth[input.marketBreadth],
      `Market breadth shows ${breadthStateFromScore(input.marketBreadth)}.`,
      `Market breadth shows ${breadthStateFromScore(input.marketBreadth)} and weakens participation quality.`,
    ),
  ];

  const macroPenalty = Object.entries(input.macroEventFlags).reduce((sum, [flag, active]) => {
    if (!active) return sum;
    return sum + macroPenaltyWeights[flag as keyof typeof macroPenaltyWeights];
  }, 0);

  const macroSignal = buildSignal(
    "Macro event flags",
    `${Object.values(input.macroEventFlags).filter(Boolean).length} active`,
    macroPenalty,
    "Macro event risk is manageable and not a major regime drag.",
    "Macro event clustering is increasing the probability of sharp cross-asset repricing.",
  );

  const geoSignal = buildSignal(
    "Geopolitical severity",
    input.geopoliticalSeverity,
    geopoliticalPenalty[input.geopoliticalSeverity],
    "Geopolitical stress is not dominant enough to override price action.",
    "Geopolitical stress is elevated enough to cap aggression and require hedging discipline.",
  );

  const signals = [...baseSignals, macroSignal, geoSignal];
  const totalScore = signals.reduce((sum, signal) => sum + signal.score, 0);
  const conflicts = signals.filter((signal) => signal.score === 0).length;
  const posture = postureFromScore(totalScore);
  const { drivers, alerts } = buildDriversAndAlerts(signals, posture);
  const confidence = Math.max(38, Math.min(92, 56 + Math.abs(totalScore) * 4 - conflicts * 2));
  const label = labelFromPosture(posture);

  return {
    label,
    name: label,
    stance: stanceFromPosture(posture),
    posture,
    confidence,
    explanation: buildExplanation(posture, drivers, alerts),
    drivers,
    alerts,
    signals,
  };
}

function hasTheme(asset: AssetSignalInput, pattern: string) {
  const lowered = pattern.toLowerCase();
  return asset.themes.some((theme) => theme.toLowerCase().includes(lowered));
}

export function scoreAssetRegimeFit(
  asset: AssetSignalInput,
  regime: RegimeSnapshot,
  geopoliticalBoard?: GeopoliticalBoard,
): RegimeFitScore {
  let score = 55;
  const reasons: string[] = [];

  switch (regime.posture) {
    case "aggressive":
      if (asset.allocationBucket === "core") {
        score += 8;
        reasons.push("Aggressive regime posture supports core participation ideas.");
      } else if (asset.allocationBucket === "tactical") {
        score += 10;
        reasons.push("Aggressive regime posture supports tactical beta and leadership exposure.");
      } else {
        score -= 10;
        reasons.push("Aggressive regime posture reduces the need for large hedge allocations.");
      }
      break;
    case "balanced":
      if (asset.allocationBucket === "core") {
        score += 7;
        reasons.push("Balanced posture still favors durable core exposure.");
      } else if (asset.allocationBucket === "tactical") {
        score += 3;
        reasons.push("Balanced posture allows tactical adds, but only selectively.");
      } else {
        score += 6;
        reasons.push("Balanced posture still benefits from keeping explicit hedges in the mix.");
      }
      break;
    case "defensive":
      if (asset.allocationBucket === "hedge") {
        score += 12;
        reasons.push("Defensive posture increases the value of hedge sleeves.");
      } else if (asset.allocationBucket === "core") {
        score += 2;
        reasons.push("Defensive posture still allows some high-quality core exposure.");
      } else {
        score -= 8;
        reasons.push("Defensive posture argues against aggressive tactical risk-taking.");
      }
      break;
    default:
      if (asset.allocationBucket === "hedge") {
        score += 10;
        reasons.push("High-cash posture prioritizes capital preservation and hedges.");
      } else if (asset.allocationBucket === "tactical") {
        score -= 12;
        reasons.push("High-cash posture strongly penalizes tactical additions.");
      } else {
        score -= 4;
        reasons.push("High-cash posture lowers appetite for even core exposure.");
      }
      break;
  }

  if (hasTheme(asset, "ai") || asset.sector === "Semiconductors" || asset.sector === "Servers") {
    if (regime.posture === "aggressive") {
      score += 7;
      reasons.push("Leadership and AI-linked exposure fit a supportive risk-on regime.");
    } else if (regime.posture === "balanced") {
      score += 3;
      reasons.push("AI leadership remains acceptable in a balanced regime, but with selectivity.");
    } else {
      score -= 7;
      reasons.push("Leadership beta is less aligned when the regime turns defensive.");
    }
  }

  if (asset.sector === "Precious Metals" || hasTheme(asset, "defensive") || hasTheme(asset, "gold")) {
    if (regime.posture === "defensive" || regime.posture === "high cash") {
      score += 8;
      reasons.push("Defensive and gold-linked exposure is more useful when regime stress rises.");
    } else if (regime.posture === "aggressive") {
      score -= 3;
      reasons.push("Heavy hedge exposure is a mild drag when the regime is fully constructive.");
    }
  }

  if (asset.sector === "Industrials" || hasTheme(asset, "cyclical") || hasTheme(asset, "infrastructure")) {
    if (regime.posture === "aggressive" || regime.posture === "balanced") {
      score += 5;
      reasons.push("Cyclical participation fits better while the regime still allows selective risk-taking.");
    } else {
      score -= 5;
      reasons.push("Cyclicals lose regime fit when posture shifts defensive.");
    }
  }

  if (hasTheme(asset, "rate sensitive") || hasTheme(asset, "high beta")) {
    const yieldHeadwind = regime.alerts.some((alert) =>
      alert.toLowerCase().includes("yield") || alert.toLowerCase().includes("volatility"),
    );
    if (yieldHeadwind) {
      score -= 5;
      reasons.push("Rate-sensitive or high-beta themes are less attractive under current regime alerts.");
    }
  }

  if (geopoliticalBoard && geopoliticalBoard.summary.overlayScore >= 80) {
    if (asset.allocationBucket === "hedge") {
      score += 6;
      reasons.push("Elevated geopolitical overlay strengthens the case for hedge-oriented assets.");
    } else if (asset.allocationBucket === "tactical") {
      score -= 4;
      reasons.push("Elevated geopolitical overlay caps conviction in tactical exposure.");
    }
  }

  const finalScore = Math.round(clamp(score, 20, 95));

  return {
    score: finalScore,
    label:
      finalScore >= 75 ? "Strong regime fit" : finalScore >= 60 ? "Supportive regime fit" : "Weak regime fit",
    reasons: reasons.slice(0, 4),
  };
}
