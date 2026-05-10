import { Car, Lock, Wifi, Coffee, Smartphone, ShoppingBag, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { COMMON_AMENITIES } from "@/lib/memberships";
import { fadeUp, stagger } from "@/lib/motion";

const ICONS: Record<string, LucideIcon> = {
  Car, Lock, Wifi, Coffee, Smartphone, ShoppingBag,
};

export function CommonAmenities() {
  return (
    <section className="bg-bone section-y">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-y-8 mb-16">
          <Reveal className="lg:col-span-7">
            <Eyebrow number="03">Incluido en todos los planes</Eyebrow>
            <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
              Lo básico,
              <br />
              <span className="italic">cubierto.</span>
            </h2>
          </Reveal>
        </div>

        <Reveal variants={stagger(0.06)}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-line">
            {COMMON_AMENITIES.map((a) => {
              const Icon = ICONS[a.icon] ?? Lock;
              return (
                <Reveal
                  key={a.label}
                  variants={fadeUp}
                  className="bg-paper p-6 md:p-8 group hover:bg-paper transition-all duration-500 flex flex-col items-start gap-6"
                >
                  <Icon className="size-6 text-ink" strokeWidth={1.5} />
                  <p className="font-medium text-sm leading-tight">{a.label}</p>
                </Reveal>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
