import {
  newsAgentEnvelopeSchema,
  newsAgentRequestSchema,
  type NewsAgentRequest,
  type NewsAgentResponse,
} from "@/schemas/agents";
import { buildRequestId, createMockEnvelope, type TypedAgentService } from "@/services/agents/shared";

export const invokeNewsAgent: TypedAgentService<NewsAgentRequest, NewsAgentResponse> = (request) => {
  const parsedRequest = newsAgentRequestSchema.parse(request);
  const primaryArticle = parsedRequest.articles[0];
  const impactedTickers = new Set<string>();

  if (parsedRequest.focus?.ticker) {
    impactedTickers.add(parsedRequest.focus.ticker);
  }

  for (const article of parsedRequest.articles) {
    for (const ticker of article.tickers ?? []) {
      impactedTickers.add(ticker);
    }
  }

  const portfolioTickers = new Set([
    ...(parsedRequest.portfolioContext?.heldTickers ?? []),
    ...(parsedRequest.portfolioContext?.watchlistTickers ?? []),
  ]);

  const impactedAssets = Array.from(impactedTickers).map((ticker) => {
    const mentionedInPortfolio = portfolioTickers.has(ticker);
    const impact =
      parsedRequest.focus?.ticker === ticker || mentionedInPortfolio ? "positive" : "mixed";

    return {
      ticker,
      impact: impact as "positive" | "mixed",
      rationale: mentionedInPortfolio
        ? `${ticker} is already in portfolio focus, so headline flow should be monitored closely.`
        : `${ticker} appears in the current headline set and should stay on the watchlist.`,
    };
  });

  const relevanceBase = parsedRequest.focus?.ticker
    ? impactedAssets.some((asset) => asset.ticker === parsedRequest.focus?.ticker)
      ? 84
      : 70
    : 68;
  const relevanceScore = Math.min(100, relevanceBase + Math.min(parsedRequest.articles.length * 3, 12));

  const response = createMockEnvelope(
    "News Agent",
    buildRequestId("News Agent", [parsedRequest.focus?.ticker, parsedRequest.articles.length]),
    relevanceScore >= 80 ? "ok" : "watch",
    {
      eventSummary: `${primaryArticle.headline} ${primaryArticle.summary}`.trim(),
      impactedAssets,
      relevanceScore,
    },
  );

  return newsAgentEnvelopeSchema.parse(response);
};
