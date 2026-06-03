import Link from "next/link";
import { getAnalytics } from "@/lib/db/analytics";
import { PageHeader, StatCard } from "@/components/recepcion/ui";
import { AnalyticsChart } from "@/components/recepcion/AnalyticsChart";
import { AnalyticsPanels } from "@/components/recepcion/AnalyticsPanels";
import { ClearAnalyticsButton } from "@/components/recepcion/ClearAnalyticsButton";

const RANGES = [
  { days: 7, label: "7 días" },
  { days: 30, label: "30 días" },
  { days: 90, label: "90 días" },
] as const;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const days = RANGES.some((r) => String(r.days) === sp.range) ? Number(sp.range) : 7;
  const data = await getAnalytics(days);
  const topReferrer = data.referrers[0]?.label ?? "—";

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Visitas, páginas y referrers de tu sitio. Datos propios, sin cookies."
        action={<ClearAnalyticsButton />}
      />

      {/* Rango */}
      <div className="mb-6 flex flex-wrap gap-1">
        {RANGES.map((r) => (
          <Link
            key={r.days}
            href={`/recepcion/analytics?range=${r.days}`}
            className={
              "px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] border transition-colors " +
              (r.days === days
                ? "border-gold/50 text-gold bg-gold/[0.08]"
                : "border-paper/10 text-paper/50 hover:text-paper")
            }
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Visitantes" value={data.totals.visitors} hint={`Últimos ${days} días`} />
        <StatCard label="Vistas de página" value={data.totals.views} hint={`Últimos ${days} días`} />
        <StatCard label="Top referrer" value={topReferrer} hint="Mayor tráfico externo" />
      </div>

      {/* Gráfica */}
      <div className="mb-8 border border-gold/20 bg-paper/[0.02] p-4">
        <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80">
          Visitantes por día
        </p>
        <AnalyticsChart series={data.series} />
      </div>

      {/* Páginas / Referrers */}
      <AnalyticsPanels
        pages={data.pages}
        routes={data.routes}
        hosts={data.hosts}
        referrers={data.referrers}
        utms={data.utms}
      />

      <p className="mt-8 text-[0.65rem] leading-relaxed text-paper/35">
        Métrica cookieless y sin datos personales: cada visitante se cuenta con un identificador
        que rota a diario. No se trackea en localhost. Complementa (no reemplaza) Vercel Analytics.
      </p>
    </>
  );
}
