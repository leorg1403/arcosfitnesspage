"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { easeExpo } from "@/lib/motion";

type Direction = "up" | "down" | "left" | "right";

const directionInit: Record<Direction, string> = {
  up:    "inset(100% 0 0 0)",
  down:  "inset(0 0 100% 0)",
  left:  "inset(0 100% 0 0)",
  right: "inset(0 0 0 100%)",
};

type Props = {
  children: React.ReactNode;
  direction?: Direction;
  duration?: number;
  delay?: number;
  amount?: number;
  className?: string;
  /** If true, animation runs every time it enters viewport */
  loop?: boolean;
};

/**
 * Wrapper que aplica clip-path curtain reveal cuando el contenedor entra en viewport.
 * Usado para fotos, bloques de imagen, secciones visuales.
 */
export function ImageReveal({
  children,
  direction = "up",
  duration = 1.4,
  delay = 0,
  amount = 0.15,
  className,
  loop = false,
}: Props) {
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={{ clipPath: directionInit[direction] }}
      whileInView={{ clipPath: "inset(0% 0 0 0)" }}
      viewport={{ once: !loop, amount, margin: "0px 0px -10% 0px" }}
      transition={{ duration, delay, ease: easeExpo }}
    >
      {children}
    </motion.div>
  );
}
