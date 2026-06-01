import Link from "next/link";
import { listCustomers } from "@/lib/db/admin";
import { setCustomerStatusAction } from "@/app/actions/admin";
import { Table, Badge, PageHeader } from "@/components/recepcion/ui";

function statusBadge(s: string) {
  const tone = s === "blocked" ? "red" : s === "flagged" ? "amber" : "green";
  return <Badge tone={tone}>{s === "blocked" ? "bloqueado" : s === "flagged" ? "marcado" : "activo"}</Badge>;
}

function BlockToggle({ id, status }: { id: string; status: string }) {
  const next = status === "blocked" ? "active" : "blocked";
  const label = status === "blocked" ? "Desbloquear" : "Bloquear";
  return (
    <form action={setCustomerStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={next} />
      <button
        type="submit"
        className={
          "px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border transition-colors " +
          (status === "blocked"
            ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
            : "border-red-500/40 text-red-300 hover:bg-red-500/10")
        }
      >
        {label}
      </button>
    </form>
  );
}

export default async function ClientesPage() {
  const customers = await listCustomers();
  const rows = customers.map((c) => [
    <Link key="n" href={`/recepcion/clientes/${c.id}`} className="text-paper hover:text-gold transition-colors">
      {c.name}
    </Link>,
    <div key="e" className="text-xs text-paper/50">
      {c.email}
      {c.phone ? <div>{c.phone}</div> : null}
    </div>,
    c.reservations,
    <span key="a" className="text-green-400">{c.attended}</span>,
    <span key="ns" className={c.noShows > 0 ? "text-red-400 font-semibold" : "text-paper/50"}>
      {c.noShows}
    </span>,
    statusBadge(c.status),
    <BlockToggle key="b" id={c.id} status={c.status} />,
  ]);

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Vinculados por correo. Bloquea a quien reserva y no asiste."
      />
      <Table
        columns={["Nombre", "Contacto", "Reservas", "Asistió", "No-shows", "Estado", ""]}
        rows={rows}
        empty="Aún no hay clientes"
      />
    </>
  );
}
