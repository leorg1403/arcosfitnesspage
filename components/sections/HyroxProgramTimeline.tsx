import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { HairlineDivider } from "@/components/primitives/HairlineDivider";
import { HYROX } from "@/lib/content";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function HyroxProgramTimeline() {
  return (
    <section className="bg-bone section-y">
      <div className="container-wide">
        <Reveal variants={fadeUp} className="mb-16">
          <Eyebrow tone="gold" withLine>
            03 / Programa 12 semanas
          </Eyebrow>
          <h2 className="mt-8 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold max-w-3xl">
            De cero a <span className="font-serif-italic text-gold">race day</span>.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 relative">
          {HYROX.program.map((block, i) => (
            <Reveal
              key={block.number}
              variants={fadeUp}
              delay={i * 0.12}
              className={cn(
                "p-8 md:p-10",
                i > 0 && "md:border-l border-gold/40"
              )}
            >
              <p className="font-display text-7xl md:text-8xl tracking-tight text-gold font-light leading-none">
                {block.number}
              </p>
              <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-concrete">
                {block.weeks}
              </p>
              <h3 className="mt-3 font-display text-2xl md:text-3xl tracking-tight font-semibold">
                {block.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-ink/75 max-w-xs">
                {block.body}
              </p>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 max-w-md">
          <HairlineDivider tone="gold" />
        </div>
      </div>
    </section>
  );
}
