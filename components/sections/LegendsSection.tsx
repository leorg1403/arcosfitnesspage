import Image from "next/image";
import { Reveal } from "@/components/primitives/Reveal";
import { ImageReveal } from "@/components/primitives/ImageReveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { fadeUp } from "@/lib/motion";

export function LegendsSection() {
  return (
    <section className="bg-ink text-paper py-20 md:py-28">
      <div className="container-wide">
        <Reveal variants={fadeUp} className="mb-14 md:mb-16 max-w-3xl">
          <Eyebrow tone="gold" withLine>
            06 / Comunidad
          </Eyebrow>
          <h2 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
            Han entrenado{" "}
            <span className="font-serif-italic text-gold">con nosotros</span>.
          </h2>
          <p className="mt-8 text-lg md:text-xl leading-[1.55] text-paper/70 max-w-xl">
            Ronnie Coleman, atletas de Hyrox y figuras del fisicoculturismo
            han pasado por Arcos. No es casualidad.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <ImageReveal
            direction="up"
            className="relative aspect-square lg:col-span-2 lg:row-span-2"
          >
            <Image
              src="/images/nosotros/leyendas-ronnie.jpg"
              alt="Ronnie Coleman con pros del fisicoculturismo en Arcos Fitness Club"
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover"
            />
          </ImageReveal>

          <ImageReveal direction="up" delay={0.1} className="relative aspect-square">
            <Image
              src="/images/nosotros/pros-1.jpg"
              alt="Atletas de fisicoculturismo posando en Arcos"
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
            />
          </ImageReveal>

          <ImageReveal direction="up" delay={0.2} className="relative aspect-square">
            <Image
              src="/images/nosotros/pros-2.jpg"
              alt="Figuras del fitness visitando Arcos Fitness Club"
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
            />
          </ImageReveal>
        </div>
      </div>
    </section>
  );
}
