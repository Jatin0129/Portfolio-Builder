import assert from "node:assert/strict";
import test from "node:test";

import {
  invokeMacroGeopoliticsAgent,
  invokeNewsAgent,
  invokeOpportunityAgent,
  invokeRiskOfficerAgent,
} from "@/services/agents";
import {
  sampleMacroGeopoliticsAgentRequest,
  sampleNewsAgentRequest,
  sampleOpportunityAgentRequest,
  sampleRiskOfficerAgentRequest,
} from "@/test/agent-fixtures";

test("news agent returns structured JSON", () => {
  const result = invokeNewsAgent(sampleNewsAgentRequest);
  assert.equal(result.agent, "News Agent");
  assert.equal(result.provider, "mock");
  assert.ok(typeof result.data.eventSummary === "string");
});

test("macro/geopolitics agent returns structured JSON", () => {
  const result = invokeMacroGeopoliticsAgent(sampleMacroGeopoliticsAgentRequest);
  assert.equal(result.agent, "Macro/Geopolitics Agent");
  assert.ok(typeof result.data.regimeImplications === "string");
});

test("opportunity agent returns categorized ideas", () => {
  const result = invokeOpportunityAgent(sampleOpportunityAgentRequest);
  assert.equal(result.agent, "Opportunity Agent");
  assert.ok(result.data.topLongIdeas.length > 0);
  assert.ok(result.data.avoidIdeas.length > 0);
});

test("risk officer agent classifies trades independently", () => {
  const result = invokeRiskOfficerAgent(sampleRiskOfficerAgentRequest);
  assert.equal(result.agent, "Risk Officer Agent");
  assert.ok(result.data.approvedTrades.length > 0);
  assert.ok(result.data.rejectedTrades.length > 0);
});
