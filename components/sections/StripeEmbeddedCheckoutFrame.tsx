"use client";

import { useCallback, useRef, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import type { ConfirmResult } from "@/app/api/checkout/confirm/route";

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

export type ClassMeta = {
  className: string;
  classDay: string;
  classTime: string;
  classInstructor: string;
  price: number;
};

type Props = {
  itemId: string;
  itemKind: "plan" | "prepayment" | "class";
  customer: { name: string; email: string; phone: string };
  /** Requerido cuando itemKind === "class" */
  classMeta?: ClassMeta;
  /** Se llama cuando el pago fue confirmado (sin redirect de página) */
  onConfirmed?: (result: ConfirmResult) => void;
  onError?: (msg: string) => void;
};

export function StripeEmbeddedCheckoutFrame({
  itemId,
  itemKind,
  customer,
  classMeta,
  onConfirmed,
  onError,
}: Props) {
  const [error, setError] = useState<string | null>(
    !stripeReady ? "Stripe no está configurado en este entorno" : null
  );
  const sessionIdRef = useRef<string | null>(null);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId,
        itemKind,
        customer,
        ...(classMeta && { classMeta }),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok || !data.clientSecret) {
      const msg = data.error || "Error al iniciar el pago";
      setError(msg);
      onError?.(msg);
      throw new Error(msg);
    }
    // Guardar sessionId para usarlo en onComplete
    sessionIdRef.current = data.sessionId ?? null;
    return data.clientSecret;
  }, [itemId, itemKind, customer, classMeta, onError]);

  // Se llama cuando Stripe completa el pago — sin redirigir
  const handleComplete = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid || !onConfirmed) return;
    try {
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      });
      const data: ConfirmResult = await res.json();
      if (data.ok) {
        onConfirmed(data);
      }
    } catch (e) {
      console.error("[StripeEmbeddedCheckoutFrame] confirm error:", e);
    }
  }, [onConfirmed]);

  const stripeP = getStripe();

  if (!stripeReady || !stripeP) return null;

  if (error) {
    return (
      <div className="p-6 bg-red-500/5 border border-red-500/20 rounded">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripeP}
        options={{
          fetchClientSecret,
          // Con onComplete, Stripe NO redirige al return_url
          ...(onConfirmed && { onComplete: handleComplete }),
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

export const STRIPE_CONFIGURED_CLIENT = stripeReady;
