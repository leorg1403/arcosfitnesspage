"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/ui/Button";
import { MAIN_PLANS, MAIN_COMPARISON, type Plan } from "@/lib/memberships";
import { CheckoutDialog, type CheckoutItem } from "./CheckoutDialog";
import { cn } from "@/lib/cn";
import { fadeUp } from "@/lib/motion";

type Props = {
  /** Mostrar el header con eyebrow + headline + cta a /membresias */
  showHeader?: boolean;
  /** Mostrar link "Ver todas las membresías" al final (home) */
  showAllLink?: boolean;
  tone?: "paper" | "bone";
};

export function MainPlansHome({
  showHeader = true,
  showAllLink = true,
  tone = "paper",
}: Props) {
  const bg = tone === "bone" ? "bg-bone" : "bg-paper";

  const isHome = showAllLink;

  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null);
  const [open, setOpen] = useState(false);

  const openCheckout = (plan: Plan) => {
    setCheckoutItem({ kind: "plan", data: plan });
    setOpen(true);
  };

  return (
    <section className={cn("pt-16 pb-8 md:pt-20 md:pb-10", bg)}>
      <div className="container-wide">
        {showHeader && (
          <div className="mb-10 md:mb-14 grid lg:grid-cols-12 gap-y-6 items-end">
            <Reveal variants={fadeUp} className="lg:col-span-7">
              <Eyebrow tone="gold" withLine>
                {isHome ? "Membresías" : "Las principales"}
              </Eyebrow>
              {isHome ? (
                <h2 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
                  Tu llave
                  <br />
                  al <span className="font-serif-italic text-gold">club</span>.
                </h2>
              ) : (
                <h2 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
                  Empieza por
                  <br />
                  las <span className="font-serif-italic text-gold">esenciales</span>.
                </h2>
              )}
            </Reveal>
            <Reveal variants={fadeUp} delay={0.15} className="lg:col-span-4 lg:col-start-9 lg:pb-2">
              <p className="text-base text-concrete leading-relaxed max-w-sm">
                {isHome
                  ? MAIN_COMPARISON.difference.body
                  : "Las dos opciones más elegidas. Si tu vida pide otro ritmo, abajo hay opciones por horario y planes anticipados."}
              </p>
            </Reveal>
          </div>
        )}

        <Reveal variants={fadeUp} delay={0.1}>
          <div className="grid md:grid-cols-2 relative border-t border-line-soft">
            {MAIN_PLANS.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={i}
                showDivider={i === 0}
                onBuy={() => openCheckout(plan)}
              />
            ))}
          </div>
        </Reveal>

        {showAllLink && (
          <Reveal variants={fadeUp} delay={0.25} className="mt-14">
            <div className="flex flex-col items-center gap-6">
              <div className="text-center max-w-2xl">
                <p className="font-mono text-xs md:text-sm uppercase tracking-[0.18em] text-concrete">
                  ¿Buscas algo a tu medida?
                </p>
                <p className="mt-4 font-display text-2xl md:text-3xl font-semibold tracking-tight text-ink">
                  Hay un plan para <span className="font-serif-italic text-gold">cada vida</span>.
                </p>
              </div>
              <Button href="/membresias" variant="hairline" size="lg">
                Ver todas las membresías
              </Button>
            </div>
          </Reveal>
        )}

        {/* Hint de continuidad en /membresias: invita a seguir scrolleando */}
        {!showAllLink && (
          <Reveal variants={fadeUp} delay={0.25} className="mt-10">
            <div className="flex justify-center">
              <a
                href="#mas-opciones"
                className="group flex flex-col items-center gap-4"
              >
                <span className="font-display text-xl md:text-2xl font-semibold tracking-tight text-ink group-hover:text-gold transition-colors duration-500 text-center">
                  Hay <span className="font-serif-italic text-gold">más planes</span> según tu ritmo
                </span>
                <ChevronDown
                  className="size-9 text-gold animate-bounce-soft group-hover:animate-none group-hover:translate-y-1 transition-transform duration-500"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </a>
            </div>
          </Reveal>
        )}
      </div>

      <CheckoutDialog item={checkoutItem} open={open} onOpenChange={setOpen} />
    </section>
  );
}

function PlanCard({
  plan,
  index,
  showDivider,
  onBuy,
}: {
  plan: Plan;
  index: number;
  showDivider: boolean;
  onBuy: () => void;
}) {
  const isGold = plan.highlight;
  return (
    <div
      className={cn(
        "relative p-7 md:p-9 lg:p-10",
        showDivider && "md:border-r border-gold/30",
        "border-b md:border-b-0 border-line-soft last:border-b-0"
      )}
    >
      {/* Top label */}
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete">
          0{index + 1} / 02
        </span>
        {isGold && (
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold">
            — Con programa personalizado —
          </span>
        )}
      </div>

      <h3
        className={cn(
          "font-display text-4xl md:text-5xl font-bold tracking-[-0.03em] leading-[0.95]",
          isGold && "text-gold"
        )}
      >
        {plan.name}
      </h3>
      <p className="mt-2 text-sm text-concrete">{plan.tagline}</p>

      <div className="mt-6 mb-7 flex items-baseline gap-3 flex-wrap">
        <span className="font-display text-5xl md:text-6xl font-light tracking-tight">
          ${plan.price.toLocaleString("es-MX")}
        </span>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-concrete">
          MXN / mes
        </span>
        {plan.inscripcion && (
          <span className="block w-full font-mono text-[0.65rem] uppercase tracking-[0.22em] text-concrete mt-1">
            + ${plan.inscripcion.toLocaleString("es-MX")} de inscripción
          </span>
        )}
      </div>

      <ul className="space-y-2.5 mb-8">
        {plan.features.map((feat, idx) => {
          const isUnique = isGold && idx === 0;
          return (
            <li
              key={feat}
              className="flex gap-3 text-sm leading-relaxed"
            >
              <span
                className={cn(
                  "font-mono text-xs mt-1 shrink-0",
                  isUnique ? "text-gold" : "text-ink/40"
                )}
              >
                ●
              </span>
              <span className={cn(isUnique ? "text-ink font-medium" : "text-ink/80")}>
                {feat}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        onClick={onBuy}
        className={cn(
          "h-12 px-7 inline-flex items-center justify-center font-medium tracking-tight transition-all duration-300 active:scale-[0.99]",
          isGold
            ? "bg-gold text-ink hover:bg-gold-soft"
            : "bg-ink text-paper hover:bg-graphite"
        )}
      >
        Comprar {plan.name}
      </button>
    </div>
  );
}
