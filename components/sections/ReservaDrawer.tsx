"use client";

import Image from "next/image";
import { Drawer } from "vaul";
import { type ClassItem, DAY_LABELS } from "@/lib/classes";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { WhatsappIcon } from "@/components/layout/SocialIcons";

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
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm" />
        <Drawer.Content
          className="fixed right-0 top-0 z-50 h-full w-full sm:w-[460px] bg-graphite text-paper outline-none flex flex-col"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">
            {cls ? `Reservar ${cls.name}` : "Detalle de clase"}
          </Drawer.Title>
          {cls && (
            <>
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-7 pt-7 pb-4">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold">
                  Detalle de clase
                </p>
                <button
                  onClick={() => onOpenChange(false)}
                  aria-label="Cerrar"
                  className="relative h-5 w-5 text-paper hover:text-gold transition-colors"
                >
                  <span className="absolute top-1/2 left-0 w-full h-px bg-current rotate-45" />
                  <span className="absolute top-1/2 left-0 w-full h-px bg-current -rotate-45" />
                </button>
              </div>

              {/* Image */}
              <div className="relative h-64 mx-7 overflow-hidden bg-ink">
                <Image
                  src={cls.image}
                  alt={cls.name}
                  fill
                  sizes="460px"
                  className="object-cover grayscale-[20%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-graphite/30 to-transparent" />
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-7 pt-8 pb-8">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-gold">
                  {DAY_LABELS[cls.day]} · {cls.time}
                </p>
                <h2 className="mt-3 font-display text-3xl tracking-[-0.02em] leading-tight font-bold text-paper">
                  {cls.name}
                </h2>
                <p className="mt-3 text-base text-paper/60">
                  con <span className="text-paper">{cls.instructor}</span>
                </p>

                <div className="mt-10 grid grid-cols-2 gap-y-6 gap-x-4">
                  <DetailItem label="Duración" value={`${cls.duration} min`} />
                  <DetailItem label="Espacio" value={cls.room} />
                  <DetailItem label="Cupo" value={`${cls.capacity} pers.`} />
                  <DetailItem label="Nivel" value={cls.level} />
                </div>

                <div className="mt-10 pt-8 border-t border-paper/10">
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete mb-3">
                    Sobre la clase
                  </p>
                  <p className="text-sm leading-relaxed text-paper/70">
                    {cls.description}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-paper/10 px-7 py-5 bg-graphite">
                <Button
                  href={buildWhatsAppLink(
                    WA_MESSAGES.classBooking({
                      name: cls.name,
                      day: DAY_LABELS[cls.day].toLowerCase(),
                      time: cls.time,
                      instructor: cls.instructor,
                    })
                  )}
                  external
                  variant="linkGold"
                  size="md"
                  className="!py-2 flex"
                >
                  <WhatsappIcon className="size-4 shrink-0" />
                  Reservar por WhatsApp
                </Button>
                <p className="mt-3 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete">
                  Sin pagos en línea · Confirmas al llegar
                </p>
              </div>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-concrete">
        {label}
      </p>
      <p className="text-sm font-medium mt-1 text-paper">{value}</p>
    </div>
  );
}
