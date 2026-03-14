import { holdings, riskSettings } from "@/mock-data";
import { clamp, formatCurrency } from "@/lib/utils";
import { computeOpportunityScore } from "@/engines/factor-scoring";
import { getGeopoliticalBoard } from "@/engines/geopolitics";
import { getMacroSummary } from "@/engines/macro";
import { getMarketSummary, getAssetUniverse } from "@/engines/market-data";
import { scoreAssetRegimeFit, classifyRegime } from "@/engines/regime";
import { evaluateTradeRisk } from "@/engines/risk";
import type {
  GeopoliticalBoard,
  PortfolioFit,
  RegimeInput,
  RegimeSnapshot,
  RiskSettings,
  TradeIdea,
  TradeIdeaGenerationContext,
  TradeIdeaGeneratorResult,
  TradeIdeaRankedSummary,
} from "@/types";

function buildPortfolioFit(ticker: string): PortfolioFit {
  if (ticker === "GLD") {
    return {
      role: "Portfolio hedge and macro shock absorber",
      diversificationImpact: "Reduces growth beta and cushions policy surprise risk.",
      exposureOverlap: "Low overlap with existing cyclical exposures.",
      allocationSuggestionPct: 6,
      overlapWithCurrentPortfolio: "Low overlap with existing growth and cyclical sleeves.",
      themeFit: "Fits the portfolio as a defensive macro hedge during event-heavy weeks.",
      hedgeValue: "High hedge value if yields fall or geopolitical stress intensifies.",
    };
  }

  if (ticker === "XLI") {
    return {
      role: "Cyclical breadth expression",
      diversificationImpact: "Improves participation beyond mega-cap technology.",
      exposureOverlap: "Moderate overlap with existing industrial ETF holding.",
      allocationSuggestionPct: 5,
      overlapWithCurrentPortfolio:
        "Moderate overlap with current cyclical exposure through XLI and industrial beta.",
      themeFit: "Strong theme fit while global cyclicals and infrastructure spending remain supportive.",
      hedgeValue: "Low hedge value; this is a participation trade rather than a portfolio hedge.",
    };
  }

  if (ticker === "SMCI") {
    return {
      role: "High-beta tactical alpha sleeve",
      diversificationImpact: "Adds upside if AI infrastructure extends, but raises cluster risk quickly.",
      exposureOverlap: "Very high overlap with semicap and AI infrastructure leadership.",
      allocationSuggestionPct: 2.5,
      overlapWithCurrentPortfolio:
        "High overlap with existing semiconductor and mega-cap tech concentration.",
      themeFit: "Fits the AI infrastructure theme but only tactically due to risk quality concerns.",
      hedgeValue: "No hedge value; this increases directional and thematic beta.",
    };
  }

  return {
    role: "High-conviction growth alpha sleeve",
    diversificationImpact: "Adds return potential but increases cluster risk.",
    exposureOverlap: "High overlap with current semicap and mega-cap tech leadership.",
    allocationSuggestionPct: 3.5,
    overlapWithCurrentPortfolio: "High overlap with current growth leadership exposure.",
    themeFit: "Theme fit is acceptable only if the risk-on regime remains intact.",
    hedgeValue: "Minimal hedge value because this trade is a pure directional growth expression.",
  };
}

function buildRegimeInput(geopoliticalBoard: GeopoliticalBoard): RegimeInput {
  const market = getMarketSummary();
  const breadthState =
    market.breadthPct >= 58 ? "strong" : market.breadthPct >= 48 ? "mixed" : "weak";

  return {
    majorIndexTrend: market.majorIndexTrend,
    bondYieldDirection: market.bondYieldDirection,
    goldBehavior: market.goldBehavior,
    oilBehavior: market.oilBehavior,
    usdTrend: market.usdTrend,
    volatilityState: market.volatilityState,
    marketBreadth: breadthState,
    macroEventFlags: market.macroEventFlags,
    geopoliticalSeverity: geopoliticalBoard.summary.overlaySeverity,
  };
}

function buildTradeIdeaGenerationContext(): TradeIdeaGenerationContext {
  const marketSummary = getMarketSummary();
  const geopoliticalBoard = getGeopoliticalBoard();
  const macroSummary = getMacroSummary();
  const regime = classifyRegime(buildRegimeInput(geopoliticalBoard));

  return {
    marketSummary,
    macroSummary,
    geopoliticalBoard,
    regime,
  };
}

function buildTotalScore(baseFactorScore: number, regimeFitScore: number) {
  const regimeAdjustment = Math.round((regimeFitScore - 60) * 0.3);
  return Math.round(clamp(baseFactorScore + regimeAdjustment, 0, 100));
}

function buildFinalConfidence(
  totalScore: number,
  rawConviction: number,
  regime: RegimeSnapshot,
  riskDecision: TradeIdea["riskVerdict"]["decision"],
  stopDistancePct: number,
) {
  const riskAdjustment =
    riskDecision === "APPROVE" ? 4 : riskDecision === "REDUCE" ? -8 : -20;
  const distancePenalty = Math.max(stopDistancePct - 5, 0) * 2;

  return Math.round(
    clamp(
      totalScore * 0.6 + rawConviction * 0.25 + regime.confidence * 0.15 + riskAdjustment - distancePenalty,
      15,
      95,
    ),
  );
}

