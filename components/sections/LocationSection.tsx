import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/content";

export function LocationSection() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.address
  )}`;

  return (
    <section className="bg-paper section-y">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow number="06">Ubicación</Eyebrow>
              <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
                Cuajimalpa,
                <br />
                <span className="italic">CDMX.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-10 space-y-6">
              <div className="flex gap-4">
                <MapPin className="size-5 text-ink shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute">
                    Dirección
                  </p>
                  <p className="text-base mt-1">{SITE.address}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone className="size-5 text-ink shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute">
                    Teléfono
                  </p>
                  <a
                    href={`tel:+52${SITE.phone.replace(/\s/g, "")}`}
                    className="text-base mt-1 hover:text-volt transition-colors block"
                  >
                    {SITE.phone}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <Mail className="size-5 text-ink shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute">
                    Email
                  </p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-base mt-1 hover:text-volt transition-colors block"
                  >
                    {SITE.email}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <Clock className="size-5 text-ink shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute">
                    Horarios
                  </p>
                  <ul className="mt-1 space-y-1">
                    {SITE.hours.map((h) => (
                      <li key={h.day} className="text-sm">
                        <span className="text-ink">{h.day}</span>
                        <span className="text-mute"> · {h.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button href={mapsUrl} external variant="dark" size="md" className="mt-4">
                Cómo llegar →
              </Button>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="relative aspect-[4/3] lg:aspect-square overflow-hidden rounded-md bg-bone">
              <iframe
                title="Ubicación Arcos Fitness Club"
                src="https://www.google.com/maps?q=Paseo+de+los+Tamarindos+98+Cuajimalpa+CDMX&output=embed"
                className="absolute inset-0 h-full w-full grayscale-[40%] hover:grayscale-0 transition-[filter] duration-700"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
