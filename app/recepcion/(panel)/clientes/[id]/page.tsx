import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/lib/db/admin";
import { setCustomerStatusAction } from "@/app/actions/admin";
import { Table, Badge, Card, PageHeader, fmtMoney } from "@/components/recepcion/ui";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getCustomerDetail(id);
  if (!c) notFound();

  const noShows = c.reservations.filter((r) => r.attendance === "no_show").length;
  const attended = c.reservations.filter((r) => r.attendance === "attended").length;

  const resvRows = c.reservations.map((r) => [
    <span key="c" className="font-mono tracking-[0.18em] text-gold">{r.shortCode}</span>,
    r.session.date.toISOString().slice(0, 10),
    r.session.startTime,
    r.session.template.name,
    <Badge key="s" tone={r.status === "confirmed" ? "green" : r.status === "pending" ? "amber" : "neutral"}>
      {r.status}
    </Badge>,
    <Badge
      key="a"
      tone={r.attendance === "attended" ? "green" : r.attendance === "no_show" ? "red" : "neutral"}
    >
      {r.attendance}
    </Badge>,
  ]);

  const payRows = c.payments.map((p) => [
    p.createdAt.toISOString().slice(0, 10),
    p.itemName,
    fmtMoney(p.amountTotalCents, p.currency.toUpperCase()),
    <Badge key="s" tone={p.status === "paid" ? "green" : "neutral"}>{p.status}</Badge>,
  ]);

  return (
    <>
      <Link href="/recepcion/clientes" className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper/50 hover:text-gold">
        ← Clientes
      </Link>
      <PageHeader
        title={c.name}
        subtitle={`${c.email}${c.phone ? ` · ${c.phone}` : ""}`}
        action={
          <form action={setCustomerStatusAction}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="status" value={c.status === "blocked" ? "active" : "blocked"} />
            <button
              type="submit"
              className={
                "px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] border transition-colors " +
                (c.status === "blocked"
                  ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
                  : "border-red-500/40 text-red-300 hover:bg-red-500/10")
              }
            >
              {c.status === "blocked" ? "Desbloquear" : "Bloquear"}
            </button>
          </form>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80">Reservas</p>
          <p className="mt-2 font-display text-2xl text-paper">{c.reservations.length}</p>
        </Card>
        <Card>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80">Asistió</p>
          <p className="mt-2 font-display text-2xl text-green-400">{attended}</p>
        </Card>
        <Card>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80">No-shows</p>
          <p className="mt-2 font-display text-2xl text-red-400">{noShows}</p>
        </Card>
      </div>

      <h2 className="font-display text-xl font-semibold text-paper mb-3">Historial de reservas</h2>
      <Table
        columns={["Código", "Fecha", "Hora", "Clase", "Estado", "Asistencia"]}
        rows={resvRows}
        empty="Sin reservas"
      />

      <h2 className="font-display text-xl font-semibold text-paper mt-10 mb-3">Pagos</h2>
      <Table columns={["Fecha", "Concepto", "Monto", "Estado"]} rows={payRows} empty="Sin pagos" />
    </>
  );
}
