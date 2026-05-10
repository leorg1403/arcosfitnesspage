export type ClassCategory = "yoga" | "funcional" | "hyrox" | "spinning" | "box" | "pilates";

export type DayKey = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

export const DAY_LABELS: Record<DayKey, string> = {
  lun: "Lunes",
  mar: "Martes",
  mie: "Miércoles",
  jue: "Jueves",
  vie: "Viernes",
  sab: "Sábado",
  dom: "Domingo",
};

export const DAY_ORDER: DayKey[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

export const CATEGORIES: { key: ClassCategory | "all"; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "yoga", label: "Yoga" },
  { key: "funcional", label: "Funcional" },
  { key: "hyrox", label: "Hyrox" },
  { key: "spinning", label: "Spinning" },
  { key: "box", label: "Box" },
  { key: "pilates", label: "Pilates" },
];

export type ClassItem = {
  id: string;
  name: string;
  category: ClassCategory;
  day: DayKey;
  time: string;
  duration: number;
  instructor: string;
  room: string;
  level: "Principiante" | "Intermedio" | "Avanzado" | "Todos los niveles";
  capacity: number;
  description: string;
  image: string;
};

const IMG = {
  yoga: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80",
  funcional: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80",
  hyrox: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1600&q=80",
  spinning: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1600&q=80",
  box: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1600&q=80",
  pilates: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80",
} as const;

export const CLASSES: ClassItem[] = [
  // Lunes
  { id: "yoga-lun-7", name: "Yoga Flow", category: "yoga", day: "lun", time: "07:00", duration: 60, instructor: "Ana López", room: "Estudio 2", level: "Intermedio", capacity: 14, description: "Secuencia dinámica vinyasa para activar cuerpo y mente. Ideal para empezar la semana con foco.", image: IMG.yoga },
  { id: "func-lun-8", name: "Funcional", category: "funcional", day: "lun", time: "08:00", duration: 50, instructor: "Diego Ramírez", room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: "Entrenamiento por estaciones con peso corporal y kettlebells. Fuerza, cardio y movilidad.", image: IMG.funcional },
  { id: "spin-lun-18", name: "Spinning Beat", category: "spinning", day: "lun", time: "18:00", duration: 45, instructor: "María Torres", room: "Estudio Cycle", level: "Todos los niveles", capacity: 20, description: "Sesión de cycling con música en vivo. Pisar fuerte, sudar más.", image: IMG.spinning },
  { id: "hyrox-lun-19", name: "Hyrox Prep", category: "hyrox", day: "lun", time: "19:00", duration: 75, instructor: "Carlos Mendoza", room: "Hyrox Box", level: "Avanzado", capacity: 12, description: "Simulación de las 8 estaciones Hyrox con running entre cada una. Para competidores y entusiastas.", image: IMG.hyrox },

  // Martes
  { id: "pil-mar-7", name: "Pilates Mat", category: "pilates", day: "mar", time: "07:00", duration: 55, instructor: "Renata Pacheco", room: "Estudio 2", level: "Todos los niveles", capacity: 12, description: "Trabajo de core, postura y control. Sin máquinas, todo en colchoneta.", image: IMG.pilates },
  { id: "func-mar-8", name: "Funcional Avanzado", category: "funcional", day: "mar", time: "08:30", duration: 60, instructor: "Diego Ramírez", room: "Sala Principal", level: "Avanzado", capacity: 14, description: "Mayor intensidad, complejidad técnica y carga. Para quienes ya entrenan regular.", image: IMG.funcional },
  { id: "box-mar-18", name: "Box Conditioning", category: "box", day: "mar", time: "18:00", duration: 60, instructor: "Iván Castillo", room: "Ring", level: "Intermedio", capacity: 10, description: "Técnica de boxeo, footwork, costaleo y acondicionamiento físico.", image: IMG.box },
  { id: "yoga-mar-19", name: "Yin Yoga", category: "yoga", day: "mar", time: "19:30", duration: 60, instructor: "Ana López", room: "Estudio 2", level: "Todos los niveles", capacity: 14, description: "Posturas largas para liberar tensión profunda. Recuperación activa.", image: IMG.yoga },

  // Miércoles
  { id: "func-mie-7", name: "Funcional", category: "funcional", day: "mie", time: "07:00", duration: 50, instructor: "Diego Ramírez", room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: "Entrenamiento por estaciones con peso corporal y kettlebells.", image: IMG.funcional },
  { id: "spin-mie-8", name: "Spinning Endurance", category: "spinning", day: "mie", time: "08:00", duration: 60, instructor: "María Torres", room: "Estudio Cycle", level: "Intermedio", capacity: 20, description: "Trabajo de resistencia aeróbica con intervalos de recuperación.", image: IMG.spinning },
  { id: "hyrox-mie-18", name: "Hyrox Strength", category: "hyrox", day: "mie", time: "18:30", duration: 75, instructor: "Carlos Mendoza", room: "Hyrox Box", level: "Avanzado", capacity: 12, description: "Foco en sled push, farmer carry, wall balls y burpee broad jumps.", image: IMG.hyrox },
  { id: "yoga-mie-20", name: "Vinyasa Flow", category: "yoga", day: "mie", time: "20:00", duration: 60, instructor: "Ana López", room: "Estudio 2", level: "Intermedio", capacity: 14, description: "Flow continuo sincronizado con respiración. Ritmo medio-alto.", image: IMG.yoga },

  // Jueves
  { id: "pil-jue-7", name: "Pilates Reformer", category: "pilates", day: "jue", time: "07:00", duration: 55, instructor: "Renata Pacheco", room: "Estudio Reformer", level: "Intermedio", capacity: 8, description: "Trabajo en máquina reformer. Cupos limitados para atención personalizada.", image: IMG.pilates },
  { id: "func-jue-8", name: "Funcional", category: "funcional", day: "jue", time: "08:30", duration: 50, instructor: "Diego Ramírez", room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: "Estaciones de fuerza-cardio en circuito.", image: IMG.funcional },
  { id: "spin-jue-19", name: "Spinning Beat", category: "spinning", day: "jue", time: "19:00", duration: 45, instructor: "María Torres", room: "Estudio Cycle", level: "Todos los niveles", capacity: 20, description: "Cycling con música en vivo y luces.", image: IMG.spinning },
  { id: "box-jue-20", name: "Box Sparring", category: "box", day: "jue", time: "20:00", duration: 60, instructor: "Iván Castillo", room: "Ring", level: "Avanzado", capacity: 8, description: "Técnica + sparring controlado. Requiere haber tomado Box Conditioning previamente.", image: IMG.box },

  // Viernes
  { id: "yoga-vie-7", name: "Yoga Flow", category: "yoga", day: "vie", time: "07:00", duration: 60, instructor: "Ana López", room: "Estudio 2", level: "Intermedio", capacity: 14, description: "Cierra la semana con vinyasa fluido y meditación final.", image: IMG.yoga },
  { id: "hyrox-vie-8", name: "Hyrox Race Day", category: "hyrox", day: "vie", time: "08:00", duration: 90, instructor: "Carlos Mendoza", room: "Hyrox Box", level: "Avanzado", capacity: 12, description: "Simulacro completo Hyrox cronometrado. Una vez por semana, sin excepción.", image: IMG.hyrox },
  { id: "func-vie-18", name: "Funcional", category: "funcional", day: "vie", time: "18:00", duration: 50, instructor: "Diego Ramírez", room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: "Cierre semanal con WOD especial.", image: IMG.funcional },

  // Sábado
  { id: "func-sab-9", name: "Funcional Outdoor", category: "funcional", day: "sab", time: "09:00", duration: 75, instructor: "Diego Ramírez", room: "Terraza", level: "Todos los niveles", capacity: 18, description: "Entrenamiento al aire libre en la terraza con vista a los Arcos.", image: IMG.funcional },
  { id: "yoga-sab-10", name: "Slow Flow", category: "yoga", day: "sab", time: "10:30", duration: 75, instructor: "Ana López", room: "Estudio 2", level: "Todos los niveles", capacity: 14, description: "Yoga de fin de semana con ritmo pausado y trabajo de respiración.", image: IMG.yoga },
  { id: "spin-sab-11", name: "Spinning Beat", category: "spinning", day: "sab", time: "11:00", duration: 60, instructor: "María Torres", room: "Estudio Cycle", level: "Todos los niveles", capacity: 20, description: "La fiesta de los sábados.", image: IMG.spinning },
  { id: "hyrox-sab-12", name: "Hyrox Open", category: "hyrox", day: "sab", time: "12:00", duration: 60, instructor: "Carlos Mendoza", room: "Hyrox Box", level: "Intermedio", capacity: 14, description: "Sesión abierta para todos los niveles. Pruébalo por primera vez.", image: IMG.hyrox },

  // Domingo
  { id: "yoga-dom-10", name: "Restorative Yoga", category: "yoga", day: "dom", time: "10:00", duration: 75, instructor: "Ana López", room: "Estudio 2", level: "Todos los niveles", capacity: 14, description: "Yoga restaurativo con bloques y mantas. Recupérate para la semana.", image: IMG.yoga },
  { id: "pil-dom-11", name: "Pilates Mat", category: "pilates", day: "dom", time: "11:30", duration: 55, instructor: "Renata Pacheco", room: "Estudio 2", level: "Todos los niveles", capacity: 12, description: "Sesión dominical de core y movilidad.", image: IMG.pilates },
];

