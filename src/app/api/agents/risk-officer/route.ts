import { riskOfficerAgentRequestSchema } from "@/schemas/agents";
import { handleAgentRequest } from "@/lib/agent-route";
import { invokeRiskOfficerAgent } from "@/services/agents";

export async function POST(request: Request) {
  return handleAgentRequest(request, riskOfficerAgentRequestSchema, invokeRiskOfficerAgent);
}
