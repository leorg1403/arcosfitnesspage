import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { ScheduleGrid } from "./ScheduleGrid";
import { fadeUp } from "@/lib/motion";
import { getBookableSchedule } from "@/lib/db/sessions";

export async function HyroxSchedule() {
  const entries = await getBookableSchedule();
  return (
    <section className="bg-paper">
      <div className="container-wide pt-24 md:pt-32 pb-12">
        <Reveal variants={fadeUp}>
          <Eyebrow tone="gold" withLine>
            Calendario Hyrox
          </Eyebrow>
          <h2 className="mt-8 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold max-w-3xl">
            Reserva tu sesión.
          </h2>
        </Reveal>
      </div>
      <ScheduleGrid entries={entries} initialCategory="hyrox" hideFilter sectionPadY={false} />
      <div className="h-24" aria-hidden />
    </section>
  );
}
