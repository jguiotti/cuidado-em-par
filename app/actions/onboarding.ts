"use server";

import { revalidatePath } from "next/cache";

import {
  deriveCapabilityTags,
  mergeConditionTags,
  suggestWaterGoalMl,
} from "@/lib/onboarding/capabilities";
import { filterClinicalConditionSlugs } from "@/lib/clinical/conditions-catalog";
import {
  isHealthFocus,
  isSexAssignedAtBirth,
  validateDisplayName,
  validateWeightKg,
  type MobilityProfile,
  type OnboardingStage,
  type SexAssignedAtBirth,
} from "@/lib/onboarding/progress";
import { createClient } from "@/lib/supabase/server";
import { filterFoodAvoidSlugs } from "@/lib/nutrition/food-conditions-catalog";
import {
  CYCLE_MODE_VALUES,
  DIET_PATTERN_VALUES,
  TAG_SLUGS,
  type CycleMode,
  type DietPattern,
  type HealthFocus,
} from "@/lib/tags/constants";

export type ActionResult =
  | { ok: true }
  | { ok: false; code: string };

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, userId: null as string | null };
  }

  return { supabase, userId: user.id };
}

async function hasAcceptedPurpose(purpose: string, userId: string) {
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

async function requireHealthConsent(userId: string): Promise<boolean> {
  const hasTerms = await hasAcceptedPurpose("terms", userId);
  const hasHealth = await hasAcceptedPurpose(
    "health_personalization",
    userId,
  );
  return hasTerms && hasHealth;
}

async function setOnboardingStage(userId: string, stage: OnboardingStage) {
  const supabase = await createClient();
  await supabase
    .from("user_profiles")
    .update({ onboarding_stage: stage })
    .eq("id", userId);
}

function revalidateOnboarding() {
  revalidatePath("/onboarding", "layout");
  revalidatePath("/home");
}

export async function recordConsentAction(input: {
  purpose:
    | "terms"
    | "health_personalization"
    | "biometrics"
    | "cycle_module";
  accepted: boolean;
}): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }

  const { error } = await supabase.from("lgpd_consent_logs").insert({
    user_id: userId,
    purpose: input.purpose,
    accepted: input.accepted,
  });

  if (error) {
    return { ok: false, code: "save_failed" };
  }

  revalidateOnboarding();
  return { ok: true };
}

export async function saveConsentStepAction(input: {
  acceptTerms: boolean;
  acceptHealthPersonalization: boolean;
}): Promise<ActionResult> {
  if (!input.acceptTerms || !input.acceptHealthPersonalization) {
    return { ok: false, code: "consent_required" };
  }

  const terms = await recordConsentAction({
    purpose: "terms",
    accepted: true,
  });
  if (!terms.ok) {
    return terms;
  }

  return recordConsentAction({
    purpose: "health_personalization",
    accepted: true,
  });
}

export async function updateIdentityAction(input: {
  displayName: string;
  genderIdentity?: string | null;
  skipGender?: boolean;
}): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await requireHealthConsent(userId))) {
    return { ok: false, code: "consent_required" };
  }

  const nameError = validateDisplayName(input.displayName);
  if (nameError) {
    return { ok: false, code: "invalid_name" };
  }

  const genderIdentity = input.skipGender
    ? null
    : input.genderIdentity?.trim()
      ? input.genderIdentity.trim()
      : null;

  const { error } = await supabase
    .from("user_profiles")
    .update({
      display_name: input.displayName.trim(),
      gender_identity: genderIdentity,
    })
    .eq("id", userId);

  if (error) {
    return { ok: false, code: "save_failed" };
  }

  revalidateOnboarding();
  return { ok: true };
}

export async function updateFocusAction(input: {
  healthFocus: string;
  weightKg?: number | null;
  acceptBiometrics?: boolean;
}): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await requireHealthConsent(userId))) {
    return { ok: false, code: "consent_required" };
  }

  if (!isHealthFocus(input.healthFocus)) {
    return { ok: false, code: "invalid_focus" };
  }

  const healthFocus = input.healthFocus as HealthFocus;
  const hasWeight =
    input.weightKg !== undefined &&
    input.weightKg !== null &&
    !Number.isNaN(input.weightKg);

  if (hasWeight) {
    if (!input.acceptBiometrics) {
      return { ok: false, code: "biometrics_required" };
    }
    const weightError = validateWeightKg(input.weightKg as number);
    if (weightError) {
      return { ok: false, code: "invalid_weight" };
    }
  }

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({
      health_focus: healthFocus,
      onboarding_stage: "sex_assigned",
    })
    .eq("id", userId);

  if (profileError) {
    return { ok: false, code: "save_failed" };
  }

  if (hasWeight && input.acceptBiometrics) {
    const biometricsConsent = await recordConsentAction({
      purpose: "biometrics",
      accepted: true,
    });
    if (!biometricsConsent.ok) {
      return biometricsConsent;
    }

    const { error: biometricsError } = await supabase
      .from("user_biometrics")
      .upsert(
        {
          user_id: userId,
          weight_kg: input.weightKg,
        },
        { onConflict: "user_id" },
      );

    if (biometricsError) {
      return { ok: false, code: "save_failed" };
    }
  }

  revalidateOnboarding();
  return { ok: true };
}

