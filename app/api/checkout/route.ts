import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripeIsConfigured, createEmbeddedCheckoutSession } from "@/lib/stripe";
import { PLANS, PRE_PAYMENTS } from "@/lib/memberships";

export const runtime = "nodejs";

const CheckoutSchema = z.object({
  // Para planes mensuales: "all-access", "all-access-gold", "ejecutiva", etc.
  // Para anticipados: "anual", "semestral", "cuatrimestre", "trimestre"
  itemId: z.string().min(1),
  itemKind: z.enum(["plan", "prepayment"]),
  customer: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    phone: z.string().max(40),
  }),
});

export async function POST(req: NextRequest) {
  try {
    if (!stripeIsConfigured) {
      return NextResponse.json(
        { ok: false, error: "Stripe no configurado" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { itemId, itemKind, customer } = CheckoutSchema.parse(body);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || `${req.nextUrl.origin}`;

    // Resolver line items según el tipo
    let lineItems;
    let itemName: string;

    if (itemKind === "plan") {
      const plan = PLANS.find((p) => p.id === itemId);
      if (!plan) {
        return NextResponse.json(
          { ok: false, error: "Plan no encontrado" },
          { status: 404 }
        );
      }
      itemName = plan.name;
      lineItems = [
        {
          inline: {
            name: `Membresía ${plan.name}`,
            description: plan.tagline,
            amount: plan.price * 100, // MXN → centavos
            currency: "mxn",
            ...(plan.periodicity === "mensual" && { recurring: "month" as const }),
          },
        },
      ];
      // Si tiene inscripción, agregar como segundo item one-time (solo para mensuales).
      // Para que coexistan recurring + one-time se necesita un setup más avanzado;
      // por ahora si tiene inscripción la metemos en el primer mes.
      if (plan.inscripcion && plan.periodicity === "mensual") {
        lineItems.push({
          inline: {
            name: `Inscripción ${plan.name}`,
            description: "Pago único de inscripción",
            amount: plan.inscripcion * 100,
            currency: "mxn",
          },
        });
      }
    } else {
      // prepayment
      const prePayment = PRE_PAYMENTS.find((p) => p.id === itemId);
      if (!prePayment) {
        return NextResponse.json(
          { ok: false, error: "Paquete anticipado no encontrado" },
          { status: 404 }
        );
      }
      itemName = `${prePayment.label} (${prePayment.discount})`;
      lineItems = [
        {
          inline: {
            name: `Membresía Anticipada · ${prePayment.label}`,
            description: `Pago único con ${prePayment.discount}`,
            amount: prePayment.price * 100,
            currency: "mxn",
          },
        },
      ];
    }

    const session = await createEmbeddedCheckoutSession({
      items: lineItems,
      customer,
      metadata: {
        itemId,
        itemKind,
        itemName,
      },
      returnUrl: `${baseUrl}/checkout/return`,
    });

    return NextResponse.json({
      ok: true,
      clientSecret: session.client_secret,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validación", details: err.flatten() },
        { status: 400 }
      );
    }
    // eslint-disable-next-line no-console
    console.error("[/api/checkout] error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
