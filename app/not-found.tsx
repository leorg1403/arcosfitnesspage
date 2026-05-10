import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";

export default function NotFound() {
  return (
    <section className="bg-paper section-y">
      <div className="container-app">
        <div className="max-w-3xl">
          <Eyebrow number="404">Página no encontrada</Eyebrow>
          <h1 className="mt-8 font-display text-display leading-[0.92] tracking-tight">
            Te perdiste
            <br />
            <span className="italic">en el camino.</span>
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-mute max-w-xl">
            Esta página ya no existe o cambiamos la ruta. Vuelve al inicio o
            escríbenos directo y te ayudamos.
          </p>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button href="/" variant="dark" size="lg">
              Volver al inicio
              <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </Button>
            <Button
              href={buildWhatsAppLink(WA_MESSAGES.generic)}
              external
              variant="primary"
              size="lg"
            >
              <MessageCircle className="size-4" strokeWidth={1.75} />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
