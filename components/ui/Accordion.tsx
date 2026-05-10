"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type Item = { q: string; a: string };

export function Accordion({
  items,
  className,
}: {
  items: Item[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="group flex w-full items-center justify-between gap-6 py-6 md:py-7 text-left transition-colors hover:bg-bone -mx-4 px-4"
              aria-expanded={isOpen}
            >
              <span className="font-display text-xl md:text-2xl tracking-tight">
                {it.q}
              </span>
              <span
                className={cn(
                  "shrink-0 inline-flex size-9 items-center justify-center rounded-full border border-ink/15 transition-all duration-500",
                  isOpen
                    ? "bg-ink text-paper rotate-45"
                    : "text-ink group-hover:border-ink"
                )}
              >
                <Plus className="size-4" strokeWidth={1.75} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 md:pb-7 pr-16 text-base leading-relaxed text-mute max-w-3xl">
                    {it.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
