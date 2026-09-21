import { FOOD_AVOID_SLUGS } from "@/lib/nutrition/food-conditions-catalog";
import { MEAL_SLOT_VALUES, TAG_SLUGS } from "@/lib/tags/constants";

export const MEAL_CONTAINS_SLUGS = FOOD_AVOID_SLUGS;

export const MEAL_DIET_SLUGS = [
  TAG_SLUGS.vegan,
  TAG_SLUGS.vegetarian,
  TAG_SLUGS.lowCost,
] as const;

export const MEAL_SLOT_SLUGS = MEAL_SLOT_VALUES;

export interface MealIngredient {
  item: string;
  qty: string;
  alt?: string;
}

export interface MealFormInput {
  title: string;
  description: string;
  ingredients: MealIngredient[];
  mealSlot: string;
  containsTags: string[];
  dietCompatibleTags: string[];
  phaseTags: string[];
  imagePaths: string[];
}

export interface MealAdminRow {
  id: string;
  title: string;
  description: string;
  ingredients: MealIngredient[];
  mealSlot: string;
  containsTags: string[];
  dietCompatibleTags: string[];
  phaseTags: string[];
  imagePaths: string[];
  isPublished: boolean;
  updatedAt: string;
}

function filterAllowed(values: string[], allowed: readonly string[]): string[] {
  const set = new Set(allowed);
  return Array.from(new Set(values.filter((value) => set.has(value))));
}

function sanitizeIngredients(
  ingredients: MealIngredient[],
): MealIngredient[] | null {
  if (!Array.isArray(ingredients) || ingredients.length < 1) {
    return null;
  }

  const cleaned: MealIngredient[] = [];
  for (const row of ingredients.slice(0, 30)) {
    const item = row.item?.trim() ?? "";
    const qty = row.qty?.trim() ?? "";
    const alt = row.alt?.trim();
    if (item.length < 1 || item.length > 80) {
      return null;
    }
    if (qty.length < 1 || qty.length > 60) {
      return null;
    }
    if (alt && alt.length > 120) {
      return null;
    }
    cleaned.push(alt ? { item, qty, alt } : { item, qty });
  }

  return cleaned;
}

export function sanitizeMealFormInput(input: MealFormInput):
  | { ok: true; value: MealFormInput }
  | { ok: false; code: string } {
  const title = input.title.trim();
  const description = input.description.trim();

  if (title.length < 3 || title.length > 120) {
    return { ok: false, code: "invalid_title" };
  }
  if (description.length < 10 || description.length > 4000) {
    return { ok: false, code: "invalid_description" };
  }

  if (!MEAL_SLOT_SLUGS.includes(input.mealSlot as (typeof MEAL_SLOT_SLUGS)[number])) {
    return { ok: false, code: "invalid_meal_slot" };
  }

  const ingredients = sanitizeIngredients(input.ingredients);
  if (!ingredients) {
    return { ok: false, code: "invalid_ingredients" };
  }

  const value: MealFormInput = {
    title,
    description,
    ingredients,
    mealSlot: input.mealSlot,
    containsTags: filterAllowed(input.containsTags, MEAL_CONTAINS_SLUGS),
    dietCompatibleTags: filterAllowed(
      input.dietCompatibleTags,
      MEAL_DIET_SLUGS,
    ),
    phaseTags: [],
    imagePaths: input.imagePaths.filter((path) => path.startsWith("meals/")),
  };

  return { ok: true, value };
}

export function canPublishMeal(input: {
  mealSlot: string;
  dietCompatibleTags: string[];
  ingredients: MealIngredient[];
}): { ok: true } | { ok: false; code: string } {
  if (!MEAL_SLOT_SLUGS.includes(input.mealSlot as (typeof MEAL_SLOT_SLUGS)[number])) {
    return { ok: false, code: "invalid_meal_slot" };
  }
  if (input.ingredients.length < 1) {
    return { ok: false, code: "invalid_ingredients" };
  }
  if (input.dietCompatibleTags.length < 1) {
    return { ok: false, code: "publish_needs_diet_tags" };
  }
  if (!input.dietCompatibleTags.includes(TAG_SLUGS.lowCost)) {
    return { ok: false, code: "publish_needs_low_cost" };
  }
  return { ok: true };
}

export function parseMealIngredients(raw: unknown): MealIngredient[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }
      const record = row as Record<string, unknown>;
      const item = typeof record.item === "string" ? record.item : "";
      const qty = typeof record.qty === "string" ? record.qty : "";
      const alt = typeof record.alt === "string" ? record.alt : undefined;
      if (!item || !qty) {
        return null;
      }
      return alt ? { item, qty, alt } : { item, qty };
    })
    .filter((row): row is MealIngredient => row !== null);
}
