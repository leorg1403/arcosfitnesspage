import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeIsConfigured } from "@/lib/stripe";
import { sendEmail, OWNER_EMAILS } from "@/lib/email";
import { OwnerPurchaseEmail } from "@/lib/email/owner-purchase";
import { ClientPurchaseEmail } from "@/lib/email/client-purchase";
import { OwnerReservationEmail } from "@/lib/email/owner-reservation";
import { ClientReservationEmail } from "@/lib/email/client-reservation";
import { OwnerAlertEmail } from "@/lib/email/owner-alert";
import { claimWebhookEvent } from "@/lib/db/webhooks";
import {
  finalizeCheckout,
  releaseHoldByStripeSession,
  markPaymentByIntent,
  recordTypedPayment,
} from "@/lib/db/payments";
import {
  upsertSubscription,
  updateSubscriptionStatus,
  getSubscriptionByStripeId,
} from "@/lib/db/subscriptions";
import { PLANS } from "@/lib/memberships";
import { reservationRescheduleUrl } from "@/lib/urls";

export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const webhookConfigured = Boolean(webhookSecret && !webhookSecret.includes("PLACEHOLDER"));

function strId(v: string | { id: string } | null | undefined): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

/**
 * Webhook de Stripe — ÚNICA fuente de efectos secundarios (persistencia + correos).
 * Verifica firma → de-duplica por event.id (WebhookEvent) → finaliza el pago.
 */
