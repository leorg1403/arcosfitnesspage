import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import Link from "next/link";
import { stripeIsConfigured, retrieveCheckoutSession } from "@/lib/stripe";
import { sendEmail, OWNER_EMAIL } from "@/lib/email";
import { ClientPurchaseEmail } from "@/lib/email/client-purchase";
import { OwnerPurchaseEmail } from "@/lib/email/owner-purchase";
import { ClientReservationEmail } from "@/lib/email/client-reservation";
import { OwnerReservationEmail } from "@/lib/email/owner-reservation";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";

export const dynamic = "force-dynamic";

type Search = { searchParams: Promise<{ session_id?: string }> };

// ── Helpers ────────────────────────────────────────────────────────────────

type VerifyOk = {
  ok: true;
  planName: string;
  returnPage: "membresias" | "clases-reservas";
  /** Solo para clases: nombre corto de la clase (ej. "Funcional", "Open Gym") */
  className?: string;
};
type VerifyFail = { ok: false; title: string; body: string };

async function verifyAndNotify(sessionId: string): Promise<VerifyOk | VerifyFail> {
  try {
    const session = await retrieveCheckoutSession(sessionId);

    if (session.status === "complete" && session.payment_status === "paid") {
      const itemKind = session.metadata?.itemKind ?? "plan";
      const planName = session.metadata?.itemName || "tu reserva";
      const customerName = session.metadata?.customerName || "Cliente";
      const customerEmail = session.customer_details?.email;
      const amountTotal = session.amount_total ?? 0;
      const currency = session.currency ?? "mxn";

      if (customerEmail) {
        if (itemKind === "class") {
          // ── Emails de reserva de clase ──────────────────────────────
          const classMeta = {
            className: session.metadata?.className ?? planName,
            classDay: session.metadata?.classDay ?? "",
            classTime: session.metadata?.classTime ?? "",
            classInstructor: session.metadata?.classInstructor ?? "",
          };

          try {
            await sendEmail({
              to: customerEmail,
              subject: `Reserva confirmada · ${classMeta.className} · ${classMeta.classDay}`,
              react: (
                <ClientReservationEmail
                  customerName={customerName}
                  className={classMeta.className}
                  classDay={classMeta.classDay}
                  classTime={classMeta.classTime}
                  classInstructor={classMeta.classInstructor}
                  amountPaid={amountTotal}
                  currency={currency}
                />
              ),
            });
          } catch (e) {
            console.error("[checkout/return] class client email error:", e);
          }

          try {
            await sendEmail({
              to: OWNER_EMAIL,
              subject: `Nueva reserva paga · ${classMeta.className} · ${customerName}`,
              react: (
                <OwnerReservationEmail
                  className={classMeta.className}
                  classDay={classMeta.classDay}
                  classTime={classMeta.classTime}
                  classInstructor={classMeta.classInstructor}
                  customerName={customerName}
                  customerEmail={customerEmail}
                  customerPhone={session.metadata?.customerPhone}
                  amountPaid={amountTotal}
                  currency={currency}
                />
              ),
            });
          } catch (e) {
            console.error("[checkout/return] class owner email error:", e);
          }

          return {
            ok: true,
            planName,
            returnPage: "clases-reservas",
            className: session.metadata?.className,
          };

        } else {
          // ── Emails de compra de membresía ───────────────────────────
          try {
            await sendEmail({
              to: customerEmail,
              subject: `Bienvenido a Arcos · ${planName}`,
              react: (
                <ClientPurchaseEmail
                  customerName={customerName}
                  planName={planName}
                  amountTotal={amountTotal}
                  currency={currency}
                />
              ),
            });
          } catch (e) {
            console.error("[checkout/return] membership client email error:", e);
          }

          try {
            await sendEmail({
              to: OWNER_EMAIL,
              subject: `Nueva compra · ${planName} · ${customerName}`,
              react: (
                <OwnerPurchaseEmail
                  planName={planName}
                  amountTotal={amountTotal}
                  currency={currency}
                  customerName={customerName}
                  customerEmail={customerEmail}
                  customerPhone={session.metadata?.customerPhone}
                  sessionId={sessionId}
                />
              ),
            });
          } catch (e) {
            console.error("[checkout/return] membership owner email error:", e);
          }

          return { ok: true, planName, returnPage: "membresias" };
        }
      }

      // Sin email de cliente — redirigir igualmente
      return {
        ok: true,
        planName,
        returnPage: itemKind === "class" ? "clases-reservas" : "membresias",
        ...(itemKind === "class" && { className: session.metadata?.className }),
      };
    }

    if (session.status === "open") {
      return {
        ok: false,
        title: "Pago pendiente.",
        body: "Tu sesión de pago aún no se completó. Si cerraste la ventana por error, vuelve a intentarlo.",
      };
    }

    return {
      ok: false,
      title: "Estado desconocido.",
      body: "No pudimos determinar el estado de tu pago. Contáctanos por WhatsApp y te ayudamos.",
    };
  } catch {
    return {
      ok: false,
      title: "Error verificando el pago.",
      body: "No pudimos validar tu sesión. Si el cargo aparece en tu tarjeta, contacta al equipo por WhatsApp con tu nombre.",
    };
  }
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function CheckoutReturnPage({ searchParams }: Search) {
  const sp = await searchParams;
  const sessionId = sp.session_id;

  if (!stripeIsConfigured || !sessionId) {
    return (
      <ReturnShell
        title="Listo."
        body="Tu solicitud fue procesada. El equipo te contacta en las próximas 24 horas para activar tu acceso."
      />
    );
  }

  const result = await verifyAndNotify(sessionId);

  if (result.ok) {
    const params = new URLSearchParams({ confirmed: "1", plan: result.planName });
    if (result.className) params.set("className", result.className);
    redirect(`/${result.returnPage}?${params.toString()}`);
  }

  return <ReturnShell title={result.title} body={result.body} variant="warning" />;
}

// ── Shell de error/fallback ─────────────────────────────────────────────────

function ReturnShell({
  title,
  body,
  variant = "success",
}: {
  title: string;
  body: string;
  variant?: "success" | "warning";
}) {
  return (
    <section className="bg-paper section-y min-h-[80svh] flex items-center">
      <div className="container-wide">
        <div className="max-w-3xl">
          <div
            className={
              "inline-flex items-center justify-center size-14 rounded-full mb-8 " +
              (variant === "success" ? "bg-gold/15 text-gold" : "bg-ink/5 text-ink/50")
            }
          >
            <Check className="size-6" strokeWidth={2} />
          </div>
          <Eyebrow tone="gold" withLine>
            Confirmación
          </Eyebrow>
          <h1 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
            {title}
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-ink/80 max-w-xl">
            {body}
          </p>
          <div className="mt-12 flex flex-wrap gap-8">
            <Button href="/membresias" variant="hairline" size="lg">
              Ver membresías
            </Button>
            <Link
              href="/clases-reservas"
              className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep self-center"
            >
              Ver clases →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
