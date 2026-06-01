import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Admin } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { verifySession, SESSION_COOKIE } from "./session";

/** Admin autenticado y activo, o null. (Doble guardia: además del middleware.) */
export async function getAdmin(): Promise<Admin | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const adminId = await verifySession(token, secret);
  if (!adminId) return null;
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  return admin && admin.active ? admin : null;
}

/** Exige sesión válida; si no, redirige al login. Úsalo en TODA página/acción admin. */
export async function assertAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/recepcion/login");
  return admin;
}
