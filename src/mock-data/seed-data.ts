import { getAssetUniverse, getGeopoliticalBoard, getMacroEvents } from "@/engines";
import { holdings, journalEntries, watchlist } from "@/mock-data";

const seededAssets = getAssetUniverse();
const geopoliticalBoard = getGeopoliticalBoard();
const seededMacroEvents = getMacroEvents();

export const seedAssets = seededAssets.map((asset) => ({
  ticker: asset.ticker,
  name: asset.name,
  assetClass: asset.assetClass,
  region: asset.region,
  sector: asset.sector,
  currency: asset.currency,
  themes: asset.themes,
  allocationBucket: asset.allocationBucket,
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
  technicalSetup: asset.technicalSetup,
  technicalInsight: asset.technicalInsight,
  executionPlan: asset.executionPlan,
  catalyst: asset.catalyst,
  direction: asset.direction,
  stopDistancePct: asset.stopDistancePct,
  conviction: asset.conviction,
  shortThesis: asset.shortThesis,
  regimeFitText: asset.regimeFitText,
  macroReasons: asset.macroReasons,
  geopoliticalNotes: asset.geopoliticalReasons,
}));

export const seedHoldings = holdings.map((holding) => ({
  ticker: holding.ticker,
  name: holding.name,
  assetClass: holding.assetClass,
  sector: holding.sector,
  region: holding.region,
  currency: holding.currency,
  themes: holding.themes,
  allocationBucket: holding.allocationBucket,
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

export const seedWatchlistItems = watchlist.map((item) => ({
  ticker: item.ticker,
  name: item.name,
  assetClass: item.assetClass,
  sector: item.sector,
  region: item.region,
  currency: item.currency,
  themes: item.themes,
  priority: item.priority,
  targetEntry: item.targetEntry,
  thesis: item.thesis,
  candidateAllocationPct: item.candidateAllocationPct,
  candidateBucket: item.candidateBucket,
}));

export const seedMacroEvents = seededMacroEvents.map((event) => ({
  title: event.title,
  region: event.region,
  eventDate: new Date(event.date),
  severity: event.severity,
  severityScore: event.severityScore,
  category: event.category,
  consensus: event.consensus,
  implication: event.implication,
  watchFor: event.watchFor,
  explanation: event.explanation,
}));

export const seedGeopoliticalEvents = geopoliticalBoard.events.map((event) => ({
  title: event.title,
  category: event.category,
  region: event.region,
  severity: event.severity,
  severityScore: event.severityScore,
  status: event.status,
  affectedRegions: event.affectedRegions,
  transmissionChannels: event.transmissionChannels,
  beneficiaries: event.beneficiaries,
  losers: event.losers,
  actionSuggestion: event.actionSuggestion,
  chips: event.chips,
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
