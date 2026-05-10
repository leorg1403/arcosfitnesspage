import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppFAB } from "@/components/layout/WhatsAppFAB";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
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
    default: "Arcos Fitness Club — Entrena. Recupera. Pertenece.",
    template: "%s · Arcos Fitness Club",
  },
  description:
    "Gimnasio premium en Cuajimalpa, CDMX. Hyrox, clases en grupo, entrenamiento personalizado, spa y comunidad. Reserva tu visita por WhatsApp.",
  keywords: [
    "gimnasio Cuajimalpa",
    "Hyrox CDMX",
    "gimnasio premium",
    "clases funcionales",
    "Arcos Fitness",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Arcos Fitness Club",
    title: "Arcos Fitness Club — Entrena. Recupera. Pertenece.",
    description: "Gimnasio premium en Cuajimalpa. Reserva tu visita por WhatsApp.",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-MX"
      className={`${inter.variable} ${display.variable} ${mono.variable}`}
    >
      <body className="bg-paper text-ink">
        <SiteHeader />
        <main className="min-h-[calc(100dvh-5rem)]">{children}</main>
        <SiteFooter />
        <WhatsAppFAB />
      </body>
    </html>
  );
}
