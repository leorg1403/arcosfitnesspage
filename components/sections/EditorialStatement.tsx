import { SplitHeadline } from "@/components/primitives/SplitHeadline";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/primitives/Reveal";
import { HairlineDivider } from "@/components/primitives/HairlineDivider";
import { cn } from "@/lib/cn";
import { fadeUp } from "@/lib/motion";

type Props = {
  eyebrow?: string;
  headline?: string[];
  italicWord?: string;
  body?: string;
  link?: { label: string; href?: string; external?: boolean };
  align?: "left" | "center";
  tone?: "paper" | "bone" | "ink";
  /** Texto del body en grande estilo manifesto */
  manifesto?: boolean;
};

export function EditorialStatement({
  eyebrow,
  headline,
  italicWord,
  body,
  link,
  align = "left",
  tone = "paper",
  manifesto = false,
}: Props) {
  const toneClass =
    tone === "ink"
      ? "bg-ink text-paper"
      : tone === "bone"
      ? "bg-bone text-ink"
      : "bg-paper text-ink";

  const isInk = tone === "ink";

  return (
    <section className={cn("section-y", toneClass)}>
      <div className="container-app">
        <div
          className={cn(
            "max-w-5xl",
            align === "center" && "mx-auto text-center"
          )}
        >
          {eyebrow && (
            <Reveal variants={fadeUp} className="mb-8">
              <div className={align === "center" ? "inline-flex" : ""}>
                <Eyebrow tone={isInk ? "gold" : "concrete"} withLine>
                  {eyebrow}
                </Eyebrow>
              </div>
            </Reveal>
          )}

          {headline && (
            <SplitHeadline
              lines={headline}
              italicWord={italicWord}
              size="headline"
              tone={isInk ? "paper" : "ink"}
              align={align}
            />
          )}

          {body && (
            <Reveal variants={fadeUp} delay={headline ? 0.3 : 0.1}>
              <p
                className={cn(
                  "max-w-3xl leading-relaxed",
                  manifesto
                    ? "mt-12 font-display text-[clamp(1.5rem,3.5vw,3rem)] leading-[1.15] tracking-[-0.02em] font-medium"
                    : "mt-10 text-lg md:text-xl",
                  align === "center" && "mx-auto",
                  isInk ? "text-paper/80" : "text-ink/85"
                )}
              >
                {body}
              </p>
            </Reveal>
          )}

          {link && (
            <Reveal variants={fadeUp} delay={0.4}>
              <div className={cn("mt-12", align === "center" && "inline-flex")}>
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

        {/* Decorative hairline */}
        {!manifesto && (
          <div className="mt-20 max-w-md">
            <HairlineDivider tone="gold" />
          </div>
        )}
      </div>
    </section>
  );
}
