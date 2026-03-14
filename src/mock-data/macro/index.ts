import type { CatalystItem, MacroEvent, SectorHeatmapItem } from "@/types";

export const macroEvents: MacroEvent[] = [
  {
    id: "macro-1",
    title: "US CPI",
    region: "United States",
    date: "2026-03-18",
    severity: "Critical",
    category: "Inflation",
    consensus: "2.9% YoY",
    implication: "A downside surprise would reinforce duration support and a broader risk-on stance.",
  },
  {
    id: "macro-2",
    title: "FOMC Rate Decision",
    region: "United States",
    date: "2026-03-20",
    severity: "Critical",
    category: "Central Bank",
    consensus: "Hold",
    implication: "Forward guidance matters more than the rate decision for growth and tech leadership.",
  },
  {
    id: "macro-3",
    title: "China Credit Impulse",
    region: "China",
    date: "2026-03-22",
    severity: "High",
    category: "Liquidity",
    consensus: "Incremental easing",
    implication: "Supports cyclicals, industrial metals, and emerging market beta if confirmed.",
  },
  {
    id: "macro-4",
    title: "ECB Staff Projections",
    region: "Europe",
    date: "2026-03-24",
    severity: "Moderate",
    category: "Growth",
    consensus: "Soft upgrade",
    implication: "Could improve confidence in European cyclicals but may steepen rates if inflation persists.",
  },
];

export const sectorHeatmap: SectorHeatmapItem[] = [
  { sector: "Semiconductors", performance1W: 3.8, performance1M: 8.1, regimeFit: 86 },
  { sector: "Industrials", performance1W: 2.1, performance1M: 4.9, regimeFit: 79 },
  { sector: "Energy", performance1W: -0.8, performance1M: 2.7, regimeFit: 68 },
  { sector: "Healthcare", performance1W: 1.4, performance1M: 1.9, regimeFit: 63 },
  { sector: "Consumer Staples", performance1W: -1.1, performance1M: -0.4, regimeFit: 44 },
];

export const catalysts: CatalystItem[] = [
  {
    id: "cat-1",
    asset: "NVDA",
    title: "Cloud capex round-up",
    date: "2026-03-21",
    severity: "High",
    impact: "Positive demand read-through could extend semiconductor leadership.",
  },
  {
    id: "cat-2",
    asset: "XLI",
    title: "US infrastructure procurement update",
    date: "2026-03-26",
    severity: "Moderate",
    impact: "Would support industrial breadth and order-book visibility.",
  },
  {
    id: "cat-3",
    asset: "GLD",
    title: "Fed dots and real yields",
    date: "2026-03-20",
    severity: "Critical",
    impact: "Gold direction hinges on real-rate reaction more than the headline decision.",
  },
];
