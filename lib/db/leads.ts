import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "./client";

export type RecordLeadInput = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

/**
 * Persiste un lead con DEDUPE SILENCIOSO: si llega el mismo correo + mismo
 * mensaje, no se crea otra fila, solo se incrementa `resubmitCount`. Mensajes
 * distintos del mismo correo sí son leads nuevos. Quien llama nunca sabe si
 * hubo dedupe (la UI siempre muestra éxito).
 *
 * Devuelve `created` para que el caller notifique al dueño SOLO en leads
 * nuevos (los reenvíos dedupeados no re-notifican → no se puede inundar el
 * buzón del owner reenviando el mismo mensaje).
 */
export async function recordLead(input: RecordLeadInput): Promise<{ created: boolean }> {
  const emailLower = input.email.trim().toLowerCase();
  const normalizedMessage = input.message.trim().replace(/\s+/g, " ").toLowerCase();
  const dedupeHash = createHash("sha256")
    .update(`${emailLower}|${normalizedMessage}`)
    .digest("hex");

  const existing = await prisma.lead.findUnique({ where: { dedupeHash }, select: { id: true } });

  await prisma.lead.upsert({
    where: { dedupeHash },
    create: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: emailLower,
      message: input.message.trim(),
      dedupeHash,
    },
    update: {
      resubmitCount: { increment: 1 },
      lastSubmittedAt: new Date(),
    },
  });

  return { created: !existing };
}
