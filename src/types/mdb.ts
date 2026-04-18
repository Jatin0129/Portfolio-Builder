import type { InvestmentAssetCategory } from "@/types/core";
import type { BehavioralReviewSnapshot, JournalAnalytics, JournalEntry } from "@/types/journal";
import type { UserSettings } from "@/types/settings";

export interface MdbCategorySummary {
  category: InvestmentAssetCategory;
  investedAed: number;
  currentValueAed: number;
  pnlAed: number;
  weightPct: number;
  itemCount: number;
}

export interface MdbInvestmentItem {
  id: string;
  code: string;
  name: string;
  category: InvestmentAssetCategory;
  vehicle: string;
  sector?: string;
  status: "Active" | "Closed";
  region: string;
  currency?: string;
  investedAed: number;
  currentValueAed: number;
  pnlAed: number;
  pnlPct: number;
  notes: string[];
  source: "portfolio" | "journal";
  quantity?: number;
  allocationBucket?: "core" | "tactical" | "hedge";
  beta?: number;
  correlationTag?: string;
  stopDistancePct?: number;
  openedAt?: string;
  closedAt?: string;
}

export interface MdbOverviewSnapshot {
  settings: UserSettings;
  totalInvestedAed: number;
  currentValueAed: number;
  unrealizedPnlAed: number;
  realizedPnlAed: number;
  activeInvestments: number;
  closedInvestments: number;
  categories: MdbCategorySummary[];
  activeItems: MdbInvestmentItem[];
  recentEntries: JournalEntry[];
}

export interface MdbInvestmentsSnapshot {
  settings: UserSettings;
  categories: MdbCategorySummary[];
  investments: MdbInvestmentItem[];
}

export interface MdbJournalSnapshot {
  settings: UserSettings;
  entries: JournalEntry[];
  analytics: JournalAnalytics;
  behavior: BehavioralReviewSnapshot;
  categories: MdbCategorySummary[];
}
