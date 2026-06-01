import type { ReactNode } from "react";
import { assertAdmin } from "@/lib/admin/guard";
import { adminLogout } from "@/app/actions/admin";
import { RecepcionNav } from "@/components/recepcion/Nav";

// Todas las páginas del panel leen datos en vivo → render dinámico.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const admin = await assertAdmin();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gold/15 bg-ink/80 backdrop-blur sticky top-0 z-10">
        <div className="container-wide py-4 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-lg font-bold tracking-tight text-paper">
              Arcos<span className="text-gold"> · Recepción</span>
            </span>
            <span className="font-mono text-[0.65rem] text-paper/40 hidden sm:inline">
              {admin.email}
            </span>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper/55 hover:text-gold transition-colors"
            >
              Salir →
            </button>
          </form>
        </div>
        <div className="container-wide pb-3 overflow-x-auto">
          <RecepcionNav />
        </div>
      </header>
      <main className="container-wide py-10 flex-1">{children}</main>
    </div>
  );
}
