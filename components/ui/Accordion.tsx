"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { easeExpo } from "@/lib/motion";

type Item = { q: string; a: ReactNode };

export function Accordion({
  items,
  className,
  tone = "ink",
}: {
  items: Item[];
  className?: string;
  tone?: "ink" | "paper";
}) {
  const [open, setOpen] = useState<number | null>(0);

  const lineColor = tone === "paper" ? "border-paper/15" : "border-ink/10";
  const textColor = tone === "paper" ? "text-paper" : "text-ink";
  const muteColor = tone === "paper" ? "text-paper/60" : "text-concrete";

  return (
    <div className={cn("border-t", lineColor, className)}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={cn("border-b", lineColor)}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className={cn(
                "group flex w-full items-start justify-between gap-8 py-7 text-left transition-colors",
                textColor,
                "hover:text-gold"
              )}
              aria-expanded={isOpen}
            >
              <span className="font-display text-xl md:text-2xl tracking-tight font-medium">
                {it.q}
              </span>
              <span
                className={cn(
                  "relative shrink-0 w-5 h-5 mt-2 transition-transform duration-500",
                  isOpen && "rotate-45"
                )}
                aria-hidden
              >
                <span className={cn("absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-current")} />
                <span className={cn("absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-current")} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: easeExpo }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "pb-8 pr-12 text-base leading-relaxed max-w-3xl",
                      muteColor
                    )}
                  >
                    {it.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
