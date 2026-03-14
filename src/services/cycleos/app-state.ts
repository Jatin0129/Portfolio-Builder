import { cache } from "react";

import {
  buildPortfolioRiskSnapshot,
  classifyRegime,
  generateTradeIdeas,
  getAssetUniverse,
  getGeopoliticalBoard,
  getGeopoliticalEvents,
  getMacroEvents,
  getMacroState,
  getMacroSummary,
  getMarketSummary,
} from "@/engines";
import { cycleOsProviders } from "@/providers";
import { getUserSettings } from "@/services/settings-service";
import type { IntelligenceSnapshot, RegimeInput } from "@/types";

function buildRegimeInput(
  geopoliticalBoard: IntelligenceSnapshot["geopoliticalBoard"],
  market = cycleOsProviders.marketData.getMarketSummary(),
): RegimeInput {
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

export const getCycleOsAppState = cache(async () => {
  const settingsPromise = getUserSettings();
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
  const settings = await settingsPromise;
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
});
