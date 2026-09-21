/**
 * Clinical condition catalog for onboarding and the tag engine.
 * Owned clinically by Educador Físico. Slugs are English; labels are pt-BR.
 * In doubt, block. Capability hints refine mobility after the mobility step.
 */

export const CLINICAL_GROUP_IDS = [
  "pcd-neuromotor",
  "knee",
  "hip-pelvis",
  "ankle-foot",
  "shoulder",
  "elbow-wrist-hand",
  "spine-core",
  "systemic",
] as const;

export type ClinicalGroupId = (typeof CLINICAL_GROUP_IDS)[number];

export const CLINICAL_GROUP_LABELS_PT_BR: Record<ClinicalGroupId, string> = {
  "pcd-neuromotor": "PCD e condições neuromotoras",
  knee: "Joelho",
  "hip-pelvis": "Quadril e pelve",
  "ankle-foot": "Tornozelo e pé",
  shoulder: "Ombro",
  "elbow-wrist-hand": "Cotovelo, punho e mão",
  "spine-core": "Coluna e tronco",
  systemic: "Condições sistêmicas e musculares",
};

export interface ClinicalConditionDef {
  slug: string;
  labelPtBr: string;
  group: ClinicalGroupId;
  /** Content/intensity tags this condition must block via tag_block_rules */
  blocks: string[];
  /** Extra capability tags suggested when this condition is selected */
  addsCapabilities?: string[];
  /** Removes these capabilities even if mobility said "full" */
  removesCapabilities?: string[];
  /** Extra search tokens (abbreviations, synonyms) in pt-BR or English */
  searchKeywords?: string[];
}

/** Intensity / movement tags used by the engine (English kebab-case). */
export const MOVEMENT_CONTENT_TAGS = [
  "use-legs",
  "standing-required",
  "seated-only",
  "lower-body-plyometrics",
  "high-impact",
  "high-speed",
  "bilateral-push-up",
  "double-hand-support",
  "floor-push",
  "spatial-travel",
  "distance-jump",
  "long-lever",
  "lumbar-impact",
  "deep-knee-flexion",
  "knee-lateral-force",
  "tibial-posterior-load",
  "rotational-instability",
  "unilateral-full-load",
  "side-lying-pressure",
  "deep-hip-flexion",
  "explosive-adductors",
  "unstable-base",
  "forefoot-impact",
  "overhead-press",
  "lateral-raise-above-90",
  "hanging-traction",
  "wide-arm-tension",
  "cross-body-load",
  "prolonged-grip",
  "wrist-extension-load",
  "elbow-valgus-load",
  "forearm-plank-hard",
  "spine-flexion-rotation",
  "spine-hyperextension",
  "high-intra-abdominal-pressure",
  "max-range-stretch",
  "axial-load",
  "inversion",
  "spin",
  "high-intensity",
] as const;

