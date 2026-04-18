import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordJarvisAudit } from "@/lib/jarvis-audit";
import { isAuthorizedJarvisRequest, unauthorizedJarvisResponse } from "@/lib/jarvis-auth";
import { journalEntryInputSchema } from "@/schemas/journal";
import { createJournalEntry } from "@/services/journal-service";

export async function POST(request: Request) {
  if (!isAuthorizedJarvisRequest(request)) return unauthorizedJarvisResponse();

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const entry = journalEntryInputSchema.parse(raw);
    const created = await createJournalEntry(entry);
    await recordJarvisAudit({ toolName: "log_journal_entry", payload: entry, result: { id: created.id } });
    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      await recordJarvisAudit({
        toolName: "log_journal_entry",
        payload: raw,
        result: { issues: error.issues },
        status: "error",
      });
      return NextResponse.json({ error: "Invalid payload", issues: error.issues }, { status: 400 });
    }
    await recordJarvisAudit({
      toolName: "log_journal_entry",
      payload: raw,
      result: { message: (error as Error).message },
      status: "error",
    });
    return NextResponse.json({ error: "Unable to create journal entry" }, { status: 500 });
  }
}
