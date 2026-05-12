import Image from "next/image";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { ImageReveal } from "@/components/primitives/ImageReveal";
import { HairlineDivider } from "@/components/primitives/HairlineDivider";
import { NOSOTROS } from "@/lib/content";
import { fadeUp } from "@/lib/motion";

export function StorySection() {
  return (
    <section className="bg-paper section-y">
      <div className="container-wide">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <Reveal variants={fadeUp}>
              <Eyebrow tone="gold" withLine>
                {NOSOTROS.story.eyebrow}
              </Eyebrow>
            </Reveal>
            <Reveal variants={fadeUp} delay={0.1}>
              <p className="mt-10 text-lg md:text-xl leading-[1.55] text-ink/85 max-w-2xl">
                {NOSOTROS.story.body}
              </p>
            </Reveal>

            <Reveal variants={fadeUp} delay={0.25}>
              <div className="mt-14">
                <HairlineDivider tone="gold" className="max-w-md" />
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
                  {NOSOTROS.story.pillars.map((pillar) => (
                    <div key={pillar.eyebrow}>
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold mb-2">
                        {pillar.eyebrow}
                      </p>
                      <p className="font-display text-lg md:text-xl font-semibold tracking-tight text-ink">
                        {pillar.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <ImageReveal
            direction="up"
            className="relative aspect-[4/5] lg:col-span-5 order-1 lg:order-2"
          >
            <Image
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1600&q=85"
              alt="Sala de pesas Arcos Fitness"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover grayscale-[40%]"
            />
          </ImageReveal>
        </div>
      </div>
    </section>
  );
}
