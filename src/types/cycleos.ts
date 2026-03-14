export type TradeDirection = "LONG" | "SHORT";
export type TradeStatus = "OPEN" | "CLOSED" | "WATCHLIST";
export type Severity = "Low" | "Moderate" | "High" | "Critical";
export type RiskDecision = "APPROVE" | "REDUCE" | "REJECT";
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

export interface FactorWeightConfig {
  momentum: number;
  trendStructure: number;
  relativeStrength: number;
  volatilityQuality: number;
  valuationSanity: number;
  macroFit: number;
  geopoliticalFit: number;
  liquidity: number;
  catalystStrength: number;
}

export interface FactorScore {
  key: FactorKey;
  label: string;
  score: number;
  weight: number;
  contribution: number;
  rationale: string;
}

export interface TechnicalSetup {
  timeframe: string;
  pattern: string;
  trigger: string;
  invalidation: string;
  support: number;
  resistance: number;
}

export interface TechnicalInsight {
  setupExplanation: string;
  confirmationSignals: string[];
}

export interface ExecutionPlan {
  entryZone: string;
  addZone: string;
  stop: string;
  targetOne: string;
  targetTwo: string;
  timeframe: string;
  steps: string[];
}

export interface TradeInsightSummary {
  ticker: string;
  action: TradeDirection;
  confidence: number;
  score: number;
  timeHorizon: string;
  entryZone: string;
  stopLoss: string;
  targetOne: string;
  targetTwo: string;
  positionSize: string;
  aedRisk: number;
}

export interface TradeWhy {
  shortThesis: string;
  regimeFit: string;
}

export interface PortfolioFit {
  role: string;
  diversificationImpact: string;
  exposureOverlap: string;
  allocationSuggestionPct: number;
  overlapWithCurrentPortfolio: string;
  themeFit: string;
  hedgeValue: string;
}

export interface RiskVerdict {
  decision: RiskDecision;
  score: number;
  summary: string;
  explanation: string;
  messages: string[];
  approvedRiskAed: number;
  maxPositionAed: number;
}

export interface TradeInsight {
  summary: TradeInsightSummary;
  whyThisTrade: TradeWhy;
  technical: TechnicalInsight;
  executionSteps: string[];
}

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

export interface AssetSignalSeed extends Asset {
  themes: string[];
  allocationBucket: Exclude<AllocationBucketKey, "cash">;
  momentum: number;
  trendStructure: number;
  relativeStrength: number;
  volatilityQuality: number;
  valuationSanity: number;
  liquidity: number;
  catalystStrength: number;
  averageVolumeLabel: string;
  technicalSetup: TechnicalSetup;
  technicalInsight: TechnicalInsight;
  executionPlan: ExecutionPlan;
  catalyst: string;
  direction: TradeDirection;
  stopDistancePct: number;
  conviction: number;
  shortThesis: string;
  regimeFitText: string;
}

export interface AssetSignalInput extends AssetSignalSeed {
  macroFit: number;
  geopoliticalFit: number;
  macroReasons: string[];
  geopoliticalReasons: string[];
}

export interface TradeIdea extends AssetSignalInput {
  factorBreakdown: FactorScore[];
  opportunityScore: number;
  portfolioFit: PortfolioFit;
  riskVerdict: RiskVerdict;
  insight: TradeInsight;
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

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  region: string;
  currency: string;
  themes: string[];
  allocationBucket: Exclude<AllocationBucketKey, "cash">;
  quantity: number;
  avgCost: number;
  marketPrice: number;
  marketValueAed: number;
  unrealizedPnlAed: number;
  weightPct: number;
  beta: number;
  correlationTag: string;
  stopDistancePct: number;
  openRiskAed: number;
}

export interface PortfolioWatchlistItem {
  id: string;
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  region: string;
  currency: string;
  themes: string[];
  priority: PriorityTag;
  targetEntry: string;
  thesis: string;
  candidateAllocationPct: number;
  candidateBucket: Exclude<AllocationBucketKey, "cash">;
}

export interface RiskSettings {
  portfolioValueAed: number;
  cashAed: number;
  maxRiskPerTradePct: number;
  maxPortfolioOpenRiskPct: number;
  maxSinglePositionPct: number;
  maxSectorExposurePct: number;
  maxCorrelationClusterPct: number;
}

export interface ConcentrationItem {
  label: string;
  exposurePct: number;
  thresholdPct: number;
  status: "OK" | "Watch" | "Breach";
}

export interface CorrelationCluster {
  tag: string;
  exposurePct: number;
  holdings: string[];
}

