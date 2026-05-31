"use client";

import { useMemo, useState, useRef, useLayoutEffect, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const LAYOUT_TRANSITION = { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const };
import {
  CLASSES,
  CATEGORIES,
  DAY_LABELS,
  DAY_ORDER,
  type ClassCategory,
  type ClassItem,
  type DayKey,
} from "@/lib/classes";
import { GYM_HOURS_BY_DAY } from "@/lib/content";
import { ReservaDrawer } from "./ReservaDrawer";
import { FilterRail } from "./FilterRail";
import { cn } from "@/lib/cn";

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
  // Resaltado del chip (inmediato); el contenido (category) se aplica tras el scroll
  const [selected, setSelected] = useState<ClassCategory | "all">(initialCategory);
  const [activeClass, setActiveClass] = useState<ClassItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string }>).detail;
      if (!detail || detail.id === "schedule") {
        setCategory("all");
        setSelected("all");
      }
    };
    window.addEventListener("arcos:scroll-to", handler);
    return () => window.removeEventListener("arcos:scroll-to", handler);
  }, []);

  // Animar altura real del wrapper para que el reflow del documento (sección Equipo, etc.)
  // se mueva smoothly al cambiar el filtro. Medimos UNA sola vez por cambio de categoría
  // (no ResizeObserver, que dispara múltiples veces durante las animaciones internas
  // y causa "brinquitos" duplicados).
  const innerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | "auto">("auto");

  useLayoutEffect(() => {
    if (!innerRef.current) return;
    // Medir la altura natural del contenido recién renderizado (popLayout
    // ya sacó los items que están saliendo, así que scrollHeight refleja el final).
    const next = innerRef.current.scrollHeight;
    setContainerHeight(next);
  }, [category]);

  // Medir también en resize de ventana (responsive) para que el wrapper
  // se ajuste si el usuario cambia el ancho del browser.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      if (innerRef.current) setContainerHeight(innerRef.current.scrollHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  // Móvil: solo mostramos los días con clases; "Todas" siempre tiene Open Gym
  // en cada día, así que ocultar días vacíos solo aplica al filtrar.
  const visibleDays = DAY_ORDER.filter((day) => grouped[day].length > 0);
  const categoryLabel = CATEGORIES.find((c) => c.key === category)?.label ?? "";

  const handleSelect = (cls: ClassItem) => {
    setActiveClass(cls);
    setDrawerOpen(true);
  };

  // Al cambiar de filtro en móvil estando scrolleado abajo: primero subimos
  // SUAVE al inicio del calendario con el contenido AÚN sin cambiar (el documento
  // sigue largo → imposible que el navegador recorte el scroll = sin brinco), y
  // aplicamos el filtro al terminar el scroll (scrollend). El chip se resalta ya.
  const handleCategoryChange = (next: ClassCategory | "all") => {
    setSelected(next);
    if (typeof window === "undefined" || window.innerWidth >= 768) {
      setCategory(next);
      return;
    }
    const el = rootRef.current;
    const top = el ? el.getBoundingClientRect().top + window.scrollY - 80 : 0;

    if (window.scrollY > top + 1) {
      window.scrollTo({ top, behavior: "smooth" });
      const apply = () => setCategory(next);
      if ("onscrollend" in window) {
        window.addEventListener("scrollend", apply, { once: true });
      } else {
        setTimeout(apply, 450);
      }
    } else {
      setCategory(next);
    }
  };

  return (
    <div ref={rootRef}>
      {!hideFilter && (
        <FilterRail active={selected} onChange={handleCategoryChange} sticky />
      )}

      <div className={cn(sectionPadY && "pt-12 pb-10 md:pt-14 md:pb-12")}>
        {/* Hint editorial — affordance de "click para reservar" */}
        <div className="container-wide mb-6 md:mb-8">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-gold">
            —&nbsp;&nbsp;Selecciona una clase o sesión para reservar
          </p>
        </div>

        {/* Wrapper que anima la altura real del schedule —
            así los elementos siguientes (Equipo) reflowan smoothly */}
        <motion.div
          animate={{ height: containerHeight }}
          transition={LAYOUT_TRANSITION}
          style={{ overflow: "hidden" }}
        >
          <div ref={innerRef}>

        {/* Desktop · grid 7 columnas */}
        <div className="hidden md:block container-wide">
          <LayoutGroup>
            <motion.div
              layout
              transition={LAYOUT_TRANSITION}
              className="grid grid-cols-7 gap-px bg-line-soft"
            >
              {DAY_ORDER.map((day) => (
                <motion.div
                  layout
                  transition={LAYOUT_TRANSITION}
                  key={day}
                  className="bg-paper px-4 py-6"
                >
                  <motion.div layout="position" transition={LAYOUT_TRANSITION} className="mb-6">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-concrete mb-1">
                      {day === "sab" || day === "dom" ? "Fin de semana" : "Día"}
                    </p>
                    <p className="font-display text-xl tracking-tight font-semibold">
                      {DAY_LABELS[day]}
                    </p>
                  </motion.div>
                  <motion.div
                    layout
                    transition={LAYOUT_TRANSITION}
                    className="space-y-5"
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {grouped[day].length === 0 ? (
                        <motion.p
                          layout
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.4 }}
                          exit={{ opacity: 0 }}
                          transition={LAYOUT_TRANSITION}
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
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={LAYOUT_TRANSITION}
                            className="group relative block text-left w-full -mx-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-bone/60 transition-colors duration-300"
                            aria-label={`Ver detalle y reservar ${cls.name}${cls.category !== "open-gym" ? ` de ${cls.instructor}` : ""}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-concrete group-hover:text-gold transition-colors">
                                  {cls.category === "open-gym" ? GYM_HOURS_BY_DAY[cls.day] : cls.time}
                                </p>
                                <p className="font-display text-base font-semibold tracking-tight mt-0.5 group-hover:text-gold transition-colors">
                                  {cls.name}
                                </p>
                                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-concrete mt-0.5">
                                  {cls.category === "open-gym" ? "Acceso al gym y clases" : cls.instructor}
                                </p>
                              </div>
                              <ArrowUpRight
                                className="size-3.5 text-concrete/50 group-hover:text-gold shrink-0 mt-0.5 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                strokeWidth={1.75}
                                aria-hidden
                              />
                            </div>
                            <span className="block mt-2 h-px w-0 bg-gold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-8" />
                          </motion.button>
                        ))
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </LayoutGroup>
        </div>

        {/* Mobile · agenda semanal */}
        <LayoutGroup>
          <motion.div
            layout
            transition={LAYOUT_TRANSITION}
            className="md:hidden container-app space-y-12"
          >
            <AnimatePresence mode="popLayout" initial={false}>
            {visibleDays.length === 0 ? (
              <motion.p
                layout
                key="empty-week"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={LAYOUT_TRANSITION}
                className="font-mono text-sm text-concrete py-10 text-center"
              >
                No hay clases de {categoryLabel} esta semana.
              </motion.p>
            ) : (
              visibleDays.map((day) => {
              const openGym = grouped[day].find((c) => c.category === "open-gym");
              const timed = grouped[day].filter((c) => c.category !== "open-gym");
              return (
              <motion.div
                layout
                key={day}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={LAYOUT_TRANSITION}
              >
                {/* Encabezado de día — layout="position" para que NO se escale/estire
                    el texto cuando cambian las clases del día; solo se reposiciona. */}
                <motion.div
                  layout="position"
                  transition={LAYOUT_TRANSITION}
                  className="flex items-end justify-between pb-3 border-b border-ink/15"
                >
                  <div>
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-concrete mb-1">
                      {day === "sab" || day === "dom" ? "Fin de semana" : "Día"}
                    </p>
                    <p className="font-display text-2xl font-semibold tracking-tight">
                      {DAY_LABELS[day]}
                    </p>
                  </div>
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete">
                    {grouped[day].length}
                  </p>
                </motion.div>
                <motion.div
                  layout
                  transition={LAYOUT_TRANSITION}
                  className="mt-5 space-y-3"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {[
                        ...(openGym
                          ? [
                              <motion.button
                                layout
                                key={openGym.id}
                                onClick={() => handleSelect(openGym)}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={LAYOUT_TRANSITION}
                                className="group w-full text-left rounded-sm border border-gold/25 bg-gold/[0.06] px-4 py-3.5 transition-colors hover:border-gold/50 active:bg-gold/10"
                                aria-label="Ver detalle y reservar Open Gym"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold mb-1">
                                      Todo el día · {GYM_HOURS_BY_DAY[day]}
                                    </p>
                                    <p className="font-display text-lg font-semibold tracking-tight">
                                      Open Gym
                                    </p>
                                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-concrete mt-1">
                                      Acceso al gym y clases
                                    </p>
                                  </div>
                                  <ArrowUpRight
                                    className="size-4 text-gold shrink-0 mt-0.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    strokeWidth={1.75}
                                    aria-hidden
                                  />
                                </div>
                              </motion.button>,
                            ]
                          : []),
                        ...timed.map((cls) => (
                          <motion.button
                            layout
                            key={cls.id}
                            onClick={() => handleSelect(cls)}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={LAYOUT_TRANSITION}
                            className="group w-full text-left flex items-start gap-4 py-4 border-b border-line-soft/60 hover:border-gold/60 active:bg-bone/60 transition-colors"
                            aria-label={`Ver detalle y reservar ${cls.name}`}
                          >
                            <span className="font-mono text-sm text-concrete shrink-0 w-14 pt-0.5">
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
                            <ArrowUpRight
                              className="size-4 text-gold shrink-0 mt-0.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              strokeWidth={1.75}
                              aria-hidden
                            />
                          </motion.button>
                        )),
                    ]}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
              );
              })
            )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

          </div>
        </motion.div>
      </div>

      <ReservaDrawer
        cls={activeClass}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
