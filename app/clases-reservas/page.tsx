import type { Metadata } from "next";
import { FullBleedHero } from "@/components/sections/FullBleedHero";
import { ScheduleGrid } from "@/components/sections/ScheduleGrid";
import { InstructorsRow } from "@/components/sections/InstructorsRow";
import { FullBleedCTA } from "@/components/sections/FullBleedCTA";
import { CLASES, HEROES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Clases & Reservas",
  description:
    "Agenda semanal completa. Reserva tu lugar en clases de Entrenamiento Funcional, Hyrox y Boxeo.",
};

export default function ClasesReservasPage() {
  return (
    <>
      <FullBleedHero
        image={HEROES.clases}
        alt="Clase en Arcos Fitness"
        eyebrow={CLASES.hero.eyebrow}
        headline={CLASES.hero.headline}
        italicWord={CLASES.hero.italicWord}
        height="full"
      />

      <ScheduleGrid />

      <InstructorsRow />

      <FullBleedCTA
        image={HEROES.ctaClases}
        headline={CLASES.cierre.headline}
        italicWord={CLASES.cierre.italicWord}
        cta={CLASES.cierre.cta}
      />
    </>
  );
}
