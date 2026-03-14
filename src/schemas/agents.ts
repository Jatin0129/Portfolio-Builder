import { z } from "zod";

export const agentNameSchema = z.enum([
  "News Agent",
  "Macro/Geopolitics Agent",
  "Opportunity Agent",
  "Risk Officer Agent",
]);

export const agentProviderSchema = z.enum(["mock", "live"]);
export const agentStatusSchema = z.enum(["ok", "watch"]);

export const newsArticleSchema = z.object({
  id: z.string().min(1),
  headline: z.string().min(1),
  summary: z.string().min(1),
  source: z.string().min(1),
  publishedAt: z.string().datetime(),
  url: z.string().url().optional(),
  tickers: z.array(z.string().min(1)).optional(),
});

export const newsAgentRequestSchema = z.object({
  focus: z
    .object({
      ticker: z.string().min(1).optional(),
      assetName: z.string().min(1).optional(),
      region: z.string().min(1).optional(),
      themes: z.array(z.string().min(1)).optional(),
    })
    .optional(),
  articles: z.array(newsArticleSchema).min(1),
  portfolioContext: z
    .object({
      heldTickers: z.array(z.string().min(1)).optional(),
      watchlistTickers: z.array(z.string().min(1)).optional(),
    })
    .optional(),
});

export const impactedAssetSchema = z.object({
  ticker: z.string().min(1),
  impact: z.enum(["positive", "negative", "mixed"]),
  rationale: z.string().min(1),
});

export const newsAgentResponseSchema = z.object({
  eventSummary: z.string().min(1),
  impactedAssets: z.array(impactedAssetSchema),
  relevanceScore: z.number().min(0).max(100),
});

export const macroSignalSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string().min(1), z.number()]),
  trend: z.string().min(1),
  importance: z.number().min(0).max(100).optional(),
});

export const geopoliticalEventInputSchema = z.object({
  title: z.string().min(1),
  region: z.string().min(1),
  severity: z.enum(["Low", "Moderate", "High", "Critical"]),
  summary: z.string().min(1),
  channels: z.array(z.string().min(1)).min(1),
});

export const macroGeopoliticsAgentRequestSchema = z.object({
  macroSignals: z.array(macroSignalSchema).min(1),
  geopoliticalEvents: z.array(geopoliticalEventInputSchema).min(1),
  regimeContext: z
    .object({
      currentRegime: z.string().min(1).optional(),
      posture: z.string().min(1).optional(),
    })
    .optional(),
});

export const macroGeopoliticsAgentResponseSchema = z.object({
  macroInterpretation: z.string().min(1),
  geopoliticalInterpretation: z.string().min(1),
  regimeImplications: z.string().min(1),
});

export const opportunityIdeaSchema = z.object({
  ticker: z.string().min(1),
  thesis: z.string().min(1),
  confidence: z.number().min(0).max(100),
  rationale: z.string().min(1),
});

export const opportunityCandidateSchema = z.object({
  ticker: z.string().min(1),
  name: z.string().min(1),
  direction: z.enum(["LONG", "SHORT"]).optional(),
  thesis: z.string().min(1),
  score: z.number().min(0).max(100).optional(),
  sector: z.string().min(1).optional(),
  themes: z.array(z.string().min(1)).optional(),
});

export const opportunityAgentRequestSchema = z.object({
  candidates: z.array(opportunityCandidateSchema).min(1),
  marketContext: z
    .object({
      regime: z.string().min(1).optional(),
      volatility: z.enum(["calm", "elevated", "stressed"]).optional(),
      breadth: z.enum(["strong", "mixed", "weak"]).optional(),
      notes: z.array(z.string().min(1)).optional(),
    })
    .optional(),
  portfolioConstraints: z
    .object({
      maxNewPositions: z.number().int().positive().optional(),
      preferDefensive: z.boolean().optional(),
      restrictedTickers: z.array(z.string().min(1)).optional(),
    })
    .optional(),
});

export const opportunityAgentResponseSchema = z.object({
  topLongIdeas: z.array(opportunityIdeaSchema),
  defensiveIdeas: z.array(opportunityIdeaSchema),
  avoidIdeas: z.array(opportunityIdeaSchema),
});

export const riskReasonCodeSchema = z.enum([
  "WITHIN_LIMITS",
  "STOP_DISTANCE_TOO_WIDE",
  "PORTFOLIO_RISK_CAP_BREACH",
  "SECTOR_EXPOSURE_TOO_HIGH",
  "THEME_EXPOSURE_TOO_HIGH",
  "INSUFFICIENT_OPPORTUNITY_QUALITY",
]);

