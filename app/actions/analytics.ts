"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/guard";
import { clearPageViews } from "@/lib/db/analytics";

/** Borra TODAS las analíticas. Admin-only (botón con confirmación en el panel). */
export async function clearAnalyticsAction() {
  await assertAdmin();
  await clearPageViews();
  revalidatePath("/recepcion/analytics");
}
