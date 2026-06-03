"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/recepcion", label: "Inicio" },
  { href: "/recepcion/reservas", label: "Reservas" },
  { href: "/recepcion/clientes", label: "Clientes" },
  { href: "/recepcion/clases", label: "Clases" },
  { href: "/recepcion/pagos", label: "Pagos" },
  { href: "/recepcion/suscripciones", label: "Membresías" },
  { href: "/recepcion/leads", label: "Leads" },
  { href: "/recepcion/marketing", label: "Marketing" },
];

export function RecepcionNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-1">
      {LINKS.map((l) => {
        const active = l.href === "/recepcion" ? path === "/recepcion" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] border transition-colors",
              active
                ? "border-gold/50 text-gold bg-gold/[0.08]"
                : "border-transparent text-paper/55 hover:text-paper hover:border-paper/15"
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
