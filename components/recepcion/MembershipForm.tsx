"use client";

import { useState } from "react";
import { addMembershipAction } from "@/app/actions/admin";

export type MembershipPackage = {
  id: string;
  name: string;
  priceMxn: number;
  periodicity: string; // "mensual" | "unico" | "custom"
  months?: number;
  days?: number;
};

const inputClass =
  "w-full bg-transparent border border-paper/15 focus:border-gold px-3 py-2 text-sm text-paper outline-none [color-scheme:dark]";
const labelClass = "block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/50 mb-1";

/** Suma meses/días a una fecha ISO (date-only, en UTC para evitar saltos). */
function addToISODate(iso: string, months?: number, days?: number): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (months) d.setUTCMonth(d.getUTCMonth() + months);
  if (days) d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function MembershipForm({
  customerId,
  packages,
  today,
}: {
  customerId: string;
  packages: MembershipPackage[];
  today: string;
}) {
  const first = packages[0];
  const [pkgId, setPkgId] = useState(first?.id ?? "custom");
  const [name, setName] = useState(first?.name ?? "");
  const [price, setPrice] = useState(first ? String(first.priceMxn) : "");
  const [periodicity, setPeriodicity] = useState(first?.periodicity ?? "custom");
  const [startsAt, setStartsAt] = useState(today);
  const [endsAt, setEndsAt] = useState(
    first && (first.months || first.days) ? addToISODate(today, first.months, first.days) : ""
  );

  const isCustom = pkgId === "custom";

  const onSelectPkg = (id: string) => {
    setPkgId(id);
    const p = packages.find((x) => x.id === id);
    if (p && id !== "custom") {
      setName(p.name);
      setPrice(String(p.priceMxn));
      setPeriodicity(p.periodicity);
      setEndsAt(p.months || p.days ? addToISODate(startsAt, p.months, p.days) : "");
    } else {
      setName("");
      setPrice("");
      setPeriodicity("custom");
      setEndsAt("");
    }
  };

  const onStartChange = (v: string) => {
    setStartsAt(v);
    const p = packages.find((x) => x.id === pkgId);
    if (p && pkgId !== "custom" && (p.months || p.days)) {
      setEndsAt(addToISODate(v, p.months, p.days));
    }
  };

  return (
    <form action={addMembershipAction} className="grid sm:grid-cols-2 gap-4 max-w-2xl">
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="planId" value={pkgId} />
      <input type="hidden" name="periodicity" value={periodicity} />

      <label className="block sm:col-span-2">
        <span className={labelClass}>Paquete</span>
        <select
          value={pkgId}
          onChange={(e) => onSelectPkg(e.target.value)}
          className={inputClass}
        >
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.id !== "custom" ? `· $${p.priceMxn.toLocaleString("es-MX")}` : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClass}>Nombre del plan</span>
        <input
          name="planName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          readOnly={!isCustom}
          required
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Precio (MXN)</span>
        <input
          type="number"
          name="priceMxn"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min={0}
          step="0.01"
          required
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Inicia</span>
        <input
          type="date"
          name="startsAt"
          value={startsAt}
          onChange={(e) => onStartChange(e.target.value)}
          required
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Vence (opcional)</span>
        <input
          type="date"
          name="endsAt"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className={labelClass}>Notas (opcional)</span>
        <input name="notes" maxLength={500} className={inputClass} />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="px-6 h-11 bg-gold text-ink font-medium hover:bg-gold-soft transition-colors"
        >
          Agregar membresía
        </button>
      </div>
    </form>
  );
}
