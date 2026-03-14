import type { FactorWeightConfig } from "@/types";

export const defaultFactorWeights: FactorWeightConfig = {
  momentum: 0.14,
  trendStructure: 0.14,
  relativeStrength: 0.12,
  volatilityQuality: 0.08,
  valuationSanity: 0.07,
  macroFit: 0.14,
  geopoliticalFit: 0.1,
  liquidity: 0.08,
  catalystStrength: 0.13,
};
