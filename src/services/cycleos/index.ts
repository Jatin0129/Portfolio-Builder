import {
  runMacroGeopoliticsAgent,
  runNewsAgent,
  runOpportunityAgent,
  runRiskOfficerAgent,
  toTradeIdeaSummaries,
} from "@/engines";
import { getCycleOsAppState } from "@/services/cycleos/app-state";
import { getDashboardSnapshot } from "@/services/cycleos/dashboard-snapshot";
import { getIntelligenceSnapshot } from "@/services/cycleos/intelligence-snapshot";
import { getPortfolioSnapshot } from "@/services/cycleos/portfolio-snapshot";
import { getReviewSnapshot } from "@/services/cycleos/review-snapshot";
import type { TradeIdea, TradeIdeaGenerationContext, TradeIdeaRankedSummary } from "@/types";

export { getDashboardSnapshot, getIntelligenceSnapshot, getPortfolioSnapshot, getReviewSnapshot };

export async function getTradeIdeas(): Promise<TradeIdea[]> {
  return (await getCycleOsAppState()).tradeIdeas.ideas;
}

export async function getTradeIdeaSummaries(): Promise<TradeIdeaRankedSummary[]> {
  return toTradeIdeaSummaries((await getCycleOsAppState()).tradeIdeas.ideas);
}

async function getGenerationContext(): Promise<TradeIdeaGenerationContext> {
  return (await getCycleOsAppState()).tradeIdeas.context;
}

export async function getAgentBundle(ticker: string) {
  const state = await getCycleOsAppState();
  const trade = state.tradeIdeas.ideas.find((idea) => idea.ticker === ticker);
  if (!trade) return null;

  return [
    runNewsAgent(trade),
    runMacroGeopoliticsAgent(trade),
    runOpportunityAgent(trade),
    runRiskOfficerAgent(trade, { holdings: state.holdings, settings: state.settings }),
  ];
}

export async function getPageContext() {
  return getGenerationContext();
}
