import { assetUniverse, marketSummary } from "@/mock-data";

export function getMarketSummary() {
  // Future integration point: replace with broker or market data API adapters.
  return marketSummary;
}

export function getAssetUniverse() {
  // Future integration point: stream asset data, liquidity, and technical snapshots from a live feed.
  return assetUniverse;
}
