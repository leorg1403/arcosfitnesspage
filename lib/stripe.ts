import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

export const stripeIsConfigured = Boolean(
  secretKey &&
    publishableKey &&
    !secretKey.includes("PLACEHOLDER") &&
    !publishableKey.includes("PLACEHOLDER")
);

/**
 * Singleton del SDK de Stripe (server-side).
 * Devuelve null si las keys son placeholder — esto permite que el código compile
 * en modo demo sin lanzar errores. Los handlers responden 503 si se invoca real.
 */
export const stripe: Stripe | null = stripeIsConfigured
  ? new Stripe(secretKey as string, {
      apiVersion: "2026-04-22.dahlia",
    })
  : null;

export const STRIPE_PUBLISHABLE_KEY = publishableKey || "";

export type CheckoutLineItem = {
  /** Si tienes Price IDs creados en Stripe (recomendado), usa este campo */
  priceId?: string;
  /** Si no, define el precio inline (útil para inscripciones one-time) */
  inline?: {
    name: string;
    description?: string;
    amount: number; // en centavos MXN
    currency?: string;
    recurring?: "month" | "year";
  };
  quantity?: number;
};

export type CreateCheckoutOpts = {
  items: CheckoutLineItem[];
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  metadata: Record<string, string>;
  /** Epoch (segundos) de expiración de la sesión. Mínimo de Stripe: +30 min. */
  expiresAt?: number;
  /** Metadata para la SUSCRIPCIÓN creada (solo aplica en mode=subscription). Así
   *  la suscripción/facturas llevan planId/planName y el webhook arma el desglose. */
  subscriptionMetadata?: Record<string, string>;
};

/**
 * Crea una Checkout Session embebida (sin redirect).
 * Con redirect_on_completion: "never", Stripe dispara onComplete en el cliente
 * en lugar de redirigir — no se pasa return_url, Stripe no lo permite en este modo.
 */
export async function createEmbeddedCheckoutSession(opts: CreateCheckoutOpts) {
  if (!stripe) {
    throw new Error("Stripe no configurado (STRIPE_SECRET_KEY es placeholder)");
  }

  const lineItems = opts.items.map((item) => {
    if (item.priceId) {
      return { price: item.priceId, quantity: item.quantity ?? 1 };
    }
    if (!item.inline) {
      throw new Error("CheckoutLineItem debe tener priceId o inline");
    }
    return {
      quantity: item.quantity ?? 1,
      price_data: {
        currency: item.inline.currency ?? "mxn",
        product_data: {
          name: item.inline.name,
          ...(item.inline.description && { description: item.inline.description }),
        },
        unit_amount: item.inline.amount,
        ...(item.inline.recurring && {
          recurring: { interval: item.inline.recurring },
        }),
      },
    };
  });

  // Si algún item es recurring → modo subscription, sino payment one-time
  const hasRecurring = opts.items.some(
    (i) => i.inline?.recurring || i.priceId?.startsWith("price_")
  );
  const mode: "subscription" | "payment" = hasRecurring ? "subscription" : "payment";

  return stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    redirect_on_completion: "never",
    mode,
    line_items: lineItems,
    customer_email: opts.customer.email,
    ...(opts.expiresAt && { expires_at: opts.expiresAt }),
    ...(mode === "subscription" && opts.subscriptionMetadata
      ? { subscription_data: { metadata: opts.subscriptionMetadata } }
      : {}),
    metadata: {
      ...opts.metadata,
      customerName: opts.customer.name,
      ...(opts.customer.phone && { customerPhone: opts.customer.phone }),
    },
  });
}

/** Verifica una sesión por ID (usado en /checkout/return) */
export async function retrieveCheckoutSession(sessionId: string) {
  if (!stripe) throw new Error("Stripe no configurado");
  return stripe.checkout.sessions.retrieve(sessionId);
}
