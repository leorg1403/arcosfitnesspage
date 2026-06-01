/**
 * Seed idempotente:
 *  - ClassTemplate desde las clases ACTUALES (lib/classes.ts): todas `weekly`
 *    con intervalWeeks=1, excepto la Master Class que entra como `oneoff`.
 *  - ensureDefaultAdmin(): crea el admin de recepción si la tabla está vacía.
 *
 * Corre con `bun run prisma/seed.ts` o `prisma db seed`. Usa el cliente directo
 * (no lib/db/client.ts, que es server-only y es para el runtime de Next).
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { CLASSES, type ClassItem, type DayKey } from "../lib/classes";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// lun..dom (catálogo) → weekday Postgres-style 0=Dom..6=Sáb
const WEEKDAY: Record<DayKey, number> = {
  dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6,
};

const CATEGORY = {
  funcional: "funcional",
  hyrox: "hyrox",
  boxeo: "boxeo",
  "open-gym": "open_gym",
} as const;

const LEVEL: Record<ClassItem["level"], "principiante" | "intermedio" | "avanzado" | "todos"> = {
  Principiante: "principiante",
  Intermedio: "intermedio",
  Avanzado: "avanzado",
  "Todos los niveles": "todos",
};

// Eventos puntuales (Master Class): id → fecha ISO real (año-cualificada).
// El weekday del catálogo (sab/dom) coincide con estas fechas en 2026.
const ONE_OFF_DATES: Record<string, string> = {
  "hyrox-mc-sab": "2026-06-13",
  "hyrox-mc-dom": "2026-06-14",
};

async function seedClasses() {
  let count = 0;
  for (const [i, cls] of CLASSES.entries()) {
    const isOpenGym = cls.category === "open-gym";
    const oneOffDate = ONE_OFF_DATES[cls.id];
    const isOneOff = Boolean(cls.dateLabel || oneOffDate);

    const data = {
      name: cls.name,
      category: CATEGORY[cls.category],
      kind: isOneOff ? ("oneoff" as const) : ("weekly" as const),
      weekday: isOneOff ? null : WEEKDAY[cls.day],
      intervalWeeks: 1,
      anchorDate: null,
      eventDate: isOneOff && oneOffDate ? new Date(oneOffDate) : null,
      startTime: cls.time,
      durationMin: cls.duration,
      instructor: cls.instructor,
      room: cls.room,
      level: LEVEL[cls.level],
      description: cls.description,
      image: cls.image,
      capacity: cls.capacity,
      priceCents: cls.price != null ? cls.price * 100 : null,
      onlineOnly: cls.onlineOnly ?? false,
      tracksSpots: !isOpenGym, // Open Gym = acceso, no asiento → sin inventario
      active: true,
      sortOrder: i,
    };

    await prisma.classTemplate.upsert({
      where: { id: cls.id },
      create: { id: cls.id, ...data },
      update: data,
    });
    count++;
  }
  console.log(`[seed] ClassTemplate: ${count} clases sembradas/actualizadas.`);
}

async function ensureDefaultAdmin() {
  const existing = await prisma.admin.count();
  if (existing > 0) {
    console.log(`[seed] Admin: ya existen ${existing} usuario(s), no se siembra.`);
    return;
  }
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password) {
    console.warn(
      "[seed] Admin: faltan ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD — no se crea admin por defecto."
    );
    return;
  }
  await prisma.admin.create({
    data: {
      email,
      name: "Recepción",
      passwordHash: bcrypt.hashSync(password, 12),
      role: "owner",
    },
  });
  console.log(`[seed] Admin: creado usuario por defecto (${email}).`);
}

async function main() {
  await seedClasses();
  await ensureDefaultAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
