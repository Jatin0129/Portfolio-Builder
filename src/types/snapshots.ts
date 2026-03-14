import type { Severity } from "@/types/core";
import type {
  CatalystItem,
  GeopoliticalBoard,
  GeopoliticalEvent,
  MacroCalendarViewModel,
  MacroEvent,
  MacroState,
  MacroSummary,
  MarketSummary,
  RegimeSnapshot,
  SectorHeatmapItem,
} from "@/types/intelligence";
import type { LiveMarketWatchlistItem } from "@/types/live-market";
import type { BehavioralReviewSnapshot, JournalAnalytics, JournalEntry } from "@/types/journal";
import type { PortfolioSummary, TradeIdea } from "@/types/portfolio";
import type { SettingsProfileGuidance, UserSettings } from "@/types/settings";

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

export interface DashboardSnapshot {
  currentRegime: RegimeSnapshot;
  marketSummary: MarketSummary;
  macroSummary: MacroSummary;
  geopoliticalBoard: GeopoliticalBoard;
  topTradeIdeas: TradeIdea[];
  topRisks: RiskItem[];
  alerts: DashboardAlert[];
  portfolioSummary: PortfolioSummary;
  marketWatchlist: LiveMarketWatchlistItem[];
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
  analytics: JournalAnalytics;
  behavior: BehavioralReviewSnapshot;
  openTrades: TradeIdea[];
}

export interface SettingsSnapshot {
  settings: UserSettings;
  profileGuidance: SettingsProfileGuidance[];
}
