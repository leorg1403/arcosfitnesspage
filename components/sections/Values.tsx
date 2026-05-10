import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ABOUT } from "@/lib/content";
import { fadeUp, stagger } from "@/lib/motion";

export function Values() {
  return (
    <section className="bg-ink text-paper section-y">
      <div className="container-app">
        <Reveal>
          <Eyebrow light number="03">
            Valores
          </Eyebrow>
          <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight max-w-3xl">
            En lo que <span className="italic text-paper/85">creemos.</span>
          </h2>
        </Reveal>

        <Reveal variants={stagger(0.12)} className="mt-16">
          <div className="grid md:grid-cols-3 gap-px bg-paper/10">
            {ABOUT.values.map((v, i) => (
              <Reveal
                key={v.title}
                variants={fadeUp}
                className="bg-ink p-8 md:p-10 group hover:bg-ink-soft transition-colors duration-500"
              >
                <p className="font-display text-7xl text-paper/15 group-hover:text-volt transition-colors duration-500">
                  0{i + 1}
                </p>
                <h3 className="font-display text-3xl mt-6 tracking-tight">
                  {v.title}
                </h3>
                <p className="text-sm text-paper/70 leading-relaxed mt-4 max-w-xs">
                  {v.body}
                </p>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
