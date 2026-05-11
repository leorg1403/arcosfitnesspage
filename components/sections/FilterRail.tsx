"use client";

import { CATEGORIES, type ClassCategory } from "@/lib/classes";
import { cn } from "@/lib/cn";

type Props = {
  active: ClassCategory | "all";
  onChange: (value: ClassCategory | "all") => void;
  sticky?: boolean;
};

export function FilterRail({ active, onChange, sticky = true }: Props) {
  return (
    <div
      className={cn(
        "bg-paper/85 backdrop-blur-xl border-b border-line-soft z-20",
        sticky && "sticky top-20"
      )}
    >
      <div className="container-wide">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-4 -mx-2 px-2">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onChange(cat.key as ClassCategory | "all")}
                className={cn(
                  "group shrink-0 px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.22em] transition-colors duration-300",
                  isActive
                    ? "text-ink"
                    : "text-concrete hover:text-ink"
                )}
              >
                <span className="relative inline-flex flex-col overflow-hidden">
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      "block h-px w-full bg-gold transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
