import { Heading, Text, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type ClientReservationProps = {
  customerName: string;
  className: string;
  classDay: string;
  classTime: string;
  classInstructor: string;
  /** Si el pago fue procesado online, incluir monto en centavos */
  amountPaid?: number;
  /** Reserva sin pago online: pendiente a pagar en recepción */
  paymentPending?: boolean;
  /** Monto a pagar en recepción, en centavos */
  amountDue?: number;
  /** Socio: clase incluida en su membresía → sin cobro */
  member?: boolean;
  currency?: string;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function ClientReservationEmail(p: ClientReservationProps) {
  const paid = p.amountPaid != null && p.amountPaid > 0;
  const member = !paid && p.member === true;
  const pending = !paid && !member && p.paymentPending === true;
  const currency = p.currency ?? "mxn";

  return (
    <EmailLayout
      preview={
        paid
          ? `Reserva confirmada: ${p.className} · ${p.classDay}`
          : member
          ? `Reserva apartada (socio): ${p.className} · ${p.classDay}`
          : pending
          ? `Reserva apartada: ${p.className} · ${p.classDay}`
          : `Tu reserva en Arcos: ${p.className} · ${p.classDay}`
      }
    >
      <Text className="text-[#C4A572] text-[11px] uppercase tracking-[0.22em] font-mono m-0">
        {paid
          ? "Reserva confirmada"
          : member
          ? "Reserva de socio"
          : pending
          ? "Reserva apartada"
          : "Reserva recibida"}
      </Text>

      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-3 mb-0">
        Hola{" "}
        <span style={{ color: "#C4A572" }}>{p.customerName.split(" ")[0]}</span>,
      </Heading>

      <Text className="text-[#0A0A0A] text-base mt-4 mb-0 leading-relaxed">
        {paid
          ? "Tu lugar está confirmado y el pago fue procesado con éxito."
          : member
          ? "Apartamos tu lugar. Tu clase está incluida en tu membresía; en recepción validamos tu acceso, sin cobro."
          : pending
          ? "Apartamos tu lugar. Completa tu pago en recepción al llegar al club."
          : "Recibimos tu solicitud. El equipo te confirma cupo en menos de una hora en horario laboral."}
      </Text>

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Resumen
        </Text>
        <Heading className="text-[#0A0A0A] text-2xl font-bold tracking-tight mt-2 mb-1">
          {p.className}
        </Heading>
        <Text className="text-[#0A0A0A] text-base mt-1 mb-0">
          {p.classDay} · {p.classTime}
        </Text>
        {paid && (
          <Text className="text-[#0A0A0A] text-base mt-3 mb-0">
            Total cobrado:{" "}
            <strong>{formatMoney(p.amountPaid!, currency)}</strong>
          </Text>
        )}
        {pending && p.amountDue != null && p.amountDue > 0 && (
          <Text className="text-[#0A0A0A] text-base mt-3 mb-0">
            A pagar en recepción:{" "}
            <strong>{formatMoney(p.amountDue, currency)}</strong>
          </Text>
        )}
        {member && (
          <Text className="text-[#0A0A0A] text-base mt-3 mb-0">
            <strong>Incluido en tu membresía</strong> · sin cobro
          </Text>
        )}
      </Section>

      <Hr className="border-[#E5E3DC] my-8" />

      <Text className="text-[#0A0A0A] text-sm mt-0 mb-0 leading-relaxed">
        Cualquier duda, escríbenos por WhatsApp:{" "}
        <a href="https://wa.me/525591350325" style={{ color: "#C4A572" }}>
          55 9135 0325
        </a>
        .
      </Text>

      {paid && (
        <Text className="text-[#8A8A88] text-xs mt-4 mb-0">
          En caso de requerir factura acudir a recepción.
        </Text>
      )}
    </EmailLayout>
  );
}
