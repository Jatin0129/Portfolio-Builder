import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { holdingInputSchema } from "@/schemas/portfolio";
import { deleteHolding, updateHolding } from "@/services/portfolio-service";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const input = holdingInputSchema.parse(body);
    const updated = await updateHolding(params.id, input);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid holding payload",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Unable to update holding" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    await deleteHolding(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete holding" }, { status: 500 });
  }
}
