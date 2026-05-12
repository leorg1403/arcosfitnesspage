"use client";

import { useCallback, useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripeReady = Boolean(publishableKey && !publishableKey.includes("PLACEHOLDER"));

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripeReady) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey as string);
  }
  return stripePromise;
}

type Props = {
  itemId: string;
  itemKind: "plan" | "prepayment";
  customer: { name: string; email: string; phone: string };
  onError?: (msg: string) => void;
};

export function StripeEmbeddedCheckoutFrame({
  itemId,
  itemKind,
  customer,
  onError,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, itemKind, customer }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok || !data.clientSecret) {
      const msg = data.error || "Error al iniciar el pago";
      setError(msg);
      onError?.(msg);
      throw new Error(msg);
    }
    return data.clientSecret;
  }, [itemId, itemKind, customer, onError]);

  // Si no hay key publishable o falla la inicialización, dejamos que el Dialog muestre el banner demo
  const stripeP = getStripe();

  useEffect(() => {
    if (!stripeReady) {
      setError("Stripe no está configurado en este entorno");
    }
  }, []);

  if (!stripeReady || !stripeP) {
    return null;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/5 border border-red-500/20 rounded">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div id="checkout" className="min-h-[500px]">
      <EmbeddedCheckoutProvider
        stripe={stripeP}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

export const STRIPE_CONFIGURED_CLIENT = stripeReady;
