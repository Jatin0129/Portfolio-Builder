import type {
  AllocationBucketKey,
  ExposureDimension,
  FactorKey,
  OverUnderweightStatus,
  PriorityTag,
  RiskDecision,
  TradeDirection,
} from "@/types/core";
import type { Asset, GeopoliticalBoard, MacroSummary, RegimeSnapshot } from "@/types/intelligence";
import type { UserSettings } from "@/types/settings";

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

export interface TradeIdeaScores {
  factorScore: number;
  macroFit: number;
  geopoliticalFit: number;
  regimeFit: number;
  totalScore: number;
  confidence: number;
}

export interface TradeIdea extends AssetSignalInput {
  factorBreakdown: FactorScore[];
  regimeFit: number;
  regimeReasons: string[];
  totalScore: number;
  confidence: number;
  thesis: string;
  scores: TradeIdeaScores;
  opportunityScore: number;
  portfolioFit: PortfolioFit;
  riskVerdict: RiskVerdict;
  insight: TradeInsight;
}

export interface TradeIdeaRankedSummary {
  ticker: string;
  totalScore: number;
  confidence: number;
  thesis: string;
  macroReasons: string[];
  geopoliticalReasons: string[];
  factorBreakdown: FactorScore[];
  entry: string;
  stop: string;
  targets: string[];
  size: string;
  riskAed: number;
  verdict: {
    decision: RiskDecision;
    summary: string;
    explanation: string;
  };
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

export interface HoldingInput {
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  region: string;
  currency: string;
  themes: string[];
  allocationBucket: Exclude<AllocationBucketKey, "cash">;
  quantity: number;
  investedAmountAed: number;
  currentValueAed: number;
  beta: number;
  correlationTag: string;
  stopDistancePct: number;
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
  settings: UserSettings;
}

export interface TradeIdeaGenerationContext {
  marketSummary: import("@/types/intelligence").MarketSummary;
  macroSummary: MacroSummary;
  geopoliticalBoard: GeopoliticalBoard;
  regime: RegimeSnapshot;
}

export interface TradeIdeaGeneratorResult {
  context: TradeIdeaGenerationContext;
  ideas: TradeIdea[];
  rankedSummaries: TradeIdeaRankedSummary[];
}
