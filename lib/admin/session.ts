/**
 * Firma/verificación de la cookie de sesión de recepción con HMAC-SHA256 vía
 * Web Crypto — funciona TANTO en el middleware (edge) COMO en el servidor (node).
 * NO importa Prisma ni `server-only`: el middleware debe poder usarlo.
 *
 * Token: `${adminId}.${expUnix}.${sigBase64url}` (adminId = cuid sin puntos).
 */
export const SESSION_COOKIE = "arcos_recepcion";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días

const enc = new TextEncoder();

function toB64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(str: string): Uint8Array {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(
  adminId: string,
  secret: string,
  nowMs: number = Date.now()
): Promise<string> {
  const exp = Math.floor(nowMs / 1000) + SESSION_TTL_SECONDS;
  const payload = `${adminId}.${exp}`;
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return `${payload}.${toB64url(sig)}`;
}

/** Devuelve el adminId si la firma es válida y no expiró; null en caso contrario. */
export async function verifySession(
  token: string | undefined | null,
  secret: string,
  nowMs: number = Date.now()
): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [adminId, expStr, sigStr] = parts;
  const exp = Number(expStr);
  if (!adminId || !Number.isFinite(exp) || exp * 1000 < nowMs) return null;
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      fromB64url(sigStr) as BufferSource,
      enc.encode(`${adminId}.${exp}`) as BufferSource
    );
    return ok ? adminId : null;
  } catch {
    return null;
  }
}
