"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { easeExpo } from "@/lib/motion";

type Props = {
  orientation?: "horizontal" | "vertical";
  tone?: "gold" | "ink" | "concrete";
  className?: string;
  delay?: number;
  duration?: number;
};

export function HairlineDivider({
  orientation = "horizontal",
  tone = "gold",
  className,
  delay = 0,
  duration = 1.2,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  const toneClass =
    tone === "gold" ? "bg-gold" : tone === "ink" ? "bg-ink" : "bg-concrete";

  return (
    <motion.div
      ref={ref}
      initial={{
        scaleX: orientation === "horizontal" ? 0 : 1,
        scaleY: orientation === "vertical" ? 0 : 1,
      }}
      animate={
        inView
          ? { scaleX: 1, scaleY: 1, transition: { duration, ease: easeExpo, delay } }
          : undefined
      }
      style={{
        transformOrigin: orientation === "horizontal" ? "left" : "top",
      }}
      className={cn(
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        toneClass,
        className
      )}
    />
  );
}
