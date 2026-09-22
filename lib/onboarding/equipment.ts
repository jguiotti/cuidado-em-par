import { EXERCISE_EQUIPMENT_SLUGS } from "@/lib/admin/exercise-tags";
import { TAG_SLUGS } from "@/lib/tags/constants";

/** Always available — not shown as a selectable item. */
export const ALWAYS_AVAILABLE_EQUIPMENT_SLUG = TAG_SLUGS.bodyweight;

/**
 * Specialty gear: if an exercise lists it and the person does not own it,
 * hide the exercise even when bodyweight is also listed as an alternative.
 * Prevents band moves from appearing without the band.
 */
export const SPECIALTY_EQUIPMENT_SLUGS = [
  "resistance-band",
  "dumbbells",
] as const;

export interface HomeEquipmentOption {
  slug: string;
  labelPtBr: string;
  /** Extra search terms (pt-BR), lowercased. */
  aliases: string[];
}

/**
 * Selectable equipment from the exercise library (excl. bodyweight).
 * Labels match admin/i18n catalog used in exercise registration.
 */
export const HOME_EQUIPMENT_OPTIONS: readonly HomeEquipmentOption[] = [
  {
    slug: TAG_SLUGS.wall,
    labelPtBr: "Parede",
    aliases: ["parede", "apoio na parede"],
  },
  {
    slug: TAG_SLUGS.chair,
    labelPtBr: "Cadeira",
    aliases: ["cadeira", "banco", "assento"],
  },
  {
    slug: TAG_SLUGS.bottle,
    labelPtBr: "Garrafa",
    aliases: ["garrafa", "garrafas", "peso improvisado"],
  },
  {
    slug: TAG_SLUGS.towel,
    labelPtBr: "Toalha",
    aliases: ["toalha", "pano"],
  },
  {
    slug: TAG_SLUGS.foodBag,
    labelPtBr: "Saco de alimento",
    aliases: ["saco", "saco de alimento", "pacote", "arroz", "feijao"],
  },
  {
    slug: "resistance-band",
    labelPtBr: "Elástico",
    aliases: ["elastico", "elástico", "faixa", "band"],
  },
  {
    slug: "dumbbells",
    labelPtBr: "Halteres",
    aliases: ["halter", "halteres", "alteres", "peso", "dumbbell"],
  },
  {
    slug: "broomstick",
    labelPtBr: "Cabo de vassoura",
    aliases: ["vassoura", "cabo", "bastao", "bastão"],
  },
  {
    slug: "backpack",
    labelPtBr: "Mochila",
    aliases: ["mochila", "bolsa"],
  },
  {
    slug: "cushion",
    labelPtBr: "Almofada",
    aliases: ["almofada", "travesseiro", "apoio"],
  },
] as const;

const SELECTABLE_SLUGS = new Set(
  HOME_EQUIPMENT_OPTIONS.map((option) => option.slug),
);

const BY_SLUG = new Map(
  HOME_EQUIPMENT_OPTIONS.map((option) => [option.slug, option]),
);

const SPECIALTY_SET = new Set<string>(SPECIALTY_EQUIPMENT_SLUGS);

function normalizeSearch(value: string): string {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

export function getHomeEquipmentOption(
  slug: string,
): HomeEquipmentOption | undefined {
  return BY_SLUG.get(slug);
}

export function isSelectableHomeEquipmentSlug(slug: string): boolean {
  return SELECTABLE_SLUGS.has(slug);
}

export function filterSelectableHomeEquipmentSlugs(
  slugs: readonly string[],
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const slug of slugs) {
    if (!isSelectableHomeEquipmentSlug(slug) || seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    result.push(slug);
  }
  return result;
}

export function searchHomeEquipment(query: string): HomeEquipmentOption[] {
  const needle = normalizeSearch(query);
  if (!needle) {
    return [...HOME_EQUIPMENT_OPTIONS];
  }
  return HOME_EQUIPMENT_OPTIONS.filter((option) => {
    if (normalizeSearch(option.labelPtBr).includes(needle)) {
      return true;
    }
    if (normalizeSearch(option.slug).includes(needle)) {
      return true;
    }
    return option.aliases.some((alias) =>
      normalizeSearch(alias).includes(needle),
    );
  });
}

/** bodyweight + selected catalog items used by list_safe_exercises. */
export function buildAvailableEquipmentTags(
  selected: readonly string[],
): string[] {
  return [
    ALWAYS_AVAILABLE_EQUIPMENT_SLUG,
    ...filterSelectableHomeEquipmentSlugs(selected),
  ];
}

/** Selected items stored on the profile, excluding bodyweight. */
export function selectedFromAvailableEquipmentTags(
  available: readonly string[] | null | undefined,
): string[] {
  if (!available?.length) {
    return [];
  }
  return filterSelectableHomeEquipmentSlugs(available);
}

/**
 * Offline / app-side mirror of equipment rules in list_safe_exercises.
 * - Specialty gear (band, dumbbells): must be owned if present on the exercise.
 * - Otherwise at least one equipment tag must be in the available set (OR).
 */
export function isExerciseCompatibleWithEquipment(
  equipmentTags: readonly string[],
  availableEquipmentTags: readonly string[] | null | undefined,
): boolean {
  if (!equipmentTags.length) {
    return true;
  }

  const available = new Set(
    availableEquipmentTags?.length
      ? availableEquipmentTags
      : [ALWAYS_AVAILABLE_EQUIPMENT_SLUG],
  );
  if (!available.has(ALWAYS_AVAILABLE_EQUIPMENT_SLUG)) {
    available.add(ALWAYS_AVAILABLE_EQUIPMENT_SLUG);
  }

  for (const tag of equipmentTags) {
    if (SPECIALTY_SET.has(tag) && !available.has(tag)) {
      return false;
    }
  }

  return equipmentTags.some((tag) => available.has(tag));
}

/** Sanity: every selectable option exists in exercise equipment slugs. */
export function assertEquipmentCatalogAligned(): boolean {
  const exerciseSet = new Set<string>(EXERCISE_EQUIPMENT_SLUGS);
  return HOME_EQUIPMENT_OPTIONS.every((option) => exerciseSet.has(option.slug));
}
