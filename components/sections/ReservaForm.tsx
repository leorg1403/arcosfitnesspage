"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check } from "lucide-react";
import { type ClassItem, DAY_LABELS, getClassPrice } from "@/lib/classes";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/layout/SocialIcons";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Field } from "@/components/primitives/Field";
import {
  StripeEmbeddedCheckoutFrame,
  STRIPE_CONFIGURED_CLIENT,
  type ClassMeta,
} from "./StripeEmbeddedCheckoutFrame";
import type { ConfirmResult } from "@/app/api/checkout/confirm/route";
import { cn } from "@/lib/cn";

const Schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Mínimo 8 dígitos").max(40),
});
type FormValues = z.infer<typeof Schema>;

type Props = {
  cls: ClassItem;
  onSuccess?: () => void;
  /** Llamado cuando la confirmación está lista — para cerrar el drawer desde el padre */
  onConfirmed?: (result: ConfirmResult) => void;
};

export function ReservaForm({ cls, onConfirmed }: Props) {
  const [step, setStep] = useState<"form" | "payment" | "confirmed">("form");
  const [customer, setCustomer] = useState<FormValues | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmResult | null>(null);

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const price = getClassPrice(cls);
  const priceLine = `$${price.toLocaleString("es-MX")} MXN`;
  const priceDesc =
    cls.category === "open-gym" ? "Open Gym · pago único" : "Clase individual · pago único";

  const classMeta: ClassMeta = {
    className: cls.name,
    classDay: DAY_LABELS[cls.day],
    classTime: cls.time,
    classInstructor: cls.instructor,
    price,
  };

  const waLink = buildWhatsAppLink(
    cls.category === "open-gym"
      ? WA_MESSAGES.openGym(DAY_LABELS[cls.day].toLowerCase())
      : WA_MESSAGES.classBooking({
          name: cls.name,
          day: DAY_LABELS[cls.day].toLowerCase(),
          time: cls.time,
        })
  );

  const onFormSubmit = (values: FormValues) => {
    setCustomer(values);
    setStep("payment");
  };

  const handleConfirmed = (result: ConfirmResult) => {
    setConfirmed(result);
    setStep("confirmed");
    onConfirmed?.(result);
  };

  const isOpenGym = cls.category === "open-gym";

  /* ── Confirmed step ─────────────────────────────────────── */
  if (step === "confirmed" && confirmed) {
    return (
      <div className="px-7 md:px-9 py-10 md:py-14 flex flex-col min-h-[400px] md:min-h-[560px]">
        <div className="inline-flex items-center justify-center size-14 rounded-full bg-gold/15 text-gold mb-8">
          <Check className="size-6" strokeWidth={2} />
        </div>

        <Eyebrow tone="gold" withLine>Reserva confirmada</Eyebrow>

        <h3 className="mt-5 font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] leading-tight text-paper">
          {isOpenGym ? (
            <>Te esperamos en tu <span className="text-gold">Open Gym</span>.</>
          ) : (
            <>Te esperamos en tu clase de <span className="text-gold">{cls.name}</span>.</>
          )}
        </h3>

        <p className="mt-5 text-sm md:text-base leading-relaxed text-paper/75">
          Tu reserva de{" "}
          <span className="text-paper font-medium">{confirmed.planName}</span> fue
          confirmada. Recibiste un email con el detalle.
        </p>
        <p className="mt-2 text-sm text-paper/50">
          Llega 10 minutos antes para registro.
        </p>
      </div>
    );
  }

  /* ── Form / Payment steps ────────────────────────────────── */
  return (
    <div className="px-7 md:px-9 py-6 md:py-9 flex flex-col min-h-0 md:min-h-[560px]">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-4">
        {step === "payment" && (
          <button
            onClick={() => setStep("form")}
            aria-label="Volver"
            className="text-paper/50 hover:text-paper transition-colors"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
          </button>
        )}
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold">
          {step === "form" ? "1 / 2 · Tus datos" : "2 / 2 · Pago seguro"}
        </p>
      </div>

      {/* Price */}
      <div className="mb-5">
        <span className="font-display text-3xl md:text-4xl font-light tracking-tight text-paper">
          {priceLine}
        </span>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-concrete mt-1">
          {priceDesc}
        </p>
      </div>

      {step === "form" ? (
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4 flex-1">
          <div className="space-y-4">
            <Field label="Nombre completo" required error={formState.errors.name?.message}>
              <input
                {...register("name")}
                autoComplete="name"
                placeholder="Tu nombre"
                className="w-full bg-transparent border-b border-paper/15 focus:border-gold py-2 text-paper text-base outline-none transition-colors placeholder:text-paper/25"
              />
            </Field>
            <Field label="Email" required error={formState.errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full bg-transparent border-b border-paper/15 focus:border-gold py-2 text-paper text-base outline-none transition-colors placeholder:text-paper/25"
              />
            </Field>
            <Field label="Teléfono" required error={formState.errors.phone?.message}>
              <input
                {...register("phone")}
                type="tel"
                autoComplete="tel"
                placeholder="55 1234 5678"
                className="w-full bg-transparent border-b border-paper/15 focus:border-gold py-2 text-paper text-base outline-none transition-colors placeholder:text-paper/25"
              />
            </Field>
          </div>
          <div className="pt-5 space-y-3 mt-auto">
            <button
              type="submit"
              className={cn(
                "w-full h-12 px-7 inline-flex items-center justify-center bg-gold text-ink font-medium tracking-tight",
                "hover:bg-gold-soft active:scale-[0.99] transition-all duration-300"
              )}
            >
              Continuar al pago →
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-paper/55 hover:text-gold text-xs font-mono uppercase tracking-[0.18em] transition-colors py-1"
            >
              <WhatsappIcon className="size-3.5" />
              Contáctanos
            </a>
          </div>
        </form>
      ) : (
        /* payment step — tamaño fijo para no mover el modal */
        <div className="flex flex-col flex-1 gap-4">
          {!STRIPE_CONFIGURED_CLIENT ? (
            <div className="bg-paper/5 border border-gold/30 px-5 py-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-gold mb-2">
                Modo demo
              </p>
              <p className="text-sm leading-relaxed text-paper/80">
                El pago online se habilita cuando se conecte la cuenta de Stripe.
                Por ahora, contáctanos directo:
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-gold hover:text-gold-soft font-mono text-xs uppercase tracking-[0.18em]"
              >
                <WhatsappIcon className="size-4" />
                Hablar por WhatsApp
              </a>
            </div>
          ) : (
            customer && (
              <div className="overflow-y-auto flex-1">
                <StripeEmbeddedCheckoutFrame
                  itemId={cls.id}
                  itemKind="class"
                  customer={customer}
                  classMeta={classMeta}
                  onConfirmed={handleConfirmed}
                />
              </div>
            )
          )}
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-concrete/50 text-center pt-1 shrink-0">
            &#x1F512; Pago encriptado por Stripe
          </p>
        </div>
      )}
    </div>
  );
}

