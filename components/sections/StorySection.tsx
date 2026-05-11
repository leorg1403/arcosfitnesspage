import Image from "next/image";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { ImageReveal } from "@/components/primitives/ImageReveal";
import { AnimatedCounter } from "@/components/primitives/AnimatedCounter";
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
              <p className="mt-10 text-xl md:text-2xl leading-[1.4] tracking-[-0.01em] text-ink/85 max-w-2xl">
                {NOSOTROS.story.body}
              </p>
            </Reveal>

            <Reveal variants={fadeUp} delay={0.25}>
              <div className="mt-16">
                <HairlineDivider tone="gold" className="max-w-md" />
                <div className="mt-8 grid grid-cols-3 gap-8 max-w-md">
                  {NOSOTROS.story.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="font-display text-3xl md:text-4xl font-light tracking-tight text-gold">
                        <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-concrete mt-2">
                        {stat.label}
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
              src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1600&q=85"
              alt="Equipo Arcos Fitness"
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
