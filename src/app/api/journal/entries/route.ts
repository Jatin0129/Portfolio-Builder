import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { journalEntryInputSchema } from "@/schemas/journal";
import { createJournalEntry, getJournalEntries } from "@/services/journal-service";

export async function GET() {
  const entries = await getJournalEntries();
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entry = journalEntryInputSchema.parse(body);
    const created = await createJournalEntry(entry);

    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid journal entry payload",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Unable to create journal entry" }, { status: 500 });
  }
}
