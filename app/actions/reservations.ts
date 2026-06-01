"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { CLASSES, DAY_LABELS, getClassPrice } from "@/lib/classes";
import { GYM_HOURS_BY_DAY } from "@/lib/content";
import { sendEmail, OWNER_EMAIL } from "@/lib/email";
import { OwnerReservationEmail } from "@/lib/email/owner-reservation";
import { ClientReservationEmail } from "@/lib/email/client-reservation";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * El cliente SOLO manda el id de la clase + sus datos de contacto.
 * Nombre, día, hora, instructor y precio se derivan del catálogo en el
 * servidor — nunca se confía en lo que llega del cliente.
 */
const InputSchema = z.object({
  classId: z.string().min(1).max(64),
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().min(8).max(40),
  payment: z.enum(["reception", "online"]).optional(),
  // socio: la clase está incluida en su membresía → sin cobro, validan en recepción
  member: z.boolean().optional(),
  // honeypot: debe llegar vacío; si trae algo, es un bot
  website: z.string().max(200).optional(),
});

export type CreateReservationResult =
  | { ok: true; clientEmailSent: boolean }
  | { ok: false; error: string };

export async function createReservation(
  input: unknown
): Promise<CreateReservationResult> {
  // 1) Rate limit — frena spam de correos / abuso de cuota de Postmark.
  //    Capa edge (Vercel) por IP confiable + respaldo en memoria por IP de header.
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
    return {
      ok: false,
      error: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
    };
  }

  // 2) Validar el payload (Server Actions ya bloquean orígenes cruzados / CSRF,
  //    pero igual no confiamos en el contenido).
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }
  const data = parsed.data;

  // 2b) Honeypot: si viene lleno, fingimos éxito para no darle señal al bot.
  if (data.website && data.website.trim() !== "") {
    return { ok: true, clientEmailSent: false };
  }

  // 3) La clase DEBE existir en el catálogo. Todo lo sensible se deriva aquí.
  const cls = CLASSES.find((c) => c.id === data.classId);
  if (!cls) {
    return { ok: false, error: "Clase no encontrada." };
  }
  // Clases que cobran sí o sí (Master Class): no se permite reservar por recepción.
  if (cls.onlineOnly) {
    return { ok: false, error: "Esta clase requiere pago en línea." };
  }

  const isOpenGym = cls.category === "open-gym";
  const className = cls.name;
  const classDay = `${DAY_LABELS[cls.day]}${cls.dateLabel ? ` ${cls.dateLabel}` : ""}`;
  const classTime = isOpenGym ? GYM_HOURS_BY_DAY[cls.day] : cls.time;
  const classInstructor = cls.instructor;
  const amountDue = getClassPrice(cls) * 100; // centavos, derivado del servidor
  const isMember = data.member === true;
  // Socio: incluido en su membresía (sin cobro). Visitante por recepción: pendiente a pago.
  const paymentPending = !isMember && data.payment !== "online";

  const ownerSubject = isMember
    ? `Reserva de socio · verificar membresía · ${className} · ${classDay} ${classTime}`
    : paymentPending
    ? `Reserva pendiente a pago · ${className} · ${classDay} ${classTime}`
    : `Nueva reserva · ${className} · ${classDay} ${classTime}`;

  const clientSubject = isMember
    ? `Reserva apartada (socio) · ${className} · ${classDay}`
    : paymentPending
    ? `Reserva apartada · ${className} · ${classDay}`
    : `Tu reserva en Arcos: ${className} · ${classDay}`;

  // El correo al owner es el REGISTRO de la reserva → crítico. Va a un correo del
  // propio dominio, así que sale aun con la cuenta de Postmark pendiente.
  // El correo al cliente es best-effort (`optional`): mientras Postmark esté
  // pendiente no deja enviar fuera del dominio, pero eso NO debe romper la reserva.
  const [ownerRes, clientRes] = await Promise.allSettled([
    sendEmail({
      to: OWNER_EMAIL,
      subject: ownerSubject,
      react: OwnerReservationEmail({
        className,
        classDay,
        classTime,
        classInstructor,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        paymentPending,
        amountDue,
        member: isMember,
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
        classInstructor,
        paymentPending,
        amountDue,
        member: isMember,
      }),
    }),
  ]);

  if (ownerRes.status === "rejected") {
    console.error("[createReservation] owner email error:", ownerRes.reason);
    return { ok: false, error: "No se pudo registrar tu reserva. Intenta de nuevo." };
  }

  // ¿El correo al cliente realmente salió? (no demo, no omitido por Postmark pendiente)
  const clientEmailSent =
    clientRes.status === "fulfilled" &&
    clientRes.value.mock === false &&
    clientRes.value.id != null;

  return { ok: true, clientEmailSent };
}
