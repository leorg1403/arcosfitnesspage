import { Heading, Text, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type OwnerCancellationProps = {
  className: string;
  classDay: string;
  classTime: string;
  customerName: string;
  customerEmail: string;
};

export function OwnerCancellationEmail(p: OwnerCancellationProps) {
  return (
    <EmailLayout preview={`Cancelación: ${p.className} · ${p.customerName}`}>
      <Text className="text-[#C4A572] text-[11px] uppercase tracking-[0.22em] font-mono m-0">
        Reserva cancelada
      </Text>
      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-3 mb-0">
        {p.className}
      </Heading>
      <Text className="text-[#8A8A88] text-sm mt-2 mb-0">
        {p.classDay} · {p.classTime}
      </Text>
      <Text className="text-[#0A0A0A] text-base mt-3 mb-0">
        <strong>{p.customerName}</strong> canceló su reserva.
      </Text>

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Cliente
        </Text>
        <Text className="text-[#0A0A0A] text-base font-semibold mt-1 mb-3">
          {p.customerName}
        </Text>
        <Text className="text-[#0A0A0A] text-sm m-0">
          <a href={`mailto:${p.customerEmail}`} style={{ color: "#0A0A0A" }}>
            {p.customerEmail}
          </a>
        </Text>
      </Section>

      <Hr className="border-[#E5E3DC] my-8" />

      <Text className="text-[#8A8A88] text-xs mt-0 mb-0 leading-relaxed">
        Libera el lugar en tu control de cupos.
      </Text>
    </EmailLayout>
  );
}
