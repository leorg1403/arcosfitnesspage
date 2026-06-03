import { checkRateLimit } from "@/lib/rate-limit";
import { verifyUnsubscribe, unsubscribeSecret } from "@/lib/marketing/unsubscribe";
import { setMarketingOptOut } from "@/lib/db/marketing";

export const dynamic = "force-dynamic";

/**
 * Baja en un clic (RFC 8058). El header List-Unsubscribe-Post de los correos de
 * marketing apunta aquí; los clientes de correo hacen POST cuando el usuario pulsa
 * "Cancelar suscripción" en su bandeja. El token firmado va en `?token=`.
 *
 * Endpoint PÚBLICO y MUTANTE → rate-limit + token firmado. No requiere cuerpo.
 */
export async function POST(req: Request): Promise<Response> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const { rateLimited } = await checkRateLimit("unsubscribe", { ip, request: req });
  if (rateLimited) return new Response("Too Many Requests", { status: 429 });

  const secret = unsubscribeSecret();
  if (!secret) return new Response("Not configured", { status: 500 });

  const token = new URL(req.url).searchParams.get("token");
  const customerId = await verifyUnsubscribe(token, secret);
  if (!customerId) return new Response("Invalid token", { status: 400 });

  await setMarketingOptOut(customerId);
  return new Response("Unsubscribed", { status: 200 });
}
