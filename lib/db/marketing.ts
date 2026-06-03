import "server-only";
import type { Prisma, SubscriptionStatus } from "@prisma/client";
import { prisma } from "./client";
import { cdmxTodayISO } from "@/lib/booking/window";
import type { AudienceFilters } from "@/lib/marketing/filters";

// Mismas reglas de "socio" que el resto del panel: membresía manual activa o
// suscripción Stripe activa (ver listCustomers en admin.ts).
const ACTIVE_SUB_STATUSES: SubscriptionStatus[] = ["active", "trialing"];

function isoToDbDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

// Validación básica de correo para no mandar a basura. El CRM ya normaliza, pero
// nunca confiamos: filtramos cualquier cosa que no parezca un email.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Recipient = {
  id: string;
  name: string;
  email: string;
};

/**
 * Resuelve la audiencia (lista de destinatarios) a partir de los filtros, contra
 * el CRM vigente. SIEMPRE excluye: clientes `blocked`, dados de baja de marketing
 * (marketingOptOutAt) y correos inválidos. Devuelve correos únicos (Customer.email
 * ya es único). El llamador es responsable de que esto corra detrás de auth admin.
 */
export async function resolveAudience(filters: AudienceFilters): Promise<Recipient[]> {
  // 1) Base: candidatos enviables (no bloqueados, no dados de baja).
  const customers = await prisma.customer.findMany({
    where: { status: { not: "blocked" }, marketingOptOutAt: null },
    select: { id: true, name: true, email: true },
  });
  if (customers.length === 0) return [];
  const ids = customers.map((c) => c.id);

  // 2) Conjunto de socios + nombre de plan vigente (membresía manual o suscripción).
  const today = isoToDbDate(cdmxTodayISO());
  const [memberships, subs] = await Promise.all([
    prisma.membership.findMany({
      where: {
        customerId: { in: ids },
        status: "active",
        OR: [{ endsAt: null }, { endsAt: { gte: today } }],
      },
      orderBy: { createdAt: "desc" },
      select: { customerId: true, planName: true },
    }),
    prisma.subscription.findMany({
      where: { customerId: { in: ids }, status: { in: ACTIVE_SUB_STATUSES } },
      orderBy: { createdAt: "desc" },
      select: { customerId: true, planName: true },
    }),
  ]);
  const planByCustomer = new Map<string, string>();
  for (const m of memberships) if (!planByCustomer.has(m.customerId)) planByCustomer.set(m.customerId, m.planName);
  for (const s of subs) if (s.customerId && !planByCustomer.has(s.customerId)) planByCustomer.set(s.customerId, s.planName);
  const socios = new Set(planByCustomer.keys());

  // 3) Stats de reservas por cliente (para actividad + origen por app).
  const [byAttendance, byFitnessApp] = await Promise.all([
    prisma.reservation.groupBy({
      by: ["customerId", "attendance"],
      where: { customerId: { in: ids } },
      _count: { _all: true },
    }),
    prisma.reservation.groupBy({
      by: ["customerId", "fitnessApp"],
      where: { customerId: { in: ids }, fitnessApp: { not: null } },
      _count: { _all: true },
    }),
  ]);
  const totalByCustomer = new Map<string, number>();
  const noShowByCustomer = new Map<string, number>();
  for (const g of byAttendance) {
    totalByCustomer.set(g.customerId, (totalByCustomer.get(g.customerId) ?? 0) + g._count._all);
    if (g.attendance === "no_show") {
      noShowByCustomer.set(g.customerId, (noShowByCustomer.get(g.customerId) ?? 0) + g._count._all);
    }
  }
  const appsByCustomer = new Map<string, Set<string>>();
  for (const g of byFitnessApp) {
    if (!g.fitnessApp) continue;
    const set = appsByCustomer.get(g.customerId) ?? new Set<string>();
    set.add(g.fitnessApp);
    appsByCustomer.set(g.customerId, set);
  }

  // 4) Aplicar filtros.
  const planNeedle = filters.planContains.trim().toLowerCase();
  const result: Recipient[] = [];
  for (const c of customers) {
    if (!EMAIL_RE.test(c.email)) continue;

    // membresía
    if (filters.membership === "socio" && !socios.has(c.id)) continue;
    if (filters.membership === "no_socio" && socios.has(c.id)) continue;

    // plan (substring sobre el plan vigente)
    if (planNeedle) {
      const plan = planByCustomer.get(c.id)?.toLowerCase();
      if (!plan || !plan.includes(planNeedle)) continue;
    }

    // origen por app de fitness
    const apps = appsByCustomer.get(c.id);
    if (filters.fitnessApp === "any_app" && (!apps || apps.size === 0)) continue;
    if (filters.fitnessApp === "none" && apps && apps.size > 0) continue;
    if (
      filters.fitnessApp !== "any" &&
      filters.fitnessApp !== "any_app" &&
      filters.fitnessApp !== "none" &&
      !(apps && apps.has(filters.fitnessApp))
    ) {
      continue;
    }

    // actividad
    const total = totalByCustomer.get(c.id) ?? 0;
    if (filters.activity === "with_reservations" && total === 0) continue;
    if (filters.activity === "no_reservations" && total > 0) continue;
    if (filters.activity === "had_no_show" && (noShowByCustomer.get(c.id) ?? 0) === 0) continue;

    result.push({ id: c.id, name: c.name, email: c.email });
  }
  return result;
}

