import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { ScheduleGrid } from "@/components/sections/ScheduleGrid";
import { Marquee } from "@/components/primitives/Marquee";
import { CTASection } from "@/components/sections/CTASection";
import { HYROX } from "@/lib/content";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { fadeUp, scaleReveal, stagger } from "@/lib/motion";
import { INSTRUCTORS } from "@/lib/classes";

export const metadata: Metadata = {
  title: "Hyrox — Programa oficial",
  description:
    "Único Hyrox Box certificado en Cuajimalpa. Programa de 12 semanas, simulacros cronometrados, coaches especializados. Reserva tu clase Hyrox.",
};

const hyroxCoaches = INSTRUCTORS.filter((i) =>
  i.specialty.toLowerCase().includes("hyrox") ||
  i.specialty.toLowerCase().includes("funcional")
).slice(0, 3);

export default function HyroxPage() {
  return (
    <>
      {/* Hero full-bleed */}
      <section className="relative bg-ink text-paper overflow-hidden min-h-[80vh] flex items-end">
        <div className="absolute inset-0 opacity-60">
          <Image
            src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=2400&q=85"
            alt="Atleta Hyrox en competencia"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        </div>
        <div className="container-app relative pt-24 pb-16 md:pb-24 w-full">
          <div className="max-w-4xl">
            <Reveal>
              <Eyebrow light number="01">
                {HYROX.hero.eyebrow}
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-8 font-display text-[clamp(5rem,18vw,16rem)] leading-[0.85] tracking-tight">
                {HYROX.hero.display}
              </h1>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-8 text-lg md:text-xl leading-relaxed text-paper/80 max-w-2xl">
                {HYROX.hero.subhead}
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <div className="mt-12 flex flex-wrap gap-3">
                <Button href="#programa" variant="primary" size="lg">
                  Conocer programa
                </Button>
                <Button href="#clases-hyrox" variant="outlineLight" size="lg">
                  Reservar clase
                  <ArrowUpRight className="size-4" strokeWidth={1.75} />
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee
        items={["Sled Push", "Burpee Broad Jump", "Wall Balls", "Sandbag Lunges", "Farmers Carry", "Sled Pull"]}
        variant="dark"
      />

      {/* What is Hyrox */}
      <section className="bg-paper section-y">
        <div className="container-app">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <Reveal variants={scaleReveal} className="lg:col-span-6">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-ink">
                <Image
                  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=85"
                  alt="Estaciones funcionales Hyrox"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal variants={fadeUp} className="lg:col-span-6">
              <Eyebrow number="02">El formato</Eyebrow>
              <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
                {HYROX.what.title}
              </h2>
              <p className="mt-8 text-lg leading-relaxed text-mute max-w-xl">
                {HYROX.what.body}
              </p>
              <div className="mt-10 grid grid-cols-3 gap-6">
                {[
                  { num: "8", label: "Estaciones" },
                  { num: "8 km", label: "Carrera total" },
                  { num: "60'", label: "Tiempo objetivo" },
                ].map((s) => (
                  <div key={s.label} className="border-l-2 border-volt pl-4">
                    <p className="font-display text-3xl">{s.num}</p>
                    <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Program timeline */}
      <section id="programa" className="bg-bone section-y">
        <div className="container-app">
          <Reveal>
            <Eyebrow number="03">Programa 12 semanas</Eyebrow>
            <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight max-w-3xl">
              De cero a <span className="italic">race day</span>.
            </h2>
          </Reveal>

          <Reveal variants={stagger(0.12)} className="mt-16">
            <div className="grid md:grid-cols-3 gap-px bg-line">
              {HYROX.program.map((block, i) => (
                <Reveal
                  key={block.title}
                  variants={fadeUp}
                  className="bg-paper p-8 md:p-10 group hover:bg-volt transition-colors duration-500"
                >
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute group-hover:text-ink/70">
                    {block.weeks}
                  </p>
                  <p className="mt-2 font-display text-7xl text-ink/10 group-hover:text-ink/30 transition-colors">
                    0{i + 1}
                  </p>
                  <h3 className="font-display text-3xl mt-2 tracking-tight">
                    {block.title}
                  </h3>
                  <p className="text-sm text-mute group-hover:text-ink/80 leading-relaxed mt-4">
                    {block.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Hyrox classes (filtered) */}
      <section id="clases-hyrox" className="bg-paper section-y">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <Eyebrow number="04">Clases Hyrox</Eyebrow>
              <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight max-w-2xl">
                Reserva tu próxima sesión.
              </h2>
            </div>
            <p className="text-mute max-w-md">
              Solo clases Hyrox. Para todas las clases, ve a la agenda completa de Arcos.
            </p>
          </div>
        </div>
        <ScheduleGrid initialCategory="hyrox" hideFilter />
      </section>

      {/* Coaches Hyrox */}
      <section className="bg-bone section-y">
        <div className="container-app">
          <Eyebrow number="05">Coaches Hyrox</Eyebrow>
          <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
            Atletas que entrenan
            <br />
            <span className="italic">a atletas.</span>
          </h2>

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {hyroxCoaches.map((coach) => (
              <Reveal key={coach.name} variants={fadeUp} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-ink mb-4">
                  <Image
                    src={coach.image}
                    alt={coach.name}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="font-display text-2xl">{coach.name}</p>
                <p className="text-xs text-mute mt-1 font-mono uppercase tracking-wider">
                  {coach.specialty}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-paper section-y">
        <div className="container-app">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <Eyebrow number="06">Preguntas</Eyebrow>
              <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
                Lo que más
                <br />
                nos preguntan.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <Accordion items={HYROX.faqs} />
              <div className="mt-10">
                <Button
                  href={buildWhatsAppLink(WA_MESSAGES.hyrox)}
                  external
                  variant="dark"
                  size="lg"
                >
                  <MessageCircle className="size-4" strokeWidth={1.75} />
                  ¿Otra duda? Pregúntale al coach
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
