import type { ReactNode } from "react";

export function fmtMoney(cents: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(cents / 100);
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] text-paper">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-paper/55">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-gold/20 bg-paper/[0.02] p-5 ${className}`}>{children}</div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-paper">{value}</p>
      {hint && <p className="mt-1 text-xs text-paper/45">{hint}</p>}
    </Card>
  );
}

const BADGE: Record<string, string> = {
  gold: "border-gold/50 text-gold bg-gold/[0.1]",
  silver: "border-zinc-300/40 text-zinc-200 bg-zinc-300/[0.08]",
  green: "border-green-500/40 text-green-400 bg-green-500/[0.08]",
  red: "border-red-500/40 text-red-400 bg-red-500/[0.08]",
  amber: "border-amber-500/40 text-amber-300 bg-amber-500/[0.08]",
  neutral: "border-paper/20 text-paper/60 bg-paper/[0.04]",
};

export type BadgeTone = "gold" | "silver" | "green" | "red" | "amber" | "neutral";

/** Color del badge de membresía: dorado SOLO si el plan dice "Gold"; resto plateado. */
export function membershipBadgeTone(planName: string): BadgeTone {
  return /gold/i.test(planName) ? "gold" : "silver";
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] ${BADGE[tone]}`}
    >
      {children}
    </span>
  );
}

export function Table({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows: ReactNode[][];
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto border border-gold/20">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gold/20 bg-gold/[0.04]">
            {columns.map((c, i) => (
              <th
                key={i}
                className="text-left font-mono text-[0.6rem] uppercase tracking-[0.18em] text-gold/80 px-4 py-3 whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-paper/40 font-mono text-xs uppercase tracking-[0.2em]"
              >
                {empty ?? "Sin registros"}
              </td>
            </tr>
          ) : (
            rows.map((r, ri) => (
              <tr key={ri} className="border-b border-paper/5 hover:bg-paper/[0.03] transition-colors">
                {r.map((cell, ci) => (
                  <td key={ci} className="px-4 py-3 align-middle text-paper/85 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
