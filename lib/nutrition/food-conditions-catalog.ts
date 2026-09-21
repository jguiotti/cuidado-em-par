/**
 * Food restriction catalog for nutrition onboarding (search + multi-select).
 * Owned clinically by Nutricionista. Slugs are English; labels are pt-BR.
 * Maps to user_nutrition_profiles.avoids_tags (kind: contains).
 */

export interface FoodConditionDef {
  slug: string;
  labelPtBr: string;
  /** Short group hint shown under the label */
  groupLabelPtBr: string;
  searchKeywords?: string[];
}

export const FOOD_AVOID_CONDITIONS: FoodConditionDef[] = [
  {
    slug: "gluten",
    labelPtBr: "Glúten",
    groupLabelPtBr: "Intolerância ou doença celíaca",
    searchKeywords: [
      "glúten",
      "gluten",
      "celíaco",
      "celiaco",
      "celíaca",
      "trigo",
      "intolerância",
    ],
  },
  {
    slug: "lactose",
    labelPtBr: "Lactose",
    groupLabelPtBr: "Intolerância",
    searchKeywords: [
      "leite",
      "lácteo",
      "lacteo",
      "intolerância",
      "intolerancia",
    ],
  },
  {
    slug: "egg",
    labelPtBr: "Ovo",
    groupLabelPtBr: "Alergia ou restrição",
    searchKeywords: ["ovo", "ovos", "albumina", "alergia"],
  },
  {
    slug: "peanut",
    labelPtBr: "Amendoim",
    groupLabelPtBr: "Alergia",
    searchKeywords: ["amendoim", "amendoins", "oleaginosa", "alergia"],
  },
  {
    slug: "soy",
    labelPtBr: "Soja",
    groupLabelPtBr: "Alergia ou restrição",
    searchKeywords: ["soja", "soya", "alergia"],
  },
  {
    slug: "meat",
    labelPtBr: "Carne",
    groupLabelPtBr: "Restrição",
    searchKeywords: ["carne", "carnes", "vermelho", "frango", "aves"],
  },
  {
    slug: "fish",
    labelPtBr: "Peixe e frutos do mar",
    groupLabelPtBr: "Alergia ou restrição",
    searchKeywords: [
      "peixe",
      "frutos do mar",
      "camarão",
      "camarao",
      "marisco",
      "alergia",
    ],
  },
];

export const FOOD_AVOID_SLUGS = FOOD_AVOID_CONDITIONS.map(
  (item) => item.slug,
);

export function getFoodAvoidCondition(
  slug: string,
): FoodConditionDef | undefined {
  return FOOD_AVOID_CONDITIONS.find((item) => item.slug === slug);
}

export function filterFoodAvoidSlugs(slugs: string[]): string[] {
  const allowed = new Set(FOOD_AVOID_SLUGS);
  return Array.from(new Set(slugs.filter((slug) => allowed.has(slug))));
}

export function searchFoodAvoidConditions(
  query: string,
): FoodConditionDef[] {
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  if (!normalized) {
    return FOOD_AVOID_CONDITIONS;
  }
  const slugQuery = normalized.replace(/\s+/g, "-");
  return FOOD_AVOID_CONDITIONS.filter((item) => {
    if (item.labelPtBr.toLocaleLowerCase("pt-BR").includes(normalized)) {
      return true;
    }
    if (item.groupLabelPtBr.toLocaleLowerCase("pt-BR").includes(normalized)) {
      return true;
    }
    if (item.slug.includes(slugQuery)) {
      return true;
    }
    return (item.searchKeywords ?? []).some((keyword) => {
      const token = keyword.toLocaleLowerCase("pt-BR");
      return token.includes(normalized) || normalized.includes(token);
    });
  });
}
