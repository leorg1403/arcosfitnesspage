// Definición de audiencia para campañas de marketing. ISOMÓRFICO (sin deps de
// servidor): lo usan el composer del admin (cliente), las Server Actions y el DAL.
//
// Una audiencia se describe con FILTROS, no con una lista congelada de correos:
// al enviar (o al contar) el servidor los resuelve contra el CRM vigente. Reglas
// SIEMPRE aplicadas por el servidor, no configurables: se excluyen clientes
// `blocked`, los que se dieron de baja (marketingOptOutAt) y correos inválidos.

import { z } from "zod";
import { FITNESS_APP_VALUES } from "@/lib/fitness-apps";

// ── Esquema validado (la fuente de verdad de la forma de los filtros) ──────────
export const AudienceFiltersSchema = z.object({
  // socio = membresía manual activa O suscripción Stripe activa.
  membership: z.enum(["any", "socio", "no_socio"]).default("any"),
  // filtra por nombre de plan vigente (substring, case-insensitive). "" = sin filtro.
  planContains: z.string().trim().max(80).default(""),
  // origen por app de fitness (a partir de las reservas del cliente).
  //   any      = sin filtro
  //   any_app  = vino por CUALQUIER app alguna vez
  //   none     = nunca vino por app
  //   <app>    = vino por esa app en específico
  fitnessApp: z.enum(["any", "any_app", "none", ...FITNESS_APP_VALUES]).default("any"),
  // actividad de reservas.
  activity: z
    .enum(["any", "with_reservations", "no_reservations", "had_no_show"])
    .default("any"),
});

export type AudienceFilters = z.infer<typeof AudienceFiltersSchema>;

export const DEFAULT_FILTERS: AudienceFilters = {
  membership: "any",
  planContains: "",
  fitnessApp: "any",
  activity: "any",
};

/** Parseo tolerante (p. ej. desde el JSON guardado de un EmailList). */
export function parseFilters(value: unknown): AudienceFilters {
  const r = AudienceFiltersSchema.safeParse(value ?? {});
  return r.success ? r.data : DEFAULT_FILTERS;
}

// ── Etiquetas para la UI ───────────────────────────────────────────────────────
export const MEMBERSHIP_OPTIONS = [
  { value: "any", label: "Todos" },
  { value: "socio", label: "Solo socios" },
  { value: "no_socio", label: "Solo no socios" },
] as const;

export const FITNESS_APP_FILTER_OPTIONS = [
  { value: "any", label: "Indistinto" },
  { value: "any_app", label: "Vino por alguna app" },
  { value: "none", label: "Nunca por app" },
  { value: "totalpass", label: "TotalPass" },
  { value: "fitpass", label: "Fitpass" },
  { value: "wellhub", label: "Wellhub" },
] as const;

export const ACTIVITY_OPTIONS = [
  { value: "any", label: "Indistinto" },
  { value: "with_reservations", label: "Con reservas" },
  { value: "no_reservations", label: "Sin reservas" },
  { value: "had_no_show", label: "Con no-shows" },
] as const;

/** Resumen legible de una audiencia, para mostrar en chips/historial. */
export function describeFilters(f: AudienceFilters): string {
  const parts: string[] = [];
  const mem = MEMBERSHIP_OPTIONS.find((o) => o.value === f.membership);
  if (f.membership !== "any" && mem) parts.push(mem.label);
  if (f.planContains) parts.push(`Plan «${f.planContains}»`);
  const app = FITNESS_APP_FILTER_OPTIONS.find((o) => o.value === f.fitnessApp);
  if (f.fitnessApp !== "any" && app) parts.push(app.label);
  const act = ACTIVITY_OPTIONS.find((o) => o.value === f.activity);
  if (f.activity !== "any" && act) parts.push(act.label);
  return parts.length ? parts.join(" · ") : "Todos los contactos";
}
