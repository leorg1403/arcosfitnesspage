import Link from "next/link";
import { z } from "zod";
import { getAuditLogs, getAuditAdmins, AUDIT_PAGE_SIZE } from "@/lib/db/audit";
import { AUDIT_AREAS } from "@/lib/audit/types";
import { PageHeader, Badge, type BadgeTone } from "@/components/recepcion/ui";
import { fmtDateTime } from "@/components/recepcion/ui";
import { AuditMetaExpand } from "@/components/recepcion/AuditMetaExpand";
import { ClearOldLogsButton } from "@/components/recepcion/ClearOldLogsButton";

const FiltersSchema = z.object({
  area:    z.string().max(40).optional(),
  action:  z.string().max(80).optional(),
  adminId: z.string().max(40).optional(),
  from:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  q:       z.string().max(100).optional(),
  page:    z.coerce.number().int().min(1).max(100000).optional(),
});

// Colores de badge por área
const AREA_TONE: Record<string, BadgeTone> = {
  auth:       "amber",
  reservas:   "gold",
  clases:     "neutral",
  clientes:   "silver",
  membresias: "green",
  pagos:      "green",
  leads:      "neutral",
  marketing:  "gold",
  analytics:  "neutral",
  sistema:    "silver",
};

// Links de entidad según entityKind
function entityLink(kind: string | null, id: string | null): string | null {
  if (!kind || !id) return null;
  if (kind === "Customer")       return `/recepcion/clientes/${id}`;
  if (kind === "ClassTemplate")  return `/recepcion/clases/${id}`;
  if (kind === "Reservation")    return `/recepcion/reservas`;
  if (kind === "Lead")           return `/recepcion/leads`;
  if (kind === "EmailCampaign")  return `/recepcion/marketing`;
  if (kind === "EmailList")      return `/recepcion/marketing`;
  return null;
}

