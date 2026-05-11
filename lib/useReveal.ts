"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** Threshold del IntersectionObserver (0-1). Default 0.05 (apenas entra). */
  amount?: number;
  /** Si false, el observer sigue activo y inView puede volver a false al salir */
  once?: boolean;
  /** rootMargin para disparar antes/después */
  rootMargin?: string;
  /** Timeout de safety: si el observer nunca dispara, mostrar después de Xms. Default 1800 */
  fallbackMs?: number;
};

/**
 * Hook robusto para detectar visibilidad. Diseñado para evitar bugs:
 * - Chrome + Turbopack HMR + React 19 strict mode pueden desconectar observers
 * - Fallback automático: si en `fallbackMs` no triggea, se muestra de todos modos
 * - Initial check sincrónico via getBoundingClientRect para evitar flash en above-the-fold
 * - Browsers sin IntersectionObserver: muestra inmediatamente
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options: Options = {}) {
  const { amount = 0.05, once = true, rootMargin = "0px 0px -5% 0px", fallbackMs = 1800 } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Browser sin IntersectionObserver → mostrar inmediato
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    // Check sincrónico: si ya está en viewport on mount, mostrar inmediato (sin flash)
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      setInView(true);
      if (once) return; // si es one-shot, ya no necesitamos observer
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold: amount, rootMargin }
    );
    observer.observe(el);

    // Safety net: si por cualquier razón el observer no dispara, mostrar después de fallbackMs
    const timer = window.setTimeout(() => {
      setInView(true);
      if (once) observer.disconnect();
    }, fallbackMs);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [amount, once, rootMargin, fallbackMs]);

  return { ref, inView };
}
