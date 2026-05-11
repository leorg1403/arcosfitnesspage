"use client";

import { motion } from "framer-motion";
import { ParallaxImage } from "@/components/primitives/ParallaxImage";
import { SplitHeadline } from "@/components/primitives/SplitHeadline";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { heroStagger, fadeUp } from "@/lib/motion";
import { useInViewSafe } from "@/lib/useInViewSafe";

type Action = "wa-visit" | "wa-generic" | "wa-hyrox" | string;

function resolveHref(action?: Action) {
  if (!action) return undefined;
  if (action === "wa-visit") return buildWhatsAppLink(WA_MESSAGES.visit);
  if (action === "wa-hyrox") return buildWhatsAppLink(WA_MESSAGES.hyrox);
  if (action === "wa-generic") return buildWhatsAppLink(WA_MESSAGES.generic);
  return action;
}

type Props = {
  image: string;
  eyebrow: string;
  headline: string[];
  italicWord?: string;
  cta: { label: string; action: Action };
};

/**
 * v5: scroll-triggered con useInViewSafe.
 */
export function FullBleedCTA({ image, eyebrow, headline, italicWord, cta }: Props) {
  const [ref, shown] = useInViewSafe<HTMLDivElement>();

  return (
    <section className="relative h-[85svh] min-h-[560px] bg-ink text-paper overflow-hidden">
      <ParallaxImage
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full"
        sizes="100vw"
        strength={0.15}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30 pointer-events-none" />

      <motion.div
        ref={ref}
        variants={heroStagger}
        initial="hidden"
        animate={shown ? "visible" : "hidden"}
        className="container-wide absolute inset-x-0 bottom-0 pb-16 md:pb-24"
      >
        <div className="max-w-3xl">
          <motion.div variants={fadeUp}>
            <Eyebrow tone="gold" withLine>
              {eyebrow}
            </Eyebrow>
          </motion.div>

          <div className="mt-6">
            <SplitHeadline
              lines={headline}
              italicWord={italicWord}
              size="display"
              tone="paper"
            />
          </div>

          <motion.div variants={fadeUp} className="mt-10">
            <Button
              href={resolveHref(cta.action)}
              external
              variant="linkLight"
              size="lg"
            >
              {cta.label}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
