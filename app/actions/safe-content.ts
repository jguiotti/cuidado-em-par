"use server";

import { revalidatePath } from "next/cache";

import { resolveExerciseImageSrc } from "@/lib/admin/exercise-illustration";
import { resolveMealImageSrc } from "@/lib/admin/meal-illustration";
import {
  parseMealIngredients,
  type MealIngredient,
} from "@/lib/admin/meal-tags";
import { syncCareEventsForUserDay } from "@/lib/care/publish";
import { todayInSaoPaulo } from "@/lib/habits/day";
import { mealBlockedByDislikedFoods } from "@/lib/nutrition/disliked-foods";
import {
  ALWAYS_AVAILABLE_EQUIPMENT_SLUG,
  isExerciseCompatibleWithEquipment,
} from "@/lib/onboarding/equipment";
import { MEAL_SLOT_VALUES, type MealSlot } from "@/lib/tags/constants";
import { createClient } from "@/lib/supabase/server";

export interface SafeExerciseCard {
  id: string;
  title: string;
  description: string;
  equipmentTags: string[];
  targetMuscles: string[];
  intensityTags: string[];
  estimatedDurationMinutes: number;
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

  const { data: clinical } = await supabase
    .from("user_clinical_conditions")
    .select("available_equipment_tags")
    .eq("user_id", user.id)
    .maybeSingle();

  const availableEquipment =
    clinical?.available_equipment_tags ?? [ALWAYS_AVAILABLE_EQUIPMENT_SLUG];

  const items: SafeExerciseCard[] = (data ?? [])
    .map(
      (row: {
        id: string;
        title: string;
        description: string;
        equipment_tags: string[] | null;
        target_muscles: string[] | null;
        intensity_tags: string[] | null;
        estimated_duration_minutes: number | null;
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
          intensityTags: row.intensity_tags ?? [],
          estimatedDurationMinutes: row.estimated_duration_minutes ?? 5,
          imageSrc,
        };
      },
    )
    .filter((item: SafeExerciseCard) =>
      isExerciseCompatibleWithEquipment(item.equipmentTags, availableEquipment),
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

  const { data: nutrition } = await supabase
    .from("user_nutrition_profiles")
    .select("disliked_foods")
    .eq("user_id", user.id)
    .maybeSingle();

  const dislikedFoods = nutrition?.disliked_foods ?? [];

  let items: SafeMealCard[] = (data ?? [])
    .map(
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
    )
    .filter(
      (meal: SafeMealCard) =>
        !mealBlockedByDislikedFoods(meal.ingredients, dislikedFoods),
    );

  if (slot && slot !== "all" && MEAL_SLOT_VALUES.includes(slot)) {
    items = items.filter((meal) => meal.mealSlot === slot);
  }

  return { ok: true, items };
}

export type ContentDoneIdsResult =
  | { ok: true; contentIds: string[]; count: number }
  | { ok: false; code: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isContentUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export async function listContentDoneTodayAction(
  kind: "workout" | "meal",
): Promise<ContentDoneIdsResult> {
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
    .select("content_id")
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("kind", kind)
    .not("content_id", "is", null);

  if (error) {
    console.error("listContentDoneTodayAction", error.message);
    return { ok: false, code: "load_failed" };
  }

  const contentIds = (data ?? [])
    .map((row) => row.content_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  return { ok: true, contentIds, count: contentIds.length };
}

export async function markContentDoneAction(
  kind: "workout" | "meal",
  contentId: string,
): Promise<HabitDoneResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!isContentUuid(contentId)) {
    return { ok: false, code: "invalid_content" };
  }

  const day = todayInSaoPaulo();
  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      day,
      kind,
      value: 1,
      sleep_quality: null,
      content_id: contentId,
      content_key: contentId,
    },
    { onConflict: "user_id,day,kind,content_key" },
  );

  if (error) {
    console.error("markContentDoneAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  try {
    await syncCareEventsForUserDay(supabase, user.id);
  } catch (syncError) {
    console.error("markContentDoneAction sync", syncError);
  }

  revalidatePath(kind === "workout" ? "/workouts" : "/meals");
  revalidatePath("/home");
  revalidatePath("/circle");
  return { ok: true, done: true };
}

export async function unmarkContentDoneAction(
  kind: "workout" | "meal",
  contentId: string,
): Promise<HabitDoneResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!isContentUuid(contentId)) {
    return { ok: false, code: "invalid_content" };
  }

  const day = todayInSaoPaulo();
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("kind", kind)
    .eq("content_id", contentId);

  if (error) {
    console.error("unmarkContentDoneAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  try {
    await syncCareEventsForUserDay(supabase, user.id);
  } catch (syncError) {
    console.error("unmarkContentDoneAction sync", syncError);
  }

  revalidatePath(kind === "workout" ? "/workouts" : "/meals");
  revalidatePath("/home");
  revalidatePath("/circle");
  return { ok: true, done: false };
}
