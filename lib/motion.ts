import type { Variants, Transition } from "framer-motion";

export const easeExpo: Transition["ease"] = [0.16, 1, 0.3, 1];
export const easePower: Transition["ease"] = [0.6, 0.05, 0.1, 1];
export const easeInstant: Transition["ease"] = [0.2, 0, 0, 1];

/** Image clip-path curtain reveal (left to right) */
export const clipRevealRight: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 1.4, ease: easeExpo },
  },
};

/** Image clip-path curtain reveal (bottom to top) — for hero photos */
export const clipRevealUp: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 1.6, ease: easeExpo },
  },
};

/** Subtle fade up — for body text and small elements */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: easeExpo },
  },
};

/** Fade in (no motion) — for very subtle reveals */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: easeExpo } },
};

/** Word-level mask reveal for headlines (apply to each word inside a mask container) */
export const wordRise: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 1, ease: easeExpo },
  },
};

/** Stagger orchestrators */
export const heroStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

export const wordStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

export const lineDraw: Variants = {
  hidden: { scaleX: 0, transformOrigin: "left" },
  visible: {
    scaleX: 1,
    transition: { duration: 1.2, ease: easeExpo },
  },
};

export const subtleScale: Variants = {
  hidden: { scale: 1.08, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1.4, ease: easeExpo },
  },
};
