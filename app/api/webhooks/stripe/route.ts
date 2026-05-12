import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeIsConfigured } from "@/lib/stripe";
import { sendEmail, OWNER_EMAIL } from "@/lib/email";
import { OwnerPurchaseEmail } from "@/lib/email/owner-purchase";
import { ClientPurchaseEmail } from "@/lib/email/client-purchase";

export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const webhookConfigured = Boolean(
  webhookSecret && !webhookSecret.includes("PLACEHOLDER")
);

/**
 * Webhook handler. Stripe llama POST con la firma en el header `stripe-signature`.
 * Validamos signature → procesamos el evento checkout.session.completed → enviamos emails.
 */
export async function POST(req: NextRequest) {
  if (!stripeIsConfigured || !stripe) {
    return NextResponse.json(
      { ok: false, error: "Stripe no configurado" },
      { status: 503 }
    );
  }
  if (!webhookConfigured) {
    return NextResponse.json(
      { ok: false, error: "Webhook secret no configurado" },
      { status: 503 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { ok: false, error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret as string);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[webhook] signature error:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Solo nos interesa cuando el checkout se completa
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail =
    session.customer_email ||
    session.customer_details?.email ||
    session.metadata?.customerEmail;
  const customerName =
    session.metadata?.customerName ||
    session.customer_details?.name ||
    "Miembro";
  const customerPhone =
    session.metadata?.customerPhone || session.customer_details?.phone || undefined;
  const planName = session.metadata?.itemName || "Membresía Arcos";
  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency ?? "mxn";

  if (!customerEmail) {
    // eslint-disable-next-line no-console
    console.warn("[webhook] sin email de cliente, no se envía confirmación");
    return;
  }

  await Promise.all([
    sendEmail({
      to: OWNER_EMAIL,
      subject: `Nueva compra · ${planName} · ${customerName}`,
      react: OwnerPurchaseEmail({
        planName,
        amountTotal,
        currency,
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        sessionId: session.id,
      }),
      replyTo: customerEmail,
    }),
    sendEmail({
      to: customerEmail,
      subject: `Bienvenido a Arcos: tu plan ${planName} está activo`,
      react: ClientPurchaseEmail({
        customerName,
        planName,
        amountTotal,
        currency,
      }),
    }),
  ]);
}
