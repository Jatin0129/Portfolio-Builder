import type {
  AllocationBucket,
  AllocationSuggestion,
  ConcentrationItem,
  CorrelationCluster,
  ExposureBreakdown,
  GeopoliticalBoard,
  Holding,
  MacroSummary,
  OverUnderweightItem,
  PortfolioExposures,
  PortfolioSnapshot,
  PortfolioSummary,
  PortfolioWatchlistItem,
  RegimeSnapshot,
  RiskSettings,
  SuggestedAllocationView,
} from "@/types";

function round(value: number) {
  return Number(value.toFixed(1));
}

function calculateWeightPct(valueAed: number, portfolioValueAed: number) {
  return round((valueAed / portfolioValueAed) * 100);
}

function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((sum, item) => sum + selector(item), 0);
}

function baseBucketTargets(posture: RegimeSnapshot["posture"]) {
  switch (posture) {
    case "aggressive":
      return { core: 55, tactical: 24, hedge: 7, cash: 14 };
    case "balanced":
      return { core: 48, tactical: 17, hedge: 13, cash: 22 };
    case "defensive":
      return { core: 38, tactical: 11, hedge: 18, cash: 33 };
    default:
      return { core: 28, tactical: 8, hedge: 20, cash: 44 };
  }
}

function normalizeBucketTargets(
  targets: Record<AllocationBucket["key"], number>,
): Record<AllocationBucket["key"], number> {
  const total = Object.values(targets).reduce((sum, value) => sum + value, 0);
  const ratio = 100 / total;

  return {
    core: round(targets.core * ratio),
    tactical: round(targets.tactical * ratio),
    hedge: round(targets.hedge * ratio),
    cash: round(targets.cash * ratio),
  };
}

function buildExposureBreakdown(
  items: Array<{ label: string; valueAed: number }>,
  portfolioValueAed: number,
): ExposureBreakdown[] {
  const grouped = items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.label] = (accumulator[item.label] ?? 0) + item.valueAed;
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([label, valueAed]) => ({
      label,
      valueAed: round(valueAed),
      weightPct: calculateWeightPct(valueAed, portfolioValueAed),
    }))
    .sort((a, b) => b.weightPct - a.weightPct);
}

export function normalizeHoldings(
  holdings: Holding[],
  settings: RiskSettings,
): Holding[] {
  return holdings.map((holding) => ({
    ...holding,
    weightPct: calculateWeightPct(holding.marketValueAed, settings.portfolioValueAed),
  }));
}

export function buildPortfolioSummary(
  holdings: Holding[],
  settings: RiskSettings,
): PortfolioSummary {
  const normalizedHoldings = normalizeHoldings(holdings, settings);
  const investedAed = sumBy(normalizedHoldings, (holding) => holding.marketValueAed);
  const dailyPnlAed = sumBy(normalizedHoldings, (holding) => holding.unrealizedPnlAed * 0.08);
  const openRiskAed = sumBy(normalizedHoldings, (holding) => holding.openRiskAed);
  const bucketMap = {
    Core: 0,
    Tactical: 0,
    Hedge: 0,
  };

  for (const holding of normalizedHoldings) {
    if (holding.allocationBucket === "core") bucketMap.Core += holding.marketValueAed;
    if (holding.allocationBucket === "tactical") bucketMap.Tactical += holding.marketValueAed;
    if (holding.allocationBucket === "hedge") bucketMap.Hedge += holding.marketValueAed;
  }

  const topHolding = [...normalizedHoldings].sort((a, b) => b.weightPct - a.weightPct)[0];

  return {
    portfolioValueAed: settings.portfolioValueAed,
    investedAed,
    cashAed: settings.cashAed,
    dailyPnlAed: round(dailyPnlAed),
    openRiskAed,
    openRiskPct: round((openRiskAed / settings.portfolioValueAed) * 100),
    topExposure: `${topHolding.ticker} at ${topHolding.weightPct.toFixed(1)}%`,
    allocationMix: [
      { name: "Core", value: calculateWeightPct(bucketMap.Core, settings.portfolioValueAed) },
      { name: "Tactical", value: calculateWeightPct(bucketMap.Tactical, settings.portfolioValueAed) },
      { name: "Hedge", value: calculateWeightPct(bucketMap.Hedge, settings.portfolioValueAed) },
      { name: "Cash", value: calculateWeightPct(settings.cashAed, settings.portfolioValueAed) },
    ],
  };
}

