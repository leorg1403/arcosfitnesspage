"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { easeExpo } from "@/lib/motion";

/**
 * Ink-curtain page transition.
 *
 * En vez de desvanecer el contenido (lo que dejaba ver el fondo `paper` del
 * body → flash blanco al cargar y al navegar), montamos una cortina ink fija
 * que cubre la pantalla al cambiar de ruta y se funde revelando la página nueva.
 * El contenido nunca se vuelve transparente, así que el blanco del body jamás
 * aparece. Como el tope de todas las páginas es oscuro, el reveal es fluido.
 *
 * En la primera carga la cortina arranca invisible (no cubre el HTML ya
 * renderizado por SSR), evitando una pantalla negra si la hidratación es lenta.
 * El flag se voltea en un effect (post-commit), nunca durante el render, para
 * que SSR y la primera hidratación coincidan y no haya hydration mismatch.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    first.current = false;
  }, []);

  const isFirst = first.current;

  return (
    <>
      {children}
      <motion.div
        key={pathname}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] bg-ink"
        initial={{ opacity: isFirst ? 0 : 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: isFirst ? 0 : 0.5, ease: easeExpo }}
      />
    </>
  );
}
