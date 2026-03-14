import { defaultFactorWeights } from "@/mock-data";
import type { AssetSignalInput, FactorKey, FactorScore, FactorWeightConfig } from "@/types";
import { clamp } from "@/lib/utils";

const factorLabels: Record<FactorKey, string> = {
  momentum: "Momentum",
  trendStructure: "Trend",
  relativeStrength: "Relative Strength",
  volatilityQuality: "Volatility Quality",
  valuationSanity: "Valuation Sanity",
  macroFit: "Macro Fit",
  geopoliticalFit: "Geopolitical Fit",
  liquidity: "Liquidity",
  catalystStrength: "Catalyst",
};

function rationaleForFactor(key: FactorKey, score: number) {
  if (score >= 80) return `${factorLabels[key]} is acting as a tailwind.`;
  if (score >= 60) return `${factorLabels[key]} is supportive but not elite.`;
  if (score >= 40) return `${factorLabels[key]} is mixed and needs confirmation.`;
  return `${factorLabels[key]} is a material drag on the setup.`;
}

export function computeFactorBreakdown(
  asset: AssetSignalInput,
  weights: FactorWeightConfig = defaultFactorWeights,
): FactorScore[] {
  const entries: Array<[FactorKey, number]> = [
    ["momentum", asset.momentum],
    ["trendStructure", asset.trendStructure],
    ["relativeStrength", asset.relativeStrength],
    ["volatilityQuality", asset.volatilityQuality],
    ["valuationSanity", asset.valuationSanity],
    ["macroFit", asset.macroFit],
    ["geopoliticalFit", asset.geopoliticalFit],
    ["liquidity", asset.liquidity],
    ["catalystStrength", asset.catalystStrength],
  ];

  return entries.map(([key, score]) => ({
    key,
    label: factorLabels[key],
    score,
    weight: weights[key],
    contribution: score * weights[key],
    rationale: rationaleForFactor(key, score),
  }));
}

export function computeOpportunityScore(
  asset: AssetSignalInput,
  weights: FactorWeightConfig = defaultFactorWeights,
) {
  const breakdown = computeFactorBreakdown(asset, weights);
  const rawScore = breakdown.reduce((sum, factor) => sum + factor.contribution, 0);
  return {
    breakdown,
    score: Math.round(clamp(rawScore, 0, 100)),
  };
}
