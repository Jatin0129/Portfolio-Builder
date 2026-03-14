import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { userSettingsSchema } from "@/schemas/settings";
import { getUserSettings, saveUserSettings } from "@/services/settings-service";

export async function GET() {
  const settings = await getUserSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const settings = userSettingsSchema.parse(body);
    const saved = await saveUserSettings(settings);

    return NextResponse.json(saved);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid settings payload",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Unable to save settings" }, { status: 500 });
  }
}
