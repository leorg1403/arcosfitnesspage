"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { signSession, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/admin/session";
import { assertAdmin, getAdmin } from "@/lib/admin/guard";
import {
  ensureDefaultAdmin,
  setAttendance,
  bulkMarkNoShow,
  markSessionNoShow,
  setCustomerStatus,
  upsertClassTemplate,
  setClassTemplateActive,
  setClassCapacity,
  deleteClassTemplate,
  createOrGetCustomer,
  updateCustomer,
  addMembership,
  cancelMembership,
} from "@/lib/db/admin";
import { performCancellation } from "@/lib/cancellations";
import { writeAuditLog, getAuditIp } from "@/lib/audit/log";
import { AUDIT_AREAS, AUDIT_ACTIONS } from "@/lib/audit/types";

export type LoginState = { error?: string };

const LoginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(1).max(200),
});

export async function adminLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  if (
    (await checkRateLimit("admin-login", { ip, headers: Object.fromEntries(hdrs.entries()) }))
      .rateLimited
  ) {
    return { error: "Demasiados intentos. Espera un momento." };
  }

  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Datos inválidos." };

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return { error: "Falta ADMIN_SESSION_SECRET en el servidor." };

  await ensureDefaultAdmin();
  const email = parsed.data.email.trim().toLowerCase();
  const admin = await prisma.admin.findUnique({ where: { email } });
  const ok = Boolean(
    admin && admin.active && bcrypt.compareSync(parsed.data.password, admin.passwordHash)
  );
  if (!ok || !admin) return { error: "Credenciales inválidas." };

  const token = await signSession(admin.id, secret);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/recepcion",
    maxAge: SESSION_TTL_SECONDS,
  });
  await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip,
    action: AUDIT_ACTIONS.ADMIN_LOGIN,
    area: AUDIT_AREAS.AUTH,
    summary: `${admin.name} (${admin.email}) inició sesión`,
  });

  redirect("/recepcion");
}

export async function adminLogout() {
  const admin = await getAdmin();
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/recepcion" });

  if (admin) {
    await writeAuditLog({
      actorKind: "admin",
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      ip: await getAuditIp(),
      action: AUDIT_ACTIONS.ADMIN_LOGOUT,
      area: AUDIT_AREAS.AUTH,
      summary: `${admin.name} (${admin.email}) cerró sesión`,
    });
  }

  redirect("/recepcion/login");
}

// ─── Mutaciones (todas detrás de assertAdmin) ─────────────────────────────────
const AttendanceSchema = z.object({
  reservationId: z.string().min(1).max(40),
  attendance: z.enum(["pending", "attended", "no_show", "late_cancel"]),
});

export async function setAttendanceAction(formData: FormData) {
  const admin = await assertAdmin();
  const p = AttendanceSchema.safeParse({
    reservationId: formData.get("reservationId"),
    attendance: formData.get("attendance"),
  });
  if (!p.success) return;

  const prev = await prisma.reservation.findUnique({
    where: { id: p.data.reservationId },
    select: { attendance: true, customerName: true, shortCode: true },
  });

  await setAttendance(p.data.reservationId, p.data.attendance);
  revalidatePath("/recepcion/reservas");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.RESERVATION_ATTENDANCE,
    area: AUDIT_AREAS.RESERVAS,
    entityKind: "Reservation",
    entityId: p.data.reservationId,
    summary: `${admin.name} marcó asistencia de ${prev?.customerName ?? p.data.reservationId} (${prev?.shortCode ?? ""}) → ${p.data.attendance}`,
    before: prev ? { attendance: prev.attendance } : null,
    after: { attendance: p.data.attendance },
  });
}

export async function cancelReservationAction(formData: FormData) {
  const admin = await assertAdmin();
  const id = z.string().min(1).max(40).safeParse(formData.get("reservationId"));
  if (!id.success) return;

  const prev = await prisma.reservation.findUnique({
    where: { id: id.data },
    select: { shortCode: true, customerName: true, customerEmail: true, status: true },
  });

  await performCancellation({ id: id.data }, "admin");
  revalidatePath("/recepcion/reservas");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.RESERVATION_CANCEL_ADMIN,
    area: AUDIT_AREAS.RESERVAS,
    entityKind: "Reservation",
    entityId: id.data,
    summary: `${admin.name} canceló reserva #${prev?.shortCode ?? id.data} de ${prev?.customerName ?? ""}`,
    before: prev ? { status: prev.status } : null,
    after: { status: "cancelled" },
  });
}

