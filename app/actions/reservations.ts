"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { GYM_HOURS_BY_DAY } from "@/lib/content";
import { sendEmail, OWNER_EMAIL } from "@/lib/email";
import { OwnerReservationEmail } from "@/lib/email/owner-reservation";
import { ClientReservationEmail } from "@/lib/email/client-reservation";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolveOccurrence, createReceptionReservation } from "@/lib/db/reservations";
import { priceMxnFromTemplate } from "@/lib/db/sessions";
import { reservationCancelUrl } from "@/lib/urls";
import { WEEKDAY_TO_DAY, weekdayOfISO, formatDateLabel } from "@/lib/booking/window";

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
  // socio: la clase está incluida en su membresía → sin cobro, validan en recepción
  member: z.boolean().optional(),
  // honeypot: debe llegar vacío; si trae algo, es un bot
  website: z.string().max(200).optional(),
});

export type CreateReservationResult =
  | { ok: true; clientEmailSent: boolean; code: string; shortCode: string }
  | { ok: false; error: string };

export async function createReservation(
  input: unknown
): Promise<CreateReservationResult> {
  // 1) Rate limit por IP.
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

  // 2) Validar payload.
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };
  const data = parsed.data;

  // 2b) Honeypot: fingimos éxito para no darle señal al bot.
  if (data.website && data.website.trim() !== "") {
    return { ok: true, clientEmailSent: false, code: "", shortCode: "" };
  }

  // 3) Revalidar la ocurrencia en el servidor (plantilla activa + fecha vigente).
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

  // Clases que cobran sí o sí (Master Class): no se reservan por recepción.
  if (template.onlineOnly) {
    return { ok: false, error: "Esta clase requiere pago en línea." };
  }

  const isMember = data.member === true;

  // 4) Crear la reserva (upsert Customer + decremento atómico + registro).
  const result = await createReceptionReservation({
    template,
    dateISO: data.date,
    name: data.name,
    email: data.email,
    phone: data.phone,
    member: isMember,
  });

  if (!result.ok) {
    const msg =
      result.reason === "full"
        ? "Esta clase ya está llena. Elige otro horario."
        : result.reason === "duplicate"
        ? "Ya tienes una reserva para esta clase."
        : "No pudimos completar tu reserva. Escríbenos por WhatsApp y te ayudamos.";
    return { ok: false, error: msg };
  }

  // 5) Datos derivados para los correos.
  const day = WEEKDAY_TO_DAY[weekdayOfISO(data.date)];
  const isOpenGym = template.category === "open_gym";
  const className = template.name;
  const classDay = formatDateLabel(data.date);
  const classTime = isOpenGym ? GYM_HOURS_BY_DAY[day] : template.startTime;
  const amountDue = Math.round(priceMxnFromTemplate(template) * 100);
  const paymentPending = !isMember;

  const ownerSubject = isMember
    ? `Reserva de socio · verificar membresía · ${className} · ${classDay} ${classTime}`
    : `Reserva pendiente a pago · ${className} · ${classDay} ${classTime}`;
  const clientSubject = isMember
    ? `Reserva apartada (socio) · ${className} · ${classDay}`
    : `Reserva apartada · ${className} · ${classDay}`;

  // El correo al owner es el registro secundario (la fila ya es el registro de
  // verdad). El correo al cliente es best-effort.
  const [ownerRes, clientRes] = await Promise.allSettled([
    sendEmail({
      to: OWNER_EMAIL,
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
        member: isMember,
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
        member: isMember,
        reservationCode: result.shortCode,
        cancelUrl: reservationCancelUrl(result.code),
      }),
    }),
  ]);

  if (ownerRes.status === "rejected") {
    // La reserva YA está registrada en BD; solo falló el correo de aviso.
    console.error("[createReservation] owner email error:", ownerRes.reason);
  }

  const clientEmailSent =
    clientRes.status === "fulfilled" &&
    clientRes.value.mock === false &&
    clientRes.value.id != null;

  return { ok: true, clientEmailSent, code: result.code, shortCode: result.shortCode };
}
