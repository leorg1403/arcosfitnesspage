import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Firma/verifica los links de cancelación de reserva (server-only).
 *
 * No hay base de datos: los datos de la reserva viajan dentro del token y la
 * firma HMAC evita que alguien falsifique una cancelación. Formato del token:
 *   base64url(JSON payload) + "." + base64url(HMAC_SHA256(payload))
 *
 * NO importar desde componentes cliente (usa node:crypto). El cliente solo
 * decodifica el payload para mostrarlo; la verificación ocurre aquí.
 */
const SECRET =
  process.env.RESERVATION_SECRET ||
  // Fallback solo para dev/demo — en producción definir RESERVATION_SECRET.
  "arcos-dev-cancel-secret-change-me";

export type CancelPayload = {
  classId: string;
  name: string;
  email: string;
  /** Epoch ms de expiración del link. */
  exp: number;
};

function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function signCancelToken(
  payload: Pick<CancelPayload, "classId" | "name" | "email"> & { exp?: number }
): string {
  const full: CancelPayload = {
    classId: payload.classId,
    name: payload.name,
    email: payload.email,
    exp: payload.exp ?? Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 días
  };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyCancelToken(token: string): CancelPayload | null {
  if (!token || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  // Comparación en tiempo constante de la firma.
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as CancelPayload;
    if (
      !payload ||
      typeof payload.classId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
