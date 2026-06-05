import "server-only";
import bcrypt from "bcryptjs";
import type {
  AttendanceStatus,
  CustomerStatus,
  ClassCategory,
  ClassLevel,
  ClassKind,
  LeadStatus,
  ReservationStatus,
  SubscriptionStatus,
} from "@prisma/client";
import { prisma } from "./client";
import { upsertCustomer } from "./customers";
import { cdmxTodayISO } from "@/lib/booking/window";

function isoToDbDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

const UPCOMING_STATUSES: ReservationStatus[] = ["confirmed", "pending"];
const ACTIVE_SUB_STATUSES: SubscriptionStatus[] = ["active", "trialing"];
const EXPIRED_SUB_STATUSES: SubscriptionStatus[] = [
  "canceled",
  "past_due",
  "unpaid",
  "incomplete",
];

/** Crea el admin por defecto si la tabla está vacía (idempotente). */
export async function ensureDefaultAdmin(): Promise<void> {
  const count = await prisma.admin.count();
  if (count > 0) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password) return;
  await prisma.admin.create({
    data: {
      email,
      name: "Recepción",
      passwordHash: bcrypt.hashSync(password, 12),
      role: "owner",
    },
  });
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const today = cdmxTodayISO();
  const monthStartISO = `${today.slice(0, 8)}01`;
  const todayDate = isoToDbDate(today);
  const monthStartDate = isoToDbDate(monthStartISO);
  const monthStartInstant = new Date(`${monthStartISO}T00:00:00-06:00`);

  const [upcoming, noShowMonth, revenue, totalCustomers, activeSubs] = await Promise.all([
    prisma.reservation.count({
      where: { status: { in: UPCOMING_STATUSES }, session: { date: { gte: todayDate } } },
    }),
    prisma.reservation.count({
      where: { attendance: "no_show", session: { date: { gte: monthStartDate } } },
    }),
    prisma.payment.aggregate({
      _sum: { amountTotalCents: true },
      where: { status: "paid", createdAt: { gte: monthStartInstant } },
    }),
    prisma.customer.count(),
    prisma.subscription.count({ where: { status: { in: ACTIVE_SUB_STATUSES } } }),
  ]);

  return {
    upcoming,
    noShowMonth,
    revenueMonthCents: revenue._sum.amountTotalCents ?? 0,
    totalCustomers,
    activeSubs,
  };
}

// ─── Reservas por fecha ───────────────────────────────────────────────────────
export async function listReservationsByDate(dateISO: string) {
  return prisma.reservation.findMany({
    where: { session: { date: isoToDbDate(dateISO) } },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      code: true,
      shortCode: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      kind: true,
      fitnessApp: true,
      status: true,
      attendance: true,
      paymentStatus: true,
      amountDueCents: true,
      session: {
        select: {
          id: true,
          startTime: true,
          capacity: true,
          availableSpots: true,
          template: { select: { name: true, category: true, durationMin: true } },
        },
      },
    },
  });
}

/** Busca reservas por código (shortCode o code completo), independiente de la fecha. */
export async function findReservationsByCode(query: string) {
  const q = query.trim();
  if (!q) return [];
  return prisma.reservation.findMany({
    where: { OR: [{ shortCode: { contains: q.toUpperCase() } }, { code: q.toLowerCase() }] },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      code: true,
      shortCode: true,
      customerName: true,
      customerEmail: true,
      kind: true,
      fitnessApp: true,
      status: true,
      attendance: true,
      session: {
        select: { date: true, startTime: true, template: { select: { name: true } } },
      },
    },
  });
}

/** Marca como no-show las reservas PENDIENTES de una sesión concreta. */
export async function markSessionNoShow(sessionId: string): Promise<number> {
  const { count } = await prisma.reservation.updateMany({
    where: { sessionId, attendance: "pending", status: { in: UPCOMING_STATUSES } },
    data: { attendance: "no_show" },
  });
  return count;
}

/** Fechas (ISO) con reservas, para poblar el selector — próximas y recientes. */
export async function listDatesWithReservations(limit = 30): Promise<string[]> {
  const rows = await prisma.classSession.findMany({
    where: { reservations: { some: {} } },
    select: { date: true },
    orderBy: { date: "desc" },
    take: limit,
  });
  return [...new Set(rows.map((r) => r.date.toISOString().slice(0, 10)))];
}

