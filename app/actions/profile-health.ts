"use server";

import { revalidatePath } from "next/cache";

import { filterClinicalConditionSlugs } from "@/lib/clinical/conditions-catalog";
import {
  addDaysIso,
  clampCycleLength,
  clampPeriodLength,
  phaseTagsForDay,
  reminderFlagsForToday,
  type CycleReminderFlags,
} from "@/lib/cycle/calendar";
import { todayInSaoPaulo } from "@/lib/habits/day";
import { filterFoodAvoidSlugs } from "@/lib/nutrition/food-conditions-catalog";
import {
  deriveCapabilityTags,
} from "@/lib/onboarding/capabilities";
import type { MobilityProfile } from "@/lib/onboarding/progress";
import { createClient } from "@/lib/supabase/server";
import {
  CYCLE_MODE_VALUES,
  DIET_PATTERN_VALUES,
  TAG_SLUGS,
  type CycleMode,
  type DietPattern,
} from "@/lib/tags/constants";

function inferMobilityFromTags(conditionTags: string[]): MobilityProfile {
  if (
    conditionTags.includes("spinal-cord-injury-paraplegia") ||
    conditionTags.includes(TAG_SLUGS.wheelchairUser)
  ) {
    return "wheelchair";
  }
  if (conditionTags.includes(TAG_SLUGS.reducedMobility)) {
    return "reduced";
  }
  return "full";
}

export type ProfileHealthResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; code: string };

