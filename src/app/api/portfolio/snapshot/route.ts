import { NextResponse } from "next/server";

import { getMdbOverviewSnapshot } from "@/services/mdb-service";

export async function GET() {
  const snapshot = await getMdbOverviewSnapshot();
  return NextResponse.json(snapshot);
}
