import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/lib/db/admin";
import {
  setCustomerStatusAction,
  updateCustomerAction,
  cancelMembershipAction,
} from "@/app/actions/admin";
import { Table, Badge, Card, PageHeader, fmtMoney } from "@/components/recepcion/ui";
import { MembershipForm, type MembershipPackage } from "@/components/recepcion/MembershipForm";
import { PLANS, PRE_PAYMENTS } from "@/lib/memberships";
import { cdmxTodayISO } from "@/lib/booking/window";

const inputClass =
  "w-full bg-transparent border border-paper/15 focus:border-gold px-3 py-2 text-sm text-paper outline-none [color-scheme:dark]";
const labelClass = "block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/50 mb-1";

const PREPAY_MONTHS: Record<string, number> = {
  trimestre: 3,
  cuatrimestre: 4,
  semestral: 6,
  anual: 12,
};

function buildPackages(): MembershipPackage[] {
  return [
    ...PLANS.map((p) => ({
      id: p.id,
      name: p.name,
      priceMxn: p.price,
      periodicity: p.periodicity,
      months: p.periodicity === "mensual" ? 1 : undefined,
      days: p.id === "drop-in" ? 7 : undefined,
    })),
    ...PRE_PAYMENTS.map((p) => ({
      id: p.id,
      name: `Anticipado · ${p.label}`,
      priceMxn: p.price,
      periodicity: "unico",
      months: PREPAY_MONTHS[p.id],
    })),
    { id: "custom", name: "Personalizado", priceMxn: 0, periodicity: "custom" },
  ];
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getCustomerDetail(id);
  if (!c) notFound();

  const today = cdmxTodayISO();
  const noShows = c.reservations.filter((r) => r.attendance === "no_show").length;
  const attended = c.reservations.filter((r) => r.attendance === "attended").length;

  const membershipRows = c.memberships.map((m) => {
    const ends = m.endsAt ? m.endsAt.toISOString().slice(0, 10) : null;
    const vigente = m.status === "active" && (!ends || ends >= today);
    const tone = m.status === "cancelled" ? "red" : vigente ? "green" : "neutral";
    const label = m.status === "cancelled" ? "cancelada" : vigente ? "vigente" : "vencida";
    return [
      m.planName,
      fmtMoney(m.priceCents),
      m.startsAt.toISOString().slice(0, 10),
      ends ?? "—",
      <Badge key="s" tone={tone}>{label}</Badge>,
      m.status === "active" ? (
        <form key="x" action={cancelMembershipAction}>
          <input type="hidden" name="id" value={m.id} />
          <input type="hidden" name="customerId" value={c.id} />
          <button
            type="submit"
            className="px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
          >
            Cancelar
          </button>
        </form>
      ) : (
        ""
      ),
    ];
  });

  const resvRows = c.reservations.map((r) => [
    <Link
      key="c"
      href={`/recepcion/reservas?code=${r.shortCode}`}
      className="font-mono tracking-[0.18em] text-gold hover:text-gold-soft underline-offset-2 hover:underline"
    >
      {r.shortCode}
    </Link>,
    r.session.date.toISOString().slice(0, 10),
    r.session.startTime,
    r.session.template.name,
    <Badge key="s" tone={r.status === "confirmed" ? "green" : r.status === "pending" ? "amber" : "neutral"}>
      {r.status}
    </Badge>,
    <Badge key="a" tone={r.attendance === "attended" ? "green" : r.attendance === "no_show" ? "red" : "neutral"}>
      {r.attendance}
    </Badge>,
  ]);

  const payRows = c.payments.map((p) => [
    p.createdAt.toISOString().slice(0, 10),
    <Link key="i" href={`/recepcion/pagos/${p.id}`} className="text-paper hover:text-gold transition-colors">
      {p.itemName}
    </Link>,
    fmtMoney(p.amountTotalCents, p.currency.toUpperCase()),
    <Badge key="s" tone={p.status === "paid" ? "green" : "neutral"}>{p.status}</Badge>,
  ]);

  return (
    <>
      <Link href="/recepcion/clientes" className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper/50 hover:text-gold">
        ← Clientes
      </Link>
      <PageHeader
        title={c.name}
        subtitle={`${c.email}${c.phone ? ` · ${c.phone}` : ""}`}
        action={
          <form action={setCustomerStatusAction}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="status" value={c.status === "blocked" ? "active" : "blocked"} />
            <button
              type="submit"
              className={
                "px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] border transition-colors " +
                (c.status === "blocked"
                  ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
                  : "border-red-500/40 text-red-300 hover:bg-red-500/10")
              }
            >
              {c.status === "blocked" ? "Desbloquear" : "Bloquear"}
            </button>
          </form>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80">Reservas</p>
          <p className="mt-2 font-display text-2xl text-paper">{c.reservations.length}</p>
        </Card>
        <Card>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80">Asistió</p>
          <p className="mt-2 font-display text-2xl text-green-400">{attended}</p>
        </Card>
        <Card>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80">No-shows</p>
          <p className="mt-2 font-display text-2xl text-red-400">{noShows}</p>
        </Card>
      </div>

      {/* Editar datos */}
      <Card className="mb-10">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80 mb-4">Editar datos</p>
        <form action={updateCustomerAction} className="grid sm:grid-cols-2 gap-4">
          <input type="hidden" name="id" value={c.id} />
          <label className="block">
            <span className={labelClass}>Nombre</span>
            <input name="name" defaultValue={c.name} required className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Teléfono</span>
            <input name="phone" defaultValue={c.phone ?? ""} className={inputClass} />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Notas (privadas)</span>
            <input name="notes" defaultValue={c.notes ?? ""} maxLength={2000} className={inputClass} />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="px-5 h-10 bg-gold text-ink font-medium text-sm hover:bg-gold-soft transition-colors">
              Guardar
            </button>
          </div>
        </form>
        <p className="mt-3 text-xs text-paper/40">Correo: {c.email} (clave de vinculación, no editable)</p>
      </Card>

      {/* Membresías */}
      <h2 className="font-display text-xl font-semibold text-paper mb-3">Membresías</h2>
      <Table
        columns={["Plan", "Precio", "Inicia", "Vence", "Estado", ""]}
        rows={membershipRows}
        empty="Sin membresías"
      />

      <div className="mt-6 mb-12 border border-gold/20 bg-paper/[0.02] p-5">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold/80 mb-4">Agregar membresía</p>
        <MembershipForm customerId={c.id} packages={buildPackages()} today={today} />
      </div>

      <h2 className="font-display text-xl font-semibold text-paper mb-3">Historial de reservas</h2>
      <Table
        columns={["Código", "Fecha", "Hora", "Clase", "Estado", "Asistencia"]}
        rows={resvRows}
        empty="Sin reservas"
      />

      <h2 className="font-display text-xl font-semibold text-paper mt-10 mb-3">Pagos</h2>
      <Table columns={["Fecha", "Concepto", "Monto", "Estado"]} rows={payRows} empty="Sin pagos" />
    </>
  );
}
