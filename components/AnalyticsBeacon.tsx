"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Beacon de analytics propio. Dispara un POST a /api/track en cada cambio de ruta.
 * Cookieless, sin PII (el servidor deriva un hash diario). No trackea en localhost.
 * Se monta en el root layout → cubre sitio público + /recepcion.
 */
export function AnalyticsBeacon() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const { hostname, host, search } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") return; // no contaminar dev

    const key = pathname + search;
    if (last.current === key) return; // evita duplicados por re-render
    last.current = key;

    const params = new URLSearchParams(search);
    const payload = JSON.stringify({
      path: pathname,
      host,
      referrer: document.referrer || "",
      utmSource: params.get("utm_source") || "",
      utmMedium: params.get("utm_medium") || "",
      utmCampaign: params.get("utm_campaign") || "",
    });

    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (!navigator.sendBeacon || !navigator.sendBeacon("/api/track", blob)) {
        void fetch("/api/track", {
          method: "POST",
          body: payload,
          keepalive: true,
          headers: { "content-type": "application/json" },
        });
      }
    } catch {
      // tracking best-effort: nunca rompe la navegación
    }
  }, [pathname]);

  return null;
}
