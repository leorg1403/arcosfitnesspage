"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { render } from "@react-email/components";
import { assertAdmin } from "@/lib/admin/guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail, OWNER_EMAIL } from "@/lib/email";
import { LeadReplyEmail } from "@/lib/email/lead-reply";
import { getLead, setLeadStatus, recordLeadReply } from "@/lib/db/admin";
import { REPLY_DEFAULTS } from "@/lib/lead-reply-defaults";
import { writeAuditLog } from "@/lib/audit/log";
import { AUDIT_AREAS, AUDIT_ACTIONS } from "@/lib/audit/types";

/**
 * Acciones del panel de leads. Toda Server Action es un endpoint público →
 * SIEMPRE: assertAdmin() + zod con .max() + destinatario derivado de BD
 * (el cliente solo manda el `leadId`, nunca el correo).
 */

async function clientIp(): Promise<{ ip: string; hdrs: Headers }> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  return { ip, hdrs };
}

// ── Preview (HTML renderizado de la respuesta) ─────────────────────────────────
const PreviewSchema = z.object({
  leadId: z.string().min(1).max(40),
  subject: z.string().max(200).optional().default(""),
  body: z.string().max(5000).optional().default(""),
});

export type LeadPreviewResult = { ok: true; html: string } | { ok: false; error: string };

export async function previewLeadReplyAction(input: unknown): Promise<LeadPreviewResult> {
  await assertAdmin();
  const parsed = PreviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const lead = await getLead(parsed.data.leadId);
  if (!lead) return { ok: false, error: "Lead no encontrado." };

  const html = await render(
    LeadReplyEmail({
      recipientName: lead.firstName,
      body: parsed.data.body || REPLY_DEFAULTS.body,
      originalMessage: lead.message,
    })
  );
  return { ok: true, html };
}

// ── Envío real de la respuesta ─────────────────────────────────────────────────
const ReplySchema = z.object({
  leadId: z.string().min(1).max(40),
  subject: z.string().trim().min(1, "Falta el asunto").max(200),
  body: z.string().trim().min(1, "Falta la respuesta").max(5000),
});

export type LeadReplyResult =
  | { ok: true; mock: boolean }
  | { ok: false; error: string };

export async function replyToLeadAction(input: unknown): Promise<LeadReplyResult> {
  const admin = await assertAdmin();

  const { ip, hdrs } = await clientIp();
  const { rateLimited } = await checkRateLimit("lead-reply", {
    ip,
    headers: Object.fromEntries(hdrs.entries()),
    rules: [
      { limit: 5, windowMs: 60_000 },
      { limit: 20, windowMs: 60 * 60_000 },
    ],
  });
  if (rateLimited) return { ok: false, error: "Demasiados envíos seguidos. Espera un momento." };

  const parsed = ReplySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  const lead = await getLead(d.leadId);
  if (!lead) return { ok: false, error: "Lead no encontrado." };

  try {
    const res = await sendEmail({
      to: lead.email,
      subject: d.subject,
      react: LeadReplyEmail({
        recipientName: lead.firstName,
        body: d.body,
        originalMessage: lead.message,
      }),
      replyTo: OWNER_EMAIL,
    });

    await recordLeadReply({
      leadId: lead.id,
      subject: d.subject,
      body: d.body,
      sentBy: admin.name || admin.email,
    });
    if (lead.status === "new") await setLeadStatus(lead.id, "contacted");
    revalidatePath("/recepcion/leads");

    await writeAuditLog({
      actorKind: "admin",
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      ip,
      action: AUDIT_ACTIONS.LEAD_REPLY,
      area: AUDIT_AREAS.LEADS,
      entityKind: "Lead",
      entityId: lead.id,
      summary: `${admin.name} respondió al lead ${lead.firstName} ${lead.lastName} (${lead.email})`,
      after: { subject: d.subject, mock: res.mock },
    });

    return { ok: true, mock: res.mock };
  } catch {
    return { ok: false, error: "No se pudo enviar el correo. Intenta de nuevo." };
  }
}

// ── Cambio manual de status ────────────────────────────────────────────────────
const StatusSchema = z.object({
  leadId: z.string().min(1).max(40),
  status: z.enum(["new", "contacted", "converted", "archived"]),
});

export type LeadStatusResult = { ok: true } | { ok: false; error: string };

export async function updateLeadStatusAction(input: unknown): Promise<LeadStatusResult> {
  const admin = await assertAdmin();
  const parsed = StatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const lead = await getLead(parsed.data.leadId);
  if (!lead) return { ok: false, error: "Lead no encontrado." };

  const prevStatus = lead.status;
  await setLeadStatus(lead.id, parsed.data.status);
  revalidatePath("/recepcion/leads");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    action: AUDIT_ACTIONS.LEAD_STATUS,
    area: AUDIT_AREAS.LEADS,
    entityKind: "Lead",
    entityId: lead.id,
    summary: `${admin.name} cambió estado del lead ${lead.firstName} ${lead.lastName} → ${parsed.data.status}`,
    before: { status: prevStatus },
    after: { status: parsed.data.status },
  });

  return { ok: true };
}
