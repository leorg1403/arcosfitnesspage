import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripeIsConfigured, retrieveCheckoutSession } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPaymentBySession } from "@/lib/db/payments";

export const runtime = "nodejs";

const Schema = z.object({ sessionId: z.string().min(1).max(120) });

export type ConfirmResult = {
  ok: true;
  itemKind: "plan" | "prepayment" | "class";
  planName: string;
  /** Nombre corto de la clase, solo para itemKind === "class" */
  className?: string;
  /** Código corto de reserva (últimos 6), solo para clases pagadas en línea */
  reservationCode?: string;
};

/**
 * SOLO LECTURA. El webhook firmado es quien finaliza el pago y manda correos;
 * esta ruta solo consulta el estado para la UI. NUNCA envía correos.
 */
export async function POST(req: NextRequest) {
  if (!stripeIsConfigured) {
    return NextResponse.json({ ok: false, error: "Stripe no configurado" }, { status: 503 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if ((await checkRateLimit("confirm", { ip, request: req })).rateLimited) {
    return NextResponse.json({ ok: false, error: "Demasiados intentos" }, { status: 429 });
  }

  let sessionId: string;
  try {
    ({ sessionId } = Schema.parse(await req.json()));
  } catch {
    return NextResponse.json({ ok: false, error: "Validación" }, { status: 400 });
  }

  // 1) Fuente de verdad: el Payment que finalizó el webhook. (Los pagos de
  // suscripción no tienen session → este lookup solo ve pagos únicos; aun así
  // acotamos itemKind a los tipos que entiende la UI.)
  const payment = await getPaymentBySession(sessionId);
  if (payment && payment.status === "paid") {
    const uiKind: ConfirmResult["itemKind"] =
      payment.itemKind === "prepayment" || payment.itemKind === "class" ? payment.itemKind : "plan";
    return NextResponse.json({
      ok: true,
      itemKind: uiKind,
      planName: payment.itemName,
      ...(uiKind === "class" && {
        className: payment.itemName,
        reservationCode: payment.reservation?.shortCode,
      }),
    } satisfies ConfirmResult);
  }

  // 2) Carrera con el webhook: leemos el estado en Stripe (sin correos, sin mutar).
  try {
    const session = await retrieveCheckoutSession(sessionId);
    if (session.status === "complete" && session.payment_status === "paid") {
      const itemKind = (session.metadata?.itemKind ?? "plan") as ConfirmResult["itemKind"];
      return NextResponse.json({
        ok: true,
        itemKind,
        planName: session.metadata?.itemName ?? "",
        ...(itemKind === "class" && { className: session.metadata?.className }),
      } satisfies ConfirmResult);
    }
    return NextResponse.json({ ok: false, error: "Pago no completado" }, { status: 400 });
  } catch (err) {
    console.error("[/api/checkout/confirm] error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
