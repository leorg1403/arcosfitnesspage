import { Check, ArrowUpRight, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { PLANS } from "@/lib/memberships";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { fadeUp, stagger } from "@/lib/motion";

export function MembershipCards({ compact = false }: { compact?: boolean }) {
  return (
    <section className="bg-paper section-y">
      <div className="container-app">
        {!compact && (
          <div className="grid lg:grid-cols-12 gap-y-8 mb-16">
            <Reveal className="lg:col-span-7">
              <Eyebrow number="06">Membresías</Eyebrow>
              <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
                Tres formas
                <br />
                de pertenecer.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9 self-end">
              <p className="text-mute leading-relaxed mb-6">
                Sin contratos. Sin letras chiquitas. Cancela cuando quieras.
              </p>
              <Button href="/membresias" variant="link" size="md">
                Comparar planes
                <ArrowUpRight className="size-4" strokeWidth={1.75} />
              </Button>
            </Reveal>
          </div>
        )}

        <Reveal variants={stagger(0.1)}>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan, i) => (
              <Reveal
                key={plan.id}
                variants={fadeUp}
                className={cn(
                  "relative flex flex-col rounded-lg border p-8 transition-all duration-500",
                  plan.highlight
                    ? "bg-ink text-paper border-ink lg:scale-[1.02] lg:-translate-y-2"
                    : "bg-paper border-line hover:border-ink"
                )}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-8 inline-flex items-center bg-volt text-ink text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-display text-3xl">{plan.name}</h3>
                  <span
                    className={cn(
                      "font-mono text-[0.6875rem] uppercase tracking-[0.18em]",
                      plan.highlight ? "text-paper/50" : "text-mute"
                    )}
                  >
                    0{i + 1} / 03
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm",
                    plan.highlight ? "text-paper/60" : "text-mute"
                  )}
                >
                  {plan.tagline}
                </p>

                <div className="my-8 flex items-baseline gap-2">
                  <span className="font-display text-5xl">
                    ${plan.price.toLocaleString("es-MX")}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs uppercase tracking-wider",
                      plan.highlight ? "text-paper/50" : "text-mute"
                    )}
                  >
                    MXN/mes
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex gap-3 text-sm">
                      <Check
                        className={cn(
                          "size-4 mt-0.5 shrink-0",
                          plan.highlight ? "text-volt" : "text-ink"
                        )}
                        strokeWidth={2}
                      />
                      <span
                        className={cn(
                          plan.highlight ? "text-paper/80" : "text-ink/85"
                        )}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  href={buildWhatsAppLink(WA_MESSAGES.membership(plan.name))}
                  external
                  variant={plan.highlight ? "primary" : "dark"}
                  size="md"
                  className="w-full"
                >
                  <MessageCircle className="size-4" strokeWidth={1.75} />
                  Hablar por WhatsApp
                </Button>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
