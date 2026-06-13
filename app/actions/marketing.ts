"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { render } from "@react-email/components";
import { assertAdmin } from "@/lib/admin/guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { MarketingEmail } from "@/lib/email/marketing";
import { sendBroadcastBatch, type BroadcastRecipient } from "@/lib/email";
import {
  resolveAudience,
  createCampaign,
  finalizeCampaign,
  createEmailList,
  deleteEmailList,
} from "@/lib/db/marketing";
import { AudienceFiltersSchema } from "@/lib/marketing/filters";
import {
  signUnsubscribe,
  unsubscribeSecret,
  unsubscribePageUrl,
  unsubscribeOneClickUrl,
} from "@/lib/marketing/unsubscribe";
import { writeAuditLog } from "@/lib/audit/log";
import { AUDIT_AREAS, AUDIT_ACTIONS } from "@/lib/audit/types";
import { prisma } from "@/lib/db/client";

const MAX_RECIPIENTS = 5000;

const DraftSchema = z.object({
  subject: z.string().trim().min(1, "Falta el asunto").max(200),
  preheader: z.string().trim().max(200).optional().default(""),
  heading: z.string().trim().min(1, "Falta el encabezado").max(150),
  body: z.string().trim().min(1, "Falta el cuerpo").max(5000),
  ctaLabel: z.string().trim().max(60).optional().default(""),
  ctaUrl: z.string().trim().max(500).url("URL del botón inválida").optional().or(z.literal("")),
});

const SendSchema = DraftSchema.extend({
  filters: AudienceFiltersSchema,
  listId: z.string().max(40).optional().nullable(),
  confirmCount: z.coerce.number().int().min(0).max(MAX_RECIPIENTS),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function clientIp(): Promise<{ ip: string; hdrs: Headers }> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  return { ip, hdrs };
}

// ── Conteo de audiencia ────────────────────────────────────────────────────────
export type CountResult = { ok: true; count: number } | { ok: false; error: string };

export async function countAudienceAction(filtersInput: unknown): Promise<CountResult> {
  await assertAdmin();
  const parsed = AudienceFiltersSchema.safeParse(filtersInput);
  if (!parsed.success) return { ok: false, error: "Filtros inválidos." };
  const audience = await resolveAudience(parsed.data);
  return { ok: true, count: audience.length };
}

// ── Preview ────────────────────────────────────────────────────────────────────
const PreviewSchema = z.object({
  subject: z.string().max(200).optional().default(""),
  preheader: z.string().max(200).optional().default(""),
  heading: z.string().max(150).optional().default(""),
  body: z.string().max(5000).optional().default(""),
  ctaLabel: z.string().max(60).optional().default(""),
  ctaUrl: z.string().max(500).optional().default(""),
});

export type PreviewResult = { ok: true; html: string } | { ok: false; error: string };

export async function previewCampaignAction(draftInput: unknown): Promise<PreviewResult> {
  await assertAdmin();
  const parsed = PreviewSchema.safeParse(draftInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;
  const html = await render(
    MarketingEmail({
      preheader: d.preheader || undefined,
      heading: d.heading,
      body: d.body,
      ctaLabel: d.ctaLabel || undefined,
      ctaUrl: d.ctaUrl || undefined,
      recipientName: "Alex",
      unsubscribeUrl: "#preview",
    })
  );
  return { ok: true, html };
}

// ── Envío real ─────────────────────────────────────────────────────────────────
export type SendResult =
  | { ok: true; sent: number; failed: number; recipients: number; mock: boolean }
  | { ok: false; error: string; count?: number };

export async function sendCampaignAction(input: unknown): Promise<SendResult> {
  const admin = await assertAdmin();

  const { ip, hdrs } = await clientIp();
  const { rateLimited } = await checkRateLimit("marketing-send", {
    ip,
    headers: Object.fromEntries(hdrs.entries()),
    rules: [
      { limit: 3, windowMs: 60_000 },
      { limit: 10, windowMs: 60 * 60_000 },
    ],
  });
  if (rateLimited) return { ok: false, error: "Demasiados envíos seguidos. Espera un momento." };

  const parsed = SendSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  const secret = unsubscribeSecret();
  if (!secret) {
    return { ok: false, error: "Falta UNSUBSCRIBE_SECRET / ADMIN_SESSION_SECRET en el servidor." };
  }

  const audience = await resolveAudience(d.filters);
  if (audience.length === 0) return { ok: false, error: "La audiencia quedó vacía.", count: 0 };
  if (audience.length > MAX_RECIPIENTS) {
    return { ok: false, error: `Audiencia demasiado grande (máx. ${MAX_RECIPIENTS}).`, count: audience.length };
  }
  if (d.confirmCount !== audience.length) {
    return {
      ok: false,
      error: `El conteo cambió (ahora ${audience.length}). Revisa y confirma de nuevo.`,
      count: audience.length,
    };
  }

  const NAME = "%%NAME%%";
  const UNSUB = "%%UNSUB_PAGE%%";
  const reactEl = MarketingEmail({
    preheader: d.preheader || undefined,
    heading: d.heading,
    body: d.body,
    ctaLabel: d.ctaLabel || undefined,
    ctaUrl: d.ctaUrl || undefined,
    recipientName: NAME,
    unsubscribeUrl: UNSUB,
  });
  const [htmlTemplate, textTemplate] = await Promise.all([
    render(reactEl),
    render(reactEl, { plainText: true }),
  ]);

  const campaign = await createCampaign({
    subject: d.subject,
    preheader: d.preheader || null,
    heading: d.heading,
    body: d.body,
    ctaLabel: d.ctaLabel || null,
    ctaUrl: d.ctaUrl || null,
    listId: d.listId ?? null,
    filters: d.filters,
    recipientCount: audience.length,
  });

  const recipients: BroadcastRecipient[] = await Promise.all(
    audience.map(async (r) => {
      const token = await signUnsubscribe(r.id, secret);
      const pageUrl = unsubscribePageUrl(token);
      const oneClick = unsubscribeOneClickUrl(token);
      const firstName = r.name.trim().split(/\s+/)[0] || "";
      const htmlBody = htmlTemplate
        .split(NAME).join(escapeHtml(firstName))
        .split(UNSUB).join(pageUrl);
      const textBody = textTemplate
        .split(NAME).join(firstName)
        .split(UNSUB).join(pageUrl);
      return {
        to: r.email,
        htmlBody,
        textBody,
        headers: [
          { Name: "List-Unsubscribe", Value: `<${oneClick}>, <${pageUrl}>` },
          { Name: "List-Unsubscribe-Post", Value: "List-Unsubscribe=One-Click" },
        ],
      };
    })
  );

  const res = await sendBroadcastBatch(d.subject, recipients);
  await finalizeCampaign(campaign.id, {
    status: res.failed > 0 && res.sent === 0 ? "failed" : "sent",
    sentCount: res.sent,
    failedCount: res.failed,
  });
  revalidatePath("/recepcion/marketing");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    ip,
    action: AUDIT_ACTIONS.CAMPAIGN_SEND,
    area: AUDIT_AREAS.MARKETING,
    entityKind: "EmailCampaign",
    entityId: campaign.id,
    summary: `${admin.name} envió campaña "${d.subject}" a ${audience.length} destinatarios (${res.sent} enviados, ${res.failed} fallidos)`,
    after: { campaignId: campaign.id, subject: d.subject, recipientCount: audience.length, sentCount: res.sent, failedCount: res.failed, mock: res.mock },
  });

  return { ok: true, sent: res.sent, failed: res.failed, recipients: audience.length, mock: res.mock };
}

