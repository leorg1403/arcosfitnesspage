import { ServerClient } from "postmark";
import { render } from "@react-email/components";
import type { ReactElement } from "react";

const apiKey = process.env.POSTMARK_API_KEY;
const isConfigured = Boolean(apiKey && !apiKey.includes("PLACEHOLDER"));

export const OWNER_EMAIL = process.env.OWNER_EMAIL || "info@arcosfitness.com";
export const FROM_EMAIL =
  process.env.FROM_EMAIL || "Arcos Fitness <no-reply@arcosfitness.com>";

const client = isConfigured ? new ServerClient(apiKey as string) : null;

type SendOpts = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
  /**
   * Correo "best-effort" (p. ej. confirmación al cliente): si Postmark falla
   * —típico mientras la cuenta está pendiente de aprobación y no deja enviar
   * fuera del dominio— se loggea un aviso breve y NO se lanza el error.
   */
  optional?: boolean;
};

/**
 * Wrapper unificado de Postmark.
 * - Si POSTMARK_API_KEY está configurada → renderiza el template y envía email real
 * - Si no → loggea en consola para que el flujo siga funcionando en local (modo demo)
 *
 * Los templates son componentes React Email (lib/email/*.tsx); aquí se renderizan a
 * HTML + texto plano y se mandan por el stream "outbound" de Postmark.
 */
export async function sendEmail({ to, subject, react, replyTo, optional }: SendOpts) {
  if (!client) {
    // eslint-disable-next-line no-console
    console.log(
      "\n[Email · modo demo · no enviado]\n",
      JSON.stringify({ to, subject, replyTo }, null, 2),
      "\n"
    );
    return { id: "mock", mock: true as const };
  }

  const [HtmlBody, TextBody] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ]);

  try {
    const res = await client.sendEmail({
      From: FROM_EMAIL,
      To: Array.isArray(to) ? to.join(",") : to,
      Subject: subject,
      HtmlBody,
      TextBody,
      ReplyTo: replyTo,
      MessageStream: "outbound",
    });

    return { id: res.MessageID, mock: false as const };
  } catch (err) {
    if (optional) {
      // Aviso breve, sin stack: no es un fallo que deba romper el flujo.
      console.warn(
        `[Email] no enviado a ${Array.isArray(to) ? to.join(", ") : to} ` +
          `(Postmark pendiente de aprobación o dominio no permitido). Asunto: "${subject}".`
      );
      return { id: null, mock: false as const, skipped: true as const };
    }
    // eslint-disable-next-line no-console
    console.error("[Email · error Postmark]", err);
    throw new Error(err instanceof Error ? err.message : "Error al enviar email");
  }
}

export const emailIsConfigured = isConfigured;
