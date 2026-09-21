import { redirect } from "next/navigation";

import { ClinicalStep } from "@/components/onboarding/clinical-step";
import { filterClinicalConditionSlugs } from "@/lib/clinical/conditions-catalog";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function ClinicalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/clinical");
  }

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);
  if (step !== "clinical") {
    redirect(pathForOnboardingStep(step));
  }

  const { data: clinical } = await supabase
    .from("user_clinical_conditions")
    .select("condition_tags")
    .eq("user_id", user.id)
    .maybeSingle();

  const initialConditions = filterClinicalConditionSlugs(
    clinical?.condition_tags ?? [],
  );

  return <ClinicalStep initialConditions={initialConditions} />;
}
