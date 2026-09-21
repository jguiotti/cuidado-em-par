import {
  canPublishExercise,
  sanitizeExerciseFormInput,
} from "../lib/admin/exercise-tags";

const cases = [
  [
    "block publish without capabilities",
    canPublishExercise({
      requiredCapabilityTags: [],
      intensityTags: ["low-intensity"],
      contraindicationTags: [],
    }),
    false,
    "publish_needs_capabilities",
  ],
  [
    "block high-impact without contraindication",
    canPublishExercise({
      requiredCapabilityTags: ["seated"],
      intensityTags: ["high-impact"],
      contraindicationTags: [],
    }),
    false,
    "publish_needs_contraindication",
  ],
  [
    "allow seated + high-impact with contraindication",
    canPublishExercise({
      requiredCapabilityTags: ["seated"],
      intensityTags: ["high-impact"],
      contraindicationTags: ["torn-acl"],
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

const shortTitle = sanitizeExerciseFormInput({
  title: "Ab",
  description: "Descrição longa o bastante",
  equipmentTags: ["bodyweight"],
  contraindicationTags: [],
  requiredCapabilityTags: ["seated"],
  intensityTags: ["low-intensity"],
  targetMuscles: [],
  videoUrl: null,
  imagePaths: [],
  estimatedDurationMinutes: 5,
});
console.log(
  `${!shortTitle.ok && shortTitle.code === "invalid_title" ? "PASS" : "FAIL"} invalid title`,
);
