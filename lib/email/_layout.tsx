import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

/**
 * Layout base para todos los emails transaccionales.
 * Estética minimal premium consistente con el sitio (negro/dorado/serif italic).
 */
export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang="es-MX">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-[#F5F4F0] font-sans m-0 p-0">
          <Container className="max-w-[560px] mx-auto py-12 px-6">
            {/* Header */}
            <Section className="pb-8 border-b border-[#C4A572]">
              <Text className="text-[#C4A572] text-[10px] uppercase tracking-[0.22em] font-mono m-0">
                Arcos Fitness Club
              </Text>
            </Section>

            <Section className="py-8">{children}</Section>

            {/* Footer */}
            <Hr className="border-[#E5E3DC] my-0" />
            <Section className="pt-6">
              <Text className="text-[#8A8A88] text-[10px] uppercase tracking-[0.18em] font-mono m-0">
                Bosques de las Lomas, CDMX
              </Text>
              <Text className="text-[#8A8A88] text-[10px] uppercase tracking-[0.18em] font-mono mt-1 mb-0">
                arcosfitness.com
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
