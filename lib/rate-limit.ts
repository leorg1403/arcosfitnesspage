/**
 * Rate limiting en dos capas.
 *
 * ── Capa 1 · Vercel Firewall (@vercel/firewall) ──────────────────────────────
 * Durable y a nivel edge: es el límite "real" en producción. REQUIERE crear la
 * regla en el dashboard, una por cada `ruleId` que usamos aquí:
 *
 *   Vercel → proyecto → Firewall → Configure → + New Rule
 *     · If:   condición  `@vercel/firewall`
 *     · Rate limit ID:    el MISMO string que pasamos en código
 *                         ("reservation", "checkout", "confirm")
 *     · Rate Limit / Then: ventana, límite y acción (Deny)
 *     · Review Changes → Publish
 *
 * Mientras la regla NO exista, la función devuelve `error: "not-found"` y caemos
 * a la Capa 2 (no rompe nada; simplemente aún no limita en el edge).
 * Nota de los docs: los contadores son POR REGIÓN.
 *
 * ── Capa 2 · Fallback en memoria ─────────────────────────────────────────────
 * SIEMPRE activo. Débil en serverless (se reinicia por instancia / cold-start),
 * pero cubre local/preview y actúa de respaldo si el firewall no está disponible.
 *
 * ── Detalle de seguridad (de leer los docs) ──────────────────────────────────
 * A la Capa 1 NO le pasamos una key derivada de `x-forwarded-for` (falsificable):
 * le pasamos `request`/`headers` y dejamos que Vercel detecte la IP confiable en
 * el edge. La key spoofeable solo se usa en la Capa 2 (respaldo best-effort).
 */

import { checkRateLimit as vercelRateLimit } from "@vercel/firewall";

/* ── Capa 2: ventana fija en memoria ─────────────────────────────────────── */

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();
const MAX_KEYS = 10_000; // cota de memoria

function prune(now: number) {
  if (store.size < MAX_KEYS) return;
  for (const [k, b] of store) {
    if (now >= b.resetAt) store.delete(k);
  }
}

function hit(key: string, limit: number, windowMs: number, now: number): boolean {
  const bucket = store.get(key);
  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true; // ok
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export type RateLimitRule = { limit: number; windowMs: number };

const DEFAULT_RULES: RateLimitRule[] = [
  { limit: 5, windowMs: 60_000 }, // ráfaga: 5 por minuto
  { limit: 30, windowMs: 60 * 60_000 }, // sostenido: 30 por hora
];

function memoryRateLimit(key: string, rules: RateLimitRule[]): { rateLimited: boolean } {
  const now = Date.now();
  prune(now);
  let limited = false;
  rules.forEach((rule, i) => {
    if (!hit(`${key}:${i}`, rule.limit, rule.windowMs, now)) limited = true;
  });
  return { rateLimited: limited };
}

/* ── API pública ─────────────────────────────────────────────────────────── */

type CheckOpts = {
  /** IP best-effort para el respaldo en memoria (de `x-forwarded-for`). */
  ip: string;
  /** Request del Route Handler — se lo damos a Vercel para detectar la IP real. */
  request?: Request;
  /** Headers (p. ej. en una Server Action) — alternativa a `request`. */
  headers?: Headers | Record<string, string>;
  /** Override de las ventanas del respaldo en memoria. */
  rules?: RateLimitRule[];
};

/**
 * Comprueba el rate limit `ruleId` aplicando Vercel Firewall (edge, durable) y,
 * como respaldo, una ventana en memoria. Devuelve `rateLimited: true` si
 * cualquiera de las dos capas lo bloquea.
 */
export async function checkRateLimit(
  ruleId: string,
  opts: CheckOpts
): Promise<{ rateLimited: boolean }> {
  // Capa 1 — Vercel Firewall. Dejamos que detecte la IP confiable en el edge.
  try {
    const v = await vercelRateLimit(ruleId, {
      ...(opts.request ? { request: opts.request } : {}),
      ...(opts.headers ? { headers: opts.headers } : {}),
    });
    if (v.rateLimited || v.error === "blocked") return { rateLimited: true };
    // v.error === "not-found" (regla aún no publicada) → seguimos al respaldo.
  } catch {
    // Sin contexto de Vercel (local/dev) o error transitorio → respaldo.
  }

  // Capa 2 — backstop en memoria (siempre).
  return memoryRateLimit(`${ruleId}:${opts.ip}`, opts.rules ?? DEFAULT_RULES);
}
