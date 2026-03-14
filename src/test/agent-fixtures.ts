import type {
  MacroGeopoliticsAgentRequest,
  NewsAgentRequest,
  OpportunityAgentRequest,
  RiskOfficerAgentRequest,
} from "@/schemas/agents";

export const sampleNewsAgentRequest: NewsAgentRequest = {
  focus: {
    ticker: "NVDA",
    assetName: "NVIDIA",
    region: "United States",
    themes: ["AI Infrastructure", "Semiconductors"],
  },
  articles: [
    {
      id: "news-1",
      headline: "NVIDIA supply chain checks stay firm",
      summary: "Demand for AI infrastructure remains healthy after channel checks.",
      source: "Mock Wire",
      publishedAt: "2026-03-14T09:00:00.000Z",
      url: "https://example.com/news/nvda-1",
      tickers: ["NVDA", "SMCI"],
    },
  ],
  portfolioContext: {
    heldTickers: ["MSFT"],
    watchlistTickers: ["NVDA"],
  },
};

export const sampleMacroGeopoliticsAgentRequest: MacroGeopoliticsAgentRequest = {
  macroSignals: [
    {
      label: "US CPI",
      value: "3.1%",
      trend: "cooling",
      importance: 90,
    },
  ],
  geopoliticalEvents: [
    {
      title: "Red Sea shipping disruption",
      region: "Middle East",
      severity: "High",
      summary: "Shipping lanes remain vulnerable to disruption.",
      channels: ["commodities", "risk sentiment"],
    },
  ],
  regimeContext: {
    currentRegime: "Balanced risk-on",
    posture: "balanced",
  },
};

export const sampleOpportunityAgentRequest: OpportunityAgentRequest = {
  candidates: [
    {
      ticker: "NVDA",
      name: "NVIDIA",
      direction: "LONG",
      thesis: "AI infrastructure demand remains strong.",
      score: 88,
      sector: "Semiconductors",
      themes: ["AI Infrastructure", "Growth"],
    },
    {
      ticker: "GLD",
      name: "SPDR Gold Shares",
      direction: "LONG",
      thesis: "Gold offers protection if yields roll over.",
      score: 72,
      sector: "Precious Metals",
      themes: ["Defensive Hedge", "Gold"],
    },
    {
      ticker: "TSLA",
      name: "Tesla",
      direction: "LONG",
      thesis: "Setup needs trend repair before becoming actionable.",
      score: 42,
      sector: "Autos",
      themes: ["EV Transition"],
    },
  ],
  marketContext: {
    regime: "Balanced risk-on",
    volatility: "elevated",
    breadth: "mixed",
    notes: ["Event risk remains elevated this week."],
  },
  portfolioConstraints: {
    maxNewPositions: 2,
    preferDefensive: false,
    restrictedTickers: ["TSLA"],
  },
};

export const sampleRiskOfficerAgentRequest: RiskOfficerAgentRequest = {
  proposedTrades: [
    {
      ticker: "NVDA",
      direction: "LONG",
      entry: 980,
      stop: 930,
      target: 1060,
      riskPct: 1,
      sector: "Semiconductors",
      themes: ["AI Infrastructure"],
      opportunityScore: 86,
    },
    {
      ticker: "SMCI",
      direction: "LONG",
      entry: 910,
      stop: 835,
      target: 1010,
      riskPct: 1.1,
      sector: "Servers",
      themes: ["AI Infrastructure", "High Beta"],
      opportunityScore: 64,
    },
    {
      ticker: "TSLA",
      direction: "LONG",
      entry: 190,
      stop: 176,
      target: 208,
      riskPct: 1.2,
      sector: "Autos",
      themes: ["EV Transition"],
      opportunityScore: 40,
    },
  ],
  portfolioSnapshot: {
    openRiskPct: 4.2,
    sectorExposurePct: {
      Semiconductors: 28,
      Servers: 12,
      Autos: 9,
    },
    themeExposurePct: {
      "AI Infrastructure": 38,
      "High Beta": 14,
      "EV Transition": 9,
    },
  },
  limits: {
    maxRiskPerTradePct: 1.1,
    maxPortfolioOpenRiskPct: 5.5,
    maxSectorExposurePct: 35,
    maxThemeExposurePct: 42,
  },
};
