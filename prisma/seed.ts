import { PrismaClient } from "@prisma/client";
import {
  seedAssets,
  seedGeopoliticalEvents,
  seedHoldings,
  seedJournalEntries,
  seedMacroEvents,
  seedWatchlistItems,
} from "../src/mock-data/seed-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.asset.createMany({ data: seedAssets, skipDuplicates: true });
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
