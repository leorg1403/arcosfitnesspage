"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";

function getMessageForPath(pathname: string): string {
  if (pathname.startsWith("/membresias")) return WA_MESSAGES.generic;
  if (pathname.startsWith("/hyrox")) return WA_MESSAGES.hyrox;
  if (pathname.startsWith("/clases")) return WA_MESSAGES.visit;
  return WA_MESSAGES.generic;
}

export function WhatsAppFAB() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShowLabel(true), 1500);
    const t2 = setTimeout(() => setShowLabel(false), 6500);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [show, pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
          className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-30 flex items-center gap-3"
        >
          <AnimatePresence>
            {showLabel && (
              <motion.span
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="hidden sm:flex items-center bg-ink text-paper text-sm font-medium px-4 py-2 rounded-full shadow-xl"
              >
                Hablar con el dueño
                <span className="ml-2 text-volt">→</span>
              </motion.span>
            )}
          </AnimatePresence>

          <a
            href={buildWhatsAppLink(getMessageForPath(pathname))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hablar por WhatsApp con Arcos Fitness"
            className="group relative inline-flex size-14 sm:size-16 items-center justify-center rounded-full bg-volt text-ink animate-volt-pulse hover:scale-110 active:scale-95 transition-transform duration-300"
          >
            {/* WhatsApp glyph (SVG path para fidelidad) */}
            <svg
              viewBox="0 0 24 24"
              className="size-7 sm:size-8"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
