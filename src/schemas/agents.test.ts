import assert from "node:assert/strict";
import test from "node:test";

import {
  macroGeopoliticsAgentRequestSchema,
  newsAgentRequestSchema,
  opportunityAgentRequestSchema,
  riskOfficerAgentRequestSchema,
} from "@/schemas/agents";
import {
  sampleMacroGeopoliticsAgentRequest,
  sampleNewsAgentRequest,
  sampleOpportunityAgentRequest,
  sampleRiskOfficerAgentRequest,
} from "@/test/agent-fixtures";

test("news schema accepts a valid payload", () => {
  const parsed = newsAgentRequestSchema.parse(sampleNewsAgentRequest);
  assert.equal(parsed.focus?.ticker, "NVDA");
});

test("news schema rejects a payload without articles", () => {
  assert.throws(() => newsAgentRequestSchema.parse({ focus: { ticker: "NVDA" }, articles: [] }));
});

test("macro schema rejects an invalid severity enum", () => {
  const invalidPayload = {
    ...sampleMacroGeopoliticsAgentRequest,
    geopoliticalEvents: [
      {
        ...sampleMacroGeopoliticsAgentRequest.geopoliticalEvents[0],
        severity: "Severe",
      },
    ],
  };

  assert.throws(() => macroGeopoliticsAgentRequestSchema.parse(invalidPayload));
});

test("opportunity schema accepts a valid payload", () => {
  const parsed = opportunityAgentRequestSchema.parse(sampleOpportunityAgentRequest);
  assert.equal(parsed.candidates.length, 3);
});

test("opportunity schema rejects wrong candidate direction", () => {
  const invalidPayload = {
    ...sampleOpportunityAgentRequest,
    candidates: [
      {
        ...sampleOpportunityAgentRequest.candidates[0],
        direction: "BUY",
      },
    ],
  };

  assert.throws(() => opportunityAgentRequestSchema.parse(invalidPayload));
});

test("risk schema accepts a valid payload", () => {
  const parsed = riskOfficerAgentRequestSchema.parse(sampleRiskOfficerAgentRequest);
  assert.equal(parsed.proposedTrades.length, 3);
});

test("risk schema rejects a payload with string entry values", () => {
  const invalidPayload = {
    ...sampleRiskOfficerAgentRequest,
    proposedTrades: [
      {
        ...sampleRiskOfficerAgentRequest.proposedTrades[0],
        entry: "980",
      },
    ],
  };

  assert.throws(() => riskOfficerAgentRequestSchema.parse(invalidPayload));
});
