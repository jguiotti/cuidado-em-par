import { deriveCapabilityTags, mergeConditionTags } from "../lib/onboarding/capabilities";
import {
  pathForOnboardingStep,
  resolveOnboardingStep,
} from "../lib/onboarding/progress";
import { filterClinicalConditionSlugs } from "../lib/clinical/conditions-catalog";
import { filterFoodAvoidSlugs } from "../lib/nutrition/food-conditions-catalog";
import { onboardingCopy } from "../lib/i18n/onboarding-pt-br";

const results: Array<{ name: string; ok: boolean; detail?: string }> = [];

function check(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
}

const wheelchairCaps = deriveCapabilityTags("wheelchair", []);
check(
  "wheelchair capabilities sem standing",
  !wheelchairCaps.includes("standing") && wheelchairCaps.includes("seated"),
  wheelchairCaps.join(","),
);

const reducedCaps = deriveCapabilityTags("reduced", []);
check(
  "reduced capabilities sem standing",
  !reducedCaps.includes("standing") && reducedCaps.includes("seated"),
  reducedCaps.join(","),
);

const fullCaps = deriveCapabilityTags("full", []);
check(
  "full capabilities com standing",
  fullCaps.includes("standing") && fullCaps.includes("seated"),
  fullCaps.join(","),
);

const merged = mergeConditionTags(["torn-acl"], "wheelchair");
check(
  "merge wheelchair adds paraplegia",
  merged.includes("spinal-cord-injury-paraplegia") &&
    merged.includes("torn-acl"),
  merged.join(","),
);

check(
  "food avoid filter",
  filterFoodAvoidSlugs(["gluten", "lactose", "nope"]).join(",") ===
    "gluten,lactose",
);

check(
  "hernia normalizes to disc-herniation",
  filterClinicalConditionSlugs(["hernia", "torn-acl"]).includes(
    "disc-herniation",
  ),
);

const done = resolveOnboardingStep({
  hasAcceptedTerms: true,
  hasAcceptedHealthPersonalization: true,
  displayName: "A",
  healthFocus: "maintenance",
  onboardingStage: "completed",
  onboardingCompletedAt: "2026-01-01",
});
check(
  "completed gate to /home",
  done === "completed" && pathForOnboardingStep(done) === "/home",
);

const afterFocus = resolveOnboardingStep({
  hasAcceptedTerms: true,
  hasAcceptedHealthPersonalization: true,
  displayName: "A",
  healthFocus: "maintenance",
  onboardingStage: "sex_assigned",
  onboardingCompletedAt: null,
});
check(
  "after focus goes to sex-assigned",
  afterFocus === "sex_assigned" &&
    pathForOnboardingStep(afterFocus) === "/onboarding/sex-assigned",
);

const blob = JSON.stringify(onboardingCopy);
check(
  "copy sem termos proibidos",
  !/gênero biológico|perda de peso|emagrec/i.test(blob),
);
check("copy sem emoji", !/[\u{1F300}-\u{1FAFF}]/u.test(blob));

const failed = results.filter((item) => !item.ok);
for (const item of results) {
  console.log(`${item.ok ? "PASS" : "FAIL"} ${item.name}${item.detail ? ` (${item.detail})` : ""}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
