import {
  filterClinicalConditionSlugs,
  getClinicalCondition,
} from "@/lib/clinical/conditions-catalog";
import type { MobilityProfile } from "@/lib/onboarding/progress";
import { TAG_SLUGS } from "@/lib/tags/constants";

export function deriveCapabilityTags(
  mobility: MobilityProfile,
  selectedConditions: string[],
): string[] {
  const capabilities = new Set<string>();
  const removals = new Set<string>();

  for (const slug of selectedConditions) {
    const def = getClinicalCondition(slug);
    if (!def) {
      continue;
    }
    for (const capability of def.addsCapabilities ?? []) {
      capabilities.add(capability);
    }
    for (const capability of def.removesCapabilities ?? []) {
      removals.add(capability);
    }
  }

  const forcesSeated =
    mobility === "wheelchair" ||
    mobility === "reduced" ||
    selectedConditions.includes("spinal-cord-injury-paraplegia") ||
    selectedConditions.includes(TAG_SLUGS.wheelchairUser) ||
    removals.has("standing");

  if (forcesSeated) {
    capabilities.add(TAG_SLUGS.seated);
    capabilities.add(TAG_SLUGS.unilateral);
    capabilities.delete(TAG_SLUGS.standing);
    capabilities.delete(TAG_SLUGS.lying);
    return Array.from(capabilities);
  }

  if (capabilities.size === 0) {
    return [
      TAG_SLUGS.standing,
      TAG_SLUGS.seated,
      TAG_SLUGS.lying,
      TAG_SLUGS.lowImpact,
    ];
  }

  if (!capabilities.has(TAG_SLUGS.standing) && !removals.has("standing")) {
    capabilities.add(TAG_SLUGS.standing);
  }
  capabilities.add(TAG_SLUGS.seated);
  if (!removals.has("lying")) {
    capabilities.add(TAG_SLUGS.lying);
  }
  capabilities.add(TAG_SLUGS.lowImpact);

  for (const capability of removals) {
    capabilities.delete(capability);
  }

  return Array.from(capabilities);
}

export function mergeConditionTags(
  selectedConditions: string[],
  mobility: MobilityProfile,
): string[] {
  const tags = new Set(filterClinicalConditionSlugs(selectedConditions));

  if (mobility === "wheelchair") {
    tags.add("spinal-cord-injury-paraplegia");
  }
  if (mobility === "reduced") {
    tags.add(TAG_SLUGS.reducedMobility);
  }

  return Array.from(tags);
}

export function suggestWaterGoalMl(weightKg: number | null): number {
  if (weightKg && weightKg > 0) {
    return Math.round((weightKg * 35) / 50) * 50;
  }
  return 2000;
}
