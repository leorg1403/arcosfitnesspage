import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/ui/Button";
import { SEGMENT_PLANS, type Plan } from "@/lib/memberships";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { fadeUp } from "@/lib/motion";

export function SegmentPlans() {
  return (
    <section className="bg-bone section-y">
      <div className="container-wide">
        <Reveal variants={fadeUp} className="mb-12 md:mb-16">
          <Eyebrow tone="gold" withLine>
            02 / Más opciones
          </Eyebrow>
          <h2 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold max-w-3xl">
            Para cada <span className="font-serif-italic text-gold">ritmo</span>.
          </h2>
        </Reveal>

        <Reveal variants={fadeUp} delay={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line-soft border-y border-line-soft">
            {SEGMENT_PLANS.map((plan) => (
              <SegmentCard key={plan.id} plan={plan} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SegmentCard({ plan }: { plan: Plan }) {
  const isDropIn = plan.periodicity === "unico";
  return (
    <div className="bg-bone p-8 md:p-10 flex flex-col">
      <h3 className="font-display text-2xl md:text-3xl font-bold tracking-[-0.02em]">
        {plan.name}
      </h3>
      <p className="mt-2 text-sm text-concrete min-h-[3rem]">
        {plan.tagline}
      </p>

      <div className="mt-8 mb-8">
        <p className="font-display text-3xl md:text-4xl font-light tracking-tight">
          ${plan.price.toLocaleString("es-MX")}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-concrete mt-1">
          {isDropIn ? "MXN · pago único" : "MXN / mes"}
        </p>
        {plan.inscripcion && (
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-concrete mt-1">
            + ${plan.inscripcion.toLocaleString("es-MX")} inscripción
          </p>
        )}
      </div>

      <ul className="space-y-2 mb-8 flex-1">
        {plan.features.map((feat) => (
          <li key={feat} className="flex gap-2 text-xs text-ink/75 leading-relaxed">
            <span className="text-gold mt-0.5">●</span>
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <Button
        href={buildWhatsAppLink(WA_MESSAGES.membership(plan.name))}
        external
        variant="link"
        size="sm"
      >
        Hablar por WhatsApp
      </Button>
    </div>
  );
}
