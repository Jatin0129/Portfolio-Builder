import assert from "node:assert/strict";
import test from "node:test";

import { geopoliticalEvents } from "@/mock-data/geopolitics";
import { journalEntries } from "@/mock-data/journal";
import { catalysts, macroEvents, macroState } from "@/mock-data/macro";
import { assetUniverse } from "@/mock-data/market-data";
import { holdings, watchlist } from "@/mock-data/portfolio";

test("seeded market universe stays broad and consistent across demo records", () => {
  const assetTickers = new Set(assetUniverse.map((asset) => asset.ticker));

  assert.equal(assetUniverse.length, 25);

  for (const holding of holdings) {
    assert.ok(assetTickers.has(holding.ticker), `holding ${holding.ticker} missing from asset universe`);
  }

  for (const item of watchlist) {
    assert.ok(assetTickers.has(item.ticker), `watchlist ${item.ticker} missing from asset universe`);
  }

  for (const entry of journalEntries) {
    assert.ok(assetTickers.has(entry.ticker), `journal ${entry.ticker} missing from asset universe`);
  }

  for (const catalyst of catalysts) {
    assert.ok(assetTickers.has(catalyst.asset), `catalyst ${catalyst.asset} missing from asset universe`);
  }
});

test("macro and geopolitical scenario stays anchored to the same demo window", () => {
  const macroAsOf = new Date(macroState.asOf).getTime();
  const latestMacroEvent = Math.max(...macroEvents.map((event) => new Date(event.date).getTime()));

  assert.ok(macroEvents.length >= 5);
  assert.ok(geopoliticalEvents.length >= 5);
  assert.ok(latestMacroEvent >= macroAsOf, "macro events should sit on or after the macro as-of date");
});