export async function updateSexAssignedAction(input: {
  sexAssignedAtBirth?: SexAssignedAtBirth | null;
  skip?: boolean;
}): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await requireHealthConsent(userId))) {
    return { ok: false, code: "consent_required" };
  }

  let sexValue: string | null = null;
  if (!input.skip) {
    if (
      !input.sexAssignedAtBirth ||
      !isSexAssignedAtBirth(input.sexAssignedAtBirth)
    ) {
      return { ok: false, code: "invalid_sex" };
    }
    sexValue = input.sexAssignedAtBirth;
  }

  const { data: existing } = await supabase
    .from("user_clinical_conditions")
    .select("condition_tags, capability_tags")
    .eq("user_id", userId)
    .maybeSingle();

  const { error } = await supabase.from("user_clinical_conditions").upsert(
    {
      user_id: userId,
      sex_assigned_at_birth: sexValue,
      condition_tags: existing?.condition_tags ?? [],
      capability_tags: existing?.capability_tags ?? [],
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, code: "save_failed" };
  }

  await setOnboardingStage(userId, "clinical");
  revalidateOnboarding();
  return { ok: true };
}

export async function updateClinicalAction(input: {
  conditionTags: string[];
  noneSelected?: boolean;
}): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await requireHealthConsent(userId))) {
    return { ok: false, code: "consent_required" };
  }

  const conditionTags = input.noneSelected
    ? []
    : filterClinicalConditionSlugs(input.conditionTags);

  const { data: existing } = await supabase
    .from("user_clinical_conditions")
    .select("sex_assigned_at_birth, capability_tags")
    .eq("user_id", userId)
    .maybeSingle();

  const { error } = await supabase.from("user_clinical_conditions").upsert(
    {
      user_id: userId,
      sex_assigned_at_birth: existing?.sex_assigned_at_birth ?? null,
      condition_tags: conditionTags,
      capability_tags: existing?.capability_tags ?? [],
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, code: "save_failed" };
  }

  await setOnboardingStage(userId, "mobility");
  revalidateOnboarding();
  return { ok: true };
}

export async function updateMobilityAction(input: {
  mobility: MobilityProfile;
}): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await requireHealthConsent(userId))) {
    return { ok: false, code: "consent_required" };
  }

  if (!["full", "wheelchair", "reduced"].includes(input.mobility)) {
    return { ok: false, code: "invalid_mobility" };
  }

  const { data: existing } = await supabase
    .from("user_clinical_conditions")
    .select("sex_assigned_at_birth, condition_tags")
    .eq("user_id", userId)
    .maybeSingle();

  const baseConditions = filterClinicalConditionSlugs(
    existing?.condition_tags ?? [],
  );
  const conditionTags = mergeConditionTags(baseConditions, input.mobility);
  const capabilityTags = deriveCapabilityTags(input.mobility, conditionTags);

  const { error } = await supabase.from("user_clinical_conditions").upsert(
    {
      user_id: userId,
      sex_assigned_at_birth: existing?.sex_assigned_at_birth ?? null,
      condition_tags: conditionTags,
      capability_tags: capabilityTags,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, code: "save_failed" };
  }

  await setOnboardingStage(userId, "nutrition");
  revalidateOnboarding();
  return { ok: true };
}

export async function updateNutritionAction(input: {
  dietPattern: string;
  avoidsTags: string[];
}): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await requireHealthConsent(userId))) {
    return { ok: false, code: "consent_required" };
  }

  if (
    !(DIET_PATTERN_VALUES as readonly string[]).includes(input.dietPattern)
  ) {
    return { ok: false, code: "invalid_diet" };
  }

  const allowedAvoids: Set<string> = new Set([
    TAG_SLUGS.gluten,
    TAG_SLUGS.lactose,
    TAG_SLUGS.egg,
    TAG_SLUGS.peanut,
    TAG_SLUGS.soy,
    TAG_SLUGS.meat,
    TAG_SLUGS.fish,
  ]);

  const avoidsTags = filterFoodAvoidSlugs(
    input.avoidsTags.filter((tag) => allowedAvoids.has(tag)),
  );

  const { error } = await supabase.from("user_nutrition_profiles").upsert(
    {
      user_id: userId,
      diet_pattern: input.dietPattern as DietPattern,
      avoids_tags: avoidsTags,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, code: "save_failed" };
  }

  await setOnboardingStage(userId, "cycle");
  revalidateOnboarding();
  return { ok: true };
}

