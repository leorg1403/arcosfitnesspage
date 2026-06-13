import "server-only";
import { prisma } from "./client";

export const AUDIT_PAGE_SIZE = 50;

export type AuditLogFilters = {
  area?: string;
  action?: string;
  adminId?: string;
  from?: Date;
  to?: Date;
  search?: string;
  page?: number;
};

export async function getAuditLogs(f: AuditLogFilters) {
  const page = Math.max(1, f.page ?? 1);
  const where = {
    ...(f.area    && { area: f.area }),
    ...(f.action  && { action: { contains: f.action, mode: "insensitive" as const } }),
    ...(f.adminId && { adminId: f.adminId }),
    ...((f.from || f.to) && {
      occurredAt: { ...(f.from && { gte: f.from }), ...(f.to && { lte: f.to }) },
    }),
    ...(f.search && { summary: { contains: f.search, mode: "insensitive" as const } }),
  };
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      skip: (page - 1) * AUDIT_PAGE_SIZE,
      take: AUDIT_PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { logs, total, page, pageSize: AUDIT_PAGE_SIZE };
}

export async function getAuditAdmins() {
  return prisma.admin.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

/** Borra registros con más de 2 semanas. Llamado desde clearOldAuditLogsAction. */
export async function deleteOldAuditLogs(): Promise<number> {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const { count } = await prisma.auditLog.deleteMany({
    where: { occurredAt: { lt: cutoff } },
  });
  return count;
}
