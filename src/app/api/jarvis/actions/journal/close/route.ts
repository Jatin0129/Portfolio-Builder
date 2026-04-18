import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { recordJarvisAudit } from "@/lib/jarvis-audit";
import { isAuthorizedJarvisRequest, unauthorizedJarvisResponse } from "@/lib/jarvis-auth";
import { journalExitInputSchema } from "@/schemas/journal";
import { closeJournalEntry, getJournalEntries } from "@/services/journal-service";

const lookupSchema = z.object({
  ticker: z.string().min(1).optional(),
  id: z.string().min(1).optional(),
  exitPrice: z.number().positive(),
  closedAt: z.string().datetime().optional(),
  exitReasons: z.array(z.string().min(1)).min(1),
  rulesFollowed: z.boolean().default(true),
  reviewNotes: z.string().min(1).default("Closed via Jarvis"),
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
    const lookup = lookupSchema.parse(raw);

    let id = lookup.id;
    if (!id && lookup.ticker) {
      const entries = await getJournalEntries();
      const open = entries.find(
        (entry) => entry.status === "OPEN" && entry.ticker.toUpperCase() === lookup.ticker?.toUpperCase(),
      );
      if (!open) {
        const result = { error: `No open entry for ticker ${lookup.ticker}` };
        await recordJarvisAudit({ toolName: "close_position", payload: raw, result, status: "error" });
        return NextResponse.json(result, { status: 404 });
      }
      id = open.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Provide either id or ticker" }, { status: 400 });
    }

    const exit = journalExitInputSchema.parse({
      id,
      closedAt: lookup.closedAt ?? new Date().toISOString(),
      exitPrice: lookup.exitPrice,
      exitReasons: lookup.exitReasons,
      rulesFollowed: lookup.rulesFollowed,
      reviewNotes: lookup.reviewNotes,
    });

    const updated = await closeJournalEntry(exit);
    await recordJarvisAudit({
      toolName: "close_position",
      payload: raw,
      result: { id: updated.id, realizedPnlAed: updated.realizedPnlAed, outcomeR: updated.outcomeR },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: error.issues }, { status: 400 });
    }
    await recordJarvisAudit({
      toolName: "close_position",
      payload: raw,
      result: { message: (error as Error).message },
      status: "error",
    });
    return NextResponse.json({ error: "Unable to close position" }, { status: 500 });
  }
}
