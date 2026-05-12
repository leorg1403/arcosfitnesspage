"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { type ClassItem, DAY_LABELS } from "@/lib/classes";
import { ReservaForm } from "./ReservaForm";
import { easeExpo } from "@/lib/motion";

type Props = {
  cls: ClassItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReservaDrawer({ cls, open, onOpenChange }: Props) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && cls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => onOpenChange(false)}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: easeExpo }}
            className="relative bg-graphite text-paper w-full max-w-4xl max-h-[92vh] overflow-y-auto md:overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button — X simple con hover rotation */}
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar"
              className="group absolute top-5 right-5 z-20 inline-flex items-center justify-center size-9 text-paper hover:text-gold transition-colors duration-300"
            >
              <span className="relative size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90">
                <span className="absolute top-1/2 left-0 w-full h-px bg-current rotate-45" />
                <span className="absolute top-1/2 left-0 w-full h-px bg-current -rotate-45" />
              </span>
            </button>

            {/* Layout: foto+meta a la izquierda, form a la derecha (en desktop) */}
            <div className="grid md:grid-cols-2">
              {/* Photo + meta column */}
              <div className="relative bg-ink min-h-[220px] md:min-h-[560px] flex flex-col justify-end overflow-hidden">
                <Image
                  src={cls.image}
                  alt={cls.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />
                <div className="relative px-7 md:px-9 py-7 md:py-9">
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold mb-4">
                    Detalle de clase
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] leading-tight text-paper">
                    {cls.name}
                  </h2>
                  <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-gold">
                    {DAY_LABELS[cls.day]} · {cls.time}
                  </p>
                  <p className="mt-3 text-sm text-paper/70">
                    con <span className="text-paper font-medium">{cls.instructor}</span>
                  </p>
                  <p className="text-sm text-paper/70">
                    {cls.duration} min · {cls.room} · {cls.level}
                  </p>
                </div>
              </div>

              {/* Form column */}
              <div className="md:overflow-y-auto md:max-h-[92vh]">
                <ReservaForm cls={cls} onSuccess={() => {}} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
