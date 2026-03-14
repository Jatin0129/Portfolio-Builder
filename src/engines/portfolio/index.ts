import type {
  AllocationSuggestion,
  ConcentrationItem,
  CorrelationCluster,
  Holding,
  PortfolioSummary,
  RiskSettings,
} from "@/types";

export function buildPortfolioSummary(
  holdings: Holding[],
  settings: RiskSettings,
): PortfolioSummary {
  const investedAed = holdings.reduce((sum, holding) => sum + holding.marketValueAed, 0);
  const dailyPnlAed = holdings.reduce((sum, holding) => sum + holding.unrealizedPnlAed * 0.08, 0);
  const openRiskAed = holdings.reduce((sum, holding) => sum + holding.openRiskAed, 0);
  const hedgesAed = holdings
    .filter((holding) => holding.sector === "Precious Metals")
    .reduce((sum, holding) => sum + holding.marketValueAed, 0);
  const topHolding = [...holdings].sort((a, b) => b.weightPct - a.weightPct)[0];

  return {
    portfolioValueAed: settings.portfolioValueAed,
    investedAed,
    cashAed: settings.cashAed,
    dailyPnlAed,
    openRiskAed,
    openRiskPct: Number(((openRiskAed / settings.portfolioValueAed) * 100).toFixed(1)),
    topExposure: `${topHolding.ticker} at ${topHolding.weightPct.toFixed(1)}%`,
    allocationMix: [
      {
        name: "Equities",
        value: Number((((investedAed - hedgesAed) / settings.portfolioValueAed) * 100).toFixed(1)),
      },
      {
        name: "Hedges",
        value: Number(((hedgesAed / settings.portfolioValueAed) * 100).toFixed(1)),
      },
      {
        name: "Cash",
        value: Number(((settings.cashAed / settings.portfolioValueAed) * 100).toFixed(1)),
      },
    ],
  };
}

export function buildConcentrationChecks(
  holdings: Holding[],
  settings: RiskSettings,
): ConcentrationItem[] {
  const sectorExposure = holdings.reduce<Record<string, number>>((accumulator, holding) => {
    accumulator[holding.sector] = (accumulator[holding.sector] ?? 0) + holding.weightPct;
    return accumulator;
  }, {});

  const bySector = Object.entries(sectorExposure)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([sector, exposurePct]) => ({
      label: sector,
      exposurePct: Number(exposurePct.toFixed(1)),
      thresholdPct: settings.maxSectorExposurePct,
      status:
        exposurePct > settings.maxSectorExposurePct
          ? ("Breach" as const)
          : exposurePct > settings.maxSectorExposurePct - 6
            ? ("Watch" as const)
            : ("OK" as const),
    }));

  const largestPosition = [...holdings].sort((a, b) => b.weightPct - a.weightPct)[0];

  return [
    {
      label: `${largestPosition.ticker} single-position`,
      exposurePct: largestPosition.weightPct,
      thresholdPct: settings.maxSinglePositionPct,
      status:
        largestPosition.weightPct > settings.maxSinglePositionPct
          ? "Breach"
          : largestPosition.weightPct > settings.maxSinglePositionPct - 3
            ? "Watch"
            : "OK",
    },
    ...bySector,
  ];
}

export function buildCorrelationClusters(
  holdings: Holding[],
  settings: RiskSettings,
): CorrelationCluster[] {
  const clusters = holdings.reduce<Record<string, CorrelationCluster>>((accumulator, holding) => {
    const cluster = accumulator[holding.correlationTag] ?? {
      tag: holding.correlationTag,
      exposurePct: 0,
      holdings: [],
    };

    cluster.exposurePct += holding.weightPct;
    cluster.holdings.push(holding.ticker);
    accumulator[holding.correlationTag] = cluster;
    return accumulator;
  }, {});

  return Object.values(clusters)
    .sort((a, b) => b.exposurePct - a.exposurePct)
    .map((cluster) => ({
      ...cluster,
      exposurePct: Number(cluster.exposurePct.toFixed(1)),
    }))
    .filter((cluster) => cluster.exposurePct >= settings.maxCorrelationClusterPct - 12);
}

export function buildAllocationSuggestions(
  concentrationChecks: ConcentrationItem[],
  correlationClusters: CorrelationCluster[],
): AllocationSuggestion[] {
  const suggestions: AllocationSuggestion[] = [
    {
      label: "Keep dry powder for post-event adds",
      action: "Hold",
      rationale:
        "Macro event density is high enough that preserving optionality is more valuable than maximizing current invested exposure.",
    },
  ];

  const watchCheck = concentrationChecks.find((check) => check.status !== "OK");
  if (watchCheck) {
    suggestions.unshift({
      label: watchCheck.label,
      action: "Trim",
      rationale:
        "Exposure is pushing beyond the preferred concentration band and should be reduced before layering correlated ideas.",
    });
  }

  const cyclicalCluster = correlationClusters.find((cluster) =>
    cluster.tag.toLowerCase().includes("cyclicals"),
  );
  if (cyclicalCluster) {
    suggestions.push({
      label: cyclicalCluster.tag,
      action: "Increase",
      rationale:
        "This cluster still fits the current regime, but new risk should come through the cleanest technical structures only.",
    });
  }

  return suggestions;
}
