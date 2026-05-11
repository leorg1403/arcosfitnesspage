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
  /** Mostrar link "Ver todas las membresías" al final */
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

  return (
    <section className={cn("section-y", bg)}>
      <div className="container-wide">
        {showHeader && (
          <div className="mb-16 md:mb-20 grid lg:grid-cols-12 gap-y-8 items-end">
            <Reveal variants={fadeUp} className="lg:col-span-7">
              <Eyebrow tone="gold" withLine>
                {number} / Membresías
              </Eyebrow>
              <h2 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
                Dos formas
                <br />
                de <span className="font-serif-italic text-gold">pertenecer</span>.
              </h2>
            </Reveal>
            <Reveal variants={fadeUp} delay={0.15} className="lg:col-span-4 lg:col-start-9 lg:pb-2">
              <p className="text-base text-concrete leading-relaxed max-w-sm">
                {MAIN_COMPARISON.difference.body}
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
        "relative p-8 md:p-10 lg:p-12",
        showDivider && "md:border-r border-gold/30",
        "border-b md:border-b-0 border-line-soft last:border-b-0"
      )}
    >
      {/* Top label */}
      <div className="flex items-baseline justify-between mb-4">
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
      <p className="mt-3 text-sm text-concrete">{plan.tagline}</p>

      <div className="my-10 flex items-baseline gap-3 flex-wrap">
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

      <ul className="space-y-3 mb-12">
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
