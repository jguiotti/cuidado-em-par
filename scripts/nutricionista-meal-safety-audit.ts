/**
 * Nutricionista offline audit: every published meal must carry contains_tags
 * for allergens/restrictions present in ingredients, and list_safe_meals
 * profiles must never see blocked plates.
 */

import { MEAL_SEED_CATALOG_FULL } from "../lib/admin/meal-seed-catalog";
import { FOOD_AVOID_CONDITIONS } from "../lib/nutrition/food-conditions-catalog";
import {
  enrichMealCatalog,
  inferContainsTagsFromIngredients,
  isMealSafeForProfile,
  prohibitingAvoidsForMeal,
} from "../lib/nutrition/meal-safety";

function assert(name: string, condition: boolean) {
  console.log(`${condition ? "PASS" : "FAIL"} ${name}`);
  return condition;
}

let failed = 0;

function check(name: string, condition: boolean) {
  if (!assert(name, condition)) {
    failed += 1;
  }
}

const enriched = enrichMealCatalog(MEAL_SEED_CATALOG_FULL);
const published = enriched.filter((m) => m.isPublished);

check("food avoid catalog has gluten", FOOD_AVOID_CONDITIONS.some((c) => c.slug === "gluten"));
check("food avoid catalog has lactose", FOOD_AVOID_CONDITIONS.some((c) => c.slug === "lactose"));
check("published meal library size >= 20", published.length >= 20);

for (const meal of published) {
  const inferred = inferContainsTagsFromIngredients(meal.ingredients);
  for (const tag of inferred) {
    check(
      `${meal.slug}: inferred ${tag} is on contains_tags`,
      meal.containsTags.includes(tag),
    );
  }

  if (meal.containsTags.includes("meat") || meal.containsTags.includes("fish")) {
    check(
      `${meal.slug}: meat/fish not marked vegan`,
      !meal.dietCompatibleTags.includes("vegan"),
    );
    check(
      `${meal.slug}: meat/fish not marked vegetarian`,
      !meal.dietCompatibleTags.includes("vegetarian"),
    );
  }

  if (
    meal.containsTags.includes("egg") ||
    meal.containsTags.includes("lactose")
  ) {
    check(
      `${meal.slug}: egg/lactose not marked vegan`,
      !meal.dietCompatibleTags.includes("vegan"),
    );
  }
}

for (const condition of FOOD_AVOID_CONDITIONS) {
  const unsafe = published.filter((meal) =>
    isMealSafeForProfile(meal, {
      dietPattern: "no-restriction",
      avoidsTags: [condition.slug],
    }),
  );
  const leaked = unsafe.filter((meal) =>
    meal.containsTags.includes(condition.slug),
  );
  check(
    `${condition.slug}: no published meal with that contains tag passes`,
    leaked.length === 0,
  );

  const safeCount = unsafe.length;
  check(
    `${condition.slug}: still has some safe meals`,
    safeCount >= 1,
  );
}

const veganSafe = published.filter((m) =>
  isMealSafeForProfile(m, { dietPattern: "vegan", avoidsTags: [] }),
);
check("vegan profile has meals", veganSafe.length >= 1);
check(
  "vegan profile never sees meat/fish/egg/lactose",
  veganSafe.every(
    (m) =>
      !m.containsTags.some((t) =>
        ["meat", "fish", "egg", "lactose"].includes(t),
      ),
  ),
);

const glutenSafe = published.filter((m) =>
  isMealSafeForProfile(m, {
    dietPattern: "no-restriction",
    avoidsTags: ["gluten"],
  }),
);
check(
  "gluten-avoid never sees gluten contains",
  glutenSafe.every((m) => !m.containsTags.includes("gluten")),
);

console.log("");
console.log(`INFO published=${published.length}`);
console.log(`INFO vegan safe=${veganSafe.length} gluten-avoid safe=${glutenSafe.length}`);

for (const meal of published.slice(0, 5)) {
  console.log(
    `INFO sample ${meal.slug}: contains=[${prohibitingAvoidsForMeal(meal).join(",")}]`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}

console.log("\nAll Nutricionista meal safety checks passed.");
