"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, Loader2, Mail, Reply, Send, X } from "lucide-react";
import {
  previewLeadReplyAction,
  replyToLeadAction,
  updateLeadStatusAction,
} from "@/app/actions/leads-admin";
import { REPLY_DEFAULTS } from "@/lib/lead-reply-defaults";
import { Table, Badge, type BadgeTone } from "@/components/recepcion/ui";
import { cn } from "@/lib/cn";

// Mismos estilos que el composer de marketing (CampaignComposer).
const input =
  "w-full bg-transparent border border-paper/15 focus:border-gold px-3 py-2 text-sm text-paper outline-none [color-scheme:dark] placeholder:text-paper/25";
const labelCls = "block font-mono text-[0.55rem] uppercase tracking-[0.18em] text-paper/50 mb-1";

export type LeadRow = {
  id: string;
  date: string; // ISO yyyy-mm-dd (lastSubmittedAt)
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  status: "new" | "contacted" | "converted" | "archived";
  resubmitCount: number;
};

const STATUS_META: Record<LeadRow["status"], { label: string; tone: BadgeTone }> = {
  new: { label: "Nuevo", tone: "amber" },
  contacted: { label: "Contactado", tone: "green" },
  converted: { label: "Convertido", tone: "gold" },
  archived: { label: "Archivado", tone: "neutral" },
};