function revalidateHealthSurfaces() {
  revalidatePath("/account");
  revalidatePath("/account/health");
  revalidatePath("/account/cycle");
  revalidatePath("/home");
  revalidatePath("/workouts");
  revalidatePath("/meals");
  revalidatePath("/habits");
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function hasAcceptedPurpose(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  purpose: string,
): Promise<boolean> {
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

export interface CycleAccountSnapshot {
  mode: CycleMode;
  lastPeriodStart: string | null;
  averageCycleLengthDays: number;
  averagePeriodLengthDays: number;
  remindPeriodApproaching: boolean;
  remindFertileWindow: boolean;
  remindLateOrPossiblePregnancy: boolean;
  phaseTags: string[];
  periodLogs: Array<{ periodStart: string; periodEnd: string | null }>;
  reminders: CycleReminderFlags;
  sexAssignedAtBirth: string | null;
}

export async function getCycleAccountSnapshotAction(): Promise<
  ProfileHealthResult<CycleAccountSnapshot | null>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const hasCycle = await hasAcceptedPurpose(supabase, user.id, "cycle_module");
  if (!hasCycle) {
    return { ok: true, data: null };
  }

  const [cycleResult, logsResult, clinicalResult] = await Promise.all([
    supabase
      .from("user_cycle_profiles")
      .select(
        "mode, phase_tags, last_period_start, average_cycle_length_days, average_period_length_days, remind_period_approaching, remind_fertile_window, remind_late_or_possible_pregnancy",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("cycle_period_logs")
      .select("period_start, period_end")
      .eq("user_id", user.id)
      .order("period_start", { ascending: false })
      .limit(12),
    supabase
      .from("user_clinical_conditions")
      .select("sex_assigned_at_birth")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (cycleResult.error || logsResult.error) {
    console.error(
      "getCycleAccountSnapshotAction",
      cycleResult.error?.message ?? logsResult.error?.message,
    );
    return { ok: false, code: "load_failed" };
  }

  if (!cycleResult.data || cycleResult.data.mode !== "menstrual-cycle") {
    return { ok: true, data: null };
  }

  const lastPeriodStart = cycleResult.data.last_period_start;
  const averageCycleLengthDays = clampCycleLength(
    cycleResult.data.average_cycle_length_days ?? 28,
  );
  const averagePeriodLengthDays = clampPeriodLength(
    cycleResult.data.average_period_length_days ?? 5,
  );
  const today = todayInSaoPaulo();
  const phaseTags = phaseTagsForDay(
    {
      lastPeriodStart,
      averageCycleLengthDays,
      averagePeriodLengthDays,
      today,
    },
    today,
    "menstrual-cycle",
  );

  const storedPhase = cycleResult.data.phase_tags ?? [];
  const phaseChanged =
    phaseTags.length !== storedPhase.length ||
    phaseTags.some((tag) => !storedPhase.includes(tag));
  if (phaseChanged) {
    await supabase
      .from("user_cycle_profiles")
      .update({
        phase_tags: phaseTags,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  }

  return {
    ok: true,
    data: {
      mode: "menstrual-cycle",
      lastPeriodStart,
      averageCycleLengthDays,
      averagePeriodLengthDays,
      remindPeriodApproaching:
        cycleResult.data.remind_period_approaching ?? true,
      remindFertileWindow: cycleResult.data.remind_fertile_window ?? true,
      remindLateOrPossiblePregnancy:
        cycleResult.data.remind_late_or_possible_pregnancy ?? true,
      phaseTags,
      periodLogs: (logsResult.data ?? []).map((row) => ({
        periodStart: row.period_start,
        periodEnd: row.period_end,
      })),
      reminders: reminderFlagsForToday({
        lastPeriodStart,
        averageCycleLengthDays,
        averagePeriodLengthDays,
        today,
      }),
      sexAssignedAtBirth:
        clinicalResult.data?.sex_assigned_at_birth ?? null,
    },
  };
}

export async function updateCycleCalendarSettingsAction(input: {
  lastPeriodStart?: string | null;
  averageCycleLengthDays: number;
  averagePeriodLengthDays: number;
  remindPeriodApproaching: boolean;
  remindFertileWindow: boolean;
  remindLateOrPossiblePregnancy: boolean;
}): Promise<ProfileHealthResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await hasAcceptedPurpose(supabase, user.id, "cycle_module"))) {
    return { ok: false, code: "cycle_consent_required" };
  }

  const cycleLength = clampCycleLength(input.averageCycleLengthDays);
  const periodLength = clampPeriodLength(input.averagePeriodLengthDays);
  const lastPeriodStart =
    input.lastPeriodStart && /^\d{4}-\d{2}-\d{2}$/.test(input.lastPeriodStart)
      ? input.lastPeriodStart
      : null;

  const today = todayInSaoPaulo();
  const phaseTags = phaseTagsForDay(
    {
      lastPeriodStart,
      averageCycleLengthDays: cycleLength,
      averagePeriodLengthDays: periodLength,
      today,
    },
    today,
    "menstrual-cycle",
  );

  const { error } = await supabase.from("user_cycle_profiles").upsert(
    {
      user_id: user.id,
      mode: "menstrual-cycle",
      last_period_start: lastPeriodStart,
      average_cycle_length_days: cycleLength,
      average_period_length_days: periodLength,
      remind_period_approaching: input.remindPeriodApproaching,
      remind_fertile_window: input.remindFertileWindow,
      remind_late_or_possible_pregnancy: input.remindLateOrPossiblePregnancy,
      phase_tags: phaseTags,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("updateCycleCalendarSettingsAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  if (lastPeriodStart) {
    await supabase.from("cycle_period_logs").upsert(
      {
        user_id: user.id,
        period_start: lastPeriodStart,
        period_end: addDaysIso(lastPeriodStart, periodLength - 1),
      },
      { onConflict: "user_id,period_start" },
    );
  }

  revalidateHealthSurfaces();
  return { ok: true };
}

export async function logCyclePeriodStartAction(input: {
  periodStart: string;
}): Promise<ProfileHealthResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await hasAcceptedPurpose(supabase, user.id, "cycle_module"))) {
    return { ok: false, code: "cycle_consent_required" };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.periodStart)) {
    return { ok: false, code: "invalid_date" };
  }

  const { data: cycle } = await supabase
    .from("user_cycle_profiles")
    .select("average_period_length_days, average_cycle_length_days")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cycle) {
    return { ok: false, code: "cycle_required" };
  }

  const periodLength = clampPeriodLength(
    cycle.average_period_length_days ?? 5,
  );
  const cycleLength = clampCycleLength(cycle.average_cycle_length_days ?? 28);
  const today = todayInSaoPaulo();
  const phaseTags = phaseTagsForDay(
    {
      lastPeriodStart: input.periodStart,
      averageCycleLengthDays: cycleLength,
      averagePeriodLengthDays: periodLength,
      today,
    },
    today,
    "menstrual-cycle",
  );

  const { error: logError } = await supabase.from("cycle_period_logs").upsert(
    {
      user_id: user.id,
      period_start: input.periodStart,
      period_end: addDaysIso(input.periodStart, periodLength - 1),
    },
    { onConflict: "user_id,period_start" },
  );

  if (logError) {
    console.error("logCyclePeriodStartAction log", logError.message);
    return { ok: false, code: "save_failed" };
  }

  const { error } = await supabase
    .from("user_cycle_profiles")
    .update({
      last_period_start: input.periodStart,
      phase_tags: phaseTags,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("logCyclePeriodStartAction profile", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateHealthSurfaces();
  return { ok: true };
}

export async function markPossiblePregnancyAction(): Promise<ProfileHealthResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await hasAcceptedPurpose(supabase, user.id, "cycle_module"))) {
    return { ok: false, code: "cycle_consent_required" };
  }

  const { error } = await supabase.from("user_cycle_profiles").upsert(
    {
      user_id: user.id,
      mode: "pregnancy",
      phase_tags: [TAG_SLUGS.pregnancyTrimester1],
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("markPossiblePregnancyAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateHealthSurfaces();
  return { ok: true };
}

export async function updateMyClinicalConditionsAction(input: {
  conditionTags: string[];
  noneSelected?: boolean;
}): Promise<ProfileHealthResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await hasAcceptedPurpose(supabase, user.id, "health_personalization"))) {
    return { ok: false, code: "consent_required" };
  }

  const conditionTags = input.noneSelected
    ? []
    : filterClinicalConditionSlugs(input.conditionTags);

  const { data: existing } = await supabase
    .from("user_clinical_conditions")
    .select("sex_assigned_at_birth")
    .eq("user_id", user.id)
    .maybeSingle();

  const mobility = inferMobilityFromTags(conditionTags);
  const capabilityTags = deriveCapabilityTags(mobility, conditionTags);

  const { error } = await supabase.from("user_clinical_conditions").upsert(
    {
      user_id: user.id,
      condition_tags: conditionTags,
      capability_tags: capabilityTags,
      sex_assigned_at_birth: existing?.sex_assigned_at_birth ?? null,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("updateMyClinicalConditionsAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateHealthSurfaces();
  return { ok: true };
}

export async function updateMyNutritionProfileAction(input: {
  dietPattern: DietPattern;
  avoidsTags: string[];
  noneAvoids?: boolean;
}): Promise<ProfileHealthResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(await hasAcceptedPurpose(supabase, user.id, "health_personalization"))) {
    return { ok: false, code: "consent_required" };
  }

  if (!(DIET_PATTERN_VALUES as readonly string[]).includes(input.dietPattern)) {
    return { ok: false, code: "invalid_diet" };
  }

  const avoidsTags = input.noneAvoids
    ? []
    : filterFoodAvoidSlugs(input.avoidsTags);

  const { error } = await supabase.from("user_nutrition_profiles").upsert(
    {
      user_id: user.id,
      diet_pattern: input.dietPattern,
      avoids_tags: avoidsTags,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("updateMyNutritionProfileAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateHealthSurfaces();
  return { ok: true };
}

export async function getMyHealthEditSnapshotAction(): Promise<
  ProfileHealthResult<{
    conditionTags: string[];
    dietPattern: DietPattern;
    avoidsTags: string[];
    hasCycleModule: boolean;
    cycleMode: CycleMode | null;
  }>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const [clinical, nutrition, cycle, cycleConsent] = await Promise.all([
    supabase
      .from("user_clinical_conditions")
      .select("condition_tags")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_nutrition_profiles")
      .select("diet_pattern, avoids_tags")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_cycle_profiles")
      .select("mode")
      .eq("user_id", user.id)
      .maybeSingle(),
    hasAcceptedPurpose(supabase, user.id, "cycle_module"),
  ]);

  if (clinical.error || nutrition.error) {
    return { ok: false, code: "load_failed" };
  }

  const dietPattern = (nutrition.data?.diet_pattern ??
    "no-restriction") as DietPattern;
  const cycleMode =
    cycle.data?.mode &&
    (CYCLE_MODE_VALUES as readonly string[]).includes(cycle.data.mode)
      ? (cycle.data.mode as CycleMode)
      : null;

  return {
    ok: true,
    data: {
      conditionTags: clinical.data?.condition_tags ?? [],
      dietPattern,
      avoidsTags: nutrition.data?.avoids_tags ?? [],
      hasCycleModule: cycleConsent && Boolean(cycle.data),
      cycleMode,
    },
  };
}
