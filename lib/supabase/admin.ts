import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv, getServiceRoleKey } from "@/lib/env";

/**
 * Service-role client. Server-only. Never import from Client Components.
 * Prefer the anon SSR client + RLS for person-scoped data.
 */
export function createAdminClient() {
  const { url } = getPublicSupabaseEnv();
  return createSupabaseClient(url, getServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
