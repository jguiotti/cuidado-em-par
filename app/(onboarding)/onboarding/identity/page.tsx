import { redirect } from "next/navigation";

import { IdentityStep } from "@/components/onboarding/identity-step";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function IdentityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/identity");
  }

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);
  if (step !== "identity") {
    redirect(pathForOnboardingStep(step));
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, gender_identity")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <IdentityStep
      initialDisplayName={profile?.display_name}
      initialGenderIdentity={profile?.gender_identity}
    />
  );
}
