"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { HOME_HERO } from "@/lib/content";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { easePremium } from "@/lib/motion";

export function Hero() {
  const lines = HOME_HERO.display.split("\n");

  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="container-app pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          {/* Texto */}
          <div className="col-span-12 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easePremium }}
            >
              <Eyebrow number="01">{HOME_HERO.eyebrow}</Eyebrow>
            </motion.div>

            <h1 className="mt-8 font-display text-display leading-[0.92] tracking-tight">
              {lines.map((line, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.15 + i * 0.12,
                    duration: 0.9,
                    ease: easePremium,
                  }}
                  className="block"
                >
                  {i === lines.length - 1 ? (
                    <>
                      <span className="italic text-ink/90">
                        {line.replace(".", "")}
                      </span>
                      <span className="text-volt">.</span>
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: easePremium }}
              className="mt-8 max-w-xl text-base md:text-lg leading-relaxed text-mute"
            >
              {HOME_HERO.subhead}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7, ease: easePremium }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Button
                href={buildWhatsAppLink(WA_MESSAGES.visit)}
                external
                variant="primary"
                size="lg"
              >
                <MessageCircle className="size-4" strokeWidth={1.75} />
                {HOME_HERO.primaryCTA.label}
              </Button>
              <Button
                href={HOME_HERO.secondaryCTA.href}
                variant="outline"
                size="lg"
              >
                {HOME_HERO.secondaryCTA.label}
                <ArrowUpRight className="size-4" strokeWidth={1.75} />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-14 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="size-9 rounded-full ring-2 ring-paper overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt=""
                      width={72}
                      height={72}
                      className="object-cover h-full w-full"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-medium">
                  +800 miembros activos
                </p>
                <p className="text-mute font-mono text-xs">
                  Cuajimalpa, CDMX
                </p>
              </div>
            </motion.div>
          </div>

          {/* Foto */}
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: easePremium, delay: 0.2 }}
            className="col-span-12 lg:col-span-5 lg:translate-y-4"
          >
            <div className="relative aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-lg bg-bone">
              <Image
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85"
                alt="Atleta entrenando en Arcos Fitness"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              {/* Overlay tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute left-4 bottom-4 right-4 flex items-end justify-between"
              >
                <div className="bg-paper/95 backdrop-blur px-4 py-3 rounded-md max-w-[55%]">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute">
                    Hoy · 18:30
                  </p>
                  <p className="text-sm font-medium mt-0.5">
                    Hyrox Strength · Carlos M.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-volt text-ink px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider">
                  <span className="size-1.5 rounded-full bg-ink animate-pulse" />
                  En vivo
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative number bottom-right */}
      <div className="hidden md:block absolute right-6 bottom-6 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-mute">
        Est. 2018
      </div>
    </section>
  );
}
