import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  tone?: "concrete" | "gold" | "paper" | "ink";
  /** Si tiene línea decorativa al lado */
  withLine?: boolean;
  className?: string;
};

const toneMap = {
  concrete: "text-concrete",
  gold: "text-gold",
  paper: "text-paper/60",
  ink: "text-ink/70",
};

const lineToneMap = {
  concrete: "bg-concrete/40",
  gold: "bg-gold/40",
  paper: "bg-paper/30",
  ink: "bg-ink/20",
};

export function Eyebrow({ children, tone = "concrete", withLine, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.22em]",
        toneMap[tone],
        className
      )}
    >
      {withLine && <span className={cn("h-px w-8", lineToneMap[tone])} />}
      <span>{children}</span>
    </div>
  );
}
