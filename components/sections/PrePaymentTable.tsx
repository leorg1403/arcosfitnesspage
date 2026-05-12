"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { PRE_PAYMENTS, type PrePayment } from "@/lib/memberships";
import { CheckoutDialog, type CheckoutItem } from "./CheckoutDialog";
import { fadeUp } from "@/lib/motion";

export function PrePaymentTable() {
  const [item, setItem] = useState<CheckoutItem | null>(null);
  const [open, setOpen] = useState(false);

  const openCheckout = (p: PrePayment) => {
    setItem({ kind: "prepayment", data: p });
    setOpen(true);
  };

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
              <PrePaymentCard
                key={pay.id}
                pay={pay}
                index={i}
                total={PRE_PAYMENTS.length}
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

function PrePaymentCard({
  pay,
  index,
  total,
  onBuy,
}: {
  pay: PrePayment;
  index: number;
  total: number;
  onBuy: () => void;
}) {
  const savings = pay.originalPrice - pay.price;
  const isLast = index === total - 1;
  return (
    <div
      className={
        "p-7 md:p-8 flex flex-col" +
        (!isLast ? " md:border-r border-line-soft border-b md:border-b-0" : "")
      }
    >
      <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold mb-3">
        {pay.discount}
      </p>
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

      <div className="mt-5 pt-4 border-t border-gold/30">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-concrete mb-1">
          Ahorras
        </p>
        <p className="font-display text-2xl md:text-3xl font-bold tracking-tight text-gold">
          ${savings.toLocaleString("es-MX")}
        </p>
        <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete/70 line-through">
          Antes ${pay.originalPrice.toLocaleString("es-MX")}
        </p>
      </div>

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
