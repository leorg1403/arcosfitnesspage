import { FullBleedHero } from "@/components/sections/FullBleedHero";
import { FullBleedStatement } from "@/components/sections/FullBleedStatement";
import { FacilitiesScroll } from "@/components/sections/FacilitiesScroll";
import { SinglePhotoSection } from "@/components/sections/SinglePhotoSection";
import { MainPlansHome } from "@/components/sections/MainPlansHome";
import { FullBleedCTA } from "@/components/sections/FullBleedCTA";
import { HOME, HEROES } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      {/* 01 · Hero (ink + foto) */}
      <FullBleedHero
        image={HEROES.home}
        alt="Arcos Fitness Club — Bosques de las Lomas"
        eyebrow={HOME.hero.eyebrow}
        headline={HOME.hero.headline}
        italicWord={HOME.hero.italicWord}
        cta={{
          label: HOME.hero.cta.label,
          href: "/clases-reservas",
        }}
        height="full"
      />

      {/* 02 · Espacios (paper) */}
      <FacilitiesScroll />

      {/* 03 · Membresías (bone — contraste sutil con paper de Espacios) */}
      <MainPlansHome number="03" showAllLink tone="bone" />

      {/* 04 · Hyrox (ink + foto B&N) */}
      <SinglePhotoSection
        image="https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=2000&q=85"
        alt="Hyrox box · Arcos Fitness"
        eyebrow="04 / Hyrox"
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
        image="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2400&q=85"
        alt="Recepción Arcos Fitness Club"
        eyebrow={HOME.statement.eyebrow}
        body={HOME.statement.body}
        link={HOME.statement.link}
        height="medium"
        align="left"
        monochrome
      />

      {/* 06 · Cierre (ink + foto) */}
      <FullBleedCTA
        image={HEROES.ctaHome}
        eyebrow={HOME.cierre.eyebrow}
        headline={HOME.cierre.headline}
        italicWord={HOME.cierre.italicWord}
        cta={HOME.cierre.cta}
      />
    </>
  );
}
