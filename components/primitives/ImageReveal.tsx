"use client";

import { cn } from "@/lib/cn";
import { useInViewSafe } from "@/lib/useInViewSafe";

type Direction = "up" | "down" | "left" | "right";

const hiddenTransform: Record<Direction, string> = {
  up: "translate3d(0, 100%, 0)",
  down: "translate3d(0, -100%, 0)",
  left: "translate3d(100%, 0, 0)",
  right: "translate3d(-100%, 0, 0)",
};

type Props = {
  children: React.ReactNode;
  direction?: Direction;
  duration?: number;
  delay?: number;
  className?: string;
};

/**
 * Curtain reveal scroll-triggered. v5: useInViewSafe (triple-redundant) + CSS transition.
 * El contenido SIEMPRE termina visible. La animación dispara cuando entra al viewport.
 */
export function ImageReveal({
  children,
  direction = "up",
  duration = 1.4,
  delay = 0,
  className,
}: Props) {
  const [ref, shown] = useInViewSafe<HTMLDivElement>();

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div
        className="h-full w-full"
        style={{
          transform: shown ? "translate3d(0, 0, 0)" : hiddenTransform[direction],
          transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
