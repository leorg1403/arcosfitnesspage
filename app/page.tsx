import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/primitives/Marquee";
import { ValueProps } from "@/components/sections/ValueProps";
import { FacilityShowcase } from "@/components/sections/FacilityShowcase";
import { ClassPreview } from "@/components/sections/ClassPreview";
import { HyroxSplit } from "@/components/sections/HyroxSplit";
import { MembershipCards } from "@/components/sections/MembershipCards";
import { Testimonials } from "@/components/sections/Testimonials";
import { CTASection } from "@/components/sections/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee
        items={["Reserva", "Entrena", "Recupera", "Pertenece", "Hyrox", "Comunidad"]}
        variant="dark"
      />
      <ValueProps />
      <FacilityShowcase />
      <ClassPreview />
      <HyroxSplit />
      <MembershipCards />
      <Testimonials />
      <CTASection />
    </>
  );
}
