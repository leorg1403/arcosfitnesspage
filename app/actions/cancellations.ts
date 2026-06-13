"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { performCancellation } from "@/lib/cancellations";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";
import { AUDIT_AREAS, AUDIT_ACTIONS } from "@/lib/audit/types";

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

  // Pre-fetch para el log (la reserva aún existe antes de cancelar).
  const reservation = await prisma.reservation.findUnique({
    where: { code },
    select: { id: true, shortCode: true, customerName: true, customerEmail: true },
  });

  const result = await performCancellation({ code }, "customer");

  if (result.ok && reservation) {
    await writeAuditLog({
      actorKind: "customer",
      ip,
      action: AUDIT_ACTIONS.RESERVATION_CANCEL_CUSTOMER,
      area: AUDIT_AREAS.RESERVAS,
      entityKind: "Reservation",
      entityId: reservation.id,
      summary: `${reservation.customerName} (${reservation.customerEmail}) canceló su reserva #${reservation.shortCode}`,
      before: { status: "confirmed" },
      after: { status: "cancelled" },
    });
  }

  redirect(`/cancelar/${code}?done=1`);
}
