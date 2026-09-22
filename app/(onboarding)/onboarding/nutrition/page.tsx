import { redirect } from "next/navigation";

import { NutritionStep } from "@/components/onboarding/nutrition-step";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";
import { getOnboardingProgressInput } from "@/lib/onboarding/server";
import { createClient } from "@/lib/supabase/server";
import type { DietPattern } from "@/lib/tags/constants";

export default async function NutritionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/nutrition");
  }

  const progress = await getOnboardingProgressInput(user.id);
  const step = resolveOnboardingStep(progress);
  if (step !== "nutrition") {
    redirect(pathForOnboardingStep(step));
  }

  const { data: nutrition } = await supabase
    .from("user_nutrition_profiles")
    .select("diet_pattern, avoids_tags, disliked_foods")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <NutritionStep
      initialDietPattern={
        (nutrition?.diet_pattern as DietPattern | undefined) ??
        "no-restriction"
      }
      initialAvoids={nutrition?.avoids_tags ?? []}
      initialDislikes={nutrition?.disliked_foods ?? []}
    />
  );
}