export async function bulkNoShowAction(formData: FormData) {
  const admin = await assertAdmin();
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(formData.get("date"));
  if (!date.success) return;
  await bulkMarkNoShow(date.data);
  revalidatePath("/recepcion/reservas");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.RESERVATION_BULK_NOSHOW,
    area: AUDIT_AREAS.RESERVAS,
    summary: `${admin.name} aplicó no-show masivo para fecha ${date.data}`,
    after: { date: date.data },
  });
}

export async function sessionNoShowAction(formData: FormData) {
  const admin = await assertAdmin();
  const sid = z.string().min(1).max(40).safeParse(formData.get("sessionId"));
  if (!sid.success) return;
  await markSessionNoShow(sid.data);
  revalidatePath("/recepcion/reservas");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.RESERVATION_SESSION_NOSHOW,
    area: AUDIT_AREAS.RESERVAS,
    entityKind: "ClassSession",
    entityId: sid.data,
    summary: `${admin.name} aplicó no-show masivo para sesión ${sid.data}`,
  });
}

const CustomerStatusSchema = z.object({
  id: z.string().min(1).max(40),
  status: z.enum(["active", "flagged", "blocked"]),
  notes: z.string().max(2000).optional(),
});

export async function setCustomerStatusAction(formData: FormData) {
  const admin = await assertAdmin();
  const p = CustomerStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!p.success) return;

  const prev = await prisma.customer.findUnique({
    where: { id: p.data.id },
    select: { name: true, email: true, status: true, notes: true },
  });

  await setCustomerStatus(p.data.id, p.data.status, p.data.notes ?? undefined);
  revalidatePath("/recepcion/clientes");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.CUSTOMER_STATUS,
    area: AUDIT_AREAS.CLIENTES,
    entityKind: "Customer",
    entityId: p.data.id,
    summary: `${admin.name} cambió estado de ${prev?.name ?? p.data.id} (${prev?.email ?? ""}) → ${p.data.status}`,
    before: prev ? { status: prev.status, notes: prev.notes } : null,
    after: { status: p.data.status, notes: p.data.notes ?? null },
  });
}

const CapacitySchema = z.object({
  id: z.string().min(1).max(64),
  capacity: z.coerce.number().int().min(1).max(500),
});

export async function setClassCapacityAction(formData: FormData) {
  const admin = await assertAdmin();
  const p = CapacitySchema.safeParse({
    id: formData.get("id"),
    capacity: formData.get("capacity"),
  });
  if (!p.success) return;

  const prev = await prisma.classTemplate.findUnique({
    where: { id: p.data.id },
    select: { name: true, capacity: true },
  });

  await setClassCapacity(p.data.id, p.data.capacity);
  revalidatePath("/recepcion/clases");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.CLASS_CAPACITY,
    area: AUDIT_AREAS.CLASES,
    entityKind: "ClassTemplate",
    entityId: p.data.id,
    summary: `${admin.name} cambió cupo de "${prev?.name ?? p.data.id}": ${prev?.capacity ?? "?"} → ${p.data.capacity}`,
    before: prev ? { capacity: prev.capacity } : null,
    after: { capacity: p.data.capacity },
  });
}

export async function deleteClassTemplateAction(formData: FormData) {
  const admin = await assertAdmin();
  const id = z.string().min(1).max(64).safeParse(formData.get("id"));
  if (!id.success) return;

  const prev = await prisma.classTemplate.findUnique({
    where: { id: id.data },
    select: { name: true, category: true, active: true },
  });

  const res = await deleteClassTemplate(id.data);

  if (res.ok) {
    await writeAuditLog({
      actorKind: "admin",
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      ip: await getAuditIp(),
      action: AUDIT_ACTIONS.CLASS_DELETE,
      area: AUDIT_AREAS.CLASES,
      entityKind: "ClassTemplate",
      entityId: id.data,
      summary: `${admin.name} eliminó la clase "${prev?.name ?? id.data}"`,
      before: prev ? { name: prev.name, category: prev.category, active: prev.active } : null,
    });
  }

  redirect(res.ok ? "/recepcion/clases?ok=deleted" : "/recepcion/clases?err=reservas");
}

