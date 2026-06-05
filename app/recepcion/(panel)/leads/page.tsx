import { listLeads } from "@/lib/db/admin";
import { PageHeader } from "@/components/recepcion/ui";
import { LeadsPanel, type LeadRow } from "@/components/recepcion/LeadsPanel";

export default async function LeadsPage() {
  const leads = await listLeads();
  const rows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    date: l.lastSubmittedAt.toISOString().slice(0, 10),
    firstName: l.firstName,
    lastName: l.lastName,
    email: l.email,
    message: l.message,
    status: l.status,
    resubmitCount: l.resubmitCount,
  }));
  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Dudas del formulario de contacto. Responde desde aquí: al enviar la respuesta el lead se marca como contactado."
      />
      <LeadsPanel leads={rows} />
    </>
  );
}
