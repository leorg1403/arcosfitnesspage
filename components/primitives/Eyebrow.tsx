import { cn } from "@/lib/cn";

export function Eyebrow({
  children,
  number,
  className,
  light,
}: {
  children: React.ReactNode;
  number?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em]",
        light ? "text-paper/60" : "text-mute",
        className
      )}
    >
      {number && (
        <>
          <span className={cn(light ? "text-paper" : "text-ink")}>{number}</span>
          <span
            className={cn(
              "h-px w-8",
              light ? "bg-paper/30" : "bg-ink/20"
            )}
          />
        </>
      )}
      <span>{children}</span>
    </div>
  );
}
