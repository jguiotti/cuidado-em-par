/**
 * Full exercise library seed — owned clinically by Educador Físico.
 * Slugs English; titles/descriptions pt-BR.
 * Equipment/intensity/contraindications drive list_safe_exercises + tag_block_rules.
 */

export interface SeedExercise {
  slug: string;
  title: string;
  description: string;
  targetMuscles: string[];
  equipmentTags: string[];
  requiredCapabilityTags: string[];
  intensityTags: string[];
  contraindicationTags: string[];
  isPublished: boolean;
}

function ex(
  partial: SeedExercise,
): SeedExercise {
  return partial;
}

/** Shared contraindication bundles (Educador). */
const KNEE_IMPACT = [
  "torn-acl",
  "torn-pcl",
  "patellar-tendinopathy",
  "knee-osteoarthritis",
  "chondromalacia",
];
const KNEE_DEEP = [
  "chondromalacia",
  "torn-pcl",
  "knee-osteoarthritis",
  "femoroacetabular-impingement",
];
const KNEE_LATERAL = [
  "collateral-ligament-injury",
  "torn-acl",
  "ankle-ligament-sprain",
];
const SPINE_FLEX_ROT = ["disc-herniation", "hernia", "spondylolisthesis"];
const SPINE_HYPER = ["spondylolisthesis", "spinal-stenosis", "disc-herniation"];
const SHOULDER_OVERHEAD = [
  "rotator-cuff-injury",
  "subacromial-bursitis",
  "shoulder-instability",
];
const SHOULDER_WIDE = [
  "shoulder-instability",
  "slap-tear",
  "ac-joint-injury",
];
const WRIST_LOAD = [
  "carpal-tunnel-de-quervain",
  "tfcc-injury",
  "rheumatoid-arthritis",
];
const CORE_PRESSURE = ["diastasis-recti", "athletic-pubalgia"];
const PLYO = [
  "torn-acl",
  "patellar-tendinopathy",
  "knee-osteoarthritis",
  "plantar-fasciitis",
  "osteoporosis-osteopenia",
  "pregnancy-trimester-2",
  "pregnancy-trimester-3",
  "labyrinthitis",
  "hemiplegia-hemiparesis",
  "cerebral-palsy-mild-moderate",
  "visual-impairment",
];
const PREGNANCY_PRONE = [
  "pregnancy-trimester-2",
  "pregnancy-trimester-3",
];
const HYPERTENSION_ISO = ["hypertension"];
const UNILATERAL_KNEE = ["knee-osteoarthritis", "lower-limb-amputation-unilateral"];

