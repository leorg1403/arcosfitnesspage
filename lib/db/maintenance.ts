import "server-only";
import type { ReservationStatus } from "@prisma/client";
import { prisma } from "./client";
import { cdmxTodayISO } from "@/lib/booking/window";

const DEAD_STATUSES: ReservationStatus[] = ["expired", "cancelled"];
const ACTIVE_STATUSES: ReservationStatus[] = ["confirmed", "pending"];

/** Marca como vencidas las membresías manuales cuya fecha de fin ya pasó. */
export async function expireMemberships(): Promise<{ membershipsExpired: number }> {
  const today = new Date(`${cdmxTodayISO()}T00:00:00Z`);
  const { count } = await prisma.membership.updateMany({
    where: { status: "active", endsAt: { not: null, lt: today } },
    data: { status: "expired" },
  });
  return { membershipsExpired: count };
}

/** Retención: purga datos viejos para minimizar PII y mantener tablas chicas. */
export async function purgeOldData(now: Date = new Date()) {
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86_400_000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);
  const [resv, events] = await Promise.all([
    prisma.reservation.deleteMany({
      where: { status: { in: DEAD_STATUSES }, updatedAt: { lt: ninetyDaysAgo } },
    }),
    prisma.webhookEvent.deleteMany({ where: { processedAt: { lt: thirtyDaysAgo } } }),
  ]);
  return { reservationsPurged: resv.count, webhookEventsPurged: events.count };
}

/**
 * Reconciliación (backstop): recalcula availableSpots = max(0, capacity − activas)
 * para sesiones futuras con inventario, corrigiendo cualquier deriva por fallos
 * parciales (p. ej. un crash entre decremento y creación de reserva).
 */
export async function reconcileCapacities(): Promise<{ sessionsReconciled: number }> {
  const today = new Date(`${cdmxTodayISO()}T00:00:00Z`);
  const sessions = await prisma.classSession.findMany({
    where: { date: { gte: today }, availableSpots: { not: null } },
    select: { id: true, capacity: true, availableSpots: true },
  });
  let fixed = 0;
  for (const s of sessions) {
    const active = await prisma.reservation.count({
      where: { sessionId: s.id, status: { in: ACTIVE_STATUSES } },
    });
    const correct = Math.max(0, s.capacity - active);
    if (correct !== s.availableSpots) {
      await prisma.classSession.update({ where: { id: s.id }, data: { availableSpots: correct } });
      fixed++;
    }
  }
  return { sessionsReconciled: fixed };
}
