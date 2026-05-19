"use client";

import Image from "next/image";
import { FACILITIES } from "@/lib/content";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Reveal } from "@/components/primitives/Reveal";
import { useInViewSafe } from "@/lib/useInViewSafe";

/**
 * v5: scroll-triggered con useInViewSafe (triple-redundant detection).
 * El carrusel desktop hace slide-in cuando entra al viewport.
 */
export function FacilitiesScroll() {
  const [ref, shown] = useInViewSafe<HTMLDivElement>();

  return (
    <section className="bg-ink text-paper py-24 md:py-32 overflow-hidden">
      <div className="container-wide mb-12 md:mb-16">
        <Reveal>
          <Eyebrow tone="gold" withLine>
            02 / Espacios
          </Eyebrow>
        </Reveal>
      </div>

      {/* Mobile: stack vertical */}
      <div className="md:hidden space-y-4 px-[var(--spacing-gutter)]">
        {FACILITIES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.05}>
            <FacilityCard {...f} index={i} />
          </Reveal>
        ))}
      </div>

      {/* Desktop: horizontal scroll con slide-in */}
      <div
        ref={ref}
        className="hidden md:block overflow-x-auto scrollbar-none"
        style={{
          transform: shown ? "translate3d(0, 0, 0)" : "translate3d(60px, 0, 0)",
          opacity: shown ? 1 : 0,
          transition:
            "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform, opacity",
        }}
      >
        <div className="flex gap-6 px-[var(--spacing-gutter)] pb-4">
          {FACILITIES.map((f, i) => (
            <FacilityCard key={f.title} {...f} index={i} />
          ))}
          <div className="shrink-0 w-px h-px" aria-hidden />
        </div>
      </div>
    </section>
  );
}

function FacilityCard({
  title,
  subtitle,
  image,
  index,
}: {
  title: string;
  subtitle?: string;
  image: string;
  index: number;
}) {
  const alt = subtitle ? `${title} — ${subtitle}` : title;

  return (
    <div className="group relative shrink-0 w-full md:w-[36vw] lg:w-[28vw] aspect-[3/4] md:aspect-[3/4.5] bg-ink overflow-hidden">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 28vw, 100vw"
        className="object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold mb-1">
            0{index + 1}
          </p>
          <h3 className="font-display text-xl md:text-2xl text-paper font-semibold tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 font-display text-base md:text-lg text-paper/80 font-medium tracking-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
