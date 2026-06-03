"use client";

import { useState } from "react";
import type { TopRow } from "@/lib/db/analytics";
import { cn } from "@/lib/cn";

type Tab = { key: string; label: string; rows: TopRow[]; favicons?: boolean };

function RowList({ rows, favicons }: { rows: TopRow[]; favicons?: boolean }) {
  if (rows.length === 0) {
    return (
      <p className="px-4 py-10 text-center font-mono text-xs uppercase tracking-[0.2em] text-paper/30">
        Sin datos
      </p>
    );
  }
  const max = Math.max(...rows.map((r) => r.visitors), 1);
  return (
    <ul>
      {rows.map((r, i) => (
        <li key={i} className="relative border-t border-paper/5 first:border-t-0">
          {/* barra de fondo proporcional al valor */}
          <span
            aria-hidden
            className="absolute inset-y-1 left-0 rounded-sm bg-paper/[0.05]"
            style={{ width: `${Math.max(4, (r.visitors / max) * 100)}%` }}
          />
          <div className="relative flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              {favicons && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(r.label)}&sz=64`}
                  alt=""
                  width={16}
                  height={16}
                  loading="lazy"
                  className="size-4 shrink-0 rounded-sm"
                />
              )}
              <span className="truncate text-sm text-paper/90">{r.label}</span>
            </div>
            <span className="shrink-0 font-medium tabular-nums text-paper">{r.visitors}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Panel({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key ?? "");
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  return (
    <div className="border border-gold/20 bg-paper/[0.02]">
      <div className="flex items-center justify-between gap-4 border-b border-paper/10 px-4 pt-3">
        <div className="flex gap-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={cn(
                "relative pb-2.5 text-sm transition-colors",
                t.key === current?.key ? "text-paper" : "text-paper/45 hover:text-paper/70"
              )}
            >
              {t.label}
              {t.key === current?.key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" />
              )}
            </button>
          ))}
        </div>
        <span className="pb-2.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/40">
          Visitantes
        </span>
      </div>
      <div className="p-1.5">{current && <RowList rows={current.rows} favicons={current.favicons} />}</div>
    </div>
  );
}

export function AnalyticsPanels({
  pages,
  routes,
  hosts,
  referrers,
  utms,
}: {
  pages: TopRow[];
  routes: TopRow[];
  hosts: TopRow[];
  referrers: TopRow[];
  utms: TopRow[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel
        tabs={[
          { key: "pages", label: "Páginas", rows: pages },
          { key: "routes", label: "Rutas", rows: routes },
          { key: "hosts", label: "Hostnames", rows: hosts },
        ]}
      />
      <Panel
        tabs={[
          { key: "ref", label: "Referrers", rows: referrers, favicons: true },
          { key: "utm", label: "UTM Parameters", rows: utms },
        ]}
      />
    </div>
  );
}
