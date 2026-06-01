import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "./client";

/**
 * Idempotencia de webhooks: intenta registrar el event.id. Devuelve true si es
 * NUEVO (hay que procesarlo) y false si ya se procesó (Stripe reintenta y manda
 * tanto `completed` como `async_payment_succeeded` para el mismo pago).
 */
export async function claimWebhookEvent(id: string, type: string): Promise<boolean> {
  try {
    await prisma.webhookEvent.create({ data: { id, type } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return false;
    throw e;
  }
}
