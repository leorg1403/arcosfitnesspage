"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  /** Cuánto se desplaza la imagen al scroll. 0.2 = 20% del alto del contenedor */
  strength?: number;
  /** Si el zoom de salida está activo */
  withZoom?: boolean;
};

/**
 * Foto a pantalla completa con parallax sutil al scrollear el contenedor.
 * Usado en heroes y secciones full-bleed.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  priority,
  sizes = "100vw",
  strength = 0.2,
  withZoom = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // El contenedor se desplaza desde +strength*100% (inicio) hasta -strength*100% (final)
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength * 50}%`, `${strength * 50}%`]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    withZoom ? [1.1, 1, 1.05] : [1, 1, 1]
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", imgClassName)}
        />
      </motion.div>
    </div>
  );
}
