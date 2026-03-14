import { Prisma, PrismaClient } from "@prisma/client";
import {
  seedAssets,
  seedGeopoliticalEvents,
  seedHoldings,
  seedJournalEntries,
  seedMacroEvents,
  seedWatchlistItems,
} from "../src/mock-data/seed-data";

const prisma = new PrismaClient();

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function main() {
  const assetSeedData: Prisma.AssetCreateManyInput[] = seedAssets.map((asset) => ({
    ticker: asset.ticker,
    name: asset.name,
    assetClass: asset.assetClass,
    region: asset.region,
    sector: asset.sector,
    currency: asset.currency,
    themes: toJson(asset.themes),
    allocationBucket: asset.allocationBucket,
    price: asset.price,
    changePct: asset.changePct,
    volumeScore: asset.volumeScore,
    momentumScore: asset.momentumScore,
    trendScore: asset.trendScore,
    relativeScore: asset.relativeScore,
    volatilityScore: asset.volatilityScore,
    valuationScore: asset.valuationScore,
    macroFitScore: asset.macroFitScore,
    geoFitScore: asset.geoFitScore,
    liquidityScore: asset.liquidityScore,
    catalystScore: asset.catalystScore,
    opportunityScore: asset.opportunityScore,
    technicalSetup: toJson(asset.technicalSetup),
    technicalInsight: toJson(asset.technicalInsight),
    executionPlan: toJson(asset.executionPlan),
    catalyst: asset.catalyst,
    direction: asset.direction,
    stopDistancePct: asset.stopDistancePct,
    conviction: asset.conviction,
    shortThesis: asset.shortThesis,
    regimeFitText: asset.regimeFitText,
    macroReasons: toJson(asset.macroReasons),
    geopoliticalNotes: toJson(asset.geopoliticalNotes),
  }));

  await prisma.asset.createMany({ data: assetSeedData, skipDuplicates: true });
  await prisma.holding.createMany({ data: seedHoldings, skipDuplicates: true });
  await prisma.watchlistItem.createMany({ data: seedWatchlistItems, skipDuplicates: true });
  await prisma.macroEvent.createMany({ data: seedMacroEvents, skipDuplicates: true });
  await prisma.geopoliticalEvent.createMany({
    data: seedGeopoliticalEvents,
    skipDuplicates: true,
  });
  await prisma.journalEntry.createMany({
    data: seedJournalEntries,
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
