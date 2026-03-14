import type { AssetUniversePreference, HoldingHorizon, SettingsProfile, Severity } from "@/types/core";

export interface AlertThresholds {
  openRiskPct: number;
  singlePositionPct: number;
  volatilityAlertLevel: number;
  macroSeverityMinimum: Severity;
}

export interface UserSettings {
  id: string;
  totalCapital: number;
  reportingCurrency: string;
  cashAed: number;
  maxRiskPerTradePct: number;
  maxPortfolioOpenRiskPct: number;
  maxDrawdownThresholdPct: number;
  maxSinglePositionPct: number;
  maxSectorExposurePct: number;
  maxCorrelationClusterPct: number;
  preferredHoldingHorizon: HoldingHorizon;
  preferredAssetUniverse: AssetUniversePreference[];
  alertThresholds: AlertThresholds;
  profile: SettingsProfile;
}

export interface SettingsProfileGuidance {
  profile: SettingsProfile;
  summary: string;
  focus: string;
}
