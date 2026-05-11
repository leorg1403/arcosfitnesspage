import Image from "next/image";
import { ImageReveal } from "@/components/primitives/ImageReveal";
import { SplitHeadline } from "@/components/primitives/SplitHeadline";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { NumberMarker } from "@/components/primitives/NumberMarker";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/primitives/Reveal";
import { cn } from "@/lib/cn";
import { fadeUp } from "@/lib/motion";

type Props = {
  image: string;
  alt: string;
  number?: string;
  eyebrow?: string;
  headline: string[];
  italicWord?: string;
  body?: string;
  link?: { label: string; href?: string; external?: boolean };
  /** Lado donde va la foto */
  photoSide?: "left" | "right";
  /** Tono del fondo */
  tone?: "paper" | "bone" | "ink";
  /** Aplicar grayscale a la foto */
  monochrome?: boolean;
};

export function SinglePhotoSection({
  image,
  alt,
  number,
  eyebrow,
  headline,
  italicWord,
  body,
  link,
  photoSide = "left",
  tone = "paper",
  monochrome = false,
}: Props) {
  const toneClass =
    tone === "ink"
      ? "bg-ink text-paper"
      : tone === "bone"
      ? "bg-bone text-ink"
      : "bg-paper text-ink";

  const isInk = tone === "ink";

  return (
    <section className={cn("relative section-y overflow-hidden", toneClass)}>
      <div className="container-wide">
        <div className="grid lg:grid-cols-12 gap-y-12 lg:gap-x-16 items-center">
          {/* Photo */}
          <ImageReveal
            direction="up"
            className={cn(
              "relative aspect-[4/5] lg:aspect-[3/4] w-full lg:col-span-7",
              photoSide === "right" && "lg:col-start-6 lg:order-2"
            )}
          >
            <div className="absolute inset-0 bg-ink">
              <Image
                src={image}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className={cn(
                  "object-cover transition-transform duration-1000",
                  monochrome && "grayscale"
                )}
              />
            </div>
          </ImageReveal>

          {/* Content */}
          <div
            className={cn(
              "lg:col-span-4 lg:pl-4",
              photoSide === "right" && "lg:col-start-1 lg:row-start-1 lg:pl-0 lg:pr-4"
            )}
          >
            {number && (
              <Reveal variants={fadeUp} className="mb-8">
                <NumberMarker
                  value={number}
                  tone={isInk ? "paper" : "gold"}
                  size="lg"
                />
              </Reveal>
            )}
            {eyebrow && (
              <Reveal variants={fadeUp} className="mb-6">
                <Eyebrow tone={isInk ? "gold" : "concrete"}>{eyebrow}</Eyebrow>
              </Reveal>
            )}

            <SplitHeadline
              lines={headline}
              italicWord={italicWord}
              size="headline"
              tone={isInk ? "paper" : "ink"}
            />

            {body && (
              <Reveal variants={fadeUp} delay={0.3}>
                <p
                  className={cn(
                    "mt-8 text-lg leading-relaxed max-w-md",
                    isInk ? "text-paper/70" : "text-concrete"
                  )}
                >
                  {body}
                </p>
              </Reveal>
            )}

            {link && (
              <Reveal variants={fadeUp} delay={0.4}>
                <div className="mt-10">
                  <Button
                    href={link.href}
                    external={link.external}
                    variant={isInk ? "linkLight" : "link"}
                    size="md"
                  >
                    {link.label}
                  </Button>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
