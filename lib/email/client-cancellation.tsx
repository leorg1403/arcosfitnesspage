import { Heading, Text, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type ClientCancellationProps = {
  customerName: string;
  className: string;
  classDay: string;
  classTime: string;
  reservationCode?: string;
  /** true si la canceló recepción; false si la canceló el propio cliente */
  byAdmin?: boolean;
};

export function ClientCancellationEmail(p: ClientCancellationProps) {
  return (
    <EmailLayout preview={`Reserva cancelada: ${p.className} · ${p.classDay}`}>
      <Text className="text-[#C4A572] text-[11px] uppercase tracking-[0.22em] font-mono m-0">
        Reserva cancelada
      </Text>
      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-3 mb-0">
        Hola <span style={{ color: "#C4A572" }}>{p.customerName.split(" ")[0]}</span>,
      </Heading>
      <Text className="text-[#0A0A0A] text-base mt-4 mb-0 leading-relaxed">
        {p.byAdmin
          ? "Cancelamos tu reserva. Si crees que fue un error, contáctanos o vuelve a reservar."
          : "Tu reserva quedó cancelada. Liberamos tu lugar."}
      </Text>

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Reserva cancelada
        </Text>
        <Heading className="text-[#0A0A0A] text-2xl font-bold tracking-tight mt-2 mb-1">
          {p.className}
        </Heading>
        <Text className="text-[#0A0A0A] text-base mt-1 mb-0">
          {p.classDay} · {p.classTime}
        </Text>
        {p.reservationCode && (
          <Text className="text-[#8A8A88] text-sm mt-2 mb-0">
            Código: <strong style={{ color: "#0A0A0A", letterSpacing: "0.1em" }}>{p.reservationCode}</strong>
          </Text>
        )}
      </Section>

      <Hr className="border-[#E5E3DC] my-8" />

      <Text className="text-[#0A0A0A] text-sm mt-0 mb-0 leading-relaxed">
        ¿Quieres reservar otra clase? Entra a{" "}
        <a href="https://www.arcosfitness.com/clases-reservas" style={{ color: "#C4A572" }}>
          arcosfitness.com/clases-reservas
        </a>{" "}
        o escríbenos por WhatsApp al{" "}
        <a href="https://wa.me/525591350325" style={{ color: "#C4A572" }}>
          55 9135 0325
        </a>
        .
      </Text>
    </EmailLayout>
  );
}
