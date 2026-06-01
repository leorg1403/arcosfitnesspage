import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppFAB } from "@/components/layout/WhatsAppFAB";
import { ScrollProgressBar } from "@/components/layout/ScrollProgressBar";
import { PageTransition } from "@/components/layout/PageTransition";
import { JsonLd } from "@/components/seo/JsonLd";
import { healthClubSchema } from "@/lib/structuredData";

/**
 * Layout del sitio PÚBLICO (marketing). Contiene el header/footer/FAB. El panel
 * /recepcion NO usa este layout (queda limpio) — por eso vive fuera del grupo.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Tira de muestreo para Safari 26 (iOS) — ver nota histórica en el repo. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-1 bg-ink z-[5] md:hidden"
      />
      <JsonLd data={healthClubSchema()} />
      <ScrollProgressBar />
      <SiteHeader />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <WhatsAppFAB />
    </>
  );
}
