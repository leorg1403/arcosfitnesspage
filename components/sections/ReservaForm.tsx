"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ClassItem, DAY_LABELS } from "@/lib/classes";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/layout/SocialIcons";
import { cn } from "@/lib/cn";

const Schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  email: z.string().email("Email inválido"),
  phone: z.string().max(40).optional().or(z.literal("")),
  message: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof Schema>;

type Props = {
  cls: ClassItem;
  onSuccess?: () => void;
};

export function ReservaForm({ cls }: Props) {
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitState("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: cls.id,
          className: cls.name,
          classDay: DAY_LABELS[cls.day],
          classTime: cls.time,
          classInstructor: cls.instructor,
          ...values,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al enviar la reserva");
      }
      setSubmitState("success");
    } catch (err) {
      setSubmitState("error");
      setErrorMsg(err instanceof Error ? err.message : "Algo salió mal");
    }
  };

  if (submitState === "success") {
    return (
      <div className="px-7 md:px-9 py-12 text-center min-h-[400px] md:min-h-[560px] flex flex-col items-center justify-center">
        <h3 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-gold mb-4">
          Reserva enviada.
        </h3>
        <p className="text-sm md:text-base text-paper/65 leading-relaxed max-w-xs">
          En caso de cancelación o cambio de horario, te avisamos por correo con
          anticipación.
        </p>
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete mt-8">
          Pago en mostrador al asistir
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-7 md:px-9 py-7 md:py-9">
      <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold mb-5">
        Solicitar reserva
      </p>

      <div className="space-y-4">
        <Field label="Nombre completo" required error={errors.name?.message}>
          <input
            {...register("name")}
            autoComplete="name"
            placeholder="Tu nombre"
            className="w-full bg-transparent border-b border-paper/15 focus:border-gold py-2 text-paper text-base outline-none transition-colors placeholder:text-paper/25"
          />
        </Field>

        <Field label="Email" required error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            className="w-full bg-transparent border-b border-paper/15 focus:border-gold py-2 text-paper text-base outline-none transition-colors placeholder:text-paper/25"
          />
        </Field>

        <Field label="Teléfono" error={errors.phone?.message}>
          <input
            {...register("phone")}
            type="tel"
            autoComplete="tel"
            placeholder="55 1234 5678"
            className="w-full bg-transparent border-b border-paper/15 focus:border-gold py-2 text-paper text-base outline-none transition-colors placeholder:text-paper/25"
          />
        </Field>

        <Field label="Mensaje" error={errors.message?.message}>
          <textarea
            {...register("message")}
            rows={2}
            placeholder="Opcional"
            className="w-full bg-transparent border-b border-paper/15 focus:border-gold py-2 text-paper text-sm outline-none transition-colors placeholder:text-paper/25 resize-none"
          />
        </Field>
      </div>

      {errorMsg && (
        <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded mt-4">
          {errorMsg}
        </p>
      )}

      <div className="pt-6 space-y-3">
        <button
          type="submit"
          disabled={submitState === "submitting"}
          className={cn(
            "w-full h-12 px-7 inline-flex items-center justify-center bg-gold text-ink font-medium tracking-tight",
            "hover:bg-gold-soft active:scale-[0.99] transition-all duration-300",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {submitState === "submitting" ? "Enviando..." : "Solicitar reserva"}
        </button>

        <a
          href={buildWhatsAppLink(
            cls.category === "open-gym"
              ? WA_MESSAGES.openGym(DAY_LABELS[cls.day].toLowerCase())
              : WA_MESSAGES.classBooking({
                  name: cls.name,
                  day: DAY_LABELS[cls.day].toLowerCase(),
                  time: cls.time,
                  instructor: cls.instructor,
                })
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-paper/55 hover:text-gold text-xs font-mono uppercase tracking-[0.18em] transition-colors py-1"
        >
          <WhatsappIcon className="size-3.5" />
          Contactar con un asesor
        </a>

        <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete text-center pt-1">
          Pago en mostrador al asistir
        </p>
      </div>
    </form>
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
      {error && <span className="block text-xs text-red-400 mt-1">{error}</span>}
    </label>
  );
}
