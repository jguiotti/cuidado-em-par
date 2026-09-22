/**
 * Nutricionista — meal safety helpers.
 * Derives contains_tags from ingredients (what is on the plate) and keeps
 * diet_compatible_tags consistent. Mirrors list_safe_meals offline.
 */

import { mealBlockedByDislikedFoods } from "@/lib/nutrition/disliked-foods";
import { FOOD_AVOID_SLUGS } from "@/lib/nutrition/food-conditions-catalog";
import { TAG_SLUGS } from "@/lib/tags/constants";

export interface MealIngredientShape {
  item: string;
  qty: string;
  alt?: string;
}

export interface MealSafetyShape {
  slug?: string;
  title?: string;
  description?: string;
  containsTags: string[];
  dietCompatibleTags: string[];
  ingredients: MealIngredientShape[];
  isPublished: boolean;
  mealSlot?: string;
}

export interface NutritionProfileSafetyInput {
  dietPattern: "no-restriction" | "vegetarian" | "vegan" | string;
  avoidsTags: string[];
  dislikedFoods?: string[];
}

const ANIMAL_FOR_VEGAN = new Set(["meat", "fish", "egg", "lactose"]);
const ANIMAL_FOR_VEGETARIAN = new Set(["meat", "fish"]);

function normalizePt(value: string): string {
  return value.toLocaleLowerCase("pt-BR");
}

function itemSuggestsGluten(item: string): boolean {
  const t = normalizePt(item);
  if (/tapioca|floc[aã]o de milho|fub[aá]|polvilho|amido de milho|arroz|mandioca/.test(t)) {
    return false;
  }
  return /aveia|trigo|p[aã]o|macarr[aã]o|farinha de trigo|centeio|cevada|gl[uú]ten|cuscuz de trigo/.test(
    t,
  );
}

function itemSuggestsLactose(item: string): boolean {
  const t = normalizePt(item);
  if (/leite de (coco|am[eê]ndoa|amendoa|aveia|soja|arroz|castanha)|bebida vegetal/.test(t)) {
    return false;
  }
  // Optional dairy in the recipe → block for lactose avoiders (em dúvida, bloquear).
  if (/[aá]gua ou leite|leite ou [aá]gua/.test(t)) {
    return true;
  }
  return /(?<!de )leite\b|queijo|iogurte|ricota|requeij[aã]o|manteiga|creme de leite|coalho|minas/.test(
    t,
  );
}

function itemSuggestsEgg(item: string): boolean {
  const t = normalizePt(item);
  return /\bovos?\b/.test(t);
}

function itemSuggestsPeanut(item: string): boolean {
  return /amendoim/.test(normalizePt(item));
}

function itemSuggestsSoy(item: string): boolean {
  const t = normalizePt(item);
  return /\bsoja\b|tofu|shoyu|miss[oô]|edamame/.test(t);
}

function itemSuggestsMeat(item: string): boolean {
  const t = normalizePt(item);
  return /carne|frango|peito|mo[ií]da|porco|su[ií]no|lombo|f[ií]gado|moela|lingui[cç]a|bacon|boi|carneiro|peru\b|salsicha/.test(
    t,
  );
}

function itemSuggestsFish(item: string): boolean {
  const t = normalizePt(item);
  return /peixe|atum|sardinha|camar[aã]o|til[aá]pia|salm[aã]o|marisco|bacalhau/.test(
    t,
  );
}

/** Infers allergen/restriction tags from ingredient lines only. */
export function inferContainsTagsFromIngredients(
  ingredients: readonly MealIngredientShape[],
): string[] {
  const next = new Set<string>();
  for (const row of ingredients) {
    const item = row.item ?? "";
    if (itemSuggestsGluten(item)) {
      next.add("gluten");
    }
    if (itemSuggestsLactose(item)) {
      next.add("lactose");
    }
    if (itemSuggestsEgg(item)) {
      next.add("egg");
    }
    if (itemSuggestsPeanut(item)) {
      next.add("peanut");
    }
    if (itemSuggestsSoy(item)) {
      next.add("soy");
    }
    if (itemSuggestsMeat(item)) {
      next.add("meat");
    }
    if (itemSuggestsFish(item)) {
      next.add("fish");
    }
  }
  return Array.from(next).sort();
}

function reconcileDietTags(
  containsTags: string[],
  dietCompatibleTags: string[],
): string[] {
  const next = new Set(dietCompatibleTags);
  const hasVeganConflict = containsTags.some((tag) => ANIMAL_FOR_VEGAN.has(tag));
  const hasVegetarianConflict = containsTags.some((tag) =>
    ANIMAL_FOR_VEGETARIAN.has(tag),
  );

  if (hasVeganConflict) {
    next.delete(TAG_SLUGS.vegan);
  }
  if (hasVegetarianConflict) {
    next.delete(TAG_SLUGS.vegan);
    next.delete(TAG_SLUGS.vegetarian);
  }

  return Array.from(next);
}

/**
 * Marks every food avoid tag this meal should carry (manual ∪ inferred)
 * and drops incompatible diet_compatible tags.
 */
export function enrichMealSafetyTags<T extends MealSafetyShape>(meal: T): T {
  const inferred = inferContainsTagsFromIngredients(meal.ingredients);
  const containsTags = Array.from(
    new Set(
      [...meal.containsTags, ...inferred].filter((tag) =>
        (FOOD_AVOID_SLUGS as readonly string[]).includes(tag),
      ),
    ),
  ).sort();

  const dietCompatibleTags = reconcileDietTags(
    containsTags,
    meal.dietCompatibleTags,
  );

  return {
    ...meal,
    containsTags,
    dietCompatibleTags,
  };
}

export function enrichMealCatalog<T extends MealSafetyShape>(
  meals: readonly T[],
): T[] {
  return meals.map(enrichMealSafetyTags);
}

/** Offline mirror of public.list_safe_meals. */
export function isMealSafeForProfile(
  meal: MealSafetyShape,
  profile: NutritionProfileSafetyInput,
): boolean {
  if (!meal.isPublished) {
    return false;
  }

  for (const avoid of profile.avoidsTags) {
    if (meal.containsTags.includes(avoid)) {
      return false;
    }
  }

  if (profile.dietPattern === "vegan") {
    if (!meal.dietCompatibleTags.includes("vegan")) {
      return false;
    }
  } else if (profile.dietPattern === "vegetarian") {
    if (
      !meal.dietCompatibleTags.includes("vegetarian") &&
      !meal.dietCompatibleTags.includes("vegan")
    ) {
      return false;
    }
  }

  if (
    mealBlockedByDislikedFoods(
      meal.ingredients,
      profile.dislikedFoods ?? [],
    )
  ) {
    return false;
  }

  return true;
}

/** Avoid tags that prohibit this meal after enrichment. */
export function prohibitingAvoidsForMeal(meal: MealSafetyShape): string[] {
  return enrichMealSafetyTags(meal).containsTags;
}
