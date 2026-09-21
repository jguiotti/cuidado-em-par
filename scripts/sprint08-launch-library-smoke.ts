/**
 * Launch-library coverage checks against seed catalogs (offline).
 * Mirrors list_safe_* rules at a simplified level for MVP gate.
 */

import { EXERCISE_SEED_CATALOG_FULL } from "../lib/admin/exercise-seed-catalog";
import { MEAL_SEED_CATALOG_FULL } from "../lib/admin/meal-seed-catalog";
import { memberLimitForKind } from "../lib/care/circle";
import {
  enrichExerciseCatalog,
  isExerciseSafeForProfile,
} from "../lib/clinical/exercise-safety";
import {
  enrichMealCatalog,
  isMealSafeForProfile,
} from "../lib/nutrition/meal-safety";

function assert(name: string, condition: boolean) {
  console.log(`${condition ? "PASS" : "FAIL"} ${name}`);
}

const publishedExercises = enrichExerciseCatalog(EXERCISE_SEED_CATALOG_FULL).filter(
  (e) => e.isPublished,
);
const publishedMeals = enrichMealCatalog(MEAL_SEED_CATALOG_FULL).filter(
  (m) => m.isPublished,
);

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

const fullCaps = ["standing", "seated", "lying", "unilateral", "low-impact"];
const tornAclSafe = publishedExercises.filter((e) =>
  isExerciseSafeForProfile(e, {
    conditionTags: ["torn-acl"],
    capabilityTags: fullCaps,
  }),
);
assert("torn-acl-safe candidates exist", tornAclSafe.length >= 1);
assert(
  "torn-acl never sees high-impact",
  tornAclSafe.every((e) => !e.intensityTags.includes("high-impact")),
);

const veganSafe = publishedMeals.filter((m) =>
  isMealSafeForProfile(m, { dietPattern: "vegan", avoidsTags: [] }),
);
assert("vegan-safe candidates exist", veganSafe.length >= 1);
assert(
  "vegan never sees meat/fish/egg/lactose",
  veganSafe.every(
    (m) =>
      !m.containsTags.some((t) =>
        ["meat", "fish", "egg", "lactose"].includes(t),
      ),
  ),
);

const veganLowCost = veganSafe.filter((m) =>
  m.dietCompatibleTags.includes("low-cost"),
);
assert("vegan + low-cost meals exist", veganLowCost.length >= 1);

const glutenAvoidSafe = publishedMeals.filter((m) =>
  isMealSafeForProfile(m, {
    dietPattern: "no-restriction",
    avoidsTags: ["gluten"],
  }),
);
assert(
  "gluten-avoid never sees gluten contains",
  glutenAvoidSafe.every((m) => !m.containsTags.includes("gluten")),
);
assert(
  "meals without gluten + low-cost exist",
  glutenAvoidSafe.some((m) => m.dietCompatibleTags.includes("low-cost")),
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
  `INFO meals=${publishedMeals.length} veganSafe=${veganSafe.length} glutenAvoidSafe=${glutenAvoidSafe.length}`,
);
