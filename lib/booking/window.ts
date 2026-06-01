/**
 * Lógica de ventana de reserva — "solo la próxima ocurrencia".
 *
 * TODO en hora CIVIL de Ciudad de México (America/Mexico_City). CDMX es UTC-6
 * PERMANENTE (sin horario de verano desde 2022) → podemos tratar el offset como
 * fijo `-06:00` y NO hay transiciones DST que manejar. NUNCA derivamos fechas del
 * reloj UTC del servidor (Vercel corre en UTC): eso rompería la fecha civil cerca
 * de medianoche.
 *
 * Módulo PURO (sin BD): solo aritmética de fechas. Se usa en el servidor.
 */
import type { DayKey } from "@/lib/classes";

export const CDMX_TZ = "America/Mexico_City";
export const CDMX_OFFSET = "-06:00";

/** Minutos antes del inicio en que se cierra la reserva (0 = hasta la hora de inicio). */
export const LEAD_MINUTES = 0;
/** Tope duro de búsqueda hacia adelante (seguridad; la regla real es "próxima ocurrencia"). */
export const BOOKING_WINDOW_DAYS = 21;

/** lun..dom (catálogo) ↔ weekday Postgres-style 0=Dom..6=Sáb */
export const DAY_TO_WEEKDAY: Record<DayKey, number> = {
  dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6,
};
export const WEEKDAY_TO_DAY: DayKey[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

/** Fecha civil CDMX de `now` como "YYYY-MM-DD". */
export function cdmxTodayISO(now: Date = new Date()): string {
  // en-CA produce el formato ISO "YYYY-MM-DD".
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CDMX_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Día de la semana (0=Dom..6=Sáb) de una fecha civil "YYYY-MM-DD". */
export function weekdayOfISO(iso: string): number {
  // La medianoche UTC de la fecha civil tiene el mismo weekday que la fecha.
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

/** Suma `n` días a una fecha civil "YYYY-MM-DD" (aritmética en UTC-midnight, sin DST). */
export function addDaysISO(iso: string, n: number): string {
  const t = new Date(`${iso}T00:00:00Z`).getTime() + n * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** Semanas completas entre dos fechas civiles del mismo weekday. */
function weeksBetween(anchorISO: string, iso: string): number {
  const days =
    (new Date(`${iso}T00:00:00Z`).getTime() -
      new Date(`${anchorISO}T00:00:00Z`).getTime()) /
    86_400_000;
  return Math.round(days / 7);
}

/** Instante UTC del inicio de una clase en su fecha civil CDMX. */
export function startInstant(dateISO: string, startTime: string): number {
  return new Date(`${dateISO}T${startTime}:00${CDMX_OFFSET}`).getTime();
}

/** ¿La ocurrencia (fecha+hora) sigue siendo reservable respecto a `now`? */
export function isBookable(dateISO: string, startTime: string, now: Date = new Date()): boolean {
  return startInstant(dateISO, startTime) > now.getTime() + LEAD_MINUTES * 60_000;
}

export type OccurrenceTemplate = {
  kind: "weekly" | "oneoff";
  weekday: number | null;
  intervalWeeks: number;
  anchorDate: Date | null; // @db.Date
  eventDate: Date | null; // @db.Date
  startTime: string;
  durationMin: number;
  /** false (Open Gym / daypass) => reservable hasta que CIERRA (inicio+duración),
   *  no hasta que abre. true (clase con cupo) => reservable hasta el inicio. */
  tracksSpots: boolean;
};

function toISODate(d: Date): string {
  // @db.Date llega como Date a medianoche UTC → tomamos la parte de fecha.
  return d.toISOString().slice(0, 10);
}

/**
 * ¿La ocurrencia sigue reservable respecto a `now`?
 *  - Con cupo (clase): hasta su HORA DE INICIO (− LEAD_MINUTES).
 *  - Sin cupo (Open Gym / daypass): hasta que TERMINA su ventana (inicio+duración).
 */
function isOccurrenceBookable(dateISO: string, t: OccurrenceTemplate, now: Date): boolean {
  const start = startInstant(dateISO, t.startTime);
  const cutoff = t.tracksSpots ? start : start + t.durationMin * 60_000;
  return cutoff > now.getTime() + LEAD_MINUTES * 60_000;
}

/**
 * Próxima ocurrencia RESERVABLE de una plantilla, como "YYYY-MM-DD" o null.
 *  - weekly: menor fecha ≥ hoy con el weekday correcto, en semana activa
 *    (intervalWeeks) y cuya hora de inicio aún no pasó (corte LEAD_MINUTES).
 *  - oneoff: su eventDate, solo si su inicio aún es futuro.
 */
export function nextOccurrenceISO(
  t: OccurrenceTemplate,
  now: Date = new Date()
): string | null {
  if (t.kind === "oneoff") {
    if (!t.eventDate) return null;
    const iso = toISODate(t.eventDate);
    return isOccurrenceBookable(iso, t, now) ? iso : null;
  }

  if (t.weekday == null) return null;
  const today = cdmxTodayISO(now);
  const interval = t.intervalWeeks > 0 ? t.intervalWeeks : 1;
  const anchor = t.anchorDate ? toISODate(t.anchorDate) : null;

  for (let i = 0; i <= BOOKING_WINDOW_DAYS; i++) {
    const d = addDaysISO(today, i);
    if (weekdayOfISO(d) !== t.weekday) continue;
    if (interval > 1 && anchor && weeksBetween(anchor, d) % interval !== 0) continue;
    if (!isOccurrenceBookable(d, t, now)) continue;
    return d;
  }
  return null;
}

/** Etiqueta compacta de fecha: "lun 8 jun". */
export function formatDateLabel(dateISO: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: CDMX_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  })
    .format(new Date(`${dateISO}T12:00:00${CDMX_OFFSET}`))
    .replace(/\./g, "");
}