export interface AllocationSuggestion {
  label: string;
  action: "Increase" | "Trim" | "Hold";
  rationale: string;
}

export interface ExposureBreakdown {
  label: string;
  valueAed: number;
  weightPct: number;
}

export interface PortfolioExposures {
  sector: ExposureBreakdown[];
  theme: ExposureBreakdown[];
  assetClass: ExposureBreakdown[];
  region: ExposureBreakdown[];
}

export interface AllocationBucket {
  key: AllocationBucketKey;
  label: string;
  currentPct: number;
  targetPct: number;
  deltaPct: number;
  valueAed: number;
  rationale: string;
}

export interface SuggestedAllocationView {
  headline: string;
  buckets: AllocationBucket[];
}

export interface OverUnderweightItem {
  dimension: ExposureDimension;
  label: string;
  currentPct: number;
  targetPct: number;
  deltaPct: number;
  status: OverUnderweightStatus;
  rationale: string;
}

export interface PortfolioSummary {
  portfolioValueAed: number;
  investedAed: number;
  cashAed: number;
  dailyPnlAed: number;
  openRiskAed: number;
  openRiskPct: number;
  topExposure: string;
  allocationMix: { name: string; value: number }[];
}

export interface PortfolioRiskSnapshot {
  concentrationChecks: ConcentrationItem[];
  correlationClusters: CorrelationCluster[];
  suggestions: AllocationSuggestion[];
  totalOpenRiskAed: number;
  totalOpenRiskPct: number;
}

export interface PortfolioSnapshot {
  summary: PortfolioSummary;
  holdings: Holding[];
  watchlist: PortfolioWatchlistItem[];
  exposures: PortfolioExposures;
  overUnderweights: OverUnderweightItem[];
  suggestedAllocation: SuggestedAllocationView;
  risk: PortfolioRiskSnapshot;
  settings: RiskSettings;
}

export interface JournalEntry {
  id: string;
  ticker: string;
  setupName: string;
  direction: TradeDirection;
  status: TradeStatus;
  openedAt: string;
  closedAt?: string;
  entryPrice: number;
  exitPrice?: number;
  thesis: string;
  outcomeR?: number;
  disciplineScore: number;
  mistakeTag?: string;
  reviewNotes: string;
}

export interface SetupAnalytics {
  winRate: number;
  averageR: number;
  bestSetup: string;
  disciplineAverage: number;
  commonMistake: string;
  curve: { month: string; score: number }[];
}

export interface DashboardAlert {
  id: string;
  title: string;
  type: "risk" | "macro" | "catalyst";
  message: string;
}

export interface RiskItem {
  id: string;
  title: string;
  severity: Severity;
  explanation: string;
}

export interface StructuredAgentResponse<TPayload> {
  agent: AgentName;
  asOf: string;
  status: "ok" | "watch";
  payload: TPayload;
}

export interface NewsAgentPayload {
  headline: string;
  sentiment: "positive" | "neutral" | "negative";
  impactedTickers: string[];
  actionBias: string;
}

export interface MacroAgentPayload {
  macroRegime: string;
  geopoliticalOverlay: string;
  keyDrivers: string[];
  watchItems: string[];
}

export interface OpportunityAgentPayload {
  ticker: string;
  score: number;
  thesis: string;
  supportingFactors: string[];
  executionBias: string;
}

export interface RiskOfficerPayload {
  ticker: string;
  decision: RiskDecision;
  reasons: string[];
  approvedRiskAed: number;
}

export interface DashboardSnapshot {
  currentRegime: RegimeSnapshot;
  marketSummary: MarketSummary;
  macroSummary: MacroSummary;
  geopoliticalBoard: GeopoliticalBoard;
  topTradeIdeas: TradeIdea[];
  topRisks: RiskItem[];
  alerts: DashboardAlert[];
  portfolioSummary: PortfolioSummary;
}

export interface IntelligenceSnapshot {
  regime: RegimeSnapshot;
  macroState: MacroState;
  macroSummary: MacroSummary;
  macroCalendar: MacroCalendarViewModel;
  macroEvents: MacroEvent[];
  geopoliticalBoard: GeopoliticalBoard;
  geopoliticalEvents: GeopoliticalEvent[];
  sectorHeatmap: SectorHeatmapItem[];
  catalysts: CatalystItem[];
  rankedAssets: TradeIdea[];
}

export interface ReviewSnapshot {
  entries: JournalEntry[];
  analytics: SetupAnalytics;
  openTrades: TradeIdea[];
}