export function LeadsPanel({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();
  const [openLead, setOpenLead] = useState<LeadRow | null>(null);

  const rows = leads.map((l) => [
    l.date,
    `${l.firstName} ${l.lastName}`,
    <span key="e" className="text-xs text-paper/55">{l.email}</span>,
    <span key="m" className="block max-w-md whitespace-normal text-paper/80">{l.message}</span>,
    <StatusCell key="s" lead={l} onChanged={() => router.refresh()} />,
    l.resubmitCount > 0 ? <Badge key="r" tone="amber">{`+${l.resubmitCount}`}</Badge> : "",
    <button
      key="a"
      type="button"
      onClick={() => setOpenLead(l)}
      className="inline-flex items-center gap-1.5 border border-paper/15 px-3 py-1.5 text-paper/70 hover:border-gold/50 hover:text-gold font-mono text-[0.6rem] uppercase tracking-[0.14em] transition-colors"
    >
      <Reply className="size-3" strokeWidth={1.75} />
      Responder
    </button>,
  ]);

  return (
    <>
      <Table
        columns={["Fecha", "Nombre", "Correo", "Mensaje", "Status", "Reenvíos", ""]}
        rows={rows}
        empty="Sin leads"
      />
      {openLead && (
        <ReplyModal
          lead={openLead}
          onClose={() => setOpenLead(null)}
          onSent={() => router.refresh()}
        />
      )}
    </>
  );
}

/** Badge + select discreto para cambiar el status manualmente. */
function StatusCell({ lead, onChanged }: { lead: LeadRow; onChanged: () => void }) {
  const [saving, setSaving] = useState(false);
  const meta = STATUS_META[lead.status];

  const onChange = (status: LeadRow["status"]) => {
    if (status === lead.status) return;
    setSaving(true);
    updateLeadStatusAction({ leadId: lead.id, status })
      .then((r) => {
        if (r.ok) onChanged();
      })
      .finally(() => setSaving(false));
  };

  return (
    <span className="relative inline-flex items-center gap-1.5">
      <Badge tone={meta.tone}>{meta.label}</Badge>
      {saving ? (
        <Loader2 className="size-3 animate-spin text-paper/40" />
      ) : (
        <select
          value={lead.status}
          onChange={(e) => onChange(e.target.value as LeadRow["status"])}
          aria-label="Cambiar status"
          title="Cambiar status"
          className="absolute inset-0 cursor-pointer opacity-0 [color-scheme:dark]"
        >
          {Object.entries(STATUS_META).map(([value, m]) => (
            <option key={value} value={value}>{m.label}</option>
          ))}
        </select>
      )}
    </span>
  );
}

/**
 * Modal de respuesta: composer + vista previa en vivo (mismo look & feel que
 * marketing). Los campos arrancan vacíos con el texto sugerido como
 * placeholder: el valor EFECTIVO (lo escrito o el sugerido) alimenta el
 * preview y el envío — nada que borrar, escribir lo reemplaza.
 */
function ReplyModal({
  lead,
  onClose,
  onSent,
}: {
  lead: LeadRow;
  onClose: () => void;
  onSent: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const effectiveSubject = subject.trim() ? subject : REPLY_DEFAULTS.subject;
  const effectiveBody = body.trim() ? body : REPLY_DEFAULTS.body;

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const previewReq = useRef(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Cerrar con Escape (si no está enviando).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, sending]);

  // Preview en vivo (debounced + descarte de respuestas viejas), desde el
  // primer render: con los defaults ya hay contenido que mostrar.
  // Todo setState va dentro del timeout (async) para no disparar renders en cascada.
  useEffect(() => {
    const id = ++previewReq.current;
    const t = setTimeout(() => {
      setPreviewing(true);
      previewLeadReplyAction({ leadId: lead.id, subject: effectiveSubject, body: effectiveBody })
        .then((r) => {
          if (previewReq.current !== id) return;
          setPreviewHtml(
            r.ok
              ? r.html
              : `<p style="font-family:sans-serif;padding:24px;color:#b00">⚠ ${r.error}</p>`
          );
        })
        .finally(() => {
          if (previewReq.current === id) setPreviewing(false);
        });
    }, 500);
    return () => clearTimeout(t);
  }, [lead.id, effectiveSubject, effectiveBody]);

  const doSend = () => {
    setSending(true);
    setSendMsg(null);
    replyToLeadAction({ leadId: lead.id, subject: effectiveSubject, body: effectiveBody })
      .then((r) => {
        if (r.ok) {
          setSendMsg({
            kind: "ok",
            text: r.mock
              ? "Modo demo: no se envió (Postmark no configurado)."
              : `Respuesta enviada a ${lead.email}.`,
          });
          setConfirmOpen(false);
          onSent();
        } else {
          setSendMsg({ kind: "err", text: r.error });
        }
      })
      .catch(() => setSendMsg({ kind: "err", text: "Error al enviar. Intenta de nuevo." }))
      .finally(() => setSending(false));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/80 backdrop-blur-sm p-4 md:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !sending) onClose();
      }}
    >
      <div className="w-full max-w-5xl border border-gold/20 bg-ink shadow-2xl">
        {/* Header del modal */}
        <div className="flex items-center justify-between gap-4 border-b border-gold/20 bg-gold/[0.04] px-5 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="size-4 shrink-0 text-gold" strokeWidth={1.75} />
            <h2 className="truncate font-mono text-[0.65rem] uppercase tracking-[0.2em] text-gold/80">
              Responder a {lead.firstName} {lead.lastName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Cerrar"
            className="text-paper/50 hover:text-paper transition-colors"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_460px] gap-6 items-start p-5">
          {/* ── Izquierda: contexto + composer ── */}
          <div className="space-y-5 min-w-0">
            {/* Contexto del lead */}
            <div className="border border-paper/10 bg-paper/[0.02] p-4">
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-gold/70 mb-2">
                Mensaje original · {lead.date}
              </p>
              <p className="text-sm leading-relaxed text-paper/80 whitespace-pre-wrap">
                {lead.message}
              </p>
              <p className="mt-3 text-xs text-paper/45">
                {lead.firstName} {lead.lastName} · {lead.email}
              </p>
            </div>

            <label className="block">
              <span className={labelCls}>Asunto</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                placeholder={REPLY_DEFAULTS.subject}
                className={input}
              />
            </label>
            <label className="block">
              <span className={labelCls}>
                Respuesta (separa párrafos con una línea en blanco)
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={5000}
                rows={10}
                placeholder={REPLY_DEFAULTS.body}
                className={cn(input, "resize-y")}
                autoFocus
              />
            </label>
            <p className="text-[0.65rem] leading-relaxed text-paper/35">
              El texto gris es la respuesta sugerida: se envía tal cual si no escribes nada;
              al empezar a escribir se reemplaza. El correo saluda a {lead.firstName} por su
              nombre y cita su mensaje original al final.
            </p>
          </div>

          {/* ── Derecha: preview + envío ── */}
          <div className="space-y-4">
            <section className="border border-gold/20 bg-paper/[0.02] p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-gold" strokeWidth={1.75} />
                  <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-gold/80">
                    Vista previa
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-paper/45">
                  {previewing ? (
                    <>
                      <Loader2 className="size-3 animate-spin" /> Actualizando…
                    </>
                  ) : (
                    "En vivo"
                  )}
                </span>
              </div>
              {previewHtml ? (
                <iframe
                  title="Vista previa de la respuesta"
                  srcDoc={previewHtml}
                  sandbox=""
                  className="w-full h-[420px] bg-white border border-paper/10"
                />
              ) : (
                <div className="h-[420px] flex items-center justify-center border border-dashed border-paper/15">
                  <Loader2 className="size-4 animate-spin text-paper/30" />
                </div>
              )}
            </section>

            <section className="border border-gold/30 bg-gold/[0.04] p-4">
              {!confirmOpen ? (
                <button
                  type="button"
                  onClick={() => {
                    setSendMsg(null);
                    setConfirmOpen(true);
                  }}
                  className="w-full h-11 inline-flex items-center justify-center gap-2 bg-gold text-ink font-medium tracking-tight hover:bg-gold-soft transition-colors"
                >
                  <Send className="size-4" strokeWidth={2} />
                  <span className="truncate">Enviar respuesta a {lead.email}</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-paper/80">
                    Se enviará la respuesta a{" "}
                    <span className="font-semibold text-paper">{lead.email}</span> y el lead
                    quedará marcado como contactado.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={doSend}
                      disabled={sending}
                      className="flex-1 h-11 inline-flex items-center justify-center gap-2 bg-gold text-ink font-medium hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" strokeWidth={2} />
                      )}
                      Confirmar envío
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmOpen(false)}
                      disabled={sending}
                      className="px-4 h-11 border border-paper/15 text-paper/60 hover:text-paper font-mono text-[0.65rem] uppercase tracking-[0.14em] transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {sendMsg && (
                <p
                  className={cn(
                    "mt-3 text-xs leading-relaxed",
                    sendMsg.kind === "ok" ? "text-green-400" : "text-red-300"
                  )}
                >
                  {sendMsg.text}
                  {sendMsg.kind === "ok" && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="ml-2 underline text-paper/60 hover:text-paper"
                    >
                      Cerrar
                    </button>
                  )}
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
