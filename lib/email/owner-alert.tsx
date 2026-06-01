import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type OwnerAlertProps = {
  title: string;
  body: string;
};

/** Correo de alerta genérico al dueño (contracargos, reembolsos, etc.). */
export function OwnerAlertEmail({ title, body }: OwnerAlertProps) {
  return (
    <EmailLayout preview={title}>
      <Text className="text-[#C4A572] text-[11px] uppercase tracking-[0.22em] font-mono m-0">
        Alerta
      </Text>
      <Heading className="text-[#0A0A0A] text-3xl font-bold tracking-tight mt-3 mb-0">
        {title}
      </Heading>
      <Text className="text-[#0A0A0A] text-base mt-4 mb-0 leading-relaxed">{body}</Text>
    </EmailLayout>
  );
}