// Nombre legible del actor
function actorLabel(log: {
  actorKind: string;
  adminName?: string | null;
  adminEmail?: string | null;
}) {
  if (log.actorKind === "admin")    return log.adminName || log.adminEmail || "Admin";
  if (log.actorKind === "customer") return "Cliente";
  return "Sistema";
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const parsed = FiltersSchema.safeParse(sp);
  const f = parsed.success ? parsed.data : {};

  const from = f.from ? new Date(`${f.from}T00:00:00.000Z`) : undefined;
  // Incluir todo el día seleccionado como "hasta"
  const to   = f.to   ? new Date(`${f.to}T23:59:59.999Z`)  : undefined;

  const [{ logs, total, page }, admins] = await Promise.all([
    getAuditLogs({ area: f.area, action: f.action, adminId: f.adminId, from, to, search: f.q, page: f.page }),
    getAuditAdmins(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));

  // Construye la URL de paginación preservando filtros
  function pageUrl(p: number) {
    const params = new URLSearchParams(
      Object.entries({ area: f.area, action: f.action, adminId: f.adminId, from: f.from, to: f.to, q: f.q })
        .filter(([, v]) => Boolean(v))
        .map(([k, v]) => [k, v!])
    );
    params.set("page", String(p));
    return `/recepcion/logs?${params.toString()}`;
  }

  return (
    <>
      <PageHeader
        title="Auditoría"
        subtitle="Historial de todas las mutaciones de datos: admin, clientes y sistema (Stripe)."
        action={<ClearOldLogsButton />}
      />

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <form method="GET" action="/recepcion/logs" className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Área */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-gold/70">Área</label>
          <select
            name="area"
            defaultValue={f.area ?? ""}
            className="border border-paper/15 bg-ink px-3 py-2 font-mono text-xs text-paper/80 focus:outline-none focus:border-gold/40"
          >
            <option value="">Todas</option>
            {Object.values(AUDIT_AREAS).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Acción */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-gold/70">Acción</label>
          <input
            name="action"
            type="text"
            defaultValue={f.action ?? ""}
            placeholder="ej. reservation.cancel"
            maxLength={80}
            className="border border-paper/15 bg-ink px-3 py-2 font-mono text-xs text-paper/80 placeholder:text-paper/25 focus:outline-none focus:border-gold/40"
          />
        </div>

        {/* Administrador */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-gold/70">Administrador</label>
          <select
            name="adminId"
            defaultValue={f.adminId ?? ""}
            className="border border-paper/15 bg-ink px-3 py-2 font-mono text-xs text-paper/80 focus:outline-none focus:border-gold/40"
          >
            <option value="">Todos</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
            ))}
          </select>
        </div>

        {/* Búsqueda libre */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-gold/70">Búsqueda libre</label>
          <input
            name="q"
            type="text"
            defaultValue={f.q ?? ""}
            placeholder="Texto en el resumen…"
            maxLength={100}
            className="border border-paper/15 bg-ink px-3 py-2 font-mono text-xs text-paper/80 placeholder:text-paper/25 focus:outline-none focus:border-gold/40"
          />
        </div>

        {/* Desde */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-gold/70">Desde</label>
          <input
            name="from"
            type="date"
            defaultValue={f.from ?? ""}
            className="border border-paper/15 bg-ink px-3 py-2 font-mono text-xs text-paper/80 focus:outline-none focus:border-gold/40"
          />
        </div>

        {/* Hasta */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-gold/70">Hasta</label>
          <input
            name="to"
            type="date"
            defaultValue={f.to ?? ""}
            className="border border-paper/15 bg-ink px-3 py-2 font-mono text-xs text-paper/80 focus:outline-none focus:border-gold/40"
          />
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="border border-gold/40 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-gold hover:bg-gold/10 transition-colors"
          >
            Filtrar
          </button>
          <Link
            href="/recepcion/logs"
            className="border border-paper/15 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper/55 hover:text-paper transition-colors"
          >
            Limpiar
          </Link>
        </div>
      </form>

      {/* ── Contador ────────────────────────────────────────────────────── */}
      <p className="mb-3 font-mono text-[0.65rem] text-paper/40">
        {total.toLocaleString("es-MX")} registro{total !== 1 ? "s" : ""} · página {page} de {totalPages}
      </p>

      {/* ── Tabla ───────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto border border-gold/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 bg-gold/[0.04]">
              {["Fecha/Hora", "Actor", "Área", "Resumen", "Entidad", "Detalles"].map((c) => (
                <th
                  key={c}
                  className="text-left font-mono text-[0.6rem] uppercase tracking-[0.18em] text-gold/80 px-4 py-3 whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-paper/40 font-mono text-xs uppercase tracking-[0.2em]">
                  Sin registros
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const link = entityLink(log.entityKind, log.entityId);
                return (
                  <tr key={log.id} className="border-b border-paper/5 hover:bg-paper/[0.03] transition-colors align-top">
                    {/* Fecha/Hora CDMX */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-paper/60">
                      {fmtDateTime(log.occurredAt)}
                    </td>
                    {/* Actor */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-paper/80">{actorLabel(log)}</span>
                      {log.ip && (
                        <span className="block font-mono text-[0.55rem] text-paper/30">{log.ip}</span>
                      )}
                    </td>
                    {/* Área */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge tone={AREA_TONE[log.area] ?? "neutral"}>{log.area}</Badge>
                    </td>
                    {/* Resumen */}
                    <td className="px-4 py-3 max-w-sm">
                      <p className="text-xs text-paper/85 leading-snug">{log.summary}</p>
                      <p className="font-mono text-[0.55rem] text-paper/30 mt-0.5">{log.action}</p>
                    </td>
                    {/* Entidad */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.entityKind && (
                        link ? (
                          <Link
                            href={link}
                            className="font-mono text-[0.6rem] text-gold/70 hover:text-gold transition-colors underline underline-offset-2"
                          >
                            {log.entityKind}
                            {log.entityId ? <span className="text-paper/30"> #{log.entityId.slice(0, 8)}</span> : null}
                          </Link>
                        ) : (
                          <span className="font-mono text-[0.6rem] text-paper/40">
                            {log.entityKind}
                            {log.entityId ? <span className="text-paper/25"> #{log.entityId.slice(0, 8)}</span> : null}
                          </span>
                        )
                      )}
                    </td>
                    {/* Detalles (before/after) */}
                    <td className="px-4 py-3">
                      <AuditMetaExpand before={log.before} after={log.after} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ──────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          {page > 1 && (
            <Link
              href={pageUrl(page - 1)}
              className="border border-paper/15 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/55 hover:text-paper transition-colors"
            >
              ← Anterior
            </Link>
          )}
          <span className="font-mono text-[0.6rem] text-paper/35">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={pageUrl(page + 1)}
              className="border border-paper/15 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/55 hover:text-paper transition-colors"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}

      <p className="mt-8 text-[0.65rem] leading-relaxed text-paper/30">
        Registros inmutables de todas las mutaciones de datos. El actor siempre se deriva de la sesión
        del servidor, nunca del cliente. La escritura es best-effort: si falla, la mutación real ya
        se completó. El botón de purga elimina registros con más de 14 días.
      </p>
    </>
  );
}
