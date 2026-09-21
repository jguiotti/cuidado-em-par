"use server";

import { revalidatePath } from "next/cache";

import { resolveExerciseImageSrc } from "@/lib/admin/exercise-illustration";
import { resolveMealImageSrc } from "@/lib/admin/meal-illustration";
import {
  parseMealIngredients,
  type MealIngredient,
} from "@/lib/admin/meal-tags";
import { todayInSaoPaulo } from "@/lib/habits/day";
import { MEAL_SLOT_VALUES, type MealSlot } from "@/lib/tags/constants";
import { createClient } from "@/lib/supabase/server";

export interface SafeExerciseCard {
  id: string;
  title: string;
  description: string;
  equipmentTags: string[];
  targetMuscles: string[];
  imageSrc: string | null;
}

export interface SafeMealCard {
  id: string;
  title: string;
  description: string;
  mealSlot: MealSlot;
  ingredients: MealIngredient[];
  dietCompatibleTags: string[];
  imageSrc: string | null;
}

export type SafeContentResult<T> =
  | { ok: true; items: T[] }
  | { ok: false; code: string };

export type HabitDoneResult =
  | { ok: true; done: boolean }
  | { ok: false; code: string };

export async function listSafeExercisesForMeAction(): Promise<
  SafeContentResult<SafeExerciseCard>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const { data, error } = await supabase.rpc("list_safe_exercises");
  if (error) {
    console.error("listSafeExercisesForMeAction", error.message);
    return { ok: false, code: "load_failed" };
  }

  const items: SafeExerciseCard[] = (data ?? []).map(
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

  return { ok: true, items };
}

export async function listSafeMealsForMeAction(
  slot?: MealSlot | "all",
): Promise<SafeContentResult<SafeMealCard>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const { data, error } = await supabase.rpc("list_safe_meals");
  if (error) {
    console.error("listSafeMealsForMeAction", error.message);
    return { ok: false, code: "load_failed" };
  }

  let items: SafeMealCard[] = (data ?? []).map(
    (row: {
      id: string;
      title: string;
      description: string;
      meal_slot: string;
      ingredients: unknown;
      diet_compatible_tags: string[] | null;
      image_paths: string[] | null;
    }) => {
      const paths = row.image_paths ?? [];
      const imageSrc =
        paths
          .map((path) => resolveMealImageSrc(path))
          .find((src): src is string => Boolean(src)) ?? null;

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        mealSlot: row.meal_slot as MealSlot,
        ingredients: parseMealIngredients(row.ingredients),
        dietCompatibleTags: row.diet_compatible_tags ?? [],
        imageSrc,
      };
    },
  );

  if (slot && slot !== "all" && MEAL_SLOT_VALUES.includes(slot)) {
    items = items.filter((meal) => meal.mealSlot === slot);
  }

  return { ok: true, items };
}

export async function getHabitDoneTodayAction(
  kind: "workout" | "meal",
): Promise<HabitDoneResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();
  const { data, error } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("kind", kind)
    .maybeSingle();

  if (error) {
    console.error("getHabitDoneTodayAction", error.message);
    return { ok: false, code: "load_failed" };
  }

  return { ok: true, done: Boolean(data) };
}

export async function markHabitDoneAction(
  kind: "workout" | "meal",
): Promise<HabitDoneResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();
  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      day,
      kind,
      value: 1,
    },
    { onConflict: "user_id,day,kind" },
  );

  if (error) {
    console.error("markHabitDoneAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidatePath(kind === "workout" ? "/workouts" : "/meals");
  revalidatePath("/home");
  return { ok: true, done: true };
}

export async function unmarkHabitDoneAction(
  kind: "workout" | "meal",
): Promise<HabitDoneResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  const day = todayInSaoPaulo();
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("kind", kind);

  if (error) {
    console.error("unmarkHabitDoneAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidatePath(kind === "workout" ? "/workouts" : "/meals");
  revalidatePath("/home");
  return { ok: true, done: false };
}
