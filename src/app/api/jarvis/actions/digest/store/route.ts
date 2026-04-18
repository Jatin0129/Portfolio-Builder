import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { recordJarvisAudit } from "@/lib/jarvis-audit";
import { isAuthorizedJarvisRequest, unauthorizedJarvisResponse } from "@/lib/jarvis-auth";

const digestSchema = z.object({
  scriptText: z.string().min(1),
  timezone: z.string().default("Asia/Dubai"),
  sections: z.record(z.string(), z.unknown()).optional(),
  audioUrl: z.string().url().optional(),
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
    const body = digestSchema.parse(raw);
    let stored: { id: string } | null = null;
    try {
      const created = await prisma.morningDigest.create({
        data: {
          timezone: body.timezone,
          scriptText: body.scriptText,
          sections: (body.sections ?? {}) as object,
          audioUrl: body.audioUrl,
        },
      });
      stored = { id: created.id };
    } catch {
      // DB unavailable — still acknowledge so the sidecar doesn't error out.
    }

    await recordJarvisAudit({ toolName: "morning_digest", payload: { timezone: body.timezone }, result: stored ?? { stored: false } });
    return NextResponse.json({ ok: true, ...stored });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to store digest" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const latest = await prisma.morningDigest.findFirst({ orderBy: { generatedAt: "desc" } });
    if (!latest) return NextResponse.json({ digest: null });
    return NextResponse.json({
      digest: {
        id: latest.id,
        generatedAt: latest.generatedAt.toISOString(),
        timezone: latest.timezone,
        scriptText: latest.scriptText,
        sections: latest.sections,
        audioUrl: latest.audioUrl,
      },
    });
  } catch {
    return NextResponse.json({ digest: null });
  }
}
