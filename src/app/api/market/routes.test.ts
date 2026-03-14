import assert from "node:assert/strict";
import test from "node:test";

import { GET as getCandles } from "@/app/api/market/candles/route";
import { GET as getQuote } from "@/app/api/market/quote/route";
import { GET as getRsi } from "@/app/api/market/rsi/route";
import { GET as getWatchlist } from "@/app/api/market/watchlist/route";

test("quote route falls back to mock data when Alpha Vantage is unavailable", async () => {
  const response = await getQuote(new Request("http://localhost/api/market/quote?symbol=MSFT"));
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.symbol, "MSFT");
  assert.equal(json.source, "mock");
});

test("quote route validates symbol", async () => {
  const response = await getQuote(new Request("http://localhost/api/market/quote"));
  assert.equal(response.status, 400);
});

test("candles route falls back to mock candles", async () => {
  const response = await getCandles(new Request("http://localhost/api/market/candles?symbol=NVDA"));
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.symbol, "NVDA");
  assert.equal(json.source, "mock");
  assert.ok(json.candles.length > 0);
});

test("rsi route falls back to mock RSI", async () => {
  const response = await getRsi(new Request("http://localhost/api/market/rsi?symbol=IBIT&interval=daily&timePeriod=14"));
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.symbol, "IBIT");
  assert.equal(json.source, "mock");
  assert.ok(json.current > 0);
});

test("rsi route validates timePeriod", async () => {
  const response = await getRsi(new Request("http://localhost/api/market/rsi?symbol=IBIT&timePeriod=0"));
  assert.equal(response.status, 400);
});

test("watchlist route returns server-safe watchlist quotes", async () => {
  const response = await getWatchlist(new Request("http://localhost/api/market/watchlist?limit=3"));
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.items.length, 3);
  assert.ok(["mock", "mixed", "live"].includes(json.source));
  assert.ok(json.items[0].quote.symbol);
});
