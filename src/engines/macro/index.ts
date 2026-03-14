import { clamp } from "@/lib/utils";
import type {
  AssetSignalSeed,
  CatalystItem,
  MacroCalendarViewModel,
  MacroEvent,
  MacroFitScore,
  MacroState,
  MacroSummary,
  SectorHeatmapItem,
} from "@/types";

function hasTheme(asset: AssetSignalSeed, pattern: string) {
  const lowered = pattern.toLowerCase();
  return asset.themes.some((theme) => theme.toLowerCase().includes(lowered));
}

export function getMacroEvents(events: MacroEvent[]) {
  return events;
}

export function getMacroState(state: MacroState): MacroState {
  return state;
}

export function getMacroSummary(state: MacroState): MacroSummary {
  const tone = state.growthIndicators.score >= 50 && state.bondYields.score >= 50 ? "supportive" : "mixed";
  const cautiousTone =
    state.centralBankSignals.direction === "elevated" || state.recessionStress.score <= 40;

  return {
    tone: cautiousTone ? "cautious" : tone,
    headline: "Disinflation is improving, but yields and policy communication still cap full aggression.",
    bullets: [...state.summarySignals],
    explanation:
      "Macro conditions still allow selective risk-taking, yet yields rising and policy uncertainty elevated keep the market from becoming a clean all-clear.",
  };
}

export function getMacroCalendarViewModel(
  events: MacroEvent[],
  state: MacroState,
): MacroCalendarViewModel {
  const items = [...events].sort((a, b) => {
    if (a.date === b.date) return b.severityScore - a.severityScore;
    return a.date.localeCompare(b.date);
  });

  return {
    asOf: state.asOf,
    headline: "Macro calendar stays dense across inflation, Fed guidance, labor, and bond-market tone.",
    highlights: items.slice(0, 3).map((item) => `${item.title}: ${item.watchFor}`),
    items: items.map((item) => ({
      id: item.id,
      date: item.date,
      title: item.title,
      region: item.region,
      category: item.category,
      severity: item.severity,
      severityScore: item.severityScore,
      consensus: item.consensus,
      watchFor: item.watchFor,
      explanation: item.explanation,
    })),
  };
}

export function getCatalysts(catalysts: CatalystItem[]): CatalystItem[] {
  return catalysts;
}

export function getSectorHeatmap(sectorHeatmap: SectorHeatmapItem[]): SectorHeatmapItem[] {
  return sectorHeatmap;
}

export function scoreAssetMacroFit(asset: AssetSignalSeed, state: MacroState): MacroFitScore {
  let score = 55;
  const reasons: string[] = [];

  if (state.inflation.direction === "cooling") {
    if (
      hasTheme(asset, "ai") ||
      hasTheme(asset, "quality growth") ||
      asset.sector === "Software" ||
      asset.sector === "Semiconductors" ||
      asset.sector === "Internet"
    ) {
      score += 9;
      reasons.push("Inflation cooling supports long-duration growth and valuation stability.");
    }

    if (asset.sector === "Precious Metals") {
      score += 3;
      reasons.push("Cooling inflation helps preserve the hedge case without forcing a growth shock.");
    }
  }

  if (state.bondYields.direction === "rising") {
    if (
      hasTheme(asset, "rate sensitive") ||
      asset.sector === "Clean Energy" ||
      asset.sector === "Autos" ||
      asset.sector === "Crypto Proxy"
    ) {
      score -= 12;
      reasons.push("Yields rising pressure rate-sensitive growth and financing-heavy themes.");
    }

    if (asset.sector === "Precious Metals") {
      score -= 4;
      reasons.push("Rising yields are a partial drag on gold if real rates stay firm.");
    }
  }

  if (state.growthIndicators.direction === "weakening") {
    if (hasTheme(asset, "global cyclicals") || asset.sector === "Industrials" || asset.sector === "Small Caps") {
      score -= 6;
      reasons.push("Growth weakening argues for more selectivity in cyclical participation.");
    }

    if (hasTheme(asset, "defensive") || asset.sector === "Precious Metals" || asset.sector === "Health Care") {
      score += 8;
      reasons.push("Growth weakening lifts the value of defensive and hedge exposures.");
    }
  }

  if (state.centralBankSignals.direction === "elevated") {
    if (asset.allocationBucket === "hedge") {
      score += 8;
      reasons.push("Policy uncertainty elevated favors explicit hedge sleeves.");
    } else {
      score -= 3;
      reasons.push("Policy uncertainty elevated argues against oversized high-beta additions.");
    }
  }

  if (state.usdEnvironment.direction === "easing") {
    if (asset.region !== "United States" || hasTheme(asset, "global cyclicals") || asset.sector === "Energy Proxy") {
      score += 5;
      reasons.push("A softer USD supports global liquidity and non-US or cyclical breadth.");
    }
  }

  if (asset.sector === "Semiconductors" || hasTheme(asset, "ai")) {
    score += 4;
    reasons.push("Capex-heavy AI leadership remains one of the cleaner growth pockets in the current macro tape.");
  }

  const finalScore = Math.round(clamp(score, 20, 95));

  return {
    score: finalScore,
    label: finalScore >= 75 ? "Strong fit" : finalScore >= 60 ? "Supportive fit" : "Mixed fit",
    reasons: reasons.slice(0, 4),
  };
}
