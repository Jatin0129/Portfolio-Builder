import {
  assetUniverse,
  geopoliticalEvents,
  holdings,
  journalEntries,
  macroEvents,
} from "@/mock-data";

export const seedAssets = assetUniverse.map((asset) => ({
  ticker: asset.ticker,
  name: asset.name,
  assetClass: asset.assetClass,
  region: asset.region,
  sector: asset.sector,
  currency: asset.currency,
  price: asset.price,
  changePct: asset.changePct,
  volumeScore: asset.liquidity,
  momentumScore: asset.momentum,
  trendScore: asset.trendStructure,
  relativeScore: asset.relativeStrength,
  volatilityScore: asset.volatilityQuality,
  valuationScore: asset.valuationSanity,
  macroFitScore: asset.macroFit,
  geoFitScore: asset.geopoliticalFit,
  liquidityScore: asset.liquidity,
  catalystScore: asset.catalystStrength,
  opportunityScore: 0,
  technicalSetup: JSON.stringify(asset.technicalSetup),
  macroReasons: asset.macroReasons,
  geopoliticalNotes: asset.geopoliticalReasons,
}));

export const seedHoldings = holdings.map((holding) => ({
  ticker: holding.ticker,
  name: holding.name,
  sector: holding.sector,
  region: holding.region,
  quantity: holding.quantity,
  avgCost: holding.avgCost,
  marketPrice: holding.marketPrice,
  marketValueAed: holding.marketValueAed,
  unrealizedPnlAed: holding.unrealizedPnlAed,
  weightPct: holding.weightPct,
  beta: holding.beta,
  correlationTag: holding.correlationTag,
  stopDistancePct: holding.stopDistancePct,
  openRiskAed: holding.openRiskAed,
}));

export const seedMacroEvents = macroEvents.map((event) => ({
  title: event.title,
  region: event.region,
  eventDate: new Date(event.date),
  severity: event.severity,
  category: event.category,
  consensus: event.consensus,
  implication: event.implication,
}));

export const seedGeopoliticalEvents = geopoliticalEvents.map((event) => ({
  title: event.title,
  region: event.region,
  severity: event.severity,
  status: event.status,
  implication: event.implication,
}));

export const seedJournalEntries = journalEntries.map((entry) => ({
  ticker: entry.ticker,
  setupName: entry.setupName,
  direction: entry.direction,
  status: entry.status,
  openedAt: new Date(entry.openedAt),
  closedAt: entry.closedAt ? new Date(entry.closedAt) : undefined,
  entryPrice: entry.entryPrice,
  exitPrice: entry.exitPrice,
  thesis: entry.thesis,
  outcomeR: entry.outcomeR,
  disciplineScore: entry.disciplineScore,
  mistakeTag: entry.mistakeTag,
  reviewNotes: entry.reviewNotes,
}));
