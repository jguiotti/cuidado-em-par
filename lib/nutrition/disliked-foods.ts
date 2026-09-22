/**
 * Taste dislikes (not clinical avoids). Stored as normalized pt-BR tokens
 * and matched against meal ingredient.item; ingredients with alt still pass.
 */

const MAX_DISLIKES = 40;
const MAX_TOKEN_LENGTH = 40;

export function normalizeDislikedFood(raw: string): string | null {
  const trimmed = raw.trim().toLocaleLowerCase("pt-BR");
  if (trimmed.length < 2) {
    return null;
  }
  const withoutAccents = trimmed
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (withoutAccents.length < 2 || withoutAccents.length > MAX_TOKEN_LENGTH) {
    return null;
  }
  return withoutAccents;
}

export function filterDislikedFoods(raw: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of raw) {
    const normalized = normalizeDislikedFood(entry);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= MAX_DISLIKES) {
      break;
    }
  }
  return result;
}

function normalizeForMatch(value: string): string {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function ingredientMatchesDislike(
  item: string,
  dislike: string,
): boolean {
  const haystack = normalizeForMatch(item);
  const needle = normalizeForMatch(dislike);
  if (!needle) {
    return false;
  }
  return haystack.includes(needle);
}

export function hasUsableSubstitute(alt: string | undefined | null): boolean {
  return Boolean(alt && alt.trim().length > 0);
}

/**
 * Offline mirror of list_safe_meals dislike rule:
 * block only when a disliked ingredient has no substitute (alt).
 */
export function mealBlockedByDislikedFoods(
  ingredients: readonly { item: string; alt?: string | null }[],
  dislikedFoods: readonly string[],
): boolean {
  if (!dislikedFoods.length) {
    return false;
  }
  for (const ingredient of ingredients) {
    for (const dislike of dislikedFoods) {
      if (
        ingredientMatchesDislike(ingredient.item, dislike) &&
        !hasUsableSubstitute(ingredient.alt)
      ) {
        return true;
      }
    }
  }
  return false;
}