export function getClassesByDay(day: DayKey, category?: ClassCategory) {
  return CLASSES.filter(
    (c) => c.day === day && (!category || c.category === category)
  ).sort((a, b) => a.time.localeCompare(b.time));
}

export function getClassesByCategory(category: ClassCategory | "all") {
  if (category === "all") return CLASSES;
  return CLASSES.filter((c) => c.category === category);
}

/* Horarios únicos para el grid semanal */
export const TIME_SLOTS = Array.from(
  new Set(CLASSES.map((c) => c.time))
).sort();

/* Instructores únicos */
export const INSTRUCTORS = [
  { name: "Ana López", specialty: "Yoga & Pilates", image: "https://images.unsplash.com/photo-1559963110-71b394e7494d?auto=format&fit=crop&w=800&q=80" },
  { name: "Diego Ramírez", specialty: "Funcional & Strength", image: "https://images.unsplash.com/photo-1583468982228-19f19164aee2?auto=format&fit=crop&w=800&q=80" },
  { name: "María Torres", specialty: "Cycling & Cardio", image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80" },
  { name: "Carlos Mendoza", specialty: "Hyrox & Endurance", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80" },
  { name: "Iván Castillo", specialty: "Boxeo & Combat", image: "https://images.unsplash.com/photo-1581089778245-3ce67677f718?auto=format&fit=crop&w=800&q=80" },
  { name: "Renata Pacheco", specialty: "Pilates & Reformer", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80" },
];
