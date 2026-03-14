import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getDashboardSnapshot, getPortfolioSnapshot, getReviewSnapshot } from "@/services/cycleos-service";

const enginePaths = [
  "src/engines/ai-agents/index.ts",
  "src/engines/factor-scoring/index.ts",
  "src/engines/geopolitics/index.ts",
  "src/engines/macro/index.ts",
  "src/engines/market-data/index.ts",
  "src/engines/trade-ideas/index.ts",
];

test("core engines no longer import mock-data directly", () => {
  for (const path of enginePaths) {
    const file = readFileSync(path, "utf8");
    assert.equal(file.includes("@/mock-data"), false, `${path} still imports mock-data directly`);
  }
});

test("provider-backed snapshot services still build page models", async () => {
  const dashboard = await getDashboardSnapshot();
  const portfolio = await getPortfolioSnapshot();
  const review = await getReviewSnapshot();

  assert.ok(dashboard.topTradeIdeas.length > 0);
  assert.ok(portfolio.holdings.length > 0);
  assert.ok(review.behavior.oversizedTrades.length >= 0);
});
