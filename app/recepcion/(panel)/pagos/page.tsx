import { listPayments } from "@/lib/db/admin";
import { Table, Badge, PageHeader, fmtMoney } from "@/components/recepcion/ui";

export default async function PagosPage() {
  const payments = await listPayments();
  const rows = payments.map((p) => [
    p.createdAt.toISOString().slice(0, 10),
    <Badge key="k" tone="neutral">{p.itemKind}</Badge>,
    p.itemName,
    <div key="c">
      <div className="text-paper">{p.customerName}</div>
      <div className="text-xs text-paper/40">{p.customerEmail}</div>
    </div>,
    fmtMoney(p.amountTotalCents, p.currency.toUpperCase()),
    <Badge key="s" tone={p.status === "paid" ? "green" : p.status === "pending" ? "amber" : "red"}>
      {p.status}
    </Badge>,
  ]);
  return (
    <>
      <PageHeader title="Pagos" subtitle="Cobros de Stripe (clase / plan / anticipado)." />
      <Table
        columns={["Fecha", "Tipo", "Concepto", "Cliente", "Monto", "Estado"]}
        rows={rows}
        empty="Aún no hay pagos"
      />
    </>
  );
}
