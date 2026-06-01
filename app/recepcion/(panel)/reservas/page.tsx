import Link from "next/link";
import { listReservationsByDate, listDatesWithReservations } from "@/lib/db/admin";
import {
  setAttendanceAction,
  sessionNoShowAction,
  cancelReservationAction,
} from "@/app/actions/admin";
import { cdmxTodayISO, formatDateLabel, startInstant } from "@/lib/booking/window";
import { Table, Badge, PageHeader } from "@/components/recepcion/ui";
import { cn } from "@/lib/cn";

const CATS = [
  { key: "", label: "Todas" },
  { key: "funcional", label: "Funcional" },
  { key: "hyrox", label: "Hyrox" },
  { key: "boxeo", label: "Boxeo" },
  { key: "open_gym", label: "Open Gym" },
];

function addMinutesToHHMM(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.floor((total % 1440) / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function kindBadge(k: string) {
  const tone = k === "member" ? "gold" : k === "online" ? "green" : "neutral";
  const label = k === "member" ? "socio" : k === "online" ? "en línea" : "recepción";
  return <Badge tone={tone}>{label}</Badge>;
}
function statusBadge(s: string) {
  const tone = s === "confirmed" ? "green" : s === "pending" ? "amber" : "neutral";
  return <Badge tone={tone}>{s}</Badge>;
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
function phaseBadge(phase: "inProgress" | "upcoming" | "past") {
  if (phase === "inProgress") return <Badge tone="green">En curso</Badge>;
  if (phase === "upcoming") return <Badge tone="amber">Próxima</Badge>;
  return <Badge tone="neutral">Terminada</Badge>;
}

function AttendanceButtons({ id, current }: { id: string; current: string }) {
  const opts = [
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

type Resv = Awaited<ReturnType<typeof listReservationsByDate>>[number];
type Group = {
  sessionId: string;
  name: string;
  category: string;
  startTime: string;
  endTime: string;
  startMs: number;
  phase: "inProgress" | "upcoming" | "past";
  reservations: Resv[];
};

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "") ? (sp.date as string) : cdmxTodayISO();
  const cat = sp.cat ?? "";
  const [all, dates] = await Promise.all([listReservationsByDate(date), listDatesWithReservations()]);
  const now = Date.now();

  const filtered = cat ? all.filter((r) => r.session.template.category === cat) : all;

  // Agrupar por sesión (clase + horario).
  const map = new Map<string, Group>();
  for (const r of filtered) {
    const s = r.session;
    let g = map.get(s.id);
    if (!g) {
      const startMs = startInstant(date, s.startTime);
      const endMs = startMs + s.template.durationMin * 60_000;
      const phase = now < startMs ? "upcoming" : now <= endMs ? "inProgress" : "past";
      g = {
        sessionId: s.id,
        name: s.template.name,
        category: s.template.category,
        startTime: s.startTime,
        endTime: addMinutesToHHMM(s.startTime, s.template.durationMin),
        startMs,
        phase,
        reservations: [],
      };
      map.set(s.id, g);
    }
    g.reservations.push(r);
  }
  const rank = { inProgress: 0, upcoming: 1, past: 2 } as const;
  const groups = [...map.values()].sort((a, b) =>
    rank[a.phase] !== rank[b.phase]
      ? rank[a.phase] - rank[b.phase]
      : a.phase === "past"
      ? b.startMs - a.startMs
      : a.startMs - b.startMs
  );

  return (
    <>
      <PageHeader
        title="Reservas"
        subtitle={`${formatDateLabel(date)} · ${filtered.length} reserva(s) · ${groups.length} clase(s)`}
      />

      {/* Fecha + tipo */}
      <form method="get" className="flex flex-wrap items-end gap-3 mb-4">
        <label className="block">
          <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/50 mb-1">Fecha</span>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="bg-transparent border border-paper/15 focus:border-gold px-3 py-2 text-paper outline-none [color-scheme:dark]"
          />
        </label>
        {cat && <input type="hidden" name="cat" value={cat} />}
        <button type="submit" className="px-4 py-2 bg-gold text-ink font-medium text-sm hover:bg-gold-soft transition-colors">
          Ver
        </button>
        <div className="flex flex-wrap gap-1 ml-auto">
          {dates.slice(0, 6).map((d) => (
            <Link
              key={d}
              href={`/recepcion/reservas?date=${d}${cat ? `&cat=${cat}` : ""}`}
              className={
                "px-2 py-1 font-mono text-[0.6rem] border transition-colors " +
                (d === date ? "border-gold/50 text-gold bg-gold/[0.08]" : "border-paper/10 text-paper/45 hover:text-paper")
              }
            >
              {formatDateLabel(d)}
            </Link>
          ))}
        </div>
      </form>

      {/* Filtro por tipo de clase */}
      <div className="flex flex-wrap gap-1 mb-8">
        {CATS.map((c) => (
          <Link
            key={c.key}
            href={`/recepcion/reservas?date=${date}${c.key ? `&cat=${c.key}` : ""}`}
            className={
              "px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] border transition-colors " +
              (cat === c.key ? "border-gold/50 text-gold bg-gold/[0.08]" : "border-paper/10 text-paper/50 hover:text-paper")
            }
          >
            {c.label}
          </Link>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="font-mono text-sm text-paper/40 py-10 text-center uppercase tracking-[0.2em]">
          Sin reservas para {formatDateLabel(date)}
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div
              key={g.sessionId}
              className={cn("border border-gold/15", g.phase === "past" && "opacity-50")}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gold/15 bg-gold/[0.04]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display text-lg font-semibold text-paper">{g.name}</span>
                  <span className="font-mono text-xs tracking-[0.1em] text-gold">
                    {g.startTime}–{g.endTime}
                  </span>
                  {phaseBadge(g.phase)}
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/40">
                    {g.reservations.length} reserva(s)
                  </span>
                </div>
                <form action={sessionNoShowAction}>
                  <input type="hidden" name="sessionId" value={g.sessionId} />
                  <button
                    type="submit"
                    className="px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    Pendientes → no-show
                  </button>
                </form>
              </div>
              <Table
                columns={["Código", "Cliente", "Tipo", "Estado", "Asistencia", ""]}
                rows={g.reservations.map((r) => [
                  <span key="c" className="font-mono tracking-[0.2em] text-gold">{r.shortCode}</span>,
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
                ])}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
