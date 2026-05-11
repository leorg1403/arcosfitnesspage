"use client";

import { motion, type Variants } from "framer-motion";
import { useInViewSafe } from "@/lib/useInViewSafe";
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  /** Variants opcionales (para casos con orquestación tipo heroStagger) */
  variants?: Variants;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "li";
};

/**
 * Wrapper de "reveal" scroll-triggered. v5: useInViewSafe + CSS transition o motion variants.
 * El contenido SIEMPRE termina visible (4s failsafe + scroll listener fallback + observer + sync check).
 */
export function Reveal({
  children,
  variants,
  delay = 0,
  className,
  as = "div",
}: Props) {
  const [ref, shown] = useInViewSafe<HTMLElement>();

  // Caso con motion variants (para orquestadores tipo heroStagger)
  if (variants) {
    const MotionTag = motion[as] as typeof motion.div;
    return (
      <MotionTag
        ref={ref as React.Ref<HTMLDivElement>}
        className={className}
        initial="hidden"
        animate={shown ? "visible" : "hidden"}
        variants={variants}
        transition={{ delay }}
      >
        {children}
      </MotionTag>
    );
  }

  // Caso default — fade-up CSS transition
  const Tag = as;
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as React.Ref<any>}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translate3d(0, 0, 0)" : "translate3d(0, 24px, 0)",
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
