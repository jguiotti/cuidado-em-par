import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * When terms are revoked, only Conta (and auth) remain available.
 * Call from app pages other than /account.
 */
export async function redirectIfTermsRevoked() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("lgpd_consent_logs")
    .select("accepted")
    .eq("user_id", user.id)
    .eq("purpose", "terms")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data?.accepted !== true) {
    redirect("/account");
  }
}
