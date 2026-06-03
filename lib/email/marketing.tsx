import { Heading, Text, Section, Hr, Button, Link } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type MarketingEmailProps = {
  /** Texto de previsualización (inbox). */
  preheader?: string;
  /** Encabezado principal del mensaje. */
  heading: string;
  /** Cuerpo: párrafos separados por línea en blanco (\n\n). */
  body: string;
  /** Botón de acción (ambos requeridos para mostrarlo). */
  ctaLabel?: string;
  ctaUrl?: string;
  /** Nombre del destinatario (saludo). Opcional. */
  recipientName?: string;
  /** Link de baja (unsubscribe) — OBLIGATORIO en marketing. */
  unsubscribeUrl: string;
};

function paragraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function MarketingEmail(p: MarketingEmailProps) {
  const firstName = p.recipientName?.trim().split(/\s+/)[0];
  const hasCta = Boolean(p.ctaLabel && p.ctaUrl);

  return (
    <EmailLayout preview={p.preheader || p.heading}>
      {firstName && (
        <Text className="text-[#0A0A0A] text-base mt-0 mb-4">
          Hola <span style={{ color: "#C4A572" }}>{firstName}</span>,
        </Text>
      )}

      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-0 mb-0">
        {p.heading}
      </Heading>

      <Section className="mt-5">
        {paragraphs(p.body).map((para, i) => (
          <Text key={i} className="text-[#0A0A0A] text-base leading-relaxed mt-0 mb-4">
            {para}
          </Text>
        ))}
      </Section>

      {hasCta && (
        <Section className="mt-2 mb-2">
          <Button
            href={p.ctaUrl}
            style={{
              backgroundColor: "#C4A572",
              color: "#0A0A0A",
              fontWeight: 600,
              fontSize: "14px",
              padding: "12px 28px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            {p.ctaLabel}
          </Button>
        </Section>
      )}

      <Hr className="border-[#E5E3DC] my-8" />

      <Text className="text-[#8A8A88] text-xs leading-relaxed mt-0 mb-0">
        Recibes este correo porque eres parte de la comunidad Arcos Fitness.{" "}
        <Link href={p.unsubscribeUrl} style={{ color: "#8A8A88", textDecoration: "underline" }}>
          Darte de baja
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}
