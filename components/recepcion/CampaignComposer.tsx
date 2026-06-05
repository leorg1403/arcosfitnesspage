"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mail, Users, Eye, Send, Save, Check, AlertTriangle } from "lucide-react";
import {
  countAudienceAction,
  previewCampaignAction,
  sendCampaignAction,
  saveListAction,
} from "@/app/actions/marketing";
import {
  DEFAULT_FILTERS,
  describeFilters,
  parseFilters,
  MEMBERSHIP_OPTIONS,
  FITNESS_APP_FILTER_OPTIONS,
  ACTIVITY_OPTIONS,
  type AudienceFilters,
} from "@/lib/marketing/filters";
import { cn } from "@/lib/cn";

const input =
  "w-full bg-transparent border border-paper/15 focus:border-gold px-3 py-2 text-sm text-paper outline-none [color-scheme:dark] placeholder:text-paper/25";
const labelCls = "block font-mono text-[0.55rem] uppercase tracking-[0.18em] text-paper/50 mb-1";

export type ListOption = {
  id: string;
  name: string;
  description: string | null;
  filters: AudienceFilters;
};

type Draft = {
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
};

const EMPTY_DRAFT: Draft = {
  subject: "",
  preheader: "",
  heading: "",
  body: "",
  ctaLabel: "",
  ctaUrl: "",
};

/**
 * Contenido de ejemplo: se muestra como `placeholder` en los campos y alimenta
 * la vista previa mientras el campo esté vacío (escribir lo reemplaza, nada
 * que borrar). Es solo guía visual: el ENVÍO sigue exigiendo contenido
 * tecleado (`draftReady`), para no mandar una campaña con texto de muestra.
 */
const SAMPLE: Draft = {
  subject: "Novedades del club · Arcos Fitness",
  preheader: "Nuevos horarios, clases y más",
  heading: "Esta semana en Arcos",
  body:
    "Te compartimos las novedades del club: nuevos horarios de clases y lugares disponibles en Hyrox.\n\nReserva tu lugar desde el sitio o escríbenos por WhatsApp.",
  ctaLabel: "",
  ctaUrl: "",
};

