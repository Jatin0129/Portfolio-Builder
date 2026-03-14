import { clamp, formatCurrency } from "@/lib/utils";
import { computeOpportunityScore } from "@/engines/factor-scoring";
import { evaluateTradeRisk } from "@/engines/risk";
import { scoreAssetRegimeFit } from "@/engines/regime";
import type {
  AssetSignalInput,
  GeopoliticalBoard,
  Holding,
  MacroSummary,
  MarketSummary,
  PortfolioFit,
  RegimeSnapshot,
  TradeIdea,
  TradeIdeaGenerationContext,
  TradeIdeaGeneratorResult,
  TradeIdeaRankedSummary,
  UserSettings,
} from "@/types";

function buildPortfolioFit(ticker: string): PortfolioFit {
  if (ticker === "GLD" || ticker === "TLT") {
    return {
      role: "Portfolio hedge and macro shock absorber",
      diversificationImpact: "Reduces growth beta and cushions policy and geopolitical surprise risk.",
      exposureOverlap: "Low overlap with existing cyclical and AI leadership sleeves.",
      allocationSuggestionPct: 6,
      overlapWithCurrentPortfolio: "Low overlap with current growth leadership exposure.",
      themeFit: "Fits the portfolio as a stabilizer during event-heavy weeks.",
      hedgeValue: "High hedge value if yields fall or geopolitical stress intensifies.",
    };
  }

  if (ticker === "XLI" || ticker === "CAT") {
    return {
      role: "Cyclical breadth expression",
      diversificationImpact: "Improves participation beyond mega-cap technology.",
      exposureOverlap: "Moderate overlap with existing industrial and localization exposure.",
      allocationSuggestionPct: 5,
      overlapWithCurrentPortfolio: "Moderate overlap with cyclical and reshoring themes already in the book.",
      themeFit: "Strong fit while infrastructure and localization spending remain supportive.",
      hedgeValue: "Low hedge value; this is a participation trade rather than a stabilizer.",
    };
  }

  if (ticker === "IBIT" || ticker === "SMH" || ticker === "NVDA") {
    return {
      role: "High-beta tactical alpha sleeve",
      diversificationImpact: "Adds upside when liquidity is supportive, but raises cluster risk quickly.",
      exposureOverlap: "Very high overlap with AI infrastructure leadership.",
      allocationSuggestionPct: 2.5,
      overlapWithCurrentPortfolio: "High overlap with existing semiconductor and platform leadership exposure.",
      themeFit: "Fits only tactically and should remain sized smaller than core holdings.",
      hedgeValue: "No hedge value; this increases directional and thematic beta.",
    };
  }

  return {
    role: "High-conviction core alpha sleeve",
    diversificationImpact: "Adds return potential while keeping the book diversified across sectors and themes.",
    exposureOverlap: "Manageable overlap with current leaders.",
    allocationSuggestionPct: 3.5,
    overlapWithCurrentPortfolio: "Moderate overlap with existing leaders, but still diversifying at the single-name level.",
    themeFit: "Theme fit is acceptable if the selective risk-on regime stays intact.",
    hedgeValue: "Minimal hedge value because this is a directional participation trade.",
  };
}

function buildTradeIdeaGenerationContext(
  marketSummary: MarketSummary,
  macroSummary: MacroSummary,
  geopoliticalBoard: GeopoliticalBoard,
  regime: RegimeSnapshot,
): TradeIdeaGenerationContext {
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
  settings: UserSettings,
  maxPositionAed: number,
  decision: TradeIdea["riskVerdict"]["decision"],
) {
  if (decision === "REJECT" || maxPositionAed <= 0) {
    return "0% of portfolio (rejected)";
  }

  const allocationCapAed = settings.totalCapital * (allocationSuggestionPct / 100);
  const sizedAed = Math.min(allocationCapAed, maxPositionAed);
  const sizedPct = Number(((sizedAed / settings.totalCapital) * 100).toFixed(1));

  return `${sizedPct}% of portfolio (${formatCurrency(sizedAed, settings.reportingCurrency)})`;
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

export function generateTradeIdeas(input: {
  assets: AssetSignalInput[];
  holdings: Holding[];
  settings: UserSettings;
  marketSummary: MarketSummary;
  macroSummary: MacroSummary;
  geopoliticalBoard: GeopoliticalBoard;
  regime: RegimeSnapshot;
}): TradeIdeaGeneratorResult {
  const context = buildTradeIdeaGenerationContext(
    input.marketSummary,
    input.macroSummary,
    input.geopoliticalBoard,
    input.regime,
  );

  const ideas = input.assets
    .map((asset) => {
      const factorResult = computeOpportunityScore(asset);
      const portfolioFit = buildPortfolioFit(asset.ticker);
      const regimeFit = scoreAssetRegimeFit(asset, input.regime, input.geopoliticalBoard);
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

      const riskVerdict = evaluateTradeRisk(baseTrade, input.holdings, input.settings);
      const confidence = buildFinalConfidence(
        totalScore,
        asset.conviction,
        input.regime,
        riskVerdict.decision,
        asset.stopDistancePct,
      );
      const thesis = buildThesis(asset.shortThesis, regimeFit.reasons, asset.regimeFitText);
      const size = buildPositionSize(
        portfolioFit.allocationSuggestionPct,
        input.settings,
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
