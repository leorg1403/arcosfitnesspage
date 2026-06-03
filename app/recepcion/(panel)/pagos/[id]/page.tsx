import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getPaymentDetail } from "@/lib/db/admin";
import { Badge, Card, PageHeader, fmtMoney, PAYMENT_TYPE_LABEL } from "@/components/recepcion/ui";

function fmtDateTime(d: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-3 py-2.5 border-b border-paper/5 last:border-0">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-paper/85 text-right break-all">{children}</span>
    </div>
  );
}

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPaymentDetail(id);
  if (!p) notFound();

  const currency = p.currency.toUpperCase();

  return (
    <>
      <Link href="/recepcion/pagos" className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper/50 hover:text-gold">
        ← Pagos
      </Link>
      <PageHeader
        title={p.itemName}
        subtitle={fmtMoney(p.amountTotalCents, currency)}
        action={
          <Badge
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
          </Badge>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80 mb-3">Pago</p>
          <Row label="Concepto">{p.itemName}</Row>
          <Row label="Tipo">{PAYMENT_TYPE_LABEL[p.itemKind] ?? p.itemKind}</Row>
          <Row label="Monto">{fmtMoney(p.amountTotalCents, currency)}</Row>
          <Row label="Estado">{p.status}</Row>
          <Row label="Fecha">{fmtDateTime(p.createdAt)}</Row>
          {p.stripeSessionId && (
            <Row label="Stripe session">
              <span className="font-mono text-xs">{p.stripeSessionId}</span>
            </Row>
          )}
          {p.stripeInvoiceId && (
            <Row label="Factura Stripe">
              <span className="font-mono text-xs">{p.stripeInvoiceId}</span>
            </Row>
          )}
          {p.stripePaymentIntentId && (
            <Row label="Payment intent">
              <span className="font-mono text-xs">{p.stripePaymentIntentId}</span>
            </Row>
          )}
          {p.stripeSubscriptionId && (
            <Row label="Subscription id">
              <span className="font-mono text-xs">{p.stripeSubscriptionId}</span>
            </Row>
          )}
        </Card>

        <Card>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80 mb-3">Cliente</p>
          <Row label="Nombre">
            {p.customer ? (
              <Link href={`/recepcion/clientes/${p.customer.id}`} className="text-gold hover:text-gold-soft">
                {p.customer.name}
              </Link>
            ) : (
              p.customerName
            )}
          </Row>
          <Row label="Correo">{p.customerEmail}</Row>
          {p.customerPhone && <Row label="Teléfono">{p.customerPhone}</Row>}

          {p.reservation && (
            <>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80 mt-6 mb-3">
                Reserva
              </p>
              <Row label="Código">
                <Link
                  href={`/recepcion/reservas?code=${p.reservation.shortCode}`}
                  className="font-mono tracking-[0.18em] text-gold hover:text-gold-soft"
                >
                  {p.reservation.shortCode}
                </Link>
              </Row>
              <Row label="Clase">{p.reservation.session.template.name}</Row>
              <Row label="Cuándo">
                {p.reservation.session.date.toISOString().slice(0, 10)} · {p.reservation.session.startTime}
              </Row>
              <Row label="Estado">
                {p.reservation.status} · {p.reservation.attendance}
              </Row>
            </>
          )}

          {p.subscription && (
            <>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80 mt-6 mb-3">
                Suscripción
              </p>
              <Row label="Plan">{p.subscription.planName}</Row>
              <Row label="Estado">{p.subscription.status}</Row>
              {p.subscription.currentPeriodEnd && (
                <Row label="Vigente hasta">
                  {p.subscription.currentPeriodEnd.toISOString().slice(0, 10)}
                </Row>
              )}
            </>
          )}
        </Card>
      </div>
    </>
  );
}
