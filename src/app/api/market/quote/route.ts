import { NextResponse } from "next/server";

import { buildMockQuote, getGlobalQuote } from "@/lib/providers/alphaVantage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getGlobalQuote(symbol));
  } catch {
    return NextResponse.json(buildMockQuote(symbol));
  }
}
