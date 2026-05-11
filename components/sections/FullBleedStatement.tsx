"use client";

import { motion } from "framer-motion";
import { ParallaxImage } from "@/components/primitives/ParallaxImage";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { heroStagger, fadeUp } from "@/lib/motion";

type Props = {
  image: string;
  alt?: string;
  eyebrow?: string;
  /** Texto del statement. Si se pasa como array, cada línea es un break. */
  body: string | string[];
  link?: { label: string; href?: string; external?: boolean };
  /** Altura aproximada del bloque */
  height?: "tall" | "medium" | "compact";
  align?: "left" | "center";
  /** Tono base del overlay */
  intensity?: "soft" | "strong";
  /** Foto en grayscale (B&N) */
  monochrome?: boolean;
  /** Estilo del cuerpo de texto */
  variant?: "manifesto" | "lede";
};

const heightMap = {
  tall: "min-h-[88svh]",
  medium: "min-h-[70svh]",
  compact: "min-h-[55svh]",
};

export function FullBleedStatement({
  image,
  alt = "",
  eyebrow,
  body,
  link,
  height = "medium",
  align = "left",
  intensity = "strong",
  monochrome = false,
  variant = "manifesto",
}: Props) {
  const lines = Array.isArray(body) ? body : [body];

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-ink text-paper",
        heightMap[height],
        "flex items-end"
      )}
    >
      {/* Background image with parallax */}
      <ParallaxImage
        src={image}
        alt={alt}
        className="absolute inset-0 h-full w-full"
        imgClassName={cn(monochrome && "grayscale")}
        sizes="100vw"
        strength={0.15}
      />

      {/* Overlay para legibilidad */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          intensity === "strong"
            ? "bg-gradient-to-t from-ink via-ink/65 to-ink/45"
            : "bg-gradient-to-t from-ink/85 via-ink/40 to-ink/20"
        )}
      />

      <motion.div
        variants={heroStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className={cn(
          "container-wide relative pb-20 md:pb-28 pt-32 md:pt-40 w-full",
          align === "center" && "text-center"
        )}
      >
        <div
          className={cn(
            "max-w-4xl",
            align === "center" && "mx-auto"
          )}
        >
          {eyebrow && (
            <motion.div variants={fadeUp} className={align === "center" ? "inline-flex" : ""}>
              <Eyebrow tone="gold" withLine>
                {eyebrow}
              </Eyebrow>
            </motion.div>
          )}

          <motion.div
            variants={fadeUp}
            className={cn(
              "mt-8 leading-[1.12] tracking-[-0.02em] text-paper",
              variant === "manifesto"
                ? "font-display font-bold text-[clamp(2rem,5.5vw,4.75rem)]"
                : "font-display font-medium text-[clamp(1.5rem,3.5vw,2.75rem)]"
            )}
          >
            {lines.map((line, i) => (
              <p key={i} className="max-w-[24ch]">
                {line}
              </p>
            ))}
          </motion.div>

          {link && (
            <motion.div variants={fadeUp} className={cn("mt-10", align === "center" && "inline-flex")}>
              <Button
                href={link.href}
                external={link.external}
                variant="linkLight"
                size="md"
              >
                {link.label}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
