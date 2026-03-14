import { clamp } from "@/lib/utils";
import type {
  AssetSignalSeed,
  GeopoliticalBoard,
  GeopoliticalEvent,
  GeopoliticalFitScore,
  Severity,
} from "@/types";

const severityByScore: Array<{ minimum: number; severity: Severity }> = [
  { minimum: 88, severity: "Critical" },
  { minimum: 72, severity: "High" },
  { minimum: 56, severity: "Moderate" },
  { minimum: 0, severity: "Low" },
];

const channelLabels: Record<string, string> = {
  inflation: "Inflation",
  growth: "Growth",
  rates: "Rates",
  commodities: "Commodities",
  currencies: "Currencies",
  earnings: "Earnings",
  supplyChain: "Supply chain",
  riskSentiment: "Risk sentiment",
};

function toSeverity(score: number): Severity {
  return severityByScore.find((entry) => score >= entry.minimum)?.severity ?? "Low";
}

function assetTokens(asset: AssetSignalSeed) {
  return [
    asset.ticker.toLowerCase(),
    asset.name.toLowerCase(),
    asset.sector.toLowerCase(),
    asset.region.toLowerCase(),
    asset.assetClass.toLowerCase(),
    ...asset.themes.map((theme) => theme.toLowerCase()),
  ];
}

function matchesKeyword(tokens: string[], keyword: string) {
  const lowered = keyword.toLowerCase();
  return tokens.some((token) => token.includes(lowered) || lowered.includes(token));
}

export function getGeopoliticalBoard(events: GeopoliticalEvent[]): GeopoliticalBoard {
  const orderedEvents = [...events].sort((a, b) => b.severityScore - a.severityScore);
  const overlayScore = Math.round(
    orderedEvents.reduce((sum, event) => sum + event.severityScore, 0) / orderedEvents.length,
  );
  const dominantChannels = Array.from(
    new Set(
      orderedEvents.flatMap((event) => event.transmissionChannels.map((channel) => channel.channel)),
    ),
  )
    .slice(0, 4)
    .map((channel) => channelLabels[channel] ?? channel);

  return {
    asOf: "2026-03-14T09:00:00Z",
    summary: {
      headline: "Shipping, conflict, and policy shocks keep the geopolitical overlay firmly active.",
      overlaySeverity: toSeverity(overlayScore),
      overlayScore,
      activeCount: orderedEvents.length,
      posture:
        overlayScore >= 80
          ? "Geopolitical risk is high enough to justify explicit hedges and smaller tactical sizing."
          : "Geopolitical risk is elevated but still tradable with selectivity.",
      dominantChannels,
      actionBias: orderedEvents.slice(0, 3).map((event) => `${event.actionSuggestion}: ${event.title}`),
    },
    events: orderedEvents,
  };
}

export function getGeopoliticalEvents(board: GeopoliticalBoard): GeopoliticalEvent[] {
  return board.events;
}

export function scoreAssetGeopoliticalFit(
  asset: AssetSignalSeed,
  board: GeopoliticalBoard,
): GeopoliticalFitScore {
  const tokens = assetTokens(asset);
  let score = 55;
  const reasons: string[] = [];

  for (const event of board.events) {
    const hitRegion =
      event.affectedRegions.includes("Global") || event.affectedRegions.includes(asset.region);
    const beneficiaryMatch = event.beneficiaries.some((item) => matchesKeyword(tokens, item));
    const loserMatch = event.losers.some((item) => matchesKeyword(tokens, item));
    const sensitivity = Math.max(2, Math.round(event.severityScore / 25));

    if (beneficiaryMatch) {
      score += sensitivity * 3;
      reasons.push(`${event.title} favors this asset's sector or theme exposure.`);
      continue;
    }

    if (loserMatch || hitRegion) {
      score -= loserMatch ? sensitivity * 3 : sensitivity;
      reasons.push(
        loserMatch
          ? `${event.title} directly pressures this asset's sector or theme exposure.`
          : `${event.title} keeps ${asset.region.toLowerCase()} exposures under a live geopolitical risk premium.`,
      );
    }
  }

  if (asset.allocationBucket === "hedge") {
    score += 8;
    reasons.push("The asset sits in a hedge sleeve, which is valuable while geopolitical stress stays elevated.");
  }

  const finalScore = Math.round(clamp(score, 18, 96));

  return {
    score: finalScore,
    label: finalScore >= 75 ? "Beneficiary / hedge" : finalScore >= 60 ? "Manageable fit" : "Headline-sensitive",
    reasons: reasons.slice(0, 4),
  };
}
