import type { MetadataRoute } from "next";

/**
 * Estrategia AI/SEO (verificada, mayo 2026):
 * - Permitir TODO por defecto (incluye Googlebot y bots de IA).
 * - Bots de búsqueda/recuperación de IA explícitamente permitidos: son los que
 *   meten al sitio en respuestas de ChatGPT, Claude y Perplexity. Se nombran
 *   aparte para documentar la intención y blindar su acceso si algún día se
 *   agrega un Disallow al grupo "*".
 * - NO bloqueamos bots de entrenamiento (GPTBot, ClaudeBot, Google-Extended):
 *   queremos máxima descubribilidad. Bloquearlos solo afecta entrenamiento de
 *   modelos, no la visibilidad en búsqueda/respuestas.
 */
const AI_SEARCH_BOTS = [
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT acciones del usuario
  "Claude-SearchBot", // Claude search
  "Claude-User", // Claude recuperación dirigida por usuario
  "PerplexityBot", // Perplexity
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // /recepcion es el panel privado: no debe listarse ni indexarse.
      { userAgent: "*", allow: "/", disallow: "/recepcion" },
      ...AI_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: "/recepcion" })),
    ],
    sitemap: "https://www.arcosfitness.com/sitemap.xml",
  };
}
