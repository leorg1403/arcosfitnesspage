import Image from "next/image";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/primitives/Reveal";
import { FINAL_CTA } from "@/lib/content";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { scaleReveal } from "@/lib/motion";

export function CTASection() {
  return (
    <section className="relative bg-ink text-paper py-24 md:py-32 overflow-hidden">
      <Reveal variants={scaleReveal} className="absolute inset-0 opacity-40">
        <Image
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
      </Reveal>

      <div className="container-app relative">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow light number="08">
              {FINAL_CTA.eyebrow}
            </Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-8 font-display text-display leading-[0.92] tracking-tight">
              {FINAL_CTA.title}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 text-lg leading-relaxed text-paper/75 max-w-xl">
              {FINAL_CTA.body}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-12 flex flex-wrap gap-3">
              <Button
                href={buildWhatsAppLink(WA_MESSAGES.visit)}
                external
                variant="primary"
                size="xl"
              >
                <MessageCircle className="size-5" strokeWidth={1.75} />
                Reservar mi visita
              </Button>
              <Button href="/membresias" variant="outlineLight" size="xl">
                Ver membresías
                <ArrowUpRight className="size-4" strokeWidth={1.75} />
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