// ── Listas guardadas ───────────────────────────────────────────────────────────
const SaveListSchema = z.object({
  name: z.string().trim().min(1, "Falta el nombre").max(80),
  description: z.string().trim().max(200).optional().default(""),
  filters: AudienceFiltersSchema,
});

export type SaveListResult = { ok: true } | { ok: false; error: string };

export async function saveListAction(input: unknown): Promise<SaveListResult> {
  const admin = await assertAdmin();
  const parsed = SaveListSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const list = await createEmailList({
    name: parsed.data.name,
    description: parsed.data.description || null,
    filters: parsed.data.filters,
  });
  revalidatePath("/recepcion/marketing");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    action: AUDIT_ACTIONS.LIST_SAVE,
    area: AUDIT_AREAS.MARKETING,
    entityKind: "EmailList",
    entityId: list.id,
    summary: `${admin.name} guardó lista de audiencia "${parsed.data.name}"`,
    after: { name: parsed.data.name, description: parsed.data.description || null },
  });

  return { ok: true };
}

export async function deleteListAction(formData: FormData) {
  const admin = await assertAdmin();
  const id = z.string().min(1).max(40).safeParse(formData.get("id"));
  if (!id.success) return;

  const prev = await prisma.emailList.findUnique({
    where: { id: id.data },
    select: { name: true },
  });

  await deleteEmailList(id.data);
  revalidatePath("/recepcion/marketing");

  await writeAuditLog({
    actorKind: "admin",
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    action: AUDIT_ACTIONS.LIST_DELETE,
    area: AUDIT_AREAS.MARKETING,
    entityKind: "EmailList",
    entityId: id.data,
    summary: `${admin.name} eliminó lista de audiencia "${prev?.name ?? id.data}"`,
    before: prev ? { name: prev.name } : null,
  });
}
