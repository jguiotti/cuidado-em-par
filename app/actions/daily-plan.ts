"use server";

import { revalidatePath } from "next/cache";

import {
  listSafeExercisesForMeAction,
  listSafeMealsForMeAction,
  type SafeExerciseCard,
  type SafeMealCard,
} from "@/app/actions/safe-content";
import { syncCareEventsForUserDay } from "@/lib/care/publish";
import { todayInSaoPaulo } from "@/lib/habits/day";
import {
  DEFAULT_HABIT_PREFS,
  type HabitPrefsSnapshot,
} from "@/lib/habits/types";
import {
  emptyMealsMap,
  parseMealsJson,
  pickMealsForDay,
  type DailyMealsMap,
} from "@/lib/plans/daily-meals";
import {
  buildMovementPack,
  type CardioSuggestion,
  weekdayInSaoPaulo,
} from "@/lib/plans/daily-movement";
import { createClient } from "@/lib/supabase/server";
import {
  MEAL_SLOT_VALUES,
  type MealSlot,
} from "@/lib/tags/constants";

export type DailyPlanResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; code: string };

export interface TodayPlanSnapshot {
  day: string;
  isRestDay: boolean;
  cardioSuggestion: CardioSuggestion;
  workoutMinutesPerDay: number;
  exercises: SafeExerciseCard[];
  meals: Record<MealSlot, SafeMealCard | null>;
  doneExerciseIds: string[];
  doneMealSlots: MealSlot[];
  customMeals: Array<{ slot: MealSlot; note: string }>;
  prefs: HabitPrefsSnapshot;
}

