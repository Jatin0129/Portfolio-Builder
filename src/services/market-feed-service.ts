import { buildMockQuote } from "@/lib/providers/alphaVantage";
import { cycleOsProviders } from "@/providers";
import type { MarketFeedCategory, MarketFeedInstrument, MarketFeedSnapshot } from "@/types";

function buildBenchmarkItems(): MarketFeedInstrument[] {
  return cycleOsProviders.marketData.getMarketSummary().indices.map((item) => ({
    id: `benchmark-${item.ticker}`,
    symbol: item.ticker,
    name: item.name,
    context: "benchmarks",
    assetClass: "Benchmark",
    region: "Global",
    themes: [],
    quote: buildMockQuote(item.ticker),
  }));
}

async function buildHoldingItems(): Promise<MarketFeedInstrument[]> {
  return (await cycleOsProviders.portfolio.getHoldings()).map((item) => ({
    id: item.id,
    symbol: item.ticker,
    name: item.name,
    context: "holdings",
    assetClass: item.assetClass,
    sector: item.sector,
    region: item.region,
    allocationBucket: item.allocationBucket,
    themes: item.themes,
    quote: buildMockQuote(item.ticker),
  }));
}

async function buildWatchlistItems(): Promise<MarketFeedInstrument[]> {
  return (await cycleOsProviders.portfolio.getWatchlist()).map((item) => ({
    id: item.id,
    symbol: item.ticker,
    name: item.name,
    context: "watchlist",
    assetClass: item.assetClass,
    sector: item.sector,
    region: item.region,
    allocationBucket: item.candidateBucket,
    priority: item.priority,
    targetEntry: item.targetEntry,
    thesis: item.thesis,
    themes: item.themes,
    quote: buildMockQuote(item.ticker),
  }));
}

function buildUniverseItems(): MarketFeedInstrument[] {
  return cycleOsProviders.marketData.getAssetUniverseSeeds().map((item) => ({
    id: `universe-${item.ticker}`,
    symbol: item.ticker,
    name: item.name,
    context: "universe",
    assetClass: item.assetClass,
    sector: item.sector,
    region: item.region,
    allocationBucket: item.allocationBucket,
    thesis: item.shortThesis,
    themes: item.themes,
    quote: buildMockQuote(item.ticker),
  }));
}

export async function getTrackedMarketInstruments(
  category: MarketFeedCategory = "watchlist",
  symbols?: string[],
  limit?: number,
): Promise<MarketFeedInstrument[]> {
  const sections: Record<MarketFeedCategory, MarketFeedInstrument[]> = {
    benchmarks: buildBenchmarkItems(),
    holdings: await buildHoldingItems(),
    watchlist: await buildWatchlistItems(),
    universe: buildUniverseItems(),
  };

  const baseItems = symbols?.length
    ? sections[category].filter((item) => symbols.includes(item.symbol))
    : sections[category];

  return typeof limit === "number" ? baseItems.slice(0, limit) : baseItems;
}

export async function getMarketFeedSnapshot(): Promise<MarketFeedSnapshot> {
  const sections: Record<MarketFeedCategory, MarketFeedInstrument[]> = {
    benchmarks: buildBenchmarkItems(),
    holdings: await buildHoldingItems(),
    watchlist: await buildWatchlistItems(),
    universe: buildUniverseItems(),
  };

  return {
    defaultCategory: "benchmarks",
    selectedSymbol:
      sections.benchmarks[0]?.symbol ??
      sections.holdings[0]?.symbol ??
      sections.watchlist[0]?.symbol ??
      sections.universe[0]?.symbol ??
      "",
    sections,
  };
}
