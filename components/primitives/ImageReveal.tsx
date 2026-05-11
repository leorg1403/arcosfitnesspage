"use client";

import { cn } from "@/lib/cn";
import { useReveal } from "@/lib/useReveal";

type Direction = "up" | "down" | "left" | "right";

const transformByDir: Record<Direction, string> = {
  up:    "translate3d(0, 100%, 0)",
  down:  "translate3d(0, -100%, 0)",
  left:  "translate3d(100%, 0, 0)",
  right: "translate3d(-100%, 0, 0)",
};

type Props = {
  children: React.ReactNode;
  direction?: Direction;
  duration?: number;
  delay?: number;
  amount?: number;
  className?: string;
  loop?: boolean;
};

/**
 * Curtain reveal: wrapper con overflow-hidden + panel interno que se desliza.
 * Usa CSS transition + IntersectionObserver custom (vía useReveal) — confiable en Chrome y Safari.
 */
export function ImageReveal({
  children,
  direction = "up",
  duration = 1.4,
  delay = 0,
  amount = 0.05,
  className,
  loop = false,
}: Props) {
  const { ref, inView } = useReveal<HTMLDivElement>({
    amount,
    once: !loop,
  });

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div
        className="h-full w-full"
        style={{
          transform: inView ? "translate3d(0, 0, 0)" : transformByDir[direction],
          transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
