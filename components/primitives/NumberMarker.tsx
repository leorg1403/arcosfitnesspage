import { cn } from "@/lib/cn";

type Props = {
  /** Número como texto: "01", "02" */
  value: string;
  /** Etiqueta opcional al lado */
  label?: string;
  tone?: "gold" | "ink" | "paper";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl md:text-7xl",
};

const toneMap = {
  gold: "text-gold",
  ink: "text-ink",
  paper: "text-paper",
};

export function NumberMarker({ value, label, tone = "gold", size = "md", className }: Props) {
  return (
    <div className={cn("flex items-baseline gap-3", className)}>
      <span
        className={cn(
          "font-display font-light tracking-tight",
          sizeMap[size],
          toneMap[tone]
        )}
      >
        {value}
      </span>
      {label && (
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-concrete">
          {label}
        </span>
      )}
    </div>
  );
}
