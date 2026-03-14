import { buildBehavioralReview, buildJournalAnalytics, getJournalEntries } from "@/services/journal-service";
import { getCycleOsAppState } from "@/services/cycleos/app-state";
import type { ReviewSnapshot } from "@/types";

export async function getReviewSnapshot(): Promise<ReviewSnapshot> {
  const [state, entries] = await Promise.all([getCycleOsAppState(), getJournalEntries()]);

  return {
    entries,
    analytics: buildJournalAnalytics(entries),
    behavior: buildBehavioralReview(entries, state.settings),
    openTrades: state.tradeIdeas.ideas.filter((trade) => trade.riskVerdict.decision !== "REJECT").slice(0, 4),
  };
}
