import type {
  AgentName,
  AgentService,
  MacroGeopoliticsAgentEnvelope,
  MacroGeopoliticsAgentRequest,
  MacroGeopoliticsAgentResponse,
  NewsAgentEnvelope,
  NewsAgentRequest,
  NewsAgentResponse,
  OpportunityAgentEnvelope,
  OpportunityAgentRequest,
  OpportunityAgentResponse,
  RiskOfficerAgentEnvelope,
  RiskOfficerAgentRequest,
  RiskOfficerAgentResponse,
} from "@/schemas/agents";
import { invokeMacroGeopoliticsAgent } from "@/services/agents/macro-geopolitics-agent";
import { invokeNewsAgent } from "@/services/agents/news-agent";
import { invokeOpportunityAgent } from "@/services/agents/opportunity-agent";
import { invokeRiskOfficerAgent } from "@/services/agents/risk-officer-agent";

export const agentServiceRegistry = {
  "News Agent": invokeNewsAgent,
  "Macro/Geopolitics Agent": invokeMacroGeopoliticsAgent,
  "Opportunity Agent": invokeOpportunityAgent,
  "Risk Officer Agent": invokeRiskOfficerAgent,
} satisfies {
  "News Agent": AgentService<NewsAgentRequest, NewsAgentResponse>;
  "Macro/Geopolitics Agent": AgentService<
    MacroGeopoliticsAgentRequest,
    MacroGeopoliticsAgentResponse
  >;
  "Opportunity Agent": AgentService<OpportunityAgentRequest, OpportunityAgentResponse>;
  "Risk Officer Agent": AgentService<RiskOfficerAgentRequest, RiskOfficerAgentResponse>;
};

export function getAgentService(agent: "News Agent"): AgentService<NewsAgentRequest, NewsAgentResponse>;
export function getAgentService(
  agent: "Macro/Geopolitics Agent",
): AgentService<MacroGeopoliticsAgentRequest, MacroGeopoliticsAgentResponse>;
export function getAgentService(
  agent: "Opportunity Agent",
): AgentService<OpportunityAgentRequest, OpportunityAgentResponse>;
export function getAgentService(
  agent: "Risk Officer Agent",
): AgentService<RiskOfficerAgentRequest, RiskOfficerAgentResponse>;
export function getAgentService(agent: AgentName) {
  return agentServiceRegistry[agent];
}

export function invokeAgentByName(
  agent: "News Agent",
  request: NewsAgentRequest,
): NewsAgentEnvelope;
export function invokeAgentByName(
  agent: "Macro/Geopolitics Agent",
  request: MacroGeopoliticsAgentRequest,
): MacroGeopoliticsAgentEnvelope;
export function invokeAgentByName(
  agent: "Opportunity Agent",
  request: OpportunityAgentRequest,
): OpportunityAgentEnvelope;
export function invokeAgentByName(
  agent: "Risk Officer Agent",
  request: RiskOfficerAgentRequest,
): RiskOfficerAgentEnvelope;
export function invokeAgentByName(
  agent: AgentName,
  request:
    | NewsAgentRequest
    | MacroGeopoliticsAgentRequest
    | OpportunityAgentRequest
    | RiskOfficerAgentRequest,
) {
  const service = agentServiceRegistry[agent] as AgentService<
    typeof request,
    NewsAgentResponse | MacroGeopoliticsAgentResponse | OpportunityAgentResponse | RiskOfficerAgentResponse
  >;

  return service(request);
}

export {
  invokeMacroGeopoliticsAgent,
  invokeNewsAgent,
  invokeOpportunityAgent,
  invokeRiskOfficerAgent,
};
