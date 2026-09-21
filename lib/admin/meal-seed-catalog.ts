import { MEAL_SEED_BREAKFAST } from "./meal-seed-catalog-breakfast";
import { MEAL_SEED_DINNER } from "./meal-seed-catalog-dinner";
import { MEAL_SEED_LUNCH } from "./meal-seed-catalog-lunch";
import { MEAL_SEED_SNACKS } from "./meal-seed-catalog-snacks";
import type { SeedMeal } from "./meal-seed-types";

export type { SeedMeal, SeedMealIngredient } from "./meal-seed-types";

export const MEAL_SEED_CATALOG_FULL: SeedMeal[] = [
  ...MEAL_SEED_BREAKFAST,
  ...MEAL_SEED_SNACKS,
  ...MEAL_SEED_LUNCH,
  ...MEAL_SEED_DINNER,
];
