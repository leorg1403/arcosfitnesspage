import "server-only";
import { headers } from "next/headers";
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

/**
 * Escritura best-effort: si falla, solo deja un console.error.
 * La mutación real ya completó antes de llamar esto.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({ data: entry });
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
