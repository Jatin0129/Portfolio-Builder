import { cycleOsProviders } from "@/providers";
import { buildBehavioralReview, buildJournalAnalytics, getJournalEntries } from "@/services/journal-service";
import { getUserSettings } from "@/services/settings-service";
import type {
  Holding,
  InvestmentAssetCategory,
  JournalEntry,
  MdbCategorySummary,
  MdbInvestmentItem,
  MdbInvestmentsSnapshot,
  MdbJournalSnapshot,
  MdbOverviewSnapshot,
} from "@/types";

function round(value: number, digits = 1) {
  return Number(value.toFixed(digits));
}

function inferCategory({
  assetCategory,
  assetClass,
  sector,
  ticker,
}: {
  assetCategory?: InvestmentAssetCategory;
  assetClass?: string;
  sector?: string;
  ticker?: string;
}): InvestmentAssetCategory {
  if (assetCategory) return assetCategory;

  const normalizedClass = (assetClass ?? "").toLowerCase();
  const normalizedSector = (sector ?? "").toLowerCase();
  const normalizedTicker = (ticker ?? "").toUpperCase();

  if (
    normalizedClass.includes("real estate") ||
    normalizedSector.includes("real estate") ||
    normalizedSector.includes("residential") ||
    normalizedTicker.startsWith("DXB-RE")
  ) {
    return "Real Estate";
  }

  if (
    normalizedClass.includes("bond") ||
    normalizedSector.includes("bond") ||
    normalizedSector.includes("rates") ||
    normalizedSector.includes("credit") ||
    ["BND", "TLT", "HYG", "AGG"].includes(normalizedTicker)
  ) {
    return "Bonds";
  }

  if (normalizedClass.includes("equity")) {
    return "Equity";
  }

  if (
    normalizedClass.includes("etf") &&
    !normalizedSector.includes("precious") &&
    !normalizedSector.includes("crypto") &&
    !normalizedSector.includes("energy proxy")
  ) {
    return "Equity";
  }

  return "Others";
}

function buildHoldingInvestment(holding: Holding): MdbInvestmentItem {
  const investedAed = holding.marketValueAed - holding.unrealizedPnlAed;
  const pnlPct = investedAed > 0 ? round((holding.unrealizedPnlAed / investedAed) * 100) : 0;

  return {
    id: holding.id,
    code: holding.ticker,
    name: holding.name,
    category: inferCategory({
      assetClass: holding.assetClass,
      sector: holding.sector,
      ticker: holding.ticker,
    }),
    vehicle: holding.assetClass,
    sector: holding.sector,
    status: "Active",
    region: holding.region,
    currency: holding.currency,
    investedAed,
    currentValueAed: holding.marketValueAed,
    pnlAed: holding.unrealizedPnlAed,
    pnlPct,
    notes: holding.themes.slice(0, 3),
    source: "portfolio",
    quantity: holding.quantity,
    allocationBucket: holding.allocationBucket,
    beta: holding.beta,
    correlationTag: holding.correlationTag,
    stopDistancePct: holding.stopDistancePct,
  };
}

function buildEntryInvestment(entry: JournalEntry): MdbInvestmentItem {
  const quantity = entry.quantity ?? 1;
  const investedAed = entry.investedAmountAed ?? entry.entryPrice * quantity;
  const currentValueAed =
    entry.currentValueAed ??
    (entry.status === "CLOSED"
      ? (entry.exitPrice ?? entry.entryPrice) * quantity
      : entry.entryPrice * quantity);
  const pnlAed =
    entry.status === "CLOSED"
      ? entry.realizedPnlAed ?? currentValueAed - investedAed
      : currentValueAed - investedAed;
  const pnlPct = investedAed > 0 ? round((pnlAed / investedAed) * 100) : 0;

  return {
    id: entry.id,
    code: entry.ticker,
    name: entry.assetName ?? entry.ticker,
    category: inferCategory({
      assetCategory: entry.assetCategory,
      ticker: entry.ticker,
    }),
    vehicle: entry.setupName,
    sector: entry.assetCategory,
    status: entry.status === "CLOSED" ? "Closed" : "Active",
    region: entry.location ?? entry.account ?? "Journal",
    currency: "AED",
    investedAed,
    currentValueAed,
    pnlAed,
    pnlPct,
    notes: [...entry.setupTags.slice(0, 2), ...entry.entryReasons.slice(0, 1)],
    source: "journal",
    quantity,
    openedAt: entry.openedAt,
    closedAt: entry.closedAt,
  };
}

