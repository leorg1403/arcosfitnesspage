import type { Metadata } from "next";
import { FullBleedHero } from "@/components/sections/FullBleedHero";
import { StorySection } from "@/components/sections/StorySection";
import { FacilityShowcase } from "@/components/sections/FacilityShowcase";
import { ValuesEditorial } from "@/components/sections/ValuesEditorial";
import { LegendsSection } from "@/components/sections/LegendsSection";
import { InstructorsRow } from "@/components/sections/InstructorsRow";
import { LocationSection } from "@/components/sections/LocationSection";
import { FullBleedCTA } from "@/components/sections/FullBleedCTA";
import { NOSOTROS, HEROES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Arcos Fitness Club: un club privado en Bosques de las Lomas, CDMX. Conoce nuestra historia, equipo, instalaciones y valores.",
};

export default function NosotrosPage() {
  return (
    <>
      <FullBleedHero
        image={HEROES.nosotros}
        alt="Arcos Fitness Club"
        eyebrow={NOSOTROS.hero.eyebrow}
        headline={NOSOTROS.hero.headline}
        italicWord={NOSOTROS.hero.italicWord}
        height="full"
      />

      <StorySection />

      <FacilityShowcase />

      <ValuesEditorial />

      <LegendsSection />

      <InstructorsRow />

      <LocationSection />

      <FullBleedCTA
        image={HEROES.ctaNosotros}
        eyebrow={NOSOTROS.cierre.eyebrow}
        headline={NOSOTROS.cierre.headline}
        italicWord={NOSOTROS.cierre.italicWord}
        cta={NOSOTROS.cierre.cta}
        size="headline"
      />
    </>
  );
}
