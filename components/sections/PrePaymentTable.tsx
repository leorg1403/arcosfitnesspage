import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/ui/Button";
import { PRE_PAYMENTS } from "@/lib/memberships";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { fadeUp } from "@/lib/motion";

export function PrePaymentTable() {
  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="container-wide">
        <div className="grid lg:grid-cols-12 gap-y-6 mb-10 md:mb-14 items-end">
          <Reveal variants={fadeUp} className="lg:col-span-7">
            <Eyebrow tone="gold" withLine>
              03 / Pagos por adelantado
            </Eyebrow>
            <h2 className="mt-5 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
              Paga adelantado,
              <br />
              <span className="font-serif-italic text-gold">ahorra más</span>.
            </h2>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.15} className="lg:col-span-4 lg:col-start-9 lg:pb-2">
            <p className="text-base text-concrete leading-relaxed max-w-sm">
              Cuatro paquetes anticipados con descuento progresivo. Sin inscripción adicional.
            </p>
          </Reveal>
        </div>

        <Reveal variants={fadeUp}>
          <div className="grid md:grid-cols-4 border-y border-line-soft">
            {PRE_PAYMENTS.map((pay, i) => (
              <div
                key={pay.id}
                className={
                  "p-7 md:p-8 flex flex-col" +
                  (i < PRE_PAYMENTS.length - 1 ? " md:border-r border-line-soft" : "") +
                  (i < PRE_PAYMENTS.length - 1 ? " border-b md:border-b-0" : "")
                }
              >
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold mb-3">
                  {pay.discount}
                </p>
                <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                  {pay.label}
                </h3>
                <div className="mt-5 mb-5">
                  <p className="font-display text-3xl md:text-4xl font-light tracking-tight">
                    ${pay.price.toLocaleString("es-MX")}
                  </p>
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete mt-1">
                    MXN · pago único
                  </p>
                  <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete line-through">
                    ${pay.originalPrice.toLocaleString("es-MX")} sin descuento
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <Button
                    href={buildWhatsAppLink(WA_MESSAGES.membership(`anticipado ${pay.label}`))}
                    external
                    variant="link"
                    size="sm"
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
