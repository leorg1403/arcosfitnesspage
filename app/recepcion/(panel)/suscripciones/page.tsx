import Link from "next/link";
import { listSubscriptions, listMemberships } from "@/lib/db/admin";
import { Table, Badge, PageHeader, fmtMoney, membershipBadgeTone, type BadgeTone } from "@/components/recepcion/ui";
import { cdmxTodayISO } from "@/lib/booking/window";

function intervalLabel(i: string | null): string {
  return i === "year" ? "año" : "mes";
}

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Vigentes" },
  { key: "expired", label: "Vencidas" },
] as const;

type UnifiedRow = {
  customerName: string;
  customerId: string | null;
  planName: string;
  source: "Stripe" | "Recepción";
  active: boolean;
  statusLabel: string;
  statusTone: BadgeTone;
  until: string;
  recurring: string; // cobro recurrente real ($2,800/mes) — verifica que NO es el total
  created: number;
};

export default async function MembresiasPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const sp = await searchParams;
  const filter = (sp.f === "active" || sp.f === "expired" ? sp.f : "all") as
    | "all"
    | "active"
    | "expired";
  const today = cdmxTodayISO();

  const [subs, memberships] = await Promise.all([listSubscriptions("all"), listMemberships()]);

  const stripeRows: UnifiedRow[] = subs.map((s) => {
    const active = s.status === "active" || s.status === "trialing";
    const tone: BadgeTone = active ? "green" : s.status === "past_due" ? "amber" : "red";
    return {
      customerName: s.customerName,
      customerId: s.customerId,
      planName: s.planName,
      source: "Stripe",
      active,
      statusLabel: s.status,
      statusTone: tone,
      until: s.currentPeriodEnd ? s.currentPeriodEnd.toISOString().slice(0, 10) : "—",
      recurring:
        s.recurringAmountCents != null
          ? `${fmtMoney(s.recurringAmountCents, "MXN")}/${intervalLabel(s.recurringInterval)}`
          : "—",
      created: s.createdAt.getTime(),
    };
  });

  const manualRows: UnifiedRow[] = memberships.map((m) => {
    const ends = m.endsAt ? m.endsAt.toISOString().slice(0, 10) : null;
    const vigente = m.status === "active" && (!ends || ends >= today);
    const tone: BadgeTone = m.status === "cancelled" ? "red" : vigente ? "green" : "neutral";
    const label = m.status === "cancelled" ? "cancelada" : vigente ? "vigente" : "vencida";
    return {
      customerName: m.customer.name,
      customerId: m.customer.id,
      planName: m.planName,
      source: "Recepción",
      active: vigente,
      statusLabel: label,
      statusTone: tone,
      until: ends ?? "—",
      recurring: `${fmtMoney(m.priceCents, "MXN")}${m.periodicity === "mensual" ? "/mes" : ""}`,
      created: m.createdAt.getTime(),
    };
  });

  const all = [...stripeRows, ...manualRows]
    .filter((r) => (filter === "active" ? r.active : filter === "expired" ? !r.active : true))
    .sort((a, b) => b.created - a.created);

  const rows = all.map((r) => [
    r.customerId ? (
      <Link key="c" href={`/recepcion/clientes/${r.customerId}`} className="text-paper hover:text-gold transition-colors">
        {r.customerName}
      </Link>
    ) : (
      r.customerName
    ),
    <Badge key="p" tone={membershipBadgeTone(r.planName)}>{r.planName}</Badge>,
    <Badge key="o" tone={r.source === "Stripe" ? "neutral" : "silver"}>{r.source}</Badge>,
    <span key="r" className="tabular-nums text-paper/85">{r.recurring}</span>,
    <Badge key="s" tone={r.statusTone}>{r.statusLabel}</Badge>,
    r.until,
  ]);

  return (
    <>
      <PageHeader
        title="Membresías"
        subtitle="Suscripciones de Stripe + membresías dadas de alta en recepción."
        action={
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={`/recepcion/suscripciones?f=${f.key}`}
                className={
                  "px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] border transition-colors " +
                  (filter === f.key
                    ? "border-gold/50 text-gold bg-gold/[0.08]"
                    : "border-paper/10 text-paper/50 hover:text-paper")
                }
              >
                {f.label}
              </Link>
            ))}
          </div>
        }
      />
      <Table
        columns={["Cliente", "Plan", "Origen", "Cobro recurrente", "Estado", "Vigente hasta"]}
        rows={rows}
        empty="Sin membresías"
      />
      <p className="mt-4 text-[0.65rem] leading-relaxed text-paper/35">
        &quot;Cobro recurrente&quot; es lo que Stripe cobra cada periodo (solo la mensualidad). La
        inscripción es un cargo único de la primera factura y NO se repite.
      </p>
    </>
  );
}
