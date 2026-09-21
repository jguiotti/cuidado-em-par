/**
 * Educador Físico offline audit: every published exercise must list
 * conditions that prohibit it (derived from intensity × catalog.blocks),
 * and key clinical profiles must never see high-risk movements.
 */

import { EXERCISE_SEED_CATALOG_FULL } from "../lib/admin/exercise-seed-catalog";
import { CLINICAL_CONDITIONS } from "../lib/clinical/conditions-catalog";
import {
  clinicalBlockRules,
  enrichExerciseCatalog,
  isExerciseSafeForProfile,
  prohibitingConditionsForExercise,
} from "../lib/clinical/exercise-safety";

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

const enriched = enrichExerciseCatalog(EXERCISE_SEED_CATALOG_FULL);
const published = enriched.filter((e) => e.isPublished);
const rules = clinicalBlockRules();

check("tag_block_rules cover torn-acl high-impact", 
  rules.some((r) => r.conditionSlug === "torn-acl" && r.blockedContentTag === "high-impact"));
check("tag_block_rules cover torn-acl plyometrics",
  rules.some((r) => r.conditionSlug === "torn-acl" && r.blockedContentTag === "lower-body-plyometrics"));
check("tag_block_rules cover chondromalacia high-impact",
  rules.some((r) => r.conditionSlug === "chondromalacia" && r.blockedContentTag === "high-impact"));
check("tag_block_rules cover pregnancy-t3 prone-position",
  rules.some((r) => r.conditionSlug === "pregnancy-trimester-3" && r.blockedContentTag === "prone-position"));

const fullCaps = ["standing", "seated", "lying", "unilateral", "low-impact"];

for (const condition of CLINICAL_CONDITIONS) {
  const unsafe = published.filter((exercise) =>
    isExerciseSafeForProfile(exercise, {
      conditionTags: [condition.slug],
      capabilityTags: fullCaps,
    }),
  );
  const withBlockedIntensity = unsafe.filter((exercise) =>
    exercise.intensityTags.some((tag) => condition.blocks.includes(tag)),
  );
  check(
    `${condition.slug}: no published exercise with blocked intensity passes`,
    withBlockedIntensity.length === 0,
  );
}

const highImpact = published.filter((e) => e.intensityTags.includes("high-impact"));
for (const exercise of highImpact) {
  check(
    `${exercise.slug}: high-impact lists torn-acl contraindication`,
    exercise.contraindicationTags.includes("torn-acl"),
  );
}

const plyo = published.filter((e) =>
  e.intensityTags.includes("lower-body-plyometrics"),
);
for (const exercise of plyo) {
  check(
    `${exercise.slug}: plyometrics lists torn-acl contraindication`,
    exercise.contraindicationTags.includes("torn-acl"),
  );
}

const tornAclSafe = published.filter((e) =>
  isExerciseSafeForProfile(e, {
    conditionTags: ["torn-acl"],
    capabilityTags: fullCaps,
  }),
);
check("torn-acl profile still has some safe exercises", tornAclSafe.length >= 1);
check(
  "torn-acl safe set has no high-impact",
  tornAclSafe.every((e) => !e.intensityTags.includes("high-impact")),
);
check(
  "torn-acl safe set has no plyometrics",
  tornAclSafe.every((e) => !e.intensityTags.includes("lower-body-plyometrics")),
);

const pregnancySafe = published.filter((e) =>
  isExerciseSafeForProfile(e, {
    conditionTags: [],
    capabilityTags: fullCaps,
    phaseTags: ["pregnancy-trimester-3"],
  }),
);
check(
  "pregnancy-t3 safe set has no prone-position",
  pregnancySafe.every((e) => !e.intensityTags.includes("prone-position")),
);
check(
  "pregnancy-t3 safe set has no high-impact",
  pregnancySafe.every((e) => !e.intensityTags.includes("high-impact")),
);

// Coverage summary for Educador review
console.log("");
console.log(`INFO published=${published.length} block_rules=${rules.length}`);
console.log(`INFO torn-acl safe=${tornAclSafe.length} pregnancy-t3 safe=${pregnancySafe.length}`);

const sample = published.slice(0, 5);
for (const exercise of sample) {
  const prohibitions = prohibitingConditionsForExercise(exercise);
  console.log(
    `INFO sample ${exercise.slug}: intensity=[${exercise.intensityTags.join(",")}] prohibits=${prohibitions.length}`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}

console.log("\nAll Educador exercise safety checks passed.");
