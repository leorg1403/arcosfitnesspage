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
 */
export async function recordLead(input: RecordLeadInput): Promise<void> {
  const emailLower = input.email.trim().toLowerCase();
  const normalizedMessage = input.message.trim().replace(/\s+/g, " ").toLowerCase();
  const dedupeHash = createHash("sha256")
    .update(`${emailLower}|${normalizedMessage}`)
    .digest("hex");

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
}
