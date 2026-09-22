import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const publicPaths = new Set(["/", "/login", "/terms", "/dev/login"]);

function isPublicPath(pathname: string) {
  if (publicPaths.has(pathname)) {
    return true;
  }
  if (pathname.startsWith("/auth/")) {
    return true;
  }
  return false;
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAppPath(pathname: string) {
  return (
    pathname.startsWith("/home") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/workouts") ||
    pathname.startsWith("/meals") ||
    pathname.startsWith("/habits") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/circle") ||
    pathname.startsWith("/account")
  );
}

export async function proxy(request: NextRequest) {
  const { user, response } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (user && (pathname === "/login" || pathname === "/")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/home";
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // PWA shell assets must stay reachable without auth redirects.
  if (
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/icons/")
  ) {
    return response;
  }

  if (!user && (isAppPath(pathname) || isAdminPath(pathname))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin authorization is enforced in app/(admin)/layout.tsx only.
  // Edge RPC denials here caused false /home redirects and soft-nav CSS breakage.

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
