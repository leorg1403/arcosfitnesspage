"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/primitives/Reveal";
import { CLASSES, DAY_LABELS } from "@/lib/classes";
import { cn } from "@/lib/cn";

export function ClassPreview() {
  const featured = CLASSES.slice(0, 8);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-paper section-y">
      <div className="container-app">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <Reveal>
            <Eyebrow number="04">Agenda</Eyebrow>
            <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight max-w-2xl">
              Clases que <span className="italic">marcan</span>
              <br />
              tu semana.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-center gap-3">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              aria-label="Anterior"
              className={cn(
                "inline-flex size-12 items-center justify-center rounded-full border border-ink/15 transition-all",
                canPrev
                  ? "hover:bg-ink hover:text-paper hover:border-ink"
                  : "opacity-30 cursor-not-allowed"
              )}
            >
              <ArrowLeft className="size-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Siguiente"
              className={cn(
                "inline-flex size-12 items-center justify-center rounded-full border border-ink/15 transition-all",
                canNext
                  ? "hover:bg-ink hover:text-paper hover:border-ink"
                  : "opacity-30 cursor-not-allowed"
              )}
            >
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </button>
            <Button href="/clases-reservas" variant="dark" size="md" className="ml-2">
              Ver todas
              <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </Button>
          </Reveal>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 px-[var(--spacing-gutter)] [--spacing-gutter:clamp(1.25rem,4vw,2.5rem)]">
          {featured.map((cls) => (
            <Link
              href="/clases-reservas"
              key={cls.id}
              className="group relative flex-[0_0_82%] sm:flex-[0_0_50%] md:flex-[0_0_38%] lg:flex-[0_0_28%] overflow-hidden rounded-md bg-ink"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={cls.image}
                  alt={cls.name}
                  fill
                  sizes="(min-width: 1024px) 28vw, 80vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/85" />
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                  <span className="bg-paper/95 backdrop-blur text-ink text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full">
                    {cls.category}
                  </span>
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-volt text-ink opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <ArrowUpRight className="size-4" strokeWidth={2} />
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-paper/70 mb-1">
                    {DAY_LABELS[cls.day]} · {cls.time}
                  </p>
                  <h3 className="font-display text-2xl text-paper leading-tight">
                    {cls.name}
                  </h3>
                  <p className="text-sm text-paper/70 mt-1">
                    con {cls.instructor}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
