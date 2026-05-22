export type ClassCategory = "funcional" | "hyrox" | "boxeo" | "open-gym";

/** Precios por sesión individual (MXN) */
export const CLASS_PRICE = 380;
export const OPEN_GYM_PRICE = 300;

export function getClassPrice(cls: { category: ClassCategory }): number {
  return cls.category === "open-gym" ? OPEN_GYM_PRICE : CLASS_PRICE;
}

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
  { key: "funcional", label: "Funcional" },
  { key: "hyrox", label: "Hyrox" },
  { key: "boxeo", label: "Boxeo" },
  { key: "open-gym", label: "Open Gym" },
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
  funcional: "/images/facilities/paraiso-fierros.jpg",
  hyrox: "/images/hero/home.jpg",
  boxeo: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1600&q=80",
  "open-gym": "/images/facilities/sala-pesas.jpg",
} as const;

/* ─── Instructores · placeholders hasta que el cliente confirme nombres ─── */
const COACH_FUNC = "Coach Funcional";
const COACH_HYROX = "Coach Hyrox";
const COACH_BOX = "Coach Boxeo";

/* ─── Descripciones base por disciplina ─── */
const DESC = {
  funcional:
    "Entrenamiento funcional por estaciones. Trabajo de fuerza, cardio y movilidad en circuito.",
  hyrox:
    "Simulacro de las 8 estaciones Hyrox con running entre cada una. Para competidores y entusiastas.",
  boxeo:
    "Técnica de boxeo, footwork, costaleo y acondicionamiento físico.",
  "open-gym":
    "Acceso libre a todas las instalaciones del club durante el horario de operación.",
} as const;