function revalidatePlans() {
  revalidatePath("/home");
  revalidatePath("/workouts");
  revalidatePath("/meals");
  revalidatePath("/progress");
  revalidatePath("/account");
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function mapPrefsRow(row: {
  water_goal_ml: number;
  water_reminder_enabled: boolean;
  sleep_reminder_enabled: boolean | null;
  sleep_target_bedtime: string | null;
  active_pause_enabled: boolean;
  active_pause_interval_minutes: number;
  workout_minutes_per_day?: number | null;
  workout_weekdays?: number[] | null;
} | null): HabitPrefsSnapshot {
  if (!row) {
    return { ...DEFAULT_HABIT_PREFS };
  }
  const bedtime = row.sleep_target_bedtime;
  let sleepTargetBedtime: string | null = null;
  if (typeof bedtime === "string" && bedtime.length >= 5) {
    sleepTargetBedtime = bedtime.slice(0, 5);
  }
  const weekdays = Array.isArray(row.workout_weekdays)
    ? row.workout_weekdays.filter(
        (day): day is number =>
          typeof day === "number" && day >= 0 && day <= 6,
      )
    : DEFAULT_HABIT_PREFS.workoutWeekdays;

  return {
    waterGoalMl: row.water_goal_ml,
    waterReminderEnabled: row.water_reminder_enabled,
    sleepReminderEnabled: row.sleep_reminder_enabled ?? true,
    sleepTargetBedtime,
    activePauseEnabled: row.active_pause_enabled,
    activePauseIntervalMinutes: row.active_pause_interval_minutes,
    workoutMinutesPerDay:
      typeof row.workout_minutes_per_day === "number"
        ? row.workout_minutes_per_day
        : DEFAULT_HABIT_PREFS.workoutMinutesPerDay,
    workoutWeekdays:
      weekdays.length > 0 ? weekdays : DEFAULT_HABIT_PREFS.workoutWeekdays,
  };
}

export async function getOrCreateTodayPlanAction(): Promise<
  DailyPlanResult<TodayPlanSnapshot>
> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();
  const weekday = weekdayInSaoPaulo(day);

  const [prefsResult, planResult, safeExercises, safeMeals, clinical] =
    await Promise.all([
      supabase
        .from("user_habit_prefs")
        .select(
          "water_goal_ml, water_reminder_enabled, sleep_reminder_enabled, sleep_target_bedtime, active_pause_enabled, active_pause_interval_minutes, workout_minutes_per_day, workout_weekdays",
        )
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_daily_plans")
        .select(
          "exercise_ids, meals, is_rest_day, cardio_suggestion",
        )
        .eq("user_id", user.id)
        .eq("day", day)
        .maybeSingle(),
      listSafeExercisesForMeAction(),
      listSafeMealsForMeAction(),
      supabase
        .from("user_clinical_conditions")
        .select("capability_tags")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (prefsResult.error || planResult.error) {
    console.error(
      "getOrCreateTodayPlanAction",
      prefsResult.error?.message ?? planResult.error?.message,
    );
    return { ok: false, code: "load_failed" };
  }

  const prefs = mapPrefsRow(prefsResult.data);
  const exercises = safeExercises.ok ? safeExercises.items : [];
  const meals = safeMeals.ok ? safeMeals.items : [];
  const capabilityTags = clinical.data?.capability_tags ?? [];

  let exerciseIds: string[] = planResult.data?.exercise_ids ?? [];
  let mealsMap = planResult.data
    ? parseMealsJson(planResult.data.meals)
    : emptyMealsMap();
  let isRestDay = planResult.data?.is_rest_day ?? false;
  let cardioSuggestion = (planResult.data?.cardio_suggestion ??
    "none") as CardioSuggestion;

  if (!planResult.data) {
    const pack = buildMovementPack({
      userId: user.id,
      dayIso: day,
      weekday,
      workoutWeekdays: prefs.workoutWeekdays,
      workoutMinutesPerDay: prefs.workoutMinutesPerDay,
      capabilityTags,
      exercises: exercises.map((item) => ({
        id: item.id,
        title: item.title,
        estimatedDurationMinutes: item.estimatedDurationMinutes,
        targetMuscles: item.targetMuscles,
        intensityTags: item.intensityTags,
      })),
    });
    exerciseIds = pack.exerciseIds;
    isRestDay = pack.isRestDay;
    cardioSuggestion = pack.cardioSuggestion;
    mealsMap = pickMealsForDay({
      userId: user.id,
      dayIso: day,
      meals: meals.map((item) => ({ id: item.id, mealSlot: item.mealSlot })),
    });

    const { error: insertError } = await supabase
      .from("user_daily_plans")
      .insert({
        user_id: user.id,
        day,
        exercise_ids: exerciseIds,
        meals: mealsMap,
        is_rest_day: isRestDay,
        cardio_suggestion: cardioSuggestion,
      });

    if (insertError) {
      console.error("getOrCreateTodayPlanAction insert", insertError.message);
      return { ok: false, code: "save_failed" };
    }
  }

  const exerciseById = new Map(exercises.map((item) => [item.id, item]));
  const mealById = new Map(meals.map((item) => [item.id, item]));

  const plannedExercises = exerciseIds
    .map((id) => exerciseById.get(id))
    .filter((item): item is SafeExerciseCard => Boolean(item));

  const plannedMeals = {
    breakfast: mealsMap.breakfast
      ? mealById.get(mealsMap.breakfast) ?? null
      : null,
    lunch: mealsMap.lunch ? mealById.get(mealsMap.lunch) ?? null : null,
    snack: mealsMap.snack ? mealById.get(mealsMap.snack) ?? null : null,
    dinner: mealsMap.dinner ? mealById.get(mealsMap.dinner) ?? null : null,
  } as Record<MealSlot, SafeMealCard | null>;

  const { data: logs } = await supabase
    .from("habit_logs")
    .select("kind, content_id, content_key, meal_slot, note")
    .eq("user_id", user.id)
    .eq("day", day)
    .in("kind", ["workout", "meal"]);

  const doneExerciseIds = (logs ?? [])
    .filter((row) => row.kind === "workout" && row.content_id)
    .map((row) => row.content_id as string);

  const doneMealSlots: MealSlot[] = [];
  const customMeals: Array<{ slot: MealSlot; note: string }> = [];

  for (const row of logs ?? []) {
    if (row.kind !== "meal") {
      continue;
    }
    if (
      row.meal_slot &&
      (MEAL_SLOT_VALUES as readonly string[]).includes(row.meal_slot)
    ) {
      const slot = row.meal_slot as MealSlot;
      if (!doneMealSlots.includes(slot)) {
        doneMealSlots.push(slot);
      }
      if (
        typeof row.content_key === "string" &&
        row.content_key.startsWith("custom:") &&
        row.note
      ) {
        customMeals.push({ slot, note: row.note });
      }
    }
  }

  return {
    ok: true,
    data: {
      day,
      isRestDay,
      cardioSuggestion,
      workoutMinutesPerDay: prefs.workoutMinutesPerDay,
      exercises: plannedExercises,
      meals: plannedMeals,
      doneExerciseIds,
      doneMealSlots,
      customMeals,
      prefs,
    },
  };
}

export async function swapPlanExerciseAction(input: {
  fromExerciseId: string;
  toExerciseId: string;
}): Promise<DailyPlanResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();
  const safe = await listSafeExercisesForMeAction();
  if (!safe.ok) {
    return { ok: false, code: safe.code };
  }
  if (!safe.items.some((item) => item.id === input.toExerciseId)) {
    return { ok: false, code: "unsafe_swap" };
  }

  const { data: plan } = await supabase
    .from("user_daily_plans")
    .select("exercise_ids")
    .eq("user_id", user.id)
    .eq("day", day)
    .maybeSingle();

  if (!plan) {
    return { ok: false, code: "plan_missing" };
  }

  const ids = [...(plan.exercise_ids ?? [])];
  const index = ids.indexOf(input.fromExerciseId);
  if (index < 0) {
    return { ok: false, code: "not_in_plan" };
  }
  if (ids.includes(input.toExerciseId) && input.toExerciseId !== input.fromExerciseId) {
    return { ok: false, code: "already_in_plan" };
  }

  ids[index] = input.toExerciseId;

  const { error } = await supabase
    .from("user_daily_plans")
    .update({ exercise_ids: ids, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("day", day);

  if (error) {
    console.error("swapPlanExerciseAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidatePlans();
  return { ok: true };
}

export async function swapPlanMealAction(input: {
  slot: MealSlot;
  toMealId: string;
}): Promise<DailyPlanResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(MEAL_SLOT_VALUES as readonly string[]).includes(input.slot)) {
    return { ok: false, code: "invalid_slot" };
  }

  const day = todayInSaoPaulo();
  const safe = await listSafeMealsForMeAction(input.slot);
  if (!safe.ok) {
    return { ok: false, code: safe.code };
  }
  const match = safe.items.find((item) => item.id === input.toMealId);
  if (!match || match.mealSlot !== input.slot) {
    return { ok: false, code: "unsafe_swap" };
  }

  const { data: plan } = await supabase
    .from("user_daily_plans")
    .select("meals")
    .eq("user_id", user.id)
    .eq("day", day)
    .maybeSingle();

  if (!plan) {
    return { ok: false, code: "plan_missing" };
  }

  const mealsMap = parseMealsJson(plan.meals);
  mealsMap[input.slot] = input.toMealId;

  const { error } = await supabase
    .from("user_daily_plans")
    .update({ meals: mealsMap, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("day", day);

  if (error) {
    console.error("swapPlanMealAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidatePlans();
  return { ok: true };
}

export async function logCustomMealAction(input: {
  slot: MealSlot;
  note: string;
}): Promise<DailyPlanResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(MEAL_SLOT_VALUES as readonly string[]).includes(input.slot)) {
    return { ok: false, code: "invalid_slot" };
  }

  const note = input.note.trim();
  if (note.length < 2 || note.length > 120) {
    return { ok: false, code: "invalid_note" };
  }

  const day = todayInSaoPaulo();
  const contentKey = `custom:${input.slot}`;

  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      day,
      kind: "meal",
      value: 1,
      content_id: null,
      content_key: contentKey,
      meal_slot: input.slot,
      note,
      distance_m: null,
    },
    { onConflict: "user_id,day,kind,content_key" },
  );

  if (error) {
    console.error("logCustomMealAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  try {
    await syncCareEventsForUserDay(supabase, user.id);
  } catch (syncError) {
    console.error("logCustomMealAction sync", syncError);
  }

  revalidatePlans();
  return { ok: true };
}

export async function markPlanMealDoneAction(input: {
  mealId: string;
  slot: MealSlot;
}): Promise<DailyPlanResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!(MEAL_SLOT_VALUES as readonly string[]).includes(input.slot)) {
    return { ok: false, code: "invalid_slot" };
  }

  const safe = await listSafeMealsForMeAction(input.slot);
  if (!safe.ok || !safe.items.some((item) => item.id === input.mealId)) {
    return { ok: false, code: "unsafe_meal" };
  }

  const day = todayInSaoPaulo();
  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      day,
      kind: "meal",
      value: 1,
      content_id: input.mealId,
      content_key: input.mealId,
      meal_slot: input.slot,
      note: null,
      distance_m: null,
    },
    { onConflict: "user_id,day,kind,content_key" },
  );

  if (error) {
    console.error("markPlanMealDoneAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  try {
    await syncCareEventsForUserDay(supabase, user.id);
  } catch (syncError) {
    console.error("markPlanMealDoneAction sync", syncError);
  }

  revalidatePlans();
  return { ok: true };
}

export type { DailyMealsMap };
