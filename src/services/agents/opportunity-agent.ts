import {
  opportunityAgentEnvelopeSchema,
  opportunityAgentRequestSchema,
  type OpportunityAgentRequest,
  type OpportunityAgentResponse,
} from "@/schemas/agents";
import {
  buildRequestId,
  createMockEnvelope,
  includesKeyword,
  normalizeScore,
  type TypedAgentService,
} from "@/services/agents/shared";

const DEFENSIVE_KEYWORDS = [
  "defensive",
  "hedge",
  "gold",
  "treasury",
  "utilities",
  "staples",
  "health care",
];

function buildIdeaRationale(
  score: number,
  thesis: string,
  marketRegime: string | undefined,
  defensiveTilt = false,
) {
  const setupLabel = score >= 75 ? "high-conviction" : score >= 60 ? "workable" : "fragile";
  const regimeLabel = marketRegime ? ` within a ${marketRegime} backdrop` : "";
  const tiltLabel = defensiveTilt ? " and offers portfolio protection" : "";

  return `${setupLabel} setup${regimeLabel}${tiltLabel}. ${thesis}`;
}

export const invokeOpportunityAgent: TypedAgentService<
  OpportunityAgentRequest,
  OpportunityAgentResponse
> = (request) => {
  const parsedRequest = opportunityAgentRequestSchema.parse(request);
  const sortedCandidates = [...parsedRequest.candidates].sort(
    (left, right) => normalizeScore(right.score, 50) - normalizeScore(left.score, 50),
  );

  const topLongIdeas = sortedCandidates
    .filter((candidate) => candidate.direction !== "SHORT" && normalizeScore(candidate.score, 50) >= 60)
    .slice(0, 3)
    .map((candidate) => ({
      ticker: candidate.ticker,
      thesis: candidate.thesis,
      confidence: normalizeScore(candidate.score, 50),
      rationale: buildIdeaRationale(
        normalizeScore(candidate.score, 50),
        candidate.thesis,
        parsedRequest.marketContext?.regime,
      ),
    }));

  const defensiveIdeas = sortedCandidates
    .filter(
      (candidate) =>
        includesKeyword(candidate.themes, DEFENSIVE_KEYWORDS) ||
        includesKeyword([candidate.sector ?? "", candidate.name], DEFENSIVE_KEYWORDS),
    )
    .slice(0, 3)
    .map((candidate) => ({
      ticker: candidate.ticker,
      thesis: candidate.thesis,
      confidence: normalizeScore(candidate.score, 55),
      rationale: buildIdeaRationale(
        normalizeScore(candidate.score, 55),
        candidate.thesis,
        parsedRequest.marketContext?.regime,
        true,
      ),
    }));

  const restrictedTickers = new Set(parsedRequest.portfolioConstraints?.restrictedTickers ?? []);
  const avoidIdeas = sortedCandidates
    .filter(
      (candidate) =>
        normalizeScore(candidate.score, 50) < 55 || restrictedTickers.has(candidate.ticker),
    )
    .slice(0, 3)
    .map((candidate) => ({
      ticker: candidate.ticker,
      thesis: candidate.thesis,
      confidence: normalizeScore(candidate.score, 45),
      rationale: restrictedTickers.has(candidate.ticker)
        ? "Restricted by current portfolio constraints, so capital should be deployed elsewhere."
        : "Opportunity quality is not strong enough to justify prioritizing this setup right now.",
    }));

  const response = createMockEnvelope(
    "Opportunity Agent",
    buildRequestId("Opportunity Agent", [
      parsedRequest.marketContext?.regime,
      parsedRequest.candidates.length,
    ]),
    topLongIdeas.length > 0 ? "ok" : "watch",
    {
      topLongIdeas,
      defensiveIdeas,
      avoidIdeas,
    },
  );

  return opportunityAgentEnvelopeSchema.parse(response);
};
