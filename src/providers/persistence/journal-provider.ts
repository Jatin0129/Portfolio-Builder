import { prisma } from "@/lib/prisma";
import type { JournalProvider } from "@/providers/interfaces";
import type { JournalBehaviorTag, JournalEntry, JournalEntryInput, JournalExitInput } from "@/types";

function deriveBehaviorTags(
  rulesFollowed: boolean,
  plannedRiskPct: number,
  exitReasons: string[],
): JournalBehaviorTag[] {
  const tags: JournalBehaviorTag[] = [];

  if (plannedRiskPct > 1) {
    tags.push("oversized-trade");
  }

  const loweredExitReasons = exitReasons.map((reason) => reason.toLowerCase());
  if (loweredExitReasons.some((reason) => reason.includes("early"))) {
    tags.push("early-exit");
  }
  if (loweredExitReasons.some((reason) => reason.includes("stop"))) {
    tags.push("missed-stop");
  }

  tags.push(rulesFollowed ? "followed-plan" : "rule-break");

  return Array.from(new Set(tags));
}

function toJournalEntry(record: {
  id: string;
  ticker: string;
  setupName: string;
  setupTags: unknown;
  direction: JournalEntry["direction"];
  status: JournalEntry["status"];
  openedAt: Date;
  closedAt: Date | null;
  entryPrice: number;
  exitPrice: number | null;
  thesis: string;
  entryReasons: unknown;
  exitReasons: unknown;
  rulesFollowed: boolean;
  plannedRiskPct: number;
  plannedRiskAed: number;
  realizedPnlPct: number | null;
  realizedPnlAed: number | null;
  outcomeR: number | null;
  disciplineScore: number;
  mistakeTag: string | null;
  behaviorTags: unknown;
  holdingHorizon: string;
  reviewNotes: string;
}): JournalEntry {
  return {
    id: record.id,
    ticker: record.ticker,
    setupName: record.setupName,
    setupTags: record.setupTags as string[],
    direction: record.direction,
    status: record.status,
    openedAt: record.openedAt.toISOString(),
    closedAt: record.closedAt?.toISOString(),
    entryPrice: record.entryPrice,
    exitPrice: record.exitPrice ?? undefined,
    thesis: record.thesis,
    entryReasons: record.entryReasons as string[],
    exitReasons: record.exitReasons as string[],
    rulesFollowed: record.rulesFollowed,
    plannedRiskPct: record.plannedRiskPct,
    plannedRiskAed: record.plannedRiskAed,
    realizedPnlPct: record.realizedPnlPct ?? undefined,
    realizedPnlAed: record.realizedPnlAed ?? undefined,
    outcomeR: record.outcomeR ?? undefined,
    disciplineScore: record.disciplineScore,
    mistakeTag: record.mistakeTag ?? undefined,
    behaviorTags: record.behaviorTags as JournalBehaviorTag[],
    holdingHorizon: record.holdingHorizon as JournalEntry["holdingHorizon"],
    reviewNotes: record.reviewNotes,
  };
}

export const prismaJournalProvider: JournalProvider = {
  async getEntries() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const records = await prisma.journalEntry.findMany({
      orderBy: { openedAt: "desc" },
    });

    return records.map(toJournalEntry);
  },
  async createEntry(entry: JournalEntryInput) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const created = await prisma.journalEntry.create({
      data: {
        ticker: entry.ticker,
        setupName: entry.setupName,
        setupTags: entry.setupTags,
        direction: entry.direction,
        status: "OPEN",
        openedAt: new Date(entry.openedAt),
        entryPrice: entry.entryPrice,
        thesis: entry.thesis,
        entryReasons: entry.entryReasons,
        exitReasons: [],
        rulesFollowed: entry.rulesFollowed,
        plannedRiskPct: entry.plannedRiskPct,
        plannedRiskAed: entry.plannedRiskAed,
        disciplineScore: entry.disciplineScore,
        behaviorTags: deriveBehaviorTags(entry.rulesFollowed, entry.plannedRiskPct, []),
        holdingHorizon: entry.holdingHorizon,
        reviewNotes: entry.reviewNotes,
      },
    });

    return toJournalEntry(created);
  },
  async closeEntry(exit: JournalExitInput) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const existing = await prisma.journalEntry.findUnique({
      where: { id: exit.id },
    });

    if (!existing) {
      throw new Error("Journal entry not found");
    }

    const realizedPnlPct = Number((((exit.exitPrice - existing.entryPrice) / existing.entryPrice) * 100).toFixed(1));
    const realizedPnlAed = Number(((existing.plannedRiskAed * realizedPnlPct) / Math.max(existing.plannedRiskPct, 0.1)).toFixed(0));
    const outcomeR = Number((realizedPnlPct / Math.max(existing.plannedRiskPct, 0.1)).toFixed(1));

    const updated = await prisma.journalEntry.update({
      where: { id: exit.id },
      data: {
        status: "CLOSED",
        closedAt: new Date(exit.closedAt),
        exitPrice: exit.exitPrice,
        exitReasons: exit.exitReasons,
        rulesFollowed: exit.rulesFollowed,
        realizedPnlPct,
        realizedPnlAed,
        outcomeR,
        behaviorTags: deriveBehaviorTags(exit.rulesFollowed, existing.plannedRiskPct, exit.exitReasons),
        reviewNotes: exit.reviewNotes,
      },
    });

    return toJournalEntry(updated);
  },
};
