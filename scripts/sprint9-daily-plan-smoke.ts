/**
 * Smoke checks for daily movement/meal packing.
 * Run: npx tsx scripts/sprint9-daily-plan-smoke.ts
 */

import {
  buildMovementPack,
  packExercisesForBudget,
  suggestCardio,
} from "../lib/plans/daily-movement";
import { pickMealsForDay } from "../lib/plans/daily-meals";
import { TAG_SLUGS } from "../lib/tags/constants";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const exercises = [
  {
    id: "a",
    title: "Squat",
    estimatedDurationMinutes: 5,
    targetMuscles: ["legs"],
    intensityTags: [TAG_SLUGS.lowImpact],
  },
  {
    id: "b",
    title: "Push",
    estimatedDurationMinutes: 5,
    targetMuscles: ["chest"],
    intensityTags: [TAG_SLUGS.lowImpact],
  },
  {
    id: "c",
    title: "Core",
    estimatedDurationMinutes: 5,
    targetMuscles: ["core"],
    intensityTags: [TAG_SLUGS.lowImpact],
  },
  {
    id: "d",
    title: "Long",
    estimatedDurationMinutes: 30,
    targetMuscles: ["full-body"],
    intensityTags: [TAG_SLUGS.lowImpact],
  },
];

const packed = packExercisesForBudget(exercises, 15, 42);
assert(packed.totalMinutes <= 15, "budget exceeded");
assert(packed.ids.length >= 1, "expected at least one exercise");

const rest = buildMovementPack({
  userId: "user-1",
  dayIso: "2026-09-20",
  weekday: 0,
  workoutWeekdays: [1, 2, 3, 4, 5],
  workoutMinutesPerDay: 20,
  capabilityTags: [TAG_SLUGS.standing, TAG_SLUGS.seated],
  exercises,
});
assert(rest.isRestDay === true, "Sunday should be rest with Mon-Fri prefs");
assert(rest.exerciseIds.length === 0, "rest day has no exercises");

const work = buildMovementPack({
  userId: "user-1",
  dayIso: "2026-09-21",
  weekday: 1,
  workoutWeekdays: [1, 2, 3, 4, 5],
  workoutMinutesPerDay: 20,
  capabilityTags: [TAG_SLUGS.standing],
  exercises,
});
assert(work.isRestDay === false, "Monday should be workout day");
assert(work.exerciseIds.length >= 1, "workout day packs exercises");
assert(work.cardioSuggestion === "walk", "standing suggests walk");

assert(
  suggestCardio([TAG_SLUGS.seated], exercises) === "seated",
  "seated capability suggests seated cardio",
);

const meals = pickMealsForDay({
  userId: "user-1",
  dayIso: "2026-09-21",
  meals: [
    { id: "m1", mealSlot: "breakfast" },
    { id: "m2", mealSlot: "lunch" },
    { id: "m3", mealSlot: "dinner" },
  ],
});
assert(meals.breakfast === "m1", "breakfast pick");
assert(meals.lunch === "m2", "lunch pick");
assert(meals.snack === null, "empty snack");
assert(meals.dinner === "m3", "dinner pick");

const again = pickMealsForDay({
  userId: "user-1",
  dayIso: "2026-09-21",
  meals: [
    { id: "m1", mealSlot: "breakfast" },
    { id: "m2", mealSlot: "lunch" },
    { id: "m3", mealSlot: "dinner" },
  ],
});
assert(
  again.breakfast === meals.breakfast && again.lunch === meals.lunch,
  "meal picks are stable for same seed",
);

console.log("sprint9-daily-plan-smoke: PASS");
