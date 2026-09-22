/**
 * Smoke checks for daily movement/meal packing.
 * Run: npx tsx scripts/sprint9-daily-plan-smoke.ts
 */

import {
  buildMovementPack,
  classifyBodyRegion,
  packExercisesForBudget,
  suggestCardio,
  targetExerciseCount,
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
  {
    id: "e",
    title: "Lunge",
    estimatedDurationMinutes: 5,
    targetMuscles: ["glutes"],
    intensityTags: [TAG_SLUGS.lowImpact],
  },
  {
    id: "f",
    title: "Row",
    estimatedDurationMinutes: 5,
    targetMuscles: ["back"],
    intensityTags: [TAG_SLUGS.lowImpact],
  },
  {
    id: "g",
    title: "Shoulder",
    estimatedDurationMinutes: 5,
    targetMuscles: ["shoulders"],
    intensityTags: [TAG_SLUGS.lowImpact],
  },
  {
    id: "h",
    title: "Arms",
    estimatedDurationMinutes: 5,
    targetMuscles: ["arms"],
    intensityTags: [TAG_SLUGS.lowImpact],
  },
];

assert(targetExerciseCount(15) === 2, "15 min → 2 exercises");
assert(targetExerciseCount(20) === 3, "20 min → 3 exercises");
assert(targetExerciseCount(30) === 4, "30 min → 4 exercises");
assert(targetExerciseCount(40) === 5, "40 min → 5 exercises");
assert(targetExerciseCount(50) === 6, "50 min → 6 exercises");
assert(targetExerciseCount(90) === 6, "90 min still caps at 6");

assert(classifyBodyRegion(["legs"]) === "lower", "legs = lower");
assert(classifyBodyRegion(["chest"]) === "upper", "chest = upper");
assert(classifyBodyRegion(["core"]) === "neutral", "core = neutral");

const packed = packExercisesForBudget(exercises, 30, 42);
assert(packed.ids.length <= 4, "30 min packs at most 4");
assert(packed.ids.length >= 2, "expected at least two when pool allows");

const byId = new Map(exercises.map((item) => [item.id, item]));
const regions = packed.ids.map(
  (id) => classifyBodyRegion(byId.get(id)?.targetMuscles ?? []),
);
const hasLower = regions.some((region) => region === "lower");
const hasUpper = regions.some((region) => region === "upper");
assert(hasLower && hasUpper, "pack mixes lower and upper when both exist");

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
assert(work.exerciseIds.length === 3, "20 min → 3 exercises");
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
