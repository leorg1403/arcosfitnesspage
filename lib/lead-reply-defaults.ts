/**
 * Texto sugerido para responder un lead. Se muestra como `placeholder` en el
 * composer del panel (nada que borrar: escribir lo reemplaza) y es el valor
 * efectivo si el admin envía sin escribir. Compartido entre la UI y la
 * Server Action (un archivo "use server" no puede exportar constantes).
 */
export const REPLY_DEFAULTS = {
  subject: "Respuesta a tu mensaje · Arcos Fitness Club",
  body:
    "Gracias por escribirnos. Con gusto te compartimos la información.\n\n" +
    "Si quieres, agenda una visita al club o escríbenos por WhatsApp y resolvemos cualquier duda.\n\n" +
    "Quedamos atentos.",
} as const;
