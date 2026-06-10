"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { PRE_PAYMENTS, type PrePayment } from "@/lib/memberships";
import { CheckoutDialog, type CheckoutItem } from "./CheckoutDialog";
import { fadeUp } from "@/lib/motion";
import { pixel } from "@/lib/pixel";

export function PrePaymentTable() {
  const [item, setItem] = useState<CheckoutItem | null>(null);
  const [open, setOpen] = useState(false);

  const openCheckout = (p: PrePayment) => {
    setItem({ kind: "prepayment", data: p });
    pixel.viewContent(p.label);
    setOpen(true);
  };

  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="container-wide">
        <div className="grid lg:grid-cols-12 gap-y-6 mb-10 md:mb-14 items-end">
          <Reveal variants={fadeUp} className="lg:col-span-7">
            <h2 className="font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold">
              Cuatro paquetes anticipados
              <br />
              <span className="font-serif-italic text-gold">para tu conveniencia</span>.
            </h2>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.15} className="lg:col-span-4 lg:col-start-9 lg:pb-2">
            <p className="text-base text-concrete leading-relaxed max-w-sm">
              No te preocupes por estar pagando mensualmente.
            </p>
          </Reveal>
        </div>

        <Reveal variants={fadeUp}>
          <div className="grid md:grid-cols-4 gap-4 md:gap-6">
            {PRE_PAYMENTS.map((pay) => (
              <PrePaymentCard
                key={pay.id}
                pay={pay}
                onBuy={() => openCheckout(pay)}
              />
            ))}
          </div>
        </Reveal>
      </div>

      <CheckoutDialog item={item} open={open} onOpenChange={setOpen} />
    </section>
  );
}

const PREPAYMENT_FEATURES = [
  "Acceso a todas las instalaciones",
  "Acceso a todas las clases",
  "1er Análisis Inbody",
  "Descuento del 20% en restaurante LIVE AQUA®",
];

function PrePaymentCard({
  pay,
  onBuy,
}: {
  pay: PrePayment;
  onBuy: () => void;
}) {
  return (
    <div
      className="p-7 md:p-8 flex flex-col border border-line-soft transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-gold"
    >
      <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
        {pay.label}
      </h3>

      <div className="mt-5">
        <p className="font-display text-3xl md:text-4xl font-light tracking-tight">
          ${pay.price.toLocaleString("es-MX")}
        </p>
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete mt-1">
          MXN · pago único
        </p>
      </div>

      <ul className="mt-6 pt-5 border-t border-line-soft space-y-3">
        {PREPAYMENT_FEATURES.map((feat) => (
          <li key={feat} className="flex items-start gap-3 text-sm leading-relaxed text-concrete">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-concrete/60" aria-hidden />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <button
          onClick={onBuy}
          className="h-11 px-6 inline-flex items-center justify-center bg-ink text-paper font-medium tracking-tight text-sm hover:bg-graphite active:scale-[0.99] transition-all duration-300"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  );
}
