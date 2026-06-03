import "server-only";
import type { ItemKind } from "@prisma/client";
import { prisma } from "./client";
import { ensureSession, priceMxnFromTemplate } from "./sessions";
import { upsertCustomer, normalizeEmail } from "./customers";
import { resolveOccurrence, makeReservationCode } from "./reservations";

/** Minutos que dura el apartado (hold) antes de liberarse si no pagan. */
export const HOLD_MINUTES = 10;
/** Máximo de holds activos sin pagar por cliente (anti-DoS de cupos). */
export const MAX_ACTIVE_HOLDS = 2;

class FullErr extends Error {}

export type HoldResult =
  | { ok: true; reservationId: string; amountCents: number; code: string; shortCode: string }
  | {
      ok: false;
      reason: "full" | "blocked" | "too_many_holds" | "not_bookable" | "not_found";
    };

/**
 * Apartado (hold) para pago en línea de una clase: valida ocurrencia, upsert
 * Customer (+ check de bloqueo), reutiliza un hold activo del mismo cliente para
 * esta sesión (idempotente), respeta el tope de holds, y descuenta cupo de forma
 * atómica creando la Reservation pendiente con `holdExpiresAt`.
 */
export async function createClassHold(args: {
  templateId: string;
  dateISO: string;
  name: string;
  email: string;
  phone: string;
}): Promise<HoldResult> {
  const now = new Date();
  const occ = await resolveOccurrence(args.templateId, args.dateISO, now);
  if (!occ.ok) {
    return { ok: false, reason: occ.reason === "not_found" ? "not_found" : "not_bookable" };
  }
  const template = occ.template;
  const amountCents = Math.round(priceMxnFromTemplate(template) * 100);

  const customer = await upsertCustomer(prisma, {
    name: args.name,
    email: args.email,
    phone: args.phone,
  });
  if (customer.status === "blocked") return { ok: false, reason: "blocked" };

  // Tope de holds activos SIN PAGAR por cliente (anti-DoS). Se permiten varios
  // (apartar para amigos): cada checkout crea su propio hold/cupo.
  const activeHolds = await prisma.reservation.count({
    where: { customerId: customer.id, kind: "online", status: "pending", holdExpiresAt: { gt: now } },
  });
  if (activeHolds >= MAX_ACTIVE_HOLDS) return { ok: false, reason: "too_many_holds" };

  const { code, shortCode } = makeReservationCode();
  const holdExpiresAt = new Date(now.getTime() + HOLD_MINUTES * 60_000);

  try {
    const reservationId = await prisma.$transaction(async (tx) => {
      const session = await ensureSession(tx, template, args.dateISO);
      if (template.tracksSpots) {
        const { count } = await tx.classSession.updateMany({
          where: { id: session.id, availableSpots: { gt: 0 } },
          data: { availableSpots: { decrement: 1 } },
        });
        if (count === 0) throw new FullErr();
      }
      const r = await tx.reservation.create({
        data: {
          code,
          shortCode,
          sessionId: session.id,
          customerId: customer.id,
          customerName: args.name.trim(),
          customerEmail: args.email.trim(),
          customerEmailLower: normalizeEmail(args.email),
          customerPhone: args.phone.trim(),
          kind: "online",
          status: "pending",
          paymentStatus: "none",
          amountDueCents: amountCents,
          holdExpiresAt,
        },
        select: { id: true },
      });
      return r.id;
    });
    return { ok: true, reservationId, amountCents, code, shortCode };
  } catch (e) {
    if (e instanceof FullErr) return { ok: false, reason: "full" };
    throw e;
  }
}

/** Crea/asegura el Payment pendiente tras crear la sesión de Stripe; liga reserva. */
export async function createPendingPayment(args: {
  stripeSessionId: string;
  itemKind: ItemKind;
  itemId: string;
  itemName: string;
  amountCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  reservationId?: string | null;
}): Promise<void> {
  const customer = await upsertCustomer(prisma, {
    name: args.customerName,
    email: args.customerEmail,
    phone: args.customerPhone,
  });
  await prisma.payment.upsert({
    where: { stripeSessionId: args.stripeSessionId },
    create: {
      stripeSessionId: args.stripeSessionId,
      itemKind: args.itemKind,
      itemId: args.itemId,
      itemName: args.itemName,
      amountTotalCents: args.amountCents,
      currency: args.currency,
      status: "pending",
      customerName: args.customerName,
      customerEmail: normalizeEmail(args.customerEmail),
      customerPhone: args.customerPhone ?? null,
      customerId: customer.id,
    },
    update: {},
  });
  if (args.reservationId) {
    await prisma.reservation.update({
      where: { id: args.reservationId },
      data: { stripeSessionId: args.stripeSessionId },
    });
  }
}