export async function POST(req: NextRequest) {
  if (!stripeIsConfigured || !stripe) {
    return NextResponse.json({ ok: false, error: "Stripe no configurado" }, { status: 503 });
  }
  if (!webhookConfigured) {
    return NextResponse.json({ ok: false, error: "Webhook secret no configurado" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, error: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret as string);
  } catch (err) {
    console.error("[webhook] signature error:", err);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  // Idempotencia: solo procesamos un event.id una vez (Stripe reintenta).
  const isNew = await claimWebhookEvent(event.id, event.type);
  if (!isNew) return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await releaseHoldByStripeSession(session.id);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await updateSubscriptionStatus(
          sub.id,
          sub.status,
          (sub as unknown as { current_period_end?: number }).current_period_end ?? null
        );
        break;
      }
      case "invoice.payment_succeeded": {
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      }
      case "invoice.payment_failed": {
        await handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const pi = strId(dispute.payment_intent);
        if (pi) {
          const p = await markPaymentByIntent(pi, "disputed");
          if (p) await sendOwnerAlert("Contracargo recibido", p, dispute.reason);
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi = strId(charge.payment_intent);
        if (pi) {
          const p = await markPaymentByIntent(pi, "refunded");
          if (p) await sendOwnerAlert("Reembolso aplicado", p);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`[webhook] error handling ${event.type}:`, err);
    // Devolver 500 hace que Stripe reintente; como ya marcamos el evento como
    // procesado, el reintento será no-op. Mejor responder 200 y loguear.
  }

  return NextResponse.json({ received: true });
}

async function sendOwnerAlert(
  title: string,
  p: { itemName: string; customerName: string; customerEmail: string; amountTotalCents: number; currency: string },
  detail?: string
) {
  const amount = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: p.currency.toUpperCase(),
  }).format(p.amountTotalCents / 100);
  const body = `${p.customerName} (${p.customerEmail}) · ${p.itemName} · ${amount}${
    detail ? ` · motivo: ${detail}` : ""
  }. Revísalo en Stripe y en /recepcion/pagos.`;
  await sendEmail({
    to: OWNER_EMAILS,
    subject: `${title} · ${p.itemName} · ${p.customerName}`,
    react: OwnerAlertEmail({ title, body }),
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const m = session.metadata ?? {};
  const itemKind = (m.itemKind ?? "plan") as "plan" | "prepayment" | "class";
  const itemId = m.itemId ?? "";
  const itemName = m.itemName ?? "Membresía Arcos";
  const customerEmail = session.customer_email || session.customer_details?.email || m.customerEmail;
  const customerName = m.customerName || session.customer_details?.name || "Cliente";
  const customerPhone = m.customerPhone || session.customer_details?.phone || undefined;
  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency ?? "mxn";
  const subscriptionId = strId(session.subscription);
  const paymentIntentId = strId(session.payment_intent);

  if (!customerEmail) {
    console.warn("[webhook] sin email de cliente, no se finaliza");
    return;
  }

  // ── Membresía mensual (suscripción) ───────────────────────────────────────
  // Crea/actualiza la suscripción con el monto recurrente REAL (solo la
  // mensualidad) + welcome. Los pagos (inscripción + mensualidad + renovaciones)
  // los registran las facturas en invoice.payment_succeeded.
  if (session.mode === "subscription" && subscriptionId) {
    let recurringAmountCents: number | null = null;
    let recurringInterval: string | null = null;
    let currentPeriodEndUnix: number | null = null;
    if (stripe) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const item = sub.items?.data?.[0];
        const price = item?.price;
        recurringAmountCents = typeof price?.unit_amount === "number" ? price.unit_amount : null;
        recurringInterval = price?.recurring?.interval ?? null;
        currentPeriodEndUnix =
          (sub as unknown as { current_period_end?: number }).current_period_end ??
          (item as unknown as { current_period_end?: number })?.current_period_end ??
          null;
      } catch (e) {
        console.error("[webhook] no se pudo leer la suscripción:", e);
      }
    }
    await upsertSubscription({
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: strId(session.customer) ?? "",
      planId: itemId,
      planName: itemName,
      status: "active",
      customerName,
      customerEmail,
      customerPhone,
      currentPeriodEndUnix,
      recurringAmountCents,
      recurringInterval,
    });
    await Promise.allSettled([
      sendEmail({
        to: customerEmail,
        subject: `Bienvenido a Arcos · ${itemName}`,
        react: ClientPurchaseEmail({ customerName, planName: itemName, amountTotal, currency }),
      }),
      sendEmail({
        to: OWNER_EMAILS,
        subject: `Nueva membresía · ${itemName} · ${customerName}`,
        react: OwnerPurchaseEmail({
          planName: itemName,
          amountTotal,
          currency,
          customerName,
          customerEmail,
          customerPhone,
          sessionId: session.id,
        }),
      }),
    ]);
    return;
  }

  const finalize = await finalizeCheckout({
    stripeSessionId: session.id,
    paymentIntentId,
    subscriptionId,
    amountTotalCents: amountTotal,
    currency,
    itemKind,
    itemId,
    itemName,
    customerName,
    customerEmail,
    customerPhone,
    reservationId: m.reservationId ?? null,
  });

  if (finalize.refundNeeded) {
    console.error(
      `[webhook] PAGÓ pero SIN CUPO — REEMBOLSAR. session=${session.id} item=${itemName}`
    );
  }

  // Correos (ÚNICA fuente). best-effort: no rompen el webhook.
  if (itemKind === "class") {
    const classDay = m.classDay ?? "";
    const classTime = m.classTime ?? "";
    const classInstructor = m.classInstructor ?? "";
    const className = m.className ?? itemName;
    await Promise.allSettled([
      sendEmail({
        to: customerEmail,
        subject: `Reserva confirmada · ${className} · ${classDay}`,
        react: ClientReservationEmail({
          customerName,
          className,
          classDay,
          classTime,
          classInstructor,
          amountPaid: amountTotal,
          currency,
          reservationCode: finalize.reservationCode ?? undefined,
          // Clase pagada en línea: en vez de cancelar, ofrecemos REAGENDAR (mover).
          rescheduleUrl: finalize.reservationFullCode
            ? reservationRescheduleUrl(finalize.reservationFullCode)
            : undefined,
        }),
      }),
      sendEmail({
        to: OWNER_EMAILS,
        subject: `Nueva reserva paga · ${className} · ${customerName}`,
        react: OwnerReservationEmail({
          className,
          classDay,
          classTime,
          classInstructor,
          customerName,
          customerEmail,
          customerPhone,
          amountPaid: amountTotal,
          currency,
          reservationCode: finalize.reservationCode ?? undefined,
        }),
      }),
    ]);
  } else {
    await Promise.allSettled([
      sendEmail({
        to: customerEmail,
        subject: `Bienvenido a Arcos · ${itemName}`,
        react: ClientPurchaseEmail({ customerName, planName: itemName, amountTotal, currency }),
      }),
      sendEmail({
        to: OWNER_EMAILS,
        subject: `Nueva compra · ${itemName} · ${customerName}`,
        react: OwnerPurchaseEmail({
          planName: itemName,
          amountTotal,
          currency,
          customerName,
          customerEmail,
          customerPhone,
          sessionId: session.id,
        }),
      }),
    ]);
  }
}

