"use server";

import { revalidatePath } from "next/cache";

import {
  canPublishMeal,
  parseMealIngredients,
  sanitizeMealFormInput,
  type MealAdminRow,
  type MealFormInput,
} from "@/lib/admin/meal-tags";
import { createClient } from "@/lib/supabase/server";

export type AdminMealActionResult =
  | { ok: true; id?: string }
  | { ok: false; code: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, userId: null as string | null, isAdmin: false };
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) {
    return { supabase, userId: user.id, isAdmin: false };
  }

  return { supabase, userId: user.id, isAdmin: true };
}

function mapRow(row: {
  id: string;
  title: string;
  description: string;
  ingredients: unknown;
  meal_slot: string;
  contains_tags: string[];
  diet_compatible_tags: string[];
  phase_tags: string[];
  image_paths: string[];
  is_published: boolean;
  updated_at: string;
}): MealAdminRow {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    ingredients: parseMealIngredients(row.ingredients),
    mealSlot: row.meal_slot,
    containsTags: row.contains_tags ?? [],
    dietCompatibleTags: row.diet_compatible_tags ?? [],
    phaseTags: row.phase_tags ?? [],
    imagePaths: row.image_paths ?? [],
    isPublished: row.is_published,
    updatedAt: row.updated_at,
  };
}

function toDbPayload(value: MealFormInput, userId: string) {
  return {
    title: value.title,
    description: value.description,
    ingredients: value.ingredients,
    meal_slot: value.mealSlot,
    contains_tags: value.containsTags,
    diet_compatible_tags: value.dietCompatibleTags,
    phase_tags: value.phaseTags,
    image_paths: value.imagePaths,
    created_by: userId,
  };
}

function revalidateAdminMeals(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/meals");
  revalidatePath("/meals");
  if (id) {
    revalidatePath(`/admin/meals/${id}`);
  }
}

export async function listAdminMealsAction(): Promise<
  | { ok: true; meals: MealAdminRow[] }
  | { ok: false; code: string }
> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  const { data, error } = await supabase
    .from("meals_library")
    .select(
      "id, title, description, ingredients, meal_slot, contains_tags, diet_compatible_tags, phase_tags, image_paths, is_published, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listAdminMealsAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  return {
    ok: true,
    meals: (data ?? []).map(mapRow),
  };
}

export async function getAdminMealAction(
  id: string,
): Promise<
  | { ok: true; meal: MealAdminRow }
  | { ok: false; code: string }
> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  const { data, error } = await supabase
    .from("meals_library")
    .select(
      "id, title, description, ingredients, meal_slot, contains_tags, diet_compatible_tags, phase_tags, image_paths, is_published, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getAdminMealAction", error.message);
    return { ok: false, code: "save_failed" };
  }
  if (!data) {
    return { ok: false, code: "not_found" };
  }

  return { ok: true, meal: mapRow(data) };
}

export async function createMealAction(
  input: MealFormInput,
): Promise<AdminMealActionResult> {
  const { supabase, userId, isAdmin } = await requireAdmin();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  const sanitized = sanitizeMealFormInput(input);
  if (!sanitized.ok) {
    return { ok: false, code: sanitized.code };
  }

  const { data, error } = await supabase
    .from("meals_library")
    .insert({
      ...toDbPayload(sanitized.value, userId),
      is_published: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createMealAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateAdminMeals(data.id);
  return { ok: true, id: data.id };
}

export async function updateMealAction(
  id: string,
  input: MealFormInput,
): Promise<AdminMealActionResult> {
  const { supabase, userId, isAdmin } = await requireAdmin();
  if (!userId) {
    return { ok: false, code: "unauthenticated" };
  }
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  const sanitized = sanitizeMealFormInput(input);
  if (!sanitized.ok) {
    return { ok: false, code: sanitized.code };
  }

  const { data: existing, error: loadError } = await supabase
    .from("meals_library")
    .select("is_published")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !existing) {
    return { ok: false, code: "not_found" };
  }

  if (existing.is_published) {
    const publishCheck = canPublishMeal(sanitized.value);
    if (!publishCheck.ok) {
      return { ok: false, code: publishCheck.code };
    }
  }

  const { error } = await supabase
    .from("meals_library")
    .update(toDbPayload(sanitized.value, userId))
    .eq("id", id);

  if (error) {
    console.error("updateMealAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateAdminMeals(id);
  return { ok: true, id };
}

export async function setMealPublishedAction(
  id: string,
  isPublished: boolean,
): Promise<AdminMealActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  if (isPublished) {
    const current = await getAdminMealAction(id);
    if (!current.ok) {
      return current;
    }
    const publishCheck = canPublishMeal(current.meal);
    if (!publishCheck.ok) {
      return { ok: false, code: publishCheck.code };
    }
  }

  const { error } = await supabase
    .from("meals_library")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) {
    console.error("setMealPublishedAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateAdminMeals(id);
  return { ok: true, id };
}

export async function createMealImageUploadAction(
  mealId: string,
  fileName: string,
): Promise<
  | { ok: true; path: string; token: string }
  | { ok: false; code: string }
> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  const safeName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  if (!safeName || !/\.(png|jpe?g|webp)$/.test(safeName)) {
    return { ok: false, code: "invalid_image" };
  }

  const path = `meals/${mealId}/${Date.now()}-${safeName}`;
  const { data, error } = await supabase.storage
    .from("content-media")
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("createMealImageUploadAction", error?.message);
    return { ok: false, code: "save_failed" };
  }

  return { ok: true, path, token: data.token };
}

export async function attachMealImagePathAction(
  mealId: string,
  path: string,
): Promise<AdminMealActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { ok: false, code: "forbidden" };
  }

  if (!path.startsWith(`meals/${mealId}/`)) {
    return { ok: false, code: "invalid_image" };
  }

  const current = await getAdminMealAction(mealId);
  if (!current.ok) {
    return current;
  }

  const imagePaths = Array.from(
    new Set([...current.meal.imagePaths, path]),
  );

  const { error } = await supabase
    .from("meals_library")
    .update({ image_paths: imagePaths })
    .eq("id", mealId);

  if (error) {
    console.error("attachMealImagePathAction", error.message);
    return { ok: false, code: "save_failed" };
  }

  revalidateAdminMeals(mealId);
  return { ok: true, id: mealId };
}
