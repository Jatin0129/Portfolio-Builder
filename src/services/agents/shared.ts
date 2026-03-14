import type { AgentEnvelope, AgentName, AgentService, AgentStatus } from "@/schemas/agents";

export const MOCK_AGENT_AS_OF = "2026-03-14T09:00:00.000Z";

function toSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}

export function buildRequestId(agent: AgentName, seedParts: Array<string | number | undefined>) {
  const base = toSlugPart(agent);
  const seed = seedParts
    .filter((value): value is string | number => value !== undefined && value !== null && value !== "")
    .map((value) => toSlugPart(String(value)))
    .filter(Boolean)
    .join("-");

  return seed ? `${base}-${seed}` : `${base}-request`;
}

export function createMockEnvelope<TData>(
  agent: AgentName,
  requestId: string,
  status: AgentStatus,
  data: TData,
): AgentEnvelope<TData> {
  return {
    agent,
    requestId,
    asOf: MOCK_AGENT_AS_OF,
    provider: "mock",
    status,
    data,
  };
}

export function normalizeScore(score: number | undefined, fallback: number) {
  if (score === undefined || Number.isNaN(score)) return fallback;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function includesKeyword(values: string[] | undefined, keywords: string[]) {
  if (!values?.length) return false;
  const haystack = values.join(" ").toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}

export type TypedAgentService<TRequest, TResponse> = AgentService<TRequest, TResponse>;
