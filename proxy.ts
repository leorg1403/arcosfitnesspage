import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/admin/session";

/**
 * Proxy (antes "middleware" — renombrado en Next 16). Guarda /recepcion/**: sin
 * sesión válida → redirige al login. Además marca toda la sección como NO
 * INDEXABLE (X-Robots-Tag). El chequeo profundo (admin activo en BD) lo hace
 * assertAdmin() en cada página/acción.
 */
export const config = {
  matcher: ["/recepcion", "/recepcion/:path*"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/recepcion/login";

  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const adminId = secret ? await verifySession(token, secret) : null;

  if (!adminId && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/recepcion/login";
    url.search = "";
    const res = NextResponse.redirect(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  if (adminId && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/recepcion";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
