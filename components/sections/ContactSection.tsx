"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { ParallaxImage } from "@/components/primitives/ParallaxImage";
import { SplitHeadline } from "@/components/primitives/SplitHeadline";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Field } from "@/components/primitives/Field";
import { submitLead } from "@/lib/leads";
import { heroStagger, fadeUp, easeExpo } from "@/lib/motion";
import { useInViewSafe } from "@/lib/useInViewSafe";
import { cn } from "@/lib/cn";

const Schema = z.object({
  firstName: z.string().min(2, "Nombre requerido").max(80),
  lastName: z.string().min(2, "Apellidos requeridos").max(80),
  email: z.string().email("Email inválido"),
  message: z.string().min(10, "Cuéntanos un poco más").max(1000),
});
type FormValues = z.infer<typeof Schema>;

type Props = {
  image?: string;
  eyebrow?: string;
  headline?: string[];
  italicWord?: string;
  body?: string | null;
};

export function ContactSection({
  image = "/images/visita-bg.jpeg",
  eyebrow = "Contacto",
  headline = ["¿En qué te", "podemos ayudar?"],
  italicWord = "ayudar?",
  body = "Agenda una visita, resuelve una duda o pide información sobre las membresías.",
}: Props) {
  const [ref, shown] = useInViewSafe<HTMLDivElement>();
  const [submitted, setSubmitted] = useState(false);
  // Honeypot anti-bot como estado controlado (igual que ReservaForm).
  const [honeypot, setHoneypot] = useState("");

  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { firstName: "", lastName: "", email: "", message: "" },
  });

  const onSubmit = async (values: FormValues) => {
    // La acción SIEMPRE devuelve ok; el usuario nunca sabe de dedupe/rate-limit.
    await submitLead({ ...values, website: honeypot });
    reset();
    setHoneypot("");
    setSubmitted(true);
  };

  const inputClass =
    "w-full bg-transparent border-b border-paper/15 focus:border-gold py-2 text-paper text-base outline-none transition-colors placeholder:text-paper/25";

  return (
    <section className="relative w-full overflow-hidden bg-ink text-paper min-h-[88svh] flex items-end">
      <ParallaxImage
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full"
        sizes="100vw"
        strength={0.15}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-ink via-ink/75 to-ink/55" />

      <motion.div
        ref={ref}
        variants={heroStagger}
        initial="hidden"
        animate={shown ? "visible" : "hidden"}
        className="container-wide relative pt-32 md:pt-40 pb-10 md:pb-28 w-full"
      >
        <div className="grid lg:grid-cols-12 gap-y-12 lg:gap-x-16 items-start">
          {/* Columna izquierda — copy editorial */}
          <div className="lg:col-span-5">
            <motion.div variants={fadeUp}>
              <Eyebrow tone="gold" withLine>
                {eyebrow}
              </Eyebrow>
            </motion.div>

            <div className="mt-8">
              <SplitHeadline
                lines={headline}
                italicWord={italicWord}
                size="headline"
                tone="paper"
              />
            </div>

            {body && (
              <motion.p
                variants={fadeUp}
                className="mt-6 text-base md:text-lg leading-relaxed text-paper/70 max-w-md"
              >
                {body}
              </motion.p>
            )}
          </div>

          {/* Columna derecha — form */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-6 lg:col-start-7 w-full"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.4, ease: easeExpo } }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                  noValidate
                >
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

                  <div className="grid sm:grid-cols-2 gap-6">
                    <Field
                      label="Nombre"
                      required
                      error={formState.errors.firstName?.message}
                    >
                      <input
                        {...register("firstName")}
                        autoComplete="given-name"
                        placeholder="Tu nombre"
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Apellidos"
                      required
                      error={formState.errors.lastName?.message}
                    >
                      <input
                        {...register("lastName")}
                        autoComplete="family-name"
                        placeholder="Tus apellidos"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Email"
                    required
                    error={formState.errors.email?.message}
                  >
                    <input
                      {...register("email")}
                      type="email"
                      autoComplete="email"
                      placeholder="tu@email.com"
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Mensaje"
                    required
                    error={formState.errors.message?.message}
                  >
                    <textarea
                      {...register("message")}
                      rows={4}
                      placeholder="¿Cómo te podemos ayudar?"
                      className={cn(inputClass, "resize-none")}
                    />
                  </Field>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={formState.isSubmitting}
                      className={cn(
                        "w-full sm:w-auto h-12 px-10 inline-flex items-center justify-center bg-gold text-ink font-medium tracking-tight",
                        "hover:bg-gold-soft active:scale-[0.99] transition-all duration-300",
                        "disabled:opacity-60 disabled:pointer-events-none"
                      )}
                    >
                      {formState.isSubmitting ? "Enviando…" : "Enviar mensaje"}
                    </button>
                    {/* Aviso simplificado en punto de recolección (LFPDPPP). */}
                    <p className="mt-3 text-[0.65rem] leading-relaxed text-paper/40">
                      Al enviar aceptas nuestro{" "}
                      <a
                        href="/aviso-de-privacidad"
                        className="underline underline-offset-2 hover:text-gold transition-colors"
                      >
                        Aviso de Privacidad
                      </a>
                      .
                    </p>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: easeExpo } }}
                  className="flex flex-col items-start gap-4 py-8"
                >
                  <div className="inline-flex size-12 items-center justify-center rounded-full border border-gold/40 text-gold">
                    <Check strokeWidth={1.5} className="size-5" />
                  </div>
                  <p className="font-display text-2xl md:text-3xl font-bold tracking-tight text-paper">
                    Recibimos tu mensaje.
                  </p>
                  <p className="text-base text-paper/70 max-w-md leading-relaxed">
                    Un asesor del club te contacta en menos de 24 hrs.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
