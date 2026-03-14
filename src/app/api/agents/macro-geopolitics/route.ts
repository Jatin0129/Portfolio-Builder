import { macroGeopoliticsAgentRequestSchema } from "@/schemas/agents";
import { handleAgentRequest } from "@/lib/agent-route";
import { invokeMacroGeopoliticsAgent } from "@/services/agents";

export async function POST(request: Request) {
  return handleAgentRequest(
    request,
    macroGeopoliticsAgentRequestSchema,
    invokeMacroGeopoliticsAgent,
  );
}
