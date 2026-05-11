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
        "group inline-flex items-baseline gap-1.5 transition-colors duration-500",
        light ? "text-paper" : "text-ink",
        className
      )}
    >
      <span className="font-display text-xl tracking-[-0.02em] font-bold uppercase">
        Arcos
      </span>
      <span
        className={cn(
          "font-mono text-[0.6rem] uppercase tracking-[0.18em] translate-y-[-0.35em] transition-colors duration-500",
          light ? "text-paper/60 group-hover:text-gold" : "text-concrete group-hover:text-gold"
        )}
      >
        Fitness Club
      </span>
    </Link>
  );
}
