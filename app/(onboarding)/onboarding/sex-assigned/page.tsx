import { redirect } from "next/navigation";

import { SexAssignedStep } from "@/components/onboarding/sex-assigned-step";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
  type SexAssignedAtBirth,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function SexAssignedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/sex-assigned");
  }

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);
  if (step !== "sex_assigned") {
    redirect(pathForOnboardingStep(step));
  }

  const { data: clinical } = await supabase
    .from("user_clinical_conditions")
    .select("sex_assigned_at_birth")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <SexAssignedStep
      initialValue={
        (clinical?.sex_assigned_at_birth as SexAssignedAtBirth | null) ?? null
      }
    />
  );
}
