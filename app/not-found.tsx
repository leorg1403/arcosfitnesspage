import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";

export default function NotFound() {
  return (
    <section className="bg-paper section-y min-h-[80svh] flex items-center">
      <div className="container-wide">
        <div className="max-w-3xl">
          <Eyebrow tone="gold" withLine>
            404 · Página no encontrada
          </Eyebrow>
          <h1 className="mt-8 font-display text-[clamp(3rem,10vw,8rem)] leading-[0.92] tracking-[-0.04em] font-bold">
            Te perdiste
            <br />
            <span className="font-serif-italic text-gold">en el camino.</span>
          </h1>
          <p className="mt-10 text-lg leading-relaxed text-concrete max-w-xl">
            Esta página ya no existe o cambiamos la ruta. Vuelve al inicio o
            escríbenos directo y te ayudamos.
          </p>
          <div className="mt-12 flex flex-wrap gap-8">
            <Button href="/" variant="link" size="lg">
              Volver al inicio
            </Button>
            <Button
              href={buildWhatsAppLink(WA_MESSAGES.generic)}
              external
              variant="linkGold"
              size="lg"
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
