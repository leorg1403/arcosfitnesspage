import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { cdmxTodayISO } from "@/lib/booking/window";
import { isBot, computeVisitorHash, extractReferrerHost, normalizeRoute } from "@/lib/analytics/ingest";

export const runtime = "nodejs";

// Endpoint PÚBLICO de analytics. Hostil por defecto: zod + .max() en todo,
// rate-limit por IP (ventanas amplias porque un usuario navega varias páginas),
// filtro de bots, y SIN PII (visitorHash cookieless con rotación diaria). Solo
// inserta una fila; nunca devuelve datos.
const Schema = z.object({
  path: z.string().min(1).max(256).regex(/^\//, "path debe iniciar con /"),
  host: z.string().max(128).optional().default(""),
  referrer: z.string().max(512).optional().default(""),
  utmSource: z.string().max(128).optional().default(""),
  utmMedium: z.string().max(128).optional().default(""),
  utmCampaign: z.string().max(128).optional().default(""),
});

function isoToDbDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const ua = req.headers.get("user-agent");
    if (isBot(ua)) return new NextResponse(null, { status: 204 }); // no contamos bots

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const { rateLimited } = await checkRateLimit("track", {
      ip,
      request: req,
      // navegación normal: generoso, pero acota abuso/relleno de BD.
      rules: [
        { limit: 40, windowMs: 60_000 },
        { limit: 600, windowMs: 60 * 60_000 },
      ],
    });
    if (rateLimited) return new NextResponse(null, { status: 429 });

    const raw = await req.text();
    if (raw.length > 4000) return new NextResponse(null, { status: 413 });
    const parsed = Schema.safeParse(JSON.parse(raw));
    if (!parsed.success) return new NextResponse(null, { status: 400 });
    const d = parsed.data;

    // El panel de recepción (admin) NO se trackea — son visitas internas del staff.
    if (d.path === "/recepcion" || d.path.startsWith("/recepcion/")) {
      return new NextResponse(null, { status: 204 });
    }

    const host = (d.host || req.headers.get("host") || "").replace(/^https?:\/\//, "").slice(0, 120);
    const dayISO = cdmxTodayISO();

    await prisma.pageView.create({
      data: {
        day: isoToDbDate(dayISO),
        path: d.path,
        route: normalizeRoute(d.path),
        host: host || "desconocido",
        referrerHost: extractReferrerHost(d.referrer, host),
        utmSource: d.utmSource || null,
        utmMedium: d.utmMedium || null,
        utmCampaign: d.utmCampaign || null,
        visitorHash: computeVisitorHash(dayISO, ip, ua ?? ""),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    // Nunca rompemos la navegación del cliente por un fallo de tracking.
    return new NextResponse(null, { status: 204 });
  }
}
