"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { TESTIMONIOS } from "@/lib/content";
import { cn } from "@/lib/cn";
import { easePremium } from "@/lib/motion";

export function Testimonials() {
  const [active, setActive] = useState(0);
  const item = TESTIMONIOS[active];

  return (
    <section className="bg-bone section-y">
      <div className="container-app">
        <Eyebrow number="07">Comunidad</Eyebrow>
        <div className="mt-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={item.author}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: easePremium }}
                className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight"
              >
                <span className="text-volt">&ldquo;</span>
                {item.quote}
                <span className="text-volt">&rdquo;</span>
              </motion.blockquote>
            </AnimatePresence>

            <div className="mt-12 flex items-center justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.author}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-4"
                >
                  <div className="size-12 rounded-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.author}
                      width={96}
                      height={96}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.author}</p>
                    <p className="text-xs font-mono uppercase tracking-wider text-mute">
                      {item.role}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center gap-2">
                {TESTIMONIOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Testimonio ${i + 1}`}
                    className={cn(
                      "h-1 transition-all duration-500 rounded-full",
                      i === active ? "w-12 bg-ink" : "w-6 bg-ink/20 hover:bg-ink/40"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.author}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: easePremium }}
                className="relative aspect-[3/4] overflow-hidden rounded-md bg-ink"
              >
                <Image
                  src={item.image.replace("w=400", "w=1200")}
                  alt={item.author}
                  fill
                  sizes="(min-width: 1024px) 28vw, 80vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
