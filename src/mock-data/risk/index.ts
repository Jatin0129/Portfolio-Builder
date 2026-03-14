import { assetUniverseOptions } from "@/config/settings";
import type { DashboardAlert, RiskItem, UserSettings } from "@/types";

export const defaultUserSettings: UserSettings = {
  id: "default",
  totalCapital: 1250000,
  reportingCurrency: "AED",
  cashAed: 180000,
  maxRiskPerTradePct: 1,
  maxPortfolioOpenRiskPct: 5.5,
  maxDrawdownThresholdPct: 10,
  maxSinglePositionPct: 16,
  maxSectorExposurePct: 28,
  maxCorrelationClusterPct: 34,
  preferredHoldingHorizon: "swing",
  preferredAssetUniverse: assetUniverseOptions,
  alertThresholds: {
    openRiskPct: 4.8,
    singlePositionPct: 14,
    volatilityAlertLevel: 22,
    macroSeverityMinimum: "High",
  },
  profile: "balanced",
};

export const riskSettings: UserSettings = {
  ...defaultUserSettings,
};

export const alerts: DashboardAlert[] = [
  {
    id: "alert-1",
    title: "Event cluster inside 72 hours",
    type: "macro",
    message: "US CPI, the FOMC, and a 10Y auction all arrive in the same tactical window. Fresh high-beta risk should stay selective.",
  },
  {
    id: "alert-2",
    title: "AI cluster nearing tolerance band",
    type: "risk",
    message: "Existing semiconductor, software, and crypto-beta exposure is close to the correlation threshold defined in settings.",
  },
  {
    id: "alert-3",
    title: "Gold and duration hedges remain useful",
    type: "catalyst",
    message: "Real-yield sensitivity and geopolitical stress still justify keeping GLD and TLT near working size.",
  },
  {
    id: "alert-4",
    title: "Crypto proxy risk on watch",
    type: "risk",
    message: "IBIT and high-beta tech are moving together enough that crypto adds should be funded, not layered on top.",
  },
];

export const topRisks: RiskItem[] = [
  {
    id: "risk-1",
    title: "Higher-for-longer rates shock",
    severity: "Critical",
    explanation: "A hawkish Fed path would pressure long-duration equities, crypto proxies, and crowded growth leadership simultaneously.",
  },
  {
    id: "risk-2",
    title: "Trade and shipping shock spills into inflation",
    severity: "High",
    explanation: "Any escalation in logistics or energy routes would reprice inflation expectations and hurt cyclicals plus consumer sensitivity.",
  },
  {
    id: "risk-3",
    title: "Crowded AI leadership unwinds",
    severity: "High",
    explanation: "Semiconductor, software, and crypto-beta leadership is strong, but a factor unwind would ripple through multiple portfolio sleeves.",
  },
  {
    id: "risk-4",
    title: "Growth scare broadens beyond manufacturing",
    severity: "Moderate",
    explanation: "If labor and consumer data soften together, the tape could rotate harder toward defensives and duration hedges.",
  },
];
