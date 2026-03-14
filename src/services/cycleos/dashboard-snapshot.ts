import { buildPortfolioSnapshot } from "@/engines";
import { buildMockWatchlistQuotes } from "@/lib/providers/alphaVantage";
import { cycleOsProviders } from "@/providers";
import { getCycleOsAppState } from "@/services/cycleos/app-state";
import type { DashboardSnapshot } from "@/types";

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const state = await getCycleOsAppState();
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
    marketWatchlist: buildMockWatchlistQuotes(5),
  };
}
