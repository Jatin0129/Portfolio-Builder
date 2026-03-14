import { opportunityAgentRequestSchema } from "@/schemas/agents";
import { handleAgentRequest } from "@/lib/agent-route";
import { invokeOpportunityAgent } from "@/services/agents";

export async function POST(request: Request) {
  return handleAgentRequest(request, opportunityAgentRequestSchema, invokeOpportunityAgent);
}
