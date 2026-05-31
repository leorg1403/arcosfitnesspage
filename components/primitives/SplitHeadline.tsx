"use client";

import { cn } from "@/lib/cn";
import { useInViewSafe } from "@/lib/useInViewSafe";

type Props = {
  /** Líneas del headline. Cada string es una línea. */
  lines: string[];
  /** Palabra(s) exacta(s) que se renderizan en italic-serif acento (búsqueda case-sensitive). */
  italicWord?: string | string[];
  /** Tamaño y peso del display */
  size?: "display" | "headline" | "h2";
  /** Color base del texto */
  tone?: "ink" | "paper" | "gold";
  /** Alineación */
  align?: "left" | "right" | "center";
  /** Delay base antes del primer stagger (en ms) */
  delay?: number;
  /** Stagger entre palabras (ms). Default 80ms */
  stagger?: number;
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

/**
 * Headline con word-mask reveal scroll-triggered. v5: useInViewSafe + CSS transition.
 * Cada palabra hace slide-up con stagger cuando el headline entra al viewport.
 */
export function SplitHeadline({
  lines,
  italicWord,
  size = "headline",
  tone = "ink",
  align = "left",
  delay = 0,
  stagger = 80,
  className,
}: Props) {
  const [ref, shown] = useInViewSafe<HTMLHeadingElement>();
  const italicWords = Array.isArray(italicWord) ? italicWord : italicWord ? [italicWord] : [];
  let wordIndex = 0;

  return (
    <h2
      ref={ref}
      className={cn(
        "font-display",
        sizeMap[size],
        toneMap[tone],
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {lines.map((line, lineIdx) => {
        const words = line.split(" ");
        return (
          <span key={lineIdx} className="block overflow-hidden pb-[0.3em] mb-[-0.15em]">
            <span
              className={cn(
                "flex flex-wrap gap-x-[0.25em]",
                align === "center" && "justify-center",
                align === "right" && "justify-end"
              )}
            >
              {words.map((word, idx) => {
                const isItalic = italicWords.includes(word);
                const wordDelay = `${delay + wordIndex * stagger}ms`;
                wordIndex += 1;
                return (
                  <span
                    key={`${lineIdx}-${idx}`}
                    className={cn(
                      "inline-block",
                      isItalic && "font-serif-italic text-gold"
                    )}
                    style={{
                      transform: shown ? "translate3d(0, 0, 0)" : "translate3d(0, 110%, 0)",
                      transition: `transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${wordDelay}`,
                      willChange: "transform",
                      ...(isItalic && {
                        fontFamily: "var(--font-serif), serif",
                        fontWeight: 400,
                        fontStyle: "italic",
                      }),
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </span>
          </span>
        );
      })}
    </h2>
  );
}
