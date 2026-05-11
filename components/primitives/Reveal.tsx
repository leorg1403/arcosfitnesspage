"use client";

import { motion, type Variants } from "framer-motion";
import { useReveal } from "@/lib/useReveal";
import { fadeUp } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "li";
  once?: boolean;
  amount?: number;
};

export function Reveal({
  children,
  variants = fadeUp,
  delay = 0,
  className,
  as = "div",
  once = true,
  amount = 0.1,
}: Props) {
  const { ref, inView } = useReveal<HTMLDivElement>({ amount, once });

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
