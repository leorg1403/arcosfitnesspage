import "server-only";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";

export type AuditEntry = {
  actorKind: "admin" | "customer" | "system";
  adminId?: string | null;
  adminEmail?: string | null;
  adminName?: string | null;
  ip?: string | null;
  action: string;
  area: string;
  entityKind?: string | null;
  entityId?: string | null;
  summary: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

// Prisma nullable JSON fields require Prisma.JsonNull for explicit null;
// undefined means "omit field" (also stored as DB null for optional fields).
function toJsonValue(
  v: Record<string, unknown> | null | undefined
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (v === null) return Prisma.JsonNull;
  if (v === undefined) return undefined;
  return v as Prisma.InputJsonValue;
}

/**
 * Escritura best-effort: si falla, solo deja un console.error.
 * La mutación real ya completó antes de llamar esto.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorKind: entry.actorKind,
        adminId: entry.adminId ?? null,
        adminEmail: entry.adminEmail ?? null,
        adminName: entry.adminName ?? null,
        ip: entry.ip ?? null,
        action: entry.action,
        area: entry.area,
        entityKind: entry.entityKind ?? null,
        entityId: entry.entityId ?? null,
        summary: entry.summary,
        before: toJsonValue(entry.before),
        after: toJsonValue(entry.after),
      },
    });
  } catch (err) {
    console.error("[audit] log write failed:", err);
  }
}

/** IP de la request en curso (best-effort; null si no aplica). */
export async function getAuditIp(): Promise<string | null> {
  try {
    const hdrs = await headers();
    return (
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      null
    );
  } catch {
    return null;
  }
}
