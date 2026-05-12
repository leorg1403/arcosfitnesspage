import { Heading, Text, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type ClientPurchaseProps = {
  customerName: string;
  planName: string;
  amountTotal: number; // en centavos
  currency: string;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function ClientPurchaseEmail(p: ClientPurchaseProps) {
  return (
    <EmailLayout
      preview={`Bienvenido a Arcos: tu plan ${p.planName} fue activado`}
    >
      <Text className="text-[#C4A572] text-[11px] uppercase tracking-[0.22em] font-mono m-0">
        Pago confirmado
      </Text>
      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-3 mb-0">
        Bienvenido a Arcos,{" "}
        <span style={{ color: "#C4A572" }}>{p.customerName.split(" ")[0]}</span>.
      </Heading>
      <Text className="text-[#0A0A0A] text-base mt-4 mb-0 leading-relaxed">
        Tu pago fue procesado con éxito. El equipo te contactará en las próximas
        24 horas para activar tu membresía y agendar tu visita guiada.
      </Text>

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Resumen
        </Text>
        <Heading className="text-[#0A0A0A] text-2xl font-bold tracking-tight mt-2 mb-1">
          {p.planName}
        </Heading>
        <Text className="text-[#0A0A0A] text-base mt-1 mb-0">
          Total cobrado: <strong>{formatMoney(p.amountTotal, p.currency)}</strong>
        </Text>
      </Section>

      <Hr className="border-[#E5E3DC] my-8" />

      <Text className="text-[#0A0A0A] text-sm leading-relaxed m-0">
        Mientras tanto, prepara tu Análisis Inbody y trae ropa cómoda para tu
        primera sesión.
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
