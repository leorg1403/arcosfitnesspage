import { Check, Minus } from "lucide-react";
import { Reveal } from "@/components/primitives/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { COMPARISON_FEATURES, PLANS } from "@/lib/memberships";
import { cn } from "@/lib/cn";

function Cell({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check className="size-5 text-ink mx-auto" strokeWidth={2} />;
  if (value === false)
    return <Minus className="size-4 text-line mx-auto" strokeWidth={2} />;
  return (
    <span className="font-mono text-xs uppercase tracking-wider text-ink">
      {value}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="bg-paper section-y border-t border-line">
      <div className="container-app">
        <Reveal>
          <Eyebrow number="02">Comparativa</Eyebrow>
          <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
            Todo, lado
            <br />
            <span className="italic">a lado.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-16 overflow-x-auto -mx-[var(--spacing-gutter)] px-[var(--spacing-gutter)]">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-5 pr-4 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute">
                    Beneficio
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      className={cn(
                        "p-5 text-center align-bottom",
                        p.highlight && "bg-ink text-paper rounded-t-md"
                      )}
                    >
                      <p
                        className={cn(
                          "font-mono text-[0.6875rem] uppercase tracking-[0.18em]",
                          p.highlight ? "text-volt" : "text-mute"
                        )}
                      >
                        {p.tagline}
                      </p>
                      <p className="font-display text-3xl mt-1">{p.name}</p>
                      <p
                        className={cn(
                          "text-xs mt-1 font-mono",
                          p.highlight ? "text-paper/60" : "text-mute"
                        )}
                      >
                        ${p.price.toLocaleString("es-MX")} MXN/mes
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((f, i) => (
                  <tr
                    key={f.label}
                    className={cn(
                      "border-b border-line/60",
                      i % 2 === 0 ? "" : "bg-bone/40"
                    )}
                  >
                    <td className="py-5 pr-4 text-sm">{f.label}</td>
                    <td className="text-center">
                      <Cell value={f.basico} />
                    </td>
                    <td
                      className={cn(
                        "text-center bg-ink/[0.02]",
                        "border-x border-ink/10"
                      )}
                    >
                      <Cell value={f.pro} />
                    </td>
                    <td className="text-center">
                      <Cell value={f.elite} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
