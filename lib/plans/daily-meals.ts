/**
 * Deterministic daily meal picks per slot from list_safe_meals.
 */

import { MEAL_SLOT_VALUES, type MealSlot } from "@/lib/tags/constants";
import { hashSeed, seededShuffle } from "@/lib/plans/daily-movement";

export interface PackableMeal {
  id: string;
  mealSlot: MealSlot;
}

export type DailyMealsMap = Record<MealSlot, string | null>;

export function emptyMealsMap(): DailyMealsMap {
  return {
    breakfast: null,
    lunch: null,
    snack: null,
    dinner: null,
  };
}

export function pickMealsForDay(input: {
  userId: string;
  dayIso: string;
  meals: PackableMeal[];
}): DailyMealsMap {
  const result = emptyMealsMap();
  const seed = hashSeed(`${input.userId}:${input.dayIso}:meals`);

  for (const slot of MEAL_SLOT_VALUES) {
    const pool = input.meals.filter((meal) => meal.mealSlot === slot);
    if (pool.length === 0) {
      result[slot] = null;
      continue;
    }
    const shuffled = seededShuffle(pool, seed + slot.charCodeAt(0));
    result[slot] = shuffled[0]?.id ?? null;
  }

  return result;
}

export function parseMealsJson(value: unknown): DailyMealsMap {
  const base = emptyMealsMap();
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return base;
  }
  const record = value as Record<string, unknown>;
  for (const slot of MEAL_SLOT_VALUES) {
    const raw = record[slot];
    base[slot] = typeof raw === "string" && raw.length > 0 ? raw : null;
  }
  return base;
}