function buildPositionSize(
  allocationSuggestionPct: number,
  settings: RiskSettings,
  maxPositionAed: number,
  decision: TradeIdea["riskVerdict"]["decision"],
) {
  if (decision === "REJECT" || maxPositionAed <= 0) {
    return "0% of portfolio (rejected)";
  }

  const allocationCapAed = settings.portfolioValueAed * (allocationSuggestionPct / 100);
  const sizedAed = Math.min(allocationCapAed, maxPositionAed);
  const sizedPct = Number(((sizedAed / settings.portfolioValueAed) * 100).toFixed(1));

  return `${sizedPct}% of portfolio (${formatCurrency(sizedAed)})`;
}

function buildThesis(shortThesis: string, regimeReasons: string[], regimeFitText: string) {
  return `${shortThesis} ${regimeReasons[0] ?? regimeFitText}`.trim();
}

export function toTradeIdeaSummaries(ideas: TradeIdea[]): TradeIdeaRankedSummary[] {
  return ideas.map((idea) => ({
    ticker: idea.ticker,
    totalScore: idea.totalScore,
    confidence: idea.confidence,
    thesis: idea.thesis,
    macroReasons: idea.macroReasons,
    geopoliticalReasons: idea.geopoliticalReasons,
    factorBreakdown: idea.factorBreakdown,
    entry: idea.executionPlan.entryZone,
    stop: idea.executionPlan.stop,
    targets: [idea.executionPlan.targetOne, idea.executionPlan.targetTwo],
    size: idea.insight.summary.positionSize,
    riskAed: idea.insight.summary.aedRisk,
    verdict: {
      decision: idea.riskVerdict.decision,
      summary: idea.riskVerdict.summary,
      explanation: idea.riskVerdict.explanation,
    },
  }));
}

export function generateTradeIdeas(): TradeIdeaGeneratorResult {
  const context = buildTradeIdeaGenerationContext();

  const ideas = getAssetUniverse()
    .map((asset) => {
      const factorResult = computeOpportunityScore(asset);
      const portfolioFit = buildPortfolioFit(asset.ticker);
      const regimeFit = scoreAssetRegimeFit(asset, context.regime, context.geopoliticalBoard);
      const totalScore = buildTotalScore(factorResult.score, regimeFit.score);

      const baseTrade = {
        ...asset,
        regimeFit: regimeFit.score,
        regimeReasons: regimeFit.reasons,
        totalScore,
        confidence: asset.conviction,
        thesis: asset.shortThesis,
        scores: {
          factorScore: factorResult.score,
          macroFit: asset.macroFit,
          geopoliticalFit: asset.geopoliticalFit,
          regimeFit: regimeFit.score,
          totalScore,
          confidence: asset.conviction,
        },
        factorBreakdown: factorResult.breakdown,
        opportunityScore: totalScore,
        portfolioFit,
      };

      const riskVerdict = evaluateTradeRisk(baseTrade, holdings, riskSettings);
      const confidence = buildFinalConfidence(
        totalScore,
        asset.conviction,
        context.regime,
        riskVerdict.decision,
        asset.stopDistancePct,
      );
      const thesis = buildThesis(asset.shortThesis, regimeFit.reasons, asset.regimeFitText);
      const size = buildPositionSize(
        portfolioFit.allocationSuggestionPct,
        riskSettings,
        riskVerdict.maxPositionAed,
        riskVerdict.decision,
      );

      return {
        ...baseTrade,
        confidence,
        thesis,
        scores: {
          factorScore: factorResult.score,
          macroFit: asset.macroFit,
          geopoliticalFit: asset.geopoliticalFit,
          regimeFit: regimeFit.score,
          totalScore,
          confidence,
        },
        riskVerdict,
        insight: {
          summary: {
            ticker: asset.ticker,
            action: asset.direction,
            confidence,
            score: totalScore,
            timeHorizon: asset.executionPlan.timeframe,
            entryZone: asset.executionPlan.entryZone,
            stopLoss: asset.executionPlan.stop,
            targetOne: asset.executionPlan.targetOne,
            targetTwo: asset.executionPlan.targetTwo,
            positionSize: size,
            aedRisk: riskVerdict.approvedRiskAed,
          },
          whyThisTrade: {
            shortThesis: thesis,
            regimeFit: regimeFit.reasons[0] ?? asset.regimeFitText,
          },
          technical: asset.technicalInsight,
          executionSteps: asset.executionPlan.steps,
        },
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return {
    context,
    ideas,
    rankedSummaries: toTradeIdeaSummaries(ideas),
  };
}

export function getRankedTradeIdeaSummaries() {
  return generateTradeIdeas().rankedSummaries;
}

export function getTradeIdeaGenerationContext() {
  return buildTradeIdeaGenerationContext();
}
