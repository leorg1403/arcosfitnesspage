"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { easeExpo } from "@/lib/motion";

/**
 * Modal de confirmación post-pago.
 * Params de URL:
 *   ?confirmed=1          → abre el modal
 *   &plan=XXX             → nombre del plan/clase completo
 *   &className=Funcional  → nombre corto de la clase (solo para clases)
 */
export function ConfirmationModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const confirmed = searchParams.get("confirmed");
  const planName = searchParams.get("plan") ?? "";
  const className = searchParams.get("className"); // solo para clases
  const isOpen = confirmed === "1";

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const close = () => router.replace(pathname);

  // ── Texto según contexto ────────────────────────────────────────────────
  const isClass = Boolean(className);
  const isOpenGym = className?.toLowerCase().includes("open gym");

  const body = isClass
    ? `Tu reserva de ${planName} fue confirmada. Recibiste un email con el detalle.`
    : `Tu pago de ${planName} fue confirmado. Recibiste un email con el detalle.`;

  const subtext = isClass
    ? "Llega 10 minutos antes para registro."
    : "El equipo te contacta en las próximas 24 horas para activar tu acceso y agendar tu visita guiada.";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirmation-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={close}
        >
          <motion.div
            key="confirmation-panel"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: easeExpo }}
            className="relative bg-paper text-ink w-full max-w-xl px-8 py-10 md:px-14 md:py-14"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={close}
              aria-label="Cerrar"
              className="absolute top-5 right-5 size-5 text-ink/40 hover:text-ink transition-colors"
            >
              <span className="absolute top-1/2 left-0 w-full h-px bg-current rotate-45 -translate-y-1/2" />
              <span className="absolute top-1/2 left-0 w-full h-px bg-current -rotate-45 -translate-y-1/2" />
            </button>

            {/* Check icon */}
            <div className="inline-flex items-center justify-center size-14 rounded-full bg-gold/15 text-gold mb-8">
              <Check className="size-6" strokeWidth={2} />
            </div>

            {/* Eyebrow */}
            <Eyebrow tone="gold" withLine>
              {isClass ? "Reserva confirmada" : "Confirmación"}
            </Eyebrow>

            {/* Headline */}
            <h2 className="mt-5 font-display text-h2 tracking-[-0.03em] leading-[0.95] font-bold">
              {isClass ? (
                isOpenGym ? (
                  <>
                    Te esperamos en tu{" "}
                    <span className="font-serif-italic text-gold">Open Gym</span>.
                  </>
                ) : (
                  <>
                    Te esperamos en tu clase de{" "}
                    <span className="font-serif-italic text-gold">{className}</span>.
                  </>
                )
              ) : (
                <>
                  Bienvenido a{" "}
                  <span className="font-serif-italic text-gold">Arcos</span>.
                </>
              )}
            </h2>

            {/* Body */}
            <p className="mt-6 text-base md:text-lg leading-relaxed text-ink/80">
              {body}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-concrete">
              {subtext}
            </p>

            {/* Divider */}
            <div className="mt-8 border-t border-line-soft" />

            {/* Acciones */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button
                onClick={close}
                className="h-12 px-7 inline-flex items-center justify-center bg-ink text-paper font-medium tracking-tight hover:bg-graphite active:scale-[0.99] transition-all duration-300"
              >
                {isClass ? "Ver el horario" : "Explorar el club"}
              </button>
              {isClass ? (
                <a
                  href="/membresias"
                  className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep transition-colors"
                >
                  Ver membresías →
                </a>
              ) : (
                <a
                  href="/clases-reservas"
                  className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep transition-colors"
                >
                  Ver clases →
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
