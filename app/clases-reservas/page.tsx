import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ScheduleGrid } from "@/components/sections/ScheduleGrid";
import { InstructorsGrid } from "@/components/sections/InstructorsGrid";
import { CTASection } from "@/components/sections/CTASection";
import { Marquee } from "@/components/primitives/Marquee";

export const metadata: Metadata = {
  title: "Clases & Reservas",
  description:
    "Agenda semanal completa. Reserva tu lugar en clases de Yoga, Funcional, Hyrox, Spinning, Box y Pilates por WhatsApp.",
};

export default function ClasesReservasPage() {
  return (
    <>
      <PageHero
        number="01"
        eyebrow="Agenda semanal"
        title={
          <>
            Reserva tu
            <br />
            <span className="italic">próxima clase.</span>
          </>
        }
        subtitle="Más de 25 clases por semana en seis disciplinas. Filtra, elige y reserva en menos de un minuto. Sin app, sin contraseñas."
      />

      <section className="bg-paper pt-10 pb-24">
        <ScheduleGrid />
      </section>

      <Marquee
        items={["Yoga", "Funcional", "Hyrox", "Spinning", "Pilates", "Box"]}
        variant="volt"
      />

      <InstructorsGrid />

      <CTASection />
    </>
  );
}