export const CLASSES: ClassItem[] = [
  // ─── ENTRENAMIENTO FUNCIONAL · Lun a Vie · 6:10 AM y 7:20 AM ───
  { id: "func-lun-1", name: "Funcional", category: "funcional", day: "lun", time: "06:10", duration: 50, instructor: COACH_FUNC, room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: DESC.funcional, image: IMG.funcional },
  { id: "func-lun-2", name: "Funcional", category: "funcional", day: "lun", time: "07:20", duration: 50, instructor: COACH_FUNC, room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: DESC.funcional, image: IMG.funcional },
  { id: "func-mar-1", name: "Funcional", category: "funcional", day: "mar", time: "06:10", duration: 50, instructor: COACH_FUNC, room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: DESC.funcional, image: IMG.funcional },
  { id: "func-mar-2", name: "Funcional", category: "funcional", day: "mar", time: "07:20", duration: 50, instructor: COACH_FUNC, room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: DESC.funcional, image: IMG.funcional },
  { id: "func-mie-1", name: "Funcional", category: "funcional", day: "mie", time: "06:10", duration: 50, instructor: COACH_FUNC, room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: DESC.funcional, image: IMG.funcional },
  { id: "func-mie-2", name: "Funcional", category: "funcional", day: "mie", time: "07:20", duration: 50, instructor: COACH_FUNC, room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: DESC.funcional, image: IMG.funcional },
  { id: "func-jue-1", name: "Funcional", category: "funcional", day: "jue", time: "06:10", duration: 50, instructor: COACH_FUNC, room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: DESC.funcional, image: IMG.funcional },
  { id: "func-jue-2", name: "Funcional", category: "funcional", day: "jue", time: "07:20", duration: 50, instructor: COACH_FUNC, room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: DESC.funcional, image: IMG.funcional },
  { id: "func-vie-1", name: "Funcional", category: "funcional", day: "vie", time: "06:10", duration: 50, instructor: COACH_FUNC, room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: DESC.funcional, image: IMG.funcional },
  { id: "func-vie-2", name: "Funcional", category: "funcional", day: "vie", time: "07:20", duration: 50, instructor: COACH_FUNC, room: "Sala Principal", level: "Todos los niveles", capacity: 16, description: DESC.funcional, image: IMG.funcional },

  // ─── HYROX ───
  // Lun, Mar, Mié: 18:00 y 19:00
  { id: "hyrox-lun-1", name: "Hyrox", category: "hyrox", day: "lun", time: "18:00", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  { id: "hyrox-lun-2", name: "Hyrox", category: "hyrox", day: "lun", time: "19:00", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  { id: "hyrox-mar-1", name: "Hyrox", category: "hyrox", day: "mar", time: "18:00", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  { id: "hyrox-mar-2", name: "Hyrox", category: "hyrox", day: "mar", time: "19:00", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  { id: "hyrox-mie-1", name: "Hyrox", category: "hyrox", day: "mie", time: "18:00", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  { id: "hyrox-mie-2", name: "Hyrox", category: "hyrox", day: "mie", time: "19:00", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  // Jueves: 18:30 y 19:30
  { id: "hyrox-jue-1", name: "Hyrox", category: "hyrox", day: "jue", time: "18:30", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  { id: "hyrox-jue-2", name: "Hyrox", category: "hyrox", day: "jue", time: "19:30", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  // Viernes: 8:30 AM
  { id: "hyrox-vie-1", name: "Hyrox", category: "hyrox", day: "vie", time: "08:30", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  // Sábado: 10:00 y 11:00
  { id: "hyrox-sab-1", name: "Hyrox", category: "hyrox", day: "sab", time: "10:00", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  { id: "hyrox-sab-2", name: "Hyrox", category: "hyrox", day: "sab", time: "11:00", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },
  // Domingo: 10:00
  { id: "hyrox-dom-1", name: "Hyrox", category: "hyrox", day: "dom", time: "10:00", duration: 60, instructor: COACH_HYROX, room: "Hyrox Box", level: "Intermedio", capacity: 12, description: DESC.hyrox, image: IMG.hyrox },

  // ─── BOXEO ───
  { id: "box-jue-1", name: "Boxeo", category: "boxeo", day: "jue", time: "09:00", duration: 60, instructor: COACH_BOX, room: "Ring", level: "Todos los niveles", capacity: 10, description: DESC.boxeo, image: IMG.boxeo },
  { id: "box-sab-1", name: "Boxeo", category: "boxeo", day: "sab", time: "08:30", duration: 60, instructor: COACH_BOX, room: "Ring", level: "Todos los niveles", capacity: 10, description: DESC.boxeo, image: IMG.boxeo },

  // ─── OPEN GYM · Lun a Dom · horario completo del gym ───
  { id: "og-lun", name: "Open Gym", category: "open-gym", day: "lun", time: "06:00", duration: 960, instructor: "—", room: "Todas las áreas", level: "Todos los niveles", capacity: 50, description: DESC["open-gym"], image: IMG["open-gym"] },
  { id: "og-mar", name: "Open Gym", category: "open-gym", day: "mar", time: "06:00", duration: 960, instructor: "—", room: "Todas las áreas", level: "Todos los niveles", capacity: 50, description: DESC["open-gym"], image: IMG["open-gym"] },
  { id: "og-mie", name: "Open Gym", category: "open-gym", day: "mie", time: "06:00", duration: 960, instructor: "—", room: "Todas las áreas", level: "Todos los niveles", capacity: 50, description: DESC["open-gym"], image: IMG["open-gym"] },
  { id: "og-jue", name: "Open Gym", category: "open-gym", day: "jue", time: "06:00", duration: 960, instructor: "—", room: "Todas las áreas", level: "Todos los niveles", capacity: 50, description: DESC["open-gym"], image: IMG["open-gym"] },
  { id: "og-vie", name: "Open Gym", category: "open-gym", day: "vie", time: "06:00", duration: 900, instructor: "—", room: "Todas las áreas", level: "Todos los niveles", capacity: 50, description: DESC["open-gym"], image: IMG["open-gym"] },
  { id: "og-sab", name: "Open Gym", category: "open-gym", day: "sab", time: "08:00", duration: 540, instructor: "—", room: "Todas las áreas", level: "Todos los niveles", capacity: 50, description: DESC["open-gym"], image: IMG["open-gym"] },
  { id: "og-dom", name: "Open Gym", category: "open-gym", day: "dom", time: "09:00", duration: 360, instructor: "—", room: "Todas las áreas", level: "Todos los niveles", capacity: 50, description: DESC["open-gym"], image: IMG["open-gym"] },
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

/* Instructores únicos · placeholders hasta confirmación */
export const INSTRUCTORS = [
  { name: "Daniel Azuara", specialty: "Atleta Híbrido de Alto Rendimiento", image: "/images/team/daniel-azuara.avif" },
  { name: "Raúl Victoria", specialty: "Embajador Certificado de Hyrox", image: "/images/team/raul-victoria.avif" },
  { name: "Luis Fernando Azuara", specialty: "Embajador de Hyrox", image: "/images/team/luis-fernando-azuara.avif" },
];
