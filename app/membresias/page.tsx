import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { MembershipCards } from "@/components/sections/MembershipCards";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { CommonAmenities } from "@/components/sections/CommonAmenities";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { CTASection } from "@/components/sections/CTASection";
import { MEMBERSHIP_FAQS } from "@/lib/memberships";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Membresías",
  description:
    "Tres planes para pertenecer a Arcos Fitness Club. Sin contratos, sin letras chiquitas. Compara, elige y reserva tu visita por WhatsApp.",
};

export default function MembresiasPage() {
  return (
    <>
      <PageHero
        number="01"
        eyebrow="Planes"
        title={
          <>
            Encuentra
            <br />
            <span className="italic">tu plan.</span>
          </>
        }
        subtitle="Sin contratos. Sin letras chiquitas. Cancela cuando quieras avisando con 30 días. Tres formas de empezar, una sola comunidad."
      />

      <MembershipCards compact />

      <ComparisonTable />

      <CommonAmenities />

      <section className="bg-paper section-y">
        <div className="container-app">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <Eyebrow number="04">Preguntas frecuentes</Eyebrow>
              <h2 className="mt-6 font-display text-h1 leading-[0.95] tracking-tight">
                Sin sorpresas.
              </h2>
              <p className="mt-6 text-mute leading-relaxed max-w-sm">
                Todo lo que un nuevo miembro pregunta antes de empezar. Si falta algo,
                escríbenos directo.
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <Accordion items={MEMBERSHIP_FAQS} />
              <div className="mt-10">
                <Button
                  href={buildWhatsAppLink(WA_MESSAGES.generic)}
                  external
                  variant="dark"
                  size="lg"
                >
                  <MessageCircle className="size-4" strokeWidth={1.75} />
                  Hablar con el dueño
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
