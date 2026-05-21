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
    "Hola Arcos Fitness 👋, me gustaría más información sobre el club.",
  visit:
    "Hola Arcos Fitness 👋, me gustaría agendar una visita al club.",
  hyrox:
    "Hola Arcos Fitness 👋, estoy interesado en el programa Hyrox. ¿Podemos hablar?",
  membership: (plan: string) =>
    `Hola Arcos Fitness 👋, me interesa el plan ${plan}. ¿Podemos agendar una visita?`,
  classBooking: (cls: { name: string; day: string; time: string; instructor: string }) =>
    `Hola Arcos Fitness 👋, quiero reservar la clase de ${cls.name} el ${cls.day} a las ${cls.time} con ${cls.instructor}. ¿Hay cupo disponible?`,
  openGym: (day: string) =>
    `Hola Arcos Fitness 👋, quiero reservar Open Gym el ${day}. ¿Hay disponibilidad?`,
} as const;
