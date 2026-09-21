/**
 * Full meal library seed — owned clinically by Nutricionista.
 * Slugs English; titles/descriptions pt-BR.
 * contains_tags = what is on the plate; diet_compatible_tags include low-cost.
 */

export interface SeedMealIngredient {
  item: string;
  qty: string;
  alt?: string;
}

export interface SeedMeal {
  slug: string;
  title: string;
  description: string;
  mealSlot: "breakfast" | "lunch" | "snack" | "dinner";
  containsTags: string[];
  dietCompatibleTags: string[];
  ingredients: SeedMealIngredient[];
  isPublished: boolean;
}

export function meal(partial: SeedMeal): SeedMeal {
  return partial;
}
