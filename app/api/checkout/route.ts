import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripeIsConfigured, createEmbeddedCheckoutSession } from "@/lib/stripe";
import { PLANS, PRE_PAYMENTS } from "@/lib/memberships";
import { CLASSES, DAY_LABELS, getClassPrice } from "@/lib/classes";
import { GYM_HOURS_BY_DAY } from "@/lib/content";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const CustomerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(40),
});

const CheckoutSchema = z.object({
  itemId: z.string().min(1),
  itemKind: z.enum(["plan", "prepayment", "class"]),
  customer: CustomerSchema,
  // classMeta del cliente se ignora a propósito: el precio/nombre se derivan
  // del catálogo en el servidor para que no se pueda manipular el monto.
});

export async function POST(req: NextRequest) {
  try {
    if (!stripeIsConfigured) {
      return NextResponse.json(
        { ok: false, error: "Stripe no configurado" },
        { status: 503 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if ((await checkRateLimit("checkout", { ip, request: req })).rateLimited) {
      return NextResponse.json(
        { ok: false, error: "Demasiados intentos. Espera un momento." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { itemId, itemKind, customer } = CheckoutSchema.parse(body);

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
      // class — derivamos TODO del catálogo; el precio del cliente se ignora.
      const cls = CLASSES.find((c) => c.id === itemId);
      if (!cls) {
        return NextResponse.json(
          { ok: false, error: "Clase no encontrada" },
          { status: 404 }
        );
      }
      const isOpenGym = cls.category === "open-gym";
      const classDay = `${DAY_LABELS[cls.day]}${cls.dateLabel ? ` ${cls.dateLabel}` : ""}`;
      const classTime = isOpenGym ? GYM_HOURS_BY_DAY[cls.day] : cls.time;
      const price = getClassPrice(cls);
      itemName = `${cls.name} · ${classDay} ${classTime}`;
      lineItems = [
        {
          inline: {
            name: itemName,
            description:
              cls.instructor !== "—" ? cls.instructor : "Acceso libre",
            amount: price * 100,
            currency: "mxn",
          },
        },
      ];
      extraMeta = {
        className: cls.name,
        classDay,
        classTime,
        classInstructor: cls.instructor,
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
