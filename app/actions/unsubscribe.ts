"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyUnsubscribe, unsubscribeSecret } from "@/lib/marketing/unsubscribe";
import { setMarketingOptOut } from "@/lib/db/marketing";

/**
 * Procesa la baja de marketing desde la página pública (POST de un formulario).
 * NO requiere admin: la "capacidad" es el token firmado. Solo MUTA en POST (la
 * página nunca da de baja en GET → los prefetchers de correo no pueden darte de
 * baja por error). Idempotente.
 */
export async function confirmUnsubscribeAction(formData: FormData) {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  const { rateLimited } = await checkRateLimit("unsubscribe", {
    ip,
    headers: Object.fromEntries(hdrs.entries()),
  });
  if (rateLimited) redirect("/baja?e=rate");

  const token = z.string().min(1).max(400).safeParse(formData.get("token"));
  const secret = unsubscribeSecret();
  if (!token.success || !secret) redirect("/baja?e=bad");

  const customerId = await verifyUnsubscribe(token.data, secret);
  if (!customerId) redirect("/baja?e=bad");

  await setMarketingOptOut(customerId);
  redirect(`/baja?token=${encodeURIComponent(token.data)}&done=1`);
}
