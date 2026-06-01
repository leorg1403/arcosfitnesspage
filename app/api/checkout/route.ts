import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripeIsConfigured, createEmbeddedCheckoutSession } from "@/lib/stripe";
import { PLANS, PRE_PAYMENTS } from "@/lib/memberships";
import { GYM_HOURS_BY_DAY } from "@/lib/content";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClassHold, createPendingPayment, HOLD_MINUTES } from "@/lib/db/payments";
import { getTemplateById } from "@/lib/db/sessions";
import { WEEKDAY_TO_DAY, weekdayOfISO, formatDateLabel } from "@/lib/booking/window";

export const runtime = "nodejs";

const CustomerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(40),
});

const CheckoutSchema = z.object({
  itemId: z.string().min(1).max(64),
  itemKind: z.enum(["plan", "prepayment", "class"]),
  // requerido para itemKind === "class": fecha de la ocurrencia
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  customer: CustomerSchema,
  // classMeta del cliente se ignora a propósito (el precio se deriva del catálogo).
});

export async function POST(req: NextRequest) {
  try {
    if (!stripeIsConfigured) {
      return NextResponse.json({ ok: false, error: "Stripe no configurado" }, { status: 503 });
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
    const { itemId, itemKind, date, customer } = CheckoutSchema.parse(body);

    let lineItems;
    let itemName: string;
    let amountCents: number;
    let extraMeta: Record<string, string> = {};
    let expiresAt: number | undefined;

    if (itemKind === "plan") {
      const plan = PLANS.find((p) => p.id === itemId);
      if (!plan) {
        return NextResponse.json({ ok: false, error: "Plan no encontrado" }, { status: 404 });
      }
      itemName = plan.name;
      amountCents = (plan.price + (plan.periodicity === "mensual" ? plan.inscripcion ?? 0 : 0)) * 100;
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
      amountCents = prePayment.price * 100;
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
      // class — apartado (hold): valida ocurrencia, descuenta cupo, crea reserva pending.
      if (!date) {
        return NextResponse.json({ ok: false, error: "Falta la fecha de la clase" }, { status: 400 });
      }
      const hold = await createClassHold({
        templateId: itemId,
        dateISO: date,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      });
      if (!hold.ok) {
        const map: Record<string, { status: number; error: string }> = {
          not_found: { status: 404, error: "Clase no encontrada" },
          not_bookable: { status: 409, error: "Ese horario ya no está disponible. Refresca la página." },
          full: { status: 409, error: "Esta clase ya está llena." },
          blocked: { status: 403, error: "No es posible reservar con esta cuenta. Contáctanos." },
          too_many_holds: { status: 429, error: "Tienes apartados pendientes. Termínalos o espera unos minutos." },
          duplicate: { status: 409, error: "Ya tienes una reserva para esta clase." },
        };
        const m = map[hold.reason];
        return NextResponse.json({ ok: false, error: m.error }, { status: m.status });
      }

      const template = await getTemplateById(itemId);
      if (!template) {
        return NextResponse.json({ ok: false, error: "Clase no encontrada" }, { status: 404 });
      }
      const day = WEEKDAY_TO_DAY[weekdayOfISO(date)];
      const isOpenGym = template.category === "open_gym";
      const classDay = formatDateLabel(date);
      const classTime = isOpenGym ? GYM_HOURS_BY_DAY[day] : template.startTime;
      itemName = `${template.name} · ${classDay} ${classTime}`;
      amountCents = hold.amountCents;
      lineItems = [
        {
          inline: {
            name: itemName,
            description: template.instructor !== "—" ? template.instructor : "Acceso libre",
            amount: hold.amountCents,
            currency: "mxn",
          },
        },
      ];
      extraMeta = {
        reservationId: hold.reservationId,
        date,
        className: template.name,
        classDay,
        classTime,
        classInstructor: template.instructor,
      };
      // Hold de la app = HOLD_MINUTES (lo libera el cron). Stripe exige mínimo 30 min:
      // lo usamos como respaldo (el cron es el que libera antes).
      expiresAt = Math.floor(Date.now() / 1000) + Math.max(30, HOLD_MINUTES) * 60;
    }

    const session = await createEmbeddedCheckoutSession({
      items: lineItems,
      customer,
      expiresAt,
      metadata: { itemId, itemKind, itemName, ...extraMeta },
    });

    // Registrar el Payment pendiente (ligado al Customer y, si es clase, a la reserva).
    await createPendingPayment({
      stripeSessionId: session.id,
      itemKind,
      itemId,
      itemName,
      amountCents,
      currency: "mxn",
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      reservationId: extraMeta.reservationId ?? null,
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
