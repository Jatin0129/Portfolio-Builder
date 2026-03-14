import type {
  BreadthState,
  GeopoliticalActionSuggestion,
  GeopoliticalCategory,
  GeopoliticalTransmissionChannel,
  GoldBehavior,
  MacroCategory,
  MacroIndicatorDirection,
  MacroTone,
  MajorIndexTrend,
  OilBehavior,
  RegimePosture,
  Severity,
  TransmissionImpactDirection,
  VolatilityState,
} from "@/types/core";

export interface Asset {
  ticker: string;
  name: string;
  assetClass: string;
  region: string;
  sector: string;
  currency: string;
  price: number;
  changePct: number;
}

export interface MarketIndex {
  name: string;
  ticker: string;
  level: number;
  changePct: number;
  trend: "up" | "flat" | "down";
}

export interface MarketSummary {
  indices: MarketIndex[];
  majorIndexTrend: MajorIndexTrend;
  usdTrend: "up" | "flat" | "down";
  bondYieldDirection: "up" | "flat" | "down";
  goldBehavior: GoldBehavior;
  oilBehavior: OilBehavior;
  volatilityState: VolatilityState;
  vix: number;
  breadthPct: number;
  macroEventFlags: {
    inflationRisk: boolean;
    centralBankRisk: boolean;
    growthRisk: boolean;
    liquidityRisk: boolean;
  };
  geopoliticalSeverity: Severity;
}

export interface RegimeInput {
  majorIndexTrend: MajorIndexTrend;
  bondYieldDirection: "up" | "flat" | "down";
  goldBehavior: GoldBehavior;
  oilBehavior: OilBehavior;
  usdTrend: "up" | "flat" | "down";
  volatilityState: VolatilityState;
  marketBreadth: BreadthState;
  macroEventFlags: {
    inflationRisk: boolean;
    centralBankRisk: boolean;
    growthRisk: boolean;
    liquidityRisk: boolean;
  };
  geopoliticalSeverity: Severity;
}

export interface RegimeSignalBreakdown {
  signal: string;
  state: string;
  score: number;
  impact: "tailwind" | "neutral" | "headwind";
  explanation: string;
}

export interface TransmissionChannelImpact {
  channel: GeopoliticalTransmissionChannel;
  direction: TransmissionImpactDirection;
  intensity: number;
  explanation: string;
}

export interface GeopoliticalEvent {
  id: string;
  title: string;
  category: GeopoliticalCategory;
  region: string;
  severity: Severity;
  severityScore: number;
  status: string;
  affectedRegions: string[];
  transmissionChannels: TransmissionChannelImpact[];
  beneficiaries: string[];
  losers: string[];
  actionSuggestion: GeopoliticalActionSuggestion;
  chips: string[];
  implication: string;
}

export interface GeopoliticalBoardSummary {
  headline: string;
  overlaySeverity: Severity;
  overlayScore: number;
  activeCount: number;
  posture: string;
  dominantChannels: string[];
  actionBias: string[];
}

export interface GeopoliticalBoard {
  asOf: string;
  summary: GeopoliticalBoardSummary;
  events: GeopoliticalEvent[];
}

export interface MacroEvent {
  id: string;
  title: string;
  region: string;
  date: string;
  severity: Severity;
  severityScore: number;
  category: MacroCategory;
  consensus: string;
  implication: string;
  watchFor: string;
  explanation: string;
}

export interface MacroIndicatorState {
  key: string;
  label: string;
  direction: MacroIndicatorDirection;
  score: number;
  explanation: string;
}

export interface MacroState {
  asOf: string;
  inflation: MacroIndicatorState;
  rates: MacroIndicatorState;
  centralBankSignals: MacroIndicatorState;
  laborData: MacroIndicatorState;
  growthIndicators: MacroIndicatorState;
  recessionStress: MacroIndicatorState;
  bondYields: MacroIndicatorState;
  usdEnvironment: MacroIndicatorState;
  summarySignals: string[];
}

export interface MacroSummary {
  tone: MacroTone;
  headline: string;
  bullets: string[];
  explanation: string;
}

export interface MacroFitScore {
  score: number;
  label: string;
  reasons: string[];
}

export interface GeopoliticalFitScore {
  score: number;
  label: string;
  reasons: string[];
}

export interface RegimeFitScore {
  score: number;
  label: string;
  reasons: string[];
}

export interface MacroCalendarItem {
  id: string;
  date: string;
  title: string;
  region: string;
  category: MacroCategory;
  severity: Severity;
  severityScore: number;
  consensus: string;
  watchFor: string;
  explanation: string;
}

export interface MacroCalendarViewModel {
  asOf: string;
  headline: string;
  highlights: string[];
  items: MacroCalendarItem[];
}

export interface CatalystItem {
  id: string;
  asset: string;
  title: string;
  date: string;
  severity: Severity;
  impact: string;
}

export interface SectorHeatmapItem {
  sector: string;
  performance1W: number;
  performance1M: number;
  regimeFit: number;
}

export interface RegimeSnapshot {
  label: string;
  name: string;
  stance: "Risk-On" | "Balanced" | "Defensive";
  posture: RegimePosture;
  confidence: number;
  explanation: string;
  drivers: string[];
  alerts: string[];
  signals: RegimeSignalBreakdown[];
}
