import { Resend } from "resend";
import type { ReactElement } from "react";

const apiKey = process.env.RESEND_API_KEY;
const isConfigured = Boolean(apiKey && !apiKey.includes("PLACEHOLDER"));

export const OWNER_EMAIL = process.env.OWNER_EMAIL || "info@arcosfitness.com";
export const FROM_EMAIL =
  process.env.FROM_EMAIL || "Arcos Fitness <onboarding@resend.dev>";

const resend = isConfigured ? new Resend(apiKey) : null;

type SendOpts = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

/**
 * Wrapper unificado de Resend.
 * - Si RESEND_API_KEY está configurada → envía email real
 * - Si no → loggea en consola para que el flujo siga funcionando en local
 */
export async function sendEmail({ to, subject, react, replyTo }: SendOpts) {
  if (!resend) {
    // eslint-disable-next-line no-console
    console.log(
      "\n[Email · modo demo · no enviado]\n",
      JSON.stringify({ to, subject, replyTo }, null, 2),
      "\n"
    );
    return { id: "mock", mock: true as const };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    react,
    replyTo,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[Email · error Resend]", error);
    throw new Error(error.message);
  }

  return { id: data?.id ?? "unknown", mock: false as const };
}

export const emailIsConfigured = isConfigured;
