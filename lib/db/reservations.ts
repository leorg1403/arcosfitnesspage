import "server-only";
import { randomUUID } from "node:crypto";
import type { ClassTemplate, FitnessApp, ReservationStatus } from "@prisma/client";
import { prisma } from "./client";
import { ensureSession, priceMxnFromTemplate } from "./sessions";
import { upsertCustomer, normalizeEmail } from "./customers";
import { nextOccurrenceISO } from "@/lib/booking/window";

const CANCELLABLE_STATUSES: ReservationStatus[] = ["pending", "confirmed"];

/** Genera el código de reserva (UUID autoridad) + shortCode visible (últimos 6). */
export function makeReservationCode(): { code: string; shortCode: string } {
  const code = randomUUID();
  const shortCode = code.replace(/-/g, "").slice(-6).toUpperCase();
  return { code, shortCode };
}

class FullError extends Error {}

export type ResolveOccurrence =
  | { ok: true; template: ClassTemplate }
  | { ok: false; reason: "not_found" | "not_bookable" };

/**
 * Valida en el SERVIDOR que (templateId, dateISO) es la próxima ocurrencia
 * reservable. Como ADVANCE_WEEKS=0, la ÚNICA fecha permitida es la siguiente
 * ocurrencia calculada ahora — así una UI vieja no puede reservar fechas raras.
 */
export async function resolveOccurrence(
  templateId: string,
  dateISO: string,
  now: Date = new Date()
): Promise<ResolveOccurrence> {
  const template = await prisma.classTemplate.findFirst({
    where: { id: templateId, active: true },
  });
  if (!template) return { ok: false, reason: "not_found" };
  const expected = nextOccurrenceISO(template, now);
  if (!expected || expected !== dateISO) return { ok: false, reason: "not_bookable" };
  return { ok: true, template };
}

export type ReserveResult =
  | { ok: true; code: string; shortCode: string; sessionId: string }
  | { ok: false; reason: "full" | "blocked" };

type ReceptionArgs = {
  template: ClassTemplate;
  dateISO: string;
  name: string;
  email: string;
  phone: string;
  // true => acceso incluido, sin cobro (socio O app de fitness) | false => visitante
  // (pendiente de pago en recepción). El servidor ya derivó esto; nunca el cliente.
  member: boolean;
  // app de fitness por la que entra (sin cobro). null => socio o visitante normal.
  fitnessApp?: FitnessApp | null;
};

/**
 * Reserva de recepción/socio (sin Stripe). Upsert de Customer + decremento
 * atómico guardado + creación de la Reservation, todo en una transacción.
 * Open Gym (tracksSpots=false) no decrementa.
 */
export async function createReceptionReservation(args: ReceptionArgs): Promise<ReserveResult> {
  const { template, dateISO } = args;
  const emailLower = normalizeEmail(args.email);
  const amountDueCents = Math.round(priceMxnFromTemplate(template) * 100);
  const { code, shortCode } = makeReservationCode();
  const fitnessApp = args.fitnessApp ?? null;
  // "member" = acceso incluido (sin cobro): aplica a socios Y a quienes llegan por
  // una app de fitness. La columna fitnessApp distingue ambos casos en recepción.
  const kind = args.member ? "member" : "reception";
  const status = args.member ? "confirmed" : "pending";
  const paymentStatus = args.member ? "none" : "pending_reception";

  // Customer fuera de la transacción (idempotente). Bloqueado => rechazar.
  const customer = await upsertCustomer(prisma, {
    name: args.name,
    email: args.email,
    phone: args.phone,
  });
  if (customer.status === "blocked") return { ok: false, reason: "blocked" };

  const baseData = {
    code,
    shortCode,
    customerId: customer.id,
    customerName: args.name.trim(),
    customerEmail: args.email.trim(),
    customerEmailLower: emailLower,
    customerPhone: args.phone.trim(),
    kind,
    fitnessApp,
    status,
    paymentStatus,
    amountDueCents,
  } as const;

  try {
    const sessionId = await prisma.$transaction(async (tx) => {
      const session = await ensureSession(tx, template, dateISO);

      if (template.tracksSpots) {
        const { count } = await tx.classSession.updateMany({
          where: { id: session.id, availableSpots: { gt: 0 } },
          data: { availableSpots: { decrement: 1 } },
        });
        if (count === 0) throw new FullError(); // lleno → aborta la tx
      }

      await tx.reservation.create({ data: { ...baseData, sessionId: session.id } });
      return session.id;
    });
    return { ok: true, code, shortCode, sessionId };
  } catch (e) {
    if (e instanceof FullError) return { ok: false, reason: "full" };
    // Se permiten múltiples reservas del mismo correo en la misma clase
    // (apartar para amigos), así que un error aquí es real → propagar.
    throw e;
  }
}

// ─── Cancelación (compartida por admin y por enlace público del cliente) ───────
export type CancelDetails = {
  code: string;
  shortCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  className: string;
  instructor: string;
  dateISO: string;
  startTime: string;
  isOpenGym: boolean;
};

export type CancelResult =
  | { ok: true; details: CancelDetails }
  | { ok: false; reason: "not_found" | "already" };

const SESSION_SELECT = {
  startTime: true,
  date: true,
  template: { select: { name: true, instructor: true, category: true } },
} as const;

function toDetails(r: {
  code: string;
  shortCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  session: {
    startTime: string;
    date: Date;
    template: { name: string; instructor: string; category: string };
  };
}): CancelDetails {
  return {
    code: r.code,
    shortCode: r.shortCode,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    customerPhone: r.customerPhone,
    className: r.session.template.name,
    instructor: r.session.template.instructor,
    dateISO: r.session.date.toISOString().slice(0, 10),
    startTime: r.session.startTime,
    isOpenGym: r.session.template.category === "open_gym",
  };
}

/**
 * Cancela una reserva activa (por id o por code) y REGRESA el cupo si la sesión
 * lo trackea. Transición guardada: solo libera si esta llamada hizo el cambio.
 * Devuelve los datos para mandar los correos.
 */
export async function cancelReservationCore(
  by: { id: string } | { code: string }
): Promise<CancelResult> {
  const r = await prisma.reservation.findUnique({
    where: by,
    select: {
      id: true,
      code: true,
      shortCode: true,
      status: true,
      sessionId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      session: { select: SESSION_SELECT },
    },
  });
  if (!r) return { ok: false, reason: "not_found" };
  if (r.status !== "pending" && r.status !== "confirmed") {
    return { ok: false, reason: "already" };
  }
  const { count } = await prisma.reservation.updateMany({
    where: { id: r.id, status: { in: CANCELLABLE_STATUSES } },
    data: { status: "cancelled" },
  });
  if (count !== 1) return { ok: false, reason: "already" };
  await prisma.classSession.updateMany({
    where: { id: r.sessionId, availableSpots: { not: null } },
    data: { availableSpots: { increment: 1 } },
  });
  return { ok: true, details: toDetails(r) };
}

/** Lectura para la página pública /cancelar/[code] (sin mutar). */
export async function getReservationByCode(code: string) {
  return prisma.reservation.findUnique({
    where: { code },
    select: {
      code: true,
      shortCode: true,
      status: true,
      session: { select: SESSION_SELECT },
    },
  });
}
