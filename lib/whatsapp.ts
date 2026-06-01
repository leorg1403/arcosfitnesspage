/**
 * WhatsApp del dueño de Arcos Fitness Club.
 * Formato internacional sin signos: 52 (México) + 55 9135 0325.
 */
export const WHATSAPP_NUMBER = "525591350325";

export function buildWhatsAppLink(message: string): string {
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export const WA_MESSAGES = {
  generic:
    "Hola Arcos Fitness, me gustaría más información sobre el club.",
  visit:
    "Hola Arcos Fitness, me gustaría agendar una visita al club.",
  hyrox:
    "Hola Arcos Fitness, me interesa el programa Hyrox. ¿Me pueden dar más información?",
  clases:
    "Hola Arcos Fitness, me interesan las clases. ¿Me pueden dar más información?",
  membresias:
    "Hola Arcos Fitness, me interesan las membresías. ¿Me pueden dar más información?",
  membership: (plan: string) =>
    `Hola Arcos Fitness, me interesa el plan ${plan}. ¿Podemos agendar una visita?`,
  classBooking: (cls: { name: string; day: string; time: string; date?: string }) =>
    `Hola Arcos Fitness, quiero reservar la clase de ${cls.name} el ${cls.day}${cls.date ? ` ${cls.date}` : ""} a las ${cls.time}. ¿Hay cupo disponible?`,
  openGym: (day: string) =>
    `Hola Arcos Fitness, quiero reservar Open Gym el ${day}. ¿Hay disponibilidad?`,
} as const;

/** Mensaje contextual según la sección donde está el usuario al dar clic. */
export function messageForPath(pathname: string): string {
  if (pathname.startsWith("/hyrox")) return WA_MESSAGES.hyrox;
  if (pathname.startsWith("/clases")) return WA_MESSAGES.clases;
  if (pathname.startsWith("/membresias")) return WA_MESSAGES.membresias;
  return WA_MESSAGES.generic;
}