export const proposedTradeSchema = z.object({
  ticker: z.string().min(1),
  direction: z.enum(["LONG", "SHORT"]),
  entry: z.number().positive(),
  stop: z.number().positive(),
  target: z.number().positive().optional(),
  riskPct: z.number().min(0).max(100).optional(),
  sector: z.string().min(1).optional(),
  themes: z.array(z.string().min(1)).optional(),
  opportunityScore: z.number().min(0).max(100).optional(),
});

export const riskOfficerAgentRequestSchema = z.object({
  proposedTrades: z.array(proposedTradeSchema).min(1),
  portfolioSnapshot: z.object({
    openRiskPct: z.number().min(0).max(100),
    sectorExposurePct: z.record(z.string(), z.number().min(0).max(100)).optional(),
    themeExposurePct: z.record(z.string(), z.number().min(0).max(100)).optional(),
  }),
  limits: z.object({
    maxRiskPerTradePct: z.number().positive(),
    maxPortfolioOpenRiskPct: z.number().positive(),
    maxSectorExposurePct: z.number().positive(),
    maxThemeExposurePct: z.number().positive(),
  }),
});

export const riskOfficerTradeDecisionSchema = z.object({
  ticker: z.string().min(1),
  recommendedRiskPct: z.number().min(0).max(100).optional(),
  reasonCodes: z.array(riskReasonCodeSchema).min(1),
  explanation: z.string().min(1),
});

export const riskOfficerAgentResponseSchema = z.object({
  approvedTrades: z.array(riskOfficerTradeDecisionSchema),
  reducedTrades: z.array(riskOfficerTradeDecisionSchema),
  rejectedTrades: z.array(riskOfficerTradeDecisionSchema),
});

export function createAgentEnvelopeSchema<TData extends z.ZodTypeAny>(
  agent: z.infer<typeof agentNameSchema>,
  dataSchema: TData,
) {
  return z.object({
    agent: z.literal(agent),
    requestId: z.string().min(1),
    asOf: z.string().datetime(),
    provider: agentProviderSchema,
    status: agentStatusSchema,
    data: dataSchema,
  });
}

export const newsAgentEnvelopeSchema = createAgentEnvelopeSchema(
  "News Agent",
  newsAgentResponseSchema,
);
export const macroGeopoliticsAgentEnvelopeSchema = createAgentEnvelopeSchema(
  "Macro/Geopolitics Agent",
  macroGeopoliticsAgentResponseSchema,
);
export const opportunityAgentEnvelopeSchema = createAgentEnvelopeSchema(
  "Opportunity Agent",
  opportunityAgentResponseSchema,
);
export const riskOfficerAgentEnvelopeSchema = createAgentEnvelopeSchema(
  "Risk Officer Agent",
  riskOfficerAgentResponseSchema,
);

export type AgentName = z.infer<typeof agentNameSchema>;
export type AgentProvider = z.infer<typeof agentProviderSchema>;
export type AgentStatus = z.infer<typeof agentStatusSchema>;
export type RiskReasonCode = z.infer<typeof riskReasonCodeSchema>;

export type NewsAgentRequest = z.infer<typeof newsAgentRequestSchema>;
export type NewsAgentResponse = z.infer<typeof newsAgentResponseSchema>;
export type NewsAgentEnvelope = z.infer<typeof newsAgentEnvelopeSchema>;

export type MacroGeopoliticsAgentRequest = z.infer<typeof macroGeopoliticsAgentRequestSchema>;
export type MacroGeopoliticsAgentResponse = z.infer<typeof macroGeopoliticsAgentResponseSchema>;
export type MacroGeopoliticsAgentEnvelope = z.infer<typeof macroGeopoliticsAgentEnvelopeSchema>;

export type OpportunityAgentRequest = z.infer<typeof opportunityAgentRequestSchema>;
export type OpportunityAgentResponse = z.infer<typeof opportunityAgentResponseSchema>;
export type OpportunityAgentEnvelope = z.infer<typeof opportunityAgentEnvelopeSchema>;

export type RiskOfficerAgentRequest = z.infer<typeof riskOfficerAgentRequestSchema>;
export type RiskOfficerAgentResponse = z.infer<typeof riskOfficerAgentResponseSchema>;
export type RiskOfficerAgentEnvelope = z.infer<typeof riskOfficerAgentEnvelopeSchema>;

export interface AgentEnvelope<TData> {
  agent: AgentName;
  requestId: string;
  asOf: string;
  provider: AgentProvider;
  status: AgentStatus;
  data: TData;
}

export type AgentService<TRequest, TResponse> = (
  request: TRequest,
) => AgentEnvelope<TResponse>;