function summarizeCategories(items: MdbInvestmentItem[]): MdbCategorySummary[] {
  const totalCurrentValue = items.reduce((sum, item) => sum + item.currentValueAed, 0);
  const order: InvestmentAssetCategory[] = ["Equity", "Bonds", "Real Estate", "Others"];

  return order.map((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    const currentValueAed = categoryItems.reduce((sum, item) => sum + item.currentValueAed, 0);
    const investedAed = categoryItems.reduce((sum, item) => sum + item.investedAed, 0);
    return {
      category,
      investedAed,
      currentValueAed,
      pnlAed: currentValueAed - investedAed,
      weightPct: totalCurrentValue > 0 ? round((currentValueAed / totalCurrentValue) * 100) : 0,
      itemCount: categoryItems.length,
    };
  });
}

async function getBaseData() {
  const [settings, entries, holdings] = await Promise.all([
    getUserSettings(),
    getJournalEntries(),
    cycleOsProviders.portfolio.getHoldings(),
  ]);

  return {
    settings,
    entries: entries.slice().sort((left, right) => right.openedAt.localeCompare(left.openedAt)),
    holdings,
  };
}

export async function getMdbOverviewSnapshot(): Promise<MdbOverviewSnapshot> {
  const { settings, entries, holdings } = await getBaseData();
  const holdingItems = holdings.map(buildHoldingInvestment);
  const holdingCodes = new Set(holdingItems.map((item) => item.code));
  const journalOnlyActiveItems = entries
    .filter((entry) => entry.status === "OPEN" && !holdingCodes.has(entry.ticker))
    .map(buildEntryInvestment);
  const activeItems = [...holdingItems, ...journalOnlyActiveItems];
  const categories = summarizeCategories(activeItems);
  const totalInvestedAed = activeItems.reduce((sum, item) => sum + item.investedAed, 0);
  const currentValueAed = activeItems.reduce((sum, item) => sum + item.currentValueAed, 0);
  const realizedPnlAed = entries
    .filter((entry) => entry.status === "CLOSED")
    .reduce((sum, entry) => sum + (entry.realizedPnlAed ?? 0), 0);

  return {
    settings,
    totalInvestedAed,
    currentValueAed,
    unrealizedPnlAed: currentValueAed - totalInvestedAed,
    realizedPnlAed,
    activeInvestments: activeItems.length,
    closedInvestments: entries.filter((entry) => entry.status === "CLOSED").length,
    categories,
    activeItems: activeItems.sort((left, right) => right.currentValueAed - left.currentValueAed),
    recentEntries: entries.slice(0, 6),
  };
}

export async function getMdbInvestmentsSnapshot(): Promise<MdbInvestmentsSnapshot> {
  const overview = await getMdbOverviewSnapshot();

  return {
    settings: overview.settings,
    categories: overview.categories,
    investments: overview.activeItems,
  };
}

export async function getMdbJournalSnapshot(): Promise<MdbJournalSnapshot> {
  const { settings, entries, holdings } = await getBaseData();
  const holdingItems = holdings.map(buildHoldingInvestment);
  const journalOnlyItems = entries
    .filter((entry) => !holdingItems.some((item) => item.code === entry.ticker && entry.status === "OPEN"))
    .map(buildEntryInvestment);
  const categoryItems = [...holdingItems, ...journalOnlyItems.filter((item) => item.status === "Active")];

  return {
    settings,
    entries,
    analytics: buildJournalAnalytics(entries),
    behavior: buildBehavioralReview(entries, settings),
    categories: summarizeCategories(categoryItems),
  };
}
