import assert from "node:assert/strict";
import test from "node:test";

import { DELETE as deleteHolding, PUT as updateHolding } from "@/app/api/portfolio/holdings/[id]/route";
import { GET as getHoldings, POST as createHolding } from "@/app/api/portfolio/holdings/route";

test("portfolio holdings route returns holdings", async () => {
  const response = await getHoldings();
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.ok(Array.isArray(json));
  assert.ok(json.length > 0);
});

test("portfolio holdings route creates a holding", async () => {
  const response = await createHolding(
    new Request("http://localhost/api/portfolio/holdings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ticker: "TEST-1",
        name: "Test Holding",
        assetClass: "Others",
        sector: "Private Asset",
        region: "United Arab Emirates",
        currency: "AED",
        themes: ["test"],
        allocationBucket: "core",
        quantity: 1,
        investedAmountAed: 10000,
        currentValueAed: 10500,
        beta: 0.2,
        correlationTag: "Test Book",
        stopDistancePct: 3,
      }),
    }),
  );

  assert.equal(response.status, 200);
  const json = await response.json();
  assert.equal(json.ticker, "TEST-1");

  await deleteHolding(new Request(`http://localhost/api/portfolio/holdings/${json.id}`), {
    params: Promise.resolve({ id: json.id }),
  });
});

test("portfolio holdings route updates a holding", async () => {
  const created = await createHolding(
    new Request("http://localhost/api/portfolio/holdings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ticker: "TEST-2",
        name: "Editable Holding",
        assetClass: "Equity",
        sector: "Technology",
        region: "United States",
        currency: "USD",
        themes: ["growth"],
        allocationBucket: "tactical",
        quantity: 10,
        investedAmountAed: 20000,
        currentValueAed: 24000,
        beta: 1.1,
        correlationTag: "Growth",
        stopDistancePct: 5,
      }),
    }),
  );

  const holding = await created.json();
  const response = await updateHolding(
    new Request(`http://localhost/api/portfolio/holdings/${holding.id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ticker: "TEST-2",
        name: "Editable Holding Updated",
        assetClass: "Equity",
        sector: "Technology",
        region: "United States",
        currency: "USD",
        themes: ["growth", "updated"],
        allocationBucket: "core",
        quantity: 10,
        investedAmountAed: 20000,
        currentValueAed: 25000,
        beta: 1.1,
        correlationTag: "Growth",
        stopDistancePct: 5,
      }),
    }),
    { params: Promise.resolve({ id: holding.id }) },
  );

  assert.equal(response.status, 200);
  const json = await response.json();
  assert.equal(json.name, "Editable Holding Updated");

  await deleteHolding(new Request(`http://localhost/api/portfolio/holdings/${holding.id}`), {
    params: Promise.resolve({ id: holding.id }),
  });
});

test("portfolio holdings route deletes a holding", async () => {
  const created = await createHolding(
    new Request("http://localhost/api/portfolio/holdings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ticker: "TEST-3",
        name: "Delete Holding",
        assetClass: "Others",
        sector: "Private Asset",
        region: "United Arab Emirates",
        currency: "AED",
        themes: ["delete"],
        allocationBucket: "core",
        quantity: 1,
        investedAmountAed: 5000,
        currentValueAed: 5100,
        beta: 0.1,
        correlationTag: "Test Book",
        stopDistancePct: 2,
      }),
    }),
  );

  const holding = await created.json();
  const response = await deleteHolding(new Request(`http://localhost/api/portfolio/holdings/${holding.id}`), {
    params: Promise.resolve({ id: holding.id }),
  });

  assert.equal(response.status, 200);
});
