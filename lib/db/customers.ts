import "server-only";
import type { Prisma, PrismaClient, Customer } from "@prisma/client";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Upsert del Customer (CRM) por correo normalizado. Auto-crea o vincula, y
 * actualiza nombre/teléfono al último valor visto. No es un login.
 */
export async function upsertCustomer(
  tx: Prisma.TransactionClient | PrismaClient,
  input: { name: string; email: string; phone?: string | null }
): Promise<Customer> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const phone = input.phone?.trim() || null;
  return tx.customer.upsert({
    where: { email },
    create: { email, name, phone },
    update: { name, ...(phone ? { phone } : {}) },
  });
}
