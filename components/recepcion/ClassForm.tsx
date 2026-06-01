import type { ClassTemplate } from "@prisma/client";
import { saveClassTemplateAction } from "@/app/actions/admin";

const inputClass =
  "w-full bg-transparent border border-paper/15 focus:border-gold px-3 py-2 text-paper text-sm outline-none [color-scheme:dark]";
const labelClass = "block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/50 mb-1";

const WEEKDAYS = [
  [1, "Lunes"], [2, "Martes"], [3, "Miércoles"], [4, "Jueves"],
  [5, "Viernes"], [6, "Sábado"], [0, "Domingo"],
] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

/** Formulario de alta/edición de una clase del catálogo. */
export function ClassForm({ template }: { template?: ClassTemplate }) {
  const t = template;
  const eventDateValue = t?.eventDate ? t.eventDate.toISOString().slice(0, 10) : "";
  return (
    <form action={saveClassTemplateAction} className="grid sm:grid-cols-2 gap-5 max-w-3xl">
      {t && <input type="hidden" name="id" value={t.id} />}

      <Field label="Nombre">
        <input name="name" defaultValue={t?.name ?? ""} required className={inputClass} />
      </Field>
      <Field label="Categoría">
        <select name="category" defaultValue={t?.category ?? "funcional"} className={inputClass}>
          {["funcional", "hyrox", "boxeo", "open_gym"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>

      <Field label="Tipo">
        <select name="kind" defaultValue={t?.kind ?? "weekly"} className={inputClass}>
          <option value="weekly">Semanal (recurrente)</option>
          <option value="oneoff">Evento puntual</option>
        </select>
      </Field>
      <Field label="Cada cuántas semanas (semanal)">
        <input type="number" name="intervalWeeks" min={1} max={52} defaultValue={t?.intervalWeeks ?? 1} className={inputClass} />
      </Field>

      <Field label="Día (si es semanal)">
        <select name="weekday" defaultValue={t?.weekday ?? ""} className={inputClass}>
          <option value="">—</option>
          {WEEKDAYS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </Field>
      <Field label="Fecha (si es evento puntual)">
        <input type="date" name="eventDate" defaultValue={eventDateValue} className={inputClass} />
      </Field>

      <Field label="Hora inicio (HH:MM)">
        <input name="startTime" defaultValue={t?.startTime ?? "06:10"} pattern="\d{2}:\d{2}" required className={inputClass} />
      </Field>
      <Field label="Duración (min)">
        <input type="number" name="durationMin" min={1} defaultValue={t?.durationMin ?? 50} className={inputClass} />
      </Field>

      <Field label="Instructor">
        <input name="instructor" defaultValue={t?.instructor ?? ""} className={inputClass} />
      </Field>
      <Field label="Sala">
        <input name="room" defaultValue={t?.room ?? ""} className={inputClass} />
      </Field>

      <Field label="Nivel">
        <select name="level" defaultValue={t?.level ?? "todos"} className={inputClass}>
          {["principiante", "intermedio", "avanzado", "todos"].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </Field>
      <Field label="Cupo">
        <input type="number" name="capacity" min={1} defaultValue={t?.capacity ?? 20} className={inputClass} />
      </Field>

      <Field label="Precio override (centavos, vacío = default)">
        <input type="number" name="priceCents" min={0} defaultValue={t?.priceCents ?? ""} className={inputClass} />
      </Field>
      <Field label="Orden">
        <input type="number" name="sortOrder" min={0} defaultValue={t?.sortOrder ?? 0} className={inputClass} />
      </Field>

      <Field label="Imagen (ruta)">
        <input name="image" defaultValue={t?.image ?? "/images/hero/home.jpg"} className={inputClass} />
      </Field>
      <Field label="Descripción">
        <input name="description" defaultValue={t?.description ?? ""} className={inputClass} />
      </Field>

      <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
        <label className="flex items-center gap-2 text-sm text-paper/70">
          <input type="checkbox" name="onlineOnly" defaultChecked={t?.onlineOnly ?? false} className="accent-gold" />
          Solo pago en línea
        </label>
        <label className="flex items-center gap-2 text-sm text-paper/70">
          <input type="checkbox" name="tracksSpots" defaultChecked={t?.tracksSpots ?? true} className="accent-gold" />
          Controla cupos
        </label>
        <label className="flex items-center gap-2 text-sm text-paper/70">
          <input type="checkbox" name="active" defaultChecked={t?.active ?? true} className="accent-gold" />
          Activa
        </label>
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="px-6 h-11 bg-gold text-ink font-medium hover:bg-gold-soft transition-colors"
        >
          {t ? "Guardar cambios" : "Crear clase"}
        </button>
      </div>
    </form>
  );
}
