"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/guard";
import { deleteOldAuditLogs } from "@/lib/db/audit";
import { writeAuditLog } from "@/lib/audit/log";
import { AUDIT_AREAS, AUDIT_ACTIONS } from "@/lib/audit/types";

/** Borra registros de auditoría con más de 2 semanas. Admin-only. */
export async function clearOldAuditLogsAction() {
  const admin = await assertAdmin();
  const count = await deleteOldAuditLogs();
  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    action: AUDIT_ACTIONS.AUDIT_PURGE_OLD,
    area: AUDIT_AREAS.SISTEMA,
    summary: `${admin.name} eliminó ${count} registros de auditoría con más de 2 semanas`,
    after: { deletedCount: count },
  });
  revalidatePath("/recepcion/logs");
}
