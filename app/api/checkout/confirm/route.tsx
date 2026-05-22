import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripeIsConfigured, retrieveCheckoutSession } from "@/lib/stripe";
import { sendEmail, OWNER_EMAIL } from "@/lib/email";
import { ClientPurchaseEmail } from "@/lib/email/client-purchase";
import { OwnerPurchaseEmail } from "@/lib/email/owner-purchase";
import { ClientReservationEmail } from "@/lib/email/client-reservation";
import { OwnerReservationEmail } from "@/lib/email/owner-reservation";

export const runtime = "nodejs";

const Schema = z.object({ sessionId: z.string().min(1) });

export type ConfirmResult = {
  ok: true;
  itemKind: "plan" | "prepayment" | "class";
  planName: string;
  /** Nombre corto de la clase, solo para itemKind === "class" */
  className?: string;
};

export async function POST(req: NextRequest) {
  if (!stripeIsConfigured) {
    return NextResponse.json({ ok: false, error: "Stripe no configurado" }, { status: 503 });
  }

  let sessionId: string;
  try {
    ({ sessionId } = Schema.parse(await req.json()));
  } catch {
    return NextResponse.json({ ok: false, error: "Validación" }, { status: 400 });
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);

    if (session.status !== "complete" || session.payment_status !== "paid") {
      return NextResponse.json({ ok: false, error: "Pago no completado" }, { status: 400 });
    }

    const itemKind = (session.metadata?.itemKind ?? "plan") as "plan" | "prepayment" | "class";
    const planName = session.metadata?.itemName ?? "";
    const customerName = session.metadata?.customerName ?? "Cliente";
    const customerEmail = session.customer_details?.email;
    const amountTotal = session.amount_total ?? 0;
    const currency = session.currency ?? "mxn";
    const className = session.metadata?.className;

    if (customerEmail) {
      const classDay = session.metadata?.classDay ?? "";
      const classTime = session.metadata?.classTime ?? "";
      const emailName = className ?? planName;

      if (itemKind === "class") {
        // Usamos llamada de función (no JSX) para evitar lint react-hooks/error-boundaries
        await Promise.allSettled([
          sendEmail({
            to: customerEmail,
            subject: `Reserva confirmada · ${emailName} · ${classDay}`,
            react: ClientReservationEmail({ customerName, className: emailName, classDay, classTime, classInstructor: "", amountPaid: amountTotal, currency }),
          }),
          sendEmail({
            to: OWNER_EMAIL,
            subject: `Nueva reserva paga · ${emailName} · ${customerName}`,
            react: OwnerReservationEmail({ className: emailName, classDay, classTime, classInstructor: "", customerName, customerEmail, customerPhone: session.metadata?.customerPhone, amountPaid: amountTotal, currency }),
          }),
        ]);
      } else {
        await Promise.allSettled([
          sendEmail({
            to: customerEmail,
            subject: `Bienvenido a Arcos · ${planName}`,
            react: ClientPurchaseEmail({ customerName, planName, amountTotal, currency }),
          }),
          sendEmail({
            to: OWNER_EMAIL,
            subject: `Nueva compra · ${planName} · ${customerName}`,
            react: OwnerPurchaseEmail({ planName, amountTotal, currency, customerName, customerEmail, customerPhone: session.metadata?.customerPhone, sessionId }),
          }),
        ]);
      }
    }

    return NextResponse.json({
      ok: true,
      itemKind,
      planName,
      className,
    } satisfies ConfirmResult);
  } catch (err) {
    console.error("[/api/checkout/confirm] error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
