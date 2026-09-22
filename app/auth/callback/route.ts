import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicSupabaseEnv } from "@/lib/env";

function safeNextPath(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/auth/confirmed";
}

function resolvePostVerifyPath(
  type: string | null,
  nextFromQuery: string,
  hasExplicitNext: boolean,
): string {
  if (type === "recovery" || type === "invite") {
    return "/auth/update-password";
  }
  // Legacy e-mails and default login next pointed at /home — send confirm flow
  // to the success + install screen instead.
  if (!hasExplicitNext || nextFromQuery === "/home") {
    return "/auth/confirmed";
  }
  return nextFromQuery;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const hasExplicitNext = searchParams.has("next");
  const nextFromQuery = safeNextPath(searchParams.get("next"));
  const nextPath = resolvePostVerifyPath(type, nextFromQuery, hasExplicitNext);

  let redirectResponse = NextResponse.redirect(`${origin}${nextPath}`);

  const { url, anonKey } = getPublicSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        redirectResponse = NextResponse.redirect(`${origin}${nextPath}`);
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectResponse;
    }
    console.error("auth/callback exchangeCodeForSession", error.message);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    if (!error) {
      return redirectResponse;
    }
    console.error("auth/callback verifyOtp", error.message);
  }

  // E-mail may already be confirmed even if PKCE cookie exchange failed
  // (Gmail in-app browser ≠ signup browser). Still show success + login.
  if (type === "signup" || type === "email" || !type) {
    return NextResponse.redirect(`${origin}/auth/confirmed`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
