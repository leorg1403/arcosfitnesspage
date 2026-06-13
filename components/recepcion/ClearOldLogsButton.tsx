"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { clearOldAuditLogsAction } from "@/app/actions/audit";

/** Borra registros de auditoría con más de 2 semanas, con confirmación en dos pasos. */
export function ClearOldLogsButton() {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="inline-flex items-center gap-1.5 border border-red-500/30 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-red-300 transition-colors hover:bg-red-500/10"
      >
        <Trash2 className="size-3.5" strokeWidth={1.75} />
        Borrar &gt; 2 semanas
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-paper/60">
        ¿Borrar registros &gt; 2 sem?
      </span>
      <form action={clearOldAuditLogsAction}>
        <button
          type="submit"
          className="border border-red-500/40 bg-red-500/10 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-red-300 transition-colors hover:bg-red-500/20"
        >
          Sí, borrar
        </button>
      </form>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="border border-paper/15 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-paper/55 transition-colors hover:text-paper"
      >
        Cancelar
      </button>
    </div>
  );
}
