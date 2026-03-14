import {
  buildPortfolioRiskSnapshot,
  buildPortfolioSnapshot,
  classifyRegime,
  computeOpportunityScore,
  evaluateTradeRisk,
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
} from "@/engines";
import { alerts, holdings, journalEntries, riskSettings, topRisks, watchlist } from "@/mock-data";
import { formatCurrency } from "@/lib/utils";
import type {
  DashboardSnapshot,
  IntelligenceSnapshot,
  PortfolioSnapshot,
  RegimeInput,
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
      overlapWithCurrentPortfolio: "Low overlap with existing growth and cyclical sleeves.",
      themeFit: "Fits the portfolio as a defensive macro hedge during event-heavy weeks.",
      hedgeValue: "High hedge value if yields fall or geopolitical stress intensifies.",
    };
  }

  if (ticker === "XLI") {
    return {
      role: "Cyclical breadth expression",
      diversificationImpact: "Improves participation beyond mega-cap technology.",
      exposureOverlap: "Moderate overlap with existing industrial ETF holding.",
      allocationSuggestionPct: 5,
      overlapWithCurrentPortfolio: "Moderate overlap with current cyclical exposure through XLI and industrial beta.",
      themeFit: "Strong theme fit while global cyclicals and infrastructure spending remain supportive.",
      hedgeValue: "Low hedge value; this is a participation trade rather than a portfolio hedge.",
    };
  }

  if (ticker === "SMCI") {
    return {
      role: "High-beta tactical alpha sleeve",
      diversificationImpact: "Adds upside if AI infrastructure extends, but raises cluster risk quickly.",
      exposureOverlap: "Very high overlap with semicap and AI infrastructure leadership.",
      allocationSuggestionPct: 2.5,
      overlapWithCurrentPortfolio: "High overlap with existing semiconductor and mega-cap tech concentration.",
      themeFit: "Fits the AI infrastructure theme but only tactically due to risk quality concerns.",
      hedgeValue: "No hedge value; this increases directional and thematic beta.",
    };
  }

  return {
    role: "High-conviction growth alpha sleeve",
    diversificationImpact: "Adds return potential but increases cluster risk.",
    exposureOverlap: "High overlap with current semicap and mega-cap tech leadership.",
    allocationSuggestionPct: 3.5,
    overlapWithCurrentPortfolio: "High overlap with current growth leadership exposure.",
    themeFit: "Theme fit is acceptable only if the risk-on regime remains intact.",
    hedgeValue: "Minimal hedge value because this trade is a pure directional growth expression.",
  };
}

function buildRegimeInput(): RegimeInput {
  const market = getMarketSummary();
  const geopoliticalBoard = getGeopoliticalBoard();
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

export function getTradeIdeas(): TradeIdea[] {
  return getAssetUniverse()
    .map((asset) => {
      const { breakdown, score } = computeOpportunityScore(asset);
      const portfolioFit = buildPortfolioFit(asset.ticker);
      const baseTrade = {
        ...asset,
        factorBreakdown: breakdown,
        opportunityScore: score,
        portfolioFit,
      };

      const riskVerdict = evaluateTradeRisk(baseTrade, holdings, riskSettings);
      const positionSizePct = Math.min(
        portfolioFit.allocationSuggestionPct,
        riskSettings.maxSinglePositionPct,
      );

      return {
        ...baseTrade,
        riskVerdict,
        insight: {
          summary: {
            ticker: asset.ticker,
            action: asset.direction,
            confidence: asset.conviction,
            score,
            timeHorizon: asset.executionPlan.timeframe,
            entryZone: asset.executionPlan.entryZone,
            stopLoss: asset.executionPlan.stop,
            targetOne: asset.executionPlan.targetOne,
            targetTwo: asset.executionPlan.targetTwo,
            positionSize: `${positionSizePct}% of portfolio (${formatCurrency(riskVerdict.maxPositionAed)})`,
            aedRisk: riskVerdict.approvedRiskAed,
          },
          whyThisTrade: {
            shortThesis: asset.shortThesis,
            regimeFit: asset.regimeFitText,
          },
          technical: asset.technicalInsight,
          executionSteps: asset.executionPlan.steps,
        },
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export function getDashboardSnapshot(): DashboardSnapshot {
  const market = getMarketSummary();
  const macroSummary = getMacroSummary();
  const geopoliticalBoard = getGeopoliticalBoard();
  const regime = classifyRegime(buildRegimeInput());
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
    marketSummary: market,
    macroSummary,
    geopoliticalBoard,
    topTradeIdeas: getTradeIdeas().slice(0, 4),
    topRisks,
    alerts,
    portfolioSummary: portfolio.summary,
  };
}

export function getIntelligenceSnapshot(): IntelligenceSnapshot {
  const macroState = getMacroState();
  const macroSummary = getMacroSummary(macroState);
  const geopoliticalBoard = getGeopoliticalBoard();
  const regime = classifyRegime(buildRegimeInput());

  return {
    regime,
    macroState,
    macroSummary,
    macroCalendar: getMacroCalendarViewModel(macroState),
    macroEvents: getMacroEvents(),
    geopoliticalBoard,
    geopoliticalEvents: getGeopoliticalEvents(),
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

export function getPortfolioSnapshot(): PortfolioSnapshot {
  const regime = classifyRegime(buildRegimeInput());
  const macroSummary = getMacroSummary();
  const geopoliticalBoard = getGeopoliticalBoard();
  const risk = buildPortfolioRiskSnapshot(holdings, riskSettings);

  return buildPortfolioSnapshot(
    holdings,
    watchlist,
    riskSettings,
    regime,
    macroSummary,
    geopoliticalBoard,
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
