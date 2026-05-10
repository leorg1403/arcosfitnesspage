import { cn } from "@/lib/cn";

export function Marquee({
  items,
  className,
  variant = "dark",
}: {
  items: string[];
  className?: string;
  variant?: "dark" | "light" | "volt";
}) {
  const seq = [...items, ...items, ...items];
  const styles = {
    dark: "bg-ink text-paper border-y border-ink",
    light: "bg-paper text-ink border-y border-line",
    volt: "bg-volt text-ink border-y border-volt-deep",
  } as const;

  return (
    <div
      className={cn(
        "overflow-hidden py-5 select-none",
        styles[variant],
        className
      )}
    >
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {seq.map((item, i) => (
          <span
            key={i}
            className="flex items-center font-display text-3xl md:text-5xl tracking-tight italic"
          >
            <span className="px-8">{item}</span>
            <span className="text-current/30 text-xl">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
