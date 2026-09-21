"use server";

import { revalidatePath } from "next/cache";

import {
  isAccountConsentPurpose,
  isValidDeleteConfirmation,
  type AccountConsentPurpose,
} from "@/lib/account/consent";
import {
  buildExportFilename,
  type AccountExportPayload,
} from "@/lib/account/export";
import { validateDisplayName } from "@/lib/onboarding/progress";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AccountActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; code: string };

export interface ConsentStatusRow {
  purpose: AccountConsentPurpose;
  accepted: boolean | null;
  recordedAt: string | null;
}

export interface AccountSnapshot {
  profile: {
    displayName: string;
    genderIdentity: string | null;
  };
  consents: ConsentStatusRow[];
  hasAcceptedTerms: boolean;
  hasAcceptedHealth: boolean;
  hasClinical: boolean;
  hasNutrition: boolean;
  hasCycle: boolean;
  hasBiometrics: boolean;
}

function revalidateAccount() {
  revalidatePath("/account");
  revalidatePath("/home");
  revalidatePath("/workouts");
  revalidatePath("/meals");
  revalidatePath("/habits");
  revalidatePath("/onboarding", "layout");
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function latestConsentMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<Map<string, { accepted: boolean; recordedAt: string }>> {
  const { data } = await supabase
    .from("lgpd_consent_logs")
    .select("purpose, accepted, recorded_at")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false });

  const map = new Map<string, { accepted: boolean; recordedAt: string }>();
  for (const row of data ?? []) {
    if (!map.has(row.purpose)) {
      map.set(row.purpose, {
        accepted: row.accepted,
        recordedAt: row.recorded_at,
      });
    }
  }
  return map;
}

export async function getAccountSnapshotAction(): Promise<
  AccountActionResult<AccountSnapshot>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const [
    profileResult,
    consentMap,
    clinicalResult,
    nutritionResult,
    cycleResult,
    biometricsResult,
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("display_name, gender_identity")
      .eq("id", user.id)
      .maybeSingle(),
    latestConsentMap(supabase, user.id),
    supabase
      .from("user_clinical_conditions")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_nutrition_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_cycle_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_biometrics")
      .select("weight_kg")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    console.error("getAccountSnapshotAction profile", profileResult.error.message);
    return { ok: false, code: "load_failed" };
  }

  const purposes: AccountConsentPurpose[] = [
    "terms",
    "health_personalization",
    "cycle_module",
    "biometrics",
    "habit_reminders",
  ];

  const consents: ConsentStatusRow[] = purposes.map((purpose) => {
    const latest = consentMap.get(purpose);
    return {
      purpose,
      accepted: latest ? latest.accepted : null,
      recordedAt: latest?.recordedAt ?? null,
    };
  });

  const hasAcceptedTerms = consentMap.get("terms")?.accepted === true;
  const hasAcceptedHealth =
    consentMap.get("health_personalization")?.accepted === true;

  return {
    ok: true,
    data: {
      profile: {
        displayName: profileResult.data?.display_name?.trim() || "",
        genderIdentity: profileResult.data?.gender_identity ?? null,
      },
      consents,
      hasAcceptedTerms,
      hasAcceptedHealth,
      hasClinical: Boolean(clinicalResult.data),
      hasNutrition: Boolean(nutritionResult.data),
      hasCycle: Boolean(cycleResult.data),
      hasBiometrics:
        biometricsResult.data?.weight_kg != null &&
        biometricsResult.data.weight_kg !== undefined,
    },
  };
}

