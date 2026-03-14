import { assetUniverse, marketSummary } from "@/mock-data/market-data";
import { watchlist } from "@/mock-data/portfolio";
import type { LiveMarketCandle, LiveMarketQuote, LiveMarketRsi, LiveMarketWatchlistItem } from "@/types";

const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

type AlphaVantageRsiInterval = "daily" | "weekly" | "monthly";

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function getApiKey() {
  return process.env.ALPHA_VANTAGE_API_KEY;
}

function isAlphaVantageLimitResponse(payload: Record<string, unknown>) {
  return Boolean(payload.Note || payload.Information || payload["Error Message"]);
}

async function fetchAlphaVantage(params: Record<string, string>) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("ALPHA_VANTAGE_API_KEY is not configured");
  }

  const url = new URL(ALPHA_VANTAGE_BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Alpha Vantage request failed with ${response.status}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  if (isAlphaVantageLimitResponse(payload)) {
    throw new Error(String(payload.Note || payload.Information || payload["Error Message"]));
  }

  return payload;
}

function findMockInstrument(symbol: string) {
  return (
    assetUniverse.find((item) => item.ticker === symbol) ??
    watchlist.find((item) => item.ticker === symbol) ??
    marketSummary.indices.find((item) => item.ticker === symbol)
  );
}

export function buildMockQuote(symbol: string): LiveMarketQuote {
  const instrument = findMockInstrument(symbol);
  const referencePrice =
    instrument && "price" in instrument
      ? instrument.price
      : instrument && "level" in instrument
        ? instrument.level
        : 100;
  const changePercent =
    instrument && "changePct" in instrument ? instrument.changePct : 0;
  const previousClose = round(referencePrice / (1 + changePercent / 100));
  const latestTradingDay = new Date().toISOString().slice(0, 10);

  return {
    symbol,
    price: round(referencePrice),
    change: round(referencePrice - previousClose),
    changePercent: round(changePercent),
    previousClose,
    latestTradingDay,
    volume: instrument && "averageVolumeLabel" in instrument ? undefined : 1_000_000,
    source: "mock",
  };
}

export function buildMockDailySeries(symbol: string, days = 30): LiveMarketCandle[] {
  const quote = buildMockQuote(symbol);
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const series: LiveMarketCandle[] = [];

  for (let index = 0; index < days; index += 1) {
    const drift = ((seed % 11) - 5) * 0.0008;
    const wave = Math.sin((index + seed) / 3) * 0.012;
    const close = round(quote.price * (1 - index * 0.004 + wave + drift));
    const open = round(close * (1 + Math.cos((index + seed) / 4) * 0.004));
    const high = round(Math.max(open, close) * 1.008);
    const low = round(Math.min(open, close) * 0.992);
    const date = new Date(Date.now() - index * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    series.push({
      date,
      open,
      high,
      low,
      close,
      volume: 850000 + index * 14500,
    });
  }

  return series;
}

export function buildMockRsi(
  symbol: string,
  interval: AlphaVantageRsiInterval,
  timePeriod: number,
): LiveMarketRsi {
  const instrument = assetUniverse.find((item) => item.ticker === symbol);
  const baseValue = instrument
    ? round((instrument.momentum + instrument.relativeStrength) / 2, 1)
    : 50;
  const points = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(Date.now() - index * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    return {
      date,
      value: round(Math.max(20, Math.min(80, baseValue - index * 0.6)), 1),
    };
  });

  return {
    symbol,
    interval,
    timePeriod,
    current: points[0]?.value ?? baseValue,
    points,
    source: "mock",
  };
}

export function buildMockWatchlistQuotes(limit = 5): LiveMarketWatchlistItem[] {
  return watchlist.slice(0, limit).map((item) => ({
    ...item,
    quote: buildMockQuote(item.ticker),
  }));
}

export async function getGlobalQuote(symbol: string): Promise<LiveMarketQuote> {
  const payload = await fetchAlphaVantage({
    function: "GLOBAL_QUOTE",
    symbol,
  });
  const quote = payload["Global Quote"] as Record<string, string> | undefined;

  if (!quote?.["01. symbol"]) {
    throw new Error(`No Alpha Vantage quote returned for ${symbol}`);
  }

  return {
    symbol: quote["01. symbol"],
    price: Number(quote["05. price"]),
    change: Number(quote["09. change"]),
    changePercent: Number(quote["10. change percent"].replace("%", "")),
    previousClose: Number(quote["08. previous close"]),
    latestTradingDay: quote["07. latest trading day"],
    volume: Number(quote["06. volume"]),
    source: "live",
  };
}

export async function getDailySeries(symbol: string): Promise<LiveMarketCandle[]> {
  const payload = await fetchAlphaVantage({
    function: "TIME_SERIES_DAILY",
    symbol,
    outputsize: "compact",
  });
  const series = payload["Time Series (Daily)"] as Record<string, Record<string, string>> | undefined;

  if (!series) {
    throw new Error(`No Alpha Vantage daily series returned for ${symbol}`);
  }

  return Object.entries(series)
    .map(([date, candle]) => ({
      date,
      open: Number(candle["1. open"]),
      high: Number(candle["2. high"]),
      low: Number(candle["3. low"]),
      close: Number(candle["4. close"]),
      volume: Number(candle["5. volume"]),
    }))
    .sort((left, right) => right.date.localeCompare(left.date));
}

export async function getRSI(
  symbol: string,
  interval: AlphaVantageRsiInterval,
  timePeriod: number,
): Promise<LiveMarketRsi> {
  const payload = await fetchAlphaVantage({
    function: "RSI",
    symbol,
    interval,
    time_period: String(timePeriod),
    series_type: "close",
  });
  const analysis = payload["Technical Analysis: RSI"] as Record<string, { RSI: string }> | undefined;

  if (!analysis) {
    throw new Error(`No Alpha Vantage RSI returned for ${symbol}`);
  }

  const points = Object.entries(analysis)
    .map(([date, value]) => ({
      date,
      value: Number(value.RSI),
    }))
    .sort((left, right) => right.date.localeCompare(left.date));

  return {
    symbol,
    interval,
    timePeriod,
    current: points[0]?.value ?? 0,
    points,
    source: "live",
  };
}
