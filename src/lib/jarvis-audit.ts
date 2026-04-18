import { prisma } from "@/lib/prisma";

export type JarvisAuditPayload = {
  toolName: string;
  payload: unknown;
  result: unknown;
  status?: "success" | "error";
  source?: string;
};

export async function recordJarvisAudit(entry: JarvisAuditPayload) {
  try {
    await prisma.jarvisAuditLog.create({
      data: {
        toolName: entry.toolName,
        payload: (entry.payload ?? {}) as object,
        result: (entry.result ?? {}) as object,
        status: entry.status ?? "success",
        source: entry.source ?? "jarvis",
      },
    });
  } catch {
    // Audit logging is best-effort; never block a Jarvis action because the log table is missing or DB is offline.
  }
}

export async function listJarvisAudit(limit = 25) {
  try {
    const rows = await prisma.jarvisAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((row) => ({
      id: row.id,
      toolName: row.toolName,
      status: row.status,
      source: row.source,
      createdAt: row.createdAt.toISOString(),
      payload: row.payload,
      result: row.result,
    }));
  } catch {
    return [];
  }
}
