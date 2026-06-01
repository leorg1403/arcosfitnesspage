import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppFAB } from "@/components/layout/WhatsAppFAB";
import { ScrollProgressBar } from "@/components/layout/ScrollProgressBar";
import { PageTransition } from "@/components/layout/PageTransition";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/seo/JsonLd";
import { healthClubSchema } from "@/lib/structuredData";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.arcosfitness.com"),
  title: {
    default: "Arcos Fitness Club — Fuerza. Recuperación. Comunidad.",
    template: "%s · Arcos Fitness Club",
  },
  description:
    "Club privado de fitness en Bosques de las Lomas, CDMX. Hyrox, clases en grupo, entrenamiento personalizado, spa y comunidad. Reserva tu visita por WhatsApp.",
  keywords: [
    "gimnasio Bosques de las Lomas",
    "Hyrox CDMX",
    "gimnasio premium",
    "clases funcionales",
    "Arcos Fitness Club",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Arcos Fitness Club",
    title: "Arcos Fitness Club",
    description: "Un club privado en Bosques de las Lomas. Reserva tu visita por WhatsApp.",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-MX"
      className={`${inter.variable} ${serif.variable} ${mono.variable}`}
    >
      <body className="bg-ink text-ink">
        {/* Tiras de muestreo para Safari 26 (iOS): el navegador tiñe su status
            bar y su tool bar inferior muestreando el background-color de
            elementos fixed cerca de los bordes (ya NO respeta theme-color).
            Estas tiras ink le dan un color sólido y determinista a ambas barras.
            La de arriba queda detrás del header; solo en móvil. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 h-1 bg-ink z-[5] md:hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 bottom-0 h-1 bg-ink z-[5] md:hidden"
        />
        <JsonLd data={healthClubSchema()} />
        <ScrollProgressBar />
        <SiteHeader />
        <main>
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <WhatsAppFAB />
        <Analytics />
      </body>
    </html>
  );
}
