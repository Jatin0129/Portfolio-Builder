import assert from "node:assert/strict";
import test from "node:test";

import { POST as postMacroGeopolitics } from "@/app/api/agents/macro-geopolitics/route";
import { POST as postNews } from "@/app/api/agents/news/route";
import { POST as postOpportunity } from "@/app/api/agents/opportunity/route";
import { POST as postRiskOfficer } from "@/app/api/agents/risk-officer/route";
import {
  sampleMacroGeopoliticsAgentRequest,
  sampleNewsAgentRequest,
  sampleOpportunityAgentRequest,
  sampleRiskOfficerAgentRequest,
} from "@/test/agent-fixtures";

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

test("news route returns a valid response", async () => {
  const response = await postNews(buildRequest(sampleNewsAgentRequest));
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.agent, "News Agent");
});

test("news route returns 400 on invalid payload", async () => {
  const response = await postNews(buildRequest({ articles: [] }));
  assert.equal(response.status, 400);
});

test("macro/geopolitics route returns a valid response", async () => {
  const response = await postMacroGeopolitics(buildRequest(sampleMacroGeopoliticsAgentRequest));
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.agent, "Macro/Geopolitics Agent");
});

test("macro/geopolitics route returns 400 on invalid payload", async () => {
  const response = await postMacroGeopolitics(
    buildRequest({
      ...sampleMacroGeopoliticsAgentRequest,
      geopoliticalEvents: [],
    }),
  );
  assert.equal(response.status, 400);
});

test("opportunity route returns a valid response", async () => {
  const response = await postOpportunity(buildRequest(sampleOpportunityAgentRequest));
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.agent, "Opportunity Agent");
});

test("opportunity route returns 400 on invalid payload", async () => {
  const response = await postOpportunity(
    buildRequest({
      ...sampleOpportunityAgentRequest,
      candidates: [{ ticker: "NVDA" }],
    }),
  );
  assert.equal(response.status, 400);
});

test("risk officer route returns a valid response", async () => {
  const response = await postRiskOfficer(buildRequest(sampleRiskOfficerAgentRequest));
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.equal(json.agent, "Risk Officer Agent");
});

test("risk officer route returns 400 on invalid payload", async () => {
  const response = await postRiskOfficer(
    buildRequest({
      ...sampleRiskOfficerAgentRequest,
      proposedTrades: [{ ticker: "NVDA" }],
    }),
  );
  assert.equal(response.status, 400);
});
