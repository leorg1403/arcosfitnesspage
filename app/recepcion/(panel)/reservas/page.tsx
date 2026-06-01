import Link from "next/link";
import { listReservationsByDate, listDatesWithReservations } from "@/lib/db/admin";
import { setAttendanceAction, bulkNoShowAction, cancelReservationAction } from "@/app/actions/admin";
import { cdmxTodayISO, formatDateLabel } from "@/lib/booking/window";
import { Table, Badge, PageHeader, fmtMoney } from "@/components/recepcion/ui";

function statusBadge(s: string) {
  const tone = s === "confirmed" ? "green" : s === "pending" ? "amber" : "neutral";
  return <Badge tone={tone}>{s}</Badge>;
}
function kindBadge(k: string) {
  const tone = k === "member" ? "gold" : k === "online" ? "green" : "neutral";
  const label = k === "member" ? "socio" : k === "online" ? "en línea" : "recepción";
  return <Badge tone={tone}>{label}</Badge>;
}
function attendanceBadge(a: string) {
  const map: Record<string, { tone: "green" | "red" | "amber" | "neutral"; label: string }> = {
    attended: { tone: "green", label: "asistió" },
    no_show: { tone: "red", label: "no-show" },
    late_cancel: { tone: "amber", label: "cancel. tarde" },
    pending: { tone: "neutral", label: "pendiente" },
  };
  const m = map[a] ?? map.pending;
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

function AttendanceButtons({ id, current }: { id: string; current: string }) {
  const opts: { value: string; label: string }[] = [
    { value: "attended", label: "Asistió" },
    { value: "no_show", label: "No-show" },
    { value: "pending", label: "Pend." },
  ];
  return (
    <div className="flex gap-1">
      {opts.map((o) => (
        <form action={setAttendanceAction} key={o.value}>
          <input type="hidden" name="reservationId" value={id} />
          <input type="hidden" name="attendance" value={o.value} />
          <button
            type="submit"
            className={
              "px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border transition-colors " +
              (current === o.value
                ? "border-gold/60 text-gold bg-gold/[0.1]"
                : "border-paper/15 text-paper/55 hover:border-gold/40 hover:text-gold")
            }
          >
            {o.label}
          </button>
        </form>
      ))}
    </div>
  );
}

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "") ? (sp.date as string) : cdmxTodayISO();
  const [rows, dates] = await Promise.all([
    listReservationsByDate(date),
    listDatesWithReservations(),
  ]);

  const tableRows = rows.map((r) => [
    <span key="c" className="font-mono tracking-[0.2em] text-gold">{r.shortCode}</span>,
    r.session.startTime,
    r.session.template.name,
    <div key="cust">
      <div className="text-paper">{r.customerName}</div>
      <div className="text-xs text-paper/40">{r.customerEmail}</div>
    </div>,
    kindBadge(r.kind),
    statusBadge(r.status),
    attendanceBadge(r.attendance),
    <div key="act" className="flex items-center gap-2">
      <AttendanceButtons id={r.id} current={r.attendance} />
      {(r.status === "pending" || r.status === "confirmed") && (
        <form action={cancelReservationAction}>
          <input type="hidden" name="reservationId" value={r.id} />
          <button
            type="submit"
            className="px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
          >
            Cancelar
          </button>
        </form>
      )}
    </div>,
  ]);

  return (
    <>
      <PageHeader
        title="Reservas"
        subtitle={`${formatDateLabel(date)} · ${rows.length} reserva(s)`}
        action={
          <form action={bulkNoShowAction}>
            <input type="hidden" name="date" value={date} />
            <button
              type="submit"
              className="px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
            >
              Marcar pendientes como no-show
            </button>
          </form>
        }
      />

      <form method="get" className="flex flex-wrap items-end gap-3 mb-6">
        <label className="block">
          <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/50 mb-1">
            Fecha
          </span>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="bg-transparent border border-paper/15 focus:border-gold px-3 py-2 text-paper outline-none [color-scheme:dark]"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-gold text-ink font-medium text-sm hover:bg-gold-soft transition-colors"
        >
          Ver
        </button>
        <div className="flex flex-wrap gap-1 ml-auto">
          {dates.slice(0, 8).map((d) => (
            <Link
              key={d}
              href={`/recepcion/reservas?date=${d}`}
              className={
                "px-2 py-1 font-mono text-[0.6rem] border transition-colors " +
                (d === date
                  ? "border-gold/50 text-gold bg-gold/[0.08]"
                  : "border-paper/10 text-paper/45 hover:text-paper")
              }
            >
              {formatDateLabel(d)}
            </Link>
          ))}
        </div>
      </form>

      <Table
        columns={["Código", "Hora", "Clase", "Cliente", "Tipo", "Estado", "Asistencia", ""]}
        rows={tableRows}
        empty={`Sin reservas para ${formatDateLabel(date)}`}
      />
    </>
  );
}