export function CampaignComposer({
  lists,
  planOptions,
}: {
  lists: ListOption[];
  planOptions: string[];
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [filters, setFilters] = useState<AudienceFilters>(DEFAULT_FILTERS);
  const [selectedListId, setSelectedListId] = useState<string>("");
  // Control del dropdown de plan: "" = cualquiera | "<plan>" | "__other__" (texto libre).
  const [planSelect, setPlanSelect] = useState<string>("");

  const [count, setCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const previewReq = useRef(0);

  // Envío + doble confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Guardar lista
  const [saveName, setSaveName] = useState("");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setF = <K extends keyof AudienceFilters>(k: K, v: AudienceFilters[K]) => {
    setFilters((prev) => ({ ...prev, [k]: v }));
    setSelectedListId(""); // editar filtros desvincula de la lista guardada
  };
  const setD = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [k]: v }));

  // Conteo en vivo (debounced) cuando cambian los filtros.
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshCount = useCallback((f: AudienceFilters) => {
    setCounting(true);
    countAudienceAction(f)
      .then((r) => setCount(r.ok ? r.count : null))
      .finally(() => setCounting(false));
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => refreshCount(filters), 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [filters, refreshCount]);

  const planSelectFor = useCallback(
    (plan: string) => (plan ? (planOptions.includes(plan) ? plan : "__other__") : ""),
    [planOptions]
  );

  const loadList = (id: string) => {
    setSelectedListId(id);
    const l = lists.find((x) => x.id === id);
    if (l) {
      const f = parseFilters(l.filters);
      setFilters(f);
      setPlanSelect(planSelectFor(f.planContains));
    }
  };

  const onPlanSelect = (v: string) => {
    setSelectedListId("");
    setPlanSelect(v);
    setFilters((prev) => ({ ...prev, planContains: v === "__other__" ? "" : v }));
  };

  // Vista previa EN VIVO: se regenera (debounced) al cambiar el contenido, sin botón.
  // Mientras un campo esté vacío, el preview usa el contenido de ejemplo (SAMPLE)
  // — el mismo que se ve como placeholder — así la vista previa aparece desde el
  // inicio y escribir reemplaza campo por campo.
  // Todo setState va dentro del timeout (async) para no disparar renders en cascada.
  useEffect(() => {
    const id = ++previewReq.current;
    const t = setTimeout(() => {
      const effective: Draft = {
        subject: draft.subject.trim() ? draft.subject : SAMPLE.subject,
        preheader: draft.preheader.trim() ? draft.preheader : SAMPLE.preheader,
        heading: draft.heading.trim() ? draft.heading : SAMPLE.heading,
        body: draft.body.trim() ? draft.body : SAMPLE.body,
        ctaLabel: draft.ctaLabel,
        ctaUrl: draft.ctaUrl,
      };
      setPreviewing(true);
      previewCampaignAction(effective)
        .then((r) => {
          if (previewReq.current !== id) return; // descarta resultados viejos
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
  }, [draft]);

  const openConfirm = () => {
    setSendMsg(null);
    setConfirmText("");
    setConfirmOpen(true);
  };

  const doSend = () => {
    setSending(true);
    setSendMsg(null);
    sendCampaignAction({ ...draft, filters, listId: selectedListId || null, confirmCount: count ?? -1 })
      .then((r) => {
        if (r.ok) {
          setSendMsg({
            kind: "ok",
            text: r.mock
              ? `Modo demo: no se envió (Postmark no configurado). Audiencia: ${r.recipients}.`
              : `Enviada a ${r.sent} de ${r.recipients}.${r.failed ? ` ${r.failed} fallaron.` : ""}`,
          });
          setConfirmOpen(false);
          setDraft(EMPTY_DRAFT);
        } else {
          setSendMsg({ kind: "err", text: r.error });
          if (typeof r.count === "number") setCount(r.count); // refresca si cambió
        }
      })
      .catch(() => setSendMsg({ kind: "err", text: "Error al enviar. Intenta de nuevo." }))
      .finally(() => setSending(false));
  };

  const doSaveList = () => {
    setSaving(true);
    setSaveMsg(null);
    saveListAction({ name: saveName, description: "", filters })
      .then((r) => {
        if (r.ok) {
          setSaveMsg("Lista guardada.");
          setSaveName("");
        } else setSaveMsg(r.error);
      })
      .finally(() => setSaving(false));
  };

  const draftReady = draft.subject.trim() && draft.heading.trim() && draft.body.trim();
  const canSend = Boolean(draftReady && count && count > 0);
  const confirmMatches = confirmText.trim() === String(count ?? "");

  return (
    <div className="grid lg:grid-cols-[1fr_460px] gap-6 items-start">
      {/* ── Columna izquierda: audiencia + mensaje ── */}
      <div className="space-y-6 min-w-0">
        {/* Audiencia */}
        <section className="border border-gold/20 bg-paper/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-4 text-gold" strokeWidth={1.75} />
            <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-gold/80">Audiencia</h2>
          </div>

          {lists.length > 0 && (
            <label className="block mb-4">
              <span className={labelCls}>Cargar lista guardada</span>
              <select
                value={selectedListId}
                onChange={(e) => loadList(e.target.value)}
                className={input}
              >
                <option value="">— Filtros manuales —</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className={labelCls}>Membresía</span>
              <select value={filters.membership} onChange={(e) => setF("membership", e.target.value as AudienceFilters["membership"])} className={input}>
                {MEMBERSHIP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Origen (app de fitness)</span>
              <select value={filters.fitnessApp} onChange={(e) => setF("fitnessApp", e.target.value as AudienceFilters["fitnessApp"])} className={input}>
                {FITNESS_APP_FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Actividad</span>
              <select value={filters.activity} onChange={(e) => setF("activity", e.target.value as AudienceFilters["activity"])} className={input}>
                {ACTIVITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Plan</span>
              <select value={planSelect} onChange={(e) => onPlanSelect(e.target.value)} className={input}>
                <option value="">Cualquier plan</option>
                {planOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="__other__">Otro (contiene…)</option>
              </select>
              {planSelect === "__other__" && (
                <input
                  value={filters.planContains}
                  onChange={(e) => {
                    setSelectedListId("");
                    setFilters((prev) => ({ ...prev, planContains: e.target.value }));
                  }}
                  placeholder="ej. Gold"
                  className={input + " mt-2"}
                  autoFocus
                />
              )}
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-paper/10 pt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold text-paper tabular-nums">
                {counting ? "…" : count ?? "—"}
              </span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/50">
                destinatarios
              </span>
            </div>
            <p className="text-xs text-paper/45 max-w-[60%] text-right">{describeFilters(filters)}</p>
          </div>
          <p className="mt-2 text-[0.65rem] text-paper/35 leading-relaxed">
            Siempre se excluyen clientes bloqueados, dados de baja y correos inválidos.
          </p>

          {/* Guardar como lista */}
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <label className="block flex-1 min-w-[160px]">
              <span className={labelCls}>Guardar audiencia como lista</span>
              <input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Nombre de la lista" className={input} />
            </label>
            <button
              type="button"
              onClick={doSaveList}
              disabled={!saveName.trim() || saving}
              className="h-[38px] px-4 inline-flex items-center gap-1.5 border border-paper/15 text-paper/70 hover:border-gold/50 hover:text-gold font-mono text-[0.65rem] uppercase tracking-[0.14em] transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Guardar
            </button>
            {saveMsg && <span className="text-xs text-paper/50 w-full">{saveMsg}</span>}
          </div>
        </section>

        {/* Mensaje */}
        <section className="border border-gold/20 bg-paper/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="size-4 text-gold" strokeWidth={1.75} />
            <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-gold/80">Mensaje</h2>
          </div>
          <div className="space-y-3">
            <label className="block">
              <span className={labelCls}>Asunto</span>
              <input value={draft.subject} onChange={(e) => setD("subject", e.target.value)} maxLength={200} placeholder={SAMPLE.subject} className={input} />
            </label>
            <label className="block">
              <span className={labelCls}>Preheader (texto de vista previa en bandeja)</span>
              <input value={draft.preheader} onChange={(e) => setD("preheader", e.target.value)} maxLength={200} placeholder={SAMPLE.preheader} className={input} />
            </label>
            <label className="block">
              <span className={labelCls}>Encabezado</span>
              <input value={draft.heading} onChange={(e) => setD("heading", e.target.value)} maxLength={150} placeholder={SAMPLE.heading} className={input} />
            </label>
            <label className="block">
              <span className={labelCls}>Cuerpo (separa párrafos con una línea en blanco)</span>
              <textarea value={draft.body} onChange={(e) => setD("body", e.target.value)} maxLength={5000} rows={7} placeholder={SAMPLE.body} className={cn(input, "resize-y")} />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className={labelCls}>Texto del botón (opcional)</span>
                <input value={draft.ctaLabel} onChange={(e) => setD("ctaLabel", e.target.value)} maxLength={60} placeholder="ej. Reserva ahora" className={input} />
              </label>
              <label className="block">
                <span className={labelCls}>URL del botón (opcional)</span>
                <input value={draft.ctaUrl} onChange={(e) => setD("ctaUrl", e.target.value)} maxLength={500} placeholder="https://…" className={input} />
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* ── Columna derecha: preview + envío (sticky) ── */}
      <div className="space-y-4 lg:sticky lg:top-24">
        <section className="border border-gold/20 bg-paper/[0.02] p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-gold" strokeWidth={1.75} />
              <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-gold/80">Vista previa</h2>
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
              title="Vista previa del correo"
              srcDoc={previewHtml}
              sandbox=""
              className="w-full h-[520px] bg-white border border-paper/10"
            />
          ) : (
            <div className="h-[520px] flex items-center justify-center border border-dashed border-paper/15">
              <Loader2 className="size-4 animate-spin text-paper/30" />
            </div>
          )}
        </section>

        {/* Envío */}
        <section className="border border-gold/30 bg-gold/[0.04] p-5">
          {!confirmOpen ? (
            <>
              <button
                type="button"
                onClick={openConfirm}
                disabled={!canSend}
                className="w-full h-12 inline-flex items-center justify-center gap-2 bg-gold text-ink font-medium tracking-tight hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="size-4" strokeWidth={2} />
                Enviar campaña{count ? ` a ${count}` : ""}
              </button>
              {!draftReady && (
                <p className="mt-2 text-[0.65rem] text-paper/45">
                  Falta asunto, encabezado o cuerpo. El texto gris es solo ejemplo: no se envía.
                </p>
              )}
              {draftReady && !count && (
                <p className="mt-2 text-[0.65rem] text-paper/45">La audiencia está vacía.</p>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-amber-300">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-xs leading-relaxed text-paper/80">
                  Vas a enviar a <span className="font-semibold text-paper">{count}</span> personas. Esta acción
                  no se puede deshacer. Escribe <span className="font-mono text-gold">{count}</span> para confirmar.
                </p>
              </div>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                inputMode="numeric"
                placeholder={`Escribe ${count}`}
                className={input}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={doSend}
                  disabled={!confirmMatches || sending}
                  className="flex-1 h-11 inline-flex items-center justify-center gap-2 bg-gold text-ink font-medium hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" strokeWidth={2} />}
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
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
