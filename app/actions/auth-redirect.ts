"use server";

import { getOnboardingRedirectPath } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

/** After login/signup session: onboarding step or /home. */
export async function getPostAuthRedirectPathAction(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "/login";
  }

  const onboardingPath = await getOnboardingRedirectPath(user.id);
  return onboardingPath ?? "/home";
}
