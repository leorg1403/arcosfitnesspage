"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CLASSES,
  DAY_LABELS,
  DAY_ORDER,
  CATEGORIES,
  type ClassCategory,
  type ClassItem,
  type DayKey,
} from "@/lib/classes";
import { ReservaDrawer } from "./ReservaDrawer";
import { cn } from "@/lib/cn";

type Props = {
  initialCategory?: ClassCategory | "all";
  hideFilter?: boolean;
};

export function ScheduleGrid({ initialCategory = "all", hideFilter }: Props) {
  const [category, setCategory] = useState<ClassCategory | "all">(initialCategory);
  const [activeClass, setActiveClass] = useState<ClassItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredCategories = hideFilter
    ? CATEGORIES.filter((c) => c.key === initialCategory)
    : CATEGORIES;

  const grouped = useMemo(() => {
    const map: Record<DayKey, ClassItem[]> = {
      lun: [], mar: [], mie: [], jue: [], vie: [], sab: [], dom: [],
    };
    for (const cls of CLASSES) {
      if (category === "all" || cls.category === category) {
        map[cls.day].push(cls);
      }
    }
    for (const k of DAY_ORDER) {
      map[k].sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [category]);

  const handleSelect = (cls: ClassItem) => {
    setActiveClass(cls);
    setDrawerOpen(true);
  };

  return (
    <div>
      {!hideFilter && (
        <div className="container-app">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-none">
            {filteredCategories.map((cat) => {
              const active = category === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key as ClassCategory | "all")}
                  className={cn(
                    "shrink-0 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300",
                    active
                      ? "bg-ink text-paper border-ink"
                      : "bg-paper text-ink border-line hover:border-ink"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile: list por día. Desktop: grid 7 columnas */}
      <div className="container-app mt-8">
        <div className="hidden md:grid md:grid-cols-7 gap-3">
          {DAY_ORDER.map((day) => (
            <div key={day} className="space-y-3">
              <div className="pb-3 border-b border-line">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-mute">
                  {day === "lun" || day === "mar" || day === "mie" ? "" : ""}
                </p>
                <p className="font-display text-xl">{DAY_LABELS[day]}</p>
              </div>
              <div className="space-y-2 min-h-[200px]">
                <AnimatePresence mode="sync">
                  {grouped[day].length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      exit={{ opacity: 0 }}
                      className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-mute pt-4"
                    >
                      Sin clases
                    </motion.p>
                  ) : (
                    grouped[day].map((cls) => (
                      <motion.button
                        layout
                        key={cls.id}
                        onClick={() => handleSelect(cls)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3 }}
                        className="group w-full text-left p-3 rounded-md border border-line hover:border-ink hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-paper"
                      >
                        <p className="font-mono text-[0.6875rem] tracking-wider text-mute group-hover:text-ink">
                          {cls.time}
                        </p>
                        <p className="font-medium text-sm mt-1 leading-tight">
                          {cls.name}
                        </p>
                        <p className="text-xs text-mute mt-0.5 truncate">
                          {cls.instructor}
                        </p>
                      </motion.button>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: acordeón vertical */}
        <div className="md:hidden space-y-8">
          {DAY_ORDER.map((day) => (
            <div key={day}>
              <div className="flex items-baseline justify-between pb-3 border-b border-line">
                <p className="font-display text-2xl">{DAY_LABELS[day]}</p>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-mute">
                  {grouped[day].length} clases
                </p>
              </div>
              <div className="mt-4 grid gap-2">
                <AnimatePresence mode="sync">
                  {grouped[day].length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      exit={{ opacity: 0 }}
                      className="font-mono text-xs text-mute py-2"
                    >
                      Sin clases este día.
                    </motion.p>
                  ) : (
                    grouped[day].map((cls) => (
                      <motion.button
                        layout
                        key={cls.id}
                        onClick={() => handleSelect(cls)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3 }}
                        className="w-full text-left flex items-center gap-4 p-4 rounded-md border border-line hover:border-ink hover:bg-bone transition-all"
                      >
                        <span className="font-mono text-sm w-14 shrink-0 text-mute">
                          {cls.time}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium leading-tight">{cls.name}</p>
                          <p className="text-xs text-mute mt-0.5">
                            {cls.instructor} · {cls.duration} min
                          </p>
                        </div>
                        <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-volt-deep bg-volt/30 px-2 py-1 rounded-full shrink-0">
                          Reservar
                        </span>
                      </motion.button>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ReservaDrawer
        cls={activeClass}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
