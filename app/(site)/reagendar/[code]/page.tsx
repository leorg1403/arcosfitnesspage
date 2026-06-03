import Link from "next/link";
import type { Metadata } from "next";
import { Check, ArrowRight } from "lucide-react";
import {
  getReservationForReschedule,
  checkRescheduleEligibility,
  type RescheduleReason,
} from "@/lib/db/reservations";
import { getBookableSchedule } from "@/lib/db/sessions";
import { rescheduleByCustomer } from "@/app/actions/reschedule";
import { formatDateLabel } from "@/lib/booking/window";
import { Eyebrow } from "@/components/primitives/Eyebrow";

export const dynamic = "force-dynamic";
// El token va en la URL; no debe indexarse.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ done?: string; e?: string }>;
};

const NOT_ELIGIBLE_MSG: Record<RescheduleReason, string> = {
  not_found: "El enlace no es válido o la reserva ya no existe.",
  not_paid:
    "Esta reserva no es de pago en línea, así que no aplica reagendar aquí. Si necesitas un cambio, escríbenos por WhatsApp.",
  attended: "Esta reserva ya tiene asistencia registrada; ya no se puede reagendar.",
  too_late:
    "Ya no se puede reagendar: tu clase ya pasó o falta menos de 2 horas para que empiece. Escríbenos por WhatsApp y vemos cómo ayudarte.",
  target_invalid: "Esa clase ya no está disponible. Elige otra.",
  price_mismatch: "Solo puedes moverte a una clase del mismo precio.",
  full: "Esa clase se llenó justo ahora. Elige otra.",
  same: "Esa es tu clase actual. Elige una diferente.",
};

export default async function ReagendarPage({ params, searchParams }: Props) {
  const { code } = await params;
  const sp = await searchParams;
  const r = await getReservationForReschedule(code);

  if (sp.done === "1") {
    return (
      <Shell
        title="Reserva reagendada."
        body="Movimos tu reserva a la nueva clase y te enviamos un correo con el detalle. No se hizo ningún cobro nuevo. ¡Te esperamos!"
      />
    );
  }

  if (!r) {
    return (
      <Shell
        tone="warning"
        title="Reserva no encontrada."
        body="El enlace no es válido o la reserva ya no existe. Si crees que es un error, escríbenos por WhatsApp."
      />
    );
  }

  const elig = checkRescheduleEligibility(r);
  if (!elig.ok) {
    return <Shell tone="warning" title="No se puede reagendar." body={NOT_ELIGIBLE_MSG[elig.reason]} />;
  }

  // Elegible → mostrar clases destino (mismo precio, con cupo, distintas a la actual).
  const fromDateISO = r.session.date.toISOString().slice(0, 10);
  const fromTemplateId = r.session.template.id;
  const schedule = await getBookableSchedule();
  const targets = schedule
    .filter(
      (c) =>
        c.tracksSpots &&
        !c.full &&
        Math.round(c.priceMxn * 100) === r.amountDueCents &&
        !(c.templateId === fromTemplateId && c.date === fromDateISO)
    )
    .sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)));

  return (
    <section className="bg-paper section-y min-h-[80svh]">
      <div className="container-wide">
        <div className="max-w-3xl">
          <Eyebrow tone="gold" withLine>
            Reagendar clase
          </Eyebrow>
          <h1 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold text-ink">
            Mueve tu clase a otro horario.
          </h1>

          <div className="mt-8 border border-ink/10 bg-bone/40 px-6 py-5">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-concrete">
              Tu reserva actual
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink">
              {r.session.template.name}
            </p>
            <p className="mt-1 font-mono text-sm uppercase tracking-[0.18em] text-gold">
              {formatDateLabel(fromDateISO)} · {r.session.startTime}
            </p>
          </div>

          <p className="mt-6 text-base leading-relaxed text-ink/70">
            Elige tu nueva clase. No se hace ningún cobro: conservas tu pago. Puedes reagendar
            hasta <span className="font-medium text-ink">2 horas antes</span> del inicio.
          </p>

          {sp.e && (
            <p className="mt-4 text-sm text-red-500">
              {NOT_ELIGIBLE_MSG[sp.e as RescheduleReason] ??
                (sp.e === "rate"
                  ? "Demasiados intentos. Espera un momento."
                  : "No se pudo reagendar. Intenta de nuevo.")}
            </p>
          )}

          <div className="mt-8 space-y-2">
            {targets.length === 0 ? (
              <p className="text-sm text-ink/55">
                No hay otras clases del mismo tipo con cupo por ahora. Escríbenos por WhatsApp y te
                ayudamos.
              </p>
            ) : (
              targets.map((c) => (
                <form
                  key={`${c.templateId}-${c.date}`}
                  action={rescheduleByCustomer}
                  className="group flex items-center justify-between gap-4 border border-ink/10 bg-white px-5 py-4 transition-colors hover:border-gold"
                >
                  <input type="hidden" name="code" value={r.code} />
                  <input type="hidden" name="templateId" value={c.templateId} />
                  <input type="hidden" name="date" value={c.date} />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold text-ink truncate">{c.name}</p>
                    <p className="mt-0.5 font-mono text-xs uppercase tracking-[0.16em] text-concrete">
                      {c.dateLabel} · {c.startTime}
                      {c.availableSpots != null && ` · ${c.availableSpots} lugares`}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="shrink-0 inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 text-sm font-medium tracking-tight hover:bg-graphite transition-colors"
                  >
                    Mover aquí
                    <ArrowRight className="size-4" strokeWidth={2} />
                  </button>
                </form>
              ))
            )}
          </div>

          <div className="mt-10">
            <a
              href="https://wa.me/525591350325"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep"
            >
              ¿Dudas? Escríbenos por WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Shell({
  title,
  body,
  tone = "success",
}: {
  title: string;
  body: string;
  tone?: "success" | "warning";
}) {
  return (
    <section className="bg-paper section-y min-h-[80svh] flex items-center">
      <div className="container-wide">
        <div className="max-w-2xl">
          <div
            className={
              "inline-flex items-center justify-center size-14 rounded-full mb-8 " +
              (tone === "success" ? "bg-gold/15 text-gold" : "bg-ink/5 text-ink/50")
            }
          >
            <Check className="size-6" strokeWidth={2} />
          </div>
          <Eyebrow tone="gold" withLine>
            Reagendar
          </Eyebrow>
          <h1 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold text-ink">
            {title}
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-ink/80 max-w-xl">{body}</p>
          <div className="mt-12 flex flex-wrap gap-5">
            <Link
              href="/clases-reservas"
              className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep"
            >
              Ver clases →
            </Link>
            <a
              href="https://wa.me/525591350325"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-[0.22em] text-concrete hover:text-ink"
            >
              WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
