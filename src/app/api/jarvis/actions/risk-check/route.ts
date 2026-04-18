import { NextResponse } from "next/server";

import { recordJarvisAudit } from "@/lib/jarvis-audit";
import { isAuthorizedJarvisRequest, unauthorizedJarvisResponse } from "@/lib/jarvis-auth";
import { getMdbOverviewSnapshot } from "@/services/mdb-service";

export async function POST(request: Request) {
  if (!isAuthorizedJarvisRequest(request)) return unauthorizedJarvisResponse();

  try {
    const snapshot = await getMdbOverviewSnapshot();
    const settings = snapshot.settings;

    const flags: Array<{ kind: string; severity: "info" | "warning" | "danger"; detail: string }> = [];

    snapshot.categories.forEach((category) => {
      if (category.weightPct >= settings.maxSinglePositionPct) {
        flags.push({
          kind: "concentration",
          severity: "warning",
          detail: `${category.category} bucket at ${category.weightPct}% (limit ${settings.maxSinglePositionPct}%).`,
        });
      }
    });

    const heavyPosition = snapshot.activeItems
      .map((item) => {
        const weight =
          snapshot.currentValueAed > 0 ? (item.currentValueAed / snapshot.currentValueAed) * 100 : 0;
        return { item, weight };
      })
      .find(({ weight }) => weight >= settings.maxSinglePositionPct);

    if (heavyPosition) {
      flags.push({
        kind: "single-position",
        severity: "warning",
        detail: `${heavyPosition.item.name} at ${heavyPosition.weight.toFixed(1)}% (limit ${settings.maxSinglePositionPct}%).`,
      });
    }

    const drawdownPct =
      snapshot.totalInvestedAed > 0
        ? (snapshot.unrealizedPnlAed / snapshot.totalInvestedAed) * 100
        : 0;
    if (drawdownPct < -settings.maxDrawdownThresholdPct) {
      flags.push({
        kind: "drawdown",
        severity: "danger",
        detail: `Unrealized drawdown ${drawdownPct.toFixed(1)}% breaches max ${settings.maxDrawdownThresholdPct}%.`,
      });
    }

    const result = {
      generatedAt: new Date().toISOString(),
      bookValueAed: snapshot.currentValueAed,
      investedAed: snapshot.totalInvestedAed,
      unrealizedPnlAed: snapshot.unrealizedPnlAed,
      activeInvestments: snapshot.activeInvestments,
      flagCount: flags.length,
      flags,
      limits: {
        maxRiskPerTradePct: settings.maxRiskPerTradePct,
        maxPortfolioOpenRiskPct: settings.maxPortfolioOpenRiskPct,
        maxDrawdownThresholdPct: settings.maxDrawdownThresholdPct,
        maxSinglePositionPct: settings.maxSinglePositionPct,
      },
    };

    await recordJarvisAudit({
      toolName: "run_risk_check",
      payload: {},
      result: { flagCount: flags.length },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
