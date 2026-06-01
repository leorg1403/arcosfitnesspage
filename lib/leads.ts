"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { recordLead } from "@/lib/db/leads";

/**
 * Server Action del formulario de contacto. Endpoint público hostil:
 *  - zod con .max() en cada campo (sin campos sin tope → anti-DoS).
 *  - honeypot (`website` debe llegar vacío).
 *  - rate-limit por IP.
 *  - dedupe silencioso en el DAL.
 *
 * SIEMPRE devuelve { ok: true } al usuario: nunca revelamos rate-limit, bot,
 * dedupe ni error de BD. Si quiere seguir mandando preguntas, que lo haga.
 */
const Schema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  email: z.string().email().max(120),
  message: z.string().min(10).max(2000),
  // honeypot anti-bot: invisible para humanos, debe quedar vacío.
  website: z.string().max(200).optional(),
});

export type SubmitLeadResult = { ok: true };

export async function submitLead(input: unknown): Promise<SubmitLeadResult> {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: true };
  const data = parsed.data;

  // Honeypot lleno → fingimos éxito (no le damos señal al bot).
  if (data.website && data.website.trim() !== "") return { ok: true };

  // Rate limit por IP (capa edge Vercel + respaldo en memoria).
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";
  const { rateLimited } = await checkRateLimit("lead", {
    ip,
    headers: Object.fromEntries(hdrs.entries()),
  });
  if (rateLimited) return { ok: true };

  try {
    await recordLead({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      message: data.message,
    });
  } catch (err) {
    // No rompemos la UX: el lead es best-effort. Logueamos para el dueño.
    console.error("[submitLead] error:", err);
  }

  return { ok: true };
}
