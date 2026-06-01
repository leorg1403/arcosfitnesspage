import "server-only";
import { cache } from "react";
import type { Prisma, PrismaClient, ClassTemplate } from "@prisma/client";
import { prisma } from "./client";
import { CLASS_PRICE, OPEN_GYM_PRICE, type ClassCategory } from "@/lib/classes";
import {
  nextOccurrenceISO,
  formatDateLabel,
  weekdayOfISO,
  WEEKDAY_TO_DAY,
} from "@/lib/booking/window";
import type { BookableClass } from "@/lib/types";

/** enum DB "open_gym" → forma con guion del DTO/UI "open-gym". */
function toDtoCategory(c: string): ClassCategory {
  return (c === "open_gym" ? "open-gym" : c) as ClassCategory;
}

/** Precio (MXN) derivado en el SERVIDOR desde la plantilla — nunca del cliente. */
export function priceMxnFromTemplate(t: { priceCents: number | null; category: string }): number {
  if (t.priceCents != null) return t.priceCents / 100;
  return t.category === "open_gym" ? OPEN_GYM_PRICE : CLASS_PRICE;
}

function isoToDbDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

/**
 * Horario reservable: para cada plantilla activa, su PRÓXIMA ocurrencia + cupo.
 * Lectura PURA (no materializa nada): la disponibilidad sale de un LEFT JOIN
 * contra ClassSession ya existentes; si la fila no existe aún, el cupo = capacity.
 * Envuelta en React cache() para de-duplicar dentro de un mismo render.
 * NO usar unstable_cache aquí (causaría cupos viejos). La página debe ser dynamic.
 */
export const getBookableSchedule = cache(async (): Promise<BookableClass[]> => {
  const now = new Date();
  const templates = await prisma.classTemplate.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const occ = templates
    .map((t) => ({ t, date: nextOccurrenceISO(t, now) }))
    .filter((x): x is { t: ClassTemplate; date: string } => x.date !== null);

  const sessions = occ.length
    ? await prisma.classSession.findMany({
        where: {
          OR: occ.map(({ t, date }) => ({ templateId: t.id, date: isoToDbDate(date) })),
        },
        select: { templateId: true, date: true, availableSpots: true, status: true },
      })
    : [];

  const byKey = new Map<string, { availableSpots: number | null; status: string }>();
  for (const s of sessions) {
    byKey.set(`${s.templateId}|${s.date.toISOString().slice(0, 10)}`, {
      availableSpots: s.availableSpots,
      status: s.status,
    });
  }

  return occ.map(({ t, date }): BookableClass => {
    const existing = byKey.get(`${t.id}|${date}`);
    const tracks = t.tracksSpots;
    const availableSpots = !tracks ? null : existing ? existing.availableSpots : t.capacity;
    const closed = existing?.status === "closed" || existing?.status === "cancelled";
    const full = tracks ? (availableSpots ?? 0) <= 0 || closed : closed;
    return {
      templateId: t.id,
      name: t.name,
      category: toDtoCategory(t.category),
      kind: t.kind,
      day: WEEKDAY_TO_DAY[weekdayOfISO(date)],
      date,
      dateLabel: formatDateLabel(date),
      startTime: t.startTime,
      durationMin: t.durationMin,
      instructor: t.instructor,
      room: t.room,
      level: t.level,
      description: t.description,
      image: t.image,
      priceMxn: priceMxnFromTemplate(t),
      onlineOnly: t.onlineOnly,
      isOpenGym: t.category === "open_gym",
      tracksSpots: tracks,
      availableSpots,
      full,
    };
  });
});

/** Plantilla por id (para construir el line item de Stripe en checkout). */
export function getTemplateById(id: string) {
  return prisma.classTemplate.findUnique({ where: { id } });
}

/**
 * Materializa (idempotente) la ClassSession de (plantilla, fecha). El bloque
 * `update` es NO-OP: jamás resetea capacity/availableSpots (si no, cada lectura
 * borraría las reservas). Devuelve el id de la sesión.
 */
export async function ensureSession(
  tx: Prisma.TransactionClient | PrismaClient,
  template: Pick<ClassTemplate, "id" | "startTime" | "capacity" | "tracksSpots">,
  dateISO: string
): Promise<{ id: string; availableSpots: number | null }> {
  return tx.classSession.upsert({
    where: { templateId_date: { templateId: template.id, date: isoToDbDate(dateISO) } },
    create: {
      templateId: template.id,
      date: isoToDbDate(dateISO),
      startTime: template.startTime,
      capacity: template.capacity,
      availableSpots: template.tracksSpots ? template.capacity : null,
    },
    update: {},
    select: { id: true, availableSpots: true },
  });
}
