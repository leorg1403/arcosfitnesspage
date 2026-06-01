import { NextRequest, NextResponse } from "next/server";
import { sweepExpiredHolds } from "@/lib/db/payments";
import { purgeOldData, reconcileCapacities, expireMemberships } from "@/lib/db/maintenance";

export const runtime = "nodejs";

/**
 * Cron de mantenimiento (Vercel Cron). MUTA inventario → protegido con CRON_SECRET.
 * Vercel Cron envía `Authorization: Bearer ${CRON_SECRET}` automáticamente cuando
 * la env var CRON_SECRET está definida.
 *  - Libera holds vencidos (transición guardada, idempotente).
 *  - Reconcilia cupos (backstop de deriva).
 *  - Purga datos viejos (retención / minimización de PII).
 */
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const released = await sweepExpiredHolds();
  const reconciled = await reconcileCapacities();
  const expiredMemberships = await expireMemberships();
  const purged = await purgeOldData();
  return NextResponse.json({ ok: true, released, ...reconciled, ...expiredMemberships, ...purged });
}
