import { listEmailLists, listCampaigns } from "@/lib/db/marketing";
import { deleteListAction } from "@/app/actions/marketing";
import { CampaignComposer, type ListOption } from "@/components/recepcion/CampaignComposer";
import { PageHeader, Table, Badge, fmtDateTime } from "@/components/recepcion/ui";
import { parseFilters, describeFilters } from "@/lib/marketing/filters";
import { emailIsConfigured } from "@/lib/email";

function statusBadge(s: string) {
  const map: Record<string, { tone: "green" | "red" | "amber" | "neutral"; label: string }> = {
    sent: { tone: "green", label: "enviada" },
    failed: { tone: "red", label: "fallida" },
    sending: { tone: "amber", label: "enviando" },
    draft: { tone: "neutral", label: "borrador" },
  };
  const m = map[s] ?? map.draft;
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export default async function MarketingPage() {
  const [lists, campaigns] = await Promise.all([listEmailLists(), listCampaigns(30)]);

  const listOptions: ListOption[] = lists.map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    filters: parseFilters(l.filters),
  }));

  return (
    <>
      <PageHeader
        title="Marketing"
        subtitle="Crea y envía campañas por correo. Filtra tu audiencia, previsualiza y confirma antes de enviar."
      />

      {!emailIsConfigured && (
        <div className="mb-6 border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3">
          <p className="text-xs leading-relaxed text-amber-200">
            Modo demo: Postmark no está configurado en este entorno. Puedes diseñar y previsualizar
            campañas, pero el envío solo registrará en consola (no se mandan correos).
          </p>
        </div>
      )}

      <CampaignComposer lists={listOptions} />

      {/* Listas guardadas */}
      <div className="mt-12">
        <h2 className="font-display text-xl font-semibold text-paper mb-4">Listas guardadas</h2>
        <Table
          columns={["Nombre", "Audiencia", "Creada", ""]}
          rows={lists.map((l) => [
            <span key="n" className="text-paper">{l.name}</span>,
            <span key="a" className="text-xs text-paper/55">{describeFilters(parseFilters(l.filters))}</span>,
            <span key="c" className="text-xs text-paper/45">{fmtDateTime(l.createdAt)}</span>,
            <form key="d" action={deleteListAction}>
              <input type="hidden" name="id" value={l.id} />
              <button
                type="submit"
                className="px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
              >
                Eliminar
              </button>
            </form>,
          ])}
          empty="Aún no guardas listas. Define filtros y guárdalos arriba."
        />
      </div>

      {/* Historial de campañas */}
      <div className="mt-12">
        <h2 className="font-display text-xl font-semibold text-paper mb-4">Historial de campañas</h2>
        <Table
          columns={["Fecha", "Asunto", "Audiencia", "Enviados", "Fallidos", "Estado"]}
          rows={campaigns.map((c) => [
            <span key="f" className="text-xs text-paper/55">{fmtDateTime(c.sentAt ?? c.createdAt)}</span>,
            <div key="s">
              <div className="text-paper">{c.subject}</div>
              <div className="text-xs text-paper/40">{c.list?.name ?? describeFilters(parseFilters(c.filters))}</div>
            </div>,
            <span key="a" className="tabular-nums text-paper/70">{c.recipientCount}</span>,
            <span key="se" className="tabular-nums text-green-400">{c.sentCount}</span>,
            <span key="fa" className={c.failedCount > 0 ? "tabular-nums text-red-400" : "tabular-nums text-paper/40"}>{c.failedCount}</span>,
            statusBadge(c.status),
          ])}
          empty="Sin campañas enviadas todavía."
        />
      </div>
    </>
  );
}
