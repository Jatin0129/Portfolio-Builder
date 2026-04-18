import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { holdingInputSchema } from "@/schemas/portfolio";
import { createHolding } from "@/services/portfolio-service";
import { cycleOsProviders } from "@/providers";

export async function GET() {
  const holdings = await cycleOsProviders.portfolio.getHoldings();
  return NextResponse.json(holdings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = holdingInputSchema.parse(body);
    const created = await createHolding(input);

    return NextResponse.json(created);
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

    return NextResponse.json({ error: "Unable to create holding" }, { status: 500 });
  }
}