export type FinalizeInput = {
  stripeSessionId: string;
  paymentIntentId?: string | null;
  subscriptionId?: string | null;
  amountTotalCents: number;
  currency: string;
  itemKind: ItemKind;
  itemId: string;
  itemName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  reservationId?: string | null;
};

export type FinalizeResult = {
  paymentId: string;
  reservationConfirmed?: boolean;
  reservationCode?: string | null; // shortCode (display)
  reservationFullCode?: string | null; // UUID (para el enlace de cancelación)
  refundNeeded?: boolean;
};

/**
 * Finaliza un checkout PAGADO (llamado SOLO desde el webhook firmado, ya
 * de-duplicado por WebhookEvent). Marca el Payment como `paid`, confirma la
 * reserva de clase (re-adquiriendo cupo si el hold ya había expirado), y deja
 * señalado si hace falta reembolso (pagó pero ya no hay cupo).
 */
export async function finalizeCheckout(input: FinalizeInput): Promise<FinalizeResult> {
  const customer = await upsertCustomer(prisma, {
    name: input.customerName,
    email: input.customerEmail,
    phone: input.customerPhone,
  });

  const payment = await prisma.payment.upsert({
    where: { stripeSessionId: input.stripeSessionId },
    create: {
      stripeSessionId: input.stripeSessionId,
      stripePaymentIntentId: input.paymentIntentId ?? null,
      stripeSubscriptionId: input.subscriptionId ?? null,
      itemKind: input.itemKind,
      itemId: input.itemId,
      itemName: input.itemName,
      amountTotalCents: input.amountTotalCents,
      currency: input.currency,
      status: "paid",
      customerName: input.customerName,
      customerEmail: normalizeEmail(input.customerEmail),
      customerPhone: input.customerPhone ?? null,
      customerId: customer.id,
    },
    update: {
      status: "paid",
      stripePaymentIntentId: input.paymentIntentId ?? undefined,
      stripeSubscriptionId: input.subscriptionId ?? undefined,
      amountTotalCents: input.amountTotalCents,
      currency: input.currency,
    },
  });

  const result: FinalizeResult = { paymentId: payment.id };

  if (input.itemKind === "class" && input.reservationId) {
    const r = await prisma.reservation.findUnique({
      where: { id: input.reservationId },
      select: { id: true, status: true, sessionId: true, shortCode: true, code: true },
    });
    if (r) {
      result.reservationCode = r.shortCode;
      result.reservationFullCode = r.code;
      if (r.status === "confirmed") {
        result.reservationConfirmed = true;
      } else {
        // Camino normal: el hold sigue vigente (pending) → confirmar sin re-decrementar.
        const { count } = await prisma.reservation.updateMany({
          where: { id: r.id, status: "pending" },
          data: { status: "confirmed", paymentStatus: "paid", paymentId: payment.id },
        });
        if (count === 1) {
          result.reservationConfirmed = true;
        } else {
          // El hold expiró/liberó → intentar re-adquirir cupo.
          const session = await prisma.classSession.findUnique({
            where: { id: r.sessionId },
            select: { availableSpots: true },
          });
          if (session && session.availableSpots === null) {
            await prisma.reservation.updateMany({
              where: { id: r.id },
              data: { status: "confirmed", paymentStatus: "paid", paymentId: payment.id },
            });
            result.reservationConfirmed = true;
          } else {
            const dec = await prisma.classSession.updateMany({
              where: { id: r.sessionId, availableSpots: { gt: 0 } },
              data: { availableSpots: { decrement: 1 } },
            });
            if (dec.count === 1) {
              await prisma.reservation.updateMany({
                where: { id: r.id },
                data: { status: "confirmed", paymentStatus: "paid", paymentId: payment.id },
              });
              result.reservationConfirmed = true;
            } else {
              // Pagó pero ya no hay cupo → reembolso manual.
              result.refundNeeded = true;
            }
          }
        }
      }
    }
  }

  return result;
}

