"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/guard";
import { clearPageViews } from "@/lib/db/analytics";
import { writeAuditLog } from "@/lib/audit/log";
import { AUDIT_AREAS, AUDIT_ACTIONS } from "@/lib/audit/types";

/** Borra TODAS las analíticas. Admin-only (botón con confirmación en el panel). */
export async function clearAnalyticsAction() {
  const admin = await assertAdmin();
  const count = await clearPageViews();
  revalidatePath("/recepcion/analytics");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    action: AUDIT_ACTIONS.ANALYTICS_CLEAR,
    area: AUDIT_AREAS.ANALYTICS,
    summary: `${admin.name} borró todas las analíticas (${count} registros)`,
    after: { deletedCount: count },
  });
}
