"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { WhatsappIcon } from "./SocialIcons";

function getMessageForPath(pathname: string): string {
  if (pathname.startsWith("/hyrox")) return WA_MESSAGES.hyrox;
  if (pathname.startsWith("/clases")) return WA_MESSAGES.visit;
  return WA_MESSAGES.generic;
}

export function WhatsAppFAB() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
          href={buildWhatsAppLink(getMessageForPath(pathname))}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hablar por WhatsApp con Arcos Fitness"
          className="group fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-30 inline-flex size-12 sm:size-14 items-center justify-center rounded-full bg-graphite border border-gold/40 text-gold animate-gold-pulse hover:bg-gold hover:text-ink hover:scale-105 active:scale-95 transition-all duration-500"
        >
          <WhatsappIcon className="size-5 sm:size-6" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
