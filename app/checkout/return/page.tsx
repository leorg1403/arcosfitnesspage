import Link from "next/link";
import { Check } from "lucide-react";
import { stripeIsConfigured, retrieveCheckoutSession } from "@/lib/stripe";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";

export const dynamic = "force-dynamic";

type Search = { searchParams: Promise<{ session_id?: string }> };

export default async function CheckoutReturnPage({ searchParams }: Search) {
  const sp = await searchParams;
  const sessionId = sp.session_id;

  // Modo demo (sin Stripe) o sin sessionId → confirmación genérica
  if (!stripeIsConfigured || !sessionId) {
    return (
      <ReturnShell
        title="Listo."
        body="Tu solicitud fue procesada. El equipo te contacta en las próximas 24 horas para activar tu acceso."
      />
    );
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);

    if (session.status === "complete" && session.payment_status === "paid") {
      const planName = session.metadata?.itemName || "tu membresía";
      return (
        <ReturnShell
          title="Bienvenido a Arcos."
          body={`Tu pago de ${planName} fue confirmado. Recibiste un email con el detalle. El equipo te contacta en las próximas 24 horas para activar tu acceso y agendar tu visita guiada.`}
        />
      );
    }

    if (session.status === "open") {
      return (
        <ReturnShell
          title="Pago pendiente."
          body="Tu sesión de pago aún no se completó. Si cerraste la ventana por error, vuelve a intentarlo desde la página de membresías."
          variant="warning"
        />
      );
    }

    return (
      <ReturnShell
        title="Estado desconocido."
        body="No pudimos determinar el estado de tu pago. Contáctanos por WhatsApp y te ayudamos."
        variant="warning"
      />
    );
  } catch {
    return (
      <ReturnShell
        title="Error verificando el pago."
        body="No pudimos validar tu sesión. Si el cargo aparece en tu tarjeta, contacta al equipo por WhatsApp con tu nombre."
        variant="warning"
      />
    );
  }
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
          <p className="mt-8 text-lg leading-relaxed text-ink/80 max-w-xl">
            {body}
          </p>
          <div className="mt-12 flex flex-wrap gap-8">
            <Button href="/" variant="hairline" size="lg">
              Volver al inicio
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
