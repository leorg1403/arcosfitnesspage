import Image from "next/image";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { INSTRUCTORS } from "@/lib/classes";
import { fadeUp } from "@/lib/motion";

export function InstructorsRow() {
  return (
    <section className="bg-paper section-y">
      <div className="container-wide">
        <Reveal variants={fadeUp} className="mb-12">
          <Eyebrow tone="gold" withLine>
            Equipo
          </Eyebrow>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {INSTRUCTORS.map((ins, i) => (
            <Reveal
              key={ins.name}
              variants={fadeUp}
              delay={i * 0.04}
              className="group"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-ink mb-3">
                <Image
                  src={ins.image}
                  alt={ins.name}
                  fill
                  sizes="(min-width: 1024px) 16vw, 50vw"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
              </div>
              <p className="font-display text-base font-semibold tracking-tight">
                {ins.name}
              </p>
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete mt-1">
                {ins.specialty}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
