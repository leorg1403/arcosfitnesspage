import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { FACILITIES } from "@/lib/content";
import { fadeUp, scaleReveal, stagger } from "@/lib/motion";

export function FacilityShowcase() {
  // Layout asimétrico: primera grande, dos chicas, una mediana, dos chicas, una grande
  const layouts = [
    "col-span-12 md:col-span-7 aspect-[4/3] md:aspect-[16/11]",
    "col-span-6 md:col-span-5 aspect-square",
    "col-span-6 md:col-span-5 aspect-square",
    "col-span-12 md:col-span-7 aspect-[16/9]",
    "col-span-6 md:col-span-6 aspect-[4/5]",
    "col-span-6 md:col-span-6 aspect-[4/5]",
  ];

  return (
    <section className="bg-bone section-y">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-y-8 mb-16">
          <Reveal className="lg:col-span-7">
            <Eyebrow number="03">Espacios</Eyebrow>
            <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
              Cada metro,
              <br />
              <span className="italic text-ink/85">pensado.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9 self-end">
            <p className="text-mute leading-relaxed mb-6">
              2,400 m² distribuidos en estudios especializados, sala de pesas, Hyrox Box,
              spa y áreas de recuperación. Equipamiento de marca, mantenimiento diario.
            </p>
            <Button href="/nosotros" variant="link" size="md">
              Conocer instalaciones
              <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </Button>
          </Reveal>
        </div>

        <Reveal variants={stagger(0.08)}>
          <div className="grid grid-cols-12 gap-3 md:gap-4">
            {FACILITIES.map((f, i) => (
              <Reveal
                key={f.title}
                variants={scaleReveal}
                className={`${layouts[i % layouts.length]} group relative overflow-hidden rounded-md bg-ink`}
              >
                <Image
                  src={f.image}
                  alt={f.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent p-5 md:p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-paper/60">
                        0{i + 1}
                      </p>
                      <h3 className="font-display text-xl md:text-2xl text-paper mt-1">
                        {f.title}
                      </h3>
                    </div>
                    <p className="hidden md:block text-xs text-paper/70 max-w-[40%] text-right">
                      {f.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
