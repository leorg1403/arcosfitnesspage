import Link from "next/link";
import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { getReservationByCode } from "@/lib/db/reservations";
import { cancelByCustomer } from "@/app/actions/cancellations";
import { formatDateLabel, WEEKDAY_TO_DAY, weekdayOfISO } from "@/lib/booking/window";
import { GYM_HOURS_BY_DAY } from "@/lib/content";
import { Eyebrow } from "@/components/primitives/Eyebrow";

export const dynamic = "force-dynamic";
// La página tiene el código en la URL; no debe indexarse.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ done?: string; e?: string }>;
};

export default async function CancelarPage({ params, searchParams }: Props) {
  const { code } = await params;
  const sp = await searchParams;
  const r = await getReservationByCode(code);

  if (!r) {
    return (
      <Shell
        tone="warning"
        title="Reserva no encontrada."
        body="El enlace no es válido o la reserva ya no existe. Si crees que es un error, escríbenos por WhatsApp."
      />
    );
  }

  const dateISO = r.session.date.toISOString().slice(0, 10);
  const day = WEEKDAY_TO_DAY[weekdayOfISO(dateISO)];
  const isOpenGym = r.session.template.category === "open_gym";
  const className = r.session.template.name;
  const classDay = formatDateLabel(dateISO);
  const classTime = isOpenGym ? GYM_HOURS_BY_DAY[day] : r.session.startTime;
  const alreadyDone = r.status === "cancelled" || r.status === "expired" || sp.done === "1";

  if (alreadyDone) {
    return (
      <Shell
        title="Reserva cancelada."
        body={`Tu reserva de ${className} (${classDay} · ${classTime}) quedó cancelada y liberamos tu lugar. Te enviamos un correo de confirmación.`}
      />
    );
  }

  return (
    <section className="bg-paper section-y min-h-[80svh] flex items-center">
      <div className="container-wide">
        <div className="max-w-2xl">
          <Eyebrow tone="gold" withLine>
            Cancelar reserva
          </Eyebrow>
          <h1 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold text-ink">
            ¿Cancelar tu reserva?
          </h1>

          <div className="mt-8 border border-ink/10 bg-bone/40 px-6 py-5">
            <p className="font-display text-2xl font-semibold text-ink">{className}</p>
            <p className="mt-1 font-mono text-sm uppercase tracking-[0.18em] text-concrete">
              {classDay} · {classTime}
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-gold">
              Código {r.shortCode}
            </p>
          </div>

          {sp.e === "rate" && (
            <p className="mt-4 text-sm text-red-500">
              Demasiados intentos. Espera un momento e inténtalo de nuevo.
            </p>
          )}

          <p className="mt-6 text-base leading-relaxed text-ink/70">
            Al cancelar, liberamos tu lugar y te llega un correo de confirmación. Esta acción no se
            puede deshacer (tendrías que volver a reservar).
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <form action={cancelByCustomer}>
              <input type="hidden" name="code" value={r.code} />
              <button
                type="submit"
                className="h-12 px-7 inline-flex items-center gap-2 bg-ink text-paper font-medium tracking-tight hover:bg-graphite active:scale-[0.99] transition-all duration-300"
              >
                <X className="size-4" strokeWidth={2} />
                Sí, cancelar mi reserva
              </button>
            </form>
            <Link
              href="/clases-reservas"
              className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep self-center"
            >
              No, conservar →
            </Link>
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
            Cancelación
          </Eyebrow>
          <h1 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold text-ink">
            {title}
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-ink/80 max-w-xl">{body}</p>
          <div className="mt-12">
            <Link
              href="/clases-reservas"
              className="font-mono text-xs uppercase tracking-[0.22em] text-gold hover:text-gold-deep"
            >
              Ver clases →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
