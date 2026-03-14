import { cycleOsProviders } from "@/providers";
import type {
  BehavioralFlag,
  BehavioralReviewSnapshot,
  JournalAnalytics,
  JournalEntry,
  JournalEntryInput,
  JournalExitInput,
  UserSettings,
} from "@/types";

function round(value: number, digits = 1) {
  return Number(value.toFixed(digits));
}

function byOutcome(entries: JournalEntry[]) {
  return entries.filter((entry) => entry.status === "CLOSED" && entry.outcomeR !== undefined);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function toBehavioralFlag(entry: JournalEntry, detail: string): BehavioralFlag {
  return {
    id: entry.id,
    ticker: entry.ticker,
    setupName: entry.setupName,
    detail,
    date: entry.closedAt ?? entry.openedAt,
  };
}

export function buildJournalAnalytics(entries: JournalEntry[]): JournalAnalytics {
  const closedEntries = byOutcome(entries);
  const wins = closedEntries.filter((entry) => (entry.outcomeR ?? 0) > 0);
  const losses = closedEntries.filter((entry) => (entry.outcomeR ?? 0) <= 0);
  const setupPerformance = closedEntries.reduce<Record<string, number[]>>((accumulator, entry) => {
    accumulator[entry.setupName] = [...(accumulator[entry.setupName] ?? []), entry.outcomeR ?? 0];
    return accumulator;
  }, {});
  const setupAverages = Object.entries(setupPerformance).map(([setup, values]) => ({
    setup,
    averageOutcome: average(values),
  }));
  const mistakeCounts = entries.reduce<Record<string, number>>((accumulator, entry) => {
    if (!entry.mistakeTag) return accumulator;
    accumulator[entry.mistakeTag] = (accumulator[entry.mistakeTag] ?? 0) + 1;
    return accumulator;
  }, {});
  const monthlyCurve = closedEntries.reduce<Record<string, number[]>>((accumulator, entry) => {
    const month = new Date(entry.closedAt ?? entry.openedAt).toLocaleString("en-US", { month: "short" });
    accumulator[month] = [...(accumulator[month] ?? []), entry.disciplineScore];
    return accumulator;
  }, {});

  const averageGain = average(wins.map((entry) => entry.realizedPnlPct ?? 0));
  const averageLoss = average(losses.map((entry) => Math.abs(entry.realizedPnlPct ?? 0)));
  const winRate = closedEntries.length ? round((wins.length / closedEntries.length) * 100, 0) : 0;
  const expectancy = round(
    (winRate / 100) * average(wins.map((entry) => entry.outcomeR ?? 0)) -
      ((100 - winRate) / 100) * Math.abs(average(losses.map((entry) => entry.outcomeR ?? 0))),
  );

  return {
    winRate,
    averageGain,
    averageLoss,
    expectancy,
    averageR: average(closedEntries.map((entry) => entry.outcomeR ?? 0)),
    bestSetupType: setupAverages.sort((a, b) => b.averageOutcome - a.averageOutcome)[0]?.setup ?? "N/A",
    worstSetupType: setupAverages.sort((a, b) => a.averageOutcome - b.averageOutcome)[0]?.setup ?? "N/A",
    disciplineAverage: average(entries.map((entry) => entry.disciplineScore)),
    commonMistake:
      Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No recurring mistake",
    curve: Object.entries(monthlyCurve).map(([month, scores]) => ({
      month,
      score: average(scores),
    })),
  };
}

export function buildBehavioralReview(
  entries: JournalEntry[],
  settings: UserSettings,
): BehavioralReviewSnapshot {
  const oversizedTrades = entries
    .filter(
      (entry) =>
        entry.plannedRiskPct > settings.maxRiskPerTradePct ||
        entry.behaviorTags.includes("oversized-trade"),
    )
    .map((entry) =>
      toBehavioralFlag(
        entry,
        `Planned risk ${entry.plannedRiskPct}% exceeded the ${settings.maxRiskPerTradePct}% per-trade limit.`,
      ),
    );

  const earlyExits = entries
    .filter(
      (entry) =>
        entry.behaviorTags.includes("early-exit") ||
        entry.exitReasons.some((reason) => reason.toLowerCase().includes("early")),
    )
    .map((entry) =>
      toBehavioralFlag(entry, "Exit occurred before the original plan fully played out."),
    );

  const missedStops = entries
    .filter(
      (entry) =>
        entry.behaviorTags.includes("missed-stop") ||
        entry.exitReasons.some((reason) => reason.toLowerCase().includes("stop")),
    )
    .map((entry) => toBehavioralFlag(entry, "Stop discipline slipped relative to the planned risk process."));

  const tradeCountsByDay = entries.reduce<Record<string, number>>((accumulator, entry) => {
    const date = entry.openedAt.slice(0, 10);
    accumulator[date] = (accumulator[date] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    oversizedTrades,
    earlyExits,
    missedStops,
    overtradingPatterns: Object.entries(tradeCountsByDay)
      .filter(([, count]) => count >= 2)
      .map(([date, count]) => ({
        date,
        tradeCount: count,
        note: `More than one trade was initiated on ${date}, which may indicate reduced selectivity.`,
      })),
  };
}

export async function getJournalEntries() {
  return cycleOsProviders.journal.getEntries();
}

export async function createJournalEntry(entry: JournalEntryInput) {
  return cycleOsProviders.journal.createEntry(entry);
}

export async function closeJournalEntry(exit: JournalExitInput) {
  return cycleOsProviders.journal.closeEntry(exit);
}
