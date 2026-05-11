import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { HairlineDivider } from "@/components/primitives/HairlineDivider";
import { NOSOTROS } from "@/lib/content";
import { fadeUp } from "@/lib/motion";

export function ValuesEditorial() {
  return (
    <section className="bg-ink text-paper section-y">
      <div className="container-wide">
        <Reveal variants={fadeUp} className="mb-20">
          <Eyebrow tone="gold" withLine>
            03 / Valores
          </Eyebrow>
          <h2 className="mt-8 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
            En lo que <span className="font-serif-italic text-gold">creemos</span>.
          </h2>
        </Reveal>

        <div className="space-y-12 md:space-y-16">
          {NOSOTROS.values.map((v, i) => (
            <div key={v.number}>
              <Reveal variants={fadeUp}>
                <div className="grid lg:grid-cols-12 gap-y-6 lg:gap-x-16 items-baseline">
                  <div className="lg:col-span-3">
                    <p className="font-display text-6xl md:text-7xl text-gold font-light leading-none">
                      {v.number}
                    </p>
                  </div>
                  <div className="lg:col-span-9">
                    <h3 className="font-display text-3xl md:text-4xl tracking-[-0.03em] font-bold text-paper">
                      {v.title}
                    </h3>
                    <p className="mt-4 text-base md:text-lg leading-relaxed text-paper/70 max-w-2xl">
                      {v.body}
                    </p>
                  </div>
                </div>
              </Reveal>
              {i < NOSOTROS.values.length - 1 && (
                <div className="mt-12 max-w-2xl">
                  <HairlineDivider tone="gold" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
