"use client";

import { motion } from "framer-motion";
import { ParallaxImage } from "@/components/primitives/ParallaxImage";
import { SplitHeadline } from "@/components/primitives/SplitHeadline";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { easeExpo, heroStagger, fadeUp } from "@/lib/motion";

type Props = {
  image: string;
  alt: string;
  eyebrow: string;
  /** Líneas del headline */
  headline: string[];
  italicWord?: string;
  cta?: {
    label: string;
    href?: string;
    external?: boolean;
  };
  /** Tamaño del hero */
  height?: "full" | "tall" | "medium";
  /** Forza variante super-display para palabras tipo "HYROX" */
  displaySize?: "display" | "headline" | "mega";
  /** Posición del bloque de texto */
  align?: "bottom-left" | "bottom-center";
  /** Variante con foto en blanco y negro */
  monochrome?: boolean;
};

const heightMap = {
  full: "h-[100svh] min-h-[640px]",
  tall: "h-[90svh] min-h-[600px]",
  medium: "h-[80svh] min-h-[560px]",
};

export function FullBleedHero({
  image,
  alt,
  eyebrow,
  headline,
  italicWord,
  cta,
  height = "full",
  displaySize = "display",
  align = "bottom-left",
  monochrome = false,
}: Props) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-ink text-paper",
        heightMap[height]
      )}
    >
      {/* Image with parallax */}
      <motion.div
        initial={{ clipPath: "inset(20% 0 0 0)", opacity: 0 }}
        animate={{
          clipPath: "inset(0% 0 0 0)",
          opacity: 1,
          transition: { duration: 1.6, ease: easeExpo },
        }}
        className="absolute inset-0"
      >
        <ParallaxImage
          src={image}
          alt={alt}
          className="h-full w-full"
          imgClassName={cn(monochrome && "grayscale")}
          priority
          sizes="100vw"
          strength={0.2}
          withZoom
        />
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/10 to-ink/85 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-ink/40 to-transparent pointer-events-none" />
      </motion.div>

      {/* Header spacer */}
      <div className="h-20" aria-hidden />

      {/* Content overlay */}
      <motion.div
        variants={heroStagger}
        initial="hidden"
        animate="visible"
        className={cn(
          "container-wide absolute inset-x-0 bottom-0 pb-16 md:pb-24",
          align === "bottom-center" && "text-center"
        )}
      >
        <div
          className={cn(
            "max-w-4xl",
            align === "bottom-center" && "mx-auto"
          )}
        >
          <motion.div variants={fadeUp}>
            <Eyebrow tone="gold" withLine>
              {eyebrow}
            </Eyebrow>
          </motion.div>

          {displaySize === "mega" ? (
            <motion.h1
              variants={fadeUp}
              className="mt-6 font-display text-[clamp(5rem,22vw,22rem)] leading-[0.85] tracking-[-0.05em] font-bold uppercase text-paper"
            >
              {headline.join(" ")}
            </motion.h1>
          ) : (
            <div className="mt-6">
              <SplitHeadline
                lines={headline}
                italicWord={italicWord}
                size={displaySize}
                tone="paper"
              />
            </div>
          )}

          {cta && (
            <motion.div variants={fadeUp} className="mt-10">
              <Button
                href={cta.href}
                external={cta.external}
                variant="linkLight"
                size="lg"
              >
                {cta.label}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-end gap-3 animate-scroll-hint">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-paper/60">
          Scroll
        </span>
        <span className="block h-10 w-px bg-gold/60" />
      </div>
    </section>
  );
}
