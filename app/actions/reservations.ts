"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { GYM_HOURS_BY_DAY } from "@/lib/content";
import { sendEmail, OWNER_EMAILS } from "@/lib/email";
import { OwnerReservationEmail } from "@/lib/email/owner-reservation";
import { ClientReservationEmail } from "@/lib/email/client-reservation";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolveOccurrence, createReceptionReservation } from "@/lib/db/reservations";
import { priceMxnFromTemplate } from "@/lib/db/sessions";
import { reservationCancelUrl } from "@/lib/urls";
import { WEEKDAY_TO_DAY, weekdayOfISO, formatDateLabel } from "@/lib/booking/window";
import { FITNESS_APP_VALUES, fitnessAppLabel } from "@/lib/fitness-apps";
import { writeAuditLog } from "@/lib/audit/log";
import { AUDIT_AREAS, AUDIT_ACTIONS } from "@/lib/audit/types";

/**
 * Reserva de recepción / socio (sin Stripe). El cliente manda SOLO el id de la
 * plantilla + la fecha de la ocurrencia + sus datos; el servidor revalida la
 * ocurrencia, deriva precio/nombre del catálogo (BD), descuenta cupo de forma
 * atómica y registra la reserva ligada a su cuenta (Customer). El pago en línea
 * NO pasa por aquí (va por el checkout de Stripe).
 */
const InputSchema = z.object({
  templateId: z.string().min(1).max(64),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().min(8).max(40),
  member: z.boolean().optional(),
  fitnessApp: z.enum(FITNESS_APP_VALUES).optional(),
  // honeypot: debe llegar vacío; si trae algo, es un bot
  website: z.string().max(200).optional(),
});

export type CreateReservationResult =
  | { ok: true; clientEmailSent: boolean; code: string; shortCode: string }
  | { ok: false; error: string };

export async function createReservation(
  input: unknown
): Promise<CreateReservationResult> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";
  const { rateLimited } = await checkRateLimit("reservation", {
    ip,
    headers: Object.fromEntries(hdrs.entries()),
  });
  if (rateLimited) {
    return { ok: false, error: "Demasiados intentos. Espera un momento e inténtalo de nuevo." };
  }

  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };
  const data = parsed.data;

  // Honeypot: fingimos éxito sin loguear (no dar señal al bot).
  if (data.website && data.website.trim() !== "") {
    return { ok: true, clientEmailSent: false, code: "", shortCode: "" };
  }

  const occ = await resolveOccurrence(data.templateId, data.date);
  if (!occ.ok) {
    return {
      ok: false,
      error:
        occ.reason === "not_found"
          ? "Clase no encontrada."
          : "Ese horario ya no está disponible. Refresca la página.",
    };
  }
  const template = occ.template;

  const fitnessApp = template.onlineOnly ? null : (data.fitnessApp ?? null);
  const included = template.onlineOnly ? false : (data.member === true || fitnessApp != null);

  const result = await createReceptionReservation({
    template,
    dateISO: data.date,
    name: data.name,
    email: data.email,
    phone: data.phone,
    member: included,
    fitnessApp,
  });

  if (!result.ok) {
    const msg =
      result.reason === "full"
        ? "Esta clase ya está llena. Elige otro horario."
        : "No pudimos completar tu reserva. Escríbenos por WhatsApp y te ayudamos.";
    return { ok: false, error: msg };
  }

  const day = WEEKDAY_TO_DAY[weekdayOfISO(data.date)];
  const isOpenGym = template.category === "open_gym";
  const className = template.name;
  const classDay = formatDateLabel(data.date);
  const classTime = isOpenGym ? GYM_HOURS_BY_DAY[day] : template.startTime;
  const amountDue = Math.round(priceMxnFromTemplate(template) * 100);
  const paymentPending = !included;
  const appLabel = fitnessAppLabel(fitnessApp);

  const ownerSubject = appLabel
    ? `Reserva vía ${appLabel} · validar acceso · ${className} · ${classDay} ${classTime}`
    : included
    ? `Reserva de socio · verificar membresía · ${className} · ${classDay} ${classTime}`
    : `Reserva pendiente a pago · ${className} · ${classDay} ${classTime}`;
  const clientSubject = appLabel
    ? `Reserva apartada (${appLabel}) · ${className} · ${classDay}`
    : included
    ? `Reserva apartada (socio) · ${className} · ${classDay}`
    : `Reserva apartada · ${className} · ${classDay}`;

  const [ownerRes, clientRes] = await Promise.allSettled([
    sendEmail({
      to: OWNER_EMAILS,
      subject: ownerSubject,
      react: OwnerReservationEmail({
        className,
        classDay,
        classTime,
        classInstructor: template.instructor,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        paymentPending,
        amountDue,
        member: included,
        fitnessAppLabel: appLabel ?? undefined,
        reservationCode: result.shortCode,
      }),
      replyTo: data.email,
    }),
    sendEmail({
      to: data.email,
      subject: clientSubject,
      optional: true,
      react: ClientReservationEmail({
        customerName: data.name,
        className,
        classDay,
        classTime,
        classInstructor: template.instructor,
        paymentPending,
        amountDue,
        member: included,
        fitnessAppLabel: appLabel ?? undefined,
        reservationCode: result.shortCode,
        cancelUrl: reservationCancelUrl(result.code),
      }),
    }),
  ]);

  if (ownerRes.status === "rejected") {
    console.error("[createReservation] owner email error:", ownerRes.reason);
  }

  const clientEmailSent =
    clientRes.status === "fulfilled" &&
    clientRes.value.mock === false &&
    clientRes.value.id != null;

  await writeAuditLog({
    actorKind: "customer",
    ip,
    action: AUDIT_ACTIONS.RESERVATION_CREATE_CUSTOMER,
    area: AUDIT_AREAS.RESERVAS,
    entityKind: "Reservation",
    entityId: result.code,
    summary: `${data.name} (${data.email}) reservó ${className} el ${data.date} (${result.shortCode})`,
    after: {
      shortCode: result.shortCode,
      templateId: data.templateId,
      date: data.date,
      customerName: data.name,
      customerEmail: data.email,
      member: included,
      fitnessApp: fitnessApp ?? null,
    },
  });

  return { ok: true, clientEmailSent, code: result.code, shortCode: result.shortCode };
}
