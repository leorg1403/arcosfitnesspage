"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { type Plan, type PrePayment } from "@/lib/memberships";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/layout/SocialIcons";
import {
  StripeEmbeddedCheckoutFrame,
  STRIPE_CONFIGURED_CLIENT,
} from "./StripeEmbeddedCheckoutFrame";
import { cn } from "@/lib/cn";
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
  const [step, setStep] = useState<"form" | "payment">("form");
  const [customer, setCustomer] = useState<FormValues | null>(null);

  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  // Reset al cerrar / cambiar item
  useEffect(() => {
    if (!open) {
      setStep("form");
      setCustomer(null);
      reset();
    }
  }, [open, reset]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
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

  const onFormSubmit = (values: FormValues) => {
    setCustomer(values);
    setStep("payment");
  };

  const totalCents =
    item.kind === "plan"
      ? (item.data.price + (item.data.inscripcion ?? 0)) * 100
      : item.data.price * 100;

  const totalLabel = `$${(totalCents / 100).toLocaleString("es-MX")} MXN`;

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
            className="relative bg-paper text-ink w-full max-w-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-paper z-10 px-7 md:px-10 pt-7 pb-5 border-b border-line-soft flex items-center justify-between gap-4">
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

            {/* Body */}
            <div className="px-7 md:px-10 py-8">
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
                <div className="space-y-5">
                  {/* Banner demo si Stripe no está configurado */}
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
                        href={buildWhatsAppLink(
                          WA_MESSAGES.membership(itemName)
                        )}
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
                      <StripeEmbeddedCheckoutFrame
                        itemId={itemId}
                        itemKind={item.kind}
                        customer={customer}
                      />
                    )
                  )}
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-concrete text-center pt-2">
                    🔒 Pago encriptado por Stripe
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete mb-1">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}

// Helpful re-export for callers
export type { CheckoutItem };
