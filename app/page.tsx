import { FullBleedHero } from "@/components/sections/FullBleedHero";
import { FullBleedStatement } from "@/components/sections/FullBleedStatement";
import { FacilitiesScroll } from "@/components/sections/FacilitiesScroll";
import { SinglePhotoSection } from "@/components/sections/SinglePhotoSection";
import { MainPlansHome } from "@/components/sections/MainPlansHome";
import { ContactSection } from "@/components/sections/ContactSection";
import { HOME, HEROES } from "@/lib/content";
import { WA_MESSAGES } from "@/lib/whatsapp";

export default function HomePage() {
  return (
    <>
      {/* 01 · Hero (ink + foto) */}
      <FullBleedHero
        image={HEROES.home}
        video="/videos/hero-membresias.mp4"
        alt="Arcos Fitness Club — Bosques de las Lomas"
        eyebrow={HOME.hero.eyebrow}
        headline={HOME.hero.headline}
        italicWord={HOME.hero.italicWord}
        cta={{
          label: HOME.hero.cta.label,
          href: "/clases-reservas",
        }}
        whatsappCta={{
          label: "Contáctanos por WhatsApp",
          message: WA_MESSAGES.generic,
        }}
        height="full"
      />

      {/* 02 · Espacios (paper) */}
      <FacilitiesScroll />

      {/* 03 · Membresías (bone — contraste sutil con paper de Espacios) */}
      <MainPlansHome showAllLink tone="bone" />

      {/* 04 · Hyrox (ink + foto B&N) */}
      <SinglePhotoSection
        image={HEROES.hyrox}
        alt="Hyrox box · Arcos Fitness"
        headline={HOME.hyrox.headline}
        italicWord={HOME.hyrox.italicWord}
        body={HOME.hyrox.body}
        link={HOME.hyrox.link}
        tone="ink"
        photoSide="left"
        monochrome
      />

      {/* 05 · Filosofía (ink + foto full-bleed) */}
      <FullBleedStatement
        image="/images/filosofia-bg.jpeg"
        alt="Recepción Arcos Fitness Club"
        body={HOME.statement.body}
        height="medium"
        align="left"
        monochrome
      />

      {/* 06 · Contacto (lead capture) */}
      <ContactSection image={HEROES.ctaHome} />
    </>
  );
}
