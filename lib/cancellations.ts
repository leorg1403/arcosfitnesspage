import "server-only";
import { cancelReservationCore } from "@/lib/db/reservations";
import { sendEmail, OWNER_EMAILS } from "@/lib/email";
import { ClientCancellationEmail } from "@/lib/email/client-cancellation";
import { OwnerCancellationEmail } from "@/lib/email/owner-cancellation";
import { formatDateLabel, WEEKDAY_TO_DAY, weekdayOfISO } from "@/lib/booking/window";
import { GYM_HOURS_BY_DAY } from "@/lib/content";

export type CancelledBy = "admin" | "customer";

/**
 * Cancela una reserva (por id o code) y manda los DOS correos: confirmación al
 * cliente + aviso al dueño. Lo usan tanto el admin como el enlace público.
 */
export async function performCancellation(
  by: { id: string } | { code: string },
  cancelledBy: CancelledBy
): Promise<{ ok: boolean; reason?: "not_found" | "already" }> {
  const res = await cancelReservationCore(by);
  if (!res.ok) return { ok: false, reason: res.reason };
  const d = res.details;
  const day = WEEKDAY_TO_DAY[weekdayOfISO(d.dateISO)];
  const classDay = formatDateLabel(d.dateISO);
  const classTime = d.isOpenGym ? GYM_HOURS_BY_DAY[day] : d.startTime;

  await Promise.allSettled([
    sendEmail({
      to: d.customerEmail,
      optional: true,
      subject: `Reserva cancelada · ${d.className} · ${classDay}`,
      react: ClientCancellationEmail({
        customerName: d.customerName,
        className: d.className,
        classDay,
        classTime,
        reservationCode: d.shortCode,
        byAdmin: cancelledBy === "admin",
      }),
    }),
    sendEmail({
      to: OWNER_EMAILS,
      subject: `Reserva cancelada (${cancelledBy === "admin" ? "recepción" : "cliente"}) · ${d.className} · ${d.customerName}`,
      replyTo: d.customerEmail,
      react: OwnerCancellationEmail({
        customerName: d.customerName,
        customerEmail: d.customerEmail,
        customerPhone: d.customerPhone,
        className: d.className,
        classDay,
        classTime,
        reservationCode: d.shortCode,
        byCustomer: cancelledBy === "customer",
      }),
    }),
  ]);

  return { ok: true };
}
