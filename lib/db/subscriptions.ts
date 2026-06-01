import "server-only";
import type { SubscriptionStatus } from "@prisma/client";
import { prisma } from "./client";
import { upsertCustomer } from "./customers";

/** Mapea el status de Stripe a nuestro enum. */
export function mapStripeSubStatus(s: string): SubscriptionStatus {
  switch (s) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "trialing":
      return "trialing";
    case "unpaid":
      return "unpaid";
    default:
      // incomplete | incomplete_expired | paused | desconocido
      return "incomplete";
  }
}

export type UpsertSubscriptionInput = {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  planId: string;
  planName: string;
  status: string; // status crudo de Stripe
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  currentPeriodEndUnix?: number | null;
};

/** Crea/actualiza la suscripción y la liga al Customer (CRM). */
export async function upsertSubscription(input: UpsertSubscriptionInput): Promise<void> {
  const status = mapStripeSubStatus(input.status);
  const currentPeriodEnd = input.currentPeriodEndUnix
    ? new Date(input.currentPeriodEndUnix * 1000)
    : null;
  const customer = await upsertCustomer(prisma, {
    name: input.customerName,
    email: input.customerEmail,
    phone: input.customerPhone,
  });

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: input.stripeSubscriptionId },
    create: {
      stripeSubscriptionId: input.stripeSubscriptionId,
      stripeCustomerId: input.stripeCustomerId,
      planId: input.planId,
      planName: input.planName,
      status,
      customerName: input.customerName,
      customerEmail: input.customerEmail.trim().toLowerCase(),
      customerPhone: input.customerPhone ?? null,
      currentPeriodEnd,
      customerId: customer.id,
    },
    update: {
      status,
      planName: input.planName,
      ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      customerId: customer.id,
    },
  });
}

/** Actualiza solo el estado/vigencia (eventos customer.subscription.updated/deleted). */
export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: string,
  currentPeriodEndUnix?: number | null
): Promise<void> {
  const data: { status: SubscriptionStatus; currentPeriodEnd?: Date } = {
    status: mapStripeSubStatus(status),
  };
  if (currentPeriodEndUnix) data.currentPeriodEnd = new Date(currentPeriodEndUnix * 1000);
  await prisma.subscription.updateMany({ where: { stripeSubscriptionId }, data });
}
