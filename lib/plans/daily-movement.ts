/**
 * Deterministic daily movement packing from safe exercises + availability prefs.
 * No generative AI — seeded shuffle of list_safe results.
 * Count scales with available minutes (cap 6); prefers alternating lower/upper body.
 */

import { TAG_SLUGS } from "@/lib/tags/constants";

export type CardioSuggestion = "walk" | "run" | "seated" | "none";

export type BodyRegion = "lower" | "upper" | "neutral";

export interface PackableExercise {
  id: string;
  title: string;
  estimatedDurationMinutes: number;
  targetMuscles: string[];
  intensityTags: string[];
}

export interface MovementPackInput {
  userId: string;
  dayIso: string;
  weekday: number;
  workoutWeekdays: number[];
  workoutMinutesPerDay: number;
  capabilityTags: string[];
  exercises: PackableExercise[];
}

export interface MovementPackResult {
  isRestDay: boolean;
  exerciseIds: string[];
  cardioSuggestion: CardioSuggestion;
  totalMinutes: number;
}

/** Hard cap for a single day's planned strength/mobility moves (cardio is separate). */
export const MAX_DAILY_EXERCISES = 6;

const LOWER_MUSCLES = new Set(["legs", "glutes"]);
const UPPER_MUSCLES = new Set(["chest", "back", "shoulders", "arms"]);

/** FNV-1a style hash for stable per-user-day seeds. */
export function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  let state = seed || 1;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

export function clampWorkoutMinutes(minutes: number): number {
  return Math.min(120, Math.max(5, Math.round(minutes)));
}

export function normalizeWeekdays(days: number[]): number[] {
  const set = new Set(
    days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6),
  );
  return Array.from(set).sort((a, b) => a - b);
}

export function weekdayInSaoPaulo(isoDay: string): number {
  const [y, m, d] = isoDay.split("-").map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d!, 15));
  return date.getUTCDay();
}

/**
 * How many exercises fit a realistic day for the chosen time budget.
 * ~1 move per 8 minutes; minimum 2 when there is time; maximum 6.
 */
export function targetExerciseCount(budgetMinutes: number): number {
  const budget = clampWorkoutMinutes(budgetMinutes);
  return Math.min(
    MAX_DAILY_EXERCISES,
    Math.max(2, Math.round(budget / 8)),
  );
}

export function classifyBodyRegion(muscles: string[]): BodyRegion {
  const hasLower = muscles.some((muscle) => LOWER_MUSCLES.has(muscle));
  const hasUpper = muscles.some((muscle) => UPPER_MUSCLES.has(muscle));
  if (hasLower && !hasUpper) {
    return "lower";
  }
  if (hasUpper && !hasLower) {
    return "upper";
  }
  if (hasLower && hasUpper) {
    return "neutral";
  }
  return "neutral";
}

export function suggestCardio(
  capabilityTags: string[],
  exercises: PackableExercise[],
): CardioSuggestion {
  const canStand = capabilityTags.includes(TAG_SLUGS.standing);
  const hasSeatedCardio = exercises.some(
    (item) =>
      item.intensityTags.includes(TAG_SLUGS.lowImpact) &&
      item.targetMuscles.some((muscle) =>
        ["legs", "full-body", "cardio"].includes(muscle),
      ),
  );

  if (canStand) {
    return "walk";
  }
  if (hasSeatedCardio || capabilityTags.includes(TAG_SLUGS.seated)) {
    return "seated";
  }
  return "none";
}

function takeFromPool(
  pool: PackableExercise[],
  usedIds: Set<string>,
  remainingMinutes: number,
): PackableExercise | null {
  for (const item of pool) {
    if (usedIds.has(item.id)) {
      continue;
    }
    const duration = Math.max(1, item.estimatedDurationMinutes);
    if (duration > remainingMinutes && remainingMinutes > 0) {
      continue;
    }
    return item;
  }
  // Prefer something even if slightly over remaining when pool is tight
  for (const item of pool) {
    if (!usedIds.has(item.id)) {
      return item;
    }
  }
  return null;
}

/**
 * Pack up to targetCount exercises within the minute budget,
 * alternating lower and upper body when both are available.
 */
export function packExercisesForBudget(
  exercises: PackableExercise[],
  budgetMinutes: number,
  seed: number,
  maxCount: number = targetExerciseCount(budgetMinutes),
): { ids: string[]; totalMinutes: number } {
  if (exercises.length === 0 || budgetMinutes < 1 || maxCount < 1) {
    return { ids: [], totalMinutes: 0 };
  }

  const targetCount = Math.min(MAX_DAILY_EXERCISES, Math.max(1, maxCount));
  const shuffled = seededShuffle(exercises, seed);

  const lower = shuffled.filter(
    (item) => classifyBodyRegion(item.targetMuscles) === "lower",
  );
  const upper = shuffled.filter(
    (item) => classifyBodyRegion(item.targetMuscles) === "upper",
  );
  const neutral = shuffled.filter(
    (item) => classifyBodyRegion(item.targetMuscles) === "neutral",
  );

  const selected: PackableExercise[] = [];
  const usedIds = new Set<string>();
  let total = 0;
  let preferLower = seed % 2 === 0;

  while (selected.length < targetCount) {
    const remainingMinutes = budgetMinutes - total;
    if (remainingMinutes <= 0 && selected.length > 0) {
      break;
    }

    const primaryPool = preferLower ? lower : upper;
    const secondaryPool = preferLower ? upper : lower;

    let pick =
      takeFromPool(primaryPool, usedIds, remainingMinutes) ??
      takeFromPool(secondaryPool, usedIds, remainingMinutes) ??
      takeFromPool(neutral, usedIds, remainingMinutes) ??
      takeFromPool(shuffled, usedIds, remainingMinutes);

    if (!pick) {
      break;
    }

    selected.push(pick);
    usedIds.add(pick.id);
    total += Math.max(1, pick.estimatedDurationMinutes);
    preferLower = !preferLower;
  }

  if (selected.length === 0) {
    const shortest = [...exercises].sort(
      (a, b) => a.estimatedDurationMinutes - b.estimatedDurationMinutes,
    )[0];
    if (shortest) {
      return {
        ids: [shortest.id],
        totalMinutes: shortest.estimatedDurationMinutes,
      };
    }
  }

  return { ids: selected.map((item) => item.id), totalMinutes: total };
}

export function buildMovementPack(input: MovementPackInput): MovementPackResult {
  const weekdays = normalizeWeekdays(input.workoutWeekdays);
  const budget = clampWorkoutMinutes(input.workoutMinutesPerDay);
  const cardioSuggestion = suggestCardio(
    input.capabilityTags,
    input.exercises,
  );
  const isRestDay = weekdays.length > 0 && !weekdays.includes(input.weekday);

  if (isRestDay) {
    return {
      isRestDay: true,
      exerciseIds: [],
      cardioSuggestion,
      totalMinutes: 0,
    };
  }

  const seed = hashSeed(`${input.userId}:${input.dayIso}:movement`);
  const count = targetExerciseCount(budget);
  const packed = packExercisesForBudget(input.exercises, budget, seed, count);

  return {
    isRestDay: false,
    exerciseIds: packed.ids,
    cardioSuggestion,
    totalMinutes: packed.totalMinutes,
  };
}
