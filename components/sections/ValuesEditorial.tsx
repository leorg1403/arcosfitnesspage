import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { NOSOTROS } from "@/lib/content";
import { fadeUp } from "@/lib/motion";

export function ValuesEditorial() {
  return (
    <section className="bg-ink text-paper py-20 md:py-28">
      <div className="container-wide">
        <Reveal variants={fadeUp} className="mb-14 md:mb-16">
          <Eyebrow tone="gold" withLine>
            03 / Valores
          </Eyebrow>
          <h2 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
            En lo que <span className="font-serif-italic text-gold">creemos</span>.
          </h2>
        </Reveal>

        {/* 3 columnas lado a lado, separadas por hairlines doradas verticales */}
        <div className="grid md:grid-cols-3 gap-px bg-gold/30 border-y border-gold/30">
          {NOSOTROS.values.map((v, i) => (
            <Reveal
              key={v.number}
              variants={fadeUp}
              delay={i * 0.1}
              className="bg-ink p-8 md:p-10 lg:p-12 flex flex-col"
            >
              <p className="font-display text-5xl md:text-6xl text-gold font-light leading-none mb-8">
                {v.number}
              </p>
              <h3 className="font-display text-2xl md:text-3xl tracking-[-0.02em] font-bold text-paper">
                {v.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-paper/70">
                {v.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