// ─── Clientes (alta/edición) + membresías ─────────────────────────────────────
const NewCustomerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(40).optional(),
});

export async function createCustomerAction(formData: FormData) {
  const admin = await assertAdmin();
  const p = NewCustomerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? undefined,
  });
  if (!p.success) redirect("/recepcion/clientes?err=datos");
  const c = await createOrGetCustomer({
    name: p.data.name,
    email: p.data.email,
    phone: p.data.phone ?? null,
  });

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.CUSTOMER_CREATE,
    area: AUDIT_AREAS.CLIENTES,
    entityKind: "Customer",
    entityId: c.id,
    summary: `${admin.name} creó cliente ${p.data.name} (${p.data.email})`,
    after: { name: p.data.name, email: p.data.email, phone: p.data.phone ?? null },
  });

  redirect(`/recepcion/clientes/${c.id}`);
}

const UpdateCustomerSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(2).max(80),
  phone: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
});

export async function updateCustomerAction(formData: FormData) {
  const admin = await assertAdmin();
  const p = UpdateCustomerSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    phone: formData.get("phone") ?? undefined,
    notes: formData.get("notes") ?? undefined,
  });
  if (!p.success) return;

  const prev = await prisma.customer.findUnique({
    where: { id: p.data.id },
    select: { name: true, phone: true, notes: true },
  });

  await updateCustomer(p.data.id, {
    name: p.data.name,
    phone: p.data.phone ?? null,
    notes: p.data.notes ?? null,
  });
  revalidatePath(`/recepcion/clientes/${p.data.id}`);

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.CUSTOMER_UPDATE,
    area: AUDIT_AREAS.CLIENTES,
    entityKind: "Customer",
    entityId: p.data.id,
    summary: `${admin.name} actualizó datos de ${p.data.name}`,
    before: prev ? { name: prev.name, phone: prev.phone, notes: prev.notes } : null,
    after: { name: p.data.name, phone: p.data.phone ?? null, notes: p.data.notes ?? null },
  });
}

const AddMembershipSchema = z.object({
  customerId: z.string().min(1).max(40),
  planId: z.string().min(1).max(40),
  planName: z.string().min(1).max(80),
  priceMxn: z.coerce.number().min(0).max(1_000_000),
  periodicity: z.string().max(20),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export async function addMembershipAction(formData: FormData) {
  const admin = await assertAdmin();
  const p = AddMembershipSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!p.success) return;
  const d = p.data;
  await addMembership({
    customerId: d.customerId,
    planId: d.planId,
    planName: d.planName,
    priceCents: Math.round(d.priceMxn * 100),
    periodicity: d.periodicity,
    startsAtISO: d.startsAt,
    endsAtISO: d.endsAt && d.endsAt !== "" ? d.endsAt : null,
    notes: d.notes ?? null,
  });
  revalidatePath(`/recepcion/clientes/${d.customerId}`);

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.MEMBERSHIP_ADD,
    area: AUDIT_AREAS.MEMBRESIAS,
    entityKind: "Customer",
    entityId: d.customerId,
    summary: `${admin.name} asignó membresía "${d.planName}" a cliente ${d.customerId}`,
    after: {
      planId: d.planId,
      planName: d.planName,
      priceCents: Math.round(d.priceMxn * 100),
      periodicity: d.periodicity,
      startsAt: d.startsAt,
      endsAt: d.endsAt || null,
    },
  });
}

export async function cancelMembershipAction(formData: FormData) {
  const admin = await assertAdmin();
  const id = z.string().min(1).max(40).safeParse(formData.get("id"));
  const customerId = z.string().min(1).max(40).safeParse(formData.get("customerId"));
  if (!id.success) return;

  const prev = await prisma.membership.findUnique({
    where: { id: id.data },
    select: { planName: true, status: true },
  });

  await cancelMembership(id.data);
  if (customerId.success) revalidatePath(`/recepcion/clientes/${customerId.data}`);

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.MEMBERSHIP_CANCEL,
    area: AUDIT_AREAS.MEMBRESIAS,
    entityKind: "Membership",
    entityId: id.data,
    summary: `${admin.name} canceló membresía "${prev?.planName ?? id.data}"`,
    before: prev ? { status: prev.status } : null,
    after: { status: "cancelled" },
  });
}

