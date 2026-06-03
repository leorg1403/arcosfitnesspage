// Token de baja (unsubscribe) firmado con HMAC-SHA256 (Web Crypto). Va en el link
// de cada correo de marketing y NO expira (un link de baja viejo debe seguir
// funcionando). El token es `${customerId}.${sigBase64url}`: identifica al cliente
// sin exponer un id enumerable y no es falsificable sin el secreto.
//
// Capacidad mínima: el peor caso de un token forjado/filtrado es dar de baja a
// alguien (reversible por el admin); aun así se firma para evitar enumeración.

import { SITE_URL } from "@/lib/urls";

const enc = new TextEncoder();

/** Secreto para firmar tokens de baja. Reusa el de sesión admin si no hay uno propio. */
export function unsubscribeSecret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET || process.env.ADMIN_SESSION_SECRET || null;
}

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

export async function signUnsubscribe(customerId: string, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(customerId)));
  return `${customerId}.${toB64url(sig)}`;
}

/** Devuelve el customerId si la firma es válida; null en caso contrario. */
export async function verifyUnsubscribe(
  token: string | undefined | null,
  secret: string
): Promise<string | null> {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const customerId = token.slice(0, idx);
  const sigStr = token.slice(idx + 1);
  if (!customerId || !sigStr) return null;
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      fromB64url(sigStr) as BufferSource,
      enc.encode(customerId) as BufferSource
    );
    return ok ? customerId : null;
  } catch {
    return null;
  }
}

/** Link humano (página de confirmación) que va visible en el correo. */
export function unsubscribePageUrl(token: string): string {
  return `${SITE_URL}/baja?token=${encodeURIComponent(token)}`;
}

/** Endpoint one-click (RFC 8058) para el header List-Unsubscribe (POST). */
export function unsubscribeOneClickUrl(token: string): string {
  return `${SITE_URL}/api/baja?token=${encodeURIComponent(token)}`;
}
