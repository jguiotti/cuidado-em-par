import { redirect } from "next/navigation";

import { CycleStep } from "@/components/onboarding/cycle-step";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function CyclePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/cycle");
  }

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);
  if (step !== "cycle") {
    redirect(pathForOnboardingStep(step));
  }

  return <CycleStep />;
}
