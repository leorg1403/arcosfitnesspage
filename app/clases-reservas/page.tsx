import type { Metadata } from "next";
import { Suspense } from "react";
import { FullBleedHero } from "@/components/sections/FullBleedHero";
import { ScheduleGrid } from "@/components/sections/ScheduleGrid";
import { InstructorsRow } from "@/components/sections/InstructorsRow";
import { FullBleedCTA } from "@/components/sections/FullBleedCTA";
import { ConfirmationModal } from "@/components/sections/ConfirmationModal";
import { CLASES, HEROES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Clases & Reservas",
  description:
    "Agenda semanal completa. Reserva tu lugar en clases de Entrenamiento Funcional, Hyrox y Boxeo.",
};

export default function ClasesReservasPage() {
  return (
    <>
      {/* Modal de confirmación post-pago (lee ?confirmed=1&plan=XXX de la URL) */}
      <Suspense>
        <ConfirmationModal />
      </Suspense>

      <FullBleedHero
        image={HEROES.clases}
        alt="Clase en Arcos Fitness"
        eyebrow={CLASES.hero.eyebrow}
        headline={CLASES.hero.headline}
        italicWord={CLASES.hero.italicWord}
        height="full"
      />

      <div id="schedule" className="scroll-mt-24">
        <ScheduleGrid />
      </div>

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
