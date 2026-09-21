import { redirect } from "next/navigation";

import { FocusStep } from "@/components/onboarding/focus-step";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";

export default async function FocusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/focus");
  }

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);
  if (step !== "focus") {
    redirect(pathForOnboardingStep(step));
  }

  return <FocusStep initialHealthFocus={progress.healthFocus} />;
}
