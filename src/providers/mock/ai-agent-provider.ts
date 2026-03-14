import {
  runMacroGeopoliticsAgent,
  runNewsAgent,
  runOpportunityAgent,
  runRiskOfficerAgent,
} from "@/engines";
import type { AiAgentProvider } from "@/providers/interfaces";

export const mockAiAgentProvider: AiAgentProvider = {
  runNewsAgent,
  runMacroGeopoliticsAgent,
  runOpportunityAgent,
  runRiskOfficerAgent,
};
