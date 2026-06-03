import "server-only";
import { randomUUID } from "node:crypto";
import type { ClassTemplate, FitnessApp, ReservationStatus } from "@prisma/client";
import { prisma } from "./client";
import { ensureSession, priceMxnFromTemplate } from "./sessions";
import { upsertCustomer, normalizeEmail } from "./customers";
import { nextOccurrenceISO, startInstant } from "@/lib/booking/window";

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

// ─── Reagendar (mover) una reserva PAGADA a otra clase ─────────────────────────
// En vez de cancelar, una reserva pagada en línea se puede MOVER a otra clase
// siempre que: el cliente NO haya asistido y falten MÁS de 2h para el inicio de la
// clase reservada (no pasó ni está por empezar). TODA la validación es server-side.

const RESCHEDULE_CUTOFF_MS = 2 * 60 * 60 * 1000; // 2 horas antes del inicio

class SameSessionError extends Error {}

export type RescheduleReason =
  | "not_found"
  | "not_paid" // solo reservas pagadas en línea
  | "attended" // ya asistió / no-show marcado
  | "too_late" // ya pasó o faltan <2h
  | "target_invalid" // clase destino no reservable
  | "price_mismatch" // distinto precio (anti-abuso)
  | "full"
  | "same"; // misma clase/fecha que ya tiene

type ReservationEligibilityShape = {
  kind: string;
  paymentStatus: string;
  status: string;
  attendance: string;
  session: { date: Date; startTime: string };
} | null;

/** Elegibilidad (sin mutar). Misma lógica que usa el servidor al mover. */
export function checkRescheduleEligibility(
  r: ReservationEligibilityShape,
  now: Date = new Date()
): { ok: true } | { ok: false; reason: RescheduleReason } {
  if (!r) return { ok: false, reason: "not_found" };
  const paid = r.kind === "online" && r.paymentStatus === "paid" && r.status === "confirmed";
  if (!paid) return { ok: false, reason: "not_paid" };
  if (r.attendance !== "pending") return { ok: false, reason: "attended" };
  const dateISO = r.session.date.toISOString().slice(0, 10);
  const startMs = startInstant(dateISO, r.session.startTime);
  if (now.getTime() >= startMs - RESCHEDULE_CUTOFF_MS) return { ok: false, reason: "too_late" };
  return { ok: true };
}

/** Lectura para la página pública /reagendar/[code] (sin mutar). */
export async function getReservationForReschedule(code: string) {
  return prisma.reservation.findUnique({
    where: { code },
    select: {
      code: true,
      shortCode: true,
      status: true,
      paymentStatus: true,
      kind: true,
      attendance: true,
      amountDueCents: true,
      session: {
        select: {
          date: true,
          startTime: true,
          template: { select: { id: true, name: true, category: true, durationMin: true } },
        },
      },
    },
  });
}

export type RescheduleResult =
  | {
      ok: true;
      details: {
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
        fromClassName: string;
        fromDateISO: string;
        fromStartTime: string;
      };
    }
  | { ok: false; reason: RescheduleReason };

/**
 * Mueve una reserva pagada a otra clase. Revalida TODO en el servidor: elegibilidad
 * (pagada + no asistió + >2h), que el destino sea una ocurrencia reservable
 * (resolveOccurrence), mismo precio (anti-abuso), y hace el swap de cupos de forma
 * atómica (descuenta el nuevo, libera el viejo). NO cobra ni reembolsa.
 */
export async function rescheduleReservation(
  args: { code: string; templateId: string; dateISO: string },
  now: Date = new Date()
): Promise<RescheduleResult> {
  const r = await prisma.reservation.findUnique({
    where: { code: args.code },
    select: {
      id: true,
      code: true,
      shortCode: true,
      status: true,
      paymentStatus: true,
      kind: true,
      attendance: true,
      amountDueCents: true,
      sessionId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      session: {
        select: {
          date: true,
          startTime: true,
          template: { select: { name: true } },
        },
      },
    },
  });
  const elig = checkRescheduleEligibility(r, now);
  if (!elig.ok) return { ok: false, reason: elig.reason };
  // elig.ok ⇒ r no es null.
  const res = r!;

  // Destino: debe ser una ocurrencia reservable AHORA (plantilla activa + fecha vigente).
  const occ = await resolveOccurrence(args.templateId, args.dateISO, now);
  if (!occ.ok) return { ok: false, reason: "target_invalid" };
  const template = occ.template;
  if (!template.tracksSpots) return { ok: false, reason: "target_invalid" }; // solo clases con cupo

  // Mismo precio que lo pagado (no permitir "subir" de clase sin cobrar).
  const targetCents = Math.round(priceMxnFromTemplate(template) * 100);
  if (targetCents !== res.amountDueCents) return { ok: false, reason: "price_mismatch" };

  try {
    await prisma.$transaction(async (tx) => {
      const target = await ensureSession(tx, template, args.dateISO);
      if (target.id === res.sessionId) throw new SameSessionError();
      const { count } = await tx.classSession.updateMany({
        where: { id: target.id, availableSpots: { gt: 0 } },
        data: { availableSpots: { decrement: 1 } },
      });
      if (count === 0) throw new FullError(); // destino lleno → aborta
      await tx.reservation.update({ where: { id: res.id }, data: { sessionId: target.id } });
      // Libera el cupo de la clase anterior (si la trackea).
      await tx.classSession.updateMany({
        where: { id: res.sessionId, availableSpots: { not: null } },
        data: { availableSpots: { increment: 1 } },
      });
    });
  } catch (e) {
    if (e instanceof FullError) return { ok: false, reason: "full" };
    if (e instanceof SameSessionError) return { ok: false, reason: "same" };
    throw e;
  }

  return {
    ok: true,
    details: {
      code: res.code,
      shortCode: res.shortCode,
      customerName: res.customerName,
      customerEmail: res.customerEmail,
      customerPhone: res.customerPhone,
      className: template.name,
      instructor: template.instructor,
      dateISO: args.dateISO,
      startTime: template.startTime,
      isOpenGym: template.category === "open_gym",
      fromClassName: res.session.template.name,
      fromDateISO: res.session.date.toISOString().slice(0, 10),
      fromStartTime: res.session.startTime,
    },
  };
}
