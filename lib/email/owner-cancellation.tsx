import { Heading, Text, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type OwnerCancellationProps = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  className: string;
  classDay: string;
  classTime: string;
  reservationCode?: string;
  /** true: la canceló el cliente desde su enlace; false: la canceló recepción */
  byCustomer?: boolean;
};

export function OwnerCancellationEmail(p: OwnerCancellationProps) {
  return (
    <EmailLayout preview={`Reserva cancelada: ${p.className} · ${p.customerName}`}>
      <Text className="text-[#C4A572] text-[11px] uppercase tracking-[0.22em] font-mono m-0">
        {p.byCustomer ? "Cancelación del cliente" : "Cancelación (recepción)"}
      </Text>
      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-3 mb-0">
        {p.className}
      </Heading>
      <Text className="text-[#8A8A88] text-sm mt-2 mb-0">
        {p.classDay} · {p.classTime}
      </Text>
      {p.reservationCode && (
        <Text className="text-[#8A8A88] text-sm mt-1 mb-0">
          Código:{" "}
          <strong style={{ color: "#0A0A0A", letterSpacing: "0.1em" }}>{p.reservationCode}</strong>
        </Text>
      )}

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Cliente
        </Text>
        <Text className="text-[#0A0A0A] text-base font-semibold mt-1 mb-3">{p.customerName}</Text>
        <Text className="text-[#0A0A0A] text-sm m-0">
          <a href={`mailto:${p.customerEmail}`} style={{ color: "#0A0A0A" }}>{p.customerEmail}</a>
        </Text>
        {p.customerPhone && (
          <Text className="text-[#0A0A0A] text-sm mt-1 mb-0">{p.customerPhone}</Text>
        )}
      </Section>

      <Hr className="border-[#E5E3DC] my-8" />

      <Text className="text-[#8A8A88] text-sm mt-0 mb-0">
        El cupo fue liberado automáticamente.
      </Text>
    </EmailLayout>
  );
}
