import { NextResponse } from "next/server";

import { buildMockQuote, buildMockWatchlistQuotes, getGlobalQuote } from "@/lib/providers/alphaVantage";
import { getTrackedMarketInstruments } from "@/services/market-feed-service";
import type { MarketFeedCategory } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseLimit(value: string | null) {
  const parsed = Number(value ?? "5");
  if (!Number.isFinite(parsed)) return 5;
  return Math.max(1, Math.min(25, Math.trunc(parsed)));
}

function parseCategory(value: string | null): MarketFeedCategory {
  return value === "benchmarks" || value === "holdings" || value === "universe" ? value : "watchlist";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get("limit"));
  const category = parseCategory(searchParams.get("category"));
  const symbols = searchParams
    .get("symbols")
    ?.split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  const trackedItems = await getTrackedMarketInstruments(category, symbols, limit);

  if (!trackedItems.length) {
    return NextResponse.json({
      items: buildMockWatchlistQuotes(limit),
      source: "mock",
    });
  }

  const items = await Promise.all(
    trackedItems.map(async (item) => {
      try {
        const quote = await getGlobalQuote(item.symbol);
        return {
          ...item,
          quote,
        };
      } catch {
        return {
          ...item,
          quote: buildMockQuote(item.symbol),
        };
      }
    }),
  );

  const source = items.every((item) => item.quote.source === "live")
    ? "live"
    : items.every((item) => item.quote.source === "mock")
      ? "mock"
      : "mixed";

  return NextResponse.json({
    items,
    source,
  });
}
