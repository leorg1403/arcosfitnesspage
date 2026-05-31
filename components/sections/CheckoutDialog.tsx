"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check } from "lucide-react";
import { type Plan, type PrePayment } from "@/lib/memberships";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/layout/SocialIcons";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import {
  StripeEmbeddedCheckoutFrame,
  STRIPE_CONFIGURED_CLIENT,
} from "./StripeEmbeddedCheckoutFrame";
import type { ConfirmResult } from "@/app/api/checkout/confirm/route";
import { easeExpo } from "@/lib/motion";

type CheckoutItem =
  | { kind: "plan"; data: Plan }
  | { kind: "prepayment"; data: PrePayment };

type Props = {
  item: CheckoutItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const Schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Mínimo 8 dígitos").max(40),
});
type FormValues = z.infer<typeof Schema>;

export function CheckoutDialog({ item, open, onOpenChange }: Props) {
  const [step, setStep] = useState<"form" | "payment" | "confirmed">("form");
  const [customer, setCustomer] = useState<FormValues | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmResult | null>(null);

  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  // Reset al cerrar — deferido para no disparar setState síncrono en el effect
  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => {
        setStep("form");
        setCustomer(null);
        setConfirmed(null);
        reset();
      }, 350); // espera que termine la animación de salida
      return () => clearTimeout(id);
    }
  }, [open, reset]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!item) return null;

  const itemId = item.kind === "plan" ? item.data.id : item.data.id;
  const itemName =
    item.kind === "plan"
      ? item.data.name
      : `Anticipado · ${item.data.label}`;
  const priceLine =
    item.kind === "plan"
      ? `$${item.data.price.toLocaleString("es-MX")} MXN${item.data.periodicity === "mensual" ? " / mes" : " · pago único"}`
      : `$${item.data.price.toLocaleString("es-MX")} MXN · pago único`;
  const subPrice =
    item.kind === "plan" && item.data.inscripcion
      ? `+ $${item.data.inscripcion.toLocaleString("es-MX")} de inscripción (1er pago)`
      : item.kind === "prepayment"
      ? `Ahorras $${(item.data.originalPrice - item.data.price).toLocaleString("es-MX")} (${item.data.discount})`
      : null;

  const totalCents =
    item.kind === "plan"
      ? (item.data.price + (item.data.inscripcion ?? 0)) * 100
      : item.data.price * 100;
  const totalLabel = `$${(totalCents / 100).toLocaleString("es-MX")} MXN`;

  const onFormSubmit = (values: FormValues) => {
    setCustomer(values);
    setStep("payment");
  };

  const handleConfirmed = (result: ConfirmResult) => {
    setConfirmed(result);
    setStep("confirmed");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: easeExpo }}
            className="relative bg-paper text-ink w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header (oculto en confirmed) ── */}
            {step !== "confirmed" && (
              <div className="px-7 md:px-10 pt-7 pb-5 border-b border-line-soft flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {step === "payment" && (
                    <button
                      onClick={() => setStep("form")}
                      aria-label="Volver"
                      className="text-concrete hover:text-ink transition-colors"
                    >
                      <ArrowLeft className="size-5" strokeWidth={1.75} />
                    </button>
                  )}
                  <div className="min-w-0">
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold">
                      {step === "form" ? "1 / 2 · Datos" : "2 / 2 · Pago seguro"}
                    </p>
                    <p className="font-display text-lg md:text-xl font-bold tracking-tight truncate">
                      {itemName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  aria-label="Cerrar"
                  className="relative size-5 text-ink/50 hover:text-ink transition-colors shrink-0"
                >
                  <span className="absolute top-1/2 left-0 w-full h-px bg-current rotate-45" />
                  <span className="absolute top-1/2 left-0 w-full h-px bg-current -rotate-45" />
                </button>
              </div>
            )}

            {/* ── Body ── */}
            <AnimatePresence mode="wait">
              {step === "confirmed" && confirmed ? (
                /* ── Paso confirmación ─────────────────────────── */
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: easeExpo }}
                  className="px-8 py-12 md:px-14 md:py-16"
                >
                  {/* Close button */}
                  <button
                    onClick={() => onOpenChange(false)}
                    aria-label="Cerrar"
                    className="absolute top-5 right-5 size-5 text-ink/40 hover:text-ink transition-colors"
                  >
                    <span className="absolute top-1/2 left-0 w-full h-px bg-current rotate-45 -translate-y-1/2" />
                    <span className="absolute top-1/2 left-0 w-full h-px bg-current -rotate-45 -translate-y-1/2" />
                  </button>

                  <div className="inline-flex items-center justify-center size-14 rounded-full bg-gold/15 text-gold mb-8">
                    <Check className="size-6" strokeWidth={2} />
                  </div>

                  <Eyebrow tone="gold" withLine>Confirmación</Eyebrow>

                  <h2 className="mt-5 font-display text-h2 tracking-[-0.03em] leading-[0.95] font-bold">
                    Bienvenido a{" "}
                    <span className="font-serif-italic text-gold">Arcos</span>.
                  </h2>

                  <p className="mt-6 text-base md:text-lg leading-relaxed text-ink/80">
                    Tu pago de{" "}
                    <span className="font-medium text-ink">{confirmed.planName}</span>{" "}
                    fue confirmado. Recibiste un email con el detalle.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-concrete">
                    El equipo te contacta en las próximas 24 horas para activar tu acceso
                    y agendar tu visita guiada.
                  </p>

                  <div className="mt-8 border-t border-line-soft" />
                  <div className="mt-8 flex flex-wrap items-center gap-6">
                    <button
                      onClick={() => onOpenChange(false)}
                      className="h-12 px-7 inline-flex items-center justify-center bg-ink text-paper font-medium tracking-tight hover:bg-graphite active:scale-[0.99] transition-all duration-300"
                    >
                      Explorar el club
                    </button>
                    <a
                      href="/clases-reservas"
                      className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep transition-colors"
                    >
                      Ver clases →
                    </a>
                  </div>
                </motion.div>
              ) : (
                /* ── Pasos form / payment ──────────────────────── */
                <motion.div
                  key="checkout"
                  initial={false}
                  className="px-7 md:px-10 py-8"
                >
                  {/* Price summary */}
                  <div className="flex items-baseline gap-3 flex-wrap mb-2">
                    <span className="font-display text-3xl md:text-4xl font-light tracking-tight">
                      {priceLine}
                    </span>
                  </div>
                  {subPrice && (
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-concrete mb-8">
                      {subPrice}
                    </p>
                  )}

                  {step === "form" ? (
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
                      <Field label="Nombre completo" required error={formState.errors.name?.message}>
                        <input
                          {...register("name")}
                          autoComplete="name"
                          placeholder="Tu nombre"
                          className="w-full bg-transparent border-b border-ink/15 focus:border-gold py-2 text-ink text-base outline-none transition-colors placeholder:text-ink/30"
                        />
                      </Field>
                      <Field label="Email" required error={formState.errors.email?.message}>
                        <input
                          {...register("email")}
                          type="email"
                          autoComplete="email"
                          placeholder="tu@email.com"
                          className="w-full bg-transparent border-b border-ink/15 focus:border-gold py-2 text-ink text-base outline-none transition-colors placeholder:text-ink/30"
                        />
                      </Field>
                      <Field label="Teléfono" required error={formState.errors.phone?.message}>
                        <input
                          {...register("phone")}
                          type="tel"
                          autoComplete="tel"
                          placeholder="55 1234 5678"
                          className="w-full bg-transparent border-b border-ink/15 focus:border-gold py-2 text-ink text-base outline-none transition-colors placeholder:text-ink/30"
                        />
                      </Field>
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="w-full h-13 px-7 py-3.5 inline-flex items-center justify-center bg-ink text-paper font-medium tracking-tight hover:bg-graphite active:scale-[0.99] transition-all duration-300"
                        >
                          Continuar al pago →
                        </button>
                        <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete text-center pt-3">
                          Total: {totalLabel}
                        </p>
                      </div>
                    </form>
                  ) : (
                    /* payment step — contenedor de altura fija para que el modal no cambie de tamaño */
                    <div className="flex flex-col gap-3">
                      {!STRIPE_CONFIGURED_CLIENT ? (
                        <div className="bg-bone border border-gold/30 px-5 py-4">
                          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-gold mb-2">
                            Modo demo
                          </p>
                          <p className="text-sm leading-relaxed text-ink/85">
                            Stripe no está configurado en este entorno todavía. La compra real se habilita
                            cuando el dueño conecte su cuenta. Por ahora, contacta directo:
                          </p>
                          <a
                            href={buildWhatsAppLink(WA_MESSAGES.membership(itemName))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-gold hover:text-gold-deep font-mono text-xs uppercase tracking-[0.18em]"
                          >
                            <WhatsappIcon className="size-4" />
                            Hablar por WhatsApp
                          </a>
                        </div>
                      ) : (
                        customer && (
                          /* Altura fija = espacio que ocupaban los 3 campos + botón en el form step */
                          <div className="h-[340px] overflow-y-auto">
                            <StripeEmbeddedCheckoutFrame
                              itemId={itemId}
                              itemKind={item.kind}
                              customer={customer}
                              onConfirmed={handleConfirmed}
                            />
                          </div>
                        )
                      )}
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-concrete text-center pt-1">
                        &#x1F512; Pago encriptado por Stripe
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete mb-1">
        {label}{required && <span className="text-gold ml-1">*</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}

export type { CheckoutItem };
