import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  number?: string;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  align = "left",
  number,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "bg-paper pt-12 md:pt-20 pb-16 md:pb-20 border-b border-line",
        className
      )}
    >
      <div className="container-app">
        <div
          className={cn(
            "max-w-4xl",
            align === "center" && "mx-auto text-center"
          )}
        >
          <Reveal>
            <Eyebrow number={number}>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-8 font-display text-display leading-[0.92] tracking-tight">
              {title}
            </h1>
          </Reveal>
          {subtitle && (
            <Reveal delay={0.2}>
              <p
                className={cn(
                  "mt-8 text-lg md:text-xl leading-relaxed text-mute max-w-2xl",
                  align === "center" && "mx-auto"
                )}
              >
                {subtitle}
              </p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
