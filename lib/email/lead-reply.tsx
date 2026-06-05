import { Hr, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type LeadReplyProps = {
  /** Nombre del lead (se usa el primer nombre en el saludo). */
  recipientName: string;
  /** Cuerpo de la respuesta: párrafos separados por línea en blanco (\n\n). */
  body: string;
  /** Mensaje original del lead, citado al final para dar contexto. */
  originalMessage: string;
};

function paragraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Respuesta de recepción a un lead del formulario de contacto.
 * Transaccional (stream outbound) → sin link de baja, igual que
 * client-cancellation.
 */
export function LeadReplyEmail(p: LeadReplyProps) {
  const firstName = p.recipientName.trim().split(/\s+/)[0];

  return (
    <EmailLayout preview={p.body.slice(0, 120)}>
      <Text className="text-[#0A0A0A] text-base mt-0 mb-4">
        Hola <span style={{ color: "#C4A572" }}>{firstName}</span>,
      </Text>

      <Section>
        {paragraphs(p.body).map((para, i) => (
          <Text key={i} className="text-[#0A0A0A] text-base leading-relaxed mt-0 mb-4">
            {para}
          </Text>
        ))}
      </Section>

      <Text className="text-[#0A0A0A] text-base mt-2 mb-0">
        — El equipo de Arcos Fitness Club
      </Text>

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Tu mensaje
        </Text>
        <Text className="text-[#8A8A88] text-sm mt-2 mb-0 leading-relaxed">
          {p.originalMessage}
        </Text>
      </Section>
    </EmailLayout>
  );
}
