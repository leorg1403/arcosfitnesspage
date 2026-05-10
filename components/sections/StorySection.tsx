import Image from "next/image";
import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { AnimatedCounter } from "@/components/primitives/AnimatedCounter";
import { ABOUT } from "@/lib/content";
import { fadeUp, scaleReveal } from "@/lib/motion";

export function StorySection() {
  return (
    <section className="bg-paper section-y">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <Reveal variants={fadeUp} className="lg:col-span-6 order-2 lg:order-1">
            <Eyebrow number="01">{ABOUT.story.eyebrow}</Eyebrow>
            <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
              {ABOUT.story.title}
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-mute max-w-xl">
              {ABOUT.story.body}
            </p>

            <div className="mt-12 grid grid-cols-3 gap-6">
              <Stat to={800} suffix="+" label="Miembros" />
              <Stat to={6} label="Años" />
              <Stat to={2400} suffix=" m²" label="Espacio" />
            </div>
          </Reveal>

          <Reveal variants={scaleReveal} className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-bone">
              <Image
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1600&q=85"
                alt="Equipo Arcos Fitness"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Stat({ to, suffix, label }: { to: number; suffix?: string; label: string }) {
  return (
    <div className="border-l-2 border-volt pl-4">
      <p className="font-display text-4xl">
        <AnimatedCounter to={to} suffix={suffix} />
      </p>
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute mt-1">
        {label}
      </p>
    </div>
  );
}
