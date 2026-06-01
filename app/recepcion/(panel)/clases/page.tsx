import Link from "next/link";
import { listClassTemplates } from "@/lib/db/admin";
import {
  toggleClassActiveAction,
  setClassCapacityAction,
} from "@/app/actions/admin";
import { Table, Badge, PageHeader } from "@/components/recepcion/ui";
import { ClassForm } from "@/components/recepcion/ClassForm";
import { DeleteClassButton } from "@/components/recepcion/DeleteClassButton";
import { WEEKDAY_TO_DAY } from "@/lib/booking/window";
import { DAY_LABELS } from "@/lib/classes";

const CATEGORIES = ["funcional", "hyrox", "boxeo", "open_gym"] as const;
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const; // lun..dom

const selectClass =
  "bg-transparent border border-paper/15 focus:border-gold px-3 py-2 text-sm text-paper outline-none [color-scheme:dark]";

export default async function ClasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; day?: string; ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const cat = sp.cat ?? "";
  const dayStr = sp.day ?? "";

  const all = await listClassTemplates();
  const filtered = all.filter((t) => {
    if (cat && t.category !== cat) return false;
    if (dayStr !== "" && !(t.kind === "weekly" && t.weekday === Number(dayStr))) return false;
    if (q) {
      const hay = `${t.name} ${t.instructor} ${t.room} ${t.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const rows = filtered.map((t) => [
    <Link key="n" href={`/recepcion/clases/${t.id}`} className="text-paper hover:text-gold transition-colors">
      {t.name}
    </Link>,
    <Badge key="c" tone="neutral">{t.category}</Badge>,
    t.kind === "weekly"
      ? `${t.weekday != null ? DAY_LABELS[WEEKDAY_TO_DAY[t.weekday]] : "—"} · ${t.startTime}${
          t.intervalWeeks > 1 ? ` (cada ${t.intervalWeeks} sem)` : ""
        }`
      : `${t.eventDate ? t.eventDate.toISOString().slice(0, 10) : "—"} · ${t.startTime}`,
    // Cupo: edición rápida inline (solo si controla cupos).
    t.tracksSpots ? (
      <form key="cap" action={setClassCapacityAction} className="flex items-center gap-1">
        <input type="hidden" name="id" value={t.id} />
        <input
          type="number"
          name="capacity"
          defaultValue={t.capacity}
          min={1}
          max={500}
          className="w-16 bg-transparent border border-paper/15 focus:border-gold px-2 py-1 text-sm text-paper outline-none [color-scheme:dark]"
        />
        <button
          type="submit"
          className="px-2 py-1 border border-gold/40 text-gold hover:bg-gold/10 text-xs transition-colors"
          aria-label="Guardar cupo"
        >
          ✓
        </button>
      </form>
    ) : (
      <span key="cap" className="text-paper/40">∞</span>
    ),
    <Badge key="s" tone={t.active ? "green" : "neutral"}>{t.active ? "activa" : "inactiva"}</Badge>,
    <div key="act" className="flex items-center gap-2">
      <Link
        href={`/recepcion/clases/${t.id}`}
        className="px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border border-paper/15 text-paper/55 hover:border-gold/40 hover:text-gold transition-colors"
      >
        Editar
      </Link>
      <form action={toggleClassActiveAction}>
        <input type="hidden" name="id" value={t.id} />
        <input type="hidden" name="active" value={(!t.active).toString()} />
        <button
          type="submit"
          className="px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] border border-paper/15 text-paper/55 hover:border-gold/40 hover:text-gold transition-colors"
        >
          {t.active ? "Desactivar" : "Activar"}
        </button>
      </form>
      <DeleteClassButton id={t.id} name={t.name} />
    </div>,
  ]);

  return (
    <>
      <PageHeader
        title="Clases"
        subtitle="Catálogo editable. Cambia el cupo en línea, edita o borra cada clase."
      />

      {sp.ok === "deleted" && (
        <div className="mb-5 border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-green-300">
          Clase borrada.
        </div>
      )}
      {sp.err === "reservas" && (
        <div className="mb-5 border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          No se puede borrar: la clase tiene reservas. Mejor <strong>desactívala</strong>.
        </div>
      )}

      {/* Filtros: buscar + categoría + día (GET) */}
      <form method="get" className="flex flex-wrap items-end gap-3 mb-6">
        <label className="block flex-1 min-w-[200px]">
          <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/50 mb-1">
            Buscar
          </span>
          <input
            type="text"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Nombre, instructor, sala…"
            className={selectClass + " w-full placeholder:text-paper/25"}
          />
        </label>
        <label className="block">
          <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/50 mb-1">
            Categoría
          </span>
          <select name="cat" defaultValue={cat} className={selectClass}>
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/50 mb-1">
            Día
          </span>
          <select name="day" defaultValue={dayStr} className={selectClass}>
            <option value="">Todos</option>
            {WEEKDAYS.map((d) => (
              <option key={d} value={d}>{DAY_LABELS[WEEKDAY_TO_DAY[d]]}</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-gold text-ink font-medium text-sm hover:bg-gold-soft transition-colors"
        >
          Filtrar
        </button>
        {(q || cat || dayStr) && (
          <Link
            href="/recepcion/clases"
            className="px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] border border-paper/15 text-paper/55 hover:text-paper transition-colors"
          >
            Limpiar
          </Link>
        )}
      </form>

      <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper/40 mb-3">
        {filtered.length} de {all.length} clases
      </p>

      <Table
        columns={["Clase", "Categoría", "Cuándo", "Cupo", "Estado", ""]}
        rows={rows}
        empty="Sin clases que coincidan"
      />

      <h2 className="font-display text-xl font-semibold text-paper mt-12 mb-5">Nueva clase</h2>
      <ClassForm />
    </>
  );
}
