import Link from "next/link";
import { getDashboardStats } from "@/lib/db/admin";
import { PageHeader, StatCard, Card, fmtMoney } from "@/components/recepcion/ui";

export default async function DashboardPage() {
  const s = await getDashboardStats();
  return (
    <>
      <PageHeader title="Panel de recepción" subtitle="Resumen del club en tiempo real." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Reservas próximas" value={s.upcoming} />
        <StatCard label="No-shows (este mes)" value={s.noShowMonth} />
        <StatCard label="Ingresos (este mes)" value={fmtMoney(s.revenueMonthCents)} />
        <StatCard
          label="Clientes"
          value={s.totalCustomers}
          hint={`${s.activeSubs} membresía(s) activa(s)`}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[
          { href: "/recepcion/reservas", label: "Reservas por fecha", desc: "Asistencias y códigos." },
          { href: "/recepcion/clientes", label: "Clientes", desc: "No-shows y bloqueos." },
          { href: "/recepcion/clases", label: "Clases", desc: "Editar catálogo y cadencia." },
          { href: "/recepcion/pagos", label: "Pagos", desc: "Cobros de Stripe." },
          { href: "/recepcion/suscripciones", label: "Membresías", desc: "Activas y vencidas." },
          { href: "/recepcion/leads", label: "Leads", desc: "Dudas recibidas." },
        ].map((c) => (
          <Link key={c.href} href={c.href}>
            <Card className="hover:border-gold/50 transition-colors h-full">
              <p className="font-display text-lg font-semibold text-paper">{c.label}</p>
              <p className="mt-1 text-sm text-paper/50">{c.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
