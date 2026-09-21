import type { HealthFocus } from "@/lib/tags/constants";
import { HEALTH_FOCUS_VALUES } from "@/lib/tags/constants";

export const ONBOARDING_TOTAL_STEPS = 8;

export const SEX_ASSIGNED_VALUES = [
  "female",
  "male",
  "intersex",
  "prefer_not_to_say",
] as const;

export type SexAssignedAtBirth = (typeof SEX_ASSIGNED_VALUES)[number];

export const MOBILITY_VALUES = [
  "full",
  "wheelchair",
  "reduced",
] as const;

export type MobilityProfile = (typeof MOBILITY_VALUES)[number];

export const ONBOARDING_STAGES = [
  "sex_assigned",
  "clinical",
  "mobility",
  "nutrition",
  "cycle",
  "habits",
  "completed",
] as const;

export type OnboardingStage = (typeof ONBOARDING_STAGES)[number];

export type OnboardingStep =
  | "consent"
  | "identity"
  | "focus"
  | OnboardingStage;

export interface OnboardingProgressInput {
  hasAcceptedTerms: boolean;
  hasAcceptedHealthPersonalization: boolean;
  displayName: string | null;
  healthFocus: string | null;
  onboardingStage: string | null;
  onboardingCompletedAt: string | null;
}

export function isHealthFocus(value: string): value is HealthFocus {
  return (HEALTH_FOCUS_VALUES as readonly string[]).includes(value);
}

export function isSexAssignedAtBirth(
  value: string,
): value is SexAssignedAtBirth {
  return (SEX_ASSIGNED_VALUES as readonly string[]).includes(value);
}

export function isOnboardingStage(value: string): value is OnboardingStage {
  return (ONBOARDING_STAGES as readonly string[]).includes(value);
}

export function resolveOnboardingStep(
  input: OnboardingProgressInput,
): OnboardingStep {
  if (input.onboardingCompletedAt) {
    return "completed";
  }

  if (!input.hasAcceptedTerms || !input.hasAcceptedHealthPersonalization) {
    return "consent";
  }

  if (!input.displayName || input.displayName.trim().length === 0) {
    return "identity";
  }

  if (!input.healthFocus || !isHealthFocus(input.healthFocus)) {
    return "focus";
  }

  if (input.onboardingStage && isOnboardingStage(input.onboardingStage)) {
    return input.onboardingStage;
  }

  return "sex_assigned";
}

export function pathForOnboardingStep(step: OnboardingStep): string {
  switch (step) {
    case "consent":
      return "/onboarding/consent";
    case "identity":
      return "/onboarding/identity";
    case "focus":
      return "/onboarding/focus";
    case "sex_assigned":
      return "/onboarding/sex-assigned";
    case "clinical":
      return "/onboarding/clinical";
    case "mobility":
      return "/onboarding/mobility";
    case "nutrition":
      return "/onboarding/nutrition";
    case "cycle":
      return "/onboarding/cycle";
    case "habits":
      return "/onboarding/habits";
    case "completed":
      return "/home";
  }
}

export function stepNumberForOnboarding(step: OnboardingStep): number {
  switch (step) {
    case "consent":
      return 1;
    case "identity":
      return 2;
    case "focus":
      return 3;
    case "sex_assigned":
      return 4;
    case "clinical":
      return 5;
    case "mobility":
      return 6;
    case "nutrition":
      return 7;
    case "cycle":
      return 7;
    case "habits":
      return 8;
    case "completed":
      return 8;
  }
}

export function validateDisplayName(displayName: string): string | null {
  const trimmed = displayName.trim();
  if (trimmed.length < 2) {
    return "too_short";
  }
  if (trimmed.length > 60) {
    return "too_long";
  }
  return null;
}

export function validateWeightKg(weightKg: number): string | null {
  if (!Number.isFinite(weightKg)) {
    return "invalid";
  }
  if (weightKg <= 0 || weightKg >= 500) {
    return "out_of_range";
  }
  return null;
}

/** @deprecated use resolveOnboardingStep */
export function resolveSprint1Step(input: OnboardingProgressInput) {
  const step = resolveOnboardingStep(input);
  if (
    step === "consent" ||
    step === "identity" ||
    step === "focus"
  ) {
    return step;
  }
  return "done" as const;
}

/** @deprecated use pathForOnboardingStep */
export function pathForSprint1Step(
  step: "consent" | "identity" | "focus" | "done",
): string {
  if (step === "done") {
    return pathForOnboardingStep("sex_assigned");
  }
  return pathForOnboardingStep(step);
}
