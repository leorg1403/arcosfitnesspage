import "server-only";
import { prisma } from "./client";
import { cdmxTodayISO } from "@/lib/booking/window";

// Agregaciones de analytics con Prisma normal (sin SQL crudo). "Visitantes" =
// distintos visitorHash; como el hash rota a diario, equivale a únicos-por-día
// sumados en el rango (metodología cookieless). El volumen es chico (ventana ≤90
// días, sitio de un gym) → traemos las filas y agregamos en memoria con Sets.

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

/** Suma un visitante al bucket `key`, contando únicos vía Set. */
function bump(map: Map<string, Set<string>>, key: string, visitor: string) {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(visitor);
}

/** Convierte el mapa a top-N por visitantes únicos. */
function toTop(map: Map<string, Set<string>>, limit = 12): TopRow[] {
  return [...map.entries()]
    .map(([label, set]) => ({ label, visitors: set.size }))
    .sort((a, b) => b.visitors - a.visitors || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export async function getAnalytics(days = 7): Promise<AnalyticsData> {
  const todayISO = cdmxTodayISO();
  const fromISO = shiftISO(todayISO, -(days - 1));
  const fromDate = new Date(`${fromISO}T00:00:00Z`);

  // El panel /recepcion (admin) NO cuenta: son visitas internas del staff.
  const rows = await prisma.pageView.findMany({
    where: { day: { gte: fromDate }, NOT: { path: { startsWith: "/recepcion" } } },
    select: {
      day: true,
      path: true,
      route: true,
      host: true,
      referrerHost: true,
      utmSource: true,
      visitorHash: true,
    },
  });

  const allVisitors = new Set<string>();
  const byDay = new Map<string, Set<string>>();
  const pages = new Map<string, Set<string>>();
  const routes = new Map<string, Set<string>>();
  const hosts = new Map<string, Set<string>>();
  const referrers = new Map<string, Set<string>>();
  const utms = new Map<string, Set<string>>();

  for (const r of rows) {
    allVisitors.add(r.visitorHash);
    bump(byDay, r.day.toISOString().slice(0, 10), r.visitorHash);
    bump(pages, r.path, r.visitorHash);
    bump(routes, r.route, r.visitorHash);
    bump(hosts, r.host, r.visitorHash);
    if (r.referrerHost) bump(referrers, r.referrerHost, r.visitorHash);
    if (r.utmSource) bump(utms, r.utmSource, r.visitorHash);
  }

  // Serie continua: rellena días sin datos con 0 para una gráfica sin huecos.
  const series: SeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const iso = shiftISO(fromISO, i);
    series.push({ day: iso, visitors: byDay.get(iso)?.size ?? 0 });
  }

  return {
    days,
    totals: { visitors: allVisitors.size, views: rows.length },
    series,
    pages: toTop(pages),
    routes: toTop(routes),
    hosts: toTop(hosts),
    referrers: toTop(referrers),
    utms: toTop(utms),
  };
}

/** Borra TODAS las visitas registradas (botón "Borrar analíticas" del admin). */
export async function clearPageViews(): Promise<number> {
  const { count } = await prisma.pageView.deleteMany({});
  return count;
}
