import { listLeads } from "@/lib/db/admin";
import { Table, Badge, PageHeader } from "@/components/recepcion/ui";

export default async function LeadsPage() {
  const leads = await listLeads();
  const rows = leads.map((l) => [
    l.lastSubmittedAt.toISOString().slice(0, 10),
    `${l.firstName} ${l.lastName}`,
    <span key="e" className="text-xs text-paper/55">{l.email}</span>,
    <span key="m" className="block max-w-md whitespace-normal text-paper/80">{l.message}</span>,
    l.resubmitCount > 0 ? <Badge key="r" tone="amber">{`+${l.resubmitCount}`}</Badge> : "",
  ]);
  return (
    <>
      <PageHeader title="Leads" subtitle="Dudas del formulario de contacto (registro aparte del CRM)." />
      <Table
        columns={["Fecha", "Nombre", "Correo", "Mensaje", "Reenvíos"]}
        rows={rows}
        empty="Sin leads"
      />
    </>
  );
}
