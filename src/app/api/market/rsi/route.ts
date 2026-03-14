import { NextResponse } from "next/server";

import { buildMockRsi, getRSI } from "@/lib/providers/alphaVantage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SupportedInterval = "daily" | "weekly" | "monthly";

function parseInterval(value: string | null): SupportedInterval {
  return value === "weekly" || value === "monthly" ? value : "daily";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();
  const interval = parseInterval(searchParams.get("interval"));
  const timePeriod = Number(searchParams.get("timePeriod") ?? "14");

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  if (!Number.isFinite(timePeriod) || timePeriod <= 0) {
    return NextResponse.json({ error: "timePeriod must be a positive number" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getRSI(symbol, interval, timePeriod));
  } catch {
    return NextResponse.json(buildMockRsi(symbol, interval, timePeriod));
  }
}
