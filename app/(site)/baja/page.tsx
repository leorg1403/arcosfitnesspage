import Link from "next/link";
import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { confirmUnsubscribeAction } from "@/app/actions/unsubscribe";
import { verifyUnsubscribe, unsubscribeSecret } from "@/lib/marketing/unsubscribe";

export const dynamic = "force-dynamic";
// El token va en la URL; no debe indexarse.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ token?: string; done?: string; e?: string }> };

export default async function BajaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const secret = unsubscribeSecret();
  const customerId = secret && sp.token ? await verifyUnsubscribe(sp.token, secret) : null;

  if (!customerId) {
    return (
      <Shell
        tone="warning"
        title="Enlace no válido."
        body="Este enlace de baja no es válido o expiró. Si quieres dejar de recibir nuestros correos, responde a cualquiera de ellos y lo procesamos."
      />
    );
  }

  if (sp.done === "1") {
    return (
      <Shell
        title="Te diste de baja."
        body="Ya no recibirás correos de marketing de Arcos Fitness. Tus correos de reservas y pagos no se ven afectados. ¿Cambiaste de opinión? Escríbenos y te reactivamos."
      />
    );
  }

  return (
    <section className="bg-paper section-y min-h-[80svh] flex items-center">
      <div className="container-wide">
        <div className="max-w-2xl">
          <Eyebrow tone="gold" withLine>
            Preferencias de correo
          </Eyebrow>
          <h1 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold text-ink">
            ¿Darte de baja?
          </h1>

          {sp.e === "rate" && (
            <p className="mt-4 text-sm text-red-500">
              Demasiados intentos. Espera un momento e inténtalo de nuevo.
            </p>
          )}

          <p className="mt-8 text-base leading-relaxed text-ink/70">
            Dejarás de recibir correos de <span className="font-medium text-ink">marketing y novedades</span>.
            Tus correos transaccionales (confirmaciones de reserva, pagos, cancelaciones) seguirán llegando.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <form action={confirmUnsubscribeAction}>
              <input type="hidden" name="token" value={sp.token} />
              <button
                type="submit"
                className="h-12 px-7 inline-flex items-center gap-2 bg-ink text-paper font-medium tracking-tight hover:bg-graphite active:scale-[0.99] transition-all duration-300"
              >
                <X className="size-4" strokeWidth={2} />
                Sí, darme de baja
              </button>
            </form>
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep self-center"
            >
              No, seguir suscrito →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Shell({
  title,
  body,
  tone = "success",
}: {
  title: string;
  body: string;
  tone?: "success" | "warning";
}) {
  return (
    <section className="bg-paper section-y min-h-[80svh] flex items-center">
      <div className="container-wide">
        <div className="max-w-2xl">
          <div
            className={
              "inline-flex items-center justify-center size-14 rounded-full mb-8 " +
              (tone === "success" ? "bg-gold/15 text-gold" : "bg-ink/5 text-ink/50")
            }
          >
            <Check className="size-6" strokeWidth={2} />
          </div>
          <Eyebrow tone="gold" withLine>
            Preferencias de correo
          </Eyebrow>
          <h1 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold text-ink">
            {title}
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-ink/80 max-w-xl">{body}</p>
          <div className="mt-12">
            <Link href="/" className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep">
              Volver al inicio →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
