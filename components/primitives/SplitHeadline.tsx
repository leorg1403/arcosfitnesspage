"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";
import { wordRise, wordStagger } from "@/lib/motion";
import { useReveal } from "@/lib/useReveal";

type Props = {
  /** Líneas del headline. Cada string es una línea. */
  lines: string[];
  /** Palabra exacta que se renderiza en italic-serif acento (búsqueda case-sensitive). */
  italicWord?: string;
  /** Tamaño y peso del display */
  size?: "display" | "headline" | "h2";
  /** Color base del texto */
  tone?: "ink" | "paper" | "gold";
  /** Alineación */
  align?: "left" | "right" | "center";
  /** Delay inicial antes del stagger */
  delay?: number;
  /** Si está dentro de un orquestador padre (heroStagger), no inicia su propia animación */
  inGroup?: boolean;
  className?: string;
};

const sizeMap = {
  display: "text-[clamp(3rem,11vw,11rem)] leading-[0.92] tracking-[-0.04em]",
  headline: "text-[clamp(2.25rem,6vw,5.25rem)] leading-[0.95] tracking-[-0.03em]",
  h2: "text-[clamp(1.625rem,3.5vw,3rem)] leading-[1] tracking-[-0.02em]",
};

const toneMap = {
  ink: "text-ink",
  paper: "text-paper",
  gold: "text-gold",
};

const wrapperVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export function SplitHeadline({
  lines,
  italicWord,
  size = "headline",
  tone = "ink",
  align = "left",
  delay = 0,
  inGroup = false,
  className,
}: Props) {
  const { ref, inView } = useReveal<HTMLHeadingElement>({ amount: 0.1 });
  const animateState = inGroup ? undefined : inView ? "visible" : "hidden";

  return (
    <motion.h2
      ref={ref}
      className={cn(
        "font-display",
        sizeMap[size],
        toneMap[tone],
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      initial="hidden"
      animate={animateState}
      variants={inGroup ? wordStagger : wrapperVariants}
      transition={{ delay }}
    >
      {lines.map((line, lineIdx) => {
        const words = line.split(" ");
        return (
          <span key={lineIdx} className="block overflow-hidden pb-[0.05em]">
            <span className="flex flex-wrap gap-x-[0.25em]">
              {words.map((word, wordIdx) => {
                const isItalic = italicWord && word === italicWord;
                return (
                  <motion.span
                    key={`${lineIdx}-${wordIdx}`}
                    variants={wordRise}
                    className={cn(
                      "inline-block will-change-transform",
                      isItalic && "font-serif-italic text-gold"
                    )}
                    style={
                      isItalic
                        ? { fontFamily: "var(--font-serif), serif", fontWeight: 400, fontStyle: "italic" }
                        : undefined
                    }
                  >
                    {word}
                  </motion.span>
                );
              })}
            </span>
          </span>
        );
      })}
    </motion.h2>
  );
}
