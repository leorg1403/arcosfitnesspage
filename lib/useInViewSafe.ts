"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Triple-redundant viewport detector. Designed to NEVER fail to mark an element as "shown":
 *
 * 1. **Sync check on mount** — elementos already in viewport show inmediato (no flash)
 * 2. **IntersectionObserver** — trigger primario para elementos debajo del fold
 * 3. **Scroll listener fallback** — captura casos donde el observer no dispara (Chrome HMR, Safari edge cases)
 * 4. **4s failsafe timer** — última red de seguridad: si nada disparó, fuerza shown=true
 *
 * Una vez shown=true, queda true (no flicker). Diseñado para animaciones scroll-triggered
 * que se ven en TODOS los browsers (Chrome / Safari / Firefox / móviles).
 */
export function useInViewSafe<T extends HTMLElement = HTMLDivElement>(opts?: {
  rootMargin?: string;
  /** Failsafe timeout en ms. Default 4000. */
  failsafeMs?: number;
}) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setShown(true);
    };

    // ─── 1. Sync check ─────────────────────────────
    // Si ya está en viewport on mount, dispara inmediato (sin flash de hidden)
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      trigger();
      return; // no necesita observer/scroll/timer
    }

    // ─── 2. IntersectionObserver ───────────────────
    let obs: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      try {
        obs = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) trigger();
          },
          {
            rootMargin: opts?.rootMargin ?? "0px 0px -5% 0px",
            threshold: 0,
          }
        );
        obs.observe(el);
      } catch {
        // browser raro sin IntersectionObserver — no problem, fallbacks abajo
      }
    }

    // ─── 3. Scroll listener fallback ───────────────
    // Por si el observer no dispara (algunos casos en Chrome con HMR)
    const onScroll = () => {
      if (triggered) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) trigger();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ─── 4. Failsafe timer ─────────────────────────
    // Last resort: si nada disparó en X segundos, forzamos shown=true.
    // Esto garantiza que el contenido NUNCA queda invisible.
    const failsafeMs = opts?.failsafeMs ?? 4000;
    const failsafe = window.setTimeout(trigger, failsafeMs);

    return () => {
      obs?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(failsafe);
    };
  }, [opts?.rootMargin, opts?.failsafeMs]);

  return [ref, shown] as const;
}
