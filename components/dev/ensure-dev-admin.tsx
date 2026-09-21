import {
  ensureUserIsAdmin,
  isDevAuthBypassEnabled,
} from "@/lib/auth/dev-bypass";
import { createClient } from "@/lib/supabase/server";

/**
 * Local only: keeps the signed-in user as content admin while DEV_AUTH_BYPASS is on.
 * Avoids /admin → /home bounces after switching to the bypass account.
 */
export async function EnsureDevAdmin() {
  if (!isDevAuthBypassEnabled()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) {
    console.error("EnsureDevAdmin is_admin", error.message);
    return null;
  }
  if (isAdmin === true) {
    return null;
  }

  try {
    await ensureUserIsAdmin(user.id);
  } catch (promoteError) {
    console.error("EnsureDevAdmin promote", promoteError);
  }

  return null;
}