export async function updatePublicProfileAction(input: {
  displayName: string;
  genderIdentity?: string | null;
}): Promise<AccountActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const nameError = validateDisplayName(input.displayName);
  if (nameError) {
    return { ok: false, code: "invalid_name" };
  }

  const gender =
    input.genderIdentity && input.genderIdentity.trim()
      ? input.genderIdentity.trim().slice(0, 80)
      : null;

  const { error } = await supabase
    .from("user_profiles")
    .update({
      display_name: input.displayName.trim(),
      gender_identity: gender,
    })
    .eq("id", user.id);

  if (error) {
    console.error("updatePublicProfileAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateAccount();
  return { ok: true };
}

async function applyRevocationSideEffects(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  purpose: AccountConsentPurpose,
) {
  if (purpose === "biometrics") {
    await supabase
      .from("user_body_measurements")
      .delete()
      .eq("user_id", userId);
    await supabase
      .from("user_biometrics")
      .update({ weight_kg: null })
      .eq("user_id", userId);
    return;
  }

  if (purpose === "health_personalization") {
    await supabase
      .from("user_clinical_conditions")
      .delete()
      .eq("user_id", userId);
    await supabase
      .from("user_nutrition_profiles")
      .delete()
      .eq("user_id", userId);
    await supabase.from("user_daily_plans").delete().eq("user_id", userId);
    return;
  }

  if (purpose === "cycle_module") {
    await supabase.from("cycle_period_logs").delete().eq("user_id", userId);
    await supabase.from("user_cycle_profiles").delete().eq("user_id", userId);
    return;
  }

  if (purpose === "habit_reminders") {
    await supabase
      .from("user_habit_prefs")
      .update({
        water_reminder_enabled: false,
        sleep_reminder_enabled: false,
        active_pause_enabled: false,
      })
      .eq("user_id", userId);
  }
}

export async function revokeConsentAction(input: {
  purpose: string;
}): Promise<AccountActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!isAccountConsentPurpose(input.purpose)) {
    return { ok: false, code: "invalid_purpose" };
  }

  const { error } = await supabase.from("lgpd_consent_logs").insert({
    user_id: user.id,
    purpose: input.purpose,
    accepted: false,
  });

  if (error) {
    console.error("revokeConsentAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  await applyRevocationSideEffects(supabase, user.id, input.purpose);
  revalidateAccount();
  return { ok: true };
}

export async function reacceptConsentAction(input: {
  purpose: string;
}): Promise<AccountActionResult<{ redirectTo?: string }>> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!isAccountConsentPurpose(input.purpose)) {
    return { ok: false, code: "invalid_purpose" };
  }

  const { error } = await supabase.from("lgpd_consent_logs").insert({
    user_id: user.id,
    purpose: input.purpose,
    accepted: true,
  });

  if (error) {
    console.error("reacceptConsentAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  let redirectTo: string | undefined;

  if (input.purpose === "health_personalization") {
    await supabase
      .from("user_profiles")
      .update({
        onboarding_completed_at: null,
        onboarding_stage: "sex_assigned",
      })
      .eq("id", user.id);
    redirectTo = "/onboarding/sex-assigned";
  }

  if (input.purpose === "cycle_module") {
    redirectTo = "/onboarding/cycle";
  }

  revalidateAccount();
  return { ok: true, data: { redirectTo } };
}

export async function exportMyDataAction(): Promise<
  AccountActionResult<{ filename: string; json: string }>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const [
    profile,
    consents,
    clinical,
    nutrition,
    cycle,
    cycleLogs,
    biometrics,
    bodyMeasurements,
    dailyPlans,
    habitPrefs,
    habitLogs,
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select(
        "display_name, gender_identity, health_focus, onboarding_completed_at, created_at, updated_at",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("lgpd_consent_logs")
      .select("purpose, accepted, recorded_at")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: true }),
    supabase
      .from("user_clinical_conditions")
      .select("condition_tags, capability_tags, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_nutrition_profiles")
      .select("diet_pattern, avoids_tags, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_cycle_profiles")
      .select(
        "mode, phase_tags, last_period_start, average_cycle_length_days, average_period_length_days, remind_period_approaching, remind_fertile_window, remind_late_or_possible_pregnancy, updated_at",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("cycle_period_logs")
      .select("period_start, period_end, created_at")
      .eq("user_id", user.id)
      .order("period_start", { ascending: true }),
    supabase
      .from("user_biometrics")
      .select("weight_kg, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_body_measurements")
      .select("recorded_on, weight_kg, waist_cm, hip_cm, created_at")
      .eq("user_id", user.id)
      .order("recorded_on", { ascending: true }),
    supabase
      .from("user_daily_plans")
      .select(
        "day, exercise_ids, meals, is_rest_day, cardio_suggestion, created_at, updated_at",
      )
      .eq("user_id", user.id)
      .order("day", { ascending: true }),
    supabase
      .from("user_habit_prefs")
      .select(
        "water_goal_ml, water_reminder_enabled, sleep_reminder_enabled, sleep_target_bedtime, active_pause_enabled, active_pause_interval_minutes, workout_minutes_per_day, workout_weekdays",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("habit_logs")
      .select(
        "day, kind, value, sleep_quality, content_id, content_key, distance_m, meal_slot, note, created_at",
      )
      .eq("user_id", user.id)
      .order("day", { ascending: true }),
  ]);

  if (
    profile.error ||
    consents.error ||
    clinical.error ||
    nutrition.error ||
    cycle.error ||
    cycleLogs.error ||
    biometrics.error ||
    bodyMeasurements.error ||
    dailyPlans.error ||
    habitPrefs.error ||
    habitLogs.error
  ) {
    console.error("exportMyDataAction load failed");
    return { ok: false, code: "load_failed" };
  }

  const payload: AccountExportPayload = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    profile: profile.data,
    consents: (consents.data ?? []).map((row) => ({
      purpose: row.purpose,
      accepted: row.accepted,
      recorded_at: row.recorded_at,
    })),
    clinical: clinical.data,
    nutrition: nutrition.data,
    cycle: cycle.data,
    cycle_period_logs: cycleLogs.data ?? [],
    biometrics: biometrics.data,
    body_measurements: bodyMeasurements.data ?? [],
    daily_plans: dailyPlans.data ?? [],
    habit_prefs: habitPrefs.data,
    habit_logs: habitLogs.data ?? [],
  };

  const filename = buildExportFilename();
  const json = `${JSON.stringify(payload, null, 2)}\n`;

  return { ok: true, data: { filename, json } };
}

export async function deleteMyAccountAction(input: {
  confirmation: string;
}): Promise<AccountActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!isValidDeleteConfirmation(input.confirmation)) {
    return { ok: false, code: "invalid_confirmation" };
  }

  // Audit trail before Auth delete (cascade removes logs with the user).
  await supabase.from("lgpd_consent_logs").insert({
    user_id: user.id,
    purpose: "terms",
    accepted: false,
  });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("deleteMyAccountAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  await supabase.auth.signOut();
  revalidateAccount();
  return { ok: true };
}
