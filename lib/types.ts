/**
 * DTOs planos que viajan del servidor a los componentes cliente por props.
 * Solo se importan con `import type` — NUNCA arrastran Prisma ni el cliente de BD
 * al bundle del navegador.
 */
import type { ClassCategory, DayKey } from "@/lib/classes";

/** Una clase reservable: su PRÓXIMA ocurrencia concreta + disponibilidad. */
export type BookableClass = {
  templateId: string;
  name: string;
  category: ClassCategory; // forma con guion: "open-gym"
  kind: "weekly" | "oneoff";
  day: DayKey; // weekday de la ocurrencia (para agrupar el grid)
  date: string; // ISO "YYYY-MM-DD" civil CDMX
  dateLabel: string; // "lun 8 jun"
  startTime: string; // "06:10"
  durationMin: number;
  instructor: string;
  room: string;
  level: string;
  description: string;
  image: string;
  priceMxn: number; // precio derivado en el servidor
  onlineOnly: boolean;
  isOpenGym: boolean;
  tracksSpots: boolean;
  availableSpots: number | null; // null => sin tracking (Open Gym)
  full: boolean;
};
