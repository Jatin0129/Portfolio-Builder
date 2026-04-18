import type {
  AssetSignalSeed,
  CatalystItem,
  DashboardAlert,
  GeopoliticalEvent,
  Holding,
  HoldingInput,
  JournalEntry,
  JournalEntryInput,
  JournalExitInput,
  MacroAgentPayload,
  MacroEvent,
  MacroState,
  MarketSummary,
  NewsAgentPayload,
  OpportunityAgentPayload,
  PortfolioWatchlistItem,
  RiskItem,
  RiskOfficerPayload,
  SectorHeatmapItem,
  StructuredAgentResponse,
  TradeIdea,
  UserSettings,
} from "@/types";

export interface MarketDataProvider {
  getMarketSummary(): MarketSummary;
  getAssetUniverseSeeds(): AssetSignalSeed[];
  getTopRisks(): RiskItem[];
  getAlerts(): DashboardAlert[];
}

export interface MacroDataProvider {
  getMacroState(): MacroState;
  getMacroEvents(): MacroEvent[];
  getCatalysts(): CatalystItem[];
  getSectorHeatmap(): SectorHeatmapItem[];
}

export interface GeopoliticsProvider {
  getGeopoliticalEvents(): GeopoliticalEvent[];
}

export interface PortfolioProvider {
  getHoldings(): Promise<Holding[]>;
  getWatchlist(): Promise<PortfolioWatchlistItem[]>;
  createHolding(input: HoldingInput): Promise<Holding>;
  updateHolding(id: string, input: HoldingInput): Promise<Holding>;
  deleteHolding(id: string): Promise<void>;
}

export interface SettingsProvider {
  getSettings(): Promise<UserSettings>;
  saveSettings(settings: UserSettings): Promise<UserSettings>;
}

export interface JournalProvider {
  getEntries(): Promise<JournalEntry[]>;
  createEntry(entry: JournalEntryInput): Promise<JournalEntry>;
  closeEntry(exit: JournalExitInput): Promise<JournalEntry>;
}

export interface AiAgentProvider {
  runNewsAgent(trade: TradeIdea): StructuredAgentResponse<NewsAgentPayload>;
  runMacroGeopoliticsAgent(trade: TradeIdea): StructuredAgentResponse<MacroAgentPayload>;
  runOpportunityAgent(trade: TradeIdea): StructuredAgentResponse<OpportunityAgentPayload>;
  runRiskOfficerAgent(trade: TradeIdea): StructuredAgentResponse<RiskOfficerPayload>;
}

export interface CycleOsProviders {
  marketData: MarketDataProvider;
  macroData: MacroDataProvider;
  geopolitics: GeopoliticsProvider;
  portfolio: PortfolioProvider;
  settings: SettingsProvider;
  journal: JournalProvider;
  aiAgents: AiAgentProvider;
}
