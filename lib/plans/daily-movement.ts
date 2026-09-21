/**
 * Deterministic daily movement packing from safe exercises + availability prefs.
 * No generative AI — seeded shuffle of list_safe results.
 */

import { TAG_SLUGS } from "@/lib/tags/constants";

export type CardioSuggestion = "walk" | "run" | "seated" | "none";

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

/**
 * Prefer variety across primary muscle groups while filling the minute budget.
 */
export function packExercisesForBudget(
  exercises: PackableExercise[],
  budgetMinutes: number,
  seed: number,
): { ids: string[]; totalMinutes: number } {
  if (exercises.length === 0 || budgetMinutes < 1) {
    return { ids: [], totalMinutes: 0 };
  }

  const shuffled = seededShuffle(exercises, seed);
  const selected: PackableExercise[] = [];
  const usedMuscles = new Set<string>();
  let total = 0;

  // First pass: prefer unused primary muscles
  for (const item of shuffled) {
    const duration = Math.max(1, item.estimatedDurationMinutes);
    if (total + duration > budgetMinutes) {
      continue;
    }
    const primary = item.targetMuscles[0] ?? "general";
    if (usedMuscles.has(primary) && selected.length > 0) {
      continue;
    }
    selected.push(item);
    usedMuscles.add(primary);
    total += duration;
    if (total >= budgetMinutes) {
      break;
    }
  }

  // Second pass: fill remaining minutes
  if (total < budgetMinutes) {
    for (const item of shuffled) {
      if (selected.some((picked) => picked.id === item.id)) {
        continue;
      }
      const duration = Math.max(1, item.estimatedDurationMinutes);
      if (total + duration > budgetMinutes) {
        continue;
      }
      selected.push(item);
      total += duration;
      if (total >= budgetMinutes) {
        break;
      }
    }
  }

  // If nothing fit, take the shortest single exercise under budget or first item
  if (selected.length === 0) {
    const shortest = [...exercises].sort(
      (a, b) => a.estimatedDurationMinutes - b.estimatedDurationMinutes,
    )[0];
    if (shortest && shortest.estimatedDurationMinutes <= budgetMinutes) {
      return {
        ids: [shortest.id],
        totalMinutes: shortest.estimatedDurationMinutes,
      };
    }
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
  const packed = packExercisesForBudget(input.exercises, budget, seed);

  return {
    isRestDay: false,
    exerciseIds: packed.ids,
    cardioSuggestion,
    totalMinutes: packed.totalMinutes,
  };
}
