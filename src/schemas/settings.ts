import { z } from "zod";

export const alertThresholdsSchema = z.object({
  openRiskPct: z.number().min(0).max(100),
  singlePositionPct: z.number().min(0).max(100),
  volatilityAlertLevel: z.number().min(0),
  macroSeverityMinimum: z.enum(["Low", "Moderate", "High", "Critical"]),
});

export const userSettingsSchema = z.object({
  id: z.string().min(1).default("default"),
  totalCapital: z.number().positive(),
  reportingCurrency: z.string().min(1).default("AED"),
  cashAed: z.number().min(0),
  maxRiskPerTradePct: z.number().positive(),
  maxPortfolioOpenRiskPct: z.number().positive(),
  maxDrawdownThresholdPct: z.number().positive(),
  maxSinglePositionPct: z.number().positive(),
  maxSectorExposurePct: z.number().positive(),
  maxCorrelationClusterPct: z.number().positive(),
  preferredHoldingHorizon: z.enum(["intraday", "swing", "position"]),
  preferredAssetUniverse: z.array(
    z.enum(["US stocks", "ETFs", "gold proxy", "energy proxy", "bond proxy", "crypto proxy"]),
  ),
  alertThresholds: alertThresholdsSchema,
  profile: z.enum(["conservative", "balanced", "aggressive"]),
});

export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
