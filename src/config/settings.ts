import type { AssetUniversePreference, SettingsProfile, SettingsProfileGuidance, UserSettings } from "@/types";

type SettingsProfilePreset = Pick<
  UserSettings,
  | "maxRiskPerTradePct"
  | "maxPortfolioOpenRiskPct"
  | "maxDrawdownThresholdPct"
  | "maxSinglePositionPct"
  | "maxSectorExposurePct"
  | "maxCorrelationClusterPct"
>;

export const assetUniverseOptions: AssetUniversePreference[] = [
  "US stocks",
  "ETFs",
  "gold proxy",
  "energy proxy",
  "bond proxy",
  "crypto proxy",
];

export const settingsProfileGuidance: SettingsProfileGuidance[] = [
  {
    profile: "conservative",
    summary: "Lower gross exposure, higher hedge tolerance, and tighter open-risk discipline.",
    focus: "Capital preservation and steady compounding",
  },
  {
    profile: "balanced",
    summary: "Selective risk-on with explicit hedges and event-aware sizing.",
    focus: "Institutional-style swing allocation",
  },
  {
    profile: "aggressive",
    summary: "Higher tactical participation with reduced cash drag when regime conditions are supportive.",
    focus: "Leadership capture with tighter execution discipline",
  },
];

export const settingsProfilePresets: Record<SettingsProfile, SettingsProfilePreset> = {
  conservative: {
    maxRiskPerTradePct: 0.7,
    maxPortfolioOpenRiskPct: 4,
    maxDrawdownThresholdPct: 7,
    maxSinglePositionPct: 12,
    maxSectorExposurePct: 22,
    maxCorrelationClusterPct: 28,
  },
  balanced: {
    maxRiskPerTradePct: 1,
    maxPortfolioOpenRiskPct: 5.5,
    maxDrawdownThresholdPct: 10,
    maxSinglePositionPct: 16,
    maxSectorExposurePct: 28,
    maxCorrelationClusterPct: 34,
  },
  aggressive: {
    maxRiskPerTradePct: 1.4,
    maxPortfolioOpenRiskPct: 7,
    maxDrawdownThresholdPct: 13,
    maxSinglePositionPct: 20,
    maxSectorExposurePct: 34,
    maxCorrelationClusterPct: 42,
  },
};
