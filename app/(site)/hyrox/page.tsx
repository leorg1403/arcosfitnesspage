import type { Metadata } from "next";
import { FullBleedHero } from "@/components/sections/FullBleedHero";
import { FullBleedStatement } from "@/components/sections/FullBleedStatement";

import { HyroxSchedule } from "@/components/sections/HyroxSchedule";
import { FullBleedCTA } from "@/components/sections/FullBleedCTA";
import { HYROX, HEROES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hyrox — Programa oficial",
  description:
    "Único Hyrox Box certificado en Bosques de las Lomas. Programa de 12 semanas, simulacros cronometrados, coaches especializados.",
};

// El calendario Hyrox muestra cupos en vivo → render dinámico.
export const dynamic = "force-dynamic";

export default function HyroxPage() {
  return (
    <>
      <FullBleedHero
        image={HEROES.hyrox}
        alt="Atleta Hyrox en competencia"
        eyebrow={HYROX.hero.eyebrow}
        headline={[HYROX.hero.display]}
        displaySize="mega"
        height="full"
        monochrome
      />

      <FullBleedStatement
        image="/images/hyrox-gym.jpeg"
        alt="Entrenamiento Hyrox en gimnasio"
        body={HYROX.manifesto}
        height="tall"
        align="center"
        monochrome
        intensity="strong"
        variant="manifesto"
      />

      <HyroxSchedule />

      <FullBleedCTA
        image={HEROES.ctaHyrox}
        headline={HYROX.cierre.headline}
        italicWord={HYROX.cierre.italicWord}
        cta={HYROX.cierre.cta}
        monochrome
      />
    </>
  );
}
