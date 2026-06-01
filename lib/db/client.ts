import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Cliente Prisma — ÚNICO punto de acceso a la base de datos.
 *
 * - `import "server-only"`: si algún componente cliente importa este módulo (o
 *   cualquiera de lib/db/*), el build FALLA. Así garantizamos cero BD en el navegador.
 * - Driver adapter `@prisma/adapter-pg`: usa el pooler de Supabase (PgBouncer en
 *   modo transacción). `pgbouncer=true` en DATABASE_URL desactiva prepared statements.
 * - Singleton en `globalThis`: evita abrir un pool nuevo en cada recarga (HMR/Turbopack)
 *   en desarrollo. En producción serverless cada instancia tiene el suyo (acotado por
 *   `connection_limit=1` + el pooler).
 */
const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
