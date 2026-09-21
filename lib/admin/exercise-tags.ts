import { CLINICAL_CONDITION_SLUGS } from "@/lib/clinical/conditions-catalog";
import { MOVEMENT_CONTENT_TAGS } from "@/lib/clinical/conditions-catalog";
import { enrichExerciseContraindications } from "@/lib/clinical/exercise-safety";
import { TAG_SLUGS } from "@/lib/tags/constants";

export const EXERCISE_EQUIPMENT_SLUGS = [
  TAG_SLUGS.bodyweight,
  TAG_SLUGS.wall,
  TAG_SLUGS.chair,
  TAG_SLUGS.bottle,
  TAG_SLUGS.towel,
  TAG_SLUGS.foodBag,
  "resistance-band",
  "broomstick",
  "backpack",
  "cushion",
] as const;

export const EXERCISE_CAPABILITY_SLUGS = [
  TAG_SLUGS.standing,
  TAG_SLUGS.seated,
  TAG_SLUGS.lying,
  TAG_SLUGS.unilateral,
  TAG_SLUGS.lowImpact,
] as const;

export const EXERCISE_MUSCLE_SLUGS = [
  "legs",
  "glutes",
  "core",
  "chest",
  "back",
  "shoulders",
  "arms",
  "full-body",
] as const;

/** Intensity tags selectable in admin (core + expanded movement tags). */
export const EXERCISE_INTENSITY_SLUGS = Array.from(
  new Set<string>([
    TAG_SLUGS.activePause,
    TAG_SLUGS.lowIntensity,
    TAG_SLUGS.mediumIntensity,
    TAG_SLUGS.highIntensity,
    TAG_SLUGS.highImpact,
    TAG_SLUGS.lowerBodyPlyometrics,
    TAG_SLUGS.axialLoad,
    TAG_SLUGS.pronePosition,
    TAG_SLUGS.spin,
    TAG_SLUGS.inversion,
    ...MOVEMENT_CONTENT_TAGS,
  ]),
);

export const CYCLE_CONDITION_SLUGS = [
  TAG_SLUGS.pregnancyTrimester1,
  TAG_SLUGS.pregnancyTrimester2,
  TAG_SLUGS.pregnancyTrimester3,
  TAG_SLUGS.postpartum,
] as const;

export const EXERCISE_CONTRAINDICATION_SLUGS = Array.from(
  new Set<string>([
    ...CLINICAL_CONDITION_SLUGS,
    ...CYCLE_CONDITION_SLUGS,
    TAG_SLUGS.hernia,
  ]),
);

export const RISK_INTENSITY_SLUGS = new Set<string>([
  TAG_SLUGS.highImpact,
  TAG_SLUGS.lowerBodyPlyometrics,
]);

export interface ExerciseFormInput {
  title: string;
  description: string;
  equipmentTags: string[];
  contraindicationTags: string[];
  requiredCapabilityTags: string[];
  intensityTags: string[];
  targetMuscles: string[];
  videoUrl: string | null;
  imagePaths: string[];
}

export interface ExerciseAdminRow {
  id: string;
  title: string;
  description: string;
  equipmentTags: string[];
  contraindicationTags: string[];
  requiredCapabilityTags: string[];
  intensityTags: string[];
  targetMuscles: string[];
  videoUrl: string | null;
  imagePaths: string[];
  isPublished: boolean;
  updatedAt: string;
}

function filterAllowed(values: string[], allowed: readonly string[]): string[] {
  const set = new Set(allowed);
  return Array.from(new Set(values.filter((value) => set.has(value))));
}

export function sanitizeExerciseFormInput(input: ExerciseFormInput): {
  ok: true;
  value: ExerciseFormInput;
} | {
  ok: false;
  code: string;
} {
  const title = input.title.trim();
  const description = input.description.trim();

  if (title.length < 3 || title.length > 120) {
    return { ok: false, code: "invalid_title" };
  }
  if (description.length < 10 || description.length > 4000) {
    return { ok: false, code: "invalid_description" };
  }

  let videoUrl: string | null = null;
  if (input.videoUrl && input.videoUrl.trim()) {
    try {
      const parsed = new URL(input.videoUrl.trim());
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return { ok: false, code: "invalid_video" };
      }
      videoUrl = parsed.toString();
    } catch {
      return { ok: false, code: "invalid_video" };
    }
  }

  const intensityTags = filterAllowed(
    input.intensityTags,
    EXERCISE_INTENSITY_SLUGS,
  );
  const manualContras = filterAllowed(
    input.contraindicationTags,
    EXERCISE_CONTRAINDICATION_SLUGS,
  );
  // Educador: intensity tags auto-mark injuries/phases that prohibit the move.
  const enriched = enrichExerciseContraindications({
    intensityTags,
    contraindicationTags: manualContras,
    requiredCapabilityTags: [],
    isPublished: false,
  });
  const contraindicationTags = filterAllowed(
    enriched.contraindicationTags,
    EXERCISE_CONTRAINDICATION_SLUGS,
  );

  const value: ExerciseFormInput = {
    title,
    description,
    equipmentTags: filterAllowed(input.equipmentTags, EXERCISE_EQUIPMENT_SLUGS),
    contraindicationTags,
    requiredCapabilityTags: filterAllowed(
      input.requiredCapabilityTags,
      EXERCISE_CAPABILITY_SLUGS,
    ),
    intensityTags,
    targetMuscles: filterAllowed(input.targetMuscles, EXERCISE_MUSCLE_SLUGS),
    videoUrl,
    imagePaths: input.imagePaths.filter((path) => path.startsWith("exercises/")),
  };

  return { ok: true, value };
}

export function canPublishExercise(input: {
  requiredCapabilityTags: string[];
  intensityTags: string[];
  contraindicationTags: string[];
}): { ok: true } | { ok: false; code: string } {
  if (input.requiredCapabilityTags.length < 1) {
    return { ok: false, code: "publish_needs_capabilities" };
  }

  const hasRiskIntensity = input.intensityTags.some((tag) =>
    RISK_INTENSITY_SLUGS.has(tag),
  );
  if (hasRiskIntensity && input.contraindicationTags.length < 1) {
    return { ok: false, code: "publish_needs_contraindication" };
  }

  return { ok: true };
}
