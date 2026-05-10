import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { StorySection } from "@/components/sections/StorySection";
import { FacilityShowcase } from "@/components/sections/FacilityShowcase";
import { CommonAmenities } from "@/components/sections/CommonAmenities";
import { Values } from "@/components/sections/Values";
import { InstructorsGrid } from "@/components/sections/InstructorsGrid";
import { LocationSection } from "@/components/sections/LocationSection";
import { CTASection } from "@/components/sections/CTASection";
import { ABOUT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Arcos Fitness Club es más que un gimnasio: es una comunidad en Cuajimalpa, CDMX. Conoce nuestra historia, equipo, instalaciones y valores.",
};

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        number="00"
        eyebrow={ABOUT.hero.eyebrow}
        title={
          <>
            Más que
            <br />
            <span className="italic">un gym.</span>
          </>
        }
        subtitle={ABOUT.hero.subhead}
      />
      <StorySection />
      <FacilityShowcase />
      <CommonAmenities />
      <Values />
      <InstructorsGrid />
      <LocationSection />
      <CTASection />
    </>
  );
}
