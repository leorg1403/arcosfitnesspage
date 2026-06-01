import Link from "next/link";
import { listSubscriptions } from "@/lib/db/admin";
import { Table, Badge, PageHeader } from "@/components/recepcion/ui";

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Activas" },
  { key: "expired", label: "Vencidas" },
] as const;

export default async function SuscripcionesPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const sp = await searchParams;
  const filter = (sp.f === "active" || sp.f === "expired" ? sp.f : "all") as
    | "all"
    | "active"
    | "expired";
  const subs = await listSubscriptions(filter);

  const rows = subs.map((s) => [
    s.planName,
    <div key="c">
      <div className="text-paper">{s.customerName}</div>
      <div className="text-xs text-paper/40">{s.customerEmail}</div>
    </div>,
    <Badge
      key="s"
      tone={s.status === "active" || s.status === "trialing" ? "green" : s.status === "past_due" ? "amber" : "red"}
    >
      {s.status}
    </Badge>,
    s.currentPeriodEnd ? s.currentPeriodEnd.toISOString().slice(0, 10) : "—",
    s.createdAt.toISOString().slice(0, 10),
  ]);

  return (
    <>
      <PageHeader
        title="Membresías"
        subtitle="Suscripciones recurrentes sincronizadas desde Stripe."
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
        columns={["Plan", "Cliente", "Estado", "Vigente hasta", "Alta"]}
        rows={rows}
        empty="Sin membresías"
      />
    </>
  );
}
