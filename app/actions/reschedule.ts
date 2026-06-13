"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { rescheduleReservation } from "@/lib/db/reservations";
import { sendEmail, OWNER_EMAILS } from "@/lib/email";
import { ClientReservationEmail } from "@/lib/email/client-reservation";
import { OwnerAlertEmail } from "@/lib/email/owner-alert";
import { GYM_HOURS_BY_DAY } from "@/lib/content";
import { reservationRescheduleUrl } from "@/lib/urls";
import { WEEKDAY_TO_DAY, weekdayOfISO, formatDateLabel } from "@/lib/booking/window";
import { writeAuditLog } from "@/lib/audit/log";
import { AUDIT_AREAS, AUDIT_ACTIONS } from "@/lib/audit/types";

const Schema = z.object({
  code: z.string().min(1).max(80),
  templateId: z.string().min(1).max(64),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/**
 * Mueve una reserva pagada a otra clase (form público de /reagendar). TODA la
 * validación de elegibilidad y del destino la hace el servidor (rescheduleReservation):
 * aquí solo validamos forma + rate-limit y disparamos correos. El `code` (UUID) es
 * el token de capacidad.
 */
export async function rescheduleByCustomer(formData: FormData) {
  const codeRaw = String(formData.get("code") ?? "");
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  if (
    (await checkRateLimit("reschedule", { ip, headers: Object.fromEntries(hdrs.entries()) }))
      .rateLimited
  ) {
    redirect(`/reagendar/${encodeURIComponent(codeRaw)}?e=rate`);
  }

  const parsed = Schema.safeParse({
    code: formData.get("code"),
    templateId: formData.get("templateId"),
    date: formData.get("date"),
  });
  if (!parsed.success) redirect(`/reagendar/${encodeURIComponent(codeRaw)}?e=datos`);
  const d = parsed.data;

  const result = await rescheduleReservation({
    code: d.code,
    templateId: d.templateId,
    dateISO: d.date,
  });
  if (!result.ok) redirect(`/reagendar/${encodeURIComponent(d.code)}?e=${result.reason}`);

  const det = result.details;
  const day = WEEKDAY_TO_DAY[weekdayOfISO(det.dateISO)];
  const classDay = formatDateLabel(det.dateISO);
  const classTime = det.isOpenGym ? GYM_HOURS_BY_DAY[day] : det.startTime;

  await Promise.allSettled([
    sendEmail({
      to: det.customerEmail,
      optional: true,
      subject: `Reserva reagendada · ${det.className} · ${classDay}`,
      react: ClientReservationEmail({
        customerName: det.customerName,
        className: det.className,
        classDay,
        classTime,
        classInstructor: det.instructor,
        rescheduled: true,
        reservationCode: det.shortCode,
        rescheduleUrl: reservationRescheduleUrl(det.code),
      }),
    }),
    sendEmail({
      to: OWNER_EMAILS,
      subject: `Reserva reagendada · ${det.customerName}`,
      react: OwnerAlertEmail({
        title: "Reserva reagendada por el cliente",
        body: `${det.customerName} (${det.customerEmail}) movió su reserva de ${det.fromClassName} (${formatDateLabel(det.fromDateISO)} ${det.fromStartTime}) a ${det.className} (${classDay} ${classTime}). Código ${det.shortCode}.`,
      }),
    }),
  ]);

  await writeAuditLog({
    actorKind: "customer",
    ip,
    action: AUDIT_ACTIONS.RESERVATION_RESCHEDULE,
    area: AUDIT_AREAS.RESERVAS,
    entityKind: "Reservation",
    entityId: det.code,
    summary: `${det.customerName} (${det.customerEmail}) reagendó #${det.shortCode} de "${det.fromClassName}" a "${det.className}" (${classDay})`,
    before: { className: det.fromClassName, date: det.fromDateISO, startTime: det.fromStartTime },
    after: { className: det.className, date: det.dateISO, startTime: det.startTime },
  });

  redirect(`/reagendar/${encodeURIComponent(d.code)}?done=1`);
}
