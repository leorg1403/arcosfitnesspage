"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NAV } from "@/lib/content";
import { buildWhatsAppLink, messageForPath } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { WhatsappIcon } from "./SocialIcons";
import { cn } from "@/lib/cn";
import { easeExpo } from "@/lib/motion";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // iOS Safari ignora `overflow: hidden` en el body, así que el fondo seguía
  // scrolleando detrás del menú. Bloqueamos con `position: fixed` (técnica que
  // sí funciona en iOS) y restauramos la posición de scroll al cerrar.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const { body } = document;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      // Restaurar la posición SIN animación: el <html> tiene
      // scroll-behavior: smooth, que si no haría un scroll visible (la página
      // "se recorre") al cerrar el menú. Forzamos auto solo para este salto.
      const html = document.documentElement;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prevBehavior;
    };
  }, [open]);

  // Todas las páginas tienen hero full-bleed: el header siempre va sobre fondo oscuro
  // (transparente sobre hero oscuro, o bg-ink/85 al scrollear). Texto siempre paper.
  const lightMode = true;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        {/* Fondo glass como hijo ABSOLUTE. Safari 26 ya no respeta theme-color:
            tiñe la barra superior muestreando el background-color de elementos
            fixed/sticky cerca del borde, e IGNORA los hijos position:absolute de
            un fixed. Al mover el glass aquí, el <header> fixed no aporta color y
            Safari cae al fondo ink del root → status bar negra. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            scrolled
              ? "bg-ink/85 backdrop-blur-xl border-b border-charcoal"
              : "border-b border-transparent"
          )}
        />
        <div className="relative container-wide flex h-20 items-center justify-between">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative px-5 py-2 text-[0.8rem] font-medium tracking-wide uppercase transition-colors duration-500",
                    lightMode ? "text-paper/80 hover:text-paper" : "text-ink/70 hover:text-ink",
                    active && (lightMode ? "text-paper" : "text-ink")
                  )}
                >
                  <span className="font-mono text-[0.625rem] tracking-[0.2em] mr-2 opacity-50">
                    0{NAV.indexOf(item) + 1}
                  </span>
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      transition={{ type: "spring", stiffness: 200, damping: 30 }}
                      className="absolute left-5 right-5 -bottom-0.5 h-px bg-gold"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={buildWhatsAppLink(messageForPath(pathname))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={cn(
                "hidden sm:inline-flex items-center gap-2 text-[0.8rem] uppercase tracking-wide font-medium transition-colors duration-500",
                lightMode ? "text-paper/80 hover:text-gold" : "text-ink/70 hover:text-gold"
              )}
            >
              <WhatsappIcon className="size-4 text-gold" />
              WhatsApp
            </a>
            <button
              type="button"
              className={cn(
                "lg:hidden inline-flex h-11 w-11 items-center justify-center -mr-2",
                lightMode ? "text-paper" : "text-ink"
              )}
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="flex flex-col items-end gap-1.5">
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-3.5 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 h-[100dvh] overflow-y-auto overscroll-contain bg-ink text-paper"
          >
            <div className="container-app flex h-20 items-center justify-between">
              <Logo />
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center -mr-2"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
              >
                <span className="relative h-5 w-5">
                  <span className="absolute top-1/2 left-0 w-full h-px bg-paper rotate-45" />
                  <span className="absolute top-1/2 left-0 w-full h-px bg-paper -rotate-45" />
                </span>
              </button>
            </div>
            <nav className="container-app pt-12">
              <ul className="flex flex-col">
                {NAV.map((item, i) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.15 + i * 0.08,
                        duration: 0.8,
                        ease: easeExpo,
                      }}
                      className="border-b border-paper/10"
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-baseline justify-between gap-4 py-7 transition-colors duration-500",
                          active ? "text-gold" : "text-paper hover:text-gold"
                        )}
                      >
                        <span className="font-display text-4xl sm:text-5xl tracking-[-0.03em] font-medium">
                          {item.label}
                        </span>
                        <span className="font-mono text-xs text-paper/40 group-hover:text-gold">
                          0{i + 1}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.8, ease: easeExpo }}
                className="mt-16"
              >
                <a
                  href={buildWhatsAppLink(messageForPath(pathname))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-gold font-mono text-sm uppercase tracking-[0.2em]"
                >
                  <WhatsappIcon className="size-4" />
                  WhatsApp →
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