export async function updateCycleAction(input: {
  choice: "skip" | CycleMode;
  trimester?: 1 | 2 | 3;
  acceptCycleConsent?: boolean;
}): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await requireHealthConsent(userId))) {
    return { ok: false, code: "consent_required" };
  }

  if (input.choice === "skip") {
    await supabase.from("user_cycle_profiles").delete().eq("user_id", userId);
    await setOnboardingStage(userId, "habits");
    revalidateOnboarding();
    return { ok: true };
  }

  if (!(CYCLE_MODE_VALUES as readonly string[]).includes(input.choice)) {
    return { ok: false, code: "invalid_cycle" };
  }

  if (!input.acceptCycleConsent) {
    return { ok: false, code: "cycle_consent_required" };
  }

  let phaseTags: string[] = [];

  if (input.choice === "menstrual-cycle") {
    phaseTags = [TAG_SLUGS.cycleActive];
  }

  if (input.choice === "pregnancy") {
    if (!input.trimester) {
      return { ok: false, code: "trimester_required" };
    }
    const trimesterTag =
      input.trimester === 1
        ? TAG_SLUGS.pregnancyTrimester1
        : input.trimester === 2
          ? TAG_SLUGS.pregnancyTrimester2
          : TAG_SLUGS.pregnancyTrimester3;
    phaseTags = [trimesterTag];
  }

  if (input.choice === "postpartum") {
    phaseTags = [TAG_SLUGS.postpartum];
  }

  const consent = await recordConsentAction({
    purpose: "cycle_module",
    accepted: true,
  });
  if (!consent.ok) {
    return consent;
  }

  const { error } = await supabase.from("user_cycle_profiles").upsert(
    {
      user_id: userId,
      mode: input.choice,
      phase_tags: phaseTags,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, code: "save_failed" };
  }

  await setOnboardingStage(userId, "habits");
  revalidateOnboarding();
  return { ok: true };
}

export async function updateHabitPrefsAction(input: {
  waterGoalMl: number;
  waterReminderEnabled: boolean;
  sleepReminderEnabled: boolean;
  sleepTargetBedtime?: string | null;
  activePauseEnabled: boolean;
}): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }

  if (input.waterGoalMl < 250 || input.waterGoalMl > 8000) {
    return { ok: false, code: "invalid_water" };
  }

  let sleepTarget: string | null = null;
  if (input.sleepTargetBedtime && input.sleepTargetBedtime.trim()) {
    const raw = input.sleepTargetBedtime.trim();
    sleepTarget = /^\d{2}:\d{2}$/.test(raw) ? `${raw}:00` : raw;
  }

  const prefsPayload = {
    water_goal_ml: input.waterGoalMl,
    water_reminder_enabled: input.waterReminderEnabled,
    sleep_reminder_enabled: input.sleepReminderEnabled,
    sleep_target_bedtime: sleepTarget,
    active_pause_enabled: input.activePauseEnabled,
    active_pause_interval_minutes: 90,
  };

  const { data: existingPrefs } = await supabase
    .from("user_habit_prefs")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  let prefsResult = existingPrefs
    ? await supabase
        .from("user_habit_prefs")
        .update(prefsPayload)
        .eq("user_id", userId)
    : await supabase.from("user_habit_prefs").insert({
        user_id: userId,
        ...prefsPayload,
      });

  // Fallback when Sprint 2 sleep columns are not migrated yet.
  if (
    prefsResult.error &&
    /sleep_/i.test(prefsResult.error.message)
  ) {
    const legacyPayload = {
      water_goal_ml: input.waterGoalMl,
      water_reminder_enabled: input.waterReminderEnabled,
      active_pause_enabled: input.activePauseEnabled,
      active_pause_interval_minutes: 90,
    };
    prefsResult = existingPrefs
      ? await supabase
          .from("user_habit_prefs")
          .update(legacyPayload)
          .eq("user_id", userId)
      : await supabase.from("user_habit_prefs").insert({
          user_id: userId,
          ...legacyPayload,
        });
  }

  if (prefsResult.error) {
    console.error("updateHabitPrefsAction prefs", prefsResult.error.message);
    return { ok: false, code: "save_failed" };
  }

  const { error: completeError } = await supabase
    .from("user_profiles")
    .update({
      onboarding_stage: "completed",
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (completeError) {
    // Stage column may be missing if Sprint 2 migration was not applied.
    if (/onboarding_stage/i.test(completeError.message)) {
      const { error: legacyCompleteError } = await supabase
        .from("user_profiles")
        .update({
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (legacyCompleteError) {
        console.error(
          "updateHabitPrefsAction complete",
          legacyCompleteError.message,
        );
        return { ok: false, code: "save_failed" };
      }
    } else {
      console.error("updateHabitPrefsAction complete", completeError.message);
      return { ok: false, code: "save_failed" };
    }
  }

  revalidateOnboarding();
  return { ok: true };
}

export async function getSuggestedWaterGoalAction(): Promise<number> {
  const { supabase, userId } = await requireUserId();
  if (!userId) {
    return 2000;
  }

  const { data } = await supabase
    .from("user_biometrics")
    .select("weight_kg")
    .eq("user_id", userId)
    .maybeSingle();

  return suggestWaterGoalMl(
    data?.weight_kg ? Number(data.weight_kg) : null,
  );
}
