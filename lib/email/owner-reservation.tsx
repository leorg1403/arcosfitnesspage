import { Heading, Text, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type OwnerReservationProps = {
  className: string;
  classDay: string;
  classTime: string;
  classInstructor: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerMessage?: string;
  /** Si el pago fue procesado online, incluir monto en centavos */
  amountPaid?: number;
  /** Reserva sin pago online: pendiente a cobrar en recepción */
  paymentPending?: boolean;
  /** Monto a cobrar en recepción, en centavos */
  amountDue?: number;
  currency?: string;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function OwnerReservationEmail(p: OwnerReservationProps) {
  const paid = p.amountPaid != null && p.amountPaid > 0;
  const pending = !paid && p.paymentPending === true;
  const currency = p.currency ?? "mxn";

  return (
    <EmailLayout
      preview={
        pending
          ? `Reserva pendiente a pago: ${p.className} · ${p.customerName}`
          : `Nueva reserva${paid ? " paga" : ""}: ${p.className} · ${p.customerName}`
      }
    >
      <Text className="text-[#C4A572] text-[11px] uppercase tracking-[0.22em] font-mono m-0">
        {paid
          ? `Nueva reserva paga · ${formatMoney(p.amountPaid!, currency)}`
          : pending
          ? "Reserva pendiente a pago"
          : "Nueva reserva recibida"}
      </Text>
      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-3 mb-0">
        {p.className}
      </Heading>
      <Text className="text-[#8A8A88] text-sm mt-2 mb-0">
        {p.classDay} · {p.classTime}
      </Text>
      {pending && p.amountDue != null && p.amountDue > 0 && (
        <Text className="text-[#0A0A0A] text-base mt-3 mb-0">
          Cobrar en recepción:{" "}
          <strong>{formatMoney(p.amountDue, currency)}</strong>
        </Text>
      )}

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Cliente
        </Text>
        <Text className="text-[#0A0A0A] text-base font-semibold mt-1 mb-3">
          {p.customerName}
        </Text>
        <Text className="text-[#0A0A0A] text-sm m-0">
          <a href={`mailto:${p.customerEmail}`} style={{ color: "#0A0A0A" }}>{p.customerEmail}</a>
        </Text>
        {p.customerPhone && (
          <Text className="text-[#0A0A0A] text-sm mt-1 mb-0">
            <a
              href={`https://wa.me/52${p.customerPhone.replace(/\D/g, "")}`}
              style={{ color: "#0A0A0A" }}
            >
              {p.customerPhone}
            </a>
          </Text>
        )}
      </Section>

      {p.customerMessage && (
        <>
          <Hr className="border-[#E5E3DC] my-8" />
          <Section>
            <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
              Mensaje del cliente
            </Text>
            <Text className="text-[#0A0A0A] text-base mt-2 mb-0 leading-relaxed">
              {p.customerMessage}
            </Text>
          </Section>
        </>
      )}

      <Hr className="border-[#E5E3DC] my-8" />
    </EmailLayout>
  );
}
