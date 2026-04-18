import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { recordJarvisAudit } from "@/lib/jarvis-audit";
import { isAuthorizedJarvisRequest, unauthorizedJarvisResponse } from "@/lib/jarvis-auth";
import { getJournalEntries } from "@/services/journal-service";

const searchSchema = z.object({
  query: z.string().optional(),
  ticker: z.string().optional(),
  status: z.enum(["OPEN", "CLOSED", "WATCHLIST"]).optional(),
  limit: z.number().int().positive().max(100).default(10),
});

export async function POST(request: Request) {
  if (!isAuthorizedJarvisRequest(request)) return unauthorizedJarvisResponse();

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const params = searchSchema.parse(raw);
    const entries = await getJournalEntries();
    const q = params.query?.toLowerCase().trim();

    const filtered = entries.filter((entry) => {
      if (params.ticker && entry.ticker.toUpperCase() !== params.ticker.toUpperCase()) return false;
      if (params.status && entry.status !== params.status) return false;
      if (q) {
        const haystack = [
          entry.ticker,
          entry.assetName ?? "",
          entry.thesis,
          entry.reviewNotes,
          entry.mistakeTag ?? "",
          ...(entry.entryReasons ?? []),
          ...(entry.exitReasons ?? []),
          ...(entry.setupTags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const results = filtered.slice(0, params.limit).map((entry) => ({
      id: entry.id,
      ticker: entry.ticker,
      assetName: entry.assetName,
      status: entry.status,
      openedAt: entry.openedAt,
      closedAt: entry.closedAt,
      thesis: entry.thesis,
      reviewNotes: entry.reviewNotes,
      mistakeTag: entry.mistakeTag,
      realizedPnlAed: entry.realizedPnlAed,
      outcomeR: entry.outcomeR,
    }));

    await recordJarvisAudit({
      toolName: "recall_journal",
      payload: params,
      result: { count: results.length },
    });
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
