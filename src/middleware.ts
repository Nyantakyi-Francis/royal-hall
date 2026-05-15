import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getEnv } from "@/lib/env";

const PROTECTED_PREFIXES = ["/student", "/admin"];

function getSupabaseAuthCookieKey() {
  const env = getEnv();
  const hostname = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  const projectRef = hostname.split(".")[0] ?? "";
  return `sb-${projectRef}-auth-token`;
}

function hasSupabaseAuthCookie(request: NextRequest) {
  const key = getSupabaseAuthCookieKey();
  const all = request.cookies.getAll();
  return all.some((c) => c.name === key || c.name.startsWith(`${key}.`));
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return response;

  if (!hasSupabaseAuthCookie(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
