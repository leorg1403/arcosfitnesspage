import Image from "next/image";
import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { INSTRUCTORS } from "@/lib/classes";
import { fadeUp, stagger } from "@/lib/motion";

export function InstructorsGrid() {
  return (
    <section className="bg-paper section-y">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-y-8 mb-16">
          <Reveal className="lg:col-span-7">
            <Eyebrow>Equipo</Eyebrow>
            <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
              Coaches que
              <br />
              <span className="italic">se quedan.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9 self-end">
            <p className="text-mute leading-relaxed">
              No rotamos personal. Cada coach tiene años con nosotros y certificaciones
              vigentes. La permanencia es lo que crea comunidad.
            </p>
          </Reveal>
        </div>

        <Reveal variants={stagger(0.08)}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {INSTRUCTORS.map((ins) => (
              <Reveal
                key={ins.name}
                variants={fadeUp}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-bone mb-3">
                  <Image
                    src={ins.image}
                    alt={ins.name}
                    fill
                    sizes="(min-width: 1024px) 16vw, 50vw"
                    className="object-cover transition-all duration-700 group-hover:scale-105 grayscale-[15%] group-hover:grayscale-0"
                  />
                </div>
                <p className="font-medium leading-tight">{ins.name}</p>
                <p className="text-xs text-mute mt-1 font-mono uppercase tracking-wider">
                  {ins.specialty}
                </p>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
