"use server";

import { revalidatePath } from "next/cache";

import { resolveExerciseImageSrc } from "@/lib/admin/exercise-illustration";
import { syncCareEventsForUserDay } from "@/lib/care/publish";
import { todayInSaoPaulo } from "@/lib/habits/day";
import {
  isValidSleepInput,
  normalizeSleepMinutes,
  normalizeSleepQuality,
  sleepHoursToMinutes,
} from "@/lib/habits/sleep";
import {
  DEFAULT_HABIT_PREFS,
  type HabitPrefsSnapshot,
  type SleepLogSnapshot,
  type TodayRitualSnapshot,
} from "@/lib/habits/types";
import { addWaterMl, clampWaterMl } from "@/lib/habits/water";
import { TAG_SLUGS } from "@/lib/tags/constants";
import { createClient } from "@/lib/supabase/server";
import type { SafeExerciseCard } from "@/app/actions/safe-content";

export type HabitsActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; code: string };

function revalidateHabits() {
  revalidatePath("/home");
  revalidatePath("/habits");
  revalidatePath("/workouts");
  revalidatePath("/meals");
  revalidatePath("/circle");
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function syncCareAfterHabit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  try {
    await syncCareEventsForUserDay(supabase, userId);
  } catch (error) {
    console.error("syncCareAfterHabit", error);
  }
}

function mapPrefs(row: {
  water_goal_ml: number;
  water_reminder_enabled: boolean;
  sleep_reminder_enabled: boolean | null;
  sleep_target_bedtime: string | null;
  active_pause_enabled: boolean;
  active_pause_interval_minutes: number;
} | null): HabitPrefsSnapshot {
  if (!row) {
    return { ...DEFAULT_HABIT_PREFS };
  }

  const bedtime = row.sleep_target_bedtime;
  let sleepTargetBedtime: string | null = null;
  if (typeof bedtime === "string" && bedtime.length >= 5) {
    sleepTargetBedtime = bedtime.slice(0, 5);
  }

  return {
    waterGoalMl: row.water_goal_ml,
    waterReminderEnabled: row.water_reminder_enabled,
    sleepReminderEnabled: row.sleep_reminder_enabled ?? true,
    sleepTargetBedtime,
    activePauseEnabled: row.active_pause_enabled,
    activePauseIntervalMinutes: row.active_pause_interval_minutes,
  };
}

async function hasRemindersConsent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("lgpd_consent_logs")
    .select("accepted")
    .eq("user_id", userId)
    .eq("purpose", "habit_reminders")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.accepted === true;
}

export async function getTodayRitualAction(): Promise<
  HabitsActionResult<TodayRitualSnapshot>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();

  const [prefsResult, logsResult, consent] = await Promise.all([
    supabase
      .from("user_habit_prefs")
      .select(
        "water_goal_ml, water_reminder_enabled, sleep_reminder_enabled, sleep_target_bedtime, active_pause_enabled, active_pause_interval_minutes",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("habit_logs")
      .select("kind, value, sleep_quality, content_id")
      .eq("user_id", user.id)
      .eq("day", day),
    hasRemindersConsent(supabase, user.id),
  ]);

  if (prefsResult.error) {
    console.error("getTodayRitualAction prefs", prefsResult.error.message);
    return { ok: false, code: "load_failed" };
  }
  if (logsResult.error) {
    console.error("getTodayRitualAction logs", logsResult.error.message);
    return { ok: false, code: "load_failed" };
  }

  const prefs = mapPrefs(prefsResult.data);
  const logs = logsResult.data ?? [];

  let waterMl = 0;
  let sleep: SleepLogSnapshot | null = null;
  let activePauseCount = 0;
  let workoutCount = 0;
  let mealCount = 0;

  for (const log of logs) {
    if (log.kind === "water") {
      waterMl = typeof log.value === "number" ? log.value : 0;
    } else if (log.kind === "sleep") {
      sleep = {
        quality: normalizeSleepQuality(log.sleep_quality),
        minutes:
          typeof log.value === "number"
            ? normalizeSleepMinutes(log.value)
            : null,
      };
    } else if (log.kind === "active-pause") {
      activePauseCount =
        typeof log.value === "number" && log.value > 0
          ? Math.round(log.value)
          : 1;
    } else if (log.kind === "workout") {
      workoutCount += 1;
    } else if (log.kind === "meal") {
      mealCount += 1;
    }
  }

  return {
    ok: true,
    data: {
      day,
      prefs,
      waterMl,
      waterGoalMl: prefs.waterGoalMl,
      sleep,
      activePauseDone: activePauseCount > 0,
      activePauseCount,
      workoutDone: workoutCount > 0,
      mealDone: mealCount > 0,
      workoutCount,
      mealCount,
      hasRemindersConsent: consent,
    },
  };
}

