import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny } from "zod";

import type { AgentEnvelope, AgentService } from "@/schemas/agents";

function buildValidationError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export async function handleAgentRequest<TRequest, TResponse>(
  request: Request,
  schema: ZodTypeAny,
  service: AgentService<TRequest, TResponse>,
) {
  try {
    const body = await request.json();
    const parsedBody = schema.parse(body) as TRequest;
    const result = (await service(parsedBody)) as AgentEnvelope<TResponse>;

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid agent request payload",
          issues: buildValidationError(error),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Unable to process agent request",
      },
      { status: 500 },
    );
  }
}
