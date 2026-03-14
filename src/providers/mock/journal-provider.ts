import { journalEntries } from "@/mock-data/journal";
import type { JournalProvider } from "@/providers/interfaces";
import type { JournalEntry, JournalEntryInput, JournalExitInput } from "@/types";

function buildJournalEntry(input: JournalEntryInput): JournalEntry {
  return {
    id: `mock-${input.ticker.toLowerCase()}-${Date.now()}`,
    ticker: input.ticker,
    setupName: input.setupName,
    setupTags: input.setupTags,
    direction: input.direction,
    status: "OPEN",
    openedAt: input.openedAt,
    entryPrice: input.entryPrice,
    thesis: input.thesis,
    entryReasons: input.entryReasons,
    exitReasons: [],
    rulesFollowed: input.rulesFollowed,
    plannedRiskPct: input.plannedRiskPct,
    plannedRiskAed: input.plannedRiskAed,
    disciplineScore: input.disciplineScore,
    behaviorTags: input.rulesFollowed ? ["followed-plan"] : ["rule-break"],
    holdingHorizon: input.holdingHorizon,
    reviewNotes: input.reviewNotes,
  };
}

export const mockJournalProvider: JournalProvider = {
  async getEntries() {
    // TODO: replace with durable journal storage provider when multi-session persistence is required.
    return journalEntries;
  },
  async createEntry(entry) {
    return buildJournalEntry(entry);
  },
  async closeEntry(exit: JournalExitInput) {
    const existing = journalEntries.find((entry) => entry.id === exit.id);
    if (!existing) {
      throw new Error("Journal entry not found");
    }

    return {
      ...existing,
      status: "CLOSED",
      closedAt: exit.closedAt,
      exitPrice: exit.exitPrice,
      exitReasons: exit.exitReasons,
      rulesFollowed: exit.rulesFollowed,
      reviewNotes: exit.reviewNotes,
    };
  },
};
