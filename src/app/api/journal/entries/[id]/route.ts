import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { journalExitInputSchema } from "@/schemas/journal";
import { closeJournalEntry } from "@/services/journal-service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const exit = journalExitInputSchema.parse({
      ...body,
      id: params.id,
    });
    const updated = await closeJournalEntry(exit);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid journal exit payload",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Unable to close journal entry" }, { status: 500 });
  }
}
