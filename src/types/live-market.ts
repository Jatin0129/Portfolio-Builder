import type { PortfolioWatchlistItem } from "@/types/portfolio";

export interface LiveMarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  latestTradingDay: string;
  volume?: number;
  source: "live" | "mock";
}

export interface LiveMarketCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LiveMarketRsiPoint {
  date: string;
  value: number;
}

export interface LiveMarketRsi {
  symbol: string;
  interval: string;
  timePeriod: number;
  current: number;
  points: LiveMarketRsiPoint[];
  source: "live" | "mock";
}

export interface LiveMarketWatchlistItem extends PortfolioWatchlistItem {
  quote: LiveMarketQuote;
}
