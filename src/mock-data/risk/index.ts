import type { DashboardAlert, RiskItem, RiskSettings } from "@/types";

export const riskSettings: RiskSettings = {
  portfolioValueAed: 685000,
  cashAed: 98000,
  maxRiskPerTradePct: 1.1,
  maxPortfolioOpenRiskPct: 5.5,
  maxSinglePositionPct: 18,
  maxSectorExposurePct: 35,
  maxCorrelationClusterPct: 42,
};

export const alerts: DashboardAlert[] = [
  {
    id: "alert-1",
    title: "Macro event cluster",
    type: "macro",
    message: "CPI and FOMC both hit within 48 hours. Reduce fresh sizing on high-beta names before confirmation.",
  },
  {
    id: "alert-2",
    title: "Tech concentration",
    type: "risk",
    message: "Current and proposed exposure would push technology-linked clusters above the configured threshold.",
  },
  {
    id: "alert-3",
    title: "Catalyst watch",
    type: "catalyst",
    message: "NVDA has the strongest near-term catalyst stack across the current universe.",
  },
];

export const topRisks: RiskItem[] = [
  {
    id: "risk-1",
    title: "Policy surprise reprices yields",
    severity: "Critical",
    explanation: "A hawkish Fed tone would pressure long-duration growth and compress current momentum leadership.",
  },
  {
    id: "risk-2",
    title: "Crowded semiconductor exposure",
    severity: "High",
    explanation: "Existing holdings plus watchlist ideas cluster risk in AI infrastructure and semicap.",
  },
  {
    id: "risk-3",
    title: "Shipping disruption spillover",
    severity: "Moderate",
    explanation: "Freight and energy effects could re-ignite inflation expectations and rotate leadership abruptly.",
  },
];
