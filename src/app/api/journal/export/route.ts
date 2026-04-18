import { NextResponse } from "next/server";

import { isAuthorizedJarvisRequest, unauthorizedJarvisResponse } from "@/lib/jarvis-auth";
import { getJournalEntries } from "@/services/journal-service";

export async function GET(request: Request) {
  if (!isAuthorizedJarvisRequest(request)) return unauthorizedJarvisResponse();

  const entries = await getJournalEntries();
  return NextResponse.json({
    count: entries.length,
    entries: entries.map((entry) => ({
      id: entry.id,
      ticker: entry.ticker,
      assetName: entry.assetName,
      assetCategory: entry.assetCategory,
      status: entry.status,
      direction: entry.direction,
      openedAt: entry.openedAt,
      closedAt: entry.closedAt,
      entryPrice: entry.entryPrice,
      exitPrice: entry.exitPrice,
      thesis: entry.thesis,
      reviewNotes: entry.reviewNotes,
      mistakeTag: entry.mistakeTag,
      setupName: entry.setupName,
      setupTags: entry.setupTags,
      entryReasons: entry.entryReasons,
      exitReasons: entry.exitReasons,
      realizedPnlAed: entry.realizedPnlAed,
      realizedPnlPct: entry.realizedPnlPct,
      outcomeR: entry.outcomeR,
      disciplineScore: entry.disciplineScore,
    })),
  });
}
