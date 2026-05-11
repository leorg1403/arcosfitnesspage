import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { ImageReveal } from "@/components/primitives/ImageReveal";
import { Button } from "@/components/ui/Button";
import { HairlineDivider } from "@/components/primitives/HairlineDivider";
import { SITE } from "@/lib/content";
import { fadeUp } from "@/lib/motion";

export function LocationSection() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.address
  )}`;

  return (
    <section className="bg-paper section-y">
      <div className="container-wide">
        <Reveal variants={fadeUp} className="mb-12">
          <Eyebrow tone="gold" withLine>
            05 / Ubicación
          </Eyebrow>
          <h2 className="mt-8 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold max-w-3xl">
            Cuajimalpa, <span className="font-serif-italic text-gold">CDMX</span>.
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-12">
          <ImageReveal direction="up" className="lg:col-span-8">
            <div className="relative aspect-[16/10] bg-bone">
              <iframe
                title="Ubicación Arcos Fitness Club"
                src="https://www.google.com/maps?q=Paseo+de+los+Tamarindos+98+Cuajimalpa+CDMX&output=embed"
                className="absolute inset-0 h-full w-full grayscale-[60%] hover:grayscale-0 transition-[filter] duration-1000"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </ImageReveal>

          <Reveal variants={fadeUp} delay={0.15} className="lg:col-span-4">
            <div className="space-y-8">
              <DetailBlock label="Dirección">
                <p className="text-base leading-relaxed">{SITE.address}</p>
              </DetailBlock>

              <DetailBlock label="Teléfono">
                <a
                  href={`tel:+52${SITE.phone.replace(/\s/g, "")}`}
                  className="text-base hover:text-gold transition-colors"
                >
                  {SITE.phone}
                </a>
              </DetailBlock>

              <DetailBlock label="Email">
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-base hover:text-gold transition-colors"
                >
                  {SITE.email}
                </a>
              </DetailBlock>

              <DetailBlock label="Horarios">
                <ul className="space-y-1.5">
                  {SITE.hours.map((h) => (
                    <li key={h.day} className="flex justify-between text-sm gap-4">
                      <span className="text-ink">{h.day}</span>
                      <span className="font-mono text-xs text-concrete">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </DetailBlock>

              <HairlineDivider tone="gold" />

              <Button href={mapsUrl} external variant="link" size="md">
                Cómo llegar
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}
