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

// Tope duro de destinatarios por campaña (cordura / anti-runaway).
const MAX_RECIPIENTS = 5000;

// Contenido de la campaña. El cuerpo lo escribe el admin (autenticado) → es
// contenido de confianza; aun así acotamos TODO con .max() (anti-DoS por payloads
// gigantes) y validamos la URL del CTA.
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
  // doble confirmación: debe coincidir con el conteo real resuelto en el servidor.
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

// ── Conteo de audiencia (en vivo) ──────────────────────────────────────────────
export type CountResult = { ok: true; count: number } | { ok: false; error: string };

export async function countAudienceAction(filtersInput: unknown): Promise<CountResult> {
  await assertAdmin();
  const parsed = AudienceFiltersSchema.safeParse(filtersInput);
  if (!parsed.success) return { ok: false, error: "Filtros inválidos." };
  const audience = await resolveAudience(parsed.data);
  return { ok: true, count: audience.length };
}

// ── Preview (HTML renderizado del correo) ──────────────────────────────────────
export type PreviewResult = { ok: true; html: string } | { ok: false; error: string };

export async function previewCampaignAction(draftInput: unknown): Promise<PreviewResult> {
  await assertAdmin();
  const parsed = DraftSchema.safeParse(draftInput);
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

// ── Envío real (doble confirmación) ────────────────────────────────────────────
export type SendResult =
  | { ok: true; sent: number; failed: number; recipients: number; mock: boolean }
  | { ok: false; error: string; count?: number };

export async function sendCampaignAction(input: unknown): Promise<SendResult> {
  await assertAdmin();

  // Rate limit (envío masivo es caro y abusable). Ventanas estrictas.
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

  // El link de baja es obligatorio en marketing → exige secreto para firmarlo.
  const secret = unsubscribeSecret();
  if (!secret) {
    return { ok: false, error: "Falta UNSUBSCRIBE_SECRET / ADMIN_SESSION_SECRET en el servidor." };
  }

  // Resolver audiencia EN EL SERVIDOR (nunca confiamos en una lista del cliente).
  const audience = await resolveAudience(d.filters);
  if (audience.length === 0) return { ok: false, error: "La audiencia quedó vacía.", count: 0 };
  if (audience.length > MAX_RECIPIENTS) {
    return { ok: false, error: `Audiencia demasiado grande (máx. ${MAX_RECIPIENTS}).`, count: audience.length };
  }
  // Doble confirmación: el número que tecleó el admin debe coincidir con la
  // audiencia real AHORA (si cambió desde el preview, abortamos).
  if (d.confirmCount !== audience.length) {
    return {
      ok: false,
      error: `El conteo cambió (ahora ${audience.length}). Revisa y confirma de nuevo.`,
      count: audience.length,
    };
  }

  // Render ÚNICO con marcadores; se personaliza por destinatario con replace.
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

  // Historial: lo creamos en estado "sending" antes de mandar.
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

  // Construir mensajes personalizados (nombre + link de baja con token firmado).
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
  return { ok: true, sent: res.sent, failed: res.failed, recipients: audience.length, mock: res.mock };
}

// ── Listas guardadas (audiencias) ──────────────────────────────────────────────
const SaveListSchema = z.object({
  name: z.string().trim().min(1, "Falta el nombre").max(80),
  description: z.string().trim().max(200).optional().default(""),
  filters: AudienceFiltersSchema,
});

export type SaveListResult = { ok: true } | { ok: false; error: string };

export async function saveListAction(input: unknown): Promise<SaveListResult> {
  await assertAdmin();
  const parsed = SaveListSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  await createEmailList({
    name: parsed.data.name,
    description: parsed.data.description || null,
    filters: parsed.data.filters,
  });
  revalidatePath("/recepcion/marketing");
  return { ok: true };
}

export async function deleteListAction(formData: FormData) {
  await assertAdmin();
  const id = z.string().min(1).max(40).safeParse(formData.get("id"));
  if (!id.success) return;
  await deleteEmailList(id.data);
  revalidatePath("/recepcion/marketing");
}