export const EXERCISE_SEED_CATALOG: SeedExercise[] = [
  // --- Lower body ---
  ex({
    slug: "bodyweight-squat",
    title: "Agachamento tradicional",
    description:
      "Pés na largura dos ombros. Desça o quadril como se fosse sentar, mantendo o peito aberto, e suba com controle. Amplitude confortável.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["low-intensity", "deep-knee-flexion"],
    contraindicationTags: [...KNEE_DEEP],
    isPublished: true,
  }),
  ex({
    slug: "sumo-squat",
    title: "Agachamento sumô",
    description:
      "Pés mais abertos e pontas levemente para fora. Desça o quadril e suba. Pode segurar uma garrafa ou mochila no peito.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight", "bottle", "backpack"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["low-intensity", "deep-knee-flexion", "knee-lateral-force"],
    contraindicationTags: [...KNEE_DEEP, ...KNEE_LATERAL, "chronic-muscle-strain"],
    isPublished: true,
  }),
  ex({
    slug: "isometric-squat",
    title: "Agachamento isométrico",
    description:
      "Desça até uma altura confortável e mantenha a posição sem se mover. Respire sem prender o ar. Saia da posição se houver tontura.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["low-intensity", "deep-knee-flexion"],
    contraindicationTags: [...KNEE_DEEP, ...HYPERTENSION_ISO],
    isPublished: true,
  }),
  ex({
    slug: "assisted-pistol-squat",
    title: "Agachamento unilateral assistido (pistol)",
    description:
      "Apoie-se em um cabo de vassoura ou cadeira. Desça em uma perna com a outra à frente, só até onde houver controle. Sem forçar o joelho.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight", "broomstick", "chair"],
    requiredCapabilityTags: ["standing", "unilateral"],
    intensityTags: ["medium-intensity", "deep-knee-flexion", "unilateral-full-load"],
    contraindicationTags: [...KNEE_DEEP, ...UNILATERAL_KNEE, ...KNEE_IMPACT],
    isPublished: true,
  }),
  ex({
    slug: "cossack-squat",
    title: "Agachamento cossaco",
    description:
      "Em postura ampla, desça o peso para um lado flexionando um joelho e mantendo a outra perna mais estendida. Troque de lado com calma.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["medium-intensity", "deep-knee-flexion", "knee-lateral-force", "deep-hip-flexion"],
    contraindicationTags: [...KNEE_LATERAL, ...KNEE_DEEP, "piriformis-syndrome", "femoroacetabular-impingement"],
    isPublished: true,
  }),
  ex({
    slug: "shrimp-squat",
    title: "Agachamento camarão",
    description:
      "Segure um pé atrás do corpo e desça o joelho de trás em direção ao solo, com apoio se precisar. Movimento avançado — use assistência.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight", "chair"],
    requiredCapabilityTags: ["standing", "unilateral"],
    intensityTags: ["high-intensity", "deep-knee-flexion", "unilateral-full-load"],
    contraindicationTags: [...KNEE_DEEP, ...KNEE_IMPACT, ...UNILATERAL_KNEE],
    isPublished: true,
  }),
  ex({
    slug: "sissy-squat",
    title: "Agachamento sissy",
    description:
      "Incline o tronco para trás enquanto flexiona os joelhos, mantendo quadril avançado. Amplitude curta e controlada. Alto estresse no joelho.",
    targetMuscles: ["legs"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["high-intensity", "deep-knee-flexion"],
    contraindicationTags: [...KNEE_DEEP, "chondromalacia", "patellar-tendinopathy", "torn-acl"],
    isPublished: true,
  }),
  ex({
    slug: "frog-squat",
    title: "Agachamento sapo",
    description:
      "Pés abertos, desça o quadril e apoie os cotovelos nas coxas se quiser. Suba empurrando o chão. Mantenha a coluna confortável.",
    targetMuscles: ["legs", "glutes", "core"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["low-intensity", "deep-knee-flexion", "deep-hip-flexion"],
    contraindicationTags: [...KNEE_DEEP, "femoroacetabular-impingement"],
    isPublished: true,
  }),
  ex({
    slug: "pulse-squat",
    title: "Agachamento com insistência (pulsos)",
    description:
      "Desça até a metade do agachamento e faça pequenos movimentos de sobe-desce sem estender totalmente. Pode usar elástico.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight", "resistance-band"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["medium-intensity", "deep-knee-flexion"],
    contraindicationTags: [...KNEE_DEEP],
    isPublished: true,
  }),
  ex({
    slug: "jump-squat",
    title: "Agachamento com salto",
    description:
      "Agache e estenda as pernas em um salto suave, aterrissando com joelhos flexionados. Evite se houver dor ou instabilidade.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["high-intensity", "high-impact", "lower-body-plyometrics"],
    contraindicationTags: [...PLYO],
    isPublished: true,
  }),
  ex({
    slug: "pop-squat",
    title: "Agachamento abre e fecha (pop squat)",
    description:
      "Salte abrindo e fechando as pernas entre as descidas. Movimento rápido — priorize controle na aterrissagem.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: [
      "high-intensity",
      "high-impact",
      "lower-body-plyometrics",
      "knee-lateral-force",
      "spatial-travel",
    ],
    contraindicationTags: [...PLYO, ...KNEE_LATERAL],
    isPublished: true,
  }),
  ex({
    slug: "goblet-squat",
    title: "Agachamento cálice (goblet squat)",
    description:
      "Segure um garrafão ou pacote junto ao peito e agache. O peso à frente ajuda a postura. Amplitude confortável.",
    targetMuscles: ["legs", "glutes", "core"],
    equipmentTags: ["bottle", "food-bag", "bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["low-intensity", "deep-knee-flexion"],
    contraindicationTags: [...KNEE_DEEP],
    isPublished: true,
  }),
  ex({
    slug: "backpack-squat",
    title: "Agachamento lastreado",
    description:
      "Use uma mochila preenchida nas costas ou no peito e execute o agachamento tradicional com controle.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["backpack", "bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["medium-intensity", "deep-knee-flexion", "axial-load"],
    contraindicationTags: [...KNEE_DEEP, ...SPINE_FLEX_ROT, "osteoporosis-osteopenia"],
    isPublished: true,
  }),
  ex({
    slug: "unstable-squat",
    title: "Agachamento instável",
    description:
      "Agache descalço sobre uma almofada firme, com apoio próximo se precisar. Priorize equilíbrio, não profundidade.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["cushion", "bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["low-intensity", "unstable-base", "deep-knee-flexion"],
    contraindicationTags: [
      ...KNEE_DEEP,
      "ankle-ligament-sprain",
      "labyrinthitis",
      "visual-impairment",
    ],
    isPublished: true,
  }),
  ex({
    slug: "bulgarian-split-squat",
    title: "Agachamento búlgaro",
    description:
      "Apoie o peito do pé de trás em uma cadeira e desça o joelho da frente. Tronco ereto, movimento lento.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["chair", "bodyweight"],
    requiredCapabilityTags: ["standing", "unilateral"],
    intensityTags: ["medium-intensity", "deep-knee-flexion", "unilateral-full-load", "tibial-posterior-load"],
    contraindicationTags: [...KNEE_DEEP, ...UNILATERAL_KNEE, "torn-pcl"],
    isPublished: true,
  }),
  ex({
    slug: "band-squat",
    title: "Agachamento com super band",
    description:
      "Pise sobre um elástico longo e segure as pontas nos ombros ou mãos. Agache contra a resistência.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["resistance-band", "bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["medium-intensity", "deep-knee-flexion"],
    contraindicationTags: [...KNEE_DEEP],
    isPublished: true,
  }),
  ex({
    slug: "forward-lunge",
    title: "Afundo tradicional",
    description:
      "Dê um passo à frente e desça o joelho de trás em direção ao solo. Empurre para voltar. Pode usar garrafas.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight", "bottle"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["medium-intensity", "deep-knee-flexion", "spatial-travel"],
    contraindicationTags: [...KNEE_DEEP, ...KNEE_IMPACT, "visual-impairment"],
    isPublished: true,
  }),
  ex({
    slug: "reverse-lunge",
    title: "Afundo reverso",
    description:
      "Dê um passo para trás e desça o joelho de trás com controle. Volte à posição inicial sem balançar o tronco.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["medium-intensity", "deep-knee-flexion", "tibial-posterior-load"],
    contraindicationTags: [...KNEE_DEEP, "torn-pcl"],
    isPublished: true,
  }),
  ex({
    slug: "lateral-lunge",
    title: "Afundo lateral",
    description:
      "Dê um passo para o lado e sente o quadril sobre a perna que avançou, mantendo a outra mais estendida.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["medium-intensity", "knee-lateral-force", "deep-hip-flexion", "spatial-travel"],
    contraindicationTags: [...KNEE_LATERAL, "femoroacetabular-impingement"],
    isPublished: true,
  }),
  ex({
    slug: "pendulum-lunge",
    title: "Afundo pendular",
    description:
      "Alterne afundo à frente e atrás com a mesma perna, como um pêndulo, sem pausa longa no meio.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["medium-intensity", "deep-knee-flexion", "high-speed", "spatial-travel"],
    contraindicationTags: [...KNEE_IMPACT, "labyrinthitis", "hemiplegia-hemiparesis"],
    isPublished: true,
  }),
  ex({
    slug: "pulse-lunge",
    title: "Afundo com insistência",
    description:
      "Fique na posição de afundo e faça pequenos pulsos sem estender totalmente as pernas.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["medium-intensity", "deep-knee-flexion"],
    contraindicationTags: [...KNEE_DEEP],
    isPublished: true,
  }),
  ex({
    slug: "jumping-lunge",
    title: "Afundo com salto",
    description:
      "Alterne as pernas com um salto entre os afundos. Aterrise macio. Evite se houver dor no joelho ou tornozelo.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["high-intensity", "high-impact", "lower-body-plyometrics", "spatial-travel"],
    contraindicationTags: [...PLYO],
    isPublished: true,
  }),
  ex({
    slug: "walking-lunge",
    title: "Passada (caminhada em afundo)",
    description:
      "Avance o espaço fazendo afundos sucessivos. Passos curtos e estáveis. Pode carregar garrafas.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight", "bottle"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["medium-intensity", "deep-knee-flexion", "spatial-travel"],
    contraindicationTags: [...KNEE_DEEP, "visual-impairment", "labyrinthitis"],
    isPublished: true,
  }),
  ex({
    slug: "curtsy-lunge",
    title: "Avanço cruzado (curtsy lunge)",
    description:
      "Leve uma perna para trás cruzando atrás da outra e desça o joelho com controle. Volte sem torcer o joelho da frente.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["medium-intensity", "knee-lateral-force", "deep-hip-flexion", "rotational-instability"],
    contraindicationTags: [...KNEE_LATERAL, "torn-acl", "piriformis-syndrome"],
    isPublished: true,
  }),
  ex({
    slug: "glute-bridge",
    title: "Elevação pélvica (ponte)",
    description:
      "Deite de costas, joelhos flexionados. Eleve o quadril alinhando ombros e joelhos. Pode usar elástico ou pacote no quadril.",
    targetMuscles: ["glutes", "core"],
    equipmentTags: ["bodyweight", "resistance-band", "food-bag"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity"],
    contraindicationTags: [],
    isPublished: true,
  }),
  ex({
    slug: "single-leg-glute-bridge",
    title: "Elevação pélvica unilateral",
    description:
      "Na ponte, estenda uma perna e eleve o quadril com a outra. Troque os lados. Amplitude controlada.",
    targetMuscles: ["glutes", "core"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "unilateral", "low-impact"],
    intensityTags: ["medium-intensity", "unilateral-full-load"],
    contraindicationTags: [...UNILATERAL_KNEE],
    isPublished: true,
  }),
  ex({
    slug: "feet-elevated-glute-bridge",
    title: "Elevação pélvica com amplitude",
    description:
      "Apoie os pés em uma cadeira e eleve o quadril. Evite arquear demais a lombar.",
    targetMuscles: ["glutes", "legs", "core"],
    equipmentTags: ["chair", "bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["medium-intensity"],
    contraindicationTags: [...SPINE_HYPER],
    isPublished: true,
  }),
  ex({
    slug: "frog-pump",
    title: "Bomba de sapo (frog pump)",
    description:
      "Deite de costas com as solas dos pés juntas e joelhos abertos. Eleve o quadril em impulsos curtos.",
    targetMuscles: ["glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity", "deep-hip-flexion"],
    contraindicationTags: ["piriformis-syndrome", "femoroacetabular-impingement", "trochanteric-bursitis"],
    isPublished: true,
  }),
  ex({
    slug: "stiff-deadlift",
    title: "Stiff / levantamento terra",
    description:
      "Com elástico ou garrafas, incline o tronco com joelhos levemente flexionados e coluna neutra. Suba empurrando o chão com os calcanhares.",
    targetMuscles: ["glutes", "legs", "back"],
    equipmentTags: ["resistance-band", "bottle", "bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["medium-intensity", "max-range-stretch", "axial-load"],
    contraindicationTags: [...SPINE_FLEX_ROT, "chronic-muscle-strain", "osteoporosis-osteopenia"],
    isPublished: true,
  }),
  ex({
    slug: "sliding-leg-curl",
    title: "Mesa flexora deslizante",
    description:
      "Deite de costas com os calcanhares sobre uma toalha em piso liso. Eleve o quadril e deslize os pés para longe e de volta.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["towel", "bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["medium-intensity"],
    contraindicationTags: ["chronic-muscle-strain"],
    isPublished: true,
  }),
  ex({
    slug: "standing-hamstring-curl",
    title: "Flexão de perna em pé (isquiotibiais)",
    description:
      "Ancore um elástico e flexione o joelho trazendo o calcanhar ao glúteo. Controle a volta.",
    targetMuscles: ["legs"],
    equipmentTags: ["resistance-band"],
    requiredCapabilityTags: ["standing", "unilateral", "low-impact"],
    intensityTags: ["low-intensity"],
    contraindicationTags: ["chronic-muscle-strain"],
    isPublished: true,
  }),
  ex({
    slug: "quadruped-hip-extension",
    title: "Extensão de quadril (coice) em quatro apoios",
    description:
      "Em quatro apoios, estenda uma perna para trás sem arquear a lombar. Pode usar elástico. Apoie os punhos de forma neutra se houver desconforto.",
    targetMuscles: ["glutes"],
    equipmentTags: ["bodyweight", "resistance-band"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity", "wrist-extension-load"],
    contraindicationTags: [...PREGNANCY_PRONE, ...WRIST_LOAD],
    isPublished: true,
  }),
  ex({
    slug: "fire-hydrant",
    title: "Abdução de quadril em quatro apoios (fire hydrant)",
    description:
      "Em quatro apoios, eleve o joelho para o lado mantendo o quadril estável. Evite girar demais a coluna.",
    targetMuscles: ["glutes"],
    equipmentTags: ["bodyweight", "resistance-band"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity", "side-lying-pressure", "wrist-extension-load"],
    contraindicationTags: [
      "trochanteric-bursitis",
      "piriformis-syndrome",
      ...PREGNANCY_PRONE,
      ...WRIST_LOAD,
    ],
    isPublished: true,
  }),
  ex({
    slug: "standing-hip-abduction",
    title: "Abdução de quadril em pé",
    description:
      "Em pé, com elástico nos tornozelos ou coxas, afaste uma perna para o lado sem inclinar o tronco.",
    targetMuscles: ["glutes"],
    equipmentTags: ["resistance-band", "bodyweight"],
    requiredCapabilityTags: ["standing", "unilateral", "low-impact"],
    intensityTags: ["low-intensity"],
    contraindicationTags: ["trochanteric-bursitis"],
    isPublished: true,
  }),
  ex({
    slug: "clamshell",
    title: "Ostra (clamshells)",
    description:
      "Deite de lado com joelhos flexionados e abra o joelho de cima mantendo os pés juntos. Use colchão macio sob o quadril.",
    targetMuscles: ["glutes"],
    equipmentTags: ["bodyweight", "resistance-band", "cushion"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity", "side-lying-pressure"],
    contraindicationTags: ["trochanteric-bursitis", "piriformis-syndrome"],
    isPublished: true,
  }),
  ex({
    slug: "monster-walk",
    title: "Caminhada lateral (monster walk)",
    description:
      "Com elástico nas pernas, caminhe lateralmente em semi-agachamento. Passos curtos e controlados.",
    targetMuscles: ["glutes", "legs"],
    equipmentTags: ["resistance-band"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["medium-intensity", "knee-lateral-force", "spatial-travel"],
    contraindicationTags: [...KNEE_LATERAL, "visual-impairment"],
    isPublished: true,
  }),
  ex({
    slug: "good-morning",
    title: "Bom dia (good morning)",
    description:
      "Com cabo de vassoura nas costas, incline o tronco à frente mantendo a coluna neutra e joelhos levemente flexionados.",
    targetMuscles: ["back", "glutes", "legs"],
    equipmentTags: ["broomstick", "bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["low-intensity", "axial-load", "max-range-stretch"],
    contraindicationTags: [...SPINE_FLEX_ROT, "osteoporosis-osteopenia"],
    isPublished: true,
  }),
  ex({
    slug: "wall-sit",
    title: "Cadeirinha isométrica (wall sit)",
    description:
      "Encoste as costas na parede e desça até um ângulo confortável de joelhos. Segure por poucos segundos e suba.",
    targetMuscles: ["legs"],
    equipmentTags: ["wall", "bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["low-intensity", "deep-knee-flexion"],
    contraindicationTags: [...KNEE_DEEP, ...HYPERTENSION_ISO],
    isPublished: true,
  }),
  ex({
    slug: "duck-walk",
    title: "Caminhada do pato",
    description:
      "Em agachamento baixo, caminhe para frente com passos curtos. Só use se a amplitude for confortável.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["high-intensity", "deep-knee-flexion", "spatial-travel"],
    contraindicationTags: [...KNEE_DEEP, "visual-impairment", ...PLYO.filter((t) => t.includes("pregnancy") || t === "labyrinthitis")],
    isPublished: true,
  }),
  ex({
    slug: "step-up",
    title: "Subida no banco (step-up)",
    description:
      "Suba em uma cadeira estável com uma perna e desça com controle. Pode usar mochila. Confira se a cadeira aguenta o peso.",
    targetMuscles: ["legs", "glutes"],
    equipmentTags: ["chair", "backpack", "bodyweight"],
    requiredCapabilityTags: ["standing", "unilateral"],
    intensityTags: ["medium-intensity", "unilateral-full-load"],
    contraindicationTags: [...UNILATERAL_KNEE, ...KNEE_IMPACT, "pregnancy-trimester-3"],
    isPublished: true,
  }),
  ex({
    slug: "standing-calf-raise",
    title: "Elevação de panturrilha em pé",
    description:
      "Suba na ponta dos pés e desça com controle. Pode usar mochila ou garrafas. Sem salto.",
    targetMuscles: ["legs"],
    equipmentTags: ["bodyweight", "backpack", "bottle"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["low-intensity", "forefoot-impact"],
    contraindicationTags: ["plantar-fasciitis", "ankle-ligament-sprain"],
    isPublished: true,
  }),
  ex({
    slug: "single-leg-calf-raise",
    title: "Elevação de panturrilha unilateral",
    description:
      "Apoie-se se precisar e eleve o corpo na ponta de um pé. Troque os lados.",
    targetMuscles: ["legs"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing", "unilateral", "low-impact"],
    intensityTags: ["low-intensity", "forefoot-impact", "unilateral-full-load"],
    contraindicationTags: ["plantar-fasciitis", "ankle-ligament-sprain"],
    isPublished: true,
  }),
  ex({
    slug: "pulse-calf-raise",
    title: "Elevação de panturrilha com insistência",
    description:
      "Na ponta dos pés, faça pequenos pulsos sem apoiar todo o pé no chão.",
    targetMuscles: ["legs"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["medium-intensity", "forefoot-impact"],
    contraindicationTags: ["plantar-fasciitis"],
    isPublished: true,
  }),
  ex({
    slug: "calf-jump",
    title: "Salto de panturrilha",
    description:
      "Pequenos saltos só com a panturrilha, aterrissando macio na ponta dos pés.",
    targetMuscles: ["legs"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["standing"],
    intensityTags: ["high-intensity", "lower-body-plyometrics", "forefoot-impact", "high-impact"],
    contraindicationTags: [...PLYO, "plantar-fasciitis"],
    isPublished: true,
  }),
];

// Remaining catalog parts.
import { EXERCISE_SEED_CATALOG_PART2 } from "./exercise-seed-catalog-part2";
import { EXERCISE_SEED_CATALOG_PART3 } from "./exercise-seed-catalog-part3";

export const EXERCISE_SEED_CATALOG_FULL: SeedExercise[] = [
  ...EXERCISE_SEED_CATALOG,
  ...EXERCISE_SEED_CATALOG_PART2,
  ...EXERCISE_SEED_CATALOG_PART3,
];
