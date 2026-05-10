import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { scaleReveal, fadeUp } from "@/lib/motion";

export function HyroxSplit() {
  return (
    <section className="bg-ink text-paper section-y overflow-hidden">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <Reveal variants={scaleReveal} className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md">
              <Image
                src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1600&q=85"
                alt="Atleta entrenando Hyrox"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover grayscale-[20%] hover:grayscale-0 transition-[filter] duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute left-5 bottom-5 right-5 flex items-end justify-between">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-paper/70">
                  Único Hyrox Box certificado de la zona
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal variants={fadeUp} className="lg:col-span-6 order-1 lg:order-2 lg:pl-8">
            <Eyebrow number="05" light>
              Programa
            </Eyebrow>
            <h2 className="mt-6 font-display text-h1 leading-[0.92] tracking-tight">
              <span className="text-volt">HYROX</span>
              <span className="block italic text-paper/85">en Arcos.</span>
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-paper/75 max-w-lg">
              El deporte de fitness más exigente del mundo, con un programa de 12 semanas,
              coaches certificados y simulacros cronometrados. Para quienes quieren
              competir o simplemente entrenar como atletas.
            </p>

            <ul className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                { num: "8", label: "Estaciones" },
                { num: "12", label: "Semanas" },
                { num: "4×", label: "Por semana" },
              ].map((stat) => (
                <li
                  key={stat.label}
                  className="border-l-2 border-volt pl-4"
                >
                  <p className="font-display text-4xl text-paper">{stat.num}</p>
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-paper/60 mt-1">
                    {stat.label}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-wrap gap-3">
              <Button href="/hyrox" variant="primary" size="lg">
                Conocer Hyrox
                <ArrowUpRight className="size-4" strokeWidth={1.75} />
              </Button>
              <Button href="/clases-reservas" variant="outlineLight" size="lg">
                Reservar clase Hyrox
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
