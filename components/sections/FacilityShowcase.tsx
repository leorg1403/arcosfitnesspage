import Image from "next/image";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ImageReveal } from "@/components/primitives/ImageReveal";
import { Reveal } from "@/components/primitives/Reveal";
import { FACILITIES } from "@/lib/content";
import { fadeUp } from "@/lib/motion";

const SHOWCASE = [
  ...FACILITIES,
  {
    title: "Café & Juice Bar",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=2000&q=85",
  },
  {
    title: "Vestidores",
    image: "https://images.unsplash.com/photo-1542567455-cd733f23fbb1?auto=format&fit=crop&w=2000&q=85",
  },
];

export function FacilityShowcase() {
  return (
    <section className="bg-bone py-24 md:py-32">
      <div className="container-wide mb-12">
        <Reveal variants={fadeUp}>
          <Eyebrow tone="gold" withLine>
            02 / Espacios
          </Eyebrow>
        </Reveal>
      </div>

      <div className="space-y-6 md:space-y-10">
        {SHOWCASE.map((f, i) => (
          <ImageReveal
            key={f.title}
            direction="up"
            delay={i * 0.05}
            className="relative aspect-[16/10] md:aspect-[16/8] bg-ink overflow-hidden"
          >
            <Image
              src={f.image}
              alt={f.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold mb-1">
                0{i + 1}
              </p>
              <h3 className="font-display text-2xl md:text-4xl text-paper font-semibold tracking-tight">
                {f.title}
              </h3>
            </div>
          </ImageReveal>
        ))}
      </div>
    </section>
  );
}
