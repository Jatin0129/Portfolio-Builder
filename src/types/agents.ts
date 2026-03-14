import type { AgentName, RiskDecision } from "@/types/core";

export interface StructuredAgentResponse<TPayload> {
  agent: AgentName;
  asOf: string;
  status: "ok" | "watch";
  payload: TPayload;
}

export interface NewsAgentPayload {
  headline: string;
  sentiment: "positive" | "neutral" | "negative";
  impactedTickers: string[];
  actionBias: string;
}

export interface MacroAgentPayload {
  macroRegime: string;
  geopoliticalOverlay: string;
  keyDrivers: string[];
  watchItems: string[];
}

export interface OpportunityAgentPayload {
  ticker: string;
  score: number;
  thesis: string;
  supportingFactors: string[];
  executionBias: string;
}

export interface RiskOfficerPayload {
  ticker: string;
  decision: RiskDecision;
  reasons: string[];
  approvedRiskAed: number;
}
