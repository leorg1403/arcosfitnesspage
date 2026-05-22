import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripeIsConfigured, createEmbeddedCheckoutSession } from "@/lib/stripe";
import { PLANS, PRE_PAYMENTS } from "@/lib/memberships";

export const runtime = "nodejs";

const CustomerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(40),
});

const ClassMetaSchema = z.object({
  className: z.string().min(1),
  classDay: z.string().min(1),
  classTime: z.string().min(1),
  classInstructor: z.string().min(1),
  price: z.number().int().positive(),
});

const CheckoutSchema = z.object({
  itemId: z.string().min(1),
  itemKind: z.enum(["plan", "prepayment", "class"]),
  customer: CustomerSchema,
  // Solo para itemKind === "class"
  classMeta: ClassMetaSchema.optional(),
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
    const { itemId, itemKind, customer, classMeta } = CheckoutSchema.parse(body);

    let lineItems;
    let itemName: string;
    let extraMeta: Record<string, string> = {};

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
            amount: plan.price * 100,
            currency: "mxn",
            ...(plan.periodicity === "mensual" && { recurring: "month" as const }),
          },
        },
      ];
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

    } else if (itemKind === "prepayment") {
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

    } else {
      // class
      if (!classMeta) {
        return NextResponse.json(
          { ok: false, error: "classMeta requerido para itemKind=class" },
          { status: 400 }
        );
      }
      itemName = `${classMeta.className} · ${classMeta.classDay} ${classMeta.classTime}`;
      lineItems = [
        {
          inline: {
            name: itemName,
            description:
              classMeta.classInstructor !== "—"
                ? classMeta.classInstructor
                : "Acceso libre",
            amount: classMeta.price * 100,
            currency: "mxn",
          },
        },
      ];
      extraMeta = {
        className: classMeta.className,
        classDay: classMeta.classDay,
        classTime: classMeta.classTime,
        classInstructor: classMeta.classInstructor,
      };
    }

    const session = await createEmbeddedCheckoutSession({
      items: lineItems,
      customer,
      metadata: {
        itemId,
        itemKind,
        itemName,
        ...extraMeta,
      },
    });

    return NextResponse.json({
      ok: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validación", details: err.flatten() },
        { status: 400 }
      );
    }
    console.error("[/api/checkout] error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
