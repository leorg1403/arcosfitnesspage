"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { performCancellation } from "@/lib/cancellations";

/**
 * Cancelación por el CLIENTE desde su enlace único (/cancelar/[code]). El `code`
 * (UUID) es el token de capacidad: quien lo tiene puede cancelar SOLO esa reserva.
 * Server Action → trae el check Origin/CSRF. Rate-limit por IP.
 */
export async function cancelByCustomer(formData: FormData): Promise<void> {
  const parsed = z.string().min(8).max(64).safeParse(formData.get("code"));
  if (!parsed.success) redirect("/clases-reservas");
  const code = parsed.data;

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  const { rateLimited } = await checkRateLimit("cancel", {
    ip,
    headers: Object.fromEntries(hdrs.entries()),
  });
  if (rateLimited) redirect(`/cancelar/${code}?e=rate`);

  await performCancellation({ code }, "customer"); // cancela + manda los dos correos
  redirect(`/cancelar/${code}?done=1`);
}
