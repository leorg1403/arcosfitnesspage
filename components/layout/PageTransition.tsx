"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { easeExpo } from "@/lib/motion";

/**
 * Curtain page transition.
 * - On route change, an ink panel sweeps in from the bottom covering the screen,
 *   then sweeps out upward revealing the new page.
 * - Duration ~900ms total.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: easeExpo }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
