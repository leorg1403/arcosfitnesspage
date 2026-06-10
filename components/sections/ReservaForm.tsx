"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { DAY_LABELS } from "@/lib/classes";
import { FITNESS_APPS, FITNESS_APP_LABEL, type FitnessAppValue } from "@/lib/fitness-apps";
import type { BookableClass } from "@/lib/types";
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
import { createReservation } from "@/app/actions/reservations";
import { cn } from "@/lib/cn";
import { pixel } from "@/lib/pixel";

const Schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Mínimo 8 dígitos").max(40),
});
type FormValues = z.infer<typeof Schema>;

type Step = "membership" | "fitnessApp" | "form" | "method" | "payment" | "confirmed";
type ConfirmedKind = "online" | "reception";

type Props = {
  cls: BookableClass;
  onSuccess?: () => void;
  /** Llamado cuando la confirmación está lista — para cerrar el drawer desde el padre */
  onConfirmed?: (result: ConfirmResult) => void;
};

export function ReservaForm({ cls, onConfirmed }: Props) {
  const [step, setStep] = useState<Step>(cls.onlineOnly ? "form" : "membership");
  // member = acceso incluido, sin cobro (socio O app de fitness).
  const [member, setMember] = useState<boolean | null>(null);
  // app de fitness por la que entra (TotalPass/Fitpass/Wellhub). null = socio/visitante.
  const [fitnessApp, setFitnessApp] = useState<FitnessAppValue | null>(null);
  const [customer, setCustomer] = useState<FormValues | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmResult | null>(null);
  const [confirmedKind, setConfirmedKind] = useState<ConfirmedKind>("online");
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  // Código de reserva (últimos 6) para mostrar al cliente en la confirmación.
  const [reservationCode, setReservationCode] = useState<string | null>(null);
  // Solo afirmamos "te enviamos un correo" si de verdad se entregó al cliente.
  const [clientEmailSent, setClientEmailSent] = useState(false);
  // Honeypot anti-bot como estado controlado (leer estado en el handler es seguro
  // para el React Compiler; un ref leído vía handleSubmit se marca como acceso en render).
  const [honeypot, setHoneypot] = useState("");

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const isOpenGym = cls.isOpenGym;
  // Clase que cobra sí o sí (ej. Master Class): salta socio/recepción → pago en línea.
  const onlineOnly = Boolean(cls.onlineOnly);
  const price = cls.priceMxn;
  const priceLine = `$${price.toLocaleString("es-MX")} MXN`;
  const priceDesc = isOpenGym ? "Open Gym · pago único" : "Clase individual · pago único";

  const dayLabel = cls.dateLabel;

  const classMeta: ClassMeta = {
    className: cls.name,
    classDay: cls.dateLabel,
    classTime: cls.startTime,
    classInstructor: cls.instructor,
    price,
  };

  const waLink = buildWhatsAppLink(
    isOpenGym
      ? WA_MESSAGES.openGym(DAY_LABELS[cls.day].toLowerCase())
      : WA_MESSAGES.classBooking({
          name: cls.name,
          day: DAY_LABELS[cls.day].toLowerCase(),
          time: cls.startTime,
          date: cls.dateLabel,
        })
  );

  /* Reservar y pagar en recepción — vía Server Action (sin Stripe).
     Para socios: sin cobro (validan membresía en recepción).
     Para visitantes: pendiente a pago en recepción. */
  const handleReception = async (
    cust: FormValues,
    opts: { member: boolean; fitnessApp: FitnessAppValue | null }
  ) => {
    if (reserving) return;
    setReserving(true);
    setReserveError(null);
    try {
      const result = await createReservation({
        templateId: cls.templateId,
        date: cls.date,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        member: opts.member,
        fitnessApp: opts.fitnessApp ?? undefined,
        website: honeypot,
      });
      if (!result.ok) {
        setReserveError(
          result.error || "No se pudo apartar tu lugar. Intenta de nuevo o escríbenos."
        );
        return;
      }
      setClientEmailSent(result.clientEmailSent);
      setReservationCode(result.shortCode || null);
      setConfirmedKind("reception");
      pixel.schedule();
      setStep("confirmed");
    } catch {
      setReserveError("No se pudo apartar tu lugar. Intenta de nuevo o escríbenos.");
    } finally {
      setReserving(false);
    }
  };

  const onFormSubmit = (values: FormValues) => {
    setCustomer(values);
    setReserveError(null);
    pixel.completeRegistration();
    if (member) {
      handleReception(values, { member: true, fitnessApp });
    } else {
      setStep("method");
    }
  };

  const handleConfirmed = (result: ConfirmResult) => {
    setConfirmed(result);
    setConfirmedKind("online");
    pixel.schedule();
    setStep("confirmed");
    onConfirmed?.(result);
  };

  /* ── Confirmed step ─────────────────────────────────────── */
  if (step === "confirmed") {
    const reception = confirmedKind === "reception";
    const memberReception = reception && member === true;
    // App de fitness: acceso incluido pero validado por el pase, no por membresía.
    const appLabel = fitnessApp ? FITNESS_APP_LABEL[fitnessApp] : null;
    return (
      <div className="px-7 md:px-9 py-10 md:py-14 flex flex-col min-h-[400px] md:min-h-[560px]">
        <div className="inline-flex items-center justify-center size-14 rounded-full bg-gold/15 text-gold mb-8">
          <Check className="size-6" strokeWidth={2} />
        </div>

        <Eyebrow tone="gold" withLine>
          {appLabel
            ? `Reserva vía ${appLabel}`
            : memberReception
            ? "Reserva de socio"
            : reception
            ? "Lugar apartado"
            : "Reserva confirmada"}
        </Eyebrow>

        <h3 className="mt-5 font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] leading-tight text-paper">
          {isOpenGym ? (
            <>Te esperamos en tu <span className="text-gold">Open Gym</span>.</>
          ) : (
            <>Te esperamos en tu clase de <span className="text-gold">{cls.name}</span>.</>
          )}
        </h3>

        {reservationCode && (
          <div className="mt-5 inline-flex items-center gap-3 self-start border border-gold/30 bg-gold/[0.06] px-4 py-2.5">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold">
              Código
            </span>
            <span className="font-mono text-lg tracking-[0.25em] text-paper">
              {reservationCode}
            </span>
          </div>
        )}

        {reception ? (
          memberReception ? (
            <>
              <p className="mt-5 text-sm md:text-base leading-relaxed text-paper/75">
                Apartamos tu lugar para el{" "}
                <span className="text-paper font-medium">{dayLabel}</span>.
                {clientEmailSent && " Te enviamos un correo con tu confirmación."}
              </p>
              <p className="mt-2 text-sm text-paper/60">
                {appLabel
                  ? `Tu acceso vía ${appLabel} no tiene cobro; presenta tu pase en recepción. Llega 10 minutos antes para registro.`
                  : "Tu clase está incluida en tu membresía, sin cobro. Llega 10 minutos antes para registro."}
              </p>
            </>
          ) : (
            <>
              <p className="mt-5 text-sm md:text-base leading-relaxed text-paper/75">
                Apartamos tu lugar para el{" "}
                <span className="text-paper font-medium">{dayLabel}</span>.
                {clientEmailSent && " Te enviamos un correo con tu confirmación."}
              </p>
              <p className="mt-2 text-sm text-paper/60">
                Completa tu pago de <span className="text-paper">{priceLine}</span> en
                recepción al llegar. Llega 10 minutos antes para registro.
              </p>
            </>
          )
        ) : (
          <>
            <p className="mt-5 text-sm md:text-base leading-relaxed text-paper/75">
              Tu reserva de{" "}
              <span className="text-paper font-medium">{confirmed?.planName ?? cls.name}</span>{" "}
              fue confirmada. Recibiste un email con el detalle.
            </p>
            <p className="mt-2 text-sm text-paper/50">
              Llega 10 minutos antes para registro.
            </p>
          </>
        )}
      </div>
    );
  }

  /* ── Membership / Form / Method / Payment steps ──────────── */
  const stepLabel =
    step === "membership"
      ? "Reserva"
      : step === "fitnessApp"
      ? "Tu acceso"
      : step === "form"
      ? "Tus datos"
      : step === "method"
      ? "Cómo quieres pagar"
      : "Pago seguro";

  const goBack = () => {
    setReserveError(null);
    if (step === "payment") setStep("method");
    else if (step === "method") setStep("form");
    else if (step === "form" || step === "fitnessApp") {
      // vuelve a la pregunta inicial en estado neutro
      setMember(null);
      setFitnessApp(null);
      setStep("membership");
    }
  };

  const errorBlock = reserveError && (
    <div className="border border-red-500/30 bg-red-500/5 px-4 py-3">
      <p className="text-xs leading-relaxed text-red-300">{reserveError}</p>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-gold hover:text-gold-soft font-mono text-[0.65rem] uppercase tracking-[0.18em]"
      >
        <WhatsappIcon className="size-3.5" />
        Reservar por WhatsApp
      </a>
    </div>
  );

  return (
    <div className="px-7 md:px-9 py-5 md:py-6 flex flex-col min-h-0 md:min-h-[560px]">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-3">
        {!(step === "membership" || (onlineOnly && step === "form")) && (
          <button
            onClick={goBack}
            aria-label="Volver"
            className="text-paper/50 hover:text-paper transition-colors"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
          </button>
        )}
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold">
          {stepLabel}
        </p>
      </div>

      {/* Price — para socios se muestra incluido (sin cobro) */}
      <div className="mb-3">
        {member === true ? (
          <>
            <span className="font-display text-3xl font-light tracking-tight text-paper/40 line-through">
              {priceLine}
            </span>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-gold mt-1">
              {fitnessApp
                ? `Incluido · ${FITNESS_APP_LABEL[fitnessApp]}`
                : step === "fitnessApp"
                ? "Acceso incluido · sin cobro"
                : "Incluido en tu membresía"}
            </p>
          </>
        ) : (
          <>
            <span className="font-display text-3xl font-light tracking-tight text-paper">
              {priceLine}
            </span>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-concrete mt-1">
              {priceDesc}
            </p>
          </>
        )}
      </div>

      {step === "membership" && (
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="mb-1">
            <p className="font-display text-xl font-semibold tracking-tight text-paper">
              ¿Cómo entras a tu clase?
            </p>
            <p className="mt-1 text-sm text-paper/60">Así procesamos tu reserva correctamente.</p>
          </div>

          {/* Soy socio */}
          <button
            type="button"
            onClick={() => {
              setMember(true);
              setFitnessApp(null);
              setReserveError(null);
              setStep("form");
            }}
            className="group relative text-left border border-gold/30 bg-gold/[0.06] px-5 py-2.5 transition-colors hover:border-gold/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold tracking-tight text-paper">
                  Soy socio
                </p>
                <p className="mt-1 text-sm leading-relaxed text-paper/65">
                  Tu acceso está incluido, sin cobro.
                </p>
              </div>
              <ArrowRight
                className="size-4 shrink-0 mt-1 text-gold transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </div>
          </button>

          {/* Vengo de una app de fitness (TotalPass / Fitpass / Wellhub) */}
          <button
            type="button"
            onClick={() => {
              setMember(true);
              setFitnessApp(null);
              setReserveError(null);
              setStep("fitnessApp");
            }}
            className="group relative text-left border border-gold/30 bg-gold/[0.06] px-5 py-2.5 transition-colors hover:border-gold/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold tracking-tight text-paper">
                  Vengo de una app de fitness
                </p>
                <p className="mt-0.5 text-xs font-medium text-gold/90">
                  TotalPass · Fitpass · Wellhub
                </p>
                <p className="mt-1 text-sm leading-relaxed text-paper/65">
                  Tu pase cubre la clase.
                </p>
              </div>
              <ArrowRight
                className="size-4 shrink-0 mt-1 text-gold transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </div>
          </button>

          {/* Aún no soy socio */}
          <button
            type="button"
            onClick={() => {
              setMember(false);
              setFitnessApp(null);
              setReserveError(null);
              setStep("form");
            }}
            className="group relative text-left border border-paper/15 px-5 py-2.5 transition-colors hover:border-gold/60 active:bg-paper/[0.03]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold tracking-tight text-paper">
                  Aún no soy socio
                </p>
                <p className="mt-1 text-sm leading-relaxed text-paper/65">
                  Reserva tu lugar y elige cómo pagar.
                </p>
              </div>
              <ArrowRight
                className="size-4 shrink-0 mt-1 text-paper/50 transition-all duration-300 group-hover:text-gold group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </div>
          </button>

          <div className="mt-auto pt-4 border-t border-paper/10">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-paper/55 hover:text-gold text-xs font-mono uppercase tracking-[0.18em] transition-colors"
            >
              <WhatsappIcon className="size-3.5" />
              ¿Dudas? Contáctanos
            </a>
          </div>
        </div>
      )}

      {step === "fitnessApp" && (
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="mb-1">
            <p className="font-display text-xl font-semibold tracking-tight text-paper">
              ¿De qué app vienes?
            </p>
            <p className="mt-1 text-sm text-paper/60">
              La registramos para validar tu pase en recepción.
            </p>
          </div>

          {FITNESS_APPS.map((app) => (
            <button
              key={app.value}
              type="button"
              onClick={() => {
                setMember(true);
                setFitnessApp(app.value);
                setReserveError(null);
                setStep("form");
              }}
              className="group relative text-left border border-paper/15 px-5 py-3.5 transition-colors hover:border-gold/60 active:bg-paper/[0.03]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-lg font-semibold tracking-tight text-paper">
                  {app.label}
                </p>
                <ArrowRight
                  className="size-4 shrink-0 text-paper/50 transition-all duration-300 group-hover:text-gold group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </div>
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-paper/10">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-paper/55 hover:text-gold text-xs font-mono uppercase tracking-[0.18em] transition-colors"
            >
              <WhatsappIcon className="size-3.5" />
              ¿Tu app no aparece? Escríbenos
            </a>
          </div>
        </div>
      )}

      {step === "form" && (
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4 flex-1">
          {/* Honeypot anti-bot — invisible para humanos, debe quedar vacío */}
          <input
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] top-0 h-0 w-0 opacity-0"
          />

          <div className="space-y-3">
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

          {member && (
            <p className="text-sm leading-relaxed text-paper/60">
              {fitnessApp
                ? `Solo apartas tu lugar — tu acceso vía ${FITNESS_APP_LABEL[fitnessApp]} se valida en recepción, sin cobro.`
                : "Solo apartas tu lugar — tu clase está incluida en tu membresía, sin cobro."}
            </p>
          )}

          <div className="pt-4 space-y-3 mt-auto">
            {member && errorBlock}
            <button
              type="submit"
              disabled={reserving}
              className={cn(
                "w-full h-12 px-7 inline-flex items-center justify-center bg-gold text-ink font-medium tracking-tight",
                "hover:bg-gold-soft active:scale-[0.99] transition-all duration-300 disabled:opacity-70"
              )}
            >
              {onlineOnly
                ? "Continuar al pago →"
                : member
                ? reserving
                  ? "Apartando tu lugar…"
                  : "Reservar mi lugar →"
                : "Continuar →"}
            </button>
            {/* Aviso simplificado en punto de recolección (LFPDPPP). */}
            <p className="text-[0.65rem] leading-relaxed text-paper/40 text-center">
              Al continuar aceptas nuestro{" "}
              <a
                href="/aviso-de-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-gold transition-colors"
              >
                Aviso de Privacidad
              </a>
              .
            </p>
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
      )}

      {step === "method" && (
        <div className="flex flex-col gap-3 flex-1">
          {/* Pagar en recepción */}
          <button
            type="button"
            onClick={() => customer && handleReception(customer, { member: false, fitnessApp: null })}
            disabled={reserving}
            className={cn(
              "group relative text-left border border-paper/15 px-5 py-4 transition-colors",
              "hover:border-gold/60 active:bg-paper/[0.03] disabled:cursor-default disabled:opacity-70"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold tracking-tight text-paper">
                  Pagar en recepción
                </p>
                <p className="mt-1 text-sm leading-relaxed text-paper/65">
                  Aparta tu lugar ahora y paga al llegar al club.
                </p>
              </div>
              <span className="shrink-0 mt-1 text-gold">
                {reserving ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                ) : (
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                )}
              </span>
            </div>
            <span className="mt-1.5 inline-block font-mono text-[0.55rem] uppercase tracking-[0.22em] text-paper/40">
              {reserving ? "Apartando tu lugar…" : "Sin tarjeta"}
            </span>
          </button>

          {/* Pagar en línea */}
          <button
            type="button"
            onClick={() => { pixel.initiateCheckout(); setStep("payment"); }}
            disabled={reserving}
            className="group relative text-left border border-gold/30 bg-gold/[0.06] px-5 py-4 transition-colors hover:border-gold/60 disabled:opacity-70"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold tracking-tight text-paper">
                  Pagar en línea
                </p>
                <p className="mt-1 text-sm leading-relaxed text-paper/65">
                  Asegura tu lugar al instante con tarjeta.
                </p>
              </div>
              <ArrowRight
                className="size-4 shrink-0 mt-1 text-gold transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </div>
            <span className="mt-1.5 inline-block font-mono text-[0.55rem] uppercase tracking-[0.22em] text-gold/80">
              Inmediato · pago seguro
            </span>
          </button>

          {errorBlock}

          {/* Atajo: si en realidad es socio (no aplica en eventos que todos pagan) */}
          {!onlineOnly && (
          <div className="mt-auto pt-4 border-t border-paper/10">
            <p className="text-xs leading-relaxed text-paper/50">
              ¿En realidad eres socio?{" "}
              <button
                type="button"
                onClick={() => {
                  setMember(true);
                  setReserveError(null);
                  setStep("form");
                }}
                className="text-gold/85 hover:text-gold transition-colors"
              >
                Resérvalo como socio →
              </button>
            </p>
          </div>
          )}
        </div>
      )}

      {step === "payment" && (
        /* payment step — tamaño fijo para no mover el modal */
        <div className="flex flex-col flex-1 gap-4">
          {!STRIPE_CONFIGURED_CLIENT ? (
            <div className="bg-paper/5 border border-gold/30 px-5 py-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-gold mb-2">
                Modo demo
              </p>
              <p className="text-sm leading-relaxed text-paper/80">
                El pago online se habilita cuando se conecte la cuenta de Stripe. Mientras
                tanto puedes apartar tu lugar y pagar en recepción, o contáctanos:
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
                  itemId={cls.templateId}
                  itemKind="class"
                  date={cls.date}
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
