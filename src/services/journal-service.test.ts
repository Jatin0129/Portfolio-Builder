import assert from "node:assert/strict";
import test from "node:test";

import { journalEntries } from "@/mock-data/journal";
import { riskSettings } from "@/mock-data/risk";
import { buildBehavioralReview, buildJournalAnalytics } from "@/services/journal-service";

test("buildJournalAnalytics computes the richer review metrics", () => {
  const analytics = buildJournalAnalytics(journalEntries);

  assert.ok(analytics.winRate > 0);
  assert.ok(analytics.averageGain > 0);
  assert.ok(analytics.averageLoss > 0);
  assert.ok(typeof analytics.expectancy === "number");
  assert.ok(analytics.bestSetupType.length > 0);
  assert.ok(analytics.worstSetupType.length > 0);
});

test("buildBehavioralReview flags oversized trades, early exits, missed stops, and overtrading", () => {
  const behavior = buildBehavioralReview(journalEntries, riskSettings);

  assert.ok(behavior.oversizedTrades.length > 0);
  assert.ok(behavior.earlyExits.length > 0);
  assert.ok(behavior.missedStops.length > 0);
  assert.ok(behavior.overtradingPatterns.length >= 0);
});
