import Link from "next/link";
import { listPayments } from "@/lib/db/admin";
import { Table, Badge, PageHeader, fmtMoney, fmtDateTime, paymentTypeBadge } from "@/components/recepcion/ui";

export default async function PagosPage() {
  const payments = await listPayments();
  const rows = payments.map((p) => [
    <span key="d" className="whitespace-nowrap">{fmtDateTime(p.createdAt)}</span>,
    paymentTypeBadge(p.itemKind),
    <Link key="i" href={`/recepcion/pagos/${p.id}`} className="text-paper hover:text-gold transition-colors">
      {p.itemName}
    </Link>,
    <div key="c">
      {p.customerId ? (
        <Link href={`/recepcion/clientes/${p.customerId}`} className="text-paper hover:text-gold transition-colors">
          {p.customerName}
        </Link>
      ) : (
        <span className="text-paper">{p.customerName}</span>
      )}
      <div className="text-xs text-paper/40">{p.customerEmail}</div>
    </div>,
    fmtMoney(p.amountTotalCents, p.currency.toUpperCase()),
    <Badge
      key="s"
      tone={
        p.status === "paid"
          ? "green"
          : p.status === "pending"
          ? "amber"
          : p.status === "refunded"
          ? "neutral"
          : "red"
      }
    >
      {p.status}
    </Badge>,
    <Link
      key="v"
      href={`/recepcion/pagos/${p.id}`}
      className="px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border border-paper/15 text-paper/55 hover:border-gold/40 hover:text-gold transition-colors"
    >
      Ver
    </Link>,
  ]);
  return (
    <>
      <PageHeader title="Pagos" subtitle="Cobros de Stripe (clase / plan / anticipado). Pica un pago para el detalle." />
      <Table
        columns={["Fecha", "Tipo", "Concepto", "Cliente", "Monto", "Estado", ""]}
        rows={rows}
        empty="Aún no hay pagos"
      />
    </>
  );
}
