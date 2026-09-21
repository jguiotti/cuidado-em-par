/**
 * Launch-library coverage checks against seed catalogs (offline).
 * Mirrors list_safe_* rules at a simplified level for MVP gate.
 */

import { EXERCISE_SEED_CATALOG_FULL } from "../lib/admin/exercise-seed-catalog";
import { MEAL_SEED_CATALOG_FULL } from "../lib/admin/meal-seed-catalog";
import { memberLimitForKind } from "../lib/care/circle";

function assert(name: string, condition: boolean) {
  console.log(`${condition ? "PASS" : "FAIL"} ${name}`);
}

const publishedExercises = EXERCISE_SEED_CATALOG_FULL.filter((e) => e.isPublished);
const publishedMeals = MEAL_SEED_CATALOG_FULL; // seed treats catalog as publishable library

assert("pair member limit is 2", memberLimitForKind("pair") === 2);
assert("group member limit is 8", memberLimitForKind("group") === 8);

const seatedOnly = publishedExercises.filter(
  (e) =>
    e.requiredCapabilityTags.includes("seated") &&
    !e.requiredCapabilityTags.includes("standing"),
);
assert("seated-capable exercises exist", seatedOnly.length >= 1);

const activePause = publishedExercises.filter((e) =>
  e.intensityTags.includes("active-pause"),
);
assert("active-pause exercises exist", activePause.length >= 1);

const notBlockedForPregnancyT3 = publishedExercises.filter(
  (e) => !e.contraindicationTags.includes("pregnancy-trimester-3"),
);
assert(
  "pregnancy-t3 has some non-contraindicated exercises",
  notBlockedForPregnancyT3.length >= 1,
);

const tornAclSafe = publishedExercises.filter((e) => {
  const blocked =
    e.intensityTags.includes("high-impact") ||
    e.intensityTags.includes("lower-body-plyometrics") ||
    e.contraindicationTags.includes("torn-acl");
  return !blocked && e.requiredCapabilityTags.length > 0;
});
assert("torn-acl-safe candidates exist", tornAclSafe.length >= 1);

const veganLowCost = publishedMeals.filter(
  (m) =>
    m.dietCompatibleTags.includes("vegan") &&
    m.dietCompatibleTags.includes("low-cost"),
);
assert("vegan + low-cost meals exist", veganLowCost.length >= 1);

const glutenFreeForAvoider = publishedMeals.filter(
  (m) =>
    !m.containsTags.includes("gluten") &&
    m.dietCompatibleTags.includes("low-cost"),
);
assert(
  "meals without gluten + low-cost exist",
  glutenFreeForAvoider.length >= 1,
);

assert(
  "published exercise library size >= 30",
  publishedExercises.length >= 30,
);
assert("meal library size >= 20", publishedMeals.length >= 20);

console.log(
  `INFO exercises published=${publishedExercises.length} seated=${seatedOnly.length} pause=${activePause.length}`,
);
console.log(
  `INFO meals=${publishedMeals.length} veganLowCost=${veganLowCost.length} noGlutenLowCost=${glutenFreeForAvoider.length}`,
);
