"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, CalendarX } from "lucide-react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { easeExpo } from "@/lib/motion";
import { CLASSES, DAY_LABELS } from "@/lib/classes";
import { GYM_HOURS_BY_DAY } from "@/lib/content";
import { cancelReservation } from "@/app/actions/reservations";

/**
 * Modal de cancelación de reserva.
 * Param de URL: ?cancel=<token firmado>  (link del correo de confirmación).
 * Muestra la reserva, pide confirmar y al confirmar llama al server action que
 * avisa a Arcos por correo. La firma se verifica en el servidor.
 */
type Status = "idle" | "loading" | "done" | "error";

function decodeClassId(token: string): string | null {
  try {
    const body = token.split(".")[0];
    if (!body) return null;
    const b64 = body.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(json) as { classId?: string };
    return typeof payload.classId === "string" ? payload.classId : null;
  } catch {
    return null;
  }
}

export function CancelModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const token = searchParams.get("cancel");
  const isOpen = Boolean(token);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Lock body scroll mientras está abierto.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset al cambiar/limpiar el token.
  useEffect(() => {
    setStatus("idle");
    setErrorMsg("");
  }, [token]);

  const close = () => router.replace(pathname);

  // Detalle de la clase (solo para mostrar; el servidor re-deriva y valida).
  const classId = token ? decodeClassId(token) : null;
  const cls = classId ? CLASSES.find((c) => c.id === classId) : null;
  const className = cls?.name ?? "tu clase";
  const classDay = cls
    ? `${DAY_LABELS[cls.day]}${cls.dateLabel ? ` ${cls.dateLabel}` : ""}`
    : "";
  const classTime = cls
    ? cls.category === "open-gym"
      ? GYM_HOURS_BY_DAY[cls.day]
      : cls.time
    : "";

  const onConfirm = async () => {
    if (!token || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await cancelReservation(token);
      if (res.ok) {
        setStatus("done");
      } else {
        setErrorMsg(res.error);
        setStatus("error");
      }
    } catch {
      setErrorMsg("No se pudo procesar la cancelación. Intenta de nuevo.");
      setStatus("error");
    }
  };

  const done = status === "done";
  const loading = status === "loading";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cancel-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={close}
        >
          <motion.div
            key="cancel-panel"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: easeExpo }}
            className="relative bg-paper text-ink w-full max-w-xl px-8 py-10 md:px-14 md:py-14"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cerrar */}
            <button
              onClick={close}
              aria-label="Cerrar"
              className="absolute top-5 right-5 size-5 text-ink/40 hover:text-ink transition-colors"
            >
              <span className="absolute top-1/2 left-0 w-full h-px bg-current rotate-45 -translate-y-1/2" />
              <span className="absolute top-1/2 left-0 w-full h-px bg-current -rotate-45 -translate-y-1/2" />
            </button>

            <div className="inline-flex items-center justify-center size-14 rounded-full bg-gold/15 text-gold mb-8">
              {done ? (
                <Check className="size-6" strokeWidth={2} />
              ) : (
                <CalendarX className="size-6" strokeWidth={1.75} />
              )}
            </div>

            {done ? (
              <>
                <Eyebrow tone="gold" withLine>
                  Reserva cancelada
                </Eyebrow>
                <h2 className="mt-5 font-display text-h2 tracking-[-0.03em] leading-[0.95] font-bold">
                  Tu reserva ha sido{" "}
                  <span className="font-serif-italic text-gold">cancelada</span>.
                </h2>
                <p className="mt-6 text-base md:text-lg leading-relaxed text-ink/80">
                  Liberamos tu lugar{className ? ` en ${className}` : ""}
                  {classDay ? ` · ${classDay}` : ""}. Avisamos al club.
                </p>
                <div className="mt-8 border-t border-line-soft" />
                <div className="mt-8">
                  <button
                    onClick={close}
                    className="h-12 px-7 inline-flex items-center justify-center bg-ink text-paper font-medium tracking-tight hover:bg-graphite active:scale-[0.99] transition-all duration-300"
                  >
                    Volver al horario
                  </button>
                </div>
              </>
            ) : (
              <>
                <Eyebrow tone="gold" withLine>
                  Cancelar reserva
                </Eyebrow>
                <h2 className="mt-5 font-display text-h2 tracking-[-0.03em] leading-[0.95] font-bold">
                  ¿Cancelar tu reserva
                  {cls ? (
                    <>
                      {" "}
                      de{" "}
                      <span className="font-serif-italic text-gold">
                        {className}
                      </span>
                    </>
                  ) : null}
                  ?
                </h2>
                <p className="mt-6 text-base md:text-lg leading-relaxed text-ink/80">
                  {classDay && `${classDay} · ${classTime}. `}Avisaremos al club
                  que ya no podrás asistir. Esta acción no se puede deshacer.
                </p>

                {status === "error" && (
                  <p className="mt-4 text-sm leading-relaxed text-red-600">
                    {errorMsg}
                  </p>
                )}

                <div className="mt-8 border-t border-line-soft" />
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="h-12 px-7 inline-flex items-center justify-center gap-2 bg-ink text-paper font-medium tracking-tight hover:bg-graphite active:scale-[0.99] transition-all duration-300 disabled:opacity-70"
                  >
                    {loading && (
                      <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                    )}
                    {loading ? "Cancelando…" : "Confirmar cancelación"}
                  </button>
                  <button
                    onClick={close}
                    className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep transition-colors"
                  >
                    No, conservar
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
