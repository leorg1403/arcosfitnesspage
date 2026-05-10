"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle } from "lucide-react";
import { NAV } from "@/lib/content";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500",
          scrolled
            ? "bg-paper/80 backdrop-blur-xl border-b border-line-soft"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="container-app flex h-20 items-center justify-between">
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
                  className="relative px-4 py-2 text-sm font-medium text-ink/80 hover:text-ink transition-colors"
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-0.5 h-[2px] bg-volt"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              href={buildWhatsAppLink(WA_MESSAGES.generic)}
              external
              variant="dark"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <MessageCircle className="size-4" strokeWidth={1.75} />
              WhatsApp
            </Button>
            <button
              type="button"
              className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-20" aria-hidden />

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-ink text-paper"
          >
            <div className="container-app flex h-20 items-center justify-between">
              <Logo light />
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-paper/10"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
              >
                <X className="size-5" strokeWidth={1.75} />
              </button>
            </div>
            <nav className="container-app pt-12">
              <ul className="flex flex-col gap-1">
                {NAV.map((item, i) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-baseline justify-between gap-4 border-b border-paper/10 py-6 font-display text-4xl sm:text-5xl tracking-tight transition-colors",
                          active ? "text-volt" : "text-paper hover:text-volt"
                        )}
                      >
                        <span>{item.label}</span>
                        <span className="font-mono text-xs text-paper/40 group-hover:text-volt">
                          0{i + 1}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12"
              >
                <Button
                  href={buildWhatsAppLink(WA_MESSAGES.generic)}
                  external
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <MessageCircle className="size-4" strokeWidth={1.75} />
                  Hablar por WhatsApp
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
