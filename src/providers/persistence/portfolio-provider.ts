import { prisma } from "@/lib/prisma";
import type { PortfolioProvider } from "@/providers/interfaces";
import type { Holding, HoldingInput, PortfolioWatchlistItem } from "@/types";

function toHolding(record: {
  id: string;
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  region: string;
  currency: string;
  themes: unknown;
  allocationBucket: string;
  quantity: number;
  avgCost: number;
  marketPrice: number;
  marketValueAed: number;
  unrealizedPnlAed: number;
  weightPct: number;
  beta: number;
  correlationTag: string;
  stopDistancePct: number;
  openRiskAed: number;
}): Holding {
  return {
    id: record.id,
    ticker: record.ticker,
    name: record.name,
    assetClass: record.assetClass,
    sector: record.sector,
    region: record.region,
    currency: record.currency,
    themes: record.themes as string[],
    allocationBucket: record.allocationBucket as Holding["allocationBucket"],
    quantity: record.quantity,
    avgCost: record.avgCost,
    marketPrice: record.marketPrice,
    marketValueAed: record.marketValueAed,
    unrealizedPnlAed: record.unrealizedPnlAed,
    weightPct: record.weightPct,
    beta: record.beta,
    correlationTag: record.correlationTag,
    stopDistancePct: record.stopDistancePct,
    openRiskAed: record.openRiskAed,
  };
}

function toWatchlistItem(record: {
  id: string;
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  region: string;
  currency: string;
  themes: unknown;
  priority: string;
  targetEntry: string;
  thesis: string;
  candidateAllocationPct: number;
  candidateBucket: string;
}): PortfolioWatchlistItem {
  return {
    id: record.id,
    ticker: record.ticker,
    name: record.name,
    assetClass: record.assetClass,
    sector: record.sector,
    region: record.region,
    currency: record.currency,
    themes: record.themes as string[],
    priority: record.priority as PortfolioWatchlistItem["priority"],
    targetEntry: record.targetEntry,
    thesis: record.thesis,
    candidateAllocationPct: record.candidateAllocationPct,
    candidateBucket: record.candidateBucket as PortfolioWatchlistItem["candidateBucket"],
  };
}

export const prismaPortfolioProvider: PortfolioProvider = {
  async getHoldings() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const records = await prisma.holding.findMany({
      orderBy: { marketValueAed: "desc" },
    });

    return records.map(toHolding);
  },
  async getWatchlist() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const records = await prisma.watchlistItem.findMany({
      orderBy: [{ priority: "asc" }, { candidateAllocationPct: "desc" }],
    });

    return records.map(toWatchlistItem);
  },
  async createHolding(input: HoldingInput) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const avgCost = Number((input.investedAmountAed / input.quantity).toFixed(2));
    const marketPrice = Number((input.currentValueAed / input.quantity).toFixed(2));
    const unrealizedPnlAed = Number((input.currentValueAed - input.investedAmountAed).toFixed(0));
    const openRiskAed = Number((input.currentValueAed * (input.stopDistancePct / 100)).toFixed(0));

    const created = await prisma.holding.create({
      data: {
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
        openRiskAed,
      },
    });

    await normalizeHoldingWeights();

    const refreshed = await prisma.holding.findUnique({ where: { id: created.id } });
    if (!refreshed) {
      throw new Error("Created holding could not be reloaded");
    }

    return toHolding(refreshed);
  },
  async updateHolding(id: string, input: HoldingInput) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const avgCost = Number((input.investedAmountAed / input.quantity).toFixed(2));
    const marketPrice = Number((input.currentValueAed / input.quantity).toFixed(2));
    const unrealizedPnlAed = Number((input.currentValueAed - input.investedAmountAed).toFixed(0));
    const openRiskAed = Number((input.currentValueAed * (input.stopDistancePct / 100)).toFixed(0));

    await prisma.holding.update({
      where: { id },
      data: {
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
        beta: input.beta,
        correlationTag: input.correlationTag,
        stopDistancePct: input.stopDistancePct,
        openRiskAed,
      },
    });

    await normalizeHoldingWeights();

    const refreshed = await prisma.holding.findUnique({ where: { id } });
    if (!refreshed) {
      throw new Error("Updated holding could not be reloaded");
    }

    return toHolding(refreshed);
  },
  async deleteHolding(id: string) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    await prisma.holding.delete({
      where: { id },
    });

    await normalizeHoldingWeights();
  },
};

async function normalizeHoldingWeights() {
  const holdings = await prisma.holding.findMany({
    select: {
      id: true,
      marketValueAed: true,
    },
  });

  const total = holdings.reduce((sum, holding) => sum + holding.marketValueAed, 0);
  await prisma.$transaction(
    holdings.map((holding) =>
      prisma.holding.update({
        where: { id: holding.id },
        data: {
          weightPct: total > 0 ? Number(((holding.marketValueAed / total) * 100).toFixed(1)) : 0,
        },
      }),
    ),
  );
}
