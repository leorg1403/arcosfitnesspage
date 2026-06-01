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
  // honeypot: debe llegar vacío; si trae algo, es un bot
  website: z.string().max(200).optional(),
});

export type CreateReservationResult =
  | { ok: true }
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
    return { ok: true };
  }

  // 3) La clase DEBE existir en el catálogo. Todo lo sensible se deriva aquí.
  const cls = CLASSES.find((c) => c.id === data.classId);
  if (!cls) {
    return { ok: false, error: "Clase no encontrada." };
  }

  const isOpenGym = cls.category === "open-gym";
  const className = cls.name;
  const classDay = `${DAY_LABELS[cls.day]}${cls.dateLabel ? ` ${cls.dateLabel}` : ""}`;
  const classTime = isOpenGym ? GYM_HOURS_BY_DAY[cls.day] : cls.time;
  const classInstructor = cls.instructor;
  const amountDue = getClassPrice(cls) * 100; // centavos, derivado del servidor
  const paymentPending = data.payment !== "online"; // recepción por defecto

  try {
    await Promise.all([
      sendEmail({
        to: OWNER_EMAIL,
        subject: paymentPending
          ? `Reserva pendiente a pago · ${className} · ${classDay} ${classTime}`
          : `Nueva reserva · ${className} · ${classDay} ${classTime}`,
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
        }),
        replyTo: data.email,
      }),
      sendEmail({
        to: data.email,
        subject: paymentPending
          ? `Reserva apartada · ${className} · ${classDay}`
          : `Tu reserva en Arcos: ${className} · ${classDay}`,
        react: ClientReservationEmail({
          customerName: data.name,
          className,
          classDay,
          classTime,
          classInstructor,
          paymentPending,
          amountDue,
        }),
      }),
    ]);
  } catch (err) {
    console.error("[createReservation] email error:", err);
    return {
      ok: false,
      error: "No se pudo enviar la confirmación. Intenta de nuevo.",
    };
  }

  return { ok: true };
}