/**
 * Registra un pago tipado originado en una FACTURA de suscripción (inscripción,
 * mensualidad, renovación). Idempotente por (stripeInvoiceId, itemKind) → seguro
 * ante reintentos. Liga el pago a la suscripción y al Customer.
 */
export async function recordTypedPayment(args: {
  stripeInvoiceId: string;
  stripePaymentIntentId?: string | null;
  stripeSubscriptionId?: string | null;
  itemKind: ItemKind; // "inscripcion" | "subscription"
  itemId: string;
  itemName: string;
  amountCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
}): Promise<{ created: boolean }> {
  const existing = await prisma.payment.findFirst({
    where: { stripeInvoiceId: args.stripeInvoiceId, itemKind: args.itemKind },
    select: { id: true },
  });
  if (existing) return { created: false };

  const [customer, sub] = await Promise.all([
    upsertCustomer(prisma, {
      name: args.customerName,
      email: args.customerEmail,
      phone: args.customerPhone,
    }),
    args.stripeSubscriptionId
      ? prisma.subscription.findUnique({
          where: { stripeSubscriptionId: args.stripeSubscriptionId },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  await prisma.payment.create({
    data: {
      stripeSessionId: null,
      stripeInvoiceId: args.stripeInvoiceId,
      stripePaymentIntentId: args.stripePaymentIntentId ?? null,
      stripeSubscriptionId: args.stripeSubscriptionId ?? null,
      itemKind: args.itemKind,
      itemId: args.itemId,
      itemName: args.itemName,
      amountTotalCents: args.amountCents,
      currency: args.currency,
      status: "paid",
      customerName: args.customerName,
      customerEmail: normalizeEmail(args.customerEmail),
      customerPhone: args.customerPhone ?? null,
      customerId: customer.id,
      subscriptionId: sub?.id ?? null,
    },
  });
  return { created: true };
}

/** Libera (idempotente) el hold de una sesión de Stripe: solo si sigue pending. */
async function releaseHoldById(id: string, sessionId: string): Promise<void> {
  const { count } = await prisma.reservation.updateMany({
    where: { id, status: "pending" },
    data: { status: "expired" },
  });
  if (count === 1) {
    // Solo regresa cupo si la sesión lo trackea (availableSpots != null).
    await prisma.classSession.updateMany({
      where: { id: sessionId, availableSpots: { not: null } },
      data: { availableSpots: { increment: 1 } },
    });
  }
}

export async function releaseHoldByStripeSession(stripeSessionId: string): Promise<void> {
  const r = await prisma.reservation.findFirst({
    where: { stripeSessionId, status: "pending" },
    select: { id: true, sessionId: true },
  });
  if (r) await releaseHoldById(r.id, r.sessionId);
}

/** Barre holds vencidos (cron). Devuelve cuántos liberó. */
export async function sweepExpiredHolds(now: Date = new Date()): Promise<number> {
  const expired = await prisma.reservation.findMany({
    where: { status: "pending", kind: "online", holdExpiresAt: { lt: now } },
    select: { id: true, sessionId: true },
    take: 500,
  });
  for (const r of expired) await releaseHoldById(r.id, r.sessionId);
  return expired.length;
}

/**
 * Marca un pago por su payment_intent como `disputed` (contracargo) o `refunded`.
 * En contracargo, además marca al cliente como `flagged` para revisión.
 * Devuelve el pago (para avisar al dueño) o null si no se encontró.
 */
export async function markPaymentByIntent(
  paymentIntentId: string,
  status: "disputed" | "refunded"
) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  if (!payment) return null;
  await prisma.payment.update({ where: { id: payment.id }, data: { status } });
  if (status === "disputed" && payment.customerId) {
    await prisma.customer.updateMany({
      where: { id: payment.customerId, status: "active" },
      data: { status: "flagged" },
    });
  }
  return payment;
}

/** Lectura para confirm/return (solo lectura, sin correos). */
export async function getPaymentBySession(stripeSessionId: string) {
  return prisma.payment.findUnique({
    where: { stripeSessionId },
    include: { reservation: { select: { shortCode: true } } },
  });
}
