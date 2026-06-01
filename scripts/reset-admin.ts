/**
 * Re-establece (o crea) el admin de recepción con la contraseña actual de
 * ADMIN_INITIAL_PASSWORD. Útil si el admin se creó antes con otra contraseña.
 * Corre: bun run scripts/reset-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password) {
    throw new Error("Faltan ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD en .env");
  }

  const existing = await prisma.admin.findMany({ select: { email: true } });
  console.log("[reset-admin] admins actuales:", existing.map((a) => a.email));

  const passwordHash = bcrypt.hashSync(password, 12);
  await prisma.admin.upsert({
    where: { email },
    create: { email, name: "Recepción", passwordHash, role: "owner" },
    update: { passwordHash, active: true },
  });
  console.log(`[reset-admin] OK → entra con  ${email}  /  (tu ADMIN_INITIAL_PASSWORD)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
