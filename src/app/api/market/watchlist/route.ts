import { NextResponse } from "next/server";

import { buildMockQuote, buildMockWatchlistQuotes, getGlobalQuote } from "@/lib/providers/alphaVantage";
import { cycleOsProviders } from "@/providers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseLimit(value: string | null) {
  const parsed = Number(value ?? "5");
  if (!Number.isFinite(parsed)) return 5;
  return Math.max(1, Math.min(8, Math.trunc(parsed)));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get("limit"));
  const symbols = searchParams
    .get("symbols")
    ?.split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  const watchlist = cycleOsProviders.portfolio
    .getWatchlist()
    .filter((item) => (symbols?.length ? symbols.includes(item.ticker) : true))
    .slice(0, limit);

  if (!watchlist.length) {
    return NextResponse.json({
      items: buildMockWatchlistQuotes(limit),
      source: "mock",
    });
  }

  const items = await Promise.all(
    watchlist.map(async (item) => {
      try {
        const quote = await getGlobalQuote(item.ticker);
        return {
          ...item,
          quote,
        };
      } catch {
        return {
          ...item,
          quote: buildMockQuote(item.ticker),
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
