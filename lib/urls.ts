/** URL base del sitio (para enlaces en correos). Configurable con SITE_URL. */
export const SITE_URL = process.env.SITE_URL ?? "https://www.arcosfitness.com";

/** Enlace único de cancelación: el `code` (UUID) actúa como token de capacidad. */
export function reservationCancelUrl(code: string): string {
  return `${SITE_URL}/cancelar/${code}`;
}

/** Enlace para reagendar (mover) una reserva pagada. `code` (UUID) = token. */
export function reservationRescheduleUrl(code: string): string {
  return `${SITE_URL}/reagendar/${code}`;
}
