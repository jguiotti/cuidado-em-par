import { createClient } from "@/lib/supabase/server";
import type { OnboardingProgressInput } from "@/lib/onboarding/progress";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "@/lib/onboarding/progress";

async function latestConsentAccepted(
  userId: string,
  purpose: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lgpd_consent_logs")
    .select("accepted")
    .eq("user_id", userId)
    .eq("purpose", purpose)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.accepted === true;
}

export async function getOnboardingProgressInput(
  userId: string,
): Promise<OnboardingProgressInput> {
  const supabase = await createClient();

  const [terms, health, profileResult] = await Promise.all([
    latestConsentAccepted(userId, "terms"),
    latestConsentAccepted(userId, "health_personalization"),
    supabase
      .from("user_profiles")
      .select(
        "display_name, health_focus, onboarding_stage, onboarding_completed_at",
      )
      .eq("id", userId)
      .maybeSingle(),
  ]);

  return {
    hasAcceptedTerms: terms,
    hasAcceptedHealthPersonalization: health,
    displayName: profileResult.data?.display_name ?? null,
    healthFocus: profileResult.data?.health_focus ?? null,
    onboardingStage: profileResult.data?.onboarding_stage ?? null,
    onboardingCompletedAt: profileResult.data?.onboarding_completed_at ?? null,
  };
}

export async function getOnboardingRedirectPath(
  userId: string,
): Promise<string | null> {
  const input = await getOnboardingProgressInput(userId);
  const step = resolveOnboardingStep(input);
  if (step === "completed") {
    return null;
  }
  return pathForOnboardingStep(step);
}
