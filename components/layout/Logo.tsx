import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  light,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Arcos Fitness Club — Inicio"
      className={cn(
        "group inline-flex items-baseline gap-1 font-display text-2xl tracking-tight",
        light ? "text-paper" : "text-ink",
        className
      )}
    >
      <span className="font-display italic">Arcos</span>
      <span
        className={cn(
          "h-2 w-2 rounded-full bg-volt transition-transform duration-500 group-hover:scale-150"
        )}
      />
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] translate-y-[-0.4em]">
        FC
      </span>
    </Link>
  );
}
