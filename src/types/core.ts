export type TradeDirection = "LONG" | "SHORT";
export type TradeStatus = "OPEN" | "CLOSED" | "WATCHLIST";
export type Severity = "Low" | "Moderate" | "High" | "Critical";
export type RiskDecision = "APPROVE" | "REDUCE" | "REJECT";
export type SettingsProfile = "conservative" | "balanced" | "aggressive";
export type HoldingHorizon = "intraday" | "swing" | "position";
export type AssetUniversePreference =
  | "US stocks"
  | "ETFs"
  | "gold proxy"
  | "energy proxy"
  | "bond proxy"
  | "crypto proxy";
export type AgentName =
  | "News Agent"
  | "Macro/Geopolitics Agent"
  | "Opportunity Agent"
  | "Risk Officer Agent";

export type FactorKey =
  | "momentum"
  | "trendStructure"
  | "relativeStrength"
  | "volatilityQuality"
  | "valuationSanity"
  | "macroFit"
  | "geopoliticalFit"
  | "liquidity"
  | "catalystStrength";

export type RegimePosture = "aggressive" | "balanced" | "defensive" | "high cash";
export type MajorIndexTrend = "bullish" | "mixed" | "bearish";
export type VolatilityState = "calm" | "elevated" | "stressed";
export type GoldBehavior = "breaking-out" | "stable" | "weakening";
export type OilBehavior = "rising" | "stable" | "falling";
export type BreadthState = "strong" | "mixed" | "weak";

export type GeopoliticalCategory =
  | "war/conflict"
  | "sanctions"
  | "tariffs/trade war"
  | "elections/political instability"
  | "shipping/logistics disruption"
  | "energy shock"
  | "cyber/regulatory shock";

export type GeopoliticalTransmissionChannel =
  | "inflation"
  | "growth"
  | "rates"
  | "commodities"
  | "currencies"
  | "earnings"
  | "supplyChain"
  | "riskSentiment";

export type TransmissionImpactDirection = "higher" | "lower" | "mixed";

export type GeopoliticalActionSuggestion =
  | "no action"
  | "monitor"
  | "reduce risk"
  | "raise cash"
  | "add hedge"
  | "avoid sector";

export type MacroCategory =
  | "Inflation"
  | "Rates"
  | "Central Bank"
  | "Labor"
  | "Growth"
  | "Recession Risk"
  | "Bonds"
  | "USD"
  | "Liquidity";

export type MacroTone = "supportive" | "mixed" | "cautious";
export type MacroIndicatorDirection =
  | "cooling"
  | "rising"
  | "stable"
  | "weakening"
  | "firming"
  | "elevated"
  | "easing"
  | "tightening";

export type AllocationBucketKey = "core" | "tactical" | "hedge" | "cash";
export type ExposureDimension = "sector" | "theme" | "asset class" | "region";
export type OverUnderweightStatus = "underweight" | "overweight" | "neutral";
export type PriorityTag = "High" | "Medium" | "Low";
export type JournalBehaviorTag =
  | "oversized-trade"
  | "early-exit"
  | "missed-stop"
  | "overtrading"
  | "followed-plan"
  | "rule-break";
