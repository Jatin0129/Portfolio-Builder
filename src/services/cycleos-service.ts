import {
  buildPortfolioRiskSnapshot,
  buildPortfolioSnapshot,
  getCatalysts,
  getGeopoliticalEvents,
  getMacroCalendarViewModel,
  getMacroEvents,
  getMacroState,
  generateTradeIdeas,
  getRankedTradeIdeaSummaries,
  getSectorHeatmap,
  getTradeIdeaGenerationContext,
  runMacroGeopoliticsAgent,
  runNewsAgent,
  runOpportunityAgent,
  runRiskOfficerAgent,
} from "@/engines";
import { alerts, holdings, journalEntries, riskSettings, topRisks, watchlist } from "@/mock-data";
import type {
  DashboardSnapshot,
  IntelligenceSnapshot,
  PortfolioSnapshot,
  ReviewSnapshot,
  SetupAnalytics,
  TradeIdeaGenerationContext,
  TradeIdeaRankedSummary,
  TradeIdea,
} from "@/types";

export function getTradeIdeas(): TradeIdea[] {
  return generateTradeIdeas().ideas;
}

export function getTradeIdeaSummaries(): TradeIdeaRankedSummary[] {
  return getRankedTradeIdeaSummaries();
}

function getGenerationContext(): TradeIdeaGenerationContext {
  return getTradeIdeaGenerationContext();
}

export function getDashboardSnapshot(): DashboardSnapshot {
  const tradeIdeas = generateTradeIdeas();
  const { marketSummary, macroSummary, geopoliticalBoard, regime } = tradeIdeas.context;
  const portfolioRisk = buildPortfolioRiskSnapshot(holdings, riskSettings);
  const portfolio = buildPortfolioSnapshot(
    holdings,
    watchlist,
    riskSettings,
    regime,
    macroSummary,
    geopoliticalBoard,
    portfolioRisk,
  );

  return {
    currentRegime: regime,
    marketSummary,
    macroSummary,
    geopoliticalBoard,
    topTradeIdeas: tradeIdeas.ideas.slice(0, 4),
    topRisks,
    alerts,
    portfolioSummary: portfolio.summary,
  };
}

export function getIntelligenceSnapshot(): IntelligenceSnapshot {
  const context = getGenerationContext();
  const tradeIdeas = generateTradeIdeas();
  const macroState = getMacroState();

  return {
    regime: context.regime,
    macroState,
    macroSummary: context.macroSummary,
    macroCalendar: getMacroCalendarViewModel(macroState),
    macroEvents: getMacroEvents(),
    geopoliticalBoard: context.geopoliticalBoard,
    geopoliticalEvents: getGeopoliticalEvents(),
    sectorHeatmap: getSectorHeatmap(),
    catalysts: getCatalysts(),
    rankedAssets: tradeIdeas.ideas,
  };
}

function buildSetupAnalytics(): SetupAnalytics {
  const closedTrades = journalEntries.filter((entry) => entry.status === "CLOSED");
  const wins = closedTrades.filter((entry) => (entry.outcomeR ?? 0) > 0).length;
  const averageR =
    closedTrades.reduce((sum, entry) => sum + (entry.outcomeR ?? 0), 0) / closedTrades.length;
  const disciplineAverage =
    journalEntries.reduce((sum, entry) => sum + entry.disciplineScore, 0) / journalEntries.length;
  const mistakeCounts = journalEntries.reduce<Record<string, number>>((accumulator, entry) => {
    if (!entry.mistakeTag) return accumulator;
    accumulator[entry.mistakeTag] = (accumulator[entry.mistakeTag] ?? 0) + 1;
    return accumulator;
  }, {});
  const commonMistake =
    Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No recurring mistake";

  return {
    winRate: Number(((wins / closedTrades.length) * 100).toFixed(0)),
    averageR: Number(averageR.toFixed(1)),
    bestSetup: "Post-earnings continuation",
    disciplineAverage: Number(disciplineAverage.toFixed(1)),
    commonMistake,
    curve: [
      { month: "Nov", score: 5.7 },
      { month: "Dec", score: 6.4 },
      { month: "Jan", score: 7.3 },
      { month: "Feb", score: 7.1 },
      { month: "Mar", score: 8.2 },
    ],
  };
}

export function getPortfolioSnapshot(): PortfolioSnapshot {
  const context = getGenerationContext();
  const risk = buildPortfolioRiskSnapshot(holdings, riskSettings);

  return buildPortfolioSnapshot(
    holdings,
    watchlist,
    riskSettings,
    context.regime,
    context.macroSummary,
    context.geopoliticalBoard,
    risk,
  );
}

export function getReviewSnapshot(): ReviewSnapshot {
  return {
    entries: journalEntries,
    analytics: buildSetupAnalytics(),
    openTrades: getTradeIdeas()
      .filter((trade) => trade.riskVerdict.decision !== "REJECT")
      .slice(0, 3),
  };
}

export function getAgentBundle(ticker: string) {
  const trade = getTradeIdeas().find((idea) => idea.ticker === ticker);
  if (!trade) return null;

  return [
    runNewsAgent(trade),
    runMacroGeopoliticsAgent(trade),
    runOpportunityAgent(trade),
    runRiskOfficerAgent(trade),
  ];
}
