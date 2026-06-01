import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

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
        {/* El header/footer/FAB del sitio público viven en app/(site)/layout.tsx
            (envuelve todas las páginas públicas). /recepcion queda sin ese chrome. */}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
