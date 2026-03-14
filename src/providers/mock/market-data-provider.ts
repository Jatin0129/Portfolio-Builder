import { alerts, topRisks } from "@/mock-data/risk";
import { assetUniverse, marketSummary } from "@/mock-data/market-data";
import type { MarketDataProvider } from "@/providers/interfaces";

export const mockMarketDataProvider: MarketDataProvider = {
  getMarketSummary() {
    // TODO: replace with live broker or market-data adapter when integrations are enabled.
    return marketSummary;
  },
  getAssetUniverseSeeds() {
    return assetUniverse;
  },
  getTopRisks() {
    return topRisks;
  },
  getAlerts() {
    return alerts;
  },
};
