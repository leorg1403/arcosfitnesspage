import "server-only";
import { prisma } from "./client";
import { cdmxTodayISO } from "@/lib/booking/window";

// Agregaciones de analytics. "Visitantes" = COUNT(DISTINCT visitorHash); como el
// hash rota a diario, equivale a únicos-por-día sumados en el rango (misma
// metodología cookieless que usan herramientas privacy-first). Todo vía SQL crudo
// porque Prisma groupBy no soporta COUNT(DISTINCT). Los nombres de columna son
// literales fijos (no input) — sin riesgo de inyección.

export type TopRow = { label: string; visitors: number };
export type SeriesPoint = { day: string; visitors: number };
export type AnalyticsData = {
  days: number;
  totals: { visitors: number; views: number };
  series: SeriesPoint[];
  pages: TopRow[];
  routes: TopRow[];
  hosts: TopRow[];
  referrers: TopRow[];
  utms: TopRow[];
};

function shiftISO(iso: string, deltaDays: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export async function getAnalytics(days = 7): Promise<AnalyticsData> {
  const todayISO = cdmxTodayISO();
  const fromISO = shiftISO(todayISO, -(days - 1));

  const [seriesRows, totalsRows, pages, routes, hosts, referrers, utms] = await Promise.all([
    prisma.$queryRaw<{ day: Date; visitors: number }[]>`
      SELECT day, COUNT(DISTINCT "visitorHash")::int AS visitors
      FROM "app"."PageView" WHERE day >= ${fromISO}::date
      GROUP BY day ORDER BY day ASC`,
    prisma.$queryRaw<{ visitors: number; views: number }[]>`
      SELECT COUNT(DISTINCT "visitorHash")::int AS visitors, COUNT(*)::int AS views
      FROM "app"."PageView" WHERE day >= ${fromISO}::date`,
    prisma.$queryRaw<TopRow[]>`
      SELECT path AS label, COUNT(DISTINCT "visitorHash")::int AS visitors
      FROM "app"."PageView" WHERE day >= ${fromISO}::date
      GROUP BY path ORDER BY visitors DESC, label ASC LIMIT 12`,
    prisma.$queryRaw<TopRow[]>`
      SELECT route AS label, COUNT(DISTINCT "visitorHash")::int AS visitors
      FROM "app"."PageView" WHERE day >= ${fromISO}::date
      GROUP BY route ORDER BY visitors DESC, label ASC LIMIT 12`,
    prisma.$queryRaw<TopRow[]>`
      SELECT host AS label, COUNT(DISTINCT "visitorHash")::int AS visitors
      FROM "app"."PageView" WHERE day >= ${fromISO}::date
      GROUP BY host ORDER BY visitors DESC, label ASC LIMIT 12`,
    prisma.$queryRaw<TopRow[]>`
      SELECT "referrerHost" AS label, COUNT(DISTINCT "visitorHash")::int AS visitors
      FROM "app"."PageView" WHERE day >= ${fromISO}::date AND "referrerHost" IS NOT NULL
      GROUP BY "referrerHost" ORDER BY visitors DESC, label ASC LIMIT 12`,
    prisma.$queryRaw<TopRow[]>`
      SELECT "utmSource" AS label, COUNT(DISTINCT "visitorHash")::int AS visitors
      FROM "app"."PageView" WHERE day >= ${fromISO}::date AND "utmSource" IS NOT NULL
      GROUP BY "utmSource" ORDER BY visitors DESC, label ASC LIMIT 12`,
  ]);

  // Serie continua: rellena días sin datos con 0 para una gráfica sin huecos.
  const byDay = new Map<string, number>();
  for (const r of seriesRows) byDay.set(r.day.toISOString().slice(0, 10), r.visitors);
  const series: SeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const iso = shiftISO(fromISO, i);
    series.push({ day: iso, visitors: byDay.get(iso) ?? 0 });
  }

  return {
    days,
    totals: totalsRows[0] ?? { visitors: 0, views: 0 },
    series,
    pages,
    routes,
    hosts,
    referrers,
    utms,
  };
}

/** Borra TODAS las visitas registradas (botón "Borrar analíticas" del admin). */
export async function clearPageViews(): Promise<number> {
  const { count } = await prisma.pageView.deleteMany({});
  return count;
}