// ─── Clientes (CRM) + inasistencias ───────────────────────────────────────────
export async function listCustomers() {
  const customers = await prisma.customer.findMany({ orderBy: { updatedAt: "desc" } });
  const grouped = await prisma.reservation.groupBy({
    by: ["customerId", "attendance"],
    _count: { _all: true },
  });
  const stats = new Map<string, { total: number; noShow: number; attended: number }>();
  for (const g of grouped) {
    const s = stats.get(g.customerId) ?? { total: 0, noShow: 0, attended: 0 };
    s.total += g._count._all;
    if (g.attendance === "no_show") s.noShow += g._count._all;
    if (g.attendance === "attended") s.attended += g._count._all;
    stats.set(g.customerId, s);
  }

  // Membresía vigente por cliente: manual activa primero, luego suscripción Stripe.
  const today = isoToDbDate(cdmxTodayISO());
  const [activeMemberships, activeSubs] = await Promise.all([
    prisma.membership.findMany({
      where: { status: "active", OR: [{ endsAt: null }, { endsAt: { gte: today } }] },
      orderBy: { createdAt: "desc" },
      select: { customerId: true, planName: true },
    }),
    prisma.subscription.findMany({
      where: { status: { in: ACTIVE_SUB_STATUSES } },
      orderBy: { createdAt: "desc" },
      select: { customerId: true, planName: true },
    }),
  ]);
  const memByCustomer = new Map<string, string>();
  for (const m of activeMemberships) if (!memByCustomer.has(m.customerId)) memByCustomer.set(m.customerId, m.planName);
  for (const s of activeSubs) if (s.customerId && !memByCustomer.has(s.customerId)) memByCustomer.set(s.customerId, s.planName);

  return customers.map((c) => ({
    ...c,
    reservations: stats.get(c.id)?.total ?? 0,
    noShows: stats.get(c.id)?.noShow ?? 0,
    attended: stats.get(c.id)?.attended ?? 0,
    currentMembership: memByCustomer.get(c.id) ?? null,
  }));
}

/** Lista membresías MANUALES (con su cliente) para la vista unificada. */
export async function listMemberships() {
  return prisma.membership.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { id: true, name: true, email: true } } },
  });
}

export async function getCustomerDetail(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      reservations: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          shortCode: true,
          status: true,
          attendance: true,
          paymentStatus: true,
          session: { select: { date: true, startTime: true, template: { select: { name: true } } } },
        },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 50 },
      subscriptions: { orderBy: { createdAt: "desc" } },
      memberships: { orderBy: { createdAt: "desc" } },
    },
  });
}

// ─── Pagos / Suscripciones / Leads ────────────────────────────────────────────
export async function listPayments(limit = 100) {
  return prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

/** Detalle de un pago (con cliente, reserva y suscripción ligados). */
export async function getPaymentDetail(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      reservation: {
        select: {
          shortCode: true,
          status: true,
          attendance: true,
          session: {
            select: { date: true, startTime: true, template: { select: { name: true } } },
          },
        },
      },
      subscription: {
        select: { planName: true, status: true, currentPeriodEnd: true, stripeSubscriptionId: true },
      },
    },
  });
}

export async function listSubscriptions(filter: "active" | "expired" | "all" = "all") {
  const where =
    filter === "active"
      ? { status: { in: ACTIVE_SUB_STATUSES } }
      : filter === "expired"
      ? { status: { in: EXPIRED_SUB_STATUSES } }
      : {};
  return prisma.subscription.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function listLeads(limit = 200) {
  return prisma.lead.findMany({ orderBy: { lastSubmittedAt: "desc" }, take: limit });
}

export async function getLead(id: string) {
  return prisma.lead.findUnique({ where: { id } });
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  await prisma.lead.update({ where: { id }, data: { status } });
}

export async function listClassTemplates() {
  return prisma.classTemplate.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
}

// ─── Mutaciones ───────────────────────────────────────────────────────────────
export async function setAttendance(reservationId: string, attendance: AttendanceStatus) {
  await prisma.reservation.update({ where: { id: reservationId }, data: { attendance } });
}

/** Marca como no-show las reservas de una fecha que sigan en 'pending' (asistencia). */
export async function bulkMarkNoShow(dateISO: string): Promise<number> {
  const { count } = await prisma.reservation.updateMany({
    where: {
      session: { date: isoToDbDate(dateISO) },
      attendance: "pending",
      status: { in: UPCOMING_STATUSES },
    },
    data: { attendance: "no_show" },
  });
  return count;
}

export async function setCustomerStatus(id: string, status: CustomerStatus, notes?: string | null) {
  await prisma.customer.update({
    where: { id },
    data: { status, ...(notes !== undefined ? { notes } : {}) },
  });
}

/** Alta/obtención manual de un cliente por correo (recepción). Devuelve el cliente. */
export async function createOrGetCustomer(input: {
  name: string;
  email: string;
  phone?: string | null;
}) {
  return upsertCustomer(prisma, input);
}

/** Edita datos básicos del cliente. */
export async function updateCustomer(
  id: string,
  data: { name?: string; phone?: string | null; notes?: string | null }
) {
  await prisma.customer.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
  });
}

