import { holdings, watchlist } from "@/mock-data/portfolio";
import type { PortfolioProvider } from "@/providers/interfaces";
import type { Holding, HoldingInput } from "@/types";

function recalculateWeights(items: Holding[]) {
  const total = items.reduce((sum, item) => sum + item.marketValueAed, 0);

  for (const item of items) {
    item.weightPct = total > 0 ? Number(((item.marketValueAed / total) * 100).toFixed(1)) : 0;
  }
}

function buildHolding(input: HoldingInput, id = `hold-${Date.now()}`): Holding {
  const avgCost = Number((input.investedAmountAed / input.quantity).toFixed(2));
  const marketPrice = Number((input.currentValueAed / input.quantity).toFixed(2));
  const unrealizedPnlAed = Number((input.currentValueAed - input.investedAmountAed).toFixed(0));

  return {
    id,
    ticker: input.ticker.trim().toUpperCase(),
    name: input.name,
    assetClass: input.assetClass,
    sector: input.sector,
    region: input.region,
    currency: input.currency,
    themes: input.themes,
    allocationBucket: input.allocationBucket,
    quantity: input.quantity,
    avgCost,
    marketPrice,
    marketValueAed: input.currentValueAed,
    unrealizedPnlAed,
    weightPct: 0,
    beta: input.beta,
    correlationTag: input.correlationTag,
    stopDistancePct: input.stopDistancePct,
    openRiskAed: Number((input.currentValueAed * (input.stopDistancePct / 100)).toFixed(0)),
  };
}

export const mockPortfolioProvider: PortfolioProvider = {
  async getHoldings() {
    // TODO: replace with broker portfolio sync adapter.
    return holdings;
  },
  async getWatchlist() {
    return watchlist;
  },
  async createHolding(input: HoldingInput) {
    const created = buildHolding(input);
    holdings.unshift(created);
    recalculateWeights(holdings);
    return created;
  },
  async updateHolding(id: string, input: HoldingInput) {
    const index = holdings.findIndex((holding) => holding.id === id);
    if (index === -1) {
      throw new Error("Holding not found");
    }

    const updated = buildHolding(input, id);
    holdings[index] = updated;
    recalculateWeights(holdings);
    return updated;
  },
  async deleteHolding(id: string) {
    const index = holdings.findIndex((holding) => holding.id === id);
    if (index === -1) {
      throw new Error("Holding not found");
    }

    holdings.splice(index, 1);
    recalculateWeights(holdings);
  },
};