export async function toggleClassActiveAction(formData: FormData) {
  const admin = await assertAdmin();
  const id = z.string().min(1).max(64).safeParse(formData.get("id"));
  const active = formData.get("active") === "true";
  if (!id.success) return;

  const prev = await prisma.classTemplate.findUnique({
    where: { id: id.data },
    select: { name: true, active: true },
  });

  await setClassTemplateActive(id.data, active);
  revalidatePath("/recepcion/clases");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.CLASS_TOGGLE_ACTIVE,
    area: AUDIT_AREAS.CLASES,
    entityKind: "ClassTemplate",
    entityId: id.data,
    summary: `${admin.name} ${active ? "activó" : "desactivó"} la clase "${prev?.name ?? id.data}"`,
    before: prev ? { active: prev.active } : null,
    after: { active },
  });
}

const TemplateSchema = z.object({
  id: z.string().max(64).optional(),
  name: z.string().min(1).max(80),
  category: z.enum(["funcional", "hyrox", "boxeo", "open_gym"]),
  kind: z.enum(["weekly", "oneoff"]),
  weekday: z.coerce.number().int().min(0).max(6).nullable().optional(),
  intervalWeeks: z.coerce.number().int().min(1).max(52),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMin: z.coerce.number().int().min(1).max(1440),
  instructor: z.string().max(80),
  room: z.string().max(80),
  level: z.enum(["principiante", "intermedio", "avanzado", "todos"]),
  description: z.string().max(500),
  image: z.string().max(300),
  capacity: z.coerce.number().int().min(1).max(500),
  priceCents: z.coerce.number().int().min(0).max(10_000_00).nullable().optional(),
  onlineOnly: z.coerce.boolean().optional(),
  tracksSpots: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

export async function saveClassTemplateAction(formData: FormData) {
  const admin = await assertAdmin();
  const raw = Object.fromEntries(formData.entries());
  const p = TemplateSchema.safeParse({
    ...raw,
    weekday: raw.weekday === "" ? null : raw.weekday,
    priceCents: raw.priceCents === "" ? null : raw.priceCents,
    onlineOnly: formData.get("onlineOnly") === "on",
    tracksSpots: formData.get("tracksSpots") === "on",
    active: formData.get("active") === "on",
  });
  if (!p.success) return;
  const d = p.data;

  const isUpdate = Boolean(d.id);
  const prev = isUpdate
    ? await prisma.classTemplate.findUnique({
        where: { id: d.id },
        select: { name: true, capacity: true, active: true, instructor: true },
      })
    : null;

  await upsertClassTemplate({
    id: d.id || undefined,
    name: d.name,
    category: d.category,
    kind: d.kind,
    weekday: d.kind === "weekly" ? d.weekday ?? null : null,
    intervalWeeks: d.intervalWeeks,
    eventDate: d.kind === "oneoff" && d.eventDate ? d.eventDate : null,
    startTime: d.startTime,
    durationMin: d.durationMin,
    instructor: d.instructor,
    room: d.room,
    level: d.level,
    description: d.description,
    image: d.image,
    capacity: d.capacity,
    priceCents: d.priceCents ?? null,
    onlineOnly: Boolean(d.onlineOnly),
    tracksSpots: d.tracksSpots ?? true,
    active: d.active ?? true,
    sortOrder: d.sortOrder ?? 0,
  });
  revalidatePath("/recepcion/clases");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip: await getAuditIp(),
    action: AUDIT_ACTIONS.CLASS_SAVE,
    area: AUDIT_AREAS.CLASES,
    entityKind: "ClassTemplate",
    entityId: d.id || d.name,
    summary: `${admin.name} ${isUpdate ? "actualizó" : "creó"} la clase "${d.name}"`,
    before: prev ? { name: prev.name, capacity: prev.capacity, active: prev.active, instructor: prev.instructor } : null,
    after: { name: d.name, capacity: d.capacity, active: d.active ?? true, instructor: d.instructor },
  });
}
