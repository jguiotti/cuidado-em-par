/**
 * Builds prompts for realistic meal plate photos.
 */

import { MEAL_SEED_CATALOG_FULL } from "../lib/admin/meal-seed-catalog";

const STYLE = [
  "Realistic food photography",
  "homemade Brazilian plate on a simple ceramic dish",
  "natural daylight, soft shadows, appetizing but not luxury restaurant",
  "no text, no watermark, no hands, no people",
  "clean light kitchen background, slightly blurred",
  "square composition centered on the food",
].join(", ");

export function promptForMeal(title: string, description: string): string {
  return `${STYLE}. Dish: ${title}. Details: ${description.slice(0, 180)}`;
}

export function listMealImageJobs() {
  return MEAL_SEED_CATALOG_FULL.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    filename: `${entry.slug}.png`,
    prompt: promptForMeal(entry.title, entry.description),
  }));
}