export function buildConcentrationChecks(
  holdings: Holding[],
  settings: RiskSettings,
): ConcentrationItem[] {
  const normalizedHoldings = normalizeHoldings(holdings, settings);
  const sectorExposure = buildExposureBreakdown(
    normalizedHoldings.map((holding) => ({ label: holding.sector, valueAed: holding.marketValueAed })),
    settings.portfolioValueAed,
  );
  const largestPosition = [...normalizedHoldings].sort((a, b) => b.weightPct - a.weightPct)[0];

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
    ...sectorExposure.slice(0, 3).map((item) => ({
      label: item.label,
      exposurePct: item.weightPct,
      thresholdPct: settings.maxSectorExposurePct,
      status:
        item.weightPct > settings.maxSectorExposurePct
          ? ("Breach" as const)
          : item.weightPct > settings.maxSectorExposurePct - 6
            ? ("Watch" as const)
            : ("OK" as const),
    })),
  ];
}

export function buildCorrelationClusters(
  holdings: Holding[],
  settings: RiskSettings,
): CorrelationCluster[] {
  const normalizedHoldings = normalizeHoldings(holdings, settings);
  const clusters = normalizedHoldings.reduce<Record<string, CorrelationCluster>>((accumulator, holding) => {
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
    .map((cluster) => ({ ...cluster, exposurePct: round(cluster.exposurePct) }))
    .sort((a, b) => b.exposurePct - a.exposurePct)
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
        "Macro and geopolitical event density are high enough that preserving optionality remains valuable.",
    },
  ];

  const watchCheck = concentrationChecks.find((check) => check.status !== "OK");
  if (watchCheck) {
    suggestions.unshift({
      label: watchCheck.label,
      action: "Trim",
      rationale: "Exposure is pressing against portfolio limits and should be reduced before layering new risk.",
    });
  }

  const cyclicalCluster = correlationClusters.find((cluster) =>
    cluster.tag.toLowerCase().includes("cyclical"),
  );
  if (cyclicalCluster) {
    suggestions.push({
      label: cyclicalCluster.tag,
      action: "Increase",
      rationale:
        "The cluster still fits the regime, but new risk should come only through the cleanest technical structures.",
    });
  }

  return suggestions;
}

export function buildPortfolioExposures(
  holdings: Holding[],
  settings: RiskSettings,
): PortfolioExposures {
  const normalizedHoldings = normalizeHoldings(holdings, settings);

  return {
    sector: buildExposureBreakdown(
      normalizedHoldings.map((holding) => ({ label: holding.sector, valueAed: holding.marketValueAed })),
      settings.portfolioValueAed,
    ),
    theme: buildExposureBreakdown(
      normalizedHoldings.flatMap((holding) =>
        holding.themes.map((theme) => ({ label: theme, valueAed: holding.marketValueAed / holding.themes.length })),
      ),
      settings.portfolioValueAed,
    ),
    assetClass: buildExposureBreakdown(
      [
        ...normalizedHoldings.map((holding) => ({ label: holding.assetClass, valueAed: holding.marketValueAed })),
        { label: "Cash", valueAed: settings.cashAed },
      ],
      settings.portfolioValueAed,
    ),
    region: buildExposureBreakdown(
      normalizedHoldings.map((holding) => ({ label: holding.region, valueAed: holding.marketValueAed })),
      settings.portfolioValueAed,
    ),
  };
}

export function buildSuggestedAllocationView(
  holdings: Holding[],
  settings: RiskSettings,
  regime: RegimeSnapshot,
  macroSummary: MacroSummary,
  geopoliticalBoard: GeopoliticalBoard,
): SuggestedAllocationView {
  const normalizedHoldings = normalizeHoldings(holdings, settings);
  const currentByBucket: Record<AllocationBucket["key"], number> = {
    core: 0,
    tactical: 0,
    hedge: 0,
    cash: calculateWeightPct(settings.cashAed, settings.portfolioValueAed),
  };

  for (const holding of normalizedHoldings) {
    currentByBucket[holding.allocationBucket] += holding.weightPct;
  }

  const targets = baseBucketTargets(regime.posture);
  if (geopoliticalBoard.summary.overlayScore >= 80) {
    targets.hedge += 3;
    targets.cash += 4;
    targets.tactical -= 4;
    targets.core -= 3;
  }

  if (macroSummary.bullets.includes("yields rising")) {
    targets.hedge += 2;
    targets.tactical -= 2;
  }

  if (macroSummary.bullets.includes("inflation cooling")) {
    targets.core += 2;
    targets.cash -= 2;
  }

  const normalizedTargets = normalizeBucketTargets(targets);

  const labelMap: Record<AllocationBucket["key"], string> = {
    core: "Core",
    tactical: "Tactical",
    hedge: "Hedge",
    cash: "Cash",
  };

  const rationaleMap: Record<AllocationBucket["key"], string> = {
    core: "Keep the bulk of exposure in durable quality and broad participation ideas.",
    tactical: "Use this sleeve for event-driven adds and high-conviction tactical setups only.",
    hedge: "Maintain explicit hedge capital while yields, policy risk, and geopolitics stay active.",
    cash: "Dry powder matters because the current tape still carries event and valuation risk.",
  };

  return {
    headline: "Suggested allocation balances core participation with explicit hedges and cash optionality.",
    buckets: (["core", "tactical", "hedge", "cash"] as const).map((key) => ({
      key,
      label: labelMap[key],
      currentPct: round(currentByBucket[key]),
      targetPct: normalizedTargets[key],
      deltaPct: round(normalizedTargets[key] - currentByBucket[key]),
      valueAed:
        key === "cash"
          ? settings.cashAed
          : round(
              normalizedHoldings
                .filter((holding) => holding.allocationBucket === key)
                .reduce((sum, holding) => sum + holding.marketValueAed, 0),
            ),
      rationale: rationaleMap[key],
    })),
  };
}

