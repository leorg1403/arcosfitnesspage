import type { Metadata } from "next";
import type { ReactNode } from "react";

// No indexable: el panel privado nunca debe listarse en buscadores.
export const metadata: Metadata = {
  title: "Recepción · Arcos",
  robots: { index: false, follow: false },
};

export default function RecepcionRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-ink text-paper antialiased">{children}</div>;
}
