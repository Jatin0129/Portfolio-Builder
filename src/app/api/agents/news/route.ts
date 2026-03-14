import { newsAgentRequestSchema } from "@/schemas/agents";
import { invokeNewsAgent } from "@/services/agents";
import { handleAgentRequest } from "@/lib/agent-route";

export async function POST(request: Request) {
  return handleAgentRequest(request, newsAgentRequestSchema, invokeNewsAgent);
}
