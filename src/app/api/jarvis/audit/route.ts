import { NextResponse } from "next/server";

import { listJarvisAudit } from "@/lib/jarvis-audit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "25"), 100);
  const rows = await listJarvisAudit(limit);
  return NextResponse.json({ audit: rows });
}