function resolveTargetPct(
  dimension: OverUnderweightItem["dimension"],
  label: string,
  regime: RegimeSnapshot,
  geopoliticalBoard: GeopoliticalBoard,
): number {
  const lowered = label.toLowerCase();

  if (dimension === "sector") {
    if (lowered.includes("precious")) return geopoliticalBoard.summary.overlayScore >= 80 ? 14 : 11;
    if (lowered.includes("software")) return regime.posture === "aggressive" ? 18 : 14;
    if (lowered.includes("semi")) return 12;
    if (lowered.includes("industrial")) return regime.posture === "defensive" ? 10 : 14;
    if (lowered.includes("clean energy")) return 6;
    if (lowered.includes("autos")) return 4;
    return 8;
  }

  if (dimension === "theme") {
    if (lowered.includes("ai")) return 18;
    if (lowered.includes("defensive") || lowered.includes("gold")) return geopoliticalBoard.summary.overlayScore >= 80 ? 14 : 10;
    if (lowered.includes("cyclical") || lowered.includes("infrastructure")) return regime.posture === "defensive" ? 10 : 14;
    if (lowered.includes("rate sensitive")) return 5;
    return 7;
  }

  if (dimension === "asset class") {
    if (lowered === "equity") return 42;
    if (lowered === "etf") return 32;
    if (lowered === "cash") return regime.posture === "aggressive" ? 14 : regime.posture === "balanced" ? 22 : 33;
    return 8;
  }

  if (lowered.includes("united states")) return 48;
  if (lowered.includes("europe")) return 14;
  if (lowered.includes("global")) return 12;
  return 6;
}

export function buildOverUnderweights(
  exposures: PortfolioExposures,
  regime: RegimeSnapshot,
  geopoliticalBoard: GeopoliticalBoard,
): OverUnderweightItem[] {
  const dimensions: Array<[OverUnderweightItem["dimension"], ExposureBreakdown[]]> = [
    ["sector", exposures.sector],
    ["theme", exposures.theme],
    ["asset class", exposures.assetClass],
    ["region", exposures.region],
  ];

  return dimensions
    .flatMap(([dimension, items]) =>
      items.map((item) => {
        const targetPct = resolveTargetPct(dimension, item.label, regime, geopoliticalBoard);
        const deltaPct = round(item.weightPct - targetPct);

        return {
          dimension,
          label: item.label,
          currentPct: item.weightPct,
          targetPct,
          deltaPct,
          status:
            deltaPct > 2
              ? ("overweight" as const)
              : deltaPct < -2
                ? ("underweight" as const)
                : ("neutral" as const),
          rationale:
            deltaPct > 2
              ? "Current allocation is above the working target for this environment."
              : deltaPct < -2
                ? "Current allocation is below the working target for this environment."
                : "Current allocation is close to the working target.",
        };
      }),
    )
    .sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
    .slice(0, 8);
}

export function buildPortfolioSnapshot(
  holdings: Holding[],
  watchlist: PortfolioWatchlistItem[],
  settings: RiskSettings,
  regime: RegimeSnapshot,
  macroSummary: MacroSummary,
  geopoliticalBoard: GeopoliticalBoard,
  risk: PortfolioSnapshot["risk"],
): PortfolioSnapshot {
  const normalizedHoldings = normalizeHoldings(holdings, settings);
  const exposures = buildPortfolioExposures(normalizedHoldings, settings);

  return {
    summary: buildPortfolioSummary(normalizedHoldings, settings),
    holdings: normalizedHoldings,
    watchlist,
    exposures,
    overUnderweights: buildOverUnderweights(exposures, regime, geopoliticalBoard),
    suggestedAllocation: buildSuggestedAllocationView(
      normalizedHoldings,
      settings,
      regime,
      macroSummary,
      geopoliticalBoard,
    ),
    risk,
    settings,
  };
}