export async function logWaterAction(
  deltaMl: number,
): Promise<HabitsActionResult<{ waterMl: number }>> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!Number.isFinite(deltaMl) || deltaMl === 0) {
    return { ok: false, code: "invalid_water" };
  }

  const day = todayInSaoPaulo();
  const { data: existing, error: readError } = await supabase
    .from("habit_logs")
    .select("value")
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("kind", "water")
    .eq("content_key", "")
    .maybeSingle();

  if (readError) {
    console.error("logWaterAction read", readError.message);
    return { ok: false, code: "save_failed" };
  }

  const current = typeof existing?.value === "number" ? existing.value : 0;
  const waterMl = addWaterMl(current, deltaMl);

  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      day,
      kind: "water",
      value: waterMl,
      sleep_quality: null,
      content_id: null,
      content_key: "",
    },
    { onConflict: "user_id,day,kind,content_key" },
  );

  if (error) {
    console.error("logWaterAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  await syncCareAfterHabit(supabase, user.id);
  revalidateHabits();
  return { ok: true, data: { waterMl } };
}

export async function setWaterTotalAction(
  totalMl: number,
): Promise<HabitsActionResult<{ waterMl: number }>> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const waterMl = clampWaterMl(totalMl);
  const day = todayInSaoPaulo();

  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      day,
      kind: "water",
      value: waterMl,
      sleep_quality: null,
      content_id: null,
      content_key: "",
    },
    { onConflict: "user_id,day,kind,content_key" },
  );

  if (error) {
    console.error("setWaterTotalAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  await syncCareAfterHabit(supabase, user.id);
  revalidateHabits();
  return { ok: true, data: { waterMl } };
}

export async function logSleepAction(input: {
  quality?: string | null;
  minutes?: number | null;
  hours?: number | string | null;
}): Promise<HabitsActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!isValidSleepInput(input)) {
    return { ok: false, code: "invalid_sleep" };
  }

  const quality = normalizeSleepQuality(input.quality);
  const minutesFromHours =
    input.hours !== undefined && input.hours !== null && input.hours !== ""
      ? sleepHoursToMinutes(input.hours)
      : null;
  const minutes =
    minutesFromHours ?? normalizeSleepMinutes(input.minutes);
  const day = todayInSaoPaulo();

  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      day,
      kind: "sleep",
      value: minutes,
      sleep_quality: quality,
      content_id: null,
      content_key: "",
    },
    { onConflict: "user_id,day,kind,content_key" },
  );

  if (error) {
    console.error("logSleepAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  await syncCareAfterHabit(supabase, user.id);
  revalidateHabits();
  return { ok: true };
}

export async function logActivePauseAction(): Promise<
  HabitsActionResult<{ count: number }>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();

  const { data: existing, error: readError } = await supabase
    .from("habit_logs")
    .select("value")
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("kind", "active-pause")
    .eq("content_key", "")
    .maybeSingle();

  if (readError) {
    console.error("logActivePauseAction read", readError.message);
    return { ok: false, code: "save_failed" };
  }

  const previous =
    typeof existing?.value === "number" && existing.value > 0
      ? Math.round(existing.value)
      : 0;
  const count = previous + 1;

  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      day,
      kind: "active-pause",
      value: count,
      sleep_quality: null,
      content_id: null,
      content_key: "",
    },
    { onConflict: "user_id,day,kind,content_key" },
  );

  if (error) {
    console.error("logActivePauseAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  await syncCareAfterHabit(supabase, user.id);
  revalidateHabits();
  return { ok: true, data: { count } };
}

/** @deprecated Use logActivePauseAction — kept for older clients. */
export async function markActivePauseDoneAction(): Promise<
  HabitsActionResult<{ done: boolean; count: number }>
> {
  const result = await logActivePauseAction();
  if (!result.ok) {
    return result;
  }
  return { ok: true, data: { done: true, count: result.data.count } };
}

export async function unmarkActivePauseDoneAction(): Promise<
  HabitsActionResult<{ done: boolean; count: number }>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("kind", "active-pause");

  if (error) {
    console.error("unmarkActivePauseDoneAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  await syncCareAfterHabit(supabase, user.id);
  revalidateHabits();
  return { ok: true, data: { done: false, count: 0 } };
}

export async function listSafeActivePauseExercisesAction(): Promise<
  HabitsActionResult<SafeExerciseCard[]>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const { data, error } = await supabase.rpc("list_safe_exercises");
  if (error) {
    console.error("listSafeActivePauseExercisesAction", error.message);
    return { ok: false, code: "load_failed" };
  }

  const activePause = TAG_SLUGS.activePause;
  const items: SafeExerciseCard[] = (data ?? [])
    .filter((row: { intensity_tags: string[] | null }) =>
      (row.intensity_tags ?? []).includes(activePause),
    )
    .slice(0, 3)
    .map(
      (row: {
        id: string;
        title: string;
        description: string;
        equipment_tags: string[] | null;
        target_muscles: string[] | null;
        image_paths: string[] | null;
      }) => {
        const paths = row.image_paths ?? [];
        const imageSrc =
          paths
            .map((path) => resolveExerciseImageSrc(path))
            .find((src): src is string => Boolean(src)) ?? null;

        return {
          id: row.id,
          title: row.title,
          description: row.description,
          equipmentTags: row.equipment_tags ?? [],
          targetMuscles: row.target_muscles ?? [],
          imageSrc,
        };
      },
    );

  return { ok: true, data: items };
}

export async function updateHabitPrefsFromAppAction(input: {
  waterGoalMl: number;
  waterReminderEnabled: boolean;
  sleepReminderEnabled: boolean;
  sleepTargetBedtime?: string | null;
  activePauseEnabled: boolean;
  activePauseIntervalMinutes: number;
}): Promise<HabitsActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (input.waterGoalMl < 250 || input.waterGoalMl > 8000) {
    return { ok: false, code: "invalid_water" };
  }

  if (
    !Number.isFinite(input.activePauseIntervalMinutes) ||
    input.activePauseIntervalMinutes < 30 ||
    input.activePauseIntervalMinutes > 240
  ) {
    return { ok: false, code: "invalid_interval" };
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
    active_pause_interval_minutes: Math.round(input.activePauseIntervalMinutes),
  };

  const { data: existingPrefs } = await supabase
    .from("user_habit_prefs")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const prefsResult = existingPrefs
    ? await supabase
        .from("user_habit_prefs")
        .update(prefsPayload)
        .eq("user_id", user.id)
    : await supabase.from("user_habit_prefs").insert({
        user_id: user.id,
        ...prefsPayload,
      });

  if (prefsResult.error) {
    console.error(
      "updateHabitPrefsFromAppAction",
      prefsResult.error.message,
    );
    return { ok: false, code: "save_failed" };
  }

  revalidateHabits();
  return { ok: true };
}

export async function acceptHabitRemindersConsentAction(
  accepted: boolean,
): Promise<HabitsActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const { error } = await supabase.from("lgpd_consent_logs").insert({
    user_id: user.id,
    purpose: "habit_reminders",
    accepted,
  });

  if (error) {
    console.error("acceptHabitRemindersConsentAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateHabits();
  return { ok: true };
}
