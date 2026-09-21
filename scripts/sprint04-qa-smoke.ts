import {
  canPublishMeal,
  sanitizeMealFormInput,
} from "../lib/admin/meal-tags";

const cases = [
  [
    "block publish without diet tags",
    canPublishMeal({
      mealSlot: "lunch",
      dietCompatibleTags: [],
      ingredients: [{ item: "arroz", qty: "1 xícara" }],
    }),
    false,
    "publish_needs_diet_tags",
  ],
  [
    "block publish without low-cost",
    canPublishMeal({
      mealSlot: "lunch",
      dietCompatibleTags: ["vegan"],
      ingredients: [{ item: "arroz", qty: "1 xícara" }],
    }),
    false,
    "publish_needs_low_cost",
  ],
  [
    "allow vegan + low-cost lunch",
    canPublishMeal({
      mealSlot: "lunch",
      dietCompatibleTags: ["vegan", "low-cost"],
      ingredients: [{ item: "arroz", qty: "1 xícara" }],
    }),
    true,
    undefined,
  ],
] as const;

for (const [name, result, expectOk, expectCode] of cases) {
  const ok =
    result.ok === expectOk &&
    (expectOk || (!result.ok && result.code === expectCode));
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
}

const badTitle = sanitizeMealFormInput({
  title: "Ab",
  description: "Descrição longa o bastante para passar",
  mealSlot: "breakfast",
  containsTags: [],
  dietCompatibleTags: ["low-cost"],
  phaseTags: [],
  ingredients: [{ item: "banana", qty: "1" }],
  imagePaths: [],
});
console.log(
  `${!badTitle.ok && badTitle.code === "invalid_title" ? "PASS" : "FAIL"} invalid title`,
);

const badSlot = sanitizeMealFormInput({
  title: "Prato válido",
  description: "Descrição longa o bastante para passar",
  mealSlot: "brunch",
  containsTags: [],
  dietCompatibleTags: ["low-cost"],
  phaseTags: [],
  ingredients: [{ item: "banana", qty: "1" }],
  imagePaths: [],
});
console.log(
  `${!badSlot.ok && badSlot.code === "invalid_meal_slot" ? "PASS" : "FAIL"} invalid meal slot`,
);

const glutenHonest = sanitizeMealFormInput({
  title: "Mingau de aveia",
  description: "Descrição longa o bastante para passar",
  mealSlot: "breakfast",
  containsTags: ["gluten", "unknown-allergen"],
  dietCompatibleTags: ["vegetarian", "low-cost"],
  phaseTags: ["menstrual-phase"],
  ingredients: [{ item: "aveia", qty: "4 colheres" }],
  imagePaths: ["meals/x/a.png", "exercises/nope.png"],
});
console.log(
  `${
    glutenHonest.ok &&
    glutenHonest.value.containsTags.length === 1 &&
    glutenHonest.value.containsTags[0] === "gluten" &&
    glutenHonest.value.phaseTags.length === 0 &&
    glutenHonest.value.imagePaths.length === 1
      ? "PASS"
      : "FAIL"
  } sanitize filters tags and paths`,
);
