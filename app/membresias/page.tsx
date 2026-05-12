import type { Metadata } from "next";
import { FullBleedHero } from "@/components/sections/FullBleedHero";
import { MainPlansHome } from "@/components/sections/MainPlansHome";
import { SegmentPlans } from "@/components/sections/SegmentPlans";
import { PrePaymentTable } from "@/components/sections/PrePaymentTable";
import { Accordion } from "@/components/ui/Accordion";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { FullBleedCTA } from "@/components/sections/FullBleedCTA";
import { MEMBRESIAS, HEROES } from "@/lib/content";
import { MEMBERSHIP_FAQS } from "@/lib/memberships";
import { fadeUp } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Membresías",
  description:
    "All Access, All Access Gold, Ejecutiva, Junior, Weekend y 7-Day Drop In. Sin contratos. Reserva tu visita por WhatsApp.",
};

export default function MembresiasPage() {
  return (
    <>
      <FullBleedHero
        image={HEROES.membresias}
        alt="Lockers Arcos Fitness"
        eyebrow={MEMBRESIAS.hero.eyebrow}
        headline={MEMBRESIAS.hero.headline}
        italicWord={MEMBRESIAS.hero.italicWord}
        height="tall"
      />

      <MainPlansHome number="01" showAllLink={false} tone="paper" />

      <SegmentPlans />

      <PrePaymentTable />

      <section className="bg-bone py-16 md:py-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-12 gap-10">
            <Reveal variants={fadeUp} className="lg:col-span-4">
              <Eyebrow tone="gold" withLine>
                04 / Preguntas
              </Eyebrow>
              <h2 className="mt-5 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
                Sin sorpresas.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-concrete max-w-sm">
                Si falta algo, escríbenos directo y te resolvemos al momento.
              </p>
            </Reveal>
            <Reveal variants={fadeUp} delay={0.15} className="lg:col-span-7 lg:col-start-6">
              <Accordion items={MEMBERSHIP_FAQS} />
            </Reveal>
          </div>
        </div>
      </section>

      <FullBleedCTA
        image={HEROES.ctaMembresias}
        eyebrow={MEMBRESIAS.cierre.eyebrow}
        headline={MEMBRESIAS.cierre.headline}
        italicWord={MEMBRESIAS.cierre.italicWord}
        cta={MEMBRESIAS.cierre.cta}
      />
    </>
  );
}
