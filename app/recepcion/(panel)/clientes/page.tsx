import Link from "next/link";
import { listCustomers } from "@/lib/db/admin";
import { setCustomerStatusAction, createCustomerAction } from "@/app/actions/admin";
import { Table, Badge, Card, PageHeader } from "@/components/recepcion/ui";

const inputClass =
  "w-full bg-transparent border border-paper/15 focus:border-gold px-3 py-2 text-sm text-paper outline-none [color-scheme:dark] placeholder:text-paper/25";

function statusBadge(s: string) {
  const tone = s === "blocked" ? "red" : s === "flagged" ? "amber" : "green";
  return <Badge tone={tone}>{s === "blocked" ? "bloqueado" : s === "flagged" ? "marcado" : "activo"}</Badge>;
}

function BlockToggle({ id, status }: { id: string; status: string }) {
  const next = status === "blocked" ? "active" : "blocked";
  const label = status === "blocked" ? "Desbloquear" : "Bloquear";
  return (
    <form action={setCustomerStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={next} />
      <button
        type="submit"
        className={
          "px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border transition-colors " +
          (status === "blocked"
            ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
            : "border-red-500/40 text-red-300 hover:bg-red-500/10")
        }
      >
        {label}
      </button>
    </form>
  );
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();

  const customers = await listCustomers();
  const filtered = q
    ? customers.filter((c) =>
        `${c.name} ${c.email} ${c.phone ?? ""}`.toLowerCase().includes(q)
      )
    : customers;

  const rows = filtered.map((c) => [
    <Link key="n" href={`/recepcion/clientes/${c.id}`} className="text-paper hover:text-gold transition-colors">
      {c.name}
    </Link>,
    <div key="e" className="text-xs text-paper/50">
      {c.email}
      {c.phone ? <div>{c.phone}</div> : null}
    </div>,
    c.reservations,
    <span key="a" className="text-green-400">{c.attended}</span>,
    <span key="ns" className={c.noShows > 0 ? "text-red-400 font-semibold" : "text-paper/50"}>
      {c.noShows}
    </span>,
    statusBadge(c.status),
    <div key="act" className="flex items-center gap-2">
      <Link
        href={`/recepcion/clientes/${c.id}`}
        className="px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border border-paper/15 text-paper/55 hover:border-gold/40 hover:text-gold transition-colors"
      >
        Ver / editar
      </Link>
      <BlockToggle id={c.id} status={c.status} />
    </div>,
  ]);

  return (
    <>
      <PageHeader title="Clientes" subtitle="Vinculados por correo. Da de alta, edita y asigna membresías." />

      {/* Alta rápida de cliente */}
      <Card className="mb-8">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80 mb-3">
          Nuevo cliente
        </p>
        {sp.err === "datos" && (
          <p className="text-red-300 text-xs mb-3">Revisa los datos (nombre y correo válidos).</p>
        )}
        <form action={createCustomerAction} className="grid sm:grid-cols-4 gap-3 items-end">
          <label className="block">
            <span className="block font-mono text-[0.55rem] uppercase tracking-[0.18em] text-paper/50 mb-1">Nombre</span>
            <input name="name" required placeholder="Nombre completo" className={inputClass} />
          </label>
          <label className="block">
            <span className="block font-mono text-[0.55rem] uppercase tracking-[0.18em] text-paper/50 mb-1">Correo</span>
            <input name="email" type="email" required placeholder="correo@ejemplo.com" className={inputClass} />
          </label>
          <label className="block">
            <span className="block font-mono text-[0.55rem] uppercase tracking-[0.18em] text-paper/50 mb-1">Teléfono</span>
            <input name="phone" placeholder="55 1234 5678" className={inputClass} />
          </label>
          <button
            type="submit"
            className="h-[38px] px-5 bg-gold text-ink font-medium text-sm hover:bg-gold-soft transition-colors"
          >
            Crear cliente
          </button>
        </form>
      </Card>

      {/* Búsqueda */}
      <form method="get" className="flex items-end gap-3 mb-6">
        <label className="block flex-1 max-w-md">
          <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/50 mb-1">Buscar</span>
          <input type="text" name="q" defaultValue={sp.q ?? ""} placeholder="Nombre, correo o teléfono…" className={inputClass} />
        </label>
        <button type="submit" className="px-4 py-2 bg-gold text-ink font-medium text-sm hover:bg-gold-soft transition-colors">
          Buscar
        </button>
        {q && (
          <Link href="/recepcion/clientes" className="px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] border border-paper/15 text-paper/55 hover:text-paper transition-colors">
            Limpiar
          </Link>
        )}
      </form>

      <Table
        columns={["Nombre", "Contacto", "Reservas", "Asistió", "No-shows", "Estado", ""]}
        rows={rows}
        empty="Sin clientes"
      />
    </>
  );
}