// ── Facturas de suscripción ──────────────────────────────────────────────────
// La forma del objeto Invoice cambió entre versiones de API (subscription pasó a
// invoice.parent). Leemos defensivamente solo lo que necesitamos.
type InvoiceLike = {
  id?: string | null;
  billing_reason?: string | null;
  amount_paid?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  customer_name?: string | null;
  payment_intent?: string | { id: string } | null;
  subscription?: string | { id: string } | null;
  parent?: { subscription_details?: { subscription?: string | { id: string } | null } | null } | null;
};

function invoiceSubId(inv: InvoiceLike): string | null {
  return strId(inv.subscription ?? null) ?? strId(inv.parent?.subscription_details?.subscription ?? null);
}

type SubInfo = {
  planId: string;
  planName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
};

/** Resuelve plan/cliente de una factura: primero nuestra fila, si no, Stripe. */
async function resolveSubInfo(subId: string, inv: InvoiceLike): Promise<SubInfo | null> {
  const our = await getSubscriptionByStripeId(subId);
  if (our) {
    return {
      planId: our.planId,
      planName: our.planName,
      customerName: our.customerName,
      customerEmail: our.customerEmail,
      customerPhone: our.customerPhone ?? null,
    };
  }
  if (!stripe) return null;
  try {
    const sub = await stripe.subscriptions.retrieve(subId);
    const meta = sub.metadata ?? {};
    const email = inv.customer_email ?? "";
    if (!email) return null;
    return {
      planId: meta.planId ?? "",
      planName: meta.planName ?? "Membresía",
      customerName: meta.customerName ?? inv.customer_name ?? "Cliente",
      customerEmail: email,
      customerPhone: meta.customerPhone ?? null,
    };
  } catch {
    return null;
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const inv = invoice as unknown as InvoiceLike;
  const subId = invoiceSubId(inv);
  if (!subId || !inv.id) return; // no es factura de suscripción
  const info = await resolveSubInfo(subId, inv);
  if (!info || !info.customerEmail) return;

  const currency = inv.currency ?? "mxn";
  const plan = PLANS.find((p) => p.id === info.planId);
  const reason = inv.billing_reason ?? "";
  const base = {
    stripeInvoiceId: inv.id,
    stripePaymentIntentId: strId(inv.payment_intent ?? null),
    stripeSubscriptionId: subId,
    currency,
    customerName: info.customerName,
    customerEmail: info.customerEmail,
    customerPhone: info.customerPhone,
  };

  if (reason === "subscription_create") {
    // Primer cobro: desglose inscripción (única) + mensualidad. El welcome ya salió
    // en checkout.session.completed → aquí NO mandamos correo extra.
    if (plan?.inscripcion) {
      await recordTypedPayment({
        ...base,
        itemKind: "inscripcion",
        itemId: info.planId,
        itemName: `Inscripción · ${info.planName}`,
        amountCents: plan.inscripcion * 100,
      });
    }
    await recordTypedPayment({
      ...base,
      itemKind: "subscription",
      itemId: info.planId,
      itemName: `Membresía · ${info.planName}`,
      amountCents: plan ? plan.price * 100 : inv.amount_paid ?? 0,
    });
    return;
  }

  if (reason === "subscription_cycle") {
    // Renovación mensual: un cargo de mensualidad + recibo al cliente.
    const amountCents = inv.amount_paid ?? (plan ? plan.price * 100 : 0);
    await recordTypedPayment({
      ...base,
      itemKind: "subscription",
      itemId: info.planId,
      itemName: `Membresía · ${info.planName} · renovación`,
      amountCents,
    });
    await sendEmail({
      to: info.customerEmail,
      optional: true,
      subject: `Recibo de tu membresía · ${info.planName}`,
      react: ClientPurchaseEmail({
        customerName: info.customerName,
        planName: info.planName,
        amountTotal: amountCents,
        currency,
        renewal: true,
      }),
    });
  }
  // otros motivos (subscription_update / manual): se ignoran por ahora.
}

async function handleInvoiceFailed(invoice: Stripe.Invoice): Promise<void> {
  const inv = invoice as unknown as InvoiceLike;
  const subId = invoiceSubId(inv);
  if (!subId) return;
  const info = await resolveSubInfo(subId, inv);
  if (!info) return;
  await sendEmail({
    to: OWNER_EMAILS,
    subject: `Cobro de membresía rechazado · ${info.planName} · ${info.customerName}`,
    react: OwnerAlertEmail({
      title: "Cobro de membresía rechazado",
      body: `${info.customerName} (${info.customerEmail}) · ${info.planName}. La tarjeta fue rechazada (la membresía quedará en past_due). Revísalo en Stripe y pide al cliente actualizar su método de pago.`,
    }),
  });
}