/** Conteo de audiencia sin materializar más de lo necesario. */
export async function countAudience(filters: AudienceFilters): Promise<number> {
  const r = await resolveAudience(filters);
  return r.length;
}

/**
 * Nombres de plan VIGENTES en el CRM (membresías manuales activas + suscripciones
 * activas). Sirve para el dropdown del filtro "plan contiene" — así el owner elige
 * de lo que realmente existe, sin teclear.
 */
export async function listActivePlanNames(): Promise<string[]> {
  const today = isoToDbDate(cdmxTodayISO());
  const [mem, subs] = await Promise.all([
    prisma.membership.findMany({
      where: { status: "active", OR: [{ endsAt: null }, { endsAt: { gte: today } }] },
      select: { planName: true },
      distinct: ["planName"],
    }),
    prisma.subscription.findMany({
      where: { status: { in: ACTIVE_SUB_STATUSES } },
      select: { planName: true },
      distinct: ["planName"],
    }),
  ]);
  const names = new Set<string>();
  for (const m of mem) if (m.planName?.trim()) names.add(m.planName.trim());
  for (const s of subs) if (s.planName?.trim()) names.add(s.planName.trim());
  return [...names].sort((a, b) => a.localeCompare(b, "es"));
}

// ── EmailList (audiencias guardadas) ───────────────────────────────────────────
export async function listEmailLists() {
  return prisma.emailList.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createEmailList(input: {
  name: string;
  description?: string | null;
  filters: AudienceFilters;
}) {
  return prisma.emailList.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      filters: input.filters as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function getEmailList(id: string) {
  return prisma.emailList.findUnique({ where: { id } });
}

export async function deleteEmailList(id: string) {
  // listId en EmailCampaign es SET NULL al borrar → no rompe el historial.
  await prisma.emailList.delete({ where: { id } });
}

// ── EmailCampaign (historial) ──────────────────────────────────────────────────
export async function listCampaigns(limit = 50) {
  return prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { list: { select: { name: true } } },
  });
}

export async function createCampaign(input: {
  subject: string;
  preheader?: string | null;
  heading: string;
  body: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  listId?: string | null;
  filters: AudienceFilters;
  recipientCount: number;
}) {
  return prisma.emailCampaign.create({
    data: {
      subject: input.subject,
      preheader: input.preheader ?? null,
      heading: input.heading,
      body: input.body,
      ctaLabel: input.ctaLabel ?? null,
      ctaUrl: input.ctaUrl ?? null,
      listId: input.listId ?? null,
      filters: input.filters as unknown as Prisma.InputJsonValue,
      recipientCount: input.recipientCount,
      status: "sending",
    },
  });
}

export async function finalizeCampaign(
  id: string,
  result: { status: "sent" | "failed"; sentCount: number; failedCount: number }
) {
  return prisma.emailCampaign.update({
    where: { id },
    data: {
      status: result.status,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
      sentAt: new Date(),
    },
  });
}

/** Marca la baja de marketing (idempotente). Devuelve si el cliente existe. */
export async function setMarketingOptOut(customerId: string): Promise<boolean> {
  const r = await prisma.customer.updateMany({
    where: { id: customerId, marketingOptOutAt: null },
    data: { marketingOptOutAt: new Date() },
  });
  if (r.count > 0) return true;
  // Ya estaba dado de baja o no existe: confirmamos existencia para el mensaje.
  const exists = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });
  return Boolean(exists);
}
