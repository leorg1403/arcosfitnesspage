"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
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
  amount = 0.2,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });

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
