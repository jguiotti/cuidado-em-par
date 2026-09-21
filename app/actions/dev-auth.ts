"use server";

import {
  createDevLoginTokenHash,
  ensureDevAuthUser,
  isDevAuthBypassEnabled,
} from "@/lib/auth/dev-bypass";
import { createClient } from "@/lib/supabase/server";

export type DevAuthResult =
  | { ok: true }
  | { ok: false; code: "disabled" | "sign_in_failed" | "setup_failed" };

/**
 * Signs in a local fixed user without sending e-mail (avoids Supabase OTP rate limits).
 * Requires DEV_AUTH_BYPASS=true and non-production NODE_ENV.
 */
export async function enterDevSessionAction(): Promise<DevAuthResult> {
  if (!isDevAuthBypassEnabled()) {
    return { ok: false, code: "disabled" };
  }

  let email: string;
  let tokenHash: string;
  try {
    const user = await ensureDevAuthUser();
    email = user.email;
    tokenHash = await createDevLoginTokenHash(email);
  } catch (error) {
    console.error("enterDevSessionAction setup", error);
    return { ok: false, code: "setup_failed" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: tokenHash,
  });

  if (error) {
    console.error("enterDevSessionAction verifyOtp", error.message);
    return { ok: false, code: "sign_in_failed" };
  }

  return { ok: true };
}
