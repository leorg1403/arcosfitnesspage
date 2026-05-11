"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CLASSES,
  DAY_LABELS,
  DAY_ORDER,
  type ClassCategory,
  type ClassItem,
  type DayKey,
} from "@/lib/classes";
import { ReservaDrawer } from "./ReservaDrawer";
import { FilterRail } from "./FilterRail";
import { cn } from "@/lib/cn";
import { easeExpo } from "@/lib/motion";

type Props = {
  initialCategory?: ClassCategory | "all";
  hideFilter?: boolean;
  sectionPadY?: boolean;
};

export function ScheduleGrid({
  initialCategory = "all",
  hideFilter,
  sectionPadY = true,
}: Props) {
  const [category, setCategory] = useState<ClassCategory | "all">(initialCategory);
  const [activeClass, setActiveClass] = useState<ClassItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        <FilterRail active={category} onChange={setCategory} sticky />
      )}

      <div className={cn(sectionPadY && "py-16 md:py-24")}>
        {/* Desktop · grid 7 columnas */}
        <div className="hidden md:block container-wide">
          <div className="grid grid-cols-7 gap-px bg-line-soft">
            {DAY_ORDER.map((day) => (
              <div
                key={day}
                className="bg-paper px-4 py-6 min-h-[420px]"
              >
                <div className="mb-6">
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-concrete mb-1">
                    {day === "sab" || day === "dom" ? "Fin de semana" : "Día"}
                  </p>
                  <p className="font-display text-xl tracking-tight font-semibold">
                    {DAY_LABELS[day]}
                  </p>
                </div>
                <div className="space-y-5">
                  <AnimatePresence mode="sync">
                    {grouped[day].length === 0 ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete"
                      >
                        Sin clases
                      </motion.p>
                    ) : (
                      grouped[day].map((cls) => (
                        <motion.button
                          layout
                          key={cls.id}
                          onClick={() => handleSelect(cls)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.4, ease: easeExpo }}
                          className="group block text-left w-full"
                        >
                          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-concrete group-hover:text-gold transition-colors">
                            {cls.time}
                          </p>
                          <p className="font-display text-base font-semibold tracking-tight mt-0.5 group-hover:text-gold transition-colors">
                            {cls.name}
                          </p>
                          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-concrete mt-0.5">
                            {cls.instructor}
                          </p>
                          <span className="block mt-2 h-px w-0 bg-gold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-8" />
                        </motion.button>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile · acordeón vertical */}
        <div className="md:hidden container-app space-y-10">
          {DAY_ORDER.map((day) => (
            <div key={day}>
              <div className="flex items-baseline justify-between pb-4 border-b border-line-soft">
                <p className="font-display text-2xl font-semibold tracking-tight">
                  {DAY_LABELS[day]}
                </p>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete">
                  {grouped[day].length}
                </p>
              </div>
              <div className="mt-5 space-y-4">
                <AnimatePresence mode="sync">
                  {grouped[day].length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      exit={{ opacity: 0 }}
                      className="font-mono text-xs text-concrete py-2"
                    >
                      —
                    </motion.p>
                  ) : (
                    grouped[day].map((cls) => (
                      <motion.button
                        layout
                        key={cls.id}
                        onClick={() => handleSelect(cls)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full text-left flex items-baseline gap-4 py-3 border-b border-line-soft/60 hover:border-gold/60 transition-colors"
                      >
                        <span className="font-mono text-sm text-concrete shrink-0 w-14">
                          {cls.time}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-lg font-semibold tracking-tight">
                            {cls.name}
                          </p>
                          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-concrete mt-1">
                            {cls.instructor} · {cls.duration}min
                          </p>
                        </div>
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
