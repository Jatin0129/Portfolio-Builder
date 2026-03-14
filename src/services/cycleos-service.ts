import {
  buildPortfolioRiskSnapshot,
  buildPortfolioSummary,
  classifyRegime,
  computeOpportunityScore,
  evaluateTradeRisk,
  getAssetUniverse,
  getCatalysts,
  getGeopoliticalEvents,
  getMacroEvents,
  getMarketSummary,
  getSectorHeatmap,
  runMacroGeopoliticsAgent,
  runNewsAgent,
  runOpportunityAgent,
  runRiskOfficerAgent,
} from "@/engines";
import { alerts, holdings, journalEntries, riskSettings, topRisks } from "@/mock-data";
import type {
  DashboardSnapshot,
  IntelligenceSnapshot,
  ReviewSnapshot,
  SetupAnalytics,
  TradeIdea,
} from "@/types";

function buildPortfolioFit(ticker: string) {
  if (ticker === "GLD") {
    return {
      role: "Portfolio hedge and macro shock absorber",
      diversificationImpact: "Reduces growth beta and cushions policy surprise risk.",
      exposureOverlap: "Low overlap with existing cyclical exposures.",
      allocationSuggestionPct: 6,
    };
  }

  if (ticker === "XLI") {
    return {
      role: "Cyclical breadth expression",
      diversificationImpact: "Improves participation beyond mega-cap technology.",
      exposureOverlap: "Moderate overlap with existing industrial ETF holding.",
      allocationSuggestionPct: 5,
    };
  }

  return {
    role: "High-conviction growth alpha sleeve",
    diversificationImpact: "Adds return potential but increases cluster risk.",
    exposureOverlap: "High overlap with current semicap and mega-cap tech leadership.",
    allocationSuggestionPct: 3.5,
  };
}

export function getTradeIdeas(): TradeIdea[] {
  return getAssetUniverse()
    .map((asset) => {
      const { breakdown, score } = computeOpportunityScore(asset);
      const baseTrade = {
        ...asset,
        factorBreakdown: breakdown,
        opportunityScore: score,
        portfolioFit: buildPortfolioFit(asset.ticker),
      };

      return {
        ...baseTrade,
        riskVerdict: evaluateTradeRisk(baseTrade, holdings, riskSettings),
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export function getDashboardSnapshot(): DashboardSnapshot {
  const market = getMarketSummary();
  const macro = getMacroEvents();
  const geopolitical = getGeopoliticalEvents();

  return {
    currentRegime: classifyRegime(market, macro, geopolitical),
    marketSummary: market,
    topTradeIdeas: getTradeIdeas().slice(0, 4),
    topRisks,
    alerts,
    portfolioSummary: buildPortfolioSummary(holdings, riskSettings),
  };
}

export function getIntelligenceSnapshot(): IntelligenceSnapshot {
  const market = getMarketSummary();
  const macro = getMacroEvents();
  const geopolitical = getGeopoliticalEvents();

  return {
    regime: classifyRegime(market, macro, geopolitical),
    macroEvents: macro,
    geopoliticalEvents: geopolitical,
    sectorHeatmap: getSectorHeatmap(),
    catalysts: getCatalysts(),
    rankedAssets: getTradeIdeas(),
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

export function getPortfolioSnapshot() {
  return {
    summary: buildPortfolioSummary(holdings, riskSettings),
    holdings,
    risk: buildPortfolioRiskSnapshot(holdings, riskSettings),
    settings: riskSettings,
  };
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
