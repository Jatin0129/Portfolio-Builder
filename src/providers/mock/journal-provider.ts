import { journalEntries } from "@/mock-data/journal";
import type { JournalProvider } from "@/providers/interfaces";
import type { JournalEntry, JournalEntryInput, JournalExitInput } from "@/types";

function buildJournalEntry(input: JournalEntryInput): JournalEntry {
  return {
    id: `mock-${input.ticker.toLowerCase()}-${Date.now()}`,
    ticker: input.ticker,
    assetName: input.assetName,
    assetCategory: input.assetCategory,
    account: input.account,
    quantity: input.quantity,
    investedAmountAed: input.investedAmountAed,
    currentValueAed: input.currentValueAed,
    incomeAed: input.incomeAed,
    manager: input.manager,
    location: input.location,
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
    const created = buildJournalEntry(entry);
    journalEntries.unshift(created);
    return created;
  },
  async closeEntry(exit: JournalExitInput) {
    const index = journalEntries.findIndex((entry) => entry.id === exit.id);
    const existing = index >= 0 ? journalEntries[index] : undefined;
    if (!existing) {
      throw new Error("Journal entry not found");
    }

    const quantity = existing.quantity ?? 1;
    const investedAmountAed = existing.investedAmountAed ?? existing.entryPrice * quantity;
    const exitValueAed = exit.exitPrice * quantity;
    const realizedPnlAed = Number((exitValueAed - investedAmountAed).toFixed(0));
    const realizedPnlPct = Number(((realizedPnlAed / Math.max(investedAmountAed, 1)) * 100).toFixed(1));
    const outcomeR = Number((realizedPnlPct / Math.max(existing.plannedRiskPct, 0.1)).toFixed(1));

    const updated: JournalEntry = {
      ...existing,
      status: "CLOSED",
      closedAt: exit.closedAt,
      exitPrice: exit.exitPrice,
      exitReasons: exit.exitReasons,
      rulesFollowed: exit.rulesFollowed,
      currentValueAed: exitValueAed,
      realizedPnlPct,
      realizedPnlAed,
      outcomeR,
      reviewNotes: exit.reviewNotes,
    };
    journalEntries[index] = updated;
    return updated;
  },
};
