"use client";

import { useState } from "react";

type Props = {
  before?: unknown;
  after?: unknown;
};

/** Botón para expandir/colapsar el JSON de before/after de un registro de auditoría. */
export function AuditMetaExpand({ before, after }: Props) {
  const [open, setOpen] = useState(false);
  const hasMeta = before != null || after != null;
  if (!hasMeta) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-paper/45 hover:text-gold transition-colors"
      >
        {open ? "Ocultar ▲" : "Ver ▼"}
      </button>
      {open && (
        <div className="mt-2 space-y-1">
          {before != null && (
            <div>
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-paper/35 mb-0.5">
                Antes
              </p>
              <pre className="text-[0.6rem] text-paper/60 bg-paper/[0.04] border border-paper/10 p-2 overflow-auto max-w-xs max-h-32 whitespace-pre-wrap">
                {JSON.stringify(before, null, 2)}
              </pre>
            </div>
          )}
          {after != null && (
            <div>
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-paper/35 mb-0.5">
                Después
              </p>
              <pre className="text-[0.6rem] text-paper/60 bg-paper/[0.04] border border-paper/10 p-2 overflow-auto max-w-xs max-h-32 whitespace-pre-wrap">
                {JSON.stringify(after, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
