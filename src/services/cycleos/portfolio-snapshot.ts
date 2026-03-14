import { buildPortfolioSnapshot } from "@/engines";
import { getCycleOsAppState } from "@/services/cycleos/app-state";
import type { PortfolioSnapshot } from "@/types";

export async function getPortfolioSnapshot(): Promise<PortfolioSnapshot> {
  const state = await getCycleOsAppState();

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
