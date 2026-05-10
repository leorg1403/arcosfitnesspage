"use client";

import Image from "next/image";
import { Drawer } from "vaul";
import { X, MessageCircle, Clock, Users as UsersIcon, MapPin, Award } from "lucide-react";
import { type ClassItem, DAY_LABELS } from "@/lib/classes";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";

type Props = {
  cls: ClassItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReservaDrawer({ cls, open, onOpenChange }: Props) {
  return (
    <Drawer.Root
      direction="right"
      open={open}
      onOpenChange={onOpenChange}
      handleOnly
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm" />
        <Drawer.Content
          className="fixed right-0 top-0 z-50 h-full w-full sm:w-[480px] bg-paper outline-none flex flex-col"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">
            {cls ? `Reservar ${cls.name}` : "Detalle de clase"}
          </Drawer.Title>
          {cls && (
            <>
              {/* Hero image */}
              <div className="relative h-64 sm:h-80 shrink-0 bg-ink">
                <Image
                  src={cls.image}
                  alt={cls.name}
                  fill
                  sizes="480px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent" />
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full bg-paper/90 backdrop-blur hover:bg-paper text-ink transition-all"
                  aria-label="Cerrar"
                >
                  <X className="size-4" strokeWidth={1.75} />
                </button>
                <span className="absolute top-4 left-4 inline-flex items-center bg-paper/95 backdrop-blur text-ink text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full">
                  {cls.category}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-7 pt-6 pb-8">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute">
                  {DAY_LABELS[cls.day]} · {cls.time}
                </p>
                <h2 className="mt-3 font-display text-4xl tracking-tight leading-tight">
                  {cls.name}
                </h2>
                <p className="mt-2 text-base text-mute">
                  con <span className="text-ink font-medium">{cls.instructor}</span>
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <DetailItem icon={Clock} label="Duración" value={`${cls.duration} min`} />
                  <DetailItem icon={MapPin} label="Espacio" value={cls.room} />
                  <DetailItem icon={UsersIcon} label="Cupo" value={`${cls.capacity} pers.`} />
                  <DetailItem icon={Award} label="Nivel" value={cls.level} />
                </div>

                <div className="mt-8 pt-8 border-t border-line">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute mb-3">
                    Sobre la clase
                  </p>
                  <p className="text-sm leading-relaxed text-ink/85">
                    {cls.description}
                  </p>
                </div>

                <div className="mt-8 p-5 rounded-md bg-bone">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-mute mb-2">
                    ¿Cómo funciona?
                  </p>
                  <p className="text-sm leading-relaxed text-ink/80">
                    Al confirmar, abrirá WhatsApp con un mensaje listo para enviar al
                    dueño. Te confirmamos cupo en menos de 1 hora en horario laboral.
                  </p>
                </div>
              </div>

              {/* Sticky footer CTA */}
              <div className="shrink-0 border-t border-line bg-paper p-5">
                <Button
                  href={buildWhatsAppLink(WA_MESSAGES.classBooking({
                    name: cls.name,
                    day: DAY_LABELS[cls.day].toLowerCase(),
                    time: cls.time,
                    instructor: cls.instructor,
                  }))}
                  external
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <MessageCircle className="size-4" strokeWidth={1.75} />
                  Reservar por WhatsApp
                </Button>
                <p className="mt-3 text-xs text-mute text-center">
                  Sin pagos en línea. Confirmas y pagas al asistir.
                </p>
              </div>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 text-mute mt-0.5 shrink-0" strokeWidth={1.5} />
      <div>
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-mute">
          {label}
        </p>
        <p className="text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}
