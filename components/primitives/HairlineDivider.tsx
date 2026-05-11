"use client";

import { cn } from "@/lib/cn";
import { useInViewSafe } from "@/lib/useInViewSafe";

type Props = {
  orientation?: "horizontal" | "vertical";
  tone?: "gold" | "ink" | "concrete";
  className?: string;
  delay?: number;
  duration?: number;
};

/**
 * Hairline animado scroll-triggered. v5: useInViewSafe + CSS transform.
 */
export function HairlineDivider({
  orientation = "horizontal",
  tone = "gold",
  className,
  delay = 0,
  duration = 1.2,
}: Props) {
  const [ref, shown] = useInViewSafe<HTMLDivElement>();

  const toneClass =
    tone === "gold" ? "bg-gold" : tone === "ink" ? "bg-ink" : "bg-concrete";

  const transform = shown
    ? "scale(1, 1)"
    : orientation === "horizontal"
    ? "scaleX(0)"
    : "scaleY(0)";

  const origin = orientation === "horizontal" ? "left" : "top";

  return (
    <div
      ref={ref}
      className={cn(
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        toneClass,
        className
      )}
      style={{
        transform,
        transformOrigin: origin,
        transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: "transform",
      }}
    />
  );
}
