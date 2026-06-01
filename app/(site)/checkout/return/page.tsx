import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import Link from "next/link";
import { stripeIsConfigured, retrieveCheckoutSession } from "@/lib/stripe";
import { getPaymentBySession } from "@/lib/db/payments";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";

export const dynamic = "force-dynamic";

type Search = { searchParams: Promise<{ session_id?: string }> };

type VerifyOk = {
  ok: true;
  planName: string;
  returnPage: "membresias" | "clases-reservas";
  className?: string;
};
type VerifyFail = { ok: false; title: string; body: string };

/**
 * SOLO LECTURA. Ruta de respaldo (sin-JS / redirect). El webhook firmado es el
 * único que manda correos y finaliza el pago; aquí solo leemos el estado.
 */
async function verify(sessionId: string): Promise<VerifyOk | VerifyFail> {
  // 1) Fuente de verdad: el Payment finalizado por el webhook.
  const payment = await getPaymentBySession(sessionId);
  if (payment && payment.status === "paid") {
    return {
      ok: true,
      planName: payment.itemName,
      returnPage: payment.itemKind === "class" ? "clases-reservas" : "membresias",
      ...(payment.itemKind === "class" && { className: payment.itemName }),
    };
  }

  // 2) Carrera con el webhook → leemos el estado en Stripe (sin mutar ni enviar correos).
  try {
    const session = await retrieveCheckoutSession(sessionId);
    if (session.status === "complete" && session.payment_status === "paid") {
      const itemKind = session.metadata?.itemKind ?? "plan";
      return {
        ok: true,
        planName: session.metadata?.itemName || "tu reserva",
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

  const result = await verify(sessionId);

  if (result.ok) {
    const params = new URLSearchParams({ confirmed: "1", plan: result.planName });
    if (result.className) params.set("className", result.className);
    redirect(`/${result.returnPage}?${params.toString()}`);
  }

  return <ReturnShell title={result.title} body={result.body} variant="warning" />;
}

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
          <p className="mt-8 text-lg leading-relaxed text-ink/80 max-w-xl">{body}</p>
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
