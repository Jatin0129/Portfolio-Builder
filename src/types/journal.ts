import type {
  HoldingHorizon,
  InvestmentAssetCategory,
  JournalBehaviorTag,
  TradeDirection,
  TradeStatus,
} from "@/types/core";

export interface JournalEntry {
  id: string;
  ticker: string;
  assetName?: string;
  assetCategory?: InvestmentAssetCategory;
  account?: string;
  quantity?: number;
  investedAmountAed?: number;
  currentValueAed?: number;
  incomeAed?: number;
  manager?: string;
  location?: string;
  setupName: string;
  setupTags: string[];
  direction: TradeDirection;
  status: TradeStatus;
  openedAt: string;
  closedAt?: string;
  entryPrice: number;
  exitPrice?: number;
  thesis: string;
  entryReasons: string[];
  exitReasons: string[];
  rulesFollowed: boolean;
  plannedRiskPct: number;
  plannedRiskAed: number;
  realizedPnlPct?: number;
  realizedPnlAed?: number;
  outcomeR?: number;
  disciplineScore: number;
  mistakeTag?: string;
  behaviorTags: JournalBehaviorTag[];
  holdingHorizon: HoldingHorizon;
  reviewNotes: string;
}

export interface JournalAnalytics {
  winRate: number;
  averageGain: number;
  averageLoss: number;
  expectancy: number;
  averageR: number;
  bestSetupType: string;
  worstSetupType: string;
  disciplineAverage: number;
  commonMistake: string;
  curve: { month: string; score: number }[];
}

export interface BehavioralFlag {
  id: string;
  ticker: string;
  setupName: string;
  detail: string;
  date: string;
}

export interface OvertradingPattern {
  date: string;
  tradeCount: number;
  note: string;
}

export interface BehavioralReviewSnapshot {
  oversizedTrades: BehavioralFlag[];
  earlyExits: BehavioralFlag[];
  missedStops: BehavioralFlag[];
  overtradingPatterns: OvertradingPattern[];
}

export interface JournalEntryInput {
  ticker: string;
  assetName: string;
  assetCategory: InvestmentAssetCategory;
  account?: string;
  quantity?: number;
  investedAmountAed?: number;
  currentValueAed?: number;
  incomeAed?: number;
  manager?: string;
  location?: string;
  setupName: string;
  setupTags: string[];
  direction: TradeDirection;
  openedAt: string;
  entryPrice: number;
  thesis: string;
  entryReasons: string[];
  rulesFollowed: boolean;
  plannedRiskPct: number;
  plannedRiskAed: number;
  disciplineScore: number;
  holdingHorizon: HoldingHorizon;
  reviewNotes: string;
}

export interface JournalExitInput {
  id: string;
  closedAt: string;
  exitPrice: number;
  exitReasons: string[];
  rulesFollowed: boolean;
  reviewNotes: string;
}