export const CLINICAL_CONDITIONS: ClinicalConditionDef[] = [
  // --- PCD / neuromotor ---
  {
    slug: "spinal-cord-injury-paraplegia",
    labelPtBr: "Lesão medular / uso de cadeira de rodas (paraplegia)",
    group: "pcd-neuromotor",
    blocks: ["use-legs", "standing-required", "lower-body-plyometrics", "high-impact"],
    addsCapabilities: ["seated", "unilateral"],
    removesCapabilities: ["standing", "lying"],
    searchKeywords: ["paraplegia", "cadeira de rodas", "medular", "pcd"],
  },
  {
    slug: "lower-limb-amputation-unilateral",
    labelPtBr: "Amputação de membro inferior (unilateral)",
    group: "pcd-neuromotor",
    blocks: ["lower-body-plyometrics", "high-impact", "distance-jump"],
    addsCapabilities: ["unilateral", "standing", "seated", "lying"],
    searchKeywords: ["amputação", "perna", "pcd"],
  },
  {
    slug: "upper-limb-amputation-unilateral",
    labelPtBr: "Amputação de membro superior (unilateral)",
    group: "pcd-neuromotor",
    blocks: ["double-hand-support", "floor-push", "bilateral-push-up"],
    addsCapabilities: ["unilateral", "standing", "seated", "lying"],
    searchKeywords: ["amputação", "braço", "pcd"],
  },
  {
    slug: "hemiplegia-hemiparesis",
    labelPtBr: "Hemiplegia ou hemiparesia (sequela de AVC)",
    group: "pcd-neuromotor",
    blocks: ["high-speed", "lower-body-plyometrics", "high-impact", "spatial-travel"],
    addsCapabilities: ["unilateral", "standing", "seated", "lying", "low-impact"],
    searchKeywords: ["avc", "derrame", "hemiparesia", "hemiplegia"],
  },
  {
    slug: "cerebral-palsy-mild-moderate",
    labelPtBr: "Paralisia cerebral (espasticidade leve a moderada)",
    group: "pcd-neuromotor",
    blocks: ["high-speed", "lower-body-plyometrics", "high-impact"],
    addsCapabilities: ["standing", "seated", "lying", "low-impact"],
    searchKeywords: ["pc", "espasticidade"],
  },
  {
    slug: "achondroplasia",
    labelPtBr: "Nanismo (acondroplasia)",
    group: "pcd-neuromotor",
    blocks: ["lumbar-impact", "long-lever", "high-impact"],
    addsCapabilities: ["standing", "seated", "lying", "low-impact"],
    searchKeywords: ["nanismo", "acondroplasia"],
  },
  {
    slug: "visual-impairment",
    labelPtBr: "Deficiência visual (cegueira ou baixa visão)",
    group: "pcd-neuromotor",
    blocks: ["spatial-travel", "distance-jump", "high-speed"],
    addsCapabilities: ["standing", "seated", "lying", "low-impact"],
    searchKeywords: ["cegueira", "baixa visão", "visual", "pcd"],
  },

  // --- Knee ---
  {
    slug: "torn-acl",
    labelPtBr: "Ruptura do ligamento cruzado anterior (LCA)",
    group: "knee",
    blocks: [
      "high-impact",
      "lower-body-plyometrics",
      "rotational-instability",
      "spatial-travel",
    ],
    searchKeywords: ["lca", "cruzado anterior", "joelho"],
  },
  {
    slug: "torn-pcl",
    labelPtBr: "Ruptura do ligamento cruzado posterior (LCP)",
    group: "knee",
    blocks: ["tibial-posterior-load", "deep-knee-flexion", "high-impact"],
    searchKeywords: ["lcp", "cruzado posterior", "joelho"],
  },
  {
    slug: "collateral-ligament-injury",
    labelPtBr: "Lesão dos ligamentos colaterais (LCM/LCL)",
    group: "knee",
    blocks: ["knee-lateral-force", "spatial-travel", "lower-body-plyometrics"],
    searchKeywords: ["lcm", "lcl", "colateral", "joelho"],
  },
  {
    slug: "chondromalacia",
    labelPtBr: "Condromalácia patelar / síndrome femoropatelar",
    group: "knee",
    blocks: [
      "deep-knee-flexion",
      "lower-body-plyometrics",
      "high-impact",
    ],
    searchKeywords: ["patela", "femoropatelar", "joelho"],
  },
  {
    slug: "patellar-tendinopathy",
    labelPtBr: "Tendinopatia patelar (joelho de saltador)",
    group: "knee",
    blocks: ["lower-body-plyometrics", "high-impact", "high-speed"],
    searchKeywords: ["tendinite", "patelar", "saltador", "joelho"],
  },
  {
    slug: "knee-osteoarthritis",
    labelPtBr: "Osteoartrite / artrose de joelho",
    group: "knee",
    blocks: ["high-impact", "lower-body-plyometrics", "unilateral-full-load"],
    searchKeywords: ["artrose", "osteoartrite", "joelho"],
  },

  // --- Hip / pelvis ---
  {
    slug: "trochanteric-bursitis",
    labelPtBr: "Bursite trocantérica",
    group: "hip-pelvis",
    blocks: ["side-lying-pressure"],
    searchKeywords: ["bursite", "quadril", "trocânter"],
  },
  {
    slug: "piriformis-syndrome",
    labelPtBr: "Síndrome do piriforme",
    group: "hip-pelvis",
    blocks: ["deep-hip-flexion"],
    searchKeywords: ["piriforme", "ciático", "quadril"],
  },
  {
    slug: "femoroacetabular-impingement",
    labelPtBr: "Impacto femoroacetabular (IFA)",
    group: "hip-pelvis",
    blocks: ["deep-hip-flexion", "deep-knee-flexion"],
    searchKeywords: ["ifa", "impacto", "quadril"],
  },
  {
    slug: "athletic-pubalgia",
    labelPtBr: "Pubalgia",
    group: "hip-pelvis",
    blocks: ["explosive-adductors", "high-intra-abdominal-pressure"],
    searchKeywords: ["pubalgia", "virilha", "adutores"],
  },

  // --- Ankle / foot ---
  {
    slug: "ankle-ligament-sprain",
    labelPtBr: "Entorse ligamentar de tornozelo",
    group: "ankle-foot",
    blocks: ["unstable-base", "spatial-travel", "knee-lateral-force"],
    searchKeywords: ["entorse", "tornozelo", "ligamento"],
  },
  {
    slug: "plantar-fasciitis",
    labelPtBr: "Fascite plantar / esporão de calcâneo",
    group: "ankle-foot",
    blocks: ["forefoot-impact", "lower-body-plyometrics", "high-impact"],
    searchKeywords: ["fascite", "esporão", "pé", "calcâneo"],
  },

  // --- Shoulder ---
  {
    slug: "rotator-cuff-injury",
    labelPtBr: "Lesão do manguito rotador",
    group: "shoulder",
    blocks: ["overhead-press", "lateral-raise-above-90"],
    searchKeywords: ["manguito", "ombro", "supraespinal"],
  },
  {
    slug: "subacromial-bursitis",
    labelPtBr: "Bursite subacromial / síndrome do impacto",
    group: "shoulder",
    blocks: ["overhead-press", "lateral-raise-above-90"],
    searchKeywords: ["bursite", "impacto", "ombro"],
  },
  {
    slug: "slap-tear",
    labelPtBr: "Lesão SLAP (labrum glenoidal)",
    group: "shoulder",
    blocks: ["hanging-traction"],
    searchKeywords: ["slap", "labrum", "ombro"],
  },
  {
    slug: "shoulder-instability",
    labelPtBr: "Instabilidade ou luxação recidivante do ombro",
    group: "shoulder",
    blocks: ["wide-arm-tension", "bilateral-push-up"],
    searchKeywords: ["luxação", "ombro", "instabilidade"],
  },
  {
    slug: "ac-joint-injury",
    labelPtBr: "Lesão da articulação acromioclavicular",
    group: "shoulder",
    blocks: ["cross-body-load", "floor-push"],
    searchKeywords: ["acromioclavicular", "ac", "ombro"],
  },

  // --- Elbow / wrist / hand ---
  {
    slug: "epicondylitis",
    labelPtBr: "Epicondilite (cotovelo de tenista ou de golfista)",
    group: "elbow-wrist-hand",
    blocks: ["prolonged-grip"],
    searchKeywords: ["tenista", "golfista", "cotovelo", "epicondilite"],
  },
  {
    slug: "elbow-ucl-injury",
    labelPtBr: "Lesão do ligamento colateral ulnar (UCL)",
    group: "elbow-wrist-hand",
    blocks: ["elbow-valgus-load", "wide-arm-tension"],
    searchKeywords: ["ucl", "cotovelo", "ulnar"],
  },
  {
    slug: "olecranon-bursitis",
    labelPtBr: "Bursite olecraniana",
    group: "elbow-wrist-hand",
    blocks: ["forearm-plank-hard"],
    searchKeywords: ["olecrânio", "cotovelo", "bursite"],
  },
  {
    slug: "carpal-tunnel-de-quervain",
    labelPtBr: "Túnel do carpo / tendinite de De Quervain",
    group: "elbow-wrist-hand",
    blocks: ["wrist-extension-load", "floor-push"],
    searchKeywords: ["túnel do carpo", "quervain", "punho"],
  },
  {
    slug: "tfcc-injury",
    labelPtBr: "Lesão do TFCC (punho)",
    group: "elbow-wrist-hand",
    blocks: ["wrist-extension-load"],
    searchKeywords: ["tfcc", "punho"],
  },

  // --- Spine / core ---
  {
    slug: "disc-herniation",
    labelPtBr: "Hérnia de disco (cervical, torácica ou lombar)",
    group: "spine-core",
    blocks: [
      "spine-flexion-rotation",
      "high-impact",
      "axial-load",
      "lumbar-impact",
    ],
    searchKeywords: ["hérnia", "hernia", "disco", "lombar", "cervical"],
  },
  {
    slug: "spondylolisthesis",
    labelPtBr: "Espondilolistese",
    group: "spine-core",
    blocks: ["spine-hyperextension", "axial-load"],
    searchKeywords: ["coluna", "espondilo"],
  },
  {
    slug: "spinal-stenosis",
    labelPtBr: "Estenose espinhal",
    group: "spine-core",
    blocks: ["spine-hyperextension"],
    searchKeywords: ["estenose", "coluna"],
  },
  {
    slug: "diastasis-recti",
    labelPtBr: "Diástase abdominal",
    group: "spine-core",
    blocks: ["high-intra-abdominal-pressure"],
    searchKeywords: ["diástase", "abdômen", "pós-parto"],
  },

  // --- Systemic ---
  {
    slug: "osteoporosis-osteopenia",
    labelPtBr: "Osteoporose / osteopenia",
    group: "systemic",
    blocks: ["lower-body-plyometrics", "high-impact", "spine-flexion-rotation"],
    searchKeywords: ["osso", "osteoporose", "osteopenia"],
  },
  {
    slug: "rheumatoid-arthritis",
    labelPtBr: "Artrite reumatoide",
    group: "systemic",
    blocks: ["high-impact", "wrist-extension-load", "prolonged-grip"],
    searchKeywords: ["artrite", "reumatoide"],
  },
  {
    slug: "chronic-muscle-strain",
    labelPtBr: "Estiramento crônico (isquiotibiais, panturrilha ou adutores)",
    group: "systemic",
    blocks: ["max-range-stretch", "high-speed"],
    searchKeywords: ["estiramento", "isquiotibiais", "panturrilha", "adutores"],
  },
  {
    slug: "hypertension",
    labelPtBr: "Hipertensão",
    group: "systemic",
    blocks: ["high-intensity", "inversion"],
    searchKeywords: ["pressão alta", "hipertensão"],
  },
  {
    slug: "labyrinthitis",
    labelPtBr: "Labirintite",
    group: "systemic",
    blocks: ["spin", "inversion"],
    searchKeywords: ["labirintite", "tontura", "equilíbrio"],
  },
];

