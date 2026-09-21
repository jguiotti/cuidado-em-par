import { redirect } from "next/navigation";

import { getSuggestedWaterGoalAction } from "@/app/actions/onboarding";
import { HabitsStep } from "@/components/onboarding/habits-step";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function HabitsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/habits");
  }

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);
  if (step !== "habits") {
    redirect(pathForOnboardingStep(step));
  }

  const waterGoal = await getSuggestedWaterGoalAction();

  return <HabitsStep initialWaterGoalMl={waterGoal} />;
}