// ─── Membresías manuales ──────────────────────────────────────────────────────
export type AddMembershipInput = {
  customerId: string;
  planId: string;
  planName: string;
  priceCents: number;
  periodicity: string;
  startsAtISO: string;
  endsAtISO: string | null;
  notes?: string | null;
};

export async function addMembership(input: AddMembershipInput) {
  await prisma.membership.create({
    data: {
      customerId: input.customerId,
      planId: input.planId,
      planName: input.planName,
      priceCents: input.priceCents,
      periodicity: input.periodicity,
      startsAt: new Date(`${input.startsAtISO}T00:00:00Z`),
      endsAt: input.endsAtISO ? new Date(`${input.endsAtISO}T00:00:00Z`) : null,
      notes: input.notes ?? null,
    },
  });
}

export async function cancelMembership(id: string) {
  await prisma.membership.updateMany({
    where: { id, status: "active" },
    data: { status: "cancelled" },
  });
}

export type ClassTemplateInput = {
  id?: string;
  name: string;
  category: ClassCategory;
  kind: ClassKind;
  weekday: number | null;
  intervalWeeks: number;
  eventDate: string | null; // ISO
  startTime: string;
  durationMin: number;
  instructor: string;
  room: string;
  level: ClassLevel;
  description: string;
  image: string;
  capacity: number;
  priceCents: number | null;
  onlineOnly: boolean;
  tracksSpots: boolean;
  active: boolean;
  sortOrder: number;
};

export async function upsertClassTemplate(input: ClassTemplateInput) {
  const data = {
    name: input.name,
    category: input.category,
    kind: input.kind,
    weekday: input.kind === "weekly" ? input.weekday : null,
    intervalWeeks: input.intervalWeeks,
    eventDate: input.kind === "oneoff" && input.eventDate ? new Date(input.eventDate) : null,
    startTime: input.startTime,
    durationMin: input.durationMin,
    instructor: input.instructor,
    room: input.room,
    level: input.level,
    description: input.description,
    image: input.image,
    capacity: input.capacity,
    priceCents: input.priceCents,
    onlineOnly: input.onlineOnly,
    tracksSpots: input.tracksSpots,
    active: input.active,
    sortOrder: input.sortOrder,
  };
  const id =
    input.id ||
    `${input.category}-${input.startTime.replace(":", "")}-${Math.random().toString(36).slice(2, 7)}`;
  await prisma.classTemplate.upsert({ where: { id }, create: { id, ...data }, update: data });
}

export async function setClassTemplateActive(id: string, active: boolean) {
  await prisma.classTemplate.update({ where: { id }, data: { active } });
}

/**
 * Borra una clase del catálogo. SEGURO: si tiene reservas (en cualquier fecha)
 * NO se borra (se sugiere desactivarla). Si no tiene reservas, borra también sus
 * sesiones materializadas y la plantilla.
 */
export async function deleteClassTemplate(
  id: string
): Promise<{ ok: boolean; reason?: "has_reservations" }> {
  const reservationCount = await prisma.reservation.count({
    where: { session: { templateId: id } },
  });
  if (reservationCount > 0) return { ok: false, reason: "has_reservations" };
  await prisma.classSession.deleteMany({ where: { templateId: id } });
  await prisma.classTemplate.delete({ where: { id } });
  return { ok: true };
}

/**
 * Cambio rápido de cupo: actualiza la plantilla y PROPAGA a sesiones futuras con
 * inventario (recalcula availableSpots = max(0, nuevoCupo − reservas activas)).
 */
export async function setClassCapacity(id: string, capacity: number): Promise<void> {
  await prisma.classTemplate.update({ where: { id }, data: { capacity } });
  const today = isoToDbDate(cdmxTodayISO());
  const sessions = await prisma.classSession.findMany({
    where: { templateId: id, date: { gte: today }, availableSpots: { not: null } },
    select: { id: true },
  });
  for (const s of sessions) {
    const active = await prisma.reservation.count({
      where: { sessionId: s.id, status: { in: UPCOMING_STATUSES } },
    });
    await prisma.classSession.update({
      where: { id: s.id },
      data: { capacity, availableSpots: Math.max(0, capacity - active) },
    });
  }
}