export const CLINICAL_CONDITION_SLUGS = CLINICAL_CONDITIONS.map(
  (item) => item.slug,
);

export function getClinicalCondition(
  slug: string,
): ClinicalConditionDef | undefined {
  return CLINICAL_CONDITIONS.find((item) => item.slug === slug);
}

export function conditionsByGroup(): Record<
  ClinicalGroupId,
  ClinicalConditionDef[]
> {
  const result = Object.fromEntries(
    CLINICAL_GROUP_IDS.map((id) => [id, [] as ClinicalConditionDef[]]),
  ) as Record<ClinicalGroupId, ClinicalConditionDef[]>;

  for (const condition of CLINICAL_CONDITIONS) {
    result[condition.group].push(condition);
  }
  return result;
}

/** Maps legacy / mobility-derived slugs onto catalog entries. */
export function normalizeClinicalConditionSlug(slug: string): string {
  if (slug === "hernia") {
    return "disc-herniation";
  }
  if (slug === "wheelchair-user") {
    return "spinal-cord-injury-paraplegia";
  }
  return slug;
}

export function isKnownClinicalConditionSlug(slug: string): boolean {
  return CLINICAL_CONDITION_SLUGS.includes(
    normalizeClinicalConditionSlug(slug),
  );
}

export function filterClinicalConditionSlugs(slugs: string[]): string[] {
  const unique = new Set<string>();
  for (const slug of slugs) {
    const normalized = normalizeClinicalConditionSlug(slug);
    if (CLINICAL_CONDITION_SLUGS.includes(normalized)) {
      unique.add(normalized);
    }
  }
  return Array.from(unique);
}

export function searchClinicalConditions(
  query: string,
): ClinicalConditionDef[] {
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  if (!normalized) {
    return CLINICAL_CONDITIONS;
  }
  const slugQuery = normalized.replace(/\s+/g, "-");
  return CLINICAL_CONDITIONS.filter((item) => {
    if (item.labelPtBr.toLocaleLowerCase("pt-BR").includes(normalized)) {
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
