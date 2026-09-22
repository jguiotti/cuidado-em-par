/**
 * Educador Físico — safety helpers for exercises.
 * Derives contraindication tags from intensity tags × CLINICAL_CONDITIONS.blocks
 * (+ cycle phase rules) and mirrors list_safe_exercises for offline audit.
 */

import {
  CLINICAL_CONDITIONS,
  normalizeClinicalConditionSlug,
  type ClinicalConditionDef,
} from "@/lib/clinical/conditions-catalog";
import { isExerciseCompatibleWithEquipment } from "@/lib/onboarding/equipment";

/** Minimal exercise shape used by enrichment and offline safety checks. */
export interface ExerciseSafetyShape {
  slug?: string;
  title?: string;
  intensityTags: string[];
  contraindicationTags: string[];
  requiredCapabilityTags: string[];
  equipmentTags?: string[];
  isPublished: boolean;
}

export interface ProfileSafetyInput {
  conditionTags: string[];
  capabilityTags: string[];
  phaseTags?: string[];
  availableEquipmentTags?: string[];
}

export interface BlockRule {
  conditionSlug: string;
  blockedContentTag: string;
}

/**
 * Gestation / postpartum phase blocks (phase_tags on user_cycle_profiles).
 * Kept outside CLINICAL_CONDITIONS because they are cycle phases, not injuries.
 */
export const CYCLE_PHASE_BLOCK_RULES: BlockRule[] = [
  { conditionSlug: "pregnancy-trimester-2", blockedContentTag: "prone-position" },
  { conditionSlug: "pregnancy-trimester-2", blockedContentTag: "high-impact" },
  {
    conditionSlug: "pregnancy-trimester-2",
    blockedContentTag: "lower-body-plyometrics",
  },
  { conditionSlug: "pregnancy-trimester-3", blockedContentTag: "prone-position" },
  { conditionSlug: "pregnancy-trimester-3", blockedContentTag: "high-impact" },
  {
    conditionSlug: "pregnancy-trimester-3",
    blockedContentTag: "lower-body-plyometrics",
  },
  { conditionSlug: "pregnancy-trimester-3", blockedContentTag: "high-intensity" },
  { conditionSlug: "pregnancy-trimester-3", blockedContentTag: "inversion" },
];

/** All (condition/phase → blocked intensity) pairs for tag_block_rules. */
export function clinicalBlockRules(): BlockRule[] {
  const rules: BlockRule[] = [];
  for (const condition of CLINICAL_CONDITIONS) {
    for (const blocked of condition.blocks) {
      rules.push({
        conditionSlug: condition.slug,
        blockedContentTag: blocked,
      });
    }
  }
  // Legacy alias kept in DB for older profiles.
  const hernia = CLINICAL_CONDITIONS.find((c) => c.slug === "disc-herniation");
  if (hernia) {
    for (const blocked of hernia.blocks) {
      rules.push({
        conditionSlug: "hernia",
        blockedContentTag: blocked,
      });
    }
  }
  rules.push(...CYCLE_PHASE_BLOCK_RULES);
  return rules;
}

export function conditionsBlockingIntensityTag(
  intensityTag: string,
): ClinicalConditionDef[] {
  return CLINICAL_CONDITIONS.filter((condition) =>
    condition.blocks.includes(intensityTag),
  );
}

function intensityBlockedByRules(
  intensityTag: string,
  profileTags: Set<string>,
): boolean {
  for (const rule of clinicalBlockRules()) {
    if (rule.blockedContentTag !== intensityTag) {
      continue;
    }
    if (profileTags.has(rule.conditionSlug)) {
      return true;
    }
    // Normalized profile may store disc-herniation while rule is hernia (or reverse).
    if (
      rule.conditionSlug === "hernia" &&
      profileTags.has("disc-herniation")
    ) {
      return true;
    }
    if (
      rule.conditionSlug === "disc-herniation" &&
      profileTags.has("hernia")
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Marks every clinical/phase condition that should forbid this exercise,
 * based on its intensity/movement tags (+ keeps manual contraindications).
 */
export function enrichExerciseContraindications<T extends ExerciseSafetyShape>(
  exercise: T,
): T {
  const next = new Set(exercise.contraindicationTags);

  for (const intensity of exercise.intensityTags) {
    for (const condition of conditionsBlockingIntensityTag(intensity)) {
      next.add(condition.slug);
    }
    for (const rule of CYCLE_PHASE_BLOCK_RULES) {
      if (rule.blockedContentTag === intensity) {
        next.add(rule.conditionSlug);
      }
    }
  }

  // Keep legacy hernia slug if disc-herniation is present (older content filters).
  if (next.has("disc-herniation")) {
    next.add("hernia");
  }

  return {
    ...exercise,
    contraindicationTags: Array.from(next).sort(),
  };
}

export function enrichExerciseCatalog<T extends ExerciseSafetyShape>(
  exercises: readonly T[],
): T[] {
  return exercises.map(enrichExerciseContraindications);
}

/** Deterministic mirror of public.list_safe_exercises (offline). */
export function isExerciseSafeForProfile(
  exercise: ExerciseSafetyShape,
  profile: ProfileSafetyInput,
): boolean {
  if (!exercise.isPublished) {
    return false;
  }

  const profileTags = new Set<string>();
  for (const tag of [
    ...profile.conditionTags,
    ...(profile.phaseTags ?? []),
  ]) {
    profileTags.add(tag);
    profileTags.add(normalizeClinicalConditionSlug(tag));
    if (tag === "disc-herniation" || tag === "hernia") {
      profileTags.add("hernia");
      profileTags.add("disc-herniation");
    }
  }

  for (const contra of exercise.contraindicationTags) {
    if (
      profileTags.has(contra) ||
      profileTags.has(normalizeClinicalConditionSlug(contra))
    ) {
      return false;
    }
  }

  for (const required of exercise.requiredCapabilityTags) {
    if (!profile.capabilityTags.includes(required)) {
      return false;
    }
  }

  for (const intensity of exercise.intensityTags) {
    if (intensityBlockedByRules(intensity, profileTags)) {
      return false;
    }
  }

  if (
    !isExerciseCompatibleWithEquipment(
      exercise.equipmentTags ?? [],
      profile.availableEquipmentTags,
    )
  ) {
    return false;
  }

  return true;
}

/** Injuries/phases that prohibit a given exercise after enrichment. */
export function prohibitingConditionsForExercise(
  exercise: ExerciseSafetyShape,
): string[] {
  return enrichExerciseContraindications(exercise).contraindicationTags;
}
