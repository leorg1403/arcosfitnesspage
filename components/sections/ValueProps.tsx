import { Users, Dumbbell, Zap, Droplets, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { VALUE_PROPS } from "@/lib/content";
import { stagger, fadeUp } from "@/lib/motion";

const ICONS: Record<string, LucideIcon> = { Users, Dumbbell, Zap, Droplets };

export function ValueProps() {
  return (
    <section className="bg-paper section-y">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          <Reveal className="lg:col-span-5">
            <Eyebrow number="02">Por qué Arcos</Eyebrow>
            <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
              No es solo
              <br />
              entrenar.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7 self-end">
            <p className="text-lg leading-relaxed text-mute max-w-xl">
              Cuatro pilares que definen lo que pasa cuando entras al club. Desde la primera vez
              que te recibimos hasta el día que decides quedarte.
            </p>
          </Reveal>
        </div>

        <Reveal variants={stagger(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
          {VALUE_PROPS.map((prop) => {
            const Icon = ICONS[prop.icon] ?? Users;
            return (
              <Reveal
                key={prop.title}
                variants={fadeUp}
                className="bg-paper p-8 lg:p-10 group hover:bg-bone transition-colors duration-500"
              >
                <Icon className="size-7 text-ink mb-12" strokeWidth={1.5} />
                <h3 className="font-display text-2xl mb-3 tracking-tight">
                  {prop.title}
                </h3>
                <p className="text-sm text-mute leading-relaxed">{prop.body}</p>
              </Reveal>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
