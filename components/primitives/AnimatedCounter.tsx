"use client";

import { useEffect, useState } from "react";
import { useInViewSafe } from "@/lib/useInViewSafe";

/**
 * Contador animado scroll-triggered. v5: useInViewSafe + RAF.
 * El contador empieza cuando el elemento entra al viewport.
 * Si por alguna razón el detector no dispara, el failsafe (4s) lo resuelve.
 */
export function AnimatedCounter({
  to,
  duration = 1.6,
  suffix = "",
  prefix = "",
  className,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const [ref, shown] = useInViewSafe<HTMLSpanElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shown) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("es-MX")}
      {suffix}
    </span>
  );
}
