"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-consulta los datos del server component (router.refresh) cada `seconds`,
 * sin recargar la página ni perder los inputs. Para ver reservas nuevas en vivo.
 */
export function AutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-paper/40">
      <span
        className={
          "inline-block size-1.5 rounded-full transition-colors " +
          (pulse ? "bg-gold" : "bg-green-500/60")
        }
      />
      Se actualiza solo
    </span>
  );
}
