"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ParallaxImage } from "@/components/primitives/ParallaxImage";
import { SplitHeadline } from "@/components/primitives/SplitHeadline";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { WhatsappIcon } from "@/components/layout/SocialIcons";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { easeExpo, heroStagger, fadeUp } from "@/lib/motion";

type Props = {
  image: string;
  alt: string;
  eyebrow: string;
  /** Líneas del headline */
  headline: string[];
  italicWord?: string | string[];
  cta?: {
    label: string;
    href?: string;
    external?: boolean;
  };
  /** Enlace directo a WhatsApp debajo del CTA principal */
  whatsappCta?: {
    label: string;
    message: string;
  };
  /** Tamaño del hero */
  height?: "full" | "tall" | "medium";
  /** Forza variante super-display para palabras tipo "HYROX" */
  displaySize?: "display" | "headline" | "mega";
  /** Posición del bloque de texto */
  align?: "bottom-left" | "bottom-center";
  /** Variante con foto en blanco y negro */
  monochrome?: boolean;
  /** Video de fondo (reemplaza la imagen) */
  video?: string;
};

const heightMap = {
  full: "h-[100svh] min-h-[640px]",
  tall: "h-[90svh] min-h-[600px]",
  medium: "h-[80svh] min-h-[560px]",
};

export function FullBleedHero({
  image,
  alt,
  eyebrow,
  headline,
  italicWord,
  cta,
  whatsappCta,
  height = "full",
  displaySize = "display",
  align = "bottom-left",
  monochrome = false,
  video,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoBlocked, setVideoBlocked] = useState(false);

  useEffect(() => {
    if (!video) return;
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => setVideoBlocked(true));
    const onVisibility = () => {
      if (document.visibilityState === "visible") el.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [video]);

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-ink text-paper",
        heightMap[height]
      )}
    >
      {/* Background media with reveal animation */}
      <motion.div
        initial={{ clipPath: "inset(20% 0 0 0)", opacity: 0 }}
        animate={{
          clipPath: "inset(0% 0 0 0)",
          opacity: 1,
          transition: { duration: 1.6, ease: easeExpo },
        }}
        className="absolute inset-0"
      >
        {video && !videoBlocked ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              monochrome && "grayscale"
            )}
          >
            <source src={video} type="video/mp4" />
          </video>
        ) : (
          <ParallaxImage
            src={image}
            alt={alt}
            className="h-full w-full"
            imgClassName={cn(monochrome && "grayscale")}
            priority
            sizes="100vw"
            strength={0.2}
            withZoom
          />
        )}
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/10 to-ink/85 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-ink/40 to-transparent pointer-events-none" />
      </motion.div>

      {/* Header spacer */}
      <div className="h-20" aria-hidden />

      {/* Content overlay */}
      <motion.div
        variants={heroStagger}
        initial="hidden"
        animate="visible"
        className={cn(
          "container-wide absolute inset-x-0 bottom-0 pb-16 md:pb-24",
          align === "bottom-center" && "text-center"
        )}
      >
        <div
          className={cn(
            "max-w-4xl",
            align === "bottom-center" && "mx-auto"
          )}
        >
          <motion.div variants={fadeUp}>
            <Eyebrow tone="gold" withLine>
              {eyebrow}
            </Eyebrow>
          </motion.div>

          {displaySize === "mega" ? (
            <motion.h1
              variants={fadeUp}
              className="mt-6 font-display text-[clamp(5rem,22vw,22rem)] leading-[0.85] tracking-[-0.05em] font-bold uppercase text-paper"
            >
              {headline.join(" ")}
            </motion.h1>
          ) : (
            <div className="mt-6">
              <SplitHeadline
                lines={headline}
                italicWord={italicWord}
                size={displaySize}
                tone="paper"
              />
            </div>
          )}

          {cta && (
            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-start gap-5">
              <Button
                href={cta.href}
                external={cta.external}
                variant="linkLight"
                size="lg"
                className="px-0"
              >
                {cta.label}
              </Button>
              {whatsappCta && (
                <a
                  href={buildWhatsAppLink(whatsappCta.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-sm text-paper/85 hover:text-gold transition-colors duration-500"
                >
                  <span className="relative inline-flex flex-col overflow-hidden">
                    <span className="block">{whatsappCta.label}</span>
                    <span className="block h-px w-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left scale-x-100 group-hover:scale-x-0" />
                  </span>
                  <WhatsappIcon className="size-4 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
                </a>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

    </section>
  );
}
