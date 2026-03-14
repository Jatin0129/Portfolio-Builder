import {
  buildPortfolioRiskSnapshot,
  buildPortfolioSnapshot,
  classifyRegime,
  generateTradeIdeas,
  getAssetUniverse,
  getCatalysts,
  getGeopoliticalBoard,
  getGeopoliticalEvents,
  getMacroCalendarViewModel,
  getMacroEvents,
  getMacroState,
  getMacroSummary,
  getMarketSummary,
  getSectorHeatmap,
  runMacroGeopoliticsAgent,
  runNewsAgent,
  runOpportunityAgent,
  runRiskOfficerAgent,
  toTradeIdeaSummaries,
} from "@/engines";
import { cycleOsProviders } from "@/providers";
import { buildBehavioralReview, buildJournalAnalytics, getJournalEntries } from "@/services/journal-service";
import { getUserSettings } from "@/services/settings-service";
import type {
  DashboardSnapshot,
  IntelligenceSnapshot,
  PortfolioSnapshot,
  RegimeInput,
  ReviewSnapshot,
  TradeIdea,
  TradeIdeaGenerationContext,
  TradeIdeaRankedSummary,
} from "@/types";

function buildRegimeInput(geopoliticalBoard: IntelligenceSnapshot["geopoliticalBoard"], market = cycleOsProviders.marketData.getMarketSummary()): RegimeInput {
  const breadthState =
    market.breadthPct >= 58 ? "strong" : market.breadthPct >= 48 ? "mixed" : "weak";

  return {
    majorIndexTrend: market.majorIndexTrend,
    bondYieldDirection: market.bondYieldDirection,
    goldBehavior: market.goldBehavior,
    oilBehavior: market.oilBehavior,
    usdTrend: market.usdTrend,
    volatilityState: market.volatilityState,
    marketBreadth: breadthState,
    macroEventFlags: market.macroEventFlags,
    geopoliticalSeverity: geopoliticalBoard.summary.overlaySeverity,
  };
}

async function buildAppState() {
  const settings = await getUserSettings();
  const holdings = cycleOsProviders.portfolio.getHoldings();
  const watchlist = cycleOsProviders.portfolio.getWatchlist();
  const marketSummary = getMarketSummary(cycleOsProviders.marketData.getMarketSummary());
  const macroState = getMacroState(cycleOsProviders.macroData.getMacroState());
  const macroEvents = getMacroEvents(cycleOsProviders.macroData.getMacroEvents());
  const geopoliticalBoard = getGeopoliticalBoard(cycleOsProviders.geopolitics.getGeopoliticalEvents());
  const geopoliticalEvents = getGeopoliticalEvents(geopoliticalBoard);
  const macroSummary = getMacroSummary(macroState);
  const regime = classifyRegime(buildRegimeInput(geopoliticalBoard, marketSummary));
  const assets = getAssetUniverse(
    cycleOsProviders.marketData.getAssetUniverseSeeds(),
    macroState,
    geopoliticalBoard,
  );
  const tradeIdeas = generateTradeIdeas({
    assets,
    holdings,
    settings,
    marketSummary,
    macroSummary,
    geopoliticalBoard,
    regime,
  });
  const portfolioRisk = buildPortfolioRiskSnapshot(holdings, settings);

  return {
    settings,
    holdings,
    watchlist,
    marketSummary,
    macroState,
    macroEvents,
    macroSummary,
    geopoliticalBoard,
    geopoliticalEvents,
    regime,
    tradeIdeas,
    portfolioRisk,
  };
}

export async function getTradeIdeas(): Promise<TradeIdea[]> {
  return (await buildAppState()).tradeIdeas.ideas;
}

export async function getTradeIdeaSummaries(): Promise<TradeIdeaRankedSummary[]> {
  return toTradeIdeaSummaries((await buildAppState()).tradeIdeas.ideas);
}

async function getGenerationContext(): Promise<TradeIdeaGenerationContext> {
  return (await buildAppState()).tradeIdeas.context;
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const state = await buildAppState();
  const portfolio = buildPortfolioSnapshot(
    state.holdings,
    state.watchlist,
    state.settings,
    state.regime,
    state.macroSummary,
    state.geopoliticalBoard,
    state.portfolioRisk,
  );

  return {
    currentRegime: state.regime,
    marketSummary: state.marketSummary,
    macroSummary: state.macroSummary,
    geopoliticalBoard: state.geopoliticalBoard,
    topTradeIdeas: state.tradeIdeas.ideas.slice(0, 6),
    topRisks: cycleOsProviders.marketData.getTopRisks(),
    alerts: cycleOsProviders.marketData.getAlerts(),
    portfolioSummary: portfolio.summary,
  };
}

export async function getIntelligenceSnapshot(): Promise<IntelligenceSnapshot> {
  const state = await buildAppState();

  return {
    regime: state.regime,
    macroState: state.macroState,
    macroSummary: state.macroSummary,
    macroCalendar: getMacroCalendarViewModel(state.macroEvents, state.macroState),
    macroEvents: state.macroEvents,
    geopoliticalBoard: state.geopoliticalBoard,
    geopoliticalEvents: state.geopoliticalEvents,
    sectorHeatmap: getSectorHeatmap(cycleOsProviders.macroData.getSectorHeatmap()),
    catalysts: getCatalysts(cycleOsProviders.macroData.getCatalysts()),
    rankedAssets: state.tradeIdeas.ideas,
  };
}

export async function getPortfolioSnapshot(): Promise<PortfolioSnapshot> {
  const state = await buildAppState();

  return buildPortfolioSnapshot(
    state.holdings,
    state.watchlist,
    state.settings,
    state.regime,
    state.macroSummary,
    state.geopoliticalBoard,
    state.portfolioRisk,
  );
}

export async function getReviewSnapshot(): Promise<ReviewSnapshot> {
  const state = await buildAppState();
  const entries = await getJournalEntries();

  return {
    entries,
    analytics: buildJournalAnalytics(entries),
    behavior: buildBehavioralReview(entries, state.settings),
    openTrades: state.tradeIdeas.ideas.filter((trade) => trade.riskVerdict.decision !== "REJECT").slice(0, 4),
  };
}

export async function getAgentBundle(ticker: string) {
  const state = await buildAppState();
  const trade = state.tradeIdeas.ideas.find((idea) => idea.ticker === ticker);
  if (!trade) return null;

  return [
    runNewsAgent(trade),
    runMacroGeopoliticsAgent(trade),
    runOpportunityAgent(trade),
    runRiskOfficerAgent(trade, { holdings: state.holdings, settings: state.settings }),
  ];
}

export async function getPageContext() {
  return getGenerationContext();
}
