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

export interface ExecutionPlan {
  entryZone: string;
  addZone: string;
  stop: string;
  targetOne: string;
  targetTwo: string;
  timeframe: string;
}

export interface PortfolioFit {
  role: string;
  diversificationImpact: string;
  exposureOverlap: string;
  allocationSuggestionPct: number;
}

export interface RiskVerdict {
  decision: RiskDecision;
  score: number;
  summary: string;
  messages: string[];
  approvedRiskAed: number;
  maxPositionAed: number;
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

export interface AssetSignalInput extends Asset {
  momentum: number;
  trendStructure: number;
  relativeStrength: number;
  volatilityQuality: number;
  valuationSanity: number;
  macroFit: number;
  geopoliticalFit: number;
  liquidity: number;
  catalystStrength: number;
  averageVolumeLabel: string;
  technicalSetup: TechnicalSetup;
  executionPlan: ExecutionPlan;
  macroReasons: string[];
  geopoliticalReasons: string[];
  catalyst: string;
  direction: TradeDirection;
  stopDistancePct: number;
  conviction: number;
}

export interface TradeIdea extends AssetSignalInput {
  factorBreakdown: FactorScore[];
  opportunityScore: number;
  portfolioFit: PortfolioFit;
  riskVerdict: RiskVerdict;
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
  usdTrend: "up" | "flat" | "down";
  bondYieldTrend: "up" | "flat" | "down";
  goldOilSignal: "inflationary" | "defensive" | "balanced";
  vix: number;
  breadthPct: number;
}

export interface MacroEvent {
  id: string;
  title: string;
  region: string;
  date: string;
  severity: Severity;
  category: string;
  consensus: string;
  implication: string;
}

export interface GeopoliticalEvent {
  id: string;
  title: string;
  region: string;
  severity: Severity;
  status: string;
  implication: string;
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
  name: string;
  stance: "Risk-On" | "Balanced" | "Defensive";
  confidence: number;
  explanation: string;
  drivers: string[];
  alerts: string[];
}

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  region: string;
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
  topTradeIdeas: TradeIdea[];
  topRisks: RiskItem[];
  alerts: DashboardAlert[];
  portfolioSummary: PortfolioSummary;
}

export interface IntelligenceSnapshot {
  regime: RegimeSnapshot;
  macroEvents: MacroEvent[];
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
