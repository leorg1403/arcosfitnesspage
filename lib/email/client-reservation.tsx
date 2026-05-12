import { Heading, Text, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type ClientReservationProps = {
  customerName: string;
  className: string;
  classDay: string;
  classTime: string;
  classInstructor: string;
};

export function ClientReservationEmail(p: ClientReservationProps) {
  return (
    <EmailLayout preview={`Tu reserva en Arcos: ${p.className} · ${p.classDay}`}>
      <Text className="text-[#8A8A88] text-[11px] uppercase tracking-[0.22em] font-mono m-0">
        Reserva recibida
      </Text>
      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-3 mb-0">
        Hola {p.customerName.split(" ")[0]},
      </Heading>
      <Text className="text-[#0A0A0A] text-base mt-4 mb-0 leading-relaxed">
        Recibimos tu solicitud de reserva. El equipo te confirma cupo en menos de
        una hora en horario laboral.
      </Text>

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Detalle
        </Text>
        <Heading className="text-[#0A0A0A] text-2xl font-bold tracking-tight mt-2 mb-1">
          {p.className}
        </Heading>
        <Text className="text-[#8A8A88] text-sm m-0">
          {p.classDay} · {p.classTime}
        </Text>
        <Text className="text-[#8A8A88] text-sm mt-1 mb-0">
          con {p.classInstructor}
        </Text>
      </Section>

      <Hr className="border-[#E5E3DC] my-8" />

      <Text className="text-[#0A0A0A] text-sm leading-relaxed m-0">
        Llega 10 minutos antes para registro. El pago se realiza en mostrador al
        asistir.
      </Text>
      <Text className="text-[#0A0A0A] text-sm mt-4 mb-0 leading-relaxed">
        Cualquier duda, escríbenos por WhatsApp:{" "}
        <a href="https://wa.me/525591350325" style={{ color: "#C4A572" }}>
          55 9135 0325
        </a>
        .
      </Text>
    </EmailLayout>
  );
}
