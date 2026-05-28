import type { Metadata } from "next";
import { Suspense } from "react";
import { FullBleedHero } from "@/components/sections/FullBleedHero";
import { MainPlansHome } from "@/components/sections/MainPlansHome";
import { SegmentPlans } from "@/components/sections/SegmentPlans";
import { PrePaymentTable } from "@/components/sections/PrePaymentTable";
import { Accordion } from "@/components/ui/Accordion";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { ConfirmationModal } from "@/components/sections/ConfirmationModal";
import { MEMBRESIAS } from "@/lib/content";
import { MEMBERSHIP_FAQS } from "@/lib/memberships";
import { fadeUp } from "@/lib/motion";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/layout/SocialIcons";

export const metadata: Metadata = {
  title: "Membresías",
  description:
    "All Access, All Access Gold, Ejecutiva, Junior, Weekend y 7-Day Drop In. Sin contratos. Reserva tu visita por WhatsApp.",
};

const FAQS_WITH_LINKS = MEMBERSHIP_FAQS.map((faq) =>
  faq.q === "¿Tienen día de prueba?"
    ? {
        ...faq,
        a: (
          <>
            Sí.{" "}
            <a
              href={buildWhatsAppLink(WA_MESSAGES.visit)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-1 hover:text-gold-deep transition-colors"
            >
              Agenda tu visita por WhatsApp
            </a>
            . Asiste a una clase y/o al gimnasio, haz lo que quieras.
          </>
        ),
      }
    : faq
);

export default function MembresiasPage() {
  return (
    <>
      {/* Modal de confirmación post-pago (lee ?confirmed=1&plan=XXX de la URL) */}
      <Suspense>
        <ConfirmationModal />
      </Suspense>

      <FullBleedHero
        image="/images/hyrox-statement.jpeg"
        alt="Atletas Hyrox en competencia"
        eyebrow={MEMBRESIAS.hero.eyebrow}
        headline={MEMBRESIAS.hero.headline}
        italicWord={MEMBRESIAS.hero.italicWord}
        height="full"
      />

      <MainPlansHome showAllLink={false} tone="paper" />

      <SegmentPlans />

      <PrePaymentTable />

      <section className="bg-bone py-16 md:py-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-12 gap-10">
            <Reveal variants={fadeUp} className="lg:col-span-4">
              <Eyebrow tone="gold" withLine>
                Preguntas frecuentes
              </Eyebrow>
              <h2 className="mt-5 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
                Sin sorpresas.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-concrete max-w-sm">
                Si tienes alguna duda, escríbenos y te resolvemos de inmediato.
              </p>
              <a
                href={buildWhatsAppLink(WA_MESSAGES.generic)}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center gap-2.5 text-sm text-ink hover:text-gold-deep transition-colors duration-500"
              >
                <span className="relative inline-flex flex-col overflow-hidden">
                  <span className="block">Escríbenos por WhatsApp</span>
                  <span className="block h-px w-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left scale-x-100 group-hover:scale-x-0" />
                </span>
                <WhatsappIcon className="size-4 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
              </a>
            </Reveal>
            <Reveal variants={fadeUp} delay={0.15} className="lg:col-span-7 lg:col-start-6">
              <Accordion items={FAQS_WITH_LINKS} />
            </Reveal>
          </div>
        </div>
      </section>

    </>
  );
}
