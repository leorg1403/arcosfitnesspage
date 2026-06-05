import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type OwnerLeadProps = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  /** URL del panel de leads (derivada de SITE_URL en el caller). */
  panelUrl: string;
};

/**
 * Aviso al dueño cuando entra un lead nuevo del formulario de contacto.
 * El contenido viene del formulario público (capado por zod); JSX lo escapa.
 */
export function OwnerLeadEmail(p: OwnerLeadProps) {
  const fullName = `${p.firstName} ${p.lastName}`;

  return (
    <EmailLayout preview={`Nuevo lead: ${fullName} · ${p.message.slice(0, 80)}`}>
      <Text className="text-[#C4A572] text-[11px] uppercase tracking-[0.22em] font-mono m-0">
        Nuevo lead · formulario de contacto
      </Text>
      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-3 mb-0">
        {fullName}
      </Heading>

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Pregunta / mensaje
        </Text>
        <Text className="text-[#0A0A0A] text-base mt-2 mb-0 leading-relaxed">{p.message}</Text>
      </Section>

      <Hr className="border-[#E5E3DC] my-8" />

      <Section>
        <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
          Contacto
        </Text>
        <Text className="text-[#0A0A0A] text-base font-semibold mt-1 mb-1">{fullName}</Text>
        <Text className="text-[#0A0A0A] text-sm m-0">
          <a href={`mailto:${p.email}`} style={{ color: "#0A0A0A" }}>
            {p.email}
          </a>
        </Text>
      </Section>

      <Section className="mt-6 mb-2">
        <Button
          href={p.panelUrl}
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
          Responder en el panel
        </Button>
        <Text className="text-[#8A8A88] text-xs leading-relaxed mt-3 mb-0">
          Responde desde el panel de recepción (se marca como contactado) o contesta
          directamente a este correo.
        </Text>
      </Section>
    </EmailLayout>
  );
}
