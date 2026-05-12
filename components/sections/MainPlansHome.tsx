import { ChevronDown } from "lucide-react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/ui/Button";
import { WhatsappIcon } from "@/components/layout/SocialIcons";
import { MAIN_PLANS, MAIN_COMPARISON, type Plan } from "@/lib/memberships";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { fadeUp } from "@/lib/motion";

type Props = {
  /** Mostrar el header con eyebrow + headline + cta a /membresias */
  showHeader?: boolean;
  /** Número del eyebrow */
  number?: string;
  /** Mostrar link "Ver todas las membresías" al final (home) */
  showAllLink?: boolean;
  tone?: "paper" | "bone";
};

export function MainPlansHome({
  showHeader = true,
  number = "04",
  showAllLink = true,
  tone = "paper",
}: Props) {
  const bg = tone === "bone" ? "bg-bone" : "bg-paper";

  // En home (showAllLink=true) → cierre con "Dos formas de pertenecer" + link a /membresias
  // En /membresias (showAllLink=false) → encuadre abierto que invita a seguir scrolleando
  const isHome = showAllLink;

  return (
    <section className={cn("py-16 md:py-20", bg)}>
      <div className="container-wide">
        {showHeader && (
          <div className="mb-10 md:mb-14 grid lg:grid-cols-12 gap-y-6 items-end">
            <Reveal variants={fadeUp} className="lg:col-span-7">
              <Eyebrow tone="gold" withLine>
                {number} / {isHome ? "Membresías" : "Las principales"}
              </Eyebrow>
              {isHome ? (
                <h2 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
                  Dos formas
                  <br />
                  de <span className="font-serif-italic text-gold">pertenecer</span>.
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
              />
            ))}
          </div>
        </Reveal>

        {showAllLink && (
          <Reveal variants={fadeUp} delay={0.25} className="mt-14">
            <Button href="/membresias" variant="link" size="md">
              Ver todas las membresías
            </Button>
          </Reveal>
        )}

        {/* Hint de continuidad en /membresias: invita a seguir scrolleando */}
        {!showAllLink && (
          <Reveal variants={fadeUp} delay={0.25} className="mt-12 md:mt-14">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-concrete">
                <span className="text-gold">—</span>&nbsp;&nbsp;Más opciones según tu ritmo
              </p>
              <ChevronDown
                className="size-5 text-gold animate-scroll-hint"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  index,
  showDivider,
}: {
  plan: Plan;
  index: number;
  showDivider: boolean;
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
          const isUnique = isGold && idx === 0; // primer feature en Gold es el diferenciador
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

      <Button
        href={buildWhatsAppLink(WA_MESSAGES.membership(plan.name))}
        external
        variant={isGold ? "linkGold" : "link"}
        size="md"
      >
        <WhatsappIcon className="size-3.5 shrink-0" />
        Hablar por WhatsApp
      </Button>
    </div>
  );
}
