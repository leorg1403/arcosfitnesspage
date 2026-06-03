import "server-only";
import { createHash } from "node:crypto";

// Helpers de ingesta de analytics. SIN PII: el identificador de visitante es un
// hash que incluye el DÍA (rota a diario) → cuenta únicos por día sin reidentificar.

const SALT = process.env.ANALYTICS_SALT || process.env.ADMIN_SESSION_SECRET || "arcos-analytics";

const BOT_RE =
  /bot|crawl|spider|slurp|bing|baidu|yandex|duckduck|facebookexternalhit|embedly|quora|pinterest|preview|headless|lighthouse|monitor|curl|wget|python-requests|axios|node-fetch|go-http/i;

export function isBot(ua: string | null | undefined): boolean {
  if (!ua) return true; // sin UA = casi siempre bot/script
  return BOT_RE.test(ua);
}

/** Hash cookieless con rotación diaria: hash(día + ip + ua + salt). No es PII. */
export function computeVisitorHash(dayISO: string, ip: string, ua: string): string {
  return createHash("sha256").update(`${dayISO}|${ip}|${ua}|${SALT}`).digest("hex").slice(0, 32);
}

/**
 * Host del referrer EXTERNO. Devuelve null si: no hay referrer, no parsea, o es
 * el mismo host (navegación interna → cuenta como "directo").
 */
export function extractReferrerHost(referrer: string | null | undefined, selfHost: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    const self = selfHost.replace(/^www\./, "").split(":")[0];
    if (!host || host === self) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

/** Normaliza segmentos dinámicos (cuid/uuid/numérico/largos) → ":id". */
export function normalizeRoute(path: string): string {
  const norm = path
    .split("/")
    .map((seg) => {
      if (!seg) return seg;
      if (/^\d+$/.test(seg)) return ":id";
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/i.test(seg)) return ":id"; // uuid
      if (/^c[a-z0-9]{20,}$/i.test(seg)) return ":id"; // cuid
      if (seg.length >= 20) return ":id";
      return seg;
    })
    .join("/");
  return norm || "/";
}
